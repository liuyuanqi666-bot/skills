import { FocusCardItem } from './types';
import image0 from "../../public/images/canvas-reveal-travel-narrative/mountain-route.webp";
import image1 from "../../public/images/canvas-reveal-travel-narrative/local-table.webp";
import image2 from "../../public/images/canvas-reveal-travel-narrative/mountain-lodge.webp";
const images=[image0,image1,image2];
export const tourCards: FocusCardItem[] = Array.from({length:12},(_,i)=>({
  id:`sample-${i}`, title:`自然影像 ${String(i+1).padStart(2,'0')}`,
  src:images[i%3],
  badge1:'演示资料', badge2:'服务待补充', tags:['测试内容'],
  highlights:'用于测试聚焦、文字展开及分页效果。正式产品内容待提供。',
  footerLabel:'地点资料待补充', ctaText:'测试详情'
}));
export const hotelCards: FocusCardItem[] = tourCards.map((c,i)=>({...c,id:`hotel-${i}`,title:`空间影像 ${String(i+1).padStart(2,'0')}`}));
