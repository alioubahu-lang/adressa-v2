const { execFileSync } = require("node:child_process");
const { join } = require("node:path");

const root = process.cwd();
const prismaCli = join(root, "node_modules", "prisma", "build", "index.js");
const nextCli = join(root, "node_modules", "next", "dist", "bin", "next");

function run(script, args) {
  execFileSync(process.execPath, [script, ...args], { cwd: root, stdio: "inherit" });
}

// Vercel injects VERCEL=1 during Git deployments. Apply additive SQL migrations
// before generating the client/building so runtime code never sees an old schema.
if (process.env.VERCEL === "1") {
  run(prismaCli, ["migrate", "deploy"]);
}

run(prismaCli, ["generate"]);
run(nextCli, ["build"]);
