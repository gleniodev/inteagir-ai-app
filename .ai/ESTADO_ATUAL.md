# Estado atual — 14/10/2026

- Branch: `feat/T00-mvp-base`; origem inicial `58beeb5`. Git inicialmente limpo; nenhum código executável pré-existente.
- Documentos lidos: AGENTS.md (raiz), docs/{ESCOPO,TELAS_E_FLUXOS,REGRAS_DA_IA,BACKLOG}. Não existem cópias dos quatro últimos na raiz; usar as existentes em docs/.
- Remoto existente: inteagir-ai-app.git, diferente do URL inteagir-ai.git informado. Preservado; nenhum push/deploy autorizado.
- Dono das tarefas desta sessão: agente principal, sem frentes concorrentes.
- T00: quatro JPEGs abertos visualmente; inventário em VISUAL.md. Tokens estimados serão registrados no CSS; não há fontes, logos ou ilustrações separados.
- Próximo: contratos T02 e armazenamento T03; depois cadastro/aula/relatórios locais. Nenhum gate de IA passou.
- Ambiente: Node v24.13.1; npm.cmd 11.18.0 (npm.ps1 bloqueado por política existente). agy.exe presente; Hermes não encontrado no PATH. VPS/credenciais não fornecidos.
- Build/testes: ainda não executados, projeto sem package.json antes desta sessão.
- Imagem de contingência solicitada pela ferramenta integrada; pendente de arquivo e inspeção. Não comprova T09/G3 pelo backend.

## Checkpoint de implementação (antes da revisão final)
- API e seis áreas implementadas localmente; contratos validados por Zod. Dados gravados pelo backend em JSON atômico com backup e fila.
- Imagem `fixtures/media/fracao-trem.png` efetivamente gerada via imagegen, copiada e inspecionada: quatro vagões, um azul/três cinza. Uso exclusivamente pré-gerado; T09/G3 continuam bloqueados.
- `npm.cmd test`: 4/4 testes passaram. Percurso HTTP com PDF real, dois alunos, duas variações fixas, dois assuntos/seis questões, revisão, publicação, gabarito omitido, observações, versões e reinício passou.
- Build passou antes e após primeiros ajustes visuais. Ajuste de compactação introduziu fechamento JSX sobrando, detectado pelo formatador/build e corrigido; último build observado passou.
- Cadastro A01 preenchido nas dez perguntas e salvo via Chrome. Recarregamento + seleção recuperaram nome/interesses e demais preferências.
- Comparação desktop inicial Professor/Cadastro realizada; fonte/ícones aproximados, mais espaço para privacidade e seletor, dez perguntas em cartões sequenciais. Ajustes de posição/altura em revisão.
- Adicionado Prettier como ferramenta de desenvolvimento para manter código legível para estudantes; sem impacto no runtime. Sem formatter pré-existente no repositório.
- Próximo: finalizar UI pelo navegador, conferir mobile e relatórios, registrar evidências, atualizar backlog e criar commits locais. Nenhum push/deploy.

## Mapeamento visual
| Tela | Referência consultada | Componentes | Comparação |
|---|---|---|---|
| Professor | docs/referencia-telas/professor.jpeg | A implementar | Pendente |
| Cadastro | docs/referencia-telas/aluno.jpeg (mostra cadastro) | A implementar | Pendente |
| Aluno/aula | Sem referência própria; linguagem comum do cadastro | A implementar | Referência específica ausente |
| Responsável | docs/referencia-telas/responsavel.jpeg | A implementar | Pendente |
| Psicólogo | docs/referencia-telas/psicologo.jpeg | A implementar | Pendente |
| Configuração IA | Sem referência própria; linguagem compartilhada | A implementar | Referência específica ausente |
