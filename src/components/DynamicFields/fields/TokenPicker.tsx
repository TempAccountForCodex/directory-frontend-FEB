import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormHelperText,
} from "@mui/material";
import { RestartAlt as ResetIcon } from "@mui/icons-material";
import { ColorPickerWithAlpha } from "../../UI/ColorPickerWithAlpha";

/**
 * Token types supported by the picker
 */
export type TokenType =
  | "color"
  | "spacing"
  | "typography"
  | "borderRadius"
  | "fontSize"
  | "fontWeight"
  | "lineHeight"
  | "fontFamily";

/**
 * Props for TokenPicker component
 */
export interface TokenPickerProps {
  /** Type of design token to pick */
  tokenType: TokenType;
  /** Current value of the token */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Default value to reset to */
  defaultValue?: string;
  /** Label for the picker */
  label?: string;
  /** Helper text / description */
  helperText?: string;
  /** Allow custom values (vs preset only) */
  allowCustom?: boolean;
  /** Show live preview of the value */
  showPreview?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Validation error message */
  error?: string;
}

/**
 * Common font families (whitelisted safe fonts)
 */
const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Georgia",
  "Courier New",
  "Verdana",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
  "Poppins",
  "system-ui",
  "sans-serif",
  "serif",
  "monospace",
];

/**
 * Font weight options
 */
const FONT_WEIGHTS = [
  { value: "300", label: "Light (300)" },
  { value: "400", label: "Regular (400)" },
  { value: "500", label: "Medium (500)" },
  { value: "600", label: "Semibold (600)" },
  { value: "700", label: "Bold (700)" },
  { value: "800", label: "Extra Bold (800)" },
];

/**
 * Validates spacing/border radius values (px, rem, em, %)
 */
const isValidSpacingValue = (value: string): boolean => {
  return /^-?\d+(\.\d+)?(px|rem|em|%)$/.test(value) || value === "0";
};

/**
 * Validates font size values
 */
const isValidFontSize = (value: string): boolean => {
  return /^\d+(\.\d+)?(px|rem|em)$/.test(value);
};

/**
 * Validates line height values (unitless numbers or px/rem/em)
 */
const isValidLineHeight = (value: string): boolean => {
  return /^\d+(\.\d+)?$/.test(value) || /^\d+(\.\d+)?(px|rem|em)$/.test(value);
};

/**
 * TokenPicker Component
 *
 * A flexible design token picker that adapts to different token types (color, spacing, typography, etc.)
 * Provides validation, live preview, and reset functionality.
 */
export const TokenPicker: React.FC<TokenPickerProps> = ({
  tokenType,
  value,
  onChange,
  defaultValue,
  label,
  helperText,
  allowCustom = true,
  showPreview = true,
  disabled = false,
  error,
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [validationError, setValidationError] = useState<string>("");

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /**
   * Handle value change with validation
   */
  const handleChange = (newValue: string) => {
    setLocalValue(newValue);

    // Validate based on token type
    let isValid = true;
    let errorMsg = "";

    switch (tokenType) {
      case "color":
        // Color validation handled by ColorPickerWithAlpha
        isValid = true;
        break;

      case "spacing":
      case "borderRadius":
        isValid = isValidSpacingValue(newValue);
        errorMsg = "Invalid format. Use: 16px, 1rem, 1.5em, 50%, or 0";
        break;

      case "fontSize":
        isValid = isValidFontSize(newValue);
        errorMsg = "Invalid format. Use: 16px, 1rem, or 1.5em";
        break;

      case "fontWeight":
        isValid = /^[1-9]00$/.test(newValue); // 100-900
        errorMsg = "Font weight must be 100-900 in increments of 100";
        break;

      case "lineHeight":
        isValid = isValidLineHeight(newValue);
        errorMsg =
          "Invalid format. Use: 1.5 (unitless), 24px, 1.5rem, or 1.5em";
        break;

      case "fontFamily":
        // Font family validation - any non-empty string (will be sanitized on backend)
        isValid = newValue.trim().length > 0;
        errorMsg = "Font family cannot be empty";
        break;

      default:
        isValid = true;
    }

    if (isValid) {
      setValidationError("");
      onChange(newValue);
    } else {
      setValidationError(errorMsg);
    }
  };

  /**
   * Reset to default value
   */
  const handleReset = () => {
    if (defaultValue) {
      setLocalValue(defaultValue);
      setValidationError("");
      onChange(defaultValue);
    }
  };

  /**
   * Render color picker
   */
  const renderColorPicker = () => (
    <Box>
      <ColorPickerWithAlpha
        value={localValue}
        onChange={handleChange}
        label={label}
        helperText={validationError || error || helperText}
        error={validationError || error}
        disabled={disabled}
        showAlpha={true}
      />

      {defaultValue && (
        <Button
          size="small"
          startIcon={<ResetIcon />}
          onClick={handleReset}
          disabled={disabled || localValue === defaultValue}
          sx={{ mt: 1 }}
        >
          Reset to Default
        </Button>
      )}
    </Box>
  );

  /**
   * Render font family picker
   */
  const renderFontFamilyPicker = () => (
    <FormControl
      fullWidth
      error={!!(validationError || error)}
      disabled={disabled}
    >
      <InputLabel>{label || "Font Family"}</InputLabel>
      <Select
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        label={label || "Font Family"}
      >
        {FONT_FAMILIES.map((font) => (
          <MenuItem key={font} value={font} style={{ fontFamily: font }}>
            {font}
          </MenuItem>
        ))}
      </Select>
      {(helperText || validationError || error) && (
        <FormHelperText>
          {validationError || error || helperText}
        </FormHelperText>
      )}

      {defaultValue && (
        <Button
          size="small"
          startIcon={<ResetIcon />}
          onClick={handleReset}
          disabled={disabled || localValue === defaultValue}
          sx={{ mt: 1 }}
        >
          Reset to Default
        </Button>
      )}
    </FormControl>
  );

  /**
   * Render font weight picker
   */
  const renderFontWeightPicker = () => (
    <FormControl
      fullWidth
      error={!!(validationError || error)}
      disabled={disabled}
    >
      <InputLabel>{label || "Font Weight"}</InputLabel>
      <Select
        value={localValue}
        onChange={(e) => handleChange(e.target.value)}
        label={label || "Font Weight"}
      >
        {FONT_WEIGHTS.map((weight) => (
          <MenuItem key={weight.value} value={weight.value}>
            <Typography style={{ fontWeight: parseInt(weight.value) }}>
              {weight.label}
            </Typography>
          </MenuItem>
        ))}
      </Select>
      {(helperText || validationError || error) && (
        <FormHelperText>
          {validationError || error || helperText}
        </FormHelperText>
      )}

      {defaultValue && (
        <Button
          size="small"
          startIcon={<ResetIcon />}
          onClick={handleReset}
          disabled={disabled || localValue === defaultValue}
          sx={{ mt: 1 }}
        >
          Reset to Default
        </Button>
      )}
    </FormControl>
  );

  /**
   * Render text input picker (spacing, fontSize, lineHeight, borderRadius)
   */
  const renderTextInputPicker = () => {
    const placeholders: Record<TokenType, string> = {
      spacing: "16px, 1rem, 1.5em, or 50%",
      fontSize: "16px, 1rem, or 1.5em",
      lineHeight: "1.5, 24px, or 1.5rem",
      borderRadius: "8px, 0.5rem, or 50%",
      color: "",
      typography: "",
      fontFamily: "",
      fontWeight: "",
    };

    return (
      <Stack spacing={2}>
        <TextField
          fullWidth
          label={
            label || tokenType.charAt(0).toUpperCase() + tokenType.slice(1)
          }
          value={localValue}
          onChange={(e) => handleChange(e.target.value)}
          error={!!(validationError || error)}
          helperText={validationError || error || helperText}
          placeholder={placeholders[tokenType]}
          disabled={disabled}
          inputProps={{
            style: { fontFamily: "monospace" },
          }}
        />

        {/* Live Preview */}
        {showPreview && localValue && !validationError && !error && (
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: "block" }}
            >
              Preview:
            </Typography>
            <Chip
              label={localValue}
              size="small"
              sx={{
                fontFamily: "monospace",
                bgcolor: "action.hover",
              }}
            />
          </Box>
        )}

        {/* Reset Button */}
        {defaultValue && (
          <Button
            size="small"
            startIcon={<ResetIcon />}
            onClick={handleReset}
            disabled={disabled || localValue === defaultValue}
          >
            Reset to Default ({defaultValue})
          </Button>
        )}
      </Stack>
    );
  };

  /**
   * Render appropriate picker based on token type
   */
  switch (tokenType) {
    case "color":
      return renderColorPicker();

    case "fontFamily":
      return renderFontFamilyPicker();

    case "fontWeight":
      return renderFontWeightPicker();

    case "spacing":
    case "fontSize":
    case "lineHeight":
    case "borderRadius":
      return renderTextInputPicker();

    default:
      return (
        <Typography color="error">Unknown token type: {tokenType}</Typography>
      );
  }
};

export default TokenPicker;
