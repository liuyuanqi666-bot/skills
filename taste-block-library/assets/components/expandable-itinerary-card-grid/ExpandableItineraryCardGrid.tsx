import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

export type ExtendableItineraryDay = {
  id: string;
  day: string;
  title: string;
  route: string;
  image: string;
  tags: readonly string[];
  paragraphs: readonly string[];
  highlight: string;
  transport: string;
  meals: string;
  hotel: string;
};

export type ExpandableItineraryCardGridProps = {
  items: readonly ExtendableItineraryDay[];
  desktopPageSize?: number;
  className?: string;
  reducedMotion?: boolean;
};

const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const EASE_IN_OUT = [0.77, 0, 0.175, 1] as const;

function useMediaQuery(queryText: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(queryText);
    const update = () => setMatches(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [queryText]);

  return matches;
}

function ItineraryImage({ item, className }: { item: ExtendableItineraryDay; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={`extendable-image-fallback${className ? ` ${className}` : ""}`}>图片暂不可用</div>;
  }

  return (
    <img
      className={className}
      src={item.image}
      alt=""
      width="720"
      height="423"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}
export function parseDay(day: string | number) {
  const num = typeof day === "number" ? day : parseInt(String(day).replace(/\D/g, ""), 10) || 1;
  return {
    num,
    chip: `D${num}`,
    mark: String(num).padStart(2, "0"),
  };
}

function DayMark({ day }: { day: string | number }) {
  const { mark } = parseDay(day);
  return (
    <span className="extendable-day-mark">
      <small>DAY</small>
      <strong>{mark}</strong>
    </span>
  );
}

function CompactCard({
  item,
  onOpen,
  setTrigger,
  mobile = false,
}: {
  item: ExtendableItineraryDay;
  onOpen: (item: ExtendableItineraryDay, trigger: HTMLButtonElement) => void;
  setTrigger: (node: HTMLButtonElement | null) => void;
  mobile?: boolean;
}) {
  return (
    <motion.button
      ref={setTrigger}
      type="button"
      layout="position"
      layoutId={`extendable-card-${item.id}`}
      className={`extendable-compact-card${mobile ? " is-mobile" : ""}`}
      onClick={(event) => onOpen(item, event.currentTarget)}
      transition={{ type: "spring", duration: 0.5, bounce: 0.1 }}
      aria-label={`第 ${parseDay(item.day).num} 天，${item.title}，点击查看详细行程`}
    >
      <div className="extendable-compact-media">
        <ItineraryImage item={item} />
        <span className="extendable-compact-shade" />
        <DayMark day={item.day} />
      </div>
      <span className="extendable-compact-copy">
        <strong>{item.title}</strong>
        <small>{item.route}</small>
      </span>
    </motion.button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="extendable-detail-row">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function ExpandedCard({
  item,
  sourceWidth,
  onClose,
  shouldReduceMotion,
}: {
  item: ExtendableItineraryDay;
  sourceWidth: number;
  onClose: () => void;
  shouldReduceMotion: boolean;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => closeRef.current?.focus(), shouldReduceMotion ? 0 : 260);
    return () => window.clearTimeout(timer);
  }, [shouldReduceMotion]);

  return (
    <motion.div
      className="extendable-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: shouldReduceMotion ? 0.12 : 0.2, ease: EASE_OUT }}
      onClick={onClose}
    >
      <motion.article
        layout="position"
        layoutId={`extendable-card-${item.id}`}
        className="extendable-expanded-card"
        style={{ width: sourceWidth, maxWidth: "calc(100vw - 32px)" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`extendable-title-${item.id}`}
        onClick={(event: ReactMouseEvent) => event.stopPropagation()}
        transition={
          shouldReduceMotion
            ? { duration: 0.12 }
            : { type: "spring", duration: 0.5, bounce: 0.1 }
        }
      >
        <div className="extendable-expanded-hero">
          <ItineraryImage item={item} />
          <span className="extendable-expanded-shade" />
          <DayMark day={item.day} />
          <button ref={closeRef} type="button" className="extendable-close" onClick={onClose} aria-label="关闭详细行程">
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="extendable-expanded-body">
          <div className="extendable-expanded-copy">
            <h2 id={`extendable-title-${item.id}`}>{item.title}</h2>
            <p>{item.route}</p>
          </div>
          <motion.div
            className="extendable-details-reveal"
            initial={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: shouldReduceMotion ? 0.12 : 0.42, delay: shouldReduceMotion ? 0 : 0.05, ease: EASE_OUT }}
          >
            <div className="extendable-details-scroll">
              <div className="extendable-tag-list">
                {item.tags.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
              <div className="extendable-description">
                {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                <blockquote>{item.highlight}</blockquote>
              </div>
              <div className="extendable-detail-list">
                <DetailRow label="交通" value={item.transport} />
                <DetailRow label="餐饮" value={item.meals} />
                <DetailRow label="住宿" value={item.hotel} />
              </div>
            </div>
          </motion.div>
        </div>
      </motion.article>
    </motion.div>
  );
}

export function ExpandableItineraryCardGrid({
  items,
  desktopPageSize = 4,
  className,
  reducedMotion: reducedMotionOverride,
}: ExpandableItineraryCardGridProps) {
  const isMobile = useMediaQuery("(max-width: 700px)");
  const osReducedMotion = Boolean(useReducedMotion());
  const reducedMotion = reducedMotionOverride ?? osReducedMotion;
  const [selected, setSelected] = useState<ExtendableItineraryDay | null>(null);
  const [selectedWidth, setSelectedWidth] = useState(0);
  const [desktopPage, setDesktopPage] = useState(0);
  const [pageDirection, setPageDirection] = useState<1 | -1>(1);
  const [activeMobileId, setActiveMobileId] = useState(items[0]?.id ?? "");
  const triggerRefs = useRef(new Map<string, HTMLButtonElement>());
  const activeTrigger = useRef<HTMLButtonElement | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const chipRailRef = useRef<HTMLDivElement>(null);
  const scrollSuppressTimer = useRef<number | null>(null);
  const suppressMobileOpen = useRef(false);
  const safePageSize = Math.max(1, desktopPageSize);
  const pageCount = Math.max(1, Math.ceil(items.length / safePageSize));
  const pageItems = useMemo(
    () => items.slice(desktopPage * safePageSize, desktopPage * safePageSize + safePageSize),
    [desktopPage, items, safePageSize],
  );

  useEffect(() => {
    if (desktopPage >= pageCount) setDesktopPage(pageCount - 1);
  }, [desktopPage, pageCount]);

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selected]);

  useEffect(() => {
    if (!isMobile || !carouselRef.current) return;
    const root = carouselRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target instanceof HTMLElement) setActiveMobileId(visible.target.dataset.itemId ?? "");
      },
      { root, threshold: [0.55, 0.75, 0.95] },
    );
    root.querySelectorAll<HTMLElement>("[data-item-id]").forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [isMobile, items]);

  useEffect(() => {
    if (!isMobile || !activeMobileId || !chipRailRef.current) return;
    const chip = chipRailRef.current.querySelector<HTMLElement>(`[data-chip-id="${activeMobileId}"]`);
    chip?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", inline: "center", block: "nearest" });
  }, [activeMobileId, isMobile, reducedMotion]);

  useEffect(() => () => {
    if (scrollSuppressTimer.current !== null) window.clearTimeout(scrollSuppressTimer.current);
  }, []);

  const openCard = useCallback((item: ExtendableItineraryDay, trigger: HTMLButtonElement) => {
    if (isMobile && suppressMobileOpen.current) return;
    activeTrigger.current = trigger;
    setSelectedWidth(trigger.getBoundingClientRect().width);
    setSelected(item);
  }, [isMobile]);

  const closeCard = useCallback(() => {
    setSelected(null);
    window.setTimeout(() => activeTrigger.current?.focus(), reducedMotion ? 0 : 260);
  }, [reducedMotion]);

  const movePage = (direction: 1 | -1) => {
    setPageDirection(direction);
    setDesktopPage((current) => Math.min(pageCount - 1, Math.max(0, current + direction)));
  };

  const moveMobile = (id: string) => {
    const node = triggerRefs.current.get(id);
    const rail = carouselRef.current;
    if (!node || !rail) return;
    const left = node.offsetLeft - (rail.clientWidth - node.clientWidth) / 2;
    rail.scrollTo({ left, behavior: reducedMotion ? "auto" : "smooth" });
  };

  if (items.length === 0) {
    return <div className="extendable-empty" role="status">暂无可展示的行程。</div>;
  }

  return (
    <LayoutGroup>
      <section className={`extendable-itinerary${className ? ` ${className}` : ""}`} aria-label="每日行程卡片">
        {isMobile ? (
          <>
            <div ref={chipRailRef} className="extendable-day-rail" aria-label="选择行程天数">
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  data-chip-id={item.id}
                  className={activeMobileId === item.id ? "is-active" : ""}
                  onClick={() => moveMobile(item.id)}
                >
                  {parseDay(item.day).chip}
                </button>
              ))}
            </div>
            <div
              ref={carouselRef}
              className="extendable-mobile-carousel"
              onScroll={() => {
                suppressMobileOpen.current = true;
                if (scrollSuppressTimer.current !== null) window.clearTimeout(scrollSuppressTimer.current);
                scrollSuppressTimer.current = window.setTimeout(() => { suppressMobileOpen.current = false; }, 120);
              }}
            >
              {items.map((item) => (
                <div key={item.id} className="extendable-mobile-slide" data-item-id={item.id}>
                  <CompactCard
                    item={item}
                    mobile
                    onOpen={openCard}
                    setTrigger={(node) => {
                      if (node) triggerRefs.current.set(item.id, node);
                      else triggerRefs.current.delete(item.id);
                    }}
                  />
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="extendable-desktop-pager">
            <button type="button" className="extendable-page-arrow is-left" onClick={() => movePage(-1)} disabled={desktopPage === 0} aria-label="上一页">
              <span aria-hidden="true">‹</span>
            </button>
            <AnimatePresence mode="wait" initial={false} custom={pageDirection}>
              <motion.div
                key={desktopPage}
                className="extendable-grid"
                custom={pageDirection}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, transform: `translateX(${pageDirection * 36}px)` }}
                animate={{ opacity: 1, transform: "translateX(0px)" }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, transform: `translateX(${pageDirection * -36}px)` }}
                transition={{ duration: reducedMotion ? 0.12 : 0.26, ease: EASE_IN_OUT }}
              >
                {pageItems.map((item) => (
                  <CompactCard
                    key={item.id}
                    item={item}
                    onOpen={openCard}
                    setTrigger={(node) => {
                      if (node) triggerRefs.current.set(item.id, node);
                      else triggerRefs.current.delete(item.id);
                    }}
                  />
                ))}
              </motion.div>
            </AnimatePresence>
            <button type="button" className="extendable-page-arrow is-right" onClick={() => movePage(1)} disabled={desktopPage === pageCount - 1} aria-label="下一页">
              <span aria-hidden="true">›</span>
            </button>
            <span className="extendable-page-count">{desktopPage + 1} / {pageCount}</span>
          </div>
        )}
      </section>

      <AnimatePresence>
        {selected ? <ExpandedCard item={selected} sourceWidth={selectedWidth} onClose={closeCard} shouldReduceMotion={reducedMotion} /> : null}
      </AnimatePresence>
    </LayoutGroup>
  );
}
