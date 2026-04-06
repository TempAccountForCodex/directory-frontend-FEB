/**
 * ReviewsBlock — Step 2.28.5
 *
 * Dynamic block that fetches and displays customer reviews.
 * Follows ProductShowcaseBlock pattern with useDynamicBlockData hook.
 *
 * Features:
 * - Dynamic data fetch via useDynamicBlockData (dataSource: 'review')
 * - Rating breakdown bars (5-star to 1-star)
 * - Review cards with MUI Rating, author, date, title, content
 * - 3 layouts: list (Stack), grid (2-col Grid), carousel (horizontal scroll)
 * - MUI Pagination
 * - Review submission form with honeypot 'company'
 * - Skeleton loading state
 * - Error Alert
 * - Empty state with configurable message
 * - Relative date formatting
 *
 * Security: DOMPurify.sanitize() on all review content
 * Performance: React.memo
 * Accessibility: aria-labels, semantic HTML
 */

import React, { useState, useCallback, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  LinearProgress,
  Pagination,
  Rating,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import DOMPurify from "dompurify";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ReviewsContent {
  heading?: string;
  entityType?: "website" | "product" | "listing";
  layout?: "list" | "grid" | "carousel";
  reviewsPerPage?: number;
  showRatingBreakdown?: boolean;
  showSubmitForm?: boolean;
  showPagination?: boolean;
  sortBy?: "newest" | "oldest" | "highest" | "lowest";
  emptyMessage?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: ReviewsContent;
  sortOrder: number;
}

interface ReviewsBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

interface Review {
  id: number;
  authorName: string;
  rating: number;
  title?: string;
  content: string;
  createdAt: string;
}

interface ReviewsSummary {
  average: number;
  total: number;
  breakdown: Record<number, number>;
}

interface ReviewsData {
  reviews: Review[];
  summary: ReviewsSummary;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5001/api";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatRelativeDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

// ── Review Card ───────────────────────────────────────────────────────────────

interface ReviewCardProps {
  review: Review;
  headingColor: string;
  bodyColor: string;
}

const ReviewCard: React.FC<ReviewCardProps> = React.memo(
  ({ review, headingColor, bodyColor }) => {
    const safeAuthor = DOMPurify.sanitize(review.authorName);
    const safeTitle = review.title ? DOMPurify.sanitize(review.title) : "";
    const safeContent = DOMPurify.sanitize(review.content);
    const dateStr = formatRelativeDate(review.createdAt);

    return (
      <Card elevation={1} sx={{ height: "100%" }}>
        <CardContent>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            mb={1}
          >
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={headingColor}
            >
              {safeAuthor}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {dateStr}
            </Typography>
          </Box>
          <Rating
            value={review.rating}
            readOnly
            size="small"
            aria-label={`Rating: ${review.rating} out of 5`}
          />
          {safeTitle && (
            <Typography
              variant="body2"
              fontWeight={600}
              mt={0.5}
              color={headingColor}
            >
              {safeTitle}
            </Typography>
          )}
          <Typography
            variant="body2"
            mt={0.5}
            color={bodyColor}
            sx={{ lineHeight: 1.6 }}
          >
            {safeContent}
          </Typography>
        </CardContent>
      </Card>
    );
  },
);

ReviewCard.displayName = "ReviewCard";

// ── Rating Breakdown ──────────────────────────────────────────────────────────

interface RatingBreakdownProps {
  summary: ReviewsSummary;
}

const RatingBreakdown: React.FC<RatingBreakdownProps> = React.memo(
  ({ summary }) => {
    return (
      <Box
        aria-label="Rating breakdown"
        sx={{ mb: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}
      >
        <Box display="flex" alignItems="center" gap={2} mb={2}>
          <Typography variant="h3" fontWeight={700} color="text.primary">
            {summary.average.toFixed(1)}
          </Typography>
          <Box>
            <Rating value={summary.average} readOnly precision={0.5} />
            <Typography variant="caption" color="text.secondary">
              {summary.total} {summary.total === 1 ? "review" : "reviews"}
            </Typography>
          </Box>
        </Box>

        {[5, 4, 3, 2, 1].map((star) => {
          const count = summary.breakdown[star] || 0;
          const pct = summary.total > 0 ? (count / summary.total) * 100 : 0;
          return (
            <Box key={star} display="flex" alignItems="center" gap={1} mb={0.5}>
              <Typography variant="caption" sx={{ minWidth: 16 }}>
                {star}
              </Typography>
              <Rating value={1} max={1} readOnly size="small" />
              <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  bgcolor: "grey.200",
                }}
              />
              <Typography
                variant="caption"
                sx={{ minWidth: 20, textAlign: "right" }}
              >
                {count}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  },
);

RatingBreakdown.displayName = "RatingBreakdown";

// ── Submit Form ───────────────────────────────────────────────────────────────

interface SubmitFormProps {
  blockId: number;
  entityType: string;
  primaryColor: string;
  onSuccess: () => void;
}

const ReviewSubmitForm: React.FC<SubmitFormProps> = React.memo(
  ({ blockId, entityType, primaryColor, onSuccess }) => {
    const [formData, setFormData] = useState({
      authorName: "",
      authorEmail: "",
      rating: 0,
      title: "",
      content: "",
      company: "", // honeypot
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<
      "idle" | "loading" | "success" | "error"
    >("idle");
    const [errorMessage, setErrorMessage] = useState("");

    const validate = useCallback(() => {
      const newErrors: Record<string, string> = {};
      if (!formData.authorName.trim())
        newErrors.authorName = "Name is required.";
      if (!formData.authorEmail.trim()) {
        newErrors.authorEmail = "Email is required.";
      } else if (!EMAIL_REGEX.test(formData.authorEmail.trim())) {
        newErrors.authorEmail = "Please enter a valid email address.";
      }
      if (!formData.rating) newErrors.rating = "Rating is required.";
      if (!formData.content.trim()) {
        newErrors.content = "Review content is required.";
      } else if (formData.content.trim().length < 10) {
        newErrors.content = "Review must be at least 10 characters.";
      }
      return newErrors;
    }, [formData]);

    const handleSubmit = useCallback(
      async (e: React.FormEvent) => {
        e.preventDefault();

        // Honeypot check — if filled, silently succeed (bot trap)
        if (formData.company) {
          setStatus("success");
          onSuccess();
          return;
        }

        const newErrors = validate();
        if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          return;
        }
        setErrors({});
        setStatus("loading");

        try {
          const res = await fetch(`${API_URL}/reviews`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              entityType,
              entityId: blockId,
              authorName: formData.authorName.trim(),
              authorEmail: formData.authorEmail.trim(),
              rating: formData.rating,
              title: formData.title.trim() || undefined,
              content: formData.content.trim(),
            }),
          });

          if (res.status === 429) {
            setErrorMessage(
              "Too many submissions. Please wait before submitting again.",
            );
            setStatus("error");
            return;
          }

          if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            setErrorMessage(
              body.message || "Failed to submit review. Please try again.",
            );
            setStatus("error");
            return;
          }

          setStatus("success");
          onSuccess();
        } catch {
          setErrorMessage(
            "Unable to submit review. Please check your connection.",
          );
          setStatus("error");
        }
      },
      [formData, validate, entityType, blockId, onSuccess],
    );

    if (status === "success") {
      return (
        <Alert severity="success" sx={{ mt: 3 }}>
          Thank you for your review! It will appear after approval.
        </Alert>
      );
    }

    return (
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          mt: 4,
          p: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
        }}
        aria-label="Submit a review"
        noValidate
      >
        <Typography variant="h6" fontWeight={700} mb={2}>
          Write a Review
        </Typography>

        {status === "error" && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {/* Honeypot — hidden from real users */}
        <Box
          component="input"
          name="company"
          value={formData.company}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((p) => ({ ...p, company: e.target.value }))
          }
          aria-hidden="true"
          tabIndex={-1}
          autoComplete="off"
          style={{
            position: "absolute",
            left: "-9999px",
            width: "1px",
            height: "1px",
            overflow: "hidden",
            display: "none",
          }}
        />

        <Stack spacing={2}>
          <TextField
            fullWidth
            label="Your Name"
            value={formData.authorName}
            onChange={(e) =>
              setFormData((p) => ({ ...p, authorName: e.target.value }))
            }
            error={Boolean(errors.authorName)}
            helperText={errors.authorName}
            required
            disabled={status === "loading"}
            size="small"
          />
          <TextField
            fullWidth
            label="Your Email"
            type="email"
            value={formData.authorEmail}
            onChange={(e) =>
              setFormData((p) => ({ ...p, authorEmail: e.target.value }))
            }
            error={Boolean(errors.authorEmail)}
            helperText={errors.authorEmail}
            required
            disabled={status === "loading"}
            size="small"
          />
          <Box>
            <Typography variant="body2" mb={0.5}>
              Rating <span aria-hidden="true">*</span>
            </Typography>
            <Rating
              value={formData.rating}
              onChange={(_, val) =>
                setFormData((p) => ({ ...p, rating: val || 0 }))
              }
              aria-label="Select your rating"
            />
            {errors.rating && (
              <Typography variant="caption" color="error">
                {errors.rating}
              </Typography>
            )}
          </Box>
          <TextField
            fullWidth
            label="Title (optional)"
            value={formData.title}
            onChange={(e) =>
              setFormData((p) => ({ ...p, title: e.target.value }))
            }
            disabled={status === "loading"}
            size="small"
          />
          <TextField
            fullWidth
            label="Review"
            multiline
            rows={4}
            value={formData.content}
            onChange={(e) =>
              setFormData((p) => ({ ...p, content: e.target.value }))
            }
            error={Boolean(errors.content)}
            helperText={errors.content}
            required
            disabled={status === "loading"}
            size="small"
          />
          <Button
            type="submit"
            variant="contained"
            disabled={status === "loading"}
            sx={{
              bgcolor: primaryColor,
              "&:hover": { bgcolor: primaryColor, opacity: 0.9 },
            }}
          >
            {status === "loading" ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              "Submit Review"
            )}
          </Button>
        </Stack>
      </Box>
    );
  },
);

ReviewSubmitForm.displayName = "ReviewSubmitForm";

// ── Main Component ────────────────────────────────────────────────────────────

const ReviewsBlockBase: React.FC<ReviewsBlockProps> = ({
  block,
  primaryColor = "#378C92",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const {
    heading = "Customer Reviews",
    entityType = "website",
    layout = "list",
    reviewsPerPage = 10,
    showRatingBreakdown = true,
    showSubmitForm = true,
    showPagination = true,
    sortBy = "newest",
    emptyMessage = "No reviews yet. Be the first to share your experience!",
  } = block.content;

  const [page, setPage] = useState(1);
  const [formKey, setFormKey] = useState(0);

  // Build parameterized dataSource string (same pattern as ProductShowcaseBlock)
  const dataSource = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(reviewsPerPage));
    params.set("sortBy", sortBy || "newest");
    params.set("entityType", entityType);
    return `review?${params.toString()}`;
  }, [page, reviewsPerPage, sortBy, entityType]);

  const { data, loading, error } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
    { enabled: true },
  );

  const reviewsData = data as ReviewsData | null;

  const reviews = useMemo<Review[]>(() => {
    if (!reviewsData?.reviews) return [];
    return reviewsData.reviews;
  }, [reviewsData]);

  const summary = useMemo<ReviewsSummary>(() => {
    if (!reviewsData?.summary) {
      return {
        average: 0,
        total: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }
    return reviewsData.summary;
  }, [reviewsData]);

  const totalPages = useMemo(() => {
    if (!reviewsData?.pagination) return 1;
    return reviewsData.pagination.totalPages || 1;
  }, [reviewsData]);

  const handleFormSuccess = useCallback(() => {
    setFormKey((k) => k + 1);
  }, []);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Box
          component="section"
          aria-label={heading || "Reviews"}
          sx={{ py: 6 }}
        >
          <Container maxWidth="lg">
            <Skeleton variant="text" width="40%" height={48} sx={{ mb: 2 }} />
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={120}
                sx={{ mb: 2, borderRadius: 1 }}
              />
            ))}
          </Container>
        </Box>
      </motion.div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <Box
          component="section"
          aria-label={heading || "Reviews"}
          sx={{ py: 6 }}
        >
          <Container maxWidth="lg">
            <Alert severity="error">{error}</Alert>
          </Container>
        </Box>
      </motion.div>
    );
  }

  // ── Render reviews ──────────────────────────────────────────────────────────

  const renderReviews = () => {
    if (reviews.length === 0) {
      return (
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ py: 4 }}
        >
          {emptyMessage}
        </Typography>
      );
    }

    if (layout === "grid") {
      return (
        <Grid container spacing={3}>
          {reviews.map((review) => (
            <Grid item xs={12} sm={6} key={review.id}>
              <ReviewCard
                review={review}
                headingColor={headingColor}
                bodyColor={bodyColor}
              />
            </Grid>
          ))}
        </Grid>
      );
    }

    if (layout === "carousel") {
      return (
        <Box
          sx={{
            display: "flex",
            gap: 2,
            overflowX: "auto",
            pb: 2,
            scrollSnapType: "x mandatory",
            "&::-webkit-scrollbar": { height: 6 },
            "&::-webkit-scrollbar-thumb": {
              bgcolor: "grey.300",
              borderRadius: 3,
            },
          }}
          role="region"
          aria-label="Reviews carousel"
        >
          {reviews.map((review) => (
            <Box
              key={review.id}
              sx={{
                minWidth: { xs: "85%", sm: "45%", md: "30%" },
                scrollSnapAlign: "start",
                flexShrink: 0,
              }}
            >
              <ReviewCard
                review={review}
                headingColor={headingColor}
                bodyColor={bodyColor}
              />
            </Box>
          ))}
        </Box>
      );
    }

    // list (default)
    return (
      <Stack spacing={2}>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            headingColor={headingColor}
            bodyColor={bodyColor}
          />
        ))}
      </Stack>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Box component="section" aria-label={heading || "Reviews"} sx={{ py: 6 }}>
        <Container maxWidth="lg">
          {heading && (
            <Typography
              variant="h3"
              component="h2"
              align="center"
              gutterBottom
              sx={{ mb: 4, fontWeight: 700, color: headingColor }}
            >
              {DOMPurify.sanitize(heading)}
            </Typography>
          )}

          {showRatingBreakdown && summary.total > 0 && (
            <RatingBreakdown summary={summary} />
          )}

          {renderReviews()}

          {showPagination && totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, val) => setPage(val)}
                color="primary"
                aria-label="Reviews pagination"
              />
            </Box>
          )}

          {showSubmitForm && (
            <ReviewSubmitForm
              key={formKey}
              blockId={block.id}
              entityType={entityType}
              primaryColor={primaryColor}
              onSuccess={handleFormSuccess}
            />
          )}
        </Container>
      </Box>
    </motion.div>
  );
};

ReviewsBlockBase.displayName = "ReviewsBlock";

const ReviewsBlock = React.memo(ReviewsBlockBase);
ReviewsBlock.displayName = "ReviewsBlock";

export default ReviewsBlock;
