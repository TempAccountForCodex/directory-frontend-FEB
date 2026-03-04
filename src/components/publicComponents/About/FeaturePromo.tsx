import { Box, Container, Typography, Stack, Button, Grid } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "assets/publicAssets/images/common/darkhole.svg";

export default function AboutBusinessCTASection() {
  return (
    <Box
      sx={{
        backgroundColor: "#041e18",
        backgroundImage: `url(${star})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "#fff",
        py: { xs: 12, md: 22 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          height: "auto",
          zIndex: 0,
          backgroundImage: `url("${darkhole}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          aspectRatio: "2074 / 1333",
          top: "12%",
          left: "-70%",
          width: "280%",
          opacity: 0.5,
          "@media (min-width: 640px)": {
            top: "-4%",
            width: "130%",
            left: "-15%",
          },
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
        <Grid container spacing={8} alignItems="center">
          {/* LEFT CONTENT: TYPOGRAPHY ART */}
          <Grid item xs={12} md={7}>
            <Box sx={{ position: "relative" }}>
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: { xs: "1.2rem", md: "1.8rem" },
                  fontWeight: 900,
                  letterSpacing: 6,
                  textTransform: "uppercase",
                  mb: -2,
                }}
              >
                Built for
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "6rem", md: "11rem" },
                  fontWeight: 900,
                  lineHeight: 0.8,
                  color: "transparent",
                  WebkitTextStroke: "1px rgb(255 255 255 / 64%)",
                  mb: -4,
                }}
              >
                REAL
              </Typography>

              <Box sx={{ pl: { xs: 2, md: 8 } }}>
                <Typography
                  sx={{
                    fontSize: { xs: "3.8rem", sm: "5rem", md: "10rem" },
                    fontWeight: 900,
                    lineHeight: 1,
                    color: "#fff",
                    textShadow: "0 20px 50px rgba(55, 140, 146, 0.3)",
                  }}
                >
                  OWNERS
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: { xs: 1, sm: -2 } }}
                >
                  <Box
                    sx={{ height: "2px", width: "60px", bgcolor: "#378C92" }}
                  />
                  <Typography
                    sx={{
                      color: "#378C92",
                      fontWeight: 700,
                      fontSize: { xs: "0.7rem", sm: "1.1rem" },
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Made for businesses
                  </Typography>
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* RIGHT CONTENT: THE "AMAZING" UPDATED DESIGN */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                p: { xs: 4, sm: 10, md: 6 },
                borderRadius: "40px",
                background: "rgba(255, 255, 255, 0.03)",
                backdropFilter: "blur(15px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 40px 100px rgba(0,0,0,0.4)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Decorative corner glow */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  width: "100px",
                  height: "100px",
                  background:
                    "radial-gradient(circle, rgba(55, 140, 146, 0.2) 0%, transparent 70%)",
                  zIndex: -1,
                }}
              />

              <Stack spacing={4}>
                <Typography
                  sx={{
                    color: "#E0E0E0",
                    fontSize: { xs: "1.1rem", md: "1rem", lg: "1.25rem" },
                    lineHeight: 1.7,
                    fontWeight: 300,
                  }}
                >
                  Stop wasting months on development. We give you a
                  <Box
                    component="span"
                    sx={{ color: "#378C92", fontWeight: 700 }}
                  >
                    {" "}
                    professional landing page{" "}
                  </Box>
                  and
                  <Box
                    component="span"
                    sx={{ color: "#378C92", fontWeight: 700 }}
                  >
                    {" "}
                    global visibility{" "}
                  </Box>
                  in under 5 minutes.
                  <br />
                  <br />
                  No code. No design stress. <strong>Just growth.</strong>
                </Typography>

                <Stack spacing={2}>
                  <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    sx={{
                      background: "white",
                      color: "#000000ff",
                      py: 2.5,
                      borderRadius: "100px",
                      fontWeight: 800,
                      fontSize: { xs: "0.9rem", sm: "1.05rem" },
                      textTransform: "none",
                      boxShadow: "0 15px 30px rgba(55, 140, 146, 0.3)",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-3px)",
                        boxShadow: "0 20px 40px rgba(55, 140, 146, 0.5)",
                        background: "white",
                        color: "#000000ff",
                      },
                    }}
                  >
                    Create Your Free Page
                  </Button>

                  <Button
                    variant="outlined"
                    sx={{
                      borderColor: "rgba(255,255,255,0.3)",
                      color: "#fff",
                      py: 2.2,
                      borderRadius: "100px",
                      fontWeight: 600,
                      fontSize: "1.05rem",
                      textTransform: "none",
                      backdropFilter: "blur(5px)",
                      "&:hover": {
                        borderColor: "#fff",
                        bgcolor: "rgba(255,255,255,0.05)",
                      },
                    }}
                  >
                    Explore Directory
                  </Button>
                </Stack>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  justifyContent="center"
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#4db6ac",
                    }}
                  />
                  <Typography
                    sx={{
                      color: "rgba(255,255,255,0.5)",
                      fontSize: "0.85rem",
                      fontWeight: 500,
                      letterSpacing: 0.5,
                    }}
                  >
                    JOIN 50,000+ BUSINESSES
                  </Typography>
                </Stack>
              </Stack>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Bottom Gradient Fade */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "150px",
          background: "linear-gradient(to top, #041e18, transparent)",
          zIndex: 1,
        }}
      />
    </Box>
  );
}
