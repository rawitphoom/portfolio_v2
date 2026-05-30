"use client";

/**
 * Cursor — custom dot + trailing ring.
 *
 * Two elements:
 *   - inner dot: follows cursor 1:1 (snappy)
 *   - outer ring: lerps toward the dot position each frame (laggy / soft)
 *
 * Grows when hovering anything with `data-cursor="hover"` (add that
 * attribute to cards, pills, etc.).
 */

import { useEffect, useRef } from "react";

export default function Cursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Skip on touch devices — a custom cursor is pointer-only.
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch) return;

    const dot = dotRef.current!;
    const ring = ringRef.current!;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
    };

    // Grow ring when hovering elements opted-in via data-cursor="hover"
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('[data-cursor="hover"]')) {
        ring.dataset.state = "hover";
      } else {
        ring.dataset.state = "idle";
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onOver);

    let raf = 0;
    const tick = () => {
      // Lerp the ring toward the mouse — the gap between dot and ring
      // creates the "trailing" feel.
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] w-1.5 h-1.5 rounded-full bg-[var(--color-bone)] mix-blend-difference"
      />
      <div
        ref={ringRef}
        data-state="idle"
        aria-hidden
        className="pointer-events-none fixed top-0 left-0 z-[100] w-9 h-9 rounded-full border border-[var(--color-bone)] mix-blend-difference transition-[width,height,opacity] duration-200 data-[state=hover]:w-16 data-[state=hover]:h-16 data-[state=hover]:opacity-60"
      />
    </>
  );
}
