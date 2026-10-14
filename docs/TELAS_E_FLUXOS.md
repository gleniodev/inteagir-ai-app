# InTEAgir.AI — Telas e fluxos

> **Versão:** 1.0 · **Escopo:** navegação e comportamento que podem ser implementados em um dia. Consulte [ESCOPO.md](ESCOPO.md) e [REGRAS_DA_IA.md](REGRAS_DA_IA.md).

## Referências visuais obrigatórias

A implementação visual **deve seguir fielmente** os arquivos disponibilizados em `docs/referencia-telas/` no repositório. Essa pasta define o **design system visual** de todas as áreas: logo, cores, fontes, espaçamento, grid, cabeçalho, hero, banners, botões, ícones, cards, ornamentos, responsividade e estética das telas. Não substituir por interface genérica, não simplificar arbitrariamente as áreas nem criar outra linguagem visual.

O comportamento, conteúdo, campos e jornadas **continuam sendo definidos por este documento, `ESCOPO.md`, `REGRAS_DA_IA.md` e `BACKLOG.md`**. Mockups são referência visual, não autorização para incluir funções de cadastro, marketing ou telas sem sentido operacional. A tela visual deve ser adaptada aos conteúdos e controles corretos preservando o design.

Para cada página, a equipe deve (1) localizar e visualizar a(s) imagem(ns) de referência; (2) registrar correspondência `tela → referência`; (3) reutilizar assets originais quando disponíveis; (4) implementar com Tailwind os tokens e componentes comuns; (5) comparar visualmente a tela implementada com a referência antes da aceitação. Acessibilidade pode exigir ajustes mínimos, que devem ser documentados.

Se a pasta não estiver presente na branch de trabalho, **não inventar o design**: registrar dependência e solicitar a inclusão dos arquivos no repositório/ambiente, enquanto as tarefas não visuais podem continuar.

## 1. Mapa de navegação

```text
Início / Seletor de área (demonstração)
├── Professor
│   ├── Disciplinas (Matemática / História)
│   ├── Aulas da disciplina
│   └── Criar/Editar aula (onboarding em etapas)
│       ├── Assuntos
│       ├── Materiais
│       ├── Turma e alunos
│       ├── Prompt/geração
│       └── Prévia e publicação
├── Cadastro do aluno
│   ├── Identificação e turma
│   └── Questionário de preferências
├── Aluno
│   ├── Minhas aulas
│   ├── Explicação visual
│   ├── Questões + ajuda
│   └── Conclusão + feedback
├── Responsável
│   └── Resumo do aluno + observação
├── Psicólogo
│   ├── Diretrizes (prompt-base)
│   └── Sessões / observações
└── Configuração da IA
    ├── Estado dos provedores
    └── Teste de conectividade / logs sanitizados
```

**Navegação:** barra superior com logo InTEAgir.AI, identificação da área ativa, botão “Voltar ao início” e progresso quando houver etapas. Disciplinas previamente cadastradas; outras disciplinas ficam para depois. Responsável e psicólogo têm acesso de demonstração, **não** perfis/autenticação de produção.

## 2. Componentes visuais compartilhados

- `AppShell`: cabeçalho, tipografia, cores da identidade visual, conteúdo centralizado e navegação previsível.
- `StepProgress`: “Etapa 2 de 5”, sem contagem regressiva ou pressão temporal.
- `Button`, `Card`, `Field`, `FileDropzone`, `StatusMessage`, `Dialog`.
- `LessonRenderer`: percorre as etapas estruturadas do JSON; mostra **uma unidade principal por tela**.
- `ImagePanel`: carrega **PNG/WebP gerado**, descrição textual, zoom opcional e estado de erro; não inventa figuras complexas por CSS/SVG.
- `QuestionCard`: três alternativas, seleção, dica, novas tentativas e feedback textual.

Padrões: contraste suficiente, foco de teclado, labels em campos, tamanho de toque adequado, cores não como único indicador, sem reprodução automática de sons, suporte a redução de movimento; ajustar a densidade visual ao perfil sem comprometer a legibilidade.

## 3. Área do professor — fluxo completo

### P01 — Disciplinas e aulas

**Conteúdo:** cards “Matemática” e “História”; ao escolher, lista das aulas existentes e botão `Criar nova aula`. Mostrar status “Rascunho”, “Gerando”, “Para revisar”, “Publicada” ou “Falha”.

### P02 — Etapa 1/5: assuntos da aula

- Campos: disciplina (preenchida), título da aula, descrição geral opcional.
- Grupo repetível de assuntos, **cada assunto com título, descrição e objetivo**.
- Botões `Adicionar assunto`, `Remover assunto`, `Continuar`.
- Validação: pelo menos um assunto; nenhum título/objetivo em branco; não juntar todos em um único campo.

### P03 — Etapa 2/5: materiais

- Upload de múltiplas fotos (`jpg`, `png`, `webp`) e PDFs, com limite de arquivo configurável e tipo validado no servidor.
- Mostrar nome, tamanho, progresso e status de extração: `Enviado`, `Lido`, `Necessita revisão`, `Erro`.
- Um material pode servir a todos os assuntos ou ser vinculado a um assunto específico.
- PDFs pesquisáveis têm texto extraído no backend; PDFs escaneados/fotos dependem de visão/OCR ou de preparação manual. Não fingir extração bem-sucedida.

### P04 — Etapa 3/5: turma e estudantes

- `Selecionar turma` (inicialmente `9º ano C`).
- Listar automaticamente somente os alunos **cadastrados no protótipo** para a turma; indicar “Perfil incompleto” se faltar questionário.
- Permitir selecionar um ou mais alunos, mas gerar e revisar **um por vez** no MVP.

### P05 — Etapa 4/5: IA e geração

- Exibir três blocos do prompt composto: `Diretrizes gerais`, `Informações da aula`, `Preferências do aluno`.
- Prévia do **prompt que será enviado** (sem segredos, nomes reais ou dados clínicos).
- Botão `Gerar aula adaptada` → backend inicia processo → UI mostra estados: `Preparando material`, `Gerando texto`, `Gerando imagem`, `Validando`, `Concluído`.
- Mostrar provedor usado e fallback se acionado (por exemplo `Codex (texto)`), sempre com estado real retornado pelo backend.
- Se imagens falharem, mostrar falha e ação `Tentar novamente`; **não fabricar sucesso**. Para demo, pode haver `Usar exemplo pré-gerado`, com identificação explícita.

### P06 — Etapa 5/5: revisão e publicação

- Prévia real da aula do aluno, com imagem gerada, questões e gabarito visível **apenas ao professor**.
- Checklist: conceitos corretos? imagem representa o assunto sem enganos? perguntas têm uma alternativa correta? leitura adequada? preferências respeitadas?
- `Regerar` (com justificativa opcional), `Salvar rascunho`, `Publicar para aluno`.
- Publicação cria vínculo **aluno + aula + versão do material**; não altera versões já respondidas sem confirmação.

## 4. Cadastro do aluno — fluxo

### A01 — Identificação

Campos: `Nome completo` (usar nome fictício em demonstração), `Turma`, `Responsável vinculado`, `E-mail` (opcional no MVP). Gerar ID interno que não dependa do nome. Mostrar orientação breve sobre privacidade.

### A02 — Questionário fixo (10 perguntas)

1. Quais temas interessam? (`dinossauros`, `animais`, `trens`, `esportes`, `espaço`, `jogos`, `outro`; múltipla seleção).
2. Que exemplos visuais prefere? (`fotos reais`, `desenhos`, `ícones simples`, `só texto`, `tanto faz`).
3. Como prefere a explicação? (`ler`, `ouvir`, `ver exemplos`, `combinação`).
4. Qual tamanho de bloco de texto é mais confortável? (`curto`, `completo`, `tanto faz`).
5. O que deve ser evitado? (`sons`, `movimentos`, `muitos elementos`, `cores intensas`, `nada`, `não sei`; múltipla seleção).
6. Como quer responder? (`alternativas`, `seleção em imagem`, `digitar`).
7. Quando está difícil, o que ajuda? (`dica`, `outro exemplo`, `repetir`, `pausa`).
8. Como prefere receber feedback? (`mensagem curta`, `explicação`, `imagem discreta`).
9. Quer ver o progresso? (`sim`, `não`, `tanto faz`).
10. Algo que gostaria de incluir/evitar? (texto opcional).

Cada pergunta em uma tela/cartão, `Voltar`, `Avançar`, `Prefiro não responder` quando couber. Salvar preferências como escolhas, **não converter em diagnóstico, “nível de foco” ou inteligência estimada**. Permitir editar depois.

## 5. Área do aluno — fluxo

### E01 — Início do aluno

- Mostrar apenas as aulas **publicadas** para o aluno selecionado; card com disciplina, assunto e botão `Começar` ou `Continuar`.
- Aluno pode acessar com seletor de perfil fictício no demo; não presumir segurança nesse seletor.

### E02 — Aula

- `Explicação`: título, texto simples, uma imagem gerada quando pedagógica, descrição acessível e botão `Próximo`.
- `Questão`: três alternativas, uma resposta por vez; opção `Preciso de ajuda` e `Tentar novamente`. Feedback sem sons, punições, temporizadores ou animações compulsórias.
- `Pausa`: suspender medição de sessão ativa; pode retomar do último estado.
- A cada resposta persistir `firstTryCorrect`, número de tentativas e ajudas; não guardar apenas nota final.

### E03 — Conclusão

- Mostrar `Você concluiu X de Y atividades`, com texto neutro; evitar competição/comparação.
- Pergunta opcional: `Gostei`, `Mais ou menos`, `Não gostei`, `Prefiro não responder`.
- Botão `Voltar às aulas`.

## 6. Área do responsável

- Perfil de demonstração e seleção do aluno fictício vinculado.
- Lista simples de sessões com disciplina, data, assuntos, itens concluídos e pendentes.
- Texto de resumo da aula; ver resumo das respostas e das ajudas sem rótulos comportamentais.
- Formulário: `O que você observou?` e categoria opcional (`dificuldade com texto`, `imagem`, `interação`, `interrupção`, `outro`); registrar data e origem da observação.
- Sem chat, notificações, diagnóstico ou acesso a outros alunos reais.

## 7. Área do psicólogo

- Aba `Diretrizes`: editor do prompt-base, `Salvar nova versão`, `Restaurar versão anterior`; visualização de qual versão foi aplicada em cada aula.
- Aba `Acompanhamento`: sessões do aluno fictício, conclusão, primeira tentativa, dicas, tempo de página visível aproximado, avaliação relatada e observações do responsável.
- Campo `Hipótese/nota profissional` opcional, claramente marcado como **registro humano**. Nenhuma inferência clínica automática.
- Se usar nota 0–10 de agrado/foco, registrar **quem atribuiu e o contexto**; nunca gerá-la automaticamente a partir do tempo de tela. Para P0, preferir feedback qualitativo.

## 8. Área Configuração da IA

- Estado dos adaptadores: `Codex OAuth (texto)`, `Antigravity/agy (texto, experimental)`, `Imagem primária`, `Imagem reserva`.
- Indicadores reais: `Não configurado`, `Funcionando`, `Falha`, `Não verificado`.
- Testes manuais: `Testar texto JSON`, `Testar geração PNG/WebP`, `Testar fallback` (somente usuário demonstrativo autorizado pelo backend).
- Exibir versão da configuração e registro resumido dos erros **sem tokens, prompts completos sensíveis ou credenciais**.
- O prompt-base é editado **somente na área do psicólogo**. Esta área apenas mostra a versão em uso.

## 9. Casos vazios, falhas e retorno

| Situação | Comportamento obrigatório |
|---|---|
| Nenhum aluno na turma | Estado vazio, link para Cadastro do aluno. |
| Material ilegível | Aviso e solicitação de substituição; não inventar conteúdo. |
| Falha de texto principal | Tentar reserva **somente se validada e permitida**; registrar provedor e erro. |
| Falha de imagem | Mostrar estado de falha e oferecer tentar novamente; exemplo pré-gerado claramente rotulado. |
| JSON inválido | Não publicar; informar etapa/questão que precisa de correção. |
| Atualizar navegador | Recuperar dados persistidos e sessão salva. |
| Internet indisponível | Interface básica offline, sem promessa de IA offline. |
| Dado não autorizado | Bloquear acesso; para teste real, é exigida autenticação/autorização adequadas. |

## 10. Demonstração recomendada para a MIC

1. Selecionar dois perfis fictícios de mesma turma com interesses diferentes (futebol × trens).
2. Professor criar aula “Sistema Solar” com um assunto, anexar imagem/PDF fictício e gerar adaptação pelo PWA.
3. Comparar duas versões da explicação e imagens **realmente geradas** quando o provedor estiver disponível.
4. Revisar/publicar uma versão, resolver três questões como aluno e visualizar resultados nas áreas Responsável/Psicólogo.
5. Se o serviço de IA falhar, mostrar o modo contingência com mídia **pré-gerada**, sem afirmar geração ao vivo.
