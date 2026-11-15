import {
  FlippableItineraryDragCardStack,
  type ItineraryCardItem,
} from "./FlippableItineraryDragCardStack";
const search = new URLSearchParams(window.location.search);
const reducedMotion = search.get("reduced") === "1";
const missingImage = search.get("missing") === "1";
const insufficient = search.get("insufficient") === "1";

const itinerary: ItineraryCardItem[] = [
  ["01", "上海 — 奥克兰", "越过赤道，抵达帆船之都", "coast.svg"],
  ["02", "奥克兰 — 玛塔玛塔 — 罗托鲁瓦", "穿过牧场，走进霍比特人的绿丘", "green-hills.svg"],
  ["03", "罗托鲁瓦 — 基督城", "告别地热晨雾，飞向花园之城", "forest.svg"],
  ["04", "基督城 — 奥马鲁", "花园城市漫步，静候蓝企鹅归巢", "lake.svg"],
  ["05", "奥马鲁 — 但尼丁", "沿海岸向南，寻找维多利亚时光", "glacier.svg"],
  ["06", "但尼丁 — 皇后镇", "翻越山谷，在湖光中抵达皇后镇", "stars.svg"],
].map(([day, route, title, file], index) => ({
  id: `day-${day}`,
  day,
  route,
  title,
  image: missingImage && index === 0 ? "/images/travel-landscape-svg/not-found.svg" : `/images/travel-landscape-svg/${file}`,
  tags: index === 3 ? ["雅芳河", "植物园", "蓝企鹅归巢", "岩石烧烤餐"] : ["城市漫步", "在地体验", "从容停留"],
  paragraphs: [
    "早餐后按计划开启当日行程，在主要景点之间保留适度停留与步行时间。",
    "午后继续前往下一站，导游会根据天气与交通情况灵活调整游览顺序。",
    "傍晚回到酒店休息，也可根据体力自行探索周边街区。",
  ],
  highlight: "行程重视真实体验与舒适节奏，不以快速打卡替代完整游览。",
  transport: "空调旅游车 · 当地交通",
  meals: "酒店早餐 · 特色午餐 · 当地晚餐",
  hotel: "当地舒适酒店",
}));

function Demo() {
  return (
    <main className="itinerary-fixture-shell">
      <header className="itinerary-fixture-heading">
        <p>JOURNEY CARDS</p>
        <h1>每日行程</h1>
        <span>单击翻面查看详情 · 左右拖动切换日期</span>
      </header>
      <section className="itinerary-fixture-stage" aria-label="可翻面拖拽行程卡片演示">
        <FlippableItineraryDragCardStack
          items={insufficient ? itinerary.slice(0, 2) : itinerary}
          reducedMotion={reducedMotion}
        />
      </section>
    </main>
  );
}

export default Demo;
