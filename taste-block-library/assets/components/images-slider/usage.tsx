import { motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { ImagesSlider } from "./components/ui/images-slider";

const images = [
  "/images/forest-lake.jpg",
  "/images/forest-road.jpg",
  "/images/forest-canopy.jpg",
];

export default function App() {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const reduceMotion = useReducedMotion();

  return (
    <main className="min-h-screen bg-slider-background text-slider-foreground slider-demo">
      <ImagesSlider
        images={images}
        direction={direction}
        className="min-h-[100svh]"
        overlayClassName="story-overlay"
      >
        <div className="absolute inset-x-0 top-0 z-20 flex items-center justify-between px-5 py-5 sm:px-8 sm:py-7 lg:px-12">
          <a className="wordmark" href="#story" aria-label="森境旅行首页">
            森境旅行
          </a>
          <div className="direction-switch" aria-label="切换图片离场方向">
            <button
              type="button"
              aria-pressed={direction === "up"}
              onClick={() => setDirection("up")}
            >
              向上
            </button>
            <button
              type="button"
              aria-pressed={direction === "down"}
              onClick={() => setDirection("down")}
            >
              向下
            </button>
          </div>
        </div>

        <motion.section
          id="story"
          initial={reduceMotion ? false : { opacity: 0, transform: "translateY(-80px)" }}
          animate={{ opacity: 1, transform: "translateY(0px)" }}
          transition={{ duration: reduceMotion ? 0 : 0.6 }}
          className="relative z-20 flex w-full max-w-6xl flex-col items-center px-5 text-center sm:px-8"
        >
          <p className="eyebrow">森林 · 湖泊 · 慢行</p>
          <h1>向自然深处出发</h1>
          <p className="story-copy">三帧风景，讲完一段不必喧哗的旅程。</p>
          <a className="story-link" href="#details">
            探索线路 <span aria-hidden="true">→</span>
          </a>
        </motion.section>

        <div id="details" className="scene-note">
          <span>01</span>
          <span>每 5 秒自动切换</span>
        </div>
      </ImagesSlider>
    </main>
  );
}
