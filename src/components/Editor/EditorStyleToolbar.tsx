import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  ButtonBase,
  Box,
  Divider,
  FormControl,
  IconButton,
  MenuItem,
  Popover,
  Select,
  Slider,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  Bold,
  Italic,
  Link2,
  PaintBucket,
  Pilcrow,
  Settings2,
  Sparkles,
  Strikethrough,
  Pipette,
  Type,
  Underline,
} from "lucide-react";
import { SharedSpacingControls } from "./sharedSpacingControls";

export type EditorTextStyle = {
  fontFamily?: string;
  fontSize?: string;
  color?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textDecoration?: string;
  textAlign?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  wordSpacing?: string | number;
  textTransform?: string;
  textShadow?: string;
  textIndent?: string | number;
  marginBottom?: string | number;
  marginTop?: string | number;
  marginLeft?: string | number;
  marginRight?: string | number;
  paddingTop?: string | number;
  paddingBottom?: string | number;
  paddingLeft?: string | number;
  paddingRight?: string | number;
  listStyleType?: string;
  animation?: string;
  opacity?: number;
  rotate?: string | number;
  scaleX?: string | number;
  scaleY?: string | number;
  translateX?: string | number;
  translateY?: string | number;
  skewX?: string | number;
  skewY?: string | number;
  transform?: string;
  href?: string;
};

export type EditableSelection = {
  blockId: string;
  fieldPath: string;
  label: string;
  editType?: "single" | "multi";
};

type ToolbarAction =
  | "bold"
  | "italic"
  | "underline"
  | "strikethrough"
  | "align-left"
  | "align-center"
  | "align-right"
  | "align-justify";

type Props = {
  selection: EditableSelection | null;
  value: EditorTextStyle;
  disabled?: boolean;
  onStyleChange: (patch: Partial<EditorTextStyle>) => void;
  containerSx?: SxProps<Theme>;
  layout?: "inline" | "panel";
};

const FONT_OPTIONS = [
  { value: '"Inter", "Segoe UI", sans-serif', label: "Inter" },
  { value: '"Poppins", "Inter", sans-serif', label: "Poppins" },
  { value: '"DM Sans", "Inter", sans-serif', label: "DM Sans" },
  { value: '"Montserrat", "Inter", sans-serif', label: "Montserrat" },
  { value: '"Plus Jakarta Sans", "Inter", sans-serif', label: "Jakarta" },
  { value: '"Manrope", "Inter", sans-serif', label: "Manrope" },
  { value: '"Playfair Display", "Times New Roman", serif', label: "Playfair" },
  { value: '"Lora", Georgia, serif', label: "Lora" },
  { value: '"Merriweather", Georgia, serif', label: "Merriweather" },
  { value: '"Space Mono", monospace', label: "Mono" },
];

const SIZE_OPTIONS = [
  "12px",
  "14px",
  "16px",
  "18px",
  "20px",
  "24px",
  "32px",
  "48px",
];

const LINE_HEIGHT_OPTIONS = ["1", "1.2", "1.5", "1.75", "2"] as const;
const LETTER_SPACING_OPTIONS = [
  "-0.05em",
  "0em",
  "0.05em",
  "0.1em",
  "0.2em",
] as const;
const WORD_SPACING_OPTIONS = ["0px", "2px", "4px", "8px", "12px"] as const;
const SHADOW_PRESETS = [
  { value: "none", label: "None" },
  { value: "0 1px 2px rgba(15,23,42,0.18)", label: "Soft" },
  { value: "0 2px 6px rgba(15,23,42,0.28)", label: "Hard" },
  { value: "0 0 18px rgba(91,124,250,0.42)", label: "Glow" },
  { value: "0 6px 18px rgba(15,23,42,0.22)", label: "Lift" },
  { value: "1px 1px 0 rgba(15,23,42,0.3)", label: "Crisp" },
  { value: "0 10px 24px rgba(15,23,42,0.18)", label: "Depth" },
  { value: "0 0 24px rgba(249,115,22,0.34)", label: "Warm" },
  { value: "0 0 26px rgba(16,185,129,0.32)", label: "Neon" },
  { value: "2px 4px 12px rgba(88,28,135,0.28)", label: "Drama" },
] as const;
const LIST_STYLE_OPTIONS = [
  { value: "none", label: "None" },
  { value: "disc", label: "Disc" },
  { value: "decimal", label: "Decimal" },
  { value: "lower-alpha", label: "a, b, c" },
] as const;

const TEXT_ANIMATION_PRESETS = [
  {
    value: "none",
    label: "None",
    preview: "Static",
  },
  {
    value: "ttTextRise 0.8s cubic-bezier(0.22, 1, 0.36, 1) both",
    label: "Rise",
    preview: "Fade + Up",
  },
  {
    value: "ttTextBlurIn 0.9s cubic-bezier(0.22, 1, 0.36, 1) both",
    label: "Blur In",
    preview: "Blur Reveal",
  },
  {
    value: "ttTextPop 0.72s cubic-bezier(0.34, 1.56, 0.64, 1) both",
    label: "Pop",
    preview: "Scale Pop",
  },
  {
    value: "ttTextGlow 2.4s ease-in-out infinite",
    label: "Glow",
    preview: "Ambient Glow",
  },
  {
    value: "ttTextFloat 4.2s ease-in-out infinite",
    label: "Float",
    preview: "Soft Float",
  },
] as const;

const FONT_WEIGHT_OPTIONS = [
  { value: "300", label: "Light" },
  { value: "400", label: "Regular" },
  { value: "500", label: "Medium" },
  { value: "600", label: "Semibold" },
  { value: "700", label: "Bold" },
] as const;

const BRAND_COLOR_SWATCHES = [
  "#f8fafc",
  "#e5e7eb",
  "#9ca3af",
  "#4b5563",
  "#020617",
  "#5b7cfa",
  "#ff6b1a",
  "#0f1f63",
  "#f8d95b",
  "transparent",
];

const hasDecoration = (value: string | undefined, token: string) =>
  (value || "").split(/\s+/).includes(token);

const toggleDecoration = (value: string | undefined, token: string) => {
  const next = new Set((value || "").split(/\s+/).filter(Boolean));

  if (next.has(token)) {
    next.delete(token);
  } else {
    next.add(token);
  }

  return Array.from(next).join(" ") || "none";
};

const actionButtonSx = (
  active: boolean,
  disabled: boolean | undefined,
): SxProps<Theme> => ({
  width: 36,
  height: 36,
  borderRadius: 2.5,
  border: "1px solid rgba(148,163,184,0.18)",
  background: active
    ? "linear-gradient(180deg, rgba(240,249,255,1) 0%, rgba(224,242,254,1) 100%)"
    : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
  color: active ? "#0f172a" : "#475569",
  boxShadow: active
    ? "0 10px 20px rgba(37,99,235,0.12)"
    : "inset 0 1px 0 rgba(255,255,255,0.9)",
  "&:hover": disabled
    ? {}
    : {
        background: active
          ? "linear-gradient(180deg, rgba(224,242,254,1) 0%, rgba(219,234,254,1) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(241,245,249,1) 100%)",
      },
});

const normalizeHex = (value: string | undefined) => {
  if (!value) return "#111827";
  if (value === "transparent") return "transparent";
  return /^#([0-9a-f]{3}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(value)
    ? value
    : "#111827";
};

const hexToRgb = (hex: string) => {
  const normalized = normalizeHex(hex);

  if (normalized === "transparent") {
    return { r: 255, g: 255, b: 255 };
  }

  const safe =
    normalized.length === 4
      ? `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`
      : normalized.slice(0, 7);

  return {
    r: parseInt(safe.slice(1, 3), 16),
    g: parseInt(safe.slice(3, 5), 16),
    b: parseInt(safe.slice(5, 7), 16),
  };
};

const normalizeUrl = (url: string) => {
  const trimmed = url.trim();

  if (!trimmed) return "";

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
};

const EditorStyleToolbar: React.FC<Props> = ({
  selection,
  value,
  disabled = false,
  onStyleChange,
  containerSx,
  layout = "inline",
}) => {
  const resolvedValue = value || {};
  const effectiveDisabled = disabled || !selection;
  const isPanel = layout === "panel";

  const [colorAnchorEl, setColorAnchorEl] = React.useState<HTMLElement | null>(
    null,
  );
  const [colorTab, setColorTab] = React.useState<"brand" | "custom">("brand");
  const [expandedPanel, setExpandedPanel] = React.useState<
    | "font"
    | "color"
    | "alignment"
    | "spacing"
    | "decoration"
    | "shadow"
    | "animation"
    | "transforms"
    | "paragraph"
    | "advanced"
  >("font");

  const [linkAnchorEl, setLinkAnchorEl] = React.useState<HTMLElement | null>(
    null,
  );
  const [linkValue, setLinkValue] = React.useState("");

  React.useEffect(() => {
    setLinkValue(resolvedValue.href || "");
  }, [resolvedValue.href, selection?.blockId, selection?.fieldPath]);

  const resolvedColor = normalizeHex(resolvedValue.color);
  const rgb = hexToRgb(resolvedColor);

  const colorPickerOpen = Boolean(colorAnchorEl);
  const linkPopoverOpen = Boolean(linkAnchorEl);

  const handleAction = (action: ToolbarAction) => {
    if (effectiveDisabled) return;

    switch (action) {
      case "bold":
        onStyleChange({
          fontWeight:
            String(resolvedValue.fontWeight || "400") === "700" ? "400" : "700",
        });
        return;

      case "italic":
        onStyleChange({
          fontStyle: resolvedValue.fontStyle === "italic" ? "normal" : "italic",
        });
        return;

      case "underline":
        onStyleChange({
          textDecoration: toggleDecoration(
            resolvedValue.textDecoration,
            "underline",
          ),
        });
        return;

      case "strikethrough":
        onStyleChange({
          textDecoration: toggleDecoration(
            resolvedValue.textDecoration,
            "line-through",
          ),
        });
        return;

      case "align-left":
        onStyleChange({ textAlign: "left" });
        return;

      case "align-center":
        onStyleChange({ textAlign: "center" });
        return;

      case "align-right":
        onStyleChange({ textAlign: "right" });
        return;

      case "align-justify":
        onStyleChange({ textAlign: "justify" });
        return;

      default:
        return;
    }
  };

  const handleColorButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if (effectiveDisabled) return;
    setColorAnchorEl(event.currentTarget);
  };

  const handleColorClose = () => {
    setColorAnchorEl(null);
  };

  const handleRgbChange = (channel: "r" | "g" | "b", nextValue: string) => {
    const numeric = Math.max(0, Math.min(255, Number(nextValue) || 0));
    const nextRgb = { ...rgb, [channel]: numeric };

    const nextHex = `#${nextRgb.r.toString(16).padStart(2, "0")}${nextRgb.g
      .toString(16)
      .padStart(2, "0")}${nextRgb.b.toString(16).padStart(2, "0")}`;

    onStyleChange({ color: nextHex });
  };

  const handleLinkButtonClick = (event: React.MouseEvent<HTMLElement>) => {
    if (effectiveDisabled) return;

    setLinkValue(resolvedValue.href || "");
    setLinkAnchorEl(event.currentTarget);
  };

  const handleLinkClose = () => {
    setLinkAnchorEl(null);
  };

  const handleApplyLink = () => {
    const nextUrl = normalizeUrl(linkValue);

    onStyleChange({
      href: nextUrl || undefined,
    });

    setLinkAnchorEl(null);
  };

  const handleRemoveLink = () => {
    onStyleChange({
      href: undefined,
    });

    setLinkValue("");
    setLinkAnchorEl(null);
  };

  const normalizeUnitValue = (
    value: string | number | undefined,
    fallback: string,
  ) => {
    if (value === undefined || value === null || value === "") return fallback;
    return String(value);
  };

  const extractNumericValue = (
    value: string | number | undefined,
    fallback = "0",
  ) => {
    const normalized = normalizeUnitValue(value, fallback);
    const match = normalized.match(/-?\d+(\.\d+)?/);
    return match ? match[0] : fallback;
  };

  const applyUnitValue = (rawValue: string, unit: string) => {
    const trimmed = rawValue.trim();
    if (!trimmed) return "";
    return `${trimmed}${unit}`;
  };

  const buildTransformValue = (style: EditorTextStyle) => {
    const rotate = normalizeUnitValue(style.rotate, "0deg");
    const scaleX = Number(extractNumericValue(style.scaleX, "100")) / 100;
    const scaleY = Number(extractNumericValue(style.scaleY, "100")) / 100;
    const translateX = normalizeUnitValue(style.translateX, "0px");
    const translateY = normalizeUnitValue(style.translateY, "0px");
    const skewX = normalizeUnitValue(style.skewX, "0deg");
    const skewY = normalizeUnitValue(style.skewY, "0deg");

    const isDefaultTransform =
      rotate === "0deg" &&
      scaleX === 1 &&
      scaleY === 1 &&
      translateX === "0px" &&
      translateY === "0px" &&
      skewX === "0deg" &&
      skewY === "0deg";

    if (isDefaultTransform) {
      return "none";
    }

    return [
      `translate(${translateX}, ${translateY})`,
      `rotate(${rotate})`,
      `scale(${scaleX}, ${scaleY})`,
      `skew(${skewX}, ${skewY})`,
    ].join(" ");
  };

  const updateTransformStyle = (patch: Partial<EditorTextStyle>) => {
    const nextStyle = {
      ...resolvedValue,
      ...patch,
    };

    onStyleChange({
      ...patch,
      transform: buildTransformValue(nextStyle),
    });
  };

  const renderOptionChips = (
    values: readonly string[],
    selectedValue: string,
    onSelect: (value: string) => void,
  ) => (
    <Box sx={{ display: "flex", gap: 0.55, flexWrap: "wrap" }}>
      {values.map((value) => {
        const active = selectedValue === value;
        return (
          <ButtonBase
            key={value}
            disabled={effectiveDisabled}
            onClick={() => onSelect(value)}
            sx={{
              minWidth: 28,
              height: 26,
              px: 0.8,
              borderRadius: 1.5,
              border: active
                ? "1px solid rgba(15,23,42,0.16)"
                : "1px solid rgba(226,232,240,0.95)",
              backgroundColor: active ? "#111827" : "#f8fafc",
              color: active ? "#ffffff" : "#64748b",
              fontSize: "0.72rem",
              fontWeight: 700,
            }}
          >
            {value.replace("px", "").replace("em", "")}
          </ButtonBase>
        );
      })}
    </Box>
  );

  const renderStepperField = (
    label: string,
    value: string | number | undefined,
    unit: string,
    onChange: (nextValue: string) => void,
    step = 1,
  ) => {
    const numericValue = extractNumericValue(value, "0");
    const parsedValue = Number(numericValue) || 0;

    return (
      <Box sx={{ display: "grid", gap: 0.55 }}>
        <Typography
          sx={{
            fontSize: "0.68rem",
            fontWeight: 800,
            color: "#94a3b8",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginTop: "1rem",
          }}
        >
          {label}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "42px 1fr 42px",
            alignItems: "stretch",
            border: "1px solid rgba(226,232,240,0.95)",
            borderRadius: 2.2,
            backgroundColor: "#ffffff",
            overflow: "hidden",
          }}
        >
          <ButtonBase
            disabled={effectiveDisabled}
            onClick={() =>
              onChange(applyUnitValue(String(parsedValue - step), unit))
            }
            sx={{ fontSize: "1rem", color: "#64748b" }}
          >
            -
          </ButtonBase>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.45,
              borderLeft: "1px solid rgba(226,232,240,0.95)",
              borderRight: "1px solid rgba(226,232,240,0.95)",
            }}
          >
            <TextField
              size="small"
              disabled={effectiveDisabled}
              value={numericValue}
              onChange={(event) => {
                const nextValue = event.target.value.replace(/[^0-9.-]/g, "");
                onChange(nextValue ? applyUnitValue(nextValue, unit) : "");
              }}
              sx={{
                width: "72px",
                "& .MuiOutlinedInput-root": {
                  height: 36,
                  borderRadius: 0,
                  backgroundColor: "transparent",
                  "& fieldset": { border: "none" },
                },
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  fontSize: "0.84rem",
                  fontWeight: 700,
                  color: "#111827",
                  px: 0.6,
                },
              }}
            />
            <Typography
              sx={{
                fontSize: "0.72rem",
                color: "#94a3b8",
                right: "2.6em",
                position: "relative",
              }}
            >
              {unit}
            </Typography>
          </Box>
          <ButtonBase
            disabled={effectiveDisabled}
            onClick={() =>
              onChange(applyUnitValue(String(parsedValue + step), unit))
            }
            sx={{ fontSize: "1rem", color: "#64748b" }}
          >
            +
          </ButtonBase>
        </Box>
      </Box>
    );
  };

  const renderTransformValueField = (
    value: string | number | undefined,
    unit: string,
    onChange: (nextValue: string) => void,
  ) => (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        alignItems: "center",
        minHeight: 40,
        px: 1.1,
        borderRadius: 2,
        border: "1px solid rgba(226,232,240,0.95)",
        backgroundColor: "#f3f4f6",
        gap: 0.55,
      }}
    >
      <TextField
        size="small"
        disabled={effectiveDisabled}
        value={extractNumericValue(value, "0")}
        onChange={(event) => {
          const nextValue = event.target.value.replace(/[^0-9.-]/g, "");
          onChange(nextValue ? applyUnitValue(nextValue, unit) : "");
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            height: 28,
            borderRadius: 0,
            backgroundColor: "transparent",
            "& fieldset": { border: "none" },
          },
          "& .MuiInputBase-input": {
            px: 0,
            py: 0,
            fontSize: "0.94rem",
            fontWeight: 500,
            color: "#111827",
          },
        }}
      />
      <Typography
        sx={{
          fontSize: "0.86rem",
          fontWeight: 500,
          color: "#6b7280",
        }}
      >
        {unit}
      </Typography>
    </Box>
  );

  const renderAccordionPanel = (
    panelKey:
      | "font"
      | "color"
      | "alignment"
      | "spacing"
      | "decoration"
      | "shadow"
      | "animation"
      | "transforms"
      | "paragraph"
      | "advanced",
    icon: React.ReactNode,
    title: string,
    children: React.ReactNode,
  ) => (
    <Accordion
      disableGutters
      expanded={expandedPanel === panelKey}
      onChange={(_, expanded) => setExpandedPanel(expanded ? panelKey : "font")}
      sx={{
        boxShadow: "none",
        border: "none",
        background: "transparent",
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ArrowDown size={16} color="#94a3b8" />}
        sx={{
          px: 0.8,
          pt: 0.9,
          minHeight: "44px !important",
          borderTop: "1px solid rgba(226,232,240,0.95)",
          alignItems: "center",
          "& .MuiAccordionSummary-content": {
            my: "10px !important",
            display: "flex",
            alignItems: "center",
          },
          "& .MuiAccordionSummary-content.Mui-expanded": {
            my: "10px !important",
          },
          "& .MuiAccordionSummary-expandIconWrapper": {
            alignSelf: "center",
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94a3b8",
            }}
          >
            {icon}
          </Box>
          <Typography
            sx={{ fontSize: "0.88rem", fontWeight: 700, color: "#1e293b" }}
          >
            {title}
          </Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 0.2, pb: 1.4, pt: 0.2 }}>
        {children}
      </AccordionDetails>
    </Accordion>
  );

  if (isPanel) {
    return (
      <Box
        sx={{
          display: "grid",
          gap: 0,
          width: "100%",
          ...containerSx,
        }}
      >
        {renderAccordionPanel(
          "font",
          <Type size={15} />,
          "Font",
          <Box sx={{ display: "grid", gap: 1.1 }}>
            <Box sx={{ display: "grid", gap: 0.55 }}>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Family
              </Typography>
              <TextField
                select
                size="small"
                disabled={effectiveDisabled}
                value={resolvedValue.fontFamily || FONT_OPTIONS[0].value}
                onChange={(event) =>
                  onStyleChange({ fontFamily: event.target.value })
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: 40,
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              >
                {FONT_OPTIONS.map((font) => (
                  <MenuItem key={font.value} value={font.value}>
                    {font.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <Box sx={{ display: "grid", gap: 0.55 }}>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Size
              </Typography>
              {renderOptionChips(
                [
                  "12px",
                  "14px",
                  "16px",
                  "18px",
                  "20px",
                  "24px",
                  "30px",
                  "36px",
                  "48px",
                  "60px",
                  "72px",
                ],
                resolvedValue.fontSize || "16px",
                (nextValue) => onStyleChange({ fontSize: nextValue }),
              )}
              {renderStepperField(
                "Font Size",
                resolvedValue.fontSize || "16px",
                "px",
                (nextValue) => onStyleChange({ fontSize: nextValue }),
              )}
            </Box>

            <Box sx={{ display: "grid", gap: 0.55 }}>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Weight
              </Typography>
              <Box sx={{ display: "flex", gap: 0.55, flexWrap: "wrap" }}>
                {[
                  { value: "100", label: "Thin" },
                  { value: "300", label: "Light" },
                  { value: "400", label: "Regular" },
                  { value: "500", label: "Medium" },
                  { value: "600", label: "SemiBold" },
                  { value: "700", label: "Bold" },
                  { value: "800", label: "ExtraBold" },
                  // { value: "900", label: "Black" },
                ].map((weight) => {
                  const active =
                    String(resolvedValue.fontWeight || "400") === weight.value;
                  return (
                    <ButtonBase
                      key={weight.value}
                      disabled={effectiveDisabled}
                      onClick={() =>
                        onStyleChange({ fontWeight: weight.value })
                      }
                      sx={{
                        minHeight: "28px !important",
                        px: 0.85,
                        borderRadius: 1.4,
                        border: active
                          ? "1px solid rgba(15,23,42,0.16)"
                          : "1px solid rgba(226,232,240,0.95)",
                        backgroundColor: active ? "#111827" : "#f8fafc",
                        color: active ? "#ffffff" : "#64748b",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                      }}
                    >
                      {weight.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 1,
                py: 0.8,
                borderRadius: 2,
                border: "1px solid rgba(226,232,240,0.95)",
                backgroundColor: "#f8fafc",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.84rem",
                  color: "#334155",
                  fontStyle: "italic",
                }}
              >
                Italic
              </Typography>
              <Switch
                checked={resolvedValue.fontStyle === "italic"}
                disabled={effectiveDisabled}
                onChange={(_, checked) =>
                  onStyleChange({ fontStyle: checked ? "italic" : "normal" })
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
          </Box>,
        )}

        {renderAccordionPanel(
          "color",
          <PaintBucket size={15} />,
          "Color",
          <Box sx={{ display: "grid", gap: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 0.75,
              }}
            >
              {BRAND_COLOR_SWATCHES.map((swatch) => {
                const active = resolvedColor === swatch;
                return (
                  <ButtonBase
                    key={swatch}
                    disabled={effectiveDisabled}
                    onClick={() => onStyleChange({ color: swatch })}
                    sx={{
                      width: "100%",
                      aspectRatio: "1 / 1",
                      borderRadius: "50%",
                      border: active
                        ? "2px solid rgba(15,23,42,0.9)"
                        : "1px solid rgba(15,23,42,0.12)",
                      background:
                        swatch === "transparent"
                          ? "linear-gradient(135deg, transparent 46%, #ef4444 47%, #ef4444 53%, transparent 54%), #ffffff"
                          : swatch,
                    }}
                  />
                );
              })}
            </Box>
            <TextField
              size="small"
              disabled={effectiveDisabled}
              label="Text color"
              value={resolvedValue.color || ""}
              onChange={(event) => onStyleChange({ color: event.target.value })}
              placeholder="#111827"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                },
              }}
            />
          </Box>,
        )}

        {renderAccordionPanel(
          "alignment",
          <AlignLeft size={15} />,
          "Alignment",
          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#94a3b8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Horizontal
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                border: "1px solid rgba(226,232,240,0.95)",
                borderRadius: 2,
                overflow: "hidden",
                backgroundColor: "#fff",
              }}
            >
              {[
                {
                  key: "left",
                  icon: <AlignLeft size={15} />,
                  active: (resolvedValue.textAlign || "left") === "left",
                  onClick: () => handleAction("align-left"),
                },
                {
                  key: "center",
                  icon: <AlignCenter size={15} />,
                  active: resolvedValue.textAlign === "center",
                  onClick: () => handleAction("align-center"),
                },
                {
                  key: "right",
                  icon: <AlignRight size={15} />,
                  active: resolvedValue.textAlign === "right",
                  onClick: () => handleAction("align-right"),
                },
                {
                  key: "justify",
                  icon: <AlignJustify size={15} />,
                  active: resolvedValue.textAlign === "justify",
                  onClick: () => handleAction("align-justify"),
                },
              ].map((item) => (
                <ButtonBase
                  key={item.key}
                  disabled={effectiveDisabled}
                  onClick={item.onClick}
                  sx={{
                    minHeight: "  38px !important",
                    backgroundColor: item.active ? "#111827" : "#ffffff",
                    color: item.active ? "#ffffff" : "#64748b",
                    borderRight:
                      item.key !== "justify"
                        ? "1px solid rgba(226,232,240,0.95)"
                        : "none",
                  }}
                >
                  {item.icon}
                </ButtonBase>
              ))}
            </Box>
          </Box>,
        )}

        {renderAccordionPanel(
          "spacing",
          <Type size={15} />,
          "Spacing",
          <Box sx={{ display: "grid", gap: 1.1 }}>
            <Box sx={{ display: "grid", gap: 0.55 }}>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Line Height
              </Typography>
              {renderOptionChips(
                LINE_HEIGHT_OPTIONS,
                normalizeUnitValue(resolvedValue.lineHeight, "1.5"),
                (nextValue) => onStyleChange({ lineHeight: nextValue }),
              )}
              {renderStepperField(
                "Line Height",
                normalizeUnitValue(resolvedValue.lineHeight, "1.5"),
                "",
                (nextValue) =>
                  onStyleChange({ lineHeight: nextValue.replace(/px$/i, "") }),
                0.1,
              )}
            </Box>

            <Box sx={{ display: "grid", gap: 0.55 }}>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Letter Spacing
              </Typography>
              {renderOptionChips(
                LETTER_SPACING_OPTIONS,
                normalizeUnitValue(resolvedValue.letterSpacing, "0em"),
                (nextValue) => onStyleChange({ letterSpacing: nextValue }),
              )}
              {renderStepperField(
                "Letter Spacing",
                normalizeUnitValue(resolvedValue.letterSpacing, "0em"),
                "em",
                (nextValue) => onStyleChange({ letterSpacing: nextValue }),
                0.05,
              )}
            </Box>

            {renderStepperField(
              "Word Spacing",
              normalizeUnitValue(resolvedValue.wordSpacing, "0px"),
              "px",
              (nextValue) => onStyleChange({ wordSpacing: nextValue }),
              1,
            )}

            <SharedSpacingControls
              disabled={effectiveDisabled}
              value={{
                paddingTop:
                  typeof resolvedValue.paddingTop === "string"
                    ? resolvedValue.paddingTop
                    : "0px",
                paddingBottom:
                  typeof resolvedValue.paddingBottom === "string"
                    ? resolvedValue.paddingBottom
                    : "0px",
                paddingLeft:
                  typeof resolvedValue.paddingLeft === "string"
                    ? resolvedValue.paddingLeft
                    : "0px",
                paddingRight:
                  typeof resolvedValue.paddingRight === "string"
                    ? resolvedValue.paddingRight
                    : "0px",
                marginTop:
                  typeof resolvedValue.marginTop === "string"
                    ? resolvedValue.marginTop
                    : "0px",
                marginBottom:
                  typeof resolvedValue.marginBottom === "string"
                    ? resolvedValue.marginBottom
                    : "0px",
                marginLeft:
                  typeof resolvedValue.marginLeft === "string"
                    ? resolvedValue.marginLeft
                    : "0px",
                marginRight:
                  typeof resolvedValue.marginRight === "string"
                    ? resolvedValue.marginRight
                    : "0px",
              }}
              onChange={onStyleChange}
            />
          </Box>,
        )}

        {renderAccordionPanel(
          "decoration",
          <Underline size={15} />,
          "Decoration & Transform",
          <Box sx={{ display: "grid", gap: 1.1 }}>
            <Box sx={{ display: "grid", gap: 0.55 }}>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Decoration
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  border: "1px solid rgba(226,232,240,0.95)",
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                }}
              >
                {[
                  { value: "none", label: "-" },
                  { value: "underline", label: "U" },
                  { value: "overline", label: "O" },
                  { value: "line-through", label: "S" },
                ].map((option) => {
                  const active =
                    normalizeUnitValue(resolvedValue.textDecoration, "none") ===
                    option.value;
                  return (
                    <ButtonBase
                      key={option.value}
                      disabled={effectiveDisabled}
                      onClick={() =>
                        onStyleChange({ textDecoration: option.value })
                      }
                      sx={{
                        minHeight: "  38px !important",
                        backgroundColor: active ? "#111827" : "#ffffff",
                        color: active ? "#ffffff" : "#64748b",
                        borderRight:
                          option.value !== "line-through"
                            ? "1px solid rgba(226,232,240,0.95)"
                            : "none",
                        textDecoration:
                          option.value === "none" ? "none" : option.value,
                        fontWeight: 700,
                      }}
                    >
                      {option.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>

            <Box sx={{ display: "grid", gap: 0.55 }}>
              <Typography
                sx={{
                  fontSize: "0.68rem",
                  fontWeight: 800,
                  color: "#94a3b8",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                Transform
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  border: "1px solid rgba(226,232,240,0.95)",
                  borderRadius: 2,
                  overflow: "hidden",
                  backgroundColor: "#fff",
                }}
              >
                {[
                  { value: "none", label: "Aa" },
                  { value: "uppercase", label: "AA" },
                  { value: "lowercase", label: "aa" },
                  { value: "capitalize", label: "Aa+" },
                ].map((option) => {
                  const active =
                    normalizeUnitValue(resolvedValue.textTransform, "none") ===
                    option.value;
                  return (
                    <ButtonBase
                      key={option.value}
                      disabled={effectiveDisabled}
                      onClick={() =>
                        onStyleChange({ textTransform: option.value })
                      }
                      sx={{
                        minHeight: "  38px !important",
                        backgroundColor: active ? "#111827" : "#ffffff",
                        color: active ? "#ffffff" : "#64748b",
                        borderRight:
                          option.value !== "capitalize"
                            ? "1px solid rgba(226,232,240,0.95)"
                            : "none",
                        fontWeight: 700,
                      }}
                    >
                      {option.label}
                    </ButtonBase>
                  );
                })}
              </Box>
            </Box>
          </Box>,
        )}

        {renderAccordionPanel(
          "shadow",
          <Sparkles size={15} />,
          "Text Shadow",
          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
            {SHADOW_PRESETS.map((preset) => {
              const active =
                normalizeUnitValue(resolvedValue.textShadow, "none") ===
                preset.value;
              return (
                <ButtonBase
                  key={preset.label}
                  disabled={effectiveDisabled}
                  onClick={() => onStyleChange({ textShadow: preset.value })}
                  sx={{
                    width: 74,
                    minHeight: 64,
                    p: 1,
                    borderRadius: 2,
                    border: active
                      ? "2px solid #111827"
                      : "1px solid rgba(226,232,240,0.95)",
                    backgroundColor: active ? "#eff6ff" : "#fff",
                    boxShadow: active
                      ? "0 0 0 3px rgba(59,130,246,0.16), 0 10px 24px rgba(15,23,42,0.08)"
                      : "inset 0 1px 0 rgba(255,255,255,0.9)",
                    display: "grid",
                    placeItems: "center",
                    gap: 0.35,
                    transition:
                      "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease, transform 160ms ease",
                    "&:hover": effectiveDisabled
                      ? {}
                      : {
                          transform: "translateY(-1px)",
                          borderColor: active ? "#111827" : "rgba(148,163,184,0.95)",
                        },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "1.1rem",
                      fontWeight: 800,
                      color: active ? "#0f172a" : "#1e293b",
                      textShadow:
                        preset.value === "none" ? "none" : preset.value,
                    }}
                  >
                    Ag
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.72rem",
                      color: active ? "#0f172a" : "#475569",
                      fontWeight: 600,
                    }}
                  >
                    {preset.label}
                  </Typography>
                </ButtonBase>
              );
            })}
          </Box>,
        )}

        {renderAccordionPanel(
          "animation",
          <Sparkles size={15} />,
          "Animation",
          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography
              sx={{
                fontSize: "0.68rem",
                fontWeight: 800,
                color: "#94a3b8",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              Presets
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 0.75,
              }}
            >
              {TEXT_ANIMATION_PRESETS.map((preset) => {
                const active =
                  normalizeUnitValue(resolvedValue.animation, "none") ===
                  preset.value;

                return (
                  <ButtonBase
                    key={preset.label}
                    disabled={effectiveDisabled}
                    onClick={() =>
                      onStyleChange({
                        animation:
                          preset.value === "none" ? "none" : preset.value,
                      })
                    }
                    sx={{
                      minHeight: 68,
                      p: 1,
                      borderRadius: 2,
                      border: active
                        ? "1px solid rgba(15,23,42,0.18)"
                        : "1px solid rgba(226,232,240,0.95)",
                      backgroundColor: active ? "#f8fbff" : "#ffffff",
                      display: "grid",
                      justifyItems: "start",
                      alignContent: "center",
                      gap: 0.25,
                      textAlign: "left",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        fontWeight: 800,
                        color: "#1e293b",
                      }}
                    >
                      {preset.label}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.72rem",
                        color: "#64748b",
                        fontWeight: 600,
                      }}
                    >
                      {preset.preview}
                    </Typography>
                  </ButtonBase>
                );
              })}
            </Box>

            <TextField
              size="small"
              disabled={effectiveDisabled}
              label="CSS Animation"
              value={normalizeUnitValue(resolvedValue.animation, "none")}
              onChange={(event) =>
                onStyleChange({ animation: event.target.value || "none" })
              }
              placeholder="ttTextRise 0.8s ease both"
              sx={{
                "& .MuiInputLabel-root": {
                  color: "#64748b",
                  fontWeight: 600,
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  color: "#111827",
                },
                "& .MuiInputBase-input": {
                  color: "#111827",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                },
              }}
            />
          </Box>,
        )}

        {renderAccordionPanel(
          "transforms",
          <Settings2 size={15} />,
          "Transforms",
          <Box sx={{ display: "grid", gap: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: "0.95rem", color: "#111827" }}>
                Opacity
              </Typography>
              <Box
                sx={{
                  minHeight: 40,
                  px: 1.1,
                  display: "flex",
                  alignItems: "center",
                  borderRadius: 2,
                  border: "1px solid rgba(226,232,240,0.95)",
                  backgroundColor: "#f3f4f6",
                }}
              >
                <TextField
                  size="small"
                  disabled={effectiveDisabled}
                  value={String(
                    Math.round(
                      (typeof resolvedValue.opacity === "number"
                        ? resolvedValue.opacity
                        : 1) * 100,
                    ),
                  )}
                  onChange={(event) => {
                    const nextValue = Math.max(
                      0,
                      Math.min(
                        100,
                        Number(event.target.value.replace(/[^\d]/g, "")) || 0,
                      ),
                    );
                    onStyleChange({ opacity: nextValue / 100 });
                  }}
                  sx={{
                    width: "100%",
                    "& .MuiOutlinedInput-root": {
                      height: 28,
                      borderRadius: 0,
                      backgroundColor: "transparent",
                      "& fieldset": { border: "none" },
                    },
                    "& .MuiInputBase-input": {
                      px: 0,
                      py: 0,
                      fontSize: "0.94rem",
                      fontWeight: 500,
                      color: "#111827",
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: "0.86rem",
                    fontWeight: 500,
                    color: "#6b7280",
                    right: "1.4em",
                    position: "relative",
                  }}
                >
                  %
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                alignItems: "center",
                gap: 1,
              }}
            >
              <Typography sx={{ fontSize: "0.95rem", color: "#111827" }}>
                Rotate
              </Typography>
              {renderTransformValueField(
                resolvedValue.rotate,
                "deg",
                (nextValue) =>
                  updateTransformStyle({ rotate: nextValue || "0deg" }),
              )}
            </Box>
          </Box>,
        )}

        {renderAccordionPanel(
          "advanced",
          <Settings2 size={15} />,
          "Advanced",
          <Box sx={{ display: "grid", gap: 1 }}>
            <TextField
              size="small"
              disabled={effectiveDisabled}
              label="URL"
              placeholder="https://example.com"
              value={linkValue}
              onChange={(event) => setLinkValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handleApplyLink();
                }
              }}
              sx={{
                "& .MuiInputLabel-root": {
                  color: "#64748b",
                  fontWeight: 600,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#475569",
                },
                "& .MuiOutlinedInput-root": {
                  minHeight: 40,
                  borderRadius: 2,
                  backgroundColor: "#fff",
                  color: "#111827",
                  "& fieldset": {
                    borderColor: "rgba(203,213,225,0.95)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(148,163,184,0.95)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#94a3b8",
                  },
                },
                "& .MuiInputBase-input": {
                  color: "#111827",
                  fontSize: "0.84rem",
                  fontWeight: 500,
                },
                "& .MuiInputBase-input::placeholder": {
                  color: "#94a3b8",
                  opacity: 1,
                },
              }}
            />
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0.8 }}
            >
              <ButtonBase
                disabled={
                  effectiveDisabled || (!resolvedValue.href && !linkValue)
                }
                onClick={handleRemoveLink}
                sx={{
                  minHeight: "  38px !important",
                  borderRadius: 2,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#ef4444",
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.12)",
                }}
              >
                Remove
              </ButtonBase>
              <ButtonBase
                disabled={effectiveDisabled}
                onClick={handleApplyLink}
                sx={{
                  minHeight: "    38px !important",
                  borderRadius: 2,
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: "#ffffff",
                  backgroundColor: "#111827",
                }}
              >
                Apply
              </ButtonBase>
            </Box>
          </Box>,
        )}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.1,
        px: { xs: 1.15, sm: 1.6 },
        py: 1.1,
        borderRadius: 4,
        border: "1px solid rgba(148,163,184,0.16)",
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.96) 100%)",
        boxShadow:
          "0 14px 28px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.92)",
        overflowX: "auto",
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
        sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}
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
          {selection ? `Editing: ${selection.label}` : "Select text on canvas"}
        </Typography>
      </Box>

      <Divider flexItem orientation="vertical" />

      <FormControl size="small" sx={{ minWidth: 152, flexShrink: 0 }}>
        <Select
          value={resolvedValue.fontFamily || FONT_OPTIONS[0].value}
          disabled={effectiveDisabled}
          onChange={(event) =>
            onStyleChange({ fontFamily: event.target.value })
          }
          displayEmpty
          sx={{ height: 36, borderRadius: 2, backgroundColor: "#fff" }}
        >
          {FONT_OPTIONS.map((font) => (
            <MenuItem key={font.value} value={font.value}>
              {font.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 84, flexShrink: 0 }}>
        <Select
          value={resolvedValue.fontSize || "16px"}
          disabled={effectiveDisabled}
          onChange={(event) => onStyleChange({ fontSize: event.target.value })}
          sx={{ height: 36, borderRadius: 2, backgroundColor: "#fff" }}
        >
          {SIZE_OPTIONS.map((size) => (
            <MenuItem key={size} value={size}>
              {size.replace("px", "")}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <ButtonBase
        disabled={effectiveDisabled}
        onClick={handleColorButtonClick}
        sx={{
          height: 36,
          px: 1,
          gap: 0.8,
          borderRadius: 2,
          border: "1px solid rgba(15,23,42,0.08)",
          backgroundColor: "#fff",
          flexShrink: 0,
        }}
      >
        <Type size={14} />
        <Box
          sx={{
            width: 28,
            height: 14,
            borderRadius: 999,
            border: "1px solid rgba(15,23,42,0.14)",
            background:
              resolvedColor === "transparent"
                ? "linear-gradient(135deg, transparent 46%, #ef4444 47%, #ef4444 53%, transparent 54%), #ffffff"
                : resolvedColor,
          }}
        />
      </ButtonBase>

      <Popover
        open={colorPickerOpen}
        anchorEl={colorAnchorEl}
        onClose={handleColorClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 292,
            p: 1.6,
            borderRadius: 4,
            border: "1px solid rgba(148,163,184,0.16)",
            boxShadow: "0 26px 60px rgba(15,23,42,0.16)",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography
            sx={{ fontSize: "1rem", fontWeight: 700, color: "#111827" }}
          >
            Text color
          </Typography>

          <Box
            sx={{
              px: 1,
              py: 0.35,
              borderRadius: 999,
              bgcolor: "rgba(15,23,42,0.05)",
              fontSize: "0.72rem",
              color: "#475569",
              fontFamily: "monospace",
            }}
          >
            {resolvedColor === "transparent"
              ? "NONE"
              : resolvedColor.toUpperCase()}
          </Box>
        </Box>

        <Tabs
          value={colorTab}
          onChange={(_, nextValue) => setColorTab(nextValue)}
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
          <Tab value="brand" label="Brand" />
          <Tab value="custom" label="Custom" />
        </Tabs>

        {colorTab === "brand" ? (
          <Box>
            <Typography
              sx={{
                mb: 1,
                fontSize: "0.78rem",
                color: "#475569",
                fontWeight: 600,
              }}
            >
              Quick palette
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 1,
              }}
            >
              {BRAND_COLOR_SWATCHES.map((swatch) => {
                const isActive = resolvedColor === swatch;

                return (
                  <ButtonBase
                    key={swatch}
                    onClick={() => onStyleChange({ color: swatch })}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: "50%",
                      border: isActive
                        ? "2px solid rgba(15,23,42,0.9)"
                        : "1px solid rgba(15,23,42,0.12)",
                      background:
                        swatch === "transparent"
                          ? "linear-gradient(135deg, transparent 46%, #ef4444 47%, #ef4444 53%, transparent 54%), #ffffff"
                          : swatch,
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
            <Box
              sx={{
                position: "relative",
                height: 136,
                borderRadius: 2.5,
                overflow: "hidden",
                border: "1px solid rgba(15,23,42,0.08)",
                background: `linear-gradient(180deg, #ffffff 0%, ${
                  resolvedColor === "transparent" ? "#111827" : resolvedColor
                } 100%)`,
                mb: 1.2,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(90deg, #000000 0%, transparent 100%)",
                  mixBlendMode: "multiply",
                }}
              />

              <Box
                sx={{
                  position: "absolute",
                  left: `${(rgb.r / 255) * 100}%`,
                  top: `${100 - (rgb.b / 255) * 100}%`,
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  boxShadow: "0 0 0 1px rgba(15,23,42,0.35)",
                  transform: "translate(-50%, -50%)",
                }}
              />

              <input
                type="color"
                value={
                  resolvedColor === "transparent"
                    ? "#111827"
                    : resolvedColor.slice(0, 7)
                }
                onChange={(event) =>
                  onStyleChange({ color: event.target.value })
                }
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: "pointer",
                }}
              />
            </Box>

            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.2 }}
            >
              <Pipette size={14} color="#475569" />

              <Slider
                value={Math.round((rgb.r / 255) * 100)}
                onChange={(_, nextValue) => {
                  const value = Array.isArray(nextValue)
                    ? nextValue[0]
                    : nextValue;
                  handleRgbChange("r", String(Math.round(value * 2.55)));
                }}
                sx={{
                  color:
                    resolvedColor === "transparent" ? "#111827" : resolvedColor,
                  "& .MuiSlider-rail": {
                    opacity: 1,
                    background:
                      "linear-gradient(90deg, #ff0040 0%, #5b7cfa 30%, #00c853 65%, #ffb300 85%, #ff5a00 100%)",
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: 1,
              }}
            >
              {(["r", "g", "b"] as const).map((channel) => (
                <TextField
                  key={channel}
                  size="small"
                  value={rgb[channel]}
                  onChange={(event) =>
                    handleRgbChange(channel, event.target.value)
                  }
                  inputProps={{
                    inputMode: "numeric",
                    min: 0,
                    max: 255,
                    style: { textAlign: "center" },
                  }}
                  label={channel.toUpperCase()}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              ))}
            </Box>
          </Box>
        )}
      </Popover>

      <Divider flexItem orientation="vertical" />

      <Tooltip title="Bold">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction("bold")}
            sx={actionButtonSx(
              String(resolvedValue.fontWeight || "400") === "700",
              effectiveDisabled,
            )}
          >
            <Bold size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Italic">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction("italic")}
            sx={actionButtonSx(
              resolvedValue.fontStyle === "italic",
              effectiveDisabled,
            )}
          >
            <Italic size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Underline">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction("underline")}
            sx={actionButtonSx(
              hasDecoration(resolvedValue.textDecoration, "underline"),
              effectiveDisabled,
            )}
          >
            <Underline size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Strikethrough">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction("strikethrough")}
            sx={actionButtonSx(
              hasDecoration(resolvedValue.textDecoration, "line-through"),
              effectiveDisabled,
            )}
          >
            <Strikethrough size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Divider flexItem orientation="vertical" />

      <Tooltip title="Align left">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction("align-left")}
            sx={actionButtonSx(
              (resolvedValue.textAlign || "left") === "left",
              effectiveDisabled,
            )}
          >
            <AlignLeft size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Align center">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction("align-center")}
            sx={actionButtonSx(
              resolvedValue.textAlign === "center",
              effectiveDisabled,
            )}
          >
            <AlignCenter size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title="Align right">
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={() => handleAction("align-right")}
            sx={actionButtonSx(
              resolvedValue.textAlign === "right",
              effectiveDisabled,
            )}
          >
            <AlignRight size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Divider flexItem orientation="vertical" />

      <Tooltip title={resolvedValue.href ? "Edit link" : "Add link"}>
        <span>
          <IconButton
            size="small"
            disabled={effectiveDisabled}
            onClick={handleLinkButtonClick}
            sx={actionButtonSx(Boolean(resolvedValue.href), effectiveDisabled)}
          >
            <Link2 size={15} />
          </IconButton>
        </span>
      </Tooltip>

      <Popover
        open={linkPopoverOpen}
        anchorEl={linkAnchorEl}
        onClose={handleLinkClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        PaperProps={{
          sx: {
            mt: 1,
            width: 320,
            p: 1.6,
            borderRadius: 4,
            border: "1px solid rgba(148,163,184,0.16)",
            boxShadow: "0 26px 60px rgba(15,23,42,0.16)",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
          },
        }}
      >
        <Typography
          sx={{ fontSize: "1rem", fontWeight: 700, color: "#111827", mb: 1 }}
        >
          {resolvedValue.href ? "Edit link" : "Add link"}
        </Typography>

        <TextField
          fullWidth
          size="small"
          label="URL"
          placeholder="https://example.com"
          value={linkValue}
          onChange={(event) => setLinkValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleApplyLink();
            }
          }}
          sx={{
            mb: 1.5,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              backgroundColor: "#fff",
            },
          }}
        />

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <ButtonBase
            onClick={handleRemoveLink}
            disabled={!resolvedValue.href && !linkValue}
            sx={{
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#ef4444",
              backgroundColor: "rgba(239,68,68,0.08)",
              opacity: !resolvedValue.href && !linkValue ? 0.5 : 1,
            }}
          >
            Remove
          </ButtonBase>

          <ButtonBase
            onClick={handleApplyLink}
            sx={{
              px: 1.5,
              py: 0.8,
              borderRadius: 2,
              fontSize: "0.85rem",
              fontWeight: 700,
              color: "#ffffff",
              backgroundColor: "#111827",
            }}
          >
            Apply link
          </ButtonBase>
        </Box>
      </Popover>
    </Box>
  );
};

export default EditorStyleToolbar;
