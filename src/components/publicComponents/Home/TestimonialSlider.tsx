import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Stack,
  Avatar,
  Rating,
  Chip,
  Divider,
} from "@mui/material";
import { alpha, keyframes, useTheme } from "@mui/material/styles";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "/assets/publicAssets/images/common/darkhole.svg";
const worlMap = "/assets/publicAssets/images/common/map.webp";

const scrollLoop = keyframes`
  0% { transform: translateY(0); }
  100% { transform: translateY(-50%); }
`;

const TestimonialSection = () => {
  const theme = useTheme();

  const primaryMain = theme.palette.text.main;
  const secondaryText = theme.palette.text.secondary;

  const testimonials = [
    {
      quote: "I created my business page in 5 minutes!",
      author: "Sarah J.",
      role: "Boutique Owner",
      initials: "SJ",
      rating: 5,
    },
    {
      quote: "Professional results without the professional price tag.",
      author: "James W.",
      role: "Coffee Shop Owner",
      initials: "JW",
      rating: 5,
    },
    {
      quote:
        "Mobile performance is incredible. Solid 9/10 experience for my customers.",
      author: "Linda M.",
      role: "E-commerce",
      initials: "LM",
      rating: 4.5,
    },
  ];

  return (
    <Box
      sx={{
        py: { xs: 12, md: 14 },
        backgroundColor: "#041e18", // Dark Greenish Background
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${star})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        color: secondaryText,
      }}
    >
      {/* Dark Hole Effect */}
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
          "@media (min-width: 640px)": {
            top: "-4%",
            width: "130%",
            left: "-15%",
          },
        }}
      />

      {/* World Map */}
      <Box
        component="img"
        src={worlMap}
        alt="Map"
        loading="lazy"
        decoding="async"
        sx={{
          position: "absolute",
          top: "-5%",
          right: "-5%",
          width: { xs: "100%", md: "65%" },
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="lg" sx={{ zIndex: 1, position: "relative" }}>
        {/* Header */}
        <Stack spacing={2} alignItems="baseline" textAlign="center" mb={12}>
          <Chip
            icon={
              <AutoAwesomeIcon sx={{ fontSize: 16, fill: secondaryText }} />
            }
            label="SOCIAL PROOF"
            sx={{
              px: 1.5,
              py: 1.8,
              height: "auto",
              borderRadius: 999,
              background: alpha(primaryMain!, 0.15),
              border: `1px solid ${primaryMain}`,
              "& .MuiChip-label": {
                fontWeight: 700,
                fontSize: "0.75rem",
                color: secondaryText,
                letterSpacing: "0.5px",
                pl: 2,
              },
            }}
          />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2rem", sm: "3rem", md: "4rem" },
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              textAlign: "left",
            }}
          >
            Trusted by Builders. <br />
            <Box
              component="span"
              sx={{
                background: `linear-gradient(90deg, ${secondaryText} 0%, ${alpha(secondaryText!, 0.65)} 100%)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Discovered by Customers.
            </Box>
          </Typography>
        </Stack>

        <Grid container spacing={6}>
          {/* LEFT — Scrolling Testimonials */}
          <Grid item xs={12} md={6}>
            <Typography
              sx={{
                fontWeight: 800,
                letterSpacing: 1,
                mb: 3,
                color: secondaryText,
              }}
            >
              Lightning-Fast Setup
            </Typography>

            <Box
              sx={{
                height: 520,
                overflow: "hidden",
                maskImage:
                  "linear-gradient(to bottom, transparent, black 15%, black 85%, transparent)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  animation: `${scrollLoop} 28s linear infinite`,
                  "&:hover": { animationPlayState: "paused" },
                }}
              >
                {[...testimonials, ...testimonials].map((t, i) => (
                  <Paper
                    key={i}
                    sx={{
                      p: 4,
                      background: "rgba(255,255,255,0.03)",
                      backdropFilter: "blur(20px)",
                      borderRadius: 5,
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <Stack spacing={2}>
                      <Rating
                        value={t.rating}
                        precision={0.5}
                        readOnly
                        size="small"
                        sx={{ color: "#EAB308" }}
                      />
                      <Typography
                        sx={{ fontStyle: "italic", color: "#E2E8F0" }}
                      >
                        “{t.quote}”
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: primaryMain, fontWeight: 700 }}>
                          {t.initials}
                        </Avatar>
                        <Box>
                          <Typography fontWeight={700} color={secondaryText}>
                            {t.author}
                          </Typography>
                          <Typography fontSize="0.8rem" color="#94A3B8">
                            {t.role}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* RIGHT — FEATURED SUCCESS STORY */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                height: "100%",
                p: { xs: 4, md: 6 },
                borderRadius: 8,
                background: `linear-gradient(135deg, ${alpha(primaryMain!, 0.18)}, rgba(0,0,0,0.9))`,
                border: `1px solid ${alpha(primaryMain!, 0.35)}`,
              }}
            >
              <Stack spacing={4}>
                <Chip
                  icon={<TrendingUpIcon sx={{ fill: secondaryText }} />}
                  label="FEATURED SUCCESS STORY"
                  sx={{
                    width: "fit-content",
                    background: alpha(primaryMain!, 0.2),
                    color: secondaryText,
                    fontWeight: 700,
                  }}
                />

                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{
                    color: secondaryText,
                    fontSize: { xs: "1.5rem", sm: "1.8rem" },
                  }}
                >
                  From Invisible → Fully Booked
                </Typography>

                <Typography sx={{ color: "#E2E8F0", fontSize: "1.1rem" }}>
                  “I started getting more customers after appearing in search
                  results for my local area.”
                </Typography>

                <Divider sx={{ borderColor: alpha(primaryMain!, 0.3) }} />

                {/* Metrics */}
                <Grid container spacing={3}>
                  <Grid item xs={4}>
                    <Typography fontWeight={800} color={primaryMain}>
                      +230%
                    </Typography>
                    <Typography fontSize="0.75rem" color="#94A3B8">
                      Visibility
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography fontWeight={800} color={primaryMain}>
                      1.8k+
                    </Typography>
                    <Typography fontSize="0.75rem" color="#94A3B8">
                      Searches
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography fontWeight={800} color={primaryMain}>
                      3×
                    </Typography>
                    <Typography fontSize="0.75rem" color="#94A3B8">
                      Growth
                    </Typography>
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    sx={{
                      bgcolor: primaryMain,
                      width: 56,
                      height: 56,
                      fontWeight: 800,
                    }}
                  >
                    ER
                  </Avatar>
                  <Box>
                    <Typography fontWeight={800} sx={{ color: secondaryText }}>
                      Elena R.
                    </Typography>
                    <Typography color={primaryMain} fontWeight={600}>
                      Bakery Owner
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default TestimonialSection;
