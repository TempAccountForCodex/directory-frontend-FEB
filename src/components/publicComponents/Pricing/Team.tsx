import { Box, Container, Typography, Button } from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
const aboutUsCta = "/assets/publicAssets/images/about/aboutUsCta.webp";

export default function CustomPlansSection() {
  return (
    <Box
      sx={{
        background: "#080808",
        py: { xs: 8, md: 12 },
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Container maxWidth="xl">
        <Box>
          <Typography
            sx={{
              color: "#fff",
              fontSize: { xs: "28px", md: "40px" },
              fontWeight: 400,
              mb: 6,
            }}
          >
            We’re Here to Help
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: { xs: 4, md: 6 },
            }}
          >
            {/* Card 1 */}
            <Box
              sx={{
                border: "1px solid rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
                p: { xs: 4, md: 5 },
                minHeight: "220px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#fff",
                },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: "22px",
                    fontWeight: 400,
                    mb: 1.5,
                  }}
                >
                  Enterprise Blog
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.93)",
                    fontSize: "15px",
                    maxWidth: "380px",
                    lineHeight: 1.6,
                  }}
                >
                  The latest website and design best practices for brands and
                  agencies.
                </Typography>
              </Box>

              <ArrowForwardIcon
                sx={{
                  color: "#fff",
                  alignSelf: "flex-end",
                  fontSize: 26,
                }}
              />
            </Box>

            {/* Card 2 */}
            <Box
              sx={{
                border: "1px solid rgba(255, 255, 255, 0.9)",
                borderRadius: "8px",
                p: { xs: 4, md: 5 },
                minHeight: "220px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 0.3s ease",
                cursor: "pointer",
                "&:hover": {
                  borderColor: "#fff",
                },
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: "22px",
                    fontWeight: 400,
                    mb: 1.5,
                  }}
                >
                  Contact Us
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255, 255, 255, 0.93)",
                    fontSize: "15px",
                    maxWidth: "380px",
                    lineHeight: 1.6,
                  }}
                >
                  Get in touch with our support team for sales inquiries,
                  technical assistance, or custom plan discussions. We’re here
                  to help you anytime.
                </Typography>
              </Box>

              <ArrowForwardIcon
                sx={{
                  color: "#fff",
                  alignSelf: "flex-end",
                  fontSize: 26,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
