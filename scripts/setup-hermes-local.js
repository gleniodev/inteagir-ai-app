import { access, mkdir, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

// Preparação local explícita: segredo novo da API Hermes, nunca OAuth/Codex.
// Não inicia serviços, não instala dependências e não faz login.
const root = fileURLToPath(new URL("../", import.meta.url));
const profile =
  process.platform === "win32"
    ? path.join(process.env.LOCALAPPDATA, "InTEAgir-Hermes-Profile")
    : path.join(root, ".local", "hermes-profile");
const destinations = [
  path.join(profile, "config.yaml"),
  path.join(profile, ".env"),
  path.join(root, ".env"),
];
for (const filename of destinations) {
  try {
    await access(filename);
  } catch (error) {
    if (error.code === "ENOENT") continue;
    throw error;
  }
  throw new Error(
    "Configuração já existe. Preserve-a; este preparador não sobrescreve arquivos existentes.",
  );
}
await mkdir(profile, { recursive: true });
const identity =
  process.platform === "win32"
    ? execFileSync("whoami.exe", { encoding: "utf8", windowsHide: true }).trim()
    : null;
function restrictAccess(filename, directory = false) {
  if (!identity) return;
  const rights = directory ? "(OI)(CI)F" : "F";
  execFileSync(
    "icacls.exe",
    [
      filename,
      "/inheritance:r",
      "/grant:r",
      `${identity}:${rights}`,
      `*S-1-5-18:${rights}`,
      `*S-1-5-32-544:${rights}`,
    ],
    { stdio: "ignore", windowsHide: true },
  );
}
restrictAccess(profile, true);
const token = randomBytes(32).toString("hex");
await writeFile(
  destinations[0],
  "auth:\n  adopt_external_logins: false\nplatform_toolsets:\n  api_server: []\n  cli: []\nterminal:\n  home_mode: profile\nsecurity:\n  allow_lazy_installs: false\n",
  { flag: "wx", mode: 0o600 },
);
await writeFile(
  destinations[1],
  `API_SERVER_ENABLED=true\nAPI_SERVER_KEY=${token}\n`,
  { flag: "wx", mode: 0o600 },
);
await writeFile(
  destinations[2],
  `INTEAGIR_HERMES_ENABLED=false\nINTEAGIR_HERMES_URL=http://127.0.0.1:8642\nINTEAGIR_HERMES_TOKEN=${token}\nINTEAGIR_HERMES_MODEL=\n`,
  { flag: "wx", mode: 0o600 },
);
restrictAccess(destinations[2]);
console.log(
  "Perfil dedicado e segredo novo da API preparados. Backend permanece desativado até login, modelo e ferramentas serem verificados. Nenhuma credencial foi exibida ou importada.",
);
