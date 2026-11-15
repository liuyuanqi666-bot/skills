import { GooeyInput } from "./components/ui/gooey-input";

// 最小用法。可调参数（surfaceClassName / collapsedWidth / expandedWidth / expandedOffset / gooeyBlur）见 components/ui/gooey-input.tsx 的 props；
// 带主题色卡与参数面板的完整演示在 workbench.tsx（仅预览页用，需要 lucide-react）。
export default function Usage() {
  return (
    <div className="flex h-32 w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <GooeyInput placeholder="Search..." onValueChange={(val) => console.log(val)} />
    </div>
  );
}
