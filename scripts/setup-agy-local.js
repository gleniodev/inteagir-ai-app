import path from "node:path";
import { mkdir, writeFile, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";

if (process.platform !== "win32")
  throw new Error("Preparador local destinado ao Windows.");
const profile = path.join(process.env.LOCALAPPDATA, "InTEAgir-Agy-Profile");
const settings = path.join(profile, ".gemini/antigravity-cli/settings.json");
try {
  await access(settings);
  throw new Error("Perfil já preparado; preserve sua configuração.");
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
await mkdir(path.dirname(settings), { recursive: true });
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
  { stdio: "ignore", windowsHide: true },
);
await writeFile(
  settings,
  JSON.stringify(
    {
      useG1Credits: false,
      enableTelemetry: false,
      toolPermission: "request-review",
      allowNonWorkspaceAccess: false,
      enableTerminalSandbox: true,
      permissions: {
        deny: [
          "command(*)",
          "unsandboxed(*)",
          "read_url(*)",
          "execute_url(*)",
          "mcp(*)",
        ],
      },
    },
    null,
    2,
  ),
  { flag: "wx" },
);
console.log(
  "Perfil dedicado preparado; sem login, importação de credenciais ou alteração do perfil pessoal.",
);
