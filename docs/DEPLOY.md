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
