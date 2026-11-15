import { HeroParallax } from "./hero-parallax";
import scene0 from "../../public/images/travel-landscape-svg/green-hills.svg";
import scene1 from "../../public/images/travel-landscape-svg/forest.svg";
import scene2 from "../../public/images/travel-landscape-svg/coast.svg";
import scene3 from "../../public/images/travel-landscape-svg/glacier.svg";
import scene4 from "../../public/images/travel-landscape-svg/lake.svg";
import scene5 from "../../public/images/travel-landscape-svg/stars.svg";
export const products = [
  {title: "青丘 · 01", thumbnail: scene0},
  {title: "森林 · 02", thumbnail: scene1},
  {title: "海岸 · 03", thumbnail: scene2},
  {title: "冰川 · 04", thumbnail: scene3},
  {title: "湖泊 · 05", thumbnail: scene4},
  {title: "星空 · 06", thumbnail: scene5},
  {title: "青丘 · 07", thumbnail: scene0},
  {title: "森林 · 08", thumbnail: scene1},
  {title: "海岸 · 09", thumbnail: scene2},
  {title: "冰川 · 10", thumbnail: scene3},
  {title: "湖泊 · 11", thumbnail: scene4},
  {title: "星空 · 12", thumbnail: scene5},
  {title: "青丘 · 13", thumbnail: scene0},
  {title: "森林 · 14", thumbnail: scene1},
  {title: "海岸 · 15", thumbnail: scene2}
];
export function HeroParallaxDemo() { return <HeroParallax products={products} />; }
