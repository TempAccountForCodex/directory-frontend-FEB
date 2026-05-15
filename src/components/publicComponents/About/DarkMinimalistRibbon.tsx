import { Box, Container, Typography, Stack, alpha, Grid } from "@mui/material";
import BoltIcon from "@mui/icons-material/Bolt";
import PublicIcon from "@mui/icons-material/Public";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "assets/publicAssets/images/common/darkhole.svg";

export default function DarkMinimalistRibbon() {
  const values = [
    {
      icon: <BoltIcon sx={{ color: "#ffffffff" }} />,
      text: "Instant Presence",
    },
    {
      icon: <PublicIcon sx={{ color: "#ffffffff" }} />,
      text: "Global Discovery",
    },
    {
      icon: <AutoAwesomeIcon sx={{ color: "#ffffffff" }} />,
      text: "AI-Powered Tools",
    },
  ];

  return (
    <Box
      sx={{
        height: { xs: "auto", sm: "20vh", md: "20vh" },
        minHeight: "60px",
        backgroundColor: "#041e18",
        backgroundImage: `url(${star})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        padding: { xs: "40px", sm: "0px" },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("${darkhole}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          opacity: 0.2,
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* LEFT: Heading from your "Mission" content */}
          <Grid item xs={12} md={4}>
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 800,
                fontSize: { xs: "1.2rem", md: "1.5rem" },
                lineHeight: 1.2,
                borderLeft: "4px solid #378C92",
                pl: 2,
              }}
            >
              Removing barriers, <br />
              powering growth.
            </Typography>
          </Grid>

          {/* RIGHT: Values with Icons */}
          <Grid item xs={12} md={8}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 3, md: 6 }}
              justifyContent="flex-end"
            >
              {values.map((item, index) => (
                <Stack
                  key={index}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                >
                  <Box
                    sx={{
                      bgcolor: alpha("#378C92", 0.1),
                      p: 1,
                      borderRadius: "50%",
                      display: "flex",
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Typography
                    sx={{
                      color: alpha("#fff", 0.9),
                      fontWeight: 600,
                      fontSize: "1rem",
                      letterSpacing: 0.5,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Subtle Top & Bottom Gradient to blend with Light Sections */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "20%",
          background: "linear-gradient(to bottom, #fff, transparent)",
          opacity: 0.05,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "20%",
          background: "linear-gradient(to top, #fff, transparent)",
          opacity: 0.05,
        }}
      />
    </Box>
  );
}
