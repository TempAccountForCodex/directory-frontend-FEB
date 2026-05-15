import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml } from "../utils";

interface Feature {
  icon?: string;
  title?: string;
  description?: string;
}

interface FeaturesContent {
  title?: string;
  subtitle?: string;
  items?: Feature[];
  features?: Feature[];
  columns?: number;
}

const MAX_FEATURES = 12;

const FeaturesBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as FeaturesContent;
  const columns = Math.min(Math.max(c.columns || 3, 2), 4);
  // Backend uses `items`, public site renderer uses `features` — support both
  const items = (c.items || c.features || []).slice(0, MAX_FEATURES);

  return (
    <section className="block block--features" data-block-type="FEATURES">
      <div className="features__inner">
        {c.title && (
          <h2
            className="features__title"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.title) }}
          />
        )}
        {c.subtitle && (
          <p
            className="features__subtitle"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.subtitle) }}
          />
        )}
        <div className={`features__grid features__grid--cols-${columns}`}>
          {items.length > 0 ? (
            items.map((feature, idx) => (
              <div className="feature__card" key={idx}>
                {feature.icon && (
                  <div className="feature__icon">{feature.icon}</div>
                )}
                {feature.title && (
                  <h3
                    className="feature__title"
                    dangerouslySetInnerHTML={{
                      __html: escapeHtml(feature.title),
                    }}
                  />
                )}
                {feature.description && (
                  <p
                    className="feature__desc"
                    dangerouslySetInnerHTML={{
                      __html: escapeHtml(feature.description),
                    }}
                  />
                )}
              </div>
            ))
          ) : (
            <p className="features__empty">No features listed.</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(FeaturesBlock);
