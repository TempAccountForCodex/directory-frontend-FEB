import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  styled,
  keyframes,
  Button,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const gradientShift = keyframes`
  0% { background-position: 0% 0%; }
  100% { background-position: 100% 100%; }
`;

const phrases = ["FAQs", "Your Common Queries", "Get Your Answers"];

const StyledHero = styled(Grid, {
  shouldForwardProp: (prop) => prop !== "fullscreen",
})(({ fullscreen }) => ({
  backgroundSize: "cover",
  backgroundRepeat: "no-repeat",
  backgroundColor: "#070c10",
  position: "relative",
  minHeight: fullscreen ? "80vh" : "60vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "radial-gradient(circle at 20% 15%, rgba(55, 140, 146, 0.35), transparent 34%), radial-gradient(circle at 80% 88%, rgba(55, 140, 146, 0.28), transparent 30%), linear-gradient(145deg, rgba(4, 8, 13, 0.92) 18%, rgba(7, 12, 18, 0.78) 48%, rgba(10, 15, 21, 0.86) 100%)",
    zIndex: 1,
    opacity: 1,
  },
  "&::after": {
    content: '""',
    position: "absolute",
    width: "100%",
    height: "100%",
    background:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 64px), repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 64px), linear-gradient(45deg, rgba(55, 140, 146, 0.22) 0%, rgba(255, 255, 255, 0.02) 50%, rgba(55, 140, 146, 0.2) 100%)",
    backgroundSize: "200% 200%",

    zIndex: 1,
    opacity: 0.55,
  },
  "& .hero-vignette": {
    position: "absolute",
    inset: 0,
    zIndex: 1,
    pointerEvents: "none",
    background:
      "radial-gradient(circle at center, transparent 35%, rgba(0, 0, 0, 0.48) 100%)",
  },
  "& .hero-orb-a": {
    position: "absolute",
    width: "38vw",
    height: "38vw",
    minWidth: "250px",
    minHeight: "250px",
    borderRadius: "50%",
    top: "-12%",
    right: "-8%",
    zIndex: 1,
    background:
      "radial-gradient(circle, rgba(55,140,146,0.36) 0%, rgba(55,140,146,0.08) 45%, transparent 72%)",
    filter: "blur(8px)",
  },
  "& .hero-orb-b": {
    position: "absolute",
    width: "34vw",
    height: "34vw",
    minWidth: "220px",
    minHeight: "220px",
    borderRadius: "50%",
    bottom: "-18%",
    left: "-10%",
    zIndex: 1,
    background:
      "radial-gradient(circle, rgba(255,255,255,0.16) 0%, rgba(55,140,146,0.08) 46%, transparent 74%)",
    filter: "blur(10px)",
  },
}));

const HeroBannerSection = ({
  title = "Welcome",
  imageSrc,
  fullscreen = false,
  subText,
  dynamicTitle = false,
  dynamicPhrases = phrases,
  showCTA = false,
  ctaLabel = "Request a Call",
  ctaLink = "/contact-us#request-call",
  children,
  backgroundPosition = "center",
}) => {
  const navigate = useNavigate();
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  useEffect(() => {
    if (dynamicTitle) {
      const interval = setInterval(() => {
        setCurrentPhraseIndex(
          (prevIndex) => (prevIndex + 1) % dynamicPhrases.length,
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [dynamicTitle, dynamicPhrases]);

  const textVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -50, transition: { duration: 0.6, ease: "easeIn" } },
  };

  return (
    <StyledHero
      sx={{
        backgroundImage: `url(${imageSrc})`,
        backgroundPosition: backgroundPosition || "center",
      }}
      fullscreen={fullscreen}
      item
      xs={12}
    >
      <Box className="hero-vignette" />
      <Box className="hero-orb-a" />
      <Box className="hero-orb-b" />
      <Grid
        item
        sx={{
          zIndex: 2,
          color: "#fff",
          textAlign: "center",
          px: 2,
          maxWidth: "1000px",
        }}
      >
        {/* Dynamic or static title */}
        <Box
          sx={{
            minHeight: "100px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {dynamicTitle ? (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPhraseIndex}
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: "32px",
                      sm: "60px",
                      md: "70px",
                    },
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    textShadow: "3px 3px 5px rgba(0,0,0,0.4)",
                  }}
                >
                  {dynamicPhrases[currentPhraseIndex]}
                </Typography>
              </motion.div>
            </AnimatePresence>
          ) : (
            <Typography
              sx={{
                fontSize: {
                  xs: "32px",
                  sm: "60px",
                  md: "70px",
                },
                fontWeight: "bold",
                textTransform: "uppercase",
                textShadow: "3px 3px 5px rgba(0,0,0,0.4)",
              }}
            >
              {title}
            </Typography>
          )}
        </Box>

        {/* Subtitle */}
        {subText && (
          <Typography
            sx={{
              mt: 2,
              color: "#fff",
              fontSize: { xs: "14px", md: "20px" },
              maxWidth: "700px",
              mx: "auto",
              textShadow: "1px 1px 3px rgba(0, 0, 0, 0.3)",
            }}
          >
            {subText}
          </Typography>
        )}

        {/* CTA Button */}
        {showCTA && (
          <Box mt={4}>
            <Button
              onClick={() => navigate(ctaLink)}
              sx={{
                backgroundColor: "#378C92",
                color: "#fff",
                fontWeight: 500,
                borderRadius: "35px",
                textTransform: "none",
                padding: "17px 37px",
                fontSize: "18px",
                transition: "all 0.4s ease-in-out",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
                display: "inline-flex",
                alignItems: "center",

                "&:hover": {
                  backgroundColor: "#378C92",
                  boxShadow:
                    "0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(44, 74, 96, 0.7)",
                  transform: "translateY(-3px) scale(1.02)",
                },
              }}
            >
              {ctaLabel}
            </Button>
          </Box>
        )}

        {/* Additional children if passed */}
        {children}
      </Grid>
    </StyledHero>
  );
};

export default HeroBannerSection;
