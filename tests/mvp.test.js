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
  assert.equal((await event("avancar", {}, duplicateId)).data.repetido, true);
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
