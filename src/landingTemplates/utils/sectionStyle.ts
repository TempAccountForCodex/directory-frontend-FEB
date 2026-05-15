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
  entranceAnimation?: "none" | "fadeUp" | "fadeIn" | "zoomIn";
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
};

type ContentLike = Record<string, unknown> | null | undefined;

const readStyleValue = (
  content: ContentLike,
  styleKey: "sectionStyle" | "outerSectionStyle" = "sectionStyle",
): SectionStyleValue => {
  const raw = content?.[styleKey];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return {};
  }

  return raw as SectionStyleValue;
};

export const getSectionStyleDomProps = (
  content: ContentLike,
  styleKey: "sectionStyle" | "outerSectionStyle" = "sectionStyle",
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

  return props;
};

export const getSectionStyleSx = (
  content: ContentLike,
  styleKey: "sectionStyle" | "outerSectionStyle" = "sectionStyle",
): Record<string, string | number> => {
  const sectionStyle = readStyleValue(content, styleKey);
  const sx: Record<string, string | number> = {};

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
  if (sectionStyle.entranceAnimation === "fadeUp") {
    sx.animation = "sectionFadeUp 480ms ease both";
    sx["@keyframes sectionFadeUp"] = {
      from: { opacity: 0, transform: "translateY(18px)" },
      to: { opacity: 1, transform: "translateY(0)" },
    };
  }
  if (sectionStyle.entranceAnimation === "fadeIn") {
    sx.animation = "sectionFadeIn 420ms ease both";
    sx["@keyframes sectionFadeIn"] = {
      from: { opacity: 0 },
      to: { opacity: 1 },
    };
  }
  if (sectionStyle.entranceAnimation === "zoomIn") {
    sx.animation = "sectionZoomIn 420ms ease both";
    sx["@keyframes sectionZoomIn"] = {
      from: { opacity: 0, transform: "scale(0.96)" },
      to: { opacity: 1, transform: "scale(1)" },
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

  return sx;
};
