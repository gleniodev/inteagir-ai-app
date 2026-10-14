# T02 — Contratos 1.0

Prompt interno compilado (T07): `informacoesAula` inclui `tituloAula`, `descricaoAula` (string; vazia quando ausente em registro antigo), disciplina/turma/assuntos/materiais. A prévia e a chamada ao adaptador usam o mesmo objeto. Alterar somente a descrição durante a geração invalida o resultado anterior. Não muda o esquema do JSON pedagógico nem das publicações. Dono LT/FE/BE nesta sessão: agente principal, sem outras frentes; revisão humana pendente.

Implementação normativa: `shared/contracts.js` (Zod); JSON de geração preserva exatamente `etapas`, `indiceCorreto`, `imagem.arquivo` de REGRAS_DA_IA.md. Dono nesta sessão: agente principal. Não há outras frentes ativas; revisão do líder técnico pendente.

- Aluno: `{id: UUID, nome, turmaId: "9C", responsavelId: "R01", email: "" ou @example.com, ficticio: true, preferencias: {interesses: [], estiloVisual, explicacao, texto, evitar: [], tipoResposta, ajuda, feedback, progresso, observacoes}, criadoEm}`. Escolhas escalares podem ser null para recusa; ID não depende do nome. Dez respostas declaradas, sem inferências.
- Aula: `{id: UUID, disciplina: "Matemática"|"História", titulo, descricao, turmaId: "9C", assuntos: [{id: UUID, titulo, descricao, objetivo}], materiais: [UUID], status, gerados: {alunoId: [documentosPorAssunto]}, promptBaseVersion}`.
- Material: `{id, aulaId, assuntoId: UUID|null, nome, tamanho, mime, arquivo: nomeGeradoServidor, status, texto, mensagem}`. Arquivo separado, leitura real de PDF; foto/OCR exige preparação manual e status explícito.
- Publicação: `{id, aulaId, alunoId, versao, assuntos: [documentosPorAssunto], origem, promptBaseVersion, revisao, publicadoEm}`. Snapshot imutável; sessão referencia publicação, não rascunho.
- Sessão: `{id, publicacaoId, alunoId, indice, pausada, concluida, respostas: {assuntoId/etapaId: {tentativas, firstTryCorrect, correta, ajudas}}, eventos: [UUID], tempoVisivelMs, avaliacao, iniciadoEm, concluidoEm}`. Resposta/evento calculados no servidor. Gabarito omitido das rotas do aluno, feedback após tentativa.
- Geração: `{jobId, aulaId, alunoId, tipo, adaptador, resultado, criadoEm, duracaoMs, fallbackUsado, mensagem}`. Sem prompts completos ou segredos em log. Adaptadores ainda não configurados falham honestamente.
- Diretriz: `{versao: inteiro crescente, texto, criadoEm}`. Restaurar cria nova versão para preservar histórico.

Todos os corpos são validados; referências são conferidas no backend. Persistência única por processo com fila, temporário+fsync+rename e backup anterior. Operar somente uma instância Node por diretório de dados.

Sessão inclui `revisaoEventos`, incrementada pelo servidor a cada evento novo. O frontend rejeita snapshots atrasados de revisão inferior; eventos duplicados não incrementam a revisão. Adição comunicada no checkpoint desta sessão, sem outras frentes concorrentes.

T11/T12 — adição compatível sob o mesmo dono LT/FE-A/FE-P/BE-IA (agente principal, sem frentes concorrentes): evento `voltar` em `POST /api/sessoes/:id/eventos`, com a mesma `etapaId` e idempotência dos demais eventos. Revisita a etapa anterior em sessão ativa; recusa a primeira etapa e sessões pausadas/concluídas. `indice` indica a posição atual, enquanto `etapasConcluidas` guarda o maior total já avançado, sem diminuir ao voltar. Campo opcional no JSON existente: ausência equivale a `indice`, sem migração destrutiva. Respostas, tentativas e ajudas não são apagadas. Renderer e relatórios usam `etapasConcluidas` para a quantidade concluída. Revisão do LT humano continua pendente.

`PUT /api/aulas/:id` aceita ID opcional em assuntos para preservar o vínculo existente. IDs fornecidos precisam pertencer à aula; um assunto com material específico não pode ser removido. Edição invalida apenas a prévia do rascunho; os snapshots publicados e as sessões permanecem iguais. `POST` continua gerando todos os IDs no servidor.

Relatórios incluem `conteudos` com títulos, origem e resumo das explicações publicadas, mesmo antes de iniciar uma sessão; não incluem questões/gabaritos. Respostas registram `ultimaAlternativa` após a tentativa, além de acerto/ajudas/tentativas. `etapaId` no evento é a chave composta assunto/etapa (limite de 160 caracteres, compatível com IDs máximos da geração). Campos adicionados nesta sessão sob o mesmo dono LT, sem frentes concorrentes.

T08/T14 — mesmo dono, sem frentes concorrentes: log de tentativa pode incluir `assuntoId`, `promptBaseVersion`, `provedor` e `modelo` confirmados pelo runtime do adaptador textual. Prompt compilado em server/services/prompt.js preserva os campos da prévia existente. JSON gerado permanece no contrato 1.0; não há formato executável novo. Adaptador fica desativado sem configuração explícita; testes de protocolo não contam como gates reais. Ver IA_LOCAL.md.
