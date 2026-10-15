import { useState } from "react";
import { Trash2 } from "lucide-react";
import Modal from "./Modal.jsx";
import { Message } from "./UI.jsx";
import { api } from "../services/api.js";

export default function DeleteButton({
  url,
  title,
  description,
  label = "Excluir",
  onDeleted,
  disabled = false,
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  async function confirm() {
    setBusy(true);
    setError("");
    try {
      const response = await api(url, {
        method: "DELETE",
        body: { confirmacao: "excluir" },
      });
      if (response.arquivosPendentes) setResult(response);
      else {
        setOpen(false);
        onDeleted?.();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function close() {
    setOpen(false);
    if (result) onDeleted?.();
  }
  return (
    <>
      <button
        type="button"
        className="secondary"
        disabled={disabled}
        onClick={() => {
          setOpen(true);
          setError("");
          setResult(null);
        }}
        aria-label={`${label}: ${title}`}
      >
        <Trash2 size={17} aria-hidden="true" />
        {label}
      </button>
      {open && (
        <Modal title={`Excluir ${title}?`} onClose={close} closeDisabled={busy}>
          <p>{description}</p>
          <p>Esta ação não pode ser desfeita pelo aplicativo.</p>
          <Message error={error} />
          {result ? (
            <>
              <p role="status">{result.mensagem}</p>
              <button onClick={close}>Entendi</button>
            </>
          ) : (
            <div className="actions flex-wrap mt-5">
              <button
                type="button"
                className="secondary"
                disabled={busy}
                onClick={close}
              >
                Cancelar
              </button>
              <button type="button" disabled={busy} onClick={confirm}>
                {busy ? "Excluindo…" : "Confirmar exclusão"}
              </button>
            </div>
          )}
        </Modal>
      )}
    </>
  );
}
