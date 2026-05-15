/**
 * ListingCard — Step 2.27.2
 *
 * Reusable card component for a single directory listing entry.
 * Displays: business logo/image, name, category badge, star rating,
 *           phone number, address, and short description.
 * Click navigates to listing detail page.
 *
 * Follows ProductCard.tsx pattern exactly.
 *
 * Performance: wrapped in React.memo
 * Accessibility: role="article", aria-labels on interactive elements
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
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";

/* ===================== Types ===================== */

export interface Listing {
  id: number | string;
  slug: string;
  businessName: string;
  businessCategory?: string | null;
  shortDescription?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  isRemoteOnly?: boolean;
}

export interface ListingCardConfig {
  showRating: boolean;
  showPhone: boolean;
  showAddress: boolean;
}

export interface ListingCardColors {
  primaryColor: string;
  headingColor: string;
  bodyColor: string;
}

export interface ListingCardProps {
  listing: Listing;
  config: ListingCardConfig;
  colors: ListingCardColors;
  onListingClick?: (listing: Listing) => void;
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
 * Build a readable address string from listing location fields.
 */
function buildAddress(listing: Listing): string {
  const parts: string[] = [];
  if (listing.city) parts.push(listing.city);
  if (listing.region && listing.region !== listing.city)
    parts.push(listing.region);
  if (listing.country) parts.push(listing.country);
  if (listing.isRemoteOnly && parts.length === 0) return "Remote / Online";
  return parts.join(", ");
}

/**
 * Truncate text to a maximum character count.
 */
function truncate(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

/**
 * Render star rating (filled stars) up to 5.
 */
function StarRating({
  rating,
  reviewCount,
  primaryColor,
}: {
  rating: number;
  reviewCount?: number | null;
  primaryColor: string;
}) {
  const fullStars = Math.round(Math.max(0, Math.min(5, rating)));
  return (
    <Box
      sx={{ display: "flex", alignItems: "center", gap: 0.25 }}
      aria-label={`Rating: ${rating.toFixed(1)} out of 5${reviewCount ? `, ${reviewCount} reviews` : ""}`}
      role="img"
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          sx={{
            fontSize: "1rem",
            color: i < fullStars ? primaryColor : "grey.300",
          }}
        />
      ))}
      {typeof reviewCount === "number" && reviewCount > 0 && (
        <Typography
          component="span"
          variant="caption"
          sx={{ ml: 0.5, color: "text.secondary" }}
        >
          ({reviewCount})
        </Typography>
      )}
    </Box>
  );
}

/* ===================== Component ===================== */

const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  config,
  colors,
  onListingClick,
}) => {
  const { showRating, showPhone, showAddress } = config;
  const { primaryColor, headingColor, bodyColor } = colors;

  const imageUrl = safeUrl(listing.logoUrl || listing.imageUrl);
  const descriptionExcerpt = truncate(listing.shortDescription, 120);
  const address = buildAddress(listing);

  const handleCardClick = useCallback(() => {
    if (onListingClick) {
      onListingClick(listing);
    }
  }, [onListingClick, listing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (onListingClick) {
          onListingClick(listing);
        }
      }
    },
    [onListingClick, listing],
  );

  return (
    <Card
      component="article"
      role="article"
      aria-label={`Listing: ${listing.businessName}`}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      tabIndex={onListingClick ? 0 : undefined}
      elevation={2}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: onListingClick ? "pointer" : "default",
        transition: "transform 0.25s ease, box-shadow 0.25s ease",
        "&:hover": onListingClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: 6,
            }
          : {},
        "&:focus-visible": {
          outline: `2px solid ${primaryColor}`,
          outlineOffset: 2,
        },
      }}
    >
      {/* Business Logo / Image — 4:3 aspect ratio */}
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
            alt={`${listing.businessName} logo`}
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
          data-testid="listing-card-image-placeholder"
          sx={{
            aspectRatio: "4/3",
            bgcolor: "grey.100",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="No business image available"
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
        {listing.businessCategory && (
          <Box>
            <Chip
              label={listing.businessCategory}
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

        {/* Business name */}
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
          {listing.businessName}
        </Typography>

        {/* Star rating */}
        {showRating &&
          typeof listing.rating === "number" &&
          listing.rating > 0 && (
            <StarRating
              rating={listing.rating}
              reviewCount={listing.reviewCount}
              primaryColor={primaryColor}
            />
          )}

        {/* Phone number */}
        {showPhone && listing.phone && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <PhoneIcon
              sx={{ fontSize: "0.9rem", color: bodyColor }}
              aria-hidden="true"
            />
            <Typography
              variant="body2"
              component="span"
              sx={{ color: bodyColor }}
              aria-label={`Phone: ${listing.phone}`}
            >
              {listing.phone}
            </Typography>
          </Box>
        )}

        {/* Address */}
        {showAddress && address && (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}>
            <LocationOnIcon
              sx={{ fontSize: "0.9rem", color: bodyColor, mt: "2px" }}
              aria-hidden="true"
            />
            <Typography
              variant="body2"
              component="span"
              sx={{ color: bodyColor }}
              aria-label={`Address: ${address}`}
            >
              {address}
            </Typography>
          </Box>
        )}

        {/* Short description — 2-line truncation via WebkitLineClamp */}
        {descriptionExcerpt && (
          <Typography
            variant="body2"
            data-testid="listing-card-description"
            sx={{
              color: bodyColor,
              lineHeight: 1.6,
              flexGrow: 1,
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {descriptionExcerpt}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

ListingCard.displayName = "ListingCard";

export default React.memo(ListingCard);
