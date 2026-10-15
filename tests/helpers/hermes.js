import { createServer } from "node:http";
import { once } from "node:events";
import { fractions } from "../../fixtures/fractions.js";
import { createHermesText } from "../../server/services/hermes-text.js";

// Dublê HTTP de protocolo: não executa Hermes, Codex, login ou inferência real.
export async function hermesServer(t) {
  const control = {
    toolsets: [],
    status: 200,
    provider: "openai-codex",
    finish: "stop",
    model: "modelo-teste",
    beforeReply: null,
    mutate: null,
    mutatePlanning: null,
    rawResponse: null,
    redirect: null,
  };
  const requests = [];
  const server = createServer(async (req, res) => {
    let body = "";
    for await (const chunk of req) body += chunk;
    const payload = body ? JSON.parse(body) : null;
    requests.push({
      url: req.url,
      payload,
      authorization: req.headers.authorization,
    });
    res.setHeader("Content-Type", "application/json");
    if (req.url === "/v1/toolsets")
      return res.end(
        JSON.stringify({
          object: "list",
          platform: "api_server",
          data: control.toolsets,
        }),
      );
    if (req.url === "/api/sessions")
      return res.end(JSON.stringify({ id: payload.id }));
    if (!/^\/api\/sessions\/inteagir_[a-f0-9-]+\/chat$/.test(req.url)) {
      res.statusCode = 404;
      return res.end("{}");
    }
    if (control.beforeReply) await control.beforeReply();
    if (control.redirect) {
      res.statusCode = 302;
      res.setHeader("Location", control.redirect);
      return res.end();
    }
    res.statusCode = control.status;
    if (control.status !== 200)
      return res.end(
        JSON.stringify({
          error: "raw upstream secret/path must never reach logs",
        }),
      );
    if (control.rawResponse !== null) return res.end(control.rawResponse);
    const data = JSON.parse(
      Array.isArray(payload.message)
        ? payload.message[0].text
        : payload.message,
    );
    const planning = data.fase === "planejamento";
    const doc = planning
      ? {
          assuntoId: data.assuntoAtual.id,
          compreensao:
            "Frações representam partes iguais. Use os materiais anexados como referência.",
          abordagem:
            "Use vagões de trem em partes iguais como analogia, preservando o conceito.",
          explicacao:
            "Explique o numerador e denominador, depois mostre equivalência.",
          imagens:
            "Considere a preferência visual do aluno ao propor ilustrações.",
          questoes:
            "Crie três questões de três alternativas com dica e gabarito.",
          cuidados:
            "Não diagnosticar; revisar precisão e fontes com o professor.",
        }
      : fractions(data.assuntoAtual, "trens");
    if (!planning && data.prompt.preferenciasAluno?.estiloVisual === "só texto")
      doc.etapas[0].imagem = {
        necessaria: false,
        pedido: "",
        alt: "",
        arquivo: null,
      };
    if (planning) control.mutatePlanning?.(doc, data);
    else control.mutate?.(doc, data);
    res.end(
      JSON.stringify({
        object: "hermes.session.chat.completion",
        session_id: req.url.split("/")[3],
        runtime: {
          provider: control.provider,
          model: control.model,
          model_lock: control.finish === "stop" ? "confirmed" : "accepted",
        },
        message: { content: JSON.stringify(doc) },
      }),
    );
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve, reject) => {
        server.close((e) => (e ? reject(e) : resolve()));
        server.closeAllConnections();
      }),
  );
  const options = {
    url: `http://127.0.0.1:${server.address().port}`,
    token: "test-only-not-a-real-token",
    model: control.model,
  };
  return { control, requests, options, adapter: createHermesText(options) };
}
