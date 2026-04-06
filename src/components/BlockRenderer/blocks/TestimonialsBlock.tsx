import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, escapeAttr, sanitizeUrl } from "../utils";

interface Testimonial {
  quote?: string;
  author?: string;
  role?: string;
  avatar?: string;
}

interface TestimonialsContent {
  title?: string;
  items?: Testimonial[];
  testimonials?: Testimonial[];
}

const MAX_TESTIMONIALS = 12;

const TestimonialsBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as TestimonialsContent;
  // Backend uses `items`, public site renderer uses `testimonials` — support both
  const items = (c.items || c.testimonials || []).slice(0, MAX_TESTIMONIALS);

  return (
    <section
      className="block block--testimonials"
      data-block-type="TESTIMONIALS"
    >
      <div className="testimonials__inner">
        {c.title && (
          <h2
            className="testimonials__title"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.title) }}
          />
        )}
        <div className="testimonials__grid">
          {items.length > 0 ? (
            items.map((item, idx) => {
              const author = item.author || "Anonymous";
              const avatarUrl = sanitizeUrl(item.avatar);
              const hasAvatar = item.avatar && avatarUrl !== "#";

              return (
                <blockquote className="testimonial__card" key={idx}>
                  {hasAvatar ? (
                    <img
                      className="testimonial__avatar"
                      src={avatarUrl}
                      alt={escapeAttr(author)}
                      loading="lazy"
                    />
                  ) : (
                    <div className="testimonial__avatar testimonial__avatar--placeholder">
                      {author.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {item.quote && (
                    <p className="testimonial__quote">
                      &ldquo;{escapeHtml(item.quote)}&rdquo;
                    </p>
                  )}
                  <footer className="testimonial__footer">
                    <cite className="testimonial__author">
                      {escapeHtml(author)}
                    </cite>
                    {item.role && (
                      <span className="testimonial__role">
                        {escapeHtml(item.role)}
                      </span>
                    )}
                  </footer>
                </blockquote>
              );
            })
          ) : (
            <p className="testimonials__empty">No testimonials yet.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(TestimonialsBlock);
