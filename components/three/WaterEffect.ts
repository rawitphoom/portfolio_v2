/**
 * WaterEffect — custom post-processing pass.
 *
 * This is our first real shader. It runs AFTER the 3D scene is rendered,
 * treating the whole frame as a 2D image and distorting it.
 *
 * Pipeline:
 *   1. R3F renders the scene (particles + lights) → offscreen texture.
 *   2. postprocessing passes that texture to our fragment shader as
 *      `inputBuffer`.
 *   3. We sample that texture at *offset* UVs. The offset is driven by
 *      sin/cos waves + scroll velocity.
 *   4. We sample R / G / B at slightly different offsets → chromatic
 *      aberration (the "glassy" feel).
 *
 * Uniforms (values passed from JS → shader once per frame):
 *   - uTime:     seconds since start. Makes the waves move.
 *   - uVelocity: smoothed scroll velocity. Harder scroll → more distortion.
 */

import { Effect } from "postprocessing";
import { Uniform } from "three";
import { scrollState } from "@/lib/scrollState";

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uVelocity;

  void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    // Two cheap waves, 90° apart — gives a shimmery "liquid" feel
    // without needing a proper noise function.
    vec2 d;
    d.x = sin(uv.y * 18.0 + uTime * 0.6) * 0.0025;
    d.y = cos(uv.x * 14.0 + uTime * 0.5) * 0.0025;

    // Velocity amplifier: idle = 1x, hard scroll = ~7x.
    float amp = 1.0 + uVelocity * 6.0;
    vec2 offset = d * amp;

    // Chromatic aberration: each channel sampled at a slightly different
    // offset. The differences multiply during strong distortion.
    float r = texture2D(inputBuffer, uv + offset * 1.8).r;
    float g = texture2D(inputBuffer, uv + offset * 1.0).g;
    float b = texture2D(inputBuffer, uv + offset * 0.4).b;

    outputColor = vec4(r, g, b, inputColor.a);
  }
`;

export class WaterEffect extends Effect {
  constructor() {
    super("WaterEffect", fragmentShader, {
      uniforms: new Map<string, Uniform<number>>([
        ["uTime", new Uniform(0)],
        ["uVelocity", new Uniform(0)],
      ]),
    });
  }

  // `update` runs once per frame. We advance time and lerp the velocity
  // uniform toward the current scroll velocity (smoothing = no flicker).
  update(_renderer: unknown, _inputBuffer: unknown, deltaTime: number) {
    const uTime = this.uniforms.get("uTime")!;
    const uVelocity = this.uniforms.get("uVelocity")!;

    uTime.value += deltaTime;

    // Normalize Lenis velocity → ~0..1 for sensible distortion range.
    const target = Math.min(Math.abs(scrollState.velocity) * 0.02, 1);
    // Lerp toward target: quick ramp up during scroll, slow settle after.
    uVelocity.value += (target - uVelocity.value) * 0.1;
  }
}
