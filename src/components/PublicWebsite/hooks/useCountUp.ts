import { useRef, useState, useEffect, useCallback } from "react";

/**
 * Easing function: easeOutExpo
 * Starts fast and decelerates to a stop.
 */
function easeOutExpo(t: number): number {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Parse a numeric value from a string that may contain non-numeric characters.
 * Returns the first numeric value found (supports decimals and negatives).
 */
function parseNumericValue(
  value: string,
): { numericValue: number; hasDecimals: boolean } | null {
  const match = value.match(/-?\d+(\.\d+)?/);
  if (!match) return null;
  return {
    numericValue: parseFloat(match[0]),
    hasDecimals: match[1] !== undefined,
  };
}

export interface UseCountUpOptions {
  target: string;
  duration?: number;
  enabled?: boolean;
}

export interface UseCountUpResult {
  ref: React.RefObject<HTMLElement | null>;
  displayValue: string;
}

/**
 * Hook that animates a number counting up from 0 to target on scroll into view.
 * Uses IntersectionObserver for scroll trigger and requestAnimationFrame for smooth animation.
 * Respects prefers-reduced-motion media query.
 */
export function useCountUp({
  target,
  duration = 2000,
  enabled = true,
}: UseCountUpOptions): UseCountUpResult {
  const ref = useRef<HTMLElement | null>(null);
  const [displayValue, setDisplayValue] = useState(target);
  const hasAnimated = useRef(false);
  const animationFrame = useRef<number>(0);

  const animate = useCallback(() => {
    const parsed = parseNumericValue(target);
    if (!parsed) {
      setDisplayValue(target);
      return;
    }

    const { numericValue, hasDecimals } = parsed;
    const startTime = performance.now();

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);
      const currentValue = easedProgress * numericValue;

      if (hasDecimals) {
        setDisplayValue(currentValue.toFixed(1));
      } else {
        setDisplayValue(Math.round(currentValue).toString());
      }

      if (progress < 1) {
        animationFrame.current = requestAnimationFrame(step);
      }
    };

    setDisplayValue(hasDecimals ? "0.0" : "0");
    animationFrame.current = requestAnimationFrame(step);
  }, [target, duration]);

  useEffect(() => {
    if (!enabled) {
      setDisplayValue(target);
      return;
    }

    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setDisplayValue(target);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
    };
  }, [enabled, target, animate]);

  return { ref, displayValue };
}
