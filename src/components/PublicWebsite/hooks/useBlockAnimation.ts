import { useMemo } from "react";

export type AnimationEntranceType =
  | "none"
  | "fade-in"
  | "slide-up"
  | "slide-down"
  | "scale-up"
  | "bounce"
  | "text-reveal";

export type AnimationDirection = "up" | "down" | "left" | "right";

export type FloatSpeed = "slow" | "normal" | "fast";
export type FloatIntensity = "subtle" | "normal" | "dramatic";

export interface BlockAnimationFields {
  animationEntranceType?: AnimationEntranceType;
  animationDuration?: number; // ms
  animationDelay?: number; // ms
  animationScrollTriggered?: boolean;
  animationDirection?: AnimationDirection;
  animationStaggerMs?: number; // per-word stagger for text-reveal (default 40)
  animationFloat?: boolean;
  animationFloatSpeed?: FloatSpeed;
  animationFloatIntensity?: FloatIntensity;
  blockId?: string; // used to generate unique keyframe names
}

export interface TextRevealConfig {
  parentVariants: {
    hidden: Record<string, unknown>;
    visible: Record<string, unknown>;
  };
  childVariants: {
    hidden: Record<string, unknown>;
    visible: Record<string, unknown>;
  };
  staggerChildren: number;
}

export interface BlockAnimationResult {
  shouldAnimate: boolean;
  motionProps: Record<string, unknown>;
  isTextReveal?: boolean;
  textRevealConfig?: TextRevealConfig;
  floatSx?: Record<string, unknown>;
}

const EASING = [0.22, 0.61, 0.36, 1];

const FLOAT_SPEED_MAP: Record<FloatSpeed, number> = {
  slow: 10,
  normal: 7,
  fast: 4,
};

const FLOAT_INTENSITY_MAP: Record<FloatIntensity, number> = {
  subtle: 6,
  normal: 12,
  dramatic: 20,
};

const DIRECTION_OFFSETS: Record<
  AnimationDirection,
  { x?: number; y?: number }
> = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 40 },
  right: { x: -40 },
};

function buildInitialAnimate(
  type: AnimationEntranceType,
  direction: AnimationDirection,
) {
  switch (type) {
    case "fade-in":
      return { initial: { opacity: 0 }, animate: { opacity: 1 } };
    case "slide-up":
    case "slide-down": {
      const offset = DIRECTION_OFFSETS[direction];
      return {
        initial: { opacity: 0, ...offset },
        animate: { opacity: 1, x: 0, y: 0 },
      };
    }
    case "scale-up":
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
      };
    case "bounce": {
      const offset = DIRECTION_OFFSETS[direction];
      return {
        initial: { opacity: 0, scale: 0.8, ...offset },
        animate: { opacity: 1, scale: 1, x: 0, y: 0 },
      };
    }
    default:
      return null;
  }
}

function buildFloatSx(
  blockId: string,
  speed: FloatSpeed,
  intensity: FloatIntensity,
  entranceDurationMs: number,
): Record<string, unknown> {
  const durationS = FLOAT_SPEED_MAP[speed];
  const px = FLOAT_INTENSITY_MAP[intensity];
  const keyframeName = `drift-${blockId}`;
  const delayS =
    entranceDurationMs > 0 ? `${entranceDurationMs / 1000}s` : "0s";

  return {
    [`@keyframes ${keyframeName}`]: {
      "0%": { transform: "translateY(0) scale(1)" },
      "50%": { transform: `translateY(-${px}px) scale(1.015)` },
      "100%": { transform: "translateY(0) scale(1)" },
    },
    animation: `${keyframeName} ${durationS}s ease-in-out infinite`,
    animationDelay: delayS,
    "@media (prefers-reduced-motion: reduce)": {
      animation: "none",
    },
  };
}

export function useBlockAnimation(
  fields: BlockAnimationFields,
): BlockAnimationResult {
  return useMemo(() => {
    const {
      animationEntranceType = "none",
      animationDuration = 400,
      animationDelay = 0,
      animationScrollTriggered = false,
      animationDirection,
      animationFloat = false,
      animationFloatSpeed = "normal",
      animationFloatIntensity = "normal",
      blockId = "block",
    } = fields;

    // Compute floatSx if float is enabled
    const floatSx = animationFloat
      ? buildFloatSx(
          blockId,
          animationFloatSpeed,
          animationFloatIntensity,
          animationEntranceType !== "none"
            ? animationDuration + animationDelay
            : 0,
        )
      : undefined;

    if (animationEntranceType === "none") {
      return { shouldAnimate: false, motionProps: {}, floatSx };
    }

    // ── Text-reveal: word-by-word staggered entrance ──────────────────────────
    if (animationEntranceType === "text-reveal") {
      const staggerChildren = (fields.animationStaggerMs ?? 40) / 1000;

      const childVariants = {
        hidden: { y: "110%", opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.5, ease: EASING },
        },
      };

      const parentVariants = {
        hidden: {},
        visible: { transition: { staggerChildren } },
      };

      return {
        shouldAnimate: true,
        motionProps: {},
        isTextReveal: true,
        textRevealConfig: { parentVariants, childVariants, staggerChildren },
        floatSx,
      };
    }

    // Backward compat: slide-down defaults to 'down', everything else to 'up'
    const effectiveDirection: AnimationDirection =
      animationDirection ??
      (animationEntranceType === "slide-down" ? "down" : "up");

    const states = buildInitialAnimate(
      animationEntranceType,
      effectiveDirection,
    );
    if (!states) {
      return { shouldAnimate: false, motionProps: {}, floatSx };
    }

    const durationS = animationDuration / 1000;
    const delayS = animationDelay / 1000;

    const isSpring = animationEntranceType === "bounce";

    const transition = isSpring
      ? { type: "spring", stiffness: 300, damping: 20, delay: delayS }
      : { duration: durationS, delay: delayS, ease: EASING };

    if (animationScrollTriggered) {
      return {
        shouldAnimate: true,
        motionProps: {
          initial: states.initial,
          whileInView: states.animate,
          viewport: { once: true, margin: "-60px 0px" },
          transition,
        },
        floatSx,
      };
    }

    return {
      shouldAnimate: true,
      motionProps: {
        initial: states.initial,
        animate: states.animate,
        transition,
      },
      floatSx,
    };
  }, [fields]);
}

export function getStaggerDelay(
  index: number,
  baseDelay = 0,
  staggerMs = 60,
): number {
  return baseDelay + index * staggerMs;
}
