"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

import { CanvasRevealEffect } from "./components/ui/canvas-reveal-effect";
import { storyChapters } from "./story-data";

const TRANSITION_SWAP_MS = 560;
const TRANSITION_END_MS = 1480;
const AUTOPLAY_MS = 5000;

export function CanvasRevealStorySlider() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);
  const [transitionKey, setTransitionKey] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPageHidden, setIsPageHidden] = useState(false);
  const [autoplayResetKey, setAutoplayResetKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const transitionTimers = useRef<number[]>([]);
  const prefersReducedMotion = useReducedMotion() ?? false;

  const clearTransitionTimers = useCallback(() => {
    transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
    transitionTimers.current = [];
  }, []);

  const goToChapter = useCallback(
    (nextIndex: number) => {
      if (
        nextIndex === activeIndex ||
        nextIndex < 0 ||
        nextIndex >= storyChapters.length ||
        isTransitioning
      ) {
        return;
      }

      clearTransitionTimers();

      if (prefersReducedMotion) {
        setActiveIndex(nextIndex);
        return;
      }

      setPendingIndex(nextIndex);
      setIsTransitioning(true);
      setTransitionKey((key) => key + 1);

      transitionTimers.current = [
        window.setTimeout(() => setActiveIndex(nextIndex), TRANSITION_SWAP_MS),
        window.setTimeout(() => {
          setPendingIndex(null);
          setIsTransitioning(false);
        }, TRANSITION_END_MS),
      ];
    },
    [activeIndex, clearTransitionTimers, isTransitioning, prefersReducedMotion],
  );

  const moveChapter = useCallback(
    (offset: number) => {
      const nextIndex =
        (activeIndex + offset + storyChapters.length) % storyChapters.length;
      goToChapter(nextIndex);
    },
    [activeIndex, goToChapter],
  );

  useEffect(() => clearTransitionTimers, [clearTransitionTimers]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsPageHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    if (
      prefersReducedMotion ||
      isPageHidden ||
      isTransitioning
    ) {
      return;
    }

    const timer = window.setTimeout(() => moveChapter(1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [
    activeIndex,
    isPageHidden,
    isTransitioning,
    moveChapter,
    prefersReducedMotion,
    autoplayResetKey,
  ]);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveChapter(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveChapter(1);
    }
  };

  const resetAutoplay = () => setAutoplayResetKey((key) => key + 1);

  const handleMouseEnter = () => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    resetAutoplay();
    moveChapter(1);
  };

  const handleSurfaceClick = (event: MouseEvent<HTMLElement>) => {
    if ((event.target as HTMLElement).closest("[data-story-control]")) return;
    resetAutoplay();
    moveChapter(1);
  };

  const chapter = storyChapters[activeIndex];
  const revealChapter =
    pendingIndex === null ? chapter : storyChapters[pendingIndex];
  const accentStyle = {
    "--chapter-accent": `rgb(${chapter.colors[0].join(" ")})`,
    "--reveal-a": `rgb(${revealChapter.colors[0].join(" ")} / 0.26)`,
    "--reveal-b": `rgb(${revealChapter.colors[1].join(" ")} / 0.18)`,
  } as CSSProperties;

  return (
      <section
        ref={sectionRef}
        className="story-slider"
        style={accentStyle}
        aria-roledescription="轮播"
        aria-label="旅行产品叙事场景"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onClick={handleSurfaceClick}
      >
        <div className="story-backgrounds" aria-hidden="true">
          {storyChapters.map((item, index) => (
            <img
              key={item.image}
              src={item.image}
              alt=""
              className={index === activeIndex ? "is-active" : ""}
            />
          ))}
        </div>

        <div className="story-shade" aria-hidden="true" />
        <div className="story-grain" aria-hidden="true" />

        <header className="story-header">
          <div className="story-brand">
            <span className="story-brand-mark" aria-hidden="true" />
            <span>旅途叙事模板</span>
          </div>
          <p className="story-count" aria-hidden="true">
            <span>0{activeIndex + 1}</span>
            <i />
            <span>0{storyChapters.length}</span>
          </p>
        </header>

        <div className="story-copy-wrap" aria-live="polite" aria-atomic="true">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeIndex}
              className="story-copy"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -18 }}
              transition={{ duration: prefersReducedMotion ? 0.16 : 0.42, ease: "easeOut" }}
            >
              <p className="story-eyebrow">{chapter.eyebrow}</p>
              <h2>
                {chapter.title.split("\n").map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </h2>
              <p className="story-description">{chapter.description}</p>
              <p className="story-detail">
                <span aria-hidden="true" />
                {chapter.detail}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="story-arrows">
          <button
            type="button"
            aria-label="上一幕"
            disabled={isTransitioning}
            data-story-control
            onClick={() => {
              resetAutoplay();
              moveChapter(-1);
            }}
          >
            <ArrowLeft />
          </button>
          <button
            type="button"
            aria-label="下一幕"
            disabled={isTransitioning}
            data-story-control
            onClick={() => {
              resetAutoplay();
              moveChapter(1);
            }}
          >
            <ArrowRight />
          </button>
        </div>

        <AnimatePresence>
          {pendingIndex !== null && !prefersReducedMotion && (
            <motion.div
              key={transitionKey}
              className="story-reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{
                duration: TRANSITION_END_MS / 1000,
                times: [0, 0.16, 0.7, 1],
                ease: "easeOut",
              }}
              aria-hidden="true"
            >
              <div className="story-reveal-wash" />
              <div className="story-reveal-canvas">
                <CanvasRevealEffect
                  animationSpeed={3.2}
                  containerClassName="bg-transparent"
                  colors={revealChapter.colors}
                  opacities={[0.18, 0.22, 0.28, 0.34, 0.4, 0.5, 0.62, 0.74, 0.86, 1]}
                  dotSize={2.4}
                  showGradient={false}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
  );
}

function ArrowLeft() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m15 18-6-6 6-6M9 12h11" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 6 6 6-6 6m6-6H4" />
    </svg>
  );
}
