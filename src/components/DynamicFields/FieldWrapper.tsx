/**
 * Step 2.1.2 — FieldWrapper Component
 * Provides label, help text, error display, and ARIA wiring for any field.
 * SECURITY: help text is rendered as plain text — no dangerouslySetInnerHTML.
 *
 * Label pattern follows DashboardInput's `Typography component="label"` approach
 * for visual consistency across the dashboard (lighter than FormControl/fieldset).
 */
import React, { useId } from "react";
import { Box, FormHelperText, Tooltip, Typography } from "@mui/material";

export interface FieldWrapperProps {
  /** Human-readable label for the field */
  label: string;
  /** Short descriptive help text (rendered as plain text — never HTML) */
  help?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Validation / server error messages for this field */
  errors?: string[];
  /** The actual field control (TextField, Select, etc.) */
  children: React.ReactNode;
}

/**
 * FieldWrapper
 *
 * Wraps any field control with:
 * - A label (with asterisk when required) — styled like DashboardInput's top label
 * - Optional help text shown below the label OR as a Tooltip when text is long (> 80 chars)
 * - Error messages with role="alert" and aria-live="polite"
 * - Full ARIA attribute propagation (aria-describedby, aria-required, aria-invalid)
 *
 * SECURITY: help text is set as textContent, never innerHTML.
 * No dangerouslySetInnerHTML is used anywhere in this component.
 */
export const FieldWrapper: React.FC<FieldWrapperProps> = React.memo(
  ({ label, help, required = false, errors = [], children }) => {
    const uid = useId();
    const helpId = help ? `${uid}-help` : undefined;
    const errorId = errors.length > 0 ? `${uid}-error` : undefined;

    // Build aria-describedby — join all descriptor IDs
    const describedBy =
      [helpId, errorId].filter(Boolean).join(" ") || undefined;

    const hasErrors = errors.length > 0;

    // Use Tooltip when help text is long (> 80 chars) to avoid layout clutter
    const isLongHelp = (help?.length ?? 0) > 80;

    const helpNode = help ? (
      isLongHelp ? (
        <Tooltip title={help} arrow placement="right">
          <Typography
            component="span"
            variant="caption"
            color="text.secondary"
            id={helpId}
            sx={{
              cursor: "help",
              textDecoration: "underline dotted",
              display: "inline-block",
              mt: 0.25,
            }}
          >
            {/* Truncate long help text; full text available in Tooltip */}
            {help.slice(0, 80)}…
          </Typography>
        </Tooltip>
      ) : (
        <Typography
          component="span"
          variant="caption"
          color="text.secondary"
          id={helpId}
          sx={{ display: "block", mt: 0.25 }}
        >
          {help}
        </Typography>
      )
    ) : null;

    return (
      <Box sx={{ mb: 2 }}>
        {/* Label row — mirrors DashboardInput's top-label Typography pattern */}
        <Box sx={{ mb: 0.5 }}>
          <Typography
            component="label"
            sx={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: hasErrors ? "error.main" : "text.secondary",
              transition: "color 0.2s ease",
              mb: help ? 0.25 : 0,
            }}
          >
            {label}
            {required && (
              <Typography
                component="span"
                aria-hidden="true"
                sx={{ color: "error.main", ml: 0.25 }}
              >
                *
              </Typography>
            )}
          </Typography>

          {/* Help text — plain text only, no HTML rendering */}
          {helpNode}
        </Box>

        {/* Field control — receives ARIA IDs via aria-describedby */}
        <Box
          aria-describedby={describedBy}
          aria-required={required || undefined}
          aria-invalid={hasErrors || undefined}
        >
          {children}
        </Box>

        {/* Error messages */}
        {hasErrors && (
          <Box id={errorId} role="alert" aria-live="polite">
            {errors.map((err, index) => (
              <FormHelperText key={index} error sx={{ mt: 0.25, ml: 0 }}>
                {err}
              </FormHelperText>
            ))}
          </Box>
        )}
      </Box>
    );
  },
);

FieldWrapper.displayName = "FieldWrapper";

export default FieldWrapper;
