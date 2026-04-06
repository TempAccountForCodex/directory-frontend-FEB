import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, escapeAttr, sanitizeUrl } from "../utils";

interface HeroContent {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  alignment?: string;
}

const HeroBlock: React.FC<BlockRendererProps> = ({ block, isPreview }) => {
  const c = (block.content || {}) as HeroContent;
  const heading = c.heading || "Welcome";
  const alignment = c.alignment || "center";

  const styles: string[] = [];
  if (c.backgroundColor)
    styles.push(`background-color:${escapeAttr(c.backgroundColor)}`);
  if (c.backgroundImage) {
    const safeUrl = sanitizeUrl(c.backgroundImage);
    if (safeUrl !== "#") {
      styles.push(`background-image:url('${escapeAttr(safeUrl)}')`);
      styles.push("background-size:cover");
      styles.push("background-position:center");
    }
  }
  if (alignment !== "center")
    styles.push(`text-align:${escapeAttr(alignment)}`);

  const styleAttr = styles.length > 0 ? styles.join(";") : undefined;

  return (
    <section
      className="block block--hero"
      style={
        styleAttr
          ? ({ cssText: styleAttr } as unknown as React.CSSProperties)
          : undefined
      }
      data-block-type="HERO"
    >
      <div className="hero__inner">
        <h1
          className="hero__heading"
          dangerouslySetInnerHTML={{ __html: escapeHtml(heading) }}
        />
        {c.subheading && (
          <p
            className="hero__subheading"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.subheading) }}
          />
        )}
        {c.ctaText &&
          (isPreview ? (
            <span className="hero__cta">{escapeHtml(c.ctaText)}</span>
          ) : (
            <a href={sanitizeUrl(c.ctaLink)} className="hero__cta">
              {escapeHtml(c.ctaText)}
            </a>
          ))}
      </div>
    </section>
  );
};

export default React.memo(HeroBlock);
