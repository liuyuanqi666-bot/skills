import assert from "node:assert/strict"

import {
  MAX_ORBIT_ITEMS,
  isOrbitLayoutSuitable,
  splitOrbitItems,
} from "../src/orbit-layout.ts"

for (let count = 1; count <= MAX_ORBIT_ITEMS; count += 1) {
  const items = Array.from({ length: count }, (_, index) => index)
  const groups = splitOrbitItems(items)

  assert.equal(groups.outer.length + groups.inner.length, count)
  assert.ok(groups.outer.length >= 1 && groups.outer.length <= 5)
  assert.ok(groups.inner.length <= 4)
  assert.deepEqual([...groups.outer, ...groups.inner], items)
}

assert.equal(isOrbitLayoutSuitable(0), false)
assert.equal(isOrbitLayoutSuitable(10), false)
assert.throws(() => splitOrbitItems(Array.from({ length: 10 })), RangeError)

console.log("Counts 1-9 pass; count 10 is rejected as unsuitable.")
