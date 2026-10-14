# Aceite P0 — evidências e pendências em 14/10/2026

**Resultado: parcial.** Referência: worktree `fix/T01-pwa-cache`, HEAD `6a66747` com alterações locais preservadas. Dono: agente principal. Verificação final: `npm.cmd test` 26/26; `npm.cmd run build` e `npm.cmd run check:build` passaram. Os testes HTTP usam Express real e arquivos temporários; provedores usam dublês na suíte e service worker é simulado. Separadamente, geração real local de texto/imagem e comparação de perfis têm artefatos em `.ai/evidencias/ia-local-2026-10-14/`. Não houve controle de navegador nesta continuação.

## Escopo obrigatório e backlog

| Requisito / tarefas | Evidência disponível | Falta para aceite integral |
|---|---|---|
| Design / T00 | Quatro referências inventariadas, mapeamento e diferenças em `.ai/VISUAL.md` | Referências próprias de aula/IA e assets originais ausentes; comparação atual de todas as telas pendente |
| E01 / T01 | React/Vite/Tailwind; manifesto, ícones e dez recursos do shell entregues pelo Express; testes de cache versionado e preservação de caches alheios | Mobile, teclado, instalação e offline em navegador; HTTPS público |
| E02 / T01 | Seis áreas declaradas em `src/App.jsx`, componentes existentes e papéis aceitos pela API | Navegação atual nas seis áreas em desktop/mobile/teclado |
| E03 / T04/T15 | Cadastro só de aluno; campos fictícios validados; seletor de papéis de demonstração e permissões HTTP testadas | QA dos formulários e orientação de demonstração no navegador; acesso não é autenticação de produção |
| E04 / T02/T03 | Contratos Zod, JSON com fila/gravação atômica/backup; 50 escritas concorrentes e recarga do armazenamento testadas; uploads separados | Revisão do LT humano; operação no VPS depois da conclusão local e autorização |
| E05 / T05 | Matemática com dois assuntos no fluxo completo; História com dois assuntos, IDs e material preservados após reinicializar API | QA da criação/edição pela UI e geração real por disciplina |
| E06 / T06 | PDF pesquisável com extração; imagem com preparação manual; MIME/conteúdo/tamanho, download e arquivo perdido testados | Upload/estados pela UI no navegador; OCR não está configurado |
| E07 / T07 | Filtro 9C; prompt com versão/diretrizes/material/preferências e descrição geral; campo confirmado na prévia/chamada; alteração concorrente só da descrição descarta resultado antigo | Seleção e inspeção completas pela UI; nova composição não foi chamada em provedor real nesta correção |
| E08 / T08 | Login novo e duas respostas reais válidas pelo backend; openai-codex/gpt-6-sol com lock confirmado e ferramentas desabilitadas | Revisão humana/PWA e VPS posteriores; testes com dublê permanecem separados da prova real |
| E09 / T10 | JSON/questões/checklist/imagem validados; invalida prévia após mudar preferências/diretrizes, preservando publicações; resultado concorrente obsoleto descartado | Revisão pedagógica/visual na UI |
| E10 / T09 | Experimento agy gerou/salvou/serviu PNG real, mas integração agora bloqueada pelas condições do provedor | Backend de imagem autorizado, revisão do professor/PWA, segundo caminho e VPS |
| E11 / T11 | Renderer implementado; fluxo HTTP com duas explicações e seis questões, três alternativas, dica/feedback/conclusão; retorno preserva respostas | Operação do renderer, retorno, ajuda, mídia e conclusão no navegador; caminho real depende da IA |
| E12 / T12 | Eventos idempotentes, primeira tentativa, ajudas, opinião, pausa, tempo aproximado e progresso preservados; relatórios HTTP consistentes após reinicialização | Atualização/retomada e visibilidade da página no navegador real |
| E13 / T13 | Observação do responsável, nota humana e diretrizes versionadas testadas; publicações preservam versão anterior | Salvar/restaurar e comparar acompanhamento pela UI |
| E14 / T14/T15 | Fluxo HTTP completo com contingência rotulada; falhas honestas; imagens necessárias sem adaptador bloqueiam prévia incompleta | Demonstração integral pelo PWA com origem real do texto/imagem; revisão final e infraestrutura |

## Gates de BACKLOG.md

| Gate | Estado e evidência necessária |
|---|---|
| G1 — texto Codex/Hermes | Observado localmente: duas respostas válidas, provedor/modelo/lock, falhas e limites em IA_LOCAL.md e evidências. T08 no VPS permanece pendente |
| G2 — agy | CLI oficial executou headless local e produziu imagem; nenhum plugin comunitário usado. Texto reserva/VPS e auditoria completa pendentes |
| G3 — imagem primária | Bloqueado para uso no PWA: prova técnica preservada em .ai/evidencias/ia-local-2026-10-14, mas condições do agy não foram liberadas. Escolher backend autorizado; ver IA_LOCAL.md |
| G4 — imagem reserva | Não verificado. Não anunciar fallback disponível |
| G5 — dois perfis | Duas gerações reais por perfil: explicação curta × passos detalhados com astronomia, conceitos preservados na amostra; JSONs em evidência. Comparação no navegador/revisão humana pendentes |

ESCOPO.md usa **G4** para segurança, enquanto BACKLOG.md usa G4 para imagem reserva. Segurança local tem evidências de validação, permissões, isolamento da API, ausência de chamadas quando desativado e sanitização; falta verificar a instância real autorizada e a implantação. Esses identificadores não significam o mesmo gate.

## Testes mínimos de AGENTS.md

| Critério | Evidência e limite |
|---|---|
| A01/9C cadastra preferências e reabre | Criação, edição, GET e reinicialização da API testados; refresh atual do frontend pendente |
| Professor cria dois assuntos e material | Fluxo HTTP em Matemática e verificação de História; UI pendente |
| 9C lista seus alunos | Filtro 9C e turma desconhecida testados |
| JSON, imagem real, prévia e publicação | Texto real observado; experimento de imagem não libera integração; publicação e fluxo completo com contingência testados. Falta backend de imagem autorizado/PWA |
| Três opções, gabarito, dica e resposta | Validação e persistência testadas; correção pedagógica continua exigindo revisão humana |
| Responsável/psicólogo consultam o mesmo registro | Comparação dos relatórios HTTP, observações, notas humanas e versões testadas; não mede foco |
| Falha não publica conteúdo incompleto | Testes de JSON, imagem inexistente, provedor indisponível e imagem necessária sem adaptador |
| Atualizar frontend/reiniciar backend preserva dados | Recarga do armazenamento/API e mídias testada; refresh e reinício pelo percurso completo de navegador pendentes |

## Próximas ações que dependem de definição externa

1. Texto permanece configurado; imagem experimental foi desativada/bloqueada após auditoria dos termos oficiais. API de imagem autorizada solicitada ao usuário, sem pedir segredos. Servidor antigo 3001 precisa de Ctrl+C no terminal original e `npm.cmd start`; revisão automática rejeitou Stop-Process (“blocked by policy”), processo preservado. Não repetir login nem copiar credenciais.
2. Definir/testar backend autorizado para imagem e reserva, revisar a prévia com professor. Reservas continuam Não verificado; não substituir por fixture automaticamente.
3. Retomar QA de navegador quando o usuário encerrar o adiamento: seis áreas, teclado, vazios/erros, mobile, renderer completo, atualização, instalação e offline reais. Não contornar a permissão negada do Chrome.
4. Depois da conclusão local e autorização, resolver a diferença do remoto antes de enviar e planejar VPS/HTTPS. Nenhum push ou deploy autorizado.

Não há evidência suficiente para declarar o MVP concluído. Evitar novos recursos P1/P2 enquanto esses requisitos P0 estiverem pendentes.
