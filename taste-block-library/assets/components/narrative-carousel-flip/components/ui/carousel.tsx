"use client";
import { IconArrowNarrowRight } from "@tabler/icons-react";
import { useState, useRef, useId, useEffect } from "react";
import { InteractiveHoverButton } from "./interactive-hover-button";
import { RotateCcw } from "lucide-react";

export interface SlideData {
  title: string;
  category?: string;
  button?: string;
  src: string;
  highlights?: string[];
  description: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const Slide = ({ slide, index, current, handleSlideClick }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isButtonTriggered, setIsButtonTriggered] = useState(false);
  const hasAutoPlayedRef = useRef(false);
  const autoTimerRef = useRef<{ t1?: number; t2?: number }>({});
  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number | undefined>(undefined);

  // 切走非当前卡片时自动翻回正面，并重置动效与防重标记
  useEffect(() => {
    if (current !== index) {
      if (isFlipped) setIsFlipped(false);
      setIsButtonTriggered(false);
      hasAutoPlayedRef.current = false;
      clearTimeout(autoTimerRef.current.t1);
      clearTimeout(autoTimerRef.current.t2);
    }
  }, [current, index, isFlipped]);

  // 手机端：进入当前卡片稳定停留 1 秒后自动播放按钮动效，仅在此图片刚进入时执行一次！翻面绝不重新触发！
  useEffect(() => {
    if (current === index && !hasAutoPlayedRef.current) {
      const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;
      if (isMobile) {
        autoTimerRef.current.t1 = window.setTimeout(() => {
          hasAutoPlayedRef.current = true;
          setIsButtonTriggered(true);
          autoTimerRef.current.t2 = window.setTimeout(() => {
            setIsButtonTriggered(false);
          }, 1000);
        }, 1000);
      }
    }
    return () => {
      clearTimeout(autoTimerRef.current.t1);
      clearTimeout(autoTimerRef.current.t2);
    };
  }, [current, index]);

  // 点击交互具有绝对最高优先级：点击去背面必由白变暗，翻回正面必由暗变白
  const handleFlipToBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    clearTimeout(autoTimerRef.current.t1);
    clearTimeout(autoTimerRef.current.t2);
    // 1. 立即触发按钮暗黑高亮态
    setIsButtonTriggered(true);
    // 2. 微延时启动卡片翻转，让用户清晰感知按钮白->暗交互质感
    window.setTimeout(() => {
      setIsFlipped(true);
    }, 120);
  };

  const handleFlipToFront = () => {
    clearTimeout(autoTimerRef.current.t1);
    clearTimeout(autoTimerRef.current.t2);
    // 1. 启动卡片翻回正面
    setIsFlipped(false);
    // 2. 翻回过程中平滑过渡：按钮由暗变白
    window.setTimeout(() => {
      setIsButtonTriggered(false);
    }, 200);
  };

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isFlipped) return;
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, button = "探索故事", title, category = "深度故事", description, highlights = [] } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[82vw] h-[72vw] sm:w-[70vmin] sm:h-[70vmin] max-h-[480px] mx-[2vw] sm:mx-[4vmin] z-10 select-none"
        onClick={() => {
          if (current !== index) {
            handleSlideClick(index);
          }
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        {/* 核心翻转层：直接承载正反两个独立表面，杜绝套壳与多层嵌套 */}
        <div
          className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ================= 正面表面 (与影叙版100%同构的单一视觉表面，无额外套壳) ================= */}
          <div
            className="absolute inset-0 w-full h-full bg-black rounded-[1%] overflow-visible [clip-path:inset(0_round_1%)] [backface-visibility:hidden] [transform:rotateY(0deg)] transition-all duration-150 ease-out"
            style={{
              transform:
                current === index && !isFlipped
                  ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0) rotateY(0deg)"
                  : "rotateY(0deg)",
            }}
          >
            {/* 图片完全按影叙版标准配置，加 max-w-none 彻底解除 Tailwind 100% 宽度压制，彻底消灭黑边 */}
            <img
              className="absolute inset-0 w-[120%] h-[120%] max-w-none object-cover opacity-100 transition-opacity duration-600 ease-in-out"
              style={{
                opacity: current === index ? 1 : 0.5,
              }}
              alt={title}
              src={src}
              onLoad={imageLoaded}
              loading="eager"
              decoding="sync"
            />
            {current === index && (
              <div className="absolute -inset-px bg-gradient-to-t from-black/95 via-black/40 via-45% to-transparent transition-all duration-1000 pointer-events-none" />
            )}

            {/* 正面大片感电影文字与按钮：左下对齐 + 按钮上提避免贴底 */}
            <article
              className={`absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col items-start text-left transition-opacity duration-700 ease-in-out pointer-events-none ${
                current === index ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/70 mb-2 font-mono drop-shadow-md">
                {category}
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-[0.92] text-white mb-6 sm:mb-9 drop-shadow-lg uppercase">
                {title}
              </h2>
              <div className="flex justify-start pointer-events-auto">
                <InteractiveHoverButton
                  isTriggered={isButtonTriggered}
                  onClick={handleFlipToBack}
                  className="shadow-2xl"
                >
                  {button}
                </InteractiveHoverButton>
              </div>
            </article>
          </div>

          {/* ================= 背面表面 (Back Surface) - 独立平级表面，点击任意处翻回 ================= */}
          <div
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[1%] overflow-hidden bg-zinc-950/95 border border-white/10 p-5 sm:p-8 flex flex-col justify-between text-left backdrop-blur-2xl shadow-2xl cursor-pointer"
            // 静止在正面时彻底隐藏背面：带 backdrop-filter 的元素会让 backface-visibility 失效，
            // 背面的边框/绿色元素会从正面卡片底边漏出一条细线。翻转开始立刻可见，翻回去等 0.7s 动画结束再隐藏。
            style={{
              visibility: isFlipped ? "visible" : "hidden",
              transition: isFlipped ? "visibility 0s" : "visibility 0s linear 0.7s",
            }}
            onClick={handleFlipToFront}
          >
            {/* 顶栏 */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 shrink-0">
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-mono font-medium">
                {category} · 深度档案
              </span>
              <div className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors">
                <RotateCcw className="w-3 h-3" />
                <span>轻触翻回</span>
              </div>
            </div>

            {/* 中间内容（可滚动） */}
            <div className="my-auto py-2 overflow-y-auto max-h-[55vmin] sm:max-h-[50vmin] pr-1.5 custom-scrollbar">
              <h3 className="text-base sm:text-xl font-bold text-white mb-2.5">
                {title}
              </h3>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-light mb-4">
                {description}
              </p>

              {highlights.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {highlights.map((h, i) => (
                    <span
                      key={i}
                      className="text-[10px] sm:text-xs bg-white/10 border border-white/10 text-white/90 px-2.5 py-1 rounded-md"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 底栏 */}
            <div className="border-t border-white/10 pt-2.5 flex items-center justify-between text-[10px] sm:text-[11px] text-white/40 font-mono shrink-0">
              <span>TAP ANYWHERE TO FLIP</span>
              <span>DETAILS</span>
            </div>
          </div>
        </div>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 border-3 border-transparent rounded-full focus:border-[#6D64F7] focus:outline-hidden hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-neutral-600" />
    </button>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    }
  };

  const id = useId();

  return (
    <div
      className="narrative-carousel relative w-[82vw] h-[72vw] sm:w-[70vmin] sm:h-[70vmin] max-h-[480px] mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex mx-[-2vw] sm:mx-[-4vmin] transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
          />
        ))}
      </ul>

      <div className="absolute flex justify-center w-full top-[calc(100%+1.25rem)]">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />

        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>
    </div>
  );
}
