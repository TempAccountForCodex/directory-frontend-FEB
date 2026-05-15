/**
 * Step 2.3.4 — LinkField Component
 * URL input with validation, auto-prepend, internal/external toggle, and preview.
 *
 * Business logic (wired in Chunk 2):
 * - URL validation via new URL() + internal path regex
 * - Auto-prepend https:// on blur for bare domains
 * - linkType and openInNewTab managed as internal state
 * - Preview rendered only when value is non-empty and URL is valid
 *
 * States:
 * - Empty:   value is ''              -> DashboardInput with placeholder
 * - Error:   validationError/error    -> Alert + DashboardInput error state
 * - Success: value non-empty + valid  -> MUI Link preview below input
 *
 * ARIA:
 * - aria-label on ToggleButton items
 * - htmlFor on label elements
 * - Keyboard-navigable (ToggleButtonGroup + Checkbox native keyboard support)
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents re-renders when parent re-renders with same props
 * - useCallback for event handlers
 */
import React, { useId, useState, useCallback } from "react";
import {
  Box,
  Typography,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  FormControlLabel,
  FormHelperText,
  Checkbox,
  Link as MuiLink,
} from "@mui/material";
import LinkIcon from "@mui/icons-material/Link";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DashboardInput from "../../Dashboard/shared/DashboardInput";
import { registerFieldComponent } from "../registry";
import { FieldType } from "../types";

/* ------------------------------------------------------------------ */
/* Props interface                                                     */
/* ------------------------------------------------------------------ */

export interface LinkFieldProps {
  /** Current URL value (URL string only — linkType/openInNewTab are internal state) */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Whether the field is non-interactive */
  disabled?: boolean;
  /** Allow internal /path-style links (default true) */
  allowInternal?: boolean;
  /** External validation error message */
  error?: string;
  /** Validation error messages from FieldRendererProps (array) */
  errors?: string[];
  /** Field label for accessibility */
  label?: string;
}

/* ------------------------------------------------------------------ */
/* URL validation helper                                               */
/* ------------------------------------------------------------------ */

/**
 * Validates a URL string.
 * Allows internal paths starting with / or /.
 * Returns null when valid, an error message string when invalid.
 */
const ALLOWED_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

/**
 * Check if a URL string uses a safe protocol for rendering as href.
 * Prevents javascript:, data:, vbscript: etc. from being used in links.
 */
const isSafeHref = (url: string): boolean => {
  if (!url) return false;
  // Internal paths are safe
  if (url.startsWith("/") || url.startsWith("#")) return true;
  try {
    const parsed = new URL(url);
    return ALLOWED_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
};

const validateURL = (url: string): string | null => {
  if (!url) return null;
  // Allow internal paths starting with / (but not //)
  if (/^\/[^/]/.test(url) || url === "/") return null;
  try {
    const parsed = new URL(url);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) {
      return "URL must use http, https, mailto, or tel protocol";
    }
    return null;
  } catch {
    return "Please enter a valid URL (e.g., https://example.com or /path)";
  }
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const LinkField: React.FC<LinkFieldProps> = React.memo(
  ({
    value,
    onChange,
    disabled = false,
    allowInternal = true,
    error,
    errors = [],
    label,
  }) => {
    const uid = useId();
    const inputId = `${uid}-link-input`;
    const errorId = `${uid}-error`;
    const hasErrors = errors.length > 0;

    /* ---- Internal state ---- */
    const [linkType, setLinkType] = useState<"internal" | "external">(() =>
      value && value.startsWith("/") ? "internal" : "external",
    );
    const [openInNewTab, setOpenInNewTab] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    const isExternal = linkType === "external";

    /* ---- Displayed error: external prop takes priority over internal validation ---- */
    const displayError = error ?? validationError;

    /* ---- Preview: only show when value is non-empty, URL is valid, and protocol is safe ---- */
    const showPreview =
      value.length > 0 &&
      validationError === null &&
      !error &&
      isSafeHref(value);

    /* ---- Handlers ---- */
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value;
        onChange(newUrl);
        setValidationError(validateURL(newUrl));
      },
      [onChange],
    );

    const handleBlur = useCallback(() => {
      if (
        value &&
        !value.startsWith("http") &&
        !value.startsWith("/") &&
        !value.startsWith("#")
      ) {
        const prepended = "https://" + value;
        onChange(prepended);
        setValidationError(validateURL(prepended));
      }
    }, [value, onChange]);

    const handleLinkTypeChange = useCallback(
      (
        _event: React.MouseEvent<HTMLElement>,
        newType: "internal" | "external" | null,
      ) => {
        if (newType !== null) {
          setLinkType(newType);
        }
      },
      [],
    );

    const handleOpenInNewTabChange = useCallback(
      (_event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
        setOpenInNewTab(checked);
      },
      [],
    );

    return (
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        {/* ----- Link type toggle ----- */}
        {allowInternal && (
          <ToggleButtonGroup
            value={linkType}
            exclusive
            onChange={handleLinkTypeChange}
            disabled={disabled}
            size="small"
            sx={{ alignSelf: "flex-start" }}
          >
            <ToggleButton value="external" aria-label="External link">
              <LinkIcon sx={{ mr: 0.5, fontSize: 18 }} />
              <Typography variant="caption" sx={{ textTransform: "none" }}>
                External
              </Typography>
            </ToggleButton>
            <ToggleButton value="internal" aria-label="Internal link">
              <Typography variant="caption" sx={{ textTransform: "none" }}>
                /path
              </Typography>
            </ToggleButton>
          </ToggleButtonGroup>
        )}

        {/* ----- URL input ----- */}
        <DashboardInput
          id={inputId}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={disabled}
          placeholder={isExternal ? "https://example.com" : "/about"}
          error={!!displayError || hasErrors}
          helperText={displayError}
          type="url"
          fullWidth
          inputProps={{
            "aria-label": label ?? "URL",
            "aria-invalid": displayError || hasErrors ? true : undefined,
            "aria-describedby": hasErrors ? errorId : undefined,
          }}
        />

        {/* ----- Open in new tab checkbox (external links only) ----- */}
        {isExternal && (
          <FormControlLabel
            control={
              <Checkbox
                checked={openInNewTab}
                onChange={handleOpenInNewTabChange}
                disabled={disabled}
                size="small"
                sx={{ color: "text.secondary" }}
              />
            }
            label={
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Open in new tab
              </Typography>
            }
            sx={{ ml: 0 }}
          />
        )}

        {/* ----- Link preview (only when value is valid) ----- */}
        {showPreview && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              py: 0.5,
              px: 1,
              borderRadius: 1,
              bgcolor: "action.hover",
            }}
          >
            <OpenInNewIcon sx={{ fontSize: 16, color: "text.secondary" }} />
            <MuiLink
              href={value}
              target={openInNewTab ? "_blank" : "_self"}
              rel="noopener noreferrer"
              underline="hover"
              variant="body2"
              sx={{
                color: "primary.main",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "100%",
              }}
            >
              {value}
            </MuiLink>
          </Box>
        )}

        {/* ----- Validation error alert (below everything) ----- */}
        {displayError && (
          <Alert severity="error" sx={{ mt: 0.5 }}>
            {displayError}
          </Alert>
        )}

        {/* ----- Validation errors from FieldRendererProps ----- */}
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

LinkField.displayName = "LinkField";

/* ------------------------------------------------------------------ */
/* Self-registration                                                   */
/* ------------------------------------------------------------------ */

// Register LinkField for FieldType.LINK.
// Consistent with TEXT / TEXTAREA / NUMBER / COLOR self-registration pattern.
registerFieldComponent(
  FieldType.LINK,
  LinkField as React.ComponentType<import("../types").FieldRendererProps>,
);

export { LinkField };
export default LinkField;
