# CSS 约定与踩坑

## CSS 约定（复制到别的网页时最容易出错的地方）

- 组件 CSS **不含** `@import "tailwindcss"`：Tailwind 由宿主提供，必须是 **v4**（v3 下阴影/圆角/模糊类名含义不同）。
- 含 `@theme` / `@custom-variant` / `@apply` 的 CSS（manifest 的 `cssNeedsTailwindEntry`）必须在宿主的全局 Tailwind CSS 里用 `@import "..."` 引入，**不能在 JS 里 import**。
- 原 Tailwind v3 的组件，配置已转成 CSS：颜色/圆角/动画 → `@theme`；`darkMode: "class"` → `@custom-variant dark`（需要时给 `<html>` 加 `class="dark"`）；另有一条全局规则把 `border` 默认色还原为 gray-200（`v3BorderCompat`，宿主不需要可删）。
- `:root` 中的 `--xxx` 主题变量是组件需要的（`themeTokens`），宿主若有同名变量会冲突；多个组件同页时同名变量（如 `--background`）取值不同会互相覆盖。
- 页面级样式（body 背景、字体、`prefers-reduced-motion` 全局规则）只在预览用的 `dev/demos/<name>.css`，不会进宿主；组件依赖的背景/字体由宿主决定，`usage.tsx` 的外层壳自带了它需要的底色、字体、`line-height: normal`（宿主有 Tailwind preflight，`html` 的 `line-height: 1.5` 会让没写 line-height 的壳变形）。

## 使用注意（历史踩坑）

- 放进业务页后**不要**给组件额外套黑底、粗边框、固定高度、整屏 min-height、重复 max-width/横向 padding。
- 视差/粘性类（hero-parallax、sticky-scroll-reveal、tracing-beam）的祖先**禁止** `overflow-hidden` 和固定滚动高度；只需抑制横向溢出时在容器用 `overflow-x: clip`，不要在 `body` 用 `overflow-x: hidden`。
- 82vw 宽的轮播放进有 padding 的章节，需要等量负 margin（full-bleed）补偿，不要缩窄卡片。
- `focus-cards` 每页数量必须等于完整网格容量。
- `celestial-sparkle-beam` 只作极光/星空主题的收尾页，不做通用首页 Hero。
- `animated-testimonials`：无空格中文里的 `:` `%` `/` 会丢失（已知未修复）。
- `usage.tsx` 里用 `import x from "...svg?url"` 之类的图片 import 时，宿主需要 `vite/client` 类型；部分 usage 用到外链图片，离线/内网环境请换成 public 里的图。
- 改完在 390px 宽度检查：有效内容宽度、上下留白、水平居中、首屏高度、是否被宿主裁切。

## 来源与许可

部分组件改编自 Aceternity UI（Aceternity License：可用于客户项目，禁止转售源码/主题）及其他开源实现；图片仅为示例占位，不是正式素材。
