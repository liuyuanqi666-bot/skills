"use client";

import { cn } from "../../../../shared/utils";
import React, { ReactNode } from "react";

export interface AuroraBackgroundProps
  extends Omit<React.HTMLProps<HTMLDivElement>, "as"> {
  children?: ReactNode;
  className?: string;
  showRadialGradient?: boolean;
  /**
   * 蒙版类型:
   * - "center": (推荐) 中心向四周柔和羽化，两端完全对称，杜绝右侧留白断层
   * - "directional": 官方原版右上角斜射光束 (ellipse at 100% 0%)
   * - "none": 无蒙版，极光 100% 全面铺满
   */
  maskVariant?: "center" | "directional" | "none";
  /**
   * 是否固定到浏览器视口:
   * - false (默认，推荐): 基于自身容器定位，完美自适应任意卡片、小部件与全屏
   * - true: 官方原版视口绑定 (仅适合固定首屏视差滚动)
   */
  fixed?: boolean;
  /**
   * 根容器标签，卡片使用 "div"，主屏可使用 "main"
   */
  as?: React.ElementType;
}

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  maskVariant = "center",
  fixed = false,
  as: Component = "div",
  ...props
}: AuroraBackgroundProps) => {
  const maskClass =
    !showRadialGradient || maskVariant === "none"
      ? ""
      : maskVariant === "directional"
      ? "aurora-mask-directional"
      : "aurora-mask-center";

  return (
    <Component
      className={cn(
        "relative flex h-[100vh] flex-col items-center justify-center bg-zinc-50 text-slate-950 transition-colors duration-300 dark:bg-zinc-900 dark:text-slate-50",
        className
      )}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={
          {
            "--aurora":
              "repeating-linear-gradient(100deg,#3b82f6 10%,#a5b4fc 15%,#93c5fd 20%,#ddd6fe 25%,#60a5fa 30%)",
            "--dark-gradient":
              "repeating-linear-gradient(100deg,#000 0%,#000 7%,transparent 10%,transparent 12%,#000 16%)",
            "--white-gradient":
              "repeating-linear-gradient(100deg,#fff 0%,#fff 7%,transparent 10%,transparent 12%,#fff 16%)",

            "--blue-300": "#93c5fd",
            "--blue-400": "#60a5fa",
            "--blue-500": "#3b82f6",
            "--indigo-300": "#a5b4fc",
            "--violet-200": "#ddd6fe",
            "--black": "#000",
            "--white": "#fff",
            "--transparent": "transparent",
          } as React.CSSProperties
        }
      >
        <div
          className={cn(
            "aurora-canvas",
            fixed && "is-fixed",
            maskClass
          )}
        />
      </div>
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {children}
      </div>
    </Component>
  );
};
