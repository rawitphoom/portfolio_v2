/**
 * pointerState — a tiny global store for the mouse, mirroring scrollState.
 *
 * The WebGL canvas sits behind the page with `pointer-events: none`, so R3F's
 * built-in `state.pointer` never updates. Instead we listen on `window` (once,
 * client-only) and stash normalized device coords here for the scene to read
 * 60x/sec without triggering React renders.
 */

export const pointerState = {
  /** normalized device coords, -1..1 (y up). */
  ndcX: 0,
  ndcY: 0,
  /** 0..1 recent-movement intensity; spikes on move, decays when idle. */
  activity: 0,
  /** false until the pointer first moves, so butterflies don't rush to (0,0). */
  engaged: false,
  /** NDC of the last click + a one-shot flag the scene consumes for a big burst. */
  clickX: 0,
  clickY: 0,
  clickPending: false,
};

if (typeof window !== "undefined") {
  let lastX = 0;
  let lastY = 0;
  let inited = false;

  window.addEventListener(
    "mousemove",
    (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      if (inited) {
        const d = Math.hypot(nx - lastX, ny - lastY);
        pointerState.activity = Math.min(1, pointerState.activity + d * 4);
      }
      lastX = nx;
      lastY = ny;
      inited = true;
      pointerState.ndcX = nx;
      pointerState.ndcY = ny;
      pointerState.engaged = true;
    },
    { passive: true }
  );

  window.addEventListener(
    "pointerdown",
    (e) => {
      pointerState.clickX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerState.clickY = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerState.clickPending = true;
      pointerState.engaged = true;
    },
    { passive: true }
  );
}
