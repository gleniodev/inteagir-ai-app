# Evidência local — OpenAI OAuth via Hermes

Dados e material fictícios. Login novo no cliente oficial Codex confirmado, sem copiar credenciais pessoais/Hermes ou usar API key. O backend invoca um provedor `ImageGenProvider` registrado e selecionado explicitamente no registry do checkout Hermes dedicado. Esse provedor usa a ferramenta nativa do cliente oficial isolado, sem chamar endpoints internos diretamente. Ferramentas textuais da API continuam todas desabilitadas (27 conjuntos consultados).

Fonte: `.local/gates/2026-10-14T18-01-50-484Z`, executada por `node --env-file=.env scripts/check-hermes-local.js --with-images`.

- Texto real: openai-codex/gpt-6-sol, 12.372 ms, JSON validado, explicação e três questões com três alternativas. Gabaritos 0/1/2 e conteúdo da amostra inspecionados; revisão humana ainda necessária.
- Imagem real: OpenAI OAuth pelo provedor Hermes/cliente oficial, 40.608 ms, PNG 2172 × 724, 803.697 bytes. Id exato do motor de imagem não informado, sem presumir modelo.
- SHA256: `7dde48aaadca85af7af006981d7162737217929617ebe2c47bc4ad90f37c22dc`.
- Arquivo aberto visualmente pelo agente: exatamente quatro vagões iguais, um azul e três cinza, fundo claro, sem texto. A inspeção do agente não substitui aprovação do professor.
- HTTP autenticado serviu a imagem; novo processo Node restaurou a prévia e serviu os mesmos bytes/hash. Reserva ausente devolveu HTTP 503 e não alterou a prévia/publicações.
- Nenhuma publicação, navegação no PWA, instalação/offline ou execução no VPS. **Somente primária verificada localmente; Nano Banana 2 não configurado/gerado.**

Arquivos: `imagem-real.png`, `previa-real.json`, `resumo.json` (inclui teste de reinício). Não incluem OAuth, dados de conta ou credenciais.

Limite observado: uma tentativa anterior falhou com HTTP 500 na gravação de material, deixando temporário de JSON; a repetição e o teste de reinício passaram. Causa dessa falha de gravação não diagnosticada; não alegar correção.
