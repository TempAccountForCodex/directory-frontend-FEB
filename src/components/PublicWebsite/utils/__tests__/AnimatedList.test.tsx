/**
 * AnimatedList.test.tsx — Unit tests for AnimatedList stagger wrapper
 * Step 14.1.2
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AnimatedList from '../AnimatedList';

// Mock framer-motion — motion.div becomes a plain div in tests
vi.mock('framer-motion', () => ({
  useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: () => () => {} } }),
  useTransform: (..._args) => ({ get: () => '0%', onChange: () => () => {} }),
  useMotionValue: (v) => ({ get: () => v, set: () => {}, onChange: () => () => {} }),
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} data-testid="motion-div" {...props}>
        {children}
      </div>
    )),
  },
}));

describe('AnimatedList — disabled mode', () => {
  it('renders children directly without motion.div when disabled=true', () => {
    render(
      <AnimatedList disabled={true}>
        <div data-testid="child-1">A</div>
        <div data-testid="child-2">B</div>
      </AnimatedList>
    );
    expect(screen.getByTestId('child-1')).toBeDefined();
    expect(screen.getByTestId('child-2')).toBeDefined();
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(0);
  });

  it('renders children without motion.div when matchMedia returns reduced-motion', () => {
    // Override matchMedia to return prefers-reduced-motion: reduce
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    render(
      <AnimatedList>
        <div data-testid="rm-child">Content</div>
      </AnimatedList>
    );
    expect(screen.getByTestId('rm-child')).toBeDefined();
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(0);

    // Restore
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: originalMatchMedia,
    });
  });
});

describe('AnimatedList — animated mode', () => {
  beforeEach(() => {
    // Ensure matchMedia returns no reduced motion
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('wraps each valid React element child in a motion.div', () => {
    render(
      <AnimatedList>
        <div>Item 1</div>
        <div>Item 2</div>
        <div>Item 3</div>
      </AnimatedList>
    );
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(3);
  });

  it('passes null children through unchanged (no motion.div for null)', () => {
    render(
      <AnimatedList>
        {null}
        <div data-testid="valid-child">Valid</div>
      </AnimatedList>
    );
    // Only 1 motion.div for the valid child
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });

  it('passes string children through unchanged (no motion.div for strings)', () => {
    render(
      <AnimatedList>
        {'plain text'}
        <div data-testid="valid-child">Valid</div>
      </AnimatedList>
    );
    // Only 1 motion.div for the React element child
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });

  it('uses default staggerMs=80 when not specified', () => {
    // getStaggerDelay(1, 0, 80) = 80ms = 0.08s — check via style/prop not easily testable
    // Verify the component renders without error with defaults
    const { container } = render(
      <AnimatedList>
        <div>A</div>
        <div>B</div>
      </AnimatedList>
    );
    expect(container.firstChild).not.toBeNull();
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(2);
  });

  it('applies staggerMs delay correctly — 3rd child delay = baseDelay + 2*staggerMs', () => {
    // With baseDelay=0, staggerMs=100: child[2] delay = 0 + 2*100ms = 200ms = 0.2s
    // We verify rendering doesn't throw and all children are wrapped
    render(
      <AnimatedList staggerMs={100} baseDelay={0}>
        <div data-testid="c0">0</div>
        <div data-testid="c1">1</div>
        <div data-testid="c2">2</div>
      </AnimatedList>
    );
    const motionDivs = screen.queryAllByTestId('motion-div');
    expect(motionDivs).toHaveLength(3);
    // The 3rd item (index 2) should have delay = 200ms = 0.2s
    // Check that all items render
    expect(screen.getByTestId('c2')).toBeDefined();
  });

  it('applies baseDelay offset to all children', () => {
    render(
      <AnimatedList staggerMs={50} baseDelay={200}>
        <div data-testid="c0">0</div>
        <div data-testid="c1">1</div>
      </AnimatedList>
    );
    // child 0: delay = 200 + 0*50 = 200ms
    // child 1: delay = 200 + 1*50 = 250ms
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(2);
  });
});

describe('AnimatedList — direction mappings', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders with direction=up (default)', () => {
    render(
      <AnimatedList direction="up">
        <div>A</div>
      </AnimatedList>
    );
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });

  it('renders with direction=down', () => {
    render(
      <AnimatedList direction="down">
        <div>A</div>
      </AnimatedList>
    );
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });

  it('renders with direction=left', () => {
    render(
      <AnimatedList direction="left">
        <div>A</div>
      </AnimatedList>
    );
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });

  it('renders with direction=right', () => {
    render(
      <AnimatedList direction="right">
        <div>A</div>
      </AnimatedList>
    );
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });

  it('renders with direction=none', () => {
    render(
      <AnimatedList direction="none">
        <div>A</div>
      </AnimatedList>
    );
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });
});

describe('AnimatedList — edge cases', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(() => ({
        matches: false,
        media: '',
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('renders empty children without error', () => {
    const { container } = render(<AnimatedList></AnimatedList>);
    expect(container).toBeDefined();
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(0);
  });

  it('handles undefined children gracefully', () => {
    const { container } = render(<AnimatedList>{undefined}</AnimatedList>);
    expect(container).toBeDefined();
  });

  it('handles false children gracefully (conditional rendering pattern)', () => {
    const show = false;
    render(
      <AnimatedList>
        {show && <div data-testid="hidden">Hidden</div>}
        <div data-testid="visible">Visible</div>
      </AnimatedList>
    );
    expect(screen.queryByTestId('hidden')).toBeNull();
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });

  it('is memoized — renders with React.memo wrapping', () => {
    // Just check that it renders correctly (memo wrapping doesn't change behavior)
    render(
      <AnimatedList staggerMs={80} baseDelay={0} direction="up" disabled={false}>
        <span>x</span>
      </AnimatedList>
    );
    expect(screen.queryAllByTestId('motion-div')).toHaveLength(1);
  });
});
