# InTEAgir.AI — Backlog executável

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
