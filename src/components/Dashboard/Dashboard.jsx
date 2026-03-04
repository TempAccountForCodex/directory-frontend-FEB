import { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { usePersistentState } from "../../hooks/usePersistentState";
// Direct MUI imports for better tree-shaking (bundle size optimization)
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import CssBaseline from "@mui/material/CssBaseline";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { alpha } from "@mui/material/styles";
// Direct MUI icon imports - using Outlined variants for sidebar
import {
  LayoutDashboard as DashboardOutlinedIcon,
  FileText as ArticleOutlinedIcon,
  Users as PeopleOutlinedIcon,
  Settings as SettingsOutlinedIcon,
  ChartBar as AnalyticsOutlinedIcon,
  TrendingUp as TrendingUpIcon,
  ChartBarBig as AssessmentOutlinedIcon,
  File as DescriptionOutlinedIcon,
  CircleCheck as CheckCircleOutlinedIcon,
  Hourglass as HourglassEmptyOutlinedIcon,
  RefreshCw as RefreshIcon,
  CircleAlert as ErrorOutlineIcon,
  Globe as LanguageOutlinedIcon,
  Store as StorefrontOutlinedIcon,
  List as ListIcon,
  Plus as PlusIcon,
  LayoutTemplate as TemplatesIcon,
  Trash2,
  LayoutList as ListingsIcon,
  Pencil as ModifyIcon,
  Heart as FavouritesIcon,
  Archive as ArchiveIcon,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import ManageInsights from "./ManageInsights";
import Settings from "./Settings";
import UserManagement from "./UserManagement";
import Websites from "./Websites";
import Stores from "./Stores";
import {
  AllListings,
  ModifyListing,
  Favourites,
  ArchivedListings,
} from "./listings";
import SearchPopup from "./SearchPopup";
import WelcomeTour from "./WelcomeTour";
// Layout components for new collapsible sidebar
import { CollapsibleSidebar, DashboardPageHeader } from "./layout";
import ConversionMetrics from "./analytics/ConversionMetrics";
import UserJourneyFunnel from "./analytics/UserJourneyFunnel";
import EngagementTracking from "./analytics/EngagementTracking";
import RealTimePanel from "./analytics/RealTimePanel";
import CoreWebVitals from "./analytics/CoreWebVitals";
import EventTimeline from "./analytics/EventTimeline";
import {
  DashboardActionButton,
  DashboardDateField,
  PageHeader,
} from "./shared";
import {
  getDashboardTheme,
  getDashboardColors,
} from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import dashboardStars from "../../assets/common/star.svg";
import dashboardDarkHole from "../../assets/common/darkhole.svg";
import brandIcon from "../../assets/images/navbar/collapsedLogo.png";
import {
  isAdmin,
  hasRole,
  isContentManager,
  ROLES,
} from "../../constants/roles";

// Collapsible sidebar dimensions
const SIDEBAR_COLLAPSED_WIDTH = 70;
const SIDEBAR_EXPANDED_WIDTH = 300;
const DRAWER_WIDTH = 290;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const Dashboard = ({ user }) => {
  const { actualTheme } = useCustomTheme();
  const { signout } = useAuth();
  const dashboardTheme = getDashboardTheme(actualTheme);
  const isMobile = useMediaQuery(dashboardTheme.breakpoints.down("md"));
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Sidebar collapse state - persisted to localStorage
  const [sidebarCollapsed, setSidebarCollapsed] = usePersistentState(
    "dashboard:sidebarCollapsed",
    false, // Default to expanded
    { scope: "global" },
  );

  // Track if we've already auto-collapsed for this customize session (prevents re-collapse on manual expand)
  const hasAutoCollapsedRef = useRef(false);

  // Computed sidebar width based on collapse state
  // Collapsed sidebar has 16px left margin; expanded has 0 margin
  const currentSidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH
    : SIDEBAR_EXPANDED_WIDTH;
  const totalSidebarWidth = sidebarCollapsed
    ? SIDEBAR_COLLAPSED_WIDTH + 16
    : SIDEBAR_EXPANDED_WIDTH;

  // Parse tab and subtab from pathname manually (works with wildcard route)
  const parsePathname = () => {
    const pathname = location.pathname;
    // Remove trailing slash and split into segments
    const segments = pathname.replace(/\/$/, "").split("/").filter(Boolean);

    // URL patterns:
    // /dashboard -> segments = ['dashboard']
    // /dashboard/websites -> segments = ['dashboard', 'websites']
    // /dashboard/websites/create-website -> segments = ['dashboard', 'websites', 'create-website']
    // /dashboard/insights/pending -> segments = ['dashboard', 'insights', 'pending']

    // Handle nested website routes
    const websiteSubRoutes = [
      "create",
      "create-template",
      "stores",
      "recently-deleted",
    ];
    if (
      segments[1] === "websites" &&
      segments[2] &&
      websiteSubRoutes.includes(segments[2])
    ) {
      // Handle /websites/create/customize as a special nested route
      if (segments[2] === "create" && segments[3] === "customize") {
        return {
          tab: "websites/create/customize",
          subtab: segments[4] || null,
        };
      }
      return {
        tab: `websites/${segments[2]}`,
        subtab: segments[3] || null,
      };
    }

    // Handle nested listings routes
    const listingsSubRoutes = ["modify", "favourites", "archived"];
    if (
      segments[1] === "listings" &&
      segments[2] &&
      listingsSubRoutes.includes(segments[2])
    ) {
      return {
        tab: `listings/${segments[2]}`,
        subtab: segments[3] || null,
      };
    }

    return {
      tab: segments[1] || null, // Second segment is the main tab
      subtab: segments[2] || null, // Third segment is the subtab
    };
  };

  const { tab, subtab } = parsePathname();

  // Memoize default tab to prevent recalculation on every render
  const defaultTab = useMemo(() => {
    if (isAdmin(user.role)) {
      return "overview";
    } else if (hasRole(user.role, ROLES.CONTENT_CREATOR)) {
      return "insights";
    } else if (hasRole(user.role, ROLES.USER)) {
      return "websites";
    } else {
      return "settings";
    }
  }, [user.role]);

  // Keep last visited tab in localStorage as fallback
  const [lastVisitedTab, setLastVisitedTab] = usePersistentState(
    "dashboard:lastVisitedTab:v2",
    defaultTab,
    { scope: "global" },
  );

  // URL is source of truth; fallback to localStorage
  const activeTab = tab || lastVisitedTab;

  // Update last visited tab when URL tab changes
  useEffect(() => {
    if (tab) {
      setLastVisitedTab(tab);
    }
  }, [location.pathname, tab, setLastVisitedTab]);

  // Auto-collapse sidebar for customize step (better view for the editor)
  // Only auto-collapse once when entering the page, allow manual re-expansion
  useEffect(() => {
    if (tab === "websites/create/customize") {
      // Only auto-collapse if we haven't already done so for this session
      if (!hasAutoCollapsedRef.current && !sidebarCollapsed && !isMobile) {
        hasAutoCollapsedRef.current = true;
        setSidebarCollapsed(true);
      }
    } else {
      // Reset when leaving customize page so it auto-collapses again next time
      hasAutoCollapsedRef.current = false;
    }
  }, [tab, isMobile, setSidebarCollapsed, sidebarCollapsed]);

  // Redirect to last visited tab if on bare /dashboard
  useEffect(() => {
    if (!tab && location.pathname === "/dashboard") {
      navigate(`/dashboard/${lastVisitedTab}`, { replace: true });
    }
  }, [location.pathname, tab, lastVisitedTab, navigate]);

  // Redirect users if they try to access tabs they don't have permission for
  useEffect(() => {
    // Define allowed tabs per role
    const rolePermissions = {
      super_admin: [
        "overview",
        "admin-analytics",
        "insights",
        "websites",
        "websites/create",
        "websites/create/customize",
        "websites/create-template",
        "websites/recently-deleted",
        "websites/stores",
        "listings",
        "listings/modify",
        "listings/favourites",
        "listings/archived",
        "users",
        "settings",
      ],
      "super admin": [
        "overview",
        "admin-analytics",
        "insights",
        "websites",
        "websites/create",
        "websites/create/customize",
        "websites/create-template",
        "websites/recently-deleted",
        "websites/stores",
        "listings",
        "listings/modify",
        "listings/favourites",
        "listings/archived",
        "users",
        "settings",
      ],
      admin: [
        "overview",
        "admin-analytics",
        "insights",
        "websites",
        "websites/create",
        "websites/create/customize",
        "websites/create-template",
        "websites/recently-deleted",
        "websites/stores",
        "listings",
        "listings/modify",
        "listings/favourites",
        "listings/archived",
        "users",
        "settings",
      ],
      content_creator: ["insights", "websites/create-template", "settings"],
      user: [
        "overview",
        "websites",
        "websites/create",
        "websites/create/customize",
        "websites/recently-deleted",
        "websites/stores",
        "listings",
        "listings/modify",
        "listings/favourites",
        "listings/archived",
        "settings",
      ],
    };

    const allowedTabs = rolePermissions[user.role] || ["settings"];

    // If current tab not allowed, redirect to first allowed tab
    if (activeTab && !allowedTabs.includes(activeTab)) {
      navigate(`/dashboard/${allowedTabs[0]}`, { replace: true });
    }
  }, [activeTab, user.role, navigate]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [overviewStats, setOverviewStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    totalViews: 0,
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState(null);
  const [advancedAnalyticsLoading, setAdvancedAnalyticsLoading] =
    useState(true);
  const [dashboardReady, setDashboardReady] = useState(false);

  // Use persistent state for selected period (survives page reloads)
  const [selectedPeriod, setSelectedPeriod] = usePersistentState(
    "dashboard:selectedPeriod:v1",
    "30",
    { scope: "global" },
  );

  const [hasNotificationParams, setHasNotificationParams] = useState(false);
  const [customDateDialogOpen, setCustomDateDialogOpen] = useState(false);

  // Use persistent state for custom date range (survives page reloads)
  const [customDateRange, setCustomDateRange] = usePersistentState(
    "dashboard:customDateRange:v1",
    { startDate: "", endDate: "" },
    { scope: "global" },
  );

  const getImageUrl = (imagePath) => {
    if (!imagePath) return "";
    if (imagePath.startsWith("http")) return imagePath;
    return `${API_URL.replace("/api", "")}${imagePath}`;
  };

  // Preload light mode background image and only reveal dashboard
  // once the image is fully loaded, so both appear together.
  useEffect(() => {
    let cancelled = false;
    const reveal = () => {
      // Wait for one full paint cycle after load before revealing
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setDashboardReady(true);
        });
      });
    };

    if (colors.mode === "light" && colors.bgImage) {
      const img = new Image();
      img.onload = reveal;
      img.onerror = reveal; // Reveal even if image fails
      img.src = colors.bgImage;
    } else {
      // Dark mode: no heavy image to preload, reveal after paint
      reveal();
    }

    return () => {
      cancelled = true;
    };
  }, []);

  // Handle location state for search results
  useEffect(() => {
    if (location.state?.activeTab) {
      navigate(`/dashboard/${location.state.activeTab}`, { replace: true });
    }
  }, [location.state, navigate]);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle URL parameters for navigation from notifications
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const legacyTab = searchParams.get("tab");
    const legacySubtab = searchParams.get("subtab");
    const highlight = searchParams.get("highlight");

    // Handle legacy notification format: /dashboard?tab=insights&subtab=pending
    if (legacyTab && !tab) {
      let newPath = `/dashboard/${legacyTab}`;

      // Add subtab to path if present
      if (legacySubtab) {
        newPath += `/${legacySubtab}`;
      }

      // Preserve query params (like highlight)
      const newParams = new URLSearchParams();
      if (highlight) {
        newParams.set("highlight", highlight);
      }

      const queryString = newParams.toString();
      navigate(`${newPath}${queryString ? `?${queryString}` : ""}`, {
        replace: true,
      });
      return;
    }

    setHasNotificationParams(!!location.search && !!highlight);
  }, [location.search, location.pathname, tab, navigate]);

  const clearNotificationParams = () => {
    if (location.pathname === "/dashboard" && location.search) {
      navigate("/dashboard", { replace: true });
      setHasNotificationParams(false);
    }
  };

  // Note: Active tab, selected period, and custom date range are automatically
  // persisted by usePersistentState hook - no manual localStorage calls needed!

  useEffect(() => {
    if (activeTab === "overview") {
      // Only fetch if we have valid data
      if (
        selectedPeriod === "custom" &&
        (!customDateRange.startDate || !customDateRange.endDate)
      ) {
        return; // Don't fetch until custom dates are set
      }

      setAdvancedAnalyticsLoading(true);
      // Run API calls in parallel to eliminate waterfall
      Promise.all([fetchOverviewStats(), fetchAnalytics()]);

      // Set a timeout to hide loader after components have had time to load
      const timer = setTimeout(() => {
        setAdvancedAnalyticsLoading(false);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [activeTab, selectedPeriod]);

  const fetchOverviewStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/blogs/stats`);

      setOverviewStats({
        total: response.data.total || 0,
        approved: response.data.approved || 0,
        pending: response.data.pending || 0,
        totalViews: response.data.totalViews || 0,
      });
    } catch (error) {
      console.error("Error fetching overview stats:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      setAnalyticsError(null);

      // Build query params
      let queryParams = `period=${selectedPeriod}`;
      if (
        selectedPeriod === "custom" &&
        customDateRange.startDate &&
        customDateRange.endDate
      ) {
        queryParams += `&startDate=${customDateRange.startDate}&endDate=${customDateRange.endDate}`;
      }

      const response = await axios.get(
        `${API_URL}/analytics/overview?${queryParams}`,
      );

      if (response.data.success) {
        setAnalyticsData(response.data.data);
        console.log(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setAnalyticsError(
        error.response?.data?.message ||
          "Failed to load analytics data. Please try again.",
      );
      setAnalyticsData(null);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleTabChange = (newTab) => {
    // Navigate to new tab - only preserve specific params that should persist across tabs
    // Don't carry over page-specific params like 'template'
    const currentParams = new URLSearchParams(location.search);
    const newParams = new URLSearchParams();

    // Only preserve 'highlight' param (for notification navigation)
    const highlight = currentParams.get("highlight");
    if (highlight) {
      newParams.set("highlight", highlight);
    }

    const queryString = newParams.toString();
    navigate(`/dashboard/${newTab}${queryString ? `?${queryString}` : ""}`);

    if (hasNotificationParams && location.pathname === "/dashboard") {
      clearNotificationParams();
    }
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signout();
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate even if signout fails
      navigate("/auth");
    }
  };

  const handlePeriodChange = (event, newPeriod) => {
    if (newPeriod !== null) {
      if (newPeriod === "custom") {
        setCustomDateDialogOpen(true);
      } else {
        setSelectedPeriod(newPeriod);
      }
    }
  };

  const handleCustomDateApply = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setSelectedPeriod("custom");
      setCustomDateDialogOpen(false);
      // Manually trigger fetch after dialog closes
      setTimeout(() => {
        setAdvancedAnalyticsLoading(true);
        // Run API calls in parallel to eliminate waterfall
        Promise.all([fetchOverviewStats(), fetchAnalytics()]);
        setTimeout(() => {
          setAdvancedAnalyticsLoading(false);
        }, 2000);
      }, 100);
    }
  };

  const handleCustomDateCancel = () => {
    setCustomDateDialogOpen(false);
  };

  const getPeriodLabel = (period) => {
    const labels = {
      7: "Last 7 Days",
      30: "Last 30 Days",
      90: "Last 90 Days",
      180: "Last 6 Months",
      custom:
        customDateRange.startDate && customDateRange.endDate
          ? `${new Date(customDateRange.startDate).toLocaleDateString()} - ${new Date(customDateRange.endDate).toLocaleDateString()}`
          : "Custom Range",
    };
    return labels[period] || "Last 30 Days";
  };

  const userIsAdmin = isAdmin(user.role);
  const userIsContentManager = isContentManager(user.role);
  const userIsNotContentCreator = !hasRole(user.role, ROLES.CONTENT_CREATOR);

  const menuItems = [
    // Overview section - visible to all website creators
    {
      type: "header",
      label: "Dashboard",
      visible: userIsAdmin || hasRole(user.role, ROLES.USER),
    },
    {
      id: "overview",
      label: "Overview",
      icon: <DashboardOutlinedIcon size={20} />,
      badge: null,
      visible: userIsAdmin || hasRole(user.role, ROLES.USER),
    },
    {
      id: "admin-analytics",
      label: "Admin Analytics",
      icon: <AnalyticsOutlinedIcon size={20} />,
      badge: null,
      visible: userIsAdmin,
    },
    {
      id: "insights",
      label: "Manage Insights",
      icon: <ArticleOutlinedIcon size={20} />,
      badge: null,
      visible: userIsContentManager,
    },
    // Products section
    {
      type: "header",
      label: "Products",
      visible: userIsAdmin || hasRole(user.role, ROLES.USER),
    },
    {
      id: "websites-dropdown",
      type: "dropdown",
      label: "Websites",
      icon: <LanguageOutlinedIcon size={20} />,
      visible: userIsAdmin || hasRole(user.role, ROLES.USER),
      children: [
        // Create Template - only visible to admins and content creators
        ...(userIsContentManager
          ? [
              {
                id: "websites/create-template",
                label: "Create Template",
                icon: <TemplatesIcon size={18} />,
              },
            ]
          : []),
        {
          id: "websites/create",
          label: "Create Website",
          icon: <PlusIcon size={18} />,
        },
        {
          id: "websites",
          label: "All Websites",
          icon: <ListIcon size={18} />,
        },
        {
          id: "websites/stores",
          label: "Stores",
          icon: <StorefrontOutlinedIcon size={18} />,
        },
        {
          id: "websites/recently-deleted",
          label: "Recently Deleted",
          icon: <Trash2 size={18} />,
        },
      ],
    },
    {
      id: "listings-dropdown",
      type: "dropdown",
      label: "Listings",
      icon: <ListingsIcon size={20} />,
      visible: userIsAdmin || hasRole(user.role, ROLES.USER),
      children: [
        {
          id: "listings",
          label: "All Listings",
          icon: <ListIcon size={18} />,
        },
        {
          id: "listings/modify",
          label: "Modify Listing",
          icon: <ModifyIcon size={18} />,
        },
        {
          id: "listings/favourites",
          label: "Favourites",
          icon: <FavouritesIcon size={18} />,
        },
        {
          id: "listings/archived",
          label: "Archived Listing",
          icon: <ArchiveIcon size={18} />,
        },
      ],
    },
    // Management section
    {
      type: "header",
      label: "Management",
      visible: userIsAdmin,
    },
    {
      id: "users",
      label: "User Management",
      icon: <PeopleOutlinedIcon size={20} />,
      badge: null,
      visible: userIsAdmin,
    },
    // NOTE: Settings moved to bottomMenuItems for sidebar bottom section
  ];

  // Bottom menu items - rendered in sidebar bottom section
  const bottomMenuItems = [
    {
      id: "settings",
      label: "Settings",
      icon: <SettingsOutlinedIcon size={20} />,
      visible: true,
    },
  ];

  // Page title/subtitle configuration for dashboard pages
  const pageConfig = {
    overview: {
      title: `Welcome back, ${user.name}!`,
      subtitle: "Your dashboard overview and quick actions",
    },
    "admin-analytics": {
      title: "Admin Analytics",
      subtitle: "Platform-wide analytics and insights performance",
    },
    insights: {
      title: "Manage Insights",
      subtitle: "Create, edit, and manage all insights for your platform",
    },
    websites: {
      title: "All Websites",
      subtitle: "View and manage all your websites",
    },
    "websites/create": {
      title: "Create Website",
      subtitle: "Choose a template to get started",
    },
    "websites/create/customize": {
      title: "Customize Website",
      subtitle: "Configure your website settings and pages",
    },
    "websites/create-template": {
      title: "Create Template",
      subtitle: "Design and create new website templates",
    },
    "websites/recently-deleted": {
      title: "Recently Deleted",
      subtitle: "Websites are permanently deleted after 30 days",
    },
    "websites/stores": {
      title: "Stores",
      subtitle: "Manage your e-commerce websites and sell products online",
    },
    users: {
      title: "User Management",
      subtitle: "Manage user accounts, roles, and permissions",
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your account, security, and preferences",
    },
    listings: {
      title: "All Listings",
      subtitle: "View and manage all your business directory listings",
    },
    "listings/modify": {
      title: "Modify Listing",
      subtitle: "Edit and update your listing details",
    },
    "listings/favourites": {
      title: "Favourites",
      subtitle: "Your saved and favourite listings",
    },
    "listings/archived": {
      title: "Archived Listing",
      subtitle: "View and restore your archived listings",
    },
  };

  const currentPage = pageConfig[activeTab] || pageConfig.overview;

  // New collapsible sidebar content using layout components
  const sidebarContent = (
    <CollapsibleSidebar
      isCollapsed={sidebarCollapsed}
      onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      menuItems={menuItems}
      bottomMenuItems={bottomMenuItems}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      user={user}
      onLogout={handleLogout}
      isMobile={isMobile}
      onMobileClose={() => setMobileOpen(false)}
      colors={colors}
    />
  );

  const renderContent = () => {
    const searchParams = new URLSearchParams(location.search);
    const highlightId = searchParams.get("highlight");

    switch (activeTab) {
      case "insights":
        return (
          <ManageInsights
            user={user}
            highlightId={highlightId}
            subtab={subtab}
            onSubTabChange={clearNotificationParams}
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      case "overview":
        return (
          <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
            <PageHeader
              title={currentPage.title}
              subtitle={currentPage.subtitle}
            />
            <Box
              sx={{
                background: `linear-gradient(135deg, ${alpha(
                  colors.primary,
                  0.08,
                )} 0%, ${alpha(colors.primaryDark, 0.05)} 100%)`,
                backdropFilter: "blur(20px)",
                borderRadius: 4,
                p: 4,
                border: `1px solid ${colors.border}`,
                boxShadow: `0 2px 8px ${alpha(colors.darker, 0.2)}`,
                mb: 3,
              }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}
              >
                <Box
                  sx={{
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                    p: 2,
                    borderRadius: 3,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 2px 8px ${alpha(colors.primary, 0.25)}`,
                  }}
                >
                  <TrendingUpIcon size={32} color="#F5F5F5" />
                </Box>
                <Box>
                  <Typography
                    variant="h5"
                    sx={{
                      color: colors.text,
                      fontWeight: 700,
                      letterSpacing: "-0.3px",
                    }}
                  >
                    Quick Actions
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textSecondary, mt: 0.5 }}
                  >
                    Get started with these common tasks
                  </Typography>
                </Box>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    onClick={() => navigate("/dashboard/websites/create")}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${colors.border}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: colors.primary,
                        background: alpha(colors.primary, 0.05),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <LanguageOutlinedIcon
                      size={24}
                      style={{ color: colors.primary, marginBottom: 8 }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      Create Website
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.textSecondary }}
                    >
                      Build a new website
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    onClick={() => navigate("/dashboard/websites")}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${colors.border}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: colors.primary,
                        background: alpha(colors.primary, 0.05),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <DescriptionOutlinedIcon
                      size={24}
                      style={{ color: colors.primary, marginBottom: 8 }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      My Websites
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.textSecondary }}
                    >
                      Manage your sites
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    onClick={() => navigate("/dashboard/websites/stores")}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${colors.border}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: colors.primary,
                        background: alpha(colors.primary, 0.05),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <StorefrontOutlinedIcon
                      size={24}
                      style={{ color: colors.primary, marginBottom: 8 }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      My Stores
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.textSecondary }}
                    >
                      E-commerce management
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Box
                    onClick={() => navigate("/dashboard/settings")}
                    sx={{
                      p: 2.5,
                      borderRadius: 2,
                      border: `1px solid ${colors.border}`,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      "&:hover": {
                        borderColor: colors.primary,
                        background: alpha(colors.primary, 0.05),
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <SettingsOutlinedIcon
                      size={24}
                      style={{ color: colors.primary, marginBottom: 8 }}
                    />
                    <Typography
                      variant="subtitle2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      Settings
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: colors.textSecondary }}
                    >
                      Account preferences
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Container>
        );
      case "admin-analytics":
        return (
          <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
            <PageHeader
              title={currentPage.title}
              subtitle={currentPage.subtitle}
            />

            {/* Google Analytics Section */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: colors.text,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <AnalyticsOutlinedIcon size={20} color={colors.primary} />
                Google Analytics Overview ({getPeriodLabel(selectedPeriod)})
              </Typography>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <IconButton
                  onClick={fetchAnalytics}
                  disabled={analyticsLoading}
                  sx={{
                    color: colors.primary,
                    "&:hover": { background: `${colors.primary}15` },
                    "&:disabled": { color: colors.textSecondary },
                  }}
                  title="Refresh analytics"
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      "@keyframes spin": {
                        "0%": { transform: "rotate(0deg)" },
                        "100%": { transform: "rotate(360deg)" },
                      },
                      "& svg": {
                        animation: analyticsLoading
                          ? "spin 1s linear infinite"
                          : "none",
                      },
                    }}
                  >
                    <RefreshIcon size={20} />
                  </Box>
                </IconButton>

                <ToggleButtonGroup
                  value={selectedPeriod}
                  exclusive
                  onChange={handlePeriodChange}
                  aria-label="time period"
                  size="small"
                  sx={{
                    background: colors.darker,
                    borderRadius: "12px",
                    "& .MuiToggleButton-root": {
                      color: colors.textSecondary,
                      border: "none",
                      px: 2,
                      py: 0.75,
                      fontSize: "0.813rem",
                      fontWeight: 600,
                      textTransform: "none",
                      "&:hover": {
                        background: alpha(colors.primary, 0.15),
                        color: colors.primary,
                      },
                      "&.Mui-selected": {
                        background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                        color: "#F5F5F5",
                        "&:hover": {
                          background: `linear-gradient(135deg, ${colors.primaryLight} 0%, ${colors.primary} 100%)`,
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value="7" aria-label="7 days">
                    7D
                  </ToggleButton>
                  <ToggleButton value="30" aria-label="30 days">
                    30D
                  </ToggleButton>
                  <ToggleButton value="90" aria-label="90 days">
                    90D
                  </ToggleButton>
                  <ToggleButton value="180" aria-label="6 months">
                    6M
                  </ToggleButton>
                  <ToggleButton value="custom" aria-label="custom range">
                    Custom
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            {/* Loading State */}
            {analyticsLoading && !analyticsData && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "400px",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <CircularProgress size={60} sx={{ color: "#378C92" }} />
                <Typography sx={{ color: "#616161", fontFamily: "Questrial" }}>
                  Loading analytics...
                </Typography>
              </Box>
            )}

            {/* Error State */}
            {analyticsError && !analyticsData && (
              <Card
                sx={{
                  borderRadius: "16px",
                  border: `1px solid ${colors.error}`,
                  p: 4,
                  textAlign: "center",
                  background: `${colors.error}10`,
                }}
              >
                <Box sx={{ mb: 2, color: colors.error }}>
                  <ErrorOutlineIcon size={48} />
                </Box>
                <Typography
                  variant="h6"
                  sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
                >
                  Failed to Load Analytics
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary, mb: 3 }}
                >
                  {analyticsError}
                </Typography>
                <Box
                  component="button"
                  onClick={fetchAnalytics}
                  disabled={analyticsLoading}
                  sx={{
                    px: 3,
                    py: 1.5,
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: `0 4px 12px ${colors.primary}40`,
                    },
                    "&:disabled": {
                      opacity: 0.6,
                      cursor: "not-allowed",
                      transform: "none",
                    },
                  }}
                >
                  <RefreshIcon size={16} />
                  {analyticsLoading ? "Reloading..." : "Reload Analytics"}
                </Box>
              </Card>
            )}

            {/* Analytics Data */}
            {analyticsData && !analyticsError && (
              <>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        p: 2.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: colors.textSecondary, mb: 1 }}
                      >
                        Page Views
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}
                      >
                        {(
                          analyticsData?.overview?.pageViews?.total ?? 0
                        ).toLocaleString()}
                      </Typography>
                      <Chip
                        label={`${
                          (analyticsData?.overview?.pageViews?.change ?? 0) > 0
                            ? "+"
                            : ""
                        }${analyticsData?.overview?.pageViews?.change ?? 0}%`}
                        size="small"
                        sx={{
                          background:
                            (analyticsData?.overview?.pageViews?.change ?? 0) >
                            0
                              ? colors.success
                              : colors.error,
                          color: "#F5F5F5",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        p: 2.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: colors.textSecondary, mb: 1 }}
                      >
                        Sessions
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}
                      >
                        {(
                          analyticsData?.overview?.sessions?.total ?? 0
                        ).toLocaleString()}
                      </Typography>
                      <Chip
                        label={`${
                          (analyticsData?.overview?.sessions?.change ?? 0) > 0
                            ? "+"
                            : ""
                        }${analyticsData?.overview?.sessions?.change ?? 0}%`}
                        size="small"
                        sx={{
                          background:
                            (analyticsData?.overview?.sessions?.change ?? 0) > 0
                              ? colors.success
                              : colors.error,
                          color: "#F5F5F5",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        p: 2.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: colors.textSecondary, mb: 1 }}
                      >
                        Users
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}
                      >
                        {(
                          analyticsData?.overview?.users?.total ?? 0
                        ).toLocaleString()}
                      </Typography>
                      <Chip
                        label={`${
                          (analyticsData?.overview?.users?.change ?? 0) > 0
                            ? "+"
                            : ""
                        }${analyticsData?.overview?.users?.change ?? 0}%`}
                        size="small"
                        sx={{
                          background:
                            (analyticsData?.overview?.users?.change ?? 0) > 0
                              ? colors.success
                              : colors.error,
                          color: "#F5F5F5",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        p: 2.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: colors.textSecondary, mb: 1 }}
                      >
                        Bounce Rate
                      </Typography>
                      <Typography
                        variant="h4"
                        sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}
                      >
                        {analyticsData?.overview?.bounceRate?.average ?? 0}%
                      </Typography>
                      <Chip
                        label={`${
                          (analyticsData?.overview?.bounceRate?.change ?? 0) > 0
                            ? "+"
                            : ""
                        }${analyticsData?.overview?.bounceRate?.change ?? 0}%`}
                        size="small"
                        sx={{
                          background:
                            (analyticsData?.overview?.bounceRate?.change ?? 0) <
                            0
                              ? colors.success
                              : colors.error,
                          color: "#F5F5F5",
                          fontWeight: 600,
                          fontSize: "0.7rem",
                        }}
                      />
                    </Card>
                  </Grid>
                </Grid>

                {/* Top Pages and Referrers */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
                      >
                        Top Pages
                      </Typography>
                      {(analyticsData?.topPages ?? []).length > 0 ? (
                        analyticsData.topPages.map((page, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 1.5,
                              borderBottom:
                                index < analyticsData.topPages.length - 1
                                  ? `0.5px solid ${colors.border}`
                                  : "none",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text }}
                            >
                              {page?.page ?? "N/A"}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: colors.primary, fontWeight: 600 }}
                            >
                              {(page?.views ?? 0).toLocaleString()} views
                            </Typography>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            textAlign: "center",
                            py: 2,
                          }}
                        >
                          No data available
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
                      >
                        Top Referrers
                      </Typography>
                      {(analyticsData?.topReferrers ?? []).length > 0 ? (
                        analyticsData.topReferrers.map((referrer, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 1.5,
                              borderBottom:
                                index < analyticsData.topReferrers.length - 1
                                  ? `0.5px solid ${colors.border}`
                                  : "none",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text }}
                            >
                              {referrer?.source ?? "N/A"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: colors.primary, fontWeight: 600 }}
                              >
                                {(referrer?.sessions ?? 0).toLocaleString()}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: colors.textSecondary }}
                              >
                                ({referrer?.percentage ?? 0}%)
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            textAlign: "center",
                            py: 2,
                          }}
                        >
                          No data available
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                </Grid>

                {/* Devices and Locations */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
                      >
                        Devices
                      </Typography>
                      {(analyticsData?.devices ?? []).length > 0 ? (
                        analyticsData.devices.map((device, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: colors.text }}
                              >
                                {device?.device ?? "Unknown"}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: colors.primary, fontWeight: 600 }}
                              >
                                {device?.percentage ?? 0}%
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                width: "100%",
                                height: "8px",
                                background: colors.cardBgLight,
                                borderRadius: "4px",
                                overflow: "hidden",
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${device?.percentage ?? 0}%`,
                                  height: "100%",
                                  background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
                                  transition: "width 0.5s ease",
                                }}
                              />
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            textAlign: "center",
                            py: 2,
                          }}
                        >
                          No data available
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card
                      sx={{
                        borderRadius: "16px",
                        border: `1px solid ${colors.border}`,
                        p: 3,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
                      >
                        Top Locations
                      </Typography>
                      {(analyticsData?.locations ?? []).length > 0 ? (
                        analyticsData.locations.map((location, index) => (
                          <Box
                            key={index}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              py: 1.5,
                              borderBottom:
                                index < analyticsData.locations.length - 1
                                  ? `0.5px solid ${colors.border}`
                                  : "none",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{ color: colors.text }}
                            >
                              {location?.country ?? "Unknown"}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ color: colors.primary, fontWeight: 600 }}
                              >
                                {(location?.sessions ?? 0).toLocaleString()}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{ color: colors.textSecondary }}
                              >
                                ({location?.percentage ?? 0}%)
                              </Typography>
                            </Box>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.textSecondary,
                            textAlign: "center",
                            py: 2,
                          }}
                        >
                          No data available
                        </Typography>
                      )}
                    </Card>
                  </Grid>
                </Grid>
                {/* Enterprise Analytics Components */}
                <Typography
                  variant="h6"
                  sx={{
                    color: colors.text,
                    fontWeight: 700,
                    mt: 3,
                    mb: 2,
                  }}
                >
                  Advanced Analytics & Insights
                </Typography>

                {/* Advanced Analytics Loading State */}
                {advancedAnalyticsLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "400px",
                      borderRadius: "16px",
                      border: `1px solid ${colors.border}`,
                    }}
                  >
                    <Box sx={{ textAlign: "center" }}>
                      <CircularProgress
                        size={50}
                        sx={{
                          color: colors.primary,
                          mb: 2,
                        }}
                      />
                      <Typography
                        sx={{
                          color: colors.textSecondary,
                          fontSize: "0.9rem",
                        }}
                      >
                        Loading Advanced Analytics...
                      </Typography>
                    </Box>
                  </Box>
                ) : (
                  <>
                    {/* Conversion Metrics */}
                    <Box sx={{ mb: 2 }}>
                      <ConversionMetrics
                        period={selectedPeriod}
                        customDateRange={customDateRange}
                      />
                    </Box>

                    {/* User Journey and Real-Time */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <UserJourneyFunnel
                          period={selectedPeriod}
                          customDateRange={customDateRange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <RealTimePanel />
                      </Grid>
                    </Grid>

                    {/* Engagement and Core Web Vitals */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <EngagementTracking
                          period={selectedPeriod}
                          customDateRange={customDateRange}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <CoreWebVitals
                          period={selectedPeriod}
                          customDateRange={customDateRange}
                        />
                      </Grid>
                    </Grid>

                    {/* Event Timeline */}
                    <Box sx={{ mb: 2 }}>
                      <EventTimeline
                        limit={15}
                        period={selectedPeriod}
                        customDateRange={customDateRange}
                      />
                    </Box>
                  </>
                )}
              </>
            )}
          </Container>
        );
      case "websites":
        return (
          <Websites
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      case "websites/create":
        return (
          <Websites
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
            initialView="create"
          />
        );
      case "websites/create/customize":
        return (
          <Websites
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
            initialView="customize"
          />
        );
      case "websites/create-template":
        return (
          <Websites
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
            initialView="create-template"
          />
        );
      case "websites/recently-deleted":
        return (
          <Websites
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
            initialView="deleted"
          />
        );
      case "websites/stores":
        return (
          <Stores
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      case "listings":
        return (
          <AllListings
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      case "listings/modify":
        return (
          <ModifyListing
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      case "listings/favourites":
        return (
          <Favourites
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      case "listings/archived":
        return (
          <ArchivedListings
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      case "users":
        return (
          <UserManagement
            user={user}
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      case "settings":
        return (
          <Settings
            subtab={subtab}
            pageTitle={currentPage.title}
            pageSubtitle={currentPage.subtitle}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={dashboardTheme}>
      <CssBaseline />

      {/* Loading overlay - dark with stars, visible until dashboard is ready */}
      <Box
        sx={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          backgroundColor: "#090A0B",
          backgroundImage: `url(${dashboardStars})`,
          backgroundSize: "1440px 819px",
          backgroundPosition: "top center",
          backgroundRepeat: "repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: dashboardReady ? 0 : 1,
          pointerEvents: dashboardReady ? "none" : "auto",
          transition: "opacity 0.5s ease-out",
        }}
      >
        {/* Dark hole accent */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url(${dashboardDarkHole})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "contain",
            backgroundPosition: "center",
            opacity: 0.6,
            pointerEvents: "none",
          }}
        />

        {/* Ambient glow behind logo */}
        <Box
          aria-hidden="true"
          sx={{
            position: "absolute",
            width: 200,
            height: 200,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(55, 140, 146, 0.15) 0%, transparent 70%)",
            animation: "ambientPulse 3s ease-in-out infinite",
            "@keyframes ambientPulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 0.6 },
              "50%": { transform: "scale(1.3)", opacity: 1 },
            },
          }}
        />

        {/* Loading content */}
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          {/* Brand icon */}
          <Box
            component="img"
            src={brandIcon}
            alt=""
            sx={{
              width: 80,
              height: 80,
              borderRadius: "18px",
              animation: "logoBreath 2.5s ease-in-out infinite",
              "@keyframes logoBreath": {
                "0%, 100%": { opacity: 0.8, transform: "scale(1)" },
                "50%": { opacity: 1, transform: "scale(1.08)" },
              },
            }}
          />

          {/* Shimmer progress bar */}
          <Box
            sx={{
              width: 120,
              height: 3,
              borderRadius: 2,
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                height: "100%",
                width: "40%",
                borderRadius: 2,
                background:
                  "linear-gradient(90deg, transparent, #378C92, transparent)",
                animation: "shimmer 1.5s ease-in-out infinite",
                "@keyframes shimmer": {
                  "0%": { transform: "translateX(-100%)" },
                  "100%": { transform: "translateX(350%)" },
                },
              }}
            />
          </Box>

          <Typography
            sx={{
              color: "rgba(255, 255, 255, 0.5)",
              fontSize: "0.75rem",
              fontFamily: "Inter, sans-serif",
              fontWeight: 400,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            Loading
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          minHeight: "100vh",
          height: "100vh",
          fontFamily: dashboardTheme.typography.fontFamily,
          fontWeight: dashboardTheme.typography.fontWeightRegular,
          // Force dark bg until ready so nothing leaks behind the loading overlay
          backgroundColor: !dashboardReady
            ? "#090A0B"
            : colors.mode === "light"
              ? "transparent"
              : colors.bgBase || "#041e18",
          backgroundSize: "1440px 819px",
          backgroundPosition: "top center",
          backgroundRepeat: "repeat",
          overflow: "hidden",
          position: "relative",
          // Hide dashboard content until ready — prevents any flash
          visibility: dashboardReady ? "visible" : "hidden",
          // Light mode: blurred background image (only shown after dashboard is ready)
          ...(colors.mode === "light" &&
            dashboardReady && {
              "&::before": {
                content: '""',
                position: "fixed",
                inset: 0,
                zIndex: 0,
                backgroundImage: `url(${colors.bgImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                filter: "blur(18px)",
                transform: "scale(1.05)",
              },
              "&::after": {
                content: '""',
                position: "fixed",
                inset: 0,
                zIndex: 0,
                background: "rgba(255, 255, 255, 0.15)",
                pointerEvents: "none",
              },
            }),
        }}
      >
        {colors.bgImageAccent ? (
          <Box
            aria-hidden="true"
            sx={{
              position: "absolute",
              height: "auto",
              zIndex: 0,
              top: { xs: "12%", sm: "-4%" },
              left: { xs: "-70%", sm: "-15%" },
              width: { xs: "280%", sm: "130%" },
              pointerEvents: "none",
            }}
          />
        ) : null}
        {/* Sidebar Drawer - Collapsible */}
        <Box
          component="nav"
          sx={{
            width: { md: totalSidebarWidth }, // +16 for left margin
            flexShrink: { md: 0 },
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Mobile Drawer - Always expanded */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: DRAWER_WIDTH, // Always expanded on mobile
                backgroundColor: "transparent",
                border: "none",
              },
            }}
          >
            {sidebarContent}
          </Drawer>

          {/* Desktop Drawer - Collapsible with dynamic width */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: totalSidebarWidth, // +16 for left margin
                backgroundColor: "transparent",
                border: "none",
                overflow: "visible", // Allow rounded corners to show
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            }}
            open
          >
            {sidebarContent}
          </Drawer>
        </Box>

        {/* Main Content - Dynamic offset for collapsible sidebar */}
        <Box
          sx={{
            flexGrow: 1,
            width: {
              xs: "100%",
              md: `calc(100% - ${totalSidebarWidth}px)`, // Dynamic width based on sidebar state
            },
            minHeight: "100vh",
            maxHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            zIndex: 1,
            // Use specific transition property instead of 'all' for better performance
            // 'all' causes expensive reflows on pages with sticky elements (templates/customize)
            transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            willChange: "width", // Hint to browser for GPU optimization
          }}
        >
          <DashboardPageHeader
            user={user}
            onMenuToggle={handleDrawerToggle}
            onSearchOpen={() => setSearchOpen(true)}
            onLogout={handleLogout}
            showMenuButton={isMobile}
            colors={colors}
          />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              overflowX: "hidden",
              py: { xs: 2, md: 3 },
              pl: { xs: 2, sm: 3 },
              pr: { xs: 2, sm: 3, md: 3.7 },
              minHeight: 0,
            }}
          >
            {renderContent()}
          </Box>
        </Box>

        {/* Global Search Popup */}
        <SearchPopup open={searchOpen} onClose={() => setSearchOpen(false)} />

        {/* Welcome Tour */}
        <WelcomeTour />

        {/* Custom Date Range Dialog */}
        <Dialog
          open={customDateDialogOpen}
          onClose={handleCustomDateCancel}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              border: `1px solid ${colors.border}`,
              borderRadius: "16px",
            },
          }}
        >
          <DialogTitle sx={{ color: colors.text, fontWeight: 700 }}>
            Select Custom Date Range
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}
            >
              <DashboardDateField
                label="Start Date"
                value={customDateRange.startDate}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
              />
              <DashboardDateField
                label="End Date"
                value={customDateRange.endDate}
                onChange={(e) =>
                  setCustomDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                inputProps={{
                  min: customDateRange.startDate,
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button
              onClick={handleCustomDateCancel}
              sx={{
                color: colors.textSecondary,
                "&:hover": {
                  background: alpha(colors.textSecondary, 0.1),
                },
              }}
            >
              Cancel
            </Button>
            <DashboardActionButton
              onClick={handleCustomDateApply}
              disabled={!customDateRange.startDate || !customDateRange.endDate}
              sx={{ px: 3 }}
            >
              Apply
            </DashboardActionButton>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;
