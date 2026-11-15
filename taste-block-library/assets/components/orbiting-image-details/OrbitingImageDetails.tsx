import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { isOrbitLayoutSuitable, splitOrbitItems } from "./orbit-layout"
import { OrbitingCircles } from "./orbiting-circles"

export type OrbitImageItem = {
  id: string
  title: string
  eyebrow: string
  description: string
  image: string
}

export type OrbitingImageDetailsProps = {
  items: readonly OrbitImageItem[]
  centerLabel?: string
  centerCaption?: string
  reducedMotion?: boolean
  className?: string
}

type OrbitGeometry = {
  outerRadius: number
  innerRadius: number
  outerSize: number
  innerSize: number
}

const desktopGeometry: OrbitGeometry = {
  outerRadius: 160,
  innerRadius: 100,
  outerSize: 68,
  innerSize: 50,
}

function usesFinePointer() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches
}

function useOrbitGeometry() {
  const layerRef = useRef<HTMLDivElement>(null)
  const [geometry, setGeometry] = useState(desktopGeometry)

  useLayoutEffect(() => {
    const layer = layerRef.current
    if (!layer) return

    const update = () => {
      const width = layer.getBoundingClientRect().width
      const outerSize = width < 380 ? 52 : width < 520 ? 56 : 68
      const innerSize = width < 380 ? 40 : width < 520 ? 42 : 50
      const outerRadius = Math.round(
        Math.min(160, Math.max(104, (width - outerSize - 16) / 2)),
      )
      const innerRadius = Math.round(
        Math.min(100, Math.max(68, outerRadius * 0.625)),
      )
      const next = { outerRadius, innerRadius, outerSize, innerSize }

      setGeometry((current) =>
        Object.keys(next).every(
          (key) =>
            current[key as keyof OrbitGeometry] === next[key as keyof OrbitGeometry],
        )
          ? current
          : next,
      )
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(layer)
    return () => observer.disconnect()
  }, [])

  return { layerRef, ...geometry }
}

function SafeImage({
  src,
  alt,
  fallback,
}: {
  src: string
  alt: string
  fallback: string
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  if (failed) {
    return <span className="orbit-safe-image__fallback">{fallback}</span>
  }

  return (
    <img
      src={src}
      alt={alt}
      width="720"
      height="423"
      draggable="false"
      onError={() => setFailed(true)}
    />
  )
}

function OrbitImageButton({
  item,
  active,
  onActivate,
  onDismiss,
}: {
  item: OrbitImageItem
  active: boolean
  onActivate: (item: OrbitImageItem) => void
  onDismiss: (id: string) => void
}) {
  return (
    <button
      type="button"
      className={`orbit-portrait${active ? " is-active" : ""}`}
      aria-label={`查看${item.title}详情`}
      aria-expanded={active}
      aria-controls="orbit-destination-detail"
      data-orbit-trigger
      onPointerEnter={() => {
        if (usesFinePointer()) onActivate(item)
      }}
      onPointerLeave={() => {
        if (usesFinePointer()) onDismiss(item.id)
      }}
      onFocus={(event) => {
        if (event.currentTarget.matches(":focus-visible")) onActivate(item)
      }}
      onBlur={() => onDismiss(item.id)}
      onClick={(event) => {
        if (event.detail !== 0 && usesFinePointer()) return
        if (active) onDismiss(item.id)
        else onActivate(item)
      }}
    >
      <SafeImage src={item.image} alt="" fallback={item.title.slice(0, 1)} />
    </button>
  )
}

export function OrbitingImageDetails({
  items,
  centerLabel = "NZ",
  centerCaption = "AOTEAROA",
  reducedMotion = false,
  className = "",
}: OrbitingImageDetailsProps) {
  const [active, setActive] = useState<OrbitImageItem | null>(null)
  const { layerRef, outerRadius, innerRadius, outerSize, innerSize } =
    useOrbitGeometry()

  useEffect(() => {
    const dismissOutside = (event: PointerEvent) => {
      const target = event.target as Element
      if (!target.closest("[data-orbit-trigger]")) setActive(null)
    }
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null)
    }

    document.addEventListener("pointerdown", dismissOutside)
    document.addEventListener("keydown", dismissWithEscape)
    return () => {
      document.removeEventListener("pointerdown", dismissOutside)
      document.removeEventListener("keydown", dismissWithEscape)
    }
  }, [])

  if (!isOrbitLayoutSuitable(items.length)) {
    return (
      <div className="orbit-unsupported" role="status">
        此环形模板仅适用于 1–9 张图片，请改用网格或画廊组件。
      </div>
    )
  }

  const groups = splitOrbitItems(items)
  const dismiss = (id: string) => {
    setActive((current) => (current?.id === id ? null : current))
  }

  return (
    <div
      className={`orbit-stage${reducedMotion ? " is-reduced-motion" : ""} ${className}`.trim()}
    >
      <div ref={layerRef} className="orbit-layer" aria-label="环形图片浏览">
        <OrbitingCircles
          radius={outerRadius}
          iconSize={outerSize}
          className="orbit-node"
        >
          {groups.outer.map((item) => (
            <OrbitImageButton
              key={item.id}
              item={item}
              active={active?.id === item.id}
              onActivate={setActive}
              onDismiss={dismiss}
            />
          ))}
        </OrbitingCircles>

        {groups.inner.length > 0 && (
          <OrbitingCircles
            radius={innerRadius}
            iconSize={innerSize}
            reverse
            speed={2}
            className="orbit-node"
          >
            {groups.inner.map((item) => (
              <OrbitImageButton
                key={item.id}
                item={item}
                active={active?.id === item.id}
                onActivate={setActive}
                onDismiss={dismiss}
              />
            ))}
          </OrbitingCircles>
        )}
      </div>

      <div className="orbit-center" aria-hidden="true">
        <span>{centerLabel}</span>
        <small>{centerCaption}</small>
      </div>

      {active && (
        <article
          key={active.id}
          id="orbit-destination-detail"
          className="orbit-detail"
          role="dialog"
          aria-label={`${active.title}详情`}
          aria-live="polite"
        >
          <div className="orbit-detail__media">
            <SafeImage
              src={active.image}
              alt={`${active.title}风景`}
              fallback="图像暂不可用"
            />
          </div>
          <div className="orbit-detail__copy">
            <p>{active.eyebrow}</p>
            <h2>{active.title}</h2>
            <span>{active.description}</span>
          </div>
        </article>
      )}
    </div>
  )
}
