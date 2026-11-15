// 自检：npm run check
// 1) manifest.json / catalog.md 与源码一致，meta.json 完整
// 2) 把每个组件“复制到空项目”后：依赖已声明、图片都在、类型检查通过、vite 能构建（含 CSS/Tailwind）；3) 预览页（dev/preview.html + dev/demos）整体能构建
// 任何一项失败都以非 0 退出。
import { existsSync, mkdirSync, readFileSync, rmSync, rmdirSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import os from "node:os";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { ROOT, REFS, buildManifest, componentNames, renderCatalog } from "../../scripts/lib.mjs";
import { addComponent } from "../../scripts/add.mjs";

const fail = [];
const bad = (m) => { fail.push(m); console.error("✗ " + m); };

// 1. 生成物是否过期 + 元数据完整
const m = buildManifest();
const same = (file, text) => existsSync(path.join(REFS, file)) && readFileSync(path.join(REFS, file), "utf8").trim() === text.trim();
if (!same("manifest.json", JSON.stringify(m, null, 1))) bad("manifest.json 已过期：运行 npm run manifest");
if (!same("catalog.md", renderCatalog(m))) bad("catalog.md 已过期：运行 npm run manifest");
for (const c of Object.values(m.components)) {
  for (const p of c.problems) bad(`${c.name}: ${p}`);
  for (const k of ["kind", "summary", "use_when", "avoid_when"]) if (!c[k]) bad(`${c.name}: meta.json 缺少 ${k}`);
  if (!c.files.length) bad(`${c.name}: 没有组件文件`);
  if (Object.keys(c.globalCss).length) bad(`${c.name}: 组件 CSS 含页面级选择器 ${JSON.stringify(c.globalCss)}（应放进 dev/demos/<name>.css）`);
}

// 跨组件的 :root 同名变量取值不同 → 同页组合时会互相覆盖（先作为警告，不阻断）
for (const c of Object.values(m.components)) {
  for (const [f, sels] of Object.entries(c.fullViewport ?? {})) console.warn(`⚠ ${c.name}/${f} 含整屏高度规则 ${sels.join("、")}（若是组件本体而非 usage 外壳，请确认放进业务页可覆盖）`);
  if (c.conflictsWith.length) console.warn(`⚠ ${c.name} 的 :root 变量与 ${c.conflictsWith.join("、")} 同名但取值不同（同页混用会互相覆盖）`);
  if (!c.files.includes("usage.tsx")) bad(`${c.name}: 缺少 usage.tsx（最小用法示例）`);
}

function trial(mode) {
  // 放在系统临时目录（不污染库），用 junction 复用库的 node_modules
  const tmp = path.join(os.tmpdir(), `taste-check-${mode}-${process.pid}`);
  rmSync(tmp, { recursive: true, force: true });
  mkdirSync(path.join(tmp, "src/blocks"), { recursive: true });
  symlinkSync(path.join(ROOT, "node_modules"), path.join(tmp, "node_modules"), "junction");
  writeFileSync(path.join(tmp, "package.json"), JSON.stringify({ name: "tmp", private: true, dependencies: { tailwindcss: "^4.0.0" } }));
  const hostCss = path.join(tmp, "src/index.css");
  const ts = [], css = ['@import "tailwindcss";'];
  const relTo = (from, to) => { const r = path.relative(path.dirname(from), to).split(path.sep).join("/"); return r.startsWith(".") ? r : "./" + r; };
  for (const n of componentNames()) {
    try {
      const { info, cssImports } = addComponent(n, path.join(tmp, "src/blocks"), { quiet: true });
      const files = info.files;
      for (const f of info.public) if (!existsSync(path.join(tmp, "public", f))) bad(`[${mode}] ${n}: 图片 ${f} 未复制`);
      {
        // 与 add 打印的指引一致：Tailwind 类 CSS 走宿主全局 CSS 的 @import，其余走 JS import
        for (const c of cssImports) {
          if (!existsSync(c.file)) bad(`[${mode}] ${n}: CSS ${c.file} 不存在`);
          else if (c.tailwindEntry) css.push(`@import "${relTo(hostCss, c.file)}";`);
          else ts.push(`import "${relTo(path.join(tmp, "entry.ts"), c.file)}";`);
        }
        for (const f of files) if (/\.tsx?$/.test(f)) ts.push(`import "./src/blocks/${n}/${f}";`);
      }
    } catch (e) { bad(`[${mode}] ${n}: ${e.message}`); }
  }
  writeFileSync(hostCss, css.join("\n") + "\n");
  writeFileSync(path.join(tmp, "entry.ts"), 'import "./src/index.css";\n' + ts.join("\n") + "\n");
  writeFileSync(path.join(tmp, "index.html"), '<!doctype html><html><body><div id="root"></div><script type="module" src="./entry.ts"></script></body></html>');
  writeFileSync(path.join(tmp, "tsconfig.json"), JSON.stringify({
    compilerOptions: { target: "es2023", lib: ["ES2023", "DOM", "DOM.Iterable"], module: "esnext", moduleResolution: "bundler", types: ["vite/client"],
      jsx: "react-jsx", strict: true, skipLibCheck: true, isolatedModules: true, allowImportingTsExtensions: true, noEmit: true },
    include: ["src", "entry.ts"],
  }));
  writeFileSync(path.join(tmp, "vite.config.mjs"), `import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default { root: ${JSON.stringify(tmp)}, plugins: [react(), tailwindcss()], logLevel: "warn", build: { outDir: "dist", emptyOutDir: true, chunkSizeWarningLimit: 5000 } };
`);
  const run = (label, args) => {
    const r = spawnSync("npx", args, { cwd: tmp, encoding: "utf8", shell: true });
    if (r.status !== 0) bad(`[${mode}] ${label} 失败：\n${(r.stdout + r.stderr).split("\n").slice(0, 25).join("\n")}`);
    else console.log(`✓ [${mode}] ${label}`);
  };
  if (!fail.length) {
    run("复制后类型检查", ["tsc", "-p", "tsconfig.json"]);
    run("复制后 vite 构建", ["vite", "build", "--config", "vite.config.mjs"]);
  }
  try { unlinkSync(path.join(tmp, "node_modules")); } catch { rmdirSync(path.join(tmp, "node_modules")); } // 只摘掉 junction 本身，不动库的 node_modules
  rmSync(tmp, { recursive: true, force: true });
}
trial("component");

// 预览页：dev/preview.html 按名字懒加载 dev/demos/*.css 与各组件 usage.tsx，整体构建一次
{
  const out = path.join(os.tmpdir(), `taste-check-preview-${process.pid}`);
  const r = spawnSync("npx", ["vite", "build", "--config", path.join("dev", "vite.config.ts"), "--outDir", out], { cwd: ROOT, encoding: "utf8", shell: true });
  if (r.status !== 0) bad(`[preview] 预览页构建失败：\n${(r.stdout + r.stderr).split("\n").slice(0, 25).join("\n")}`);
  else console.log("✓ [preview] 预览页构建");
  rmSync(out, { recursive: true, force: true });
}

console.log(fail.length ? `\n自检失败：${fail.length} 项` : `\n自检通过：${componentNames().length} 个组件均可独立复制并构建`);
process.exit(fail.length ? 1 : 0);
