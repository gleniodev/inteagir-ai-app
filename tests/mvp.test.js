import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rename, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { createApp } from "../server/app.js";
import { createStore } from "../server/services/store.js";
import { generatedSubject } from "../shared/contracts.js";
import { fractions } from "../fixtures/fractions.js";
import { hermesServer } from "./helpers/hermes.js";
import sharp from "sharp";
import { GenerationError } from "../server/services/hermes-text.js";

test("T07/T10: editar preferências invalida só a prévia do aluno; novas diretrizes invalidam prévias e preservam publicações", async (t) => {
  const h = await hermesServer(t);
  const c = await context(t, { textAdapter: h.adapter });
  const profile = student();
  profile.preferencias.estiloVisual = "só texto";
  await c.role("cadastro");
  const a = (await c.request("/alunos", "POST", profile)).data;
  const b = (
    await c.request("/alunos", "POST", { ...profile, nome: "Aluno A02" })
  ).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  await c.request(
    "/materiais",
    "POST",
    upload(l.id, pdf(), "material.pdf", "application/pdf"),
  );
  const generate = async (alunoId) => {
    const result = await c.request(`/aulas/${l.id}/gerar`, "POST", { alunoId });
    assert.equal(result.status, 200);
    return result.data;
  };
  await generate(a.id);
  const published = await c.request(`/aulas/${l.id}/publicar`, "POST", {
    alunoId: a.id,
    revisao: review,
  });
  assert.equal(published.status, 201);
  await generate(b.id);
  await c.role("cadastro");
  const changed = {
    ...profile,
    preferencias: {
      ...profile.preferencias,
      interesses: ["espaço"],
      texto: "completo",
    },
  };
  assert.equal(
    (await c.request(`/alunos/${a.id}`, "PUT", changed)).status,
    200,
  );
  await c.role("professor");
  assert.equal(
    (await c.request(`/aulas/${l.id}/previa?alunoId=${a.id}`)).status,
    404,
  );
  assert.equal(
    (
      await c.request(`/aulas/${l.id}/publicar`, "POST", {
        alunoId: a.id,
        revisao: review,
      })
    ).status,
    400,
  );
  assert.equal(
    (await c.request(`/aulas/${l.id}/previa?alunoId=${b.id}`)).status,
    200,
  );
  assert.deepEqual(c.store().read().publicacoes, [published.data]);
  await c.role("cadastro");
  // Nome/e-mail não fazem parte do prompt; não desperdiçar uma geração válida.
  await c.request(`/alunos/${b.id}`, "PUT", {
    ...profile,
    nome: "Aluno B fictício",
    email: "b@example.test",
  });
  await c.role("professor");
  assert.equal(
    (await c.request(`/aulas/${l.id}/previa?alunoId=${b.id}`)).status,
    200,
  );
  const regenerated = await generate(a.id);
  assert.equal(regenerated.promptBaseVersion, 1);
  await c.role("psicologo");
  assert.equal(
    (
      await c.request("/diretrizes", "POST", {
        texto:
          "Mantenha precisão conceitual e exemplos claros, sem inferir diagnósticos.",
      })
    ).status,
    201,
  );
  await c.restart();
  await c.role("professor");
  for (const id of [a.id, b.id])
    assert.equal(
      (await c.request(`/aulas/${l.id}/previa?alunoId=${id}`)).status,
      404,
    );
  assert.deepEqual(c.store().read().publicacoes, [published.data]);
  assert.equal((await generate(a.id)).promptBaseVersion, 2);
  const calls = h.requests.filter((r) => r.payload?.message);
  assert.equal(
    JSON.parse(calls.at(-1).payload.message).prompt.preferenciasAluno.texto,
    "completo",
  );
  assert.equal(
    JSON.parse(calls.at(-1).payload.message).prompt.promptBaseVersion,
    2,
  );
});

async function context(t, overrides = {}) {
  const root = await mkdtemp(path.join(os.tmpdir(), "inteagir-test-"));
  const options = {
    dataDir: path.join(root, "data"),
    uploadsDir: path.join(root, "uploads"),
    mediaDir: path.join(root, "media"),
    ...overrides,
  };
  let created = await createApp(options),
    server = created.app.listen(0, "127.0.0.1");
  await once(server, "listening");
  let cookie = "";
  const base = () => `http://127.0.0.1:${server.address().port}/api`;
  const request = async (url, method = "GET", body) => {
    const r = await fetch(base() + url, {
      method,
      headers: {
        cookie,
        ...(body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
      body:
        body instanceof FormData
          ? body
          : body
            ? JSON.stringify(body)
            : undefined,
    });
    return { status: r.status, data: await r.json(), response: r };
  };
  const role = async (papel) => {
    const result = await request("/demo/sessao", "POST", { papel });
    assert.equal(result.status, 200);
    cookie = result.response.headers.get("set-cookie").split(";")[0];
  };
  const close = () =>
    new Promise((resolve, reject) =>
      server.close((e) => (e ? reject(e) : resolve())),
    );
  t.after(close);
  return {
    request,
    role,
    options,
    base,
    headers: () => ({ cookie }),
    store: () => created.store,
    restart: async () => {
      await close();
      created = await createApp(options);
      server = created.app.listen(0, "127.0.0.1");
      await once(server, "listening");
      cookie = "";
    },
  };
}
const student = (nome = "Aluno A01", interest = "trens") => ({
  nome,
  turmaId: "9C",
  responsavelId: "R01",
  email: "",
  ficticio: true,
  preferencias: {
    interesses: [interest],
    estiloVisual: "desenhos",
    explicacao: "ler",
    texto: "curto",
    evitar: ["sons", "movimentos"],
    tipoResposta: "alternativas",
    ajuda: "dica",
    feedback: "mensagem curta",
    progresso: "sim",
    observacoes: "",
  },
});
const lesson = () => ({
  disciplina: "Matemática",
  titulo: "Frações e partes iguais",
  descricao: "Demonstração fictícia",
  turmaId: "9C",
  assuntos: [
    {
      titulo: "Frações",
      descricao: "Numerador e denominador",
      objetivo: "Interpretar frações",
    },
    {
      titulo: "Frações equivalentes",
      descricao: "Mesmo valor",
      objetivo: "Reconhecer frações equivalentes",
    },
  ],
});
const review = {
  conceitos: true,
  imagem: true,
  questoes: true,
  leitura: true,
  preferencias: true,
};

// PDF sintético pesquisável, sem informação pessoal.
function pdf() {
  const content =
    "BT /F1 16 Tf 40 150 Td (Fracoes: partes iguais de um todo.) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let out = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((obj, i) => {
    offsets.push(Buffer.byteLength(out));
    out += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = Buffer.byteLength(out);
  out +=
    "xref\n0 6\n0000000000 65535 f \n" +
    offsets
      .slice(1)
      .map((n) => `${String(n).padStart(10, "0")} 00000 n \n`)
      .join("") +
    `trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n${xref}\n%%EOF`;
  return Buffer.from(out);
}
function upload(aulaId, bytes, name, mime) {
  const f = new FormData();
  f.set("aulaId", aulaId);
  f.set("arquivo", new Blob([bytes], { type: mime }), name);
  return f;
}

test("T03: fila preserva 50 escritas, backup e reinício; JSON corrompido não é apagado", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "inteagir-store-"));
  const store = await createStore(dir);
  await Promise.all(
    Array.from({ length: 50 }, (_, i) =>
      store.update((s) => {
        s.notas.push({ id: i });
        return i;
      }),
    ),
  );
  assert.equal(store.read().notas.length, 50);
  assert.equal((await createStore(dir)).read().notas.length, 50);
  assert.equal(
    JSON.parse(await readFile(path.join(dir, "estado.json.bak"), "utf8")).notas
      .length,
    49,
  );
  await assert.rejects(
    store.update(() => {
      throw Error("abort");
    }),
  );
  assert.equal(store.read().notas.length, 50);
  await writeFile(path.join(dir, "estado.json"), "invalid");
  await assert.rejects(createStore(dir), /inválido/);
  assert.equal(
    await readFile(path.join(dir, "estado.json"), "utf8"),
    "invalid",
  );
});

test("contrato rejeita gabarito, alternativas duplicadas, HTML e contagem inválidos", () => {
  const doc = fractions(
    { id: randomUUID(), titulo: "Frações", objetivo: "Interpretar" },
    "trens",
  );
  assert.ok(generatedSubject.safeParse(doc).success);
  for (const mutate of [
    (d) => d.etapas.pop(),
    (d) => (d.etapas[1].indiceCorreto = 3),
    (d) => (d.etapas[1].alternativas = ["A", "A", "B"]),
    (d) => (d.etapas[0].texto = "<script>alert(1)</script>"),
    (d) => (d.etapas[1].id = d.etapas[0].id),
  ]) {
    const next = structuredClone(doc);
    mutate(next);
    assert.equal(generatedSubject.safeParse(next).success, false);
  }
});

test("fluxo local: cadastro → 2 assuntos → PDF real → contingência → revisão → 6 questões → relatórios → reinício", async (t) => {
  const c = await context(t),
    req = c.request;
  assert.equal((await req("/alunos")).status, 401);
  await c.role("cadastro");
  assert.equal(
    (await req("/alunos", "POST", { ...student(), ficticio: false })).status,
    400,
  );
  const a = (await req("/alunos", "POST", student())).data;
  assert.ok(a.id);
  assert.equal((await req("/alunos?turmaId=8A")).data.length, 0);
  assert.equal(
    (await req("/alunos?turmaId=9C")).data[0].preferencias.interesses[0],
    "trens",
  );
  const b = (await req("/alunos", "POST", student("Aluno A02", "esportes")))
    .data;
  await c.role("professor");
  assert.equal((await req("/alunos/" + a.id, "PUT", student())).status, 403);
  assert.equal(
    (await req("/aulas", "POST", { ...lesson(), assuntos: [] })).status,
    400,
  );
  const l = (await req("/aulas", "POST", lesson())).data;
  assert.equal(l.assuntos.length, 2);
  assert.notEqual(l.assuntos[0].id, l.assuntos[1].id);
  assert.equal(
    (
      await req(
        "/materiais",
        "POST",
        upload(l.id, "fake", "falso.png", "image/png"),
      )
    ).status,
    400,
  );
  const material = await req(
    "/materiais",
    "POST",
    upload(l.id, pdf(), "material.pdf", "application/pdf"),
  );
  assert.equal(material.status, 201);
  assert.equal(material.data.status, "lido");
  assert.equal(material.data.arquivo, undefined);
  const prompt = (await req(`/aulas/${l.id}/prompt?alunoId=${a.id}`)).data;
  assert.equal(prompt.promptBaseVersion, 1);
  assert.ok(
    prompt.informacoesAula.materiais[0].textoNaoConfiavel.includes("Fracoes"),
  );
  assert.equal(JSON.stringify(prompt).includes("Aluno A01"), false);
  assert.equal(JSON.stringify(prompt).includes("email"), false);
  assert.equal(
    (await req(`/aulas/${l.id}/gerar`, "POST", { alunoId: a.id })).status,
    503,
  );
  assert.equal(c.store().read().aulas[0].status, "falha_geracao");
  const generated = (
    await req(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id })
  ).data;
  assert.equal(generated.origem, "Pré-gerado para demonstração");
  assert.equal(generated.assuntos.length, 2);
  assert.equal(generated.assuntos[0].etapas.length, 4);
  const second = (
    await req(`/aulas/${l.id}/exemplo`, "POST", { alunoId: b.id })
  ).data;
  assert.notEqual(
    generated.assuntos[0].etapas[0].texto,
    second.assuntos[0].etapas[0].texto,
  );
  assert.deepEqual(
    generated.assuntos[0].etapas[1].alternativas,
    second.assuntos[0].etapas[1].alternativas,
  );
  assert.equal(
    (
      await req(`/aulas/${l.id}/publicar`, "POST", {
        alunoId: a.id,
        revisao: { ...review, imagem: false },
      })
    ).status,
    400,
  );
  const filename = generated.assuntos[0].etapas[0].imagem.arquivo;
  const localImage = path.join(c.options.mediaDir, ...filename.split("/"));
  await rename(localImage, localImage + ".missing");
  assert.equal(
    (
      await req(`/aulas/${l.id}/publicar`, "POST", {
        alunoId: a.id,
        revisao: review,
      })
    ).status,
    400,
  );
  await rename(localImage + ".missing", localImage);
  const publication = await req(`/aulas/${l.id}/publicar`, "POST", {
    alunoId: a.id,
    revisao: review,
  });
  assert.equal(publication.status, 201);
  assert.equal(
    (
      await req(`/aulas/${l.id}/publicar`, "POST", {
        alunoId: a.id,
        revisao: review,
      })
    ).status,
    409,
  );
  const imageResponse = await fetch(c.base() + "/media/" + filename, {
    headers: c.headers(),
  });
  assert.equal(imageResponse.status, 200);
  assert.equal(imageResponse.headers.get("content-type"), "image/png");
  assert.ok((await imageResponse.arrayBuffer()).byteLength > 1000);
  assert.equal(
    (await req("/media/" + l.id + "/" + a.id + "/bad.txt")).status,
    404,
  );
  await c.role("responsavel");
  const beforeSession = (await req("/relatorios/" + a.id)).data;
  assert.equal(beforeSession.sessoes.length, 0);
  assert.equal(beforeSession.conteudos.length, 1);
  assert.equal(beforeSession.conteudos[0].iniciada, false);
  assert.ok(beforeSession.conteudos[0].resumo.includes("quatro vagões"));
  assert.equal(JSON.stringify(beforeSession).includes("indiceCorreto"), false);
  await c.role("aluno");
  const pubs = (await req("/publicacoes?alunoId=" + a.id)).data;
  assert.equal(pubs.length, 1);
  assert.equal(JSON.stringify(pubs).includes("indiceCorreto"), false);
  let session = (
    await req("/sessoes", "POST", { publicacaoId: publication.data.id })
  ).data;
  assert.equal(JSON.stringify(session).includes("indiceCorreto"), false);
  const event = async (tipo, extra = {}, eventId = randomUUID()) =>
    req(`/sessoes/${session.id}/eventos`, "POST", {
      eventId,
      tipo,
      ...(session.etapa ? { etapaId: session.etapa.chave } : {}),
      ...extra,
    });
  await event("pausar");
  assert.equal((await event("avancar")).status, 409);
  session = (await event("retomar")).data.sessao;
  const duplicateId = randomUUID();
  session = (await event("avancar", {}, duplicateId)).data.sessao;
  assert.equal(session.indice, 1);
  const repeated = (await event("avancar", {}, duplicateId)).data;
  assert.equal(repeated.repetido, true);
  assert.equal(repeated.sessao.revisaoEventos, session.revisaoEventos);
  assert.equal((await event("avancar")).status, 400);
  const helpId = randomUUID();
  await event("dica", {}, helpId);
  await event("dica", {}, helpId);
  let result = (await event("resposta", { alternativa: 1 })).data;
  assert.equal(result.feedback.correta, false);
  session = result.sessao;
  assert.equal(session.respostas[session.etapa.chave].firstTryCorrect, false);
  const correct = (await event("resposta", { alternativa: 0 })).data;
  session = correct.sessao;
  assert.equal(session.respostas[session.etapa.chave].tentativas, 2);
  assert.equal(session.respostas[session.etapa.chave].ultimaAlternativa, 0);
  assert.equal(session.respostas[session.etapa.chave].ajudas, 1);
  session = (await event("avancar")).data.sessao;
  while (!session.concluida) {
    if (session.etapa.tipo === "questao") {
      const doc = generated.assuntos.find(
          (v) => v.titulo === session.etapa.assunto,
        ),
        q = doc.etapas.find((v) => v.id === session.etapa.id);
      const r = await event("resposta", { alternativa: q.indiceCorreto });
      assert.equal(r.status, 200);
      session = r.data.sessao;
    }
    session = (await event("avancar")).data.sessao;
  }
  assert.equal(session.indice, 8);
  assert.equal(Object.keys(session.respostas).length, 6);
  assert.equal(session.concluida, true);
  assert.equal((await event("voltar")).status, 409);
  session = (await event("feedback", { avaliacao: "Gostei" })).data.sessao;
  assert.equal(session.avaliacao, "Gostei");
  await c.role("responsavel");
  assert.equal(
    (
      await req("/observacoes", "POST", {
        alunoId: a.id,
        texto: "A analogia ajudou na demonstração.",
        categoria: "imagem",
      })
    ).status,
    201,
  );
  const r = (await req("/relatorios/" + a.id)).data;
  assert.equal(r.sessoes[0].indice, 8);
  assert.equal(r.observacoes.length, 1);
  assert.equal(r.sessoes[0].avaliacao, "Gostei");
  await c.role("psicologo");
  const pr = (await req("/relatorios/" + a.id)).data;
  assert.deepEqual(pr.sessoes, r.sessoes);
  assert.deepEqual(pr.observacoes, r.observacoes);
  assert.equal(
    (
      await req("/diretrizes", "POST", {
        texto:
          "Diretrizes revisadas: preserve fatos, série e preferências individuais.",
      })
    ).data.versao,
    2,
  );
  assert.equal(
    (await req("/relatorios/" + a.id)).data.sessoes[0].promptBaseVersion,
    1,
  );
  assert.equal(
    (
      await req("/notas", "POST", {
        alunoId: a.id,
        texto: "Nota humana da demonstração.",
      })
    ).status,
    201,
  );
  await c.restart();
  await c.role("cadastro");
  assert.equal(
    (await req("/alunos")).data[0].preferencias.interesses[0],
    "trens",
  );
  await c.role("psicologo");
  const saved = (await req("/relatorios/" + a.id)).data;
  assert.equal(saved.sessoes[0].indice, 8);
  assert.equal(saved.observacoes.length, 1);
  assert.equal(saved.notas.length, 1);
  assert.equal((await req("/diretrizes")).data.length, 2);
});

test("contingência recusa imagem ausente e material sem leitura; provedor nunca finge sucesso", async (t) => {
  const c = await context(t, {
    fixtureImage: path.join(os.tmpdir(), randomUUID() + ".png"),
  });
  await c.role("cadastro");
  const a = (await c.request("/alunos", "POST", student())).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  assert.equal(
    (await c.request(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id }))
      .status,
    400,
  );
  const image = await readFile("fixtures/media/fracao-trem.png");
  const m = (
    await c.request(
      "/materiais",
      "POST",
      upload(l.id, image, "fracao.png", "image/png"),
    )
  ).data;
  assert.equal(m.status, "necessita_revisao");
  assert.equal(
    (await c.request(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id }))
      .status,
    400,
  );
  await c.request("/materiais/" + m.id + "/texto", "PUT", {
    texto: "Quatro partes iguais de um todo; uma selecionada representa 1/4.",
  });
  assert.equal(
    (await c.request(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id }))
      .status,
    503,
  );
  assert.equal(c.store().read().publicacoes.length, 0);
  await c.role("ia");
  assert.equal(
    (await c.request("/ia/testar", "POST", { tipo: "imagem" })).status,
    503,
  );
  const status = (await c.request("/ia/status")).data;
  assert.ok(status.adaptadores.every((v) => v.status !== "Funcionando"));
  assert.equal(status.registros[0].resultado, "falha");
});

test("preferência só texto dispensa mídia e continua validada para publicação", async (t) => {
  const c = await context(t, {
    fixtureImage: path.join(os.tmpdir(), randomUUID() + ".png"),
  });
  await c.role("cadastro");
  const value = student();
  value.preferencias.estiloVisual = "só texto";
  const a = (await c.request("/alunos", "POST", value)).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  const m = (
    await c.request(
      "/materiais",
      "POST",
      upload(l.id, pdf(), "material.pdf", "application/pdf"),
    )
  ).data;
  assert.equal(m.status, "lido");
  const generated = await c.request(`/aulas/${l.id}/exemplo`, "POST", {
    alunoId: a.id,
  });
  assert.equal(generated.status, 200);
  for (const doc of generated.data.assuntos) {
    assert.equal(doc.etapas[0].imagem.necessaria, false);
    assert.equal(doc.etapas[0].imagem.arquivo, null);
  }
  assert.equal(
    (
      await c.request(`/aulas/${l.id}/publicar`, "POST", {
        alunoId: a.id,
        revisao: review,
      })
    ).status,
    201,
  );
});

test("origem inválida, JSON malformado e excesso de solicitações são recusados sem detalhes internos", async (t) => {
  const c = await context(t);
  await c.role("ia");
  const cross = await fetch(c.base() + "/ia/testar", {
    method: "POST",
    headers: {
      ...c.headers(),
      "Content-Type": "application/json",
      origin: "https://untrusted.example",
    },
    body: JSON.stringify({ tipo: "texto" }),
  });
  assert.equal(cross.status, 403);
  const malformed = await fetch(c.base() + "/ia/testar", {
    method: "POST",
    headers: { ...c.headers(), "Content-Type": "application/json" },
    body: "{invalid",
  });
  assert.equal(malformed.status, 400);
  assert.deepEqual(await malformed.json(), { erro: "JSON inválido." });
  for (let i = 0; i < 10; i++)
    assert.equal(
      (await c.request("/ia/testar", "POST", { tipo: "texto" })).status,
      503,
    );
  const limited = await c.request("/ia/testar", "POST", { tipo: "texto" });
  assert.equal(limited.status, 429);
  assert.equal(limited.response.headers.get("cache-control"), "no-store");
  assert.equal(
    limited.response.headers.get("x-content-type-options"),
    "nosniff",
  );
  assert.equal(limited.response.headers.get("retry-after"), "60");
});

test("T06/T15: upload valida conteúdo/tamanho e arquivo perdido retorna erro legível sem caminhos internos", async (t) => {
  const c = await context(t);
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  const image = await readFile("fixtures/media/fracao-trem.png");
  for (const [bytes, name, mime] of [
    [image, "imagem.jpg", "image/jpeg"],
    [image, "imagem.png", "application/pdf"],
    ["falso", "arquivo.pdf", "application/pdf"],
    [Buffer.alloc(5 * 1024 * 1024 + 1), "grande.png", "image/png"],
  ]) {
    const result = await c.request(
      "/materiais",
      "POST",
      upload(l.id, bytes, name, mime),
    );
    assert.equal(result.status, 400);
    assert.equal(c.store().read().materiais.length, 0);
    assert.equal(
      JSON.stringify(result.data).includes(c.options.uploadsDir),
      false,
    );
  }
  const result = await c.request(
    "/materiais",
    "POST",
    upload(l.id, image, "imagem.png", "image/png"),
  );
  assert.equal(result.status, 201);
  const url = c.base() + `/materiais/${result.data.id}/arquivo`;
  const response = await fetch(url, { headers: c.headers() });
  assert.equal(response.status, 200);
  assert.deepEqual(Buffer.from(await response.arrayBuffer()), image);
  const stored = c.store().read().materiais[0];
  const filename = path.join(c.options.uploadsDir, stored.arquivo);
  await rename(filename, filename + ".missing");
  const missing = await c.request(`/materiais/${stored.id}/arquivo`);
  assert.equal(missing.status, 404);
  assert.deepEqual(missing.data, {
    erro: "Material não encontrado. Envie o arquivo novamente.",
  });
  assert.equal(c.store().read().materiais.length, 1);
});

test("T15: áreas não autorizadas não leem materiais privados nem alteram diretrizes", async (t) => {
  const c = await context(t);
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  const m = (
    await c.request(
      "/materiais",
      "POST",
      upload(l.id, pdf(), "material.pdf", "application/pdf"),
    )
  ).data;
  for (const role of ["cadastro", "aluno", "responsavel", "ia"]) {
    await c.role(role);
    for (const url of [
      `/materiais/${m.id}/arquivo`,
      `/aulas/${l.id}/materiais`,
      "/diretrizes",
    ])
      assert.equal((await c.request(url)).status, 403);
    assert.equal(
      (await c.request("/diretrizes", "POST", { texto: "Alteração indevida" }))
        .status,
      403,
    );
  }
  await c.role("psicologo");
  assert.equal((await c.request("/diretrizes")).status, 200);
  assert.equal((await c.request(`/materiais/${m.id}/arquivo`)).status, 403);
  assert.equal(c.store().read().diretrizes.length, 1);
});

test("editar rascunho preserva IDs, vínculo de material e versão já publicada", async (t) => {
  const c = await context(t);
  await c.role("cadastro");
  const a = (await c.request("/alunos", "POST", student())).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  const f = upload(l.id, pdf(), "material.pdf", "application/pdf");
  f.set("assuntoId", l.assuntos[0].id);
  const m = (await c.request("/materiais", "POST", f)).data;
  assert.equal(m.status, "lido");
  const draft = {
    ...lesson(),
    titulo: "Frações — rascunho revisado",
    assuntos: l.assuntos,
  };
  const edit = await c.request("/aulas/" + l.id, "PUT", draft);
  assert.equal(edit.status, 200);
  assert.equal(edit.data.assuntos[0].id, l.assuntos[0].id);
  assert.deepEqual(edit.data.materiais, [m.id]);
  assert.equal(
    (
      await c.request("/aulas/" + l.id, "PUT", {
        ...draft,
        assuntos: [l.assuntos[1]],
      })
    ).status,
    409,
  );
  assert.equal(
    (
      await c.request("/aulas/" + l.id, "PUT", {
        ...draft,
        assuntos: [{ ...l.assuntos[0], id: randomUUID() }, l.assuntos[1]],
      })
    ).status,
    400,
  );
  assert.equal(
    (await c.request(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id }))
      .status,
    200,
  );
  assert.equal(
    (
      await c.request(`/aulas/${l.id}/publicar`, "POST", {
        alunoId: a.id,
        revisao: review,
      })
    ).status,
    201,
  );
  assert.equal(
    (
      await c.request("/aulas/" + l.id, "PUT", {
        ...draft,
        titulo: "Novo rascunho",
      })
    ).status,
    200,
  );
  assert.equal(c.store().read().publicacoes[0].titulo, draft.titulo);
  assert.equal(c.store().read().aulas[0].titulo, "Novo rascunho");
});

test("T07/T10: preparação do exemplo respeita edições anteriores na fila sem misturar versões", async (t) => {
  const c = await context(t);
  await c.role("cadastro");
  const a = (await c.request("/alunos", "POST", student())).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  assert.equal(
    (
      await c.request(
        "/materiais",
        "POST",
        upload(l.id, pdf(), "material.pdf", "application/pdf"),
      )
    ).status,
    201,
  );

  // Uma edição já entrou na fila, mas sua gravação ainda não terminou.
  const editing = Promise.withResolvers();
  const release = Promise.withResolvers();
  const preparing = Promise.withResolvers();
  const store = c.store();
  const update = store.update.bind(store);
  const edit = update(async (s) => {
    editing.resolve();
    await release.promise;
    s.aulas[0].assuntos[0].objetivo = "Objetivo revisado antes da preparação";
    s.alunos[0].preferencias.estiloVisual = "só texto";
    s.diretrizes.push({
      versao: 2,
      texto: "Diretrizes revisadas",
      criadoEm: new Date().toISOString(),
    });
    return null;
  });
  await editing.promise;
  store.update = (fn) => {
    preparing.resolve();
    return update(fn);
  };
  const request = c.request(`/aulas/${l.id}/exemplo`, "POST", {
    alunoId: a.id,
  });
  try {
    await preparing.promise;
  } finally {
    release.resolve();
  }
  await edit;
  const result = await request;
  assert.equal(result.status, 200);
  assert.equal(result.data.promptBaseVersion, 2);
  assert.equal(
    result.data.assuntos[0].objetivo,
    "Objetivo revisado antes da preparação",
  );
  assert.equal(result.data.assuntos[0].etapas[0].imagem.necessaria, false);
  assert.equal(result.data.assuntos[0].etapas[0].imagem.arquivo, null);
});

test("T12: tempo aproximado exclui pausas e ausência de pulsos; retomada e relatórios preservam os registros", async (t) => {
  const c = await context(t);
  await c.role("cadastro");
  const a = (await c.request("/alunos", "POST", student())).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  assert.equal(
    (
      await c.request(
        "/materiais",
        "POST",
        upload(l.id, pdf(), "material.pdf", "application/pdf"),
      )
    ).status,
    201,
  );
  assert.equal(
    (await c.request(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id }))
      .status,
    200,
  );
  const publication = await c.request(`/aulas/${l.id}/publicar`, "POST", {
    alunoId: a.id,
    revisao: review,
  });
  assert.equal(publication.status, 201);
  await c.role("aluno");
  t.mock.timers.enable({ apis: ["Date"], now: Date.now() });
  let session = (
    await c.request("/sessoes", "POST", { publicacaoId: publication.data.id })
  ).data;
  const event = async (tipo, extra = {}) => {
    const result = await c.request(`/sessoes/${session.id}/eventos`, "POST", {
      eventId: randomUUID(),
      tipo,
      ...extra,
    });
    assert.equal(result.status, 200);
    session = result.data.sessao;
    return result;
  };
  t.mock.timers.tick(5000);
  await event("tempo");
  assert.equal(session.tempoVisivelMs, 5000);
  await event("pausar");
  t.mock.timers.tick(60000);
  await event("tempo");
  assert.equal(session.tempoVisivelMs, 5000);
  const paused = await c.request(`/sessoes/${session.id}/eventos`, "POST", {
    eventId: randomUUID(),
    tipo: "avancar",
    etapaId: session.etapa.chave,
  });
  assert.equal(paused.status, 409);
  assert.equal((await c.request(`/sessoes/${session.id}`)).data.pausada, true);
  await c.restart();
  await c.role("aluno");
  const resumed = await c.request("/sessoes", "POST", {
    publicacaoId: publication.data.id,
  });
  assert.equal(resumed.data.id, session.id);
  assert.equal(resumed.data.pausada, true);
  assert.equal(resumed.data.tempoVisivelMs, 5000);
  await event("retomar");
  t.mock.timers.tick(7000);
  await event("tempo");
  assert.equal(session.tempoVisivelMs, 12000);
  t.mock.timers.tick(45000);
  await event("tempo");
  assert.equal(session.tempoVisivelMs, 12000);
  t.mock.timers.tick(2000);
  await event("tempo");
  assert.equal(session.tempoVisivelMs, 14000);
  const invalidFeedback = await c.request(
    `/sessoes/${session.id}/eventos`,
    "POST",
    { eventId: randomUUID(), tipo: "feedback", avaliacao: "Gostei" },
  );
  assert.equal(invalidFeedback.status, 400);
  await c.role("responsavel");
  const report = (await c.request(`/relatorios/${a.id}`)).data;
  assert.equal(report.sessoes[0].tempoVisivelMs, 14000);
  assert.equal(report.sessoes[0].avaliacao, null);
  await c.role("psicologo");
  assert.deepEqual(
    (await c.request(`/relatorios/${a.id}`)).data.sessoes,
    report.sessoes,
  );
});

test("T11/T12: voltar revisita conteúdo sem apagar respostas ou reduzir conclusão; registros antigos continuam compatíveis", async (t) => {
  const c = await context(t);
  await c.role("cadastro");
  const a = (await c.request("/alunos", "POST", student())).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  assert.equal(
    (
      await c.request(
        "/materiais",
        "POST",
        upload(l.id, pdf(), "material.pdf", "application/pdf"),
      )
    ).status,
    201,
  );
  assert.equal(
    (await c.request(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id }))
      .status,
    200,
  );
  const publication = await c.request(`/aulas/${l.id}/publicar`, "POST", {
    alunoId: a.id,
    revisao: review,
  });
  assert.equal(publication.status, 201);
  await c.role("aluno");
  let session = (
    await c.request("/sessoes", "POST", { publicacaoId: publication.data.id })
  ).data;
  async function event(tipo, extra = {}, expected = 200) {
    const result = await c.request(`/sessoes/${session.id}/eventos`, "POST", {
      eventId: randomUUID(),
      tipo,
      etapaId: session.etapa.chave,
      ...extra,
    });
    assert.equal(result.status, expected);
    if (result.data.sessao) session = result.data.sessao;
    return result;
  }
  await event("voltar", {}, 400);
  await event("avancar");
  await event("dica");
  await event("resposta", { alternativa: 1 });
  await event("resposta", { alternativa: 0 });
  const answers = structuredClone(session.respostas);
  await event("avancar");
  assert.equal(session.indice, 2);
  assert.equal(session.etapasConcluidas, 2);

  // Simula uma sessão persistida antes da adição do campo opcional.
  await c.store().update((s) => {
    delete s.sessoes[0].etapasConcluidas;
    return null;
  });
  assert.equal(
    (await c.request(`/sessoes/${session.id}`)).data.etapasConcluidas,
    2,
  );
  const backId = randomUUID();
  await event("voltar", { eventId: backId });
  assert.equal(session.indice, 1);
  assert.equal(session.etapasConcluidas, 2);
  assert.deepEqual(session.respostas, answers);
  const repeated = await event("voltar", { eventId: backId });
  assert.equal(repeated.data.repetido, true);
  assert.equal(session.indice, 1);
  await event("resposta", { alternativa: 0 }, 409);
  await event("pausar");
  await event("voltar", {}, 409);
  await event("retomar");
  await event("voltar");
  assert.equal(session.indice, 0);
  await c.restart();
  await c.role("aluno");
  const saved = (await c.request(`/sessoes/${session.id}`)).data;
  assert.equal(saved.indice, 0);
  assert.equal(saved.etapasConcluidas, 2);
  assert.deepEqual(saved.respostas, answers);
  await c.role("responsavel");
  const report = (await c.request(`/relatorios/${a.id}`)).data;
  assert.equal(report.sessoes[0].indice, 0);
  assert.equal(report.sessoes[0].etapasConcluidas, 2);
  assert.deepEqual(report.sessoes[0].respostas, answers);
  await c.role("psicologo");
  assert.deepEqual(
    (await c.request(`/relatorios/${a.id}`)).data.sessoes,
    report.sessoes,
  );
  await c.role("aluno");
  await event("avancar");
  await event("avancar");
  assert.equal(session.indice, 2);
  assert.equal(session.etapasConcluidas, 2);
  assert.deepEqual(session.respostas, answers);
});

test("T08/T10/T14: fluxo do adaptador via dublê HTTP, sem inferência real; imagem ausente bloqueia publicação", async (t) => {
  const h = await hermesServer(t);
  const c = await context(t, { textAdapter: h.adapter });
  await c.role("cadastro");
  const value = student();
  value.preferencias.estiloVisual = "só texto";
  const a = (await c.request("/alunos", "POST", value)).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  assert.equal(
    (await c.request(`/aulas/${l.id}/gerar`, "POST", { alunoId: a.id })).status,
    400,
  );
  assert.equal(h.requests.length, 0);
  assert.equal(
    (
      await c.request(
        "/materiais",
        "POST",
        upload(l.id, pdf(), "material.pdf", "application/pdf"),
      )
    ).status,
    201,
  );
  const prompt = (await c.request(`/aulas/${l.id}/prompt?alunoId=${a.id}`))
    .data;
  const generated = await c.request(`/aulas/${l.id}/gerar`, "POST", {
    alunoId: a.id,
  });
  assert.equal(generated.status, 200);
  assert.equal(generated.data.assuntos.length, 2);
  assert.equal(generated.data.origem, "Codex OAuth via Hermes (texto)");
  const calls = h.requests.filter((r) => r.payload?.message);
  assert.equal(calls.length, 2);
  assert.deepEqual(JSON.parse(calls[0].payload.message).prompt, prompt);
  assert.equal(JSON.stringify(calls).includes(a.nome), false);
  assert.equal(
    JSON.stringify(calls.map((r) => r.payload)).includes(h.options.token),
    false,
  );
  const published = await c.request(`/aulas/${l.id}/publicar`, "POST", {
    alunoId: a.id,
    revisao: review,
  });
  assert.equal(published.status, 201);
  await c.role("ia");
  const tested = await c.request("/ia/testar", "POST", { tipo: "texto" });
  assert.equal(tested.status, 200);
  assert.equal(tested.data.adaptadores[0].status, "Funcionando");
  assert.equal(tested.data.adaptadores[2].status, "Não configurado");
  assert.equal(tested.data.registros.at(-1).provedor, "openai-codex");
  assert.equal(
    (await c.request("/ia/testar", "POST", { tipo: "imagem" })).status,
    503,
  );
  assert.equal(
    JSON.stringify((await c.request("/ia/status")).data).includes(
      h.options.token,
    ),
    false,
  );

  await c.role("cadastro");
  const b = (await c.request("/alunos", "POST", student("Aluno A02"))).data;
  await c.role("professor");
  const failed = await c.request(`/aulas/${l.id}/gerar`, "POST", {
    alunoId: b.id,
  });
  assert.equal(failed.status, 503);
  assert.match(failed.data.erro, /imagem necessária/);
  assert.equal(
    (
      await c.request(`/aulas/${l.id}/publicar`, "POST", {
        alunoId: b.id,
        revisao: review,
      })
    ).status,
    400,
  );
  assert.equal(c.store().read().publicacoes.length, 1);
  assert.equal(c.store().read().aulas[0].gerados[b.id], undefined);
  assert.ok(
    c
      .store()
      .read()
      .geracoes.some((r) => r.tipo === "imagem" && r.resultado === "falha"),
  );
});

test("T07/T08/T10: edição de título ou descrição durante inferência descarta resultado e não bloqueia gravações locais", async (t) => {
  for (const field of ["titulo", "descricao"]) {
    const h = await hermesServer(t);
    const c = await context(t, { textAdapter: h.adapter });
    await c.role("cadastro");
    const value = student();
    value.preferencias.estiloVisual = "só texto";
    const a = (await c.request("/alunos", "POST", value)).data;
    await c.role("professor");
    const l = (await c.request("/aulas", "POST", lesson())).data;
    const preview = await c.request(`/aulas/${l.id}/prompt?alunoId=${a.id}`);
    assert.equal(preview.data.informacoesAula.descricaoAula, l.descricao);
    assert.equal(
      (
        await c.request(
          "/materiais",
          "POST",
          upload(l.id, pdf(), "material.pdf", "application/pdf"),
        )
      ).status,
      201,
    );
    const entered = Promise.withResolvers(),
      release = Promise.withResolvers();
    h.control.beforeReply = async () => {
      entered.resolve();
      await release.promise;
    };
    const request = c.request(`/aulas/${l.id}/gerar`, "POST", {
      alunoId: a.id,
    });
    try {
      await entered.promise;
      const sent = h.requests.find((r) => r.payload?.message);
      assert.equal(
        JSON.parse(sent.payload.message).prompt.informacoesAula.descricaoAula,
        l.descricao,
      );
      assert.equal(
        (await c.request(`/aulas/${l.id}/gerar`, "POST", { alunoId: a.id }))
          .status,
        409,
      );
      assert.equal(
        (await c.request(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id }))
          .status,
        409,
      );
      assert.equal(
        (
          await c.request(`/aulas/${l.id}/publicar`, "POST", {
            alunoId: a.id,
            revisao: review,
          })
        ).status,
        409,
      );
      const edit = await c.request(`/aulas/${l.id}`, "PUT", {
        ...lesson(),
        [field]: "Rascunho editado durante geração",
        assuntos: l.assuntos,
      });
      assert.equal(edit.status, 200);
    } finally {
      release.resolve();
    }
    assert.equal((await request).status, 409);
    const saved = c.store().read();
    assert.equal(saved.aulas[0][field], "Rascunho editado durante geração");
    assert.equal(saved.aulas[0].status, "rascunho");
    assert.equal(saved.aulas[0].gerados[a.id], undefined);
    assert.equal(saved.publicacoes.length, 0);
  }
});

test("T04/T05/T07: edição de perfil reaparece após reinício e História mantém assuntos/material sem contingência indevida", async (t) => {
  const c = await context(t);
  await c.role("cadastro");
  const a = (await c.request("/alunos", "POST", student())).data;
  const edited = student();
  edited.preferencias.interesses = ["espaço"];
  edited.preferencias.texto = "completo";
  assert.equal((await c.request(`/alunos/${a.id}`, "PUT", edited)).status, 200);
  assert.equal(
    (await c.request(`/alunos/${a.id}`, "PUT", { ...edited, turmaId: "8A" }))
      .status,
    400,
  );
  await c.role("professor");
  const history = {
    disciplina: "História",
    titulo: "Processos históricos do Brasil",
    descricao: "Aula fictícia para verificação local",
    turmaId: "9C",
    assuntos: [
      {
        titulo: "Independência do Brasil",
        descricao: "Processos e contextos",
        objetivo: "Identificar processos históricos e suas causas",
      },
      {
        titulo: "Primeiro Reinado",
        descricao: "Organização política",
        objetivo: "Relacionar transformações políticas e sociais",
      },
    ],
  };
  const l = (await c.request("/aulas", "POST", history)).data;
  assert.equal(l.disciplina, "História");
  assert.equal(l.assuntos.length, 2);
  const file = upload(
    l.id,
    await readFile("fixtures/media/fracao-trem.png"),
    "material-ficticio.png",
    "image/png",
  );
  file.set("assuntoId", l.assuntos[1].id);
  const m = (await c.request("/materiais", "POST", file)).data;
  assert.equal(m.status, "necessita_revisao");
  assert.equal(
    (
      await c.request(`/materiais/${m.id}/texto`, "PUT", {
        texto:
          "Material fictício preparado pelo professor para estudar os contextos e processos da formação política do Brasil.",
      })
    ).status,
    200,
  );
  // O arquivo sintético serve apenas para testar o vínculo; não é conteúdo
  // histórico adaptado e jamais deve autorizar uma contingência de frações.
  assert.equal(
    (await c.request(`/aulas/${l.id}/exemplo`, "POST", { alunoId: a.id }))
      .status,
    400,
  );
  assert.equal(
    (await c.request(`/aulas/${l.id}/gerar`, "POST", { alunoId: a.id })).status,
    503,
  );
  assert.equal(c.store().read().publicacoes.length, 0);
  await c.restart();
  await c.role("cadastro");
  const saved = (await c.request("/alunos?turmaId=9C")).data[0];
  assert.equal(saved.id, a.id);
  assert.deepEqual(saved.preferencias, edited.preferencias);
  await c.role("professor");
  const savedLesson = (await c.request("/aulas")).data[0];
  assert.equal(savedLesson.disciplina, "História");
  assert.deepEqual(savedLesson.assuntos, l.assuntos);
  const prompt = (await c.request(`/aulas/${l.id}/prompt?alunoId=${a.id}`))
    .data;
  assert.deepEqual(prompt.preferenciasAluno.interesses, ["espaço"]);
  assert.equal(prompt.preferenciasAluno.texto, "completo");
  assert.equal(prompt.informacoesAula.materiais[0].assuntoId, l.assuntos[1].id);
  assert.equal(prompt.informacoesAula.materiais[0].status, "lido");
});

test("T09/T10: mídia do adaptador fica vinculada à prévia, é servida após reinício e falha não deixa aula incompleta", async (t) => {
  const h = await hermesServer(t);
  // Dublê sintético para o fluxo HTTP; não comprova geração de IA.
  const bytes = await sharp({
    create: { width: 128, height: 96, channels: 3, background: "blue" },
  })
    .png()
    .toBuffer();
  let shouldFail = false;
  const imageAdapter = {
    name: "dublê imagem",
    status: () => "Não verificado",
    generate: async () => {
      if (shouldFail)
        throw new GenerationError("Imagem indisponível para teste.");
      return { bytes, provider: "dublê" };
    },
  };
  const c = await context(t, { textAdapter: h.adapter, imageAdapter });
  await c.role("cadastro");
  const a = (await c.request("/alunos", "POST", student())).data;
  await c.role("professor");
  const l = (await c.request("/aulas", "POST", lesson())).data;
  await c.request(
    "/materiais",
    "POST",
    upload(l.id, pdf(), "material.pdf", "application/pdf"),
  );
  const generated = await c.request(`/aulas/${l.id}/gerar`, "POST", {
    alunoId: a.id,
  });
  assert.equal(generated.status, 200);
  const filename = generated.data.assuntos[0].etapas[0].imagem.arquivo;
  assert.ok(filename.startsWith(`${l.id}/${a.id}/`));
  assert.ok(filename.endsWith(".png"));
  assert.deepEqual(
    await readFile(path.join(c.options.mediaDir, filename)),
    bytes,
  );
  await c.restart();
  await c.role("professor");
  const media = await fetch(c.base() + `/media/${filename}`, {
    headers: c.headers(),
  });
  assert.equal(media.status, 200);
  assert.deepEqual(Buffer.from(await media.arrayBuffer()), bytes);
  shouldFail = true;
  const failed = await c.request(`/aulas/${l.id}/gerar`, "POST", {
    alunoId: a.id,
  });
  assert.equal(failed.status, 503);
  assert.equal(failed.data.erro, "Imagem indisponível para teste.");
  assert.equal(c.store().read().aulas[0].gerados[a.id], undefined);
  assert.equal(c.store().read().publicacoes.length, 0);
  assert.equal(c.store().read().geracoes.at(-1).resultado, "falha");
  await c.role("ia");
  assert.equal(
    (await c.request("/ia/testar", "POST", { tipo: "imagem" })).status,
    503,
  );
  shouldFail = false;
  const checked = await c.request("/ia/testar", "POST", { tipo: "imagem" });
  assert.equal(checked.status, 200);
  assert.equal(checked.data.registros.at(-1).tipo, "imagem");
  assert.equal(checked.data.registros.at(-1).resultado, "sucesso");
});
