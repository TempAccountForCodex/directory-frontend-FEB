import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  IconButton,
  Button,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Facebook, Instagram, Twitter, Phone, Mail } from "lucide-react";
import { TemplateProps } from "../../templateEngine/types";
import { Product } from "../../types/BusinessData";
import FadeIn from "../../blocks/FadeIn";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const StoreGridTemplate: React.FC<TemplateProps> = ({ data }) => {
  const primary = data.primaryColor || "#111";
  const accent = data.secondaryColor || "#f59e0b";

  const products = data.products || [];
  const allCategories = [
    "All",
    ...(data.storeCategories ||
      Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))),
  ];
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);

  const handleQuote = () => {
    if (data.contact?.email) {
      window.location.href = `mailto:${data.contact.email}?subject=Quote Request`;
    } else if (data.contact?.phone) {
      window.location.href = `tel:${data.contact.phone}`;
    }
  };

  return (
    <Box sx={{ fontFamily: "'Inter', -apple-system, sans-serif", bgcolor: "#fff", minHeight: "100vh" }}>

      {/* Header */}
      <Box
        component="header"
        sx={{
          position: "sticky", top: 0, zIndex: 100,
          bgcolor: "#fff", borderBottom: "1px solid #ebebeb",
          px: { xs: 3, md: 6 }, py: 2,
          display: "flex", alignItems: "center", gap: 3,
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: "1.3rem", color: primary, flexGrow: 1, letterSpacing: -0.5 }}>
          {data.name}
        </Typography>
        <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
          {allCategories.slice(1, 4).map((c) => (
            <Typography key={c} variant="body2" sx={{ color: "#555", cursor: "pointer", "&:hover": { color: primary } }}>
              {c}
            </Typography>
          ))}
        </Stack>
        <Button
          variant="contained"
          size="small"
          onClick={handleQuote}
          sx={{
            bgcolor: primary, color: "#fff", fontWeight: 700, borderRadius: 999, px: 2.5,
            "&:hover": { bgcolor: primary, filter: "brightness(0.88)" },
          }}
        >
          Get a Quote
        </Button>
      </Box>

      {/* Hero banner */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)`,
          py: { xs: 8, md: 12 },
          px: { xs: 3, md: 8 },
          textAlign: "center",
        }}
      >
        <FadeIn>
          <Typography
            variant="h2"
            sx={{ fontWeight: 900, color: "#fff", fontSize: { xs: "2rem", md: "3.5rem" }, mb: 2 }}
          >
            {data.tagline || `Explore ${data.name}`}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.8)", fontSize: "1.1rem", mb: 5, maxWidth: 560, mx: "auto" }}>
            {data.description}
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            onClick={handleQuote}
            sx={{
              bgcolor: "#fff", color: primary, fontWeight: 700, borderRadius: 999, px: 5,
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
          >
            Request a Quote
          </Button>
        </FadeIn>
      </Box>

      {/* Category filter */}
      <Box sx={{ px: { xs: 3, md: 6 }, maxWidth: 1300, mx: "auto", py: 5 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {allCategories.map((c) => (
            <Chip
              key={c}
              label={c}
              onClick={() => setActiveCategory(c)}
              sx={{
                bgcolor: activeCategory === c ? primary : "#f5f5f5",
                color: activeCategory === c ? "#fff" : "#555",
                fontWeight: activeCategory === c ? 700 : 400,
                cursor: "pointer",
                "&:hover": { bgcolor: activeCategory === c ? primary : "#ebebeb" },
              }}
            />
          ))}
        </Stack>
      </Box>

      {/* Product grid */}
      <Box sx={{ px: { xs: 3, md: 6 }, maxWidth: 1300, mx: "auto", pb: 14 }}>
        {filtered.length === 0 ? (
          <Typography sx={{ textAlign: "center", py: 12, color: "#888" }}>No products found.</Typography>
        ) : (
          <Grid container spacing={3}>
            {filtered.map((product, i) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <FadeIn delay={i * 0.05}>
                  <ProductCard product={product} primary={primary} accent={accent} onQuote={handleQuote} />
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Reviews strip */}
      {data.reviews && data.reviews.length > 0 && (
        <Box sx={{ bgcolor: "#f9f9f9", py: { xs: 8, md: 10 }, px: 3 }}>
          <FadeIn>
            <Typography variant="h4" sx={{ fontWeight: 800, textAlign: "center", color: "#111", mb: 6 }}>
              What Customers Say
            </Typography>
          </FadeIn>
          <Grid container spacing={3} sx={{ maxWidth: 1100, mx: "auto" }}>
            {data.reviews.slice(0, 3).map((r, i) => (
              <Grid item xs={12} md={4} key={i}>
                <FadeIn delay={i * 0.1}>
                  <Box sx={{ bgcolor: "#fff", borderRadius: 3, p: 3, border: "1px solid #ebebeb" }}>
                    <Box sx={{ display: "flex", gap: 0.5, mb: 1.5 }}>
                      {Array.from({ length: Math.round(r.rating || 5) }).map((_, si) => (
                        <Box key={si} sx={{ color: accent, fontSize: "0.9rem" }}>★</Box>
                      ))}
                    </Box>
                    <Typography sx={{ color: "#555", lineHeight: 1.7, fontStyle: "italic", mb: 2 }}>
                      "{r.comment}"
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#111" }}>{r.name}</Typography>
                  </Box>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Quote CTA banner */}
      <Box sx={{ bgcolor: primary, py: { xs: 8, md: 10 }, px: 3, textAlign: "center" }}>
        <FadeIn>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#fff", mb: 2 }}>
            Interested in our products?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.7)", mb: 4, maxWidth: 480, mx: "auto" }}>
            Contact us for pricing, bulk orders, and custom requirements.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            {data.contact?.phone && (
              <Button
                variant="outlined"
                startIcon={<Phone size={16} />}
                href={`tel:${data.contact.phone}`}
                sx={{ borderColor: "rgba(255,255,255,0.4)", color: "#fff", borderRadius: 999, px: 4, "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}
              >
                {data.contact.phone}
              </Button>
            )}
            {data.contact?.email && (
              <Button
                variant="contained"
                startIcon={<Mail size={16} />}
                onClick={handleQuote}
                sx={{ bgcolor: accent, color: "#000", fontWeight: 700, borderRadius: 999, px: 4, "&:hover": { bgcolor: accent, filter: "brightness(0.9)" } }}
              >
                Get a Quote
              </Button>
            )}
          </Stack>
        </FadeIn>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: "#111", py: 6, px: 3 }}>
        <Box sx={{ maxWidth: 1100, mx: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#fff", mb: 0.5 }}>{data.name}</Typography>
            {data.contact?.email && (
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>{data.contact.email}</Typography>
            )}
          </Box>
          {data.socialLinks && (
            <Stack direction="row" spacing={1}>
              {data.socialLinks.instagram && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)" }}><Instagram size={16} /></IconButton>}
              {data.socialLinks.twitter && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)" }}><Twitter size={16} /></IconButton>}
              {data.socialLinks.facebook && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)" }}><Facebook size={16} /></IconButton>}
            </Stack>
          )}
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} {data.name}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

interface ProductCardProps {
  product: Product;
  primary: string;
  accent: string;
  onQuote: () => void;
}

function ProductCard({ product, primary, accent, onQuote }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  return (
    <MotionBox
      whileHover={{ y: -4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        borderRadius: 3, overflow: "hidden", bgcolor: "#fff",
        border: "1px solid #ebebeb", cursor: "default",
        transition: "box-shadow 0.25s",
        "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.1)" },
      }}
    >
      {/* Image */}
      <Box sx={{ position: "relative", height: 240, overflow: "hidden", bgcolor: "#f5f5f5" }}>
        {product.image && (
          <Box
            component="img"
            src={product.image}
            alt={product.name}
            sx={{
              width: "100%", height: "100%", objectFit: "cover",
              transition: "transform 0.5s",
              transform: hovered ? "scale(1.06)" : "scale(1)",
            }}
          />
        )}
        {product.badge && (
          <Chip
            label={product.badge}
            size="small"
            sx={{
              position: "absolute", top: 12, left: 12,
              bgcolor: product.badge === "Sale" ? "#ef4444" : product.badge === "New" ? "#22c55e" : primary,
              color: "#fff", fontWeight: 700, fontSize: "0.7rem",
            }}
          />
        )}
      </Box>

      {/* Info */}
      <Box sx={{ p: 2.5 }}>
        {product.category && (
          <Typography variant="caption" sx={{ color: "#aaa", textTransform: "uppercase", letterSpacing: 1, fontSize: "0.65rem" }}>
            {product.category}
          </Typography>
        )}
        <Typography sx={{ fontWeight: 700, color: "#111", mt: 0.5, mb: 1, lineHeight: 1.3 }}>
          {product.name}
        </Typography>
        {product.description && (
          <Typography
            variant="caption"
            sx={{
              color: "#888", display: "-webkit-box",
              WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
              lineHeight: 1.6, mb: 1.5,
            }}
          >
            {product.description}
          </Typography>
        )}

        {/* Price row */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: primary }}>{product.price}</Typography>
            {product.originalPrice && (
              <Typography sx={{ textDecoration: "line-through", color: "#bbb", fontSize: "0.8rem" }}>
                {product.originalPrice}
              </Typography>
            )}
          </Box>
          <Button
            size="small"
            variant="contained"
            onClick={onQuote}
            sx={{
              bgcolor: accent, color: "#fff", fontWeight: 700, borderRadius: 999,
              px: 2, fontSize: "0.72rem", whiteSpace: "nowrap",
              "&:hover": { bgcolor: accent, filter: "brightness(0.9)" },
            }}
          >
            Get a Quote
          </Button>
        </Box>
      </Box>
    </MotionBox>
  );
}

export default StoreGridTemplate;
