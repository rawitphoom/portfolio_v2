import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { PROJECTS } from "@/lib/projects";
import Nav from "@/components/Nav";

type Params = { slug: string };

// Tell Next to prerender every project page at build time.
export function generateStaticParams(): Params[] {
  return PROJECTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) return {};
  return { title: `${p.title} — ${p.subtitle}` };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const project = PROJECTS.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <>
      <Nav />

      <main className="min-h-screen pt-32 pb-24">
        {/* hero cover — full case study comes later */}
        <section className="mx-auto max-w-6xl px-6">
          <div className="relative aspect-[16/8] w-full rounded-xl ring-1 ring-white/5 overflow-hidden bg-[var(--color-ink-soft)]">
            <Image
              src={project.cover}
              alt={project.title}
              fill
              sizes="(min-width: 1152px) 1152px, 100vw"
              priority
              className="object-cover"
            />
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 mt-16">
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {project.tags.map((t) => (
              <span
                key={t}
                className="text-xs px-3 py-1 rounded-full bg-[var(--color-ink-soft)] text-[var(--color-bone-dim)]"
              >
                {t}
              </span>
            ))}
          </div>

          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
            {project.title}
          </h1>
          <p className="mt-3 text-[var(--color-bone-dim)] text-lg">
            {project.subtitle}
          </p>

          <div className="mt-10 prose prose-invert max-w-none text-[var(--color-bone-dim)]">
            <p>
              Placeholder case-study copy. Replace with a real write-up, process
              shots, embedded video, or interactive demo when the content is
              ready.
            </p>
            <p>
              This page is a static route prerendered at build time — fast
              loads, great SEO. The WebGL backdrop still runs on top.
            </p>
          </div>

          <Link
            href="/#projects"
            data-cursor="hover"
            className="inline-flex items-center gap-2 mt-16 text-sm text-[var(--color-blue-soft)] hover:text-[var(--color-bone)] transition-colors"
          >
            ← All projects
          </Link>
        </section>
      </main>
    </>
  );
}
