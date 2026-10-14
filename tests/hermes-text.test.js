import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import {
  configuredHermes,
  createHermesText,
} from "../server/services/hermes-text.js";
import { hermesServer } from "./helpers/hermes.js";

const input = () => ({
  assunto: {
    id: randomUUID(),
    titulo: "Frações",
    objetivo: "Interpretar frações",
  },
  prompt: { preferenciasAluno: { estiloVisual: "só texto" } },
});

test("T08: adaptador desativado não consulta outras variáveis; configuração recusa destinos externos", () => {
  assert.equal(
    configuredHermes(
      new Proxy(
        {},
        {
          get: (_, key) => {
            assert.equal(key, "INTEAGIR_HERMES_ENABLED");
            return "false";
          },
        },
      ),
    ),
    null,
  );
  for (const url of [
    "https://example.com",
    "http://localhost:8642",
    "http://127.0.0.1/privado",
    "http://user:pass@127.0.0.1",
    "file:///etc/passwd",
  ])
    assert.throws(
      () =>
        createHermesText({
          url,
          token: "test-only-not-a-real-token",
          model: "modelo-teste",
        }),
      /Configuração local/,
    );
});

test("T08: protocolo HTTP recebe esquema e confirma provedor/modelo/JSON sem antecipar teste real", async (t) => {
  const h = await hermesServer(t);
  assert.equal(h.requests.length, 0);
  assert.equal(h.adapter.status(), "Não verificado");
  const data = input();
  for (let i = 0; i < 2; i++) {
    const result = await h.adapter.generate(data);
    assert.equal(result.doc.assuntoId, data.assunto.id);
    assert.equal(result.doc.objetivo, data.assunto.objetivo);
    assert.equal(result.provider, "openai-codex");
    assert.equal(result.model, h.options.model);
  }
  assert.equal(h.adapter.status(), "Funcionando");
  const payload = h.requests.find((r) => r.payload?.message)?.payload;
  assert.equal(payload.provider, "openai-codex");
  assert.equal(payload.require_model_lock, true);
  assert.equal(JSON.parse(payload.message).esquema.type, "object");
  assert.equal(JSON.stringify(payload).includes(h.options.token), false);
});

test("T08/T15: ferramentas habilitadas impedem inferência; retorno inválido, fallback inesperado e falhas são recusados", async (t) => {
  const h = await hermesServer(t);
  h.control.toolsets = [{ enabled: true, tools: ["terminal"] }];
  await assert.rejects(h.adapter.generate(input()), /sem ferramentas/);
  assert.equal(h.requests.filter((r) => r.payload).length, 0);
  h.control.toolsets = [];
  for (const mutation of [
    () => {
      h.control.provider = "outro";
    },
    () => {
      h.control.model = "modelo-inesperado";
    },
    () => {
      h.control.finish = "length";
    },
    () => {
      h.control.mutate = (d) => d.etapas.pop();
    },
    () => {
      h.control.mutate = (d) => {
        d.assuntoId = "inventado";
      };
    },
    () => {
      h.control.mutate = (d) => {
        d.objetivo = "Objetivo alterado";
      };
    },
    () => {
      h.control.mutate = (d) => {
        d.etapas[0].imagem.arquivo = "../../segredo.png";
      };
    },
    () => {
      h.control.status = 401;
    },
    () => {
      h.control.status = 429;
    },
    () => {
      h.control.status = 500;
    },
  ]) {
    Object.assign(h.control, {
      provider: "openai-codex",
      model: h.options.model,
      finish: "stop",
      mutate: null,
      status: 200,
    });
    mutation();
    await assert.rejects(
      h.adapter.generate(input()),
      (error) =>
        !error.message.includes(h.options.token) &&
        !error.message.includes("raw upstream"),
    );
    assert.equal(h.adapter.status(), "Falha");
  }
});

test("T08: timeout encerra espera sem devolver erro interno do provedor", async (t) => {
  const h = await hermesServer(t);
  const release = Promise.withResolvers();
  h.control.beforeReply = () => release.promise;
  try {
    await assert.rejects(
      createHermesText({ ...h.options, timeoutMs: 100 }).generate(input()),
      /prazo permitido/,
    );
  } finally {
    release.resolve();
  }
});

test("T08/T15: JSON malformado, resposta excessiva e redirecionamento não são aceitos", async (t) => {
  const h = await hermesServer(t);
  h.control.rawResponse = "{invalid";
  await assert.rejects(h.adapter.generate(input()), /resposta válida/);
  h.control.rawResponse = "x".repeat(256 * 1024 + 1);
  await assert.rejects(h.adapter.generate(input()), /limite permitido/);
  h.control.rawResponse = null;
  h.control.redirect = h.options.url + "/redirected";
  const before = h.requests.length;
  await assert.rejects(h.adapter.generate(input()), /resposta válida/);
  assert.equal(h.requests.length, before + 3);
  assert.equal(
    h.requests.some((r) => r.url === "/redirected"),
    false,
  );
});
