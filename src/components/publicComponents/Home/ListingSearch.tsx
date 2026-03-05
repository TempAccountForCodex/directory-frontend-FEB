import React from "react";
import {
  Box,
  Container,
  Typography,
  Stack,
  Grid,
  Paper,
  Chip,
  Avatar,
} from "@mui/material";
import { alpha, keyframes, useTheme } from "@mui/material/styles";
import HomeSearch from "./../../../components/publicComponents/Home/HomeSearch";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import SpeedIcon from "@mui/icons-material/Speed";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import StarIcon from "@mui/icons-material/Star";
import { PrimaryActionButton } from "../../../components/UI/PrimaryActionButton";
import { ResponsiveBr } from "../../../components/UI/ResponsiveBr";

const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "assets/publicAssets/images/common/darkhole.svg";

const glow = keyframes`
    0%, 100% { box-shadow: 0 0 20px rgba(55, 140, 146, 0.2); }
    50% { box-shadow: 0 0 40px rgba(55, 140, 146, 0.4); }
  `;

const TRENDING_CATEGORIES = [
  { name: "Restaurants" },
  { name: "Home Services" },
  { name: "Health & Wellness" },
  { name: "Auto Services" },
];

const avatars = [
  "/assets/publicAssets/images/home/avatar1-sm.jpg",
  "/assets/publicAssets/images/home/avatar2-sm.jpg",
  "/assets/publicAssets/images/home/avatar3-sm.jpg",
];

const SearchDiscoverSection: React.FC = () => {
  const theme = useTheme();

  const float = keyframes`
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(-12px) translateX(5px); }
  `;

  const slideInLeft = keyframes`
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
  `;

  const borderGlow = keyframes`
    0%, 100% { border-color: ${alpha("#378C92", 0.3)}; }
    50% { border-color: ${alpha("#378C92", 0.6)}; }
  `;

  return (
    <Box
      sx={{
        minHeight: "95vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#041e18",
        pt: { xs: 8, md: 12 },
        pb: { xs: 8, md: 10 },

        position: "relative",
        backgroundImage: `url(${star})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          opacity: 0.5,
          position: "absolute",
          height: "auto",
          zIndex: 0,
          backgroundImage: `url(${darkhole})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          aspectRatio: "2074 / 1333",
          top: "12%",
          left: "-70%",
          width: "280%",
          "@media (min-width: 640px)": {
            top: "-4%",
            width: "130%",
            left: "-15%",
          },
        }}
      />
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* LEFT: CONTENT FOCUS */}
          <Grid item xs={12} lg={6}>
            <Stack spacing={4}>
              <Box>
                <Typography
                  variant="h1"
                  sx={{
                    fontWeight: 900,
                    fontSize: { xs: "2.8rem", md: "4rem" },
                    lineHeight: 1,
                    letterSpacing: "-0.04em",
                    color: "#fff",
                    mb: 3,
                    "& span": {
                      background:
                        "linear-gradient(90deg, #fff 30%, #378C92 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    },
                  }}
                >
                  Search & Discover <ResponsiveBr hideFrom="lg" /> Local
                  Businesses
                </Typography>

                <Typography
                  sx={{
                    color: alpha("#fff", 0.86),
                    fontSize: { xs: "1rem", md: "1.1rem" },
                    lineHeight: 1.6,
                    maxWidth: 480,
                    mb: { xs: 6, md: 2 },
                  }}
                >
                  The easiest way to find and connect with trusted local
                  services in your area.
                </Typography>

                <Stack direction="row" spacing={2}>
                  <PrimaryActionButton
                    size="large"
                    to="/listings"
                    sx={{ px: 5, borderRadius: "100px" }}
                  >
                    Explore All
                  </PrimaryActionButton>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      {avatars.map((src, index) => (
                        <Avatar
                          key={index}
                          src={src}
                          alt={`User avatar ${index + 1}`}
                          sx={{
                            width: 32,
                            height: 32,
                            border: "2px solid #020c0a",
                            ml: index === 0 ? 0 : -1,
                            zIndex: avatars.length - index,
                            backgroundColor: "#fff",
                          }}
                        />
                      ))}
                    </Box>
                    <Typography
                      sx={{ color: "#fff", fontSize: "0.8rem", opacity: 0.7 }}
                    >
                      +2k Users
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Simplified Icons with Glass Effect */}
              <Grid container spacing={2}>
                {[
                  { icon: <SearchIcon />, label: "Smart Search" },
                  { icon: <LocationOnIcon />, label: "Nearby" },
                  { icon: <CategoryIcon />, label: "Categorized" },
                  { icon: <SpeedIcon />, label: "Fast" },
                ].map((item, i) => (
                  <Grid item xs={6} key={i}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      {/* <Box sx={{ color: "#ffffffff", display: 'flex' }}>{item.icon}</Box> */}
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          minWidth: 44,
                          borderRadius: 2.5,
                          background: alpha("#378C92", 0.12),
                          border: `1px solid ${alpha("#378C92", 0.25)}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            background: alpha("#378C92", 0.2),
                            transform: "scale(1.05)",
                          },
                        }}
                      >
                        <Box sx={{ color: "#ffffffff", display: "flex" }}>
                          {item.icon}
                        </Box>
                      </Box>
                      <Typography
                        sx={{
                          color: "#fff",
                          fontWeight: 500,
                          fontSize: "0.9rem",
                        }}
                      >
                        {item.label}
                      </Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Grid>

          {/* RIGHT COLUMN */}
          <Grid item xs={12} lg={6}>
            <Stack
              spacing={2.5}
              sx={{ position: "relative", mt: { xs: 10, lg: 0 } }}
            >
              {/* Main Search Container */}
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRadius: 4,
                  background: alpha("#0d1116", 0.8),
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${alpha("#378C92", 0.2)}`,
                  boxShadow: `
                    0 0 0 1px ${alpha("#378C92", 0.1)} inset,
                    0 30px 60px ${alpha("#000", 0.6)}
                  `,
                  position: "relative",
                  overflow: "hidden",
                  animation: `${float} 5s ease-in-out infinite`,
                  "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: "3px",
                    background:
                      "linear-gradient(90deg, transparent, #378C92, transparent)",
                    opacity: 0.6,
                  },
                }}
              >
                <HomeSearch />

                {/* Bottom Info */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="center"
                  spacing={1}
                  sx={{ mt: 3 }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#378C92",
                      animation: `${glow} 2s ease-in-out infinite`,
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: "0.875rem",
                      color: alpha("#fff", 0.5),
                      fontStyle: "italic",
                    }}
                  >
                    Helping customers find the right business — while helping
                    businesses get discovered
                  </Typography>
                </Stack>
              </Paper>

              {/* Grid for Bottom Two Cards */}
              <Grid container spacing={0}>
                <Grid item xs={7} sx={{ pr: 3 }}>
                  <Paper
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 4,
                      background: alpha("#0d1116", 0.6),
                      border: `1px solid ${alpha("#378C92", 0.15)}`,
                      backdropFilter: "blur(10px)",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1.5}
                    >
                      <TrendingUpIcon sx={{ color: "#378C92", fontSize: 18 }} />
                      <Typography
                        sx={{
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          color: "#fff",
                        }}
                      >
                        Popular
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
                      {TRENDING_CATEGORIES.map((cat, idx) => (
                        <Chip
                          key={idx}
                          label={cat.name}
                          size="small"
                          sx={{
                            background: alpha("#378C92", 0.05),
                            border: `1px solid ${alpha("#378C92", 0.2)}`,
                            color: alpha("#fff", 0.8),
                            fontSize: "0.7rem",
                            cursor: "pointer",
                            "&:hover": {
                              background: alpha("#378C92", 0.2),
                              color: "#fff",
                            },
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                </Grid>

                <Grid item xs={5}>
                  <Paper
                    sx={{
                      p: 2,
                      height: "100%",
                      borderRadius: 4,
                      background: alpha("#378C92", 0.1),
                      border: `1px solid ${alpha("#378C92", 0.3)}`,
                      animation: `${borderGlow} 3s infinite ease-in-out`,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        {[1, 2, 3, 4, 5].map((s) => (
                          <StarIcon
                            key={s}
                            sx={{ color: "#FFC107", fontSize: 14 }}
                          />
                        ))}
                      </Stack>
                      <Typography
                        align="center"
                        sx={{
                          fontSize: "0.8rem",
                          fontWeight: 700,
                          color: "#fff",
                        }}
                      >
                        100% Verified
                      </Typography>
                      <Typography
                        align="center"
                        sx={{ fontSize: "0.65rem", color: alpha("#fff", 0.5) }}
                      >
                        Manual Quality Checks
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>

            {/* Glowing Orbs for Depth */}
            <Box
              sx={{
                position: "absolute",
                zIndex: -1,
                width: 300,
                height: 300,
                background: alpha("#378C92", 0.1),
                filter: "blur(100px)",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </Grid>
        </Grid>
        <Stack alignItems="center" spacing={1.5} sx={{ mt: 14 }}>
          <Typography
            variant="h2"
            align="center"
            sx={{
              fontWeight: 500,
              fontSize: { xs: "1.7rem", md: "2.5rem", lg: "2.5rem" },
              lineHeight: 1.1,
              mb: { xs: 8, md: 2 },
              letterSpacing: "-0.03em",
              color: "#fff",
            }}
          >
            Build your brand. Get found instantly.
          </Typography>

          <Typography
            variant="caption"
            sx={{
              color: theme.palette.text.secondary,
              fontSize: "0.8rem",
            }}
          >
            No credit card required • Easy sign up
          </Typography>

          <PrimaryActionButton size="large" to="/signup">
            Create Your Free Page
          </PrimaryActionButton>
        </Stack>
      </Container>
    </Box>
  );
};

export default SearchDiscoverSection;
