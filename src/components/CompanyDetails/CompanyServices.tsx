import React from "react";
import { Box, Grid, Typography, Stack, styled } from "@mui/material";
import Arrow from "../../assets/images/line-arrow.png";

/* ---------------- Types ---------------- */
interface CompanyServicesProps {
  background?: string;
  service?: string[] | string | null; // allow array, string, or null
  isAPIRunning?: boolean;
  phone?: string;
}

/* ---------------- Styled Components ---------------- */
export const CategoryHeading = styled(Typography)(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  marginLeft: "66%",
  marginRight: "auto",
  fontFamily: "Sacramento",
  fontSize: "100px",
  fontWeight: 400,
  textTransform: "none",
  lineHeight: 1,
  color: "#f0f3f6",
  letterSpacing: 4,
  [theme.breakpoints.down("md")]: {
    fontSize: "26px",
  },
  "&&::before": {
    content: '""',
    width: "64px",
    height: "110px",
    position: "absolute",
    bottom: "70%",
    left: "-70px",
    background: `url(${Arrow}) no-repeat center center transparent`,
    backgroundSize: "contain",
    zIndex: -1,
  },
}));

export const StyledSubHeading = styled(Typography)(({ theme }) => ({
  fontFamily: "Sacramento",
  fontSize: "70px",
  fontWeight: 400,
  textTransform: "none",
  position: "relative",
  zIndex: 1,
  lineHeight: 1,
  color: "#1c9ac0",
  [theme.breakpoints.down("md")]: {
    fontSize: "26px",
  },
}));

export const StyledHeading = styled(Typography)(({ theme }) => ({
  color: "#ffffff",
  zIndex: "1",
  [theme.breakpoints.down("md")]: {
    fontSize: "26px",
  },
}));

/* ---------------- Helpers ---------------- */
const formatServices = (services?: string[] | string | null): string => {
  if (!services) return "";

  // If backend sends JSON string
  if (typeof services === "string") {
    try {
      const parsed = JSON.parse(services);
      if (Array.isArray(parsed)) {
        services = parsed;
      } else {
        return services.toLowerCase();
      }
    } catch {
      return typeof services === "string" ? services.toLowerCase() : "";
    }
  }

  if (!Array.isArray(services) || services.length === 0) return "";

  if (services.length === 1) return services[0].toLowerCase();
  if (services.length === 2)
    return `${services[0].toLowerCase()} and ${services[1].toLowerCase()}`;

  const allButLast = services
    .slice(0, -1)
    .map((service) => service.toLowerCase())
    .join(", ");
  const last = services[services.length - 1].toLowerCase();
  return `${allButLast}, and ${last}`;
};

/* ---------------- Component ---------------- */
const CompanyServices: React.FC<CompanyServicesProps> = ({
  background,
  service,
  isAPIRunning,
  phone,
}) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  return (
    <Grid
      container
      sx={{
        height: { lg: "100%", xs: "450px" },
        position: "relative",
        py: { lg: 12, md: 1, sm: 8, xs: 10 },
        px: { sm: 10, xs: 1 },
        pt: 4,
        pb: 3,
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: isAPIRunning
            ? `url(${backendUrl}/${background})`
            : `url(${background})`,
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundAttachment: "fixed",
          filter: "blur(2px)",
          zIndex: -1,
        },
      }}
    >
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
      <Box
        width="100%"
        sx={{
          pl: { sm: "50px", xs: "10px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <StyledSubHeading
          sx={{
            fontSize: { xs: "30px", lg: "68px" },
            lineHeight: { xs: "3rem", lg: "5rem" },
            textAlign: { xs: "center" },
          }}
        >
          Our Services
        </StyledSubHeading>
        <StyledHeading
          sx={{
            fontSize: { xs: "30px", lg: "70px" },
            lineHeight: { xs: "3rem", lg: "5rem" },
            textAlign: { xs: "center" },
            fontWeight: 800,
            fontFamily: "Barlow",
          }}
        >
          Best in Your City
        </StyledHeading>
        <Typography
          variant="subtitle1"
          sx={{
            fontSize: { xs: "12px", sm: "16px", md: "20", lg: "28px" },
            textAlign: { xs: "center" },
            width: { lg: "auto", sm: "500px" },
            color: "white",
            lineHeight: "35px",
            zIndex: "1",
            fontWeight: 400,
            marginY: "8px",
            wordWrap: "break-word",
            px: { md: "10rem" },
            pt: { md: "2rem" },
          }}
        >
          We offer the best services for {formatServices(service)} and a range
          of additional services tailored to meet your needs, ensuring top-notch
          quality and satisfaction for all your requirements.
        </Typography>

        <Stack alignItems={{ xs: "center", lg: "flex-start" }}>
          <CategoryHeading
            sx={{
              fontSize: { xs: "30px", lg: "45px" },
              lineHeight: { xs: "3rem", lg: "5rem" },
              textAlign: { md: "center" },
              mt: { xs: "4rem", lg: "7rem" },
            }}
          >
            Get in touch
          </CategoryHeading>
        </Stack>
      </Box>
    </Grid>
  );
};

export default CompanyServices;
