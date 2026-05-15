import React, { useMemo, useState } from "react";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Facebook, Instagram, Mail, Twitter } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import FadeIn from "../../blocks/FadeIn";

const visualAssets = {
  hero: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  band: "https://img.freepik.com/free-photo/modern-living-room-with-elegant-decor-comfortable-sofa-generative-ai_188544-8691.jpg?t=st=1773352993~exp=1773356593~hmac=6c2af845b69e04b537df7e61d453248bcb1c81e6b25d95d99d467cec089160f5&w=2000",
  about:
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
  cookOne:
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  cookTwo:
    "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
  cookThree:
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=900&q=80",
};

const headingFont =
  '"Avenir Next Condensed", "Montserrat", "Arial Black", sans-serif';
const bodyFont =
  '"Avenir Next", "Segoe UI", "Helvetica Neue", Arial, sans-serif';

const makeTicker = (items: string[]) =>
  Array.from({ length: 8 }, (_, index) => items[index % items.length]).join(
    " • ",
  );

const wavePath =
  "M0,180 C180,136 360,96 540,118 C720,140 900,212 1080,198 C1260,184 1440,108 1620,120 C1800,132 1980,206 2160,192 C2340,178 2520,112 2700,126 C2880,140 3060,214 3240,198 C3420,182 3600,116 3780,130";

const StoreBasicTemplate: React.FC<TemplateProps> = ({ data }) => {
  const products = data.products?.slice(0, 3) || [];
  const fallbackProducts = useMemo(
    () => [
      {
        id: "basic-1",
        name: "Luna Curve Sofa",
        price: "$1,890",
        category: "3-Seater",
        description:
          "Soft sculpted silhouette with deep seating, tailored upholstery, and a calm contemporary profile.",
        image:
          "https://img.freepik.com/free-photo/interior-lifestyle-decoration-room-white_1203-4467.jpg?uid=R205766258&ga=GA1.1.355267885.1764683677&semt=ais_rp_progressive&w=740&q=80",
      },
      {
        id: "basic-2",
        name: "Harbor Modular Sofa",
        price: "$2,460",
        category: "Sectional",
        description:
          "Flexible modular seating system designed for open-plan living rooms and refined everyday comfort.",
        image:
          "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=700&q=80",
      },
      {
        id: "basic-3",
        name: "Studio Linen Sofa",
        price: "$1,640",
        category: "Compact",
        description:
          "Compact urban sofa with linen texture, relaxed proportions, and warm minimalist detailing.",
        image:
          "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=700&q=80",
      },
    ],
    [],
  );

  const featuredProducts = (products.length ? products : fallbackProducts).map(
    (product, index) => ({
      ...product,
      image:
        product.image ||
        fallbackProducts[index % fallbackProducts.length].image,
    }),
  );

  const articleCards = [
    {
      title: "How to choose the right sofa size",
      description: "Living room planning",
      image: featuredProducts[0]?.image || visualAssets.cookOne,
    },
    {
      title: "Fabric vs performance upholstery",
      description: "What suits your lifestyle",
      image: featuredProducts[1]?.image || visualAssets.cookTwo,
    },
    {
      title: "Styling a modern seating area",
      description: "Layout and layering ideas",
      image: featuredProducts[2]?.image || visualAssets.cookThree,
    },
  ];

  const socialLinks = [
    { key: "instagram", icon: Instagram },
    { key: "twitter", icon: Twitter },
    { key: "facebook", icon: Facebook },
  ].filter((item) =>
    Boolean(data.socialLinks?.[item.key as keyof typeof data.socialLinks]),
  );

  const [sizes, setSizes] = useState<Record<string, string>>(
    Object.fromEntries(
      featuredProducts.map((product) => [product.id, "Standard"]),
    ),
  );

  const navItems = [
    { label: "Shop", id: "products" },
    { label: "About", id: "about" },
    { label: "Contact", id: "contact" },
  ];
  const logoSrc =
    data.logoUrl || "https://cdn-icons-png.freepik.com/128/1198/1198419.png";
  const tickerText = makeTicker([
    "Modern sofas for calm interiors",
    "Built for any furniture brand story",
    "Comfort shaped with contemporary lines",
  ]);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#8c6d5a",
        color: "#f7f1ea",
        fontFamily: bodyFont,
        scrollBehavior: "smooth",
      }}
    >
      <Box sx={{ maxWidth: 1240, mx: "auto", px: { xs: 2, md: 4 } }}>
        <Box
          component="header"
          sx={{
            py: 2.5,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Box
            component="button"
            type="button"
            onClick={() => scrollToSection("hero")}
            sx={{
              display: "flex",
              alignItems: "center",
              background: "transparent",
              border: 0,
              p: 0,
              cursor: "pointer",
            }}
          >
            <Box
              component="img"
              src={logoSrc}
              alt={`${data.name} logo`}
              sx={{
                height: { xs: 34, md: 42 },
                width: "auto",
                maxWidth: { xs: 120, md: 170 },
                objectFit: "contain",
                display: "block",
                filter: data.logoUrl ? "none" : "brightness(0) invert(1)",
              }}
            />
          </Box>
          <Stack
            direction="row"
            spacing={2.5}
            sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}
          >
            {navItems.map((item) => (
              <Box
                key={item.label}
                component="button"
                type="button"
                onClick={() => scrollToSection(item.id)}
                sx={{
                  fontSize: "0.78rem",
                  color: "rgba(247,241,234,0.88)",
                  cursor: "pointer",
                  background: "transparent",
                  border: 0,
                  p: 0,
                  fontFamily: bodyFont,
                }}
              >
                {item.label}
              </Box>
            ))}
          </Stack>
        </Box>

        <Box id="hero" sx={{ pt: { xs: 4, md: 3 }, pb: { xs: 7, md: 9 } }}>
          <FadeIn>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "4.8rem", sm: "6.6rem", md: "8.8rem" },
                lineHeight: 0.88,
                letterSpacing: "-0.06em",
                textTransform: "uppercase",
                textAlign: "center",
                color: "#f7f1ea",
              }}
            >
              Live softer
            </Typography>
          </FadeIn>

          <FadeIn delay={0.08} direction="up">
            <Box
              sx={{
                mt: { xs: -0.5, md: -1.5 },
                mx: "auto",
                width: { xs: "100%", md: "78%" },
                aspectRatio: "1.9 / 1",
                overflow: "hidden",
                borderRadius: "50%",
                bgcolor: "#735746",
              }}
            >
              <Box
                component="img"
                src={visualAssets.hero}
                alt={data.name}
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
          </FadeIn>

          <Box
            sx={{
              mt: 5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
              gap: 4,
              alignItems: "start",
            }}
          >
            <FadeIn>
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "2.5rem", md: "3.25rem" },
                  lineHeight: 0.92,
                  textTransform: "none",
                  maxWidth: 360,
                }}
              >
                Modern Sofas.
                <br />
                Styled Better.
              </Typography>
            </FadeIn>
            <FadeIn delay={0.12}>
              <Typography
                sx={{
                  maxWidth: 520,
                  color: "rgba(247,241,234,0.88)",
                  lineHeight: 1.8,
                  fontSize: "0.98rem",
                }}
              >
                {data.description ||
                  "This layout is structured to work across industries, but the default demo content now presents a modern sofa brand with editorial storytelling, product highlights, and design-led merchandising."}
              </Typography>
            </FadeIn>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          overflow: "hidden",
          py: { xs: 0.5, md: 1 },
          color: "#f6efe7",
          mt: { xs: -1, md: -0.5 },
        }}
      >
        <Box
          sx={{
            width: "300%",
            minWidth: 2400,
            animation: "storeBasicWave 28s linear infinite",
          }}
        >
          <Box
            component="svg"
            viewBox="0 0 3780 260"
            preserveAspectRatio="none"
            sx={{
              width: "100%",
              height: { xs: 120, md: 168 },
              display: "block",
              overflow: "visible",
            }}
          >
            <path id="store-basic-wave" d={wavePath} fill="none" />
            <text
              fill="#f6efe7"
              style={{
                fontFamily: headingFont,
                fontSize: "clamp(28px, 3vw, 46px)",
                fontWeight: 800,
                letterSpacing: "-0.04em",
                textTransform: "uppercase",
              }}
            >
              <textPath
                href="#store-basic-wave"
                startOffset="0%"
                method="align"
                spacing="auto"
              >
                {tickerText}
              </textPath>
            </text>
          </Box>
        </Box>
      </Box>

      <Box
        id="products"
        sx={{
          maxWidth: 1240,
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 9 },
        }}
      >
        <FadeIn>
          <Typography
            sx={{
              fontFamily: headingFont,
              fontSize: { xs: "3rem", md: "4.4rem" },
              lineHeight: 0.92,
              textTransform: "uppercase",
              maxWidth: 620,
              mb: 5,
            }}
          >
            Discover our
            <br />
            top sofas.
          </Typography>
        </FadeIn>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
            gap: { xs: 4, md: 5 },
          }}
        >
          {featuredProducts.map((product, index) => (
            <FadeIn
              key={product.id}
              delay={0.06 * index}
              direction={index % 2 === 0 ? "up" : "left"}
            >
              <Box>
                <Box
                  sx={{
                    bgcolor: "#f2ede8",
                    px: 3,
                    pt: 2,
                    pb: 3,
                    minHeight: 230,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    component="img"
                    src={product.image}
                    alt={product.name}
                    sx={{
                      width: 120,
                      height: 160,
                      objectFit: "cover",
                      borderRadius: 1.5,
                    }}
                  />
                </Box>
                <Typography sx={{ mt: 1.7, fontWeight: 700, color: "#f7f1ea" }}>
                  {product.name}
                </Typography>
                <Typography
                  sx={{
                    mt: 0.3,
                    fontSize: "0.84rem",
                    color: "rgba(247,241,234,0.8)",
                  }}
                >
                  {product.price}
                </Typography>
                <Typography
                  sx={{
                    mt: 1.3,
                    color: "rgba(247,241,234,0.88)",
                    lineHeight: 1.7,
                    fontSize: "0.9rem",
                  }}
                >
                  {product.description}
                </Typography>
                <Box
                  component="select"
                  value={sizes[product.id] || "8oz"}
                  onChange={(event) =>
                    setSizes((current) => ({
                      ...current,
                      [product.id]: event.target.value,
                    }))
                  }
                  sx={{
                    mt: 2.2,
                    width: "100%",
                    height: 38,
                    border: 0,
                    bgcolor: "#f2ede8",
                    color: "#2c231f",
                    px: 1.5,
                    fontFamily: bodyFont,
                  }}
                >
                  <option value="Standard">Standard</option>
                  <option value="Performance Fabric">Performance Fabric</option>
                  <option value="Premium Linen">Premium Linen</option>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    mt: 1.25,
                    borderRadius: 999,
                    borderColor: "rgba(247,241,234,0.82)",
                    color: "#f7f1ea",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#f7f1ea",
                      bgcolor: "rgba(247,241,234,0.08)",
                    },
                  }}
                >
                  View details
                </Button>
              </Box>
            </FadeIn>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          height: { xs: 240, md: 620 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            // Use the variable here
            backgroundImage: `url(${visualAssets.band})`,
            backgroundPosition: "center",
            backgroundSize: "cover",
            /* This creates the fixed/parallax effect */
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat",
            zIndex: 0,
            opacity: 0.8, // Keeping your original opacity
            /* Adding a fallback for mobile as some mobile browsers don't support fixed attachment */
            "@media (max-width: 900px)": {
              backgroundAttachment: "scroll",
            },
          }}
        />
      </Box>

      <Box id="journal" sx={{ bgcolor: "white", color: "#8c6d5a" }}>
        <Box
          sx={{
            maxWidth: 1240,
            mx: "auto",
            px: { xs: 2, md: 4 },
            py: { xs: 7, md: 10 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
              gap: 5,
              alignItems: "center",
            }}
          >
            <Box>
              <FadeIn>
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "3rem", md: "4.3rem" },
                    lineHeight: 0.92,
                    textTransform: "uppercase",
                    maxWidth: 340,
                  }}
                >
                  About
                  <br />
                  The Brand
                </Typography>
              </FadeIn>
              <FadeIn delay={0.08}>
                <Typography
                  sx={{
                    mt: 2.5,
                    maxWidth: 420,
                    lineHeight: 1.9,
                    color: "#8c6d5a",
                  }}
                >
                  {data.tagline ||
                    "Tell the founder or company story here. The layout stays flexible for any product-led brand, while this version demonstrates a clean modern sofa collection."}
                </Typography>
              </FadeIn>
            </Box>
            <FadeIn delay={0.12} direction="left">
              <Box
                sx={{
                  width: { xs: "100%", md: 420 },
                  maxWidth: "100%",
                  ml: { md: "auto" },
                  aspectRatio: "0.82 / 1",
                  borderRadius: "46% 46% 0 0",
                  overflow: "hidden",
                  bgcolor: "#735746",
                }}
              >
                <Box
                  component="img"
                  src={visualAssets.about}
                  alt="Founder portrait"
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </Box>
            </FadeIn>
          </Box>
        </Box>
      </Box>

      <Box id="about" sx={{ bgcolor: "#171312", color: "#f3efe9" }}>
        <Box
          sx={{
            maxWidth: 1240,
            mx: "auto",
            px: { xs: 2, md: 4 },
            pt: { xs: 6, md: 7 },
            pb: { xs: 4, md: 5 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.9fr 0.8fr 1.3fr" },
            gap: 4,
          }}
        >
          <FadeIn>
            <Box>
              {navItems.map((item) => (
                <Box
                  key={item.label}
                  component="button"
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    mb: 1.1,
                    fontSize: "0.95rem",
                    display: "block",
                    color: "inherit",
                    background: "transparent",
                    border: 0,
                    p: 0,
                    cursor: "pointer",
                    fontFamily: bodyFont,
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Box>
          </FadeIn>
          <FadeIn delay={0.08}>
            <Box>
              <Typography
                sx={{
                  mb: 1.3,
                  fontSize: "0.85rem",
                  color: "rgba(243,239,233,0.64)",
                }}
              >
                Connect with us
              </Typography>
              <Stack direction="row" spacing={1.2}>
                {socialLinks.map(({ key, icon: Icon }) => (
                  <Box
                    key={key}
                    sx={{
                      width: 30,
                      height: 30,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(243,239,233,0.2)",
                      borderRadius: "50%",
                    }}
                  >
                    <Icon size={14} />
                  </Box>
                ))}
              </Stack>
            </Box>
          </FadeIn>
          <FadeIn delay={0.16}>
            <Box id="contact">
              <Typography
                sx={{ fontSize: "0.85rem", color: "rgba(243,239,233,0.64)" }}
              >
                Newsletter
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  maxWidth: 420,
                  lineHeight: 1.8,
                  color: "rgba(243,239,233,0.78)",
                }}
              >
                Drop your email below for new launches, product updates, and
                campaign announcements.
              </Typography>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.25}
                sx={{ mt: 2.5 }}
              >
                <TextField
                  fullWidth
                  placeholder="Email Address"
                  size="small"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 0,
                      bgcolor: "#f3efe9",
                      minHeight: 48,
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<Mail size={14} />}
                  sx={{
                    minWidth: 120,
                    borderRadius: 999,
                    color: "#f3efe9",
                    borderColor: "rgba(243,239,233,0.6)",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#f3efe9",
                      bgcolor: "rgba(243,239,233,0.06)",
                    },
                  }}
                >
                  Sign Up
                </Button>
              </Stack>
            </Box>
          </FadeIn>
        </Box>

        <Box
          sx={{
            maxWidth: 1240,
            mx: "auto",
            px: { xs: 2, md: 4 },
            pb: { xs: 3, md: 4 },
          }}
        >
          <FadeIn>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "4rem", md: "7.4rem" },
                lineHeight: 0.9,
                letterSpacing: "-0.06em",
                color: "#f3efe9",
                textTransform: "none",
              }}
            >
              Take A Seat.
            </Typography>
          </FadeIn>
        </Box>
      </Box>

      <Box
        sx={{
          "@keyframes storeBasicWave": {
            from: { transform: "translateX(0)" },
            to: { transform: "translateX(-66.6667%)" },
          },
        }}
      />
    </Box>
  );
};

export default StoreBasicTemplate;
