"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import GlowCTA from "@/components/GlowCTA";
import type { Filter } from "@/lib/projects";

export default function Projects() {
  const [filter, setFilter] = useState<Filter>("All");

  return (
    <>
      <Nav />
      <main>
        <Hero active={filter} onChange={setFilter} />
        <ProjectGrid filter={filter} />
        <GlowCTA />
        <footer className="py-8 text-center text-xs text-[var(--color-bone-dim)] opacity-60">
          © {new Date().getFullYear()} Rawitphoom Kiatthitinan
        </footer>
      </main>
    </>
  );
}
