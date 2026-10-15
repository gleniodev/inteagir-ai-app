import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

let locks = 0;
let previousOverflow = "";

export default function Modal({
  title,
  children,
  onClose,
  fullscreen = false,
  closeDisabled = false,
}) {
  const ref = useRef(null);
  const heading = useRef(null);
  const titleId = useId();
  useEffect(() => {
    const dialog = ref.current;
    const previousFocus = document.activeElement;
    if (locks++ === 0) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    dialog.showModal();
    heading.current.focus();
    return () => {
      dialog.close();
      if (--locks === 0) document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
      else document.getElementById("conteudo")?.focus();
    };
  }, []);
  return createPortal(
    <dialog
      ref={ref}
      className={`app-modal ${fullscreen ? "fullscreen-modal" : "waiting-modal"}`}
      aria-labelledby={titleId}
      onCancel={(event) => {
        event.preventDefault();
        if (!closeDisabled) onClose?.();
      }}
    >
      <header className="modal-heading">
        <h2 id={titleId} tabIndex={-1} ref={heading}>
          {title}
        </h2>
        {onClose && (
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={closeDisabled}
            aria-label="Fechar apresentação"
          >
            <X size={20} aria-hidden="true" />
            Fechar
          </button>
        )}
      </header>
      <div className="modal-content">{children}</div>
    </dialog>,
    document.body,
  );
}
