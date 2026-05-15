/**
 * Step 2.3.3 — ColorPicker Adapter
 * Thin adapter that bridges FieldRendererProps → ColorPickerWithAlpha props.
 *
 * No additional logic beyond prop bridging and self-registration.
 * ColorPickerWithAlpha handles all visual rendering, accessibility, and
 * alpha channel support internally.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents re-renders when parent re-renders with same props
 */
import React from "react";
import { ColorPickerWithAlpha } from "../../UI/ColorPickerWithAlpha";
import type { FieldRendererProps } from "../types";
import { FieldType } from "../types";
import { registerFieldComponent } from "../registry";

/**
 * ColorPicker
 *
 * Renders a hex+alpha color picker for FieldType.COLOR fields.
 * Delegates all visual output to ColorPickerWithAlpha.
 *
 * Props mapped:
 *   value    → string color (empty string when undefined)
 *   onChange → (value: string) => void
 *   disabled → passed through
 *   errors   → errors[0] forwarded as error prop
 *   label    → forwarded for screen-reader labelling inside ColorPickerWithAlpha
 *   showAlpha→ via field.ui?.props?.showAlpha (defaults to true)
 */
const ColorPicker: React.FC<FieldRendererProps> = React.memo(
  ({ field, value, onChange, disabled = false, errors = [] }) => {
    const colorValue = typeof value === "string" ? value : "";
    const showAlpha =
      (field.ui?.props?.["showAlpha"] as boolean | undefined) ?? true;
    const errorMessage = errors.length > 0 ? errors[0] : undefined;

    return (
      <ColorPickerWithAlpha
        value={colorValue}
        onChange={onChange as (color: string) => void}
        label={field.label}
        error={errorMessage}
        showAlpha={showAlpha}
        disabled={disabled}
      />
    );
  },
);

ColorPicker.displayName = "ColorPicker";

// Self-register in the global field registry — consistent with TEXT/TEXTAREA/NUMBER pattern.
// Runs once when this module is first imported (e.g. via fields/index.ts barrel).
registerFieldComponent(FieldType.COLOR, ColorPicker);

export { ColorPicker };
export default ColorPicker;
