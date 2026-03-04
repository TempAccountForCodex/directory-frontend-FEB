import React from "react";
import { Box, Typography, useTheme, keyframes } from "@mui/material";

const NotFoundSVG = "/assets/publicAssets/images/notFound/bg.png";

const breathing = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.08); }
  100% { transform: scale(1); }
`;

const NotFound: React.FC = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "80vh",
        pt: "180px",
        pb: "100px",
        background: `linear-gradient(
          to top, 
          ${theme.palette.primary.main} 0%, 
          ${theme.palette.primary.main} 5%,
          ${theme.palette.primary.main} 40%,
          ${theme.palette.primary.main} 60%,
          ${theme.palette.primary.main} 80%,
          ${(theme.palette.primary as any).hero} 100%
        )`,
        flexDirection: "column",
      }}
    >
      <img
        src={NotFoundSVG as string}
        style={{ height: "80%", width: "auto" }}
        alt="Not Found"
      />
      <Typography
        variant="h3"
        sx={{
          fontFamily: "'Google Sans Code', monospace",
          mb: 3,
        }}
      >
        Uh oh. That page doesn't exist.
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontFamily: "'Google Sans Code', monospace",
        }}
      >
        Head to our{"  "}
        <Box
          component="a"
          href="/"
          sx={{
            color: (theme.palette.primary as any).focus,
            textDecoration: "none",
            display: "inline-block",
            animation: `${breathing} 2s ease-in-out infinite`,
            fontWeight: 600,
          }}
        >
          homepage
        </Box>
        {"  "}
        that does exist.
      </Typography>
    </Box>
  );
};

export default NotFound;
