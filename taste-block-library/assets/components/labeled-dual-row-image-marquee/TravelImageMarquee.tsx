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

export type MarqueeRowLabel = {
  eyebrow: string
  title: string
  helper?: string
}

export type TravelImageMarqueeProps = {
  rows: readonly [readonly MarqueeCard[], readonly MarqueeCard[]]
  secondsPerCard?: number
  minDurationSeconds?: number
  repeat?: number
  pauseOnHover?: boolean
  reducedMotion?: boolean
  rowLabels?: readonly [MarqueeRowLabel, MarqueeRowLabel]
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

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.hidden = false
    event.currentTarget.parentElement?.classList.remove("image-marquee__card--missing")
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
        onLoad={onImageLoad}
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

function RowLabel({ label }: { label: MarqueeRowLabel }) {
  return (
    <header className="image-marquee__label">
      <span className="image-marquee__eyebrow">{label.eyebrow}</span>
      <h2>{label.title}</h2>
      {label.helper ? <p>{label.helper}</p> : null}
    </header>
  )
}

function Lane({
  label,
  reverse,
  ...rowProps
}: Omit<Parameters<typeof Row>[0], "reverse"> & {
  label?: MarqueeRowLabel
  reverse: boolean
}) {
  const row = <Row {...rowProps} reverse={reverse} />

  if (!label) return row

  return (
    <div className={`image-marquee__lane${reverse ? " image-marquee__lane--label-right" : ""}`}>
      {reverse ? row : <RowLabel label={label} />}
      {reverse ? <RowLabel label={label} /> : row}
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
  rowLabels,
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
      className={`image-marquee${reducedMotion ? " image-marquee--reduced" : ""}${rowLabels ? " image-marquee--labeled" : ""} ${className}`.trim()}
      aria-label="目的地图片展示"
    >
      <Lane
        label={rowLabels?.[0]}
        items={rows[0]}
        reverse={false}
        repeat={safeRepeat}
        pauseOnHover={pauseOnHover}
        duration={durationFor(rows[0].length)}
        activeCard={activeCard}
        onToggle={toggle}
      />
      <Lane
        label={rowLabels?.[1]}
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
