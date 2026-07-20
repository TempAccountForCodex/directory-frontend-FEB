import React from "react";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";

export interface TemplateContactFieldValue {
  key?: React.Key;
  label: string;
  placeholder?: string;
  fieldType?: string;
  required?: boolean;
  options?: readonly string[];
}

interface TemplateContactFieldProps {
  field: TemplateContactFieldValue;
  fieldProps: Record<string, any>;
  accentColor: string;
  textColor: string;
}

/** Shared renderer for schema-backed contact form fields. */
export function TemplateContactField({
  field,
  fieldProps,
  accentColor,
  textColor,
}: TemplateContactFieldProps) {
  const commonTextFieldSx = {
    "& .MuiInputBase-root": {
      color: textColor,
      pb: 1,
      borderBottom: "1px solid rgba(255,255,255,0.18)",
    },
  };
  const placeholder = field.placeholder || field.label;

  if (field.fieldType === "select") {
    return (
      <TextField
        select
        size="small"
        fullWidth
        variant="standard"
        required={field.required}
        SelectProps={{ displayEmpty: true }}
        {...fieldProps}
        InputProps={{ disableUnderline: true }}
        sx={commonTextFieldSx}
      >
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
        {(field.options || []).map((option) => (
          <MenuItem key={`${field.label}-${option}`} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (field.fieldType === "checkbox") {
    return (
      <FormControlLabel
        control={
          <Checkbox
            checked={Boolean(fieldProps.value)}
            disabled={fieldProps.disabled}
            onChange={(event) =>
              fieldProps.onChange({
                target: { value: event.target.checked ? "Yes" : "" },
              } as React.ChangeEvent<HTMLInputElement>)
            }
            sx={{
              color: textColor,
              "&.Mui-checked": { color: accentColor },
            }}
          />
        }
        label={placeholder}
        sx={{ color: textColor, ml: 0 }}
      />
    );
  }

  if (field.fieldType === "radio") {
    return (
      <FormControl disabled={fieldProps.disabled}>
        <FormLabel sx={{ color: textColor, mb: 1 }}>{field.label}</FormLabel>
        <RadioGroup
          value={fieldProps.value || ""}
          onChange={(event) =>
            fieldProps.onChange(
              event as React.ChangeEvent<
                HTMLInputElement | HTMLTextAreaElement
              >,
            )
          }
        >
          {(field.options || []).map((option) => (
            <FormControlLabel
              key={`${field.label}-${option}`}
              value={option}
              control={
                <Radio
                  sx={{
                    color: textColor,
                    "&.Mui-checked": { color: accentColor },
                  }}
                />
              }
              label={option}
              sx={{ color: textColor }}
            />
          ))}
        </RadioGroup>
      </FormControl>
    );
  }

  return (
    <TextField
      placeholder={placeholder}
      size="small"
      fullWidth
      multiline={field.fieldType === "textarea"}
      minRows={field.fieldType === "textarea" ? 6 : undefined}
      variant="standard"
      type={
        field.fieldType === "email" ||
        field.fieldType === "tel" ||
        field.fieldType === "number" ||
        field.fieldType === "date"
          ? field.fieldType
          : "text"
      }
      required={field.required}
      {...fieldProps}
      InputProps={{ disableUnderline: true }}
      sx={commonTextFieldSx}
    />
  );
}
