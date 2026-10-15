import { spawn } from "node:child_process";
import { readFile, realpath, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";
import { GenerationError } from "./hermes-text.js";
import { createImageFallback } from "./image-fallback.js";

const root = fileURLToPath(new URL("../../", import.meta.url));
const profile =
  process.platform === "win32"
    ? path.join(process.env.LOCALAPPDATA, "InTEAgir-Hermes-Profile")
    : path.join(root, ".local", "hermes-profile");
const failure =
  "Não foi possível gerar imagem OpenAI OAuth pelo Hermes. Nenhum conteúdo incompleto foi publicado.";

export function configuredHermesImage(env = process.env) {
  if (env.INTEAGIR_HERMES_IMAGE_ENABLED !== "true") return null;
  // Google continua ausente até existir acesso OAuth permitido/modelo confirmado.
  return createImageFallback({ primary: createHermesCodexImage() });
}

export function createHermesCodexImage() {
  let state = "Não verificado";
  return {
    name: "OpenAI OAuth via Hermes (cliente oficial Codex)",
    status: () => state,
    async generate({ pedido }) {
      const started = Date.now();
      try {
        if (
          typeof pedido !== "string" ||
          !pedido.trim() ||
          pedido.length > 6000
        )
          throw new Error();
        const output = await new Promise((resolve, reject) => {
          const child = spawn(
            process.execPath,
            [path.join(root, "scripts/hermes-local.js"), "image-backend"],
            { cwd: root, windowsHide: true, stdio: ["pipe", "pipe", "pipe"] },
          );
          const chunks = [];
          let length = 0;
          const timer = setTimeout(() => {
            child.kill();
            reject(new Error());
          }, 340000);
          child.stdout.on("data", (b) => {
            length += b.length;
            if (length > 128 * 1024) {
              child.kill();
              reject(new Error());
            } else chunks.push(b);
          });
          child.stderr.on("data", () => {});
          child.stdin.on("error", () => {});
          child.on("error", () => {
            clearTimeout(timer);
            reject(new Error());
          });
          child.on("close", (code) => {
            clearTimeout(timer);
            code === 0
              ? resolve(Buffer.concat(chunks).toString("utf8"))
              : reject(new Error());
          });
          child.stdin.end(JSON.stringify({ pedido }));
        });
        const bytes = await readHermesImageArtifact({
          output,
          profile,
          started,
        });
        state = "Funcionando";
        return { bytes, provider: "openai-codex" };
      } catch {
        state = "Falha";
        throw new GenerationError(failure);
      }
    },
  };
}

export async function readHermesImageArtifact({ output, profile, started }) {
  const result = JSON.parse(output);
  if (
    result.success !== true ||
    result.bridge !== "hermes-image-registry" ||
    result.selected !== "inteagir-openai-oauth" ||
    result.provider !== "openai-codex" ||
    typeof result.image !== "string" ||
    !path.isAbsolute(result.image) ||
    !/\.png$/i.test(result.image)
  )
    throw new Error();
  const cache = await realpath(path.join(profile, "cache/generated/images"));
  const cacheRelative = path.relative(await realpath(profile), cache);
  if (cacheRelative.startsWith("..") || path.isAbsolute(cacheRelative))
    throw new Error();
  const actual = await realpath(result.image);
  const relative = path.relative(cache, actual);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative))
    throw new Error();
  const info = await stat(actual);
  if (
    !info.isFile() ||
    info.size > 10 * 1024 * 1024 ||
    info.mtimeMs < started - 2000
  )
    throw new Error();
  const image = sharp(await readFile(actual), {
    limitInputPixels: 16000000,
    animated: false,
  });
  const meta = await image.metadata();
  if (
    meta.format !== "png" ||
    meta.width < 64 ||
    meta.height < 64 ||
    meta.pages > 1
  )
    throw new Error();
  const bytes = await image.png().toBuffer();
  if (bytes.length > 10 * 1024 * 1024) throw new Error();
  return bytes;
}
