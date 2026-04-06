import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputBase,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import CloseIcon from "@mui/icons-material/Close";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import type { BlogPost } from "../../types/BusinessData";
import FadeIn from "../../blocks/FadeIn";

const LOCAL_DEMO_POSTS: BlogPost[] = [
  {
    id: "blog-1",
    title: "How Soil Health Planning Creates More Resilient Harvest Cycles",
    description:
      "A practical framework for improving crop consistency through better planning, monitoring, and regenerative field decisions.",
    content:
      "Healthy soil strategy is one of the strongest predictors of consistent agricultural output. This article explores monitoring, crop rotation support, nutrient discipline, and how seasonal planning decisions affect long-term resilience.",
    image:
      "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80",
    category: "Soil Health",
    publishedAt: "2026-02-24T09:00:00.000Z",
    author: "Agro Insight Team",
    slug: "soil-health-planning-harvest-cycles",
  },
  {
    id: "blog-2",
    title: "Delivery Windows and Field Operations: What Teams Need to Track",
    description:
      "A cleaner operating model for scheduling field work, equipment availability, and supplier coordination.",
    content:
      "Operational predictability improves when delivery schedules and field tasks are treated as one system. This guide explains the checkpoints teams should use to reduce missed windows and unnecessary idle time.",
    image:
      "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    category: "Operations",
    publishedAt: "2026-02-17T09:00:00.000Z",
    author: "Mariam Yusuf",
    slug: "delivery-windows-field-operations",
  },
  {
    id: "blog-3",
    title: "Seedling Quality Control Before Planting Season Scales",
    description:
      "What experienced growers check before expanding planting volume across multiple zones.",
    content:
      "Seedling readiness affects later yield far more than most teams account for. This article covers staging, inspection, handling, and the early signals that help teams intervene before losses compound.",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?auto=format&fit=crop&w=1200&q=80",
    category: "Crop Planning",
    publishedAt: "2026-02-09T09:00:00.000Z",
    author: "Ayaan Rehman",
    slug: "seedling-quality-control",
  },
  {
    id: "blog-4",
    title: "What Modern Farm Visibility Looks Like for High-Trust Brands",
    description:
      "From product presentation to educational content, trust now begins before the first inquiry.",
    content:
      "Modern agriculture brands need visibility that feels credible and easy to understand. This piece explains how content, imagery, and clear storytelling improve market trust and buying confidence.",
    image:
      "https://images.unsplash.com/photo-1523741543316-beb7fc7023d8?auto=format&fit=crop&w=1200&q=80",
    category: "Brand Growth",
    publishedAt: "2026-02-03T09:00:00.000Z",
    author: "Agro Insight Team",
    slug: "modern-farm-visibility",
  },
  {
    id: "blog-5",
    title: "Equipment Readiness Checklists for Faster Seasonal Turnarounds",
    description:
      "A compact maintenance checklist that helps field teams reduce preventable downtime.",
    content:
      "Small readiness gaps often become expensive interruptions during peak weeks. This article outlines inspection routines, scheduling practices, and simple reporting habits that improve reliability.",
    image:
      "https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=1200&q=80",
    category: "Equipment",
    publishedAt: "2026-01-28T09:00:00.000Z",
    author: "Hassan Noor",
    slug: "equipment-readiness-checklists",
  },
  {
    id: "blog-6",
    title: "How Smarter Water Planning Supports Better Field Performance",
    description:
      "An overview of irrigation discipline, seasonal forecasting, and practical monitoring systems.",
    content:
      "Water planning works best when operational discipline and environmental forecasting are connected. This article explores the routines teams use to improve consistency while reducing waste.",
    image:
      "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    category: "Irrigation",
    publishedAt: "2026-01-19T09:00:00.000Z",
    author: "Agro Insight Team",
    slug: "smarter-water-planning",
  },
];

const FAQ_ITEMS = [
  {
    title: "Suppliers Mapping",
    body: "We document supply dependencies, seasonal risk, and sourcing continuity so teams can plan with clearer operational confidence. Mapping suppliers this way reduces late surprises and improves margin protection.",
  },
  {
    title: "Risk Assessment",
    body: "Risk assessment should combine field conditions, supplier timing, and labor constraints. When those signals are tracked together, leadership can act earlier and allocate resources with less friction.",
  },
  {
    title: "Who is companies be impacted by EUDR?",
    body: "Any company with sourcing, traceability, or supply chain exposure to regulated categories should review its obligations early. The real issue is not only compliance, but operational readiness.",
  },
  {
    title: "Can small companies there for non-penalties?",
    body: "Smaller teams still benefit from structured preparation. Even when enforcement pressure differs, having basic documentation and internal clarity reduces business risk and improves buyer confidence.",
  },
];

function getPosts(data: TemplateProps["data"]): BlogPost[] {
  if (data.blogPosts && data.blogPosts.length > 0) {
    return data.blogPosts;
  }
  return LOCAL_DEMO_POSTS;
}

function formatDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const BlogTemplate: React.FC<TemplateProps> = ({ data }) => {
  const primary = data.primaryColor || "#8DC63F";
  const secondary = data.secondaryColor || "#d9e9b5";
  const posts = useMemo(() => getPosts(data), [data]);
  const heroPosts = posts.slice(0, 3);
  const featuredPost = heroPosts[0];
  const trendingPosts = posts.slice(1, 7);
  const [expanded, setExpanded] = useState<string>("panel-0");
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const activeHeroPost = heroPosts[activeHeroIndex] || featuredPost;
  const logoUrl =
    data.logoUrl || "https://cdn-icons-png.flaticon.com/512/2909/2909762.png";

  useEffect(() => {
    if (heroPosts.length <= 1) return;
    const intervalId = window.setInterval(() => {
      setActiveHeroIndex((current) => (current + 1) % heroPosts.length);
    }, 3500);
    return () => window.clearInterval(intervalId);
  }, [heroPosts.length]);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f4f5ef",
        color: "#161616",
        fontFamily: "'Inter', sans-serif",
        scrollBehavior: "smooth",
      }}
    >
      <Box
        sx={{
          maxWidth: 1180,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pt: { xs: 3, md: 5 },
          pb: { xs: 7, md: 9 },
        }}
      >
        <FadeIn>
          <Box
            sx={{
              borderRadius: 999,
              border: "1px solid rgba(17,24,39,0.08)",
              bgcolor: "rgba(255,255,255,0.92)",
              px: { xs: 2, md: 3 },
              py: 1.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              boxShadow: "0 10px 28px rgba(16,24,40,0.05)",
              mb: { xs: 5, md: 7 },
            }}
          >
            <Stack direction="row" spacing={1.1} alignItems="center">
              <Box
                component="img"
                src={logoUrl}
                alt={`${data.name || "Agrob"} logo`}
                sx={{
                  width: 36,
                  height: 36,
                  objectFit: "contain",
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontSize: { xs: "1.2rem", md: "1.6rem" },
                  fontWeight: 900,
                  color: primary,
                }}
              >
                {data.name || "Agrob"}
              </Typography>
            </Stack>

            <Stack
              direction="row"
              spacing={3.5}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {[
                { label: "Home", id: "blog-home" },
                { label: "About", id: "blog-about" },
                { label: "Blog", id: "blog-list" },
                { label: "Contact", id: "blog-contact" },
              ].map((item) => (
                <Typography
                  key={item.label}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    fontSize: "0.92rem",
                    color: "#4b5563",
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            <Button
              variant="contained"
              onClick={() => scrollToSection("blog-contact")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                borderRadius: 999,
                bgcolor: primary,
                color: "#fff",
                px: 2.2,
                py: 1,
                boxShadow: "none",
                "&:hover": {
                  bgcolor: primary,
                  opacity: 0.92,
                  boxShadow: "none",
                },
              }}
            >
              Contact
            </Button>
          </Box>
        </FadeIn>

        <FadeIn delay={0.05}>
          <Box
            id="blog-home"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
              gap: { xs: 2.5, md: 5 },
              alignItems: "start",
              mb: { xs: 4, md: 5 },
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "2.5rem", md: "4.2rem" },
                lineHeight: 1.04,
                fontWeight: 800,
                letterSpacing: "-0.04em",
                maxWidth: 560,
              }}
            >
              Sustainable Future
              <br />
              Insights
            </Typography>

            <Box sx={{ maxWidth: 460, pt: { xs: 0, md: 1.2 } }}>
              <Typography
                sx={{
                  color: "#667085",
                  lineHeight: 1.8,
                  fontSize: { xs: "1rem", md: "1.04rem" },
                  mb: 2,
                }}
              >
                {data.description ||
                  "We share common trends and strategies for improving your operation, making sure demand, efficiency, and visibility move together."}
              </Typography>
              <Stack
                direction="row"
                spacing={1.2}
                alignItems="center"
                onClick={() =>
                  activeHeroPost && setSelectedPost(activeHeroPost)
                }
                sx={{ cursor: "pointer", width: "fit-content" }}
              >
                <Typography sx={{ color: primary, fontWeight: 700 }}>
                  Learn More
                </Typography>
                <ArrowForwardIcon sx={{ color: primary, fontSize: 18 }} />
              </Stack>
            </Box>
          </Box>
        </FadeIn>

        {activeHeroPost && (
          <FadeIn delay={0.08}>
            <Box sx={{ mb: { xs: 1.5, md: 2.5 } }}>
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid rgba(17,24,39,0.08)",
                  boxShadow: "0 14px 36px rgba(15,23,42,0.06)",
                  position: "relative",
                }}
              >
                <Box
                  component="img"
                  src={activeHeroPost.image}
                  alt={activeHeroPost.title}
                  sx={{
                    width: "100%",
                    height: { xs: 280, md: 520 },
                    objectFit: "cover",
                    display: "block",
                    transition: "opacity 0.35s ease",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: { xs: 18, md: 28 },
                    right: { xs: 18, md: 28 },
                    bottom: { xs: 18, md: 28 },
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "end",
                    gap: 2,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ maxWidth: 640 }}>
                    <Chip
                      label={activeHeroPost.category || "Featured"}
                      size="small"
                      sx={{
                        mb: 1.2,
                        bgcolor: "rgba(255,255,255,0.9)",
                        color: "#111827",
                        fontWeight: 700,
                      }}
                    />
                    <Typography
                      sx={{
                        color: "#fff",
                        fontWeight: 800,
                        lineHeight: 1.05,
                        fontSize: { xs: "1.4rem", md: "2.3rem" },
                        textShadow: "0 8px 28px rgba(0,0,0,0.35)",
                        mb: 0.8,
                      }}
                    >
                      {activeHeroPost.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.88)",
                        maxWidth: 580,
                        lineHeight: 1.7,
                        textShadow: "0 6px 18px rgba(0,0,0,0.25)",
                      }}
                    >
                      {activeHeroPost.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={() => setSelectedPost(activeHeroPost)}
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      borderRadius: 999,
                      bgcolor: primary,
                      color: "#fff",
                      px: 2.2,
                      py: 1.05,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: primary,
                        opacity: 0.92,
                        boxShadow: "none",
                      },
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </Box>

              <Stack
                direction="row"
                spacing={1.1}
                justifyContent="center"
                sx={{ pt: 2.2 }}
              >
                {heroPosts.map((_, item) => (
                  <Box
                    key={item}
                    onClick={() => setActiveHeroIndex(item)}
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      bgcolor: item === activeHeroIndex ? primary : "#d8d8d8",
                      cursor: "pointer",
                      transition:
                        "transform 0.2s ease, background-color 0.2s ease",
                      transform:
                        item === activeHeroIndex ? "scale(1.08)" : "scale(1)",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </FadeIn>
        )}

        <FadeIn delay={0.12}>
          <Box id="blog-list" sx={{ pt: { xs: 4, md: 6 } }}>
            <Typography
              sx={{
                fontSize: { xs: "2rem", md: "3rem" },
                fontWeight: 800,
                mb: 1.2,
              }}
            >
              Our Trending Article
            </Typography>
            <Typography
              sx={{ maxWidth: 760, color: "#6b7280", lineHeight: 1.8, mb: 4 }}
            >
              Common trends, operational signals, and field insights designed
              for teams that want stronger planning and clearer visibility
              across the season.
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 3,
              }}
            >
              {trendingPosts.map((post, index) => (
                <FadeIn key={post.id || index} delay={0.04 * index}>
                  <Box>
                    <Box
                      sx={{
                        borderRadius: 3,
                        overflow: "hidden",
                        mb: 1.6,
                        boxShadow: "0 12px 28px rgba(15,23,42,0.05)",
                      }}
                    >
                      <Box
                        component="img"
                        src={post.image}
                        alt={post.title}
                        sx={{
                          width: "100%",
                          height: 230,
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </Box>
                    <Chip
                      label={post.category || "Article"}
                      size="small"
                      sx={{
                        mb: 1.2,
                        bgcolor: secondary,
                        color: "#334155",
                        fontWeight: 700,
                      }}
                    />
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1.28rem",
                        lineHeight: 1.25,
                        mb: 1.1,
                      }}
                    >
                      {post.title}
                    </Typography>
                    <Typography
                      sx={{
                        color: "#6b7280",
                        lineHeight: 1.75,
                        fontSize: "0.95rem",
                        mb: 1.5,
                      }}
                    >
                      {post.description}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        onClick={() => setSelectedPost(post)}
                        sx={{
                          color: "#4b5563",
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Learn more
                      </Typography>
                      <Box
                        onClick={() => setSelectedPost(post)}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          bgcolor: primary,
                          color: "#fff",
                          display: "grid",
                          placeItems: "center",
                          cursor: "pointer",
                        }}
                      >
                        <ArrowForwardIcon sx={{ fontSize: 15 }} />
                      </Box>
                    </Stack>
                  </Box>
                </FadeIn>
              ))}
            </Box>
          </Box>
        </FadeIn>

        <FadeIn delay={0.18}>
          <Box
            id="blog-about"
            sx={{
              pt: { xs: 7, md: 10 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 0.9fr" },
              gap: { xs: 4, md: 6 },
              alignItems: "start",
            }}
          >
            <Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
                  gap: 3,
                  mb: 4,
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "2.1rem", md: "3.2rem" },
                    lineHeight: 1.08,
                    fontWeight: 800,
                  }}
                >
                  Have a question?
                  <br />
                  We are here to answer.
                </Typography>
                <Typography
                  sx={{
                    color: "#667085",
                    lineHeight: 1.8,
                    pt: { xs: 0, md: 1 },
                  }}
                >
                  We share common trends and strategies for improving your
                  rental making sure in high demand of service unique.
                </Typography>
              </Box>

              {FAQ_ITEMS.map((item, index) => {
                const panelId = `panel-${index}`;
                const isExpanded = expanded === panelId;
                return (
                  <Accordion
                    key={item.title}
                    expanded={isExpanded}
                    onChange={(_, open) => setExpanded(open ? panelId : "")}
                    disableGutters
                    elevation={0}
                    sx={{
                      bgcolor: "transparent",
                      borderTop: "1px solid rgba(17,24,39,0.12)",
                      "&:before": { display: "none" },
                    }}
                  >
                    <AccordionSummary
                      expandIcon={isExpanded ? <RemoveIcon /> : <AddIcon />}
                      sx={{
                        px: 0,
                        minHeight: 68,
                        "& .MuiAccordionSummary-content": {
                          my: 1.5,
                        },
                        "& .MuiAccordionSummary-expandIconWrapper": {
                          color: "#111827",
                        },
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: { xs: "1.1rem", md: "1.3rem" },
                          fontWeight: 700,
                        }}
                      >
                        {item.title}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                      sx={{ px: 0, pb: 2.6, color: "#6b7280", lineHeight: 1.9 }}
                    >
                      {item.body}
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>

            <Box sx={{ pt: { xs: 0, md: 7 } }}>
              <Box
                sx={{
                  borderRadius: 4,
                  overflow: "hidden",
                  boxShadow: "0 16px 38px rgba(15,23,42,0.08)",
                  mb: 3,
                }}
              >
                <Box
                  component="img"
                  src={posts[2]?.image || featuredPost?.image}
                  alt={
                    posts[2]?.title || featuredPost?.title || "Featured article"
                  }
                  sx={{
                    width: "100%",
                    height: 220,
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>

              <Box
                sx={{
                  borderRadius: 4,
                  bgcolor: "#fff",
                  border: "1px solid rgba(17,24,39,0.08)",
                  p: 3,
                }}
              >
                <Typography sx={{ color: primary, fontWeight: 800, mb: 1 }}>
                  Newsletter
                </Typography>
                <Typography
                  sx={{ fontWeight: 700, fontSize: "1.25rem", mb: 1.2 }}
                >
                  Get field insights in your inbox.
                </Typography>
                <Typography
                  sx={{ color: "#6b7280", lineHeight: 1.75, mb: 2.2 }}
                >
                  Weekly notes on crop planning, operational discipline, and
                  better agricultural visibility.
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.2,
                    borderRadius: 999,
                    border: "1px solid rgba(17,24,39,0.1)",
                    bgcolor: "#f8fafc",
                    px: 2,
                    py: 0.8,
                  }}
                >
                  <MailOutlineIcon sx={{ color: "#94a3b8" }} />
                  <InputBase
                    placeholder="Enter your email here"
                    sx={{
                      flex: 1,
                      color: "#111827",
                      "& input::placeholder": {
                        color: "#94a3b8",
                        opacity: 1,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      bgcolor: primary,
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </FadeIn>

        <Box
          id="blog-contact"
          sx={{
            pt: { xs: 7, md: 10 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
            gap: { xs: 3, md: 4 },
            alignItems: "stretch",
          }}
        >
          <FadeIn delay={0.22}>
            <Box
              sx={{
                borderRadius: 4,
                bgcolor: primary,
                color: "#fff",
                p: { xs: 3, md: 4 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 420,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: { xs: "2rem", md: "2.6rem" },
                    fontWeight: 800,
                    lineHeight: 1.08,
                    mb: 1.5,
                  }}
                >
                  Contact Us
                </Typography>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.86)",
                    lineHeight: 1.8,
                    mb: 3,
                  }}
                >
                  Reach out for partnership questions, blog collaborations, or
                  agriculture growth strategy discussions.
                </Typography>
              </Box>
              <Stack spacing={1.5}>
                <Typography sx={{ fontWeight: 700 }}>
                  {data.contact.phone || "(555) 980-2400"}
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.9)" }}>
                  {data.contact.email || "hello@agrob.com"}
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.9)", maxWidth: 260 }}
                >
                  {data.contact.address || "55 Oak Street, Portland, OR 97201"}
                </Typography>
              </Stack>
            </Box>
          </FadeIn>

          <FadeIn delay={0.3} direction="left">
            <Box
              sx={{
                borderRadius: 4,
                bgcolor: "#fff",
                border: "1px solid rgba(17,24,39,0.08)",
                p: { xs: 3, md: 4 },
                boxShadow: "0 16px 38px rgba(15,23,42,0.06)",
              }}
            >
              <Typography
                sx={{ fontSize: "1.35rem", fontWeight: 700, mb: 2.2 }}
              >
                Send us a message
              </Typography>
              <Stack spacing={2}>
                <TextField
                  placeholder="Your name"
                  variant="standard"
                  fullWidth
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderBottom: "1px solid #d0d5dd",
                      pb: 1,
                    },
                  }}
                />
                <TextField
                  placeholder="Email address"
                  variant="standard"
                  fullWidth
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderBottom: "1px solid #d0d5dd",
                      pb: 1,
                    },
                  }}
                />
                <TextField
                  placeholder="Subject"
                  variant="standard"
                  fullWidth
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderBottom: "1px solid #d0d5dd",
                      pb: 1,
                    },
                  }}
                />
                <TextField
                  placeholder="Tell us about your inquiry"
                  variant="standard"
                  fullWidth
                  multiline
                  minRows={5}
                  InputProps={{ disableUnderline: true }}
                  sx={{
                    "& .MuiInputBase-root": {
                      borderBottom: "1px solid #d0d5dd",
                      pb: 1,
                    },
                  }}
                />
                <Button
                  variant="contained"
                  sx={{
                    mt: 1,
                    alignSelf: "flex-start",
                    borderRadius: 999,
                    bgcolor: primary,
                    color: "#fff",
                    px: 3,
                    py: 1.15,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: primary,
                      opacity: 0.92,
                      boxShadow: "none",
                    },
                  }}
                >
                  Send Message
                </Button>
              </Stack>
            </Box>
          </FadeIn>
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#171f2d", color: "#fff", mt: { xs: 1, md: 3 } }}>
        <Box
          sx={{
            maxWidth: 1180,
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: { xs: 5, md: 6 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.9fr 0.9fr 1.1fr" },
              gap: 4,
            }}
          >
            <FadeIn>
              <Box>
                <Stack
                  direction="row"
                  spacing={1.1}
                  alignItems="center"
                  sx={{ mb: 1.8 }}
                >
                  <Box
                    component="img"
                    src={logoUrl}
                    alt={`${data.name || "Agrob"} logo`}
                    sx={{
                      width: 36,
                      height: 36,
                      objectFit: "contain",
                      flexShrink: 0,
                    }}
                  />
                  <Typography
                    sx={{ fontSize: "1.5rem", fontWeight: 900, color: primary }}
                  >
                    {data.name || "Agrob"}
                  </Typography>
                </Stack>
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.72)",
                    maxWidth: 280,
                    lineHeight: 1.8,
                    mb: 2,
                  }}
                >
                  Your one-stop solution to practical insight, planning, and
                  field-ready growth ideas.
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.68)" }}>
                  {data.contact.email || "hello@agrob.com"}
                </Typography>
              </Box>
            </FadeIn>

            <FadeIn delay={0.08}>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                  Navigation
                </Typography>
                <Stack spacing={1.1}>
                  {[
                    { label: "Home", id: "blog-home" },
                    { label: "About", id: "blog-about" },
                    { label: "Blog", id: "blog-list" },
                    { label: "Contact", id: "blog-contact" },
                  ].map((item) => (
                    <Typography
                      key={item.label}
                      onClick={() => scrollToSection(item.id)}
                      sx={{ color: "rgba(255,255,255,0.7)", cursor: "pointer" }}
                    >
                      {item.label}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </FadeIn>

            <FadeIn delay={0.16}>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                  Quick Info
                </Typography>
                <Stack spacing={1.1}>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Weekly insights and featured articles
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Expert answers and field guidance
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Direct contact for partnerships
                  </Typography>
                  <Typography sx={{ color: "rgba(255,255,255,0.7)" }}>
                    Smooth single-page navigation
                  </Typography>
                </Stack>
              </Box>
            </FadeIn>

            <FadeIn delay={0.24}>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                  Newsletter
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.12)",
                    bgcolor: "rgba(255,255,255,0.04)",
                    px: 1.8,
                    py: 0.7,
                    mb: 2,
                  }}
                >
                  <MailOutlineIcon
                    sx={{ color: "rgba(255,255,255,0.45)", fontSize: 18 }}
                  />
                  <InputBase
                    placeholder="Enter your email here"
                    sx={{
                      flex: 1,
                      color: "#fff",
                      "& input::placeholder": {
                        color: "rgba(255,255,255,0.45)",
                        opacity: 1,
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 34,
                      height: 34,
                      borderRadius: "50%",
                      bgcolor: primary,
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <ArrowForwardIcon sx={{ fontSize: 16 }} />
                  </Box>
                </Box>

                <Stack direction="row" spacing={1}>
                  {[
                    data.socialLinks?.twitter ? <Twitter size={16} /> : null,
                    data.socialLinks?.facebook ? <Facebook size={16} /> : null,
                    data.socialLinks?.instagram ? (
                      <Instagram size={16} />
                    ) : null,
                    data.socialLinks?.linkedin ? <Linkedin size={16} /> : null,
                  ]
                    .filter(Boolean)
                    .map((icon, index) => (
                      <Box
                        key={index}
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: "50%",
                          border: "1px solid rgba(255,255,255,0.12)",
                          display: "grid",
                          placeItems: "center",
                          color: "rgba(255,255,255,0.75)",
                        }}
                      >
                        {icon}
                      </Box>
                    ))}
                </Stack>
              </Box>
            </FadeIn>
          </Box>

          <Box
            sx={{
              mt: 4,
              pt: 2.2,
              borderTop: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FadeIn>
              <Typography
                sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}
              >
                © {new Date().getFullYear()} {data.name || "Agrob"} | All right
                reserved.
              </Typography>
            </FadeIn>
            <FadeIn delay={0.08}>
              <Typography
                sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.85rem" }}
              >
                Terms of Service
              </Typography>
            </FadeIn>
          </Box>
        </Box>
      </Box>

      <Dialog
        open={Boolean(selectedPost)}
        onClose={() => setSelectedPost(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
            bgcolor: "#f9faf7",
          },
        }}
      >
        {selectedPost && (
          <>
            <Box sx={{ position: "relative" }}>
              <Box
                component="img"
                src={selectedPost.image}
                alt={selectedPost.title}
                sx={{
                  width: "100%",
                  height: { xs: 260, md: 420 },
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
            <DialogContent
              sx={{ px: { xs: 2.5, md: 4 }, py: { xs: 3, md: 4 } }}
            >
              <Stack
                direction="row"
                spacing={1.2}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 2 }}
              >
                <Chip
                  label={selectedPost.category || "Article"}
                  sx={{ bgcolor: secondary, color: "#334155", fontWeight: 700 }}
                />
                <Chip
                  label={formatDate(selectedPost.publishedAt)}
                  sx={{
                    bgcolor: "#fff",
                    color: "#475467",
                    border: "1px solid rgba(17,24,39,0.08)",
                  }}
                />
                <Chip
                  label={selectedPost.author || "Agro Insight Team"}
                  sx={{
                    bgcolor: "#fff",
                    color: "#475467",
                    border: "1px solid rgba(17,24,39,0.08)",
                  }}
                />
              </Stack>
              <Typography
                sx={{
                  fontSize: { xs: "1.9rem", md: "3rem" },
                  lineHeight: 1.06,
                  fontWeight: 800,
                  mb: 2,
                }}
              >
                {selectedPost.title}
              </Typography>
              <Typography
                sx={{
                  color: "#475467",
                  lineHeight: 1.8,
                  fontSize: { xs: "1rem", md: "1.06rem" },
                  mb: 2,
                }}
              >
                {selectedPost.description}
              </Typography>
              <Typography
                sx={{
                  color: "#667085",
                  lineHeight: 1.95,
                  fontSize: { xs: "1rem", md: "1.02rem" },
                }}
              >
                {selectedPost.content}
              </Typography>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default BlogTemplate;
