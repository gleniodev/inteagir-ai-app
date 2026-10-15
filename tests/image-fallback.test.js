import test from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import { createImageFallback } from "../server/services/image-fallback.js";

// Provedores e pixels sintéticos: não provam OAuth ou geração real.
const bytes = await sharp({
  create: { width: 128, height: 96, channels: 3, background: "blue" },
})
  .png()
  .toBuffer();
const input = { pedido: "Quatro vagões iguais, um azul." };
function providers() {
  const calls = [];
  const control = {
    failPrimary: false,
    failFallback: false,
    invalidPrimary: false,
  };
  const adapter = createImageFallback({
    primary: {
      generate: async ({ pedido }) => {
        calls.push(["openai", pedido]);
        if (control.failPrimary) throw new Error("token-private-path");
        return {
          bytes: control.invalidPrimary ? Buffer.from("invalid") : bytes,
          provider: "openai-codex",
        };
      },
    },
    fallback: {
      generate: async ({ pedido }) => {
        calls.push(["nano-banana-2", pedido]);
        if (control.failFallback) throw new Error("token-private-path");
        return { bytes, provider: "google", model: "gemini-3.1-flash-image" };
      },
    },
  });
  return { adapter, control, calls };
}

test("T09/T14: primária primeiro, reserva só após falha, com provedor real e estados separados", async () => {
  const { adapter, control, calls } = providers();
  assert.equal(adapter.status(), "Não verificado");
  assert.equal(adapter.fallbackStatus(), "Não verificado");
  assert.equal((await adapter.generate(input)).fallbackUsado, false);
  assert.deepEqual(calls, [["openai", input.pedido]]);
  assert.equal(adapter.status(), "Funcionando");
  assert.equal(adapter.fallbackStatus(), "Não verificado");
  for (const mode of ["failPrimary", "invalidPrimary"]) {
    control.failPrimary = false;
    control.invalidPrimary = false;
    control[mode] = true;
    calls.length = 0;
    const result = await adapter.generate(input);
    assert.deepEqual(
      calls.map(([name]) => name),
      ["openai", "nano-banana-2"],
    );
    assert.equal(result.fallbackUsado, true);
    assert.equal(result.provider, "google");
    assert.equal(result.model, "gemini-3.1-flash-image");
    assert.equal((await sharp(result.bytes).metadata()).format, "png");
    assert.deepEqual(
      result.tentativas.map((a) => a.resultado),
      ["falha", "sucesso"],
    );
    assert.equal(adapter.status(), "Falha");
    assert.equal(adapter.fallbackStatus(), "Funcionando");
  }
});

test("T09/T15: teste só da reserva, ambas falham sem segredo; ausentes e pedido inválido não simulam imagem", async () => {
  const { adapter, control, calls } = providers();
  await adapter.generate({ ...input, fallbackOnly: true });
  assert.deepEqual(
    calls.map(([name]) => name),
    ["nano-banana-2"],
  );
  assert.equal(adapter.status(), "Não verificado");
  control.failPrimary = control.failFallback = true;
  await assert.rejects(adapter.generate(input), (error) => {
    assert.equal(error.message.includes("token-private-path"), false);
    assert.deepEqual(
      error.tentativas.map((a) => a.resultado),
      ["falha", "falha"],
    );
    return /Nenhum conteúdo incompleto/.test(error.message);
  });
  const absent = createImageFallback();
  assert.equal(absent.status(), "Não configurado");
  assert.equal(absent.fallbackStatus(), "Não configurado");
  await assert.rejects(absent.generate(input), /Nenhum conteúdo incompleto/);
  calls.length = 0;
  await assert.rejects(adapter.generate({ pedido: " " }), /inválido/);
  assert.equal(calls.length, 0);
});

test("T09: provedor inesperado ou modelo reserva não confirmado é recusado", async () => {
  for (const model of [undefined, "gemini-nano-banana-2.1", "desconhecido"]) {
    const adapter = createImageFallback({
      primary: { generate: async () => ({ bytes, provider: "openai-api" }) },
      fallback: {
        generate: async () => ({ bytes, provider: "google", model }),
      },
    });
    await assert.rejects(adapter.generate(input), /Nenhum conteúdo incompleto/);
    assert.equal(adapter.status(), "Falha");
    assert.equal(adapter.fallbackStatus(), "Falha");
  }
});
