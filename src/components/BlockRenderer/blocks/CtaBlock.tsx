import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, escapeAttr, sanitizeUrl } from "../utils";

interface CtaContent {
  heading?: string;
  subheading?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundColor?: string;
}

const CtaBlock: React.FC<BlockRendererProps> = ({ block, isPreview }) => {
  const c = (block.content || {}) as CtaContent;
  const bgColor = c.backgroundColor || "#4f46e5";

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
      style={{ backgroundColor: escapeAttr(bgColor) as string }}
      data-block-type="CTA"
    >
      <div className="cta__inner">
        {c.heading && (
          <h2
            className="cta__heading"
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
