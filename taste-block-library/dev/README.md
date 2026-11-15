# 维护者说明（用组件的 AI 不需要读这里）

`dev/` 里是维护库用的东西：展示页、预览页、自检脚本。技能本体（`SKILL.md`、`scripts/`、`references/`、`assets/`）不依赖它。

```
dev/
  index.html + showcase/   展示页：列表/搜索/分类、桌面·平板·手机预览（iframe）、取用命令与依赖/注意事项；数据全读 references/manifest.json
  preview.html + preview.tsx   通用单组件预览页：/dev/preview.html?c=<组件名>（按名字懒加载 demos/<name>.css 和 usage.tsx）
  demos/<name>.css         预览页专用样式：Tailwind 入口 + body/html/:root 等页面级样式（不随组件复制）
  demos/<name>.workbench.tsx   （仅个别组件，如 gooey-input）重型演示面板，预览用
  demos/pages.json         每个组件预览页的 <html lang/class>、<body class>（底色、字色、dark 等），只记录有的
  scripts/                 manifest.mjs / check.mjs / render.mjs
  vite.config.ts tsconfig.json
  dist/ .render/           构建产物与渲染截图/基线（不进 git）
```

## 命令（在库根目录）

```
npm install
npm run dev        # http://127.0.0.1:5173/dev/ 展示页（#<name> 直达某组件）；/dev/preview.html?c=<name> 预览单个组件
npm run manifest   # 改了组件或 meta.json 后重新生成 references/manifest.json 和 catalog.md
npm run check      # 自检：清单未过期、meta 完整、:root 变量冲突警告、全部组件按 add 的指引复制到系统临时目录的空项目后可类型检查+构建、预览页整体可构建
npm run render     # 浏览器渲染冒烟（需本机 Chrome，可设 CHROME_PATH）：构建，逐组件 1280/390 打开，查脚本报错/请求失败/图片损坏/空白（错误）、横向溢出（警告）；截图存 dev/.render/current/，有 dev/.render/baseline/ 则像素对比；--update 设当前为基线（会清空整个基线）；可指定组件名只测几个。粒子/流星类随机效果与基线有 0.3~0.8% 差异属正常
npm run typecheck  # 本库自身类型检查
```

## 规则

- **新增组件**：建 `assets/components/<name>/`（组件文件 + `usage.tsx` + `meta.json`）和 `dev/demos/<name>.css`（至少 `@import "tailwindcss";` 加组件样式的 `@import "../../assets/components/<name>/styles.css";`），需要页面底色/dark 时在 `dev/demos/pages.json` 登记，然后 `npm run manifest && npm run check`。
- 组件文件**保持自包含**：不得依赖 `dev/`，不得用库外相对路径；公共函数放 `assets/shared/`，图片放 `assets/public/images/`。
- 页面级样式只放 `dev/demos/<name>.css`；`usage.tsx` 的外层壳需要的字体/颜色/`line-height: normal` 放在组件自己的 CSS 壳类里。
- **组件 CSS 不得有“裸元素”选择器**（`html/body/*/#root/button/a/input/img/h1…` 开头且无类名限定）和裸伪元素（如 `::-webkit-scrollbar`、`::selection`），它们会改宿主页面；`button.x`、`.root button` 这类带限定的可以。`check` 会拦。
- Tailwind v4 组件不必写 `button { font: inherit }`：preflight 已有，且无层的全局规则会压过 `font-semibold` 等工具类（改它前先用 `npm run render` 对比截图）。
- 图片按路径引用（`"/images/x.svg"`）或 `import`/`new URL(..., import.meta.url)` 均可，`check` 会验证文件存在；刻意的"加载失败"演示路径在 `meta.json` 的 `allow_missing` 登记。
- **不要写死路径**：脚本一律相对自身位置（`import.meta.url`）推算，文档用 `<库>` 指代库目录；库要能整体搬到别的设备、别的系统使用。
- 提交前 `npm run check` 必须通过；改了 CSS/视觉相关文件再跑一次 `npm run render`，没有 ✗ 才算完成。

## 历史

2026-11-06 库目录被意外清空，从 Magpie 备份恢复，此前的 git 历史丢失（备份里不含 `.git`）；之后的提交从这里重新开始。
