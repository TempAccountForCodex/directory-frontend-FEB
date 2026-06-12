import { useMemo } from "react";
import React from "react";

export type BackgroundType =
  | "none"
  | "solid"
  | "gradient"
  | "image"
  | "video"
  | "animated"
  | "pattern";
export type GradientDirection = "to-r" | "to-b" | "to-br" | "radial";
export type OverlayPosition =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left"
  | "center";
export type OverlaySize = "sm" | "md" | "lg";

export interface OverlayItem {
  type: "radial" | "linear";
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
  backgroundVideoUrl?: string;
  backgroundAnimatedPreset?: string;
  backgroundPatternPreset?: string;
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
  videoElement: React.ReactElement | null;
}

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const OVERLAY_SIZE_MAP: Record<OverlaySize, string> = {
  sm: "40%",
  md: "60%",
  lg: "80%",
};

const POSITION_MAP: Record<OverlayPosition, string> = {
  "top-right": "100% 0%",
  "top-left": "0% 0%",
  "bottom-right": "100% 100%",
  "bottom-left": "0% 100%",
  center: "50% 50%",
};

function buildOverlayGradient(item: OverlayItem): string {
  const size = OVERLAY_SIZE_MAP[item.size ?? "md"];
  const color = isValidHex(item.color) ? item.color : "#000000";
  if (item.type === "radial") {
    const pos = POSITION_MAP[item.position ?? "center"];
    return `radial-gradient(circle at ${pos}, ${color} 0%, transparent ${size})`;
  }
  const angle = typeof item.angle === "number" ? item.angle : 135;
  return `linear-gradient(${angle}deg, ${color} 0%, transparent ${size})`;
}

function buildOverlayElements(overlays: OverlayItem[]): React.ReactElement[] {
  return overlays.slice(0, 3).map((item, i) =>
    React.createElement("div", {
      key: i,
      style: {
        position: "absolute",
        inset: 0,
        background: buildOverlayGradient(item),
        opacity:
          typeof item.opacity === "number"
            ? Math.min(1, Math.max(0, item.opacity / 100))
            : 1,
        pointerEvents: "none",
        zIndex: 0,
      },
    }),
  );
}

const ANIMATED_SX_MAP: Record<string, Record<string, unknown>> = {
  "moving-gradient": {
    "@keyframes mgKf": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
    background:
      "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
    backgroundSize: "400% 400%",
    animation: "mgKf 4s ease infinite",
  },
  "floating-bubbles": {
    "@keyframes fbKf": {
      "0%": { backgroundPosition: "25% 75%, 75% 25%, 55% 60%" },
      "33%": { backgroundPosition: "35% 65%, 65% 35%, 45% 55%" },
      "66%": { backgroundPosition: "20% 80%, 80% 22%, 60% 65%" },
      "100%": { backgroundPosition: "25% 75%, 75% 25%, 55% 60%" },
    },
    backgroundImage:
      "radial-gradient(circle closest-side, rgba(120,80,200,0.8) 0%, transparent 100%), radial-gradient(circle closest-side, rgba(200,80,120,0.8) 0%, transparent 100%), radial-gradient(circle closest-side, rgba(50,180,130,0.7) 0%, transparent 100%)",
    backgroundSize: "50% 50%, 40% 40%, 60% 60%",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#0f172a",
    backgroundPosition: "25% 75%, 75% 25%, 55% 60%",
    animation: "fbKf 5s ease-in-out infinite",
  },
  "particle-dots": {
    "@keyframes pdKf": {
      "0%": { backgroundPosition: "0 0" },
      "100%": { backgroundPosition: "16px 16px" },
    },
    background:
      "radial-gradient(circle, rgba(99,102,241,0.85) 1.5px, transparent 1.5px), #0f172a",
    backgroundSize: "16px 16px",
    animation: "pdKf 1.5s linear infinite",
  },
  "wave-motion": {
    "@keyframes wmKf": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
    background:
      "linear-gradient(60deg, #0f3460, #533483, #e94560, #0f3460, #16213e)",
    backgroundSize: "400% 400%",
    animation: "wmKf 5s ease-in-out infinite",
  },
  "neon-glow": {
    "@keyframes ngKf": {
      "0%": {
        boxShadow:
          "inset 0 0 20px rgba(0,255,200,0.15), inset 0 0 40px rgba(120,80,255,0.1)",
      },
      "50%": {
        boxShadow:
          "inset 0 0 40px rgba(0,255,200,0.5), inset 0 0 80px rgba(120,80,255,0.35)",
      },
      "100%": {
        boxShadow:
          "inset 0 0 20px rgba(0,255,200,0.15), inset 0 0 40px rgba(120,80,255,0.1)",
      },
    },
    background:
      "radial-gradient(ellipse at 50% 50%, #1a0533 0%, #000814 100%)",
    animation: "ngKf 2.5s ease-in-out infinite",
  },
  "soft-blobs": {
    "@keyframes sbKf": {
      "0%": { backgroundPosition: "0% 50%" },
      "33%": { backgroundPosition: "100% 0%" },
      "66%": { backgroundPosition: "50% 100%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
    background:
      "radial-gradient(ellipse at 30% 60%, rgba(255,105,180,0.55) 0%, transparent 55%), radial-gradient(ellipse at 70% 40%, rgba(100,210,255,0.55) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, rgba(255,180,100,0.4) 0%, transparent 55%), #fef3f8",
    backgroundSize: "200% 200%",
    animation: "sbKf 7s ease-in-out infinite",
  },
};

const STATIC_PATTERN_SX: Record<string, Record<string, unknown>> = {
  "dot-grid-dark": {
    backgroundImage:
      "radial-gradient(circle, rgba(0,200,150,0.5) 1.5px, transparent 1.5px)",
    backgroundSize: "20px 20px",
    backgroundColor: "#001a12",
  },
  "starfield-dark": {
    backgroundImage:
      "radial-gradient(ellipse at 25% 35%, rgba(0,100,80,0.45) 0%, transparent 60%), " +
      "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px), " +
      "radial-gradient(circle, rgba(255,255,255,0.4) 0.6px, transparent 0.6px)",
    backgroundSize: "100% 100%, 70px 70px, 35px 35px",
    backgroundPosition: "0 0, 8px 8px, 20px 18px",
    backgroundColor: "#001210",
  },
  "plexus-light": {
    backgroundImage:
      "radial-gradient(circle, rgba(140,140,190,0.7) 1.5px, transparent 1.5px), " +
      "linear-gradient(rgba(180,180,210,0.22) 1px, transparent 1px), " +
      "linear-gradient(90deg, rgba(180,180,210,0.22) 1px, transparent 1px)",
    backgroundSize: "40px 40px",
    backgroundColor: "#f8f8fc",
  },
  "diagonal-light": {
    backgroundImage:
      "repeating-linear-gradient(135deg, transparent 0px, transparent 40px, rgba(210,210,220,0.4) 40px, rgba(210,210,220,0.4) 42px)",
    backgroundColor: "#f5f5f8",
  },
  "mesh-dark": {
    backgroundImage:
      "linear-gradient(rgba(0,180,130,0.18) 1px, transparent 1px), " +
      "linear-gradient(90deg, rgba(0,180,130,0.18) 1px, transparent 1px)",
    backgroundSize: "28px 28px",
    backgroundColor: "#001510",
  },
  "waves-light": {
    backgroundImage:
      "repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(120,160,150,0.2) 29px)",
    backgroundColor: "#ffffff",
  },
};

function isValidHex(color?: string): boolean {
  return !!color && HEX_RE.test(color);
}

function resolveGradientDirection(dir?: GradientDirection): string {
  switch (dir) {
    case "to-r":
      return "to right";
    case "to-b":
      return "to bottom";
    case "to-br":
      return "to bottom right";
    case "radial":
      return "radial";
    default:
      return "to bottom";
  }
}

export function useBlockBackground(
  fields: BlockBackgroundFields,
): BlockBackgroundResult {
  return useMemo(() => {
    const {
      backgroundType = "none",
      backgroundColor,
      backgroundGradientFrom,
      backgroundGradientTo,
      backgroundGradientDirection,
      backgroundImageUrl,
      backgroundVideoUrl,
      backgroundAnimatedPreset,
      backgroundOverlayEnabled = false,
      backgroundOverlayColor = "#000000",
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
      videoElement: null,
    };

    let backgroundSx: Record<string, unknown> = {};

    if (backgroundType === "solid") {
      if (!isValidHex(backgroundColor)) return EMPTY;
      backgroundSx = { backgroundColor };
    } else if (backgroundType === "gradient") {
      const dir = resolveGradientDirection(backgroundGradientDirection);
      const from = isValidHex(backgroundGradientFrom)
        ? backgroundGradientFrom!
        : "#000000";
      const to = isValidHex(backgroundGradientTo)
        ? backgroundGradientTo!
        : "#ffffff";
      if (dir === "radial") {
        backgroundSx = {
          background: `radial-gradient(circle, ${from}, ${to})`,
        };
      } else {
        backgroundSx = {
          background: `linear-gradient(${dir}, ${from}, ${to})`,
        };
      }
    } else if (backgroundType === "image") {
      if (!backgroundImageUrl) return EMPTY;
      // Sanitize: only allow http/https/relative URLs; reject data: and javascript: schemes.
      // Also strip closing parenthesis to prevent CSS url() breakout.
      const sanitizedUrl =
        /^(https?:)?\/\//i.test(backgroundImageUrl) ||
        !/^[a-z][a-z0-9+\-.]*:/i.test(backgroundImageUrl)
          ? backgroundImageUrl.replace(/[()'"\\]/g, "")
          : "";
      if (!sanitizedUrl) return EMPTY;
      backgroundSx = {
        backgroundImage: `url(${sanitizedUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        ...(backgroundParallax && {
          backgroundAttachment: "fixed",
          // Mobile fallback: fixed attachment is not supported on most mobile browsers
          "@media (max-width: 900px)": {
            backgroundAttachment: "scroll",
          },
        }),
      };
    } else if (backgroundType === "animated") {
      const animSx = ANIMATED_SX_MAP[backgroundAnimatedPreset ?? ""];
      if (!animSx) return EMPTY;
      backgroundSx = animSx;
    } else if (backgroundType === "pattern") {
      const patternSx = STATIC_PATTERN_SX[fields.backgroundPatternPreset ?? ""];
      if (!patternSx) return EMPTY;
      backgroundSx = patternSx;
    } else if (backgroundType === "video") {
      if (!backgroundVideoUrl) return EMPTY;
      const sanitizedVideoUrl =
        /^(https?:)?\/\//i.test(backgroundVideoUrl) ||
        !/^[a-z][a-z0-9+\-.]*:/i.test(backgroundVideoUrl)
          ? backgroundVideoUrl.replace(/[()'"\\]/g, "")
          : "";
      if (!sanitizedVideoUrl) return EMPTY;
      backgroundSx = { position: "relative", overflow: "hidden" };
      const videoEl = React.createElement("video", {
        src: sanitizedVideoUrl,
        autoPlay: true,
        muted: true,
        loop: true,
        playsInline: true,
        "aria-hidden": true,
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          pointerEvents: "none",
        },
      });
      return {
        hasBackground: true,
        backgroundSx,
        overlayElement: null,
        overlayElements: [],
        contentSx: { position: "relative", zIndex: 1 },
        videoElement: videoEl,
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
      overlayElement = React.createElement("div", {
        style: {
          position: "absolute",
          inset: 0,
          opacity: backgroundOverlayOpacity,
          backgroundColor: backgroundOverlayColor,
          pointerEvents: "none",
        },
      });
    }

    if (overlayElement || overlayElements.length > 0) {
      contentSx = { position: "relative", zIndex: 1 };
    }

    return {
      hasBackground: true,
      backgroundSx,
      overlayElement,
      overlayElements,
      contentSx,
      videoElement: null,
    };
  }, [fields]);
}
