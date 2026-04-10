import { useMemo } from 'react';
import React from 'react';

export type BackgroundType = 'none' | 'solid' | 'gradient' | 'image';
export type GradientDirection = 'to-r' | 'to-b' | 'to-br' | 'radial';
export type OverlayPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center';
export type OverlaySize = 'sm' | 'md' | 'lg';

export interface OverlayItem {
  type: 'radial' | 'linear';
  color: string;
  position?: OverlayPosition;
  opacity?: number;
  size?: OverlaySize;
  angle?: number;
}

export interface BlockBackgroundFields {
  backgroundType?: BackgroundType;
  backgroundColor?: string;
  backgroundGradientFrom?: string;
  backgroundGradientTo?: string;
  backgroundGradientDirection?: GradientDirection;
  backgroundImageUrl?: string;
  backgroundOverlayEnabled?: boolean;
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  backgroundParallax?: boolean;
  backgroundOverlays?: OverlayItem[];
}

export interface BlockBackgroundResult {
  hasBackground: boolean;
  backgroundSx: Record<string, unknown>;
  overlayElement: React.ReactElement | null;
  overlayElements: React.ReactElement[];
  contentSx: Record<string, unknown>;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const OVERLAY_SIZE_MAP: Record<OverlaySize, string> = { sm: '40%', md: '60%', lg: '80%' };

const POSITION_MAP: Record<OverlayPosition, string> = {
  'top-right': '100% 0%',
  'top-left': '0% 0%',
  'bottom-right': '100% 100%',
  'bottom-left': '0% 100%',
  center: '50% 50%',
};

function buildOverlayGradient(item: OverlayItem): string {
  const size = OVERLAY_SIZE_MAP[item.size ?? 'md'];
  const color = isValidHex(item.color) ? item.color : '#000000';
  if (item.type === 'radial') {
    const pos = POSITION_MAP[item.position ?? 'center'];
    return `radial-gradient(circle at ${pos}, ${color} 0%, transparent ${size})`;
  }
  const angle = typeof item.angle === 'number' ? item.angle : 135;
  return `linear-gradient(${angle}deg, ${color} 0%, transparent ${size})`;
}

function buildOverlayElements(overlays: OverlayItem[]): React.ReactElement[] {
  return overlays.slice(0, 3).map((item, i) =>
    React.createElement('div', {
      key: i,
      style: {
        position: 'absolute',
        inset: 0,
        background: buildOverlayGradient(item),
        opacity:
          typeof item.opacity === 'number' ? Math.min(1, Math.max(0, item.opacity / 100)) : 1,
        pointerEvents: 'none',
        zIndex: 0,
      },
    })
  );
}

function isValidHex(color?: string): boolean {
  return !!color && HEX_RE.test(color);
}

function resolveGradientDirection(dir?: GradientDirection): string {
  switch (dir) {
    case 'to-r':
      return 'to right';
    case 'to-b':
      return 'to bottom';
    case 'to-br':
      return 'to bottom right';
    case 'radial':
      return 'radial';
    default:
      return 'to bottom';
  }
}

export function useBlockBackground(fields: BlockBackgroundFields): BlockBackgroundResult {
  return useMemo(() => {
    const {
      backgroundType = 'none',
      backgroundColor,
      backgroundGradientFrom,
      backgroundGradientTo,
      backgroundGradientDirection,
      backgroundImageUrl,
      backgroundOverlayEnabled = false,
      backgroundOverlayColor = '#000000',
      backgroundOverlayOpacity = 0.4,
      backgroundParallax = false,
      backgroundOverlays,
    } = fields;

    const EMPTY: BlockBackgroundResult = {
      hasBackground: false,
      backgroundSx: {},
      overlayElement: null,
      overlayElements: [],
      contentSx: {},
    };

    let backgroundSx: Record<string, unknown> = {};

    if (backgroundType === 'solid') {
      if (!isValidHex(backgroundColor)) return EMPTY;
      backgroundSx = { backgroundColor };
    } else if (backgroundType === 'gradient') {
      const dir = resolveGradientDirection(backgroundGradientDirection);
      const from = isValidHex(backgroundGradientFrom) ? backgroundGradientFrom! : '#000000';
      const to = isValidHex(backgroundGradientTo) ? backgroundGradientTo! : '#ffffff';
      if (dir === 'radial') {
        backgroundSx = {
          background: `radial-gradient(circle, ${from}, ${to})`,
        };
      } else {
        backgroundSx = {
          background: `linear-gradient(${dir}, ${from}, ${to})`,
        };
      }
    } else if (backgroundType === 'image') {
      if (!backgroundImageUrl) return EMPTY;
      // Sanitize: only allow http/https/relative URLs; reject data: and javascript: schemes.
      // Also strip closing parenthesis to prevent CSS url() breakout.
      const sanitizedUrl =
        /^(https?:)?\/\//i.test(backgroundImageUrl) ||
        !/^[a-z][a-z0-9+\-.]*:/i.test(backgroundImageUrl)
          ? backgroundImageUrl.replace(/[()'"\\]/g, '')
          : '';
      if (!sanitizedUrl) return EMPTY;
      backgroundSx = {
        backgroundImage: `url(${sanitizedUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        ...(backgroundParallax && {
          backgroundAttachment: 'fixed',
          // Mobile fallback: fixed attachment is not supported on most mobile browsers
          '@media (max-width: 900px)': {
            backgroundAttachment: 'scroll',
          },
        }),
      };
    } else {
      return EMPTY;
    }

    let overlayElement: React.ReactElement | null = null;
    const overlayElements: React.ReactElement[] =
      Array.isArray(backgroundOverlays) && backgroundOverlays.length > 0
        ? buildOverlayElements(backgroundOverlays)
        : [];
    let contentSx: Record<string, unknown> = {};

    if (backgroundOverlayEnabled) {
      overlayElement = React.createElement('div', {
        style: {
          position: 'absolute',
          inset: 0,
          opacity: backgroundOverlayOpacity,
          backgroundColor: backgroundOverlayColor,
          pointerEvents: 'none',
        },
      });
    }

    if (overlayElement || overlayElements.length > 0) {
      contentSx = { position: 'relative', zIndex: 1 };
    }

    return {
      hasBackground: true,
      backgroundSx,
      overlayElement,
      overlayElements,
      contentSx,
    };
  }, [fields]);
}
