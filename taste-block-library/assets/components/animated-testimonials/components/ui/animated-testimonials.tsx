"use client";

import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState, useId } from "react";

export type Testimonial = {
  quote: string;
  name: string;
  designation: string;
  src: string;
};

export const AnimatedTestimonials = ({
  testimonials,
  autoplay = false,
  autoplayInterval = 3000,
  className,
}: {
  testimonials: Testimonial[];
  autoplay?: boolean;
  autoplayInterval?: number;
  className?: string;
}) => {
  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const isActive = (index: number) => {
    return index === active;
  };

  useEffect(() => {
    if (autoplay && !isHovered && testimonials.length > 1) {
      const interval = setInterval(handleNext, autoplayInterval);
      return () => clearInterval(interval);
    }
  }, [autoplay, isHovered, autoplayInterval, testimonials.length]);

  // Deterministic pseudo-random rotation based on index to preserve official Aceternity [-10, 10] tilt
  // while preventing jittering on non-active cards during state updates
  const getRotateY = (index: number) => {
    const fixedAngles = [-7, 6, -4, 8, -9, 5, -8, 7];
    return fixedAngles[index % fixedAngles.length];
  };

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  // Tokenize quote losslessly: use Intl.Segmenter when available, or a full-character lossless regex fallback
  const currentQuote = testimonials[active]?.quote || "";
  const words = (() => {
    if (!currentQuote) return [];
    type SegmenterConstructor = new (
      locale?: string,
      options?: { granularity?: "grapheme" | "word" | "sentence" }
    ) => {
      segment: (input: string) => Iterable<{ segment: string }>;
    };
    const intlCandidate = Intl as unknown as { Segmenter?: SegmenterConstructor };
    if (typeof intlCandidate.Segmenter === "function") {
      try {
        const segmenter = new intlCandidate.Segmenter(undefined, { granularity: "word" });
        return Array.from(segmenter.segment(currentQuote)).map((item) => item.segment);
      } catch {
        // fallback
      }
    }
    return currentQuote.match(/[\u4e00-\u9fa5]{1,2}|[a-zA-Z0-9]+|\s+|[^\s\w]/g) || [currentQuote];
  })();

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`mx-auto w-full max-w-sm px-4 py-4 font-sans antialiased md:max-w-5xl md:px-6 md:py-6 lg:px-8 ${className || ""}`}
    >
      <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-16 lg:gap-20">
        <div>
          <div className="relative h-80 w-full md:h-96">
            <AnimatePresence>
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.src + index}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    z: -100,
                    rotate: getRotateY(index),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    z: isActive(index) ? 0 : -100,
                    rotate: isActive(index) ? 0 : getRotateY(index),
                    zIndex: isActive(index)
                      ? 40
                      : testimonials.length + 2 - index,
                    y: isActive(index) ? [0, -80, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    z: 100,
                    rotate: getRotateY(index),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={testimonial.src}
                    alt={testimonial.name}
                    width={600}
                    height={600}
                    draggable={false}
                    className="h-full w-full rounded-3xl object-cover object-center shadow-2xl shadow-black/10"
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="flex flex-col justify-between pt-4 pb-2 md:pt-10 md:pb-4 lg:pt-12">
          <motion.div
            key={active}
            initial={{
              y: 20,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: -20,
              opacity: 0,
            }}
            transition={{
              duration: 0.2,
              ease: "easeInOut",
            }}
          >
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-white">
              {testimonials[active].name}
            </h3>
            <p className="mt-1 text-sm font-medium tracking-wide text-emerald-700 md:text-base dark:text-emerald-400">
              {testimonials[active].designation}
            </p>
            <motion.p className="mt-6 text-base leading-relaxed text-slate-600 md:mt-8 md:text-lg dark:text-neutral-300">
              {words.map((word, index) => {
                if (/^\s+$/.test(word)) {
                  return <span key={index} className="inline-block">&nbsp;</span>;
                }
                return (
                  <motion.span
                    key={index}
                    initial={{
                      filter: "blur(10px)",
                      opacity: 0,
                      y: 5,
                    }}
                    animate={{
                      filter: "blur(0px)",
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut",
                      delay: 0.015 * Math.min(index, 40),
                    }}
                    className="inline-block"
                  >
                    {word}
                  </motion.span>
                );
              })}
            </motion.p>
          </motion.div>
          <div className="flex items-center gap-4 pt-8 md:pt-0">
            <button
              onClick={handlePrev}
              aria-label="Previous narrative"
              className="group/button flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 active:scale-95 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <IconArrowLeft className="h-5 w-5 text-slate-800 transition-transform duration-300 group-hover/button:-translate-x-0.5 group-hover/button:rotate-12 dark:text-neutral-300" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next narrative"
              className="group/button flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 transition-colors hover:bg-slate-200 active:scale-95 dark:bg-neutral-800 dark:hover:bg-neutral-700"
            >
              <IconArrowRight className="h-5 w-5 text-slate-800 transition-transform duration-300 group-hover/button:translate-x-0.5 group-hover/button:-rotate-12 dark:text-neutral-300" />
            </button>
            <span className="ml-2 text-xs font-semibold tabular-nums text-slate-400">
              0{active + 1} / 0{testimonials.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
