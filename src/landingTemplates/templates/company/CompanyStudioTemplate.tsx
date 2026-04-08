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
import EastIcon from "@mui/icons-material/East";
import VerifiedUserRoundedIcon from "@mui/icons-material/VerifiedUserRounded";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import { motion } from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";

const palette = {
  bg: "#f4efe7",
  surface: "#fbf7f1",
  surfaceAlt: "#efe6da",
  ink: "#15110f",
  muted: "rgba(21,17,15,0.62)",
  line: "rgba(21,17,15,0.1)",
  accent: "#14483f",
  accentSoft: "rgba(20,72,63,0.12)",
  dark: "#0d1211",
  white: "#fffdf9",
};

const headingFont = '"Plus Jakarta Sans", "Inter", sans-serif';
const bodyFont = '"Inter", "Segoe UI", sans-serif';

const visualSet = {
  heroPortrait:
    "https://themejunction.net/html/bexon/demo/assets/images/hero/h7-hero-banner.webp",
  strategy:
    "https://themejunction.net/html/bexon/demo/assets/images/about/about-5.webp",
  team:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80",
  office:
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=80",
  boardroom:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80",
  avatarOne:
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=80",
  avatarTwo:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=80",
  avatarThree:
    "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=240&q=80",
  avatarFour:
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=240&q=80",
};

const heroStagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 32, filter: "blur(10px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
  },
};

const sectionReveal = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
} as const;

const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
        .split("")
        .map((char) => char + char)
        .join("")
      : normalized;

  const int = Number.parseInt(value, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const CompanyStudioTemplate: React.FC<TemplateProps> = ({ data }) => {
  const features = (data.features || []).slice(0, 4);
  const stats = (data.stats || []).slice(0, 3);
  const team = (data.team || []).slice(0, 2);
  const reviews = (data.reviews || []).slice(0, 1);
  const themeColor = data.primaryColor || "#124d4e";
  const themeSoft = rgba(themeColor, 0.12);
  const themeMuted = rgba(themeColor, 0.16);
  const themeBorder = rgba(themeColor, 0.2);
  const themeGlow = rgba(themeColor, 0.08);
  const themeStrong = rgba(themeColor, 0.9);
  const themeHeroBase = rgba(themeColor, 0.96);
  const themeHeroMid = rgba(themeColor, 0.68);

  const socialIcons = [
    { key: "instagram", icon: Instagram },
    { key: "linkedin", icon: Linkedin },
    { key: "twitter", icon: Twitter },
    { key: "facebook", icon: Facebook },
  ].filter((item) =>
    Boolean(data.socialLinks?.[item.key as keyof typeof data.socialLinks]),
  );

  const navItems = [
    { label: "Overview", id: "overview" },
    { label: "About", id: "about" },
    { label: "Why Us", id: "why-us" },
    { label: "Work", id: "work" },
    { label: "Contact", id: "contact" },
  ];

  const scrollToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Box sx={{ bgcolor: palette.bg, color: palette.ink, fontFamily: bodyFont }}>
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          backdropFilter: "blur(18px)",
          bgcolor: "rgba(244,239,231,0.78)",
          borderBottom: `1px solid ${palette.line}`,
        }}
      >
        <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ minHeight: 82 }}
          >
            <Typography
              sx={{
                fontFamily: headingFont,
                fontSize: { xs: "1.45rem", md: "1.8rem" },
                fontWeight: 800,
                letterSpacing: "-0.05em",
              }}
            >
              {data.name}
            </Typography>

            <Stack
              direction="row"
              spacing={3.5}
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              {navItems.map((item) => (
                <Typography
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  sx={{
                    cursor: "pointer",
                    color: palette.muted,
                    fontWeight: 500,
                    transition: "color 180ms ease",
                    "&:hover": { color: palette.ink },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Stack>

            <Button
              onClick={() => scrollToSection("contact")}
              endIcon={<ArrowOutwardIcon />}
              sx={{
                color: palette.ink,
                textTransform: "none",
                fontWeight: 700,
                borderRadius: 999,
              }}
            >
              Start project
            </Button>
          </Stack>
        </Container>
      </Box>

      <Box
        id="overview"
        data-preview-section="true"
        data-preview-label="Hero"
        sx={{
          position: "relative",
          overflow: "hidden",
          bgcolor: themeColor,
          minHeight: { xs: 700, md: 760 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              `radial-gradient(circle at 12% 78%, ${rgba(themeColor, 0.52)}, transparent 30%), radial-gradient(circle at 78% 24%, ${rgba(themeColor, 0.32)}, transparent 24%), linear-gradient(135deg, ${themeHeroBase} 0%, ${themeHeroMid} 58%, rgba(10, 27, 29, 1) 100%)`,
          }}
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            opacity: 0.28,
            backgroundImage:
              "linear-gradient(135deg, rgba(255,255,255,0.08) 25%, transparent 25%), linear-gradient(225deg, rgba(255,255,255,0.08) 25%, transparent 25%)",
            backgroundSize: "260px 260px",
            backgroundPosition: "0 0, 130px 130px",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: { xs: 88, md: 36 },
            right: { xs: -70, md: 0 },
            width: { xs: "78%", md: "42%" },
            height: { xs: 520, md: "100%" },
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <Box
            component={motion.img}
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.16 }}
            src={visualSet.heroPortrait}
            alt="Executive portrait"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              objectPosition: "bottom center",
              filter: "drop-shadow(0 30px 80px rgba(0,0,0,0.35))",
            }}
          />
        </Box>
        <Box
          sx={{
            position: "absolute",
            left: { xs: "50%", md: "43.5%" },
            top: { xs: 280, md: 280 },
            transform: "translateX(-50%)",
            zIndex: 3,
          }}
        >
          <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.45 }}
            sx={{
              width: { xs: 80, md: 104 },
              height: { xs: 80, md: 104 },
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              bgcolor: themeMuted,
              border: `1px solid ${themeBorder}`,
              boxShadow: `0 0 0 14px ${themeGlow}`,
              backdropFilter: "blur(10px)",
            }}
          >
            <VerifiedUserRoundedIcon sx={{ color: "#dfffff", fontSize: { xs: 34, md: 44 } }} />
          </Box>
        </Box>

        <Container
          maxWidth="xl"
          sx={{
            position: "absolute",
            inset: 0,
            px: { xs: 2, md: 4 },
            py: { xs: 4, md: 5 },
            display: "flex",
            alignItems: "center",
            zIndex: 2,
          }}
        >
          <Box
            component={motion.div}
            variants={heroStagger}
            initial="hidden"
            animate="show"
            sx={{ width: "100%" }}
          >
            <Stack spacing={1.2} sx={{ maxWidth: { xs: "100%", md: 760 }, pt: { xs: 10, md: 4 } }}>
              <Box component={motion.div} variants={fadeUp}>
                <Chip
                  label="Trusted business partner"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.14)",
                    color: palette.white,
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.22)",
                    fontWeight: 700,
                  }}
                />
              </Box>

              <Typography
                component={motion.h1}
                variants={fadeUp}
                sx={{
                  fontFamily: headingFont,
                  fontSize: { xs: "3rem", md: "6.7rem" },
                  lineHeight: { xs: 0.94, md: 0.88 },
                  letterSpacing: "-0.08em",
                  fontWeight: 800,
                  color: palette.white,
                  maxWidth: 880,
                }}
              >
                Delivering
                <br />
                Trusted
                <br />
                Solutions
              </Typography>

              <Stack
                component={motion.div}
                variants={fadeUp}
                direction={{ xs: "column", sm: "row" }}
                spacing={1.4}
                sx={{ pt: 1.6 }}
              >
                <Button
                  onClick={() => scrollToSection("about")}
                  variant="contained"
                  sx={{
                    bgcolor: palette.white,
                    color: palette.dark,
                    borderRadius: 999,
                    textTransform: "none",
                    px: 2.8,
                    py: 1.15,
                    fontWeight: 800,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: palette.white,
                      boxShadow: "none",
                      opacity: 0.92,
                    },
                  }}
                >
                  Explore services
                </Button>
                <Button
                  onClick={() => scrollToSection("contact")}
                  variant="outlined"
                  sx={{
                    color: palette.white,
                    borderColor: "rgba(255,255,255,0.32)",
                    borderRadius: 999,
                    textTransform: "none",
                    px: 2.8,
                    py: 1.15,
                    fontWeight: 700,
                  }}
                >
                  Contact
                </Button>
              </Stack>

              <Box
                component={motion.div}
                variants={fadeUp}
                sx={{
                  mt: { xs: 4, md: 7 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.6,
                  flexWrap: "wrap",
                }}
              >
                <Stack direction="row" spacing={-1.2}>
                  {[
                    visualSet.avatarOne,
                    visualSet.avatarTwo,
                    visualSet.avatarThree,
                    visualSet.avatarOne,
                  ].map((avatar, index) => (
                    <Box
                      key={avatar}
                      component="img"
                      src={avatar}
                      alt={`Client ${index + 1}`}
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid rgba(255,255,255,0.92)",
                        boxShadow: "0 12px 24px rgba(0,0,0,0.24)",
                      }}
                    />
                  ))}
                </Stack>

                <Box>
                  <Typography
                    sx={{
                      color: "#39d2d7",
                      fontWeight: 800,
                      letterSpacing: "0.16em",
                      fontSize: "0.95rem",
                    }}
                  >
                    ★★★★★
                  </Typography>
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.92)",
                      fontSize: { xs: "1rem", md: "1.1rem" },
                      fontWeight: 700,
                    }}
                  >
                    100+ happy customers.
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ px: { xs: 2, md: 4 } }}>
        <Box
          id="about"
          data-preview-section="true"
          data-preview-label="About"
          sx={{ py: { xs: 4, md: 6 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
              gap: { xs: 2, md: 3 },
              alignItems: "stretch",
            }}
          >
            <Box
              component={motion.div}
              {...sectionReveal}
              sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "34px",
                minHeight: { xs: 420, md: 660 },
              }}
            >
              <Box
                component="img"
                src={visualSet.strategy}
                alt="Business collaboration"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <Box
                component={motion.div}
                {...sectionReveal}
                sx={{
                  position: "absolute",
                  left: 20,
                  right: { xs: 20, md: "42%" },
                  bottom: 20,
                  p: { xs: 2, md: 2.3 },
                  borderRadius: "20px",
                  bgcolor: "rgba(22,22,22,0.58)",
                  color: palette.white,
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "1.35rem", md: "1.7rem" },
                    fontWeight: 800,
                    letterSpacing: "-0.04em",
                    mb: 1.5,
                  }}
                >
                  Business progress
                </Typography>

                {[
                  { label: "Revenue", value: "82%" },
                  { label: "Satisfaction", value: "90%" },
                ].map((item) => (
                  <Box key={item.label} sx={{ mb: 1.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography sx={{ color: "rgba(255,255,255,0.84)" }}>
                        {item.label}
                      </Typography>
                      <Typography sx={{ fontWeight: 700 }}>{item.value}</Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 4,
                        borderRadius: 999,
                        bgcolor: "rgba(255,255,255,0.14)",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: item.value,
                          height: "100%",
                          bgcolor: themeColor,
                          borderRadius: 999,
                        }}
                      />
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                paddingRight: "20px"
              }}
            >
              <Box component={motion.div} {...sectionReveal}>
                <Chip
                  label="Get to know us"
                  sx={{
                    bgcolor: themeColor,
                    color: palette.white,
                    borderRadius: "10px",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                />

                <Typography
                  sx={{
                    mt: 2.3,
                    fontFamily: headingFont,
                    fontSize: { xs: "2.35rem", md: "4.1rem" },
                    lineHeight: 0.96,
                    letterSpacing: "-0.07em",
                    fontWeight: 800,
                    maxWidth: 620,
                  }}
                >
                  Driving innovation and
                  <br />
                  excellence for corporate
                  <br />
                  success worldwide.
                </Typography>

                <Box
                  sx={{
                    mt: 2.5,
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                    gap: 1.5,
                  }}
                >
                  {[
                    {
                      title: "What we build",
                      items: ["Clear systems", "Premium visuals", "Business growth"],
                    },
                    {
                      title: "How we work",
                      items: ["Fast collaboration", "Focused delivery", "Global support"],
                    },
                  ].map((group, index) => (
                    <Box
                      key={group.title}
                      component={motion.div}
                      {...sectionReveal}
                      transition={{
                        ...sectionReveal.transition,
                        delay: index * 0.08,
                      }}
                      sx={{
                        p: { xs: 2.2, md: 2.6 },
                        borderRadius: "22px",
                        bgcolor: palette.white,
                        border: `1px solid ${palette.line}`,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: headingFont,
                          fontSize: { xs: "1.3rem", md: "1.6rem" },
                          fontWeight: 800,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {group.title}
                      </Typography>

                      <Stack spacing={0.9} sx={{ mt: 1.7 }}>
                        {group.items.map((item) => (
                          <Stack
                            key={item}
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                bgcolor: themeColor,
                                flexShrink: 0,
                              }}
                            />
                            <Typography sx={{ color: palette.muted }}>
                              {item}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  ))}
                </Box>

                <Button
                  variant="contained"
                  endIcon={<ArrowOutwardIcon />}
                  sx={{
                    mt: 2.2,
                    bgcolor: themeColor,
                    color: palette.white,
                    borderRadius: "16px",
                    textTransform: "none",
                    px: 2.6,
                    py: 1.15,
                    fontWeight: 700,
                    boxShadow: "none",
                    "&:hover": {
                      bgcolor: themeColor,
                      boxShadow: "none",
                      opacity: 0.94,
                    },
                  }}
                >
                  Learn more about us
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          id="why-us"
          data-preview-section="true"
          data-preview-label="Why Choose Us"
          sx={{ py: { xs: 1, md: 2 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.95fr 1.05fr" },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            <Box
              component={motion.div}
              {...sectionReveal}
              sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: "34px",
                bgcolor: palette.dark,
                color: palette.white,
                minHeight: 420,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography sx={{ color: "rgba(255,255,255,0.66)", mb: 1 }}>
                  Why choose us
                </Typography>
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "2.1rem", md: "3.9rem" },
                    lineHeight: 0.96,
                    letterSpacing: "-0.07em",
                    fontWeight: 800,
                    maxWidth: 480,
                  }}
                >
                  Advanced design without visual clutter.
                </Typography>
              </Box>

              <Stack spacing={1.2} sx={{ mt: 3 }}>
                {["Wide hero", "Focused sections", "Smooth reveal", "Premium image flow"].map(
                  (item) => (
                    <Box
                      key={item}
                      sx={{
                        px: 1.6,
                        py: 1.4,
                        borderRadius: "18px",
                        bgcolor: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(255,255,255,0.12)",
                      }}
                    >
                      <Typography sx={{ fontWeight: 600 }}>{item}</Typography>
                    </Box>
                  ),
                )}
              </Stack>
            </Box>

            <Box
              component={motion.div}
              {...sectionReveal}
              whileHover={{ y: -8 }}
              sx={{
                overflow: "hidden",
                borderRadius: "34px",
                minHeight: 420,
              }}
            >
              <Box
                component="img"
                src={visualSet.office}
                alt="Why choose us"
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                  transition: "transform 520ms ease",
                  "&:hover": { transform: "scale(1.05)" },
                }}
              />
            </Box>
          </Box>
        </Box>

        <Box
          id="work"
          data-preview-section="true"
          data-preview-label="Work"
          sx={{ py: { xs: 2, md: 4 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "0.9fr 1.1fr" },
              gap: 2,
              alignItems: "stretch",
            }}
          >
            <Box
              component={motion.div}
              {...sectionReveal}
              sx={{
                p: { xs: 2.5, md: 4 },
                borderRadius: "34px",
                bgcolor: themeColor,
                color: palette.white,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 420,
              }}
            >
              <Box>
                <Typography sx={{ opacity: 0.72, mb: 1 }}>Design language</Typography>
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "2.1rem", md: "4rem" },
                    lineHeight: 0.95,
                    letterSpacing: "-0.07em",
                    fontWeight: 800,
                    maxWidth: 480,
                  }}
                >
                  Full-width hero, bold images, and refined movement.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1.2} sx={{ mt: 3, flexWrap: "wrap" }}>
                {["Hero", "Images", "Motion"].map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    sx={{
                      bgcolor: "rgba(255,255,255,0.12)",
                      color: palette.white,
                      border: "1px solid rgba(255,255,255,0.18)",
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              {[visualSet.office, visualSet.boardroom].map((image, index) => (
                <Box
                  key={image}
                  component={motion.div}
                  {...sectionReveal}
                  transition={{ ...sectionReveal.transition, delay: index * 0.08 }}
                  whileHover={{ y: -8 }}
                  sx={{
                    overflow: "hidden",
                    borderRadius: "28px",
                    minHeight: { xs: 260, md: 420 },
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    alt="Company section"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                      transition: "transform 520ms ease",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        <Box
          data-preview-section="true"
          data-preview-label="Team"
          sx={{ py: { xs: 4, md: 6 } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.05fr 0.95fr" },
              gap: 2,
            }}
          >
            <Box
              component={motion.div}
              {...sectionReveal}
              sx={{
                overflow: "hidden",
                borderRadius: "34px",
                minHeight: { xs: 320, md: 560 },
              }}
            >
              <Box
                component="img"
                src={visualSet.team}
                alt="Company team"
                sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateRows: { xs: "auto auto", md: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              <Box
                component={motion.div}
                {...sectionReveal}
                sx={{
                  p: { xs: 2.4, md: 3.2 },
                  borderRadius: "30px",
                  bgcolor: palette.surface,
                  border: `1px solid ${palette.line}`,
                }}
              >
                <Typography sx={{ color: palette.muted, mb: 1 }}>Team</Typography>
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "2rem", md: "3.4rem" },
                    lineHeight: 0.96,
                    letterSpacing: "-0.06em",
                    fontWeight: 800,
                    maxWidth: 420,
                  }}
                >
                  Strong visuals for trust and leadership.
                </Typography>
                <Stack spacing={1} sx={{ mt: 2.4 }}>
                  {(team.length ? team : [{ name: "Leadership" }, { name: "Operations" }]).map(
                    (member) => (
                      <Typography key={member.name} sx={{ color: palette.muted }}>
                        {member.name}
                      </Typography>
                    ),
                  )}
                </Stack>
              </Box>

              <Box
                component={motion.div}
                {...sectionReveal}
                sx={{
                  p: { xs: 2.4, md: 3.2 },
                  borderRadius: "30px",
                  bgcolor: palette.dark,
                  color: palette.white,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "1.5rem", md: "2.25rem" },
                    lineHeight: 1.05,
                    letterSpacing: "-0.04em",
                    fontWeight: 700,
                    maxWidth: 420,
                  }}
                >
                  {reviews[0]?.text || "Built to feel sharp, premium, and easy to scan."}
                </Typography>
                <Typography sx={{ mt: 2, color: "rgba(255,255,255,0.68)" }}>
                  {reviews[0]?.author || "Executive team"}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          id="contact"
          data-preview-section="true"
          data-preview-label="Contact"
          sx={{ pt: { xs: 2, md: 3 }, pb: { xs: 5, md: 6 } }}
        >
          <Box
            sx={{
              p: { xs: 2.5, md: 4 },
              borderRadius: "34px",
              bgcolor: palette.surface,
              border: `1px solid ${palette.line}`,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "0.85fr 1.15fr" },
                gap: 2,
                alignItems: "stretch",
              }}
            >
              <Box component={motion.div} {...sectionReveal}>
                <Typography sx={{ color: palette.muted, mb: 1 }}>Contact</Typography>
                <Typography
                  sx={{
                    fontFamily: headingFont,
                    fontSize: { xs: "2.2rem", md: "4rem" },
                    lineHeight: 0.95,
                    letterSpacing: "-0.07em",
                    fontWeight: 800,
                    maxWidth: 460,
                  }}
                >
                  Built to look premium from the first scroll.
                </Typography>
                <Stack spacing={0.7} sx={{ mt: 2.5, color: palette.muted }}>
                  {data.contact.email ? <Typography>{data.contact.email}</Typography> : null}
                  {data.contact.phone ? <Typography>{data.contact.phone}</Typography> : null}
                  {data.contact.address ? <Typography>{data.contact.address}</Typography> : null}
                </Stack>
              </Box>

              <Box
                component={motion.div}
                {...sectionReveal}
                sx={{
                  p: { xs: 2, md: 2.2 },
                  borderRadius: "26px",
                  bgcolor: palette.white,
                  border: `1px solid ${palette.line}`,
                }}
              >
                <Stack spacing={1.2}>
                  <TextField
                    placeholder="Your name"
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: palette.surface,
                        borderRadius: "16px",
                        "& fieldset": { borderColor: palette.line },
                      },
                    }}
                  />
                  <TextField
                    placeholder="Email address"
                    size="small"
                    fullWidth
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: palette.surface,
                        borderRadius: "16px",
                        "& fieldset": { borderColor: palette.line },
                      },
                    }}
                  />
                  <TextField
                    placeholder="Project details"
                    size="small"
                    fullWidth
                    multiline
                    minRows={4}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        bgcolor: palette.surface,
                        borderRadius: "16px",
                        "& fieldset": { borderColor: palette.line },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    endIcon={<EastIcon />}
                    sx={{
                      alignSelf: "flex-start",
                      bgcolor: palette.dark,
                      color: palette.white,
                      borderRadius: 999,
                      textTransform: "none",
                      px: 2.6,
                      py: 1.08,
                      fontWeight: 700,
                      boxShadow: "none",
                      "&:hover": {
                        bgcolor: palette.dark,
                        boxShadow: "none",
                        opacity: 0.94,
                      },
                    }}
                  >
                    Send enquiry
                  </Button>
                </Stack>
              </Box>
            </Box>

            <Box
              sx={{
                mt: 3,
                pt: 2.2,
                borderTop: `1px solid ${palette.line}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                flexDirection: { xs: "column", md: "row" },
                gap: 1.5,
              }}
            >
              <Typography sx={{ color: palette.muted }}>
                © 2026 {data.name}. Executive company presence.
              </Typography>
              {socialIcons.length ? (
                <Stack direction="row" spacing={1}>
                  {socialIcons.map(({ key, icon: Icon }) => (
                    <Box
                      key={key}
                      sx={{
                        width: 40,
                        height: 40,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "50%",
                        border: `1px solid ${palette.line}`,
                        color: palette.ink,
                      }}
                    >
                      <Icon size={16} />
                    </Box>
                  ))}
                </Stack>
              ) : null}
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CompanyStudioTemplate;
