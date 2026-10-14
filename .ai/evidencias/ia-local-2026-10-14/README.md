# Geração real local — 14/10/2026

**Limite de uso vigente:** os arquivos comprovam o experimento técnico, não a autorização de uso do serviço agy como backend do PWA. Após consultar a cláusula 6 dos termos oficiais, a integração foi desativada/bloqueada; detalhes e fontes em `docs/IA_LOCAL.md`. Não anunciar geração atual ou G3 liberado com base nestes artefatos.

- `resumo.json`: PNG real gerado pelo CLI oficial agy, salvo pelo backend, relido após reinício e servido íntegro via HTTP autenticado; dimensões/hash. Não contém credenciais.
- `imagem-real.png`: amostra efetivamente gerada nesta instância, aberta visualmente pelo agente: quatro vagões iguais, um azul e três cinza. A imagem não foi publicada como aula.
- `previa-real.json`: texto real Codex/Hermes, esquema validado, com vínculo à mídia gerada. O caminho relativo pertence ao armazenamento isolado da verificação, não aos dados atuais da demonstração.
- `perfil-A.json` / `perfil-B.json`: duas chamadas por perfil fictício à mesma aula. A pede texto curto/interesse em trens; B pede texto completo/interesse em espaço. A explicação A define 3/4 em poucas frases; B detalha passos e exemplifica intervalos de observação da Lua, exigindo durações iguais. Equivalência e gabaritos da amostra foram inspecionados; revisão do professor humano continua necessária.

Origem textual confirmada: openai-codex/gpt-6-sol, lock efetivo confirmado e ferramentas desabilitadas. Imagem: agy oficial 1.3.3 nativo; modelo exato não informado. Sem fallback, VPS, publicação ou controle de navegador. Testes de protocolo com dublês não integram esta prova real.

Falhas observadas: endpoint compatível Hermes omitia runtime (resultado recusado); preferência visual inicialmente gerou pedido com `necessaria=false` (nenhuma imagem foi fingida); perfil agy usa persistência esparsa dos padrões (validação ajustada). Na versão corrigida, a geração texto+PNG passou. Não foi encontrada evidência de limite de quota; isso não significa uso ilimitado.

Reinício da instância de demonstração em 3001 foi rejeitado pela revisão automática: `Stop-Process`, “blocked by policy”. Processo preservado; configuração real salva no `.env` privado será aplicada ao encerrá-lo com Ctrl+C no terminal original e executar `npm.cmd start`.
