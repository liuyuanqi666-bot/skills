import type { ReactNode } from 'react';

/**
 * 通用业务卡片数据实体接口
 * 支持酒店、目的地线路、房产、电商等多业务场景扩展
 */
export interface FocusCardItem {
  id?: string | number;
  title: string;
  src: string;
  price?: string;
  subtitle?: string;
  badge1?: string;
  badge2?: string;
  tags?: string[];
  highlights?: string;
  footerLabel?: string; // 线路行程或酒店地址
  ctaText?: string;
  onCtaClick?: () => void;
  meta?: Record<string, any>;
  /**
   * 自定义详情插槽渲染函数
   */
  renderCustomDetails?: (item: FocusCardItem, isHovered: boolean) => ReactNode;
}

export interface FocusCardsProps<T extends FocusCardItem = FocusCardItem> {
  cards: T[];
  className?: string;
  /**
   * 卡片实体标准长宽比，默认 '3/4'
   */
  aspectRatio?: string;
  /**
   * 移动端单页卡片容量（默认 4 张，构成 2x2 结构）
   */
  mobilePageSize?: number;
  /**
   * 桌面端单页卡片容量（默认 6 张，构成 3 列 x 2 行结构）
   */
  desktopPageSize?: number;
  /**
   * 是否在超出容量时启用优雅切换 UI（默认 true）
   */
  enablePagination?: boolean;
  /**
   * 移动端是否支持手势滑动翻页（默认 true）
   */
  enableSwipe?: boolean;
  /**
   * 全局自定义详情内容渲染
   */
  renderCustomDetails?: (card: T, isHovered: boolean) => ReactNode;
}
