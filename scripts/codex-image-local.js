import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawn, execFileSync } from "node:child_process";

// Cliente oficial em perfil exclusivo. Não importa OAuth do Codex pessoal/Hermes.
// Este lançador só prepara/autentica; ainda não é um adaptador de geração.
const root = fileURLToPath(new URL("../", import.meta.url));
export const profile =
  process.platform === "win32"
    ? path.join(process.env.LOCALAPPDATA, "InTEAgir-Codex-Image-Profile")
    : path.join(root, ".local", "codex-image-profile");
export const config = `forced_login_method = "chatgpt"
cli_auth_credentials_store = "file"
sandbox_mode = "read-only"
approval_policy = "on-request"
web_search = "disabled"

[features]
image_generation = true
shell_tool = false
view_image = false
multi_agent = false
apps = false
plugins = false
skill_mcp_dependency_install = false

[analytics]
enabled = false

[feedback]
enabled = false

[history]
persistence = "none"
`;

async function main() {
  const action = process.argv[2] ?? "status";
  if (!["prepare", "status", "login"].includes(action))
    throw new Error(
      "Use prepare, status ou login. Nenhuma inferência é iniciada por este lançador.",
    );
  const filename = path.join(profile, "config.toml");
  let current;
  try {
    current = await readFile(filename, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
  if (current === undefined) {
    await mkdir(profile, { recursive: true, mode: 0o700 });
    if (process.platform === "win32") {
      const identity = execFileSync("whoami.exe", {
        encoding: "utf8",
        windowsHide: true,
      }).trim();
      execFileSync(
        "icacls.exe",
        [
          profile,
          "/inheritance:r",
          "/grant:r",
          `${identity}:(OI)(CI)F`,
          "*S-1-5-18:(OI)(CI)F",
          "*S-1-5-32-544:(OI)(CI)F",
        ],
        { windowsHide: true, stdio: "ignore" },
      );
    }
    await writeFile(filename, config, { flag: "wx", mode: 0o600 });
  } else if (current === config.replace("view_image = false\n", "")) {
    // Migração somente do perfil exato criado por este lançador. OAuth intacto.
    await writeFile(filename, config, { mode: 0o600 });
  } else if (current !== config) {
    throw new Error(
      "Perfil de imagem existente diverge da configuração restrita. Preservado para revisão.",
    );
  }
  if (action === "prepare") {
    console.log(
      "Perfil de imagem preparado para OAuth ChatGPT; nenhum login ou geração iniciado.",
    );
    return;
  }
  const env = codexEnvironment();
  const executable = process.platform === "win32" ? "codex.exe" : "codex";
  const args =
    action === "login" ? ["login", "--device-auth"] : ["login", "status"];
  // O próprio Codex gerencia tokens. Apenas o login interativo mostra código
  // temporário ao usuário; nunca gravá-lo em memória/evidências do projeto.
  const child = spawn(executable, args, {
    env,
    cwd: profile,
    windowsHide: true,
    stdio: "inherit",
  });
  child.on("error", () => {
    console.error(
      "Cliente oficial Codex indisponível; nenhuma credencial importada.",
    );
    process.exitCode = 1;
  });
  child.on("exit", (code) => {
    process.exitCode = code ?? 1;
  });
}

export function codexEnvironment() {
  const machine =
    /^(PATH|PATHEXT|SYSTEMROOT|WINDIR|COMSPEC|TEMP|TMP|LOCALAPPDATA|APPDATA|USERPROFILE|HOME|HOMEDRIVE|HOMEPATH|USERNAME|USERDOMAIN|PROGRAMFILES.*|PROGRAMDATA|COMMONPROGRAMFILES.*|HTTP_PROXY|HTTPS_PROXY|NO_PROXY|SSL_CERT_FILE|SSL_CERT_DIR)$/i;
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => machine.test(name)),
  );
  env.CODEX_HOME = profile;
  return env;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  main().catch((error) => {
    console.error(
      error.message?.startsWith("Use ") ||
        error.message?.startsWith("Perfil de imagem existente")
        ? error.message
        : "Não foi possível preparar o perfil exclusivo de imagem. Configurações existentes preservadas.",
    );
    process.exitCode = 1;
  });
