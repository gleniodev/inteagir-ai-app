# Retomada — checkpoint consolidado em 14/10/2026

**Checkpoint local salvo:** commit de código/evidências/memória **794d0b5** na branch fix/T01-pwa-cache. Os 26 testes, build e check:build passaram novamente antes desse commit. Árvore de trabalho ficou limpa; esta nota posterior apenas registra o resultado. **Push ainda não realizado:** falta escolher o destino entre origin inteagir-ai-app.git e inteagir-ai.git. Ao retomar, usar git log/status para observar HEAD atual (pode incluir este registro documental), sem repetir as alterações já commitadas.

**Solicitação posterior à consolidação:** usuário autorizou atualizar o remoto após salvar a memória. Origin foi consultado e tem apenas main em 58beeb5. Destino ainda aguarda resposta entre inteagir-ai-app.git (origin atual) e inteagir-ai.git; não trocar URL nem enviar antes dessa definição. Preparar checkpoint na branch fix/T01-pwa-cache, sem reescrever main, force push ou deploy. Varredura pré-envio conferiu 78 arquivos/quatro commits locais e capturas fictícias; .env/.local/dados/runtime permanecem ignorados. Após commit/push, conferir git log/status e SHA remoto para saber o que efetivamente foi enviado.

## Ler primeiro

1. AGENTS.md; .ai/ESTADO_ATUAL.md; .ai/DECISOES.md; .ai/HISTORICO.md.
2. docs/{ESCOPO,TELAS_E_FLUXOS,REGRAS_DA_IA,BACKLOG,ACEITE_LOCAL,IA_LOCAL}.md.
3. Conferir git status/log/remoto; preservar todas as alterações e arquivos não rastreados. Trechos antigos rotulados históricos não são instruções vigentes.

## Ponto exato da interrupção

- Pasta: D:/GlennsCode/Produtos/inteagir-ai; PowerShell; branch fix/T01-pwa-cache; HEAD 6a66747. Muitas alterações locais e arquivos não rastreados, sem novo commit/push/deploy. Origin preservado: https://github.com/gleniodev/inteagir-ai-app.git; diferença com inteagir-ai.git ainda não resolvida.
- Objetivo global permanece incompleto e foi registrado como **blocked** após recorrência das dependências externas. Usuário pediu esta atualização de memória para retomar depois. Não anunciar MVP concluído.
- Última correção T07/T10: compilePrompt inclui informacoesAula.descricaoAula (fallback vazio). Prévia/chamada usam o mesmo objeto; editar só descrição ou título durante geração descarta resultado antigo com HTTP 409 e preserva o rascunho.
- Correção anterior: preferências/turma alteradas invalidam só a prévia do aluno; novas diretrizes invalidam prévias pendentes. Nome/e-mail não invalidam; publicações anteriores preservadas.
- Última verificação de código: **26/26 testes**, npm.cmd run build e npm.cmd run check:build passaram. git diff --check passou. Não confundir com as contagens históricas de 7/9/14/22/25 testes. Esta entrega de memória não executa novos testes de aplicação.

## IA real: autorização e estado corretos

- Usuário autorizou configurações reais/locais. Não copiar/importar credenciais pessoais existentes; apenas dados fictícios. Login novo Hermes/Codex **já concluído**: não retomar código de dispositivo nem iniciar login novamente sem necessidade observada.
- Texto: .env privado habilitado para openai-codex/gpt-6-sol. Duas respostas reais válidas e comparação de perfis observadas anteriormente, com lock confirmado e 27 conjuntos de ferramentas desabilitados. npm.cmd start e npm.cmd run server carregam .env quando existe. Credenciais e perfis não acompanham o Git.
- Hermes dedicado: fonte .local/hermes-src, commit 0e427d788d253630d38a3a51cd76849e73cd6925; Python 3.14.7. Perfil/runtime em %LOCALAPPDATA%/InTEAgir-Hermes-{Profile,Runtime}. Usar scripts/hermes-local.js. Handle antigo do gateway: exec 39886; sua atividade precisa ser revalidada, nunca presumida. Se confirmado encerrado, iniciar node scripts/hermes-local.js gateway run, em primeiro plano. Não criar serviço automático.
- Imagem: experimento agy produziu arquivo real e evidência, **mas foi desativado e bloqueado** após auditoria das condições do provedor. INTEAGIR_AGY_IMAGE_ENABLED=false; true lança erro antes de ler perfil/iniciar CLI. Não reativar por flag/checkbox. Código e PNG preservados como experimento, sem aprovação de G3/uso no PWA. Texto continua configurado. Fontes/limites em docs/IA_LOCAL.md e DEC-007.
- Pergunta pendente ao usuário: qual API de imagens já tem acesso disponível e autorizado para o projeto? Nenhuma resposta recebida; não solicitar chaves pelo chat. Não presumir assinatura equivalente a API nem contratar provedor pago. Reservas/fallback continuam Não verificado.
- Evidências duráveis: .ai/evidencias/ia-local-2026-10-14/{README.md,resumo.json,previa-real.json,imagem-real.png,perfil-A.json,perfil-B.json}. Não reutilizá-las como prova de geração atual. Nenhuma aula real publicada automaticamente; revisão do professor humano pendente.

## Próximo passo depende de estado externo

1. Servidor em 127.0.0.1:3001 foi consultado após iniciar sessão demonstrativa ia: HTTP 200, texto Não configurado e imagem Não configurado. Ainda era o processo antigo. Usuário precisa Ctrl+C no terminal original e npm.cmd start para carregar configuração/código atuais.
2. Reinício automático via Stop-Process foi rejeitado pela revisão de aprovação, motivo blocked by policy. Processo preservado; não tentar outro meio para contornar. O mesmo vale para o download do instalador PS anteriormente rejeitado: não executado.
3. Incorporar definição do backend de imagens autorizado e testar geração real/arquivo/revisão/falhas. Sem isso o fluxo real com imagem não está completo.
4. QA de navegador/teclado/mobile/seis áreas/instalação/offline continua **adiado pelo usuário** após permissão negada no Chrome em 127.0.0.1:5173. Não abrir navegador alternativo nem tentar contornar. Só retomar quando o usuário encerrar esse adiamento.
5. Concluir local antes do VPS. Nenhum deploy/HTTPS/push autorizado; resolver diferença do remoto antes de enviar.

## Execução e cuidados na próxima sessão

- Usar npm.cmd no PowerShell. Lockfile existe; npm ci já passou anteriormente, mas a última tentativa falhou EPERM em binários nativos carregados. Dependências restauradas com npm.cmd install --ignore-scripts --offline, sem alterar package-lock.json. Não repetir reinstalação destrutiva com processos usando os módulos; não matar processos nem mudar políticas/permissões para forçar.
- Verificações após mudanças de código: npm.cmd test; npm.cmd run build; npm.cmd run check:build. Testes ficam em tests/*.test.js para excluir o checkout Hermes de .local. check:build é HTTP, não prova navegador/offline real.
- T02/T03 já implementadas; não recriar contratos/persistência. T01 cache completo/versionado preserva caches alheios. T11/T12 Voltar/progresso/pausas/reinício/relatórios cobertos. Aceite requisito por requisito em docs/ACEITE_LOCAL.md.
- Antes de qualquer UI: listar docs/referencia-telas, abrir visualmente referências pertinentes e ler .ai/VISUAL.md. aluno.jpeg é **cadastro**, não aula interativa. Sem referência própria de aula/IA; não inventar design nem afirmar comparação não realizada.
- Nenhum token, .env, código de dispositivo, cookie ou dado real deve entrar em documentação/commit. Não descartar artefatos ou alterações existentes. Sem frentes concorrentes/subagentes nesta execução.

Histórico da antiga nota de retomada preservado em .ai/arquivo/retomada-antes-consolidacao-2026-10-14.md; decisões e entregas anteriores em HISTORICO.md e ESTADO_ATUAL.md.
