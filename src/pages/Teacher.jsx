import { useEffect, useState } from "react";
import {
  BookOpen,
  Users,
  Plus,
  Upload,
  Sparkles,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { api } from "../services/api.js";
import {
  Card,
  Field,
  Message,
  useData,
  DataState,
  Empty,
  Tag,
  materialStatus,
  lessonStatus,
} from "../components/UI.jsx";

const emptySubject = () => ({ titulo: "", descricao: "", objetivo: "" });
const emptyLesson = (disciplina) => ({
  disciplina,
  titulo: "",
  descricao: "",
  turmaId: "9C",
  assuntos: [emptySubject()],
});
const reviewKeys = [
  ["conceitos", "Os conceitos e objetivos estão corretos"],
  ["imagem", "A imagem representa o assunto sem enganos"],
  ["questoes", "As questões têm uma única alternativa correta"],
  ["leitura", "A leitura está adequada à série"],
  ["preferencias", "As preferências foram respeitadas"],
];
function Review({ data }) {
  return (
    <div className="space-y-5">
      <div className="info-panel">
        <strong>{data.origem}</strong> · Prompt-base v{data.promptBaseVersion}
      </div>
      {data.assuntos.map((a) => (
        <div key={a.assuntoId}>
          <h3>{a.titulo}</h3>
          <p>Objetivo: {a.objetivo}</p>
          {a.observacoesParaProfessor.map((o, i) => (
            <p key={i} className="warning-note">
              {o}
            </p>
          ))}
          {a.etapas.map((e) => (
            <div key={e.id} className="review-step">
              {e.tipo === "explicacao" ? (
                <>
                  <h4>{e.titulo}</h4>
                  <p>{e.texto}</p>
                  {e.imagem.arquivo && (
                    <figure>
                      <img
                        src={"/api/media/" + e.imagem.arquivo}
                        alt={e.imagem.alt}
                        onError={(ev) => {
                          ev.currentTarget.hidden = true;
                          ev.currentTarget.nextElementSibling.hidden = false;
                        }}
                      />
                      <figcaption hidden role="alert">
                        Imagem não disponível. Não publique sem verificar a
                        mídia.
                      </figcaption>
                    </figure>
                  )}
                </>
              ) : (
                <>
                  <h4>{e.enunciado}</h4>
                  <ol type="A">
                    {e.alternativas.map((o, i) => (
                      <li key={o}>
                        {o}{" "}
                        {i === e.indiceCorreto && <strong> — Gabarito</strong>}
                      </li>
                    ))}
                  </ol>
                  <p>Dica: {e.dica}</p>
                  <p>Explicação: {e.explicacao}</p>
                </>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
export default function Teacher() {
  const lessons = useData("/aulas"),
    students = useData("/alunos?turmaId=9C");
  const [discipline, setDiscipline] = useState("Matemática"),
    [editing, setEditing] = useState(false),
    [form, setForm] = useState(() => emptyLesson("Matemática")),
    [lesson, setLesson] = useState(null),
    [stage, setStage] = useState(0),
    [selected, setSelected] = useState([]),
    [studentId, setStudentId] = useState(""),
    [prompt, setPrompt] = useState(null),
    [preview, setPreview] = useState(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState(""),
    [review, setReview] = useState({}),
    [file, setFile] = useState(null),
    [materialSubject, setMaterialSubject] = useState(""),
    [manual, setManual] = useState({});
  const materials = useData(lesson ? `/aulas/${lesson.id}/materiais` : null);
  useEffect(() => {
    setPrompt(null);
    setPreview(null);
    setReview({});
  }, [studentId, lesson?.id]);
  async function run(fn) {
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      await fn();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function start(a) {
    setEditing(true);
    setLesson(a ?? null);
    setForm(
      a
        ? {
            disciplina: a.disciplina,
            titulo: a.titulo,
            descricao: a.descricao,
            turmaId: a.turmaId,
            assuntos: a.assuntos.map(({ id, ...v }) => v),
          }
        : emptyLesson(discipline),
    );
    setStage(a ? 1 : 0);
    setSelected([]);
    setStudentId("");
    setPreview(null);
    setPrompt(null);
    setReview({});
    setError("");
    setSuccess("");
    setFile(null);
    setManual({});
    materials.reload();
  }
  function demo() {
    setForm({
      disciplina: "Matemática",
      titulo: "Frações e partes iguais",
      descricao: "Aula fictícia com dois assuntos separados.",
      turmaId: "9C",
      assuntos: [
        {
          titulo: "Frações",
          descricao: "Partes iguais de um todo, numerador e denominador.",
          objetivo:
            "Interpretar frações e identificar numerador e denominador.",
        },
        {
          titulo: "Frações equivalentes",
          descricao: "Diferentes frações que representam o mesmo valor.",
          objetivo: "Reconhecer e construir frações equivalentes.",
        },
      ],
    });
  }
  function updateSubject(index, key, value) {
    setForm((f) => ({
      ...f,
      assuntos: f.assuntos.map((a, i) =>
        i === index ? { ...a, [key]: value } : a,
      ),
    }));
  }
  async function save(e) {
    e.preventDefault();
    await run(async () => {
      const saved = await api("/aulas" + (lesson ? "/" + lesson.id : ""), {
        method: lesson ? "PUT" : "POST",
        body: form,
      });
      setLesson(saved);
      lessons.reload();
      setStage(1);
      setSuccess("Aula salva com assuntos separados.");
    });
  }
  async function upload(e) {
    e.preventDefault();
    await run(async () => {
      if (!file) throw new Error("Selecione um arquivo.");
      const data = new FormData();
      data.set("aulaId", lesson.id);
      if (materialSubject) data.set("assuntoId", materialSubject);
      data.set("arquivo", file);
      await api("/materiais", { method: "POST", body: data });
      materials.reload();
      setPreview(null);
      setPrompt(null);
      setSuccess("Material salvo. Confira o status de leitura.");
    });
  }
  async function getPrompt() {
    await run(async () => {
      if (!studentId) throw new Error("Selecione um aluno.");
      setPrompt(await api(`/aulas/${lesson.id}/prompt?alunoId=${studentId}`));
      setStage(3);
    });
  }
  async function generate(example) {
    await run(async () => {
      setPreview(null);
      setReview({});
      const data = await api(
        `/aulas/${lesson.id}/${example ? "exemplo" : "gerar"}`,
        { method: "POST", body: { alunoId: studentId } },
      );
      setPreview(data);
      setStage(4);
      lessons.reload();
    });
  }
  async function openPreview() {
    await run(async () => {
      const data = await api(`/aulas/${lesson.id}/previa?alunoId=${studentId}`);
      setPreview(data);
      setStage(4);
    });
  }
  async function publish() {
    await run(async () => {
      const pub = await api(`/aulas/${lesson.id}/publicar`, {
        method: "POST",
        body: { alunoId: studentId, revisao: review },
      });
      lessons.reload();
      setSuccess(
        `Versão ${pub.versao} publicada para o perfil selecionado. Abra a área Aluno para realizar as atividades.`,
      );
    });
  }
  if (!editing)
    return (
      <>
        <div className="grid md:grid-cols-3 gap-5 mb-5">
          <div className="stat blue">
            <Users />
            <div>
              <span>Turma da demonstração</span>
              <strong>9º ano C</strong>
            </div>
          </div>
          <div className="stat green">
            <Users />
            <div>
              <span>Alunos cadastrados</span>
              <strong>{students.data?.length ?? "—"}</strong>
            </div>
          </div>
          <div className="stat pink">
            <BookOpen />
            <div>
              <span>Aulas salvas</span>
              <strong>{lessons.data?.length ?? "—"}</strong>
            </div>
          </div>
        </div>
        <div className="grid xl:grid-cols-[1.35fr_1fr] gap-5">
          <Card title="Minhas disciplinas">
            <div className="discipline-options">
              {["Matemática", "História"].map((v) => (
                <button
                  key={v}
                  className={discipline === v ? "" : "secondary"}
                  onClick={() => setDiscipline(v)}
                >
                  {v}
                </button>
              ))}
            </div>
            <DataState {...lessons} retry={lessons.reload} />
            {lessons.data
              ?.filter((a) => a.disciplina === discipline)
              .map((a) => (
                <div className="list-row" key={a.id}>
                  <div>
                    <h3>{a.titulo}</h3>
                    <p>{a.assuntos.length} assuntos · 9º ano C</p>
                    <Tag>{lessonStatus[a.status]}</Tag>
                  </div>
                  <button className="secondary" onClick={() => start(a)}>
                    Abrir
                  </button>
                </div>
              ))}
            {lessons.data &&
              !lessons.data.some((a) => a.disciplina === discipline) && (
                <Empty>
                  Nenhuma aula nesta disciplina. Crie a primeira aula.
                </Empty>
              )}
            <button className="green-button mt-5" onClick={() => start()}>
              <Plus size={20} />
              Criar nova aula
            </button>
          </Card>
          <Card title="Minha turma" icon={Users}>
            <h3>9º ano C</h3>
            <DataState {...students} retry={students.reload} />
            {students.data?.map((a, i) => (
              <div key={a.id} className="list-row">
                <span>
                  A{String(i + 1).padStart(2, "0")} — {a.nome}
                </span>
                <Tag>Perfil cadastrado</Tag>
              </div>
            ))}
            {students.data?.length === 0 && (
              <Empty>
                Nenhum aluno cadastrado.{" "}
                <a href="#cadastro">Cadastrar perfil fictício</a>
              </Empty>
            )}
            <p className="info-panel mt-5">
              Crie a aula, vincule o material, selecione o perfil e revise antes
              de publicar.
            </p>
          </Card>
        </div>
      </>
    );
  return (
    <>
      <div className="card wizard-header">
        <button
          className="text-button"
          onClick={() => {
            setEditing(false);
            lessons.reload();
          }}
        >
          <ArrowLeft size={18} />
          Disciplinas
        </button>
        <div>
          <strong>
            Etapa {stage + 1} de 5 —{" "}
            {
              [
                "Assuntos",
                "Materiais",
                "Turma e alunos",
                "Prompt e geração",
                "Revisão e publicação",
              ][stage]
            }
          </strong>
          <progress
            value={stage + 1}
            max={5}
            aria-label={`Etapa ${stage + 1} de 5`}
          />
        </div>
      </div>
      <Message error={error} success={success} />
      {stage === 0 ? (
        <Card title="Assuntos da aula">
          <form onSubmit={save}>
            <div className="actions mb-5">
              <p>Cadastre cada assunto individualmente.</p>
              <button type="button" className="secondary" onClick={demo}>
                Preencher exemplo de frações
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Disciplina">
                <select
                  value={form.disciplina}
                  onChange={(e) =>
                    setForm({ ...form, disciplina: e.target.value })
                  }
                >
                  <option>Matemática</option>
                  <option>História</option>
                </select>
              </Field>
              <Field label="Título da aula *">
                <input
                  required
                  maxLength={150}
                  value={form.titulo}
                  onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Descrição geral (opcional)">
              <textarea
                rows={2}
                maxLength={4000}
                value={form.descricao}
                onChange={(e) =>
                  setForm({ ...form, descricao: e.target.value })
                }
              />
            </Field>
            {form.assuntos.map((a, i) => (
              <fieldset className="subject-panel" key={i}>
                <legend>Assunto {i + 1}</legend>
                <Field label="Título *">
                  <input
                    required
                    maxLength={120}
                    value={a.titulo}
                    onChange={(e) => updateSubject(i, "titulo", e.target.value)}
                  />
                </Field>
                <Field label="Descrição *">
                  <textarea
                    required
                    rows={2}
                    maxLength={4000}
                    value={a.descricao}
                    onChange={(e) =>
                      updateSubject(i, "descricao", e.target.value)
                    }
                  />
                </Field>
                <Field label="Objetivo pedagógico *">
                  <input
                    required
                    maxLength={1000}
                    value={a.objetivo}
                    onChange={(e) =>
                      updateSubject(i, "objetivo", e.target.value)
                    }
                  />
                </Field>
                <button
                  type="button"
                  className="text-button"
                  disabled={form.assuntos.length === 1}
                  onClick={() =>
                    setForm({
                      ...form,
                      assuntos: form.assuntos.filter((_, index) => index !== i),
                    })
                  }
                >
                  <Trash2 size={17} />
                  Remover assunto
                </button>
              </fieldset>
            ))}
            <div className="actions">
              <button
                type="button"
                className="secondary"
                disabled={form.assuntos.length >= 8}
                onClick={() =>
                  setForm({
                    ...form,
                    assuntos: [...form.assuntos, emptySubject()],
                  })
                }
              >
                <Plus size={18} />
                Adicionar assunto
              </button>
              <button disabled={busy}>
                {busy ? "Salvando…" : "Salvar e continuar"}
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </Card>
      ) : stage === 1 ? (
        <Card title="Materiais da aula" icon={Upload}>
          <p>
            PDF pesquisável tem leitura real. Fotos e PDFs escaneados precisam
            de texto preparado pelo professor. Até 5 MB por arquivo.
          </p>
          <form onSubmit={upload} className="upload-panel">
            <Field label="Vincular material">
              <select
                value={materialSubject}
                onChange={(e) => setMaterialSubject(e.target.value)}
              >
                <option value="">Todos os assuntos</option>
                {lesson.assuntos.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.titulo}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="PDF ou imagem">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </Field>
            <button disabled={busy}>
              <Upload size={18} />
              {busy ? "Enviando e verificando…" : "Enviar material"}
            </button>
          </form>
          <DataState {...materials} retry={materials.reload} />
          {materials.data?.map((m) => (
            <div className="subject-panel" key={m.id}>
              <div className="actions">
                <h3>
                  {m.nome} · {(m.tamanho / 1024).toFixed(0)} KB
                </h3>
                <Tag>{materialStatus[m.status]}</Tag>
              </div>
              <p>{m.mensagem}</p>
              <a
                href={`/api/materiais/${m.id}/arquivo`}
                target="_blank"
                rel="noreferrer"
              >
                Abrir material enviado
              </a>
              <Field label="Texto preparado ou revisado pelo professor">
                <textarea
                  maxLength={50000}
                  rows={3}
                  value={manual[m.id] ?? ""}
                  onChange={(e) =>
                    setManual({ ...manual, [m.id]: e.target.value })
                  }
                  placeholder="Descreva o conteúdo legível. Não inclua dados reais."
                />
              </Field>
              <button
                className="secondary"
                disabled={busy || !manual[m.id]?.trim()}
                onClick={() =>
                  run(async () => {
                    await api(`/materiais/${m.id}/texto`, {
                      method: "PUT",
                      body: { texto: manual[m.id] },
                    });
                    materials.reload();
                    setPreview(null);
                    setPrompt(null);
                    setSuccess(
                      "Texto manual salvo e material marcado como Lido.",
                    );
                  })
                }
              >
                Salvar texto manual
              </button>
            </div>
          ))}
          {materials.data?.length === 0 && (
            <Empty>Nenhum material enviado.</Empty>
          )}
          <div className="actions mt-5">
            <button
              className="secondary"
              onClick={() => setStage(0)}
              disabled={!!materials.data?.length}
            >
              Voltar aos assuntos
            </button>
            <button onClick={() => setStage(2)} disabled={busy}>
              Continuar
              <ArrowRight size={18} />
            </button>
          </div>
        </Card>
      ) : stage === 2 ? (
        <Card title="Turma e estudantes" icon={Users}>
          <Field label="Turma">
            <select value="9C" onChange={() => {}}>
              <option value="9C">9º ano C</option>
            </select>
          </Field>
          <DataState {...students} retry={students.reload} />
          {students.data?.map((a) => (
            <label className="choice list-row" key={a.id}>
              <input
                type="checkbox"
                checked={selected.includes(a.id)}
                onChange={(e) => {
                  const ids = e.target.checked
                    ? [...selected, a.id]
                    : selected.filter((id) => id !== a.id);
                  setSelected(ids);
                  setStudentId(
                    ids.includes(studentId) ? studentId : (ids[0] ?? ""),
                  );
                }}
              />
              <span>{a.nome}</span>
              <Tag>Preferências cadastradas</Tag>
            </label>
          ))}
          {students.data?.length === 0 && (
            <Empty>
              Nenhum aluno na turma.{" "}
              <a href="#cadastro">Cadastrar aluno fictício</a>
            </Empty>
          )}
          <Field label="Aluno para gerar e revisar agora">
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            >
              <option value="">Selecione</option>
              {students.data
                ?.filter((a) => selected.includes(a.id))
                .map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nome}
                  </option>
                ))}
            </select>
          </Field>
          <p>
            Você pode selecionar vários perfis; geração e revisão ocorrem um
            aluno por vez.
          </p>
          <div className="actions">
            <button className="secondary" onClick={() => setStage(1)}>
              Voltar
            </button>
            <button disabled={!studentId || busy} onClick={getPrompt}>
              Ver prompt
              <ArrowRight size={18} />
            </button>
          </div>
        </Card>
      ) : stage === 3 ? (
        <Card title="Prompt e geração" icon={Sparkles}>
          {prompt && (
            <>
              <Tag>Prompt-base v{prompt.promptBaseVersion}</Tag>
              <div className="prompt-panel">
                <h3>Diretrizes gerais</h3>
                <p>{prompt.diretrizesGerais}</p>
                <h3>Informações da aula</h3>
                <pre>{JSON.stringify(prompt.informacoesAula, null, 2)}</pre>
                <h3>Preferências do aluno</h3>
                <pre>{JSON.stringify(prompt.preferenciasAluno, null, 2)}</pre>
                <h3>Instruções do sistema</h3>
                <p>{prompt.instrucoesSistema}</p>
              </div>
            </>
          )}
          <div className="warning-note">
            Geração ao vivo indisponível: Hermes e os provedores ainda não foram
            configurados/verificados. Nenhum fallback está ativo.
          </div>
          <div className="actions flex-wrap">
            <button className="secondary" onClick={() => setStage(2)}>
              Voltar
            </button>
            <button disabled={busy} onClick={() => generate(false)}>
              Gerar aula adaptada
            </button>
            <button
              disabled={busy}
              className="secondary"
              onClick={() => generate(true)}
            >
              Usar exemplo pré-gerado de frações
            </button>
            <button
              disabled={busy}
              className="text-button"
              onClick={openPreview}
            >
              Reabrir prévia salva
            </button>
          </div>
          <p className="muted mt-4">
            A contingência oferece variações fixas para trens, esportes ou
            exemplo neutro. Não usa os anexos para produzir novos conteúdos;
            revise a compatibilidade.
          </p>
        </Card>
      ) : (
        <Card title="Revisão e publicação" icon={CheckCircle2}>
          {preview && <Review data={preview} />}
          <fieldset className="subject-panel">
            <legend>Revisão obrigatória do professor</legend>
            {reviewKeys.map(([key, label]) => (
              <label key={key} className="inline-check">
                <input
                  type="checkbox"
                  checked={review[key] ?? false}
                  onChange={(e) =>
                    setReview({ ...review, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </fieldset>
          <div className="actions flex-wrap">
            <button className="secondary" onClick={() => setStage(3)}>
              Voltar à geração
            </button>
            <button
              disabled={busy || !reviewKeys.every(([key]) => review[key])}
              onClick={publish}
            >
              Publicar para aluno
            </button>
            <button className="text-button" onClick={() => setStage(2)}>
              Revisar outro aluno selecionado
            </button>
          </div>
          <p className="muted mt-4">
            Rascunho e prévia já estão salvos. Publicar cria uma versão e
            preserva as sessões anteriores.
          </p>
        </Card>
      )}
    </>
  );
}
