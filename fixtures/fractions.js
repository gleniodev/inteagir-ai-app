// Fixture fixo, não é retorno de IA ao vivo nem adapta arbitrariamente novas aulas.
export const fixtureTitles = ["Frações", "Frações equivalentes"];
export function fractions(assunto, interest) {
  const equivalents = assunto.titulo === fixtureTitles[1];
  const context =
    interest === "trens"
      ? "Um trem com quatro vagões iguais ajuda a representar partes de um todo. Um vagão corresponde a um quarto do conjunto."
      : interest === "esportes"
        ? "Dividir uma partida em quatro períodos de mesma duração é uma analogia para partes iguais. Um período corresponde a um quarto do tempo total."
        : "Uma fração representa uma quantidade em relação a um todo dividido em partes iguais.";
  const questions = equivalents
    ? [
        [
          "Qual fração equivale a 1/2?",
          ["2/4", "1/4", "3/4"],
          0,
          "Multiplique numerador e denominador por dois.",
          "2/4 e 1/2 representam a mesma quantidade.",
        ],
        [
          "Qual fração equivale a 3/4?",
          ["3/8", "6/8", "4/3"],
          1,
          "Multiplique as duas partes da fração por dois.",
          "3 × 2 = 6 e 4 × 2 = 8, logo 3/4 = 6/8.",
        ],
        [
          "Por que 2/4 e 1/2 são equivalentes?",
          [
            "Têm numeradores iguais",
            "Têm denominadores iguais",
            "Representam a mesma parte do todo",
          ],
          2,
          "Pense na quantidade representada.",
          "Frações equivalentes têm o mesmo valor, embora escritas de maneiras diferentes.",
        ],
      ]
    : [
        [
          "Uma de quatro partes iguais corresponde a qual fração?",
          ["1/4", "4/1", "1/3"],
          0,
          "O denominador indica o total de partes iguais.",
          "Uma parte de um total de quatro é 1/4.",
        ],
        [
          "O que o denominador representa?",
          [
            "As partes selecionadas",
            "O total de partes iguais",
            "O dobro do numerador",
          ],
          1,
          "Observe o número abaixo da barra.",
          "O denominador indica em quantas partes iguais o todo foi dividido.",
        ],
        [
          "Três de quatro partes iguais correspondem a qual fração?",
          ["4/3", "1/4", "3/4"],
          2,
          "O numerador indica quantas partes foram consideradas.",
          "Três partes consideradas de quatro partes iguais formam 3/4.",
        ],
      ];
  return {
    versaoEsquema: "1.0",
    assuntoId: assunto.id,
    titulo: assunto.titulo,
    objetivo: assunto.objetivo,
    observacoesParaProfessor: [
      "Pré-gerado para demonstração. Revisar se este conteúdo atende ao objetivo informado.",
      "A imagem ilustra partes iguais por analogia; não representa um trem real completo.",
    ],
    etapas: [
      {
        id: "EX01",
        tipo: "explicacao",
        titulo: assunto.titulo,
        texto:
          context +
          " O numerador indica as partes consideradas; o denominador, o total de partes iguais." +
          (equivalents
            ? " Frações equivalentes têm o mesmo valor. Multiplicar numerador e denominador pelo mesmo número não nulo preserva esse valor. Por exemplo: 1/2 = 2/4."
            : ""),
        imagem: {
          necessaria: true,
          pedido:
            "Quatro vagões de tamanho igual, um azul e três cinza, para representar 1/4.",
          alt: "Quatro vagões iguais: o primeiro azul e os outros três cinza. O vagão azul representa um quarto do conjunto.",
          arquivo: null,
        },
      },
      ...questions.map(
        ([enunciado, alternativas, indiceCorreto, dica, explicacao], i) => ({
          id: `Q0${i + 1}`,
          tipo: "questao",
          enunciado,
          alternativas,
          indiceCorreto,
          dica,
          feedbackAcerto: "Correto. " + explicacao,
          explicacao,
        }),
      ),
    ],
  };
}
