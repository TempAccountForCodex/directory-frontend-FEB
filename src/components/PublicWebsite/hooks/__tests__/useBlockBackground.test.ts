import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBlockBackground } from '../useBlockBackground';

describe('useBlockBackground', () => {
  it('none type returns hasBackground=false', () => {
    const { result } = renderHook(() => useBlockBackground({ backgroundType: 'none' }));
    expect(result.current.hasBackground).toBe(false);
    expect(result.current.backgroundSx).toEqual({});
  });

  it('defaults to none when backgroundType omitted', () => {
    const { result } = renderHook(() => useBlockBackground({}));
    expect(result.current.hasBackground).toBe(false);
  });

  it('solid with valid hex sets backgroundColor', () => {
    const { result } = renderHook(() =>
      useBlockBackground({ backgroundType: 'solid', backgroundColor: '#ff0000' })
    );
    expect(result.current.hasBackground).toBe(true);
    expect(result.current.backgroundSx).toEqual({ backgroundColor: '#ff0000' });
  });

  it('solid with invalid hex returns empty', () => {
    const { result } = renderHook(() =>
      useBlockBackground({ backgroundType: 'solid', backgroundColor: 'red' })
    );
    expect(result.current.hasBackground).toBe(false);
  });

  it('solid with missing color returns empty', () => {
    const { result } = renderHook(() => useBlockBackground({ backgroundType: 'solid' }));
    expect(result.current.hasBackground).toBe(false);
  });

  it('gradient to-r produces linear-gradient to right', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'gradient',
        backgroundGradientFrom: '#000000',
        backgroundGradientTo: '#ffffff',
        backgroundGradientDirection: 'to-r',
      })
    );
    expect(result.current.backgroundSx.background).toContain('linear-gradient(to right');
    expect(result.current.hasBackground).toBe(true);
  });

  it('gradient to-b produces linear-gradient to bottom', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'gradient',
        backgroundGradientFrom: '#000000',
        backgroundGradientTo: '#ffffff',
        backgroundGradientDirection: 'to-b',
      })
    );
    expect(result.current.backgroundSx.background).toContain('to bottom');
  });

  it('gradient to-br produces linear-gradient to bottom right', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'gradient',
        backgroundGradientFrom: '#000000',
        backgroundGradientTo: '#ffffff',
        backgroundGradientDirection: 'to-br',
      })
    );
    expect(result.current.backgroundSx.background).toContain('to bottom right');
  });

  it('gradient radial produces radial-gradient', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'gradient',
        backgroundGradientFrom: '#000000',
        backgroundGradientTo: '#ffffff',
        backgroundGradientDirection: 'radial',
      })
    );
    expect(result.current.backgroundSx.background).toContain('radial-gradient');
  });

  it('image type sets backgroundImage with cover and center', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'image',
        backgroundImageUrl: 'https://example.com/img.jpg',
      })
    );
    expect(result.current.hasBackground).toBe(true);
    expect(result.current.backgroundSx.backgroundImage).toContain('url(');
    expect(result.current.backgroundSx.backgroundSize).toBe('cover');
    expect(result.current.backgroundSx.backgroundPosition).toBe('center');
  });

  it('image type with missing URL returns empty', () => {
    const { result } = renderHook(() => useBlockBackground({ backgroundType: 'image' }));
    expect(result.current.hasBackground).toBe(false);
  });

  it('overlay enabled returns overlayElement and contentSx with zIndex', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'solid',
        backgroundColor: '#000000',
        backgroundOverlayEnabled: true,
        backgroundOverlayColor: '#ffffff',
        backgroundOverlayOpacity: 0.5,
      })
    );
    expect(result.current.overlayElement).not.toBeNull();
    expect(result.current.contentSx).toEqual({ position: 'relative', zIndex: 1 });
  });

  it('overlay disabled returns null overlayElement', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'solid',
        backgroundColor: '#000000',
        backgroundOverlayEnabled: false,
      })
    );
    expect(result.current.overlayElement).toBeNull();
    expect(result.current.contentSx).toEqual({});
  });

  it('hex validation accepts 6-digit uppercase', () => {
    const { result } = renderHook(() =>
      useBlockBackground({ backgroundType: 'solid', backgroundColor: '#AABBCC' })
    );
    expect(result.current.hasBackground).toBe(true);
  });

  it('hex validation rejects 3-digit shorthand', () => {
    const { result } = renderHook(() =>
      useBlockBackground({ backgroundType: 'solid', backgroundColor: '#abc' })
    );
    expect(result.current.hasBackground).toBe(false);
  });

  it('image with backgroundParallax=true adds backgroundAttachment fixed', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'image',
        backgroundImageUrl: 'https://example.com/img.jpg',
        backgroundParallax: true,
      })
    );
    expect(result.current.hasBackground).toBe(true);
    expect(result.current.backgroundSx.backgroundAttachment).toBe('fixed');
  });

  it('image with backgroundParallax=true includes mobile scroll fallback', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'image',
        backgroundImageUrl: 'https://example.com/img.jpg',
        backgroundParallax: true,
      })
    );
    const mobileSx = result.current.backgroundSx['@media (max-width: 900px)'] as Record<
      string,
      unknown
    >;
    expect(mobileSx).toBeDefined();
    expect(mobileSx.backgroundAttachment).toBe('scroll');
  });

  it('image with backgroundParallax=false does not add backgroundAttachment', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'image',
        backgroundImageUrl: 'https://example.com/img.jpg',
        backgroundParallax: false,
      })
    );
    expect(result.current.backgroundSx.backgroundAttachment).toBeUndefined();
  });

  it('image without backgroundParallax field does not add backgroundAttachment', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'image',
        backgroundImageUrl: 'https://example.com/img.jpg',
      })
    );
    expect(result.current.backgroundSx.backgroundAttachment).toBeUndefined();
  });

  it('parallax on non-image type has no effect', () => {
    const { result } = renderHook(() =>
      useBlockBackground({
        backgroundType: 'solid',
        backgroundColor: '#123456',
        backgroundParallax: true,
      })
    );
    expect(result.current.backgroundSx.backgroundAttachment).toBeUndefined();
  });

  it('result is memoized across re-renders with same fields', () => {
    const fields = { backgroundType: 'solid' as const, backgroundColor: '#123456' };
    const { result, rerender } = renderHook(() => useBlockBackground(fields));
    const first = result.current;
    rerender();
    expect(result.current).toBe(first);
  });

  // backgroundOverlays tests
  describe('backgroundOverlays', () => {
    it('empty array returns no overlayElements', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [],
        })
      );
      expect(result.current.overlayElements).toHaveLength(0);
      expect(result.current.contentSx).toEqual({});
    });

    it('undefined backgroundOverlays returns empty overlayElements', () => {
      const { result } = renderHook(() =>
        useBlockBackground({ backgroundType: 'solid', backgroundColor: '#000000' })
      );
      expect(result.current.overlayElements).toHaveLength(0);
    });

    it('single radial overlay returns one element', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [
            { type: 'radial', color: '#ff0000', position: 'top-right', opacity: 50, size: 'md' },
          ],
        })
      );
      expect(result.current.overlayElements).toHaveLength(1);
    });

    it('single overlay sets contentSx with zIndex 1', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [{ type: 'radial', color: '#ff0000' }],
        })
      );
      expect(result.current.contentSx).toEqual({ position: 'relative', zIndex: 1 });
    });

    it('two overlays returns two elements', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [
            { type: 'radial', color: '#ff0000', position: 'top-right', size: 'lg' },
            { type: 'radial', color: '#0000ff', position: 'bottom-left', size: 'lg' },
          ],
        })
      );
      expect(result.current.overlayElements).toHaveLength(2);
    });

    it('caps overlays at 3', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [
            { type: 'radial', color: '#ff0000' },
            { type: 'radial', color: '#00ff00' },
            { type: 'radial', color: '#0000ff' },
            { type: 'radial', color: '#ffffff' },
          ],
        })
      );
      expect(result.current.overlayElements).toHaveLength(3);
    });

    it('radial overlay background contains radial-gradient with position', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [
            { type: 'radial', color: '#ff0000', position: 'top-right', size: 'sm' },
          ],
        })
      );
      const el = result.current.overlayElements[0];
      const bg = (el.props as { style: { background: string } }).style.background;
      expect(bg).toContain('radial-gradient');
      expect(bg).toContain('100% 0%');
      expect(bg).toContain('40%');
    });

    it('linear overlay background contains linear-gradient with angle', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [{ type: 'linear', color: '#ff0000', angle: 45, size: 'lg' }],
        })
      );
      const el = result.current.overlayElements[0];
      const bg = (el.props as { style: { background: string } }).style.background;
      expect(bg).toContain('linear-gradient(45deg');
      expect(bg).toContain('80%');
    });

    it('overlay opacity is normalised from 0-100 to 0-1', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [{ type: 'radial', color: '#ff0000', opacity: 60 }],
        })
      );
      const el = result.current.overlayElements[0];
      const opacity = (el.props as { style: { opacity: number } }).style.opacity;
      expect(opacity).toBeCloseTo(0.6);
    });

    it('overlay has pointerEvents none', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [{ type: 'radial', color: '#ff0000' }],
        })
      );
      const el = result.current.overlayElements[0];
      expect((el.props as { style: { pointerEvents: string } }).style.pointerEvents).toBe('none');
    });

    it('overlay and backgroundOverlayEnabled together both render', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlayEnabled: true,
          backgroundOverlayColor: '#ffffff',
          backgroundOverlayOpacity: 0.3,
          backgroundOverlays: [{ type: 'radial', color: '#ff0000' }],
        })
      );
      expect(result.current.overlayElement).not.toBeNull();
      expect(result.current.overlayElements).toHaveLength(1);
      expect(result.current.contentSx).toEqual({ position: 'relative', zIndex: 1 });
    });

    it('bottom-left position maps correctly', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [{ type: 'radial', color: '#ff0000', position: 'bottom-left' }],
        })
      );
      const el = result.current.overlayElements[0];
      const bg = (el.props as { style: { background: string } }).style.background;
      expect(bg).toContain('0% 100%');
    });

    it('center position maps correctly', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [{ type: 'radial', color: '#ff0000', position: 'center' }],
        })
      );
      const el = result.current.overlayElements[0];
      const bg = (el.props as { style: { background: string } }).style.background;
      expect(bg).toContain('50% 50%');
    });

    it('size lg maps to 80%', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [{ type: 'radial', color: '#ff0000', size: 'lg' }],
        })
      );
      const el = result.current.overlayElements[0];
      const bg = (el.props as { style: { background: string } }).style.background;
      expect(bg).toContain('80%');
    });

    it('size md defaults when not provided', () => {
      const { result } = renderHook(() =>
        useBlockBackground({
          backgroundType: 'solid',
          backgroundColor: '#000000',
          backgroundOverlays: [{ type: 'radial', color: '#ff0000' }],
        })
      );
      const el = result.current.overlayElements[0];
      const bg = (el.props as { style: { background: string } }).style.background;
      expect(bg).toContain('60%');
    });
  });
});
