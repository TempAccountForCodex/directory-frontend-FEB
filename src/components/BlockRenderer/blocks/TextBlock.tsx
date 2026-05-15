import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, sanitizeRichText } from "../utils";

interface TextContent {
  title?: string;
  body?: string;
  alignment?: string;
}

const TextBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as TextContent;
  const alignment = c.alignment || "left";

  return (
    <section
      className="block block--text"
      style={
        alignment !== "left"
          ? { textAlign: alignment as React.CSSProperties["textAlign"] }
          : undefined
      }
      data-block-type="TEXT"
    >
      <div className="text__inner">
        {c.title && (
          <h2
            className="text__title"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.title) }}
          />
        )}
        {c.body && (
          <div
            className="text__body"
            dangerouslySetInnerHTML={{ __html: sanitizeRichText(c.body) }}
          />
        )}
      </div>
    </section>
  );
};

export default React.memo(TextBlock);
