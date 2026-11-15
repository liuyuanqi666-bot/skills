"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { FocusCardItem, FocusCardsProps } from "./types";

interface CardProps<T extends FocusCardItem = FocusCardItem> {
  card: T;
  index: number;
  hovered: number | null;
  setHovered: (index: number | null) => void;
  isMobile: boolean;
  aspectRatio?: string;
  renderCustomDetails?: (card: T, isHovered: boolean) => React.ReactNode;
}

function CardComponent<T extends FocusCardItem = FocusCardItem>({
  card,
  index,
  hovered,
  setHovered,
  isMobile,
  aspectRatio = "3/4",
  renderCustomDetails
}: CardProps<T>) {
  const isHovered = hovered === index;
  const isOtherHovered = hovered !== null && !isHovered;

  const isScrollingRef = useRef(false);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleCardTouchStart = (e: React.TouchEvent) => {
    touchStartPosRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    isScrollingRef.current = false;
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    const deltaX = Math.abs(e.touches[0].clientX - touchStartPosRef.current.x);
    const deltaY = Math.abs(e.touches[0].clientY - touchStartPosRef.current.y);
    if (deltaX > 6 || deltaY > 6) {
      isScrollingRef.current = true;
    }
  };

  const handleCardTouchEnd = () => {
    if (isScrollingRef.current) {
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 100);
    }
    touchStartPosRef.current = null;
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isScrollingRef.current) {
      e.stopPropagation();
      return;
    }
    // 兼容触屏点击交互：未展开时点击展开，已展开时点击任意处收回还原
    setHovered(isHovered ? null : index);
  }, [isHovered, index, setHovered]);

  return (
    <div
      onMouseEnter={() => { if (!isMobile) setHovered(index); }}
      onMouseLeave={() => { if (!isMobile) setHovered(null); }}
      onTouchStart={handleCardTouchStart}
      onTouchMove={handleCardTouchMove}
      onTouchEnd={handleCardTouchEnd}
      onClick={handleClick}
      style={{
        aspectRatio: isMobile ? undefined : aspectRatio,
        minHeight: isMobile ? "220px" : undefined,
      }}
      className={`relative w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-900 cursor-pointer select-none transition-all duration-300 ease-out ${
        isOtherHovered ? "blur-xs scale-[0.98] opacity-65" : "opacity-100 scale-100"
      }`}
    >
      {/* 图层 1：正面大图 (保持原版图片展示) */}
      <img
        src={card.src}
        alt={card.title}
        className="w-full h-full object-cover absolute inset-0 pointer-events-none"
        loading="lazy"
      />

      {/* 图层 2：原有灰色遮罩 (100% 沿用官方原版实现与动画：bg-black/50 + transition-opacity duration-300，遮罩本身不做生长) */}
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 pointer-events-none z-10 ${
          isHovered ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* 图层 3：文字内容层 (位于灰色遮罩上层，标题与详情同层级，正面展示状态下维持该层级关系) */}
      <div
        className={`absolute inset-x-0 bottom-0 max-h-full z-20 flex flex-col pointer-events-none ${
          isMobile ? "p-2.5" : "p-4 md:p-5"
        }`}
      >
        {/* 标题模块：放置在正面大图下方；触发时跟随详情文字向上生长入场 */}
        <div className="flex items-center justify-between gap-2 shrink-0 pointer-events-auto transition-transform duration-300 ease-out">
          <div
            className={`font-bold text-white drop-shadow-md tracking-tight ${
              isMobile ? "text-xs line-clamp-1" : "text-base md:text-xl line-clamp-1"
            }`}
          >
            {card.title}
          </div>
          {card.price && (
            <span
              className={`font-bold text-amber-400 font-mono shrink-0 drop-shadow-sm ${
                isMobile ? "text-[11px]" : "text-sm md:text-base"
              }`}
            >
              {card.price}
            </span>
          )}
        </div>

        {/* 详情文字模块：在原有灰色遮罩之上，仅详情文字执行向上生长入场动画 (纯文字，无图片) */}
        <div
          className="transition-all duration-300 ease-out overflow-hidden min-h-0"
          style={{
            display: "grid",
            gridTemplateRows: isHovered ? "1fr" : "0fr",
            opacity: isHovered ? 1 : 0
          }}
        >
          <div
            tabIndex={isHovered ? 0 : -1}
            aria-label="卡片完整详情"
            onTouchMove={(e) => {
              handleCardTouchMove(e);
              e.stopPropagation();
            }}
            className="min-h-0 overflow-y-auto overscroll-contain pointer-events-auto touch-pan-y [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex flex-col gap-1.5 pt-2"
          >
            {(renderCustomDetails || card.renderCustomDetails) ? (renderCustomDetails ? renderCustomDetails(card, isHovered) : card.renderCustomDetails!(card, isHovered)) : <>
            {/* 标签与天数 */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {card.badge1 && (
                <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-sm bg-sky-500/25 text-sky-300 border border-sky-500/30 font-semibold font-mono">
                  {card.badge1}
                </span>
              )}
              <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-sm bg-emerald-500/25 text-emerald-300 border border-emerald-500/30">
                {card.badge2 || "资料待补充"}
              </span>
              {card.subtitle && (
                <span className="text-[9px] md:text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-500/25 text-amber-300 border border-amber-500/30 font-mono">
                  {card.subtitle}
                </span>
              )}
              {card.tags && (
                <div className="flex items-center gap-1">
                  {card.tags.slice(0, isMobile ? 1 : 2).map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[9px] md:text-[10px] text-neutral-200 px-1.5 py-0.5 rounded-sm bg-white/15 border border-white/20 whitespace-nowrap"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 行程亮点纯文字描述：移动端自适应字号并加 line-clamp 防溢出微滑块 */}
            {card.highlights && (
              <p
                className={`text-neutral-200 leading-relaxed ${
                  isMobile ? "text-[11px]" : "text-xs"
                }`}
              >
                {card.highlights}
              </p>
            )}
            {/* 路线轨迹与 CTA 按钮 */}
            <div className="pt-1.5 border-t border-white/15 flex shrink-0 items-center justify-between gap-2 mt-auto">
              <span
                className={`text-neutral-300 break-words font-mono ${
                  isMobile ? "text-[9px] max-w-[62%]" : "text-[11px] max-w-[70%]"
                }`}
              >
                📍 {card.footerLabel || "详情咨询旅行管家"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (card.onCtaClick) card.onCtaClick();
                }}
                className="shrink-0 pointer-events-auto text-[9px] md:text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white px-2 py-0.5 md:px-2.5 md:py-1 rounded-sm shadow-sm active:scale-95 transition-all"
              >
                {card.ctaText || "查看行程"}
              </button>
            </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Card = React.memo(CardComponent) as typeof CardComponent;

export function FocusCards<T extends FocusCardItem = FocusCardItem>({
  cards,
  className = "",
  aspectRatio = "3/4",
  mobilePageSize = 4,
  desktopPageSize = 6,
  enablePagination = true,
  enableSwipe = true,
  renderCustomDetails
}: FocusCardsProps<T>) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | null>(null);

  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // 响应式屏幕感知 (<= 640px 手机端启用 2x2 一屏自适应)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const pageSize = isMobile ? mobilePageSize : desktopPageSize;
  const totalPages = Math.ceil(cards.length / pageSize);
  const showPagination = enablePagination && cards.length > pageSize;

  useEffect(() => {
    if (currentPage >= totalPages) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const startIndex = currentPage * pageSize;
  const visibleCards = enablePagination ? cards.slice(startIndex, startIndex + pageSize) : cards;

  const handlePrevPage = useCallback(() => {
    if (currentPage > 0) {
      setSlideDirection("prev");
      setCurrentPage((prev) => prev - 1);
      setHovered(null);
    }
  }, [currentPage]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setSlideDirection("next");
      setCurrentPage((prev) => prev + 1);
      setHovered(null);
    }
  }, [currentPage, totalPages]);

  // 手势滑动翻页监听
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!enableSwipe || !enablePagination) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!enableSwipe || !enablePagination) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNextPage();
      } else {
        handlePrevPage();
      }
    }
  };

  return (
    <div
      className={`w-full flex flex-col h-auto ${
        isMobile ? "p-2" : "max-w-6xl mx-auto md:px-6 py-4"
      } ${className}`}
    >
      {/* 
        卡片网格布局：
        1. 保持行间距与列间距为固定常数 (移动端10px / 桌面端12px)，不随容器高度拉伸产生误差
        2. align-content: start，数据不足时保持标准3:4尺寸渲染，剩余区域直接留白，禁止卡片拉伸填充
      */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className={`w-full transition-all duration-300 ${
          isMobile
            ? "grid grid-cols-2 gap-2.5 content-start"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 content-start"
        } ${
          slideDirection === "next"
            ? "animate-slide-next"
            : slideDirection === "prev"
            ? "animate-slide-prev"
            : ""
        }`}
        onAnimationEnd={() => setSlideDirection(null)}
      >
        {visibleCards.map((card, idx) => {
          const globalIdx = startIndex + idx;
          return (
            <Card
              key={`${card.title}-${globalIdx}`}
              card={card}
              index={globalIdx}
              hovered={hovered}
              setHovered={setHovered}
              isMobile={isMobile}
              aspectRatio={aspectRatio}
              renderCustomDetails={renderCustomDetails}
            />
          );
        })}
      </div>

      {/* 
        分页栏：
        与第二排卡片底部设置固定值间距 (移动端 mt-2.5 10px，桌面端 mt-3 12px)，
        绝不使用 margin-top: auto 产生多余巨大黑色空白。整个组件大小随卡片内容紧凑收缩。
      */}
      {showPagination && (
        <div
          className={`flex items-center justify-between shrink-0 bg-neutral-900/85 border border-white/10 rounded-xl backdrop-blur-md px-3 py-1.5 ${
            isMobile ? "mt-2.5 w-full" : "mt-3 mx-auto max-w-md w-full"
          }`}
        >
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="text-xs text-neutral-300 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-300 transition-colors px-2 py-1 rounded-sm flex items-center gap-1 font-medium"
          >
            ← 上一页
          </button>

          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalPages }).map((_, p) => (
              <button
                key={p}
                onClick={() => {
                  setSlideDirection(p > currentPage ? "next" : "prev");
                  setCurrentPage(p);
                  setHovered(null);
                }}
                className={`transition-all duration-300 rounded-full ${
                  p === currentPage
                    ? "w-5 h-1.5 bg-sky-400"
                    : "w-1.5 h-1.5 bg-neutral-600 hover:bg-neutral-400"
                }`}
                title={`第 ${p + 1} 页`}
              />
            ))}
            <span className="text-[10px] font-mono text-neutral-400 ml-1.5">
              {currentPage + 1} / {totalPages}
            </span>
          </div>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="text-xs text-neutral-300 hover:text-white disabled:opacity-30 disabled:hover:text-neutral-300 transition-colors px-2 py-1 rounded-sm flex items-center gap-1 font-medium"
          >
            下一页 →
          </button>
        </div>
      )}
    </div>
  );
}
