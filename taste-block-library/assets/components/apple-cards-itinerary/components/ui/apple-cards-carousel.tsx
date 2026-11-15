"use client";
import React, {
  useEffect,
  useRef,
  useState,
  createContext,
  useContext,
} from "react";
import {
  IconArrowNarrowLeft,
  IconArrowNarrowRight,
  IconX,
} from "@tabler/icons-react";
import { cn } from "../../../../shared/utils";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../../../shared/use-outside-click";

export interface ItineraryItem {
  dayBadge: string;
  destination: string;
  subtitle: string;
  tagline: string;
  src: string;
  summary: string;
  transport: {
    mode: string;
    detail: string;
  };
  stay: {
    hotel: string;
    roomType: string;
  };
  meals: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  highlights: string[];
  gallery: {
    src: string;
    caption: string;
  }[];
}

export type CardData = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => {},
  currentIndex: 0,
});

interface CarouselProps {
  items: React.ReactNode[];
  initialScroll?: number;
}

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -360, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 360, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const isMobile = window.innerWidth < 768;
      const cardWidth = isMobile ? 240 : 384;
      const gap = isMobile ? 16 : 24;
      const scrollPosition = (cardWidth + gap) * index;
      carouselRef.current.scrollTo({
        left: scrollPosition,
        behavior: "smooth",
      });
      setCurrentIndex(index);
    }
  };

  return (
    <CarouselContext.Provider
      value={{ onCardClose: handleCardClose, currentIndex }}
    >
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth pt-1 pb-3 md:pt-4 md:pb-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className="flex flex-row justify-start gap-4 pl-4 md:gap-6 md:pl-8 mx-auto max-w-7xl">
            {items.map((item, index) => (
              <motion.div
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.1 * index,
                    ease: "easeOut",
                  },
                }}
                key={"carousel-card-" + index}
                className="rounded-3xl shrink-0 last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 md:px-8 flex justify-end gap-2.5 pt-1 md:pt-2">
          <button
            className="group relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all duration-200"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Previous slide"
          >
            <IconArrowNarrowLeft className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </button>
          <button
            className="group relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-neutral-200 dark:hover:bg-neutral-700 active:scale-95 transition-all duration-200"
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Next slide"
          >
            <IconArrowNarrowRight className="h-5 w-5 text-neutral-700 dark:text-neutral-300" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({
  card,
  index,
  layout = false,
}: {
  card: CardData;
  index: number;
  layout?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);
  const previousOverflowRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) return;

    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflowRef.current ?? "";
      previousOverflowRef.current = null;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        onCardClose(index);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, index, onCardClose]);

  useOutsideClick(containerRef, () => {
    setOpen(false);
    onCardClose(index);
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            {/* Backdrop: translucent dark blur in Apple aesthetic */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-2xl"
              onClick={handleClose}
            />

            {/* Modal sheet - Apple physics spring */}
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 20 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-6 md:my-10 h-fit max-w-5xl rounded-3xl bg-white p-6 font-sans md:p-12 dark:bg-neutral-900 shadow-2xl"
            >
              {/* Close Button - Apple pill circle */}
              <button
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white text-white dark:text-black z-20 hover:opacity-80 active:scale-95 transition-all"
                onClick={handleClose}
                aria-label="Close dialog"
              >
                <IconX className="h-5 w-5" />
              </button>

              {/* Eyebrow / Category Tag - Pure Apple typography */}
              <motion.p
                layoutId={layout ? `category-${card.title}` : undefined}
                className="text-xs font-bold tracking-[0.2em] text-neutral-500 dark:text-neutral-400 md:text-sm uppercase"
              >
                {card.category}
              </motion.p>

              {/* Display Title */}
              <motion.h2
                layoutId={layout ? `title-${card.title}` : undefined}
                className="mt-2 text-2xl font-extrabold tracking-tighter text-neutral-900 md:text-5xl dark:text-white leading-tight"
              >
                {card.title}
              </motion.h2>

              {/* Main Expanded Content */}
              <div className="py-6 md:py-8">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Front Card - Apple proportion, active tactile feedback, pure transparency */}
      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="group relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-[34rem] md:w-96 text-left shadow-md active:scale-[0.97] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-hidden dark:bg-neutral-900"
      >
        {/* Subtle top half gradient: 100% transparent bottom ensures photography purity */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1/2 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />

        {/* Card Header Content: High contrast typography with drop shadow */}
        <div className="relative z-40 p-6 md:p-8">
          <motion.p
            layoutId={layout ? `category-${card.category}` : undefined}
            className="text-left font-sans text-xs md:text-sm font-bold tracking-[0.2em] text-white/80 uppercase"
          >
            {card.category}
          </motion.p>
          <motion.p
            layoutId={layout ? `title-${card.title}` : undefined}
            className="mt-2 max-w-xs text-left font-sans text-2xl md:text-4xl font-extrabold tracking-tight [text-wrap:balance] text-white leading-[1.15] drop-shadow-md"
          >
            {card.title}
          </motion.p>
        </div>

        {/* Card Image */}
        <BlurImage
          src={card.src}
          alt={card.title}
          className="absolute inset-0 z-10 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      </motion.button>
    </>
  );
};

export const BlurImage = ({
  src,
  className,
  alt,
}: {
  src: string;
  className?: string;
  alt?: string;
}) => {
  const [isLoading, setLoading] = useState(true);
  return (
    <img
      className={cn(
        "transition-all duration-500 ease-out",
        isLoading ? "scale-105 blur-md" : "scale-100 blur-0",
        className
      )}
      onLoad={() => setLoading(false)}
      src={src}
      loading="lazy"
      decoding="async"
      alt={alt || "行程图片"}
    />
  );
};
