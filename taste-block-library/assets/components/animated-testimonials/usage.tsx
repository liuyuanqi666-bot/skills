import React from "react";
import { AnimatedTestimonials, type Testimonial } from "./components/ui/animated-testimonials";

export const sampleTravelNarratives: Testimonial[] = [
  {
    name: "纳木错 · 扎西半岛",
    designation: "【奇绝胜景】国家级风景名胜区 · 海拔4718米圣湖之眸",
    quote:
      "念青唐古拉山脉脚下的蔚蓝圣湖。清晨初霁，微风拂过如镜水面，远山覆雪与碎玉般的波光交织成诗，是西藏高原最令人沉醉的初见篇章。",
    src: "/images/mountains.jpg",
  },
  {
    name: "林芝石锅松茸土鸡",
    designation: "【舌尖风味】墨脱皂石慢火细煨 · 地道舌尖非遗滋味",
    quote:
      "精选海拔三千米野生头茬手剥鲜松茸，浸润散养藏香土鸡。汤色金黄清澈，山野清甜与醇厚胶质在唇齿间层层绽放，暖身沁心。",
    src: "/images/forest-lake.jpg",
  },
  {
    name: "松赞南迦巴瓦山居",
    designation: "【宿隐云端】隐世雪山观景私汤 · 峡谷深处的静谧别院",
    quote:
      "直面中国最美雪峰的私藏避世美宿。推窗即见南迦巴瓦直刺苍穹的俊秀峰尖，入夜沉浸在恒温木桶私汤中，枕着漫天璀璨星河悄然入眠。",
    src: "/images/forest-canopy.jpg",
  },
  {
    name: "八廓街千年唐卡坊",
    designation: "【人文非遗】国家级非遗工坊 · 纯金与矿石颜料的指尖修行",
    quote:
      "步入古街深处的静谧画室，老画师以金箔磨汁配天然孔雀石入画。一笔一划间，勾勒出数百年岁月沉淀的虔诚信仰与厚重文化精髓。",
    src: "/images/urban.jpg",
  },
  {
    name: "2+1头等舱陆地巡航",
    designation: "【臻选卖点】专属随行管家团队 · 弥散式全车供氧保障",
    quote:
      "全系标配航空级人体工学独立按摩真皮座椅，配备医用级弥散式移动供氧系统。资深金牌向导随车护航，让每一步探索都舒心无忧。",
    src: "/images/desert.jpg",
  },
];

export function App() {
  return (
    <main className="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 md:p-8">
      <AnimatedTestimonials
        testimonials={sampleTravelNarratives}
        autoplay={false}
        autoplayInterval={3000}
      />
    </main>
  );
}

export default App;
