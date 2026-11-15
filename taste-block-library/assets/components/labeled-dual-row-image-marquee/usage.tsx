import { useMemo, useState } from "react"


import {
  type MarqueeCard,
  type MarqueeRowLabel,
  TravelImageMarquee,
} from "./TravelImageMarquee"
import coastImage from "../../public/images/travel-landscape-svg/coast.svg"
import forestImage from "../../public/images/travel-landscape-svg/forest.svg"
import glacierImage from "../../public/images/travel-landscape-svg/glacier.svg"
import greenHillsImage from "../../public/images/travel-landscape-svg/green-hills.svg"
import lakeImage from "../../public/images/travel-landscape-svg/lake.svg"
import starsImage from "../../public/images/travel-landscape-svg/stars.svg"

const north: MarqueeCard[] = [
  { id: "green-hills", title: "绿丘村落", description: "沿着草坡走进静谧的田园风景。", image: greenHillsImage },
  { id: "forest", title: "晨雾森林", description: "在高耸林木之间寻找透进来的光。", image: forestImage },
  { id: "coast", title: "鲸湾海岸", description: "沿着雪山海岸等待远方鲸影。", image: coastImage },
]

const south: MarqueeCard[] = [
  { id: "glacier", title: "高山冰川", description: "越过群峰俯瞰蜿蜒的蓝色冰河。", image: glacierImage },
  { id: "lake", title: "湖畔小城", description: "从高处看湖湾与小城渐次亮灯。", image: lakeImage },
  { id: "stars", title: "暗夜星空", description: "在远离城市的地方仰望银河。", image: starsImage },
]

const rowLabels: [MarqueeRowLabel, MarqueeRowLabel] = [
  { eyebrow: "FEATURED", title: "精选旅程", helper: "触碰照片 · 查看详情" },
  { eyebrow: "DISCOVER", title: "旅行灵感", helper: "触碰照片 · 查看详情" },
]

function App() {
  const [reduced, setReduced] = useState(false)
  const [brokenImage, setBrokenImage] = useState(false)
  const firstRow = useMemo(
    () => north.map((item, index) => index === 0 && brokenImage ? { ...item, image: "/missing-preview-asset.svg" } : item),
    [brokenImage]
  )

  return (
    <main className="fixture-shell">
      <div className="fixture-panel">
        <header className="fixture-heading">
          <div>
            <p>Taste Block Fixture</p>
            <h1>带标识双向目的地影像带</h1>
          </div>
          <div className="fixture-controls" aria-label="验收状态">
            <button type="button" aria-pressed={reduced} onClick={() => setReduced((value) => !value)}>
              减少动态：{reduced ? "开" : "关"}
            </button>
            <button type="button" aria-pressed={brokenImage} onClick={() => setBrokenImage((value) => !value)}>
              缺图回退：{brokenImage ? "开" : "关"}
            </button>
          </div>
        </header>
        <TravelImageMarquee
          rows={[firstRow, south]}
          rowLabels={rowLabels}
          reducedMotion={reduced}
        />
      </div>
    </main>
  )
}

export default App;
