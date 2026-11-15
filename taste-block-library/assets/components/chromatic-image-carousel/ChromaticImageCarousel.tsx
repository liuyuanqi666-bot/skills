import preview0 from "../../public/images/travel-landscape-svg/coast.svg";
import preview1 from "../../public/images/travel-landscape-svg/glacier.svg";
import preview2 from "../../public/images/travel-landscape-svg/green-hills.svg";
import preview3 from "../../public/images/travel-landscape-svg/stars.svg";
"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { ChromaticImage } from "./ChromaticImage";

export type CarouselProjectItem = {
  title: string;
  type: string;
  location: string;
  image: string;
};

export type ChromaticImageCarouselProps = {
  projects?: readonly CarouselProjectItem[];
  autoPlay?: boolean;
  autoPlayIntervalMs?: number;
  pauseOnHover?: boolean;
  className?: string;
};

export const DEFAULT_PROJECTS: readonly CarouselProjectItem[] = [
  {
    title: "Pacific Tides",
    type: "Editorial",
    location: "Oahu, US",
    image: preview0,
  },
  {
    title: "Altitude Study",
    type: "Landscape",
    location: "Dolomites, IT",
    image: preview1,
  },
  {
    title: "Signal No. 02",
    type: "Digital",
    location: "Studio archive",
    image: preview2,
  },
  {
    title: "Signal No. 03",
    type: "Digital",
    location: "Studio archive",
    image: preview3,
  },
];

export function ChromaticImageCarousel({
  projects = DEFAULT_PROJECTS,
  autoPlay = true,
  autoPlayIntervalMs = 3500,
  pauseOnHover = true,
  className = "",
}: ChromaticImageCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const move = useCallback((direction: number) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({
      left: direction * track.clientWidth * 0.72,
      behavior: "smooth",
    });
  }, []);

  const autoAdvance = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    if (track.scrollLeft >= maxScroll - 30) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else {
      move(1);
    }
  }, [move]);

  useEffect(() => {
    if (!autoPlay || (pauseOnHover && isHovered)) return;

    const timer = setInterval(() => {
      autoAdvance();
    }, autoPlayIntervalMs);

    return () => clearInterval(timer);
  }, [autoPlay, autoPlayIntervalMs, pauseOnHover, isHovered, autoAdvance]);

  return (
    <div className={`w-full overflow-hidden py-8 pl-6 text-neutral-950 dark:text-neutral-50 sm:py-10 sm:pl-8 ${className}`}>
      <div className="flex items-end justify-between gap-3 pr-6 sm:gap-6 sm:pr-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="font-mono text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
            Selected work
          </p>
          <h3 className="text-balance text-[clamp(1.125rem,4.6vw,1.375rem)] leading-tight font-medium tracking-tight sm:text-4xl">
            Spaces with a slower rhythm
          </h3>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            aria-label="Show previous projects"
            onClick={() => move(-1)}
            className="relative grid size-9 sm:size-10 place-items-center rounded-full ring-1 ring-black/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:ring-white/20 dark:focus-visible:outline-white hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 transition-transform"
          >
            <IconArrowLeft aria-hidden="true" className="size-6 shrink-0 stroke-neutral-950 dark:stroke-white" />
            <span className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label="Show next projects"
            onClick={() => move(1)}
            className="relative grid size-9 sm:size-10 place-items-center rounded-full bg-neutral-950 ring-1 ring-neutral-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 dark:bg-white dark:ring-white dark:focus-visible:outline-white hover:opacity-90 active:scale-95 transition-transform"
          >
            <IconArrowRight aria-hidden="true" className="size-6 shrink-0 stroke-white dark:stroke-neutral-950" />
            <span className="absolute top-1/2 left-1/2 size-[max(100%,3rem)] -translate-1/2 pointer-fine:hidden" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={() => setIsHovered(true)}
        onTouchEnd={() => setIsHovered(false)}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pt-8 no-scrollbar sm:gap-5"
      >
        {projects.map((project) => (
          <article
            key={project.title}
            className="flex min-w-[82%] snap-start flex-col gap-4 sm:min-w-[56%] lg:min-w-[42%]"
          >
            <ChromaticImage
              src={project.image}
              alt={`${project.title} visual project`}
              backgroundColor="#171717"
              zoom={0.12}
              displacement={0.032}
              chromaticShift={0.008}
              tilt={0.16}
              className="aspect-[4/5] rounded-[min(1vw,12px)] bg-neutral-100 outline-1 -outline-offset-1 outline-black/10 dark:bg-neutral-900 dark:outline-white/10"
            />
            <div className="flex items-start justify-between gap-5">
              <div className="flex min-w-0 flex-col gap-1">
                <h4 className="truncate text-xl font-medium">{project.title}</h4>
                <p className="text-base/7 text-neutral-500 dark:text-neutral-400 sm:text-sm/6">
                  {project.location}
                </p>
              </div>
              <p className="shrink-0 pt-1 font-mono text-sm tracking-wide text-neutral-500 dark:text-neutral-400">
                {project.type}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
