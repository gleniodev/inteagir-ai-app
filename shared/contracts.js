import { z } from "zod";

// Conteúdo é sempre texto. Dados gerados nunca são HTML executável.
export const text = (max = 2000) =>
  z
    .string()
    .trim()
    .min(1)
    .max(max)
    .refine((v) => !/[<>\u0000-\u0008]/.test(v), "Use texto sem tags HTML.");
const optionalText = (max) => z.union([text(max), z.literal("")]);
export const preferences = z
  .object({
    interesses: z
      .array(
        z.enum([
          "dinossauros",
          "animais",
          "trens",
          "esportes",
          "espaço",
          "jogos",
          "outro",
        ]),
      )
      .max(7),
    estiloVisual: z
      .enum([
        "fotos reais",
        "desenhos",
        "ícones simples",
        "só texto",
        "tanto faz",
      ])
      .nullable(),
    explicacao: z
      .enum(["ler", "ouvir", "ver exemplos", "combinação"])
      .nullable(),
    texto: z.enum(["curto", "completo", "tanto faz"]).nullable(),
    evitar: z
      .array(
        z.enum([
          "sons",
          "movimentos",
          "muitos elementos",
          "cores intensas",
          "nada",
          "não sei",
        ]),
      )
      .max(6),
    tipoResposta: z
      .enum(["alternativas", "seleção em imagem", "digitar"])
      .nullable(),
    ajuda: z.enum(["dica", "outro exemplo", "repetir", "pausa"]).nullable(),
    feedback: z
      .enum(["mensagem curta", "explicação", "imagem discreta"])
      .nullable(),
    progresso: z.enum(["sim", "não", "tanto faz"]).nullable(),
    observacoes: optionalText(1000),
  })
  .strict();
export const studentInput = z
  .object({
    nome: text(100),
    turmaId: z.literal("9C"),
    responsavelId: z.literal("R01"),
    email: z.union([
      z.literal(""),
      z
        .string()
        .email()
        .max(150)
        .refine(
          (v) => v.endsWith("@example.com"),
          "Use e-mail fictício @example.com.",
        ),
    ]),
    ficticio: z.literal(true),
    preferencias: preferences,
  })
  .strict();
export const subjectInput = z
  .object({ titulo: text(120), descricao: text(4000), objetivo: text(1000) })
  .strict();
export const lessonInput = z
  .object({
    disciplina: z.enum(["Matemática", "História"]),
    titulo: text(150),
    descricao: optionalText(4000),
    turmaId: z.literal("9C"),
    assuntos: z.array(subjectInput).min(1).max(8),
  })
  .strict();
export const lessonUpdateInput = lessonInput.extend({
  assuntos: z
    .array(subjectInput.extend({ id: z.string().uuid().optional() }))
    .min(1)
    .max(8),
});
const imageInput = z
  .object({
    necessaria: z.boolean(),
    pedido: optionalText(2000),
    alt: optionalText(500),
    arquivo: z.string().max(300).nullable(),
  })
  .strict();
const explanation = z
  .object({
    id: text(80),
    tipo: z.literal("explicacao"),
    titulo: text(150),
    texto: text(6000),
    imagem: imageInput,
  })
  .strict();
const question = z
  .object({
    id: text(80),
    tipo: z.literal("questao"),
    enunciado: text(1500),
    alternativas: z
      .array(text(500))
      .length(3)
      .refine(
        (a) => new Set(a.map((v) => v.toLocaleLowerCase("pt-BR"))).size === 3,
        "Alternativas devem ser distintas.",
      ),
    indiceCorreto: z.number().int().min(0).max(2),
    dica: text(1000),
    feedbackAcerto: text(1000),
    explicacao: text(2000),
  })
  .strict();
export const generatedSubject = z
  .object({
    versaoEsquema: z.literal("1.0"),
    assuntoId: text(80),
    titulo: text(150),
    objetivo: text(1000),
    observacoesParaProfessor: z.array(text(2000)).max(20),
    etapas: z
      .array(z.discriminatedUnion("tipo", [explanation, question]))
      .min(4)
      .max(20),
  })
  .strict()
  .superRefine((v, c) => {
    if (v.etapas.filter((e) => e.tipo === "questao").length !== 3)
      c.addIssue({
        code: "custom",
        message: "Exatamente três questões são obrigatórias.",
      });
    if (!v.etapas.some((e) => e.tipo === "explicacao"))
      c.addIssue({ code: "custom", message: "Uma explicação é obrigatória." });
    if (new Set(v.etapas.map((e) => e.id)).size !== v.etapas.length)
      c.addIssue({ code: "custom", message: "IDs de etapas repetidos." });
    for (const e of v.etapas)
      if (
        e.tipo === "explicacao" &&
        e.imagem.necessaria &&
        (!e.imagem.alt || !e.imagem.pedido)
      )
        c.addIssue({
          code: "custom",
          message: "Imagem necessária exige descrição e pedido.",
        });
  });
export const reviewInput = z
  .object({
    alunoId: z.string().uuid(),
    revisao: z
      .object({
        conceitos: z.literal(true),
        imagem: z.literal(true),
        questoes: z.literal(true),
        leitura: z.literal(true),
        preferencias: z.literal(true),
      })
      .strict(),
  })
  .strict();
export const eventInput = z
  .object({
    eventId: z.string().uuid(),
    tipo: z.enum([
      "resposta",
      "dica",
      "avancar",
      "pausar",
      "retomar",
      "tempo",
      "feedback",
    ]),
    etapaId: z.string().max(160).optional(),
    alternativa: z.number().int().min(0).max(2).optional(),
    avaliacao: z
      .enum(["Gostei", "Mais ou menos", "Não gostei", "Prefiro não responder"])
      .optional(),
  })
  .strict();
