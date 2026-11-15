import { useMemo, useState } from "react"


import coastImage from "../../public/images/travel-landscape-svg/coast.svg"
import forestImage from "../../public/images/travel-landscape-svg/forest.svg"
import glacierImage from "../../public/images/travel-landscape-svg/glacier.svg"
import greenHillsImage from "../../public/images/travel-landscape-svg/green-hills.svg"
import lakeImage from "../../public/images/travel-landscape-svg/lake.svg"
import starsImage from "../../public/images/travel-landscape-svg/stars.svg"
import { type StoryGalleryItem, VerticalCounterflowStoryGallery } from "./VerticalCounterflowStoryGallery"
const sampleItems: StoryGalleryItem[] = [
  { id: "hills", number: "01", category: "目的地", location: "北部绿丘", title: "绿丘村落", description: "沿着起伏的草坡慢慢前行，在安静的乡野里停留一段轻盈时光。", image: greenHillsImage, alt: "层叠绿丘与村落" },
  { id: "forest", number: "02", category: "自然体验", location: "古木森林", title: "林间晨光", description: "穿过高耸林木，等待日光从树冠之间落下，让脚步自然慢下来。", image: forestImage, alt: "阳光穿过高大树林" },
  { id: "coast", number: "03", category: "海岸体验", location: "静谧海湾", title: "鲸湾潮声", description: "沿着辽阔海面出发，在海风与远山之间寻找鲸影经过的方向。", image: coastImage, alt: "蓝色海岸与鲸尾" },
  { id: "glacier", number: "04", category: "高山体验", location: "南部冰原", title: "飞越冰川", description: "越过群峰与冰河，从高处看见大地缓慢延伸出的蓝白纹理。", image: glacierImage, alt: "雪山之间的冰川" },
  { id: "lake", number: "05", category: "目的地", location: "湖畔小城", title: "湖山之间", description: "登上山顶俯瞰湖湾，在群峰、湖光与小镇灯火之间收住一天的风景。", image: lakeImage, alt: "群山环绕的湖畔城镇" },
  { id: "stars", number: "06", category: "夜间体验", location: "暗夜保护区", title: "南方星河", description: "远离城市灯光，在安静夜色里等待银河越过山脊与湖面。", image: starsImage, alt: "深蓝天空中的银河" },
]

function App() {
  const [reduced, setReduced] = useState(false)
  const [broken, setBroken] = useState(false)
  const items = useMemo(() => sampleItems.map((item, index) => broken && index === 0 ? { ...item, image: "/missing-image.svg" } : item), [broken])

  return (
    <main>
      <div className="fixture-controls" aria-label="验收状态">
        <button type="button" aria-pressed={reduced} onClick={() => setReduced((value) => !value)}>减少动态：{reduced ? "开" : "关"}</button>
        <button type="button" aria-pressed={broken} onClick={() => setBroken((value) => !value)}>缺图回退：{broken ? "开" : "关"}</button>
      </div>
      <VerticalCounterflowStoryGallery items={items} eyebrow="精选旅程 · 视觉叙事" reducedMotion={reduced} />
    </main>
  )
}

export default App;
