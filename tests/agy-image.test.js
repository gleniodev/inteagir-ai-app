import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, utimes } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import {
  configuredAgyImage,
  createAgyImage,
  readAgyImageArtifact,
} from "../server/services/agy-image.js";

test("T09: desativado não lê configuração; perfil inseguro impede iniciar CLI e sanitiza erro", async () => {
  assert.throws(
    () =>
      configuredAgyImage(
        new Proxy(
          {},
          {
            get: (_, key) => {
              assert.equal(key, "INTEAGIR_AGY_IMAGE_ENABLED");
              return "true";
            },
          },
        ),
      ),
    /condições de uso/,
  );
  assert.equal(
    configuredAgyImage(
      new Proxy(
        {},
        {
          get: (_, key) => {
            assert.equal(key, "INTEAGIR_AGY_IMAGE_ENABLED");
            return "false";
          },
        },
      ),
    ),
    null,
  );
  const profile = await mkdtemp(path.join(os.tmpdir(), "inteagir-agy-policy-"));
  await mkdir(path.join(profile, ".gemini/antigravity-cli"), {
    recursive: true,
  });
  await writeFile(
    path.join(profile, ".gemini/antigravity-cli/settings.json"),
    JSON.stringify({ useG1Credits: true }),
  );
  const adapter = createAgyImage({ executable: "must-not-start", profile });
  await assert.rejects(
    adapter.generate({ pedido: "Imagem fictícia" }),
    (e) =>
      e.message.includes("Nenhum conteúdo incompleto") &&
      !e.message.includes(profile),
  );
  assert.equal(adapter.status(), "Falha");
});

test("T09/T15: valida artefato da conversa, decodifica JPG em PNG e recusa arquivo externo, antigo, inválido ou inexistente", async () => {
  // Arquivo sintético apenas para teste do validador, não prova geração de IA.
  const profile = await mkdtemp(
    path.join(os.tmpdir(), "inteagir-agy-artifact-"),
  );
  const id = randomUUID();
  const directory = path.join(profile, ".gemini/antigravity-cli/brain", id);
  await mkdir(directory, { recursive: true });
  const filename = path.join(directory, "image.jpg");
  await sharp({
    create: { width: 128, height: 96, channels: 3, background: "blue" },
  })
    .jpeg()
    .toFile(filename);
  const result = {
    status: "SUCCESS",
    conversation_id: id,
    structured_output: { arquivo: filename },
  };
  const load = () =>
    readAgyImageArtifact({
      profile,
      started: Date.now() - 1000,
      output: JSON.stringify(result),
    });
  const bytes = await load();
  assert.equal((await sharp(bytes).metadata()).format, "png");
  const outside = path.join(profile, "outside.jpg");
  await writeFile(outside, bytes);
  result.structured_output.arquivo = outside;
  await assert.rejects(load());
  result.structured_output.arquivo = path.join(directory, "missing.png");
  await assert.rejects(load());
  result.structured_output.arquivo = filename;
  await utimes(filename, new Date(0), new Date(0));
  await assert.rejects(load());
  await writeFile(filename, "not an image");
  await assert.rejects(load());
  result.status = "ERROR";
  await assert.rejects(load());
});
