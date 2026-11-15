export type GestureIntent = "idle" | "pending" | "horizontal" | "vertical";

const MOUSE_INTENT_THRESHOLD = 3;
const TOUCH_INTENT_THRESHOLD = 8;
const HORIZONTAL_DOMINANCE = 1.2;

export function classifyItineraryPointerIntent(
  deltaX: number,
  deltaY: number,
  isTouchPointer: boolean,
): GestureIntent {
  const horizontal = Math.abs(deltaX);
  const vertical = Math.abs(deltaY);
  const threshold = isTouchPointer ? TOUCH_INTENT_THRESHOLD : MOUSE_INTENT_THRESHOLD;
  const dominance = isTouchPointer ? HORIZONTAL_DOMINANCE : 1;

  if (Math.max(horizontal, vertical) < threshold) return "pending";
  if (horizontal > vertical * dominance) return "horizontal";
  return "vertical";
}
