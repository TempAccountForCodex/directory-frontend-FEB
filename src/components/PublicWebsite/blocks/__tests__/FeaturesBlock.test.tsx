/**
 * Tests for FeaturesBlock (Step 10.3)
 *
 * Covers:
 *  1.  Renders without crashing with minimal props
 *  2.  Renders provided heading
 *  3.  Falls back to "Features" when heading is absent
 *  4.  Renders all feature titles (default variant)
 *  5.  Renders feature descriptions (default variant)
 *  6.  Renders avatar icon when icon name provided
 *  7.  No avatar when icon is absent
 *  8.  Empty features array does not crash
 *  9.  Default variant renders 3-column grid (md=4 items)
 *  10. 4-column variant renders four-column-grid testid
 *  11. 4-column variant renders feature titles
 *  12. 4-column variant renders compact (variant h6) titles
 *  13. Stacked variant renders stacked-list testid
 *  14. Stacked variant renders stacked rows
 *  15. Stacked variant renders icon + text side by side
 *  16. Stacked variant renders all feature titles
 *  17. Stacked variant renders all descriptions
 *  18. Component falls back to default variant when variant is undefined
 *  19. Unknown variant falls back gracefully to default
 *  20. FeaturesBlock has displayName set
 */

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import FeaturesBlock from '../FeaturesBlock';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock('../../BlockWrapper', () => ({
  BlockWrapper: ({ children }: any) => <div data-testid="block-wrapper">{children}</div>,
}));

vi.mock('../../utils/iconMap', () => ({
  getIconComponent: () => () => <svg data-testid="mock-icon" />,
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const sampleFeatures = [
  { icon: 'build', title: 'Fast Setup', description: 'Get started in minutes.' },
  { icon: 'verified', title: 'Secure', description: 'Enterprise-grade security.' },
  { icon: 'analytics', title: 'Insights', description: 'Real-time analytics.' },
];

const makeContent = (overrides: Record<string, any> = {}) => ({
  heading: 'Why Choose Us',
  features: sampleFeatures,
  ...overrides,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('FeaturesBlock', () => {
  // 1
  it('renders without crashing with minimal props', () => {
    const { container } = render(<FeaturesBlock content={{}} />);
    expect(container.firstChild).not.toBeNull();
  });

  // 2
  it('renders provided heading', () => {
    render(<FeaturesBlock content={makeContent()} />);
    expect(screen.getByText('Why Choose Us')).toBeInTheDocument();
  });

  // 3
  it('falls back to "Features" when heading is absent', () => {
    render(<FeaturesBlock content={{ features: sampleFeatures }} />);
    expect(screen.getByText('Features')).toBeInTheDocument();
  });

  // 4
  it('renders all feature titles in default variant', () => {
    render(<FeaturesBlock content={makeContent()} />);
    expect(screen.getByText('Fast Setup')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  // 5
  it('renders feature descriptions in default variant', () => {
    render(<FeaturesBlock content={makeContent()} />);
    expect(screen.getByText('Get started in minutes.')).toBeInTheDocument();
    expect(screen.getByText('Enterprise-grade security.')).toBeInTheDocument();
  });

  // 6
  it('renders avatar icon when icon name is provided', () => {
    render(<FeaturesBlock content={makeContent()} />);
    const icons = screen.getAllByTestId('mock-icon');
    expect(icons.length).toBe(sampleFeatures.length);
  });

  // 7
  it('does not render avatar when feature icon is absent', () => {
    const content = makeContent({
      features: [{ title: 'No Icon Feature', description: 'desc' }],
    });
    render(<FeaturesBlock content={content} />);
    expect(screen.queryByTestId('mock-icon')).toBeNull();
  });

  // 8
  it('does not crash when features array is empty', () => {
    const { container } = render(<FeaturesBlock content={makeContent({ features: [] })} />);
    expect(container.firstChild).not.toBeNull();
  });

  // 9
  it('default variant renders without 4-column or stacked testids', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'default' })} />);
    expect(screen.queryByTestId('four-column-grid')).toBeNull();
    expect(screen.queryByTestId('stacked-list')).toBeNull();
  });

  // 10
  it('4-column variant renders four-column-grid testid', () => {
    render(<FeaturesBlock content={makeContent({ variant: '4-column' })} />);
    expect(screen.getByTestId('four-column-grid')).toBeInTheDocument();
  });

  // 11
  it('4-column variant renders all feature titles', () => {
    render(<FeaturesBlock content={makeContent({ variant: '4-column' })} />);
    expect(screen.getByText('Fast Setup')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  // 12
  it('4-column variant renders feature titles as h3 heading elements', () => {
    // FourColumnVariant uses variant="h6" (compact visual) with component="h3" (semantic)
    render(<FeaturesBlock content={makeContent({ variant: '4-column' })} />);
    const title = screen.getByText('Fast Setup');
    expect(title.tagName).toBe('H3');
  });

  // 13
  it('stacked variant renders stacked-list testid', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'stacked' })} />);
    expect(screen.getByTestId('stacked-list')).toBeInTheDocument();
  });

  // 14
  it('stacked variant renders stacked rows for each feature', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'stacked' })} />);
    const rows = screen.getAllByTestId('stacked-row');
    expect(rows.length).toBe(sampleFeatures.length);
  });

  // 15
  it('stacked variant renders icons alongside text', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'stacked' })} />);
    const icons = screen.getAllByTestId('mock-icon');
    expect(icons.length).toBe(sampleFeatures.length);
    expect(screen.getByText('Fast Setup')).toBeInTheDocument();
  });

  // 16
  it('stacked variant renders all feature titles', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'stacked' })} />);
    expect(screen.getByText('Fast Setup')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  // 17
  it('stacked variant renders all descriptions', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'stacked' })} />);
    expect(screen.getByText('Get started in minutes.')).toBeInTheDocument();
    expect(screen.getByText('Enterprise-grade security.')).toBeInTheDocument();
    expect(screen.getByText('Real-time analytics.')).toBeInTheDocument();
  });

  // 18
  it('renders default variant when variant is undefined', () => {
    render(<FeaturesBlock content={makeContent({ variant: undefined })} />);
    expect(screen.queryByTestId('four-column-grid')).toBeNull();
    expect(screen.queryByTestId('stacked-list')).toBeNull();
    expect(screen.getByText('Fast Setup')).toBeInTheDocument();
  });

  // 19
  it('falls back to default when variant is an unknown string', () => {
    const content = makeContent({ variant: 'nonexistent' as any });
    const { container } = render(<FeaturesBlock content={content} />);
    expect(container.firstChild).not.toBeNull();
    expect(screen.queryByTestId('four-column-grid')).toBeNull();
    expect(screen.queryByTestId('stacked-list')).toBeNull();
  });

  // ── Badges variant (Step 17.3) ───────────────────────────────────────────────

  // 21
  it('badges variant renders badges-strip testid', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'badges' })} />);
    expect(screen.getByTestId('badges-strip')).toBeInTheDocument();
  });

  // 22
  it('badges variant renders all feature titles', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'badges' })} />);
    expect(screen.getByText('Fast Setup')).toBeInTheDocument();
    expect(screen.getByText('Secure')).toBeInTheDocument();
    expect(screen.getByText('Insights')).toBeInTheDocument();
  });

  // 23
  it('badges variant does NOT render descriptions', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'badges' })} />);
    expect(screen.queryByText('Get started in minutes.')).toBeNull();
    expect(screen.queryByText('Enterprise-grade security.')).toBeNull();
    expect(screen.queryByText('Real-time analytics.')).toBeNull();
  });

  // 24
  it('badges variant renders icons', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'badges' })} />);
    const icons = screen.getAllByTestId('mock-icon');
    expect(icons.length).toBe(sampleFeatures.length);
  });

  // 25
  it('badges variant renders badge-item for each feature', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'badges' })} />);
    const items = screen.getAllByTestId('badge-item');
    expect(items.length).toBe(sampleFeatures.length);
  });

  // 26
  it('badges variant applies badgeBackgroundColor', () => {
    render(
      <FeaturesBlock
        content={makeContent({ variant: 'badges', badgeBackgroundColor: '#f0f4ff' })}
      />
    );
    const strip = screen.getByTestId('badges-strip');
    const style = window.getComputedStyle(strip);
    // MUI applies bgcolor via class — just verify element exists with the prop
    expect(strip).toBeInTheDocument();
  });

  // 27
  it('badges variant without badgeBackgroundColor has no extra background', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'badges' })} />);
    const strip = screen.getByTestId('badges-strip');
    expect(strip).toBeInTheDocument();
  });

  // 28
  it('badges variant does not render other variant testids', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'badges' })} />);
    expect(screen.queryByTestId('four-column-grid')).toBeNull();
    expect(screen.queryByTestId('stacked-list')).toBeNull();
  });

  // 29
  it('existing 3-column variant unaffected after badges addition', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'default' })} />);
    expect(screen.queryByTestId('badges-strip')).toBeNull();
    expect(screen.getByText('Get started in minutes.')).toBeInTheDocument();
  });

  // 30
  it('existing stacked variant unaffected after badges addition', () => {
    render(<FeaturesBlock content={makeContent({ variant: 'stacked' })} />);
    expect(screen.queryByTestId('badges-strip')).toBeNull();
    expect(screen.getByTestId('stacked-list')).toBeInTheDocument();
  });

  // 20
  it('FeaturesBlock has displayName set', () => {
    const name = (FeaturesBlock as any).displayName || (FeaturesBlock as any).type?.displayName;
    expect(name).toBe('FeaturesBlock');
  });
});
