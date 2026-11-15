import { useMemo, useState } from "react"


import coastImage from "../../public/images/travel-landscape-svg/coast.svg"
import forestImage from "../../public/images/travel-landscape-svg/forest.svg"
import glacierImage from "../../public/images/travel-landscape-svg/glacier.svg"
import greenHillsImage from "../../public/images/travel-landscape-svg/green-hills.svg"
import lakeImage from "../../public/images/travel-landscape-svg/lake.svg"
import starsImage from "../../public/images/travel-landscape-svg/stars.svg"
import { type SceneGalleryItem, Themed3DSceneGallery } from "./Themed3DSceneGallery"
const seeds = [
  { title: "绿丘村落", category: "目的地", location: "北部绿丘", description: "沿着起伏草坡走进安静村落，让旅程在晨光与风声之间慢下来。", note: "A Different Kind of Journey", image: greenHillsImage, alt: "层叠绿丘与村落", theme: "light-warm" as const, heroPosition: "center" },
  { title: "林间晨光", category: "自然体验", location: "古木森林", description: "穿过高耸林木，等待日光从树冠之间落下，听见森林缓慢的呼吸。", note: "Breathe A Wilder World", image: forestImage, alt: "阳光穿过高大树林", theme: "light-mist" as const, heroPosition: "center" },
  { title: "鲸湾潮声", category: "海岸体验", location: "静谧海湾", description: "沿着辽阔海面出发，在海风与远山之间寻找鲸影经过的方向。", note: "Where Mountains Meet The Sea", image: coastImage, alt: "蓝色海岸与鲸尾", theme: "dark-ocean" as const, heroPosition: "center" },
  { title: "飞越冰川", category: "高山体验", location: "南部冰原", description: "越过群峰与冰河，从高处看见大地缓慢延伸出的蓝白纹理。", note: "Above The Southern Alps", image: glacierImage, alt: "雪山之间的冰川", theme: "light-mist" as const, heroPosition: "center" },
  { title: "湖山之间", category: "目的地", location: "湖畔小城", description: "登上山顶俯瞰湖湾，在群峰、湖光与小镇灯火之间收住一天的风景。", note: "A Pause Between Peaks", image: lakeImage, alt: "群山环绕的湖畔城镇", theme: "light-warm" as const, heroPosition: "center" },
  { title: "南方星河", category: "夜间体验", location: "暗夜保护区", description: "远离城市灯光，在安静夜色里等待银河越过山脊与湖面。", note: "Under The Southern Lights", image: starsImage, alt: "深蓝天空中的银河", theme: "dark-night" as const, heroPosition: "center" },
]

const allItems: SceneGalleryItem[] = Array.from({ length: 21 }, (_, index) => {
  const seed = seeds[index % seeds.length]
  const cycle = Math.floor(index / seeds.length) + 1
  return {
    ...seed,
    id: `scene-${index + 1}`,
    number: String(index + 1).padStart(2, "0"),
    title: cycle === 1 ? seed.title : `${seed.title} ${cycle}`,
  }
})

function initialCount() {
  const requested = Number(new URLSearchParams(window.location.search).get("count"))
  return Number.isInteger(requested) && requested > 0 ? requested : 12
}

function App() {
  const [count, setCount] = useState(initialCount)
  const [reduced, setReduced] = useState(false)
  const [broken, setBroken] = useState(false)
  const items = useMemo(
    () => allItems.slice(0, count).map((item, index) => broken && index === 0 ? { ...item, image: "/missing-scene.svg" } : item),
    [broken, count]
  )

  return (
    <main>
      <div className="fixture-controls" aria-label="验收状态">
        <label>图片 <input aria-label="图片数量" type="number" min="8" max="20" value={count} onChange={(event) => setCount(Math.min(20, Math.max(8, Number(event.target.value) || 8)))} /></label>
        <button type="button" aria-pressed={reduced} onClick={() => setReduced((value) => !value)}>减少动态：{reduced ? "开" : "关"}</button>
        <button type="button" aria-pressed={broken} onClick={() => setBroken((value) => !value)}>缺图回退：{broken ? "开" : "关"}</button>
      </div>
      <Themed3DSceneGallery items={items} reducedMotion={reduced} />
    </main>
  )
}

export default App;
