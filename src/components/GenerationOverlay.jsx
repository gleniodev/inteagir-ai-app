import { useEffect, useState, useSyncExternalStore } from "react";
import { LoaderCircle } from "lucide-react";
import Modal from "./Modal.jsx";
import {
  generationSnapshot,
  subscribeGeneration,
} from "../services/generation-wait.js";

const messages = [
  "Colocando os pingos nos is…",
  "Desembaraçando o novelo das ideias…",
  "Dando uma caprichada no caderno das auras",
  "Conferindo se a imaginação trouxe o lápis…",
  "Organizando as ideias sem amassar o papel…",
  "Opa! Calma aí, deixa eu pegar a borracha…",
  "Caneta azul… azul caneta…",
];
function Waiting({ title }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer;
    function update() {
      clearInterval(timer);
      if (!preference.matches)
        timer = setInterval(
          () => setIndex((i) => (i + 1) % messages.length),
          7000,
        );
    }
    update();
    preference.addEventListener("change", update);
    return () => {
      clearInterval(timer);
      preference.removeEventListener("change", update);
    };
  }, []);
  return (
    <Modal title={title}>
      <div className="generation-wait">
        <LoaderCircle
          className="generation-spinner"
          size={48}
          aria-hidden="true"
        />
        <p
          className="waiting-message"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {messages[index]}
        </p>
        <p>
          A IA está preparando sua solicitação. Isso pode levar alguns minutos.
        </p>
      </div>
    </Modal>
  );
}
export default function GenerationOverlay() {
  const title = useSyncExternalStore(
    subscribeGeneration,
    generationSnapshot,
    () => "",
  );
  return title ? <Waiting key={title} title={title} /> : null;
}
