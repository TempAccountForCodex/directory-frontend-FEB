/**
 * Step 2.4.1 — Select Component
 * Adapter wrapping DashboardSelect (visual base) for the dynamic field system.
 *
 * This component:
 * - Accepts an options[] array and maps it to MUI MenuItem children
 * - Supports optional search/filter via local filterText state (searchable=true)
 * - Supports multiple selection (multiple=true)
 * - Displays error state via FormHelperText below the control
 * - Self-registers in the global field component registry
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents re-renders when parent re-renders with same props
 * - Stable keys (opt.value) in option .map() calls
 * - useCallback for handlers to avoid re-creating on every render
 */
import React, { useState, useCallback } from "react";
import MenuItem from "@mui/material/MenuItem";
import FormHelperText from "@mui/material/FormHelperText";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import DashboardSelect from "../../Dashboard/shared/DashboardSelect";
import type { FieldRendererProps } from "../types";
import { FieldType } from "../types";
import { registerFieldComponent } from "../registry";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  /** Current selected value — string for single, string[] for multiple */
  value: string | string[];
  /** Callback when selection changes */
  onChange: (value: string | string[]) => void;
  /** Available options */
  options: SelectOption[];
  /** Whether the field is non-interactive */
  disabled?: boolean;
  /** Enable multiple selection */
  multiple?: boolean;
  /** Enable search/filter input above dropdown */
  searchable?: boolean;
  /** Error message to display below the control */
  error?: string;
}

// ---------------------------------------------------------------------------
// Select component (DashboardSelect adapter)
// ---------------------------------------------------------------------------

const Select: React.FC<FieldRendererProps> = React.memo(
  ({ field, value, onChange, disabled = false, errors = [] }) => {
    // Extract Select-specific props from field.ui.props (passed by FieldRenderer)
    const uiProps = (field.ui?.props ?? {}) as Partial<SelectProps>;
    const options: SelectOption[] = uiProps.options ?? [];
    const multiple = uiProps.multiple ?? false;
    const searchable = uiProps.searchable ?? false;

    // Local search/filter state — only active when searchable=true
    const [filterText, setFilterText] = useState<string>("");

    // Derive filtered options for rendering
    const filteredOptions = searchable
      ? options.filter((o) =>
          o.label.toLowerCase().includes(filterText.toLowerCase()),
        )
      : options;

    // Normalise value: ensure string or string[] type safety
    const normaliseValue = (v: unknown): string | string[] => {
      if (multiple) {
        if (Array.isArray(v)) return v.map(String);
        if (v === null || v === undefined || v === "") return [];
        return [String(v)];
      }
      if (v === null || v === undefined) return "";
      if (typeof v === "string") return v;
      return String(v);
    };

    const safeValue = normaliseValue(value);

    const handleChange = useCallback(
      (e: React.ChangeEvent<{ value: unknown }>) => {
        const newValue = e.target.value as string | string[];
        onChange(newValue);
      },
      [onChange],
    );

    const handleFilterChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFilterText(e.target.value);
      },
      [],
    );

    const hasError = errors.length > 0;
    const errorMessage = hasError ? errors[0] : undefined;

    return (
      <Box>
        {searchable && (
          <TextField
            size="small"
            placeholder="Search options…"
            value={filterText}
            onChange={handleFilterChange}
            disabled={disabled}
            inputProps={{ "aria-label": `Search ${field.label} options` }}
            sx={{ mb: 1, width: "100%" }}
          />
        )}

        <DashboardSelect
          label={field.label}
          value={safeValue}
          onChange={handleChange}
          disabled={disabled}
          error={hasError}
          multiple={multiple}
        >
          {filteredOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </DashboardSelect>

        {hasError && (
          <FormHelperText error role="alert" sx={{ ml: 1.75, mt: 0.25 }}>
            {errorMessage}
          </FormHelperText>
        )}
      </Box>
    );
  },
);

Select.displayName = "Select";

// Self-register in the global field component registry (module scope — runs once on import)
registerFieldComponent(FieldType.SELECT, Select);

export { Select };
export default Select;
