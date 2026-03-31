import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
  Container,
  Grid,
  Paper,
} from "@mui/material";
import {
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  ArrowRight,
  PhoneCall,
  Wrench,
  Droplets,
  ShieldCheck,
  BadgeCheck,
} from "lucide-react";
import { TemplateProps } from "../../templateEngine/types";
import { buildModernTheme } from "./modernTheme";
import {
  HeroBlock,
  ServicesBlock,
  GalleryBlock,
  ReviewsBlock,
  ContactBlock,
  LocationBlock,
  CTASection,
} from "../../blocks";

const fallbackLogo =
  "https://img.freepik.com/free-vector/vector-education-logo_779267-2059.jpg";

type ModernThemeType = ReturnType<typeof buildModernTheme>;

type HeaderConfig = {
  logoType: "image" | "wordmark";
  logoSrc?: string;
  logoBadgeBg?: string;
  brand: string;
  brandAccent?: string;
  navItems: Array<{ label: string; id: string }>;
  headerBg: string;
  borderColor: string;
  textColor: string;
  ctaBg: string;
  ctaText: string;
  ctaLabel?: string;
};

const plumbingHeroImage =
  "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=1400&q=80";
const plumbingAboutImages = [
  "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
];

function getHeaderConfig(
  data: TemplateProps["data"],
  theme: ModernThemeType,
): HeaderConfig {
  const name = data.name.toLowerCase();

  if (name.includes("bright minds")) {
    return {
      logoType: "image",
      logoSrc: data.logoUrl || fallbackLogo,
      brand: data.name,
      navItems: [
        { label: "Programs", id: "services" },
        { label: "Gallery", id: "gallery" },
        { label: "Reviews", id: "reviews" },
        { label: "Contact", id: "contact" },
      ],
      headerBg: "#ffffff",
      borderColor: theme.borderColor,
      textColor: theme.headingColor,
      ctaBg: theme.primaryColor,
      ctaText: "#ffffff",
    };
  }

  if (name.includes("green roots")) {
    return {
      logoType: "image",
      logoSrc: data.logoUrl || fallbackLogo,

      logoBadgeBg: "linear-gradient(135deg, #1f5b2c 0%, #3f8f2f 100%)",
      brand: "Green Roots",
      brandAccent: "Garden Co.",
      navItems: [
        { label: "Services", id: "services" },
        { label: "Projects", id: "gallery" },
        { label: "Reviews", id: "reviews" },
        { label: "Contact", id: "contact" },
      ],
      headerBg: "rgb(255, 255, 255)",
      borderColor: "rgba(255,255,255,0.12)",
      textColor: "#000000",
      ctaBg: "#3f8f2f",
      ctaText: "#ffffff",
      ctaLabel: "Book Visit",
    };
  }

  if (name.includes("casa bella")) {
    return {
      logoType: "image",
      logoSrc: data.logoUrl || fallbackLogo,
      logoBadgeBg: "linear-gradient(135deg, #3d1712 0%, #8b2f22 100%)",
      brand: "Casa Bella",
      brandAccent: "Ristorante",
      navItems: [
        { label: "Menu", id: "services" },
        { label: "Gallery", id: "gallery" },
        { label: "Reviews", id: "reviews" },
        { label: "Reserve", id: "contact" },
      ],
      headerBg: "rgba(24, 11, 8, 0.76)",
      borderColor: "rgba(255,255,255,0.12)",
      textColor: "#fff7f1",
      ctaBg: "#b53a2d",
      ctaText: "#ffffff",
      ctaLabel: "Reserve Now",
    };
  }

  if (name.includes("proflow")) {
    return {
      logoType: "image",
      logoSrc: data.logoUrl || fallbackLogo,
      brand: "ProFlow",
      brandAccent: "Plumbing",
      navItems: [
        { label: "About", id: "about" },
        { label: "Service", id: "services" },
        { label: "Work", id: "gallery" },
        { label: "Blogs", id: "contact" },
        { label: "Contact", id: "contact" },
      ],
      headerBg: "rgba(12, 15, 18, 0.86)",
      borderColor: "rgba(255,255,255,0.08)",
      textColor: "#ffffff",
      ctaBg: "#b8ff2c",
      ctaText: "#ffffff",
      ctaLabel: "Call Now",
    };
  }

  return {
    logoType: "image",
    logoSrc: data.logoUrl || fallbackLogo,
    brand: data.name,
    navItems: [
      { label: "Services", id: "services" },
      { label: "Gallery", id: "gallery" },
      { label: "Reviews", id: "reviews" },
      { label: "Contact", id: "contact" },
    ],
    headerBg: "#ffffff",
    borderColor: theme.borderColor,
    textColor: theme.headingColor,
    ctaBg: theme.primaryColor,
    ctaText: "#ffffff",
  };
}

function PlumbingLanding({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ModernThemeType;
}) {
  const header = getHeaderConfig(data, theme);
  const galleryItems = (data.gallery || []).slice(0, 4);
  const featureItems = [
    "Leak repairs",
    "Remodeling service",
    "Drain cleaning & repairs",
    "Sewer repair & cleaning",
    "Faucet installation",
  ];
  const stats = [
    { value: "18+", label: "Year Experience" },
    { value: "4.3k", label: "Happy Clients" },
    { value: "25+", label: "Qualified Experts" },
  ];
  const highlightCards = [
    {
      icon: <Wrench size={20} />,
      title: "Fast Repairs",
      text: "Same-day fixes for urgent plumbing issues.",
    },
    {
      icon: <Droplets size={20} />,
      title: "Drain Expertise",
      text: "Clear flow, cleaner systems, fewer callbacks.",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Certified Team",
      text: "Trusted technicians with practical field experience.",
    },
  ];
  const heroImage = data.heroBannerUrl || galleryItems[1]?.url || plumbingHeroImage;

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <Box sx={{ bgcolor: "#ffffff" }}>
      <Box
        sx={{
          position: "relative",
          minHeight: { xs: 700, md: 760 },
          color: "#ffffff",
          overflow: "hidden",
          backgroundImage: `linear-gradient(90deg, rgba(10,12,14,0.82) 0%, rgba(10,12,14,0.66) 36%, rgba(10,12,14,0.32) 100%), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <AppBar
          position="absolute"
          elevation={0}
          sx={{
            top: { xs: 64, md: 48 },
            bgcolor: "transparent",
            boxShadow: "none",
          }}
        >
          <Toolbar
            sx={{
              maxWidth: 1240,
              mx: "auto",
              width: "100%",
              px: { xs: 2, md: 3 },
              py: 0,
              minHeight: "auto !important",
            }}
          >
            <Box
              sx={{
                width: "100%",
                borderRadius: 999,
                bgcolor: header.headerBg,
                border: `1px solid ${header.borderColor}`,
                px: { xs: 1.5, md: 2.5 },
                py: 1.1,
                display: "grid",
                gridTemplateColumns: { xs: "1fr auto", md: "220px 1fr 220px" },
                alignItems: "center",
                gap: 2,
                backdropFilter: "blur(18px)",
              }}
            >
              <Stack direction="row" spacing={1.1} alignItems="center">
                <Box
                  component="img"
                  src={header.logoSrc}
                  alt={data.name}
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: 999,
                    objectFit: "cover",
                    border: "1px solid rgba(255,255,255,0.18)",
                    bgcolor: "#ffffff",
                    p: 0.25,
                  }}
                />
                <Typography
                  sx={{
                    fontWeight: 800,
                    letterSpacing: "-0.03em",
                    color: "#ffffff",
                  }}
                >
                  {header.brand}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={3}
                justifyContent="center"
                sx={{ display: { xs: "none", md: "flex" } }}
              >
                {header.navItems.map((item) => (
                  <Box
                    key={item.id}
                    component="button"
                    type="button"
                    onClick={() => scrollToSection(item.id)}
                    sx={{
                      border: 0,
                      p: 0,
                      bgcolor: "transparent",
                      color: "rgba(255,255,255,0.86)",
                      cursor: "pointer",
                      fontFamily: theme.fontFamily,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      "&:hover": { color: "#b8ff2c" },
                    }}
                  >
                    {item.label}
                  </Box>
                ))}
              </Stack>

              <Stack direction="row" justifyContent="flex-end">
                <Button
                  href={data.contact.phone ? `tel:${data.contact.phone}` : undefined}
                  sx={{
                    minWidth: 0,
                    borderRadius: 999,
                    px: 2.2,
                    py: 0.9,
                    bgcolor: "#2d3339",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: "0.78rem",
                    "&:hover": { bgcolor: "#1f2429" },
                  }}
                >
                  {data.contact.phone || "Call First"}
                </Button>
              </Stack>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ pt: { xs: 24, md: 30 }, pb: { xs: 10, md: 12 } }}>
          <Box sx={{ maxWidth: 560 }}>
            <Typography
              sx={{
                fontSize: { xs: "2.5rem", md: "4rem" },
                lineHeight: 0.98,
                letterSpacing: "-0.05em",
                fontWeight: 900,
                mb: 2.5,
              }}
            >
              Top-Notch Plumbing
              <br />
              & Repair Solutions,
              <br />
              Quality Work.
            </Typography>
            <Typography
              sx={{
                maxWidth: 480,
                color: "rgba(255,255,255,0.78)",
                fontSize: { xs: "0.98rem", md: "1.05rem" },
                lineHeight: 1.7,
                mb: 3.5,
              }}
            >
              Fast local support, skilled technicians, and cleaner repairs for homes,
              remodels, and urgent plumbing problems.
            </Typography>
            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                endIcon={<ArrowRight size={16} />}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1.25,
                  bgcolor: "#b8ff2c",
                  color: "#111418",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#a5ed17" },
                }}
              >
                Get A Quote
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhoneCall size={16} />}
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1.25,
                  borderColor: "rgba(255,255,255,0.28)",
                  color: "#ffffff",
                  fontWeight: 700,
                  "&:hover": {
                    borderColor: "#b8ff2c",
                    bgcolor: "rgba(255,255,255,0.04)",
                  },
                }}
              >
                See All Services
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      <Box
        sx={{
          bgcolor: "#b8ff2c",
          color: "#101418",
          borderTop: "1px solid rgba(16,20,24,0.06)",
          borderBottom: "1px solid rgba(16,20,24,0.06)",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 1.6, overflow: "hidden" }}>
          <Stack
            direction="row"
            spacing={3.5}
            justifyContent="space-between"
            sx={{ minWidth: "max-content", fontWeight: 800, flexWrap: "nowrap" }}
          >
            {featureItems.map((item) => (
              <Stack key={item} direction="row" spacing={1} alignItems="center">
                <BadgeCheck size={16} />
                <Typography sx={{ fontSize: "0.88rem", whiteSpace: "nowrap" }}>
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Container>
      </Box>

      <Container id="about" maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: "center", maxWidth: 760, mx: "auto", mb: 6 }}>
          <Typography
            sx={{
              color: "#6d7d91",
              fontSize: "0.76rem",
              fontWeight: 800,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              mb: 1.4,
            }}
          >
            Welcome To {header.brand}
          </Typography>
          <Typography
            sx={{
              color: "#141b23",
              fontSize: { xs: "2rem", md: "3rem" },
              lineHeight: 1.12,
              letterSpacing: "-0.04em",
              fontWeight: 900,
              mb: 2.2,
            }}
          >
            With years of industry experience, our skilled team delivers top-notch
            solutions and exceptional service.
          </Typography>
          <Grid container spacing={2.5} justifyContent="center" sx={{ mb: 3.5 }}>
            {plumbingAboutImages.map((image, index) => (
              <Grid key={image} size={{ xs: 6, md: index === 1 ? 3.3 : 2.2 }}>
                <Box
                  sx={{
                    height: index === 1 ? { xs: 180, md: 220 } : { xs: 160, md: 190 },
                    borderRadius: 4,
                    overflow: "hidden",
                    boxShadow: "0 24px 50px rgba(16,24,40,0.12)",
                  }}
                >
                  <Box
                    component="img"
                    src={image}
                    alt="Plumbing team"
                    sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
          <Stack direction="row" spacing={{ xs: 2, md: 6 }} justifyContent="center" flexWrap="wrap" useFlexGap>
            {stats.map((stat) => (
              <Box key={stat.label}>
                <Typography sx={{ color: "#25324b", fontSize: "1.75rem", fontWeight: 900 }}>
                  {stat.value}
                </Typography>
                <Typography sx={{ color: "#6d7d91", fontSize: "0.82rem", fontWeight: 600 }}>
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Container>

      <Box id="services" sx={{ bgcolor: "#f8fbff", py: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="start">
            <Grid size={{ xs: 12, md: 5 }}>
              <Typography
                sx={{
                  color: "#6d7d91",
                  fontSize: "0.76rem",
                  fontWeight: 800,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  mb: 1.4,
                }}
              >
                Work Portfolio
              </Typography>
              <Typography
                sx={{
                  color: "#141b23",
                  fontSize: { xs: "2rem", md: "3rem" },
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                  fontWeight: 900,
                  mb: 2,
                }}
              >
                Featured
                <br />
                Completed Works
              </Typography>
              <Typography sx={{ color: "#6d7d91", lineHeight: 1.8, maxWidth: 420, mb: 3 }}>
                Explore our portfolio to see high-quality plumbing projects delivered
                with speed, clean execution, and reliable craftsmanship.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: 999,
                  px: 3,
                  py: 1.15,
                  borderColor: "#cfd8e3",
                  color: "#111418",
                  fontWeight: 800,
                }}
              >
                Get A Quote
              </Button>

              <Stack spacing={2} sx={{ mt: 4 }}>
                {highlightCards.map((item) => (
                  <Paper
                    key={item.title}
                    elevation={0}
                    sx={{
                      display: "flex",
                      gap: 1.6,
                      p: 2.2,
                      borderRadius: 3,
                      border: "1px solid #e3ebf5",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        borderRadius: 999,
                        bgcolor: "#eef5ff",
                        color: "#234f9f",
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </Box>
                    <Box>
                      <Typography sx={{ fontWeight: 800, color: "#141b23", mb: 0.4 }}>
                        {item.title}
                      </Typography>
                      <Typography sx={{ color: "#6d7d91", fontSize: "0.92rem", lineHeight: 1.6 }}>
                        {item.text}
                      </Typography>
                    </Box>
                  </Paper>
                ))}
              </Stack>
            </Grid>

            <Grid id="gallery" size={{ xs: 12, md: 7 }}>
              <Grid container spacing={2.2}>
                {(galleryItems.length ? galleryItems : plumbingAboutImages.map((url) => ({ url }))).map((item, index) => (
                  <Grid key={`${item.url}-${index}`} size={{ xs: 12, sm: 6 }}>
                    <Box
                      sx={{
                        position: "relative",
                        height: { xs: 280, md: index > 1 ? 260 : 320 },
                        borderRadius: 4,
                        overflow: "hidden",
                        boxShadow: "0 28px 56px rgba(10,20,40,0.12)",
                      }}
                    >
                      <Box
                        component="img"
                        src={item.url}
                        alt={item.alt || item.caption || "Plumbing work"}
                        sx={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                      />
                      <Box
                        sx={{
                          position: "absolute",
                          inset: 0,
                          background:
                            "linear-gradient(180deg, rgba(8,10,12,0.04) 20%, rgba(8,10,12,0.74) 100%)",
                        }}
                      />
                      <Typography
                        sx={{
                          position: "absolute",
                          left: 18,
                          bottom: 18,
                          color: "#ffffff",
                          fontSize: "1.12rem",
                          fontWeight: 800,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {item.caption || data.services?.[index]?.name || `Project ${index + 1}`}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Box id="contact" sx={{ bgcolor: "#101418", py: { xs: 7, md: 8 } }}>
        <Container maxWidth="lg">
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
          >
            <Box>
              <Typography
                sx={{
                  color: "#ffffff",
                  fontSize: { xs: "1.8rem", md: "2.4rem" },
                  lineHeight: 1.08,
                  letterSpacing: "-0.04em",
                  fontWeight: 900,
                  mb: 1,
                }}
              >
                Need a reliable plumbing team?
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,0.68)", maxWidth: 520 }}>
                Book a quick visit, request a quote, or call for emergency support.
              </Typography>
            </Box>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.4}>
              <Button
                variant="contained"
                href={data.contact.phone ? `tel:${data.contact.phone}` : undefined}
                sx={{
                  borderRadius: 999,
                  px: 3.2,
                  py: 1.25,
                  bgcolor: "#b8ff2c",
                  color: "#111418",
                  fontWeight: 800,
                  "&:hover": { bgcolor: "#a5ed17" },
                }}
              >
                {data.contact.phone || "Call Now"}
              </Button>
              <Button
                variant="outlined"
                href={data.contact.email ? `mailto:${data.contact.email}` : undefined}
                sx={{
                  borderRadius: 999,
                  px: 3.2,
                  py: 1.25,
                  borderColor: "rgba(255,255,255,0.18)",
                  color: "#ffffff",
                  fontWeight: 700,
                }}
              >
                {data.contact.email || "Request Estimate"}
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <ModernFooter data={data} theme={theme} />
    </Box>
  );
}

function ModernHeader({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ModernThemeType;
}) {
  const header = getHeaderConfig(data, theme);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: { xs: 64, md: 48 },
        left: 0,
        right: 0,
        bgcolor: header.headerBg,
        color: header.textColor,
        boxShadow: "none",
        borderBottom: `1px solid ${header.borderColor}`,
        backdropFilter: "blur(10px)",
      }}
    >
      <Toolbar
        sx={{
          maxWidth: 1240,
          mx: "auto",
          width: "100%",
          px: { xs: 2, md: 3 },
          py: { xs: 1, md: 1.25 },
          minHeight: "auto !important",
          display: "grid",
          gridTemplateColumns: { xs: "1fr auto", md: "240px 1fr 220px" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{ minWidth: 0 }}
        >
          {header.logoType === "image" ? (
            <Box
              component="img"
              src={header.logoSrc}
              alt={data.name}
              sx={{
                width: { xs: 42, md: 48 },
                height: { xs: 42, md: 48 },
                objectFit: "contain",
                borderRadius: 2,
                display: "block",
                border: `1px solid ${header.borderColor}`,
                bgcolor: "#ffffff",
                p: 0.4,
              }}
            />
          ) : (
            <Box
              sx={{
                width: { xs: 42, md: 48 },
                height: { xs: 42, md: 48 },
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                background: header.logoBadgeBg,
                color: "#ffffff",
                fontFamily: '"Playfair Display", Georgia, serif',
                fontWeight: 700,
                fontSize: { xs: "0.9rem", md: "1rem" },
                boxShadow: "0 10px 24px rgba(0,0,0,0.16)",
              }}
            >
              {header.brand.charAt(0)}
            </Box>
          )}
        </Stack>

        <Stack
          direction="row"
          spacing={{ xs: 1.6, md: 3.2 }}
          sx={{
            justifyContent: "center",
            display: { xs: "none", md: "flex" },
            alignItems: "center",
          }}
        >
          {header.navItems.map((item) => (
            <Box
              key={item.id}
              component="button"
              type="button"
              onClick={() => scrollToSection(item.id)}
              sx={{
                border: 0,
                p: 0,
                bgcolor: "transparent",
                color: header.textColor,
                cursor: "pointer",
                fontFamily: theme.fontFamily,
                fontWeight: 600,
                fontSize: "0.82rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                transition: "opacity 160ms ease, color 160ms ease",
                "&:hover": {
                  color: theme.primaryColor,
                  opacity: 1,
                },
              }}
            >
              {item.label}
            </Box>
          ))}
        </Stack>

        <Stack direction="row" justifyContent="flex-end">
          {data.contact.phone && (
            <Button
              variant="contained"
              size="small"
              href={`tel:${data.contact.phone}`}
              sx={{
                bgcolor: header.ctaBg,
                color: header.ctaText,
                fontWeight: 700,
                borderRadius: 999,
                px: { xs: 2.2, md: 3 },
                py: 0.95,
                whiteSpace: "nowrap",
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                "&:hover": {
                  bgcolor: header.ctaBg,
                  color: header.ctaText,
                  filter: "brightness(0.92)",
                  boxShadow: "0 12px 28px rgba(0,0,0,0.24)",
                },
              }}
            >
              {header.ctaLabel || data.contact.phone}
            </Button>
          )}
        </Stack>
      </Toolbar>
    </AppBar>
  );
}

function ModernFooter({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ReturnType<typeof buildModernTheme>;
}) {
  const social = data.socialLinks;
  return (
    <Box sx={{ bgcolor: "#1a202c", py: 6, px: 3, textAlign: "center" }}>
      <Typography
        variant="h6"
        sx={{
          fontFamily: theme.fontFamily,
          fontWeight: 800,
          color: "#fff",
          mb: 1,
        }}
      >
        {data.name}
      </Typography>
      {data.contact.address && (
        <Typography
          variant="body2"
          sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}
        >
          {data.contact.address}
        </Typography>
      )}
      {social && (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          {social.facebook && (
            <IconButton size="small" sx={{ color: "rgba(255,255,255,0.6)" }}>
              <Facebook size={18} />
            </IconButton>
          )}
          {social.instagram && (
            <IconButton size="small" sx={{ color: "rgba(255,255,255,0.6)" }}>
              <Instagram size={18} />
            </IconButton>
          )}
          {social.twitter && (
            <IconButton size="small" sx={{ color: "rgba(255,255,255,0.6)" }}>
              <Twitter size={18} />
            </IconButton>
          )}
          {social.linkedin && (
            <IconButton size="small" sx={{ color: "rgba(255,255,255,0.6)" }}>
              <Linkedin size={18} />
            </IconButton>
          )}
        </Stack>
      )}
      <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.4)" }}>
        © {new Date().getFullYear()} {data.name}. All rights reserved.
      </Typography>
    </Box>
  );
}

const ModernTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme = buildModernTheme(data.primaryColor, data.secondaryColor);
  const isPlumbingTemplate = data.name.toLowerCase().includes("proflow");

  if (isPlumbingTemplate) {
    return <PlumbingLanding data={data} theme={theme} />;
  }

  return (
    <Box sx={{ fontFamily: theme.fontFamily }}>
      <ModernHeader data={data} theme={theme} />
      <Box id="hero">
        <HeroBlock data={data} theme={theme} variant="photo" />
      </Box>
      <Box id="services">
        <ServicesBlock data={data} theme={theme} variant="cards" />
      </Box>
      <Box id="cta">
        <CTASection data={data} theme={theme} variant="gradient" />
      </Box>
      <Box id="gallery">
        <GalleryBlock data={data} theme={theme} variant="masonry" />
      </Box>
      <Box id="reviews">
        <ReviewsBlock data={data} theme={theme} variant="cards" />
      </Box>
      <Box id="contact">
        <ContactBlock data={data} theme={theme} variant="card" />
      </Box>
      <LocationBlock data={data} theme={theme} variant="map" />
      <ModernFooter data={data} theme={theme} />
    </Box>
  );
};

export default ModernTemplate;
