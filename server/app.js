import express from "express";
import multer from "multer";
import sharp from "sharp";
import { PDFParse } from "pdf-parse";
import { randomUUID, randomBytes } from "node:crypto";
import { mkdir, writeFile, readFile, copyFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { createStore } from "./services/store.js";
import { registerDeletions } from "./routes/deletions.js";
import { compilePrompt } from "./services/prompt.js";
import { creativePlan } from "../shared/planning.js";
import {
  currentPlan,
  preparePlan,
  publicPlan,
  PlanningConflict,
} from "./services/planning.js";
import {
  isVisualMaterial,
  prepareVisualMaterials,
} from "./services/visual-materials.js";
import { GenerationError } from "./services/hermes-text.js";
import {
  studentInput,
  lessonInput,
  lessonUpdateInput,
  generatedSubject,
  reviewInput,
  eventInput,
  text,
} from "../shared/contracts.js";
import { fractions, fixtureTitles } from "../fixtures/fractions.js";

const roles = [
  "professor",
  "cadastro",
  "aluno",
  "responsavel",
  "psicologo",
  "ia",
];
const idSchema = z.string().uuid();
const now = () => new Date().toISOString();
export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
const fail = (status, message) => {
  throw new ApiError(status, message);
};
const find = (list, id) =>
  list.find((v) => v.id === id) ?? fail(404, "Registro não encontrado.");
const steps = (publication) =>
  publication.assuntos.flatMap((a) =>
    a.etapas.map((e) => ({
      ...e,
      chave: `${a.assuntoId}/${e.id}`,
      assunto: a.titulo,
    })),
  );
const publicStep = (e) => {
  const { indiceCorreto, dica, feedbackAcerto, explicacao, ...safe } = e;
  return safe;
};
const visualMaterialMessage =
  "Imagem validada. Será anexada ao prompt para a IA ler e compreender durante a geração da aula. Texto manual é opcional; revise a aula gerada antes de publicar.";
const safeMaterial = ({ arquivo, texto, ...m }) => {
  if (isVisualMaterial(m) && m.status === "necessita_revisao") {
    return { ...m, status: "enviado", mensagem: visualMaterialMessage };
  }
  return m;
};
const latestPrompt = (s) => s.diretrizes.at(-1);
function invalidatePreviews(state, alunoId) {
  for (const lesson of state.aulas) {
    const affected = alunoId
      ? Object.hasOwn(lesson.gerados, alunoId)
      : Object.keys(lesson.gerados).length > 0;
    if (!affected) continue;
    if (alunoId) delete lesson.gerados[alunoId];
    else lesson.gerados = {};
    lesson.status = Object.keys(lesson.gerados).length
      ? "para_revisar"
      : "rascunho";
  }
}
const contentSummary = (publication) =>
  publication.assuntos
    .flatMap((a) =>
      a.etapas.filter((e) => e.tipo === "explicacao").map((e) => e.texto),
    )
    .join("\n\n");

export async function createApp({
  dataDir = path.resolve("server/data"),
  uploadsDir = path.resolve("server/uploads"),
  mediaDir = path.resolve("server/media"),
  fixtureImage = path.resolve("fixtures/media/fracao-trem.png"),
  distDir = path.resolve("dist"),
  textAdapter = null,
  imageAdapter = null,
} = {}) {
  const store = await createStore(dataDir);
  await Promise.all([
    mkdir(uploadsDir, { recursive: true }),
    mkdir(mediaDir, { recursive: true }),
  ]);
  const app = express();
  app.disable("x-powered-by");
  const logins = new Map();
  const requests = new Map();
  const generating = new Set();
  // Também proteger respostas encerradas pelo limitador de requisições.
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "same-origin",
      "X-Frame-Options": "DENY",
    });
    if (req.path.startsWith("/api")) res.set("Cache-Control", "no-store");
    next();
  });
  // Limites locais simples, sem serviço externo ou confiança em X-Forwarded-For.
  app.use("/api", (req, res, next) => {
    const current = Date.now(),
      key = req.socket.remoteAddress;
    let bucket = requests.get(key);
    if (!bucket || current - bucket.started > 60000) {
      bucket = { started: current, total: 0, heavy: 0 };
      requests.set(key, bucket);
    }
    bucket.total++;
    if (
      req.method === "POST" &&
      (req.path === "/materiais" ||
        /\/(gerar|exemplo|testar|planejamento)$/.test(req.path))
    )
      bucket.heavy++;
    if (bucket.total > 240 || bucket.heavy > 12) {
      res.set("Retry-After", "60");
      return res
        .status(429)
        .json({ erro: "Limite de requisições atingido. Aguarde um minuto." });
    }
    next();
  });
  app.use((req, res, next) => {
    if (!["GET", "HEAD", "OPTIONS"].includes(req.method)) {
      const origin = req.get("origin");
      if (
        origin &&
        ![
          `${req.protocol}://${req.get("host")}`,
          "http://127.0.0.1:5173",
          "http://localhost:5173",
        ].includes(origin)
      )
        return res.status(403).json({ erro: "Origem não autorizada." });
      if (req.get("sec-fetch-site") === "cross-site")
        return res.status(403).json({ erro: "Origem não autorizada." });
    }
    next();
  });
  app.use(express.json({ limit: "128kb" }));
  app.post("/api/demo/sessao", (req, res) => {
    const { papel } = z
      .object({ papel: z.enum(roles) })
      .strict()
      .parse(req.body);
    // Seletor de demonstração, nunca autenticação de produção.
    for (const [token, s] of logins)
      if (s.expira < Date.now()) logins.delete(token);
    if (logins.size > 1000) fail(429, "Muitas sessões. Tente mais tarde.");
    const token = randomBytes(32).toString("hex");
    logins.set(token, { papel, expira: Date.now() + 8 * 60 * 60 * 1000 });
    res.cookie("inteagir_demo", token, {
      httpOnly: true,
      sameSite: "strict",
      secure: req.secure,
      maxAge: 8 * 60 * 60 * 1000,
      path: "/api",
    });
    res.json({ papel, demonstracao: true });
  });
  app.use("/api", (req, res, next) => {
    const token = req.headers.cookie
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith("inteagir_demo="))
      ?.slice(14);
    const login = logins.get(token);
    if (!login || login.expira < Date.now())
      return res
        .status(401)
        .json({ erro: "Selecione uma área para iniciar a demonstração." });
    req.demo = login;
    next();
  });
  const allow =
    (...allowed) =>
    (req, res, next) =>
      allowed.includes(req.demo.papel)
        ? next()
        : res
            .status(403)
            .json({ erro: "Esta ação pertence a outra área da demonstração." });
  app.get("/api/alunos", (req, res) => {
    if (req.query.turmaId && req.query.turmaId !== "9C") return res.json([]);
    res.json(store.read().alunos);
  });
  app.post("/api/alunos", allow("cadastro"), async (req, res) => {
    const value = studentInput.parse(req.body);
    const aluno = await store.update((s) => {
      const a = { ...value, id: randomUUID(), criadoEm: now() };
      s.alunos.push(a);
      return a;
    });
    res.status(201).json(aluno);
  });
  app.put("/api/alunos/:id", allow("cadastro"), async (req, res) => {
    const value = studentInput.parse(req.body);
    idSchema.parse(req.params.id);
    res.json(
      await store.update((s) => {
        const student = find(s.alunos, req.params.id);
        if (
          student.turmaId !== value.turmaId ||
          JSON.stringify(student.preferencias) !==
            JSON.stringify(value.preferencias)
        )
          invalidatePreviews(s, student.id);
        return Object.assign(student, value, {
          atualizadoEm: now(),
        });
      }),
    );
  });
  registerDeletions(app, {
    store,
    allow,
    fail,
    find,
    generating,
    uploadsDir,
    mediaDir,
  });
  app.get("/api/aulas", allow("professor"), (req, res) =>
    res.json(store.read().aulas),
  );
  app.post("/api/aulas", allow("professor"), async (req, res) => {
    const value = lessonInput.parse(req.body);
    res.status(201).json(
      await store.update((s) => {
        const a = {
          ...value,
          id: randomUUID(),
          assuntos: value.assuntos.map((a) => ({ ...a, id: randomUUID() })),
          materiais: [],
          status: "rascunho",
          gerados: {},
          criadoEm: now(),
        };
        s.aulas.push(a);
        return a;
      }),
    );
  });
  app.put("/api/aulas/:id", allow("professor"), async (req, res) => {
    const value = lessonUpdateInput.parse(req.body);
    res.json(
      await store.update((s) => {
        const a = find(s.aulas, req.params.id);
        const subjects = value.assuntos.map((v) => {
          if (v.id && !a.assuntos.some((old) => old.id === v.id))
            fail(400, "Assunto não pertence à aula.");
          return { ...v, id: v.id ?? randomUUID() };
        });
        if (new Set(subjects.map((v) => v.id)).size !== subjects.length)
          fail(400, "Assuntos repetidos.");
        if (
          s.materiais.some(
            (m) =>
              m.aulaId === a.id &&
              m.assuntoId &&
              !subjects.some((v) => v.id === m.assuntoId),
          )
        )
          fail(
            409,
            "Não remova assunto com material vinculado. Preserve-o ou crie outra aula.",
          );
        return Object.assign(a, value, {
          assuntos: subjects,
          gerados: {},
          status: "rascunho",
        });
      }),
    );
  });
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 2, parts: 3 },
    fileFilter: (req, file, cb) => {
      const formats = {
        ".pdf": "application/pdf",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".webp": "image/webp",
      };
      const expected = formats[path.extname(file.originalname).toLowerCase()];
      cb(
        expected === file.mimetype
          ? null
          : new ApiError(400, "Envie PDF, JPG, PNG ou WebP com tipo correto."),
        expected === file.mimetype,
      );
    },
  });
  app.post(
    "/api/materiais",
    allow("professor"),
    upload.single("arquivo"),
    async (req, res) => {
      if (!req.file) fail(400, "Selecione um arquivo.");
      const aula = find(store.read().aulas, idSchema.parse(req.body.aulaId));
      const assuntoId = req.body.assuntoId
        ? idSchema.parse(req.body.assuntoId)
        : null;
      if (assuntoId && !aula.assuntos.some((a) => a.id === assuntoId))
        fail(400, "Assunto não pertence à aula.");
      const { buffer, mimetype, originalname, size } = req.file;
      let extracted = "",
        status = "enviado",
        mensagem =
          "Imagem validada. Será anexada ao prompt para a IA ler e compreender durante a geração da aula. Texto manual é opcional; revise a aula gerada antes de publicar.";
      let ext;
      if (mimetype === "application/pdf") {
        if (buffer.subarray(0, 5).toString() !== "%PDF-")
          fail(400, "Arquivo não é PDF válido.");
        ext = ".pdf";
        let parser;
        try {
          parser = new PDFParse({ data: buffer });
          const result = await parser.getText();
          extracted = result.text.trim();
          if (extracted.length > 50000)
            fail(400, "PDF excede o limite de texto.");
          status = extracted.length > 10 ? "lido" : "necessita_revisao";
          mensagem =
            status === "lido"
              ? "Texto extraído do PDF; revisar antes da geração."
              : "PDF sem texto suficiente. Prepare o conteúdo manualmente.";
        } catch (e) {
          if (e instanceof ApiError) throw e;
          status = "erro";
          mensagem =
            "Não foi possível ler o PDF. Substitua-o ou prepare o texto manualmente.";
        } finally {
          if (parser) await parser.destroy();
        }
      } else {
        try {
          const meta = await sharp(buffer, {
            limitInputPixels: 20_000_000,
          }).metadata();
          ext = { jpeg: ".jpg", png: ".png", webp: ".webp" }[meta.format];
          if (
            !ext ||
            (ext === ".jpg" ? "image/jpeg" : `image/${meta.format}`) !==
              mimetype
          )
            fail(400, "Conteúdo da imagem não corresponde ao tipo enviado.");
          await sharp(buffer, { limitInputPixels: 20_000_000 })
            .raw()
            .toBuffer();
        } catch (e) {
          if (e instanceof ApiError) throw e;
          fail(400, "Imagem inválida ou muito grande.");
        }
      }
      const id = randomUUID(),
        arquivo = id + ext;
      await writeFile(path.join(uploadsDir, arquivo), buffer, { flag: "wx" });
      const material = await store.update((s) => {
        const a = find(s.aulas, aula.id);
        const m = {
          id,
          aulaId: a.id,
          assuntoId,
          nome: path
            .basename(originalname)
            .replace(/[<>\x00-\x1f]/g, "")
            .slice(0, 150),
          tamanho: size,
          mime: mimetype,
          arquivo,
          status,
          texto: extracted,
          mensagem,
        };
        s.materiais.push(m);
        a.materiais.push(id);
        a.gerados = {};
        a.status = "rascunho";
        return m;
      });
      res.status(201).json(safeMaterial(material));
    },
  );
  app.get("/api/aulas/:id/materiais", allow("professor"), (req, res) =>
    res.json(
      store
        .read()
        .materiais.filter((m) => m.aulaId === req.params.id)
        .map(safeMaterial),
    ),
  );
  app.get(
    "/api/materiais/:id/arquivo",
    allow("professor"),
    async (req, res) => {
      const m = find(store.read().materiais, req.params.id);
      let buffer;
      try {
        buffer = await readFile(path.join(uploadsDir, m.arquivo));
      } catch (e) {
        if (e.code === "ENOENT")
          fail(404, "Material não encontrado. Envie o arquivo novamente.");
        throw e;
      }
      res.type(m.mime);
      res.set("Content-Disposition", "inline");
      res.send(buffer);
    },
  );
  app.put("/api/materiais/:id/texto", allow("professor"), async (req, res) => {
    const { texto } = z
      .object({ texto: text(50000) })
      .strict()
      .parse(req.body);
    res.json(
      safeMaterial(
        await store.update((s) => {
          const m = find(s.materiais, req.params.id);
          Object.assign(m, {
            texto,
            status: "lido",
            mensagem: "Texto preparado manualmente pelo professor.",
          });
          const a = find(s.aulas, m.aulaId);
          a.gerados = {};
          a.status = "rascunho";
          return m;
        }),
      ),
    );
  });
  app.get("/api/aulas/:id/prompt", allow("professor"), (req, res) => {
    const s = store.read(),
      a = find(s.aulas, req.params.id),
      aluno = find(s.alunos, idSchema.parse(req.query.alunoId));
    if (aluno.turmaId !== a.turmaId)
      fail(400, "Aluno não pertence à turma da aula.");
    res.json(compilePrompt(s, a, aluno));
  });
  app.post(
    "/api/aulas/:id/planejamento",
    allow("professor"),
    async (req, res) => {
      const { alunoId, refazer } = z
        .object({ alunoId: idSchema, refazer: z.boolean().default(false) })
        .strict()
        .parse(req.body);
      const s = store.read(),
        lesson = find(s.aulas, req.params.id),
        student = find(s.alunos, alunoId);
      if (lesson.turmaId !== student.turmaId)
        fail(400, "Aluno não pertence à turma da aula.");
      if (generating.has(lesson.id) || generating.has("*"))
        fail(409, "Aguarde a preparação em andamento desta aula.");
      generating.add(lesson.id);
      try {
        res.json(
          publicPlan(
            await preparePlan({
              store,
              lessonId: lesson.id,
              studentId: alunoId,
              textAdapter,
              uploadsDir,
              force: refazer,
            }),
          ),
        );
      } catch (error) {
        fail(
          error instanceof PlanningConflict ? 409 : 503,
          error instanceof GenerationError
            ? error.message
            : "Não foi possível preparar o prompt criativo. Tente novamente.",
        );
      } finally {
        generating.delete(lesson.id);
      }
    },
  );
  app.put(
    "/api/aulas/:id/planejamento",
    allow("professor"),
    async (req, res) => {
      const { alunoId, revisao, assuntos } = creativePlan
        .extend({ alunoId: idSchema, revisao: z.number().int().positive() })
        .parse(req.body);
      if (generating.has(req.params.id) || generating.has("*"))
        fail(409, "Aguarde a geração em andamento antes de editar o prompt.");
      const saved = await store.update((s) => {
        const lesson = find(s.aulas, req.params.id),
          student = find(s.alunos, alunoId);
        if (lesson.turmaId !== student.turmaId)
          fail(400, "Aluno não pertence à turma da aula.");
        const plan = currentPlan(
          lesson,
          alunoId,
          compilePrompt(s, lesson, student),
        );
        if (!plan || plan.revisao !== revisao)
          fail(409, "Prompt desatualizado. Abra o planejamento novamente.");
        if (
          assuntos.length !== lesson.assuntos.length ||
          assuntos.some((a, i) => a.assuntoId !== lesson.assuntos[i].id)
        )
          fail(400, "Preserve os assuntos da aula no planejamento.");
        plan.assuntos = assuntos;
        plan.revisao++;
        delete lesson.gerados[alunoId];
        return publicPlan(plan);
      });
      res.json(saved);
    },
  );
  const status = () => ({
    configVersion: "1.0",
    promptBaseVersion: latestPrompt(store.read()).versao,
    adaptadores: [
      {
        nome: "Codex OAuth via Hermes (texto)",
        status: textAdapter?.status() ?? "Não configurado",
      },
      {
        nome: "Imagem primária",
        status: imageAdapter?.status() ?? "Não configurado",
      },
      ...(imageAdapter?.supportsFallback ? [{
        nome: "Imagem reserva",
        status: imageAdapter.fallbackStatus(),
      }] : []),
    ],
    reservaConfigurada: imageAdapter?.supportsFallback === true,
    registros: store.read().geracoes.slice(-10),
  });
  app.get("/api/ia/status", (req, res) => res.json(status()));
  app.post("/api/ia/testar", allow("ia"), async (req, res) => {
    const { tipo } = z
      .object({ tipo: z.enum(["texto", "imagem", "fallback"]) })
      .strict()
      .parse(req.body);
    if (
      (tipo === "imagem" || tipo === "fallback") &&
      imageAdapter &&
      (tipo !== "fallback" || imageAdapter.fallbackStatus)
    ) {
      const started = Date.now();
      let verified,
        attempts,
        message =
          "Imagem PNG real salva no backend; revisão visual do professor necessária.";
      try {
        verified = await imageAdapter.generate({
          fallbackOnly: tipo === "fallback",
          pedido:
            "Ilustração pedagógica: exatamente quatro vagões iguais em linha, um azul e três cinza, fundo branco, sem texto nem números.",
        });
        attempts = verified.tentativas;
        const directory = path.join(mediaDir, "verificacao");
        await mkdir(directory, { recursive: true });
        await writeFile(
          path.join(directory, `${randomUUID()}.png`),
          verified.bytes,
          { flag: "wx" },
        );
      } catch (error) {
        attempts = error.tentativas ?? attempts;
        message =
          error instanceof GenerationError
            ? error.message
            : "Não foi possível salvar a imagem verificada.";
        verified = null;
      }
      await store.update((s) => {
        s.geracoes.push({
          jobId: randomUUID(),
          tipo,
          adaptador: imageAdapter.name,
          resultado: verified ? "sucesso" : "falha",
          criadoEm: now(),
          duracaoMs: Date.now() - started,
          fallbackUsado: verified?.fallbackUsado ?? false,
          provedor: verified?.provider,
          modelo: verified?.model,
          tentativas: attempts,
          mensagem: message,
        });
        return null;
      });
      if (!verified) fail(503, message);
      return res.json({ mensagem: message, ...status() });
    }
    if (tipo === "texto" && textAdapter) {
      const started = Date.now(),
        testedPrompt = latestPrompt(store.read());
      let message =
          "Texto JSON validado pelo backend; revisão pedagógica e gate de imagem continuam necessários.",
        success = false,
        verified = null;
      try {
        const assunto = {
          id: randomUUID(),
          titulo: "Frações",
          descricao: "Quatro partes iguais; uma parte representa um quarto.",
          objetivo: "Interpretar a fração 1/4",
        };
        verified = await textAdapter.generate({
          assunto,
          prompt: {
            promptBaseVersion: testedPrompt.versao,
            diretrizesGerais: testedPrompt.texto,
            informacoesAula: {
              disciplina: "Matemática",
              turma: "9C",
              assuntos: [assunto],
              materiais: [],
            },
            preferenciasAluno: {
              estiloVisual: "só texto",
              interesses: ["trens"],
              evitar: ["sons", "movimentos"],
            },
          },
        });
        success = true;
      } catch (error) {
        message =
          error instanceof GenerationError
            ? error.message
            : "Não foi possível validar o texto da IA.";
      }
      await store.update((s) => {
        s.geracoes.push({
          jobId: randomUUID(),
          tipo,
          adaptador: textAdapter.name,
          resultado: success ? "sucesso" : "falha",
          criadoEm: now(),
          duracaoMs: Date.now() - started,
          fallbackUsado: false,
          provedor: verified?.provider,
          modelo: verified?.model,
          promptBaseVersion: testedPrompt.versao,
          mensagem: message,
        });
        return null;
      });
      if (!success) fail(503, message);
      return res.json({ mensagem: message, ...status() });
    }
    await store.update((s) => {
      s.geracoes.push({
        jobId: randomUUID(),
        tipo,
        adaptador: "nenhum",
        resultado: "falha",
        criadoEm: now(),
        duracaoMs: 0,
        fallbackUsado: false,
        mensagem:
          "Adaptador não configurado ou não verificado. Nenhuma chamada ao provedor foi realizada.",
      });
      return null;
    });
    fail(
      503,
      "Adaptador não configurado ou não verificado. Nenhuma chamada ao provedor foi realizada.",
    );
  });
  app.post("/api/aulas/:id/gerar", allow("professor"), async (req, res) => {
    const { alunoId, planejamentoRevisao } = z
      .object({
        alunoId: idSchema,
        planejamentoRevisao: z.number().int().positive().optional(),
      })
      .strict()
      .parse(req.body);
    if (textAdapter) {
      const snapshot = store.read(),
        lesson = find(snapshot.aulas, req.params.id),
        student = find(snapshot.alunos, alunoId);
      if (lesson.turmaId !== student.turmaId)
        fail(400, "Aluno não pertence à turma.");
      if (
        !lesson.materiais.length ||
        snapshot.materiais
          .filter((m) => lesson.materiais.includes(m.id))
          .some((m) => m.status !== "lido" && !isVisualMaterial(m))
      )
        fail(400, "Envie material e revise/preencha o texto antes de gerar.");
      if (generating.has(lesson.id) || generating.has("*"))
        fail(409, "Aguarde a preparação em andamento desta aula.");
      const prompt = compilePrompt(snapshot, lesson, student);
      if (
        planejamentoRevisao &&
        currentPlan(lesson, alunoId, prompt)?.revisao !== planejamentoRevisao
      )
        fail(
          409,
          "Prompt desatualizado. Abra o planejamento novamente antes de gerar.",
        );
      const records = [];
      generating.add(lesson.id);
      try {
        const planning = await preparePlan({
          store,
          lessonId: lesson.id,
          studentId: alunoId,
          textAdapter,
          uploadsDir,
        });
        const subjects = [];
        for (const assunto of lesson.assuntos) {
          const started = Date.now();
          const record = {
            jobId: randomUUID(),
            aulaId: lesson.id,
            alunoId,
            assuntoId: assunto.id,
            tipo: "texto",
            promptBaseVersion: prompt.promptBaseVersion,
            adaptador: textAdapter.name,
            planejamentoRevisao: planning.revisao,
            resultado: "falha",
            criadoEm: now(),
            duracaoMs: 0,
            fallbackUsado: false,
            mensagem: "",
          };
          records.push(record);
          let result;
          try {
            const images = await prepareVisualMaterials({
              materials: snapshot.materiais.filter((m) =>
                lesson.materiais.includes(m.id),
              ),
              uploadsDir,
              assuntoId: assunto.id,
            });
            result = await textAdapter.generate({
              prompt,
              assunto,
              images,
              planejamento: planning.assuntos.find(
                (a) => a.assuntoId === assunto.id,
              ),
            });
            record.resultado = "sucesso";
            record.provedor = result.provider;
            record.modelo = result.model;
            record.mensagem =
              "Texto JSON validado; revisão do professor necessária.";
          } finally {
            record.duracaoMs = Date.now() - started;
          }
          const doc = result.doc;
          for (const etapa of doc.etapas.filter(
            (e) => e.tipo === "explicacao" && e.imagem.necessaria,
          )) {
            const imageRecord = {
              ...record,
              jobId: randomUUID(),
              tipo: "imagem",
              criadoEm: now(),
              adaptador: imageAdapter?.name ?? "nenhum",
              provedor: undefined,
              modelo: undefined,
              resultado: "falha",
              duracaoMs: 0,
              mensagem: "",
            };
            records.push(imageRecord);
            if (!imageAdapter)
              throw new GenerationError(
                "Texto recebido, mas a imagem necessária não foi gerada. Configure e verifique o adaptador de imagem; publicação bloqueada.",
              );
            const imageStarted = Date.now();
            try {
              const image = await imageAdapter.generate({
                pedido: etapa.imagem.pedido,
              });
              const filename = `${randomUUID()}.png`;
              const directory = path.join(mediaDir, lesson.id, alunoId);
              await mkdir(directory, { recursive: true });
              await writeFile(path.join(directory, filename), image.bytes, {
                flag: "wx",
              });
              etapa.imagem.arquivo = `${lesson.id}/${alunoId}/${filename}`;
              imageRecord.resultado = "sucesso";
              imageRecord.provedor = image.provider;
              imageRecord.modelo = image.model;
              imageRecord.fallbackUsado = image.fallbackUsado ?? false;
              imageRecord.tentativas = image.tentativas;
              imageRecord.mensagem =
                "PNG real salvo; revisão visual do professor necessária.";
            } catch (error) {
              imageRecord.tentativas = error.tentativas;
              throw error;
            } finally {
              imageRecord.duracaoMs = Date.now() - imageStarted;
            }
          }
          subjects.push(doc);
        }
        const generated = await store.update((s) => {
          const current = find(s.aulas, lesson.id);
          if (
            JSON.stringify(
              compilePrompt(s, current, find(s.alunos, alunoId)),
            ) !== JSON.stringify(prompt)
          )
            fail(
              409,
              "Aula, material, perfil ou diretrizes mudaram durante a geração. Gere novamente.",
            );
          current.gerados[alunoId] = {
            assuntos: subjects,
            planejamentoRevisao: planning.revisao,
            origem: subjects.some((d) =>
              d.etapas.some((e) => e.imagem?.arquivo),
            )
              ? `Codex OAuth via Hermes (texto) + ${[...new Set(records.filter((r) => r.tipo === "imagem" && r.resultado === "sucesso").map((r) => r.provedor))].join(", ")} (imagem)`
              : "Codex OAuth via Hermes (texto)",
            promptBaseVersion: prompt.promptBaseVersion,
          };
          current.status = "para_revisar";
          s.geracoes.push(...records);
          return current.gerados[alunoId];
        });
        return res.json(generated);
      } catch (error) {
        const message =
          error instanceof GenerationError || error instanceof ApiError
            ? error.message
            : "Não foi possível concluir a geração. Nenhum conteúdo foi publicado.";
        await store.update((s) => {
          const current = find(s.aulas, lesson.id);
          // Preservar um rascunho editado enquanto o provedor trabalhava.
          if (
            JSON.stringify(
              compilePrompt(s, current, find(s.alunos, alunoId)),
            ) === JSON.stringify(prompt)
          ) {
            delete current.gerados[alunoId];
            current.status = "falha_geracao";
          }
          for (const record of records)
            if (!record.mensagem) record.mensagem = message;
          if (error instanceof ApiError && error.status === 409)
            for (const record of records) {
              record.resultado = "falha";
              record.mensagem =
                "Texto descartado: dados mudaram durante a geração.";
            }
          s.geracoes.push(...records);
          return null;
        });
        fail(
          error instanceof ApiError
            ? error.status
            : error instanceof PlanningConflict
              ? 409
              : 503,
          message,
        );
      } finally {
        generating.delete(lesson.id);
      }
    }
    await store.update((s) => {
      const a = find(s.aulas, req.params.id),
        aluno = find(s.alunos, alunoId);
      if (aluno.turmaId !== a.turmaId) fail(400, "Aluno não pertence à turma.");
      a.status = "falha_geracao";
      s.geracoes.push({
        jobId: randomUUID(),
        aulaId: a.id,
        alunoId,
        tipo: "texto",
        adaptador: "Hermes não configurado",
        resultado: "falha",
        criadoEm: now(),
        duracaoMs: 0,
        fallbackUsado: false,
        mensagem:
          "Geração indisponível. Configure e verifique Hermes no servidor.",
      });
      return null;
    });
    fail(
      503,
      "Geração indisponível. Hermes e provedores não estão configurados. Você pode escolher explicitamente o exemplo pré-gerado de frações.",
    );
  });
  app.post("/api/aulas/:id/exemplo", allow("professor"), async (req, res) => {
    const { alunoId } = z
      .object({ alunoId: idSchema })
      .strict()
      .parse(req.body);
    if (generating.has(req.params.id) || generating.has("*"))
      fail(409, "Aguarde a preparação em andamento desta aula.");
    // O exemplo usa apenas arquivos locais: preparar dentro da fila garante
    // uma única versão de aula, material, perfil e diretrizes, sem corridas.
    const result = await store.update(async (s) => {
      const a = find(s.aulas, req.params.id),
        aluno = find(s.alunos, alunoId);
      if (a.turmaId !== aluno.turmaId) fail(400, "Aluno não pertence à turma.");
      if (
        a.disciplina !== "Matemática" ||
        !a.assuntos.every((v) => fixtureTitles.includes(v.titulo))
      )
        fail(
          400,
          "O exemplo atende somente Matemática, assuntos Frações e Frações equivalentes. Crie a aula de demonstração sugerida.",
        );
      if (
        !a.materiais.length ||
        s.materiais
          .filter((m) => a.materiais.includes(m.id))
          .some((m) => m.status !== "lido")
      )
        fail(
          400,
          "Envie material e revise/preencha o texto antes de preparar a demonstração.",
        );
      let filename = null;
      if (aluno.preferencias.estiloVisual !== "só texto") {
        try {
          await sharp(fixtureImage).raw().toBuffer();
        } catch {
          fail(
            503,
            "Imagem pré-gerada ausente ou inválida. A aula não pode ser publicada.",
          );
        }
        const directory = path.join(mediaDir, a.id, alunoId);
        await mkdir(directory, { recursive: true });
        filename = `${randomUUID()}.png`;
        await copyFile(fixtureImage, path.join(directory, filename));
      }
      const generated = a.assuntos.map((assunto) => {
        const doc = fractions(
          assunto,
          aluno.preferencias.interesses.includes("trens")
            ? "trens"
            : aluno.preferencias.interesses.includes("esportes")
              ? "esportes"
              : null,
        );
        doc.etapas[0].imagem.arquivo = `${a.id}/${alunoId}/${filename}`;
        if (aluno.preferencias.estiloVisual === "só texto") {
          doc.etapas[0].imagem = {
            necessaria: false,
            pedido: "",
            alt: "",
            arquivo: null,
          };
          doc.observacoesParaProfessor.push(
            "Preferência só texto aplicada: mídia não exibida neste perfil.",
          );
        }
        return generatedSubject.parse(doc);
      });
      a.gerados[alunoId] = {
        assuntos: generated,
        origem: "Pré-gerado para demonstração",
        promptBaseVersion: latestPrompt(s).versao,
      };
      a.status = "para_revisar";
      return a.gerados[alunoId];
    });
    res.json(result);
  });
  app.get("/api/aulas/:id/previa", allow("professor"), (req, res) => {
    const a = find(store.read().aulas, req.params.id);
    res.json(
      a.gerados[idSchema.parse(req.query.alunoId)] ??
        fail(404, "Ainda não há conteúdo para revisar."),
    );
  });
  async function validateMedia(aulaId, alunoId, doc) {
    for (const etapa of doc.etapas)
      if (etapa.tipo === "explicacao" && etapa.imagem.necessaria) {
        const filename = etapa.imagem.arquivo;
        const regex = new RegExp(
          `^${aulaId}/${alunoId}/[a-f0-9-]+\\.(png|webp)$`,
        );
        if (!filename || !regex.test(filename))
          fail(400, "Imagem não pertence à aula/aluno.");
        try {
          const image = sharp(path.join(mediaDir, ...filename.split("/")), {
            limitInputPixels: 20_000_000,
          });
          const meta = await image.metadata();
          if (!["png", "webp"].includes(meta.format))
            fail(400, "Imagem inválida.");
          await image.raw().toBuffer();
        } catch (e) {
          if (e instanceof ApiError) throw e;
          fail(400, "Imagem ausente ou inválida. Publicação bloqueada.");
        }
      }
  }
  app.post("/api/aulas/:id/publicar", allow("professor"), async (req, res) => {
    const value = reviewInput.parse(req.body);
    if (generating.has(req.params.id) || generating.has("*"))
      fail(409, "Aguarde a preparação em andamento desta aula.");
    const pub = await store.update(async (s) => {
      const a = find(s.aulas, req.params.id);
      find(s.alunos, value.alunoId);
      const g = a.gerados[value.alunoId];
      if (!g) fail(400, "Gere e revise o conteúdo antes de publicar.");
      if (
        g.assuntos.length !== a.assuntos.length ||
        new Set(g.assuntos.map((d) => d.assuntoId)).size !== a.assuntos.length
      )
        fail(400, "Conteúdo não cobre todos os assuntos.");
      for (const doc of g.assuntos) {
        generatedSubject.parse(doc);
        if (!a.assuntos.some((v) => v.id === doc.assuntoId))
          fail(400, "Assunto desconhecido.");
        await validateMedia(a.id, value.alunoId, doc);
      }
      const last = s.publicacoes
        .filter((p) => p.aulaId === a.id && p.alunoId === value.alunoId)
        .at(-1);
      if (last && JSON.stringify(last.assuntos) === JSON.stringify(g.assuntos))
        fail(409, "Esta versão já está publicada.");
      const p = {
        id: randomUUID(),
        aulaId: a.id,
        alunoId: value.alunoId,
        titulo: a.titulo,
        disciplina: a.disciplina,
        versao: (last?.versao ?? 0) + 1,
        ...g,
        revisao: value.revisao,
        publicadoEm: now(),
      };
      s.publicacoes.push(p);
      a.status = "publicada";
      return p;
    });
    res.status(201).json(pub);
  });
  app.get("/api/media/:aulaId/:alunoId/:arquivo", async (req, res) => {
    idSchema.parse(req.params.aulaId);
    idSchema.parse(req.params.alunoId);
    if (!/^[a-f0-9-]+\.(png|webp)$/.test(req.params.arquivo))
      fail(404, "Imagem não encontrada.");
    const relative = `${req.params.aulaId}/${req.params.alunoId}/${req.params.arquivo}`;
    const s = store.read();
    const docs =
      req.demo.papel === "professor"
        ? find(s.aulas, req.params.aulaId).gerados[req.params.alunoId]?.assuntos
        : s.publicacoes
            .filter(
              (p) =>
                p.aulaId === req.params.aulaId &&
                p.alunoId === req.params.alunoId,
            )
            .flatMap((p) => p.assuntos);
    if (
      !docs?.some((d) => d.etapas.some((e) => e.imagem?.arquivo === relative))
    )
      fail(404, "Imagem não disponível.");
    try {
      res.type(path.extname(relative));
      res.send(await readFile(path.join(mediaDir, ...relative.split("/"))));
    } catch {
      fail(404, "Imagem não encontrada.");
    }
  });
  app.get("/api/publicacoes", allow("aluno"), (req, res) => {
    const s = store.read();
    find(s.alunos, idSchema.parse(req.query.alunoId));
    res.json(
      s.publicacoes
        .filter((p) => p.alunoId === req.query.alunoId)
        .map((p) => ({
          id: p.id,
          titulo: p.titulo,
          disciplina: p.disciplina,
          versao: p.versao,
          origem: p.origem,
          totalEtapas: steps(p).length,
          sessao: s.sessoes.find((v) => v.publicacaoId === p.id) ?? null,
        })),
    );
  });
  function studentSession(s, session) {
    const p = find(s.publicacoes, session.publicacaoId),
      all = steps(p);
    return {
      ...session,
      etapasConcluidas: session.etapasConcluidas ?? session.indice,
      eventos: undefined,
      ultimoPulso: undefined,
      etapa: all[session.indice] ? publicStep(all[session.indice]) : null,
      totalEtapas: all.length,
      titulo: p.titulo,
      origem: p.origem,
    };
  }
  app.post("/api/sessoes", allow("aluno"), async (req, res) => {
    const { publicacaoId } = z
      .object({ publicacaoId: idSchema })
      .strict()
      .parse(req.body);
    res.json(
      await store.update((s) => {
        const p = find(s.publicacoes, publicacaoId);
        let session = s.sessoes.find((v) => v.publicacaoId === p.id);
        if (!session) {
          session = {
            id: randomUUID(),
            publicacaoId: p.id,
            alunoId: p.alunoId,
            indice: 0,
            etapasConcluidas: 0,
            pausada: false,
            concluida: false,
            respostas: {},
            eventos: [],
            tempoVisivelMs: 0,
            revisaoEventos: 0,
            ultimoPulso: Date.now(),
            avaliacao: null,
            iniciadoEm: now(),
            concluidoEm: null,
          };
          s.sessoes.push(session);
        }
        return studentSession(s, session);
      }),
    );
  });
  app.get("/api/sessoes/:id", allow("aluno"), (req, res) => {
    const s = store.read();
    res.json(studentSession(s, find(s.sessoes, req.params.id)));
  });
  app.post("/api/sessoes/:id/eventos", allow("aluno"), async (req, res) => {
    const event = eventInput.parse(req.body);
    res.json(
      await store.update((s) => {
        const session = find(s.sessoes, req.params.id),
          p = find(s.publicacoes, session.publicacaoId),
          all = steps(p),
          step = all[session.indice];
        if (session.eventos.includes(event.eventId))
          return { sessao: studentSession(s, session), repetido: true };
        let feedback = null,
          dica = null;
        const currentTime = Date.now();
        if (event.tipo === "tempo") {
          if (
            !session.pausada &&
            !session.concluida &&
            session.ultimoPulso &&
            currentTime - session.ultimoPulso <= 30000
          )
            session.tempoVisivelMs += Math.max(
              0,
              currentTime - session.ultimoPulso,
            );
          session.ultimoPulso = currentTime;
        } else if (event.tipo === "pausar") {
          session.pausada = true;
          session.ultimoPulso = null;
        } else if (event.tipo === "retomar") {
          session.pausada = false;
          session.ultimoPulso = currentTime;
        } else if (event.tipo === "feedback") {
          if (!session.concluida || !event.avaliacao)
            fail(400, "Conclua a aula antes de avaliar.");
          session.avaliacao = event.avaliacao;
        } else {
          if (session.pausada || session.concluida || !step)
            fail(409, "Retome uma sessão em andamento para continuar.");
          if (event.etapaId !== step.chave)
            fail(409, "Etapa mudou. Atualize a sessão.");
          if (event.tipo === "voltar") {
            if (session.indice === 0)
              fail(400, "Você já está na primeira etapa.");
            session.etapasConcluidas ??= session.indice;
            session.indice--;
          } else if (event.tipo === "avancar") {
            if (
              step.tipo === "questao" &&
              !session.respostas[step.chave]?.correta
            )
              fail(
                400,
                "Responda corretamente ou peça ajuda antes de continuar.",
              );
            session.etapasConcluidas = Math.max(
              session.etapasConcluidas ?? session.indice,
              session.indice + 1,
            );
            session.indice++;
            session.concluida = session.indice >= all.length;
            if (session.concluida) {
              session.concluidoEm = now();
              session.ultimoPulso = null;
            }
          } else {
            if (step.tipo !== "questao")
              fail(400, "Esta etapa é uma explicação.");
            const record = (session.respostas[step.chave] ??= {
              tentativas: 0,
              firstTryCorrect: null,
              correta: false,
              ajudas: 0,
            });
            if (event.tipo === "dica") {
              record.ajudas++;
              dica = step.dica;
            }
            if (event.tipo === "resposta") {
              if (event.alternativa === undefined)
                fail(400, "Selecione uma alternativa.");
              if (record.correta)
                fail(409, "Questão já respondida corretamente.");
              record.tentativas++;
              record.ultimaAlternativa = event.alternativa;
              const correct = event.alternativa === step.indiceCorreto;
              if (record.firstTryCorrect === null)
                record.firstTryCorrect = correct;
              record.correta = correct;
              feedback = {
                correta: correct,
                texto: correct ? step.feedbackAcerto : step.explicacao,
              };
            }
          }
        }
        session.revisaoEventos = (session.revisaoEventos ?? 0) + 1;
        session.eventos.push(event.eventId);
        return { sessao: studentSession(s, session), feedback, dica };
      }),
    );
  });
  app.get(
    "/api/relatorios/:alunoId",
    allow("responsavel", "psicologo"),
    (req, res) => {
      const s = store.read(),
        aluno = find(s.alunos, req.params.alunoId);
      const sessions = s.sessoes
        .filter((v) => v.alunoId === aluno.id)
        .map((v) => {
          const p = find(s.publicacoes, v.publicacaoId);
          return {
            ...v,
            etapasConcluidas: v.etapasConcluidas ?? v.indice,
            eventos: undefined,
            ultimoPulso: undefined,
            titulo: p.titulo,
            disciplina: p.disciplina,
            promptBaseVersion: p.promptBaseVersion,
            origem: p.origem,
            totalEtapas: steps(p).length,
            assuntos: p.assuntos.map((a) => a.titulo),
            totalQuestoes: p.assuntos.length * 3,
            resumo: contentSummary(p),
          };
        });
      res.json({
        aluno,
        sessoes: sessions,
        conteudos: s.publicacoes
          .filter((p) => p.alunoId === aluno.id)
          .map((p) => ({
            publicacaoId: p.id,
            titulo: p.titulo,
            disciplina: p.disciplina,
            origem: p.origem,
            resumo: contentSummary(p),
            totalEtapas: steps(p).length,
            iniciada: s.sessoes.some((v) => v.publicacaoId === p.id),
          })),
        observacoes: s.observacoes.filter((v) => v.alunoId === aluno.id),
        notas:
          req.demo.papel === "psicologo"
            ? s.notas.filter((v) => v.alunoId === aluno.id)
            : [],
      });
    },
  );
  app.post("/api/observacoes", allow("responsavel"), async (req, res) => {
    const value = z
      .object({
        alunoId: idSchema,
        texto: text(2000),
        categoria: z
          .enum([
            "dificuldade com texto",
            "imagem",
            "interação",
            "interrupção",
            "outro",
          ])
          .nullable(),
      })
      .strict()
      .parse(req.body);
    res.status(201).json(
      await store.update((s) => {
        find(s.alunos, value.alunoId);
        const v = {
          ...value,
          id: randomUUID(),
          origem: "Responsável de demonstração",
          criadoEm: now(),
        };
        s.observacoes.push(v);
        return v;
      }),
    );
  });
  app.post("/api/notas", allow("psicologo"), async (req, res) => {
    const value = z
      .object({ alunoId: idSchema, texto: text(2000) })
      .strict()
      .parse(req.body);
    res.status(201).json(
      await store.update((s) => {
        find(s.alunos, value.alunoId);
        const v = {
          ...value,
          id: randomUUID(),
          origem: "Registro humano — psicólogo de demonstração",
          criadoEm: now(),
        };
        s.notas.push(v);
        return v;
      }),
    );
  });
  app.get("/api/diretrizes", allow("psicologo"), (req, res) =>
    res.json(store.read().diretrizes),
  );
  app.post("/api/diretrizes", allow("psicologo"), async (req, res) => {
    const { texto } = z
      .object({ texto: text(8000) })
      .strict()
      .parse(req.body);
    res.status(201).json(
      await store.update((s) => {
        const v = {
          versao: latestPrompt(s).versao + 1,
          texto,
          criadoEm: now(),
        };
        s.diretrizes.push(v);
        invalidatePreviews(s);
        return v;
      }),
    );
  });
  app.use("/api", (req, res) =>
    res.status(404).json({ erro: "Rota não encontrada." }),
  );
  app.use(
    express.static(distDir, {
      index: "index.html",
      setHeaders(res, filename) {
        if (filename.endsWith("sw.js")) res.set("Cache-Control", "no-cache");
      },
    }),
  );
  app.use((err, req, res, next) => {
    if (res.headersSent) return next(err);
    if (err instanceof z.ZodError)
      return res.status(400).json({
        erro: "Verifique os campos informados.",
        detalhes: err.issues
          .map((i) => ({ campo: i.path.join("."), mensagem: i.message }))
          .slice(0, 8),
      });
    if (err instanceof multer.MulterError)
      return res.status(400).json({
        erro: "Upload inválido. Limite: um arquivo de até 5 MB por envio.",
      });
    if (err.type === "entity.too.large")
      return res
        .status(413)
        .json({ erro: "Dados excedem o limite permitido." });
    if (err instanceof SyntaxError && err.status === 400)
      return res.status(400).json({ erro: "JSON inválido." });
    res.status(err.status ?? 500).json({
      erro:
        err instanceof ApiError
          ? err.message
          : "Não foi possível concluir a operação. Tente novamente.",
    });
  });
  return { app, store };
}
