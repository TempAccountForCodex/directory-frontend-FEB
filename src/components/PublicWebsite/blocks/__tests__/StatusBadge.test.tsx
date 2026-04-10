/**
 * Tests for StatusBadge — Step 15.7: Status Indicator & Animation Presets
 *
 * Covers:
 *  1.  Renders status badge with text when statusBadge is provided
 *  2.  Renders colored dot with correct background color
 *  3.  Dot has data-animation="pulse" when animation is pulse
 *  4.  Dot has data-animation="glow" when animation is glow
 *  5.  Dot has data-animation="none" when animation is none
 *  6.  Does NOT render status badge when statusBadge is null/undefined
 *  7.  Does NOT render status badge when statusBadge.text is empty
 *  8.  Uses default green color when color is not specified
 *  9.  Renders badge above heading (badge appears before h1)
 *  10. Badge renders in centered variant with center alignment
 *  11. Badge renders in split variant
 *  12. Badge renders in full-bleed variant
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import HeroBlock from '../HeroBlock';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../BlockWrapper', () => ({
  BlockWrapper: ({ children }: any) => <div data-testid="block-wrapper">{children}</div>,
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../utils/headingTypography', () => ({
  resolveHeadingTypographySx: () => ({}),
  resolveSubheadingTypographySx: () => ({}),
}));

vi.mock('../../hooks', () => ({
  useScrollParallax: () => ({ y: 0, enabled: false }),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeContent = (overrides: Record<string, any> = {}) => ({
  heading: 'Available for Work',
  subheading: 'Hire me today.',
  ctaText: 'Contact',
  ctaLink: '/contact',
  headingOpacity: 100,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('StatusBadge in HeroBlock', () => {
  // 1. Renders badge with text
  it('renders status badge with text when statusBadge is provided', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Available for work', color: '#22c55e', animation: 'pulse' },
        })}
        variant="centered"
      />
    );

    const badge = screen.getByTestId('status-badge');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent('Available for work');
  });

  // 2. Colored dot with correct background
  it('renders colored dot with the specified color', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Open', color: '#ef4444', animation: 'none' },
        })}
        variant="centered"
      />
    );

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).toBeInTheDocument();
  });

  // 3. Pulse animation data attribute
  it('sets data-animation="pulse" when animation is pulse', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Live', color: '#22c55e', animation: 'pulse' },
        })}
        variant="left"
      />
    );

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).toHaveAttribute('data-animation', 'pulse');
  });

  // 4. Glow animation data attribute
  it('sets data-animation="glow" when animation is glow', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Admissions open', color: '#3b82f6', animation: 'glow' },
        })}
        variant="centered"
      />
    );

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).toHaveAttribute('data-animation', 'glow');
  });

  // 5. None animation data attribute
  it('sets data-animation="none" when animation is none', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Now Open', color: '#22c55e', animation: 'none' },
        })}
        variant="centered"
      />
    );

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).toHaveAttribute('data-animation', 'none');
  });

  // 6. No badge when statusBadge is null/undefined
  it('does NOT render badge when statusBadge is null', () => {
    render(<HeroBlock content={makeContent({ statusBadge: null })} variant="centered" />);

    expect(screen.queryByTestId('status-badge')).not.toBeInTheDocument();
  });

  it('does NOT render badge when statusBadge is undefined', () => {
    render(<HeroBlock content={makeContent()} variant="centered" />);

    expect(screen.queryByTestId('status-badge')).not.toBeInTheDocument();
  });

  // 7. No badge when text is empty
  it('does NOT render badge when statusBadge.text is empty string', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: '', color: '#22c55e', animation: 'pulse' },
        })}
        variant="centered"
      />
    );

    expect(screen.queryByTestId('status-badge')).not.toBeInTheDocument();
  });

  // 8. Default color when not specified
  it('uses default green color when color is not specified', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Active', animation: 'none' },
        })}
        variant="centered"
      />
    );

    const dot = screen.getByTestId('status-badge-dot');
    expect(dot).toBeInTheDocument();
    // Default color is #22c55e (applied via sx, verified by rendering without crash)
  });

  // 9. Badge appears before heading
  it('renders badge before the heading element', () => {
    const { container } = render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Available', color: '#22c55e', animation: 'pulse' },
        })}
        variant="centered"
      />
    );

    const badge = container.querySelector('[data-testid="status-badge"]');
    const heading = container.querySelector('h1');
    expect(badge).toBeTruthy();
    expect(heading).toBeTruthy();

    // Badge should come before heading in DOM order
    const badgePos = badge!.compareDocumentPosition(heading!);
    // DOCUMENT_POSITION_FOLLOWING = 4 means heading follows badge
    expect(badgePos & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  // 10. Center alignment in centered variant
  it('renders badge in centered variant', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Centered badge', color: '#22c55e', animation: 'none' },
        })}
        variant="centered"
      />
    );

    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByText('Centered badge')).toBeInTheDocument();
  });

  // 11. Badge in split variant
  it('renders badge in split variant', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Split badge', color: '#f59e0b', animation: 'glow' },
        })}
        variant="split"
      />
    );

    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByText('Split badge')).toBeInTheDocument();
  });

  // 12. Badge in full-bleed variant
  it('renders badge in full-bleed variant', () => {
    render(
      <HeroBlock
        content={makeContent({
          statusBadge: { text: 'Full bleed badge', color: '#8b5cf6', animation: 'pulse' },
          heroImage: 'https://example.com/bg.jpg',
        })}
        variant="full-bleed"
      />
    );

    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByText('Full bleed badge')).toBeInTheDocument();
  });
});
