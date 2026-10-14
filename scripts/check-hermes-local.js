import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { once } from "node:events";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { createApp } from "../server/app.js";
import { configuredHermes } from "../server/services/hermes-text.js";
import { configuredAgyImage } from "../server/services/agy-image.js";

// Verificação real, manual e opt-in: consome a conta configurada. Nunca faz
// login, lê credenciais pessoais, publica conteúdo ou usa o estado da demonstração.
assert.equal(
  process.env.INTEAGIR_HERMES_ENABLED,
  "true",
  "Ative a configuração local explicitamente.",
);
const adapter = configuredHermes();
const withImages = process.argv.includes("--with-images");
const imageAdapter = withImages ? configuredAgyImage() : null;
if (withImages)
  assert.ok(imageAdapter, "Ative o adaptador local de imagem explicitamente.");
const response = await fetch(
  new URL("/v1/toolsets", process.env.INTEAGIR_HERMES_URL),
  {
    headers: { Authorization: `Bearer ${process.env.INTEAGIR_HERMES_TOKEN}` },
    signal: AbortSignal.timeout(10000),
  },
);
assert.equal(response.status, 200, "API local indisponível.");
const discovery = await response.json();
assert.equal(discovery.platform, "api_server");
assert.ok(Array.isArray(discovery.data));
assert.deepEqual(
  discovery.data.filter((t) => t.enabled),
  [],
  "Desabilite todas as ferramentas da API.",
);
console.log(
  `API autenticada; ${discovery.data.length} conjuntos consultados, nenhum habilitado.`,
);

const directory = path.resolve(
  ".local",
  "gates",
  new Date().toISOString().replaceAll(/[:.]/g, "-"),
);
await mkdir(directory, { recursive: true });
const { app, store } = await createApp({
  dataDir: path.join(directory, "data"),
  uploadsDir: path.join(directory, "uploads"),
  mediaDir: path.join(directory, "media"),
  textAdapter: adapter,
  imageAdapter,
});
const server = app.listen(0, "127.0.0.1");
await once(server, "listening");
let cookie = "";
async function request(route, method = "GET", body) {
  const r = await fetch(
    `http://127.0.0.1:${server.address().port}/api${route}`,
    {
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
    },
  );
  const data = await r.json();
  if (route === "/demo/sessao" && r.ok)
    cookie = r.headers.get("set-cookie").split(";")[0];
  assert.ok(
    r.ok,
    `HTTP ${r.status}: ${data.erro || data.error || "solicitação recusada"}`,
  );
  return data;
}

try {
  await request("/demo/sessao", "POST", { papel: "cadastro" });
  const student = await request("/alunos", "POST", {
    nome: "Aluno A01",
    turmaId: "9C",
    responsavelId: "R01",
    email: "",
    ficticio: true,
    preferencias: {
      interesses: ["trens"],
      estiloVisual: withImages ? "desenhos" : "só texto",
      explicacao: "ler",
      texto: "curto",
      evitar: ["sons", "movimentos"],
      tipoResposta: "alternativas",
      ajuda: "dica",
      feedback: "mensagem curta",
      progresso: "sim",
      observacoes: withImages
        ? "Quero uma ilustração gerada de quatro vagões iguais: um azul e três cinza, mostrando 1/4, sem texto na imagem."
        : "",
    },
  });
  await request("/demo/sessao", "POST", { papel: "professor" });
  const lessonData = {
    disciplina: "Matemática",
    titulo: "Frações e equivalência",
    descricao: "Material fictício para verificação local",
    turmaId: "9C",
    assuntos: [
      {
        titulo: "Frações",
        descricao: "Numerador e denominador em partes iguais",
        objetivo: "Interpretar frações",
      },
      {
        titulo: "Frações equivalentes",
        descricao:
          "Multiplicar numerador e denominador pelo mesmo número não nulo conserva o valor",
        objetivo: "Reconhecer frações equivalentes",
      },
    ],
  };
  if (withImages) lessonData.assuntos = lessonData.assuntos.slice(0, 1);
  const lesson = await request("/aulas", "POST", lessonData);
  // PDF pesquisável sintético, sem dados pessoais.
  const content =
    "BT /F1 12 Tf 20 150 Td (Fracoes representam partes iguais. 1/2 equivale a 2/4.) Tj ET";
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 400 200] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, i) => {
    offsets.push(Buffer.byteLength(pdf));
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = Buffer.byteLength(pdf);
  pdf +=
    "xref\n0 6\n0000000000 65535 f \n" +
    offsets
      .slice(1)
      .map((n) => `${String(n).padStart(10, "0")} 00000 n \n`)
      .join("") +
    `trailer\n<< /Root 1 0 R /Size 6 >>\nstartxref\n${xref}\n%%EOF`;
  const form = new FormData();
  form.set("aulaId", lesson.id);
  form.set(
    "arquivo",
    new Blob([pdf], { type: "application/pdf" }),
    "material-ficticio.pdf",
  );
  await request("/materiais", "POST", form);
  console.log(
    `Perfil fictício, aula com ${lessonData.assuntos.length} assunto(s) e PDF preparados. Iniciando inferência real…`,
  );
  const generated = await request(`/aulas/${lesson.id}/gerar`, "POST", {
    alunoId: student.id,
  });
  assert.equal(generated.assuntos.length, lessonData.assuntos.length);
  if (withImages)
    assert.ok(
      generated.assuntos.some((s) =>
        s.etapas.some((e) => e.imagem?.arquivo?.endsWith(".png")),
      ),
      "A resposta não solicitou imagem.",
    );
  if (withImages) {
    for (const subject of generated.assuntos)
      for (const etapa of subject.etapas) {
        if (!etapa.imagem?.arquivo) continue;
        const media = await fetch(
          `http://127.0.0.1:${server.address().port}/api/media/${etapa.imagem.arquivo}`,
          { headers: { cookie } },
        );
        assert.equal(media.status, 200);
        const bytes = Buffer.from(await media.arrayBuffer());
        const meta = await sharp(bytes).metadata();
        assert.equal(meta.format, "png");
        console.log(
          JSON.stringify({
            imagem: etapa.imagem.arquivo,
            width: meta.width,
            height: meta.height,
            bytes: bytes.length,
            sha256: createHash("sha256").update(bytes).digest("hex"),
          }),
        );
      }
  }
  assert.equal(store.read().publicacoes.length, 0);
  await writeFile(
    path.join(directory, "previa.json"),
    JSON.stringify(generated, null, 2),
  );
  console.log("Assuntos validados; prévia salva, nenhuma publicação.");
  if (process.argv.includes("--compare-profiles")) {
    await request("/demo/sessao", "POST", { papel: "cadastro" });
    const other = await request("/alunos", "POST", {
      nome: "Aluno A02",
      turmaId: "9C",
      responsavelId: "R01",
      email: "",
      ficticio: true,
      preferencias: {
        ...student.preferencias,
        interesses: ["espaço"],
        texto: "completo",
        estiloVisual: "só texto",
        observacoes:
          "Prefiro explicações detalhadas, com exemplos de astronomia e passos explícitos.",
      },
    });
    await request("/demo/sessao", "POST", { papel: "professor" });
    const second = await request(`/aulas/${lesson.id}/gerar`, "POST", {
      alunoId: other.id,
    });
    assert.equal(second.assuntos.length, 2);
    assert.equal(store.read().publicacoes.length, 0);
    await writeFile(
      path.join(directory, "previa-perfil-B.json"),
      JSON.stringify(second, null, 2),
    );
    console.log(
      "Segundo perfil gerado; comparação pedagógica ainda deve ser inspecionada.",
    );
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await writeFile(
    path.join(directory, "resumo.json"),
    JSON.stringify(
      {
        data: new Date().toISOString(),
        modeloSolicitado: process.env.INTEAGIR_HERMES_MODEL,
        status: adapter.status(),
        registros: store.read().geracoes,
        publicacoes: store.read().publicacoes.length,
        statusImagem: imageAdapter?.status() ?? "Não configurado",
        limite:
          "Verificação HTTP local; sem navegador, publicação ou revisão humana. Imagens somente quando solicitadas explicitamente.",
      },
      null,
      2,
    ),
  );
  console.log(`Evidência local: ${directory}`);
  await new Promise((resolve) => server.close(resolve));
}
