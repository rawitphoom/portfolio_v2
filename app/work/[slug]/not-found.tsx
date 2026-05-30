import Link from "next/link";
import Nav from "@/components/Nav";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="min-h-screen grid place-items-center text-center px-6">
        <div>
          <p className="text-sm text-[var(--color-bone-dim)] uppercase tracking-widest">
            404
          </p>
          <h1 className="mt-2 text-5xl font-semibold">Project not found</h1>
          <Link
            href="/"
            data-cursor="hover"
            className="inline-block mt-8 text-[var(--color-accent-soft)] hover:text-[var(--color-bone)]"
          >
            ← Back home
          </Link>
        </div>
      </main>
    </>
  );
}
