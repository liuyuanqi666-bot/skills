"use client";
import React, { useEffect, useState, useRef, useId } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

export interface ShootingStarsProps {
  /** Comet head bright color (default: "#FFFFFF") */
  starColor?: string;
  /** Comet trail gradient fading color (default: "#93C5FD") */
  trailColor?: string;
  /** Minimum movement speed in px/frame at 60Hz (default: 5) */
  minSpeed?: number;
  /** Maximum movement speed in px/frame at 60Hz (default: 11) */
  maxSpeed?: number;
  /** Minimum spawn delay interval in milliseconds (default: 1800) */
  minDelay?: number;
  /** Maximum spawn delay interval in milliseconds (default: 3800) */
  maxDelay?: number;
  /** Maximum concurrent shooting stars in flight (default: 2) */
  maxStars?: number;
  /** Base width of the meteor head before scaling (default: 12) */
  starWidth?: number;
  /** Stroke thickness of the meteor in pixels (default: 1.2) */
  starHeight?: number;
  /** Optional container class names */
  className?: string;
}

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  starColor = "#FFFFFF",
  trailColor = "#93C5FD",
  minSpeed = 5,
  maxSpeed = 11,
  minDelay = 1800,
  maxDelay = 3800,
  maxStars = 2,
  starWidth = 12,
  starHeight = 1.2,
  className = "",
}) => {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const gradientId = useId();

  const getNaturalSpawn = () => {
    const rect = svgRef.current?.getBoundingClientRect() || {
      width: window.innerWidth,
      height: window.innerHeight,
    };
    const { width: w, height: h } = rect;

    const angle = Math.random() * 12 + 40;
    let startX = 0;
    let startY = 0;

    if (Math.random() < 0.7) {
      startX = Math.random() * (w * 0.8);
      startY = -10;
    } else {
      startX = -10;
      startY = Math.random() * (h * 0.35);
    }

    return { x: startX, y: startY, angle };
  };

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleStar = () => {
      setStars((prev) => {
        if (prev.length >= maxStars) return prev;
        const { x, y, angle } = getNaturalSpawn();
        const newStar: ShootingStar = {
          id: Date.now() + Math.random(),
          x,
          y,
          angle,
          scale: 1,
          speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
          distance: 0,
        };
        return [...prev, newStar];
      });

      const delay = Math.random() * (maxDelay - minDelay) + minDelay;
      timeoutId = setTimeout(scheduleStar, delay);
    };

    scheduleStar();
    return () => clearTimeout(timeoutId);
  }, [minSpeed, maxSpeed, minDelay, maxDelay, maxStars]);

  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - lastTime;
      lastTime = now;
      const dt = Math.min(elapsed / 16.667, 2.5);

      setStars((prevStars) => {
        if (prevStars.length === 0) return prevStars;
        const rect = svgRef.current?.getBoundingClientRect();
        const w = rect?.width ?? window.innerWidth;
        const h = rect?.height ?? window.innerHeight;

        return prevStars
          .map((star) => {
            const rad = (star.angle * Math.PI) / 180;
            const step = star.speed * dt;
            const newX = star.x + step * Math.cos(rad);
            const newY = star.y + step * Math.sin(rad);
            const newDistance = star.distance + step;
            const newScale = 1 + newDistance / 130;

            if (newX < -40 || newX > w + 40 || newY < -40 || newY > h + 40) {
              return null;
            }
            return {
              ...star,
              x: newX,
              y: newY,
              distance: newDistance,
              scale: newScale,
            };
          })
          .filter(Boolean) as ShootingStar[];
      });

      animationFrame = requestAnimationFrame(tick);
    };

    animationFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <svg
      ref={svgRef}
      aria-hidden="true"
      className={`w-full h-full absolute inset-0 pointer-events-none overflow-hidden ${className}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop offset="100%" style={{ stopColor: starColor, stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      {stars.map((star) => {
        const width = starWidth * star.scale;
        const cx = star.x + width / 2;
        const cy = star.y + starHeight / 2;
        return (
          <rect
            key={star.id}
            x={star.x}
            y={star.y}
            width={width}
            height={starHeight}
            fill={`url(#${gradientId})`}
            transform={`rotate(${star.angle}, ${cx}, ${cy})`}
          />
        );
      })}
    </svg>
  );
};
