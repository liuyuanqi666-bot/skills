import {
  IconPlane,
  IconBed,
  IconToolsKitchen2,
  IconMapPin,
  IconSparkles,
} from "@tabler/icons-react";
import type { ItineraryItem } from "./apple-cards-carousel";

interface ItineraryDetailContentProps {
  item: ItineraryItem;
}

export const ItineraryDetailContent = ({ item }: ItineraryDetailContentProps) => {
  return (
    <div className="space-y-8 font-sans">
      {/* 1. Tagline & Summary paragraph */}
      <div className="space-y-3">
        <p className="text-xs font-semibold tracking-wider text-neutral-400 uppercase">
          {item.tagline}
        </p>
        <p className="text-base md:text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
          {item.summary}
        </p>
      </div>

      {/* 2. Three Pillars: Transport, Stay, Meals (Apple-style Bento Info Blocks) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 交通 */}
        <div className="flex flex-col justify-start rounded-[1.5rem] bg-[#F5F5F7] dark:bg-neutral-800/70 p-5 md:p-6 border border-neutral-200/50 dark:border-neutral-700/50 space-y-3">
          <div className="flex items-center gap-2.5 text-neutral-900 dark:text-neutral-100 mb-1">
            <div className="h-8 w-8 rounded-full bg-white dark:bg-neutral-700 flex items-center justify-center shadow-xs shrink-0">
              <IconPlane className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
              交通安排
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">
              {item.transport.mode}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {item.transport.detail}
            </div>
          </div>
        </div>

        {/* 住宿 */}
        <div className="flex flex-col justify-start rounded-[1.5rem] bg-[#F5F5F7] dark:bg-neutral-800/70 p-5 md:p-6 border border-neutral-200/50 dark:border-neutral-700/50 space-y-3">
          <div className="flex items-center gap-2.5 text-neutral-900 dark:text-neutral-100 mb-1">
            <div className="h-8 w-8 rounded-full bg-white dark:bg-neutral-700 flex items-center justify-center shadow-xs shrink-0">
              <IconBed className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
              酒店住宿
            </span>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-semibold text-neutral-900 dark:text-white leading-snug">
              {item.stay.hotel}
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              {item.stay.roomType}
            </div>
          </div>
        </div>

        {/* 餐食 */}
        <div className="flex flex-col justify-start rounded-[1.5rem] bg-[#F5F5F7] dark:bg-neutral-800/70 p-5 md:p-6 border border-neutral-200/50 dark:border-neutral-700/50 space-y-3">
          <div className="flex items-center gap-2.5 text-neutral-900 dark:text-neutral-100 mb-1">
            <div className="h-8 w-8 rounded-full bg-white dark:bg-neutral-700 flex items-center justify-center shadow-xs shrink-0">
              <IconToolsKitchen2 className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            </div>
            <span className="text-xs font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
              三餐饮食
            </span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex items-start gap-2.5">
              <span className="w-5 shrink-0 text-neutral-400 font-medium">早</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-300 leading-snug">
                {item.meals.breakfast}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 shrink-0 text-neutral-400 font-medium">午</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-300 leading-snug">
                {item.meals.lunch}
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 shrink-0 text-neutral-400 font-medium">晚</span>
              <span className="font-medium text-neutral-700 dark:text-neutral-300 leading-snug">
                {item.meals.dinner}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Daily Highlights / Key selling points */}
      <div className="rounded-[1.5rem] bg-neutral-50 dark:bg-neutral-800/40 p-5 border border-neutral-200/50 dark:border-neutral-800">
        <div className="flex items-center gap-2 mb-3">
          <IconSparkles className="h-4 w-4 text-amber-500" />
          <span className="text-xs font-bold tracking-wider uppercase text-neutral-700 dark:text-neutral-300">
            当日亮点与深度体验
          </span>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs md:text-sm text-neutral-600 dark:text-neutral-400">
          {item.highlights.map((h, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-neutral-400 select-none">•</span>
              <span>{h}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 4. Multi-Image Gallery Grid (supports 1 to N images) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <IconMapPin className="h-4 w-4 text-neutral-400" />
          <span className="text-xs font-bold tracking-wider uppercase text-neutral-500 dark:text-neutral-400">
            实景画卷
          </span>
        </div>
        <div
          className={`grid gap-4 ${
            item.gallery.length === 1
              ? "grid-cols-1"
              : item.gallery.length === 2
              ? "grid-cols-1 sm:grid-cols-2"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
          }`}
        >
          {item.gallery.map((img, i) => (
            <figure key={i} className="group relative overflow-hidden rounded-[1.5rem] bg-neutral-100 dark:bg-neutral-800">
              <img
                src={img.src}
                alt={img.caption}
                className="h-48 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                loading="lazy"
              />
              <figcaption className="p-3 text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                {img.caption}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
};
