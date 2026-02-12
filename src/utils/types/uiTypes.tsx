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
  name? : string ;
  urlName: string;
  yrl: string;
  des: string;
  keyword: string;
  metadata?: string;
  route? : string; 
  }

  export interface fromDataType{
     id?: number;
    url_id?: string;
    name? : string ;
    urlName?: string;
    des: string;
    keyword: string;
    category? : string;
    metaData?: string;
    route? : string; 
    url? : string; 

  }

  export interface MetaData {
    title?: string;
    description?: string;
    keywords?: string;
    ogImage?: string;
  }
  export interface CategoryItem {
    id: string;
    name: string;
    // icon: LucideIcon;
  }