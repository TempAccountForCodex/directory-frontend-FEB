/**
 * Step 2.2.1 — TextField Component
 * Single-line text input implementing FieldRendererProps contract.
 *
 * Adapter over DashboardInput (visual base) with:
 * - Local state synced with external value prop
 * - Character counter when maxLength is set
 * - Error state via DashboardInput error + helperText props
 * - Full ARIA attributes (aria-label, aria-invalid, aria-describedby)
 * - React.memo for render optimization
 *
 * FieldWrapper (parent) owns label/description display — DashboardInput used without label.
 */
import React, { useState, useEffect, useId } from "react";
import { FormHelperText, Box } from "@mui/material";
import DashboardInput from "../../Dashboard/shared/DashboardInput";
import type { FieldRendererProps } from "../types";
import { FieldType } from "../types";
import { registerFieldComponent } from "../registry";

/**
 * TextField
 *
 * Renders a single-line text input for FieldType.TEXT fields.
 * Calls onChange on every keystroke for immediate responsiveness.
 *
 * ARIA:
 * - aria-label set to field.label for screen readers
 * - aria-invalid when errors are present
 * - aria-describedby wired to counter/error IDs when present
 *
 * CHARACTER COUNTER:
 * - Shown as "current/max" below field, right-aligned, in text.secondary colour
 * - Typing is hard-blocked at maxLength via inputProps.maxLength
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents re-renders when parent re-renders with same props
 * - Local state avoids propagating every keystroke up the tree
 */
const TextField: React.FC<FieldRendererProps> = React.memo(
  ({ field, value, onChange, disabled = false, errors = [] }) => {
    const uid = useId();
    const counterId = `${uid}-counter`;
    const errorId = `${uid}-error`;

    const maxLength = field.validation?.maxLength;
    const placeholder = field.ui?.placeholder;
    const label = field.label;
    const required = field.required ?? false;

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setLocalValue(newValue);
      onChange(newValue);
    };

    // Determine helperText — error message takes precedence, counter is shown separately
    const helperText = hasErrors ? errors[0] : undefined;

    return (
      <Box>
        <DashboardInput
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

TextField.displayName = "TextField";

// Register component in the global field registry
registerFieldComponent(FieldType.TEXT, TextField);

export { TextField };
export default TextField;
