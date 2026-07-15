import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const cwd = process.cwd();
const output = path.join(cwd, "gh-pages");
fs.rmSync(output, { recursive: true, force: true });
fs.cpSync(path.join(cwd, "dist", "client"), output, { recursive: true });

const cli = path.join(cwd, "node_modules", "vinext", "dist", "cli.js");
const server = spawn(process.execPath, [cli, "start"], { cwd, env: { ...process.env, PORT: "4177" }, stdio: "ignore" });
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let html = "";
try {
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:4177/");
      if (response.ok) { html = await response.text(); break; }
    } catch {}
    await wait(250);
  }
  if (!html) throw new Error("Could not render the home page for static export.");
} finally {
  server.kill();
}

html = html
  .replaceAll('"/assets/', '"./assets/')
  .replaceAll('"/favicon.svg"', '"./favicon.svg"')
  .replace("<head>", "<head><base href=\"./\">");
fs.writeFileSync(path.join(output, "index.html"), html);
fs.writeFileSync(path.join(output, ".nojekyll"), "");
console.log(`Static GitHub Pages export: ${output}`);
