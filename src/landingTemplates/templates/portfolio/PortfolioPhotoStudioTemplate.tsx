import React, { useMemo } from "react";
import { Box, Button, Stack, Typography, Container } from "@mui/material";
import { keyframes } from "@mui/system";
import {
  ArrowUpRight,
  Camera,
  Instagram,
  Mail,
  Star,
  Twitter,
} from "lucide-react";
import { motion, cubicBezier } from "framer-motion";
import FadeIn from "../../blocks/FadeIn";
import type { TemplateProps } from "../../templateEngine/types";

const headingFont = '"Space Grotesk", "Avenir Next", "Segoe UI", sans-serif';
const bodyFont = '"Inter", "Segoe UI", sans-serif';

const fallbackImages = {
  hero: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=80",
  introOne:
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
  introTwo:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  service:
    "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=900&q=80",
  story:
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  collageOne:
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
  collageTwo:
    "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=900&q=80",
  collageThree:
    "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  collageFour:
    "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?auto=format&fit=crop&w=900&q=80",
  footer:
    "https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=1200&q=80",
};

const fallbackFaq = [
  {
    q: "Do you work on both studio and outdoor shoots?",
    a: "Yes. This template supports portrait, editorial, family, fashion, and lifestyle photography services.",
  },
  {
    q: "Can this layout work for any photo niche?",
    a: "Yes. The structure is reusable for wedding, newborn, product, travel, or commercial photography businesses.",
  },
  {
    q: "How do clients usually enquire?",
    a: "The template is enquiry-first, so the CTAs are built around consultations, booking requests, and direct contact.",
  },
];

const brandMarks = [
  "LOOK",
  "FRAME",
  "MUSE",
  "AVENUE",
  "PIXEL",
  "LUXE",
  "VOGUE",
  "TONE",
];

const showcaseImages = {
  primary:
    "https://www.wordpress-dev.codeinsolution.com/snapify/wp-content/uploads/sites/51/2024/04/model-with-art-make-up-posing-on-dark-background-e1713864875767.jpg",
  secondary:
    "https://www.wordpress-dev.codeinsolution.com/snapify/wp-content/uploads/sites/51/2024/04/beauty-portrait-woman-with-pink-hair-creative-vivid-coloring-bright-colored-highlights-and-shadows-e1713864894495.jpg",
};

const driftUp = keyframes`
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(-12px) scale(1.015); }
  100% { transform: translateY(0px) scale(1); }
`;

const driftDown = keyframes`
  0% { transform: translateY(0px) scale(1); }
  50% { transform: translateY(14px) scale(1.02); }
  100% { transform: translateY(0px) scale(1); }
`;

const textRevealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
};

const textRevealWord = {
  hidden: { y: "110%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: {
      duration: 0.72,
      ease: cubicBezier(0.22, 1, 0.36, 1),
    },
  },
};

const TextReveal: React.FC<{ text: string; sx?: Record<string, unknown> }> = ({
  text,
  sx,
}) => (
  <Box
    component={motion.div}
    variants={textRevealContainer}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.45 }}
    sx={sx}
  >
    {text.split(" ").map((word, index) => (
      <Box
        key={`${word}-${index}`}
        component="span"
        sx={{
          display: "inline-block",
          overflow: "hidden",
          mr: "0.22em",
          verticalAlign: "top",
        }}
      >
        <Box
          component={motion.span}
          variants={textRevealWord}
          sx={{ display: "inline-block" }}
        >
          {word}
        </Box>
      </Box>
    ))}
  </Box>
);

const PortfolioPhotoStudioTemplate: React.FC<TemplateProps> = ({ data }) => {
  const gallery = data.gallery?.length ? data.gallery : [];
  const portfolioItems = useMemo(
    () =>
      (data.portfolioItems?.length ? data.portfolioItems : [])
        .slice(0, 8)
        .map((item, index) => ({
          ...item,
          image:
            item.image ||
            [
              fallbackImages.collageOne,
              fallbackImages.collageTwo,
              fallbackImages.collageThree,
              fallbackImages.collageFour,
            ][index % 4],
        })),
    [data.portfolioItems],
  );

  const services = data.services?.slice(0, 5) || [
    {
      name: "Portrait Photography",
      description: "Editorial and personal portrait sessions.",
    },
    {
      name: "Brand Shoots",
      description: "Visual identity photography for modern brands.",
    },
    {
      name: "Family Sessions",
      description: "Warm, expressive storytelling for families.",
    },
    {
      name: "Fashion Editorial",
      description: "Campaign imagery with strong visual direction.",
    },
    {
      name: "Studio Retouching",
      description: "Polished color and detail refinement.",
    },
  ];

  const stats = data.stats?.slice(0, 3) || [
    { label: "Projects", value: "240+" },
    { label: "Client rating", value: "5%" },
    { label: "Years", value: "10+" },
  ];

  const reviews = data.reviews?.slice(0, 1) || [
    {
      author: "Studio client",
      rating: 5,
      text: "The shoot felt effortless and the final images carried exactly the mood we wanted.",
      date: "2026",
    },
  ];

  const socialLinks = [
    { key: "instagram", icon: Instagram },
    { key: "twitter", icon: Twitter },
  ].filter((item) =>
    Boolean(data.socialLinks?.[item.key as keyof typeof data.socialLinks]),
  );

  const heroImage =
    data.heroBannerUrl || gallery[0]?.url || fallbackImages.hero;
  const recentWorkImage =
    portfolioItems[0]?.image || fallbackImages.collageThree;

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box sx={{ bgcolor: "#f3f3f3", color: "#111", fontFamily: bodyFont }}>
      <Box
        sx={{
          minHeight: { xs: "92vh", md: "100vh" },
          position: { xs: "relative", md: "sticky" },
          top: 0,
          color: "#fff",
          zIndex: 0,
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.68) 0%, rgba(0,0,0,0.18) 45%, rgba(0,0,0,0.62) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px)",
            backgroundSize: { xs: "100% 100%", md: "25% 100%" },
            pointerEvents: "none",
            opacity: 0.5,
          }}
        />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 1440,
            mx: "auto",
            px: { xs: 2, md: 4 },
            pt: { xs: 2, md: 2.2 },
            pb: { xs: 3, md: 3.5 },
            minHeight: { xs: "92vh", md: "100vh" },
            display: "grid",
            gridTemplateRows: "auto 1fr auto",
          }}
        >
          <Box
            component="header"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr auto 1fr" },
              alignItems: "start",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.3,
                }}
              >
                {data.contact?.email || "hello@studio.com"}
              </Typography>
              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  lineHeight: 1.3,
                }}
              >
                {data.contact?.phone || "+234 123 456 7890"}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              justifyContent="center"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <Camera size={20} />
              <Typography
                sx={{
                  fontFamily: headingFont,
                  fontSize: "1.05rem",
                  fontWeight: 700,
                }}
              >
                TARGET
              </Typography>
            </Stack>

            <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
              <Typography sx={{ fontSize: { xs: "1rem", md: "1.05rem" } }}>
                Photographer
              </Typography>
              <Typography
                sx={{
                  mt: 0.3,
                  fontSize: { xs: "1rem", md: "1.05rem" },
                  color: "rgba(255,255,255,0.78)",
                }}
              >
                Nigeria, Netherlands.
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "260px 1fr 240px" },
              gap: { xs: 3, md: 2.5 },
              alignItems: "stretch",
              pt: { xs: 4, md: 5 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", md: "center" },
              }}
            >
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: -48, y: 24, rotate: -4 }}
                whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{
                  duration: 0.95,
                  delay: 0.18,
                  ease: [0.22, 1, 0.36, 1],
                }}
                sx={{
                  width: { xs: 220, md: 260 },
                  p: 1,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.12)",
                  border: "1px solid rgba(255,255,255,0.16)",
                  backdropFilter: "blur(12px)",
                  animation: `${driftUp} 7.5s ease-in-out infinite`,
                  transition: "transform 300ms ease, box-shadow 300ms ease",
                  "&:hover": {
                    transform: "translateY(-6px)",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.3)",
                  },
                }}
              >
                <Box
                  component="img"
                  src={recentWorkImage}
                  alt="Recent work"
                  sx={{
                    width: "100%",
                    aspectRatio: "1.1 / 1",
                    objectFit: "cover",
                    borderRadius: 1.3,
                    objectPosition: "top",
                    transition: "transform 500ms ease",
                    ".MuiBox-root:hover &": {
                      transform: "scale(1.04)",
                    },
                  }}
                />
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: "0.9rem",
                    color: "rgba(255,255,255,0.9)",
                  }}
                >
                  Recent Work
                </Typography>
              </Box>
            </Box>

            <Box sx={{ position: "relative", minHeight: { md: 560 } }}>
              <Box
                sx={{
                  position: { md: "absolute" },
                  right: { md: 88 },
                  top: { md: 180 },
                  maxWidth: 340,
                }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.65 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "1.15rem", md: "1rem" },
                      lineHeight: 1.65,
                      color: "rgba(255,255,255,0.9)",
                    }}
                  >
                    Capturing timeless moments that tell stories of emotion,
                    beauty, and truth in every frame and every pose.
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  position: { md: "absolute" },
                  left: 0,
                  bottom: 0,
                  mt: { xs: 6, md: 0 },
                }}
              >
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "4rem", sm: "5.5rem", md: "9.4rem" },
                    lineHeight: 0.88,
                    letterSpacing: "-0.09em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    background:
                      "linear-gradient(90deg, #ffffff 0%, #f7fbff 10%, #85e8ff 27%, #00c8ff 38%, #ffffff 56%, #f4d8ea 74%, #eef4ff 88%, #ffffff 100%)",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    textShadow: "0 0 28px rgba(255,255,255,0.08)",
                  }}
                >
                  Photographer
                </Typography>
              </Box>
            </Box>

            <Stack
              spacing={4}
              sx={{
                alignItems: { xs: "flex-start", md: "flex-end" },
                justifyContent: "space-between",
              }}
            >
              <Stack spacing={3} sx={{ pt: { md: 8 } }}>
                {[
                  { label: "Portfolio", id: "works" },
                  { label: "About me", id: "about" },
                  { label: "My shots", id: "works" },
                  { label: "Contact", id: "contact" },
                ].map((item, index) => (
                  <Box
                    key={item.label}
                    component={motion.div}
                    initial={{ opacity: 0, x: 56 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.9 }}
                    transition={{
                      duration: 0.72,
                      delay: 0.2 + index * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Box
                      component="button"
                      type="button"
                      onClick={() => scrollToSection(item.id)}
                      sx={{
                        border: 0,
                        p: 0,
                        bgcolor: "transparent",
                        cursor: "pointer",
                        color: "#fff",
                        // textDecoration: "underline",
                        textUnderlineOffset: "8px",
                        fontFamily: headingFont,
                        fontSize: { xs: "1.3rem", md: "1.05rem" },
                        fontWeight: 500,
                        textTransform: "uppercase",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      {item.label}
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <Stack spacing={1}>
              <Box
                component="a"
                href="#"
                sx={{
                  color: "#fff",
                  fontSize: "0.95rem",
                  textDecoration: "none",
                }}
              >
                ↗ Instagram
              </Box>
            </Stack>
            <Box sx={{ display: "none" }} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: "100%",
          mx: "auto",
          px: { xs: 2, md: 3 },
          pt: { xs: 6, md: 7 },
          pb: { xs: 6, md: 7 },
          mt: { xs: 0, md: -6 },
          position: "relative",
          zIndex: 2,
          bgcolor: "black",
          borderTopLeftRadius: { md: 28 },
          borderTopRightRadius: { md: 28 },
          boxShadow: { md: "0 -22px 60px rgba(8,8,8,0.18)" },
        }}
      >
        <Box
          id="about"
          sx={{
            position: "relative",
            overflow: "hidden",
            minHeight: { xs: "auto", md: 860 },
            px: { xs: 2, md: 6 },
            py: { xs: 5, md: 7 },
            borderRadius: { xs: 3, md: 5 },
            bgcolor: "#030303",
            color: "#fff",
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, y: -18, letterSpacing: "0.5em" }}
            whileInView={{ opacity: 1, y: 0, letterSpacing: "0.9em" }}
            viewport={{ once: true, amount: 0.8 }}
            transition={{
              duration: 0.9,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <Typography
              sx={{
                textAlign: "center",
                letterSpacing: { xs: "0.45em", md: "0.9em" },
                textTransform: "uppercase",
                fontSize: { xs: "0.65rem", md: "0.82rem" },
                color: "rgba(255,255,255,0.72)",
                mb: { xs: 4, md: 2 },
                pl: { md: "0.9em" },
              }}
            >
              Snapify Photography
            </Typography>
          </Box>

          <Box
            sx={{
              position: "relative",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr 0.95fr" },
              alignItems: "center",
              gap: { xs: 4, md: 0 },
            }}
          >
            <Box
              sx={{
                order: { xs: 2, md: 1 },
                alignSelf: "stretch",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: { md: 620 },
                pr: { md: 2 },
              }}
            >
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: -90, filter: "blur(8px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true, amount: 0.55 }}
                transition={{
                  duration: 1,
                  delay: 0.1,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Typography
                  sx={{
                    fontFamily:
                      '"Barlow Condensed", "Arial Narrow", sans-serif',
                    fontSize: { xs: "4.4rem", sm: "5.5rem", md: "9.2rem" },
                    lineHeight: 0.84,
                    fontWeight: 300,
                    letterSpacing: "-0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  Capturing
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", md: "flex-start" },
                  py: { xs: 2, md: 0 },
                }}
              >
                <Box
                  component={motion.div}
                  initial={{ opacity: 0, scale: 0.82, rotate: -14 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{
                    duration: 0.95,
                    delay: 0.22,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  sx={{
                    position: "relative",
                    width: { xs: 172, md: 214 },
                    height: { xs: 172, md: 214 },
                  }}
                >
                  <Box
                    component="svg"
                    viewBox="0 0 220 220"
                    sx={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      overflow: "visible",
                    }}
                  >
                    <defs>
                      <path
                        id="photo-studio-contact-circle"
                        d="M 110,110 m -84,0 a 84,84 0 1,1 168,0 a 84,84 0 1,1 -168,0"
                      />
                    </defs>
                    <text
                      fill="rgba(255,255,255,0.96)"
                      style={{
                        fontSize: "14px",
                        letterSpacing: "7px",
                        textTransform: "uppercase",
                      }}
                    >
                      <textPath
                        href="#photo-studio-contact-circle"
                        startOffset="0%"
                      >
                        CONTACT NOW - CONTACT NOW - CONTACT NOW -
                      </textPath>
                    </text>
                  </Box>

                  <Box
                    component="button"
                    type="button"
                    onClick={() => scrollToSection("contact")}
                    sx={{
                      position: "absolute",
                      inset: { xs: 34, md: 42 },
                      borderRadius: "50%",
                      border: "1px solid rgba(255,255,255,0.14)",
                      bgcolor: "#2b2b2b",
                      color: "#fff",
                      display: "grid",
                      placeItems: "center",
                      cursor: "pointer",
                      boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.04)",
                      transition:
                        "transform 180ms ease, background-color 180ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        bgcolor: "#333",
                      },
                    }}
                  >
                    <ArrowUpRight
                      size={36}
                      strokeWidth={1.7}
                      style={{ transform: "rotate(45deg)" }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box
              component={motion.div}
              initial={{ opacity: 0, y: 50, scale: 0.94 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, amount: 0.45 }}
              transition={{
                duration: 1.05,
                delay: 0.18,
                ease: [0.22, 1, 0.36, 1],
              }}
              sx={{
                order: { xs: 1, md: 2 },
                position: "relative",
                mx: "auto",
                width: "100%",
                maxWidth: 560,
                zIndex: 2,
              }}
            >
              <Box
                component="img"
                src={showcaseImages.primary}
                alt="Creative beauty portrait"
                sx={{
                  width: "100%",
                  aspectRatio: { xs: "0.8 / 1", md: "0.76 / 1" },
                  objectFit: "cover",
                  display: "block",
                }}
              />
            </Box>

            <Box
              sx={{
                order: { xs: 3, md: 3 },
                position: "relative",
                minHeight: { xs: 360, md: 620 },
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "stretch" },
              }}
            >
              <Box
                component={motion.div}
                initial={{ opacity: 0, x: 70, y: -12, rotate: -48 }}
                whileInView={{ opacity: 0.88, x: 0, y: 0, rotate: -36 }}
                viewport={{ once: true, amount: 0.65 }}
                transition={{
                  duration: 1,
                  delay: 0.34,
                  ease: [0.22, 1, 0.36, 1],
                }}
                sx={{
                  position: { xs: "relative", md: "absolute" },
                  top: { md: 90 },
                  left: { md: -36 },
                  width: { xs: 220, sm: 260, md: 320 },
                  aspectRatio: "0.82 / 1",
                  transform: { xs: "rotate(-8deg)", md: "rotate(-36deg)" },
                  transformOrigin: "center",
                  overflow: "hidden",
                  boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
                  opacity: 0.88,
                }}
              >
                <Box
                  component="img"
                  src={showcaseImages.secondary}
                  alt="Pink hair portrait"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
              </Box>

              <Typography
                sx={{
                  mt: { xs: 28, md: "auto" },
                  ml: { md: -110 },
                  fontFamily: '"Barlow Condensed", "Arial Narrow", sans-serif',
                  fontSize: { xs: "4.2rem", sm: "5.3rem", md: "8.6rem" },
                  lineHeight: 0.84,
                  fontWeight: 300,
                  letterSpacing: "-0.05em",
                  textTransform: "uppercase",
                  position: "relative",
                  zIndex: 3,
                  whiteSpace: { md: "nowrap" },
                }}
              >
                The Moment
              </Typography>

              <Box
                component={motion.div}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.7 }}
                transition={{
                  duration: 0.85,
                  delay: 0.42,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <Typography
                  sx={{
                    mt: { xs: 2.5, md: 3 },
                    ml: { md: "auto" },
                    maxWidth: 310,
                    fontSize: { xs: "0.98rem", md: "1rem" },
                    lineHeight: 1.9,
                    color: "rgba(255,255,255,0.72)",
                  }}
                >
                  Working with {data.name}, you get bold portrait direction,
                  cinematic beauty styling, and imagery built to feel striking,
                  polished, and impossible to ignore.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Container maxWidth="lg">
          <Box
            sx={{
              mt: 6,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.95fr 0.95fr" },
              gap: { xs: 4, md: 6 },
              alignItems: "start",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: { xs: "4rem", md: "7.2rem" },
                  lineHeight: 0.9,
                  letterSpacing: "-0.06em",
                  color: "rgb(255, 255, 255)",
                }}
              >
                About
              </Typography>

              <Box
                component="img"
                src={gallery[1]?.url || fallbackImages.introOne}
                alt="Studio portrait"
                sx={{
                  mt: 3,
                  width: "100%",
                  aspectRatio: "0.96 / 1",
                  objectFit: "cover",
                  display: "block",
                  animation: `${driftUp} 8s ease-in-out infinite`,
                }}
              />

              <Typography
                sx={{
                  mt: 3,
                  maxWidth: 350,
                  fontSize: { xs: "1rem", md: "1.02rem" },
                  lineHeight: 1.65,
                  color: "rgb(255, 255, 255)",
                }}
              >
                We are a fashion-focused creative studio dedicated to delivering
                refined photography, visual direction, and bold portrait stories
                with a polished editorial finish.
              </Typography>

              <Button
                variant="contained"
                onClick={() => scrollToSection("works")}
                endIcon={<ArrowUpRight size={16} />}
                sx={{
                  mt: 3,
                  bgcolor: "#fff",
                  color: "#111",
                  borderRadius: 0,
                  boxShadow: "none",
                  px: 3.2,
                  py: 1.6,
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  textTransform: "none",
                  "&:hover": {
                    bgcolor: "#111",
                    color: "white",
                    boxShadow: "none",
                  },
                }}
              >
                More about us
              </Button>
            </Box>

            <Box>
              <Typography
                sx={{
                  maxWidth: 560,
                  ml: { md: "auto" },
                  fontSize: { xs: "1.1rem", md: "1.18rem" },
                  lineHeight: 1.45,
                  color: "rgb(255, 255, 255)",
                }}
              >
                Specializing in high-end fashion photography and model
                development through concept-driven visual storytelling. We build
                imagery with clarity, discipline, and a carefully curated
                creative process.
              </Typography>

              <Box
                sx={{
                  mt: 3.5,
                  position: "relative",
                  width: "100%",
                  minHeight: { xs: 420, md: 860 },
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={gallery[2]?.url || fallbackImages.introTwo}
                  alt="Editorial portrait"
                  sx={{
                    width: { xs: "100%", md: "92%" },
                    height: { xs: 420, md: 860 },
                    ml: { md: "auto" },
                    objectFit: "cover",
                    display: "block",
                    animation: `${driftDown} 10s ease-in-out infinite`,
                  }}
                />
              </Box>
            </Box>
          </Box>

          <Box id="works" sx={{ mt: 8 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "0.7fr 1.3fr" },
                gap: { xs: 3, md: 5 },
                alignItems: "end",
              }}
            >
              <Box>
                <TextReveal
                  text="Selected Portfolio"
                  sx={{
                    fontSize: "0.78rem",
                    letterSpacing: "0.28em",
                    textTransform: "uppercase",
                    color: "rgb(255, 255, 255)",
                  }}
                />
                <Box sx={{ mt: 1, maxWidth: 260 }}>
                  <TextReveal
                    text="My Works"
                    sx={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontSize: { xs: "3rem", md: "5.1rem" },
                      lineHeight: 0.88,
                      letterSpacing: "-0.05em",
                      color: "rgb(255, 255, 255)",
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", md: "end" },
                  gap: 2,
                  flexWrap: "wrap",
                }}
              >
                <TextReveal
                  text="A curated selection of portraits, editorial studies, and visual stories shaped through light, mood, and clean composition."
                  sx={{
                    maxWidth: 430,
                    fontSize: { xs: "0.98rem", md: "1rem" },
                    lineHeight: 1.8,
                    color: "rgb(255, 255, 255)",
                  }}
                />
                <Button
                  variant="contained"
                  onClick={() => scrollToSection("contact")}
                  endIcon={<ArrowUpRight size={16} />}
                  sx={{
                    bgcolor: "#fff",
                    color: "#111",
                    borderRadius: 0,
                    boxShadow: "none",
                    px: 3,
                    py: 1.45,
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    textTransform: "none",
                    "&:hover": {
                      bgcolor: "#111",
                      color: "white",
                      boxShadow: "none",
                    },
                  }}
                >
                  Start a project
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 4,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1.08fr 0.72fr 0.72fr" },
                gap: 2,
                alignItems: "start",
              }}
            >
              <FadeIn delay={0.02} direction="up">
                <Box
                  sx={{
                    position: "relative",
                    overflow: "hidden",
                    borderRadius: 3,
                    bgcolor: "#fff",
                  }}
                >
                  <Box
                    component="img"
                    src={
                      portfolioItems[0]?.image || fallbackImages.collageThree
                    }
                    alt={portfolioItems[0]?.title || "Featured work"}
                    sx={{
                      width: "100%",
                      height: { xs: 420, md: 700 },
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 500ms ease",
                      "&:hover": { transform: "scale(1.04)" },
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "end",
                      p: { xs: 2, md: 3 },
                      background:
                        "linear-gradient(180deg, rgba(0,0,0,0.04) 28%, rgba(0,0,0,0.6) 100%)",
                    }}
                  ></Box>
                </Box>
              </FadeIn>

              <Box sx={{ display: "grid", gap: 2 }}>
                {[
                  {
                    image:
                      portfolioItems[1]?.image || fallbackImages.collageOne,
                    title: portfolioItems[1]?.title || "Editorial Figure",
                    height: { xs: 300, md: 430 },
                  },
                  {
                    image: portfolioItems[2]?.image || fallbackImages.introOne,
                    title: portfolioItems[2]?.title || "Soft Motion",
                    height: { xs: 260, md: 250 },
                  },
                ].map((item, index) => (
                  <FadeIn
                    key={item.image + item.title}
                    delay={0.1 + index * 0.08}
                    direction="up"
                  >
                    <Box
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 3,
                        bgcolor: "#fff",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.title}
                        sx={{
                          width: "100%",
                          height: item.height,
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 500ms ease",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                      />
                    </Box>
                  </FadeIn>
                ))}
              </Box>

              <Box sx={{ display: "grid", gap: 2 }}>
                {[
                  {
                    image:
                      portfolioItems[3]?.image || fallbackImages.collageFour,
                    title: portfolioItems[3]?.title || "Studio Mood",
                    height: { xs: 260, md: 250 },
                  },
                  {
                    image: portfolioItems[4]?.image || fallbackImages.story,
                    title: portfolioItems[4]?.title || "Portrait Form",
                    height: { xs: 360, md: 430 },
                  },
                ].map((item, index) => (
                  <FadeIn
                    key={item.image + item.title}
                    delay={0.18 + index * 0.08}
                    direction="up"
                  >
                    <Box
                      sx={{
                        position: "relative",
                        overflow: "hidden",
                        borderRadius: 3,
                        bgcolor: "#fff",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.image}
                        alt={item.title}
                        sx={{
                          width: "100%",
                          height: item.height,
                          objectFit: "cover",
                          display: "block",
                          transition: "transform 500ms ease",
                          "&:hover": { transform: "scale(1.05)" },
                        }}
                      />
                    </Box>
                  </FadeIn>
                ))}
              </Box>
            </Box>
          </Box>

          <Box
            id="contact"
            sx={{
              mt: { xs: 6, md: 8 },
              px: { xs: 2.5, md: 4 },
              py: { xs: 4, md: 5 },
              bgcolor: "#0c0c0c",
              color: "#fff",
              borderRadius: { xs: 3, md: 4 },
              overflow: "hidden",
              position: "relative",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at top right, rgba(255,122,26,0.18), transparent 34%), radial-gradient(circle at bottom left, rgba(255,255,255,0.06), transparent 28%)",
                pointerEvents: "none",
              }}
            />

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "0.78fr 1.22fr" },
                gap: { xs: 4, md: 5 },
                alignItems: "start",
              }}
            >
              <FadeIn direction="up">
                <Box>
                  <TextReveal
                    text="Let's Work Together"
                    sx={{
                      fontSize: "0.8rem",
                      letterSpacing: "0.28em",
                      textTransform: "uppercase",
                      color: "rgba(255,255,255,0.58)",
                    }}
                  />
                  <Box sx={{ mt: 1, maxWidth: 360 }}>
                    <TextReveal
                      text="Start Your Next Shoot"
                      sx={{
                        fontFamily: '"Cormorant Garamond", Georgia, serif',
                        fontSize: { xs: "3rem", md: "4.5rem" },
                        lineHeight: 0.9,
                        letterSpacing: "-0.05em",
                      }}
                    />
                  </Box>
                  <Box
                    component={motion.div}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.45 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.18,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <Typography
                      sx={{
                        mt: 2,
                        maxWidth: 340,
                        fontSize: "0.98rem",
                        lineHeight: 1.8,
                        color: "rgba(255,255,255,0.72)",
                      }}
                    >
                      Share your concept, timeline, and the kind of visuals you
                      want to create. We&apos;ll shape the right direction for
                      the shoot.
                    </Typography>
                  </Box>

                  <Stack spacing={1.1} sx={{ mt: 3 }}>
                    {[
                      data.contact?.email || "hello@studio.com",
                      data.contact?.phone || "+1 (555) 220 1188",
                      data.contact?.address ||
                        "245 Mercer Street, New York, NY",
                    ].map((item) => (
                      <Typography
                        key={item}
                        sx={{
                          color: "rgba(255,255,255,0.84)",
                          fontSize: "0.95rem",
                        }}
                      >
                        {item}
                      </Typography>
                    ))}
                  </Stack>
                </Box>
              </FadeIn>

              <FadeIn direction="up" delay={0.08}>
                <Box
                  component="form"
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  {[
                    { label: "Full name", placeholder: "Your name" },
                    { label: "Email address", placeholder: "hello@email.com" },
                    { label: "Phone number", placeholder: "+1 234 567 890" },
                    {
                      label: "Project type",
                      placeholder: "Portrait / Editorial",
                    },
                  ].map((field) => (
                    <Box key={field.label}>
                      <Typography
                        sx={{
                          mb: 0.8,
                          fontSize: "0.82rem",
                          letterSpacing: "0.12em",
                          textTransform: "uppercase",
                          color: "rgba(255,255,255,0.62)",
                        }}
                      >
                        {field.label}
                      </Typography>
                      <Box
                        component="input"
                        placeholder={field.placeholder}
                        sx={{
                          width: "100%",
                          height: 56,
                          px: 2,
                          border: "1px solid rgba(255,255,255,0.12)",
                          bgcolor: "rgba(255,255,255,0.04)",
                          color: "#fff",
                          fontSize: "0.98rem",
                          outline: "none",
                          "&::placeholder": { color: "rgba(255,255,255,0.36)" },
                          "&:focus": {
                            borderColor: "rgba(255,122,26,0.6)",
                            bgcolor: "rgba(255,255,255,0.06)",
                          },
                        }}
                      />
                    </Box>
                  ))}

                  <Box sx={{ gridColumn: { md: "1 / -1" } }}>
                    <Typography
                      sx={{
                        mb: 0.8,
                        fontSize: "0.82rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.62)",
                      }}
                    >
                      Project brief
                    </Typography>
                    <Box
                      component="textarea"
                      placeholder="Tell us about the style, mood, dates, location, and anything important for the shoot."
                      sx={{
                        width: "100%",
                        minHeight: 170,
                        px: 2,
                        py: 1.8,
                        resize: "vertical",
                        border: "1px solid rgba(255,255,255,0.12)",
                        bgcolor: "rgba(255,255,255,0.04)",
                        color: "#fff",
                        fontSize: "0.98rem",
                        fontFamily: bodyFont,
                        outline: "none",
                        "&::placeholder": { color: "rgba(255,255,255,0.36)" },
                        "&:focus": {
                          borderColor: "rgba(255,122,26,0.6)",
                          bgcolor: "rgba(255,255,255,0.06)",
                        },
                      }}
                    />
                  </Box>

                  <Box
                    sx={{
                      gridColumn: { md: "1 / -1" },
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", md: "center" },
                      gap: 2,
                      flexWrap: "wrap",
                      mt: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        maxWidth: 360,
                        fontSize: "0.92rem",
                        lineHeight: 1.7,
                        color: "rgba(255,255,255,0.62)",
                      }}
                    >
                      We usually reply within one business day with
                      availability, direction, and next steps.
                    </Typography>
                    <Button
                      type="submit"
                      variant="contained"
                      endIcon={<ArrowUpRight size={16} />}
                      sx={{
                        bgcolor: "#ffffff",
                        color: "#111",
                        borderRadius: 0,
                        boxShadow: "none",
                        px: 3.2,
                        py: 1.5,
                        fontSize: "0.92rem",
                        fontWeight: 700,
                        textTransform: "none",
                        "&:hover": { bgcolor: "#ff7a1a", boxShadow: "none" },
                      }}
                    >
                      Send enquiry
                    </Button>
                  </Box>
                </Box>
              </FadeIn>
            </Box>
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          maxWidth: 1320,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pb: { xs: 6, md: 7 },
        }}
      >
        <Typography
          sx={{
            fontFamily: headingFont,
            fontSize: "1.7rem",
            letterSpacing: "-0.04em",
          }}
        >
          See Through My Lens
        </Typography>
        <Box
          sx={{
            mt: 2.2,
            display: "grid",
            gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" },
            gap: 1,
          }}
        >
          {[
            gallery[6]?.url || fallbackImages.collageOne,
            gallery[7]?.url || fallbackImages.collageTwo,
            gallery[8]?.url || fallbackImages.collageThree,
            gallery[9]?.url || fallbackImages.collageFour,
            gallery[10]?.url || fallbackImages.introOne,
            gallery[11]?.url || fallbackImages.introTwo,
            gallery[12]?.url || fallbackImages.service,
            gallery[13]?.url || fallbackImages.story,
            gallery[14]?.url || fallbackImages.collageOne,
            gallery[15]?.url || fallbackImages.collageTwo,
          ].map((image, index) => (
            <Box
              key={image + index}
              component="img"
              src={image}
              alt="Lens work"
              sx={{
                width: "100%",
                aspectRatio: index % 3 === 0 ? "0.8 / 1.1" : "1 / 1",
                objectFit: "cover",
                borderRadius: 1.5,
              }}
            />
          ))}
        </Box>
      </Box>

      <Box sx={{ bgcolor: "#111", color: "#fff", py: { xs: 6, md: 7 } }}>
        <Box
          id="contact"
          sx={{
            maxWidth: 1320,
            mx: "auto",
            px: { xs: 2, md: 3 },
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
            gap: 4,
            alignItems: "end",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "2rem", md: "3rem" },
                lineHeight: 0.96,
                letterSpacing: "-0.05em",
              }}
            >
              Every Frame Tells a Story;
              <br />
              Let&apos;s Tell Yours.
            </Typography>
            <Button
              variant="contained"
              sx={{
                mt: 2.4,
                bgcolor: "#fff",
                color: "#111",
                borderRadius: 999,
                boxShadow: "none",
                px: 2.6,
                fontSize: "0.72rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                display: "none",
                "&:hover": { bgcolor: "#fff", boxShadow: "none" },
              }}
            >
              Book now
            </Button>
            <Typography sx={{ mt: 4, fontSize: "1.35rem", color: "#ff7a1a" }}>
              {data.contact?.email || "hello@studio.com"}
            </Typography>
          </Box>

          <Box sx={{ textAlign: { xs: "left", md: "right" } }}>
            <Typography
              sx={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.66)",
                lineHeight: 1.9,
              }}
            >
              {data.contact?.phone || "+1 (555) 220 1188"}
              <br />
              {data.contact?.address || "245 Mercer Street, New York, NY"}
            </Typography>
            <Stack
              direction="row"
              spacing={1.2}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
              sx={{ mt: 2 }}
            >
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Box
                    key={item.key}
                    component="a"
                    href={
                      data.socialLinks?.[
                        item.key as keyof typeof data.socialLinks
                      ] || "#"
                    }
                    target="_blank"
                    rel="noreferrer"
                    sx={{ color: "#fff", display: "flex" }}
                  >
                    <Icon size={16} />
                  </Box>
                );
              })}
              {data.contact?.email ? (
                <Box
                  component="a"
                  href={`mailto:${data.contact.email}`}
                  sx={{ color: "#fff", display: "flex" }}
                >
                  <Mail size={16} />
                </Box>
              ) : null}
            </Stack>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PortfolioPhotoStudioTemplate;
