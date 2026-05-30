"use client";

/**
 * Particles — floating "paper" flakes.
 *
 * This uses THREE.InstancedMesh: one geometry + one material, drawn N times
 * with a different matrix per copy. Much cheaper than N separate meshes.
 *
 * On each frame we compute a new position/rotation per instance (on the CPU,
 * using a cheap pseudo-noise) and write it into the instance matrix. For
 * ~250 particles this is totally fine on any device. Later we can move this
 * math into a vertex shader for huge counts.
 */

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const COUNT = 250;

// Per-instance random seeds we generate once and reuse each frame.
type Seed = {
  basePos: THREE.Vector3;
  drift: THREE.Vector3;  // per-axis frequency
  phase: THREE.Vector3;  // per-axis phase offset
  rot: THREE.Vector3;    // starting rotation
  rotSpeed: THREE.Vector3;
  scale: number;
};

function makeSeeds(): Seed[] {
  const seeds: Seed[] = [];
  for (let i = 0; i < COUNT; i++) {
    seeds.push({
      basePos: new THREE.Vector3(
        (Math.random() - 0.5) * 24, // x spread
        (Math.random() - 0.5) * 18, // y spread
        (Math.random() - 0.5) * 10  // z depth
      ),
      drift: new THREE.Vector3(
        0.2 + Math.random() * 0.3,
        0.15 + Math.random() * 0.25,
        0.1 + Math.random() * 0.2
      ),
      phase: new THREE.Vector3(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      ),
      rot: new THREE.Vector3(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      ),
      rotSpeed: new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 0.4
      ),
      scale: 0.04 + Math.random() * 0.08,
    });
  }
  return seeds;
}

export default function Particles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(makeSeeds, []);

  // Reusable scratch object — avoids allocating a new Object3D every frame.
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(({ clock }) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = clock.elapsedTime;

    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];

      // Drift around the base position using sin/cos — cheap, smooth, no noise lib.
      dummy.position.set(
        s.basePos.x + Math.sin(t * s.drift.x + s.phase.x) * 0.8,
        s.basePos.y + Math.cos(t * s.drift.y + s.phase.y) * 0.6,
        s.basePos.z + Math.sin(t * s.drift.z + s.phase.z) * 0.4
      );

      // Slow tumbling rotation per instance.
      dummy.rotation.set(
        s.rot.x + t * s.rotSpeed.x,
        s.rot.y + t * s.rotSpeed.y,
        s.rot.z + t * s.rotSpeed.z
      );

      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    // Tell three.js the matrices changed and should be re-uploaded to GPU.
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[undefined, undefined, COUNT]}
      frustumCulled={false}
    >
      {/* Thin plane — the "paper" shape. Double-sided so it shows both faces
         as it tumbles. */}
      <planeGeometry args={[1, 1.4]} />
      <meshStandardMaterial
        color="#8aa4ff"
        emissive="#1a2d7a"
        emissiveIntensity={0.4}
        roughness={0.6}
        metalness={0.1}
        side={THREE.DoubleSide}
        transparent
        opacity={0.85}
      />
    </instancedMesh>
  );
}
