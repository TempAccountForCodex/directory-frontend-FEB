import { Box, Container, Typography, Stack, Grid, Paper } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import BoltIcon from "@mui/icons-material/Bolt";
const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

const frictions = [
  {
    text: "Expensive Custom Builds",
    icon: <TrendingDownIcon fontSize="small" />,
  },
  { text: "Developer Dependency", icon: <ErrorOutlineIcon fontSize="small" /> },
  { text: "Complex Tech Stack", icon: <ErrorOutlineIcon fontSize="small" /> },
];

export default function WhyWeBuiltThisSection(): JSX.Element {
  return (
    <Box
      sx={{
        height: { xs: "auto", md: "96vh" },
        minHeight: "800px",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        bgcolor: "#fff",
        paddingTop: { xs: 10, md: 0 },
        paddingBottom: { xs: 10, md: 0 },
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
      {/* Background Decorative Text to fill "Empty" space */}
      <Typography
        variant="h1"
        sx={{
          position: "absolute",
          top: "5%",
          left: "-2%",
          fontSize: "15rem",
          fontWeight: 900,
          color: "rgba(0,0,0,0.03)",
          zIndex: 0,
          userSelect: "none",
          lineHeight: 0.8,
        }}
      >
        PURPOSE
      </Typography>

      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        <Grid container spacing={6} alignItems="center">
          {/* Left Side: Bold Typography */}
          <Grid item xs={12} md={6}>
            <Stack spacing={2}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ width: 40, height: 2, bgcolor: "#378C92" }} />
                <Typography
                  variant="overline"
                  sx={{ fontWeight: 900, color: "#378C92", letterSpacing: 3 }}
                >
                  THE MISSION
                </Typography>
              </Box>

              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: "3rem", md: "4.5rem" },
                  lineHeight: 0.9,
                  color: "#0f172a",
                  letterSpacing: "-0.05em",
                }}
              >
                We killed the <br />
                <span style={{ color: "#378C92" }}>complexity.</span>
              </Typography>

              <Typography
                sx={{
                  fontSize: { xs: "1rem", sm: "1.2rem" },
                  color: "#64748b",
                  maxWidth: "450px",
                  pt: 2,
                }}
              >
                Most platforms give you more tools. We give you more <b>time</b>
                . We built this because business owners shouldn't need a
                computer science degree to sell locally.
              </Typography>
            </Stack>
          </Grid>

          {/* Right Side: The Premium Comparison Card */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: "40px",
                background: "rgba(255, 255, 255, 0.4)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.8)",
                boxShadow: "0 50px 100px -20px rgba(0,0,0,0.15)",
              }}
            >
              <Box
                sx={{
                  p: { xs: 2, md: 5 },
                  borderRadius: "32px",
                  bgcolor: "#fff",
                }}
              >
                {/* Top Part: The Problem */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    mb: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  The Friction{" "}
                  <Box
                    component="span"
                    sx={{ fontSize: "0.8rem", fontWeight: 500, opacity: 0.5 }}
                  >
                    (Old Way)
                  </Box>
                </Typography>

                <Stack spacing={2} sx={{ mb: 4 }}>
                  {frictions.map((item, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        p: 2,
                        borderRadius: "16px",
                        bgcolor: "#f8fafc",
                        border: "1px solid #f1f5f9",
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 600,
                          color: "#475569",
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                        }}
                      >
                        {item.text}
                      </Typography>
                      <Box sx={{ color: "#ef4444", display: "flex" }}>
                        {item.icon}
                      </Box>
                    </Box>
                  ))}
                </Stack>

                {/* Bottom Part: The Transformation */}
                <Box
                  sx={{
                    p: 4,
                    borderRadius: "24px",
                    background: "#061a1c",
                    color: "#fff",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <BoltIcon
                    sx={{
                      position: "absolute",
                      right: -10,
                      top: -10,
                      fontSize: "100px",
                      opacity: 0.1,
                      transform: "rotate(15deg)",
                    }}
                  />

                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <AutoAwesomeIcon
                      sx={{ color: "#ffffffff", fontSize: "1.2rem" }}
                    />
                    <Typography
                      variant="overline"
                      sx={{
                        fontWeight: 800,
                        letterSpacing: 2,
                        color: "#ffffffff",
                      }}
                    >
                      THE RESULT
                    </Typography>
                  </Stack>

                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: 700,
                      lineHeight: 1.4,
                      mb: 1,
                      fontSize: { xs: "1.3rem", sm: "1.5rem" },
                    }}
                  >
                    One Dashboard. Zero Code.
                  </Typography>
                  <Typography sx={{ opacity: 0.7, fontSize: "0.95rem" }}>
                    A high-converting landing page and directory listing, live
                    in minutes, managed by you.
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
