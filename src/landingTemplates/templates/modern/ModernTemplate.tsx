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

function ModernHeader({ data, theme }: { data: TemplateProps["data"]; theme: ReturnType<typeof buildModernTheme> }) {
  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: theme.bgPrimary,
        borderBottom: `1px solid ${theme.borderColor}`,
        color: theme.headingColor,
      }}
    >
      <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%", px: 3 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.primaryColor,
            flexGrow: 1,
          }}
        >
          {data.name}
        </Typography>
        {data.contact.phone && (
          <Button
            variant="contained"
            size="small"
            sx={{
              bgcolor: theme.primaryColor,
              fontWeight: 700,
              borderRadius: 999,
              px: 3,
              display: { xs: "none", sm: "flex" },
              "&:hover": { bgcolor: theme.primaryColor, filter: "brightness(0.9)" },
            }}
          >
            {data.contact.phone}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
}

function ModernFooter({ data, theme }: { data: TemplateProps["data"]; theme: ReturnType<typeof buildModernTheme> }) {
  const social = data.socialLinks;
  return (
    <Box sx={{ bgcolor: "#1a202c", py: 6, px: 3, textAlign: "center" }}>
      <Typography
        variant="h6"
        sx={{ fontFamily: theme.fontFamily, fontWeight: 800, color: "#fff", mb: 1 }}
      >
        {data.name}
      </Typography>
      {data.contact.address && (
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)", mb: 3 }}>
          {data.contact.address}
        </Typography>
      )}
      {social && (
        <Stack direction="row" spacing={1} justifyContent="center" sx={{ mb: 3 }}>
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
      <HeroBlock data={data} theme={theme} variant="photo" />
      <ServicesBlock data={data} theme={theme} variant="cards" />
      <CTASection data={data} theme={theme} variant="gradient" />
      <GalleryBlock data={data} theme={theme} variant="masonry" />
      <ReviewsBlock data={data} theme={theme} variant="cards" />
      <ContactBlock data={data} theme={theme} variant="card" />
      <LocationBlock data={data} theme={theme} variant="map" />
      <ModernFooter data={data} theme={theme} />
    </Box>
  );
};

export default ModernTemplate;
