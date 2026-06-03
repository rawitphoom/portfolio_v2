"use client";

import { useState } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import type { Filter } from "@/lib/projects";

export default function Projects() {
  const [filter, setFilter] = useState<Filter>("All");

  return (
    <>
      <Nav />
      <main>
        <Hero active={filter} onChange={setFilter} />
        <ProjectGrid filter={filter} />
        <footer
          id="contact"
          className="border-t border-white/5 py-12 text-center text-sm text-[var(--color-bone-dim)]"
        >
          <p>Placeholder footer — contact@example.com</p>
          <p className="mt-2 opacity-60">© {new Date().getFullYear()}</p>
        </footer>
      </main>
    </>
  );
}
