import React from "react";
import { CardMedia, Grid, Typography, useTheme } from "@mui/material";
import { useInView } from "react-intersection-observer";

/* ---------------- Types ---------------- */
interface CompanyBanTextProps {
  banner?: string;
  category?: string;
  phone?: string;
  isAPIRunning?: boolean;
  formattedNumber?: string;
}

/* ---------------- Component ---------------- */
const CompanyBanText: React.FC<CompanyBanTextProps> = ({
  banner,
  category,
  phone,
  isAPIRunning,
  formattedNumber,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { ref: usRef, inView: usInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });
  const theme = useTheme();
  const { ref: imageeRef, inView: imageeInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  return (
    <Grid
      container
      ref={usRef}
      id="about-us-section"
      sx={{
        width: "100%",
        textAlign: "center",
        mt: "20px",
        display: "flex",
        position: "relative",
        opacity: 0,
        px: { lg: "60px", sm: "35px", xs: "40px" },
        pt: { xs: "25px", lg: 10 },
        pb: { xs: "25px", lg: 10 },
        justifyContent: "space-between",
        background: `linear-gradient(to bottom, ${(theme.palette.primary as any).hover} 60%, ${(theme.palette.primary as any).hero} 90%)`,
      }}
      rowSpacing={1}
    >
      {/* Left Image Section */}
      <Grid
        item
        xs={12}
        sm={12}
        lg={6}
        sx={{
          position: "relative",
          height: { md: "100%", sm: "325px", xs: "100%" },
          opacity: 0,
          paddingRight: "20px",
        }}
        ref={imageeRef}
        id="image-section"
        component="div"
        {...({} as any)}
      >
        <CardMedia
          component="img"
          image={isAPIRunning ? `${backendUrl}/${banner}` : `${banner}`}
          alt="ok"
          sx={{
            mt: { xs: "20px", lg: "20px" },
            maxWidth: "100%",
            height: { md: "450px", sm: "325px", xs: "225px" },
            width: "100%",
            transform: imageeInView ? "translateX(0)" : "translateX(-100%)",
            animation: imageeInView ? "slideInLeft 1s forwards" : "none",
            opacity: imageeInView ? 1 : 0,
          }}
        />
      </Grid>

      {/* Right Text Section */}
      <Grid
        item
        xs={12}
        sm={12}
        lg={6}
        direction="column"
        sx={{
          alignItems: "center",
          justifyContent: "center",
          display: "flex",
          mt: { lg: 0, md: 0, sm: "-250px", xs: "10px" },
          mb: { xs: "20px" },
        }}
        component="div"
        {...({} as any)}
        flexGrow={1}
      >
        <Grid
          container
          direction="column"
          sx={{
            alignItems: { sm: "center", xs: "center" },
            transform: usInView ? "translateX(0)" : "translateX(-100%)",
            animation: usInView ? "slideInRight 1s forwards" : "none",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.common.white,
              textAlign: { sm: "center", xs: "center" },
              lineHeight: "1.5",
              width: "100%",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
              fontSize: { md: "24px", sm: "24px", xs: "16px" },
              mb: { sm: 2, xs: 1 },
              mt: { sm: 2, xs: 3 },
            }}
          >
            You can trust us
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: theme.palette.common.white,
              fontSize: { md: "42px", sm: "38px", xs: "14px" },
              fontWeight: "800",
              width: "100%",
              lineHeight: "1.2",
              textAlign: { sm: "center", xs: "center" },
              mb: { sm: 3, xs: 1 },
              fontFamily: "Barlow",
            }}
          >
            The Best In {category}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.common.white,
              textAlign: { sm: "center", xs: "center" },
              lineHeight: "1.5",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 6,
              WebkitBoxOrient: "vertical",
              width: { sm: "480px", xs: "90%" },
              fontSize: { md: "18px", sm: "18px", xs: "12px" },
            }}
          >
            You can trust us to deliver exceptional and quality service every
            time. Our commitment to integrity and excellence is unwavering. Rely
            on us for reliable solutions tailored to your needs.
          </Typography>
        </Grid>
      </Grid>

      {/* Animations */}
      <style>
        {`@keyframes slideInLeft {
            0% {
              transform: translateX(100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          @keyframes slideInRight {
            0% {
              transform: translateX(-100%);
              opacity: 0;
            }
            100% {
              transform: translateX(0);
              opacity: 1;
            }
          }

          #about-us-section {
            opacity: 0;
            animation: slideInLeft 1s forwards;
          }

          #image-section {
            opacity: 0;
            animation: slideInRight 1s forwards;
          }`}
      </style>
    </Grid>
  );
};

export default CompanyBanText;
