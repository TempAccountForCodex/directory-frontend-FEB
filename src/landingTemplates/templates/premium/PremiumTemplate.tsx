import React from "react";
import { Box, Typography, Stack, IconButton, Grid } from "@mui/material";
import { Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { TemplateProps } from "../../templateEngine/types";
import { buildPremiumTheme } from "./premiumTheme";
import {
  HeroBlock,
  ServicesBlock,
  GalleryBlock,
  ReviewsBlock,
  ContactBlock,
  LocationBlock,
  CTASection,
} from "../../blocks";
import FadeIn from "../../blocks/FadeIn";

function PremiumHeader({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ReturnType<typeof buildPremiumTheme>;
}) {
  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        bgcolor: "rgba(10,10,15,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${theme.borderColor}`,
        display: "flex",
        alignItems: "center",
        px: { xs: 3, md: 6 },
        py: 2.5,
      }}
    >
      <Typography
        sx={{
          fontFamily: theme.fontFamily,
          fontWeight: 700,
          fontSize: "1.25rem",
          color: theme.headingColor,
          flexGrow: 1,
          letterSpacing: 3,
          textTransform: "uppercase",
        }}
      >
        {data.name}
      </Typography>
      <Stack
        direction="row"
        spacing={4}
        sx={{ display: { xs: "none", md: "flex" } }}
      >
        {["Services", "Portfolio", "Reviews", "Contact"].map((item) => (
          <Typography
            key={item}
            variant="body2"
            sx={{
              fontFamily: "'Inter', sans-serif",
              color: theme.bodyColor,
              cursor: "pointer",
              letterSpacing: 1.5,
              textTransform: "uppercase",
              fontSize: "0.7rem",
              "&:hover": { color: theme.accentColor },
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

function MetricsStrip({
  theme,
}: {
  theme: ReturnType<typeof buildPremiumTheme>;
}) {
  const metrics = [
    { label: "Years of Experience", value: "15+" },
    { label: "Clients Served", value: "500+" },
    { label: "Projects Completed", value: "1,200+" },
    { label: "Client Satisfaction", value: "99%" },
  ];
  return (
    <Box
      sx={{
        bgcolor: theme.bgWhite,
        borderTop: `1px solid ${theme.borderColor}`,
        borderBottom: `1px solid ${theme.borderColor}`,
      }}
    >
      <Grid container sx={{ maxWidth: 1200, mx: "auto" }}>
        {metrics.map((m, i) => (
          <Grid item xs={6} md={3} key={i}>
            <FadeIn delay={i * 0.1}>
              <Box
                sx={{
                  py: 4,
                  textAlign: "center",
                  borderRight:
                    i < 3 ? `1px solid ${theme.borderColor}` : "none",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: theme.fontFamily,
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    color: theme.accentColor,
                  }}
                >
                  {m.value}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: theme.bodyColor,
                    letterSpacing: 1.5,
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                  }}
                >
                  {m.label}
                </Typography>
              </Box>
            </FadeIn>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function PremiumFooter({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ReturnType<typeof buildPremiumTheme>;
}) {
  const social = data.socialLinks;
  return (
    <Box
      sx={{
        bgcolor: theme.bgPrimary,
        borderTop: `1px solid ${theme.borderColor}`,
        py: 6,
        px: 3,
        textAlign: "center",
      }}
    >
      <Typography
        sx={{
          fontFamily: theme.fontFamily,
          fontSize: "1.5rem",
          fontWeight: 700,
          color: theme.headingColor,
          letterSpacing: 4,
          textTransform: "uppercase",
          mb: 2,
        }}
      >
        {data.name}
      </Typography>
      {social && (
        <Stack
          direction="row"
          spacing={1}
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          {social.facebook && (
            <IconButton
              size="small"
              sx={{
                color: theme.bodyColor,
                "&:hover": { color: theme.accentColor },
              }}
            >
              <Facebook size={16} />
            </IconButton>
          )}
          {social.instagram && (
            <IconButton
              size="small"
              sx={{
                color: theme.bodyColor,
                "&:hover": { color: theme.accentColor },
              }}
            >
              <Instagram size={16} />
            </IconButton>
          )}
          {social.twitter && (
            <IconButton
              size="small"
              sx={{
                color: theme.bodyColor,
                "&:hover": { color: theme.accentColor },
              }}
            >
              <Twitter size={16} />
            </IconButton>
          )}
          {social.linkedin && (
            <IconButton
              size="small"
              sx={{
                color: theme.bodyColor,
                "&:hover": { color: theme.accentColor },
              }}
            >
              <Linkedin size={16} />
            </IconButton>
          )}
        </Stack>
      )}
      <Box
        sx={{
          width: 40,
          height: 1,
          bgcolor: theme.accentColor,
          mx: "auto",
          mb: 3,
        }}
      />
      <Typography
        variant="caption"
        sx={{ color: theme.bodyColor, letterSpacing: 1 }}
      >
        © {new Date().getFullYear()} {data.name}. All rights reserved.
      </Typography>
    </Box>
  );
}

const PremiumTemplate: React.FC<TemplateProps> = ({ data }) => {
  const theme = buildPremiumTheme(data.primaryColor, data.secondaryColor);
  return (
    <Box sx={{ fontFamily: theme.fontFamily, bgcolor: theme.bgPrimary }}>
      <PremiumHeader data={data} theme={theme} />
      <HeroBlock data={data} theme={theme} variant="dark" />
      {/* dark variant now uses gallery[0] as bg image with deep overlay */}
      <MetricsStrip theme={theme} />
      <ServicesBlock data={data} theme={theme} variant="grid" />
      <GalleryBlock data={data} theme={theme} variant="cinema" />
      <ReviewsBlock data={data} theme={theme} variant="featured" />
      <CTASection data={data} theme={theme} variant="dark" />
      <ContactBlock data={data} theme={theme} variant="dark" />
      <LocationBlock data={data} theme={theme} variant="compact" />
      <PremiumFooter data={data} theme={theme} />
    </Box>
  );
};

export default PremiumTemplate;
