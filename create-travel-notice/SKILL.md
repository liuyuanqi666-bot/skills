---
name: create-travel-notice
description: 使用技能内置的合同级空白 .doc 模板或用户另行提供的 .doc/.docx 模板，根据文本行程资料保真制作“团号+出团通知书”Word 文件；先检查产品名称、日期、抵达时间、领队、航班及逐日行程，缺失、模糊或冲突时必须先询问，随后仅修改授权字段和行程表，保持 HOTEL 为空并确保表后文字与图片不变。用于旅游团队出行通知书、出团通知书的模板化重复制作和严格保真复核。
---

# 出行通知书制作

制作合同级 Word 出行通知书。保持模板为视觉和结构权威，先确认资料，再编辑副本，最后完成逐字、结构和逐页视觉复核。

默认使用 [assets/travel-notice-blank-template.doc](assets/travel-notice-blank-template.doc)。只有用户明确要求另一套视觉版式，或内置模板与任务结构不兼容时，才要求用户提供其他模板。

## 必须遵守

- 同时使用 Documents 技能的 Word 渲染与检查规范。
- 不修改原模板。
- 用户确认所有缺失和推定信息前，不得制作。
- 行程描述逐字使用源文本，不润色、不纠错。
- `HOTEL：`默认保持空白。
- 行程表后的文字和图片不得改变。
- 不为减少模板空白调整行高、列宽或合并方式。
- 最终只交付 Word 文件。

详细字段规则见 [references/input-and-mapping.md](references/input-and-mapping.md)。旧版 Word 的安全和失败处理见 [references/word-template-safety.md](references/word-template-safety.md)。

## 工作流程

### 1. 建立任务目录

在当前任务的 `work/` 下建立临时目录。将解析 JSON、检查副本、PDF 和页面 PNG 放入其中。最终文件只写入交付目录。

解析并编辑文档前，加载 Codex 工作区依赖，使用返回的 Python 路径。Windows Word 编辑脚本使用 PowerShell 运行。

### 2. 解析资料并做完整性检查

第一次运行解析脚本时可只提供文本：

```powershell
& "$PYTHON_BIN" "$SKILL_DIR/scripts/prepare_notice_data.py" `
  "$SOURCE_TEXT" `
  --out "$WORK_DIR/notice-data.json"
```

读取输出中的：

- `validation.missing`
- `validation.confirmation_required`
- `validation.warnings`
- `inferred`

将所有问题合并成一次询问。至少检查：

- 产品名称
- 领队姓名和电话
- 出发及回程日期
- 机场抵达日期时间
- 往返航班
- 每日城市、交通、描述和三餐

日期可由团号推定，抵达时间可按起飞前3小时推定，但必须让用户确认。确认前停止，不创建 Word 文件。

### 3. 生成已确认的数据

用户确认后重新运行解析脚本。示例：

```powershell
& "$PYTHON_BIN" "$SKILL_DIR/scripts/prepare_notice_data.py" `
  "$SOURCE_TEXT" `
  --out "$WORK_DIR/notice-data.json" `
  --product-name "$PRODUCT_NAME" `
  --leader-name "$LEADER_NAME" `
  --leader-phone "$LEADER_PHONE" `
  --confirm-inferences `
  --require-ready
```

如果用户修改了推定值，显式传入：

- `--departure-date YYYY-MM-DD`
- `--return-date YYYY-MM-DD`
- `--arrival-datetime "YYYY-MM-DD HH:MM"`
- `--itinerary-title "指定标题"`

只有脚本返回 `ready: true` 才能继续。

### 4. 检查模板

未指定其他模板时，使用内置空模板。用户提供新模板时，以该文件为本次任务的版式权威，并按下列项目重新检查。

以只读方式确认：

- 模板可由 Word 打开。
- 首页存在“尊敬的游客、领队信息、出发航班、回程航班”等定位词。
- 存在表头为“日期、城市、交通、行程、餐”的行程表。
- 行程日槽位数量不少于资料天数。
- 表后存在需要保留的合同内容。
- 图片数量可读取。

任一定位词或结构缺失时，停止并说明模板不兼容；不得猜测位置或重建模板。

### 5. 制作副本

输出文件名默认使用：

```text
团号 出团通知书.<模板扩展名>
```

运行保真编辑脚本：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File `
  "$SKILL_DIR/scripts/build_travel_notice.ps1" `
  -DataJson "$WORK_DIR/notice-data.json" `
  -OutputPath "$FINAL_WORD"
```

如用户明确提供了其他模板，再增加 `-TemplatePath "$TEMPLATE_PATH"`；省略时脚本自动使用技能内置模板。

脚本会：

- 复制模板并记录原模板哈希。
- 使用标签定位首页字段。
- 继承并核对产品名称、抵达时间、领队及往返航班原有格式。
- 保留机场位置、行李、提醒和联系人。
- 写入标题和逐日行程。
- 将源描述换行转换为 Word 单元格换行，文字保持一致。
- 清空所有保留的 `HOTEL：`值。
- 只删除表格末尾未使用的行程日。
- 保留最后一个已使用行程日后的原有空白酒店行。
- 保存后重新打开文件。
- 自动比较禁改区、表后文字、图片和逐日描述。

脚本未返回 `STRUCTURAL_QA=PASS` 时不得交付。

### 6. 视觉复核

按 Documents 技能渲染并检查每一页。

- `.docx`：使用标准 `render_docx.py` 流程。
- `.doc`：优先由 Microsoft Word 导出 PDF，再转为逐页 PNG。
- 导出放在独立进程中并设置超时。
- 直接导出旧 `.doc` 超时后，只允许按安全参考中的备用路线再尝试一次。

逐页检查：

- 首页字段完整且没有异常换行。
- 表格边框、列宽和合并单元格正常。
- 长描述没有截断、重叠或漏字。
- 城市、交通和餐食落在正确列。
- `HOTEL：`后为空。
- 表后文字连续。
- 最后一张图片完整且未裁切。

只有实际缺陷才返工。模板继承的合理空白不是缺陷。

### 7. 最终交付

再次确认：

- 文件名正确。
- 原模板哈希未变化。
- 结构检查通过。
- 所有修改过的首页字段格式与模板一致。
- 所有修改过的首页和行程表字段均与用户已确认资料逐项一致，包括产品名称、抵达时间、领队、往返航班、行程表标题、日期、城市、交通、餐食和行程描述。
- 每日描述逐字通过。
- 每页视觉检查通过。

只交付最终 `.doc` 或 `.docx`。不要交付 JSON、PDF、PNG、测试副本或脚本。

## 停止条件

遇到以下情况立即停止并向用户说明：

- 资料缺失、照片或文字不清晰、来源冲突。
- 用户未确认推定日期或机场抵达时间。
- 模板字段无法安全定位。
- 行程天数超过模板槽位。
- Word 无法稳定保存、重开或渲染。
- 禁改区、表后内容或图片检查失败。

不得通过重建文档、删减行程、缩小字体、改变表格结构或跳过检查来绕过失败。
