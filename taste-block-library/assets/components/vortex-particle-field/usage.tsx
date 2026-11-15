import { Vortex, FIREFLY_VORTEX_PRESET } from "./vortex";

// 最小用法：萤火粒子背景卡片。Vortex 会按容器宽高自动缩放粒子数量和纵向扩散范围，
// 所以父容器必须有明确高度（这里是 h-[420px]）且 relative + overflow-hidden。
// 想要经典蓝紫风格，把 FIREFLY_VORTEX_PRESET 换成 { baseHue: 220, rangeHue: 60, backgroundColor: "#000000" }。
export default function Usage() {
  return (
    <section className="w-full bg-[#09090b] p-6 text-[#f4f4f5]">
      <div className="vortex-card-shadow relative mx-auto h-[420px] w-full max-w-3xl overflow-hidden rounded-2xl border border-emerald-500/30">
        <Vortex
          {...FIREFLY_VORTEX_PRESET}
          className="flex flex-col items-center justify-center p-8 text-center"
        >
          <h2 className="text-3xl font-bold tracking-tight text-white">夜幕下的萤火之森</h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-300">
            六月傍晚，沿着溪谷步道慢行，看萤火虫在林间亮起。
          </p>
          <button className="mt-5 rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-medium text-white transition hover:bg-emerald-500 active:scale-95">
            查看行程
          </button>
        </Vortex>
      </div>
    </section>
  );
}
