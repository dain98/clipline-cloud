import { state } from "/js/state.js";
import { refreshSession } from "/js/api.js";
import { flash, copyText } from "/js/util.js";
import { renderLogin } from "/js/views/login.js";
import { renderLibrary } from "/js/views/library.js";
import { renderClipDetail } from "/js/views/watch.js";
import { renderPublicShare } from "/js/views/public.js";
import { renderAdmin } from "/js/views/admin.js";

export async function route() {
  const current = currentRoute();
  if (current.name === "public") {
    await renderPublicShare(current.shareId);
    return;
  }

  if (current.name === "login") {
    if (state.user) {
      navigate("/");
      return;
    }
    renderLogin();
    return;
  }

  if (!state.user) {
    const authenticated = await refreshSession();
    if (!authenticated) {
      navigate("/login");
      return;
    }
  }

  if (current.name === "clip") {
    await renderClipDetail(current.clipId);
  } else if (current.name === "admin") {
    if (state.user.role !== "admin") {
      flash("Admin access is required.", "error");
      navigate("/");
      return;
    }
    await renderAdmin(current.tab);
  } else {
    await renderLibrary();
  }
}

export function currentRoute() {
  const path = window.location.pathname;
  if (path.startsWith("/c/")) {
    return { name: "public", shareId: decodeURIComponent(path.slice(3)) };
  }
  if (path.startsWith("/clip/")) {
    return { name: "clip", clipId: decodeURIComponent(path.slice(6)) };
  }
  if (path === "/admin") {
    return {
      name: "admin",
      tab: new URLSearchParams(window.location.search).get("tab") || "overview",
    };
  }
  if (path === "/login") {
    return { name: "login" };
  }
  return { name: "library" };
}

export function navigate(path) {
  window.history.pushState({}, "", path);
  route();
}

export function onDocumentClick(event) {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) {
    event.preventDefault();
    navigate(routeLink.getAttribute("href"));
    return;
  }

  const copyButton = event.target.closest("[data-copy]");
  if (copyButton) {
    event.preventDefault();
    copyText(copyButton.dataset.copy);
  }
}
