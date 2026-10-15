# T06/T07/T08 — leitura real de imagem anexada

Reproduzir: `node --env-file=.env scripts/check-hermes-local.js --with-vision`, com Hermes dedicado autenticado por OAuth e ferramentas desativadas.

`material-visual.png` é fonte sintética de teste, texto rasterizado. Números 17 e 6 enviados somente nos pixels, sem transcrição ou inclusão nos campos da aula. O fluxo upload → mensagem multimodal → Codex OAuth via Hermes gpt-6-sol → JSON validado gerou explicação de 17 × 6 = 102 e três questões coerentes. Fonte/JSON/gabaritos inspecionados pelo agente. Aluno fictício com preferência só texto, nenhuma publicação. `previa.json` e `resumo.json` contêm resultado e registro sanitizado, sem credenciais/base64 de transporte.

Testes automatizados verificam assunto vinculado, pixels transmitidos, uploads antigos e arquivo corrompido bloqueando prévia/publicação. Não houve comparação nova no navegador; não prova precisão universal nem substitui revisão do professor. PDFs escaneados continuam exigindo preparação manual.
