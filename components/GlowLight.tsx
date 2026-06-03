"use client";

/**
 * GlowLight — a procedural animated light, rendered with a WebGL fragment
 * shader, for the GlowCTA horizon. God-rays + horizon bloom + aurora shimmer,
 * breathing on its own and brightening as the cursor nears the bottom.
 *
 * Self-contained (raw WebGL, no R3F): transparent premultiplied-alpha canvas so
 * it composites over the black section, and it pauses its render loop when
 * scrolled out of view. Falls back to a static CSS glow if WebGL is missing.
 */

import { useEffect, useRef, useState } from "react";

const VERT = `attribute vec2 aPos; void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`;

const FRAG = `
precision highp float;
uniform float uTime;
uniform float uIntensity;
uniform vec2  uRes;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash(i), b = hash(i+vec2(1.,0.)), c = hash(i+vec2(0.,1.)), d = hash(i+vec2(1.,1.));
  vec2 u = f*f*(3.-2.*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0;i<5;i++){ v += a*noise(p); p = p*2.0 + 11.3; a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / uRes;          // y up, 0 at bottom
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2((uv.x - 0.5) * aspect, uv.y); // aspect-correct x, y from bottom

  // distance to the light origin at bottom-center (squashed horizontally)
  float d = length(vec2(p.x * 0.7, p.y * 1.5));

  float horizon = exp(-uv.y * 4.0);          // bright band hugging the bottom
  float core    = exp(-d * 3.0);             // glowing dome

  // animated god-rays fanning out from the origin (centered, no drift)
  float ang  = atan(p.x, max(p.y, 0.001) + 0.04);
  float rays = fbm(vec2(ang * 4.0, uv.y * 1.5 - uTime * 0.12));
  rays = smoothstep(0.35, 1.0, rays) * exp(-d * 2.2);

  // slow aurora shimmer
  float shimmer = 0.6 + 0.4 * fbm(vec2(p.x * 1.5 + uTime * 0.06, uv.y * 2.0 - uTime * 0.08));

  float light = horizon * 0.5 + core * 0.7 + rays * 0.6 * shimmer;
  light *= shimmer;
  light *= 0.68 + 0.32 * sin(uTime * 0.95);  // stronger breathe
  light *= 0.22 + 0.85 * uIntensity;         // mouse proximity
  light = clamp(light, 0.0, 1.0);

  vec3 col = mix(vec3(0.50, 0.54, 0.70), vec3(1.0), light);
  gl_FragColor = vec4(col * light, light);    // premultiplied alpha
}
`;

export default function GlowLight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetI = useRef(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: true });
    if (!gl) {
      setFallback(true);
      return;
    }

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(s));
      }
      return s;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "uTime");
    const uIntensity = gl.getUniformLocation(prog, "uIntensity");
    const uRes = gl.getUniformLocation(prog, "uRes");

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const resize = () => {
      const w = canvas.clientWidth || 1;
      const h = canvas.clientHeight || 1;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      const py = (e.clientY - r.top) / r.height;
      targetI.current = Math.max(0, Math.min(1, (py - 0.1) / 0.9));
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    let visible = true;
    let raf = 0;
    let curI = 0;
    const start = performance.now();

    const frame = () => {
      raf = 0;
      if (!visible) return;
      curI += (targetI.current - curI) * 0.08;
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform1f(uIntensity, curI);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0].isIntersecting;
        if (visible && !raf) raf = requestAnimationFrame(frame);
      },
      { threshold: 0 }
    );
    io.observe(canvas);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      ro.disconnect();
      io.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  if (fallback) {
    // Static CSS glow if WebGL is unavailable.
    return (
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%]"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 100%, rgb(210 214 240) 0%, transparent 72%)",
          opacity: 0.35,
          filter: "blur(30px)",
          mixBlendMode: "screen",
        }}
      />
    );
  }

  return <canvas ref={canvasRef} aria-hidden className="absolute inset-0 h-full w-full" />;
}
