import { ExpandableCardDemo, defaultCards } from "./ExpandableCardDemo";
import hills from "../../public/images/travel-landscape-svg/green-hills.svg";
import forest from "../../public/images/travel-landscape-svg/forest.svg";
import coast from "../../public/images/travel-landscape-svg/coast.svg";
import lake from "../../public/images/travel-landscape-svg/lake.svg";
const photos = [hills, forest, coast, lake];
const items = defaultCards.map((card, i) => ({ ...card, src: photos[i % photos.length],
  title: i < 2 ? "山间旅居 · 示例" : "沿途旅居 · 示例 " + (i + 1),
  description: "通用住宿展示资料，用于检查窄屏换行和重复文案之间的独立动画。",
  content: () => <><p className="hotel-notice">以下为通用演示资料，请在实际项目中替换成已核实的内容。</p><h4 className="hotel-list-title">空间与设施</h4><div className="hotel-name-list">{["庭院","阅读区","早餐厅","步行路线","观景空间"].map(name=><span key={name}>{name}</span>)}</div><p>展开后可阅读完整资料。图片预留尺寸，向下滚动查看，再关闭回到原来的列表位置。</p>{[1,2].map(n=><img key={n} className="hotel-detail-photo" src={photos[(i+n)%photos.length]} width={720} height={423} loading="lazy" alt="通用风景示意"/>)}</>
}));
export default function App() { return <main><header style={{padding:'48px 24px',textAlign:'center'}}><h1>精选旅居</h1><p>当前修复版 · 点击条目查看完整资料</p></header><ExpandableCardDemo items={items}/><footer style={{padding:'24px',textAlign:'center'}}>后续章节</footer></main>; }
