import { build } from "esbuild";
import { cp, mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "src");
const dist = process.env.DIST_DIR ? join(root, process.env.DIST_DIR) : join(root, "dist");

await rm(dist, { force: true, recursive: true });
await mkdir(dist, { recursive: true });

const assets = (await readdir(src, { withFileTypes: true })).filter(
  (entry) => entry.name === "fonts" || (!entry.isDirectory() && !entry.name.endsWith(".js"))
);
await Promise.all(
  assets.map((asset) => cp(join(src, asset.name), join(dist, asset.name), { recursive: true }))
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
