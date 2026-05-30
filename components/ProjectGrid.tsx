import { PROJECTS, type Filter } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

type Props = { filter: Filter };

export default function ProjectGrid({ filter }: Props) {
  const items =
    filter === "All"
      ? PROJECTS
      : PROJECTS.filter((p) => p.tags.includes(filter));

  return (
    <section
      id="projects"
      className="mx-auto max-w-6xl px-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 pb-32"
    >
      {items.map((p, i) => (
        <ProjectCard key={p.slug} project={p} index={i} />
      ))}
    </section>
  );
}
