// 通用单组件预览页：/dev/preview.html?c=<组件名>
// 先加载 demos/<name>.css（页面级样式 + Tailwind 入口，只加载这一个，组件之间互不污染），
// 再渲染 usage.tsx（gooey-input 这类有重型演示面板的用 demos/<name>.workbench.tsx）。
import { StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import pages from "./demos/pages.json"; // 每个组件原先预览页壳上的 <html lang/class> 与 <body class>（底色、字色、dark 等），只记录有的

type Loader = () => Promise<{ default: ComponentType }>;
const styles = import.meta.glob("./demos/*.css") as Record<string, () => Promise<unknown>>;
const workbenches = import.meta.glob("./demos/*.workbench.tsx") as Record<string, Loader>;
const usages = import.meta.glob("../assets/components/*/usage.tsx") as Record<string, Loader>;

const name = new URLSearchParams(location.search).get("c") ?? "";
document.title = name || "preview";

async function main() {
  const load = workbenches[`./demos/${name}.workbench.tsx`] ?? usages[`../assets/components/${name}/usage.tsx`];
  if (!load) {
    document.body.textContent = `没有组件 "${name}"（用法：/dev/preview.html?c=<组件名>）`;
    return;
  }
  await styles[`./demos/${name}.css`]?.();
  const page = (pages as Record<string, { lang?: string; htmlClass?: string; bodyClass?: string }>)[name] ?? {};
  document.documentElement.lang = page.lang ?? "zh-CN";
  if (page.htmlClass) document.documentElement.className = page.htmlClass;
  if (page.bodyClass) document.body.className = page.bodyClass;
  const Page = (await load()).default;
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <Page />
    </StrictMode>,
  );
}
void main();
