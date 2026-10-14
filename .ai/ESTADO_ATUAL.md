# Estado atual — 14/10/2026

## Checkpoint vigente — memória consolidada antes da retomada

- **Push confirmado:** fix/T01-pwa-cache enviada a origin inteagir-ai-app.git, upstream configurado e árvore limpa. git ls-remote confirmou f5d42572f8deb2e958b5df6527accf51d0d9af61 igual ao HEAD; main preservada em 58beeb5. Este registro documental posterior segue na mesma branch. Destino/envio não são mais bloqueios; não houve deploy. Para SHA final consultar Git/upstream, sem usar HEADs históricos abaixo como estado atual.

- **Destino remoto confirmado pelo usuário:** usar origin atual inteagir-ai-app.git. Envio autorizado da branch fix/T01-pwa-cache; URL/main preservadas, sem deploy. Checkpoints locais 794d0b5/a2c21e7. Conferir SHA remoto igual ao HEAD após push; notas de destino pendente abaixo são históricas.

- **Resultado da preparação solicitada:** código, evidências e memória commitados em **794d0b5**, branch fix/T01-pwa-cache; 26 testes/build/check:build passaram novamente e a árvore ficou limpa. Registro documental posterior pode avançar HEAD; conferir Git. **Nenhum push realizado até esta nota**, pois a definição do repositório de destino continua sem resposta. .env/.local/dados privados permaneceram excluídos. As referências a HEAD 6a66747/alterações não commitadas abaixo descrevem o estado de entrada anterior ao checkpoint.

- Pedido posterior do usuário: **atualizar o remoto após consolidar memória**. Autorização de envio recebida; falta resolver destino (origin inteagir-ai-app.git versus URL anteriormente informado inteagir-ai.git). Pergunta enviada; sem resposta até esta nota. Origin consultado: somente main em 58beeb5. Checkpoint local será preparado na branch atual, sem alterar main/force push/deploy. Varredura pré-envio de 78 arquivos e quatro commits locais/capturas fictícias não encontrou credencial conhecida/padrão sensível; não inclui .env/.local/estado privado. Conferir SHA/log/status após a operação antes de afirmar push concluído.

- **Ler .ai/RETOMADA.md primeiro:** resumo operacional único, com comandos e bloqueios. Usuário pediu atualizar memória para continuar depois. Objetivo global registrado como blocked, sem declaração de conclusão.
- Git observado: fix/T01-pwa-cache, HEAD 6a66747; muitas alterações locais/não rastreadas preservadas, sem novo commit/push/deploy. Origin permanece inteagir-ai-app.git; diferença com URL inteagir-ai.git pendente.
- Último código T07/T10: descrição geral incluída no prompt; alterações de título/descrição durante inferência descartam resultado antigo e preservam rascunho. Preferências/diretrizes também invalidam prévias pendentes sem alterar publicações. Contrato pedagógico mantido.
- Última validação de aplicação: **26/26 testes**, build e check:build passaram; diff --check passou. Esta consolidação modifica só documentação, sem repetir testes/gates.
- Texto real Hermes/Codex já testado; login novo concluído, .env privado habilitado para openai-codex/gpt-6-sol. Nenhuma credencial deve ser copiada para Git/chat. Runtime dedicado e operação em docs/IA_LOCAL.md e RETOMADA.md.
- **Imagem agy experimental DESATIVADA/BLOQUEADA** por condições do provedor: prova técnica anterior preservada, mas não aprova uso pelo backend do PWA/G3. Não reativar por flag. Definição de API de imagem disponível/autorizada solicitada ao usuário, sem resposta. Fallback não verificado.
- Evidências anteriores em .ai/evidencias/ia-local-2026-10-14: texto JSON, comparação de perfis e PNG experimental real. Nenhuma publicação automática; revisão humana do professor pendente.
- Última API em 3001: sessão demonstrativa ia + HTTP 200 mostraram texto/imagem Não configurado; servidor antigo ainda não reiniciado. Ctrl+C no terminal original e npm.cmd start são necessários para carregar código/.env. Stop-Process foi rejeitado pela revisão de aprovação (blocked by policy); sem alternativa de encerramento.
- Gateway Hermes tinha handle exec 39886; **atividade atual não presumida**. Revalidar handle/porta/API antes de iniciar outra instância. Login/device flow não está pendente.
- QA de navegador/seis áreas/teclado/mobile/instalação/offline continua expressamente adiado após permissão negada. Não tentar alternativas. Antes de UI consultar referências/VISUAL.md; aluno.jpeg é cadastro.
- npm ci: última tentativa falhou EPERM por binários carregados. Restauração offline concluída sem mudança no lockfile, sem encerrar processos. Não repetir enquanto módulos estiverem em uso. Nenhuma dependência nova nesta consolidação.
- Próximas dependências: reinício manual do servidor, backend de imagem autorizado, revisão humana e liberação do QA de navegador. Concluir local antes do VPS; sem deploy/push autorizados. Não criar P1/P2 para substituir esses requisitos.

## Registro anterior à consolidação — histórico, não instrução vigente

As notas abaixo foram preservadas para rastreabilidade. Afirmações antigas de ativação da imagem, login pendente, handles vivos ou contagens menores são históricas; prevalece o checkpoint acima.


- **Última continuação T07/T10:** descrição geral da aula era omitida do prompt e da comparação durante inferência. `compilePrompt` agora inclui `informacoesAula.descricaoAula` (fallback vazio para registros antigos). Teste reproduziu ausência e confirma prévia/chamada coerentes e descarte HTTP 409 ao editar só descrição ou título durante geração, preservando rascunho. **26/26 testes**, build e check:build passaram nesta continuação. Sem chamada real de IA, UI, dependência ou contrato pedagógico novo. Não repetir npm ci com binários carregados: falha EPERM anterior já registrada; dependências foram restauradas sem mudar lockfile.

- **Atualização vigente desta continuação:** T07/T10 corrigida: editar preferências/turma invalida apenas a prévia daquele aluno; nova versão de diretrizes invalida prévias pendentes. Nome/e-mail não invalidam; publicações e prévias de outros alunos preservadas. Teste reproduziu erro (200 em vez de 404) e depois passou; suíte 26/26 antes da checagem final abaixo.
- **Imagem experimental agora desativada/bloqueada:** auditoria dos termos oficiais Antigravity encontrou restrição da cláusula 6 a acesso por terceiros; documentação headless não esclarece uso como backend de outro produto. Não liberar essa integração somente por funcionar tecnicamente. .env privado agora tem INTEAGIR_AGY_IMAGE_ENABLED=false; configurá-lo true lança erro antes de ler perfil/iniciar CLI. Texto Hermes preservado. Código/PNG/evidências anteriores mantidos como experimento, sem aprovação do gate G3 para o PWA. Fontes em docs/IA_LOCAL.md. Pergunta sobre API de imagem já disponível/autorizada enviada ao usuário, sem solicitar segredos; sem resposta até aqui.
- Verificação final desta continuação: npm.cmd ci falhou EPERM ao remover lightningcss nativo em uso; processos preservados. npm.cmd install --ignore-scripts --offline restaurou dependências sem mudar package-lock.json (zero vulnerabilidades; avisos de limpeza de binários carregados preservados). Depois disso **26/26 testes**, build e check:build passaram. Configuração privada conferida sem inferência: texto habilitado, imagem desativada. Nenhuma dependência nova, chamada real de IA, UI ou contrato alterado nesta continuação.

- Branch `fix/T01-pwa-cache`, alterações anteriores preservadas, agente principal sem outras frentes. Origin continua inteagir-ai-app.git; sem push/deploy/VPS.
- Usuário autorizou configurações reais/locais. Login novo Codex concluído no Hermes dedicado; não há confirmação de dispositivo pendente. Não repetir login nem copiar credenciais existentes. Fonte `.local/hermes-src` no commit `0e427d788d253630d38a3a51cd76849e73cd6925`; Python 3.14.7; perfil/runtime em LocalAppData/InTEAgir-Hermes-{Profile,Runtime}. ACLs privadas e adoção de login externo desabilitada. Lançador `scripts/hermes-local.js` filtra credenciais ambientes.
- **T08/T10/T14: duas respostas reais válidas** em openai-codex/gpt-6-sol pelo backend HTTP. API autenticada confirmou zero conjuntos habilitados entre 27; socket apenas 127.0.0.1:8642. Sessão independente por assunto com lock confirmado, JSON validado, dois assuntos/seis questões, sem fallback/publicação. Cálculos e gabaritos da amostra inspecionados; revisão humana do professor necessária. Evidência `.local/gates/2026-10-14T13-39-12-959Z`; docs/IA_LOCAL.md descreve limites/comandos. .env privado ativado para esse modelo; npm start agora carrega .env quando presente.
- Primeiro teste real foi recusado porque /v1/chat/completions omite runtime no commit instalado. Adaptador corrigido para /api/sessions/:id/chat, exige provedor/modelo/lock confirmado e sessão correspondente. /v1/toolsets retorna envelope, não a lista antiga documentada. Testes usam dublê separado, jamais prova de gate real.
- Instalação via PM oficial com extras web e sms (sms declara apenas aiohttp exigido pela API; nenhum canal SMS configurado). Sem dependência npm nova, PATH global, alteração de política do Windows ou serviço automático. Runtime em D: falhou WinError 5; LocalAppData resolveu. Download do instalador PS rejeitado anteriormente por revisão automática; script não executado.
- **T09/G3 local observado:** adaptador agy oficial 1.3.3 gerou imagem pelo backend, converteu JPG nativo em PNG e vinculou a prévia. PNG 1376 × 768/734.252 bytes, aberto visualmente: quatro vagões, um azul e três cinza. Backend reiniciado relê/serve os mesmos bytes via HTTP autenticado. Evidência durável em `.ai/evidencias/ia-local-2026-10-14/` (imagem, prévia, hash e comparação). Imagem levou 85.213 ms. Perfil LocalAppData/InTEAgir-Agy-Profile com ACLs privadas, comandos/web/MCP negados, créditos adicionais/telemetria desativados; sessão gerida pelo CLI/keyring sem extração/cópia de token. Modelo exato de imagem não informado, sem inventar identificação. G4/fallback continua Não verificado; G2/VPS pendente.
- **G5 local:** dois perfis fictícios só texto na mesma aula geraram explicação curta × passos detalhados com exemplos de astronomia. Conceitos/gabaritos da amostra inspecionados, sem substituir revisão humana. Nenhum conteúdo publicado. Navegador não acessado.
- Verificação final: **26/26 testes**, `npm.cmd run build` e `npm.cmd run check:build` passaram após as alterações. Sem dependência npm nova. Aceite global continua parcial; docs/ACEITE_LOCAL.md distingue evidência local de PWA/VPS/revisão humana.
- Configuração privada de texto ativada; imagem experimental desativada; `npm.cmd start` e `npm.cmd run server` agora carregam `.env` se existir. Servidor já aberto em 3001 ainda usa configuração anterior: revisão automática rejeitou comando de reinício com Stop-Process (“blocked by policy”); processo preservado, sem alternativa de encerramento. Usuário deve encerrar com Ctrl+C no terminal original e executar npm.cmd start. Hermes dedicado está em primeiro plano (sessão exec 39886); se terminar, iniciar novamente por scripts/hermes-local.js gateway run, sem serviço automático.
- T02/T03 já implementadas. T01 shell versionado/completo preserva caches alheios; verificador HTTP real do build não comprova instalação/offline do navegador. T11/T12 Voltar e progresso preservados; contratos em docs/CONTRATOS.md/DEC-004. T06/T15 upload/permissões/erros e T07 snapshot na fila cobertos.
- QA visual/teclado/mobile/seis áreas/instalação/offline no navegador continua **adiado pelo usuário** após permissão negada no Chrome. Não tentar alternativa. Referências e mapeamento em VISUAL.md; aluno.jpeg é cadastro. Nenhuma UI alterada nesta configuração.

## Registros anteriores de continuação — histórico após `6a66747`

- Última verificação T01/T12/T15: `npm.cmd test` **13/13**, build e novo `npm.cmd run check:build` passaram. Teste de tempo com relógio controlado verifica exclusão de pausas/ausência de pulsos, retomada após reinício e relatórios iguais entre responsável/psicólogo. Verificador do build abre Express HTTP com dados temporários: 10 assets reais íntegros, worker versionado/no-cache, manifesto, tamanhos de ícones, API 401/no-store e caminhos privados 404. Não acessa navegador e não comprova instalação/offline real. Sem dependências ou UI novas.
- Configuração de IA local solicitada ao usuário por pergunta assíncrona; nenhuma autorização/configuração recebida nesta verificação. Próximo avanço do caminho de geração real depende dessa definição; não consultar credenciais existentes nem iniciar VPS. QA de navegador continua expressamente adiado.
- Continuação mais recente T07/T10: corrigida corrida na preparação do exemplo pré-gerado. Leitura de aula/material/perfil/diretrizes, validação e preparação local agora ocorrem na mesma fila da gravação. Teste HTTP reproduziu objetivo antigo com versão nova do prompt antes da correção; depois confirmou objetivo revisado, preferência só texto e prompt v2 coerentes. `npm.cmd test` **12/12** e build passaram. Sem mudança de UI, contratos ou dependências. Gates reais permanecem pendentes; isso só valida contingência local.
- Última continuação (T06/T15, 14/10/2026): usuário adiou QA visual devido à permissão do Chrome; nenhum navegador acessado. Agente principal na branch `fix/T01-pwa-cache`, alterações anteriores preservadas. API mantém cabeçalhos de proteção/no-store também no limite 429; material cujo arquivo foi perdido retorna JSON 404 legível, sem caminho interno. Dois defeitos reproduzidos por testes antes da correção.
- Validação mais recente: `npm.cmd ci` passou (120 pacotes, zero vulnerabilidades reportadas), `npm.cmd test` **11/11** e `npm.cmd run build` passaram. Novos testes HTTP verificam MIME/conteúdo divergentes, limite de 5 MB, download íntegro/arquivo perdido e permissões de materiais/diretrizes. Dados isolados em diretórios temporários; sem UI, dependência, contrato ou credencial alterados.
- Pendências vigentes: QA de navegador/teclado/mobile/instalação/offline adiado a pedido do usuário; configuração local autorizada de IA e gates reais ainda necessários. VPS adiado até conclusão local; nenhum push/deploy. Os registros de 7/9 testes abaixo correspondem às verificações anteriores.
- Continuação local T01: branch `fix/T01-pwa-cache`; service worker pré-instala shell completo, recebe versão por conteúdo do build e remove apenas caches do InTEAgir. `tests/pwa.test.js` cobre offline simulado, atualização, falha e exclusão da API. Testes 9/9 e build passaram. Nenhuma dependência adicionada ou UI alterada.
- Acesso CUA ao navegador em 127.0.0.1:5173 rejeitado: usuário negou permissão. Não houve acesso por alternativa. QA visual/mobile/teclado/instalação/offline no navegador permanece pendente.
- Orientação atual do usuário: concluir funcionalidade local antes de iniciar VPS. Gates de IA continuam não verificados; configuração local autorizada ainda necessária. Não consultar/copiar credenciais existentes.
- Dono: agente principal, sem frentes concorrentes. Branch preservada: `feat/T00-mvp-base`.
- T02/T03 já implementadas; não recriar contratos ou persistência. Os checkpoints abaixo são históricos.
- Git na entrada: README.md e docs/BACKLOG.md modificados; .ai/evidencias/ não versionada. Alterações preservadas. Origin continua inteagir-ai-app.git; nenhum push/deploy.
- Documentação relida; quatro referências e seis capturas existentes abertas. Comparação em VISUAL.md; capturas anteriores não constituem novo teste do navegador.
- `npm.cmd ci` passou: 120 pacotes, zero vulnerabilidades reportadas. Nenhuma dependência adicionada. Aviso externo de configuração node-linker não impediu os comandos; configuração preservada.
- `npm.cmd test`: **7/7 passaram** nesta retomada, incluindo fluxo HTTP com dois assuntos/PDF/contingência/seis questões/relatórios/reinício, entradas inválidas, imagem ausente e preservação de versões.
- `npm.cmd run build`: passou nesta retomada.
- Próximo: QA de navegador das seis áreas, teclado, estados vazios, percurso completo mobile e offline/PWA. Capturas existentes não aprovam esses itens.
- Gates reais de texto/imagem precisam de configuração autorizada no VPS. Nenhuma credencial local consultada ou copiada. Contingência continua `Pré-gerado para demonstração`.

## Histórico de checkpoints anteriores

- Branch: `feat/T00-mvp-base`; origem inicial `58beeb5`. Git inicialmente limpo; nenhum código executável pré-existente.
- Documentos lidos: AGENTS.md (raiz), docs/{ESCOPO,TELAS_E_FLUXOS,REGRAS_DA_IA,BACKLOG}. Não existem cópias dos quatro últimos na raiz; usar as existentes em docs/.
- Remoto existente: inteagir-ai-app.git, diferente do URL inteagir-ai.git informado. Preservado; nenhum push/deploy autorizado.
- Dono das tarefas desta sessão: agente principal, sem frentes concorrentes.
- T00: quatro JPEGs abertos visualmente; inventário em VISUAL.md. Tokens estimados serão registrados no CSS; não há fontes, logos ou ilustrações separados.
- Próximo: contratos T02 e armazenamento T03; depois cadastro/aula/relatórios locais. Nenhum gate de IA passou.
- Ambiente: Node v24.13.1; npm.cmd 11.18.0 (npm.ps1 bloqueado por política existente). agy.exe presente; Hermes não encontrado no PATH. VPS/credenciais não fornecidos.
- Build/testes: ainda não executados, projeto sem package.json antes desta sessão.
- Imagem de contingência solicitada pela ferramenta integrada; pendente de arquivo e inspeção. Não comprova T09/G3 pelo backend.

## Checkpoint de implementação (antes da revisão final)
- API e seis áreas implementadas localmente; contratos validados por Zod. Dados gravados pelo backend em JSON atômico com backup e fila.
- Imagem `fixtures/media/fracao-trem.png` efetivamente gerada via imagegen, copiada e inspecionada: quatro vagões, um azul/três cinza. Uso exclusivamente pré-gerado; T09/G3 continuam bloqueados.
- `npm.cmd test`: 4/4 testes passaram. Percurso HTTP com PDF real, dois alunos, duas variações fixas, dois assuntos/seis questões, revisão, publicação, gabarito omitido, observações, versões e reinício passou.
- Build passou antes e após primeiros ajustes visuais. Ajuste de compactação introduziu fechamento JSX sobrando, detectado pelo formatador/build e corrigido; último build observado passou.
- Cadastro A01 preenchido nas dez perguntas e salvo via Chrome. Recarregamento + seleção recuperaram nome/interesses e demais preferências.
- Comparação desktop inicial Professor/Cadastro realizada; fonte/ícones aproximados, mais espaço para privacidade e seletor, dez perguntas em cartões sequenciais. Ajustes de posição/altura em revisão.
- Adicionado Prettier como ferramenta de desenvolvimento para manter código legível para estudantes; sem impacto no runtime. Sem formatter pré-existente no repositório.
- Próximo: finalizar UI pelo navegador, conferir mobile e relatórios, registrar evidências, atualizar backlog e criar commits locais. Nenhum push/deploy.

## Mapeamento visual
| Tela | Referência consultada | Componentes | Comparação |
|---|---|---|---|
| Professor | docs/referencia-telas/professor.jpeg | App.jsx, Teacher.jsx, UI.jsx, styles.css | Captura desktop existente comparada; VISUAL.md |
| Cadastro | docs/referencia-telas/aluno.jpeg (mostra cadastro) | App.jsx, Registration.jsx, UI.jsx, styles.css | Capturas desktop/mobile observadas; VISUAL.md |
| Aluno/aula | Sem referência própria; linguagem comum do cadastro | App.jsx, Student.jsx, UI.jsx, styles.css | Referência específica ausente; QA atual pendente |
| Responsável | docs/referencia-telas/responsavel.jpeg | App.jsx, Reports.jsx, UI.jsx, styles.css | Captura desktop existente comparada; VISUAL.md |
| Psicólogo | docs/referencia-telas/psicologo.jpeg | App.jsx, Reports.jsx, UI.jsx, styles.css | Captura desktop existente comparada; VISUAL.md |
| Configuração IA | Sem referência própria; linguagem compartilhada | App.jsx, AISettings.jsx, UI.jsx, styles.css | Referência específica ausente; QA atual pendente |
