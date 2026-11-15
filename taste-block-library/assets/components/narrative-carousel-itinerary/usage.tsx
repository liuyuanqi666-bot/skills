"use client";
import greenHillsImage from "../../public/images/travel-landscape-svg/green-hills.svg?url";
import forestImage from "../../public/images/travel-landscape-svg/forest.svg?url";
import starsImage from "../../public/images/travel-landscape-svg/stars.svg?url";
import coastImage from "../../public/images/travel-landscape-svg/coast.svg?url";
import glacierImage from "../../public/images/travel-landscape-svg/glacier.svg?url";
import lakeImage from "../../public/images/travel-landscape-svg/lake.svg?url";

import Carousel, { type ItinerarySlideData } from "./components/ui/carousel";

export default function App() {
  const itineraryData: ItinerarySlideData[] = [
    {
      day: 1,
      dayTitle: "云山初霁 · 隐入杉林",
      theme: "抵达成山 · 私汤洗尘",
      button: "查阅首日日程",
      src: greenHillsImage,
      transportSummary: "专车接机至营地",
      hotelSummary: "高山树屋私汤房",
      mealSummary: "当季云雾鲜竹笋宴",
      nodes: [
        {
          time: "14:00",
          location: "高山树屋营地",
          summary: "专属管家接引办理入住，享用在地古法高山云雾茶洗尘。",
          type: "hotel",
        },
        {
          time: "16:30",
          location: "原始云杉林步道",
          summary: "自然学者带领轻量森林漫步，辨识高山冷杉与野生苔藓群落。",
          type: "scenic",
        },
        {
          time: "19:00",
          location: "山峦全景餐厅",
          summary: "品尝当季鲜采高山竹笋宴与柴火慢炖山林土鸡暖锅。",
          type: "meal",
        },
      ],
      tips: "山间傍晚温差显著，建议随身携带防风保暖外套。",
    },
    {
      day: 2,
      dayTitle: "霓虹巡游 · 都会脉动",
      theme: "摩登探索 · 艺术弄潮",
      button: "查阅次日日程",
      src: forestImage,
      transportSummary: "商务礼宾专车",
      hotelSummary: "天际丽思行政套房",
      mealSummary: "米其林黑松露晚宴",
      nodes: [
        {
          time: "10:00",
          location: "当代艺术中心",
          summary: "特邀策展人专场闭馆导览，深度解析现代建筑与光影装置。",
          type: "scenic",
        },
        {
          time: "14:30",
          location: "老法租界林荫道",
          summary: "穿行梧桐树荫，寻访百年老洋房历史印记与精品咖啡工坊。",
          type: "transport",
        },
        {
          time: "18:30",
          location: "68层天际酒廊",
          summary: "俯瞰都会日落流光，品鉴主厨特调分子鸡尾酒与黑松露美馔。",
          type: "meal",
        },
      ],
      tips: "艺术中心闭馆专场需提前核验预约二维码入场。",
    },
    {
      day: 3,
      dayTitle: "长夜未央 · 赛博幻影",
      theme: "在地夜行 · 深夜食堂",
      button: "查阅第三日日程",
      src: starsImage,
      transportSummary: "城市复古有轨电车",
      hotelSummary: "工业设计精品酒店",
      mealSummary: "深夜炭火烧鸟居酒屋",
      nodes: [
        {
          time: "15:00",
          location: "旧工业厂房改造区",
          summary: "探访地下黑胶唱片店与独立机械手作艺术工坊。",
          type: "scenic",
        },
        {
          time: "19:30",
          location: "霓虹海鲜长街",
          summary: "体验市井烟火气息的炭火海鲜烧烤与深海生鲜巡礼。",
          type: "meal",
        },
        {
          time: "22:00",
          location: "地下爵士声场",
          summary: "即兴爵士乐队专属卡座，沉浸于纯正蓝调声光夜色。",
          type: "scenic",
        },
      ],
      tips: "演出场地内严禁使用强光闪光灯设备。",
    },
    {
      day: 4,
      dayTitle: "大漠落日 · 荒原星河",
      theme: "沙海越野 · 苍穹篝火",
      button: "查阅第四日日程",
      src: coastImage,
      transportSummary: "硬派越野四驱车队",
      hotelSummary: "沙漠野奢帐篷营地",
      mealSummary: "大漠篝火烤全羊宴",
      nodes: [
        {
          time: "09:00",
          location: "四驱越野集结点",
          summary: "专业达喀尔车手指导，开启冲沙穿越无垠黄金沙脊之旅。",
          type: "transport",
        },
        {
          time: "17:30",
          location: "落日星空帐篷营地",
          summary: "见证落日将沙漠染为炽金，拍摄壮阔地平线剪影大片。",
          type: "hotel",
        },
        {
          time: "20:30",
          location: "深空天文观测台",
          summary: "大口径专业折射望远镜观测浩瀚银河星云与土星光环。",
          type: "scenic",
        },
      ],
      tips: "沙漠昼夜温差极大，夜间观星务必更换防寒羽绒服。",
    },
    {
      day: 5,
      dayTitle: "沙脊晨曦 · 戈壁行舟",
      theme: "驼铃送远 · 漫游沙丘",
      button: "查阅第五日日程",
      src: glacierImage,
      transportSummary: "全地形沙地探险车",
      hotelSummary: "戈壁古驿轻奢客栈",
      mealSummary: "胡杨林手抓羊肉午宴",
      nodes: [
        {
          time: "06:30",
          location: "沙丘高点观景台",
          summary: "静候初升朝阳洒满沙海，记录大漠第一缕金色晨光。",
          type: "scenic",
        },
        {
          time: "11:30",
          location: "千年胡杨林绿洲",
          summary: "漫步深邃古木林带，探寻古丝绸之路边关水井与石刻古迹。",
          type: "scenic",
        },
        {
          time: "18:00",
          location: "驿站风味小院",
          summary: "享用在地古法慢烤全羊排与时令野生哈密瓜果点。",
          type: "meal",
        },
      ],
      tips: "全天紫外线强烈，请做好高倍防晒与防风沙保护。",
    },
    {
      day: 6,
      dayTitle: "雪山绝壁 · 冰川探秘",
      theme: "巅峰仰望 · 冰雪奇境",
      button: "查阅第六日日程",
      src: lakeImage,
      transportSummary: "高山全驱保障车队",
      hotelSummary: "雪线景观观景木屋",
      mealSummary: "雪岭松茸暖心鸡煲",
      nodes: [
        {
          time: "08:30",
          location: "雪山索道下站",
          summary: "乘坐全景封闭式高空缆车直上海拔4500米冰川公园。",
          type: "transport",
        },
        {
          time: "13:00",
          location: "冰舌前沿徒步栈道",
          summary: "专业冰川向导陪同，近距离观察万年蓝冰洞与冰川漂砾遗迹。",
          type: "scenic",
        },
        {
          time: "19:30",
          location: "冰川壁炉餐厅",
          summary: "壁炉旁品鉴热红酒、高山冷水鳟鱼与现切鲜松茸土鸡锅。",
          type: "meal",
        },
      ],
      tips: "高海拔区域活动请保持节奏平缓，避免剧烈奔跑剧动。",
    },
    {
      day: 7,
      dayTitle: "云端别院 · 告别晚宴",
      theme: "归途行囊 · 峰回路转",
      button: "查阅尾日日程",
      src: greenHillsImage,
      transportSummary: "VIP专属送机礼宾专车",
      hotelSummary: "温馨温馨归程航班",
      mealSummary: "私厨定制主厨告别宴",
      nodes: [
        {
          time: "10:00",
          location: "高山植物标本室",
          summary: "挑选亲手压制的雪莲与高山野花书签，封装专属旅行纪念档案。",
          type: "scenic",
        },
        {
          time: "13:00",
          location: "云顶全景私厨",
          summary: "享用汇总了全程风味的特别定制告别午宴，回顾精彩定格瞬间。",
          type: "meal",
        },
        {
          time: "16:00",
          location: "国际机场贵宾通道",
          summary: "专属商务礼宾专车送达机场，专属地勤协办登机，顺利启程归家。",
          type: "transport",
        },
      ],
      tips: "请提前核对随身行李与证件，建议提前3小时抵达机场。",
    },
  ];
  return (
    <div className="relative overflow-hidden w-full min-h-screen py-16 flex items-center justify-center bg-[#0C0E12]">
      <Carousel slides={itineraryData} />
    </div>
  );
}
