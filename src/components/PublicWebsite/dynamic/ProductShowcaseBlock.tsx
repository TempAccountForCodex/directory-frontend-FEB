/**
 * ProductShowcaseBlock — Step 2.26.3
 *
 * Main renderer component for PRODUCT_SHOWCASE block type.
 * Registered in BlockRenderer.tsx switch statement.
 *
 * Features:
 * - Dynamic data fetching via useDynamicBlockData
 * - Search bar (debounced 300ms)
 * - Sort dropdown: Price Low-High, Price High-Low, Newest, Name A-Z
 * - Filter sidebar (price range, stock status) when showFilters=true
 * - Grid / List / Carousel layouts
 * - Quick view MUI Dialog
 * - MUI Pagination
 *
 * Performance: React.memo
 * Accessibility: aria-labels, semantic HTML
 * Security: no dangerouslySetInnerHTML, URL validation
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CloseIcon from "@mui/icons-material/Close";
import Checkbox from "@mui/material/Checkbox";
import { useNavigate } from "react-router-dom";
import useTenantUrl from "../../../hooks/useTenantUrl";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";
import ProductCard, {
  type Product,
  type ProductCardConfig,
  type ProductCardColors,
} from "./ProductCard";

/* ===================== Types ===================== */

interface Block {
  id: number;
  blockType: string;
  content: ProductShowcaseContent;
  sortOrder: number;
}

interface ProductShowcaseContent {
  heading?: string;
  layout?: "grid" | "list" | "carousel";
  columns?: number;
  productsPerPage?: number;
  showPrice?: boolean;
  showStock?: boolean;
  showDescription?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showSort?: boolean;
  showPagination?: boolean;
  showQuickView?: boolean;
  categoryFilter?: string;
  priceMin?: number;
  priceMax?: number;
  sortBy?: string;
  ctaText?: string;
  ctaLink?: string;
  scope?: string;
  emptyMessage?: string;
  currency?: string;
  // Dynamic data fields
  products?: Product[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

interface ProductShowcaseBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

/* ===================== Constants ===================== */

const DEBOUNCE_MS = 300;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
];

const STOCK_STATUS_OPTIONS: Array<{
  value: Product["stockStatus"];
  label: string;
}> = [
  { value: "in_stock", label: "In Stock" },
  { value: "out_of_stock", label: "Out of Stock" },
  { value: "pre_order", label: "Pre-order" },
];

/* ===================== Skeleton ===================== */

const ProductShowcaseSkeleton: React.FC<{ columns: number }> = React.memo(
  ({ columns }) => {
    const colWidth = `repeat(${Math.min(columns, 4)}, 1fr)`;
    return (
      <Container sx={{ py: 6 }}>
        <Skeleton
          variant="text"
          sx={{ fontSize: "2rem", mb: 4, width: "40%", mx: "auto" }}
        />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: colWidth,
            },
            gap: 3,
          }}
        >
          {Array.from({ length: Math.min(columns * 2, 8) }).map((_, i) => (
            <Box key={i}>
              <Skeleton
                variant="rectangular"
                height={160}
                sx={{ borderRadius: 1, mb: 1 }}
              />
              <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 0.5 }} />
              <Skeleton
                variant="text"
                sx={{ fontSize: "0.875rem", width: "60%" }}
              />
            </Box>
          ))}
        </Box>
      </Container>
    );
  },
);

ProductShowcaseSkeleton.displayName = "ProductShowcaseSkeleton";

/* ===================== Quick View Dialog ===================== */

interface QuickViewDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  primaryColor: string;
  headingColor: string;
  bodyColor: string;
  ctaText: string;
  onCtaClick?: (product: Product) => void;
}

const QuickViewDialog: React.FC<QuickViewDialogProps> = React.memo(
  ({
    product,
    open,
    onClose,
    primaryColor,
    headingColor,
    bodyColor,
    ctaText,
    onCtaClick,
  }) => {
    if (!product) return null;

    const imageUrl = product.imageUrls?.[0]
      ?.trim()
      .toLowerCase()
      .startsWith("javascript:")
      ? ""
      : (product.imageUrls?.[0] ?? "");

    const formattedPrice = (() => {
      try {
        return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: product.currency || "USD",
        }).format(product.priceCents / 100);
      } catch {
        return `$${(product.priceCents / 100).toFixed(2)}`;
      }
    })();

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="quick-view-title"
      >
        <DialogTitle
          id="quick-view-title"
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            component="span"
            sx={{ color: headingColor, fontWeight: 700 }}
          >
            {product.name}
          </Typography>
          <IconButton
            onClick={onClose}
            aria-label="Close quick view"
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Large product image */}
          {imageUrl && (
            <Box
              component="img"
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              sx={{
                width: "100%",
                maxHeight: 320,
                objectFit: "contain",
                borderRadius: 1,
                mb: 2,
                bgcolor: "grey.50",
              }}
            />
          )}

          {/* Price */}
          <Typography
            variant="h5"
            sx={{ color: primaryColor, fontWeight: 700, mb: 1 }}
            aria-label={`Price: ${formattedPrice}`}
          >
            {formattedPrice}
          </Typography>

          {/* Stock status */}
          {product.stockStatus && (
            <Chip
              label={
                product.stockStatus === "in_stock"
                  ? "In Stock"
                  : product.stockStatus === "out_of_stock"
                    ? "Out of Stock"
                    : product.stockStatus === "pre_order"
                      ? "Pre-order"
                      : "Discontinued"
              }
              color={
                product.stockStatus === "in_stock"
                  ? "success"
                  : product.stockStatus === "out_of_stock"
                    ? "error"
                    : product.stockStatus === "pre_order"
                      ? "warning"
                      : "default"
              }
              variant="outlined"
              size="small"
              sx={{ mb: 2 }}
            />
          )}

          {/* Full description */}
          {product.description && (
            <Typography
              variant="body1"
              sx={{ color: bodyColor, lineHeight: 1.7, mb: 2 }}
            >
              {product.description}
            </Typography>
          )}

          {/* Category */}
          {product.category && (
            <Typography
              variant="caption"
              sx={{ color: bodyColor, display: "block", mb: 2 }}
            >
              Category: {product.category}
            </Typography>
          )}

          {/* CTA */}
          {ctaText && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => onCtaClick && onCtaClick(product)}
              aria-label={`${ctaText}: ${product.name}`}
              sx={{
                bgcolor: primaryColor,
                color: "white",
                fontWeight: 600,
                "&:hover": { bgcolor: primaryColor, opacity: 0.9 },
              }}
            >
              {ctaText}
            </Button>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);

QuickViewDialog.displayName = "QuickViewDialog";

/* ===================== Main Component ===================== */

const ProductShowcaseBlockBase: React.FC<ProductShowcaseBlockProps> = ({
  block,
  primaryColor = "#378C92",
  headingColor = "#252525",
  bodyColor = "#6A6F78",
  onCtaClick,
}) => {
  const { content } = block;

  const {
    heading = "Our Products",
    layout = "grid",
    columns = 4,
    productsPerPage = 12,
    showPrice = true,
    showStock = true,
    showDescription = true,
    showSearch = true,
    showFilters = false,
    showSort = true,
    showPagination = true,
    showQuickView = true,
    emptyMessage = "No products available yet. Check back soon!",
    ctaText = "View Details",
    ctaLink = "",
    currency = "USD",
    sortBy: configSortBy = "newest",
  } = content;

  /* --- Tenant-aware navigation --- */
  const navigate = useNavigate();
  const { buildUrl } = useTenantUrl();

  /* --- Local state --- */
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentSortBy, setCurrentSortBy] = useState(configSortBy);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(
    null,
  );
  const [stockFilter, setStockFilter] = useState<Product["stockStatus"][]>([]);
  const [priceMinFilter, setPriceMinFilter] = useState<number>(
    content.priceMin ?? 0,
  );
  const [priceMaxFilter, setPriceMaxFilter] = useState<number>(
    content.priceMax ?? 0,
  );

  /* --- Debounce search --- */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, DEBOUNCE_MS);
    },
    [],
  );

  /* --- Cleanup debounce on unmount --- */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  /* --- Dynamic data source query string --- */
  const dataSource = useMemo(() => {
    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(productsPerPage),
      sortBy: currentSortBy,
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (content.categoryFilter) params.set("category", content.categoryFilter);
    return `products?${params.toString()}`;
  }, [
    currentPage,
    productsPerPage,
    currentSortBy,
    debouncedSearch,
    content.categoryFilter,
  ]);

  /* --- Fetch data via useDynamicBlockData --- */
  const { data, loading, error } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
  );

  /* --- Resolve products from dynamic data or SSR content --- */
  const allProducts: Product[] = useMemo(() => {
    if (data?.products) return data.products;
    if (content.products) return content.products;
    return [];
  }, [data, content.products]);

  const pagination = useMemo(() => {
    if (data?.pagination) return data.pagination;
    if (content.pagination) return content.pagination;
    return null;
  }, [data, content.pagination]);

  /* --- Client-side filtering (for stock and price, if showFilters) --- */
  const filteredProducts: Product[] = useMemo(() => {
    let result = allProducts;

    // Stock filter
    if (stockFilter.length > 0) {
      result = result.filter((p) => stockFilter.includes(p.stockStatus));
    }

    // Price filter (only if priceMax > 0)
    if (priceMaxFilter > 0) {
      result = result.filter((p) => {
        const price = p.priceCents / 100;
        if (priceMinFilter > 0 && price < priceMinFilter) return false;
        if (price > priceMaxFilter) return false;
        return true;
      });
    }

    // Search (client-side fallback when server doesn't filter)
    if (debouncedSearch && !data) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    return result;
  }, [
    allProducts,
    stockFilter,
    priceMinFilter,
    priceMaxFilter,
    debouncedSearch,
    data,
  ]);

  /* --- Responsive grid columns --- */
  const mdCols = useMemo(
    () => Math.floor(12 / Math.min(columns, 6)) as 1 | 2 | 3 | 4 | 6 | 12,
    [columns],
  );

  /* --- Card config and colors --- */
  const cardConfig: ProductCardConfig = useMemo(
    () => ({
      showPrice,
      showStock,
      showDescription,
      showQuickView,
      ctaText,
      ctaLink,
    }),
    [showPrice, showStock, showDescription, showQuickView, ctaText, ctaLink],
  );

  const cardColors: ProductCardColors = useMemo(
    () => ({ primaryColor, headingColor, bodyColor }),
    [primaryColor, headingColor, bodyColor],
  );

  /* --- Event handlers --- */
  const handleQuickView = useCallback((product: Product) => {
    setQuickViewProduct(product);
  }, []);

  const handleQuickViewClose = useCallback(() => {
    setQuickViewProduct(null);
  }, []);

  const handleCtaClick = useCallback(
    (product: Product) => {
      if (onCtaClick) {
        onCtaClick(block.blockType, ctaText);
      }
      // Build URL: replace {slug} pattern or navigate
      let url = ctaLink || `/products/${product.slug}`;
      if (url.includes("{slug}")) {
        url = url.replace("{slug}", product.slug);
      }
      // Safety: reject javascript: protocol
      if (url.trim().toLowerCase().startsWith("javascript:")) return;
      if (url.startsWith("http://") || url.startsWith("https://")) {
        window.location.href = url;
      } else {
        navigate(buildUrl(url));
      }
    },
    [onCtaClick, block.blockType, ctaText, ctaLink, navigate, buildUrl],
  );

  const handleSortChange = useCallback((e: { target: { value: string } }) => {
    setCurrentSortBy(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setCurrentPage(page);
    },
    [],
  );

  const handleStockFilterChange = useCallback(
    (status: Product["stockStatus"]) => {
      setStockFilter((prev) =>
        prev.includes(status)
          ? prev.filter((s) => s !== status)
          : [...prev, status],
      );
    },
    [],
  );

  /* --- Carousel state --- */
  const carouselRef = useRef<HTMLDivElement>(null);
  const handleCarouselPrev = useCallback(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  }, []);
  const handleCarouselNext = useCallback(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  }, []);

  /* --- Render: Loading state (initial) --- */
  if (loading && !allProducts.length) {
    return <ProductShowcaseSkeleton columns={columns} />;
  }

  /* --- Render: Error state --- */
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      component="section"
      aria-label={heading || "Product Showcase"}
      sx={{ py: 8, bgcolor: "background.default" }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        {heading && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              sx={{ fontWeight: 700, color: headingColor }}
            >
              {heading}
            </Typography>
          </Box>
        )}

        {/* Controls row: Search + Sort */}
        {(showSearch || showSort) && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              mb: 3,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {showSearch && (
              <TextField
                variant="outlined"
                placeholder="Search products..."
                value={searchQuery}
                onChange={handleSearchChange}
                inputProps={{ "aria-label": "Search products" }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: bodyColor }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ maxWidth: 360, flexGrow: 1 }}
                size="small"
              />
            )}
            {showSort && (
              <Select
                value={currentSortBy}
                onChange={handleSortChange}
                size="small"
                aria-label="Sort products"
                sx={{ minWidth: 180 }}
              >
                {SORT_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            )}
          </Box>
        )}

        {/* Main layout: optional filter sidebar + product grid */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            alignItems: "flex-start",
          }}
        >
          {/* Filter Sidebar */}
          {showFilters && (
            <Box
              component="aside"
              aria-label="Product filters"
              sx={{
                minWidth: 200,
                maxWidth: 240,
                p: 2,
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 2,
                flexShrink: 0,
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, mb: 2, color: headingColor }}
              >
                Filters
              </Typography>

              {/* Price Range */}
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: bodyColor }}
              >
                Price Range
              </Typography>
              <Box sx={{ display: "flex", gap: 1, mt: 0.5, mb: 2 }}>
                <TextField
                  label="Min"
                  type="number"
                  size="small"
                  value={priceMinFilter || ""}
                  onChange={(e) =>
                    setPriceMinFilter(Number(e.target.value) || 0)
                  }
                  inputProps={{ min: 0, "aria-label": "Minimum price" }}
                  sx={{ width: 80 }}
                />
                <TextField
                  label="Max"
                  type="number"
                  size="small"
                  value={priceMaxFilter || ""}
                  onChange={(e) =>
                    setPriceMaxFilter(Number(e.target.value) || 0)
                  }
                  inputProps={{ min: 0, "aria-label": "Maximum price" }}
                  sx={{ width: 80 }}
                />
              </Box>

              {/* Stock Status */}
              <Typography
                variant="caption"
                sx={{ fontWeight: 600, color: bodyColor }}
              >
                Stock Status
              </Typography>
              <Stack spacing={0} sx={{ mt: 0.5 }}>
                {STOCK_STATUS_OPTIONS.map((opt) => (
                  <FormControlLabel
                    key={opt.value}
                    control={
                      <Checkbox
                        checked={stockFilter.includes(opt.value)}
                        onChange={() => handleStockFilterChange(opt.value)}
                        size="small"
                        aria-label={`Filter by ${opt.label}`}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: bodyColor }}>
                        {opt.label}
                      </Typography>
                    }
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Products Area */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {/* Loading indicator for subsequent loads */}
            {loading && allProducts.length > 0 && (
              <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {/* Empty state */}
            {filteredProducts.length === 0 ? (
              <Box
                sx={{ textAlign: "center", py: 8 }}
                role="status"
                aria-label="No products found"
              >
                <Typography variant="body1" sx={{ color: bodyColor }}>
                  {emptyMessage}
                </Typography>
              </Box>
            ) : layout === "list" ? (
              /* List Layout */
              <Stack spacing={2}>
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    config={cardConfig}
                    colors={cardColors}
                    onQuickView={showQuickView ? handleQuickView : undefined}
                    onCtaClick={handleCtaClick}
                  />
                ))}
              </Stack>
            ) : layout === "carousel" ? (
              /* Carousel Layout */
              <Box sx={{ position: "relative" }}>
                <IconButton
                  onClick={handleCarouselPrev}
                  aria-label="Previous products"
                  sx={{
                    position: "absolute",
                    left: -20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    bgcolor: "white",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <Box
                  ref={carouselRef}
                  sx={{
                    display: "flex",
                    gap: 2,
                    overflowX: "auto",
                    scrollSnapType: "x mandatory",
                    pb: 1,
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": {
                      bgcolor: "grey.300",
                      borderRadius: 3,
                    },
                  }}
                  role="list"
                  aria-label="Product carousel"
                >
                  {filteredProducts.map((product) => (
                    <Box
                      key={product.id}
                      role="listitem"
                      sx={{
                        minWidth: 260,
                        maxWidth: 280,
                        scrollSnapAlign: "start",
                        flexShrink: 0,
                      }}
                    >
                      <ProductCard
                        product={product}
                        config={cardConfig}
                        colors={cardColors}
                        onQuickView={
                          showQuickView ? handleQuickView : undefined
                        }
                        onCtaClick={handleCtaClick}
                      />
                    </Box>
                  ))}
                </Box>
                <IconButton
                  onClick={handleCarouselNext}
                  aria-label="Next products"
                  sx={{
                    position: "absolute",
                    right: -20,
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    bgcolor: "white",
                    boxShadow: 2,
                    "&:hover": { bgcolor: "grey.100" },
                  }}
                >
                  <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              /* Grid Layout (default) */
              <Grid container spacing={3}>
                {filteredProducts.map((product) => (
                  <Grid item xs={12} sm={6} md={mdCols} key={product.id}>
                    <ProductCard
                      product={product}
                      config={cardConfig}
                      colors={cardColors}
                      onQuickView={showQuickView ? handleQuickView : undefined}
                      onCtaClick={handleCtaClick}
                    />
                  </Grid>
                ))}
              </Grid>
            )}

            {/* Pagination */}
            {showPagination && pagination && pagination.totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  aria-label="Product pagination"
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>

      {/* Quick View Dialog */}
      <QuickViewDialog
        product={quickViewProduct}
        open={quickViewProduct !== null}
        onClose={handleQuickViewClose}
        primaryColor={primaryColor}
        headingColor={headingColor}
        bodyColor={bodyColor}
        ctaText={ctaText}
        onCtaClick={handleCtaClick}
      />
    </Box>
  );
};

ProductShowcaseBlockBase.displayName = "ProductShowcaseBlock";

const ProductShowcaseBlock = React.memo(ProductShowcaseBlockBase);
ProductShowcaseBlock.displayName = "ProductShowcaseBlock";

export default ProductShowcaseBlock;
