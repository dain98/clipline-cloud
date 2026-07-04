import { html } from "../lib/html.js";
import { useEffect, useState } from "preact/hooks";
import { api, ApiError, setCsrfToken } from "../lib/api.js";
import { session, toast, useStore } from "../lib/store.js";
import { navigate } from "../lib/router.js";
import { publicThumbPath } from "../lib/media.js";

// Fixed collage positions for the brand montage (login left panel). Kept as
// a plain data table (no Math.random) so the layout is deterministic and
// unit-testable, and so re-renders never jitter the collage.
export const MONTAGE_SLOTS = [
  { top: "4%", left: "4%", width: "34%", rotate: -7 },
  { top: "0%", left: "44%", width: "30%", rotate: 5 },
  { top: "34%", left: "68%", width: "28%", rotate: -4 },
  { top: "50%", left: "8%", width: "30%", rotate: 6 },
  { top: "62%", left: "42%", width: "26%", rotate: -5 },
  { top: "26%", left: "-4%", width: "22%", rotate: 9 },
];

// Pure: zip up to MONTAGE_SLOTS.length public clips with their fixed collage
// slot. Extracted so the "loose collage" layout derivation is unit-testable
// without a DOM/fetch.
export function montageTiles(clips) {
  if (!Array.isArray(clips)) return [];
  return clips.slice(0, MONTAGE_SLOTS.length).map((clip, i) => ({ clip, ...MONTAGE_SLOTS[i] }));
}

// Pure: derive the montage subline from a /api/v1/public/clips response.
// Counts the loaded page (not a server-reported total, which the endpoint
// doesn't return); appends "+" when has_more indicates there are more than
// what we fetched. Returns null when there's nothing to show (no data yet,
// fetch failed, or the instance has zero public clips) so the caller can
// fall back to the pure gradient with no broken/empty subline.
export function montageCountLabel(data) {
  const clips = data?.clips;
  if (!Array.isArray(clips) || clips.length === 0) return null;
  const n = clips.length;
  const suffix = data.has_more ? "+" : "";
  return `${n}${suffix} clip${n === 1 ? "" : "s"} on this instance`;
}

function tileStyle({ top, left, width, rotate }) {
  return `top:${top};left:${left};width:${width};transform:rotate(${rotate}deg);`;
}

function nullableString(value) {
  const text = String(value || "").trim();
  return text ? text : null;
}

function BrandMontage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let live = true;
    api(`/api/v1/public/clips?page_size=${MONTAGE_SLOTS.length}`)
      .then((d) => live && setData(d))
      .catch(() => live && setData(null));
    return () => {
      live = false;
    };
  }, []);

  const tiles = montageTiles(data?.clips);
  const label = montageCountLabel(data);

  return html`<aside class="login-montage" aria-hidden="true">
    ${tiles.length > 0 && html`<div class="login-montage-tiles">
      ${tiles.map((t, i) => html`<img key=${i} class="login-montage-tile" style=${tileStyle(t)}
        src=${publicThumbPath(t.clip)} alt="" loading="lazy" />`)}
    </div>`}
    <div class="login-montage-copy">
      <h2>Your clips. Your server.</h2>
      ${label && html`<p>${label}</p>`}
    </div>
  </aside>`;
}

function AuthShell({ titleId, children }) {
  return html`<div class="login-page">
    <${BrandMontage} />
    <section class="login-panel" aria-labelledby=${titleId}>
      <div class="login-brand" aria-hidden="true">
        <img src="/clipline-icon.svg" alt="" width="32" height="32" />
        <span class="login-brand-word">CLIP<b>LINE</b></span>
        <span class="login-brand-descriptor">CLOUD</span>
      </div>
      ${children}
    </section>
  </div>`;
}

export function LoginPage() {
  const { user } = useStore(session);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  // Legacy route() bounces an already-signed-in visitor straight to /library
  // (src/app.js:138-145) instead of rendering the login form.
  useEffect(() => {
    if (user) navigate("/library");
  }, [user]);

  if (user) return null;

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/v1/auth/login", {
        method: "POST",
        body: { username, password },
      });
      setCsrfToken(data.csrf_token);
      session.set({ user: data.user, csrfToken: data.csrf_token, ready: true });
      navigate("/library");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign in failed");
      setBusy(false);
    }
  }

  return html`<${AuthShell} titleId="login-title">
    <h1 id="login-title">Sign in</h1>
    ${error && html`<p class="form-error" role="alert">${error}</p>`}
    <form class="login-form" onSubmit=${onSubmit}>
      <label class="login-field">
        <span>Username</span>
        <input class="input" name="username" autocomplete="username" required
          value=${username} onInput=${(e) => setUsername(e.target.value)} />
      </label>
      <label class="login-field">
        <span>Password</span>
        <input class="input" name="password" type="password" autocomplete="current-password" required
          value=${password} onInput=${(e) => setPassword(e.target.value)} />
      </label>
      <button class="btn btn-primary" type="submit" disabled=${busy}>${busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p class="login-hint">Accounts are created by this server's admin.</p>
  </${AuthShell}>`;
}

// Port of legacy renderResetPassword (src/app.js:389-456) + the invite
// preflight in renderInviteResetPassword (:457-490), onto the same split
// shell. route.invite === true means the token in the URL is an invite
// token that must first be redeemed via /api/v1/invites/claim to obtain the
// actual reset_token before the set-password form can be shown.
export function ResetPasswordPage({ route }) {
  const isInviteRoute = Boolean(route.invite);
  const [phase, setPhase] = useState(() => {
    if (isInviteRoute) return "preflight";
    return route.token ? "form" : "missing-token";
  });
  const [preflightError, setPreflightError] = useState("");
  const [resolvedToken, setResolvedToken] = useState(isInviteRoute ? null : route.token);
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const isInvite = isInviteRoute;

  useEffect(() => {
    if (!isInviteRoute) return;
    if (!route.token) {
      setPhase("missing-token");
      return;
    }
    let live = true;
    setPhase("preflight");
    api("/api/v1/invites/claim", { method: "POST", body: { invite_token: route.token } })
      .then((data) => {
        if (!live) return;
        setResolvedToken(data.reset_token);
        setPhase("form");
      })
      .catch((err) => {
        if (!live) return;
        setPreflightError(err instanceof ApiError ? err.message : "This invite link is invalid, used, or expired.");
        setPhase("invalid");
      });
    return () => {
      live = false;
    };
  }, [isInviteRoute, route.token]);

  async function onSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFormError("");
    const form = new FormData(event.currentTarget);
    const body = {
      reset_token: resolvedToken,
      new_password: String(form.get("new_password") || ""),
    };
    if (isInvite) {
      body.username = String(form.get("username") || "");
      body.display_name = nullableString(form.get("display_name"));
      body.email = nullableString(form.get("email"));
    }
    try {
      await api("/api/v1/auth/reset-password", { method: "POST", body });
      toast(isInvite ? "Account created. Sign in with your new password." : "Password set. Sign in with your new password.");
      navigate("/login");
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Request failed");
      setBusy(false);
    }
  }

  // Invite preflight not yet resolved: mirror legacy renderInviteLinkStatus
  // (src/app.js:477-489) — a distinct "Create Account" status screen with no
  // form and no sign-in link.
  if (isInviteRoute && phase !== "form") {
    const isError = phase === "missing-token" || phase === "invalid";
    const message = phase === "missing-token"
      ? "This invite link is missing a token."
      : phase === "invalid"
      ? preflightError
      : "Opening invite…";
    return html`<${AuthShell} titleId="invite-title">
      <h1 id="invite-title">Create account</h1>
      <p class="login-copy">${isError ? "This invite cannot be used." : "Preparing your account setup."}</p>
      ${isError
        ? html`<p class="form-error" role="alert">${message}</p>`
        : html`<p class="login-status">${message}</p>`}
    </${AuthShell}>`;
  }

  const title = isInvite ? "Create account" : "Set password";
  const copy = isInvite
    ? "Choose your Clipline Cloud account details."
    : "Choose a new password for your Clipline Cloud account.";

  return html`<${AuthShell} titleId="reset-title">
    <h1 id="reset-title">${title}</h1>
    <p class="login-copy">${copy}</p>
    ${phase === "missing-token"
      ? html`<p class="form-error" role="alert">This reset link is missing a token.</p>`
      : html`
        ${formError && html`<p class="form-error" role="alert">${formError}</p>`}
        <form class="login-form" onSubmit=${onSubmit}>
          ${isInvite && html`
            <label class="login-field">
              <span>Username</span>
              <input class="input" name="username" autocomplete="username" required />
            </label>
            <label class="login-field">
              <span>Display name</span>
              <input class="input" name="display_name" autocomplete="name" />
            </label>
            <label class="login-field">
              <span>Email</span>
              <input class="input" name="email" type="email" autocomplete="email" />
            </label>
          `}
          <label class="login-field">
            <span>New password</span>
            <input class="input" name="new_password" type="password" autocomplete="new-password" minlength="8" required />
          </label>
          <button class="btn btn-primary" type="submit" disabled=${busy}>
            ${isInvite ? "Create account" : "Set password"}
          </button>
        </form>
      `}
    ${!isInvite && html`<a class="btn" href="/login">Sign in</a>`}
  </${AuthShell}>`;
}
