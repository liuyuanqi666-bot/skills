"use client";
import greenHillsImage from "../../public/images/travel-landscape-svg/green-hills.svg?url";
import forestImage from "../../public/images/travel-landscape-svg/forest.svg?url";
import starsImage from "../../public/images/travel-landscape-svg/stars.svg?url";
import coastImage from "../../public/images/travel-landscape-svg/coast.svg?url";

import Carousel, { type SlideData } from "./components/ui/carousel";

export default function App() {
  const slideData: SlideData[] = [
    {
      title: "秘境雾山 · 隐世居所",
      category: "奢华度假酒店",
      button: "查阅客房档案",
      src: greenHillsImage,
      highlights: ["海拔 1200m", "私人无边云海汤池", "在地时令竹笋宴"],
      description:
        "坐落于原始云杉林边缘，依山势而建的九栋独栋树屋。全景落地窗直面日出云海，客房内配备原木手工家私与高山泉水私汤，为您提供远离尘嚣的静谧避世居所。",
    },
    {
      title: "都会流光 · 天际酒廊",
      category: "米其林甄选",
      button: "探索主厨菜单",
      src: forestImage,
      highlights: ["68层全景天际线", "当季黑松露品鉴", "特调分子鸡尾酒"],
      description:
        "俯瞰整座城市的灯火璀璨。主厨结合东方发酵灵感与现代法式烹饪艺术，以极致严苛的食材甄选，呈现兼具视觉张力与味觉层次的当代先锋美馔。",
    },
    {
      title: "赛博长街 · 霓虹幻夜",
      category: "人文夜生活",
      button: "浏览向导路线",
      src: starsImage,
      highlights: ["地下电子乐现场", "复古电玩工坊", "深夜炭火烧鸟"],
      description:
        "纵横交错的霓虹招牌与老骑楼交织出独特的市井赛博美学。本地文化向导将带领您穿梭于隐秘巷陌，探访深藏在弄堂尽头的独立艺术空间与深夜食堂。",
    },
    {
      title: "大漠落日 · 荒原星空",
      category: "野奢探险体验",
      button: "查看营地档案",
      src: coastImage,
      highlights: ["专业天文望远镜", "四驱冲沙越野", "篝火原木烧烤"],
      description:
        "深入无垠沙海腹地，在落日将沙脊染成赤金时安营扎寨。夜幕降临后，穹顶之上银河清晰可见，伴随篝火与马头琴声，沉浸于最纯粹的苍茫天地之间。",
    },
  ];

  return (
    <div className="relative overflow-hidden w-full py-8 sm:py-12 pb-24 sm:pb-28 flex items-center justify-center bg-[#0C0E12]">
      <Carousel slides={slideData} />
    </div>
  );
}
