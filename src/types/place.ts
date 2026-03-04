// src/types/place.ts

export interface Place {
  id: string | number;
  title?: string;
  desc?: string;
  address?: string;
  phone?: string;
  website?: string;
  category?: string;
  businessBanner?: string;
  businessLogo?: string;
  image?: string;
  area?: string;
  [key: string]: any;
}
