# Decisões

## DEC-008 — 14/10/2026 — Imagem OpenAI pelo cliente oficial com OAuth

Usuário exige somente OAuth, sem chaves de API, OpenAI primária e Nano Banana 2 reserva. O plugin bundled Hermes que acessa rota interna diretamente não foi adotado; o provedor do projeto usa a ABC/registry Hermes em processo dedicado e a ferramenta nativa do cliente oficial Codex/app-server por stdio. Login novo no perfil exclusivo confirmado, tokens geridos pelo cliente e nunca importados/exportados pelo projeto. Perfil sem shell/subagentes/apps/plugins/view_image; sandbox read-only, pedidos tratados como dados, aprovações recusadas, turno interrompido em ferramenta inesperada. Imagem limitada/decodificada/confinada ao cache antes de mídia relativa da aula; modelo de imagem desconhecido não é inventado. Texto conserva toolsets vazios.

Primária produziu imagem real por registry e pelo backend HTTP; prévia/imagem restauradas em novo processo, sem publicação. Flag privada ativada após prova real; default público false. Reserva ausente e erro honesto preservados: DEC-007/condições Google não revogadas por êxito OpenAI. Objetivo dos dois provedores ainda parcial; revisão humana/QA/VPS pendentes. Evidência em `.ai/evidencias/ia-openai-oauth-2026-10-14/`. Processo principal antigo preservado, requer reinício manual. Nenhuma dependência ou edição do checkout Hermes.

## DEC-007 — 14/10/2026 — Prévia coerente e condições do provedor

T07/T10: mudanças no conteúdo do prompt invalidam prévias pendentes na fila JSON (preferências/turma apenas do aluno; diretrizes para todos). Nome/e-mail não integram prompt e não invalidam. Publicações/sessões/versões anteriores preservadas. Teste HTTP reproduziu e corrigiu publicação de prévia obsoleta.

Auditoria posterior consultou a cláusula 6 dos termos oficiais Antigravity: acesso por ferramentas/produtos de terceiros é restrito. Embora o CLI documente scripts/CI, isso não esclarece autorização para o backend deste PWA. Não presumir permissão por êxito técnico; integração agy por assinatura desativada no .env e bloqueada no construtor mesmo com flag true. Código/artefatos experimentais preservados; não iniciar novas chamadas nem liberar mediante checkbox de aprovação. Falta provedor de imagem com acesso autorizado. Texto Hermes preservado; fontes e limites em docs/IA_LOCAL.md. Esta decisão revoga a ativação de imagem da DEC-006.

## DEC-001 — 14/10/2026 — Base local preservada
Contexto: repositório só tem documentação; origin diferente do URL informado. Escolha: branch feat/T00-mvp-base, manter remoto e documentos em docs/. Consequência: nenhum push ou deploy; confirmar destino antes de operações remotas. Arquivos: .ai/, configuração inicial.

## DEC-002 — 14/10/2026 — Fidelidade e conteúdo
Escolha: reaproveitar regiões decorativas dos JPEGs por CSS e tokens estimados, sem inventar logo. Dez perguntas e métricas factuais prevalecem sobre mockups. Mobile e duas telas sem referência específica são adaptações pendentes de referência. Arquivos: .ai/VISUAL.md, src/.

## DEC-003 — 14/10/2026 — Geração honesta
Escolha: não simular Hermes/agy nem declarar conexão. Contingência fixa de frações identificada como pré-gerada, independente do botão de geração real que deve falhar honestamente enquanto indisponível. Imagem criada nesta sessão é asset de contingência; gates exigem testes no VPS. Arquivos: server/, fixtures/.

## DEC-004 — 14/10/2026 — Voltar sem apagar realização
Contexto: REGRAS_DA_IA.md item 10 exige voltar/repetir; a aula só avançava. Agente principal acumula LT/FE-A/FE-P/BE-IA, sem outras frentes. Adição compatível documentada em docs/CONTRATOS.md: evento voltar e campo opcional etapasConcluidas, que distingue posição de total realizado. Sessões antigas usam indice como valor inicial; nenhuma migração destrutiva. Mesmo renderer/controles existentes, sem nova tela ou design. QA visual adiado pelo usuário e revisão do LT humano pendente.

## DEC-005 — 14/10/2026 — Preparar texto sem ativar conta ou ferramentas
Contexto: rotas reais eram indisponibilidade fixa; configuração local autorizada segue pendente. Escolha: adaptador HTTP documentado do Hermes, apenas loopback e flag explícita, sem iniciar instalação/login ou ler credenciais existentes. Recusar instância com ferramentas habilitadas e resposta sem runtime confirmado. A instância futura deve ser dedicada, sem adoção de logins externos, e não ter configuração alterada durante o atendimento. Texto e imagem independentes: imagem necessária sem adaptador bloqueia a prévia. Testes de protocolo com dublê são evidência de código, nunca gate real. Docs/IA_LOCAL.md registra fontes, limitações e passos futuros.

## DEC-006 — 14/10/2026 — Configuração local autorizada e observada

Usuário autorizou configurações reais/locais. Hermes em perfil dedicado, login novo sem importar tokens, API apenas loopback/segredo novo/ferramentas vazias. Usar sessão por assunto com lock confirmado, porque o endpoint compatível do commit instalado omite runtime. Texto observado duas vezes em openai-codex/gpt-6-sol. Imagem independente pelo CLI oficial agy (capacidade nativa observada), sem plugin comunitário/API privada: perfil dedicado, comandos/web/MCP negados, créditos adicionais desativados; sessão gerida pelo CLI/keyring sem extrair/copiar tokens. Validar caminho atual/arquivo/tamanho/decodificação, converter JPG em PNG usando Sharp já existente e salvar antes da prévia. Reservas permanecem Não verificado. Nenhuma publicação automática, navegador ou VPS. npm start/server carregam .env privado opcional. Reinício do servidor antigo foi rejeitado pela revisão automática (Stop-Process, blocked by policy); preservar processo e orientar Ctrl+C/nova execução no terminal original.
