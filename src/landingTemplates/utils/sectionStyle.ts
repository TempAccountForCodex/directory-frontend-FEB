import type { SxProps, Theme } from "@mui/material/styles";

export type SectionStyleValue = {
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  layoutWidth?: "page" | "full";
  heightPreset?:
    | "auto"
    | "small"
    | "medium"
    | "large"
    | "fullscreen"
    | "custom";
  customHeight?: string | number;
  contentAlign?: "left" | "center" | "right";
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderWidth?: string | number;
  borderRadius?: string | number;
  borderColor?: string;
  opacity?: number;
  boxShadowPreset?: "none" | "sm" | "md" | "lg" | "xl";
  showOnDesktop?: boolean;
  showOnTablet?: boolean;
  showOnMobile?: boolean;
  entranceAnimation?:
    | "none"
    | "fadeUp"
    | "fadeDown"
    | "fadeLeft"
    | "fadeRight"
    | "fadeIn"
    | "zoomIn"
    | "zoomOut"
    | "blurIn";
  layoutDirection?: "row" | "column" | "";
  layoutGap?: string | number;
  overflowMode?: "visible" | "hidden" | "auto" | "scroll" | "";
  positionMode?: "static" | "relative" | "sticky" | "absolute" | "";
  minHeightValue?: string | number;
  maxWidthValue?: string | number;
  parallaxEnabled?: boolean;
  parallaxSpeed?: number;
  stickySection?: boolean;
  stickyOffset?: string | number;
  cssClass?: string;
  customCss?: string;
  semanticTag?:
    | "div"
    | "section"
    | "article"
    | "main"
    | "aside"
    | "header"
    | "footer"
    | "nav"
    | "span";
  dataAttributes?: Array<{ key?: string; value?: string }>;
  anchorId?: string;
  zIndex?: string | number;
  paddingTop?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  marginTop?: string | number;
  marginBottom?: string | number;
  marginLeft?: string | number;
  marginRight?: string | number;
  width?: string | number;
  height?: string | number;
  transform?: string;
  backgroundType?: string;
  backgroundAnimatedPreset?: string;
  backgroundPatternPreset?: string;
};

const toCamelCase = (value: string) =>
  value.replace(/-([a-z])/g, (_, char: string) => char.toUpperCase());

const normalizeCssProperty = (value: string) => value.trim().toLowerCase();

const parseCustomCssDeclarations = (
  customCss: string | undefined,
): Record<string, string> => {
  if (!customCss || typeof customCss !== "string") {
    return {};
  }

  const declarations: Record<string, string> = {};

  customCss
    .split(";")
    .map((rule) => rule.trim())
    .filter(Boolean)
    .forEach((rule) => {
      const separatorIndex = rule.indexOf(":");
      if (separatorIndex === -1) return;
      const property = normalizeCssProperty(rule.slice(0, separatorIndex));
      const value = rule.slice(separatorIndex + 1).trim();
      if (!property || !value) return;
      declarations[toCamelCase(property)] = value;
    });

  return declarations;
};

type ContentLike = Record<string, unknown> | null | undefined;

const readStyleValue = (
  content: ContentLike,
  styleKey: string = "sectionStyle",
): SectionStyleValue => {
  const raw = content?.[styleKey];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return raw as SectionStyleValue;
};

export const getSectionStyleDomProps = (
  content: ContentLike,
  styleKey: string = "sectionStyle",
): Record<string, string> => {
  const sectionStyle = readStyleValue(content, styleKey);
  const props: Record<string, string> = {};

  if (
    typeof sectionStyle.anchorId === "string" &&
    sectionStyle.anchorId.trim()
  ) {
    props.id = sectionStyle.anchorId.trim();
  }
  if (
    typeof sectionStyle.cssClass === "string" &&
    sectionStyle.cssClass.trim()
  ) {
    props.className = sectionStyle.cssClass.trim();
  }
  if (
    typeof sectionStyle.semanticTag === "string" &&
    sectionStyle.semanticTag.trim()
  ) {
    props.component = sectionStyle.semanticTag.trim();
  }
  if (Array.isArray(sectionStyle.dataAttributes)) {
    sectionStyle.dataAttributes.forEach((attribute) => {
      const rawKey =
        typeof attribute?.key === "string" ? attribute.key.trim() : "";
      if (!rawKey) return;
      const normalizedKey = rawKey
        .replace(/^data-/i, "")
        .replace(/[^a-zA-Z0-9_-]/g, "")
        .toLowerCase();
      if (!normalizedKey) return;
      props[`data-${normalizedKey}`] =
        typeof attribute?.value === "string" ? attribute.value : "";
    });
  }
  if (
    typeof sectionStyle.entranceAnimation === "string" &&
    sectionStyle.entranceAnimation !== "none"
  ) {
    props["data-section-animation"] = sectionStyle.entranceAnimation;
    props["data-section-animated"] = "false";
  }

  return props;
};

const ANIMATED_BG_SX: Record<string, Record<string, unknown>> = {
  "moving-gradient": {
    "@keyframes mgKf": {
      "0%": { backgroundPosition: "0% 50%" },
      "50%": { backgroundPosition: "100% 50%" },
      "100%": { backgroundPosition: "0% 50%" },
    },
    background: "linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)",
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
    background: "radial-gradient(ellipse at 50% 50%, #1a0533 0%, #000814 100%)",
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

export const getSectionStyleSx = (
  content: ContentLike,
  styleKey: "sectionStyle" | "outerSectionStyle" | "cardStyle" = "sectionStyle",
): SxProps<Theme> => {
  const sectionStyle = readStyleValue(content, styleKey);
  const sx: Record<string, unknown> = {};

  if (sectionStyle.backgroundColor) {
    sx.backgroundColor = sectionStyle.backgroundColor;
  }
  if (sectionStyle.backgroundImageUrl) {
    const sanitizedUrl = sectionStyle.backgroundImageUrl.replace(
      /[()'"\\]/g,
      "",
    );
    sx.backgroundImage = `url(${sanitizedUrl})`;
    sx.backgroundSize = sectionStyle.backgroundSize || "cover";
    sx.backgroundPosition = sectionStyle.backgroundPosition || "center";
    sx.backgroundRepeat = sectionStyle.backgroundRepeat || "no-repeat";
  }
  if (
    sectionStyle.backgroundType === "animated" &&
    sectionStyle.backgroundAnimatedPreset
  ) {
    const animSx = ANIMATED_BG_SX[sectionStyle.backgroundAnimatedPreset];
    if (animSx) {
      Object.assign(sx, animSx);
    }
  }
  if (
    sectionStyle.backgroundType === "pattern" &&
    sectionStyle.backgroundPatternPreset
  ) {
    const patternSx = STATIC_PATTERN_SX[sectionStyle.backgroundPatternPreset];
    if (patternSx) {
      Object.assign(sx, patternSx);
    }
  }
  if (sectionStyle.layoutWidth === "full") {
    sx.width = "100%";
    sx.maxWidth = "none";
  }
  if (sectionStyle.heightPreset === "small") {
    sx.minHeight = "320px";
  }
  if (sectionStyle.heightPreset === "medium") {
    sx.minHeight = "480px";
  }
  if (sectionStyle.heightPreset === "large") {
    sx.minHeight = "640px";
  }
  if (sectionStyle.heightPreset === "fullscreen") {
    sx.minHeight = "100vh";
  }
  if (sectionStyle.heightPreset === "custom" && sectionStyle.customHeight) {
    sx.minHeight = sectionStyle.customHeight;
  }
  if (sectionStyle.contentAlign) {
    sx.textAlign = sectionStyle.contentAlign;
  }
  if (sectionStyle.layoutDirection) {
    sx.display = "flex";
    sx.flexDirection = sectionStyle.layoutDirection;
  }
  if (sectionStyle.layoutGap !== undefined && sectionStyle.layoutGap !== "") {
    sx.gap = sectionStyle.layoutGap;
  }
  if (sectionStyle.overflowMode) {
    sx.overflow = sectionStyle.overflowMode;
  }
  if (sectionStyle.positionMode) {
    sx.position = sectionStyle.positionMode;
  }
  if (
    sectionStyle.minHeightValue !== undefined &&
    sectionStyle.minHeightValue !== ""
  ) {
    sx.minHeight = sectionStyle.minHeightValue;
  }
  if (
    sectionStyle.maxWidthValue !== undefined &&
    sectionStyle.maxWidthValue !== ""
  ) {
    sx.maxWidth = sectionStyle.maxWidthValue;
  }
  if (sectionStyle.borderStyle && sectionStyle.borderStyle !== "none") {
    sx.borderStyle = sectionStyle.borderStyle;
    sx.borderWidth = sectionStyle.borderWidth || "1px";
    sx.borderColor = sectionStyle.borderColor || "rgba(15,23,42,0.18)";
  }
  if (sectionStyle.borderRadius !== undefined) {
    sx.borderRadius = sectionStyle.borderRadius;
  }
  if (typeof sectionStyle.opacity === "number") {
    sx.opacity = sectionStyle.opacity;
  }
  if (sectionStyle.boxShadowPreset === "sm") {
    sx.boxShadow = "0 8px 18px rgba(15,23,42,0.08)";
  }
  if (sectionStyle.boxShadowPreset === "md") {
    sx.boxShadow = "0 16px 30px rgba(15,23,42,0.12)";
  }
  if (sectionStyle.boxShadowPreset === "lg") {
    sx.boxShadow = "0 24px 48px rgba(15,23,42,0.16)";
  }
  if (sectionStyle.boxShadowPreset === "xl") {
    sx.boxShadow = "0 32px 64px rgba(15,23,42,0.22)";
  }
  if (
    typeof sectionStyle.entranceAnimation === "string" &&
    sectionStyle.entranceAnimation !== "none"
  ) {
    sx.transition =
      "opacity 560ms cubic-bezier(0.22, 1, 0.36, 1), transform 560ms cubic-bezier(0.22, 1, 0.36, 1), filter 560ms cubic-bezier(0.22, 1, 0.36, 1)";

    if (sectionStyle.entranceAnimation === "fadeUp") {
      sx.transform = "translate3d(0, 30px, 0)";
    }
    if (sectionStyle.entranceAnimation === "fadeDown") {
      sx.transform = "translate3d(0, -30px, 0)";
    }
    if (sectionStyle.entranceAnimation === "fadeLeft") {
      sx.transform = "translate3d(-34px, 0, 0)";
    }
    if (sectionStyle.entranceAnimation === "fadeRight") {
      sx.transform = "translate3d(34px, 0, 0)";
    }
    if (sectionStyle.entranceAnimation === "zoomIn") {
      sx.transform = "scale(0.94)";
    }
    if (sectionStyle.entranceAnimation === "zoomOut") {
      sx.transform = "scale(1.06)";
    }
    if (sectionStyle.entranceAnimation === "blurIn") {
      sx.filter = "blur(10px)";
      sx.transform = "translate3d(0, 18px, 0) scale(0.985)";
    }

    sx['&[data-section-animated="true"]'] = {
      transform: "translate3d(0, 0, 0) scale(1)",
      filter: "blur(0px)",
    };
  }
  if (sectionStyle.parallaxEnabled && sectionStyle.backgroundImageUrl) {
    sx.backgroundAttachment = "fixed";
    if (typeof sectionStyle.parallaxSpeed === "number") {
      sx.backgroundPositionY = `${sectionStyle.parallaxSpeed}%`;
    }
  }
  if (sectionStyle.stickySection) {
    sx.position = "sticky";
    sx.top = sectionStyle.stickyOffset || 0;
    sx.alignSelf = "flex-start";
  }
  if (
    sectionStyle.showOnMobile === false ||
    sectionStyle.showOnTablet === false ||
    sectionStyle.showOnDesktop === false
  ) {
    sx.display = {
      xs: sectionStyle.showOnMobile === false ? "none" : "block",
      sm: sectionStyle.showOnTablet === false ? "none" : "block",
      md: sectionStyle.showOnDesktop === false ? "none" : "block",
    };
  }
  if (sectionStyle.zIndex !== undefined && sectionStyle.zIndex !== "") {
    sx.zIndex = sectionStyle.zIndex;
    if (!sx.position) {
      sx.position = "relative";
    }
  }
  if (sectionStyle.paddingTop !== undefined) {
    sx.paddingTop = sectionStyle.paddingTop;
  }
  if (sectionStyle.paddingBottom !== undefined) {
    sx.paddingBottom = sectionStyle.paddingBottom;
  }
  if (sectionStyle.paddingLeft !== undefined) {
    sx.paddingLeft = sectionStyle.paddingLeft;
  }
  if (sectionStyle.paddingRight !== undefined) {
    sx.paddingRight = sectionStyle.paddingRight;
  }
  if (sectionStyle.marginTop !== undefined) {
    sx.marginTop = sectionStyle.marginTop;
  }
  if (sectionStyle.marginBottom !== undefined) {
    sx.marginBottom = sectionStyle.marginBottom;
  }
  if (sectionStyle.marginLeft !== undefined) {
    sx.marginLeft = sectionStyle.marginLeft;
  }
  if (sectionStyle.marginRight !== undefined) {
    sx.marginRight = sectionStyle.marginRight;
  }
  if (sectionStyle.width !== undefined) {
    sx.width = sectionStyle.width;
  }
  if (sectionStyle.height !== undefined) {
    sx.height = sectionStyle.height;
  }
  if (sectionStyle.transform) {
    sx.transform = sectionStyle.transform;
  }
  Object.assign(sx, parseCustomCssDeclarations(sectionStyle.customCss));

  return sx;
};
