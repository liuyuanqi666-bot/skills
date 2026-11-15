import { motion } from "motion/react";
import { AuroraBackground } from "./components/ui/aurora-background";

// 最小用法：整屏 Hero。maskVariant="center" + fixed={false} 是推荐组合
// （fixed={false} 让极光锁定在容器自身，放进卡片/横幅也不会出现右侧留白）。
// 放进业务页时：h-svh 可按需改成固定高度；演示文案换成自己的。
export default function Usage() {
  return (
    <main className="relative w-full overflow-hidden">
      <AuroraBackground maskVariant="center" fixed={false} className="h-svh w-full">
        <motion.div
          initial={{ opacity: 1, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative flex flex-col gap-4 items-center justify-center px-4 max-w-4xl mx-auto"
        >
          <div className="text-3xl sm:text-5xl md:text-7xl font-bold dark:text-white text-zinc-900 text-center tracking-tight">
            去看一次真正的极光
          </div>
          <div className="font-light text-base md:text-3xl dark:text-neutral-200 text-neutral-600 py-2 text-center">
            冰岛 8 日环岛，追光之旅
          </div>
          <button className="bg-black hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-100 rounded-full text-white dark:text-black px-6 py-2.5 text-sm font-medium transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-black/10 dark:shadow-white/10">
            查看行程
          </button>
        </motion.div>
      </AuroraBackground>
    </main>
  );
}
