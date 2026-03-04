import React, { useState, useEffect } from "react";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Divider,
  TextField,
  Typography,
  Pagination,
  Stack,
  PaginationItem,
  InputAdornment,
  useMediaQuery,
  Button,
  InputBase,
  CircularProgress,
  alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Search } from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { transform } from "framer-motion";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:5001';

// Helper function to get full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  // If image path already starts with http, return as is
  if (imagePath.startsWith('http')) return imagePath;
  // Otherwise prepend base URL
  return `${BASE_URL}${imagePath}`;
};

const categories = [
  "Artificial Intelligence",
  "Blockchain",
  "Cloud",
  "Digital Technology",
  "Electric World",
  "Miscellaneous",
  "Transportation",
];

const styles = {
  mainContainer: {
    backgroundColor: "#ffffff",
    marginLeft: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "space-between",
    width: { xs: "100%", md: "70%" },
  },
  cardContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "stretch",
    flexWrap: "wrap",
    gap: "2rem",
    width: "100%",
  },
  card: {
    display: "flex",
    flexDirection: "column",
    width: {
      xs: "100%",
      sm: "calc(50% - 1rem)",
      lg: "calc(33% - 1.5rem)",
    },
    height: "auto",
    borderRadius: "20px",
    cursor: "pointer",
    overflow: "hidden",

    transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
    boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.08)",
    "&:hover": {
      transform: "translateY(-10px)",
      boxShadow: "0px 20px 60px rgba(0, 0, 0, 0.15)",
    },
  },
  blogImage: {
    width: "100%",
    height: "250px",
    objectFit: "cover",
    display: "block",
    transition: "transform 0.5s ease-in-out",
  },
  imageContainer: {
    overflow: "hidden",
    borderRadius: "20px 20px 0 0",
    "&:hover img": {
      transform: "scale(1.1)",
    },
  },
  blogContentContainer: {
    clipPath:
      "polygon(0 0, 197px 0px, 251px 50px, 100% 51px, 100% 100%, 0% 100%)",
    // marginTop: "-70px",
    display: "flex",
    flexDirection: "column",
    padding: "15px 24px 24px 24px",
    backgroundColor: "#ffffff",
    height: "250px",
    justifyContent: "space-between",
  },
  blogHeading: {
    fontSize: "1.25rem",
    fontFamily: "Questrial",
    fontWeight: "900",
    color: "#313431",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    marginBottom: "8px",
  },
  blogContent: {
    fontSize: "1rem",
    fontFamily: "Questrial",
    fontWeight: "400",
    color: "#616161",
    lineHeight: 1.6,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
  },
  dateAndCategoryContainer: {
    display: "block",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  publishDate: {
    fontSize: "0.85rem",
    fontFamily: "Barlow",
    fontWeight: "500",
    color: "#888",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  cardCategory: {
    fontSize: "0.75rem",
    fontFamily: "Questrial",
    fontWeight: "500",
    color: "white",
    backgroundColor: "#378C92",
    padding: "4px 8px",
    borderRadius: "4px",
    display: "inline-block",
    marginTop: "8px",
  },
  readMoreContainer: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#378C92",
    alignSelf: "flex-start",
    marginTop: "16px",
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
      transform: "translateX(8px)",
      color: "#313431",
    },
  },

  readMoreButton: {
    display: "flex",
    alignItems: "center",
    gap: "8px", // Add space between the text and the arrow
    cursor: "pointer",
    padding: "0",
    border: "none",
    backgroundColor: "transparent",
    marginTop: "auto",
    "&:hover .readMoreText::after": {
      width: "100%",
    },
    "&:hover .readMoreIcon": {
      transform: "translateX(4px)",
    },
  },

  readMoreText: {
    position: "relative",
    display: "inline-block",
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: "14px",
    fontWeight: "400",
    color: "#378C92", // Initial text color
    letterSpacing: "1px",
    transition: "color 0.3s ease-in-out",
    "&::after": {
      content: '""',
      position: "absolute",
      bottom: "-3px",
      left: 0,
      width: "40%", // Initial short underline
      height: "2px",
      backgroundColor: "#378C92",
      transition: "width 0.3s ease-in-out, background-color 0.3s ease-in-out",
    },
  },

  readMoreIcon: {
    fontSize: "1.2rem",
    color: "#378C92", // Initial icon color
    transition: "transform 0.3s ease-in-out, color 0.3s ease-in-out",
  },

  sidebar: {
    height: "fit-content",
    position: { xs: "static", md: "sticky" },
    top: "50px",
    overflowY: "auto",
    padding: "20px",
    borderRadius: "16px",
    paddingLeft: "50px",

    // boxShadow: "0px 6px 20px rgba(0, 0, 0, 0.08)",
    // backgroundColor: "#ffffff",
  },
  sidebarHeading: {
    fontSize: "22px",
    fontFamily: "Barlow",
    fontWeight: "600",
    color: "#313431",
    marginBottom: "1rem",
    textTransform: "uppercase",
  },
  recentPostItem: {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
    my: "1.5rem",
    cursor: "pointer",
    alignItems: "flex-start", // Align items to the top
    "&:hover .recent-post-title": {
      color: "#378C92",
      fontWeight: "bold",
    },
  },
  recentPostImage: {
    width: "75px",
    height: "75px",
    objectFit: "cover",
    borderRadius: "4px",
    flexShrink: 0,
  },
  recentPostContent: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  recentPostTitle: {
    fontSize: "15px",
    fontFamily: "Barlow",
    fontWeight: "600",
    color: "#313431",
    lineHeight: 1.4,
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    transition: "color 0.3s ease-in-out",
  },
  recentPostDate: {
    fontSize: "12px",
    fontFamily: "Barlow",
    fontWeight: "400",
    color: "#888",
    marginTop: "4px",
  },

  blogHeadingRecent: {
    fontSize: "14px",
    fontFamily: "Barlow",
    fontWeight: "400",
    color: "#313431",
    width: "80%",
    cursor: "pointer",
    transition: "color 0.3s ease-in-out",
    "&:hover": {
      color: "#378C92",
      fontWeight: "600",
    },
  },
  categoryLink: {
    padding: "5px 12px",
    borderRadius: "5px",
    backgroundColor: "transparent",
    transition: "background-color 0.3s ease-in-out",
    cursor: "pointer",
    "&:hover": {
      backgroundColor: "#f0f0f0",
    },
  },
  categoryLinkActive: {
    backgroundColor: "#378C92",
    color: "#fff",
    fontWeight: "bold",
    "&:hover": {
      backgroundColor: "#313431",
    },
  },

  searchBarButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "1px solid #00000029",
    borderRadius: "50px",
    padding: "6px 12px",
    width: "100%",
  },
  searchInput: {
    color: "rgb(0 0 0 / 60%)",
    "& .MuiInputBase-input": {
      padding: "8px 12px",
      fontFamily: "Questrial",
    },
  },
  searchIconBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: "50%",
    width: "35px",
    height: "35px",
    flexShrink: 0,
  },
  searchIcon: {
    fontSize: "1.2rem",
    color: "black",
  },
};

const InsightCards = () => {
  const theme = useTheme();
  const isMediumOrSmaller = useMediaQuery(theme.breakpoints.down("xl"));
  const itemsPerPage = isMediumOrSmaller ? 8 : 9;

  const [page, setPage] = useState(1);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [blogsData, setBlogsData] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Fetch insights from API
  useEffect(() => {
    fetchInsights();
  }, [page, currentCategory, searchQuery, retryCount]);

  // Fetch recent posts and categories on mount
  useEffect(() => {
    fetchRecentPosts();
    fetchCategories();
  }, []);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, [page]);

  const fetchInsights = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page: page,
        limit: itemsPerPage,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      };

      if (currentCategory) {
        params.category = currentCategory;
      }

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await axios.get(`${API_URL}/insights/public`, { params });

      // Support both 'insights' and 'blogs' keys for backward compatibility
      const insights = response.data.insights || response.data.blogs || [];
      setBlogsData(insights);
      setTotalPages(response.data.pagination?.totalPages || 1);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching insights:', error);
      setError(error.response?.data?.message || error.message || 'Failed to load insights. Please try again.');
      setBlogsData([]);
      setTotalPages(1);
      setLoading(false);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const fetchRecentPosts = async () => {
    try {
      const response = await axios.get(`${API_URL}/insights/public`, {
        params: { page: 1, limit: 5, sortBy: 'publishedAt', sortOrder: 'desc' }
      });
      const insights = response.data.insights || response.data.blogs || [];
      setRecentPosts(insights);
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      setRecentPosts([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/insights/categories`);
      setAvailableCategories(response.data.categories || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to default categories if API fails
      setAvailableCategories([
        "Artificial Intelligence",
        "Cloud Computing",
        "Workforce Strategy",
        "Cybersecurity",
        "Technology",
        "Real Estate Technology",
        "Entertainment Technology",
        "Logistics & Supply Chain",
        "Healthcare Technology",
        "Agriculture Technology"
      ]);
    }
  };

  const handleCardClick = (insight) => {
    // Use slug for SEO-friendly URLs, fallback to legacyId or id
    const identifier = insight.slug || insight.legacyId || insight.id;
    navigate(`/insight-details/${identifier}`);
  };

  const handleSearchChange = (event) => {
    setPage(1);
    setCurrentCategory(null);
    setSearchQuery(event.target.value);
  };

  const handlePagination = (e, value) => {
    setPage(value);
  };

  const handlePrev = () => {
    setPage(prev => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setPage(prev => Math.min(totalPages, prev + 1));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        width: "100%",
        display: "flex",
        flexDirection: { xs: "column-reverse", md: "row" },
        justifyContent: "center",
        padding: { xs: "20px 15px", md: "40px", lg: "80px" },
      }}
    >
      <Box
        sx={{
          ...styles.mainContainer,
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: 2 }}>
            <CircularProgress size={60} sx={{ color: '#378C92' }} />
            <Typography sx={{ color: '#616161', fontFamily: 'Questrial' }}>
              Loading insights...
            </Typography>
          </Box>  
        ) : error ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '500px',
              flexDirection: 'column',
              gap: 3,
              padding: 6,
              background: alpha('#f5f5f5', 0.5),
              borderRadius: '20px',
              margin: '40px auto',
              maxWidth: '600px',
              border: `1px solid ${alpha('#378C92', 0.1)}`
            }}
          >
            {/* Error Icon */}
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: alpha('#378C92', 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'pulse 2s ease-in-out infinite',
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)' },
                  '50%': { transform: 'scale(1.05)' }
                }
              }}
            >
              <ErrorOutlineIcon sx={{ fontSize: 40, color: '#378C92' }} />
            </Box>

            {/* Error Title */}
            <Typography
              sx={{
                fontSize: { xs: "24px", md: "28px" },
                fontFamily: "Barlow",
                fontWeight: "600",
                color: "#313431",
                textAlign: "center",
                letterSpacing: '-0.5px'
              }}
            >
              Oops! Something Went Wrong
            </Typography>

            {/* Error Message */}
            <Typography
              sx={{
                fontSize: { xs: "15px", md: "16px" },
                fontFamily: "Questrial",
                color: "#616161",
                textAlign: "center",
                maxWidth: "450px",
                lineHeight: 1.7
              }}
            >
              We couldn't load the insights at this moment. This could be due to a temporary connection issue or server maintenance.
            </Typography>

            {/* Technical Error Details (if available) */}
            {error && (
              <Box
                sx={{
                  backgroundColor: alpha('#ff6b6b', 0.05),
                  border: `1px solid ${alpha('#ff6b6b', 0.2)}`,
                  borderRadius: '8px',
                  padding: '12px 20px',
                  maxWidth: '450px',
                  width: '100%'
                }}
              >
                <Typography
                  sx={{
                    fontSize: "13px",
                    fontFamily: "monospace",
                    color: "#d32f2f",
                    textAlign: "center",
                    wordBreak: 'break-word'
                  }}
                >
                  Error: {error}
                </Typography>
              </Box>
            )}

            {/* Retry Button */}
            <Button
              variant="contained"
              onClick={handleRetry}
              startIcon={<RefreshIcon />}
              sx={{
                marginTop: 1,
                backgroundColor: '#378C92',
                color: '#ffffff',
                fontFamily: 'Barlow',
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '16px',
                padding: '12px 36px',
                borderRadius: '50px',
                boxShadow: '0 4px 14px 0 rgba(55, 140, 146, 0.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#2c7179',
                  boxShadow: '0 6px 20px 0 rgba(55, 140, 146, 0.35)',
                  transform: 'translateY(-2px)'
                },
                '&:active': {
                  transform: 'translateY(0)'
                }
              }}
            >
              Try Again
            </Button>

            {/* Help Text */}
            <Typography
              sx={{
                fontSize: "13px",
                fontFamily: "Questrial",
                color: alpha('#616161', 0.7),
                textAlign: "center",
                marginTop: 1
              }}
            >
              If the problem persists, please contact our support team
            </Typography>
          </Box>
        ) : blogsData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', flexDirection: 'column', gap: 2 }}>
            <Typography sx={{ fontSize: "24px", fontFamily: "Barlow", fontWeight: "500", color: "#313431", textAlign: "center" }}>
              No Insights Found
            </Typography>
            <Typography sx={{ fontSize: "16px", fontFamily: "Questrial", color: "#616161", textAlign: "center" }}>
              {searchQuery || currentCategory ? "Try adjusting your filters or search query." : "Check back later for new insights."}
            </Typography>
          </Box>
        ) : (
          <>
            <Box
              sx={{
                ...styles.cardContainer,
              }}
            >
              {blogsData?.map((card, index) => (
                <Box
                  key={card.id || index}
                  sx={styles.card}
                  onClick={() => handleCardClick(card)}
                >
                  <Box sx={styles.imageContainer}>
                    <img
                      src={getImageUrl(card.image)}
                      alt={`blog-image-${index}`}
                      style={styles.blogImage}
                    />
                  </Box>
                  <Box sx={styles.blogContentContainer}>
                    <Box sx={styles.dateAndCategoryContainer}>
                      <Typography sx={styles.publishDate}>
                        <CalendarTodayIcon sx={{ fontSize: "1rem" }} />
                        {formatDate(card.publishedAt)}
                      </Typography>
                      {card.category && (
                        <Typography sx={styles.cardCategory}>
                          {card.category}
                        </Typography>
                      )}
                    </Box>
                    <Typography sx={styles.blogHeading}>
                      {card.title}
                    </Typography>
                    <Typography sx={styles.blogContent}>
                      {card.content}
                    </Typography>
                    <Box
                      sx={styles.readMoreButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(card);
                      }}
                    >
                      <Typography
                        sx={styles.readMoreText}
                        className="readMoreText"
                      >
                        Read More
                      </Typography>
                      <ArrowForwardIcon
                        sx={styles.readMoreIcon}
                        className="readMoreIcon"
                      />
                    </Box>
                  </Box>
                </Box>
              ))}
            </Box>
            <Box
              sx={{
                mt: "20px",
                display: "flex",
                justifyContent: "center",
                position: "relative",
                top: "30px",
              }}
            >
              <Stack spacing={2}>
                <Pagination
                  count={totalPages}
                  shape="rounded"
                  page={page}
                  onChange={handlePagination}
                  renderItem={(item) => (
                    <PaginationItem
                      {...item}
                      onClick={(e) => {
                        if (item.type === "previous") {
                          handlePrev();
                        } else if (item.type === "next") {
                          handleNext();
                        }
                      }}
                    />
                  )}
                />
              </Stack>
            </Box>
          </>
        )}
      </Box>

      <Box sx={styles.sidebar}>
        <Box
          sx={{
            backgroundColor: "#ffffff",
            width: "100%",
            display: "flex",
            flexDirection: { xs: "column-reverse", md: "row" },
            justifyContent: "center",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Box sx={styles.searchBarButton}>
              <InputBase
                placeholder="Type to search"
                sx={styles.searchInput}
                onChange={handleSearchChange}
                inputProps={{
                  sx: {
                    "&::placeholder": {
                      color: "black",
                    },
                  },
                }}
              />
              <Box sx={styles.searchIconBox}>
                <Search sx={styles.searchIcon} />
              </Box>
            </Box>
          </Box>
        </Box>
        <Box
          sx={{
            mt: "2rem",
            background: "#f7f5f3",
            padding: "20px",
            borderRadius: "2px",
          }}
        >
          <Typography sx={styles.sidebarHeading}>Recent Posts</Typography>
          {recentPosts.map((data, index) => (
            <Box
              key={data.id || index}
              onClick={() => handleCardClick(data)}
              sx={styles.recentPostItem}
            >
              <Box sx={styles.recentPostContent}>
                <Typography
                  sx={styles.recentPostTitle}
                  className="recent-post-title"
                >
                  {data.title}
                </Typography>
                <Typography sx={styles.recentPostDate}>
                  {formatDate(data.publishedAt)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            my: "2rem",
            background: "#f7f5f3",
            padding: "20px",
            borderRadius: "2px",
          }}
        >
          <Typography sx={styles.sidebarHeading}>Categories</Typography>
          {availableCategories.map((data, index) => (
            <Box
              key={index}
              onClick={() => {
                setCurrentCategory(data);
                setPage(1);
                window.scrollTo({
                  top: 300,
                  behavior: "smooth",
                });
              }}
              sx={{
                ...styles.categoryLink,
                ...(data === currentCategory && styles.categoryLinkActive),
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                my: "0.5rem",
              }}
            >
              <Typography
                sx={{
                  ...styles.blogHeadingRecent,
                  width: "fit-content",
                  color: data === currentCategory ? "#fff" : "#313431",
                  fontWeight: data === currentCategory ? "bold" : "400",
                  "&:hover": {
                    color: data === currentCategory ? "#fff" : "#378C92",
                    fontWeight: "600",
                  },
                }}
              >
                {data}
              </Typography>
              {data === currentCategory && (
                <CloseIcon
                  onClick={(e) => {
                    window.scrollTo({
                      top: 300,
                      behavior: "smooth",
                    });
                    e.stopPropagation();
                    setCurrentCategory(null);
                    setSearchQuery("");
                  }}
                  sx={{
                    fontSize: "1.2rem",
                    color: "white",
                    cursor: "pointer",
                  }}
                />
              )}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default InsightCards;
