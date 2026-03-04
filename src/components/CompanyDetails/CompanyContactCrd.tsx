import React from "react";
import { Box, Grid, Typography, useTheme } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CallIcon from "@mui/icons-material/Call";
import LanguageIcon from "@mui/icons-material/Language";
import FooterHeading from "../FooterHeading";
import bgImage from "../.././assets/images/bg-footer-1.png";

/* ---------------- Types ---------------- */
interface CompanyContactCrdProps {
  address?: string;
  website?: string;
  phone?: string;
  title?: string;
  logo?: string;
  isAPIRunning?: boolean;
  intro?: string;
  formattedNumber?: string;
}

const CompanyContactCrd: React.FC<CompanyContactCrdProps> = ({
  address,
  website,
  phone,
  title,
  logo,
  isAPIRunning,
  intro,
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

  const truncateText = (
    text: string | undefined,
    maxLength: number,
  ): string => {
    if (!text) return "";
    if (text.length <= maxLength) {
      return text;
    }
    return text.slice(0, maxLength) + "...";
  };

  const truncatedIntro = truncateText(intro, 100);
  const shouldHide = website === "https://www.example.com/";

  return (
    <Grid
      container
      spacing={5}
      sx={{
        backgroundImage: `url(${bgImage})`,
        backgroundPosition: "top left",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        overflow: "visible",
        bgcolor: (theme.palette.primary as any).hover,
        height: "auto",
      }}
      pt={{ xs: 4, md: 11 }}
      pb={{ xs: 6, md: 6 }}
      px={{ lg: 25, md: 15, sm: 5, xs: 2 }}
    >
      {/* Title */}
      <Grid
        item
        xs={12}
        sx={{ display: "flex", justifyContent: "center", width: "100%" }}
        component="div"
        {...({} as any)}
      >
        <Typography
          variant="h2"
          sx={{
            fontSize: "43px",
            lineHeight: "50px",
            fontFamily: "Barlow",
            color: theme.palette.common.white,
            textAlign: "center",
            fontWeight: "800",
            marginTop: "-20px",
            mb: "30px",
            width: "100%",
          }}
        >
          {title}
        </Typography>
      </Grid>

      {/* Logo + Intro */}
      <Grid
        item
        xs={12}
        md={3.4}
        mr={8}
        ml={5}
        component="div"
        {...({} as any)}
      >
        <Box mb={2} mt={-2} sx={{ textAlign: "left", flex: 1 }}>
          {logo && (
            <img
              src={isAPIRunning ? `${backendUrl}/${logo}` : logo}
              alt=""
              style={{ width: "100px", textAlign: "left" }}
            />
          )}
        </Box>
        <Typography
          variant="body2"
          color="primary.main"
          sx={{
            fontSize: "15px",
            lineHeight: "30px",
            paddingBottom: "15px",
            fontFamily: "'Roboto', sans-serif",
            textAlign: "left",
            width: { lg: "250px", md: "150px" },
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxHeight: "90px",
          }}
        >
          {truncatedIntro}
        </Typography>
      </Grid>

      {/* Our Mission */}
      <Grid
        item
        xs={12}
        sm={4}
        md={2.4}
        flex={1}
        component="div"
        {...({} as any)}
      >
        <Box mb={2} mt={-2} sx={{ textAlign: "left" }}>
          <FooterHeading Text="Our Mission" linebg="primary.focus" />
        </Box>
        <Typography
          variant="body2"
          color="primary.main"
          sx={{
            fontSize: "15px",
            lineHeight: "30px",
            paddingBottom: "15px",
            paddingTop: "8px",
            fontFamily: "'Roboto', sans-serif",
            textAlign: "left",
            maxWidth: 210,
          }}
        >
          At the heart of everything we do lies a steadfast commitment to
          excellence and innovation. Our mission is to empower and inspire
          individuals and communities.
        </Typography>
      </Grid>

      {/* Why Us */}
      <Grid
        item
        xs={12}
        sm={4}
        md={3}
        flex={1}
        component="div"
        {...({} as any)}
      >
        <Box mb={2} mt={-2} sx={{ textAlign: "left" }}>
          <FooterHeading Text="Why Us?" linebg="primary.focus" />
        </Box>
        <ul style={{ padding: "0px" }}>
          {[
            "High Quality: We deliver superior products and services.",
            "Customer Focused: Your needs are our priority.",
            "Innovative: We use the latest technologies.",
            "Reliable: Trusted by clients for our consistency.",
          ].map((text, index) => (
            <li
              key={index}
              style={{
                color: theme.palette.primary.main,
                textAlign: "left",
                marginBottom: "21px",
                marginLeft: "15px",
                transition: "transform 0.3s",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily: "'Roboto', sans-serif",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.transform = "translateX(5px)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.transform = "translateX(0px)")
              }
            >
              {text}
            </li>
          ))}
        </ul>
      </Grid>

      {/* Contact Us */}
      <Grid
        item
        xs={12}
        sm={4}
        md={3.2}
        flex={1}
        component="div"
        {...({} as any)}
      >
        <Box mb={2} mt={-2} sx={{ textAlign: "left" }}>
          <FooterHeading Text="Contact Us" linebg="#primary.focus" />
        </Box>
        <div style={{ paddingTop: "0px" }}>
          {/* Address */}
          {address && (
            <Box sx={{ display: "flex" }}>
              <LocationOnIcon
                sx={{
                  color: theme.palette.primary.main,
                  marginBottom: 0,
                  marginTop: "16px",
                  mr: 1,
                }}
              />
              <p
                style={{
                  color: theme.palette.primary.main,
                  marginBottom: "0px",
                  fontSize: "15px",
                  lineHeight: "24px",
                  fontFamily: "'Roboto', sans-serif",
                  textAlign: "left",
                }}
              >
                {address}
              </p>
            </Box>
          )}

          {/* Website */}
          {!shouldHide && website && (
            <Box sx={{ display: "flex" }}>
              <LanguageIcon
                sx={{
                  color: theme.palette.primary.main,
                  marginBottom: "0px",
                  marginTop: "28px",
                  mr: 1,
                }}
              />
              <a
                href={website}
                style={{
                  display: "block",
                  textDecoration: "none",
                  color: theme.palette.primary.main,
                  marginTop: "30px",
                  fontFamily: "'Roboto', sans-serif",
                  textAlign: "left",
                }}
              >
                {website}
              </a>
            </Box>
          )}

          {/* Phone */}
          {phone && (
            <a
              href={`tel:${phone}`}
              style={{ textDecoration: "none", color: "unset" }}
            >
              <Box sx={{ display: "flex" }}>
                <CallIcon
                  sx={{
                    color: theme.palette.primary.main,
                    marginBottom: "0px",
                    marginTop: "28px",
                    mr: 1,
                    cursor: "pointer",
                  }}
                />
                <p
                  style={{
                    color: theme.palette.primary.main,
                    marginBottom: "0px",
                    marginTop: "30px",
                    fontFamily: "'Roboto', sans-serif",
                    cursor: "pointer",
                  }}
                >
                  {formattedNumber}
                </p>
              </Box>
            </a>
          )}
        </div>
      </Grid>
    </Grid>
  );
};

export default CompanyContactCrd;
