# Watch author row and avatar alignment — design

**Date:** 2026-07-10
**Status:** approved

## Problem

The signed-in user's avatar in the desktop top bar does not sit on the same
visual centerline as the search field. On the watch page, creator identity is
reduced to a trailing `by <name>` metadata fragment, so the avatar and public
profile are not discoverable.

## Decision

Reuse the existing `UserAvatar` component and `/u/{username}` public profile
route. Add a compact YouTube-style author row directly below the clip title,
then keep game, views, and recording date in a separate metadata line beneath
it. Fix the top-bar alignment in CSS without changing its markup or menu
behavior.

This keeps the change inside the web client. The public clip response already
contains `author_name`, `author_username`, and `author_avatar_url`; the owned
clip route can use the signed-in session user.

## UI behavior

### Top bar

- Make `.avatar-wrap` and `.avatar-btn` explicit centered flex containers.
- Give the button the same fixed 28 by 28 pixel footprint as its avatar and
  remove any inline-image baseline contribution.
- Preserve the current profile menu, keyboard behavior, and mobile layout.

### Watch page

- Keep the title as the first element below the player.
- Add a `.watch-author-row` immediately below the title.
- The identity group contains a 36 pixel `UserAvatar` and the existing author
  display label. When a username is available, the complete identity group is
  a link to `/u/{username}`; otherwise it is rendered as non-linked text with
  the existing initial fallback.
- Show the identity row on both owned and public watch routes so their layouts
  remain consistent.
- Move the game chip, view count, and recording date into the metadata line
  below the author row. Remove the redundant `by <author>` fragment.
- Allow the author row to wrap on narrow viewports without separating the
  avatar from the author label.

## Data flow and fallbacks

Add a small pure author-view-model helper in `pages/watch.js`:

- Owned route: use `session.user` for display name, username, avatar URL, and
  avatar cache key.
- Public route: adapt `clip.author_name`, `clip.author_username`, and
  `clip.author_avatar_url` to the shape accepted by `UserAvatar`.
- Prefer display name, then username, then `Unknown creator` for the label.
- URL-encode the username when building the public profile path.
- Missing usernames disable only the profile link; missing avatars continue
  through the existing initial fallback.

No server contract, database, or routing changes are required.

## Alternatives considered

1. **Reuse the current avatar and route with a local view model (chosen).**
   Smallest change, uses existing API fields, and keeps author normalization
   testable.
2. **Extract a shared author-card component.** This could help future creator
   surfaces but adds an abstraction before a second consumer exists.
3. **Normalize author objects in the server API.** Cleaner across endpoints in
   theory, but it expands a visual change into an unnecessary API migration.

## Verification

- Add unit coverage for owned/public author normalization, encoded profile
  links, and the missing-username fallback.
- Run the complete web test suite.
- Rebuild committed `dist/main.js` and `dist/ui.css`, then run `check:dist`.
- Run formatting and the workspace Rust tests because the repository ships
  the web bundle inside the server image.
- Visually verify desktop top-bar centering and the watch author row at wide
  and narrow viewport widths, including a user with no uploaded avatar.
