import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Paper,
  Chip,
  alpha,
  Button,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import VerifiedRoundedIcon from "@mui/icons-material/VerifiedRounded";

const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

const FeaturedListing: React.FC = () => {
  const theme = useTheme();

  // Theme se primary colors access kar rahe hain
  const primaryMain = theme.palette.primary.focus;
  const darkBg = theme.palette.primary.dark;
  const textColor = theme.palette.text.primary;
  const secondaryText = theme.palette.text.gray;

  const featuredBusinesses = [
    {
      name: "Bright Solutions",
      category: "Web Services",
      location: "Lahore, Pakistan",
      description:
        "Helping small businesses build a strong online presence with modern websites and digital solutions.",
    },
    {
      name: "Urban Eats",
      category: "Restaurant",
      location: "Karachi, Pakistan",
      description:
        "A modern dining experience offering fresh flavors and fast service for busy professionals.",
    },
    {
      name: "FitZone Studio",
      category: "Fitness",
      location: "Islamabad, Pakistan",
      description:
        "Personal training and group fitness programs designed to help you stay active and healthy.",
    },
    {
      name: "TechNest Solutions",
      category: "IT Services",
      location: "Lahore, Pakistan",
      description:
        "Reliable IT support and software solutions tailored for startups and growing businesses.",
    },
    {
      name: "Bloom Beauty Salon",
      category: "Beauty & Wellness",
      location: "Karachi, Pakistan",
      description:
        "Professional beauty and wellness services designed to help you look and feel your best.",
    },
    {
      name: "AutoCare Hub",
      category: "Automotive",
      location: "Islamabad, Pakistan",
      description:
        "Trusted automotive repair and maintenance services with a focus on quality and reliability.",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "auto",
        display: "flex",
        alignItems: "center",
        backgroundColor: theme.palette.background.default || "#fff",
        pt: { xs: 8, md: 13 },
        pb: { xs: 8, md: 16 },
        position: "relative",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${uniqueLinesbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.4,
          zIndex: 0,
        },
      }}
    >
      {/* Dynamic Background Glows using Theme Color */}
      <Box
        sx={{
          position: "absolute",
          top: "10%",
          left: "-5%",
          width: "40%",
          height: "40%",
          background: `radial-gradient(circle, ${alpha(primaryMain!, 0.08)} 0%, transparent 70%)`,
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* Section Header */}
        <Stack spacing={2} alignItems="center" textAlign="center" mb={10}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.8rem", md: "4rem" },
              lineHeight: 1,
              letterSpacing: "-0.04em",
              color: textColor,
            }}
          >
            Featured Businesses
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: secondaryText, maxWidth: 600, fontSize: "1.1rem" }}
          >
            Explore the elite circle of businesses leveraging our landing pages
            to dominate their local markets.
          </Typography>
        </Stack>

        {/* The Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 4,
          }}
        >
          {featuredBusinesses.map((business, index) => (
            <Paper
              key={index}
              elevation={0}
              sx={{
                p: 4,
                borderRadius: "24px",
                background: alpha(
                  theme.palette.background.paper || "#fff",
                  0.7,
                ),
                backdropFilter: "blur(12px)",
                border: "1px solid",
                borderColor: alpha(primaryMain!, 0.2), // Light border using primary
                transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                position: "relative",
                overflow: "hidden",
                boxShadow: `0 30px 60px ${alpha(primaryMain!, 0.12)}`,
                "&:hover": {
                  transform: "translateY(-10px)",
                  borderColor: primaryMain,
                  boxShadow: `0 30px 60px ${alpha(primaryMain!, 0.2)}`,
                  "& .hover-arrow": { transform: "translateX(5px)" },
                },
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center" mb={3}>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: "14px",
                    // Gradient using Theme Colors
                    background: `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: "1.2rem",
                    boxShadow: `0 8px 16px ${alpha(primaryMain!, 0.3)}`,
                  }}
                >
                  {business.name.charAt(0)}
                </Box>
                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "1.1rem",
                      color: textColor,
                    }}
                  >
                    {business.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: "0.8rem",
                      color: secondaryText,
                      fontWeight: 600,
                    }}
                  >
                    {business.location}
                  </Typography>
                </Box>
              </Stack>

              <Chip
                label={business.category}
                size="small"
                sx={{
                  mb: 2,
                  bgcolor: alpha(primaryMain!, 0.1),
                  color: primaryMain,
                  fontWeight: 800,
                  borderRadius: "6px",
                  fontSize: "0.7rem",
                  textTransform: "uppercase",
                }}
              />

              <Typography
                sx={{
                  fontSize: "0.9rem",
                  color: textColor,
                  opacity: 0.8,
                  lineHeight: 1.7,
                  mb: 4,
                  minHeight: "4.5em",
                }}
              >
                {business.description}
              </Typography>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  pt: 3,
                  borderTop: `1px solid ${alpha(secondaryText!, 0.1)}`,
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{ color: primaryMain }}
                >
                  <VerifiedRoundedIcon sx={{ fontSize: 18 }} />
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 800 }}>
                    PRO
                  </Typography>
                </Stack>

                <Button
                  endIcon={
                    <ArrowForwardRoundedIcon
                      className="hover-arrow"
                      sx={{ transition: "0.3s" }}
                    />
                  }
                  sx={{
                    color: textColor,
                    fontWeight: 800,
                    textTransform: "none",
                    fontSize: "0.85rem",
                    "&:hover": { bgcolor: "transparent", color: primaryMain },
                  }}
                >
                  View Profile
                </Button>
              </Stack>
            </Paper>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default FeaturedListing;
