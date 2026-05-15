/**
 * AIQuestionnaire — Step 3 of Website Creation Wizard
 *
 * Grouped layout with required fields (Group 1) and optional fields (Group 2 accordion).
 * Uses Dashboard shared components. Step 3.17.
 */

import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Box,
  Grid,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import { motion, AnimatePresence } from "framer-motion";
// @ts-ignore
import { DashboardInput, DashboardSelect } from "../Dashboard/shared";
// @ts-ignore
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import {
  BUSINESS_TYPES,
  BRAND_PERSONALITIES,
  type QuestionnaireData,
  type ValidationErrors,
  type SocialLinks,
} from "../../hooks/useAIQuestionnaire";

interface AIQuestionnaireProps {
  data: QuestionnaireData;
  errors: ValidationErrors;
  updateField: <K extends keyof QuestionnaireData>(
    field: K,
    value: QuestionnaireData[K],
  ) => void;
  updateSocialLink: (platform: keyof SocialLinks, value: string) => void;
  optionalFieldsFilled: number;
}

const ACCEPTED_LOGO_TYPES = ["image/jpeg", "image/png", "image/svg+xml"];
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

const RequiredFields = React.memo(function RequiredFields({
  data,
  errors,
  onFieldChange,
  firstErrorRef,
}: {
  data: QuestionnaireData;
  errors: ValidationErrors;
  onFieldChange: (field: keyof QuestionnaireData, value: string) => void;
  firstErrorRef: React.Ref<HTMLDivElement>;
}) {
  const businessTypeOptions = useMemo(
    () =>
      BUSINESS_TYPES.map((bt) => (
        <MenuItem key={bt.value} value={bt.value}>
          {bt.label}
        </MenuItem>
      )),
    [],
  );

  const handleWebsiteName = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange("websiteName", e.target.value);
    },
    [onFieldChange],
  );

  const handleBusinessType = useCallback(
    (e: { target: { value: string } }) => {
      onFieldChange("businessType", e.target.value);
    },
    [onFieldChange],
  );

  const handleEmail = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange("email", e.target.value);
    },
    [onFieldChange],
  );

  const handlePhone = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange("phone", e.target.value);
    },
    [onFieldChange],
  );

  const handleAddress = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange("address", e.target.value);
    },
    [onFieldChange],
  );

  const handleServices = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFieldChange("services", e.target.value);
    },
    [onFieldChange],
  );

  return (
    <Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, mb: 2 }}
        id="required-fields-heading"
      >
        Business Information
      </Typography>
      <Typography variant="body2" sx={{ mb: 3, opacity: 0.7 }}>
        Tell us about your business so we can generate tailored content.
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <div ref={errors.websiteName ? firstErrorRef : undefined}>
            <DashboardInput
              label="Website Name"
              value={data.websiteName}
              onChange={handleWebsiteName}
              error={!!errors.websiteName}
              helperText={errors.websiteName}
              required
              aria-label="Website name"
              aria-required="true"
              aria-describedby={
                errors.websiteName ? "websiteName-error" : undefined
              }
              inputProps={{ minLength: 3, maxLength: 255 }}
              placeholder="e.g. My Business Website"
            />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <div ref={errors.businessType ? firstErrorRef : undefined}>
            <DashboardSelect
              label="Business Type"
              value={data.businessType}
              onChange={handleBusinessType}
              error={!!errors.businessType}
              helperText={errors.businessType}
              required
              displayEmpty
              aria-label="Business type"
              aria-required="true"
            >
              <MenuItem value="" disabled>
                Select business type
              </MenuItem>
              {businessTypeOptions}
            </DashboardSelect>
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <div ref={errors.email ? firstErrorRef : undefined}>
            <DashboardInput
              label="Business Email"
              type="email"
              value={data.email}
              onChange={handleEmail}
              error={!!errors.email}
              helperText={errors.email}
              required
              aria-label="Business email"
              aria-required="true"
              placeholder="contact@yourbusiness.com"
            />
          </div>
        </Grid>
        <Grid item xs={12} md={6}>
          <DashboardInput
            label="Phone (Optional)"
            type="tel"
            value={data.phone}
            onChange={handlePhone}
            aria-label="Phone number"
            placeholder="+1 (555) 000-0000"
          />
        </Grid>
        <Grid item xs={12}>
          <DashboardInput
            label="Address (Optional)"
            value={data.address}
            onChange={handleAddress}
            multiline
            aria-label="Business address"
            placeholder="123 Main St, City, State, ZIP"
          />
        </Grid>
        <Grid item xs={12}>
          <div ref={errors.services ? firstErrorRef : undefined}>
            <DashboardInput
              label="Services / Products"
              value={data.services}
              onChange={handleServices}
              multiline
              rows={3}
              error={!!errors.services}
              helperText={
                errors.services ||
                "Describe what your business offers (min. 10 characters)"
              }
              required
              aria-label="Services and products"
              aria-required="true"
              placeholder="e.g. We offer web design, branding, and digital marketing services for small businesses..."
            />
          </div>
        </Grid>
      </Grid>
    </Box>
  );
});

const OptionalFields = React.memo(function OptionalFields({
  data,
  updateField,
  updateSocialLink,
  optionalFieldsFilled,
  colors,
}: {
  data: QuestionnaireData;
  updateField: AIQuestionnaireProps["updateField"];
  updateSocialLink: AIQuestionnaireProps["updateSocialLink"];
  optionalFieldsFilled: number;
  colors: ReturnType<typeof getDashboardColors>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoError, setLogoError] = useState("");

  const brandOptions = useMemo(
    () =>
      BRAND_PERSONALITIES.map((bp) => (
        <MenuItem key={bp.value} value={bp.value}>
          {bp.label} — {bp.description}
        </MenuItem>
      )),
    [],
  );

  const handleLogoChange = useCallback(
    (files: FileList | null) => {
      setLogoError("");
      if (!files || files.length === 0) return;
      const file = files[0];
      if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
        setLogoError("Only JPG, PNG, and SVG files are accepted");
        return;
      }
      if (file.size > MAX_LOGO_SIZE) {
        setLogoError("File must be under 2MB");
        return;
      }
      updateField("logoFile", file);
    },
    [updateField],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleLogoChange(e.dataTransfer.files);
    },
    [handleLogoChange],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const removeLogo = useCallback(() => {
    updateField("logoFile", null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [updateField]);

  const handleBrandPersonality = useCallback(
    (e: { target: { value: string } }) => {
      updateField("brandPersonality", e.target.value);
    },
    [updateField],
  );

  const handleTargetAudience = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField("targetAudience", e.target.value);
    },
    [updateField],
  );

  const handleUsp = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField("usp", e.target.value);
    },
    [updateField],
  );

  const handleBusinessHours = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField("businessHours", e.target.value);
    },
    [updateField],
  );

  const handleServiceArea = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateField("serviceArea", e.target.value);
    },
    [updateField],
  );

  const handleSocialFacebook = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSocialLink("facebook", e.target.value);
    },
    [updateSocialLink],
  );

  const handleSocialInstagram = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSocialLink("instagram", e.target.value);
    },
    [updateSocialLink],
  );

  const handleSocialTwitter = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSocialLink("twitter", e.target.value);
    },
    [updateSocialLink],
  );

  const handleSocialLinkedin = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSocialLink("linkedin", e.target.value);
    },
    [updateSocialLink],
  );

  return (
    <Grid container spacing={2}>
      {/* Logo Upload */}
      <Grid item xs={12}>
        <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
          Logo (Optional)
        </Typography>
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label="Upload logo"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              fileInputRef.current?.click();
          }}
          sx={{
            border: `2px dashed ${alpha(colors.border, 0.5)}`,
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            cursor: "pointer",
            transition: "border-color 0.2s",
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            "&:hover": { borderColor: colors.primary },
          }}
        >
          {data.logoFile || data.logoFileName ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2">
                {data.logoFile?.name || data.logoFileName}
              </Typography>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  removeLogo();
                }}
                aria-label="Remove logo"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ) : (
            <>
              <CloudUploadIcon sx={{ opacity: 0.5 }} />
              <Typography variant="body2" sx={{ opacity: 0.7 }}>
                Drag & drop or click to upload (JPG, PNG, SVG — max 2MB)
              </Typography>
            </>
          )}
        </Box>
        <input
          ref={fileInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.svg"
          onChange={(e) => handleLogoChange(e.target.files)}
          style={{ display: "none" }}
          aria-hidden="true"
        />
        {logoError && (
          <Typography
            variant="caption"
            color="error"
            sx={{ mt: 0.5, display: "block" }}
          >
            {logoError}
          </Typography>
        )}
      </Grid>

      {/* Brand Personality */}
      <Grid item xs={12} md={6}>
        <DashboardSelect
          label="Brand Personality"
          value={data.brandPersonality}
          onChange={handleBrandPersonality}
          displayEmpty
          aria-label="Brand personality"
        >
          <MenuItem value="">Select personality (optional)</MenuItem>
          {brandOptions}
        </DashboardSelect>
      </Grid>

      {/* Target Audience */}
      <Grid item xs={12} md={6}>
        <DashboardInput
          label="Target Audience"
          value={data.targetAudience}
          onChange={handleTargetAudience}
          aria-label="Target audience"
          placeholder="e.g. Small business owners aged 25-45"
        />
      </Grid>

      {/* USP */}
      <Grid item xs={12}>
        <DashboardInput
          label="Unique Selling Proposition"
          value={data.usp}
          onChange={handleUsp}
          aria-label="Unique selling proposition"
          placeholder="What makes your business different?"
        />
      </Grid>

      {/* Social Links */}
      <Grid item xs={12} md={6}>
        <DashboardInput
          label="Facebook URL"
          value={data.socialLinks.facebook}
          onChange={handleSocialFacebook}
          aria-label="Facebook URL"
          placeholder="https://facebook.com/yourbusiness"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DashboardInput
          label="Instagram URL"
          value={data.socialLinks.instagram}
          onChange={handleSocialInstagram}
          aria-label="Instagram URL"
          placeholder="https://instagram.com/yourbusiness"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DashboardInput
          label="Twitter / X URL"
          value={data.socialLinks.twitter}
          onChange={handleSocialTwitter}
          aria-label="Twitter URL"
          placeholder="https://twitter.com/yourbusiness"
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <DashboardInput
          label="LinkedIn URL"
          value={data.socialLinks.linkedin}
          onChange={handleSocialLinkedin}
          aria-label="LinkedIn URL"
          placeholder="https://linkedin.com/company/yourbusiness"
        />
      </Grid>

      {/* Business Hours */}
      <Grid item xs={12} md={6}>
        <DashboardInput
          label="Business Hours"
          value={data.businessHours}
          onChange={handleBusinessHours}
          aria-label="Business hours"
          placeholder="Mon-Fri 9am-5pm"
        />
      </Grid>

      {/* Service Area */}
      <Grid item xs={12} md={6}>
        <DashboardInput
          label="Service Area"
          value={data.serviceArea}
          onChange={handleServiceArea}
          aria-label="Service area"
          placeholder="e.g. Greater London, UK"
        />
      </Grid>

      {/* Completion indicator */}
      <Grid item xs={12}>
        <Typography variant="caption" sx={{ opacity: 0.6 }}>
          {optionalFieldsFilled} of 9 optional fields filled
        </Typography>
      </Grid>
    </Grid>
  );
});

export default function AIQuestionnaire({
  data,
  errors,
  updateField,
  updateSocialLink,
  optionalFieldsFilled,
}: AIQuestionnaireProps) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));
  const [expanded, setExpanded] = useState(!isMobile);
  const firstErrorRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);

  // Auto-focus website name on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const input = formContainerRef.current?.querySelector("input");
      if (input) input.focus();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to first error when errors change
  useEffect(() => {
    if (Object.keys(errors).length > 0 && firstErrorRef.current) {
      firstErrorRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      const input = firstErrorRef.current.querySelector("input, textarea");
      if (input) (input as HTMLElement).focus();
    }
  }, [errors]);

  const handleFieldChange = useCallback(
    (field: keyof QuestionnaireData, value: string) => {
      updateField(field, value as any);
    },
    [updateField],
  );

  return (
    <Box
      role="form"
      aria-label="AI content questionnaire"
      sx={{ maxWidth: 900, mx: "auto" }}
    >
      {/* Validation error announcements for screen readers */}
      <Box
        aria-live="polite"
        aria-atomic="true"
        sx={{ position: "absolute", left: -9999 }}
      >
        {Object.values(errors).filter(Boolean).join(". ")}
      </Box>

      {/* Group 1: Required Fields */}
      <Box
        sx={{
          bgcolor: alpha(colors.panelBg, 0.8),
          border: `1px solid ${alpha(colors.panelBorder || colors.border, 0.5)}`,
          borderRadius: 2,
          p: { xs: 2, md: 3 },
          mb: 3,
        }}
      >
        <div ref={formContainerRef}>
          <RequiredFields
            data={data}
            errors={errors}
            onFieldChange={handleFieldChange}
            firstErrorRef={firstErrorRef}
          />
        </div>
      </Box>

      {/* Group 2: Optional Fields (Accordion) */}
      <Accordion
        expanded={expanded}
        onChange={(_, isExpanded) => setExpanded(isExpanded)}
        sx={{
          bgcolor: alpha(colors.panelBg, 0.8),
          border: `1px solid ${alpha(colors.panelBorder || colors.border, 0.5)}`,
          borderRadius: "8px !important",
          "&:before": { display: "none" },
          boxShadow: "none",
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon sx={{ color: colors.text }} />}
          aria-controls="optional-fields-content"
          id="optional-fields-header"
          sx={{ minHeight: 44 }}
        >
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: colors.text }}
          >
            Enhance your content (optional)
          </Typography>
        </AccordionSummary>
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AccordionDetails sx={{ pt: 0, px: { xs: 2, md: 3 }, pb: 3 }}>
                <OptionalFields
                  data={data}
                  updateField={updateField}
                  updateSocialLink={updateSocialLink}
                  optionalFieldsFilled={optionalFieldsFilled}
                  colors={colors}
                />
              </AccordionDetails>
            </motion.div>
          )}
        </AnimatePresence>
      </Accordion>
    </Box>
  );
}
