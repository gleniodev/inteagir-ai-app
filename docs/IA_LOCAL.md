# T08/T10/T14 — preparação da integração local de texto

## Vigente — primária de imagem OpenAI OAuth pelo Hermes, sem reserva Google

Usuário concluiu o login novo no perfil exclusivo do cliente oficial Codex; não repetir device flow. A ferramenta nativa produziu arquivo real diretamente, depois via registry Hermes e finalmente pelo fluxo HTTP da aula. A rota SIWC/Responses para aplicações de terceiros continua distinta; esta implementação usa exclusivamente o **cliente oficial** com seu login gerido pelo próprio cliente, sem chamadas diretas a endpoints internos ou API key.

`configuredHermesImage` é ativado por `INTEAGIR_HERMES_IMAGE_ENABLED=true` no backend (.env privado ativado após prova real; .env.example false). Compõe OpenAI primária com reserva ausente. `hermes-local.js image-backend` inicia Python dedicado, registra `OfficialCodexImages` na ABC/registry `ImageGenProvider` do checkout Hermes e seleciona seu nome explicitamente, sem discovery/fallback automático. O provedor chama `check-codex-image-local.js --worker` via stdin/JSON, em ambiente filtrado; Node usa app-server oficial por stdio, exige conta ChatGPT, limita ferramentas/aprovações/tempo/saída, confirma imagem/turno completos e decodifica PNG/WebP. Hermes guarda PNG em cache; adaptador confina caminho/tempo/tamanho e decodifica de novo; backend salva mídia relativa da aula. Tokens não são lidos/exportados por esses scripts; id do motor de imagem não é presumido. API de texto conserva todos os toolsets desabilitados.

Teste real reproduzível: gateway dedicado primeiro plano `node scripts/hermes-local.js gateway run`; aplicativo carrega .env via npm start. Gate isolado `node --env-file=.env scripts/check-hermes-local.js --with-images` usa dados fictícios, PDF sintético, texto real e imagem solicitada pelo texto, sem publicar. Última prova: `.local/gates/2026-10-14T18-01-50-484Z`, copiada em `.ai/evidencias/ia-openai-oauth-2026-10-14/`. PNG 2172 × 724, 803.697 bytes, aberto com quatro vagões iguais/um azul/três cinza. Gabaritos da amostra 0/1/2 inspecionados. Novo processo Node restaurou prévia e serviu hash igual; reserva devolveu 503/Não configurado sem alterar prévia. Revisão humana/PWA/VPS pendentes.

Gateway antigo inexistente/porta livre confirmados antes de iniciar handle 12587. Servidor principal 3001 ainda processo antigo 6828: status consultado mostrou imagem Não configurado; requer Ctrl+C no terminal original e npm.cmd start. Não encerrou processo do usuário nem contornou rejeição anterior. Primeira tentativa de gate falhou 500 ao gravar material (temporário JSON deixado); repetição e reinício passaram, causa ainda desconhecida. Reserva Nano Banana 2 não ativada: restrição Google abaixo permanece. Preparação/falhas históricas abaixo não são estado vigente da primária.


## Gate manual nativo OpenAI — ainda sem aceite G3

`node scripts/check-codex-image-local.js` consulta autenticação/capacidade pelo app-server do cliente oficial no perfil dedicado; não imprime conta/e-mail/tokens. `--generate` só inicia uma cena fictícia após confirmar login ChatGPT. Não usa API key nem rotas internas. Respostas/erros brutos são descartados; aprovações/ferramentas externas recusadas; evento de imagem e turno completo exigidos. Artefato precisa ser recente, estar confinado ao perfil, ser PNG/WebP decodificável com limites antes de salvar PNG/hash/resumo em `.local/gates`. Nenhum aluno real, publicação ou modelo de imagem presumido.

Observado nesta continuação: perfil ainda não autenticado; ambas as modalidades retornam `chatgpt_login_required`, `imagemGerada=false`, exit 1, sem inferência. Argumento inválido retorna erro sanitizado. Login já iniciado continua aguardando usuário na última consulta. **Caminho de sucesso não executado**, script não integrado ao Hermes; não atribuir G3 por esse preflight. Após autenticação, executar gate, inspecionar visualmente arquivo e só então preparar a ponte Hermes. Reserva OAuth Google continua com bloqueio descrito abaixo.


## Verificação do cliente oficial Codex — T09, ainda sem geração

`scripts/codex-image-local.js prepare` prepara perfil dedicado em LocalAppData/InTEAgir-Codex-Image-Profile; nunca substitui configuração divergente, importa login pessoal/Hermes ou herda chaves de provedor. Perfil exige ChatGPT, usa armazenamento de credencial próprio em arquivo e ACLs privadas. Shell, subagentes, apps/plugins e busca desativados na configuração; sandbox read-only. Somente ações prepare/status/login permitidas. Cliente oficial instalado 0.162.1; preparação observada e status inicial Not logged in. `login` inicia autenticação por dispositivo no cliente oficial, a concluir pelo usuário. Código temporário não pertence a logs/memória/Git.

Probe RPC em perfil novo sem autenticação retornou `imageGeneration=true`. Schema local contém evento de imagem com result/status/savedPath, mas nenhum método standalone de geração. Capacidade anunciada não comprova acesso da conta nem imagem real. Próxima etapa após autenticação: testar ferramenta nativa no cliente oficial isolado, validar artefato, depois preparar ponte Hermes. Não existe adaptador concretamente integrado ainda.

A [documentação oficial SIWC](https://developers.openai.com/siwc/token-sharing-open-source/preview-limitations) exclui geração de imagens na rota de uso de plano ChatGPT para aplicações de terceiros/Responses, inclusive na configuração app-server dessa rota. Isso não equivale a afirmar que a ferramenta nativa do cliente Codex autenticado está indisponível; são caminhos distintos. Fonte RPC: [App Server oficial](https://learn.chatgpt.com/docs/app-server). Não ativar chamadas diretas a endpoints internos com base apenas na existência do plugin Hermes.


## Continuação vigente — imagens apenas OAuth

Usuário reafirmou **sem chaves de API, somente OAuth sempre**. Ordem pedida: OpenAI primária, Nano Banana 2 reserva. Adaptador composto `server/services/image-fallback.js` recebe adaptadores concretos por injeção, tenta primária antes da reserva e recusa retorno inválido/provedor inesperado. Reserva exige modelo confirmado `gemini-3.1-flash-image`, conforme [documentação Gemini](https://ai.google.dev/gemini-api/docs/image-generation); identificação do modelo não autoriza uso de API. Bytes precisam ser PNG/WebP, limitados e completamente decodificados antes do sucesso. Não há instalação, login, acesso a tokens ou provedor implícito.

`server/app.js` preserva provedor/modelo/fallback/tentativas e monta origem pelos provedores retornados, sem nome agy fixo. `tipo=fallback` testa somente a reserva quando composto injetado; estados são independentes. **30/30 testes**, build/check:build passaram com dublês/pixels sintéticos. Isso prova sequência/HTTP, não geração real/OAuth.

**Composto não ligado a `server/index.js`, nenhum provedor de imagem ativado.** Hermes instalado possui plugin de imagem `openai-codex`, documentado em [Hermes Image Generation](https://hermes-agent.nousresearch.com/docs/user-guide/features/image-generation/), que chama rota interna Codex com OAuth; sua adoção ainda precisa resolver a regra do projeto sobre interfaces privadas não autorizadas. CLI oficial Codex tem feature `image_generation` habilitada; caminho pelo cliente oficial ainda pendente, sem importar login pessoal.

Para Google, a [FAQ oficial Antigravity](https://www.antigravity.google/docs/faq/) agora explicita que encapsular `agy -p` em aplicações/agentes de terceiros não é suportado pelos planos pessoais; [termos, cláusula 6](https://antigravity.google/terms). Não reativar flag nem contornar por outro wrapper. Experimento antigo permanece preservado e não confirma modelo Nano Banana 2. Gate dos dois provedores continua incompleto; não substituir a exigência OAuth por APIs.


**Atualização vigente:** texto permanece configurado. A integração de imagem agy por assinatura foi **desativada e bloqueada no construtor de configuração**, após consultar a cláusula 6 dos [termos oficiais](https://www.antigravity.google/terms). Ela restringe acesso por software de terceiros. O [headless oficial](https://antigravity.google/docs/cli/headless/) documenta scripts/CI, mas isso não esclarece a permissão para oferecer o serviço pelo backend de outro produto. Não presumir autorização pelo fato de o CLI funcionar. Código experimental e artefatos preservados; o teste técnico anterior não aprova G2/G3/G4 para uso no PWA. Falta definir um backend de imagem com acesso autorizado. Nenhuma nova chamada agy foi feita nesta auditoria.

Estado em 14/10/2026: configuração real/local autorizada e login novo concluído. **Duas respostas reais válidas** observadas pelo backend em `openai-codex / gpt-6-sol`, sem fallback, com lock do modelo confirmado e nenhuma ferramenta habilitada (27 conjuntos consultados). Prévia com dois assuntos, duas explicações e seis questões; nenhuma publicação. `.env` privado ativado para esse modelo. Isso comprova o caminho textual HTTP local; não aprova imagem, navegador, implantação ou revisão humana. Os testes automatizados continuam separados da evidência real.

## Instância dedicada preparada

- Fonte: `.local/hermes-src`, ignorada pelo Git.
- Windows: perfil `%LOCALAPPDATA%/InTEAgir-Hermes-Profile`; ferramentas `%LOCALAPPDATA%/InTEAgir-Hermes-Runtime`. Segredo novo da API em arquivos privados; ACLs restritas a usuário/SYSTEM/Administradores. Backend `.env` ignorado e ativado após verificar login, modelo e ferramentas.
- `node scripts/hermes-local.js --version` executa somente esse checkout/perfil. O lançador herda configuração de máquina/rede e exclui chaves de provedores/overrides de login do processo pai.
- `node scripts/hermes-local.js auth add openai-codex --label "InTEAgir local" --no-browser` inicia login novo, sem abrir/controlar navegador. Confirmar manualmente o código apresentado; não gravar códigos de dispositivo, senhas ou tokens em documentação.
- `auth.adopt_external_logins: false` e `platform_toolsets.api_server/cli: []`. API autenticada confirmou nenhum dos 27 conjuntos habilitado; socket observado somente em `127.0.0.1:8642`.
- `node scripts/setup-hermes-local.js` cria somente arquivos novos e recusa sobrescrever configuração existente. Já executado nesta sessão; não repetir para trocar segredos.

Instalação: fonte oficial clonada e hashes do runtime validados pelo PM; sem alterar PATH global, políticas do Windows, serviços automáticos ou perfil pessoal. A preparação em D: encontrou `WinError 5` ao renomear Lib/cache; runtime e dependências foram preparados com êxito em LocalAppData. O comando que baixaria o instalador PS foi bloqueado por revisão automática e não foi executado. Bootstrap manual inspecionado usou o código/pins do checkout. Base técnica: [instalação nativa Windows](https://hermes-agent.nousresearch.com/docs/user-guide/windows-native).

## Caminho implementado

`server/index.js` constrói o adaptador somente quando `INTEAGIR_HERMES_ENABLED=true`. A ausência dessa opção mantém os erros honestos e a contingência explícita já existente. Nenhum arquivo de credenciais é procurado pelo aplicativo.

O backend usa a API do Hermes em loopback, com bearer próprio: consulta `/v1/toolsets` e recusa qualquer conjunto habilitado. Cria sessão exclusiva por assunto em `/api/sessions`, envia prompt/esquema em `/api/sessions/:id/chat`, com `require_model_lock=true`. Exige `runtime.provider/model` exatos, `model_lock=confirmed`, sessão correspondente e JSON completo válido. Não aceita mudança de objetivo, arquivo inventado ou provedor inesperado. Há timeout, limite de resposta e erro sanitizado. Base: [API Server do Hermes](https://hermes-agent.nousresearch.com/docs/user-guide/features/api-server/).

O primeiro teste real pelo endpoint compatível `/v1/chat/completions` foi recusado corretamente: o commit instalado omite runtime nessa resposta. A correção usa a rota de sessão, cujo código confirma o runtime efetivo. `/v1/toolsets` retorna envelope `{object, platform, data}`, também confirmado na instância. O Hermes mantém seu armazenamento interno de sessões no perfil privado; os dados do aplicativo continuam em arquivos JSON.

## Operação e teste real reproduzível

1. Iniciar a instância dedicada: `node scripts/hermes-local.js gateway run` (primeiro plano, sem serviço automático).
2. Iniciar o aplicativo com a configuração privada: `npm.cmd start` (carrega `.env` se existir). Cada adaptador começa Não verificado até uma chamada válida nesse processo. **Servidor já aberto na porta 3001 ainda usa a configuração anterior:** a revisão automática bloqueou `Stop-Process`, motivo “blocked by policy”. Encerrar com Ctrl+C no terminal original e executar `npm.cmd start`; o agente não tentou outro meio de encerrar o processo.
3. Opcionalmente executar `node --env-file=.env scripts/check-hermes-local.js`: **consome uso real da conta**, cria dados fictícios isolados em `.local/gates/<data>` e deixa a prévia sem publicar. `--compare-profiles` acrescenta duas chamadas para outro perfil só texto. Não rodar na suíte automática.
4. Conferir `resumo.json` e `previa.json` no diretório indicado. Evidência inicial bem-sucedida: `.local/gates/2026-10-14T13-39-12-959Z`; duas chamadas de 11.743 e 10.569 ms, prompt v1. Gabaritos/cálculos da amostra inspecionados; aprovação do professor permanece necessária.

Dependências Hermes foram instaladas pelo PM oficial com extras `web` e `sms`; neste commit `sms` declara somente `aiohttp`, necessário à API. Nenhum canal SMS configurado. Nenhuma dependência npm nova. Não executar instalador PowerShell, alterar política de execução ou substituir configurações pessoais.

`POST /api/aulas/:id/gerar` solicita um documento por assunto. A prévia usa a mesma composição de diretrizes, informações da aula/material e preferências exibida pelo PWA; não envia nome ou e-mail. A chamada ao provedor fica fora da fila JSON. Ao salvar, o backend compara os dados atuais com os enviados: mudanças durante a espera descartam o resultado. Preparação/publicação simultânea da mesma aula é recusada durante a chamada. Texto e logs ficam separados; logs guardam resultado, provedor/modelo confirmado, versão do prompt e duração, sem anexos, prompts completos ou segredos.

## Experimento de imagem local — CLI oficial agy (não liberado no PWA)

**Teste real observado:** CLI 1.3.3 gerou JPG nativo; o adaptador decodificou e converteu para PNG, salvou na mídia da aula e vinculou a prévia. Após reiniciar a aplicação de teste, HTTP autenticado serviu os mesmos bytes. PNG 1376 × 768, 734.252 bytes, SHA256 e prévia em `.ai/evidencias/ia-local-2026-10-14/`. A imagem foi aberta: quatro vagões iguais, um azul e três cinza. Texto levou 12.932 ms; imagem 85.213 ms. Nenhuma publicação ou navegador.

`server/services/agy-image.js` executa somente o CLI oficial instalado, sem shell. Usa perfil `%LOCALAPPDATA%/InTEAgir-Agy-Profile`, HOME/USERPROFILE dedicados, ambiente filtrado, pasta de trabalho nova por pedido e JSON estruturado. A sessão é gerida pelo próprio CLI/keyring; o aplicativo não extrai, lê, exporta ou copia tokens. Nenhum plugin comunitário, API privada ou chave comercial foi introduzido. A capacidade nativa foi testada nesta instância; a documentação não substituiu o teste. Referências: [headless](https://antigravity.google/docs/cli/headless/), [geração nativa no changelog](https://antigravity.google/docs/changelog?tab=cli), [sessão oficial](https://antigravity.google/docs/cli/install/).

O perfil dedicado nega comandos, execução fora do sandbox, web e MCP; créditos adicionais e telemetria ficam desativados. Configuração insegura impede iniciar a inferência. O CLI persiste apenas diferenças dos padrões, portanto pode remover chaves com valor padrão; deny permanece explícito. Há limite de execução/saída e um trabalho de imagem por vez. O artefato precisa pertencer à conversa atual no perfil dedicado, ser recente, decodificável e ter tamanho limitado. Retornos JPG são convertidos em PNG pelo Sharp existente, sem redesenhar a figura. Identificador exato do modelo de imagem **não é informado pelo CLI**, portanto não é inventado nos logs.

`scripts/setup-agy-local.js` preserva a preparação experimental de perfil novo, sem instalar/fazer login e sem sobrescrever perfil existente. Isso não autoriza a integração. `INTEAGIR_AGY_IMAGE_ENABLED` deve permanecer false: true agora falha antes de consultar perfil ou iniciar CLI. `check-hermes-local.js --with-images` também permanece bloqueado; não reapresentar seus artefatos antigos como geração atual. `--compare-profiles` continua disponível somente para texto Hermes/Codex.

Se imagem necessária falhar, não há prévia incompleta, fixture automática ou figura desenhada em código. Imagem reserva permanece Não verificado. G2/execução no VPS e G4/segundo caminho continuam pendentes. O aplicativo não afirma que assinatura equivale a API ilimitada. Permissões do CLI e seus limites devem ser reavaliados antes de trocar sua versão ou expor o sistema.

`POST /api/ia/testar` com tipo texto executa uma amostra fictícia somente se o adaptador estiver ativado. Status começa como Não verificado e muda após a resposta validada; reiniciar o backend exige nova verificação. Status Funcionando do texto não comprova imagem, disponibilidade ilimitada ou o aceite de todos os gates.

## Limites e configuração preservada

1. Não compartilhar esse perfil com outras aplicações nem mudar suas ferramentas enquanto atende o PWA. Cada geração repete a consulta de ferramentas.
2. Login novo concluído, adoção de logins externos desativada. Não copiar tokens de outra instalação. Referência: [provedores e autenticação do Hermes](https://hermes-agent.nousresearch.com/docs/integrations/providers/).
3. Autenticação Codex por conta ChatGPT e por chave API têm caminhos distintos. Não copiar tokens do computador nem presumir acesso por assinatura; confirmar conta, modelo e limites pelo uso autorizado. Referência: [autenticação oficial do Codex](https://developers.openai.com/codex/auth/).
4. Configurar a API do Hermes apenas em loopback, com segredo novo próprio para o backend. O navegador acessa somente `/api` do Express.
5. `npm.cmd start` e `npm.cmd run server` carregam o `.env` privado quando presente. Nenhum segredo deve ser enviado por chat ou commit.
6. Teste pelo PWA permanece adiado com todo QA de navegador. G1 possui evidência local; experimento de imagem tem prova técnica, mas G3 está bloqueado pelas condições acima. Aceite no VPS depende de implantação posterior autorizada; fallback exige segundo caminho independente real.

## Coerência da prévia com o prompt atual — T07/T10

A descrição geral da aula também integra `informacoesAula.descricaoAula`, com string vazia para registro antigo sem esse campo. Antes, ela era omitida da prévia/chamada e da comparação de obsolescência. Teste HTTP com dublê reproduziu a ausência e agora confirma o campo enviado e HTTP 409 ao editar somente a descrição durante a inferência; rascunho editado preservado. O cenário de alteração do título continua coberto. Nenhuma chamada adicional à conta foi feita nesta correção.

Editar preferências/turma invalida a prévia daquele aluno; nome/e-mail não alteram o prompt e preservam a prévia. Nova versão de diretrizes invalida todas as prévias pendentes. Isso ocorre na mesma fila JSON da edição. Conteúdo já publicado e suas versões permanecem intactos; é preciso gerar e revisar novamente antes de outra publicação. A proteção contra edições durante a inferência continua em vigor. Teste HTTP reproduziu a prévia obsoleta antes da correção e verificou invalidação seletiva, bloqueio da publicação, preservação de outra prévia/publicação e nova geração com prompt v2 após reinício.

## Verificação de código disponível agora

`npm.cmd test` cobre o protocolo com servidor de teste, recusa de ferramentas, destinos externos, provedor inesperado, esquema inválido, timeout, autorização negada, limite de uso, composição do prompt, dois assuntos, publicação só texto, falha de imagem e edição concorrente. O fluxo de contingência mantém testes independentes. `npm.cmd run build` e `npm.cmd run check:build` verificam o build; não substituem QA de navegador ou gates reais.
# Planejamento criativo revisável — T07/T08

## Login direto no AGY — 15/10/2026

`npm.cmd run agy:check` verifica apenas instalação e configurações do perfil dedicado. Verificação observada com sucesso. `npm.cmd run agy:login` abre o CLI oficial interativo (`--new-project --sandbox`), sem prompt inicial, em pasta manual do perfil. OAuth é conduzido pelo próprio cliente; nenhum token é lido/exportado/copied pelo aplicativo, variáveis de API key não são herdadas. O cliente pode reutilizar sessão existente no keyring; o comando não força logout nem afirma novo login. Autenticação humana ainda não iniciada por este lançador nesta entrega.

**Fallback automático não ativado.** A [FAQ oficial](https://www.antigravity.google/docs/faq/) reconsultada em 15/10/2026 mantém a restrição a encapsular agy -p dentro de aplicações/agentes de terceiros com planos pessoais. Preparar login para uso direto não libera isso. INTEAGIR_AGY_IMAGE_ENABLED continua false e configuredAgyImage mantém bloqueio. A cadeia primária→reserva existente está testada por injeção, sem segundo provedor real configurado; nenhum modelo de imagem AGY confirmado. Para backend automático é preciso acesso que permita esse uso e confirmação real da capacidade/modelo. Não substituir OAuth por chave comercial nem remover gate por flag.

Antes de gerar a aula, `Ver prompt` aciona análise real dos materiais e retorna somente o prompt criativo organizado/editável. Campos: compreensão, abordagem, sequência da explicação, imagens, questões e cuidados por assunto. A edição é salva por aluno e a geração usa essa revisão, com fontes originais/diretrizes/perfil, mantendo validações/revisão/publicação. Contexto alterado exige nova análise; plano vigente é reutilizado para reduzir inferências. Reproduzir análise → edição → aula com `node --env-file=.env scripts/check-hermes-local.js --with-vision`; evidência `.ai/evidencias/planejamento-criativo-2026-10-14/`. Duas execuções reais locais observadas, sem navegador/VPS/publicação. Fluxo aumenta tempo/consumo OAuth; não há promessa de acesso ilimitado.
