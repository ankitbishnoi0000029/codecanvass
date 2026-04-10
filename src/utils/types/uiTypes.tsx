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

 // ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════
export interface EditorData {
  title: string;
  content: string;
  excerpt: string;
  description: string;
  faqs: { question: string; answer: string }[];
  slug: string;
  status: string;
  visibility: string;
  password: string;
  publishDate: string;
  categories: string[];
  tags: string[];
  featuredImage: string;
  allowComments: boolean;
  allowPingbacks: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  wordCount: number;
  charCount: number;
  format: string;
  author: string;
  template: string;
  customFields: { name: string; value: string }[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: string;
  canonicalUrl: string;
  readingTime: number;
}

export interface PageDataUI {
  id: number;
  title: string;
  slug: string; // url_id

  content: string;
  excerpt?: string;

  allowComments: boolean;
  allowPingbacks: boolean;

  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;

  wordCount: number;
  charCount: number;
  readingTime: number;

  format: string;
  author: string;
  template: string;

  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;

  twitterCard: string;
  canonicalUrl?: string;

  categories: string[];

  createdAt: string;
  updatedAt: string;
}


