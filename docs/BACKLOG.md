# InTEAgir.AI — Backlog executável

**T09/T14 — 15/10/2026, AGY OAuth:** usuário pediu fallback automático/login. CLI oficial/perfil dedicado validados; scripts agy:check/agy:login preparados para abrir cliente interativo de uso direto. Login não iniciado nem confirmado. Fallback continua bloqueado: FAQ oficial revalidada restringe agy -p encapsulado em aplicativos de terceiros nos planos pessoais. Cadeia automática já preparada/testada, reserva real não liberada nem modelo confirmado; flag permanece false, nenhuma chave/API comercial. Entrega parcial; acesso permitido necessário para ativação. Ver IA_LOCAL.md/RETOMADA.

**T00/T01 — marca original fornecida:** usar public/logo-inteagir.webp no cabeçalho e public/symbol-inteagir.webp como fonte dos ícones. App/img responsiva substitui recorte de screenshot; favicon PNG16/32, Apple180 e PWA192/512 exportados por prebuild/Sharp existente. Novos assets no shell offline/hash. 42/42 testes/build/check:build (15 recursos) passaram; ícone exportado observado. Comparação atual de navegador permanece adiada. Nenhuma dependência, alteração de dados ou geração IA de marca.

**T20 — gerenciamento de exclusões (solicitação explícita):** botões por item, confirmação com identificação/impacto, exclusão de aulas, anexos, prévias, publicações, sessões, observações, notas e logs IA; usuário confirmou incluir perfis de alunos. Dono agente principal LT/FE-P/FE-A/BE. Endpoints DELETE com papel/UUID/confirmacao, cascatas atômicas em JSON e limpeza de arquivos não compartilhados confinada ao armazenamento. Geração e exclusão bloqueiam operações conflitantes; outros perfis/aulas preservados. Sem dependências. 42/42 testes passaram; novo QA visual de navegador permanece adiado. Nenhum dado do ambiente do usuário foi excluído pelo agente.

**Ajuste solicitado T10/T11/T13:** remover rótulos técnicos de origem/provedor das aulas, prévia e relatórios. `ContentOrigin` exibe apenas identificação de conteúdo pré-gerado para demonstração; registro técnico e diagnósticos permanecem disponíveis na Configuração da IA. Dono agente principal FE-P/FE-A. Sem dependência/backend/alteração dos dados. Referências reabertas, QA de navegador continua adiado.

**Correção vigente T06/T08:** falha reproduzida com três JPEGs salvos: 833.888 bytes originais viravam 8.404.425 bytes PNG, excedendo artificialmente 6 MB. Preparação agora preserva JPEG/WebP/PNG adequados após validar pixels; se orientar/redimensionar/remover EXIF/IPTC/XMP, conserva formato e remove metadados. Erros separados para quantidade, arquivo inválido/ausente e soma real excedida. Seis conjuntos locais revalidados, incluindo trio agora com 833.888 bytes. 39/39 testes passaram. Não reenvia material privado à IA no diagnóstico nem altera uploads originais. Backend exige reinício manual para carregar correção; geração real deste material não foi repetida.

**Solicitação vigente T08/T10/T11:** aula/prévia em modal fullscreen responsivo, uma explicação/questão por slide, navegação manual. Esperas de planejamento/geração/testes IA têm overlay, modal central, spinner/frases bem-humoradas. Usuário autorizou animação na espera do professor; aluno sem animações automáticas. Dono agente principal FE-P/FE-A. Sem dependências. Saída pausa sessão antes de fechar; sucesso/erro libera espera; sem progresso inventado. 36/36 testes passaram; QA visual/teclado/mobile no navegador segue adiado.

**Solicitação vigente T07/T08:** introduzir análise/planejamento criativo por assunto antes da aula e mostrar somente esse novo prompt organizado/editável em Ver prompt. Dono agente principal (LT/FE-P/BE-IA). Aceite: plano real a partir de imagens/documentos + títulos/objetivos/diretrizes/perfil; edição salva por aluno sobrevive reinício; aula recebe a revisão editada e fontes; contexto/versão antigos e erros recusados. Sem nova dependência/serviço pago. Segunda chamada aumenta tempo/consumo OAuth; plano vigente é reutilizado. JSON pedagógico preservado. Evidência e verificações na RETOMADA.md.

**Continuação vigente T06/T07/T08:** fotos PNG/JPEG/WebP anexadas com pixels ao Hermes/Codex OAuth e combinadas com os outros prompts. Texto manual opcional, status Enviado, revisão do professor mantida. Uploads antigos suportados; arquivo corrompido bloqueia prévia/publicação. Teste real leu 17 × 6 somente nos pixels e gerou explicação 102 + três questões. Evidência `.ai/evidencias/visao-anexos-2026-10-14/`; 33/33 testes/build/check:build passaram, nenhuma dependência. PDFs escaneados ainda requerem preparação manual. QA visual de navegador adiada, servidor principal exige reinício manual. Nota histórica T06 abaixo (imagem exige texto manual) substituída por este comportamento solicitado pelo usuário.

**Última continuação T09/T10/T14, agente principal:** login novo OpenAI OAuth concluído; primária real pelo registry Hermes/cliente oficial ligada ao backend. Texto JSON + PNG real vinculados à prévia, HTTP autenticado e novo processo confirmaram persistência dos mesmos bytes; sem publicação. Evidência `.ai/evidencias/ia-openai-oauth-2026-10-14/`. Flag privada de imagem ativada, sem API key/dependência/UI. Reserva Nano Banana 2 continua não configurada/bloqueada, HTTP 503 honesto; objetivo global parcial. Servidor principal precisa de reinício manual; gateway dedicado 12587 iniciado após confirmação do antigo encerrado. Uma tentativa de gravação falhou 500, repetição passou, causa pendente. **32/32 testes, build/check:build/diff --check passaram.** Nova imagem real confirmou caminho após ajustes de perfil/cancelamento. Ver RETOMADA.md.


Continuação mais recente T09: gate `scripts/check-codex-image-local.js` preparado para cliente oficial, somente OAuth. Sem login, preflight real e `--generate` recusados com `chatgpt_login_required`, sem inferência/imagem; sucesso/Hermes continuam não testados. **30/30 testes e build passaram**. Login humano OpenAI pendente; reserva Google permanece bloqueada por condições de uso. Objetivo global bloqueado nessas dependências, preservada exigência sem API; ver RETOMADA.md.


Continuação T09, agente principal: cliente oficial Codex 0.162.1 anuncia suporte nativo a imagem em probe sem autenticação. Perfil dedicado somente OAuth ChatGPT preparado; login real iniciado e aguardando usuário, sem copiar credenciais existentes. `scripts/codex-image-local.js` oferece prepare/status/login, ainda sem geração/ponte Hermes. **30/30 testes e build passaram novamente**. Google reserva permanece bloqueado; não aprovar G3 por preparação de perfil. Ver RETOMADA.md.


Atualização T09/T14 (14/10/2026, agente principal): usuário exige imagens OpenAI → Nano Banana 2 **somente OAuth, sem chaves de API**. Sequência/validação/estados/registro de fallback preparados, origem fixa agy corrigida e teste HTTP da reserva implementado; **30/30 testes**, build/check:build passaram. Entrega parcial: composto ainda sem provedores concretos/ativação em `server/index.js`, nenhuma geração real nova. OAuth do agy como backend permanece bloqueado pelas condições oficiais; OpenAI precisa de caminho autorizado/teste. Sem expansão P1/P2, dependências ou UI; ver .ai/RETOMADA.md e IA_LOCAL.md.


> **Versão:** 1.0 · **Horizonte:** um dia de construção guiada + teste de demonstração
>
> Legenda: **P0** = essencial para o fluxo demonstrável · **P1** = importante se P0 estiver estável · **P2** = futuro. **Dono** = papel responsável, a ser atribuído a uma pessoa no início. Não inventar nomes de integrantes.

## 1. Papéis e organização

| Sigla | Responsabilidade principal |
|---|---|
| LT | Líder técnico/integração, infraestrutura, revisão de PR e decisão de corte. |
| FE-P | Frontend: Professor e navegação, React + Tailwind. |
| FE-A | Frontend: Cadastro do aluno e aula interativa. |
| BE-IA | Backend: persistência JSON, materiais, Hermes, `agy`, mídia e contratos. |
| QA | Testes com perfis fictícios, registro de evidências e apresentação (pode acumular outro papel). |

**Divisão para equipe pequena:** LT acumula BE-IA; FE-P e FE-A são frentes paralelas; QA é compartilhado. Cada tarefa tem **um** dono, mesmo quando outras pessoas ajudam.

## 2. Tarefas P0 — ordem sugerida

| ID | Prioridade | Tarefa | Dono | Dependência | Critério de pronto |
|---|---|---|---|---|---|
| T00 | P0 | Inspecionar `docs/referencia-telas/`, mapear tela→referência, inventariar assets e definir tokens Tailwind fiéis | FE-P | — | Referências realmente abertas e mapeadas; logos, hero, banners, ícones, tipografia e cores identificados; faltas/bloqueios registrados. |
| T01 | P0 | Configurar Vite/React, Tailwind, rotas, AppShell e PWA | FE-P | T00 | `npm run build` passa; todas as 6 áreas abrem; UI comparada às referências pertinentes; layout não quebra no mobile. |
| T02 | P0 | Definir contratos JSON de aluno, aula, sessão e geração | LT | — | Exemplos versionados e aceitos por FE-P/FE-A/BE-IA, sem campos contraditórios. |
| T03 | P0 | Servidor Express + leitura/escrita atômica em JSON | BE-IA | T02 | Criar/ler/atualizar dado; sobrevive reinício; entradas inválidas são rejeitadas. |
| T04 | P0 | Cadastro do aluno + 10 perguntas | FE-A | T01, T02 | Cria aluno fictício, seleciona turma, edita perfil e reabre respostas persistidas. |
| T05 | P0 | Professor: disciplinas + criar aula com assuntos separados | FE-P | T01, T02, T03 | Aula de Matemática com 2 assuntos salva e reaparece; não confunde assuntos. |
| T06 | P0 | Upload PDF/imagem e status de leitura | BE-IA | T03 | Arquivo é salvo em diretório controlado; status de extração real e erro legível. |
| T07 | P0 | Turma, lista de alunos e compilação/preview do prompt | FE-P + BE-IA* | T04, T05 | Seleção correta, perfil aplicado e prévia com versão do prompt. |
| T08 | P0 | **Gate** Codex via Hermes: texto JSON | BE-IA | T03 | Requisição real no VPS retorna conteúdo, não mock; chave/credencial invisível ao browser. |
| T09 | P0 | **Gate** imagens reais por backend escolhido | BE-IA | T08 | Pelo menos 1 PNG/WebP real é gerado, salvo, servido e revisável. |
| T10 | P0 | Validar retorno IA; revisão/publicação | BE-IA + FE-P* | T07–T09 | JSON ruim é recusado; imagem inválida impede publicação; publicar exige revisão. |
| T11 | P0 | Renderer da aula e questões com ajuda | FE-A | T04, T10 | Explicação + imagem + 3 questões/assunto; conclusão sem erros. |
| T12 | P0 | Persistir eventos/feedback e relatório básico | BE-IA + FE-A* | T11 | Primeira tentativa, dicas, conclusão e avaliação aparecem após refresh. |
| T13 | P0 | Responsável e psicólogo (resumo) + editor de diretrizes | FE-P | T12 | Mostrar fatos registrados e salvar nova versão do prompt-base. |
| T14 | P0 | Configuração IA, estados e erros verdadeiros | LT | T08–T10 | Status reflete teste efetivo; não exibe segredos. |
| T15 | P0 | Segurança mínima, revisão da demo e deploy HTTPS | LT + QA* | T01–T14 | Fluxo fim a fim no VPS; sem dados reais; reinício não perde dados; erros tratados. |

`*` Colaboração: o primeiro papel indicado é o **dono** da tarefa, e o segundo ajuda na implementação/integração.

### Subtarefas de validação de provedores (não pular)

| ID | Dono | Teste/decisão | Aceite |
|---|---|---|---|
| G1 | BE-IA | Hermes + Codex OAuth/ChatGPT Plus para texto | Retorna esquema válido 2 vezes; falhas e limites documentados. |
| G2 | LT | `agy` headless no VPS com conta Google AI Pro | Autentica, responde sem UI e condições de uso são avaliadas; plugin comunitário auditado antes de ativar. |
| G3 | BE-IA | Imagem primária real | Gera PNG/WebP legível, sem URL temporária, em armazenamento controlado. |
| G4 | BE-IA | Imagem reserva real | Segundo caminho testado e autorizado; se indisponível, estado `Não verificado`, não “fallback ativo”. |
| G5 | QA | Comparar dois perfis fictícios | Diferença visível na explicação/mídia; conteúdo científico preservado. |

**Não bloquear T01–T07 esperando G1–G4:** frontend e modelo de dados podem avançar em paralelo com um **fixture local identificado como dado de demonstração**. Antes da apresentação, diferenciar claramente modo real e modo exemplo.

## 3. Tarefas P1 — executar somente após P0 estável

| ID | Dono | Entrega | Critério de pronto |
|---|---|---|---|
| T16 | FE-A | Retomar do último passo e pausar sessão | Atualização de página não apaga progresso; pausa não aumenta tempo ativo. |
| T17 | FE-P | Regerar só a imagem de uma etapa | Nova mídia vinculada à versão correta, sem apagar atividade anterior. |
| T18 | QA | Comparação exploratória padrão × personalizada | Instrumento de coleta e limites metodológicos explicados, sem afirmação causal. |
| T19 | LT | Backup e exportação administrativa de JSON | Gera backup íntegro recuperável sem expor dados pela web. |

## 4. Tarefas P2 — fora do dia de desenvolvimento

Autenticação e permissões reais por papel; conexão com cadastro escolar; sincronização multiusuário em tempo real; banco de dados; relatórios de longo prazo; acessibilidade auditada com usuários; modelos de imagem alternativos contratados; OCR avançado; recursos de áudio; testes controlados com participantes reais mediante autorizações.

## 5. Cronograma sugerido de 8 horas

| Janela | Entrega esperada | Equipes em paralelo |
|---|---|---|
| Hora 1 | T00/T01/T02: referência visual, esqueleto + JSON comum | FE-P + LT/BE-IA |
| Hora 2 | T03/T04: persistência e cadastro | BE-IA + FE-A |
| Hora 3 | T05/T06 e G1/G2: professor + entrada de material; testes de assinatura | FE-P + BE-IA/LT |
| Hora 4 | T07/T08/T09: prompt composto e imagem real | FE-P + BE-IA |
| Hora 5 | T10/T11: aprovação e aula interativa | FE-A + FE-P/BE-IA |
| Hora 6 | T12/T13: registros e painéis reduzidos | FE-P + FE-A/BE-IA |
| Hora 7 | T14: estado IA, integração, correções | LT + equipe |
| Hora 8 | T15: teste de ponta a ponta, deploy, roteiro MIC | LT + QA + equipe |

**É uma meta agressiva**, não garantia. Se imagem e integrações demorarem, priorizar um percurso completo com uma aula/assunto, uma imagem real já gerada e identificada como contingência. Não marcar G3 como concluído por usar um fixture.

## 6. Critério de pronto para toda tarefa (Definition of Done)

- [ ] Foi implementado o **comportamento** descrito, não apenas layout estático.
- [ ] Se houver interface, ela foi comparada à(s) referência(s) de `docs/referencia-telas/`; diferenças e decisões de acessibilidade foram registradas.
- [ ] Há teste manual ou automatizado reproduzível com entrada e saída esperadas.
- [ ] Erros de rede, arquivo inválido e estados vazios não quebram a tela.
- [ ] Dados de demonstração são fictícios; não há token, senha, nome real ou informação sensível no repositório.
- [ ] `npm run build` (e testes disponíveis) passam.
- [ ] Não há componentes gerando figuras complexas quando deveriam exibir imagem real.
- [ ] Dono descreveu o que alterou, como testar e o que ainda não funciona.
- [ ] LT revisou integração e o status foi marcado com evidência (não por suposição).

## 7. Quadro de acompanhamento (copiar para Issues/PRs)

```md
### Tarefa: T__ — Nome
Dono: @pessoa
Prioridade: P0/P1/P2
Dependências: ...
Objetivo: ...
Critério de aceite: ...
Como testar: 1) ... 2) ...
Evidência: screenshot, log sanitizado ou teste
Status: A fazer | Em andamento | Em revisão | Feito | Bloqueado
Bloqueio real: ...
```

## 8. Roteiro obrigatório de testes da MIC

1. Abrir PWA no HTTPS, navegar nas seis áreas.
2. Criar perfil fictício A01 de 9º C; responder ao questionário.
3. Professor criar aula com pelo menos um assunto e enviar imagem/PDF.
4. Confirmar que A01 aparece na turma e que o prompt contém suas preferências.
5. Solicitar geração e verificar origem **real** do texto e da imagem.
6. Aprovar/publicar; aluno responde três questões, usa uma dica e encerra.
7. Responsável registra observação; psicólogo vê valores que correspondem aos eventos.
8. Atualizar browser e reiniciar Node: dados e arquivos continuam disponíveis.
9. Simular provedor indisponível: UI exibe falha e não apresenta mock como geração ao vivo.
10. Registrar quais gates passaram e o que ficou para versão 2.

## 9. Acompanhamento — implementação local em 14/10/2026

T08/G1 — autorização real/local recebida. Runtime Hermes dedicado preparado (fonte/pins, CLI --version observado), perfil novo sem adoção de logins externos, ferramentas CLI/API vazias e segredo novo com ACL restrita. Login por dispositivo aguarda confirmação; nenhum token pessoal importado e nenhuma inferência real observada. scripts/hermes-local.js executa somente essa instância; detalhes em IA_LOCAL.md. QA de navegador/VPS permanecem adiados. Download inicial do instalador PS foi rejeitado; preparação manual auditada avançou sem executar esse instalador.

Aceite mais recente: [ACEITE_LOCAL.md](ACEITE_LOCAL.md) mapeia escopo, tarefas P0, gates e testes mínimos com limites de evidência. **22/22 testes**, build e check:build passaram. Verificação adicional cobre edição de perfil e aula de História com dois assuntos/material após reinício, recusando contingência de frações indevida. MVP parcial: configuração real de texto/imagem, QA de navegador adiado e VPS/HTTPS continuam pendentes; sem expansão P1/P2.

T08/T10/T14 — preparação de código, sem aceite de gates: adaptador textual HTTP Hermes/Codex desativado por padrão, com configuração explícita, preflight de ferramentas, validação de runtime/JSON, limites e erros sanitizados. Rotas usam o prompt compilado comum, geram por assunto, recusam resultado obsoleto e bloqueiam publicação com imagem necessária sem adaptador. Testes novos são dublê HTTP sem inferência real: suíte **21/21**, build e check:build passaram. Fontes/configuração pendente em IA_LOCAL.md; não houve instalação, login, chamada de conta/provedor, dependência ou gate aprovado. Dono: agente principal.

T11/T12 — item 10 de REGRAS_DA_IA.md: acrescentado retorno à etapa anterior durante sessão ativa, preservando respostas, tentativas, dicas e quantidade concluída nos relatórios. Evento voltar validado e idempotente; campo etapasConcluidas opcional mantém sessões antigas compatíveis. Teste cobre primeira etapa, pausa, conclusão, repetição de evento, reinício e relatórios durante revisão. **14/14 testes**, build e check:build passaram. Referências Cadastro/Responsável/Psicólogo reabertas; UI reutiliza controles existentes. Comparação de navegador/mobile/teclado continua adiada; nenhum recurso P1/P2 acrescentado.

Última validação T01/T12/T15: suíte **13/13**, build e `npm.cmd run check:build` passaram. Teste controlado de tempo verifica exclusão de pausas/ausência de pulsos e retomada após reinício; relatórios coincidem. Verificador HTTP testa build real pelo Express (10 recursos íntegros, worker, manifesto/ícones, API e caminhos privados), sem navegador. QA visual/mobile/teclado/instalação/offline real permanece adiado. Sem expansão de escopo, dependências ou UI; definição da configuração local autorizada de IA solicitada ao usuário.

Continuação T07/T10: corrigida corrida da preparação do exemplo pré-gerado com edições pendentes. A leitura/validação/preparação local usa a mesma fila da gravação, preservando coerência entre objetivo, preferências, material e versão do prompt. Regressão HTTP reproduzida antes da correção e validada depois; suíte **12/12** e build passaram. Isso valida somente a contingência; aceite real T08/T09/T10 e QA de navegador continuam pendentes.

Última continuação T06/T15: QA HTTP local ampliado sem navegador, conforme adiamento solicitado pelo usuário. Corrigidos cabeçalhos de proteção/no-store ausentes no limite 429 e erro genérico ao abrir material com arquivo perdido (agora JSON 404 com orientação de reenvio). Testes cobrem upload com MIME/conteúdo divergentes, arquivo acima de 5 MB, download íntegro, arquivo ausente e permissões entre áreas. `npm.cmd ci`, **11/11 testes** e build passaram. Nenhuma expansão de escopo ou UI; T15 permanece parcial por QA real, IA e VPS/HTTPS pendentes.

Atualização T01: na branch `fix/T01-pwa-cache`, shell público completo pré-instalado e cache versionado por conteúdo do build; ativação preserva caches de outras aplicações. `tests/pwa.test.js` verifica offline simulado, atualização, falha de instalação e exclusão da API. Suíte 9/9 e build passaram. QA real de navegador/instalação continua pendente: acesso CUA a 127.0.0.1:5173 foi negado. VPS adiado até conclusão local conforme orientação do usuário; nenhuma expansão de escopo.

Dono da sessão: agente principal (LT/BE-IA/FE, sem outras frentes ativas). Evidências: `tests/mvp.test.js`, `.ai/ESTADO_ATUAL.md` e `.ai/VISUAL.md`. A palavra “local” não comprova operação no VPS nem aprovação do LT humano.

| Tarefa | Estado observado | Pendência |
|---|---|---|
| T00 | Inventário concluído: quatro JPEGs abertos, mapeamento e tokens estimados registrados | Fonte/ícones/assets originais e referências específicas de aula/IA ausentes |
| T01 | Seis áreas, AppShell, build, manifesto/SW implementados; revisão visual em andamento | Validação mobile/offline/HTTPS e divergências finais |
| T02 | Contratos 1.0 implementados e validados por Zod | Revisão do líder técnico humano antes de novas frentes |
| T03 | Testes locais passaram: concorrência, backup, entradas inválidas, reinício | Verificação no VPS |
| T04 | Dez perguntas; A01 salvo e recuperado por refresh no navegador | QA final de teclado/mobile |
| T05 | Aula com dois assuntos criada no navegador e recuperada via API | QA final de UI |
| T06 | Upload HTTP/extração de PDF reais; imagem exige texto manual, MIME/tamanho/conteúdo validados | Automação de arquivo no Chrome bloqueada por permissão da extensão; teste HTTP passou |
| T07 | Turma 9C, seleção e prompt com versão/preferências/material e descrição geral da aula; teste confirma o campo na prévia e na chamada | Inspeção completa no PWA adiada; geração com imagem depende de backend autorizado |
| T08/G1 | Gate textual local observado: login novo, duas respostas JSON válidas em openai-codex/gpt-6-sol, lock confirmado, zero ferramentas habilitadas | Teste do PWA adiado; VPS somente depois da conclusão local. Evidência em .ai/evidencias/ia-local-2026-10-14 |
| G2 | CLI oficial agy 1.3.3 respondeu headless e gerou imagem local; nenhum plugin comunitário ativado | Gate completo de texto reserva/VPS e auditoria de integração pendentes |
| T09/G3 | Experimento técnico gerou/salvou/serviu PNG real; integração agora desativada e bloqueada após auditoria das condições do agy | Definir backend de imagem autorizado; prova técnica não aprova condições de uso. Ver IA_LOCAL.md |
| G4 | Imagem reserva Não verificado | Não existe segundo caminho testado; não anunciar fallback ativo |
| G5 | Dois perfis fictícios produziram explicações reais diferentes, conceitos/gabaritos da amostra inspecionados | Comparação no navegador e revisão humana pendentes |
| T07/T10 | Alterar preferências invalida só a prévia do aluno; novas diretrizes invalidam prévias pendentes. Nome/e-mail e publicações preservados; teste reproduziu e corrigiu falha | Revisão humana/QA de PWA; imagem real depende de backend autorizado |
| T11/T12 | Renderer/questões/eventos/feedback/relatórios passam no percurso HTTP pré-gerado | QA de navegador em andamento; gates reais pendentes |
| T13 | Observações, notas humanas e diretrizes versionadas implementadas e testadas via HTTP | Comparação/QA final no navegador |
| T14 | Texto configurado; imagem experimental desativada/bloqueada pelas condições do provedor; estados/falhas honestos | Servidor aberto em 3001 precisa de reinício manual; revisão automática bloqueou Stop-Process. Reservas não verificadas |
| T15 | Segurança local implementada; nenhum dado real ou segredo versionado | VPS, HTTPS, revisão pública e autorização de deploy pendentes |

Não houve expansão P1/P2. Pausa e retomada mínima foram incluídas porque já são obrigatórias em TELAS_E_FLUXOS.md E02; não há sync multiusuário ou autenticação de produção. Contingência limitada a Matemática/Frações e Frações equivalentes, rotulada `Pré-gerado para demonstração`.

## Vigente — T15, 15/10/2026: publicação autorizada

Usuário abandonou fallback AGY e pediu somente GPT/OAuth; entrypoint não configura mais AGY. Autorizou commit/push para main, VPS isolado e atualização automática. Dono: agente principal LT/BE-IA. Dockerfile + compose próprios, persistência por volumes, Nginx apenas no subdomínio e timer Git preparados. Deploy/login/gates no VPS ainda em verificação; não considerar concluídos. Ver docs/DEPLOY.md. Credenciais locais e dados não serão enviados ao Git nem OAuth copiado.
