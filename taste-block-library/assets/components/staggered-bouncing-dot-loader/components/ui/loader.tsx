"use client";
import { motion, useReducedMotion } from "motion/react";

export const LoaderOne = ({
  label = "正在加载...",
  className = "",
}: {
  label?: string;
  className?: string;
} = {}) => {
  const shouldReduceMotion = useReducedMotion();

  const transition = (x: number) => {
    return {
      duration: 1,
      repeat: Infinity,
      repeatType: "loop" as const,
      delay: x * 0.2,
      ease: "easeInOut" as const,
    };
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center gap-2 ${className}`.trim()}
    >
      <span className="sr-only">{label}</span>
      <motion.div
        initial={{
          y: 0,
        }}
        animate={
          shouldReduceMotion
            ? { y: 0 }
            : {
                y: [0, 10, 0],
              }
        }
        transition={shouldReduceMotion ? { duration: 0 } : transition(0)}
        className="h-4 w-4 rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300"
      />
      <motion.div
        initial={{
          y: 0,
        }}
        animate={
          shouldReduceMotion
            ? { y: 0 }
            : {
                y: [0, 10, 0],
              }
        }
        transition={shouldReduceMotion ? { duration: 0 } : transition(1)}
        className="h-4 w-4 rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300"
      />
      <motion.div
        initial={{
          y: 0,
        }}
        animate={
          shouldReduceMotion
            ? { y: 0 }
            : {
                y: [0, 10, 0],
              }
        }
        transition={shouldReduceMotion ? { duration: 0 } : transition(2)}
        className="h-4 w-4 rounded-full border border-neutral-300 bg-gradient-to-b from-neutral-400 to-neutral-300"
      />
    </div>
  );
};
