/**
 * StoryPanelBlock — Step 15.8
 *
 * Dual-panel interactive layout with thumbnail navigation and auto-rotate.
 *
 * Variants:
 *  - 'side-by-side' (default): thumbnails left (vertical stack, clickable,
 *    active highlighted), expanded content right with AnimatePresence.
 *  - 'top-bottom': thumbnails as horizontal tabs above, content below.
 *
 * Auto-rotate via useEffect + setInterval, pauses on hover.
 * Mobile: tab-style interface (story titles as horizontal scrollable tabs).
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { BlockWrapper } from '../BlockWrapper';

// ── Types ──────────────────────────────────────────────────────────────────

interface Story {
  image?: string;
  title: string;
  subtitle?: string;
  body?: string;
  linkText?: string;
  linkUrl?: string;
}

interface StoryPanelContent {
  heading?: string;
  stories?: Story[];
  autoRotate?: boolean;
  autoRotateInterval?: number;
  variant?: 'side-by-side' | 'top-bottom';
  [key: string]: unknown;
}

interface StoryPanelBlockProps {
  content: StoryPanelContent;
  primaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
}

// ── URL sanitisation ───────────────────────────────────────────────────────

const SAFE_URL_RE = /^https?:\/\//i;
function safeImageUrl(url?: string): string {
  if (!url) return '';
  return SAFE_URL_RE.test(url) ? url : '';
}

// ── Animation variants ─────────────────────────────────────────────────────

const contentVariants = {
  enter: { opacity: 0, y: 12 },
  center: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// ── Component ──────────────────────────────────────────────────────────────

const StoryPanelBlock: React.FC<StoryPanelBlockProps> = React.memo(function StoryPanelBlock({
  content,
  primaryColor = '#1976d2',
  headingColor,
  bodyColor,
}) {
  const stories = useMemo(() => (content.stories ?? []).slice(0, 6), [content.stories]);
  const autoRotate = content.autoRotate !== false;
  const interval = Math.min(10000, Math.max(3000, content.autoRotateInterval ?? 5000));
  const variant = content.variant === 'top-bottom' ? 'top-bottom' : 'side-by-side';

  const [activeIndex, setActiveIndex] = useState(0);
  const isPaused = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Clamp activeIndex when stories shrink
  useEffect(() => {
    if (activeIndex >= stories.length && stories.length > 0) {
      setActiveIndex(0);
    }
  }, [stories.length, activeIndex]);

  // Auto-rotate
  useEffect(() => {
    if (!autoRotate || stories.length <= 1) return;
    const timer = setInterval(() => {
      if (!isPaused.current) {
        setActiveIndex((prev) => (prev + 1) % stories.length);
      }
    }, interval);
    return () => clearInterval(timer);
  }, [autoRotate, interval, stories.length]);

  const handleMouseEnter = useCallback(() => {
    isPaused.current = true;
  }, []);
  const handleMouseLeave = useCallback(() => {
    isPaused.current = false;
  }, []);
  const handleSelect = useCallback((idx: number) => {
    setActiveIndex(idx);
  }, []);

  if (stories.length === 0) {
    return (
      <BlockWrapper fields={content as unknown as import('../BlockWrapper').BlockWrapperFields}>
        <Box data-testid="story-panel-empty" sx={{ py: 6, textAlign: 'center' }}>
          <Container maxWidth="lg">
            <Typography variant="body1" color="text.secondary">
              No stories to display.
            </Typography>
          </Container>
        </Box>
      </BlockWrapper>
    );
  }

  const active = stories[activeIndex] ?? stories[0];
  const safeImg = safeImageUrl(active.image);

  // ── Shared expanded content panel ────────────────────────────────────────
  const expandedContent = (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeIndex}
        variants={contentVariants}
        initial="enter"
        animate="center"
        exit="exit"
        data-testid="story-content"
      >
        {safeImg && (
          <Box
            component="img"
            src={safeImg}
            alt={active.title}
            sx={{
              width: '100%',
              maxHeight: 320,
              objectFit: 'cover',
              borderRadius: 2,
              mb: 2,
            }}
          />
        )}
        <Typography
          variant="h4"
          component="h3"
          sx={{ fontWeight: 700, mb: 0.5, color: headingColor }}
        >
          {active.title}
        </Typography>
        {active.subtitle && (
          <Typography variant="subtitle1" sx={{ color: bodyColor || 'text.secondary', mb: 1 }}>
            {active.subtitle}
          </Typography>
        )}
        {active.body && (
          <Typography variant="body1" sx={{ color: bodyColor, mb: 2 }}>
            {active.body}
          </Typography>
        )}
        {active.linkText && active.linkUrl && (
          <Button
            href={active.linkUrl}
            variant="outlined"
            sx={{ borderColor: primaryColor, color: primaryColor }}
          >
            {active.linkText}
          </Button>
        )}
      </motion.div>
    </AnimatePresence>
  );

  // ── Side-by-side layout ──────────────────────────────────────────────────
  const renderSideBySide = () => (
    <Box
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="story-panel-side-by-side"
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: '280px 1fr' },
        gap: 4,
        alignItems: 'start',
      }}
    >
      {/* Thumbnail list — desktop: vertical stack, mobile: horizontal tabs */}
      <Box
        data-testid="story-thumbnails"
        sx={{
          display: 'flex',
          flexDirection: { xs: 'row', md: 'column' },
          gap: 1,
          overflowX: { xs: 'auto', md: 'visible' },
          pb: { xs: 1, md: 0 },
        }}
      >
        {stories.map((story, idx) => {
          const isActive = idx === activeIndex;
          const thumb = safeImageUrl(story.image);
          return (
            <Box
              key={idx}
              onClick={() => handleSelect(idx)}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(idx);
                }
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.5,
                borderRadius: 2,
                cursor: 'pointer',
                flexShrink: 0,
                minWidth: { xs: 140, md: 'auto' },
                bgcolor: isActive ? `${primaryColor}14` : 'transparent',
                borderLeft: {
                  md: isActive ? `3px solid ${primaryColor}` : '3px solid transparent',
                },
                borderBottom: {
                  xs: isActive ? `2px solid ${primaryColor}` : '2px solid transparent',
                  md: 'none',
                },
                transition: 'all 0.2s ease',
                '&:hover': { bgcolor: `${primaryColor}0A` },
              }}
            >
              {thumb && (
                <Box
                  component="img"
                  src={thumb}
                  alt={story.title}
                  sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover', flexShrink: 0 }}
                />
              )}
              <Box sx={{ overflow: 'hidden' }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? primaryColor : headingColor,
                  }}
                >
                  {story.title}
                </Typography>
                {story.subtitle && (
                  <Typography variant="caption" noWrap sx={{ color: 'text.secondary' }}>
                    {story.subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Expanded content */}
      <Box sx={{ minHeight: 200 }}>{expandedContent}</Box>
    </Box>
  );

  // ── Top-bottom layout ────────────────────────────────────────────────────
  const renderTopBottom = () => (
    <Box
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-testid="story-panel-top-bottom"
    >
      {/* Horizontal tabs */}
      <Box
        data-testid="story-tabs"
        sx={{
          display: 'flex',
          gap: 1,
          overflowX: 'auto',
          borderBottom: '1px solid',
          borderColor: 'divider',
          mb: 3,
          pb: 0,
        }}
      >
        {stories.map((story, idx) => {
          const isActive = idx === activeIndex;
          return (
            <Box
              key={idx}
              onClick={() => handleSelect(idx)}
              role="tab"
              aria-selected={isActive}
              tabIndex={0}
              onKeyDown={(e: React.KeyboardEvent) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleSelect(idx);
                }
              }}
              sx={{
                px: 2.5,
                py: 1.5,
                cursor: 'pointer',
                flexShrink: 0,
                borderBottom: isActive ? `3px solid ${primaryColor}` : '3px solid transparent',
                transition: 'border-color 0.2s ease',
                '&:hover': { bgcolor: `${primaryColor}0A` },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? primaryColor : headingColor,
                }}
              >
                {story.title}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Content below tabs */}
      <Box sx={{ minHeight: 200 }}>{expandedContent}</Box>
    </Box>
  );

  return (
    <BlockWrapper fields={content as unknown as import('../BlockWrapper').BlockWrapperFields}>
      <Container maxWidth="lg" sx={{ py: 2 }}>
        {content.heading && (
          <Typography
            variant="h3"
            component="h2"
            sx={{ fontWeight: 700, mb: 4, color: headingColor }}
          >
            {content.heading}
          </Typography>
        )}
        {variant === 'top-bottom' ? renderTopBottom() : renderSideBySide()}
      </Container>
    </BlockWrapper>
  );
});

export default StoryPanelBlock;
