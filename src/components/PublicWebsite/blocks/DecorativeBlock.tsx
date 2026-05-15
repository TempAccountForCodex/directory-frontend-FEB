/**
 * DecorativeBlock — SVG decorative elements (Step 17.8)
 *
 * Variants:
 *   circular-text  — text flowing along a circular SVG path with optional rotation
 *   wave-divider   — sinusoidal SVG wave separator
 *   abstract-dots  — 8x8 dot grid with staggered opacity
 */

import React, { useMemo } from "react";
import { Box } from "@mui/material";

interface DecorativeBlockProps {
  content: Record<string, any>;
}

const SIZE_MAP: Record<string, number> = {
  sm: 120,
  md: 200,
  lg: 300,
  xl: 400,
};

const SPEED_MAP: Record<string, number> = {
  slow: 30,
  normal: 20,
  fast: 10,
};

/* ── Circular Text ──────────────────────────────────────────────────────────── */

const CircularTextSvg: React.FC<{
  text: string;
  size: number;
  color: string;
  speed: string;
}> = React.memo(({ text, size, color, speed }) => {
  const radius = size * 0.4;
  const separator = " \u2022 ";
  const circumference = 2 * Math.PI * radius;
  const charWidth = size * 0.035;
  const charsNeeded = Math.ceil(circumference / charWidth);
  const base = text + separator;
  const repeats = Math.max(1, Math.ceil(charsNeeded / base.length));
  const repeatedText = base.repeat(repeats);

  const half = size / 2;
  const d = `M${half},${half} m-${radius},0 a${radius},${radius} 0 1,1 ${radius * 2},0 a${radius},${radius} 0 1,1 -${radius * 2},0`;
  const duration = speed !== "none" ? (SPEED_MAP[speed] ?? 20) : 0;
  const fontSize = Math.max(8, size * 0.06);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
    >
      <defs>
        <path id="decorCirclePath" d={d} fill="none" />
      </defs>
      <g
        style={
          duration > 0
            ? {
                animation: `decorRotate ${duration}s linear infinite`,
                transformOrigin: "center",
              }
            : undefined
        }
      >
        <text
          fill={color}
          fontSize={fontSize}
          fontWeight={600}
          letterSpacing="3px"
          style={{ textTransform: "uppercase" }}
        >
          <textPath href="#decorCirclePath">{repeatedText}</textPath>
        </text>
      </g>
      {duration > 0 && (
        <style>{`
          @keyframes decorRotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @media (prefers-reduced-motion: reduce) { g { animation: none !important; } }
        `}</style>
      )}
    </svg>
  );
});
CircularTextSvg.displayName = "CircularTextSvg";

/* ── Wave Divider ───────────────────────────────────────────────────────────── */

const WaveDividerSvg: React.FC<{
  size: number;
  color: string;
  secondaryColor?: string;
}> = React.memo(({ size, color, secondaryColor }) => {
  const height = Math.max(40, size * 0.25);
  const amp = height * 0.6;
  const mid = height / 2;
  const primaryPath = `M0 ${mid} Q125 ${mid - amp} 250 ${mid} T500 ${mid} T750 ${mid} T1000 ${mid} V${height} H0 Z`;

  return (
    <svg
      viewBox={`0 0 1000 ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {secondaryColor && (
        <path
          d={`M0 ${mid + 4} Q125 ${mid - amp * 0.7 + 4} 250 ${mid + 4} T500 ${mid + 4} T750 ${mid + 4} T1000 ${mid + 4} V${height} H0 Z`}
          fill={secondaryColor}
          opacity={0.3}
        />
      )}
      <path d={primaryPath} fill={color} />
    </svg>
  );
});
WaveDividerSvg.displayName = "WaveDividerSvg";

/* ── Abstract Dots ──────────────────────────────────────────────────────────── */

const AbstractDotsSvg: React.FC<{
  size: number;
  color: string;
}> = React.memo(({ size, color }) => {
  const gridSize = 8;
  const gap = size / gridSize;
  const r = Math.max(1.5, gap * 0.08);
  const opacities = [0.15, 0.3, 0.5];

  const dots = useMemo(() => {
    const result: React.ReactElement[] = [];
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        const op = opacities[(row + col) % opacities.length];
        result.push(
          <circle
            key={`${row}-${col}`}
            cx={gap * 0.5 + col * gap}
            cy={gap * 0.5 + row * gap}
            r={r}
            fill={color}
            opacity={op}
          />,
        );
      }
    }
    return result;
  }, [size, color, gap, r]);

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width={size}
      height={size}
      aria-hidden="true"
    >
      {dots}
    </svg>
  );
});
AbstractDotsSvg.displayName = "AbstractDotsSvg";

/* ── Position wrapper helpers ───────────────────────────────────────────────── */

const getPositionSx = (position: string): Record<string, any> => {
  if (position === "inline") {
    return { display: "flex", justifyContent: "center", position: "relative" };
  }
  const base: Record<string, any> = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    zIndex: 0,
  };
  switch (position) {
    case "absolute-left":
      return { ...base, left: 0 };
    case "absolute-right":
      return { ...base, right: 0 };
    case "absolute-center":
      return { ...base, left: "50%", transform: "translate(-50%, -50%)" };
    default:
      return {
        display: "flex",
        justifyContent: "center",
        position: "relative",
      };
  }
};

/* ── Main Component ─────────────────────────────────────────────────────────── */

const DecorativeBlock: React.FC<DecorativeBlockProps> = ({ content }) => {
  const {
    variant = "circular-text",
    text = "YOUR BRAND",
    rotationSpeed = "normal",
    color = "#000000",
    secondaryColor,
    size: sizeKey = "md",
    opacity = 100,
    position = "inline",
  } = content;

  const size = SIZE_MAP[sizeKey] ?? 200;

  const svgElement = useMemo(() => {
    switch (variant) {
      case "circular-text":
        return (
          <CircularTextSvg
            text={text}
            size={size}
            color={color}
            speed={rotationSpeed}
          />
        );
      case "wave-divider":
        return (
          <WaveDividerSvg
            size={size}
            color={color}
            secondaryColor={secondaryColor}
          />
        );
      case "abstract-dots":
        return <AbstractDotsSvg size={size} color={color} />;
      default:
        return null;
    }
  }, [variant, text, size, color, secondaryColor, rotationSpeed]);

  return (
    <Box
      sx={{
        ...getPositionSx(position),
        opacity: opacity / 100,
        width: variant === "wave-divider" ? "100%" : undefined,
      }}
    >
      {svgElement}
    </Box>
  );
};

export default React.memo(DecorativeBlock);
