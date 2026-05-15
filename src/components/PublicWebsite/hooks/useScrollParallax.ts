/**
 * useScrollParallax — Step 15.6 + 16.5: Scroll-Driven Parallax Transform
 *
 * Smooth scroll-driven transforms via Framer Motion useScroll + useTransform.
 * Supports Y-axis translation, scale transforms (zoom-out on scroll), or both.
 *
 * parallaxIntensity enum → translation range:
 *   'none'   →  0%  (disabled)
 *   'subtle' → ±5%
 *   'medium' → ±12%
 *   'strong' → ±20%
 *
 * transformType:
 *   'translate' → Y-axis translation only (default, backward compat)
 *   'scale'     → Scale transform only (e.g. zoom-out from 1.16 to 1)
 *   'both'      → Both translation and scale simultaneously
 *
 * Automatically disabled when:
 *   - intensity is 'none' (default)
 *   - user has prefers-reduced-motion: reduce
 *   - touch/coarse-pointer device (mobile)
 */

import { type RefObject } from "react";
import {
  useScroll,
  useTransform,
  useMotionValue,
  type MotionValue,
} from "framer-motion";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ParallaxIntensity = "none" | "subtle" | "medium" | "strong";

export type ParallaxTransformType = "translate" | "scale" | "both";

export interface ScrollParallaxOptions {
  /** Which transform to apply. Default: 'translate' (backward compat) */
  transformType?: ParallaxTransformType;
  /** Scale value at scroll start (top of viewport). Default: 1.16 */
  scaleFrom?: number;
  /** Scale value at scroll end (bottom of viewport). Default: 1 */
  scaleTo?: number;
}

export interface ScrollParallaxResult {
  /** MotionValue<string> — apply as `style={{ y }}` on a motion element */
  y: MotionValue<string>;
  /** MotionValue<number> — apply as `style={{ scale }}` on a motion element */
  scale: MotionValue<number>;
  /** True when parallax is actively driven by scroll */
  enabled: boolean;
}

// ── Constants ──────────────────────────────────────────────────────────────────

const INTENSITY_PCT: Record<ParallaxIntensity, number> = {
  none: 0,
  subtle: 5,
  medium: 12,
  strong: 20,
};

const DEFAULT_SCALE_FROM = 1.16;
const DEFAULT_SCALE_TO = 1;

// ── Helpers ────────────────────────────────────────────────────────────────────

function checkParallaxEnabled(intensity: ParallaxIntensity): boolean {
  if (INTENSITY_PCT[intensity] === 0) return false;
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return false;
  if (window.matchMedia("(pointer: coarse)").matches) return false;
  return true;
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useScrollParallax(
  ref: RefObject<HTMLElement | null>,
  intensity: ParallaxIntensity = "none",
  options?: ScrollParallaxOptions,
): ScrollParallaxResult {
  const enabled = checkParallaxEnabled(intensity);
  const pct = INTENSITY_PCT[intensity] ?? 0;
  const transformType = options?.transformType ?? "translate";
  const scaleFrom = options?.scaleFrom ?? DEFAULT_SCALE_FROM;
  const scaleTo = options?.scaleTo ?? DEFAULT_SCALE_TO;

  // Always call scroll hooks (Rules of Hooks — no conditionals)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Y-axis translation: MotionValue driven by scroll position
  const yActive = useTransform(
    scrollYProgress,
    [0, 1],
    [`-${pct}%`, `${pct}%`],
  );

  // Scale: MotionValue driven by scroll position
  const scaleActive = useTransform(
    scrollYProgress,
    [0, 1],
    [scaleFrom, scaleTo],
  );

  // Inert: static values when disabled
  const yInert = useMotionValue("0%");
  const scaleInert = useMotionValue(1);

  const useTranslate =
    transformType === "translate" || transformType === "both";
  const useScale = transformType === "scale" || transformType === "both";

  return {
    y: enabled && useTranslate ? yActive : yInert,
    scale: enabled && useScale ? scaleActive : scaleInert,
    enabled,
  };
}
