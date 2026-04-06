import { useState, useEffect } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import axios from "axios";
import {
  Box,
  Card,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  alpha,
  Drawer,
  Button,
  Divider,
  MenuItem,
} from "@mui/material";
import { CircleX, Eye, Receipt, X } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { DashboardSelect, DashboardTable, SearchBar } from "./shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface OrderItem {
  id: string;
  productName: string;
  productSlug: string | null;
  unitPriceCents: number;
  quantity: number;
  subtotalCents: number;
  selectedOptions: any;
}

interface Order {
  id: string;
  storeId: string;
  userId: string | null;
  customerEmail: string;
  customerName: string | null;
  status: string;
  totalCents: number;
  currency: string;
  platformFeePercent: number;
  paymentProcessor: string;
  createdAt: string;
  paidAt: string | null;
  cancelledAt: string | null;
  items?: OrderItem[];
  shippingAddress?: any;
  billingAddress?: any;
}

interface StoreOrdersProps {
  storeId: string;
  storeCurrency: string;
}

const StoreOrders = ({
  storeId,
  storeCurrency: _storeCurrency,
}: StoreOrdersProps) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  // Order detail drawer state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [storeId, statusFilter, debouncedSearch]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = { storeId };
      if (statusFilter !== "ALL") params.status = statusFilter;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();

      const response = await axios.get(`${API_URL}/orders`, {
        params,
        headers: {},
      });
      setOrders(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(err.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetail = async (orderId: string) => {
    try {
      setLoadingDetail(true);
      const response = await axios.get(`${API_URL}/orders/${orderId}`, {
        headers: {},
      });
      setSelectedOrder(response.data.data);
      setDetailDrawerOpen(true);
    } catch (err: any) {
      console.error("Error fetching order detail:", err);
      alert(err.response?.data?.message || "Failed to load order details");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    if (!confirm("Are you sure you want to cancel this order?")) return;

    try {
      setCancellingOrder(true);
      await axios.post(
        `${API_URL}/orders/${selectedOrder.id}/cancel`,
        {},
        { headers: {} },
      );

      // Update order in state
      setSelectedOrder({
        ...selectedOrder,
        status: "CANCELED",
        cancelledAt: new Date().toISOString(),
      });
      setOrders(
        orders.map((o) =>
          o.id === selectedOrder.id ? { ...o, status: "CANCELED" } : o,
        ),
      );

      alert("Order cancelled successfully");
    } catch (err: any) {
      console.error("Error cancelling order:", err);
      alert(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setCancellingOrder(false);
    }
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(cents / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return colors.success;
      case "PENDING":
        return colors.warning;
      case "FAILED":
        return colors.error;
      case "CANCELED":
        return colors.textSecondary;
      default:
        return colors.textSecondary;
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress sx={{ color: colors.primary }} />
      </Box>
    );
  }

  const filteredOrders = orders;

  return (
    <Box>
      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search */}
      <Box sx={{ mb: 3, maxWidth: { xs: "100%", md: 350 } }}>
        <SearchBar
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearchQuery(e.target.value)
          }
          placeholder="Search by customer email or name..."
        />
      </Box>

      {/* Filters */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700 }}>
          Orders ({filteredOrders.length})
        </Typography>
        <DashboardSelect
          size="small"
          label="Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          containerSx={{ minWidth: 150 }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="PENDING">Pending</MenuItem>
          <MenuItem value="PAID">Paid</MenuItem>
          <MenuItem value="FAILED">Failed</MenuItem>
          <MenuItem value="CANCELED">Canceled</MenuItem>
        </DashboardSelect>
      </Box>

      {/* Orders Table */}
      {filteredOrders.length === 0 ? (
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
            p: 6,
            textAlign: "center",
          }}
        >
          <Box sx={{ color: colors.textSecondary, mb: 2 }}>
            <Receipt size={64} />
          </Box>
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
          >
            No orders yet
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {statusFilter === "ALL"
              ? "Your customers will start seeing their orders here once they make purchases"
              : `No orders with status "${statusFilter}"`}
          </Typography>
        </Card>
      ) : (
        <DashboardTable
          colors={colors}
          variant="flat"
          containerProps={{
            component: Card,
            sx: {
              borderRadius: 2,
              border: `1px solid ${colors.panelBorder}`,
              bgcolor: colors.panelBg,
            },
          }}
        >
          <TableHead>
            <TableRow sx={{ background: colors.panelHover }}>
              <TableCell sx={{ color: colors.text, fontWeight: 700 }}>
                Order ID
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 700 }}>
                Customer
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 700 }}>
                Total
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 700 }}>
                Status
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 700 }}>
                Date
              </TableCell>
              <TableCell
                sx={{ color: colors.text, fontWeight: 700 }}
                align="right"
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow
                key={order.id}
                sx={{ "&:hover": { background: colors.panelHover } }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{
                      color: colors.text,
                      fontWeight: 600,
                      fontFamily: "monospace",
                    }}
                  >
                    {order.id.substring(0, 8)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {order.customerName || "Guest"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary }}
                  >
                    {order.customerEmail}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: colors.text, fontWeight: 600 }}>
                  {formatPrice(order.totalCents, order.currency)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status}
                    size="small"
                    sx={{
                      background: getStatusColor(order.status),
                      color: "#fff",
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ color: colors.textSecondary }}>
                  {formatDate(order.createdAt)}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => fetchOrderDetail(order.id)}
                    sx={{ color: colors.primary }}
                  >
                    <Eye size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DashboardTable>
      )}

      {/* Order Detail Drawer */}
      <Drawer
        anchor="right"
        open={detailDrawerOpen}
        onClose={() => setDetailDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 600 },
            background: colors.bgDefault,
            p: 3,
          },
        }}
      >
        {loadingDetail ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress sx={{ color: colors.primary }} />
          </Box>
        ) : selectedOrder ? (
          <Box>
            {/* Header */}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="start"
              mb={3}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ color: colors.text, fontWeight: 700, mb: 0.5 }}
                >
                  Order Details
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary, fontFamily: "monospace" }}
                >
                  {selectedOrder.id}
                </Typography>
              </Box>
              <IconButton
                onClick={() => setDetailDrawerOpen(false)}
                size="small"
              >
                <X size={18} />
              </IconButton>
            </Box>

            {/* Status */}
            <Card sx={{ mb: 3, p: 2, border: `1px solid ${colors.border}` }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary }}
                >
                  Status
                </Typography>
                <Chip
                  label={selectedOrder.status}
                  sx={{
                    background: getStatusColor(selectedOrder.status),
                    color: "#fff",
                    fontWeight: 700,
                  }}
                />
              </Box>
            </Card>

            {/* Customer Info */}
            <Card sx={{ mb: 3, p: 2, border: `1px solid ${colors.border}` }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
              >
                Customer Information
              </Typography>
              <Typography variant="body2" sx={{ color: colors.text, mb: 0.5 }}>
                {selectedOrder.customerName || "Guest Customer"}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                {selectedOrder.customerEmail}
              </Typography>
            </Card>

            {/* Order Items */}
            <Card sx={{ mb: 3, p: 2, border: `1px solid ${colors.border}` }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
              >
                Items
              </Typography>
              {selectedOrder.items?.map((item, index) => (
                <Box
                  key={item.id}
                  sx={{
                    py: 2,
                    borderBottom:
                      index < selectedOrder.items!.length - 1
                        ? `1px solid ${colors.border}`
                        : "none",
                  }}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="start"
                    mb={0.5}
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      {item.productName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: colors.text, fontWeight: 600 }}
                    >
                      {formatPrice(item.subtotalCents, selectedOrder.currency)}
                    </Typography>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary }}
                  >
                    {formatPrice(item.unitPriceCents, selectedOrder.currency)} ×{" "}
                    {item.quantity}
                  </Typography>
                </Box>
              ))}
            </Card>

            {/* Order Summary */}
            <Card sx={{ mb: 3, p: 2, border: `1px solid ${colors.border}` }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
              >
                Order Summary
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary }}
                >
                  Subtotal
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text }}>
                  {formatPrice(
                    selectedOrder.totalCents,
                    selectedOrder.currency,
                  )}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary }}
                >
                  Platform Fee ({selectedOrder.platformFeePercent / 100}%)
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary }}
                >
                  {formatPrice(
                    Math.round(
                      (selectedOrder.totalCents *
                        selectedOrder.platformFeePercent) /
                        10000,
                    ),
                    selectedOrder.currency,
                  )}
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Box display="flex" justifyContent="space-between">
                <Typography
                  variant="body1"
                  sx={{ color: colors.text, fontWeight: 700 }}
                >
                  Total
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ color: colors.text, fontWeight: 700 }}
                >
                  {formatPrice(
                    selectedOrder.totalCents,
                    selectedOrder.currency,
                  )}
                </Typography>
              </Box>
            </Card>

            {/* Payment Info */}
            <Card sx={{ mb: 3, p: 2, border: `1px solid ${colors.border}` }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
              >
                Payment Information
              </Typography>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary }}
                >
                  Payment Processor
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: colors.text, textTransform: "capitalize" }}
                >
                  {selectedOrder.paymentProcessor}
                </Typography>
              </Box>
              {selectedOrder.paidAt && (
                <Box display="flex" justifyContent="space-between">
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textSecondary }}
                  >
                    Paid At
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {formatDate(selectedOrder.paidAt)}
                  </Typography>
                </Box>
              )}
              {selectedOrder.cancelledAt && (
                <Box display="flex" justifyContent="space-between">
                  <Typography
                    variant="body2"
                    sx={{ color: colors.textSecondary }}
                  >
                    Cancelled At
                  </Typography>
                  <Typography variant="body2" sx={{ color: colors.text }}>
                    {formatDate(selectedOrder.cancelledAt)}
                  </Typography>
                </Box>
              )}
            </Card>

            {/* Timestamps */}
            <Card sx={{ mb: 3, p: 2, border: `1px solid ${colors.border}` }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.text, fontWeight: 700, mb: 2 }}
              >
                Timeline
              </Typography>
              <Box display="flex" justifyContent="space-between">
                <Typography
                  variant="body2"
                  sx={{ color: colors.textSecondary }}
                >
                  Created
                </Typography>
                <Typography variant="body2" sx={{ color: colors.text }}>
                  {formatDate(selectedOrder.createdAt)}
                </Typography>
              </Box>
            </Card>

            {/* Actions */}
            {selectedOrder.status === "PENDING" && (
              <Button
                fullWidth
                variant="outlined"
                color="error"
                startIcon={<CircleX size={18} />}
                onClick={handleCancelOrder}
                disabled={cancellingOrder}
                sx={{
                  borderColor: colors.error,
                  color: colors.error,
                  "&:hover": {
                    borderColor: colors.error,
                    background: alpha(colors.error, 0.1),
                  },
                }}
              >
                {cancellingOrder ? (
                  <CircularProgress size={20} />
                ) : (
                  "Cancel Order"
                )}
              </Button>
            )}
          </Box>
        ) : null}
      </Drawer>
    </Box>
  );
};

export default StoreOrders;
