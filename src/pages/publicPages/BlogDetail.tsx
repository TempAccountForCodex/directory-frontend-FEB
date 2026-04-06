import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Helmet } from "react-helmet";
import { getFallbackInsightByIdentifier } from "../../utils/data/Insights";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

interface Blog {
  metaTitle?: string;
  title: string;
  metaDescription?: string;
  content: string;
  keywords?: string[];
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
  image?: string;
  author?: string | { name?: string };
  createdAt?: string;
  publishedAt?: string;
  category?: string;
  description?: string;
  headings?: any[];
  [key: string]: any;
}

const getAuthorName = (author: Blog["author"]) =>
  typeof author === "string" ? author : author?.name || "";

const InsightsDetailsNew = () => {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchInsightDetails();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id, retryCount]);

  const fetchInsightDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(`${API_URL}/insights/public/${id}`);
      // Support both 'insight' and 'blog' keys for backward compatibility
      const insight = response.data.insight || response.data.blog;
      if (insight) {
        setBlog(insight);
      } else {
        const fallbackInsight = getFallbackInsightByIdentifier(id);
        if (fallbackInsight) {
          setBlog(fallbackInsight);
        } else {
          setError("Insight not found");
          setBlog(null);
        }
      }
      setLoading(false);
    } catch (error: any) {
      console.error("Error fetching insight details:", error);
      const fallbackInsight = getFallbackInsightByIdentifier(id);
      if (fallbackInsight) {
        setBlog(fallbackInsight);
        setError(null);
      } else {
        const errorMsg =
          error.response?.data?.message || error.message || "Insight not found";
        setError(errorMsg);
        setBlog(null);
      }
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        <CircularProgress size={60} sx={{ color: "#378C92" }} />
        <Typography sx={{ color: "#616161", fontFamily: "Questrial" }}>
          Loading insight...
        </Typography>
      </Box>
    );
  }

  if (error || !blog) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: "#f5f5f5",
          padding: "40px 20px",
          gap: 2,
        }}
      >
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
        >
          {error?.includes("not found") || error?.includes("NOT_FOUND")
            ? "Insight Not Found"
            : "Failed to Load Insight"}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 2,
            textAlign: "center",
            maxWidth: "600px",
            color: "#616161",
          }}
        >
          {error ||
            "We're sorry, but the insight you're looking for doesn't exist. Please check the URL or go back to the insights page."}
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {!error?.includes("not found") && !error?.includes("NOT_FOUND") && (
            <Button
              variant="outlined"
              onClick={handleRetry}
              sx={{
                borderColor: "#378C92",
                color: "#378C92",
                "&:hover": {
                  borderColor: "#313431",
                  backgroundColor: "#f0f0f0",
                },
                textTransform: "none",
                padding: "10px 30px",
              }}
            >
              Try Again
            </Button>
          )}
          <Button
            variant="contained"
            onClick={() => navigate("/insights")}
            sx={{
              background: "linear-gradient(135deg, #378C92 0%, #313431 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #313431 0%, #378C92 100%)",
              },
              textTransform: "none",
              padding: "10px 30px",
            }}
          >
            Back to Insights
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Helmet>
        <title>{blog.metaTitle || blog.title} | TheTechietribe</title>
        <meta
          name="description"
          content={blog.metaDescription || blog.content}
        />
        {blog.keywords && (
          <meta name="keywords" content={blog.keywords.join(", ")} />
        )}
        <meta property="og:title" content={blog.metaTitle || blog.title} />
        <meta
          property="og:description"
          content={blog.ogDescription || blog.content}
        />
        {blog.ogImage && <meta property="og:image" content={blog.ogImage} />}
        <meta property="og:type" content="article" />
        {blog.canonicalUrl && <link rel="canonical" href={blog.canonicalUrl} />}
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: { xs: "300px", md: "400px" },
          backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${blog.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            sx={{
              color: "white",
              fontWeight: 700,
              fontSize: { xs: "2rem", md: "3rem" },
              textAlign: "center",
              textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
            }}
          >
            {blog.title}
          </Typography>
        </Container>
      </Box>

      {/* Article Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            {/* Metadata */}
            <Box
              sx={{
                mb: 4,
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                alignItems: "center",
              }}
            >
              <Chip
                icon={<CalendarTodayIcon sx={{ fontSize: "1rem" }} />}
                label={formatDate(blog.publishedAt)}
                sx={{ backgroundColor: "#f0f0f0" }}
              />
              <Chip
                label={blog.category}
                sx={{
                  backgroundColor: "#378C92",
                  color: "white",
                  fontWeight: 600,
                }}
              />
              {blog.author && (
                <Chip
                  icon={<PersonIcon sx={{ fontSize: "1rem" }} />}
                  label={`By ${getAuthorName(blog.author)}`}
                  sx={{ backgroundColor: "#f0f0f0" }}
                />
              )}
            </Box>

            {/* Description */}
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                lineHeight: 1.8,
                color: "#555",
                fontStyle: "italic",
                borderLeft: "4px solid #378C92",
                paddingLeft: 3,
                backgroundColor: "#f9f9f9",
                padding: 3,
                borderRadius: "8px",
              }}
            >
              {blog.description}
            </Typography>

            {/* Content Sections */}
            {blog.headings &&
              blog.headings.map((section, index) => (
                <Box key={index} sx={{ mb: 5 }}>
                  <Typography
                    variant="h4"
                    sx={{
                      mb: 3,
                      fontWeight: 700,
                      color: "#313431",
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {section.heading}
                  </Typography>
                  {Array.isArray(section.description) ? (
                    section.description.map((paragraph, pIndex) => (
                      <Typography
                        key={pIndex}
                        variant="body1"
                        sx={{
                          mb: 2,
                          lineHeight: 1.8,
                          color: "#555",
                          textAlign: "justify",
                        }}
                      >
                        {paragraph}
                      </Typography>
                    ))
                  ) : (
                    <Typography
                      variant="body1"
                      sx={{
                        mb: 2,
                        lineHeight: 1.8,
                        color: "#555",
                        textAlign: "justify",
                      }}
                    >
                      {section.description}
                    </Typography>
                  )}
                </Box>
              ))}

            {/* Navigation Buttons */}
            <Box
              sx={{
                mt: 6,
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/insights")}
                sx={{
                  borderColor: "#378C92",
                  color: "#378C92",
                  "&:hover": {
                    borderColor: "#313431",
                    backgroundColor: "#f0f0f0",
                  },
                }}
              >
                Back to Insights
              </Button>
              <Button
                variant="contained"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                sx={{
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #764ba2 0%, #667eea 100%)",
                  },
                }}
              >
                Back to Top
              </Button>
            </Box>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Box
              sx={{
                position: { md: "sticky" },
                top: 100,
                backgroundColor: "#f9f9f9",
                padding: 3,
                borderRadius: "12px",
                boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Article Information
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Category
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {blog.category}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Published On
                </Typography>
                <Typography variant="body1" fontWeight="600">
                  {formatDate(blog.publishedAt)}
                </Typography>
              </Box>

              {blog.author && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Author
                  </Typography>
                  <Typography variant="body1" fontWeight="600">
                    {getAuthorName(blog.author)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 4 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate("/insights")}
                  sx={{
                    background:
                      "linear-gradient(135deg, #378C92 0%, #313431 100%)",
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #313431 0%, #378C92 100%)",
                    },
                  }}
                >
                  Explore More Articles
                </Button>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

export default InsightsDetailsNew;
