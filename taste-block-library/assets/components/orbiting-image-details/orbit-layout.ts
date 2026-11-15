export const MAX_ORBIT_ITEMS = 9

export function isOrbitLayoutSuitable(itemCount: number) {
  return Number.isInteger(itemCount) && itemCount >= 1 && itemCount <= MAX_ORBIT_ITEMS
}

export function splitOrbitItems<T>(items: readonly T[]) {
  if (!isOrbitLayoutSuitable(items.length)) {
    throw new RangeError(`Orbiting image details require 1-${MAX_ORBIT_ITEMS} items.`)
  }

  const outerCount = Math.min(5, Math.ceil((items.length * 5) / MAX_ORBIT_ITEMS))
  return {
    outer: items.slice(0, outerCount),
    inner: items.slice(outerCount),
  }
}
