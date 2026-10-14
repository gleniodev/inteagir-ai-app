import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, writeFile, rm } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import vm from "node:vm";
import { createWorker } from "../build/pwa.js";

const template = await readFile(
  new URL("../public/sw.js", import.meta.url),
  "utf8",
);
async function fixture(t) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "inteagir-pwa-"));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()));
    assert.ok(path.basename(dir).startsWith("inteagir-pwa-"));
    return rm(dir, { recursive: true, force: true });
  });
  const files = new Map([
    ["/", "<html>Shell v1</html>"],
    ["/assets/app.js", "export const version = 1;"],
    ["/assets/app.css", "body { color: blue; }"],
    ["/references/professor.jpeg", "public-reference"],
    ["/manifest.webmanifest", "{}"],
    ["/icon-192.png", "public-icon"],
    ["/icon-512.png", "public-icon"],
  ]);
  await mkdir(path.join(dir, "assets"));
  await mkdir(path.join(dir, "references"));
  for (const [url, data] of files)
    await writeFile(
      path.join(dir, url === "/" ? "index.html" : url.slice(1)),
      data,
    );
  return { dir, files };
}

// Teste do código do worker em ambiente simulado, sem controlar navegador.
function runtime(source, files, stores = new Map(), unavailable = false) {
  const listeners = new Map();
  let skipped = false,
    claimed = false;
  const caches = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(urls) {
          const entries = urls.map((url) => {
            if (unavailable || !files.has(url))
              throw new Error("Offline ou arquivo ausente");
            return [url, files.get(url)];
          });
          entries.forEach(([url, data]) => store.set(url, data));
        },
        async match(url) {
          return store.get(url);
        },
      };
    },
    async keys() {
      return [...stores.keys()];
    },
    async delete(name) {
      return stores.delete(name);
    },
  };
  vm.runInNewContext(source, {
    URL,
    caches,
    fetch: async () => {
      throw new Error("Sem rede");
    },
    self: {
      location: { origin: "http://local.test" },
      addEventListener: (name, handler) => listeners.set(name, handler),
      skipWaiting: async () => {
        skipped = true;
      },
      clients: {
        claim: async () => {
          claimed = true;
        },
      },
    },
  });
  return {
    stores,
    skipped: () => skipped,
    claimed: () => claimed,
    async lifecycle(name) {
      let pending;
      listeners.get(name)({
        waitUntil: (p) => {
          pending = p;
        },
      });
      await pending;
    },
    async request(url, mode = "cors", method = "GET") {
      let pending;
      listeners.get("fetch")({
        request: { url: new URL(url, "http://local.test").href, mode, method },
        respondWith: (p) => {
          pending = p;
        },
      });
      return pending === undefined ? "pass-through" : await pending;
    },
  };
}

test("T01: shell instalado fornece HTML/JS/CSS/identidade sem rede; API nunca usa cache", async (t) => {
  const f = await fixture(t);
  const source = await createWorker(f.dir, template);
  assert.ok(!source.includes("__BUILD_VERSION__"));
  assert.ok(!source.includes("__SHELL_ASSETS__"));
  const worker = runtime(source, f.files);
  await worker.lifecycle("install");
  await worker.lifecycle("activate");
  assert.equal(worker.skipped(), true);
  assert.equal(worker.claimed(), true);
  for (const [url, data] of f.files)
    assert.equal(
      await worker.request(url, url === "/" ? "navigate" : "cors"),
      data,
    );
  assert.equal(await worker.request("/?demo=1", "navigate"), f.files.get("/"));
  for (const url of [
    "/api/alunos",
    "/api/media/aula/aluno/imagem.png",
    "/uploads/private.pdf",
    "https://other.test/assets/app.js",
    "/assets/app.js?private=1",
  ]) {
    assert.equal(await worker.request(url), "pass-through");
  }
  assert.equal(await worker.request("/", "navigate", "POST"), "pass-through");
});

test("T01: novo build troca cache próprio; falha de instalação preserva versão anterior", async (t) => {
  const f = await fixture(t);
  const original = await createWorker(f.dir, template);
  assert.equal(await createWorker(f.dir, template), original);
  const old = runtime(original, f.files);
  await old.lifecycle("install");
  old.stores.set("outra-aplicacao", new Map([["/", "outro-shell"]]));
  await writeFile(path.join(f.dir, "index.html"), "<html>Shell v2</html>");
  const updated = await createWorker(f.dir, template);
  assert.notEqual(updated, original);
  const broken = runtime(updated, f.files, old.stores, true);
  await assert.rejects(broken.lifecycle("install"), /Offline/);
  assert.equal(broken.skipped(), false);
  assert.equal(await old.request("/", "navigate"), "<html>Shell v1</html>");
  f.files.set("/", "<html>Shell v2</html>");
  const next = runtime(updated, f.files, old.stores);
  await next.lifecycle("install");
  await next.lifecycle("activate");
  assert.equal(await next.request("/", "navigate"), "<html>Shell v2</html>");
  assert.equal(next.stores.get("outra-aplicacao").get("/"), "outro-shell");
  assert.equal(
    [...next.stores.keys()].filter((name) => name.startsWith("inteagir-shell-"))
      .length,
    1,
  );
});
