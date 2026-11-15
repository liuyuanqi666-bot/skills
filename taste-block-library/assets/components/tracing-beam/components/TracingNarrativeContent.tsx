import { defaultNarrativeItems, type NarrativeItem } from "../story-data";

export function TracingNarrativeContent({ items = defaultNarrativeItems }: { items?: NarrativeItem[] }) {
  return (
        <div className="max-w-2xl mx-auto antialiased relative pt-2">
          {items.map((item, index) => (
            <article
              key={item.id || `narrative-item-${index}`}
              className="mb-16 last:mb-6"
            >
              {/* Badge & Meta */}
              <div className="flex items-center gap-3 mb-4">
                <span className="bg-black dark:bg-white text-white dark:text-black font-semibold text-xs rounded-full px-3.5 py-1 shadow-xs">
                  {item.badge}
                </span>
                {item.tag && (
                  <span className="text-xs text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-800 rounded-full px-2.5 py-0.5">
                    {item.tag}
                  </span>
                )}
              </div>

              {/* Title */}
              <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-4">
                {item.title}
              </h3>

              {/* Media Card */}
              {item.image && (
                <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-md mb-6 aspect-[16/10] bg-neutral-100 dark:bg-neutral-900">
                  <img
                    src={item.image}
                    alt={item.imageAlt || item.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}

              {/* Narrative Content */}
              <div className="space-y-3 text-sm md:text-base text-neutral-600 dark:text-neutral-400 leading-relaxed">
                {item.summary && (
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">
                    {item.summary}
                  </p>
                )}
                <p>{item.description}</p>
              </div>
            </article>
          ))}
        </div>
  );
}
