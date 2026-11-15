"use client";

import { cn } from "../../../../shared/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";

export interface ImagesSliderProps {
  images: string[];
  children?: ReactNode;
  overlay?: boolean;
  overlayClassName?: string;
  className?: string;
  imageClassName?: string;
  autoplay?: boolean;
  direction?: "up" | "down";
}

export function ImagesSlider({
  images,
  children,
  overlay = true,
  overlayClassName,
  className,
  imageClassName,
  autoplay = true,
  direction = "up",
}: ImagesSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    let active = true;
    const pendingImages = images.map(
      (image) =>
        new Promise<string>((resolve, reject) => {
          const img = new Image();
          img.src = image;
          img.onload = () => resolve(image);
          img.onerror = reject;
        }),
    );

    Promise.all(pendingImages)
      .then((resolvedImages) => {
        if (active) {
          setLoadedImages(resolvedImages);
          setCurrentIndex(0);
        }
      })
      .catch((error: unknown) => {
        console.error("Failed to load images", error);
      });

    return () => {
      active = false;
    };
  }, [images]);

  useEffect(() => {
    if (!autoplay || loadedImages.length < 2 || reduceMotion) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((previousIndex) =>
        previousIndex + 1 === loadedImages.length ? 0 : previousIndex + 1,
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [autoplay, loadedImages.length, reduceMotion]);

  if (loadedImages.length === 0) {
    return <div className={cn("relative h-full w-full bg-slider-background", className)} />;
  }

  const slideVariants = reduceMotion
    ? {
        initial: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0 } },
        upExit: { opacity: 0, transition: { duration: 0 } },
        downExit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        initial: { scale: 0, opacity: 0, rotateX: 45 },
        visible: {
          scale: 1,
          rotateX: 0,
          opacity: 1,
          transition: {
            duration: 0.5,
            ease: [0.645, 0.045, 0.355, 1] as const,
          },
        },
        upExit: {
          opacity: 1,
          transform: "translateY(-150%)",
          transition: { duration: 1 },
        },
        downExit: {
          opacity: 1,
          transform: "translateY(150%)",
          transition: { duration: 1 },
        },
      };

  return (
    <div
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        className,
      )}
      style={{ perspective: "1000px" }}
    >
      <AnimatePresence initial={false}>
        <motion.img
          key={currentIndex}
          src={loadedImages[currentIndex]}
          alt=""
          aria-hidden="true"
          initial="initial"
          animate="visible"
          exit={direction === "up" ? "upExit" : "downExit"}
          variants={slideVariants}
          className={cn(
            "absolute inset-0 h-full w-full object-cover object-center",
            imageClassName,
          )}
        />
      </AnimatePresence>
      {overlay && (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0 z-10 bg-black/50", overlayClassName)}
        />
      )}
      {children}
    </div>
  );
}
