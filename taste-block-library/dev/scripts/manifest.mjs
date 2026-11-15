// 生成 manifest.json 与 catalog.md。用法：npm run manifest
import { writeFileSync } from "node:fs";
import path from "node:path";
import { REFS, buildManifest, renderCatalog } from "../../scripts/lib.mjs";

const m = buildManifest();
const bad = Object.values(m.components).filter((c) => c.problems.length);
for (const c of bad) console.error(`✗ ${c.name}\n  ${c.problems.join("\n  ")}`);
writeFileSync(path.join(REFS, "manifest.json"), JSON.stringify(m, null, 1) + "\n");
writeFileSync(path.join(REFS, "catalog.md"), renderCatalog(m) + "\n");
console.log(`manifest.json / catalog.md 已更新：${Object.keys(m.components).length} 个组件，${bad.length} 个有问题`);
process.exit(bad.length ? 1 : 0);
