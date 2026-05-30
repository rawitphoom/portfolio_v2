"use client";

/**
 * Magnetic — wraps a child element and nudges it toward the cursor while
 * hovered, springing back on leave. Gives pills/buttons a "pulled" feel.
 *
 * Strength = how many pixels the element drifts at max reach.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

type Props = {
  children: React.ReactNode;
  strength?: number;
  className?: string;
};

export default function Magnetic({
  children,
  strength = 20,
  className,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      // cx/cy = cursor offset from element center, range ~[-halfW..+halfW]
      const cx = e.clientX - (rect.left + rect.width / 2);
      const cy = e.clientY - (rect.top + rect.height / 2);

      gsap.to(el, {
        x: (cx / rect.width) * strength * 2,
        y: (cy / rect.height) * strength * 2,
        duration: 0.4,
        ease: "power3.out",
      });
    };

    const onLeave = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1, 0.4)" });
    };

    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);

    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [strength]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
