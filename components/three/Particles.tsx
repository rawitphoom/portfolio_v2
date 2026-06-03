"use client";

/**
 * Particles — a resting butterfly swarm, plus bursts that erupt from the cursor.
 *
 * One instanced pool (left wing / right wing / body = 3 draw calls), split:
 *   - the first AMBIENT_COUNT are always-alive "resting" butterflies that drift
 *     and wander gently around the screen
 *   - the rest are a burst pool: dead until the cursor moves, then spawned at
 *     the cursor with a slow outward radial velocity (a graceful "bomb"),
 *     scattering off-screen and recycling — with a fade in/out so they don't pop
 *
 * Cursor position + movement intensity come from lib/pointerState (the canvas
 * has pointer-events: none, so we can't use R3F's built-in pointer).
 */

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { pointerState } from "@/lib/pointerState";

const COUNT = 180; // total pool
const AMBIENT_COUNT = 55; // always-alive resting swarm; rest is the burst pool

// resting swarm
const AMB_MAX_SPEED = 0.5;
const AMB_THRUST = 2.5;
const AMB_DRAG = 1.8;

// cursor bursts — slow & graceful
const SPAWN_RATE = 16; // butterflies/sec at full cursor movement
const BURST_MIN = 0.6; // gentle outward speed (units/sec)
const BURST_MAX = 1.9;
const BURST_DRAG = 0.55;
// click = one big, slightly faster explosion
const CLICK_COUNT = 42;
const CLICK_MIN = 1.2;
const CLICK_MAX = 3.4;
const MAX_LIFE = 7; // seconds, then fade out & recycle
const FADE = 1.2; // fade in/out duration (s)
const MARGIN = 2.5; // world units past the edge before recycle

type Bug = {
  ambient: boolean;
  home: THREE.Vector3;
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  alive: boolean;
  age: number;
  yaw: number;
  pitch: number;
  roll: number;
  wander: number;
  wanderFreq: number;
  flapSpeed: number;
  flapPhase: number;
  scale: number;
};

function makeBugs(): Bug[] {
  return Array.from({ length: COUNT }, (_, i) => {
    const ambient = i < AMBIENT_COUNT;
    const home = new THREE.Vector3(
      (Math.random() - 0.5) * 24,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 10
    );
    return {
      ambient,
      home,
      pos: ambient ? home.clone() : new THREE.Vector3(0, 0, -999),
      vel: ambient
        ? new THREE.Vector3(
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.4,
            (Math.random() - 0.5) * 0.2
          )
        : new THREE.Vector3(),
      alive: ambient,
      age: 0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      wander: Math.random() * Math.PI * 2,
      wanderFreq: 0.4 + Math.random() * 0.7,
      flapSpeed: 7 + Math.random() * 7,
      flapPhase: Math.random() * Math.PI * 2,
      scale: 0.07 + Math.random() * 0.09,
    };
  });
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
  const bugs = useMemo(makeBugs, []);
  const spawnAcc = useRef(0);
  const scanIdx = useRef(AMBIENT_COUNT);

  const { wingGeoR, wingGeoL, bodyGeo, wingMat, bodyMat } = useMemo(() => {
    const wingGeoR = new THREE.ShapeGeometry(makeWingShape(), 20);
    const wingGeoL = wingGeoR.clone();
    wingGeoL.scale(-1, 1, 1);
    const bodyGeo = new THREE.CylinderGeometry(0.035, 0.02, 0.85, 6);
    const wingMat = new THREE.MeshStandardMaterial({
      color: "#eef0f5",
      emissive: "#4a4a52",
      emissiveIntensity: 0.35,
      roughness: 0.7,
      metalness: 0.05,
      side: THREE.DoubleSide,
    });
    const bodyMat = new THREE.MeshStandardMaterial({
      color: "#2a2a30",
      roughness: 0.8,
      metalness: 0.1,
    });
    return { wingGeoR, wingGeoL, bodyGeo, wingMat, bodyMat };
  }, []);

  // Per-instance wing tint — subtle pale variation.
  useEffect(() => {
    const c = new THREE.Color();
    for (const ref of [leftRef.current, rightRef.current]) {
      if (!ref) continue;
      for (let i = 0; i < COUNT; i++) {
        const l = 0.82 + Math.random() * 0.18;
        const h = 0.55 + (Math.random() - 0.5) * 0.12;
        c.setHSL(h, 0.08, l);
        ref.setColorAt(i, c);
      }
      if (ref.instanceColor) ref.instanceColor.needsUpdate = true;
    }
  }, []);

  const body = useMemo(() => new THREE.Object3D(), []);
  const wing = useMemo(() => new THREE.Object3D(), []);
  const wingMatrix = useMemo(() => new THREE.Matrix4(), []);
  const acc = useMemo(() => new THREE.Vector3(), []);

  const claimSlot = () => {
    for (let n = 0; n < COUNT - AMBIENT_COUNT; n++) {
      const i = AMBIENT_COUNT + ((scanIdx.current - AMBIENT_COUNT + n) % (COUNT - AMBIENT_COUNT));
      if (!bugs[i].alive) {
        scanIdx.current = i + 1;
        return i;
      }
    }
    return -1;
  };

  useFrame((state, delta) => {
    const left = leftRef.current;
    const right = rightRef.current;
    const bodyMesh = bodyRef.current;
    if (!left || !right || !bodyMesh) return;

    const t = state.clock.elapsedTime;
    const dt = Math.min(delta, 0.05);

    const halfW = state.viewport.width / 2;
    const halfH = state.viewport.height / 2;
    const cx = pointerState.ndcX * halfW;
    const cy = pointerState.ndcY * halfH;
    const act = pointerState.activity;
    pointerState.activity = Math.max(0, act - dt * 2.2);

    // Write the body + flapping wing matrices for one bug at a given scale.
    const writeMatrices = (i: number, b: Bug, renderScale: number, beat: number) => {
      const targetRoll = THREE.MathUtils.clamp(-b.vel.x * 0.18, -0.6, 0.6);
      const targetPitch = THREE.MathUtils.clamp(b.vel.y * 0.16, -0.5, 0.5);
      const targetYaw = Math.atan2(b.vel.x, Math.abs(b.vel.z) + 2.5) * 0.6;
      const k = Math.min(1, dt * 4);
      b.roll += (targetRoll - b.roll) * k;
      b.pitch += (targetPitch - b.pitch) * k;
      b.yaw += (targetYaw - b.yaw) * k;

      body.position.set(b.pos.x, b.pos.y + beat * 0.05, b.pos.z);
      body.rotation.set(b.pitch, b.yaw, b.roll);
      body.scale.setScalar(renderScale);
      body.updateMatrix();
      bodyMesh.setMatrixAt(i, body.matrix);

      const wave = beat * 0.5 + 0.5;
      const ang = 0.1 + wave * 1.05;
      wing.position.set(0, 0, 0);
      wing.rotation.set(0, -ang, 0);
      wing.updateMatrix();
      wingMatrix.multiplyMatrices(body.matrix, wing.matrix);
      right.setMatrixAt(i, wingMatrix);
      wing.rotation.set(0, ang, 0);
      wing.updateMatrix();
      wingMatrix.multiplyMatrices(body.matrix, wing.matrix);
      left.setMatrixAt(i, wingMatrix);
    };

    const hide = (i: number) => {
      body.scale.setScalar(0);
      body.position.set(0, 0, -999);
      body.rotation.set(0, 0, 0);
      body.updateMatrix();
      bodyMesh.setMatrixAt(i, body.matrix);
      left.setMatrixAt(i, body.matrix);
      right.setMatrixAt(i, body.matrix);
    };

    // Spawn one burst butterfly at a world point with an outward radial velocity.
    const spawnAt = (wx: number, wy: number, sMin: number, sMax: number) => {
      const i = claimSlot();
      if (i < 0) return false;
      const b = bugs[i];
      const ang = Math.random() * Math.PI * 2;
      const sp = sMin + Math.random() * (sMax - sMin);
      b.pos.set(
        wx + (Math.random() - 0.5) * 0.4,
        wy + (Math.random() - 0.5) * 0.4,
        (Math.random() - 0.5) * 1.5
      );
      b.vel.set(Math.cos(ang) * sp, Math.sin(ang) * sp, (Math.random() - 0.5) * 0.4);
      b.alive = true;
      b.age = 0;
      b.wander = Math.random() * Math.PI * 2;
      b.wanderFreq = 0.4 + Math.random() * 0.7;
      b.flapSpeed = 9 + Math.random() * 7;
      b.flapPhase = Math.random() * Math.PI * 2;
      b.scale = 0.07 + Math.random() * 0.09;
      b.yaw = b.pitch = b.roll = 0;
      return true;
    };

    // --- click: one big explosion at the click point ---
    if (pointerState.clickPending) {
      pointerState.clickPending = false;
      const wx = pointerState.clickX * halfW;
      const wy = pointerState.clickY * halfH;
      for (let n = 0; n < CLICK_COUNT; n++) {
        if (!spawnAt(wx, wy, CLICK_MIN, CLICK_MAX)) break;
      }
    }

    // --- movement: a steady trickle from the cursor while it moves ---
    if (pointerState.engaged && act > 0.02) {
      spawnAcc.current += act * SPAWN_RATE * dt;
      let toSpawn = Math.floor(spawnAcc.current);
      spawnAcc.current -= toSpawn;
      while (toSpawn-- > 0) {
        if (!spawnAt(cx, cy, BURST_MIN, BURST_MAX)) break;
      }
    } else {
      spawnAcc.current = 0;
    }

    for (let i = 0; i < COUNT; i++) {
      const b = bugs[i];
      const beat = Math.sin(t * b.flapSpeed + b.flapPhase);

      if (b.ambient) {
        // resting swarm — wander + gentle home tether, flap-driven thrust
        acc.set(0, 0, 0);
        const wa = b.wander + t * b.wanderFreq;
        acc.x += Math.cos(wa) * 1.7;
        acc.y += Math.sin(wa * 1.3) * 1.3;
        acc.z += Math.sin(wa * 0.7) * 0.7;
        acc.x += (b.home.x - b.pos.x) * 0.22;
        acc.y += (b.home.y - b.pos.y) * 0.22;
        acc.z += (b.home.z - b.pos.z) * 0.6;
        const pulse = Math.pow(Math.max(0, beat), 1.6);
        const dlen = acc.length();
        if (dlen > 1e-4) {
          acc.multiplyScalar(1 / dlen);
          b.vel.addScaledVector(acc, pulse * AMB_THRUST * dt);
        }
        b.vel.multiplyScalar(Math.exp(-AMB_DRAG * dt));
        const speed = b.vel.length();
        if (speed > AMB_MAX_SPEED) b.vel.multiplyScalar(AMB_MAX_SPEED / speed);
        b.pos.addScaledVector(b.vel, dt);
        writeMatrices(i, b, b.scale, beat);
        continue;
      }

      // burst pool
      if (!b.alive) {
        hide(i);
        continue;
      }

      b.age += dt;
      const wa = b.wander + t * 1.1;
      b.vel.x += Math.cos(wa) * 0.4 * dt;
      b.vel.y += Math.sin(wa * 1.2) * 0.4 * dt;
      b.vel.multiplyScalar(Math.exp(-BURST_DRAG * dt));
      b.pos.addScaledVector(b.vel, dt);

      if (
        b.age > MAX_LIFE ||
        Math.abs(b.pos.x) > halfW + MARGIN ||
        Math.abs(b.pos.y) > halfH + MARGIN
      ) {
        b.alive = false;
        hide(i);
        continue;
      }

      // fade in on spawn, fade out near end of life — no popping
      const fadeIn = THREE.MathUtils.clamp(b.age / FADE, 0, 1);
      const fadeOut = THREE.MathUtils.clamp((MAX_LIFE - b.age) / FADE, 0, 1);
      writeMatrices(i, b, b.scale * Math.min(fadeIn, fadeOut), beat);
    }

    left.instanceMatrix.needsUpdate = true;
    right.instanceMatrix.needsUpdate = true;
    bodyMesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      <instancedMesh ref={leftRef} args={[wingGeoL, wingMat, COUNT]} frustumCulled={false} />
      <instancedMesh ref={rightRef} args={[wingGeoR, wingMat, COUNT]} frustumCulled={false} />
      <instancedMesh ref={bodyRef} args={[bodyGeo, bodyMat, COUNT]} frustumCulled={false} />
    </group>
  );
}
