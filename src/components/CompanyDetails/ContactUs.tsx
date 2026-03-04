import {
  Grid,
  Typography,
  Card,
  Box,
  CardContent,
  useTheme,
} from "@mui/material";
import React from "react";
import { useInView } from "react-intersection-observer";
import FormC from "../UI/FormC";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import addressBG from "../.././assets/images/websiteBG.png";
import phoneBG from "../.././assets/images/phoneBG.png";
import websiteBG from "../.././assets/images/addressBG.png";

/* ---------------- Types ---------------- */
interface ContactUsProps {
  mapUrl?: string;
  category?: string;
  address?: string;
  website?: string;
  phone?: string;
  contactUsIntro?: string;
  formattedNumber?: string;
}

interface ContactData {
  id: number;
  icon: React.ReactNode;
  label: string;
  description?: string;
  iconHover: React.ReactNode;
  handleClick?: (() => void) | null;
  image: string;
  animation: string;
}

const ContactUs: React.FC<ContactUsProps> = ({
  mapUrl,
  category,
  address,
  website,
  phone,
  contactUsIntro,
  formattedNumber,
}) => {
  const contactData: ContactData[] = [
    {
      id: 1,
      icon: <LocationOnOutlinedIcon sx={{ fontSize: "50px" }} />,
      label: "Office Location",
      description: address,
      iconHover: (
        <LocationOnOutlinedIcon
          sx={{ fontSize: { xs: "75px", sm: "110px", md: "150px" } }}
        />
      ),
      handleClick: null,
      image: addressBG,
      animation: "slideInLeft 0.5s ease-out",
    },
    {
      id: 2,
      icon: <LanguageIcon sx={{ fontSize: "50px" }} />,
      label: "Visit Our Website",
      description: website,
      image: websiteBG,
      iconHover: (
        <LanguageIcon
          sx={{ fontSize: { xs: "75px", sm: "110px", md: "150px" } }}
        />
      ),
      animation: "slideInBackwardToForward 0.5s ease-out",
    },
    {
      id: 3,
      icon: <CallOutlinedIcon sx={{ fontSize: "50px" }} />,
      label: "Call Us",
      description: formattedNumber,
      iconHover: (
        <CallOutlinedIcon
          sx={{ fontSize: { xs: "75px", sm: "110px", md: "150px" } }}
        />
      ),
      handleClick: null,
      image: phoneBG,
      animation: "slideInRight 0.5s ease-out",
    },
  ];

  const handleClick = (label: string) => {
    if (label === "Visit Our Website" && website) {
      window.location.href = website;
    } else if (label === "Call Us" && phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const { ref: textRef, inView: textInView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: contactRef1, inView: contactInView1 } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: contactRef2, inView: contactInView2 } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const { ref: contactRef3, inView: contactInView3 } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  const theme = useTheme();

  return (
    <Grid
      container
      sx={{
        px: { md: 7, sm: 15, xs: 3 },
        pb: { md: 8, sm: 6 },
        pt: { xs: "40px", lg: "80px" },
        width: "100%",
        bgcolor: theme.palette.primary.main,
      }}
    >
      <Grid item xs={12} component="div" {...({} as any)} width={"100%"}>
        <Typography
          ref={textRef}
          variant="h5"
          color="primary.hero"
          sx={{
            fontSize: "32px",
            lineHeight: "42px",
            textAlign: "center",
            fontWeight: 600,
            fontFamily: "poppins",
            mb: "35px",
            animation: textInView ? "slideInLeft 0.5s ease-out" : "none",
          }}
        >
          Contact Us
        </Typography>
        <Typography
          ref={textRef}
          variant="h6"
          color="primary.hero"
          sx={{
            fontSize: "16px",
            lineHeight: "22px",
            textAlign: "center",
            fontWeight: 400,
            fontFamily: "poppins",
            px: { lg: "150px", md: "auto" },
            animation: textInView ? "slideInLeft 0.5s ease-out" : "none",
          }}
        >
          {contactUsIntro}
        </Typography>
        <Grid
          container
          spacing={7}
          sx={{
            background: "white",
            textAlign: "center",
            display: "flex",
            justifyContent: "center",
            overflow: "visible",
          }}
          mt={{ md: 2, sm: 2, xs: 2 }}
          mb={{ md: 10 }}
          px={{ md: 8, sm: 1, xs: 0 }}
        >
          {contactData.map((item, index) => {
            if (
              item.label === "Visit Our Website" &&
              website === "https://www.example.com/"
            ) {
              return null;
            }
            return (
              <Grid
                item
                xs={12}
                sm={12}
                md={4}
                key={item.id}
                sx={{
                  flex: 1,
                  mb: "20px",
                  display: "flex",
                  justifyContent: "center",
                  overflow: "visible",
                  animation:
                    index === 0 && contactInView1
                      ? item.animation
                      : index === 1 && contactInView2
                        ? item.animation
                        : index === 2 && contactInView3
                          ? item.animation
                          : "none",
                }}
                ref={
                  index === 0
                    ? contactRef1
                    : index === 1
                      ? contactRef2
                      : contactRef3
                }
                component="div"
                {...({} as any)}
              >
                <Card
                  sx={{
                    position: "relative",
                    bgcolor: theme.palette.primary.main,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                    borderRadius: 4,
                    mt: 7,
                    textAlign: "center",
                    overflow: "visible",
                    borderBottom: "4px solid transparent",
                    "&:hover": {
                      borderBottom: `4px solid ${(theme.palette.primary as any).focus}`,
                      "& .hoverIcon": {
                        animation: "zoomInOut 1.8s infinite",
                      },
                      "& .extraIcon": {
                        animation: "appearFromRight 0.8s forwards",
                      },
                    },
                    "@keyframes zoomInOut": {
                      "0%, 100%": {
                        transform: "scale(1)",
                      },
                      "50%": {
                        transform: "scale(1.2)",
                      },
                    },
                    "@keyframes appearFromRight": {
                      "0%": {
                        opacity: 0,
                        transform: "translateX(20px) rotate(-25deg)",
                      },
                      "100%": {
                        opacity: 1,
                        transform: "translateX(0) rotate(-25deg)",
                      },
                    },
                  }}
                  onClick={() => handleClick(item.label)}
                >
                  <Box
                    sx={{
                      border: `11px solid ${theme.palette.common.white}`,
                      bgcolor: (theme.palette.primary as any).focus,
                      borderRadius: "50%",
                      p: "20px",
                      position: "absolute",
                      top: { md: "-40px", sm: "-35px", xs: "-35px" },
                      color: theme.palette.common.white,
                    }}
                  >
                    <Box className="hoverIcon">{item.icon}</Box>
                  </Box>
                  <Box
                    className="extraIcon"
                    sx={{
                      position: "absolute",
                      bottom: "0px",
                      right: "0px",
                      opacity: 0,
                      transform: "rotate(-35deg)",
                      color: `${theme.palette.common.white} !important`,
                      fontSize: "20px",
                      p: "0px",
                    }}
                  >
                    {item.iconHover}
                  </Box>
                  <CardContent
                    sx={{
                      flexGrow: 1,
                      pb: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                  >
                    <Typography
                      variant="h5"
                      sx={{
                        fontSize: "20px",
                        fontWeight: "600",
                        letterSpacing: "0.2px",
                        lineHeight: "1.9rem",
                        cursor: "pointer",
                        "&:hover": {
                          color: (theme.palette.primary as any).focus,
                        },
                        textAlign: "center",
                        textOverflow: "ellipsis",
                        wordBreak: "break-all",
                        WebkitHyphens: "auto",
                        color: "inherit",
                        mt: "80px",
                        zIndex: 1,
                      }}
                    >
                      {item.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: theme.palette.text.secondary,
                        textAlign: "center",
                        overflow: "hidden",
                        display: "-webkit-box",
                        WebkitLineClamp: 6,
                        WebkitBoxOrient: "vertical",
                        mt: "10px",
                        zIndex: 1,
                        cursor: "default",
                      }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Grid>
      <Grid
        item
        xs={12}
        md={5}
        sx={{
          pr: { xs: 0, md: 4 },
          pl: { md: "40px", lg: "95px" },
          textAlign: { xs: "center", md: "left" },
          my: { xs: 6, md: 0 },
          width: "41.5%",
          flexDirection: "row",
        }}
        component="div"
        {...({} as any)}
      >
        <iframe
          src={mapUrl}
          width="100%"
          height="450px"
          style={{ border: 0, position: "relative" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </Grid>
      <Grid item xs={12} md={6} component="div" {...({} as any)}>
        <FormC
          fields={[
            {
              type: "text",
              name: "first_name",
              required: true,
              placeholder: "Name",
            },
            {
              type: "email",
              name: "email",
              required: true,
              placeholder: "Email Address",
            },
            {
              type: "text",
              name: "subject",
              required: true,
              placeholder: "Subject",
            },
          ]}
          buttonText="Send Message"
          textAreaPlaceholder="Your Message"
        />
      </Grid>
    </Grid>
  );
};

export default ContactUs;
