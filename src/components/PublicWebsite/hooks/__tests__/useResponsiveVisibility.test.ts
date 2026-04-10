import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResponsiveVisibility } from '../useResponsiveVisibility';

describe('useResponsiveVisibility', () => {
  it('all false → isHidden=false, empty visibilitySx', () => {
    const { result } = renderHook(() => useResponsiveVisibility({}));
    expect(result.current.isHidden).toBe(false);
    expect(result.current.visibilitySx).toEqual({});
  });

  it('all hidden → isHidden=true, empty visibilitySx', () => {
    const { result } = renderHook(() =>
      useResponsiveVisibility({
        hideOnMobile: true,
        hideOnTablet: true,
        hideOnDesktop: true,
      })
    );
    expect(result.current.isHidden).toBe(true);
    expect(result.current.visibilitySx).toEqual({});
  });

  it('hideOnMobile hides xs and sm', () => {
    const { result } = renderHook(() => useResponsiveVisibility({ hideOnMobile: true }));
    expect(result.current.isHidden).toBe(false);
    const display = result.current.visibilitySx.display as Record<string, string>;
    expect(display.xs).toBe('none');
    expect(display.sm).toBe('none');
  });

  it('hideOnTablet hides md', () => {
    const { result } = renderHook(() => useResponsiveVisibility({ hideOnTablet: true }));
    const display = result.current.visibilitySx.display as Record<string, string>;
    expect(display.md).toBe('none');
  });

  it('hideOnDesktop hides lg and xl', () => {
    const { result } = renderHook(() => useResponsiveVisibility({ hideOnDesktop: true }));
    const display = result.current.visibilitySx.display as Record<string, string>;
    expect(display.lg).toBe('none');
    expect(display.xl).toBe('none');
  });

  it('hideOnMobile+hideOnDesktop leaves md visible', () => {
    const { result } = renderHook(() =>
      useResponsiveVisibility({ hideOnMobile: true, hideOnDesktop: true })
    );
    const display = result.current.visibilitySx.display as Record<string, string>;
    expect(display.md).toBeUndefined();
    expect(display.xs).toBe('none');
    expect(display.lg).toBe('none');
  });

  it('hideOnTablet+hideOnDesktop leaves xs/sm visible', () => {
    const { result } = renderHook(() =>
      useResponsiveVisibility({ hideOnTablet: true, hideOnDesktop: true })
    );
    const display = result.current.visibilitySx.display as Record<string, string>;
    expect(display.xs).toBeUndefined();
    expect(display.md).toBe('none');
  });

  it('result is memoized across re-renders with same fields', () => {
    const fields = { hideOnMobile: true };
    const { result, rerender } = renderHook(() => useResponsiveVisibility(fields));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  it('no flags returns empty visibilitySx (not display object)', () => {
    const { result } = renderHook(() => useResponsiveVisibility({ hideOnMobile: false }));
    expect(result.current.visibilitySx).toEqual({});
  });

  it('isHidden false when only some breakpoints hidden', () => {
    const { result } = renderHook(() =>
      useResponsiveVisibility({ hideOnMobile: true, hideOnTablet: false })
    );
    expect(result.current.isHidden).toBe(false);
  });
});
