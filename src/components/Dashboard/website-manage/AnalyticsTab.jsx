/**
 * AnalyticsTab — Step 10.4
 *
 * Full analytics dashboard for the Website Management Dashboard.
 * Replaces the placeholder "Analytics Coming Soon" with real data.
 *
 * Layout:
 *  1. FilterBar (date range) + Export CSV button
 *  2. 4 DashboardMetricCards: Total Views, Unique Visitors, Bounce Rate, Avg Session Duration
 *  3. Line chart: views over time (recharts)
 *  4. Two columns: Top Pages table | Traffic Sources pie chart
 *  5. Two columns: Device Breakdown bar chart | Geographic table
 */

import { memo, useState, useCallback, useEffect } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import TimerIcon from '@mui/icons-material/Timer';
import { BarChart2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';

import {
  DashboardMetricCard,
  DashboardCard,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTableRow,
  FilterBar,
  DashboardActionButton,
  EmptyState,
} from '../shared';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

// ─── Date Range Options ───────────────────────────────────────────────────────

const DATE_RANGE_OPTIONS = [
  { value: 'last7days', label: 'Last 7 Days' },
  { value: 'last30days', label: 'Last 30 Days' },
  { value: 'last90days', label: 'Last 90 Days' },
];

// ─── CSV Export Helper ────────────────────────────────────────────────────────

function exportToCsv(overview, pages, sources, visitors, geographic) {
  const rows = [];

  // Overview metrics
  rows.push(['Metric', 'Value']);
  rows.push(['Total Views', overview?.totalViews ?? 0]);
  rows.push(['Unique Visitors', overview?.uniqueVisitors ?? 0]);
  rows.push(['Bounce Rate', overview?.bounceRate != null ? `${overview.bounceRate}%` : 'N/A']);
  rows.push(['Avg Session Duration', overview?.avgSessionDuration != null ? `${overview.avgSessionDuration}s` : 'N/A']);
  rows.push([]);

  // Top pages
  rows.push(['Top Pages']);
  rows.push(['Path', 'Views']);
  (pages || []).forEach((p) => rows.push([p.path, p.views]));
  rows.push([]);

  // Traffic sources
  rows.push(['Traffic Sources']);
  rows.push(['Domain', 'Count']);
  (sources || []).forEach((s) => rows.push([s.domain, s.count]));
  rows.push([]);

  // Device breakdown
  if (visitors?.deviceBreakdown) {
    rows.push(['Device Breakdown']);
    rows.push(['Device', 'Count']);
    Object.entries(visitors.deviceBreakdown).forEach(([k, v]) => rows.push([k, v]));
    rows.push([]);
  }

  // Geographic
  rows.push(['Geographic Breakdown']);
  rows.push(['Country', 'Visitors']);
  (geographic || []).forEach((g) => rows.push([g.country, g.visitors]));

  const csvContent = rows
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics-export-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── AnalyticsTab ─────────────────────────────────────────────────────────────

const AnalyticsTab = memo(({ websiteId }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // ── State ─────────────────────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState('last30days');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [overview, setOverview] = useState(null);
  const [pages, setPages] = useState([]);
  const [sources, setSources] = useState([]);
  const [visitors, setVisitors] = useState(null);
  const [geographic, setGeographic] = useState([]);

  // ── Fetch helpers ─────────────────────────────────────────────────────────

  const fetchJson = useCallback(async (url) => {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }, []);

  const loadAll = useCallback(async () => {
    if (!websiteId) return;
    setLoading(true);
    setError(null);
    try {
      const base = `/api/websites/${websiteId}/analytics`;
      const dr = `dateRange=${dateRange}`;

      const [ovRes, pagesRes, srcRes, visRes, geoRes] = await Promise.all([
        fetchJson(`${base}/overview?${dr}`),
        fetchJson(`${base}/pages?${dr}&limit=10`),
        fetchJson(`${base}/traffic-sources?${dr}`),
        fetchJson(`${base}/visitors?${dr}`),
        fetchJson(`${base}/geographic?${dr}`),
      ]);

      setOverview(ovRes.data || null);
      setPages(pagesRes.data?.pages || []);
      setSources(srcRes.data?.sources || []);
      setVisitors(visRes.data || null);
      setGeographic(geoRes.data?.countries || []);
    } catch (err) {
      setError('Failed to load analytics data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [websiteId, dateRange, fetchJson]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleDateRangeChange = useCallback((e) => {
    setDateRange(e.target.value);
  }, []);

  const handleExport = useCallback(() => {
    exportToCsv(overview, pages, sources, visitors, geographic);
  }, [overview, pages, sources, visitors, geographic]);

  // ── Empty state ───────────────────────────────────────────────────────────

  const hasData =
    overview &&
    (overview.totalViews > 0 || overview.uniqueVisitors > 0);

  // ── Pie chart colours ─────────────────────────────────────────────────────

  const PIE_COLORS = ['#378C92', '#64748b', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
  const BAR_COLORS = { desktop: colors.panelAccent || '#378C92', mobile: '#64748b', tablet: '#f59e0b', other: '#ef4444' };

  // ── Device bar data ───────────────────────────────────────────────────────

  const deviceBarData = visitors?.deviceBreakdown
    ? Object.entries(visitors.deviceBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  // ── Metric card trend props ───────────────────────────────────────────────

  function trendDir(pct) {
    if (pct > 0) return 'up';
    if (pct < 0) return 'down';
    return 'flat';
  }

  const ovTrends = overview?.trends || {};

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box>
      {/* ── Filter Bar ───────────────────────────────────────────────────── */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={2}
        mb={3}
      >
        <FilterBar
          label="Date Range"
          value={dateRange}
          onChange={handleDateRangeChange}
          options={DATE_RANGE_OPTIONS}
        />
        <DashboardActionButton
          variant="outlined"
          onClick={handleExport}
          disabled={loading || !hasData}
          aria-label="Export analytics data as CSV"
        >
          Export CSV
        </DashboardActionButton>
      </Box>

      {/* ── Loading ───────────────────────────────────────────────────────── */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress size={48} />
        </Box>
      )}

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {!loading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!loading && !error && !hasData && (
        <EmptyState
          icon={<BarChart2 size={48} />}
          title="No Analytics Data Yet"
          subtitle="Add the tracking script to your website to start collecting analytics. Copy the embed snippet from the Integrations tab."
        />
      )}

      {/* ── Dashboard content ─────────────────────────────────────────────── */}
      {!loading && !error && hasData && (
        <>
          {/* Row 1: Metric Cards */}
          <Grid container spacing={3} mb={3}>
            <Grid item xs={12} sm={6} lg={3}>
              <DashboardMetricCard
                title="Total Views"
                value={overview.totalViews}
                icon={VisibilityIcon}
                diff={ovTrends.totalViews}
                trendDirection={trendDir(ovTrends.totalViews)}
                diffLabel={`${Math.abs(ovTrends.totalViews || 0)}% vs previous period`}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <DashboardMetricCard
                title="Unique Visitors"
                value={overview.uniqueVisitors}
                icon={PeopleAltIcon}
                diff={ovTrends.uniqueVisitors}
                trendDirection={trendDir(ovTrends.uniqueVisitors)}
                diffLabel={`${Math.abs(ovTrends.uniqueVisitors || 0)}% vs previous period`}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <DashboardMetricCard
                title="Bounce Rate"
                value={`${overview.bounceRate}%`}
                icon={ExitToAppIcon}
                diff={null}
              />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <DashboardMetricCard
                title="Avg Session"
                value={overview.avgSessionDuration ? `${overview.avgSessionDuration}s` : 'N/A'}
                icon={TimerIcon}
                diff={null}
              />
            </Grid>
          </Grid>

          {/* Row 2: Views Over Time line chart */}
          {overview.viewsOverTime && overview.viewsOverTime.length > 0 && (
            <Box mb={3}>
              <DashboardCard title="Views Over Time">
                <Box height={280} mt={2}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={overview.viewsOverTime}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={alpha(colors.text, 0.08)}
                      />
                      <XAxis
                        dataKey="date"
                        tick={{ fill: alpha(colors.text, 0.55), fontSize: 11 }}
                        tickFormatter={(val) => val.slice(5)} // MM-DD
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        tick={{ fill: alpha(colors.text, 0.55), fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{
                          background: colors.panelBg,
                          border: `1px solid ${alpha(colors.text, 0.1)}`,
                          borderRadius: 8,
                          color: colors.text,
                          fontSize: 12,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="Views"
                        stroke={colors.panelAccent || '#378C92'}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </DashboardCard>
            </Box>
          )}

          {/* Row 3: Top Pages + Traffic Sources */}
          <Grid container spacing={3} mb={3}>
            {/* Top Pages Table */}
            <Grid item xs={12} md={6}>
              <DashboardCard title="Top Pages">
                <DashboardTable colors={colors} variant="inset">
                  <TableHead>
                    <TableRow>
                      <DashboardTableHeadCell colors={colors}>Path</DashboardTableHeadCell>
                      <DashboardTableHeadCell colors={colors} align="right">
                        Views
                      </DashboardTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pages.length === 0 ? (
                      <DashboardTableRow colors={colors}>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="body2" sx={{ color: alpha(colors.text, 0.5), py: 2 }}>
                            No page data
                          </Typography>
                        </TableCell>
                      </DashboardTableRow>
                    ) : (
                      pages.map((p) => (
                        <DashboardTableRow key={p.path} colors={colors}>
                          <TableCell
                            sx={{
                              color: colors.text,
                              fontSize: '0.875rem',
                              maxWidth: 180,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {p.path}
                          </TableCell>
                          <TableCell align="right" sx={{ color: colors.text, fontSize: '0.875rem' }}>
                            {p.views.toLocaleString()}
                          </TableCell>
                        </DashboardTableRow>
                      ))
                    )}
                  </TableBody>
                </DashboardTable>
              </DashboardCard>
            </Grid>

            {/* Traffic Sources Pie Chart */}
            <Grid item xs={12} md={6}>
              <DashboardCard title="Traffic Sources">
                {sources.length === 0 ? (
                  <Box py={4} textAlign="center">
                    <Typography variant="body2" sx={{ color: alpha(colors.text, 0.5) }}>
                      No traffic source data
                    </Typography>
                  </Box>
                ) : (
                  <Box height={260} mt={2}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sources.slice(0, 6)}
                          dataKey="count"
                          nameKey="domain"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          label={({ domain, percent }) =>
                            `${domain} (${(percent * 100).toFixed(0)}%)`
                          }
                          labelLine={false}
                        >
                          {sources.slice(0, 6).map((entry, index) => (
                            <Cell
                              key={entry.domain}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: colors.panelBg,
                            border: `1px solid ${alpha(colors.text, 0.1)}`,
                            borderRadius: 8,
                            color: colors.text,
                            fontSize: 12,
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </DashboardCard>
            </Grid>
          </Grid>

          {/* Row 4: Device Breakdown + Geographic */}
          <Grid container spacing={3}>
            {/* Device Breakdown Bar Chart */}
            <Grid item xs={12} md={6}>
              <DashboardCard title="Device Breakdown">
                {deviceBarData.length === 0 ? (
                  <Box py={4} textAlign="center">
                    <Typography variant="body2" sx={{ color: alpha(colors.text, 0.5) }}>
                      No device data
                    </Typography>
                  </Box>
                ) : (
                  <Box height={220} mt={2}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={deviceBarData}
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={alpha(colors.text, 0.08)}
                        />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: alpha(colors.text, 0.55), fontSize: 12 }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fill: alpha(colors.text, 0.55), fontSize: 11 }}
                          tickLine={false}
                          axisLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{
                            background: colors.panelBg,
                            border: `1px solid ${alpha(colors.text, 0.1)}`,
                            borderRadius: 8,
                            color: colors.text,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="value" name="Visitors" radius={[4, 4, 0, 0]}>
                          {deviceBarData.map((entry) => (
                            <Cell
                              key={entry.name}
                              fill={BAR_COLORS[entry.name] || '#8b5cf6'}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </DashboardCard>
            </Grid>

            {/* Geographic Table */}
            <Grid item xs={12} md={6}>
              <DashboardCard title="Geographic Breakdown">
                <DashboardTable colors={colors} variant="inset">
                  <TableHead>
                    <TableRow>
                      <DashboardTableHeadCell colors={colors}>Country</DashboardTableHeadCell>
                      <DashboardTableHeadCell colors={colors} align="right">
                        Visitors
                      </DashboardTableHeadCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {geographic.length === 0 ? (
                      <DashboardTableRow colors={colors}>
                        <TableCell colSpan={2} align="center">
                          <Typography variant="body2" sx={{ color: alpha(colors.text, 0.5), py: 2 }}>
                            No geographic data
                          </Typography>
                        </TableCell>
                      </DashboardTableRow>
                    ) : (
                      geographic.slice(0, 10).map((g) => (
                        <DashboardTableRow key={g.country} colors={colors}>
                          <TableCell sx={{ color: colors.text, fontSize: '0.875rem' }}>
                            {g.country}
                          </TableCell>
                          <TableCell align="right" sx={{ color: colors.text, fontSize: '0.875rem' }}>
                            {g.visitors.toLocaleString()}
                          </TableCell>
                        </DashboardTableRow>
                      ))
                    )}
                  </TableBody>
                </DashboardTable>
              </DashboardCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
});

AnalyticsTab.displayName = 'AnalyticsTab';

export default AnalyticsTab;
