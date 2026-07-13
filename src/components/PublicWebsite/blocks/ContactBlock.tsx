/**
 * ContactBlock — Step 16.6
 *
 * Renders a contact section with three layout modes:
 *  - 'stacked' (default): single-column, existing behavior preserved
 *  - 'split-image': CSS Grid with image column + form column side-by-side
 *  - 'split-info': CSS Grid with info panel (address, phone, email + optional map)
 *    and configurable form side-by-side. `formFields` array allows custom fields.
 *
 * Fields:
 *   layout        'stacked' | 'split-image' | 'split-info'
 *   contactImage  URL — image shown in split-image layout
 *   imageRatio    'equal' | 'wide-image' | 'wide-form'
 *   infoPosition  'left' | 'right' — which side shows info (split-info)
 *   showMap       boolean — show map placeholder in info panel
 *   formFields    array — configurable form fields [{label, fieldType, required}]
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Alert,
  Card,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import DOMPurify from "dompurify";
import { BlockWrapper } from "../BlockWrapper";
import {
  classifyContactField,
  fieldTypeForKind,
  isEditorPreviewEnvironment,
  isValidEmail,
  submitWebsiteFormSubmission,
} from "@/api/formSubmissions";
import { isAxiosError } from "@/api/client";

// ── Types ──────────────────────────────────────────────────────────────────

interface FormFieldConfig {
  label: string;
  fieldType: "text" | "email" | "tel" | "textarea";
  required?: boolean;
}

interface ContactContent {
  heading?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  showForm?: boolean;
  layout?: "stacked" | "split-image" | "split-info";
  contactImage?: string;
  imageRatio?: "equal" | "wide-image" | "wide-form";
  infoPosition?: "left" | "right";
  showMap?: boolean;
  formFields?: FormFieldConfig[];
  fieldVariant?: "outlined" | "standard" | "filled";
  fieldColor?: string;
  websiteId?: string | number;
  [key: string]: unknown;
}

interface Block {
  id: number;
  blockType: string;
  content: ContactContent;
  sortOrder: number;
}

interface ContactBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  websiteId?: string | number;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────

const RATIO_MAP: Record<string, string> = {
  equal: "1fr 1fr",
  "wide-image": "1.1fr 0.9fr",
  "wide-form": "0.9fr 1.1fr",
};

// ── Field color sx helper ──────────────────────────────────────────────────

function getFieldColorSx(variant: string, color: string): object {
  if (!color) return {};
  if (variant === "standard") {
    return {
      "& .MuiInputLabel-root": { color, opacity: 0.88 },
      "& .MuiInputLabel-root.MuiFormLabel-filled": { color, opacity: 0.92 },
      "& .MuiInput-underline:after": { borderBottomColor: color },
      "& .MuiInputLabel-root.Mui-focused": { color },
      "& .MuiFormLabel-asterisk": { color: "#d32f2f" },
    };
  }
  if (variant === "filled") {
    return {
      "& .MuiInputLabel-root": { color, opacity: 0.88 },
      "& .MuiInputLabel-root.MuiFormLabel-filled": { color, opacity: 0.92 },
      "& .MuiFilledInput-root:after": { borderBottomColor: color },
      "& .MuiInputLabel-root.Mui-focused": { color },
      "& .MuiFormLabel-asterisk": { color: "#d32f2f" },
    };
  }
  // outlined (default)
  return {
    "& .MuiInputLabel-root": { color, opacity: 0.88 },
    "& .MuiInputLabel-root.MuiFormLabel-filled": { color, opacity: 0.92 },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: color,
    },
    "& .MuiInputLabel-root.Mui-focused": { color },
    "& .MuiInputLabel-root.Mui-error": { color: "#d32f2f", opacity: 1 },
    "& .MuiFormLabel-asterisk": { color: "#d32f2f" },
  };
}

// ── API URL ───────────────────────────────────────────────────────────────

// ── Sub-components ─────────────────────────────────────────────────────────

const DEFAULT_FORM_FIELDS: FormFieldConfig[] = [
  { label: "Name", fieldType: "text", required: true },
  { label: "Email", fieldType: "email", required: true },
  { label: "Message", fieldType: "textarea", required: true },
];

interface ContactFormProps {
  primaryColor: string;
  fieldVariant?: "outlined" | "standard" | "filled";
  fieldColor?: string;
  formFields?: FormFieldConfig[];
  content?: ContactContent;
  websiteId?: string | number;
  /** Source block id + heading, so the dashboard can attribute/filter submissions. */
  formId?: string | number;
  formName?: string;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

function ContactForm({
  primaryColor,
  fieldVariant = "outlined",
  fieldColor = "",
  formFields,
  content,
  websiteId,
  formId,
  formName,
  onFormSubmit,
}: ContactFormProps) {
  const fields = useMemo(
    () =>
      formFields && formFields.length > 0 ? formFields : DEFAULT_FORM_FIELDS,
    [formFields],
  );
  const buildFormData = useCallback((nextFields: FormFieldConfig[]) => {
    const init: Record<string, string> = {};
    nextFields.forEach((f) => {
      init[f.label] = "";
    });
    return init;
  }, []);
  const [formData, setFormData] = useState<Record<string, string>>(() =>
    buildFormData(fields),
  );
  const [formStatus, setFormStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setFormData((prev) => {
      const next = buildFormData(fields);
      let changed = false;

      fields.forEach((field) => {
        const previousValue = prev[field.label];
        if (previousValue !== undefined) {
          next[field.label] = previousValue;
        }
      });

      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      if (prevKeys.length !== nextKeys.length) {
        changed = true;
      } else {
        changed = nextKeys.some((key) => prev[key] !== next[key]);
      }

      return changed ? next : prev;
    });
    setFieldErrors({});
  }, [buildFormData, fields]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFieldErrors((prev) => {
        if (!prev[name]) return prev;
        const next = { ...prev };
        delete next[name];
        return next;
      });
      if (formStatus === "error") {
        setFormStatus("idle");
        setErrorMessage("");
      }
    },
    [formStatus],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Editor preview: never validate or persist while designing.
      if (isEditorPreviewEnvironment()) return;

      // Classify every visible field and read its trimmed value.
      const builtFields = fields.map((f) => ({
        label: f.label,
        kind: classifyContactField(f.label),
        required: f.required !== false,
        value: (formData[f.label] || "").trim(),
      }));

      const nextErrors: Record<string, string> = {};
      builtFields.forEach((field) => {
        if (field.required && !field.value) {
          nextErrors[field.label] = "This field is required.";
        }
      });
      const emailField = builtFields.find((f) => f.kind === "email");
      if (emailField?.value && !isValidEmail(emailField.value)) {
        nextErrors[emailField.label] = "Enter a valid email address.";
      }

      if (Object.keys(nextErrors).length > 0 || builtFields.every((f) => !f.value)) {
        setFieldErrors(nextErrors);
        setErrorMessage("Please fill in all required fields.");
        setFormStatus("error");
        return;
      }

      const effectiveWebsiteId = websiteId ?? content?.websiteId;
      if (!effectiveWebsiteId) {
        setErrorMessage(
          "This form isn't connected yet. Please try again later.",
        );
        setFormStatus("error");
        return;
      }

      setFormStatus("loading");
      setErrorMessage("");

      const nameField = builtFields.find((f) => f.kind === "name");

      try {
        await submitWebsiteFormSubmission(effectiveWebsiteId, {
          submitterName: nameField?.value || undefined,
          submitterEmail: emailField?.value || undefined,
          source: "contact-block",
          ...(formId != null ? { formId: String(formId) } : {}),
          ...(formName ? { formName } : {}),
          formData: builtFields.map((f) => ({
            fieldName: f.label,
            fieldValue: f.value,
            fieldType: fieldTypeForKind(f.kind),
          })),
        });

        setFormStatus("success");
        setFieldErrors({});
        onFormSubmit?.("contact", true);
        setFormData(buildFormData(fields));
        setTimeout(() => setFormStatus("idle"), 5000);
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 429) {
          setErrorMessage("Too many requests. Please try again later.");
        } else {
          setErrorMessage(
            "Unable to send message. Please check your connection and try again.",
          );
        }
        setFormStatus("error");
        onFormSubmit?.("contact", false);
      }
    },
    [
      buildFormData,
      formData,
      fields,
      content,
      websiteId,
      formId,
      formName,
      onFormSubmit,
    ],
  );

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{ display: "flex", flexDirection: "column", gap: 2 }}
    >
      {formStatus === "success" && (
        <Alert severity="success">
          Thank you! Your message has been sent successfully.
        </Alert>
      )}
      {formStatus === "error" && (
        <Alert severity="error">
          {errorMessage ||
            "Sorry, there was an error sending your message. Please try again."}
        </Alert>
      )}
      {fields.map((field) => (
        <TextField
          key={field.label}
          fullWidth
          label={field.required !== false ? `${field.label} *` : field.label}
          name={field.label}
          type={
            field.fieldType === "email"
              ? "email"
              : field.fieldType === "tel"
                ? "tel"
                : "text"
          }
          value={formData[field.label] ?? ""}
          onChange={handleChange}
          required={field.required !== false}
          multiline={field.fieldType === "textarea"}
          rows={field.fieldType === "textarea" ? 4 : undefined}
          variant={fieldVariant}
          sx={getFieldColorSx(fieldVariant, fieldColor)}
          disabled={formStatus === "loading"}
          error={Boolean(fieldErrors[field.label])}
          helperText={fieldErrors[field.label] || " "}
          inputProps={{ "aria-label": field.label }}
        />
      ))}
      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={formStatus === "loading"}
        sx={{
          bgcolor: primaryColor,
          "&:hover": { bgcolor: primaryColor, opacity: 0.9 },
        }}
      >
        {formStatus === "loading" ? (
          <CircularProgress size={22} color="inherit" />
        ) : (
          "Send Message"
        )}
      </Button>
    </Box>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

const ContactBlock = React.memo(function ContactBlock({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#475569",
  websiteId,
  onFormSubmit,
}: ContactBlockProps) {
  const content = (block.content ?? {}) as ContactContent;
  const effectiveWebsiteId = websiteId ?? content.websiteId;

  const layout = content.layout ?? "stacked";
  const contactImage = content.contactImage ?? "";
  const imageRatio = content.imageRatio ?? "equal";
  const gridColumns = RATIO_MAP[imageRatio] ?? "1fr 1fr";
  const fieldVariant = content.fieldVariant ?? "outlined";
  const fieldColor = content.fieldColor ?? "";

  const safeHeading = DOMPurify.sanitize(content.heading ?? "Get In Touch");
  const safeDescription = DOMPurify.sanitize(content.description ?? "");

  const { ref, inView } = useInView({ threshold: 0.15, triggerOnce: true });

  // ── Contact info section (used in stacked layout) ──────────────────────
  const contactInfo = (
    <Box sx={{ mb: content.showForm ? 3 : 0 }}>
      <Typography
        variant="body2"
        sx={{ mb: 1, fontWeight: 500, color: bodyColor }}
      >
        Email: {content.email || "contact@example.com"}
      </Typography>
      {content.phone && (
        <Typography
          variant="body2"
          sx={{ mb: 1, fontWeight: 500, color: bodyColor }}
        >
          Phone: {content.phone}
        </Typography>
      )}
      {content.address && (
        <Typography variant="body2" sx={{ fontWeight: 500, color: bodyColor }}>
          Address: {content.address}
        </Typography>
      )}
    </Box>
  );

  // ── Split-image layout ──────────────────────────────────────────────────
  if (layout === "split-image") {
    return (
      <BlockWrapper
        fields={
          content as unknown as import("../BlockWrapper").BlockWrapperFields
        }
      >
        <Box component="section" ref={ref} sx={{ overflow: "hidden" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: gridColumns },
                minHeight: { xs: "auto", md: 480 },
              }}
            >
              {/* Image cell */}
              <Box
                data-testid="contact-image-cell"
                sx={{
                  position: "relative",
                  minHeight: { xs: 280, md: 400 },
                  overflow: "hidden",
                }}
              >
                {contactImage ? (
                  <Box
                    component="img"
                    src={contactImage}
                    alt="Contact section"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      borderRadius: 2,
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      width: "100%",
                      height: "100%",
                      bgcolor: "grey.200",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No image
                    </Typography>
                  </Box>
                )}
              </Box>

              {/* Form cell */}
              <Box
                data-testid="contact-form-cell"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: { xs: 3, md: 6 },
                  py: { xs: 4, md: 6 },
                }}
              >
                <Box sx={{ width: "100%", maxWidth: 420 }}>
                  {safeHeading && (
                    <Typography
                      variant="h4"
                      component="h2"
                      sx={{ mb: 1, fontWeight: 700, color: headingColor }}
                    >
                      {safeHeading}
                    </Typography>
                  )}
                  {safeDescription && (
                    <Typography
                      variant="body1"
                      sx={{ mb: 2, color: bodyColor }}
                    >
                      {safeDescription}
                    </Typography>
                  )}
                  {contactInfo}
                  {content.showForm !== false && (
                    <ContactForm
                      primaryColor={primaryColor}
                      fieldVariant={fieldVariant}
                      fieldColor={fieldColor}
                      content={content}
                      websiteId={effectiveWebsiteId}
                      formId={block.id}
                      formName={content.heading || "Contact form"}
                      onFormSubmit={onFormSubmit}
                    />
                  )}
                </Box>
              </Box>
            </Box>
          </motion.div>
        </Box>
      </BlockWrapper>
    );
  }

  // ── Split-info layout ───────────────────────────────────────────────────
  if (layout === "split-info") {
    const infoPosition = content.infoPosition ?? "left";
    const showMap = content.showMap ?? false;
    const infoOnLeft = infoPosition === "left";

    const infoPanel = (
      <Box
        data-testid="contact-info-panel"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 3,
          p: { xs: 3, md: 5 },
          bgcolor: "grey.50",
          borderRadius: 2,
        }}
      >
        {safeHeading && (
          <Typography
            variant="h4"
            component="h2"
            sx={{ fontWeight: 700, color: headingColor }}
          >
            {safeHeading}
          </Typography>
        )}
        {safeDescription && (
          <Typography variant="body1" sx={{ color: bodyColor }}>
            {safeDescription}
          </Typography>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {content.email && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: primaryColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ color: "#fff", fontSize: 16 }}>✉</Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: bodyColor, display: "block" }}
                >
                  Email
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: headingColor }}
                >
                  {content.email}
                </Typography>
              </Box>
            </Box>
          )}
          {content.phone && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: primaryColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ color: "#fff", fontSize: 16 }}>☎</Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: bodyColor, display: "block" }}
                >
                  Phone
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: headingColor }}
                >
                  {content.phone}
                </Typography>
              </Box>
            </Box>
          )}
          {content.address && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  bgcolor: primaryColor,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Typography sx={{ color: "#fff", fontSize: 16 }}>⌂</Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{ color: bodyColor, display: "block" }}
                >
                  Address
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: headingColor }}
                >
                  {content.address}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
        {showMap && (
          <Box
            data-testid="contact-map-placeholder"
            sx={{
              width: "100%",
              height: 180,
              bgcolor: "grey.200",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Map
            </Typography>
          </Box>
        )}
      </Box>
    );

    const formPanel = (
      <Box
        data-testid="contact-form-panel"
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          p: { xs: 3, md: 5 },
        }}
      >
        {content.showForm !== false && (
          <ContactForm
            primaryColor={primaryColor}
            fieldVariant={fieldVariant}
            fieldColor={fieldColor}
            formFields={content.formFields}
            content={content}
            websiteId={effectiveWebsiteId}
            formId={block.id}
            formName={content.heading || "Contact form"}
            onFormSubmit={onFormSubmit}
          />
        )}
      </Box>
    );

    return (
      <BlockWrapper
        fields={
          content as unknown as import("../BlockWrapper").BlockWrapperFields
        }
      >
        <Box component="section" ref={ref} sx={{ overflow: "hidden" }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Container maxWidth="lg">
              <Box
                data-testid="contact-split-info"
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: { xs: 0, md: 4 },
                  py: { xs: 4, md: 6 },
                }}
              >
                {infoOnLeft ? (
                  <>
                    {infoPanel}
                    {formPanel}
                  </>
                ) : (
                  <>
                    {formPanel}
                    {infoPanel}
                  </>
                )}
              </Box>
            </Container>
          </motion.div>
        </Box>
      </BlockWrapper>
    );
  }

  // ── Stacked layout (default) ────────────────────────────────────────────
  return (
    <BlockWrapper
      fields={
        content as unknown as import("../BlockWrapper").BlockWrapperFields
      }
    >
      <Box
        component="section"
        sx={{ py: { xs: 4, md: 6 }, bgcolor: "background.default" }}
      >
        <Container maxWidth="md">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 4, fontWeight: 600, color: headingColor }}
            >
              {safeHeading}
            </Typography>
            <Card elevation={2} sx={{ p: 4 }}>
              {safeDescription && (
                <Typography
                  variant="body1"
                  sx={{ mb: 3, textAlign: "center", color: bodyColor }}
                >
                  {safeDescription}
                </Typography>
              )}
              {contactInfo}
              {content.showForm !== false && (
                <Box sx={{ mt: 3 }}>
                  <ContactForm
                    primaryColor={primaryColor}
                    fieldVariant={fieldVariant}
                    fieldColor={fieldColor}
                    content={content}
                    websiteId={effectiveWebsiteId}
                    formId={block.id}
                    formName={content.heading || "Contact form"}
                    onFormSubmit={onFormSubmit}
                  />
                </Box>
              )}
            </Card>
          </motion.div>
        </Container>
      </Box>
    </BlockWrapper>
  );
});

export default ContactBlock;
