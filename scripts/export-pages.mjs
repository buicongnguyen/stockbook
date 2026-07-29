import { spawn } from "node:child_process";
import fs from "node:fs";
import net from "node:net";
import path from "node:path";

const cwd = process.cwd();
const output = path.join(cwd, "gh-pages");
fs.rmSync(output, { recursive: true, force: true });
fs.cpSync(path.join(cwd, "dist", "client"), output, { recursive: true });

const cli = path.join(cwd, "node_modules", "vinext", "dist", "cli.js");
const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once("error", reject);
  probe.listen(0, "127.0.0.1", () => {
    const address = probe.address();
    if (!address || typeof address === "string") {
      probe.close();
      reject(new Error("Could not allocate a preview port."));
      return;
    }
    probe.close(() => resolve(address.port));
  });
});
const server = spawn(process.execPath, [cli, "start"], { cwd, env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let serverExitCode;
server.once("exit", code => { serverExitCode = code; });

async function renderRoute(route) {
  for (let attempt = 0; attempt < 40; attempt++) {
    if (serverExitCode !== undefined) throw new Error(`Static render server exited early with code ${serverExitCode}.`);
    try {
      const response = await fetch(`http://127.0.0.1:${port}${route}`);
      if (response.ok) return response.text();
    } catch {}
    await wait(250);
  }
  throw new Error(`Could not render ${route} for static export.`);
}

const pages = [
  { route: "/", destination: "index.html", assetPrefix: "./", lang: "en", title: "Stockbook — Investment Experience" },
  { route: "/en/", destination: "en/index.html", assetPrefix: "../", lang: "en", title: "Stockbook — Investment Experience" },
  { route: "/vi/", destination: "vi/index.html", assetPrefix: "../", lang: "vi", title: "Stockbook — Kinh nghiệm đầu tư" },
];

try {
  for (const page of pages) {
    let html = await renderRoute(page.route);
    if (!html.includes(`<title>${page.title}</title>`)) {
      throw new Error(`Static export validation failed for ${page.route}: localized title is missing.`);
    }

    html = html
      .replaceAll('"/assets/', `"${page.assetPrefix}assets/`)
      .replaceAll('"/favicon.svg"', `"${page.assetPrefix}favicon.svg"`)
      .replace("<head>", `<head><base href="${page.assetPrefix}">`);

    if (page.lang === "vi") {
      html = html.replace('<html lang="en"', '<html lang="vi"');
    }

    const destination = path.join(output, page.destination);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, html);
  }
} finally {
  server.kill();
}

fs.writeFileSync(path.join(output, ".nojekyll"), "");
console.log(`Static GitHub Pages export: ${output}`);
