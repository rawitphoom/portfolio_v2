export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6">
      <a href="/" className="font-semibold tracking-tight">
        your<span className="text-[var(--color-accent)]">studio</span>
        <sup className="ml-0.5 text-xs opacity-60">°</sup>
      </a>

      <ul className="flex items-center gap-8 text-sm">
        <li>
          <a href="#index" data-cursor="hover" className="hover:text-[var(--color-accent-soft)] transition-colors">
            Index
          </a>
        </li>
        <li>
          <a href="#projects" data-cursor="hover" className="hover:text-[var(--color-accent-soft)] transition-colors">
            Projects
          </a>
        </li>
        <li>
          <a href="#contact" data-cursor="hover" className="hover:text-[var(--color-accent-soft)] transition-colors">
            Contact
          </a>
        </li>
        <li>
          <button
            aria-label="More"
            className="grid place-items-center w-8 h-8 rounded-full bg-[var(--color-ink-soft)] hover:bg-[var(--color-accent-deep)] transition-colors"
          >
            <span className="text-xs">•••</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
