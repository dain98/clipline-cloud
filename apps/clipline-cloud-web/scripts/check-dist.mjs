import { execFileSync } from "node:child_process";
import { readdir, readFile, rm } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");
const check = join(root, ".dist-check");

execFileSync(process.execPath, [join(root, "scripts/build.mjs")], {
  env: { ...process.env, DIST_DIR: ".dist-check" },
  stdio: "inherit",
});

const [distFiles, checkFiles] = await Promise.all([listFiles(dist), listFiles(check)]);
const distSet = new Set(distFiles);
const checkSet = new Set(checkFiles);
const missing = checkFiles.filter((f) => !distSet.has(f));
const extra = distFiles.filter((f) => !checkSet.has(f));
const changed = [];
for (const file of checkFiles) {
  if (!distSet.has(file)) continue;
  const [a, b] = await Promise.all([readFile(join(dist, file)), readFile(join(check, file))]);
  if (!a.equals(b)) changed.push(file);
}
await rm(check, { force: true, recursive: true });
if (missing.length || extra.length || changed.length) {
  console.error("dist is stale — run: npm run build --prefix apps/clipline-cloud-web");
  for (const [label, files] of Object.entries({ missing, extra, changed })) {
    if (files.length) console.error(`${label}:\n  ${files.join("\n  ")}`);
  }
  process.exit(1);
}

async function listFiles(rootDir, currentDir = rootDir) {
  const files = [];
  for (const entry of await readdir(currentDir, { withFileTypes: true })) {
    const path = join(currentDir, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(rootDir, path)));
    else files.push(relative(rootDir, path));
  }
  return files.sort();
}
