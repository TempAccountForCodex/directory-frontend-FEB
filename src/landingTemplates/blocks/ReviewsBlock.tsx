import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import type { BusinessData } from "../types/BusinessData";
import type { TemplateTheme } from "../templateEngine/types";
import FadeIn from "./FadeIn";

export interface ReviewsBlockProps {
  data: BusinessData;
  theme: TemplateTheme;
  variant?: "cards" | "quotes" | "featured";
}

function StarRating({ rating, color }: { rating: number; color: string }) {
  return (
    <Box sx={{ display: "flex", gap: 0.25 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <StarIcon
          key={n}
          sx={{ fontSize: 18, color: n <= rating ? "#F59E0B" : color + "44" }}
        />
      ))}
    </Box>
  );
}

function CardsReviews({ data, theme }: Omit<ReviewsBlockProps, "variant">) {
  const reviews = data.reviews ?? [];
  return (
    <Box sx={{ bgcolor: theme.bgSecondary, py: { xs: 8, md: 12 }, px: 3 }}>
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 6,
          }}
        >
          What Clients Say
        </Typography>
      </FadeIn>
      <Grid container spacing={3} sx={{ maxWidth: 1100, mx: "auto" }}>
        {reviews.map((r, i) => (
          <Grid item xs={12} md={4} key={i}>
            <FadeIn delay={i * 0.1}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  border: `1px solid ${theme.borderColor}`,
                  bgcolor: theme.surfaceColor,
                  p: 1,
                }}
              >
                <CardContent>
                  <StarRating rating={r.rating} color={theme.borderColor} />
                  <Typography
                    sx={{
                      mt: 2,
                      color: theme.bodyColor,
                      fontFamily: theme.fontFamily,
                      lineHeight: 1.7,
                      fontStyle: "italic",
                    }}
                  >
                    "{r.text}"
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mt: 3,
                    }}
                  >
                    <Avatar
                      src={r.avatarUrl}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: theme.primaryColor,
                      }}
                    >
                      {r.author[0]}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontFamily: theme.fontFamily,
                          fontWeight: 700,
                          color: theme.headingColor,
                        }}
                      >
                        {r.author}
                      </Typography>
                      {r.date && (
                        <Typography
                          variant="caption"
                          sx={{ color: theme.bodyColor }}
                        >
                          {r.date}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function QuotesReviews({ data, theme }: Omit<ReviewsBlockProps, "variant">) {
  const reviews = data.reviews ?? [];
  return (
    <Box sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 12 }, px: 3 }}>
      <Box sx={{ maxWidth: 860, mx: "auto" }}>
        <FadeIn>
          <Typography
            variant="h3"
            sx={{
              fontFamily: theme.fontFamily,
              fontWeight: 800,
              color: theme.headingColor,
              mb: 6,
            }}
          >
            Testimonials
          </Typography>
        </FadeIn>
        {reviews.map((r, i) => (
          <FadeIn key={i} delay={i * 0.1}>
            <Box
              sx={{
                display: "flex",
                gap: 3,
                mb: 6,
                pb: 6,
                borderBottom:
                  i < reviews.length - 1
                    ? `1px solid ${theme.borderColor}`
                    : "none",
              }}
            >
              <FormatQuoteIcon
                sx={{
                  fontSize: 48,
                  color: theme.primaryColor,
                  flexShrink: 0,
                  mt: -1,
                }}
              />
              <Box>
                <StarRating rating={r.rating} color={theme.borderColor} />
                <Typography
                  sx={{
                    mt: 1.5,
                    color: theme.bodyColor,
                    fontFamily: theme.fontFamily,
                    fontSize: "1.1rem",
                    lineHeight: 1.75,
                  }}
                >
                  {r.text}
                </Typography>
                <Typography
                  sx={{
                    mt: 2,
                    fontWeight: 700,
                    fontFamily: theme.fontFamily,
                    color: theme.headingColor,
                  }}
                >
                  — {r.author}
                </Typography>
              </Box>
            </Box>
          </FadeIn>
        ))}
      </Box>
    </Box>
  );
}

function FeaturedReviews({ data, theme }: Omit<ReviewsBlockProps, "variant">) {
  const reviews = data.reviews ?? [];
  const [featured, ...rest] = reviews;
  return (
    <Box sx={{ bgcolor: theme.bgSecondary, py: { xs: 8, md: 12 }, px: 3 }}>
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 6,
          }}
        >
          Client Stories
        </Typography>
      </FadeIn>
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 3,
        }}
      >
        {featured && (
          <FadeIn>
            <Box
              sx={{
                bgcolor: theme.primaryColor,
                borderRadius: 3,
                p: 4,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <StarRating
                  rating={featured.rating}
                  color="rgba(255,255,255,0.3)"
                />
                <Typography
                  sx={{
                    mt: 3,
                    color: "#fff",
                    fontFamily: theme.fontFamily,
                    fontSize: "1.2rem",
                    lineHeight: 1.75,
                    fontStyle: "italic",
                  }}
                >
                  "{featured.text}"
                </Typography>
              </Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 4 }}
              >
                <Avatar
                  src={featured.avatarUrl}
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: "rgba(255,255,255,0.3)",
                  }}
                >
                  {featured.author[0]}
                </Avatar>
                <Typography
                  sx={{
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {featured.author}
                </Typography>
              </Box>
            </Box>
          </FadeIn>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {rest.slice(0, 3).map((r, i) => (
            <FadeIn key={i} delay={i * 0.1}>
              <Box
                sx={{
                  bgcolor: theme.surfaceColor,
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: 2,
                  p: 3,
                }}
              >
                <StarRating rating={r.rating} color={theme.borderColor} />
                <Typography
                  sx={{
                    mt: 1.5,
                    color: theme.bodyColor,
                    fontFamily: theme.fontFamily,
                    lineHeight: 1.65,
                  }}
                >
                  "{r.text}"
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    mt: 1.5,
                    display: "block",
                    fontWeight: 700,
                    color: theme.headingColor,
                  }}
                >
                  — {r.author}
                </Typography>
              </Box>
            </FadeIn>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

const ReviewsBlock: React.FC<ReviewsBlockProps> = ({
  data,
  theme,
  variant = "cards",
}) => {
  if (!data.reviews?.length) return null;
  if (variant === "quotes") return <QuotesReviews data={data} theme={theme} />;
  if (variant === "featured")
    return <FeaturedReviews data={data} theme={theme} />;
  return <CardsReviews data={data} theme={theme} />;
};

export default ReviewsBlock;
