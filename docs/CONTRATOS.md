# T02 — Contratos 1.0

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

`PUT /api/aulas/:id` aceita ID opcional em assuntos para preservar o vínculo existente. IDs fornecidos precisam pertencer à aula; um assunto com material específico não pode ser removido. Edição invalida apenas a prévia do rascunho; os snapshots publicados e as sessões permanecem iguais. `POST` continua gerando todos os IDs no servidor.

Relatórios incluem `conteudos` com títulos, origem e resumo das explicações publicadas, mesmo antes de iniciar uma sessão; não incluem questões/gabaritos. Respostas registram `ultimaAlternativa` após a tentativa, além de acerto/ajudas/tentativas. `etapaId` no evento é a chave composta assunto/etapa (limite de 160 caracteres, compatível com IDs máximos da geração). Campos adicionados nesta sessão sob o mesmo dono LT, sem frentes concorrentes.
