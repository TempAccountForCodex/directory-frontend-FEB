import React, { useMemo } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import { Facebook, Instagram, Mail, PawPrint, ShieldCheck, Smile, Twitter } from "lucide-react";
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
};

const fallbackLogo =
  "https://cdn-icons-png.freepik.com/128/616/616408.png";

const fallbackProducts = [
  {
    id: "premium-1",
    name: "Salmon Recipe Feast",
    price: "$29",
    category: "Dry Food",
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=900&q=80",
    description:
      "A flexible hero product slot suitable for featured formulas, signature items, or best-selling SKUs.",
  },
  {
    id: "premium-2",
    name: "Chicken Blend Bowl",
    price: "$24",
    category: "Nutrition",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1604542031658-5799ca5d7936?auto=format&fit=crop&w=900&q=80",
    description:
      "Reusable premium merchandising card for any packaged product category.",
  },
  {
    id: "premium-3",
    name: "Ocean Bites Formula",
    price: "$27",
    category: "Best Seller",
    badge: "Top Pick",
    image:
      "https://images.unsplash.com/photo-1571566882372-1598d88abd90?auto=format&fit=crop&w=900&q=80",
    description:
      "Designed to support product storytelling without looking tied to a single industry.",
  },
  {
    id: "premium-4",
    name: "Indoor Care Mix",
    price: "$31",
    category: "Wellness",
    badge: "Edit",
    image:
      "https://images.unsplash.com/photo-1548681528-6a5c45b66b42?auto=format&fit=crop&w=900&q=80",
    description: "Ideal for premium product rails, curated drops, and seasonal assortments.",
  },
  {
    id: "premium-5",
    name: "Vitality Formula",
    price: "$22",
    category: "Daily Use",
    badge: "Sale",
    image:
      "https://images.unsplash.com/photo-1511044568932-338cba0ad803?auto=format&fit=crop&w=900&q=80",
    description: "Clean, visual-first store card structure with room for any brand story.",
  },
];

const fallbackHero =
  "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=2000&q=80";
const fallbackAbout =
  "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=1400&q=80";
const fallbackBand =
  "https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&w=2000&q=80";
const fallbackTouch =
  "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=900&q=80";

const benefitItems = [
  {
    title: "Quality Assurance",
    subtitle: "Premium ingredients",
    description:
      "Use this row to explain your product promise, sourcing standards, or what makes the collection trustworthy.",
    icon: PawPrint,
  },
  {
    title: "Tailored Nutrition",
    subtitle: "Made for different needs",
    description:
      "This section works for category education, product differentiation, or purchase guidance across any store niche.",
    icon: ShieldCheck,
  },
  {
    title: "Customer Satisfaction",
    subtitle: "Support that converts",
    description:
      "A flexible row for guarantees, shipping confidence, aftercare, or why customers keep coming back.",
    icon: Smile,
  },
];

const StorePremiumTemplate: React.FC<TemplateProps> = ({ data }) => {
  const products = useMemo(() => {
    const source = data.products?.length ? data.products.slice(0, 5) : fallbackProducts;
    return source.map((product, index) => ({
      ...product,
      image: product.image || fallbackProducts[index % fallbackProducts.length].image,
      category:
        product.category || fallbackProducts[index % fallbackProducts.length].category,
      badge: product.badge || fallbackProducts[index % fallbackProducts.length].badge,
      description:
        product.description ||
        fallbackProducts[index % fallbackProducts.length].description,
    }));
  }, [data.products]);

  const heroImage = data.gallery?.[0]?.url || products[0]?.image || fallbackHero;
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

          <Stack direction="row" spacing={1.2} justifyContent="flex-end">
            <SearchIcon sx={{ fontSize: 18 }} />
            <FavoriteBorderOutlinedIcon sx={{ fontSize: 18 }} />
            <ShoppingBagOutlinedIcon sx={{ fontSize: 18 }} />
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
            {data.tagline || "Premium collection"}
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
            Unique Product
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
        }}
      />

      <Box id="collection" sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 7, md: 9 } }}>
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: headingFont,
            fontWeight: 700,
            fontSize: { xs: "1.8rem", md: "2.9rem" },
            letterSpacing: "-0.05em",
          }}
        >
          Explore the Collection
        </Typography>

        <Box
          sx={{
            mt: 4,
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(5, minmax(0, 1fr))" },
            gap: 0,
            borderLeft: `1px solid rgba(17,17,17,0.12)`,
            overflowX: { xs: "auto", md: "visible" },
          }}
        >
          {products.map((product) => (
            <Box
              key={product.id}
              sx={{
                minWidth: { xs: 160, md: "auto" },
                p: { xs: 1.8, md: 2.2 },
                borderRight: `1px solid rgba(17,17,17,0.12)`,
                borderTop: `1px solid rgba(17,17,17,0.12)`,
                borderBottom: `1px solid rgba(17,17,17,0.12)`,
                bgcolor: "#f4ebdd",
                textAlign: "center",
              }}
            >
              <Box
                component="img"
                src={product.image}
                alt={product.name}
                sx={{
                  width: "100%",
                  aspectRatio: "0.78 / 1",
                  objectFit: "contain",
                }}
              />
              <Typography
                sx={{
                  mt: 1.3,
                  fontSize: "0.68rem",
                  color: palette.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                {product.category}
              </Typography>
              <Typography
                sx={{
                  mt: 0.7,
                  minHeight: 42,
                  fontFamily: headingFont,
                  fontWeight: 700,
                  fontSize: "1.05rem",
                  lineHeight: 1.1,
                }}
              >
                {product.name}
              </Typography>
              <Typography sx={{ mt: 0.7, fontSize: "0.86rem" }}>
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
                "This premium store template is reusable across industries while keeping the same strong editorial structure for hero products, collection highlights, brand story, and lead capture."}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 6, md: 7 } }}>
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
              Use this campaign block for seasonal promotions, limited releases,
              bundle offers, or category-specific launches without changing the overall layout.
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

      <Box sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 7, md: 8.5 } }}>
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

      <Box id="contact" sx={{ maxWidth: 1280, mx: "auto", px: { xs: 2, md: 4 }, py: { xs: 7, md: 8.5 } }}>
        <Typography
          sx={{
            fontFamily: headingFont,
            fontWeight: 700,
            fontSize: { xs: "1.9rem", md: "3rem" },
            letterSpacing: "-0.05em",
            lineHeight: 0.95,
            mb: 3,
          }}
        >
          Get In Touch
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.8fr 1.2fr" },
            gap: { xs: 3.5, md: 6 },
            alignItems: "start",
          }}
        >
          <Box>
            <Box
              component="img"
              src={touchImage}
              alt="Contact"
              sx={{
                width: { xs: 180, md: 220 },
                aspectRatio: "1 / 1",
                objectFit: "cover",
              }}
            />
          </Box>

          <Box
            sx={{
              maxWidth: 500,
              p: { xs: 2.5, md: 3 },
              border: `1px solid rgba(17,17,17,0.24)`,
              bgcolor: "#f4ebdd",
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.6,
              }}
            >
              <TextField label="Name" variant="outlined" fullWidth />
              <TextField label="Email" variant="outlined" fullWidth />
            </Box>
            <TextField label="Phone" variant="outlined" fullWidth sx={{ mt: 1.6 }} />
            <TextField
              label="Message"
              variant="outlined"
              fullWidth
              multiline
              minRows={4}
              sx={{ mt: 1.6 }}
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

      <Box sx={{ borderTop: `1px solid ${palette.border}`, py: { xs: 5, md: 6 } }}>
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
              <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
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
              <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Contact
              </Typography>
              <Typography sx={{ mt: 1.3, color: palette.muted, fontSize: "0.9rem", lineHeight: 1.9 }}>
                {data.contact?.email || "hello@brandstore.co"}
                <br />
                {data.contact?.phone || "+1 (555) 420 1188"}
              </Typography>
            </Box>

            <Box>
              <Typography sx={{ fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase" }}>
                Visit
              </Typography>
              <Typography sx={{ mt: 1.3, color: palette.muted, fontSize: "0.9rem", lineHeight: 1.9 }}>
                {data.contact?.address || "245 Mercer Street, New York, NY"}
              </Typography>

              <Stack direction="row" spacing={1.2} sx={{ mt: 1.8 }}>
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  const href =
                    data.socialLinks?.[item.key as keyof typeof data.socialLinks] || "#";

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
