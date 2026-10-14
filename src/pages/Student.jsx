import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  Pause,
  Play,
  CircleHelp,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { api } from "../services/api.js";
import {
  Card,
  Message,
  useData,
  DataState,
  Empty,
  StudentSelect,
  Tag,
} from "../components/UI.jsx";

export default function Student() {
  const students = useData("/alunos?turmaId=9C");
  const [studentId, setStudentId] = useState(""),
    [session, setSession] = useState(null),
    [option, setOption] = useState(null),
    [feedback, setFeedback] = useState(null),
    [hint, setHint] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false),
    [imageError, setImageError] = useState(false);
  const publications = useData(
    studentId ? `/publicacoes?alunoId=${studentId}` : null,
  );
  const live = useRef(session);
  live.current = session;
  function applySession(next) {
    setSession((current) =>
      !current ||
      (current.id === next.id &&
        (next.revisaoEventos ?? 0) >= (current.revisaoEventos ?? 0))
        ? next
        : current,
    );
  }
  useEffect(() => {
    setOption(null);
    setFeedback(null);
    setHint("");
    setImageError(false);
  }, [session?.indice, session?.id]);
  useEffect(() => {
    if (!session?.id) return;
    let active = true,
      visibilityPaused = false;
    async function pulse(tipo) {
      const current = live.current;
      if (!current || current.concluida) return;
      try {
        const result = await api(`/sessoes/${current.id}/eventos`, {
          method: "POST",
          body: { eventId: crypto.randomUUID(), tipo },
        });
        if (active) applySession(result.sessao);
      } catch (e) {
        if (active) setError(e.message);
      }
    }
    const timer = setInterval(() => {
      if (document.visibilityState === "visible" && !live.current?.pausada)
        pulse("tempo");
    }, 10000);
    const visibility = () => {
      if (document.visibilityState === "hidden" && !live.current?.pausada) {
        visibilityPaused = true;
        pulse("pausar");
      } else if (document.visibilityState === "visible" && visibilityPaused) {
        visibilityPaused = false;
        pulse("retomar");
      }
    };
    document.addEventListener("visibilitychange", visibility);
    return () => {
      active = false;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [session?.id]);
  async function start(id) {
    setBusy(true);
    setError("");
    try {
      setSession(
        await api("/sessoes", { method: "POST", body: { publicacaoId: id } }),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  async function send(tipo, extra = {}) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api(`/sessoes/${session.id}/eventos`, {
        method: "POST",
        body: {
          eventId: crypto.randomUUID(),
          tipo,
          ...(session.etapa ? { etapaId: session.etapa.chave } : {}),
          ...extra,
        },
      });
      applySession(result.sessao);
      if (result.feedback) setFeedback(result.feedback);
      if (result.dica) setHint(result.dica);
      if (tipo === "feedback") setSuccess("Sua opinião foi salva.");
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  const student = students.data?.find((s) => s.id === studentId);
  const step = session?.etapa;
  const answered = step && session.respostas[step.chave]?.correta;
  return (
    <>
      <DataState {...students} retry={students.reload} />
      {!session && (
        <Card title="Perfil da demonstração">
          <StudentSelect
            students={students.data}
            value={studentId}
            onChange={(id) => {
              setStudentId(id);
              setSession(null);
              setError("");
              setSuccess("");
            }}
          />
          {students.data?.length === 0 && (
            <Empty>
              Não há perfis. <a href="#cadastro">Cadastrar aluno fictício</a>
            </Empty>
          )}
        </Card>
      )}
      {session && <p className="muted">Perfil fictício: {student?.nome}</p>}
      <Message error={error} success={success} />
      {studentId && !session && (
        <Card title="Aulas publicadas" className="mt-5">
          <DataState {...publications} retry={publications.reload} />
          {publications.data?.length === 0 && (
            <Empty>
              Ainda não há aulas publicadas para este perfil. O professor
              precisa revisar e publicar.
            </Empty>
          )}
          {publications.data?.map((p) => (
            <div key={p.id} className="list-row">
              <div>
                <h3>{p.titulo}</h3>
                <p>
                  {p.disciplina} · Versão {p.versao}
                </p>
                <Tag>{p.origem}</Tag>
              </div>
              <button disabled={busy} onClick={() => start(p.id)}>
                {p.sessao?.concluida
                  ? "Ver conclusão"
                  : p.sessao
                    ? "Continuar"
                    : "Começar"}
              </button>
            </div>
          ))}
        </Card>
      )}
      {session && (
        <Card
          title={session.titulo}
          icon={BookOpen}
          className={`mt-5 lesson ${student?.preferencias.evitar.includes("muitos elementos") ? "quiet" : ""}`}
        >
          <Tag>{session.origem}</Tag>
          {!session.concluida && student?.preferencias.progresso !== "não" && (
            <>
              <p className="mt-4">
                Etapa {session.indice + 1} de {session.totalEtapas}
              </p>
              <progress
                value={session.indice}
                max={session.totalEtapas}
                aria-label="Etapas concluídas"
              />
            </>
          )}
          {session.concluida ? (
            <>
              <div className="completion">
                <CheckCircle2 size={44} />
                <h3>
                  Você concluiu {session.totalEtapas} de {session.totalEtapas}{" "}
                  atividades
                </h3>
                <p>Como foi esta aula? Você pode preferir não responder.</p>
              </div>
              <div className="actions flex-wrap justify-center">
                {[
                  "Gostei",
                  "Mais ou menos",
                  "Não gostei",
                  "Prefiro não responder",
                ].map((v) => (
                  <button
                    key={v}
                    disabled={busy}
                    className={session.avaliacao === v ? "" : "secondary"}
                    onClick={() => send("feedback", { avaliacao: v })}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <p className="mt-5">
                Avaliação registrada: {session.avaliacao ?? "Sem resposta"}
              </p>
              <button
                className="secondary"
                onClick={() => {
                  setSession(null);
                  publications.reload();
                }}
              >
                Voltar às aulas
              </button>
            </>
          ) : session.pausada ? (
            <div className="empty">
              <h3>Sessão em pausa</h3>
              <p>
                Seu progresso está salvo. O tempo da pausa não é contado como
                uso.
              </p>
              <button disabled={busy} onClick={() => send("retomar")}>
                <Play size={18} />
                Retomar
              </button>
            </div>
          ) : (
            step && (
              <>
                <div className="lesson-content">
                  <p className="muted">{step.assunto}</p>
                  {step.tipo === "explicacao" ? (
                    <>
                      <h3>{step.titulo}</h3>
                      <p
                        className={
                          student?.preferencias.texto === "curto"
                            ? "short-text"
                            : ""
                        }
                      >
                        {step.texto}
                      </p>
                      {step.imagem.necessaria && (
                        <figure>
                          <img
                            src={"/api/media/" + step.imagem.arquivo}
                            alt={step.imagem.alt}
                            onError={() => setImageError(true)}
                            hidden={imageError}
                          />
                          {imageError ? (
                            <Message error="A imagem não pôde ser carregada. Verifique a conexão e tente novamente." />
                          ) : (
                            <figcaption>{step.imagem.alt}</figcaption>
                          )}
                          {imageError && (
                            <button
                              className="secondary"
                              onClick={() => setImageError(false)}
                            >
                              Tentar carregar imagem
                            </button>
                          )}
                        </figure>
                      )}
                    </>
                  ) : (
                    <>
                      <fieldset>
                        <legend>{step.enunciado}</legend>
                        <div className="choices vertical">
                          {step.alternativas.map((v, i) => (
                            <label
                              key={v}
                              className={`choice ${option === i ? "selected" : ""}`}
                            >
                              <input
                                type="radio"
                                name="resposta"
                                disabled={answered || busy}
                                checked={option === i}
                                onChange={() => {
                                  setOption(i);
                                  setFeedback(null);
                                }}
                              />
                              {v}
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      {feedback && (
                        <div
                          className={`message ${feedback.correta ? "success" : "info"}`}
                          role="status"
                        >
                          {feedback.texto}
                        </div>
                      )}
                      {answered && !feedback && (
                        <Message success="Resposta correta salva. Você pode continuar." />
                      )}
                      {hint && (
                        <div className="info-panel" role="status">
                          Dica: {hint}
                        </div>
                      )}
                      <div className="actions flex-wrap mt-5">
                        <button
                          className="secondary"
                          disabled={busy}
                          onClick={() => send("dica")}
                        >
                          <CircleHelp size={18} />
                          Preciso de ajuda
                        </button>
                        {!answered && (
                          <button
                            disabled={busy || option === null}
                            onClick={() =>
                              send("resposta", { alternativa: option })
                            }
                          >
                            Responder
                          </button>
                        )}
                        {feedback && !feedback.correta && (
                          <button
                            className="text-button"
                            onClick={() => {
                              setOption(null);
                              setFeedback(null);
                            }}
                          >
                            Tentar novamente
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="actions flex-wrap">
                  <button
                    className="secondary"
                    disabled={busy}
                    onClick={() => send("pausar")}
                  >
                    <Pause size={18} />
                    Pausa
                  </button>
                  <button
                    disabled={
                      busy ||
                      imageError ||
                      (step.tipo === "questao" && !answered)
                    }
                    onClick={() => send("avancar")}
                  >
                    Próximo
                    <ArrowRight size={18} />
                  </button>
                </div>
              </>
            )
          )}
          <button
            className="text-button mt-5"
            disabled={busy}
            onClick={async () => {
              if (!session.concluida && !session.pausada) await send("pausar");
              setSession(null);
              publications.reload();
            }}
          >
            Voltar às aulas
          </button>
        </Card>
      )}
    </>
  );
}
