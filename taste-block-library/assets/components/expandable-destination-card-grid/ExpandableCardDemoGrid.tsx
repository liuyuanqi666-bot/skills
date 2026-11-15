"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOutsideClick } from "../../shared/use-outside-click";

export type ExpandableItem = (typeof defaultCards)[number];

export function ExpandableCardDemoGrid({ items = defaultCards }: { items?: ExpandableItem[] } = {}) {
  const cards = items;
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(null);
  const id = useId();
  const ref = useRef<HTMLDivElement>(null);

  // 响应式可见数量：手机端最多3条，桌面端最多4条
  const [isMobile, setIsMobile] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const maxCount = isMobile ? 3 : 4;
  const visibleCards = cards.length > maxCount && !expanded ? cards.slice(0, maxCount) : cards;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    const isOpen = active && typeof active === "object";
    if (isOpen) document.body.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (isOpen) document.body.style.overflow = previousOverflow;
    };
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      {/*
        修复 1: 单个 AnimatePresence 统一调度全部 exit 动画
        官方使用两个独立 AnimatePresence（背景 + 弹窗），退场帧
        不同步，产生图片闪白 & 文字残留小虚影。合并后彻底解决。
      */}
      <AnimatePresence>
        {active && typeof active === "object" && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActive(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs h-full w-full"
            />

            {/* 关闭按钮：全端显示（官方仅 lg:hidden，桌面用户体验差） */}
            <motion.button
              key={`button-close-${cards.indexOf(active)}-${id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.1 } }}
              className="flex absolute top-4 right-4 items-center justify-center bg-black/60 hover:bg-black/80 text-white rounded-full h-8 w-8 shadow-md z-30 cursor-pointer backdrop-blur-xs"
              onClick={() => setActive(null)}
              aria-label="Close"
            >
              <CloseIcon />
            </motion.button>

            {/*
              修复 2: 弹窗改为浮层式 (max-h-[88vh] + 全端圆角)
              官方 h-full md:h-fit sm:rounded-3xl 在手机上占满整屏
              且根本没有圆角，失去"卡片展开"的质感。
            */}
            <motion.div
              layoutId={`card-${cards.indexOf(active)}-${id}`}
              ref={ref}
              className="relative z-20 w-full max-w-[500px] h-fit max-h-[88vh] flex flex-col bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-neutral-200/60 dark:border-neutral-800"
            >
              {/*
                修复 3: layoutId="image-..." 仅包裹纯净 <img>
                不含任何背景色、边框差异，否则 Motion 会将差异渲染
                为独立灰色覆盖层，产生展开/退场时的小虚影 ghost。
              */}
              <div className="relative w-full">
                <motion.div layoutId={`image-${cards.indexOf(active)}-${id}`}>
                  <img
                    src={active.src}
                    alt={active.title}
                    className="w-full h-52 sm:h-64 object-cover object-top"
                  />
                </motion.div>
                {/* 标签叠层：纯 opacity 淡入淡出，不参与 FLIP */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-3 left-4 px-2.5 py-1 rounded-md text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/15"
                >
                  {active.tag}
                </motion.div>
              </div>

              <div>
                <div className="flex justify-between items-start p-4 sm:p-5 pb-2">
                  <div className="pr-3 min-w-0 flex-1">
                    <motion.h3
                      layoutId={`title-${cards.indexOf(active)}-${id}`}
                      className="font-bold text-base sm:text-lg text-neutral-800 dark:text-neutral-100 leading-snug"
                    >
                      {active.title}
                    </motion.h3>
                    <motion.p
                      layoutId={`description-${cards.indexOf(active)}-${id}`}
                      className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm mt-1 leading-relaxed"
                    >
                      {active.description}
                    </motion.p>
                  </div>
                  {/*
                    修复 4: CTA 按钮使用 layoutId 实现 FLIP 飞跃
                    官方弹窗 CTA 用 motion.a layout + opacity initial/exit，
                    列表卡片底部对应有相同 layoutId 的按钮，展开/关闭均
                    平滑 FLIP，不再出现按钮凭空闪现/消失的问题。
                  */}
                  <motion.button
                    layoutId={`button-${cards.indexOf(active)}-${id}`}
                    onClick={() => active.ctaLink ? window.open(active.ctaLink, "_blank", "noopener,noreferrer") : setActive(null)}
                    className="px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded-full font-bold bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 shadow-xs self-start mt-0.5 cursor-pointer whitespace-nowrap"
                  >
                    查看详情
                  </motion.button>
                </div>

                <div className="pt-2 relative px-4 sm:px-5">
                  <motion.div
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-neutral-600 text-xs sm:text-sm h-44 sm:h-fit max-h-[35vh] pb-8 flex flex-col items-start gap-3 overflow-auto dark:text-neutral-300 [mask:linear-gradient(to_bottom,white,white,transparent)] [scrollbar-width:none] [-ms-overflow-style:none] [-webkit-overflow-scrolling:touch] leading-relaxed"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 网格列表：sm(640px+)及以上均为 2 列，手机(< 640px) 1 列全宽 */}
      <ul className="max-w-2xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 items-start gap-3 sm:gap-4 px-2 sm:px-4 md:px-0">
        {visibleCards.map((card) => (
          <motion.div
            layoutId={`card-${cards.indexOf(card)}-${id}`}
            key={`card-${cards.indexOf(card)}-${id}`}
            onClick={() => setActive(card)}
            className="flex flex-col cursor-pointer rounded-xl border border-neutral-200/80 dark:border-neutral-800/60 bg-white dark:bg-neutral-900/60 shadow-xs hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700 select-none"
          >
            {/* 图片区：加内边距 + 图片自带圆角，还原参考图样式 */}
            <div className="relative mx-2.5 mt-2.5">
              <motion.div layoutId={`image-${cards.indexOf(card)}-${id}`}>
                <img
                  src={card.src}
                  alt={card.title}
                  className="w-full h-36 sm:h-48 md:h-44 lg:h-52 rounded-xl object-cover object-top"
                />
              </motion.div>
              {/* 标签：相对于图片容器绝对定位，偏移量适配内边距 */}
              <div className="absolute top-2 left-2 px-2.5 py-1 rounded-md text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/15">
                {card.tag}
              </div>
            </div>

            <div className="p-3 sm:p-4 flex flex-col gap-1">
              <motion.h3
                layoutId={`title-${cards.indexOf(card)}-${id}`}
                className="font-bold text-sm sm:text-base text-neutral-800 dark:text-neutral-100 leading-snug line-clamp-1 sm:line-clamp-none"
              >
                {card.title}
              </motion.h3>
              <motion.p
                layoutId={`description-${cards.indexOf(card)}-${id}`}
                className="text-neutral-500 dark:text-neutral-400 text-xs sm:text-sm leading-relaxed line-clamp-1 sm:line-clamp-2"
              >
                {card.description}
              </motion.p>
              {/* 按钮：统一绿色 + 与弹窗相同的 hover 效果 */}
              <motion.button
                layoutId={`button-${cards.indexOf(card)}-${id}`}
                className="mt-1.5 sm:mt-2 w-full py-2 text-xs font-semibold rounded-full bg-emerald-600 hover:bg-emerald-500 text-white whitespace-nowrap"
              >
                查看详情
              </motion.button>
            </div>
          </motion.div>
        ))}
      </ul>

      {/* 超出最大数量时的展开/收起按钮 */}
      {cards.length > maxCount && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full cursor-pointer border border-neutral-200/80 dark:border-neutral-700 shadow-xs active:scale-95"
          >
            <span>{expanded ? "收起列表" : `展开更多 (${cards.length - maxCount})`}</span>
            <motion.svg
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-3.5 h-3.5 text-neutral-500 group-hover:text-neutral-700 dark:text-neutral-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </motion.svg>
          </button>
        </div>
      )}
    </>
  );
}

export const CloseIcon = () => {
  return (
    <motion.svg
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.05 } }}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 text-white"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <path d="M18 6l-12 12" />
      <path d="M6 6l12 12" />
    </motion.svg>
  );
};

export const defaultCards = ["https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80", "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80"].map((src, index) => ({
  src, title: `空间与风景 · 示例 ${index + 1}`, tag: "演示素材",
  description: "仅用于布局和交互测试 · 具体地点与服务资料待补充",
  ctaText: "查看详情", ctaLink: "",
  content: () => <p>{Array.from({length:4},(_,i)=><span key={i}>这是一段用于浮层滚动测试的示例说明。当前图片并不代表特定酒店或旅游服务，名称、设施、价格、排期及服务内容均待正式资料补充。请上下滚动检查文字是否被裁切，关闭后再展开以验证交互是否完整。<br/><br/></span>)}</p>
}));
