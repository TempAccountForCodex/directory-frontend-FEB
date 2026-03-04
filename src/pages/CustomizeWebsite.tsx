/**
 * CustomizeWebsite - Step 2 of Website Creation
 *
 * Complete customization UI for creating a website from a template.
 * Features:
 * - Basic website info (name, slug, colors)
 * - Page selection and reordering
 * - Section selection for key pages
 * - Live preview
 */

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Checkbox,
  FormControlLabel,
  IconButton,
  Divider,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Chip,
  Tooltip,
  alpha,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  CheckCircle as CheckIcon,
  InfoOutlined as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import axios from "axios";
import { getTemplateById, type Template } from "../templates";
// @ts-ignore - dashboardTheme is a JS file
import { getDashboardColors } from "../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import BlockRenderer from "../components/PublicWebsite/BlockRenderer";
import ColorPickerWithAlpha from "../components/UI/ColorPickerWithAlpha";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// Plan limits - MUST match backend/services/planService.js PLAN_LIMITS.maxPagesPerWebsite
const MAX_PAGES_PER_WEBSITE = 5;

interface PageSelection {
  id: string;
  title: string;
  path: string;
  isHome: boolean;
  selected: boolean;
  sortOrder: number;
  blocks: any[];
}

interface SectionToggle {
  pageTitle: string;
  sectionIndex: number;
  sectionName: string;
  enabled: boolean;
}

/**
 * Generates a meaningful section name from a block
 * Avoids showing "TEXT - TEXT" for blocks without headings
 */
const generateSectionName = (block: any, index: number): string => {
  const heading = block.content?.heading;

  if (heading) {
    return `${block.type} - ${heading}`;
  }

  // For blocks without headings, try to use body text
  const body = block.content?.body;
  if (body && typeof body === "string") {
    // Truncate body to first 30 characters
    const truncated = body.length > 30 ? body.substring(0, 30) + "..." : body;
    return `${block.type} - ${truncated}`;
  }

  // Fallback: Use section number
  return `${block.type} Section ${index + 1}`;
};

interface CustomizeWebsiteProps {
  embedded?: boolean;
}

const CustomizeWebsite: React.FC<CustomizeWebsiteProps> = ({
  embedded = false,
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get("template");
  const { actualTheme } = useCustomTheme();
  const { user, loading: authLoading } = useAuth();
  const colors = getDashboardColors(actualTheme);

  // Template data
  const [template, setTemplate] = useState<Template | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);

  // Basic Info State
  const [websiteName, setWebsiteName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [primaryColor, setPrimaryColor] = useState(
    template?.defaultWebsiteConfig?.primaryColor || "#378C92",
  );
  const [secondaryColor, setSecondaryColor] = useState(
    template?.defaultWebsiteConfig?.secondaryColor || "#D3EB63",
  );
  const [headingColor, setHeadingColor] = useState(
    template?.defaultWebsiteConfig?.headingTextColor || "#252525",
  );
  const [bodyColor, setBodyColor] = useState(
    template?.defaultWebsiteConfig?.bodyTextColor || "#6A6F78",
  );

  // Pages State
  const [pages, setPages] = useState<PageSelection[]>([]);

  // Sections State (for Home and Services pages)
  const [sections, setSections] = useState<SectionToggle[]>([]);

  // UI State
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Color validation errors
  const [primaryColorError, setPrimaryColorError] = useState<
    string | undefined
  >(undefined);
  const [secondaryColorError, setSecondaryColorError] = useState<
    string | undefined
  >(undefined);
  const [headingColorError, setHeadingColorError] = useState<
    string | undefined
  >(undefined);
  const [bodyColorError, setBodyColorError] = useState<string | undefined>(
    undefined,
  );

  /**
   * Validates if a string is a valid hex color code
   * Accepts formats: #RGB, #RRGGBB, #RRGGBBAA
   */
  const isValidHexColor = (color: string): boolean => {
    return /^#([0-9A-F]{3}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(color);
  };

  /**
   * Validates a color and sets error state if invalid
   */
  const validateColor = (
    color: string,
    setError: React.Dispatch<React.SetStateAction<string | undefined>>,
  ): boolean => {
    if (!color) {
      setError("Color is required");
      return false;
    }
    if (!isValidHexColor(color)) {
      setError("Invalid hex color (e.g., #FF5733)");
      return false;
    }
    setError(undefined);
    return true;
  };

  // Initialize pages from template
  useEffect(() => {
    let isMounted = true;
    if (!templateId) {
      setTemplate(null);
      setTemplateLoading(false);
      return;
    }
    setTemplateLoading(true);
    getTemplateById(templateId)
      .then((data) => {
        if (isMounted) {
          setTemplate(data || null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTemplate(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setTemplateLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, [templateId]);

  useEffect(() => {
    if (template) {
      setInitializing(true);
      const initialPages: PageSelection[] = template.defaultPages.map(
        (page, index) => ({
          id: `page-${index}`,
          title: page.title,
          path: page.path,
          isHome: page.isHome,
          selected: true, // All pages selected by default
          sortOrder: page.sortOrder,
          blocks: page.blocks,
        }),
      );
      setPages(initialPages);

      // Initialize sections for Home and Services pages
      const initialSections: SectionToggle[] = [];

      // Home page sections
      const homePage = template.defaultPages.find((p) => p.isHome);
      if (homePage) {
        homePage.blocks.forEach((block, index) => {
          initialSections.push({
            pageTitle: "Home",
            sectionIndex: index,
            sectionName: generateSectionName(block, index),
            enabled: true,
          });
        });
      }

      // Services page sections
      const servicesPage = template.defaultPages.find(
        (p) => p.title === "Services",
      );
      if (servicesPage) {
        servicesPage.blocks.forEach((block, index) => {
          initialSections.push({
            pageTitle: "Services",
            sectionIndex: index,
            sectionName: generateSectionName(block, index),
            enabled: true,
          });
        });
      }

      setSections(initialSections);

      setPrimaryColor(template.defaultWebsiteConfig?.primaryColor || "#378C92");
      setSecondaryColor(
        template.defaultWebsiteConfig?.secondaryColor || "#D3EB63",
      );
      setHeadingColor(
        template.defaultWebsiteConfig?.headingTextColor || "#252525",
      );
      setBodyColor(template.defaultWebsiteConfig?.bodyTextColor || "#6A6F78");

      // Small delay to ensure smooth transition
      setTimeout(() => setInitializing(false), 100);
    }
  }, [template]);

  // Auto-generate slug from name
  useEffect(() => {
    if (!slugTouched && websiteName) {
      const generatedSlug = websiteName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setSlug(generatedSlug);
    }
  }, [websiteName, slugTouched]);

  // Validate slug
  const slugError = useMemo(() => {
    if (!slug) return null;
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    if (slug.startsWith("-") || slug.endsWith("-")) {
      return "Slug cannot start or end with a hyphen";
    }
    return null;
  }, [slug]);

  // Handle page selection toggle
  const togglePage = (pageId: string) => {
    setPages((prevPages) =>
      prevPages.map((page) => {
        if (page.id === pageId && !page.isHome) {
          return { ...page, selected: !page.selected };
        }
        return page;
      }),
    );
    markAsModified();
  };

  // Handle page reordering
  const movePage = (index: number, direction: "up" | "down") => {
    // Only allow reordering of selected pages
    const currentPage = pages[index];
    if (!currentPage.selected) {
      return;
    }

    // Find the next selected page in the direction
    let targetIndex = index;
    if (direction === "up") {
      // Find previous selected page
      for (let i = index - 1; i >= 0; i--) {
        if (pages[i].selected) {
          targetIndex = i;
          break;
        }
      }
    } else {
      // Find next selected page
      for (let i = index + 1; i < pages.length; i++) {
        if (pages[i].selected) {
          targetIndex = i;
          break;
        }
      }
    }

    // If no target found (already at boundary of selected pages), do nothing
    if (targetIndex === index) {
      return;
    }

    const newPages = [...pages];
    [newPages[index], newPages[targetIndex]] = [
      newPages[targetIndex],
      newPages[index],
    ];

    // Update sortOrder only for the swapped pages (performance optimization)
    newPages[index].sortOrder = index;
    newPages[targetIndex].sortOrder = targetIndex;

    setPages(newPages);
    markAsModified();
  };

  // Handle section toggle
  const toggleSection = (pageTitle: string, sectionIndex: number) => {
    setSections((prevSections) =>
      prevSections.map((section) =>
        section.pageTitle === pageTitle && section.sectionIndex === sectionIndex
          ? { ...section, enabled: !section.enabled }
          : section,
      ),
    );
    markAsModified();
  };

  // Get selected pages with enabled sections
  const getSelectedPagesData = () => {
    return pages
      .filter((page) => page.selected)
      .map((page) => {
        // Filter blocks based on enabled sections
        const enabledBlocks = page.blocks.filter((block, blockIndex) => {
          const section = sections.find(
            (s) => s.pageTitle === page.title && s.sectionIndex === blockIndex,
          );
          // If no section toggle exists, include the block
          return !section || section.enabled;
        });

        return {
          title: page.title,
          path: page.path,
          isHome: page.isHome,
          sortOrder: page.sortOrder,
          blocks: enabledBlocks,
        };
      });
  };

  // Get preview data (home page with enabled sections)
  const previewData = useMemo(() => {
    const selectedPages = pages
      .filter((page) => page.selected)
      .map((page) => {
        // Filter blocks based on enabled sections
        const enabledBlocks = page.blocks.filter((block, blockIndex) => {
          const section = sections.find(
            (s) => s.pageTitle === page.title && s.sectionIndex === blockIndex,
          );
          // If no section toggle exists, include the block
          return !section || section.enabled;
        });

        return {
          title: page.title,
          path: page.path,
          isHome: page.isHome,
          sortOrder: page.sortOrder,
          blocks: enabledBlocks,
        };
      });

    const homePage = selectedPages.find((p) => p.isHome);
    return homePage || null;
  }, [pages, sections]);

  // Handle create website
  const handleCreateWebsite = async () => {
    // Validate all required fields
    if (!websiteName || !slug || slugError) {
      setError("Please fill in all required fields correctly");
      return;
    }

    // Validate all colors
    const isPrimaryValid = validateColor(primaryColor, setPrimaryColorError);
    const isSecondaryValid = validateColor(
      secondaryColor,
      setSecondaryColorError,
    );
    const isHeadingValid = validateColor(headingColor, setHeadingColorError);
    const isBodyValid = validateColor(bodyColor, setBodyColorError);

    if (
      !isPrimaryValid ||
      !isSecondaryValid ||
      !isHeadingValid ||
      !isBodyValid
    ) {
      setError("Please fix color validation errors");
      return;
    }

    // Check if user is authenticated (using useAuth hook)
    if (!user) {
      setError("Please log in to create a website");
      navigate("/auth");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const selectedPagesData = getSelectedPagesData();

      // Get token for API request

      const response = await axios.post(
        `${API_URL}/websites`,
        {
          name: websiteName,
          slug,
          primaryColor,
          secondaryColor,
          headingTextColor: headingColor,
          bodyTextColor: bodyColor,
          templateId,
          customPages: selectedPagesData,
        },
        {
          headers: {},
        },
      );

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate("/dashboard/websites");
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error creating website:", err);

      // Handle authentication errors
      if (err.response?.status === 401) {
        setError("Your session has expired. Please log in again.");
        setTimeout(() => {
          navigate("/auth");
        }, 2000);
        return;
      }

      setError(err.response?.data?.message || "Failed to create website");
    } finally {
      setLoading(false);
    }
  };

  // Track if form has been modified by user interaction
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Helper to mark form as modified (call this on user input)
  const markAsModified = () => {
    if (!initializing) {
      setHasUnsavedChanges(true);
    }
  };

  // Warn user before leaving page with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !success) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges, success]);

  // Handle back with confirmation
  const handleBack = () => {
    if (hasUnsavedChanges && !success) {
      const confirmLeave = window.confirm(
        "You have unsaved changes. Are you sure you want to leave? All customizations will be lost.",
      );
      if (!confirmLeave) {
        return;
      }
    }
    // Navigate back to template selection
    navigate(
      `/dashboard/websites/create${templateId ? `?selected=${templateId}` : ""}`,
    );
  };

  // Countdown for auto-redirect
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  // Auto-redirect when template not found
  useEffect(() => {
    if (!template && !templateLoading) {
      // Update countdown every second
      const countdownInterval = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Redirect after 3 seconds
      const timer = setTimeout(() => {
        navigate("/dashboard/websites/create");
      }, 3000);

      return () => {
        clearTimeout(timer);
        clearInterval(countdownInterval);
      };
    }
  }, [template, navigate]);

  if (templateLoading) {
    const loadingContent = (
      <>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={handleBack}
            sx={{ mb: 2, color: colors.text }}
          >
            Back to Templates
          </Button>
          <Typography
            variant="h4"
            sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
          >
            Loading Template
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      </>
    );

    if (embedded) {
      return loadingContent;
    }

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: colors.bgDefault, py: 4 }}>
        <Container maxWidth="xl">{loadingContent}</Container>
      </Box>
    );
  }

  if (!template) {
    const errorContent = (
      <>
        <Alert severity="error">
          Template not found. Please select a template first.
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Redirecting to template selection in {redirectCountdown} second
            {redirectCountdown !== 1 ? "s" : ""}...
          </Typography>
        </Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          Back to Templates Now
        </Button>
      </>
    );

    if (embedded) {
      return errorContent;
    }

    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {errorContent}
      </Container>
    );
  }

  const canCreate = websiteName && slug && !slugError && !loading;

  // Show loading skeleton while initializing
  if (initializing) {
    const initializingContent = (
      <>
        <Box sx={{ mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={handleBack}
            sx={{ mb: 2, color: colors.text }}
          >
            Back to Templates
          </Button>
          <Typography
            variant="h4"
            sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
          >
            Customize Your Website
          </Typography>
          <Typography
            variant="body1"
            component="div"
            sx={{ color: colors.textSecondary }}
          >
            Template:{" "}
            <Chip
              label={template.name}
              size="small"
              color="primary"
              sx={{ ml: 1 }}
            />
          </Typography>
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            <Stack spacing={3}>
              {[1, 2, 3, 4].map((i) => (
                <Paper
                  key={i}
                  sx={{
                    p: 3,
                    bgcolor: alpha(colors.dark, 0.3),
                    borderRadius: 2,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <CircularProgress
                      size={24}
                      sx={{ color: colors.primary }}
                    />
                    <Typography sx={{ color: colors.textSecondary }}>
                      Loading template configuration...
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
                <CircularProgress sx={{ color: colors.primary }} />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </>
    );

    if (embedded) {
      return initializingContent;
    }

    return (
      <Box sx={{ minHeight: "100vh", bgcolor: colors.bgDefault, py: 4 }}>
        <Container maxWidth="xl">{initializingContent}</Container>
      </Box>
    );
  }

  const content = (
    <>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={handleBack}
          sx={{ mb: 2, color: colors.text }}
        >
          Back to Templates
        </Button>
        <Typography
          variant="h4"
          sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
        >
          Customize Your Website
        </Typography>
        <Typography
          variant="body1"
          component="div"
          sx={{ color: colors.textSecondary }}
        >
          Template:{" "}
          <Chip
            label={template.name}
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        </Typography>
      </Box>

      {/* Success Message */}
      {success && (
        <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
          Website created successfully! Redirecting to dashboard...
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Panel - Configuration */}
        <Grid item xs={12} lg={6}>
          <Stack spacing={3}>
            {/* Basic Info Card */}
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Typography
                variant="h6"
                sx={{ color: colors.text, fontWeight: 600, mb: 3 }}
              >
                Basic Information
              </Typography>

              <TextField
                fullWidth
                label="Website Name *"
                value={websiteName}
                onChange={(e) => {
                  setWebsiteName(e.target.value);
                  markAsModified();
                }}
                sx={{ mb: 2 }}
                placeholder="e.g., My Professional Services"
              />

              <TextField
                fullWidth
                label="URL Slug *"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                  markAsModified();
                }}
                error={!!slugError}
                helperText={
                  slugError ||
                  `Your website will be accessible at: /site/${slug || "your-slug"}`
                }
                sx={{ mb: 3 }}
                placeholder="e.g., my-services"
              />

              <Divider sx={{ my: 3 }} />

              <Typography
                variant="subtitle2"
                sx={{ color: colors.text, fontWeight: 600, mb: 2 }}
              >
                Colors
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <ColorPickerWithAlpha
                    value={primaryColor}
                    onChange={(color) => {
                      setPrimaryColor(color);
                      validateColor(color, setPrimaryColorError);
                      markAsModified();
                    }}
                    label="Primary Color"
                    error={primaryColorError}
                    showAlpha={true}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ColorPickerWithAlpha
                    value={secondaryColor}
                    onChange={(color) => {
                      setSecondaryColor(color);
                      validateColor(color, setSecondaryColorError);
                      markAsModified();
                    }}
                    label="Secondary Color"
                    error={secondaryColorError}
                    showAlpha={true}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ColorPickerWithAlpha
                    value={headingColor}
                    onChange={(color) => {
                      setHeadingColor(color);
                      validateColor(color, setHeadingColorError);
                      markAsModified();
                    }}
                    label="Heading Text"
                    error={headingColorError}
                    showAlpha={false}
                  />
                </Grid>
                <Grid item xs={6}>
                  <ColorPickerWithAlpha
                    value={bodyColor}
                    onChange={(color) => {
                      setBodyColor(color);
                      validateColor(color, setBodyColorError);
                      markAsModified();
                    }}
                    label="Body Text"
                    error={bodyColorError}
                    showAlpha={false}
                  />
                </Grid>
              </Grid>
            </Paper>

            {/* Pages Selection Card */}
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Typography
                  variant="h6"
                  sx={{ color: colors.text, fontWeight: 600 }}
                >
                  Select Pages
                </Typography>
                <Tooltip
                  title={`Your current plan allows up to ${MAX_PAGES_PER_WEBSITE} pages per website. Upgrade your plan to add more pages.`}
                  arrow
                >
                  <InfoIcon
                    sx={{
                      fontSize: 18,
                      color: colors.textSecondary,
                      cursor: "help",
                    }}
                  />
                </Tooltip>
              </Box>
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, mb: 1, display: "block" }}
              >
                Choose which pages to include. Home page is required.
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color:
                      pages.filter((p) => p.selected).length >=
                      MAX_PAGES_PER_WEBSITE
                        ? colors.warning
                        : colors.textSecondary,
                    fontWeight: 600,
                  }}
                >
                  {pages.filter((p) => p.selected).length} /{" "}
                  {MAX_PAGES_PER_WEBSITE} pages selected
                </Typography>
                {pages.filter((p) => p.selected).length >=
                  MAX_PAGES_PER_WEBSITE && (
                  <Chip
                    icon={<WarningIcon />}
                    label="Maximum reached"
                    size="small"
                    color="warning"
                    sx={{ height: 20, fontSize: "0.7rem" }}
                  />
                )}
              </Box>

              {pages.filter((p) => p.selected).length >=
                MAX_PAGES_PER_WEBSITE && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  You've reached the maximum of {MAX_PAGES_PER_WEBSITE} pages.
                  To add more pages, deselect an existing page first.
                </Alert>
              )}

              <Stack spacing={1}>
                {pages.map((page, index) => {
                  const selectedCount = pages.filter((p) => p.selected).length;
                  const isMaxReached = selectedCount >= MAX_PAGES_PER_WEBSITE;
                  const isDisabled =
                    page.isHome || (!page.selected && isMaxReached);

                  // Determine tooltip message
                  const getTooltipMessage = () => {
                    if (page.isHome) {
                      return "Home page is required and cannot be deselected";
                    }
                    if (!page.selected && isMaxReached) {
                      return `Maximum of ${MAX_PAGES_PER_WEBSITE} pages reached. Deselect another page to enable this one.`;
                    }
                    return "";
                  };

                  return (
                    <Card
                      key={page.id}
                      sx={{
                        bgcolor: page.selected
                          ? alpha(colors.primary, 0.1)
                          : alpha(colors.dark, 0.3),
                        border: `1px solid ${page.selected ? colors.primary : "transparent"}`,
                        opacity: isDisabled && !page.isHome ? 0.5 : 1,
                        cursor:
                          isDisabled && !page.isHome
                            ? "not-allowed"
                            : "default",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <CardContent
                        sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                      >
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Tooltip
                            title={getTooltipMessage()}
                            arrow
                            placement="top"
                            disableHoverListener={!isDisabled}
                          >
                            <Box>
                              <Checkbox
                                checked={page.selected}
                                disabled={isDisabled}
                                onChange={() => togglePage(page.id)}
                                size="small"
                              />
                            </Box>
                          </Tooltip>
                          <Box sx={{ flex: 1 }}>
                            <Typography
                              variant="body2"
                              component="div"
                              sx={{ fontWeight: 600 }}
                            >
                              {page.title}
                              {page.isHome && (
                                <Chip
                                  label="Required"
                                  size="small"
                                  color="primary"
                                  sx={{ ml: 1, height: 18 }}
                                />
                              )}
                              {!page.selected &&
                                isMaxReached &&
                                !page.isHome && (
                                  <Chip
                                    label="Limit reached"
                                    size="small"
                                    color="warning"
                                    sx={{ ml: 1, height: 18 }}
                                  />
                                )}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: colors.textSecondary }}
                            >
                              {page.path}
                            </Typography>
                          </Box>
                          {page.selected && (
                            <Box>
                              <IconButton
                                size="small"
                                onClick={() => movePage(index, "up")}
                                disabled={
                                  !pages.slice(0, index).some((p) => p.selected)
                                }
                              >
                                <UpIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                onClick={() => movePage(index, "down")}
                                disabled={
                                  !pages
                                    .slice(index + 1)
                                    .some((p) => p.selected)
                                }
                              >
                                <DownIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </Paper>

            {/* Sections Selection Card */}
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Typography
                variant="h6"
                sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
              >
                Customize Sections
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, mb: 3, display: "block" }}
              >
                Enable or disable specific sections for Home and Services pages.
              </Typography>

              {/* Home Sections */}
              {sections.filter((s) => s.pageTitle === "Home").length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
                  >
                    Home Page Sections
                  </Typography>
                  <Stack spacing={0.5}>
                    {sections
                      .filter((s) => s.pageTitle === "Home")
                      .map((section, idx) => (
                        <FormControlLabel
                          key={`home-${idx}`}
                          control={
                            <Checkbox
                              checked={section.enabled}
                              onChange={() =>
                                toggleSection(
                                  section.pageTitle,
                                  section.sectionIndex,
                                )
                              }
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {section.sectionName}
                            </Typography>
                          }
                        />
                      ))}
                  </Stack>
                </Box>
              )}

              {/* Services Sections */}
              {sections.filter((s) => s.pageTitle === "Services").length >
                0 && (
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
                  >
                    Services Page Sections
                  </Typography>
                  <Stack spacing={0.5}>
                    {sections
                      .filter((s) => s.pageTitle === "Services")
                      .map((section, idx) => (
                        <FormControlLabel
                          key={`services-${idx}`}
                          control={
                            <Checkbox
                              checked={section.enabled}
                              onChange={() =>
                                toggleSection(
                                  section.pageTitle,
                                  section.sectionIndex,
                                )
                              }
                              size="small"
                            />
                          }
                          label={
                            <Typography variant="body2">
                              {section.sectionName}
                            </Typography>
                          }
                        />
                      ))}
                  </Stack>
                </Box>
              )}
            </Paper>

            {/* Action Buttons */}
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                  fullWidth
                >
                  Back
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCreateWebsite}
                  disabled={!canCreate}
                  fullWidth
                >
                  {loading ? <CircularProgress size={24} /> : "Create Website"}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>

        {/* Right Panel - Live Preview */}
        <Grid item xs={12} lg={6}>
          <Box sx={{ position: "sticky", top: 20 }}>
            <Paper
              sx={{ p: 3, bgcolor: alpha(colors.dark, 0.3), borderRadius: 2 }}
            >
              <Typography
                variant="h6"
                sx={{ color: colors.text, fontWeight: 600, mb: 3 }}
              >
                Live Preview
              </Typography>

              {/* Preview Container */}
              <Box
                sx={{
                  bgcolor: "#fff",
                  borderRadius: 2,
                  overflow: "hidden",
                  border: `1px solid ${alpha(colors.primary, 0.2)}`,
                  maxHeight: "70vh",
                  overflowY: "auto",
                }}
              >
                {/* Preview Navigation */}
                <Box
                  sx={{
                    py: 2,
                    px: 3,
                    borderBottom: "1px solid #e2e8f0",
                    bgcolor: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 700,
                      color: primaryColor,
                      flexShrink: 0,
                    }}
                  >
                    {websiteName || "Your Website"}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, overflow: "auto" }}>
                    {pages
                      .filter((p) => p.selected)
                      .map((page) => (
                        <Typography
                          key={page.id}
                          variant="body2"
                          sx={{
                            color: page.isHome ? primaryColor : "#64748b",
                            fontWeight: page.isHome ? 600 : 400,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {page.title}
                        </Typography>
                      ))}
                  </Box>
                </Box>

                {/* Preview Content */}
                <Box>
                  {previewData && previewData.blocks.length > 0 ? (
                    previewData.blocks.map((block, idx) => (
                      <BlockRenderer
                        key={idx}
                        block={{
                          id: idx,
                          blockType: block.type,
                          content: block.content,
                          sortOrder: block.sortOrder,
                        }}
                        primaryColor={primaryColor}
                        secondaryColor={secondaryColor}
                        headingColor={headingColor}
                        bodyColor={bodyColor}
                      />
                    ))
                  ) : (
                    <Box sx={{ py: 8, textAlign: "center", color: "#64748b" }}>
                      <Typography variant="body1">
                        No sections enabled for preview
                      </Typography>
                    </Box>
                  )}
                </Box>

                {/* Preview Footer */}
                <Box
                  sx={{
                    py: 4,
                    px: 2,
                    bgcolor: "#1e293b",
                    color: "#fff",
                    textAlign: "center",
                  }}
                >
                  <Typography variant="body2">
                    © {new Date().getFullYear()} {websiteName || "Your Website"}
                    . All rights reserved.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </>
  );

  if (embedded) {
    return content;
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.bgDefault, py: 4 }}>
      <Container maxWidth="xl">{content}</Container>
    </Box>
  );
};

export default CustomizeWebsite;
