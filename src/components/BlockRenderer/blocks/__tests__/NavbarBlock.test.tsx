/**
 * NavbarBlock Tests — Step 10.5
 * Tests for NAVBAR block variants, anchor scroll, backdropBlur, sticky, mobile hamburger
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import NavbarBlock from '../NavbarBlock';

// ── Helpers ────────────────────────────────────────────────────────────────────

const makeBlock = (content: Record<string, unknown> = {}) => ({
  id: 1,
  blockType: 'NAVBAR',
  sortOrder: 0,
  content: {
    brandName: 'TestBrand',
    navigationItems: [
      { label: 'Home', link: '/' },
      { label: 'About', link: '/about' },
    ],
    ...content,
  },
});

// ── Setup / teardown ──────────────────────────────────────────────────────────

beforeEach(() => {
  // Default desktop width
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1200,
  });
  Object.defineProperty(window, 'scrollY', {
    writable: true,
    configurable: true,
    value: 0,
  });
  // Mock scrollTo
  window.scrollTo = vi.fn() as typeof window.scrollTo;
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('NavbarBlock', () => {
  // ── 1. Renders brand name ──────────────────────────────────────────────────
  it('renders brand name from content.brandName', () => {
    render(<NavbarBlock block={makeBlock({ brandName: 'MyCompany' })} />);
    expect(screen.getByText('MyCompany')).toBeInTheDocument();
  });

  // ── 2. Renders nav items ───────────────────────────────────────────────────
  it('renders nav items from content.navigationItems', () => {
    render(
      <NavbarBlock
        block={makeBlock({
          navigationItems: [
            { label: 'Services', link: '/services' },
            { label: 'Contact', link: '/contact' },
          ],
        })}
      />
    );
    expect(screen.getByText('Services')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  // ── 3. Renders CTA when ctaText provided ──────────────────────────────────
  it('renders CTA when ctaText provided', () => {
    render(<NavbarBlock block={makeBlock({ ctaText: 'Get Started', ctaLink: '/signup' })} />);
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });

  // ── 4. Does NOT render CTA when ctaText absent ────────────────────────────
  it('does NOT render CTA when ctaText absent', () => {
    render(<NavbarBlock block={makeBlock({ ctaText: undefined })} />);
    expect(screen.queryByText('Get Started')).not.toBeInTheDocument();
  });

  // ── 5. Solid variant: nav has background color (not transparent) ───────────
  it('solid variant: nav has background color not transparent', () => {
    const { container } = render(<NavbarBlock block={makeBlock({ variant: 'solid' })} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    // Should have a non-transparent background
    const bg = nav!.style.background;
    expect(bg).not.toBe('rgba(0,0,0,0)');
    expect(bg).not.toBe('');
  });

  // ── 6. Transparent variant: nav initially has transparent background ───────
  it('transparent variant: nav initially has transparent background', () => {
    const { container } = render(<NavbarBlock block={makeBlock({ variant: 'transparent' })} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    // jsdom normalizes rgba spacing
    expect(nav!.style.background).toMatch(/rgba\(0,?\s*0,?\s*0,?\s*0\)/);
  });

  // ── 7. Transparent variant: scroll event changes background ───────────────
  it('transparent variant: scroll event changes background on scroll > 50px', async () => {
    const { container } = render(<NavbarBlock block={makeBlock({ variant: 'transparent' })} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();

    // Initially transparent
    expect(nav!.style.background).toMatch(/rgba\(0,?\s*0,?\s*0,?\s*0\)/);

    // Simulate scroll past 50px
    await act(async () => {
      Object.defineProperty(window, 'scrollY', {
        writable: true,
        configurable: true,
        value: 100,
      });
      fireEvent.scroll(window);
    });

    expect(nav!.style.background).toMatch(/rgba\(255,?\s*255,?\s*255,?\s*0\.95\)/);
  });

  // ── 8. Centered variant: uses column flex or center alignment ─────────────
  it('centered variant: uses column flex layout', () => {
    const { container } = render(<NavbarBlock block={makeBlock({ variant: 'centered' })} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav!.style.flexDirection).toBe('column');
  });

  // ── 9. Left-aligned variant: uses flex-start justify ─────────────────────
  it('left-aligned variant: uses flex-start justify', () => {
    const { container } = render(<NavbarBlock block={makeBlock({ variant: 'left-aligned' })} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav!.style.justifyContent).toBe('flex-start');
  });

  // ── 10. Anchor scroll: clicking # link calls window.scrollTo smooth ───────
  it('anchor scroll: clicking # link calls window.scrollTo with smooth behavior', () => {
    const mockElement = document.createElement('div');
    mockElement.getBoundingClientRect = () =>
      ({
        top: 200,
        bottom: 0,
        left: 0,
        right: 0,
        width: 0,
        height: 0,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;
    vi.spyOn(document, 'querySelector').mockReturnValue(mockElement);

    render(
      <NavbarBlock
        block={makeBlock({
          navigationItems: [{ label: 'Section', link: '#section' }],
        })}
      />
    );

    const link = screen.getByText('Section').closest('a');
    expect(link).not.toBeNull();
    fireEvent.click(link!);

    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ behavior: 'smooth' }));
  });

  // ── 11. Anchor scroll: clicking regular http link does NOT call scrollTo ──
  it('anchor scroll: clicking regular http link does NOT call scrollTo', () => {
    render(
      <NavbarBlock
        block={makeBlock({
          navigationItems: [{ label: 'Page', link: '/about' }],
        })}
      />
    );

    const link = screen.getByText('Page').closest('a');
    expect(link).not.toBeNull();
    fireEvent.click(link!);

    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  // ── 12. backdropBlur 'sm': style includes backdropFilter with 4px ─────────
  it("backdropBlur 'sm': style includes backdropFilter with blur(4px)", () => {
    const { container } = render(<NavbarBlock block={makeBlock({ backdropBlur: 'sm' })} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav!.style.backdropFilter).toBe('blur(4px)');
  });

  // ── 13. backdropBlur 'none': no backdropFilter in style ───────────────────
  it("backdropBlur 'none': no backdropFilter in style", () => {
    const { container } = render(<NavbarBlock block={makeBlock({ backdropBlur: 'none' })} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav!.style.backdropFilter).toBeFalsy();
  });

  // ── 14. Sticky: position sticky in style when sticky=true ─────────────────
  it('sticky: position sticky in style when sticky=true', () => {
    const { container } = render(<NavbarBlock block={makeBlock({ sticky: true })} />);
    const nav = container.querySelector('nav');
    expect(nav).not.toBeNull();
    expect(nav!.style.position).toBe('sticky');
  });

  // ── 15. Hamburger: mobileOpen drawer renders when isMobile true ───────────
  it('hamburger: mobileOpen drawer renders when isMobile true', async () => {
    // Set mobile width before render
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 375,
    });

    render(<NavbarBlock block={makeBlock()} />);

    // Drawer should not be visible initially
    expect(screen.queryByTestId('mobile-drawer')).not.toBeInTheDocument();

    // Find hamburger button and click it
    const hamburger = screen.getByLabelText('Open menu');
    expect(hamburger).toBeInTheDocument();

    await act(async () => {
      fireEvent.click(hamburger);
    });

    // Drawer should now be visible
    expect(screen.getByTestId('mobile-drawer')).toBeInTheDocument();
  });
});
