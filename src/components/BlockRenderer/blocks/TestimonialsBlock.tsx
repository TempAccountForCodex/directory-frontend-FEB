import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { BlockRendererProps } from '../types';
import { escapeHtml, escapeAttr, sanitizeUrl } from '../utils';

interface Testimonial {
  quote?: string;
  author?: string;
  role?: string;
  avatar?: string;
  rating?: number;
}

interface TestimonialsContent {
  title?: string;
  items?: Testimonial[];
  testimonials?: Testimonial[];
  variant?: 'cards' | 'stacked';
}

const MAX_TESTIMONIALS = 12;

// ── StarRating ────────────────────────────────────────────────────────────────

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  const clamped = Math.min(5, Math.max(1, Math.round(rating)));
  return (
    <div
      className="testimonial__stars"
      aria-label={`${clamped} out of 5 stars`}
      style={{ color: '#f59e0b', fontSize: '1.1em', letterSpacing: '0.05em' }}
    >
      {'★'.repeat(clamped)}
      {'☆'.repeat(5 - clamped)}
    </div>
  );
};

// ── AvatarDisplay ─────────────────────────────────────────────────────────────

interface AvatarDisplayProps {
  avatar?: string;
  author: string;
  className?: string;
}

const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatar,
  author,
  className = 'testimonial__avatar',
}) => {
  const avatarUrl = sanitizeUrl(avatar);
  const hasAvatar = avatar && avatarUrl !== '#';

  if (hasAvatar) {
    return <img className={className} src={avatarUrl} alt={escapeAttr(author)} loading="lazy" />;
  }
  return (
    <div className={`${className} ${className}--placeholder`}>{author.charAt(0).toUpperCase()}</div>
  );
};

// ── CardsVariant ──────────────────────────────────────────────────────────────

interface VariantProps {
  items: Testimonial[];
  title?: string;
}

const CardsVariant: React.FC<VariantProps> = ({ items, title }) => (
  <section className="block block--testimonials" data-block-type="TESTIMONIALS">
    <div className="testimonials__inner">
      {title && (
        <h2
          className="testimonials__title"
          dangerouslySetInnerHTML={{ __html: escapeHtml(title) }}
        />
      )}
      <div className="testimonials__grid">
        {items.length > 0 ? (
          items.map((item, idx) => {
            const author = item.author || 'Anonymous';
            const rating =
              item.rating != null ? Math.min(5, Math.max(1, Math.round(item.rating))) : null;

            return (
              <blockquote className="testimonial__card" key={idx}>
                <AvatarDisplay avatar={item.avatar} author={author} />
                {rating != null && <StarRating rating={rating} />}
                {item.quote && (
                  <p className="testimonial__quote">&ldquo;{escapeHtml(item.quote)}&rdquo;</p>
                )}
                <footer className="testimonial__footer">
                  <cite className="testimonial__author">{escapeHtml(author)}</cite>
                  {item.role && <span className="testimonial__role">{escapeHtml(item.role)}</span>}
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

// ── StackedVariant ────────────────────────────────────────────────────────────

const StackedVariant: React.FC<VariantProps> = ({ items, title }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startInterval = useCallback(() => {
    intervalRef.current = setInterval(() => {
      setActiveIndex((i) => (i + 1) % items.length);
    }, 6000);
  }, [items.length]);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (items.length > 1) startInterval();
    return stopInterval;
  }, [startInterval, stopInterval, items.length]);

  const handlePrev = useCallback(() => {
    stopInterval();
    setActiveIndex((i) => (i - 1 + items.length) % items.length);
    if (items.length > 1) startInterval();
  }, [items.length, startInterval, stopInterval]);

  const handleNext = useCallback(() => {
    stopInterval();
    setActiveIndex((i) => (i + 1) % items.length);
    if (items.length > 1) startInterval();
  }, [items.length, startInterval, stopInterval]);

  const handleDotClick = useCallback(
    (idx: number) => {
      stopInterval();
      setActiveIndex(idx);
      if (items.length > 1) startInterval();
    },
    [items.length, startInterval, stopInterval]
  );

  if (items.length === 0) {
    return (
      <section
        className="block block--testimonials block--testimonials-stacked"
        data-block-type="TESTIMONIALS"
      >
        <div className="testimonials__inner">
          <p className="testimonials__empty">No testimonials yet.</p>
        </div>
      </section>
    );
  }

  const item = items[activeIndex];
  const author = item.author || 'Anonymous';
  const rating = item.rating != null ? Math.min(5, Math.max(1, Math.round(item.rating))) : null;

  return (
    <section
      className="block block--testimonials block--testimonials-stacked"
      data-block-type="TESTIMONIALS"
      onMouseEnter={stopInterval}
      onMouseLeave={() => {
        if (items.length > 1) startInterval();
      }}
    >
      <div className="testimonials__inner">
        {title && (
          <h2
            className="testimonials__title"
            dangerouslySetInnerHTML={{ __html: escapeHtml(title) }}
          />
        )}

        <div className="testimonials__stacked-wrapper" style={{ position: 'relative' }}>
          {/* Prev / Next arrows */}
          {items.length > 1 && (
            <button
              className="testimonials__arrow testimonials__arrow--prev"
              onClick={handlePrev}
              aria-label="Previous testimonial"
            >
              &lt;
            </button>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              className="testimonials__slide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <blockquote className="testimonial__card testimonial__card--stacked">
                <AvatarDisplay
                  avatar={item.avatar}
                  author={author}
                  className="testimonial__avatar testimonial__avatar--stacked"
                />
                {rating != null && <StarRating rating={rating} />}
                {item.quote && (
                  <p className="testimonial__quote">&ldquo;{escapeHtml(item.quote)}&rdquo;</p>
                )}
                <footer className="testimonial__footer">
                  <cite className="testimonial__author">{escapeHtml(author)}</cite>
                  {item.role && <span className="testimonial__role">{escapeHtml(item.role)}</span>}
                </footer>
              </blockquote>
            </motion.div>
          </AnimatePresence>

          {items.length > 1 && (
            <button
              className="testimonials__arrow testimonials__arrow--next"
              onClick={handleNext}
              aria-label="Next testimonial"
            >
              &gt;
            </button>
          )}
        </div>

        {/* Dot indicators */}
        {items.length > 1 && (
          <div className="testimonials__dots" role="tablist" aria-label="Testimonial navigation">
            {items.map((_, idx) => (
              <button
                key={idx}
                className={`testimonials__dot${idx === activeIndex ? ' testimonials__dot--active' : ''}`}
                onClick={() => handleDotClick(idx)}
                role="tab"
                aria-selected={idx === activeIndex}
                aria-label={`Go to testimonial ${idx + 1}`}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  border: 'none',
                  cursor: 'pointer',
                  background: idx === activeIndex ? '#f59e0b' : '#cbd5e1',
                  margin: '0 4px',
                  padding: 0,
                  display: 'inline-block',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Default export ────────────────────────────────────────────────────────────

const TestimonialsBlock: React.FC<BlockRendererProps> = ({ block }) => {
  const c = (block.content || {}) as TestimonialsContent;
  const items = (c.items || c.testimonials || []).slice(0, MAX_TESTIMONIALS);
  const variant = c.variant || 'cards';

  if (variant === 'stacked') {
    return <StackedVariant items={items} title={c.title} />;
  }
  return <CardsVariant items={items} title={c.title} />;
};

export default React.memo(TestimonialsBlock);
