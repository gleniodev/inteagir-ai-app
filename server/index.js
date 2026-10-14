import { createApp } from "./app.js";

try {
  const { app } = await createApp();
  const port = Number(process.env.PORT ?? 3001);
  const host = process.env.HOST ?? "127.0.0.1";
  app
    .listen(port, host, () =>
      console.log(`InTEAgir.AI — demonstração local em http://${host}:${port}`),
    )
    .on("error", () => {
      console.error(
        "Porta indisponível ou endereço inválido. Verifique a configuração local.",
      );
      process.exitCode = 1;
    });
} catch {
  console.error(
    "Não foi possível iniciar. Verifique dados/backup e permissões locais.",
  );
  process.exitCode = 1;
}
