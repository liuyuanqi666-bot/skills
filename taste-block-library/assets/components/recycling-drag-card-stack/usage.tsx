import {
  RecyclingDragCardStack,
  type DragCardItem,
} from "./RecyclingDragCardStack";
const search = new URLSearchParams(window.location.search);
const reducedMotion = search.get("reduced") === "1";
const missingImage = search.get("missing") === "1";
const insufficient = search.get("insufficient") === "1";

const items: DragCardItem[] = [
  ["lake", "蒂卡波湖", "MACKENZIE COUNTRY", "星光落进高山湖泊", "lake.svg"],
  ["hills", "霍比特村", "WAIKATO", "走进绿丘环抱的中土世界", "green-hills.svg"],
  ["glacier", "米尔福德峡湾", "FIORDLAND", "穿过瀑布与幽深峡湾", "glacier.svg"],
  ["coast", "凯库拉海岸", "CANTERBURY", "在雪山与海洋之间追鲸", "coast.svg"],
  ["forest", "红木森林", "ROTORUA", "仰望穿透林梢的天光", "forest.svg"],
  ["stars", "暗夜星空", "AORAKI", "在国际暗夜保护区看银河", "stars.svg"],
].map(([id, title, eyebrow, description, file], index) => ({
  id,
  title,
  eyebrow,
  description,
  image:
    missingImage && index === 0
      ? "/images/travel-landscape-svg/not-found.svg"
      : `/images/travel-landscape-svg/${file}`,
}));

function Demo() {
  return (
    <main className="fixture-page-shell">
      <header className="fixture-heading">
        <p>INTERACTION STUDY</p>
        <h1>可拖拽卡片</h1>
        <span>按住最上方卡片左右拖动</span>
      </header>
      <section className="fixture-demo-stage" aria-label="循环归队拖拽卡片演示">
        <RecyclingDragCardStack
          items={insufficient ? items.slice(0, 2) : items}
          reducedMotion={reducedMotion}
        />
      </section>
    </main>
  );
}

export default Demo;
