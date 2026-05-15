/**
 * AnimatedList — Per-item stagger animation wrapper
 * Step 14.1.1
 *
 * Wraps each valid React child in a motion.div with staggered whileInView entrance.
 * Respects prefers-reduced-motion and auto-disables when user has reduced motion set.
 * React.memo wrapped per vercel-react-best-practices.
 */

import React, { memo, isValidElement, Children } from "react";
import { motion } from "framer-motion";
import { getStaggerDelay } from "../hooks";

// ── Types ──────────────────────────────────────────────────────────────────────

export type AnimatedListDirection = "up" | "down" | "left" | "right" | "none";

export interface AnimatedListProps {
  children?: React.ReactNode;
  /** Milliseconds between each child's animation start. Default: 80 */
  staggerMs?: number;
  /** Base delay in milliseconds before the first child animates. Default: 0 */
  baseDelay?: number;
  /** Direction of entrance animation. Default: 'up' */
  direction?: AnimatedListDirection;
  /** When true, renders children without animation wrappers. Default: false */
  disabled?: boolean;
  /**
   * Inline style applied to each motion.div wrapper.
   * Use { display: 'contents' } to preserve Grid/flex layout when wrapping Grid items.
   */
  wrapperStyle?: React.CSSProperties;
}

// ── Direction offset map ───────────────────────────────────────────────────────

const DIRECTION_MAP: Record<AnimatedListDirection, { y?: number; x?: number }> =
  {
    up: { y: 32 },
    down: { y: -32 },
    left: { x: 32 },
    right: { x: -32 },
    none: {},
  };

// ── Easing (matching FadeIn.tsx pattern) ──────────────────────────────────────

const EASING = [0.22, 0.61, 0.36, 1] as const;

// ── Check prefers-reduced-motion ──────────────────────────────────────────────

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// ── AnimatedList component ────────────────────────────────────────────────────

const AnimatedList: React.FC<AnimatedListProps> = memo(
  ({
    children,
    staggerMs = 80,
    baseDelay = 0,
    direction = "up",
    disabled = false,
    wrapperStyle,
  }) => {
    // Auto-disable when user prefers reduced motion
    const isDisabled = disabled || prefersReducedMotion();

    const directionOffset = DIRECTION_MAP[direction] ?? DIRECTION_MAP.up;
    const initial = { opacity: 0, ...directionOffset };
    const animate = { opacity: 1, x: 0, y: 0 };

    let validChildIndex = 0;

    return (
      <>
        {Children.map(children, (child) => {
          // Pass non-element children (null, undefined, strings, booleans) through unchanged
          if (!isValidElement(child)) {
            return child;
          }

          if (isDisabled) {
            return child;
          }

          const delayMs = getStaggerDelay(
            validChildIndex,
            baseDelay,
            staggerMs,
          );
          validChildIndex += 1;

          return (
            <motion.div
              initial={initial}
              whileInView={animate}
              viewport={{ once: true, margin: "-60px 0px" }}
              transition={{
                duration: 0.6,
                delay: delayMs / 1000,
                ease: EASING,
              }}
              style={wrapperStyle}
            >
              {child}
            </motion.div>
          );
        })}
      </>
    );
  },
);

AnimatedList.displayName = "AnimatedList";

export default AnimatedList;
