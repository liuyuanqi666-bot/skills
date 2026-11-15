import { CardStack, CardStackItem } from './components/ui/card-stack';

const GALLERY_CARDS: CardStackItem[] = [
  {id: 1, name: '自然与空间 · 示例 1', designation: '地点与服务资料待补充', tag: '演示素材', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80'},
  {id: 2, name: '自然与空间 · 示例 2', designation: '地点与服务资料待补充', tag: '演示素材', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=900&q=80'},
  {id: 3, name: '自然与空间 · 示例 3', designation: '地点与服务资料待补充', tag: '演示素材', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80'}
];

export default function App({ items = GALLERY_CARDS }: { items?: CardStackItem[] } = {}) {
  return (
    <div className="flex flex-col items-center px-4 max-w-5xl mx-auto text-center">
      <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 mb-3">
        DESTINATION GALLERY / 秘境风物
      </span>
      <h1 className="text-4xl font-extrabold text-slate-900 mb-3">
        四季光影 · 步入<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600">流动的自然画卷</span>
      </h1>
      <p className="w-full max-w-lg text-xs sm:text-sm text-slate-500 mb-4 sm:mb-6 px-2 sm:px-0">
        捕捉晨曦、薄雾与日暮下的旷野秘境，<br />轻触卡片即可探索不同纬度的极致风光与建筑美学。
      </p>

      <div className="w-full flex flex-col items-center justify-center mt-0">
        <CardStack items={items} clickToAdvance={true} autoplay={true} cardClassName="w-[290px] sm:w-[350px] md:w-[390px] text-left" />
        <div className="mt-2.5 sm:mt-3 inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-slate-50 text-[11px] text-slate-400 border border-slate-200/80">
          <span>点击卡片即可切换下一帧 · 自动循环放映中</span>
        </div>
      </div>
    </div>
  );
}
