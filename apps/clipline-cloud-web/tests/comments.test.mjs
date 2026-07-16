import test from "node:test";
import assert from "node:assert/strict";
import { commentTree, postComment } from "../src/components/Comments.js";

test("commentTree collects parentless comments as roots", () => {
  const comments = [
    { id: "a", parent_comment_id: null },
    { id: "b", parent_comment_id: null },
  ];
  const tree = commentTree(comments);
  assert.deepEqual(tree.roots.map((c) => c.id), ["a", "b"]);
  assert.equal(tree.count, 2);
  assert.equal(tree.repliesByParent.size, 0);
});

test("commentTree buckets replies under their parent and counts them", () => {
  const comments = [
    { id: "a", parent_comment_id: null },
    { id: "b", parent_comment_id: "a" },
    { id: "c", parent_comment_id: "a" },
  ];
  const tree = commentTree(comments);
  assert.deepEqual(tree.roots.map((c) => c.id), ["a"]);
  assert.deepEqual(tree.repliesByParent.get("a").map((c) => c.id), ["b", "c"]);
  assert.equal(tree.count, 3);
});

test("commentTree drops a reply whose parent_comment_id doesn't resolve to a known comment", () => {
  const comments = [{ id: "b", parent_comment_id: "missing" }];
  const tree = commentTree(comments);
  assert.deepEqual(tree.roots, []);
  assert.equal(tree.repliesByParent.size, 0);
  assert.equal(tree.count, 0);
});

test("commentTree treats an empty-string parent_comment_id as a root", () => {
  const tree = commentTree([{ id: "a", parent_comment_id: "" }]);
  assert.deepEqual(tree.roots.map((c) => c.id), ["a"]);
  assert.equal(tree.count, 1);
});

test("commentTree returns an empty tree for no comments", () => {
  const tree = commentTree([]);
  assert.deepEqual(tree, { roots: [], repliesByParent: new Map(), count: 0 });
});

test("postComment returns true, reloads, and trims successful comment posts", async () => {
  let request;
  let reloaded = 0;
  const ok = await postComment({
    shareId: "share/1",
    body: "  nice clip  ",
    apiClient: async (path, init) => {
      request = { path, init };
    },
    onReload: () => reloaded++,
    onError: () => assert.fail("unexpected error toast"),
  });
  assert.equal(ok, true);
  assert.equal(request.path, "/api/v1/public/clips/share%2F1/comments");
  assert.deepEqual(request.init, { method: "POST", body: { body: "nice clip" } });
  assert.equal(reloaded, 1);
});

test("postComment returns false and does not reload when the post fails", async () => {
  let reloaded = 0;
  const errors = [];
  const ok = await postComment({
    shareId: "share",
    body: "keep this draft",
    parentCommentId: "parent",
    apiClient: async () => {
      throw new Error("network down");
    },
    onReload: () => reloaded++,
    onError: (message) => errors.push(message),
  });
  assert.equal(ok, false);
  assert.equal(reloaded, 0);
  assert.deepEqual(errors, ["network down"]);
});
