import React, { useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  CATEGORY_LABELS,
  type TemplateCategory,
  type TemplateType,
} from "../../templates";
import { generateTemplatePlaceholder } from "../../utils/templatePlaceholderImage";
const star = "/assets/publicAssets/images/common/star.svg";

type TemplateTypeFilter = "all" | "website" | "store";

type StaticTemplate = {
  id: string;
  slug: string;
  name: string;
  description: string;
  type: TemplateType;
  category: TemplateCategory;
  version: string;
  previewImage: string;
};

const STATIC_TEMPLATES: StaticTemplate[] = [
  {
    id: "static-blog",
    slug: "blog",
    name: "Blog",
    description:
      "Editorial layout tailored for insights and content marketing.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/blog.png",
  },
  {
    id: "static-blog-premium",
    slug: "blog-premium",
    name: "Blog Premium",
    description:
      "Premium multi-page editorial magazine template with dedicated article detail layouts.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/blog-premium.png",
  },
  {
    id: "static-portfolio-creative",
    slug: "portfolio-creative",
    name: "Portfolio Creative",
    description:
      "Creative-first portfolio template for individual professionals.",
    type: "website",
    category: "portfolio",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/portfolioCreative.png",
  },
  {
    id: "static-portfolio-agency",
    slug: "portfolio-agency",
    name: "Portfolio Agency",
    description: "Agency-style portfolio layout for studios and teams.",
    type: "website",
    category: "agency",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/portfolioAgency.png",
  },
  {
    id: "static-portfolio-photo-studio",
    slug: "portfolio-photo-studio",
    name: "Portfolio Photo Studio",
    description:
      "Bold editorial photo studio template with cinematic hero, service list, works showcase, FAQ, and image-led storytelling.",
    type: "website",
    category: "portfolio",
    version: "1.0.0",
    previewImage:
      "/assets/templateAssets/images/dummy/portfolio-photo-studio.png",
  },
  {
    id: "static-store-basic",
    slug: "store-basic",
    name: "Store Basic",
    description:
      "Editorial store template with bold campaign layout and reusable product storytelling.",
    type: "store",
    category: "ecommerce",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/storeBasic.png",
  },
  {
    id: "static-store-premium",
    slug: "store-premium",
    name: "Store Premium",
    description:
      "Premium soft-luxury store template with refined collection presentation, about story block, and contact form.",
    type: "store",
    category: "ecommerce",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/storePremium.png",
  },
  {
    id: "static-store-performance",
    slug: "store-performance",
    name: "Store Performance",
    description:
      "High-contrast neon performance store template inspired by gym campaigns and bold sports retail visuals.",
    type: "store",
    category: "ecommerce",
    version: "1.0.0",
    previewImage: "",
  },
  {
    id: "static-company",
    slug: "company",
    name: "Company",
    description:
      "Multi-section company template for product and team storytelling.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/company.png",
  },
  {
    id: "static-company-premium",
    slug: "company-premium",
    name: "Company Premium",
    description:
      "Premium editorial company template with luxury presentation and enquiry-first sections.",
    type: "website",
    category: "saas",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/company-premium.png",
  },
  {
    id: "static-gardening",
    slug: "gardening",
    name: "Gardening",
    description:
      "Nature-focused local business template for garden and landscaping services.",
    type: "website",
    category: "business",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/gardening.png",
  },
  {
    id: "static-education",
    slug: "education",
    name: "Education",
    description:
      "Structured template for courses, institutions, and educational programs.",
    type: "website",
    category: "education",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/education.png",
  },
  {
    id: "static-consulting",
    slug: "consulting",
    name: "Consulting",
    description:
      "Professional consulting template for agencies and advisory businesses.",
    type: "website",
    category: "agency",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/consulting.png",
  },
  {
    id: "static-restaurant",
    slug: "restaurant",
    name: "Restaurant",
    description:
      "Restaurant website layout for menu highlights, reservations, and contact.",
    type: "website",
    category: "restaurant",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/restaurant.png",
  },
  {
    id: "static-plumbing",
    slug: "plumbing",
    name: "Plumbing",
    description:
      "Service template for plumbing businesses with emergency and booking focus.",
    type: "website",
    category: "business",
    version: "1.0.0",
    previewImage: "/assets/templateAssets/images/dummy/plumbing.png",
  },
];

const Templates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<TemplateTypeFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const sortedTemplates = useMemo(() => {
    return [...STATIC_TEMPLATES].sort((a, b) => a.name.localeCompare(b.name));
  }, []);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    for (const template of sortedTemplates) {
      set.add(template.category);
    }
    return Array.from(set).sort();
  }, [sortedTemplates]);

  const filteredTemplates = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return sortedTemplates.filter((template) => {
      const matchesType =
        selectedType === "all" ? true : template.type === selectedType;
      const matchesCategory =
        selectedCategory === "all"
          ? true
          : template.category === selectedCategory;
      const matchesSearch =
        query.length === 0
          ? true
          : `${template.name} ${template.description} ${template.category}`
              .toLowerCase()
              .includes(query);

      return matchesType && matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory, selectedType, sortedTemplates]);

  const websiteCount = sortedTemplates.filter(
    (t) => t.type === "website",
  ).length;
  const storeCount = sortedTemplates.filter((t) => t.type === "store").length;

  const getImage = (template: StaticTemplate) => {
    if (template.previewImage) return template.previewImage;
    return generateTemplatePlaceholder(
      template.name,
      "#378C92",
      template.category,
    );
  };

  return (
    <Box sx={{ bgcolor: "#ffffff" }}>
      <Box
        sx={{
          width: "100%",
          minHeight: { xs: "100vh", md: "70vh" },
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#020303",
          overflow: "hidden",

          backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(55,140,146,0.35) 0%, rgba(2,3,3,0) 45%),
          radial-gradient(circle at 80% 70%, rgba(45,212,191,0.24) 0%, rgba(2,3,3,0) 42%),
          url(${star})
        `,
          backgroundSize: "cover",
          backgroundPosition: "center",

          // Bottom gradient border
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
        <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "1.25fr 0.75fr" },
              gap: { xs: 3, lg: 4 },
              alignItems: "stretch",
            }}
          >
            <Box>
              <Chip
                label="Template Library"
                sx={{
                  mb: 2,
                  bgcolor: "rgba(255,255,255,0.12)",
                  color: "#dff7fb",
                  border: "1px solid rgba(130, 221, 232, 0.35)",
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  lineHeight: 1.03,
                  letterSpacing: "-0.025em",
                  fontSize: { xs: "2rem", sm: "2.8rem", md: "3.5rem" },
                  maxWidth: 860,
                  color: "#ffffff",
                }}
              >
                Build Faster With
                <Box component="span" sx={{ color: "#ffffff" }}>
                  {" "}
                  Ready-Made{" "}
                </Box>
                Templates
              </Typography>
              <Typography
                sx={{
                  color: "rgba(232,242,247,0.82)",
                  maxWidth: 660,
                  mt: 1.8,
                  mb: 2.4,
                  fontSize: { xs: "0.95rem", md: "1.05rem" },
                  lineHeight: 1.6,
                }}
              >
                Pick a starting point, preview complete screens, and launch with
                your own branding in minutes.
              </Typography>

              <TextField
                fullWidth
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates, industries, or categories"
                InputProps={{
                  startAdornment: (
                    <SearchIcon
                      sx={{ color: "#8da4b7", mr: 1, fontSize: 20 }}
                    />
                  ),
                }}
                sx={{
                  maxWidth: 720,
                  "& .MuiInputBase-root": {
                    borderRadius: 3,
                    fontSize: "0.95rem",
                    color: "#e5f0f7",
                    bgcolor: "rgba(7, 14, 19, 0.62)",
                    border: "1px solid rgba(130, 166, 191, 0.35)",
                    backdropFilter: "blur(6px)",
                  },
                }}
              />
            </Box>

            <Box
              sx={{
                "& .hero-template-item": {
                  transition: "transform 420ms ease, box-shadow 420ms ease",
                },
                "& .hero-template-badge": {
                  transition: "transform 420ms ease",
                },
                "&:hover .hero-template-left": {
                  transform: "translate(-6px, -4px) rotate(-3deg)",
                },
                "&:hover .hero-template-center": {
                  transform: "translate(4px, -6px) scale(1.02)",
                },
                "&:hover .hero-template-right": {
                  transform: "translate(6px, -3px) rotate(3deg)",
                },
                "&:hover .hero-template-badge-ai": {
                  transform: "translate(-3px, -6px)",
                },
                "&:hover .hero-template-badge-aa": {
                  transform: "translate(4px, -5px)",
                },
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: { xs: 260, sm: 320, lg: 360 },
                }}
              >
                <Box
                  component="img"
                  className="hero-template-item hero-template-left"
                  src="/assets/publicAssets/images/home/Restaurant.webp"
                  alt="Template side preview left"
                  sx={{
                    position: "absolute",
                    left: { xs: 2, md: 8 },
                    top: { xs: 22, md: 14 },
                    width: { xs: 170, sm: 210, md: 260 },
                    height: { xs: 120, sm: 145, md: 178 },
                    objectFit: "cover",
                    borderRadius: 3,
                    opacity: 0.95,
                    transform: "translate(0, 0) rotate(-1.5deg)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.28)",
                    zIndex: 1,
                  }}
                />

                <Box
                  component="img"
                  className="hero-template-item hero-template-center"
                  src="/assets/publicAssets/images/home/Consulting.webp"
                  alt="Template center preview"
                  sx={{
                    position: "relative",
                    zIndex: 2,
                    width: { xs: 260, sm: 320, md: 390 },
                    height: { xs: 170, sm: 210, md: 255 },
                    objectFit: "cover",
                    borderRadius: 3,
                    border: "1px solid rgba(255,255,255,0.35)",
                    boxShadow: "0 22px 42px rgba(0,0,0,0.45)",
                    left: { xs: 14, md: 22 },
                    top: { xs: 76, md: 72 },
                    transform: "translate(0, 0) scale(1)",
                  }}
                />

                <Box
                  component="img"
                  className="hero-template-item hero-template-right"
                  src="/assets/publicAssets/images/home/Plumbing.webp"
                  alt="Template side preview right"
                  sx={{
                    position: "absolute",
                    right: { xs: 2, md: 8 },
                    top: { xs: 34, md: 24 },
                    width: { xs: 170, sm: 210, md: 260 },
                    height: { xs: 120, sm: 145, md: 178 },
                    objectFit: "cover",
                    borderRadius: 3,
                    opacity: 0.95,
                    transform: "translate(0, 0) rotate(1.5deg)",
                    border: "1px solid rgba(255,255,255,0.25)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.28)",
                    zIndex: 1,
                  }}
                />

                <Box
                  className="hero-template-badge hero-template-badge-ai"
                  sx={{
                    position: "absolute",
                    left: { xs: 12, md: 18 },
                    bottom: { xs: 36, md: 44 },
                    zIndex: 3,
                    px: 1.6,
                    py: 1,
                    borderRadius: 2.2,
                    bgcolor: "rgb(255, 255, 255)",
                    border: "1px solid rgba(255,255,255,0.5)",
                    color: "#000000",
                    fontWeight: 800,
                    fontSize: "0.95rem",
                    boxShadow: "0 10px 20px rgba(0,0,0,0.25)",
                  }}
                >
                  AI
                </Box>

                <Box
                  className="hero-template-badge hero-template-badge-aa"
                  sx={{
                    position: "absolute",
                    right: { xs: 18, md: 24 },
                    bottom: { xs: 10, md: 14 },
                    zIndex: 3,
                    px: 1.2,
                    py: 0.75,
                    borderRadius: 1.8,
                    bgcolor: "rgba(219,234,254,0.92)",
                    border: "1px solid rgba(255,255,255,0.7)",
                    color: "#312e81",
                    fontWeight: 800,
                    fontSize: "1.15rem",
                    boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                  }}
                >
                  Aa
                </Box>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 1.2, justifyContent: "center" }}
              >
                <Chip
                  label={`${sortedTemplates.length} Total`}
                  sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
                />
                <Chip
                  label={`${websiteCount} Website`}
                  sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
                />
                <Chip
                  label={`${storeCount} Store`}
                  sx={{ bgcolor: "rgba(255,255,255,0.18)", color: "#fff" }}
                />
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: { xs: 5, md: 7 }, bgcolor: "#ffffff" }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "260px 1fr" },
              alignItems: "start",
              gap: { xs: 3, md: 4 },
            }}
          >
            <Box
              sx={{
                border: "1px solid #e6ebf0",
                borderRadius: 2,
                p: 2.2,
                position: { md: "sticky" },
                top: { md: 90 },
              }}
            >
              {/* <Typography
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 1.1,
                  fontSize: "0.9rem",
                }}
              >
                Type
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 2.5 }}
              >
                {(["all", "website", "store"] as TemplateTypeFilter[]).map(
                  (type) => (
                    <Chip
                      key={type}
                      clickable
                      label={
                        type === "all"
                          ? "All"
                          : type === "website"
                            ? "Website"
                            : "Store"
                      }
                      onClick={() => setSelectedType(type)}
                      sx={{
                        bgcolor: selectedType === type ? "#0f172a" : "#f1f5f9",
                        color: selectedType === type ? "#fff" : "#334155",
                        borderRadius: 1.5,
                      }}
                    />
                  ),
                )}
              </Stack> */}

              <Typography
                sx={{
                  fontWeight: 700,
                  color: "#0f172a",
                  mb: 1.1,
                  fontSize: "0.9rem",
                }}
              >
                Categories
              </Typography>
              <Stack spacing={0.6}>
                <Button
                  onClick={() => setSelectedCategory("all")}
                  sx={{
                    justifyContent: "flex-start",
                    textTransform: "none",
                    color: selectedCategory === "all" ? "#0f172a" : "#475569",
                    bgcolor:
                      selectedCategory === "all" ? "#edf4f7" : "transparent",
                    borderRadius: 1.2,
                  }}
                >
                  All Categories
                </Button>
                {allCategories.map((category) => (
                  <Button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    sx={{
                      justifyContent: "flex-start",
                      textTransform: "none",
                      color:
                        selectedCategory === category ? "#0f172a" : "#475569",
                      bgcolor:
                        selectedCategory === category
                          ? "#edf4f7"
                          : "transparent",
                      borderRadius: 1.2,
                    }}
                  >
                    {CATEGORY_LABELS[category as TemplateCategory] || category}
                  </Button>
                ))}
              </Stack>
            </Box>

            <Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                alignItems={{ xs: "flex-start", sm: "center" }}
                justifyContent="space-between"
                sx={{ mb: 2.2, gap: 1 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    color: "#111827",
                    fontSize: { xs: "1.25rem", md: "1.4rem" },
                  }}
                >
                  Popular Designs Website Templates ({filteredTemplates.length})
                </Typography>
              </Stack>

              {filteredTemplates.length === 0 ? (
                <Box
                  sx={{
                    border: "1px solid #e5e9ef",
                    borderRadius: 2.5,
                    p: 4,
                    textAlign: "center",
                  }}
                >
                  <Typography sx={{ color: "#475569" }}>
                    No templates matched your current search or filter.
                  </Typography>
                </Box>
              ) : (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(2, minmax(0, 1fr))",
                      xl: "repeat(3, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  {filteredTemplates.map((template) => {
                    const categoryLabel =
                      CATEGORY_LABELS[template.category as TemplateCategory] ||
                      template.category;
                    const previewPath = `/landing-preview/${template.slug}`;

                    return (
                      <Box
                        key={template.id}
                        component={RouterLink}
                        to={previewPath}
                        sx={{
                          "--preview-height": "280px",
                          border: "1px solid #dbe3ec",
                          borderRadius: 3,
                          overflow: "hidden",
                          bgcolor: "#fff",
                          textDecoration: "none",
                          display: "block",
                          transition:
                            "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
                          "& .template-preview-image": {
                            transform: "translateY(0)",
                          },
                          "&:hover": {
                            transform: "translateY(-4px)",
                            boxShadow: "0 18px 32px rgba(15, 23, 42, 0.14)",
                            borderColor: "#b7c6d8",
                          },
                          "&:hover .template-preview-image": {
                            transform:
                              "translateY(min(0px, calc(var(--preview-height) - 100%)))",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: "relative",
                            height: "var(--preview-height)",
                            overflow: "hidden",
                            borderBottom: "1px solid #edf2f7",
                          }}
                        >
                          <Box
                            component="img"
                            src={getImage(template)}
                            alt={`${template.name} preview`}
                            loading="lazy"
                            decoding="async"
                            className="template-preview-image"
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              width: "100%",
                              height: "auto",
                              objectFit: "contain",
                              display: "block",
                              willChange: "transform",
                              transition: "transform 5.5s linear",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              inset: 0,
                              background:
                                "linear-gradient(to top, rgba(2,6,23,0.78) 0%, rgba(2,6,23,0.28) 35%, rgba(2,6,23,0.02) 65%)",
                              pointerEvents: "none",
                            }}
                          />
                          <Chip
                            size="small"
                            label={`v${template.version}`}
                            sx={{
                              position: "absolute",
                              top: 12,
                              right: 12,
                              bgcolor: "rgba(255,255,255,0.9)",
                              color: "#0f172a",
                              fontWeight: 700,
                              fontSize: "0.7rem",
                              height: 22,
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              left: 14,
                              right: 14,
                              bottom: 12,
                            }}
                          >
                            <Typography
                              sx={{
                                color: "#ffffff",
                                fontWeight: 800,
                                lineHeight: 1.12,
                                fontSize: "1.05rem",
                                textShadow: "0 2px 8px rgba(0,0,0,0.45)",
                              }}
                            >
                              {template.name}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Templates;
