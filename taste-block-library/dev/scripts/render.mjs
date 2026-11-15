// 浏览器渲染冒烟：npm run render [-- <name...>] [--update] [--keep]
// 构建整库 → 起 vite preview → 逐个组件在 1280 / 390 宽度打开 dev/preview.html?c=<name>（reducedMotion），检查：
//   错误：脚本报错、console.error、请求 4xx/5xx（meta.allow_missing 登记的除外）、图片加载失败、页面空白
//   警告：横向溢出（scrollWidth > 视口宽）
// 截图存 dev/.render/current/；若有 dev/.render/baseline/ 则逐像素对比并报告差异比例，--update 把当前截图设为基线。
// 需要本机 Chrome/Chromium（可用环境变量 CHROME_PATH 指定）和 devDependencies 里的 playwright-core / pngjs / pixelmatch。
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, cpSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ROOT, DEV, buildManifest } from "../../scripts/lib.mjs";

const args = process.argv.slice(2);
const update = args.includes("--update");
const names = args.filter((a) => !a.startsWith("--"));
const manifest = buildManifest().components;
const targets = names.length ? names : Object.keys(manifest);
for (const n of targets) if (!manifest[n]) { console.error(`没有组件 ${n}`); process.exit(1); }

const chromeCandidates = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].filter(Boolean);
const executablePath = chromeCandidates.find((p) => existsSync(p));
if (!executablePath) { console.error("找不到 Chrome/Chromium，请设置环境变量 CHROME_PATH"); process.exit(1); }

let chromium, PNG, pixelmatch;
try {
  ({ chromium } = await import("playwright-core"));
  ({ PNG } = await import("pngjs"));
  pixelmatch = (await import("pixelmatch")).default;
} catch { console.error("缺少依赖，请先在库目录执行 npm install（playwright-core / pngjs / pixelmatch 在 devDependencies）"); process.exit(1); }

const { build, preview } = await import("vite");
console.log("构建整库…");
await build({ root: ROOT, configFile: path.join(DEV, "vite.config.ts"), logLevel: "error" });
const server = await preview({ root: ROOT, configFile: path.join(DEV, "vite.config.ts"), logLevel: "error", preview: { port: 0, host: "127.0.0.1", strictPort: false } });
const base = server.resolvedUrls.local[0].replace(/\/$/, "");

const cur = path.join(DEV, ".render", "current"), baseline = path.join(DEV, ".render", "baseline");
rmSync(cur, { recursive: true, force: true });
mkdirSync(cur, { recursive: true });

const browser = await chromium.launch({ executablePath, args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"] });
const problems = [], warnings = [], diffs = [];

for (const name of targets) {
  const allow = new Set(manifest[name].allow_missing ?? []);
  for (const w of [1280, 390]) {
    const tag = `${name}@${w}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: w === 390 ? 844 : 800 }, reducedMotion: "reduce" });
    const page = await ctx.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(`脚本报错：${e.message.slice(0, 140)}`));
    page.on("console", (m) => { if (m.type() === "error" && !/Failed to load resource/.test(m.text())) errs.push(`console.error：${m.text().slice(0, 140)}`); });
    page.on("response", (r) => {
      const u = new URL(r.url()).pathname;
      if (r.status() >= 400 && !u.endsWith("/favicon.ico") && ![...allow].some((a) => u.endsWith(a))) errs.push(`请求 ${r.status()} ${u}`);
    });
    try {
      await page.goto(`${base}/dev/preview.html?c=${encodeURIComponent(name)}`, { waitUntil: "networkidle", timeout: 45000 });
      await page.waitForTimeout(1200);
      const shot = path.join(cur, `${name}-${w}.png`);
      await page.screenshot({ path: shot });
      const info = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth, vw: window.innerWidth,
        broken: [...document.images].filter((i) => i.complete && !i.naturalWidth).map((i) => i.getAttribute("src")),
      }));
      const bad = info.broken.filter((s) => s && ![...allow].some((a) => s.endsWith(a)));
      if (bad.length) errs.push(`图片加载失败：${bad.slice(0, 3).join(", ")}`);
      if (info.sw > info.vw + 1) warnings.push(`${tag} 横向溢出 scrollWidth=${info.sw} > ${info.vw}`);
      const png = PNG.sync.read(readFileSync(shot));
      let same = 0;
      for (let i = 0; i < png.data.length; i += 4) if (png.data[i] === png.data[0] && png.data[i + 1] === png.data[1] && png.data[i + 2] === png.data[2]) same++;
      if (same === png.data.length / 4) errs.push("页面是纯色（空白）"); // 小按钮/加载点也会占大面积纯色，所以只拦“完全纯色”
      const basePng = path.join(baseline, `${name}-${w}.png`);
      if (existsSync(basePng)) {
        const b = PNG.sync.read(readFileSync(basePng));
        if (b.width !== png.width || b.height !== png.height) diffs.push(`${tag} 截图尺寸变了`);
        else {
          const d = pixelmatch(b.data, png.data, null, png.width, png.height, { threshold: 0.1 }) / (png.width * png.height);
          if (d > 0.001) diffs.push(`${tag} 与基线差异 ${(d * 100).toFixed(2)}%`);
        }
      }
    } catch (e) { errs.push(`打开失败：${e.message.slice(0, 120)}`); }
    for (const e of errs) problems.push(`${tag} ${e}`);
    await ctx.close();
  }
  process.stdout.write(".");
}
await browser.close();
await server.close();

if (update) { rmSync(baseline, { recursive: true, force: true }); cpSync(cur, baseline, { recursive: true }); console.log(`\n基线已更新：${baseline}`); }
console.log("");
for (const w of warnings) console.log("⚠", w);
for (const d of diffs) console.log("△", d);
for (const p of problems) console.log("✗", p);
writeFileSync(path.join(DEV, ".render", "report.txt"), [...problems, ...diffs, ...warnings].join("\n") + "\n");
console.log(problems.length ? `\n渲染检查失败：${problems.length} 个错误，${diffs.length} 处与基线不同，${warnings.length} 个警告（截图在 dev/.render/current/）` : `\n渲染检查通过：${targets.length} 个组件 × 2 个宽度无错误；${diffs.length} 处与基线不同，${warnings.length} 个警告`);
process.exit(problems.length ? 1 : 0);
