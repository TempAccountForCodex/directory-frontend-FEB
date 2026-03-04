import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  TextField,
  useTheme,
} from "@mui/material";
import { SnackbarProvider, useSnackbar } from "notistack";
import MailIcon from "@mui/icons-material/Mail";
import CallIcon from "@mui/icons-material/Call";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PinterestIcon from "@mui/icons-material/Pinterest";
import CompanyContactData from "./Data/CompanyContactInfo";
const header = "/WhiteLogo.png";
import RotatingButton from "./UI/Rotatingbutton";
import { useCookieConsent } from "../context/PreferencesContext";

const { email, phone, OfficeLocation } = CompanyContactData[0];

const forumSupport = [
  { name: "Terms and Conditions", path: "/terms-and-conditions" },
  { name: "Help & FAQ", path: "/faq" },
  { name: "Privacy Policy", path: "/privacy-policy" },
  { name: "Cookie Policy", path: "/cookie-policy" },
  {
    name: "Cookie Settings",
    path: "#cookie-settings",
    action: "openCookieSettings",
  },
];

const Footer = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { openPreferences } = useCookieConsent();
  const [formemail, setFormEmail] = useState("");
  const [error, setError] = useState("");
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  if (
    location?.pathname === "/dashboard" ||
    /^\/business\//.test(location?.pathname) ||
    isDashboardRoute
  ) {
    return null;
  }

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormEmail(e.target.value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formemail) return setError("Email is required");
    if (!validateEmail(formemail))
      return setError("Please enter a valid email address");

    enqueueSnackbar("Subscribed successfully!", {
      variant: "success",
      autoHideDuration: 3000,
      action: (key) => (
        <Button color="inherit" size="small" onClick={() => closeSnackbar(key)}>
          Close
        </Button>
      ),
    });

    setFormEmail("");
    setError("");
  };

  // ✅ Handle footer link clicks
  const handleFooterLinkClick = (data: {
    name: string;
    path: string;
    action?: string;
  }) => {
    if (data.action === "openCookieSettings") {
      openPreferences();
    } else {
      navigate(data.path);
    }
  };

  // ✅ Smooth scroll to homepage sections
  const handleSmoothScroll = (id: string) => {
    if (window.location.pathname === "/") {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500);
    }
  };

  // ✅ Social Links
  const socialLinks = [
    {
      icon: FacebookIcon,
      href: "https://www.facebook.com/thetechietribe.official",
    },
    {
      icon: InstagramIcon,
      href: "https://www.instagram.com/thetechietribe_/",
    },
    {
      icon: LinkedInIcon,
      href: "https://www.linkedin.com/company/techietribe",
    },
    // {
    //   icon: YouTubeIcon,
    //   href: "https://www.youtube.com/@thetechietribe.official",
    // },
    {
      icon: PinterestIcon,
      href: "https://www.pinterest.com/thetechietribe_/",
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        position: "relative",
        overflow: "hidden",
        color: "#ffffff",
        pt: 8,
        pb: 4,
      }}
    >
      {/* === Black Overlay Background + Image === */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundColor: (theme.palette as any).bg.blackBg,
          // backgroundImage: `url(${bgImage})`,
          backgroundSize: "cover",
          backgroundPosition: "top left",
          backgroundRepeat: "no-repeat",
          opacity: 0.98,
          zIndex: 0,
        }}
      />

      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* === TOP SECTION (Newsletter) === */}
        {/* <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            pb: 5,
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            gap: 3,
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans, system-ui",
                color: "#fff",
                mb: 2,
              }}
            >
              Grow Your Business Network With Us
            </Typography>

            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: "flex",
                alignItems: "center",
                borderRadius: "30px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.25)",
                backgroundColor: "transparent",
                width: { xs: "100%", md: "71%" },
                height: "52px",
              }}
            >
              <TextField
                variant="outlined"
                placeholder="name@example.com"
                value={formemail}
                onChange={handleChange}
                InputProps={{
                  disableUnderline: true,
                  style: {
                    padding: "0 18px",
                    color: "#fff",
                    fontSize: "16px",
                    height: "52px",
                  },
                }}
                sx={{
                  flex: 1,
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              />
              <Button
                type="submit"
                sx={{
                  backgroundColor: "#ffffff",
                  color: "#000",
                  fontWeight: 600,
                  fontSize: "16px",
                  textTransform: "none",
                  height: "52px",
                  borderRadius: "30px",
                  px: "28px",
                  "&:hover": {
                    backgroundColor: "#ffffff",
                    opacity: 0.9,
                  },
                }}
              >
                Subscribe
              </Button>
            </Box>

            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{ mt: 1, fontSize: "13px" }}
              >
                {error}
              </Typography>
            )}
          </Box>

          <Box sx={{ width: { xs: "100%", md: "30%" }, mt: { xs: 4, md: 0 } }}>
            <RotatingButton
              linkTo="/contact"
              size="md"
              textColor="white"
              sx={{ ml: { xs: "0", md: "auto" } }}
            />
          </Box>
        </Box> */}

        {/* === TOP SECTION (Primary CTA Block) === */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            // pb: 6,
            pb: 0,
            borderBottom: "1px solid rgba(255,255,255,0.15)",
            gap: 4,
          }}
        >
          {/* <Box sx={{ flex: 1 }}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                fontFamily: "Plus Jakarta Sans, system-ui",
                color: "#fff",
                mb: 1.5,
              }}
            >
              Start Building Your Free Website Today
            </Typography>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.75)",
                fontSize: "16px",
                maxWidth: "520px",
                lineHeight: "26px",
                mb: 3,
              }}
            >
              Create your free landing page and get listed in our business
              directory. Increase visibility, connect with customers.
            </Typography>
          </Box>

          <Box sx={{ width: { xs: "100%", md: "30%" }, mt: { xs: 4, md: 0 } }}>
            <RotatingButton
              linkTo="/contact"
              size="md"
              textColor="white"
              sx={{ ml: { xs: "0", md: "auto" } }}
            />
          </Box> */}
        </Box>

        {/* === MIDDLE SECTION (Left + Right) === */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: { xs: 6, md: 0 },
            pt: 6,
            pb: 4,
            borderBottom: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {/* LEFT SIDE */}
          <Box
            sx={{
              flex: 1.1,
              minWidth: "320px",
              pr: { md: 6 },
            }}
          >
            <img src={header} alt="Techietribe" width={220} />
            <Typography
              sx={{
                fontSize: "16px",
                lineHeight: "28px",
                fontFamily: "system-ui",
                color: "rgba(255,255,255,0.85)",
                mt: 2,
                maxWidth: "380px",
              }}
            >
              Connecting businesses to endless opportunities. We list, link, and
              elevate trusted brands.
            </Typography>

            {/* ✅ Social Icons with links */}
            <Box
              sx={{
                display: "flex",
                gap: 2,
                mt: 3,
                px: 2,
                py: 1,
                borderRadius: "50px",
                backgroundColor: "rgba(255,255,255,0.05)",
                width: "fit-content",
              }}
            >
              {socialLinks.map(({ icon: Icon, href }, index) => (
                <IconButton
                  key={index}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#ffffff",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      color: "#56b0b3",
                      transform: "translateY(-3px)",
                    },
                    width: 36,
                    height: 36,
                  }}
                >
                  <Icon sx={{ fontSize: 20 }} />
                </IconButton>
              ))}
            </Box>
          </Box>

          {/* RIGHT SIDE — Quick Links + Explore Sections + Get in Touch */}
          <Box
            sx={{
              flex: 1.5,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: { xs: 4, md: 6 },
              width: "100%",
            }}
          >
            {/* Quick Links */}
            <Box sx={{ minWidth: "100px" }}>
              <Typography
                sx={{
                  fontFamily: "sans-serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  mb: 2.5,
                  color: "#fff",
                }}
              >
                Quick Links
              </Typography>
              {[
                { label: "Home", to: "/" },
                { label: "About us", to: "/about-us" },
                { label: "Listing", to: "/listings" },
                { label: "Blog", to: "/blog" },
                { label: "Contact us", to: "/contact" },
              ].map((item) => (
                <Typography
                  key={item.to}
                  component={Link}
                  to={item.to}
                  sx={{
                    display: "block",
                    lineHeight: "2rem",
                    fontFamily: "system-ui",
                    color: "rgba(255,255,255,0.9)",
                    fontWeight: 400,
                    fontSize: "16px",
                    textDecoration: "none",
                    "&:hover": { color: "#378C92" },
                  }}
                >
                  {item.label}
                </Typography>
              ))}
            </Box>

            {/* ✅ Explore Sections */}
            <Box sx={{ minWidth: "100px" }}>
              <Typography
                sx={{
                  fontFamily: "sans-serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  mb: 2.5,
                  color: "#fff",
                }}
              >
                Explore Sections
              </Typography>
              {[
                { label: "How It Works", id: "how-it-works" },
                { label: "Explore Listings", id: "explore-listings" },
                { label: "Pricing", id: "pricing" },
                { label: "AI Tools", id: "ai-tools" },
                { label: "FAQ", id: "faq" },
              ].map((section, i) => (
                <Typography
                  key={i}
                  sx={{
                    lineHeight: "2rem",
                    color: "rgba(255,255,255,0.9)",
                    fontFamily: "system-ui",
                    fontWeight: 400,
                    fontSize: "16px",
                    cursor: "pointer",
                    "&:hover": { color: "#378C92" },
                  }}
                  onClick={() => navigate(`/#${section.id}`)}
                >
                  {section.label}
                </Typography>
              ))}
            </Box>

            {/* Get in Touch */}
            <Box sx={{ minWidth: "100px" }}>
              <Typography
                sx={{
                  fontFamily: "sans-serif",
                  fontSize: "22px",
                  fontWeight: 700,
                  mb: 2.5,
                  color: "#fff",
                }}
              >
                Get in touch with us
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <MailIcon sx={{ color: "#378C92", mr: 1 }} />
                <Typography
                  component="a"
                  href={`mailto:${email}`}
                  sx={{
                    color: "#fff",
                    fontSize: "16px",
                    textDecoration: "none",
                    "&:hover": { color: "#378C92" },
                  }}
                >
                  {email}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
                <CallIcon sx={{ color: "#378C92", mr: 1 }} />
                <Typography
                  component="a"
                  href={`tel:${phone}`}
                  sx={{
                    color: "#fff",
                    fontSize: "16px",
                    textDecoration: "none",
                    "&:hover": { color: "#378C92" },
                  }}
                >
                  {phone}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                <LocationOnIcon sx={{ color: "#378C92", mr: 1, mt: "2px" }} />
                <Typography
                  sx={{
                    color: "#fff",
                    fontSize: "16px",
                    maxWidth: "230px",
                    lineHeight: "24px",
                  }}
                >
                  {OfficeLocation}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* === BOTTOM COPYRIGHT === */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            mt: 3,
            gap: "1rem",
          }}
        >
          <Typography
            variant="subtitle2"
            sx={(t) => ({
              color: (t.palette.text as any).gray,
              fontFamily: "system-ui",
              fontWeight: 400,
              textAlign: "center",
            })}
          >
            Copyright © 2024 Techietribe. All Rights Reserved.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {forumSupport.map((data, index) => (
              <Typography
                variant="subtitle2"
                key={index}
                onClick={() => handleFooterLinkClick(data)}
                sx={(t) => ({
                  color: (t.palette.text as any).gray,
                  fontFamily: "system-ui",
                  fontWeight: 500,
                  cursor: "pointer",
                  "&:hover": { color: "#378C92" },
                })}
              >
                {data.name}
              </Typography>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

// ✅ Snackbar Wrapper
const EnhancedNewsletterForm = () => (
  <SnackbarProvider
    maxSnack={3}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    autoHideDuration={3000}
  >
    <Footer />
  </SnackbarProvider>
);

export default EnhancedNewsletterForm;
