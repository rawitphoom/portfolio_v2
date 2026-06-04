"use client";

/**
 * Scene — the WebGL backdrop with post-processing.
 *
 * Added in Phase 4: <EffectComposer> wraps the scene render so our custom
 * WaterEffect shader can sample + distort the final frame.
 */

import { useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer } from "@react-three/postprocessing";
import Particles from "./Particles";
import { WaterEffect } from "./WaterEffect";
import { pointerState } from "@/lib/pointerState";

function Water() {
  // Create the Effect instance once — it owns its own uniforms.
  const effect = useMemo(() => new WaterEffect(), []);
  return <primitive object={effect} />;
}

// Gently glide the camera with the mouse so the whole scene parallaxes.
function CameraRig() {
  useFrame((state) => {
    const tx = pointerState.ndcX * 1.2;
    const ty = pointerState.ndcY * 0.8;
    state.camera.position.x += (tx - state.camera.position.x) * 0.05;
    state.camera.position.y += (ty - state.camera.position.y) * 0.05;
    state.camera.lookAt(0, 0, 0);
  });
  return null;
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
        dpr={1}
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

        <CameraRig />
        <Particles />

        <EffectComposer>
          <Water />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
