import { StickyScroll, type StickyScrollProps } from "./components/ui/sticky-scroll-reveal";
import scene0 from "../../public/images/travel-landscape-svg/green-hills.svg";
import scene1 from "../../public/images/travel-landscape-svg/forest.svg";
import scene2 from "../../public/images/travel-landscape-svg/coast.svg";
import scene3 from "../../public/images/travel-landscape-svg/glacier.svg";
import scene4 from "../../public/images/travel-landscape-svg/lake.svg";
import scene5 from "../../public/images/travel-landscape-svg/stars.svg";
const scenes = [{title:"青丘", image:scene0},{title:"森林", image:scene1},{title:"海岸", image:scene2},{title:"冰川", image:scene3}];
export const content = scenes.map((scene, index) => ({title: scene.title, description: "这里放置与图片对应的叙述文字。可用于介绍目的地特色、体验亮点或产品细节；每一个节点围绕一个清晰主题展开，随滚动切换相应画面。", bgImage:scene.image, content:<div className="relative h-full w-full bg-slate-900"><img src={scene.image} alt={scene.title} width={720} height={423} className="h-full w-full object-cover" /><span className="absolute bottom-4 left-4 text-white">{String(index+1).padStart(2,"0")} · {scene.title}</span></div>}));
export function StickyScrollRevealDemo(props: Partial<StickyScrollProps>) { return <div className="w-full"><StickyScroll content={content} {...props}/></div>; }
