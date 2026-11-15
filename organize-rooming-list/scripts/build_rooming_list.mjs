import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

/*
Run from a writable working directory that contains a node_modules junction to the
bundled Codex dependency directory:

node build_rooming_list.mjs --plan approved-plan.json --template rooming-template.xlsx \
  --output outputs/KSS260808CN11分房名单.xlsx
*/

function parseArgs(argv) {
  const result = {};
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) throw new Error(`参数 --${key} 缺少值`);
    result[key] = value;
    index += 1;
  }
  for (const key of ["plan", "template", "output"]) {
    if (!result[key]) throw new Error(`缺少参数 --${key}`);
  }
  return result;
}

function requiredText(value, label) {
  const text = String(value ?? "").trim();
  if (!text) throw new Error(`必填信息缺失：${label}`);
  return text;
}

function validateFlightInfo(value, allowCustomFormat) {
  const text = requiredText(value, "group.flightInfo");
  if (allowCustomFormat === true) return text;
  const pattern = /^\S+\s+\S+→\S+\s+（\d{2}:\d{2}-\d{2}:\d{2}）；\s*\S+\s+\S+→\S+\s+（\d{2}:\d{2}-\d{2}:\d{2}）$/u;
  if (!pattern.test(text)) {
    throw new Error(
      "group.flightInfo 格式错误，应为：航班号 出发地→目的地 （起飞时间-到达时间）；航班号 出发地→目的地 （起飞时间-到达时间）",
    );
  }
  return text;
}

function parseDate(value, label) {
  const text = requiredText(value, label);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) throw new Error(`${label} 必须为 YYYY-MM-DD：${text}`);
  const [, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() !== Number(month) - 1 ||
    date.getUTCDate() !== Number(day)
  ) {
    throw new Error(`${label} 不是有效日期：${text}`);
  }
  return date;
}

function ageOn(birthDate, departureDate) {
  let age = departureDate.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    departureDate.getUTCMonth() < birthDate.getUTCMonth() ||
    (departureDate.getUTCMonth() === birthDate.getUTCMonth() &&
      departureDate.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

function validatePerson(person, label, requireOrder) {
  const required = [
    "id",
    "chineseName",
    "englishName",
    "gender",
    "birthDate",
    "birthplace",
    "passportNo",
    "issueDate",
    "issuePlace",
    "expiryDate",
    "phone",
  ];
  if (requireOrder) required.push("orderNo");
  for (const field of required) requiredText(person?.[field], `${label}.${field}`);
  if (!["男", "女"].includes(person.gender)) {
    throw new Error(`${label}.gender 只能是“男”或“女”`);
  }
  parseDate(person.birthDate, `${label}.birthDate`);
  parseDate(person.issueDate, `${label}.issueDate`);
  parseDate(person.expiryDate, `${label}.expiryDate`);
}

function rangeRows(start, count) {
  return `${start}:${start + count - 1}`;
}

const args = parseArgs(process.argv.slice(2));
const plan = JSON.parse(await fs.readFile(args.plan, "utf8"));
const group = plan.group ?? {};

for (const field of [
  "groupCode",
  "fileTier",
  "tourTitle",
  "departureDate",
  "peopleCountText",
]) {
  requiredText(group[field], `group.${field}`);
}
const flightInfo = validateFlightInfo(group.flightInfo, group.allowCustomFlightFormat);
const departureDate = parseDate(group.departureDate, "group.departureDate");
if (!Number.isInteger(group.touristCount) || group.touristCount < 0) {
  throw new Error("group.touristCount 必须是非负整数");
}
if (!Array.isArray(plan.travelers) || !plan.travelers.length) {
  throw new Error("travelers 不能为空");
}
if (!Array.isArray(plan.rooms) || !plan.rooms.length) throw new Error("rooms 不能为空");

plan.travelers.forEach((person, index) => validatePerson(person, `travelers[${index}]`, true));
const leader = plan.leader ?? null;
if (leader) validatePerson(leader, "leader", false);
if (plan.travelers.length !== group.touristCount) {
  throw new Error(
    `游客人数不一致：group.touristCount=${group.touristCount}，travelers=${plan.travelers.length}`,
  );
}
const expectedPeopleCountText = `${group.touristCount}+${leader ? 1 : 0}`;
if (group.peopleCountText !== expectedPeopleCountText) {
  throw new Error(
    `人数格式不一致：group.peopleCountText=${group.peopleCountText}，应为 ${expectedPeopleCountText}`,
  );
}

const people = leader ? [...plan.travelers, leader] : [...plan.travelers];
const byId = new Map();
for (const person of people) {
  if (byId.has(person.id)) throw new Error(`人员 id 重复：${person.id}`);
  byId.set(person.id, person);
}

const flattenedIds = [];
for (let index = 0; index < plan.rooms.length; index += 1) {
  const room = plan.rooms[index];
  if (room.number !== index + 1) throw new Error(`房号必须连续：第 ${index + 1} 间房`);
  if (!Array.isArray(room.occupantIds) || room.occupantIds.length < 1 || room.occupantIds.length > 3) {
    throw new Error(`房间 ${room.number} 的人数必须为 1 至 3 人`);
  }
  for (const id of room.occupantIds) {
    if (!byId.has(id)) throw new Error(`房间 ${room.number} 出现未知人员 id：${id}`);
    flattenedIds.push(id);
  }
}

if (new Set(flattenedIds).size !== flattenedIds.length) {
  throw new Error("分房计划中存在重复人员");
}
if (flattenedIds.length !== people.length || people.some((person) => !flattenedIds.includes(person.id))) {
  throw new Error("分房计划中存在遗漏人员");
}
if (leader && flattenedIds.at(-1) !== leader.id) {
  throw new Error("领队必须位于最后一间房的最后一行");
}

for (const room of plan.rooms) {
  const occupants = room.occupantIds.map((id) => byId.get(id));
  const parties = occupants.map((person) =>
    leader && person.id === leader.id ? "__LEADER__" : person.orderNo,
  );
  const isCrossParty = new Set(parties).size > 1;
  if (!isCrossParty) continue;
  const genders = new Set(occupants.map((person) => person.gender));
  if (genders.size > 1) throw new Error(`房间 ${room.number} 存在异性跨订单拼房`);
  for (const person of occupants) {
    if (leader && person.id === leader.id) continue;
    if (ageOn(parseDate(person.birthDate, `${person.chineseName}.birthDate`), departureDate) < 18) {
      throw new Error(`房间 ${room.number} 中未成年人 ${person.chineseName} 被安排跨订单单拼`);
    }
  }
}

const touristSequence = flattenedIds
  .filter((id) => !leader || id !== leader.id)
  .map((id) => byId.get(id));
const positionsByOrder = new Map();
touristSequence.forEach((person, index) => {
  const positions = positionsByOrder.get(person.orderNo) ?? [];
  positions.push(index);
  positionsByOrder.set(person.orderNo, positions);
});
for (const [orderNo, positions] of positionsByOrder) {
  const contiguous = positions.at(-1) - positions[0] + 1 === positions.length;
  if (!contiguous) throw new Error(`订单 ${orderNo} 的家庭成员未在表格中连续排列`);
}

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(args.template));
const sheet = workbook.worksheets.getItem("Sheet1");
const rowCount = flattenedIds.length;
const firstDataRow = 5;
const lastDataRow = firstDataRow + rowCount - 1;

sheet.getRange("A5:O200").unmerge();
sheet.getRange("A5:O200").clear({ applyTo: "contents" });
if (lastDataRow < 200) {
  sheet.getRange(`A${lastDataRow + 1}:O200`).clear({ applyTo: "all" });
}

const tier = String(group.fileTier).startsWith("档") ? String(group.fileTier) : `档${group.fileTier}`;
sheet.getRange("A1").values = [[`分房名单\n${tier}`]];
sheet.getRange("D1").values = [["团号："]];
sheet.getRange("E1").values = [[group.groupCode]];
sheet.getRange("F1").values = [[group.tourTitle]];
sheet.getRange("L1").values = [[leader ? `领队：${leader.chineseName}` : "领队："]];
sheet.getRange("M1").values = [[`人数：${group.peopleCountText}`]];
sheet.getRange("D2").values = [["航班信息："]];
sheet.getRange("E2").values = [[flightInfo]];
sheet.getRange("D3").values = [["用房数量："]];
sheet.getRange("E3").values = [[group.roomCountNote || `用房${plan.rooms.length}间`]];

const rows = [];
const roomMerges = [];
let touristNumber = 1;
let currentRow = firstDataRow;
for (const room of plan.rooms) {
  const start = currentRow;
  room.occupantIds.forEach((id, occupantIndex) => {
    const person = byId.get(id);
    const isLeader = Boolean(leader && id === leader.id);
    rows.push([
      isLeader ? "TL" : touristNumber++,
      occupantIndex === 0 ? room.number : null,
      occupantIndex === 0 ? room.roomType || "标间" : null,
      person.chineseName,
      person.englishName,
      person.gender,
      parseDate(person.birthDate, `${person.chineseName}.birthDate`),
      person.birthplace,
      person.passportNo,
      parseDate(person.issueDate, `${person.chineseName}.issueDate`),
      person.issuePlace,
      parseDate(person.expiryDate, `${person.chineseName}.expiryDate`),
      String(person.phone),
      null,
    ]);
    currentRow += 1;
  });
  roomMerges.push({ start, end: currentRow - 1 });
}

const familyMerges = [];
let familyNumber = 1;
for (const [orderNo, positions] of positionsByOrder) {
  if (positions.length < 2) continue;
  const start = firstDataRow + positions[0];
  const end = firstDataRow + positions.at(-1);
  rows[start - firstDataRow][13] = familyNumber;
  familyMerges.push({ orderNo, start, end, value: familyNumber });
  familyNumber += 1;
}

sheet.getRange(`A${firstDataRow}:N${lastDataRow}`).values = rows;
const dataRange = sheet.getRange(`A${firstDataRow}:N${lastDataRow}`);
dataRange.format.borders = { preset: "all", style: "thin", color: "#000000" };
dataRange.format.verticalAlignment = "center";
dataRange.format.rowHeight = 15;
sheet.getRange(`A${firstDataRow}:C${lastDataRow}`).format.font = { name: "宋体", size: 11 };
sheet.getRange(`B${firstDataRow}:C${lastDataRow}`).format.horizontalAlignment = "center";
sheet.getRange(`D${firstDataRow}:M${lastDataRow}`).format = {
  font: { name: "Arial Unicode MS", size: 10 },
  verticalAlignment: "center",
  wrapText: true,
};
sheet.getRange(`I${firstDataRow}:I${lastDataRow}`).format.numberFormat = "@";
sheet.getRange(`M${firstDataRow}:M${lastDataRow}`).format.numberFormat = "@";
sheet.getRange(`N${firstDataRow}:N${lastDataRow}`).format = {
  font: { name: "宋体", size: 10 },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
};
for (const column of ["G", "J", "L"]) {
  sheet.getRange(`${column}${firstDataRow}:${column}${lastDataRow}`).format.numberFormat = "yyyy/m/d";
}
for (const merge of roomMerges) {
  if (merge.end > merge.start) {
    sheet.getRange(`B${merge.start}:B${merge.end}`).merge();
    sheet.getRange(`C${merge.start}:C${merge.end}`).merge();
  }
}
for (const merge of familyMerges) {
  if (merge.end > merge.start) sheet.getRange(`N${merge.start}:N${merge.end}`).merge();
}

await fs.mkdir(path.dirname(args.output), { recursive: true });
const exported = await SpreadsheetFile.exportXlsx(workbook);
await exported.save(args.output);

const reopened = await SpreadsheetFile.importXlsx(await FileBlob.load(args.output));
const reopenedSheet = reopened.worksheets.getItem("Sheet1");
const actualNames = reopenedSheet.getRange(`D${firstDataRow}:D${lastDataRow}`).values.flat();
const expectedNames = flattenedIds.map((id) => byId.get(id).chineseName);
if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
  throw new Error("导出后姓名或顺序核对失败");
}
const usedValues = reopenedSheet.getUsedRange().values.flat();
const errorPattern = /^(#REF!|#DIV\/0!|#VALUE!|#NAME\?|#N\/A)$/;
const formulaErrors = usedValues.filter(
  (value) => typeof value === "string" && errorPattern.test(value),
);
if (formulaErrors.length) throw new Error(`发现公式错误：${[...new Set(formulaErrors)].join("、")}`);

let belowTableClean = true;
if (lastDataRow < 200) {
  const inspectionEndRow = Math.min(lastDataRow + 5, 200);
  const belowTable = await reopened.inspect({
    kind: "computedStyle,region",
    sheetId: "Sheet1",
    range: `A${lastDataRow + 1}:N${inspectionEndRow}`,
    maxChars: 3000,
    tableMaxRows: 5,
    tableMaxCols: 14,
  });
  const records = belowTable.ndjson
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  belowTableClean = !records.some((record) =>
    ["computedStyle", "region"].includes(record.kind),
  );
  if (!belowTableClean) {
    throw new Error(`人员末行 ${lastDataRow} 下方仍存在内容或格式残留`);
  }
}

console.log(
  JSON.stringify({
    output: args.output,
    tourists: plan.travelers.length,
    leader: leader ? 1 : 0,
    rooms: plan.rooms.length,
    tripleRooms: plan.rooms.filter((room) => room.occupantIds.length === 3).length,
    singleRooms: plan.rooms.filter((room) => room.occupantIds.length === 1).length,
    familyGroups: familyMerges.length,
    specialAssignments: plan.specialAssignments ?? [],
    formulaErrors: 0,
    namesMatch: true,
    belowTableClean,
    lastDataRow,
  }),
);
