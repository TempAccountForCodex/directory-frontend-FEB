import React from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Button,
  Stack,
  Chip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import BoltIcon from "@mui/icons-material/Bolt";
import VerifiedIcon from "@mui/icons-material/Verified";
import { useTheme } from "@mui/material/styles";
const star = "/assets/publicAssets/images/common/star.svg";

const PricingSection = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        py: { xs: 10, md: 15 },
        backgroundColor: "#030303",
        position: "relative",
        color: "white",
        backgroundImage: `url(${star})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        overflow: "hidden",
      }}
    >
      {/* --- BACKGROUND ART (Atmospheric Depth) --- */}
      <Box
        sx={{
          position: "absolute",
          top: "0%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          height: "100%",
          // backgroundImage: `radial-gradient(circle at 50% -20%, rgba(55, 140, 146, 0.15) 0%, transparent 50%)`,
          zIndex: 0,
        }}
      />

      {/* Subtle Grid Overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          maskImage:
            "radial-gradient(ellipse at center, black, transparent 80%)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* --- HEADER SECTION --- */}
        <Stack spacing={3} alignItems="center" textAlign="center" mb={10}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: 16, fill: "white" }} />}
            label=" PRICING & PLANS"
            sx={{
              px: 1.5,
              py: 1.8,
              height: "auto",
              borderRadius: 999,
              background: `${theme.palette.text.main}15`,
              border: `1px solid ${theme.palette.text.main}`,
              "& .MuiChip-label": {
                fontWeight: 700,
                fontSize: "0.75rem",
                color: theme.palette.text.secondary,
                letterSpacing: "0.5px",
                pl: 2,
              },
            }}
          />

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "3rem", md: "4.5rem" },
              lineHeight: 1.2,
              letterSpacing: "-0.05em",
            }}
          >
            Simple pricing. <br />
            <Box component="span" sx={{ opacity: 0.4 }}>
              Start free. Upgrade as you grow.
            </Box>
          </Typography>
        </Stack>

        <Grid container spacing={4} alignItems="stretch">
          {/* --- LEFT: THE FREE PLAN (Glass Card) --- */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                p: 5,
                height: "100%",
                borderRadius: "32px",
                background: "#061a1c",

                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(20px)",
                display: "flex",
                flexDirection: "column",
                transition: "0.3s ease",
                "&:hover": {
                  borderColor: "rgba(255,255,255,0.2)",
                  transform: "translateY(-5px)",
                },
                position: "relative",
                overflow: "hidden",
              }}
            >
              <Box sx={{ mb: 4 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                  Free Plan
                </Typography>
                <Typography
                  sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.95rem" }}
                >
                  Perfect for getting online instantly.
                </Typography>
              </Box>

              <Typography variant="h3" sx={{ fontWeight: 900, mb: 4 }}>
                $0{" "}
                <Box
                  component="span"
                  sx={{ fontSize: "1rem", opacity: 0.4, fontWeight: 500 }}
                >
                  / Always Free
                </Box>
              </Typography>

              <Stack spacing={2.5} sx={{ flexGrow: 1, mb: 5 }}>
                {[
                  "1 Business Listing",
                  "1 AI Landing Page",
                  "Basic Directory Visibility",
                  "SEO-ready Structure",
                  "Mobile Optimized",
                ].map((feature) => (
                  <Stack
                    key={feature}
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <VerifiedIcon
                      sx={{ color: "rgba(255, 255, 255, 0.95)", fontSize: 20 }}
                    />
                    <Typography sx={{ fontWeight: 500, fontSize: "0.95rem" }}>
                      {feature}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              <Button
                fullWidth
                sx={{
                  py: 2,
                  borderRadius: "16px",
                  background: "rgba(255,255,255,0.05)",
                  color: "white",
                  border: "1px solid rgba(255,255,255,0.1)",
                  fontWeight: 800,
                  textTransform: "none",
                  "&:hover": { background: "white", color: "black" },
                }}
              >
                Get Started
              </Button>

              <Typography
                sx={{
                  position: "absolute",
                  bottom: "30%", // Adjusted from 30% to sit lower, looks better for text
                  right: "-5%",
                  fontSize: "15rem", // "0$" is wider than an icon, so 15rem usually fits better
                  fontWeight: 900,
                  color: "rgba(34, 182, 193, 0.05)", // Very low opacity (0.05) so it doesn't distract from real text
                  zIndex: 0,
                  transform: "rotate(-10deg)", // Tilted slightly for a modern look
                  userSelect: "none",
                  pointerEvents: "none",
                  lineHeight: 1,
                  fontFamily: "Plus Jakarta Sans, sans-serif", // Matches high-end SaaS fonts
                }}
              >
                0$
              </Typography>
            </Box>
          </Grid>

          {/* --- RIGHT: THE PRO PLAN (Ultra-SaaS Card) --- */}
          <Grid item xs={12} md={7}>
            <Box
              sx={{
                position: "relative",
                height: "100%",
                borderRadius: "32px",
                p: "1px", // Space for the glowing edge
                background:
                  "linear-gradient(135deg, #378C92 0%, rgba(255,255,255,0.1) 50%, #B7943F 100%)",
              }}
            >
              <Box
                sx={{
                  p: { xs: 4, md: 6 },
                  height: "100%",
                  borderRadius: "31px",
                  background: "#080808",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Mesh Glow Internal */}
                <Box
                  sx={{
                    position: "absolute",
                    top: "-20%",
                    right: "-10%",
                    width: "400px",
                    height: "400px",
                    background:
                      "radial-gradient(circle, rgba(55, 140, 146, 0.25) 0%, transparent 70%)",
                    filter: "blur(80px)",
                    zIndex: 0,
                  }}
                />

                <Grid
                  container
                  spacing={4}
                  sx={{ position: "relative", zIndex: 1 }}
                >
                  <Grid item xs={12} sm={6.5}>
                    <Chip
                      label="MOST POPULAR"
                      sx={{
                        height: 24,
                        mb: 3,
                        fontWeight: 900,
                        fontSize: "0.65rem",
                        letterSpacing: 1,
                        background:
                          "linear-gradient(90deg, #378C92, #22111100)",
                        color: "white",
                      }}
                    />

                    <Typography
                      variant="h3"
                      sx={{ fontWeight: 900, mb: 2, lineHeight: 1.1 }}
                    >
                      Growth <br />
                      <Box component="span" sx={{ color: "#378C92" }}>
                        Powerhouse
                      </Box>
                    </Typography>

                    <Typography
                      sx={{
                        color: "rgba(255,255,255,0.5)",
                        mb: 5,
                        fontSize: "1rem",
                      }}
                    >
                      Unlock unlimited creation, premium visibility, and
                      powerful AI tools to scale faster.
                    </Typography>

                    <Box sx={{ mb: 5 }}>
                      <Typography variant="h2" sx={{ fontWeight: 900 }}>
                        Launch
                      </Typography>
                      <Typography
                        sx={{
                          color: "#378C92",
                          fontWeight: 700,
                          fontSize: "0.9rem",
                        }}
                      >
                        Early bird pricing coming soon
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      fullWidth
                      sx={{
                        py: 2,
                        borderRadius: "16px",
                        background: "#fff",
                        color: "#000",
                        fontWeight: 900,
                        fontSize: "1rem",
                        boxShadow: "0 15px 30px rgba(55, 140, 146, 0.3)",
                        "&:hover": { background: "#378C92", color: "#fff" },
                      }}
                    >
                      Join the Waitlist
                    </Button>
                  </Grid>

                  <Grid item xs={12} sm={5.5}>
                    <Box
                      sx={{
                        p: 3,
                        height: "100%",
                        borderRadius: "24px",
                        background: "rgba(255,255,255,0.03)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 900,
                          fontSize: "0.75rem",
                          mb: 3,
                          letterSpacing: 1,
                          opacity: 0.5,
                        }}
                      >
                        PRO FEATURES
                      </Typography>
                      <Stack spacing={2.5}>
                        {[
                          { text: "Unlimited Listings", icon: <CheckIcon /> },
                          { text: "AI Copywriter", icon: <AutoAwesomeIcon /> },
                          { text: "AI Image Gen", icon: <AutoAwesomeIcon /> },
                          { text: "Custom Domains", icon: <BoltIcon /> },
                          { text: "Priority Approval", icon: <BoltIcon /> },
                        ].map((item, i) => (
                          <Stack
                            key={i}
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                color: "#378C92",
                                display: "flex",
                                "& svg": { fontSize: 18 },
                              }}
                            >
                              {item.icon}
                            </Box>
                            <Typography
                              sx={{ fontSize: "0.85rem", fontWeight: 600 }}
                            >
                              {item.text}
                            </Typography>
                          </Stack>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>

                {/* Ghost Bolt Background */}
                <BoltIcon
                  sx={{
                    position: "absolute",
                    bottom: "-10%",
                    left: "-5%",
                    fontSize: "20rem",
                    color: "rgba(55, 140, 146, 0.03)",
                    zIndex: 0,
                    transform: "rotate(-15deg)",
                  }}
                />
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* --- BOTTOM FEATURE STRIP --- */}
        <Box
          sx={{
            mt: 8,
            px: 4,
            py: 3,
            borderRadius: "20px",
            border: "1px dashed rgba(255,255,255,0.1)",
            background: "rgba(255, 255, 255, 1)",
          }}
        >
          <Grid
            container
            spacing={3}
            justifyContent="center"
            textAlign="center"
          >
            {[
              "No credit card required",
              "Cancel at any time",
              "AI tools included in Pro",
              "Instant setup",
            ].map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item}>
                <Typography
                  sx={{
                    fontSize: { xs: "0.85rem", sm: "0.85rem" },
                    fontWeight: 600,
                    color: "rgba(22, 22, 22, 1)",
                  }}
                >
                  • {item}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default PricingSection;
