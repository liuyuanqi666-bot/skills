import { TracingNarrativeContent } from "./TracingNarrativeContent";
"use client";
import { TracingBeam } from "./ui/tracing-beam";
import { cn } from "../../../shared/utils";
import { defaultNarrativeItems, type NarrativeItem } from "../story-data";

export interface TracingNarrativeShowcaseProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  items?: NarrativeItem[];
  className?: string;
  reachBottom?: boolean;
}

export function TracingNarrativeShowcase({
  eyebrow = "精选探索 · 4日自然慢游",
  title = "行止随心 · 自然探索与私享旅程",
  description = "沿途山谷、密林、冰川与海角的自然叙事，随着指引光束轻柔流淌。适配景点导览、活动项目与精品短途行程。",
  items = defaultNarrativeItems,
  className,
  reachBottom = true,
}: TracingNarrativeShowcaseProps) {
  return (
    <section
      className={cn(
        "relative w-full py-16 md:py-24 bg-white text-neutral-900 dark:bg-zinc-950 dark:text-zinc-100 transition-colors duration-200",
        className
      )}
    >
      {/* Header Composition */}
      <div className="max-w-4xl mx-auto px-6 mb-12 md:mb-16 text-center">
        {eyebrow && (
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-semibold tracking-wide uppercase bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 mb-4">
            {eyebrow}
          </div>
        )}
        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
          {title}
        </h2>
        {description && (
          <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* Tracing Beam Timeline */}
      <TracingBeam className="px-6" reachBottom={reachBottom}>
        <TracingNarrativeContent items={items} />
      </TracingBeam>
    </section>
  );
}
