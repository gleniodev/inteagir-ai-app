# T07/T08 — análise, edição e produção em duas chamadas

Teste real local às 21:48 de 14/10/2026 (00:48 UTC de 15/10). Reproduzir: `node --env-file=.env scripts/check-hermes-local.js --with-vision` com instância dedicada autenticada por OAuth e todas as ferramentas desabilitadas.

Fonte: PNG sintético com texto de exercício, números 17 e 6 somente nos pixels. Perfil fictício com preferência só texto. Primeiro POST planejamento interpreta a fonte e produz compreensão factual, abordagem criativa, explicação, imagens, questões e cuidados. Uma edição de abordagem pede passos curtos/decomposição distributiva; PUT salva revisão 2. Segundo POST gerar recebe revisão 2 e produz explicação 17 × 6 = 102 e três questões validadas. Planejamento/fonte/resposta observados; gabaritos coerentes. Nenhuma publicação. Dois testes reais deste fluxo passaram; este diretório contém a segunda execução.

`planejamento.json`: prompt após edição; `previa.json`: aula; `resumo.json`: registro sanitizado com runtime openai-codex/gpt-6-sol confirmado; `material-visual.png`: entrada sintética, não ilustração de saída gerada por IA. Nenhum token/base64 de transporte. O teste não demonstra geração de nova imagem, navegador ou VPS.

Automação adicional verifica versão editada enviada à segunda chamada, persistência após reinício, reabertura sem inferência extra, invalidação de prévia ao editar, rejeição de versão/contexto antigo, HTML/assunto incorreto e acesso sem papel professor. QA visual/teclado/mobile permanece adiada pelo usuário; professor deve revisar a precisão antes de publicar.
