import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, escapeAttr, sanitizeUrl } from "../utils";

const BLUR_MAP: Record<string, string> = { sm: "4px", md: "8px", lg: "16px" };
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

interface CtaContent {
  heading?: string;
  subheading?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundColor?: string;
  backdropBlur?: string;
  headingTextShadow?: string;
  headingOpacity?: number;
  headingLineHeight?: string;
}

const CtaBlock: React.FC<BlockRendererProps> = ({ block, isPreview }) => {
  const c = (block.content || {}) as CtaContent;
  const bgColor = c.backgroundColor || "#4f46e5";
  const blurLevel =
    c.backdropBlur && c.backdropBlur !== "none" ? c.backdropBlur : null;
  const blurPx = blurLevel ? BLUR_MAP[blurLevel] : null;

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

  const renderButton = (
    text: string | undefined,
    link: string | undefined,
    variant: "primary" | "secondary",
  ) => {
    if (!text) return null;
    const className = `cta__btn cta__btn--${variant}`;
    if (isPreview) {
      return <span className={className}>{escapeHtml(text)}</span>;
    }
    return (
      <a href={sanitizeUrl(link)} className={className}>
        {escapeHtml(text)}
      </a>
    );
  };

  const hasButtons = c.primaryCtaText || c.secondaryCtaText;

  return (
    <section
      className="block block--cta"
      style={{
        backgroundColor: escapeAttr(bgColor) as string,
        ...(blurPx
          ? {
              backdropFilter: `blur(${blurPx})`,
              WebkitBackdropFilter: `blur(${blurPx})`,
            }
          : {}),
      }}
      data-block-type="CTA"
      {...(blurPx ? { "data-backdrop-blur": blurLevel! } : {})}
    >
      <div className="cta__inner">
        {c.heading && (
          <h2
            className="cta__heading"
            style={hasHeadingStyle ? headingStyle : undefined}
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.heading) }}
          />
        )}
        {c.subheading && (
          <p
            className="cta__subheading"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.subheading) }}
          />
        )}
        {hasButtons && (
          <div className="cta__buttons">
            {renderButton(c.primaryCtaText, c.primaryCtaLink, "primary")}
            {renderButton(c.secondaryCtaText, c.secondaryCtaLink, "secondary")}
          </div>
        )}
      </div>
    </section>
  );
};

export default React.memo(CtaBlock);
