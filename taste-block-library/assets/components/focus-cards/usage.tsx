import { useState } from 'react';
import { FocusCards } from './focus-cards';
import { tourCards, hotelCards } from './data';

export default function App() {
  const [scene, setScene] = useState<'tour' | 'hotel'>('tour');
  const [count, setCount] = useState<number>(8);

  const currentDataset = scene === 'tour' ? tourCards : hotelCards;
  const activeCards = currentDataset.slice(0, count);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center py-8 px-4 sm:px-6">
      <div className="w-full max-w-5xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            {scene === 'tour' ? '自然影像测试' : '空间影像测试'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            移动端 2×2 网格 · 点击聚焦 · 滑动分页
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="bg-slate-900 border border-white/10 rounded-full p-0.5 flex items-center">
            <button
              onClick={() => setScene('tour')}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                scene === 'tour' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              自然影像
            </button>
            <button
              onClick={() => setScene('hotel')}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                scene === 'hotel' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              空间影像
            </button>
          </div>

          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="bg-slate-900 border border-white/15 text-slate-200 text-xs rounded-lg px-2.5 py-1 outline-hidden"
          >
            <option value={2}>2 张（测试数量）</option>
            <option value={3}>3 张（测试数量）</option>
            <option value={4}>4 张（测试数量）</option>
            <option value={6}>6 张（测试数量）</option>
            <option value={8}>8 张（测试数量）</option>
            <option value={12}>12 张（测试数量）</option>
          </select>
        </div>
      </div>

      <div className="w-full max-w-5xl">
        <FocusCards cards={activeCards} />
      </div>

      <div className="w-full max-w-5xl mt-8 pt-4 border-t border-dashed border-white/10 flex items-center justify-between text-slate-500 text-xs">
        <span>FocusCards Pattern Fixture</span>
        <span>3:4 比例 · 固定间距</span>
      </div>
    </div>
  );
}
