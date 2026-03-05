import { Box, Container, Grid, Typography, Stack } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { PrimaryActionButton } from "../../UI/PrimaryActionButton";

const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "assets/publicAssets/images/common/darkhole.svg";

export default function AboutHeroModern({ accent, eyebrow, title, bg }) {
  const theme = useTheme();
  const ACCENT = accent || "#00F2FE";

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        height: "70vh",
        backgroundColor: "#041e18",
        backgroundImage: `url(${star})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background Shape */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 0,
          backgroundImage: `url("${darkhole}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          aspectRatio: "2074 / 1333",
          top: "12%",
          left: "-70%",
          width: "280%",
          opacity: 0.4,
          "@media (min-width: 640px)": {
            top: "-4%",
            width: "130%",
            left: "-15%",
          },
        }}
      />

      {/* Map */}
      <Box
        component="img"
        src={bg}
        alt="About page hero graphic"
        decoding="async"
        fetchPriority="high"
        sx={{
          position: "absolute",
          top: { xs: "0%", lg: "-10%" },
          right: "0%",
          width: { xs: "60%", sm: "48%" },
          zIndex: 1,
          mixBlendMode: "screen",
          opacity: { xs: 0.6, lg: 0.7 },
          maskImage: "linear-gradient(to left, black 40%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
        <Grid container>
          <Grid item xs={12} sm={10} md={8} lg={7}>
            {/* ===== MASSIVE BACKGROUND WORD ===== */}
            <Typography
              sx={{
                position: "absolute",
                top: { sm: "0px", lg: "-40px" },
                left: 0,
                fontSize: {
                  xs: "3rem",
                  sm: "4rem",
                  md: "10rem",
                  lg: "12rem",
                },
                fontWeight: 900,
                color: "rgb(255 255 255 / 10%)",
                lineHeight: 1,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              BUILT
            </Typography>

            {/* ===== EYEBROW ===== */}
            <Typography
              sx={{
                color: alpha("#fff", 0.6),
                letterSpacing: "0.35em",
                fontSize: "0.8rem",
                fontWeight: 600,
                mb: 2,
                visibility: "hidden", //do not changee this
              }}
            >
              {eyebrow || "BUILT FOR BUSINESSES"}
            </Typography>

            {/* ===== MAIN HEADLINE ===== */}

            <Typography
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: "2.5rem",
                  sm: "3.8rem",
                  md: "4.8rem",
                  lg: "5.2rem",
                },
                lineHeight: 0.95,
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,0.8)",
                letterSpacing: "-0.03em",
                mb: 3,
                textShadow: `0 0 30px ${alpha(ACCENT, 0.2)}`,
              }}
            >
              {title}
            </Typography>

            {/* ===== ACCENT LABEL ===== */}
            <Stack direction="row" alignItems="center" spacing={2} mb={5}>
              <Box
                sx={{
                  width: 60,
                  height: "2px",
                  backgroundColor: "white",
                }}
              />
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  fontSize: "0.85rem",
                }}
              >
                MADE FOR BUSINESSES
              </Typography>
            </Stack>

            {/* ===== CTA AREA ===== */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, sm: 5 }}
              alignItems={{ xs: "flex-start", sm: "center" }}
            >
              <PrimaryActionButton size="large" to="/signup">
                Get Started
              </PrimaryActionButton>

              <Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1.4rem",
                  }}
                >
                  10k+
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: "#fff",
                    letterSpacing: "0.15em",
                  }}
                >
                  BUSINESSES SCALING
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
