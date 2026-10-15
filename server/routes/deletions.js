import { realpath, unlink } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

const id = z.string().uuid();
const confirmation = z.object({ confirmacao: z.literal("excluir") }).strict();
function refreshStatus(state, lesson) {
  lesson.status = Object.keys(lesson.gerados).length
    ? "para_revisar"
    : state.publicacoes.some((p) => p.aulaId === lesson.id)
      ? "publicada"
      : "rascunho";
}
function assets(state) {
  const files = new Set(state.materiais.map((m) => `upload:${m.arquivo}`));
  const docs = [
    ...state.publicacoes.flatMap((p) => p.assuntos),
    ...state.aulas.flatMap((a) =>
      Object.values(a.gerados).flatMap((g) => g.assuntos),
    ),
  ];
  for (const doc of docs)
    for (const step of doc.etapas)
      if (step.imagem?.arquivo) files.add(`media:${step.imagem.arquivo}`);
  return files;
}
async function cleanup(files, uploadsDir, mediaDir) {
  let pending = 0;
  for (const entry of files) {
    const [type, relative] = entry.split(":");
    try {
      const valid =
        type === "upload"
          ? /^[a-f0-9-]{36}\.(pdf|png|jpg|webp)$/.test(relative)
          : /^[a-f0-9-]{36}\/[a-f0-9-]{36}\/[a-f0-9-]{36}\.(png|webp)$/.test(
              relative,
            );
      if (!valid) throw new Error();
      const root = await realpath(type === "upload" ? uploadsDir : mediaDir);
      const target = await realpath(path.join(root, ...relative.split("/")));
      const confined = path.relative(root, target);
      if (!confined || confined.startsWith("..") || path.isAbsolute(confined))
        throw new Error();
      await unlink(target);
    } catch (error) {
      if (error.code !== "ENOENT") pending++;
    }
  }
  return pending;
}

export function registerDeletions(
  app,
  { store, allow, fail, find, generating, uploadsDir, mediaDir },
) {
  const unlocked = (lessonId) => {
    if (generating.has(lessonId))
      fail(
        409,
        "Aguarde a geração em andamento antes de excluir este conteúdo.",
      );
  };
  const remove = async (req, res, mutation) => {
    confirmation.parse(req.body);
    if (generating.size)
      fail(409, "Aguarde a geração ou exclusão em andamento antes de excluir.");
    generating.add("*");
    try {
      const result = await store.update((s) => {
        const before = assets(s);
        mutation(s);
        const after = assets(s);
        return { files: [...before].filter((file) => !after.has(file)) };
      });
      const arquivosPendentes = await cleanup(
        result.files,
        uploadsDir,
        mediaDir,
      );
      res.json({
        excluido: true,
        arquivosPendentes,
        mensagem: arquivosPendentes
          ? "Registro excluído. Alguns arquivos não puderam ser removidos do armazenamento."
          : "Exclusão concluída.",
      });
    } finally {
      generating.delete("*");
    }
  };
  app.delete("/api/aulas/:id", allow("professor"), async (req, res) => {
    const lessonId = id.parse(req.params.id);
    await remove(req, res, (s) => {
      find(s.aulas, lessonId);
      unlocked(lessonId);
      const publications = new Set(
        s.publicacoes.filter((p) => p.aulaId === lessonId).map((p) => p.id),
      );
      s.sessoes = s.sessoes.filter((v) => !publications.has(v.publicacaoId));
      s.publicacoes = s.publicacoes.filter((p) => p.aulaId !== lessonId);
      s.materiais = s.materiais.filter((m) => m.aulaId !== lessonId);
      s.geracoes = s.geracoes.filter((g) => g.aulaId !== lessonId);
      s.aulas = s.aulas.filter((a) => a.id !== lessonId);
    });
  });
  app.delete("/api/materiais/:id", allow("professor"), async (req, res) => {
    const materialId = id.parse(req.params.id);
    await remove(req, res, (s) => {
      const m = find(s.materiais, materialId),
        lesson = find(s.aulas, m.aulaId);
      unlocked(lesson.id);
      lesson.materiais = lesson.materiais.filter((v) => v !== materialId);
      lesson.gerados = {};
      lesson.planejamentos = {};
      lesson.status = "rascunho";
      s.materiais = s.materiais.filter((v) => v.id !== materialId);
    });
  });
  app.delete(
    "/api/aulas/:id/previa/:alunoId",
    allow("professor"),
    async (req, res) => {
      const lessonId = id.parse(req.params.id),
        alunoId = id.parse(req.params.alunoId);
      await remove(req, res, (s) => {
        const lesson = find(s.aulas, lessonId);
        unlocked(lessonId);
        if (!lesson.gerados[alunoId]) fail(404, "Prévia não encontrada.");
        delete lesson.gerados[alunoId];
        refreshStatus(s, lesson);
      });
    },
  );
  app.get("/api/aulas/:id/publicacoes", allow("professor"), (req, res) => {
    const s = store.read(),
      lesson = find(s.aulas, id.parse(req.params.id));
    res.json(
      s.publicacoes
        .filter((p) => p.aulaId === lesson.id)
        .map((p) => ({
          id: p.id,
          alunoId: p.alunoId,
          versao: p.versao,
          publicadoEm: p.publicadoEm,
        })),
    );
  });
  app.delete("/api/publicacoes/:id", allow("professor"), async (req, res) => {
    const publicationId = id.parse(req.params.id);
    await remove(req, res, (s) => {
      const p = find(s.publicacoes, publicationId);
      unlocked(p.aulaId);
      s.sessoes = s.sessoes.filter((v) => v.publicacaoId !== p.id);
      s.publicacoes = s.publicacoes.filter((v) => v.id !== p.id);
      refreshStatus(s, find(s.aulas, p.aulaId));
    });
  });
  app.delete("/api/sessoes/:id", allow("psicologo"), async (req, res) => {
    const sessionId = id.parse(req.params.id);
    await remove(req, res, (s) => {
      find(s.sessoes, sessionId);
      s.sessoes = s.sessoes.filter((v) => v.id !== sessionId);
    });
  });
  app.delete("/api/alunos/:id", allow("cadastro"), async (req, res) => {
    const studentId = id.parse(req.params.id);
    await remove(req, res, (s) => {
      const student = find(s.alunos, studentId);
      const affectedLessons = new Set(
        s.publicacoes
          .filter((p) => p.alunoId === studentId)
          .map((p) => p.aulaId),
      );
      for (const lesson of s.aulas)
        if (lesson.turmaId === student.turmaId) unlocked(lesson.id);
      s.alunos = s.alunos.filter((a) => a.id !== studentId);
      s.sessoes = s.sessoes.filter((v) => v.alunoId !== studentId);
      s.publicacoes = s.publicacoes.filter((v) => v.alunoId !== studentId);
      s.observacoes = s.observacoes.filter((v) => v.alunoId !== studentId);
      s.notas = s.notas.filter((v) => v.alunoId !== studentId);
      s.geracoes = s.geracoes.filter((v) => v.alunoId !== studentId);
      for (const lesson of s.aulas) {
        const affected =
          !!lesson.gerados[studentId] || affectedLessons.has(lesson.id);
        delete lesson.gerados[studentId];
        if (lesson.planejamentos) delete lesson.planejamentos[studentId];
        if (affected) refreshStatus(s, lesson);
      }
    });
  });
  for (const [route, collection, role, field] of [
    ["observacoes", "observacoes", "responsavel", "id"],
    ["notas", "notas", "psicologo", "id"],
    ["geracoes", "geracoes", "ia", "jobId"],
  ]) {
    app.delete(`/api/${route}/:id`, allow(role), async (req, res) => {
      const recordId = id.parse(req.params.id);
      await remove(req, res, (s) => {
        const record = s[collection].find((v) => v[field] === recordId);
        if (!record) fail(404, "Registro não encontrado.");
        if (record.aulaId) unlocked(record.aulaId);
        s[collection] = s[collection].filter((v) => v[field] !== recordId);
      });
    });
  }
}
