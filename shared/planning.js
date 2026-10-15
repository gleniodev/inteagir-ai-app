import { z } from "zod";
import { text } from "./contracts.js";

export const creativeSubject = z
  .object({
    assuntoId: z.string().uuid(),
    compreensao: text(6000),
    abordagem: text(4000),
    explicacao: text(4000),
    imagens: text(3000),
    questoes: text(3000),
    cuidados: text(3000),
  })
  .strict();
export const creativePlan = z
  .object({
    assuntos: z.array(creativeSubject).min(1).max(8),
  })
  .strict();
