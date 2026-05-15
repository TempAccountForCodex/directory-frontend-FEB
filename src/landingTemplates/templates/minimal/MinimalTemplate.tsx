import React from "react";
import { Box, Typography, Stack, IconButton } from "@mui/material";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import type { TemplateProps } from "../../templateEngine/types";
import { buildMinimalTheme } from "./minimalTheme";
import {
  HeroBlock,
  ServicesBlock,
  GalleryBlock,
  ReviewsBlock,
  ContactBlock,
  LocationBlock,
  CTASection,
} from "../../blocks";

function MinimalHeader({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ReturnType<typeof buildMinimalTheme>;
}) {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        bgcolor: theme.bgPrimary,
        borderBottom: `1px solid ${theme.borderColor}`,
        display: "flex",
        alignItems: "center",
        px: { xs: 3, md: 6 },
        py: 2,
      }}
    >
      <Typography
        sx={{
          fontFamily: theme.fontFamily,
          fontWeight: 700,
          fontSize: "1.1rem",
          color: theme.headingColor,
          flexGrow: 1,
          letterSpacing: 1,
          textTransform: "uppercase",
        }}
      >
        {data.name}
      </Typography>
      <Stack
        direction="row"
        spacing={3}
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        {["Services", "Gallery", "Reviews", "Contact"].map((item) => (
          <Typography
            key={item}
            variant="body2"
            sx={{
              fontFamily: theme.fontFamily,
              color: theme.bodyColor,
              cursor: "pointer",
              "&:hover": { color: theme.primaryColor },
              transition: "color 0.2s",
            }}
          >
            {item}
          </Typography>
        ))}
      </Stack>
    </Box>
  );
}

function MinimalFooter({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ReturnType<typeof buildMinimalTheme>;
}) {
  const social = data.socialLinks;
  return (
    <Box
      sx={{
        bgcolor: theme.bgPrimary,
        borderTop: `1px solid ${theme.borderColor}`,
        py: 5,
        px: 3,
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        maxWidth: 1200,
        mx: "auto",
      }}
    >
      <Typography
        variant="caption"
        sx={{ color: theme.bodyColor, fontFamily: theme.fontFamily }}
      >
        © {new Date().getFullYear()} {data.name}
      </Typography>
      {social && (
        <Stack direction="row" spacing={0.5}>
          {social.facebook && (
            <IconButton size="small" sx={{ color: theme.bodyColor }}>
              <Facebook size={16} />
            </IconButton>
          )}
          {social.instagram && (
            <IconButton size="small" sx={{ color: theme.bodyColor }}>
              <Instagram size={16} />
            </IconButton>
          )}
          {social.twitter && (
            <IconButton size="small" sx={{ color: theme.bodyColor }}>
              <Twitter size={16} />
            </IconButton>
          )}
          {social.linkedin && (
            <IconButton size="small" sx={{ color: theme.bodyColor }}>
              <Linkedin size={16} />
            </IconButton>
          )}
        </Stack>
      )}
    </Box>
  );
}

const MinimalTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme = buildMinimalTheme(data.primaryColor, data.secondaryColor);
  return (
    <Box sx={{ fontFamily: theme.fontFamily }}>
      <MinimalHeader data={data} theme={theme} />
      <HeroBlock data={data} theme={theme} variant="split" />
      <ServicesBlock data={data} theme={theme} variant="list" />
      <ReviewsBlock data={data} theme={theme} variant="quotes" />
      <GalleryBlock data={data} theme={theme} variant="strip" />
      <CTASection data={data} theme={theme} variant="outlined" />
      <ContactBlock data={data} theme={theme} variant="inline" />
      <LocationBlock data={data} theme={theme} variant="map" />
      <MinimalFooter data={data} theme={theme} />
    </Box>
  );
};

export default MinimalTemplate;
