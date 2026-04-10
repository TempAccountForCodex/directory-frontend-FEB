import { useMemo } from 'react';

export type ShadowSize = 'none' | 'sm' | 'md' | 'lg' | 'xl';
export type BackdropBlurSize = 'none' | 'sm' | 'md' | 'lg';

export interface BlockEffectsFields {
  shadowSize?: ShadowSize;
  borderWidth?: number;
  borderColor?: string;
  borderRadius?: number;
  backdropBlur?: BackdropBlurSize;
}

export interface BlockEffectsResult {
  hasEffects: boolean;
  effectsSx: Record<string, unknown>;
}

const SHADOW_MAP: Record<ShadowSize, string> = {
  none: 'none',
  sm: '0 1px 2px rgba(0,0,0,0.05)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
  lg: '0 10px 15px rgba(0,0,0,0.1)',
  xl: '0 20px 25px rgba(0,0,0,0.15)',
};

const BLUR_MAP: Record<BackdropBlurSize, string> = {
  none: '',
  sm: '4px',
  md: '8px',
  lg: '16px',
};

export function useBlockEffects(fields: BlockEffectsFields): BlockEffectsResult {
  return useMemo(() => {
    const {
      shadowSize = 'none',
      borderWidth = 0,
      borderColor,
      borderRadius,
      backdropBlur = 'none',
    } = fields;

    const effectsSx: Record<string, unknown> = {};
    let hasEffects = false;

    if (shadowSize && shadowSize !== 'none') {
      effectsSx.boxShadow = SHADOW_MAP[shadowSize];
      hasEffects = true;
    }

    if (borderWidth > 0 && borderColor) {
      effectsSx.border = `${borderWidth}px solid ${borderColor}`;
      hasEffects = true;
    }

    if (borderRadius !== undefined) {
      effectsSx.borderRadius = `${borderRadius}px`;
      hasEffects = true;
    }

    if (backdropBlur && backdropBlur !== 'none') {
      const blurValue = BLUR_MAP[backdropBlur];
      if (blurValue) {
        effectsSx.backdropFilter = `blur(${blurValue})`;
        effectsSx.WebkitBackdropFilter = `blur(${blurValue})`;
        hasEffects = true;
      }
    }

    return { hasEffects, effectsSx };
  }, [fields]);
}
