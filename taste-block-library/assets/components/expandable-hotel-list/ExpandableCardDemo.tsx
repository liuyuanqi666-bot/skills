"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import "./hotel-list.css";
import { useOutsideClick } from "../../shared/use-outside-click";

export type ExpandableItem = (typeof defaultCards)[number];

export function ExpandableCardDemo({ items = defaultCards }: { items?: ExpandableItem[] } = {}) {
  const cards = items;
  const [active, setActive] = useState<(typeof cards)[number] | boolean | null>(
    null
  );
  const ref = useRef<HTMLDivElement>(null);
  const [scrollLocked, setScrollLocked] = useState(false);
  const id = useId();
  const reducedMotion = useReducedMotion();
  // Use the official demo's default shared-layout transition, with mobile text correction.
  const layoutTransition = reducedMotion ? { duration: 0 } : undefined;
  const [mobile, setMobile] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  const opening = useRef(false);
  const openCard = async (card: ExpandableItem, element: HTMLElement) => {
    if (scrollLocked || opening.current) return;
    opening.current = true;
    // Decode the already displayed cover before handing it to the expanded image.
    const image = element.querySelector("img");
    try { await image?.decode(); } catch { /* Keep the text details available if the cover fails. */ }
    opening.current = false;
    setScrollLocked(true);
    setActive(card);
  };

  // 默认最多显示五条，超过后加下拉展开UI
  const [expanded, setExpanded] = useState(false);
  const visibleCards = cards.length > 5 && !expanded ? cards.slice(0, 5) : cards;

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    if (scrollLocked) document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      if (scrollLocked) document.body.style.overflow = previousOverflow;
    };
  }, [scrollLocked]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && typeof active === "object" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 h-full w-full z-[90]"
          />
        )}
      </AnimatePresence>
      <AnimatePresence onExitComplete={() => { if (!active) setScrollLocked(false); }}>
        {active && typeof active === "object" ? (
          <motion.div layoutRoot initial={false} role="dialog" aria-modal="true" aria-label={active.title} className="fixed inset-0 z-[100]">
            <motion.div layoutScroll className="hotel-overlay absolute inset-0 p-4 sm:p-0 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {/* 修复官方 lg:hidden 导致电脑大屏丢失关闭按钮，并优化在移动端贴刘海的问题 */}
            <motion.button
              key={`button-${cards.indexOf(active)}-${id}`}
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 0.05,
                },
              }}
              className="flex absolute top-4 right-4 items-center justify-center bg-black/50 hover:bg-black/70 text-white rounded-full h-8 w-8 shadow-md z-20 cursor-pointer backdrop-blur-xs transition-colors"
              onClick={() => setActive(null)}
              aria-label="关闭酒店详情"
            >
              <CloseIcon />
            </motion.button>
            {/* 修复官方在手机端 h-full 且无圆角的问题，手机端增加 rounded-2xl 并留出舒适边距 */}
            <motion.div
              layoutId={`card-${cards.indexOf(active)}-${id}`}
              ref={ref}
              transition={{ layout: layoutTransition }}
              className="hotel-expanded w-full max-w-[780px] h-fit flex flex-col bg-white dark:bg-neutral-900 rounded-2xl sm:rounded-3xl overflow-visible shadow-2xl mx-auto my-10"
            >
              <motion.div layoutId={`image-${cards.indexOf(active)}-${id}`} transition={{ layout: layoutTransition }}>
                {/* Keep the existing responsive cover dimensions. */}
                <img
                  decoding="async"
                  style={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}
                  width={200}
                  height={200}
                  src={active.src}
                  alt={active.title}
                  className="w-full h-56 sm:h-80 sm:rounded-tr-lg sm:rounded-tl-lg object-cover object-top"
                />
              </motion.div>

              <div>
                <div className="flex justify-between items-start p-4 pb-2">
                  <div className="pr-2">
                    <motion.h3 layout={mobile ? "position" : true} layoutId={`title-${cards.indexOf(active)}-${id}`} transition={{ layout: layoutTransition }} className="font-bold text-base sm:text-lg text-neutral-800 dark:text-neutral-100">
                      {active.title}
                    </motion.h3>
                    <motion.div layout="position" layoutId={`tag-${cards.indexOf(active)}-${id}`} transition={{ layout: layoutTransition }} className="mt-0.5 sm:mt-1"><span className="inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60">{active.tag}</span></motion.div>
                    <motion.p layout={mobile ? "position" : true} layoutId={`description-${cards.indexOf(active)}-${id}`} transition={{ layout: layoutTransition }} className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed">
                      {active.description}
                    </motion.p>
                  </div>

                  <motion.a
                    layoutId={`button-${cards.indexOf(active)}-${id}`}
                    transition={{ layout: layoutTransition }}
                    href={active.ctaLink || undefined}
                    onClick={(event) => { if (!active.ctaLink) { event.preventDefault(); setActive(null); } }}
                    target="_blank"
                    className="px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-full font-bold bg-[#934d3c] hover:bg-[#793e30] text-white shrink-0 transition-colors shadow-xs"
                  >
                    返回列表
                  </motion.a>
                </div>
                <div className="pt-2 relative px-4">
                  {/* Correct the long body independently while the shared card scales. */}
                  <motion.div
                    layout
                    transition={{ layout: layoutTransition }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hotel-body text-neutral-600 pb-8 flex flex-col items-start gap-4 whitespace-pre-line"
                  >
                    {typeof active.content === "function"
                      ? active.content()
                      : active.content}
                  </motion.div>
                </div>
              </div>
            </motion.div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <ul className="w-full max-w-[340px] sm:max-w-xl md:max-w-2xl mx-auto flex flex-col gap-2.5 sm:gap-3 px-1 sm:px-0">
        {visibleCards.map((card) => (
          <motion.div
            layoutId={`card-${cards.indexOf(card)}-${id}`}
            key={`card-${cards.indexOf(card)}-${id}`}
            transition={{ layout: layoutTransition }}
            onClick={(event) => { void openCard(card, event.currentTarget); }}
            onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && !scrollLocked) { event.preventDefault(); void openCard(card, event.currentTarget); } }}
            role="button"
            tabIndex={0}
            /* 保持官方排版结构，仅微调移动端适配：sm:flex-row，移动端将图片尺寸微调避免傻大方块 */
            className="p-2 sm:p-4 flex flex-row gap-2 justify-between items-center hover:bg-neutral-50 dark:hover:bg-neutral-800/80 rounded-xl cursor-pointer border border-neutral-200/70 dark:border-neutral-800 shadow-xs"
          >
            <div className="flex gap-2 sm:gap-4 flex-row items-center flex-1 min-w-0">
              <motion.div className="shrink-0" layoutId={`image-${cards.indexOf(card)}-${id}`} transition={{ layout: layoutTransition }}>
                <img
                  decoding="async"
                  width={100}
                  height={100}
                  src={card.src}
                  alt={card.title}
                  className="h-16 w-16 sm:h-14 sm:w-14 max-w-none rounded-xl object-cover object-top shrink-0"
                />
              </motion.div>
              <div className="flex-1 min-w-0 text-left">
                <motion.h3 layout={mobile ? "position" : true} layoutId={`title-${cards.indexOf(card)}-${id}`} transition={{ layout: layoutTransition }} className="font-bold text-xs sm:text-base text-neutral-800 dark:text-neutral-100 truncate leading-snug">
                  {card.title}
                </motion.h3>
                <motion.div layout="position" layoutId={`tag-${cards.indexOf(card)}-${id}`} transition={{ layout: layoutTransition }} className="mt-0.5 sm:mt-1"><span className="inline-block px-1.5 py-0.5 rounded-sm text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60">{card.tag}</span></motion.div>
                <motion.p layout={mobile ? "position" : true} layoutId={`description-${cards.indexOf(card)}-${id}`} transition={{ layout: layoutTransition }} className="text-[11px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed">
                  {card.description}
                </motion.p>
              </div>
            </div>
            <motion.span
              layoutId={`button-${cards.indexOf(card)}-${id}`}
              transition={{ layout: layoutTransition }}
              className="shrink-0 px-2.5 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-semibold rounded-full bg-neutral-100 hover:bg-[#934d3c] hover:text-white dark:bg-neutral-800 dark:hover:bg-[#934d3c] text-neutral-800 dark:text-neutral-200 self-center whitespace-nowrap active:scale-95"
            >
              查看详情
            </motion.span>
          </motion.div>
        ))}
      </ul>

      {/* 需求新增功能：超过 5 条时好看简易的下拉展开 UI */}
      {cards.length > 5 && (
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="group flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-full transition-all cursor-pointer border border-neutral-200/80 dark:border-neutral-700 shadow-xs active:scale-95"
          >
            <span>{expanded ? "收起列表" : `展开更多 (${cards.length - 5})`}</span>
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
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      exit={{
        opacity: 0,
        transition: {
          duration: 0.05,
        },
      }}
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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

// 旅游线路产品文案：深入具体的特色住宿与核心目的地
export const defaultCards = ["https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1000&q=80", "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1000&q=80"].map((src, index) => ({
  src, title: `空间与风景 · 示例 ${index + 1}`, tag: "演示素材",
  description: "仅用于布局和交互测试 · 具体地点与服务资料待补充",
  ctaText: "查看详情", ctaLink: "",
  content: () => <p>{Array.from({length:4},(_,i)=><span key={i}>这是一段用于浮层滚动测试的示例说明。当前图片并不代表特定酒店或旅游服务，名称、设施、价格、排期及服务内容均待正式资料补充。请上下滚动检查文字是否被裁切，关闭后再展开以验证交互是否完整。<br/><br/></span>)}</p>
}));

