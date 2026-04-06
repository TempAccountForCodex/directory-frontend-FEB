import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Container, Stack, Grid } from "@mui/material";
import { styled } from "@mui/system";
import { motion } from "framer-motion";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import videobg from "../../assets/video/hero8.mp4";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, damping: 10, stiffness: 100 },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, damping: 10, stiffness: 100 },
  },
};

const HeroBackground = styled(Box)(({ theme }) => ({
  height: "100vh",
  position: "relative",
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "600px",
}));

const CustomButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#378C92",
  color: "#fff",
  fontWeight: 500,
  borderRadius: "35px",
  textTransform: "none",
  padding: "15px 30px",
  fontSize: "18px",
  transition: "all 0.4s ease-in-out",
  boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
  display: "inline-flex",
  alignItems: "center",
  gap: theme.spacing(1),

  "&:hover": {
    backgroundColor: "#378C92",
    boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4), 0 0 20px rgba(44, 74, 96, 0.7)",
    transform: "translateY(-3px) scale(1.02)",
    "& .MuiButton-startIcon, & .MuiButton-endIcon, & .MuiButton-label": {
      transform: "translateX(5px)",
      transition: "transform 0.4s ease-in-out",
    },
  },
  "& .MuiButton-label": {
    display: "flex",
    alignItems: "center",
  },
}));
interface TypewriterTextProps {
  text: string;
  delay?: number;
  typographyProps?: any;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({
  text,
  delay = 100,
  typographyProps,
}) => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText((prevText) => prevText + text[currentIndex]);
        setCurrentIndex((prevIndex) => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, text]);

  return (
    <Typography {...typographyProps}>
      {currentText}
      <Box
        component="span"
        sx={{
          animation: "blink 1s steps(1) infinite",
          "@keyframes blink": {
            "0%, 100%": { opacity: 1 },
            "50%": { opacity: 0 },
          },
        }}
      >
        |
      </Box>
    </Typography>
  );
};

const HeroSection = () => {
  const handleScrollToSection = (
    e: React.MouseEvent<HTMLElement>,
    targetId: string,
  ) => {
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };
  return (
    <HeroBackground>
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
          transform: "ScaleX(-1)",
        }}
      >
        <source src={`${videobg}`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgb(0 0 0 / 63%)",
          zIndex: 1,
        }}
      />

      <Container
        maxWidth="xl"
        sx={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Grid container alignItems="center" justifyContent="flex-start">
          <Grid item xs={12} lg={6} sx={{ pl: { xs: 0, lg: 5 } }}>
            <Stack
              component={motion.div}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              spacing={2}
              sx={{
                textAlign: { xs: "center", md: "left" },
              }}
            >
              <motion.div variants={itemVariants}>
                <section>
                  <div
                    style={{
                      color: "white",
                      display: "inline-block",
                      margin: "0px",
                      transform: "rotate(356deg)",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "5px",
                      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        padding: "14px 15px",
                        fontSize: "31px",
                      }}
                    >
                      Struggling with
                    </h1>
                  </div>
                </section>

                <section>
                  <div
                    style={{
                      color: "white",
                      display: "inline-block",
                      transform: "rotate(5deg)",
                      marginLeft: "104px",
                      marginTop: "4px",
                      backgroundColor: "rgba(255, 255, 255, 0.1)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "5px",
                      boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",
                    }}
                  >
                    <h1
                      style={{
                        margin: 0,
                        padding: "13px 15px",
                        fontSize: "31px",
                      }}
                    >
                      Tech Challenges?
                    </h1>
                  </div>
                </section>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    fontSize: { xs: "2rem", sm: "2.5rem", md: "61px" },
                    lineHeight: { xs: "1.2", sm: "1.3", md: "66px" },
                    fontFamily: "Montserrat, sans-serif",
                    color: "white",
                    maxWidth: "900px",
                    marginTop: "20px",
                  }}
                >
                  We Design, Develop, and Deliver IT Solutions.
                </Typography>
              </motion.div>

              <motion.div variants={itemVariants}>
                <TypewriterText
                  text="Your Direct Line to Expert Solutions."
                  delay={70}
                  typographyProps={{
                    variant: "h6",
                    sx: {
                      fontSize: { xs: "1rem", sm: "1.15rem", md: "30px" },
                      fontWeight: 900,
                      color: "#378C92", // A vibrant, contrasting color (e.g., a light purple/blue)
                      fontFamily: "Montserrat, sans-serif",
                      maxWidth: { xs: "100%", md: "700px" },
                      margin: { xs: "0 auto", md: "0" },
                    },
                  }}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <Typography
                  variant="h6"
                  sx={{
                    maxWidth: { md: "650px" },
                    fontSize: { xs: "1rem", sm: "1.15rem", md: "17px" },
                    fontWeight: 600,
                    lineHeight: "25.5px",
                    color: "white",
                    fontFamily: "Montserrat",
                  }}
                >
                  Have a question, need support, or want to start a project? Our
                  team is here to help reach out by form, email, or phone.
                </Typography>
              </motion.div>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                sx={{
                  mt: 4,
                  justifyContent: { xs: "center", md: "flex-start" },
                }}
              >
                <motion.div variants={buttonVariants}>
                  <Button
                    onClick={(e) =>
                      handleScrollToSection(e, "#CONTACT_CARD_ID")
                    }
                    href="#contact-section"
                    sx={{
                      fontSize: "19px",
                      fontWeight: 400,
                      color: "White",
                      textTransform: "none",
                      background: "transparent",
                      border: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      whiteSpace: "nowrap",
                      pointerEvents: "auto",
                      cursor: "pointer",
                      "&:hover": {
                        background: "transparent",
                      },
                      "& .text": {
                        position: "relative",
                        "&::after": {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          bottom: 0,
                          width: "20%",
                          height: "2px",
                          backgroundColor: "#378C92",
                          transition: "width 0.4s ease-in-out",
                        },
                      },
                      "& .arrow": {
                        display: "inline-block",
                        transform: "translateX(0)",
                        fontSize: "25px",
                        color: "#378C92",
                        transition: "transform 0.4s ease-in-out",
                      },
                      "&:hover .text::after": {
                        width: "100%",
                      },
                      "&:hover .arrow": {
                        transform: "translateX(6px)",
                      },
                      position: "relative",
                      top: "10px",
                      // pointerEvents: "auto",
                    }}
                  >
                    <span className="text">Get in Touch Now</span>
                    <span className="arrow">→</span>
                  </Button>
                </motion.div>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </HeroBackground>
  );
};
export default HeroSection;
