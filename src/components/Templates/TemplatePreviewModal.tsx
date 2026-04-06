/**
 * Step 3.4.4 + Step 4.6.2 — Template Preview Modal with Viewport Toggle
 *
 * Enhanced modal showing template preview screenshots with
 * desktop/mobile viewport toggle, navigation between templates,
 * and "Use This Template" CTA.
 */
import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import useMediaQuery from "@mui/material/useMediaQuery";
import Fade from "@mui/material/Fade";
import { useTheme } from "@mui/material/styles";
import {
  X,
  LayoutTemplate,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
} from "lucide-react";
import {
  type TemplateSummary,
  CATEGORY_LABELS,
} from "../../templates/templateApi";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import { useTemplateScreenshots } from "../../hooks/usePreviewApi";
import { PreviewImageError, usePreviewTimeout } from "./PreviewSkeleton";
import { isSafePreviewUrl } from "../../utils/urlSafety";

type Viewport = "desktop" | "mobile";

interface TemplatePreviewModalProps {
  open: boolean;
  template: TemplateSummary | null;
  templates: TemplateSummary[];
  onClose: () => void;
  onUseTemplate: (template: TemplateSummary) => void;
  onNavigate: (direction: "prev" | "next") => void;
}

const TemplatePreviewModal = React.memo(function TemplatePreviewModal({
  open,
  template,
  templates: _templates,
  onClose,
  onUseTemplate,
  onNavigate,
}: TemplatePreviewModalProps) {
  const muiTheme = useTheme();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isFullScreen = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [imgLoaded, setImgLoaded] = React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  // Fetch screenshots for the current template
  const {
    screenshots,
    loading: screenshotsLoading,
    refetch,
  } = useTemplateScreenshots(open && template ? template.id : null);

  // Reset state when template changes
  React.useEffect(() => {
    setImgLoaded(false);
    setImgError(false);
    setViewport("desktop");
  }, [template?.id]);

  const timedOut = usePreviewTimeout(
    screenshotsLoading || (!imgLoaded && !imgError),
  );

  const handlePrev = React.useCallback(() => onNavigate("prev"), [onNavigate]);
  const handleNext = React.useCallback(() => onNavigate("next"), [onNavigate]);
  const handleUse = React.useCallback(() => {
    if (template) onUseTemplate(template);
  }, [onUseTemplate, template]);

  const handleViewportChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, value: Viewport | null) => {
      if (value) {
        setViewport(value);
        setImgLoaded(false);
        setImgError(false);
      }
    },
    [],
  );

  // Keyboard shortcuts
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigate("prev");
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onNavigate("next");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onNavigate]);

  // Determine which image URL to show
  const screenshotUrl =
    viewport === "mobile" ? screenshots?.mobile : screenshots?.desktop;
  const fallbackUrl = template?.previewImage;
  const displayUrl = screenshotUrl || fallbackUrl;
  const hasValidUrl = displayUrl && isSafePreviewUrl(displayUrl);
  const hasScreenshots = !!(screenshots?.desktop || screenshots?.mobile);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      fullScreen={isFullScreen}
      TransitionComponent={Fade}
      aria-labelledby="template-preview-title"
      PaperProps={{
        sx: {
          backgroundColor: colors.panelBg || colors.bgCard,
          border: `1px solid ${colors.border}`,
          backdropFilter: "blur(12px)",
        },
      }}
    >
      <DialogTitle
        id="template-preview-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          pr: 1,
          color: colors.text,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Typography
            variant="h6"
            component="span"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {template?.name ?? ""}
          </Typography>

          {/* Viewport Toggle — only show when screenshots are available */}
          {hasScreenshots && (
            <ToggleButtonGroup
              value={viewport}
              exclusive
              onChange={handleViewportChange}
              size="small"
              aria-label="Preview viewport"
              sx={{
                "& .MuiToggleButton-root": {
                  border: `1px solid ${colors.border}`,
                  color: colors.textSecondary,
                  minWidth: 44,
                  minHeight: 36,
                  "&.Mui-selected": {
                    backgroundColor: "rgba(55,140,146,0.15)",
                    color: "#378C92",
                    borderColor: "#378C92",
                    "&:hover": { backgroundColor: "rgba(55,140,146,0.25)" },
                  },
                },
              }}
            >
              <ToggleButton value="desktop" aria-label="Desktop preview">
                <Tooltip title="Desktop">
                  <Monitor size={16} />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="mobile" aria-label="Mobile preview">
                <Tooltip title="Mobile">
                  <Smartphone size={16} />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Box>

        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ color: colors.textSecondary, ml: 1 }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {template && (
          <>
            {/* Screenshot / Preview Image */}
            {screenshotsLoading ? (
              <Skeleton
                variant="rectangular"
                height={400}
                sx={{ width: "100%" }}
                aria-label="Loading preview image"
              />
            ) : imgError ? (
              <PreviewImageError
                onRetry={() => {
                  setImgError(false);
                  setImgLoaded(false);
                  refetch();
                }}
                message="Failed to load preview screenshot"
              />
            ) : hasValidUrl ? (
              <Box
                sx={{
                  width: "100%",
                  overflow: "hidden",
                  display: "flex",
                  justifyContent: "center",
                  backgroundColor:
                    actualTheme === "dark"
                      ? "rgba(0,0,0,0.3)"
                      : "rgba(0,0,0,0.03)",
                  position: "relative",
                }}
              >
                {!imgLoaded && (
                  <Skeleton
                    variant="rectangular"
                    height={400}
                    sx={{
                      width: "100%",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                )}
                <Box
                  component="img"
                  src={displayUrl!}
                  alt={`${template.name} - ${viewport} preview`}
                  loading="lazy"
                  onLoad={() => setImgLoaded(true)}
                  onError={() => setImgError(true)}
                  sx={{
                    maxWidth: viewport === "mobile" ? 375 : "100%",
                    maxHeight: 500,
                    width: viewport === "mobile" ? 375 : "100%",
                    objectFit: "contain",
                    display: "block",
                    mx: "auto",
                    transition: "transform 0.3s ease",
                    "&:hover": { transform: "scale(1.02)" },
                    opacity: imgLoaded ? 1 : 0,
                  }}
                />
              </Box>
            ) : (
              <Box
                sx={{
                  width: "100%",
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: colors.bgCard,
                }}
              >
                <LayoutTemplate size={48} color={colors.textSecondary} />
              </Box>
            )}

            {/* Timeout warning */}
            {timedOut && (
              <Box sx={{ px: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: colors.textSecondary, fontStyle: "italic" }}
                >
                  Preview is taking longer than expected...
                </Typography>
              </Box>
            )}

            {/* Template Details */}
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip
                  label={
                    CATEGORY_LABELS[template.category] ?? template.category
                  }
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: "#378C92", color: "#378C92" }}
                />
                <Chip
                  label={template.type}
                  size="small"
                  variant="outlined"
                  sx={{
                    borderColor: colors.border,
                    color: colors.textSecondary,
                  }}
                />
                {hasScreenshots && (
                  <Chip
                    label={viewport === "desktop" ? "Desktop" : "Mobile"}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(55,140,146,0.1)",
                      color: "#378C92",
                      fontWeight: 500,
                    }}
                  />
                )}
              </Box>

              {template.description && (
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary, mb: 2, lineHeight: 1.6 }}
                >
                  {template.description}
                </Typography>
              )}

              {(template.pageCount != null || template.blockCount != null) && (
                <Typography
                  variant="caption"
                  sx={{ color: colors.textSecondary }}
                >
                  {template.pageCount != null
                    ? `${template.pageCount} pages`
                    : ""}
                  {template.pageCount != null && template.blockCount != null
                    ? " · "
                    : ""}
                  {template.blockCount != null
                    ? `${template.blockCount} blocks`
                    : ""}
                </Typography>
              )}
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
        <IconButton
          aria-label="Previous template"
          onClick={handlePrev}
          sx={{ color: colors.textSecondary, minWidth: 44, minHeight: 44 }}
        >
          <ChevronLeft size={20} />
        </IconButton>

        <IconButton
          aria-label="Next template"
          onClick={handleNext}
          sx={{ color: colors.textSecondary, minWidth: 44, minHeight: 44 }}
        >
          <ChevronRight size={20} />
        </IconButton>

        <Box sx={{ flex: 1 }} />

        {template && (
          <DashboardGradientButton onClick={handleUse} sx={{ minHeight: 44 }}>
            Use This Template
          </DashboardGradientButton>
        )}
      </DialogActions>
    </Dialog>
  );
});

export default TemplatePreviewModal;
