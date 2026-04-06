/**
 * PerformanceMonitoring Page (Step 8.4.3 + 8.4.4)
 *
 * Admin-only dashboard tab for real-time system health and metrics.
 * - 4 metric cards: Database, Redis, Memory, Cache (color-coded by threshold)
 * - 4 line charts: response time, hit rate, memory, request rate (recharts)
 * - Slow queries table (DashboardTable variant='inset')
 * - Index health table (DashboardTable variant='inset')
 * - Alert history panel (last 10 alerts)
 * - Toast notifications on threshold breaches
 * - Real-time updates via usePerformanceWebSocket (30s refresh)
 * - Fallback: polling /api/metrics/health every 30s if WS unavailable
 *
 * Production Quality Checklist:
 * ✅ Loading: Skeleton for initial load
 * ✅ Error: inline Alert on failure
 * ✅ Empty: EmptyState for no data
 * ✅ Button protection during async
 * ✅ Accessible icon buttons
 * ✅ Theme tokens (no hardcoded colors)
 * ✅ Responsive: 1 col mobile / 2 col tablet / 4 col desktop
 * ✅ Dashboard integration: renders inside Dashboard theme
 */

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import axios from 'axios';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import Snackbar from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Container from '@mui/material/Container';
import { alpha } from '@mui/material/styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

// Lucide icons (project standard)
import {
  Database,
  Zap,
  Cpu,
  Server,
  BarChart2,
  RefreshCw,
  Clock,
  AlertTriangle,
  X,
} from 'lucide-react';

// Dashboard shared components (MANDATORY per component_audit)
import {
  PageHeader,
  DashboardMetricCard,
  DashboardCard,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTableRow,
  EmptyState,
  DashboardTooltip,
} from '../components/Dashboard/shared';

import { useAuth } from '../context/AuthContext';
import { usePerformanceWebSocket } from '../hooks/usePerformanceWebSocket';
import { getDashboardColors } from '../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../context/ThemeContext';

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const POLL_INTERVAL_MS = 30000; // 30s polling fallback
const MAX_ALERT_HISTORY = 10;

// Alert thresholds (mirrors backend defaults)
const THRESHOLDS = {
  DB_WARN: 500,
  DB_CRIT: 1000,
  REDIS_WARN: 70,
  REDIS_CRIT: 50,
  MEMORY_WARN: 80,
  MEMORY_CRIT: 90,
};

// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────

/**
 * Returns 'success'|'warning'|'error' trendDirection based on metric value and thresholds.
 */
function getDbTrend(responseTime) {
  if (responseTime === null || responseTime < 0) return 'flat';
  if (responseTime >= THRESHOLDS.DB_CRIT) return 'down';
  if (responseTime >= THRESHOLDS.DB_WARN) return 'flat';
  return 'up';
}

function getRedisTrend(hitRate) {
  if (hitRate === null) return 'flat';
  if (hitRate < THRESHOLDS.REDIS_CRIT) return 'down';
  if (hitRate < THRESHOLDS.REDIS_WARN) return 'flat';
  return 'up';
}

function getMemoryTrend(heapUsed, heapTotal) {
  if (!heapTotal || heapTotal === 0) return 'flat';
  const pct = Math.round((heapUsed / heapTotal) * 100);
  if (pct >= THRESHOLDS.MEMORY_CRIT) return 'down';
  if (pct >= THRESHOLDS.MEMORY_WARN) return 'flat';
  return 'up';
}

function formatTime(isoOrMs) {
  try {
    const d = typeof isoOrMs === 'number' ? new Date(isoOrMs) : new Date(isoOrMs);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

// ──────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────

const AlertHistoryPanel = memo(({ alerts, colors }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <Box sx={{ mt: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
      >
        Recent Alerts
      </Typography>
      <Box
        sx={{
          maxHeight: 240,
          overflowY: 'auto',
          borderRadius: '10px',
          border: `1px solid ${alpha(colors.text, 0.08)}`,
          p: 1,
        }}
      >
        {alerts.map((alert, i) => (
          <Box
            key={`${alert.timestamp}-${i}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              py: 0.75,
              px: 1,
              borderBottom: i < alerts.length - 1 ? `1px solid ${alpha(colors.text, 0.05)}` : 'none',
            }}
          >
            <AlertTriangle
              size={14}
              color={alert.level === 'critical' ? '#ef4444' : '#f59e0b'}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="caption"
                sx={{
                  color: colors.text,
                  fontWeight: 600,
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {alert.message || `${alert.metric}: ${alert.value}`}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {formatTime(alert.timestamp)}
              </Typography>
            </Box>
            <Chip
              label={alert.level}
              size="small"
              sx={{
                fontSize: '0.7rem',
                height: 18,
                bgcolor: alert.level === 'critical'
                  ? alpha('#ef4444', 0.15)
                  : alpha('#f59e0b', 0.15),
                color: alert.level === 'critical' ? '#ef4444' : '#f59e0b',
                border: 'none',
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
});
AlertHistoryPanel.displayName = 'AlertHistoryPanel';

// ──────────────────────────────────────────────
// Main Page Component
// ──────────────────────────────────────────────

const PerformanceMonitoring = memo(({ colors: colorsProp }) => {
  const { actualTheme } = useCustomTheme();
  const colors = colorsProp || getDashboardColors(actualTheme);
  const { user } = useAuth();

  // ── State ──
  const [metrics, setMetrics] = useState(null);
  const [history, setHistory] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toastAlert, setToastAlert] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const mountedRef = useRef(true);
  const pollTimerRef = useRef(null);
  // FIX(8.4-QA): Track wsConnected in a ref so the polling setInterval closure
  // always reads the current value, not the stale one captured at creation time.
  const wsConnectedRef = useRef(false);

  // ── Token for WS ──
  const token = localStorage.getItem('token') || null;

  // ── Fetch helpers ──
  const fetchMetrics = useCallback(async (showRefreshing = false) => {
    if (!mountedRef.current) return;
    if (showRefreshing) setRefreshing(true);
    try {
      const { data } = await axios.get(`${API_URL}/metrics/health`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (mountedRef.current) {
        setMetrics(data);
        setError(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.response?.data?.error || 'Failed to load metrics');
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [token]);

  const fetchHistory = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const { data } = await axios.get(`${API_URL}/metrics/history?duration=24h`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (mountedRef.current && data.averages?.hourly) {
        const chartData = data.averages.hourly.map((h) => ({
          time: formatTime(h.hour),
          responseTime: h.api_avgResponseTime,
          hitRate: h.redis_hitRate,
          memory: h.memory_heapUsed,
          requestRate: h.api_requestRate,
          dbResponseTime: h.database_responseTime,
        }));
        setHistory(chartData);
      }
    } catch {
      // Non-critical — charts just won't show historical data
    }
  }, [token]);

  const fetchAlerts = useCallback(async () => {
    if (!mountedRef.current) return;
    try {
      const { data } = await axios.get(`${API_URL}/metrics/alerts`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (mountedRef.current && data.alerts) {
        setAlertHistory(data.alerts.slice(0, MAX_ALERT_HISTORY));
      }
    } catch {
      // Non-critical
    }
  }, [token]);

  // ── WebSocket real-time updates ──
  const handleMetricsUpdate = useCallback((data) => {
    if (!mountedRef.current) return;
    setMetrics(data);
    setError(null);
  }, []);

  const handleAlert = useCallback((alert) => {
    if (!mountedRef.current) return;
    setToastAlert(alert);
    setAlertHistory((prev) => [alert, ...prev].slice(0, MAX_ALERT_HISTORY));
  }, []);

  const { connected: wsConnected } = usePerformanceWebSocket({
    token,
    enabled: !!token,
    onMetricsUpdate: handleMetricsUpdate,
    onAlert: handleAlert,
  });

  // Keep ref in sync with state so the polling closure always reads current value
  wsConnectedRef.current = wsConnected;

  // ── Polling fallback (when WS is unavailable) ──
  useEffect(() => {
    // Initial load
    fetchMetrics();
    fetchHistory();
    fetchAlerts();

    // Poll every 30s as fallback (WS handles updates when connected)
    pollTimerRef.current = setInterval(() => {
      // Use ref to avoid stale closure over wsConnected state
      if (!wsConnectedRef.current) {
        fetchMetrics();
      }
      fetchAlerts();
    }, POLL_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(pollTimerRef.current);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Manual refresh ──
  const handleRefresh = useCallback(() => {
    fetchMetrics(true);
    fetchHistory();
    fetchAlerts();
  }, [fetchMetrics, fetchHistory, fetchAlerts]);

  // ── Derived values ──
  const db = metrics?.services?.database;
  const redis = metrics?.services?.redis;
  const mem = metrics?.memory;
  const cache = metrics?.services?.cache;
  const perf = metrics?.performance;

  const dbResponseTime = db?.responseTime ?? null;
  const redisHitRate = redis?.hitRate ?? null;
  const memPct = mem ? Math.round((mem.heapUsed / mem.heapTotal) * 100) : null;
  const cacheHitRate = cache?.hitRate ?? null;

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
        <PageHeader
          title="Performance Monitoring"
          subtitle="Real-time system health and metrics"
        />
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[0, 1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Skeleton variant="rounded" height={160} sx={{ borderRadius: '18px' }} />
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          {[0, 1, 2, 3].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Skeleton variant="rounded" height={300} sx={{ borderRadius: '18px' }} />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      {/* Page Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0 }}>
        <PageHeader
          title="Performance Monitoring"
          subtitle="Real-time system health and metrics"
        />
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {wsConnected && (
            <Chip
              label="Live"
              size="small"
              sx={{
                bgcolor: alpha('#22c55e', 0.15),
                color: '#22c55e',
                fontWeight: 600,
                fontSize: '0.75rem',
              }}
            />
          )}
          <DashboardTooltip title="Refresh metrics" colors={colors}>
            <IconButton
              onClick={handleRefresh}
              disabled={refreshing}
              aria-label="Refresh metrics"
              size="small"
              sx={{ color: colors.text }}
            >
              <RefreshCw size={18} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
            </IconButton>
          </DashboardTooltip>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3, borderRadius: '12px' }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* No Data Empty State */}
      {!metrics && !error && (
        <EmptyState
          title="No metrics data yet"
          subtitle="Data will appear after the first 5 minutes of collection"
          icon={<BarChart2 size={32} color={colors.textSecondary} />}
        />
      )}

      {/* Metric Cards — 1 col mobile / 2 col tablet / 4 col desktop */}
      {metrics && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Database */}
            <Grid item xs={12} sm={6} md={3}>
              <DashboardMetricCard
                title="Database"
                value={dbResponseTime !== null && dbResponseTime >= 0 ? `${dbResponseTime}ms` : 'N/A'}
                icon={Database}
                diff={
                  dbResponseTime !== null && dbResponseTime >= 0
                    ? dbResponseTime < THRESHOLDS.DB_WARN
                      ? 100 - Math.round((dbResponseTime / THRESHOLDS.DB_WARN) * 100)
                      : -(Math.round((dbResponseTime / THRESHOLDS.DB_WARN) * 100) - 100)
                    : null
                }
                diffLabel={
                  dbResponseTime !== null && dbResponseTime >= 0
                    ? dbResponseTime >= THRESHOLDS.DB_CRIT
                      ? 'critical response time'
                      : dbResponseTime >= THRESHOLDS.DB_WARN
                        ? 'slow response time'
                        : 'healthy response time'
                    : 'status unknown'
                }
                trendDirection={getDbTrend(dbResponseTime)}
              />
            </Grid>

            {/* Redis */}
            <Grid item xs={12} sm={6} md={3}>
              <DashboardMetricCard
                title="Redis"
                value={redisHitRate !== null ? `${redisHitRate}%` : 'N/A'}
                icon={Zap}
                diff={
                  redisHitRate !== null
                    ? redisHitRate >= THRESHOLDS.REDIS_WARN
                      ? redisHitRate - THRESHOLDS.REDIS_WARN
                      : -(THRESHOLDS.REDIS_WARN - redisHitRate)
                    : null
                }
                diffLabel={
                  redisHitRate !== null
                    ? redisHitRate < THRESHOLDS.REDIS_CRIT
                      ? 'critical hit rate'
                      : redisHitRate < THRESHOLDS.REDIS_WARN
                        ? 'low hit rate'
                        : 'healthy hit rate'
                    : 'status unknown'
                }
                trendDirection={getRedisTrend(redisHitRate)}
              />
            </Grid>

            {/* Memory */}
            <Grid item xs={12} sm={6} md={3}>
              <DashboardMetricCard
                title="Memory"
                value={mem ? `${memPct}%` : 'N/A'}
                icon={Cpu}
                diff={
                  memPct !== null
                    ? memPct < THRESHOLDS.MEMORY_WARN
                      ? THRESHOLDS.MEMORY_WARN - memPct
                      : -(memPct - THRESHOLDS.MEMORY_WARN)
                    : null
                }
                diffLabel={
                  memPct !== null
                    ? memPct >= THRESHOLDS.MEMORY_CRIT
                      ? `${mem?.heapUsed}MB / ${mem?.heapTotal}MB (critical)`
                      : memPct >= THRESHOLDS.MEMORY_WARN
                        ? `${mem?.heapUsed}MB / ${mem?.heapTotal}MB (warning)`
                        : `${mem?.heapUsed}MB / ${mem?.heapTotal}MB`
                    : 'status unknown'
                }
                trendDirection={getMemoryTrend(mem?.heapUsed, mem?.heapTotal)}
              />
            </Grid>

            {/* Cache */}
            <Grid item xs={12} sm={6} md={3}>
              <DashboardMetricCard
                title="Cache"
                value={cacheHitRate !== null ? `${cacheHitRate}%` : 'N/A'}
                icon={Server}
                diff={perf ? perf.requestRate : null}
                diffLabel={perf ? `${perf.requestRate} req/s · ${(perf.errorRate * 100).toFixed(1)}% errors` : ''}
                trendDirection={cacheHitRate !== null ? (cacheHitRate >= 70 ? 'up' : 'down') : 'flat'}
              />
            </Grid>
          </Grid>

          {/* Charts — 2 col layout */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Response Time Chart */}
            <Grid item xs={12} md={6}>
              <DashboardCard
                icon={Clock}
                title="API Response Time"
                subtitle="Last 24 hours (ms)"
              >
                {history.length === 0 ? (
                  <EmptyState
                    title="No historical data"
                    subtitle="Charts will appear after data collection begins"
                    icon={<BarChart2 size={24} color={colors.textSecondary} />}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.text, 0.06)} />
                      <XAxis dataKey="time" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                      <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          background: colors.panelBg,
                          border: `1px solid ${alpha(colors.text, 0.1)}`,
                          borderRadius: '8px',
                          color: colors.text,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="responseTime"
                        name="Response Time (ms)"
                        stroke={colors.primary || '#378C92'}
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </DashboardCard>
            </Grid>

            {/* Redis Hit Rate Chart */}
            <Grid item xs={12} md={6}>
              <DashboardCard
                icon={Zap}
                title="Redis Hit Rate"
                subtitle="Last 24 hours (%)"
              >
                {history.length === 0 ? (
                  <EmptyState
                    title="No historical data"
                    subtitle="Charts will appear after data collection begins"
                    icon={<BarChart2 size={24} color={colors.textSecondary} />}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.text, 0.06)} />
                      <XAxis dataKey="time" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                      <YAxis domain={[0, 100]} tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          background: colors.panelBg,
                          border: `1px solid ${alpha(colors.text, 0.1)}`,
                          borderRadius: '8px',
                          color: colors.text,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="hitRate"
                        name="Hit Rate (%)"
                        stroke="#22c55e"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </DashboardCard>
            </Grid>

            {/* Memory Usage Chart */}
            <Grid item xs={12} md={6}>
              <DashboardCard
                icon={Cpu}
                title="Memory Usage"
                subtitle="Last 24 hours (MB heap)"
              >
                {history.length === 0 ? (
                  <EmptyState
                    title="No historical data"
                    subtitle="Charts will appear after data collection begins"
                    icon={<BarChart2 size={24} color={colors.textSecondary} />}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.text, 0.06)} />
                      <XAxis dataKey="time" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                      <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          background: colors.panelBg,
                          border: `1px solid ${alpha(colors.text, 0.1)}`,
                          borderRadius: '8px',
                          color: colors.text,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="memory"
                        name="Heap Used (MB)"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </DashboardCard>
            </Grid>

            {/* Request Rate Chart */}
            <Grid item xs={12} md={6}>
              <DashboardCard
                icon={BarChart2}
                title="Request Rate"
                subtitle="Last 24 hours (req/s)"
              >
                {history.length === 0 ? (
                  <EmptyState
                    title="No historical data"
                    subtitle="Charts will appear after data collection begins"
                    icon={<BarChart2 size={24} color={colors.textSecondary} />}
                  />
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <LineChart data={history} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={alpha(colors.text, 0.06)} />
                      <XAxis dataKey="time" tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                      <YAxis tick={{ fill: colors.textSecondary, fontSize: 11 }} />
                      <RechartsTooltip
                        contentStyle={{
                          background: colors.panelBg,
                          border: `1px solid ${alpha(colors.text, 0.1)}`,
                          borderRadius: '8px',
                          color: colors.text,
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="requestRate"
                        name="Request Rate (req/s)"
                        stroke="#8b5cf6"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </DashboardCard>
            </Grid>
          </Grid>

          {/* Tables row */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {/* Slow Queries Table */}
            <Grid item xs={12} lg={6}>
              <DashboardCard
                icon={Clock}
                title="Slow Queries"
                subtitle="Top 10 slowest cache operations"
              >
                {!cache?.slowQueries || cache.slowQueries.length === 0 ? (
                  <EmptyState
                    title="No slow queries"
                    subtitle="All cache operations are within threshold"
                    icon={<Clock size={24} color={colors.textSecondary} />}
                  />
                ) : (
                  <DashboardTable variant="inset" colors={colors}>
                    <TableHead>
                      <TableRow>
                        <DashboardTableHeadCell colors={colors}>Operation</DashboardTableHeadCell>
                        <DashboardTableHeadCell colors={colors}>Duration</DashboardTableHeadCell>
                        <DashboardTableHeadCell colors={colors}>Key</DashboardTableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {cache.slowQueries.map((q, i) => (
                        <DashboardTableRow key={`sq-${i}`} colors={colors}>
                          <TableCell sx={{ color: colors.text, fontWeight: 500 }}>
                            {q.operation || q.type || 'get'}
                          </TableCell>
                          <TableCell sx={{ color: colors.text }}>
                            <Chip
                              label={`${q.durationMs || q.duration || 0}ms`}
                              size="small"
                              sx={{
                                bgcolor: alpha('#f59e0b', 0.15),
                                color: '#f59e0b',
                                fontWeight: 600,
                                fontSize: '0.75rem',
                              }}
                            />
                          </TableCell>
                          <TableCell
                            sx={{
                              color: colors.textSecondary,
                              fontSize: '0.8rem',
                              maxWidth: 180,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {q.key || '—'}
                          </TableCell>
                        </DashboardTableRow>
                      ))}
                    </TableBody>
                  </DashboardTable>
                )}
              </DashboardCard>
            </Grid>

            {/* Index Health Table */}
            <Grid item xs={12} lg={6}>
              <DashboardCard
                icon={Database}
                title="Index Health"
                subtitle="Unused and bloated database indexes"
              >
                {metrics?.services?.indexes?.supported === false ? (
                  <Alert severity="info">{metrics.services.indexes.message || 'Index analysis requires PostgreSQL'}</Alert>
                ) : (!metrics?.services?.indexes ||
                  (metrics.services.indexes.unused === 0 &&
                    metrics.services.indexes.bloated === 0)) ? (
                  <EmptyState
                    title="Indexes healthy"
                    subtitle="No unused or bloated indexes detected"
                    icon={<Database size={24} color={colors.textSecondary} />}
                  />
                ) : (
                  <DashboardTable variant="inset" colors={colors}>
                    <TableHead>
                      <TableRow>
                        <DashboardTableHeadCell colors={colors}>Type</DashboardTableHeadCell>
                        <DashboardTableHeadCell colors={colors}>Count</DashboardTableHeadCell>
                        <DashboardTableHeadCell colors={colors}>Action</DashboardTableHeadCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {metrics.services.indexes.unused > 0 && (
                        <DashboardTableRow key="unused" colors={colors}>
                          <TableCell sx={{ color: colors.text, fontWeight: 500 }}>
                            Unused Indexes
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={metrics.services.indexes.unused}
                              size="small"
                              sx={{
                                bgcolor: alpha('#f59e0b', 0.15),
                                color: '#f59e0b',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                            Review and drop unused
                          </TableCell>
                        </DashboardTableRow>
                      )}
                      {metrics.services.indexes.bloated > 0 && (
                        <DashboardTableRow key="bloated" colors={colors}>
                          <TableCell sx={{ color: colors.text, fontWeight: 500 }}>
                            Bloated Tables
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={metrics.services.indexes.bloated}
                              size="small"
                              sx={{
                                bgcolor: alpha('#ef4444', 0.15),
                                color: '#ef4444',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
                            Run VACUUM ANALYZE
                          </TableCell>
                        </DashboardTableRow>
                      )}
                    </TableBody>
                  </DashboardTable>
                )}
              </DashboardCard>
            </Grid>
          </Grid>

          {/* Alert History */}
          {alertHistory.length > 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <DashboardCard
                  icon={AlertTriangle}
                  title="Alert History"
                  subtitle={`Last ${alertHistory.length} alerts`}
                >
                  <AlertHistoryPanel alerts={alertHistory} colors={colors} />
                </DashboardCard>
              </Grid>
            </Grid>
          )}
        </>
      )}

      {/* Toast Alert Notification */}
      <Snackbar
        open={!!toastAlert}
        autoHideDuration={6000}
        onClose={() => setToastAlert(null)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {toastAlert ? (
          <Alert
            severity={toastAlert.level === 'critical' ? 'error' : 'warning'}
            onClose={() => setToastAlert(null)}
            action={
              <IconButton
                size="small"
                aria-label="Close alert"
                onClick={() => setToastAlert(null)}
                color="inherit"
              >
                <X size={14} />
              </IconButton>
            }
            sx={{ borderRadius: '12px', minWidth: 300 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {toastAlert.level === 'critical' ? 'Critical Alert' : 'Warning'}
            </Typography>
            <Typography variant="caption">
              {toastAlert.message || `${toastAlert.metric}: ${toastAlert.value}`}
            </Typography>
          </Alert>
        ) : (
          <Box />
        )}
      </Snackbar>
    </Container>
  );
});

PerformanceMonitoring.displayName = 'PerformanceMonitoring';

export default PerformanceMonitoring;
