import { useState } from 'react';
import { CardStack, CardStackItem } from './components/ui/card-stack';

const CARDS: CardStackItem[] = [
  {id: 1, name: '自然与空间 · 示例 1', designation: '地点与服务资料待补充', tag: '演示素材', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80'},
  {id: 2, name: '自然与空间 · 示例 2', designation: '地点与服务资料待补充', tag: '演示素材', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。', image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80'},
  {id: 3, name: '自然与空间 · 示例 3', designation: '地点与服务资料待补充', tag: '演示素材', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。', image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80'}
];

const GRADIENTS = {
  indigo: 'from-indigo-600 via-purple-600 to-pink-600',
  sunset: 'from-amber-600 via-rose-600 to-orange-500',
  forest: 'from-emerald-600 via-teal-600 to-cyan-600',
};

export default function App({ items = CARDS }: { items?: CardStackItem[] } = {}) {
  const [theme, setTheme] = useState<'indigo' | 'sunset' | 'forest'>('indigo');

  return (
    <div className="flex flex-col px-4 max-w-6xl mx-auto">
      <div className="flex justify-end gap-2 mb-4">
        {(['indigo', 'sunset', 'forest'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setTheme(k)}
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${theme === k ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}`}
          >
            {k}
          </button>
        ))}
      </div>

      <div className="bg-slate-50/70 border border-slate-200/90 rounded-3xl p-5 pb-3 sm:p-10 lg:p-12 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
            在山海与森林深处，<br />
            在<span className={`text-transparent bg-clip-text bg-gradient-to-r ${GRADIENTS[theme]}`}>灵动层叠中</span>重构诗意栖居
          </h1>
          <p className="text-sm text-slate-600 max-w-lg">
            此处组合标题、说明和层叠图片，检查不同屏幕上的间距与遮挡。图片仅作演示，实际产品名称和服务内容待提供。
          </p>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/70">
            <div>
              <div className="text-xl font-bold text-slate-900">待补充</div>
              <div className="text-xs text-slate-500">评价资料</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">待补充</div>
              <div className="text-xs text-slate-500">数量资料</div>
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">待补充</div>
              <div className="text-xs text-slate-500">服务资料</div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center mt-0 pb-0">
          <CardStack items={items} clickToAdvance={true} autoplay={true} />
        </div>
      </div>
    </div>
  );
}
