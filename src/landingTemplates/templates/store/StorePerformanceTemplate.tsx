import React from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import FadeIn from "../../blocks/FadeIn";
import type { TemplateProps } from "../../templateEngine/types";

const neon = "#46ff16";
const bg = "#050505";
const panel = "#0a0a0a";
const gridLine = "rgba(70,255,22,0.28)";
const muted = "rgba(179, 255, 162, 0.68)";

const fallbackHero =
  "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1800&q=80";
const fallbackPromo =
  "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&fit=crop&w=1600&q=80";
const fallbackAbout =
  "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=1200&q=80";

const fallbackProducts = [
  {
    id: "perf-1",
    name: "Loop Resistance Bands",
    category: "Accessories",
    price: "$25.00",
    image:
      "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=800&q=80",
    description:
      "Portable loop bands for mobility, warmups, and strength sessions.",
  },
  {
    id: "perf-2",
    name: "Cast Iron Kettlebell",
    category: "Equipment",
    price: "$70.00",
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80",
    description:
      "Powder-coated competition-style kettlebell for powerful full-body work.",
  },
  {
    id: "perf-3",
    name: "Handle Resistance Bands",
    category: "Conditioning",
    price: "$40.00",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    description:
      "Heavy training rope built for HIIT circuits and high-output sessions.",
  },
  {
    id: "perf-4",
    name: "Adjustable Dumbbells Set",
    category: "Accessories",
    price: "$150.00",
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?auto=format&fit=crop&w=800&q=80",
    description:
      "Adjustable speed rope for cardio, agility, and endurance training.",
  },
  {
    id: "perf-5",
    name: "Olympic Weight Plate",
    category: "Strength",
    price: "$95.00",
    image:
      "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80",
    description:
      "Durable plate for barbell work, deadlifts, and progressive overload sessions.",
  },
  {
    id: "perf-6",
    name: "Pull-Up Assist Bands",
    category: "Accessories",
    price: "$35.00",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=800&q=80",
    description:
      "Supportive resistance bands for pull-up progressions, mobility, and recovery.",
  },
  {
    id: "perf-7",
    name: "Training Bench",
    category: "Equipment",
    price: "$210.00",
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80",
    description:
      "Stable flat bench built for dumbbell presses, rows, and core-focused sessions.",
  },
  {
    id: "perf-8",
    name: "Foam Roller Pro",
    category: "Recovery",
    price: "$28.00",
    image:
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    description:
      "High-density recovery roller for warm-ups, cooldowns, and muscle release.",
  },
];

const faqItems = [
  {
    question: "How quickly do orders ship?",
    answer:
      "Most orders dispatch within 1 to 2 business days. Heavy equipment and custom bundles may take slightly longer.",
  },
  {
    question: "Do you offer gym or studio bundles?",
    answer:
      "Yes. We support home gyms, trainers, and boutique fitness spaces with custom bundle pricing and equipment planning.",
  },
  {
    question: "Can I request product guidance before ordering?",
    answer:
      "Yes. Use the contact details below to ask for recommendations based on your training style, space, and budget.",
  },
];

const productRows = [
  {
    title: "Home Gym Equipment",
    subtitle: "Enhance Your Space",
    description:
      "Our home gym equipment is designed to elevate your workout experience and add a touch of style to your space. Explore our range of premium products.",
  },
  {
    title: "Commercial Gym Gear",
    subtitle: "Boost Your Business",
    description:
      "For commercial fitness facilities, we offer top-of-the-line gym gear that ensures durability and performance. Check out our selection for your business needs.",
  },
  {
    title: "Special Accessories",
    subtitle: "Perfect Your Routine",
    description:
      "Discover the accessories that complete a stronger training setup, from recovery tools to compact add-ons that refine every session.",
  },
];

const navItems = [
  { label: "About", sectionId: "about-us" },
  { label: "Products", sectionId: "products" },
  { label: "FAQs", sectionId: "faqs" },
  { label: "Contact", sectionId: "contact" },
];

const StorePerformanceTemplate: React.FC<TemplateProps> = ({ data }) => {
  const products = data.products?.length ? data.products : fallbackProducts;
  const heroImage = data.heroBannerUrl || fallbackHero;
  const aboutImage = data.gallery?.[1]?.url || fallbackAbout;
  const promoImage = data.gallery?.[2]?.url || fallbackPromo;
  const sliderRef = React.useRef<HTMLDivElement | null>(null);
  const aboutSectionRef = React.useRef<HTMLDivElement | null>(null);
  const { scrollYProgress: aboutScrollProgress } = useScroll({
    target: aboutSectionRef,
    offset: ["start end", "end start"],
  });
  const aboutImageScale = useTransform(
    aboutScrollProgress,
    [0, 0.45, 1],
    [1.18, 1.08, 1],
  );

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    const headerOffset = 92;
    const targetTop =
      target.getBoundingClientRect().top + window.scrollY - headerOffset;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: "smooth",
    });
  };

  const scrollProducts = (direction: "left" | "right") => {
    const slider = sliderRef.current;
    if (!slider) return;

    const amount = Math.min(slider.clientWidth * 0.82, 420);
    slider.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
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

  return (
    <Box
      sx={{
        bgcolor: bg,
        color: neon,
        fontFamily: '"Oswald", "Arial Narrow", "Roboto Condensed", sans-serif',
        scrollBehavior: "smooth",
      }}
    >
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          bgcolor: "rgba(3,3,3,0.96)",
          borderBottom: `1px solid ${gridLine}`,
        }}
      >
        <FadeIn direction="down">
          <Box
            sx={{
              maxWidth: 1440,
              mx: "auto",
              px: { xs: 2, md: 3 },
              py: 2.5,
              display: "grid",
              gridTemplateColumns: { xs: "1fr auto", md: "180px 1fr auto" },
              alignItems: "center",
              gap: 2,
            }}
          >
            <FadeIn direction="right" delay={0.04}>
              <Typography
                sx={{
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  fontSize: "0.85rem",
                }}
              >
                {data.name.toUpperCase()}
              </Typography>
            </FadeIn>

            <Stack
              direction="row"
              spacing={3}
              justifyContent="center"
              sx={{
                display: { xs: "none", md: "flex" },
                alignItems: "center",
              }}
            >
              {navItems.map((item) => (
                <Typography
                  key={item.label}
                  onClick={() => scrollToSection(item.sectionId)}
                  sx={{
                    color: muted,
                    fontSize: "0.72rem",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    transition: "color 180ms ease, transform 180ms ease",
                    "&:hover": {
                      color: neon,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            <FadeIn direction="left" delay={0.14}>
              <Button
                component={motion.button}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollToSection("featured-products")}
                sx={{
                  minWidth: 0,
                  borderRadius: 999,
                  bgcolor: neon,
                  color: "#000",
                  px: 2.2,
                  py: 0.55,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  "&:hover": { bgcolor: neon },
                }}
              >
                Shop
              </Button>
            </FadeIn>
          </Box>
        </FadeIn>
      </Box>

      <Box
        id="hero"
        data-preview-section="true"
        data-preview-label="Hero"
        sx={{
          maxWidth: "100%",
          mx: "auto",
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
        }}
      >
        <FadeIn direction="none">
          <Box
            sx={{
              position: "relative",
              minHeight: { xs: 420, md: 720 },
              backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 40%, rgba(0,0,0,0.38) 100%), url(${heroImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              borderBottom: `1px solid ${gridLine}`,
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.28) 58%, rgba(0,0,0,0.62) 100%)",
              }}
            />
            <Container maxWidth="xl">
              <Box
                sx={{
                  position: "relative",
                  zIndex: 1,
                  minHeight: { xs: 420, md: 620 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "flex-start",
                  px: { xs: 2.5, md: 4 },
                  pb: { xs: 3, md: 4 },
                  pt: { xs: 7, md: 10 },
                  maxWidth: 1120,
                }}
              >
                <Typography
                  sx={{
                    color: muted,
                    fontSize: "0.72rem",
                    letterSpacing: "0.26em",
                    textTransform: "uppercase",
                  }}
                >
                  Performance gear
                </Typography>
                <FadeIn direction="right" delay={0.1}>
                  <Typography
                    sx={{
                      mt: 1.2,
                      color: neon,
                      fontWeight: 900,
                      fontStyle: "italic",
                      lineHeight: 0.82,
                      letterSpacing: "-0.07em",
                      textTransform: "uppercase",
                      fontSize: { xs: "3.5rem", sm: "5.4rem", md: "8.4rem" },
                      textShadow: "0 0 30px rgba(70,255,22,0.16)",
                      transform: "skewX(-10deg)",
                      transformOrigin: "left center",
                    }}
                  >
                    Boost
                    <br />
                    Performance
                  </Typography>
                </FadeIn>
                <FadeIn direction="right" delay={0.18}>
                  <Typography
                    sx={{
                      mt: 1.4,
                      maxWidth: 430,
                      color: "rgba(255,255,255,0.78)",
                      fontSize: "0.82rem",
                      lineHeight: 1.7,
                      fontFamily: '"Inter", Arial, sans-serif',
                    }}
                  >
                    {data.description ||
                      "High-output training essentials for serious lifters, home gyms, and performance spaces that want a sharper edge."}
                  </Typography>
                </FadeIn>
              </Box>
            </Container>
          </Box>
        </FadeIn>
      </Box>

      <Box
        id="featured-products"
        data-preview-section="true"
        data-preview-label="Featured Products"
        sx={{
          maxWidth: "100%",
          mx: "auto",
          px: { xs: 2, md: 0 },
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
          borderBottom: `1px solid ${gridLine}`,
        }}
      >
        <FadeIn>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr auto" },
              alignItems: "center",
              gap: { xs: 2.5, md: 4 },
              px: { xs: 3, md: 4 },
              py: { xs: 3, md: 3.4 },
              bgcolor: neon,
              color: "#000",
              borderBottom: `1px solid ${gridLine}`,
            }}
          >
            <Container maxWidth="xl">
              <FadeIn direction="right" delay={0.06}>
                <Typography
                  sx={{
                    maxWidth: 860,
                    fontSize: { xs: "1.02rem", md: "1.18rem" },
                    lineHeight: 1.55,
                    fontFamily: '"Inter", Arial, sans-serif',
                  }}
                >
                  Welcome to {data.name}, your ultimate destination for
                  high-quality gym equipment. Start your fitness journey today
                  with our top-notch products.
                </Typography>
              </FadeIn>

              <FadeIn direction="left" delay={0.14}>
                <Button
                  component={motion.button}
                  whileHover={{ y: -2, scale: 1.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handlePrimaryAction}
                  sx={{
                    justifySelf: { xs: "flex-start", md: "flex-end" },
                    minWidth: 0,
                    borderRadius: 999,
                    bgcolor: "#000",
                    color: neon,
                    px: 3.2,
                    py: 0.95,
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    textTransform: "none",
                    "&:hover": { bgcolor: "#000" },
                  }}
                >
                  Shop Now
                </Button>
              </FadeIn>
            </Container>
          </Box>
        </FadeIn>

        <Box sx={{ px: { xs: 3, md: 4 }, py: { xs: 3.5, md: 4.5 } }}>
          <FadeIn>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "1.8rem", md: "2.15rem" },
                  fontWeight: 500,
                }}
              >
                All Products
              </Typography>

              <Stack direction="row" spacing={1}>
                <Button
                  component={motion.button}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => scrollProducts("left")}
                  sx={{
                    minWidth: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: `1px solid ${gridLine}`,
                    color: neon,
                  }}
                >
                  <ChevronLeftIcon fontSize="small" />
                </Button>
                <Button
                  component={motion.button}
                  whileHover={{ y: -2, scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => scrollProducts("right")}
                  sx={{
                    minWidth: 0,
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: `1px solid ${gridLine}`,
                    color: neon,
                  }}
                >
                  <ChevronRightIcon fontSize="small" />
                </Button>
              </Stack>
            </Box>
          </FadeIn>

          <Box
            ref={sliderRef}
            sx={{
              display: "flex",
              gap: { xs: 2, md: 2.5 },
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              pb: 1.5,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {products.map((product, index) => (
              <FadeIn key={product.id} delay={index * 0.07}>
                <Box
                  component={motion.div}
                  whileHover={{ y: -6 }}
                  sx={{
                    flex: "0 0 auto",
                    width: { xs: "82vw", sm: 320, md: 420 },
                    maxWidth: { xs: 320, md: 420 },
                    scrollSnapAlign: "start",
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: "#fff",
                      aspectRatio: { xs: "1 / 1", md: "1 / 0.98" },
                      overflow: "hidden",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      component="img"
                      src={
                        product.image ||
                        fallbackProducts[index % fallbackProducts.length].image
                      }
                      alt={product.name}
                      sx={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        display: "block",
                        p: { xs: 2, md: 2.5 },
                        filter: "contrast(1.08) saturate(0.9)",
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      mt: 0,
                      bgcolor: "#3a3a3a",
                      color: neon,
                      py: 1.3,
                      textAlign: "center",
                      fontSize: "0.88rem",
                      fontWeight: 500,
                    }}
                  >
                    Quick View
                  </Box>

                  <Box sx={{ pt: 2 }}>
                    <Typography
                      sx={{ color: neon, fontSize: "1rem", fontWeight: 500 }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      sx={{ mt: 0.5, color: neon, fontSize: "0.95rem" }}
                    >
                      {product.price}
                    </Typography>
                  </Box>
                </Box>
              </FadeIn>
            ))}
          </Box>
        </Box>
      </Box>

      <Box
        id="about-us"
        data-preview-section="true"
        data-preview-label="About Us"
        ref={aboutSectionRef}
        sx={{
          maxWidth: "100%",
          mx: "auto",
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
          borderBottom: `1px solid ${gridLine}`,
          borderTop: `1px solid ${gridLine}`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            minHeight: { xs: "auto", md: 710 },
          }}
        >
          <FadeIn>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                flexDirection: "column",
                p: { xs: 3, md: 20 },
                borderRight: { md: `1px solid ${gridLine}` },
                borderBottom: { xs: `1px solid ${gridLine}`, md: "none" },
                bgcolor: bg,
                minHeight: { xs: "auto", md: 710 },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: "3rem", md: "4rem" },
                  lineHeight: 0.95,
                  fontWeight: 500,
                  letterSpacing: "-0.05em",
                }}
              >
                About Us
              </Typography>
              <Typography
                sx={{
                  mt: { xs: 3, md: 5 },
                  color: neon,
                  lineHeight: 1.28,
                  fontSize: { xs: "1.05rem", sm: "1.45rem", md: "1.95rem" },
                  fontFamily: '"Inter", Arial, sans-serif',
                  maxWidth: 520,
                }}
              >
                At {data.name}, we are dedicated to providing premium gym
                equipment for both home and commercial use. Our focus is to
                offer durable products and expert advice to help you achieve
                your fitness goals effectively.
              </Typography>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08} direction="left">
            <Box
              sx={{
                minHeight: { xs: 340, md: 710 },
                bgcolor: "#111",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <Box
                component={motion.img}
                src={aboutImage}
                alt="About"
                style={{ scale: aboutImageScale }}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  position: "absolute",
                  inset: 0,
                  transformOrigin: "center center",
                }}
              />
            </Box>
          </FadeIn>
        </Box>
      </Box>

      <Box
        id="products"
        data-preview-section="true"
        data-preview-label="Products"
        sx={{
          maxWidth: "100%",
          mx: "auto",
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
          borderBottom: `1px solid ${gridLine}`,
        }}
      >
        <FadeIn>
          <Box
            sx={{
              px: { xs: 3, md: 20 },
              py: { xs: 3, md: 4 },
              borderBottom: `1px solid ${gridLine}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem" },
                lineHeight: 0.95,
                fontWeight: 500,
                letterSpacing: "-0.05em",
              }}
            >
              Products
            </Typography>

            <Button
              component={motion.button}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              sx={{
                minWidth: 0,
                borderRadius: 999,
                bgcolor: neon,
                color: "#000",
                px: { xs: 2.4, md: 3.8 },
                py: { xs: 0.8, md: 1.2 },
                fontSize: { xs: "0.82rem", md: "1rem" },
                fontWeight: 500,
                textTransform: "none",
                "&:hover": { bgcolor: neon },
              }}
            >
              View All
            </Button>
          </Box>
        </FadeIn>

        {productRows.map((row, index) => (
          <FadeIn key={row.title} delay={index * 0.08}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                borderBottom:
                  index < productRows.length - 1
                    ? `1px solid ${gridLine}`
                    : "none",
              }}
            >
              <Box
                sx={{
                  px: { xs: 3, md: 20 },
                  py: { xs: 3.5, md: 6 },
                  borderRight: { md: `1px solid ${gridLine}` },
                  minHeight: { xs: "auto", md: 300 },
                  display: "flex",
                  alignItems: "flex-start",
                  gap: { xs: 2, md: 3 },
                }}
              >
                <Typography
                  sx={{
                    color: neon,
                    fontSize: { xs: "1.5rem", md: "2rem" },
                    lineHeight: 1,
                    pt: { xs: 0.35, md: 0.5 },
                    flexShrink: 0,
                  }}
                >
                  ✺
                </Typography>
                <Box>
                  <Typography
                    sx={{
                      fontSize: { xs: "2rem", md: "3.8rem" },
                      lineHeight: 0.95,
                      fontWeight: 400,
                      letterSpacing: "-0.05em",
                      maxWidth: 420,
                    }}
                  >
                    {row.title}
                  </Typography>
                  <Typography
                    sx={{
                      mt: { xs: 2.5, md: 5 },
                      color: neon,
                      fontSize: { xs: "1.2rem", md: "2rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    {row.subtitle}
                  </Typography>
                </Box>
              </Box>
              <Box
                sx={{
                  px: { xs: 3, md: 4 },
                  py: { xs: 3.5, md: 6 },
                  minHeight: { xs: "auto", md: 300 },
                  display: "flex",
                  alignItems: "center",
                  borderTop: { xs: `1px solid ${gridLine}`, md: "none" },
                }}
              >
                <Typography
                  sx={{
                    color: neon,
                    lineHeight: 1.6,
                    fontSize: { xs: "1rem", md: "1.2rem" },
                    fontFamily: '"Inter", Arial, sans-serif',
                    maxWidth: 430,
                  }}
                >
                  {row.description}
                </Typography>
              </Box>
            </Box>
          </FadeIn>
        ))}
      </Box>

      <Box
        id="performance-banner"
        data-preview-section="true"
        data-preview-label="Performance Banner"
        sx={{
          maxWidth: "100%",
          mx: "auto",
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
          borderBottom: `1px solid ${gridLine}`,
        }}
      >
        <FadeIn direction="none">
          <Box
            component={motion.div}
            whileInView={{ scale: [1.04, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            sx={{
              position: "relative",
              minHeight: { xs: 260, md: 420 },
              backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.32) 100%), url(${promoImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                borderTop: `1px solid ${gridLine}`,
                borderBottom: `1px solid ${gridLine}`,
              }}
            />
          </Box>
        </FadeIn>
      </Box>

      <Box
        id="faqs"
        data-preview-section="true"
        data-preview-label="FAQs"
        sx={{
          maxWidth: "100%",
          mx: "auto",
          px: { xs: 2, md: 4 },
          py: { xs: 7, md: 9 },
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
          borderBottom: `1px solid ${gridLine}`,
        }}
      >
        <FadeIn>
          <Typography
            sx={{
              textAlign: "center",
              fontSize: { xs: "1.8rem", md: "2.4rem" },
              fontWeight: 700,
            }}
          >
            FAQs
          </Typography>
        </FadeIn>
        <Box sx={{ maxWidth: 860, mx: "auto", mt: 4 }}>
          {faqItems.map((item, index) => (
            <FadeIn key={item.question} delay={index * 0.07}>
              <Accordion
                disableGutters
                elevation={0}
                sx={{
                  bgcolor: "transparent",
                  color: neon,
                  borderBottom: `1px solid ${gridLine}`,
                  "&::before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: neon }} />}
                >
                  <Typography sx={{ fontWeight: 600 }}>
                    {item.question}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography
                    sx={{
                      color: muted,
                      lineHeight: 1.8,
                      fontFamily: '"Inter", Arial, sans-serif',
                    }}
                  >
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </FadeIn>
          ))}
        </Box>
      </Box>

      <Box
        id="promotions"
        data-preview-section="true"
        data-preview-label="Promotions"
        sx={{
          maxWidth: "100%",
          mx: "auto",
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
          borderBottom: `1px solid ${gridLine}`,
          bgcolor: neon,
          color: "#000",
        }}
      >
        <FadeIn>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 0.8fr" },
              gap: 0,
            }}
          >
            <FadeIn direction="right">
              <Box
                sx={{
                  px: { xs: 3, md: 20 },
                  py: { xs: 3, md: 4 },
                  borderRight: { md: "1px solid rgba(0,0,0,0.15)" },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: "1.5rem", md: "4rem" },
                    fontWeight: 700,
                  }}
                >
                  Contact Us
                </Typography>
                <Box
                  component="form"
                  sx={{
                    mt: 2.5,
                    maxWidth: 520,
                    display: "grid",
                    gap: 1.5,
                  }}
                >
                  <Box
                    component="input"
                    type="text"
                    placeholder="Your Name"
                    sx={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.25)",
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: "#000",
                      px: 1.8,
                      py: 1.4,
                      fontSize: "0.98rem",
                      fontFamily: '"Inter", Arial, sans-serif',
                      outline: "none",
                      "&::placeholder": {
                        color: "rgba(0,0,0,0.62)",
                        opacity: 1,
                      },
                    }}
                  />
                  <Box
                    component="input"
                    type="email"
                    placeholder="Email Address"
                    sx={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.25)",
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: "#000",
                      px: 1.8,
                      py: 1.4,
                      fontSize: "0.98rem",
                      fontFamily: '"Inter", Arial, sans-serif',
                      outline: "none",
                      "&::placeholder": {
                        color: "rgba(0,0,0,0.62)",
                        opacity: 1,
                      },
                    }}
                  />
                  <Box
                    component="textarea"
                    placeholder="Tell us what gear you need"
                    rows={5}
                    sx={{
                      width: "100%",
                      border: "1px solid rgba(0,0,0,0.25)",
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: "#000",
                      px: 1.8,
                      py: 1.4,
                      fontSize: "0.98rem",
                      lineHeight: 1.6,
                      fontFamily: '"Inter", Arial, sans-serif',
                      outline: "none",
                      resize: "vertical",
                      "&::placeholder": {
                        color: "rgba(0,0,0,0.62)",
                        opacity: 1,
                      },
                    }}
                  />
                  <Box sx={{ pt: 0.6 }}>
                    <Button
                      component={motion.button}
                      whileHover={{ y: -2, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      sx={{
                        minWidth: 0,
                        borderRadius: 999,
                        bgcolor: "#000",
                        color: neon,
                        px: 3.4,
                        py: 1,
                        fontSize: "0.9rem",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#000" },
                      }}
                    >
                      Send Inquiry
                    </Button>
                  </Box>
                </Box>
              </Box>
            </FadeIn>
            <FadeIn direction="left" delay={0.08}>
              <Box sx={{ minHeight: 220, overflow: "hidden" }}>
                <Box
                  component={motion.img}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                  src={promoImage}
                  alt="Promotion"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>
            </FadeIn>
          </Box>
        </FadeIn>
      </Box>

      <Box
        id="cta"
        data-preview-section="true"
        data-preview-label="CTA"
        sx={{
          maxWidth: "100%",
          mx: "auto",
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
          borderBottom: `1px solid ${gridLine}`,
          background:
            "linear-gradient(180deg, #020402 0%, #071507 18%, #153c06 44%, #39d700 72%, #46ff16 100%)",
        }}
      >
        <FadeIn>
          <Box
            component={motion.div}
            whileInView={{ y: [26, 0], opacity: [0, 1] }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.85, ease: [0.22, 0.61, 0.36, 1] }}
            sx={{
              minHeight: { xs: 220, md: 500 },
              px: { xs: 3, md: 4 },
              py: { xs: 6, md: 8 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                color: neon,
                fontWeight: 900,
                fontStyle: "italic",
                textTransform: "uppercase",
                letterSpacing: "-0.08em",
                lineHeight: 0.9,
                textShadow: "0 0 32px rgba(70,255,22,0.14)",
                transform: "skewX(-10deg)",
                transformOrigin: "center center",
                fontSize: { xs: "4rem", md: "12.2rem" },
              }}
            >
              Let&apos;s Go!
            </Typography>
          </Box>
        </FadeIn>
      </Box>

      <Box
        id="contact"
        data-preview-section="true"
        data-preview-label="Contact"
        sx={{
          maxWidth: 1440,
          mx: "auto",
          borderLeft: `1px solid ${gridLine}`,
          borderRight: `1px solid ${gridLine}`,
          borderBottom: `1px solid ${gridLine}`,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.7fr 0.7fr" },
          }}
        >
          <FadeIn>
            <Box
              sx={{
                px: { xs: 3, md: 4 },
                py: 3,
                borderRight: { md: `1px solid ${gridLine}` },
                borderBottom: { xs: `1px solid ${gridLine}`, md: "none" },
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.82rem",
                  color: muted,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                }}
              >
                Need assistance?
              </Typography>
              <Typography
                sx={{
                  mt: 1.2,
                  fontSize: { xs: "1.3rem", md: "1.8rem" },
                  fontWeight: 700,
                }}
              >
                Contact our team for product help and gym setup guidance.
              </Typography>
              <Button
                component={motion.button}
                whileHover={{ y: -2, scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrimaryAction}
                endIcon={<ArrowOutwardIcon sx={{ fontSize: 16 }} />}
                sx={{
                  mt: 2.5,
                  borderRadius: 999,
                  bgcolor: neon,
                  color: "#000",
                  px: 2.6,
                  py: 0.75,
                  fontSize: "0.72rem",
                  fontWeight: 800,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  "&:hover": { bgcolor: neon },
                }}
              >
                Get support
              </Button>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Stack
              spacing={1.3}
              sx={{
                px: { xs: 3, md: 4 },
                py: 3,
                borderRight: { md: `1px solid ${gridLine}` },
                borderBottom: { xs: `1px solid ${gridLine}`, md: "none" },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone size={16} color={neon} />
                <Typography
                  sx={{
                    color: muted,
                    fontFamily: '"Inter", Arial, sans-serif',
                  }}
                >
                  {data.contact?.phone || "(555) 240-8800"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Mail size={16} color={neon} />
                <Typography
                  sx={{
                    color: muted,
                    fontFamily: '"Inter", Arial, sans-serif',
                  }}
                >
                  {data.contact?.email || "hello@boostperformance.co"}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <MapPin size={16} color={neon} />
                <Typography
                  sx={{
                    color: muted,
                    fontFamily: '"Inter", Arial, sans-serif',
                  }}
                >
                  {data.contact?.address ||
                    "122 Performance Ave, Los Angeles, CA"}
                </Typography>
              </Box>
            </Stack>
          </FadeIn>

          <FadeIn delay={0.16}>
            <Stack
              direction="row"
              spacing={1.2}
              alignItems="center"
              sx={{ px: { xs: 3, md: 4 }, py: 3 }}
            >
              <Box
                component={motion.div}
                whileHover={{ y: -3, scale: 1.06 }}
                sx={{ p: 1, border: `1px solid ${gridLine}`, display: "flex" }}
              >
                <Instagram size={16} color={neon} />
              </Box>
              <Box
                component={motion.div}
                whileHover={{ y: -3, scale: 1.06 }}
                sx={{ p: 1, border: `1px solid ${gridLine}`, display: "flex" }}
              >
                <Facebook size={16} color={neon} />
              </Box>
              <Box
                component={motion.div}
                whileHover={{ y: -3, scale: 1.06 }}
                sx={{ p: 1, border: `1px solid ${gridLine}`, display: "flex" }}
              >
                <Twitter size={16} color={neon} />
              </Box>
            </Stack>
          </FadeIn>
        </Box>
      </Box>
    </Box>
  );
};

export default StorePerformanceTemplate;
