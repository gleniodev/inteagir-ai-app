import { spawn, execFileSync } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
const profile = "/app/.local/hermes-profile";
const token = process.env.INTEAGIR_HERMES_TOKEN;
if (!/^[a-f0-9]{64}$/.test(token ?? "")) throw new Error("Segredo interno Hermes inválido.");
async function createPrivate(filename, contents) {
  try { await writeFile(filename, contents, { flag: "wx", mode: 0o600 }); }
  catch (e) { if (e.code !== "EEXIST") throw e; }
}
await createPrivate(`${profile}/config.yaml`, `auth:
  adopt_external_logins: false
platform_toolsets:
  api_server: []
  cli: []
terminal:
  home_mode: profile
security:
  allow_lazy_installs: false
model:
  provider: openai-codex
  default: gpt-6-sol
agent:
  max_turns: 1
`);
await createPrivate(`${profile}/.env`, `API_SERVER_ENABLED=true\nAPI_SERVER_HOST=127.0.0.1\nAPI_SERVER_KEY=${token}\n`);
// Nunca sobrescrever segredo de um volume existente silenciosamente.
if (!(await readFile(`${profile}/.env`, "utf8")).split("\n").includes(`API_SERVER_KEY=${token}`))
  throw new Error("Segredo interno diverge do perfil dedicado.");
execFileSync(process.execPath, ["scripts/codex-image-local.js", "prepare"], { stdio: "inherit" });
// Hermes permanece no loopback do próprio container, sem porta pública.
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill("SIGTERM");
  setTimeout(() => process.exit(code), 3000).unref();
}
function start(args) {
  const child = spawn(process.execPath, args, { stdio: "inherit" });
  children.push(child);
  child.on("error", () => stop(1));
  child.on("exit", (code) => { if (!stopping) stop(code || 1); });
}
start(["scripts/hermes-local.js", "gateway", "run"]);
start(["server/index.js"]);
process.on("SIGTERM", () => stop());
process.on("SIGINT", () => stop());
