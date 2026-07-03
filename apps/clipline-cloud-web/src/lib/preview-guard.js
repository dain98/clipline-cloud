// Single-active-preview module guard: claim() calls previous teardown,
// release() only clears if the caller owns the slot (identity-guarded).
let activeTeardown = null;

export function claim(teardown) {
  activeTeardown?.();
  activeTeardown = teardown;
}

export function release(teardown) {
  if (activeTeardown === teardown) {
    activeTeardown = null;
  }
}

export function _reset() {
  activeTeardown = null;
}
