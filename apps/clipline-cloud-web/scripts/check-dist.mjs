import { readdir, readFile } from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const src = join(root, "src");
const dist = join(root, "dist");

const [srcFiles, distFiles] = await Promise.all([listFiles(src), listFiles(dist)]);
const srcSet = new Set(srcFiles);
const distSet = new Set(distFiles);

const missing = srcFiles.filter((file) => !distSet.has(file));
const extra = distFiles.filter((file) => !srcSet.has(file));
if (missing.length || extra.length) {
  report("dist file list does not match src", { missing, extra });
}

const changed = [];
for (const file of srcFiles) {
  const [srcBytes, distBytes] = await Promise.all([
    readFile(join(src, file)),
    readFile(join(dist, file)),
  ]);
  if (!srcBytes.equals(distBytes)) {
    changed.push(file);
  }
}

if (changed.length) {
  report("dist files are stale", { changed });
}

async function listFiles(rootDir, currentDir = rootDir) {
  const entries = await readdir(currentDir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(currentDir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(rootDir, path)));
    } else if (entry.isFile()) {
      files.push(relative(rootDir, path));
    }
  }
  return files.sort();
}

function report(message, details) {
  console.error(message);
  for (const [label, files] of Object.entries(details)) {
    if (files.length) {
      console.error(`${label}:`);
      for (const file of files) {
        console.error(`  ${file}`);
      }
    }
  }
  process.exit(1);
}
