# InTEAgir.AI

Protótipo educacional de demonstração: React + Vite + Tailwind, Express e arquivos JSON. Somente perfis fictícios; o seletor de área **não é autenticação de produção**.

Texto real via Hermes/Codex foi configurado e testado com dados fictícios. O experimento de imagem agy produziu PNG real, mas sua integração ao PWA foi desativada após a auditoria das condições do provedor; falta um backend de imagem autorizado. Provas técnicas preservadas em [.ai/evidencias/ia-local-2026-10-14](.ai/evidencias/ia-local-2026-10-14). Aulas geradas exigem revisão do professor. A opção **Pré-gerado para demonstração** continua separada e explícita. Fallback, navegador e VPS permanecem pendentes. Detalhes e fontes em [docs/IA_LOCAL.md](docs/IA_LOCAL.md).

## Executar localmente

Requer Node 24 (versão usada nos testes) e npm. No PowerShell deste ambiente, use `npm.cmd`, pois o script `npm.ps1` é bloqueado pela política existente.

```powershell
npm.cmd ci
npm.cmd run build
npm.cmd start
```

Abrir [demonstração local](http://127.0.0.1:3001). Para desenvolvimento, executar `npm.cmd run server` em um terminal e `npm.cmd run dev` em outro; frontend em http://127.0.0.1:5173. `npm.cmd run preview` serve somente a interface estática e não substitui o backend.

`start` e `server` carregam o `.env` privado se existir. Para a configuração real desta máquina, iniciar antes `node scripts/hermes-local.js gateway run` em outro terminal. Perfis dedicados e credenciais não acompanham o Git; em outra máquina, seguir `docs/IA_LOCAL.md`. Sem configuração explícita, os adaptadores continuam indisponíveis.

O servidor escuta **127.0.0.1** por padrão. Os dados ficam em `server/data/estado.json`, backup anterior em `estado.json.bak`, materiais em `server/uploads/` e imagens de aula em `server/media/`. Essas pastas são ignoradas no Git. **Executar uma única instância Node por diretório de dados.** JSON corrompido bloqueia o início; preserve o arquivo e restaure um backup com o servidor parado.

## Roteiro de demonstração

1. Cadastro: criar **Aluno A01**, turma 9º ano C, responsável R01 e interesse trens; responder às dez perguntas (ou recusar as opcionais). Confirmar perfil fictício e salvar. Recarregar e selecionar o perfil para conferir as respostas.
2. Professor → Matemática → Criar nova aula → **Preencher exemplo de frações**. Salvar os dois assuntos separados.
3. Enviar `fixtures/media/fracao-trem.png` como material. A imagem fica em **Necessita revisão**, pois OCR não foi configurado. Abrir o material, preencher e salvar o texto manual: “Uma fração representa partes iguais de um todo. O numerador indica as partes consideradas; o denominador, o total de partes iguais. Frações equivalentes representam o mesmo valor: 1/2 = 2/4.” PDFs pesquisáveis têm extração real de texto.
4. Selecionar 9º ano C e A01. Conferir diretrizes, assuntos, material e preferências na prévia. **Gerar aula adaptada** usa os adaptadores reais quando configurados; pode levar alguns minutos. Em caso de falha, conferir a mensagem; conteúdo incompleto não pode ser publicado.
5. Revisar os dois assuntos, imagens e gabaritos, marcar o checklist e publicar. Como alternativa explícita, **Usar exemplo pré-gerado de frações** prepara conteúdo fixo, sem gerar a partir dos anexos; o professor precisa confirmar compatibilidade.
6. Aluno → selecionar A01 → Começar. Ler, responder três questões de cada assunto, pedir uma dica, testar nova tentativa, voltar à etapa anterior e pausar. Voltar permite reler sem apagar respostas ou reduzir as etapas concluídas dos relatórios. Concluir e registrar opinião.
7. Responsável → selecionar A01 → conferir resultados e registrar observação. Psicólogo → mesmo perfil → conferir fatos/observação e salvar ou restaurar diretrizes (cada operação cria nova versão).
8. Reiniciar o servidor e recarregar o navegador: selecionar os perfis para recuperar registros. Configuração da IA mostra estados e erros sanitizados, sem segredos.

História permite criar aulas/assuntos e enviar materiais; a contingência é exclusivamente de frações em Matemática. Preferências de áudio/seleção em imagem/digitação são armazenadas, mas o P0 oferece leitura e alternativas. “Só texto” dispensa imagem; evitar movimentos/sons é respeitado pelo comportamento estático e sem autoplay.

## Verificar

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run check:build
npm.cmd audit --omit=dev
```

Os testes usam servidor HTTP real e diretórios temporários, sem tocar nos dados locais da demonstração: validação, concorrência, backup/reinício, PDF pesquisável, upload inválido, revisão/publicação, mídia ausente, questões, idempotência, relatos e diretrizes. O contador registra tempo visível aproximado, exclui pausas e intervalos longos sem pulsos; não mede foco, emoção ou eficácia pedagógica.

`check:build` exige o build anterior e verifica seus arquivos reais pelo Express em porta temporária: shell completo, HTML, worker sem placeholders, manifesto, dimensões dos ícones e proteção da API/caminhos privados. Usa dados temporários, encerra o servidor ao terminar e não acessa navegador. Não comprova instalação ou offline real.

## PWA e pendências

Manifesto, ícones da marca existente e service worker estão incluídos. O cache contém apenas a interface e assets; nunca API ou dados de perfis. IA e dados exigem servidor conectado. Instalação pública e deploy HTTPS no VPS **não foram validados**; precisam de infraestrutura e autorização.

O build inclui HTML, JavaScript, CSS, ícones e referências públicas no cache inicial. Cada conjunto recebe uma versão por conteúdo; atualizações removem apenas caches do InTEAgir. Falha de instalação mantém a versão anterior. Os testes automatizados simulam esse comportamento; instalação e offline no navegador ainda precisam de verificação. O service worker é registrado somente no build de produção (`npm.cmd run build` + `npm.cmd start`), não no servidor de desenvolvimento Vite.

Referências e divergências estão em [.ai/VISUAL.md](.ai/VISUAL.md); estado e próxima ação em [.ai/ESTADO_ATUAL.md](.ai/ESTADO_ATUAL.md) e [.ai/RETOMADA.md](.ai/RETOMADA.md). Contratos em [docs/CONTRATOS.md](docs/CONTRATOS.md), regras em [AGENTS.md](AGENTS.md).

Dependências: stack obrigatória; Lucide para ícones de interface compatíveis; Zod para contratos; Multer para upload multipart limitado; pdf-parse para texto pesquisável; Sharp para verificar mídia decodificável. Prettier somente no desenvolvimento para código legível. Tailwind usa o [plugin oficial para Vite](https://tailwindcss.com/docs/installation/using-vite); uploads seguem os limites e filtros documentados pelo [Multer/Express](https://expressjs.com/en/resources/middleware/multer/).

O remoto local original é `gleniodev/inteagir-ai-app.git`, diferente do URL `inteagir-ai.git` informado no prompt. Foi preservado; não houve push nem deploy.
