import React from "react";
import { Box, Container, Typography, Button } from "@mui/material";

const NewsLetter: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        // backgroundColor: "#080808",
        pb: { xs: 8, md: 8 },
        pt: { xs: 8, md: 15 },

        position: "relative",
      }}
    >
      <Container maxWidth="lg" sx={{ zIndex: 1 }}>
        <Box
          sx={{
            maxWidth: 900,
            mx: "auto",
            textAlign: "center",
            color: "#fff",
          }}
        >
          {/* Headline */}
          <Typography
            variant="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "2.2rem", md: "4rem" },
              lineHeight: 1.15,
              mb: 4,
              color: "#ffffff",
            }}
          >
            <Box component="span">Get the Website</Box> <br />
            You Deserve. <Box component="span">Risk-Free</Box>
          </Typography>

          {/* Input + Button */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(12px)",
              borderRadius: 999,
              p: 1,
              maxWidth: 700,
              mx: "auto",
            }}
          >
            <Box
              component="input"
              placeholder="Enter your E-mail"
              sx={{
                width: "100%",
                flex: 1,
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#fff",
                fontSize: "1rem",
                px: 3,
                "::placeholder": {
                  color: "rgba(255,255,255,0.6)",
                },
              }}
            />

            <Button
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: 999,
                background: "linear-gradient(135deg, #ffffffff, #2c2c2cff)",
                color: "#000000ff",
                fontWeight: 600,
                fontSize: "0.95rem",
                whiteSpace: "nowrap",
                "&:hover": {
                  background: "linear-gradient(135deg, #2c2c2cff, #ffffffff)",
                },
              }}
            >
              {/* Mobile text */}
              <Box
                component="span"
                sx={{ display: { xs: "inline", md: "none" } }}
              >
                Send
              </Box>

              {/* Desktop text */}
              <Box
                component="span"
                sx={{ display: { xs: "none", md: "inline" } }}
              >
                Build Your Free Website Today
              </Box>
            </Button>
          </Box>

          {/* Supporting text */}
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.9rem",
            }}
          >
            Pay only if you love it
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default NewsLetter;
