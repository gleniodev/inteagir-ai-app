import { useState } from "react";
import {
  UserRound,
  Heart,
  ClipboardList,
  ArrowRight,
  ArrowLeft,
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
  StudentSelect,
} from "../components/UI.jsx";

export const blankPreferences = () => ({
  interesses: [],
  estiloVisual: null,
  explicacao: null,
  texto: null,
  evitar: [],
  tipoResposta: null,
  ajuda: null,
  feedback: null,
  progresso: null,
  observacoes: "",
});
const blank = () => ({
  nome: "",
  turmaId: "9C",
  responsavelId: "R01",
  email: "",
  ficticio: true,
  preferencias: blankPreferences(),
});
const questions = [
  [
    "interesses",
    "Quais temas interessam?",
    ["dinossauros", "animais", "trens", "esportes", "espaço", "jogos", "outro"],
    true,
  ],
  [
    "estiloVisual",
    "Que exemplos visuais prefere?",
    ["fotos reais", "desenhos", "ícones simples", "só texto", "tanto faz"],
  ],
  [
    "explicacao",
    "Como prefere a explicação?",
    ["ler", "ouvir", "ver exemplos", "combinação"],
  ],
  [
    "texto",
    "Qual tamanho de bloco de texto é mais confortável?",
    ["curto", "completo", "tanto faz"],
  ],
  [
    "evitar",
    "O que deve ser evitado?",
    [
      "sons",
      "movimentos",
      "muitos elementos",
      "cores intensas",
      "nada",
      "não sei",
    ],
    true,
  ],
  [
    "tipoResposta",
    "Como quer responder?",
    ["alternativas", "seleção em imagem", "digitar"],
  ],
  [
    "ajuda",
    "Quando está difícil, o que ajuda?",
    ["dica", "outro exemplo", "repetir", "pausa"],
  ],
  [
    "feedback",
    "Como prefere receber feedback?",
    ["mensagem curta", "explicação", "imagem discreta"],
  ],
  ["progresso", "Quer ver o progresso?", ["sim", "não", "tanto faz"]],
  ["observacoes", "Algo que gostaria de incluir ou evitar?", null],
];
export default function Registration() {
  const students = useData("/alunos?turmaId=9C");
  const [form, setForm] = useState(blank),
    [id, setId] = useState(""),
    [step, setStep] = useState(0),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const [key, title, options, multiple] = questions[step];
  const update = (name, value) => {
    setSuccess("");
    setForm((f) => ({ ...f, [name]: value }));
  };
  const preference = (value) =>
    update("preferencias", { ...form.preferencias, [key]: value });
  function select(value) {
    setId(value);
    const student = students.data?.find((s) => s.id === value);
    setForm(
      student
        ? {
            nome: student.nome,
            turmaId: student.turmaId,
            responsavelId: student.responsavelId,
            email: student.email,
            ficticio: true,
            preferencias: student.preferencias,
          }
        : blank(),
    );
    setStep(0);
    setError("");
    setSuccess("");
  }
  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await api("/alunos" + (id ? "/" + id : ""), {
        method: id ? "PUT" : "POST",
        body: form,
      });
      setId(result.id);
      students.reload();
      setSuccess(
        "Perfil fictício salvo. As respostas serão recuperadas ao reabrir o cadastro.",
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <DataState {...students} retry={students.reload} />
      <div className="profile-toolbar">
        <div className="min-w-48">
          <StudentSelect
            students={students.data}
            value={id}
            onChange={select}
          />
        </div>
        <button className="secondary" onClick={() => select("")}>
          Novo perfil fictício
        </button>
        {id && (
          <DeleteButton
            url={`/alunos/${id}`}
            title={`perfil “${students.data?.find((a) => a.id === id)?.nome ?? form.nome}”`}
            description="Apaga este perfil, preferências, planejamentos, prévias, publicações personalizadas, respostas, observações e anotações. As aulas e anexos compartilhados do professor permanecem para os demais alunos."
            disabled={busy}
            label="Excluir perfil"
            onDeleted={() => {
              select("");
              students.reload();
              setSuccess("Perfil e registros vinculados excluídos.");
            }}
          />
        )}
      </div>
      <form onSubmit={save}>
        <div className="grid xl:grid-cols-2 gap-5 mt-5">
          <div className="space-y-5">
            <Card title="Informações do aluno" icon={UserRound}>
              <div className="grid md:grid-cols-2 gap-5">
                <Field label="Nome fictício *">
                  <input
                    required
                    maxLength={100}
                    value={form.nome}
                    onChange={(e) => update("nome", e.target.value)}
                    placeholder="Ex.: Aluno A01"
                  />
                </Field>
                <Field label="Turma *">
                  <select
                    value={form.turmaId}
                    onChange={(e) => update("turmaId", e.target.value)}
                  >
                    <option value="9C">9º ano C</option>
                  </select>
                </Field>
                <Field label="Responsável vinculado">
                  <select value="R01" onChange={() => {}}>
                    <option value="R01">Responsável R01 — demonstração</option>
                  </select>
                </Field>
                <Field
                  label="E-mail fictício (opcional)"
                  hint="Use @example.com; não informe contato real."
                >
                  <input
                    type="email"
                    maxLength={150}
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="aluno@example.com"
                  />
                </Field>
              </div>
            </Card>
            <Card title="Interesses e preferências" icon={Heart}>
              <p>
                As respostas são escolhas do estudante. Podem ser alteradas ou
                deixadas sem resposta.
              </p>
              <div className="preference-summary">
                {Object.entries(form.preferencias)
                  .filter(([, v]) =>
                    Array.isArray(v) ? v.length : v !== null && v !== "",
                  )
                  .map(([k, v]) => (
                    <span className="tag" key={k}>
                      {Array.isArray(v) ? v.join(", ") : v}
                    </span>
                  ))}
              </div>
              <p className="muted mt-4">
                O MVP oferece leitura, imagens estáticas e alternativas. Áudio e
                outras formas de resposta ficam registrados como preferências,
                mas ainda não são oferecidos.
              </p>
            </Card>
          </div>
          <Card title="Questionário de preferências" icon={ClipboardList}>
            <p className="flex justify-between gap-3">
              <strong>Pergunta {step + 1} de 10</strong>
              <span className="tag">Questionário fixo</span>
            </p>
            <progress
              value={step + 1}
              max={10}
              aria-label={`Pergunta ${step + 1} de 10`}
            />
            <fieldset className="question-panel">
              <legend>
                {step + 1}. {title}
              </legend>
              {options ? (
                <div className="choices">
                  {options.map((option) => {
                    const checked = multiple
                      ? form.preferencias[key].includes(option)
                      : form.preferencias[key] === option;
                    return (
                      <label
                        className={`choice ${checked ? "selected" : ""}`}
                        key={option}
                      >
                        <input
                          type={multiple ? "checkbox" : "radio"}
                          name={key}
                          checked={checked}
                          onChange={() =>
                            preference(
                              multiple
                                ? checked
                                  ? form.preferencias[key].filter(
                                      (v) => v !== option,
                                    )
                                  : [...form.preferencias[key], option]
                                : option,
                            )
                          }
                        />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  rows={5}
                  maxLength={1000}
                  value={form.preferencias.observacoes}
                  onChange={(e) => preference(e.target.value)}
                  placeholder="Texto opcional, sem informações de saúde ou dados pessoais."
                />
              )}
            </fieldset>
            <button
              type="button"
              className="text-button"
              onClick={() => preference(multiple ? [] : options ? null : "")}
            >
              Prefiro não responder
            </button>
            <div className="actions mt-6">
              <button
                className="secondary"
                type="button"
                disabled={step === 0}
                onClick={() => setStep((s) => s - 1)}
              >
                <ArrowLeft size={18} />
                Voltar
              </button>
              <button
                type="button"
                disabled={step === 9}
                onClick={() => setStep((s) => s + 1)}
              >
                Avançar
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="info-panel mt-5">
              Estas respostas orientam a apresentação da aula. Não geram
              diagnósticos ou estimativas de capacidade.
            </div>
          </Card>
        </div>
        <Message error={error} success={success} />
        <div className="card actions mt-5">
          <label className="inline-check">
            <input
              type="checkbox"
              checked={form.ficticio}
              required
              onChange={(e) => update("ficticio", e.target.checked)}
            />
            Confirmo que este perfil é fictício
          </label>
          <button disabled={busy}>
            <Save size={19} />
            {busy ? "Salvando…" : "Salvar perfil e preferências"}
          </button>
        </div>
      </form>
    </>
  );
}
