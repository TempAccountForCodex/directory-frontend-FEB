import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, escapeAttr, sanitizeUrl } from "../utils";

const SHADOW_MAP: Record<string, string> = {
  subtle: "1px 1px 2px rgba(0,0,0,0.3)",
  medium: "2px 2px 4px rgba(0,0,0,0.5)",
  dramatic: "3px 3px 8px rgba(0,0,0,0.7)",
};
const LINE_HEIGHT_MAP: Record<string, number> = {
  tight: 0.9,
  normal: 1.2,
  relaxed: 1.5,
};

interface HeroContent {
  heading?: string;
  subheading?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  alignment?: string;
  headingTextShadow?: string;
  headingOpacity?: number;
  headingLineHeight?: string;
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

  const headingStyle: React.CSSProperties = {};
  if (
    c.headingTextShadow &&
    c.headingTextShadow !== "none" &&
    SHADOW_MAP[c.headingTextShadow]
  ) {
    headingStyle.textShadow = SHADOW_MAP[c.headingTextShadow];
  }
  if (c.headingOpacity !== undefined && c.headingOpacity < 100) {
    headingStyle.opacity = c.headingOpacity / 100;
  }
  if (
    c.headingLineHeight &&
    LINE_HEIGHT_MAP[c.headingLineHeight] !== undefined
  ) {
    headingStyle.lineHeight = LINE_HEIGHT_MAP[c.headingLineHeight];
  }
  const hasHeadingStyle = Object.keys(headingStyle).length > 0;

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
          style={hasHeadingStyle ? headingStyle : undefined}
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
