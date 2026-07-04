import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api } from "../lib/api.js";
import { session, toast, useStore } from "../lib/store.js";
import { formatRelativeTime } from "../lib/format.js";
import { icon } from "../lib/icons.js";
import { ConfirmDialog } from "./ConfirmDialog.js";

// Ported verbatim from legacy publicCommentTree (src/app.js:2450-2469): group
// flat comments into one level of replies (a reply's own replies collapse
// into the same parent bucket, matching the server's flat parent_comment_id
// model) and count only comments that resolve to a real root or a root's
// direct child.
export function commentTree(comments) {
  const byId = new Map(comments.map((comment) => [comment.id, comment]));
  const repliesByParent = new Map();
  const roots = [];
  let count = 0;
  comments.forEach((comment) => {
    const parentId = comment.parent_comment_id || "";
    if (parentId && byId.has(parentId)) {
      if (!repliesByParent.has(parentId)) repliesByParent.set(parentId, []);
      repliesByParent.get(parentId).push(comment);
      count += 1;
    } else if (!parentId) {
      roots.push(comment);
      count += 1;
    }
  });
  return { roots, repliesByParent, count };
}

export async function postComment({ apiClient = api, shareId, body, parentCommentId, onReload = () => {}, onError = toast }) {
  const trimmed = body.trim();
  if (!trimmed) return false;
  try {
    await apiClient(`/api/v1/public/clips/${encodeURIComponent(shareId)}/comments`, {
      method: "POST",
      body: parentCommentId ? { body: trimmed, parent_comment_id: parentCommentId } : { body: trimmed },
    });
    onReload();
    return true;
  } catch (error) {
    onError(error.message);
    return false;
  }
}

function initials(name) {
  return (name || "?").trim().slice(0, 1).toUpperCase() || "?";
}

// Only trust a same-origin relative avatar path (CSP img-src 'self'); no
// seeded/real data currently sets author_avatar_url, so this is defensive —
// mirrors the relative-path discipline lib/media.js applies to thumbnails.
function avatarNode(comment) {
  const src = comment.author_avatar_url;
  if (typeof src === "string" && src.startsWith("/")) {
    return html`<img class="comment-avatar" src=${src} alt="" />`;
  }
  return html`<div class="comment-avatar">${initials(comment.author_name)}</div>`;
}

// Comments are only reachable through the public share endpoints (there is
// no owned-clip-id-scoped comment route) — the watch page only renders this
// component when a share id is available (see pages/watch.js).
export function Comments({ shareId }) {
  const { user } = useStore(session);
  const [comments, setComments] = useState(null);
  const [draft, setDraft] = useState("");
  const [replyOpenId, setReplyOpenId] = useState(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function reload() {
    api(`/api/v1/public/clips/${encodeURIComponent(shareId)}/comments`)
      .then((data) => setComments(data.comments || []))
      .catch(() => setComments([]));
  }

  useEffect(() => {
    let live = true;
    setComments(null);
    api(`/api/v1/public/clips/${encodeURIComponent(shareId)}/comments`)
      .then((data) => live && setComments(data.comments || []))
      .catch(() => live && setComments([]));
    return () => {
      live = false;
    };
  }, [shareId]);

  async function post(body, parentCommentId) {
    return postComment({ shareId, body, parentCommentId, onReload: reload, onError: toast });
  }

  async function submitComment(event) {
    event.preventDefault();
    if (await post(draft)) setDraft("");
  }

  async function submitReply(event, parentCommentId) {
    event.preventDefault();
    if (await post(replyDraft, parentCommentId)) {
      setReplyDraft("");
      setReplyOpenId(null);
    }
  }

  async function confirmDelete() {
    const commentId = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      await api(`/api/v1/public/clips/${encodeURIComponent(shareId)}/comments/${encodeURIComponent(commentId)}`, {
        method: "DELETE",
      });
      reload();
    } catch (error) {
      toast(error.message);
    }
  }

  const tree = commentTree(comments || []);

  return html`<section class="comments">
    <div class="comments-header"><h2>Comments</h2><span class="muted">${tree.count}</span></div>
    ${user
      ? html`<form class="comment-form" onSubmit=${submitComment}>
          <textarea rows="3" maxlength="2000" placeholder="Add a comment" value=${draft}
            onInput=${(event) => setDraft(event.target.value)}></textarea>
          <div class="comment-form-actions">
            <button type="submit" class="btn btn-primary">${icon("message", { size: 14 })} Post comment</button>
          </div>
        </form>`
      : html`<p class="comment-signin"><a href="/login">Sign in</a> to comment.</p>`}
    ${comments == null
      ? ""
      : tree.count === 0
      ? html`<p class="comment-signin">No comments yet.</p>`
      : html`<div class="comment-list">
          ${tree.roots.map((comment) =>
            renderComment(comment, {
              depth: 0,
              repliesByParent: tree.repliesByParent,
              user,
              replyOpenId,
              setReplyOpenId,
              replyDraft,
              setReplyDraft,
              submitReply,
              onDelete: setConfirmDeleteId,
            })
          )}
        </div>`}
    <${ConfirmDialog} open=${confirmDeleteId != null} title="Delete this comment?"
      body="This removes the comment from the public clip page." confirmLabel="Delete" danger
      onConfirm=${confirmDelete} onCancel=${() => setConfirmDeleteId(null)} />
  </section>`;
}

function renderComment(comment, ctx) {
  const { depth, repliesByParent, user, replyOpenId, setReplyOpenId, replyDraft, setReplyDraft, submitReply, onDelete } = ctx;
  const replies = repliesByParent.get(comment.id) || [];
  return html`<article class="comment" key=${comment.id}>
    ${avatarNode(comment)}
    <div class="comment-body">
      <div class="comment-head">
        ${comment.author_username
          ? html`<a href=${`/u/${encodeURIComponent(comment.author_username)}`}>${comment.author_name}</a>`
          : html`<strong>${comment.author_name}</strong>`}
        ${comment.is_uploader && html`<span class="comment-badge">Uploader</span>`}
        <span>${formatRelativeTime(comment.created_at)}</span>
        <div class="comment-actions">
          ${user && depth === 0 && html`<button type="button" class="comment-action"
            onClick=${() => setReplyOpenId(replyOpenId === comment.id ? null : comment.id)}>
            ${icon("message", { size: 12 })} Reply</button>`}
          ${comment.viewer_can_delete && html`<button type="button" class="comment-delete" aria-label="Delete comment"
            title="Delete comment" onClick=${() => onDelete(comment.id)}>${icon("trash", { size: 12 })}</button>`}
        </div>
      </div>
      <p class="comment-text">${comment.body}</p>
      ${user && depth === 0 && replyOpenId === comment.id && html`<form class="comment-reply-form"
        onSubmit=${(event) => submitReply(event, comment.id)}>
        <textarea rows="2" maxlength="2000" placeholder="Write a reply" value=${replyDraft}
          onInput=${(event) => setReplyDraft(event.target.value)}></textarea>
        <div class="comment-form-actions">
          <button type="submit" class="btn btn-primary">${icon("message", { size: 14 })} Post reply</button>
        </div>
      </form>`}
      ${replies.length > 0 && html`<div class="comment-replies">
        ${replies.map((reply) => renderComment(reply, { ...ctx, depth: depth + 1 }))}
      </div>`}
    </div>
  </article>`;
}
