export const EDITOR_SHARED_SHELL_VISUAL_BLOCK_TYPES = new Set([
  "generic_card",
  "cta",
  "newsletter",
  "contact",
  "form_builder",
  "reservation_form",
  "gallery",
  "team",
  "features",
  "faq",
  "tabs",
  "navigation_bar",
  "menu_display",
  "pricing",
  "countdown",
  "testimonials",
  "reviews",
  "stats",
  "logo_carousel",
  "map_location",
  "social_embed",
  "embed",
]);

export const humanizeEditorBlockKey = (value: string) =>
  String(value || "")
    .replace(/^plan[-_]?/i, "Plan ")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

export const getEditorSharedNestedValue = (source: any, path = "") => {
  if (!path) return source;
  return String(path)
    .split(".")
    .filter(Boolean)
    .reduce(
      (current, key) =>
        current == null
          ? undefined
          : current[/^\d+$/.test(key) ? Number(key) : key],
      source,
    );
};

export const getEditorSharedTypographyStyleKey = (fieldPath = "text") => {
  const normalizedFieldPath = String(fieldPath || "text").trim();
  const leafFieldName = normalizedFieldPath
    .split(".")
    .filter(Boolean)
    .pop()
    ?.toLowerCase();

  switch (leafFieldName) {
    case "title":
    case "heading":
    case "question":
    case "logotext":
      return "headingStyle";
    case "subtitle":
    case "subheading":
    case "description":
    case "body":
    case "answer":
    case "quote":
    case "contactemail":
    case "contactphone":
    case "contactaddress":
    case "email":
    case "phone":
    case "address":
    case "copyright":
      return "bodyStyle";
    case "label":
    case "text":
    case "author":
    case "role":
      return "textStyle";
    case "buttontext":
    case "ctatext":
    case "primaryctatext":
      return "buttonTextStyle";
    default:
      return `${normalizedFieldPath}Style`;
  }
};

type BuildEditorSharedSurfaceStylesArgs = {
  blockType: string;
  tone: "light" | "dark";
  themeColor: string;
  canvas: boolean;
  canvasBaseSx: Record<string, any> | null;
  cardStyle: Record<string, any>;
  sectionStyle: Record<string, any>;
  resolvedCardStyle: Record<string, any>;
  resolvedSectionStyle: Record<string, any>;
  getCanvasWidth: (desktopWidth: any, fallbackWidth?: any) => any;
  getCanvasMaxWidth: (desktopWidth: any, fallbackWidth?: any) => any;
  getCanvasTransform: (desktopTransform: any) => any;
  rgba: (hex: string, alpha: number) => string;
};

export const buildEditorSharedSurfaceStyles = ({
  blockType,
  tone,
  themeColor,
  canvas,
  canvasBaseSx,
  cardStyle,
  sectionStyle,
  resolvedCardStyle,
  resolvedSectionStyle,
  getCanvasWidth,
  getCanvasMaxWidth,
  getCanvasTransform,
  rgba,
}: BuildEditorSharedSurfaceStylesArgs) => {
  const compoundLayoutWidth = String(
    cardStyle.layoutWidth ??
      resolvedCardStyle.layoutWidth ??
      sectionStyle.layoutWidth ??
      resolvedSectionStyle.layoutWidth ??
      "page",
  ).toLowerCase();
  const compoundShouldUseFullWidth = compoundLayoutWidth === "full";
  const compoundUsesManagedPageWidth = !canvas && blockType !== "footer";
  const compoundSupportsSectionShellVisuals =
    EDITOR_SHARED_SHELL_VISUAL_BLOCK_TYPES.has(blockType);
  const compoundLiftsVisualsToShell =
    compoundUsesManagedPageWidth && compoundSupportsSectionShellVisuals;

  const defaultCompoundCardWidth = canvas
    ? blockType === "video"
      ? "calc(100% - 112px)"
      : "640px"
    : "100%";
  const hasExplicitWidth =
    cardStyle.width !== undefined || resolvedCardStyle.width !== undefined;
  const resolvedCardWidth =
    cardStyle.width ?? resolvedCardStyle.width ?? defaultCompoundCardWidth;
  const resolvedCardMaxWidth =
    cardStyle.maxWidth ??
    resolvedCardStyle.maxWidth ??
    (hasExplicitWidth ? "none" : defaultCompoundCardWidth);
  const hasSectionCustomBackground =
    resolvedSectionStyle.backgroundColor !== undefined ||
    resolvedSectionStyle.backgroundImage !== undefined ||
    sectionStyle.backgroundColor !== undefined ||
    sectionStyle.backgroundImage !== undefined;
  const hasCustomBackground =
    hasSectionCustomBackground ||
    resolvedCardStyle.backgroundColor !== undefined ||
    resolvedCardStyle.backgroundImage !== undefined ||
    cardStyle.backgroundColor !== undefined ||
    cardStyle.backgroundImage !== undefined;
  const hasCustomBorder =
    resolvedSectionStyle.border !== undefined ||
    resolvedSectionStyle.borderStyle !== undefined ||
    sectionStyle.border !== undefined ||
    sectionStyle.borderStyle !== undefined ||
    resolvedCardStyle.border !== undefined ||
    resolvedCardStyle.borderStyle !== undefined ||
    cardStyle.border !== undefined ||
    cardStyle.borderStyle !== undefined;
  const hasCustomShadow =
    resolvedSectionStyle.boxShadow !== undefined ||
    sectionStyle.boxShadow !== undefined ||
    resolvedCardStyle.boxShadow !== undefined ||
    cardStyle.boxShadow !== undefined;

  const compoundVisualLayerSx = {
    ...(hasCustomBorder
      ? {}
      : {
          border: `1px solid ${tone === "light" ? "rgba(255,255,255,0.16)" : rgba(themeColor, 0.14)}`,
        }),
    ...(hasCustomBackground
      ? {}
      : tone === "light"
        ? {
            backgroundColor: "rgba(255,255,255,0.08)",
          }
        : {
            backgroundColor: "rgba(255,255,255,0.96)",
            backgroundImage:
              "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
          }),
    ...(hasCustomShadow
      ? {}
      : {
          boxShadow:
            tone === "light"
              ? "0 24px 48px rgba(0,0,0,0.16)"
              : "0 24px 48px rgba(15,23,42,0.08)",
        }),
    backdropFilter: "blur(12px)",
    ...resolvedSectionStyle,
    ...resolvedCardStyle,
    ...sectionStyle,
    ...cardStyle,
  };

  const compoundShouldClearInnerVisuals =
    compoundLiftsVisualsToShell ||
    (compoundSupportsSectionShellVisuals && hasSectionCustomBackground);

  const compoundCardSx = {
    boxSizing: "border-box",
    borderRadius: "28px",
    ...compoundVisualLayerSx,
    ...canvasBaseSx,
    ...(compoundUsesManagedPageWidth
      ? compoundShouldUseFullWidth
        ? {
            width: "100%",
            maxWidth: "none",
            mx: 0,
            alignSelf: "stretch",
          }
        : {
            width: "100%",
            maxWidth: "1200px",
            mx: "auto",
            alignSelf: "center",
          }
      : {
          width: getCanvasWidth(resolvedCardWidth, resolvedCardWidth),
          maxWidth: getCanvasMaxWidth(
            resolvedCardMaxWidth,
            resolvedCardMaxWidth,
          ),
        }),
    transform: getCanvasTransform(cardStyle.transform),
    ...(canvas
      ? {}
      : resolvedCardStyle.minHeight === undefined &&
          resolvedCardStyle.height === undefined &&
          cardStyle.minHeight === undefined &&
          cardStyle.height === undefined
        ? {
            minHeight: "auto",
            height: "auto",
          }
        : {}),
    ...(compoundShouldClearInnerVisuals
      ? {
          backgroundColor: "transparent",
          backgroundImage: "none",
          backgroundSize: undefined,
          backgroundPosition: undefined,
          backgroundRepeat: undefined,
          backgroundAttachment: undefined,
          backgroundPositionY: undefined,
          backdropFilter: "none",
          boxShadow: "none",
          border: "none",
          borderRadius: 0,
        }
      : {}),
  };

  const compoundShellVisualSource = hasSectionCustomBackground
    ? {
        ...resolvedSectionStyle,
        ...sectionStyle,
      }
    : compoundVisualLayerSx;

  const compoundVisualShellSx = compoundLiftsVisualsToShell
    ? {
        width: "100%",
        alignSelf: "stretch",
        // backgroundColor: compoundShellVisualSource.backgroundColor,
        // backgroundImage: compoundShellVisualSource.backgroundImage,
        backgroundSize: compoundShellVisualSource.backgroundSize,
        backgroundPosition: compoundShellVisualSource.backgroundPosition,
        backgroundRepeat: compoundShellVisualSource.backgroundRepeat,
        backgroundAttachment: compoundShellVisualSource.backgroundAttachment,
        backgroundPositionY: compoundShellVisualSource.backgroundPositionY,
        // boxShadow: compoundShellVisualSource.boxShadow,
        border: compoundShellVisualSource.border,
        borderTop: compoundShellVisualSource.borderTop,
        borderBottom: compoundShellVisualSource.borderBottom,
        borderLeft: compoundShellVisualSource.borderLeft,
        borderRight: compoundShellVisualSource.borderRight,
        borderRadius: compoundShellVisualSource.borderRadius,
        backdropFilter: compoundShellVisualSource.backdropFilter,
      }
    : null;

  return {
    compoundCardSx,
    compoundVisualShellSx,
  };
};
