import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { apiClient } from "../../api/client";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  Facebook,
  Globe,
  Instagram,
  Linkedin,
  Menu as MenuIcon,
  Music2,
  Twitter,
  X as CloseIcon,
  Youtube,
} from "lucide-react";
import {
  getEditableImageProps,
  getEditableTextProps,
} from "../utils/editableProps";
import { galleryFallbackImages } from "./assets/gallery/fallbackImages";

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
};

const rgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const isLightColor = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.72;
};

const getVideoHeightPresetSx = (preset?: string) => {
  switch (preset) {
    case "small":
      return { height: { xs: 240, md: 320 } };
    case "medium":
      return { height: { xs: 320, md: 460 } };
    case "large":
      return { height: { xs: 420, md: 640 } };
    case "fullscreen":
      return { height: { xs: "72vh", md: "100vh" } };
    case "auto":
      return { minHeight: { xs: 240, md: 360 } };
    default:
      return { height: { xs: "72vh", md: "100vh" } };
  }
};

const EditorFaqAccordionCard: React.FC<{
  blockId?: string | number;
  blockPath: string;
  heading?: string;
  items: Array<{ question?: string; answer?: string }>;
  textColor: string;
  mutedTextColor: string;
  themeColor: string;
  headingFont: string;
  tone: "light" | "dark";
  headingStyle?: Record<string, any>;
  questionStyle?: Record<string, any>;
  answerStyle?: Record<string, any>;
}> = ({
  blockId,
  blockPath,
  heading,
  items,
  textColor,
  mutedTextColor,
  themeColor,
  headingFont,
  tone,
  headingStyle,
  questionStyle,
  answerStyle,
}) => {
  const [openIndex, setOpenIndex] = React.useState(0);

  React.useEffect(() => {
    if (items.length === 0) {
      setOpenIndex(-1);
      return;
    }

    setOpenIndex((prev) => {
      if (prev < 0 || prev >= items.length) {
        return 0;
      }
      return prev;
    });
  }, [items]);

  return (
    <Stack spacing={2} sx={{ width: "100%" }}>
      <Typography
        {...getEditableTextProps(blockId, `${blockPath}.heading`, "multi")}
        sx={{
          color: textColor,
          fontFamily: headingFont,
          fontSize: { xs: "1.45rem", md: "2rem" },
          fontWeight: 800,
          letterSpacing: "-0.03em",
          ...(headingStyle || {}),
        }}
      >
        {heading || "Frequently asked questions"}
      </Typography>
      <Stack spacing={1.15} sx={{ width: "100%" }}>
        {items.map((item, itemIndex) => {
          const isOpen = itemIndex === openIndex;
          return (
            <Box
              key={`faq-${itemIndex}`}
              sx={{
                borderRadius: "20px",
                overflow: "hidden",
                border: `1px solid ${rgba(themeColor, 0.14)}`,
                bgcolor:
                  tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                  px: 2,
                  py: 1.6,
                  borderBottom: isOpen
                    ? `1px solid ${rgba(themeColor, 0.08)}`
                    : "none",
                }}
              >
                <Typography
                  {...getEditableTextProps(
                    blockId,
                    `${blockPath}.items.${itemIndex}.question`,
                    "single",
                  )}
                  sx={{
                    color: textColor,
                    fontWeight: 700,
                    pr: 2,
                    ...(questionStyle || {}),
                  }}
                >
                  {item?.question || `Question ${itemIndex + 1}`}
                </Typography>
                <Box
                  component="button"
                  type="button"
                  aria-label={isOpen ? "Collapse answer" : "Expand answer"}
                  data-open={isOpen ? "true" : "false"}
                  onClick={() =>
                    setOpenIndex((prev) =>
                      prev === itemIndex ? -1 : itemIndex,
                    )
                  }
                  sx={{
                    width: 30,
                    height: 30,
                    borderRadius: "999px",
                    border: "none",
                    bgcolor: rgba(themeColor, 0.1),
                    color: themeColor,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 0,
                    lineHeight: 1,
                    flexShrink: 0,
                    cursor: "pointer",
                    "&::before": {
                      content: '"+"',
                      fontSize: "1rem",
                      lineHeight: 1,
                      color: themeColor,
                    },
                    '&[data-open="true"]::before': {
                      content: '"-"',
                    },
                  }}
                >
                  {isOpen ? "-" : "+"}
                </Box>
              </Stack>
              {isOpen ? (
                <Typography
                  {...getEditableTextProps(
                    blockId,
                    `${blockPath}.items.${itemIndex}.answer`,
                    "multi",
                  )}
                  sx={{
                    px: 2,
                    py: 1.7,
                    color: mutedTextColor,
                    lineHeight: 1.75,
                    fontSize: "0.96rem",
                    ...(answerStyle || {}),
                  }}
                >
                  {item?.answer || "Add the answer from the editor."}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
};

export const EDITOR_SHARED_BLOCK_TYPES = new Set([
  "heading",
  "eyebrow",
  "image",
  "button",
  "divider",
  "spacer",
  "marquee",
  "announcement_bar",
  "cta",
  "newsletter",
  "contact",
  "form_builder",
  "reservation_form",
  "generic_card",
  "hero",
  "image_text_split",
  "gallery",
  "team",
  "video",
  "features",
  "faq",
  "tabs",
  "navigation_bar",
  "footer",
  "pricing",
  "countdown",
  "testimonials",
  "reviews",
  "stats",
  "logo_carousel",
  "map_location",
  "social_embed",
  "embed",
  "before_after",
  "website_header",
]);

export const isEditorSharedBlockType = (value = "") =>
  EDITOR_SHARED_BLOCK_TYPES.has(String(value || "").toLowerCase());

export const EDITOR_CARD_STYLE_BLOCK_TYPES = new Set([
  "announcement_bar",
  "cta",
  "newsletter",
  "contact",
  "form_builder",
  "reservation_form",
  "generic_card",
  "hero",
  "image_text_split",
  "gallery",
  "team",
  "menu_display",
  "video",
  "features",
  "faq",
  "tabs",
  "navigation_bar",
  "footer",
  "pricing",
  "countdown",
  "testimonials",
  "reviews",
  "stats",
  "logo_carousel",
  "map_location",
  "social_embed",
  "embed",
  "before_after",
]);

export const getEditorBlockTransform = (block: Record<string, any>) => {
  const blockType = String(block?.type || "text").toLowerCase();

  if (blockType === "heading") return block?.content?.headingStyle?.transform;
  if (blockType === "button") return block?.content?.buttonTextStyle?.transform;
  if (blockType === "image") return block?.content?.imageStyle?.transform;
  if (EDITOR_CARD_STYLE_BLOCK_TYPES.has(blockType)) {
    return block?.content?.cardStyle?.transform;
  }
  return block?.content?.textStyle?.transform;
};

export const getEditorBlockEstimatedHeight = (block: Record<string, any>) => {
  const type = String(block?.type || "text").toLowerCase();
  const cardHeight = Number(block?.content?.cardStyle?.height);
  const imageHeight = Number(block?.content?.imageStyle?.height);
  const textHeight = Number(block?.content?.textStyle?.height);

  if (Number.isFinite(cardHeight) && cardHeight > 0) return cardHeight;
  if (Number.isFinite(imageHeight) && imageHeight > 0) return imageHeight;
  if (Number.isFinite(textHeight) && textHeight > 0) return textHeight;

  if (type === "heading") return 120;
  if (type === "text" || type === "paragraph" || type === "label") return 110;
  if (type === "button") return 64;
  if (type === "image") return 320;
  if (type === "video") return 420;
  if (type === "marquee") return 64;
  if (type === "divider" || type === "spacer") return 32;
  if (EDITOR_CARD_STYLE_BLOCK_TYPES.has(type)) return 180;
  return 120;
};

export const getEditorBlockResponsivePriority = (
  block: Record<string, any>,
) => {
  const type = String(block?.type || "text").toLowerCase();
  if (type === "eyebrow") return -1;
  if (type === "heading") return 0;
  if (type === "text" || type === "paragraph" || type === "label") return 1;
  if (
    type === "button" ||
    type === "announcement_bar" ||
    type === "pricing" ||
    type === "countdown" ||
    EDITOR_CARD_STYLE_BLOCK_TYPES.has(type)
  ) {
    return 2;
  }
  if (
    type === "image" ||
    type === "hero" ||
    type === "image_text_split" ||
    type === "split_text_image" ||
    type === "image_split_text" ||
    type === "video"
  ) {
    return 3;
  }
  if (type === "divider" || type === "spacer") return 4;
  return 5;
};

export type EditorSharedBlockRenderContext = {
  section: Record<string, any>;
  block: Record<string, any>;
  index: number;
  blockPath: string;
  websiteId?: string | number;
  tone: "light" | "dark";
  textColor: string;
  mutedTextColor: string;
  lineColor: string;
  themeColor: string;
  headingFont: string;
  headingStyle: Record<string, any>;
  bodyStyle: Record<string, any>;
  textStyle: Record<string, any>;
  buttonStyle: Record<string, any>;
  eyebrowStyle: Record<string, any>;
  imageStyle: Record<string, any>;
  cardStyle: Record<string, any>;
  sectionStyle: Record<string, any>;
  rawCardStyle: Record<string, any>;
  resolvedCardStyle: Record<string, any>;
  rawSectionStyle: Record<string, any>;
  resolvedSectionStyle: Record<string, any>;
  blockMaxWidth: number | string;
  canvas: boolean;
  canvasBaseSx: Record<string, any> | null;
  compoundBlockSelectionProps: Record<string, any>;
  compoundBlockLabel: string;
  compoundCardSx: Record<string, any>;
  fallbackImageSrc: string;
  accentSoftColor: string;
  whiteColor: string;
  getCanvasWidth: (desktopWidth: any, fallbackWidth?: any) => any;
  getCanvasMaxWidth: (desktopWidth: any, fallbackWidth?: any) => any;
  getCanvasTransform: (desktopTransform: any) => any;
  getEditableFieldStyle: (
    fieldPath: string,
    fallbackStyle?: Record<string, any>,
  ) => Record<string, any>;
};

// ── Website Header Editor Preview ────────────────────────────────────────────
const HeaderEditorPreview: React.FC<{
  block: Record<string, any>;
  section: Record<string, any>;
  compoundBlockSelectionProps: Record<string, any>;
  compoundBlockLabel: string;
  compoundCardSx?: Record<string, any>;
  themeColor: string;
  textColor: string;
  mutedTextColor: string;
  tone: "light" | "dark";
  websiteId?: string | number;
}> = ({
  block,
  section,
  compoundBlockSelectionProps,
  compoundBlockLabel,
  compoundCardSx = {},
  themeColor,
  textColor,
  mutedTextColor,
  tone,
  websiteId: websiteIdProp,
}) => {
  const { websiteId: paramWebsiteId, slug: paramSlug } = useParams<{
    websiteId: string;
    slug: string;
  }>();
  const websiteId = websiteIdProp ?? paramWebsiteId;

  // Resolve relative menu targets against the site base path.
  // On /site/:slug pages, targets like "/contact-us" must become "/site/:slug/contact-us".
  const siteBase = (() => {
    const p = typeof window !== "undefined" ? window.location.pathname : "";
    const m = p.match(/^(\/site\/[^/]+)/);
    return m ? m[1] : "";
  })();
  const resolveTarget = (target: string) => {
    if (!target || target.startsWith("#") || target.startsWith("http"))
      return target;
    return siteBase
      ? `${siteBase}${target.startsWith("/") ? target : `/${target}`}`
      : target;
  };

  const c = block.content ?? {};
  const logoType: string = c.logoType ?? section?.logoType ?? "text";
  const logoText: string = c.logoText ?? section?.logoText ?? "Brand";
  const logoImage: string = c.logoImage ?? section?.logoImage ?? "";
  const ctaText: string = c.ctaText ?? section?.ctaText ?? "Get Started";
  const menuId: string = c.menuId ?? section?.menuId ?? "";

  const [fetchedMenuItems, setFetchedMenuItems] = useState<
    Array<{ label: string; target: string }>
  >([]);

  useEffect(() => {
    if (!menuId || !websiteId) {
      setFetchedMenuItems([]);
      return;
    }
    let cancelled = false;
    apiClient
      .get(`/websites/${websiteId}/menus`)
      .then((res) => {
        if (cancelled) return;
        const raw = res.data?.data ?? res.data ?? [];
        const menus = Array.isArray(raw) ? raw : [];
        const found = menus.find(
          (m: any) => String(m.id) === String(menuId) || m.handle === menuId,
        );
        setFetchedMenuItems(Array.isArray(found?.items) ? found.items : []);
      })
      .catch(() => {
        if (!cancelled) setFetchedMenuItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [menuId, websiteId]);

  const menuItems =
    fetchedMenuItems.length > 0
      ? fetchedMenuItems
      : Array.isArray(c.menuItems)
        ? c.menuItems
        : [];

  // Container-width-based responsive — works inside editor canvas AND live site
  const headerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setIsMobile(entry.contentRect.width < 768);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const borderCol = "rgba(0,0,0,0.08)";
  const navLinkColor: string = c.navLinkColor || "#4b5563";
  const ctaColor: string = c.ctaColor || themeColor;
  const logoColor = textColor;
  const placeholderLinks = ["About", "Services", "Blog", "Contact"];

  const LogoEl = (
    <Box
      component="a"
      href="/"
      sx={{
        flexShrink: 0,
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
      }}
    >
      {logoType === "image" && logoImage ? (
        <Box
          component="img"
          src={logoImage}
          alt={logoText || "Logo"}
          sx={{
            height: 30,
            width: "auto",
            maxWidth: 120,
            objectFit: "contain",
          }}
        />
      ) : (
        <Box
          sx={{
            fontWeight: 800,
            fontSize: "1.1rem",
            color: logoColor,
            letterSpacing: "-0.01em",
            lineHeight: 1,
            fontFamily: "inherit",
            textTransform: "uppercase",
          }}
        >
          {logoText || "Brand"}
        </Box>
      )}
    </Box>
  );

  return (
    <Box
      ref={headerRef}
      {...compoundBlockSelectionProps}
      data-preview-label={compoundBlockLabel}
      sx={{
        ...compoundCardSx,
        width: "100%",
        border: "none",
        backgroundImage: "none",
        backgroundColor: "transparent",
        boxShadow: "none",
        borderRadius: 0,
        p: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          height: 64,
          gap: 2,
        }}
      >
        {/* Logo — always visible */}
        {LogoEl}

        {/* Desktop: center nav + right CTA */}
        {!isMobile && (
          <>
            <Box
              sx={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
              }}
            >
              {(menuItems.length > 0
                ? menuItems.slice(0, 6)
                : placeholderLinks.map((l) => ({ label: l, target: "" }))
              ).map((item, i) => {
                const resolved = resolveTarget(item.target ?? "");
                return (
                  <Box
                    key={i}
                    component={resolved ? "a" : "span"}
                    href={resolved || undefined}
                    onClick={
                      resolved?.startsWith("#")
                        ? (e: React.MouseEvent) => {
                            e.preventDefault();
                            const id = resolved.replace(/^#/, "");
                            const el =
                              document.getElementById(id) ||
                              document.querySelector(`[data-section="${id}"]`);
                            el?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }
                        : undefined
                    }
                    sx={{
                      px: 1.8,
                      py: 0.5,
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      textTransform: "uppercase",
                      color:
                        menuItems.length === 0
                          ? `${navLinkColor}80`
                          : navLinkColor,
                      whiteSpace: "nowrap",
                      textDecoration: "none",
                      cursor: item.target ? "pointer" : "default",
                      "&:hover": item.target ? { color: themeColor } : {},
                      transition: "color 0.15s",
                    }}
                  >
                    {item.label}
                  </Box>
                );
              })}
            </Box>
            {ctaText && (
              <Box sx={{ flexShrink: 0 }}>
                <Box
                  component="a"
                  href={c.ctaUrl || "#contact"}
                  sx={{
                    px: 2.2,
                    py: 0.65,
                    border: `1.5px solid ${ctaColor}`,
                    color: ctaColor,
                    borderRadius: "100px",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    whiteSpace: "nowrap",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    display: "inline-block",
                    cursor: "pointer",
                    transition: "background 0.15s, color 0.15s",
                    "&:hover": { bgcolor: ctaColor, color: "#fff" },
                  }}
                >
                  {ctaText}
                </Box>
              </Box>
            )}
          </>
        )}

        {/* Mobile: hamburger only */}
        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(true)}
            size="small"
            sx={{
              color: textColor,
              border: "1.5px solid rgba(0,0,0,0.1)",
              borderRadius: "10px",
              p: "6px",
            }}
          >
            <MenuIcon size={18} />
          </IconButton>
        )}
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 260, p: 2.5, bgcolor: "#fff" } }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {LogoEl}
          <IconButton
            onClick={() => setDrawerOpen(false)}
            size="small"
            sx={{ color: textColor }}
          >
            <CloseIcon size={18} />
          </IconButton>
        </Stack>
        <Divider sx={{ mb: 2 }} />
        {(menuItems.length > 0
          ? menuItems
          : placeholderLinks.map((l) => ({ label: l, target: "" }))
        ).map((item, i) => {
          const resolved = resolveTarget((item as any).target ?? "");
          return (
            <Box
              key={i}
              component={resolved ? "a" : "span"}
              href={resolved || undefined}
              onClick={() => setDrawerOpen(false)}
              sx={{
                display: "block",
                px: 1.5,
                py: 1.1,
                fontSize: "0.95rem",
                fontWeight: 500,
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                textDecoration: "none",
                color:
                  menuItems.length === 0 ? `${navLinkColor}80` : navLinkColor,
                borderRadius: "10px",
                cursor: resolved ? "pointer" : "default",
                "&:hover": resolved
                  ? { color: themeColor, bgcolor: "rgba(0,0,0,0.04)" }
                  : {},
              }}
            >
              {(item as any).label}
            </Box>
          );
        })}
      </Drawer>
    </Box>
  );
};

const BeforeAfterEditorPreview: React.FC<{
  block: Record<string, any>;
  section?: Record<string, any>;
  compoundBlockSelectionProps: Record<string, any>;
  compoundBlockLabel: string;
  compoundCardSx: Record<string, any>;
  rawCardStyle: Record<string, any>;
  resolvedCardStyle: Record<string, any>;
}> = ({
  block,
  section,
  compoundBlockSelectionProps,
  compoundBlockLabel,
  compoundCardSx,
  rawCardStyle,
  resolvedCardStyle,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(50);
  const isDragging = React.useRef(false);

  const computePosition = React.useCallback((clientX: number) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const relX = clientX - rect.left;
    setPosition(Math.min(100, Math.max(0, (relX / rect.width) * 100)));
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    isDragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    computePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging.current) return;
    computePosition(e.clientX);
  };

  const handlePointerUp = () => {
    isDragging.current = false;
  };

  const fallback =
    "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1200&q=80";

  const beforeImage =
    section?.beforeImage || block.content?.beforeImage || fallback;
  const afterImage =
    section?.afterImage ||
    block.content?.afterImage ||
    "https://images.unsplash.com/photo-1497366412874-3415097a27e7?auto=format&fit=crop&w=1200&q=80";
  const beforeLabel =
    section?.beforeLabel || block.content?.beforeLabel || "Before";
  const afterLabel =
    section?.afterLabel || block.content?.afterLabel || "After";
  const clipPath = `inset(0 ${100 - position}% 0 0)`;

  const hasCustomPadding =
    rawCardStyle.padding !== undefined ||
    rawCardStyle.paddingTop !== undefined ||
    resolvedCardStyle.padding !== undefined ||
    resolvedCardStyle.paddingTop !== undefined;

  return (
    <Box
      {...compoundBlockSelectionProps}
      data-preview-label={compoundBlockLabel}
      sx={{
        ...compoundCardSx,
        overflow: "hidden",
        ...(!hasCustomPadding ? { p: 0 } : {}),
        boxShadow: "none",
        border: "none",
        backgroundColor: "transparent",
        backgroundImage: "none",
        borderRadius: 0,
        pt: rawCardStyle.paddingTop ?? resolvedCardStyle.paddingTop ?? "40px",
        pb:
          rawCardStyle.paddingBottom ??
          resolvedCardStyle.paddingBottom ??
          "60px",
      }}
    >
      {/* Draggable comparison frame */}
      <Box
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "12px",
          cursor: "col-resize",
          userSelect: "none",
          aspectRatio: "16/9",
          touchAction: "none",
          boxShadow: "0 4px 24px rgba(0,0,0,0.1)",
          bgcolor: "#e2e8f0",
        }}
      >
        {/* Before image */}
        <Box
          component="img"
          src={beforeImage}
          alt={beforeLabel}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
            userSelect: "none",
            display: "block",
          }}
        />

        {/* After image — revealed by clip-path */}
        <Box
          component="img"
          src={afterImage}
          alt={afterLabel}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            clipPath,
            pointerEvents: "none",
            userSelect: "none",
            display: "block",
          }}
        />

        {/* Before label */}
        <Box
          sx={{
            position: "absolute",
            top: 14,
            left: 14,
            px: 1.5,
            py: 0.5,
            bgcolor: "rgba(255,255,255,0.9)",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 5,
            backdropFilter: "blur(6px)",
            boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "0.02em",
            }}
          >
            {beforeLabel}
          </Typography>
        </Box>

        {/* After label */}
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            px: 1.5,
            py: 0.5,
            bgcolor: "rgba(255,255,255,0.9)",
            borderRadius: "6px",
            pointerEvents: "none",
            zIndex: 5,
            backdropFilter: "blur(6px)",
            boxShadow: "0 1px 6px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: "#1e293b",
              fontWeight: 700,
              fontSize: "0.78rem",
              letterSpacing: "0.02em",
            }}
          >
            {afterLabel}
          </Typography>
        </Box>

        {/* Divider line + circular handle */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${position}%`,
            transform: "translateX(-50%)",
            width: "2px",
            background: "#ffffff",
            cursor: "col-resize",
            zIndex: 10,
            boxShadow: "0 0 10px rgba(0,0,0,0.25)",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 44,
              height: 44,
              borderRadius: "50%",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 14px rgba(0,0,0,0.22)",
              cursor: "grab",
              userSelect: "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M6 4L2 9L6 14"
                stroke="#475569"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 4L16 9L12 14"
                stroke="#475569"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export const renderEditorSharedBlock = ({
  section,
  block,
  index,
  blockPath,
  tone,
  textColor,
  mutedTextColor,
  lineColor,
  themeColor,
  headingFont,
  headingStyle,
  bodyStyle,
  textStyle,
  buttonStyle,
  eyebrowStyle,
  imageStyle,
  cardStyle,
  sectionStyle,
  rawCardStyle,
  resolvedCardStyle,
  rawSectionStyle,
  resolvedSectionStyle,
  blockMaxWidth,
  canvas,
  canvasBaseSx,
  compoundBlockSelectionProps,
  compoundBlockLabel,
  compoundCardSx,
  fallbackImageSrc,
  accentSoftColor,
  whiteColor,
  getCanvasWidth,
  getCanvasMaxWidth,
  getCanvasTransform,
  getEditableFieldStyle,
  websiteId,
}: EditorSharedBlockRenderContext) => {
  const blockType = String(block.type || "").toLowerCase();

  if (!isEditorSharedBlockType(blockType)) {
    return null;
  }

  if (blockType === "heading") {
    return (
      <Typography
        key={String(block.id || `${blockType}-${index}`)}
        {...getEditableTextProps(section.blockId, `${blockPath}.text`, "multi")}
        sx={{
          maxWidth: blockMaxWidth,
          fontFamily: headingFont,
          fontSize: { xs: "2rem", md: "3.2rem" },
          lineHeight: 0.98,
          letterSpacing: "-0.05em",
          fontWeight: 800,
          color: textColor,
          ...(canvas
            ? {
                width: { xs: "100%", md: "min(540px, calc(100% - 112px))" },
                maxWidth: { xs: "100%", md: "540px" },
              }
            : {}),
          ...canvasBaseSx,
          ...headingStyle,
          transform: getCanvasTransform(headingStyle.transform),
          ...(canvas
            ? {}
            : {
                width: "100%",
                maxWidth: "100%",
                fontSize: {
                  xs: "clamp(1.8rem, 8vw, 2.7rem)",
                  sm: "clamp(2.1rem, 6vw, 3.1rem)",
                },
                lineHeight: 1.05,
                letterSpacing: "-0.04em",
              }),
        }}
      >
        {block.content?.text || "New section heading"}
      </Typography>
    );
  }

  if (blockType === "eyebrow") {
    return (
      <Chip
        key={String(block.id || `${blockType}-${index}`)}
        label={block.content?.text || "Section label"}
        {...getEditableTextProps(
          section.blockId,
          `${blockPath}.text`,
          "single",
        )}
        sx={{
          alignSelf: "flex-start",
          bgcolor:
            tone === "light" ? "rgba(255,255,255,0.14)" : accentSoftColor,
          color: textColor,
          backdropFilter: "blur(10px)",
          border:
            tone === "light"
              ? "1px solid rgba(255,255,255,0.22)"
              : `1px solid ${rgba(themeColor, 0.14)}`,
          fontWeight: 700,
          ...canvasBaseSx,
          ...eyebrowStyle,
          transform: getCanvasTransform(eyebrowStyle.transform),
        }}
      />
    );
  }

  if (blockType === "image") {
    return (
      <Box
        key={String(block.id || `${blockType}-${index}`)}
        component="img"
        src={block.content?.src || fallbackImageSrc}
        alt={block.content?.alt || "Section image"}
        {...getEditableImageProps(
          section.blockId,
          `${blockPath}.src`,
          block.label || "Section Image",
        )}
        sx={{
          height: imageStyle.height || { xs: 220, md: 360 },
          objectFit: imageStyle.objectFit || "cover",
          borderRadius: imageStyle.borderRadius ?? 0,
          display: "block",
          cursor: "pointer",
          borderWidth: imageStyle.borderWidth,
          borderColor: imageStyle.borderColor,
          borderStyle: imageStyle.borderWidth ? "solid" : undefined,
          ...canvasBaseSx,
          ...imageStyle,
          width: getCanvasWidth(imageStyle.width || "320px"),
          maxWidth: getCanvasMaxWidth(imageStyle.width || "320px"),
          transform: getCanvasTransform(imageStyle.transform),
          ...(canvas
            ? {}
            : {
                height: "auto",
                minHeight: 0,
                maxHeight: 420,
              }),
        }}
      />
    );
  }

  if (blockType === "button") {
    return (
      <Button
        key={String(block.id || `${blockType}-${index}`)}
        variant="contained"
        {...getEditableTextProps(
          section.blockId,
          `${blockPath}.text`,
          "single",
        )}
        sx={{
          alignSelf: "flex-start",
          bgcolor: themeColor,
          color: whiteColor,
          borderRadius: "16px",
          textTransform: "none",
          px: 2.8,
          py: 1.2,
          fontWeight: 700,
          boxShadow: "none",
          ...canvasBaseSx,
          ...buttonStyle,
          transform: getCanvasTransform(buttonStyle.transform),
          ...(canvas
            ? {}
            : {
                width: "auto",
                maxWidth: "100%",
                minWidth: 0,
                whiteSpace: "normal",
              }),
          "&:hover": {
            bgcolor: themeColor,
            boxShadow: "none",
            opacity: 0.94,
          },
        }}
      >
        {block.content?.text || "Button"}
      </Button>
    );
  }

  if (blockType === "divider") {
    return (
      <Box
        key={String(block.id || `${blockType}-${index}`)}
        sx={{
          width: getCanvasWidth(textStyle.width || "420px"),
          maxWidth: getCanvasMaxWidth(textStyle.width || "420px"),
          height: 1,
          backgroundColor: lineColor,
          ...canvasBaseSx,
          transform: getCanvasTransform(textStyle.transform),
        }}
      />
    );
  }

  if (blockType === "spacer") {
    return (
      <Box
        key={String(block.id || `${blockType}-${index}`)}
        sx={{
          width: "100%",
          maxWidth: blockMaxWidth,
          height: block.content?.height || "24px",
          flexShrink: 0,
          ...canvasBaseSx,
          transform: getCanvasTransform(textStyle.transform),
        }}
      />
    );
  }

  if (blockType === "marquee") {
    const marqueeText =
      block.content?.text || "We make things that work better and last longer.";
    const marqueeItems = Array.from({ length: 8 }, (_, itemIndex) => ({
      id: `marquee-${itemIndex}`,
      text: marqueeText,
    }));

    return (
      <Box
        key={String(block.id || `${blockType}-${index}`)}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          width: "100%",
          overflow: "hidden",
          borderTop: `1px solid ${rgba(themeColor, 0.16)}`,
          borderBottom: `1px solid ${rgba(themeColor, 0.16)}`,
          backgroundColor:
            tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
          ...canvasBaseSx,
          ...sectionStyle,
          ...cardStyle,
          transform: getCanvasTransform(cardStyle.transform),
          ...(canvas ? {} : { minHeight: "auto", height: "auto" }),
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: { xs: 4, md: 6 },
            py: { xs: 1.6, md: 2 },
            width: "max-content",
            minWidth: "100%",
            animation: "companyMarqueeSlide 42s linear infinite",
            "@keyframes companyMarqueeSlide": {
              "0%": { transform: "translateX(0)" },
              "100%": { transform: "translateX(-50%)" },
            },
          }}
        >
          {[...marqueeItems, ...marqueeItems].map((item, itemIndex) => (
            <Typography
              key={`${item.id}-${itemIndex}`}
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.text`,
                "single",
              )}
              sx={{
                color: textColor,
                fontFamily: headingFont,
                fontSize: { xs: "1rem", md: "1.1rem" },
                fontWeight: 600,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                ...textStyle,
              }}
            >
              {item.text}
            </Typography>
          ))}
        </Box>
      </Box>
    );
  }

  if (blockType === "announcement_bar") {
    const announcementText =
      block.content?.text || "Order before 2pm for next day delivery";

    return (
      <Box
        key={String(block.id || `${blockType}-${index}`)}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          width: "100%",
          maxWidth: "none",
          alignSelf: "stretch",
          m: 0,
          p: 0,
          borderRadius: 0,
          boxShadow: "none",
          border: "none",
          overflow: "hidden",
          backgroundColor:
            rawCardStyle.backgroundColor ??
            resolvedCardStyle.backgroundColor ??
            "#050505",
          backgroundImage: "none",
          minHeight: "auto",
          height: "auto",
        }}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.text`,
            "single",
          )}
          sx={{
            display: "block",
            width: "100%",
            color: rawCardStyle.color ?? resolvedCardStyle.color ?? "#ffffff",
            textAlign: "center",
            fontWeight: 700,
            fontSize: { xs: "0.82rem", md: "0.92rem" },
            lineHeight: 1.2,
            pt:
              rawCardStyle.paddingTop ?? resolvedCardStyle.paddingTop ?? "10px",
            pb:
              rawCardStyle.paddingBottom ??
              resolvedCardStyle.paddingBottom ??
              "10px",
            pl:
              rawCardStyle.paddingLeft ??
              resolvedCardStyle.paddingLeft ??
              "16px",
            pr:
              rawCardStyle.paddingRight ??
              resolvedCardStyle.paddingRight ??
              "16px",
            ...textStyle,
          }}
        >
          {announcementText}
        </Typography>
      </Box>
    );
  }

  if (
    blockType === "form_builder" ||
    blockType === "reservation_form" ||
    blockType === "generic_card"
  ) {
    const fields = Array.isArray(block.content?.fields)
      ? block.content.fields
      : [];
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        alignItems="flex-start"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={compoundCardSx}
      >
        <Box sx={{ width: "100%" }}>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontSize: { xs: "1.45rem", md: "2.15rem" },
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              ...headingStyle,
            }}
          >
            {block.content?.heading || block.label || "Section block"}
          </Typography>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.body`,
              "multi",
            )}
            sx={{
              mt: 1,
              color: mutedTextColor,
              fontSize: "1rem",
              lineHeight: 1.75,
              ...bodyStyle,
            }}
          >
            {block.content?.body || "Add supporting copy for this block."}
          </Typography>
        </Box>

        {blockType === "newsletter" ? (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.25}
            sx={{ width: "100%" }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={block.content?.placeholder || "Enter your email"}
              sx={{
                "& .MuiInputBase-root": {
                  color: textColor,
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                  borderRadius: 999,
                },
              }}
            />
            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                bgcolor: themeColor,
                color: whiteColor,
                borderRadius: "999px",
                textTransform: "none",
                px: 2.6,
                py: 1.05,
                whiteSpace: "nowrap",
                boxShadow: "none",
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Subscribe"}
            </Button>
          </Stack>
        ) : fields.length ? (
          <Stack spacing={1.1} sx={{ width: "100%" }}>
            {fields.map((field: string, fieldIndex: number) => (
              <TextField
                key={`${field}-${fieldIndex}`}
                size="small"
                fullWidth
                placeholder={field}
                sx={{
                  "& .MuiInputBase-root": {
                    color: textColor,
                    bgcolor:
                      tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                    borderRadius: 2.5,
                  },
                }}
              />
            ))}
            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                alignSelf: "flex-start",
                bgcolor: themeColor,
                color: whiteColor,
                borderRadius: "16px",
                textTransform: "none",
                px: 2.6,
                py: 1.05,
                boxShadow: "none",
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Submit"}
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.buttonText`,
              "single",
            )}
            sx={{
              bgcolor: themeColor,
              color: whiteColor,
              borderRadius: "16px",
              textTransform: "none",
              px: 2.7,
              py: 1.1,
              boxShadow: "none",
              ...buttonStyle,
            }}
          >
            {block.content?.buttonText || "Get started"}
          </Button>
        )}
      </Stack>
    );
  }

  if (
    blockType === "form_builder" ||
    blockType === "reservation_form" ||
    blockType === "generic_card"
  ) {
    const fields = Array.isArray(block.content?.fields)
      ? block.content.fields
      : [];
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        alignItems="flex-start"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={compoundCardSx}
      >
        <Box sx={{ width: "100%" }}>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontSize: { xs: "1.45rem", md: "2.15rem" },
              lineHeight: 1.05,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              ...headingStyle,
            }}
          >
            {block.content?.heading || block.label || "Section block"}
          </Typography>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.body`,
              "multi",
            )}
            sx={{
              mt: 1,
              color: mutedTextColor,
              fontSize: "1rem",
              lineHeight: 1.75,
              ...bodyStyle,
            }}
          >
            {block.content?.body || "Add supporting copy for this block."}
          </Typography>
        </Box>

        {blockType === "newsletter" ? (
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1.25}
            sx={{ width: "100%" }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={block.content?.placeholder || "Enter your email"}
              sx={{
                "& .MuiInputBase-root": {
                  color: textColor,
                  bgcolor:
                    tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                  borderRadius: 999,
                },
              }}
            />
            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                bgcolor: themeColor,
                color: whiteColor,
                borderRadius: "999px",
                textTransform: "none",
                px: 2.6,
                py: 1.05,
                whiteSpace: "nowrap",
                boxShadow: "none",
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Subscribe"}
            </Button>
          </Stack>
        ) : fields.length ? (
          <Stack spacing={1.1} sx={{ width: "100%" }}>
            {fields.map((field: string, fieldIndex: number) => (
              <TextField
                key={`${field}-${fieldIndex}`}
                size="small"
                fullWidth
                placeholder={field}
                sx={{
                  "& .MuiInputBase-root": {
                    color: textColor,
                    bgcolor:
                      tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                    borderRadius: 2.5,
                  },
                }}
              />
            ))}
            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                alignSelf: "flex-start",
                bgcolor: themeColor,
                color: whiteColor,
                borderRadius: "16px",
                textTransform: "none",
                px: 2.6,
                py: 1.05,
                boxShadow: "none",
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Submit"}
            </Button>
          </Stack>
        ) : (
          <Button
            variant="contained"
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.buttonText`,
              "single",
            )}
            sx={{
              bgcolor: themeColor,
              color: whiteColor,
              borderRadius: "16px",
              textTransform: "none",
              px: 2.7,
              py: 1.1,
              boxShadow: "none",
              ...buttonStyle,
            }}
          >
            {block.content?.buttonText || "Get started"}
          </Button>
        )}
      </Stack>
    );
  }

  if (blockType === "newsletter") {
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2.2}
        alignItems="stretch"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          width: "100%",
          overflow: "hidden",
          px: { xs: 2.5, md: 5 },
          py: { xs: 4, md: 5.5 },
          boxShadow: "none",
          ...compoundCardSx,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
            gap:
              rawCardStyle.layoutGap === undefined &&
              resolvedCardStyle.gap === undefined
                ? { xs: 2.5, md: 4 }
                : resolvedCardStyle.gap,
            alignItems: "center",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.heading`,
                "multi",
              )}
              sx={{
                color: textColor,
                fontFamily: headingFont,
                fontSize: { xs: "1.8rem", md: "2.65rem" },
                lineHeight: 1.05,
                fontWeight: 850,
                letterSpacing: "-0.05em",
                ...headingStyle,
              }}
            >
              {block.content?.heading || block.label || "Stay in the loop"}
            </Typography>

            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.body`,
                "multi",
              )}
              sx={{
                mt: 1.1,
                color: mutedTextColor,
                fontSize: "1rem",
                lineHeight: 1.7,
                maxWidth: 620,
                ...bodyStyle,
              }}
            >
              {block.content?.body ||
                "Subscribe for updates, offers, and helpful business insights."}
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.15}
            sx={{
              width: "100%",
              justifySelf: "end",
            }}
          >
            <TextField
              size="small"
              fullWidth
              placeholder={block.content?.placeholder || "Enter your email"}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: textColor,
                  borderRadius: "999px",
                  backgroundColor:
                    tone === "light" ? "rgba(255,255,255,0.82)" : "#ffffff",

                  "& fieldset": {
                    borderColor: lineColor,
                  },

                  "&:hover fieldset": {
                    borderColor: textColor,
                  },

                  "&.Mui-focused fieldset": {
                    borderColor: themeColor,
                    borderWidth: "1px",
                  },
                },

                "& .MuiInputBase-input": {
                  color: textColor,
                  WebkitTextFillColor: textColor,
                  fontSize: "0.95rem",

                  "&::placeholder": {
                    color: mutedTextColor,
                    opacity: 1,
                  },
                },
              }}
            />

            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                bgcolor: themeColor,
                color: whiteColor,
                borderRadius: "999px",
                textTransform: "none",
                px: 3,
                py: 1.05,
                whiteSpace: "nowrap",
                fontWeight: 800,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: themeColor,
                  boxShadow: "none",
                  opacity: 0.92,
                },
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Subscribe"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    );
  }

  if (blockType === "cta") {
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2.2}
        alignItems="center"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          width: "100%",
          textAlign: "center",
          overflow: "hidden",
          px: { xs: 2.5, md: 5 },
          py: { xs: 4, md: 6 },
          boxShadow: "none",
          ...compoundCardSx,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 760, mx: "auto" }}>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontSize: { xs: "2rem", md: "3.2rem" },
              lineHeight: 1,
              fontWeight: 850,
              letterSpacing: "-0.055em",
              textAlign: "center",
              ...headingStyle,
            }}
          >
            {block.content?.heading || block.label || "Ready to get started?"}
          </Typography>

          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.body`,
              "multi",
            )}
            sx={{
              mt: 1.4,
              color: mutedTextColor,
              fontSize: { xs: "1rem", md: "1.08rem" },
              lineHeight: 1.75,
              textAlign: "center",
              maxWidth: 620,
              mx: "auto",
              ...bodyStyle,
            }}
          >
            {block.content?.body ||
              "Create a clear next step for visitors and guide them toward your main action."}
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.2}
          alignItems="center"
          justifyContent="center"
          sx={{ width: "100%" }}
        >
          <Button
            variant="contained"
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.buttonText`,
              "single",
            )}
            sx={{
              bgcolor: themeColor,
              color: whiteColor,
              borderRadius: "999px",
              textTransform: "none",
              px: 3.2,
              py: 1.15,
              fontWeight: 800,
              minWidth: 150,
              boxShadow: "none",
              "&:hover": {
                bgcolor: themeColor,
                boxShadow: "none",
                opacity: 0.92,
              },
              ...buttonStyle,
            }}
          >
            {block.content?.buttonText || "Get started"}
          </Button>

          {block.content?.secondaryButtonText && (
            <Button
              variant="outlined"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.secondaryButtonText`,
                "single",
              )}
              sx={{
                color: textColor,
                borderColor: lineColor,
                borderRadius: "999px",
                textTransform: "none",
                px: 3.2,
                py: 1.15,
                fontWeight: 800,
                minWidth: 150,
                boxShadow: "none",
                "&:hover": {
                  borderColor: textColor,
                  bgcolor: "transparent",
                  boxShadow: "none",
                },
              }}
            >
              {block.content.secondaryButtonText}
            </Button>
          )}
        </Stack>
      </Stack>
    );
  }

  if (blockType === "contact") {
    const placeholderFields = [
      block.content?.fullNamePlaceholder || "Full name",
      block.content?.emailPlaceholder || "Email address",
      block.content?.messagePlaceholder || "Message",
    ];
    const fields = Array.isArray(block.content?.fields)
      ? block.content.fields
      : placeholderFields;
    const formFields = (fields.length ? fields : placeholderFields)
      .map((field, fieldIndex) => {
        if (typeof field === "string") {
          return {
            key: `${field}-${fieldIndex}`,
            label: field.trim() || `Field ${fieldIndex + 1}`,
          };
        }

        if (field && typeof field === "object") {
          const label =
            String(
              (field as Record<string, unknown>).label ??
                (field as Record<string, unknown>).placeholder ??
                "",
            ).trim() || `Field ${fieldIndex + 1}`;

          return {
            key: `${label}-${fieldIndex}`,
            label,
          };
        }

        return {
          key: `field-${fieldIndex}`,
          label: `Field ${fieldIndex + 1}`,
        };
      })
      .filter((field) => field.label);

    const contactDetails = [
      {
        label: "Email",
        value: block.content?.email || "hello@yourcompany.com",
        path: "email",
      },
      {
        label: "Phone",
        value: block.content?.phone || "+1 (555) 123-4567",
        path: "phone",
      },
      {
        label: "Address",
        value:
          block.content?.address || "123 Business Avenue, New York, NY 10001",
        path: "address",
      },
    ];

    const hasCustomPadding =
      rawCardStyle.padding !== undefined ||
      rawCardStyle.paddingTop !== undefined ||
      rawCardStyle.paddingBottom !== undefined ||
      rawCardStyle.paddingLeft !== undefined ||
      rawCardStyle.paddingRight !== undefined;

    const hasCustomBackground =
      rawCardStyle.background !== undefined ||
      rawCardStyle.backgroundColor !== undefined ||
      rawCardStyle.backgroundType !== undefined ||
      rawCardStyle.backgroundImageUrl !== undefined ||
      resolvedCardStyle.background !== undefined ||
      resolvedCardStyle.backgroundColor !== undefined;

    const formInputSx = {
      "& .MuiOutlinedInput-root": {
        color: textColor,
        backgroundColor:
          tone === "light" ? "rgba(255,255,255,0.82)" : "#ffffff",

        "& fieldset": {
          borderColor: lineColor,
        },

        "&:hover fieldset": {
          borderColor: textColor,
        },

        "&.Mui-focused fieldset": {
          borderColor: themeColor,
          borderWidth: "1px",
        },
      },

      "& .MuiInputBase-input": {
        color: textColor,
        WebkitTextFillColor: textColor,
        fontSize: "0.95rem",

        "&::placeholder": {
          color: mutedTextColor,
          opacity: 1,
        },
      },

      "& textarea": {
        color: textColor,
        WebkitTextFillColor: textColor,

        "&::placeholder": {
          color: mutedTextColor,
          opacity: 1,
        },
      },
    };

    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        alignItems="stretch"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          width: "100%",
          overflow: "hidden",

          ...(!hasCustomPadding
            ? {
                px: { xs: 2.5, md: 5 },
                py: { xs: 4, md: 6 },
              }
            : {}),

          ...(!hasCustomBackground
            ? {
                backgroundColor:
                  tone === "light" ? "rgba(255,255,255,0.96)" : "#f8fafc",
              }
            : {}),

          borderRadius:
            rawCardStyle.borderRadius === undefined &&
            resolvedCardStyle.borderRadius === undefined
              ? 0
              : resolvedCardStyle.borderRadius,

          boxShadow: "none",

          ...compoundCardSx,
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
            gap:
              rawCardStyle.layoutGap === undefined &&
              resolvedCardStyle.gap === undefined
                ? { xs: 3, md: 5 }
                : resolvedCardStyle.gap,
            alignItems: "start",
          }}
        >
          {/* Left content */}
          <Stack
            spacing={2}
            sx={{
              minWidth: 0,
            }}
          >
            <Box>
              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.heading`,
                  "multi",
                )}
                sx={{
                  color: textColor,
                  fontFamily: headingFont,
                  fontSize: { xs: "1.75rem", md: "2.55rem" },
                  lineHeight: 1.05,
                  fontWeight: 800,
                  letterSpacing: "-0.045em",
                  ...headingStyle,
                }}
              >
                {block.content?.heading || block.label || "Get in touch"}
              </Typography>

              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.body`,
                  "multi",
                )}
                sx={{
                  mt: 1,
                  color: mutedTextColor,
                  fontSize: "1rem",
                  lineHeight: 1.75,
                  ...bodyStyle,
                }}
              >
                {block.content?.body ||
                  "Share contact details or use the built-in inquiry form."}
              </Typography>
            </Box>

            <Stack spacing={1.25}>
              {contactDetails.map((item) => (
                <Box
                  key={item.path}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.2,
                    minWidth: 0,
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      bgcolor: themeColor,
                      color: whiteColor,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                    }}
                  >
                    {item.label.charAt(0)}
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      sx={{
                        color: mutedTextColor,
                        fontSize: "0.74rem",
                        fontWeight: 800,
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        mb: 0.25,
                      }}
                    >
                      {item.label}
                    </Typography>

                    <Typography
                      {...getEditableTextProps(
                        section.blockId,
                        `${blockPath}.${item.path}`,
                        "single",
                      )}
                      sx={{
                        color: textColor,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        lineHeight: 1.45,
                        wordBreak: "break-word",
                        ...bodyStyle,
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Stack>

          {/* Right form */}
          <Stack
            spacing={1.15}
            sx={{
              minWidth: 0,
              width: "100%",
            }}
          >
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.formTitle`,
                "single",
              )}
              sx={{
                color: textColor,
                fontFamily: headingFont,
                fontSize: { xs: "1.15rem", md: "1.35rem" },
                fontWeight: 800,
                letterSpacing: "-0.03em",
                ...headingStyle,
              }}
            >
              {block.content?.formTitle || "Send a message"}
            </Typography>

            {formFields.map((field, fieldIndex: number) => {
              const fieldLabel = field.label;
              const isMessage =
                fieldLabel.toLowerCase().includes("message") ||
                fieldLabel.toLowerCase().includes("detail");

              return (
                <TextField
                  key={field.key}
                  size="small"
                  fullWidth
                  multiline={isMessage}
                  minRows={isMessage ? 4 : undefined}
                  placeholder={fieldLabel}
                  sx={formInputSx}
                />
              );
            })}

            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                alignSelf: "flex-start",
                bgcolor: themeColor,
                color: whiteColor,
                borderRadius: "999px",
                textTransform: "none",
                px: 3,
                py: 1.1,
                fontWeight: 800,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: themeColor,
                  boxShadow: "none",
                  opacity: 0.92,
                },
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Contact us"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    );
  }
  if (blockType === "hero") {
    const heroContent = block.content || {};
    const heroImage = heroContent?.image || fallbackImageSrc;

    const normalizeSxSize = (value: any, fallback: any = "0px") => {
      if (value === undefined || value === null || value === "")
        return fallback;
      if (typeof value === "number") return `${value}px`;
      return value;
    };

    const negateSxSize = (value: any): any => {
      const normalized = normalizeSxSize(value);
      if (typeof normalized === "number") return `${-normalized}px`;
      if (typeof normalized === "string") {
        if (normalized === "0" || normalized === "0px") return "0px";
        if (normalized.startsWith("-")) return normalized;
        return `calc(${normalized} * -1)`;
      }
      if (typeof normalized === "object" && !Array.isArray(normalized)) {
        return Object.fromEntries(
          Object.entries(normalized).map(([key, itemValue]) => [
            key,
            negateSxSize(itemValue),
          ]),
        );
      }
      return normalized;
    };

    const calcBleedWidth = (left: any, right: any): any => {
      const l = normalizeSxSize(left);
      const r = normalizeSxSize(right);
      if (
        typeof l === "object" &&
        !Array.isArray(l) &&
        typeof r === "object" &&
        !Array.isArray(r)
      ) {
        const keys = Array.from(
          new Set([...Object.keys(l), ...Object.keys(r)]),
        );
        return Object.fromEntries(
          keys.map((key) => [
            key,
            `calc(100% + ${normalizeSxSize(l[key], "0px")} + ${normalizeSxSize(r[key], "0px")})`,
          ]),
        );
      }
      if (typeof l === "object" && !Array.isArray(l)) {
        return Object.fromEntries(
          Object.entries(l).map(([key, itemValue]) => [
            key,
            `calc(100% + ${normalizeSxSize(itemValue, "0px")} + ${normalizeSxSize(r, "0px")})`,
          ]),
        );
      }
      if (typeof r === "object" && !Array.isArray(r)) {
        return Object.fromEntries(
          Object.entries(r).map(([key, itemValue]) => [
            key,
            `calc(100% + ${normalizeSxSize(l, "0px")} + ${normalizeSxSize(itemValue, "0px")})`,
          ]),
        );
      }
      return `calc(100% + ${normalizeSxSize(l)} + ${normalizeSxSize(r)})`;
    };

    const heroBleedX = { xs: "16px", sm: "24px", md: "32px" };
    const heroBleedY = { xs: "0px", md: "0px" };

    const sectionPaddingLeft =
      rawSectionStyle.paddingLeft ??
      rawSectionStyle.pl ??
      rawSectionStyle.px ??
      resolvedSectionStyle?.paddingLeft ??
      resolvedSectionStyle?.pl ??
      resolvedSectionStyle?.px ??
      heroBleedX;
    const sectionPaddingRight =
      rawSectionStyle.paddingRight ??
      rawSectionStyle.pr ??
      rawSectionStyle.px ??
      resolvedSectionStyle?.paddingRight ??
      resolvedSectionStyle?.pr ??
      resolvedSectionStyle?.px ??
      heroBleedX;
    const sectionPaddingTop =
      rawSectionStyle.paddingTop ??
      rawSectionStyle.pt ??
      rawSectionStyle.py ??
      resolvedSectionStyle?.paddingTop ??
      resolvedSectionStyle?.pt ??
      resolvedSectionStyle?.py ??
      heroBleedY;
    const sectionPaddingBottom =
      rawSectionStyle.paddingBottom ??
      rawSectionStyle.pb ??
      rawSectionStyle.py ??
      resolvedSectionStyle?.paddingBottom ??
      resolvedSectionStyle?.pb ??
      resolvedSectionStyle?.py ??
      heroBleedY;

    const heroMinHeight = rawCardStyle.minHeight ??
      resolvedCardStyle.minHeight ?? { xs: 520, md: 640 };
    const heroOverlay =
      rawCardStyle.overlay ??
      rawCardStyle.overlayColor ??
      resolvedCardStyle.overlay ??
      resolvedCardStyle.overlayColor ??
      "linear-gradient(90deg, rgba(8,12,20,0.9) 0%, rgba(8,12,20,0.76) 42%, rgba(8,12,20,0.38) 100%)";

    const heroBleedWidth = calcBleedWidth(
      sectionPaddingLeft,
      sectionPaddingRight,
    );

    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          position: "relative",
          overflow: "hidden",
          isolation: "isolate",
          p: "0 !important",
          padding: "0 !important",
          borderRadius: "0 !important",
          boxShadow: "none !important",
          border: "none !important",
          backgroundColor: "#0f1115",
          width: heroBleedWidth,
          maxWidth: heroBleedWidth,
          minWidth: heroBleedWidth,
          alignSelf: "stretch !important",
          ml: negateSxSize(sectionPaddingLeft),
          mr: negateSxSize(sectionPaddingRight),
          mt: negateSxSize(sectionPaddingTop),
          mb: negateSxSize(sectionPaddingBottom),
          minHeight: heroMinHeight,
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt={heroContent?.heading || "Hero background image"}
          {...getEditableImageProps(
            section.blockId,
            `${blockPath}.image`,
            block.label || "Hero Background Image",
          )}
          sx={{
            ...imageStyle,
            position: "absolute",
            inset: 0,
            width: "100% !important",
            height: "100% !important",
            objectFit: imageStyle.objectFit || "cover",
            objectPosition: imageStyle.objectPosition || "center",
            display: "block",
            zIndex: -3,
            borderRadius: "0 !important",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: heroOverlay,
            zIndex: -2,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 20% 35%, rgba(255,255,255,0.12), transparent 30%), linear-gradient(180deg, rgba(0,0,0,0.04), rgba(0,0,0,0.3))",
            zIndex: -1,
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            width: "100%",
            maxWidth: "1550px",
            mx: "auto",
            minHeight: heroMinHeight,
            px: { xs: 2.4, sm: 4, md: 6 },
            py: { xs: 6, md: 8 },
            display: "flex",
            alignItems: "center",
          }}
        >
          <Stack
            spacing={{ xs: 1.7, md: 2 }}
            sx={{ width: "100%", maxWidth: { xs: "100%", md: 660 } }}
          >
            <Chip
              label={heroContent?.eyebrow || "Hero section"}
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.eyebrow`,
                "single",
              )}
              sx={{
                alignSelf: "flex-start",
                height: 34,
                px: 0.8,
                bgcolor: "rgba(255,255,255,0.14)",
                color: "#ffffff",
                border: "1px solid rgba(255,255,255,0.24)",
                backdropFilter: "blur(14px)",
                fontWeight: 800,
                letterSpacing: "0.01em",
                ...eyebrowStyle,
              }}
            />
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.heading`,
                "multi",
              )}
              sx={{
                color: "#ffffff",
                fontFamily: headingFont,
                fontSize: { xs: "2.35rem", sm: "3.25rem", md: "4.8rem" },
                lineHeight: { xs: 1.04, md: 0.98 },
                fontWeight: 900,
                letterSpacing: "-0.065em",
                textWrap: "balance",
                textShadow: "0 20px 54px rgba(0,0,0,0.4)",
                ...headingStyle,
              }}
            >
              {heroContent?.heading || "Large headline for this section"}
            </Typography>
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.body`,
                "multi",
              )}
              sx={{
                color: "rgba(255,255,255,0.78)",
                fontSize: { xs: "1rem", md: "1.18rem" },
                lineHeight: 1.75,
                maxWidth: 560,
                textShadow: "0 12px 36px rgba(0,0,0,0.4)",
                ...bodyStyle,
              }}
            >
              {heroContent?.body || "Customize the hero block from the editor."}
            </Typography>
            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                alignSelf: "flex-start",
                bgcolor: themeColor,
                color: whiteColor,
                borderRadius: "999px",
                textTransform: "none",
                px: 3.4,
                py: 1.25,
                minHeight: 50,
                boxShadow: "0 18px 48px rgba(0,0,0,0.32)",
                fontWeight: 800,
                fontSize: "1rem",
                ...buttonStyle,
              }}
            >
              {heroContent?.buttonText || "Get started"}
            </Button>
          </Stack>
        </Box>
      </Stack>
    );
  }

  if (blockType === "image_text_split") {
    const splitContent = block.content || {};
    const hasCustomPadding =
      rawCardStyle.padding !== undefined ||
      rawCardStyle.paddingTop !== undefined ||
      rawCardStyle.paddingBottom !== undefined ||
      rawCardStyle.paddingLeft !== undefined ||
      rawCardStyle.paddingRight !== undefined ||
      resolvedCardStyle.padding !== undefined ||
      resolvedCardStyle.paddingTop !== undefined ||
      resolvedCardStyle.paddingBottom !== undefined ||
      resolvedCardStyle.paddingLeft !== undefined ||
      resolvedCardStyle.paddingRight !== undefined;

    const splitImage =
      splitContent?.image || splitContent?.imageUrl || fallbackImageSrc;

    const splitVideo =
      splitContent?.video ||
      splitContent?.videoUrl ||
      splitContent?.mediaUrl ||
      "";

    const mediaType =
      splitContent?.mediaType === "video" || splitVideo ? "video" : "image";

    const mediaAlt =
      splitContent?.mediaAlt ||
      splitContent?.imageAlt ||
      splitContent?.heading ||
      "Split section media";
    const mediaAspectRatio = rawCardStyle.mediaAspectRatio ||
      resolvedCardStyle.mediaAspectRatio || { xs: "4 / 3", md: "5 / 4" };
    const mediaMinHeight = rawCardStyle.mediaMinHeight ||
      resolvedCardStyle.mediaMinHeight || { xs: 300, sm: 380, md: 460 };
    const mediaObjectFit =
      imageStyle.objectFit || splitContent?.imageFit || "contain";

    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={0}
        alignItems="stretch"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          width: "100%",
          overflow: "hidden",
          boxShadow: "none",
          border: "none",
          ...(!hasCustomPadding
            ? {
                p: { xs: 3, sm: 5 },
              }
            : {}),
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "minmax(0, 1fr) minmax(0, 1fr)",
            },
            gap:
              rawCardStyle.layoutGap === undefined &&
              resolvedCardStyle.gap === undefined
                ? { xs: 3, md: 5 }
                : resolvedCardStyle.gap,
            alignItems: "center",
          }}
        >
          {/* Left content */}
          <Stack
            spacing={{ xs: 1.5, md: 1.8 }}
            sx={{
              minWidth: 0,
              width: "100%",
            }}
          >
            {splitContent?.eyebrow ? (
              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.eyebrow`,
                  "single",
                )}
                sx={{
                  color: themeColor,
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  ...eyebrowStyle,
                }}
              >
                {splitContent.eyebrow}
              </Typography>
            ) : null}

            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.heading`,
                "multi",
              )}
              sx={{
                color: textColor,
                fontFamily: headingFont,
                fontSize: { xs: "2rem", sm: "2.55rem", md: "3.45rem" },
                lineHeight: { xs: 1.05, md: 1 },
                fontWeight: 850,
                letterSpacing: "-0.055em",
                textWrap: "balance",
                ...headingStyle,
              }}
            >
              {splitContent?.heading || "Tell your story with a strong visual"}
            </Typography>

            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.body`,
                "multi",
              )}
              sx={{
                color: mutedTextColor,
                fontSize: { xs: "1rem", md: "1.08rem" },
                lineHeight: 1.75,
                maxWidth: 620,
                ...bodyStyle,
              }}
            >
              {splitContent?.body ||
                "Use this split section to explain your service, product, process, or brand story with supporting image or video content."}
            </Typography>

            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                alignSelf: "flex-start",
                bgcolor: themeColor,
                color: whiteColor,
                borderRadius: "999px",
                textTransform: "none",
                px: 3.2,
                py: 1.15,
                minHeight: 48,
                fontWeight: 800,
                fontSize: "0.98rem",
                boxShadow: "none",
                "&:hover": {
                  bgcolor: themeColor,
                  boxShadow: "none",
                  opacity: 0.92,
                },
                ...buttonStyle,
              }}
            >
              {splitContent?.buttonText || "Learn more"}
            </Button>
          </Stack>

          {/* Right media */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              minHeight: mediaMinHeight,
              aspectRatio: mediaAspectRatio,
              borderRadius: imageStyle.borderRadius ||
                rawCardStyle.mediaBorderRadius ||
                resolvedCardStyle.mediaBorderRadius || { xs: 3, md: 4 },
              overflow: "hidden",
              backgroundColor:
                rawCardStyle.mediaBackgroundColor ||
                resolvedCardStyle.mediaBackgroundColor ||
                "rgba(15,23,42,0.06)",
            }}
          >
            {mediaType === "video" && splitVideo ? (
              <Box
                component="video"
                src={splitVideo}
                controls
                playsInline
                muted={splitContent?.muted !== false}
                loop={Boolean(splitContent?.loop)}
                poster={splitImage}
                data-edit-video="video"
                data-video-label="Split Video"
                data-block-id={section.blockId}
                sx={{
                  width: "100%",
                  height: "100%",
                  minHeight: mediaMinHeight,
                  objectFit: imageStyle.objectFit || "cover",
                  objectPosition: imageStyle.objectPosition || "center",
                  display: "block",
                  borderRadius: "inherit",
                }}
              />
            ) : (
              <Box
                component="img"
                src={splitImage}
                alt={mediaAlt}
                {...getEditableImageProps(
                  section.blockId,
                  `${blockPath}.image`,
                  block.label || "Split Image",
                )}
                sx={{
                  ...imageStyle,
                  width: "100%",
                  height: "100%",
                  minHeight: mediaMinHeight,
                  objectFit: mediaObjectFit,
                  objectPosition: imageStyle.objectPosition || "center",
                  display: "block",
                  borderRadius: "inherit",
                }}
              />
            )}
          </Box>
        </Box>
      </Stack>
    );
  }

  if (blockType === "video") {
    const videoUrl = String(block.content?.videoUrl || "");
    const isEmbed =
      videoUrl.includes("youtube.com") ||
      videoUrl.includes("youtu.be") ||
      videoUrl.includes("vimeo.com");
    const desktopVideoWidth = Math.min(
      100,
      Math.max(20, Number(block.content?.width) || 100),
    );
    const mobileVideoWidth = Math.min(
      100,
      Math.max(20, Number(block.content?.mobileWidth) || 100),
    );
    const videoHeightPreset = String(
      block.content?.heightPreset || "fullscreen",
    );
    const videoHeightSx = getVideoHeightPresetSx(videoHeightPreset);
    const videoObjectFit = String(block.content?.objectFit || "contain");
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          width: {
            xs: mobileVideoWidth >= 100 ? "100%" : `${mobileVideoWidth}%`,
            md: desktopVideoWidth >= 100 ? "100%" : `${desktopVideoWidth}%`,
          },
          maxWidth: "100%",
          mx: "auto",
          alignSelf: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            borderRadius: "24px",
            overflow: "hidden",
            bgcolor: tone === "light" ? "rgba(255,255,255,0.1)" : "#ffffff",
            border: `1px solid ${rgba(themeColor, 0.12)}`,
            ...videoHeightSx,
          }}
        >
          {videoUrl ? (
            isEmbed ? (
              <Box
                component="iframe"
                src={videoUrl}
                title={block.label || "Video"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                sx={{ width: "100%", height: "100%", border: 0 }}
              />
            ) : (
              <Box
                component="video"
                src={videoUrl}
                controls={block.content?.showControls !== false}
                muted={block.content?.muted !== false}
                autoPlay={Boolean(block.content?.autoplay)}
                loop={Boolean(block.content?.loop)}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: videoObjectFit,
                  display: "block",
                  backgroundColor: "#000000",
                }}
              />
            )
          ) : (
            <Stack
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{ width: "100%", height: "100%" }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "999px",
                  bgcolor: rgba(themeColor, 0.12),
                  display: "grid",
                  placeItems: "center",
                  color: themeColor,
                  fontSize: "1.8rem",
                  fontWeight: 800,
                }}
              >
                ▶
              </Box>
              <Typography sx={{ color: mutedTextColor }}>
                Add a video URL from the editor.
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    );
  }

  if (blockType === "gallery") {
    const fallbackGalleryImages = [
      fallbackImageSrc,
      ...galleryFallbackImages,
    ].filter(Boolean);

    const galleryImages = (
      Array.isArray(block.content?.images) && block.content.images.length > 0
        ? block.content.images
        : fallbackGalleryImages.map((src, imageIndex) => ({
            image: src,
            alt: `Gallery image ${imageIndex + 1}`,
          }))
    )
      .map((item: any, imageIndex: number) => ({
        src: String(
          item?.image ||
            item?.src ||
            item?.url ||
            fallbackGalleryImages[imageIndex % fallbackGalleryImages.length] ||
            fallbackImageSrc,
        ),
        alt: String(
          item?.alt || item?.caption || `Gallery image ${imageIndex + 1}`,
        ),
      }))
      .filter((item: { src: string }) => item.src)
      .slice(0, 5);

    const featuredImages =
      galleryImages.length >= 5
        ? galleryImages
        : [
            ...galleryImages,
            ...fallbackGalleryImages
              .slice(0, 5 - galleryImages.length)
              .map((src, imageIndex) => ({
                src,
                alt: `Gallery image ${galleryImages.length + imageIndex + 1}`,
              })),
          ].slice(0, 5);

    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={{ xs: 2.5, md: 3.2 }}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          boxShadow: "none",
          border: "none",
          borderRadius: 0,
          px: rawCardStyle.paddingLeft ?? resolvedCardStyle.paddingLeft ?? 0,
          pt: rawCardStyle.paddingTop ?? resolvedCardStyle.paddingTop ?? "60px",
          pb:
            rawCardStyle.paddingBottom ??
            resolvedCardStyle.paddingBottom ??
            "60px",
        }}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.heading`,
            "single",
          )}
          sx={{
            color: textColor,
            fontFamily: headingFont,
            fontSize: { xs: "2rem", md: "3rem" },
            lineHeight: 1,
            letterSpacing: "-0.04em",
            fontWeight: 800,
            textAlign: "center",
            ...headingStyle,
          }}
        >
          {block.content?.heading || "Image Gallery"}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gap: { xs: 1.25, md: 1.6 },
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(6, minmax(0, 1fr))",
            },
            gridTemplateAreas: {
              xs: `"hero" "side" "bottom1" "bottom2" "bottom3"`,
              sm: `"hero hero" "side side" "bottom1 bottom2" "bottom3 bottom3"`,
              md: `"hero hero hero hero side side" "bottom1 bottom1 bottom2 bottom2 bottom3 bottom3"`,
            },
          }}
        >
          {featuredImages.map((item, imageIndex) => {
            const areaMap = ["hero", "side", "bottom1", "bottom2", "bottom3"];
            const area = areaMap[imageIndex] || `image-${imageIndex}`;
            const heightMap = [
              { xs: 260, sm: 300, md: 340 },
              { xs: 220, sm: 240, md: 340 },
              { xs: 220, sm: 240, md: 240 },
              { xs: 220, sm: 240, md: 240 },
              { xs: 220, sm: 240, md: 240 },
            ];

            return (
              <Box
                key={`${item.src}-${imageIndex}`}
                sx={{
                  gridArea: area,
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: { xs: "18px", md: "22px" },
                  height: heightMap[imageIndex] || { xs: 220, md: 220 },
                  minHeight: 0,
                  backgroundColor: "#eadfce",
                }}
              >
                <Box
                  component="img"
                  src={item.src}
                  alt={item.alt}
                  {...getEditableImageProps(
                    section.blockId,
                    `${blockPath}.images.${imageIndex}.image`,
                    `Gallery image ${imageIndex + 1}`,
                  )}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    display: "block",
                    objectFit: "cover",
                    objectPosition: "center",
                    transition: "transform 220ms ease",
                    "&:hover": {
                      transform: "scale(1.03)",
                    },
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Stack>
    );
  }

  if (blockType === "team") {
    const fallbackTeamImages = [
      "/assets/publicAssets/images/home/avatar1.webp",
      "/assets/publicAssets/images/home/avatar2.webp",
      "/assets/publicAssets/images/home/avatar3.webp",
    ];

    const members = (
      Array.isArray(block.content?.members) && block.content.members.length > 0
        ? block.content.members
        : fallbackTeamImages.map((avatar, memberIndex) => ({
            avatar,
            name: `Team member ${memberIndex + 1}`,
            role: "Team role",
          }))
    )
      .map((member: any, memberIndex: number) => ({
        avatar: String(
          member?.avatar ||
            member?.image ||
            fallbackTeamImages[memberIndex % fallbackTeamImages.length],
        ),
        name: String(member?.name || `Team member ${memberIndex + 1}`),
        role: String(member?.role || "Team role"),
      }))
      .slice(0, 3);

    const teamHeadingStyle = getEditableFieldStyle("heading", headingStyle);
    const teamNameStyle = getEditableFieldStyle("members.0.name", headingStyle);
    const teamRoleStyle = getEditableFieldStyle("members.0.role", textStyle);

    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={{ xs: 2.5, md: 3.2 }}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          px: rawCardStyle.paddingLeft ?? resolvedCardStyle.paddingLeft ?? 0,
          pt: rawCardStyle.paddingTop ?? resolvedCardStyle.paddingTop ?? "48px",
          pb:
            rawCardStyle.paddingBottom ??
            resolvedCardStyle.paddingBottom ??
            "48px",
          boxShadow: "none",
          border: "none",
          borderRadius: 0,
        }}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.heading`,
            "single",
          )}
          sx={{
            color: textColor,
            fontFamily: headingFont,
            fontSize: { xs: "2rem", md: "3rem" },
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            fontWeight: 800,
            textAlign: "center",
            ...teamHeadingStyle,
          }}
        >
          {block.content?.heading || "Meet our expert team"}
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 1.5, md: 2 },
          }}
        >
          {members.map((member, memberIndex) => (
            <Box
              key={`${member.name}-${memberIndex}`}
              sx={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                borderRadius: "24px",
                backgroundColor:
                  tone === "light" ? "#ffffff" : "rgba(255,255,255,0.96)",
                border: `1px solid ${rgba(themeColor, 0.12)}`,
                boxShadow:
                  tone === "light"
                    ? "0 20px 44px rgba(15,23,42,0.08)"
                    : "0 20px 44px rgba(0,0,0,0.24)",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  aspectRatio: "4 / 4.7",
                  overflow: "hidden",
                  backgroundColor: "#eadfce",
                }}
              >
                <Box
                  component="img"
                  src={member.avatar}
                  alt={member.name}
                  {...getEditableImageProps(
                    section.blockId,
                    `${blockPath}.members.${memberIndex}.avatar`,
                    `Team member ${memberIndex + 1}`,
                  )}
                  sx={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    display: "block",
                  }}
                />
              </Box>

              <Stack spacing={0.45} sx={{ p: { xs: 2, md: 2.2 } }}>
                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.members.${memberIndex}.name`,
                    "single",
                  )}
                  sx={{
                    color: textColor,
                    fontFamily: headingFont,
                    fontSize: "1.15rem",
                    fontWeight: 800,
                    lineHeight: 1.2,
                    ...teamNameStyle,
                  }}
                >
                  {member.name}
                </Typography>

                <Typography
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.members.${memberIndex}.role`,
                    "single",
                  )}
                  sx={{
                    color: mutedTextColor,
                    fontSize: "0.95rem",
                    lineHeight: 1.5,
                    ...teamRoleStyle,
                  }}
                >
                  {member.role}
                </Typography>
              </Stack>
            </Box>
          ))}
        </Box>
      </Stack>
    );
  }

  if (blockType === "features") {
    const items = Array.isArray(block.content?.items)
      ? block.content.items
      : [];
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={compoundCardSx}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.heading`,
            "multi",
          )}
          sx={{
            color: textColor,
            fontFamily: headingFont,
            fontSize: { xs: "1.4rem", md: "2rem" },
            fontWeight: 800,
            letterSpacing: "-0.03em",
            ...headingStyle,
          }}
        >
          {block.content?.heading || "Core features"}
        </Typography>
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.body`,
            "multi",
          )}
          sx={{ color: mutedTextColor, lineHeight: 1.75, ...bodyStyle }}
        >
          {block.content?.body ||
            "Highlight the strongest benefits of this section."}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 1.35,
            width: "100%",
          }}
        >
          {items.map((item: Record<string, any>, itemIndex: number) => (
            <Box
              key={`feature-${itemIndex}`}
              sx={{
                p: 2,
                borderRadius: "18px",
                border: `1px solid ${rgba(themeColor, 0.12)}`,
                bgcolor:
                  tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
              }}
            >
              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.items.${itemIndex}.title`,
                  "single",
                )}
                sx={{ color: textColor, fontWeight: 700 }}
              >
                {item?.title || `Feature ${itemIndex + 1}`}
              </Typography>
              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.items.${itemIndex}.description`,
                  "multi",
                )}
                sx={{
                  mt: 0.6,
                  color: mutedTextColor,
                  fontSize: "0.94rem",
                  lineHeight: 1.65,
                }}
              >
                {item?.description || "Describe this feature here."}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    );
  }

  if (blockType === "faq") {
    const items = Array.isArray(block.content?.items)
      ? block.content.items
      : [];
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          px: rawCardStyle.paddingLeft ?? resolvedCardStyle.paddingLeft ?? 0,
          pt: rawCardStyle.paddingTop ?? resolvedCardStyle.paddingTop ?? "40px",
          pb:
            rawCardStyle.paddingBottom ??
            resolvedCardStyle.paddingBottom ??
            "60px",
        }}
      >
        <EditorFaqAccordionCard
          blockId={section.blockId}
          blockPath={blockPath}
          heading={block.content?.heading as string}
          items={items}
          textColor={textColor}
          mutedTextColor={mutedTextColor}
          themeColor={themeColor}
          headingFont={headingFont}
          tone={tone}
          headingStyle={getEditableFieldStyle("heading", headingStyle)}
          questionStyle={getEditableFieldStyle(
            "items.0.question",
            headingStyle,
          )}
          answerStyle={getEditableFieldStyle("items.0.answer", bodyStyle)}
        />
      </Stack>
    );
  }

  if (blockType === "tabs") {
    const tabs = Array.isArray(block.content?.tabs) ? block.content.tabs : [];
    const activeTab = tabs[0];
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={compoundCardSx}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.heading`,
            "single",
          )}
          sx={{
            color: textColor,
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: { xs: "1.4rem", md: "2rem" },
            ...headingStyle,
          }}
        >
          {block.content?.heading || "Explore the details"}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {tabs.map((tab: Record<string, any>, tabIndex: number) => (
            <Chip
              key={`tab-${tabIndex}`}
              label={tab?.label || `Tab ${tabIndex + 1}`}
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.tabs.${tabIndex}.label`,
                "single",
              )}
              sx={{
                bgcolor:
                  tabIndex === 0
                    ? themeColor
                    : tone === "light"
                      ? "rgba(255,255,255,0.08)"
                      : "#ffffff",
                color: tabIndex === 0 ? "#fffdf9" : textColor,
                border: `1px solid ${rgba(themeColor, 0.12)}`,
                fontWeight: 700,
              }}
            />
          ))}
        </Stack>
        <Box
          sx={{
            p: 2.2,
            borderRadius: "20px",
            bgcolor: tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
            border: `1px solid ${rgba(themeColor, 0.12)}`,
          }}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.tabs.0.label`,
              "single",
            )}
            sx={{ color: textColor, fontWeight: 700 }}
          >
            {activeTab?.label || "Tab content"}
          </Typography>
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.tabs.0.content`,
              "multi",
            )}
            sx={{ mt: 0.8, color: mutedTextColor, lineHeight: 1.75 }}
          >
            {activeTab?.content || "Add tab content from the editor."}
          </Typography>
        </Box>
      </Stack>
    );
  }

  if (blockType === "navigation_bar") {
    const links = Array.isArray(block.content?.links)
      ? block.content.links
      : [];
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        direction={{ xs: "column", md: "row" }}
        spacing={1.5}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={compoundCardSx}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.logoText`,
            "single",
          )}
          sx={{
            color: textColor,
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: "1.15rem",
            ...headingStyle,
          }}
        >
          {block.content?.logoText || block.content?.heading || "Your Brand"}
        </Typography>
        {links.length ? (
          <Stack direction="row" spacing={2} flexWrap="wrap">
            {links.map((link: string, linkIndex: number) => (
              <Typography
                key={`${link}-${linkIndex}`}
                sx={{ color: mutedTextColor, fontWeight: 600 }}
              >
                {link}
              </Typography>
            ))}
          </Stack>
        ) : (
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.copyright`,
              "single",
            )}
            sx={{ color: mutedTextColor, ...bodyStyle }}
          >
            {block.content?.copyright ||
              "(c) 2026 Your company. All rights reserved."}
          </Typography>
        )}
      </Stack>
    );
  }

  if (blockType === "footer") {
    const defaultFooterContent = {
      logoText: "LOGO",
      description:
        "A modern business footer with direct contact details, useful navigation, and a simple subscribe form.",
      links: [
        { label: "Privacy policy", url: "/privacy-policy" },
        { label: "Terms & condition", url: "/terms-and-condition" },
        { label: "Cookie Policy", url: "/cookie-policy" },
      ],
      contactEmail: "hello@yourcompany.com",
      contactPhone: "+1 (555) 123-4567",
      contactAddress: "123 Business Avenue, New York, NY 10001",
      socialLinks: [
        { platform: "linkedin", url: "https://linkedin.com" },
        { platform: "instagram", url: "https://instagram.com" },
        { platform: "facebook", url: "https://facebook.com" },
      ],
      placeholder: "Enter your email",
      buttonText: "Subscribe",
      copyright: "(c) 2026 Your company. All rights reserved.",
    };
    const footerContent =
      String(section.content?.editorBlockType || "").toLowerCase() === "footer"
        ? {
            ...defaultFooterContent,
            ...(block.content || {}),
            ...(section.content || {}),
          }
        : {
            ...defaultFooterContent,
            ...(block.content || {}),
          };

    const footerLinks = Array.isArray(footerContent?.links)
      ? footerContent.links
          .map((link: any) =>
            typeof link === "string"
              ? { label: link, url: "#" }
              : {
                  label: String(link?.label || link?.text || "").trim(),
                  url: String(link?.url || link?.href || "#").trim() || "#",
                },
          )
          .filter((link: { label: string }) => link.label)
      : [];

    const footerSocialLinks = Array.isArray(footerContent?.socialLinks)
      ? footerContent.socialLinks
          .map((item: any) => ({
            platform: String(item?.platform || item?.label || "").trim(),
            url: String(item?.url || item?.href || "").trim(),
          }))
          .filter(
            (item: { platform: string; url: string }) =>
              item.platform && item.url,
          )
      : [];

    const footerLayoutWidth = String(
      rawCardStyle.layoutWidth ??
        resolvedCardStyle.layoutWidth ??
        rawSectionStyle.layoutWidth ??
        resolvedSectionStyle?.layoutWidth ??
        "page",
    ).toLowerCase();

    /**
     * Outer footer:
     * page/full dono par background full available width rahega.
     */
    const footerOuterShouldStretch =
      footerLayoutWidth === "page" || footerLayoutWidth === "full";

    /**
     * Inner content:
     * Sirf explicit "full" par full width.
     * Default "page" aur "container" dono par content container width mein rahega.
     */
    const footerInnerShouldStretch = footerLayoutWidth === "full";

    const footerBackgroundColor =
      rawCardStyle.backgroundColor ??
      resolvedCardStyle.backgroundColor ??
      "#0f1115";

    const footerBackgroundImage =
      rawCardStyle.backgroundImage ??
      resolvedCardStyle.backgroundImage ??
      (rawCardStyle.backgroundImageUrl || resolvedCardStyle.backgroundImageUrl
        ? resolvedCardStyle.backgroundImage
        : "none");

    const footerBorderColor =
      rawCardStyle.borderColor ??
      resolvedCardStyle.borderColor ??
      "rgba(255,255,255,0.12)";

    const footerPaddingTop =
      rawCardStyle.paddingTop ?? resolvedCardStyle.paddingTop ?? "24px";

    const footerPaddingBottom =
      rawCardStyle.paddingBottom ?? resolvedCardStyle.paddingBottom ?? "24px";

    const footerPaddingLeft =
      rawCardStyle.paddingLeft ?? resolvedCardStyle.paddingLeft ?? "24px";

    const footerPaddingRight =
      rawCardStyle.paddingRight ?? resolvedCardStyle.paddingRight ?? "24px";

    const footerLogoStyle = getEditableFieldStyle("logoText", headingStyle);

    const footerDescriptionStyle = getEditableFieldStyle(
      "description",
      bodyStyle,
    );

    const footerLinkStyle = getEditableFieldStyle("links.0.label", textStyle);

    const footerContactStyle = getEditableFieldStyle("contactEmail", bodyStyle);

    const footerButtonTextStyle = getEditableFieldStyle(
      "buttonText",
      buttonStyle,
    );

    const footerCopyrightStyle = getEditableFieldStyle("copyright", bodyStyle);

    const footerInnerContainerSx = footerInnerShouldStretch
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
        };

    const footerUsesLightText =
      footerBackgroundImage !== "none" ||
      (typeof footerBackgroundColor === "string" &&
        !isLightColor(footerBackgroundColor));

    const footerTextColor = footerUsesLightText ? "#f8fafc" : textColor;

    const footerMutedColor = footerUsesLightText
      ? "rgba(248,250,252,0.72)"
      : mutedTextColor;

    const footerLineColor = footerUsesLightText
      ? "rgba(248,250,252,0.14)"
      : lineColor;

    const resolveSocialIcon = (platform: string) => {
      const normalized = String(platform || "")
        .trim()
        .toLowerCase();

      if (normalized.includes("instagram")) return Instagram;
      if (normalized.includes("linkedin")) return Linkedin;
      if (normalized.includes("facebook")) return Facebook;
      if (normalized.includes("youtube")) return Youtube;
      if (normalized.includes("tiktok")) return Music2;
      if (normalized.includes("website") || normalized.includes("web")) {
        return Globe;
      }

      return Twitter;
    };

    const resolveFooterHref = (url: string) => {
      const trimmed = String(url || "").trim();

      if (!trimmed) return "#";

      if (
        trimmed.startsWith("#") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://") ||
        trimmed.startsWith("mailto:") ||
        trimmed.startsWith("tel:")
      ) {
        return trimmed;
      }

      if (!trimmed.startsWith("/")) {
        return trimmed;
      }

      if (typeof window === "undefined") {
        return trimmed;
      }

      const pathMatch = window.location.pathname.match(/^\/site\/([^/]+)/);

      if (!pathMatch) {
        return trimmed;
      }

      const siteBase = `/site/${pathMatch[1]}`;

      if (trimmed === siteBase || trimmed.startsWith(`${siteBase}/`)) {
        return trimmed;
      }

      return `${siteBase}${trimmed}`;
    };

    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2.4}
        alignItems="stretch"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,

          /**
           * Background/footer wrapper full page width rahe.
           * Lekin inner content default container mein rahega.
           */
          ...(footerOuterShouldStretch
            ? {
                width: "100%",
                maxWidth: "none",
                alignSelf: "stretch",
              }
            : {}),

          p: 0,
          backgroundColor: footerBackgroundColor,
          backgroundImage: footerBackgroundImage,
          borderColor: footerBorderColor,
          paddingTop: footerPaddingTop,
          paddingBottom: footerPaddingBottom,
          paddingLeft: footerPaddingLeft,
          paddingRight: footerPaddingRight,

          ...(rawCardStyle.minHeight === undefined &&
          rawCardStyle.height === undefined &&
          resolvedCardStyle.minHeight === undefined &&
          resolvedCardStyle.height === undefined
            ? {
                minHeight: "auto",
                height: "auto",
              }
            : {}),

          ...(rawCardStyle.layoutGap === undefined &&
          resolvedCardStyle.gap === undefined
            ? { gap: 0 }
            : {}),

          ...(rawCardStyle.borderRadius === undefined &&
          resolvedCardStyle.borderRadius === undefined
            ? { borderRadius: 0 }
            : {}),
        }}
      >
        <Box sx={footerInnerContainerSx}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "1.2fr 0.9fr 1fr 1.1fr",
              },
              gap: { xs: 2.4, md: 3 },
              alignItems: "start",
            }}
          >
            <Stack spacing={1.2}>
              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.logoText`,
                  "single",
                )}
                sx={{
                  color: footerTextColor,
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: { xs: "1.3rem", md: "1.55rem" },
                  letterSpacing: "-0.03em",
                  ...footerLogoStyle,
                }}
              >
                {footerContent.logoText || footerContent.heading}
              </Typography>

              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.description`,
                  "multi",
                )}
                sx={{
                  color: footerMutedColor,
                  maxWidth: 320,
                  lineHeight: 1.8,
                  fontSize: "0.96rem",
                  ...footerDescriptionStyle,
                }}
              >
                {footerContent.description}
              </Typography>

              {footerSocialLinks.length ? (
                <Stack direction="row" spacing={1}>
                  {footerSocialLinks.map(
                    (
                      item: { platform: string; url: string },
                      socialIndex: number,
                    ) => {
                      const Icon = resolveSocialIcon(item.platform);

                      return (
                        <Box
                          key={`${item.platform}-${socialIndex}`}
                          component="a"
                          href={resolveFooterHref(item.url)}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "999px",
                            display: "grid",
                            placeItems: "center",
                            color: footerTextColor,
                            border: "1px solid rgba(248,250,252,0.16)",
                            bgcolor: "rgba(255,255,255,0.04)",
                            transition:
                              "background-color 160ms ease, border-color 160ms ease",
                            "&:hover": {
                              bgcolor: "rgba(255,255,255,0.08)",
                              borderColor: "rgba(248,250,252,0.28)",
                            },
                          }}
                        >
                          <Icon size={18} />
                        </Box>
                      );
                    },
                  )}
                </Stack>
              ) : null}
            </Stack>

            <Stack spacing={1.1}>
              <Typography
                sx={{
                  color: footerTextColor,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                Navigation
              </Typography>

              <Stack spacing={0.9}>
                {footerLinks.map(
                  (link: { label: string; url: string }, linkIndex: number) => (
                    <Box
                      key={`${link.label}-${linkIndex}`}
                      component="a"
                      href={resolveFooterHref(link.url)}
                      {...getEditableTextProps(
                        section.blockId,
                        `${blockPath}.links.${linkIndex}.label`,
                        "single",
                      )}
                      sx={{
                        color: footerMutedColor,
                        fontWeight: 500,
                        fontSize: "0.95rem",
                        textDecoration: "none",
                        transition: "color 160ms ease",
                        ...footerLinkStyle,
                        "&:hover": {
                          color: footerTextColor,
                        },
                      }}
                    >
                      {link.label}
                    </Box>
                  ),
                )}
              </Stack>
            </Stack>

            <Stack spacing={1.1}>
              <Typography
                sx={{
                  color: footerTextColor,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                Contact
              </Typography>

              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.contactEmail`,
                  "single",
                )}
                sx={{
                  color: footerMutedColor,
                  lineHeight: 1.8,
                  ...footerContactStyle,
                }}
              >
                {footerContent.contactEmail}
              </Typography>

              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.contactPhone`,
                  "single",
                )}
                sx={{
                  color: footerMutedColor,
                  lineHeight: 1.8,
                  ...footerContactStyle,
                }}
              >
                {footerContent.contactPhone}
              </Typography>

              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.contactAddress`,
                  "multi",
                )}
                sx={{
                  color: footerMutedColor,
                  lineHeight: 1.8,
                  ...footerContactStyle,
                }}
              >
                {footerContent.contactAddress}
              </Typography>
            </Stack>

            <Stack spacing={1.2}>
              <Typography
                sx={{
                  color: footerTextColor,
                  fontWeight: 700,
                  letterSpacing: "0.01em",
                }}
              >
                Stay updated
              </Typography>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.05}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder={footerContent.placeholder}
                  sx={{
                    "& .MuiInputBase-root": {
                      color: footerTextColor,
                      bgcolor: "rgba(255,255,255,0.04)",
                      borderRadius: "999px",
                      pr: 0.5,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(248,250,252,0.14)",
                    },
                    "& .MuiInputBase-input::placeholder": {
                      color: "rgba(248,250,252,0.48)",
                      opacity: 1,
                    },
                  }}
                />

                <Button
                  variant="contained"
                  {...getEditableTextProps(
                    section.blockId,
                    `${blockPath}.buttonText`,
                    "single",
                  )}
                  sx={{
                    bgcolor: "#ffffff",
                    color: "#0f1115",
                    borderRadius: "999px",
                    textTransform: "none",
                    px: 2.8,
                    py: 1.05,
                    whiteSpace: "nowrap",
                    boxShadow: "none",
                    minWidth: "fit-content",
                    fontWeight: 700,
                    ...footerButtonTextStyle,
                  }}
                >
                  {footerContent.buttonText}
                </Button>
              </Stack>
            </Stack>
          </Box>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={{ xs: 1.2, md: 2 }}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
            sx={{
              width: "100%",
              mt: { xs: 2.5, md: 3 },
              pt: 1.8,
              borderTop: `1px solid ${footerLineColor}`,
            }}
          >
            <Typography sx={{ color: footerMutedColor, fontSize: "0.92rem" }}>
              Built for modern company websites.
            </Typography>

            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.copyright`,
                "single",
              )}
              sx={{
                color: footerMutedColor,
                fontSize: "0.92rem",
                lineHeight: 1.6,
                textAlign: { xs: "left", md: "right" },
                whiteSpace: "normal",
                ...footerCopyrightStyle,
              }}
            >
              {footerContent.copyright}
            </Typography>
          </Stack>
        </Box>
      </Stack>
    );
  }

  if (blockType === "pricing") {
    const plans = Array.isArray(block.content?.plans)
      ? block.content.plans
      : [];
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={compoundCardSx}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.heading`,
            "multi",
          )}
          sx={{
            color: textColor,
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: { xs: "1.4rem", md: "2rem" },
            ...headingStyle,
          }}
        >
          {block.content?.heading || "Simple pricing"}
        </Typography>
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.body`,
            "multi",
          )}
          sx={{ color: mutedTextColor, lineHeight: 1.75, ...bodyStyle }}
        >
          {block.content?.body ||
            "Choose a plan that fits your business stage."}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
            },
            gap: 1.5,
          }}
        >
          {plans.map((plan: Record<string, any>, planIndex: number) => (
            <Box
              key={`plan-${planIndex}`}
              sx={{
                p: 2.2,
                borderRadius: "20px",
                bgcolor:
                  tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                border: `1px solid ${rgba(themeColor, 0.12)}`,
              }}
            >
              <Typography sx={{ color: textColor, fontWeight: 700 }}>
                {plan?.name || `Plan ${planIndex + 1}`}
              </Typography>
              <Typography
                sx={{
                  mt: 0.4,
                  color: themeColor,
                  fontFamily: headingFont,
                  fontSize: "1.6rem",
                  fontWeight: 800,
                }}
              >
                {plan?.price || "$49"}
              </Typography>
              <Stack spacing={0.5} sx={{ mt: 1.1 }}>
                {(Array.isArray(plan?.features) ? plan.features : []).map(
                  (feature: string, featureIndex: number) => (
                    <Typography
                      key={`${feature}-${featureIndex}`}
                      sx={{ color: mutedTextColor, fontSize: "0.94rem" }}
                    >
                      • {feature}
                    </Typography>
                  ),
                )}
              </Stack>
            </Box>
          ))}
        </Box>
      </Stack>
    );
  }

  if (blockType === "countdown") {
    const countdownParts = [
      {
        label: "Days",
        value: String(block.content?.days ?? "12").padStart(2, "0"),
      },
      {
        label: "Hours",
        value: String(block.content?.hours ?? "08").padStart(2, "0"),
      },
      {
        label: "Minutes",
        value: String(block.content?.minutes ?? "44").padStart(2, "0"),
      },
    ];

    return (
      <Box
        key={String(block.id || `${blockType}-${index}`)}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          minHeight: { xs: 520, md: 700 },
          width: "100%",
          borderRadius: "32px",
          position: "relative",
          overflow: "hidden",
          px: { xs: 3, md: 8 },
          py: { xs: 6, md: 10 },

          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top, rgba(255,255,255,0.08), transparent 40%)",
            pointerEvents: "none",
          },
        }}
      >
        <Stack
          spacing={{ xs: 4, md: 6 }}
          alignItems="center"
          justifyContent="center"
          sx={{
            width: "100%",
            height: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 900,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontSize: {
                xs: "2rem",
                sm: "3rem",
                md: "4.8rem",
              },
              lineHeight: 1,
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Launch Countdown"}
          </Typography>

          <Stack
            direction="row"
            spacing={{ xs: 1.5, md: 3 }}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            {countdownParts.map((part) => (
              <Box
                key={part.label}
                sx={{
                  textAlign: "center",
                }}
              >
                <Box
                  sx={{
                    width: {
                      xs: 110,
                      sm: 140,
                      md: 180,
                    },
                    height: {
                      xs: 120,
                      sm: 150,
                      md: 190,
                    },
                    borderRadius: "24px",
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    bgcolor:
                      tone === "light"
                        ? "rgba(255,255,255,0.08)"
                        : "rgba(255,255,255,0.96)",

                    border: `1px solid ${rgba(themeColor, 0.15)}`,

                    boxShadow:
                      tone === "light"
                        ? "0 20px 50px rgba(0,0,0,0.25)"
                        : "0 20px 50px rgba(15,23,42,0.08)",

                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      right: 0,
                      top: "50%",
                      height: "1px",
                      background: rgba(themeColor, 0.18),
                      zIndex: 2,
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: textColor,
                      fontFamily: headingFont,
                      fontWeight: 900,
                      fontSize: {
                        xs: "3rem",
                        sm: "4rem",
                        md: "5.5rem",
                      },
                      lineHeight: 1,
                      letterSpacing: "-0.04em",
                      zIndex: 3,
                    }}
                  >
                    {part.value}
                  </Typography>
                </Box>

                <Typography
                  sx={{
                    color: mutedTextColor,
                    mt: 2,
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontSize: {
                      xs: "0.8rem",
                      md: "1rem",
                    },
                  }}
                >
                  {part.label}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.body`,
              "multi",
            )}
            sx={{
              color: mutedTextColor,
              textAlign: "center",
              maxWidth: 760,
              lineHeight: 1.8,
              fontSize: {
                xs: "0.95rem",
                md: "1.1rem",
              },
              ...bodyStyle,
            }}
          >
            {block.content?.body ||
              "Build urgency for your upcoming launch or event."}
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (blockType === "testimonials" || blockType === "reviews") {
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={1.35}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={compoundCardSx}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.heading`,
            "single",
          )}
          sx={{ color: textColor, fontWeight: 700, ...headingStyle }}
        >
          {block.content?.heading || "What clients say"}
        </Typography>
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.quote`,
            "multi",
          )}
          sx={{
            color: textColor,
            fontFamily: headingFont,
            fontSize: { xs: "1.3rem", md: "1.8rem" },
            lineHeight: 1.25,
            fontWeight: 700,
            ...bodyStyle,
          }}
        >
          {block.content?.quote || "Share a strong testimonial or review here."}
        </Typography>
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.author`,
            "single",
          )}
          sx={{ color: mutedTextColor, fontWeight: 600, ...textStyle }}
        >
          {block.content?.author || "A satisfied client"}
          {block.content?.role ? `, ${block.content.role}` : ""}
        </Typography>
      </Stack>
    );
  }

  if (blockType === "stats") {
    const defaultStats = [
      { label: "PROJECTS DELIVERED", value: "200+" },
      { label: "HAPPY CLIENTS", value: "100+" },
      { label: "YEARS OF EXPERIENCE", value: "15" },
      { label: "CLIENTS SATISFACTION", value: "95%" },
    ];

    const items =
      Array.isArray(block.content?.items) && block.content.items.length > 0
        ? block.content.items
        : defaultStats;

    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={{ xs: 5, md: 6 }}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          borderRadius:
            rawCardStyle.borderRadius ?? resolvedCardStyle.borderRadius ?? 0,
          boxShadow: "none",
          border: "none",
          px: rawCardStyle.paddingLeft ??
            resolvedCardStyle.paddingLeft ?? { xs: 3, md: 7 },
          py: rawCardStyle.paddingTop ??
            resolvedCardStyle.paddingTop ?? { xs: 6, md: 8 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
            gap: { xs: 3, md: 8 },
            alignItems: "start",
          }}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "multi",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontSize: { xs: "2.2rem", md: "4rem" },
              lineHeight: 1.08,
              fontWeight: 500,
              letterSpacing: "-0.055em",
              textTransform: "uppercase",
              maxWidth: 560,
              ...headingStyle,
            }}
          >
            {block.content?.heading || "WE TURN IDEAS INTO VISUAL MASTERPIECES"}
          </Typography>

          <Stack
            spacing={2.4}
            alignItems="flex-start"
            sx={{
              maxWidth: 520,
              justifySelf: { xs: "start", md: "end" },
              pt: { xs: 0, md: 0.5 },
            }}
          >
            <Typography
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.body`,
                "multi",
              )}
              sx={{
                color: mutedTextColor,
                fontSize: { xs: "0.98rem", md: "1.05rem" },
                lineHeight: 1.65,
                ...bodyStyle,
              }}
            >
              {block.content?.body ||
                "Whether it's an engaging explainer video, a vibrant social media campaign, or captivating motion graphics, we bring creativity and expertise to every project."}
            </Typography>

            <Button
              variant="contained"
              {...getEditableTextProps(
                section.blockId,
                `${blockPath}.buttonText`,
                "single",
              )}
              sx={{
                bgcolor: "#050505",
                color: "#ffffff",
                borderRadius: 0,
                textTransform: "none",
                px: 2.6,
                py: 1.15,
                boxShadow: "none",
                fontWeight: 600,
                "&:hover": {
                  bgcolor: "#050505",
                  boxShadow: "none",
                },
                ...buttonStyle,
              }}
            >
              {block.content?.buttonText || "Know More About us"}
            </Button>
          </Stack>
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, minmax(0, 1fr))",
              md: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
            },
            columnGap: { xs: 3, md: 8 },
            rowGap: { xs: 3.5, md: 4 },
            alignItems: "start",
          }}
        >
          {items.map((item: Record<string, any>, itemIndex: number) => (
            <Box key={`stat-${itemIndex}`}>
              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.items.${itemIndex}.label`,
                  "single",
                )}
                sx={{
                  color: mutedTextColor,
                  fontSize: { xs: "0.76rem", md: "0.82rem" },
                  lineHeight: 1.3,
                  fontWeight: 500,
                  letterSpacing: "-0.015em",
                  textTransform: "uppercase",
                  mb: 0.8,
                }}
              >
                {item?.label || "METRIC"}
              </Typography>

              <Typography
                {...getEditableTextProps(
                  section.blockId,
                  `${blockPath}.items.${itemIndex}.value`,
                  "single",
                )}
                sx={{
                  color: textColor,
                  fontFamily: headingFont,
                  fontSize: { xs: "2.4rem", md: "3.45rem" },
                  lineHeight: 0.95,
                  fontWeight: 400,
                  letterSpacing: "-0.06em",
                }}
              >
                {item?.value || "100+"}
              </Typography>
            </Box>
          ))}
        </Box>
      </Stack>
    );
  }
  if (blockType === "logo_carousel") {
    const defaultItems = [
      {
        name: "Ebay",
        image:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='48' viewBox='0 0 150 48'%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='white' font-size='28' font-family='Arial' font-weight='800'%3Eebay%3C/text%3E%3C/svg%3E",
      },
      {
        name: "OpenAI",
        image:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/3840px-OpenAI_Logo.svg.png",
      },
      {
        name: "Shopify",
        image:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='48' viewBox='0 0 180 48'%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='white' font-size='27' font-family='Arial' font-weight='800'%3EShopify%3C/text%3E%3C/svg%3E",
      },
      {
        name: "Meta",
        image:
          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='48' viewBox='0 0 150 48'%3E%3Ctext x='50%25' y='58%25' text-anchor='middle' fill='white' font-size='28' font-family='Arial' font-weight='800'%3EMeta%3C/text%3E%3C/svg%3E",
      },
    ];

    const rawItems =
      Array.isArray(block.content?.items) && block.content.items.length > 0
        ? block.content.items
        : defaultItems;

    const items = rawItems
      .map((logo: any, logoIndex: number) => {
        if (typeof logo === "string") {
          return defaultItems[logoIndex % defaultItems.length];
        }

        return {
          name: logo?.name || `Logo ${logoIndex + 1}`,
          image:
            logo?.image ||
            logo?.src ||
            defaultItems[logoIndex % defaultItems.length].image,
          useOriginalColors:
            typeof logo?.useOriginalColors === "boolean"
              ? logo.useOriginalColors
              : false,
        };
      })
      .filter((logo: any) => logo.image);

    const logoBackgroundColor =
      rawCardStyle.backgroundColor ??
      resolvedCardStyle.backgroundColor ??
      rawSectionStyle.backgroundColor ??
      resolvedSectionStyle?.backgroundColor ??
      "#03040d";

    const logoPaddingTop = rawCardStyle.paddingTop ??
      resolvedCardStyle.paddingTop ?? { xs: 5, md: 6 };

    const logoPaddingBottom = rawCardStyle.paddingBottom ??
      resolvedCardStyle.paddingBottom ?? { xs: 5, md: 6 };

    const logoPaddingLeft = rawCardStyle.paddingLeft ??
      resolvedCardStyle.paddingLeft ?? { xs: 2.4, md: 6 };

    const logoPaddingRight = rawCardStyle.paddingRight ??
      resolvedCardStyle.paddingRight ?? { xs: 2.4, md: 6 };

    return (
      <Box
        key={String(block.id || `${blockType}-${index}`)}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,

          width: "100%",
          maxWidth: "none",
          alignSelf: "stretch",
          overflow: "hidden",

          backgroundColor: logoBackgroundColor,
          background: logoBackgroundColor,

          borderRadius:
            rawCardStyle.borderRadius ?? resolvedCardStyle.borderRadius ?? 0,

          paddingTop: logoPaddingTop,
          paddingBottom: logoPaddingBottom,
          paddingLeft: logoPaddingLeft,
          paddingRight: logoPaddingRight,

          borderTop:
            rawCardStyle.borderTop ??
            resolvedCardStyle.borderTop ??
            "1px solid rgba(255,255,255,0.10)",
          borderBottom:
            rawCardStyle.borderBottom ??
            resolvedCardStyle.borderBottom ??
            "1px solid rgba(255,255,255,0.10)",
        }}
      >
        <Stack
          spacing={{ xs: 3, md: 4 }}
          alignItems="center"
          sx={{
            width: "100%",
            maxWidth: "1180px",
            mx: "auto",
          }}
        >
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{
              color: "rgba(255,255,255,0.72)",
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.15rem", md: "1.45rem" },
              textAlign: "center",
              letterSpacing: "0.02em",
              ...headingStyle,
            }}
          >
            {block.content?.heading || "Trusted by modern teams"}
          </Typography>

          <Box
            sx={{
              width: "100%",
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                md: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))`,
              },
              gap: { xs: 3, md: 5 },
              alignItems: "center",
            }}
          >
            {items.map((logo: any, logoIndex: number) => {
              const logoSrc = String(logo?.image || "");
              const shouldInvertLogo =
                logo?.useOriginalColors !== true &&
                (logoSrc.startsWith("data:image/svg+xml") ||
                  /\.svg(?:\?|$)/i.test(logoSrc));

              return (
                <Box
                  key={`${logo.name}-${logoIndex}`}
                  sx={{
                    height: { xs: 42, md: 56 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0.9,
                  }}
                >
                  <Box
                    component="img"
                    src={logo.image}
                    alt={logo.name}
                    sx={{
                      maxWidth: { xs: 120, md: 170 },
                      width: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                      filter: shouldInvertLogo
                        ? "brightness(0) invert(1)"
                        : "none",
                    }}
                  />
                </Box>
              );
            })}
          </Box>
        </Stack>
      </Box>
    );
  }

  if (blockType === "map_location") {
    const defaultIframe = `<iframe src="https://www.google.com/maps?q=Lahore%2C%20Pakistan&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;

    const iframeHtml = block.content?.iframe || defaultIframe;

    return (
      <Box
        key={String(block.id || `${blockType}-${index}`)}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          pt: rawCardStyle.paddingTop ?? resolvedCardStyle.paddingTop ?? "40px",
          pb:
            rawCardStyle.paddingBottom ??
            resolvedCardStyle.paddingBottom ??
            "60px",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: 1100,
            mx: "auto",
            overflow: "hidden",
            borderRadius: { xs: "18px", md: "28px" },
            border: `1px solid ${rgba(themeColor, 0.14)}`,
            boxShadow:
              tone === "light"
                ? "0 24px 70px rgba(0,0,0,0.22)"
                : "0 24px 70px rgba(15,23,42,0.14)",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: { xs: "420px", sm: "520px", md: "620px" },
              overflow: "hidden",
              "& iframe": {
                display: "block",
                width: "100% !important",
                height: "100% !important",
                border: "0 !important",
              },
            }}
            dangerouslySetInnerHTML={{ __html: iframeHtml }}
          />
        </Box>
      </Box>
    );
  }

  if (blockType === "social_embed") {
    const embeds =
      blockType === "social_embed" && Array.isArray(block.content?.embeds)
        ? block.content.embeds
        : [
            {
              platform: "embed",
              url: block.content?.url,
              caption: block.content?.heading,
            },
          ];
    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={compoundCardSx}
      >
        <Typography
          {...getEditableTextProps(
            section.blockId,
            `${blockPath}.heading`,
            "single",
          )}
          sx={{
            color: textColor,
            fontFamily: headingFont,
            fontWeight: 800,
            fontSize: { xs: "1.35rem", md: "1.9rem" },
            ...headingStyle,
          }}
        >
          {block.content?.heading || "Embedded content"}
        </Typography>
        <Stack spacing={1}>
          {embeds.map((embed: Record<string, any>, embedIndex: number) => (
            <Box
              key={`embed-${embedIndex}`}
              sx={{
                p: 2,
                borderRadius: "18px",
                bgcolor:
                  tone === "light" ? "rgba(255,255,255,0.08)" : "#ffffff",
                border: `1px solid ${rgba(themeColor, 0.12)}`,
              }}
            >
              <Typography
                sx={{
                  color: textColor,
                  fontWeight: 700,
                  textTransform: "capitalize",
                }}
              >
                {embed?.platform || "Embed"}
              </Typography>
              <Typography
                sx={{
                  mt: 0.5,
                  color: mutedTextColor,
                  wordBreak: "break-all",
                }}
              >
                {embed?.url || "Add a valid URL from the editor."}
              </Typography>
              {embed?.caption ? (
                <Typography
                  sx={{ mt: 0.8, color: mutedTextColor, fontSize: "0.92rem" }}
                >
                  {embed.caption}
                </Typography>
              ) : null}
            </Box>
          ))}
        </Stack>
      </Stack>
    );
  }

  if (blockType === "embed") {
    const rawEmbedUrl = String(block.content?.url || "").trim();
    const embedTitle = block.content?.heading || "";

    const allowlistedDomains = [
      "calendly.com",
      "docs.google.com",
      "drive.google.com",
      "figma.com",
      "airtable.com",
      "youtube.com",
      "youtu.be",
      "vimeo.com",
    ];

    const getEmbedHost = (url: string) => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch {
        return "";
      }
    };

    // Convert watch/share URLs to embeddable iframe URLs
    const toEmbedUrl = (url: string): string => {
      if (!url) return url;
      try {
        const parsed = new URL(url);
        const host = parsed.hostname.replace(/^www\./, "");

        // YouTube: watch?v=ID or youtu.be/ID → youtube.com/embed/ID
        if (host === "youtube.com" || host === "youtu.be") {
          const videoId =
            host === "youtu.be"
              ? parsed.pathname.slice(1)
              : parsed.searchParams.get("v") ||
                parsed.pathname.replace("/shorts/", "").slice(1);
          if (videoId) return `https://www.youtube.com/embed/${videoId}`;
        }

        // Vimeo: vimeo.com/ID → player.vimeo.com/video/ID
        if (host === "vimeo.com") {
          const id = parsed.pathname.replace(/^\//, "").split("/")[0];
          if (id && /^\d+$/.test(id))
            return `https://player.vimeo.com/video/${id}`;
        }
      } catch {
        // not a valid URL
      }
      return url;
    };

    const embedUrl = toEmbedUrl(rawEmbedUrl);
    const embedHost = getEmbedHost(rawEmbedUrl);
    const isAllowedEmbed =
      Boolean(rawEmbedUrl) &&
      allowlistedDomains.some(
        (domain) => embedHost === domain || embedHost.endsWith(`.${domain}`),
      );

    const embedHeight = rawCardStyle.mediaHeight ||
      resolvedCardStyle.mediaHeight || { xs: 320, md: 480 };

    return (
      <Stack
        key={String(block.id || `${blockType}-${index}`)}
        spacing={2}
        alignItems="stretch"
        {...compoundBlockSelectionProps}
        data-preview-label={compoundBlockLabel}
        sx={{
          ...compoundCardSx,
          overflow: "hidden",
          boxShadow: "none",
          pt: rawCardStyle.paddingTop ?? resolvedCardStyle.paddingTop ?? "40px",
          pb:
            rawCardStyle.paddingBottom ??
            resolvedCardStyle.paddingBottom ??
            "60px",
        }}
      >
        {/* Optional heading */}
        {embedTitle ? (
          <Typography
            {...getEditableTextProps(
              section.blockId,
              `${blockPath}.heading`,
              "single",
            )}
            sx={{
              color: textColor,
              fontFamily: headingFont,
              fontWeight: 800,
              fontSize: { xs: "1.45rem", md: "2rem" },
              lineHeight: 1.15,
              ...headingStyle,
            }}
          >
            {embedTitle}
          </Typography>
        ) : null}

        {/* Embed area — full width */}
        <Box
          sx={{
            width: "100%",
            borderRadius:
              rawCardStyle.mediaBorderRadius ||
              resolvedCardStyle.mediaBorderRadius ||
              3,
            border: `1px solid ${lineColor}`,
            overflow: "hidden",
            bgcolor:
              rawCardStyle.mediaBackgroundColor ||
              resolvedCardStyle.mediaBackgroundColor ||
              (tone === "light"
                ? "rgba(0,0,0,0.04)"
                : "rgba(255,255,255,0.06)"),
          }}
        >
          {isAllowedEmbed ? (
            <Box
              component="iframe"
              src={embedUrl}
              title={String(embedTitle || embedHost)}
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              referrerPolicy="no-referrer-when-downgrade"
              sx={{
                width: "100%",
                height: embedHeight,
                display: "block",
                border: 0,
              }}
            />
          ) : (
            <Stack
              spacing={1.5}
              alignItems="center"
              justifyContent="center"
              sx={{
                minHeight: embedHeight,
                px: 3,
                py: 4,
                textAlign: "center",
              }}
            >
              {/* Embed icon */}
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  border: `1.5px dashed ${lineColor}`,
                  display: "grid",
                  placeItems: "center",
                  color: mutedTextColor,
                }}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 9l6 6M15 9l-6 6" />
                </svg>
              </Box>

              <Typography
                sx={{ color: textColor, fontWeight: 700, fontSize: "1rem" }}
              >
                {embedUrl ? "Domain not supported" : "No URL added yet"}
              </Typography>

              <Typography
                sx={{
                  color: mutedTextColor,
                  fontSize: "0.88rem",
                  lineHeight: 1.6,
                  maxWidth: 380,
                }}
              >
                {embedUrl
                  ? `"${embedHost}" is not on the allowlist. Use YouTube, Vimeo, Calendly, Google Docs, Figma, or Airtable.`
                  : "Paste a URL in the Embed URL field on the left to display content here."}
              </Typography>
            </Stack>
          )}
        </Box>
      </Stack>
    );
  }

  if (blockType === "before_after") {
    return (
      <BeforeAfterEditorPreview
        key={String(block.id || `${blockType}-${index}`)}
        block={block}
        section={section}
        compoundBlockSelectionProps={compoundBlockSelectionProps}
        compoundBlockLabel={compoundBlockLabel}
        compoundCardSx={compoundCardSx}
        rawCardStyle={rawCardStyle}
        resolvedCardStyle={resolvedCardStyle}
      />
    );
  }

  if (blockType === "website_header") {
    return (
      <HeaderEditorPreview
        key={String(block.id || `${blockType}-${index}`)}
        block={block}
        section={section}
        compoundBlockSelectionProps={compoundBlockSelectionProps}
        compoundBlockLabel={compoundBlockLabel}
        compoundCardSx={compoundCardSx}
        themeColor={themeColor}
        textColor={textColor}
        mutedTextColor={mutedTextColor}
        tone={tone}
        websiteId={websiteId}
      />
    );
  }

  return null;
};
