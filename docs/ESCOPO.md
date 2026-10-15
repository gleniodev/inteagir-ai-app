# InTEAgir.AI — Escopo do MVP

> **Versão:** 1.0 · **Data:** 14/10/2026 · **Finalidade:** Mostra de Iniciação Científica (MIC) · **Prazo-alvo:** 1 dia de implementação orientada
>
> **Leia também:** [TELAS_E_FLUXOS.md](TELAS_E_FLUXOS.md) · [REGRAS_DA_IA.md](REGRAS_DA_IA.md) · [BACKLOG.md](BACKLOG.md) · [AGENTS.md](AGENTS.md)

## 1. Problema e hipótese

Estudantes autistas podem encontrar barreiras de compreensão, previsibilidade, atenção e interação em materiais escolares que não consideram suas necessidades e preferências individuais. Isso **não** significa que exista uma única interface apropriada para todas as pessoas autistas.

**Hipótese exploratória:** uma apresentação didática personalizável, construída com diretrizes de acessibilidade e preferências relatadas pelo estudante, pode favorecer sua participação e tornar o conteúdo mais compreensível. O MVP registra indicadores iniciais para explorar essa hipótese; **não comprova eficácia clínica ou ganho de aprendizagem**.

**Resultado esperado da demonstração:** o professor prepara uma aula, solicita a adaptação por IA dentro do PWA, revisa o material gerado, publica a versão personalizada e o estudante realiza uma atividade; responsável e psicólogo visualizam um resumo coerente com os registros.

## 2. Público e pessoas envolvidas

- **Aluno:** estudante autista de turma cadastrada; único papel com cadastro de perfil e questionário próprios.
- **Professor:** usuário de demonstração pré-configurado; cria e publica aulas por disciplina e turma.
- **Responsável:** usuário de demonstração pré-configurado; acompanha a sessão do aluno selecionado e registra observação.
- **Psicólogo:** usuário de demonstração pré-configurado; edita diretrizes gerais e consulta métricas/observações, sem diagnóstico automatizado.
- **Equipe da MIC:** constrói e apresenta o protótipo. O responsável técnico coordena integrações e segurança.

**Nota de privacidade:** a versão pública usará apenas alunos e responsáveis **fictícios**. Identificadores e preferências individuais reais, se coletados em um teste autorizado, não podem ser publicados em JSON estático ou compartilhados com contas de demonstração.

## 3. Definição de MVP: o fluxo que precisa funcionar

1. O aluno fictício é criado na turma com nome, responsável associado, e-mail de demonstração/opcional e respostas ao questionário.
2. O professor abre Matemática ou História (pré-configuradas), cria uma aula e cadastra cada assunto separadamente (título e descrição).
3. O professor envia PDF ou imagem, escolhe a turma (por exemplo, **9º ano C**) e vê somente os alunos cadastrados para essa turma no protótipo.
4. O backend prepara o material legível e reúne: **objetivos pedagógicos + prompt-base do psicólogo + perfil do aluno + conteúdo extraído**.
5. A geração é solicitada **na própria interface do PWA**. Antes da aula, o Hermes usa o provedor de texto para analisar materiais e preparar um prompt criativo por assunto, considerando objetivos, diretrizes e preferências. O professor vê somente esse novo prompt organizado e pode editá-lo/salvá-lo. Depois, a aula é produzida com o planejamento revisado e as fontes originais, em JSON validável; imagens complexas são geradas como **arquivos reais** e armazenadas no VPS.
6. O professor revisa, visualiza os avisos de conteúdo não confirmado e publica a aula individual.
7. O aluno responde à explicação e a **três questões por assunto**, podendo pedir ajuda e informar sua opinião.
8. Responsável e psicólogo consultam a conclusão, acertos, ajuda solicitada, tempo aproximado de sessão e observações.
9. Dados e mídias permanecem após atualização da página e reinício normal do serviço no VPS.

## 4. Escopo obrigatório (P0)

Adição autorizada pelo usuário, T20: permitir exclusão individual dos conteúdos/registros e também dos perfis fictícios de alunos. Requer confirmação com alcance da cascata, papéis existentes e preservação dos dados não vinculados. Versões publicadas só são removidas por essa ação explícita confirmada; edição e nova geração continuam preservando histórico.

| Código | Entrega verificável |
|---|---|
| E01 | React + Vite + Tailwind CSS; layout responsivo, instalável como PWA sob HTTPS. |
| E02 | Navegação por seis áreas: Professor, Cadastro do Aluno, Aluno, Responsável, Psicólogo e Configuração da IA. |
| E03 | Usuário fictício/padrão para professor, responsável e psicólogo; cadastro e questionário somente para aluno. |
| E04 | Dados em arquivos JSON **no VPS**, acessados via API Node.js/Express; uploads fora do JSON. |
| E05 | Disciplinas Matemática e História; aula com um ou mais assuntos separados. |
| E06 | Upload de PDF e imagens; exibição do estado do processamento e erro claro se a leitura falhar. |
| E07 | Seleção de turma/aluno e pré-visualização do prompt compilado **sem expor segredos ou identificadores reais**. |
| E08 | Serviço de IA chamado pelo backend, sem enviar o professor para outra aplicação. |
| E09 | Resposta de IA em JSON com esquema controlado, validação de perguntas e revisão antes de publicar. |
| E10 | Pelo menos **uma imagem complexa gerada por IA em arquivo PNG/WebP** no caminho feliz de demonstração; React/Tailwind só a exibem. |
| E11 | Atividade com explicação, três questões, dica, feedback e conclusão. |
| E12 | Registro persistente de eventos essenciais e feedback simples das áreas Aluno e Responsável. |
| E13 | Visão consolidada do psicólogo e editor versionado do prompt-base. |
| E14 | Demonstração fim a fim com **perfis fictícios** e plano de contingência para falha de provedor, identificado como exemplo pré-gerado. |

## 5. Integração de IA: intenção versus confirmação

**Intenção de arquitetura:** Hermes Agent no VPS; **OpenAI Codex via OAuth da assinatura ChatGPT Plus** como provedor principal de texto; **Google Antigravity por meio do executável oficial `agy`** como fallback experimental de texto, idealmente com autenticação Google AI Pro. Backends de imagem são avaliados **separadamente**: gerar texto com uma assinatura **não garante** geração de imagem por essa assinatura.

### Portões de validação obrigatórios (GATES)

- **G1 — Texto principal:** uma chamada real a Codex pelo Hermes responde JSON válido.
- **G2 — Fallback de texto:** `agy` autenticado responde no servidor; integração comunitária é auditada; verificar restrições de uso antes de disponibilizá-la como backend do PWA.
- **G3 — Imagens:** criar uma imagem PNG/WebP real com o backend de imagens escolhido, gravá-la no VPS e exibi-la no PWA. Testar separadamente tentativa primária e reserva.
- **G4 — Segurança:** nenhuma credencial ou porta interna de agente exposta ao browser; nenhum comando livre proveniente de uploads é executado.

**Se um gate falhar:** sinalizar indisponibilidade na UI, registrar erro e usar conteúdo **explicitamente pré-gerado para demonstração**, sem alegar geração em tempo real. Não mudar silenciosamente para APIs pagas ou scraping/rotas privadas.

Referências técnicas: [Hermes — provedores](https://hermes-agent.nousresearch.com/docs/integrations/providers/), [Hermes — geração de imagens](https://hermes-agent.nousresearch.com/docs/user-guide/features/image-generation/), [Antigravity — modo headless](https://antigravity.google/docs/cli/headless/), [Google AI/Antigravity — termos](https://www.antigravity.google/terms), [cobrança separada ChatGPT/API](https://help.openai.com/en/articles/9039756-managing-billing-settings-on-chatgpt-web-and-platform).

## 6. O que fica fora da primeira versão

- Contas reais e autenticação/autorizações completas para professor, responsável e psicólogo; múltiplas escolas.
- Diagnóstico, triagem, classificação de TEA, inferência de emoções ou avaliação clínica por IA.
- Chat livre com o aluno, assistente por voz contínuo, avatar animado, gamificação extensa, análise facial/câmera.
- Geração irrestrita de páginas HTML/JavaScript; o modelo **não executa código** no navegador.
- Sincronização em tempo real entre dezenas de dispositivos, banco de dados relacional, pagamentos, notificações e dashboards avançados.
- OCR perfeito, correção automática de todas as imagens científicas e qualquer promessa de aprendizado comprovado.
- Envio público de informações pessoais/sensíveis reais, ainda que o protótipo tenha aparência profissional.

## 7. Stack e decisões fechadas

- **Frontend:** React, Vite, Tailwind CSS, componentes reutilizáveis; preferir HTML semântico.
- **PWA:** manifesto, service worker e HTTPS; offline apenas para a interface e recursos já armazenados. IA exige conexão.
- **Backend:** Node.js + Express no VPS, endpoint autenticado para a demonstração controlada; Hermes acessado **somente pelo backend**.
- **Persistência:** arquivos JSON gravados atomicamente no VPS (arquivo temporário + rename), com backups; imagens e PDFs em pasta separada, fora de diretório público sensível.
- **Renderização:** JSON descreve conteúdo, escolhas e referências de mídia; React/Tailwind cuidam de layout/interações; **figuras pedagógicas complexas são imagens reais geradas por IA, não desenhadas pelo React**.
- **Fallback:** serviço de texto e serviço de imagem com estados/testes independentes.
- **UI:** poucas escolhas simultâneas, texto adequado à série, sem autoplay ou estímulos inesperados, possibilidade de pedir ajuda/pausar.

## 8. Métricas e o que pode ser concluído

Registrar: aula/assunto, aluno fictício, horário de início e conclusão, quantidade de questões respondidas, acertos da primeira tentativa, tentativas seguintes, dicas solicitadas, tempo com página visível (aproximado), avaliação do aluno (gostei / mais ou menos / não gostei), relato opcional do responsável. **Não chamar permanência na página de atenção ou foco medido**.

Conclusão aceitável para a MIC: “A plataforma conseguiu adaptar exemplos e mídias de maneira diferente para perfis definidos e coletar sinais iniciais de uso; os relatos sugerem pontos de melhoria”. Não anunciar eficácia comprovada, causalidade ou percentuais de melhora sem estudo adequado.

## 9. Definição global de pronto

O MVP está pronto somente se uma pessoa conseguir, **no PWA**, sem editar código: criar um perfil fictício → criar aula e assunto → enviar material → gerar/recuperar adaptação → ver imagem real → aprovar → realizar três questões → abrir relatórios persistentes; e se a equipe conseguir reproduzir o percurso depois de reiniciar o backend.

> **Regra de redução de escopo:** se o prazo apertar, melhorar o caminho feliz com uma disciplina e um assunto é melhor do que criar painéis completos sem um fluxo verificável. Documentar claramente qualquer item não concluído.

## Regra de fidelidade visual (obrigatória)

A pasta **`docs/referencia-telas/`** define a aparência das interfaces e do design system (incluindo logotipo, cores, tipografia, hero, banners, ícones e componentes). A documentação de requisitos define o conteúdo e as funcionalidades. A IA programadora deve inspecionar **as referências reais**, não apenas os nomes, reutilizar assets quando disponíveis, implementar com React + Tailwind e comparar visualmente cada tela. Em conflitos, preservar acessibilidade e regras do produto, documentando o menor desvio necessário. Se a pasta faltar na branch de trabalho, sinalizar a dependência, não inventar um novo estilo.
