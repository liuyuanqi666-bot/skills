"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

interface StarProps {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  baseOpacity: number;
  twinkleSpeed: number | null;
}

export interface StarsBackgroundProps {
  /** Star count density factor per pixel squared (default: 0.0002) */
  starDensity?: number;
  /** Whether all stars twinkle (default: true) */
  allStarsTwinkle?: boolean;
  /** Probability of a star having twinkle animation if not allStarsTwinkle (default: 0.7) */
  twinkleProbability?: number;
  /** Minimum twinkle cycle period in seconds (default: 0.5) */
  minTwinkleSpeed?: number;
  /** Maximum twinkle cycle period in seconds (default: 1.2) */
  maxTwinkleSpeed?: number;
  /** Optional canvas class names */
  className?: string;
}

export const StarsBackground: React.FC<StarsBackgroundProps> = ({
  starDensity = 0.0002,
  allStarsTwinkle = true,
  twinkleProbability = 0.7,
  minTwinkleSpeed = 0.5,
  maxTwinkleSpeed = 1.2,
  className = "",
}) => {
  const [stars, setStars] = useState<StarProps[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateStars = useCallback(
    (width: number, height: number): StarProps[] => {
      const area = width * height;
      const numStars = Math.floor(area * starDensity);
      return Array.from({ length: numStars }, () => {
        const shouldTwinkle =
          allStarsTwinkle || Math.random() < twinkleProbability;
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          radius: Math.random() * 0.55 + 0.35,
          opacity: Math.random() * 0.45 + 0.35,
          baseOpacity: Math.random() * 0.35 + 0.35,
          twinkleSpeed: shouldTwinkle
            ? minTwinkleSpeed + Math.random() * (maxTwinkleSpeed - minTwinkleSpeed)
            : null,
        };
      });
    },
    [starDensity, allStarsTwinkle, twinkleProbability, minTwinkleSpeed, maxTwinkleSpeed]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      setStars(generateStars(width, height));
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(canvas);

    return () => observer.disconnect();
  }, [generateStars]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frameId: number;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
      const now = Date.now() * 0.001;

      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        let opacity = star.opacity;
        if (star.twinkleSpeed !== null) {
          opacity = star.baseOpacity + Math.abs(Math.sin(now / star.twinkleSpeed) * 0.4);
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.fill();
      });

      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [stars]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`h-full w-full absolute inset-0 pointer-events-none ${className}`}
    />
  );
};
