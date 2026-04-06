/**
 * PromoDealManager — Step 10.36
 *
 * Super Admin panel for creating and managing platform promo deals.
 *
 * Features:
 * - Deal list with status chips (Active/Scheduled/Expired/Deactivated)
 * - Create deal modal with full form validation
 * - Deactivate with confirmation dialog
 * - Metrics panel on row expand
 * - Loading skeleton / error / empty states
 * - Responsive: single-column form on mobile, horizontal scroll table
 */

import { useState, useCallback, useEffect, memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Collapse from '@mui/material/Collapse';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { alpha } from '@mui/material/styles';
import {
  Tag as PromoIcon,
  Plus as PlusIcon,
  ChartBar as MetricsIcon,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  PageHeader,
  DashboardCard,
  DashboardTable,
  DashboardInput,
  DashboardSelect,
  DashboardDateField,
  DashboardGradientButton,
  DashboardConfirmButton,
  DashboardCancelButton,
  DashboardActionButton,
  DashboardMetricCard,
  EmptyState,
} from './shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDealStatus(deal) {
  const now = new Date();
  if (!deal.isActive) return 'deactivated';
  if (new Date(deal.startAt) > now) return 'scheduled';
  if (new Date(deal.endAt) < now) return 'expired';
  return 'active';
}

function getStatusChip(status, colors) {
  const styles = {
    active: { label: 'Active', bg: colors.success || '#22c55e', color: '#fff' },
    scheduled: { label: 'Scheduled', bg: colors.primary, color: '#fff' },
    expired: { label: 'Expired', bg: alpha(colors.text, 0.3), color: colors.text },
    deactivated: { label: 'Deactivated', bg: colors.error || '#ef4444', color: '#fff' },
  };
  const s = styles[status] || styles.expired;
  return (
    <Chip
      label={s.label}
      size="small"
      sx={{
        background: s.bg,
        color: s.color,
        fontWeight: 600,
        fontSize: '0.75rem',
        height: 22,
      }}
    />
  );
}

function formatDiscount(deal) {
  if (deal.discountType === 'PERCENTAGE') return `${deal.discountValue}% Off`;
  if (deal.discountType === 'FLAT_AMOUNT') return `$${deal.discountValue} Off`;
  return 'Free Month';
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ─── Metrics Panel ────────────────────────────────────────────────────────────

const MetricsPanel = memo(({ dealId, colors }) => {
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetched, setFetched] = useState(false);

  const fetchMetrics = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/promo/admin/deals/${dealId}/metrics`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setMetrics(res.data.metrics);
      setFetched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [dealId, fetched]);

  // Fetch metrics on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchMetrics(); }, [dealId]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', gap: 2, py: 1, flexWrap: 'wrap' }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} variant="rectangular" width={140} height={70} sx={{ borderRadius: 2 }} />
        ))}
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>;
  }

  if (!metrics) return null;

  return (
    <Grid container spacing={2} sx={{ py: 1 }}>
      <Grid item xs={6} sm={3}>
        <DashboardMetricCard
          title="Total Redeemed"
          value={metrics.totalRedeemed?.toString() ?? '0'}
          icon={PromoIcon}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <DashboardMetricCard
          title="Remaining Slots"
          value={metrics.remainingSlots !== null ? metrics.remainingSlots?.toString() : '∞'}
          icon={MetricsIcon}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <DashboardMetricCard
          title="Conversion Rate"
          value={metrics.conversionRate ?? '0%'}
          icon={MetricsIcon}
        />
      </Grid>
      <Grid item xs={6} sm={3}>
        <DashboardMetricCard
          title="Est. Revenue Impact"
          value={metrics.estRevenueImpact ?? '$0.00'}
          icon={MetricsIcon}
        />
      </Grid>
    </Grid>
  );
});

MetricsPanel.displayName = 'MetricsPanel';

// ─── Create Deal Form ─────────────────────────────────────────────────────────

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: '% Off' },
  { value: 'FLAT_AMOUNT', label: '$ Off' },
  { value: 'FREE_MONTH', label: 'Free Month' },
];

const SEGMENT_OPTIONS = [
  { value: 'ALL', label: 'All Users' },
  { value: 'FREE_PLAN', label: 'Free Plan Only' },
  { value: 'PAID_PLANS', label: 'Paid Plans Only' },
  { value: 'NEW_SIGNUPS_30_DAYS', label: 'New Signups ≤30 days' },
];

const EMPTY_FORM = {
  name: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  startAt: '',
  endAt: '',
  maxRedemptions: '',
  targetSegment: 'ALL',
  promoCode: '',
  bannerText: '',
  showTopBar: true,
  showOnFeatureGates: false,
  countdownEnabled: true,
};

function validateForm(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Deal name is required';
  if (form.discountType !== 'FREE_MONTH' && (!form.discountValue || parseFloat(form.discountValue) <= 0)) {
    errors.discountValue = 'Must be greater than 0';
  }
  if (form.discountType === 'PERCENTAGE' && parseFloat(form.discountValue) > 100) {
    errors.discountValue = 'Percentage cannot exceed 100';
  }
  if (!form.startAt) errors.startAt = 'Start date is required';
  if (!form.endAt) errors.endAt = 'End date is required';
  if (form.startAt && form.endAt && new Date(form.endAt) <= new Date(form.startAt)) {
    errors.endAt = 'End date must be after start date';
  }
  if (!form.promoCode.trim()) errors.promoCode = 'Promo code is required';
  if (form.promoCode && !/^[A-Z0-9_-]{2,50}$/.test(form.promoCode.toUpperCase())) {
    errors.promoCode = 'Only letters, numbers, hyphens and underscores (2-50 chars)';
  }
  return errors;
}

// ─── Main Component ───────────────────────────────────────────────────────────

const PromoDealManager = ({ user, pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [deals, setDeals] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasFetched, setHasFetched] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [deactivateTargetId, setDeactivateTargetId] = useState(null);
  const [deactivating, setDeactivating] = useState(false);

  const [expandedRow, setExpandedRow] = useState(null);

  // Load deals on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchDeals(); }, []);

  async function fetchDeals() {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/promo/admin/deals?limit=50&offset=0`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setDeals(res.data.deals || []);
      setTotal(res.data.total || 0);
      setHasFetched(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load promo deals');
    } finally {
      setLoading(false);
    }
  }

  const handleFormChange = useCallback((field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Auto-uppercase promo code
      if (field === 'promoCode') next.promoCode = value.toUpperCase();
      return next;
    });
    // Clear field error on change
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleCreate = async () => {
    const errors = validateForm(form);
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: form.name.trim(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        startAt: form.startAt,
        endAt: form.endAt,
        targetSegment: form.targetSegment,
        promoCode: form.promoCode.toUpperCase(),
        bannerConfig: {
          bannerText: form.bannerText.trim() || undefined,
          showTopBar: form.showTopBar,
          showOnFeatureGate: form.showOnFeatureGates,
          countdownEnabled: form.countdownEnabled,
          showOnPages: 'all',
        },
      };
      if (form.maxRedemptions) {
        payload.maxRedemptions = parseInt(form.maxRedemptions, 10);
      }

      await axios.post(`${API_URL}/promo/admin/deals`, payload, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      setSuccessMsg('Deal created successfully!');
      setCreateOpen(false);
      setForm(EMPTY_FORM);
      setFormErrors({});
      await fetchDeals();

      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to create deal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!deactivateTargetId) return;
    setDeactivating(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/promo/admin/deals/${deactivateTargetId}/deactivate`, {}, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setDeactivateTargetId(null);
      await fetchDeals();
      setSuccessMsg('Deal deactivated.');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setSubmitError(err.response?.data?.message || 'Failed to deactivate deal');
    } finally {
      setDeactivating(false);
    }
  };

  // ─── Render states ──────────────────────────────────────────────────────────

  const renderTableBody = () => {
    if (loading) {
      return Array.from({ length: 4 }).map((_, i) => (
        <TableRow key={i}>
          {[1, 2, 3, 4, 5, 6, 7].map((j) => (
            <TableCell key={j}>
              <Skeleton variant="text" width="80%" />
            </TableCell>
          ))}
        </TableRow>
      ));
    }

    if (!loading && hasFetched && deals.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} sx={{ border: 'none', py: 4 }}>
            <EmptyState
              title="No promo deals yet"
              subtitle='Create your first deal by clicking "New Deal"'
              icon={PromoIcon}
            />
          </TableCell>
        </TableRow>
      );
    }

    return deals.map((deal) => {
      const status = getDealStatus(deal);
      const isExpanded = expandedRow === deal.id;

      return [
        <TableRow
          key={deal.id}
          onClick={() => setExpandedRow(isExpanded ? null : deal.id)}
          sx={{
            cursor: 'pointer',
            '&:hover': { background: alpha(colors.primary, 0.05) },
          }}
        >
          <TableCell sx={{ color: colors.text, fontWeight: 600 }}>{deal.name}</TableCell>
          <TableCell>
            <Box
              component="code"
              sx={{
                background: alpha(colors.primary, 0.1),
                color: colors.primary,
                px: 1,
                py: 0.25,
                borderRadius: 1,
                fontSize: '0.8rem',
                fontWeight: 700,
                fontFamily: 'monospace',
              }}
            >
              {deal.promoCode}
            </Box>
          </TableCell>
          <TableCell sx={{ color: colors.text }}>{formatDiscount(deal)}</TableCell>
          <TableCell sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
            {deal.targetSegment === 'ALL' ? 'All Users' : deal.targetSegment.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())}
          </TableCell>
          <TableCell sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{formatDate(deal.startAt)}</TableCell>
          <TableCell sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>{formatDate(deal.endAt)}</TableCell>
          <TableCell sx={{ color: colors.textSecondary, fontSize: '0.8rem' }}>
            {deal.maxRedemptions !== null && deal.maxRedemptions !== undefined
              ? `${deal.redeemedCount}/${deal.maxRedemptions}`
              : `${deal.redeemedCount}/∞`}
          </TableCell>
          <TableCell>{getStatusChip(status, colors)}</TableCell>
          <TableCell>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              {status === 'active' || status === 'scheduled' ? (
                <DashboardConfirmButton
                  tone="danger"
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeactivateTargetId(deal.id);
                  }}
                  aria-label={`Deactivate deal ${deal.name}`}
                  sx={{ py: 0.5, px: 1.5, fontSize: '0.75rem' }}
                >
                  Deactivate
                </DashboardConfirmButton>
              ) : null}
              <Box sx={{ color: alpha(colors.text, 0.5) }}>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </Box>
            </Box>
          </TableCell>
        </TableRow>,
        // Expanded metrics row
        isExpanded ? (
          <TableRow key={`${deal.id}-metrics`}>
            <TableCell colSpan={9} sx={{ py: 0, border: 'none', background: alpha(colors.primary, 0.03) }}>
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ px: 3, py: 2 }}>
                  <MetricsPanel dealId={deal.id} colors={colors} />
                </Box>
              </Collapse>
            </TableCell>
          </TableRow>
        ) : null,
      ];
    });
  };

  // ─── JSX ────────────────────────────────────────────────────────────────────

  return (
    <Box>
      <PageHeader
        title={pageTitle || 'Promo Deals'}
        subtitle={pageSubtitle || 'Create and manage time-limited flash deals'}
        action={
          <DashboardActionButton
            startIcon={<PlusIcon size={16} />}
            onClick={() => {
              setForm(EMPTY_FORM);
              setFormErrors({});
              setSubmitError(null);
              setCreateOpen(true);
            }}
            aria-label="Create new promo deal"
          >
            New Deal
          </DashboardActionButton>
        }
      />

      {/* Success notification */}
      {successMsg && (
        <Alert
          severity="success"
          onClose={() => setSuccessMsg(null)}
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {successMsg}
        </Alert>
      )}

      {/* Error state */}
      {error && !loading && (
        <Alert
          severity="error"
          action={
            <DashboardActionButton size="small" onClick={fetchDeals}>
              Retry
            </DashboardActionButton>
          }
          sx={{ mb: 2, borderRadius: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Deal List Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <DashboardTable
          variant="inset"
          colors={colors}
          containerSx={{ borderRadius: 3 }}
        >
          <TableHead>
            <TableRow>
              {['Name', 'Code', 'Discount', 'Segment', 'Start', 'End', 'Redeemed', 'Status', 'Actions'].map(
                (col) => (
                  <TableCell
                    key={col}
                    sx={{
                      color: alpha(colors.text, 0.6),
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {col}
                  </TableCell>
                ),
              )}
            </TableRow>
          </TableHead>
          <TableBody>{renderTableBody()}</TableBody>
        </DashboardTable>
      </Box>

      {/* Deactivate Confirmation Dialog */}
      <Dialog
        open={!!deactivateTargetId}
        onClose={() => setDeactivateTargetId(null)}
        maxWidth="xs"
        fullWidth
        aria-labelledby="deactivate-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: colors.panelBg,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle id="deactivate-dialog-title" sx={{ color: colors.text, fontWeight: 700 }}>
          Deactivate Promo Deal?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            This will immediately deactivate the promo deal and disable the Stripe promotion code.
            Users will no longer be able to redeem it.
          </Typography>
          {submitError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {submitError}
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <DashboardCancelButton
            onClick={() => { setDeactivateTargetId(null); setSubmitError(null); }}
          >
            Cancel
          </DashboardCancelButton>
          <DashboardConfirmButton
            tone="danger"
            onClick={handleDeactivate}
            disabled={deactivating}
            aria-label="Confirm deactivation"
          >
            {deactivating ? 'Deactivating…' : 'Deactivate'}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>

      {/* Create Deal Modal */}
      <Dialog
        open={createOpen}
        onClose={() => { setCreateOpen(false); setSubmitError(null); }}
        maxWidth="md"
        fullWidth
        aria-labelledby="create-deal-dialog-title"
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: colors.panelBg,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle id="create-deal-dialog-title" sx={{ color: colors.text, fontWeight: 700 }}>
          Create New Promo Deal
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Grid container spacing={2.5}>
              {/* Deal Name */}
              <Grid item xs={12} sm={8}>
                <DashboardInput
                  label="Deal Name"
                  value={form.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  inputProps={{ maxLength: 120 }}
                  fullWidth
                  required
                  aria-required="true"
                />
              </Grid>

              {/* Discount Type */}
              <Grid item xs={12} sm={4}>
                <DashboardSelect
                  label="Discount Type"
                  value={form.discountType}
                  onChange={(e) => handleFormChange('discountType', e.target.value)}
                  options={DISCOUNT_TYPE_OPTIONS}
                  fullWidth
                />
              </Grid>

              {/* Discount Value */}
              <Grid item xs={12} sm={4}>
                <DashboardInput
                  label={form.discountType === 'FLAT_AMOUNT' ? 'Amount ($)' : form.discountType === 'FREE_MONTH' ? 'Value (ignored for Free Month)' : 'Percentage (%)'}
                  value={form.discountValue}
                  onChange={(e) => handleFormChange('discountValue', e.target.value)}
                  error={!!formErrors.discountValue}
                  helperText={formErrors.discountValue}
                  type="number"
                  inputProps={{ min: 0.01, step: 0.01 }}
                  fullWidth
                  required
                  disabled={form.discountType === 'FREE_MONTH'}
                  aria-required="true"
                />
              </Grid>

              {/* Start Date */}
              <Grid item xs={12} sm={4}>
                <DashboardDateField
                  label="Start Date"
                  value={form.startAt}
                  onChange={(e) => handleFormChange('startAt', e.target.value)}
                  error={!!formErrors.startAt}
                  helperText={formErrors.startAt}
                  fullWidth
                  required
                  aria-required="true"
                />
              </Grid>

              {/* End Date */}
              <Grid item xs={12} sm={4}>
                <DashboardDateField
                  label="End Date"
                  value={form.endAt}
                  onChange={(e) => handleFormChange('endAt', e.target.value)}
                  error={!!formErrors.endAt}
                  helperText={formErrors.endAt}
                  fullWidth
                  required
                  aria-required="true"
                />
              </Grid>

              {/* Max Redemptions */}
              <Grid item xs={12} sm={4}>
                <DashboardInput
                  label="Max Redemptions (optional)"
                  value={form.maxRedemptions}
                  onChange={(e) => handleFormChange('maxRedemptions', e.target.value)}
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  fullWidth
                  placeholder="Unlimited"
                />
              </Grid>

              {/* Target Segment */}
              <Grid item xs={12} sm={4}>
                <DashboardSelect
                  label="Target Segment"
                  value={form.targetSegment}
                  onChange={(e) => handleFormChange('targetSegment', e.target.value)}
                  options={SEGMENT_OPTIONS}
                  fullWidth
                />
              </Grid>

              {/* Promo Code */}
              <Grid item xs={12} sm={4}>
                <DashboardInput
                  label="Promo Code"
                  value={form.promoCode}
                  onChange={(e) => handleFormChange('promoCode', e.target.value)}
                  error={!!formErrors.promoCode}
                  helperText={formErrors.promoCode || 'Auto-uppercased'}
                  inputProps={{ maxLength: 50 }}
                  fullWidth
                  required
                  aria-required="true"
                />
              </Grid>

              {/* Banner Text */}
              <Grid item xs={12}>
                <DashboardInput
                  label="Banner Text (optional, max 120 chars)"
                  value={form.bannerText}
                  onChange={(e) => handleFormChange('bannerText', e.target.value.slice(0, 120))}
                  fullWidth
                  placeholder="e.g. Summer Sale — 30% off all plans!"
                  helperText={`${form.bannerText.length}/120`}
                />
              </Grid>

              {/* Toggles */}
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.showTopBar}
                      onChange={(e) => handleFormChange('showTopBar', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      Show Top Bar Banner
                    </Typography>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.showOnFeatureGates}
                      onChange={(e) => handleFormChange('showOnFeatureGates', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      Show on Feature Gates
                    </Typography>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={form.countdownEnabled}
                      onChange={(e) => handleFormChange('countdownEnabled', e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={{ color: colors.text }}>
                      Countdown Timer
                    </Typography>
                  }
                />
              </Grid>
            </Grid>

            {/* Submit error */}
            {submitError && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, gap: 1 }}>
          <DashboardCancelButton
            onClick={() => { setCreateOpen(false); setSubmitError(null); }}
          >
            Cancel
          </DashboardCancelButton>
          <DashboardGradientButton
            onClick={handleCreate}
            disabled={submitting}
            aria-label="Submit new promo deal"
          >
            {submitting ? 'Creating…' : 'Create Deal'}
          </DashboardGradientButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PromoDealManager;
