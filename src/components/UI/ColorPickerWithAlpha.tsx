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

  return (
    <Stack spacing={2}>
      {label && (
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {label}
        </Typography>
      )}

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        {/* Color Picker */}
        <Box
          sx={{
            position: "relative",
            width: 60,
            height: 60,
            borderRadius: 1,
            overflow: "hidden",
            border: `2px solid ${alpha("#000", 0.2)}`,
            cursor: disabled ? "not-allowed" : "pointer",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          {/* Checkered background for transparency preview */}
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

          {/* Color overlay with alpha */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              bgcolor: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`,
            }}
          />

          {/* Native color picker input */}
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

        {/* Hex Input */}
        <TextField
          size="small"
          value={hexValue}
          onChange={(e) => handleHexChange(e.target.value)}
          error={!!(error || inputError)}
          helperText={error || inputError || helperText}
          placeholder="#RRGGBBAA"
          disabled={disabled}
          sx={{ flex: 1 }}
          inputProps={{
            style: { fontFamily: "monospace", textTransform: "uppercase" },
          }}
        />
      </Box>

      {/* Alpha Slider */}
      {showAlpha && (
        <Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Opacity
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: "monospace" }}
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
              "& .MuiSlider-track": {
                background: `linear-gradient(to right, transparent, ${baseColor})`,
              },
              "& .MuiSlider-rail": {
                backgroundImage: `
                  linear-gradient(45deg, ${alpha("#000", 0.1)} 25%, transparent 25%),
                  linear-gradient(-45deg, ${alpha("#000", 0.1)} 25%, transparent 25%),
                  linear-gradient(45deg, transparent 75%, ${alpha("#000", 0.1)} 75%),
                  linear-gradient(-45deg, transparent 75%, ${alpha("#000", 0.1)} 75%)
                `,
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
              },
            }}
          />
        </Box>
      )}

      {/* Color Preview Info */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontFamily: "monospace" }}
        >
          RGB: {rgba.r}, {rgba.g}, {rgba.b}
        </Typography>
        {showAlpha && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: "monospace" }}
          >
            Alpha: {rgba.a.toFixed(2)}
          </Typography>
        )}
      </Box>
    </Stack>
  );
};

export default ColorPickerWithAlpha;
