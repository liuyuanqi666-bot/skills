---
name: taste-block-library
description: 旅游产品页的动画/交互 React 组件库（45 个，React 19 + Tailwind v4 + motion）。需要给网页加轮播、卡片堆、Hero、背景特效、按钮、加载动画等动效组件时使用：先读 references/catalog.md 选型，再用 scripts/add.mjs 把组件连同依赖、图片、CSS 一次复制进目标项目。
---

# taste-block-library

下文的 `<库>` 指**本文件所在的目录**（不要写死路径，库可能被搬到别的位置或设备）。`add` 只需要 Node，不用先 `npm install`。

1. **选**：读 `<库>/references/catalog.md`（用途 / 何时用 / 避免 / 额外依赖）。要看依赖版本、文件、图片、CSS 要求读 `<库>/references/manifest.json`。
2. **取**：在**目标项目根目录**执行（相对路径按你执行命令的目录解析）：
   ```
   node "<库>/scripts/add.mjs" <name> <目标项目内的目录，如 ./src/components/blocks>
   ```
   目标目录不能在库内；已存在需加 `--force`；图片目录非默认时加 `--public <dir>`。
3. **用**：命令末尾会打印可直接照抄的 ① `npm i ...` ② CSS 引入行 ③ `import ...` 语句（区分 default / named / type）以及 ⚠ 注意事项。**逐条执行，不要猜路径。**

## 必须知道的约束
- 宿主必须是 **Tailwind v4**；含 `@theme`/`@apply`/`@custom-variant` 的 CSS 只能用 CSS `@import` 引入（放在宿主全局 Tailwind CSS 里 `@import "tailwindcss"` 之后），不能在 JS 里 import；其余普通 CSS 按 `add` 打印的提示在应用入口 JS 里 import；无 CSS 的组件 `add` 会写明“无需引入”。
- **要 1:1 还原效果，直接用 `usage.tsx`**（随组件复制，含演示数据和视觉组合）：它默认导出一个无 props 的组件，页面里 `import Usage from "./<name>/usage"` 后渲染 `<Usage />`，或 `export { default } from "./<name>/usage"`；它的相对 import 复制后不用改。可删的只是演示装饰：整屏壳的 `min-h-screen`/纯色背景（组件靠它的底色成立时保留底色）、页眉页脚、“Invocation Fixture (Port …)” 夹具文字、点击计数等；组件标签、数据、容器 class 不要动；唯一例外是整屏高度（容器 class 里的 `h-svh`、`min-h-screen`、`calc(100vh-…)`，或 `add` 的 ⚠ 指出的 CSS 外壳类里的 `min-height: 100svh`），那是演示尺寸，按宿主布局改成固定高度或去掉（本来就是首页整屏 Hero 的，可以保留）。
- `npm i` 可能分两段：组件本体依赖，和“仅 usage.tsx 需要”的依赖（如演示用的图标库）；没有第二段就说明 usage.tsx 没有额外依赖。**不用 usage.tsx 时必须把它从目标目录删掉**（宿主的 `tsc` 会检查它，缺依赖会报错）；用它就把第二段也装上。
- 打印的 ⚠（有就会出现）会给出演示页的底色/文字色、整屏高度规则和会冲突的其他组件，按它处理。同一页面混用多个组件时，注意 ⚠ 里提示的 `:root` 同名变量会互相覆盖。
- 放进业务页后不要给组件额外套黑底、固定高度、整屏 min-height；视差/粘性类组件的祖先禁止 `overflow-hidden`。CSS 约定和更多踩坑见 `<库>/references/pitfalls.md`。

## 目录
```
SKILL.md          入口（本文件）
scripts/          add.mjs（取用命令）、lib.mjs
references/       catalog.md、manifest.json（自动生成）、pitfalls.md
assets/           components/<name>/（组件 + usage.tsx + meta.json）、public/（示例图片）、shared/
dev/              维护者专用（展示页、预览、自检脚本），用组件时不需要读
```
改库请读 `<库>/dev/README.md` 和 `<库>/AGENTS.md`。
