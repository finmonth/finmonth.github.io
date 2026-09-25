import { spawn } from "node:child_process";
import http from "node:http";
import { writeFileSync, copyFileSync } from "node:fs";

console.log("Iniciando servidor para gerar index.html e 404.html estáticos...");

const server = spawn("node", [".output/server/index.mjs"], {
  env: { ...process.env, PORT: "3000", NODE_ENV: "production" },
  stdio: ["ignore", "ignore", "inherit"],
});

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    http
      .get(url, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => resolve({ status: res.statusCode, body }));
      })
      .on("error", reject);
  });
}

// Aguarda 2 segundos para o servidor subir
await new Promise((r) => setTimeout(r, 2000));

try {
  const rootResponse = await fetchUrl("http://localhost:3000/");
  if (rootResponse.status === 200 && rootResponse.body.length > 500) {
    writeFileSync(".output/public/index.html", rootResponse.body, "utf8");
    writeFileSync(".output/public/404.html", rootResponse.body, "utf8");
    console.log("✓ index.html e 404.html gerados com sucesso para GitHub Pages!");
  } else {
    throw new Error(`Falha ao renderizar: status ${rootResponse.status}`);
  }
} catch (err) {
  console.error("Erro ao gerar páginas estáticas:", err);
  process.exitCode = 1;
} finally {
  server.kill();
}
