import { useState, useEffect, useRef, useCallback } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  alpha,
  LinearProgress,
  MenuItem,
  Skeleton,
} from "@mui/material";
import { CircleCheck, Plus, Store as StoreLucide, X } from "lucide-react";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useNavigate } from "react-router-dom";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { usePlanSummary } from "../../hooks/usePlanSummary";
import { useStoreWebsiteCreation } from "../../hooks/useStoreWebsiteCreation";
import StoreDetail from "./StoreDetail";
import StorePlanUpgradeDialog from "./StorePlanUpgradeDialog";
import {
  getStoreTemplates,
  refreshTemplateCache,
  type TemplateSummary,
} from "../../templates/templateApi";
import {
  DashboardActionButton,
  DashboardGradientButton,
  DashboardInput,
  DashboardMetricCard,
  DashboardSelect,
  PageHeader,
  SearchBar,
} from "./shared";
import React from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const SkeletonCard = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Card
      sx={{
        aspectRatio: "16/10",
        position: "relative",
        overflow: "hidden",
        borderRadius: 2,
        border: `1px solid ${alpha(colors.border, 0.5)}`,
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        animation="wave"
        sx={{ bgcolor: alpha(colors.textSecondary, 0.1) }}
      />
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
        }}
      >
        <Skeleton
          variant="rectangular"
          width={80}
          height={24}
          animation="wave"
          sx={{ borderRadius: 3, bgcolor: alpha(colors.textSecondary, 0.2) }}
        />
      </Box>
    </Card>
  );
};

interface Store {
  id: string;
  name: string;
  slug: string;
  currency: string;
  platformFeePercent: number;
  isPublished: boolean;
  isPublic: boolean;
  createdAt: string;
  deletedAt?: string;
}

interface Website {
  id: number;
  name: string;
  slug: string;
  status: string;
  isPublic: boolean;
  primaryColor: string | null;
  createdAt: string;
  updatedAt: string;
  pageCount: number;
  hasStore: boolean;
  store: {
    id: string;
    name: string;
  } | null;
}

const Stores = ({
  pageTitle,
  pageSubtitle,
}: {
  pageTitle?: string;
  pageSubtitle?: string;
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [activePage, setActivePage] = useState(1);
  const [activeHasMore, setActiveHasMore] = useState(true);
  const [activeLoadingMore, setActiveLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const PAGE_SIZE = 12;
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    websiteId: "",
    name: "",
    slug: "",
    currency: "USD",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Website selection
  const [websites, setWebsites] = useState<Website[]>([]);
  const [websitesLoading, setWebsitesLoading] = useState(false);

  // Selected store for detail view
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Upgrade dialog state
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false);
  const [planLimitMessage, setPlanLimitMessage] = useState("");
  const [limitType, setLimitType] = useState<"stores" | "products">("stores");

  // Store Website creation state (shared flow from Websites tab)
  const [createStoreWebsiteDialogOpen, setCreateStoreWebsiteDialogOpen] =
    useState(false);
  const [storeWebsiteFormData, setStoreWebsiteFormData] = useState({
    websiteName: "",
    websiteSlug: "",
    primaryColor: "#378C92",
    storeName: "",
    storeSlug: "",
    currency: "USD",
    templateId: "",
  });
  const {
    createStoreWebsite,
    loading: storeWebsiteLoading,
    error: storeWebsiteError,
    partialError: storeWebsitePartialError,
  } = useStoreWebsiteCreation();
  const [storeTemplates, setStoreTemplates] = useState<TemplateSummary[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  const loadTemplates = React.useCallback((forceRefresh = false) => {
    let cancelled = false;
    setTemplatesLoading(true);
    const loader = forceRefresh ? refreshTemplateCache : getStoreTemplates;
    loader()
      .then((data) => {
        if (!cancelled) {
          setStoreTemplates(data);
          setTemplatesError(null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setStoreTemplates([]);
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

  // Fetch plan summary for limits
  const {
    planSummary,
    loading: planLoading,
    refetch: refetchPlan,
  } = usePlanSummary();

  useEffect(() => {
    fetchStores(1, true);
  }, []);

  // Re-fetch from page 1 when search changes
  useEffect(() => {
    setActivePage(1);
    setStores([]);
    setActiveHasMore(true);
    fetchStores(1, true);
  }, [debouncedSearch]);

  useEffect(() => {
    if (createDialogOpen) {
      fetchWebsites();
    }
  }, [createDialogOpen]);

  const fetchStores = async (page = 1, reset = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setActiveLoadingMore(true);
      }
      setError(null);
      const params: Record<string, any> = { page, limit: PAGE_SIZE };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      const response = await axios.get(`${API_URL}/stores`, {
        headers: {},
        params,
      });

      const newData = response.data.data || [];
      if (reset) {
        setStores(newData);
      } else {
        setStores((prev) => [...prev, ...newData]);
      }

      setActiveHasMore(newData.length === PAGE_SIZE);
      setActivePage(page);
    } catch (err: any) {
      console.error("Error fetching stores:", err);
      setError(err.response?.data?.message || "Failed to load stores");
    } finally {
      setLoading(false);
      setActiveLoadingMore(false);
    }
  };

  const loadMoreStores = useCallback(() => {
    if (activeLoadingMore || !activeHasMore) return;
    fetchStores(activePage + 1, false);
  }, [activePage, activeLoadingMore, activeHasMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreStores();
        }
      },
      { threshold: 0.1 },
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMoreStores]);

  const fetchWebsites = async () => {
    try {
      setWebsitesLoading(true);
      const response = await axios.get(`${API_URL}/websites`, {
        headers: {},
      });
      // Filter to only show websites without stores
      const availableWebsites = (response.data.data || []).filter(
        (website: Website) => !website.hasStore,
      );
      setWebsites(availableWebsites);
    } catch (err: any) {
      console.error("Error fetching websites:", err);
      setFormError("Failed to load websites. Please try again.");
    } finally {
      setWebsitesLoading(false);
    }
  };

  const handleCreateStore = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      // Convert websiteId to integer before sending
      const payload = {
        ...formData,
        websiteId: parseInt(formData.websiteId, 10),
      };

      const response = await axios.post(`${API_URL}/stores`, payload, {
        headers: {},
      });

      setStores([...stores, response.data.data]);
      setCreateDialogOpen(false);
      setFormData({ websiteId: "", name: "", slug: "", currency: "USD" });
      refetchPlan(); // Refresh plan summary
    } catch (err: any) {
      console.error("Error creating store:", err);

      // Check if error is a plan limit error
      if (err.response?.data?.code === "PLAN_LIMIT_REACHED") {
        setCreateDialogOpen(false);
        setPlanLimitMessage(err.response.data.message);
        setLimitType("stores");
        setUpgradeDialogOpen(true);
      } else {
        setFormError(err.response?.data?.message || "Failed to create store");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleStoreUpdated = () => {
    fetchStores();
    refetchPlan();
  };

  const handlePlanLimitReached = (
    message: string,
    type: "stores" | "products",
  ) => {
    setPlanLimitMessage(message);
    setLimitType(type);
    setUpgradeDialogOpen(true);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleCreateStoreWebsite = async () => {
    try {
      await createStoreWebsite(
        {
          name: storeWebsiteFormData.websiteName,
          slug: storeWebsiteFormData.websiteSlug,
          primaryColor: storeWebsiteFormData.primaryColor,
          isPublic: true,
        },
        {
          name: storeWebsiteFormData.storeName,
          slug: storeWebsiteFormData.storeSlug,
          currency: storeWebsiteFormData.currency,
        },
      );

      // Success - refresh stores list and close dialog
      await fetchStores();
      await refetchPlan();
      setCreateStoreWebsiteDialogOpen(false);
      setStoreWebsiteFormData({
        websiteName: "",
        websiteSlug: "",
        primaryColor: "#378C92",
        storeName: "",
        storeSlug: "",
        currency: "USD",
        templateId: "",
      });
    } catch (err: any) {
      console.error("Error creating store website:", err);

      // Check if error is a plan limit error
      if (err.code === "PLAN_LIMIT_REACHED") {
        setCreateStoreWebsiteDialogOpen(false);
        setPlanLimitMessage(err.message);
        setLimitType("stores");
        setUpgradeDialogOpen(true);
      }
      // Error is already set in the hook, it will be displayed in the dialog
    }
  };

  if (selectedStore) {
    return (
      <StoreDetail
        store={selectedStore}
        onBack={() => {
          setSelectedStore(null);
          handleStoreUpdated();
        }}
        onPlanLimitReached={handlePlanLimitReached}
        planSummary={planSummary}
      />
    );
  }

  if (loading || planLoading) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
        <PageHeader title={pageTitle} subtitle={pageSubtitle} />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress sx={{ color: colors.primary }} />
        </Box>
      </Container>
    );
  }

  const storePlan = planSummary?.storePlan;
  const storeUsage = planSummary?.storeUsage;
  const storesOwned = storeUsage?.storesOwned || 0;
  const maxStores = storePlan?.maxStores || 0;
  const canCreateStore = storesOwned < maxStores;

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {/* Statistics Cards */}
      <Grid
        container
        spacing={{ xs: 2, sm: 2, md: 3 }}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Total Stores"
            value={stores.length}
            icon={StorefrontOutlinedIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Published"
            value={stores.filter((s) => s.isPublished).length}
            icon={CheckCircleOutlinedIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Draft"
            value={stores.filter((s) => !s.isPublished).length}
            icon={SettingsOutlinedIcon}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Store Limit"
            value={maxStores || 0}
            icon={TrendingUpIcon}
          />
        </Grid>
      </Grid>

      {/* Plan Summary Card */}
      {storePlan && (
        <Card
          sx={{
            mb: 4,
            background: `linear-gradient(135deg, ${alpha(
              colors.primary,
              0.1,
            )} 0%, ${alpha(colors.primaryDark, 0.05)} 100%)`,
            backdropFilter: "blur(20px)",
            borderRadius: 3,
            border: `1px solid ${alpha(colors.primary, 0.2)}`,
            boxShadow: `0 2px 8px ${alpha(colors.darker, 0.2)}`,
          }}
        >
          <CardContent>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="start"
              flexWrap="wrap"
              gap={2}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}
                >
                  {storePlan.name || "No Store Plan"}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary, mb: 2 }}
                >
                  {storePlan.priceMonthlyUsd
                    ? `$${storePlan.priceMonthlyUsd}/month`
                    : "Free"}
                  {" • "}
                  {storePlan.platformFeePercent
                    ? `${storePlan.platformFeePercent / 100}% platform fee`
                    : "0% platform fee"}
                </Typography>

                {/* Stores Usage */}
                <Box sx={{ mb: 2 }}>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={1}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      Stores
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.textSecondary }}
                    >
                      {storesOwned} / {maxStores}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(storesOwned / maxStores) * 100}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: alpha(colors.primary, 0.1),
                      "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                      },
                    }}
                  />
                </Box>

                {/* Products Usage */}
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}
                  >
                    Products per store: up to{" "}
                    {storePlan.maxProductsPerStore?.toLocaleString() || 0}
                  </Typography>
                </Box>
              </Box>

              <DashboardGradientButton
                size="small"
                onClick={() => navigate("/pricing#stores")}
              >
                Upgrade Plan
              </DashboardGradientButton>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!canCreateStore && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          You've reached the maximum number of stores ({maxStores}) for your
          current plan. Upgrade to create more stores.
        </Alert>
      )}

      {/* Search Bar */}
      <Box sx={{ mb: 3, maxWidth: { xs: "100%", md: 400 } }}>
        <SearchBar
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          placeholder="Search stores..."
        />
      </Box>

      {/* Stores Grid */}
      <Grid container spacing={3}>
        {/* Create New Store Card */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            onClick={() =>
              canCreateStore && navigate("/dashboard/stores/create")
            }
            sx={{
              aspectRatio: "16/10",
              border: `2px dashed ${alpha(colors.textSecondary, 0.3)}`,
              borderRadius: 2,
              background: alpha(colors.bgCard, 0.3),
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: canCreateStore ? "pointer" : "not-allowed",
              opacity: canCreateStore ? 1 : 0.5,
              transition: "all 0.3s ease",
              "&:hover": canCreateStore
                ? {
                    borderColor: colors.primary,
                    background: alpha(colors.primary, 0.05),
                    transform: "translateY(-4px)",
                  }
                : {},
            }}
          >
            <Box sx={{ color: colors.textSecondary, mb: 2 }}>
              <Plus size={48} />
            </Box>
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 600 }}
            >
              {canCreateStore ? "Create New Store" : "Limit Reached"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.textSecondary,
                mt: 1,
                textAlign: "center",
                px: 2,
              }}
            >
              {canCreateStore
                ? "Start selling online"
                : `Max ${maxStores} stores`}
            </Typography>
          </Card>
        </Grid>

        {/* Loading Skeletons - Initial Load */}
        {loading &&
          [...Array(6)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`skeleton-${index}`}>
              <SkeletonCard />
            </Grid>
          ))}

        {/* Existing Stores */}
        {!loading &&
          stores.map((store) => (
            <Grid item xs={12} sm={6} md={4} key={store.id}>
              <Card
                onClick={() => setSelectedStore(store)}
                sx={{
                  aspectRatio: "16/10",
                  position: "relative",
                  overflow: "hidden",
                  borderRadius: 2,
                  border: `1px solid ${alpha(colors.border, 0.5)}`,
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px ${alpha(colors.primary, 0.2)}`,
                    border: `1px solid ${alpha(colors.primary, 0.5)}`,
                    "& .hover-actions": {
                      opacity: 1,
                    },
                  },
                }}
              >
                {/* Preview Background */}
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${alpha(
                      colors.primary,
                      0.1,
                    )} 0%, ${alpha(colors.primaryDark, 0.05)} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <StoreLucide
                    size={64}
                    color={alpha(colors.textSecondary, 0.2)}
                  />
                </Box>

                {/* Status Badge */}
                <Chip
                  label={store.isPublished ? "PUBLISHED" : "DRAFT"}
                  size="small"
                  sx={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    bgcolor: store.isPublished
                      ? alpha("#22c55e", 0.9)
                      : alpha("#f59e0b", 0.9),
                    color: "#fff",
                    fontWeight: 600,
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    backdropFilter: "blur(10px)",
                  }}
                />

                {/* Hover Actions */}
                <Box
                  className="hover-actions"
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    p: 2,
                    background: `linear-gradient(to top, ${alpha(
                      colors.bgCard,
                      0.95,
                    )} 0%, ${alpha(colors.bgCard, 0.8)} 100%)`,
                    backdropFilter: "blur(10px)",
                    opacity: 0,
                    transition: "opacity 0.3s ease",
                    display: "flex",
                    flexDirection: "column",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: colors.text,
                      fontWeight: 700,
                      mb: 0.5,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {store.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.textSecondary,
                      fontFamily: "monospace",
                      fontSize: "0.75rem",
                      mb: 1,
                    }}
                  >
                    {store.slug} • {store.currency}
                  </Typography>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedStore(store);
                      }}
                      sx={{
                        color: colors.primary,
                        textTransform: "none",
                        fontWeight: 600,
                        "&:hover": { bgcolor: alpha(colors.primary, 0.1) },
                      }}
                    >
                      Manage
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}

        {/* Loading More Skeletons */}
        {activeLoadingMore &&
          [...Array(3)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={`loading-more-${index}`}>
              <SkeletonCard />
            </Grid>
          ))}

        {/* Observer Target for Infinite Scroll */}
        {!loading && activeHasMore && (
          <Grid item xs={12}>
            <Box ref={observerTarget} sx={{ height: 20 }} />
          </Grid>
        )}
      </Grid>

      {/* Create Store Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          Create New Store
          <IconButton onClick={() => setCreateDialogOpen(false)} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: colors.border }}>
          {formError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setFormError(null)}
            >
              {formError}
            </Alert>
          )}

          {websitesLoading ? (
            <Box display="flex" justifyContent="center" py={3}>
              <CircularProgress size={24} sx={{ color: colors.primary }} />
            </Box>
          ) : websites.length === 0 ? (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You don't have any websites available to create a store. All your
              websites already have stores, or you need to{" "}
              <Button
                size="small"
                onClick={() => {
                  setCreateDialogOpen(false);
                  navigate("/websites");
                }}
                sx={{ textTransform: "none", p: 0, minWidth: "auto" }}
              >
                create a website first
              </Button>
              .
            </Alert>
          ) : (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
            >
              <DashboardSelect
                fullWidth
                required
                label="Select Website"
                value={formData.websiteId}
                onChange={(e) =>
                  setFormData({ ...formData, websiteId: e.target.value })
                }
              >
                {websites.map((website) => (
                  <MenuItem key={website.id} value={website.id.toString()}>
                    {website.name} (/{website.slug})
                  </MenuItem>
                ))}
              </DashboardSelect>

              <DashboardInput
                label="Store Name"
                labelPlacement="floating"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value;
                  setFormData({
                    ...formData,
                    name,
                    slug: generateSlug(name),
                  });
                }}
                fullWidth
                required
              />

              <DashboardInput
                label="Store Slug"
                labelPlacement="floating"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                fullWidth
                required
                helperText="Used in your store URL"
              />

              <DashboardSelect
                fullWidth
                label="Currency"
                value={formData.currency}
                onChange={(e) =>
                  setFormData({ ...formData, currency: e.target.value })
                }
              >
                <MenuItem value="USD">USD - US Dollar</MenuItem>
                <MenuItem value="EUR">EUR - Euro</MenuItem>
                <MenuItem value="GBP">GBP - British Pound</MenuItem>
                <MenuItem value="PKR">PKR - Pakistani Rupee</MenuItem>
              </DashboardSelect>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCreateDialogOpen(false)}
            sx={{
              color: colors.textSecondary,
              "&:hover": { background: alpha(colors.textSecondary, 0.1) },
            }}
          >
            Cancel
          </Button>
          <DashboardActionButton
            onClick={handleCreateStore}
            disabled={
              !formData.websiteId ||
              !formData.name ||
              !formData.slug ||
              submitting
            }
            sx={{ px: 3 }}
          >
            {submitting ? (
              <CircularProgress size={20} sx={{ color: "inherit" }} />
            ) : (
              "Create Store"
            )}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Create Store Website Dialog */}
      <Dialog
        open={createStoreWebsiteDialogOpen}
        onClose={() =>
          !storeWebsiteLoading && setCreateStoreWebsiteDialogOpen(false)
        }
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
              Create Store Website
            </Typography>
            <IconButton
              size="small"
              onClick={() => setCreateStoreWebsiteDialogOpen(false)}
              disabled={storeWebsiteLoading}
            >
              <X size={18} />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ borderColor: colors.border, pt: 3 }}>
          {storeWebsiteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {storeWebsiteError}
            </Alert>
          )}

          {storeWebsitePartialError && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {storeWebsitePartialError}
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
            Select a Store Template *
          </Typography>

          {templatesError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {templatesError}
            </Alert>
          )}

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              mb: 3,
            }}
          >
            {templatesLoading && (
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Loading templates...
              </Typography>
            )}
            {storeTemplates.map((template) => (
              <Card
                key={template.id}
                onClick={() => {
                  setStoreWebsiteFormData({
                    ...storeWebsiteFormData,
                    templateId: template.id,
                    primaryColor:
                      template.defaultWebsiteConfig?.primaryColor ||
                      storeWebsiteFormData.primaryColor,
                  });
                }}
                sx={{
                  cursor: "pointer",
                  border:
                    storeWebsiteFormData.templateId === template.id
                      ? `2px solid ${colors.primary}`
                      : `1px solid ${colors.border}`,
                  borderRadius: 2,
                  transition: "all 0.2s",
                  position: "relative",
                  "&:hover": {
                    borderColor: colors.primary,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {storeWebsiteFormData.templateId === template.id && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      background: colors.primary,
                      borderRadius: "50%",
                      width: 24,
                      height: 24,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <CircleCheck size={16} color="#fff" />
                  </Box>
                )}
                <CardContent>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: colors.text, fontWeight: 600, mb: 0.5 }}
                  >
                    {template.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary, display: "block" }}
                  >
                    {template.description}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.text, fontWeight: 600 }}
          >
            Website Details
          </Typography>

          <DashboardInput
            fullWidth
            label="Website Name"
            labelPlacement="floating"
            value={storeWebsiteFormData.websiteName}
            onChange={(e) => {
              const name = e.target.value;
              const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              setStoreWebsiteFormData({
                ...storeWebsiteFormData,
                websiteName: name,
                websiteSlug: slug,
                storeName: name, // Auto-populate store name
                storeSlug: slug, // Auto-populate store slug
              });
            }}
            disabled={storeWebsiteLoading}
            containerSx={{ mb: 2 }}
            helperText="Example: My Online Store"
          />

          <DashboardInput
            fullWidth
            label="Website Slug"
            labelPlacement="floating"
            value={storeWebsiteFormData.websiteSlug}
            onChange={(e) =>
              setStoreWebsiteFormData({
                ...storeWebsiteFormData,
                websiteSlug: e.target.value,
              })
            }
            disabled={storeWebsiteLoading}
            containerSx={{ mb: 2 }}
            helperText="URL-safe identifier"
          />

          <DashboardInput
            fullWidth
            type="color"
            label="Primary Color"
            labelPlacement="floating"
            value={storeWebsiteFormData.primaryColor}
            onChange={(e) =>
              setStoreWebsiteFormData({
                ...storeWebsiteFormData,
                primaryColor: e.target.value,
              })
            }
            disabled={storeWebsiteLoading}
            containerSx={{ mb: 3 }}
            helperText="Brand color for your store"
          />

          <Typography
            variant="subtitle2"
            sx={{ mb: 2, color: colors.text, fontWeight: 600 }}
          >
            Store Details
          </Typography>

          <DashboardInput
            fullWidth
            label="Store Name"
            labelPlacement="floating"
            value={storeWebsiteFormData.storeName}
            onChange={(e) => {
              const name = e.target.value;
              const slug = name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-|-$/g, "");
              setStoreWebsiteFormData({
                ...storeWebsiteFormData,
                storeName: name,
                storeSlug: slug,
              });
            }}
            disabled={storeWebsiteLoading}
            containerSx={{ mb: 2 }}
            helperText="Display name for your store"
          />

          <DashboardInput
            fullWidth
            label="Store Slug"
            labelPlacement="floating"
            value={storeWebsiteFormData.storeSlug}
            onChange={(e) =>
              setStoreWebsiteFormData({
                ...storeWebsiteFormData,
                storeSlug: e.target.value,
              })
            }
            disabled={storeWebsiteLoading}
            containerSx={{ mb: 2 }}
            helperText="Used in your store URL"
          />

          <DashboardSelect
            fullWidth
            label="Currency"
            value={storeWebsiteFormData.currency}
            onChange={(e) =>
              setStoreWebsiteFormData({
                ...storeWebsiteFormData,
                currency: e.target.value,
              })
            }
            disabled={storeWebsiteLoading}
            native
          >
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="PKR">PKR - Pakistani Rupee</option>
          </DashboardSelect>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setCreateStoreWebsiteDialogOpen(false)}
            disabled={storeWebsiteLoading}
          >
            Cancel
          </Button>
          <DashboardActionButton
            onClick={handleCreateStoreWebsite}
            disabled={
              storeWebsiteLoading ||
              !storeWebsiteFormData.websiteName ||
              !storeWebsiteFormData.websiteSlug ||
              !storeWebsiteFormData.storeName ||
              !storeWebsiteFormData.storeSlug ||
              !storeWebsiteFormData.templateId
            }
            sx={{ px: 3 }}
          >
            {storeWebsiteLoading ? (
              <CircularProgress size={24} sx={{ color: "inherit" }} />
            ) : (
              "Create Store Website"
            )}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>

      {/* Plan Upgrade Dialog */}
      <StorePlanUpgradeDialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        message={planLimitMessage}
        limitType={limitType}
        currentPlan={storePlan}
      />
    </Container>
  );
};

export default Stores;
