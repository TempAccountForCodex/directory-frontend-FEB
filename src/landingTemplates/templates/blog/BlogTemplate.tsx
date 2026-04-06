import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputBase,
  Stack,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import type { BlogPost } from "../../types/BusinessData";
import FadeIn from "../../blocks/FadeIn";

const LOCAL_DEMO_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "Everything you need to know about VAT for your business",
    description:
      "A practical breakdown of registrations, thresholds, and reporting habits that keep growing companies compliant.",
    content:
      "VAT becomes much easier to manage when registration timing, invoice structure, filing cadence, and internal ownership are clearly defined. This guide outlines the operating model finance teams use to reduce risk while keeping reporting fast and accurate.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
    category: "Business",
    publishedAt: "2026-03-05T09:00:00.000Z",
    author: "Indise. Editorial",
    slug: "vat-for-your-business",
  },
  {
    id: "blog-2",
    title: "What are the tax obligations for companies in their first year?",
    description:
      "The first 12 months set the tone for every filing, payroll, and bookkeeping decision that follows.",
    content:
      "New companies need clarity on filings, tax reserves, payroll setup, and entity-specific deadlines. Early structure prevents frantic catch-up work later and makes compliance far less expensive.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
    category: "Founders",
    publishedAt: "2026-03-03T09:00:00.000Z",
    author: "Rhea Morgan",
    slug: "first-year-tax-obligations",
  },
  {
    id: "blog-3",
    title: "Everything you need to know about VAT for your small business",
    description:
      "A tighter framework for founders who need to manage compliance without a large finance team.",
    content:
      "Small teams usually need a lean process: clean invoicing, recurring filing reminders, and one visible owner for tax operations. This article covers the minimum viable system that actually works.",
    image:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=1200&q=80",
    category: "Finance",
    publishedAt: "2026-02-28T09:00:00.000Z",
    author: "Sana Patel",
    slug: "vat-small-business",
  },
  {
    id: "blog-4",
    title:
      "2026 startup finance checklist for founders hiring their first team",
    description:
      "Cash controls, payroll planning, and tax hygiene before operating complexity compounds.",
    content:
      "The move from solo founder to employer changes how finance needs to run. Hiring adds payroll, benefits, approvals, expense policies, and more frequent reporting cycles.",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80",
    category: "Operations",
    publishedAt: "2026-02-23T09:00:00.000Z",
    author: "Indise. Editorial",
    slug: "startup-finance-checklist",
  },
  {
    id: "blog-5",
    title: "Quarterly bookkeeping habits that stop year-end panic",
    description:
      "A straightforward review rhythm for revenue, expenses, liabilities, and documentation quality.",
    content:
      "Teams that close cleanly each quarter spend less time fixing historical errors. This article covers reconciliations, missing receipts, cash visibility, and practical owner review rituals.",
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1200&q=80",
    category: "Accounting",
    publishedAt: "2026-02-18T09:00:00.000Z",
    author: "Milo Chen",
    slug: "bookkeeping-habits",
  },
  {
    id: "blog-6",
    title: "How finance teams prepare investor-ready reporting packs",
    description:
      "The metrics, narrative structure, and supporting detail that make updates useful instead of noisy.",
    content:
      "Investor reporting is mostly about discipline: consistent metrics, concise explanations, and a repeatable pack that can be updated without a scramble every month.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80",
    category: "Reports",
    publishedAt: "2026-02-14T09:00:00.000Z",
    author: "Nina Roberts",
    slug: "investor-reporting-packs",
  },
];

function getPosts(data: TemplateProps["data"]): BlogPost[] {
  return data.blogPosts && data.blogPosts.length > 0
    ? data.blogPosts
    : LOCAL_DEMO_POSTS;
}

function formatDate(date?: string) {
  if (!date) return "Recently";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getReadTime(post: BlogPost) {
  const text = `${post.description || ""} ${post.content || ""}`.trim();
  return `${Math.max(3, Math.ceil(text.split(/\s+/).filter(Boolean).length / 55))} min read`;
}

const PremiumBlogTemplate: React.FC<TemplateProps> = ({ data }) => {
  const posts = useMemo(() => getPosts(data), [data]);
  const primary = data.primaryColor || "#4ade80";
  const brandName = data.name || "indise.";
  const brandTitle = brandName.replace(/\.$/, "");
  const heroPost = posts[0];
  const gridPosts = posts.slice(1, 5);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#ffffff",
        color: "#111111",
        fontFamily: '"Barlow", sans-serif',
      }}
    >
      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2, md: 3 },
          py: { xs: 2, md: 3 },
        }}
      >
        <FadeIn>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
              py: 1.5,
              borderBottom: "1px solid rgba(17,17,17,0.08)",
            }}
          >
            <Typography
              sx={{ fontSize: { xs: "1.6rem", md: "1.8rem" }, fontWeight: 800 }}
            >
              {brandTitle}
              <Box component="span" sx={{ color: primary }}>
                .
              </Box>
            </Typography>

            <Stack
              direction="row"
              spacing={3}
              sx={{
                display: { xs: "none", md: "flex" },
                color: "rgba(17,17,17,0.68)",
              }}
            >
              {[
                ["Home", "blog-home"],
                ["Articles", "blog-articles"],
                ["Subscribe", "blog-contact"],
              ].map(([label, id]) => (
                <Typography
                  key={label}
                  onClick={() => scrollToSection(id)}
                  sx={{ cursor: "pointer", fontSize: "0.95rem" }}
                >
                  {label}
                </Typography>
              ))}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                onClick={() => scrollToSection("blog-contact")}
                sx={{
                  borderRadius: "999px",
                  bgcolor: "#111111",
                  color: "#fff",
                  px: 2.2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#111111" },
                }}
              >
                Subscribe
              </Button>
            </Stack>
          </Box>
        </FadeIn>

        <Box
          id="blog-home"
          sx={{
            py: { xs: 4, md: 5 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 3,
            alignItems: "center",
          }}
        >
          <Box>
            <FadeIn>
              <Chip
                label={heroPost?.category || "Business"}
                sx={{ bgcolor: "#eaf7ec", color: "#1f5a2a", fontWeight: 700 }}
              />
            </FadeIn>
            <FadeIn delay={0.08}>
              <Typography
                sx={{
                  mt: 2,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                  fontWeight: 800,
                  lineHeight: 0.95,
                  letterSpacing: "-0.04em",
                  maxWidth: 520,
                }}
              >
                {heroPost?.title}
              </Typography>
            </FadeIn>
            <FadeIn delay={0.16}>
              <Typography
                sx={{
                  mt: 2,
                  color: "rgba(17,17,17,0.68)",
                  lineHeight: 1.8,
                  maxWidth: 520,
                }}
              >
                {heroPost?.description || data.tagline}
              </Typography>
            </FadeIn>
            <FadeIn delay={0.24}>
              <Stack
                direction="row"
                spacing={1.2}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 2.5 }}
              >
                <Chip
                  label={formatDate(heroPost?.publishedAt)}
                  variant="outlined"
                />
                <Chip
                  label={getReadTime(heroPost || posts[0])}
                  variant="outlined"
                />
              </Stack>
            </FadeIn>
            <FadeIn delay={0.32}>
              <Button
                onClick={() => heroPost && setSelectedPost(heroPost)}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  mt: 2.5,
                  borderRadius: "999px",
                  bgcolor: "#111111",
                  color: "#fff",
                  px: 2.2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#111111" },
                }}
              >
                Read article
              </Button>
            </FadeIn>
          </Box>

          <FadeIn delay={0.12} direction="left">
            <Box
              onClick={() => heroPost && setSelectedPost(heroPost)}
              sx={{
                minHeight: { xs: 280, md: 420 },
                borderRadius: 4,
                cursor: "pointer",
                backgroundImage: `url(${heroPost?.image || ""})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
          </FadeIn>
        </Box>

        <Box id="blog-articles" sx={{ pb: { xs: 4, md: 5 } }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            gap={1.5}
          >
            <Typography
              sx={{ fontSize: { xs: "1.9rem", md: "2.4rem" }, fontWeight: 800 }}
            >
              Latest articles
            </Typography>
            <Typography
              sx={{ color: "rgba(17,17,17,0.6)", fontSize: "0.95rem" }}
            >
              Minimal editorial layout
            </Typography>
          </Stack>

          <Box
            sx={{
              mt: 2.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            {gridPosts.map((post, index) => (
              <FadeIn
                key={post.id}
                delay={0.06 * index}
                direction={index % 2 === 0 ? "up" : "left"}
              >
                <Box
                  onClick={() => setSelectedPost(post)}
                  sx={{
                    bgcolor: "#fff",
                    border: "1px solid rgba(17,17,17,0.08)",
                    borderRadius: 4,
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <Box
                    component="img"
                    src={post.image}
                    alt={post.title}
                    sx={{
                      width: "100%",
                      height: 220,
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  <Box sx={{ p: 2.2 }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mb: 1.2 }}
                    >
                      <Chip
                        label={post.category || "Article"}
                        size="small"
                        sx={{ bgcolor: "#f3f3f3" }}
                      />
                      <Typography
                        sx={{
                          fontSize: "0.82rem",
                          color: "rgba(17,17,17,0.55)",
                          alignSelf: "center",
                        }}
                      >
                        {formatDate(post.publishedAt)}
                      </Typography>
                    </Stack>
                    <Typography
                      sx={{
                        fontSize: "1.35rem",
                        fontWeight: 700,
                        lineHeight: 1.12,
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 1,
                        color: "rgba(17,17,17,0.68)",
                        lineHeight: 1.75,
                      }}
                    >
                      {post.description}
                    </Typography>
                  </Box>
                </Box>
              </FadeIn>
            ))}
          </Box>
        </Box>

        <Box
          id="blog-contact"
          sx={{
            borderTop: "1px solid rgba(17,17,17,0.08)",
            pt: 3,
            pb: 2,
          }}
        >
          <FadeIn>
            <Typography
              sx={{ fontSize: { xs: "1.5rem", md: "1.8rem" }, fontWeight: 800 }}
            >
              Subscribe for updates
            </Typography>
          </FadeIn>
          <FadeIn delay={0.08}>
            <Box
              sx={{
                mt: 1.6,
                maxWidth: 420,
                display: "flex",
                alignItems: "center",
                gap: 1,
                border: "1px solid rgba(17,17,17,0.12)",
                borderRadius: "999px",
                p: 0.5,
                bgcolor: "#fff",
              }}
            >
              <InputBase
                placeholder="Enter your email"
                sx={{ flex: 1, px: 1.5 }}
              />
              <Button
                sx={{
                  borderRadius: "999px",
                  bgcolor: "#111111",
                  color: "#fff",
                  px: 2,
                  textTransform: "none",
                  "&:hover": { bgcolor: "#111111" },
                }}
              >
                Subscribe
              </Button>
            </Box>
          </FadeIn>
        </Box>

        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px solid rgba(17,17,17,0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 1.5,
          }}
        >
          <Typography sx={{ color: "rgba(17,17,17,0.6)", fontSize: "0.9rem" }}>
            © 2026 {brandName.toUpperCase()}
          </Typography>
          <Stack direction="row" spacing={1}>
            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, index) => (
              <Box
                key={index}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  border: "1px solid rgba(17,17,17,0.12)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Icon size={14} />
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      <Dialog
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        fullWidth
        maxWidth="md"
        PaperProps={{ sx: { borderRadius: 4, overflow: "hidden" } }}
      >
        {selectedPost ? (
          <>
            <Box sx={{ position: "relative" }}>
              <Box
                component="img"
                src={selectedPost.image}
                alt={selectedPost.title}
                sx={{
                  width: "100%",
                  height: { xs: 240, md: 320 },
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <IconButton
                onClick={() => setSelectedPost(null)}
                sx={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  bgcolor: "rgba(255,255,255,0.92)",
                  "&:hover": { bgcolor: "#fff" },
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label={selectedPost.category || "Editorial"} />
                <Chip
                  label={formatDate(selectedPost.publishedAt)}
                  variant="outlined"
                />
                <Chip
                  label={selectedPost.author || "Editorial Desk"}
                  variant="outlined"
                />
              </Stack>
              <Typography
                sx={{
                  mt: 2,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  fontWeight: 800,
                  lineHeight: 0.98,
                }}
              >
                {selectedPost.title}
              </Typography>
              <Typography
                sx={{ mt: 1.4, color: "rgba(17,17,17,0.68)", lineHeight: 1.8 }}
              >
                {selectedPost.description}
              </Typography>
              <Divider sx={{ my: 2.2 }} />
              <Typography sx={{ lineHeight: 1.9 }}>
                {selectedPost.content}
              </Typography>
            </DialogContent>
          </>
        ) : null}
      </Dialog>
    </Box>
  );
};

export default PremiumBlogTemplate;
