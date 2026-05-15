import React, { useState } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Chip,
  IconButton,
  Divider,
  Avatar,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import {
  Instagram,
  Facebook,
  Twitter,
  Phone,
  Mail,
  Shield,
  Truck,
  Star,
  Headphones,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";
import type { Product } from "../../types/BusinessData";
import FadeIn from "../../blocks/FadeIn";

const MotionBox = motion(Box);
const MotionImg = motion.img;

/* ─── Trust Badge Strip ───────────────────────────────────────── */
const TRUST_BADGES = [
  { icon: Shield, label: "Quality Guaranteed" },
  { icon: Truck, label: "Fast Delivery" },
  { icon: Star, label: "Top Rated" },
  { icon: Headphones, label: "Expert Support" },
];

/* ─── Product Card ────────────────────────────────────────────── */
function ProductCard({
  product,
  primary,
  accent,
  onQuote,
}: {
  product: Product;
  primary: string;
  accent: string;
  onQuote: (name: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <MotionBox
      whileHover={{ y: -6 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        bgcolor: "#fff",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #f0f0f0",
        transition: "box-shadow 0.3s",
        "&:hover": { boxShadow: "0 20px 60px rgba(0,0,0,0.1)" },
      }}
    >
      {/* Image */}
      <Box
        sx={{
          position: "relative",
          height: 280,
          overflow: "hidden",
          bgcolor: "#f8f8f8",
        }}
      >
        {product.image ? (
          <Box
            component="img"
            src={product.image}
            alt={product.name}
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              transition: "transform 0.55s ease",
              transform: hovered ? "scale(1.07)" : "scale(1)",
            }}
          />
        ) : (
          <Box sx={{ width: "100%", height: "100%", bgcolor: `${accent}18` }} />
        )}

        {/* Badge */}
        {product.badge && (
          <Box
            sx={{
              position: "absolute",
              top: 14,
              left: 14,
              bgcolor:
                product.badge === "Sale"
                  ? "#ef4444"
                  : product.badge === "New"
                    ? "#22c55e"
                    : primary,
              color: "#fff",
              borderRadius: 999,
              px: 1.5,
              py: 0.5,
            }}
          >
            <Typography
              sx={{ fontSize: "0.65rem", fontWeight: 700, letterSpacing: 1 }}
            >
              {product.badge}
            </Typography>
          </Box>
        )}

        {/* Hover overlay with "Get a Quote" button */}
        <AnimatePresence>
          {hovered && (
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                p: 2,
                display: "flex",
                justifyContent: "center",
                background:
                  "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
              }}
            >
              <Button
                variant="contained"
                fullWidth
                onClick={() => onQuote(product.name)}
                sx={{
                  bgcolor: "#fff",
                  color: primary,
                  fontWeight: 700,
                  borderRadius: 999,
                  fontSize: "0.8rem",
                  "&:hover": { bgcolor: "#fff", filter: "brightness(0.95)" },
                }}
              >
                Get a Quote
              </Button>
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>

      {/* Info */}
      <Box sx={{ p: 3 }}>
        {product.category && (
          <Typography
            variant="caption"
            sx={{
              color: "#bbb",
              textTransform: "uppercase",
              letterSpacing: 1.5,
              fontSize: "0.6rem",
            }}
          >
            {product.category}
          </Typography>
        )}
        <Typography
          sx={{
            fontWeight: 700,
            color: "#111",
            mt: 0.5,
            mb: 0.5,
            fontSize: "1rem",
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </Typography>
        {product.description && (
          <Typography
            variant="caption"
            sx={{
              color: "#888",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: 1.6,
              mb: 1.5,
            }}
          >
            {product.description}
          </Typography>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{ fontWeight: 900, fontSize: "1.2rem", color: primary }}
            >
              {product.price}
            </Typography>
            {product.originalPrice && (
              <Typography
                sx={{
                  textDecoration: "line-through",
                  color: "#ccc",
                  fontSize: "0.8rem",
                }}
              >
                {product.originalPrice}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={() => onQuote(product.name)}
            sx={{
              border: `1px solid ${primary}33`,
              color: primary,
              borderRadius: 2,
              "&:hover": { bgcolor: `${primary}0f`, borderColor: primary },
            }}
          >
            <ArrowOutwardIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
    </MotionBox>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
const StoreShowcaseTemplate: React.FC<TemplateProps> = ({ data }) => {
  const primary = data.primaryColor || "#111";
  const accent = data.secondaryColor || "#f59e0b";

  const products = data.products || [];
  const allCategories = [
    "All",
    ...(data.storeCategories ||
      Array.from(
        new Set(products.map((p) => p.category).filter(Boolean) as string[]),
      )),
  ];
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const heroProduct = products[0];
  const gridProducts = products.slice(1);

  const handleQuote = (productName?: string) => {
    const subject = productName
      ? `Quote Request – ${productName}`
      : "Quote Request";
    if (data.contact?.email) {
      window.location.href = `mailto:${data.contact.email}?subject=${encodeURIComponent(subject)}`;
    } else if (data.contact?.phone) {
      window.location.href = `tel:${data.contact.phone}`;
    }
  };

  return (
    <Box
      sx={{
        fontFamily: "'Inter', -apple-system, sans-serif",
        bgcolor: "#fafafa",
        minHeight: "100vh",
      }}
    >
      {/* ── NAVBAR ─────────────────────────────────────────────── */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "#fff",
          borderBottom: "1px solid #efefef",
          px: { xs: 3, md: 8 },
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Typography
          sx={{
            fontWeight: 900,
            fontSize: "1.25rem",
            color: primary,
            flexGrow: 1,
            letterSpacing: -0.5,
          }}
        >
          {data.name}
        </Typography>

        <Stack
          direction="row"
          spacing={4}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {allCategories.slice(1, 5).map((c) => (
            <Typography
              key={c}
              onClick={() => setActiveCategory(c)}
              variant="body2"
              sx={{
                color: "#555",
                cursor: "pointer",
                fontWeight: 500,
                "&:hover": { color: primary },
                transition: "color 0.2s",
              }}
            >
              {c}
            </Typography>
          ))}
        </Stack>

        <Button
          variant="contained"
          size="small"
          onClick={() => handleQuote()}
          endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
          sx={{
            bgcolor: primary,
            color: "#fff",
            fontWeight: 700,
            borderRadius: 999,
            px: 3,
            "&:hover": { bgcolor: primary, filter: "brightness(0.88)" },
          }}
        >
          Get a Quote
        </Button>
      </Box>

      {/* ── HERO (split: left text, right product image) ──────── */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          minHeight: { xs: "auto", md: "88vh" },
          bgcolor: "#fff",
        }}
      >
        {/* Left text panel */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 5, md: 10 },
            py: { xs: 12, md: 16 },
          }}
        >
          <FadeIn>
            <Chip
              label="New Collection"
              size="small"
              sx={{
                bgcolor: `${accent}18`,
                color: accent,
                fontWeight: 700,
                mb: 3,
                fontSize: "0.7rem",
                letterSpacing: 1,
                alignSelf: "flex-start",
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontWeight: 900,
                fontSize: { xs: "2.8rem", md: "4rem", lg: "5rem" },
                lineHeight: 1.0,
                letterSpacing: "-0.03em",
                color: "#111",
                mb: 3,
              }}
            >
              {data.tagline || `Discover ${data.name}`}
            </Typography>
            <Typography
              sx={{
                color: "#666",
                fontSize: "1.05rem",
                lineHeight: 1.8,
                maxWidth: 440,
                mb: 6,
              }}
            >
              {data.description}
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: primary,
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 5,
                  py: 1.6,
                  "&:hover": { bgcolor: primary, filter: "brightness(0.88)" },
                }}
              >
                Explore Products
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => handleQuote()}
                sx={{
                  borderColor: "#e0e0e0",
                  color: "#555",
                  borderRadius: 999,
                  px: 5,
                  py: 1.6,
                  "&:hover": {
                    borderColor: primary,
                    color: primary,
                    bgcolor: "transparent",
                  },
                }}
              >
                Get a Quote
              </Button>
            </Stack>

            {/* Inline contact */}
            <Box sx={{ mt: 6, display: "flex", gap: 3, flexWrap: "wrap" }}>
              {data.contact?.phone && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone size={14} color={accent} />
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    {data.contact.phone}
                  </Typography>
                </Box>
              )}
              {data.contact?.email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Mail size={14} color={accent} />
                  <Typography variant="caption" sx={{ color: "#888" }}>
                    {data.contact.email}
                  </Typography>
                </Box>
              )}
            </Box>
          </FadeIn>
        </Box>

        {/* Right: hero product image */}
        <MotionBox
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.85, ease: [0.22, 0.61, 0.36, 1] }}
          sx={{
            display: { xs: "none", md: "block" },
            position: "relative",
            overflow: "hidden",
          }}
        >
          {heroProduct?.image ? (
            <>
              <Box
                component="img"
                src={heroProduct.image}
                alt={heroProduct.name}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                }}
              />
              {/* Product info overlay */}
              <Box
                sx={{
                  position: "absolute",
                  bottom: 32,
                  left: 32,
                  right: 32,
                  bgcolor: "rgba(255,255,255,0.95)",
                  backdropFilter: "blur(12px)",
                  borderRadius: 3,
                  p: 3,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "#bbb",
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                      fontSize: "0.6rem",
                    }}
                  >
                    {heroProduct.category || "Featured"}
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 700, color: "#111", fontSize: "1rem" }}
                  >
                    {heroProduct.name}
                  </Typography>
                  <Typography
                    sx={{ fontWeight: 900, color: primary, fontSize: "1.1rem" }}
                  >
                    {heroProduct.price}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  onClick={() => handleQuote(heroProduct.name)}
                  sx={{
                    bgcolor: primary,
                    color: "#fff",
                    fontWeight: 700,
                    borderRadius: 2,
                    "&:hover": { bgcolor: primary, filter: "brightness(0.88)" },
                  }}
                >
                  Get a Quote
                </Button>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                width: "100%",
                height: "100%",
                background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
              }}
            />
          )}
        </MotionBox>
      </Box>

      {/* ── TRUST BADGES ───────────────────────────────────────── */}
      <Box sx={{ bgcolor: primary, py: 4, px: { xs: 3, md: 8 } }}>
        <Box
          sx={{
            maxWidth: 1200,
            mx: "auto",
            display: "grid",
            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
            gap: 3,
          }}
        >
          {TRUST_BADGES.map(({ icon: Icon, label }) => (
            <Box
              key={label}
              sx={{ display: "flex", alignItems: "center", gap: 2 }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.12)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} color="#fff" />
              </Box>
              <Typography
                sx={{ color: "#fff", fontWeight: 600, fontSize: "0.85rem" }}
              >
                {label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── PRODUCT COLLECTION ─────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          px: { xs: 4, md: 8 },
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <FadeIn>
          <Box sx={{ textAlign: "center", mb: 8 }}>
            <Typography
              variant="overline"
              sx={{ color: accent, letterSpacing: 4, fontSize: "0.65rem" }}
            >
              Our Products
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#111",
                mt: 1,
                fontSize: { xs: "1.8rem", md: "2.8rem" },
              }}
            >
              The Collection
            </Typography>
          </Box>
        </FadeIn>

        {/* Category filter */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 6 }}>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
            justifyContent="center"
          >
            {allCategories.map((c) => (
              <Chip
                key={c}
                label={c}
                onClick={() => setActiveCategory(c)}
                sx={{
                  bgcolor: activeCategory === c ? primary : "#fff",
                  color: activeCategory === c ? "#fff" : "#555",
                  fontWeight: activeCategory === c ? 700 : 500,
                  border: `1px solid ${activeCategory === c ? primary : "#e5e5e5"}`,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: activeCategory === c ? primary : "#f5f5f5",
                  },
                  borderRadius: 999,
                  px: 0.5,
                }}
              />
            ))}
          </Stack>
        </Box>

        {/* Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr 1fr",
              sm: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 3,
          }}
        >
          {filtered.map((product, i) => (
            <FadeIn key={product.id} delay={i * 0.06}>
              <ProductCard
                product={product}
                primary={primary}
                accent={accent}
                onQuote={handleQuote}
              />
            </FadeIn>
          ))}
        </Box>
      </Box>

      {/* ── CATEGORY SHOWCASE ──────────────────────────────────── */}
      {allCategories.length > 2 && (
        <Box
          sx={{ py: { xs: 10, md: 14 }, px: { xs: 4, md: 8 }, bgcolor: "#fff" }}
        >
          <Box sx={{ maxWidth: 1400, mx: "auto" }}>
            <FadeIn>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  color: "#111",
                  mb: 6,
                  textAlign: "center",
                }}
              >
                Shop by Category
              </Typography>
            </FadeIn>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  md: `repeat(${Math.min(allCategories.length - 1, 3)}, 1fr)`,
                },
                gap: 3,
              }}
            >
              {allCategories.slice(1, 4).map((cat, i) => {
                const catProduct = products.find((p) => p.category === cat);
                return (
                  <FadeIn key={cat} delay={i * 0.1}>
                    <MotionBox
                      whileHover="hovered"
                      onClick={() => setActiveCategory(cat)}
                      sx={{
                        position: "relative",
                        height: { xs: 200, md: 280 },
                        borderRadius: 4,
                        overflow: "hidden",
                        cursor: "pointer",
                        bgcolor: "#f5f5f5",
                      }}
                    >
                      {catProduct?.image && (
                        <MotionImg
                          variants={{
                            hovered: { scale: 1.07 },
                            initial: { scale: 1 },
                          }}
                          initial="initial"
                          transition={{ duration: 0.45 }}
                          src={catProduct.image}
                          alt={cat}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      )}
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.65) 30%, rgba(0,0,0,0.1) 100%)",
                        }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          bottom: 20,
                          left: 20,
                          right: 20,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-end",
                        }}
                      >
                        <Box>
                          <Typography
                            sx={{
                              color: "#fff",
                              fontWeight: 800,
                              fontSize: "1.1rem",
                            }}
                          >
                            {cat}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: "rgba(255,255,255,0.7)" }}
                          >
                            {products.filter((p) => p.category === cat).length}{" "}
                            products
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            bgcolor: "rgba(255,255,255,0.2)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ArrowOutwardIcon
                            sx={{ color: "#fff", fontSize: 16 }}
                          />
                        </Box>
                      </Box>
                    </MotionBox>
                  </FadeIn>
                );
              })}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── BRAND STORY ────────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 12, md: 18 },
          px: { xs: 4, md: 10 },
          maxWidth: 1400,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: { xs: 6, md: 12 },
          alignItems: "center",
        }}
      >
        <FadeIn direction="left">
          <Box>
            <Typography
              variant="overline"
              sx={{ color: accent, letterSpacing: 4, fontSize: "0.65rem" }}
            >
              Our Story
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#111",
                mt: 1,
                mb: 3,
                fontSize: { xs: "2rem", md: "2.8rem" },
                lineHeight: 1.1,
              }}
            >
              {data.name}
            </Typography>
            <Typography
              sx={{ color: "#666", lineHeight: 1.9, mb: 4, fontSize: "1rem" }}
            >
              {data.description}
            </Typography>
            {data.contact?.email && (
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                onClick={() => handleQuote()}
                sx={{
                  bgcolor: primary,
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 5,
                  py: 1.5,
                  "&:hover": { bgcolor: primary, filter: "brightness(0.88)" },
                }}
              >
                Get in Touch
              </Button>
            )}
          </Box>
        </FadeIn>

        <FadeIn direction="right" delay={0.12}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 2,
              height: { xs: 300, md: 420 },
            }}
          >
            {(data.gallery || []).slice(1, 5).map((img, i) => (
              <Box
                key={i}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  ...(i === 0 ? { gridRow: "span 2" } : {}),
                }}
              >
                <Box
                  component="img"
                  src={img.url}
                  alt={img.caption || ""}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            ))}
          </Box>
        </FadeIn>
      </Box>

      {/* ── REVIEWS ────────────────────────────────────────────── */}
      {data.reviews && data.reviews.length > 0 && (
        <Box
          sx={{ bgcolor: "#fff", py: { xs: 10, md: 14 }, px: { xs: 4, md: 8 } }}
        >
          <Box sx={{ maxWidth: 1200, mx: "auto" }}>
            <FadeIn>
              <Box sx={{ textAlign: "center", mb: 8 }}>
                <Typography
                  variant="overline"
                  sx={{ color: accent, letterSpacing: 4, fontSize: "0.65rem" }}
                >
                  Testimonials
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, color: "#111", mt: 1 }}
                >
                  What Customers Say
                </Typography>
              </Box>
            </FadeIn>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 3,
              }}
            >
              {data.reviews.slice(0, 3).map((r, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <Box
                    sx={{
                      p: 4,
                      bgcolor: "#fafafa",
                      borderRadius: 3,
                      border: "1px solid #efefef",
                      ...(i === 1
                        ? {
                            bgcolor: primary,
                            "& *": {
                              color: "rgba(255,255,255,0.9) !important",
                            },
                          }
                        : {}),
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 0.5, mb: 2 }}>
                      {Array.from({ length: Math.round(r.rating || 5) }).map(
                        (_, si) => (
                          <Typography
                            key={si}
                            sx={{
                              color: i === 1 ? "#fbbf24 !important" : accent,
                              fontSize: "0.85rem",
                            }}
                          >
                            ★
                          </Typography>
                        ),
                      )}
                    </Box>
                    <Typography
                      sx={{
                        color: "#444",
                        lineHeight: 1.8,
                        fontStyle: "italic",
                        mb: 3,
                        fontSize: "0.95rem",
                      }}
                    >
                      "{r.comment}"
                    </Typography>
                    <Divider
                      sx={{
                        mb: 2.5,
                        borderColor:
                          i === 1 ? "rgba(255,255,255,0.15)" : "#efefef",
                      }}
                    />
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: `${accent}33`,
                          color: accent,
                          fontWeight: 700,
                          fontSize: "0.85rem",
                        }}
                      >
                        {r.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#111",
                            fontSize: "0.85rem",
                          }}
                        >
                          {r.name}
                        </Typography>
                        {r.role && (
                          <Typography variant="caption" sx={{ color: "#999" }}>
                            {r.role}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </FadeIn>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── CTA BANNER ─────────────────────────────────────────── */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
          py: { xs: 10, md: 14 },
          px: { xs: 4, md: 8 },
          textAlign: "center",
        }}
      >
        <FadeIn>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: "#fff",
              mb: 2,
              fontSize: { xs: "1.8rem", md: "2.8rem" },
            }}
          >
            Ready to place an order?
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.8)",
              mb: 5,
              fontSize: "1.05rem",
              maxWidth: 480,
              mx: "auto",
            }}
          >
            Contact us for pricing, custom orders, bulk inquiries, and tailored
            solutions.
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            flexWrap="wrap"
            useFlexGap
          >
            {data.contact?.phone && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<Phone size={16} />}
                href={`tel:${data.contact.phone}`}
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "#fff",
                  borderRadius: 999,
                  px: 5,
                  py: 1.5,
                  "&:hover": {
                    borderColor: "#fff",
                    bgcolor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                {data.contact.phone}
              </Button>
            )}
            {data.contact?.email && (
              <Button
                variant="contained"
                size="large"
                startIcon={<Mail size={16} />}
                onClick={() => handleQuote()}
                sx={{
                  bgcolor: "#fff",
                  color: primary,
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 5,
                  py: 1.5,
                  "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
                }}
              >
                Get a Quote
              </Button>
            )}
          </Stack>
        </FadeIn>
      </Box>

      {/* ── FOOTER ─────────────────────────────────────────────── */}
      <Box sx={{ bgcolor: "#111", py: 6, px: { xs: 4, md: 8 } }}>
        <Box
          sx={{
            maxWidth: 1400,
            mx: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 3,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontWeight: 900,
                color: "#fff",
                fontSize: "1.1rem",
                mb: 0.5,
              }}
            >
              {data.name}
            </Typography>
            {data.contact?.address && (
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.4)" }}
              >
                {data.contact.address}
              </Typography>
            )}
          </Box>
          {data.socialLinks && (
            <Stack direction="row" spacing={1}>
              {data.socialLinks.instagram && (
                <IconButton
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    "&:hover": { color: "#fff" },
                  }}
                >
                  <Instagram size={16} />
                </IconButton>
              )}
              {data.socialLinks.twitter && (
                <IconButton
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    "&:hover": { color: "#1da1f2" },
                  }}
                >
                  <Twitter size={16} />
                </IconButton>
              )}
              {data.socialLinks.facebook && (
                <IconButton
                  size="small"
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    "&:hover": { color: "#1877f2" },
                  }}
                >
                  <Facebook size={16} />
                </IconButton>
              )}
            </Stack>
          )}
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} {data.name}. All rights reserved.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default StoreShowcaseTemplate;
