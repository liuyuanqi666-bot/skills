import greenHills from "../../public/images/travel-landscape-svg/green-hills.svg";
import forest from "../../public/images/travel-landscape-svg/forest.svg";
import glacier from "../../public/images/travel-landscape-svg/glacier.svg";
import coast from "../../public/images/travel-landscape-svg/coast.svg";

export interface NarrativeItem {
  id: string;
  badge: string;
  title: string;
  summary: string;
  description: string;
  image?: string;
  imageAlt?: string;
  tag?: string;
}

export const defaultNarrativeItems: NarrativeItem[] = [
  {
    id: "day-1",
    badge: "Day 01 · 峡谷漫步",
    title: "晨光启程 · 翡翠岭与清溪步道",
    summary: "轻装穿越原始冷温带苔原与冷杉群落，抵达翡翠水涧，感受清冽高山负氧离子。",
    description:
      "晨间于营地集合出发，沿溪流溯源而上。前程平缓开阔，穿行于千年高山草甸与落叶松林之间。午后驻足于翡翠峡谷观景台，远眺雪线倒影，专享私域手冲咖啡与轻野餐体验。",
    image: greenHills,
    imageAlt: "翡翠岭自然风景",
    tag: "轻度徒步 · 8km",
  },
  {
    id: "day-2",
    badge: "Day 02 · 原始林带",
    title: "林深见鹿 · 秘境林冠与野生动植物探寻",
    summary: "跟随专业地质与生态向导，深入核心未开发原始林带，观察珍稀苔藓群落与鸟类生态。",
    description:
      "沿着原生护林员巡山小径徐徐前行，晨雾尚未散去的森林中光束穿透树冠，洒下粼粼光斑。午间在百年古树庇护下进行植物拓印与生态标本采集，聆听高山鸟鸣与溪流共鸣。",
    image: forest,
    imageAlt: "原始森林生态景观",
    tag: "生态考察 · 5km",
  },
  {
    id: "day-3",
    badge: "Day 03 · 冰川遗迹",
    title: "冰舌巡礼 · 远古冰川阶地与巨石奇观",
    summary: "步入第四纪冰川退缩形成的巨大槽谷，近距离触摸万年冰碛石与纯净冰雪融水。",
    description:
      "今日将迎来整个旅程的视觉巅峰。向导带领团队行进至海拔 3,200 米的冰川观景台，直面如刀刻斧凿般的冰碛石群与万年玄冰。冷冽的风穿过峡谷，带来源自远古的气息。",
    image: glacier,
    imageAlt: "远古冰川峡谷遗迹",
    tag: "地质巡礼 · 6km",
  },
  {
    id: "day-4",
    badge: "Day 04 · 潮汐观星",
    title: "暮色海角 · 黄金海岸暮色与暗夜星空",
    summary: "落日时分抵达蔚蓝海岸岬角，伴随海潮拍岸的声浪，静候银河横跨天际的壮丽盛景。",
    description:
      "从内陆高原顺势下行抵达向海延伸的海岸悬崖。落日将天际与海平面浸染成熔金之色。暮色降临后，远离城市光污染的岬角营地点燃篝火，在清脆的涛声中仰望浩瀚星河，为旅途画上静谧句点。",
    image: coast,
    imageAlt: "黄金海岸与暮色星空",
    tag: "营地星空 · 自由探索",
  },
];
