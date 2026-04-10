/**
 * BlockWrapper — Step 9.6.1
 *
 * Composes all 5 design hooks into a single wrapper component:
 *   - useBlockAnimation    → framer-motion entrance animation
 *   - useBlockBackground   → solid / gradient / image background + overlay
 *   - useBlockEffects      → shadow, border, borderRadius
 *   - useBlockSpacing      → paddingTop/Bottom/marginTop/Bottom tokens
 *   - useResponsiveVisibility → hide on mobile / tablet / desktop
 *
 * Zero overhead when all fields are defaults: renders children directly inside
 * a single MUI Box with default spacing applied (no animation, no overlay).
 *
 * IMPORTANT: registry stores backgroundOverlayOpacity as 0-100 integer.
 * This component normalises it to 0-1 before passing to useBlockBackground,
 * which expects a CSS opacity float.
 */

import React, { useMemo } from 'react';
import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import {
  useBlockAnimation,
  useBlockBackground,
  useBlockEffects,
  useBlockSpacing,
  useResponsiveVisibility,
} from './hooks';
import type {
  BlockAnimationFields,
  BlockBackgroundFields,
  BlockEffectsFields,
  BlockSpacingFields,
  ResponsiveVisibilityFields,
} from './hooks';
import { resolveSectionColors, type SectionColorMode } from './utils/sectionColors';

// ---------------------------------------------------------------------------
// Registry → Hook field name mapping (additive: originals are preserved)
// ---------------------------------------------------------------------------

const REGISTRY_TO_HOOK_MAP: Record<string, string> = {
  spacingPaddingTop: 'paddingTop',
  spacingPaddingBottom: 'paddingBottom',
  spacingMarginTop: 'marginTop',
  spacingMarginBottom: 'marginBottom',
  effectsShadow: 'shadowSize',
  effectsBorderWidth: 'borderWidth',
  effectsBorderColor: 'borderColor',
  effectsBorderRadius: 'borderRadius',
  effectsBackdropBlur: 'backdropBlur',
  backgroundGradientStart: 'backgroundGradientFrom',
  backgroundGradientEnd: 'backgroundGradientTo',
  backgroundImage: 'backgroundImageUrl',
  responsiveHideOnMobile: 'hideOnMobile',
  responsiveHideOnTablet: 'hideOnTablet',
  responsiveHideOnDesktop: 'hideOnDesktop',
};

/** Registry fields stored as string enums that hooks expect as numbers. */
const NUMERIC_FIELDS = new Set(['effectsBorderWidth', 'effectsBorderRadius']);

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SectionColorFields {
  sectionColorMode?: SectionColorMode;
  sectionTextColor?: string;
}

export type BlockWrapperFields = BlockAnimationFields &
  BlockBackgroundFields &
  BlockEffectsFields &
  BlockSpacingFields &
  ResponsiveVisibilityFields &
  SectionColorFields;

export interface BlockWrapperProps {
  /** The union of all 5 hook field interfaces — pass block.content directly */
  fields: BlockWrapperFields;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const BlockWrapper: React.FC<BlockWrapperProps> = React.memo(
  ({ fields: rawFields, children }) => {
    // Guard: block.content may be null/undefined from the API; normalise to an
    // empty object so all hooks can fall back to their own defaults safely.
    // Also map prefixed registry field names to the shorter hook field names.
    // The mapping is additive — original keys are kept for other consumers.
    // Direct (hook-named) values take precedence over registry-mapped ones.
    const fields: BlockWrapperFields = useMemo(() => {
      const raw = rawFields ?? {};
      const normalized: Record<string, unknown> = { ...raw };
      for (const [registryKey, hookKey] of Object.entries(REGISTRY_TO_HOOK_MAP)) {
        if (registryKey in raw && !(hookKey in raw)) {
          const val = raw[registryKey as keyof typeof raw];
          normalized[hookKey] =
            NUMERIC_FIELDS.has(registryKey) && typeof val === 'string' ? Number(val) : val;
        }
      }
      return normalized as BlockWrapperFields;
    }, [rawFields]);

    // Normalise backgroundOverlayOpacity from 0-100 (registry) → 0-1 (CSS).
    // Only divide when it is a number; leave undefined so the hook can use its
    // own default (0.4) when the field is not set by the author.
    // Clamp to [0, 1] to guard against out-of-range registry values.
    const backgroundFields: BlockBackgroundFields = useMemo(
      () => ({
        ...fields,
        backgroundOverlayOpacity:
          typeof fields.backgroundOverlayOpacity === 'number'
            ? Math.min(1, Math.max(0, fields.backgroundOverlayOpacity / 100))
            : undefined,
      }),
      [fields]
    );

    const { shouldAnimate, motionProps, floatSx } = useBlockAnimation(fields);
    const { hasBackground, backgroundSx, overlayElement, overlayElements, contentSx } =
      useBlockBackground(backgroundFields);
    const { effectsSx } = useBlockEffects(fields);
    const { spacingSx } = useBlockSpacing(fields);
    const { isHidden, visibilitySx } = useResponsiveVisibility(fields);

    // Resolve per-section color override (mode: default/light/dark/custom).
    const sectionColorSx = useMemo(
      () => resolveSectionColors(fields.sectionColorMode, fields.sectionTextColor),
      [fields.sectionColorMode, fields.sectionTextColor]
    );

    // Fully hidden — return null with no DOM overhead.
    if (isHidden) return null;

    const hasAnyOverlay = hasBackground && (!!overlayElement || overlayElements.length > 0);

    // Merge all sx objects: spacing → background → effects → sectionColor → visibility.
    // Section color is applied after background so custom overrides take precedence.
    // When overlay is present we need position:relative on the outer box so the
    // absolutely-positioned overlay div is scoped correctly.
    const mergedSx: Record<string, unknown> = {
      ...spacingSx,
      ...backgroundSx,
      ...effectsSx,
      ...sectionColorSx,
      ...visibilitySx,
      ...(hasAnyOverlay ? { position: 'relative' } : {}),
      ...(floatSx ?? {}),
    };

    // Inner content — children are wrapped in contentSx when an overlay is active
    // so they appear above the overlay (zIndex:1).
    const innerContent = hasAnyOverlay ? (
      <>
        {overlayElement}
        {overlayElements}
        <Box sx={contentSx}>{children}</Box>
      </>
    ) : (
      children
    );

    // Animated path: outer motion.div handles entrance, inner Box carries styling.
    if (shouldAnimate) {
      return (
        <motion.div {...(motionProps as Record<string, unknown>)}>
          <Box sx={mergedSx}>{innerContent}</Box>
        </motion.div>
      );
    }

    // Default path: single Box with merged sx — zero extra DOM nodes.
    return <Box sx={mergedSx}>{innerContent}</Box>;
  }
);

BlockWrapper.displayName = 'BlockWrapper';

export default BlockWrapper;
