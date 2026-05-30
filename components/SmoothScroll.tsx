"use client";

/**
 * SmoothScroll — wires Lenis (inertia scroll) together with GSAP's
 * ScrollTrigger so both "see" the same scroll position.
 *
 * Why it's here:
 *   - Lenis replaces native scroll with a smoothed, lerp'd version — this is
 *     what gives the site its "liquid" feel.
 *   - GSAP animations tied to scroll (card reveals, later: shader uniforms)
 *     must be told to update from Lenis, not the native scroll event.
 */

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { scrollState } from "@/lib/scrollState";

export default function SmoothScroll() {
  useEffect(() => {
    // Honor user accessibility preference — skip smoothing for users who
    // asked for reduced motion.
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2, // seconds for scroll to settle — higher = more "water"
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    // Each Lenis tick: update ScrollTrigger, and publish velocity/progress
    // to the module-level scrollState that the WebGL effects read.
    lenis.on("scroll", (e: { velocity: number; progress: number }) => {
      ScrollTrigger.update();
      scrollState.velocity = e.velocity;
      scrollState.progress = e.progress;
    });

    // Drive Lenis off GSAP's single requestAnimationFrame loop so we
    // don't run two independent RAF schedules.
    const rafUpdate = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(rafUpdate);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafUpdate);
      lenis.destroy();
    };
  }, []);

  return null;
}
