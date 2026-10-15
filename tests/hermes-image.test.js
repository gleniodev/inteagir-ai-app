import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, utimes } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import sharp from "sharp";
import {
  configuredHermesImage,
  readHermesImageArtifact,
} from "../server/services/hermes-image.js";
import { codexEnvironment } from "../scripts/codex-image-local.js";

test("T09: desativado não consulta outras opções; ambiente do cliente oficial exclui credenciais herdadas", () => {
  assert.equal(
    configuredHermesImage(
      new Proxy(
        {},
        {
          get: (_, name) => {
            assert.equal(name, "INTEAGIR_HERMES_IMAGE_ENABLED");
            return "false";
          },
        },
      ),
    ),
    null,
  );
  const env = codexEnvironment();
  assert.equal(
    Object.keys(env).some((name) =>
      /API_KEY|TOKEN|COOKIE|HERMES_HOME/.test(name),
    ),
    false,
  );
  assert.ok(
    env.CODEX_HOME.endsWith(
      process.platform === "win32"
        ? "InTEAgir-Codex-Image-Profile"
        : "codex-image-profile",
    ),
  );
});

test("T09/T15: artefato Hermes precisa de registry/provedor confirmados e PNG recente dentro do cache", async () => {
  // Pixels sintéticos só para o validador, sem OAuth/inferência.
  const profile = await mkdtemp(
    path.join(os.tmpdir(), "inteagir-hermes-image-"),
  );
  const cache = path.join(profile, "cache/generated/images");
  await mkdir(cache, { recursive: true });
  const filename = path.join(cache, "image.png");
  const bytes = await sharp({
    create: { width: 128, height: 96, channels: 3, background: "blue" },
  })
    .png()
    .toBuffer();
  await writeFile(filename, bytes);
  const result = {
    success: true,
    bridge: "hermes-image-registry",
    selected: "inteagir-openai-oauth",
    provider: "openai-codex",
    image: filename,
  };
  const load = (change = {}) =>
    readHermesImageArtifact({
      output: JSON.stringify({ ...result, ...change }),
      profile,
      started: Date.now() - 1000,
    });
  assert.equal((await sharp(await load()).metadata()).format, "png");
  for (const change of [
    { success: false },
    { bridge: "other" },
    { selected: "other" },
    { provider: "other" },
    { image: "https://example.com/image.png" },
    { image: path.join(cache, "missing.png") },
  ])
    await assert.rejects(load(change));
  const outside = path.join(profile, "outside.png");
  await writeFile(outside, bytes);
  await assert.rejects(load({ image: outside }));
  await utimes(filename, new Date(0), new Date(0));
  await assert.rejects(load());
  await writeFile(filename, "not an image");
  await assert.rejects(load());
});
