import { build } from "esbuild";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "src");
const dist = process.env.DIST_DIR ? join(root, process.env.DIST_DIR) : join(root, "dist");

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });

const entryPointNames = new Set(["main.js"]);
const entries = [];
for (const entry of await readdir(src, { withFileTypes: true })) {
  const path = join(src, entry.name);
  if (entry.isDirectory()) {
    // components/, pages/, lib/ are reached via imports; fonts/ is a static asset
    if (entry.name === "fonts") await cp(path, join(dist, "fonts"), { recursive: true });
    continue;
  }
  if (extname(entry.name) === ".js" && entryPointNames.has(entry.name)) entries.push(path);
  else if (extname(entry.name) !== ".js") await cp(path, join(dist, entry.name));
}

await build({
  entryPoints: entries,
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: true,
  sourcemap: false,
  legalComments: "none",
  outdir: dist,
});
