export const state = {
  user: null,
  csrfToken: null,
  flash: null,
  libraryQuery: {
    sort: "uploaded_at_desc",
    game: "",
    visibility: "",
    status: "",
    q: "",
    from: "",
    to: "",
  },
  adminResetToken: null,
  ui: {
    railOpen: true,
  },
};
