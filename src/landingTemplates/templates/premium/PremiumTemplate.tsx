import React from "react";
import { Box, Typography, Stack, IconButton, Grid, Button } from "@mui/material";
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

function scrollToSection(sectionId: string) {
  const section = document.getElementById(sectionId);
  if (!section) return;
  section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function isConsultingTemplate(data: TemplateProps["data"]) {
  return data.name.toLowerCase().includes("meridian advisory");
}

function ConsultingHeader({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ReturnType<typeof buildPremiumTheme>;
}) {
  const navItems = [
    { label: "Capabilities", id: "services" },
    { label: "Advisory", id: "overview" },
    { label: "Results", id: "reviews" },
    { label: "Contact", id: "contact" },
  ];

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        bgcolor: "rgba(7,12,22,0.88)",
        backdropFilter: "blur(18px)",
        borderBottom: `1px solid ${theme.borderColor}`,
        px: { xs: 3, md: 6 },
        py: 2.2,
      }}
    >
      <Box
        sx={{
          maxWidth: 1240,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr auto", md: "260px 1fr 220px" },
          alignItems: "center",
          gap: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Inter', sans-serif",
              fontWeight: 700,
              fontSize: "0.72rem",
              color: theme.accentColor,
              letterSpacing: 3,
              textTransform: "uppercase",
              mb: 0.6,
            }}
          >
            Finance Consulting
          </Typography>
          <Typography
            sx={{
              fontFamily: theme.fontFamily,
              fontWeight: 700,
              fontSize: { xs: "1.05rem", md: "1.2rem" },
              color: theme.headingColor,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {data.name}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={4}
          justifyContent="center"
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {navItems.map((item) => (
            <Typography
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              sx={{
                fontFamily: "'Inter', sans-serif",
                color: theme.bodyColor,
                cursor: "pointer",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontSize: "0.72rem",
                "&:hover": { color: theme.accentColor },
              }}
            >
              {item.label}
            </Typography>
          ))}
        </Stack>

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={() => scrollToSection("contact")}
            sx={{
              bgcolor: theme.accentColor,
              color: "#10131a",
              borderRadius: 999,
              px: 2.8,
              py: 1.05,
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              "&:hover": {
                bgcolor: theme.accentColor,
                color: "#10131a",
                filter: "brightness(0.94)",
              },
            }}
          >
            Book Consultation
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

function ConsultingHero({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ReturnType<typeof buildPremiumTheme>;
}) {
  const heroImage = data.gallery?.[0]?.url ?? data.gallery?.[1]?.url;
  const statItems = [
    { value: "500+", label: "finance engagements" },
    { value: "15+", label: "years advisory depth" },
    { value: "99%", label: "client satisfaction" },
  ];

  return (
    <Box
      id="hero"
      sx={{
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top right, rgba(201,168,76,0.14), transparent 30%), linear-gradient(180deg, #0a0d14 0%, #0e131c 100%)",
        px: { xs: 3, md: 6 },
        py: { xs: 8, md: 11 },
      }}
    >
      <Grid container spacing={{ xs: 5, md: 6 }} sx={{ maxWidth: 1240, mx: "auto", alignItems: "center" }}>
        <Grid item xs={12} md={6}>
          <FadeIn>
            <Typography
              sx={{
                color: theme.accentColor,
                fontSize: "0.78rem",
                letterSpacing: 4,
                textTransform: "uppercase",
                fontFamily: "'Inter', sans-serif",
                mb: 2,
              }}
            >
              Strategic Finance for Growth-Stage Teams
            </Typography>
            <Typography
              sx={{
                color: theme.headingColor,
                fontFamily: theme.fontFamily,
                fontSize: { xs: "2.6rem", md: "4.8rem" },
                lineHeight: 0.95,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                maxWidth: 700,
              }}
            >
              Financial strategy for ambitious companies.
            </Typography>
            <Typography
              sx={{
                mt: 2.5,
                color: theme.bodyColor,
                fontFamily: "'Inter', sans-serif",
                fontSize: { xs: "1rem", md: "1.08rem" },
                lineHeight: 1.9,
                maxWidth: 560,
              }}
            >
              {data.tagline || data.description}
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 4 }}>
              <Button
                variant="contained"
                onClick={() => scrollToSection("contact")}
                sx={{
                  bgcolor: theme.accentColor,
                  color: "#10131a",
                  borderRadius: 999,
                  px: 3.5,
                  py: 1.3,
                  fontWeight: 800,
                  "&:hover": { bgcolor: theme.accentColor, color: "#10131a", filter: "brightness(0.94)" },
                }}
              >
                Schedule a Call
              </Button>
              {data.contact.phone && (
                <Button
                  variant="outlined"
                  href={`tel:${data.contact.phone}`}
                  sx={{
                    borderColor: `${theme.accentColor}66`,
                    color: theme.headingColor,
                    borderRadius: 999,
                    px: 3.5,
                    py: 1.3,
                  }}
                >
                  {data.contact.phone}
                </Button>
              )}
            </Stack>
          </FadeIn>

          <Grid container spacing={2} sx={{ mt: 4 }}>
            {statItems.map((item, index) => (
              <Grid item xs={12} sm={4} key={item.label}>
                <FadeIn delay={0.1 + index * 0.06}>
                  <Box
                    sx={{
                      p: 2.4,
                      borderRadius: 3,
                      border: `1px solid ${theme.borderColor}`,
                      background: "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    }}
                  >
                    <Typography sx={{ color: theme.accentColor, fontFamily: theme.fontFamily, fontSize: "1.7rem", fontWeight: 700 }}>
                      {item.value}
                    </Typography>
                    <Typography sx={{ mt: 0.5, color: theme.bodyColor, fontSize: "0.82rem", letterSpacing: 1.1, textTransform: "uppercase" }}>
                      {item.label}
                    </Typography>
                  </Box>
                </FadeIn>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={6}>
          <FadeIn delay={0.08}>
            <Box
              sx={{
                position: "relative",
                minHeight: { xs: 420, md: 660 },
                overflow: "hidden",
                borderRadius: 4,
                border: `1px solid ${theme.borderColor}`,
                boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
              }}
            >
              {heroImage && (
                <Box component="img" src={heroImage} alt={data.name} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              )}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(7,10,16,0.18) 0%, rgba(7,10,16,0.72) 100%)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 24,
                  right: 24,
                  bottom: 24,
                  p: 3,
                  borderRadius: 3,
                  background: "rgba(7,12,22,0.76)",
                  border: `1px solid ${theme.borderColor}`,
                  backdropFilter: "blur(12px)",
                }}
              >
                <Typography sx={{ color: theme.accentColor, fontSize: "0.74rem", letterSpacing: 3, textTransform: "uppercase", mb: 1 }}>
                  CFO Advisory • Forecasting • Capital Planning
                </Typography>
                <Typography sx={{ color: theme.headingColor, fontFamily: theme.fontFamily, fontSize: { xs: "1.35rem", md: "1.9rem" }, lineHeight: 1.15, fontWeight: 700 }}>
                  Clear reporting, tighter forecasts, and decision support that leadership can use immediately.
                </Typography>
              </Box>
            </Box>
          </FadeIn>
        </Grid>
      </Grid>
    </Box>
  );
}

function ExecutiveOverview({
  data,
  theme,
}: {
  data: TemplateProps["data"];
  theme: ReturnType<typeof buildPremiumTheme>;
}) {
  const featuredImage = data.gallery?.[1]?.url ?? data.gallery?.[0]?.url;
  const capabilities = (data.services ?? []).slice(0, 4);

  return (
    <Box
      sx={{
        bgcolor: theme.bgPrimary,
        px: { xs: 3, md: 6 },
        py: { xs: 8, md: 12 },
      }}
    >
      <Grid
        container
        spacing={{ xs: 4, md: 6 }}
        sx={{
          maxWidth: 1240,
          mx: "auto",
          alignItems: "stretch",
        }}
      >
        <Grid item xs={12} md={6}>
          <FadeIn>
            <Box
              sx={{
                position: "relative",
                height: { xs: 420, md: 620 },
                borderRadius: 4,
                overflow: "hidden",
                border: `1px solid ${theme.borderColor}`,
                boxShadow: "0 24px 80px rgba(0,0,0,0.32)",
              }}
            >
              {featuredImage && (
                <Box
                  component="img"
                  src={featuredImage}
                  alt={data.name}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              )}
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(5,7,12,0.08) 0%, rgba(5,7,12,0.56) 100%)",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  left: 24,
                  right: 24,
                  bottom: 24,
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid rgba(255,255,255,0.14)",
                  bgcolor: "rgba(10,12,18,0.72)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <Typography
                  sx={{
                    color: theme.accentColor,
                    fontSize: "0.72rem",
                    letterSpacing: 3,
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                    mb: 1,
                  }}
                >
                  Executive Perspective
                </Typography>
                <Typography
                  sx={{
                    color: theme.headingColor,
                    fontFamily: theme.fontFamily,
                    fontSize: { xs: "1.4rem", md: "1.9rem" },
                    fontWeight: 700,
                    lineHeight: 1.12,
                  }}
                >
                  Finance advisory built for capital decisions, cleaner reporting, and measurable outcomes.
                </Typography>
              </Box>
            </Box>
          </FadeIn>
        </Grid>

        <Grid item xs={12} md={6}>
          <FadeIn delay={0.08}>
            <Stack spacing={3.5} sx={{ height: "100%", justifyContent: "center" }}>
              <Box>
                <Typography
                  sx={{
                    color: theme.accentColor,
                    fontSize: "0.74rem",
                    letterSpacing: 4,
                    textTransform: "uppercase",
                    fontFamily: "'Inter', sans-serif",
                    mb: 2,
                  }}
                >
                  About the Firm
                </Typography>
                <Typography
                  sx={{
                    color: theme.headingColor,
                    fontFamily: theme.fontFamily,
                    fontSize: { xs: "2.25rem", md: "3.6rem" },
                    lineHeight: 0.98,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    maxWidth: 560,
                    mb: 3,
                  }}
                >
                  Financial clarity for growth, performance, and transaction readiness.
                </Typography>
                <Typography
                  sx={{
                    color: theme.bodyColor,
                    fontFamily: "'Inter', sans-serif",
                    fontSize: { xs: "1rem", md: "1.06rem" },
                    lineHeight: 1.9,
                    maxWidth: 560,
                  }}
                >
                  {data.description}
                </Typography>
              </Box>

              <Grid container spacing={2}>
                {capabilities.map((service, index) => (
                  <Grid item xs={12} sm={6} key={service.name}>
                    <FadeIn delay={0.14 + index * 0.05}>
                      <Box
                        sx={{
                          height: "100%",
                          p: 2.5,
                          borderRadius: 3,
                          border: `1px solid ${theme.borderColor}`,
                          background:
                            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)",
                        }}
                      >
                        <Typography
                          sx={{
                            color: theme.accentColor,
                            fontSize: "0.72rem",
                            letterSpacing: 2.6,
                            textTransform: "uppercase",
                            fontFamily: "'Inter', sans-serif",
                            mb: 1,
                          }}
                        >
                          0{index + 1}
                        </Typography>
                        <Typography
                          sx={{
                            color: theme.headingColor,
                            fontFamily: theme.fontFamily,
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            mb: 1,
                          }}
                        >
                          {service.name}
                        </Typography>
                        <Typography
                          sx={{
                            color: theme.bodyColor,
                            fontFamily: "'Inter', sans-serif",
                            fontSize: "0.95rem",
                            lineHeight: 1.75,
                          }}
                        >
                          {service.description}
                        </Typography>
                      </Box>
                    </FadeIn>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </FadeIn>
        </Grid>
      </Grid>
    </Box>
  );
}

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
        gap: 3,
      }}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography
          sx={{
            fontFamily: "'Inter', sans-serif",
            fontWeight: 600,
            fontSize: "0.72rem",
            color: theme.accentColor,
            letterSpacing: 3,
            textTransform: "uppercase",
            mb: 0.5,
          }}
        >
          Strategic Advisory
        </Typography>
        <Typography
          sx={{
            fontFamily: theme.fontFamily,
            fontWeight: 700,
            fontSize: "1.25rem",
            color: theme.headingColor,
            letterSpacing: 3,
            textTransform: "uppercase",
          }}
        >
          {data.name}
        </Typography>
      </Box>
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
      <Button
        variant="outlined"
        sx={{
          display: { xs: "none", md: "inline-flex" },
          borderColor: `${theme.accentColor}66`,
          color: theme.headingColor,
          borderRadius: 999,
          px: 2.5,
          py: 1,
          letterSpacing: 1.2,
          fontSize: "0.72rem",
          textTransform: "uppercase",
          "&:hover": {
            borderColor: theme.accentColor,
            bgcolor: "rgba(255,255,255,0.03)",
          },
        }}
      >
        Book Consultation
      </Button>
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
        bgcolor: theme.bgSecondary,
        borderTop: `1px solid ${theme.borderColor}`,
        borderBottom: `1px solid ${theme.borderColor}`,
        px: { xs: 3, md: 6 },
        py: { xs: 6, md: 8 },
      }}
    >
      <Grid container spacing={2} sx={{ maxWidth: 1240, mx: "auto" }}>
        {metrics.map((m, i) => (
          <Grid item xs={6} md={3} key={i}>
            <FadeIn delay={i * 0.1}>
              <Box
                sx={{
                  py: 4,
                  px: 2.5,
                  textAlign: "center",
                  border: `1px solid ${theme.borderColor}`,
                  borderRadius: 3,
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: theme.fontFamily,
                    fontSize: "2.2rem",
                    fontWeight: 700,
                    color: theme.accentColor,
                    mb: 0.75,
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
                    display: "block",
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
  const consulting = isConsultingTemplate(data);
  return (
    <Box sx={{ fontFamily: theme.fontFamily, bgcolor: theme.bgPrimary }}>
      {consulting ? (
        <ConsultingHeader data={data} theme={theme} />
      ) : (
        <PremiumHeader data={data} theme={theme} />
      )}
      {consulting ? (
        <ConsultingHero data={data} theme={theme} />
      ) : (
        <HeroBlock data={data} theme={theme} variant="dark" />
      )}
      <Box id="overview">
        <ExecutiveOverview data={data} theme={theme} />
      </Box>
      <MetricsStrip theme={theme} />
      <Box id="services">
        <ServicesBlock data={data} theme={theme} variant="grid" />
      </Box>
      <GalleryBlock data={data} theme={theme} variant="cinema" />
      <Box id="reviews">
        <ReviewsBlock data={data} theme={theme} variant="featured" />
      </Box>
      <CTASection data={data} theme={theme} variant="dark" />
      <Box id="contact">
        <ContactBlock data={data} theme={theme} variant="dark" />
      </Box>
      <LocationBlock data={data} theme={theme} variant="compact" />
      <PremiumFooter data={data} theme={theme} />
    </Box>
  );
};

export default PremiumTemplate;
