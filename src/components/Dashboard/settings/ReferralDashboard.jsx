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
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
  Copy,
  Check,
  Gift,
  MousePointerClick,
  UserPlus,
  ArrowRightLeft,
  DollarSign,
  Mail,
  Share2,
  ExternalLink,
} from 'lucide-react';
import axios from 'axios';
import { DashboardCard } from '../shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const MetricCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2.5),
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  flex: 1,
  minWidth: 120,
}));

const CopyButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 8,
  padding: theme.spacing(1),
}));

const ReferralDashboard = ({ colors }) => {
  const [stats, setStats] = useState(null);
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, rewardsRes] = await Promise.all([
        axios.get(`${API_URL}/referral/my-code`, { withCredentials: true }),
        axios.get(`${API_URL}/referral/rewards?limit=10`, { withCredentials: true }),
      ]);
      setStats(statsRes.data);
      setRewards(rewardsRes.data.rewards || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load referral data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCopy = useCallback(async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, []);

  const handleShareEmail = useCallback(() => {
    if (!stats?.shareUrl) return;
    const subject = encodeURIComponent('Join Techietribe Directory!');
    const body = encodeURIComponent(
      `Hey! Check out Techietribe Directory — use my referral link to get 20% off your first month:\n\n${stats.shareUrl}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_self');
  }, [stats?.shareUrl]);

  const handleShareTwitter = useCallback(() => {
    if (!stats?.shareUrl) return;
    const text = encodeURIComponent(
      `Build your business directory with @techietribe! Use my link to get 20% off 🚀 ${stats.shareUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank', 'noopener');
  }, [stats?.shareUrl]);

  const metrics = useMemo(() => {
    if (!stats) return [];
    return [
      { label: 'Clicks', value: stats.clickCount || 0, icon: MousePointerClick, color: '#3b82f6' },
      { label: 'Signups', value: stats.signupCount || 0, icon: UserPlus, color: '#8b5cf6' },
      { label: 'Conversions', value: stats.conversionCount || 0, icon: ArrowRightLeft, color: '#10b981' },
      {
        label: 'Credits Earned',
        value: `$${((stats.totalCreditsCents || 0) / 100).toFixed(2)}`,
        icon: DollarSign,
        color: '#f59e0b',
      },
    ];
  }, [stats]);

  const statusColors = useMemo(
    () => ({
      applied: { bg: alpha('#10b981', 0.15), text: '#10b981' },
      pending: { bg: alpha('#f59e0b', 0.15), text: '#f59e0b' },
      expired: { bg: alpha('#ef4444', 0.15), text: '#ef4444' },
    }),
    []
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rounded" height={120} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={80} sx={{ borderRadius: 3 }} />
        <Skeleton variant="rounded" height={200} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return (
      <DashboardCard icon={Gift} title="Referrals">
        <Typography variant="body2" sx={{ color: colors.textSecondary }}>
          Your referral code is being set up. Please refresh in a moment.
        </Typography>
      </DashboardCard>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Referral Code & Share */}
      <DashboardCard icon={Gift} title="Your Referral Link">
        <Divider sx={{ mb: 2, opacity: 0.8 }} />
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
          Share your unique referral link. When someone signs up and upgrades to a paid plan, you earn a{' '}
          <strong>$10 credit</strong> and they get <strong>20% off</strong> their first month.
        </Typography>

        {/* Code display + copy */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: alpha(colors.primary || '#6366f1', 0.08),
            border: `1px solid ${alpha(colors.primary || '#6366f1', 0.2)}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 2,
          }}
        >
          <Box sx={{ overflow: 'hidden', mr: 1 }}>
            <Typography
              variant="caption"
              sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}
            >
              Your referral link
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: colors.text,
                fontFamily: 'monospace',
                fontWeight: 600,
                wordBreak: 'break-all',
              }}
            >
              {stats.shareUrl}
            </Typography>
          </Box>
          <Tooltip title={copied ? 'Copied!' : 'Copy link'}>
            <CopyButton onClick={() => handleCopy(stats.shareUrl)} size="small">
              {copied ? (
                <Check size={18} color="#10b981" />
              ) : (
                <Copy size={18} color={colors.textSecondary} />
              )}
            </CopyButton>
          </Tooltip>
        </Paper>

        {/* Share buttons */}
        <Stack direction="row" spacing={1.5}>
          <Tooltip title="Share via email">
            <IconButton
              onClick={handleShareEmail}
              sx={{
                borderRadius: 2,
                bgcolor: alpha(colors.text || '#fff', 0.06),
                '&:hover': { bgcolor: alpha(colors.text || '#fff', 0.12) },
              }}
            >
              <Mail size={18} color={colors.textSecondary} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share on X (Twitter)">
            <IconButton
              onClick={handleShareTwitter}
              sx={{
                borderRadius: 2,
                bgcolor: alpha(colors.text || '#fff', 0.06),
                '&:hover': { bgcolor: alpha(colors.text || '#fff', 0.12) },
              }}
            >
              <ExternalLink size={18} color={colors.textSecondary} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Copy referral code">
            <IconButton
              onClick={() => handleCopy(stats.code)}
              sx={{
                borderRadius: 2,
                bgcolor: alpha(colors.text || '#fff', 0.06),
                '&:hover': { bgcolor: alpha(colors.text || '#fff', 0.12) },
              }}
            >
              <Share2 size={18} color={colors.textSecondary} />
            </IconButton>
          </Tooltip>
        </Stack>
      </DashboardCard>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
        {metrics.map((m) => (
          <MetricCard
            key={m.label}
            elevation={0}
            sx={{
              bgcolor: colors.bgCard,
              border: `1px solid ${colors.border}`,
            }}
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
            <Typography
              variant="h5"
              sx={{ color: colors.text, fontWeight: 700, mt: 0.5 }}
            >
              {m.value}
            </Typography>
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {m.label}
            </Typography>
          </MetricCard>
        ))}
      </Stack>

      {/* Reward History */}
      <DashboardCard icon={DollarSign} title="Reward History">
        <Divider sx={{ mb: 2, opacity: 0.8 }} />
        {rewards.length === 0 ? (
          <Typography variant="body2" sx={{ color: colors.textSecondary, py: 2, textAlign: 'center' }}>
            No rewards yet. Share your referral link to start earning!
          </Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Date</TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Type</TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Value</TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontWeight: 600, borderColor: colors.border }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rewards.map((r) => {
                  const sc = statusColors[r.status] || statusColors.pending;
                  return (
                    <TableRow key={r.id}>
                      <TableCell sx={{ color: colors.text, borderColor: colors.border }}>
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ color: colors.text, borderColor: colors.border }}>
                        {r.rewardType === 'REFERRER_CREDIT' ? 'Credit earned' : 'Discount received'}
                      </TableCell>
                      <TableCell sx={{ color: colors.text, borderColor: colors.border }}>
                        {r.rewardType === 'REFERRER_CREDIT'
                          ? `$${(r.rewardValueCents / 100).toFixed(2)}`
                          : '20% off'}
                      </TableCell>
                      <TableCell sx={{ borderColor: colors.border }}>
                        <Chip
                          label={r.status}
                          size="small"
                          sx={{
                            bgcolor: sc.bg,
                            color: sc.text,
                            fontWeight: 600,
                            fontSize: '0.7rem',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DashboardCard>
    </Box>
  );
};

export default ReferralDashboard;
