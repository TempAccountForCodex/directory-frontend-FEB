/**
 * Finances Dashboard — SUPER_ADMIN Only
 *
 * Platform-wide financial reporting with 4 sub-tabs:
 * 1. Overview — KPI metric cards + revenue breakdown
 * 2. Subscriptions — paginated subscriber table with filters
 * 3. Transactions — unified timeline with type/status filters
 * 4. Reports — CSV/JSON export for invoices, revenue, tax
 *
 * Step 10.26b
 */

import React, { useState, useCallback, useEffect, useMemo } from "react";
import axios from "axios";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { alpha } from "@mui/material/styles";
import {
  TrendingUp,
  Calendar,
  Banknote,
  Users,
  UserMinus,
  Percent,
  AlertCircle,
  ArrowUpRight,
  Download,
} from "lucide-react";
import {
  PageHeader,
  TabNavigation,
  DashboardMetricCard,
  DashboardTable,
  DashboardTableHeadCell,
  DashboardTablePagination,
  DashboardTableRow,
  SearchBar,
  FilterBar,
  EmptyState,
  DashboardPanel,
  DashboardDateField,
  DashboardGradientButton,
  DashboardActionButton,
  getTrendProps,
} from "./shared";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";

const API_URL = import.meta.env.VITE_API_URL || "";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const formatCents = (cents) => currencyFormatter.format(cents / 100);

const SUB_TABS = [
  { label: "Overview", value: "overview" },
  { label: "Subscriptions", value: "subscriptions" },
  { label: "Transactions", value: "transactions" },
  { label: "Reports", value: "reports" },
];

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "cancelling", label: "Cancelling" },
  { value: "past_due", label: "Past Due" },
  { value: "cancelled", label: "Cancelled" },
  { value: "free", label: "Free" },
];

const TXN_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "invoice", label: "Invoice" },
  { value: "order", label: "Order" },
  { value: "refund", label: "Refund" },
  { value: "credit", label: "Credit" },
];

const TXN_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

const statusChipColor = (status) => {
  switch (status) {
    case "active":
    case "paid":
    case "applied":
      return "success";
    case "cancelling":
    case "pending":
      return "warning";
    case "past_due":
    case "failed":
    case "refunded":
      return "error";
    default:
      return "default";
  }
};

const typeChipColor = (type) => {
  switch (type) {
    case "invoice":
      return "primary";
    case "order":
      return "secondary";
    case "refund":
      return "error";
    case "credit":
      return "success";
    default:
      return "default";
  }
};

// ─── Overview Sub-Tab ───────────────────────────────────────────────────
const OverviewTab = React.memo(function OverviewTab() {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [metrics, setMetrics] = useState(null);
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [metricsRes, breakdownRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/finances/metrics`, { withCredentials: true }),
        axios.get(`${API_URL}/api/admin/finances/revenue?period=12m`, { withCredentials: true }),
      ]);
      setMetrics(metricsRes.data.data);
      setBreakdown(breakdownRes.data.data);
    } catch (err) {
      console.error("Failed to fetch finance data:", err);
      setError("Failed to load financial data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const metricCards = useMemo(() => {
    if (!metrics) return [];
    return [
      {
        title: "MRR",
        value: formatCents(metrics.mrr.totalCents),
        icon: TrendingUp,
        ...getTrendProps(metrics.mrr.totalCents, null),
      },
      {
        title: "ARR",
        value: formatCents(metrics.arr.totalCents),
        icon: Calendar,
        ...getTrendProps(metrics.arr.totalCents, null),
      },
      {
        title: "Revenue This Month",
        value: formatCents(metrics.revenueThisMonth.totalCents),
        icon: ArrowUpRight,
        ...getTrendProps(metrics.revenueThisMonth.totalCents, metrics.revenueThisMonth.change),
      },
      {
        title: "Churn Rate",
        value: `${metrics.churnRate}%`,
        icon: UserMinus,
        diff: metrics.churnRate > 5 ? metrics.churnRate : null,
        diffLabel: metrics.churnRate > 5 ? "above threshold" : undefined,
        showDiff: metrics.churnRate > 5,
      },
      {
        title: "Platform Fees",
        value: formatCents(metrics.platformFeesEarned.totalCents),
        icon: Percent,
        ...getTrendProps(metrics.platformFeesEarned.totalCents, null),
      },
      {
        title: "Active Subscribers",
        value: String(metrics.activePaidSubscriptions),
        icon: Users,
        ...getTrendProps(metrics.activePaidSubscriptions, null),
      },
    ];
  }, [metrics]);

  // Total revenue for plan breakdown percentage calculations
  const totalPlanRevenue = useMemo(() => {
    if (!breakdown?.byPlan) return 0;
    return breakdown.byPlan.reduce((sum, p) => sum + p.revenueCents, 0);
  }, [breakdown]);

  if (loading) {
    return <CircularProgress sx={{ display: "block", mx: "auto", mt: 6 }} />;
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle size={48} />}
        title="Error Loading Data"
        subtitle={error}
        action={{ label: "Retry", onClick: fetchData }}
      />
    );
  }

  return (
    <Box>
      {/* KPI Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {metricCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.title}>
            <DashboardMetricCard
              title={card.title}
              value={card.value}
              icon={card.icon}
              diff={card.diff}
              diffLabel={card.diffLabel}
              showDiff={card.showDiff}
              trendDirection={card.trendDirection}
            />
          </Grid>
        ))}
      </Grid>

      {/* Revenue by Plan */}
      {breakdown?.byPlan?.length > 0 && (
        <DashboardPanel sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
            Revenue by Plan
          </Typography>
          {breakdown.byPlan.map((plan) => {
            const pct = totalPlanRevenue > 0 ? (plan.revenueCents / totalPlanRevenue) * 100 : 0;
            return (
              <Box key={plan.planCode} sx={{ mb: 1.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {plan.planName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                    {formatCents(plan.revenueCents)} ({pct.toFixed(1)}%)
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: alpha(colors.primary, 0.1),
                    overflow: "hidden",
                  }}
                >
                  <Box
                    sx={{
                      height: "100%",
                      width: `${pct}%`,
                      borderRadius: 4,
                      bgcolor: colors.primary,
                      transition: "width 0.5s ease",
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </DashboardPanel>
      )}

      {/* MRR Trend */}
      {breakdown?.mrrTrend?.length > 0 && (
        <DashboardPanel>
          <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
            Monthly Revenue Trend (Last 12 Months)
          </Typography>
          <DashboardTable colors={colors}>
            <TableHead>
              <TableRow>
                <DashboardTableHeadCell>Month</DashboardTableHeadCell>
                <DashboardTableHeadCell align="right">Revenue</DashboardTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {breakdown.mrrTrend.slice(-6).map((m) => (
                <DashboardTableRow key={m.month}>
                  <TableCell sx={{ color: colors.text }}>{m.month}</TableCell>
                  <TableCell align="right" sx={{ color: colors.text }}>
                    {formatCents(m.mrrCents)}
                  </TableCell>
                </DashboardTableRow>
              ))}
            </TableBody>
          </DashboardTable>
        </DashboardPanel>
      )}
    </Box>
  );
});

// ─── Subscriptions Sub-Tab ──────────────────────────────────────────────
const SubscriptionsTab = React.memo(function SubscriptionsTab() {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");

  const fetchSubscriptions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
        status,
      });
      if (search) params.set("search", search);
      const res = await axios.get(`${API_URL}/api/admin/finances/subscriptions?${params}`, {
        withCredentials: true,
      });
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch subscriptions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, status, search]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const handlePageChange = useCallback((_, newPage) => setPage(newPage), []);
  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);
  const handleStatusChange = useCallback((_, val) => {
    if (val) { setStatus(val); setPage(0); }
  }, []);
  const handleSearchChange = useCallback((e) => {
    setSearch(e.target.value);
    setPage(0);
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap" }}>
        <FilterBar label="Status" value={status} onChange={handleStatusChange} options={STATUS_OPTIONS} />
        <SearchBar value={search} onChange={handleSearchChange} placeholder="Search users..." />
      </Box>

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />
      ) : !data?.subscriptions?.length ? (
        <EmptyState title="No subscriptions found" subtitle="Adjust filters or search terms" />
      ) : (
        <>
          <DashboardTable colors={colors}>
            <TableHead>
              <TableRow>
                <DashboardTableHeadCell>User</DashboardTableHeadCell>
                <DashboardTableHeadCell>Email</DashboardTableHeadCell>
                <DashboardTableHeadCell>Plan</DashboardTableHeadCell>
                <DashboardTableHeadCell>Status</DashboardTableHeadCell>
                <DashboardTableHeadCell>Override</DashboardTableHeadCell>
                <DashboardTableHeadCell>Card</DashboardTableHeadCell>
                <DashboardTableHeadCell>Since</DashboardTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.subscriptions.map((sub) => (
                <DashboardTableRow key={sub.userId}>
                  <TableCell sx={{ color: colors.text }}>{sub.userName}</TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.85rem" }}>
                    {sub.userEmail}
                  </TableCell>
                  <TableCell sx={{ color: colors.text }}>{sub.websitePlan}</TableCell>
                  <TableCell>
                    <Chip
                      label={sub.subscriptionStatus}
                      size="small"
                      color={statusChipColor(sub.subscriptionStatus)}
                    />
                  </TableCell>
                  <TableCell sx={{ color: colors.text }}>
                    {sub.hasOverride ? sub.overridePlanCode : "—"}
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.85rem" }}>
                    {sub.cardBrand && sub.cardLast4 ? `${sub.cardBrand} ${sub.cardLast4}` : "—"}
                  </TableCell>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.85rem" }}>
                    {new Date(sub.createdAt).toLocaleDateString()}
                  </TableCell>
                </DashboardTableRow>
              ))}
            </TableBody>
          </DashboardTable>
          <DashboardTablePagination
            count={data.total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}
    </Box>
  );
});

// ─── Transactions Sub-Tab ──��────────────────────────────────────────────
const TransactionsTab = React.memo(function TransactionsTab() {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
        type,
        status,
      });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (search) params.set("search", search);
      const res = await axios.get(`${API_URL}/api/admin/finances/transactions?${params}`, {
        withCredentials: true,
      });
      setData(res.data.data);
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, type, status, startDate, endDate, search]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handlePageChange = useCallback((_, newPage) => setPage(newPage), []);
  const handleRowsPerPageChange = useCallback((e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  }, []);
  const handleTypeChange = useCallback((_, val) => {
    if (val) { setType(val); setPage(0); }
  }, []);
  const handleStatusChange = useCallback((_, val) => {
    if (val) { setStatus(val); setPage(0); }
  }, []);

  return (
    <Box>
      <Box sx={{ display: "flex", gap: 2, mb: 2, flexWrap: "wrap", alignItems: "center" }}>
        <FilterBar label="Type" value={type} onChange={handleTypeChange} options={TXN_TYPE_OPTIONS} />
        <FilterBar label="Status" value={status} onChange={handleStatusChange} options={TXN_STATUS_OPTIONS} />
        <DashboardDateField
          label="Start Date"
          value={startDate}
          onChange={(e) => { setStartDate(e.target.value); setPage(0); }}
        />
        <DashboardDateField
          label="End Date"
          value={endDate}
          onChange={(e) => { setEndDate(e.target.value); setPage(0); }}
        />
        <SearchBar value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} placeholder="Search..." />
      </Box>

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />
      ) : !data?.transactions?.length ? (
        <EmptyState title="No transactions found" subtitle="Adjust filters or date range" />
      ) : (
        <>
          <DashboardTable colors={colors}>
            <TableHead>
              <TableRow>
                <DashboardTableHeadCell>Date</DashboardTableHeadCell>
                <DashboardTableHeadCell>Type</DashboardTableHeadCell>
                <DashboardTableHeadCell>Description</DashboardTableHeadCell>
                <DashboardTableHeadCell>User</DashboardTableHeadCell>
                <DashboardTableHeadCell align="right">Amount</DashboardTableHeadCell>
                <DashboardTableHeadCell>Status</DashboardTableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {data.transactions.map((txn) => (
                <DashboardTableRow key={txn.id}>
                  <TableCell sx={{ color: colors.textSecondary, fontSize: "0.85rem" }}>
                    {new Date(txn.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip label={txn.type} size="small" color={typeChipColor(txn.type)} />
                  </TableCell>
                  <TableCell sx={{ color: colors.text, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {txn.description}
                  </TableCell>
                  <TableCell sx={{ color: colors.text }}>{txn.userName}</TableCell>
                  <TableCell align="right" sx={{ color: colors.text, fontWeight: 500 }}>
                    {formatCents(txn.amountCents)}
                  </TableCell>
                  <TableCell>
                    <Chip label={txn.status} size="small" color={statusChipColor(txn.status)} />
                  </TableCell>
                </DashboardTableRow>
              ))}
            </TableBody>
          </DashboardTable>
          <DashboardTablePagination
            count={data.total}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </>
      )}
    </Box>
  );
});

// ─── Reports Sub-Tab ────────────────────────────────────────────────────
const ReportsTab = React.memo(function ReportsTab() {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [invoiceStart, setInvoiceStart] = useState("");
  const [invoiceEnd, setInvoiceEnd] = useState("");
  const [invoiceFormat, setInvoiceFormat] = useState("csv");

  const [revenueStart, setRevenueStart] = useState("");
  const [revenueEnd, setRevenueEnd] = useState("");
  const [revenueFormat, setRevenueFormat] = useState("csv");

  const [taxStart, setTaxStart] = useState("");
  const [taxEnd, setTaxEnd] = useState("");
  const [taxFormat, setTaxFormat] = useState("csv");

  const [exporting, setExporting] = useState(null);

  const handleExport = useCallback(async (reportType, startDate, endDate, format) => {
    setExporting(reportType);
    try {
      const params = new URLSearchParams({ reportType, format });
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);

      const res = await axios.get(`${API_URL}/api/admin/finances/reports/export?${params}`, {
        withCredentials: true,
        responseType: format === "csv" ? "text" : "json",
      });

      const content = format === "csv" ? res.data : JSON.stringify(res.data.data, null, 2);
      const mimeType = format === "csv" ? "text/csv" : "application/json";
      const ext = format === "csv" ? "csv" : "json";
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `${reportType}-report-${dateStr}.${ext}`;

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`Failed to export ${reportType}:`, err);
    } finally {
      setExporting(null);
    }
  }, []);

  const renderReportCard = (title, description, startDate, setStart, endDate, setEnd, format, setFormat, reportType) => (
    <Grid item xs={12} md={4} key={reportType}>
      <DashboardPanel sx={{ height: "100%" }}>
        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
          {description}
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
          <DashboardDateField label="Start" value={startDate} onChange={(e) => setStart(e.target.value)} />
          <DashboardDateField label="End" value={endDate} onChange={(e) => setEnd(e.target.value)} />
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <ToggleButtonGroup
            value={format}
            exclusive
            onChange={(_, val) => val && setFormat(val)}
            size="small"
          >
            <ToggleButton value="csv">CSV</ToggleButton>
            <ToggleButton value="json">JSON</ToggleButton>
          </ToggleButtonGroup>
          <DashboardGradientButton
            onClick={() => handleExport(reportType, startDate, endDate, format)}
            disabled={exporting === reportType}
            startIcon={<Download size={16} />}
          >
            {exporting === reportType ? "Exporting..." : "Export"}
          </DashboardGradientButton>
        </Box>
      </DashboardPanel>
    </Grid>
  );

  return (
    <Grid container spacing={2}>
      {renderReportCard(
        "Invoice Report",
        "Export all paid invoices for the selected period",
        invoiceStart, setInvoiceStart,
        invoiceEnd, setInvoiceEnd,
        invoiceFormat, setInvoiceFormat,
        "invoices",
      )}
      {renderReportCard(
        "Revenue Report",
        "Monthly revenue breakdown by plan",
        revenueStart, setRevenueStart,
        revenueEnd, setRevenueEnd,
        revenueFormat, setRevenueFormat,
        "revenue",
      )}
      {renderReportCard(
        "Tax Summary",
        "Tax collected per month for accounting",
        taxStart, setTaxStart,
        taxEnd, setTaxEnd,
        taxFormat, setTaxFormat,
        "tax",
      )}
    </Grid>
  );
});

// ─── Main Finances Component ────────────────────────────────────────────
const Finances = React.memo(function Finances({ user, pageTitle, pageSubtitle, subtab, onSubTabChange }) {
  const [activeSubTab, setActiveSubTab] = useState(subtab || "overview");

  const handleTabChange = useCallback(
    (_, newVal) => {
      setActiveSubTab(newVal);
      if (onSubTabChange) onSubTabChange(newVal);
    },
    [onSubTabChange],
  );

  const renderSubTab = useMemo(() => {
    switch (activeSubTab) {
      case "subscriptions":
        return <SubscriptionsTab />;
      case "transactions":
        return <TransactionsTab />;
      case "reports":
        return <ReportsTab />;
      case "overview":
      default:
        return <OverviewTab />;
    }
  }, [activeSubTab]);

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />
      <TabNavigation tabs={SUB_TABS} value={activeSubTab} onChange={handleTabChange} />
      <Box sx={{ mt: 3 }}>{renderSubTab}</Box>
    </Container>
  );
});

export default Finances;
