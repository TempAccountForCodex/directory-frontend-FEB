import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  InputBase,
  CircularProgress,
  Pagination,
  Stack,
  Avatar,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import axios from "axios";
import { TemplateProps } from "../../templateEngine/types";
import FadeIn from "../../blocks/FadeIn";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5001";

interface InsightItem {
  id: string;
  title?: string;
  heading?: string;
  content?: string;
  description?: string;
  image?: string;
  category?: string;
  publishedAt?: string;
  publishDate?: string;
  author?: { name: string } | string;
  slug?: string;
  legacyId?: string;
}

function getImageUrl(imagePath?: string): string {
  if (!imagePath) return "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800";
  if (imagePath.startsWith("http")) return imagePath;
  if (imagePath.startsWith("/assets")) return imagePath;
  return `${BASE_URL}${imagePath}`;
}

function normalizePost(item: InsightItem) {
  return {
    ...item,
    title: item.title || item.heading || "Untitled",
    content: item.content || item.description || "",
    publishedAt: item.publishedAt || item.publishDate || new Date().toISOString(),
  };
}

function formatDate(d?: string) {
  if (!d) return "";
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function getAuthorName(author?: { name: string } | string): string {
  if (!author) return "";
  if (typeof author === "string") return author;
  return author.name;
}

const BlogTemplate: React.FC<TemplateProps> = ({ data }) => {
  const primary = data.primaryColor || "#378C92";

  const [posts, setPosts] = useState<ReturnType<typeof normalizePost>[]>([]);
  const [featured, setFeatured] = useState<ReturnType<typeof normalizePost> | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const LIMIT = 6;

  useEffect(() => {
    axios.get(`${API_URL}/insights/categories`)
      .then((r) => setCategories(r.data.categories || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: LIMIT, sortBy: "publishedAt", sortOrder: "desc" };
    if (activeCategory) params.category = activeCategory;
    if (search) params.search = search;
    axios.get(`${API_URL}/insights/public`, { params })
      .then((r) => {
        const items = (r.data.insights || r.data.blogs || []).map(normalizePost);
        setPosts(items);
        setTotalPages(r.data.pagination?.totalPages || 1);
        if (page === 1 && !activeCategory && !search && items.length > 0) setFeatured(items[0]);
      })
      .catch(() => {
        // Use blogPosts from data as fallback
        const fallback = (data.blogPosts || []).map((p) => ({
          id: p.id,
          title: p.title,
          content: p.description || "",
          image: p.image,
          category: p.category,
          publishedAt: p.publishedAt || new Date().toISOString(),
          author: p.author,
          slug: p.slug,
        }));
        setPosts(fallback);
        if (fallback.length > 0 && page === 1) setFeatured(fallback[0]);
      })
      .finally(() => setLoading(false));
  }, [page, activeCategory, search, data.blogPosts]);

  return (
    <Box sx={{ fontFamily: "'Inter', -apple-system, sans-serif", bgcolor: "#fff", minHeight: "100vh" }}>
      {/* Header */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "#fff",
          borderBottom: "1px solid #ebebeb",
          px: { xs: 3, md: 6 },
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: primary, flexGrow: 1 }}>
          {data.name}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            border: "1px solid #e2e8f0",
            borderRadius: 999,
            px: 2,
            py: 0.5,
            gap: 1,
            maxWidth: 280,
            width: "100%",
          }}
        >
          <SearchIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
          <InputBase
            placeholder="Search articles…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            sx={{ fontSize: "0.875rem", flex: 1 }}
          />
        </Box>
      </Box>

      {/* Hero — Featured Post */}
      {featured && page === 1 && !activeCategory && !search && (
        <FadeIn>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              maxWidth: 1200,
              mx: "auto",
              mt: 6,
              px: { xs: 3, md: 6 },
              gap: 6,
              alignItems: "center",
              mb: 8,
            }}
          >
            <Box>
              {featured.category && (
                <Chip
                  label={featured.category}
                  size="small"
                  sx={{ bgcolor: primary, color: "#fff", fontWeight: 700, mb: 2 }}
                />
              )}
              <Typography
                variant="h2"
                sx={{ fontWeight: 800, fontSize: { xs: "1.75rem", md: "2.5rem" }, lineHeight: 1.2, color: "#111", mb: 2 }}
              >
                {featured.title}
              </Typography>
              <Typography sx={{ color: "#555", lineHeight: 1.75, mb: 3 }}>
                {featured.content?.slice(0, 180)}{featured.content && featured.content.length > 180 ? "…" : ""}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: primary, fontSize: "0.8rem" }}>
                  {getAuthorName(featured.author as any)?.[0] || "A"}
                </Avatar>
                <Box>
                  {getAuthorName(featured.author as any) && (
                    <Typography variant="caption" sx={{ fontWeight: 700, color: "#333", display: "block" }}>
                      {getAuthorName(featured.author as any)}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ color: "#888", display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarTodayIcon sx={{ fontSize: 12 }} />
                    {formatDate(featured.publishedAt)}
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                height: { xs: 240, md: 380 },
              }}
            >
              <Box
                component="img"
                src={getImageUrl(featured.image)}
                alt={featured.title}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          </Box>
        </FadeIn>
      )}

      {/* Category filters */}
      {categories.length > 0 && (
        <Box sx={{ px: { xs: 3, md: 6 }, maxWidth: 1200, mx: "auto", mb: 5 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
              label="All"
              onClick={() => { setActiveCategory(null); setPage(1); }}
              sx={{
                bgcolor: !activeCategory ? primary : "#f3f4f6",
                color: !activeCategory ? "#fff" : "#555",
                fontWeight: !activeCategory ? 700 : 400,
                cursor: "pointer",
              }}
            />
            {categories.map((c) => (
              <Chip
                key={c}
                label={c}
                onClick={() => { setActiveCategory(c); setPage(1); }}
                sx={{
                  bgcolor: activeCategory === c ? primary : "#f3f4f6",
                  color: activeCategory === c ? "#fff" : "#555",
                  fontWeight: activeCategory === c ? 700 : 400,
                  cursor: "pointer",
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* Articles grid */}
      <Box sx={{ px: { xs: 3, md: 6 }, maxWidth: 1200, mx: "auto", pb: 12 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 12 }}>
            <CircularProgress sx={{ color: primary }} />
          </Box>
        ) : posts.length === 0 ? (
          <Typography sx={{ textAlign: "center", color: "#888", py: 12 }}>No articles found.</Typography>
        ) : (
          <>
            <Grid container spacing={4}>
              {posts.map((post, i) => (
                <Grid item xs={12} sm={6} md={4} key={post.id || i}>
                  <FadeIn delay={i * 0.06}>
                    <Box
                      sx={{
                        borderRadius: 3,
                        overflow: "hidden",
                        border: "1px solid #ebebeb",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        cursor: "pointer",
                        transition: "box-shadow 0.25s, transform 0.25s",
                        "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.1)", transform: "translateY(-4px)" },
                      }}
                    >
                      <Box sx={{ height: 200, overflow: "hidden" }}>
                        <Box
                          component="img"
                          src={getImageUrl(post.image)}
                          alt={post.title}
                          sx={{
                            width: "100%", height: "100%", objectFit: "cover",
                            transition: "transform 0.4s",
                            "&:hover": { transform: "scale(1.05)" },
                          }}
                        />
                      </Box>
                      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                          {post.category && (
                            <Chip label={post.category} size="small" sx={{ bgcolor: `${primary}18`, color: primary, fontWeight: 600, fontSize: "0.7rem" }} />
                          )}
                          <Typography variant="caption" sx={{ color: "#888", display: "flex", alignItems: "center", gap: 0.5 }}>
                            <CalendarTodayIcon sx={{ fontSize: 11 }} />
                            {formatDate(post.publishedAt)}
                          </Typography>
                        </Box>
                        <Typography
                          sx={{
                            fontWeight: 700, fontSize: "1rem", color: "#111", lineHeight: 1.4,
                            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                            mb: 1,
                          }}
                        >
                          {post.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#666", lineHeight: 1.65, flex: 1,
                            display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden",
                          }}
                        >
                          {post.content}
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 2, color: primary, fontWeight: 600, fontSize: "0.85rem" }}>
                          Read More <ArrowForwardIcon sx={{ fontSize: 14 }} />
                        </Box>
                      </Box>
                    </Box>
                  </FadeIn>
                </Grid>
              ))}
            </Grid>
            {totalPages > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 8 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, v) => setPage(v)}
                  shape="rounded"
                  sx={{
                    "& .MuiPaginationItem-root.Mui-selected": { bgcolor: primary, color: "#fff" },
                  }}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#111", py: 6, px: 3, textAlign: "center" }}>
        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "#fff", mb: 1 }}>{data.name}</Typography>
        {data.tagline && <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.5)", mb: 3 }}>{data.tagline}</Typography>}
        {data.socialLinks && (
          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
            {data.socialLinks.twitter && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.5)" }}><Twitter size={16} /></IconButton>}
            {data.socialLinks.instagram && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.5)" }}><Instagram size={16} /></IconButton>}
            {data.socialLinks.linkedin && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.5)" }}><Linkedin size={16} /></IconButton>}
            {data.socialLinks.facebook && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.5)" }}><Facebook size={16} /></IconButton>}
          </Stack>
        )}
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>
          © {new Date().getFullYear()} {data.name}
        </Typography>
      </Box>
    </Box>
  );
};

export default BlogTemplate;
