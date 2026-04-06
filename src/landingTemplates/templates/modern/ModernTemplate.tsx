import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Stack,
  IconButton,
} from "@mui/material";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
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
