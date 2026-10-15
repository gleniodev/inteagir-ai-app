import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { once } from "node:events";
import { createApp } from "../server/app.js";

test("T15: proxy HTTPS aceita origem própria, cookie Secure e recusa outra origem", async (t) => {
  const dir = await mkdtemp(path.join(tmpdir(), "inteagir-proxy-"));
  const { app } = await createApp({
    dataDir: path.join(dir, "data"),
    uploadsDir: path.join(dir, "uploads"),
    mediaDir: path.join(dir, "media"),
    trustProxy: true,
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(async () => {
    await new Promise((r) => server.close(r));
    await rm(dir, { recursive: true, force: true });
  });
  const url = `http://127.0.0.1:${server.address().port}/api/demo/sessao`;
  const headers = {
    "Content-Type": "application/json",
    "X-Forwarded-Proto": "https",
    Origin: `https://127.0.0.1:${server.address().port}`,
  };
  const r = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ papel: "professor" }),
  });
  assert.equal(r.status, 200);
  assert.match(r.headers.get("set-cookie"), /; Secure/);
  const denied = await fetch(url, {
    method: "POST",
    headers: { ...headers, Origin: "https://example.org" },
    body: JSON.stringify({ papel: "professor" }),
  });
  assert.equal(denied.status, 403);
  const invalid = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ papel: "admin" }),
  });
  assert.equal(invalid.status, 400);
});
