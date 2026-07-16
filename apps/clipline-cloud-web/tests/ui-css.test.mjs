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

test("game category grids use portrait SteamGridDB proportions", () => {
  assert.match(css, /\.ui \.game-tile \{[^}]*aspect-ratio: 2 \/ 3;/s);
});

test("video art has a deep readability scrim behind watch metadata", () => {
  assert.match(css, /\.ui \.watch-heading\.has-game-art::after \{[^}]*linear-gradient/s);
  assert.match(css, /\.ui \.watch-heading\.has-game-art \.watch-heading-content \{[^}]*text-shadow:/s);
});

test("video art keeps breathing room above without a redundant divider below", () => {
  assert.match(css, /\.ui \.watch-heading\.has-game-art \{[^}]*margin: 14px 0 0;/s);
  assert.match(css, /\.ui \.watch-heading\.has-game-art \{[^}]*min-height: 132px;/s);
  assert.doesNotMatch(css, /\.ui \.watch-actions \{[^}]*border-(?:top|bottom):/s);
});

test("video art keeps rounded corners with a dark edge that masks light fringes", () => {
  assert.match(css, /\.ui \.watch-heading\.has-game-art \{[^}]*border: 1px solid #050912;/s);
  assert.match(css, /\.ui \.watch-heading\.has-game-art \{[^}]*border-radius: 10px;/s);
  assert.match(css, /\.ui \.watch-heading\.has-game-art \{[^}]*background: #050912;/s);
  assert.match(css, /\.ui \.watch-game-art \{[^}]*inset: -1px;/s);
});
