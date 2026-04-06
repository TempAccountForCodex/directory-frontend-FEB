import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Skeleton,
  Alert,
  Divider,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  ButtonGroup,
  Stack,
  Tooltip,
  IconButton,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Gift,
  MousePointerClick,
  UserPlus,
  ArrowRightLeft,
  DollarSign,
  Flag,
  FlagOff,
  ShieldAlert,
  TrendingUp,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flex: 1,
  minWidth: 140,
}));

const PERIODS = [
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: '90 days', value: '90d' },
  { label: 'All time', value: 'all' },
];

const ReferralAnalytics = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [analytics, setAnalytics] = useState(null);
  const [period, setPeriod] = useState('30d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  const fetchAnalytics = useCallback(async (p) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API_URL}/referral/admin/analytics?period=${p}`, {
        withCredentials: true,
      });
      setAnalytics(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load referral analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [period, fetchAnalytics]);

  const handleToggleFlag = useCallback(
    async (codeId, currentlyFlagged) => {
      setActionLoading(codeId);
      try {
        await axios.put(
          `${API_URL}/referral/admin/codes/${codeId}`,
          { flagged: !currentlyFlagged },
          { withCredentials: true }
        );
        fetchAnalytics(period);
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed');
      } finally {
        setActionLoading(null);
      }
    },
    [period, fetchAnalytics]
  );

  const handleToggleActive = useCallback(
    async (codeId, currentlyActive) => {
      setActionLoading(codeId);
      try {
        await axios.put(
          `${API_URL}/referral/admin/codes/${codeId}`,
          { isActive: !currentlyActive },
          { withCredentials: true }
        );
        fetchAnalytics(period);
      } catch (err) {
        setError(err.response?.data?.message || 'Action failed');
      } finally {
        setActionLoading(null);
      }
    },
    [period, fetchAnalytics]
  );

  const funnelMetrics = useMemo(() => {
    if (!analytics) return [];
    const { funnel } = analytics;
    const clickToSignup = funnel.CLICK > 0 ? ((funnel.SIGNUP / funnel.CLICK) * 100).toFixed(1) : '0';
    const signupToConversion = funnel.SIGNUP > 0 ? ((funnel.CONVERSION / funnel.SIGNUP) * 100).toFixed(1) : '0';

    return [
      { label: 'Total Clicks', value: funnel.CLICK, icon: MousePointerClick, color: '#3b82f6', rate: null },
      { label: 'Signups', value: funnel.SIGNUP, icon: UserPlus, color: '#8b5cf6', rate: `${clickToSignup}% of clicks` },
      { label: 'Conversions', value: funnel.CONVERSION, icon: ArrowRightLeft, color: '#10b981', rate: `${signupToConversion}% of signups` },
      {
        label: 'Credit Liability',
        value: `$${((analytics.creditLiabilityCents || 0) / 100).toFixed(2)}`,
        icon: DollarSign,
        color: '#f59e0b',
        rate: 'pending credits',
      },
    ];
  }, [analytics]);

  const statusChipColors = useMemo(
    () => ({
      applied: { bg: alpha('#10b981', 0.15), text: '#10b981' },
      pending: { bg: alpha('#f59e0b', 0.15), text: '#f59e0b' },
      expired: { bg: alpha('#ef4444', 0.15), text: '#ef4444' },
    }),
    []
  );

  if (loading && !analytics) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
        <Skeleton variant="rounded" height={60} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={100} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={300} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error && !analytics) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <TrendingUp size={22} color={colors.primary} />
          <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700 }}>
            Referral Program Analytics
          </Typography>
        </Box>
        <ButtonGroup size="small" variant="outlined">
          {PERIODS.map((p) => (
            <Button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              variant={period === p.value ? 'contained' : 'outlined'}
              sx={{
                textTransform: 'none',
                fontWeight: period === p.value ? 700 : 400,
              }}
            >
              {p.label}
            </Button>
          ))}
        </ButtonGroup>
      </Box>

      {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Funnel Metrics */}
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        {funnelMetrics.map((m) => (
          <MetricCard
            key={m.label}
            elevation={0}
            sx={{ bgcolor: colors.bgCard, border: `1px solid ${colors.border}` }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                bgcolor: alpha(m.color, 0.12),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <m.icon size={18} color={m.color} />
            </Box>
            <Typography variant="h5" sx={{ color: colors.text, fontWeight: 700, mt: 0.5 }}>
              {m.value}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {m.label}
            </Typography>
            {m.rate && (
              <Typography variant="caption" sx={{ color: alpha(m.color, 0.8), fontSize: '0.65rem' }}>
                {m.rate}
              </Typography>
            )}
          </MetricCard>
        ))}
      </Stack>

      {/* Top Referrers */}
      <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: colors.bgCard, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Gift size={18} color={colors.primary} />
          <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 700 }}>
            Top Referrers
          </Typography>
        </Box>
        <Divider sx={{ borderColor: colors.border }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>User</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Code</TableCell>
                <TableCell align="center" sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Clicks</TableCell>
                <TableCell align="center" sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Signups</TableCell>
                <TableCell align="center" sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Conversions</TableCell>
                <TableCell align="center" sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Status</TableCell>
                <TableCell align="center" sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!analytics?.topReferrers || analytics.topReferrers.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4, color: colors.textSecondary, borderColor: colors.border }}>
                    No referrers found for this period.
                  </TableCell>
                </TableRow>
              ) : (
                analytics.topReferrers.map((r) => (
                  <TableRow key={r.code}>
                    <TableCell sx={{ color: colors.text, borderColor: colors.border }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{r.name}</Typography>
                      <Typography variant="caption" sx={{ color: colors.textSecondary }}>{r.email}</Typography>
                    </TableCell>
                    <TableCell sx={{ color: colors.text, fontFamily: 'monospace', borderColor: colors.border }}>{r.code}</TableCell>
                    <TableCell align="center" sx={{ color: colors.text, borderColor: colors.border }}>{r.clickCount}</TableCell>
                    <TableCell align="center" sx={{ color: colors.text, borderColor: colors.border }}>{r.signupCount}</TableCell>
                    <TableCell align="center" sx={{ color: colors.text, borderColor: colors.border }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#10b981' }}>{r.conversionCount}</Typography>
                    </TableCell>
                    <TableCell align="center" sx={{ borderColor: colors.border }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        {!r.isActive && (
                          <Chip label="Disabled" size="small" sx={{ bgcolor: alpha('#ef4444', 0.15), color: '#ef4444', fontWeight: 600, fontSize: '0.65rem' }} />
                        )}
                        {r.flaggedAt && (
                          <Chip label="Flagged" size="small" sx={{ bgcolor: alpha('#f59e0b', 0.15), color: '#f59e0b', fontWeight: 600, fontSize: '0.65rem' }} />
                        )}
                        {r.isActive && !r.flaggedAt && (
                          <Chip label="Active" size="small" sx={{ bgcolor: alpha('#10b981', 0.15), color: '#10b981', fontWeight: 600, fontSize: '0.65rem' }} />
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell align="center" sx={{ borderColor: colors.border }}>
                      <Stack direction="row" spacing={0.5} justifyContent="center">
                        <Tooltip title={r.flaggedAt ? 'Unflag' : 'Flag for review'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleFlag(r.userId, !!r.flaggedAt)}
                            disabled={actionLoading === r.userId}
                          >
                            {r.flaggedAt ? <FlagOff size={16} color="#f59e0b" /> : <Flag size={16} color={colors.textSecondary} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={r.isActive ? 'Disable code' : 'Enable code'}>
                          <IconButton
                            size="small"
                            onClick={() => handleToggleActive(r.userId, r.isActive)}
                            disabled={actionLoading === r.userId}
                          >
                            <ShieldAlert size={16} color={r.isActive ? colors.textSecondary : '#ef4444'} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Reward Ledger */}
      <Paper elevation={0} sx={{ borderRadius: 3, bgcolor: colors.bgCard, border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          <DollarSign size={18} color={colors.primary} />
          <Typography variant="subtitle1" sx={{ color: colors.text, fontWeight: 700 }}>
            Reward Ledger
          </Typography>
        </Box>
        <Divider sx={{ borderColor: colors.border }} />
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Date</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Referrer</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Recipient</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Type</TableCell>
                <TableCell align="right" sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Amount</TableCell>
                <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(!analytics?.rewardLedger || analytics.rewardLedger.length === 0) ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4, color: colors.textSecondary, borderColor: colors.border }}>
                    No rewards issued in this period.
                  </TableCell>
                </TableRow>
              ) : (
                analytics.rewardLedger.map((r) => {
                  const sc = statusChipColors[r.status] || statusChipColors.pending;
                  return (
                    <TableRow key={r.id}>
                      <TableCell sx={{ color: colors.text, borderColor: colors.border }}>
                        {new Date(r.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: colors.text, borderColor: colors.border }}>
                        {r.referrerName}
                      </TableCell>
                      <TableCell sx={{ color: colors.text, borderColor: colors.border }}>
                        {r.recipientName}
                      </TableCell>
                      <TableCell sx={{ color: colors.text, borderColor: colors.border }}>
                        {r.rewardType === 'REFERRER_CREDIT' ? 'Credit' : 'Discount'}
                      </TableCell>
                      <TableCell align="right" sx={{ color: colors.text, fontWeight: 600, borderColor: colors.border }}>
                        {r.rewardType === 'REFERRER_CREDIT'
                          ? `$${(r.rewardValueCents / 100).toFixed(2)}`
                          : '20% off'}
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.border }}>
                        <Chip
                          label={r.status}
                          size="small"
                          sx={{ bgcolor: sc.bg, color: sc.text, fontWeight: 600, fontSize: '0.65rem' }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default ReferralAnalytics;
