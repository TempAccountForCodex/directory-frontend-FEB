import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useTheme } from "@mui/material/styles";

import { ResponsiveBr } from "../../UI/ResponsiveBr";

const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

const DirectoryListingSection: React.FC = () => {
  const theme = useTheme();

  const ctaColor = "#F45B2C";

  const benefits = [
    {
      number: "1",
      title: "Appear in Category Searches",
      description:
        "Your business shows up when customers search for services in your category, making it easy to be discovered by the right audience at the right time.",
    },
    {
      number: "2",
      title: "Customers Discover You Easily",
      description:
        "Get found by potential customers actively looking for businesses like yours in the directory.",
    },
    {
      number: "3",
      title: "Verified Badges",
      description:
        "Build trust instantly with verified business badges that show customers you're legitimate and reliable.",
    },
    {
      number: "4",
      title: "Featured Spots for Premium Plans",
      description:
        "Stand out from the competition with premium featured placements that put your business front and center where it matters most.",
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 10, md: 14 },
        background: "#f7f5f3",
        position: "relative",
        backgroundPosition: "fixed",
        /* Image overlay */
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${uniqueLinesbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={8}>
          {/* LEFT SIDE — Sticky */}
          <Grid item xs={12} md={5}>
            {" "}
            <Box
              sx={{
                position: { xs: "relative", md: "sticky" },
                top: { xs: 0, md: 200 },
              }}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: "2.1rem",
                    sm: "2.8rem",
                    md: "3.8rem",
                    lg: "5rem",
                  },
                  fontWeight: 800,
                  lineHeight: 1.12,
                  textAlign: { xs: "left", md: "right" },
                  color: "#1f1f1f",
                }}
              >
                It's about time
                <ResponsiveBr hideFrom="md" />
                you had a{" "}
                <Box component="span" sx={{ color: "#888" }}>
                  directory listing
                </Box>
                <ResponsiveBr hideFrom="md" />
                you were proud of
              </Typography>
              {/* 🔽 GRADIENT FADE (AFTER TITLE) */}
            </Box>
          </Grid>

          {/* RIGHT SIDE — Scrollable content */}
          <Grid item xs={12} md={7} sx={{ zIndex: 1, position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                mt: { xs: 4, md: 60 }, // <--- MAGIC FIX
              }}
            >
              {benefits.map((benefit, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 3,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "3rem", md: "4rem" },
                      fontWeight: 700,
                      color: "#1f1f1f",
                      lineHeight: 1,
                      minWidth: "48px",
                    }}
                  >
                    {benefit.number}
                  </Typography>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: { xs: "1.35rem", md: "1.7rem" },
                        mb: 1,
                        color: "#1f1f1f",
                      }}
                    >
                      {benefit.title}
                    </Typography>

                    <Typography
                      sx={{
                        color: "#555",
                        fontSize: "1rem",
                        lineHeight: 1.7,
                        maxWidth: "90%",
                      }}
                    >
                      {benefit.description}
                    </Typography>
                  </Box>
                </Box>
              ))}

              {/* CTA */}
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: { xs: "center", md: "flex-start" },
                  textAlign: { xs: "center", md: "left" },
                }}
              >
                <Button
                  variant="contained"
                  sx={{
                    background: theme.palette.text.primary,
                    px: 5,
                    py: 1.8,
                    borderRadius: "30px",
                    textTransform: "none",
                    fontWeight: 700,
                    color: "white",
                    "&:hover": {
                      background: theme.palette.text.main,
                    },
                  }}
                >
                  START YOUR FREE TRIAL
                </Button>

                <Typography sx={{ mt: 1.2, color: "#555", fontSize: "0.9rem" }}>
                  No credit card required • Easy sign up
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default DirectoryListingSection;
