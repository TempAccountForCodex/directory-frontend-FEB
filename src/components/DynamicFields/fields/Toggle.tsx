/**
 * Step 2.4.2 — Toggle Component
 * Boolean toggle implementing FieldRendererProps contract.
 *
 * Simple wrapper over MUI FormControlLabel + Switch:
 * - Handles undefined/null value gracefully (defaults to false)
 * - onChange passes boolean (not the event) to parent
 * - labelPlacement forwarded to FormControlLabel when provided
 * - Disabled state disables both Switch and label
 * - ARIA role='switch' provided automatically by MUI Switch
 * - React.memo for render optimization
 *
 * Self-registers via registerFieldComponent(FieldType.TOGGLE, Toggle)
 * at module scope after component declaration.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents re-renders when parent re-renders with same props
 * - useCallback for stable onChange handler reference
 */
import React, { useCallback, useId } from "react";
import { Box, FormControlLabel, FormHelperText, Switch } from "@mui/material";
import type { FieldRendererProps } from "../types";
import { FieldType } from "../types";
import { registerFieldComponent } from "../registry";

/**
 * ToggleProps
 *
 * Extends FieldRendererProps to expose explicit boolean-typed props
 * while remaining compatible with the FieldRendererProps contract.
 */
interface ToggleProps extends FieldRendererProps {
  /** Explicit label override; falls back to field.label when not provided */
  label?: string;
  /** Position of the label relative to the switch (default: 'end') */
  labelPlacement?: "start" | "end";
}

/**
 * Toggle
 *
 * Renders a boolean toggle switch for FieldType.TOGGLE fields.
 * Calls onChange(boolean) on every interaction — passes the boolean
 * value, not the raw DOM event.
 *
 * ARIA:
 * - MUI Switch renders role="checkbox" (maps to switch semantics via aria-checked)
 * - Disabled state propagated to both Switch and FormControlLabel
 *
 * VALUE HANDLING:
 * - value || false — coerces null/undefined to false for checked prop
 */
const Toggle: React.FC<ToggleProps> = React.memo(
  ({
    field,
    value,
    onChange,
    disabled = false,
    errors = [],
    label,
    labelPlacement,
  }) => {
    const uid = useId();
    const errorId = `${uid}-error`;
    const resolvedLabel = label ?? field.label ?? "";
    const hasErrors = errors.length > 0;

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.checked);
      },
      [onChange],
    );

    const switchElement = (
      <Switch
        checked={Boolean(value)}
        onChange={handleChange}
        disabled={disabled}
        inputProps={{
          "aria-invalid": hasErrors ? true : undefined,
          "aria-describedby": hasErrors ? errorId : undefined,
        }}
      />
    );

    return (
      <Box>
        <FormControlLabel
          control={switchElement}
          label={resolvedLabel}
          disabled={disabled}
          {...(labelPlacement !== undefined ? { labelPlacement } : {})}
        />
        {hasErrors &&
          errors.map((err, i) => (
            <FormHelperText key={i} id={`${errorId}-${i}`} error>
              {err}
            </FormHelperText>
          ))}
      </Box>
    );
  },
);

Toggle.displayName = "Toggle";

// Register component in the global field registry
registerFieldComponent(FieldType.TOGGLE, Toggle);

export { Toggle };
export default Toggle;
