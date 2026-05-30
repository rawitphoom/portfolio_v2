"use client";

/**
 * Particles — a drift of fluttering butterflies that gather toward the cursor.
 *
 * Each butterfly is three InstancedMesh instances sharing an index: a left
 * wing, a right wing, and a slim body — so the whole swarm is just 3 draw
 * calls.
 *
 * Motion is a light "boids"-style flight model computed on the CPU each frame:
 *   - wander: a smoothly turning steering force, so paths bob and curve
 *   - home pull: a gentle tether to each butterfly's spawn area so the swarm
 *     stays spread out across the screen
 *   - cursor attraction: butterflies steer toward the mouse (and orbit it),
 *     scaled by a per-butterfly affinity and how much the cursor is moving —
 *     so they crowd and trail wherever the cursor goes (see lib/pointerState)
 * The body banks/pitches into its velocity and the wings beat about the body
 * axis with a slightly non-sinusoidal stroke, which reads as real flapping.
 */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointerState } from "@/lib/pointerState";

const COUNT = 45;
const SPREAD = new THREE.Vector3(24, 18, 10); // x / y / z extents
const MAX_SPEED = 0.55;
const MIN_SPEED = 0.06;

type Seed = {
  home: THREE.Vector3;
  wanderFreq: number;
  wanderPhase: number;
  flapSpeed: number;
  flapPhase: number;
  scale: number;
  affinity: number; // 0..1 — how strongly this one chases the cursor
  orbitDir: number; // +1 / -1 — which way it swirls around the cursor
};

type Mover = {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  yaw: number;
  pitch: number;
  roll: number;
};

function makeSeeds(): Seed[] {
  const seeds: Seed[] = [];
  for (let i = 0; i < COUNT; i++) {
    seeds.push({
      home: new THREE.Vector3(
        (Math.random() - 0.5) * SPREAD.x,
        (Math.random() - 0.5) * SPREAD.y,
        (Math.random() - 0.5) * SPREAD.z
      ),
      wanderFreq: 0.4 + Math.random() * 0.7,
      wanderPhase: Math.random() * Math.PI * 2,
      flapSpeed: 7 + Math.random() * 7, // wing-beats are fast
      flapPhase: Math.random() * Math.PI * 2,
      scale: 0.07 + Math.random() * 0.09,
      affinity: Math.pow(Math.random(), 1.5), // skew toward low — only some chase hard
      orbitDir: Math.random() < 0.5 ? -1 : 1,
    });
  }
  return seeds;
}

function makeMovers(seeds: Seed[]): Mover[] {
  return seeds.map((s) => ({
    pos: s.home.clone(),
    vel: new THREE.Vector3(
      (Math.random() - 0.5) * 1.2,
      (Math.random() - 0.5) * 1.2,
      (Math.random() - 0.5) * 0.6
    ),
    yaw: 0,
    pitch: 0,
    roll: 0,
  }));
}

/** A single butterfly wing silhouette (fore- + hind-wing) in the XY plane,
 *  hinged on the body axis at x=0 and extending out to +x. */
function makeWingShape(): THREE.Shape {
  const w = new THREE.Shape();
  w.moveTo(0, 0);
  w.bezierCurveTo(0.15, 0.55, 0.85, 0.75, 1.0, 0.28); // upper forewing
  w.bezierCurveTo(1.06, 0.08, 0.7, 0.02, 0.52, -0.02); // notch toward body
  w.bezierCurveTo(0.92, -0.22, 0.82, -0.72, 0.42, -0.62); // lower hindwing
  w.bezierCurveTo(0.22, -0.58, 0.06, -0.32, 0, 0); // back to the hinge
  return w;
}

export default function Particles() {
  const leftRef = useRef<THREE.InstancedMesh>(null);
  const rightRef = useRef<THREE.InstancedMesh>(null);
  const bodyRef = useRef<THREE.InstancedMesh>(null);
  const seeds = useMemo(makeSeeds, []);
  const movers = useMemo(() => makeMovers(seeds), [seeds]);

  const { wingGeoR, wingGeoL, bodyGeo, wingMat, bodyMat } = useMemo(() => {
    const wingGeoR = new THREE.ShapeGeometry(makeWingShape(), 20);
    const wingGeoL = wingGeoR.clone();
    wingGeoL.scale(-1, 1, 1); // mirror across the body axis
    const bodyGeo = new THREE.CylinderGeometry(0.035, 0.02, 0.85, 6);
    const wingMat = new THREE.MeshStandardMaterial({
      color: "#eef0f5",
      emissive: "#4a4a52",
      emissiveIntensity: 0.35,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
    const bodyMat = new THREE.MeshStandardMaterial({
      color: "#2a2a30",
      roughness: 0.8,
      metalness: 0.1,
    });
    return { wingGeoR, wingGeoL, bodyGeo, wingMat, bodyMat };
  }, []);

  // Per-instance wing tint — subtle pale variation so they aren't all identical.
  useEffect(() => {
    const c = new THREE.Color();
    for (const ref of [leftRef.current, rightRef.current]) {
      if (!ref) continue;
      for (let i = 0; i < COUNT; i++) {
        const l = 0.82 + Math.random() * 0.18;
        const h = 0.55 + (Math.random() - 0.5) * 0.12; // faint cool/warm
        c.setHSL(h, 0.08, l);
        ref.setColorAt(i, c);
      }
      if (ref.instanceColor) ref.instanceColor.needsUpdate = true;
    }
  }, []);

  // Reusable scratch — avoid per-frame allocation.
  const body = useMemo(() => new THREE.Object3D(), []);
  const wing = useMemo(() => new THREE.Object3D(), []);
  const wingMatrix = useMemo(() => new THREE.Matrix4(), []);
  const acc = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const left = leftRef.current;
    const right = rightRef.current;
    const bodyMesh = bodyRef.current;
    if (!left || !right || !bodyMesh) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05); // clamp so tab-switches don't teleport

    // Cursor position in world space, on the z=0 plane.
    const halfW = state.viewport.width / 2;
    const halfH = state.viewport.height / 2;
    const cx = pointerState.ndcX * halfW;
    const cy = pointerState.ndcY * halfH;
    const act = pointerState.activity;
    pointerState.activity = Math.max(0, act - dt * 0.9); // decay toward idle

    for (let i = 0; i < COUNT; i++) {
      const s = seeds[i];
      const m = movers[i];
      const beat = Math.sin(t * s.flapSpeed + s.flapPhase); // -1..1

      // --- steering forces ---
      acc.set(0, 0, 0);

      // wander — a slowly curving push, unique per butterfly
      const wa = s.wanderPhase + t * s.wanderFreq;
      acc.x += Math.cos(wa) * 1.7;
      acc.y += Math.sin(wa * 1.3) * 1.3;
      acc.z += Math.sin(wa * 0.7) * 0.7;

      // home tether — keeps the swarm spread out (z held tighter for depth)
      acc.x += (s.home.x - m.pos.x) * 0.22;
      acc.y += (s.home.y - m.pos.y) * 0.22;
      acc.z += (s.home.z - m.pos.z) * 0.6;

      // cursor attraction + orbit — crowd toward where the mouse moves
      if (pointerState.engaged) {
        const dx = cx - m.pos.x;
        const dy = cy - m.pos.y;
        const d = Math.hypot(dx, dy) + 0.001;
        const pull = s.affinity * (0.35 + act * 1.8);
        acc.x += (dx / d) * pull * 3.2;
        acc.y += (dy / d) * pull * 3.2;
        // swirl tangentially, stronger up close, so they circle not collapse
        const orbit = (s.affinity * 2.4) / (1 + d * 0.5);
        acc.x += (-dy / d) * orbit * s.orbitDir;
        acc.y += (dx / d) * orbit * s.orbitDir;
        // and let chasers drift toward the screen plane
        acc.z += (0 - m.pos.z) * s.affinity * 0.5;
      }

      // --- integrate velocity ---
      m.vel.addScaledVector(acc, dt);
      let speed = m.vel.length();
      if (speed > MAX_SPEED) m.vel.multiplyScalar(MAX_SPEED / speed);
      else if (speed < MIN_SPEED && speed > 0)
        m.vel.multiplyScalar(MIN_SPEED / speed);
      speed = m.vel.length();
      m.pos.addScaledVector(m.vel, dt);

      // --- orient: bank/pitch into the flight direction, smoothed ---
      const targetRoll = THREE.MathUtils.clamp(-m.vel.x * 0.18, -0.6, 0.6);
      const targetPitch = THREE.MathUtils.clamp(m.vel.y * 0.16, -0.5, 0.5);
      const targetYaw = Math.atan2(m.vel.x, Math.abs(m.vel.z) + 2.5) * 0.6;
      const k = Math.min(1, dt * 4);
      m.roll += (targetRoll - m.roll) * k;
      m.pitch += (targetPitch - m.pitch) * k;
      m.yaw += (targetYaw - m.yaw) * k;

      // --- body matrix (with a tiny bob synced to the wing-beat) ---
      body.position.set(m.pos.x, m.pos.y + beat * 0.05, m.pos.z);
      body.rotation.set(m.pitch, m.yaw, m.roll);
      body.scale.setScalar(s.scale);
      body.updateMatrix();
      bodyMesh.setMatrixAt(i, body.matrix);

      // --- wings: shaped, symmetric flap about the body axis ---
      const stroke = beat * 0.85 + Math.sin(2 * (t * s.flapSpeed + s.flapPhase)) * 0.13;
      const ang = THREE.MathUtils.clamp(stroke, -0.95, 0.95);

      wing.position.set(0, 0, 0);
      wing.rotation.set(0, -ang, 0);
      wing.updateMatrix();
      wingMatrix.multiplyMatrices(body.matrix, wing.matrix);
      right.setMatrixAt(i, wingMatrix);

      wing.rotation.set(0, ang, 0);
      wing.updateMatrix();
      wingMatrix.multiplyMatrices(body.matrix, wing.matrix);
      left.setMatrixAt(i, wingMatrix);
    }

    left.instanceMatrix.needsUpdate = true;
    right.instanceMatrix.needsUpdate = true;
    bodyMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh
        ref={leftRef}
        args={[wingGeoL, wingMat, COUNT]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={rightRef}
        args={[wingGeoR, wingMat, COUNT]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={bodyRef}
        args={[bodyGeo, bodyMat, COUNT]}
        frustumCulled={false}
      />
    </group>
  );
}
