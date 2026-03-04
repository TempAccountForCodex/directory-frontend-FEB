import React from "react";
import { Box, CardMedia, Grid, Typography, useTheme } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CallIcon from "@mui/icons-material/Call";
import LanguageIcon from "@mui/icons-material/Language";
import FooterHeading from "../FooterHeading";
import bgImage from "../.././assets/images/bg-footer-1.png";
import { useInView } from "react-intersection-observer";

/* ---------------- Types ---------------- */
interface CompanyContactCrdProps {
  address?: string;
  website?: string;
  phone?: string;
  title?: string;
  logo?: string;
  banner?: string;
  isAPIRunning?: boolean;
  intro?: string;
  aboutUs?: string;
  formattedNumber?: string;
}

const CompanyContactCrd: React.FC<CompanyContactCrdProps> = ({
  address,
  website,
  phone,
  title,
  logo,
  banner,
  isAPIRunning,
  intro,
  aboutUs,
  formattedNumber,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleClick = (label: string) => {
    if (label === "Visit Our Website" && website) {
      window.location.href = website;
    } else if (label === "Call Us" && phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const theme = useTheme();

  const { ref: aboutUsRef, inView: aboutUsInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: imageRef, inView: imageInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  return (
    <Grid
      container
      ref={aboutUsRef}
      id="about-us-section"
      sx={{
        backgroundImage:
          "url(https://redvisionexperts.com/wp-content/uploads/2020/10/bg-map-3.png)",
        backgroundPosition: "100% -10%",
        backgroundRepeat: "no-repeat",
        textAlign: "center",
        display: "block",
        justifyContent: "left",
        overflow: "hidden",
        position: "relative",
        px: { lg: 10, md: 5, sm: 10, xs: 4 },
        py: { lg: 9, md: 5, sm: 10, xs: 6 },
        opacity: 0,
        transform: aboutUsInView ? "translateX(0)" : "translateX(-100%)",
        animation: aboutUsInView ? "slideInLeft 1s forwards" : "none",
      }}
      rowSpacing={1}
    >
      <Typography
        variant="h5"
        color="text.secondary"
        sx={{
          fontSize: "32px",
          lineHeight: "42px",
          textAlign: "center",
          fontWeight: 600,
          fontFamily: "poppins",
          mb: "20px",
          mt: { sm: "20px", xs: "20px" },
        }}
      >
        About Us
      </Typography>
      <Typography
        variant="h6"
        color="text.secondary"
        sx={{
          fontSize: "16px",
          lineHeight: "22px",
          textAlign: "center",
          fontWeight: 400,
          fontFamily: "poppins",
          marginTop: "10px",
          mb: "30px",
          px: { lg: "150px", md: "auto" },
        }}
      >
        Welcome to {title}, where we are dedicated to delivering excellence and
        innovation in everything we do. We have built a reputation for providing
        top-quality products and services to our valued customers.
      </Typography>
      <Grid
        item
        xs={12}
        sm={12}
        md={6.5}
        sx={{ position: "relative", width: "54%" }}
        ref={imageRef}
        id="image-section"
        style={{}}
        component="div"
        {...({} as any)}
      >
        <CardMedia
          component="img"
          image={isAPIRunning ? `${backendUrl}/${banner}` : `${banner}`}
          alt="ok"
          sx={{
            cursor: "pointer",
            maxWidth: "100%",
            opacity: imageInView ? 1 : 0,
            height: { md: "500px", sm: "400px", xs: "300px" },
            transform: imageInView ? "translateX(0)" : "translateX(-100%)",
            animation: imageInView ? "slideInLeft 1s forwards" : "none",
          }}
        />
        <Grid
          container
          direction="column"
          sx={{
            display: "block",
            position: { md: "absolute", sm: "relative" },
            left: { md: "70%", sm: "0" },
            top: { lg: "11%", md: "17%", sm: "0" },
            width: "100%",
            height: { lg: "400px", md: "auto", sm: "auto", xs: "auto" },
            bgcolor: theme.palette.common.white,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            px: { lg: 8, md: 5, sm: 3, xs: 2 },
            py: { lg: 7, md: 5, sm: 3, xs: 2 },

            overflow: "hidden",
            opacity: imageInView ? 1 : 0,
            transform: imageInView ? "translateX(0)" : "translateX(100%)",
            animation: imageInView ? "slideInRight 1s forwards" : "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "left",
              flexDirection: "column",
              height: "100%",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontSize: { lg: "3rem", sm: "2rem", xs: "1.5rem" },
                fontWeight: "800",
                lineHeight: "1.2",
                textAlign: { md: "left", xs: "center" },
                color: "#11161f",
                mb: { lg: 2, xs: 2 },
                fontFamily: "Barlow",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "grey",
                textAlign: { sm: "left", xs: "center" },
                lineHeight: "1.5",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 6,
                WebkitBoxOrient: "vertical",
                fontSize: { md: "16px", sm: "16px", xs: "12px" },
              }}
            >
              {intro}
            </Typography>
          </Box>
        </Grid>
      </Grid>
      {/* <style>
        {`@keyframes slideInLeft {
  0% {
    transform: translateX(-100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideInRight {
  0% {
    transform: translateX(100%);
    opacity: 0;
  }
  100% {
    transform: translateX(0);
    opacity: 1;
  }
}

#about-us-section {
  opacity: 0;
  animation: slideInLeft 2s forwards;
}

#image-section {
  opacity: 0;
  animation: slideInRight 2s forwards;
}`}
      </style> */}
    </Grid>
  );
};

export default CompanyContactCrd;
