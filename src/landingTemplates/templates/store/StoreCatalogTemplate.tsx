import React, { useState } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Button,
  Divider,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { Instagram, Facebook, Twitter, Phone, Mail } from "lucide-react";
import { TemplateProps } from "../../templateEngine/types";
import { Product } from "../../types/BusinessData";
import FadeIn from "../../blocks/FadeIn";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

const StoreCatalogTemplate: React.FC<TemplateProps> = ({ data }) => {
  const primary = data.primaryColor || "#0f172a";
  const accent = data.secondaryColor || "#378C92";

  const products = data.products || [];
  const allCategories = [
    "All",
    ...(data.storeCategories ||
      Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[]))),
  ];
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All" ? products : products.filter((p) => p.category === activeCategory);
  const featured = filtered[0];
  const rest = filtered.slice(1);

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
    <Box sx={{ fontFamily: "'Inter', -apple-system, sans-serif", bgcolor: "#fafafa", minHeight: "100vh" }}>

      {/* Header */}
      <Box
        component="header"
        sx={{
          position: "sticky", top: 0, zIndex: 100,
          bgcolor: primary, px: { xs: 3, md: 6 }, py: 2,
          display: "flex", alignItems: "center", gap: 3,
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: "1.2rem", color: "#fff", flexGrow: 1, letterSpacing: 1, textTransform: "uppercase" }}>
          {data.name}
        </Typography>
        <Stack direction="row" spacing={3} sx={{ display: { xs: "none", md: "flex" } }}>
          {["Products", "About", "Contact"].map((item) => (
            <Typography
              key={item}
              variant="body2"
              sx={{ color: "rgba(255,255,255,0.6)", cursor: "pointer", "&:hover": { color: "#fff" }, transition: "color 0.2s" }}
            >
              {item}
            </Typography>
          ))}
        </Stack>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleQuote()}
          sx={{
            borderColor: "rgba(255,255,255,0.35)", color: "#fff", fontWeight: 600,
            borderRadius: 999, px: 2.5, fontSize: "0.78rem",
            "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
          }}
        >
          Get a Quote
        </Button>
      </Box>

      {/* Category sidebar + content */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "220px 1fr" },
          maxWidth: 1300,
          mx: "auto",
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {/* Sidebar */}
        <Box
          sx={{
            borderRight: { md: "1px solid #e5e7eb" },
            bgcolor: "#fff",
            px: 3,
            py: 5,
            position: { md: "sticky" },
            top: 56,
            height: { md: "calc(100vh - 56px)" },
            overflowY: "auto",
          }}
        >
          <Typography variant="overline" sx={{ color: "#888", letterSpacing: 2, fontSize: "0.65rem", display: "block", mb: 2 }}>
            Categories
          </Typography>
          {allCategories.map((c) => (
            <Box
              key={c}
              onClick={() => setActiveCategory(c)}
              sx={{
                py: 1.5, px: 2, borderRadius: 2, cursor: "pointer", mb: 0.5,
                bgcolor: activeCategory === c ? `${accent}18` : "transparent",
                color: activeCategory === c ? accent : "#555",
                fontWeight: activeCategory === c ? 700 : 400,
                transition: "all 0.2s",
                "&:hover": { bgcolor: activeCategory === c ? `${accent}18` : "#f5f5f5" },
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: "inherit", color: "inherit" }}>{c}</Typography>
              {activeCategory === c && <CheckIcon sx={{ fontSize: 14, color: accent }} />}
            </Box>
          ))}

          {data.contact?.phone && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="caption" sx={{ color: "#aaa", display: "block", mb: 1 }}>Need help?</Typography>
              <Typography
                component="a"
                href={`tel:${data.contact.phone}`}
                variant="body2"
                sx={{ color: accent, fontWeight: 600, textDecoration: "none" }}
              >
                {data.contact.phone}
              </Typography>
            </>
          )}

          {data.contact?.email && (
            <>
              <Divider sx={{ my: 3 }} />
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleQuote()}
                sx={{
                  bgcolor: accent, color: "#fff", fontWeight: 700, borderRadius: 2,
                  "&:hover": { bgcolor: accent, filter: "brightness(0.9)" },
                }}
              >
                Get a Quote
              </Button>
            </>
          )}
        </Box>

        {/* Main content */}
        <Box sx={{ p: { xs: 3, md: 5 } }}>

          {/* Featured product */}
          {featured && (
            <FadeIn>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 4,
                  bgcolor: "#fff",
                  borderRadius: 4,
                  overflow: "hidden",
                  border: "1px solid #ebebeb",
                  mb: 6,
                }}
              >
                <Box sx={{ height: { xs: 260, md: 400 }, overflow: "hidden", bgcolor: "#f5f5f5" }}>
                  {featured.image && (
                    <Box
                      component="img"
                      src={featured.image}
                      alt={featured.name}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </Box>
                <Box sx={{ p: 4, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  {featured.badge && (
                    <Chip label={featured.badge} size="small" sx={{ bgcolor: accent, color: "#fff", fontWeight: 700, mb: 2, alignSelf: "flex-start" }} />
                  )}
                  <Typography variant="overline" sx={{ color: "#888", letterSpacing: 2 }}>{featured.category}</Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: primary, mt: 0.5, mb: 2, lineHeight: 1.2 }}>
                    {featured.name}
                  </Typography>
                  {featured.description && (
                    <Typography sx={{ color: "#666", lineHeight: 1.75, mb: 3 }}>{featured.description}</Typography>
                  )}
                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 4 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: "1.75rem", color: primary }}>{featured.price}</Typography>
                    {featured.originalPrice && (
                      <Typography sx={{ textDecoration: "line-through", color: "#bbb" }}>{featured.originalPrice}</Typography>
                    )}
                  </Box>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => handleQuote(featured.name)}
                    sx={{
                      bgcolor: accent, color: "#fff", fontWeight: 700, borderRadius: 2, px: 4, alignSelf: "flex-start",
                      "&:hover": { bgcolor: accent, filter: "brightness(0.9)" },
                    }}
                  >
                    Get a Quote
                  </Button>
                </Box>
              </Box>
            </FadeIn>
          )}

          {/* Section heading */}
          {rest.length > 0 && (
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 4 }}>
              <Typography variant="h5" sx={{ fontWeight: 800, color: primary }}>
                {activeCategory === "All" ? "All Products" : activeCategory}
              </Typography>
              <Typography variant="caption" sx={{ color: "#888" }}>{filtered.length} items</Typography>
            </Box>
          )}

          {/* Catalog rows */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {rest.map((product, i) => (
              <MotionBox
                key={product.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <CatalogRow
                  product={product}
                  primary={primary}
                  accent={accent}
                  onQuote={() => handleQuote(product.name)}
                />
              </MotionBox>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Quote CTA */}
      <Box sx={{ bgcolor: primary, py: { xs: 8, md: 10 }, px: 3, textAlign: "center" }}>
        <FadeIn>
          <Typography variant="h4" sx={{ fontWeight: 900, color: "#fff", mb: 2 }}>
            Ready to place an order?
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.65)", mb: 4, maxWidth: 480, mx: "auto" }}>
            Reach out for pricing, bulk orders, and tailored solutions.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
            {data.contact?.phone && (
              <Button
                variant="outlined"
                startIcon={<Phone size={16} />}
                href={`tel:${data.contact.phone}`}
                sx={{ borderColor: "rgba(255,255,255,0.35)", color: "#fff", borderRadius: 999, px: 4, "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}
              >
                {data.contact.phone}
              </Button>
            )}
            {data.contact?.email && (
              <Button
                variant="contained"
                startIcon={<Mail size={16} />}
                onClick={() => handleQuote()}
                sx={{ bgcolor: accent, color: "#fff", fontWeight: 700, borderRadius: 999, px: 4, "&:hover": { bgcolor: accent, filter: "brightness(0.9)" } }}
              >
                Get a Quote
              </Button>
            )}
          </Stack>
        </FadeIn>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: primary, borderTop: "1px solid rgba(255,255,255,0.08)", py: 5, px: 3 }}>
        <Box sx={{ maxWidth: 1300, mx: "auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 3 }}>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#fff" }}>{data.name}</Typography>
            {data.contact?.email && <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>{data.contact.email}</Typography>}
          </Box>
          {data.socialLinks && (
            <Stack direction="row" spacing={1}>
              {data.socialLinks.instagram && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)" }}><Instagram size={16} /></IconButton>}
              {data.socialLinks.twitter && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)" }}><Twitter size={16} /></IconButton>}
              {data.socialLinks.facebook && <IconButton size="small" sx={{ color: "rgba(255,255,255,0.4)" }}><Facebook size={16} /></IconButton>}
            </Stack>
          )}
          <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.3)" }}>© {new Date().getFullYear()} {data.name}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

function CatalogRow({
  product, primary, accent, onQuote,
}: {
  product: Product; primary: string; accent: string; onQuote: () => void;
}) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "80px 1fr auto",
        gap: 3, alignItems: "center",
        bgcolor: "#fff", borderRadius: 3, p: 2.5,
        border: "1px solid #ebebeb",
        transition: "box-shadow 0.2s",
        "&:hover": { boxShadow: "0 4px 16px rgba(0,0,0,0.08)" },
      }}
    >
      <Box sx={{ width: 80, height: 80, borderRadius: 2, overflow: "hidden", bgcolor: "#f5f5f5", flexShrink: 0 }}>
        {product.image && (
          <Box component="img" src={product.image} alt={product.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
        )}
      </Box>
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Typography sx={{ fontWeight: 700, color: primary, fontSize: "0.95rem" }}>{product.name}</Typography>
          {product.badge && (
            <Chip label={product.badge} size="small" sx={{ bgcolor: `${accent}18`, color: accent, fontSize: "0.6rem", fontWeight: 700, height: 18 }} />
          )}
        </Box>
        {product.description && (
          <Typography
            variant="caption"
            sx={{ color: "#888", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}
          >
            {product.description}
          </Typography>
        )}
        {product.category && (
          <Typography variant="caption" sx={{ color: "#bbb", textTransform: "uppercase", letterSpacing: 1, fontSize: "0.6rem", mt: 0.5, display: "block" }}>
            {product.category}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 1.5, flexShrink: 0 }}>
        <Box sx={{ textAlign: "right" }}>
          <Typography sx={{ fontWeight: 800, color: primary }}>{product.price}</Typography>
          {product.originalPrice && (
            <Typography variant="caption" sx={{ textDecoration: "line-through", color: "#ccc" }}>{product.originalPrice}</Typography>
          )}
        </Box>
        <Button
          size="small"
          variant="contained"
          onClick={(e) => { e.stopPropagation(); onQuote(); }}
          sx={{
            bgcolor: accent, color: "#fff", fontWeight: 700,
            borderRadius: 999, px: 2, fontSize: "0.72rem", whiteSpace: "nowrap",
            "&:hover": { bgcolor: accent, filter: "brightness(0.9)" },
          }}
        >
          Get a Quote
        </Button>
      </Box>
    </Box>
  );
}

export default StoreCatalogTemplate;
