/**
 * BlockWrapper Tests — Step 9.6.3
 *
 * Covers:
 * - Default render: no animation, no background — minimal wrapper
 * - Animation: shouldAnimate=true wraps with motion element
 * - Background: solid color applies backgroundColor style
 * - Overlay: overlayElement renders when backgroundOverlayEnabled=true
 * - Opacity normalization: backgroundOverlayOpacity=50 → 0.5 CSS opacity
 * - Effects: shadowSize='md' applies boxShadow
 * - Spacing: paddingTop='lg' applies correct MUI spacing value
 * - Visibility: hideOnMobile=true hides block on xs/sm
 * - Fully hidden: hideOnMobile+hideOnTablet+hideOnDesktop=true returns null
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { BlockWrapper } from '../BlockWrapper';

// ---------------------------------------------------------------------------
// Mock framer-motion to avoid animation issues in jsdom
// ---------------------------------------------------------------------------
vi.mock('framer-motion', () => ({
  useScroll: () => ({ scrollYProgress: { get: () => 0, onChange: () => () => {} } }),
  useTransform: (..._args) => ({ get: () => '0%', onChange: () => () => {} }),
  useMotionValue: (v) => ({ get: () => v, set: () => {}, onChange: () => () => {} }),
  motion: {
    div: React.forwardRef(
      (
        {
          children,
          ...props
        }: React.HTMLAttributes<HTMLDivElement> & { children?: React.ReactNode },
        ref: React.Ref<HTMLDivElement>
      ) => (
        <div ref={ref} data-testid="motion-div" {...props}>
          {children}
        </div>
      )
    ),
  },
}));

// ---------------------------------------------------------------------------
// Mock MUI Box to inspect sx prop via data attributes for testability
// ---------------------------------------------------------------------------
vi.mock('@mui/material', async () => {
  const actual = await vi.importActual<typeof import('@mui/material')>('@mui/material');
  return {
    ...actual,
    Box: React.forwardRef(
      (
        {
          children,
          sx,
          component,
          ...rest
        }: React.HTMLAttributes<HTMLDivElement> & {
          sx?: Record<string, unknown>;
          component?: React.ElementType;
        },
        ref: React.Ref<HTMLDivElement>
      ) => {
        const Tag = (component as React.ElementType) || 'div';
        return (
          <Tag ref={ref} data-testid="mui-box" data-sx={JSON.stringify(sx || {})} {...rest}>
            {children}
          </Tag>
        );
      }
    ),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSx(element: HTMLElement): Record<string, unknown> {
  const raw = element.getAttribute('data-sx');
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

function getFirstBox(): HTMLElement {
  const boxes = screen.getAllByTestId('mui-box');
  return boxes[0];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BlockWrapper', () => {
  describe('default rendering (all defaults)', () => {
    it('renders children directly without motion wrapper when no animation', () => {
      render(
        <BlockWrapper fields={{}}>
          <span data-testid="child">hello</span>
        </BlockWrapper>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
      expect(screen.queryByTestId('motion-div')).toBeNull();
    });

    it('applies default spacing (md=4) via pt and pb', () => {
      render(
        <BlockWrapper fields={{}}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.pt).toBe(4);
      expect(sx.pb).toBe(4);
    });

    it('renders a single Box wrapper by default (no overlay element)', () => {
      render(
        <BlockWrapper fields={{}}>
          <span>content</span>
        </BlockWrapper>
      );
      // No overlay div (no background)
      expect(screen.queryByTestId('motion-div')).toBeNull();
    });
  });

  describe('animation wrapping', () => {
    it('wraps children with motion.div when animationEntranceType is fade-in', () => {
      render(
        <BlockWrapper fields={{ animationEntranceType: 'fade-in' }}>
          <span data-testid="child">content</span>
        </BlockWrapper>
      );
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('wraps children with motion.div for slide-up', () => {
      render(
        <BlockWrapper fields={{ animationEntranceType: 'slide-up' }}>
          <span data-testid="child">content</span>
        </BlockWrapper>
      );
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
    });

    it('does NOT wrap with motion.div when animationEntranceType is none', () => {
      render(
        <BlockWrapper fields={{ animationEntranceType: 'none' }}>
          <span>content</span>
        </BlockWrapper>
      );
      expect(screen.queryByTestId('motion-div')).toBeNull();
    });

    it('does NOT wrap with motion.div when animationEntranceType is omitted', () => {
      render(
        <BlockWrapper fields={{}}>
          <span>content</span>
        </BlockWrapper>
      );
      expect(screen.queryByTestId('motion-div')).toBeNull();
    });
  });

  describe('background — solid color', () => {
    it('applies backgroundColor sx when backgroundType=solid with valid hex', () => {
      render(
        <BlockWrapper fields={{ backgroundType: 'solid', backgroundColor: '#ff0000' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.backgroundColor).toBe('#ff0000');
    });

    it('does NOT apply backgroundColor when backgroundType=none', () => {
      render(
        <BlockWrapper fields={{ backgroundType: 'none', backgroundColor: '#ff0000' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.backgroundColor).toBeUndefined();
    });
  });

  describe('background — gradient', () => {
    it('applies background gradient sx when backgroundType=gradient', () => {
      render(
        <BlockWrapper
          fields={{
            backgroundType: 'gradient',
            backgroundGradientFrom: '#000000',
            backgroundGradientTo: '#ffffff',
            backgroundGradientDirection: 'to-r',
          }}
        >
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(typeof sx.background).toBe('string');
      expect((sx.background as string).includes('linear-gradient')).toBe(true);
    });
  });

  describe('overlay', () => {
    it('renders overlay div when backgroundOverlayEnabled=true with solid background', () => {
      render(
        <BlockWrapper
          fields={{
            backgroundType: 'solid',
            backgroundColor: '#333333',
            backgroundOverlayEnabled: true,
            backgroundOverlayColor: '#000000',
            backgroundOverlayOpacity: 50,
          }}
        >
          <span>content</span>
        </BlockWrapper>
      );
      // The overlay div is a plain div rendered by React.createElement in useBlockBackground
      // It appears as a child inside the Box
      const allDivs = document.querySelectorAll('div');
      // Check position:absolute overlay exists
      const overlayDiv = Array.from(allDivs).find(
        (d) => d.style.position === 'absolute' && d.style.inset === '0'
      );
      expect(overlayDiv).toBeTruthy();
    });

    it('does NOT render overlay when backgroundOverlayEnabled=false', () => {
      render(
        <BlockWrapper
          fields={{
            backgroundType: 'solid',
            backgroundColor: '#333333',
            backgroundOverlayEnabled: false,
          }}
        >
          <span>content</span>
        </BlockWrapper>
      );
      const allDivs = document.querySelectorAll('div');
      const overlayDiv = Array.from(allDivs).find(
        (d) => d.style.position === 'absolute' && d.style.inset === '0'
      );
      expect(overlayDiv).toBeFalsy();
    });
  });

  describe('backgroundOverlayOpacity normalization (0-100 → 0-1)', () => {
    it('normalizes opacity 50 to 0.5 in overlay style', () => {
      render(
        <BlockWrapper
          fields={{
            backgroundType: 'solid',
            backgroundColor: '#333333',
            backgroundOverlayEnabled: true,
            backgroundOverlayColor: '#000000',
            backgroundOverlayOpacity: 50,
          }}
        >
          <span>content</span>
        </BlockWrapper>
      );
      const allDivs = document.querySelectorAll('div');
      const overlayDiv = Array.from(allDivs).find(
        (d) => d.style.position === 'absolute' && d.style.inset === '0'
      );
      expect(overlayDiv).toBeTruthy();
      expect(overlayDiv!.style.opacity).toBe('0.5');
    });

    it('normalizes opacity 100 to 1.0 in overlay style', () => {
      render(
        <BlockWrapper
          fields={{
            backgroundType: 'solid',
            backgroundColor: '#333333',
            backgroundOverlayEnabled: true,
            backgroundOverlayColor: '#000000',
            backgroundOverlayOpacity: 100,
          }}
        >
          <span>content</span>
        </BlockWrapper>
      );
      const allDivs = document.querySelectorAll('div');
      const overlayDiv = Array.from(allDivs).find(
        (d) => d.style.position === 'absolute' && d.style.inset === '0'
      );
      expect(overlayDiv!.style.opacity).toBe('1');
    });

    it('normalizes opacity 0 to 0 in overlay style', () => {
      render(
        <BlockWrapper
          fields={{
            backgroundType: 'solid',
            backgroundColor: '#333333',
            backgroundOverlayEnabled: true,
            backgroundOverlayColor: '#000000',
            backgroundOverlayOpacity: 0,
          }}
        >
          <span>content</span>
        </BlockWrapper>
      );
      const allDivs = document.querySelectorAll('div');
      const overlayDiv = Array.from(allDivs).find(
        (d) => d.style.position === 'absolute' && d.style.inset === '0'
      );
      expect(overlayDiv!.style.opacity).toBe('0');
    });

    it('passes undefined opacity as-is (hook uses default 0.4)', () => {
      // When backgroundOverlayOpacity is undefined, we pass undefined to hook
      // Hook default is 0.4 — the normalization only divides numbers
      render(
        <BlockWrapper
          fields={{
            backgroundType: 'solid',
            backgroundColor: '#333333',
            backgroundOverlayEnabled: true,
            backgroundOverlayColor: '#000000',
            // backgroundOverlayOpacity intentionally omitted
          }}
        >
          <span>content</span>
        </BlockWrapper>
      );
      const allDivs = document.querySelectorAll('div');
      const overlayDiv = Array.from(allDivs).find(
        (d) => d.style.position === 'absolute' && d.style.inset === '0'
      );
      expect(overlayDiv).toBeTruthy();
      // Hook default is 0.4 — should render with 0.4 opacity
      expect(overlayDiv!.style.opacity).toBe('0.4');
    });
  });

  describe('effects', () => {
    it('applies boxShadow when shadowSize=md', () => {
      render(
        <BlockWrapper fields={{ shadowSize: 'md' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(typeof sx.boxShadow).toBe('string');
      expect((sx.boxShadow as string).length).toBeGreaterThan(0);
      expect(sx.boxShadow).not.toBe('none');
    });

    it('applies boxShadow when shadowSize=lg', () => {
      render(
        <BlockWrapper fields={{ shadowSize: 'lg' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.boxShadow).toContain('rgba(0,0,0,0.1)');
    });

    it('does NOT apply boxShadow when shadowSize=none', () => {
      render(
        <BlockWrapper fields={{ shadowSize: 'none' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.boxShadow).toBeUndefined();
    });

    it('applies border when borderWidth and borderColor are set', () => {
      render(
        <BlockWrapper fields={{ borderWidth: 2, borderColor: '#cccccc' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.border).toBe('2px solid #cccccc');
    });

    it('applies borderRadius when set', () => {
      render(
        <BlockWrapper fields={{ borderRadius: 8 }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.borderRadius).toBe('8px');
    });
  });

  describe('spacing', () => {
    it('applies pt=6 when paddingTop=lg', () => {
      render(
        <BlockWrapper fields={{ paddingTop: 'lg' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.pt).toBe(6);
    });

    it('applies pb=2 when paddingBottom=sm', () => {
      render(
        <BlockWrapper fields={{ paddingBottom: 'sm' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.pb).toBe(2);
    });

    it('applies pt=0 and pb=0 when paddingTop=none and paddingBottom=none', () => {
      render(
        <BlockWrapper fields={{ paddingTop: 'none', paddingBottom: 'none' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.pt).toBe(0);
      expect(sx.pb).toBe(0);
    });

    it('applies pt=8 when paddingTop=xl', () => {
      render(
        <BlockWrapper fields={{ paddingTop: 'xl' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.pt).toBe(8);
    });

    it('applies mt when marginTop is set', () => {
      render(
        <BlockWrapper fields={{ marginTop: 'md' }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.mt).toBe(4);
    });
  });

  describe('responsive visibility', () => {
    it('applies display:none for xs and sm when hideOnMobile=true', () => {
      render(
        <BlockWrapper fields={{ hideOnMobile: true }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      const display = sx.display as Record<string, string>;
      expect(display.xs).toBe('none');
      expect(display.sm).toBe('none');
    });

    it('applies display:none for md when hideOnTablet=true', () => {
      render(
        <BlockWrapper fields={{ hideOnTablet: true }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      const display = sx.display as Record<string, string>;
      expect(display.md).toBe('none');
    });

    it('applies display:none for lg and xl when hideOnDesktop=true', () => {
      render(
        <BlockWrapper fields={{ hideOnDesktop: true }}>
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      const display = sx.display as Record<string, string>;
      expect(display.lg).toBe('none');
      expect(display.xl).toBe('none');
    });

    it('returns null when hideOnMobile+hideOnTablet+hideOnDesktop are all true', () => {
      const { container } = render(
        <BlockWrapper fields={{ hideOnMobile: true, hideOnTablet: true, hideOnDesktop: true }}>
          <span data-testid="child">content</span>
        </BlockWrapper>
      );
      expect(container.firstChild).toBeNull();
      expect(screen.queryByTestId('child')).toBeNull();
    });
  });

  describe('position:relative when overlay present', () => {
    it('adds position:relative to outer box sx when background + overlay enabled', () => {
      render(
        <BlockWrapper
          fields={{
            backgroundType: 'solid',
            backgroundColor: '#123456',
            backgroundOverlayEnabled: true,
          }}
        >
          <span>content</span>
        </BlockWrapper>
      );
      const box = getFirstBox();
      const sx = getSx(box);
      expect(sx.position).toBe('relative');
    });
  });

  describe('combined: animation + background + spacing', () => {
    it('renders motion.div + solid background + custom padding together', () => {
      render(
        <BlockWrapper
          fields={{
            animationEntranceType: 'fade-in',
            backgroundType: 'solid',
            backgroundColor: '#aabbcc',
            paddingTop: 'xl',
            paddingBottom: 'sm',
          }}
        >
          <span data-testid="child">content</span>
        </BlockWrapper>
      );
      expect(screen.getByTestId('motion-div')).toBeInTheDocument();
      expect(screen.getByTestId('child')).toBeInTheDocument();
      // The Box inside motion.div should have background + spacing
      const boxes = screen.getAllByTestId('mui-box');
      const innerBox = boxes[0];
      const sx = getSx(innerBox);
      expect(sx.backgroundColor).toBe('#aabbcc');
      expect(sx.pt).toBe(8);
      expect(sx.pb).toBe(2);
    });
  });
});
