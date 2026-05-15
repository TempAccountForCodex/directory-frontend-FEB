declare module "swiper/css";
declare module "swiper/css/free-mode";
declare module "swiper/css/pagination";
declare module "swiper/css/navigation";
declare module "swiper/css/autoplay";

// Allow importing .jsx and .js files without type declarations
declare module "*.jsx" {
  const content: any;
  export default content;
}

declare module "*.js" {
  const content: any;
  export default content;
}

// Allow importing CSS files
declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

// Allow importing image and SVG assets
declare module "*.svg" {
  const src: string;
  export default src;
}

declare module "*.png" {
  const src: string;
  export default src;
}

declare module "*.jpg" {
  const src: string;
  export default src;
}

declare module "*.jpeg" {
  const src: string;
  export default src;
}

declare module "*.webp" {
  const src: string;
  export default src;
}
