import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, escapeAttr, sanitizeUrl } from "../utils";

interface ImageContent {
  src?: string;
  alt?: string;
  caption?: string;
  width?: string;
  alignment?: string;
}

const WIDTH_CLASSES: Record<string, string> = {
  full: "image__figure--full",
  large: "image__figure--large",
  medium: "image__figure--medium",
  small: "image__figure--small",
};

const ImageBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as ImageContent;
  const safeSrc = sanitizeUrl(c.src);
  const widthClass = WIDTH_CLASSES[c.width || "full"] || WIDTH_CLASSES.full;
  const alignment = c.alignment || "center";

  return (
    <section
      className="block block--image"
      style={{ textAlign: alignment as React.CSSProperties["textAlign"] }}
      data-block-type="IMAGE"
    >
      <figure className={`image__figure ${widthClass}`}>
        <img
          className="image__img"
          src={safeSrc !== "#" ? safeSrc : undefined}
          alt={escapeAttr(c.alt || "")}
          loading="lazy"
        />
        {c.caption && (
          <figcaption
            className="image__caption"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.caption) }}
          />
        )}
      </figure>
    </section>
  );
};

export default React.memo(ImageBlock);
