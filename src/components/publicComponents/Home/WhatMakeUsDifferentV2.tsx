import { Box, Container, Typography, Grid, Stack } from "@mui/material";
import LanguageIcon from "@mui/icons-material/Language";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";

const star = "/assets/publicAssets/images/common/star.svg";
const platform = "/assets/publicAssets/images/home/platform.webp";

const UniqueSellingSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        bgcolor: "#000",
        color: "#fff",
        minHeight: "100vh",
        pt: { xs: 4, sm: 6, md: 10 },
        pb: { xs: 8, md: 12 },
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${star})`,
        backgroundSize: "cover",
      }}
    >
      <Container maxWidth="lg">
        {/* Main Header */}
        <Typography
          variant="h1"
          align="center"
          sx={{
            fontWeight: 500,
            fontSize: { xs: "2rem", md: "3.5rem", lg: "4.5rem" },
            lineHeight: 1.1,
            mb: { xs: 8, md: 12 },
            letterSpacing: "-0.03em",
          }}
        >
          Build your brand. <br /> Get found instantly.
        </Typography>

        <Grid container spacing={8} alignItems="center">
          {/* Left Content Column */}
          <Grid item xs={12} md={6} lg={5}>
            <Stack spacing={6}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 500,
                  fontSize: { xs: "1.5rem", md: "2.3rem" },
                  letterSpacing: "-0.02em",
                  maxWidth: "450px",
                  lineHeight: 1.2,
                }}
              >
                The only platform that builds your site and your audience.
              </Typography>

              <Grid container spacing={0}>
                {/* USP 1: Landing Page */}
                <Grid item xs={12} sm={6}>
                  <Stack spacing={1}>
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{ color: theme.palette.text.secondary }}
                    >
                      <LanguageIcon sx={{ fontSize: 16 }} />
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          letterSpacing: 1,
                        }}
                      >
                        FREE LANDING PAGE
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "2.5rem", md: "3.5rem" },
                      }}
                    >
                      $0
                    </Typography>
                    <Box
                      sx={{
                        borderLeft: `2px solid ${theme.palette.text.main}`,
                        pl: 2,
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}
                      >
                        Get a high-converting{" "}
                        <strong>Carrd-style website</strong> for your business.
                        No code, no cost, no hosting fees.
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>

                {/* USP 2: Directory */}
                <Grid item xs={12} sm={6}>
                  <Stack
                    spacing={1}
                    sx={{
                      paddingLeft: { xs: "0px", sm: "20px" },
                      paddingTop: { xs: "40px", sm: "0px" },
                    }}
                  >
                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{
                        color: theme.palette.text.secondary,
                      }}
                    >
                      <SearchIcon sx={{ fontSize: 16 }} />
                      <Typography
                        variant="caption"
                        sx={{ fontWeight: 700, letterSpacing: 1 }}
                      >
                        BUSINESS DIRECTORY
                      </Typography>
                    </Stack>
                    <Typography
                      variant="h2"
                      sx={{
                        fontWeight: 500,
                        fontSize: { xs: "2.5rem", md: "3.5rem" },
                      }}
                    >
                      Live
                    </Typography>
                    <Box
                      sx={{
                        borderLeft: `2px solid ${theme.palette.text.main}`,
                        pl: 2,
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6 }}
                      >
                        Automatic presence on our{" "}
                        <strong>Global Directory</strong>. Be searchable and
                        discoverable by high-intent customers.
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              {/* Added Benefit Callout */}
              <Box
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
                  One Dashboard. Zero Friction.
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.6)" }}
                >
                  Manage your website and your directory listing in one place.
                  No design skills required—just your vision.
                </Typography>
              </Box>
            </Stack>
          </Grid>

          {/* Right Visual Column (Kept as requested) */}
          <Grid item xs={12} md={6} lg={7} sx={{ position: "relative" }}>
            <Box
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "70%",
                height: "70%",
                background:
                  "radial-gradient(circle, rgba(46, 224, 154, 0.1) 0%, transparent 75%)",
                filter: "blur(60px)",
                zIndex: 0,
              }}
            />

            <Box
              sx={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                "@keyframes float": {
                  "0%, 100%": { transform: "translateY(0)" },
                  "50%": { transform: "translateY(-15px)" },
                },
                animation: "float 6s ease-in-out infinite",
              }}
            >
              <Box
                component="img"
                // src={COMPOSITE_HERO_IMAGE}
                src={platform}
                srcSet={`${platform} 1200w, ${platform} 1920w`}
                sizes="(max-width: 900px) 95vw, 800px"
                alt="Business Landing Page Interface"
                loading="lazy"
                decoding="async"
                sx={{
                  width: "100%",
                  height: "auto",
                  maxWidth: "800px",
                  display: "block",
                }}
              />
            </Box>
          </Grid>
        </Grid>

        {/* Updated Footer Disclaimer */}
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 8,
            color: "rgba(255,255,255,0.4)",
            fontSize: "0.75rem",
            textAlign: "center",
          }}
        >
          Everything you need to launch and scale your online presence, 100%
          free of charge.
        </Typography>
      </Container>
    </Box>
  );
};

export default UniqueSellingSection;
