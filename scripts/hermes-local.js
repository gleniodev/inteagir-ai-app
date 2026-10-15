import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";

// Executar somente o checkout/perfil dedicados, sem adotar o Hermes pessoal.
const root = fileURLToPath(new URL("../", import.meta.url));
const source = path.join(root, ".local", "hermes-src");
const base =
  process.platform === "win32"
    ? process.env.LOCALAPPDATA
    : path.join(root, ".local");
const profile = path.join(
  base,
  process.platform === "win32" ? "InTEAgir-Hermes-Profile" : "hermes-profile",
);
const tools = path.join(
  base,
  process.platform === "win32" ? "InTEAgir-Hermes-Runtime" : "hermes-tools",
);
// Herdar somente configuração de máquina/rede; nunca chaves/tokens de outros
// provedores ou overrides de login de CLIs presentes no processo pai.
const machineSetting =
  /^(PATH|PATHEXT|SYSTEMROOT|WINDIR|COMSPEC|TEMP|TMP|USERPROFILE|LOCALAPPDATA|APPDATA|HOME|HOMEDRIVE|HOMEPATH|USERNAME|USERDOMAIN|PROGRAMFILES(?:\(X86\))?|PROGRAMDATA|COMMONPROGRAMFILES(?:\(X86\))?|PROCESSOR_.*|NUMBER_OF_PROCESSORS|HTTP_PROXY|HTTPS_PROXY|NO_PROXY|SSL_CERT_FILE|SSL_CERT_DIR|REQUESTS_CA_BUNDLE|CURL_CA_BUNDLE|LANG|LC_.*)$/i;
const env = Object.fromEntries(
  Object.keys(process.env)
    .filter((key) => machineSetting.test(key))
    .map((key) => [key, process.env[key]]),
);
Object.assign(env, {
  HERMES_HOME: profile,
  HERMES_RUNTIME_DIR: tools,
  PYTHONUTF8: "1",
  PYTHONUNBUFFERED: "1",
  PYTHONDONTWRITEBYTECODE: "1",
});
const pin = JSON.parse(
  readFileSync(path.join(source, "pm", "lock.json"), "utf8"),
).packages.python.version;
const target =
  process.platform === "win32"
    ? `win32-${process.arch}`
    : `${process.platform}-${process.arch}`;
const bootstrap = path.join(
  tools,
  `python-${pin}-${target}`,
  process.platform === "win32" ? "python.exe" : "bin/python3",
);
if (!process.env.INTEAGIR_HERMES_PYTHON && !existsSync(bootstrap))
  throw new Error("Runtime dedicado não preparado. Consulte docs/IA_LOCAL.md.");
const selected = process.env.INTEAGIR_HERMES_PYTHON
  ? { status: 0, stdout: process.env.INTEAGIR_HERMES_PYTHON }
  : spawnSync(
  bootstrap,
  [
    "-c",
    "from pathlib import Path; from pm.environments import project_python; print(project_python(Path.cwd()))",
  ],
  { cwd: source, env, encoding: "utf8", windowsHide: true },
);
if (selected.status !== 0)
  throw new Error("Não foi possível localizar o ambiente Hermes dedicado.");
const python = selected.stdout.trim();
if (!python || !existsSync(python))
  throw new Error("Dependências Hermes ainda não preparadas.");
const args = process.argv.slice(2);
const invocation =
  args[0] === "image-backend"
    ? [
        "-u",
        path.join(root, "server", "services", "hermes-codex-image.py"),
        process.execPath,
      ]
    : ["-u", "hermes", ...(args.length ? args : ["--version"])];
const child = spawn(python, invocation, {
  cwd: source,
  env,
  stdio: "inherit",
  windowsHide: true,
});
child.on("error", () => {
  console.error("Não foi possível iniciar o Hermes dedicado.");
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
