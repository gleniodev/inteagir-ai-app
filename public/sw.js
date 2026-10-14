const PREFIX = "inteagir-shell-";
const CACHE = PREFIX + "__BUILD_VERSION__";
const SHELL_ASSETS = ["__SHELL_ASSETS__"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // Só ativa quando HTML, JS, CSS e identidade visual estão juntos.
      await cache.addAll(SHELL_ASSETS);
      await self.skipWaiting();
    })(),
  );
});
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && key !== CACHE) await caches.delete(key);
      }
      await self.clients.claim();
    })(),
  );
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Apenas URLs públicas explicitamente incluídas no build usam o cache.
  if (url.origin !== self.location.origin || event.request.method !== "GET")
    return;
  const key =
    event.request.mode === "navigate" && url.pathname === "/"
      ? "/"
      : url.search
        ? null
        : url.pathname;
  if (!key || !SHELL_ASSETS.includes(key)) return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const saved = await cache.match(key);
      // Mantém uma versão inteira; um novo build chega pela atualização do worker.
      return saved ?? fetch(event.request);
    })(),
  );
});
