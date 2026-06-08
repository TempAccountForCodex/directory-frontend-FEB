import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  useMediaQuery,
  useTheme,
  Grid,
  Skeleton,
} from "@mui/material";
import ScrollToTopButton from "../../utils/commons/ScrollToTopBtn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  fallbackInsights,
  fetchPublicInsights,
  getInsightImageUrl,
  type InsightPost,
} from "../../api/insights";

const star = "/assets/publicAssets/images/common/star.svg";
const homeHeroFont =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  const optimizedInsightMatch = imagePath.match(
    /^\/assets\/publicAssets\/images\/insights\/blog(\d+)\.png$/i,
  );
  if (optimizedInsightMatch) {
    return `/assets/images/insights/blog${optimizedInsightMatch[1]}.svg`;
  }
  if (imagePath.startsWith("/assets")) return imagePath;
  return getInsightImageUrl(imagePath);
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const excerpt = (text, max = 160) => {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max).trim()}...` : text;
};

const estimateReadTime = (content, description) => {
  const source = content || description || "";
  const words = source.split(/\s+/).filter(Boolean).length;
  const mins = Math.max(3, Math.round(words / 200));
  return `${mins} min read`;
};

const InsightsPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

  const [activeCategory, setActiveCategory] = useState("All");
  const [insights, setInsights] = useState<InsightPost[]>(fallbackInsights);

  useEffect(() => {
    let ignore = false;
    fetchPublicInsights().then((items) => {
      if (!ignore) setInsights(items);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const categories = useMemo<string[]>(() => {
    const dataCategories = Array.from(
      new Set(insights.map((article) => article.category).filter(Boolean))
    ).sort() as string[];
    return ["All", ...dataCategories];
  }, [insights]);

  const filtered = useMemo(() => {
    if (activeCategory === "All") return insights;
    return insights.filter((article) => article.category === activeCategory);
  }, [activeCategory, insights]);

  const featured = useMemo(() => {
    if (!filtered.length) return undefined;
    const randomIndex = Math.floor(Math.random() * filtered.length);
    return filtered[randomIndex];
  }, [filtered, activeCategory]);

  const smallCards = useMemo(
    () => filtered.filter((article) => article.id !== featured?.id),
    [filtered, featured?.id]
  );

  const showFeatured = Boolean(featured);

  const openInsight = (article) => {
    const identifier = article.slug || article.legacyId || article.id;
    navigate(`/blogdetail/${identifier}`, { state: { insight: article } });
  };

  const ArticleCard = ({
    article,
    featured: isFeatured = false,
  }: {
    article: any;
    featured?: boolean;
  }) => {
    const showContent = true;

    if (isFeatured) {
      return (
        <Box
          sx={{
            gridColumn: "1 / -1",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            height: { xs: "auto", md: "clamp(280px, 24vw, 370px)" },
            minHeight: { xs: "auto", md: "280px" },
            border: "1px solid #d7e2ec",
            borderRadius: "16px",
            cursor: "pointer",
            background: "#ffffff",
            transition: "border-color 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease",
            position: "relative",
            isolation: "isolate",
            overflow: "hidden",
            boxShadow: "0 8px 18px rgba(12, 28, 45, 0.08)",
            "&:hover": {
              borderColor: "rgba(0, 160, 150, 0.42)",
              transform: "translateY(-6px)",
              boxShadow: "0 18px 34px rgba(12, 28, 45, 0.18), 0 0 0 1px rgba(0, 160, 150, 0.15)",
            },
          }}
          onClick={() => openInsight(article)}
        >
          <Box
            sx={{
              flex: { xs: "none", md: "0 0 45%" },
              height: { xs: "clamp(200px, 38vw, 280px)", md: "100%" },
              position: "relative",
              background: "#0a1825",
            }}
          >
            <Box
              component="img"
              src={getImageUrl(article.image)}
              alt={article.title}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: "16px",
                left: "16px",
                background: "#1c666b",
                color: "#ffffffea",
                fontSize: "12px",
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: "100px",
                letterSpacing: "0.6px",
                zIndex: 1,
                opacity: showContent ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              {article.category}
            </Box>
          </Box>

          <Box
            sx={{
              flex: 1,
              padding: { xs: "24px", md: "38px 42px 36px" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "8px",
              color: "#0f172a",
              position: "relative",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "12px", color: "#64748b", fontSize: "12px" }}>
                <Typography variant="body2">{formatDate(article.publishedAt)}</Typography>
                <Typography variant="body2">|</Typography>
                <Typography variant="body2">{estimateReadTime(article.content, article.description)}</Typography>
              </Box>
              <Typography
                variant="h4"
                sx={{
                  color: "#0f172a",
                  fontSize: { xs: "22px", md: "27px" },
                  fontWeight: 700,
                  lineHeight: 1.3,
                  mb: "14px",
                  letterSpacing: "-0.4px",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {article.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#475569",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  mb: "24px",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {excerpt(article.description, 230)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto", pt: "16px", borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px" }}>
                <Typography variant="body2">TechTribe Editorial</Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "#048e84", fontWeight: 600, letterSpacing: "1px" }}>
                  Read Article <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      );
    }

    return (
      <Box
        sx={{
          border: "1px solid #d7e2ec",
          borderRadius: "14px",
          cursor: "pointer",
          transition: "border-color 0.28s ease, transform 0.28s ease, box-shadow 0.28s ease",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          boxShadow: "0 6px 14px rgba(12, 28, 45, 0.07)",
          height: "100%",
          "&:hover": {
            borderColor: "rgba(0, 160, 150, 0.45)",
            transform: "translateY(-6px)",
            boxShadow: "0 16px 30px rgba(12, 28, 45, 0.16), 0 0 0 1px rgba(0, 160, 150, 0.12)",
          },
        }}
        onClick={() => openInsight(article)}
      >
        <Box
          sx={{
            height: "220px",
            position: "relative",
            background: "#0a1825",
          }}
        >
          <Box
            component="img"
            src={getImageUrl(article.image)}
            alt={article.title}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              background: "#1c666b",
              border: "1px solid #1c666b",
              color: "#ffffffea",
              fontSize: "11px",
              fontWeight: 700,
              padding: "3px 10px",
              borderRadius: "100px",
              letterSpacing: "0.6px",
              zIndex: 1,
              opacity: showContent ? 1 : 0,
              transition: "opacity 0.3s ease",
            }}
          >
            {article.category}
          </Box>
        </Box>

        <Box
          sx={{
            padding: "22px",
            flex: 1,
            display: "flex",
            flexDirection: "column",
            color: "#0f172a",
            position: "relative",
          }}
        >
          {!showContent && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                padding: "22px",
                background: "#ffffff",
                zIndex: 2,
                pointerEvents: "none",
              }}
            >
              <Skeleton variant="text" width="44%" height={12} />
              <Skeleton variant="text" width="100%" height={24} />
              <Skeleton variant="text" width="72%" height={24} />
              <Skeleton variant="text" width="100%" height={14} />
              <Skeleton variant="text" width="84%" height={14} />
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: "auto", pt: "16px", borderTop: "1px solid #e2e8f0" }}>
                <Skeleton variant="text" width="38%" height={12} />
                <Skeleton variant="text" width="24%" height={12} />
              </Box>
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              visibility: showContent ? "visible" : "hidden",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px", mb: "12px", color: "#64748b", fontSize: "12px" }}>
              <Typography variant="body2">{formatDate(article.publishedAt)}</Typography>
              <Typography variant="body2">|</Typography>
              <Typography variant="body2">{estimateReadTime(article.content, article.description)}</Typography>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: "#1e293b",
                fontSize: "18px",
                fontWeight: 700,
                lineHeight: 1.35,
                mb: "10px",
                letterSpacing: "-0.2px",
              }}
            >
              {article.title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#475569",
                fontSize: "14px",
                lineHeight: 1.62,
                mb: "auto",
              }}
            >
              {excerpt(article.description, 125)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "20px", pt: "16px", borderTop: "1px solid #e2e8f0", color: "#64748b", fontSize: "12px" }}>
              <Typography variant="body2">TechTribe Editorial</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: "4px", color: "#048e84", fontWeight: 600, letterSpacing: "1px" }}>
                Read <ArrowForwardIcon sx={{ fontSize: "1rem" }} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#020c15",
        overflowX: "hidden",
        fontFamily: homeHeroFont,
        "& .MuiTypography-root, & .MuiButton-root": {
          fontFamily: homeHeroFont,
        },
      }}
    >
      <ScrollToTopButton />

      <Box
        sx={{
          position: "relative",
          minHeight: "480px",
          overflow: "hidden",
          bgcolor: "#020303",
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(55,140,146,0.35) 0%, rgba(2,3,3,0) 45%),
            radial-gradient(circle at 80% 70%, rgba(45,212,191,0.24) 0%, rgba(2,3,3,0) 42%),
            url(${star})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
            zIndex: 3,
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            padding: {
              xs: "102px 20px 42px",
              md: "118px 96px 48px",
              lg: "136px 200px 56px",
            },
          }}
        >
          <Typography
            sx={{
              color: "#dff7fb",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "3.5px",
              textTransform: "uppercase",
              mb: "20px",
            }}
          >
            THE FUTURE OF AI KNOWLEDGE
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: {
                xs: "clamp(36px, 12vw, 48px)",
                md: "clamp(48px, 6vw, 82px)",
              },
              fontWeight: 800,
              lineHeight: { xs: 1.08, md: 1.03 },
              color: "#ffffff",
              mb: "30px",
              maxWidth: { xs: "100%", md: "720px" },
              letterSpacing: { xs: "-0.8px", md: "-1.3px" },
            }}
          >
            Blogs, Insights &amp; <br />
            <Box
              component="span"
              sx={{
                color: "#398c91",
                WebkitTextStroke: "1px #ffffff74",
              }}
            >
              Articles
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "rgba(232,242,247,0.82)",
              fontSize: { xs: "14px", md: "17px" },
              lineHeight: 1.75,
              maxWidth: { xs: "100%", md: "620px" },
              mb: "56px",
            }}
          >
            Exploring the frontiers of artificial intelligence, cloud computing,
            cybersecurity, and the future of digital transformation.
          </Typography>

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {categories.map((category) => (
              <Button
                key={category}
                variant="outlined"
                sx={{
                  padding: "8px 18px",
                  borderRadius: "100px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border:
                    activeCategory === category
                      ? "1.5px solid #00c5b8"
                      : "1.5px solid rgba(255,255,255,0.12)",
                  background:
                    activeCategory === category
                      ? "rgba(0,197,184,0.12)"
                      : "rgba(255,255,255,0.04)",
                  color: activeCategory === category ? "#00c5b8" : "#7a9ab0",
                  transition: "all 0.2s",
                  "&:hover": {
                    borderColor: "#00c5b8",
                    background: "rgba(0,197,184,0.12)",
                    color: "#00c5b8",
                  },
                }}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          width: "100%",
          padding: {
            xs: "42px 20px 64px",
            md: "52px 96px 76px",
            lg: "64px 200px 90px",
          },
          position: "relative",
          isolation: "isolate",
          overflow: "hidden",
          backgroundColor: "#f7f5f3",
          borderRadius: { xs: "20px 20px 0 0", md: 0 },
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/assets/images/insights/bg-1.webp')",
            backgroundRepeat: "repeat",
            backgroundPosition: "left top",
            backgroundSize: "auto",
            filter: "brightness(1) hue-rotate(0deg) saturate(1)",
            zIndex: 0,
            pointerEvents: "none",
          },
          "&::after": {
            content: "none",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            contentVisibility: "auto",
            containIntrinsicSize: "1200px",
          }}
        >
          {filtered.length === 0 ? (
            <Box
              sx={{ textAlign: "center", padding: "80px 0", color: "#64748b" }}
            >
              <Typography variant="h6">
                No articles found in this category yet.
              </Typography>
            </Box>
          ) : (
            <>
              <Grid container spacing={{ xs: 2, md: 3, lg: 4 }}>
                {showFeatured && (
                  <Grid item xs={12}>
                    <ArticleCard article={featured} featured />
                  </Grid>
                )}
                {smallCards.map((article) => (
                  <Grid item xs={12} sm={6} lg={4} key={article.id}>
                    <ArticleCard article={article} />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default InsightsPage;
