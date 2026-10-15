import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { prepareVisualMaterials } from "../server/services/visual-materials.js";

test("T06/T08: três JPEGs comprimidos não inflam para PNG nem ultrapassam artificialmente o limite", async () => {
  const uploadsDir = await mkdtemp(path.join(os.tmpdir(), "inteagir-visual-"));
  let n = 123456;
  const pixels = Buffer.alloc(1200 * 1100 * 3);
  for (let i = 0; i < pixels.length; i += 3) {
    n = (1664525 * n + 1013904223) >>> 0;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = n >>> 24;
  }
  const jpeg = await sharp(pixels, {
    raw: { width: 1200, height: 1100, channels: 3 },
  })
    .jpeg({ quality: 40 })
    .toBuffer();
  const inflated = await sharp(jpeg).png().toBuffer();
  assert.ok(inflated.length < 4 * 1024 * 1024);
  assert.ok(inflated.length * 3 > 6 * 1024 * 1024);
  const materials = [];
  for (let i = 0; i < 3; i++) {
    const id = randomUUID();
    const arquivo = `${id}.jpg`;
    await writeFile(path.join(uploadsDir, arquivo), jpeg);
    materials.push({ id, arquivo, mime: "image/jpeg", assuntoId: null });
  }
  const images = await prepareVisualMaterials({
    materials,
    uploadsDir,
    assuntoId: randomUUID(),
  });
  assert.equal(images.length, 3);
  for (const image of images) {
    assert.equal(image.mime, "image/jpeg");
    assert.match(image.dataURL, /^data:image\/jpeg;base64,/);
    assert.deepEqual(Buffer.from(image.dataURL.split(",")[1], "base64"), jpeg);
  }
});

test("T06/T08: orientação é corrigida; arquivo ausente e quantidade têm erros distintos e sanitizados", async () => {
  const uploadsDir = await mkdtemp(path.join(os.tmpdir(), "inteagir-visual-"));
  const id = randomUUID();
  const arquivo = `${id}.jpg`;
  const original = await sharp({
    create: { width: 80, height: 40, channels: 3, background: "blue" },
  })
    .withMetadata({ orientation: 6 })
    .jpeg()
    .toBuffer();
  await writeFile(path.join(uploadsDir, arquivo), original);
  const m = { id, arquivo, mime: "image/jpeg", assuntoId: null };
  const options = { materials: [m], uploadsDir, assuntoId: randomUUID() };
  const images = await prepareVisualMaterials(options);
  const meta = await sharp(
    Buffer.from(images[0].dataURL.split(",")[1], "base64"),
  ).metadata();
  assert.equal(meta.width, 40);
  assert.equal(meta.height, 80);
  assert.equal(meta.exif, undefined);
  assert.equal(images[0].mime, "image/jpeg");
  await assert.rejects(
    prepareVisualMaterials({
      ...options,
      materials: [{ ...m, arquivo: `${randomUUID()}.jpg` }],
    }),
    (error) => {
      assert.match(error.message, /anexo 1 está ausente, inválido/);
      assert.equal(error.message.includes(uploadsDir), false);
      assert.equal(error.message.includes("6 MB"), false);
      return true;
    },
  );
  await assert.rejects(
    prepareVisualMaterials({ ...options, materials: Array(9).fill(m) }),
    /Há 9 imagens/,
  );
  assert.deepEqual(
    await prepareVisualMaterials({
      ...options,
      materials: [],
      uploadsDir: "diretorio-inexistente",
    }),
    [],
  );
});

test("T06/T08: excesso real de bytes continua bloqueado, com tamanho e limite corretos", async () => {
  const uploadsDir = await mkdtemp(path.join(os.tmpdir(), "inteagir-visual-"));
  let seed = 17;
  const pixels = Buffer.alloc(1200 * 1200 * 3);
  for (let i = 0; i < pixels.length; i++) {
    seed = (1664525 * seed + 1013904223) >>> 0;
    pixels[i] = seed >>> 24;
  }
  const jpeg = await sharp(pixels, {
    raw: { width: 1200, height: 1200, channels: 3 },
  })
    .jpeg({ quality: 95 })
    .toBuffer();
  assert.ok(jpeg.length < 5 * 1024 * 1024);
  assert.ok(jpeg.length * 6 > 6 * 1024 * 1024);
  const materials = [];
  for (let i = 0; i < 6; i++) {
    const id = randomUUID();
    const arquivo = `${id}.jpg`;
    await writeFile(path.join(uploadsDir, arquivo), jpeg);
    materials.push({ id, arquivo, mime: "image/jpeg" });
  }
  await assert.rejects(
    prepareVisualMaterials({ materials, uploadsDir, assuntoId: randomUUID() }),
    /6 anexos de imagem ocupam .*O limite de envio à IA é 6 MB/,
  );
});
