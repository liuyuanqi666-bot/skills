import assert from "node:assert/strict";
import { classifyItineraryPointerIntent } from "../gesture-intent.ts";

assert.equal(classifyItineraryPointerIntent(5, 1, true), "pending");
assert.equal(classifyItineraryPointerIntent(12, 3, true), "horizontal");
assert.equal(classifyItineraryPointerIntent(9, 8, true), "vertical");
assert.equal(classifyItineraryPointerIntent(3, 4, true), "pending");
assert.equal(classifyItineraryPointerIntent(4, 1, false), "horizontal");
assert.equal(classifyItineraryPointerIntent(1, 4, false), "vertical");

console.log("Gesture intent checks passed.");
