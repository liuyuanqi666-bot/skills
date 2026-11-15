# 组件目录（自动生成，勿手改）

选型：看「何时用 / 避免」。取用：在目标项目根目录执行 `node "<库>/scripts/add.mjs" <name> <目标目录>`（`<库>` 是 SKILL.md 所在目录，详见 SKILL.md），踩坑与 CSS 约定见 `pitfalls.md`；完整机器可读信息（依赖版本、文件、图片、CSS 要求）见 `manifest.json`。

## section

| 名称 | 用途 | 何时用 | 避免 | 额外依赖 |
|---|---|---|---|---|
| `apple-cards-itinerary` | 苹果风逐日行程：横滑卡片 + 点开详情浮层(Bento/多图) | 4–8 天、每天内容丰富的完整行程章节 | 少于 3 张卡或简单列表；只要卡片动效时单独取 Card/Carousel | @tabler/icons-react, clsx, motion, tailwind-merge |
| `canvas-reveal-story-carousel` | 全幅图文轮播，WebGL 点阵揭幕切换 | 3–5 个以视觉为主的短故事(亮点/美食/住宿) | 详细行程、超过 5 章、不适合 WebGL 的环境 | @react-three/fiber, clsx, motion, tailwind-merge, three |
| `expandable-itinerary-card-grid` | 2×2 分页日程卡，选中卡居中，只展开下半部详情区 | 逐日图片行程：手机可直达某天、桌面分页浏览 | 可编辑日程、密集对比表、无法放固定浮层的页面 | motion |
| `frameless-cloud-shader-flight-hero` | 全幅旅游 Hero：WebGL 云海 + 漂浮机翼 + 锚点按钮 + 目的地预览 + 线路目录 | 要云海飞行氛围但不要舷窗边框的产品首屏 | 不适合 WebGL、只需静态 Banner、文案超出层级；要拱形舷窗边框改用 plane-window-cloud-shader-hero（二者同源，仅边框不同，别同页混用） | clsx, motion, tailwind-merge |
| `hero-parallax` | 封面 + 三轨滚动视差的图片叙事界面 | 首页、目的地、美食等以图片为主的展示 | 需要长文、详细行程或参数对比；它不是无限跑马灯 | motion |
| `immersive-media-card-stack-showcase` | 标题 + 说明 + 大图层叠卡片的完整展示章节 | 目的地、酒店空间、美食、路线亮点等摄影主导内容 | 文字密集的长文、对比表、20+ 图瀑布流 | clsx, motion, tailwind-merge |
| `plane-window-cloud-shader-hero` | 旅游 Hero：云海 + 机翼放进拱形舷窗框 | 要电影感开场和舷窗主题，附两个锚点、目的地预览、线路目录 | 不适合 WebGL、首屏不能太大、文案超过 2 行标题+3 行说明；不要舷窗边框的全幅版本用 frameless-cloud-shader-flight-hero（二者同源，别同页混用） | clsx, motion, tailwind-merge |
| `split-narrative-card-stack-section` | 左文右层叠卡的响应式分栏章节 | 卖点、酒店、美食、亮点、行程阶段的图文并列介绍 | 无文字的全幅媒体 Hero、多页文档、密集表格 | clsx, motion, tailwind-merge |
| `themed-3d-scene-gallery` | 全宽选中大图 Hero + 四轨 3D 滚动图墙，每图需配对比主题色 | 有 8–20 张图且能为每张预先配好渐变主题 | 图片少于 8 或多于 20、颜色无法预先分析、需连续阅读长文 | — |
| `tracing-narrative-showcase` | 标题 + 图文节点 + 滚动光束的叙事章节 | 景点导览、度假村设施、活动亮点、≤5 天短行程 | 密集日程表、超过 6 个节点、商品网格、无侧边留白 | clsx, motion, tailwind-merge |
| `vertical-counterflow-story-gallery` | 两列反向纵向滚动图墙 + 一块随悬停/点击更新的简短故事面板 | 4–20 张图需要轻柔浏览，配一段精炼文字 | 少于 4 张图、长文、任务型选择 | — |
| `webgl-chromatic-aberration-hero` | 全幅 Hero：指针驱动的 WebGL 色散倾斜 + 滚动玻璃导航 + 目录展开 + 回顶部 | 深色旅游/产品开场，一张风光图加微妙景深 | 图中有重要文字/UI、浅色主题(需调遮罩)、性能预算不容 WebGL | clsx, tailwind-merge |

## pattern

| 名称 | 用途 | 何时用 | 避免 | 额外依赖 |
|---|---|---|---|---|
| `animated-testimonials` | 3D 叠卡 + 逐词渐显的图文叙事卡 | 景点/美食/美宿/服务卖点的少量图文叙事 | 整页模板、大量文字、密集表格 | @tabler/icons-react, motion |
| `document-pack-preview-badge` | 文档包按钮：桌面扇形预览 3 张封面，点开列出全部可下载文件 | 多个相关文件(行程/签证/表格)合并成一个下载入口 | 只有一个文件、需先比较内容、下载需鉴权 | clsx, motion, tailwind-merge |
| `expandable-destination-card-grid` | 两列图片卡，共享元素动画展开成详情浮层 | 4–8 项以大图为主的目的地/酒店展示 | 文字为主、需并排比较、超过 10 项 | motion |
| `expandable-hotel-list` | 纵向图片条目，共享元素动画展开详情浮层 | 4–10 项精选酒店/目的地，不离开页面看详情 | 超过 12 项、表格对比、可编辑数据 | motion |
| `flexible-card-stack` | 可放图片或任意 React 内容的层叠卡片 | 轮播少量高亮点/评价/酒店设施卡(≤6) | 大数据集、多列列表、需同时比较 | clsx, motion, tailwind-merge |
| `focus-cards` | 3:4 图片卡网格：悬停时其余卡模糊，点开详情，支持分页 | 视觉优先的产品/行程/酒店/亮点展示 | 数据表格、纯文字列表、图片比例不固定 | — |
| `gooey-input` | 粘稠水滴融合的搜索框(SVG 模糊+阈值)，向右展开 | 顶栏搜索、线路/产品轻量检索 | 没有水平展开空间的窄表格单元格 | clsx, motion, tailwind-merge |
| `images-slider` | 全景图片背景滑块，3D 景深切换 | 全屏 Hero 背景、落地页尾屏、少字的图片叙事 | 密集表格/表单、需要长文阅读 | clsx, motion, tailwind-merge |
| `inset-border-button` | 深灰内描边胶囊按钮，悬停实色填充、文字变白 | 次要行动、播放/详情切换、中性高级感界面 | 页面唯一的核心转化按钮(应配主色按钮) | — |
| `interactive-fill-arrow-button` | 胶囊按钮：悬停时前导圆点扩成填充并把文字换成箭头，颜色走主题变量 | 需要一次紧凑悬停确认的链接式/行动按钮 | 纯图标按钮、高频工具栏、破坏性确认 | clsx, lucide-react, tailwind-merge |
| `invert-button` | Teal 反色翻转按钮，悬停背景与文字颜色互换 | ‘确定’‘切换筛选’等明确的主要操作 | 弱强调操作、多按钮紧挨的表单内 | — |
| `lit-up-borders-button` | 双层渐变霓虹边框按钮，悬停内层渐隐露出渐变边 | 首屏、促销、会员充值等高调 CTA | 朴素工具型应用、后台报表、阅读型版面 | — |
| `narrative-carousel-cinematic` | 纯图电影式轮播：3D 景深 + 指针视差 + 宽幅标题 | 图片主导、文字精简的目的地/酒店/品牌画卷 | 长详情、逐日行程、密集数据、键盘高频切换 | @tabler/icons-react |
| `narrative-carousel-flip` | 带按钮的图文轮播，卡片可 3D 翻到正反两面 | 一张主图配分类/说明/卖点标签的目的地、酒店、餐饮档案 | 只需纯图切换、超长文档、翻面会藏住关键操作 | @tabler/icons-react, clsx, lucide-react, tailwind-merge |
| `narrative-carousel-itinerary` | 四槽 DAY 导航 + 横向手势 + 3D 时间轴翻面的逐日行程轮播 | 旅游/研学/考察按天看主图、交通住宿餐食摘要、时间轴 | 单图 Hero、无逐日结构、需一次比较全部日期 | clsx, lucide-react, tailwind-merge |
| `spotify-pill-button` | Spotify 绿大圆角胶囊按钮，悬停微放大提亮 | 播放控制、主要购买转化、需吸睛的大按钮 | 紧凑列表行内操作、取消类按钮、严肃金融界面 | — |
| `sticky-scroll-reveal` | 滚动驱动：左侧叙事文字 + 右侧吸顶视觉卡 + 呼吸模糊背景 | 按步骤讲故事/产品特色/行程，每步一段文字配一张图 | 不可当独立章节模板；无配图、全幅独立幻灯片、数据看板 | clsx, motion, tailwind-merge |
| `tailwind-connect-button` | 暗色胶囊按钮，顶部径向泛光 + 底部发光光束 | 科技感/暗色主视觉的单一高优先级 CTA | 高密度工具栏、纯白背景、要求无光效的极简页 | — |

## effect

| 名称 | 用途 | 何时用 | 避免 | 额外依赖 |
|---|---|---|---|---|
| `aurora-background` | 连续极光渐变背景，支持三种蒙版 | Hero、页头、卡片的氛围背景 | 数据密集表格、需要纯平高对比的内容、低功耗环境 | clsx, tailwind-merge |
| `black-meteor-shower` | 浅色底上的黑色斜向流星 | 浅色 Hero/公告/标题卡的稀疏装饰动效 | 密集文字后、深色底(需改色)、任务反馈 | clsx, tailwind-merge |
| `bounded-focus-flip-card-pile` | 可自由拖拽的 3D 卡堆，选中卡飞到舞台中央放大并翻面看详情 | 少量图片集合，强调手感和逐项讲述 | 长/动态列表、排序数据、键盘优先、需原生滚动的页面 | motion |
| `celestial-sparkle-beam` | 激光光束 + 星尘粒子的深色背景光环 | 极光/观星/极地等星空主题页的收尾页 | 通用首页 Hero、浅色底、密集正文后 | @tsparticles/engine, @tsparticles/react, @tsparticles/slim, clsx, tailwind-merge |
| `chromatic-image-carousel` | 带色散与 3D 倾斜的图片轮播，可自动/手动切换 | 设计工作室、风光作品集、旅游展示的 Hero 轮播 | 文字多的幻灯片、无 WebGL 环境、需同时看全部项 | @tabler/icons-react, clsx, tailwind-merge |
| `continuous-dual-row-image-marquee` | 两行反向无缝滚动的图片卡，悬停/触摸显示文案 | 目的地、酒店、体验的图片带 | 任务型选择、长文案、每行少于 3 张图 | — |
| `flippable-itinerary-drag-card-stack` | 可拖拽循环叠卡，正面横拖切换，背面纵向滚动详情 | 3 天以上、先看图再看详情的逐日行程 | 需随机跳到某天、同时比较多天、编辑内容 | motion |
| `labeled-dual-row-image-marquee` | 同 continuous-dual-row-image-marquee，另加每行固定的极简标签 | 每行图片需要固定分类/编辑标识时 | 标签没有信息量时改用 continuous-dual-row-image-marquee；任务型选择、长文案 | — |
| `orbiting-image-details` | 1–2 圈环绕旋转的图片轨道，悬停/点击出方形详情卡 | 1–9 张目的地/景点/团队图片的装饰性总览 | 超过 9 项、任务型选择、长描述(改用网格/列表) | clsx, tailwind-merge |
| `recycling-drag-card-stack` | 横向拖拽叠卡：松手顶牌回弹并移到最后，下一张放大上位 | 少量目的地/产品/作品序列，强调直接操作 | 有序表单、任务型选择、需全部可见、少于 3 项 | motion |
| `shooting-stars-and-stars-background` | Canvas 闪烁星空 + SVG 流星的持续氛围背景 | 深色底(neutral-900/黑)的 Hero、标题横幅背后 | 浅色底(需反色)、密集文字页、当独立组件用 | — |
| `staggered-bouncing-dot-loader` | 三点纵向交错弹跳的加载动画，带无障碍状态与减少动态适配 | 异步加载、Suspense、路由等待 | 要显示百分比、需要文字说明(改用字符脉冲)、无 JS 环境 | motion |
| `staggered-character-pulse-loader` | 逐字缩放/透明度/阴影脉冲的文字加载动画 | 需要明确文字的加载提示(‘正在生成行程…’) | 无文字骨架屏、超长段落、不支持硬件加速的终端 | motion |
| `tracing-beam` | 沿内容容器随滚动延伸的 SVG 渐变光束 | 长文、时间线、案例、步骤指南的侧边引导线 | 横向滚动容器、短于 800px 的内容、无侧边留白的全幅布局 | clsx, motion, tailwind-merge |
| `vortex-particle-field` | 基于 simplex-noise 的粒子背景，含萤火预设 | 深色底卡片/Hero/夜景/萤火主题的氛围背景 | 当独立组件或完整章节用、浅色底、密集表格 | clsx, simplex-noise, tailwind-merge |

