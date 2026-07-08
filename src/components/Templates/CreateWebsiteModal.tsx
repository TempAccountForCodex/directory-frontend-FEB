/**
 * CreateWebsiteModal (Step 3.5.2 + 10.7.7)
 *
 * Multi-step wizard for creating a website from a DB template.
 * Steps: 1) Name Your Website  2) Choose Subdomain  3) Customize (optional)  4) Directory Opt-In (post-creation)
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Fade from "@mui/material/Fade";
import { alpha } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { X, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { apiClient } from "../../api/client";
import { type TemplateSummary } from "../../templates/templateApi";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import DashboardInput from "../Dashboard/shared/DashboardInput";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";
import DashboardCancelButton from "../Dashboard/shared/DashboardCancelButton";
import ListingOptInStep from "../WebsiteEditor/ListingOptInStep";
import CategorySelect from "./CategorySelect";
import { storeWebsiteFrontendTemplateId } from "../../templates/frontendTemplatePersistence";

const STEPS = [
  "Name Your Website",
  "Choose Your Address",
  "Customize",
  "Directory Listing",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Slugify a name for subdomain use */
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 63);
}

const hasValidGalleryImages = (content: Record<string, unknown>): boolean => {
  const images = content?.images;
  return (
    Array.isArray(images) &&
    images.length > 0 &&
    images.some(
      (img: unknown) =>
        typeof (img as any)?.image === "string" &&
        (img as any).image.trim() !== "",
    )
  );
};

const serializeTemplatePagesForCreation = (pages: TemplateEditorPage[]) =>
  pages.map((page, pageIndex) => ({
    title: page.title,
    path: page.path,
    isHome: page.isHome,
    sortOrder: page.sortOrder ?? pageIndex,
    isPublished: page.isPublished ?? true,
    blocks: (page.blocks || [])
      .filter((block) => {
        if (block.blockType === "GALLERY") {
          return hasValidGalleryImages(block.content || {});
        }
        return true;
      })
      .map((block, blockIndex) => ({
        blockType: block.blockType,
        type: block.blockType,
        content: block.content || {},
        sortOrder: block.sortOrder ?? blockIndex,
        isVisible: block.isVisible ?? true,
      })),
  }));

const buildFallbackFrontendTemplatePages = (
  templateId: string,
  websiteName: string,
  primaryColor: string,
): TemplateEditorPage[] => {
  const data = buildFrontendTemplateBusinessData(templateId, {
    name: websiteName,
    businessName: websiteName,
    primaryColor,
    themeSettings: { primaryColor },
  });

  if (!data) {
    return [];
  }

  const featureItems =
    (data.features || []).slice(0, 6).map((feature, index) => ({
      title: feature?.title || `Feature ${index + 1}`,
      description: feature?.description || "",
      icon: feature?.icon || `feature-${index + 1}`,
    })) || [];

  const serviceItems =
    (data.services || []).slice(0, 6).map((service, index) => ({
      title: service?.name || `Service ${index + 1}`,
      description: service?.description || "",
      icon: `service-${index + 1}`,
    })) || [];

  const productItems =
    (data.products || []).slice(0, 6).map((product, index) => ({
      title: product?.name || `Product ${index + 1}`,
      description:
        product?.description || product?.price || product?.category || "",
      icon: `product-${index + 1}`,
    })) || [];

  const articleItems =
    (data.blogPosts || []).slice(0, 6).map((post, index) => ({
      title: post?.title || `Article ${index + 1}`,
      description: post?.description || "",
      icon: post?.category || `article-${index + 1}`,
    })) || [];

  const galleryImages =
    (data.portfolioItems || []).slice(0, 6).map((item, index) => ({
      image: item?.image || "",
      alt: item?.title || `Gallery image ${index + 1}`,
      caption: item?.description || item?.category || "",
    })) || [];

  const testimonialItems =
    (data.reviews || []).slice(0, 3).map((review, index) => ({
      quote: review?.text || review?.comment || "",
      author: review?.author || review?.name || `Client ${index + 1}`,
      position: review?.role || "",
    })) || [];

  const statsItems =
    (data.stats || []).slice(0, 4).map((stat, index) => ({
      value: stat?.value || "",
      label: stat?.label || `Metric ${index + 1}`,
    })) || [];

  const blocks = [
    {
      id: `${templateId}-home-hero`,
      blockType: "HERO",
      sortOrder: 0,
      isVisible: true,
      content: {
        editorLabel: "Hero",
        heading: data.tagline || data.name || websiteName,
        body: data.description || "",
        buttonText: "Get started",
      },
    },
  ];

  const supportingItems =
    featureItems.length > 0
      ? featureItems
      : serviceItems.length > 0
        ? serviceItems
        : productItems.length > 0
          ? productItems
          : articleItems;

  if (supportingItems.length > 0) {
    blocks.push({
      id: `${templateId}-home-features`,
      blockType: "FEATURES",
      sortOrder: blocks.length,
      isVisible: true,
      content: {
        editorLabel: "Highlights",
        heading: "Highlights",
        features: supportingItems,
      },
    });
  }

  if (galleryImages.some((item) => item.image)) {
    blocks.push({
      id: `${templateId}-home-gallery`,
      blockType: "GALLERY",
      sortOrder: blocks.length,
      isVisible: true,
      content: {
        editorLabel: "Gallery",
        heading: "Gallery",
        images: galleryImages.filter((item) => item.image),
      },
    });
  }

  if (statsItems.length > 0) {
    blocks.push({
      id: `${templateId}-home-stats`,
      blockType: "STATS",
      sortOrder: blocks.length,
      isVisible: true,
      content: {
        editorLabel: "Stats",
        heading: "Key numbers",
        items: statsItems,
      },
    });
  }

  if (testimonialItems.length > 0) {
    blocks.push({
      id: `${templateId}-home-testimonials`,
      blockType: "TESTIMONIALS",
      sortOrder: blocks.length,
      isVisible: true,
      content: {
        editorLabel: "Testimonials",
        heading: "What clients say",
        testimonials: testimonialItems,
      },
    });
  }

  blocks.push({
    id: `${templateId}-home-contact`,
    blockType: "CONTACT",
    sortOrder: blocks.length,
    isVisible: true,
    content: {
      editorLabel: "Contact",
      heading: "Get in touch",
      body:
        data.description || "Reach out and we will get back to you shortly.",
      email: data.contact?.email || "hello@yourcompany.com",
      phone: data.contact?.phone || "",
      address: data.fullAddress || "",
      formTitle: "Send a message",
      fullNamePlaceholder: "Full name",
      emailPlaceholder: "Email address",
      messagePlaceholder: "Message",
      buttonText: "Contact us",
    },
  });

  return [
    {
      id: `${templateId}-page-home`,
      title: "Home",
      path: "/",
      isHome: true,
      sortOrder: 0,
      isPublished: true,
      localOnly: true,
      blocks,
    },
  ];
};

const buildFrontendTemplateCreationPages = (
  templateId: string,
  websiteName: string,
  primaryColor: string,
): TemplateEditorPage[] => {
  const seededPages = buildFrontendTemplateEditorPages(templateId, {
    name: websiteName,
    businessName: websiteName,
    primaryColor,
    themeSettings: { primaryColor },
  });

  return seededPages.length > 0
    ? seededPages
    : buildFallbackFrontendTemplatePages(templateId, websiteName, primaryColor);
};

type SubdomainStatus =
  | "idle"
  | "checking"
  | "available"
  | "taken"
  | "invalid"
  | "error";

interface CreateWebsiteModalProps {
  open: boolean;
  template: TemplateSummary | null;
  onClose: () => void;
  onSuccess: (websiteId: number) => void;
  planCode?: string;
}

const CreateWebsiteModal = React.memo(function CreateWebsiteModal({
  open,
  template,
  onClose,
  onSuccess,
  planCode = "website_free",
}: CreateWebsiteModalProps) {
  const muiTheme = useTheme();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isFullScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));

  // Wizard state
  const [activeStep, setActiveStep] = useState(0);
  const [websiteName, setWebsiteName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [subdomainStatus, setSubdomainStatus] =
    useState<SubdomainStatus>("idle");
  const [subdomainError, setSubdomainError] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#378C92");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [createdWebsiteId, setCreatedWebsiteId] = useState<number | null>(null);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setActiveStep(0);
      setWebsiteName("");
      setBusinessCategory("");
      setSubdomain("");
      setSubdomainStatus("idle");
      setSubdomainError("");
      setPrimaryColor("#378C92");
      setCreating(false);
      setError("");
      setCreatedWebsiteId(null);
    }
  }, [open]);

  // Subdomain validation regex
  const subdomainRegex = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
  const isValidSubdomain = (val: string) =>
    val.length >= 3 && val.length <= 63 && subdomainRegex.test(val);

  // Check subdomain availability
  const checkSubdomain = useCallback(async (value: string) => {
    if (!value || value.length < 3) {
      setSubdomainStatus("idle");
      setSubdomainError("");
      return;
    }
    if (!isValidSubdomain(value)) {
      setSubdomainStatus("invalid");
      setSubdomainError(
        "Only lowercase letters, numbers, and hyphens (3-63 chars)",
      );
      return;
    }
    setSubdomainStatus("checking");
    setSubdomainError("");
    try {
      const res = await apiClient.get(
        `/domains/check-availability?subdomain=${encodeURIComponent(value)}`,
      );

      const payload =
        res.data && typeof res.data === "object" && "data" in res.data
          ? (res.data.data as { available?: boolean } | null)
          : (res.data as { available?: boolean } | null);

      if (payload?.available === true) {
        setSubdomainStatus("available");
        setSubdomainError("");
      } else if (payload?.available === false) {
        setSubdomainStatus("taken");
        setSubdomainError(`${value}.techietribe.app is taken`);
      } else {
        setSubdomainStatus("error");
        setSubdomainError(
          "Could not verify availability right now. Please try again.",
        );
      }
    } catch {
      setSubdomainStatus("error");
      setSubdomainError("Unable to verify availability. Please try again.");
    }
  }, []);

  // Debounced subdomain check
  const handleSubdomainChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
      setSubdomain(val);
      setSubdomainStatus("idle");

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        checkSubdomain(val);
      }, 500);
    },
    [checkSubdomain],
  );

  // Auto-generate subdomain from name
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setWebsiteName(val);
      const slug = slugify(val);
      setSubdomain(slug);
      setSubdomainStatus("idle");
    },
    [],
  );

  // Step 1 → Step 2: auto-check subdomain
  const handleNext = useCallback(() => {
    if (activeStep === 0 && subdomain) {
      checkSubdomain(subdomain);
    }
    setActiveStep((prev) => prev + 1);
  }, [activeStep, subdomain, checkSubdomain]);

  const handleBack = useCallback(() => {
    setActiveStep((prev) => prev - 1);
  }, []);

  // Create website
  const handleCreate = useCallback(async () => {
    if (!template) return;
    if (subdomainStatus !== "available") {
      setError("Please verify subdomain availability before creating.");
      return;
    }
    setCreating(true);
    setError("");

    try {
      const isDbTemplateId = UUID_REGEX.test(template.id);
      let res;

      if (isDbTemplateId) {
        res = await apiClient.post(`/websites/from-template`, {
          templateId: template.id,
          name: websiteName.trim(),
          subdomain: subdomain.trim(),
          customization: {
            primaryColor,
          },
        });
      } else {
        try {
          res = await apiClient.post(`/websites/from-template`, {
            frontendTemplateId: template.id,
            name: websiteName.trim(),
            subdomain: subdomain.trim(),
            customization: {
              primaryColor,
            },
          });
        } catch (err: any) {
          const backendMessage =
            err?.response?.data?.message || err?.message || "";
          const shouldUseFrontendFallback = /frontend template not found/i.test(
            String(backendMessage),
          );

          if (!shouldUseFrontendFallback) {
            throw err;
          }

          const creationPages = buildFrontendTemplateCreationPages(
            template.id,
            websiteName.trim(),
            primaryColor,
          );

          if (creationPages.length === 0) {
            setError(
              "Selected template is missing frontend setup. Please choose another template.",
            );
            return;
          }

          const customPages = serializeTemplatePagesForCreation(creationPages);

          res = await apiClient.post(`/websites`, {
            name: websiteName.trim(),
            slug: subdomain.trim(),
            primaryColor,
            isPublic: true,
            frontendTemplateId: template.id,
            customPages,
            templateSnapshot: {
              templateId: template.id,
              version: 1,
              themeSettings: {
                primaryColor,
              },
              pages: customPages,
            },
          });
        }
      }

      const createdWebsiteId =
        res?.data?.data?.id || res?.data?.website?.id || null;

      if (res?.data?.success !== false && createdWebsiteId) {
        if (!isDbTemplateId) {
          storeWebsiteFrontendTemplateId(createdWebsiteId, template.id);
        }
        setCreatedWebsiteId(createdWebsiteId);
        setActiveStep(3);
      } else {
        setError(res?.data?.message || "Failed to create website");
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Failed to create website";
      setError(msg);
    } finally {
      setCreating(false);
    }
  }, [
    template,
    websiteName,
    businessCategory,
    subdomain,
    primaryColor,
    subdomainStatus,
  ]);

  // Called after the directory listing opt-in step finishes (complete or skip).
  const finishCreation = useCallback(async () => {
    if (createdWebsiteId == null) return;
    onSuccess(createdWebsiteId);
  }, [createdWebsiteId, onSuccess]);

  // Validation
  const nameValid = websiteName.trim().length >= 3;
  const categoryValid = businessCategory.trim().length > 0;
  const subdomainReady = subdomainStatus === "available";
  const canProceedStep0 = nameValid && categoryValid;
  const canProceedStep1 = subdomainReady;

  // Subdomain adornment icon
  const subdomainIcon = (() => {
    switch (subdomainStatus) {
      case "checking":
        return <CircularProgress size={16} />;
      case "available":
        return <CheckCircle size={16} color="#16a34a" />;
      case "taken":
        return <XCircle size={16} color="#dc2626" />;
      case "invalid":
        return <AlertTriangle size={16} color="#f59e0b" />;
      case "error":
        return <AlertTriangle size={16} color="#f59e0b" />;
      default:
        return null;
    }
  })();

  // Suggestion chips when taken
  const suggestions =
    subdomainStatus === "taken"
      ? [`${subdomain}2`, `${subdomain}-app`, `${subdomain}-site`]
      : [];

  return (
    <Dialog
      open={open}
      onClose={creating ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isFullScreen}
      TransitionComponent={Fade}
      aria-labelledby="create-website-title"
      PaperProps={{
        sx: {
          backgroundColor: colors.panelBg || colors.bgCard,
          border: `1px solid ${colors.border}`,
          backdropFilter: "blur(12px)",
        },
      }}
    >
      <DialogTitle
        id="create-website-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
          color: colors.text,
        }}
      >
        Create Website
        <IconButton
          aria-label="close"
          onClick={onClose}
          disabled={creating}
          size="small"
          sx={{ color: colors.textSecondary }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1 }}>
        <Stepper
          activeStep={activeStep}
          alternativeLabel
          sx={{
            mb: 3,
            "& .MuiStepLabel-label": {
              color: colors.textSecondary,
              fontSize: "0.8rem",
            },
            "& .MuiStepLabel-label.Mui-active": { color: colors.text },
            "& .MuiStepLabel-label.Mui-completed": { color: "#378C92" },
            "& .MuiStepIcon-root.Mui-active": { color: "#378C92" },
            "& .MuiStepIcon-root.Mui-completed": { color: "#378C92" },
          }}
        >
          {STEPS.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {template && (
          <Typography
            variant="caption"
            sx={{ color: colors.textSecondary, mb: 2, display: "block" }}
          >
            Template: {template.name}
          </Typography>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Step 1: Name */}
        {activeStep === 0 && (
          <Box>
            <DashboardInput
              label="Website Name"
              placeholder="My Awesome Business"
              value={websiteName}
              onChange={handleNameChange}
              error={websiteName.length > 0 && !nameValid}
              helperText={
                websiteName.length > 0 && !nameValid
                  ? "Name must be at least 3 characters"
                  : ""
              }
              autoFocus
            />
            <Box sx={{ mt: 2 }}>
              <CategorySelect
                value={businessCategory}
                onChange={(val) => setBusinessCategory(val)}
              />
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, mt: 0.5, display: "block" }}
              >
                Used for your website setup and directory listing.
              </Typography>
            </Box>

            {websiteName && subdomain && (
              <Typography
                variant="body2"
                sx={{ mt: 2, color: colors.textSecondary }}
              >
                Your website will be at:{" "}
                <strong style={{ color: "#378C92" }}>
                  {subdomain}.techietribe.app
                </strong>
              </Typography>
            )}
          </Box>
        )}

        {/* Step 2: Subdomain */}
        {activeStep === 1 && (
          <Box>
            <DashboardInput
              label="Subdomain"
              placeholder="my-business"
              value={subdomain}
              onChange={handleSubdomainChange}
              error={
                subdomainStatus === "taken" ||
                subdomainStatus === "invalid" ||
                subdomainStatus === "error"
              }
              helperText={
                subdomainStatus === "available"
                  ? `${subdomain}.techietribe.app is available`
                  : subdomainStatus === "taken" ||
                      subdomainStatus === "invalid" ||
                      subdomainStatus === "error"
                    ? subdomainError
                    : ""
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {subdomainIcon}
                      <Typography
                        variant="caption"
                        sx={{
                          color: colors.textSecondary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        .techietribe.app
                      </Typography>
                    </Box>
                  </InputAdornment>
                ),
              }}
              autoFocus
            />

            {suggestions.length > 0 && (
              <Box sx={{ mt: 1, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                <Typography
                  variant="caption"
                  sx={{ color: colors.textSecondary, width: "100%", mb: 0.5 }}
                >
                  Try one of these:
                </Typography>
                {suggestions.map((s) => (
                  <Chip
                    key={s}
                    label={s}
                    size="small"
                    onClick={() => {
                      setSubdomain(s);
                      setSubdomainStatus("idle");
                      checkSubdomain(s);
                    }}
                    sx={{
                      cursor: "pointer",
                      borderColor: "#378C92",
                      color: "#378C92",
                      "&:hover": {
                        backgroundColor: "rgba(55, 140, 146, 0.08)",
                      },
                    }}
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Step 3: Customize */}
        {activeStep === 2 && (
          <Box>
            <Typography
              variant="body2"
              sx={{ color: colors.textSecondary, mb: 2 }}
            >
              Customize your website&apos;s look (optional)
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography
                variant="body2"
                sx={{ color: colors.text, minWidth: 100 }}
              >
                Primary Color
              </Typography>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                style={{
                  width: 44,
                  height: 44,
                  border: `1px solid ${colors.border}`,
                  borderRadius: 8,
                  cursor: "pointer",
                  padding: 2,
                  background: "transparent",
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary }}
              >
                {primaryColor}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Step 4: Directory Opt-In (post-creation) */}
        {activeStep === 3 && createdWebsiteId && (
          <ListingOptInStep
            websiteId={createdWebsiteId}
            websiteName={websiteName}
            defaultBusinessCategory={businessCategory}
            planCode={planCode}
            onComplete={finishCreation}
            onSkip={finishCreation}
          />
        )}
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 2,
          gap: 1,
          flexWrap: "wrap",
          display: activeStep === 3 ? "none" : "flex",
        }}
      >
        <DashboardCancelButton onClick={onClose} disabled={creating}>
          Cancel
        </DashboardCancelButton>

        <Box sx={{ flex: 1 }} />

        {activeStep > 0 && (
          <DashboardActionButton onClick={handleBack} disabled={creating}>
            Back
          </DashboardActionButton>
        )}

        {activeStep < 2 && (
          <DashboardGradientButton
            onClick={handleNext}
            disabled={
              (activeStep === 0 && !canProceedStep0) ||
              (activeStep === 1 && !canProceedStep1)
            }
          >
            Next
          </DashboardGradientButton>
        )}

        {activeStep === 2 && (
          <>
            <DashboardActionButton onClick={handleCreate} disabled={creating}>
              Skip &amp; Create
            </DashboardActionButton>
            <DashboardGradientButton onClick={handleCreate} disabled={creating}>
              {creating ? (
                <CircularProgress size={20} sx={{ color: "#fff" }} />
              ) : (
                "Create Website"
              )}
            </DashboardGradientButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
});

export default CreateWebsiteModal;
