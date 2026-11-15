"use client";
import { useState, useRef, useId, useEffect } from "react";
import { InteractiveHoverButton } from "./interactive-hover-button";
import { 
  RotateCcw, 
  Clock, 
  Car, 
  Hotel, 
  Utensils, 
  Compass
} from "lucide-react";

export type NodeType = "scenic" | "transport" | "meal" | "hotel";

export interface ItineraryNode {
  time?: string;
  location: string;
  summary: string;
  type?: NodeType;
}

export interface ItinerarySlideData {
  day: number;
  dayTitle: string;
  theme: string;
  button?: string;
  src: string;
  nodes: ItineraryNode[];
  transportSummary?: string;
  hotelSummary?: string;
  mealSummary?: string;
  tips?: string;
}

interface SlideProps {
  slide: ItinerarySlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
}

const NodeIcon = ({ type }: { type?: NodeType }) => {
  switch (type) {
    case "transport":
      return <Car className="w-3.5 h-3.5 text-sky-400" />;
    case "hotel":
      return <Hotel className="w-3.5 h-3.5 text-amber-400" />;
    case "meal":
      return <Utensils className="w-3.5 h-3.5 text-orange-400" />;
    case "scenic":
    default:
      return <Compass className="w-3.5 h-3.5 text-emerald-400" />;
  }
};

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

  const { 
    src, 
    button = "查看当日行程", 
    day, 
    dayTitle, 
    theme, 
    nodes, 
    transportSummary, 
    hotelSummary, 
    mealSummary, 
    tips 
  } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[82vw] h-[82vw] sm:w-[70vmin] sm:h-[70vmin] mx-[2vw] sm:mx-[4vmin] z-10 select-none"
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
        {/* 核心卡片翻转层：直接挂载正反两个平级视觉表面，消除套壳感 */}
        <div
          className="relative w-full h-full [transform-style:preserve-3d] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
          style={{
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* ================= 正面表面 (与影叙版100%同构，单层裁切，彻底消灭黑边与套壳) ================= */}
          <div
            className="absolute inset-0 w-full h-full bg-black rounded-[1%] overflow-visible [clip-path:inset(0_round_1%)] [backface-visibility:hidden] [transform:rotateY(0deg)] transition-all duration-150 ease-out"
            style={{
              transform:
                current === index && !isFlipped
                  ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0) rotateY(0deg)"
                  : "rotateY(0deg)",
            }}
          >
            {/* 影叙版同款图片层：max-w-none 消除 Tailwind 100% 宽度压制，彻底消灭黑边露底 */}
            <img
              className="absolute inset-0 w-[120%] h-[120%] max-w-none object-cover opacity-100 transition-opacity duration-600 ease-in-out"
              style={{
                opacity: current === index ? 1 : 0.5,
              }}
              alt={dayTitle}
              src={src}
              onLoad={imageLoaded}
              loading="eager"
              decoding="sync"
            />
            {current === index && (
              <div className="absolute -inset-px bg-gradient-to-t from-black/95 via-black/40 via-45% to-transparent transition-all duration-1000 pointer-events-none" />
            )}

            {/* 正面左上角：极显眼电影质感超大 DAY 标（桌面+手机双端通透强化，无塑料小标感） */}
            <div className="absolute top-5 left-5 sm:top-8 sm:left-8 z-20 text-left pointer-events-none">
              <span className="block text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] font-mono leading-none">
                DAY {day.toString().padStart(2, "0")}
              </span>
              <span className="block text-[10px] sm:text-xs tracking-[0.3em] uppercase text-emerald-400 font-mono mt-1 sm:mt-2 drop-shadow-md font-bold">
                ITINERARY SCHEDULE
              </span>
            </div>

            {/* 正面文字与交互按钮：学习影叙版的电影大片文字排版，按钮上提保持留白呼吸 */}
            <article
              className={`absolute inset-x-0 bottom-0 p-6 sm:p-10 flex flex-col items-start text-left transition-opacity duration-700 ease-in-out pointer-events-none ${
                current === index ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              <span className="text-[10px] sm:text-xs tracking-[0.3em] uppercase text-white/70 mb-2 font-mono drop-shadow-md">
                {theme}
              </span>
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter leading-[0.92] text-white mb-6 sm:mb-9 drop-shadow-lg uppercase">
                {dayTitle}
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
            className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[1%] overflow-hidden bg-zinc-950/95 border border-white/10 p-4 sm:p-7 flex flex-col justify-between text-left backdrop-blur-2xl shadow-2xl cursor-pointer"
            // 静止在正面时彻底隐藏背面：带 backdrop-filter 的元素会让 backface-visibility 失效，
            // 背面的边框/绿色元素会从正面卡片底边漏出一条细线。翻转开始立刻可见，翻回去等 0.7s 动画结束再隐藏。
            style={{
              visibility: isFlipped ? "visible" : "hidden",
              transition: isFlipped ? "visibility 0s" : "visibility 0s linear 0.7s",
            }}
            onClick={handleFlipToFront}
          >
            {/* 顶栏 */}
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-3 shrink-0">
              <div className="flex items-center gap-2">
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs px-2 py-0.5 rounded-sm font-bold">
                  DAY {day}
                </span>
                <span className="text-[11px] sm:text-xs text-white/80 font-mono truncate max-w-[150px] sm:max-w-none">
                  {theme}
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors">
                <RotateCcw className="w-3 h-3" />
                <span>轻触翻回</span>
              </div>
            </div>

            {/* 中间主要滚动区（深度延长，预留宽裕滚动空间，无惧内容丰富度） */}
            <div className="my-auto py-2 overflow-y-auto max-h-[60vmin] sm:max-h-[52vmin] pr-1.5 custom-scrollbar space-y-4 sm:space-y-5">
              {/* 1. 时间轴节点流置于前方，自然清晰展现全天活动 */}
              <div className="relative pl-4 sm:pl-5 border-l border-white/15 space-y-3.5 sm:space-y-4">
                {nodes.map((node, i) => (
                  <div key={i} className="relative group">
                    <div className="absolute -left-[21px] sm:-left-[25px] top-0.5 w-2.5 h-2.5 rounded-full bg-zinc-950 border-2 border-white/60 ring-2 ring-emerald-400/40 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-emerald-400" />
                    </div>
                    
                    <div className="flex items-center gap-1.5 mb-0.5">
                      {node.time && (
                        <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-mono text-emerald-400/90 font-medium">
                          <Clock className="w-2.5 h-2.5" />
                          {node.time}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-white">
                        <NodeIcon type={node.type} />
                        {node.location}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-white/70 leading-relaxed font-light">
                      {node.summary}
                    </p>
                  </div>
                ))}
              </div>

              {tips && (
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10px] sm:text-[11px] text-white/75 leading-relaxed">
                  <span className="text-emerald-400 font-medium mr-1.5 font-mono">TIPS:</span>
                  {tips}
                </div>
              )}

              {/* 2. 交通 / 住宿 / 膳食模块移至最底下，且手机端纵向铺开，各预留充足独立空间 */}
              {(transportSummary || hotelSummary || mealSummary) && (
                <div className="pt-2 border-t border-white/10 flex flex-col sm:grid sm:grid-cols-3 gap-2.5 sm:gap-2">
                  {transportSummary && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                      <div className="p-1.5 rounded-md bg-sky-400/10 shrink-0">
                        <Car className="w-4 h-4 text-sky-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-sky-400 font-medium tracking-wider">交通安排</span>
                        <span className="text-xs text-white/90 leading-snug mt-0.5">{transportSummary}</span>
                      </div>
                    </div>
                  )}
                  {hotelSummary && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                      <div className="p-1.5 rounded-md bg-amber-400/10 shrink-0">
                        <Hotel className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-amber-400 font-medium tracking-wider">下榻酒店</span>
                        <span className="text-xs text-white/90 leading-snug mt-0.5">{hotelSummary}</span>
                      </div>
                    </div>
                  )}
                  {mealSummary && (
                    <div className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white/[0.04] border border-white/10">
                      <div className="p-1.5 rounded-md bg-orange-400/10 shrink-0">
                        <Utensils className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-mono text-orange-400 font-medium tracking-wider">特色膳食</span>
                        <span className="text-xs text-white/90 leading-snug mt-0.5">{mealSummary}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 底栏 */}
            <div className="border-t border-white/10 pt-2 flex items-center justify-between text-[10px] sm:text-[11px] text-white/40 font-mono shrink-0">
              <span>TAP ANYWHERE TO FLIP</span>
              <span>ITINERARY</span>
            </div>
          </div>
        </div>
      </li>
    </div>
  );
};

interface CarouselProps {
  slides: ItinerarySlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const [current, setCurrent] = useState(0);
  const navRef = useRef<HTMLElement>(null);
  const dayButtonsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const prevCurrentRef = useRef(current);
  const scrollRafRef = useRef<number | undefined>(undefined);

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

  // --- 高级手势滑动逻辑：严格的方向锁定与 Y轴防误触机制 ---
  type SwipeGesture = {
    id: number;
    startX: number;
    startY: number;
    dx: number;
    dy: number;
    maxY: number;
    moved: boolean;
    axis: "pending" | "x" | "y";
  };

  const gestureRef = useRef<SwipeGesture | null>(null);
  const suppressClickUntilRef = useRef(0);

  const LOCK_DISTANCE = 8;
  const SWIPE_DISTANCE = 45;
  const AXIS_RATIO = 1.5;
  const MAX_VERTICAL_DRIFT = 32;

  const shouldIgnoreSwipe = (target: EventTarget | null) =>
    target instanceof Element &&
    Boolean(
      target.closest(
        [
          "button", "a", "input", "textarea", "select",
          '[role="button"]',
          '[contenteditable]:not([contenteditable="false"])',
          "[data-no-carousel-swipe]"
        ].join(",")
      )
    );

  const updateGesture = (gesture: SwipeGesture, touch: React.Touch) => {
    gesture.dx = touch.clientX - gesture.startX;
    gesture.dy = touch.clientY - gesture.startY;
    const absX = Math.abs(gesture.dx);
    const absY = Math.abs(gesture.dy);
    gesture.maxY = Math.max(gesture.maxY, absY);

    if (Math.hypot(absX, absY) < LOCK_DISTANCE) return;
    gesture.moved = true;

    if (gesture.axis === "pending") {
      gesture.axis = absX >= absY * AXIS_RATIO ? "x" : "y";
    }
    if (gesture.axis === "x" && (absY * AXIS_RATIO > absX || gesture.maxY > MAX_VERTICAL_DRIFT)) {
      gesture.axis = "y";
    }
  };

  const cancelGesture = () => {
    if (gestureRef.current?.moved) suppressClickUntilRef.current = Date.now() + 400;
    gestureRef.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    if (e.touches.length !== 1) {
      cancelGesture();
      return;
    }
    gestureRef.current = null;
    suppressClickUntilRef.current = 0;
    if (shouldIgnoreSwipe(e.target)) return;
    
    const touch = e.touches[0];
    gestureRef.current = {
      id: touch.identifier,
      startX: touch.clientX,
      startY: touch.clientY,
      dx: 0,
      dy: 0,
      maxY: 0,
      moved: false,
      axis: "pending",
    };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    if (e.touches.length !== 1) {
      cancelGesture();
      return;
    }
    const touch = Array.from(e.touches).find((item) => item.identifier === gesture.id);
    if (!touch) {
      cancelGesture();
      return;
    }
    updateGesture(gesture, touch);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLElement>) => {
    const gesture = gestureRef.current;
    if (!gesture) return;
    gestureRef.current = null;

    const touch = Array.from(e.changedTouches).find((item) => item.identifier === gesture.id);
    if (!touch || e.touches.length !== 0) return;

    updateGesture(gesture, touch);
    if (gesture.moved) suppressClickUntilRef.current = Date.now() + 400;

    if (
      gesture.axis !== "x" ||
      Math.abs(gesture.dx) < SWIPE_DISTANCE ||
      Math.abs(gesture.dx) < Math.abs(gesture.dy) * AXIS_RATIO ||
      gesture.maxY > MAX_VERTICAL_DRIFT
    ) return;

    if (gesture.dx < 0) {
      handleNextClick();
    } else {
      handlePreviousClick();
    }
  };

  const handleClickCapture = (e: React.MouseEvent<HTMLElement>) => {
    if (e.detail === 0 || Date.now() >= suppressClickUntilRef.current) return;
    suppressClickUntilRef.current = 0;
    e.preventDefault();
    e.stopPropagation();
  };

  // 手机端顶部 4 栏位丝滑滚动算法：
  // 第1个、第2个停在起始端(0)；第3个精准向左挪1格，第4个挪2格...
  // 距离感知的恒定速度模型：根据实际跨越天数动态计算动画时长
  useEffect(() => {
    prevCurrentRef.current = current;
  }, [current]);
  
  const jumpMagnitude = Math.abs(current - prevCurrentRef.current) || 1;
  // 动态时长：基础 500ms，每跨越一格增加 150ms，最高 1000ms（保障恒定速度体感）
  const dynamicDuration = Math.min(500 + jumpMagnitude * 150, 1000);

  // --- 顶部 DAY 栏：恢复点击 3 挪 1 格、点击 4 挪 2 格的丝滑弹性步进滚动 ---
  useEffect(() => {
    const container = navRef.current;
    if (!container) return;

    const b0 = dayButtonsRef.current[0];
    const b1 = dayButtonsRef.current[1];
    if (!b0 || !b1) return;

    let targetLeft = 0;
    if (current >= 2) {
      // 精确单格物理步长（按钮宽度 + gap间距）
      const exactStep = b1.offsetLeft - b0.offsetLeft;
      targetLeft = (current - 1) * exactStep;
    }

    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    targetLeft = Math.max(0, Math.min(maxScrollLeft, targetLeft));

    // 如果已经到位，不重复执行
    if (Math.abs(targetLeft - container.scrollLeft) <= 1) return;

    // 取消并中断上一次未完成的滚动动画，防止连击撕裂
    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
    }

    const startLeft = container.scrollLeft;
    const distance = targetLeft - startLeft;
    const duration = 650;
    let startTime: number | null = null;

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutQuint (五次方缓出曲线)：初段平滑启动，尾端带从容弹性减速
      const easeProgress = 1 - Math.pow(1 - progress, 5);

      container.scrollLeft = startLeft + distance * easeProgress;

      if (progress < 1) {
        scrollRafRef.current = requestAnimationFrame(animateScroll);
      }
    };

    scrollRafRef.current = requestAnimationFrame(animateScroll);

    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [current]);

  const id = useId();

  return (
    <div className="relative w-full flex flex-col items-center">
      {/* ================= 顶部 DAY 导航：手机端标准 4 栏位，点击第3格挪1格，不缩小不破坏外观 ================= */}
      <nav
        ref={navRef}
        aria-label="行程天数"
        className="mb-6 sm:mb-8 z-30 flex items-center gap-1.5 p-1.5 rounded-full border border-white/15 bg-[#0f121b]/80 backdrop-blur-xl shadow-2xl overflow-x-auto no-scrollbar touch-pan-x w-[92vw] sm:w-auto max-w-[92vw] sm:max-w-none"
        style={{ overscrollBehaviorX: "contain" }}
      >
        {slides.map((slide, index) => {
          const isActive = current === index;
          return (
            <button
              key={slide.day}
              ref={(el) => {
                dayButtonsRef.current[index] = el;
              }}
              onClick={() => setCurrent(index)}
              className={`relative flex-none w-[20.8vw] sm:w-auto px-1 sm:px-4 py-2 rounded-full text-xs font-mono transition-all duration-300 select-none text-center ${
                isActive
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <span>DAY {slide.day.toString().padStart(2, "0")}</span>
            </button>
          );
        })}
      </nav>

      {/* ================= 中部：3D 旋转木马卡片主体（支持手势直接滑动切换，彻底去除底部两个箭头） ================= */}
      <div
        className="narrative-carousel relative w-[82vw] h-[82vw] sm:w-[70vmin] sm:h-[70vmin] mx-auto cursor-grab active:cursor-grabbing touch-pan-y"
        aria-labelledby={`carousel-heading-${id}`}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={cancelGesture}
        onClickCapture={handleClickCapture}
      >
        <ul
          className="absolute flex mx-[-2vw] sm:mx-[-4vmin] transition-transform ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-auto"
          style={{
            transform: `translateX(-${current * (100 / slides.length)}%)`,
            transitionDuration: `${dynamicDuration}ms`,
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
      </div>
    </div>
  );
}
