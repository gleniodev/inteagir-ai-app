import { createHash } from "node:crypto";
import { compilePrompt } from "./prompt.js";
import { creativePlan } from "../../shared/planning.js";
import { GenerationError } from "./hermes-text.js";
import {
  prepareVisualMaterials,
  isVisualMaterial,
} from "./visual-materials.js";

export const contextKey = (prompt) =>
  createHash("sha256").update(JSON.stringify(prompt)).digest("hex");
export function currentPlan(lesson, studentId, prompt) {
  const saved = lesson.planejamentos?.[studentId];
  return saved?.contexto === contextKey(prompt) ? saved : null;
}
export const publicPlan = ({ assuntos, revisao }) => ({ assuntos, revisao });
export class PlanningConflict extends GenerationError {}

export async function preparePlan({
  store,
  lessonId,
  studentId,
  textAdapter,
  uploadsDir,
  force = false,
}) {
  const snapshot = store.read();
  const lesson = snapshot.aulas.find((a) => a.id === lessonId);
  const student = snapshot.alunos.find((a) => a.id === studentId);
  const prompt = compilePrompt(snapshot, lesson, student);
  const existing = currentPlan(lesson, studentId, prompt);
  if (existing && !force) return existing;
  if (!textAdapter?.plan)
    throw new GenerationError(
      "Planejamento indisponível. Configure e verifique o Hermes no servidor.",
    );
  const materials = snapshot.materiais.filter((m) =>
    lesson.materiais.includes(m.id),
  );
  if (
    !materials.length ||
    materials.some((m) => m.status !== "lido" && !isVisualMaterial(m))
  )
    throw new GenerationError(
      "Envie material legível antes de preparar o prompt criativo.",
    );
  const assuntos = [];
  for (const assunto of lesson.assuntos) {
    const images = await prepareVisualMaterials({
      materials,
      uploadsDir,
      assuntoId: assunto.id,
    });
    const result = await textAdapter.plan({ prompt, assunto, images });
    assuntos.push(result.doc);
  }
  const validated = creativePlan.parse({ assuntos });
  return store.update((s) => {
    const current = s.aulas.find((a) => a.id === lessonId);
    if (
      contextKey(
        compilePrompt(
          s,
          current,
          s.alunos.find((a) => a.id === studentId),
        ),
      ) !== contextKey(prompt)
    )
      throw new PlanningConflict(
        "Materiais, aula, perfil ou diretrizes mudaram. Prepare o prompt novamente.",
      );
    current.planejamentos ??= {};
    const saved = {
      ...validated,
      contexto: contextKey(prompt),
      revisao: (current.planejamentos[studentId]?.revisao ?? 0) + 1,
    };
    current.planejamentos[studentId] = saved;
    delete current.gerados[studentId];
    return saved;
  });
}
