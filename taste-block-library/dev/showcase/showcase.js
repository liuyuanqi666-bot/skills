// 展示页：数据全部来自 manifest.json（npm run manifest 生成），不手工维护列表。
// 每个组件在自己的 iframe 页面里渲染（preview.html?c=<name>），CSS 与 :root 变量互不污染。
import manifest from "../../references/manifest.json";

const comps = Object.values(manifest.components).sort((a, b) => a.name.localeCompare(b.name));
const KIND = { pattern: "交互模式", section: "整段区块", effect: "背景 / 特效" };
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

let kind = "all", query = "", current = null;

const matches = (c) =>
  (kind === "all" || c.kind === kind) &&
  [c.name, c.summary, c.use_when, c.avoid_when, ...Object.keys(c.npm)].join(" ").toLowerCase().includes(query);

function renderKinds() {
  const kinds = ["all", ...Object.keys(KIND)];
  $("kinds").innerHTML = kinds
    .map((k) => `<button data-k="${k}" class="${k === kind ? "on" : ""}">${k === "all" ? "全部" : KIND[k]}</button>`)
    .join("");
}

function renderList() {
  const shown = comps.filter(matches);
  $("count").textContent = `${shown.length} / ${comps.length} 个组件`;
  $("list").innerHTML = shown.length
    ? shown.map((c) => `<a href="#${c.name}" class="${c.name === current ? "on" : ""}"><b>${c.name}</b><small>${esc(c.summary)}</small></a>`).join("")
    : '<div class="empty">没有匹配的组件</div>';
}

function renderInfo(c) {
  const notes = [];
  if (c.pageStyle?.background || c.pageStyle?.color) notes.push(`演示页底色 ${c.pageStyle.background ?? "—"}，文字色 ${c.pageStyle.color ?? "—"}；宿主不同时请确认可读性`);
  if (c.conflictsWith?.length) notes.push(`:root 变量与 ${c.conflictsWith.join("、")} 冲突，不要放同一页`);
  if (c.themeTokens.length) notes.push("在 :root 定义了主题变量");
  if (c.darkModeByClass) notes.push("dark: 变体按 .dark 类生效");
  if (c.public.length) notes.push(`需要 public 资源 ${c.public.length} 个（add 会自动复制）`);
  const deps = Object.keys(c.npm);
  const usageDeps = Object.keys(c.usageNpm ?? {});
  const cmd = `node "<库目录>/scripts/add.mjs" ${c.name} ./src/components/blocks`;
  $("info").innerHTML = `
    <h3>${c.name}</h3>
    <span class="tag">${KIND[c.kind] ?? c.kind}</span>
    <p>${esc(c.summary)}</p>
    <h4>何时用</h4><p>${esc(c.use_when)}</p>
    <h4>避免</h4><p>${esc(c.avoid_when)}</p>
    <h4>取用</h4>
    <pre id="cmd">${esc(cmd)}</pre>
    <button class="copy" id="copy">复制命令</button>
    <h4>依赖</h4>
    <div class="chips">${deps.length ? deps.map((d) => `<span>${d}</span>`).join("") : '<span class="mute">无额外依赖</span>'}</div>
    ${usageDeps.length ? `<p class="mute" style="margin-top:6px">仅 usage.tsx：${usageDeps.join("、")}</p>` : ""}
    <h4>注意</h4>
    ${notes.length ? notes.map((n) => `<p class="warn">⚠ ${esc(n)}</p>`).join("") : '<p class="mute">无</p>'}
    <h4>文件</h4>
    <p class="mute">组件 ${c.files.length} 个，shared ${c.shared.length}，随组件资源 ${c.importedAssets.length}，CSS ${c.css.length}</p>`;
  $("copy").onclick = async (e) => {
    try { await navigator.clipboard.writeText(cmd); e.target.textContent = "已复制"; }
    catch { e.target.textContent = "请手动复制"; }
    setTimeout(() => (e.target.textContent = "复制命令"), 1500);
  };
}

function select(name) {
  const c = comps.find((x) => x.name === name) ?? comps[0];
  current = c.name;
  const url = `./preview.html?c=${encodeURIComponent(c.name)}`;
  $("frame").src = url;
  $("open").href = url;
  $("title").textContent = c.name;
  document.title = `${c.name} · Taste Blocks`;
  renderInfo(c);
  renderList();
  $("list").querySelector("a.on")?.scrollIntoView({ block: "nearest" });
}

$("kinds").onclick = (e) => { const k = e.target.dataset?.k; if (k) { kind = k; renderKinds(); renderList(); } };
$("q").oninput = (e) => { query = e.target.value.trim().toLowerCase(); renderList(); };
$("vp").onclick = (e) => {
  const w = e.target.dataset?.w;
  if (!w) return;
  $("frame").style.width = w;
  $("vp").querySelectorAll("button").forEach((b) => b.classList.toggle("on", b === e.target));
};
$("reload").onclick = () => $("frame").contentWindow?.location.reload();
addEventListener("hashchange", () => select(location.hash.slice(1)));
addEventListener("keydown", (e) => {
  if (e.target.tagName === "INPUT" || (e.key !== "ArrowDown" && e.key !== "ArrowUp")) return;
  const shown = comps.filter(matches);
  const i = shown.findIndex((c) => c.name === current);
  const next = shown[i + (e.key === "ArrowDown" ? 1 : -1)];
  if (next) { e.preventDefault(); location.hash = next.name; }
});

renderKinds();
select(location.hash.slice(1));
