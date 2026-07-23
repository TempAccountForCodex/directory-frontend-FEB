import React from "react";
import { Box } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { ContactFormField } from "../../api/formSubmissions";

/**
 * Shared renderer for schema-backed contact form fields used by new templates.
 *
 * Field config always comes from the editor's "Form Fields" repeater via
 * `normalizeContactFormFields`, so the Block Editor panel and the canvas render
 * exactly the same fields. Templates keep their own look by passing `inputSx`
 * (and label colors for checkbox/radio); this helper only owns the per-type
 * markup so no template hardcodes its inputs.
 */

const NATIVE_INPUT_TYPES = new Set(["email", "tel", "number", "date"]);

/** Field types that should span the full width of a 2-column contact grid. */
export const isFullWidthContactField = (field: ContactFormField): boolean =>
  ["textarea", "select", "radio", "checkbox"].includes(field.fieldType);

interface RenderContactFieldArgs {
  field: ContactFormField;
  /** Props from `useTemplateContactForm().getFieldProps(field.label)`. */
  fieldProps: Record<string, any>;
  /** Styling for text-like inputs / textarea / select — preserves template design. */
  inputSx: SxProps<Theme>;
  /** Label/text color for checkbox & radio controls. */
  textColor: string;
  /** Muted color for the radio group label. */
  mutedColor: string;
}

export function renderTemplateContactField({
  field,
  fieldProps,
  inputSx,
  textColor,
  mutedColor,
}: RenderContactFieldArgs): React.ReactElement {
  const placeholder = field.placeholder || field.label;
  const { fieldType } = field;
  const onChange = fieldProps.onChange as (event: unknown) => void;

  if (fieldType === "textarea") {
    return (
      <Box
        component="textarea"
        rows={5}
        placeholder={placeholder}
        required={field.required}
        {...fieldProps}
        sx={{ ...(inputSx as object), resize: "vertical", minHeight: 120 }}
      />
    );
  }

  if (fieldType === "select") {
    return (
      <Box
        component="select"
        required={field.required}
        {...fieldProps}
        sx={{ ...(inputSx as object), cursor: "pointer" }}
      >
        <option value="">{placeholder}</option>
        {field.options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Box>
    );
  }

  if (fieldType === "checkbox") {
    return (
      <Box
        component="label"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: textColor,
          fontSize: "0.92rem",
        }}
      >
        <Box
          component="input"
          type="checkbox"
          name={fieldProps.name as string}
          disabled={fieldProps.disabled as boolean}
          checked={Boolean(fieldProps.value)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
            onChange({
              target: { value: event.target.checked ? "Yes" : "" },
            })
          }
        />
        {placeholder}
      </Box>
    );
  }

  if (fieldType === "radio") {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, color: textColor }}>
        <Box component="span" sx={{ fontSize: "0.82rem", color: mutedColor }}>
          {field.label}
        </Box>
        {field.options.map((option) => (
          <Box
            key={option}
            component="label"
            sx={{ display: "flex", alignItems: "center", gap: 1, fontSize: "0.9rem" }}
          >
            <Box
              component="input"
              type="radio"
              name={fieldProps.name as string}
              value={option}
              disabled={fieldProps.disabled as boolean}
              checked={fieldProps.value === option}
              onChange={onChange}
            />
            {option}
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box
      component="input"
      type={NATIVE_INPUT_TYPES.has(fieldType) ? fieldType : "text"}
      placeholder={placeholder}
      required={field.required}
      {...fieldProps}
      sx={inputSx}
    />
  );
}
