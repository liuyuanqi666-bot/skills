"use client";

import {
  useState,
  useRef,
  useEffect,
  useId,
  useMemo,
  useCallback,
  type ChangeEvent,
} from "react";
import { motion } from "motion/react";
import { cn } from "../../../../shared/utils";

function GooeyFilter({
  filterId,
  blur,
}: {
  filterId: string;
  blur: number;
}) {
  return (
    <svg className="pointer-events-none absolute h-0 w-0 opacity-0 overflow-hidden" aria-hidden="true">
      <defs>
        <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation={blur} result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

function SearchIcon({ layoutId }: { layoutId: string }) {
  return (
    <motion.svg
      layoutId={layoutId}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      className="size-4 shrink-0"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </motion.svg>
  );
}

const transition = {
  duration: 0.4,
  type: "spring" as const,
  bounce: 0.25,
};

const iconBubbleVariants = {
  collapsed: { scale: 0, opacity: 0 },
  expanded: { scale: 1, opacity: 1 },
};

export interface GooeyInputClassNames {
  root?: string;
  filterWrap?: string;
  buttonRow?: string;
  trigger?: string;
  input?: string;
  bubble?: string;
  bubbleSurface?: string;
}

export interface GooeyInputProps {
  /** 占位符文本，显示在输入框中 */
  placeholder?: string;
  /** 外层容器样式类 */
  className?: string;
  /** 内部各元素分段可选类名 */
  classNames?: GooeyInputClassNames;
  /** 折叠状态宽度（单位 px，默认 115） */
  collapsedWidth?: number;
  /** 展开状态宽度（单位 px，默认 200） */
  expandedWidth?: number;
  /** 展开时向右位移偏移量，对齐左侧独立图标泡泡（单位 px，默认 50） */
  expandedOffset?: number;
  /** SVG 粘稠滤镜高斯模糊强度（默认 5） */
  gooeyBlur?: number;
  /** 受控输入值 */
  value?: string;
  /** 非受控默认初始值 */
  defaultValue?: string;
  /** 输入内容变化回调 */
  onValueChange?: (value: string) => void;
  /** 展开/折叠状态切换回调 */
  onOpenChange?: (open: boolean) => void;
  /** 是否禁用交互 */
  disabled?: boolean;
  /**
   * 通用换色快捷属性：
   * 同时作用于触发按钮 (trigger) 与左侧分离泡泡 (bubbleSurface)，
   * 确保两者物理融合动画具有完全一致的背景色、文字色与光晕，实现“任意颜色放入所有网页”
   * 示例："bg-blue-600 text-white" 或 "bg-emerald-600 text-white"
   */
  surfaceClassName?: string;
  /**
   * 移动端自适应紧凑排版保护（默认 true）：
   * 注意：本组件展开时总宽度为 (expandedWidth + expandedOffset)，默认需占用 250px 空间！
   * 尤其在移动端，若父容器未预留足够右向伸展空间，可能挤压相邻操作按钮或溢出。
   * 开启后，在小屏手机视口（< 640px）下将自动收窄展开长度至 170px 与 42px 偏移，完美适配移动端。
   */
  autoMobileNarrow?: boolean;
}

export function GooeyInput({
  placeholder = "Type to search...",
  className,
  classNames,
  collapsedWidth = 115,
  expandedWidth = 200,
  expandedOffset = 50,
  gooeyBlur = 5,
  value: valueProp,
  defaultValue = "",
  onValueChange,
  onOpenChange,
  disabled = false,
  surfaceClassName,
  autoMobileNarrow = true,
}: GooeyInputProps) {
  const reactId = useId();
  const safeId = reactId.replace(/:/g, "");
  const filterId = `gooey-filter-${safeId}`;
  const iconLayoutId = `gooey-input-icon-${safeId}`;
  const inputLayoutId = `gooey-input-field-${safeId}`;

  const inputRef = useRef<HTMLInputElement>(null);
  const prevExpandedRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);

  const isControlled = valueProp !== undefined;
  const searchText = isControlled ? valueProp : uncontrolledValue;
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  useEffect(() => {
    if (!autoMobileNarrow || typeof window === "undefined") return;
    const checkMobile = () => {
      setIsMobileScreen(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [autoMobileNarrow]);

  const effectiveExpandedWidth = useMemo(() => {
    if (autoMobileNarrow && isMobileScreen) {
      return Math.min(expandedWidth, 170);
    }
    return expandedWidth;
  }, [autoMobileNarrow, isMobileScreen, expandedWidth]);

  const effectiveExpandedOffset = useMemo(() => {
    if (autoMobileNarrow && isMobileScreen) {
      return Math.min(expandedOffset, 42);
    }
    return expandedOffset;
  }, [autoMobileNarrow, isMobileScreen, expandedOffset]);

  const setSearchText = useCallback(
    (next: string) => {
      if (!isControlled) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [isControlled, onValueChange],
  );

  const setExpanded = useCallback(
    (next: boolean) => {
      setIsExpanded(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    } else if (prevExpandedRef.current) {
      setSearchText("");
    }
    prevExpandedRef.current = isExpanded;
  }, [isExpanded, setSearchText]);

  const buttonVariants = useMemo(
    () => ({
      collapsed: { width: collapsedWidth, marginLeft: 0 },
      expanded: { width: effectiveExpandedWidth, marginLeft: effectiveExpandedOffset },
    }),
    [collapsedWidth, effectiveExpandedWidth, effectiveExpandedOffset],
  );

  const handleExpand = useCallback(() => {
    if (!disabled) setExpanded(true);
  }, [disabled, setExpanded]);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setSearchText(e.target.value);
    },
    [setSearchText],
  );

  const handleBlur = useCallback(() => {
    if (!searchText) setExpanded(false);
  }, [searchText, setExpanded]);

  // 默认表面样式兼容 shadcn 主题变量；若指定 surfaceClassName 则无缝覆盖
  const surfaceClass =
    surfaceClassName ||
    "bg-gooey-foreground text-gooey-background shadow-xs ring-1 ring-gooey-border/60";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        className,
        classNames?.root,
      )}
    >
      <GooeyFilter filterId={filterId} blur={gooeyBlur} />

      <div
        className={cn(
          "relative flex h-10 items-center justify-center",
          classNames?.filterWrap,
        )}
        style={{ filter: `url(#${filterId})` }}
      >
        <motion.div
          className={cn("flex h-10 items-center justify-center", classNames?.buttonRow)}
          variants={buttonVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={handleExpand}
            className={cn(
              "flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-4 text-sm font-medium outline-hidden transition-[color,box-shadow] focus-visible:ring-2 focus-visible:ring-gooey-ring focus-visible:ring-offset-2 focus-visible:ring-offset-gooey-background disabled:pointer-events-none disabled:opacity-50",
              surfaceClass,
              classNames?.trigger,
            )}
          >
            {!isExpanded ? (
              <SearchIcon layoutId={iconLayoutId} />
            ) : null}
            <motion.input
              layoutId={inputLayoutId}
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              value={searchText}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={disabled || !isExpanded}
              placeholder={placeholder}
              className={cn(
                "h-full min-w-0 flex-1 bg-transparent text-sm text-inherit outline-hidden",
                isExpanded
                  ? "placeholder:text-inherit placeholder:opacity-50"
                  : "pointer-events-none placeholder:text-inherit placeholder:opacity-70",
                classNames?.input,
              )}
            />
          </button>
        </motion.div>

        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 my-auto flex size-10 items-center justify-center",
            classNames?.bubble,
          )}
          variants={iconBubbleVariants}
          initial="collapsed"
          animate={isExpanded ? "expanded" : "collapsed"}
          transition={transition}
        >
          <div
            className={cn(
              "flex size-10 items-center justify-center rounded-full",
              surfaceClass,
              classNames?.bubbleSurface,
            )}
          >
            <SearchIcon layoutId={iconLayoutId} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
