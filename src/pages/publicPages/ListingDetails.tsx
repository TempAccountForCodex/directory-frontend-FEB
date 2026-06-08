import React, { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useLocation, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  GlobalStyles,
  Grid,
  IconButton,
  Link,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import LanguageIcon from "@mui/icons-material/Language";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PhoneIcon from "@mui/icons-material/Phone";
import PlaceIcon from "@mui/icons-material/Place";
import ReplayIcon from "@mui/icons-material/Replay";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StorefrontIcon from "@mui/icons-material/Storefront";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useListings } from "../../context/ListingsContext";
import { useReviews } from "../../hooks/useReviews";

const palette = {
  paper: "#FDFBF7",
  ink: "#2C2A28",
  text: "#4A4744",
  muted: "#827D77",
  soft: "#E5DFD3",
  softLight: "#F5F1EA",
  rule: "#F0EBE1",
  teal: "#398C91",
  tealDark: "#2d7277",
};

const fallbackBanner =
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&q=80";

const fallbackRelatedImages = [
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80",
  "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=600&q=80",
];

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

function StarRow({
  rating,
  size = 16,
  color = palette.teal,
}: {
  rating: number;
  size?: number;
  color?: string;
}) {
  const rounded = Math.round(rating);
  return (
    <Stack direction="row" spacing={0.25} color={color} lineHeight={0}>
      {[1, 2, 3, 4, 5].map((star) =>
        star <= rounded ? (
          <StarIcon key={star} sx={{ fontSize: size }} />
        ) : (
          <StarBorderIcon key={star} sx={{ fontSize: size }} />
        ),
      )}
    </Stack>
  );
}

function BusinessLogo({
  logo: _logo,
  name,
  size = 72,
}: {
  logo?: string | null;
  name: string;
  size?: number;
}) {
  return (
    <Box
      aria-label={`${name} initials`}
      sx={{
        width: size,
        height: size,
        borderRadius: "50%",
        bgcolor: palette.teal,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: '"Playfair Display", serif',
        fontSize: size * 0.36,
        fontWeight: 600,
        border: "4px solid #fff",
        boxShadow: "0 10px 24px rgba(0,0,0,0.22)",
        userSelect: "none",
      }}
    >
      {getInitials(name)}
    </Box>
  );
}

const ListingDetails: React.FC = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type");
  const { pid, id, slug } = useParams();
  const routeKey = pid || id || slug;

  const { listings, loading, error } = useListings();
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    if (!routeKey || listings.length === 0) return;
    const found = listings.find(
      (item) => String(item.id) === routeKey || item.slug === routeKey,
    );
    setListing((found as Listing | undefined) ?? null);
  }, [routeKey, listings]);

  const { reviews, stats } = useReviews(listing?.id ?? null);

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
    const previewWebsite = website || (listing.slug ? `/business/${listing.slug}` : "");
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
          bgcolor: palette.paper,
        }}
      >
        <CircularProgress sx={{ color: palette.teal }} />
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
          bgcolor: palette.paper,
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

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100vh",
        bgcolor: palette.paper,
        color: palette.ink,
        fontFamily: '"Inter", sans-serif',
        "& ::selection": { bgcolor: palette.soft },
      }}
    >
      <GlobalStyles
        styles={{
          "@import":
            "url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Inter:wght@300;400;500;600&display=swap')",
        }}
      />

      <Box
        component="section"
        sx={{
          position: "relative",
          height: "70vh",
          minHeight: { xs: 520, md: 500 },
          width: "100%",
          overflow: "hidden",
        }}
      >
        <Box
          component="img"
          src={viewModel.banner}
          alt={viewModel.name}
          sx={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.4)",
            mixBlendMode: "multiply",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent)",
          }}
        />

        {viewModel.previewWebsite && (
          <Button
            component={Link}
            href={viewModel.previewWebsite}
            target={viewModel.website ? "_blank" : undefined}
            rel={viewModel.website ? "noopener noreferrer" : undefined}
            startIcon={<LanguageIcon sx={{ fontSize: 13 }} />}
            endIcon={<OpenInNewIcon sx={{ fontSize: 11, opacity: 0.7 }} />}
            sx={{
              position: "absolute",
              top: { xs: 88, md: 120 },
              right: { xs: 24, md: 72, lg: 150 },
              px: 2,
              py: 1.2,
              borderRadius: 0.5,
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.3)",
              bgcolor: "rgba(255,255,255,0.1)",
              backdropFilter: "blur(12px)",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1.7,
              textTransform: "uppercase",
              textDecoration: "none",
              zIndex: 2,
              "&:hover": {
                bgcolor: "rgba(255,255,255,0.2)",
                textDecoration: "none",
              },
            }}
          >
            Preview Website
          </Button>
        )}

        <Container
          maxWidth="lg"
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            pb: { xs: 8, md: 10 },
            gap: 2,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <BusinessLogo logo={viewModel.logo} name={viewModel.name} size={52} />
            <Chip
              label={viewModel.category}
              sx={{
                height: 28,
                borderRadius: 0.5,
                bgcolor: "rgba(229,223,211,0.9)",
                color: palette.ink,
                backdropFilter: "blur(8px)",
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.6,
                textTransform: "uppercase",
              }}
            />
          </Stack>

          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Playfair Display", serif',
              color: "#fff",
              fontWeight: 500,
              letterSpacing: 0,
              lineHeight: 0.95,
              fontSize: { xs: 48, md: 92, lg: 112 },
              maxWidth: 980,
            }}
          >
            {viewModel.name}
          </Typography>

          <Stack
            direction="row"
            flexWrap="wrap"
            alignItems="center"
            gap={2.5}
            sx={{ color: "rgba(255,255,255,0.8)", fontSize: 14 }}
          >
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <StarRow rating={viewModel.rating} size={15} color="#fff" />
              <Typography sx={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>
                {viewModel.rating ? viewModel.rating.toFixed(1) : "New"}
              </Typography>
              <Typography sx={{ fontSize: 14 }}>
                ({viewModel.reviewCount} reviews)
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <FavoriteBorderIcon sx={{ fontSize: 15 }} />
              <span>{viewModel.favouriteCount} saved</span>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <PlaceIcon sx={{ fontSize: 15 }} />
              <span>{viewModel.locationText}</span>
            </Stack>
            <Typography
              sx={{
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.2)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 0.5,
                px: 1,
                py: 0.25,
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {viewModel.price}
            </Typography>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 8, lg: 12 },
        }}
      >
        <Grid container spacing={{ xs: 7, lg: 10 }}>
          <Grid item xs={12} lg={8}>
            <Stack spacing={{ xs: 7, md: 9 }}>
              <Box component="section">
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 34,
                    fontWeight: 400,
                    mb: 4,
                    pb: 3,
                    borderBottom: `1px solid ${palette.soft}`,
                  }}
                >
                  About
                </Typography>
                <Typography
                  sx={{
                    color: palette.text,
                    fontSize: { xs: 19, md: 21 },
                    lineHeight: 1.75,
                    maxWidth: 820,
                  }}
                >
                  {viewModel.description}
                </Typography>

                {viewModel.tags.length > 0 && (
                  <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 4 }}>
                    {viewModel.tags.map((tag) => (
                      <Chip
                        key={tag}
                        icon={<LocalOfferIcon sx={{ color: `${palette.teal} !important` }} />}
                        label={tag}
                        sx={{
                          borderRadius: 0.5,
                          border: `1px solid ${palette.soft}`,
                          bgcolor: "#fff",
                          color: palette.muted,
                          fontSize: 12,
                          fontWeight: 600,
                          letterSpacing: 1,
                          textTransform: "uppercase",
                          height: 30,
                        }}
                      />
                    ))}
                  </Stack>
                )}
              </Box>

              <Box component="section">
                <Typography
                  variant="h2"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 34,
                    fontWeight: 400,
                    mb: 4,
                    pb: 3,
                    borderBottom: `1px solid ${palette.soft}`,
                  }}
                >
                  What Clients Say
                </Typography>
                <Stack spacing={6}>
                  {visibleReviews.map((review, index) => {
                    const reviewId =
                      "id" in review && review.id != null
                        ? String(review.id)
                        : String(index);

                    return (
                    <Stack key={reviewId} direction="row" spacing={3}>
                      <FormatQuoteIcon
                        sx={{
                          color: palette.teal,
                          fontSize: 36,
                          mt: 0.5,
                          strokeWidth: 1,
                        }}
                      />
                      <Box>
                        <Box sx={{ mb: 2 }}>
                          <StarRow rating={Number(review.rating || 5)} />
                        </Box>
                        <Typography
                          sx={{
                            color: palette.text,
                            fontFamily: '"Playfair Display", serif',
                            fontStyle: "italic",
                            fontSize: { xs: 21, md: 26 },
                            lineHeight: 1.55,
                            mb: 2,
                          }}
                        >
                          "{review.content}"
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: 14,
                            fontWeight: 700,
                            letterSpacing: 1.3,
                            textTransform: "uppercase",
                          }}
                        >
                          {review.author?.name || "Client"}
                        </Typography>
                        <Typography
                          sx={{
                            mt: 0.5,
                            color: palette.muted,
                            fontSize: 12,
                            letterSpacing: 1.7,
                            textTransform: "uppercase",
                          }}
                        >
                          {review.title || "Verified review"}
                        </Typography>
                      </Box>
                    </Stack>
                    );
                  })}
                </Stack>
              </Box>
            </Stack>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper
              elevation={0}
              sx={{
                position: { lg: "sticky" },
                top: { lg: 48 },
                bgcolor: "#fff",
                border: `1px solid ${palette.soft}`,
                borderRadius: 0,
                p: { xs: 4, md: 5 },
                boxShadow: "0 20px 40px -15px rgba(0,0,0,0.05)",
              }}
            >
              <Stack spacing={3}>
                <Typography
                  variant="h3"
                  sx={{
                    fontFamily: '"Playfair Display", serif',
                    fontSize: 28,
                    fontWeight: 400,
                  }}
                >
                  Details
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    py: 2.5,
                    borderTop: `1px solid ${palette.rule}`,
                    borderBottom: `1px solid ${palette.rule}`,
                  }}
                >
                  <Stack spacing={0.5}>
                    <Typography
                      sx={{
                        color: palette.ink,
                        fontFamily: '"Playfair Display", serif',
                        fontSize: 34,
                        fontWeight: 700,
                      }}
                    >
                      {viewModel.rating ? viewModel.rating.toFixed(1) : "New"}
                    </Typography>
                    <StarRow rating={viewModel.rating} size={15} />
                    <Typography sx={{ color: palette.muted, fontSize: 12 }}>
                      {viewModel.reviewCount} reviews
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <FavoriteBorderIcon sx={{ color: palette.teal, fontSize: 22 }} />
                    <Typography sx={{ color: palette.ink, fontSize: 22, fontWeight: 700 }}>
                      {viewModel.favouriteCount}
                    </Typography>
                    <Typography sx={{ color: palette.muted, fontSize: 12 }}>
                      favourites
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" spacing={0.5}>
                    <TrendingUpIcon sx={{ color: palette.teal, fontSize: 22 }} />
                    <Typography sx={{ color: palette.ink, fontSize: 22, fontWeight: 700 }}>
                      {viewModel.score ? viewModel.score.toFixed(1) : "—"}
                    </Typography>
                    <Typography sx={{ color: palette.muted, fontSize: 12 }}>
                      score
                    </Typography>
                  </Stack>
                </Stack>

                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <PlaceIcon sx={{ color: palette.teal, fontSize: 19, mt: 0.25 }} />
                  <Box>
                    <Typography sx={{ color: palette.ink, fontSize: 14, fontWeight: 600, mb: 0.5 }}>
                      Location
                    </Typography>
                    <Typography sx={{ color: palette.muted, fontSize: 14, lineHeight: 1.55 }}>
                      {viewModel.address || viewModel.locationText}
                    </Typography>
                    <Typography sx={{ mt: 1, color: palette.teal, fontSize: 12, fontWeight: 600 }}>
                      {viewModel.isRemoteOnly ? "Remote / online" : "In-person available"}
                    </Typography>
                  </Box>
                </Stack>

                {viewModel.phone && (
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{ borderTop: `1px solid ${palette.rule}`, pt: 2.5 }}
                  >
                    <PhoneIcon sx={{ color: palette.teal, fontSize: 19 }} />
                    <Link
                      href={`tel:${viewModel.phone}`}
                      sx={{ color: palette.muted, fontSize: 14, textDecoration: "none" }}
                    >
                      {viewModel.phone}
                    </Link>
                  </Stack>
                )}

                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ borderTop: `1px solid ${palette.rule}`, pt: 2.5 }}
                >
                  <Typography sx={{ color: palette.teal, fontSize: 17, fontWeight: 700 }}>
                    {viewModel.price}
                  </Typography>
                  <Typography sx={{ color: palette.muted, fontSize: 14 }}>
                    Price range
                  </Typography>
                </Stack>

                {viewModel.tags.length > 0 && (
                  <Stack
                    direction="row"
                    flexWrap="wrap"
                    gap={1}
                    sx={{ borderTop: `1px solid ${palette.rule}`, pt: 2.5 }}
                  >
                    {viewModel.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        sx={{
                          height: 28,
                          borderRadius: 0.5,
                          bgcolor: palette.softLight,
                          border: `1px solid ${palette.soft}`,
                          color: palette.muted,
                          fontSize: 12,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                )}

                <Box
                  sx={{
                    aspectRatio: "16 / 9",
                    width: "100%",
                    bgcolor: palette.soft,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: palette.muted,
                    borderTop: `1px solid ${palette.rule}`,
                    overflow: "hidden",
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
                    <Stack alignItems="center" spacing={1}>
                      <PlaceIcon sx={{ color: palette.teal, fontSize: 28 }} />
                      <Typography
                        sx={{
                          fontFamily: '"Playfair Display", serif',
                          fontStyle: "italic",
                          fontSize: 15,
                        }}
                      >
                        Map Embed
                      </Typography>
                    </Stack>
                  )}
                </Box>

                {viewModel.previewWebsite && (
                  <>
                    {viewModel.website && (
                      <Typography
                        sx={{
                          color: palette.muted,
                          fontSize: 13,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {viewModel.website.replace(/^https?:\/\//, "")}
                      </Typography>
                    )}
                    <Button
                      component={Link}
                      href={viewModel.previewWebsite}
                      target={viewModel.website ? "_blank" : undefined}
                      rel={viewModel.website ? "noopener noreferrer" : undefined}
                      startIcon={<LanguageIcon sx={{ fontSize: 16 }} />}
                      endIcon={<OpenInNewIcon sx={{ fontSize: 14, opacity: 0.75 }} />}
                      sx={{
                        width: "100%",
                        mt: 1,
                        py: 1.8,
                        borderRadius: 0,
                        bgcolor: palette.teal,
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 700,
                        letterSpacing: 1.8,
                        textTransform: "uppercase",
                        textDecoration: "none",
                        "&:hover": {
                          bgcolor: palette.tealDark,
                          textDecoration: "none",
                        },
                      }}
                    >
                      Open Website
                    </Button>
                  </>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Box
        component="section"
        sx={{
          bgcolor: "#fff",
          borderTop: `1px solid ${palette.soft}`,
          py: { xs: 9, lg: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "flex-end" }}
            spacing={3}
            sx={{ mb: 6 }}
          >
            <Box>
              <Typography
                sx={{
                  color: palette.muted,
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: 1.8,
                  textTransform: "uppercase",
                  mb: 1,
                }}
              >
                Explore More
              </Typography>
              <Typography
                variant="h2"
                sx={{
                  color: palette.ink,
                  fontFamily: '"Playfair Display", serif',
                  fontSize: { xs: 34, md: 44 },
                  fontWeight: 400,
                }}
              >
                Similar Businesses
              </Typography>
            </Box>
            <Button
              component={RouterLink}
              to="/listings"
              endIcon={<ChevronRightIcon />}
              sx={{
                display: { xs: "none", md: "inline-flex" },
                color: palette.ink,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: 1.2,
                textTransform: "uppercase",
                "&:hover": { color: palette.teal, bgcolor: "transparent" },
              }}
            >
              View All
            </Button>
          </Stack>

          <Grid container spacing={4}>
            {relatedListings.map(
              (biz, index) => {
                const name = biz.businessName || biz.title || "Business";
                const category = biz.businessCategory || biz.category || "Business";
                const description =
                  biz.shortDescription ||
                  stripHtml(biz.desc) ||
                  "Strategic services for growing businesses.";
                const image =
                  biz.businessBanner ||
                  biz.image ||
                  fallbackRelatedImages[index % fallbackRelatedImages.length];
                const rating = Number(biz.averageRating || 0);
                const to = biz.slug
                  ? `/listings/${biz.slug}${type ? `?type=${type}` : ""}`
                  : `/listings/${biz.id}`;

                return (
                  <Grid item xs={12} md={4} key={`${biz.id}-${index}`}>
                    <Box
                      component={RouterLink}
                      to={to}
                      sx={{
                        display: "block",
                        color: "inherit",
                        textDecoration: "none",
                        "&:hover .related-image": {
                          transform: "scale(1.05)",
                        },
                        "&:hover .related-title": {
                          color: palette.teal,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          aspectRatio: "4 / 3",
                          mb: 2.5,
                          overflow: "hidden",
                          bgcolor: palette.soft,
                        }}
                      >
                        <Box
                          className="related-image"
                          component="img"
                          src={image}
                          alt={name}
                          sx={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 700ms ease",
                          }}
                        />
                      </Box>
                      <Chip
                        label={category}
                        sx={{
                          mb: 1,
                          height: 25,
                          borderRadius: 0.5,
                          bgcolor: palette.softLight,
                          color: palette.muted,
                          border: `1px solid ${palette.soft}`,
                          fontSize: 10,
                          fontWeight: 600,
                          letterSpacing: 1.1,
                          textTransform: "uppercase",
                        }}
                      />
                      <Typography
                        className="related-title"
                        sx={{
                          fontFamily: '"Playfair Display", serif',
                          fontSize: 27,
                          lineHeight: 1.2,
                          mb: 0.75,
                          transition: "color 200ms ease",
                        }}
                      >
                        {name}
                      </Typography>
                      <Typography sx={{ color: palette.muted, fontSize: 14, mb: 1 }}>
                        {description}
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <StarIcon sx={{ color: palette.teal, fontSize: 14 }} />
                        <Typography sx={{ color: palette.ink, fontSize: 12, fontWeight: 700 }}>
                          {rating ? rating.toFixed(1) : "New"}
                        </Typography>
                        {biz.hasStore && (
                          <StorefrontIcon sx={{ color: palette.muted, fontSize: 14, ml: 1 }} />
                        )}
                      </Stack>
                    </Box>
                  </Grid>
                );
              },
            )}
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default ListingDetails;
