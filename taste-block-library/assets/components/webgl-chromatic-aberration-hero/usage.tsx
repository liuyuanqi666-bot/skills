import React from 'react';
import { WebGLChromaticHero } from './Hero';

export default function App() {
  const imageSrc = new URLSearchParams(window.location.search).has("missing")
    ? "/images/missing-preview.svg"
    : "/images/travel-landscape-svg/stars.svg";

  return (
    <main className="w-full bg-[#081d3b]">
      <WebGLChromaticHero imageSrc={imageSrc} />
      <section id="preview-continuation" className="flex min-h-[70svh] items-start justify-center bg-neutral-950 px-6 py-24 text-center text-neutral-400">
        <div>
          <p className="font-mono text-xs tracking-[0.22em] text-emerald-400">SCROLL TEST AREA</p>
          <p className="mt-3 text-sm">此区域仅用于检查导航栏吸顶、滚动渐变与毛玻璃采样。</p>
        </div>
      </section>
    </main>
  );
}
