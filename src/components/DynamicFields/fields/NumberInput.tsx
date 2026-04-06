/**
 * Step 2.2.3 — NumberInput Component
 * Numeric input with increment/decrement step buttons, implementing FieldRendererProps contract.
 *
 * Adapter over DashboardInput with stepper buttons via InputProps.endAdornment.
 * Uses type="text" (not type="number") to avoid browser stepper conflicts
 * and to allow partial input like "-" or "3." while typing.
 *
 * Key behaviours:
 * - onChange called with number|null ONLY on blur and step button clicks
 * - Local string state allows smooth typing without sending partial values upstream
 * - onKeyDown blocks non-numeric keys (except special keys and conditional '-'/'.')
 * - Paste validation: only accepts valid number strings
 * - Step buttons with increment/decrement, clamped to min/max
 * - Step buttons disabled at boundary or when field is disabled
 * FieldWrapper (parent) owns label/description display — DashboardInput used without label.
 */
import React, { useState, useEffect, useCallback, useRef, useId } from "react";
import { InputAdornment, IconButton } from "@mui/material";
import { Add as AddIcon, Remove as RemoveIcon } from "@mui/icons-material";
import DashboardInput from "../../Dashboard/shared/DashboardInput";
import type { FieldRendererProps } from "../types";
import { FieldType } from "../types";
import { registerFieldComponent } from "../registry";

// ---------------------------------------------------------------------------
// Helpers (module-level — stable, no closure over component state)
// ---------------------------------------------------------------------------

/** Parse a display string to a number, returning null for empty/invalid input. */
function parseDisplay(str: string): number | null {
  if (str.trim() === "" || str === "-" || str === ".") return null;
  const n = parseFloat(str);
  return isNaN(n) ? null : n;
}

/** Clamp a number to [min, max], applying only the bounds that are defined. */
function clamp(
  n: number,
  min: number | undefined,
  max: number | undefined,
): number {
  let result = n;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * NumberInput
 *
 * Renders a numeric input with +/- step buttons for FieldType.NUMBER fields.
 *
 * onChange contract: called with number|null — NEVER a string.
 * Upstream callers do not need to handle partial input or string coercion.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents re-renders when parent re-renders with same props
 * - useCallback on handlers stabilises references for InputAdornment children
 * - onChange called only on blur/step — not on every keypress — prevents
 *   upstream re-renders during partial number entry
 * - Increment/Decrement handlers stored in refs so keyDown can reference them
 *   without creating circular useCallback dependencies
 */
const NumberInput: React.FC<FieldRendererProps> = React.memo(
  ({ field, value, onChange, disabled = false, errors = [] }) => {
    const uid = useId();
    const errorId = `${uid}-error`;

    const label = field.label;
    const required = field.required ?? false;

    // Validation bounds
    const min = field.validation?.min;
    const max = field.validation?.max;

    // Step configuration via field.ui.props
    const step =
      typeof field.ui?.props?.["step"] === "number"
        ? (field.ui.props["step"] as number)
        : 1;
    const allowDecimals = field.ui?.props?.["allowDecimals"] === true;

    // ---------------------------------------------------------------------------
    // Local state — display string allows partial input like "-" or "3."
    // ---------------------------------------------------------------------------
    const toDisplayStr = useCallback((v: unknown): string => {
      if (typeof v === "number" && !isNaN(v)) return String(v);
      if (v === null || v === undefined) return "";
      if (typeof v === "string") {
        const n = parseFloat(v);
        return isNaN(n) ? "" : String(n);
      }
      return "";
    }, []);

    const [localValue, setLocalValue] = useState<string>(() =>
      toDisplayStr(value),
    );

    // Sync with external value changes (e.g. form reset, external update)
    useEffect(() => {
      setLocalValue(toDisplayStr(value));
    }, [value, toDisplayStr]);

    const hasErrors = errors.length > 0;

    // Derived boundary states for disabling step buttons
    const currentNum = parseDisplay(localValue);
    const atMax = max !== undefined && currentNum !== null && currentNum >= max;
    const atMin = min !== undefined && currentNum !== null && currentNum <= min;

    // ---------------------------------------------------------------------------
    // Change handler — update local string state only (no upstream call)
    // ---------------------------------------------------------------------------
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
        // NOTE: onChange NOT called here — only on blur and step button clicks.
        // This allows smooth typing of partial values like "1." or "-3".
      },
      [],
    );

    // ---------------------------------------------------------------------------
    // Step button handlers — defined before keyDown so refs can be set
    // ---------------------------------------------------------------------------
    const handleIncrement = useCallback(() => {
      setLocalValue((prev) => {
        const current = parseDisplay(prev) ?? min ?? 0;
        const next = clamp(current + step, min, max);
        onChange(next);
        return String(next);
      });
    }, [step, min, max, onChange]);

    const handleDecrement = useCallback(() => {
      setLocalValue((prev) => {
        const current = parseDisplay(prev) ?? max ?? 0;
        const next = clamp(current - step, min, max);
        onChange(next);
        return String(next);
      });
    }, [step, min, max, onChange]);

    // Store latest increment/decrement in refs so keyDown handler (useCallback with stable deps)
    // can call them without re-creating on every render (avoids circular dependency).
    const incrementRef = useRef(handleIncrement);
    const decrementRef = useRef(handleDecrement);
    incrementRef.current = handleIncrement;
    decrementRef.current = handleDecrement;

    // ---------------------------------------------------------------------------
    // Blur handler — clamp, convert to number|null, call onChange
    // ---------------------------------------------------------------------------
    const handleBlur = useCallback(() => {
      setLocalValue((prev) => {
        const parsed = parseDisplay(prev);
        if (parsed === null) {
          onChange(null);
          return "";
        }
        const clamped = clamp(parsed, min, max);
        onChange(clamped);
        return String(clamped);
      });
    }, [min, max, onChange]);

    // ---------------------------------------------------------------------------
    // keyDown — block non-numeric keys, handle Arrow Up/Down stepping
    // ---------------------------------------------------------------------------
    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLInputElement>) => {
        const allowedKeys = new Set([
          "Backspace",
          "Delete",
          "Tab",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "Home",
          "End",
        ]);

        if (allowedKeys.has(e.key)) return;

        // Allow Ctrl/Cmd shortcuts (copy, paste, select all, etc.)
        if (e.ctrlKey || e.metaKey) return;

        // Arrow Up/Down: increment/decrement by step (via refs — no circular dep)
        if (e.key === "ArrowUp") {
          e.preventDefault();
          incrementRef.current();
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          decrementRef.current();
          return;
        }

        // Numeric digits 0-9
        if (/^[0-9]$/.test(e.key)) return;

        // Minus sign — only allow if min is undefined or min < 0, and no minus already present
        if (e.key === "-") {
          const target = e.target as HTMLInputElement;
          const alreadyHasMinus = target.value.includes("-");
          const minAllowsNegative = min === undefined || min < 0;
          if (minAllowsNegative && !alreadyHasMinus) return;
        }

        // Decimal point — only if allowDecimals, and no decimal already present
        if (e.key === ".") {
          if (allowDecimals) {
            const target = e.target as HTMLInputElement;
            if (!target.value.includes(".")) return;
          }
        }

        // Block everything else
        e.preventDefault();
      },
      [allowDecimals, min],
    );

    // ---------------------------------------------------------------------------
    // Paste handler — validate paste content
    // ---------------------------------------------------------------------------
    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("text").trim();
        // Accept any string that is a valid finite number representation.
        // Use a regex instead of String(parseFloat(pasted)) === pasted to avoid
        // false rejections for valid forms like "3.50" or "-0" where
        // String(parseFloat(...)) normalises away trailing zeros / negative zero.
        // Pattern: optional leading minus, one or more digits, optional decimal part.
        const isValidNumber = /^-?[0-9]+(\.[0-9]*)?$/.test(pasted);
        if (!isValidNumber) {
          e.preventDefault();
        }
      },
      [],
    );

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------
    return (
      <DashboardInput
        type="text"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        disabled={disabled}
        required={required}
        error={hasErrors}
        helperText={hasErrors ? errors[0] : undefined}
        inputProps={{
          "aria-label": label,
          "aria-invalid": hasErrors ? true : undefined,
          "aria-describedby": hasErrors ? errorId : undefined,
          "aria-required": required ? true : undefined,
          inputMode: "numeric",
        }}
        FormHelperTextProps={
          hasErrors ? { id: errorId, role: "alert" } : undefined
        }
        InputProps={{
          endAdornment: (
            <InputAdornment position="end" sx={{ gap: 0 }}>
              <IconButton
                size="small"
                onClick={handleDecrement}
                disabled={disabled || atMin}
                aria-label="Decrement value"
                edge={false}
              >
                <RemoveIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleIncrement}
                disabled={disabled || atMax}
                aria-label="Increment value"
                edge="end"
              >
                <AddIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    );
  },
);

NumberInput.displayName = "NumberInput";

// Register component in the global field registry
registerFieldComponent(FieldType.NUMBER, NumberInput);

export { NumberInput };
export default NumberInput;
