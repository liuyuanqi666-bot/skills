import { useEffect, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "../../../shared/utils"

export type ImagesBadgeProps = {
  text: string
  images: string[]
  className?: string
  folderSize?: { width: number; height: number }
  teaserImageSize?: { width: number; height: number }
  hoverImageSize?: { width: number; height: number }
  hoverTranslateY?: number
  hoverSpread?: number
  hoverRotation?: number
}

export function ImagesBadge({
  text,
  images,
  className,
  folderSize = { width: 32, height: 24 },
  teaserImageSize = { width: 20, height: 14 },
  hoverImageSize = { width: 48, height: 32 },
  hoverTranslateY = -35,
  hoverSpread = 20,
  hoverRotation = 15,
}: ImagesBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const reduceMotion = useReducedMotion()
  const showHoverState = isHovered && canHover && !reduceMotion
  const displayImages = images.slice(0, 3)
  const tabWidth = folderSize.width * 0.375
  const tabHeight = folderSize.height * 0.25

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)")
    const update = () => setCanHover(query.matches)
    update()
    query.addEventListener("change", update)
    return () => query.removeEventListener("change", update)
  }, [])

  return (
    <span
      className={cn("inline-flex items-center gap-2 perspective-[1000px] transform-3d", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.span
        className="relative"
        style={{ width: folderSize.width, height: folderSize.height, transformStyle: "preserve-3d" }}
      >
        <span className="absolute inset-0 rounded-[4px] bg-gradient-to-b from-amber-400 to-amber-500 shadow-sm">
          <span
            className="absolute left-0.5 rounded-t-[2px] bg-gradient-to-b from-amber-300 to-amber-400"
            style={{ top: -tabHeight * 0.65, width: tabWidth, height: tabHeight }}
          />
        </span>

        {displayImages.map((image, index) => {
          const total = displayImages.length
          const rotation = total === 1 ? 0 : total === 2 ? (index - 0.5) * hoverRotation : (index - 1) * hoverRotation
          const hoverY = hoverTranslateY - (total - 1 - index) * 3
          const hoverX = total === 1 ? 0 : total === 2 ? (index - 0.5) * hoverSpread : (index - 1) * hoverSpread
          const teaseY = -(hoverImageSize.height - teaserImageSize.height) - 4 - (total - 1 - index)
          const teaseRotation = total === 1 ? 0 : total === 2 ? (index - 0.5) * 3 : (index - 1) * 3
          const teaserScaleX = teaserImageSize.width / hoverImageSize.width
          const teaserScaleY = teaserImageSize.height / hoverImageSize.height

          return (
            <motion.span
              key={image}
              className="document-preview absolute top-0.5 left-1/2 origin-bottom"
              animate={{
                x: `calc(-50% + ${showHoverState ? hoverX : 0}px)`,
                y: showHoverState ? hoverY : teaseY,
                rotate: showHoverState ? rotation : teaseRotation,
              }}
              transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32, mass: 0.55 }}
              style={{ width: hoverImageSize.width, height: hoverImageSize.height, zIndex: 10 + index }}
            >
              <motion.span
                data-preview-fallback={`FILE ${index + 1}`}
                className="document-preview-surface absolute inset-0 origin-bottom overflow-hidden rounded-[3px] bg-white shadow-sm ring-1 shadow-black/10 ring-black/10"
                animate={{
                  scaleX: showHoverState ? 1 : teaserScaleX,
                  scaleY: showHoverState ? 1 : teaserScaleY,
                }}
                transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32, mass: 0.55 }}
              >
                <img src={image} alt="" onError={(event) => { event.currentTarget.hidden = true }} />
              </motion.span>
            </motion.span>
          )
        })}

        <motion.span
          className="absolute inset-x-0 bottom-0 h-[85%] origin-bottom rounded-[4px] bg-gradient-to-b from-amber-300 to-amber-400 shadow-sm"
          animate={{ rotateX: showHoverState ? -45 : -25, scaleY: showHoverState ? 0.8 : 1 }}
          transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 500, damping: 32, mass: 0.55 }}
          style={{ transformStyle: "preserve-3d", zIndex: 20 }}
        >
          <span className="absolute top-1 right-1 left-1 h-px bg-amber-200/50" />
        </motion.span>
      </motion.span>

      <span className="text-sm font-medium text-neutral-700">{text}</span>
    </span>
  )
}
