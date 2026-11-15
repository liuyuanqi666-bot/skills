import { type CSSProperties, useEffect, useId, useMemo, useState } from "react"

export type SceneThemePreset = "light-warm" | "light-mist" | "dark-ocean" | "dark-night"

export const SCENE_THEME_GUIDE: Record<SceneThemePreset, string> = {
  "light-warm": "文字区明亮，主色偏米白、沙金、暖绿；使用深色文字与暖白遮罩。",
  "light-mist": "文字区明亮，主色偏灰绿、雾蓝、冷灰；使用深绿文字与冷白遮罩。",
  "dark-ocean": "文字区较暗，主色偏青蓝、海军蓝、深灰；使用浅色文字与深青遮罩。",
  "dark-night": "文字区较暗，主色偏靛蓝、紫色、黑色；使用浅色文字与深靛遮罩。",
}

export type SceneGalleryItem = {
  id: string
  number?: string
  category: string
  location: string
  title: string
  description: string
  note?: string
  image: string
  alt: string
  theme: SceneThemePreset
  heroPosition?: string
}

export type Themed3DSceneGalleryProps = {
  items: readonly SceneGalleryItem[]
  eyebrow?: string
  sceneLabel?: string
  sceneHint?: string
  minimumDuration?: number
  secondsPerCard?: number
  repeat?: number
  reducedMotion?: boolean
  className?: string
}

function SceneCard({
  item,
  active,
  clone,
  index,
  onSelect,
}: {
  item: SceneGalleryItem
  active: boolean
  clone: boolean
  index: number
  onSelect: (item: SceneGalleryItem) => void
}) {
  const [missing, setMissing] = useState(false)
  const number = item.number ?? String(index + 1).padStart(2, "0")

  return (
    <button
      type="button"
      className={`tg3d__card${active ? " is-active" : ""}${missing ? " is-missing" : ""}`}
      aria-label={`展示${item.title}`}
      aria-pressed={!clone && active}
      tabIndex={clone ? -1 : 0}
      onClick={() => onSelect(item)}
    >
      {!missing && <img src={item.image} alt={clone ? "" : item.alt} width="720" height="423" onError={() => setMissing(true)} />}
      <span className="tg3d__card-meta"><span>{number}</span>{item.title}</span>
    </button>
  )
}

function SceneTrack({
  items,
  allItems,
  activeId,
  reverse,
  repeat,
  duration,
  onSelect,
}: {
  items: readonly SceneGalleryItem[]
  allItems: readonly SceneGalleryItem[]
  activeId: string
  reverse: boolean
  repeat: number
  duration: number
  onSelect: (item: SceneGalleryItem) => void
}) {
  const style = { "--tg3d-duration": `${duration}s` } as CSSProperties

  return (
    <div className="tg3d__marquee" style={style}>
      {Array.from({ length: repeat }, (_, groupIndex) => {
        const clone = groupIndex > 0
        return (
          <div
            className={`tg3d__marquee-group${reverse ? " tg3d__marquee-group--reverse" : ""}`}
            aria-hidden={clone ? "true" : undefined}
            key={groupIndex}
          >
            {items.map((item) => (
              <SceneCard
                key={`${groupIndex}-${item.id}`}
                item={item}
                active={activeId === item.id}
                clone={clone}
                index={allItems.findIndex((candidate) => candidate.id === item.id)}
                onSelect={onSelect}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function Themed3DSceneGallery({
  items,
  eyebrow = "CURATED JOURNEY",
  sceneLabel = "SCENE INDEX",
  sceneHint = "在移动的风景中，选择一段停留。",
  minimumDuration = 20,
  secondsPerCard = 20 / 3,
  repeat = 4,
  reducedMotion = false,
  className = "",
}: Themed3DSceneGalleryProps) {
  const titleId = useId()
  const safeRepeat = Math.max(2, Math.floor(repeat))
  const validThemes = Object.keys(SCENE_THEME_GUIDE)
  const invalidTheme = items.find((item) => !validThemes.includes(item.theme))
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")
  const [heroMissing, setHeroMissing] = useState(false)

  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) setActiveId(items[0]?.id ?? "")
  }, [activeId, items])

  useEffect(() => setHeroMissing(false), [activeId])

  const tracks = useMemo(
    () => Array.from({ length: 4 }, (_, trackIndex) => items.filter((_, index) => index % 4 === trackIndex)),
    [items]
  )

  if (items.length < 8 || items.length > 20) {
    return <p className="tg3d__invalid" role="alert">3D 场景画廊只接受 8–20 张图片，当前为 {items.length} 张。</p>
  }

  if (invalidTheme) {
    return <p className="tg3d__invalid" role="alert">场景“{invalidTheme.title}”缺少有效的渐变配色预设。</p>
  }

  const active = items.find((item) => item.id === activeId) ?? items[0]
  const activeIndex = items.findIndex((item) => item.id === active.id)
  const longestTrack = Math.max(...tracks.map((track) => track.length))
  const duration = Math.max(minimumDuration, longestTrack * secondsPerCard)
  const selectByOffset = (offset: number) => setActiveId(items[(activeIndex + offset + items.length) % items.length].id)

  return (
    <section className={`tg3d${reducedMotion ? " tg3d--reduced" : ""} ${className}`.trim()} data-theme={active.theme} aria-labelledby={titleId}>
      <div className={`tg3d__hero${heroMissing ? " is-missing" : ""}`}>
        {!heroMissing && (
          <img
            className="tg3d__hero-image"
            key={active.id}
            src={active.image}
            alt={active.alt}
            width="1440"
            height="900"
            style={{ objectPosition: active.heroPosition ?? "center" }}
            onError={() => setHeroMissing(true)}
          />
        )}
        <div className="tg3d__hero-veil" />
        <div className="tg3d__hero-copy" aria-live="polite">
          <p className="tg3d__eyebrow">{eyebrow}</p>
          <p className="tg3d__number"><span>{active.number ?? String(activeIndex + 1).padStart(2, "0")}</span><span>/ {String(items.length).padStart(2, "0")}</span></p>
          <div className="tg3d__story">
            <p className="tg3d__meta"><span>{active.category}</span><span>{active.location}</span></p>
            <h1 id={titleId}>{active.title}</h1>
            <span className="tg3d__rule" />
            <p className="tg3d__description">{active.description}</p>
            {active.note && <p className="tg3d__note">{active.note}</p>}
          </div>
          <a className="tg3d__scroll" href="#tg3d-scenes"><span aria-hidden="true" />SCROLL DOWN</a>
          <div className="tg3d__controls" aria-label="切换介绍内容">
            <button type="button" onClick={() => selectByOffset(-1)} aria-label="上一个"><span aria-hidden="true">‹</span></button>
            <button type="button" onClick={() => selectByOffset(1)} aria-label="下一个"><span aria-hidden="true">›</span></button>
          </div>
        </div>
      </div>

      <div className="tg3d__index" id="tg3d-scenes">
        <header className="tg3d__index-header"><p>{sceneLabel}</p><span>{sceneHint}</span></header>
        <div className="tg3d__stage">
          <div className="tg3d__wall">
            {tracks.map((track, index) => (
              <SceneTrack
                key={index}
                items={track}
                allItems={items}
                activeId={active.id}
                reverse={index === 1 || index === 2}
                repeat={safeRepeat}
                duration={duration}
                onSelect={(item) => setActiveId(item.id)}
              />
            ))}
          </div>
          <div className="tg3d__stage-fade tg3d__stage-fade--top" />
          <div className="tg3d__stage-fade tg3d__stage-fade--bottom" />
        </div>
      </div>
    </section>
  )
}
