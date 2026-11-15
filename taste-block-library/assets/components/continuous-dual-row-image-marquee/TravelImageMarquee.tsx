import {
  type CSSProperties,
  type MouseEvent,
  type SyntheticEvent,
  useEffect,
  useState,
} from "react"

export type MarqueeCard = {
  id: string
  title: string
  description: string
  image: string
}

export type TravelImageMarqueeProps = {
  rows: readonly [readonly MarqueeCard[], readonly MarqueeCard[]]
  secondsPerCard?: number
  minDurationSeconds?: number
  repeat?: number
  pauseOnHover?: boolean
  reducedMotion?: boolean
  className?: string
}

type MarqueeStyle = CSSProperties & { "--duration": string }

function Card({
  card,
  active,
  clone,
  onToggle,
}: {
  card: MarqueeCard
  active: boolean
  clone: boolean
  onToggle: () => void
}) {
  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    const touchLike = window.matchMedia("(hover: none), (pointer: coarse)").matches
    if (touchLike || event.detail === 0) onToggle()
  }

  const onImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.hidden = true
    event.currentTarget.parentElement?.classList.add("image-marquee__card--missing")
  }

  return (
    <button
      type="button"
      className={`image-marquee__card${active ? " is-active" : ""}`}
      data-marquee-card
      aria-label={`${card.title}：${card.description}`}
      aria-pressed={active}
      tabIndex={clone ? -1 : 0}
      onClick={onClick}
    >
      <img
        src={card.image}
        width="720"
        height="423"
        alt=""
        draggable="false"
        onError={onImageError}
      />
      <span className="image-marquee__overlay" aria-hidden="true">
        <span className="image-marquee__copy">
          <strong>{card.title}</strong>
          <small>{card.description}</small>
        </span>
      </span>
    </button>
  )
}

function Row({
  items,
  reverse,
  repeat,
  pauseOnHover,
  duration,
  activeCard,
  onToggle,
}: {
  items: readonly MarqueeCard[]
  reverse: boolean
  repeat: number
  pauseOnHover: boolean
  duration: number
  activeCard: string | null
  onToggle: (id: string) => void
}) {
  const style = { "--duration": `${duration}s` } as MarqueeStyle

  return (
    <div
      className={`image-marquee__row${pauseOnHover ? " image-marquee__row--pause" : ""}`}
      style={style}
    >
      {Array.from({ length: repeat }, (_, groupIndex) => {
        const clone = groupIndex > 0
        return (
          <div
            className={`image-marquee__group${reverse ? " image-marquee__group--reverse" : ""}`}
            aria-hidden={clone || undefined}
            key={groupIndex}
          >
            {items.map((card) => (
              <Card
                key={card.id}
                card={card}
                active={activeCard === card.id}
                clone={clone}
                onToggle={() => onToggle(card.id)}
              />
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function TravelImageMarquee({
  rows,
  secondsPerCard = 20 / 3,
  minDurationSeconds = 20,
  repeat = 4,
  pauseOnHover = true,
  reducedMotion = false,
  className = "",
}: TravelImageMarqueeProps) {
  const [activeCard, setActiveCard] = useState<string | null>(null)
  const safeRepeat = Math.max(2, Math.floor(repeat))
  const durationFor = (count: number) =>
    Math.max(minDurationSeconds, count * secondsPerCard)

  useEffect(() => {
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!(event.target instanceof Element) || !event.target.closest("[data-marquee-card]")) {
        setActiveCard(null)
      }
    }

    document.addEventListener("pointerdown", closeOnOutsidePress)
    return () => document.removeEventListener("pointerdown", closeOnOutsidePress)
  }, [])

  const toggle = (id: string) => {
    setActiveCard((current) => (current === id ? null : id))
  }

  return (
    <section
      className={`image-marquee${reducedMotion ? " image-marquee--reduced" : ""} ${className}`.trim()}
      aria-label="目的地图片展示"
    >
      <Row
        items={rows[0]}
        reverse={false}
        repeat={safeRepeat}
        pauseOnHover={pauseOnHover}
        duration={durationFor(rows[0].length)}
        activeCard={activeCard}
        onToggle={toggle}
      />
      <Row
        items={rows[1]}
        reverse
        repeat={safeRepeat}
        pauseOnHover={pauseOnHover}
        duration={durationFor(rows[1].length)}
        activeCard={activeCard}
        onToggle={toggle}
      />
    </section>
  )
}
