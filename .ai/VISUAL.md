# T00 — Inventário visual observado

## Continuação T11/T12 — retorno na aula, 14/10/2026
Pasta relistada (quatro JPEGs, sem subpastas). aluno.jpeg (cadastro, não aula), responsavel.jpeg e psicologo.jpeg reabertos visualmente. Student.jsx reutiliza botão secundário/ícone Lucide já adotados para Voltar; Reports.jsx usa total realizado preservado. Sem CSS, tokens, assets ou composição novos. Referência própria da aula ausente. Nenhum navegador acessado ou captura nova produzida: comparação visual, teclado e mobile permanecem pendentes por adiamento do usuário; não declarar fidelidade aprovada.

## Comparação na retomada — 14/10/2026

Quatro referências reabertas e comparadas com capturas **já existentes** em `.ai/evidencias/`, em dimensões desktop próximas. Nenhuma UI alterada ou nova captura produzida nesta retomada. Mapeamento dos componentes em ESTADO_ATUAL.md.

| Referência | Captura observada | Diferenças |
|---|---|---|
| professor.jpeg | professor-desktop.png | Logo, hero, decoração lateral, três cards e duas colunas preservam composição. Fonte/ícones aproximados, hero recortado; aviso/retorno deslocam cards. Dados seguem o MVP. |
| aluno.jpeg (cadastro) | cadastro-desktop.png | Hero e duas colunas presentes; seletor/privacidade aumentam altura. Dez perguntas sequenciais substituem cinco simultâneas; interesses sem miniaturas e resumo de escolhas alteram card esquerdo. Não representa aula interativa. |
| responsavel.jpeg | responsavel-desktop.png | Hero, três cards e duas colunas presentes; seletor/aviso deslocam conteúdo. Observações substituem painel ilustrativo de pendências; métricas usam registros do demo. |
| psicologo.jpeg | psicologo-desktop.png | Hero, três cards e três colunas presentes; abas/seletor/aviso deslocam conteúdo. Registros/relatos/notas humanas substituem foco e sugestões clínicas ilustrativas. Fonte/ícones aproximados. |

cadastro-mobile.png mostra largura de 375 px, navegação horizontal e início do formulário em uma coluna; não comprova questionário completo nem demais áreas mobile. erro-offline.png mostra erro legível de conexão e nova tentativa; não comprova cache offline/instalação/recuperação. Teclado, contraste e QA atual de navegador permanecem pendentes. Não há referência específica de aula/IA nem comprovação de fidelidade completa.

## Inventário anterior

Quatro arquivos, sem subpastas: professor.jpeg (1600×900), aluno.jpeg (1536×1024), responsavel.jpeg (1600×900), psicologo.jpeg (1536×1024). Todos abertos via view_image nesta sessão. Apenas uma versão de cada tela.

Padrões observados: fundo azul muito claro; cabeçalho branco horizontal (~75px); logo multicolorido no canto esquerdo; sidebar branca arredondada (~240px); área principal com hero horizontal, título grande azul-marinho, texto azul acinzentado e ilustração 3D. Cards brancos com cantos arredondados (~18px), borda clara e sombras suaves. Ações azuis; ação de criação verde. Cores auxiliares verde, rosa e lilás em cards com fundos pastel. Inputs retangulares, borda cinza azulada, raio menor (~8px). Fonte sans arredondada, nome e pesos exatos desconhecidos. Ícones simples de contorno/preenchimento; Lucide compatível com a linguagem, mas não idêntico.

Estimativas de tokens (não medidas como valores originais): navy #11135c, azul #087fe8, fundo #eef8ff, texto secundário #526991, borda #dbe9f5; raio card 18px, botão 10px, sidebar 22px; fonte system-ui até disponibilização da fonte original. Grade: Professor e Responsável duas colunas abaixo de três cards; Psicólogo três colunas; Cadastro duas colunas.

Assets separados ausentes: logo, avatar, personagens, livros, interesses e fotografia. Reutilização prevista: recortes CSS de regiões decorativas dos JPEGs, sem usar uma tela inteira como fachada. Formulários/cards/navegação serão HTML interativo. Solicitar originais na retomada; não inventar marca.

Conflitos documentados: cadastro ilustrado tem cinco perguntas, documentação exige dez; implementar dez. Psicólogo mostra foco/agrado numéricos e suposições clínicas; usar apenas eventos e feedback relatado previstos em docs. Mockups têm outras disciplinas/turmas, comunicação/alertas; manter Matemática/História e 9C sem ações não previstas.

Não existem referências específicas do aluno em atividade nem configuração da IA, tampouco mobile/erros/vazios. Essas telas usarão componentes comuns observados, com fidelidade específica pendente. Mobile: adaptar sidebar para navegação horizontal e cards para uma coluna (estimativa responsiva a verificar).
