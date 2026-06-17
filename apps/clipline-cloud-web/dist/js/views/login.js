import { state } from "/js/state.js";
import { api } from "/js/api.js";
import { escapeHtml, icon } from "/js/util.js";

const app = document.querySelector("#app");

export function renderLogin(error = "") {
  app.innerHTML = `
    <div class="auth-shell">
      <div class="auth-card" role="main" aria-labelledby="login-title">
        <div style="display:flex;align-items:center;gap:.625rem;margin-bottom:1.25rem">
          <span class="account-avatar" aria-hidden="true" style="width:36px;height:36px;font-size:.9rem">CL</span>
          <span class="wordmark">Clipline Cloud</span>
        </div>
        <h1 id="login-title" style="margin:0 0 .25rem;font-size:1.25rem;font-weight:700;color:var(--text)">Sign in</h1>
        <p style="margin:0 0 1.25rem;font-size:.875rem;color:var(--text-muted)">Sign in with an account created by this instance's admin.</p>
        ${error ? `<div role="alert" style="background:var(--danger-soft);border:1px solid rgba(229,72,77,.3);border-radius:var(--radius-btn);padding:.5rem .75rem;font-size:.875rem;color:var(--danger);margin-bottom:1rem">${escapeHtml(error)}</div>` : ""}
        <form id="login-form" autocomplete="on" style="display:grid;gap:.75rem">
          <label class="field">
            <span>Username</span>
            <input name="username" autocomplete="username" required>
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" required>
          </label>
          <button class="btn btn-primary" type="submit" style="width:100%;margin-top:.25rem">${icon("lock")} Sign in</button>
        </form>
      </div>
    </div>
  `;
  document.querySelector("#login-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try {
      const data = await api("/api/v1/auth/login", {
        method: "POST",
        body: {
          username: String(form.get("username") || ""),
          password: String(form.get("password") || ""),
        },
      });
      state.user = data.user;
      state.csrfToken = data.csrf_token;
      const { navigate } = await import("/js/router.js");
      navigate("/");
    } catch (loginError) {
      renderLogin(loginError.message);
    }
  });
}
