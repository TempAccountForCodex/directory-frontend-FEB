import React from "react";
import { Box, Grid, Typography, CardMedia, useTheme } from "@mui/material";
import { useInView } from "react-intersection-observer";

/* ---------------- Types ---------------- */
interface CompanyAboutServiceProps {
  background?: string;
  banner?: string;
  isAPIRunning?: boolean;
  ourMission?: string;
}

/* ---------------- Component ---------------- */
const CompanyAboutService: React.FC<CompanyAboutServiceProps> = ({
  background,
  banner,
  isAPIRunning,
  ourMission,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  const { ref: aboutRef, inView: aboutInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const theme = useTheme();

  const animateStyle: React.CSSProperties = {
    opacity: aboutInView ? 1 : 0,
    transition: "opacity 1.5s ease",
    zIndex: 1,
  };

  return (
    <Grid
      container
      sx={{
        height: "auto",
        position: "relative",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundImage: isAPIRunning
          ? `url(${backendUrl}/${background})`
          : `url(${background})`,
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
        overflow: "hidden",
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        py: { lg: 10, md: 8, sm: 5, xs: 2 },
        px: { lg: 11, md: 11, sm: 10, xs: 4 },
      }}
    >
      {/* Dark overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          zIndex: 0,
        }}
      />

      <Grid
        item
        xs={12}
        sm={12}
        lg={6.5}
        md={12}
        sx={{
          position: "relative",
          ml: { lg: "570px", sm: "0px" },
          maxWidth: "100%",
        }}
        component="div"
        {...({} as any)}
      >
        {/* Mission Text */}
        <Grid
          item
          direction="column"
          ref={aboutRef}
          sx={{
            display: "block",
            position: { lg: "absolute", md: "relative" },
            right: { lg: "70%", md: "0" },
            top: { lg: "10%", md: "0" },
            width: { lg: "800px", md: "100%" },
            height: { lg: "400px", md: "auto", sm: "auto", xs: "auto" },
            bgcolor: theme.palette.common.white,
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            p: { lg: 10, md: 5, sm: 5, xs: 3 },
            overflow: "hidden",
            ...animateStyle,
          }}
          component="div"
          {...({} as any)}
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
                fontSize: { lg: "46px", md: "46px", sm: "40px", xs: "30px" },
                fontWeight: "800",
                lineHeight: "1.2",
                textAlign: { lg: "left", xs: "center" },
                color: (theme.palette.primary as any).hover,
                mb: { sm: 2, xs: 1 },
                fontFamily: "Barlow",
              }}
            >
              Our Mission
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: theme.palette.text.secondary,
                textAlign: {
                  lg: "left",
                  md: "left",
                  sm: "left",
                  xs: "center",
                },
                lineHeight: "1.5",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 6,
                WebkitBoxOrient: "vertical",
                fontSize: {
                  lg: "16px",
                  md: "16px",
                  sm: "16px",
                  xs: "12px",
                },
              }}
            >
              {ourMission}
            </Typography>
          </Box>
        </Grid>

        {/* Banner Image */}
        <CardMedia
          component="img"
          image={isAPIRunning ? `${backendUrl}/${banner}` : `${banner}`}
          alt="Banner"
          sx={{
            cursor: "pointer",
            maxWidth: "100%",
            transition: "transform 1.5s ease",
            transform: aboutInView ? "translateX(0)" : "translateX(100%)",
            height: { md: "500px", sm: "400px", xs: "200px" },
          }}
        />
      </Grid>
    </Grid>
  );
};

export default CompanyAboutService;
