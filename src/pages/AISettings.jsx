import { useState } from "react";
import { Settings, ClipboardList } from "lucide-react";
import { api } from "../services/api.js";
import {
  Card,
  Message,
  useData,
  DataState,
  Tag,
  Empty,
  formatDate,
} from "../components/UI.jsx";
export default function AISettings() {
  const state = useData("/ia/status");
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function test(tipo) {
    setBusy(true);
    setError("");
    try {
      await api("/ia/testar", { method: "POST", body: { tipo } });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
      state.reload();
    }
  }
  return (
    <>
      <Card title="Estado dos adaptadores" icon={Settings}>
        <DataState {...state} retry={state.reload} />
        <p>
          Configuração v{state.data?.configVersion ?? "—"} · Prompt-base v
          {state.data?.promptBaseVersion ?? "—"}
        </p>
        <p>
          As diretrizes são editadas somente na{" "}
          <a href="#psicologo">área do psicólogo</a>.
        </p>
        {state.data?.adaptadores.map((a) => (
          <div className="list-row" key={a.nome}>
            <strong>{a.nome}</strong>
            <Tag>{a.status}</Tag>
          </div>
        ))}
        <Message error={error} />
        <div className="actions flex-wrap mt-5">
          <button disabled={busy} onClick={() => test("texto")}>
            Testar texto JSON
          </button>
          <button
            disabled={busy}
            className="secondary"
            onClick={() => test("imagem")}
          >
            Testar geração PNG/WebP
          </button>
          <button
            disabled={busy}
            className="secondary"
            onClick={() => test("fallback")}
          >
            Testar fallback
          </button>
        </div>
        <p className="warning-note mt-5">
          Sem adaptador configurado, o teste registra indisponibilidade e não
          chama um provedor. A imagem de contingência foi pré-gerada; não
          comprova geração pelo backend.
        </p>
      </Card>
      <Card title="Registros sanitizados" icon={ClipboardList} className="mt-5">
        {state.data?.registros.length === 0 && (
          <Empty>Nenhum teste registrado.</Empty>
        )}
        {state.data?.registros
          .slice()
          .reverse()
          .map((r) => (
            <div className="review-step" key={r.jobId}>
              <strong>
                {r.tipo} · {r.resultado}
              </strong>
              <p>{r.mensagem}</p>
              <small>
                {r.adaptador} · {formatDate(r.criadoEm)} · {r.duracaoMs} ms ·
                fallback: {r.fallbackUsado ? "sim" : "não"}
              </small>
            </div>
          ))}
      </Card>
    </>
  );
}
