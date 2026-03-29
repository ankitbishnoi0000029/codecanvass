import type { ElementType } from 'react';

export type HeadingProps = {
  title: string;
  description?: string | null;
  as?: ElementType;
  align?: 'left' | 'center' | 'right';
  className?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

export interface dataType {
  id: number;
  url_id: number;
  name?: string;
  urlName: string;
  yrl: string;
  des: string;
  keyword: string;
  metadata?: string;
  route: string;
  FAQ?: string;
  icon?: string;
  bottom_des?: string;
  code?: string;
  content?: string;
}

export interface fromDataType {
  id?: number;
  url_id?: string;
  name?: string;
  urlName?: string;
  des: string;
  keyword: string;
  category?: string;
  metaData?: string;
  FAQ?: string;
  route?: string;
  url?: string;
}

export interface MetaData {
  title: string;
  description: string;
  keywords: string;
  // OG Tags
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogType: string;
  ogUrl: string;
  // Page Content
  pageContent: string;
  // Image
  imageAlt: string;
  imageFileName: string;
  // URL
  urlSlug: string;
}
export interface CategoryItem {
  id: string;
  name: string;
  // icon: LucideIcon;
}

export interface Category {
  id: string | number;
  name: string;
}

export interface Subcategory {
  id: string | number;
  route: string;
  name: string;
  category_id: string | number;
}
