"use client";
import { motion, useReducedMotion } from "motion/react";

export const LoaderFive = ({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      role="status"
      aria-live="polite"
      className={`font-sans font-bold [--shadow-color:var(--color-neutral-500)] dark:[--shadow-color:var(--color-neutral-100)] ${className}`.trim()}
    >
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ scale: 1, opacity: 0.5 }}
          animate={
            shouldReduceMotion
              ? { scale: 1, opacity: 1 }
              : {
                  scale: [1, 1.1, 1],
                  textShadow: [
                    "0 0 0 var(--shadow-color)",
                    "0 0 1px var(--shadow-color)",
                    "0 0 0 var(--shadow-color)",
                  ],
                  opacity: [0.5, 1, 0.5],
                }
          }
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: i * 0.05,
                  ease: "easeInOut" as const,
                  repeatDelay: 2,
                }
          }
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </div>
  );
};
