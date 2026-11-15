"use client";
import React, { useEffect, useState, useRef, useCallback, useId } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface CardStackItem {
  id: string | number;
  content: React.ReactNode;
  name?: string;
  designation?: string;
  badge?: string;
  image?: string;
  tag?: string;
  rating?: string;
  [key: string]: any;
}

export interface CardStackProps {
  items: CardStackItem[];
  offset?: number;
  scaleFactor?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  clickToAdvance?: boolean;
  className?: string;
  cardClassName?: string;
  onCardChange?: (activeCard: CardStackItem, index: number) => void;
}

export const CardStack: React.FC<CardStackProps> = ({
  items,
  offset = 10,
  scaleFactor = 0.06,
  autoplay = true,
  autoplayInterval = 5000,
  clickToAdvance = true,
  className,
  cardClassName,
  onCardChange,
}) => {
  const instanceId = useId();
  const stackRef = useRef<HTMLDivElement>(null);
  const [stackHeight, setStackHeight] = useState(350);
  const [cards, setCards] = useState<CardStackItem[]>(items);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCards(items);
  }, [items]);

  useEffect(() => {
    const host = stackRef.current;
    if (!host) return;
    const measure = () => {
      const top = host.querySelector<HTMLElement>('[data-stack-index="0"]');
      setStackHeight(top?.offsetHeight || 0);
    };
    const observer = new ResizeObserver(measure);
    host.querySelectorAll('[data-stack-index]').forEach(card => observer.observe(card));
    measure();
    return () => observer.disconnect();
  }, [cards]);

  const advanceCard = useCallback(() => {
    setCards((prevCards) => {
      if (prevCards.length <= 1) return prevCards;
      const newArray = [...prevCards];
      const last = newArray.pop()!;
      newArray.unshift(last);
      if (onCardChange) {
        onCardChange(newArray[0], 0);
      }
      return newArray;
    });
  }, [onCardChange]);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (autoplay && !isPaused && cards.length > 1) {
      timerRef.current = setInterval(() => {
        advanceCard();
      }, autoplayInterval);
    }
  }, [autoplay, isPaused, cards.length, autoplayInterval, advanceCard]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [resetTimer]);

  const handleCardClick = (index: number) => {
    if (!clickToAdvance) return;
    if (index === 0) {
      advanceCard();
      resetTimer();
    }
  };

  return (
    <div
      className={cn(
        "relative w-full flex items-center justify-center select-none",
        className
      )}
      style={{ paddingTop: Math.min(Math.max(cards.length - 1, 0), 2) * offset }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Interactive Card Deck"
    >
      <div ref={stackRef} style={{ height: stackHeight }} className="relative w-full max-w-sm flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {cards.map((card, index) => {
            const maxVisible = 3;
            const isTop = index === 0;
            const isVisible = index < maxVisible;
            const visualIndex = Math.min(index, maxVisible - 1);
            const topOffset = -visualIndex * offset;
            const scale = 1 - visualIndex * scaleFactor;
            const zIndex = isVisible ? (maxVisible - visualIndex) : 0;
            const opacity = isVisible ? 1 : 0;

            return (
              <motion.div
                key={card.id}
                data-stack-index={index}
                layoutId={`${instanceId}-card-${card.id}`}
                className={cn(
                  "absolute w-[285px] sm:w-[335px] md:w-[360px] max-w-[calc(100vw-3rem)]",
                  "rounded-3xl p-5 bg-white dark:bg-zinc-900 border border-neutral-200 dark:border-zinc-800",
                  "shadow-xl shadow-black/[0.08] dark:shadow-white/[0.05]",
                  "flex flex-col justify-between",
                  isTop ? "cursor-pointer hover:shadow-2xl" : "pointer-events-none",
                  cardClassName
                )}
                style={{
                  originX: 0.5,
                  originY: 0,
                  top: topOffset,
                  zIndex,
                }}
                initial={{ scale, y: 15, opacity: 0 }}
                animate={{
                  scale,
                  y: 0,
                  opacity,
                  top: topOffset,
                  zIndex,
                }}
                exit={{ scale: 0.9, y: -15, opacity: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                  mass: 0.8,
                }}
                onClick={() => handleCardClick(index)}
                role="group"
                aria-roledescription="slide"
                aria-label={card.name || `Card ${index + 1}`}
                tabIndex={isTop ? 0 : -1}
                onKeyDown={(e) => {
                  if (isTop && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    advanceCard();
                    resetTimer();
                  }
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  {card.tag && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                      {card.tag}
                    </span>
                  )}
                  {card.rating && (
                    <div className="flex items-center space-x-1 text-amber-500 text-xs">
                      <span>★★★★★</span>
                      <span className="text-[10px] text-slate-400 font-semibold ml-0.5">{card.rating}</span>
                    </div>
                  )}
                </div>

                {/* Optional Media Frame */}
                {card.image && (
                  <div className="w-full h-32 sm:h-36 rounded-2xl overflow-hidden mb-2.5 bg-slate-100 relative">
                    <img
                      src={card.image}
                      alt={card.name || "Card media"}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                {/* Card Primary Content */}
                <div className="text-xs text-slate-600 dark:text-zinc-300 leading-relaxed font-normal mb-3">
                  {card.content}
                </div>

                {/* Card Footer */}
                <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                  <div>
                    {card.name && (
                      <p className="text-slate-900 dark:text-zinc-100 font-semibold text-xs tracking-tight">
                        {card.name}
                      </p>
                    )}
                    {card.designation && (
                      <p className="text-slate-400 dark:text-zinc-500 font-normal text-[11px]">
                        {card.designation}
                      </p>
                    )}
                  </div>
                  {card.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 border border-slate-200/60">
                      {card.badge}
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

