import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useScrollParallax,
  type ParallaxIntensity,
  type ScrollParallaxOptions,
} from '../useScrollParallax';
import { createRef } from 'react';

// ── Mock framer-motion hooks ────────────────────────────────────────────────

const mockUseScroll = vi.fn().mockReturnValue({
  scrollYProgress: { get: () => 0 },
});

const mockUseTransform = vi.fn().mockReturnValue({
  get: () => '0%',
  set: vi.fn(),
});

const mockUseMotionValue = vi.fn().mockImplementation((initial: string) => ({
  get: () => initial,
  set: vi.fn(),
}));

vi.mock('framer-motion', () => ({
  useScroll: (...args: unknown[]) => mockUseScroll(...args),
  useTransform: (...args: unknown[]) => mockUseTransform(...args),
  useMotionValue: (...args: unknown[]) => mockUseMotionValue(...args),
}));

// ── matchMedia mock helper ──────────────────────────────────────────────────

function setupMatchMedia(overrides: Record<string, boolean> = {}) {
  const defaults: Record<string, boolean> = {
    '(prefers-reduced-motion: reduce)': false,
    '(pointer: coarse)': false,
    ...overrides,
  };

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: vi.fn((query: string) => ({
      matches: defaults[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      onchange: null,
      dispatchEvent: vi.fn(),
    })),
  });
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe('useScrollParallax', () => {
  beforeEach(() => {
    setupMatchMedia();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns enabled=false when intensity is "none" (default)', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref));
    expect(result.current.enabled).toBe(false);
  });

  it('returns enabled=false when intensity is explicitly "none"', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'none'));
    expect(result.current.enabled).toBe(false);
  });

  it('returns enabled=true for "subtle" intensity on desktop', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'subtle'));
    expect(result.current.enabled).toBe(true);
  });

  it('returns enabled=true for "medium" intensity on desktop', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'medium'));
    expect(result.current.enabled).toBe(true);
  });

  it('returns enabled=true for "strong" intensity on desktop', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'strong'));
    expect(result.current.enabled).toBe(true);
  });

  it('returns enabled=false when prefers-reduced-motion is reduce', () => {
    setupMatchMedia({ '(prefers-reduced-motion: reduce)': true });
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'strong'));
    expect(result.current.enabled).toBe(false);
  });

  it('returns enabled=false on coarse-pointer (mobile) devices', () => {
    setupMatchMedia({ '(pointer: coarse)': true });
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'medium'));
    expect(result.current.enabled).toBe(false);
  });

  it('always calls useScroll/useTransform regardless of enabled state (Rules of Hooks)', () => {
    const ref = createRef<HTMLElement>();
    renderHook(() => useScrollParallax(ref, 'none'));
    expect(mockUseScroll).toHaveBeenCalledTimes(1);
    // 2 useTransform calls (y + scale), 2 useMotionValue calls (y inert + scale inert)
    expect(mockUseTransform).toHaveBeenCalledTimes(2);
    expect(mockUseMotionValue).toHaveBeenCalledTimes(2);
  });

  it('passes correct transform range for subtle (±5%)', () => {
    const ref = createRef<HTMLElement>();
    renderHook(() => useScrollParallax(ref, 'subtle'));
    expect(mockUseTransform).toHaveBeenCalledWith(expect.anything(), [0, 1], ['-5%', '5%']);
  });

  it('passes correct transform range for medium (±12%)', () => {
    const ref = createRef<HTMLElement>();
    renderHook(() => useScrollParallax(ref, 'medium'));
    expect(mockUseTransform).toHaveBeenCalledWith(expect.anything(), [0, 1], ['-12%', '12%']);
  });

  it('passes correct transform range for strong (±20%)', () => {
    const ref = createRef<HTMLElement>();
    renderHook(() => useScrollParallax(ref, 'strong'));
    expect(mockUseTransform).toHaveBeenCalledWith(expect.anything(), [0, 1], ['-20%', '20%']);
  });

  it('passes correct scroll offset to useScroll', () => {
    const ref = createRef<HTMLElement>();
    renderHook(() => useScrollParallax(ref, 'subtle'));
    expect(mockUseScroll).toHaveBeenCalledWith({
      target: ref,
      offset: ['start end', 'end start'],
    });
  });

  it('returns inert MotionValue ("0%") when disabled', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'none'));
    expect(result.current.y.get()).toBe('0%');
  });

  it('returns y MotionValue object for all intensity levels', () => {
    const levels: ParallaxIntensity[] = ['none', 'subtle', 'medium', 'strong'];
    levels.forEach((intensity) => {
      const ref = createRef<HTMLElement>();
      const { result } = renderHook(() => useScrollParallax(ref, intensity));
      expect(result.current.y).toBeDefined();
      expect(typeof result.current.y.get).toBe('function');
    });
  });

  // ── Scale transform tests (Step 16.5) ─────────────────────────────────────

  it('returns scale MotionValue in result', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'medium'));
    expect(result.current.scale).toBeDefined();
    expect(typeof result.current.scale.get).toBe('function');
  });

  it('returns inert scale (1) when disabled', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'none'));
    expect(result.current.scale.get()).toBe(1);
  });

  it('returns inert scale (1) when transformType is "translate" (default)', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'medium'));
    // Default transformType is 'translate', so scale should be inert
    expect(result.current.scale.get()).toBe(1);
  });

  it('returns active scale when transformType is "scale"', () => {
    const ref = createRef<HTMLElement>();
    const options: ScrollParallaxOptions = { transformType: 'scale' };
    const { result } = renderHook(() => useScrollParallax(ref, 'medium', options));
    expect(result.current.scale).toBeDefined();
    // Scale should be active (not inert 1)
    expect(result.current.enabled).toBe(true);
  });

  it('returns inert y when transformType is "scale"', () => {
    const ref = createRef<HTMLElement>();
    const options: ScrollParallaxOptions = { transformType: 'scale' };
    const { result } = renderHook(() => useScrollParallax(ref, 'medium', options));
    // Y should be inert since we only want scale
    expect(result.current.y.get()).toBe('0%');
  });

  it('returns both active y and scale when transformType is "both"', () => {
    const ref = createRef<HTMLElement>();
    const options: ScrollParallaxOptions = { transformType: 'both' };
    const { result } = renderHook(() => useScrollParallax(ref, 'medium', options));
    expect(result.current.enabled).toBe(true);
    // Both should be active (not inert)
    expect(result.current.y).toBeDefined();
    expect(result.current.scale).toBeDefined();
  });

  it('passes custom scaleFrom/scaleTo to useTransform', () => {
    const ref = createRef<HTMLElement>();
    const options: ScrollParallaxOptions = {
      transformType: 'scale',
      scaleFrom: 1.3,
      scaleTo: 0.9,
    };
    renderHook(() => useScrollParallax(ref, 'medium', options));
    // useTransform called twice: once for Y, once for scale
    expect(mockUseTransform).toHaveBeenCalledWith(expect.anything(), [0, 1], [1.3, 0.9]);
  });

  it('uses default scaleFrom=1.16 and scaleTo=1 when not specified', () => {
    const ref = createRef<HTMLElement>();
    const options: ScrollParallaxOptions = { transformType: 'scale' };
    renderHook(() => useScrollParallax(ref, 'medium', options));
    expect(mockUseTransform).toHaveBeenCalledWith(expect.anything(), [0, 1], [1.16, 1]);
  });

  it('calls useTransform twice and useMotionValue twice (y+scale paths)', () => {
    const ref = createRef<HTMLElement>();
    renderHook(() => useScrollParallax(ref, 'medium'));
    // 2 useTransform calls (y active + scale active), 2 useMotionValue calls (y inert + scale inert)
    expect(mockUseTransform).toHaveBeenCalledTimes(2);
    expect(mockUseMotionValue).toHaveBeenCalledTimes(2);
  });

  it('backward compat: no options arg still works (translate only)', () => {
    const ref = createRef<HTMLElement>();
    const { result } = renderHook(() => useScrollParallax(ref, 'subtle'));
    expect(result.current.enabled).toBe(true);
    expect(result.current.y).toBeDefined();
    expect(result.current.scale.get()).toBe(1); // inert
  });
});
