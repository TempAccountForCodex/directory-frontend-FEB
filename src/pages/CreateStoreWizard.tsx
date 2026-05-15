/**
 * Create Store Wizard - Template Selection for Stores
 * Similar to website wizard but specifically for e-commerce stores
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
  Grid,
  Card,
  Button,
  alpha,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ColorPickerWithAlpha from "../components/UI/ColorPickerWithAlpha";
import {
  getStoreTemplates,
  refreshTemplateCache,
  type TemplateSummary,
} from "../templates/templateApi";
import { useStoreWebsiteCreation } from "../hooks/useStoreWebsiteCreation";
import {
  generateTemplatePlaceholder,
  isPlaceholderPath,
} from "../utils/templatePlaceholderImage";

const CreateStoreWizard: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [hoveredTemplateId, setHoveredTemplateId] = useState<string | null>(
    null,
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<TemplateSummary[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    websiteName: "",
    websiteSlug: "",
    primaryColor: "#0891b2",
    storeName: "",
    storeSlug: "",
    currency: "USD",
  });

  const {
    createStoreWebsite,
    loading: createLoading,
    error: createError,
  } = useStoreWebsiteCreation();

  const storeTemplates = templates.sort((a, b) => a.name.localeCompare(b.name));

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const loadTemplates = useCallback((forceRefresh = false) => {
    let cancelled = false;
    setTemplatesLoading(true);
    const loader = forceRefresh ? refreshTemplateCache : getStoreTemplates;
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

  const handleBack = () => {
    navigate("/dashboard");
  };

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = storeTemplates.find((t) => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        primaryColor:
          template.defaultWebsiteConfig?.primaryColor || formData.primaryColor,
      });
    }
    setCustomizeDialogOpen(true);
  };

  const handleDemo = (templateId: string) => {
    window.open(`/template-preview/${templateId}`, "_blank");
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleCreateStore = async () => {
    try {
      await createStoreWebsite(
        {
          name: formData.websiteName,
          slug: formData.websiteSlug,
          primaryColor: formData.primaryColor,
          isPublic: true,
        } as any,
        {
          name: formData.storeName,
          slug: formData.storeSlug,
          currency: formData.currency,
        },
      );
      // Success - navigate back to stores
      navigate("/dashboard?tab=stores");
    } catch (err) {
      // Error is handled by the hook
      console.error("Error creating store:", err);
    }
  };

  if (loading || templatesLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: colors.bgDefault,
        }}
      >
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  if (!user) {
    return null;
  }

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

        {/* Header */}
        <Box sx={{ mb: 6, textAlign: "center" }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 800,
              color: colors.text,
              background: `linear-gradient(135deg, ${colors.text} 0%, ${colors.primary} 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: "-0.5px",
              mb: 2,
            }}
          >
            Create Your Online Store
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: colors.textSecondary,
              maxWidth: 800,
              mx: "auto",
              fontSize: "1.1rem",
            }}
          >
            Choose a template to get started with your e-commerce store. Each
            template includes a professional design optimized for selling
            products online.
          </Typography>
        </Box>

        {/* Template Grid */}
        <Grid container spacing={3}>
          {templatesError && (
            <Grid item xs={12}>
              <Alert severity="error">{templatesError}</Alert>
            </Grid>
          )}
          {/* Blank Store Option */}
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
              onClick={() => handleSelectTemplate("blank")}
            >
              <Box sx={{ textAlign: "center" }}>
                <ShoppingBagIcon
                  sx={{
                    fontSize: 64,
                    color: colors.textSecondary,
                    mb: 2,
                  }}
                />
                <Typography
                  variant="h5"
                  sx={{
                    color: colors.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  Blank Store
                </Typography>
              </Box>

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
                      handleSelectTemplate("blank");
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
          {storeTemplates.map((template) => {
            const previewImage = template.previewImage
              ? isPlaceholderPath(template.previewImage)
                ? generateTemplatePlaceholder(
                    template.name,
                    template.defaultWebsiteConfig?.primaryColor ||
                      colors.primary,
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
                        <ShoppingBagIcon
                          sx={{
                            fontSize: 64,
                            color:
                              template.defaultWebsiteConfig?.primaryColor ||
                              colors.primary,
                            opacity: 0.5,
                          }}
                        />
                      )}
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="caption"
                      sx={{
                        position: "absolute",
                        bottom: 16,
                        left: 16,
                        right: 16,
                        color: colors.textSecondary,
                        fontSize: "0.75rem",
                        textAlign: "center",
                      }}
                    >
                      {template.description}
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
                          handleSelectTemplate(template.id);
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
      </Container>

      {/* Customize Dialog */}
      <Dialog
        open={customizeDialogOpen}
        onClose={() => !createLoading && setCustomizeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 700,
            borderBottom: `0.5px solid ${colors.border}`,
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight={700}>
              Configure Your Store
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          {createError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {createError}
            </Alert>
          )}

          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, mb: 3 }}
          >
            Create a website with a built-in e-commerce store for selling
            products online.
          </Typography>

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.text, fontWeight: 600 }}
          >
            Website Details
          </Typography>

          <TextField
            fullWidth
            label="Website Name"
            value={formData.websiteName}
            onChange={(e) => {
              const name = e.target.value;
              const slug = generateSlug(name);
              setFormData({
                ...formData,
                websiteName: name,
                websiteSlug: slug,
                storeName: name,
                storeSlug: slug,
              });
            }}
            disabled={createLoading}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: colors.text,
                "& fieldset": { borderColor: colors.border },
                "&:hover fieldset": { borderColor: colors.primary },
                "&.Mui-focused fieldset": { borderColor: colors.primary },
              },
              "& .MuiInputLabel-root": {
                color: colors.textSecondary,
                "&.Mui-focused": { color: colors.primary },
              },
            }}
            helperText="Example: My Online Store"
          />

          <TextField
            fullWidth
            label="Website Slug"
            value={formData.websiteSlug}
            onChange={(e) =>
              setFormData({
                ...formData,
                websiteSlug: e.target.value,
              })
            }
            disabled={createLoading}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: colors.text,
                "& fieldset": { borderColor: colors.border },
                "&:hover fieldset": { borderColor: colors.primary },
                "&.Mui-focused fieldset": { borderColor: colors.primary },
              },
              "& .MuiInputLabel-root": {
                color: colors.textSecondary,
                "&.Mui-focused": { color: colors.primary },
              },
            }}
            helperText="URL-safe identifier"
          />

          <Box sx={{ mb: 3 }}>
            <ColorPickerWithAlpha
              value={formData.primaryColor}
              onChange={(color) =>
                setFormData({
                  ...formData,
                  primaryColor: color,
                })
              }
              label="Primary Color"
              helperText="Brand color for your store"
              showAlpha={true}
              disabled={createLoading}
            />
          </Box>

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.text, fontWeight: 600 }}
          >
            Store Details
          </Typography>

          <TextField
            fullWidth
            label="Store Name"
            value={formData.storeName}
            onChange={(e) => {
              const name = e.target.value;
              const slug = generateSlug(name);
              setFormData({
                ...formData,
                storeName: name,
                storeSlug: slug,
              });
            }}
            disabled={createLoading}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: colors.text,
                "& fieldset": { borderColor: colors.border },
                "&:hover fieldset": { borderColor: colors.primary },
                "&.Mui-focused fieldset": { borderColor: colors.primary },
              },
              "& .MuiInputLabel-root": {
                color: colors.textSecondary,
                "&.Mui-focused": { color: colors.primary },
              },
            }}
            helperText="Display name for your store"
          />

          <TextField
            fullWidth
            label="Store Slug"
            value={formData.storeSlug}
            onChange={(e) =>
              setFormData({
                ...formData,
                storeSlug: e.target.value,
              })
            }
            disabled={createLoading}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: colors.text,
                "& fieldset": { borderColor: colors.border },
                "&:hover fieldset": { borderColor: colors.primary },
                "&.Mui-focused fieldset": { borderColor: colors.primary },
              },
              "& .MuiInputLabel-root": {
                color: colors.textSecondary,
                "&.Mui-focused": { color: colors.primary },
              },
            }}
            helperText="Used in your store URL"
          />

          <TextField
            fullWidth
            select
            label="Currency"
            value={formData.currency}
            onChange={(e) =>
              setFormData({
                ...formData,
                currency: e.target.value,
              })
            }
            disabled={createLoading}
            sx={{
              "& .MuiOutlinedInput-root": {
                color: colors.text,
                "& fieldset": { borderColor: colors.border },
                "&:hover fieldset": { borderColor: colors.primary },
                "&.Mui-focused fieldset": { borderColor: colors.primary },
              },
              "& .MuiInputLabel-root": {
                color: colors.textSecondary,
                "&.Mui-focused": { color: colors.primary },
              },
            }}
            SelectProps={{
              native: true,
            }}
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="PKR">PKR - Pakistani Rupee</option>
          </TextField>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCustomizeDialogOpen(false)}
            disabled={createLoading}
            sx={{
              color: colors.textSecondary,
              "&:hover": { background: alpha(colors.textSecondary, 0.1) },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateStore}
            variant="contained"
            disabled={
              createLoading ||
              !formData.websiteName ||
              !formData.websiteSlug ||
              !formData.storeName ||
              !formData.storeSlug
            }
            sx={(t) => ({
              background:
                actualTheme === "light"
                  ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`
                  : (t.palette as any).bg.dark,
              color: actualTheme === "light" ? "#FFFFFF" : colors.text,
              fontWeight: 600,
              border:
                actualTheme === "light"
                  ? `1px solid ${alpha(colors.primary, 0.3)}`
                  : `1px solid ${colors.border}`,
              "&:hover": {
                background:
                  actualTheme === "light"
                    ? `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`
                    : `linear-gradient(135deg, ${(t.palette as any).bg.dark} 0%, ${(t.palette as any).bg.dark} 10%)`,
              },
            })}
          >
            {createLoading ? <CircularProgress size={24} /> : "Create Store"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CreateStoreWizard;
