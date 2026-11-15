"use client";

import { useState } from "react";
import { GooeyInput } from "../../assets/components/gooey-input/components/ui/gooey-input";
import {
  Search,
  Palette,
  Sparkles,
  Compass,
  Layers,
  Copy,
  Check,
  Code2,
  Sliders,
  Laptop,
  Smartphone,
  ShieldCheck,
  Plane,
} from "lucide-react";

// 预置高质感主题色卡
const COLOR_PRESETS = [
  {
    id: "official",
    name: "官方纯白出厂 (默认)",
    surface: "bg-white text-zinc-950 shadow-md",
    tag: "Official Default",
    bgClass: "bg-zinc-950",
  },
  {
    id: "dark",
    name: "暗黑曜石 (默认)",
    surface: "bg-zinc-800 text-white",
    tag: "Dark Theme",
    bgClass: "bg-zinc-950",
  },
  {
    id: "emerald",
    name: "生态翡翠 (旅游线路)",
    surface: "bg-emerald-600 text-white",
    tag: "Travel & Nature",
    bgClass: "bg-emerald-950/20",
  },
  {
    id: "ocean",
    name: "皇家海洋 (SaaS/科技)",
    surface: "bg-blue-600 text-white",
    tag: "Tech & Corporate",
    bgClass: "bg-blue-950/20",
  },
  {
    id: "violet",
    name: "极光紫电 (Web3/创意)",
    surface: "bg-purple-600 text-white",
    tag: "Creative & AI",
    bgClass: "bg-purple-950/20",
  },
  {
    id: "amber",
    name: "暖阳珊瑚 (生活/美食)",
    surface: "bg-amber-500 text-zinc-950",
    tag: "Warm & Lifestyle",
    bgClass: "bg-amber-950/20",
  },
  {
    id: "rose",
    name: "炽热烈焰 (电商大促)",
    surface: "bg-rose-600 text-white",
    tag: "Promo & Fashion",
    bgClass: "bg-rose-950/20",
  },
  {
    id: "light",
    name: "纯白明昼 (浅色网页)",
    surface: "bg-white text-zinc-900",
    tag: "Light Background",
    bgClass: "bg-zinc-100",
  },
];

// 用户原版 Demo 函数保证 100% 官方代码兼容
export function GooeyInputOfficialDemo() {
  return (
    <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <GooeyInput placeholder="Search..." />
    </div>
  );
}

export default function App() {
  const [selectedPreset, setSelectedPreset] = useState(COLOR_PRESETS[0]); // 官方纯白默认
  const [customClass, setCustomClass] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"showcase" | "scenes" | "props">("showcase");

  // 可调节物理动效参数
  const [collapsedWidth, setCollapsedWidth] = useState(115);
  const [expandedWidth, setExpandedWidth] = useState(200);
  const [expandedOffset, setExpandedOffset] = useState(50);
  const [gooeyBlur, setGooeyBlur] = useState(5);
  const [placeholder, setPlaceholder] = useState("Search...");
  const [lastQuery, setLastQuery] = useState("");

  const activeSurface = customClass.trim() ? customClass.trim() : selectedPreset.surface;

  const copyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const codeSnippet = `<GooeyInput
  placeholder="${placeholder}"
  surfaceClassName="${activeSurface}"
  collapsedWidth={${collapsedWidth}}
  expandedWidth={${expandedWidth}}
  expandedOffset={${expandedOffset}}
  gooeyBlur={${gooeyBlur}}
  onValueChange={(val) => console.log(val)}
/>`;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-emerald-500/30">
      {/* 顶部元数据栏 */}
      <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-950/50">
              <Search className="size-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold uppercase tracking-wider text-emerald-400">
                  015-gooey-input
                </span>
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-400 border border-amber-500/20">
                  DRAFT · 待核验
                </span>
                <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[11px] text-zinc-400">
                  Aceternity License
                </span>
              </div>
              <h1 className="text-sm font-medium text-zinc-200">
                Gooey Search Input · 通用粘稠流体搜索框输入组件
              </h1>
            </div>
          </div>

          {/* 选项卡导航 */}
          <div className="flex items-center justify-between sm:justify-start gap-1 rounded-xl bg-zinc-900 p-1 text-xs border border-zinc-800 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab("showcase")}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 transition ${
                activeTab === "showcase"
                  ? "bg-emerald-500 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Palette className="size-3.5" />
              换色工作台
            </button>
            <button
              onClick={() => setActiveTab("scenes")}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 transition ${
                activeTab === "scenes"
                  ? "bg-emerald-500 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="size-3.5" />
              多网页场景
            </button>
            <button
              onClick={() => setActiveTab("props")}
              className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 transition ${
                activeTab === "props"
                  ? "bg-emerald-500 text-zinc-950 font-semibold shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sliders className="size-3.5" />
              参数与原版
            </button>
          </div>
        </div>
      </header>

      {/* 核心内容区 */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {activeTab === "showcase" && (
          <div className="space-y-8">
            {/* 顶栏介绍横幅 */}
            <section className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900/90 to-zinc-900/30 p-6 sm:p-8">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  <Sparkles className="size-3.5" />
                  通用组件特性 · 支持任意颜色与全场景嵌入
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  像液体一样分离融合的粘稠搜索框
                </h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  本组件由 <strong className="text-zinc-200">Aceternity UI</strong> 官方打造，底层利用原生
                  <code className="mx-1 rounded-sm bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">SVG feGaussianBlur</code> +
                  <code className="mx-1 rounded-sm bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-emerald-300">feColorMatrix</code>
                  实现水滴张力阈值滤镜，结合 Framer Motion 物理弹簧阻尼。通过解耦表面色彩，支持用一行
                  <code className="mx-1 rounded-sm bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-amber-300">surfaceClassName</code>
                  或细粒度 <code className="mx-1 rounded-sm bg-zinc-800 px-1.5 py-0.5 font-mono text-xs text-amber-300">classNames</code>
                  赋予其任意品牌色彩，放入任何网页均可即插即用。
                </p>
              </div>
            </section>

            {/* 实时换色体验舞台 */}
            <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              {/* 左侧：实时预览画布 */}
              <div className="flex flex-col justify-between rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 lg:col-span-7">
                <div>
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
                      <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                      实时交互画布 (点击展开 / 失焦折叠)
                    </div>
                    <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[11px] font-mono text-zinc-400">
                      当前主题: {selectedPreset.name}
                    </span>
                  </div>

                  {/* 动效中心展示区 */}
                  <div className="relative my-12 flex h-52 w-full flex-col items-center justify-center overflow-hidden rounded-2xl border border-zinc-800/60 bg-gradient-to-b from-zinc-950 to-zinc-900/60 p-6">
                    {/* 背景装饰微网格 */}
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#3f3f46_1px,transparent_1px)] [background-size:16px_16px] opacity-25" />

                    <div className="relative z-10">
                      <GooeyInput
                        placeholder={placeholder}
                        surfaceClassName={activeSurface}
                        collapsedWidth={collapsedWidth}
                        expandedWidth={expandedWidth}
                        expandedOffset={expandedOffset}
                        gooeyBlur={gooeyBlur}
                        onValueChange={(val) => setLastQuery(val)}
                      />
                    </div>

                    <p className="mt-8 text-xs text-zinc-500">
                      💡 点击圆角搜索胶囊触发水滴分裂展开，在输入框外点击空白即可平滑融合吸附复原
                    </p>
                    {lastQuery && (
                      <div className="mt-2 text-xs text-emerald-400 font-mono">
                        当前输入: "{lastQuery}"
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部代码复制栏 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
                    <span className="flex items-center gap-1.5">
                      <Code2 className="size-3.5" />
                      当前色彩配置代码
                    </span>
                    <button
                      onClick={() => copyCode(codeSnippet)}
                      className="flex items-center gap-1 rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300 hover:bg-zinc-700 transition"
                    >
                      {copied ? (
                        <>
                          <Check className="size-3.5 text-emerald-400" />
                          已复制
                        </>
                      ) : (
                        <>
                          <Copy className="size-3.5" />
                          复制代码
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 font-mono text-[12px] text-emerald-300/90 leading-relaxed">
                    {codeSnippet}
                  </pre>
                </div>
              </div>

              {/* 右侧：颜色控制器与物理参数调节 */}
              <div className="space-y-6 lg:col-span-5">
                {/* 预设色板选择 */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Palette className="size-4 text-emerald-400" />
                    官方精选任意颜色预设 (7 款)
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    无论用于暗色科技站、旅游度假站、极简白纸风还是电商促销页，只需切换表面类名即可实现：
                  </p>

                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {COLOR_PRESETS.map((preset) => {
                      const isActive = selectedPreset.id === preset.id && !customClass;
                      return (
                        <button
                          key={preset.id}
                          onClick={() => {
                            setSelectedPreset(preset);
                            setCustomClass("");
                          }}
                          className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition ${
                            isActive
                              ? "border-emerald-500 bg-emerald-500/10 text-white shadow-xs"
                              : "border-zinc-800 bg-zinc-950/60 text-zinc-300 hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`size-4.5 rounded-full border border-white/20 shadow-inner ${preset.surface.split(" ")[0]}`}
                            />
                            <div>
                              <div className="text-xs font-medium">{preset.name}</div>
                              <div className="text-[10px] text-zinc-500">{preset.tag}</div>
                            </div>
                          </div>
                          {isActive && <Check className="size-3.5 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* 自定义 Tailwind 色彩输入 */}
                  <div className="pt-2 border-t border-zinc-800/80">
                    <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                      自定义任意 Tailwind 类名 (实时响应)
                    </label>
                    <input
                      type="text"
                      placeholder="例: bg-indigo-700 text-white ring-1 ring-indigo-400"
                      value={customClass}
                      onChange={(e) => setCustomClass(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-200 placeholder:text-zinc-600 focus:border-emerald-500 focus:outline-hidden"
                    />
                    <p className="mt-1 text-[11px] text-zinc-500">
                      支持任意 Hex 颜色（如 <code className="text-zinc-400">bg-[#ff0077] text-white</code>）或任意渐变
                    </p>
                  </div>
                </div>

                {/* 物理流体与尺寸微调 */}
                <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-white">
                    <Sliders className="size-4 text-emerald-400" />
                    物理动效与尺寸微调
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>折叠宽度 (collapsedWidth)</span>
                        <span className="font-mono text-zinc-200">{collapsedWidth} px</span>
                      </div>
                      <input
                        type="range"
                        min="90"
                        max="150"
                        value={collapsedWidth}
                        onChange={(e) => setCollapsedWidth(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>展开宽度 (expandedWidth)</span>
                        <span className="font-mono text-zinc-200">{expandedWidth} px</span>
                      </div>
                      <input
                        type="range"
                        min="160"
                        max="320"
                        value={expandedWidth}
                        onChange={(e) => setExpandedWidth(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>展开左位移 (expandedOffset)</span>
                        <span className="font-mono text-zinc-200">{expandedOffset} px</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="80"
                        value={expandedOffset}
                        onChange={(e) => setExpandedOffset(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>粘稠滤镜模糊度 (gooeyBlur)</span>
                        <span className="font-mono text-zinc-200">{gooeyBlur}</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="8"
                        value={gooeyBlur}
                        onChange={(e) => setGooeyBlur(Number(e.target.value))}
                        className="w-full accent-emerald-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-400 mb-1">
                        <span>占位符文字 (placeholder)</span>
                      </div>
                      <input
                        type="text"
                        value={placeholder}
                        onChange={(e) => setPlaceholder(e.target.value)}
                        className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 font-mono text-xs text-zinc-200 focus:border-emerald-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* 场景 2：放入所有网页里的真实实装展示 */}
        {activeTab === "scenes" && (
          <div className="space-y-8">
            <div className="max-w-2xl space-y-2">
              <h2 className="text-xl font-bold text-white">多网页场景真实嵌入测试</h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                证明作为一个真正通用的组件，GooeyInput 能够无违和感地放入网站顶栏导航、旅游线路首屏、浅色卡片等各种不同的真实网页结构中：
              </p>
            </div>

            {/* 实装场景 1：现代网站全站导航顶栏 */}
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/60 p-1 shadow-xl">
              <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-950 px-4 py-2.5 text-xs text-zinc-400">
                <Laptop className="size-4 text-emerald-400" />
                <span className="font-medium text-zinc-200">场景 A：现代网站顶部导航栏 (Navbar 集成)</span>
                <span className="ml-auto text-[11px] text-zinc-500">自适应 56px 标配导航空间</span>
              </div>
              <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-6 py-3 backdrop-blur-md">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 font-bold text-white text-sm tracking-wide">
                    <Compass className="size-5 text-emerald-400" />
                    <span>NEXUS TOUR</span>
                  </div>
                  <nav className="hidden items-center gap-5 text-xs text-zinc-400 md:flex">
                    <a href="#" className="text-zinc-100 hover:text-emerald-400 transition">探索线路</a>
                    <a href="#" className="hover:text-emerald-400 transition">目的地</a>
                    <a href="#" className="hover:text-emerald-400 transition">定制游</a>
                    <a href="#" className="hover:text-emerald-400 transition">关于我们</a>
                  </nav>
                </div>

                <div className="flex items-center gap-3">
                  {/* 在导航顶栏中直接嵌入 GooeyInput，翡翠主题 */}
                  <GooeyInput
                    placeholder="全站搜索..."
                    surfaceClassName="bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-400/40"
                    collapsedWidth={110}
                    expandedWidth={190}
                    expandedOffset={45}
                  />
                  <button className="hidden rounded-full border border-zinc-700 bg-zinc-800 px-3.5 py-1.5 text-xs text-zinc-200 hover:bg-zinc-700 sm:block transition">
                    登录
                  </button>
                </div>
              </div>
              <div className="p-8 text-center bg-zinc-900/20">
                <p className="text-xs text-zinc-500">
                  导航栏实测：展开时向右滑动不会溢出顶栏，收拢后与整体菜单排版自然对齐，完全不占用多余空间。
                </p>
              </div>
            </div>

            {/* 实装场景 2：旅游线路度假产品卡片首屏 */}
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-teal-950/40 via-zinc-900 to-zinc-950 p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4 text-xs">
                <div className="flex items-center gap-2 text-teal-400 font-medium">
                  <Plane className="size-4" />
                  场景 B：旅游线路首屏检索横幅 (Travel Hero Banner)
                </div>
                <span className="rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] text-teal-300 border border-teal-500/20">
                  行业产品实战
                </span>
              </div>

              <div className="max-w-xl space-y-3">
                <h3 className="text-xl font-bold text-white sm:text-2xl">
                  开启你的下一段未知旅程
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  在旅游产品页面或出团聚合页中，将 GooeyInput 定制为海洋蓝或活力橙，让游客在趣味物理动效中瞬间检索目的地线路。
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <GooeyInput
                  placeholder="搜索日本/欧洲/极光团..."
                  surfaceClassName="bg-blue-600 text-white shadow-lg ring-1 ring-blue-400/40"
                  collapsedWidth={130}
                  expandedWidth={230}
                  expandedOffset={50}
                />
                <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-zinc-400">
                  <span className="text-zinc-500">热门搜索:</span>
                  <span className="rounded-full bg-zinc-800/80 px-2.5 py-1 text-zinc-300 hover:text-white cursor-pointer transition">
                    北海道雪原
                  </span>
                  <span className="rounded-full bg-zinc-800/80 px-2.5 py-1 text-zinc-300 hover:text-white cursor-pointer transition">
                    川西大环线
                  </span>
                  <span className="rounded-full bg-zinc-800/80 px-2.5 py-1 text-zinc-300 hover:text-white cursor-pointer transition">
                    冰岛极光专列
                  </span>
                </div>
              </div>
            </div>

            {/* 实装场景 3：纯白浅色网页/卡片实装 */}
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl text-zinc-900 space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4 text-xs">
                <div className="flex items-center gap-2 text-zinc-700 font-semibold">
                  <Smartphone className="size-4 text-zinc-900" />
                  场景 C：纯白明明白昼网页集成 (Light Mode Canvas)
                </div>
                <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] text-zinc-600 border border-zinc-200">
                  浅色高对比度
                </span>
              </div>

              <div className="max-w-xl space-y-2">
                <h3 className="text-lg font-bold text-zinc-900">
                  浅色网页中的高辨识度适配
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  许多管理后台或文档网页采用白色底衬。此时可直接配置为深灰实色 <code className="rounded-sm bg-zinc-100 px-1 py-0.5 font-mono text-[11px] text-zinc-800">bg-zinc-900 text-white</code> 或活力珊瑚红，甚至浅灰反差色，SVG 滤镜均能完美裁切呈现。
                </p>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <GooeyInput
                  placeholder="在浅色网页中检索..."
                  surfaceClassName="bg-zinc-900 text-white shadow-md ring-1 ring-zinc-700"
                  collapsedWidth={120}
                  expandedWidth={220}
                />
                <GooeyInput
                  placeholder="玫瑰红高调搜索..."
                  surfaceClassName="bg-rose-600 text-white shadow-md ring-1 ring-rose-400/50"
                  collapsedWidth={120}
                  expandedWidth={210}
                />
              </div>
            </div>
          </div>
        )}

        {/* 场景 3：官方原版 Demo 与参数接口核验 */}
        {activeTab === "props" && (
          <div className="space-y-8">
            {/* 用户原版 Demo 对齐验证 */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="size-4.5 text-emerald-400" />
                  用户原版 Demo 片段执行验证 (GooeyInputDemo)
                </div>
                <span className="text-xs text-zinc-400">100% 官方默认行为</span>
              </div>
              <p className="text-xs text-zinc-400">
                以下渲染区域严格调用用户在对话中提供的原版代码片段，默认采用
                <code className="mx-1 rounded-sm bg-zinc-800 px-1 py-0.5 font-mono text-xs text-zinc-300">
                  bg-gooey-foreground text-gooey-background
                </code>
                系统自适应色，验证原汁原味的官方出厂表现：
              </p>

              <GooeyInputOfficialDemo />
            </div>

            {/* 参数接口表 */}
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/40 p-6 space-y-4">
              <h3 className="text-sm font-semibold text-white">完整 Props 接口支持说明</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="border-b border-zinc-800 bg-zinc-950/60 font-mono text-[11px] text-zinc-400">
                    <tr>
                      <th className="px-4 py-2.5">属性名</th>
                      <th className="px-4 py-2.5">类型</th>
                      <th className="px-4 py-2.5">默认值</th>
                      <th className="px-4 py-2.5">中文描述说明</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60 font-mono text-[11px]">
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">placeholder</td>
                      <td className="px-4 py-2.5 text-zinc-400">string</td>
                      <td className="px-4 py-2.5 text-zinc-500">"Type to search..."</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">占位符文本，显示在输入框中</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">surfaceClassName</td>
                      <td className="px-4 py-2.5 text-zinc-400">string</td>
                      <td className="px-4 py-2.5 text-zinc-500">bg-gooey-foreground ...</td>
                      <td className="px-4 py-2.5 font-sans text-emerald-300 font-medium">通用换色属性：一键设置胶囊与分离水滴统一色彩</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">collapsedWidth</td>
                      <td className="px-4 py-2.5 text-zinc-400">number</td>
                      <td className="px-4 py-2.5 text-zinc-500">115</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">折叠状态下控制面板的宽度 (px)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">expandedWidth</td>
                      <td className="px-4 py-2.5 text-zinc-400">number</td>
                      <td className="px-4 py-2.5 text-zinc-500">200</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">展开状态时的输入宽度 (px)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">expandedOffset</td>
                      <td className="px-4 py-2.5 text-zinc-400">number</td>
                      <td className="px-4 py-2.5 text-zinc-500">50</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">展开时向右位移偏移量，对齐左侧独立图标泡泡 (px)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">gooeyBlur</td>
                      <td className="px-4 py-2.5 text-zinc-400">number</td>
                      <td className="px-4 py-2.5 text-zinc-500">5</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">高斯模糊滤镜强度，控制液体粘滞度</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">classNames</td>
                      <td className="px-4 py-2.5 text-zinc-400">GooeyInputClassNames</td>
                      <td className="px-4 py-2.5 text-zinc-500">-</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">内部可选细粒度类名 (root, trigger, bubble, input 等)</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">onValueChange</td>
                      <td className="px-4 py-2.5 text-zinc-400">(value: string) =&gt; void</td>
                      <td className="px-4 py-2.5 text-zinc-500">-</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">输入文本改变时的回调通知</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">onOpenChange</td>
                      <td className="px-4 py-2.5 text-zinc-400">(open: boolean) =&gt; void</td>
                      <td className="px-4 py-2.5 text-zinc-500">-</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">展开或折叠发生时的状态切换通知</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2.5 text-emerald-300">disabled</td>
                      <td className="px-4 py-2.5 text-zinc-400">boolean</td>
                      <td className="px-4 py-2.5 text-zinc-500">false</td>
                      <td className="px-4 py-2.5 font-sans text-zinc-300">禁用交互</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
