import React from "react";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Chip,
  Typography,
  Button,
} from "@mui/material";
import {
  Eye,
  LayoutTemplate,
  Building2,
  User,
  Briefcase,
  UtensilsCrossed,
  Home,
  Dumbbell,
  GraduationCap,
  Layers,
  ShoppingBag,
  FileText,
  Palette,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import {
  type TemplateSummary,
  type TemplateCategory,
  CATEGORY_LABELS,
} from "../../templates/templateApi";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import TemplateFavorites from "./TemplateFavorites";
import { isSafePreviewUrl } from "../../utils/urlSafety";

/** Category-specific colors and icons for the placeholder area. */
const CATEGORY_PLACEHOLDER_COLORS: Record<
  TemplateCategory,
  { bg: string; accent: string; Icon: LucideIcon }
> = {
  blog: { bg: "rgba(59,130,246,0.1)", accent: "#3B82F6", Icon: FileText },
  business: { bg: "rgba(37,99,235,0.1)", accent: "#2563EB", Icon: Building2 },
  creative: { bg: "rgba(168,85,247,0.1)", accent: "#A855F7", Icon: Palette },
  ecommerce: {
    bg: "rgba(236,72,153,0.1)",
    accent: "#EC4899",
    Icon: ShoppingBag,
  },
  restaurant: {
    bg: "rgba(239,68,68,0.1)",
    accent: "#EF4444",
    Icon: UtensilsCrossed,
  },
  portfolio: { bg: "rgba(139,92,246,0.1)", accent: "#8B5CF6", Icon: User },
  agency: { bg: "rgba(245,158,11,0.1)", accent: "#F59E0B", Icon: Briefcase },
  "real-estate": { bg: "rgba(16,185,129,0.1)", accent: "#10B981", Icon: Home },
  fitness: { bg: "rgba(249,115,22,0.1)", accent: "#F97316", Icon: Dumbbell },
  education: {
    bg: "rgba(6,182,212,0.1)",
    accent: "#06B6D4",
    Icon: GraduationCap,
  },
  saas: { bg: "rgba(55,140,146,0.1)", accent: "#378C92", Icon: Layers },
  "landing-page": {
    bg: "rgba(34,197,94,0.1)",
    accent: "#22C55E",
    Icon: Rocket,
  },
};

interface TemplateCardProps {
  template: TemplateSummary;
  onClick: (template: TemplateSummary) => void;
  onPreview?: (template: TemplateSummary) => void;
  /** Optional: show heart icon when provided */
  isFavorited?: boolean;
  /** Optional: called when user clicks the heart icon */
  onFavoriteToggle?: (templateId: string) => void;
}

const TemplateCard = React.memo(function TemplateCard({
  template,
  onClick,
  onPreview,
  isFavorited,
  onFavoriteToggle,
}: TemplateCardProps) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [imgError, setImgError] = React.useState<boolean>(false);

  React.useEffect(() => {
    setImgError(false);
  }, [template.previewImage]);

  const handleCardClick = React.useCallback(() => {
    onClick(template);
  }, [onClick, template]);

  const handleFavoriteToggle = React.useCallback(
    (templateId: string, _newState: boolean) => {
      onFavoriteToggle?.(templateId);
    },
    [onFavoriteToggle],
  );

  const handlePreviewClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onPreview?.(template);
    },
    [onPreview, template],
  );

  const handleUseTemplateClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onClick(template);
    },
    [onClick, template],
  );

  const categoryStyle = CATEGORY_PLACEHOLDER_COLORS[template.category] ?? null;
  const placeholderBg = categoryStyle
    ? categoryStyle.bg
    : actualTheme === "dark"
      ? "rgba(55, 140, 146, 0.08)"
      : "rgba(55, 140, 146, 0.06)";
  const placeholderAccent = categoryStyle ? categoryStyle.accent : "#378C92";
  const PlaceholderIcon = categoryStyle ? categoryStyle.Icon : LayoutTemplate;

  const showPlaceholder =
    !template.previewImage ||
    !isSafePreviewUrl(template.previewImage) ||
    imgError;

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        cursor: "pointer",
        backgroundColor: colors.panelBg,
        border: `1px solid ${colors.border}`,
        backdropFilter: "blur(12px)",
        borderRadius: "16px",
        transition:
          "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px) scale(1.01)",
          boxShadow: "0 8px 32px rgba(55,140,146,0.2)",
          borderColor: "#378C92",
        },
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Preview Image / Placeholder */}
      <Box sx={{ position: "relative" }}>
        {!showPlaceholder ? (
          <Box
            component="img"
            src={template.previewImage!}
            alt={template.name}
            loading="lazy"
            onError={() => setImgError(true)}
            sx={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              borderRadius: "16px 16px 0 0",
              display: "block",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 180,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 0.75,
              px: 2,
              backgroundColor: placeholderBg,
              borderRadius: "16px 16px 0 0",
              borderBottom: `1px solid ${colors.border}`,
            }}
          >
            <PlaceholderIcon size={40} color={placeholderAccent} />
            <Typography
              variant="subtitle2"
              sx={{
                color: `${placeholderAccent}cc`,
                fontSize: "0.75rem",
                textAlign: "center",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                lineHeight: 1.3,
                maxWidth: "100%",
              }}
            >
              {template.name}
            </Typography>
            {(template.pageCount !== undefined ||
              template.blockCount !== undefined) && (
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  flexWrap: "wrap",
                  justifyContent: "center",
                }}
              >
                {template.pageCount !== undefined && template.pageCount > 0 && (
                  <Chip
                    label={`${template.pageCount} page${template.pageCount !== 1 ? "s" : ""}`}
                    variant="outlined"
                    size="small"
                    sx={{
                      color: placeholderAccent,
                      borderColor: placeholderAccent,
                      fontSize: "0.65rem",
                      height: 18,
                      "& .MuiChip-label": { px: 0.75 },
                    }}
                  />
                )}
                {template.blockCount !== undefined &&
                  template.blockCount > 0 && (
                    <Chip
                      label={`${template.blockCount} block${template.blockCount !== 1 ? "s" : ""}`}
                      variant="outlined"
                      size="small"
                      sx={{
                        color: placeholderAccent,
                        borderColor: placeholderAccent,
                        fontSize: "0.65rem",
                        height: 18,
                        "& .MuiChip-label": { px: 0.75 },
                      }}
                    />
                  )}
              </Box>
            )}
          </Box>
        )}

        {/* Favorites heart button — shown only when onFavoriteToggle is provided */}
        {onFavoriteToggle && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: "rgba(0,0,0,0.35)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <TemplateFavorites
              templateId={template.id}
              isFavorited={isFavorited ?? false}
              onToggle={handleFavoriteToggle}
              size="small"
            />
          </Box>
        )}
      </Box>

      <CardContent
        sx={{
          flex: 1,
          p: "16px",
          "&:last-child": { pb: "16px" },
        }}
      >
        {/* Category Badge */}
        <Box sx={{ mb: 1 }}>
          <Chip
            label={CATEGORY_LABELS[template.category] ?? template.category}
            size="small"
            variant="outlined"
            sx={{
              color: "#378C92",
              borderColor: "#378C92",
              fontSize: "0.7rem",
              height: 22,
              "& .MuiChip-label": { px: 1 },
            }}
          />
        </Box>

        {/* Template Name */}
        <Typography
          variant="h6"
          sx={{
            color: colors.text,
            fontSize: "1rem",
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 0.75,
          }}
        >
          {template.name}
        </Typography>

        {/* Description — 2 lines max */}
        <Typography
          variant="body2"
          sx={{
            color: colors.textSecondary,
            fontSize: "0.8rem",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 1,
          }}
        >
          {template.description}
        </Typography>

        {/* Page count + Block count */}
        {(template.pageCount !== undefined ||
          template.blockCount !== undefined) && (
          <Typography
            variant="caption"
            sx={{
              color: colors.textSecondary,
              fontSize: "0.73rem",
              opacity: 0.75,
            }}
          >
            {template.pageCount !== undefined &&
              `${template.pageCount} page${template.pageCount !== 1 ? "s" : ""}`}
            {template.pageCount !== undefined &&
              template.blockCount !== undefined &&
              " · "}
            {template.blockCount !== undefined &&
              `${template.blockCount} block${template.blockCount !== 1 ? "s" : ""}`}
          </Typography>
        )}
      </CardContent>

      {/* Action Row */}
      <CardActions
        sx={{
          px: "16px",
          pb: "16px",
          pt: 0,
          gap: 1,
          justifyContent: "space-between",
        }}
      >
        {onPreview && (
          <Button
            size="small"
            variant="outlined"
            onClick={handlePreviewClick}
            startIcon={<Eye size={14} />}
            sx={{
              color: colors.textSecondary,
              borderColor: colors.border,
              textTransform: "none",
              fontSize: "0.78rem",
              fontWeight: 500,
              py: 0.5,
              px: 1.5,
              borderRadius: "8px",
              "&:hover": {
                borderColor: "#378C92",
                color: "#378C92",
              },
            }}
          >
            Preview
          </Button>
        )}
        <DashboardGradientButton
          size="small"
          onClick={handleUseTemplateClick}
          sx={{
            ml: onPreview ? "auto" : 0,
            py: 0.5,
            px: 1.5,
            fontSize: "0.78rem",
          }}
        >
          Use Template
        </DashboardGradientButton>
      </CardActions>
    </Card>
  );
});

export default TemplateCard;
