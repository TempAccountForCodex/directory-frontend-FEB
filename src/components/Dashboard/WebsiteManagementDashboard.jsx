import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';
import {
  Box,
  Alert,
  Breadcrumbs,
  Skeleton,
  Typography,
  Container,
} from '@mui/material';
import {
  ArrowLeft,
  BarChart2,
  FileText,
  Globe,
  Home,
  Link,
  Palette,
  Search,
  Settings,
  Star,
  Users,
  Wrench,
  LayoutGrid,
  MessageSquare,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import { usePermissionContext } from '../../context/PermissionContext';
import {
  MiniSideNav,
  PageHeader,
} from './shared';
import DashboardActionButton from './shared/DashboardActionButton';
import OverviewTab from './website-manage/OverviewTab';
import AnalyticsTab from './website-manage/AnalyticsTab';
import FormsTab from './website-manage/FormsTab';
import IntegrationsTab from './website-manage/IntegrationsTab';
import ListingEditTab from './ListingEditTab';
import ReviewsTab from './website-manage/ReviewsTab';
import PagesTab from './website-manage/PagesTab';
import DesignTab from './website-manage/DesignTab';
import SeoTab from './website-manage/SeoTab';
import DomainTab from './website-manage/DomainTab';
import TeamTab from './website-manage/TeamTab';
import SettingsTab from './website-manage/SettingsTab';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ── Nav sections defined outside component for stable reference ──────────────
const WEBSITE_MANAGEMENT_NAV_SECTIONS = [
  {
    title: 'Content',
    items: [
      { id: 'overview', label: 'Overview', icon: Home },
      { id: 'pages', label: 'Pages', icon: FileText },
    ],
  },
  {
    title: 'Design',
    items: [
      { id: 'design', label: 'Design', icon: Palette },
    ],
  },
  {
    title: 'Growth',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart2 },
      { id: 'seo', label: 'SEO', icon: Search },
      { id: 'forms', label: 'Forms', icon: MessageSquare },
      { id: 'reviews', label: 'Reviews', icon: Star },
    ],
  },
  {
    title: 'Connections',
    items: [
      { id: 'listing', label: 'Directory Listing', icon: LayoutGrid },
      { id: 'domain', label: 'Domain', icon: Globe },
      { id: 'integrations', label: 'Integrations', icon: Link },
    ],
  },
  {
    title: 'Manage',
    items: [
      { id: 'team', label: 'Team', icon: Users },
      { id: 'settings', label: 'Settings', icon: Settings },
    ],
  },
];

const VALID_SECTIONS = WEBSITE_MANAGEMENT_NAV_SECTIONS.flatMap((s) => s.items.map((i) => i.id));

const WebsiteManagementDashboard = ({ websiteId, section, userPlan = 'free' }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();
  const { setCurrentWebsite } = usePermissionContext();

  // Set active website in PermissionContext for permission hooks (Step 7.2)
  useEffect(() => {
    if (websiteId) {
      setCurrentWebsite(Number(websiteId));
    }
    return () => setCurrentWebsite(null);
  }, [websiteId, setCurrentWebsite]);

  // Normalize section param — default to 'overview', redirect unknown
  const normalizedSection = section && VALID_SECTIONS.includes(section) ? section : 'overview';
  const [activeSection, setActiveSection] = useState(normalizedSection);

  const [website, setWebsite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sync section prop changes (deep link support)
  useEffect(() => {
    const next = section && VALID_SECTIONS.includes(section) ? section : 'overview';
    setActiveSection(next);
  }, [section]);

  const fetchWebsite = useCallback(async () => {
    if (!websiteId) return;
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_URL}/websites/${websiteId}`);
      // Backend returns { success, data: { id, name, status, role, ... } }
      // Normalize at the boundary: unwrap envelope + uppercase status for frontend consistency
      const raw = res.data.data || res.data.website || res.data;
      const normalized = {
        ...raw,
        status: (raw.status || 'draft').toUpperCase(),
        role: (raw.role || 'VIEWER').toUpperCase(),
      };
      setWebsite(normalized);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load website details.');
    } finally {
      setLoading(false);
    }
  }, [websiteId]);

  useEffect(() => {
    fetchWebsite();
  }, [fetchWebsite]);

  const activeSectionLabel = useMemo(() => {
    for (const section of WEBSITE_MANAGEMENT_NAV_SECTIONS) {
      const match = section.items.find((item) => item.id === activeSection);
      if (match) return match.label;
    }
    return 'Overview';
  }, [activeSection]);

  const handleSectionChange = useCallback(
    (id) => {
      setActiveSection(id);
      navigate(`/dashboard/websites/${websiteId}/manage/${id}`, { replace: false });
    },
    [navigate, websiteId]
  );

  const handleNavigateToSection = useCallback(
    (id) => {
      handleSectionChange(id);
    },
    [handleSectionChange]
  );

  const handleWebsiteSaved = useCallback((updatedWebsite) => {
    if (updatedWebsite) {
      // Normalize status/role casing from any tab callback
      const patched = { ...updatedWebsite };
      if (patched.status) patched.status = patched.status.toUpperCase();
      if (patched.role) patched.role = patched.role.toUpperCase();
      setWebsite((prev) => ({ ...prev, ...patched }));
    } else {
      fetchWebsite();
    }
  }, [fetchWebsite]);

  const handleWebsiteDeleted = useCallback(() => {
    navigate('/dashboard/websites', { replace: true });
  }, [navigate]);

  // Loading skeleton
  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', gap: { xs: 0, lg: 4 }, mt: 2, flexDirection: { xs: 'column', lg: 'row' } }}>
          <Box sx={{ width: { xs: '100%', lg: 240 }, flexShrink: 0 }}>
            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2, mb: 3 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2, mb: 2 }} />
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
          </Box>
        </Box>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  const subdomain = website?.subdomain || website?.slug || '';
  const websiteName = website?.name || 'Website';
  const websiteRole = (website?.role || 'VIEWER').toUpperCase();

  // Permission check: block non-EDITOR users
  const allowedRoles = ['EDITOR', 'ADMIN', 'OWNER'];
  if (!allowedRoles.includes(websiteRole)) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, mt: 4 }}>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          You do not have permission to access this dashboard. Editor or higher role is required.
        </Alert>
      </Container>
    );
  }

  const renderTabContent = () => {
    const tabProps = { website, websiteId, onSaved: handleWebsiteSaved };

    switch (activeSection) {
      case 'overview':
        return <OverviewTab {...tabProps} onNavigateToSection={handleNavigateToSection} />;
      case 'pages':
        return <PagesTab {...tabProps} />;
      case 'design':
        return <DesignTab {...tabProps} />;
      case 'analytics':
        return <AnalyticsTab {...tabProps} />;
      case 'seo':
        return <SeoTab {...tabProps} />;
      case 'forms':
        return <FormsTab {...tabProps} />;
      case 'reviews':
        return <ReviewsTab {...tabProps} />;
      case 'listing':
        return (
          <ListingEditTab
            websiteId={Number(websiteId)}
            websiteData={website}
            planCode={userPlan}
            onUpdate={handleWebsiteSaved}
          />
        );
      case 'domain':
        return <DomainTab {...tabProps} userPlan={userPlan} />;
      case 'integrations':
        return <IntegrationsTab {...tabProps} />;
      case 'team':
        return <TeamTab {...tabProps} currentUserRole={websiteRole} />;
      case 'settings':
        return (
          <SettingsTab
            {...tabProps}
            onDeleted={handleWebsiteDeleted}
            currentUserRole={websiteRole}
          />
        );
      default:
        return <OverviewTab {...tabProps} onNavigateToSection={handleNavigateToSection} />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
      {/* Breadcrumb */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, mt: 1 }}>
        <DashboardActionButton
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/dashboard/websites')}
          variant="text"
          sx={{ px: 0, minWidth: 0, color: 'text.secondary', fontWeight: 500, fontSize: '0.85rem' }}
          aria-label="Back to All Websites"
        >
          Back to All Websites
        </DashboardActionButton>
      </Box>
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Typography
          component="a"
          sx={{ color: 'text.secondary', cursor: 'pointer', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { textDecoration: 'underline' } }}
          onClick={() => navigate('/dashboard/websites')}
        >
          All Websites
        </Typography>
        <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          {websiteName}
        </Typography>
        <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: '0.875rem' }}>
          {activeSectionLabel}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: 'flex',
          gap: { xs: 0, lg: 4 },
          alignItems: 'start',
          mt: 1,
          flexDirection: { xs: 'column', lg: 'row' },
        }}
      >
        {/* MiniSideNav */}
        <MiniSideNav
          profile={{
            name: websiteName,
            email: subdomain ? `${subdomain}.techietribe.app` : '',
          }}
          sections={WEBSITE_MANAGEMENT_NAV_SECTIONS}
          activeItem={activeSection}
          onChange={handleSectionChange}
        />

        {/* Main Content Area */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Section header with breadcrumb and Open Editor button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
            }}
          >
            <DashboardActionButton
              startIcon={<Wrench size={16} />}
              onClick={() => navigate(`/dashboard/websites/${websiteId}/editor`)}
              variant="outlined"
              size="small"
              aria-label="Open website editor"
            >
              Open Editor
            </DashboardActionButton>
          </Box>

          {/* Tab Content */}
          {renderTabContent()}
        </Box>
      </Box>
    </Container>
  );
};

export default WebsiteManagementDashboard;
