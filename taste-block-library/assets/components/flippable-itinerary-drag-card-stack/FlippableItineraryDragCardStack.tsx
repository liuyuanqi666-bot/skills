import {
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  classifyItineraryPointerIntent,
  type GestureIntent,
} from "./gesture-intent";

export { classifyItineraryPointerIntent } from "./gesture-intent";

export type ItineraryCardItem = {
  id: string;
  day: string;
  route: string;
  title: string;
  image: string;
  tags: readonly string[];
  paragraphs: readonly string[];
  highlight: string;
  transport: string;
  meals: string;
  hotel: string;
};

export type FlippableItineraryDragCardStackProps = {
  items: readonly ItineraryCardItem[];
  className?: string;
  reducedMotion?: boolean;
  desktopFollowRatio?: number;
  touchFollowRatio?: number;
  tiltDegrees?: number;
  onActiveChange?: (item: ItineraryCardItem) => void;
};

const MINIMUM_DRAG = 1;

const stackPose = (depth: number) => {
  if (depth === 0) return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 };
  if (depth === 1) return { x: 8, y: 8, scale: 0.94, rotate: -4.2, opacity: 1 };
  if (depth === 2) return { x: -6, y: 11, scale: 0.92, rotate: 4.4, opacity: 0.96 };
  return { x: 0, y: 8, scale: 0.9, rotate: 0, opacity: 1 };
};

function useCoarsePointer() {
  const [isCoarse, setIsCoarse] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarse(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return isCoarse;
}

function ItineraryImage({ item }: { item: ItineraryCardItem }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="itinerary-image-fallback">图片暂不可用</div>;
  return (
    <img
      src={item.image}
      alt=""
      width="720"
      height="423"
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

function FrontFace({ item }: { item: ItineraryCardItem }) {
  const dayNumber = item.day.replace(/^DAY\s*/i, "");
  return (
    <section className="itinerary-face itinerary-front" aria-label={`第 ${dayNumber} 天行程封面`}>
      <ItineraryImage item={item} />
      <div className="itinerary-front-vignette" />
      <div className="itinerary-front-topline"><span>DAY</span><strong>{dayNumber}</strong></div>
      <span className="itinerary-flip-hint">单击翻面</span>
      <div className="itinerary-front-copy">
        <p>{item.route}</p>
        <h2>{item.title}</h2>
        <span>查看详细行程 →</span>
      </div>
    </section>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return <div className="itinerary-detail-row"><span>{label}</span><p>{value}</p></div>;
}

function BackFace({ item, onContentScroll }: { item: ItineraryCardItem; onContentScroll: () => void }) {
  return (
    <section className="itinerary-face itinerary-back" aria-label={`第 ${item.day} 天详细行程`}>
      <header className="itinerary-back-header">
        <div><span>DAY {item.day}</span><p>{item.route}</p></div>
        <span className="itinerary-flip-hint">单击返回</span>
      </header>
      <div className="itinerary-back-scroll" onScroll={onContentScroll} onWheel={(event) => event.stopPropagation()}>
        <h2>{item.title}</h2>
        <div className="itinerary-tag-list">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
        <div className="itinerary-description">
          {item.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          <blockquote>{item.highlight}</blockquote>
        </div>
        <div className="itinerary-detail-list">
          <DetailRow label="交通" value={item.transport} />
          <DetailRow label="餐饮" value={item.meals} />
          <DetailRow label="住宿" value={item.hotel} />
        </div>
        <p className="itinerary-detail-footnote">实际游览顺序可能根据天气、交通及当地接待情况合理调整。</p>
      </div>
      <div className="itinerary-scroll-fade" />
    </section>
  );
}

type CardProps = {
  item: ItineraryCardItem;
  depth: number;
  total: number;
  isCoarsePointer: boolean;
  shouldReduceMotion: boolean;
  desktopFollowRatio: number;
  touchFollowRatio: number;
  tiltDegrees: number;
  onDismiss: (direction: -1 | 1) => void;
};

function ItineraryCard({
  item,
  depth,
  total,
  isCoarsePointer,
  shouldReduceMotion,
  desktopFollowRatio,
  touchFollowRatio,
  tiltDegrees,
  onDismiss,
}: CardProps) {
  const [flipped, setFlipped] = useState(false);
  const dragControls = useDragControls();
  const isTop = depth === 0;
  const pose = stackPose(depth);
  const dragX = useMotionValue(0);
  const tiltTarget = useTransform(dragX, [-14, 0, 14], [-tiltDegrees, 0, tiltDegrees], { clamp: true });
  const fixedTilt = useSpring(tiltTarget, { mass: 1, stiffness: 100, damping: 10 });
  const hasDragged = useRef(false);
  const suppressClick = useRef(false);
  const lastDirection = useRef<-1 | 1>(1);
  const activeDrag = useRef(false);
  const activePointerId = useRef<number | null>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const gestureIntent = useRef<GestureIntent>("idle");
  const suppressTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!isTop && flipped) setFlipped(false);
  }, [depth, flipped, isTop]);

  useEffect(() => () => {
    if (suppressTimer.current !== null) window.clearTimeout(suppressTimer.current);
  }, []);

  const dismiss = useCallback((direction: -1 | 1) => onDismiss(direction), [onDismiss]);

  const finishDrag = useCallback(() => {
    const wasDragging = activeDrag.current;
    activeDrag.current = false;
    activePointerId.current = null;
    pointerStart.current = null;
    gestureIntent.current = "idle";
    if (!wasDragging) return;

    void animate(
      dragX,
      0,
      shouldReduceMotion ? { duration: 0.12 } : { type: "spring", duration: 0.5, bounce: 0.2 },
    );
    if (hasDragged.current) {
      suppressClick.current = true;
      dismiss(lastDirection.current);
      suppressTimer.current = window.setTimeout(() => { suppressClick.current = false; }, 250);
    }
  }, [dismiss, dragX, shouldReduceMotion]);

  useEffect(() => {
    if (!isTop) return;
    const settle = () => finishDrag();
    const settleOnHidden = () => { if (document.visibilityState === "hidden") finishDrag(); };
    const settleIfReleased = (event: PointerEvent) => {
      if (activeDrag.current && event.buttons === 0) finishDrag();
    };
    window.addEventListener("blur", settle);
    window.addEventListener("pointercancel", settle, true);
    window.addEventListener("pointermove", settleIfReleased, true);
    document.addEventListener("visibilitychange", settleOnHidden);
    return () => {
      window.removeEventListener("blur", settle);
      window.removeEventListener("pointercancel", settle, true);
      window.removeEventListener("pointermove", settleIfReleased, true);
      document.removeEventListener("visibilitychange", settleOnHidden);
    };
  }, [finishDrag, isTop]);

  const toggleFace = () => {
    if (!isTop) return;
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    setFlipped((current) => !current);
  };

  const markContentScroll = () => {
    suppressClick.current = true;
    if (suppressTimer.current !== null) window.clearTimeout(suppressTimer.current);
    suppressTimer.current = window.setTimeout(() => { suppressClick.current = false; }, 160);
  };

  return (
    <motion.article
      className="itinerary-stack-slot"
      animate={pose}
      transition={shouldReduceMotion ? { duration: 0.12 } : { type: "spring", duration: 0.5, bounce: 0.2 }}
      style={{ zIndex: total - depth, pointerEvents: isTop ? "auto" : "none" }}
      aria-hidden={!isTop}
    >
      <motion.div
        className="itinerary-drag-shell"
        drag={isTop ? "x" : false}
        {...(flipped ? { dragControls, dragListener: false } : {})}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={isCoarsePointer ? touchFollowRatio : desktopFollowRatio}
        dragMomentum={false}
        style={{ x: dragX, rotate: fixedTilt, touchAction: "pan-y" }}
        onPointerDown={(event) => {
          if (!isTop) return;
          if (activePointerId.current !== null && activePointerId.current !== event.pointerId) {
            event.preventDefault();
            return;
          }
          activePointerId.current = event.pointerId;
          hasDragged.current = false;
          if (flipped) {
            pointerStart.current = { x: event.clientX, y: event.clientY };
            gestureIntent.current = "pending";
          } else {
            pointerStart.current = null;
            gestureIntent.current = "idle";
            try {
              event.currentTarget.setPointerCapture(event.pointerId);
            } catch {
              // Window-level recovery still settles the card if capture is rejected.
            }
          }
        }}
        onPointerMove={(event) => {
          if (!isTop || !flipped || gestureIntent.current !== "pending" || activePointerId.current !== event.pointerId || pointerStart.current === null) return;
          const deltaX = event.clientX - pointerStart.current.x;
          const deltaY = event.clientY - pointerStart.current.y;
          const intent = classifyItineraryPointerIntent(deltaX, deltaY, event.pointerType !== "mouse" || isCoarsePointer);
          if (intent === "pending") return;
          gestureIntent.current = intent;
          if (intent === "vertical") return;
          hasDragged.current = true;
          lastDirection.current = deltaX < 0 ? -1 : 1;
          activeDrag.current = true;
          event.preventDefault();
          try { event.currentTarget.setPointerCapture(event.pointerId); } catch {
            // Native pan cancellation still falls through to finishDrag.
          }
          dragControls.start(event);
        }}
        onPointerUp={() => {
          if (!flipped || gestureIntent.current === "horizontal") finishDrag();
          else {
            activePointerId.current = null;
            pointerStart.current = null;
            gestureIntent.current = "idle";
          }
        }}
        onPointerCancel={finishDrag}
        onLostPointerCapture={finishDrag}
        onDragStart={() => {
          activeDrag.current = true;
          hasDragged.current = false;
        }}
        onDrag={(_, info) => {
          if (Math.abs(info.offset.x) >= MINIMUM_DRAG) {
            hasDragged.current = true;
            lastDirection.current = info.offset.x < 0 ? -1 : 1;
          }
        }}
        onDragEnd={finishDrag}
        onClick={toggleFace}
        onKeyDown={(event) => {
          if (!isTop) return;
          if (event.key === "ArrowLeft") dismiss(-1);
          if (event.key === "ArrowRight") dismiss(1);
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            toggleFace();
          }
        }}
        role={isTop ? "button" : undefined}
        tabIndex={isTop ? 0 : -1}
        aria-label={isTop ? `第 ${item.day} 天，${item.title}。单击翻面，左右拖动换日。` : undefined}
        aria-pressed={isTop ? flipped : undefined}
      >
        <motion.div
          className="itinerary-flip-card"
          animate={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
          transition={shouldReduceMotion ? { duration: 0.12 } : { duration: 0.5, ease: [0.77, 0, 0.175, 1] }}
        >
          <FrontFace item={item} />
          <BackFace item={item} onContentScroll={markContentScroll} />
        </motion.div>
      </motion.div>
    </motion.article>
  );
}

export function FlippableItineraryDragCardStack({
  items,
  className,
  reducedMotion = false,
  desktopFollowRatio = 0.32,
  touchFollowRatio = 0.46,
  tiltDegrees = 11,
  onActiveChange,
}: FlippableItineraryDragCardStackProps) {
  const osReducedMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const hasUniqueIds = new Set(ids).size === ids.length;
  const [order, setOrder] = useState(() => ids);

  useEffect(() => { setOrder(ids); }, [ids]);

  const itemMap = useMemo(() => new Map(items.map((item) => [item.id, item] as const)), [items]);
  const orderedCards = useMemo(
    () => order.map((id) => itemMap.get(id)).filter(Boolean) as ItineraryCardItem[],
    [itemMap, order],
  );
  const cycleCard = useCallback((direction: -1 | 1) => {
    setOrder((current) => {
      const next = [...current.slice(1), current[0]];
      const active = itemMap.get(next[0]);
      if (active) onActiveChange?.(active);
      return next;
    });
    void direction;
  }, [itemMap, onActiveChange]);

  if (items.length < 3 || !hasUniqueIds) {
    return <div className={`itinerary-stack-fallback${className ? ` ${className}` : ""}`} role="status">此行程卡片堆需要至少 3 个且 ID 唯一的日期项目。</div>;
  }

  return (
    <div className={`flippable-itinerary-drag-stack${className ? ` ${className}` : ""}`} aria-live="polite">
      {[...orderedCards].reverse().map((item, reverseIndex) => {
        const depth = orderedCards.length - 1 - reverseIndex;
        return (
          <ItineraryCard
            key={item.id}
            item={item}
            depth={depth}
            total={orderedCards.length}
            isCoarsePointer={isCoarsePointer}
            shouldReduceMotion={reducedMotion || Boolean(osReducedMotion)}
            desktopFollowRatio={desktopFollowRatio}
            touchFollowRatio={touchFollowRatio}
            tiltDegrees={tiltDegrees}
            onDismiss={cycleCard}
          />
        );
      })}
    </div>
  );
}
