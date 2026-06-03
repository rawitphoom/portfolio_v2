"use client";

/**
 * GlowCTA — a "rising light over the horizon" contact CTA.
 * The light itself is a procedural WebGL shader (see GlowLight) that animates
 * on its own and brightens as the cursor nears the bottom of the section.
 */

import Link from "next/link";
import Magnetic from "./Magnetic";
import GlowLight from "./GlowLight";

export default function GlowCTA() {
  return (
    <section
      id="contact"
      className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden bg-[var(--color-ink)]"
    >
      <GlowLight />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        <h2 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Let&rsquo;s work together
        </h2>
        <p className="mt-4 max-w-sm text-[var(--color-bone-dim)]">
          Have a project in mind, or just want to say hello?
        </p>
        <Magnetic strength={12}>
          <Link
            href="mailto:rawitphoom1234@gmail.com"
            data-cursor="hover"
            className="group mt-10 inline-flex items-center gap-3 rounded-full border border-white/15 px-9 py-3.5 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
          >
            Get in touch
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </Magnetic>
      </div>
    </section>
  );
}
