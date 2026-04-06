import React from "react";
import { Box, Button, Chip, Container, Stack, TextField, Typography } from "@mui/material";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import EastIcon from "@mui/icons-material/East";
import { motion } from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";

const palette = {
  bg: "#050505",
  surface: "#111111",
  surfaceSoft: "#171717",
  border: "rgba(255,255,255,0.09)",
  text: "#f8f3ee",
  muted: "rgba(248,243,238,0.68)",
  accent: "#cbc3b8",
  chip: "rgba(255,255,255,0.1)",
};

const headingFont = '"Space Grotesk", "Segoe UI", sans-serif';
const bodyFont = '"Manrope", "Segoe UI", sans-serif';

const fallbackHero =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80";

const fallbackProducts = [
  {
    id: "fit-1",
    name: "Aero Sprint Runner",
    category: "Road",
    price: "$129",
    badge: "New",
    description: "Lightweight daily trainer with a responsive foam platform.",
    image:
      "https://starlet.pk/cdn/shop/files/0036_RD-M9927GRY-BLK_3_2ba40858-6a38-4fc1-8532-ec6aef9a516e.jpg?v=1762942071&width=720",
  },
  {
    id: "fit-2",
    name: "Cloud Pace Pink",
    category: "Women",
    price: "$118",
    badge: "Drop",
    description: "Soft-cushion silhouette built for long city runs.",
    image:
      "https://starlet.pk/cdn/shop/files/0032_RD-M9928Beige_2_e5aa7062-0933-4893-82f8-479d4f9c7aa8.jpg?v=1762942074&width=720",
  },
  {
    id: "fit-3",
    name: "Velocity Blue",
    category: "Men",
    price: "$124",
    badge: "Core",
    description: "Breathable engineered mesh and stable heel support.",
    image:
      "https://img.freepik.com/free-photo/fashion-shoes-sneakers_1203-7529.jpg?t=st=1775496484~exp=1775500084~hmac=5bf25427dafd2a3e5d35905287c1be10565d13db906581da24ba2f953b452e32&w=1480",
  },
  {
    id: "fit-4",
    name: "Night Track Pro",
    category: "Training",
    price: "$139",
    badge: "Sale",
    description: "All-black trainer with durable grip and sharp profile.",
    image:
      "https://starlet.pk/cdn/shop/files/RD-M9221SBlack_2.jpg?v=1757008667&width=720",
  },
  {
    id: "fit-5",
    name: "Studio White",
    category: "Lifestyle",
    price: "$112",
    badge: "Fresh",
    description: "Minimal low-top for everyday wear and clean wardrobes.",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "fit-6",
    name: "Rain Motion",
    category: "Outdoor",
    price: "$145",
    badge: "Limited",
    description: "Water-ready upper with reflective detailing for night runs.",
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1200&q=80",
  },
];

const fallbackStories = [
  {
    title: "All-round comfort",
    description: "Engineered foam, stable heel fit, and calm all-day wear.",
   
  },
  {
    title: "Classic styles are back",
    description: "Retro-inspired uppers return in new seasonal colorways.",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "What is hot now?",
    description: "Fast-moving drops shaped by sport, music, and streetwear.",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80",
  },
];

const marqueeItems = [
  "Flyknit",
  "Air Unit",
  "Dry Foam",
  "Cloud Ride",
  "Speed Mesh",
  "Grip Sole",
];

const whyChooseItems = [
  {
    title: "Performance-first curation",
    description:
      "Every release is selected for comfort, durability, and everyday wearability rather than trend alone.",
  },
  {
    title: "Fast seasonal drops",
    description:
      "Fresh silhouettes, limited colorways, and campaign-led edits keep the catalog moving without losing focus.",
  },
  {
    title: "Built for modern retail",
    description:
      "Clear product storytelling, premium imagery, and simple contact paths make the shopping experience feel sharp.",
  },
];

const normalizeProductImage = (
  image: string | undefined,
  index: number,
) => fallbackProducts[index % fallbackProducts.length].image || image || fallbackHero;

const sectionTitleSx = {
  fontFamily: headingFont,
  fontWeight: 800,
  fontSize: { xs: "2.3rem", md: "3.6rem" },
  letterSpacing: "-0.06em",
  lineHeight: 0.92,
};

const revealUp = {
  initial: { opacity: 0, y: 34 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
} as const;

const revealSoft = {
  initial: { opacity: 0, scale: 0.98 },
  whileInView: { opacity: 1, scale: 1 },
  viewport: { once: true, amount: 0.16 },
  transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
} as const;

const cardReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  whileHover: { y: -8, scale: 1.01 },
  viewport: { once: true, amount: 0.14 },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
} as const;

const contactFieldSx = {
  "& .MuiOutlinedInput-root": {
    color: palette.text,
    borderRadius: "18px",
    backgroundColor: "rgba(255,255,255,0.03)",
    "& fieldset": {
      borderColor: palette.border,
    },
    "&:hover fieldset": {
      borderColor: "rgba(255,255,255,0.2)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(255,255,255,0.38)",
    },
  },
  "& .MuiInputBase-input::placeholder": {
    color: palette.muted,
    opacity: 1,
  },
} as const;

const StoreFitTemplate: React.FC<TemplateProps> = ({ data }) => {
  const products = (data.products?.length ? data.products : fallbackProducts).map(
    (product, index) => ({
      ...product,
      image: normalizeProductImage(product.image, index),
      category:
        product.category || fallbackProducts[index % fallbackProducts.length].category,
      badge: product.badge || fallbackProducts[index % fallbackProducts.length].badge,
      description:
        product.description ||
        fallbackProducts[index % fallbackProducts.length].description,
    }),
  );

  const heroProduct = products[0];
  const featureProduct = products[0];
  const arrivals = products.slice(1, 3);
  const hotOfferProducts = products.slice(0, 4);
  const lifestyleProduct = products[4] || products[0];
  const saleProduct = products[3] || products[0];
  const discoverProducts = products.slice(0, 3);

  const storyImages = (data.gallery?.length ? data.gallery : []).slice(0, 3);
  const stories = fallbackStories.map((story, index) => ({
    ...story,
    image: storyImages[index]?.url || story.image,
  }));

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const offset = 88;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  };

  const handlePrimaryAction = () => {
    if (data.contact?.email) {
      window.location.href = `mailto:${data.contact.email}`;
      return;
    }

    if (data.contact?.phone) {
      window.location.href = `tel:${data.contact.phone}`;
    }
  };

  const renderProductCard = (
    product: (typeof products)[number],
    options?: {
      compact?: boolean;
      caption?: string;
      minHeight?: number;
      badgeLabel?: string;
      imageOnly?: boolean;
    },
  ) => (
    <Box
      component={motion.div}
      {...cardReveal}
      sx={{
        position: "relative",
        height: "100%",
        minHeight: options?.minHeight || (options?.compact ? 220 : 300),
        borderRadius: "24px",
        overflow: "hidden",
        border: `1px solid ${palette.border}`,
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))",
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
          filter: "saturate(1.05) contrast(1.05)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.76) 78%, rgba(0,0,0,0.94) 100%)",
        }}
      />
      <Stack
        spacing={1}
        sx={{
          position: "absolute",
          inset: 0,
          p: { xs: 2, md: 2.5 },
          justifyContent: "flex-end",
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Chip
            label={options?.badgeLabel || product.badge || product.category}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              color: "#0f0f0f",
              fontWeight: 700,
              height: 24,
            }}
          />
          <Typography
            sx={{
              fontFamily: headingFont,
              fontSize: { xs: "1rem", md: "1.08rem" },
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#f7efe3",
              textShadow: "0 1px 10px rgba(0,0,0,0.25)",
            }}
          >
            {options?.imageOnly ? "" : product.price}
          </Typography>
        </Stack>
        {!options?.imageOnly ? (
          <Box>
            {options?.caption ? (
              <Typography sx={{ fontSize: "0.72rem", color: palette.muted, mb: 0.5 }}>
                {options.caption}
              </Typography>
            ) : null}
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: options?.compact ? "1rem" : "1.25rem",
                fontWeight: 700,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              {product.name}
            </Typography>
            <Typography
              sx={{
                mt: 0.6,
                maxWidth: 260,
                fontSize: "0.82rem",
                lineHeight: 1.55,
                color: palette.muted,
              }}
            >
              {product.description}
            </Typography>
          </Box>
        ) : null}
      </Stack>
    </Box>
  );

  return (
    <Box
      sx={{
        bgcolor: palette.bg,
        color: palette.text,
        fontFamily: bodyFont,
        "@keyframes storeFitMarquee": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-50%)" },
        },
      }}
    >
      <Box
        component="header"
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        component={motion.header}
        sx={{
          position: "fixed",
          top: { xs: 48, md: 48 },
          left: 0,
          right: 0,
          zIndex: 40,
          bgcolor: "rgba(255,255,255,0.98)",
          borderBottom: "1px solid rgba(15,15,15,0.08)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
          <Box
            sx={{
              minHeight: 84,
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "280px 1fr 180px" },
              gap: { xs: 1.5, md: 2 },
              alignItems: "center",
              py: { xs: 1.2, md: 1.4 },
            }}
          >
            <Typography
              sx={{
                fontFamily: headingFont,
                fontWeight: 800,
                letterSpacing: "-0.05em",
                fontSize: { xs: "2rem", md: "2.9rem" },
                color: "#0d0d0d",
                lineHeight: 0.95,
              }}
            >
              {data.name.toUpperCase()}
            </Typography>

            <Stack
              direction="row"
              spacing={{ xs: 2, md: 4.5 }}
              justifyContent="center"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {[
                { label: "Our products", id: "new-arrivals" },
                { label: "About", id: "about-us" },
                { label: "Contact", id: "contact" },
              ].map((item) => (
                <Typography
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    color: "#0d0d0d",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: 600,
                    "&:hover": { opacity: 0.68 },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            <Button
              onClick={() => scrollToSection("contact")}
              sx={{
                color: "#0d0d0d",
                justifySelf: "end",
                border: "1px solid rgba(15,15,15,0.12)",
                borderRadius: 999,
                px: 2.2,
                py: 0.95,
                textTransform: "none",
                fontWeight: 600,
                minWidth: 132,
              }}
            >
              Contact us
            </Button>
          </Box>
        </Container>
      </Box>


        <Box
          component={motion.div}
          {...revealSoft}
          id="hero"
          data-preview-section="true"
          data-preview-label="Hero"
          sx={{ pt: { xs: 2.2, md: 3 }, pb: { xs: 2.5, md: 3.5 }, mt: { xs: 8, md: 7.5 } }}
      
        >
          <Box
            sx={{
              position: "relative",
              height: { xs: 240, md: "86vh" },
              overflow: "hidden",
              border: `1px solid ${palette.border}`,
            }}
          >
            <Box
              component={motion.img}
              initial={{ scale: 1.08, opacity: 0.72 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              src={data.heroBannerUrl || heroProduct.image || fallbackHero}
              alt={data.name}
              sx={{
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
                  "linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.24) 55%, rgba(0,0,0,0.65) 100%)",
              }}
            />
            <Container maxWidth="lg" >
           
            <Stack
              component={motion.div}
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              spacing={2}
              sx={{
                position: "absolute",
                left: { xs: 20, md: 40, lg: 216 },
                top: { xs: 108, md: 118 },
                bottom: { xs: 20, md: 34 },
                maxWidth: { xs: 260, md: 360, lg: 420 },
                justifyContent: "flex-end",
              }}
            >
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: { xs: "2.5rem", md: "3.9rem", lg: "4.6rem" },
                  lineHeight: 0.9,
                  letterSpacing: "-0.06em",
                }}
              >
                Running
                <br />
                in the rain
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.98rem", md: "1.08rem", lg: "1.18rem" },
                  lineHeight: 1.45,
                  color: palette.muted,
                  maxWidth: { xs: 240, md: 320, lg: 360 },
                }}
              >
                {data.tagline ||
                  "Weather-ready footwear and everyday runners with a campaign-led look."}
              </Typography>
              <Button
                onClick={() => scrollToSection("new-arrivals")}
                sx={{
                  alignSelf: "flex-start",
                  bgcolor: "rgba(255,255,255,0.94)",
                  color: "#0d0d0d",
                  borderRadius: 999,
                  px: 1.9,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: { xs: "0.95rem", md: "1rem" },
                  "&:hover": { bgcolor: "#ffffff" },
                }}
              >
                Explore collection
              </Button>
            </Stack>

               </Container>
          </Box>
        </Box>


      <Container maxWidth="xl" sx={{  px: { xs: 2, md: 3 } }}>


        <Box
          component={motion.div}
          {...revealUp}
          id="new-arrivals"
          data-preview-section="true"
          data-preview-label="New Arrivals"
          sx={{ py: { xs: 2.2, md: 3 } }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2.4 }}
          >
            <Typography
              sx={sectionTitleSx}
            >
              New arrivals
            </Typography>
            <Button
              onClick={handlePrimaryAction}
              endIcon={<ArrowOutwardIcon />}
              sx={{
                color: palette.text,
                textTransform: "none",
                fontWeight: 600,
                fontSize: "1rem",
                minWidth: 0,
                px: 0,
              }}
            >
              Shop all
            </Button>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gridTemplateRows: { xs: "auto", md: "420px 320px" },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {arrivals.map((product) => (
              <Box key={product.id}>
                {renderProductCard(product, {
                  compact: true,
                  imageOnly: true,
                  badgeLabel: product.name,
                })}
              </Box>
            ))}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
                gap: 2,
                gridColumn: { xs: "auto", md: "1 / -1" },
                height: "100%",
                alignItems: "stretch",
              }}
            >
              <Box
                component={motion.div}
                {...cardReveal}
                sx={{
                  height: "100%",
                  minHeight: 280,
                  borderRadius: "24px",
                  border: `1px solid ${palette.border}`,
                  bgcolor: palette.surfaceSoft,
                  p: { xs: 2.2, md: 3 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontFamily: headingFont,
                      fontWeight: 800,
                      fontSize: { xs: "2.6rem", md: "4.2rem" },
                      lineHeight: 0.92,
                      letterSpacing: "-0.07em",
                    }}
                  >
                    Fabrix-
                    <br />
                    A36
                  </Typography>
                  <Typography sx={{ mt: 1.5, maxWidth: 360, color: palette.text }}>
                    Tackle this season with the newest aerodynamic footwear.
                  </Typography>
                </Box>
                <Button
                  onClick={handlePrimaryAction}
                  endIcon={<EastIcon />}
                  sx={{
                    alignSelf: "flex-start",
                    color: palette.bg,
                    bgcolor: palette.text,
                    borderRadius: 999,
                    textTransform: "none",
                    px: 2,
                    py: 0.9,
                    "&:hover": {
                      bgcolor: "#ffffff",
                    },
                  }}
                >
                  Shop Now
                </Button>
              </Box>
              {renderProductCard(featureProduct, {
                minHeight: 280,
                imageOnly: true,
                badgeLabel: "Fabrix-A36",
              })}
            </Box>
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          sx={{
            overflow: "hidden",
            borderTop: `1px solid ${palette.border}`,
            borderBottom: `1px solid ${palette.border}`,
            py: 1.1,
            my: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              width: "max-content",
              animation: "storeFitMarquee 22s linear infinite",
            }}
          >
            {[...marqueeItems, ...marqueeItems].map((item, index) => (
              <Typography
                key={`${item}-${index}`}
                sx={{
                  mr: 4,
                  fontSize: "0.82rem",
                  color: palette.muted,
                  whiteSpace: "nowrap",
                  "&::after": {
                    content: '"//"',
                    ml: 4,
                    color: "rgba(255,255,255,0.24)",
                  },
                }}
              >
                {item}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          id="hot-offer"
          data-preview-section="true"
          data-preview-label="Hot Offer"
          sx={{ py: { xs: 2.4, md: 3.2 } }}
        >
          <Typography
            sx={{
              mb: 1.8,
              ...sectionTitleSx,
            }}
          >
            Hot offer
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridAutoFlow: "column",
              gridAutoColumns: {
                xs: "minmax(260px, 78vw)",
                sm: "minmax(280px, 58vw)",
                md: "minmax(300px, 32vw)",
                lg: "minmax(320px, 1fr)",
              },
              gap: 2,
              overflowX: "auto",
              overscrollBehaviorX: "contain",
              pb: 1,
              scrollSnapType: "x proximity",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255,255,255,0.16)",
                borderRadius: 999,
              },
            }}
          >
            {hotOfferProducts.map((product) => (
              <Box
                key={`hot-offer-${product.id}`}
                sx={{ scrollSnapAlign: "start", minWidth: 0 }}
              >
                {renderProductCard(product, {
                  caption: "Limited price",
                  minHeight: 360,
                })}
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          id="weekly-inspiration"
          data-preview-section="true"
          data-preview-label="Weekly Inspiration"
          sx={{
            py: { xs: 2.6, md: 3.5 },
            px: { xs: 0, md: 0.4 },
          }}
        >
          <Box
            sx={{
              bgcolor: palette.surface,
              borderRadius: "28px",
              border: `1px solid ${palette.border}`,
              p: { xs: 2, md: 2.6 },
            }}
          >
            <Typography
              sx={sectionTitleSx}
            >
              Weekly inspiration
            </Typography>
            <Typography sx={{ mt: 0.4, mb: 2, color: palette.muted }}>
              Curated stories for you
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 1.5,
              }}
            >
              {stories.map((story) => (
                <Box
                  component={motion.div}
                  {...cardReveal}
                  key={story.title}
                  sx={{
                    position: "relative",
                    minHeight: 260,
                    borderRadius: "22px",
                    overflow: "hidden",
                  }}
                >
                  <Box
                    component="img"
                    src={story.image}
                    alt={story.title}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.16), rgba(0,0,0,0.86))",
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      left: 16,
                      right: 16,
                      bottom: 16,
                    }}
                  >
                    <Typography sx={{ fontWeight: 700 }}>{story.title}</Typography>
                    <Typography sx={{ mt: 0.5, fontSize: "0.82rem", color: palette.muted }}>
                      {story.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          id="about-us"
          data-preview-section="true"
          data-preview-label="About Us"
          sx={{ py: { xs: 2.8, md: 3.8 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.92fr 1.08fr" },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            <Box
              component={motion.div}
              {...cardReveal}
              sx={{
                minHeight: 380,
                borderRadius: "26px",
                border: `1px solid ${palette.border}`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.015))",
                p: { xs: 2.2, md: 3.2 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: "0.82rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.14em",
                    color: palette.muted,
                    mb: 1.2,
                  }}
                >
                  About Fabrix
                </Typography>
                <Typography sx={{ ...sectionTitleSx, mb: 1.5, maxWidth: 420 }}>
                  About us
                </Typography>
                <Typography
                  sx={{
                    maxWidth: 500,
                    color: palette.text,
                    fontSize: { xs: "1rem", md: "1.14rem" },
                    lineHeight: 1.82,
                  }}
                >
                  {data.description}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                  gap: 1.2,
                  pt: 2.2,
                }}
              >
                {[
                  { value: "2018", label: "Founded" },
                  { value: "24h", label: "Dispatch rhythm" },
                  { value: "Top-rated", label: "Community trust" },
                ].map((item) => (
                  <Box
                    key={item.label}
                    sx={{
                      borderRadius: "18px",
                      border: `1px solid ${palette.border}`,
                      bgcolor: "rgba(255,255,255,0.04)",
                      p: 1.4,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: headingFont,
                        fontWeight: 800,
                        fontSize: "1.45rem",
                        letterSpacing: "-0.05em",
                      }}
                    >
                      {item.value}
                    </Typography>
                    <Typography sx={{ mt: 0.5, color: palette.muted, fontSize: "0.86rem" }}>
                      {item.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              component={motion.div}
              {...cardReveal}
              sx={{
                position: "relative",
                minHeight: 380,
                borderRadius: "26px",
                overflow: "hidden",
                border: `1px solid ${palette.border}`,
              }}
            >
              <Box
                component="img"
                src={data.aboutImageUrl || data.heroBannerUrl || fallbackHero}
                alt="About Fabrix"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.7))",
                }}
              />

            </Box>
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          id="why-choose-us"
          data-preview-section="true"
          data-preview-label="Why Choose Us"
          sx={{ py: { xs: 2.6, md: 3.6 } }}
        >
          <Typography sx={{ ...sectionTitleSx, mb: 2.2 }}>
            Why choose us
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 2,
            }}
          >
            {whyChooseItems.map((item) => (
              <Box
                key={item.title}
                component={motion.div}
                {...cardReveal}
                sx={{
                  minHeight: 220,
                  borderRadius: "24px",
                  border: `1px solid ${palette.border}`,
                  bgcolor: palette.surfaceSoft,
                  p: { xs: 2.2, md: 2.6 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontWeight: 700,
                    fontSize: { xs: "1.35rem", md: "1.65rem" },
                    letterSpacing: "-0.04em",
                    lineHeight: 1,
                  }}
                >
                  {item.title}
                </Typography>
                <Typography sx={{ mt: 1.2, color: palette.muted, lineHeight: 1.7 }}>
                  {item.description}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          id="lifestyle"
          data-preview-section="true"
          data-preview-label="Lifestyle"
          sx={{ py: { xs: 1.2, md: 1.8 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {renderProductCard(lifestyleProduct, { compact: true, minHeight: 260 })}
            <Box
              component={motion.div}
              {...cardReveal}
              sx={{
                minHeight: 260,
                borderRadius: "24px",
                border: `1px solid ${palette.border}`,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                p: { xs: 2.2, md: 3 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: { xs: "1.9rem", md: "2.55rem" },
                  lineHeight: 0.96,
                  letterSpacing: "-0.06em",
                  maxWidth: 420,
                }}
              >
                Discover a new lifestyle with timeless footwear
              </Typography>
              <Typography
                sx={{
                  mt: 1.2,
                  maxWidth: 440,
                  color: palette.muted,
                  lineHeight: 1.7,
                }}
              >
                {data.description}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          id="sale-banner"
          data-preview-section="true"
          data-preview-label="Sale Banner"
          sx={{ py: { xs: 2.4, md: 3 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            {renderProductCard(saleProduct, { compact: true, minHeight: 250 })}
            <Box
              component={motion.div}
              {...cardReveal}
              sx={{
                minHeight: 250,
                borderRadius: "24px",
                overflow: "hidden",
                border: `1px solid ${palette.border}`,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.09))",
                p: { xs: 2.2, md: 3 },
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.12), transparent 42%)",
                }}
              />
              <Box sx={{ position: "relative" }}>
                <Typography sx={{ color: palette.muted, fontSize: "0.8rem" }}>
                  Limited promotion
                </Typography>
                <Typography
                  sx={{
                    mt: 1,
                    fontFamily: headingFont,
                    fontWeight: 800,
                    fontSize: { xs: "2.3rem", md: "3.55rem" },
                    lineHeight: 0.9,
                    letterSpacing: "-0.08em",
                  }}
                >
                  Save up
                  <br />
                  to 75%
                </Typography>
              </Box>
              <Button
                onClick={handlePrimaryAction}
                endIcon={<ArrowOutwardIcon />}
                sx={{
                  position: "relative",
                  alignSelf: "flex-start",
                  bgcolor: "rgba(255,255,255,0.92)",
                  color: "#0d0d0d",
                  borderRadius: 999,
                  px: 1.6,
                  py: 0.85,
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#ffffff" },
                }}
              >
                Shop sale
              </Button>
            </Box>
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          id="discover-more"
          data-preview-section="true"
          data-preview-label="Discover More"
          sx={{ py: { xs: 2.2, md: 3.2 } }}
        >
          <Typography
            sx={{
              mb: 1.6,
              ...sectionTitleSx,
            }}
          >
            Discover more
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
              gap: 1.5,
            }}
          >
            {discoverProducts.map((product) => (
              <Box
                component={motion.div}
                {...cardReveal}
                key={product.id}
                sx={{
                  minHeight: 250,
                  borderRadius: "22px",
                  overflow: "hidden",
                  position: "relative",
                  border: `1px solid ${palette.border}`,
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
                      "linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.82))",
                  }}
                />
                <Box sx={{ position: "absolute", left: 16, right: 16, bottom: 16 }}>
                  <Typography sx={{ fontWeight: 700 }}>{product.name}</Typography>
                  <Typography sx={{ mt: 0.5, fontSize: "0.8rem", color: palette.muted }}>
                    {product.category} edition
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
          <Typography
            sx={{
              mt: 1.6,
              fontFamily: headingFont,
              fontWeight: 700,
              fontSize: { xs: "1.35rem", md: "1.7rem" },
              letterSpacing: "-0.04em",
            }}
          >
            Deals & drops brought to your inbox
          </Typography>
          <Typography sx={{ mt: 0.6, maxWidth: 560, color: palette.muted }}>
            Join for new arrivals, sale alerts, and campaign picks selected each week.
          </Typography>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          id="contact"
          data-preview-section="true"
          data-preview-label="Contact"
          sx={{ pt: { xs: 2.5, md: 3.5 }, pb: { xs: 3, md: 4.5 } }}
        >
          <Box
            component={motion.div}
            {...revealSoft}
            sx={{
              maxWidth: 760,
              mx: "auto",
              borderRadius: "30px",
              border: `1px solid ${palette.border}`,
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.015))",
              p: { xs: 2.2, md: 3.2 },
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.82rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: palette.muted,
                mb: 1.1,
              }}
            >
              Contact us
            </Typography>
            <Typography
              sx={{
                ...sectionTitleSx,
                maxWidth: 560,
                mx: "auto",
              }}
            >
              Let’s build your next footwear drop
            </Typography>
            <Typography
              sx={{
                mt: 1,
                maxWidth: 560,
                mx: "auto",
                color: palette.muted,
                lineHeight: 1.7,
              }}
            >
              Share your collection idea, campaign theme, or custom store request
              and our team will get back to you quickly.
            </Typography>

            <Box
              sx={{
                mt: 3,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.4,
                textAlign: "left",
              }}
            >
              <TextField placeholder="Full name" size="small" fullWidth sx={contactFieldSx} />
              <TextField placeholder="Email address" size="small" fullWidth sx={contactFieldSx} />
              <TextField placeholder="Phone number" size="small" fullWidth sx={contactFieldSx} />
              <TextField placeholder="Brand / company" size="small" fullWidth sx={contactFieldSx} />
              <Box sx={{ gridColumn: { xs: "auto", md: "1 / -1" } }}>
                <TextField
                  placeholder="Tell us about your project"
                  size="small"
                  fullWidth
                  multiline
                  minRows={5}
                  sx={contactFieldSx}
                />
              </Box>
            </Box>

            <Button
              onClick={handlePrimaryAction}
              endIcon={<ArrowOutwardIcon />}
              sx={{
                mt: 2.2,
                bgcolor: palette.text,
                color: palette.bg,
                borderRadius: 999,
                px: 2.4,
                py: 1,
                textTransform: "none",
                fontWeight: 700,
                "&:hover": {
                  bgcolor: "#ffffff",
                },
              }}
            >
              Send enquiry
            </Button>

            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={{ xs: 1, md: 3 }}
              justifyContent="center"
              sx={{ mt: 2.4, color: palette.muted }}
            >
              {data.contact?.email ? <Typography>{data.contact.email}</Typography> : null}
              {data.contact?.phone ? <Typography>{data.contact.phone}</Typography> : null}
              {data.contact?.address ? <Typography>{data.contact.address}</Typography> : null}
            </Stack>
          </Box>
        </Box>

        <Box
          component={motion.div}
          {...revealUp}
          data-preview-section="true"
          data-preview-label="Footer"
          sx={{ pb: { xs: 3.5, md: 5 } }}
        >
          <Box
            component={motion.div}
            {...revealSoft}
            sx={{
              borderRadius: "28px",
              border: `1px solid ${palette.border}`,
              background:
                "radial-gradient(circle at top left, rgba(255,255,255,0.08), transparent 35%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))",
              p: { xs: 2.2, md: 3 },
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.25fr 0.7fr 0.7fr 1fr" },
                gap: 2.4,
                alignItems: "start",
              }}
            >
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  letterSpacing: "-0.04em",
                }}
              >
                {data.name.toUpperCase()}
              </Typography>
              <Box>
                <Typography sx={{ color: palette.muted, maxWidth: 360, lineHeight: 1.75 }}>
                  Campaign-led footwear retail for new drops, everyday silhouettes,
                  and premium product storytelling.
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                  {["Instagram", "Facebook", "Twitter"].map((item) => (
                    <Chip
                      key={item}
                      label={item}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.06)",
                        color: palette.text,
                        border: `1px solid ${palette.border}`,
                      }}
                    />
                  ))}
                </Stack>
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1.1 }}>Navigate</Typography>
                <Stack spacing={0.8}>
                  {["Our products", "About us", "Why choose us", "Contact"].map((item) => (
                    <Typography key={item} sx={{ color: palette.muted }}>
                      {item}
                    </Typography>
                  ))}
                </Stack>
              </Box>
             
              <Box>
                <Typography sx={{ fontWeight: 700, mb: 1.1 }}>Contact</Typography>
                <Stack spacing={0.8}>
                  {data.contact?.email ? (
                    <Typography sx={{ color: palette.text }}>{data.contact.email}</Typography>
                  ) : null}
                  {data.contact?.phone ? (
                    <Typography sx={{ color: palette.muted }}>{data.contact.phone}</Typography>
                  ) : null}
                  {data.contact?.address ? (
                    <Typography sx={{ color: palette.muted, lineHeight: 1.7 }}>
                      {data.contact.address}
                    </Typography>
                  ) : null}
                </Stack>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 2.4,
                pt: 1.8,
                borderTop: `1px solid ${palette.border}`,
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                gap: 1,
              }}
            >
              <Typography sx={{ color: palette.muted }}>
                © 2026 {data.name}. All rights reserved.
              </Typography>
              <Typography sx={{ color: palette.muted }}>
                Built for modern footwear brands.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default StoreFitTemplate;
