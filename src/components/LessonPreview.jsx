import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Modal from "./Modal.jsx";
import { Message, Tag } from "./UI.jsx";

export default function LessonPreview({ data, title, onClose }) {
  const [index, setIndex] = useState(0);
  const [imageError, setImageError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const slide = useRef(null);
  const slides = data.assuntos.flatMap((a) =>
    a.etapas.map((e) => ({ assunto: a, etapa: e })),
  );
  useEffect(() => {
    setImageError(false);
    slide.current?.focus();
    slide.current?.scrollTo(0, 0);
  }, [index]);
  const current = slides[index];
  return (
    <Modal
      title={title || "Revisão da aula em slides"}
      fullscreen
      onClose={onClose}
    >
      <div className="slide-deck lesson">
        <div className="slide-meta">
          <Tag>Prévia do professor · com gabarito</Tag>
          <span>
            Slide {index + 1} de {slides.length}
          </span>
        </div>
        <section
          className="lesson-content slide-content"
          tabIndex={-1}
          ref={slide}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${index + 1} de ${slides.length}`}
        >
          {!current ? (
            <Message error="Não há conteúdo disponível para apresentar." />
          ) : (
            <>
              <p className="muted">{current.assunto.titulo}</p>
              <p>Objetivo: {current.assunto.objetivo}</p>
              {current.assunto.observacoesParaProfessor.map((warning, i) => (
                <div className="warning-note" key={i}>
                  {warning}
                </div>
              ))}
              {current.etapa.tipo === "explicacao" ? (
                <>
                  <h3>{current.etapa.titulo}</h3>
                  <p>{current.etapa.texto}</p>
                  {current.etapa.imagem.arquivo && (
                    <figure>
                      <img
                        key={`${index}-${attempt}`}
                        src={`/api/media/${current.etapa.imagem.arquivo}`}
                        alt={current.etapa.imagem.alt}
                        hidden={imageError}
                        onError={() => setImageError(true)}
                      />
                      {imageError ? (
                        <>
                          <Message error="Imagem indisponível. Confira a mídia antes de publicar." />
                          <button
                            className="secondary"
                            onClick={() => {
                              setAttempt((a) => a + 1);
                              setImageError(false);
                            }}
                          >
                            Tentar carregar imagem
                          </button>
                        </>
                      ) : (
                        <figcaption>{current.etapa.imagem.alt}</figcaption>
                      )}
                    </figure>
                  )}
                </>
              ) : (
                <>
                  <h3>{current.etapa.enunciado}</h3>
                  <ol type="A" className="preview-options">
                    {current.etapa.alternativas.map((o, i) => (
                      <li key={i}>
                        {o}
                        {i === current.etapa.indiceCorreto && (
                          <strong> — Gabarito</strong>
                        )}
                      </li>
                    ))}
                  </ol>
                  <p>Dica: {current.etapa.dica}</p>
                  <p>Explicação: {current.etapa.explicacao}</p>
                </>
              )}
            </>
          )}
        </section>
        <nav className="slide-controls" aria-label="Navegação da prévia">
          <button
            className="secondary"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          >
            <ArrowLeft size={18} />
            Anterior
          </button>
          {index < slides.length - 1 ? (
            <button onClick={() => setIndex((i) => i + 1)}>
              Próximo
              <ArrowRight size={18} />
            </button>
          ) : (
            <button onClick={onClose}>Voltar à revisão</button>
          )}
        </nav>
      </div>
    </Modal>
  );
}
