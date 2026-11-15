// 公共分析逻辑：扫描组件的真实 import / 资源引用 / CSS，供 manifest、add、check 复用
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// 目录约定（全部相对本文件推算，库整体搬到哪都能用）：
//   assets/{components,public,shared}  被复制到宿主项目的内容
//   references/                        catalog.md / manifest.json / pitfalls.md（给 AI 读）
//   dev/                               维护者专用：展示页、预览页、demos/<name>.css、check/render/manifest 脚本
export const ASSETS = path.join(ROOT, "assets");
export const COMP = path.join(ASSETS, "components");
export const SHARED = path.join(ASSETS, "shared");
export const PUBLIC = path.join(ASSETS, "public");
export const REFS = path.join(ROOT, "references");
export const DEV = path.join(ROOT, "dev");
export const DEMOS = path.join(DEV, "demos"); // 预览页专用：<name>.css（页面级样式 + Tailwind 入口）、<name>.workbench.tsx（可选重型演示面板）
const CODE = /\.(tsx?|css)$/;
const EXTS = ["", ".ts", ".tsx", ".css", ".js", "/index.ts", "/index.tsx"];
const FRAMEWORK = new Set(["react", "react-dom"]);

export const posix = (p) => p.split(path.sep).join("/");
export const read = (p) => readFileSync(p, "utf8").replace(/^﻿/, "");

export function walk(dir, base = dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, base));
    else out.push(posix(path.relative(base, full)));
  }
  return out.sort();
}

export const componentNames = () =>
  readdirSync(COMP, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();

/** 提取一个文件里的全部模块引用字符串 */
export function specifiers(file, text) {
  const s = [];
  const re = /(?:from|import|export\s+\*\s+from)\s*\(?\s*["']([^"']+)["']|@import\s+["']([^"']+)["']|@config\s+["']([^"']+)["']|new\s+URL\(\s*["']([^"']+)["']\s*,\s*import\.meta\.url/g;
  for (let m; (m = re.exec(text)); ) s.push(m[1] ?? m[2] ?? m[3] ?? m[4]);
  return s;
}

export function pkgOf(spec) {
  const parts = spec.split("/");
  return spec.startsWith("@") ? parts.slice(0, 2).join("/") : parts[0];
}

/** 把相对 spec 解析成磁盘上的真实文件（含扩展名补全）；找不到返回 null */
export function resolveRel(fromFile, spec) {
  const clean = spec.split("?")[0];
  const base = path.resolve(path.dirname(fromFile), clean);
  for (const ext of EXTS) {
    const p = base + ext;
    if (existsSync(p) && statSync(p).isFile()) return p;
  }
  return null;
}

const inside = (child, parent) => !path.relative(parent, child).startsWith("..");

/** 公共资源引用：字符串字面量里以 / 开头且对应 public/ 里的真实文件（或 `/dir/${` 动态目录前缀） */
function publicRefs(text) {
  const files = new Set();
  const missing = new Set();
  const re = /["'`(](\/[\w\-./]+)(\$\{)?/g;
  for (let m; (m = re.exec(text)); ) {
    const p = m[1];
    if (p.length < 2 || p.startsWith("//")) continue;
    const full = path.join(PUBLIC, p);
    if (m[2] || p.endsWith("/")) {
      const dir = full.replace(/[\\/]+$/, "");
      if (existsSync(dir) && statSync(dir).isDirectory()) walk(dir, PUBLIC).forEach((f) => files.add(f));
    } else if (existsSync(full) && statSync(full).isFile()) files.add(posix(path.relative(PUBLIC, full)));
    else if (/^\/(images|sample-files)\//.test(p) || /\.(png|jpe?g|webp|svg|gif|mp4|txt)$/.test(p)) missing.add(p);
  }
  return { files, missing };
}

// 组件 CSS 里不允许出现会影响宿主页面的“裸元素”选择器（html/body/*/#root/button/a/input/img/h1… 开头，没有类名限定）
const BARE = /^(html|body|\*|#root|button|a|input|select|textarea|label|summary|img|svg|video|canvas|h[1-6]|p|ul|ol|li|section|main|header|footer|nav|table)(?![\w\[.#-])/; // button.x / button[class*=…] 已带限定，不算全局
function globalSelectors(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "").replace(/[^{}]*::file-selector-button[^{}]*\{[^}]*\}/g, "");
  const out = new Set();
  for (const m of css.matchAll(/([^{};]+)\{/g)) {
    const head = m[1].trim();
    if (head.startsWith("@")) continue;
    for (const part of head.split(",")) { const s = part.trim(); const b = s.match(BARE); if (b) out.add(b[1]); else { const p = s.match(/^::?(?!root\b|host\b|where\b|is\b|not\b|has\b)[\w-]+/); if (p) out.add(p[0]); } } // 裸伪元素/伪类（如 ::-webkit-scrollbar、::selection）同样全局
  }
  return [...out];
}
// 整屏高度规则（height / min-height 用到 100vh|svh|dvh|lvh）：多半是演示外壳或组件自带的整屏布局，放进业务页要按需覆盖
function fullViewportSelectors(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = new Set();
  for (const m of css.matchAll(/([^{};]+)\{([^{}]*)\}/g)) {
    const head = m[1].trim();
    if (head.startsWith("@")) continue;
    if (/(^|[;\s])(?:min-)?height\s*:[^;]*\b100[sdl]?vh\b/.test(m[2])) out.add(head.replace(/\s+/g, " ").slice(0, 60));
  }
  return [...out];
}
const THEME_AT = /@(theme|apply|utility|custom-variant|reference)\b/;

export function analyze(name) {
  const dir = path.join(COMP, name);
  const all = walk(dir);
  const demoFiles = [`${name}.css`, `${name}.workbench.tsx`].filter((f) => existsSync(path.join(DEMOS, f))); // dev/demos 里的预览专用文件
  const files = all.filter((f) => f !== "meta.json" && !f.startsWith("tests/"));
  const tests = all.filter((f) => f.startsWith("tests/"));
  const deps = new Set(), usageDeps = new Set(), shared = new Set(), assetsImported = new Set(), css = [], globalCss = {}, fullViewport = {};
  const publicFiles = new Set(), publicMissing = new Set(), problems = [];
  const tokens = [], needsTailwindEntry = [], demoMissing = new Set(), baseRules = [];
  let darkClass = false;
  let usesTailwind = false, tailwindConfig = null;
  const exports = [];

  for (const f of files) {
    const full = path.join(dir, f);
    if (!CODE.test(f)) continue;
    const text = read(full);
    if (f.endsWith(".css")) {
      css.push(f);
      if (THEME_AT.test(text) || /@tailwind\b/.test(text)) needsTailwindEntry.push(f);
      if (/(^|\n)\s*:root\b/.test(text)) tokens.push(f);
      if (/::file-selector-button/.test(text)) baseRules.push(f);
      if (/@custom-variant\s+dark/.test(text)) darkClass = true;
      if (/@import\s+["']tailwindcss["']/.test(text)) usesTailwind = true;
      const sels = globalSelectors(text);
      if (sels.length) globalCss[f] = sels;
      const fv = fullViewportSelectors(text);
      if (fv.length) fullViewport[f] = fv;
    } else if (f !== "usage.tsx") {
      for (const m of text.matchAll(/export\s+(default\s+)?(?:async\s+)?(function|const|class|interface|type)\s+(\w+)/g))
        exports.push(`${f}: ${m[1] ? "default " : ""}${/^(interface|type)$/.test(m[2]) ? "type " : ""}${m[3]}`);
      for (const m of text.matchAll(/export\s+default\s+(?!(?:async\s+)?(?:function|class)\b)(\w+)/g)) exports.push(`${f}: default ${m[1]}`);
      for (const m of text.matchAll(/export\s*\{([^}]*)\}/g))
        for (const part of m[1].split(",")) {
          const [a, b] = part.trim().split(/\s+as\s+/);
          if (!a) continue;
          exports.push(`${f}: ${b === "default" ? "default " + a : (b ?? a)}`);
        }
    }
    for (const spec of specifiers(full, text)) {
      if (spec === "tailwindcss") continue;
      if (spec.startsWith(".")) {
        const r = resolveRel(full, spec);
        if (!r) { problems.push(`${f}: 无法解析 ${spec}`); continue; }
        if (inside(r, SHARED)) shared.add(posix(path.relative(SHARED, r)));
        else if (inside(r, PUBLIC)) assetsImported.add(posix(path.relative(PUBLIC, r)));
        else if (!inside(r, dir)) problems.push(`${f}: ${spec} 指向组件目录之外`);
        if (spec.endsWith(".css") && f.endsWith(".css") && spec.includes("tailwind.config")) tailwindConfig = "tailwind.config.js";
      } else if (!spec.startsWith("node:") && !spec.startsWith("/")) {
        const p = pkgOf(spec);
        if (!FRAMEWORK.has(p)) (f === "usage.tsx" ? usageDeps : deps).add(p);
      }
    }
    if (/@config\s+["'][^"']*tailwind\.config/.test(text)) tailwindConfig = "tailwind.config.js";
    const refs = publicRefs(text);
    refs.files.forEach((x) => publicFiles.add(x));
    refs.missing.forEach((x) => publicMissing.add(x));
  }
  for (const s of shared) {
    const sf = path.join(SHARED, s);
    if (!existsSync(sf) || !statSync(sf).isFile()) continue;
    for (const spec of specifiers(sf, read(sf))) if (!spec.startsWith(".") && !spec.startsWith("node:")) { const p = pkgOf(spec); if (!FRAMEWORK.has(p)) deps.add(p); }
  }
  if (tailwindConfig && !files.includes(tailwindConfig)) problems.push("引用了 tailwind.config.js 但文件不存在");
  for (const f of demoFiles) { // 预览专用文件：只检查引用能解析、引用的图片存在
    const text = read(path.join(DEMOS, f));
    publicRefs(text).missing.forEach((x) => demoMissing.add(x));
    for (const spec of specifiers(path.join(DEMOS, f), text)) if (spec.startsWith(".") && !resolveRel(path.join(DEMOS, f), spec)) problems.push(`dev/demos/${f}: 无法解析 ${spec}`);
  }

  // 组件内的 CSS 之间有 @import：被别的 CSS 引入的文件不再单独列为入口（引入口子即可，否则会重复引入），
  // 入口继承子文件的“必须走 CSS @import（含 @theme 等）”要求
  const cssChildren = {};
  for (const f of css) {
    cssChildren[f] = [];
    const full = path.join(dir, f);
    for (const spec of specifiers(full, read(full))) {
      if (!spec.startsWith(".")) continue;
      const r = resolveRel(full, spec);
      const rel = r && posix(path.relative(dir, r));
      if (rel && css.includes(rel) && rel !== f) cssChildren[f].push(rel);
    }
  }
  const cssImportedByOthers = new Set(Object.values(cssChildren).flat());
  const needSet = new Set(needsTailwindEntry);
  for (let changed = true; changed; ) {
    changed = false;
    for (const [f, kids] of Object.entries(cssChildren)) if (!needSet.has(f) && kids.some((k) => needSet.has(k))) { needSet.add(f); changed = true; }
  }
  const cssEntries = css.filter((f) => !cssImportedByOthers.has(f));
  const cssEntriesNeedTailwind = cssEntries.filter((f) => needSet.has(f));

  const meta = existsSync(path.join(dir, "meta.json")) ? JSON.parse(read(path.join(dir, "meta.json"))) : {};
  const allow = new Set(meta.allow_missing ?? []);
  for (const x of [...publicMissing, ...demoMissing]) if (!allow.has(x)) problems.push(`引用了库里不存在的资源 ${x}（若是刻意的失败演示，在 meta.json 的 allow_missing 里登记）`);
  const pkg = JSON.parse(read(path.join(ROOT, "package.json")));
  const versions = { ...pkg.dependencies, ...pkg.devDependencies };
  const npm = {};
  for (const d of [...deps].sort()) {
    if (!versions[d]) problems.push(`依赖 ${d} 未在根 package.json 声明`);
    npm[d] = versions[d] ?? "?";
  }
  // 类型声明：根 package.json 里有 @types/<dep> 就一并列为开发依赖（否则严格 TS 宿主会 TS7016）
  const typesOf = (names) => {
    const out = {};
    for (const d of names) {
      const t = "@types/" + d.replace(/^@/, "").replace("/", "__");
      if (versions[t]) out[t] = versions[t];
    }
    return out;
  };
  const types = typesOf(Object.keys(npm));
  // 只有 usage.tsx 用到、组件本体不需要的依赖：照 usage.tsx 写时才装
  const usageNpm = {};
  for (const d of [...usageDeps].sort()) {
    if (deps.has(d)) continue;
    if (!versions[d]) problems.push(`usage.tsx 依赖 ${d} 未在根 package.json 声明`);
    usageNpm[d] = versions[d] ?? "?";
  }
  const usageTypes = typesOf(Object.keys(usageNpm));
  // 自动图片：只有 public 里存在才算（缺失的引用单独列出，常见于刻意的“图片加载失败”演示）
  return {
    name,
    ...meta,
    files,
    exports: exports.sort(),
    npm,
    types,
    usageNpm,
    usageTypes,
    peer: { react: pkg.dependencies.react, "react-dom": pkg.dependencies["react-dom"] },
    shared: [...shared].sort(),
    public: [...publicFiles].sort(),
    importedAssets: [...assetsImported].sort(),
    css: cssEntries.sort(),
    cssNeedsTailwindEntry: cssEntriesNeedTailwind.sort(),
    themeTokens: tokens.sort(),
    v3BorderCompat: baseRules.sort(),
    darkModeByClass: darkClass,
    tailwind: existsSync(path.join(DEMOS, `${name}.css`)) && read(path.join(DEMOS, `${name}.css`)).includes('@import "tailwindcss"') ? { required: ">=4" } : false,
    globalCss,
    fullViewport,
    problems,
  };
}

/** 演示页给页面设置的底色/文字色（组件按此设计，宿主不同时需注意）；取自 dev/demos/<name>.css 的 :root/html/body/#root 规则 */
function pageStyleOf(demoCss) {
  demoCss = demoCss.replace(/\/\*[\s\S]*?\*\//g, "").replace(/@import[^;]*;/g, "");
  const out = {};
  for (const m of demoCss.matchAll(/(?:^|\})\s*([^{}@]+)\{([^{}]*)\}/g)) {
    if (!/(^|,)\s*(:root|html|body|#root)\s*(,|$)/.test(m[1].trim())) continue;
    const bg = m[2].match(/(?:^|;)\s*background(?:-color)?\s*:\s*([^;]+)/);
    const fg = m[2].match(/(?:^|;)\s*color\s*:\s*([^;]+)/);
    if (bg) out.background = bg[1].trim();
    if (fg) out.color = fg[1].trim();
  }
  return out;
}

export function buildManifest() {
  const components = {};
  for (const n of componentNames()) components[n] = analyze(n);
  // 补充：演示页底色；跨组件 :root 同名变量取值不同 → conflictsWith
  const vars = {};
  for (const c of Object.values(components)) {
    const dc = path.join(DEMOS, `${c.name}.css`);
    c.pageStyle = existsSync(dc) ? pageStyleOf(read(dc)) : {};
    for (const f of c.themeTokens)
      for (const blk of read(path.join(COMP, c.name, f)).matchAll(/:root\s*\{([^}]*)\}/g))
        for (const d of blk[1].matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) ((vars[d[1]] ??= {})[c.name] = d[2].trim());
  }
  for (const c of Object.values(components)) {
    const set = new Set();
    for (const by of Object.values(vars)) if (by[c.name] !== undefined) for (const [o, v] of Object.entries(by)) if (o !== c.name && v !== by[c.name]) set.add(o);
    c.conflictsWith = [...set].sort();
  }
  return { generatedBy: "dev/scripts/manifest.mjs（勿手改，改 assets/components/<name>/meta.json 后运行 npm run manifest 重新生成）", components };
}

export function renderCatalog(manifest) {
  const out = [
    "# 组件目录（自动生成，勿手改）",
    "",
    "选型：看「何时用 / 避免」。取用：在目标项目根目录执行 `node \"<库>/scripts/add.mjs\" <name> <目标目录>`（`<库>` 是 SKILL.md 所在目录，详见 SKILL.md），踩坑与 CSS 约定见 `pitfalls.md`；完整机器可读信息（依赖版本、文件、图片、CSS 要求）见 `manifest.json`。",
    "",
  ];
  for (const kind of ["section", "pattern", "effect"]) {
    out.push(`## ${kind}`, "", "| 名称 | 用途 | 何时用 | 避免 | 额外依赖 |", "|---|---|---|---|---|");
    for (const c of Object.values(manifest.components)) {
      if (c.kind !== kind) continue;
      out.push(`| \`${c.name}\` | ${c.summary} | ${c.use_when} | ${c.avoid_when} | ${Object.keys(c.npm).join(", ") || "—"} |`);
    }
    out.push("");
  }
  return out.join("\n");
}
