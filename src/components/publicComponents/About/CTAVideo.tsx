import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Paper,
  alpha,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useEffect, useRef, useState } from "react";
const CTAVideo = "/assets/publicAssets/videos/About/aboutCTA.mp4";
const CTAPoster = "/assets/publicAssets/images/about/aboutUsCta.webp";
const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

export default function VideoHeroOverlay() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isVisible, setIsVisible] = useState(false);
  const [shouldPlay, setShouldPlay] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          if (!isMobile) setShouldPlay(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [isMobile]);

  return (
    <Box
      ref={sectionRef}
      sx={{
        bgcolor: "#F8F9FA",
        pt: { xs: 10, md: 15 },
        pb: { xs: 8, md: 10 },
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${uniqueLinesbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.6,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ zIndex: 9, position: "relative" }}>
        {/* ================= HEADER SECTION ================= */}
        <Grid
          container
          spacing={4}
          sx={{ mb: { xs: 6, md: 8 } }}
          alignItems="flex-start"
        >
          <Grid item xs={12} md={7}>
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                fontSize: { xs: "2rem", md: "4rem" },
                lineHeight: 1.1,
                color: "#1A1A1A",
                letterSpacing: "-0.03em",
              }}
            >
              Expert guidance,
              <br />
              tailored solutions
            </Typography>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack spacing={3}>
              <Typography
                sx={{
                  color: "#666",
                  fontSize: "1.1rem",
                  lineHeight: 1.6,
                }}
              >
                We remove technical barriers so you can focus on growth. Get a
                professional landing page and built-in directory visibility
                instantly and for free.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  sx={{
                    background:
                      "linear-gradient(135deg, #378C92 0%, #010202 100%)",
                    borderRadius: "50px",
                    px: 4,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "white",
                  }}
                >
                  Get Started →
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderRadius: "50px",
                    px: 4,
                    color: "#000000ff",
                    borderColor: "#E0E0E0",
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: { xs: "0.675rem", sm: "0.875rem" },
                  }}
                >
                  Free trial
                </Button>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        {/* ================= VIDEO SECTION ================= */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
            aspectRatio: "16 / 9", // Matches the cinematic look of the image
            mb: 8,
          }}
        >
          <video
            autoPlay={shouldPlay}
            muted
            loop
            playsInline
            preload="none"
            poster={CTAPoster}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          >
            {isVisible ? <source src={CTAVideo} type="video/mp4" /> : null}
          </video>

          {/* Play Button Overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.1)",
            }}
          >
            <Box
              onClick={() => setShouldPlay(true)}
              sx={{
                width: 80,
                height: 80,
                bgcolor: "#fff",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "transform 0.3s ease",
                "&:hover": { transform: "scale(1.1)" },
              }}
            >
              <PlayArrowIcon sx={{ color: "#0e453aff", fontSize: 40 }} />
            </Box>
          </Box>
        </Box>

        {/* ================= STATS SECTION ================= */}
        <Box
          sx={{
            borderRadius: "32px",
            p: { xs: 4, md: 5 },
            bgcolor: "#FFFFFF",
            border: "1px solid",
            borderColor: alpha("#E0E0E0", 0.6),
            boxShadow: "0 15px 35px rgba(0,0,0,0.03)",
            position: "relative",
          }}
        >
          <Grid container spacing={2}>
            {[
              { label: "95%", sub: "Customer satisfaction" },
              { label: "10+", sub: "Simple growth tools" },
              { label: "Free", sub: "Landing page forever" },
              { label: "50m", sub: "Global directory reach" },
            ].map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Stack
                  alignItems="center"
                  textAlign="center"
                  sx={{
                    borderRight: {
                      md:
                        index !== 3
                          ? `1px solid ${alpha("#000", 0.05)}`
                          : "none",
                    },
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      color: "#1A1A1A",
                      fontSize: { xs: "1.5rem", md: "2.8rem" },
                      mb: 0.5,
                    }}
                  >
                    {stat.label}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#888",
                      fontWeight: 500,
                      fontSize: { xs: "0.75rem", sm: "0.95rem" },
                    }}
                  >
                    {stat.sub}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
