import { Box, Typography, Grid, Paper, Container } from "@mui/material";
import { keyframes } from "@mui/system";

const earthImage = "/assets/publicAssets/images/ContactUs/earth.avif";
const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "/assets/publicAssets/images/common/darkhole.svg";

const instagramImage = "/assets/publicAssets/images/ContactUs/instagram.webp";
const github = "/assets/publicAssets/images/ContactUs/github.webp";
const linkedin = "/assets/publicAssets/images/ContactUs/linkedin.webp";
const facebook = "/assets/publicAssets/images/ContactUs/facebook.webp";

import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.6;
  }
  70% {
    transform: scale(2.8);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

const StatCard = ({ icon: Icon, value, label, color = "#fff" }: any) => {
  const isImage = typeof Icon === "string";

  return (
    <Paper
      elevation={0}
      sx={{
        background: "rgba(255, 255, 255, 0.03)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderRadius: "12px",
        padding: { xs: "18px", md: "24px" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        width: { xs: "180", lg: "240px" },
        height: { xs: "200", lg: "246px" },
        color: "white",
      }}
    >
      <Box sx={{ mb: 1.5, opacity: 0.9 }}>
        {isImage ? (
          <Box
            component="img"
            src={Icon}
            alt={value}
            sx={{ width: { xs: 42, lg: 62 }, height: { xs: 42, lg: 62 } }}
          />
        ) : (
          <Icon sx={{ fontSize: { xs: 42, lg: 62 }, color }} />
        )}
      </Box>

      <Typography
        variant="h6"
        fontWeight="700"
        sx={{ mb: 0.5, fontSize: { xs: "11px", md: "13px", lg: "17px" } }}
      >
        {value}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "rgba(255,255,255,0.5)",
          fontSize: { xs: "0.6rem", sm: "0.8rem", md: "1rem" },
        }}
      >
        {label}
      </Typography>
    </Paper>
  );
};

const ScaleShowcase = () => {
  return (
    <Box
      sx={{
        backgroundImage: `url(${star})`,
        backgroundColor: "#041e18",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: { xs: "auto", sm: "77vh", md: "90vh" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pt: 10,
        overflow: "hidden",
        position: "relative",
      }}
    >
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
      <Typography
        variant="h1"
        sx={{
          color: "white",
          fontWeight: 600,
          mb: 10,
          zIndex: 1,
          fontSize: { xs: "2.5rem", sm: "3rem" },
        }}
      >
        Let's Connect
      </Typography>

      {/* Main Container for the angled sections */}
      <Box
        sx={{
          display: { xs: "block", sm: "flex" },
          gap: { xs: 2, md: 4 },
          perspective: "1200px",
          position: { xs: "relative", sm: "absolute" },
          bottom: 0,
          zIndex: 2,
          px: { xs: 3, md: 0 },
        }}
      >
        {/* Left Section (Last 30 Days) */}
        <Box
          sx={{
            textAlign: "center",
            transform: { xs: "rotate(360deg)", md: "rotate(345deg)" },
            position: "relative",
            top: "-40px",
            transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",

            "&:hover": {
              top: "-210px",
              transform: "rotate(355deg)",
            },
          }}
        >
          <Typography
            sx={{
              color: "white",
              mb: 3,
              opacity: 0.9,
              fontWeight: 500,
              fontSize: "30px",
            }}
          >
            Get in touch
          </Typography>
          <Grid container spacing={1} sx={{ maxWidth: 500 }}>
            <Grid item xs={6}>
              <StatCard
                value="Chat with us"
                label="Support available"
                icon={ChatBubbleOutlineIcon}
              />
            </Grid>

            <Grid item xs={6}>
              <StatCard
                value="info@thetechietribe.com"
                label="Email us anytime"
                icon={EmailOutlinedIcon}
              />
            </Grid>

            <Grid item xs={6}>
              <StatCard
                value="Call us"
                label="(251) 373-2325"
                icon={CallOutlinedIcon}
              />
            </Grid>

            <Grid item xs={6}>
              <StatCard
                value="Visit us"
                label="Houston, TX Office"
                icon={LocationOnOutlinedIcon}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Center Divider Dot */}
        <Box
          sx={{
            width: "2px",
            height: "350px",
            background:
              "linear-gradient(to bottom, transparent, #00f2fe, transparent)",
            position: "relative",
            mx: 4,
            mt: 10,
            display: { xs: "none", sm: "flex" },
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              transform: "translateX(-50%)",
              width: 15,
              height: 15,
              zIndex: 3,
            }}
          >
            {/* Solid center dot */}
            <Box
              sx={{
                width: 15,
                height: 15,
                borderRadius: "50%",
                bgcolor: "#00f2fe",
                boxShadow: "0 0 15px #00f2fe",
                position: "relative",
                zIndex: 2,
              }}
            />

            {/* Pulsing ring */}
            <Box
              sx={{
                position: "absolute",
                top: "-2px",
                left: "-7%",
                width: 20,
                height: 20,
                borderRadius: "50%",
                bgcolor: "#00f2fe",
                transform: "translate(-50%, -50%)",
                animation: `${pulse} 4s ease-out infinite`,
                zIndex: 1,
              }}
            />
          </Box>
        </Box>

        {/* Right Section (Total) */}
        <Box
          sx={{
            textAlign: "center",
            transform: { xs: "rotate(360deg)", md: "rotate(15deg)" },
            paddingTop: { xs: "25px", sm: 0 },
            position: "relative",
            top: "-40px",

            transition: "all 0.3s cubic-bezier(0.22, 1, 0.36, 1)",

            "&:hover": {
              top: "-210px",
              transform: "rotate(5deg)",
            },
          }}
        >
          <Typography
            sx={{
              color: "white",
              mb: 3,
              opacity: 0.9,
              fontWeight: 500,
              fontSize: "30px",
            }}
          >
            Follow us
          </Typography>
          <Grid container spacing={1} sx={{ maxWidth: 500 }}>
            <Grid item xs={6}>
              <StatCard
                value="GitHub"
                label="Open source work"
                icon={github}
                color="#ffffff"
              />
            </Grid>
            <Grid item xs={6}>
              <StatCard
                value="Instagram"
                label="Daily updates"
                icon={instagramImage}
              />
            </Grid>

            <Grid item xs={6}>
              <StatCard
                value="LinkedIn"
                label="Company profile"
                icon={linkedin}
                color="#0A66C2"
              />
            </Grid>

            <Grid item xs={6}>
              <StatCard
                value="Facebook"
                label="Community"
                icon={facebook}
                color="#1877F2"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* The Globe / Bottom Earth Element */}

      {/* 1. The Atmosphere Glow (The PNG you provided) */}
      <Box
        component="img"
        src={earthImage}
        alt="Earth Glow"
        sx={{
          position: "absolute",
          bottom: { xs: "-13%", md: "-32%" },
          width: "45%",
          height: "auto",
          zIndex: 2,
        }}
      />
    </Box>
  );
};

export default ScaleShowcase;
