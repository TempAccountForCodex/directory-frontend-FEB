/**
 * FormBuilderBlock — Step 2.29.2 + 2.29.3
 *
 * Renders a fully configurable form from block.content.fields array.
 * - 11 field types: text, email, phone, textarea, select, cascading-select,
 *   file, checkbox, date, number, url
 * - Dynamic Yup validation schema built from field configs
 * - Three layouts: single-column, two-column, compact
 * - Form submission via POST (multipart if file fields present)
 * - States: idle → submitting → success | error
 * - Contact info sidebar with mailto, phone, address
 * - Social links as IconButtons
 * - Security: submitEndpoint sanitized (must start with /)
 */

import React, { memo, useCallback, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import DOMPurify from "dompurify";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Container,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import InstagramIcon from "@mui/icons-material/Instagram";
import FacebookIcon from "@mui/icons-material/Facebook";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import GitHubIcon from "@mui/icons-material/GitHub";
import TwitterIcon from "@mui/icons-material/Twitter";
import { MuiTelInput } from "mui-tel-input";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FieldOption {
  value: string;
  label: string;
  children?: FieldOption[];
}

interface FieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  maxFileSize?: number;
}

interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "phone"
    | "textarea"
    | "select"
    | "cascading-select"
    | "file"
    | "checkbox"
    | "date"
    | "number"
    | "url";
  required?: boolean;
  halfWidth?: boolean;
  placeholder?: string;
  options?: FieldOption[];
  validation?: FieldValidation;
  accept?: string; // for file fields
  maxSize?: number; // bytes, for file fields
}

interface ContactInfo {
  email?: string;
  phone?: string;
  address?: string;
}

interface SocialLinks {
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
}

interface FormBuilderContent {
  title?: string;
  description?: string;
  submitEndpoint: string;
  submitButtonText?: string;
  successMessage?: string;
  layout?: "single-column" | "two-column" | "compact";
  fields: FormField[];
  contactInfo?: ContactInfo | null;
  showSocialLinks?: boolean;
  socialLinks?: SocialLinks;
  primaryColor?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: FormBuilderContent;
  sortOrder: number;
}

interface FormBuilderBlockProps {
  block: Block;
  primaryColor?: string;
}

type SubmitState = "idle" | "submitting" | "success" | "error";

// ---------------------------------------------------------------------------
// Security: sanitize endpoint (must be relative or same-origin)
// ---------------------------------------------------------------------------

/**
 * Sanitize social link URLs — block javascript:, data:, and other dangerous schemes.
 * Allow only http, https, mailto, and tel protocols.
 */
const safeSocialUrl = (url: string): string => {
  if (!url) return "#";
  const trimmed = url.trim().toLowerCase();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("tel:")
  ) {
    return url.trim();
  }
  return "#";
};

const sanitizeEndpoint = (endpoint: string): string => {
  if (!endpoint) return "/api/contact";
  const trimmed = endpoint.trim();
  // Allow only relative paths starting with /
  if (trimmed.startsWith("/")) return trimmed;
  // Reject absolute URLs (open redirect / SSRF risk)
  return "/api/contact";
};

// ---------------------------------------------------------------------------
// Build Yup schema dynamically from field configs
// ---------------------------------------------------------------------------

const buildYupSchema = (fields: FormField[]): Yup.ObjectSchema<any> => {
  const shape: Record<string, Yup.Schema> = {};

  for (const field of fields) {
    const { name, type, required, validation = {} } = field;
    let schema: Yup.Schema;

    if (type === "checkbox") {
      schema = Yup.boolean();
      if (required) {
        schema = (schema as Yup.BooleanSchema).oneOf(
          [true],
          `${field.label} is required`,
        );
      }
    } else if (type === "number") {
      let numSchema = Yup.number()
        .nullable()
        .typeError(`${field.label} must be a number`);
      if (required)
        numSchema = numSchema.required(`${field.label} is required`);
      if (validation.min !== undefined)
        numSchema = numSchema.min(validation.min);
      if (validation.max !== undefined)
        numSchema = numSchema.max(validation.max);
      schema = numSchema;
    } else if (type === "file") {
      let fileSchema = Yup.mixed().nullable();
      if (required)
        fileSchema = (fileSchema as Yup.MixedSchema).required(
          `${field.label} is required`,
        );
      const maxFileSize = field.maxSize || validation?.maxFileSize;
      if (maxFileSize) {
        fileSchema = (fileSchema as Yup.MixedSchema).test(
          "fileSize",
          `File must be smaller than ${Math.round(maxFileSize / (1024 * 1024))} MB`,
          (value) =>
            !value || !(value instanceof File) || value.size <= maxFileSize,
        );
      }
      schema = fileSchema;
    } else {
      // String-based fields
      let strSchema: Yup.StringSchema<string | null | undefined> = Yup.string();

      if (type === "email") {
        strSchema = strSchema.email("Invalid email address");
      } else if (type === "url") {
        strSchema = strSchema.url("Invalid URL address");
      }

      if (validation.minLength !== undefined) {
        strSchema = strSchema.min(
          validation.minLength,
          `Must be at least ${validation.minLength} characters`,
        );
      }
      if (validation.maxLength !== undefined) {
        strSchema = strSchema.max(
          validation.maxLength,
          `Must be at most ${validation.maxLength} characters`,
        );
      }

      if (required) {
        strSchema = strSchema.required(`${field.label} is required`);
      } else {
        strSchema = strSchema.nullable();
      }

      schema = strSchema;
    }

    shape[name] = schema;

    // Cascading select: add sub-field schema
    if (type === "cascading-select") {
      shape[`${name}_sub`] = Yup.string().nullable();
    }
  }

  return Yup.object().shape(shape);
};

// ---------------------------------------------------------------------------
// Build initialValues from field configs
// ---------------------------------------------------------------------------

const buildInitialValues = (fields: FormField[]): Record<string, any> => {
  const values: Record<string, any> = {};
  for (const field of fields) {
    if (field.type === "checkbox") {
      values[field.name] = false;
    } else if (field.type === "file") {
      values[field.name] = null;
    } else {
      values[field.name] = "";
    }
    if (field.type === "cascading-select") {
      values[`${field.name}_sub`] = "";
    }
  }
  return values;
};

// ---------------------------------------------------------------------------
// Check if any field is a file upload (determines multipart encoding)
// ---------------------------------------------------------------------------

const hasFileFields = (fields: FormField[]): boolean =>
  fields.some((f) => f.type === "file");

// ---------------------------------------------------------------------------
// Social icon map
// ---------------------------------------------------------------------------

const SOCIAL_ICONS: Record<string, React.ComponentType<any>> = {
  instagram: InstagramIcon,
  facebook: FacebookIcon,
  linkedin: LinkedInIcon,
  github: GitHubIcon,
  twitter: TwitterIcon,
};

// ---------------------------------------------------------------------------
// Individual field renderers
// ---------------------------------------------------------------------------

interface FieldProps {
  field: FormField;
  formik: ReturnType<typeof useFormik>;
  disabled: boolean;
}

const renderTextField = ({ field, formik, disabled }: FieldProps) => (
  <TextField
    fullWidth
    id={field.name}
    name={field.name}
    label={field.label}
    type="text"
    required={field.required}
    placeholder={field.placeholder}
    value={formik.values[field.name] ?? ""}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
    helperText={
      formik.touched[field.name] && formik.errors[field.name]
        ? String(formik.errors[field.name])
        : ""
    }
    disabled={disabled}
    variant="outlined"
    size="small"
  />
);

const renderEmailField = ({ field, formik, disabled }: FieldProps) => (
  <TextField
    fullWidth
    id={field.name}
    name={field.name}
    label={field.label}
    type="email"
    required={field.required}
    placeholder={field.placeholder}
    value={formik.values[field.name] ?? ""}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
    helperText={
      formik.touched[field.name] && formik.errors[field.name]
        ? String(formik.errors[field.name])
        : ""
    }
    disabled={disabled}
    variant="outlined"
    size="small"
  />
);

const renderPhoneField = ({ field, formik, disabled }: FieldProps) => (
  <FormControl fullWidth>
    <MuiTelInput
      label={field.label}
      value={formik.values[field.name] ?? ""}
      onChange={(val) => formik.setFieldValue(field.name, val)}
      onBlur={() => formik.setFieldTouched(field.name, true)}
      disabled={disabled}
      defaultCountry="US"
      preferredCountries={["US", "GB", "CA"]}
    />
    {formik.touched[field.name] && formik.errors[field.name] && (
      <FormHelperText error>{String(formik.errors[field.name])}</FormHelperText>
    )}
  </FormControl>
);

const renderTextareaField = ({ field, formik, disabled }: FieldProps) => (
  <TextField
    fullWidth
    id={field.name}
    name={field.name}
    label={field.label}
    required={field.required}
    placeholder={field.placeholder}
    value={formik.values[field.name] ?? ""}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
    helperText={
      formik.touched[field.name] && formik.errors[field.name]
        ? String(formik.errors[field.name])
        : ""
    }
    disabled={disabled}
    multiline
    rows={4}
    variant="outlined"
    size="small"
  />
);

const renderSelectField = ({ field, formik, disabled }: FieldProps) => {
  const labelId = `${field.name}-label`;
  return (
    <FormControl fullWidth variant="outlined" size="small">
      <InputLabel id={labelId} required={field.required}>
        {field.label}
      </InputLabel>
      <Select
        labelId={labelId}
        id={field.name}
        name={field.name}
        label={field.label}
        value={formik.values[field.name] ?? ""}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
        disabled={disabled}
        inputProps={{ "aria-labelledby": labelId }}
      >
        <MenuItem value="">
          <em>Select an option</em>
        </MenuItem>
        {(field.options || []).map((opt) => (
          <MenuItem key={opt.value} value={opt.value}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
      {formik.touched[field.name] && formik.errors[field.name] && (
        <FormHelperText error>
          {String(formik.errors[field.name])}
        </FormHelperText>
      )}
    </FormControl>
  );
};

// ---------------------------------------------------------------------------
// Cascading Select (2.29.3)
// ---------------------------------------------------------------------------

interface CascadingSelectProps extends FieldProps {
  onParentChange: (parentName: string, subName: string, value: string) => void;
}

const CascadingSelectField: React.FC<CascadingSelectProps> = ({
  field,
  formik,
  disabled,
  onParentChange,
}) => {
  const parentValue = formik.values[field.name] ?? "";
  const subFieldName = `${field.name}_sub`;
  const subValue = formik.values[subFieldName] ?? "";

  const parentLabelId = `${field.name}-label`;
  const childLabelId = `${subFieldName}-label`;

  // Derive child options from selected parent value
  const childOptions = useMemo(() => {
    if (!parentValue) return [];
    const parentOption = (field.options || []).find(
      (o) => o.value === parentValue,
    );
    return parentOption?.children || [];
  }, [parentValue, field.options]);

  const handleParentChange = useCallback(
    (e: React.ChangeEvent<{ value: unknown }>) => {
      const value = e.target.value as string;
      onParentChange(field.name, subFieldName, value);
    },
    [field.name, subFieldName, onParentChange],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Parent select */}
      <FormControl fullWidth variant="outlined" size="small">
        <InputLabel id={parentLabelId} required={field.required}>
          {field.label}
        </InputLabel>
        <Select
          labelId={parentLabelId}
          id={field.name}
          name={field.name}
          label={field.label}
          value={parentValue}
          onChange={handleParentChange as any}
          onBlur={formik.handleBlur}
          error={
            formik.touched[field.name] && Boolean(formik.errors[field.name])
          }
          disabled={disabled}
          inputProps={{ "aria-labelledby": parentLabelId }}
        >
          <MenuItem value="">
            <em>Select an option</em>
          </MenuItem>
          {(field.options || []).map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
        {formik.touched[field.name] && formik.errors[field.name] && (
          <FormHelperText error>
            {String(formik.errors[field.name])}
          </FormHelperText>
        )}
      </FormControl>

      {/* Child select — visually indented */}
      <Box sx={{ ml: 3 }}>
        <FormControl fullWidth variant="outlined" size="small">
          <InputLabel id={childLabelId}>
            {field.label} (sub-category)
          </InputLabel>
          <Select
            labelId={childLabelId}
            id={subFieldName}
            name={subFieldName}
            label={`${field.label} (sub-category)`}
            value={subValue}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            disabled={disabled || !parentValue}
            inputProps={{ "aria-labelledby": childLabelId }}
          >
            {!parentValue && (
              <MenuItem value="" disabled>
                <em>Select a parent first</em>
              </MenuItem>
            )}
            {childOptions.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

const renderFileField = ({ field, formik, disabled }: FieldProps) => (
  <FormControl fullWidth>
    <Typography
      variant="caption"
      color="text.secondary"
      sx={{ mb: 0.5, display: "block" }}
    >
      {field.label}
      {field.required && " *"}
    </Typography>
    <Box
      sx={{
        border: "2px dashed",
        borderColor:
          formik.touched[field.name] && formik.errors[field.name]
            ? "error.main"
            : "divider",
        borderRadius: 1,
        p: 2,
        textAlign: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        "&:hover": { borderColor: disabled ? "divider" : "primary.main" },
      }}
    >
      <input
        id={field.name}
        name={field.name}
        type="file"
        accept={field.accept}
        aria-label={field.label}
        disabled={disabled}
        style={{ display: "block", width: "100%" }}
        onChange={(e) => {
          const file = e.currentTarget.files?.[0] ?? null;
          formik.setFieldValue(field.name, file);
        }}
        onBlur={formik.handleBlur}
      />
    </Box>
    {formik.touched[field.name] && formik.errors[field.name] && (
      <FormHelperText error>{String(formik.errors[field.name])}</FormHelperText>
    )}
  </FormControl>
);

const renderCheckboxField = ({ field, formik, disabled }: FieldProps) => (
  <FormControl
    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
  >
    <FormControlLabel
      control={
        <Checkbox
          id={field.name}
          name={field.name}
          checked={Boolean(formik.values[field.name])}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={disabled}
        />
      }
      label={`${field.label}${field.required ? " *" : ""}`}
    />
    {formik.touched[field.name] && formik.errors[field.name] && (
      <FormHelperText>{String(formik.errors[field.name])}</FormHelperText>
    )}
  </FormControl>
);

const renderDateField = ({ field, formik, disabled }: FieldProps) => (
  <TextField
    fullWidth
    id={field.name}
    name={field.name}
    label={field.label}
    type="date"
    required={field.required}
    value={formik.values[field.name] ?? ""}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
    helperText={
      formik.touched[field.name] && formik.errors[field.name]
        ? String(formik.errors[field.name])
        : ""
    }
    disabled={disabled}
    variant="outlined"
    size="small"
    InputLabelProps={{ shrink: true }}
  />
);

const renderNumberField = ({ field, formik, disabled }: FieldProps) => (
  <TextField
    fullWidth
    id={field.name}
    name={field.name}
    label={field.label}
    type="number"
    required={field.required}
    placeholder={field.placeholder}
    value={formik.values[field.name] ?? ""}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
    helperText={
      formik.touched[field.name] && formik.errors[field.name]
        ? String(formik.errors[field.name])
        : ""
    }
    disabled={disabled}
    variant="outlined"
    size="small"
  />
);

const renderUrlField = ({ field, formik, disabled }: FieldProps) => (
  <TextField
    fullWidth
    id={field.name}
    name={field.name}
    label={field.label}
    type="url"
    required={field.required}
    placeholder={field.placeholder}
    value={formik.values[field.name] ?? ""}
    onChange={formik.handleChange}
    onBlur={formik.handleBlur}
    error={formik.touched[field.name] && Boolean(formik.errors[field.name])}
    helperText={
      formik.touched[field.name] && formik.errors[field.name]
        ? String(formik.errors[field.name])
        : ""
    }
    disabled={disabled}
    variant="outlined"
    size="small"
  />
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const FormBuilderBlockBase: React.FC<FormBuilderBlockProps> = ({
  block,
  primaryColor,
}) => {
  const content = block.content;
  const {
    title,
    description,
    submitEndpoint,
    submitButtonText = "Submit",
    successMessage = "Your form has been submitted successfully!",
    layout = "single-column",
    fields = [],
    contactInfo,
    showSocialLinks = false,
    socialLinks = {},
  } = content;

  const resolvedPrimaryColor =
    primaryColor || content.primaryColor || "#2563eb";
  const safeEndpoint = useMemo(
    () => sanitizeEndpoint(submitEndpoint),
    [submitEndpoint],
  );

  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Memoized validation schema
  const validationSchema = useMemo(() => buildYupSchema(fields), [fields]);

  // Memoized initial values
  const initialValues = useMemo(() => buildInitialValues(fields), [fields]);

  // Is submitting
  const isSubmitting = submitState === "submitting";

  const formik = useFormik({
    initialValues,
    validationSchema,
    validateOnBlur: true,
    validateOnChange: false,
    onSubmit: async (values, { resetForm }) => {
      setSubmitState("submitting");
      setErrorMessage("");

      try {
        const useMultipart = hasFileFields(fields);
        let body: BodyInit;
        const headers: Record<string, string> = {};

        if (useMultipart) {
          const formData = new FormData();
          for (const [key, value] of Object.entries(values)) {
            if (value instanceof File) {
              formData.append(key, value);
            } else if (value !== null && value !== undefined) {
              formData.append(key, String(value));
            }
          }
          body = formData;
          // Don't set Content-Type for FormData (browser sets boundary automatically)
        } else {
          body = JSON.stringify(values);
          headers["Content-Type"] = "application/json";
        }

        const response = await fetch(safeEndpoint, {
          method: "POST",
          headers,
          body,
        });

        if (!response.ok) {
          let msg = "Submission failed. Please try again.";
          try {
            const data = await response.json();
            if (data?.message) msg = data.message;
          } catch {
            // ignore parse error
          }
          throw new Error(msg);
        }

        setSubmitState("success");
        resetForm();
      } catch (err: any) {
        setErrorMessage(
          err?.message || "An unexpected error occurred. Please try again.",
        );
        setSubmitState("error");
      }
    },
  });

  // Cascading select parent change handler (clears child value)
  const handleCascadeParentChange = useCallback(
    (parentName: string, subName: string, value: string) => {
      formik.setFieldValue(parentName, value);
      formik.setFieldValue(subName, "");
    },
    [formik],
  );

  // Retry handler
  const handleRetry = useCallback(() => {
    setSubmitState("idle");
    setErrorMessage("");
  }, []);

  // Determine layout spacing
  const gridSpacing = layout === "compact" ? 1 : 2;
  const containerPy = layout === "compact" ? 4 : 8;

  // Render a single field
  const renderField = useCallback(
    (field: FormField) => {
      const fieldProps: FieldProps = { field, formik, disabled: isSubmitting };

      switch (field.type) {
        case "text":
          return renderTextField(fieldProps);
        case "email":
          return renderEmailField(fieldProps);
        case "phone":
          return renderPhoneField(fieldProps);
        case "textarea":
          return renderTextareaField(fieldProps);
        case "select":
          return renderSelectField(fieldProps);
        case "cascading-select":
          return (
            <CascadingSelectField
              key={field.name}
              {...fieldProps}
              onParentChange={handleCascadeParentChange}
            />
          );
        case "file":
          return renderFileField(fieldProps);
        case "checkbox":
          return renderCheckboxField(fieldProps);
        case "date":
          return renderDateField(fieldProps);
        case "number":
          return renderNumberField(fieldProps);
        case "url":
          return renderUrlField(fieldProps);
        default:
          return renderTextField(fieldProps);
      }
    },
    [formik, isSubmitting, handleCascadeParentChange],
  );

  // Determine grid size for a field
  const getGridSize = (field: FormField) => {
    if (layout === "two-column" && field.halfWidth) {
      return { xs: 12, sm: 6 };
    }
    return { xs: 12 };
  };

  const hasContactInfo =
    contactInfo &&
    (contactInfo.email || contactInfo.phone || contactInfo.address);

  const activeSocialLinks = useMemo(
    () =>
      showSocialLinks
        ? Object.entries(socialLinks).filter(([, url]) => Boolean(url))
        : [],
    [showSocialLinks, socialLinks],
  );

  const hasSideContent = hasContactInfo || activeSocialLinks.length > 0;

  return (
    <Box sx={{ py: containerPy, bgcolor: "background.default" }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Contact info / social links sidebar */}
          {hasSideContent && (
            <Grid item xs={12} md={4}>
              <Box sx={{ pr: { md: 2 } }}>
                {title && (
                  <Typography
                    variant="h5"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}
                  >
                    {DOMPurify.sanitize(title)}
                  </Typography>
                )}
                {description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 3 }}
                  >
                    {DOMPurify.sanitize(description)}
                  </Typography>
                )}

                {/* Contact info */}
                {hasContactInfo && (
                  <Box sx={{ mb: 3 }}>
                    {contactInfo?.email && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <EmailIcon fontSize="small" color="action" />
                        <Typography
                          component="a"
                          href={`mailto:${contactInfo.email}`}
                          variant="body2"
                          sx={{
                            color: resolvedPrimaryColor,
                            textDecoration: "none",
                            "&:hover": { textDecoration: "underline" },
                          }}
                        >
                          {contactInfo.email}
                        </Typography>
                      </Box>
                    )}
                    {contactInfo?.phone && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {contactInfo.phone}
                        </Typography>
                      </Box>
                    )}
                    {contactInfo?.address && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 1,
                          mb: 1.5,
                        }}
                      >
                        <LocationOnIcon
                          fontSize="small"
                          color="action"
                          sx={{ mt: 0.3 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {contactInfo.address}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Social links */}
                {activeSocialLinks.length > 0 && (
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {activeSocialLinks.map(([platform, url]) => {
                      const IconComponent =
                        SOCIAL_ICONS[platform.toLowerCase()];
                      if (!IconComponent) return null;
                      return (
                        <IconButton
                          key={platform}
                          component="a"
                          href={safeSocialUrl(url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={platform}
                          size="small"
                          sx={{
                            color: "text.secondary",
                            "&:hover": { color: resolvedPrimaryColor },
                          }}
                        >
                          <IconComponent fontSize="small" />
                        </IconButton>
                      );
                    })}
                  </Box>
                )}
              </Box>
            </Grid>
          )}

          {/* Form */}
          <Grid item xs={12} md={hasSideContent ? 8 : 12}>
            {/* Title / description when no sidebar */}
            {!hasSideContent && (title || description) && (
              <Box sx={{ mb: 3 }}>
                {title && (
                  <Typography
                    variant="h4"
                    component="h2"
                    gutterBottom
                    sx={{ fontWeight: 700, color: "text.primary" }}
                  >
                    {DOMPurify.sanitize(title)}
                  </Typography>
                )}
                {description && (
                  <Typography variant="body1" color="text.secondary">
                    {DOMPurify.sanitize(description)}
                  </Typography>
                )}
              </Box>
            )}

            {/* Success state */}
            {submitState === "success" && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            {/* Error state */}
            {submitState === "error" && (
              <Alert
                severity="error"
                sx={{ mb: 3 }}
                action={
                  <Button color="inherit" size="small" onClick={handleRetry}>
                    Try Again
                  </Button>
                }
              >
                {errorMessage || "Submission failed. Please try again."}
              </Alert>
            )}

            {/* Form — hidden on success */}
            {submitState !== "success" && (
              <Box component="form" onSubmit={formik.handleSubmit} noValidate>
                <Grid container spacing={gridSpacing}>
                  {fields.map((field) => (
                    <Grid item key={field.name} {...getGridSize(field)}>
                      {renderField(field)}
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{ mt: layout === "compact" ? 2 : 3 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size={layout === "compact" ? "medium" : "large"}
                    disabled={isSubmitting}
                    startIcon={
                      isSubmitting ? (
                        <CircularProgress size={16} color="inherit" />
                      ) : undefined
                    }
                    sx={{
                      bgcolor: resolvedPrimaryColor,
                      "&:hover": {
                        bgcolor: resolvedPrimaryColor,
                        opacity: 0.9,
                      },
                      minWidth: 140,
                    }}
                  >
                    {isSubmitting ? "Sending…" : submitButtonText}
                  </Button>
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const FormBuilderBlock = memo(FormBuilderBlockBase);
FormBuilderBlock.displayName = "FormBuilderBlock";

export default FormBuilderBlock;
