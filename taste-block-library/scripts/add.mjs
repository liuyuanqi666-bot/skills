// 把组件完整复制到另一个项目：node <库目录>/scripts/add.mjs <name> <目标目录> [--public <public目录>] [--force]（也可 npm run add -- ...）
// 复制组件文件 + 它依赖的 shared 文件 + 通过 import 引用的资源，改写相对路径，
// 把字符串形式引用的图片放进目标项目的 public/，最后打印“照抄即可”的安装命令、CSS 引入行、导入语句与注意事项。
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { COMP, PUBLIC, SHARED, ROOT, buildManifest, componentNames, posix, read, resolveRel, specifiers } from "./lib.mjs";

const rootPkg = JSON.parse(read(path.join(ROOT, "package.json")));
const rootVersions = { ...rootPkg.dependencies, ...rootPkg.devDependencies };
const upDir = (from) => {
  let d = path.resolve(from);
  while (d !== path.dirname(d) && !existsSync(path.join(d, "package.json"))) d = path.dirname(d);
  return existsSync(path.join(d, "package.json")) ? d : null;
};
const inside = (child, parent) => !path.relative(parent, child).startsWith("..") && !path.isAbsolute(path.relative(parent, child));
const rel = (from, to) => { const r = posix(path.relative(from, to)); return r.startsWith(".") ? r : "./" + r; };

/** 在宿主项目里找含 `@import "tailwindcss"` 的全局 CSS（跳过 node_modules / dist / 点目录） */
function findTailwindCss(projDir, depth = 4) {
  const hits = [];
  const visit = (dir, d) => {
    if (d > depth) return;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (e.name === "node_modules" || e.name === "dist" || e.name.startsWith(".")) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) visit(full, d + 1);
      else if (e.name.endsWith(".css") && /@import\s+["']tailwindcss["']|@tailwind\s+base/.test(readFileSync(full, "utf8"))) hits.push(full);
    }
  };
  visit(projDir, 0);
  return hits.sort((a, b) => a.length - b.length);
}
const findEntry = (projDir) =>
  ["src/main.tsx", "src/main.ts", "src/main.jsx", "src/main.js", "src/index.tsx", "src/index.ts", "app/layout.tsx", "src/app/layout.tsx"]
    .map((f) => path.join(projDir, f)).find(existsSync) ?? null;

export function addComponent(name, destRoot, { publicDir, quiet = false, force = false } = {}) {
  if (!componentNames().includes(name)) throw new Error(`没有组件 ${name}。可选：${componentNames().join(", ")}`);
  const info = buildManifest().components[name]; // 含 pageStyle / conflictsWith（只有 buildManifest 才会算）
  if (info.problems.length) throw new Error(`${name} 有未解决问题：\n  ${info.problems.join("\n  ")}`);
  destRoot = path.resolve(destRoot);
  if (inside(destRoot, ROOT)) throw new Error(`目标目录 ${destRoot} 在组件库内部。请传入你的项目里的目录（相对路径按你执行命令时所在的目录解析）`);
  const src = path.join(COMP, name);
  const dest = path.join(destRoot, name);
  if (existsSync(dest) && !force) throw new Error(`${dest} 已存在。确认要覆盖请加 --force`);
  const log = quiet ? () => {} : console.log;
  const notes = [];
  const createdDest = !existsSync(dest);

  const projDir = upDir(destRoot);
  const files = info.files;
  const publicFiles = info.public;
  const assets = info.importedAssets;
  let pub = publicDir ? path.resolve(publicDir) : projDir ? path.join(projDir, "public") : null;
  const copied = [];

  try {
    for (const f of files) {
      const to = path.join(dest, f);
      mkdirSync(path.dirname(to), { recursive: true });
      cpSync(path.join(src, f), to);
    }
    // shared 与 import 进来的资源：放进组件目录内的 _shared / _assets，组件自包含
    for (const s of info.shared) cpSync(path.join(SHARED, s), path.join(dest, "_shared", s), { recursive: true });
    for (const a of assets) cpSync(path.join(PUBLIC, a), path.join(dest, "_assets", a), { recursive: true });

    // 改写相对 import
    for (const f of files) {
      if (!/\.(tsx?|css)$/.test(f)) continue;
      const origin = path.join(src, f), target = path.join(dest, f);
      let text = read(target);
      for (const spec of new Set(specifiers(origin, text))) {
        if (!spec.startsWith(".")) continue;
        const r = resolveRel(origin, spec);
        if (!r) continue;
        let to = null;
        if (inside(r, SHARED)) to = path.join(dest, "_shared", path.relative(SHARED, r));
        else if (inside(r, PUBLIC)) to = path.join(dest, "_assets", path.relative(PUBLIC, r));
        if (!to) continue;
        let next = rel(path.dirname(target), to);
        if (/\.(ts|tsx)$/.test(next) && !/\.(ts|tsx)$/.test(spec.split("?")[0])) next = next.replace(/\.(ts|tsx)$/, "");
        const q = spec.includes("?") ? "?" + spec.split("?")[1] : "";
        text = text.split(`"${spec}"`).join(`"${next}${q}"`).split(`'${spec}'`).join(`'${next}${q}'`);
      }
      writeFileSync(target, text);
    }

    // public 资源（字符串路径引用，必须保持原路径）
    if (publicFiles.length) {
      if (!pub) throw new Error("找不到目标项目的 package.json，无法确定 public/ 位置，请用 --public <目录> 指定");
      if (!projDir && !publicDir) notes.push(`图片放到了 ${pub}`);
      for (const f of publicFiles) {
        const to = path.join(pub, f);
        if (existsSync(to) && !readFileSync(to).equals(readFileSync(path.join(PUBLIC, f)))) { notes.push(`public/${f} 已存在且内容不同，未覆盖`); continue; }
        mkdirSync(path.dirname(to), { recursive: true });
        cpSync(path.join(PUBLIC, f), to);
        copied.push(f);
      }
    }
  } catch (e) {
    if (createdDest) rmSync(dest, { recursive: true, force: true });
    throw new Error(`复制 ${name} 失败：${e.message}（已清理 ${createdDest ? dest : "—"}）`);
  }

  // 目标项目检查 + 依赖
  let have = {}, installCmd = [];
  const tp = projDir && path.join(projDir, "package.json");
  if (tp) {
    try { const t = JSON.parse(read(tp)); have = { ...t.dependencies, ...t.devDependencies }; }
    catch (e) { throw new Error(`无法解析 ${tp}：${e.message}`); }
    if (info.tailwind) {
      const v = have.tailwindcss ?? "";
      if (!v) notes.push("目标项目没有 tailwindcss，此组件需要 Tailwind v4（并接入 @tailwindcss/vite 或 postcss 插件）");
      else if (!/^[\^~>=\s]*4/.test(v)) notes.push(`目标项目 tailwindcss 为 ${v}，此组件按 Tailwind v4 编写（v3 下阴影/圆角/模糊等类名含义不同）`);
    }
  } else notes.push("未找到目标项目的 package.json，下面列出全部依赖");
  const need = [...Object.entries(info.peer), ...Object.entries(info.npm)].filter(([k]) => !have[k]).map(([k, v]) => `${k}@${v}`);
  const needTypes = Object.entries(info.types).filter(([k]) => !have[k]).map(([k, v]) => `${k}@${v}`);
  const usageNeed = Object.entries(info.usageNpm).filter(([k]) => !have[k]).map(([k, v]) => `${k}@${v}`);
  const usageNeedTypes = Object.entries(info.usageTypes).filter(([k]) => !have[k]).map(([k, v]) => `${k}@${v}`);

  log(`\n✓ ${name} → ${dest}`);
  log(`  组件文件 ${info.files.length}，shared ${info.shared.length}，随组件的资源 ${assets.length}，public 资源 ${copied.length}${copied.length ? `（已复制到 ${posix(projDir ? path.relative(projDir, pub) || "." : pub)}/，保持原相对路径）` : ""}`);
  log("\n1) 安装依赖（照抄执行；npm 会把写死的版本改成 ^ 范围，属正常）：");
  if (need.length) log(`  npm i ${need.join(" ")}`);
  if (needTypes.length) log(`  npm i -D ${needTypes.join(" ")}`);
  if (!need.length && !needTypes.length) log("  目标项目已满足，无需安装");
  if (usageNeed.length || usageNeedTypes.length) {
    log("  仅 usage.tsx 需要（组件本体不依赖；照 usage.tsx 原样写时才装，删掉演示装饰则不用）：");
    if (usageNeed.length) log(`  npm i ${usageNeed.join(" ")}`);
    if (usageNeedTypes.length) log(`  npm i -D ${usageNeedTypes.join(" ")}`);
  }

  // CSS
  const globalCss = projDir && info.tailwind ? findTailwindCss(projDir) : [];
  const entry = projDir ? findEntry(projDir) : null;
  if (!info.css.length) log("\n2) 引入 CSS：此组件无独立 CSS，无需引入（样式全是 Tailwind 类）");
  else {
    log("\n2) 引入 CSS：");
    for (const c of info.css) {
      const cssFile = path.join(dest, c);
      if (info.cssNeedsTailwindEntry.includes(c) && info.tailwind) {
        if (globalCss.length) log(`  在 ${posix(path.relative(projDir, globalCss[0]))} 的 @import "tailwindcss" 之后加：\n    @import "${rel(path.dirname(globalCss[0]), cssFile)}";`);
        else log(`  未找到含 @import "tailwindcss" 的全局 CSS。请在你的 Tailwind 入口 CSS 里加（路径按该文件位置调整）：\n    @import "<从入口CSS到 ${posix(path.relative(projDir ?? destRoot, cssFile))} 的相对路径>";`);
        notes.push(`${c} 含 @theme/@custom-variant/@apply，必须用 CSS @import 引入（不能在 JS 里 import），否则 Tailwind 不会处理`);
      } else if (entry) log(`  在 ${posix(path.relative(projDir, entry))} 里加：\n    import "${rel(path.dirname(entry), cssFile)}";`);
      else log(`  在应用入口 import：\n    import "${rel(destRoot, cssFile).replace("./", `<入口到 ${posix(path.relative(projDir ?? destRoot, destRoot))} 的相对路径>/`)}";`);
    }
  }

  // 导入语句（路径相对于目标目录；所有导出都列出，区分 default / named / type）
  const exps = [...new Set(info.exports)];
  const hasUsage = info.files.includes("usage.tsx");
  log(`\n3) 导入${hasUsage ? "（只想用组件本体、不走下面的 usage.tsx 时才需要这些；要 1:1 还原直接看后面的“用法示例”）" : ""}（路径相对于 ${posix(path.relative(projDir ?? destRoot, destRoot)) || "."}/，按你的文件位置调整）：`);
  for (const e of exps) {
    const [file, what] = e.split(": ");
    const mod = `./${name}/${file.replace(/\.(tsx?)$/, "")}`;
    const m = what.match(/^(default )?(type )?(\w+)$/);
    if (!m) continue;
    log(m[1] ? `  import ${m[3]} from "${mod}";` : `  import ${m[2] ? "type " : ""}{ ${m[3]} } from "${mod}";`);
  }
  if (info.files.includes("usage.tsx")) {
    log(`\n用法示例（想直接得到和演示页一样的效果，用这个入口）：\n  import Usage from "./${name}/usage";   // 默认导出是一个无 props 的组件，直接 <Usage /> 渲染；或在页面文件里 export { default } from "./${name}/usage";`);
    log(`  ${name}/usage.tsx 里的 import 路径相对它自己，复制后无需改，视觉组合以它为准。`);
    log(`  可删的只有“演示装饰”：最外层整屏壳的 min-h-screen / 纯色背景（若组件靠它的底色成立，保留底色，改成固定高度或 min-h-0）、页眉页脚、“Invocation Fixture (Port …)”之类夹具文字、点击计数等调试展示；组件标签及其 props、数据、包裹组件所需的容器 class 不要动（唯一例外：容器 class 里的整屏高度如 h-svh / min-h-screen / calc(100vh-…) 是演示尺寸，按宿主布局改成固定高度或去掉；本来就是首页整屏 Hero 的可以保留）。`);
    log(`  不用 usage.tsx（只用组件本体）时，请把 ${name}/usage.tsx 从目标目录删掉：它会被宿主的 tsc 检查，缺少“仅 usage.tsx 需要”的依赖会报错。`);
    let ut = ""; try { ut = read(path.join(dest, "usage.tsx")); } catch {}
    if (/\?url["']|from\s+["'][^"']+\.(svg|png|jpe?g|webp)["']/.test(ut)) notes.push('usage.tsx 用 import 引入图片（?url / .svg 等），宿主需要 vite/client 类型：tsconfig 的 types 加 "vite/client"，或加 src/vite-env.d.ts（/// <reference types="vite/client" />）');
    if (/images\.unsplash\.com|https?:\/\/[^"'\s]+\.(jpe?g|png|webp)/.test(ut)) notes.push("usage.tsx 用了外链图片，离线/内网环境请换成 public 里的图");
  }

  if (info.pageStyle?.background || info.pageStyle?.color) notes.push(`演示页 :root/body 的底色 ${info.pageStyle.background ?? "—"}、文字色 ${info.pageStyle.color ?? "—"}；${info.files.includes("usage.tsx") ? "直接用 usage.tsx 时底色/文字色以它外层壳为准（壳自带，可能与此处略有不同），此处仅在只用组件本体时参考" : "组件按此设计"}；宿主页面底色/文字色不同时请自行确认可读性`);
  if (info.conflictsWith?.length) notes.push(`:root 变量与 ${info.conflictsWith.join("、")} 同名但取值不同，不要和它们放在同一页面`);
  if (info.themeTokens.length) notes.push(`${info.themeTokens.join(", ")} 在 :root 定义了主题变量（--xxx），若宿主或其他组件有同名变量会被覆盖`);
  if (info.darkModeByClass) notes.push('dark: 变体按 .dark 类生效（已在 CSS 里声明 @custom-variant dark），需要时给 <html> 加 class="dark"');
  if (info.v3BorderCompat.length) notes.push(`${info.v3BorderCompat.join(", ")} 含全局规则：border 默认色为 gray-200（还原 Tailwind v3 行为）；宿主若依赖 v4 默认的 currentColor 边框，请删除该规则`);
  if (info.missingPublicRefs?.length) notes.push(`引用了库里不存在的图片 ${info.missingPublicRefs.join(", ")}`);
  for (const [f, sels] of Object.entries(info.fullViewport ?? {})) notes.push(`${f} 含整屏高度规则 ${sels.join("、")}（演示外壳或组件自带的整屏布局）；放进有页眉或其他区块的页面时，请按需覆盖为固定高度或 min-height: 0`);
  for (const [f, sels] of Object.entries(info.globalCss)) notes.push(`${f} 含全局选择器 ${sels.join(", ")}，会影响整个页面，请检查`);
  if (notes.length) for (const n of notes) log(`⚠ ${n}`);
  else log("\n无 ⚠ 注意事项。");
  return { info, dest, publicDir: pub, cssImports: info.css.map((c) => ({ file: path.join(dest, c), tailwindEntry: info.cssNeedsTailwindEntry.includes(c) && !!info.tailwind })) };
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.join(ROOT, "scripts", "add.mjs")) {
  const args = process.argv.slice(2);
  const opt = (k) => { const i = args.indexOf(k); if (i < 0) return null; return args.splice(i, 2)[1]; };
  const cwd = process.env.INIT_CWD ?? process.cwd(); // npm run 会把 cwd 切到库根，INIT_CWD 才是用户执行命令的目录
  const publicDir = opt("--public");
  const force = args.includes("--force");
  const pos = args.filter((a) => !a.startsWith("--"));
  if (pos.length < 2) { console.error("用法：node <库目录>/scripts/add.mjs <name> <目标目录> [--public <public目录>] [--force]（在目标项目根目录执行；只需要 Node，不用先 npm install）"); process.exit(1); }
  try { addComponent(pos[0], path.resolve(cwd, pos[1]), { publicDir: publicDir && path.resolve(cwd, publicDir), force }); }
  catch (e) { console.error("✗ " + e.message); process.exit(1); }
}
