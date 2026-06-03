"use client";

/**
 * LandingBackground — animated ShaderGradient backdrop for the landing page.
 * The whole canvas gently parallaxes with the mouse (translated wrapper),
 * giving the "scene moves as you move" feel. Dark, near-monochrome palette to
 * match the black & white theme.
 *
 * Tweak the look visually at https://www.shadergradient.co/customize and paste
 * the resulting values into the <ShaderGradient .../> props below.
 */

import { ShaderGradientCanvas, ShaderGradient } from "@shadergradient/react";
import { useEffect, useRef } from "react";

export default function LandingBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      if (ref.current) {
        ref.current.style.transform = `translate3d(${-x * 28}px, ${-y * 28}px, 0) scale(1.08)`;
      }
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed inset-0 z-0"
      style={{ transition: "transform 0.3s ease-out", willChange: "transform" }}
    >
      <ShaderGradientCanvas
        style={{ width: "100%", height: "100%" }}
        pixelDensity={1}
        fov={40}
      >
        <ShaderGradient
          control="props"
          type="waterPlane"
          animate="on"
          uSpeed={0.18}
          uStrength={1.6}
          uDensity={1.4}
          uFrequency={5.5}
          uAmplitude={0}
          color1="#000000"
          color2="#242830"
          color3="#9a9aa2"
          grain="on"
          lightType="3d"
          brightness={1.2}
          reflection={0.1}
          cDistance={2.8}
          cameraZoom={9.1}
          cAzimuthAngle={180}
          cPolarAngle={80}
          rotationX={50}
          rotationY={0}
          rotationZ={-60}
          positionX={0}
          positionY={0}
          positionZ={0}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
