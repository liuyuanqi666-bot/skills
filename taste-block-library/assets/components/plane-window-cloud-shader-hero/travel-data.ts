import forest from "../../public/images/travel-landscape-svg/forest.svg";
import glacier from "../../public/images/travel-landscape-svg/glacier.svg";
import lake from "../../public/images/travel-landscape-svg/lake.svg";
import stars from "../../public/images/travel-landscape-svg/stars.svg";
import planeWing from "../../public/images/air-travel-hero-raster/plane-wing.webp";

export const heroContent = {
  productName: "远行计划",
  productSubtitle: "自然精选",
  title: ["越过云海，", "把时间交给远方。"],
  description: ["从山谷到海岸，从清晨到星空。", "沿着风景慢慢走，", "收藏一段从容的旅程。"],
  primaryAction: "排期&价格",
  secondaryAction: "探索行程",
  destinationTitle: "湖泊 · 雪山 · 森林 · 星空",
  destinationCaption: "一程，收藏沿途的自然风景",
  wingAlt: "云海上方的飞机机翼",
} as const;

export const navigation = [
  { href: "#route-overview", label: "线路概览" },
  { href: "#schedule", label: "排期&价格" },
  { href: "#itinerary", label: "探索行程" },
  { href: "#destinations", label: "目的地灵感" },
] as const;

export const destinations = [
  { image: lake, name: "湖畔时光" },
  { image: glacier, name: "雪山远景" },
  { image: forest, name: "森林漫步" },
  { image: stars, name: "星空之夜" },
] as const;

export { planeWing };
