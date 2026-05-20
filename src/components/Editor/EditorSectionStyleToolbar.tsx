import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  ButtonBase,
  Divider,
  IconButton,
  MenuItem,
  Popover,
  Slider,
  Switch,
  Tab,
  Tabs,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  ArrowDown,
  Code2,
  Copy,
  Eye,
  Image as ImageIcon,
  LayoutPanelTop,
  Palette,
  PaintBucket,
  Plus,
  Settings2,
  Sparkles,
  Square,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { apiClient } from "../../api/client";
import {
  normalizeSpacingValue,
  rawSpacingNumberValue,
  SPACING_OPTIONS,
  SharedSpacingControls,
} from "./sharedSpacingControls";

export type EditorSectionStyle = {
  backgroundType?: "none" | "solid" | "gradient" | "image";
  backgroundColor?: string;
  backgroundImageUrl?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  layoutWidth?: "page" | "full";
  contentAlign?: "left" | "center" | "right";
  heightPreset?:
    | "auto"
    | "small"
    | "medium"
    | "large"
    | "fullscreen"
    | "custom";
  customHeight?: string;
  borderStyle?: "none" | "solid" | "dashed" | "dotted";
  borderWidth?: string;
  borderRadius?: string;
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
  layoutGap?: string;
  overflowMode?: "visible" | "hidden" | "auto" | "scroll" | "";
  positionMode?: "static" | "relative" | "sticky" | "absolute" | "";
  minHeightValue?: string;
  maxWidthValue?: string;
  parallaxEnabled?: boolean;
  parallaxSpeed?: number;
  stickySection?: boolean;
  stickyOffset?: string;
  cssClass?: string;
  anchorId?: string;
  zIndex?: string;
  semanticTag?: "div" | "section" | "article" | "main" | "aside" | "header" | "footer" | "nav" | "span";
  customCss?: string;
  dataAttributes?: Array<{ key: string; value: string }>;
  paddingTop?: string;
  paddingBottom?: string;
  paddingLeft?: string;
  paddingRight?: string;
  marginTop?: string;
  marginBottom?: string;
  marginLeft?: string;
  marginRight?: string;
};

export type SectionSelection = {
  blockId: string;
  label: string;
};

type Props = {
  selection: SectionSelection | null;
  value: EditorSectionStyle;
  disabled?: boolean;
  onStyleChange: (patch: Partial<EditorSectionStyle>) => void;
  containerSx?: SxProps<Theme>;
  layout?: "inline" | "panel";
};

const BRAND_COLOR_SWATCHES = [
  "#ffffff",
  "#f8fafc",
  "#e5e7eb",
  "#dbeafe",
  "#111827",
  "#5b7cfa",
  "#ff6b1a",
  "#0f766e",
  "#f8d95b",
  "transparent",
];

const getSwatchBackground = (swatch: string) =>
  swatch === "transparent"
    ? "linear-gradient(135deg, transparent 46%, #ef4444 47%, #ef4444 53%, transparent 54%), #ffffff"
    : swatch;

const LAYOUT_WIDTH_OPTIONS = [
  { value: "page", label: "Page" },
  { value: "full", label: "Full" },
] as const;
const CONTENT_ALIGN_OPTIONS = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
] as const;
const HEIGHT_PRESET_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "fullscreen", label: "Full screen" },
  { value: "custom", label: "Custom" },
] as const;
const BORDER_STYLE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "solid", label: "Solid" },
  { value: "dashed", label: "Dashed" },
  { value: "dotted", label: "Dotted" },
] as const;
const BOX_SHADOW_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sm", label: "SM" },
  { value: "md", label: "MD" },
  { value: "lg", label: "LG" },
  { value: "xl", label: "XL" },
] as const;
const RADIUS_OPTIONS = ["0px", "4px", "8px", "16px"] as const;
const ENTRANCE_ANIMATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "fadeUp", label: "Fade Up" },
  { value: "fadeDown", label: "Fade Down" },
  { value: "fadeLeft", label: "Fade Left" },
  { value: "fadeRight", label: "Fade Right" },
  { value: "fadeIn", label: "Fade In" },
  { value: "zoomIn", label: "Zoom In" },
  { value: "zoomOut", label: "Zoom Out" },
  { value: "blurIn", label: "Blur In" },
] as const;
const LAYOUT_DIRECTION_OPTIONS = [
  { value: "row", label: "Row" },
  { value: "column", label: "Column" },
] as const;
const OVERFLOW_OPTIONS = [
  { value: "visible", label: "Visible" },
  { value: "hidden", label: "Hidden" },
  { value: "auto", label: "Auto" },
  { value: "scroll", label: "Scroll" },
] as const;
const POSITION_OPTIONS = [
  { value: "static", label: "Static" },
  { value: "relative", label: "Relative" },
  { value: "sticky", label: "Sticky" },
  { value: "absolute", label: "Absolute" },
] as const;
const SEMANTIC_TAG_OPTIONS = [
  "div",
  "section",
  "article",
  "main",
  "aside",
  "header",
  "footer",
  "nav",
  "span",
] as const;

const EditorSectionStyleToolbar: React.FC<Props> = ({
  selection,
  value,
  disabled = false,
  onStyleChange,
  containerSx,
  layout = "inline",
}) => {
  const effectiveDisabled = disabled || !selection;
  const resolvedValue = value || {};
  const isPanel = layout === "panel";
  const [backgroundAnchorEl, setBackgroundAnchorEl] =
    React.useState<HTMLElement | null>(null);
  const [backgroundTab, setBackgroundTab] = React.useState<"color" | "image">(
    "color",
  );
  const [isUploading, setIsUploading] = React.useState(false);
  const [expandedPanel, setExpandedPanel] = React.useState<string | false>(
    "border",
  );
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const isBackgroundPopoverOpen = Boolean(backgroundAnchorEl);

  const handleOpenBackgroundPopover = (
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (effectiveDisabled) return;
    setBackgroundAnchorEl(event.currentTarget);
  };

  const handleCloseBackgroundPopover = () => {
    setBackgroundAnchorEl(null);
  };

  const handleImageUpload = async (file: File | null) => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await apiClient.post("/upload/image", formData);
      onStyleChange({
        backgroundType: "image",
        backgroundImageUrl: response.data.url,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      });
      setBackgroundTab("image");
    } catch {
      // Keep the current style unchanged on upload failure.
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const dataAttributes = Array.isArray(resolvedValue.dataAttributes)
    ? resolvedValue.dataAttributes
    : [];

  const handleDataAttributeChange = (
    index: number,
    field: "key" | "value",
    nextValue: string,
  ) => {
    const nextAttributes = dataAttributes.map((attribute, currentIndex) =>
      currentIndex === index
        ? { ...attribute, [field]: nextValue }
        : attribute,
    );
    onStyleChange({ dataAttributes: nextAttributes });
  };

  const renderHeightControl = () => {
    const heightPreset = resolvedValue.heightPreset || "auto";
    const customHeight = normalizeSpacingValue(resolvedValue.customHeight);

    return (
      <Box
        sx={{
          p: 1.1,
          borderRadius: 3,
          border: "1px solid rgba(148,163,184,0.16)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.88)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: isPanel
              ? "minmax(0, 1fr)"
              : "96px minmax(0, 1fr)",
            gap: 1.1,
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#475569",
            }}
          >
            Height
          </Typography>

          <Box sx={{ display: "grid", gap: 0.85 }}>
            <TextField
              select
              size="small"
              disabled={effectiveDisabled}
              value={heightPreset}
              onChange={(event) =>
                onStyleChange({
                  heightPreset: event.target
                    .value as EditorSectionStyle["heightPreset"],
                })
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 40,
                  borderRadius: 2.5,
                  backgroundColor: "#ffffff",
                },
              }}
            >
              {HEIGHT_PRESET_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>

            {heightPreset === "custom" && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.55 }}>
                <TextField
                  size="small"
                  disabled={effectiveDisabled}
                  value={rawSpacingNumberValue(resolvedValue.customHeight)}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/[^\d]/g, "");
                    onStyleChange({
                      customHeight: nextValue ? `${nextValue}px` : "",
                    });
                  }}
                  placeholder="0"
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                  }}
                  sx={{
                    width: 96,
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: "#ffffff",
                    },
                  }}
                />
                <Box
                  sx={{
                    minWidth: 34,
                    height: 36,
                    px: 0.8,
                    borderRadius: 2,
                    border: "1px solid rgba(226,232,240,0.95)",
                    backgroundColor: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  >
                    px
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    );
  };

  const renderSegmentedControl = (
    label: string,
    value: string,
    options: readonly { value: string; label: string }[],
    onChange: (nextValue: string) => void,
  ) => (
    <Box
      sx={{
        p: 1.1,
        borderRadius: 3,
        border: "1px solid rgba(148,163,184,0.16)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.88)",
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: isPanel
            ? "minmax(0, 1fr)"
            : "96px minmax(0, 1fr)",
          gap: 1.1,
          alignItems: "center",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))`,
            p: 0.4,
            borderRadius: 2.5,
            border: "1px solid rgba(203,213,225,0.95)",
            backgroundColor: "#ffffff",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
          }}
        >
          {options.map((option) => {
            const active = value === option.value;
            return (
              <ButtonBase
                key={`${label}-${option.value}`}
                disabled={effectiveDisabled}
                onClick={() => onChange(option.value)}
                sx={{
                  minHeight: " 34px !important",
                  borderRadius: 1.8,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: active ? "#ffffff" : "#475569",
                  background: active ? "#000000" : "transparent",
                  transition: "background-color 160ms ease, color 160ms ease",
                }}
              >
                {option.label}
              </ButtonBase>
            );
          })}
        </Box>
      </Box>
    </Box>
  );

  const renderPanelRow = (label: string, content: React.ReactNode) => (
    <Box
      sx={{
        display: "grid",
        gap: 0.55,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.73rem",
          fontWeight: 800,
          color: "#64748b",
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </Typography>
      {content}
    </Box>
  );

  const renderAccordionPanel = (
    key: string,
    title: string,
    icon: React.ReactNode,
    body: React.ReactNode,
  ) => (
    <Accordion
      key={key}
      expanded={expandedPanel === key}
      onChange={(_, next) => setExpandedPanel(next ? key : false)}
      disableGutters
      elevation={0}
      sx={{
        borderBottom: "1px solid rgba(226,232,240,0.92)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.92)",
        overflow: "hidden",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ArrowDown size={16} />}
        sx={{
          minHeight: "52px !important",
          px: 1.5,
          "& .MuiAccordionSummary-content": {
            my: 0,
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            color: "#64748b",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
          <Box sx={{ display: "inline-flex", color: "#64748b" }}>{icon}</Box>
          <Typography
            sx={{ fontSize: "0.96rem", fontWeight: 700, color: "#111827" }}
          >
            {title}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails
        sx={{ px: 1.5, pb: 1.5, pt: 0.2, display: "grid", gap: 1.2 }}
      >
        {body}
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: isPanel ? "stretch" : "center",
        flexWrap: isPanel ? "wrap" : "nowrap",
        gap: 1.1,
        px: { xs: 1.15, sm: 1.6 },
        py: 1.1,
        borderRadius: 4,
        border: "1px solid rgba(148,163,184,0.16)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
        boxShadow:
          "0 14px 28px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.92)",
        overflowX: isPanel ? "visible" : "auto",
        overflowY: "hidden",
        "&::-webkit-scrollbar": { height: 6 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(148,163,184,0.4)",
          borderRadius: 999,
        },
        ...containerSx,
      }}
    >
      <Box
        className="editor-toolbar-selection-label"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          width: isPanel ? "100%" : "auto",
        }}
      >
        <Typography
          sx={{
            fontSize: "0.8rem",
            fontWeight: 700,
            color: effectiveDisabled ? "#94a3b8" : "#334155",
            whiteSpace: "nowrap",
            letterSpacing: "-0.01em",
          }}
        >
          {selection
            ? `Editing Section: ${selection.label}`
            : "Select a section on canvas"}
        </Typography>
      </Box>

      <Divider flexItem orientation="vertical" />

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexShrink: 0,
          width: isPanel ? "100%" : "auto",
        }}
      >
        <ButtonBase
          disabled={effectiveDisabled}
          onClick={handleOpenBackgroundPopover}
          sx={{
            height: 38,
            px: 1.45,
            gap: 0.8,
            borderRadius: 2.5,
            border: "1px solid rgba(148,163,184,0.16)",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
            flexShrink: 0,
            transition:
              "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
            "&:hover": effectiveDisabled
              ? {}
              : {
                  transform: "translateY(-1px)",
                  boxShadow: "0 10px 24px rgba(15,23,42,0.08)",
                  borderColor: "rgba(59,130,246,0.22)",
                },
          }}
        >
          <PaintBucket
            size={15}
            color={effectiveDisabled ? "#94a3b8" : "#475569"}
          />
          <Typography
            sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#111827" }}
          >
            Replace Background
          </Typography>
        </ButtonBase>
      </Box>

      <Popover
        open={isBackgroundPopoverOpen}
        anchorEl={backgroundAnchorEl}
        onClose={handleCloseBackgroundPopover}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 272,
            p: 1.6,
            borderRadius: 4,
            border: "1px solid rgba(148,163,184,0.16)",
            boxShadow: "0 26px 60px rgba(15,23,42,0.16)",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}>
          <IconButton
            size="small"
            onClick={() => setBackgroundTab("color")}
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              border:
                backgroundTab === "color"
                  ? "2px solid #9db4ff"
                  : "1px solid rgba(15,23,42,0.08)",
              backgroundColor: "#fff",
            }}
          >
            <Palette size={15} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setBackgroundTab("image")}
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              border:
                backgroundTab === "image"
                  ? "2px solid #9db4ff"
                  : "1px solid rgba(15,23,42,0.08)",
              backgroundColor: "#fff",
            }}
          >
            <ImageIcon size={15} />
          </IconButton>
        </Box>

        <Tabs
          value={backgroundTab}
          onChange={(_, nextValue) => setBackgroundTab(nextValue)}
          sx={{
            minHeight: 40,
            mb: 1.2,
            p: 0.4,
            borderRadius: 2.5,
            bgcolor: "rgba(15,23,42,0.05)",
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTab-root": {
              minHeight: 32,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              color: "#475569",
            },
            "& .Mui-selected": {
              bgcolor: "#ffffff",
              color: "#111827 !important",
              boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
            },
          }}
        >
          <Tab value="color" label="Brand" />
          <Tab value="image" label="Image" />
        </Tabs>

        {backgroundTab === "color" ? (
          <Box>
            <Typography
              sx={{
                mb: 1,
                fontSize: "0.78rem",
                color: "#475569",
                fontWeight: 600,
              }}
            >
              Color palette
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 1,
              }}
            >
              {BRAND_COLOR_SWATCHES.map((swatch) => {
                const isActive =
                  (resolvedValue.backgroundColor || "transparent") === swatch;
                return (
                  <ButtonBase
                    key={swatch}
                    disabled={effectiveDisabled}
                    onClick={() =>
                      onStyleChange({
                        backgroundType:
                          swatch === "transparent" ? "none" : "solid",
                        backgroundColor: swatch,
                        backgroundImageUrl: "",
                      })
                    }
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: "50%",
                      border: isActive
                        ? "2px solid rgba(15,23,42,0.9)"
                        : "1px solid rgba(15,23,42,0.12)",
                      background: getSwatchBackground(swatch),
                      boxShadow: isActive
                        ? "0 0 0 3px rgba(59,130,246,0.16)"
                        : "none",
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        ) : (
          <Box>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => {
                void handleImageUpload(event.target.files?.[0] || null);
              }}
            />

            {resolvedValue.backgroundImageUrl ? (
              <Box
                sx={{
                  position: "relative",
                  borderRadius: 2.5,
                  overflow: "hidden",
                  border: "1px solid rgba(15,23,42,0.08)",
                  height: 120,
                  backgroundImage: `url(${resolvedValue.backgroundImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  mb: 1.2,
                }}
              >
                <IconButton
                  size="small"
                  onClick={() =>
                    onStyleChange({
                      backgroundType:
                        resolvedValue.backgroundColor &&
                        resolvedValue.backgroundColor !== "transparent"
                          ? "solid"
                          : "none",
                      backgroundImageUrl: "",
                    })
                  }
                  sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    bgcolor: "rgba(255,255,255,0.9)",
                  }}
                >
                  <X size={14} />
                </IconButton>
              </Box>
            ) : (
              <ButtonBase
                disabled={effectiveDisabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: "100%",
                  height: 120,
                  borderRadius: 2.5,
                  border: "1px dashed rgba(15,23,42,0.35)",
                  bgcolor: "#fff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1,
                  mb: 1.2,
                }}
              >
                {isUploading ? (
                  <CircularProgress size={24} />
                ) : (
                  <Upload size={22} />
                )}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Upload image
                </Typography>
              </ButtonBase>
            )}

            {resolvedValue.backgroundImageUrl && (
              <ButtonBase
                disabled={effectiveDisabled || isUploading}
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  width: "100%",
                  height: 42,
                  borderRadius: 2,
                  border: "1px solid rgba(15,23,42,0.08)",
                  backgroundColor: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 0.75,
                }}
              >
                {isUploading ? (
                  <CircularProgress size={18} />
                ) : (
                  <Upload size={16} />
                )}
                <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>
                  Replace image
                </Typography>
              </ButtonBase>
            )}
          </Box>
        )}
      </Popover>

      <TextField
        size="small"
        disabled={effectiveDisabled}
        label="Background hex"
        value={resolvedValue.backgroundColor || ""}
        onChange={(event) =>
          onStyleChange({
            backgroundType: event.target.value ? "solid" : "none",
            backgroundColor: event.target.value,
            backgroundImageUrl: "",
          })
        }
        placeholder="#000000"
        sx={{
          width: isPanel ? "100%" : 144,
          color: "black",
          marginTop: 2,
          flexShrink: 0,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2.5,
            backgroundColor: "#fff",
          },
          "& .MuiInputLabel-root": {
            color: "#000",
          },
        }}
      />

      <Divider flexItem orientation="vertical" />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr)",
          gap: 1,
          minWidth: isPanel ? 0 : 540,
          width: isPanel ? "100%" : "auto",
          flexShrink: 0,
        }}
      >
        {renderSegmentedControl(
          "Width",
          resolvedValue.layoutWidth || "page",
          LAYOUT_WIDTH_OPTIONS,
          (nextValue) =>
            onStyleChange({
              layoutWidth: nextValue as EditorSectionStyle["layoutWidth"],
            }),
        )}

        {renderHeightControl()}

        {renderSegmentedControl(
          "Alignment",
          resolvedValue.contentAlign || "left",
          CONTENT_ALIGN_OPTIONS,
          (nextValue) =>
            onStyleChange({
              contentAlign: nextValue as EditorSectionStyle["contentAlign"],
            }),
        )}

        <SharedSpacingControls
          disabled={effectiveDisabled}
          value={resolvedValue}
          onChange={onStyleChange}
        />

        {renderAccordionPanel(
          "border",
          "Border",
          <Square size={15} />,
          <>
            {renderPanelRow(
              "Style",
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  p: 0.4,
                  borderRadius: 2.5,
                  border: "1px solid rgba(203,213,225,0.95)",
                  backgroundColor: "#ffffff",
                }}
              >
                {BORDER_STYLE_OPTIONS.map((option) => {
                  const active =
                    (resolvedValue.borderStyle || "none") === option.value;
                  return (
                    <ButtonBase
                      key={option.value}
                      disabled={effectiveDisabled}
                      onClick={() =>
                        onStyleChange({
                          borderStyle:
                            option.value as EditorSectionStyle["borderStyle"],
                        })
                      }
                      sx={{
                        minHeight: "34px !important",
                        borderRadius: 1.8,
                        fontSize: "0.82rem",
                        fontWeight: 700,
                        color: active ? "#ffffff" : "#475569",
                        background: active ? "#000000" : "transparent",
                      }}
                    >
                      {option.label}
                    </ButtonBase>
                  );
                })}
              </Box>,
            )}

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1 }}
            >
              {renderPanelRow(
                "Radius",
                <Box sx={{ display: "flex", gap: 0.45, flexWrap: "wrap" }}>
                  {RADIUS_OPTIONS.map((radius) => {
                    const active =
                      (resolvedValue.borderRadius || "") === radius;
                    return (
                      <ButtonBase
                        key={radius}
                        disabled={effectiveDisabled}
                        onClick={() => onStyleChange({ borderRadius: radius })}
                        sx={{
                          minWidth: "28px !important",
                          height: 28,
                          px: 0.7,
                          borderRadius: 999,
                          border: active
                            ? "1px solid rgba(59,130,246,0.22)"
                            : "1px solid rgba(203,213,225,0.95)",
                          background: active ? "#000000" : "#ffffff",
                          color: active ? "#ffffff" : "#64748b",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        {radius.replace("px", "")}
                      </ButtonBase>
                    );
                  })}
                </Box>,
              )}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "end",
                  gap: 0.55,
                  justifyContent: "flex-start",
                }}
              >
                <TextField
                  size="small"
                  disabled={effectiveDisabled}
                  value={rawSpacingNumberValue(resolvedValue.borderRadius)}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/[^\d]/g, "");
                    onStyleChange({
                      borderRadius: nextValue ? `${nextValue}px` : "",
                    });
                  }}
                  placeholder="0"
                  sx={{
                    width: "55px !important",
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
                <Box
                  sx={{
                    minWidth: 34,
                    height: 36,
                    px: 0.8,
                    borderRadius: 2,
                    border: "1px solid rgba(226,232,240,0.95)",
                    backgroundColor: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  >
                    px
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
            >
              {renderPanelRow(
                "Width",
                <TextField
                  size="small"
                  disabled={effectiveDisabled}
                  value={rawSpacingNumberValue(resolvedValue.borderWidth)}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/[^\d]/g, "");
                    onStyleChange({
                      borderWidth: nextValue ? `${nextValue}px` : "",
                    });
                  }}
                  placeholder="0"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />,
              )}
              {renderPanelRow(
                "Color",
                <TextField
                  size="small"
                  disabled={effectiveDisabled}
                  value={resolvedValue.borderColor || ""}
                  onChange={(event) =>
                    onStyleChange({ borderColor: event.target.value })
                  }
                  placeholder="#dbe3ea"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />,
              )}
            </Box>
          </>,
        )}

        {renderAccordionPanel(
          "effects",
          "Effects",
          <Sparkles size={15} />,
          <>
            {renderPanelRow(
              "Opacity",
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Slider
                  value={
                    typeof resolvedValue.opacity === "number"
                      ? resolvedValue.opacity * 100
                      : 100
                  }
                  min={0}
                  max={100}
                  step={1}
                  disabled={effectiveDisabled}
                  onChange={(_, nextValue) =>
                    onStyleChange({
                      opacity: Number(nextValue) / 100,
                    })
                  }
                  sx={{ color: "#111827", flex: 1 }}
                />
                <Box
                  sx={{
                    minWidth: 54,
                    height: 32,
                    borderRadius: 2,
                    border: "1px solid rgba(226,232,240,0.95)",
                    backgroundColor: "#fff",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      color: "#475569",
                    }}
                  >
                    {Math.round(
                      (typeof resolvedValue.opacity === "number"
                        ? resolvedValue.opacity
                        : 1) * 100,
                    )}
                    %
                  </Typography>
                </Box>
              </Box>,
            )}
            {renderPanelRow(
              "Box Shadow",
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                  gap: 0.7,
                }}
              >
                {BOX_SHADOW_OPTIONS.map((option) => {
                  const active =
                    (resolvedValue.boxShadowPreset || "none") === option.value;
                  return (
                    <ButtonBase
                      key={option.value}
                      disabled={effectiveDisabled}
                      onClick={() =>
                        onStyleChange({
                          boxShadowPreset:
                            option.value as EditorSectionStyle["boxShadowPreset"],
                        })
                      }
                      sx={{
                        minHeight: "  34px !important",
                        borderRadius: 2,
                        border: active
                          ? "1px solid #111827"
                          : "1px solid rgba(226,232,240,0.95)",
                        backgroundColor: "#fff",
                        color: "#475569",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                      }}
                    >
                      {option.label}
                    </ButtonBase>
                  );
                })}
              </Box>,
            )}
          </>,
        )}

        {renderAccordionPanel(
          "visibility",
          "Visibility",
          <Eye size={15} />,
          <>
            {[
              ["Desktop", "showOnDesktop"],
              ["Tablet", "showOnTablet"],
              ["Mobile", "showOnMobile"],
            ].map(([label, key]) => (
              <Box
                key={key}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.1,
                  py: 0.9,
                  borderRadius: 2.5,
                  border: "1px solid rgba(226,232,240,0.95)",
                  backgroundColor: "#ffffff",
                }}
              >
                <Typography
                  sx={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}
                >
                  {label}
                </Typography>
                <Switch
                  checked={
                    resolvedValue[key as keyof EditorSectionStyle] !== false
                  }
                  disabled={effectiveDisabled}
                  onChange={(_, checked) =>
                    onStyleChange({
                      [key]: checked,
                    })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#000",
                    },

                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#000",
                      opacity: 0.35,
                    },

                    "& .MuiSwitch-thumb": {
                      backgroundColor: "#000",
                    },

                    "& .MuiSwitch-track": {
                      backgroundColor: "#d1d5db",
                      opacity: 1,
                    },

                    "& .MuiSwitch-switchBase.Mui-disabled .MuiSwitch-thumb": {
                      backgroundColor: "#000",
                      opacity: 0.45,
                    },

                    "& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track": {
                      backgroundColor: "#d1d5db",
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>
            ))}
          </>,
        )}

        {renderAccordionPanel(
          "animation",
          "Animation",
          <Sparkles size={15} />,
          <>
            {renderPanelRow(
              "Entrance",
              <TextField
                select
                size="small"
                disabled={effectiveDisabled}
                value={resolvedValue.entranceAnimation || "none"}
                onChange={(event) =>
                  onStyleChange({
                    entranceAnimation: event.target
                      .value as EditorSectionStyle["entranceAnimation"],
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 38,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              >
                {ENTRANCE_ANIMATION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>,
            )}

            {/* <Box
              sx={{
                px: 1.1,
                py: 1,
                borderRadius: 2.5,
                border: "1px solid rgba(226,232,240,0.95)",
                backgroundColor: "#ffffff",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#334155",
                    }}
                  >
                    Parallax
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.76rem", color: "#94a3b8", mt: 0.2 }}
                  >
                    Background moves at a different speed
                  </Typography>
                </Box>
                <Switch
                  checked={Boolean(resolvedValue.parallaxEnabled)}
                  disabled={effectiveDisabled}
                  onChange={(_, checked) =>
                    onStyleChange({
                      parallaxEnabled: checked,
                    })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#000",
                    },

                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#000",
                      opacity: 0.35,
                    },

                    "& .MuiSwitch-thumb": {
                      backgroundColor: "#000",
                    },

                    "& .MuiSwitch-track": {
                      backgroundColor: "#d1d5db",
                      opacity: 1,
                    },

                    "& .MuiSwitch-switchBase.Mui-disabled .MuiSwitch-thumb": {
                      backgroundColor: "#000",
                      opacity: 0.45,
                    },

                    "& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track": {
                      backgroundColor: "#d1d5db",
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>

              {resolvedValue.parallaxEnabled && (
                <Box sx={{ mt: 1.2 }}>
                  {renderPanelRow(
                    "Parallax Speed",
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.2 }}
                    >
                      <Slider
                        value={
                          typeof resolvedValue.parallaxSpeed === "number"
                            ? resolvedValue.parallaxSpeed
                            : 50
                        }
                        min={0}
                        max={100}
                        step={1}
                        disabled={effectiveDisabled}
                        onChange={(_, nextValue) =>
                          onStyleChange({
                            parallaxSpeed: Number(nextValue),
                          })
                        }
                        sx={{ color: "#111827", flex: 1 }}
                      />
                      <Box
                        sx={{
                          minWidth: 54,
                          height: 32,
                          borderRadius: 2,
                          border: "1px solid rgba(226,232,240,0.95)",
                          backgroundColor: "#fff",
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            color: "#475569",
                          }}
                        >
                          {typeof resolvedValue.parallaxSpeed === "number"
                            ? resolvedValue.parallaxSpeed
                            : 50}
                          %
                        </Typography>
                      </Box>
                    </Box>,
                  )}
                </Box>
              )}

              <Box
                sx={{
                  mt: 1.2,
                  pt: 1.1,
                  borderTop: "1px solid rgba(226,232,240,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      color: "#334155",
                    }}
                  >
                    Sticky section
                  </Typography>
                  <Typography
                    sx={{ fontSize: "0.76rem", color: "#94a3b8", mt: 0.2 }}
                  >
                    Section stays fixed while scrolling
                  </Typography>
                </Box>
                <Switch
                  checked={Boolean(resolvedValue.stickySection)}
                  disabled={effectiveDisabled}
                  onChange={(_, checked) =>
                    onStyleChange({
                      stickySection: checked,
                    })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: "#000",
                    },

                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: "#000",
                      opacity: 0.35,
                    },

                    "& .MuiSwitch-thumb": {
                      backgroundColor: "#000",
                    },

                    "& .MuiSwitch-track": {
                      backgroundColor: "#d1d5db",
                      opacity: 1,
                    },

                    "& .MuiSwitch-switchBase.Mui-disabled .MuiSwitch-thumb": {
                      backgroundColor: "#000",
                      opacity: 0.45,
                    },

                    "& .MuiSwitch-switchBase.Mui-disabled + .MuiSwitch-track": {
                      backgroundColor: "#d1d5db",
                      opacity: 0.5,
                    },
                  }}
                />
              </Box>

              {resolvedValue.stickySection && (
                <Box sx={{ mt: 1.2 }}>
                  {renderPanelRow(
                    "Sticky Offset",
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.55 }}
                    >
                      <TextField
                        size="small"
                        disabled={effectiveDisabled}
                        value={rawSpacingNumberValue(
                          resolvedValue.stickyOffset,
                        )}
                        onChange={(event) => {
                          const nextValue = event.target.value.replace(
                            /[^\d]/g,
                            "",
                          );
                          onStyleChange({
                            stickyOffset: nextValue ? `${nextValue}px` : "",
                          });
                        }}
                        placeholder="0"
                        sx={{
                          width: 96,
                          "& .MuiOutlinedInput-root": {
                            height: 36,
                            borderRadius: 2,
                            backgroundColor: "#fff",
                          },
                        }}
                      />
                      <Box
                        sx={{
                          minWidth: 34,
                          height: 36,
                          px: 0.8,
                          borderRadius: 2,
                          border: "1px solid rgba(226,232,240,0.95)",
                          backgroundColor: "#f8fafc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            color: "#64748b",
                          }}
                        >
                          px
                        </Typography>
                      </Box>
                    </Box>,
                  )}
                </Box>
              )}
            </Box> */}
          </>,
        )}

        {renderAccordionPanel(
          "layout",
          "Layout",
          <LayoutPanelTop size={15} />,
          <>
            {renderPanelRow(
              "Direction",
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  p: 0.4,
                  borderRadius: 2.5,
                  border: "1px solid rgba(203,213,225,0.95)",
                  backgroundColor: "#ffffff",
                }}
              >
                {LAYOUT_DIRECTION_OPTIONS.map((option) => {
                  const active =
                    (resolvedValue.layoutDirection || "row") === option.value;
                  return (
                    <ButtonBase
                      key={option.value}
                      disabled={effectiveDisabled}
                      onClick={() =>
                        onStyleChange({
                          layoutDirection:
                            option.value as EditorSectionStyle["layoutDirection"],
                        })
                      }
                      sx={{
                        minHeight: "34px !important",
                        borderRadius: 1.8,
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: active ? "#ffffff" : "#475569",
                        background: active ? "#000000" : "transparent",
                      }}
                    >
                      {option.label}
                    </ButtonBase>
                  );
                })}
              </Box>,
            )}

            <Box
              sx={{
                display: "flex",
                alignItems: "flex-end",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              {renderPanelRow(
                "Gap",
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.45,
                    flexWrap: "wrap",
                  }}
                >
                  {SPACING_OPTIONS.slice(0, 4).map((spacing) => {
                    const active = (resolvedValue.layoutGap || "") === spacing;

                    return (
                      <ButtonBase
                        key={`gap-${spacing}`}
                        disabled={effectiveDisabled}
                        onClick={() => onStyleChange({ layoutGap: spacing })}
                        sx={{
                          minWidth: "28px !important",
                          height: 28,
                          px: 0.7,
                          borderRadius: 999,
                          border: active
                            ? "1px solid rgba(59,130,246,0.22)"
                            : "1px solid rgba(203,213,225,0.95)",
                          background: active ? "#000000" : "#ffffff",
                          color: active ? "#ffffff" : "#64748b",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                        }}
                      >
                        {spacing.replace("px", "")}
                      </ButtonBase>
                    );
                  })}

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.55,
                      ml: 0.4,
                    }}
                  >
                    <TextField
                      size="small"
                      disabled={effectiveDisabled}
                      value={rawSpacingNumberValue(resolvedValue.layoutGap)}
                      onChange={(event) => {
                        const nextValue = event.target.value.replace(
                          /[^\d]/g,
                          "",
                        );

                        onStyleChange({
                          layoutGap: nextValue ? `${nextValue}px` : "",
                        });
                      }}
                      placeholder="0"
                      sx={{
                        width: "15px !important",
                        "& .MuiOutlinedInput-root": {
                          height: 36,
                          borderRadius: 2,
                          backgroundColor: "#fff",
                        },
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          px: 0.8,
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#111827",
                        },
                      }}
                    />

                    <Box
                      sx={{
                        minWidth: 34,
                        height: 36,
                        px: 0.8,
                        borderRadius: 2,
                        border: "1px solid rgba(226,232,240,0.95)",
                        backgroundColor: "#f8fafc",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#64748b",
                        }}
                      >
                        px
                      </Typography>
                    </Box>
                  </Box>
                </Box>,
              )}
            </Box>

            {renderPanelRow(
              "Overflow",
              <TextField
                select
                size="small"
                disabled={effectiveDisabled}
                value={resolvedValue.overflowMode || "visible"}
                onChange={(event) =>
                  onStyleChange({
                    overflowMode: event.target
                      .value as EditorSectionStyle["overflowMode"],
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 38,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              >
                {OVERFLOW_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>,
            )}

            {renderPanelRow(
              "Position",
              <TextField
                select
                size="small"
                disabled={effectiveDisabled}
                value={resolvedValue.positionMode || "static"}
                onChange={(event) =>
                  onStyleChange({
                    positionMode: event.target
                      .value as EditorSectionStyle["positionMode"],
                  })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 38,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              >
                {POSITION_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>,
            )}

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}
            >
              {renderPanelRow(
                "Min Height",
                <TextField
                  size="small"
                  disabled={effectiveDisabled}
                  value={rawSpacingNumberValue(resolvedValue.minHeightValue)}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/[^\d]/g, "");
                    onStyleChange({
                      minHeightValue: nextValue ? `${nextValue}px` : "",
                    });
                  }}
                  placeholder="0"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />,
              )}
              {renderPanelRow(
                "Max Width",
                <TextField
                  size="small"
                  disabled={effectiveDisabled}
                  value={rawSpacingNumberValue(resolvedValue.maxWidthValue)}
                  onChange={(event) => {
                    const nextValue = event.target.value.replace(/[^\d]/g, "");
                    onStyleChange({
                      maxWidthValue: nextValue ? `${nextValue}px` : "",
                    });
                  }}
                  placeholder="1200"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      height: 36,
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />,
              )}
            </Box>
          </>,
        )}

        {renderAccordionPanel(
          "advanced",
          "Advanced",
          <Settings2 size={15} />,
          <>
            {renderPanelRow(
              "Tag",
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                {SEMANTIC_TAG_OPTIONS.map((tagName) => {
                  const active =
                    (resolvedValue.semanticTag || "div") === tagName;

                  return (
                    <ButtonBase
                      key={tagName}
                      disabled={effectiveDisabled}
                      onClick={() => onStyleChange({ semanticTag: tagName })}
                      sx={{
                        px: 1.05,
                        height: 32,
                        borderRadius: 2,
                        border: active
                          ? "1px solid rgba(15,23,42,0.16)"
                          : "1px solid rgba(226,232,240,0.95)",
                        backgroundColor: active ? "#0f172a" : "#ffffff",
                        color: active ? "#ffffff" : "#64748b",
                        fontSize: "0.76rem",
                        fontWeight: 700,
                        fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                      }}
                    >
                      {`<${tagName}>`}
                    </ButtonBase>
                  );
                })}
              </Box>,
            )}
            {renderPanelRow(
              "CSS Class",
              <TextField
                size="small"
                disabled={effectiveDisabled}
                value={resolvedValue.cssClass || ""}
                onChange={(event) =>
                  onStyleChange({ cssClass: event.target.value })
                }
                placeholder="my-section"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              />,
            )}
            {renderPanelRow(
              "Custom CSS",
              <Box sx={{ display: "grid", gap: 0.9 }}>
                <Box
                  sx={{
                    border: "1px solid rgba(226,232,240,0.95)",
                    borderRadius: 2.5,
                    backgroundColor: "#ffffff",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      px: 1,
                      py: 0.8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderBottom: "1px solid rgba(226,232,240,0.85)",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.7 }}>
                      <Code2 size={13} color="#94a3b8" />
                      <Typography
                        sx={{
                          fontSize: "0.72rem",
                          fontWeight: 800,
                          color: "#94a3b8",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                        }}
                      >
                        Custom CSS
                      </Typography>
                    </Box>
                    <ButtonBase
                      disabled={effectiveDisabled}
                      onClick={() =>
                        navigator?.clipboard?.writeText(
                          resolvedValue.customCss || "",
                        )
                      }
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        color: "#64748b",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      <Copy size={12} />
                      Copy
                    </ButtonBase>
                  </Box>
                  <TextField
                    multiline
                    minRows={5}
                    disabled={effectiveDisabled}
                    value={resolvedValue.customCss || ""}
                    onChange={(event) =>
                      onStyleChange({ customCss: event.target.value })
                    }
                    placeholder={"color: red;\nfont-size: 16px;"}
                    sx={{
                      width: "100%",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 0,
                        backgroundColor: "#ffffff",
                        alignItems: "stretch",
                        "& fieldset": { border: "none" },
                      },
                      "& .MuiInputBase-inputMultiline": {
                        fontFamily:
                          '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
                        fontSize: "0.82rem",
                        lineHeight: 1.7,
                        color: "#475569",
                        p: 1.2,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      px: 1,
                      py: 0.75,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      borderTop: "1px solid rgba(226,232,240,0.85)",
                      backgroundColor: "#f8fafc",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      Applied inside section selector
                    </Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                      {`${(resolvedValue.customCss || "")
                        .split(";")
                        .map((rule) => rule.trim())
                        .filter(Boolean).length} rules`}
                    </Typography>
                  </Box>
                </Box>
              </Box>,
            )}
            {renderPanelRow(
              "Data Attributes",
              <Box sx={{ display: "grid", gap: 0.8 }}>
                {dataAttributes.map((attribute, index) => (
                  <Box
                    key={`data-attribute-${index}`}
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr auto",
                      gap: 0.75,
                      alignItems: "center",
                    }}
                  >
                    <TextField
                      size="small"
                      disabled={effectiveDisabled}
                      value={attribute.key || ""}
                      onChange={(event) =>
                        handleDataAttributeChange(index, "key", event.target.value)
                      }
                      placeholder="data-key"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: 36,
                          borderRadius: 2,
                          backgroundColor: "#fff",
                        },
                      }}
                    />
                    <TextField
                      size="small"
                      disabled={effectiveDisabled}
                      value={attribute.value || ""}
                      onChange={(event) =>
                        handleDataAttributeChange(index, "value", event.target.value)
                      }
                      placeholder="value"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          height: 36,
                          borderRadius: 2,
                          backgroundColor: "#fff",
                        },
                      }}
                    />
                    <IconButton
                      size="small"
                      disabled={effectiveDisabled}
                      onClick={() =>
                        onStyleChange({
                          dataAttributes: dataAttributes.filter(
                            (_, currentIndex) => currentIndex !== index,
                          ),
                        })
                      }
                      sx={{
                        width: 32,
                        height: 32,
                        border: "1px solid rgba(226,232,240,0.95)",
                        borderRadius: 2,
                        color: "#94a3b8",
                      }}
                    >
                      <Trash2 size={14} />
                    </IconButton>
                  </Box>
                ))}
                <ButtonBase
                  disabled={effectiveDisabled}
                  onClick={() =>
                    onStyleChange({
                      dataAttributes: [
                        ...dataAttributes,
                        { key: "", value: "" },
                      ],
                    })
                  }
                  sx={{
                    justifyContent: "flex-start",
                    gap: 0.55,
                    px: 0.1,
                    color: "#64748b",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                  }}
                >
                  <Plus size={13} />
                  Add attribute
                </ButtonBase>
              </Box>,
            )}
            {renderPanelRow(
              "Anchor ID",
              <TextField
                size="small"
                disabled={effectiveDisabled}
                value={resolvedValue.anchorId || ""}
                onChange={(event) =>
                  onStyleChange({ anchorId: event.target.value })
                }
                placeholder="section-id"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              />,
            )}
            {renderPanelRow(
              "Z-Index",
              <TextField
                size="small"
                disabled={effectiveDisabled}
                value={resolvedValue.zIndex || ""}
                onChange={(event) =>
                  onStyleChange({
                    zIndex: event.target.value.replace(/[^\d-]/g, ""),
                  })
                }
                placeholder="0"
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 36,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              />,
            )}
          </>,
        )}
      </Box>
    </Box>
  );
};

export default EditorSectionStyleToolbar;
