import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type DragCardItem = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  image: string;
};

export type RecyclingDragCardStackProps = {
  items: readonly DragCardItem[];
  className?: string;
  reducedMotion?: boolean;
  desktopFollowRatio?: number;
  touchFollowRatio?: number;
  tiltDegrees?: number;
  onActiveChange?: (item: DragCardItem) => void;
};

const MINIMUM_DRAG = 1;

const stackPose = (depth: number) => {
  if (depth === 0) return { x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 };
  // 第 2、3 张：y 取负值，让旋转后最低的那个下角也藏在顶牌后面（原先 +7/+9 会在底部露出两个交叉的楔形和零碎小边）；
  // 只在两侧/上方露出倾斜的卡角，叠放层次感保留
  if (depth === 1) return { x: 7, y: -9, scale: 0.94, rotate: -4.2, opacity: 1 };
  if (depth === 2) return { x: -5, y: -9, scale: 0.92, rotate: 4.4, opacity: 0.96 };
  // 第 4 张及以后：完全藏在前面的卡片后面（y 不再下偏），否则会在底部露出零碎的边（毛刺）
  return { x: 0, y: 0, scale: 0.9, rotate: 0, opacity: 1 };
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

function CardImage({ item }: { item: DragCardItem }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="drag-card-image-fallback">图片暂不可用</div>;
  }

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

function CardContent({ item }: { item: DragCardItem }) {
  return (
    <>
      <CardImage item={item} />
      <div className="drag-card-shade" />
      <div className="drag-card-copy">
        <span>{item.eyebrow}</span>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
      </div>
    </>
  );
}

type StackCardProps = {
  item: DragCardItem;
  depth: number;
  total: number;
  isCoarsePointer: boolean;
  shouldReduceMotion: boolean;
  desktopFollowRatio: number;
  touchFollowRatio: number;
  tiltDegrees: number;
  onDismiss: (direction: -1 | 1) => void;
};

function StackCard({
  item,
  depth,
  total,
  isCoarsePointer,
  shouldReduceMotion,
  desktopFollowRatio,
  touchFollowRatio,
  tiltDegrees,
  onDismiss,
}: StackCardProps) {
  const isTop = depth === 0;
  const pose = stackPose(depth);
  const dragX = useMotionValue(0);
  const tiltTarget = useTransform(
    dragX,
    [-14, 0, 14],
    [-tiltDegrees, 0, tiltDegrees],
    { clamp: true },
  );
  const fixedTilt = useSpring(tiltTarget, {
    mass: 1,
    stiffness: 100,
    damping: 10,
  });
  const hasDragged = useRef(false);
  const lastDirection = useRef<-1 | 1>(1);
  const activeDrag = useRef(false);
  const activePointerId = useRef<number | null>(null);

  const dismiss = useCallback(
    (direction: -1 | 1) => onDismiss(direction),
    [onDismiss],
  );

  const finishDrag = useCallback(() => {
    const wasDragging = activeDrag.current;
    activeDrag.current = false;
    activePointerId.current = null;
    if (!wasDragging) return;

    void animate(
      dragX,
      0,
      shouldReduceMotion
        ? { duration: 0.12 }
        : { type: "spring", duration: 0.5, bounce: 0.2 },
    );

    if (hasDragged.current) dismiss(lastDirection.current);
  }, [dismiss, dragX, shouldReduceMotion]);

  useEffect(() => {
    if (!isTop) return;

    const settleOnBlur = () => finishDrag();
    const settleOnHidden = () => {
      if (document.visibilityState === "hidden") finishDrag();
    };
    const settleIfButtonWasReleased = (event: PointerEvent) => {
      if (activeDrag.current && event.buttons === 0) finishDrag();
    };

    window.addEventListener("blur", settleOnBlur);
    window.addEventListener("pointercancel", settleOnBlur, true);
    window.addEventListener("pointermove", settleIfButtonWasReleased, true);
    document.addEventListener("visibilitychange", settleOnHidden);

    return () => {
      window.removeEventListener("blur", settleOnBlur);
      window.removeEventListener("pointercancel", settleOnBlur, true);
      window.removeEventListener("pointermove", settleIfButtonWasReleased, true);
      document.removeEventListener("visibilitychange", settleOnHidden);
    };
  }, [finishDrag, isTop]);

  return (
    <motion.article
      className="drag-stack-slot"
      animate={pose}
      transition={
        shouldReduceMotion
          ? { duration: 0.12 }
          : { type: "spring", duration: 0.5, bounce: 0.2 }
      }
      style={{
        zIndex: total - depth,
        pointerEvents: isTop ? "auto" : "none",
      }}
      aria-hidden={!isTop}
    >
      <motion.div
        className={`drag-travel-card${isTop ? " is-top" : ""}`}
        drag={isTop ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={isCoarsePointer ? touchFollowRatio : desktopFollowRatio}
        dragMomentum={false}
        style={{ x: dragX, rotate: fixedTilt, touchAction: "pan-y" }}
        onPointerDown={(event) => {
          if (!isTop) return;
          if (
            activePointerId.current !== null &&
            activePointerId.current !== event.pointerId
          ) {
            event.preventDefault();
            return;
          }

          activePointerId.current = event.pointerId;
          try {
            event.currentTarget.setPointerCapture(event.pointerId);
          } catch {
            // Window-level recovery still settles the card if capture is rejected.
          }
        }}
        onPointerUp={finishDrag}
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
        onKeyDown={(event) => {
          if (!isTop) return;
          if (event.key === "ArrowLeft") dismiss(-1);
          if (event.key === "ArrowRight") dismiss(1);
        }}
        role={isTop ? "button" : undefined}
        tabIndex={isTop ? 0 : -1}
        aria-label={isTop ? `${item.title}，向左或向右拖动以查看下一张` : undefined}
      >
        <CardContent item={item} />
      </motion.div>
    </motion.article>
  );
}

export function RecyclingDragCardStack({
  items,
  className,
  reducedMotion = false,
  desktopFollowRatio = 0.32,
  touchFollowRatio = 0.46,
  tiltDegrees = 11,
  onActiveChange,
}: RecyclingDragCardStackProps) {
  const osReducedMotion = useReducedMotion();
  const isCoarsePointer = useCoarsePointer();
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const hasUniqueIds = new Set(ids).size === ids.length;
  const [order, setOrder] = useState(() => ids);

  useEffect(() => {
    setOrder(ids);
  }, [ids]);

  const itemMap = useMemo(
    () => new Map(items.map((item) => [item.id, item] as const)),
    [items],
  );
  const orderedCards = useMemo(
    () => order.map((id) => itemMap.get(id)).filter(Boolean) as DragCardItem[],
    [itemMap, order],
  );

  const cycleCard = useCallback(
    (direction: -1 | 1) => {
      setOrder((current) => {
        const next = [...current.slice(1), current[0]];
        const active = itemMap.get(next[0]);
        if (active) onActiveChange?.(active);
        return next;
      });
      void direction;
    },
    [itemMap, onActiveChange],
  );

  if (items.length < 3 || !hasUniqueIds) {
    return (
      <div className={`drag-stack-fallback${className ? ` ${className}` : ""}`} role="status">
        此卡片堆需要至少 3 个且 ID 唯一的项目。
      </div>
    );
  }

  return (
    <div
      className={`recycling-drag-card-stack${className ? ` ${className}` : ""}`}
      aria-live="polite"
    >
      {[...orderedCards].reverse().map((item, reverseIndex) => {
        const depth = orderedCards.length - 1 - reverseIndex;
        return (
          <StackCard
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
