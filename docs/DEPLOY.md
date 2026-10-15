# Deploy isolado — T15

Destino: https://inteagir.ai.glennscode.com. Branch de publicação: `main`.

`deploy/compose.yaml` cria somente o projeto Docker `inteagir-ai`, porta
127.0.0.1:3091, rede própria e volumes de JSON/uploads/mídia/Hermes/Codex.
Não monta o socket Docker nem arquivos dos outros projetos no container.
O Hermes escuta somente no loopback interno. Container executa como UID 10001.

`/opt/inteagir-ai/update.sh` consulta `origin/main` a cada minuto pelo timer
`inteagir-deploy.timer`. Usa chave Git somente leitura exclusiva, build por SHA,
healthcheck e retorno à imagem anterior quando a nova não fica saudável.
JSON é copiado antes da troca; volumes e OAuth sobrevivem ao deploy.
Não há limpeza global de imagens/volumes nem reinício dos demais projetos.
Backups não incluem OAuth e não são servidos pelo Nginx.

Arquivos privados no VPS: `/opt/inteagir-ai/runtime.env`, chave Git e volumes
Hermes/Codex. Nunca copiar credenciais do computador para o container.
Flags de geração permanecem desativadas até login novo e gate real no VPS.
Sem API comercial. AGY não é configurado pelo entrypoint do aplicativo.

Operação no VPS:

```sh
systemctl status inteagir-deploy.timer
journalctl -u inteagir-deploy.service --no-pager -n 60
cat /opt/inteagir-ai/current
docker ps --filter label=com.docker.compose.project=inteagir-ai
# Login novo de texto:
docker exec -it inteagir-ai-app-1 node scripts/hermes-local.js auth add openai-codex --label 'InTEAgir VPS' --no-browser
# Preparar e iniciar login novo de imagens:
docker exec -it inteagir-ai-app-1 node scripts/codex-image-local.js login
```

O próprio cliente apresenta URL/código temporário; concluir na conta autorizada.
Não registrar código, auth.json ou tokens em logs públicos/documentação.
Após autenticar, verificar modelo GPT e ferramentas vazias no Hermes, ativar
flags de texto/imagem em runtime.env e recriar somente o serviço app deste
projeto. Testar geração real antes de anunciar IA disponível.

O proxy tem arquivo exclusivo para o domínio. Sempre executar `nginx -t` antes
de reload; não editar virtualhosts dos demais sites. Certificado Let's Encrypt
por webroot exclusivo, renovado pelo certbot já instalado no VPS.

Uso demonstrativo: somente perfis fictícios, conforme AGENTS.md. As contas por
papel são de demonstração, não autenticação de produção.

## Verificações observadas em 15/10/2026

- Main enviada, primeiro container saudável e timer ativo; próximos commits na main são a origem do deploy.
- HTTPS público respondeu200 após registro inteagir.ai passar para DNS sem proxy.
- Certificado próprio emitido, renovação certbot agendada e hook de reload condicionado somente a este domínio.
- Oito containers anteriores continuam com os mesmos IDs.
- Texto real gpt-6-sol com PDF/dois assuntos; imagem real PNG1536x1024/869253bytes pelo cliente oficial OAuth, servida por HTTP e vinculada à prévia; zero publicações.
- Ambos os logins novos do VPS foram confirmados; não repetir login. Perfis independentes em volumes sobrevivem a atualizações.
- Evidências fictícias privadas em /opt/inteagir-ai/verification/texto e imagem. Ilustração aberta: quatro vagões (um azul/três cinza) e barras extras com metades; exige revisão pedagógica, não aprovada para publicação automaticamente.
- Flags privadas de texto/imagem ativadas após gates. Não há Google/fallback ativo nem chave de API comercial.
- INTEAGIR_TRUST_PROXY=true apenas no compose: um salto Nginx, necessário para origem HTTPS e cookie Secure; backend deve continuar inacessível diretamente pela internet.
- Build/check:build e43 testes passaram. Acesso real aos módulos após correção e atualização automática ainda em verificação.

O timer atualiza o aplicativo/compose pela revisão Git. Alterações no próprio
update.sh, unidades systemd e Nginx exigem instalação administrativa explícita;
não alteram proxy/serviços automaticamente. Releases, imagens e backups são
preservados para recuperação; planejar retenção manual no diretório deste
projeto sem docker prune global.

Aceite posterior: timer detectou b67ca78 na main e atualizou sozinho o container;
seis módulos responderam200 por HTTPS com cookie Secure. SHA256 do JSON foi
preservado na troca, OAuth de imagem conservado, oito containers alheios intactos.
Teste real de texto via endpoint HTTPS também retornou Funcionando. Falha
artificial de healthcheck/rollback não foi provocada no ambiente público.
Cloudflare: manter inteagir.ai como DNS-only enquanto a borda não tiver
certificado que cubra inteagir.ai.glennscode.com; Universal SSL da zona
`glennscode.com` cobre apenas um nível. Referência oficial:
https://developers.cloudflare.com/ssl/edge-certificates/universal-ssl/limitations/.
