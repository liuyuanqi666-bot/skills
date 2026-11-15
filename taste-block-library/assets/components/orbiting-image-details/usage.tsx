import React from "react"


import coast from "../../public/images/travel-landscape-svg/coast.svg?url"
import forest from "../../public/images/travel-landscape-svg/forest.svg?url"
import glacier from "../../public/images/travel-landscape-svg/glacier.svg?url"
import hills from "../../public/images/travel-landscape-svg/green-hills.svg?url"
import lake from "../../public/images/travel-landscape-svg/lake.svg?url"
import stars from "../../public/images/travel-landscape-svg/stars.svg?url"

import {
  OrbitingImageDetails,
  type OrbitImageItem,
} from "./OrbitingImageDetails"
const baseItems: OrbitImageItem[] = [
  {
    id: "hills",
    title: "绿丘村落",
    eyebrow: "北岛 · 田园秘境",
    description: "沿着起伏绿丘散步，走进电影般温柔的田园世界。",
    image: hills,
  },
  {
    id: "coast",
    title: "鲸湾海岸",
    eyebrow: "南岛 · 海岸观鲸",
    description: "山海交会的海岸线上，等待远方鲸影浮出蔚蓝水面。",
    image: coast,
  },
  {
    id: "glacier",
    title: "高山冰川",
    eyebrow: "雪峰 · 高空巡游",
    description: "越过群峰俯瞰蜿蜒冰河，感受辽阔纯净的高山腹地。",
    image: glacier,
  },
  {
    id: "stars",
    title: "暗夜星空",
    eyebrow: "暗夜保护区 · 观星",
    description: "远离城市灯光仰望银河，收藏南半球的静谧夜色。",
    image: stars,
  },
  {
    id: "forest",
    title: "晨雾森林",
    eyebrow: "北岛 · 林间漫步",
    description: "穿行高耸林木与斑驳光影之间，感受自然生命力。",
    image: forest,
  },
  {
    id: "lake",
    title: "湖畔小城",
    eyebrow: "南岛 · 湖光山色",
    description: "沿湖远眺群山，让清澈水色与悠闲小镇铺开旅程。",
    image: lake,
  },
]

const demoItems: OrbitImageItem[] = Array.from({ length: 10 }, (_, index) => {
  const source = baseItems[index % baseItems.length]
  return index < baseItems.length
    ? source
    : {
        ...source,
        id: `${source.id}-${index + 1}`,
        title: `${source.title} ${index + 1}`,
      }
})

function readFixtureOptions() {
  const params = new URLSearchParams(window.location.search)
  const requestedCount = Number(params.get("count") ?? 6)
  const count = Number.isFinite(requestedCount)
    ? Math.min(10, Math.max(1, Math.round(requestedCount)))
    : 6
  const items = demoItems.slice(0, count)

  if (params.get("missing") === "1" && items[0]) {
    items[0] = { ...items[0], image: "/deliberately-missing.svg" }
  }

  return {
    items,
    reducedMotion: params.get("reduced") === "1",
  }
}

function App() {
  const options = readFixtureOptions()

  return (
    <main className="fixture-page">
      <section className="fixture-card" aria-labelledby="fixture-title">
        <header className="fixture-heading">
          <p>JOURNEY HIGHLIGHTS</p>
          <h1 id="fixture-title">
            沿轨迹，<br />遇见新西兰
          </h1>
          <span>悬停或轻触圆形图片查看目的地</span>
        </header>

        <OrbitingImageDetails
          items={options.items}
          reducedMotion={options.reducedMotion}
        />
      </section>
    </main>
  )
}

export default App;
