# skills

Liu Yuanqi 的公开 Agent 技能库。每个子目录都是一个可直接安装的技能（含 `SKILL.md`）。

## 收录

| 技能 | 说明 |
| --- | --- |
| [organize-passport-info](./organize-passport-info) | 护照信息整理：读取出行人报表和领队资料，按固定模板输出 Excel 名单。 |
| [organize-rooming-list](./organize-rooming-list) | 分房名单：结合订单号、性别、年龄和备注制定分房方案，按固定模板出表并复核。 |
| [create-travel-notice](./create-travel-notice) | 出团通知书：按合同级模板保真制作「团号 + 出团通知书」Word 文件。 |
| [travel-product-title-planner](./travel-product-title-planner) | 产品标题策划：读取春秋 ERP 行程与说明后，写出有依据、可核查的产品标题（只读，不代为发布）。 |
| [taste-block-library](./taste-block-library) | 旅游产品页组件库：45 个动画与交互组件，可在做旅游产品网页时整段取用，连同依赖和图片一起复制。 |

## 使用

把需要的技能文件夹复制到对应 Agent 的 skills 目录即可，例如：

- Codex：`~/.codex/skills/`
- Claude Code：`~/.claude/skills/`
- Cursor：`~/.cursor/skills/`

复制后目录里应能直接看到该技能的 `SKILL.md`。`taste-block-library` 若要本地开发组件，可在该目录执行 `npm install`。
