import { build } from "esbuild";
import { cp, mkdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "src");
const dist = process.env.DIST_DIR ? join(root, process.env.DIST_DIR) : join(root, "dist");

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });

const assets = ["clipline-icon.svg", "fonts", "index.html", "tokens.css", "ui.css"];
await Promise.all(
  assets.map((asset) => cp(join(src, asset), join(dist, asset), { recursive: true }))
);

await build({
  entryPoints: [join(src, "main.js")],
  bundle: true,
  format: "esm",
  target: "es2020",
  minify: true,
  sourcemap: false,
  legalComments: "none",
  outdir: dist,
});
