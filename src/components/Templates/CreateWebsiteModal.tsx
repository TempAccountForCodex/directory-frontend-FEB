/**
 * CreateWebsiteModal (Step 3.5.2 + 10.7.7)
 *
 * Multi-step wizard for creating a website from a DB template.
 * Steps: 1) Name Your Website  2) Choose Subdomain  3) Customize (optional)  4) Directory Opt-In (post-creation)
 *
 * TODO (PR.5): Integrate AI content generation as an optional step in this wizard.
 * Currently, AIQuestionnairePage.tsx provides a standalone AI creation path
 * that is not connected to this modal. PR.5 will unify both flows.
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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { X, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import axios from "axios";
import { type TemplateSummary } from "../../templates/templateApi";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import DashboardInput from "../Dashboard/shared/DashboardInput";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";
import DashboardCancelButton from "../Dashboard/shared/DashboardCancelButton";
import ListingOptInStep from "../WebsiteEditor/ListingOptInStep";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const STEPS = [
  "Name Your Website",
  "Choose Your Address",
  "Customize",
  "Directory Listing",
];

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
    try {
      const res = await axios.get(
        `${API_URL}/domains/check-availability?subdomain=${encodeURIComponent(value)}`,
      );
      if (res.data?.available) {
        setSubdomainStatus("available");
        setSubdomainError("");
      } else {
        setSubdomainStatus("taken");
        setSubdomainError(`${value}.techietribe.app is taken`);
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
      const res = await axios.post(`${API_URL}/websites/from-template`, {
        templateId: template.id,
        name: websiteName.trim(),
        subdomain: subdomain.trim(),
        customization: {
          primaryColor,
        },
      });

      if (res.data?.success) {
        setCreatedWebsiteId(res.data.data.id);
        setActiveStep(3); // Go to directory opt-in step
      } else {
        setError(res.data?.message || "Failed to create website");
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
    subdomain,
    primaryColor,
    subdomainStatus,
    onSuccess,
  ]);

  // Validation
  const nameValid = websiteName.trim().length >= 3;
  const subdomainReady = subdomainStatus === "available";
  const canProceedStep0 = nameValid;
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
            planCode={planCode}
            onComplete={() => onSuccess(createdWebsiteId)}
            onSkip={() => onSuccess(createdWebsiteId)}
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
