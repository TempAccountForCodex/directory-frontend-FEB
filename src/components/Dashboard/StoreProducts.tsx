import { useState, useEffect } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  IconButton,
  alpha,
  MenuItem,
  Switch,
  FormControlLabel,
} from "@mui/material";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import {
  DashboardActionButton,
  DashboardInput,
  DashboardSelect,
  DashboardTable,
  SearchBar,
  FilterBar,
  EmptyState,
} from "./shared";
import type { PlanSummary } from "../../hooks/usePlanSummary";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface Product {
  id: string;
  name: string;
  slug: string;
  priceCents: number;
  currency: string;
  isActive: boolean;
  stockStatus: string;
  productType: string;
  description?: string;
  imageUrls?: string[];
  createdAt: string;
}

interface StoreProductsProps {
  storeId: string;
  storeCurrency: string;
  onPlanLimitReached: (message: string, type: "stores" | "products") => void;
  planSummary: PlanSummary | null;
}

const StoreProducts = ({
  storeId,
  storeCurrency,
  onPlanLimitReached,
  planSummary,
}: StoreProductsProps) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebouncedValue(searchQuery, 300);
  const [activeFilter, setActiveFilter] = useState("all"); // 'all' | 'true' | 'false'

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    priceCents: "",
    description: "",
    productType: "physical",
    stockStatus: "in_stock",
    isActive: true,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [storeId, debouncedSearch, activeFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: Record<string, string> = { storeId };
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      if (activeFilter !== "all") params.isActive = activeFilter;
      const response = await axios.get(`${API_URL}/products`, {
        params,
        headers: {},
      });
      setProducts(response.data.data || []);
    } catch (err: any) {
      console.error("Error fetching products:", err);
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        slug: product.slug,
        priceCents: (product.priceCents / 100).toString(),
        description: product.description || "",
        productType: product.productType || "physical",
        stockStatus: product.stockStatus || "in_stock",
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        slug: "",
        priceCents: "",
        description: "",
        productType: "physical",
        stockStatus: "in_stock",
        isActive: true,
      });
    }
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setFormError(null);

      const payload = {
        ...formData,
        priceCents: Math.round(parseFloat(formData.priceCents) * 100),
        storeId,
      };

      if (editingProduct) {
        // Update existing product
        const response = await axios.put(
          `${API_URL}/products/${editingProduct.id}`,
          payload,
          {
            headers: {},
          },
        );
        setProducts(
          products.map((p) =>
            p.id === editingProduct.id ? response.data.data : p,
          ),
        );
      } else {
        // Create new product
        const response = await axios.post(`${API_URL}/products`, payload, {
          headers: {},
        });
        setProducts([...products, response.data.data]);
      }

      setDialogOpen(false);
    } catch (err: any) {
      console.error("Error saving product:", err);

      // Check if error is a plan limit error
      if (err.response?.data?.code === "PLAN_LIMIT_REACHED") {
        setDialogOpen(false);
        onPlanLimitReached(err.response.data.message, "products");
      } else {
        setFormError(err.response?.data?.message || "Failed to save product");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Are you sure you want to deactivate this product?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/products/${productId}`, {
        headers: {},
      });
      setProducts(
        products.map((p) =>
          p.id === productId ? { ...p, isActive: false } : p,
        ),
      );
    } catch (err: any) {
      console.error("Error deleting product:", err);
      alert(err.response?.data?.message || "Failed to delete product");
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const formatPrice = (cents: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(cents / 100);
  };

  // Calculate product usage
  const maxProducts = planSummary?.storePlan?.maxProductsPerStore || 0;
  const productsCount = products.length;
  const canAddProduct = productsCount < maxProducts;
  const usagePercentage = (productsCount / maxProducts) * 100;

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

  return (
    <Box>
      {/* Product Usage Info */}
      <Card
        sx={{
          mb: 3,
          background: alpha(colors.primary, 0.05),
          borderRadius: 2,
          border: `1px solid ${alpha(colors.primary, 0.1)}`,
          p: 2,
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography
            variant="body2"
            sx={{ color: colors.text, fontWeight: 600 }}
          >
            Products
          </Typography>
          <Typography variant="body2" sx={{ color: colors.textSecondary }}>
            {productsCount} / {maxProducts}
          </Typography>
        </Box>
        <Box
          sx={{
            width: "100%",
            height: 8,
            background: alpha(colors.primary, 0.1),
            borderRadius: 4,
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              width: `${Math.min(usagePercentage, 100)}%`,
              height: "100%",
              background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)`,
              transition: "width 0.3s ease",
            }}
          />
        </Box>
        {usagePercentage >= 80 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            You're approaching your product limit. Consider upgrading for more
            products.
          </Alert>
        )}
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={3}
      >
        <Box sx={{ flex: 1, maxWidth: { xs: "100%", md: 350 } }}>
          <SearchBar
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            placeholder="Search by name or SKU..."
          />
        </Box>
        <FilterBar
          label="Status"
          value={activeFilter}
          onChange={(e: any) => setActiveFilter(e.target.value)}
          options={[
            { value: "all", label: "All" },
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
        />
      </Box>

      {/* Add Product Button */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h6" sx={{ color: colors.text, fontWeight: 700 }}>
          Products ({productsCount})
        </Typography>
        <DashboardActionButton
          startIcon={<Plus size={18} />}
          onClick={() => handleOpenDialog()}
          disabled={!canAddProduct}
        >
          Add Product
        </DashboardActionButton>
      </Box>

      {/* Products Table */}
      {products.length === 0 ? (
        <Card
          sx={{
            borderRadius: 3,
            border: `1px solid ${colors.border}`,
            p: 6,
            textAlign: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 700, mb: 1 }}
          >
            No products yet
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.textSecondary, mb: 3 }}
          >
            Add your first product to start selling
          </Typography>
          {canAddProduct && (
            <DashboardActionButton
              startIcon={<Plus size={18} />}
              onClick={() => handleOpenDialog()}
            >
              Add First Product
            </DashboardActionButton>
          )}
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
                Name
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 700 }}>
                Price
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 700 }}>
                Stock
              </TableCell>
              <TableCell sx={{ color: colors.text, fontWeight: 700 }}>
                Status
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
            {products.map((product) => (
              <TableRow
                key={product.id}
                sx={{ "&:hover": { background: colors.panelHover } }}
              >
                <TableCell>
                  <Typography
                    variant="body2"
                    sx={{ color: colors.text, fontWeight: 600 }}
                  >
                    {product.name}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary }}
                  >
                    /{product.slug}
                  </Typography>
                </TableCell>
                <TableCell sx={{ color: colors.text }}>
                  {formatPrice(product.priceCents, product.currency)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.stockStatus?.replace("_", " ") || "in stock"}
                    size="small"
                    sx={{
                      background:
                        product.stockStatus === "in_stock"
                          ? colors.success
                          : colors.warning,
                      color: "#fff",
                      textTransform: "capitalize",
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.isActive ? "Active" : "Inactive"}
                    size="small"
                    sx={{
                      background: product.isActive
                        ? colors.success
                        : colors.error,
                      color: "#fff",
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(product)}
                    sx={{ color: colors.primary, mr: 1 }}
                  >
                    <Pencil size={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(product.id)}
                    sx={{ color: colors.error }}
                    disabled={!product.isActive}
                  >
                    <Trash2 size={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DashboardTable>
      )}

      {/* Product Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
            background: colors.cardBg,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: colors.text,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {editingProduct ? "Edit Product" : "Add New Product"}
          <IconButton onClick={() => setDialogOpen(false)} size="small">
            <X size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {formError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setFormError(null)}
            >
              {formError}
            </Alert>
          )}

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <DashboardInput
              label="Product Name"
              labelPlacement="floating"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: !editingProduct ? generateSlug(name) : formData.slug,
                });
              }}
              fullWidth
              required
            />

            <DashboardInput
              label="Product Slug"
              labelPlacement="floating"
              value={formData.slug}
              onChange={(e) =>
                setFormData({ ...formData, slug: e.target.value })
              }
              fullWidth
              required
              disabled={!!editingProduct}
              helperText={
                editingProduct
                  ? "Slug cannot be changed after creation"
                  : "Used in product URL"
              }
            />

            <DashboardInput
              label={`Price (${storeCurrency})`}
              labelPlacement="floating"
              value={formData.priceCents}
              onChange={(e) =>
                setFormData({ ...formData, priceCents: e.target.value })
              }
              fullWidth
              required
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Price in major units (e.g., 19.99)"
            />

            <DashboardInput
              label="Description"
              labelPlacement="floating"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />

            <Box display="flex" gap={2}>
              <DashboardSelect
                fullWidth
                label="Product Type"
                value={formData.productType}
                onChange={(e) =>
                  setFormData({ ...formData, productType: e.target.value })
                }
              >
                <MenuItem value="physical">Physical</MenuItem>
                <MenuItem value="digital">Digital</MenuItem>
              </DashboardSelect>

              <DashboardSelect
                fullWidth
                label="Stock Status"
                value={formData.stockStatus}
                onChange={(e) =>
                  setFormData({ ...formData, stockStatus: e.target.value })
                }
              >
                <MenuItem value="in_stock">In Stock</MenuItem>
                <MenuItem value="out_of_stock">Out of Stock</MenuItem>
                <MenuItem value="preorder">Pre-order</MenuItem>
              </DashboardSelect>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  sx={{
                    "& .MuiSwitch-switchBase.Mui-checked": {
                      color: colors.primary,
                    },
                    "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                      backgroundColor: colors.primary,
                    },
                  }}
                />
              }
              label="Active"
              sx={{ color: colors.text }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button
            onClick={() => setDialogOpen(false)}
            sx={{
              color: colors.textSecondary,
              "&:hover": { background: alpha(colors.textSecondary, 0.1) },
            }}
          >
            Cancel
          </Button>
          <DashboardActionButton
            onClick={handleSubmit}
            disabled={
              !formData.name ||
              !formData.slug ||
              !formData.priceCents ||
              submitting
            }
            sx={{ px: 3 }}
          >
            {submitting ? (
              <CircularProgress size={20} sx={{ color: "inherit" }} />
            ) : editingProduct ? (
              "Save Changes"
            ) : (
              "Add Product"
            )}
          </DashboardActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StoreProducts;
