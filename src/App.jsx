import { useEffect, useState } from "react";
import {
  Home,
  Users,
  UserRound,
  BookOpen,
  Heart,
  Brain,
  Settings,
  ArrowLeft,
  Globe,
} from "lucide-react";
import { api } from "./services/api.js";
import { Message, Loading } from "./components/UI.jsx";
import Registration from "./pages/Registration.jsx";
import Teacher from "./pages/Teacher.jsx";
import Student from "./pages/Student.jsx";
import Reports from "./pages/Reports.jsx";
import AISettings from "./pages/AISettings.jsx";

const areas = [
  ["professor", "Professor", Users],
  ["cadastro", "Cadastro do aluno", UserRound],
  ["aluno", "Aluno", BookOpen],
  ["responsavel", "Responsável", Heart],
  ["psicologo", "Psicólogo", Brain],
  ["ia", "Configuração da IA", Settings],
];
const headings = {
  inicio: [
    "Cada estudante, seu jeito de aprender",
    "Prepare, revise e acompanhe atividades com preferências individuais.",
  ],
  professor: [
    "Área do professor",
    "Prepare suas aulas e revise as adaptações para cada estudante.",
  ],
  cadastro: [
    "Cadastro do aluno",
    "Conheça o estudante para personalizar sua experiência de aprendizagem.",
  ],
  aluno: [
    "Minhas aulas",
    "Um passo por vez. Você pode pedir ajuda e fazer uma pausa.",
  ],
  responsavel: [
    "Área do responsável",
    "Veja o que foi estudado e registre suas observações.",
  ],
  psicologo: [
    "Área do psicólogo",
    "Consulte registros e revise as diretrizes de adaptação.",
  ],
  ia: [
    "Configuração da IA",
    "Consulte o estado real dos adaptadores e os testes registrados.",
  ],
};
function hashArea() {
  const value = location.hash.slice(1);
  return areas.some((a) => a[0] === value) ? value : "inicio";
}
export default function App() {
  const [area, setArea] = useState(hashArea),
    [ready, setReady] = useState(false),
    [error, setError] = useState(""),
    [loginAttempt, setLoginAttempt] = useState(0);
  useEffect(() => {
    const fn = () => setArea(hashArea());
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, []);
  useEffect(() => {
    let active = true;
    setReady(false);
    setError("");
    if (area === "inicio") {
      setReady(true);
      return;
    }
    api("/demo/sessao", { method: "POST", body: { papel: area } })
      .then(() => {
        if (active) setReady(true);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [area, loginAttempt]);
  const reference =
    area === "cadastro" || area === "aluno"
      ? "aluno"
      : area === "psicologo"
        ? "psicologo"
        : area === "responsavel"
          ? "responsavel"
          : "professor";
  return (
    <>
      <a
        className="skip-link"
        href="#conteudo"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("conteudo").focus();
        }}
      >
        Ir para o conteúdo
      </a>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="InTEAgir.AI — início" />
        <div className="top-meta">
          <span>
            <UserRound size={20} />
            Acesso de demonstração
          </span>
          <span>
            <Globe size={20} />
            Português
          </span>
        </div>
      </header>
      <div className="app-shell">
        <aside className="sidebar">
          <nav aria-label="Áreas da demonstração">
            <a
              href="#inicio"
              className={area === "inicio" ? "active" : ""}
              aria-current={area === "inicio" ? "page" : undefined}
            >
              <Home />
              Início
            </a>
            {areas.map(([id, label, Icon]) => (
              <a
                href={`#${id}`}
                key={id}
                className={area === id ? "active" : ""}
                aria-current={area === id ? "page" : undefined}
              >
                <Icon />
                {label}
              </a>
            ))}
          </nav>
          <div className="books" aria-hidden="true" />
        </aside>
        <main id="conteudo" tabIndex={-1}>
          <div className="hero">
            <div className="hero-copy">
              <h1>{headings[area][0]}</h1>
              <p>{headings[area][1]}</p>
            </div>
            <div className={`hero-art ${reference}`} aria-hidden="true" />
          </div>
          <div className="demo-banner">
            Demonstração escolar · use somente perfis fictícios · contas sem
            autenticação de produção
          </div>
          {area !== "inicio" && (
            <a href="#inicio" className="back-link">
              <ArrowLeft size={17} />
              Voltar ao início
            </a>
          )}
          <Message error={error} />
          {error && (
            <button
              className="secondary"
              onClick={() => setLoginAttempt((v) => v + 1)}
            >
              Tentar novamente
            </button>
          )}
          {!ready && !error && <Loading />}
          {ready &&
            (area === "inicio" ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                {areas.map(([id, label, Icon]) => (
                  <a href={`#${id}`} key={id} className="card area-card">
                    <Icon size={34} />
                    <h2>{label}</h2>
                    <p>Abrir área de demonstração</p>
                  </a>
                ))}
              </div>
            ) : area === "cadastro" ? (
              <Registration />
            ) : area === "professor" ? (
              <Teacher />
            ) : area === "aluno" ? (
              <Student />
            ) : area === "responsavel" || area === "psicologo" ? (
              <Reports psychologist={area === "psicologo"} />
            ) : (
              <AISettings />
            ))}
          <footer>
            InTEAgir.AI · Protótipo educacional para a MIC · Registros de uso
            não são medidas de atenção ou diagnóstico.
          </footer>
        </main>
      </div>
    </>
  );
}
