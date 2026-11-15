import {
  ExpandableItineraryCardGrid,
  type ExtendableItineraryDay,
} from "./ExpandableItineraryCardGrid";
const sourceDays = [
  ["奥克兰初见", "上海 — 奥克兰", "coast.svg"],
  ["穿过中土绿丘", "奥克兰 — 霍比特村", "green-hills.svg"],
  ["红木森林晨光", "罗托鲁瓦城市漫步", "forest.svg"],
  ["飞向花园之城", "罗托鲁瓦 — 基督城", "lake.svg"],
  ["等待蓝企鹅归巢", "基督城 — 奥马鲁", "glacier.svg"],
  ["南行维多利亚城", "奥马鲁 — 但尼丁", "stars.svg"],
  ["湖光抵达皇后镇", "但尼丁 — 皇后镇", "coast.svg"],
  ["峡湾深处巡游", "皇后镇 — 米尔福德峡湾", "glacier.svg"],
  ["山谷与酒庄之间", "皇后镇自由探索", "green-hills.svg"],
  ["穿越南阿尔卑斯", "皇后镇 — 瓦纳卡", "lake.svg"],
  ["冰川脚下漫步", "瓦纳卡 — 福克斯冰川", "glacier.svg"],
  ["西海岸的风", "福克斯冰川 — 格雷茅斯", "coast.svg"],
  ["乘高山观景列车", "格雷茅斯 — 基督城", "forest.svg"],
  ["驶向观鲸海岸", "基督城 — 凯库拉", "coast.svg"],
  ["寻找远方鲸影", "凯库拉全天观鲸", "stars.svg"],
  ["葡萄园午后", "凯库拉 — 马尔堡", "green-hills.svg"],
  ["渡过库克海峡", "皮克顿 — 惠灵顿", "lake.svg"],
  ["告别长白云之乡", "惠灵顿 — 上海", "stars.svg"],
] as const;

const params = new URLSearchParams(window.location.search);
const showMissingImage = params.get("missing") === "1";
const forceReducedMotion = params.get("reduced") === "1";

const itinerary: ExtendableItineraryDay[] = sourceDays.map(([title, route, image], index) => ({
  id: `day-${index + 1}`,
  day: String(index + 1).padStart(2, "0"),
  title,
  route,
  image: showMissingImage && index === 0 ? "/images/travel-landscape-svg/not-found.svg" : `/images/travel-landscape-svg/${image}`,
  tags: ["在地体验", "舒适节奏", index % 2 === 0 ? "自然风光" : "城市探索"],
  paragraphs: [
    `早餐后从${route.split(" — ")[0]}出发，沿途结合天气与光线安排停靠，让移动本身成为当天体验的一部分。`,
    "抵达后由向导带领完成核心游览，并保留自由观察、拍照与休息的时间，不以快速打卡替代完整体验。",
    "傍晚根据当地接待与交通情况返回酒店。若时间充裕，可自行探索周边街区或湖畔步道。",
  ],
  highlight: "实际顺序可能根据天气、交通、航班及当地接待情况合理调整，核心体验不变。",
  transport: index === 0 || index === sourceDays.length - 1 ? "国际航班 · 当地旅游车" : "空调旅游车 · 当地特色交通",
  meals: "酒店早餐 · 当地午餐 · 特色晚餐",
  hotel: index === sourceDays.length - 1 ? "航班上" : "当地舒适型酒店",
}));

function Demo() {
  return (
    <main className="expandable-demo-shell">
      <header className="expandable-demo-heading">
        <p>DAY BY DAY</p>
        <h1>每日行程</h1>
        <span>点击卡片展开详细安排</span>
      </header>
      <ExpandableItineraryCardGrid items={itinerary} reducedMotion={forceReducedMotion} />
    </main>
  );
}

export default Demo;
