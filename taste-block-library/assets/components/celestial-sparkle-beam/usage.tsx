import { useState } from "react";

import { SparklesCore } from "./sparkles";
export function CelestialSparkleBeamDemo() {
  const [reducedMotion, setReducedMotion] = useState(false);

  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center overflow-hidden px-4 select-none">
      
      {/* 验收控制栏 */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3 bg-neutral-900/80 border border-neutral-800 backdrop-blur-md px-3 py-1.5 rounded-full text-xs text-neutral-400">
        <span>Taste Block Fixture</span>
        <div className="w-px h-3 bg-neutral-700" />
        <button
          type="button"
          onClick={() => setReducedMotion((v) => !v)}
          className={`px-2.5 py-1 rounded-full transition-colors ${
            reducedMotion ? "bg-sky-500/20 text-sky-400 font-medium" : "hover:text-white"
          }`}
        >
          减少动态: {reducedMotion ? "已启用" : "已关闭"}
        </button>
      </div>

      {/* 标题 */}
      <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-9xl font-bold text-center text-white relative z-20 tracking-tight">
        Aceternity
      </h1>

      {/* 响应式动效容器：手机到桌面严格等比收拢 */}
      <div className="w-[14rem] sm:w-[18rem] md:w-[28rem] lg:w-[40rem] h-20 sm:h-24 md:h-32 lg:h-40 relative">
        
        {/* 4条居中自适应激光光束 */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-[2px] w-3/4 blur-sm" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-indigo-500 to-transparent h-px w-3/4" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-[4px] md:h-[5px] w-1/4 blur-sm" />
        <div className="absolute left-1/2 -translate-x-1/2 top-0 bg-gradient-to-r from-transparent via-sky-500 to-transparent h-px w-1/4" />

        {/* 核心微粒：官方 1200 密度、0.4~1.0px 细微星尘 */}
        <SparklesCore
          background="transparent"
          minSize={0.4}
          maxSize={1.0}
          particleDensity={1200}
          className="w-full h-full"
          particleColor="#FFFFFF"
          reducedMotion={reducedMotion}
        />

        {/* 响应式径向消融遮罩 */}
        <div className="absolute inset-0 w-full h-full bg-black sparkle-mask pointer-events-none" />
      </div>
    </div>
  );
}

export default CelestialSparkleBeamDemo;
