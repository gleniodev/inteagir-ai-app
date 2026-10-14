import { useState, useEffect, useId, cloneElement } from "react";
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { api } from "../services/api.js";

export function Card({
  title,
  icon: Icon = BookOpen,
  children,
  className = "",
}) {
  return (
    <section className={`card ${className}`}>
      <h2>
        <Icon size={25} aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}
export function Field({ label, children, hint }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {cloneElement(children, {
        id,
        "aria-describedby": hint ? `${id}-hint` : undefined,
      })}
      {hint && <small id={`${id}-hint`}>{hint}</small>}
    </div>
  );
}
export function Message({ error, success }) {
  return error ? (
    <div className="message error" role="alert">
      <AlertCircle size={20} />
      <span>{error}</span>
    </div>
  ) : success ? (
    <div className="message success" role="status">
      <CheckCircle2 size={20} />
      <span>{success}</span>
    </div>
  ) : null;
}
export function Loading() {
  return (
    <p className="message" role="status">
      <LoaderCircle size={20} />
      Carregando dados…
    </p>
  );
}
export function Empty({ children }) {
  return <div className="empty">{children}</div>;
}
export function Tag({ children }) {
  return <span className="tag">{children}</span>;
}
export function useData(url) {
  const [state, set] = useState({ data: null, loading: true, error: "" });
  const [version, reload] = useState(0);
  useEffect(() => {
    let active = true;
    if (!url) {
      set({ data: null, loading: false, error: "" });
      return;
    }
    set({ data: null, loading: true, error: "" });
    api(url)
      .then((data) => {
        if (active) set({ data, loading: false, error: "" });
      })
      .catch((e) => {
        if (active) set({ data: null, loading: false, error: e.message });
      });
    return () => {
      active = false;
    };
  }, [url, version]);
  return { ...state, reload: () => reload((v) => v + 1) };
}
export function DataState({ loading, error, retry }) {
  return loading ? (
    <Loading />
  ) : error ? (
    <>
      <Message error={error} />
      <button className="secondary" onClick={retry}>
        Tentar novamente
      </button>
    </>
  ) : null;
}
export function StudentSelect({ students, value, onChange }) {
  return (
    <Field label="Perfil fictício">
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">Selecione um aluno</option>
        {students?.map((a, i) => (
          <option
            key={a.id}
            value={a.id}
          >{`A${String(i + 1).padStart(2, "0")} — ${a.nome} / 9º ano C`}</option>
        ))}
      </select>
    </Field>
  );
}
export const formatDate = (value) => new Date(value).toLocaleString("pt-BR");
export const materialStatus = {
  lido: "Lido",
  necessita_revisao: "Necessita revisão",
  erro: "Erro",
};
export const lessonStatus = {
  rascunho: "Rascunho",
  para_revisar: "Para revisar",
  publicada: "Publicada",
  falha_geracao: "Falha de geração",
};
