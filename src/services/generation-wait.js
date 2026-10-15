const pending = new Map();
const listeners = new Set();
export const subscribeGeneration = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
export const generationSnapshot = () => pending.values().next().value ?? "";
export function beginGeneration(url, method = "GET") {
  const label =
    method === "POST" &&
    (/\/aulas\/[^/]+\/planejamento$/.test(url)
      ? "Preparando o prompt criativo"
      : /\/aulas\/[^/]+\/gerar$/.test(url)
        ? "Criando a aula"
        : url === "/ia/testar"
          ? "Verificando a geração pela IA"
          : "");
  if (!label) return () => {};
  const id = Symbol();
  pending.set(id, label);
  listeners.forEach((fn) => fn());
  return () => {
    pending.delete(id);
    listeners.forEach((fn) => fn());
  };
}
