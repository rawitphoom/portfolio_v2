"use client";

/**
 * template.tsx — re-renders on every navigation (unlike layout.tsx which
 * persists). Perfect hook for page-entry animations.
 *
 * Here we apply a CSS fade-up on mount. Because the WebGL canvas lives in
 * layout.tsx, the background stays continuous between page changes — only
 * the HTML content fades.
 */

import { useEffect, useRef } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Force restart of the CSS animation on each navigation.
    el.style.animation = "none";
    void el.offsetHeight; // reflow
    el.style.animation = "";
  }, []);

  return (
    <div ref={ref} className="page-enter">
      {children}
    </div>
  );
}
