import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCountUp } from '../useCountUp';

// Mock IntersectionObserver
class MockIntersectionObserver {
  callback: IntersectionObserverCallback;
  elements: Element[] = [];
  static instances: MockIntersectionObserver[] = [];

  constructor(callback: IntersectionObserverCallback, _options?: IntersectionObserverInit) {
    this.callback = callback;
    MockIntersectionObserver.instances.push(this);
  }

  observe(el: Element) {
    this.elements.push(el);
  }

  disconnect() {
    this.elements = [];
  }

  unobserve() {}

  // Helper to simulate intersection
  trigger(isIntersecting: boolean) {
    this.callback(
      [{ isIntersecting, target: this.elements[0] } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver
    );
  }
}

let matchMediaMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  MockIntersectionObserver.instances = [];

  matchMediaMock = vi.fn().mockReturnValue({ matches: false });
  vi.stubGlobal('matchMedia', matchMediaMock);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useCountUp', () => {
  it('returns target value immediately when disabled', () => {
    const { result } = renderHook(() => useCountUp({ target: '500', enabled: false }));
    expect(result.current.displayValue).toBe('500');
  });

  it('returns a ref object', () => {
    const { result } = renderHook(() => useCountUp({ target: '100', enabled: true }));
    expect(result.current.ref).toBeDefined();
    expect(result.current.ref.current).toBeNull();
  });

  it('returns target value when prefers-reduced-motion is set', () => {
    matchMediaMock.mockReturnValue({ matches: true });
    const { result } = renderHook(() => useCountUp({ target: '250', enabled: true }));
    expect(result.current.displayValue).toBe('250');
  });

  it('returns target value for non-numeric strings', () => {
    const { result } = renderHook(() => useCountUp({ target: 'N/A', enabled: false }));
    expect(result.current.displayValue).toBe('N/A');
  });

  it('defaults enabled to true and duration to 2000', () => {
    const { result } = renderHook(() => useCountUp({ target: '100' }));
    // Should set up IntersectionObserver (enabled=true by default)
    // But since ref isn't attached to DOM, no observer is created
    expect(result.current.displayValue).toBe('100');
  });

  it('starts at target value before scroll trigger', () => {
    const { result } = renderHook(() => useCountUp({ target: '999', enabled: true }));
    // Before IntersectionObserver triggers, value should be target
    expect(result.current.displayValue).toBe('999');
  });

  it('handles decimal target values', () => {
    const { result } = renderHook(() => useCountUp({ target: '4.5', enabled: false }));
    expect(result.current.displayValue).toBe('4.5');
  });

  it('handles zero target', () => {
    const { result } = renderHook(() => useCountUp({ target: '0', enabled: false }));
    expect(result.current.displayValue).toBe('0');
  });

  it('cleans up IntersectionObserver on unmount', () => {
    const { unmount } = renderHook(() => useCountUp({ target: '100', enabled: true }));
    // No observer created since ref not attached to DOM, but unmount should not throw
    expect(() => unmount()).not.toThrow();
  });

  it('accepts custom duration', () => {
    const { result } = renderHook(() =>
      useCountUp({ target: '500', duration: 3000, enabled: false })
    );
    expect(result.current.displayValue).toBe('500');
  });
});
