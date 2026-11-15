import { useState, type CSSProperties } from "react";

import {
  BoundedFocusFlipCard,
  BoundedFocusFlipCardPile,
} from "./BoundedFocusFlipCardPile";
type DemoCard = {
  id: string;
  title: string;
  eyebrow: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  mediaPosition?: string;
  description: string;
  tags?: string[];
};

const search = new URLSearchParams(window.location.search);
const reducedMotion = search.get("reduced") === "1";
const missingImage = search.get("missing") === "1";
const variedMedia = search.get("media") === "varied";

const cards: DemoCard[] = [
  {
    id: "hills",
    title: "绿丘",
    eyebrow: "LANDSCAPE NOTE",
    image: "/images/travel-landscape-svg/green-hills.svg",
    mediaPosition: "50% 38%",
    description: "连绵草坡与缓慢移动的云层，适合展示纯文字详情与克制的辅助标签。",
  },
  {
    id: "coast",
    title: "海岸",
    eyebrow: "COASTAL ROUTE",
    image: "/images/travel-landscape-svg/coast.svg",
    description: "沿着海岸线展开的短途路线，可以放入图片、说明、标签和业务操作。",
    tags: ["海岸", "公路", "日落"],
  },
  {
    id: "glacier",
    title: "冰川",
    eyebrow: "ALPINE FIELD",
    image: "/images/travel-landscape-svg/glacier.svg",
    description: "冰川、山谷与冷色水面组成层次清晰的高地景观。",
    tags: ["徒步", "高山", "冰川"],
  },
  {
    id: "lake",
    title: "湖泊",
    eyebrow: "QUIET WATER",
    image: "/images/travel-landscape-svg/lake.svg",
    description: "平静水面为详情卡提供节奏舒缓的内容示例。",
    tags: ["湖泊", "摄影"],
  },
  {
    id: "stars",
    title: "星空",
    eyebrow: "NIGHT RESERVE",
    image: "/images/travel-landscape-svg/stars.svg",
    description: "暗夜场景适合承载时间、地点与观测条件等结构化信息。",
    tags: ["夜景", "观星", "营地"],
  },
  {
    id: "forest",
    title: "森林",
    eyebrow: "WOODLAND PATH",
    image: missingImage
      ? "/images/travel-landscape-svg/not-found.svg"
      : variedMedia
        ? "/images/document-cover-svg/cover-itinerary-standard.svg"
        : "/images/travel-landscape-svg/forest.svg",
    imageWidth: variedMedia ? 360 : 720,
    imageHeight: variedMedia ? 480 : 423,
    description: "穿过林间的小径，展示聚焦、翻面与原路返回的完整空间关系。",
    tags: ["森林", "步道", "自然"],
  },
];

function SafeImage({
  src,
  alt,
  width = 720,
  height = 423,
  className,
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <div
        className={`demo-image-fallback ${className ?? ""}`.trim()}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
      >
        图片暂不可用
      </div>
    );
  }
  return (
    <img
      className={className}
      src={src}
      alt={alt}
      width={width}
      height={height}
      draggable={false}
      onError={() => setFailed(true)}
    />
  );
}

function Detail({ card }: { card: DemoCard }) {
  return (
    <article className="demo-detail">
      <SafeImage
        className="demo-detail-image"
        src={card.image}
        alt=""
        width={card.imageWidth}
        height={card.imageHeight}
      />
      <p className="demo-detail-eyebrow">{card.eyebrow}</p>
      <h2>{card.title}</h2>
      {card.tags ? (
        <div className="demo-detail-tags" aria-label="标签">
          {card.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      ) : null}
      <p className="demo-detail-copy">{search.has("long") ? card.description.repeat(35) : card.description}</p>
      <a className="demo-detail-action" href="#next" aria-label="目的地概览">
        <span>查看路线</span>
        <span aria-hidden="true">↗</span>
      </a>
    </article>
  );
}

function Demo() {
  return (
    <main className="fixture-shell">
      <header className="fixture-heading">
        <p>GESTURE STUDY</p>
        <h1>自由拖拽卡片堆</h1>
        <span>拖动卡片，轻触查看详情</span>
      </header>
      <BoundedFocusFlipCardPile
        className="fixture-stage"
        reducedMotion={reducedMotion}
      >
        <p className="fixture-prompt">Drag freely. Tap to focus.</p>
        {[...cards.slice(0, 3), cards[5]].map((card, index) => (
          <BoundedFocusFlipCard
            key={card.id}
            className={`demo-card demo-card-${index + 1}`}
            focusLabel={`打开${card.title}详情`}
            backContent={<Detail card={card} />}
          >
            <div
              className="bounded-focus-card-media"
              style={
                {
                  "--bounded-focus-front-media-position":
                    card.mediaPosition ?? "50% 50%",
                } as CSSProperties
              }
            >
              <SafeImage
                src={card.image}
                alt={card.title}
                width={card.imageWidth}
                height={card.imageHeight}
              />
            </div>
            <h2>{card.title}</h2>
          </BoundedFocusFlipCard>
        ))}
      </BoundedFocusFlipCardPile>
    </main>
  );
}

export default function Usage() {
  return <Demo />;
}
