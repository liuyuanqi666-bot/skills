"use client";
import React, { useEffect, useId, useRef, useState } from "react";
import {
  motion,
  useTransform,
  useMotionValue,
  animate,
  useScroll,
  useSpring,
  useMotionValueEvent,
} from "motion/react";
import { cn } from "../../../../shared/utils";

export interface TracingBeamProps {
  children: React.ReactNode;
  className?: string;
  /**
   * 是否在整页触底后补全剩余光束；常规滚动采用2215px基准的比例映射
   * @default true
   */
  reachBottom?: boolean;
}

export const TracingBeam = ({
  children,
  className,
  reachBottom = true,
}: TracingBeamProps) => {
  const ref = useRef<HTMLDivElement>(null);

  // 官方进度区间保持不变；空间数值按用户认可的2215px参考高度同比缩放。
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const contentRef = useRef<HTMLDivElement>(null);
  const [svgHeight, setSvgHeight] = useState(0);

  // 动态监听内容区域高度变化
  useEffect(() => {
    if (!contentRef.current) return;
    const updateHeight = () => {
      if (contentRef.current) {
        setSvgHeight(contentRef.current.offsetHeight);
      }
    };
    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(contentRef.current);
    window.addEventListener("resize", updateHeight);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, []);

  const [isAtBottom, setIsAtBottom] = useState(false);
  useEffect(() => {
    const check = () => setIsAtBottom(window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 4);
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    return () => { window.removeEventListener("scroll", check); window.removeEventListener("resize", check); };
  }, []);
  const glide = useMotionValue(0);
  useEffect(() => {
    if (!reachBottom || !isAtBottom) { glide.set(0); return; }
    const controls = animate(glide, 1, { duration: 0.8, ease: t => 1 - Math.pow(1 - t, 1.4) });
    return () => controls.stop();
  }, [reachBottom, isAtBottom, glide]);

  const startY = svgHeight * (50 / 2215);
  const tailInset = svgHeight * (200 / 2215);
  const finishInset = svgHeight * (60 / 2215);
  const ratioY1 = useTransform(scrollYProgress, [0, 0.8], [startY, svgHeight]);
  const ratioY2 = useTransform(scrollYProgress, [0, 1], [startY, svgHeight - tailInset]);
  const targetY1 = useTransform([ratioY1, glide], ([base, progress]) => Number(base) + (svgHeight - Number(base)) * Number(progress));
  const targetY2 = useTransform([ratioY2, glide], ([base, progress]) => Number(base) + (svgHeight - finishInset - Number(base)) * Number(progress));

  const y1 = useSpring(targetY1, {
    stiffness: 500,
    damping: 90,
  });

  const y2 = useSpring(targetY2, {
    stiffness: 500,
    damping: 90,
  });

  // 状态指示圆点动态响应
  const [hasScrolled, setHasScrolled] = useState(false);
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    setHasScrolled(latest > 0.01);
  });

  const pathD = `M 1 0V -36 l 18 24 V ${svgHeight * 0.8} l -18 24V ${svgHeight}`;

  // 安全唯一的渐变 ID，防止多组件在同一页面冲突
  const rawId = useId();
  const gradientId = `tracing-beam-gradient-${rawId.replace(/:/g, "")}`;

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative mx-auto h-full w-full max-w-4xl px-6",
        className
      )}
    >
      {/* 轨道与内容各自占位；内容缩进不依赖调用页补偿。 */}
      <div className="absolute top-3 -left-4 lg:-left-20 pointer-events-none">
        <motion.div
          transition={{
            duration: 0.2,
            delay: 0.5,
          }}
          animate={{
            boxShadow: hasScrolled
              ? "none"
              : "rgba(0, 0, 0, 0.24) 0px 3px 8px",
          }}
          className="border-neutral-200 dark:border-neutral-700 ml-[27px] flex h-4 w-4 items-center justify-center rounded-full border shadow-xs transition-colors"
        >
          <motion.div
            transition={{
              duration: 0.2,
              delay: 0.5,
            }}
            animate={{
              backgroundColor: hasScrolled ? "#ffffff" : "#10b981",
              borderColor: hasScrolled ? "#ffffff" : "#059669",
            }}
            className="h-2 w-2 rounded-full border border-neutral-300 bg-white"
          />
        </motion.div>
        <svg
          viewBox={`0 0 20 ${svgHeight}`}
          width="20"
          height={svgHeight}
          className="ml-4 block"
          aria-hidden="true"
        >
          {/* 底轨灰线：手机端直轨防溢出，桌面端保留二次折线 */}
          <motion.path
            d={pathD}
            fill="none"
            stroke="#9091A0"
            strokeOpacity="0.16"
            transition={{
              duration: 10,
            }}
          />
          {/* 轨迹光束，随滚动擦除与填充渐变 */}
          <motion.path
            d={pathD}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="1.25"
            className="motion-reduce:hidden"
            transition={{
              duration: 10,
            }}
          />
          <defs>
            <motion.linearGradient
              id={gradientId}
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="#18CCFC" stopOpacity="0" />
              <stop stopColor="#18CCFC" />
              <stop offset="0.325" stopColor="#6344F5" />
              <stop offset="1" stopColor="#AE48FF" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
      </div>
      <div ref={contentRef} className="pl-4 lg:pl-0">{children}</div>
    </motion.div>
  );
};
