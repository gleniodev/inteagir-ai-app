import { createHash } from "node:crypto";
import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

// Somente arquivos públicos do shell, nunca dados ou mídia da API.
export async function createWorker(distDir, template) {
  const files = [
    "index.html",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
    "logo-inteagir.webp",
    "symbol-inteagir.webp",
    "favicon-16.png",
    "favicon-32.png",
    "apple-touch-icon.png",
  ];
  for (const directory of ["assets", "references"]) {
    for (const file of await readdir(path.join(distDir, directory)))
      files.push(`${directory}/${file}`);
  }
  files.sort();
  const hash = createHash("sha256").update(template);
  for (const file of files)
    hash.update(file).update(await readFile(path.join(distDir, file)));
  const urls = files.map((file) => (file === "index.html" ? "/" : `/${file}`));
  return template
    .replace("__BUILD_VERSION__", hash.digest("hex").slice(0, 16))
    .replace('["__SHELL_ASSETS__"]', JSON.stringify(urls));
}

export function pwaShell() {
  let config;
  return {
    name: "inteagir-pwa-shell",
    apply: "build",
    configResolved(value) {
      config = value;
    },
    async closeBundle() {
      const distDir = path.resolve(config.root, config.build.outDir);
      const template = await readFile(
        path.join(config.publicDir, "sw.js"),
        "utf8",
      );
      await writeFile(
        path.join(distDir, "sw.js"),
        await createWorker(distDir, template),
      );
    },
  };
}
