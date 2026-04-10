/**
 * headingTypography — Step 14.2
 *
 * Maps heading typography field values (headingTextShadow, headingOpacity,
 * headingLineHeight) to concrete MUI sx-compatible CSS properties.
 *
 * Design notes:
 *   - textShadow returns undefined when set to 'none' (no visual change)
 *   - opacity returns undefined when set to 100 (default; no visual change)
 *   - lineHeight is always returned
 *   - Subheading shadows use 70% alpha of the heading shadow
 */

// ── Maps ───────────────────────────────────────────────────────────────────────

/** Maps headingTextShadow enum values to CSS text-shadow strings (heading). */
export const TEXT_SHADOW_MAP: Record<string, string> = {
  none: 'none',
  subtle: '0 2px 8px rgba(0,0,0,0.15)',
  medium: '0 4px 16px rgba(0,0,0,0.25)',
  dramatic: '0 8px 32px rgba(0,0,0,0.35)',
};

/**
 * Maps headingTextShadow enum values to CSS text-shadow strings (subheading).
 * Subheading shadows use 70% of the heading shadow alpha value.
 */
export const TEXT_SHADOW_MAP_SUBHEADING: Record<string, string> = {
  none: 'none',
  subtle: '0 2px 8px rgba(0,0,0,0.10)',
  medium: '0 4px 16px rgba(0,0,0,0.17)',
  dramatic: '0 8px 32px rgba(0,0,0,0.25)',
};

/** Maps headingLineHeight enum values to numeric line-height values. */
export const LINE_HEIGHT_MAP: Record<string, number> = {
  tight: 0.9,
  normal: 1.2,
  relaxed: 1.5,
};

// ── Gradient Direction Map ─────────────────────────────────────────────────────

const GRADIENT_DIRECTION_MAP: Record<string, string> = {
  'to-r': '90deg',
  'to-b': '180deg',
  'to-br': '135deg',
  'to-bl': '225deg',
};

// ── Interface ──────────────────────────────────────────────────────────────────

/** Subset of block content fields consumed by the typography resolvers. */
export interface HeadingTypographyFields {
  headingTextShadow?: string;
  headingOpacity?: number;
  headingLineHeight?: string;
  headingGradientText?: boolean;
  headingGradientFrom?: string;
  headingGradientTo?: string;
  headingGradientDirection?: string;
  headingTextStroke?: boolean;
  headingTextStrokeWidth?: string;
  headingTextStrokeColor?: string;
}

/** Resolved sx-compatible typography properties returned by the resolvers. */
export interface HeadingTypographySx {
  textShadow?: string;
  opacity?: number;
  lineHeight: number;
}

// ── Resolvers ──────────────────────────────────────────────────────────────────

/**
 * Returns an sx-compatible object for heading Typography elements.
 *
 * @param fields - Block content object containing heading typography fields.
 * @returns Partial sx object with textShadow, opacity (when non-default), and lineHeight.
 *
 * @example
 * resolveHeadingTypographySx({}) // { lineHeight: 1.2 }
 * resolveHeadingTypographySx({ headingTextShadow: 'dramatic', headingOpacity: 80, headingLineHeight: 'tight' })
 * // { textShadow: '0 8px 32px rgba(0,0,0,0.35)', opacity: 0.8, lineHeight: 0.9 }
 */
export function resolveHeadingTypographySx(fields: HeadingTypographyFields): HeadingTypographySx {
  const shadowKey = fields.headingTextShadow ?? 'none';
  const opacityValue = fields.headingOpacity ?? 100;
  const lineHeightKey = fields.headingLineHeight ?? 'normal';

  const textShadow = TEXT_SHADOW_MAP[shadowKey] ?? 'none';
  const lineHeight = LINE_HEIGHT_MAP[lineHeightKey] ?? LINE_HEIGHT_MAP.normal;

  const sx: HeadingTypographySx = { lineHeight };

  // Only emit textShadow when non-default (avoids no-op CSS)
  if (textShadow !== 'none') {
    sx.textShadow = textShadow;
  }

  // Only emit opacity when non-default (avoids no-op CSS)
  if (opacityValue !== 100) {
    sx.opacity = opacityValue / 100;
  }

  return sx;
}

/**
 * Returns an sx-compatible object for subheading Typography elements.
 *
 * Identical to resolveHeadingTypographySx except text shadows use 70% alpha
 * (reduced intensity suitable for secondary text). Opacity and lineHeight are
 * inherited from the heading fields unchanged.
 *
 * @param fields - Block content object containing heading typography fields.
 * @returns Partial sx object with textShadow (subheading intensity), opacity (when non-default), and lineHeight.
 */
export function resolveSubheadingTypographySx(
  fields: HeadingTypographyFields
): HeadingTypographySx {
  const shadowKey = fields.headingTextShadow ?? 'none';
  const opacityValue = fields.headingOpacity ?? 100;
  const lineHeightKey = fields.headingLineHeight ?? 'normal';

  const textShadow = TEXT_SHADOW_MAP_SUBHEADING[shadowKey] ?? 'none';
  const lineHeight = LINE_HEIGHT_MAP[lineHeightKey] ?? LINE_HEIGHT_MAP.normal;

  const sx: HeadingTypographySx = { lineHeight };

  // Only emit textShadow when non-default (avoids no-op CSS)
  if (textShadow !== 'none') {
    sx.textShadow = textShadow;
  }

  // Only emit opacity when non-default (avoids no-op CSS)
  if (opacityValue !== 100) {
    sx.opacity = opacityValue / 100;
  }

  return sx;
}

// ── Gradient Text Resolver ────────────────────────────────────────────────────

/**
 * Returns sx-compatible properties for gradient text fill.
 * When enabled, applies a CSS gradient background clipped to text, making the
 * text itself display the gradient colors.
 *
 * @returns Empty object when disabled; gradient fill sx when enabled.
 */
export function resolveGradientTextSx(fields: HeadingTypographyFields): Record<string, any> {
  if (!fields.headingGradientText) return {};

  const from = fields.headingGradientFrom || '#ff6b6b';
  const to = fields.headingGradientTo || '#4ecdc4';
  const dir = GRADIENT_DIRECTION_MAP[fields.headingGradientDirection ?? 'to-r'] ?? '90deg';

  return {
    background: `linear-gradient(${dir}, ${from}, ${to})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };
}

// ── Text Stroke Resolver ──────────────────────────────────────────────────────

/**
 * Returns sx-compatible properties for text stroke (outline).
 * When enabled, applies a WebkitTextStroke and sets color to transparent
 * (unless gradient text is also enabled, which handles fill separately).
 *
 * @returns Empty object when disabled; stroke sx when enabled.
 */
export function resolveTextStrokeSx(fields: HeadingTypographyFields): Record<string, any> {
  if (!fields.headingTextStroke) return {};

  const width = fields.headingTextStrokeWidth || '2';
  const color = fields.headingTextStrokeColor || '#ffffff';

  const sx: Record<string, any> = {
    WebkitTextStroke: `${width}px ${color}`,
  };

  // Only set transparent color when gradient is NOT active (gradient handles fill)
  if (!fields.headingGradientText) {
    sx.color = 'transparent';
  }

  return sx;
}
