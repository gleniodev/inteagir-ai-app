import { beginGeneration } from "./generation-wait.js";

export async function api(url, options = {}) {
  const done = beginGeneration(url, options.method);
  try {
    return await request(url, options);
  } finally {
    done();
  }
}

async function request(url, options = {}) {
  let response;
  try {
    response = await fetch("/api" + url, {
      credentials: "same-origin",
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      body:
        options.body && !(options.body instanceof FormData)
          ? JSON.stringify(options.body)
          : options.body,
    });
  } catch {
    throw new Error(
      "Sem conexão com o servidor. As alterações não foram salvas; tente novamente.",
    );
  }
  const data = await response
    .json()
    .catch(() => ({ erro: "Resposta inesperada do servidor." }));
  if (!response.ok) {
    const error = new Error(
      data.erro +
        (data.detalhes?.length
          ? " " +
            data.detalhes.map((d) => `${d.campo}: ${d.mensagem}`).join(" ")
          : ""),
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
