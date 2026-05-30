"use client";

/**
 * Scene — the WebGL backdrop with post-processing.
 *
 * Added in Phase 4: <EffectComposer> wraps the scene render so our custom
 * WaterEffect shader can sample + distort the final frame.
 */

import { useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import Particles from "./Particles";
import { WaterEffect } from "./WaterEffect";

function Water() {
  // Create the Effect instance once — it owns its own uniforms.
  const effect = useMemo(() => new WaterEffect(), []);
  return <primitive object={effect} />;
}

export default function Scene() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <color attach="background" args={["#06060a"]} />
        <fog attach="fog" args={["#06060a", 6, 18]} />

        <ambientLight intensity={0.4} />
        <directionalLight
          position={[3, 4, 5]}
          intensity={0.9}
          color="#ffffff"
        />
        <directionalLight
          position={[-4, -2, -3]}
          intensity={0.3}
          color="#cfcfd6"
        />

        <Particles />

        <EffectComposer>
          <Water />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
