import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  Divider,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import BoltIcon from "@mui/icons-material/Bolt";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

const WhyChooseUsSection = () => {
  const theme = useTheme();
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: "92%", label: "Client retention rate over the past 3 years" },
    { value: "1M+", label: "Users reached through our platforms" },
  ];

  const comparisonData = [
    {
      feature: "The Experience",
      traditional: "Manual editors",
      ours: "AI-Powered generation",
    },
    {
      feature: "Discovery",
      traditional: "Hidden on web",
      ours: "Built-in traffic",
    },
    { feature: "Mobile", traditional: "Responsive hacks", ours: "Native-feel" },
  ];

  return (
    <Box
      ref={sectionRef}
      sx={{
        py: { xs: 10, md: 18 },
        position: "relative",
        overflow: "hidden",
        backgroundSize: "32px 32px",

        transition: "all 1.2s ease",
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0px)" : "translateY(40px)",

        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${uniqueLinesbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.8,
          zIndex: 0,
        },

        "& > *": {
          position: "relative",
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8} alignItems="center">
          {/* Left Side */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 16, fill: "black" }} />}
                label=" WHY CHOOSE US"
                sx={{
                  px: 1.5,
                  py: 1.8,
                  height: "auto",
                  borderRadius: 999,
                  background: "transparent",
                  border: `1px solid ${theme.palette.text.primary}`,
                  "& .MuiChip-label": {
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    color: theme.palette.text.primary,
                    letterSpacing: "0.5px",
                    pl: 2,
                  },
                  width: "fit-content",
                }}
              />

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "2rem", md: "2.5rem", lg: "3.5rem" },
                  color: "#1A1A1A",
                  lineHeight: 1.1,
                }}
              >
                The Platform Built for <br />
                <Box component="span" sx={{ color: "#888" }}>
                  Results, Not Just
                </Box>
                <br />
                <Box component="span" sx={{ color: "#1A1A1A" }}>
                  Design.
                </Box>
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 6,
                  background: "white",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.03)",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  How we compare
                </Typography>

                <Stack spacing={3}>
                  {comparisonData.map((item, idx) => (
                    <Box key={idx}>
                      <Typography
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 800,
                          color: "#000000ff",
                          textTransform: "uppercase",
                          mb: 1,
                        }}
                      >
                        {item.feature}
                      </Typography>

                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5}>
                          <Typography
                            sx={{
                              fontSize: "0.85rem",
                              color: "#9CA3AF",
                              textDecoration: "line-through",
                            }}
                          >
                            {item.traditional}
                          </Typography>
                        </Grid>

                        <Grid
                          item
                          xs={1}
                          sx={{
                            textAlign: "center",
                            color: "#378C92",
                            fontWeight: 900,
                            fontSize: "0.7rem",
                          }}
                        >
                          VS
                        </Grid>

                        <Grid item xs={6}>
                          <Typography
                            sx={{
                              fontSize: { xs: "0.85rem", sm: "0.95rem" },
                              fontWeight: 700,
                              color: "#1A1A1A",
                            }}
                          >
                            {item.ours}
                          </Typography>
                        </Grid>
                      </Grid>

                      {idx !== comparisonData.length - 1 && (
                        <Divider sx={{ mt: 2 }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Stack>
          </Grid>

          {/* Right Side */}
          <Grid item xs={12} md={6}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Paper
                  sx={{
                    p: { xs: 4, lg: 5 },
                    borderRadius: 6,
                    background: "#061a1c",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <svg width={0} height={0} style={{ position: "absolute" }}>
                    <linearGradient
                      id="goldGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#BF953F" />
                      <stop offset="25%" stopColor="#FCF6BA" />
                      <stop offset="50%" stopColor="#B38728" />
                      <stop offset="100%" stopColor="#AA771C" />
                    </linearGradient>
                  </svg>

                  <BoltIcon
                    sx={{
                      position: "absolute",
                      top: "-20px",
                      right: "-30px",
                      fontSize: "15rem",
                      color: "rgba(255, 255, 255, 0.03)",
                      transform: "rotate(-10deg)",
                      userSelect: "none",
                      pointerEvents: "none",
                      zIndex: 0,
                    }}
                  />

                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <BoltIcon
                      sx={{
                        fontSize: 48,
                        mb: 2,
                        fill: "url(#goldGradient)",
                        filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.5))",
                      }}
                    />
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 800,
                        mb: 1.5,
                        fontSize: { xs: "25px", lg: "35px" },
                      }}
                    >
                      Built for Speed
                    </Typography>
                    <Typography
                      sx={{
                        opacity: 0.8,
                        fontSize: { xs: "0.9rem", lg: "1rem" },
                        lineHeight: 1.6,
                        maxWidth: "60%",
                      }}
                    >
                      Your page is live in under 10 minutes. No hosting to
                      setup, no plugins to configure. Just pure growth.
                    </Typography>
                  </Box>
                </Paper>
              </Grid>

              {stats.map((stat, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 4,
                      height: "100%",
                      borderRadius: 4,
                      background: "white",
                      border: "1px solid #E5E7EB",
                      position: "relative",
                      overflow: "hidden",
                      transition: "transform 0.3s ease",
                      "&:hover": { transform: "translateY(-5px)" },
                    }}
                  >
                    <Typography
                      sx={{
                        position: "absolute",
                        top: "-16px",
                        right: "-38px",
                        fontSize: "7rem",
                        fontWeight: 900,
                        color: "rgb(247 248 250)",
                        lineHeight: 1,
                        userSelect: "none",
                      }}
                    >
                      {stat.value}
                    </Typography>

                    <Stack spacing={1} sx={{ position: "relative", zIndex: 1 }}>
                      <Typography
                        variant="h3"
                        sx={{
                          fontWeight: 400,
                          color: "#1A1A1A",
                          fontSize: "4rem",
                          marginTop: "20px",
                        }}
                      >
                        {stat.value}
                      </Typography>
                      <Typography
                        sx={{
                          color: "#666",
                          fontSize: "0.95rem",
                          lineHeight: 1.5,
                          maxWidth: "80%",
                          paddingTop: { md: "73px", lg: "146px" },
                        }}
                      >
                        {stat.label}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default WhyChooseUsSection;
