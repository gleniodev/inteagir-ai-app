import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  CircleHelp,
  ClipboardList,
  Brain,
  Save,
} from "lucide-react";
import { api } from "../services/api.js";
import DeleteButton from "../components/DeleteButton.jsx";
import {
  Card,
  Field,
  Message,
  useData,
  DataState,
  Empty,
  StudentSelect,
  Tag,
  ContentOrigin,
  formatDate,
} from "../components/UI.jsx";

function Guidelines() {
  const versions = useData("/diretrizes");
  const [draft, setDraft] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (versions.data?.length) setDraft(versions.data.at(-1).texto);
  }, [versions.data]);
  async function save(texto) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const v = await api("/diretrizes", { method: "POST", body: { texto } });
      versions.reload();
      setSuccess(
        `Diretrizes salvas como versão ${v.versao}. As aulas publicadas preservam a versão anterior.`,
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <Card title="Diretrizes de adaptação" icon={Brain} className="mt-5">
      <DataState {...versions} retry={versions.reload} />
      <Tag>Versão atual: {versions.data?.at(-1)?.versao ?? "—"}</Tag>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(draft);
        }}
      >
        <Field label="Prompt-base aprovado">
          <textarea
            required
            rows={7}
            maxLength={8000}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </Field>
        <div className="actions flex-wrap">
          <button disabled={busy || versions.loading}>
            <Save size={18} />
            Salvar nova versão
          </button>
          <button
            type="button"
            className="secondary"
            disabled={busy || (versions.data?.length ?? 0) < 2}
            onClick={() => save(versions.data.at(-2).texto)}
          >
            Restaurar versão anterior
          </button>
        </div>
      </form>
      <Message error={error} success={success} />
      <details className="mt-5">
        <summary>Histórico de versões</summary>
        {versions.data?.map((v) => (
          <p key={v.versao}>
            Versão {v.versao} · {formatDate(v.criadoEm)}
          </p>
        ))}
      </details>
    </Card>
  );
}
export default function Reports({ psychologist }) {
  const students = useData("/alunos?turmaId=9C");
  const [studentId, setStudentId] = useState(""),
    [tab, setTab] = useState("acompanhamento"),
    [observation, setObservation] = useState(""),
    [category, setCategory] = useState(""),
    [note, setNote] = useState(""),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [busy, setBusy] = useState(false);
  const report = useData(studentId ? `/relatorios/${studentId}` : null);
  const sessions = report.data?.sessoes ?? [];
  const completed = sessions.reduce(
      (n, s) => n + (s.etapasConcluidas ?? s.indice),
      0,
    ),
    total = (report.data?.conteudos ?? []).reduce(
      (n, c) => n + c.totalEtapas,
      0,
    ),
    helps = sessions.reduce(
      (n, s) =>
        n + Object.values(s.respostas).reduce((n, r) => n + r.ajudas, 0),
      0,
    ),
    first = sessions.reduce(
      (n, s) =>
        n + Object.values(s.respostas).filter((r) => r.firstTryCorrect).length,
      0,
    ),
    visibleMs = sessions.reduce((n, s) => n + s.tempoVisivelMs, 0);
  async function submit(e, isNote) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await api(isNote ? "/notas" : "/observacoes", {
        method: "POST",
        body: isNote
          ? { alunoId: studentId, texto: note }
          : {
              alunoId: studentId,
              texto: observation,
              categoria: category || null,
            },
      });
      if (isNote) setNote("");
      else setObservation("");
      report.reload();
      setSuccess("Registro humano salvo.");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      {psychologist && (
        <div className="tabs">
          <button
            className={tab === "acompanhamento" ? "" : "secondary"}
            onClick={() => setTab("acompanhamento")}
          >
            Acompanhamento
          </button>
          <button
            className={tab === "diretrizes" ? "" : "secondary"}
            onClick={() => setTab("diretrizes")}
          >
            Diretrizes
          </button>
        </div>
      )}
      {tab === "diretrizes" ? (
        <Guidelines />
      ) : (
        <>
          <div className="profile-toolbar report-profile">
            <DataState {...students} retry={students.reload} />
            <StudentSelect
              students={students.data}
              value={studentId}
              onChange={(id) => {
                setStudentId(id);
                setError("");
                setSuccess("");
                setObservation("");
                setNote("");
              }}
            />
            {students.data?.length === 0 && (
              <Empty>
                Nenhum perfil fictício cadastrado.{" "}
                <a href="#cadastro">Cadastrar aluno</a>
              </Empty>
            )}
          </div>
          <Message error={error} success={success} />
          {studentId && <DataState {...report} retry={report.reload} />}
          {studentId && report.data && (
            <>
              <div className="grid md:grid-cols-3 gap-5 my-5">
                <div className="stat blue">
                  <BookOpen />
                  <div>
                    <span>
                      {psychologist
                        ? "Tempo visível aproximado"
                        : "Atividades publicadas"}
                    </span>
                    <strong>
                      {psychologist
                        ? `${Math.floor(visibleMs / 60000)} min`
                        : total}
                    </strong>
                  </div>
                </div>
                <div className="stat green">
                  <CheckCircle2 />
                  <div>
                    <span>Concluídas</span>
                    <strong>
                      {completed} de {total}
                    </strong>
                  </div>
                </div>
                <div className="stat pink">
                  <CircleHelp />
                  <div>
                    <span>Ajudas solicitadas</span>
                    <strong>{helps}</strong>
                  </div>
                </div>
              </div>
              <div
                className={`reports-grid grid ${psychologist ? "psychologist xl:grid-cols-[1.45fr_1fr]" : "xl:grid-cols-[1.35fr_1fr]"} gap-5`}
              >
                <Card title="O que foi estudado" icon={BookOpen}>
                  {sessions.length === 0 && (
                    <Empty>
                      Nenhuma sessão registrada. O aluno ainda precisa abrir uma
                      aula publicada.
                    </Empty>
                  )}
                  {sessions.map((s) => (
                    <div key={s.id} className="subject-panel">
                      <h3>
                        {s.disciplina} — {s.titulo}
                      </h3>
                      <p>{s.assuntos.join(" · ")}</p>
                      <details>
                        <summary>Resumo do conteúdo publicado</summary>
                        <p className="content-summary">{s.resumo}</p>
                      </details>
                      <p>Início: {formatDate(s.iniciadoEm)}</p>
                      <p>
                        {s.etapasConcluidas ?? s.indice} de {s.totalEtapas}{" "}
                        etapas concluídas ·{" "}
                        {s.totalEtapas - (s.etapasConcluidas ?? s.indice)}{" "}
                        pendentes
                      </p>
                      <p>
                        Acertos na primeira tentativa:{" "}
                        {
                          Object.values(s.respostas).filter(
                            (r) => r.firstTryCorrect,
                          ).length
                        }{" "}
                        de {s.totalQuestoes} questões
                      </p>
                      <p>
                        Tentativas:{" "}
                        {Object.values(s.respostas).reduce(
                          (n, r) => n + r.tentativas,
                          0,
                        )}{" "}
                        · Dicas:{" "}
                        {Object.values(s.respostas).reduce(
                          (n, r) => n + r.ajudas,
                          0,
                        )}
                      </p>
                      <p>Opinião do aluno: {s.avaliacao ?? "Não informada"}</p>
                      <Tag>
                        {s.concluida
                          ? "Concluída"
                          : s.pausada
                            ? "Pausada"
                            : "Em andamento"}
                      </Tag>
                      <ContentOrigin value={s.origem} />
                      {psychologist && (
                        <DeleteButton
                          url={`/sessoes/${s.id}`}
                          title={`registro da aula “${s.titulo}”`}
                          description="Apaga esta sessão, respostas, conclusão e tempo registrado. O conteúdo publicado continua disponível para o aluno começar novamente."
                          disabled={busy}
                          onDeleted={report.reload}
                        />
                      )}
                      {psychologist && (
                        <p className="muted mt-2">
                          Diretrizes registradas na publicação: v
                          {s.promptBaseVersion}
                        </p>
                      )}
                    </div>
                  ))}
                  {report.data.conteudos
                    .filter((c) => !c.iniciada)
                    .map((c) => (
                      <div className="subject-panel" key={c.publicacaoId}>
                        <h3>
                          {c.disciplina} — {c.titulo}
                        </h3>
                        <p>
                          Disponível, ainda não iniciada · {c.totalEtapas}{" "}
                          etapas pendentes
                        </p>
                        <details>
                          <summary>Resumo do conteúdo publicado</summary>
                          <p className="content-summary">{c.resumo}</p>
                        </details>
                        <ContentOrigin value={c.origem} />
                      </div>
                    ))}
                  {psychologist && (
                    <p className="info-panel">
                      Acertos na primeira tentativa: {first}. Tempo visível é
                      aproximado; não mede foco, emoção ou aprendizagem.
                    </p>
                  )}
                </Card>
                <div className="space-y-5">
                  <Card
                    title={
                      psychologist
                        ? "Observações do responsável"
                        : "O que você observou?"
                    }
                    icon={ClipboardList}
                  >
                    {!psychologist && (
                      <form onSubmit={(e) => submit(e, false)}>
                        <Field label="Observação humana">
                          <textarea
                            rows={4}
                            required
                            maxLength={2000}
                            value={observation}
                            onChange={(e) => setObservation(e.target.value)}
                            placeholder="Descreva o que você observou, sem diagnósticos automáticos."
                          />
                        </Field>
                        <Field label="Categoria (opcional)">
                          <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                          >
                            <option value="">Sem categoria</option>
                            {[
                              "dificuldade com texto",
                              "imagem",
                              "interação",
                              "interrupção",
                              "outro",
                            ].map((v) => (
                              <option key={v}>{v}</option>
                            ))}
                          </select>
                        </Field>
                        <button disabled={busy}>Registrar observação</button>
                      </form>
                    )}
                    {report.data?.observacoes.length === 0 && (
                      <Empty>Nenhuma observação registrada.</Empty>
                    )}
                    {report.data?.observacoes.map((o) => (
                      <div key={o.id} className="review-step">
                        <p>{o.texto}</p>
                        <small>
                          {o.origem} · {formatDate(o.criadoEm)}
                          {o.categoria && ` · ${o.categoria}`}
                        </small>
                        {!psychologist && (
                          <DeleteButton
                            url={`/observacoes/${o.id}`}
                            title="observação do responsável"
                            description={`Apaga somente esta observação: “${o.texto.slice(0, 100)}”.`}
                            disabled={busy}
                            onDeleted={report.reload}
                          />
                        )}
                      </div>
                    ))}
                  </Card>
                  {psychologist && (
                    <Card title="Anotações do psicólogo" icon={Brain}>
                      <form onSubmit={(e) => submit(e, true)}>
                        <Field label="Hipótese/nota profissional — registro humano">
                          <textarea
                            required
                            rows={4}
                            maxLength={2000}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                          />
                        </Field>
                        <button disabled={busy}>Salvar anotação</button>
                      </form>
                      {report.data?.notas.map((n) => (
                        <div key={n.id} className="review-step">
                          <p>{n.texto}</p>
                          <small>
                            {n.origem} · {formatDate(n.criadoEm)}
                          </small>
                          <DeleteButton
                            url={`/notas/${n.id}`}
                            title="anotação do psicólogo"
                            description={`Apaga somente esta anotação: “${n.texto.slice(0, 100)}”.`}
                            disabled={busy}
                            onDeleted={report.reload}
                          />
                        </div>
                      ))}
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}
