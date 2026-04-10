/**
 * Tests for CollageBlock (Step 14.6)
 *
 * Covers:
 *  Group 1: Rendering Basics (1-4)
 *  Group 2: left-center-right layout (5-8)
 *  Group 3: two-column layout (9-11)
 *  Group 4: scattered layout (12-14)
 *  Group 5: Image Sanitization (15-17)
 *  Group 6: Mobile smoke (18)
 *  Group 7: CTA Conditional (19-20)
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('framer-motion', () => ({
  useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: () => () => {} } }),
  useTransform: (..._args) => ({ get: () => '0%', onChange: () => () => {} }),
  useMotionValue: (v) => ({ get: () => v, set: () => {}, onChange: () => () => {} }),
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock BlockWrapper — CollageBlock imports { BlockWrapper } from '../BlockWrapper'
// The mock path must match the module ID as resolved from CollageBlock.tsx
vi.mock('../../BlockWrapper', () => ({
  BlockWrapper: ({ children }: any) => <div data-testid="block-wrapper">{children}</div>,
  default: ({ children }: any) => <div data-testid="block-wrapper">{children}</div>,
}));

// Mock getStaggerDelay from hooks/useBlockAnimation
// CollageBlock.tsx imports from '../hooks/useBlockAnimation' (relative to blocks/),
// which resolves to PublicWebsite/hooks/useBlockAnimation
vi.mock('../../hooks/useBlockAnimation', () => ({
  getStaggerDelay: (_index: number, _base: number, _step: number) => 0,
  useBlockAnimation: () => ({ shouldAnimate: false, motionProps: {} }),
}));

import CollageBlock from '../CollageBlock';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeImages = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    image: `https://example.com/img${i + 1}.jpg`,
    caption: `Caption ${i + 1}`,
    link: `/page-${i + 1}`,
  }));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('CollageBlock', () => {
  // ── Group 1: Rendering Basics ──────────────────────────────────────────────

  // 1
  it('renders without crashing with empty content', () => {
    const { container } = render(<CollageBlock content={{}} />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.getByTestId('block-wrapper')).toBeInTheDocument();
  });

  // 2
  it('renders outer heading when provided', () => {
    render(<CollageBlock content={{ heading: 'Our Work' }} />);
    expect(screen.getByText('Our Work')).toBeInTheDocument();
  });

  // 3
  it('renders description when provided', () => {
    render(<CollageBlock content={{ description: 'Brief description' }} />);
    expect(screen.getByText('Brief description')).toBeInTheDocument();
  });

  // 4
  it('renders nothing for grid when images array is empty', () => {
    render(<CollageBlock content={{ images: [] }} />);
    expect(screen.queryAllByRole('img')).toHaveLength(0);
  });

  // ── Group 2: left-center-right layout ─────────────────────────────────────

  // 5
  it('renders center text heading in left-center-right layout', () => {
    render(
      <CollageBlock
        content={{
          layout: 'left-center-right',
          images: makeImages(5),
          textContent: { heading: 'Center Heading' },
        }}
      />
    );
    expect(screen.getByText('Center Heading')).toBeInTheDocument();
  });

  // 6
  it('renders center text body in left-center-right layout', () => {
    render(
      <CollageBlock
        content={{
          layout: 'left-center-right',
          images: makeImages(5),
          textContent: { body: 'Body text here' },
        }}
      />
    );
    expect(screen.getByText('Body text here')).toBeInTheDocument();
  });

  // 7
  it('renders CTA button when ctaText and ctaLink provided', () => {
    render(
      <CollageBlock
        content={{
          layout: 'left-center-right',
          images: makeImages(5),
          ctaText: 'Learn More',
          ctaLink: '/about',
        }}
      />
    );
    expect(screen.getByText('Learn More')).toBeInTheDocument();
  });

  // 8
  it('does not render CTA when ctaText missing', () => {
    render(
      <CollageBlock
        content={{
          layout: 'left-center-right',
          images: makeImages(5),
          ctaLink: '/about',
        }}
      />
    );
    expect(screen.queryByText('Learn More')).toBeNull();
  });

  // ── Group 3: two-column layout ─────────────────────────────────────────────

  // 9
  it('renders two-column layout with equal ratio', () => {
    render(
      <CollageBlock
        content={{
          layout: 'two-column',
          columnRatio: 'equal',
          images: makeImages(3),
        }}
      />
    );
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(2);
  });

  // 10
  it('renders two-column layout with wide-left ratio', () => {
    const { container } = render(
      <CollageBlock
        content={{
          layout: 'two-column',
          columnRatio: 'wide-left',
          images: makeImages(3),
        }}
      />
    );
    expect(container.firstChild).not.toBeNull();
  });

  // 11
  it('renders two-column layout with wide-right ratio', () => {
    const { container } = render(
      <CollageBlock
        content={{
          layout: 'two-column',
          columnRatio: 'wide-right',
          images: makeImages(3),
        }}
      />
    );
    expect(container.firstChild).not.toBeNull();
  });

  // ── Group 4: scattered layout ──────────────────────────────────────────────

  // 12
  it('renders all 6 images in scattered layout', () => {
    render(
      <CollageBlock
        content={{
          layout: 'scattered',
          images: makeImages(6),
        }}
      />
    );
    expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(6);
  });

  // 13
  it('renders text overlay heading in scattered layout', () => {
    render(
      <CollageBlock
        content={{
          layout: 'scattered',
          images: makeImages(6),
          textContent: { heading: 'Overlay Title' },
        }}
      />
    );
    expect(screen.getByText('Overlay Title')).toBeInTheDocument();
  });

  // 14
  it('renders CTA inside scattered overlay', () => {
    render(
      <CollageBlock
        content={{
          layout: 'scattered',
          images: makeImages(6),
          ctaText: 'Shop Now',
          ctaLink: '/shop',
        }}
      />
    );
    expect(screen.getByText('Shop Now')).toBeInTheDocument();
  });

  // ── Group 5: Image Sanitization ────────────────────────────────────────────

  // 15
  it('renders valid https image src', () => {
    render(
      <CollageBlock
        content={{
          layout: 'two-column',
          images: [
            { image: 'https://example.com/photo.jpg', caption: 'Valid' },
            { image: 'https://example.com/photo2.jpg', caption: 'Also valid' },
          ],
        }}
      />
    );
    const imgs = screen.getAllByRole('img');
    expect(imgs[0].getAttribute('src')).toBe('https://example.com/photo.jpg');
  });

  // 16
  it('rejects javascript: URL — renders placeholder instead', () => {
    render(
      <CollageBlock
        content={{
          layout: 'two-column',
          images: [
            { image: 'javascript:alert(1)', caption: 'XSS attempt' },
            { image: 'https://example.com/safe.jpg', caption: 'Safe' },
          ],
        }}
      />
    );
    // The dangerous image should not render as an <img> tag
    const imgs = screen.queryAllByRole('img');
    // Any img that renders should not have the javascript: src
    imgs.forEach((img) => {
      expect(img.getAttribute('src')).not.toContain('javascript:');
    });
    // Placeholder text should appear for the first item
    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  // 17
  it('rejects data: URL — renders placeholder instead', () => {
    render(
      <CollageBlock
        content={{
          layout: 'two-column',
          images: [
            { image: 'data:image/png;base64,abc123', caption: 'Data URL' },
            { image: 'https://example.com/safe.jpg', caption: 'Safe' },
          ],
        }}
      />
    );
    // The data: image should not render as an <img> tag
    const imgs = screen.queryAllByRole('img');
    imgs.forEach((img) => {
      expect(img.getAttribute('src')).not.toMatch(/^data:/);
    });
    // Placeholder text should appear for the first item
    expect(screen.getByText('No image')).toBeInTheDocument();
  });

  // ── Group 6: Mobile smoke ──────────────────────────────────────────────────

  // 18
  it('renders without crashing in all three layouts', () => {
    const layouts: Array<'left-center-right' | 'two-column' | 'scattered'> = [
      'left-center-right',
      'two-column',
      'scattered',
    ];
    layouts.forEach((layout) => {
      expect(() =>
        render(<CollageBlock content={{ layout, images: makeImages(6) }} />)
      ).not.toThrow();
    });
  });

  // ── Group 7: CTA Conditional ───────────────────────────────────────────────

  // 19
  it('does not render CTA when ctaLink is missing but ctaText provided', () => {
    render(
      <CollageBlock
        content={{
          layout: 'left-center-right',
          images: makeImages(5),
          ctaText: 'Go',
        }}
      />
    );
    // CTA requires both ctaText AND ctaLink — no link means no button
    expect(screen.queryByText('Go')).toBeNull();
  });

  // 20
  it('renders heading at top level above grid', () => {
    render(
      <CollageBlock
        content={{
          heading: 'Top Level',
          images: makeImages(5),
          layout: 'left-center-right',
        }}
      />
    );
    expect(screen.getByText('Top Level')).toBeInTheDocument();
  });
});
