/**
 * DashboardOverview
 *
 * Comprehensive overview dashboard component.
 * - User section: 6 metric cards, page views line chart, top websites bar chart,
 *   recent activity feed, and quick actions.
 * - Admin section: platform metrics, plan distribution pie chart, platform
 *   page views trend, top websites table, and admin quick actions.
 *
 * Step 10.3a — substeps 10.3a.6 + 10.3a.7
 */

import { memo, useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Skeleton from '@mui/material/Skeleton';
import Alert from '@mui/material/Alert';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import ToggleButton from '@mui/material/ToggleButton';
import Typography from '@mui/material/Typography';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import {
  LayoutDashboard,
  BarChart3,
  MousePointerClick,
  ShoppingBag,
  DollarSign,
  Crown,
  Users,
  Globe,
  CreditCard,
  Clock,
  Eye,
  Shield,
  Activity,
  TrendingUp,
  Settings,
  Store,
  Plus,
  Star,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';
import {
  DashboardMetricCard,
  DashboardCard,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTableRow,
  DashboardActionButton,
  DashboardGradientButton,
  PageHeader,
  EmptyState,
  getTrendProps,
  ActivityFeedCard,
} from './shared';
import { isAdmin } from '../../constants/roles';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Lightweight relative time formatter — avoids date-fns dependency.
 */
const formatRelativeTime = (timestamp) => {
  if (!timestamp) return 'just now';
  const now = Date.now();
  const then = new Date(timestamp).getTime();
  const diffMs = now - then;
  if (diffMs < 0) return 'just now';
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDays = Math.floor(diffHr / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths}mo ago`;
};

/** Format cents as "$X,XXX.XX" */
const formatCurrency = (cents, decimals = 2) => {
  if (!Number.isFinite(cents)) return '$0.00';
  const amount = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
};

/** Map activity type to a lucide icon component */
const getActivityIcon = (type) => {
  const icons = {
    page_view: Eye,
    cta_click: MousePointerClick,
    website_created: Plus,
    website_published: Globe,
    store_created: Store,
    settings_updated: Settings,
    review_added: Star,
  };
  return icons[type] || Activity;
};

/** Friendly label for activity type */
const getActivityLabel = (type, resource, websiteName) => {
  const labels = {
    page_view: `Page viewed on ${websiteName || resource || 'a website'}`,
    cta_click: `CTA clicked on ${websiteName || resource || 'a website'}`,
    website_created: `Website "${websiteName || resource}" created`,
    website_published: `Website "${websiteName || resource}" published`,
    store_created: `Store created for ${websiteName || resource || 'a website'}`,
    settings_updated: `Settings updated for ${websiteName || resource || 'a website'}`,
    review_added: `New review on ${websiteName || resource || 'a website'}`,
  };
  return labels[type] || `Activity on ${websiteName || resource || 'a website'}`;
};

// ---------------------------------------------------------------------------
// PIE CHART COLORS
// ---------------------------------------------------------------------------
const PIE_COLORS = ['#378C92', '#5BA3A8', '#7DBBBF', '#A0D3D6', '#C2EBEE', '#E5F7F8'];

// ---------------------------------------------------------------------------
// Loading Skeleton Row
// ---------------------------------------------------------------------------
const MetricSkeletons = () => (
  <Grid container spacing={2} sx={{ mb: 3 }}>
    {Array.from({ length: 6 }).map((_, i) => (
      <Grid item xs={12} sm={6} md={4} lg={2} key={i}>
        <Skeleton variant="rounded" height={160} sx={{ borderRadius: '18px' }} />
      </Grid>
    ))}
  </Grid>
);

// ---------------------------------------------------------------------------
// DashboardOverview
// ---------------------------------------------------------------------------
const DashboardOverview = memo(({ user }) => {
  const navigate = useNavigate();
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // ── State ──────────────────────────────────────────────────────────────────
  const [overviewData, setOverviewData] = useState(null);
  const [chartsData, setChartsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartPeriod, setChartPeriod] = useState('30');

  // Admin state
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState(null);

  const userIsAdmin = isAdmin(user?.role);

  // ── Fetch helpers ──────────────────────────────────────────────────────────
  const fetchCharts = useCallback(async (period) => {
    try {
      const res = await axios.get(`${API_URL}/dashboard/overview/charts?period=${period}`);
      setChartsData(res.data?.data ?? res.data);
    } catch {
      // Charts failure is non-critical — silently ignore
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [overviewRes, chartsRes] = await Promise.all([
        axios.get(`${API_URL}/dashboard/overview`),
        axios.get(`${API_URL}/dashboard/overview/charts?period=${chartPeriod}`),
      ]);
      setOverviewData(overviewRes.data?.data ?? overviewRes.data);
      setChartsData(chartsRes.data?.data ?? chartsRes.data);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Failed to load dashboard data. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  }, [chartPeriod]);

  const fetchAdmin = useCallback(async () => {
    if (!userIsAdmin) return;
    setAdminLoading(true);
    setAdminError(null);
    try {
      const res = await axios.get(`${API_URL}/dashboard/admin/overview`);
      setAdminData(res.data?.data ?? res.data);
    } catch (err) {
      setAdminError(
        err?.response?.data?.message ||
          'Failed to load platform data.',
      );
    } finally {
      setAdminLoading(false);
    }
  }, [userIsAdmin]);

  // ── Mount: parallel fetch ──────────────────────────────────────────────────
  useEffect(() => {
    const parallelFetches = [fetchOverview()];
    if (userIsAdmin) parallelFetches.push(fetchAdmin());
    Promise.all(parallelFetches);
  }, [fetchOverview, fetchAdmin, userIsAdmin]);

  // ── Period change ──────────────────────────────────────────────────────────
  const handlePeriodChange = useCallback(
    (_, newPeriod) => {
      if (newPeriod !== null) {
        setChartPeriod(newPeriod);
        fetchCharts(newPeriod);
      }
    },
    [fetchCharts],
  );

  // ── Memoised computed values ───────────────────────────────────────────────
  const formattedRevenue = useMemo(() => {
    const cents = overviewData?.revenue?.totalCents;
    return formatCurrency(Number.isFinite(cents) ? cents : 0);
  }, [overviewData?.revenue?.totalCents]);

  const usageProgress = useMemo(() => {
    const used = overviewData?.usage?.websites?.used ?? 0;
    const limit = overviewData?.usage?.websites?.limit ?? 0;
    if (limit === 0) return 0;
    return Math.min(Math.round((used / limit) * 100), 100);
  }, [overviewData?.usage]);

  const formattedMRR = useMemo(() => {
    const cents = adminData?.estimatedMRR?.totalCents;
    return formatCurrency(Number.isFinite(cents) ? cents : 0, 0);
  }, [adminData?.estimatedMRR?.totalCents]);

  const totalPendingApprovals = useMemo(() => {
    if (!adminData?.pendingApprovals) return 0;
    const { insights = 0, templates = 0 } = adminData.pendingApprovals;
    return insights + templates;
  }, [adminData?.pendingApprovals]);

  const planDistributionData = useMemo(() => {
    if (!adminData?.planDistribution) return [];
    return Object.entries(adminData.planDistribution).map(([key, value]) => ({
      name: key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
      value: Number(value) || 0,
    }));
  }, [adminData?.planDistribution]);

  // ── Determine empty state ──────────────────────────────────────────────────
  const isEmpty = useMemo(
    () =>
      !loading &&
      !error &&
      overviewData !== null &&
      (overviewData?.websites?.total ?? 0) === 0 &&
      (overviewData?.stores?.total ?? 0) === 0,
    [loading, error, overviewData],
  );

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <Box>
        <MetricSkeletons />
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: '18px' }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rounded" height={340} sx={{ borderRadius: '18px' }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <DashboardActionButton onClick={fetchOverview} size="small">
              Retry
            </DashboardActionButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // ── Empty state ────────────────────────────────────────────────────────────
  if (isEmpty) {
    return (
      <EmptyState
        icon={<LayoutDashboard size={40} color={colors.primary} />}
        title="Create your first website to see your dashboard"
        subtitle="Once you create a website, your metrics, analytics, and activity will appear here."
        action={
          <DashboardGradientButton
            onClick={() => navigate('/dashboard/websites/templates')}
            startIcon={<Plus size={18} />}
          >
            Create Your First Website
          </DashboardGradientButton>
        }
      />
    );
  }

  // ── Shorthand refs ─────────────────────────────────────────────────────────
  const websites = overviewData?.websites ?? {};
  const analytics = overviewData?.analytics ?? {};
  const stores = overviewData?.stores ?? {};
  const plan = overviewData?.plan ?? {};
  const usage = overviewData?.usage ?? {};
  const pageViewsTrend = chartsData?.pageViewsTrend ?? [];
  const topWebsites = chartsData?.topWebsites ?? [];
  const recentActivity = (chartsData?.recentActivity ?? []).slice(0, 10);

  return (
    <Box>
      {/* ── METRICS ROW ─────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Websites */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardMetricCard
            title="Websites"
            value={websites.total ?? 0}
            icon={LayoutDashboard}
            diffLabel={`${websites.published ?? 0} published`}
            showDiff={false}
          />
        </Grid>

        {/* Page Views */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardMetricCard
            title="Page Views (30d)"
            value={analytics.pageViews?.total ?? 0}
            icon={BarChart3}
            {...getTrendProps(analytics.pageViews?.total ?? 0, analytics.pageViews?.change ?? null)}
          />
        </Grid>

        {/* CTA Clicks */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardMetricCard
            title="CTA Clicks (30d)"
            value={analytics.ctaClicks?.total ?? 0}
            icon={MousePointerClick}
            {...getTrendProps(analytics.ctaClicks?.total ?? 0, analytics.ctaClicks?.change ?? null)}
          />
        </Grid>

        {/* Stores */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardMetricCard
            title="Stores"
            value={stores.total ?? 0}
            icon={ShoppingBag}
            diffLabel={`${stores.totalProducts ?? 0} products`}
            showDiff={false}
          />
        </Grid>

        {/* Revenue */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardMetricCard
            title="Revenue"
            value={formattedRevenue}
            icon={DollarSign}
            showDiff={false}
          />
        </Grid>

        {/* Plan */}
        <Grid item xs={12} sm={6} md={4} lg={2}>
          <DashboardMetricCard
            title="Plan"
            value={plan.website?.name ?? 'Free'}
            icon={Crown}
            showProgress
            progress={usageProgress}
            progressLabel={`${usage.websites?.used ?? 0} / ${usage.websites?.limit ?? 0} websites`}
          />
        </Grid>
      </Grid>

      {/* ── CHARTS ROW ──────────────────────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Page Views Trend */}
        <Grid item xs={12} md={8}>
          <DashboardCard
            icon={TrendingUp}
            title="Page Views Trend"
            subtitle={
              <ToggleButtonGroup
                value={chartPeriod}
                exclusive
                onChange={handlePeriodChange}
                aria-label="chart period"
                size="small"
                sx={{
                  mt: 0.5,
                  '& .MuiToggleButton-root': {
                    color: colors.textSecondary,
                    border: `1px solid ${alpha(colors.text, 0.15)}`,
                    px: 1.5,
                    py: 0.4,
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&.Mui-selected': {
                      background: colors.primary,
                      color: '#fff',
                      border: `1px solid ${colors.primary}`,
                    },
                  },
                }}
              >
                <ToggleButton value="7" aria-label="7 days">7D</ToggleButton>
                <ToggleButton value="30" aria-label="30 days">30D</ToggleButton>
                <ToggleButton value="90" aria-label="90 days">90D</ToggleButton>
              </ToggleButtonGroup>
            }
          >
            {pageViewsTrend.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  No trend data available
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={pageViewsTrend} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: colors.textSecondary }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: colors.textSecondary }}
                    tickLine={false}
                    axisLine={false}
                    width={40}
                  />
                  <Tooltip
                    contentStyle={{
                      background: colors.panelBg,
                      border: `1px solid ${alpha(colors.text, 0.12)}`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: colors.text,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={colors.primary || '#378C92'}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </DashboardCard>
        </Grid>

        {/* Top Websites Bar Chart */}
        <Grid item xs={12} md={4}>
          <DashboardCard icon={BarChart3} title="Top Websites">
            {topWebsites.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  No data yet
                </Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={topWebsites.slice(0, 5)}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                >
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: colors.textSecondary }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    dataKey="name"
                    type="category"
                    tick={{ fontSize: 11, fill: colors.textSecondary }}
                    tickLine={false}
                    axisLine={false}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: colors.panelBg,
                      border: `1px solid ${alpha(colors.text, 0.12)}`,
                      borderRadius: 8,
                      fontSize: 12,
                      color: colors.text,
                    }}
                  />
                  <Bar dataKey="pageViews" fill={colors.primary || '#378C92'} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </DashboardCard>
        </Grid>
      </Grid>

      {/* ── ACTIVITY + QUICK ACTIONS ROW ────────────────────────────────── */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Recent Activity Feed */}
        <Grid item xs={12} md={8}>
          <DashboardCard icon={Activity} title="Recent Activity">
            {recentActivity.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  No recent activity
                </Typography>
              </Box>
            ) : (
              <Box>
                {recentActivity.map((item, index) => {
                  const ItemIcon = getActivityIcon(item.type);
                  return (
                    <Box
                      key={`${item.type}-${item.timestamp}-${index}`}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        py: 1.5,
                        borderBottom:
                          index < recentActivity.length - 1
                            ? `1px solid ${alpha(colors.text, 0.06)}`
                            : 'none',
                      }}
                    >
                      <Box
                        sx={{
                          mt: 0.25,
                          flexShrink: 0,
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: alpha(colors.primary || '#378C92', 0.12),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <ItemIcon size={14} color={colors.primary} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: colors.text,
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            lineHeight: 1.3,
                          }}
                        >
                          {getActivityLabel(item.type, item.resource, item.websiteName)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: colors.textSecondary, fontSize: '0.75rem' }}
                        >
                          {formatRelativeTime(item.timestamp)}
                        </Typography>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
          </DashboardCard>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <DashboardCard icon={TrendingUp} title="Quick Actions" subtitle="Common tasks">
            <Grid container spacing={1.5} data-testid="quick-actions">
              <Grid item xs={12} sm={6} md={12}>
                <Box
                  onClick={() => navigate('/dashboard/websites/templates')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/websites/templates')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(colors.text, 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: colors.primary,
                      background: alpha(colors.primary, 0.05),
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': { outline: `2px solid ${colors.primary}` },
                  }}
                >
                  <Globe size={18} style={{ color: colors.primary, marginBottom: 4 }} />
                  <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
                    Create Website
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Build a new website
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={12}>
                <Box
                  onClick={() => navigate('/dashboard/websites')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/websites')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(colors.text, 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: colors.primary,
                      background: alpha(colors.primary, 0.05),
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': { outline: `2px solid ${colors.primary}` },
                  }}
                >
                  <LayoutDashboard size={18} style={{ color: colors.primary, marginBottom: 4 }} />
                  <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
                    My Websites
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Manage your sites
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={12}>
                <Box
                  onClick={() => navigate('/dashboard/websites/stores')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/websites/stores')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(colors.text, 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: colors.primary,
                      background: alpha(colors.primary, 0.05),
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': { outline: `2px solid ${colors.primary}` },
                  }}
                >
                  <ShoppingBag size={18} style={{ color: colors.primary, marginBottom: 4 }} />
                  <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
                    My Stores
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    View your stores
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={12}>
                <Box
                  onClick={() => navigate('/dashboard/settings')}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate('/dashboard/settings')}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(colors.text, 0.1)}`,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: colors.primary,
                      background: alpha(colors.primary, 0.05),
                      transform: 'translateY(-1px)',
                    },
                    '&:focus-visible': { outline: `2px solid ${colors.primary}` },
                  }}
                >
                  <Settings size={18} style={{ color: colors.primary, marginBottom: 4 }} />
                  <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
                    Settings
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                    Configure your account
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </DashboardCard>
        </Grid>
      </Grid>

      {/* ── WEBSITE ACTIVITY FEED ──────────────────────────────────────── */}
      {/* Shows per-website unified activity (Step 10.14) for the top website */}
      {topWebsites.length > 0 && topWebsites[0]?.websiteId && (
        <Grid container spacing={2} sx={{ mb: 3 }} data-testid="website-activity-feed-row">
          <Grid item xs={12}>
            <ActivityFeedCard
              websiteId={topWebsites[0].websiteId}
              title={`Activity — ${topWebsites[0].name || 'Top Website'}`}
              limit={10}
              showFilters
            />
          </Grid>
        </Grid>
      )}

      {/* ── ADMIN SECTION ───────────────────────────────────────────────── */}
      {userIsAdmin && (
        <Box data-testid="admin-section" sx={{ mt: 4 }}>
          <Divider sx={{ mb: 3, borderColor: alpha(colors.text, 0.1) }} />
          <PageHeader
            title="Platform Overview"
            subtitle="Real-time platform statistics and insights"
          />

          {/* Admin loading skeleton */}
          {adminLoading && !adminData && (
            <Box>
              <MetricSkeletons />
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rounded" height={320} sx={{ borderRadius: '18px' }} />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Skeleton variant="rounded" height={320} sx={{ borderRadius: '18px' }} />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Admin error — independent from user section */}
          {adminError && !adminData && (
            <Alert
              severity="error"
              sx={{ mb: 3 }}
              action={
                <DashboardActionButton onClick={fetchAdmin} size="small">
                  Retry
                </DashboardActionButton>
              }
            >
              {adminError}
            </Alert>
          )}

          {/* Admin data */}
          {adminData && (
            <>
              {/* Platform Metrics Row */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <DashboardMetricCard
                    title="Total Users"
                    value={adminData.users?.total ?? 0}
                    icon={Users}
                    {...getTrendProps(
                      adminData.users?.total ?? 0,
                      adminData.users?.growthPercent ?? null,
                    )}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <DashboardMetricCard
                    title="Total Websites"
                    value={adminData.websites?.total ?? 0}
                    icon={Globe}
                    showDiff={false}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <DashboardMetricCard
                    title="Paid Subscriptions"
                    value={adminData.subscriptions?.activePaid ?? 0}
                    icon={CreditCard}
                    showDiff={false}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <DashboardMetricCard
                    title="Est. MRR"
                    value={formattedMRR}
                    icon={DollarSign}
                    showDiff={false}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <DashboardMetricCard
                    title="Pending Approvals"
                    value={totalPendingApprovals}
                    icon={Clock}
                    showDiff={false}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} lg={2}>
                  <DashboardMetricCard
                    title="Platform Views (30d)"
                    value={adminData.platformPageViews?.total ?? 0}
                    icon={Eye}
                    {...getTrendProps(
                      adminData.platformPageViews?.total ?? 0,
                      adminData.platformPageViews?.change ?? null,
                    )}
                  />
                </Grid>
              </Grid>

              {/* Platform Charts Row */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Plan Distribution Pie */}
                <Grid item xs={12} md={6}>
                  <DashboardCard icon={BarChart3} title="Plan Distribution">
                    {planDistributionData.length === 0 ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          No plan data
                        </Typography>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={planDistributionData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                            labelLine={false}
                          >
                            {planDistributionData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: colors.panelBg,
                              border: `1px solid ${alpha(colors.text, 0.12)}`,
                              borderRadius: 8,
                              fontSize: 12,
                              color: colors.text,
                            }}
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: 12,
                              color: colors.textSecondary,
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </DashboardCard>
                </Grid>

                {/* Platform Page Views Trend */}
                <Grid item xs={12} md={6}>
                  <DashboardCard icon={TrendingUp} title="Platform Page Views (30d)">
                    {pageViewsTrend.length === 0 ? (
                      <Box sx={{ py: 4, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                          No trend data
                        </Typography>
                      </Box>
                    ) : (
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart
                          data={pageViewsTrend}
                          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                        >
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11, fill: colors.textSecondary }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11, fill: colors.textSecondary }}
                            tickLine={false}
                            axisLine={false}
                            width={40}
                          />
                          <Tooltip
                            contentStyle={{
                              background: colors.panelBg,
                              border: `1px solid ${alpha(colors.text, 0.12)}`,
                              borderRadius: 8,
                              fontSize: 12,
                              color: colors.text,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="count"
                            stroke={colors.primary || '#378C92'}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </DashboardCard>
                </Grid>
              </Grid>

              {/* Top Websites Table */}
              <Box sx={{ mb: 3 }}>
                <DashboardCard icon={Globe} title="Top Websites by Traffic">
                  <DashboardTable colors={colors}>
                    <TableHead>
                      <TableRow>
                        <DashboardTableHeadCell colors={colors}>Rank</DashboardTableHeadCell>
                        <DashboardTableHeadCell colors={colors}>Website</DashboardTableHeadCell>
                        <DashboardTableHeadCell colors={colors}>Owner</DashboardTableHeadCell>
                        <DashboardTableHeadCell colors={colors}>Page Views</DashboardTableHeadCell>
                        <DashboardTableHeadCell colors={colors}>Status</DashboardTableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(adminData.topWebsites ?? []).slice(0, 10).map((site, index) => (
                        <DashboardTableRow key={site.websiteId ?? index} colors={colors}>
                          <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                            #{index + 1}
                          </TableCell>
                          <TableCell sx={{ color: colors.text }}>{site.name}</TableCell>
                          <TableCell sx={{ color: colors.textSecondary }}>
                            <Box>
                              <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
                                {site.ownerName}
                              </Typography>
                              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                                {site.ownerEmail}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell sx={{ color: colors.text }}>
                            {(site.pageViews ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label="Active"
                              size="small"
                              sx={{
                                background: alpha('#10b981', 0.12),
                                color: '#10b981',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                        </DashboardTableRow>
                      ))}
                      {(adminData.topWebsites ?? []).length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            sx={{ textAlign: 'center', color: colors.textSecondary, py: 4 }}
                          >
                            No website data available
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </DashboardTable>
                </DashboardCard>
              </Box>

              {/* Admin Quick Actions */}
              <Box sx={{ mb: 3 }}>
                <DashboardCard icon={Shield} title="Admin Actions">
                  <Grid container spacing={1.5} data-testid="admin-quick-actions">
                    <Grid item xs={12} sm={6} md={3}>
                      <DashboardActionButton
                        fullWidth
                        startIcon={<Users size={16} />}
                        onClick={() => navigate('/dashboard/users')}
                      >
                        Manage Users
                      </DashboardActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DashboardActionButton
                        fullWidth
                        startIcon={<Clock size={16} />}
                        onClick={() => navigate('/dashboard/insights')}
                      >
                        Review Pending
                      </DashboardActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DashboardActionButton
                        fullWidth
                        startIcon={<Shield size={16} />}
                        onClick={() => navigate('/dashboard/settings')}
                      >
                        View Audit Log
                      </DashboardActionButton>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <DashboardActionButton
                        fullWidth
                        startIcon={<Activity size={16} />}
                        component="a"
                        href="/api/health"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Platform Health
                      </DashboardActionButton>
                    </Grid>
                  </Grid>
                </DashboardCard>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
});

DashboardOverview.displayName = 'DashboardOverview';

export default DashboardOverview;
