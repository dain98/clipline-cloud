import { route, onDocumentClick } from "/js/router.js";

window.addEventListener("popstate", route);
document.addEventListener("click", onDocumentClick);

route();
