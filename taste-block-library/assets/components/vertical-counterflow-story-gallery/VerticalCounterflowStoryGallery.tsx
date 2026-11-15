import { type CSSProperties, useEffect, useMemo, useState } from "react"

export type StoryGalleryItem = {
  id: string
  number: string
  category: string
  location: string
  title: string
  description: string
  image: string
  alt: string
}

export type VerticalCounterflowStoryGalleryProps = {
  items: readonly StoryGalleryItem[]
  eyebrow: string
  durationPerCard?: number
  minimumDuration?: number
  repeat?: number
  reducedMotion?: boolean
  className?: string
}

function StoryCard({
  item,
  active,
  clone,
  onSelect,
}: {
  item: StoryGalleryItem
  active: boolean
  clone: boolean
  onSelect: (item: StoryGalleryItem) => void
}) {
  const [missing, setMissing] = useState(false)

  return (
    <button
      type="button"
      className={`vc-story__card${active ? " is-active" : ""}${missing ? " is-missing" : ""}`}
      aria-label={`查看${item.title}介绍`}
      aria-current={!clone && active ? "true" : undefined}
      tabIndex={clone ? -1 : 0}
      onClick={() => onSelect(item)}
      onFocus={() => onSelect(item)}
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") onSelect(item)
      }}
    >
      {!missing && (
        <img
          src={item.image}
          alt={clone ? "" : item.alt}
          width="720"
          height="423"
          onError={() => setMissing(true)}
        />
      )}
      <span className="vc-story__card-label">
        <span>{item.number}</span>
        {item.title}
      </span>
    </button>
  )
}

function StoryTrack({
  items,
  activeId,
  reverse,
  repeat,
  duration,
  onSelect,
}: {
  items: readonly StoryGalleryItem[]
  activeId: string
  reverse: boolean
  repeat: number
  duration: number
  onSelect: (item: StoryGalleryItem) => void
}) {
  const style = { "--vc-duration": `${duration}s` } as CSSProperties

  return (
    <div className="vc-story__track" style={style}>
      {Array.from({ length: repeat }, (_, groupIndex) => {
        const clone = groupIndex > 0
        return (
          <div
            className={`vc-story__group${reverse ? " vc-story__group--reverse" : ""}`}
            aria-hidden={clone ? "true" : undefined}
            key={groupIndex}
          >
            {items.map((item) => (
              <StoryCard
                key={`${groupIndex}-${item.id}`}
                item={item}
                active={activeId === item.id}
                clone={clone}
                onSelect={onSelect}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function VerticalCounterflowStoryGallery({
  items,
  eyebrow,
  durationPerCard = 20 / 3,
  minimumDuration = 20,
  repeat = 4,
  reducedMotion = false,
  className = "",
}: VerticalCounterflowStoryGalleryProps) {
  const safeRepeat = Math.max(2, Math.floor(repeat))
  const columns = useMemo(
    () => [items.filter((_, index) => index % 2 === 0), items.filter((_, index) => index % 2 === 1)],
    [items]
  )
  const duration = Math.max(minimumDuration, Math.max(...columns.map((column) => column.length)) * durationPerCard)
  const [activeId, setActiveId] = useState(items[0]?.id ?? "")

  useEffect(() => {
    if (!items.some((item) => item.id === activeId)) setActiveId(items[0]?.id ?? "")
  }, [activeId, items])

  if (items.length < 4) {
    return <p className="vc-story__invalid" role="alert">垂直叙事画廊至少需要 4 张图片。</p>
  }

  const activeItem = items.find((item) => item.id === activeId) ?? items[0]
  const activeIndex = items.findIndex((item) => item.id === activeItem.id)
  const select = (item: StoryGalleryItem) => setActiveId(item.id)
  const selectByOffset = (offset: number) => {
    const next = (activeIndex + offset + items.length) % items.length
    setActiveId(items[next].id)
  }

  return (
    <section className={`vc-story${reducedMotion ? " vc-story--reduced" : ""} ${className}`.trim()} aria-labelledby="vc-story-title">
      <div className="vc-story__gallery">
        <StoryTrack items={columns[0]} activeId={activeId} repeat={safeRepeat} duration={duration} reverse={false} onSelect={select} />
        <StoryTrack items={columns[1]} activeId={activeId} repeat={safeRepeat} duration={duration} reverse onSelect={select} />
        <div className="vc-story__fade vc-story__fade--top" />
        <div className="vc-story__fade vc-story__fade--bottom" />
      </div>

      <div className="vc-story__copy">
        <div className="vc-story__copy-inner">
          <p className="vc-story__eyebrow">{eyebrow}</p>
          <p className="vc-story__meta"><span>{activeItem.category}</span><span>{activeItem.location}</span></p>
          <h2 id="vc-story-title">{activeItem.title}</h2>
          <p className="vc-story__description">{activeItem.description}</p>
          <div className="vc-story__footer">
            <p><strong>{activeItem.number}</strong> / {String(items.length).padStart(2, "0")}</p>
            <div className="vc-story__controls" aria-label="切换介绍内容">
              <button type="button" onClick={() => selectByOffset(-1)} aria-label="上一个"><span aria-hidden="true">‹</span></button>
              <button type="button" onClick={() => selectByOffset(1)} aria-label="下一个"><span aria-hidden="true">›</span></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
