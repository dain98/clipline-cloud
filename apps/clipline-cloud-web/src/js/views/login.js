import { state } from "/js/state.js";
import { api } from "/js/api.js";
import { escapeHtml, icon } from "/js/util.js";

const app = document.querySelector("#app");

export function renderLogin(error = "") {
  app.innerHTML = `
    <main class="login-shell">
      <section class="login-panel" aria-labelledby="login-title">
        <div class="brand-mark" aria-hidden="true">CL</div>
        <h1 id="login-title">Clipline Cloud</h1>
        <p>Sign in with an account created by this instance's admin.</p>
        ${error ? `<div class="error-box">${escapeHtml(error)}</div>` : ""}
        <form id="login-form" class="section" autocomplete="on">
          <label class="field">
            <span>Username</span>
            <input name="username" autocomplete="username" required>
          </label>
          <label class="field">
            <span>Password</span>
            <input name="password" type="password" autocomplete="current-password" required>
          </label>
          <button class="btn-primary" type="submit">${icon("lock")} Sign in</button>
        </form>
      </section>
    </main>
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
