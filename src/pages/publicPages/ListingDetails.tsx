import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Button,
  ButtonBase,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import {
  MapPin,
  Globe,
  Heart,
  Star,
  ExternalLink,
  ArrowRight,
  TrendingUp,
  Send,
} from "lucide-react";
import { useListings } from "../../context/ListingsContext";
import { useReviews, useSubmitReview } from "../../hooks/useReviews";
import PropertyItemCard from "../../components/publicComponents/Listing/PropertyCardItem";

const teal = "#1a9d96";
const tealDark = "#0f6e69";

/* Same font as the Listings page (homeHeroFont) */
const pageFont =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

/* Shared horizontal container so every section aligns to the same edges */
const sectionContainerSx = {
  maxWidth: 1300,
  mx: "auto",
  px: 4,
};

const gray = {
  900: "#111827",
  800: "#1f2937",
  700: "#374151",
  600: "#4b5563",
  500: "#6b7280",
  400: "#9ca3af",
  300: "#d1d5db",
  200: "#e5e7eb",
  100: "#f3f4f6",
};

const tagPillSx = {
  display: "inline-block",
  bgcolor: "#e6f7f6",
  color: teal,
  border: "1px solid #b3e4e2",
  borderRadius: "999px",
  fontFamily: pageFont,
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.5,
  px: "12px",
  py: "4px",
};

const eyebrowSx = {
  color: teal,
  fontFamily: pageFont,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  mb: "6px",
};

const sidebarLabelSx = {
  color: gray[400],
  fontFamily: pageFont,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

const formLabelSx = {
  display: "block",
  color: gray[700],
  fontFamily: pageFont,
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.025em",
  mb: "6px",
};

const formInputSx = {
  width: "100%",
  bgcolor: "#fafafa",
  border: `1px solid ${gray[200]}`,
  borderRadius: "12px",
  px: "16px",
  py: "10px",
  fontFamily: pageFont,
  fontSize: 14,
  color: gray[800],
  transition: "border-color 0.2s ease",
  "&.Mui-focused": { borderColor: teal },
  "& input::placeholder, & textarea::placeholder": {
    color: gray[400],
    opacity: 1,
  },
};

const fallbackBanner =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80";

const fallbackReviews = [
  {
    content:
      "Working with this team transformed the way we present ourselves to the world. Their attention to detail and genuine investment in our success made all the difference.",
    author: { name: "Sarah Okonkwo" },
    title: "CEO, Northgate Holdings",
    rating: 5,
  },
  {
    content:
      "Professional, responsive, and consistently excellent. They understood our goals from day one and delivered results that exceeded every expectation.",
    author: { name: "Daniel Park" },
    title: "Operations Director",
    rating: 5,
  },
];

export interface Listing {
  id: string | number;
  creator?: string;
  title?: string;
  businessName?: string | null;
  desc?: string | null;
  shortDescription?: string | null;
  address?: string | null;
  slug?: string | null;
  phone?: string | null;
  category?: string | null;
  businessCategory?: string | null;
  city?: string | null;
  region?: string | null;
  country?: string | null;
  status?: "active" | "pending";
  createdAt?: string;
  updatedAt?: string;
  website?: string | null;
  websiteSlug?: string | null;
  subdomain?: string | null;
  priceRange?: string | null;
  priceLevel?: string | null;
  accountingAndTaxService?: string | null;
  area?: string | null;
  businessLogo?: string | null;
  businessBanner?: string | null;
  image?: string | null;
  images?: string[] | null | string;
  intro?: string | null;
  aboutUs?: string | null;
  mapUrl?: string | null;
  tags?: string[] | null;
  hasStore?: boolean;
  websitePlan?: string;
  score?: number;
  averageRating?: number;
  reviewCount?: number;
  favouriteCount?: number;
  location?: {
    latitude?: number | null;
    longitude?: number | null;
    isRemoteOnly?: boolean;
  } | null;
  user?: {
    id: string;
    username: string;
    email: string;
    role: "user" | "admin";
  };
  websiteData?: {
    slug?: string | null;
    subdomain?: string | null;
  } | null;
}

function getListingWebsitePath(listing: Listing) {
  const siteSlug =
    listing.websiteSlug ||
    listing.websiteData?.slug ||
    listing.websiteData?.subdomain ||
    listing.subdomain;

  if (siteSlug) return `/site/${encodeURIComponent(siteSlug)}`;

  const website =
    listing.website && listing.website !== "https://www.example.com/"
      ? listing.website
      : "";

  return website || (listing.slug ? `/business/${listing.slug}` : "");
}

function stripHtml(value?: string | null) {
  if (!value) return "";
  if (typeof window === "undefined") {
    return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  }
  const element = window.document.createElement("div");
  element.innerHTML = value;
  return (element.textContent || element.innerText || "")
    .replace(/\s+/g, " ")
    .trim();
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function normalizeTags(tags?: string[] | string | null) {
  if (Array.isArray(tags)) return tags.filter(Boolean);
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function GoldStars({ rating, size = 11 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          fill={star <= rounded ? "gold" : "none"}
          color={star <= rounded ? "gold" : "rgba(209,213,219,0.8)"}
        />
      ))}
    </>
  );
}

const ratingLabels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

function ReviewFormSection({
  listingId,
  businessName,
  onSubmitted,
}: {
  listingId: string | number;
  businessName: string;
  onSubmitted: () => void;
}) {
  const { submitReview, loading, error, fieldErrors, requiresAuth } =
    useSubmitReview(listingId);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = selectedRating > 0 && content.trim().length > 0 && !loading;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    const result = await submitReview({
      rating: selectedRating,
      title,
      content,
    });
    if (result) {
      setSubmitted(true);
      setSelectedRating(0);
      setTitle("");
      setContent("");
      onSubmitted();
    }
  };

  return (
    <Box
      component="section"
      sx={{ borderTop: `1px solid ${gray[100]}`, pt: 4 }}
    >
      <Box>
        <Box sx={{ maxWidth: 672 }}>
          <Typography sx={eyebrowSx}>Share Your Experience</Typography>
          <Typography
            variant="h2"
            sx={{
              color: gray[900],
              fontFamily: pageFont,
              fontWeight: 700,
              fontSize: 30,
              mb: "28px",
            }}
          >
            Leave a Review
          </Typography>

          {submitted ? (
            <Box
              sx={{
                borderRadius: "16px",
                p: 4,
                textAlign: "center",
                bgcolor: "#e6f7f6",
                border: "1px solid #b3e4e2",
              }}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 1.5,
                  bgcolor: teal,
                }}
              >
                <Send size={20} color="white" />
              </Box>
              <Typography
                sx={{
                  color: gray[900],
                  fontFamily: pageFont,
                  fontWeight: 700,
                  fontSize: 18,
                  mb: "4px",
                }}
              >
                Thank you!
              </Typography>
              <Typography
                sx={{ color: gray[500], fontFamily: pageFont, fontSize: 14 }}
              >
                Your review has been submitted and is pending approval.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2.5}>
              {/* Star rating */}
              <Box>
                <Typography
                  sx={{
                    color: gray[700],
                    fontFamily: pageFont,
                    fontSize: 14,
                    fontWeight: 600,
                    mb: 1,
                  }}
                >
                  Your Rating
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <ButtonBase
                      key={n}
                      aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
                      disableRipple
                      onMouseEnter={() => setHoverRating(n)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setSelectedRating(n)}
                      sx={{
                        p: 0,
                        lineHeight: 0,
                        transition: "transform 0.15s ease",
                        "&:hover": { transform: "scale(1.1)" },
                      }}
                    >
                      <Star
                        size={28}
                        fill={
                          (hoverRating || selectedRating) >= n ? "gold" : "none"
                        }
                        color={
                          (hoverRating || selectedRating) >= n
                            ? "gold"
                            : gray[300]
                        }
                        strokeWidth={1.5}
                      />
                    </ButtonBase>
                  ))}
                  {selectedRating > 0 && (
                    <Typography
                      sx={{
                        ml: 1,
                        color: teal,
                        fontFamily: pageFont,
                        fontSize: 14,
                        fontWeight: 500,
                      }}
                    >
                      {ratingLabels[selectedRating]}
                    </Typography>
                  )}
                </Stack>
                {fieldErrors.rating && (
                  <Typography
                    sx={{
                      color: "#ef4444",
                      fontFamily: pageFont,
                      fontSize: 12,
                      mt: 0.5,
                    }}
                  >
                    {fieldErrors.rating}
                  </Typography>
                )}
              </Box>

              {/* Title */}
              <Box>
                <Typography component="label" sx={formLabelSx}>
                  Review Title
                </Typography>
                <InputBase
                  placeholder="e.g. Outstanding service from start to finish"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  sx={formInputSx}
                />
                {fieldErrors.title && (
                  <Typography
                    sx={{
                      color: "#ef4444",
                      fontFamily: pageFont,
                      fontSize: 12,
                      mt: 0.5,
                    }}
                  >
                    {fieldErrors.title}
                  </Typography>
                )}
              </Box>

              {/* Review textarea */}
              <Box>
                <Typography component="label" sx={formLabelSx}>
                  Your Review
                </Typography>
                <InputBase
                  multiline
                  rows={4}
                  placeholder={`Tell others about your experience working with ${businessName}…`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  sx={{ ...formInputSx, py: "12px" }}
                />
                <Typography
                  sx={{
                    color: gray[400],
                    fontFamily: pageFont,
                    fontSize: 12,
                    mt: 0.5,
                  }}
                >
                  {content.length} / 500 characters
                </Typography>
                {fieldErrors.content && (
                  <Typography
                    sx={{
                      color: "#ef4444",
                      fontFamily: pageFont,
                      fontSize: 12,
                      mt: 0.5,
                    }}
                  >
                    {fieldErrors.content}
                  </Typography>
                )}
              </Box>

              {requiresAuth && (
                <Box
                  sx={{
                    borderRadius: "12px",
                    px: 2,
                    py: 1.5,
                    bgcolor: "#e6f7f6",
                    border: "1px solid #b3e4e2",
                  }}
                >
                  <Typography
                    sx={{
                      color: gray[700],
                      fontFamily: pageFont,
                      fontSize: 14,
                    }}
                  >
                    Please{" "}
                    <Box
                      component={RouterLink}
                      to="/auth"
                      sx={{
                        color: teal,
                        fontWeight: 600,
                        textDecoration: "underline",
                      }}
                    >
                      sign in
                    </Box>{" "}
                    to share your review.
                  </Typography>
                </Box>
              )}

              {error && (
                <Typography
                  sx={{ color: "#ef4444", fontFamily: pageFont, fontSize: 14 }}
                >
                  {error}
                </Typography>
              )}

              {/* Submit */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <ButtonBase
                  onClick={handleSubmit}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    px: 3,
                    py: "10px",
                    borderRadius: "12px",
                    color: "#fff",
                    fontFamily: pageFont,
                    fontSize: 14,
                    fontWeight: 600,
                    background: `linear-gradient(90deg, ${teal} 0%, ${tealDark} 100%)`,
                    opacity: canSubmit ? 1 : 0.5,
                    cursor: canSubmit ? "pointer" : "not-allowed",
                    transition: "opacity 0.2s ease",
                  }}
                >
                  <Send size={14} />{" "}
                  {loading ? "Submitting…" : "Submit Review"}
                </ButtonBase>
                <Typography
                  sx={{ color: gray[400], fontFamily: pageFont, fontSize: 12 }}
                >
                  All reviews are moderated before publishing.
                </Typography>
              </Stack>
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
}

const ListingDetails: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");
  const { pid, id, slug } = useParams();
  const routeKey = pid || id || slug;

  const { listings, loading, error, deleteListing, updateListing } = useListings();

  const [editItem, setEditItem] = useState<any | null>(null);
  const [editFields, setEditFields] = useState({ businessName: "", shortDescription: "", address: "", phone: "", website: "", category: "" });
  const [editLoading, setEditLoading] = useState(false);

  const handleOpenEdit = (item: any) => {
    setEditItem(item);
    setEditFields({
      businessName: item.businessName || item.title || "",
      shortDescription: item.shortDescription || item.desc || "",
      address: item.address || "",
      phone: item.phone || "",
      website: item.website || "",
      category: item.category || "",
    });
  };

  const handleCloseEdit = () => { setEditItem(null); };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setEditLoading(true);
    await updateListing(String(editItem.id), editFields);
    setEditLoading(false);
    setEditItem(null);
  };
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!routeKey || listings.length === 0) return;
    const found = listings.find(
      (item) => String(item.id) === routeKey || item.slug === routeKey,
    );
    setListing((found as Listing | undefined) ?? null);
  }, [routeKey, listings]);

  const { reviews, stats, refetch } = useReviews(listing?.id ?? null);

  const viewModel = useMemo(() => {
    if (!listing) return null;

    const name = listing.businessName || listing.title || "Business Listing";
    const category =
      listing.businessCategory || listing.category || "Professional Service";
    const description =
      listing.shortDescription ||
      stripHtml(listing.desc) ||
      stripHtml(listing.aboutUs) ||
      "A trusted business listed in the directory.";
    const rating = Number(
      stats?.averageRating || listing.averageRating || 0,
    );
    const reviewCount = Number(stats?.totalCount || listing.reviewCount || 0);
    const tags = normalizeTags(listing.tags);
    const price = listing.priceLevel || listing.priceRange || "$$";
    const website =
      listing.website && listing.website !== "https://www.example.com/"
        ? listing.website
        : "";
    const previewWebsite = getListingWebsitePath(listing);
    const isExternalWebsite = /^https?:\/\//i.test(previewWebsite);
    const locationText = [listing.city, listing.region, listing.country]
      .filter(Boolean)
      .join(", ");

    return {
      name,
      category,
      description,
      rating,
      reviewCount,
      tags,
      price,
      website,
      previewWebsite,
      isExternalWebsite,
      locationText:
        locationText || listing.address || (listing.location?.isRemoteOnly ? "Remote / Online" : "Location available"),
      address: listing.address || locationText,
      phone: listing.phone || "",
      banner: listing.businessBanner || listing.image || fallbackBanner,
      logo: listing.businessLogo,
      score: Number(listing.score || 0),
      favouriteCount: Number(listing.favouriteCount || 0),
      isRemoteOnly: Boolean(listing.location?.isRemoteOnly),
    };
  }, [listing, stats]);

  const relatedListings = useMemo(() => {
    if (!listing) return [];
    const otherListings = listings.filter((item) => item.id !== listing.id);
    const categoryMatches = otherListings.filter((item) => {
        const itemCategory = item.businessCategory || item.category;
        const currentCategory = listing.businessCategory || listing.category;
        return currentCategory ? itemCategory === currentCategory : true;
      });

    return (categoryMatches.length > 0 ? categoryMatches : otherListings).slice(
      0,
      3,
    ) as Listing[];
  }, [listing, listings]);

  const visibleReviews = reviews.length > 0 ? reviews.slice(0, 2) : fallbackReviews;

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#fff",
        }}
      >
        <CircularProgress sx={{ color: teal }} />
      </Box>
    );
  }

  if (error || !listing || !viewModel) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          bgcolor: "#fff",
        }}
      >
        <Typography fontSize="16px" color="error" gutterBottom>
          No Listing Found
        </Typography>
        <IconButton aria-label="retry" size="medium">
          <ReplayIcon fontSize="inherit" />
        </IconButton>
      </Box>
    );
  }

  const statStrip = [
    {
      label: "Reviews",
      value: String(viewModel.reviewCount),
      icon: <Star size={16} fill={teal} color={teal} />,
    },
    {
      label: "Favourites",
      value: String(viewModel.favouriteCount),
      icon: <Heart size={16} color={teal} />,
    },
    {
      label: "Match Score",
      value: viewModel.score ? viewModel.score.toFixed(1) : "—",
      icon: <TrendingUp size={16} color={teal} />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#fff",
        fontFamily: pageFont,
        "& .MuiTypography-root, & .MuiButton-root, & input, & label": {
          fontFamily: pageFont,
        },
      }}
    >
      {/* Hero - full-bleed editorial */}
      <Box sx={{ position: "relative", height: 500, overflow: "hidden" }}>
        <Box
          component="img"
          src={viewModel.banner}
          alt={viewModel.name}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(10,80,76,0.6) 100%)",
          }}
        />
        {viewModel.previewWebsite && (
          <Box
            sx={{
              position: "absolute",
              bottom: 56,
              left: 0,
              right: 10,
              ...sectionContainerSx,
              display: "flex",
              justifyContent: "flex-end",
              /* the hero text block overlaps this area and was swallowing
                 clicks — keep the button layered above it */
              zIndex: 2,
            }}
          >
            <ButtonBase
              component="a"
              href={viewModel.previewWebsite}
              target={viewModel.isExternalWebsite ? "_blank" : undefined}
              rel={
                viewModel.isExternalWebsite ? "noopener noreferrer" : undefined
              }
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: "#fff",
                fontFamily: pageFont,
                fontSize: 12,
                fontWeight: 500,
                px: 1.5,
                py: "6px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(4px)",
                transition:
                  "background 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
                "& svg": { transition: "transform 0.25s ease" },
                "&:hover": {
                  background: "rgba(255,255,255,0.3)",
                  borderColor: "rgba(255,255,255,0.6)",
                  transform: "translateY(-2px) scale(1.04)",
                  boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                  "& svg": { transform: "rotate(20deg)" },
                },
                "&:active": {
                  transform: "translateY(0) scale(0.98)",
                },
              }}
            >
              <Globe size={11} /> Preview Website
            </ButtonBase>
          </Box>
        )}
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            ...sectionContainerSx,
            pb: 3.5,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb="10px">
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontFamily: pageFont,
                fontSize: 12,
                fontWeight: 700,
                bgcolor: teal,
              }}
            >
              {getInitials(viewModel.name)}
            </Box>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.7)",
                fontFamily: pageFont,
                fontSize: 12,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {viewModel.category}
            </Typography>
          </Stack>
          <Typography
            variant="h1"
            sx={{
              color: "#fff",
              fontFamily: pageFont,
              fontWeight: 700,
              fontSize: 48,
              lineHeight: 1.25,
              mb: 1.5,
            }}
          >
            {viewModel.name}
          </Typography>
          <Stack
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            gap={2.5}
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontFamily: pageFont,
              fontSize: 12,
            }}
          >
            <Stack direction="row" alignItems="center" gap={0.5}>
              <GoldStars rating={viewModel.rating} />
              <Box
                component="span"
                sx={{ ml: "4px", fontWeight: 600, color: "#fff" }}
              >
                {viewModel.rating ? viewModel.rating.toFixed(1) : "New"}
              </Box>
              <Box
                component="span"
                sx={{ color: "rgba(255,255,255,0.6)", ml: "2px" }}
              >
                · {viewModel.reviewCount} reviews
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <Heart size={11} />
              <Box component="span">{viewModel.favouriteCount} saved</Box>
            </Stack>
            <Stack direction="row" alignItems="center" gap={0.5}>
              <MapPin size={11} />
              <Box component="span">{viewModel.locationText}</Box>
            </Stack>
            <Box component="span" sx={{ fontWeight: 500 }}>
              {viewModel.price}
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* Accent bar */}
      <Box
        sx={{
          height: 4,
          background: "linear-gradient(90deg, #1a9d96, #22c5bc)",
        }}
      />

      {/* Main layout */}
      <Box
        sx={{
          ...sectionContainerSx,
          py: 4,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
          gap: 4,
        }}
      >
        {/* Left */}
        <Stack spacing={4}>
          {/* About */}
          <Box component="section">
            <Typography
              variant="h2"
              sx={{
                color: gray[900],
                fontFamily: pageFont,
                fontWeight: 700,
                fontSize: 24,
                mb: 1.5,
              }}
            >
              About
            </Typography>
            <Typography
              sx={{
                color: gray[600],
                fontFamily: pageFont,
                fontSize: 14,
                lineHeight: "28px",
              }}
            >
              {viewModel.description}
            </Typography>
            {viewModel.tags.length > 0 && (
              <Stack direction="row" flexWrap="wrap" gap={1} mt={2}>
                {viewModel.tags.map((tag) => (
                  <Box key={tag} component="span" sx={tagPillSx}>
                    {tag}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>

          {/* Score strip */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              border: `1px solid ${gray[100]}`,
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {statStrip.map((s, i) => (
              <Stack
                key={s.label}
                direction="row"
                alignItems="center"
                spacing={1.5}
                sx={{
                  px: 2.5,
                  py: 2,
                  borderRight: i < 2 ? `1px solid ${gray[100]}` : "none",
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    bgcolor: "#e6f7f6",
                  }}
                >
                  {s.icon}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      color: gray[900],
                      fontFamily: pageFont,
                      fontWeight: 700,
                      fontSize: 20,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    sx={{
                      color: gray[400],
                      fontFamily: pageFont,
                      fontSize: 12,
                      mt: "2px",
                    }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Box>

          {/* Reviews */}
          <Box component="section">
            <Typography
              variant="h2"
              sx={{
                color: gray[900],
                fontFamily: pageFont,
                fontWeight: 700,
                fontSize: 24,
                mb: 2.5,
              }}
            >
              What Clients Say
            </Typography>
            <Stack spacing={2.5}>
              {visibleReviews.map((review, index) => {
                const reviewId =
                  "id" in review && review.id != null
                    ? String(review.id)
                    : String(index);

                return (
                  <Box
                    key={reviewId}
                    sx={{
                      borderLeft: `3px solid ${teal}`,
                      pl: 2.5,
                      py: 0.5,
                    }}
                  >
                    <Stack direction="row" gap="2px" mb={1}>
                      {Array.from({
                        length: Math.max(
                          1,
                          Math.round(Number(review.rating || 5)),
                        ),
                      }).map((_, j) => (
                        <Star key={j} size={12} fill="gold" color="gold" />
                      ))}
                    </Stack>
                    <Typography
                      sx={{
                        color: gray[700],
                        fontFamily: pageFont,
                        fontSize: 14,
                        lineHeight: 1.625,
                        fontStyle: "italic",
                        mb: 1.5,
                      }}
                    >
                      "{review.content}"
                    </Typography>
                    <Box>
                      <Typography
                        sx={{
                          color: gray[900],
                          fontFamily: pageFont,
                          fontSize: 12,
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.025em",
                        }}
                      >
                        {review.author?.name || "Client"}
                      </Typography>
                      <Typography
                        sx={{
                          color: gray[400],
                          fontFamily: pageFont,
                          fontSize: 12,
                        }}
                      >
                        {review.title || "Verified review"}
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          </Box>

          {/* Review Form — lives in the left column so the sidebar can stay
              sticky all the way down to Similar Businesses */}
          <ReviewFormSection
            listingId={listing.id}
            businessName={viewModel.name}
            onSubmitted={refetch}
          />
        </Stack>

        {/* Sidebar — outer Box stretches to the full row height so the inner
            panel can stay sticky for as long as the section is in view */}
        <Box>
          <Box
            sx={{
              position: { lg: "sticky" },
              /* clear the fixed 70px navbar */
              top: { lg: 86 },
              border: `1px solid ${gray[200]}`,
              borderRadius: "16px",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${gray[100]}` }}
            >
              <Typography
                variant="h3"
                sx={{
                  color: gray[900],
                  fontFamily: pageFont,
                  fontWeight: 700,
                  fontSize: 14,
                }}
              >
                Details
              </Typography>
              <Stack
                direction="row"
                alignItems="center"
                gap={0.5}
                sx={{
                  color: teal,
                  fontFamily: pageFont,
                  fontSize: 12,
                  fontWeight: 500,
                }}
              >
                <Star size={12} fill={teal} color={teal} />
                <Box component="span">
                  {viewModel.rating ? viewModel.rating.toFixed(1) : "New"}
                </Box>
                <Box
                  component="span"
                  sx={{ color: gray[400], fontWeight: 400 }}
                >
                  · {viewModel.reviewCount} reviews
                </Box>
              </Stack>
            </Stack>

            <Stack spacing={2.5} sx={{ p: 2.5 }}>
              {/* Stats */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 1,
                }}
              >
                <Box
                  sx={{
                    borderRadius: "12px",
                    p: 1.5,
                    textAlign: "center",
                    bgcolor: "#f8fffe",
                    border: "1px solid #c8eeec",
                  }}
                >
                  <Box sx={{ lineHeight: 0, mb: "4px" }}>
                    <Heart size={14} color={teal} />
                  </Box>
                  <Typography
                    sx={{
                      color: gray[900],
                      fontFamily: pageFont,
                      fontWeight: 700,
                      fontSize: 18,
                      lineHeight: 1,
                    }}
                  >
                    {viewModel.favouriteCount}
                  </Typography>
                  <Typography
                    sx={{
                      color: gray[400],
                      fontFamily: pageFont,
                      fontSize: 12,
                      mt: "2px",
                    }}
                  >
                    Favourites
                  </Typography>
                </Box>
                <Box
                  sx={{
                    borderRadius: "12px",
                    p: 1.5,
                    textAlign: "center",
                    bgcolor: "#f8fffe",
                    border: "1px solid #c8eeec",
                  }}
                >
                  <Box sx={{ lineHeight: 0, mb: "4px" }}>
                    <TrendingUp size={14} color={teal} />
                  </Box>
                  <Typography
                    sx={{
                      color: gray[900],
                      fontFamily: pageFont,
                      fontWeight: 700,
                      fontSize: 18,
                      lineHeight: 1,
                    }}
                  >
                    {viewModel.score ? viewModel.score.toFixed(1) : "—"}
                  </Typography>
                  <Typography
                    sx={{
                      color: gray[400],
                      fontFamily: pageFont,
                      fontSize: 12,
                      mt: "2px",
                    }}
                  >
                    Score
                  </Typography>
                </Box>
              </Box>

              {/* Location */}
              <Box>
                <Typography sx={{ ...sidebarLabelSx, mb: 1 }}>
                  Location
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  gap="6px"
                  sx={{
                    color: gray[800],
                    fontFamily: pageFont,
                    fontSize: 14,
                    fontWeight: 500,
                  }}
                >
                  <MapPin size={13} color={teal} />{" "}
                  {viewModel.address || viewModel.locationText}
                </Stack>
                <Box
                  component="span"
                  sx={{
                    display: "inline-block",
                    mt: 1,
                    fontFamily: pageFont,
                    fontSize: 12,
                    fontWeight: 500,
                    px: "10px",
                    py: "4px",
                    borderRadius: "999px",
                    color: teal,
                    bgcolor: "#e6f7f6",
                  }}
                >
                  {viewModel.isRemoteOnly
                    ? "Remote / online"
                    : "In-person available"}
                </Box>
              </Box>

              {/* Price */}
              <Box sx={{ borderTop: `1px solid ${gray[100]}`, pt: 2 }}>
                <Typography sx={{ ...sidebarLabelSx, mb: "6px" }}>
                  Price Range
                </Typography>
                <Typography
                  sx={{
                    color: gray[800],
                    fontFamily: pageFont,
                    fontWeight: 700,
                  }}
                >
                  {viewModel.price}
                </Typography>
              </Box>

              {/* Tags */}
              {viewModel.tags.length > 0 && (
                <Box sx={{ borderTop: `1px solid ${gray[100]}`, pt: 2 }}>
                  <Typography sx={{ ...sidebarLabelSx, mb: 1 }}>
                    Services
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap="6px">
                    {viewModel.tags.map((tag) => (
                      <Box
                        key={tag}
                        component="span"
                        sx={{ ...tagPillSx, px: "10px" }}
                      >
                        {tag}
                      </Box>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Map */}
              <Box sx={{ borderTop: `1px solid ${gray[100]}`, pt: 2 }}>
                <Box
                  sx={{
                    borderRadius: "12px",
                    overflow: "hidden",
                    height: 90,
                    background:
                      "linear-gradient(135deg, #d4f0ef 0%, #b3e4e2 100%)",
                  }}
                >
                  {listing.mapUrl ? (
                    <Box
                      component="iframe"
                      src={listing.mapUrl}
                      title={`${viewModel.name} map`}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      sx={{ width: "100%", height: "100%", border: 0 }}
                    />
                  ) : (
                    <Box
                      sx={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Box sx={{ textAlign: "center" }}>
                        <MapPin size={18} color={teal} />
                        <Typography
                          sx={{
                            color: gray[500],
                            fontFamily: pageFont,
                            fontSize: 12,
                            mt: 0.5,
                          }}
                        >
                          {viewModel.locationText}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>

              {/* CTA */}
              {viewModel.previewWebsite && (
                <ButtonBase
                  component="a"
                  href={viewModel.previewWebsite}
                  target={viewModel.isExternalWebsite ? "_blank" : undefined}
                  rel={
                    viewModel.isExternalWebsite
                      ? "noopener noreferrer"
                      : undefined
                  }
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    width: "100%",
                    py: "10px",
                    borderRadius: "12px",
                    color: "#fff",
                    fontFamily: pageFont,
                    fontSize: 14,
                    fontWeight: 600,
                    background: `linear-gradient(90deg, ${teal} 0%, ${tealDark} 100%)`,
                  }}
                >
                  <Globe size={14} /> Open Website <ExternalLink size={12} />
                </ButtonBase>
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Similar Businesses */}
      <Box sx={{ borderTop: `1px solid ${gray[100]}`, mt: 2, mb: 6 }}>
        <Box sx={{ ...sectionContainerSx, py: 4 }}>
          <Stack
            direction="row"
            alignItems="flex-end"
            justifyContent="space-between"
            mb={3}
          >
            <Box sx={{ml: {sm: 0, md: 1}}}>
              <Typography sx={eyebrowSx}>Explore More</Typography>
              <Typography
                variant="h2"
                sx={{
                  color: gray[900],
                  fontFamily: pageFont,
                  fontWeight: 700,
                  fontSize: 30,
                }}
              >
                Similar Businesses
              </Typography>
            </Box>
            <ButtonBase
              component={RouterLink}
              to="/listings"
              disableRipple
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                color: teal,
                fontFamily: pageFont,
                fontSize: 14,
                fontWeight: 600,
                pb: 0.5,
                borderBottom: `2px solid ${teal}`,
              }}
            >
              View All <ArrowRight size={14} />
            </ButtonBase>
          </Stack>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: { xs: "center", sm: "space-between" },
              gap: 2,
              /* PropertyItemCard's own wrapper uses mx:"auto", which absorbs
                 the free space before justify-content applies — cancel it */
              "& > *": { mx: 0 },
            }}
          >
            {relatedListings.map((biz, index) => (
              <PropertyItemCard
                key={`${biz.id}-${index}`}
                item={biz as React.ComponentProps<typeof PropertyItemCard>["item"]}
                handleDeleteItem={(id) => deleteListing(String(id))}
                onEditItem={handleOpenEdit}
                totalPages={0}
                currentPage={0}
                setCurrentPage={() => {}}
              />
            ))}
          </Box>
        </Box>
      </Box>
      {/* Edit listing modal */}
      <Dialog open={!!editItem} onClose={handleCloseEdit} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Listing</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField label="Business Name" value={editFields.businessName} onChange={(e) => setEditFields((f) => ({ ...f, businessName: e.target.value }))} fullWidth size="small" />
          <TextField label="Short Description" value={editFields.shortDescription} onChange={(e) => setEditFields((f) => ({ ...f, shortDescription: e.target.value }))} fullWidth size="small" multiline minRows={2} />
          <TextField label="Address" value={editFields.address} onChange={(e) => setEditFields((f) => ({ ...f, address: e.target.value }))} fullWidth size="small" />
          <TextField label="Phone" value={editFields.phone} onChange={(e) => setEditFields((f) => ({ ...f, phone: e.target.value }))} fullWidth size="small" />
          <TextField label="Website" value={editFields.website} onChange={(e) => setEditFields((f) => ({ ...f, website: e.target.value }))} fullWidth size="small" />
          <TextField label="Category" value={editFields.category} onChange={(e) => setEditFields((f) => ({ ...f, category: e.target.value }))} fullWidth size="small" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseEdit} disabled={editLoading}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit} disabled={editLoading}>
            {editLoading ? "Saving…" : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ListingDetails;
