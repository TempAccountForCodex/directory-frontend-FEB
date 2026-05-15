import React from "react";
import type { BlockRendererProps } from "../types";
import { escapeHtml, escapeAttr, sanitizeUrl } from "../utils";

interface GalleryImage {
  src?: string;
  alt?: string;
  caption?: string;
}

interface GalleryContent {
  title?: string;
  images?: GalleryImage[];
  columns?: number;
}

const MAX_IMAGES = 20;

const GalleryBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as GalleryContent;
  const columns = Math.min(Math.max(c.columns || 3, 2), 4);
  const images = (c.images || []).slice(0, MAX_IMAGES);

  return (
    <section className="block block--gallery" data-block-type="GALLERY">
      <div className="gallery__inner">
        {c.title && (
          <h2
            className="gallery__title"
            dangerouslySetInnerHTML={{ __html: escapeHtml(c.title) }}
          />
        )}
        <div className={`gallery__grid gallery__grid--cols-${columns}`}>
          {images.length > 0 ? (
            images.map((img, idx) => {
              const safeSrc = sanitizeUrl(img.src);
              return (
                <figure className="gallery__item" key={idx}>
                  <img
                    className="gallery__img"
                    src={safeSrc !== "#" ? safeSrc : undefined}
                    alt={escapeAttr(img.alt || "")}
                    loading="lazy"
                  />
                  {img.caption && (
                    <figcaption
                      className="gallery__caption"
                      dangerouslySetInnerHTML={{
                        __html: escapeHtml(img.caption),
                      }}
                    />
                  )}
                </figure>
              );
            })
          ) : (
            <p className="gallery__empty">No images</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(GalleryBlock);
