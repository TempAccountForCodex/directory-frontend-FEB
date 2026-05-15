/**
 * BlockRenderer — Preview-Specific Block Renderer
 *
 * Renders blocks using the same HTML structure and CSS classes as
 * backend previewService. Used in the live preview iframe for
 * instant client-side rendering that visually matches server output.
 *
 * NOTE: This is separate from PublicWebsite/BlockRenderer.tsx which
 * uses MUI components for the public-facing site.
 */

import React from "react";
import type { BlockRendererProps } from "./types";

import HeroBlock from "./blocks/HeroBlock";
import TextBlock from "./blocks/TextBlock";
import ImageBlock from "./blocks/ImageBlock";
import FormBlock from "./blocks/FormBlock";
import GalleryBlock from "./blocks/GalleryBlock";
import CtaBlock from "./blocks/CtaBlock";
import TestimonialsBlock from "./blocks/TestimonialsBlock";
import FeaturesBlock from "./blocks/FeaturesBlock";
import DefaultBlock from "./blocks/DefaultBlock";
import NavbarBlock from "./blocks/NavbarBlock";
import FooterBlock from "./blocks/FooterBlock";

/** Map block types to renderer components. Includes aliases matching backend. */
const BLOCK_RENDERERS: Record<string, React.FC<BlockRendererProps>> = {
  HERO: HeroBlock,
  TEXT: TextBlock,
  IMAGE: ImageBlock,
  FORM: FormBlock,
  CONTACT: FormBlock,
  GALLERY: GalleryBlock,
  CTA: CtaBlock,
  TESTIMONIALS: TestimonialsBlock,
  TESTIMONIAL: TestimonialsBlock,
  FEATURES: FeaturesBlock,
  FEATURE: FeaturesBlock,
  NAVBAR: NavbarBlock,
  FOOTER: FooterBlock,
};

const BlockRenderer: React.FC<BlockRendererProps> = ({
  block,
  viewport = "desktop",
  isPreview = false,
}) => {
  const blockType = String(block.blockType || "").toUpperCase();
  const Renderer = BLOCK_RENDERERS[blockType] || DefaultBlock;

  return <Renderer block={block} viewport={viewport} isPreview={isPreview} />;
};

export default React.memo(BlockRenderer);

export { BLOCK_RENDERERS };
export type {
  BlockRendererProps,
  PreviewBlock,
  ViewportType,
  PreviewRendererProps,
} from "./types";
