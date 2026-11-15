import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { pathToFileURL } from "node:url";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const execFileAsync = promisify(execFile);

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!key?.startsWith("--") || value === undefined) {
      throw new Error(`参数格式错误：${key ?? ""}`);
    }
    args[key.slice(2)] = value;
  }
  return args;
}

function decodeHtml(value) {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .trim();
}

function parseHtmlTable(html) {
  return [...html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)].map((row) =>
    [...row[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((cell) =>
      decodeHtml(cell[1]),
    ),
  );
}

function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/\s+/g, "")
    .replace(/[（(].*?[）)]/g, "")
    .trim();
}

const aliases = {
  chineseName: ["中文姓名", "中文名", "姓名（中文）", "姓名(中文)"],
  englishName: ["英文姓名", "英文名", "姓名拼音", "护照英文姓名"],
  gender: ["性别"],
  birthDate: ["出生日期", "生日"],
  passportNo: ["证件号码", "护照号码", "护照号"],
  passportExpiry: ["证件有效期", "护照有效期", "有效期"],
  nationality: ["国籍", "国家"],
};

function findHeaderMap(rows) {
  for (let rowIndex = 0; rowIndex < Math.min(rows.length, 30); rowIndex += 1) {
    const normalized = rows[rowIndex].map(normalizeHeader);
    const map = {};
    for (const [field, names] of Object.entries(aliases)) {
      const index = normalized.findIndex((value) => names.includes(value));
      if (index >= 0) map[field] = index;
    }
    if (Object.keys(map).length === Object.keys(aliases).length) {
      return { rowIndex, map };
    }
  }
  throw new Error("无法识别源报表标题，请检查中文姓名、英文姓名、性别、出生日期、护照号码、有效期和国籍字段");
}

function excelSerialToDate(serial) {
  const epoch = Date.UTC(1899, 11, 30);
  return new Date(epoch + serial * 86400000);
}

function sourcePrefix(sourceRow) {
  return Number.isInteger(sourceRow) ? `源第${sourceRow}行` : String(sourceRow);
}

function compactDate(value, field, sourceRow) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return Number(
      `${value.getUTCFullYear()}${String(value.getUTCMonth() + 1).padStart(2, "0")}${String(
        value.getUTCDate(),
      ).padStart(2, "0")}`,
    );
  }
  if (typeof value === "number") {
    if (Number.isInteger(value) && value >= 19000101 && value <= 29991231) return value;
    if (value >= 1 && value <= 100000) return compactDate(excelSerialToDate(value), field, sourceRow);
  }
  const text = String(value ?? "").trim();
  if (/^\d{8}$/.test(text)) return Number(text);
  const match = text.match(/^(\d{4})[-/.年](\d{1,2})[-/.月](\d{1,2})日?$/);
  if (!match) throw new Error(`${sourcePrefix(sourceRow)}${field}格式无效：${text}`);
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error(`${sourcePrefix(sourceRow)}${field}不是有效日期：${text}`);
  }
  return Number(`${year}${month.padStart(2, "0")}${day.padStart(2, "0")}`);
}

function genderCode(value, sourceRow) {
  const text = String(value ?? "").trim().toUpperCase();
  if (["男", "M", "MALE"].includes(text)) return "M";
  if (["女", "F", "FEMALE"].includes(text)) return "F";
  throw new Error(`${sourcePrefix(sourceRow)}性别无效：${value}`);
}

function nationalityCode(value, sourceRow) {
  if (typeof value === "number" && [112, 125, 155, 185].includes(value)) return value;
  const text = String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
  const codes = new Map([
    ["112", 112],
    ["CHN", 112],
    ["CHINA", 112],
    ["CHINA P. R.", 112],
    ["CHINESE", 112],
    ["中国", 112],
    ["中华人民共和国", 112],
    ["125", 125],
    ["IDN", 125],
    ["INDONESIA", 125],
    ["印度尼西亚", 125],
    ["155", 155],
    ["PHL", 155],
    ["PHILIPPINES", 155],
    ["菲律宾", 155],
    ["185", 185],
    ["VNM", 185],
    ["VIETNAM", 185],
    ["越南", 185],
  ]);
  if (!codes.has(text)) throw new Error(`${sourcePrefix(sourceRow)}国籍无法映射：${value}`);
  return codes.get(text);
}

function splitName(value, sourceRow) {
  const text = String(value ?? "").trim();
  const slash = text.indexOf("/");
  if (slash <= 0 || slash === text.length - 1) {
    throw new Error(`${sourcePrefix(sourceRow)}英文姓名无法按“姓/名”拆分：${text}`);
  }
  const surname = text.slice(0, slash).trim().toUpperCase();
  const givenName = text.slice(slash + 1).trim().toUpperCase();
  if (!surname || !givenName) throw new Error(`${sourcePrefix(sourceRow)}英文姓名不完整：${text}`);
  return [surname, givenName];
}

function mapRows(rows) {
  const { rowIndex, map } = findHeaderMap(rows);
  const passengers = [];
  let droppedPlaceholders = 0;
  const partialRows = [];

  for (let index = rowIndex + 1; index < rows.length; index += 1) {
    const row = rows[index];
    const sourceRow = index + 1;
    const chineseName = row[map.chineseName];
    const englishName = row[map.englishName];
    const birthDate = row[map.birthDate];
    const passportNo = row[map.passportNo];
    const passportExpiry = row[map.passportExpiry];
    const identityValues = [chineseName, englishName, birthDate, passportNo, passportExpiry].map((value) =>
      String(value ?? "").trim(),
    );
    if (identityValues.every((value) => value === "")) {
      droppedPlaceholders += 1;
      continue;
    }
    if (identityValues.some((value) => value === "")) {
      partialRows.push(sourceRow);
      continue;
    }

    const [surname, givenName] = splitName(englishName, sourceRow);
    const passport = String(passportNo).trim().toUpperCase();
    if (!/^[A-Z0-9]+$/.test(passport)) {
      throw new Error(`源第${sourceRow}行护照号码格式无效：${passportNo}`);
    }
    passengers.push([
      String(chineseName).trim(),
      surname,
      givenName,
      compactDate(birthDate, "出生日期", sourceRow),
      genderCode(row[map.gender], sourceRow),
      nationalityCode(row[map.nationality], sourceRow),
      passport,
      compactDate(passportExpiry, "护照有效期", sourceRow),
    ]);
  }

  if (partialRows.length) {
    throw new Error(`以下源报表行包含部分身份信息但字段不完整：${partialRows.join("、")}`);
  }
  if (!passengers.length) throw new Error("没有找到可输出的完整护照记录");

  const passports = passengers.map((row) => row[6]);
  const duplicates = passports.filter((value, index) => passports.indexOf(value) !== index);
  if (duplicates.length) throw new Error(`发现重复护照号码，共${new Set(duplicates).size}项`);

  return { passengers, droppedPlaceholders };
}

function mapLeaderData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("领队资料 JSON 必须是对象");
  }
  const required = [
    "chineseName",
    "englishName",
    "birthDate",
    "gender",
    "nationality",
    "passportNo",
    "passportExpiry",
  ];
  const missing = required.filter((field) => String(data[field] ?? "").trim() === "");
  if (missing.length) throw new Error(`领队资料缺少字段：${missing.join("、")}`);

  const chineseName = String(data.chineseName).trim();
  const [surname, givenName] = splitName(data.englishName, "领队信息");
  const passport = String(data.passportNo).trim().toUpperCase();
  if (!/^[A-Z0-9]+$/.test(passport)) {
    throw new Error(`领队信息护照号码格式无效：${data.passportNo}`);
  }
  return {
    chineseName,
    row: [
      chineseName,
      surname,
      givenName,
      compactDate(data.birthDate, "出生日期", "领队信息"),
      genderCode(data.gender, "领队信息"),
      nationalityCode(data.nationality, "领队信息"),
      passport,
      compactDate(data.passportExpiry, "护照有效期", "领队信息"),
    ],
  };
}

async function convertLegacyXls(sourcePath, tempDir) {
  const outputName = `${path.parse(sourcePath).name}.xlsx`;
  const profileUrl = pathToFileURL(path.join(tempDir, "soffice-profile")).href;
  await execFileAsync("soffice", [
    `-env:UserInstallation=${profileUrl}`,
    "--headless",
    "--convert-to",
    "xlsx",
    "--outdir",
    tempDir,
    sourcePath,
  ]);
  return path.join(tempDir, outputName);
}

async function readSourceRows(sourcePath, tempDir) {
  const bytes = await fs.readFile(sourcePath);
  const prefix = bytes.subarray(0, 2048).toString("utf8").toLowerCase();
  if (prefix.includes("<table") || prefix.includes("<meta") || prefix.includes("<html")) {
    return parseHtmlTable(bytes.toString("utf8"));
  }

  let workbookPath = sourcePath;
  if (path.extname(sourcePath).toLowerCase() === ".xls") {
    workbookPath = await convertLegacyXls(sourcePath, tempDir);
  }
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(workbookPath));
  for (const sheet of workbook.worksheets.items) {
    const used = sheet.getUsedRange(true);
    if (!used) continue;
    const rows = used.values;
    try {
      findHeaderMap(rows);
      return rows;
    } catch {
      // 尝试下一个工作表。
    }
  }
  throw new Error("所有工作表中均未找到完整的护照信息标题");
}

function safeLeaderName(value) {
  const name = String(value ?? "").trim();
  if (!name) throw new Error("领队中文姓名为空，无法生成默认文件名");
  if (/[\\/:*?"<>|]/.test(name)) throw new Error(`领队姓名包含文件名禁用字符：${name}`);
  return name;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.source) throw new Error("缺少 --source");
  if (!args.template) throw new Error("缺少 --template");
  if (!args["leader-data"]) throw new Error("缺少 --leader-data");

  const sourcePath = path.resolve(args.source);
  const templatePath = path.resolve(args.template);
  const leaderDataPath = path.resolve(args["leader-data"]);
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), "passport-info-"));
  try {
    const leaderData = JSON.parse(await fs.readFile(leaderDataPath, "utf8"));
    const { chineseName: leaderChineseName, row: leaderRow } = mapLeaderData(leaderData);
    const rows = await readSourceRows(sourcePath, tempDir);
    const { passengers, droppedPlaceholders } = mapRows(rows);
    const allPeople = [leaderRow, ...passengers];
    const allPassports = allPeople.map((row) => row[6]);
    const duplicateAllPassports = allPassports.filter(
      (value, index) => allPassports.indexOf(value) !== index,
    );
    if (duplicateAllPassports.length) {
      throw new Error(`领队与游客名单中发现重复护照号码，共${new Set(duplicateAllPassports).size}项`);
    }
    const outputPath = args.output
      ? path.resolve(args.output)
      : path.resolve(`0领队${safeLeaderName(leaderChineseName)}.xlsx`);
    if (path.extname(outputPath).toLowerCase() !== ".xlsx") {
      throw new Error("最终输出文件必须使用 .xlsx 扩展名");
    }
    const normalizedOutputPath = path.normalize(outputPath).toLowerCase();
    const normalizedSourcePath = path.normalize(sourcePath).toLowerCase();
    const normalizedTemplatePath = path.normalize(templatePath).toLowerCase();
    if (
      normalizedOutputPath === normalizedSourcePath ||
      normalizedOutputPath === normalizedTemplatePath
    ) {
      throw new Error("最终输出路径不得覆盖源报表或内置模板");
    }

    const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(templatePath));
    const sheet = workbook.worksheets.getItem("sheet1");
    const lastRow = allPeople.length + 1;

    sheet.getRange("A2:H19").clear({ applyTo: "contents" });
    if (lastRow > 19) {
      for (let row = 20; row <= lastRow; row += 1) {
        const addedRow = sheet.getRange(`A${row}:H${row}`);
        addedRow.copyFrom(sheet.getRange("A3:H3"), "all");
        addedRow.format.font = { name: "Arial Unicode MS", size: 10 };
        addedRow.format.wrapText = true;
        addedRow.format.borders = { preset: "all", style: "thin", color: "#000000" };
      }
    }
    sheet.getRange(`A2:H${lastRow}`).values = allPeople;
    if (lastRow < 19) sheet.getRange(`A${lastRow + 1}:P19`).clear({ applyTo: "all" });
    sheet.getRange(`I1:P${Math.max(lastRow, 19)}`).clear({ applyTo: "all" });

    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    const exported = await SpreadsheetFile.exportXlsx(workbook);
    await exported.save(outputPath);

    const reloaded = await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
    const expected = [
      ["中文姓名", "姓", "名", "出生日期", "性别", "国籍", "护照号码", "护照有效期"],
      ...allPeople,
    ];
    const actual = reloaded.worksheets
      .getItem("sheet1")
      .getRange(`A1:H${lastRow}`).values;
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      throw new Error("导出后二次核对失败：输出值与预期值不一致");
    }
    const errorPattern = /^(#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A)$/;
    const usedValues = reloaded.worksheets.getItem("sheet1").getUsedRange().values;
    const formulaErrors = usedValues
      .flat()
      .filter((value) => typeof value === "string" && errorPattern.test(value));
    if (formulaErrors.length) {
      throw new Error(`导出后发现公式错误：${[...new Set(formulaErrors)].join("、")}`);
    }
    await fs.rm(`${outputPath}.inspect.ndjson`, { force: true });

    console.log(
      JSON.stringify({
        outputPath,
        validTourists: passengers.length,
        leaders: 1,
        totalPeople: allPeople.length,
        leaderFirst:
          actual[1]?.[0] === leaderRow[0] &&
          actual[1]?.[1] === leaderRow[1] &&
          actual[1]?.[2] === leaderRow[2],
        droppedPlaceholders,
        duplicatePassports: 0,
        reloadedValuesMatch: true,
        formulaErrors: formulaErrors.length,
      }),
    );
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
