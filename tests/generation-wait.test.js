import test from "node:test";
import assert from "node:assert/strict";
import {
  beginGeneration,
  generationSnapshot,
  subscribeGeneration,
} from "../src/services/generation-wait.js";
import { api } from "../src/services/api.js";

test("T08: espera global continua até encerrar todas as gerações, sem bloquear operações comuns", () => {
  const events = [];
  const unsubscribe = subscribeGeneration(() =>
    events.push(generationSnapshot()),
  );
  const endRead = beginGeneration("/alunos");
  assert.equal(generationSnapshot(), "");
  const endPlan = beginGeneration("/aulas/exemplo/planejamento", "POST");
  const endLesson = beginGeneration("/aulas/exemplo/gerar", "POST");
  assert.equal(generationSnapshot(), "Preparando o prompt criativo");
  endPlan();
  assert.equal(generationSnapshot(), "Criando a aula");
  endRead();
  endLesson();
  assert.equal(generationSnapshot(), "");
  assert.equal(events.at(-1), "");
  unsubscribe();
});

test("T08: espera acompanha resposta completa e é removida em sucesso, falha HTTP e falha de rede", async () => {
  const originalFetch = globalThis.fetch;
  try {
    const response = Promise.withResolvers();
    globalThis.fetch = () => response.promise;
    const request = api("/aulas/exemplo/gerar", {
      method: "POST",
      body: { alunoId: "ficticio" },
    });
    assert.equal(generationSnapshot(), "Criando a aula");
    response.resolve(
      new Response(JSON.stringify({ assuntos: [] }), { status: 200 }),
    );
    assert.deepEqual(await request, { assuntos: [] });
    assert.equal(generationSnapshot(), "");
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ erro: "Imagem indisponível" }), {
        status: 503,
      });
    await assert.rejects(
      api("/ia/testar", { method: "POST" }),
      /Imagem indisponível/,
    );
    assert.equal(generationSnapshot(), "");
    globalThis.fetch = async () => {
      throw new Error("network failure");
    };
    await assert.rejects(
      api("/aulas/exemplo/planejamento", { method: "POST" }),
      /Sem conexão/,
    );
    assert.equal(generationSnapshot(), "");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
