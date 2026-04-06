/**
 * Step 2.2.2 — TextArea Component
 * Multiline text input implementing FieldRendererProps contract.
 *
 * Adapter over DashboardInput (multiline) with:
 * - Local state synced with external value prop
 * - Configurable rows (default 4) and maxRows (default 10) via field.ui.props
 * - Character counter when maxLength is set
 * - Error state via DashboardInput error + helperText props
 * - Full ARIA attributes (aria-label, aria-invalid, aria-describedby)
 * - React.memo for render optimization
 *
 * Handles up to 10,000 chars without throttling — React's reconciler
 * is fast enough for textarea updates at this scale.
 * FieldWrapper (parent) owns label/description display — DashboardInput used without label.
 */
import React, { useState, useEffect, useId } from "react";
import { FormHelperText, Box } from "@mui/material";
import DashboardInput from "../../Dashboard/shared/DashboardInput";
import type { FieldRendererProps } from "../types";
import { FieldType } from "../types";
import { registerFieldComponent } from "../registry";

/**
 * TextArea
 *
 * Renders a multiline text input for FieldType.TEXTAREA fields.
 * Calls onChange on every keystroke for immediate responsiveness.
 *
 * ARIA:
 * - aria-label set to field.label
 * - aria-invalid when errors are present
 * - aria-describedby wired to counter/error IDs when present
 *
 * ROW CONFIGURATION (via field.ui.props):
 * - rows: minimum rows visible (default 4)
 * - maxRows: textarea grows up to this many rows before scrolling (default 10)
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents re-renders when parent re-renders with same props
 * - Local state avoids re-rendering entire form on each keystroke
 */
const TextArea: React.FC<FieldRendererProps> = React.memo(
  ({ field, value, onChange, disabled = false, errors = [] }) => {
    const uid = useId();
    const counterId = `${uid}-counter`;
    const errorId = `${uid}-error`;

    const maxLength = field.validation?.maxLength;
    const placeholder = field.ui?.placeholder;
    const label = field.label;
    const required = field.required ?? false;

    // Extract row configuration from field.ui.props with safe defaults
    const rows =
      typeof field.ui?.props?.["rows"] === "number"
        ? (field.ui.props["rows"] as number)
        : 4;
    const maxRows =
      typeof field.ui?.props?.["maxRows"] === "number"
        ? (field.ui.props["maxRows"] as number)
        : 10;

    // Local state as string — cast unknown value to string safely
    const toStr = (v: unknown): string => {
      if (typeof v === "string") return v;
      if (v === null || v === undefined) return "";
      return String(v);
    };

    const [localValue, setLocalValue] = useState<string>(toStr(value));

    // Sync with external value changes (e.g. form reset, external update)
    useEffect(() => {
      setLocalValue(toStr(value));
    }, [value]);

    const hasErrors = errors.length > 0;
    const currentLength = localValue.length;

    // Build aria-describedby — include counter ID when maxLength set, error ID when errors present
    const describedByParts: string[] = [];
    if (maxLength !== undefined) describedByParts.push(counterId);
    if (hasErrors) describedByParts.push(errorId);
    const describedBy =
      describedByParts.length > 0 ? describedByParts.join(" ") : undefined;

    const handleChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };

    const helperText = hasErrors ? errors[0] : undefined;

    return (
      <Box>
        <DashboardInput
          multiline
          resizable
          minRows={rows}
          maxRows={maxRows}
          value={localValue}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          error={hasErrors}
          helperText={helperText}
          inputProps={{
            maxLength: maxLength,
            "aria-label": label,
            "aria-invalid": hasErrors ? true : undefined,
            "aria-describedby": describedBy,
            "aria-required": required ? true : undefined,
          }}
          FormHelperTextProps={
            hasErrors ? { id: errorId, role: "alert" } : undefined
          }
        />

        {/* Character counter — shown when maxLength is configured */}
        {maxLength !== undefined && (
          <FormHelperText
            id={counterId}
            sx={{
              textAlign: "right",
              color: "text.secondary",
              mt: hasErrors ? 0 : -0.5,
            }}
          >
            {currentLength}/{maxLength}
          </FormHelperText>
        )}
      </Box>
    );
  },
);

TextArea.displayName = "TextArea";

// Register component in the global field registry
registerFieldComponent(FieldType.TEXTAREA, TextArea);

export { TextArea };
export default TextArea;
