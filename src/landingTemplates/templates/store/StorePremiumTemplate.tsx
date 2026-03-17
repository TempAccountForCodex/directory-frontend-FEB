import React, { useMemo } from "react";
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
import { TemplateProps } from "../../templateEngine/types";

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

const StorePremiumTemplate: React.FC<TemplateProps> = ({ data }) => {
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

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const navItems = [
    { label: "Home", id: "hero" },
    { label: "Shop", id: "collection" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
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
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: 1.8,
            display: "grid",
            gridTemplateColumns: { xs: "auto 1fr auto", md: "220px 1fr 120px" },
            alignItems: "center",
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.2} alignItems="center">
            <Box
              component="button"
              type="button"
              onClick={() => scrollToSection("hero")}
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
                onClick={() => scrollToSection(item.id)}
                sx={{
                  border: 0,
                  p: 0,
                  bgcolor: "transparent",
                  cursor: "pointer",
                  color: palette.ink,
                  fontSize: { xs: "0.72rem", md: "0.74rem" },
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                  fontFamily: bodyFont,
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>

      <Box id="hero" sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 } }}>
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
              maxWidth: 640,
              mx: "auto",
            }}
          >
            Unique Handbag
            <br />
            Selection
          </Typography>
          <Button
            variant="contained"
            onClick={() => scrollToSection("collection")}
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
      </Box>

      <Box
        sx={{
          height: { xs: 260, md: 420 },
          backgroundImage: `url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
        }}
      />

      <Box
        id="collection"
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
              New season edit
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
              Discover signature handbags designed to move between work, travel,
              evening plans, and everyday styling with ease.
            </Typography>
          </Box>

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
            Explore the Collection
          </Typography>
        </Box>

        <Box
          sx={{
            mt: 4,
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(5, minmax(0, 1fr))",
            },
            gap: { xs: 2, md: 2.2 },
          }}
        >
          {products.map((product, index) => (
            <Box
              key={product.id}
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
                transform: {
                  md: index % 2 === 1 ? "translateY(24px)" : "translateY(0)",
                },
                "&:hover": {
                  transform: {
                    md:
                      index % 2 === 1 ? "translateY(16px)" : "translateY(-8px)",
                  },
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

              <Box
                sx={{
                  aspectRatio: "0.78 / 1",
                  overflow: "hidden",
                  bgcolor: "#efe4d2",
                }}
              >
                <Box
                  component="img"
                  src={product.image}
                  alt={product.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 280ms ease",
                  }}
                />
              </Box>
              <Typography
                sx={{
                  mt: 1.55,
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
                  mt: 0.85,
                  minHeight: 54,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: { xs: "1.15rem", md: "1.28rem" },
                  lineHeight: 1.02,
                  letterSpacing: "-0.04em",
                }}
              >
                {product.name}
              </Typography>
              <Typography
                sx={{
                  mt: 0.9,
                  color: palette.muted,
                  fontSize: "0.88rem",
                  lineHeight: 1.7,
                  minHeight: 50,
                  px: { md: 0.8 },
                }}
              >
                {product.description}
              </Typography>
              <Typography
                sx={{ mt: 1.2, fontSize: "0.95rem", fontWeight: 700 }}
              >
                {product.price}
              </Typography>
            </Box>
          ))}
        </Box>

        <Stack direction="row" justifyContent="center">
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
        </Stack>
      </Box>

      <Box id="about" sx={{ bgcolor: palette.accent }}>
        <Box
          sx={{
            maxWidth: 1280,
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: { xs: 0, md: 0 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" },
            alignItems: "stretch",
          }}
        >
          <Box
            component="img"
            src={aboutImage}
            alt="About"
            sx={{
              width: "100%",
              height: "100%",
              minHeight: { xs: 320, md: 480 },
              objectFit: "cover",
            }}
          />
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
                fontFamily: headingFont,
                fontWeight: 700,
                fontSize: { xs: "1.8rem", md: "2.6rem" },
                letterSpacing: "-0.05em",
              }}
            >
              About Our Store
            </Typography>
            <Typography
              sx={{
                mt: 2.2,
                fontSize: { xs: "0.95rem", md: "1rem" },
                lineHeight: 1.9,
                maxWidth: 420,
              }}
            >
              {data.description ||
                "This premium handbag store template balances editorial storytelling, structured product presentation, and clean enquiry-focused sections for luxury fashion brands."}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 6, md: 7 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.2fr" },
            gap: { xs: 2.5, md: 5 },
            alignItems: "center",
          }}
        >
          <Typography
            sx={{
              fontFamily: headingFont,
              fontWeight: 700,
              fontSize: { xs: "1.8rem", md: "2.7rem" },
              lineHeight: 0.95,
              letterSpacing: "-0.05em",
            }}
          >
            Special
            <br />
            Offers
          </Typography>
          <Box>
            <Typography
              sx={{
                maxWidth: 520,
                color: palette.muted,
                fontSize: "0.95rem",
                lineHeight: 1.9,
              }}
            >
              Use this campaign block for capsule releases, limited colors,
              occasion edits, or best-selling handbag drops without changing the
              overall layout.
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 2.3,
                bgcolor: palette.accent,
                color: palette.ink,
                borderRadius: 999,
                border: `1px solid ${palette.border}`,
                boxShadow: "none",
                px: 3,
                py: 0.8,
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
              }}
            >
              Order now
            </Button>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          height: { xs: 260, md: 420 },
          backgroundImage: `url(${featureBandImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 8.5 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            mb: 3.5,
          }}
        >
          <Typography
            sx={{
              fontFamily: headingFont,
              fontWeight: 700,
              fontSize: { xs: "1.9rem", md: "3rem" },
              letterSpacing: "-0.05em",
              lineHeight: 0.95,
            }}
          >
            Why
            <br />
            Choose Us
          </Typography>
          <Button
            variant="contained"
            onClick={() => scrollToSection("contact")}
            sx={{
              bgcolor: palette.accent,
              color: palette.ink,
              borderRadius: 999,
              border: `1px solid ${palette.border}`,
              boxShadow: "none",
              px: 2.7,
              py: 0.78,
              fontSize: "0.68rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              "&:hover": { bgcolor: "#e6b12c", boxShadow: "none" },
            }}
          >
            Contact
          </Button>
        </Box>

        <Stack sx={{ borderTop: `1px solid rgba(17,17,17,0.18)` }}>
          {benefitItems.map((item) => {
            const Icon = item.icon;
            return (
              <Box
                key={item.title}
                sx={{
                  py: { xs: 3, md: 4 },
                  borderBottom: `1px solid rgba(17,17,17,0.18)`,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
                  gap: 3,
                  alignItems: "start",
                }}
              >
                <Stack direction="row" spacing={1.8} alignItems="flex-start">
                  <Box sx={{ mt: 0.3, display: "flex" }}>
                    <Icon size={20} strokeWidth={1.8} />
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontFamily: headingFont,
                        fontWeight: 700,
                        fontSize: { xs: "1.35rem", md: "1.65rem" },
                        lineHeight: 0.98,
                        letterSpacing: "-0.04em",
                      }}
                    >
                      {item.title}
                    </Typography>
                    <Typography
                      sx={{
                        mt: 0.8,
                        fontSize: "0.82rem",
                        color: palette.muted,
                      }}
                    >
                      {item.subtitle}
                    </Typography>
                  </Box>
                </Stack>
                <Typography
                  sx={{
                    color: palette.muted,
                    fontSize: "0.95rem",
                    lineHeight: 1.9,
                    maxWidth: 520,
                  }}
                >
                  {item.description}
                </Typography>
              </Box>
            );
          })}
        </Stack>
      </Box>

      <Box
        id="contact"
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
          </Box>

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
        </Box>
      </Box>

      <Box
        sx={{ borderTop: `1px solid ${palette.border}`, py: { xs: 5, md: 6 } }}
      >
        <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 } }}>
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
                    onClick={() => scrollToSection(item.id)}
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
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StorePremiumTemplate;
