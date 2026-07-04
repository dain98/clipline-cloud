import test from "node:test";
import assert from "node:assert/strict";
import { BulkBar } from "../src/components/BulkBar.js";

function buttons(vnode) {
  return vnode.props.children.filter((child) => child?.type === "button");
}

test("BulkBar disables bulk actions while a visibility update is pending", () => {
  const vnode = BulkBar({ count: 2, busy: true });
  assert.equal(vnode.props["aria-busy"], "true");
  assert.equal(buttons(vnode).length, 5);
  assert.equal(buttons(vnode).every((button) => button.props.disabled === true), true);
});

test("BulkBar keeps actions enabled when idle", () => {
  const vnode = BulkBar({ count: 2, busy: false });
  assert.equal(vnode.props["aria-busy"], "false");
  assert.equal(buttons(vnode).every((button) => button.props.disabled === false), true);
});
