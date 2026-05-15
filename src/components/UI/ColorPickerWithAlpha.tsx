import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Slider,
  Typography,
  Stack,
  alpha,
} from "@mui/material";

interface ColorPickerWithAlphaProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  error?: string;
  helperText?: string;
  showAlpha?: boolean;
  disabled?: boolean;
}

const PRESET_SWATCHES = [
  "#0f172a",
  "#1d4ed8",
  "#0f766e",
  "#ea580c",
  "#dc2626",
  "#7c3aed",
  "#f59e0b",
  "#f8fafc",
];

/**
 * Converts hex color to RGBA
 */
const hexToRgba = (
  hex: string,
): { r: number; g: number; b: number; a: number } => {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  let r = 0,
    g = 0,
    b = 0,
    a = 1;

  if (hex.length === 3) {
    // #RGB
    r = parseInt(hex[0] + hex[0], 16);
    g = parseInt(hex[1] + hex[1], 16);
    b = parseInt(hex[2] + hex[2], 16);
  } else if (hex.length === 6) {
    // #RRGGBB
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else if (hex.length === 8) {
    // #RRGGBBAA
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
    a = parseInt(hex.substring(6, 8), 16) / 255;
  }

  return { r, g, b, a };
};

/**
 * Converts RGBA to hex
 */
const rgbaToHex = (r: number, g: number, b: number, a: number): string => {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  const hex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;

  if (a < 1) {
    return hex + toHex(a * 255);
  }

  return hex;
};

/**
 * Validates hex color format
 */
const isValidHexColor = (color: string): boolean => {
  return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
};

export const ColorPickerWithAlpha: React.FC<ColorPickerWithAlphaProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  showAlpha = true,
  disabled = false,
}) => {
  const [hexValue, setHexValue] = useState(value);
  const [rgba, setRgba] = useState(hexToRgba(value));
  const [inputError, setInputError] = useState<string>("");

  useEffect(() => {
    if (isValidHexColor(value)) {
      setHexValue(value);
      setRgba(hexToRgba(value));
      setInputError("");
    }
  }, [value]);

  const handleHexChange = (newHex: string) => {
    setHexValue(newHex);

    if (isValidHexColor(newHex)) {
      setInputError("");
      setRgba(hexToRgba(newHex));
      onChange(newHex);
    } else if (newHex.startsWith("#")) {
      setInputError("Invalid hex color format");
    }
  };

  const handleAlphaChange = (_: Event, newAlpha: number | number[]) => {
    const alphaValue = Array.isArray(newAlpha) ? newAlpha[0] : newAlpha;
    const newRgba = { ...rgba, a: alphaValue };
    setRgba(newRgba);

    const newHex = rgbaToHex(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
    setHexValue(newHex);
    onChange(newHex);
  };

  const handleColorPickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    const newRgba = hexToRgba(newColor);

    // Preserve existing alpha if showAlpha is true
    if (showAlpha) {
      newRgba.a = rgba.a;
    }

    setRgba(newRgba);
    const newHex = rgbaToHex(newRgba.r, newRgba.g, newRgba.b, newRgba.a);
    setHexValue(newHex);
    onChange(newHex);
  };

  // Get the base color without alpha for the native color picker
  const baseColor = `#${rgba.r.toString(16).padStart(2, "0")}${rgba.g.toString(16).padStart(2, "0")}${rgba.b.toString(16).padStart(2, "0")}`;
  const previewColor = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;

  const applyPreset = (preset: string) => {
    if (disabled) return;
    const nextRgba = hexToRgba(preset);
    if (showAlpha) {
      nextRgba.a = rgba.a;
    }
    setRgba(nextRgba);
    const nextHex = rgbaToHex(nextRgba.r, nextRgba.g, nextRgba.b, nextRgba.a);
    setHexValue(nextHex);
    setInputError("");
    onChange(nextHex);
  };

  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 1.5,
        borderRadius: 3,
        border: `1px solid ${alpha("#0f172a", 0.08)}`,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%)",
        boxShadow: "0 18px 40px rgba(15,23,42,0.08)",
      }}
    >
      {label && (
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}
        >
          {label}
        </Typography>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "104px minmax(0, 1fr)" },
          gap: 1.5,
          alignItems: "stretch",
        }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: 104,
            borderRadius: 3,
            overflow: "hidden",
            border: `1px solid ${alpha("#0f172a", 0.1)}`,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
            backgroundColor: "#fff",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: `
                linear-gradient(45deg, ${alpha("#000", 0.1)} 25%, transparent 25%),
                linear-gradient(-45deg, ${alpha("#000", 0.1)} 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, ${alpha("#000", 0.1)} 75%),
                linear-gradient(-45deg, transparent 75%, ${alpha("#000", 0.1)} 75%)
              `,
              backgroundSize: "10px 10px",
              backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: previewColor,
            }}
          />

          <Box
            sx={{
              position: "absolute",
              insetInline: 10,
              bottom: 10,
              px: 1,
              py: 0.7,
              borderRadius: 2,
              bgcolor: alpha("#ffffff", 0.82),
              backdropFilter: "blur(12px)",
              border: `1px solid ${alpha("#0f172a", 0.08)}`,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#475569",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              Live tone
            </Typography>
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 700,
                color: "#0f172a",
                fontFamily: "monospace",
              }}
            >
              {hexValue || "#000000"}
            </Typography>
          </Box>

          <input
            type="color"
            value={baseColor}
            onChange={handleColorPickerChange}
            disabled={disabled}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              opacity: 0,
              cursor: disabled ? "not-allowed" : "pointer",
            }}
          />
        </Box>

        <Stack spacing={1.25}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              gap: 1,
            }}
          >
            {PRESET_SWATCHES.map((preset) => {
              const isActive = baseColor.toLowerCase() === preset.toLowerCase();
              return (
                <Box
                  key={preset}
                  component="button"
                  type="button"
                  onClick={() => applyPreset(preset)}
                  disabled={disabled}
                  aria-label={`Choose ${preset} color`}
                  sx={{
                    height: 34,
                    borderRadius: "12px",
                    border: isActive
                      ? `2px solid ${alpha("#0f172a", 0.9)}`
                      : `1px solid ${alpha("#0f172a", 0.12)}`,
                    bgcolor: preset,
                    cursor: disabled ? "not-allowed" : "pointer",
                    boxShadow: isActive
                      ? `0 0 0 3px ${alpha(preset === "#f8fafc" ? "#0f172a" : preset, 0.15)}`
                      : "none",
                    transition:
                      "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease",
                    "&:hover": disabled
                      ? {}
                      : { transform: "translateY(-1px)" },
                  }}
                />
              );
            })}
          </Box>

          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <TextField
              size="small"
              value={hexValue}
              onChange={(e) => handleHexChange(e.target.value)}
              error={!!(error || inputError)}
              helperText={error || inputError || helperText}
              placeholder="#RRGGBBAA"
              disabled={disabled}
              sx={{
                flex: 1,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  backgroundColor: alpha("#ffffff", 0.9),
                },
              }}
              inputProps={{
                style: { fontFamily: "monospace", textTransform: "uppercase" },
              }}
            />

            <Box
              sx={{
                position: "relative",
                width: 44,
                height: 44,
                borderRadius: "14px",
                overflow: "hidden",
                border: `1px solid ${alpha("#0f172a", 0.12)}`,
                backgroundColor: "#fff",
                flexShrink: 0,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: baseColor,
                }}
              />
              <input
                type="color"
                value={baseColor}
                onChange={handleColorPickerChange}
                disabled={disabled}
                aria-label="Open color chooser"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0,
                  cursor: disabled ? "not-allowed" : "pointer",
                }}
              />
            </Box>
          </Box>
        </Stack>
      </Box>

      {showAlpha && (
        <Box sx={{ pt: 0.25 }}>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.8 }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#475569", fontWeight: 600 }}
            >
              Opacity
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "#0f172a",
                fontFamily: "monospace",
                fontWeight: 700,
              }}
            >
              {Math.round(rgba.a * 100)}%
            </Typography>
          </Box>

          <Slider
            value={rgba.a}
            onChange={handleAlphaChange}
            min={0}
            max={1}
            step={0.01}
            disabled={disabled}
            sx={{
              px: 0.5,
              "& .MuiSlider-track": {
                border: "none",
                background: `linear-gradient(90deg, ${alpha(baseColor, 0.08)} 0%, ${baseColor} 100%)`,
                height: 8,
              },
              "& .MuiSlider-rail": {
                opacity: 1,
                height: 8,
                borderRadius: 999,
                backgroundImage: `
                  linear-gradient(45deg, ${alpha("#000", 0.1)} 25%, transparent 25%),
                  linear-gradient(-45deg, ${alpha("#000", 0.1)} 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, ${alpha("#000", 0.1)} 75%),
                  linear-gradient(-45deg, transparent 75%, ${alpha("#000", 0.1)} 75%)
                `,
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
              },
              "& .MuiSlider-thumb": {
                width: 18,
                height: 18,
                boxShadow: "0 4px 14px rgba(15,23,42,0.18)",
                backgroundColor: "#ffffff",
                border: `2px solid ${baseColor}`,
              },
            }}
          />
        </Box>
      )}

      <Box
        sx={{
          display: "flex",
          gap: 1,
          flexWrap: "wrap",
          alignItems: "center",
          pt: 0.25,
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 1,
            py: 0.45,
            borderRadius: 999,
            bgcolor: alpha("#0f172a", 0.04),
            color: "#475569",
            fontFamily: "monospace",
          }}
        >
          rgb({rgba.r}, {rgba.g}, {rgba.b})
        </Typography>
        {showAlpha && (
          <Typography
            variant="caption"
            sx={{
              px: 1,
              py: 0.45,
              borderRadius: 999,
              bgcolor: alpha(baseColor, 0.1),
              color: "#334155",
              fontFamily: "monospace",
            }}
          >
            alpha {rgba.a.toFixed(2)}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default ColorPickerWithAlpha;
