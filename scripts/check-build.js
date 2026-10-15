import assert from "node:assert/strict";
import { once } from "node:events";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { createApp } from "../server/app.js";

// Verifica o build real servido pelo Express, sem controlar um navegador.
// Executar depois de npm.cmd run build; dados da demo ficam intocados.
const distDir = path.resolve("dist");
const worker = await readFile(path.join(distDir, "sw.js"), "utf8");
assert.ok(!worker.includes("__BUILD_VERSION__"));
assert.ok(!worker.includes("__SHELL_ASSETS__"));
const assets = JSON.parse(
  worker.match(/const SHELL_ASSETS = (\[[\s\S]*?\]);/)[1],
);
assert.ok(assets.includes("/"));
assert.ok(assets.some((url) => /^\/assets\/.+\.js$/.test(url)));
assert.ok(assets.some((url) => /^\/assets\/.+\.css$/.test(url)));
assert.ok(
  assets.every(
    (url) =>
      url === "/" ||
      /^\/(assets|references)\/[^/]+$/.test(url) ||
      [
        "/manifest.webmanifest",
        "/icon-192.png",
        "/icon-512.png",
        "/logo-inteagir.webp",
        "/symbol-inteagir.webp",
        "/favicon-16.png",
        "/favicon-32.png",
        "/apple-touch-icon.png",
      ].includes(url),
  ),
);

const root = await mkdtemp(path.join(os.tmpdir(), "inteagir-build-"));
let server;
try {
  const { app } = await createApp({
    dataDir: path.join(root, "data"),
    uploadsDir: path.join(root, "uploads"),
    mediaDir: path.join(root, "media"),
    distDir,
  });
  server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const url of [...assets, "/sw.js"]) {
    const response = await fetch(base + url);
    assert.equal(response.status, 200, url);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff");
    const expected = await readFile(
      path.join(distDir, url === "/" ? "index.html" : url.slice(1)),
    );
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), expected, url);
    if (url === "/sw.js")
      assert.equal(response.headers.get("cache-control"), "no-cache");
  }
  const html = await readFile(path.join(distDir, "index.html"), "utf8");
  for (const [, url] of html.matchAll(/(?:src|href)="(\/[^"#]+)"/g))
    assert.ok(assets.includes(url), `Asset do HTML ausente no shell: ${url}`);
  const manifest = await (await fetch(base + "/manifest.webmanifest")).json();
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.scope, "/");
  assert.equal(manifest.display, "standalone");
  for (const icon of manifest.icons) {
    assert.ok(assets.includes(icon.src));
    const metadata = await sharp(
      await readFile(path.join(distDir, icon.src.slice(1))),
    ).metadata();
    assert.equal(`${metadata.width}x${metadata.height}`, icon.sizes);
    assert.equal(metadata.format, "png");
  }
  const privateResponse = await fetch(base + "/api/alunos");
  assert.equal(privateResponse.status, 401);
  assert.equal(privateResponse.headers.get("cache-control"), "no-store");
  for (const url of [
    "/assets/inexistente.js",
    "/server/data/estado.json",
    "/uploads/privado.pdf",
  ])
    assert.equal((await fetch(base + url)).status, 404);
  console.log(
    `Build HTTP verificado: ${assets.length} recursos do shell, worker, manifesto, ícones e isolamento da API. Instalação/offline no navegador não verificados.`,
  );
} finally {
  if (server?.listening)
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve())),
    );
  // Remover somente o diretório temporário criado por este verificador.
  assert.equal(path.dirname(path.resolve(root)), path.resolve(os.tmpdir()));
  assert.ok(path.basename(root).startsWith("inteagir-build-"));
  await rm(root, { recursive: true, force: true });
}
