import { CardStack, CardStackItem } from './components/ui/card-stack';

const ITEMS: CardStackItem[] = [
  {id: 1, name: '自然与空间 · 示例 1', designation: '地点与服务资料待补充', tag: '演示素材', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。'},
  {id: 2, name: '自然与空间 · 示例 2', designation: '地点与服务资料待补充', tag: '演示素材', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。'},
  {id: 3, name: '自然与空间 · 示例 3', designation: '地点与服务资料待补充', tag: '演示素材', image: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=900&q=80', content: '此卡片用于测试层叠、循环与文字高度。正式名称和服务说明待提供，不作为旅游产品承诺。'}
];

// 外层是演示舞台：垂直居中（min-h-svh 是演示尺寸，放进业务页可去掉）+ 上下留白 py-14。
// 叠放的后排卡片会向上探出，组件顶部必须留出空间，不要贴着页面顶端。
export default function App({ items = ITEMS }: { items?: CardStackItem[] } = {}) {
  return (
    <div className="flex min-h-svh items-center justify-center px-4 py-14">
      <div className="w-full">
        <CardStack items={items} clickToAdvance={true} autoplay={true} />
      </div>
    </div>
  );
}
