import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/ui.css", import.meta.url), "utf8");

test("top-bar avatar wrapper and button use explicit centered flex boxes", () => {
  assert.match(css, /\.ui \.avatar-wrap \{[^}]*display: flex;[^}]*align-items: center;/s);
  assert.match(
    css,
    /\.ui \.avatar-btn \{[^}]*display: inline-flex;[^}]*align-items: center;[^}]*justify-content: center;[^}]*width: 28px;[^}]*height: 28px;/s
  );
});

test("watch author row aligns identity and can wrap", () => {
  assert.match(
    css,
    /\.ui \.watch-author-row \{[^}]*display: flex;[^}]*align-items: center;[^}]*flex-wrap: wrap;/s
  );
  assert.match(css, /\.ui \.watch-author-link \{[^}]*display: inline-flex;[^}]*align-items: center;/s);
});

test("theater mode spaces the complete watch heading as one unit", () => {
  assert.match(css, /\.clipline-theater \.ui \.watch-heading \{[^}]*margin-top: 18px;/s);
  assert.doesNotMatch(css, /\.clipline-theater \.ui \.watch-titlerow \{/s);
});
