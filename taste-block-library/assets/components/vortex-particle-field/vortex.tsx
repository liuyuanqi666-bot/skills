import React, { useEffect, useRef, useState, useCallback } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createNoise3D } from "simplex-noise";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface VortexProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  /** Explicit particle count override. When omitted and responsiveDensity=true, scales to container bounds. */
  particleCount?: number;
  /** Vertical diffusion range in pixels. When omitted and responsiveDensity=true, bounds to container height. */
  rangeY?: number;
  /** Base hue on 360-degree color wheel. Default 120 (Firefly emerald green). */
  baseHue?: number;
  /** Hue variance range. Default 40 (warm chartreuse to cool cyan-green). */
  rangeHue?: number;
  /** Minimum particle speed. Default 0.0. */
  baseSpeed?: number;
  /** Maximum added particle speed. Default 1.2 (for gentle firefly drift). */
  rangeSpeed?: number;
  /** Minimum particle stroke width in pixels. Default 1.0. */
  baseRadius?: number;
  /** Maximum added particle radius in pixels. Default 1.8. */
  rangeRadius?: number;
  /** Minimum particle lifespan in ticks. Default 50. */
  baseTTL?: number;
  /** Added particle lifespan range. Default 150. */
  rangeTTL?: number;
  /** Container and canvas background color. Default "#000000". */
  backgroundColor?: string;
  /** Automatically adapt particle count and vertical spread to container dimensions. Default true. */
  responsiveDensity?: boolean;
  /** Disable active motion and render static soft ambient glow. Default false (or OS prefers-reduced-motion). */
  reducedMotion?: boolean;
}

/** Pre-calibrated configuration for the "萤火" (Firefly / Bioluminescence) theme */
export const FIREFLY_VORTEX_PRESET = {
  baseHue: 120,          // Emerald lime glow
  rangeHue: 40,          // Chartreuse to cyan-green organic shift
  baseSpeed: 0.0,
  rangeSpeed: 1.2,       // Gentle organic floating drift
  baseRadius: 1.0,
  rangeRadius: 1.8,      // Delicate bioluminescent sparkles
  baseTTL: 60,
  rangeTTL: 160,
  backgroundColor: "#050805", // Deep nocturnal forest dark
} as const;

export const Vortex: React.FC<VortexProps> = ({
  children,
  className,
  containerClassName,
  particleCount: explicitParticleCount,
  rangeY: explicitRangeY,
  baseHue = 120,
  rangeHue = 40,
  baseSpeed = 0.0,
  rangeSpeed = 1.2,
  baseRadius = 1.0,
  rangeRadius = 1.8,
  baseTTL = 50,
  rangeTTL = 150,
  backgroundColor = "#000000",
  responsiveDensity = true,
  reducedMotion: explicitReducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // OS prefers-reduced-motion detection
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const isReduced = explicitReducedMotion ?? prefersReducedMotion;

  // Responsive density calculation helper
  const computeParameters = useCallback((width: number, height: number) => {
    let count = explicitParticleCount;
    let rY = explicitRangeY;

    if (responsiveDensity) {
      if (count === undefined) {
        if (height <= 360) {
          // Compact module / mobile card (e.g. 390x300): 25 ~ 45 particles
          const normalizedArea = (width * height) / (390 * 300);
          count = Math.round(Math.min(45, Math.max(25, 35 * Math.sqrt(normalizedArea))));
        } else {
          // Responsive section / full viewport (e.g. 768px ~ 1440px): 40 ~ 240 particles
          count = Math.round(Math.min(240, Math.max(40, 180 * (width / 1440))));
        }
      }

      if (rY === undefined) {
        // Height-bounded diffusion: ensure particles spawn inside container view
        rY = Math.round(Math.min(800, height * 0.75));
      }
    } else {
      count = count ?? 500;
      rY = rY ?? 800;
    }

    return {
      particleCount: Math.max(10, count),
      rangeY: Math.max(50, rY),
    };
  }, [explicitParticleCount, explicitRangeY, responsiveDensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let noise3D: (x: number, y: number, z: number) => number;
    try {
      noise3D = createNoise3D();
    } catch {
      noise3D = () => 0.5;
    }

    const TAU = 2 * Math.PI;
    const rand = (n: number) => n * Math.random();
    const randRange = (n: number) => n - rand(2 * n);
    const fadeInOut = (t: number, m: number) => {
      const hm = 0.5 * m;
      return Math.abs(((t + hm) % m) - hm) / hm;
    };
    const lerp = (n1: number, n2: number, speed: number) => (1 - speed) * n1 + speed * n2;

    const particlePropCount = 9;
    const noiseSteps = 3;
    const xOff = 0.00125;
    const yOff = 0.00125;
    const zOff = 0.0005;

    let tick = 0;
    let center: [number, number] = [0, 0];
    let currentParticleCount = 35;
    let currentRangeY = 220;
    let particleProps = new Float32Array(0);

    const initParticle = (i: number, w: number, _h: number, rY: number) => {
      const x = rand(w);
      const y = center[1] + randRange(rY);
      const vx = 0;
      const vy = 0;
      const life = 0;
      const ttl = baseTTL + rand(rangeTTL);
      const speed = baseSpeed + rand(rangeSpeed);
      const radius = baseRadius + rand(rangeRadius);
      const hue = baseHue + rand(rangeHue);
      particleProps.set([x, y, vx, vy, life, ttl, speed, radius, hue], i);
    };

    const initParticles = (w: number, h: number, count: number, rY: number) => {
      tick = 0;
      currentParticleCount = count;
      currentRangeY = rY;
      const totalLen = count * particlePropCount;
      particleProps = new Float32Array(totalLen);
      for (let i = 0; i < totalLen; i += particlePropCount) {
        initParticle(i, w, h, rY);
      }
    };

    const drawParticle = (
      x: number,
      y: number,
      x2: number,
      y2: number,
      life: number,
      ttl: number,
      radius: number,
      hue: number
    ) => {
      ctx.save();
      ctx.lineCap = "round";
      ctx.lineWidth = radius;
      ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${fadeInOut(life, ttl)})`;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.stroke();
      ctx.closePath();
      ctx.restore();
    };

    const updateParticle = (i: number, w: number, h: number, rY: number) => {
      const i2 = 1 + i, i3 = 2 + i, i4 = 3 + i, i5 = 4 + i;
      const i6 = 5 + i, i7 = 6 + i, i8 = 7 + i, i9 = 8 + i;

      const x = particleProps[i];
      const y = particleProps[i2];
      const n = noise3D(x * xOff, y * yOff, tick * zOff) * noiseSteps * TAU;
      const vx = lerp(particleProps[i3], Math.cos(n), 0.5);
      const vy = lerp(particleProps[i4], Math.sin(n), 0.5);
      let life = particleProps[i5];
      const ttl = particleProps[i6];
      const speed = particleProps[i7];
      const x2 = x + vx * speed;
      const y2 = y + vy * speed;
      const radius = particleProps[i8];
      const hue = particleProps[i9];

      drawParticle(x, y, x2, y2, life, ttl, radius, hue);

      life++;
      particleProps[i] = x2;
      particleProps[i2] = y2;
      particleProps[i3] = vx;
      particleProps[i4] = vy;
      particleProps[i5] = life;

      if (x > w || x < 0 || y > h || y < 0 || life > ttl) {
        initParticle(i, w, h, rY);
      }
    };

    // Reduced motion static fallback
    if (isReduced) {
      const w = container.clientWidth || 300;
      const h = container.clientHeight || 200;
      canvas.width = w;
      canvas.height = h;
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, w, h);

      // Render static soft glow points without animation
      ctx.save();
      const staticCount = 20;
      for (let i = 0; i < staticCount; i++) {
        const sx = rand(w);
        const sy = rand(h);
        const sRad = baseRadius + rand(rangeRadius);
        const sHue = baseHue + rand(rangeHue);
        ctx.fillStyle = `hsla(${sHue}, 80%, 65%, 0.35)`;
        ctx.beginPath();
        ctx.arc(sx, sy, sRad * 1.5, 0, TAU);
        ctx.fill();
      }
      ctx.restore();
      return;
    }

    // Normal continuous animation loop
    const render = () => {
      tick++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, w, h);

      const totalLen = currentParticleCount * particlePropCount;
      for (let i = 0; i < totalLen; i += particlePropCount) {
        updateParticle(i, w, h, currentRangeY);
      }

      // Two-tier bloom passes (lighter blend mode)
      ctx.save();
      ctx.filter = "blur(6px) brightness(200%)";
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();

      ctx.save();
      ctx.filter = "blur(3px) brightness(200%)";
      ctx.globalCompositeOperation = "lighter";
      ctx.drawImage(canvas, 0, 0);
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    // Throttled ResizeObserver for smooth resizing without context thrashing
    let resizeRaf = 0;
    const handleResize = () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeRaf = requestAnimationFrame(() => {
        const w = container.clientWidth || 300;
        const h = container.clientHeight || 200;
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          center = [0.5 * w, 0.5 * h];
          const params = computeParameters(w, h);
          initParticles(w, h, params.particleCount, params.rangeY);
        }
      });
    };

    const initialW = container.clientWidth || 300;
    const initialH = container.clientHeight || 200;
    canvas.width = initialW;
    canvas.height = initialH;
    center = [0.5 * initialW, 0.5 * initialH];
    const initialParams = computeParameters(initialW, initialH);
    initParticles(initialW, initialH, initialParams.particleCount, initialParams.rangeY);

    animId = requestAnimationFrame(render);

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      resizeObserver.disconnect();
    };
  }, [
    backgroundColor,
    baseHue,
    rangeHue,
    baseSpeed,
    rangeSpeed,
    baseRadius,
    rangeRadius,
    baseTTL,
    rangeTTL,
    computeParameters,
    isReduced,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full overflow-hidden", containerClassName)}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 z-0 block h-full w-full pointer-events-none"
      />
      {children && (
        <div className={cn("relative z-10 h-full w-full", className)}>
          {children}
        </div>
      )}
    </div>
  );
};

