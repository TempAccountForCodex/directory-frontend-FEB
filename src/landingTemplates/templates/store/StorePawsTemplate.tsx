import React from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PetsOutlinedIcon from "@mui/icons-material/PetsOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { motion } from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";

const palette = {
  bg: "#f4e4d3",
  card: "#f8efe6",
  ink: "#231815",
  muted: "rgba(35, 24, 21, 0.66)",
  line: "rgba(35, 24, 21, 0.1)",
  accent: "#7f4f3d",
  accentSoft: "#ead4c2",
  white: "#fffaf5",
};

const headingFont = '"Questrial", "Inter", sans-serif';
const bodyFont = '"Inter", "Segoe UI", sans-serif';
const heroVideo = "https://videocdn.cdnpk.net/videos/76f0be3a-af58-4fc9-b0f0-6252b6b58f8f/horizontal/previews/clear/large.mp4?token=exp=1775511212~hmac=36253990c1b625f12c6fba83194d10e86376484db1b895b90160be55de3fcf9e";

const fallbackProducts = [
  {
    id: "paw-1",
    name: "Walk Set",
    category: "Harness",
    price: "$48",
    badge: "Best Seller",
    description: "Soft-touch harness, leash, and tag-ready clip in warm walnut tones.",
    image:
      "https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "paw-2",
    name: "Cloud Bed",
    category: "Rest",
    price: "$96",
    badge: "New",
    description: "Supportive memory-foam bed built for calmer evenings and better naps.",
    image:
      "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "paw-3",
    name: "Treat Jar",
    category: "Feeding",
    price: "$28",
    badge: "Gift Pick",
    description: "Kitchen-friendly ceramic jar for treats, toppers, and training snacks.",
    image:
      "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "paw-4",
    name: "Rain Coat",
    category: "Apparel",
    price: "$54",
    badge: "Seasonal",
    description: "Lightweight outdoor coat with reflective trim and easy-fit chest closure.",
    image:
      "https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "paw-5",
    name: "Travel Bowl",
    category: "Travel",
    price: "$22",
    badge: "Everyday",
    description: "Fold-flat silicone bowl for road trips, park walks, and cafe stops.",
    image:
      "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "paw-6",
    name: "Calm Collar",
    category: "Collars",
    price: "$34",
    badge: "Core",
    description: "Premium leather collar with brushed metal hardware and soft lining.",
    image:
      "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=1200&q=80",
  },
];

const benefitItems = [
  {
    title: "Designed for daily life",
    description: "Elegant essentials for walks, rest, feeding, and travel.",
    icon: <PetsOutlinedIcon fontSize="small" />,
  },
  {
    title: "Fast shipping",
    description: "Quick dispatch for gifts, restocks, and last-minute upgrades.",
    icon: <LocalShippingOutlinedIcon fontSize="small" />,
  },
  {
    title: "Quality materials",
    description: "Comfort-first fabrics, durable trims, and easy-care finishes.",
    icon: <WorkspacePremiumOutlinedIcon fontSize="small" />,
  },
];

const reviews = [
  {
    author: "Mia R.",
    role: "Frenchie owner",
    text: "The bed and walk set feel premium without being fussy. Everything looks calm and considered.",
  },
  {
    author: "Jordan T.",
    role: "Pug parent",
    text: "This template feels like a real pet brand, not a generic store. The storytelling sections sell the products well.",
  },
  {
    author: "Nina L.",
    role: "Boutique retailer",
    text: "Exactly the soft luxury direction we wanted for dog accessories and everyday essentials.",
  },
];

const reveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
} as const;

const StorePawsTemplate: React.FC<TemplateProps> = ({ data }) => {
  const products = data.products?.length ? data.products : fallbackProducts;
  const featured = products.slice(0, 3);
  const essentials = products.slice(3, 6);
  const heroImage = data.heroBannerUrl || featured[0]?.image || fallbackProducts[0].image;
  const [isPastHero, setIsPastHero] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      const hero = document.getElementById("hero");
      if (!hero) return;
      const triggerPoint = hero.offsetHeight - 140;
      setIsPastHero(window.scrollY > Math.max(triggerPoint, 120));
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 90;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const handleContact = () => {
    if (data.contact?.email) {
      window.location.href = `mailto:${data.contact.email}`;
      return;
    }
    if (data.contact?.phone) {
      window.location.href = `tel:${data.contact.phone}`;
    }
  };

  return (
    <Box
      sx={{
        bgcolor: palette.bg,
        color: palette.ink,
        fontFamily: bodyFont,
      }}
    >
      <Box
        component="header"
        sx={{
          position: "fixed",
          top: { xs: 48, md: 48 },
          left: 0,
          right: 0,
          zIndex: 50,
          bgcolor: "transparent",
          borderBottom: "none",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              minHeight: 82,
              mt: { xs: 1.2, md: 2 },
              px: { xs: 2, md: 2.5 },
              borderRadius: 999,
              bgcolor: isPastHero
                ? "rgba(255,250,245,0.92)"
                : "rgba(255,250,245,0.12)",
              border: isPastHero
                ? `1px solid ${palette.line}`
                : "1px solid rgba(255,250,245,0.16)",
              backdropFilter: "blur(14px)",
              boxShadow: isPastHero ? "0 10px 30px rgba(35,24,21,0.08)" : "none",
              transition:
                "background-color 220ms ease, border-color 220ms ease, box-shadow 220ms ease",
            }}
          >
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "1.8rem", md: "2.6rem" },
                letterSpacing: "-0.06em",
                color: isPastHero ? palette.ink : palette.white,
                transition: "color 220ms ease",
              }}
            >
              {data.name}
            </Typography>

            <Stack
              direction="row"
              spacing={4}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {[
                { label: "Shop", id: "best-sellers" },
                { label: "Story", id: "brand-story" },
                { label: "Bundles", id: "care-bundles" },
                { label: "Reviews", id: "reviews" },
              ].map((item) => (
                <Typography
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    cursor: "pointer",
                    fontWeight: 500,
                    color: isPastHero ? palette.ink : "rgba(255,250,245,0.92)",
                    transition: "color 220ms ease, opacity 220ms ease",
                    "&:hover": { opacity: 0.65 },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            <Button
              onClick={() => scrollToSection("newsletter")}
              sx={{
                textTransform: "none",
                color: isPastHero ? palette.ink : palette.white,
                border: isPastHero
                  ? `1px solid rgba(35,24,21,0.35)`
                  : "1px solid rgba(255,250,245,0.5)",
                borderRadius: 999,
                px: 2.2,
                transition: "color 220ms ease, border-color 220ms ease",
              }}
            >
              Contact
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box
        id="hero"
        data-preview-section="true"
        data-preview-label="Hero"
        sx={{ pt: { xs: 6.5, md: 0 }, px: { xs: 1.5, md: 0 } }}
      >
        <Box
          sx={{
            position: "relative",
            minHeight: { xs: "78vh", md: "95vh" },
            overflow: "hidden",
            border: `1px solid ${palette.line}`,
            bgcolor: "#000000",
          }}
        >
          <Box
            component="video"
            autoPlay
            muted
            loop
            playsInline
            poster={heroImage}
            sx={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            <source src={heroVideo} type="video/mp4" />
          </Box>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(180deg, rgba(35,24,21,0.08) 0%, rgba(35,24,21,0.28) 38%, rgba(35,24,21,0.66) 100%)",
            }}
          />

          <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2, height: "100%" }}>
            <Stack
              component={motion.div}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              justifyContent="flex-end"
              sx={{ minHeight: { xs: "78vh", md: "92vh" }, pb: { xs: 5, md: 8 } }}
            >
              <Chip
                label="Store Template · Dog Products"
                sx={{
                  alignSelf: "flex-start",
                  mb: 2,
                  bgcolor: "rgba(255,250,245,0.9)",
                  color: palette.ink,
                  fontWeight: 700,
                }}
              />
              <Typography
                sx={{
                  maxWidth: 780,
                  color: palette.white,
                  fontFamily: headingFont,
                  fontSize: { xs: "2.6rem", md: "5.2rem" },
                  lineHeight: 0.92,
                  letterSpacing: "-0.07em",
                }}
              >
                Dog essentials
                <br />
                with calm luxury.
              </Typography>
              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 520,
                  color: "rgba(255,250,245,0.84)",
                  fontSize: { xs: "1rem", md: "1.08rem" },
                  lineHeight: 1.7,
                }}
              >
                {data.tagline ||
                  "An editorial pet store layout for harnesses, beds, treats, travel goods, and curated everyday accessories."}
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ mt: 3, flexWrap: "wrap" }}>
                <Button
                  onClick={() => scrollToSection("best-sellers")}
                  endIcon={<ArrowOutwardIcon />}
                  sx={{
                    bgcolor: palette.white,
                    color: palette.ink,
                    textTransform: "none",
                    borderRadius: 999,
                    px: 2.4,
                    py: 1.1,
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#fff" },
                  }}
                >
                  Shop collection
                </Button>
                <Button
                  onClick={() => scrollToSection("brand-story")}
                  sx={{
                    color: palette.white,
                    border: "1px solid rgba(255,250,245,0.5)",
                    textTransform: "none",
                    borderRadius: 999,
                    px: 2.4,
                    py: 1.1,
                  }}
                >
                  Our story
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Box
          component={motion.section}
          {...reveal}
          id="category-strip"
          data-preview-section="true"
          data-preview-label="Category Strip"
          sx={{ py: { xs: 4, md: 5 } }}
        >
          <Stack
            direction={{ xs: "column", lg: "row" }}
            spacing={2}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(data.storeCategories?.length
                ? data.storeCategories
                : ["Harnesses", "Beds", "Feeding", "Walk Sets", "Travel", "Apparel"]
              ).map((item) => (
                <Chip
                  key={item}
                  label={item}
                  sx={{
                    bgcolor: palette.card,
                    border: `1px solid ${palette.line}`,
                    color: palette.ink,
                    px: 0.8,
                  }}
                />
              ))}
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
              {benefitItems.map((item) => (
                <Stack
                  key={item.title}
                  direction="row"
                  spacing={1.2}
                  alignItems="center"
                  sx={{
                    minWidth: 0,
                    px: 1.5,
                    py: 1.2,
                    borderRadius: "20px",
                    border: `1px solid ${palette.line}`,
                    bgcolor: "rgba(255,250,245,0.55)",
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: palette.accentSoft,
                      color: palette.accent,
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.92rem" }}>
                      {item.title}
                    </Typography>
                    <Typography sx={{ color: palette.muted, fontSize: "0.8rem" }}>
                      {item.description}
                    </Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>

        <Box
          component={motion.section}
          {...reveal}
          id="best-sellers"
          data-preview-section="true"
          data-preview-label="Best Sellers"
          sx={{ py: { xs: 3, md: 4 } }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "end" }}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography sx={{ color: palette.muted, mb: 0.8 }}>Best sellers</Typography>
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "2rem", md: "3.5rem" },
                  lineHeight: 0.94,
                  letterSpacing: "-0.06em",
                }}
              >
                Designed for stylish
                <br />
                dogs and real homes.
              </Typography>
            </Box>
            <Typography sx={{ maxWidth: 360, color: palette.muted, lineHeight: 1.7 }}>
              Hero products, warm editorial imagery, and high-conversion cards for dog
              accessories, beds, feeding, and walk essentials.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.15fr 0.85fr 0.85fr" },
              gap: 2,
            }}
          >
            {featured.map((product, index) => (
              <Box
                key={product.id}
                component={motion.div}
                whileHover={{ y: -6 }}
                transition={{ duration: 0.25 }}
                sx={{
                  position: "relative",
                  minHeight: index === 0 ? 520 : 360,
                  borderRadius: "28px",
                  overflow: "hidden",
                  border: `1px solid ${palette.line}`,
                  gridRow: index === 0 ? { md: "span 2" } : undefined,
                }}
              >
                <Box
                  component="img"
                  src={product.image}
                  alt={product.name}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(180deg, rgba(35,24,21,0.06), rgba(35,24,21,0.8))",
                  }}
                />
                <Stack
                  spacing={1}
                  sx={{
                    position: "absolute",
                    left: 18,
                    right: 18,
                    bottom: 18,
                    color: palette.white,
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Chip
                      label={product.badge || product.category}
                      size="small"
                      sx={{ bgcolor: "rgba(255,250,245,0.88)", color: palette.ink }}
                    />
                    <FavoriteBorderIcon fontSize="small" />
                  </Stack>
                  <Typography sx={{ fontFamily: headingFont, fontSize: "1.5rem" }}>
                    {product.name}
                  </Typography>
                  <Typography sx={{ color: "rgba(255,250,245,0.8)", fontSize: "0.92rem" }}>
                    {product.description}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>{product.price}</Typography>
                </Stack>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          component={motion.section}
          {...reveal}
          id="brand-story"
          data-preview-section="true"
          data-preview-label="Brand Story"
          sx={{ py: { xs: 3, md: 4 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 2,
            }}
          >
            <Box
              sx={{
                borderRadius: "28px",
                overflow: "hidden",
                minHeight: 460,
                border: `1px solid ${palette.line}`,
              }}
            >
              <Box
                component="img"
                src={data.aboutImageUrl || fallbackProducts[3].image}
                alt="Dog brand story"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            <Box
              sx={{
                borderRadius: "28px",
                border: `1px solid ${palette.line}`,
                bgcolor: palette.card,
                p: { xs: 2.5, md: 4 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ color: palette.muted, mb: 1 }}>About the brand</Typography>
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "2rem", md: "3.25rem" },
                    lineHeight: 0.95,
                    letterSpacing: "-0.06em",
                    maxWidth: 440,
                  }}
                >
                  A softer retail direction for modern dog products.
                </Typography>
                <Typography sx={{ mt: 2, maxWidth: 500, color: palette.muted, lineHeight: 1.8 }}>
                  {data.description}
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 1.2,
                  mt: 3,
                }}
              >
                {[
                  { value: "6-7", label: "Editable sections" },
                  { value: "Video", label: "Hero background" },
                  { value: "Dogs", label: "Product focus" },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      borderRadius: "20px",
                      border: `1px solid ${palette.line}`,
                      bgcolor: "rgba(255,255,255,0.55)",
                      p: 1.4,
                    }}
                  >
                    <Typography
                      sx={{ fontFamily: headingFont, fontSize: "1.45rem", letterSpacing: "-0.05em" }}
                    >
                      {item.value}
                    </Typography>
                    <Typography sx={{ color: palette.muted, fontSize: "0.82rem" }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          component={motion.section}
          {...reveal}
          id="care-bundles"
          data-preview-section="true"
          data-preview-label="Care Bundles"
          sx={{ py: { xs: 3, md: 4 } }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "end" }}
            sx={{ mb: 3 }}
          >
            <Box>
              <Typography sx={{ color: palette.muted, mb: 0.8 }}>Curated bundles</Typography>
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "2rem", md: "3.1rem" },
                  lineHeight: 0.96,
                  letterSpacing: "-0.06em",
                }}
              >
                Built around walks,
                <br />
                rest, and routines.
              </Typography>
            </Box>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {essentials.map((product) => (
              <Box
                key={product.id}
                component={motion.div}
                whileHover={{ y: -6 }}
                sx={{
                  borderRadius: "26px",
                  overflow: "hidden",
                  border: `1px solid ${palette.line}`,
                  bgcolor: palette.white,
                }}
              >
                <Box
                  component="img"
                  src={product.image}
                  alt={product.name}
                  sx={{ width: "100%", height: 280, objectFit: "cover" }}
                />
                <Box sx={{ p: 2 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ color: palette.muted, fontSize: "0.8rem" }}>
                      {product.category}
                    </Typography>
                    <Chip
                      label={product.badge || "Featured"}
                      size="small"
                      sx={{ bgcolor: palette.accentSoft, color: palette.accent }}
                    />
                  </Stack>
                  <Typography
                    sx={{
                      mt: 1,
                      fontFamily: headingFont,
                      fontSize: "1.35rem",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography sx={{ mt: 1, color: palette.muted, lineHeight: 1.7 }}>
                    {product.description}
                  </Typography>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ mt: 2 }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{product.price}</Typography>
                    <Button
                      sx={{
                        textTransform: "none",
                        color: palette.ink,
                        minWidth: 0,
                        p: 0,
                        fontWeight: 700,
                      }}
                    >
                      View item
                    </Button>
                  </Stack>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          component={motion.section}
          {...reveal}
          id="reviews"
          data-preview-section="true"
          data-preview-label="Reviews"
          sx={{ py: { xs: 3, md: 4 } }}
        >
          <Typography sx={{ color: palette.muted, mb: 1 }}>Reviews</Typography>
          <Typography
            sx={{
              fontFamily: headingFont,
              fontSize: { xs: "2rem", md: "3.2rem" },
              lineHeight: 0.96,
              letterSpacing: "-0.06em",
              mb: 3,
            }}
          >
            Trusted by pet brands
            <br />
            and dog owners.
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {reviews.map((review) => (
              <Box
                key={review.author}
                sx={{
                  borderRadius: "24px",
                  border: `1px solid ${palette.line}`,
                  bgcolor: palette.card,
                  p: 2.4,
                }}
              >
                <Typography sx={{ fontSize: "1.15rem", lineHeight: 1.8 }}>
                  “{review.text}”
                </Typography>
                <Typography sx={{ mt: 2.5, fontWeight: 700 }}>{review.author}</Typography>
                <Typography sx={{ color: palette.muted, fontSize: "0.88rem" }}>
                  {review.role}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          component={motion.section}
          {...reveal}
          id="newsletter"
          data-preview-section="true"
          data-preview-label="Newsletter"
          sx={{ py: { xs: 3, md: 4.5 } }}
        >
          <Box
            sx={{
              borderRadius: "30px",
              border: `1px solid ${palette.line}`,
              bgcolor: palette.accent,
              color: palette.white,
              p: { xs: 2.5, md: 4 },
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 0.9fr" },
              gap: 2.5,
            }}
          >
            <Box>
              <Typography sx={{ opacity: 0.78, mb: 1 }}>Newsletter + contact</Typography>
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "2rem", md: "3.4rem" },
                  lineHeight: 0.95,
                  letterSpacing: "-0.06em",
                  maxWidth: 460,
                }}
              >
                Launch your next dog-product collection with style.
              </Typography>
              <Typography sx={{ mt: 1.5, maxWidth: 460, opacity: 0.82, lineHeight: 1.7 }}>
                Use this template for a premium pet brand, curated dog store, or campaign-led
                ecommerce landing page.
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: "24px",
                bgcolor: "rgba(255,250,245,0.14)",
                border: "1px solid rgba(255,250,245,0.18)",
                p: 2,
              }}
            >
              <Stack spacing={1.2}>
                <TextField
                  placeholder="Full name"
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      color: palette.white,
                      "& fieldset": { borderColor: "rgba(255,250,245,0.24)" },
                    },
                  }}
                />
                <TextField
                  placeholder="Email address"
                  size="small"
                  fullWidth
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      color: palette.white,
                      "& fieldset": { borderColor: "rgba(255,250,245,0.24)" },
                    },
                  }}
                />
                <TextField
                  placeholder="Tell us about your dog brand"
                  size="small"
                  fullWidth
                  multiline
                  minRows={4}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(255,255,255,0.08)",
                      borderRadius: "16px",
                      color: palette.white,
                      "& fieldset": { borderColor: "rgba(255,250,245,0.24)" },
                    },
                  }}
                />
                <Button
                  onClick={handleContact}
                  endIcon={<ArrowOutwardIcon />}
                  sx={{
                    alignSelf: "flex-start",
                    bgcolor: palette.white,
                    color: palette.accent,
                    textTransform: "none",
                    borderRadius: 999,
                    px: 2.2,
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#fff" },
                  }}
                >
                  Send enquiry
                </Button>
              </Stack>
            </Box>
          </Box>
        </Box>

        <Box
          component="footer"
          data-preview-section="true"
          data-preview-label="Footer"
          sx={{ pb: { xs: 4, md: 5 } }}
        >
          <Box
            sx={{
              borderTop: `1px solid ${palette.line}`,
              pt: 2.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr 0.8fr" },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "1.9rem", md: "2.4rem" },
                  letterSpacing: "-0.06em",
                }}
              >
                {data.name}
              </Typography>
              <Typography sx={{ mt: 1, maxWidth: 420, color: palette.muted, lineHeight: 1.7 }}>
                Premium dog-product merchandising with editorial sections, video hero,
                clean product cards, and a soft luxury retail mood.
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Navigate</Typography>
              <Stack spacing={0.8}>
                {["Hero", "Best sellers", "Story", "Bundles", "Reviews", "Contact"].map(
                  (item) => (
                    <Typography key={item} sx={{ color: palette.muted }}>
                      {item}
                    </Typography>
                  ),
                )}
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ fontWeight: 700, mb: 1 }}>Contact</Typography>
              <Stack spacing={0.8}>
                {data.contact.email ? (
                  <Typography sx={{ color: palette.muted }}>{data.contact.email}</Typography>
                ) : null}
                {data.contact.phone ? (
                  <Typography sx={{ color: palette.muted }}>{data.contact.phone}</Typography>
                ) : null}
                {data.contact.address ? (
                  <Typography sx={{ color: palette.muted }}>{data.contact.address}</Typography>
                ) : null}
              </Stack>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default StorePawsTemplate;
