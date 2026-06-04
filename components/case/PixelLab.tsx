"use client";

/**
 * PixelLab — custom case-study page for the IAT460 project.
 * Parallax hero, scroll-reveal sections, count-up stats, embedded demo.
 */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Reveal from "@/components/Reveal";

/* ---------- small building blocks ---------- */

function Stat({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  label,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const dur = 1300;
        const start = performance.now();
        const step = (t: number) => {
          const p = Math.min(1, (t - start) / dur);
          const eased = 1 - Math.pow(1 - p, 3);
          setN(value * eased);
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-6xl font-semibold tracking-tight tabular-nums">
        {prefix}
        {n.toFixed(decimals)}
        {suffix}
      </div>
      <div className="mt-2 text-sm text-[var(--color-bone-dim)]">{label}</div>
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-bone-dim)]">
      {children}
    </p>
  );
}

const TECHNIQUES = [
  {
    no: "01",
    title: "Genetic Algorithm",
    body: "A population of 12 genomes breeds across generations via crossover, mutation, and tournament selection. Each child inherits parent traits and mutates 2–4 parameters for sibling diversity; two fresh random genomes are injected per generation to keep exploring.",
  },
  {
    no: "02",
    title: "Multi-Agent Fitness",
    body: "Nine agents score each genome 0–1, arranged as opposing pairs so different weights produce meaningfully different aesthetics. Fitness sharing penalizes genomes that are >70% similar, preventing premature convergence.",
  },
  {
    no: "03",
    title: "LLM Integration",
    body: "On selection, a character's traits are sent to the Claude API, which returns a name, title, one-line personality, and four RPG stats (ATK/DEF/SPD/LCK) as structured JSON. A local fallback keeps it working offline.",
  },
];

const AGENTS = [
  ["Colorful", "Monochrome"],
  ["Decorated", "Minimal"],
  ["Contrast", "Harmony"],
  ["Unique", "—"],
  ["Complexity", "—"],
  ["Symmetry", "—"],
];

const META = [
  ["Role", "Creative-AI Developer & Designer"],
  ["Year", "2026"],
  ["Course", "IAT 460 — Computational Arts, SFU"],
  ["Stack", "React 18 · Vite · HTML5 Canvas · Claude API"],
];

export default function PixelLab() {
  const heroImg = useRef<HTMLDivElement>(null);

  // Parallax: the hero image drifts slower than the scroll.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      if (heroImg.current) {
        heroImg.current.style.transform = `translate3d(0, ${window.scrollY * 0.4}px, 0) scale(1.15)`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <article className="relative bg-[var(--color-ink)]">
      {/* ---------- HERO ---------- */}
      <section className="relative h-[92vh] overflow-hidden">
        <div
          ref={heroImg}
          className="absolute inset-0 will-change-transform"
          style={{
            backgroundImage: "url(/projects/pixel-lab/cover.png)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(7px) brightness(0.5)",
          }}
        />
        <div className="absolute inset-0 bg-[var(--color-ink)]/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-ink)]/30 via-transparent to-[var(--color-ink)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <Eyebrow>IAT 460 · Computational Arts · 2026</Eyebrow>
          <h1 className="mt-5 text-6xl md:text-8xl font-semibold tracking-tight">
            Pixel Lab
          </h1>
          <p className="mt-5 max-w-xl text-lg text-[var(--color-bone)]/85">
            Evolving game assets with genetic algorithms, multi-agent fitness,
            and LLM integration.
          </p>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[var(--color-bone-dim)] text-xs uppercase tracking-[0.25em] animate-pulse">
          Scroll ↓
        </div>
      </section>

      {/* ---------- OVERVIEW + META ---------- */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <Reveal>
          <p className="text-2xl md:text-4xl font-medium leading-[1.3] tracking-tight">
            An interactive creative-AI tool that generates hundreds of unique,
            export-ready pixel-art assets in minutes — bridging the gap between
            slow manual spritework and uncontrollable neural image generation.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div
            className="mt-14 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-cover bg-center"
            style={{ backgroundImage: "url(/projects/pixel-lab/cover.png)" }}
            role="img"
            aria-label="Pixel Lab — a generation of evolved character sprites"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-16 grid grid-cols-1 gap-x-10 gap-y-6 sm:grid-cols-2">
            {META.map(([k, v]) => (
              <div key={k} className="border-t border-white/10 pt-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[var(--color-bone-dim)]">
                  {k}
                </div>
                <div className="mt-1 text-[var(--color-bone)]">{v}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ---------- PROBLEM ---------- */}
      <section className="mx-auto max-w-5xl px-6 pb-24 md:pb-32">
        <Reveal>
          <Eyebrow>The problem</Eyebrow>
          <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
            Games need hundreds of assets. Every existing path has a catch.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            ["Manual is slow", "Hand-drawing each asset takes weeks of artist time."],
            ["Random is noise", "Pure randomness produces garbage, not coherent art."],
            ["AI lacks control", "Neural generators output images but can't be steered or iterated."],
          ].map(([t, b], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] p-6">
                <div className="text-lg font-medium">{t}</div>
                <p className="mt-2 text-sm text-[var(--color-bone-dim)]">{b}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- SOLUTION: 3 TECHNIQUES ---------- */}
      <section className="mx-auto max-w-5xl px-6 pb-24 md:pb-32">
        <Reveal>
          <Eyebrow>The solution</Eyebrow>
          <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
            Three AI techniques, one system.
          </h2>
        </Reveal>
        <div className="mt-12 space-y-4">
          {TECHNIQUES.map((t, i) => (
            <Reveal key={t.no} delay={i * 0.06}>
              <div className="grid grid-cols-[auto_1fr] gap-6 rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
                <div className="text-3xl md:text-5xl font-semibold text-[var(--color-bone-dim)]/40 tabular-nums">
                  {t.no}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-medium">{t.title}</h3>
                  <p className="mt-3 text-[var(--color-bone-dim)] leading-relaxed">
                    {t.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* fitness agents */}
        <Reveal delay={0.1}>
          <div className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="text-sm uppercase tracking-[0.2em] text-[var(--color-bone-dim)]">
              The nine fitness agents — opposing pairs
            </div>
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-3">
              {AGENTS.map(([a, b]) => (
                <div
                  key={a}
                  className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-1.5 text-sm"
                >
                  <span>{a}</span>
                  {b !== "—" && (
                    <>
                      <span className="text-[var(--color-bone-dim)]/50">↔</span>
                      <span className="text-[var(--color-bone-dim)]">{b}</span>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------- TWO MODES ---------- */}
      <section className="mx-auto max-w-5xl px-6 pb-24 md:pb-32">
        <Reveal>
          <Eyebrow>Two evolution modes</Eyebrow>
        </Reveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Reveal>
            <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-2xl font-medium">Pick — human-guided</h3>
              <p className="mt-3 text-[var(--color-bone-dim)] leading-relaxed">
                You click favorites as parents — you <em>are</em> the fitness
                function. Refined results that reflect personal taste. Across 30
                generations, populations converge to 7–9 shared traits of 12.
              </p>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="h-full rounded-xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="text-2xl font-medium">Auto — fitness-based</h3>
              <p className="mt-3 text-[var(--color-bone-dim)] leading-relaxed">
                Nine agents score every genome; tournament selection (k=3) picks
                parents. Rapid iteration with no user fatigue — and far higher
                diversity, sharing only 3–5 traits of 12.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- RESULTS / STATS ---------- */}
      <section className="border-y border-white/10 bg-white/[0.015]">
        <div className="mx-auto max-w-5xl px-6 py-20 md:py-28">
          <Reveal>
            <Eyebrow>Results</Eyebrow>
          </Reveal>
          <Reveal delay={0.05}>
            <div className="mt-12 grid grid-cols-2 gap-y-12 md:grid-cols-4">
              <Stat value={3} suffix="" label="AI techniques combined" />
              <Stat value={6} label="asset categories" />
              <Stat value={9} label="fitness agents" />
              <Stat value={0.9} decimals={2} label="peak fitness (~35 gens)" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-16 max-w-2xl text-center text-xl md:text-2xl font-medium leading-snug tracking-tight">
              The same algorithm produces visibly different art when fitness
              weights change — proving that{" "}
              <span className="text-[var(--color-bone)]">
                fitness definition, not the algorithm, shapes creative output.
              </span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* ---------- DEMO VIDEO ---------- */}
      <section className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <Reveal>
          <Eyebrow>Demo</Eyebrow>
          <h2 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
            See it evolve.
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="mt-10 aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/TH-owmpUB2U"
              title="Pixel Lab — demo"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </Reveal>
      </section>

      {/* ---------- RECOGNITION ---------- */}
      <section className="mx-auto max-w-5xl px-6 pb-24 md:pb-32">
        <Reveal>
          <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-8 md:p-12 text-center">
            <Eyebrow>Recognition</Eyebrow>
            <p className="mx-auto mt-5 max-w-2xl text-xl md:text-2xl font-medium leading-snug tracking-tight">
              Selected by Prof. Philippe Pasquier — Director of SFU&rsquo;s
              Metacreation Lab for Creative AI — as a potential submission to{" "}
              <span className="text-[var(--color-bone)]">EVOMusart</span>, the
              international conference on evolutionary art.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ---------- LEARNED ---------- */}
      <section className="mx-auto max-w-3xl px-6 pb-28">
        <Reveal>
          <Eyebrow>What I learned</Eyebrow>
          <p className="mt-6 text-lg leading-relaxed text-[var(--color-bone-dim)]">
            The creativity of an evolutionary system isn&rsquo;t in the algorithm
            — it&rsquo;s in the evaluation function that guides it. Small choices
            (template vs. pixel-level genomes, independent vs. opposing agents)
            decide whether the system makes noise or art. I also saw how two AI
            systems can collaborate across modalities — a visual GA and a
            linguistic LLM — producing emergent coherence neither could reach
            alone. It was my first taste of real research: literature review,
            experimental design, and writing an ACM-format paper.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-4">
            <a
              href="https://youtu.be/TH-owmpUB2U?si=vBlhOVklFYfurAKY"
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="hover"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-accent-soft)] hover:text-[var(--color-bone)] transition-colors"
            >
              Watch the demo ↗
            </a>
            <Link
              href="/projects"
              data-cursor="hover"
              className="inline-flex items-center gap-2 text-sm text-[var(--color-bone-dim)] hover:text-[var(--color-bone)] transition-colors"
            >
              ← All projects
            </Link>
          </div>
        </Reveal>
      </section>
    </article>
  );
}
