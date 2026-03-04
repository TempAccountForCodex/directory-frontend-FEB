import React from "react";
import { Box, Typography, styled, keyframes } from "@mui/material";
import { PrimaryActionButton } from "./../../UI/PrimaryActionButton";
const star = "/assets/publicAssets/images/common/star.svg";
const thinkingPerson = "/assets/publicAssets/images/about/thinkingPerson.webp";

const float = keyframes`
  0% { transform: translateY(0px) rotateZ(var(--rotation)); }
  50% { transform: translateY(-10px) rotateZ(var(--rotation)); }
  100% { transform: translateY(0px) rotateZ(var(--rotation)); }
`;

const SectionWrapper = styled(Box)(({ theme }) => ({
  backgroundColor: "#111111",
  color: "#ffffff",
  backgroundImage: `url(${star})`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  padding: theme.spacing(10, 2),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  position: "relative",
  overflow: "hidden",
  fontFamily: '"Inter", "Roboto", sans-serif',
  minHeight: "auto",
  [theme.breakpoints.up("md")]: {
    minHeight: "100vh",
  },
}));
const Highlight = styled("span")({
  backgroundColor: "#378C92", // Your updated teal color
  color: "#f6f6f6ff",
  padding: "0 4px",
  fontWeight: 700,
});

const ModernCard = styled(Box)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.03)", // Very faint white
  backdropFilter: "blur(12px)",
  borderRadius: "24px",
  width: "300px",
  padding: "24px",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  boxShadow: "0px 20px 40px rgba(0,0,0,0.4)",
  position: "absolute",
  zIndex: 10,
  transition: "all 0.4s ease",
  animation: `${float} 6s ease-in-out infinite`,

  "&:hover": {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderColor: "#378C92",
    boxShadow: "0px 0px 20px rgba(55, 140, 146, 0.3)",
    transform: "scale(1.05) !important",
    zIndex: 20,
  },

  [theme.breakpoints.down("md")]: {
    position: "relative",
    margin: "15px auto",
    width: "90%",
    left: "0 !important",
    right: "0 !important",
    top: "0 !important",
    bottom: "0 !important",
    animation: "none",
    transform: "none !important",
  },
}));

// --- Main Component ---

const AboutUsHero: React.FC = () => {
  return (
    <SectionWrapper>
      {/* Header Text - Updated for Business Owners */}
      <Box textAlign="center" sx={{ zIndex: 1 }}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 1, letterSpacing: "1px" }}
        >
          Hey, BUSINESS OWNER! 🏢
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 800,
            lineHeight: 1.1,
            fontSize: { xs: "1.5rem", md: "3.5rem" },
            maxWidth: "800px",
            textTransform: "uppercase",
          }}
        >
          Getting your business online feels impossible, right?
        </Typography>
      </Box>

      {/* Interaction Area */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          maxWidth: "1300px",
          height: { xs: "auto", md: "700px" },
          display: { xs: "block", md: "flex" },
          justifyContent: "center",
          alignItems: "center",
          mt: { xs: 4, md: 0 },
        }}
      >
        {/* Floating Cards with CSS Variables for rotation in animation */}

        {/* Top Left */}
        <ModernCard sx={{ top: "10%", left: "5%", "--rotation": "-4deg" }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.1rem",
              lineHeight: 1.5,
            }}
          >
            Creating a professional website from scratch is{" "}
            <Highlight>expensive and slow</Highlight>
          </Typography>
        </ModernCard>

        {/* Top Right */}
        <ModernCard sx={{ top: "15%", right: "5%", "--rotation": "4deg" }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.1rem",
              lineHeight: 1.5,
            }}
          >
            Hiring designers and developers{" "}
            <Highlight>drains your budget</Highlight> before you launch
          </Typography>
        </ModernCard>

        {/* Middle Left */}
        <ModernCard sx={{ bottom: "25%", left: "2%", "--rotation": "3deg" }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.1rem",
              lineHeight: 1.5,
            }}
          >
            Managing hosting and technical updates is a{" "}
            <Highlight>constant headache</Highlight>
          </Typography>
        </ModernCard>

        {/* Middle Right */}
        <ModernCard sx={{ bottom: "20%", right: "2%", "--rotation": "-3deg" }}>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "1.1rem",
              lineHeight: 1.5,
            }}
          >
            Even with a site, <Highlight>getting discovered</Highlight> by
            customers remains a struggle
          </Typography>
        </ModernCard>

        {/* Central Stressed Man Image */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            maxWidth: "800px",
            textAlign: "center",
            zIndex: 1,
            top: "-120px",
            display: { xs: "none", md: "block" },
          }}
        >
          <Box
            component="img"
            src={thinkingPerson}
            alt="Stressed Business Owner"
            sx={{
              width: "100%",
              display: "block",
              position: "relative",
              top: "-8px",
              zIndex: 9,
              // Green tint filter applied here
              // filter: 'grayscale(100%) sepia(100%) hue-rotate(100deg) saturate(250%) brightness(0.8)',
            }}
          />
        </Box>
      </Box>

      {/* Footer Text - Updated from "Who We Are" content */}
      <Box
        sx={{
          mt: { xs: 4, md: -8 },
          textAlign: "center",
          maxWidth: "800px",
          zIndex: 3,
        }}
      >
        <Typography
          variant="body1"
          sx={{ opacity: 0.9, fontSize: "1.2rem", mb: 3 }}
        >
          We’re building a <b>simple platform</b> for businesses that want a
          professional online presence
          <b> without complexity, cost, or technical effort</b>. Get your free
          landing page and directory listing today.
        </Typography>
        <PrimaryActionButton size="large" to="/signup">
          Create Your Free Page
        </PrimaryActionButton>
      </Box>
    </SectionWrapper>
  );
};

export default AboutUsHero;
