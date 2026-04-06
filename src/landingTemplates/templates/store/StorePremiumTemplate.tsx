import React, { useEffect, useMemo, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import {
  Facebook,
  Gem,
  Instagram,
  Mail,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Twitter,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import FadeIn from "../../blocks/FadeIn";
import type { TemplateProps } from "../../templateEngine/types";

const headingFont = '"Poppins", "Avenir Next", "Segoe UI", sans-serif';
const bodyFont = '"Manrope", "Avenir Next", "Segoe UI", sans-serif';

const palette = {
  page: "#efe6d6",
  panel: "#f5ecdf",
  ink: "#111111",
  muted: "#544e46",
  accent: "#f0bc3f",
  border: "#17140f",
  fieldBorder: "rgba(68, 58, 40, 0.34)",
  fieldText: "#2e281f",
  fieldLabel: "#8d7f68",
};

const fallbackLogo = "https://cdn-icons-png.freepik.com/128/3081/3081559.png";

const fallbackProducts = [
  {
    id: "premium-1",
    name: "Luna Leather Tote",
    price: "$189",
    category: "Signature Tote",
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=900&q=80",
    description:
      "A refined everyday tote with structured lines, premium texture, and enough room for daily essentials.",
    url: undefined,
  },
  {
    id: "premium-2",
    name: "Sienna Shoulder Bag",
    price: "$164",
    category: "Shoulder Bag",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=900&q=80",
    description:
      "Softly curved silhouette designed for polished day-to-night styling across seasons.",
    url: undefined,
  },
  {
    id: "premium-3",
    name: "Noir Mini Crossbody",
    price: "$142",
    category: "Crossbody",
    badge: "Top Pick",
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80",
    description:
      "Compact premium bag for curated edits, statement drops, and elevated seasonal merchandising.",
    url: undefined,
  },
  {
    id: "premium-4",
    name: "Studio Bucket Bag",
    price: "$171",
    category: "Bucket Bag",
    badge: "Edit",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    description:
      "Ideal for premium assortments, capsule collections, and editorial storefronts.",
    url: undefined,
  },
  {
    id: "premium-5",
    name: "Atelier Evening Clutch",
    price: "$128",
    category: "Clutch",
    badge: "Sale",
    image:
      "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?auto=format&fit=crop&w=900&q=80",
    description:
      "A clean, visual-first product card with room for luxury materials and occasion-led storytelling.",
    url: undefined,
  },
];

const fallbackHero =
  "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=2000&q=80";
const fallbackAbout =
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=80";
const fallbackBand =
  "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=2000&q=80";
const fallbackTouch =
  "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=900&q=80";

const benefitItems = [
  {
    title: "Quality Assurance",
    subtitle: "Premium materials",
    description:
      "Use this row to explain leather selection, hardware quality, craftsmanship standards, or what makes your bags feel premium.",
    icon: Gem,
  },
  {
    title: "Functional Design",
    subtitle: "Made for modern routines",
    description:
      "This section works for product differentiation, size guidance, carrying comfort, and how each bag fits a specific lifestyle.",
    icon: ShieldCheck,
  },
  {
    title: "Customer Satisfaction",
    subtitle: "Support that converts",
    description:
      "A flexible row for delivery confidence, care instructions, returns clarity, or why customers keep coming back.",
    icon: ShoppingBag,
  },
];

type StorePage = "home" | "shop" | "about" | "contact";

const StorePremiumTemplate: React.FC<TemplateProps> = ({ data }) => {
  const navigate = useNavigate();
  const { templateId = "store-premium", pageId } = useParams<{
    templateId?: string;
    pageId?: string;
  }>();

  const products = useMemo(() => {
    const source = data.products?.length
      ? data.products.slice(0, 5)
      : fallbackProducts;
    return source.map((product, index) => ({
      ...product,
      image:
        product.image ||
        fallbackProducts[index % fallbackProducts.length].image,
      category:
        product.category ||
        fallbackProducts[index % fallbackProducts.length].category,
      badge:
        product.badge ||
        fallbackProducts[index % fallbackProducts.length].badge,
      description:
        product.description ||
        fallbackProducts[index % fallbackProducts.length].description,
      url: product.url || undefined,
    }));
  }, [data.products]);

  const heroImage =
    data.gallery?.[0]?.url || products[0]?.image || fallbackHero;
  const aboutImage = data.gallery?.[1]?.url || fallbackAbout;
  const featureBandImage = data.gallery?.[2]?.url || fallbackBand;
  const touchImage = data.gallery?.[3]?.url || fallbackTouch;
  const logoSrc = data.logoUrl || fallbackLogo;

  const socialLinks = [
    { key: "instagram", icon: Instagram },
    { key: "facebook", icon: Facebook },
    { key: "twitter", icon: Twitter },
  ].filter((item) =>
    Boolean(data.socialLinks?.[item.key as keyof typeof data.socialLinks]),
  );

  const getInitialPage = (): StorePage =>
    pageId === "shop" || pageId === "about" || pageId === "contact"
      ? pageId
      : "home";

  const [activePage, setActivePage] = useState<StorePage>(getInitialPage);

  useEffect(() => {
    setActivePage(getInitialPage());
  }, [pageId]);

  const navigateToPage = (page: StorePage) => {
    setActivePage(page);
    const targetPath =
      page === "home"
        ? `/landing-preview/${templateId}`
        : `/landing-preview/${templateId}/${page}`;
    navigate(targetPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navItems = [
    { label: "Home", page: "home" as const },
    { label: "Shop", page: "shop" as const },
    { label: "About", page: "about" as const },
    { label: "Contact", page: "contact" as const },
  ];

  const fieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: palette.fieldText,
      bgcolor: "rgba(255,255,255,0.12)",
      "& fieldset": {
        borderColor: palette.fieldBorder,
        borderWidth: "1px",
      },
      "&:hover fieldset": {
        borderColor: "rgba(54,45,29,0.48)",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#a98d3a",
        borderWidth: "1px",
      },
      "& input::placeholder, & textarea::placeholder": {
        color: palette.fieldLabel,
        opacity: 1,
      },
    },
    "& .MuiInputLabel-root": {
      color: palette.fieldLabel,
    },
    "& .MuiInputLabel-root.Mui-focused": {
      color: "#8b6f1d",
    },
  } as const;

  const renderHomePage = () => (
    <>
      <Box
        id="home-hero"
        data-preview-section="true"
        data-preview-label="Hero"
        sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 } }}
      >
        <FadeIn>
          <Box
            sx={{
              py: { xs: 7, md: 8 },
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.7rem",
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: palette.muted,
              }}
            >
              {data.tagline || "Modern handbag collection"}
            </Typography>
            <Typography
              sx={{
                mt: 1.5,
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "2.2rem", md: "3.9rem" },
                lineHeight: 0.94,
                letterSpacing: "-0.06em",
                maxWidth: 720,
                mx: "auto",
              }}
            >
              Unique Handbag
              <br />
              Selection
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigateToPage("shop")}
              sx={{
                mt: 2.4,
                bgcolor: palette.accent,
                color: palette.ink,
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                boxShadow: "none",
                px: 3,
                py: 0.85,
                fontSize: "0.72rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
              }}
            >
              Shop now
            </Button>
          </Box>
        </FadeIn>
      </Box>

      <FadeIn delay={0.08}>
        <Box
          sx={{
            height: { xs: 260, md: 420 },
            backgroundImage: `url(${heroImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
          }}
        />
      </FadeIn>

      <Box
        id="home-featured"
        data-preview-section="true"
        data-preview-label="Featured"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 9 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.72fr 1.28fr" },
            gap: { xs: 3, md: 5 },
            alignItems: "end",
            mb: 4,
          }}
        >
          <FadeIn>
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                border: `1px solid rgba(17,17,17,0.14)`,
                bgcolor: "rgba(255,255,255,0.28)",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: palette.muted,
                }}
              >
                Featured arrivals
              </Typography>
              <Typography
                sx={{
                  mt: 1.2,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "1.65rem", md: "2.2rem" },
                  lineHeight: 0.98,
                  letterSpacing: "-0.05em",
                  maxWidth: 300,
                }}
              >
                Crafted silhouettes
                <br />
                for daily elegance.
              </Typography>
              <Typography
                sx={{
                  mt: 1.5,
                  maxWidth: 320,
                  color: palette.muted,
                  fontSize: "0.92rem",
                  lineHeight: 1.8,
                }}
              >
                Discover signature handbags designed to move between work,
                travel, evening plans, and everyday styling with ease.
              </Typography>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Typography
              sx={{
                textAlign: { xs: "left", md: "right" },
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "2rem", md: "4rem" },
                letterSpacing: "-0.06em",
                lineHeight: 0.94,
              }}
            >
              Bestsellers
              <br />
              This Week
            </Typography>
          </FadeIn>
        </Box>

        <Box
          sx={{
            mt: 4,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.2 },
          }}
        >
          {products.slice(0, 3).map((product, index) => (
            <FadeIn key={product.id} delay={index * 0.08}>
              <Box
                sx={{
                  minWidth: 0,
                  p: { xs: 1.4, md: 1.6 },
                  border: `1px solid rgba(17,17,17,0.12)`,
                  bgcolor: "#f4ebdd",
                  textAlign: "center",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 10px 30px rgba(48,34,8,0.04)",
                  transition:
                    "transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 24px 50px rgba(48,34,8,0.10)",
                    borderColor: "rgba(17,17,17,0.22)",
                  },
                }}
              >
                {product.badge ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 14,
                      left: 14,
                      zIndex: 2,
                      px: 1.1,
                      py: 0.5,
                      borderRadius: 999,
                      bgcolor: "rgba(17,17,17,0.88)",
                      color: "#fff",
                      fontSize: "0.62rem",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    {product.badge}
                  </Box>
                ) : null}
                <Box sx={{ aspectRatio: "0.8 / 1", overflow: "hidden" }}>
                  <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    mt: 1.4,
                    fontSize: "0.68rem",
                    color: palette.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                  }}
                >
                  {product.category}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: { xs: "1.15rem", md: "1.35rem" },
                    lineHeight: 1.02,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {product.name}
                </Typography>
                <Typography
                  sx={{ mt: 1.1, fontSize: "0.95rem", fontWeight: 700 }}
                >
                  {product.price}
                </Typography>
              </Box>
            </FadeIn>
          ))}
        </Box>

        <FadeIn delay={0.12}>
          <Stack direction="row" justifyContent="center">
            <Button
              variant="contained"
              onClick={() => navigateToPage("shop")}
              sx={{
                mt: 3.2,
                bgcolor: palette.accent,
                color: palette.ink,
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                boxShadow: "none",
                px: 3,
                py: 0.85,
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
              }}
            >
              View all products
            </Button>
          </Stack>
        </FadeIn>
      </Box>

      <Box
        id="home-story"
        data-preview-section="true"
        data-preview-label="Story"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pb: { xs: 7, md: 8.5 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.86fr 1.14fr" },
            gap: { xs: 3, md: 4 },
            alignItems: "stretch",
            border: `1px solid rgba(17,17,17,0.15)`,
            bgcolor: "#f4ebdd",
            overflow: "hidden",
          }}
        >
          <FadeIn direction="right">
            <Box
              component="img"
              src={aboutImage}
              alt="Store story"
              sx={{
                width: "100%",
                height: "100%",
                minHeight: { xs: 300, md: 460 },
                objectFit: "cover",
              }}
            />
          </FadeIn>
          <FadeIn delay={0.08}>
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: palette.muted,
                }}
              >
                Brand story
              </Typography>
              <Typography
                sx={{
                  mt: 1.2,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "1.9rem", md: "3rem" },
                  lineHeight: 0.95,
                  letterSpacing: "-0.05em",
                  maxWidth: 520,
                }}
              >
                Premium essentials designed with a softer luxury point of view.
              </Typography>
              <Typography
                sx={{
                  mt: 1.8,
                  maxWidth: 520,
                  color: palette.muted,
                  fontSize: "0.95rem",
                  lineHeight: 1.9,
                }}
              >
                {data.description ||
                  "This premium handbag store template balances editorial storytelling, structured product presentation, and clean enquiry-focused sections for luxury fashion brands."}
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigateToPage("about")}
                sx={{
                  mt: 2.5,
                  alignSelf: "flex-start",
                  bgcolor: palette.accent,
                  color: palette.ink,
                  borderRadius: 999,
                  border: `1px solid ${palette.border}`,
                  boxShadow: "none",
                  px: 3,
                  py: 0.85,
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
                }}
              >
                Read about us
              </Button>
            </Box>
          </FadeIn>
        </Box>
      </Box>

      <Box
        id="home-newsletter"
        data-preview-section="true"
        data-preview-label="Newsletter"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pb: { xs: 7, md: 9 },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 4.5 },
            border: `1px solid rgba(17,17,17,0.14)`,
            bgcolor: "#f4ebdd",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
            gap: { xs: 3, md: 4 },
            alignItems: "center",
          }}
        >
          <FadeIn>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: palette.muted,
                }}
              >
                Newsletter
              </Typography>
              <Typography
                sx={{
                  mt: 1.1,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "1.9rem", md: "3rem" },
                  lineHeight: 0.95,
                  letterSpacing: "-0.05em",
                  maxWidth: 520,
                }}
              >
                Join for new arrivals, seasonal edits, and private collection
                updates.
              </Typography>
              <Typography
                sx={{
                  mt: 1.6,
                  maxWidth: 520,
                  color: palette.muted,
                  fontSize: "0.95rem",
                  lineHeight: 1.9,
                }}
              >
                Stay close to the latest handbag drops, curated selections, and
                early access moments designed for customers who love premium
                pieces.
              </Typography>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Box
              sx={{
                maxWidth: 560,
                width: "100%",
                justifySelf: "end",
              }}
            >
              <Stack spacing={1.4}>
                <TextField
                  label="Email address"
                  variant="outlined"
                  fullWidth
                  sx={fieldStyles}
                />
                <Button
                  variant="contained"
                  sx={{
                    alignSelf: { xs: "stretch", sm: "flex-start" },
                    bgcolor: palette.accent,
                    color: palette.ink,
                    borderRadius: 999,
                    border: `1px solid ${palette.border}`,
                    boxShadow: "none",
                    px: 3.2,
                    py: 0.95,
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
                  }}
                >
                  Subscribe
                </Button>
              </Stack>
            </Box>
          </FadeIn>
        </Box>
      </Box>
    </>
  );

  const renderShopPage = () => (
    <>
      <Box
        id="shop-hero"
        data-preview-section="true"
        data-preview-label="Banner"
        sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 } }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: 320, md: 500 },
            overflow: "hidden",
            border: `1px solid rgba(17,17,17,0.14)`,
            mt: { xs: 4, md: 5 },
            mb: { xs: 5, md: 6 },
          }}
        >
          <Box
            component="img"
            src={heroImage}
            alt="Shop banner"
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
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.4) 44%, rgba(0,0,0,0.14) 100%)",
            }}
          />

          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              minHeight: { xs: 320, md: 500 },
              display: "flex",
              alignItems: "center",
              px: { xs: 3, md: 6 },
              py: { xs: 5, md: 6 },
            }}
          >
            <FadeIn>
              <Box sx={{ maxWidth: 620 }}>
                <Typography
                  sx={{
                    fontSize: "0.72rem",
                    letterSpacing: "0.34em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.76)",
                  }}
                >
                  Shop the full collection
                </Typography>
                <Typography
                  sx={{
                    mt: 1.4,
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: { xs: "2.4rem", md: "4.6rem" },
                    lineHeight: 0.92,
                    letterSpacing: "-0.06em",
                    color: "#fff",
                  }}
                >
                  Discover every
                  <br />
                  signature piece
                </Typography>
                <Typography
                  sx={{
                    mt: 1.8,
                    maxWidth: 520,
                    color: "rgba(255,255,255,0.82)",
                    fontSize: { xs: "0.96rem", md: "1rem" },
                    lineHeight: 1.85,
                  }}
                >
                  Explore refined handbags designed for everyday elegance,
                  polished styling, and premium wardrobe essentials.
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    mt: 2.5,
                    bgcolor: palette.accent,
                    color: palette.ink,
                    borderRadius: 999,
                    border: `1px solid ${palette.border}`,
                    boxShadow: "none",
                    px: 3,
                    py: 0.85,
                    fontSize: "0.7rem",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
                  }}
                >
                  Shop now
                </Button>
              </Box>
            </FadeIn>
          </Box>
        </Box>
      </Box>

      <Box
        id="shop-products"
        data-preview-section="true"
        data-preview-label="Products"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pb: { xs: 7, md: 9 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.4 },
          }}
        >
          {products.map((product, index) => (
            <FadeIn key={product.id} delay={index * 0.06}>
              <Box
                sx={{
                  p: { xs: 1.4, md: 1.6 },
                  border: `1px solid rgba(17,17,17,0.12)`,
                  bgcolor: "#f4ebdd",
                  boxShadow: "0 10px 30px rgba(48,34,8,0.04)",
                }}
              >
                <Box sx={{ position: "relative", overflow: "hidden" }}>
                  {product.badge ? (
                    <Box
                      sx={{
                        position: "absolute",
                        top: 14,
                        left: 14,
                        zIndex: 2,
                        px: 1.1,
                        py: 0.5,
                        borderRadius: 999,
                        bgcolor: "rgba(17,17,17,0.88)",
                        color: "#fff",
                        fontSize: "0.62rem",
                        letterSpacing: "0.18em",
                        textTransform: "uppercase",
                      }}
                    >
                      {product.badge}
                    </Box>
                  ) : null}
                  <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      width: "100%",
                      aspectRatio: "0.84 / 1",
                      objectFit: "cover",
                    }}
                  />
                </Box>
                <Typography
                  sx={{
                    mt: 1.35,
                    fontSize: "0.68rem",
                    color: palette.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.22em",
                  }}
                >
                  {product.category}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.8,
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: { xs: "1.2rem", md: "1.45rem" },
                    lineHeight: 1.02,
                    letterSpacing: "-0.04em",
                  }}
                >
                  {product.name}
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    color: palette.muted,
                    fontSize: "0.92rem",
                    lineHeight: 1.8,
                  }}
                >
                  {product.description}
                </Typography>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mt: 1.8 }}
                >
                  <Typography sx={{ fontSize: "1rem", fontWeight: 700 }}>
                    {product.price}
                  </Typography>
                  <Button
                    variant="contained"
                    component={product.url ? "a" : "button"}
                    href={product.url || undefined}
                    target={product.url ? "_blank" : undefined}
                    rel={product.url ? "noreferrer" : undefined}
                    sx={{
                      bgcolor: palette.accent,
                      color: palette.ink,
                      borderRadius: 999,
                      border: `1px solid ${palette.border}`,
                      boxShadow: "none",
                      px: 2.2,
                      py: 0.72,
                      fontSize: "0.66rem",
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
                    }}
                  >
                    Visit product
                  </Button>
                </Stack>
              </Box>
            </FadeIn>
          ))}
        </Box>
      </Box>
    </>
  );

  const renderAboutPage = () => (
    <>
      <Box
        id="about-intro"
        data-preview-section="true"
        data-preview-label="Intro"
        sx={{ bgcolor: palette.accent }}
      >
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 4 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
            alignItems: "stretch",
          }}
        >
          <FadeIn direction="right">
            <Box
              component="img"
              src={aboutImage}
              alt="About"
              sx={{
                width: "100%",
                height: "100%",
                minHeight: { xs: 320, md: 520 },
                objectFit: "cover",
              }}
            />
          </FadeIn>
          <FadeIn delay={0.08}>
            <Box
              sx={{
                p: { xs: 3, md: 6 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.7rem",
                  letterSpacing: "0.28em",
                  textTransform: "uppercase",
                  color: "rgba(17,17,17,0.72)",
                }}
              >
                About our store
              </Typography>
              <Typography
                sx={{
                  mt: 1.2,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "3.2rem" },
                  letterSpacing: "-0.05em",
                  lineHeight: 0.95,
                  maxWidth: 460,
                }}
              >
                Designed for customers who want elegance without excess.
              </Typography>
              <Typography
                sx={{
                  mt: 2.2,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  lineHeight: 1.9,
                  maxWidth: 460,
                }}
              >
                {data.description ||
                  "This premium handbag store template balances editorial storytelling, structured product presentation, and clean enquiry-focused sections for luxury fashion brands."}
              </Typography>
            </Box>
          </FadeIn>
        </Box>
      </Box>

      <Box
        id="about-why"
        data-preview-section="true"
        data-preview-label="Why Choose Us"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 8 },
        }}
      >
        <FadeIn>
          <Box
            sx={{
              textAlign: "center",
              maxWidth: 1140,
              mx: "auto",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mb: 2.4,
              }}
            >
              <Box
                component="img"
                src={logoSrc}
                alt={`${data.name} logo`}
                sx={{
                  width: { xs: 42, md: 70 },
                  height: { xs: 42, md: 70 },
                  objectFit: "contain",
                  filter: data.logoUrl ? "none" : "brightness(0)",
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: "0.8rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                color: palette.ink,
              }}
            >
              Why Choose Us
            </Typography>

            <Typography
              sx={{
                mt: 2.2,
                fontFamily: headingFont,
                fontWeight: 500,
                fontSize: { xs: "1.9rem", md: "3rem" },
                lineHeight: { xs: 1.14, md: 1.08 },
                letterSpacing: "-0.05em",
                color: palette.ink,
                maxWidth: 1120,
                mx: "auto",
              }}
            >
              At {data.name}, we curate every handbag around quality, balance,
              and real-world wearability, so each piece feels elegant,
              practical, and premium from first look to everyday use.
            </Typography>
          </Box>
        </FadeIn>
      </Box>

      <Box
        id="about-process"
        data-preview-section="true"
        data-preview-label="How We Curate"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 8 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            gap: { xs: 3, md: 5 },
            alignItems: "center",
          }}
        >
          <FadeIn>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: palette.muted,
                }}
              >
                How we curate
              </Typography>
              <Typography
                sx={{
                  mt: 1.1,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "2rem", md: "3rem" },
                  lineHeight: 0.95,
                  letterSpacing: "-0.05em",
                  maxWidth: 520,
                }}
              >
                A premium edit shaped by silhouette, utility, and finish.
              </Typography>
              <Stack spacing={2} sx={{ mt: 2.5, maxWidth: 560 }}>
                {[
                  "We start with shape and proportion so every piece feels elegant before styling even begins.",
                  "Materials and hardware are reviewed for texture, weight, and how they elevate the final look in person.",
                  "The assortment stays intentionally tight so the shopping experience feels calm, premium, and focused.",
                ].map((text, index) => (
                  <FadeIn key={text} delay={index * 0.08}>
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "44px 1fr",
                        gap: 1.8,
                        alignItems: "start",
                      }}
                    >
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          border: `1px solid rgba(17,17,17,0.16)`,
                          fontSize: "0.78rem",
                          letterSpacing: "0.12em",
                        }}
                      >
                        0{index + 1}
                      </Box>
                      <Typography
                        sx={{
                          color: palette.muted,
                          fontSize: "0.95rem",
                          lineHeight: 1.9,
                        }}
                      >
                        {text}
                      </Typography>
                    </Box>
                  </FadeIn>
                ))}
              </Stack>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Box
              sx={{
                p: { xs: 2.5, md: 3 },
                border: `1px solid rgba(17,17,17,0.12)`,
                bgcolor: "#f4ebdd",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: palette.muted,
                }}
              >
                Signature standards
              </Typography>
              <Stack spacing={2.2} sx={{ mt: 2.4 }}>
                {[
                  [
                    "Structured forms",
                    "Balanced silhouettes that keep a polished shape throughout the day.",
                  ],
                  [
                    "Premium hardware",
                    "Metal details chosen to add subtle contrast and a more elevated finish.",
                  ],
                  [
                    "Wearable palettes",
                    "Color choices designed to work across wardrobe staples and seasonal looks.",
                  ],
                ].map(([title, text], index) => (
                  <FadeIn key={title} delay={index * 0.08}>
                    <Box
                      sx={{
                        pb: 2.2,
                        borderBottom: `1px solid rgba(17,17,17,0.1)`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: headingFont,
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {title}
                      </Typography>
                      <Typography
                        sx={{
                          mt: 0.8,
                          color: palette.muted,
                          fontSize: "0.93rem",
                          lineHeight: 1.8,
                        }}
                      >
                        {text}
                      </Typography>
                    </Box>
                  </FadeIn>
                ))}
              </Stack>
            </Box>
          </FadeIn>
        </Box>
      </Box>

      <Box
        id="about-cta"
        data-preview-section="true"
        data-preview-label="CTA"
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          pb: { xs: 7, md: 8.5 },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            border: `1px solid rgba(17,17,17,0.14)`,
            bgcolor: "#f4ebdd",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr" },
            gap: { xs: 3, md: 4 },
            alignItems: "center",
          }}
        >
          <FadeIn>
            <Box>
              <Typography
                sx={{
                  fontSize: "0.72rem",
                  letterSpacing: "0.3em",
                  textTransform: "uppercase",
                  color: palette.muted,
                }}
              >
                Visit the collection
              </Typography>
              <Typography
                sx={{
                  mt: 1.1,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "1.9rem", md: "2.7rem" },
                  lineHeight: 0.96,
                  letterSpacing: "-0.05em",
                  maxWidth: 520,
                }}
              >
                Explore the full range of premium handbags and curated seasonal
                edits.
              </Typography>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1.4}
              justifyContent={{ md: "flex-end" }}
            >
              <Button
                variant="contained"
                onClick={() => navigateToPage("shop")}
                sx={{
                  bgcolor: palette.accent,
                  color: palette.ink,
                  borderRadius: 999,
                  border: `1px solid ${palette.border}`,
                  boxShadow: "none",
                  px: 3,
                  py: 0.9,
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
                }}
              >
                Shop collection
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigateToPage("contact")}
                sx={{
                  color: palette.ink,
                  borderColor: "rgba(17,17,17,0.26)",
                  borderRadius: 999,
                  px: 3,
                  py: 0.9,
                  fontSize: "0.7rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  "&:hover": {
                    borderColor: palette.border,
                    bgcolor: "rgba(17,17,17,0.03)",
                  },
                }}
              >
                Contact us
              </Button>
            </Stack>
          </FadeIn>
        </Box>
      </Box>
    </>
  );

  const renderContactPage = () => (
    <Box
      id="contact-form"
      data-preview-section="true"
      data-preview-label="Contact Form"
      sx={{
        maxWidth: 1280,
        mx: "auto",
        px: { xs: 2, md: 4 },
        py: { xs: 7, md: 8.5 },
      }}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "0.88fr 1.12fr" },
          gap: { xs: 3.5, md: 5 },
          alignItems: "start",
        }}
      >
        <FadeIn>
          <Box
            sx={{
              pr: { md: 3 },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.72rem",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: palette.muted,
              }}
            >
              Contact atelier
            </Typography>
            <Typography
              sx={{
                mt: 1,
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "2.4rem", md: "4rem" },
                letterSpacing: "-0.06em",
                lineHeight: 0.92,
                maxWidth: 420,
              }}
            >
              Get In Touch
            </Typography>
            <Typography
              sx={{
                mt: 1.8,
                maxWidth: 360,
                color: palette.muted,
                fontSize: "0.95rem",
                lineHeight: 1.85,
              }}
            >
              Request availability, custom color options, wholesale details, or
              personal styling support for your next handbag selection.
            </Typography>
          </Box>
          <FadeIn delay={0.08} direction="right">
            <Box
              sx={{
                mt: 3.2,
                width: { xs: 220, md: 280 },
                p: 1.2,
                bgcolor: "rgba(255,255,255,0.28)",
                border: `1px solid rgba(17,17,17,0.12)`,
                boxShadow: "0 16px 40px rgba(48,34,8,0.06)",
              }}
            >
              <Box
                component="img"
                src={touchImage}
                alt="Contact"
                sx={{
                  width: "100%",
                  aspectRatio: "0.92 / 1",
                  objectFit: "cover",
                }}
              />
            </Box>
          </FadeIn>
        </FadeIn>

        <FadeIn delay={0.08}>
          <Box
            sx={{
              maxWidth: 560,
              justifySelf: "end",
              width: "100%",
              p: { xs: 2.5, md: 3.2 },
              border: `1px solid rgba(17,17,17,0.18)`,
              bgcolor: "#f4ebdd",
              boxShadow: "0 22px 50px rgba(48,34,8,0.07)",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -12,
                left: 24,
                px: 1.2,
                py: 0.4,
                bgcolor: palette.page,
                border: `1px solid rgba(17,17,17,0.14)`,
                fontSize: "0.66rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                color: palette.muted,
              }}
            >
              Contact form
            </Box>

            <Typography
              sx={{
                mb: 2.1,
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.4rem", md: "1.75rem" },
                letterSpacing: "-0.04em",
              }}
            >
              Start your enquiry
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.6,
              }}
            >
              <TextField
                label="Name"
                variant="outlined"
                fullWidth
                sx={fieldStyles}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                sx={fieldStyles}
              />
            </Box>
            <TextField
              label="Phone"
              variant="outlined"
              fullWidth
              sx={{ mt: 1.6, ...fieldStyles }}
            />
            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              multiline
              minRows={4}
              sx={{ mt: 1.6, ...fieldStyles }}
            />
            <Button
              variant="contained"
              sx={{
                mt: 2.2,
                width: "100%",
                bgcolor: palette.accent,
                color: palette.ink,
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                boxShadow: "none",
                py: 1,
                fontSize: "0.72rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
              }}
            >
              Ask
            </Button>
          </Box>
        </FadeIn>
      </Box>
    </Box>
  );

  const renderActivePage = () => {
    if (activePage === "shop") return renderShopPage();
    if (activePage === "about") return renderAboutPage();
    if (activePage === "contact") return renderContactPage();
    return renderHomePage();
  };

  return (
    <Box
      sx={{
        bgcolor: palette.page,
        color: palette.ink,
        fontFamily: bodyFont,
        scrollBehavior: "smooth",
      }}
    >
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: "rgba(239,230,214,0.96)",
          borderBottom: `1px solid ${palette.border}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <FadeIn direction="down">
          <Box
            sx={{
              maxWidth: 1280,
              mx: "auto",
              px: { xs: 2, md: 4 },
              py: 1.8,
              display: "grid",
              gridTemplateColumns: {
                xs: "auto 1fr auto",
                md: "220px 1fr 120px",
              },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                component="button"
                type="button"
                onClick={() => navigateToPage("home")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  border: 0,
                  p: 0,
                  bgcolor: "transparent",
                  cursor: "pointer",
                  color: palette.ink,
                }}
              >
                <Box
                  component="img"
                  src={logoSrc}
                  alt={`${data.name} logo`}
                  sx={{
                    width: 24,
                    height: 24,
                    objectFit: "contain",
                    filter: data.logoUrl ? "none" : "brightness(0)",
                  }}
                />
                <Typography
                  sx={{
                    display: { xs: "none", sm: "block" },
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: "0.92rem",
                    letterSpacing: "-0.03em",
                  }}
                >
                  {data.name}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={{ xs: 1.5, md: 3.5 }}
              justifyContent="center"
              sx={{
                overflowX: "auto",
                "&::-webkit-scrollbar": { display: "none" },
              }}
            >
              {navItems.map((item) => (
                <Box
                  key={item.label}
                  component="button"
                  type="button"
                  onClick={() => navigateToPage(item.page)}
                  sx={{
                    border: 0,
                    p: 0,
                    bgcolor: "transparent",
                    cursor: "pointer",
                    color:
                      activePage === item.page
                        ? palette.ink
                        : "rgba(17,17,17,0.62)",
                    fontSize: { xs: "0.72rem", md: "0.74rem" },
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    fontFamily: bodyFont,
                    borderBottom:
                      activePage === item.page
                        ? `1px solid ${palette.ink}`
                        : "1px solid transparent",
                    pb: 0.35,
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Stack>
          </Box>
        </FadeIn>
      </Box>

      {renderActivePage()}

      <Box
        sx={{ borderTop: `1px solid ${palette.border}`, py: { xs: 5, md: 6 } }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 } }}>
          <FadeIn>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "3rem", md: "5rem" },
                letterSpacing: "-0.07em",
                lineHeight: 0.9,
              }}
            >
              {data.name}
            </Typography>
          </FadeIn>

          <Box
            sx={{
              mt: 2.5,
              pt: 2.5,
              borderTop: `1px solid rgba(17,17,17,0.18)`,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.8fr 0.8fr 1.4fr" },
              gap: 3,
            }}
          >
            <FadeIn>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Quick links
                </Typography>
                <Stack spacing={0.7} sx={{ mt: 1.3 }}>
                  {navItems.map((item) => (
                    <Box
                      key={item.label}
                      component="button"
                      type="button"
                      onClick={() => navigateToPage(item.page)}
                      sx={{
                        border: 0,
                        p: 0,
                        bgcolor: "transparent",
                        textAlign: "left",
                        cursor: "pointer",
                        color: palette.muted,
                        fontSize: "0.9rem",
                      }}
                    >
                      {item.label}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </FadeIn>

            <FadeIn delay={0.08}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Contact
                </Typography>
                <Typography
                  sx={{
                    mt: 1.3,
                    color: palette.muted,
                    fontSize: "0.9rem",
                    lineHeight: 1.9,
                  }}
                >
                  {data.contact?.email || "hello@brandstore.co"}
                  <br />
                  {data.contact?.phone || "+1 (555) 420 1188"}
                </Typography>
              </Box>
            </FadeIn>

            <FadeIn delay={0.16}>
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.7rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}
                >
                  Visit
                </Typography>
                <Typography
                  sx={{
                    mt: 1.3,
                    color: palette.muted,
                    fontSize: "0.9rem",
                    lineHeight: 1.9,
                  }}
                >
                  {data.contact?.address || "245 Mercer Street, New York, NY"}
                </Typography>

                <Stack direction="row" spacing={1.2} sx={{ mt: 1.8 }}>
                  {socialLinks.map((item) => {
                    const Icon = item.icon;
                    const href =
                      data.socialLinks?.[
                        item.key as keyof typeof data.socialLinks
                      ] || "#";

                    return (
                      <Box
                        key={item.key}
                        component="a"
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        sx={{ color: palette.ink, display: "flex" }}
                      >
                        <Icon size={16} />
                      </Box>
                    );
                  })}
                  {data.contact?.email ? (
                    <Box
                      component="a"
                      href={`mailto:${data.contact.email}`}
                      sx={{ color: palette.ink, display: "flex" }}
                    >
                      <Mail size={16} />
                    </Box>
                  ) : null}
                </Stack>
              </Box>
            </FadeIn>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StorePremiumTemplate;
