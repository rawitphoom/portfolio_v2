"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import Magnetic from "@/components/Magnetic";
import Reveal from "@/components/Reveal";

// WebGL backdrop — browser only, so it never runs during prerender.
const LandingBackground = dynamic(
  () => import("@/components/LandingBackground"),
  { ssr: false }
);

export default function Landing() {
  return (
    <>
      <LandingBackground />
      <main className="relative z-10 min-h-screen flex flex-col items-center justify-center text-center px-6">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--color-bone-dim)] mb-8">
          Rawitphoom Kiatthitinan
        </p>
      </Reveal>

      <Reveal delay={0.08}>
        <h1 className="text-6xl md:text-8xl font-semibold tracking-tight leading-[0.95]">
          Designer <span className="opacity-40">&</span>
          <br />
          Developer
        </h1>
      </Reveal>

      <Reveal delay={0.16}>
        <p className="mt-8 max-w-md text-[var(--color-bone-dim)]">
          Interactive experiences, brand identity, and motion — designed and
          built end to end.
        </p>
      </Reveal>

      <Reveal delay={0.24}>
        <Magnetic strength={14}>
          <Link
            href="/projects"
            data-cursor="hover"
            className="group mt-14 inline-flex items-center gap-3 rounded-full border border-white/15 px-10 py-3.5 text-sm uppercase tracking-[0.2em] transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-ink)]"
          >
            Enter
            <span className="transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </Magnetic>
      </Reveal>
      </main>
    </>
  );
}
