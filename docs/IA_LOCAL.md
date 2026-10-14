# T08/T10/T14 — preparação da integração local de texto

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
