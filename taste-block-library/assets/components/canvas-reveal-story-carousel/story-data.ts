export type StoryChapter = {
  eyebrow: string;
  title: string;
  description: string;
  detail: string;
  image: string;
  alt: string;
  colors: [number[], number[]];
};

export const storyChapters: StoryChapter[] = [
  {
    eyebrow: "01 · 行程亮点",
    title: "一条路线，\n收拢多重风景。",
    description: "从开阔湖岸到雪线山谷，让每天的目的地都有不同的抵达感。",
    detail: "具体城市与景点可替换",
    image: "/images/canvas-reveal-travel-narrative/mountain-route.webp",
    alt: "雪山与湖泊相接的旅行风景",
    colors: [[68, 176, 210], [160, 215, 226]],
  },
  {
    eyebrow: "02 · 在地风味",
    title: "用一张餐桌，\n记住一座城。",
    description: "把地方风味放进旅途节奏里，让用餐也成为值得停留的一幕。",
    detail: "餐食安排与标准待补充",
    image: "/images/canvas-reveal-travel-narrative/local-table.webp",
    alt: "木桌上的多款地方风味餐食",
    colors: [[225, 145, 74], [126, 168, 111]],
  },
  {
    eyebrow: "03 · 舒适停驻",
    title: "在抵达之后，\n把夜晚还给自己。",
    description: "以安静、舒展的住宿画面，承接一天行程后的休息时刻。",
    detail: "酒店名称与房型待补充",
    image: "/images/canvas-reveal-travel-narrative/mountain-lodge.webp",
    alt: "面向山景的安静木质客房",
    colors: [[106, 143, 160], [205, 159, 105]],
  },
];
