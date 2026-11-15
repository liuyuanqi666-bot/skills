"use client";
import React, { useRef, useState, useMemo, useEffect, useCallback } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "../../../../shared/utils";

export interface StickyScrollItem {
  title: string;
  description: string;
  content?: React.ReactNode;
  bgImage?: string;
  backgroundColor?: string;
  gradient?: string;
}

export interface StickyScrollProps {
  content: StickyScrollItem[];
  contentClassName?: string;
  containerClassName?: string;
  enableBreathing?: boolean;
  blurAmount?: number;
  brightness?: number;
  overlayOpacity?: number;
  onActiveChange?: (index: number) => void;
}

function extractImageSrc(node: React.ReactNode): string | null {
  if (!node || typeof node !== "object") return null;
  if (React.isValidElement(node)) {
    const props = node.props as any;
    if (props?.src && typeof props.src === "string") {
      return props.src;
    }
    if (props?.children) {
      if (Array.isArray(props.children)) {
        for (const child of props.children) {
          const res = extractImageSrc(child);
          if (res) return res;
        }
      } else {
        return extractImageSrc(props.children);
      }
    }
  }
  return null;
}

export const StickyScroll = ({
  content,
  contentClassName,
  containerClassName,
  enableBreathing = true,
  blurAmount = 18,
  brightness = 0.85,
  overlayOpacity = 0.32,
  onActiveChange,
}: StickyScrollProps) => {
  const [activeCard, setActiveCard] = useState(0);
  
  const desktopScrollRef = useRef<HTMLDivElement | null>(null);
  const mobileScrollRef = useRef<HTMLDivElement | null>(null);
  
  const desktopItemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const mobileItemRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 将原有内容外留白减半，长文仍按自然高度展开；不改动过渡动画。
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      mobileItemRefs.current.forEach(item => {
        if (!item?.firstElementChild) return;
        const height = (item.firstElementChild as HTMLElement).offsetHeight;
        item.style.paddingTop = "10px";
        item.style.paddingBottom = `${Math.max(16, (220 - height) / 2 - 10)}px`;
      });
      desktopItemRefs.current.forEach(item => {
        if (!item?.firstElementChild) return;
        const height = (item.firstElementChild as HTMLElement).offsetHeight;
        item.style.paddingBlock = `${Math.max(0, 300 - height) / 4}px`;
      });
    });
    [...mobileItemRefs.current, ...desktopItemRefs.current].forEach(item => {
      if (item?.firstElementChild) observer.observe(item.firstElementChild);
    });
    return () => observer.disconnect();
  }, [content]);


  const cardLength = content.length;

  // =========================================================================
  // 1. 桌面端定位逻辑：左右分栏 · 物理几何中心水平对齐
  // =========================================================================
  const checkDesktopActive = useCallback(() => {
    const container = desktopScrollRef.current;
    if (!container || cardLength === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop <= 15) {
      if (activeCard !== 0) {
        setActiveCard(0);
        onActiveChange?.(0);
      }
      return;
    }
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      const lastIdx = cardLength - 1;
      if (activeCard !== lastIdx) {
        setActiveCard(lastIdx);
        onActiveChange?.(lastIdx);
      }
      return;
    }

    const containerRect = container.getBoundingClientRect();
    // 触发基准线：右侧卡片几何中心线（容器垂直正中心）
    const targetY = containerRect.top + containerRect.height / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    desktopItemRefs.current.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const itemCenterY = rect.top + rect.height / 2;
      const distance = Math.abs(itemCenterY - targetY);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    if (closestIndex !== activeCard) {
      setActiveCard(closestIndex);
      onActiveChange?.(closestIndex);
    }
  }, [activeCard, cardLength, onActiveChange]);

  // =========================================================================
  // 2. 手机端定位逻辑：黄金阅读焦点锚点线（focalY）
  // =========================================================================
  const checkMobileActive = useCallback(() => {
    const container = mobileScrollRef.current;
    if (!container || cardLength === 0) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    if (scrollTop <= 10) {
      if (activeCard !== 0) {
        setActiveCard(0);
        onActiveChange?.(0);
      }
      return;
    }
    if (scrollTop + clientHeight >= scrollHeight - 15) {
      const lastIdx = cardLength - 1;
      if (activeCard !== lastIdx) {
        setActiveCard(lastIdx);
        onActiveChange?.(lastIdx);
      }
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const focalY = containerRect.top + 70;

    let targetIndex = 0;
    mobileItemRefs.current.forEach((el, index) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.top <= focalY) {
        targetIndex = index;
      }
    });

    if (targetIndex !== activeCard) {
      setActiveCard(targetIndex);
      onActiveChange?.(targetIndex);
    }
  }, [activeCard, cardLength, onActiveChange]);

  // Motion 滚动监听
  const { scrollYProgress: desktopProgress } = useScroll({
    container: desktopScrollRef,
  });
  useMotionValueEvent(desktopProgress, "change", checkDesktopActive);

  const { scrollYProgress: mobileProgress } = useScroll({
    container: mobileScrollRef,
  });
  useMotionValueEvent(mobileProgress, "change", checkMobileActive);

  useEffect(() => {
    if (window.innerWidth >= 768) {
      checkDesktopActive();
    } else {
      checkMobileActive();
    }
  }, [checkDesktopActive, checkMobileActive]);

  const currentItem = content[activeCard] ?? content[0];

  const currentImage = useMemo(() => {
    if (currentItem?.bgImage) return currentItem.bgImage;
    return extractImageSrc(currentItem?.content);
  }, [currentItem]);

  return (
    <div
      className={cn(
        "relative w-full max-w-[820px] mx-auto h-[34rem] sm:h-[35rem] md:h-[400px] rounded-2xl overflow-hidden border border-white/15 shadow-2xl transition-all duration-700 select-none bg-[#070b14]",
        containerClassName,
      )}
    >
      {/* ========================================================================= */}
      {/* 🌟 核心大背景：整框放大模糊背景 + 呼吸感微动，四图无缝 Crossfade         */}
      {/* ========================================================================= */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            scale: enableBreathing ? [1.08, 1.15, 1.08] : 1.1,
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
          className="absolute -inset-10 will-change-transform"
        >
          <AnimatePresence>
            <motion.div
              key={`bg-img-${activeCard}-${currentImage}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="absolute inset-0 will-change-transform"
              style={{
                backgroundImage: `url("${currentImage}")`,
                backgroundPosition: "center center",
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                filter: `blur(${blurAmount}px) saturate(1.35) brightness(${brightness})`,
              }}
            />
          </AnimatePresence>
        </motion.div>

        {/* 优雅通透磨砂遮罩 */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundColor: `rgba(6, 10, 18, ${overlayOpacity})`,
            backgroundImage:
              "radial-gradient(circle at 60% 45%, rgba(0,0,0,0.02) 0%, rgba(5,8,16,0.45) 75%, rgba(3,5,12,0.80) 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent pointer-events-none" />
      </div>

      {/* ========================================================================= */}
      {/* 📱 手机端专属结构（< md）：上方固定定格卡片 + 下方阅读窗黄金锚点精准追踪       */}
      {/* ========================================================================= */}
      <div className="flex md:hidden flex-col h-full w-full max-w-[340px] mx-auto px-2 pt-3 pb-3 relative z-10">
        {/* 上方定格图片卡片 */}
        <div className="shrink-0 w-full mb-3 z-20">
          <div className="overflow-hidden rounded-2xl border border-white/25 shadow-2xl bg-slate-900/60 backdrop-blur-xl">
            <div className="h-48 w-full overflow-hidden relative bg-slate-900">
              <AnimatePresence initial={false}>
                <motion.div
                  key={`mobile-card-${activeCard}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="absolute inset-0 h-full w-full"
                >
                  {currentItem?.content ?? null}
                </motion.div>
              </AnimatePresence>

              {/* 卡片右上角极简小药丸指示器 */}
              <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-md border border-white/10">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>{activeCard + 1} / {content.length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 下方文字独立滚动窗：顶底双向优雅渐变消隐，物理边界在卡片下方，100% 杜绝穿帮 */}
        <div
          ref={mobileScrollRef}
          onScroll={checkMobileActive}
          className="flex-1 w-full overflow-y-auto no-scrollbar relative"
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0px, black 20px, black 85%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent 0px, black 20px, black 85%, transparent 100%)",
            scrollBehavior: "smooth",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="pt-2 pb-24">
            {content.map((item, index) => {
              const isActive = activeCard === index;
              return (
                <div
                  key={"m-" + item.title + index}
                  ref={(el) => {
                    mobileItemRefs.current[index] = el;
                  }}
                  className="flex flex-col justify-start pt-2.5 pb-4 transition-opacity duration-300"
                >
                  <motion.div
                    animate={{
                      opacity: isActive ? 1 : 0.28,
                      scale: isActive ? 1 : 0.98,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={cn(
                          "inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold transition-all",
                          isActive
                            ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/50 scale-105"
                            : "bg-white/15 text-slate-300",
                        )}
                      >
                        0{index + 1}
                      </span>
                      {isActive && (
                        <span className="text-[11px] font-bold tracking-wider text-cyan-300 uppercase">
                          Current Focus
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                      {item.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-slate-100/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
                      {item.description}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 💻 桌面端专属结构（>= md）：官方标准左右分栏，首块文字与图片自然顶齐     */}
      {/* ========================================================================= */}
      <div
        ref={desktopScrollRef}
        onScroll={checkDesktopActive}
        className="hidden md:flex md:flex-row md:items-start md:justify-between md:gap-8 h-full w-full overflow-y-auto no-scrollbar relative z-10 px-8 py-[50px]"
        style={{ scrollBehavior: "smooth" }}
      >
        {/* 左侧文字列表：内容自然展开，原 300px 行高中的留白减半 */}
        <div className="w-[50%] max-w-[380px]">
          {content.map((item, index) => {
            const isActive = activeCard === index;
            return (
              <div
                key={"d-" + item.title + index}
                ref={(el) => {
                  desktopItemRefs.current[index] = el;
                }}
                className="flex flex-col justify-center transition-opacity duration-300"
              >
                <motion.div
                  animate={{
                    opacity: isActive ? 1 : 0.28,
                    scale: isActive ? 1 : 0.98,
                  }}
                  transition={{ duration: 0.35 }}
                >
                  <div className="mb-2.5 flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold transition-all",
                        isActive
                          ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/40 scale-105"
                          : "bg-white/10 text-slate-400",
                      )}
                    >
                      0{index + 1}
                    </span>
                    {isActive && (
                      <span className="text-xs font-bold tracking-wider text-cyan-400 uppercase">
                        Active Focus
                      </span>
                    )}
                  </div>

                  <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm lg:text-base leading-relaxed text-slate-100/90 drop-shadow-[0_1px_5px_rgba(0,0,0,0.8)]">
                    {item.description}
                  </p>
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* 右侧吸顶卡片：sticky top-0 紧贴 50px 内边距线，上下各留 50px 绝对垂直居中，全周期 0 漂移 0 沉底 */}
        <div className="w-[340px] shrink-0 sticky top-0">
          <div
            className={cn(
              "relative h-[300px] w-[340px] overflow-hidden rounded-2xl shadow-2xl border border-white/20 backdrop-blur-md transition-all duration-500 bg-slate-900",
              contentClassName,
            )}
          >
            <AnimatePresence initial={false}>
              <motion.div
                key={`desktop-card-${activeCard}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="absolute inset-0 h-full w-full"
              >
                {currentItem?.content ?? null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

    </div>
  );
};
