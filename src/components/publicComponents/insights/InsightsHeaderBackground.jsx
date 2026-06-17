import React from "react";
import PropTypes from "prop-types";

const traces = [
  "M 40 80 H 200 V 140 H 380 V 80 H 520",
  "M 600 80 H 740 V 200 H 900",
  "M 1000 60 H 1200 V 120 H 1240",
  "M 40 200 H 120 V 260 H 300 V 200 H 460 V 280 H 600",
  "M 700 240 H 860 V 180 H 980 V 240 H 1100 V 320 H 1240",
  "M 40 340 H 180 V 280 H 340",
  "M 400 360 H 560 V 420 H 700 V 360 H 840",
  "M 920 380 H 1060 V 440 H 1240",
  "M 40 440 H 160 V 400 H 300 V 460",
  "M 500 440 H 660",
  "M 200 140 V 200",
  "M 380 80 V 40",
  "M 740 80 V 40",
  "M 900 200 V 260 H 1000",
  "M 120 200 V 140",
  "M 460 200 V 140 H 540",
  "M 300 280 V 340",
  "M 560 360 V 300 H 680 V 360",
];

const nodes = [
  [200, 80], [380, 80], [520, 80], [600, 80], [740, 80], [1000, 60], [1200, 60],
  [40, 200], [120, 200], [300, 200], [460, 200], [600, 200], [700, 240], [860, 240],
  [980, 240], [1100, 240], [40, 340], [180, 340], [340, 280], [400, 360],
  [700, 360], [840, 360], [920, 380], [1060, 380], [40, 440], [300, 440],
  [380, 140], [900, 200], [560, 420], [680, 300],
];

const accentNodes = [
  [380, 80], [740, 200], [460, 280], [700, 360], [1100, 320], [300, 440],
];

const COLOR_VARIANTS = {
  dark: {
    backgroundGradient: "linear-gradient(135deg, #030b14 0%, #061520 55%, #040e18 100%)",
    dimTrace: "rgba(0,197,184,0.12)",
    glowTrace: "#00c5b8",
    nodeFill: "rgba(0,197,184,0.2)",
    nodeStroke: "rgba(0,197,184,0.35)",
    accentRing: "#00c5b8",
    accentCore: "#00c5b8",
    animatedTrace: "#00e5d6",
    sideGlow: "radial-gradient(circle, rgba(0,197,184,0.08) 0%, transparent 70%)",
  },
  cards: {
    backgroundGradient: "linear-gradient(135deg, #edf3fb 0%, #f4f7fb 55%, #e9f1f9 100%)",
    dimTrace: "rgba(28,102,107,0.18)",
    glowTrace: "#1c666b",
    nodeFill: "rgba(28,102,107,0.22)",
    nodeStroke: "rgba(28,102,107,0.38)",
    accentRing: "#1c666b",
    accentCore: "#1c666b",
    animatedTrace: "#2d8c92",
    sideGlow: "radial-gradient(circle, rgba(28,102,107,0.16) 0%, transparent 72%)",
  },
};

const InsightsHeaderBackground = ({ idPrefix, themeVariant, colors }) => {
  const glowId = `${idPrefix}-pcb-glow`;
  const strongGlowId = `${idPrefix}-pcb-strong-glow`;
  const palette = {
    ...(COLOR_VARIANTS[themeVariant] || COLOR_VARIANTS.dark),
    ...(colors || {}),
  };

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: palette.backgroundGradient,
          zIndex: 0,
        }}
      />

      <svg
        viewBox="0 0 1280 480"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", zIndex: 1 }}
        aria-hidden="true"
      >
        <defs>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={strongGlowId}>
            <feGaussianBlur stdDeviation="5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {traces.map((d, i) => (
          <path key={`dim-${i}`} d={d} stroke={palette.dimTrace} strokeWidth="1" fill="none" />
        ))}
        {traces.slice(0, 8).map((d, i) => (
          <path
            key={`glow-${i}`}
            d={d}
            stroke={palette.glowTrace}
            strokeWidth="0.8"
            fill="none"
            opacity={0.25}
            filter={`url(#${glowId})`}
          />
        ))}
        {nodes.map(([cx, cy], i) => (
          <circle
            key={`node-${i}`}
            cx={cx}
            cy={cy}
            r="3"
            fill={palette.nodeFill}
            stroke={palette.nodeStroke}
            strokeWidth="0.8"
          />
        ))}
        {accentNodes.map(([cx, cy], i) => (
          <g key={`accent-${i}`} filter={`url(#${strongGlowId})`}>
            <circle cx={cx} cy={cy} r="5" fill="none" stroke={palette.accentRing} strokeWidth="1" opacity={0.5} />
            <circle cx={cx} cy={cy} r="2.5" fill={palette.accentCore} opacity={0.85} />
          </g>
        ))}
        <path
          d="M 40 200 H 120 V 260 H 300 V 200 H 460 V 280 H 600"
          stroke={palette.animatedTrace}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="30 400"
          opacity={0.8}
          filter={`url(#${glowId})`}
        >
          <animate attributeName="stroke-dashoffset" from="430" to="-30" dur="3.5s" repeatCount="indefinite" />
        </path>
        <path
          d="M 700 240 H 860 V 180 H 980 V 240 H 1100 V 320 H 1240"
          stroke={palette.animatedTrace}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="24 500"
          opacity={0.7}
          filter={`url(#${glowId})`}
        >
          <animate attributeName="stroke-dashoffset" from="524" to="-24" dur="4.8s" repeatCount="indefinite" />
        </path>
      </svg>

      <div
        style={{
          position: "absolute",
          left: "-40px",
          top: "50%",
          transform: "translateY(-50%)",
          width: "480px",
          height: "480px",
          borderRadius: "50%",
          background: palette.sideGlow,
          filter: "blur(50px)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </>
  );
};

InsightsHeaderBackground.propTypes = {
  idPrefix: PropTypes.string,
  themeVariant: PropTypes.oneOf(["dark", "cards"]),
  colors: PropTypes.shape({
    backgroundGradient: PropTypes.string,
    dimTrace: PropTypes.string,
    glowTrace: PropTypes.string,
    nodeFill: PropTypes.string,
    nodeStroke: PropTypes.string,
    accentRing: PropTypes.string,
    accentCore: PropTypes.string,
    animatedTrace: PropTypes.string,
    sideGlow: PropTypes.string,
  }),
};

InsightsHeaderBackground.defaultProps = {
  idPrefix: "insights-header-bg",
  themeVariant: "dark",
  colors: null,
};

export default InsightsHeaderBackground;
