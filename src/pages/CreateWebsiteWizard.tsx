/**
 * Create Website Wizard - Standalone Template Selection
 * Inspired by Framer's clean template picker design
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { getDashboardColors } from "../styles/dashboardTheme";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  Button,
  alpha,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  getWebsiteTemplates,
  getAllCategories,
  CATEGORY_LABELS,
  refreshTemplateCache,
  type TemplateSummary,
} from "../templates/templateApi";
import type { TemplateCategory } from "../templates/templateApi";
import {
  generateTemplatePlaceholder,
  isPlaceholderPath,
} from "../utils/templatePlaceholderImage";

interface CreateWebsiteWizardProps {
  embedded?: boolean;
}

const CreateWebsiteWizard: React.FC<CreateWebsiteWizardProps> = ({
  embedded = false,
}) => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(
    null,
  );
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const categories = [
    "all",
    ...getAllCategories(templates).filter((cat) => cat !== "ecommerce"),
  ];

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const loadTemplates = useCallback((forceRefresh = false) => {
    let cancelled = false;
    setTemplatesLoading(true);
    const loader = forceRefresh ? refreshTemplateCache : getWebsiteTemplates;
    loader()
      .then((data) => {
        if (!cancelled) {
          setTemplates(data);
          setTemplatesError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTemplates([]);
          setTemplatesError("Failed to load templates");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setTemplatesLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => loadTemplates(), [loadTemplates]);

  useEffect(() => {
    const handleFocus = () => {
      loadTemplates(true);
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [loadTemplates]);

  // Filter and sort templates by category
  const filteredTemplates = (
    selectedCategory === "all"
      ? templates
      : templates.filter((t) => t.category === selectedCategory)
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleBack = () => {
    navigate("/dashboard/websites");
  };

  const handleSelect = (templateId: string) => {
    navigate(`/dashboard/websites/create/customize?template=${templateId}`);
  };

  const handleDemo = (templateId: string) => {
    window.open(`/template-preview/${templateId}`, "_blank");
  };

  if (loading || templatesLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: embedded ? "400px" : "100vh",
          bgcolor: embedded ? "transparent" : colors.bgDefault,
        }}
      >
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

  // When embedded in dashboard, render without full-page wrapper
  const content = (
    <>
      {/* Category Tabs */}
      <Box sx={{ mb: 6 }}>
        <Tabs
          value={selectedCategory}
          onChange={(e, newValue) => setSelectedCategory(newValue)}
          centered
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: colors.primary,
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
            mb: 4,
          }}
        >
          {categories.map((category) => (
            <Tab
              key={category}
              value={category}
              label={
                category === "all"
                  ? "All"
                  : CATEGORY_LABELS[category as TemplateCategory]
              }
              sx={{
                color: colors.textSecondary,
                fontWeight: 600,
                fontSize: "1rem",
                textTransform: "capitalize",
                px: 4,
                "&.Mui-selected": {
                  color: colors.text,
                },
              }}
            />
          ))}
        </Tabs>

        {/* Description */}
        <Typography
          variant="body1"
          align="center"
          sx={{
            color: colors.textSecondary,
            maxWidth: 800,
            mx: "auto",
            fontSize: "1.1rem",
          }}
        >
          Choose a starting point, or select one of the above categories to
          narrow things down a bit. You can also choose a blank page if you'd
          rather start from scratch.
        </Typography>
      </Box>

      {/* Template Grid */}
      <Grid container spacing={3}>
        {templatesError && (
          <Grid item xs={12}>
            <Typography color="error" align="center">
              {templatesError}
            </Typography>
          </Grid>
        )}
        {/* Blank Page Option */}
        <Grid item xs={12} sm={6} md={4} lg={3}>
          <Card
            onMouseEnter={() => setHoveredTemplateId("blank")}
            onMouseLeave={() => setHoveredTemplateId(null)}
            sx={{
              position: "relative",
              height: 400,
              bgcolor: colors.cardBg,
              border: `2px dashed ${alpha(colors.primary, 0.3)}`,
              borderRadius: 3,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
              "&:hover": {
                borderColor: colors.primary,
                transform: "translateY(-4px)",
                boxShadow: `0 12px 24px ${alpha(colors.primary, 0.2)}`,
              },
            }}
            onClick={() => handleSelect("blank")}
          >
            <Typography
              variant="h5"
              sx={{
                color: colors.textSecondary,
                fontWeight: 600,
              }}
            >
              Blank Page
            </Typography>

            {/* Hover Overlay with Select Button */}
            {hoveredTemplateId === "blank" && (
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  bgcolor: alpha(colors.darker, 0.85),
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "fadeIn 0.2s ease",
                  "@keyframes fadeIn": {
                    from: { opacity: 0 },
                    to: { opacity: 1 },
                  },
                }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect("blank");
                  }}
                  sx={{
                    px: 6,
                    py: 1.5,
                    fontSize: "1rem",
                    fontWeight: 600,
                    textTransform: "none",
                    background: colors.primary,
                    color: "#fff",
                    borderRadius: 2,
                    "&:hover": {
                      background: colors.primaryLight,
                    },
                  }}
                >
                  Select
                </Button>
              </Box>
            )}
          </Card>
        </Grid>

        {/* Template Cards */}
        {filteredTemplates.map((template) => {
          const previewImage = template.previewImage
            ? isPlaceholderPath(template.previewImage)
              ? generateTemplatePlaceholder(
                  template.name,
                  template.defaultWebsiteConfig?.primaryColor || colors.primary,
                  template.category,
                )
              : template.previewImage
            : generateTemplatePlaceholder(
                template.name,
                template.defaultWebsiteConfig?.primaryColor || colors.primary,
                template.category,
              );

          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
              <Card
                onMouseEnter={() => setHoveredTemplateId(template.id)}
                onMouseLeave={() => setHoveredTemplateId(null)}
                sx={{
                  position: "relative",
                  height: 400,
                  bgcolor: colors.cardBg,
                  border: `1px solid ${alpha(colors.primary, 0.2)}`,
                  borderRadius: 3,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  "&:hover": {
                    borderColor: colors.primary,
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 24px ${alpha(colors.primary, 0.25)}`,
                  },
                }}
              >
                {/* Template Preview */}
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    background: `linear-gradient(135deg, ${template.defaultWebsiteConfig?.primaryColor || colors.primary}15 0%, ${template.defaultWebsiteConfig?.primaryColor || colors.primary}35 100%)`,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                  }}
                >
                  {/* Template Name at Top */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      color: colors.text,
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      bgcolor: alpha(colors.cardBg, 0.9),
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                    }}
                  >
                    {template.name}
                  </Typography>

                  {/* Template Icon/Preview */}
                  <Box
                    sx={{
                      width: "80%",
                      height: "60%",
                      bgcolor: alpha(
                        template.defaultWebsiteConfig?.primaryColor ||
                          colors.primary,
                        0.2,
                      ),
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `2px solid ${alpha(template.defaultWebsiteConfig?.primaryColor || colors.primary, 0.3)}`,
                      overflow: "hidden",
                    }}
                  >
                    {previewImage ? (
                      <Box
                        component="img"
                        src={previewImage}
                        alt={`${template.name} preview`}
                        sx={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <Typography
                        variant="h4"
                        sx={{
                          color:
                            template.defaultWebsiteConfig?.primaryColor ||
                            colors.primary,
                          fontWeight: 700,
                          opacity: 0.5,
                        }}
                      >
                        {template.name.charAt(0)}
                      </Typography>
                    )}
                  </Box>

                  {/* Category Label */}
                  <Typography
                    variant="caption"
                    sx={{
                      position: "absolute",
                      bottom: 16,
                      left: 16,
                      color: colors.textSecondary,
                      fontSize: "0.75rem",
                    }}
                  >
                    {CATEGORY_LABELS[template.category]}
                  </Typography>
                </Box>

                {/* Hover Overlay with Buttons */}
                {hoveredTemplateId === template.id && (
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      bgcolor: alpha(colors.darker, 0.85),
                      backdropFilter: "blur(8px)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 2,
                      animation: "fadeIn 0.2s ease",
                      "@keyframes fadeIn": {
                        from: { opacity: 0 },
                        to: { opacity: 1 },
                      },
                    }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(template.id);
                      }}
                      sx={{
                        px: 6,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        background: colors.primary,
                        color: "#fff",
                        borderRadius: 2,
                        "&:hover": {
                          background: colors.primaryLight,
                        },
                      }}
                    >
                      Select
                    </Button>

                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<VisibilityIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDemo(template.id);
                      }}
                      sx={{
                        px: 5,
                        py: 1.5,
                        fontSize: "1rem",
                        fontWeight: 600,
                        textTransform: "none",
                        borderColor: alpha(colors.text, 0.3),
                        color: colors.text,
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: colors.text,
                          bgcolor: alpha(colors.text, 0.1),
                        },
                      }}
                    >
                      Demo
                    </Button>
                  </Box>
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </>
  );

  // When embedded in dashboard, return content without full-page wrapper
  if (embedded) {
    return content;
  }

  // Standalone mode with full-page wrapper
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: colors.bgDefault,
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* Back Button */}
        <Box sx={{ mb: 4 }}>
          <IconButton
            onClick={handleBack}
            sx={{
              color: colors.text,
              "&:hover": {
                bgcolor: alpha(colors.primary, 0.1),
              },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
        </Box>
        {content}
      </Container>
    </Box>
  );
};

export default CreateWebsiteWizard;
