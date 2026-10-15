import sharp from "sharp";
import { GenerationError } from "./hermes-text.js";

// Não instala provedores, não lê OAuth e não habilita a integração bloqueada agy.
// Os dois adaptadores devem ser fornecidos após verificação do acesso permitido.
export function createImageFallback({ primary = null, fallback = null } = {}) {
  const states = [primary, fallback].map((a) =>
    a ? "Não verificado" : "Não configurado",
  );
  let busy = false;
  return {
    supportsFallback: Boolean(fallback),
    name: fallback
      ? "OpenAI → Nano Banana 2 (imagem, OAuth)"
      : (primary?.name ?? "OpenAI (imagem, OAuth)"),
    status: () => states[0],
    fallbackStatus: () => states[1],
    async generate({ pedido, fallbackOnly = false }) {
      if (typeof pedido !== "string" || !pedido.trim() || pedido.length > 6000)
        throw new GenerationError("Pedido de imagem inválido.");
      if (busy)
        throw new GenerationError("Aguarde a geração de imagem em andamento.");
      busy = true;
      const attempts = [];
      try {
        for (const index of fallbackOnly ? [1] : [0, 1]) {
          const adapter = [primary, fallback][index];
          const started = Date.now();
          if (!adapter) {
            attempts.push({
              papel: index ? "reserva" : "primaria",
              resultado: "não_configurado",
              duracaoMs: 0,
            });
            continue;
          }
          try {
            const result = await adapter.generate({ pedido });
            if (
              (index === 0 && result?.provider !== "openai-codex") ||
              (index === 1 &&
                (!["google", "gemini"].includes(result?.provider) ||
                  result?.model !== "gemini-3.1-flash-image"))
            )
              throw new Error();
            if (
              !Buffer.isBuffer(result?.bytes) ||
              result.bytes.length === 0 ||
              result.bytes.length > 10 * 1024 * 1024 ||
              typeof result.provider !== "string" ||
              !/^[a-zA-Z0-9._-]{1,80}$/.test(result.provider) ||
              (result.model !== undefined &&
                !/^[a-zA-Z0-9._/-]{1,128}$/.test(result.model))
            )
              throw new Error();
            const image = sharp(result.bytes, {
              limitInputPixels: 16000000,
              animated: false,
            });
            const meta = await image.metadata();
            if (
              !["png", "webp"].includes(meta.format) ||
              meta.width < 64 ||
              meta.height < 64 ||
              meta.pages > 1
            )
              throw new Error();
            // Decodificar todos os pixels: metadata sozinha não detecta PNG truncado.
            const bytes = await image.png().toBuffer();
            if (bytes.length > 10 * 1024 * 1024) throw new Error();
            states[index] = "Funcionando";
            attempts.push({
              papel: index ? "reserva" : "primaria",
              resultado: "sucesso",
              duracaoMs: Date.now() - started,
            });
            return {
              bytes,
              provider: result.provider,
              model: result.model,
              fallbackUsado: index === 1,
              tentativas: attempts,
            };
          } catch {
            states[index] = "Falha";
            attempts.push({
              papel: index ? "reserva" : "primaria",
              resultado: "falha",
              duracaoMs: Date.now() - started,
            });
          }
        }
        const error = new GenerationError(
          "Não foi possível obter uma imagem válida pelos provedores OAuth. Nenhum conteúdo incompleto foi publicado.",
        );
        error.tentativas = attempts;
        throw error;
      } finally {
        busy = false;
      }
    },
  };
}
