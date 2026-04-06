/**
 * ProductCard — Step 2.26.2
 *
 * Reusable card component for a single product, used in grid, list, and carousel layouts.
 * Displays: product image, name, price (formatted), stock badge, description excerpt, and CTA.
 *
 * Performance: wrapped in React.memo
 * Accessibility: role="article", aria-labels
 * Security: no dangerouslySetInnerHTML — all text rendered as text nodes
 *           Image URLs validated to reject javascript: protocol
 */

import React, { useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
  Button,
} from "@mui/material";

/* ===================== Types ===================== */

export interface Product {
  id: number | string;
  name: string;
  slug: string;
  description?: string | null;
  priceCents: number;
  currency?: string | null;
  status: "active" | "draft" | "archived";
  stockStatus: "in_stock" | "out_of_stock" | "pre_order" | "discontinued";
  imageUrls?: string[] | null;
  category?: string | null;
}

export interface ProductCardConfig {
  showPrice: boolean;
  showStock: boolean;
  showDescription: boolean;
  showQuickView: boolean;
  ctaText: string;
  ctaLink?: string;
}

export interface ProductCardColors {
  primaryColor: string;
  headingColor: string;
  bodyColor: string;
}

export interface ProductCardProps {
  product: Product;
  config: ProductCardConfig;
  colors: ProductCardColors;
  onQuickView?: (product: Product) => void;
  onCtaClick?: (product: Product) => void;
}

/* ===================== Helpers ===================== */

/**
 * Validate a URL string — reject javascript: protocol to prevent XSS.
 * Returns the URL if safe, empty string otherwise.
 */
function safeUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim().toLowerCase();
  if (trimmed.startsWith("javascript:")) return "";
  return url.trim();
}

/**
 * Format priceCents as a locale currency string.
 */
function formatPrice(priceCents: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(priceCents / 100);
  } catch {
    return `$${(priceCents / 100).toFixed(2)}`;
  }
}

/**
 * Truncate text to a maximum character count.
 */
function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/* ===================== Stock Badge ===================== */

const STOCK_CONFIG: Record<
  Product["stockStatus"],
  { label: string; color: "success" | "error" | "warning" | "default" }
> = {
  in_stock: { label: "In Stock", color: "success" },
  out_of_stock: { label: "Out of Stock", color: "error" },
  pre_order: { label: "Pre-order", color: "warning" },
  discontinued: { label: "Discontinued", color: "default" },
};

/* ===================== Component ===================== */

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  config,
  colors,
  onQuickView,
  onCtaClick,
}) => {
  const { showPrice, showStock, showDescription, showQuickView, ctaText } =
    config;
  const { primaryColor, headingColor, bodyColor } = colors;

  const currency = product.currency || "USD";
  const imageUrl = safeUrl(product.imageUrls?.[0]);
  const descriptionExcerpt = truncate(product.description, 100);
  const formattedPrice = formatPrice(product.priceCents, currency);
  const stockInfo =
    STOCK_CONFIG[product.stockStatus] ?? STOCK_CONFIG.discontinued;

  const handleCardClick = useCallback(() => {
    if (showQuickView && onQuickView) {
      onQuickView(product);
    }
  }, [showQuickView, onQuickView, product]);

  const handleCtaClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onCtaClick) {
        onCtaClick(product);
      }
    },
    [onCtaClick, product],
  );

  return (
    <Card
      component="article"
      role="article"
      aria-label={`Product: ${product.name}`}
      onClick={handleCardClick}
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: showQuickView && onQuickView ? "pointer" : "default",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
    >
      {/* Product Image — 4:3 aspect ratio */}
      {imageUrl ? (
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            aspectRatio: "4/3",
            bgcolor: "grey.100",
          }}
        >
          <CardMedia
            component="img"
            image={imageUrl}
            alt={product.name}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          />
        </Box>
      ) : (
        /* Fallback placeholder when no image available */
        <Box
          data-testid="product-card-image-placeholder"
          sx={{
            aspectRatio: "4/3",
            bgcolor: "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="No product image available"
        >
          <Typography variant="caption" color="text.disabled">
            No image
          </Typography>
        </Box>
      )}

      <CardContent
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          p: 2,
        }}
      >
        {/* Category chip */}
        {product.category && (
          <Box>
            <Chip
              label={product.category}
              size="small"
              sx={{
                bgcolor: `${primaryColor}1A`,
                color: primaryColor,
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          </Box>
        )}

        {/* Product name */}
        <Typography
          variant="h6"
          component="h3"
          sx={{
            color: headingColor,
            fontWeight: 700,
            lineHeight: 1.3,
            fontSize: { xs: "0.95rem", sm: "1rem" },
          }}
        >
          {product.name}
        </Typography>

        {/* Price */}
        {showPrice && (
          <Typography
            variant="subtitle1"
            component="p"
            aria-label={`Price: ${formattedPrice}`}
            sx={{ color: primaryColor, fontWeight: 700, fontSize: "1.1rem" }}
          >
            {formattedPrice}
          </Typography>
        )}

        {/* Stock badge */}
        {showStock && (
          <Box>
            <Chip
              label={stockInfo.label}
              size="small"
              color={stockInfo.color}
              variant="outlined"
              aria-label={`Stock status: ${stockInfo.label}`}
            />
          </Box>
        )}

        {/* Description */}
        {showDescription && descriptionExcerpt && (
          <Typography
            variant="body2"
            data-testid="product-card-description"
            sx={{ color: bodyColor, lineHeight: 1.6, flexGrow: 1 }}
          >
            {descriptionExcerpt}
          </Typography>
        )}

        {/* CTA Button */}
        {ctaText && (
          <Box sx={{ mt: "auto", pt: 1 }}>
            <Button
              variant="contained"
              size="small"
              onClick={handleCtaClick}
              aria-label={`${ctaText}: ${product.name}`}
              sx={{
                bgcolor: primaryColor,
                color: "white",
                fontWeight: 600,
                fontSize: "0.8rem",
                width: "100%",
                "&:hover": {
                  bgcolor: primaryColor,
                  opacity: 0.9,
                },
              }}
            >
              {ctaText}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

ProductCard.displayName = "ProductCard";

export default React.memo(ProductCard);
