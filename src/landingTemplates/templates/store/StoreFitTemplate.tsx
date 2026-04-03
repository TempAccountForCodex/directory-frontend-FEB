import React from "react";
import { Box, Button, Container, Stack, TextField, Typography } from "@mui/material";
import FadeIn from "../../blocks/FadeIn";
import { TemplateProps } from "../../templateEngine/types";

const headingFont = '"Space Grotesk", "Helvetica Neue", Arial, sans-serif';
const bodyFont = '"Inter", "Segoe UI", sans-serif';

const palette = {
  bg: "#020202",
  paper: "#ecefe7",
  text: "#f4f4f1",
  muted: "rgba(255,255,255,0.7)",
  line: "rgba(255,255,255,0.12)",
  darkText: "#0b0b0b",
};

const fallbackHero =
  "https://c.pxhere.com/photos/8d/e4/skate_skateboard_skateboarder_board_skateboarding_park_black_close_up-977847.jpg!d";
const fallbackAbout =
  "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=1400&q=80";
const fallbackProducts = [
  {
    id: "fit-1",
    name: "Dual Torque Truck",
    category: "Truck",
    price: "$45.00",
    description: "Precision aluminium truck designed for balanced carving and stable landings.",
    image:
      "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fit-2",
    name: "Street Energy Deck",
    category: "Deck",
    price: "$75.00",
    description: "Responsive maple deck shaped for technical street skating and everyday sessions.",
    image:
      "https://c.pxhere.com/photos/8d/e4/skate_skateboard_skateboarder_board_skateboarding_park_black_close_up-977847.jpg!d",
  },
  {
    id: "fit-3",
    name: "Reflex 52mm Wheel",
    category: "Wheel",
    price: "$25.00",
    description: "Fast-rolling wheel with a smooth core built for city surfaces and quick turns.",
    image:
      "https://images.unsplash.com/photo-1518459031867-a89b944bffe4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "fit-4",
    name: "Black Hex Pack",
    category: "Hardware",
    price: "$10.00",
    description: "Clean low-profile hardware set to lock your setup in without distraction.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  },
];

const navItems = [
  { label: "Shop", id: "products" },
  { label: "About", id: "about" },
  { label: "Contact", id: "contact" },
];

const StoreFitTemplate: React.FC<TemplateProps> = ({ data }) => {
  const products = (data.products?.length ? data.products.slice(0, 4) : fallbackProducts).map(
    (product, index) => ({
      ...product,
      image: product.image || fallbackProducts[index % fallbackProducts.length].image,
      category: product.category || fallbackProducts[index % fallbackProducts.length].category,
      description:
        product.description || fallbackProducts[index % fallbackProducts.length].description,
    }),
  );

  const heroImage = data.heroBannerUrl || data.gallery?.[0]?.url || fallbackHero;
  const aboutImage = data.gallery?.[1]?.url || data.gallery?.[2]?.url || fallbackAbout;

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) return;
    const top = section.getBoundingClientRect().top + window.scrollY - 56;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const handlePrimaryAction = () => {
    if (data.contact.email) {
      window.location.href = `mailto:${data.contact.email}`;
      return;
    }

    if (data.contact.phone) {
      window.location.href = `tel:${data.contact.phone}`;
    }
  };

  return (
    <Box sx={{ bgcolor: palette.bg, color: palette.text, fontFamily: bodyFont }}>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: "rgba(2,2,2,0.94)",
          borderBottom: `1px solid ${palette.line}`,
        }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 1.5, md: 3 }, py: 0.85 }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "140px 1fr auto" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.42rem",
                letterSpacing: "0.08em",
                textTransform: "none",
                color: "rgba(255,255,255,0.92)",
              }}
            >
              {data.name}
            </Typography>

            <Stack
              direction="row"
              justifyContent="center"
              spacing={2}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {navItems.map((item) => (
                <Typography
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                  fontSize: "0.42rem",
                  letterSpacing: "0.04em",
                    color: "rgba(255,255,255,0.88)",
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            <Button
              onClick={() => scrollToSection("contact")}
              sx={{
                minWidth: 0,
                px: 1.1,
                py: 0.28,
                border: "1px solid rgba(255,255,255,0.48)",
                borderRadius: "2px",
                color: "#fff",
                fontSize: "0.4rem",
                letterSpacing: "0.06em",
                textTransform: "none",
              }}
            >
              Contact
            </Button>
          </Box>
        </Container>
      </Box>

      <Box
        id="hero"
        data-preview-section="true"
        data-preview-label="Hero"
        sx={{ bgcolor: palette.paper, color: palette.darkText }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 1.5, md: 3 }, py: { xs: 3.5, md: 4.2 } }}>
          <FadeIn>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "2.85rem", sm: "4.4rem", md: "5.9rem", lg: "6.65rem" },
                lineHeight: 0.9,
                letterSpacing: "-0.07em",
                textTransform: "uppercase",
                textAlign: "center",
                whiteSpace: { md: "nowrap" },
              }}
            >
              Elevate your game
            </Typography>
          </FadeIn>

          <Typography
            sx={{
              mt: 1.1,
              maxWidth: 355,
              mx: "auto",
              textAlign: "center",
              fontSize: "0.4rem",
              lineHeight: 1.7,
              color: "rgba(0,0,0,0.68)",
            }}
          >
            Welcome to {data.name}, where passion meets premium design. Explore a curated
            skate selection built for quality rides and clean everyday setups.
          </Typography>

          <Box sx={{ mt: 1, display: "flex", justifyContent: "center" }}>
            <Button
              onClick={() => scrollToSection("products")}
              sx={{
                px: 1.7,
                py: 0.38,
                bgcolor: "#fff",
                color: palette.darkText,
                border: "1px solid rgba(0,0,0,0.18)",
                borderRadius: 999,
                fontSize: "0.4rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              Explore Now
            </Button>
          </Box>

          <Box sx={{ mt: 0.8, height: { xs: 135, sm: 190, md: 250 }, overflow: "hidden" }}>
            <Box
              component="img"
              src={heroImage}
              alt={data.name}
              sx={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "center center" }}
            />
          </Box>
        </Container>
      </Box>

      <Box
        id="products"
        data-preview-section="true"
        data-preview-label="Products"
        sx={{ py: { xs: 4.2, md: 4.8 } }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 1.5, md: 3 } }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: { xs: "flex-start", md: "end" },
              justifyContent: "space-between",
              gap: 1.2,
            }}
          >
            <Box sx={{ maxWidth: 420 }}>
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "2rem", md: "2.65rem" },
                  lineHeight: 0.96,
                  letterSpacing: "-0.05em",
                }}
              >
                Our Products
              </Typography>
              <Typography sx={{ mt: 0.65, fontSize: "0.42rem", lineHeight: 1.7, color: palette.muted, maxWidth: 300 }}>
                Explore our curated product gallery featuring boards, trucks, wheels, and
                accessories for all skill levels. Quality images and detailed descriptions
                help you gear up for your next adventure.
              </Typography>
            </Box>

            <Button
              onClick={handlePrimaryAction}
              sx={{
                px: 1.5,
                py: 0.4,
                bgcolor: "#fff",
                color: palette.darkText,
                borderRadius: 999,
                fontSize: "0.38rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              Shop
            </Button>
          </Box>

          <Box
            sx={{
              mt: 1.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              gap: 0.9,
            }}
          >
            {products.map((product) => (
              <FadeIn key={product.id}>
                <Box>
                  <Box
                    sx={{
                      bgcolor: "#f5f5f1",
                      height: { xs: 120, md: 190 },
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      component="img"
                      src={product.image}
                      alt={product.name}
                      sx={{ width: "100%", height: "100%", objectFit: "contain", p: 1.5 }}
                    />
                  </Box>
                  <Typography sx={{ mt: 0.45, fontSize: "0.34rem", color: "rgba(255,255,255,0.86)" }}>
                    {product.name}
                  </Typography>
                  <Typography sx={{ mt: 0.15, fontSize: "0.32rem", color: "rgba(255,255,255,0.56)" }}>
                    {product.price}
                  </Typography>
                </Box>
              </FadeIn>
            ))}
          </Box>
        </Container>
      </Box>

      <Box
        id="about"
        data-preview-section="true"
        data-preview-label="About"
        sx={{ py: { xs: 4, md: 4.8 } }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 1.5, md: 3 } }}>
          <Typography
            sx={{
              fontFamily: headingFont,
              fontSize: { xs: "2rem", md: "2.65rem" },
              lineHeight: 0.96,
              letterSpacing: "-0.05em",
            }}
          >
            About Our Skate Shop
          </Typography>

          <Box
            sx={{
              mt: 1,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 2, md: 3 },
              alignItems: "start",
            }}
          >
            <Typography sx={{ fontSize: "0.42rem", lineHeight: 1.7, color: palette.muted, maxWidth: 315 }}>
              At {data.name}, we are dedicated to providing our skating community with quality
              skateboards, accessories, and curated products for every rider.
            </Typography>

            <Box>
              <Typography sx={{ fontSize: "0.42rem", lineHeight: 1.7, color: palette.muted, maxWidth: 280 }}>
                Whether you are a beginner finding your first board or an experienced skater
                upgrading your setup, we offer trusted gear and a clean shopping experience.
              </Typography>
              <Button
                onClick={() => scrollToSection("contact")}
                sx={{
                  mt: 1,
                  px: 1.6,
                  py: 0.38,
                  bgcolor: "#fff",
                  color: palette.darkText,
                  borderRadius: 999,
                  fontSize: "0.38rem",
                  textTransform: "none",
                  "&:hover": { bgcolor: "#fff" },
                }}
              >
                Learn More
              </Button>
            </Box>
          </Box>

          <Box
            sx={{
              mt: 1.2,
              ml: { xs: 0, md: "43%" },
              width: { xs: "100%", md: "52%" },
              height: { xs: 200, md: 255 },
              overflow: "hidden",
            }}
          >
            <Box
              component="img"
              src={aboutImage}
              alt="About skate shop"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
        </Container>
      </Box>

      <Box
        id="contact"
        data-preview-section="true"
        data-preview-label="Contact"
        sx={{ py: { xs: 4.5, md: 5.2 } }}
      >
        <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 1.5, md: 3 } }}>
          <Typography
            sx={{
              fontFamily: headingFont,
              fontSize: { xs: "2rem", md: "2.65rem" },
              lineHeight: 0.96,
              letterSpacing: "-0.05em",
            }}
          >
            Get in Touch
          </Typography>
          <Typography sx={{ mt: 0.7, maxWidth: 220, fontSize: "0.42rem", lineHeight: 1.7, color: palette.muted }}>
            We are here to help you find the right gear for your skateboarding needs.
          </Typography>

          <Box sx={{ mt: 2.2, maxWidth: 430, mx: { xs: 0, md: "auto" } }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 0.8,
              }}
            >
              <TextField
                placeholder="First name*"
                size="small"
                sx={fieldStyles}
              />
              <TextField
                placeholder="Last name*"
                size="small"
                sx={fieldStyles}
              />
            </Box>
            <TextField placeholder="Email*" size="small" fullWidth sx={{ ...fieldStyles, mt: 0.8 }} />
            <TextField placeholder="Message" size="small" fullWidth sx={{ ...fieldStyles, mt: 0.8 }} />
            <Button
              onClick={handlePrimaryAction}
              fullWidth
              sx={{
                mt: 1,
                py: 0.5,
                bgcolor: "#fff",
                color: palette.darkText,
                borderRadius: 999,
                fontSize: "0.4rem",
                textTransform: "none",
                "&:hover": { bgcolor: "#fff" },
              }}
            >
              Contact
            </Button>
          </Box>
        </Container>
      </Box>

      <Box component="footer" sx={{ borderTop: `1px solid ${palette.line}`, py: { xs: 2.4, md: 3 } }}>
        <Container maxWidth={false} sx={{ maxWidth: 1280, px: { xs: 1.5, md: 3 } }}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto" },
              gap: 2.5,
              alignItems: "end",
            }}
          >
            <Box>
              <Typography sx={{ fontSize: "0.34rem", color: "rgba(255,255,255,0.44)" }}>
                © 2026 //
              </Typography>
              <Typography sx={{ mt: 1.1, fontSize: "0.34rem", color: "rgba(255,255,255,0.6)" }}>
                {data.socialLinks?.instagram ? "IG" : ""} {data.socialLinks?.facebook ? "FB" : ""}{" "}
                {data.socialLinks?.twitter ? "X" : ""}
              </Typography>
            </Box>

            <Box sx={{ maxWidth: 330 }}>
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: "0.58rem",
                  textAlign: { xs: "left", md: "right" },
                }}
              >
                Grind Out Skate
              </Typography>
              <Typography
                sx={{
                  mt: 1,
                  fontSize: "0.34rem",
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.58)",
                  textAlign: { xs: "left", md: "right" },
                }}
              >
                {data.contact.address || "123 Skate Avenue"}
                <br />
                {data.contact.email || "hello@example.com"}
                <br />
                {data.contact.phone || "(555) 000-0000"}
              </Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

const fieldStyles = {
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    borderRadius: 0,
    fontSize: "0.42rem",
    minHeight: 30,
    "& fieldset": {
      borderColor: "rgba(255,255,255,0.22)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,0.4)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(255,255,255,0.7)",
    },
    "& input::placeholder": {
      color: "rgba(255,255,255,0.56)",
      opacity: 1,
    },
  },
};

export default StoreFitTemplate;
