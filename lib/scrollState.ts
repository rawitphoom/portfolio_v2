/**
 * scrollState — a tiny global read-only-ish store.
 *
 * Why not Zustand / Context?
 *   - The shader reads velocity 60x/sec. Going through React context
 *     would trigger renders we don't want.
 *   - One writer (SmoothScroll / Lenis), many readers (shaders, anim).
 *   - Module singletons are the idiomatic pattern for this in R3F apps.
 */

export const scrollState = {
  /** Lenis reports scroll velocity in CSS px per frame. Decays to 0 when idle. */
  velocity: 0,
  /** 0..1 scroll progress for whole page. Handy later for camera moves. */
  progress: 0,
};
