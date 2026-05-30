"use client";

import { FILTERS, PROJECTS, type Filter } from "@/lib/projects";
import Magnetic from "./Magnetic";

type Props = {
  active: Filter;
  onChange: (f: Filter) => void;
};

export default function Hero({ active, onChange }: Props) {
  return (
    <section className="pt-40 pb-16 flex flex-col items-center text-center">
      <h1 className="text-6xl md:text-8xl font-semibold tracking-tight">
        Selected Projects
      </h1>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
        {FILTERS.map((f) => {
          const count =
            f === "All"
              ? PROJECTS.length
              : PROJECTS.filter((p) => p.tags.includes(f)).length;
          const isActive = f === active;
          return (
            <Magnetic key={f} strength={10}>
              <button
                data-cursor="hover"
                onClick={() => onChange(f)}
                className={[
                  "px-4 py-1.5 rounded-full text-sm transition-colors",
                  isActive
                    ? "bg-[var(--color-accent)] text-[var(--color-ink)]"
                    : "bg-[var(--color-ink-soft)] text-[var(--color-bone-dim)] hover:text-[var(--color-bone)]",
                ].join(" ")}
              >
                {f}
                <sup className="ml-1 opacity-70">{count}</sup>
              </button>
            </Magnetic>
          );
        })}
      </div>
    </section>
  );
}
