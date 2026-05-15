import React from "react";

// ----- MUI Material (strict imports)
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";

// ----- MUI System Utilities
import { styled, alpha } from "@mui/material/styles";

// ----- MUI Theme Hook
import { useTheme } from "@mui/material/styles";

// ----- Animations
import { keyframes } from "@emotion/react";

// ----- Router
import { useNavigate } from "react-router-dom";
import HomeSearch from "../../publicComponents/Home/HomeSearch";

// ----- Assets
const Image = "/assets/publicAssets/images/home/bg12.png";
const Image2 = "/assets/publicAssets/images/home/d11.jpg";
const Image3 = "/assets/publicAssets/images/home/d222.jpg";
const Image4 = "/assets/publicAssets/images/home/d333.jpg";
const Image5 = "/assets/publicAssets/images/home/d444.jpg";
const Image6 = "/assets/publicAssets/images/home/d555.jpg";
const Image7 = "/assets/publicAssets/images/home/d666.jpg";
const Image8 = "/assets/publicAssets/images/home/d777.jpg";

import { SparklesCore } from "../../UI/shadcn-io/sparkles";

const HeroVideo1 = "/assets/publicAssets/videos/Home/hero7.mp4";

const HeroImage1 = "/assets/publicAssets/images/home/3d(1).png";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PinterestIcon from "@mui/icons-material/Pinterest";

import TrueFocus from "../../../backgrounds/TrueFocus/TrueFocus";

// ================= NEW: SLIDER IMAGES ARRAY =================
const heroImages = [
  Image,
  Image2,
  Image3,
  Image4,
  Image5,
  Image6,
  Image7,
  Image8,
];

const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.1); }
`;

// ================= Animation =================
const fadeInBottom = keyframes`
  from { opacity: 0; transform: translateY(50px); }
  to { opacity: 1; transform: translateY(0); }
`;

const jump = keyframes`
  0%, 100% { transform: translateY(10px); }
  50% { transform: translateY(-10px); }
`;
const roundRotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const floatUp = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(12px); }
  100% { transform: translateY(0px); }
`;

const glowPulse = keyframes`
  0% { filter: drop-shadow(0 0 8px #378c92cc); }
  50% { filter: drop-shadow(0 0 16px #378c92ff); }
  100% { filter: drop-shadow(0 0 8px #378c92cc); }
`;

const floatUp1 = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(32px); }
  100% { transform: translateY(0px); }
`;

const glowPulse1 = keyframes`
  0% { filter: drop-shadow(0 0 8px #378c92cc); }
  50% { filter: drop-shadow(0 0 16px #378c92ff); }
  100% { filter: drop-shadow(0 0 8px #378c92cc); }
`;

// ================= NEW: SLIDE WRAPPER =================
const SlideWrapper = styled(Box)(({ theme }) => ({
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  display: "flex",
  transition: "transform 1.2s ease-in-out",
  zIndex: 0,
}));

// ================= Hero Background =================
const StyledHeader = styled(Grid)(({ theme }) => ({
  width: "100%",
  position: "relative",
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  animation: `${fadeInBottom} 2s ease`,
  overflow: "hidden",
  // backgroundColor: "#fff",
  background: "rgba(0,0,0,0.18)",

  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    zIndex: 1,
    background: "rgba(0,0,0,0.25)",
  },

  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to top right, rgba(0,0,0,0.4), rgba(55,140,146,0.05))",
    mixBlendMode: "overlay",
    zIndex: 2,
  },

  [theme.breakpoints.down("sm")]: {
    minHeight: "80vh",
  },
}));

// ================= Hero Text Container =================
const StyledHeaderItem = styled(Grid)(({ theme }) => ({
  position: "relative",
  zIndex: 3,
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "10%",
  textAlign: "center",
  color: "#100c0cff",
  margin: "0 0",

  [theme.breakpoints.down("sm")]: {
    flexDirection: "column", // <-- stack on mobile
    gap: "40px",
    textAlign: "start",
  },
}));

// ================= Headings =================
const StyledHeading = styled(Typography)(({ theme }) => ({
  fontFamily: "Kanit, sans-serif",
  fontWeight: 500,
  letterSpacing: "0.5px",
  lineHeight: 1.1,
  color: theme.palette.primary.main,
  [theme.breakpoints.down("md")]: { fontSize: "1.8rem" },
}));

// ================= Social Sidebar =================
const styles = {
  verticalSocialContainer: {
    position: "absolute",
    left: { xs: "10px", md: "35px" },
    top: "50%",
    transform: "translateY(-50%)",
    display: { xs: "none", md: "flex" },
    flexDirection: "column",
    color: "#312f2fff",
    alignItems: "center",
    zIndex: 30,
    gap: "20px",
  },
  socialIcon: {
    fontSize: { xs: 15, md: 26 },
    cursor: "pointer",
    color: "#fff2f2ff",
    opacity: 0.85,
    transition: "all 0.3s ease",
    "&:hover": {
      color: "#37B5B9",
      transform: "scale(1.3) rotate(5deg)",
      opacity: 1,
    },
  },
  fadingLine: (direction) => ({
    background: `linear-gradient(to ${direction},
      rgba(255,255,255,0.8), rgba(255,255,255,0))`,
    height: "150px",
    width: "2px",
    opacity: 0.6,
  }),
};

// ================= Component =================
const StyledHader: React.FC = () => {
  const [videoIndex, setVideoIndex] = React.useState(0);

  const videos = [HeroVideo1];
  const images = [HeroImage1];

  const handleVideoEnd = () => {
    setVideoIndex((prev) => (prev + 1) % videos.length);
  };
  const theme = useTheme();
  const navigate = useNavigate();

  // ================= NEW: SLIDER STATE =================
  const [currentIndex, setCurrentIndex] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const socialMediaIcons = [
    {
      name: "facebook",
      Icon: FacebookIcon,
      url: "https://www.facebook.com/thetechietribe.official",
    },
    {
      name: "instagram",
      Icon: InstagramIcon,
      url: "https://www.instagram.com/thetechietribe_/",
    },
    {
      name: "linkedin",
      Icon: LinkedInIcon,
      url: "https://www.linkedin.com/company/techietribe",
    },
    {
      name: "pinterest",
      Icon: PinterestIcon,
      url: "https://www.pinterest.com/thetechietribe_/",
    },
  ];

  return (
    <Grid
      container
      component="div"
      sx={{ height: { xs: "auto", md: "100vh" } }}
    >
      {/* === FULL BACKGROUND GRIDSCAN === */}

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: { xs: "97%", sm: "126.6%", md: "100%" },
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <video
          key={videoIndex} // important to force re-render
          src={videos[videoIndex]} // dynamic video
          autoPlay
          muted
          loop={false} // stop looping manually
          playsInline
          preload="auto"
          onEnded={handleVideoEnd}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "brightness(0.55)",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
            willChange: "transform",
          }}
        />
      </Box>

      <Box
        sx={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></Box>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          left: "50%",
          width: "50%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
        }}
      ></Box>

      <StyledHeader>
        {/* ================= SLIDER (BEHIND EVERYTHING) ================= */}

        {/* === Left Side Vertical Social Icons === */}
        <Box sx={styles.verticalSocialContainer}>
          <Box sx={styles.fadingLine("top")} />
          {socialMediaIcons.map(({ Icon, url }, index) => (
            <Link
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon sx={styles.socialIcon} />
            </Link>
          ))}
          <Box sx={styles.fadingLine("bottom")} />
        </Box>

        {/* === Hero Content === */}
        <StyledHeaderItem
          sx={{
            width: {
              xs: "280px",
              sm: "580px",
              md: "850px",
              lg: "1150px",
              xl: "1450px",
            },
            pl: "2%",
          }}
        >
          <Box
            sx={{
              display: "grid",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              gap: { xs: 1, sm: 2, md: 1 },
            }}
          >
            <Box
              sx={(t) => ({
                width: { xs: "100%", sm: "60%", md: "70%", lg: "50%" },
                mx: { xs: 0, sm: "auto", md: 0 },
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: { xs: 0.8, sm: 1.5 },
                px: { xs: 1, sm: 2.5 },
                mt: { xs: "46%", sm: "28%", md: 0 },
                py: { xs: 0.8, md: 1 },
                borderRadius: "50px",
                border: `1.5px solid ${alpha(t.palette.text.main, 0.3)}`,
                backgroundColor: alpha(t.palette.text.main, 0.05),
                backdropFilter: "blur(10px)",
                mb: 3,
                position: "relative",
                zIndex: 1,
              })}
            >
              <Box
                sx={(t) => ({
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: t.palette.text.main,
                  boxShadow: `0 0 12px ${alpha(t.palette.text.main, 0.6)}`,
                  animation: `${pulse} 2s ease-in-out infinite`,
                })}
              />
              <Typography
                variant="overline"
                sx={(t) => ({
                  fontWeight: 700,
                  fontSize: { xs: 8, md: 11 },
                  letterSpacing: "3px",
                  color: t.palette.text.secondary,
                  textTransform: "uppercase",
                })}
              >
                Discover. Connect. Grow.
              </Typography>
            </Box>
            <StyledHeading
              sx={{
                fontSize: {
                  xs: "1.56rem",
                  sm: "3rem",
                  md: "3.6rem",
                  lg: "5rem",
                  xl: "5.1rem",
                },
                whiteSpace: "nowrap",
                flexShrink: 0,
                textAlign: "start",
                // pt: 10,
              }}
            >
              {/* Best in  */}
            </StyledHeading>
            <TrueFocus
              sentence="Find Trusted Providers"
              manualMode={false}
              blurAmount={1.5}
              borderColor="rgb(20,165,184)"
              animationDuration={1.2}
              pauseBetweenAnimations={1}
            />
            <Box
              component="img"
              src={images[videoIndex]}
              alt="enterprise-floating"
              sx={{
                width: { xs: "80%", sm: "70%", md: "100%" }, // <--- much better for mobile
                marginTop: { xs: "-15%", md: 0 },
                display: { xs: "flex", md: "none" },
                mx: "auto",
                height: "auto",
                objectFit: "contain",
                animation: `${floatUp} 4.5s ease-in-out infinite, ${glowPulse} 3s ease-in-out infinite`,
                filter: "drop-shadow(0 0 10px #3ac4cecc)",
                transition: "all 0.4s ease",
              }}
            />

            <Box sx={{ px: 0 }}>
              <HomeSearch />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  mt: 3,
                  mb: { xs: 0, sm: 4 },
                  fontSize: {
                    xs: "14px",
                    sm: "16.5px",
                    md: "18px",
                    lg: "20px",
                  },
                  px: { xs: 2, sm: 0 },
                  // pr:{xs:0,sm:"10%",md:0},
                  pb: { xs: 2, sm: 0 },
                  color: alpha("#fff", 0.9),
                  fontFamily: "Kanit, sans-serif",
                  fontWeight: 300,
                  lineHeight: 1.8,
                  textAlign: "start",
                  maxWidth: "700px",
                }}
              >
                Discover top rated local businesses from restaurants and
                nightlife to home services and professionals right in your
                neighborhood with our business listings.
              </Typography>
            </Box>
            <Button
              onClick={() => navigate("/listings")}
              sx={{
                fontSize: { xs: "16px", sm: "19px" },
                fontWeight: 400,
                color: theme.palette.text.secondary,
                textTransform: "none",
                background: "transparent",
                // pr:{xs:0,sm:"10%",md:0},
                ml: 0,
                mb: { xs: 2, sm: "15%", md: 0 },
                mt: { xs: "-15%", sm: "-10%", md: 0 },
                border: "none",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "flex-start" },
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
              }}
            >
              <span className="text">Get in Touch Now</span>
              <span className="arrow">→</span>
            </Button>
          </Box>
          <Box>
            <Box
              component="img"
              src={images[videoIndex]}
              alt="enterprise-floating"
              sx={{
                width: { xs: "45%", sm: "100%", xl: "95%" }, // <--- much better for mobile
                marginTop: { xs: "-20%", sm: 0 },
                display: { xs: "none", md: "flex" },

                mx: "auto",
                height: { xs: "auto", md: "100%", lg: "auto" },
                objectFit: "contain",
                animation: `${floatUp} 4.5s ease-in-out infinite, ${glowPulse} 3s ease-in-out infinite`,
                filter: "drop-shadow(0 0 10px #3ac4cecc)",
                transition: "all 0.4s ease",
              }}
            />
          </Box>

          {/* <Stack alignItems="center" sx={{ pt: { xs: 2, sm: 8, xl: 12 }, pb: { xs: 2, sm: 0 } }}>
            <CategoryHeading sx={{ fontSize: { xs: "1.56rem", lg: "2.3rem" } }}>
              Dive into Popular Categories
            </CategoryHeading>
          </Stack> */}
        </StyledHeaderItem>
        {/* <Box>
          <LogoParticlesSection/>
        </Box> */}
        <SparklesCore
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={30}
          className="absolute inset-0 w-full h-full"
          particleColor="#FFFFFF"
          speed={1}
        />

        {/* === Bottom Social Icons (Mobile) === */}
        <Box
          sx={{
            position: "absolute",
            bottom: { xs: 8, sm: 10, md: 40 },

            left: 0,
            width: "100%",
            display: { xs: "flex", md: "none" },
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 2, sm: 3, md: 4 },
            flexWrap: "wrap",
            zIndex: 2,
          }}
        >
          <Box
            sx={{
              height: "2px",
              width: { xs: "15%", sm: "20%", md: "30%" },
              background:
                "linear-gradient(to right, rgba(255,255,255,0.7), rgba(255,255,255,0))",
              opacity: 0.6,
            }}
          />

          {socialMediaIcons.map(({ Icon, url }, index) => (
            <Link
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon
                sx={{
                  fontSize: { xs: 22, sm: 26 },
                  color: "#fff",
                  opacity: 0.85,
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "#37B5B9",
                    transform: "scale(1.2) rotate(5deg)",
                    opacity: 1,
                  },
                }}
              />
            </Link>
          ))}

          <Box
            sx={{
              height: "2px",
              width: { xs: "15%", sm: "20%", md: "30%" },
              background:
                "linear-gradient(to left, rgba(255,255,255,0.7), rgba(255,255,255,0))",
              opacity: 0.6,
            }}
          />
        </Box>
      </StyledHeader>
    </Grid>
  );
};

export default StyledHader;
