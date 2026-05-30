import Link from "next/link";
import type { Project } from "@/lib/projects";
import Reveal from "./Reveal";

type Props = { project: Project; index?: number };

export default function ProjectCard({ project, index = 0 }: Props) {
  const { title, subtitle, cover } = project;

  return (
    <Reveal delay={(index % 2) * 0.1}>
      <Link
        href={`/work/${project.slug}`}
        data-cursor="hover"
        className="group block"
      >
        {/* cover — placeholder gradient until real media is added */}
        <div
          className="relative aspect-[16/10] w-full overflow-hidden rounded-lg ring-1 ring-white/5 transition-transform duration-500 group-hover:scale-[1.01]"
          style={{
            backgroundImage: `linear-gradient(135deg, ${cover.from}, ${cover.to})`,
          }}
        >
          {/* subtle highlight to fake depth */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
        </div>

        <div className="mt-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-[var(--color-bone-dim)]">{subtitle}</p>
          </div>
          <span className="mt-1 text-[var(--color-bone-dim)] transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
            ↗
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
