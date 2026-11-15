import { CanvasRevealStorySlider } from "./CanvasRevealStorySlider";

// 演示舞台（深色底 + 居中）：.preview-page 是 usage 的外壳，不属于组件本体。
// 放进业务页时可以去掉外壳，直接渲染 <CanvasRevealStorySlider />。
export default function Usage() {
  return (
    <main className="preview-page">
      <CanvasRevealStorySlider />
    </main>
  );
}
