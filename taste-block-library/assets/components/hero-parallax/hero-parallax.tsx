"use client";

/**
 * 来源：Aceternity UI / Manu Arora
 * 上游：https://github.com/aceternity/ui
 * 原始源码与许可声明见 references/pitfalls.md（来源与许可）。
 * 2026-09-08：保留首页，恢复官方透视布局，延缓图片区纵向推进，末行播完后放行。
 */

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  type MotionValue,
} from "motion/react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Product {
  title: string;
  thumbnail: string;
  thumbnailSet?: string;
}

interface HeroParallaxProps {
  products: Product[];
  header?: ReactNode;
}

// 保留官方透视场景，用较慢的虚拟纵向位置延长图片在视口中的时间。
export function HeroParallax({ products, header: cover }: HeroParallaxProps) {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLDivElement>(null);
  const tracks = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState({ height: 900, width: 1440, headerBottom: 780 });

  useLayoutEffect(() => {
    const viewport = stage.current;
    const heading = header.current;
    if (!viewport || !heading || !tracks.current) return;
    const measure = () => setLayout({
      height: viewport.clientHeight,
      width: viewport.clientWidth,
      // Measure the flow position, excluding the title's visual top offset.
      headerBottom: tracks.current!.offsetTop,
    });
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    observer.observe(heading);
    measure();
    return () => observer.disconnect();
  }, []);

  const mobile = layout.width < 768;
  const desktopMix = Math.max(0, Math.min(1, (layout.width - 600) / 600));
  const gap = 20 + 60 * desktopMix;
  // 宽度连续插值，同时受视口高度限制，横屏也不会吞掉整条轨道。
  const cardWidth = Math.min(layout.width * 0.62, 504, (layout.height - 3 * gap) / 1.6);
  // 手机三行分配剩余视口高度，保留窄卡片宽度，消除末行以下的空黑区。
  const cardHeight = mobile ? Math.max(cardWidth * 0.8, (layout.height - 4 * gap) / 3) : cardWidth * 0.8;
  const initialWidth = Math.min(cardWidth * (1.16 - 0.208 * desktopMix), (layout.height - 3 * gap) / 1.6);
  const startY = -400 - 300 * desktopMix;
  // 手机标题移走后，其布局高度仍占位；将轨道终点对齐顶部间距，消除这块实质留白。
  const endY = mobile ? gap - layout.headerBottom : startY + 140 + 460 * desktopMix + Math.min(120, layout.height * 0.12);
  const firstTop = layout.headerBottom + endY;
  const rowStep = cardHeight + gap;
  const rows = [0, 1, 2].map(index => {
    const row = products.slice(index * 5, index * 5 + 5);
    // 只追加最先离开视口的第一张；反向 flex 中，它从左侧再次进入。
    return !mobile && row.length ? [...row, row[0]] : row;
  });
  const rowTravels = rows.map(row => Math.max(0, row.length * cardWidth + Math.max(0, row.length - 1) * gap - layout.width));
  const lastStop = Math.max(0, firstTop + 2 * rowStep + cardHeight - layout.height + 24);
  const slowStart = Math.min(lastStop, Math.max(layout.height * 0.6, firstTop - layout.height * 0.25));
  const verticalRate = 0.5 - 0.22 * desktopMix;
  const holdStart = slowStart + (lastStop - slowStart) / verticalRate;
  // 手机横向约 1.8px / 1px 滑动，桌面约 0.9px / 1px 滚动。
  const horizontalRate = 1.8 - 0.7 * desktopMix;
  const rowDurations = rowTravels.map((distance, index) => distance / (horizontalRate * (index === 2 && !mobile ? 1.15 : 1)));
  const entranceEnd = layout.height * (0.3 + 0.3 * desktopMix);
  const rowStarts = [0, 1, 2].map(index => {
    // 第三行顶部进入视口后开始横移。
    const visibleAt = index === 2
      ? Math.max(0, firstTop + 2 * rowStep - layout.height)
      : Math.max(slowStart, firstTop + index * rowStep - layout.height * 0.8);
    const trigger = visibleAt <= slowStart ? visibleAt : slowStart + (visibleAt - slowStart) / verticalRate;
    return mobile ? Math.max(entranceEnd, trigger) : trigger;
  });
  const travel = Math.max(entranceEnd, holdStart, ...rowStarts.map((start, index) => start + rowDurations[index]));
  const { scrollY } = useScroll();
  const scroll = useTransform(() => Math.max(0, Math.min(travel, scrollY.get() - (section.current?.offsetTop ?? 0))));

  useLayoutEffect(() => {
    if (!mobile) return;
    let controlled = false;
    let reachedEnd = false;
    let touchY = 0;
    let target = window.scrollY;
    let position = target;
    let velocity = 0;
    let lastMove = 0;
    let lastFrame = 0;
    let frame = 0;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const endpoint = () => (section.current?.offsetTop ?? 0) + travel;
    const stop = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      controlled = false;
      velocity = 0;
    };
    const tick = (now: number) => {
      const dt = Math.max(0, Math.min(40, now - lastFrame));
      lastFrame = now;
      if (!controlled) {
        // Integrate exponential friction independently of display refresh rate.
        const decay = Math.exp(-dt / 220);
        target += velocity * 220 * (1 - decay);
        velocity *= decay;
      }
      target = Math.max(0, Math.min(endpoint(), target));
      position = reduceMotion ? target : position + (target - position) * (1 - Math.exp(-dt / 22));
      if (Math.abs(target - position) < 0.5) position = target;
      window.scrollTo({ top: Math.round(position), behavior: "instant" });
      if (position === endpoint() || position === 0) velocity = 0;
      if (Math.abs(target - position) > 0.1 || (!controlled && Math.abs(velocity) > 0.02)) {
        frame = requestAnimationFrame(tick);
      } else frame = 0;
    };
    const schedule = () => {
      if (frame) return;
      lastFrame = performance.now();
      frame = requestAnimationFrame(tick);
    };
    const onStart = (event: TouchEvent) => {
      stop();
      controlled = event.touches.length === 1 &&
        event.target instanceof Node && Boolean(stage.current?.contains(event.target)) &&
        window.scrollY < endpoint() - 1;
      reachedEnd = false;
      if (controlled) {
        touchY = event.touches[0].clientY;
        target = position = window.scrollY;
        lastMove = performance.now();
      }
    };
    const onMove = (event: TouchEvent) => {
      if (!controlled || event.touches.length !== 1) return;
      event.preventDefault();
      const nextY = event.touches[0].clientY;
      const delta = touchY - nextY;
      touchY = nextY;
      if (reachedEnd) return;
      const now = performance.now();
      const elapsed = Math.max(8, now - lastMove);
      velocity = reduceMotion ? 0 : Math.max(-2.8, Math.min(2.8, 0.35 * velocity + 0.65 * delta / elapsed));
      lastMove = now;
      target = Math.max(0, Math.min(endpoint(), target + delta));
      reachedEnd = target >= endpoint();
      schedule();
    };
    const onEnd = () => {
      if (!controlled) return;
      controlled = false;
      if (reachedEnd || performance.now() - lastMove > 100) velocity = 0;
      schedule();
    };
    window.addEventListener("touchstart", onStart, { passive: true });
    window.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onEnd);
    window.addEventListener("touchcancel", stop);
    window.addEventListener("wheel", stop, { passive: true });
    window.addEventListener("keydown", stop);
    window.addEventListener("blur", stop);
    return () => {
      stop();
      window.removeEventListener("touchstart", onStart);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("touchend", onEnd);
      window.removeEventListener("touchcancel", stop);
      window.removeEventListener("wheel", stop);
      window.removeEventListener("keydown", stop);
      window.removeEventListener("blur", stop);
    };
  }, [mobile, travel]);
  // 图片场景完全由真实滚动位置驱动，避免松手后再被平滑值校正。
  const playbackScroll = scroll;

  const virtualY = useTransform(playbackScroll, value => Math.min(lastStop,
    value <= slowStart ? value : slowStart + (value - slowStart) * verticalRate));
  const sceneY = useTransform(virtualY, value => -value);
  const headerY = useTransform(() => -Math.max(0, Math.min(playbackScroll.get() * (mobile ? 2 : 1), layout.height) - virtualY.get()));
  const entranceTarget = useTransform(playbackScroll, [0, entranceEnd], [0, 1]);
  // A tall mobile title must leave the scene even when its height exceeds the viewport budget.
  const headerPointerEvents = useTransform(entranceTarget, value => mobile && value >= 0.9 ? "none" : "auto");
  const mobileHeaderOpacity = useTransform(entranceTarget, [0.35, 0.9], [1, 0]);
  const desktopEntrance = useSpring(entranceTarget, { stiffness: 300, damping: 30, bounce: 100 });
  const entrance = mobile ? entranceTarget : desktopEntrance;
  const rotateX = useTransform(entrance, [0, 1], [15, 0]);
  const rotateZ = useTransform(entrance, [0, 1], [20, 0]);
  const opacity = useTransform(entrance, [0, 1], [0.2, 1]);
  const translateY = useTransform(entrance, [0, 1], [startY, endY]);
  const width = useTransform(entrance, [0, 1], [initialWidth, cardWidth]);
  const height = useTransform(entrance, [0, 1], [initialWidth * 0.8, cardHeight]);
  const spacing = useTransform(entrance, [0, 1], [`${gap + 12 * (1 - desktopMix)}px`, `${gap}px`]);

  return (
    <section id="home" ref={section} className="hp-gallery" style={{ height: layout.height + travel }}>
      <div ref={stage} className="hp-gallery-stage">
        <motion.div className="hp-container" style={{ y: sceneY }}>
          <motion.div ref={header} className="hp-header" style={{ y: headerY, pointerEvents: headerPointerEvents, opacity: mobile ? mobileHeaderOpacity : 1 }}>
            {cover ?? <><h1 className="hp-title">山野之间<br />发现新的风景</h1><p className="hp-desc">向下滑动，沿着三条图片带探索。轻点照片显示名称，再次轻点还原。</p></>}
          </motion.div>
          <motion.div ref={tracks} className="hp-tracks" style={{ rotateX, rotateZ, translateY, opacity }}>
            {[0, 1, 2].map(index => (
              <ParallaxRow key={index} products={rows[index]}
                reverse={index !== 1} scroll={playbackScroll} start={rowStarts[index]}
                duration={rowDurations[index]} distance={rowTravels[index]}
                width={width} height={height} spacing={spacing}
                mobile={mobile} allowLead={index !== 2} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function ParallaxRow({ products, reverse, scroll, start, duration, distance, width, height, spacing, mobile, allowLead }: {
  products: Product[];
  reverse: boolean;
  scroll: MotionValue<number>;
  start: number;
  duration: number;
  distance: number;
  width: MotionValue<number>;
  height: MotionValue<number>;
  spacing: MotionValue<string>;
  mobile: boolean;
  allowLead: boolean;
}) {
  // 横向直接跟随滚动，确保最后一行到达真实终点后才结束固定区。
  const lead = mobile || !allowLead ? 0 : Math.min(100, distance * 0.08);
  const x = useTransform(() => {
    const value = scroll.get();
    const position = value < start
      ? lead * Math.max(0, start > 0 ? value / start : 1)
      : lead + (distance - lead) * Math.max(0, Math.min(1, duration > 0 ? (value - start) / duration : 1));
    return (reverse ? 1 : -1) * position;
  });
  return (
    <motion.div className={`hp-row ${reverse ? "hp-row-reverse" : "hp-row-normal"}`}
      style={{ x, height, gap: spacing, marginBottom: spacing }}>
      {products.map((product, index) => <ProductCard key={`${product.title}-${index}`} product={product} width={width} />)}
    </motion.div>
  );
}

// ─── ProductCard（悬浮效果保留）────────────────────────

interface ProductCardProps {
  product: Product;
  width: MotionValue<number>;
}

function ProductCard({ product, width }: ProductCardProps) {
  const [selected, setSelected] = useState(false);
  const gesture = useRef<{ x: number; y: number; scroll: number; moved: boolean } | null>(null);
  return (
    <motion.div
      style={{ width, height: "100%" }}
      whileHover={{ y: -20 }}
      className="hp-card"
      role="button"
      tabIndex={0}
      aria-label={product.title}
      aria-pressed={selected}
      data-selected={selected}
      onMouseDown={event => event.preventDefault()}
      onPointerDown={event => {
        gesture.current = event.isPrimary && event.button === 0 ? { x: event.clientX, y: event.clientY, scroll: window.scrollY, moved: false } : null;
      }}
      onPointerMove={event => {
        const start = gesture.current;
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 6) start.moved = true;
      }}
      onPointerCancel={() => { gesture.current = null; }}
      onClick={event => {
        const start = gesture.current;
        gesture.current = null;
        if (event.detail === 0 || (start && !start.moved && Math.abs(window.scrollY - start.scroll) <= 6 && Math.hypot(event.clientX - start.x, event.clientY - start.y) <= 6)) setSelected(value => !value);
      }}
      onKeyDown={event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); setSelected(value => !value); }
      }}
    >
      <div className="hp-card-link">
        <img
          src={product.thumbnail}
          srcSet={product.thumbnailSet}
          sizes="(max-width: 767px) 62vw, 504px"
          decoding="async"
          height="600"
          width="600"
          className="hp-card-img"
          alt={product.title}
          draggable={false}
        />
      </div>
      <div className="hp-card-overlay" />
      <h2 className="hp-card-title">{product.title}</h2>
    </motion.div>
  );
}

