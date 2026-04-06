/**
 * PreviewRenderer — Renders an array of blocks with embedded CSS
 *
 * Wraps BlockRenderer instances in a container that includes the same
 * CSS styles as backend previewService._wrapInTemplate(). This produces
 * a complete preview layout matching server-rendered HTML output.
 */

import React, { useMemo } from "react";
import type { PreviewRendererProps, PreviewBlock } from "./types";
import { VIEWPORT_WIDTHS } from "./types";
import BlockRenderer from "./index";
import { getGlobalStyles, getBlockStyles } from "./styles";

const PreviewRenderer: React.FC<PreviewRendererProps> = ({
  blocks,
  viewport = "desktop",
  isPreview = true,
  siteName,
}) => {
  const viewportWidth = VIEWPORT_WIDTHS[viewport] || VIEWPORT_WIDTHS.desktop;

  const cssText = useMemo(
    () => `${getGlobalStyles(viewportWidth)}\n${getBlockStyles()}`,
    [viewportWidth],
  );

  const visibleBlocks = useMemo(
    () =>
      (blocks || [])
        .filter((b: PreviewBlock) => b.isVisible !== false)
        .sort(
          (a: PreviewBlock, b: PreviewBlock) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        ),
    [blocks],
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssText }} />
      <div
        className="preview-wrapper"
        data-viewport={viewport}
        data-site-name={siteName}
        style={{ maxWidth: viewportWidth, margin: "0 auto" }}
      >
        {visibleBlocks.length > 0 ? (
          visibleBlocks.map((block: PreviewBlock) => (
            <BlockRenderer
              key={block.id}
              block={block}
              viewport={viewport}
              isPreview={isPreview}
            />
          ))
        ) : (
          <div
            style={{
              padding: "60px 24px",
              textAlign: "center",
              color: "#999",
              fontSize: "1rem",
            }}
          >
            No blocks to display
          </div>
        )}
      </div>
    </>
  );
};

export default React.memo(PreviewRenderer);
