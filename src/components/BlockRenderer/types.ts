/**
 * BlockRenderer Types
 *
 * TypeScript interfaces for the preview-specific BlockRenderer
 * that produces HTML matching backend previewService CSS classes.
 */

export type ViewportType = "desktop" | "tablet" | "mobile";

export interface PreviewBlock {
  id: number | string;
  blockType: string;
  content: Record<string, unknown>;
  isVisible?: boolean;
  sortOrder?: number;
}

export interface BlockRendererProps {
  block: PreviewBlock;
  viewport?: ViewportType;
  isPreview?: boolean;
}

export interface PreviewRendererProps {
  blocks: PreviewBlock[];
  viewport?: ViewportType;
  isPreview?: boolean;
  siteName?: string;
}

/** Viewport width map matching backend previewService */
export const VIEWPORT_WIDTHS: Record<ViewportType, string> = {
  mobile: "375px",
  tablet: "768px",
  desktop: "100%",
};
