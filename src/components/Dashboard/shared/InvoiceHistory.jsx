import { useState, useEffect, useCallback } from 'react';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import axios from 'axios';
import {
  Box,
  Typography,
  Button,
  TableHead,
  TableBody,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  CircularProgress,
  Skeleton,
  MenuItem,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { MessageSquareText, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardCard from './DashboardCard';
import DashboardTable, { DashboardTableHeadCell, DashboardTableRow } from './DashboardTable';
import DashboardActionButton from './DashboardActionButton';
import DashboardSelect from './DashboardSelect';
import SearchBar from './SearchBar';
import EmptyState from './EmptyState';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const ITEMS_PER_PAGE = 10;

// Format date for display
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

// Format billing period
const formatBillingPeriod = (start, end) => {
  if (!start || !end) return '-';
  return `${formatDate(start)} - ${formatDate(end)}`;
};

// Get status color
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return '#22c55e';
    case 'pending':
      return '#f59e0b';
    case 'failed':
      return '#ef4444';
    case 'refunded':
      return '#6b7280';
    default:
      return '#6b7280';
  }
};

// Capitalize first letter
const capitalizeStatus = (status) => {
  if (!status) return '-';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const InvoiceHistory = () => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const isDark = actualTheme === 'dark';

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [statusFilter, setStatusFilter] = useState('all');

  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch invoices from API
  const fetchInvoices = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);

    try {
      const params = { page, limit: ITEMS_PER_PAGE };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (statusFilter !== 'all') params.status = statusFilter;
      const response = await axios.get(`${API_URL}/invoices`, {
        params,
      });

      setInvoices(response.data.invoices || []);
      setPagination(response.data.pagination || {
        page: 1,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
      setError('Failed to load invoice history');
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and re-fetch on search/filter change
  useEffect(() => {
    fetchInvoices(1);
  }, [fetchInvoices]);

  // Reset to page 1 on search/filter change
  useEffect(() => {
    fetchInvoices(1);
  }, [debouncedSearch, statusFilter]);

  const handlePageChange = useCallback((newPage) => {
    fetchInvoices(newPage);
  }, [fetchInvoices]);

  const handleViewInvoice = useCallback((invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    setSelectedInvoice(null);
  }, []);

  const tableColors = {
    panelBg: colors.panelBg,
    panelHover: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
    panelText: alpha(colors.text, 0.6),
    panelAccent: colors.primary,
    rowBg: 'transparent',
    rowHover: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
    text: colors.text,
    textSecondary: alpha(colors.text, 0.6),
    textTertiary: alpha(colors.text, 0.4),
    border: isDark ? alpha('#fff', 0.08) : alpha('#000', 0.08),
    primary: colors.primary,
  };

  // Loading skeleton
  const renderSkeleton = () => (
    <Box sx={{ mt: 2 }}>
      {[1, 2, 3].map((i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          height={56}
          sx={{
            mb: 1,
            borderRadius: 1,
            bgcolor: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
          }}
        />
      ))}
    </Box>
  );

  return (
    <>
      <DashboardCard
        icon={MessageSquareText}
        title="Invoice history"
        subtitle="If you've just made a payment, it may take a few hours for it to appear in the table below."
      >
        {/* Search and Status Filter */}
        <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={2} mb={2}>
          <Box sx={{ flex: 1, maxWidth: { xs: '100%', sm: 300 } }}>
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search invoices..."
            />
          </Box>
          <DashboardSelect
            size="small"
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            containerSx={{ minWidth: 130 }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </DashboardSelect>
        </Box>

        {loading ? (
          renderSkeleton()
        ) : error ? (
          <Box sx={{ py: invoices.length === 0 ? 0 : 0, textAlign: 'center' }}>
            <Typography color="error" variant="body2">
              {error}
            </Typography>
            <Button
              onClick={() => fetchInvoices(1)}
              sx={{ mt: 2, color: colors.primary }}
            >
              Try Again
            </Button>
          </Box>
        ) : invoices.length === 0 ? (
           <Box sx={{ mt: 2, p: 3, textAlign: 'center' }}>
          <Typography sx={{ color: alpha(colors.text, 0.5) }}>Your invoice history will appear here once you make a payment.</Typography>
        </Box>
        ) : (
          <>
            <DashboardTable colors={tableColors} variant="inset">
              <TableHead>
                <DashboardTableRow colors={tableColors}>
                  <DashboardTableHeadCell colors={tableColors}>ID</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={tableColors}>Issue Date</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={tableColors}>Total (incl. tax)</DashboardTableHeadCell>
                  <DashboardTableHeadCell colors={tableColors} align="right" />
                </DashboardTableRow>
              </TableHead>
              <TableBody>
                {invoices.map((invoice) => (
                  <DashboardTableRow key={invoice.id} colors={tableColors}>
                    <TableCell>
                      {invoice.invoiceNumber}
                    </TableCell>
                    <TableCell>
                      {formatDate(invoice.issueDate)}
                    </TableCell>
                    <TableCell>
                      ${invoice.total?.toFixed(2) || '0.00'}
                    </TableCell>
                    <TableCell align="right">
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => handleViewInvoice(invoice)}
                        sx={{
                          color: colors.text,
                          textTransform: 'none',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          textDecoration: 'underline',
                          minWidth: 'auto',
                          p: 0,
                          '&:hover': {
                            background: 'transparent',
                            color: colors.primary,
                          },
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </DashboardTableRow>
                ))}
              </TableBody>
            </DashboardTable>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mt: 2,
                  pt: 2,
                  borderTop: `1px solid ${tableColors.border}`,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: tableColors.textSecondary, fontSize: '0.8rem' }}
                >
                  Showing {((pagination.page - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                  {Math.min(pagination.page * ITEMS_PER_PAGE, pagination.totalCount)} of{' '}
                  {pagination.totalCount} invoices
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    disabled={!pagination.hasPrevPage}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    sx={{
                      minWidth: 36,
                      p: 0.5,
                      color: pagination.hasPrevPage ? colors.text : tableColors.textTertiary,
                      '&:hover': {
                        background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                      },
                      '&.Mui-disabled': {
                        color: tableColors.textTertiary,
                      },
                    }}
                  >
                    <ChevronLeft size={18} />
                  </Button>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text, fontWeight: 500, fontSize: '0.8rem' }}
                    >
                      {pagination.page} / {pagination.totalPages}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    disabled={!pagination.hasNextPage}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    sx={{
                      minWidth: 36,
                      p: 0.5,
                      color: pagination.hasNextPage ? colors.text : tableColors.textTertiary,
                      '&:hover': {
                        background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                      },
                      '&.Mui-disabled': {
                        color: tableColors.textTertiary,
                      },
                    }}
                  >
                    <ChevronRight size={18} />
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </DashboardCard>

      {/* Invoice Details Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            background: colors.panelBg,
            borderRadius: 3,
            border: `1px solid ${isDark ? alpha('#fff', 0.1) : alpha('#000', 0.1)}`,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: 1,
          }}
        >
          Invoice Details
          <Button
            onClick={handleCloseDialog}
            sx={{
              minWidth: 'auto',
              p: 0.5,
              color: alpha(colors.text, 0.5),
              '&:hover': {
                background: isDark ? alpha('#fff', 0.05) : alpha('#000', 0.05),
                color: colors.text,
              },
            }}
          >
            <X size={20} />
          </Button>
        </DialogTitle>
        <DialogContent>
          {selectedInvoice && (
            <Box>
              <Box
                sx={{
                  background: isDark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                  borderRadius: 2,
                  p: 2.5,
                  mb: 3,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    color: colors.text,
                    fontWeight: 700,
                    mb: 0.5,
                  }}
                >
                  ${selectedInvoice.total?.toFixed(2) || '0.00'}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: alpha(colors.text, 0.6),
                  }}
                >
                  Total amount (incl. tax)
                </Typography>
              </Box>

              <Grid container spacing={2.5}>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(colors.text, 0.5),
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Invoice ID
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text,
                      fontWeight: 500,
                    }}
                  >
                    {selectedInvoice.invoiceNumber}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(colors.text, 0.5),
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Status
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: getStatusColor(selectedInvoice.status),
                      fontWeight: 600,
                    }}
                  >
                    {capitalizeStatus(selectedInvoice.status)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(colors.text, 0.5),
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Issue Date
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text,
                      fontWeight: 500,
                    }}
                  >
                    {formatDate(selectedInvoice.issueDate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(colors.text, 0.5),
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Plan
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text,
                      fontWeight: 500,
                    }}
                  >
                    {selectedInvoice.planName || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(colors.text, 0.5),
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Billing Period
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text,
                      fontWeight: 500,
                    }}
                  >
                    {formatBillingPeriod(
                      selectedInvoice.billingPeriodStart,
                      selectedInvoice.billingPeriodEnd
                    )}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: alpha(colors.text, 0.5),
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      fontWeight: 600,
                      display: 'block',
                      mb: 0.5,
                    }}
                  >
                    Payment Method
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text,
                      fontWeight: 500,
                    }}
                  >
                    {selectedInvoice.paymentMethod || '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <DashboardActionButton fullWidth onClick={handleCloseDialog}>
            Close
          </DashboardActionButton>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceHistory;
