import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import {
  Box,
  Button,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Chip,
  Typography,
  Alert,
  Snackbar,
  Pagination,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  Switch,
  FormControlLabel,
  alpha,
  TablePagination,
  CircularProgress,
  InputAdornment,
  Stack,
  Tabs,
  Tab,
  Divider,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import {
  Plus as AddIcon,
  Pencil as EditIcon,
  Trash2 as DeleteIcon,
  Ban as BlockIcon,
  CircleCheck as ActiveIcon,
  User as PersonIcon,
  ShieldCheck as AdminIcon,
  PenLine as CreatorIcon,
  Crown as SuperAdminIcon,
  Upload as UploadIcon,
  Search as SearchIcon,
  Eye,
  EyeOff,
  CreditCard,
  ReceiptText,
  Clock,
  DollarSign,
  Undo2,
  Gift,
  ShieldAlert,
} from 'lucide-react';
import PeopleIcon from '@mui/icons-material/People';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import CreateIcon from '@mui/icons-material/Create';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import axios from 'axios';
import { getDashboardColors } from '../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../context/ThemeContext';
import {
  DashboardActionButton,
  DashboardInput,
  DashboardPanel,
  DashboardRoleSelect,
  DashboardSelect,
  DashboardMetricCard,
  DashboardConfirmButton,
  DashboardGradientButton,
  DashboardDateField,
  ConfirmationDialog,
  PageHeader,
  DashboardIconButton,
  getTrendProps,
} from './shared';
import { DashboardDataGrid } from './grid';
import RowActionButtonGroup from './shared/RowActionButtonGroup';
import { ROLES, isSuperAdmin as checkIsSuperAdmin } from '../../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// ── Plan display config ─────────────────────────────────────────────────
const PLAN_DISPLAY = {
  website_free: { label: 'Free', color: '#6b7280' },
  website_core: { label: 'Core', color: '#3b82f6' },
  website_growth: { label: 'Growth', color: '#8b5cf6' },
  website_agency: { label: 'Agency', color: '#f59e0b' },
};

const SUB_STATUS_CONFIG = {
  active: { label: 'Active', color: '#22c55e' },
  cancelled: { label: 'Cancelling', color: '#eab308' },
  past_due: { label: 'Past Due', color: '#ef4444' },
  none: { label: 'Free', color: '#6b7280' },
};

const DURATION_OPTIONS = [
  { value: 'permanent', label: 'Permanent' },
  { value: '30', label: '30 days' },
  { value: '60', label: '60 days' },
  { value: '90', label: '90 days' },
  { value: 'custom', label: 'Custom' },
];

const CONSENT_ACTION_ICONS = {
  admin_plan_override: ShieldAlert,
  admin_plan_override_revoked: Undo2,
  admin_plan_override_extended: Clock,
  admin_credit_granted: Gift,
  admin_refund: Undo2,
  plan_upgrade: CreditCard,
  plan_downgrade: CreditCard,
  subscription_cancel: BlockIcon,
  subscription_reactivate: ActiveIcon,
};

// ── BillingTab subcomponent ─────────────────────────────────────────────
const BillingTab = memo(function BillingTab({ userId, colors, showSnackbar }) {
  const [billingData, setBillingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Credit form state
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditReason, setCreditReason] = useState('');

  // Plan override form state
  const [overridePlanCode, setOverridePlanCode] = useState('website_core');
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideDuration, setOverrideDuration] = useState('30');
  const [overrideCustomDate, setOverrideCustomDate] = useState('');

  // Refund dialog state
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundInvoice, setRefundInvoice] = useState(null);
  const [refundType, setRefundType] = useState('full');
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refundConfirmStep, setRefundConfirmStep] = useState(0);

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/admin/users/${userId}/billing-history`);
      setBillingData(response.data.data);
    } catch (err) {
      showSnackbar('Failed to load billing data', 'error');
    } finally {
      setLoading(false);
    }
  }, [userId, showSnackbar]);

  useEffect(() => {
    fetchBillingData();
  }, [fetchBillingData]);

  const handleApplyOverride = useCallback(async () => {
    if (!overrideReason.trim()) {
      showSnackbar('Reason is required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      let expiresAt = null;
      if (overrideDuration !== 'permanent') {
        if (overrideDuration === 'custom') {
          expiresAt = overrideCustomDate || null;
        } else {
          const days = parseInt(overrideDuration, 10);
          expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
        }
      }
      await axios.post(`${API_URL}/admin/users/${userId}/plan-override`, {
        planCode: overridePlanCode,
        reason: overrideReason,
        expiresAt,
      });
      showSnackbar('Plan override applied', 'success');
      setOverrideReason('');
      await fetchBillingData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to apply override', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [userId, overridePlanCode, overrideReason, overrideDuration, overrideCustomDate, showSnackbar, fetchBillingData]);

  const handleRevokeOverride = useCallback(async () => {
    setActionLoading(true);
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}/plan-override`);
      showSnackbar('Plan override revoked', 'success');
      await fetchBillingData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to revoke override', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [userId, showSnackbar, fetchBillingData]);

  const handleQuickPreset = useCallback((planCode, days) => {
    setOverridePlanCode(planCode);
    setOverrideDuration(String(days));
    setOverrideReason(`Quick preset: ${PLAN_DISPLAY[planCode]?.label || planCode} for ${days} days`);
  }, []);

  const handleGrantCredits = useCallback(async () => {
    const cents = Math.round(parseFloat(creditAmount) * 100);
    if (isNaN(cents) || cents <= 0) {
      showSnackbar('Enter a valid credit amount', 'error');
      return;
    }
    if (cents > 1000000) {
      showSnackbar('Maximum credit amount is $10,000', 'error');
      return;
    }
    if (!creditReason.trim()) {
      showSnackbar('Reason is required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      await axios.post(`${API_URL}/admin/users/${userId}/credits`, {
        amountCents: cents,
        reason: creditReason,
      });
      showSnackbar('Credits granted', 'success');
      setCreditAmount('');
      setCreditReason('');
      setShowCreditForm(false);
      await fetchBillingData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to grant credits', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [userId, creditAmount, creditReason, showSnackbar, fetchBillingData]);

  const handleOpenRefundDialog = useCallback((invoice) => {
    setRefundInvoice(invoice);
    setRefundType('full');
    setRefundAmount('');
    setRefundReason('');
    setRefundConfirmStep(0);
    setRefundDialogOpen(true);
  }, []);

  const handleProcessRefund = useCallback(async () => {
    if (refundConfirmStep === 0) {
      setRefundConfirmStep(1);
      return;
    }
    if (!refundReason.trim()) {
      showSnackbar('Refund reason is required', 'error');
      return;
    }
    setActionLoading(true);
    try {
      const isFull = refundType === 'full';
      const body = {
        reason: refundReason,
        isFull,
      };
      if (!isFull) {
        body.amountCents = Math.round(parseFloat(refundAmount) * 100);
      }
      await axios.post(`${API_URL}/admin/invoices/${refundInvoice.id}/refund`, body);
      showSnackbar('Refund processed', 'success');
      setRefundDialogOpen(false);
      await fetchBillingData();
    } catch (err) {
      showSnackbar(err.response?.data?.message || 'Failed to process refund', 'error');
    } finally {
      setActionLoading(false);
    }
  }, [refundConfirmStep, refundType, refundAmount, refundReason, refundInvoice, showSnackbar, fetchBillingData]);

  const activeOverride = useMemo(
    () => billingData?.planOverrides?.find((o) => o.isActive),
    [billingData]
  );

  const creditBalanceDisplay = useMemo(() => {
    const cents = billingData?.user?.accountCreditCents || 0;
    return `$${(cents / 100).toFixed(2)}`;
  }, [billingData]);

  const planConfig = useMemo(
    () => PLAN_DISPLAY[billingData?.user?.websitePlan] || PLAN_DISPLAY.website_free,
    [billingData]
  );

  const subStatusConfig = useMemo(
    () => SUB_STATUS_CONFIG[billingData?.user?.subscriptionStatus] || SUB_STATUS_CONFIG.none,
    [billingData]
  );

  const invoiceColumns = useMemo(
    () => [
      {
        header: 'Date',
        accessorKey: 'createdAt',
        size: 110,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {new Date(cell.getValue()).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        header: 'Invoice #',
        accessorKey: 'invoiceNumber',
        size: 120,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500 }}>
            {cell.getValue()}
          </Typography>
        ),
      },
      {
        header: 'Amount',
        accessorKey: 'totalCents',
        size: 100,
        Cell: ({ cell }) => (
          <Typography variant="body2" sx={{ color: colors.text }}>
            ${(cell.getValue() / 100).toFixed(2)}
          </Typography>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'status',
        size: 130,
        Cell: ({ cell }) => {
          const statusColors = {
            paid: '#22c55e',
            refunded: '#6b7280',
            partially_refunded: '#eab308',
            pending: '#3b82f6',
            failed: '#ef4444',
          };
          const c = statusColors[cell.getValue()] || '#6b7280';
          return (
            <Chip
              label={cell.getValue()?.replace('_', ' ')}
              size="small"
              sx={{
                background: alpha(c, 0.15),
                color: c,
                fontWeight: 600,
                fontSize: '0.65rem',
                textTransform: 'capitalize',
              }}
            />
          );
        },
      },
    ],
    [colors]
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!billingData) {
    return (
      <Typography sx={{ color: colors.textSecondary, py: 2 }}>
        No billing data available.
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Status Row */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        <Chip
          label={planConfig.label}
          size="small"
          sx={{
            background: alpha(planConfig.color, 0.15),
            color: planConfig.color,
            fontWeight: 700,
            border: `1px solid ${alpha(planConfig.color, 0.3)}`,
          }}
        />
        <Chip
          label={subStatusConfig.label}
          size="small"
          sx={{
            background: alpha(subStatusConfig.color, 0.15),
            color: subStatusConfig.color,
            fontWeight: 700,
            border: `1px solid ${alpha(subStatusConfig.color, 0.3)}`,
          }}
        />
        {billingData.user.currentPeriodEnd && (
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            Next billing: {new Date(billingData.user.currentPeriodEnd).toLocaleDateString()}
          </Typography>
        )}
      </Box>

      {/* Credit Balance */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px solid ${colors.border}`,
          background: alpha(colors.bgCard, 0.5),
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DollarSign size={18} color={colors.primary} />
            <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
              Account Credits
            </Typography>
          </Box>
          <Typography variant="h6" sx={{ color: colors.primary, fontWeight: 700 }}>
            {creditBalanceDisplay}
          </Typography>
        </Box>

        {!showCreditForm ? (
          <DashboardGradientButton
            size="small"
            onClick={() => setShowCreditForm(true)}
            sx={{ mt: 0.5 }}
          >
            Add Credits
          </DashboardGradientButton>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
            <DashboardInput
              label="Amount ($)"
              type="number"
              size="small"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              inputProps={{ min: 1, max: 10000, step: 0.01 }}
            />
            <DashboardInput
              label="Reason"
              size="small"
              value={creditReason}
              onChange={(e) => setCreditReason(e.target.value)}
              required
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              <DashboardConfirmButton
                size="small"
                onClick={handleGrantCredits}
                disabled={actionLoading || !creditAmount || !creditReason.trim()}
              >
                {actionLoading ? <CircularProgress size={16} /> : 'Grant Credits'}
              </DashboardConfirmButton>
              <Button
                size="small"
                onClick={() => setShowCreditForm(false)}
                sx={{ color: colors.textSecondary }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        )}
      </Box>

      {/* Active Plan Override */}
      {activeOverride && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${alpha('#f59e0b', 0.3)}`,
            background: alpha('#f59e0b', 0.05),
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
                Active Override: {PLAN_DISPLAY[activeOverride.planCode]?.label || activeOverride.planCode}
              </Typography>
              <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                {activeOverride.expiresAt
                  ? `Expires: ${new Date(activeOverride.expiresAt).toLocaleDateString()}`
                  : 'Permanent'}
                {' - '}{activeOverride.reason}
              </Typography>
            </Box>
            <DashboardConfirmButton
              size="small"
              onClick={handleRevokeOverride}
              disabled={actionLoading}
              sx={{
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                '&:hover': { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
              }}
            >
              {actionLoading ? <CircularProgress size={16} color="inherit" /> : 'Revoke'}
            </DashboardConfirmButton>
          </Box>
        </Box>
      )}

      {/* Override Plan Section */}
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          border: `1px solid ${colors.border}`,
          background: alpha(colors.bgCard, 0.5),
        }}
      >
        <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600, mb: 1.5 }}>
          Override Plan
        </Typography>

        {/* Quick Presets */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleQuickPreset('website_core', 30)}
            sx={{ color: colors.text, borderColor: colors.border, textTransform: 'none', fontSize: '0.75rem' }}
          >
            Free Core 30d
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleQuickPreset('website_growth', 30)}
            sx={{ color: colors.text, borderColor: colors.border, textTransform: 'none', fontSize: '0.75rem' }}
          >
            Free Growth 30d
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => handleQuickPreset('website_agency', 14)}
            sx={{ color: colors.text, borderColor: colors.border, textTransform: 'none', fontSize: '0.75rem' }}
          >
            Free Agency 14d
          </Button>
        </Box>

        <Grid container spacing={1.5}>
          <Grid item xs={12} sm={6}>
            <DashboardSelect
              label="Plan"
              size="small"
              value={overridePlanCode}
              onChange={(e) => setOverridePlanCode(e.target.value)}
            >
              <MenuItem value="website_free">Free</MenuItem>
              <MenuItem value="website_core">Core ($19/mo)</MenuItem>
              <MenuItem value="website_growth">Growth ($49/mo)</MenuItem>
              <MenuItem value="website_agency">Agency ($149/mo)</MenuItem>
            </DashboardSelect>
          </Grid>
          <Grid item xs={12} sm={6}>
            <DashboardSelect
              label="Duration"
              size="small"
              value={overrideDuration}
              onChange={(e) => setOverrideDuration(e.target.value)}
            >
              {DURATION_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </DashboardSelect>
          </Grid>
          {overrideDuration === 'custom' && (
            <Grid item xs={12}>
              <DashboardDateField
                label="Custom Expiry Date"
                size="small"
                value={overrideCustomDate}
                onChange={(e) => setOverrideCustomDate(e.target.value)}
              />
            </Grid>
          )}
          <Grid item xs={12}>
            <DashboardInput
              label="Reason"
              size="small"
              value={overrideReason}
              onChange={(e) => setOverrideReason(e.target.value)}
              required
              multiline
              rows={2}
            />
          </Grid>
          <Grid item xs={12}>
            <DashboardConfirmButton
              size="small"
              onClick={handleApplyOverride}
              disabled={actionLoading || !overrideReason.trim()}
            >
              {actionLoading ? <CircularProgress size={16} color="inherit" /> : 'Apply Override'}
            </DashboardConfirmButton>
          </Grid>
        </Grid>
      </Box>

      {/* Invoices */}
      {billingData.recentInvoices?.length > 0 && (
        <Box
          sx={{
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            overflow: 'hidden',
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600 }}>
              Recent Invoices
            </Typography>
          </Box>
          <Box sx={{ overflowX: 'auto' }}>
            <DashboardDataGrid
              gridId="billing-invoices"
              rowData={billingData.recentInvoices}
              columnDefs={invoiceColumns}
              actionColumn={{
                width: 100,
                actions: (invoice) => [
                  {
                    label: 'Refund',
                    icon: <Undo2 size={16} />,
                    onClick: () => handleOpenRefundDialog(invoice),
                    color: '#ef4444',
                    show: invoice.status === 'paid' || invoice.status === 'partially_refunded',
                  },
                ],
              }}
              paginationPageSize={5}
              rowHeight={48}
            />
          </Box>
        </Box>
      )}

      {/* Consent Ledger Timeline */}
      {billingData.consentLedger?.length > 0 && (
        <Box
          sx={{
            p: 2,
            borderRadius: 2,
            border: `1px solid ${colors.border}`,
            background: alpha(colors.bgCard, 0.5),
          }}
        >
          <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
            Audit Trail
          </Typography>
          <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {billingData.consentLedger.map((entry, idx) => {
              const IconComp = CONSENT_ACTION_ICONS[entry.action] || Clock;
              return (
                <Box
                  key={entry.id || idx}
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    py: 1,
                    borderBottom: idx < billingData.consentLedger.length - 1 ? `1px solid ${alpha(colors.border, 0.5)}` : 'none',
                  }}
                >
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: alpha(colors.primary, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.25,
                    }}
                  >
                    <IconComp size={14} color={colors.primary} />
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 500, fontSize: '0.8rem' }}>
                      {entry.action?.replace(/_/g, ' ')}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block' }}>
                      {new Date(entry.createdAt).toLocaleString()}
                      {entry.planFrom && entry.planTo && ` - ${entry.planFrom} -> ${entry.planTo}`}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {/* Refund Dialog — double-confirmation */}
      <Dialog
        open={refundDialogOpen}
        onClose={() => setRefundDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700 }}>
          {refundConfirmStep === 0 ? 'Process Refund' : 'Confirm Refund'}
        </DialogTitle>
        <DialogContent>
          {refundConfirmStep === 1 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action is irreversible. Confirm you want to process this refund.
            </Alert>
          )}
          {refundInvoice && (
            <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
              Invoice: {refundInvoice.invoiceNumber} - ${((refundInvoice.totalCents || 0) / 100).toFixed(2)}
            </Typography>
          )}
          <FormControl component="fieldset" sx={{ mb: 2, width: '100%' }}>
            <FormLabel sx={{ color: colors.textSecondary, fontSize: '0.85rem' }}>Refund Type</FormLabel>
            <RadioGroup
              value={refundType}
              onChange={(e) => setRefundType(e.target.value)}
            >
              <FormControlLabel
                value="full"
                control={<Radio size="small" />}
                label="Full refund"
                sx={{ color: colors.text }}
              />
              <FormControlLabel
                value="partial"
                control={<Radio size="small" />}
                label="Partial refund"
                sx={{ color: colors.text }}
              />
            </RadioGroup>
          </FormControl>
          {refundType === 'partial' && (
            <DashboardInput
              label="Refund Amount ($)"
              type="number"
              size="small"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              inputProps={{ min: 0.01, step: 0.01 }}
              sx={{ mb: 2 }}
            />
          )}
          <DashboardInput
            label="Reason"
            size="small"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
            required
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: `1px solid ${colors.border}` }}>
          <Button
            onClick={() => setRefundDialogOpen(false)}
            sx={{ color: colors.textSecondary }}
          >
            Cancel
          </Button>
          <DashboardConfirmButton
            onClick={handleProcessRefund}
            disabled={
              actionLoading ||
              !refundReason.trim() ||
              (refundType === 'partial' && (!refundAmount || parseFloat(refundAmount) <= 0))
            }
            sx={{
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              '&:hover': { background: 'linear-gradient(135deg, #dc2626, #b91c1c)' },
            }}
          >
            {actionLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : refundConfirmStep === 0 ? (
              'Continue'
            ) : (
              'Process Refund'
            )}
          </DashboardConfirmButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
});

const UserManagement = ({ user: currentUser, pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [currentEditUser, setCurrentEditUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [page, setPage] = useState(() => {
    return parseInt(localStorage.getItem('userManagementPage')) || 1;
  });
  const [totalPages, setTotalPages] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    return parseInt(localStorage.getItem('userManagementRowsPerPage')) || 10;
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dialogTab, setDialogTab] = useState(0);

  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    contentCreators: 0,
    blocked: 0,
    trends: {
      total: null,
      admins: null,
      contentCreators: null,
      blocked: null,
    },
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: ROLES.USER,
    blocked: false,
  });

  const isSuperAdmin = checkIsSuperAdmin(currentUser.role);

  // Debounce search for server-side filtering
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Map UI filter values to API params
  const roleApiValue = useMemo(() => {
    const roleMap = { 'User': ROLES.USER, 'Content Creator': ROLES.CONTENT_CREATOR, 'Admin': ROLES.ADMIN, 'Super Admin': ROLES.SUPER_ADMIN };
    return roleMap[roleFilter] || '';
  }, [roleFilter]);

  const blockedApiValue = useMemo(() => {
    if (statusFilter === 'Active') return 'false';
    if (statusFilter === 'Blocked') return 'true';
    return '';
  }, [statusFilter]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [page, rowsPerPage, debouncedSearch, roleApiValue, blockedApiValue]);

  // Reset page to 1 on search/filter change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleApiValue, blockedApiValue]);

  // Persist rowsPerPage to localStorage
  useEffect(() => {
    localStorage.setItem('userManagementRowsPerPage', rowsPerPage.toString());
  }, [rowsPerPage]);

  // Persist page to localStorage
  useEffect(() => {
    localStorage.setItem('userManagementPage', page.toString());
  }, [page]);

  // Reset to page 1 when rowsPerPage changes
  useEffect(() => {
    setPage(1);
  }, [rowsPerPage]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/users/stats`);

      setStats({
        total: response.data.total || 0,
        admins: response.data.admins || 0,
        contentCreators: response.data.contentCreators || 0,
        blocked: response.data.blocked || 0,
        trends: {
          total: response.data.trends?.total ?? null,
          admins: response.data.trends?.admins ?? null,
          contentCreators: response.data.trends?.contentCreators ?? null,
          blocked: response.data.trends?.blocked ?? null,
        },
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: String(rowsPerPage) });
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
      if (roleApiValue) params.set('role', roleApiValue);
      if (blockedApiValue) params.set('blocked', blockedApiValue);

      const response = await axios.get(`${API_URL}/users?${params.toString()}`);

      setUsers(response.data.users || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      showSnackbar('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (user = null) => {
    setDialogTab(0);
    if (user) {
      setIsEditing(true);
      setCurrentEditUser(user);
      setFormData({
        email: user.email,
        password: '',
        name: user.name,
        role: user.role,
        blocked: user.blocked,
      });

      if (user.displayImage) {
        setImagePreview(getImageUrl(user.displayImage));
      } else {
        setImagePreview('');
      }
      setImageFile(null);
    } else {
      setIsEditing(false);
      setCurrentEditUser(null);
      setFormData({
        email: '',
        password: '',
        name: '',
        role: ROLES.USER,
        blocked: false,
      });
      setImagePreview('');
      setImageFile(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setCurrentEditUser(null);
    setIsEditing(false);
    setImageFile(null);
    setImagePreview('');
    setSubmitting(false);
    setShowPassword(false);
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'blocked' ? checked : value,
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showSnackbar('Image size must be less than 5MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showSnackbar('Please enter a valid email address', 'error');
      return;
    }

    // NOTE: Removed frontend duplicate email check to avoid race conditions
    // Backend will handle duplicate email validation with proper database queries

    // Validate password complexity (only if password is provided)
    if (formData.password) {
      if (formData.password.length < 8) {
        showSnackbar('Password must be at least 8 characters', 'error');
        return;
      }

      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};:'",.<>\/\\|`~])[A-Za-z\d@$!%*?&#^()_+\-=\[\]{};:'",.<>\/\\|`~]{8,}$/;
      if (!passwordRegex.test(formData.password)) {
        showSnackbar(
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          'error'
        );
        return;
      }
    }

    setSubmitting(true);
    try {
      const formDataToSend = new FormData();

      formDataToSend.append('email', formData.email);
      formDataToSend.append('name', formData.name);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('blocked', formData.blocked);

      if (formData.password) {
        formDataToSend.append('password', formData.password);
      }

      if (imageFile) {
        formDataToSend.append('displayImage', imageFile);
      }

      if (isEditing) {
        await axios.put(`${API_URL}/users/${currentEditUser.id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      } else {
        await axios.post(`${API_URL}/users`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      // IMMEDIATELY refetch data for real-time updates
      await fetchUsers();
      await fetchStats();

      showSnackbar(
        isEditing ? 'User updated successfully' : 'User created successfully',
        'success'
      );
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving user:', error);
      showSnackbar(error.response?.data?.message || 'Failed to save user', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleBlock = async (userId, currentBlockedState) => {
    try {
      await axios.patch(`${API_URL}/users/${userId}/block`, { blocked: !currentBlockedState });

      // IMMEDIATELY refetch data for real-time updates
      await fetchUsers();
      await fetchStats();

      showSnackbar(
        `User ${!currentBlockedState ? 'blocked' : 'unblocked'} successfully`,
        'success'
      );
    } catch (error) {
      console.error('Error toggling block:', error);
      showSnackbar(error.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/users/${currentEditUser.id}`);

      // IMMEDIATELY refetch data for real-time updates
      await fetchUsers();
      await fetchStats();

      showSnackbar('User deleted successfully', 'success');
      setOpenDeleteDialog(false);
      setCurrentEditUser(null);
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar(error.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL.replace('/api', '')}${imagePath}`;
  };

  const getRoleChip = (role) => {
    const roleConfig = {
      SUPER_ADMIN: {
        label: 'Super Admin',
        icon: SuperAdminIcon,
        color: colors.primaryLight,
      },
      ADMIN: {
        label: 'Admin',
        icon: AdminIcon,
        color: colors.primary,
      },
      CONTENT_CREATOR: {
        label: 'Content Creator',
        icon: CreatorIcon,
        color: '#f59e0b',
      },
      USER: {
        label: 'User',
        icon: PersonIcon,
        color: '#8b5cf6',
      },
    };

    const config = roleConfig[role] || roleConfig.USER;
    const Icon = config.icon;

    return (
      <Chip
        icon={<Icon size={14} color={config.color} />}
        label={config.label}
        size="small"
        sx={{
          background: alpha(config.color, 0.15),
          color: config.color,
          fontWeight: 700,
          fontSize: '0.65rem',
          height: '24px',
          border: `1px solid ${alpha(config.color, 0.3)}`,
          '& .MuiChip-icon': {
            marginLeft: '4px',
          },
        }}
      />
    );
  };

  // Handle column sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Server-side search/filter is active — client-side sort only
  const sortedAndFilteredUsers = [...users].sort((a, b) => {
    let aVal, bVal;

    switch (sortField) {
      case 'name':
        aVal = a.name?.toLowerCase() || '';
        bVal = b.name?.toLowerCase() || '';
        break;
      case 'username':
        aVal = a.username?.toLowerCase() || '';
        bVal = b.username?.toLowerCase() || '';
        break;
      case 'email':
        aVal = a.email?.toLowerCase() || '';
        bVal = b.email?.toLowerCase() || '';
        break;
      case 'role':
        aVal = a.role?.toLowerCase() || '';
        bVal = b.role?.toLowerCase() || '';
        break;
      case 'createdAt':
        aVal = new Date(a.createdAt);
        bVal = new Date(b.createdAt);
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <Box>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />
      {/* Action Button Row */}
      <Box sx={{ mb: { xs: 2, md: 4 } }}>
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <DashboardIconButton
            icon={<AddIcon size={20} />}
            label="Create User"
            tooltip="Create New User"
            variant="filled"
            onClick={() => handleOpenDialog()}
          />
        </Box>
      </Box>

      {/* Summary Stats */}
      <Grid container spacing={{ xs: 2, sm: 2, md: 2 }} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Total Users"
            value={stats.total}
            icon={PeopleIcon}
            {...getTrendProps(stats.total, stats.trends.total)}
            showProgress={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Admins"
            value={stats.admins}
            icon={AdminPanelSettingsIcon}
            {...getTrendProps(stats.admins, stats.trends.admins)}
            showProgress={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Content Creators"
            value={stats.contentCreators}
            icon={CreateIcon}
            {...getTrendProps(stats.contentCreators, stats.trends.contentCreators)}
            showProgress={false}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <DashboardMetricCard
            title="Blocked"
            value={stats.blocked}
            icon={BlockOutlinedIcon}
            {...getTrendProps(stats.blocked, stats.trends.blocked)}
            showProgress={false}
          />
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Stack
        sx={{ mb: 3 }}
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        justifyContent="space-between"
      >
        <Box sx={{ mb: 2, width: { xs: '100%', sm: '100%', md: '500px' } }}>
          <DashboardInput
            fullWidth
            size="small"
            placeholder="Search by name, username, email, or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon size={20} color={colors.panelIcon} />
                </InputAdornment>
              ),
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                fontSize: { xs: '0.875rem', sm: '0.97rem' },
              },
              '& .MuiOutlinedInput-input': {
                padding: { xs: '8px 8px 8px 0', sm: '10px 10px 10px 0' },
              },
              '& .MuiOutlinedInput-input::placeholder': {
                fontSize: { xs: '0.8125rem', sm: '0.96rem' },
              },
            }}
          />
        </Box>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row' }}>
          <DashboardSelect
            size="small"
            label="Role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            containerSx={{ minWidth: { xs: '100%', sm: 180 } }}
          >
            <MenuItem value="All">All Roles</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="Super Admin">Super Admin</MenuItem>
            <MenuItem value="Content Creator">Content Creator</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </DashboardSelect>

          <DashboardSelect
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerSx={{ minWidth: { xs: '100%', sm: 180 } }}
          >
            <MenuItem value="All">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Blocked">Blocked</MenuItem>
          </DashboardSelect>
        </Box>
      </Stack>

      <DashboardPanel padding={0} sx={{ borderRadius: 3 }}>
        <DashboardDataGrid
          gridId="user-management"
          rowData={sortedAndFilteredUsers}
          columnDefs={[
            {
              header: '#',
              accessorFn: (row, index) => (page - 1) * rowsPerPage + index + 1,
              size: 80,
              enableSorting: false,
              Cell: ({ renderedCellValue }) => (
                <Box sx={{ color: colors.textTertiary, fontWeight: 500 }}>{renderedCellValue}</Box>
              ),
            },
            {
              header: 'User',
              accessorKey: 'name',
              minSize: 220,
              Cell: ({ row }) => (
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar
                    src={getImageUrl(row.original.displayImage)}
                    sx={{
                      width: 38,
                      height: 38,
                      bgcolor: alpha(colors.primary, 0.1),
                      color: colors.primary,
                      border: `2px solid ${alpha(colors.primary, 0.2)}`,
                    }}
                  >
                    {row.original.name?.charAt(0) || <PersonIcon size={20} />}
                  </Avatar>
                  <Box>
                    <Typography variant="body2" sx={{ color: colors.text, fontWeight: 600 }}>
                      {row.original.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: colors.textSecondary }}>
                      @{row.original.username}
                    </Typography>
                  </Box>
                </Box>
              ),
            },
            {
              header: 'Email',
              accessorKey: 'email',
              minSize: 200,
              Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {cell.getValue()}
                </Typography>
              ),
            },
            {
              header: 'Role',
              accessorKey: 'role',
              size: 160,
              Cell: ({ cell }) => getRoleChip(cell.getValue()),
            },
            {
              header: 'Status',
              accessorKey: 'blocked',
              size: 140,
              Cell: ({ cell }) => (
                <Chip
                  label={cell.getValue() ? 'Blocked' : 'Active'}
                  size="small"
                  sx={{
                    background: cell.getValue()
                      ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                      : 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                    color: '#F5F5F5',
                    fontWeight: 700,
                    fontSize: '0.65rem',
                    height: '24px',
                    boxShadow: `0 2px 6px ${alpha(cell.getValue() ? '#ef4444' : '#22c55e', 0.2)}`,
                  }}
                />
              ),
            },
            {
              header: 'Created',
              accessorKey: 'createdAt',
              size: 140,
              Cell: ({ cell }) => (
                <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                  {new Date(cell.getValue()).toLocaleDateString()}
                </Typography>
              ),
            },
          ]}
          actionColumn={{
            width: 150,
            actions: (user) => [
              {
                label: 'Edit',
                icon: <EditIcon size={18} />,
                onClick: (data) => handleOpenDialog(data),
                color: colors.warning,
                hoverBackground: alpha(colors.text, 0.1),
              },
              {
                label: user.blocked ? 'Unblock' : 'Block',
                icon: <BlockIcon size={18} />,
                onClick: (data) => handleToggleBlock(data.id, data.blocked),
                color: user.blocked ? colors.success : colors.error,
                hoverBackground: alpha(colors.primary, 0.2),
              },
              {
                label: 'Delete',
                icon: <DeleteIcon size={18} />,
                onClick: (data) => {
                  setCurrentEditUser(data);
                  setOpenDeleteDialog(true);
                },
                color: '#ef4444',
                hoverBackground: alpha('#ef4444', 0.2),
                show: isSuperAdmin && user.id !== currentUser.id,
              },
            ],
          }}
          serverSidePagination={{
            totalRows: stats.total,
            currentPage: page,
            onPageChange: (newPage) => setPage(newPage),
            onPageSizeChange: (newSize) => setRowsPerPage(newSize),
          }}
          paginationPageSize={rowsPerPage}
          loading={loading}
          rowHeight={72}
        />
      </DashboardPanel>

      {/* Create/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 700,
            borderBottom: isEditing && isSuperAdmin ? 'none' : `0.5px solid ${colors.border}`,
            pb: isEditing && isSuperAdmin ? 1 : undefined,
          }}
        >
          {isEditing ? 'Edit User' : 'Create New User'}
        </DialogTitle>
        {isEditing && isSuperAdmin && (
          <Tabs
            value={dialogTab}
            onChange={(_, v) => setDialogTab(v)}
            sx={{
              px: 2,
              borderBottom: `1px solid ${colors.border}`,
              '& .MuiTab-root': { color: colors.textSecondary, textTransform: 'none', minHeight: 40, fontSize: '0.85rem' },
              '& .Mui-selected': { color: colors.primary },
              '& .MuiTabs-indicator': { backgroundColor: colors.primary },
            }}
          >
            <Tab label="Details" />
            <Tab label="Billing" />
          </Tabs>
        )}
        <DialogContent dividers sx={{ borderColor: colors.border, display: dialogTab === 0 ? 'block' : 'none' }}>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <DashboardInput
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isEditing}
                helperText={isEditing ? 'Email cannot be changed' : 'Enter a valid email address'}
                labelPlacement="floating"
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardInput
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                labelPlacement="floating"
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardInput
                label={isEditing ? 'New Password (leave blank to keep current)' : 'Password'}
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                required={!isEditing}
                helperText={
                  isEditing
                    ? 'Leave blank to keep current password'
                    : '8+ chars with uppercase, lowercase, number, and special character'
                }
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: colors.panelIcon }}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                labelPlacement="floating"
              />
            </Grid>

            <Grid item xs={12}>
              <DashboardRoleSelect
                name="role"
                value={formData.role}
                onChange={handleInputChange}
                required
                includeSuperAdmin={isSuperAdmin}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom sx={{ color: colors.textSecondary }}>
                Display Image
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                <Avatar
                  src={imagePreview}
                  alt={formData.name}
                  sx={{
                    width: 60,
                    height: 60,
                    border: `2px solid ${colors.primary}`,
                    boxShadow: `0 2px 8px ${alpha(colors.primary, 0.15)}`,
                  }}
                >
                  {formData.name?.charAt(0).toUpperCase()}
                </Avatar>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
                <Box sx={{ display: 'flex', gap: 1, flexGrow: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<UploadIcon size={18} />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      color: colors.text,
                      borderColor: colors.border,
                      '&:hover': {
                        borderColor: colors.primary,
                        background: alpha(colors.primary, 0.1),
                      },
                    }}
                  >
                    Upload
                  </Button>
                  {imagePreview && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleRemoveImage}
                      sx={{
                        color: '#ef4444',
                        borderColor: alpha('#ef4444', 0.3),
                        '&:hover': {
                          borderColor: '#ef4444',
                          background: alpha('#ef4444', 0.1),
                        },
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.blocked}
                    onChange={handleInputChange}
                    name="blocked"
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#ef4444',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#ef4444',
                      },
                    }}
                  />
                }
                label="Block User"
                sx={{ color: colors.textSecondary }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        {/* Billing Tab — only visible for SUPER_ADMIN editing existing users */}
        {isEditing && isSuperAdmin && dialogTab === 1 && (
          <DialogContent dividers sx={{ borderColor: colors.border }}>
            <BillingTab
              userId={currentEditUser?.id}
              colors={colors}
              showSnackbar={showSnackbar}
            />
          </DialogContent>
        )}
        {dialogTab === 0 && (
        <DialogActions
          sx={{
            background: colors.bgCard,
            borderTop: `1px solid ${colors.border}`,
            p: 2,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: colors.textSecondary,
              '&:hover': { background: alpha(colors.text, 0.05) },
            }}
          >
            Cancel
          </Button>
          <DashboardActionButton
            onClick={handleSubmit}
            disabled={
              submitting || !formData.email || !formData.name || (!isEditing && !formData.password)
            }
            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
            sx={{ maxWidth: 220 }}
          >
            {submitting ? 'Processing...' : isEditing ? 'Update User' : 'Create User'}
          </DashboardActionButton>
        </DialogActions>
        )}
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        PaperProps={{
          sx: {
            background: colors.bgCard,
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.text, fontWeight: 700 }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography sx={{ color: colors.textSecondary }}>
            Are you sure you want to delete user "
            <strong style={{ color: colors.text }}>{currentEditUser?.name}</strong>
            "? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setOpenDeleteDialog(false)}
            sx={{
              color: colors.textSecondary,
              '&:hover': { background: alpha(colors.text, 0.05) },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            sx={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#F5F5F5',
              fontWeight: 600,
              boxShadow: `0 4px 12px ${alpha('#ef4444', 0.3)}`,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                boxShadow: `0 6px 20px ${alpha('#ef4444', 0.4)}`,
              },
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{
            background:
              snackbar.severity === 'success'
                ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
                : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#F5F5F5',
            fontWeight: 600,
            boxShadow: `0 4px 12px ${alpha(
              snackbar.severity === 'success' ? '#22c55e' : '#ef4444',
              0.3
            )}`,
            '& .MuiAlert-icon': {
              color: '#F5F5F5',
            },
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default UserManagement;
