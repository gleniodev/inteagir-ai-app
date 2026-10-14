const CACHE = "inteagir-shell-v1";
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((c) =>
        c.addAll([
          "/",
          "/manifest.webmanifest",
          "/icon-192.png",
          "/icon-512.png",
        ]),
      ),
  );
  self.skipWaiting();
});
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Nunca armazenar API, uploads, mídia individual, respostas ou gabaritos no cache público.
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    event.request.method !== "GET"
  )
    return;
  event.respondWith(
    fetch(event.request)
      .then(async (response) => {
        if (
          response.ok &&
          (url.pathname.startsWith("/assets/") ||
            url.pathname.startsWith("/references/") ||
            event.request.mode === "navigate")
        ) {
          const copy = response.clone();
          try {
            const cache = await caches.open(CACHE);
            await cache.put(event.request, copy);
          } catch {
            // Falha de cache não deve impedir uma resposta online válida.
          }
        }
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then(
            (c) =>
              c ??
              (event.request.mode === "navigate"
                ? caches.match("/")
                : Response.error()),
          ),
      ),
  );
});
