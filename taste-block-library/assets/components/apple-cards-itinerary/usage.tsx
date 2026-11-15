import { Carousel, Card, type CardData, type ItineraryItem } from "./components/ui/apple-cards-carousel";
import { ItineraryDetailContent } from "./components/ui/itinerary-detail-content";

export function App() {
  const itineraryData: ItineraryItem[] = [
    {
      dayBadge: "Day 01",
      destination: "拉萨 · 初见圣城",
      subtitle: "日光倾城，慢调适应高原本真节奏",
      tagline: "海拔 3,650 米 · 静心适应日",
      src: "/images/urban.jpg",
      summary:
        "飞抵贡嘎国际机场，专车接送入住拉萨奢选供氧酒店。首日不做剧烈运动，悠闲漫步八廓街转经道，品尝甜茶，感受日光之城的从容与神圣。",
      transport: {
        mode: "专车接机",
        detail: "别克GL8/考斯特VIP商务车，配专业高原司机与弥散供氧",
      },
      stay: {
        hotel: "拉萨瑞吉度假酒店",
        roomType: "豪华雪景供氧客房（含全天候弥散供氧系统）",
      },
      meals: {
        breakfast: "自理 / 机上简餐",
        lunch: "自理",
        dinner: "酒店定制欢迎晚宴 · 藏式融合料理",
      },
      highlights: [
        "专属贵宾通道接机，贴心奉上洁白哈达与高原本草饮品",
        "八廓街慢步缓行，体验玛吉阿米下午茶与慢调时光",
        "专业随团管家全天候血氧监测，确保高原平稳适应",
      ],
      gallery: [
        {
          src: "/images/urban.jpg",
          caption: "日光倾城的八廓街转经道，信仰与市井温润交织",
        },
        {
          src: "/images/mountains.jpg",
          caption: "远眺念青唐古拉山余脉，天际线尽显巍峨苍茫",
        },
      ],
    },
    {
      dayBadge: "Day 02",
      destination: "布达拉宫 & 大昭寺",
      subtitle: "红白交错的信仰之巅，千年法音回响",
      tagline: "世界文化遗产 · 核心人文朝圣",
      src: "/images/mountains.jpg",
      summary:
        "深入布达拉宫红白两殿，在金顶与壁画间聆听松赞干布的史诗；午后拜谒大昭寺释迦牟尼12岁等身佛像，见证万千信众长跪祈愿的震撼力量。",
      transport: {
        mode: "VIP 市内专属包车",
        detail: "点对点直达核心景区，避开拥挤人群专属通道",
      },
      stay: {
        hotel: "拉萨瑞吉度假酒店",
        roomType: "豪华雪景供氧客房",
      },
      meals: {
        breakfast: "酒店自助中西早餐",
        lunch: "拉萨厨房 · 藏尼特色风味餐",
        dinner: "自理（推荐品尝光明港琼甜茶与藏面）",
      },
      highlights: [
        "专家级文博学者全程深度导览，解读千年壁画密码",
        "大昭寺金顶俯瞰拉萨全城，打卡摄影师私藏机位",
        "尊享布宫绿色通道快速入内，尊崇礼遇免排长队",
      ],
      gallery: [
        {
          src: "/images/mountains.jpg",
          caption: "布达拉宫耸立红山之巅，千载岁月依旧夺目璀璨",
        },
        {
          src: "/images/urban.jpg",
          caption: "大昭寺前长明酥油灯，静静燃烧着虔诚与平静",
        },
      ],
    },
    {
      dayBadge: "Day 03",
      destination: "羊卓雍措 · 冠绝藏南",
      subtitle: "珊瑚般的绿松石圣湖，神女散落的绿宝石",
      tagline: "海拔 4,441 米 · 极致视听盛宴",
      src: "/images/desert.jpg",
      summary:
        "翻越海拔4998米的岗巴拉山口，俯瞰羊卓雍措如碧玉般蜿蜒在群山怀抱。湖水在日光折射下幻化出孔雀蓝、翡翠绿的多层渐变，美至窒息。",
      transport: {
        mode: "四驱越野车 / 高原商务车",
        detail: "拉萨 - 岗巴拉山口 - 羊湖环湖 - 浪卡子，全程约 180 公里",
      },
      stay: {
        hotel: "日喀则希尔顿酒店",
        roomType: "行政观景供氧套房",
      },
      meals: {
        breakfast: "酒店自助早餐",
        lunch: "羊湖观景餐厅 · 藏式暖心土鸡汤锅",
        dinner: "日喀则特色藏餐厅",
      },
      highlights: [
        "岗巴拉山口全景私享机位，专属航拍纪念短视频",
        "湖畔零距离接触温驯藏獒与白牦牛，沉浸式互动拍照",
        "远眺卡若拉冰川舌部的洁白与壮丽，感受万年寒冰之息",
      ],
      gallery: [
        {
          src: "/images/desert.jpg",
          caption: "羊卓雍措蜿蜒曲折的湖岸线，如同高原上的蓝宝石丝带",
        },
        {
          src: "/images/mountains.jpg",
          caption: "岗巴拉山口风马旗迎风猎猎，祈福万千生灵安康",
        },
      ],
    },
    {
      dayBadge: "Day 04",
      destination: "扎什伦布寺 · 后藏腹地",
      subtitle: "班禅驻锡之地，红墙金顶下的后藏厚重历史",
      tagline: "国家 5A 级景区 · 格鲁派六大寺之一",
      src: "/images/neon.jpg",
      summary:
        "参访后藏最大的黄教寺庙扎什伦布寺，瞻仰世界最大的室内铜铸强巴佛。漫步在幽深的白色院墙与红色殿堂间，听辩经台上传来的拍手与辩思。",
      transport: {
        mode: "日喀则市内接驳商务车",
        detail: "寺庙专属落客点，管家全程随行协助导引",
      },
      stay: {
        hotel: "日喀则希尔顿酒店",
        roomType: "行政观景供氧套房",
      },
      meals: {
        breakfast: "酒店自助早餐",
        lunch: "后藏风情私厨 · 烤藏香猪与手抓羊肉",
        dinner: "酒店全日制餐厅",
      },
      highlights: [
        "特别安排扎寺资深喇嘛带领转寺，获赠开光金刚结",
        "观摩后藏僧侣极富张力与智慧的辩经仪式",
        "打卡扎寺最美红墙转经道，光影交错极具出片感",
      ],
      gallery: [
        {
          src: "/images/neon.jpg",
          caption: "夕阳斜照下的扎什伦布寺金顶，熠熠生辉庄严肃穆",
        },
        {
          src: "/images/urban.jpg",
          caption: "红白相间的僧舍小巷，阳光拉出长长静谧的身影",
        },
      ],
    },
    {
      dayBadge: "Day 05",
      destination: "纳木错 · 念青唐古拉的私语",
      subtitle: "天湖如镜，海拔4718米的纯净苍穹",
      tagline: "西藏三大圣湖之首 · 绝美天际线",
      src: "/images/forest-lake.jpg",
      summary:
        "穿行藏北辽阔草原，直抵纳木错扎西半岛。湖水与长天一色，水际线处与念青唐古拉雪山遥相辉映，如同置身世界尽头的梦幻秘境。",
      transport: {
        mode: "定制舒适越野车",
        detail: "当雄 - 那根拉山口（海拔5190米） - 扎西半岛，约 160 公里",
      },
      stay: {
        hotel: "当雄温德姆花园酒店 / 返回拉萨香格里拉",
        roomType: "高级观景大床房",
      },
      meals: {
        breakfast: "酒店自助早餐",
        lunch: "当雄原生态牦牛肉特色汤锅",
        dinner: "拉萨藏家宴 · 告别晚宴（品尝青稞酒与酥油茶）",
      },
      highlights: [
        "翻越那根拉山口，迎着劲风向圣湖奉献五彩风马纸",
        "漫步扎西半岛合掌石与迎宾石，聆听千百年的动人传说",
        "傍晚时分守候圣湖绝美日落金山，捕获绝美倒影大片",
      ],
      gallery: [
        {
          src: "/images/forest-lake.jpg",
          caption: "念青唐古拉山脚下如梦似幻的蔚蓝湖面",
        },
        {
          src: "/images/forest-canopy.jpg",
          caption: "藏北高原绿意盎然的天然草甸与成群悠闲的牦牛",
        },
        {
          src: "/images/forest-road.jpg",
          caption: "通往圣湖的笔直公路，伸向无边无际的群山之巅",
        },
      ],
    },
    {
      dayBadge: "Day 06",
      destination: "扎西德勒 · 踏上归途",
      subtitle: "带着雪域高原的祝福，满载回忆温暖返程",
      tagline: "行程圆满 · 依依惜别",
      src: "/images/forest-canopy.jpg",
      summary:
        "睡到自然醒，在酒店享用悠闲早餐。根据您的航班时间，专属管家专车送抵贡嘎机场，赠送西藏非遗文创随手礼，期待与您的下一次雪域相聚。",
      transport: {
        mode: "专车送机",
        detail: "拉萨市区至贡嘎国际机场，走拉萨机场高速直达",
      },
      stay: {
        hotel: "温馨的家",
        roomType: "甜蜜归宿",
      },
      meals: {
        breakfast: "酒店中西式精致早餐",
        lunch: "视航班自理",
        dinner: "自理",
      },
      highlights: [
        "赠送拉萨文创定制唐卡明信片与非遗手作藏香礼盒",
        "送机管家协助快速办理登机牌与行李托运手续",
        "全程专业摄影师精修底片 15 张打包赠送，永久珍藏",
      ],
      gallery: [
        {
          src: "/images/forest-canopy.jpg",
          caption: "飞机升空俯瞰雅鲁藏布江河谷，壮丽河川依依道别",
        },
        {
          src: "/images/urban.jpg",
          caption: "带走一缕缕青稞香气，让雪域圣洁的感动长存心间",
        },
      ],
    },
  ];

  const cards: CardData[] = itineraryData.map((item) => ({
    category: item.dayBadge,
    title: item.destination,
    src: item.src,
    content: <ItineraryDetailContent item={item} />,
  }));

  const carouselItems = cards.map((card, index) => (
    <Card key={card.src + index} card={card} index={index} />
  ));

  return (
    <div className="w-full min-h-screen bg-[#FBFBFD] text-[#1D1D1F] pt-8 pb-16 md:pt-12 md:pb-20 selection:bg-neutral-200">
      {/* Page Header Section - Apple Pro Typography & Rhythm */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-2 md:mb-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[11px] font-semibold tracking-widest uppercase text-neutral-600 dark:text-neutral-300 mb-4 border border-neutral-200/60">
          <span>西藏圣域深度行 · 6天5晚</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-[-0.035em] text-[#1D1D1F] leading-[1.08] max-w-4xl">
          逐日日程画卷，
          <br className="hidden sm:inline" />
          触碰雪域高原本真光芒。
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-neutral-500 max-w-2xl leading-relaxed">
          左右滑动探索每日行进坐标。轻点任意卡片，即刻展开沿途目的地、专属交通、尊奢下榻、特色风味与高清实景图集。
        </p>
      </div>

      {/* Apple Cards Carousel */}
      <Carousel items={carouselItems} />

      {/* Bottom Features Footnote */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 pt-4 md:mt-10 md:pt-8 border-t border-neutral-200/60">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 text-xs text-neutral-500">
          <div>
            <div className="font-semibold text-neutral-800 mb-1">随车制氧系统</div>
            <div>全线配备医用级弥散制氧机与便携氧气，告别高反困扰</div>
          </div>
          <div>
            <div className="font-semibold text-neutral-800 mb-1">尊崇绿色通道</div>
            <div>布达拉宫免排长队直通，大昭寺金顶优先参观机位</div>
          </div>
          <div>
            <div className="font-semibold text-neutral-800 mb-1">精选地道风味</div>
            <div>鲁朗石锅鸡、藏式特色烤肉与瑞吉晚宴全程严选</div>
          </div>
          <div>
            <div className="font-semibold text-neutral-800 mb-1">无忧退改保障</div>
            <div>因高原身体不可抗力未产生费用按合同全额退款</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
