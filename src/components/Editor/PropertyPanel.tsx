/**
 * PropertyPanel — Step 9.14.2 + Step 9.15
 *
 * Slide-in side panel for quick-editing selected block properties.
 * Slides in from the right (width: 320px) when open=true.
 * Contains: block type header, close button, quick-edit fields based on blockType,
 * visibility toggle, position controls (9.15.1), alignment/size controls (9.15.2),
 * spacing controls & layout presets (9.15.3). Escape key closes the panel.
 */
import React, { useCallback, useEffect, useMemo } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import NativeSelect from "@mui/material/NativeSelect";
import Divider from "@mui/material/Divider";
import { AnimatePresence, motion } from "framer-motion";
import {
  X,
  ChevronUp,
  ChevronDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PropertyBlockInfo {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
  /** Block-level visibility flag (lives outside content) */
  isVisible?: boolean;
}

interface PropertyPanelProps {
  open: boolean;
  selectedBlock: PropertyBlockInfo | null;
  onClose: () => void;
  onChange?: (blockId: string, content: Record<string, unknown>) => void;
  /** Separate callback for toggling block-level visibility (not stored in content) */
  onToggleVisibility?: (blockId: string, isVisible: boolean) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  blockIndex?: number;
  totalBlocks?: number;
  colors: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

interface FieldConfig {
  key: string;
  label: string;
  multiline?: boolean;
}

const BLOCK_FIELDS: Record<string, FieldConfig[]> = {
  HERO: [
    { key: "heading", label: "Heading" },
    { key: "subheading", label: "Subheading" },
    { key: "ctaText", label: "CTA Text" },
  ],
  CTA: [
    { key: "heading", label: "Heading" },
    { key: "subheading", label: "Subheading" },
    { key: "ctaText", label: "CTA Text" },
  ],
  TEXT: [
    { key: "heading", label: "Heading" },
    { key: "body", label: "Body", multiline: true },
  ],
  IMAGE: [
    { key: "image", label: "Image URL" },
    { key: "alt", label: "Alt Text" },
  ],
  CONTACT: [{ key: "heading", label: "Heading" }],
  FEATURES: [{ key: "heading", label: "Heading" }],
  NAVBAR: [{ key: "brandName", label: "Brand Name" }],
  FOOTER: [{ key: "copyright", label: "Copyright" }],
};

/** Height preset options (UI-only, maps to inline style) */
const HEIGHT_OPTIONS = [
  { value: "auto", label: "Auto" },
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "full", label: "Full" },
] as const;

/** Spacing enum options matching schema */
const SPACING_OPTIONS = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
  { value: "xl", label: "XL" },
] as const;

/** Layout presets — quick-apply spacing configurations */
const LAYOUT_PRESETS = {
  compact: {
    label: "Compact",
    spacingPaddingTop: "sm",
    spacingPaddingBottom: "sm",
    spacingMarginTop: "none",
    spacingMarginBottom: "none",
  },
  standard: {
    label: "Standard",
    spacingPaddingTop: "md",
    spacingPaddingBottom: "md",
    spacingMarginTop: "md",
    spacingMarginBottom: "md",
  },
  spacious: {
    label: "Spacious",
    spacingPaddingTop: "xl",
    spacingPaddingBottom: "xl",
    spacingMarginTop: "lg",
    spacingMarginBottom: "lg",
  },
} as const;

type PresetKey = keyof typeof LAYOUT_PRESETS;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Section label styled consistently */
const SectionLabel = React.memo(function SectionLabel({
  children,
  color,
}: {
  children: React.ReactNode;
  color: string;
}) {
  return (
    <Typography
      variant="caption"
      sx={{
        color,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        mb: 0.5,
      }}
    >
      {children}
    </Typography>
  );
});

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const PropertyPanel = React.memo(function PropertyPanel({
  open,
  selectedBlock,
  onClose,
  onChange,
  onToggleVisibility,
  onMoveUp,
  onMoveDown,
  blockIndex = 0,
  totalBlocks = 0,
  colors,
}: PropertyPanelProps) {
  // Escape key handler — only active when panel is open
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Field change handler
  const handleFieldChange = useCallback(
    (fieldKey: string, value: string) => {
      if (!selectedBlock || !onChange) return;
      onChange(selectedBlock.id, { [fieldKey]: value });
    },
    [selectedBlock, onChange],
  );

  // Visibility toggle handler — updates block-level isVisible, not content
  const handleVisibilityChange = useCallback(
    (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
      if (!selectedBlock) return;
      onToggleVisibility?.(selectedBlock.id, checked);
    },
    [selectedBlock, onToggleVisibility],
  );

  // Alignment handler
  const handleAlignmentChange = useCallback(
    (_: React.MouseEvent<HTMLElement>, newAlignment: string | null) => {
      if (!selectedBlock || !onChange || !newAlignment) return;
      onChange(selectedBlock.id, { alignment: newAlignment });
    },
    [selectedBlock, onChange],
  );

  // Height preset handler
  const handleHeightChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!selectedBlock || !onChange) return;
      onChange(selectedBlock.id, { heightPreset: e.target.value });
    },
    [selectedBlock, onChange],
  );

  // Spacing field handler
  const handleSpacingChange = useCallback(
    (fieldKey: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!selectedBlock || !onChange) return;
      onChange(selectedBlock.id, { [fieldKey]: e.target.value });
    },
    [selectedBlock, onChange],
  );

  // Layout preset handler
  const handlePresetClick = useCallback(
    (presetKey: PresetKey) => {
      if (!selectedBlock || !onChange) return;
      const preset = LAYOUT_PRESETS[presetKey];
      onChange(selectedBlock.id, {
        spacingPaddingTop: preset.spacingPaddingTop,
        spacingPaddingBottom: preset.spacingPaddingBottom,
        spacingMarginTop: preset.spacingMarginTop,
        spacingMarginBottom: preset.spacingMarginBottom,
      });
    },
    [selectedBlock, onChange],
  );

  // Detect active preset
  const activePreset = useMemo<PresetKey | null>(() => {
    if (!selectedBlock) return null;
    const c = selectedBlock.content;
    const pt = (c.spacingPaddingTop as string) || "md";
    const pb = (c.spacingPaddingBottom as string) || "md";
    const mt = (c.spacingMarginTop as string) || "md";
    const mb = (c.spacingMarginBottom as string) || "md";

    for (const [key, preset] of Object.entries(LAYOUT_PRESETS)) {
      if (
        pt === preset.spacingPaddingTop &&
        pb === preset.spacingPaddingBottom &&
        mt === preset.spacingMarginTop &&
        mb === preset.spacingMarginBottom
      ) {
        return key as PresetKey;
      }
    }
    return null;
  }, [selectedBlock]);

  const fields = selectedBlock
    ? BLOCK_FIELDS[selectedBlock.blockType] || []
    : [];
  const currentAlignment = selectedBlock
    ? (selectedBlock.content.alignment as string) || "center"
    : "center";
  const currentHeight = selectedBlock
    ? (selectedBlock.content.heightPreset as string) || "auto"
    : "auto";

  // Common styling for native selects (dark theme)
  const selectSx = {
    color: colors.text || "#F5F5F5",
    fontSize: "0.8rem",
    "&::before": { borderColor: colors.border || "rgba(55,140,146,0.15)" },
    "&::after": { borderColor: colors.primary || "#378C92" },
    "& option": { backgroundColor: colors.panelBg || "#121517" },
  };

  return (
    <AnimatePresence>
      {open && selectedBlock && (
        <motion.div
          key="property-panel"
          initial={{ x: 320, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 320, opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            bottom: 0,
            width: 320,
            zIndex: 1300,
          }}
        >
          <Box
            data-testid="property-panel"
            sx={{
              height: "100%",
              backgroundColor: colors.panelBg || "#121517",
              borderLeft: `1px solid ${colors.border || "rgba(55,140,146,0.15)"}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                px: 2,
                py: 1.5,
                borderBottom: `1px solid ${colors.border || "rgba(55,140,146,0.15)"}`,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.text || "#F5F5F5", fontWeight: 600 }}
                >
                  Properties
                </Typography>
                <Chip
                  label={selectedBlock.blockType}
                  size="small"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.65rem",
                    backgroundColor: "rgba(25, 118, 210, 0.15)",
                    color: "#1976d2",
                  }}
                />
              </Box>
              <IconButton
                size="small"
                onClick={onClose}
                aria-label="Close property panel"
                sx={{ color: colors.textSecondary || "#9FA6AE" }}
              >
                <X size={16} />
              </IconButton>
            </Box>

            {/* Scrollable Content */}
            <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 2 }}>
              <Stack spacing={2}>
                {/* ============================================================ */}
                {/*  Step 9.15.1 — Position Controls                             */}
                {/* ============================================================ */}
                {totalBlocks > 0 && (
                  <>
                    <SectionLabel color={colors.textSecondary || "#9FA6AE"}>
                      Position
                    </SectionLabel>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: colors.text || "#F5F5F5",
                          fontSize: "0.85rem",
                        }}
                      >
                        Block {blockIndex + 1} of {totalBlocks}
                      </Typography>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title="Move Up (Ctrl+Arrow Up)" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={onMoveUp}
                              disabled={blockIndex <= 0}
                              aria-label="Move block up"
                              title="Move Up (Ctrl+Arrow Up)"
                              sx={{
                                color: colors.textSecondary || "#9FA6AE",
                                "&:hover": { color: colors.text || "#F5F5F5" },
                                "&.Mui-disabled": {
                                  color: "rgba(159,166,174,0.3)",
                                },
                              }}
                            >
                              <ChevronUp size={16} />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title="Move Down (Ctrl+Arrow Down)" arrow>
                          <span>
                            <IconButton
                              size="small"
                              onClick={onMoveDown}
                              disabled={blockIndex >= totalBlocks - 1}
                              aria-label="Move block down"
                              title="Move Down (Ctrl+Arrow Down)"
                              sx={{
                                color: colors.textSecondary || "#9FA6AE",
                                "&:hover": { color: colors.text || "#F5F5F5" },
                                "&.Mui-disabled": {
                                  color: "rgba(159,166,174,0.3)",
                                },
                              }}
                            >
                              <ChevronDown size={16} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>
                    <Divider
                      sx={{
                        borderColor: colors.border || "rgba(55,140,146,0.15)",
                      }}
                    />
                  </>
                )}

                {/* ============================================================ */}
                {/*  Step 9.15.2 — Alignment Controls                            */}
                {/* ============================================================ */}
                <SectionLabel color={colors.textSecondary || "#9FA6AE"}>
                  Alignment
                </SectionLabel>
                <ToggleButtonGroup
                  value={currentAlignment}
                  exclusive
                  onChange={handleAlignmentChange}
                  size="small"
                  sx={{
                    "& .MuiToggleButton-root": {
                      color: colors.textSecondary || "#9FA6AE",
                      borderColor: colors.border || "rgba(55,140,146,0.15)",
                      px: 1.5,
                      py: 0.5,
                      "&.Mui-selected": {
                        backgroundColor: "rgba(25, 118, 210, 0.2)",
                        color: "#1976d2",
                      },
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.1)",
                      },
                    },
                  }}
                >
                  <ToggleButton value="left" aria-label="Align left">
                    <AlignLeft size={16} />
                  </ToggleButton>
                  <ToggleButton value="center" aria-label="Align center">
                    <AlignCenter size={16} />
                  </ToggleButton>
                  <ToggleButton value="right" aria-label="Align right">
                    <AlignRight size={16} />
                  </ToggleButton>
                </ToggleButtonGroup>

                {/* ============================================================ */}
                {/*  Step 9.15.2 — Size / Height Controls                        */}
                {/* ============================================================ */}
                <SectionLabel color={colors.textSecondary || "#9FA6AE"}>
                  Height
                </SectionLabel>
                <NativeSelect
                  value={currentHeight}
                  onChange={handleHeightChange}
                  inputProps={{ "aria-label": "Height" }}
                  sx={selectSx}
                >
                  {HEIGHT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </NativeSelect>

                <Divider
                  sx={{ borderColor: colors.border || "rgba(55,140,146,0.15)" }}
                />

                {/* ============================================================ */}
                {/*  Original Fields                                             */}
                {/* ============================================================ */}
                {fields.length > 0 && (
                  <SectionLabel color={colors.textSecondary || "#9FA6AE"}>
                    Content
                  </SectionLabel>
                )}
                {fields.map((field) => (
                  <TextField
                    key={field.key}
                    label={field.label}
                    value={String(selectedBlock.content[field.key] ?? "")}
                    onChange={(e) =>
                      handleFieldChange(field.key, e.target.value)
                    }
                    size="small"
                    fullWidth
                    multiline={field.multiline}
                    rows={field.multiline ? 3 : undefined}
                    inputProps={{ "aria-label": field.label }}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      "& .MuiInputBase-root": {
                        color: colors.text || "#F5F5F5",
                        fontSize: "0.85rem",
                      },
                      "& .MuiInputLabel-root": {
                        color: colors.textSecondary || "#9FA6AE",
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        borderColor: colors.border || "rgba(55,140,146,0.15)",
                      },
                    }}
                  />
                ))}

                {/* Visibility toggle — shown for all block types */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={selectedBlock.isVisible !== false}
                      onChange={handleVisibilityChange}
                      size="small"
                      inputProps={{ "aria-label": "Visible" }}
                    />
                  }
                  label={
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.text || "#F5F5F5",
                        fontSize: "0.85rem",
                      }}
                    >
                      Visible
                    </Typography>
                  }
                />

                <Divider
                  sx={{ borderColor: colors.border || "rgba(55,140,146,0.15)" }}
                />

                {/* ============================================================ */}
                {/*  Step 9.15.3 — Spacing Controls                              */}
                {/* ============================================================ */}
                <SectionLabel color={colors.textSecondary || "#9FA6AE"}>
                  Spacing
                </SectionLabel>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 1.5,
                  }}
                >
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.textSecondary || "#9FA6AE",
                        mb: 0.5,
                        display: "block",
                      }}
                    >
                      Padding Top
                    </Typography>
                    <NativeSelect
                      value={
                        (selectedBlock.content.spacingPaddingTop as string) ||
                        "md"
                      }
                      onChange={handleSpacingChange("spacingPaddingTop")}
                      inputProps={{ "aria-label": "Padding Top" }}
                      fullWidth
                      sx={selectSx}
                    >
                      {SPACING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.textSecondary || "#9FA6AE",
                        mb: 0.5,
                        display: "block",
                      }}
                    >
                      Padding Bottom
                    </Typography>
                    <NativeSelect
                      value={
                        (selectedBlock.content
                          .spacingPaddingBottom as string) || "md"
                      }
                      onChange={handleSpacingChange("spacingPaddingBottom")}
                      inputProps={{ "aria-label": "Padding Bottom" }}
                      fullWidth
                      sx={selectSx}
                    >
                      {SPACING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.textSecondary || "#9FA6AE",
                        mb: 0.5,
                        display: "block",
                      }}
                    >
                      Margin Top
                    </Typography>
                    <NativeSelect
                      value={
                        (selectedBlock.content.spacingMarginTop as string) ||
                        "md"
                      }
                      onChange={handleSpacingChange("spacingMarginTop")}
                      inputProps={{ "aria-label": "Margin Top" }}
                      fullWidth
                      sx={selectSx}
                    >
                      {SPACING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </Box>
                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: colors.textSecondary || "#9FA6AE",
                        mb: 0.5,
                        display: "block",
                      }}
                    >
                      Margin Bottom
                    </Typography>
                    <NativeSelect
                      value={
                        (selectedBlock.content.spacingMarginBottom as string) ||
                        "md"
                      }
                      onChange={handleSpacingChange("spacingMarginBottom")}
                      inputProps={{ "aria-label": "Margin Bottom" }}
                      fullWidth
                      sx={selectSx}
                    >
                      {SPACING_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </NativeSelect>
                  </Box>
                </Box>

                {/* ============================================================ */}
                {/*  Step 9.15.3 — Layout Presets                                */}
                {/* ============================================================ */}
                <SectionLabel color={colors.textSecondary || "#9FA6AE"}>
                  Layout Presets
                </SectionLabel>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {(Object.keys(LAYOUT_PRESETS) as PresetKey[]).map((key) => {
                    const preset = LAYOUT_PRESETS[key];
                    const isActive = activePreset === key;
                    return (
                      <Button
                        key={key}
                        size="small"
                        variant={isActive ? "contained" : "outlined"}
                        data-active={isActive ? "true" : "false"}
                        onClick={() => handlePresetClick(key)}
                        sx={{
                          flex: 1,
                          fontSize: "0.7rem",
                          textTransform: "none",
                          color: isActive
                            ? "#fff"
                            : colors.textSecondary || "#9FA6AE",
                          borderColor: isActive
                            ? colors.primary || "#378C92"
                            : colors.border || "rgba(55,140,146,0.15)",
                          backgroundColor: isActive
                            ? colors.primary || "#378C92"
                            : "transparent",
                          "&:hover": {
                            borderColor: colors.primary || "#378C92",
                            backgroundColor: isActive
                              ? colors.primary || "#378C92"
                              : "rgba(55,140,146,0.1)",
                          },
                        }}
                      >
                        {preset.label}
                      </Button>
                    );
                  })}
                </Box>
              </Stack>
            </Box>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default PropertyPanel;
