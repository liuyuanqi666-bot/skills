# AGENTS

用组件：读 `SKILL.md`（选 → 取 → 用），用 `scripts/add.mjs`，别手工拼路径。
改库：读 `dev/README.md`。改完 `npm run manifest && npm run check`，通过才算完成；`references/manifest.json`、`references/catalog.md` 是生成物，不要手改。
规则：组件保持自包含；页面级样式只放 `dev/demos/<name>.css`；改动要保持渲染效果不变（`npm run render -- --update` 先存基线，改完再 `npm run render` 对比）；组件 CSS 不写无限定的裸元素/伪元素规则（check 会拦）；不要写死绝对路径，库要可整体迁移到别的设备。
