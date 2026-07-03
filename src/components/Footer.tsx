import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Collapse,
  Container,
  Typography,
  Button,
  IconButton,
  TextField,
  useTheme,
} from "@mui/material";
import { SnackbarProvider, useSnackbar } from "notistack";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MailIcon from "@mui/icons-material/Mail";
import CallIcon from "@mui/icons-material/Call";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import YouTubeIcon from "@mui/icons-material/YouTube";
import PinterestIcon from "@mui/icons-material/Pinterest";
import CompanyContactData from "./Data/CompanyContactInfo";
import header from "/assets/images/header/WhiteLogo.png";
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
  const [showRotating, setShowRotating] = useState(false);
  const [activeFooterColumn, setActiveFooterColumn] = useState("");
  const [mobileFooterOpen, setMobileFooterOpen] = useState<
    Record<string, boolean>
  >({
    quickLinks: false,
    explore: false,
  });
  const location = useLocation();
  const isDashboardRoute = location.pathname.startsWith("/dashboard");

  // Reveal the rotating CTA once the browser is idle (matches header/footer perf pattern)
  useEffect(() => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(() => setShowRotating(true), {
        timeout: 1200,
      });
      return () => window.cancelIdleCallback(idleId);
    }
    const timeoutId = window.setTimeout(() => setShowRotating(true), 600);
    return () => window.clearTimeout(timeoutId);
  }, []);

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
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      window.location.href = `/#${id}`;
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 800);
    }
  };

  // ✅ Social Links
  const socialLinks = [
    {
      label: "Facebook",
      icon: FacebookIcon,
      href: "https://www.facebook.com/thetechietribe.official",
    },
    {
      label: "Instagram",
      icon: InstagramIcon,
      href: "https://www.instagram.com/thetechietribe_/",
    },
    {
      label: "LinkedIn",
      icon: LinkedInIcon,
      href: "https://www.linkedin.com/company/techietribe",
    },
    // {
    //   icon: YouTubeIcon,
    //   href: "https://www.youtube.com/@thetechietribe.official",
    // },
    {
      label: "Pinterest",
      icon: PinterestIcon,
      href: "https://www.pinterest.com/thetechietribe_/",
    },
  ];

  const quickFooterLinks = [
    { label: "Home", to: "/" },
    { label: "About us", to: "/about-us" },
    { label: "Listing", to: "/listings" },
    { label: "Blog", to: "/blog" },
    { label: "Contact us", to: "/contact" },
  ];

  const exploreSections = [
    { label: "Best in Your City", id: "StyledHeader" },
    { label: "listing", id: "listing" },
    { label: "How it Works", id: "process-info" },
    { label: "Featured Listings", id: "featured-listing" },
    { label: "Category", id: "category-slider" },
    { label: "Worldwide Clients", id: "coverflow-showcase" },
  ];

  // Column heading with animated underline (revealed while its links are hovered)
  const columnHeadingSx = (key: string) => ({
    my: "0.5rem",
    fontFamily: "sans-serif",
    fontSize: "22px",
    fontWeight: 700,
    color: "#fff",
    position: "relative",
    display: "inline-block",
    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      bottom: -4,
      width: "100%",
      height: "3px",
      backgroundColor: "#378C92",
      transform: activeFooterColumn === key ? "scaleX(1)" : "scaleX(0)",
      transformOrigin: "left center",
      transition: "transform 240ms ease",
    },
  });

  const footerLinkSx = {
    display: "block",
    lineHeight: "2rem",
    color: "rgba(255,255,255,0.9)",
    fontFamily: "system-ui",
    fontWeight: 400,
    fontSize: "16px",
    textDecoration: "none",
    cursor: "pointer",
    background: "none",
    border: 0,
    p: 0,
    textAlign: "left" as const,
    "&:hover": { color: "#378C92" },
  };

  const toggleMobileFooterSection = (section: string) => {
    setMobileFooterOpen((current) => ({
      ...current,
      [section]: !current[section],
    }));
  };

  const mobileFooterSections = [
    {
      key: "quickLinks",
      title: "Quick Links",
      links: quickFooterLinks.map((item) => ({
        label: item.label,
        onClick: () => navigate(item.to),
      })),
    },
    {
      key: "explore",
      title: "Explore Sections",
      links: exploreSections.map((section) => ({
        label: section.label,
        onClick: () => handleSmoothScroll(section.id),
      })),
    },
  ];

  const renderMobileFooterLinkSection = ({
    key,
    title,
    links,
  }: (typeof mobileFooterSections)[number]) => {
    const isOpen = mobileFooterOpen[key];

    return (
      <Box
        key={key}
        sx={{
          borderBottom: "1px solid rgba(128,128,128,0.28)",
          width: "100%",
        }}
      >
        <Box
          component="button"
          type="button"
          onClick={() => toggleMobileFooterSection(key)}
          aria-expanded={isOpen}
          sx={{
            width: "100%",
            border: 0,
            background: "transparent",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            py: 2.1,
            px: 0,
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "sans-serif",
          }}
        >
          <Typography
            component="span"
            sx={{
              fontFamily: "sans-serif",
              fontSize: "22px",
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          <IconButton
            component="span"
            aria-hidden="true"
            tabIndex={-1}
            sx={{
              color: "#378C92",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 220ms ease",
              p: 0.5,
            }}
          >
            <KeyboardArrowDownIcon />
          </IconButton>
        </Box>

        <Collapse in={isOpen} timeout={220}>
          <Box sx={{ pb: 2 }}>
            {links.map((item, index) => (
              <Typography
                variant="subtitle2"
                component="p"
                key={`${key}-${index}`}
                onClick={item.onClick}
                sx={footerLinkSx}
              >
                {item.label}
              </Typography>
            ))}
          </Box>
        </Collapse>
      </Box>
    );
  };

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
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 320px" },
            alignItems: "center",
            gap: { xs: 3, md: 4 },
            pb: { xs: 4, md: 0 },
            borderBottom: "1px solid #80808078",
            minHeight: { xs: 0, md: 190 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Typography
              variant="h4"
              component="h2"
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
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                gap: { xs: 1.5, sm: 0 },
                p: "5px",
                borderRadius: "30px",
                border: "1px solid #3c3c3c",
                backgroundColor: "transparent",
                width: "100%",
                maxWidth: { sm: "80%", md: "510px" },
                minHeight: 54,
                "&:hover": { borderColor: "#666" },
              }}
            >
              <TextField
                variant="outlined"
                placeholder="name@example.com"
                size="small"
                value={formemail}
                onChange={handleChange}
                InputProps={{
                  style: {
                    padding: "0 15px",
                    color: "#fff",
                    fontFamily: "inherit",
                    fontSize: "15px",
                    height: "44px",
                    backgroundColor: "transparent",
                  },
                }}
                sx={{
                  flex: 1,
                  minWidth: 0,
                  width: { xs: "100%", sm: "auto" },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              />
              <Button
                type="submit"
                sx={{
                  backgroundColor: "#fff",
                  color: "#000",
                  fontWeight: 500,
                  fontSize: "15px",
                  textTransform: "none",
                  fontFamily: "inherit",
                  height: "44px",
                  borderRadius: "30px",
                  px: { xs: 3, sm: "20px" },
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": { backgroundColor: "#fff" },
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

          {/* Reserved space so the rotating CTA doesn't shift layout when it reveals */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "flex-end",
              position: "relative",
              width: "100%",
              height: 170,
            }}
          >
            <Box
              sx={{
                width: 120,
                height: 120,
                position: "absolute",
                right: 0,
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <RotatingButton
                linkTo="/contact"
                size="md"
                textColor="white"
                sx={{ opacity: showRotating ? 1 : 0 }}
              />
            </Box>
          </Box>
        </Box>

        {/* === MIDDLE SECTION (Links and Contact Info) === */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: { xs: "center", sm: "space-between" },
            mt: 3,
            gap: { xs: 4, sm: 2, md: 0 },
            borderBottom: "1px solid #80808078",
            pb: 3,
          }}
        >
          {/* Company Info - Logo */}
          <Box
            sx={{
              width: { xs: "100%", sm: "48%", md: "36%" },
              pr: { xs: 0, md: 6 },
            }}
          >
            <Box
              sx={{ display: "flex", flexDirection: "column", width: "100%" }}
            >
              <img
                src={header}
                alt="Techietribe"
                width={220}
                height={43}
                style={{ display: "block" }}
              />
              <Typography
                sx={{
                  mt: "1.7rem",
                  fontFamily: "system-ui",
                  fontSize: { xs: "16px", md: "17px" },
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                Connecting businesses to endless opportunities. We list, link,
                and elevate trusted brands.
              </Typography>
            </Box>

            {/* ✅ Social Icons pill bar */}
            <Box
              sx={{
                mt: 4,
                display: "flex",
                justifyContent: "space-between",
                width: "100%",
                border: "1px solid rgba(255,255,255,0.12)",
                backgroundColor: "rgba(255,255,255,0.02)",
                padding: "10px 30px",
                borderRadius: "50px",
                mb: { xs: "30px", lg: 0 },
              }}
            >
              {socialLinks.map(({ label, icon: Icon, href }) => (
                <Box
                  key={label}
                  component="a"
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Techietribe on ${label}`}
                  title={`Techietribe on ${label}`}
                  sx={{
                    color: "#378C92",
                    display: "inline-flex",
                    alignItems: "center",
                    textDecoration: "none",
                    "&:hover": { color: "#56b0b3" },
                  }}
                >
                  <Icon aria-hidden="true" sx={{ fontSize: 25 }} />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Mobile accordion sections */}
          <Box
            sx={{
              display: { xs: "block", md: "none" },
              width: "100%",
            }}
          >
            {mobileFooterSections.map(renderMobileFooterLinkSection)}
          </Box>

          {/* Quick Links (desktop) */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: { md: "14%" },
            }}
            onMouseLeave={() => setActiveFooterColumn("")}
          >
            <Typography sx={columnHeadingSx("quickLinks")}>
              Quick Links
            </Typography>
            {quickFooterLinks.map((item) => (
              <Typography
                key={item.to}
                component={Link}
                to={item.to}
                onMouseEnter={() => setActiveFooterColumn("quickLinks")}
                sx={footerLinkSx}
              >
                {item.label}
              </Typography>
            ))}
          </Box>

          {/* ✅ Explore Sections (desktop) */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: { md: "16%" },
            }}
            onMouseLeave={() => setActiveFooterColumn("")}
          >
            <Typography sx={columnHeadingSx("explore")}>
              Explore Sections
            </Typography>
            {exploreSections.map((section, i) => (
              <Typography
                key={i}
                component="p"
                onClick={() => handleSmoothScroll(section.id)}
                onMouseEnter={() => setActiveFooterColumn("explore")}
                sx={footerLinkSx}
              >
                {section.label}
              </Typography>
            ))}
          </Box>

          {/* Get in Touch */}
          <Box
            sx={{ width: { xs: "100%", sm: "48%", md: "24%" } }}
            onMouseLeave={() => setActiveFooterColumn("")}
          >
            <Typography sx={columnHeadingSx("contact")}>
              Get in touch with us
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Box
                component="a"
                href={`mailto:${email}`}
                onMouseEnter={() => setActiveFooterColumn("contact")}
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: "system-ui",
                  fontSize: "16px",
                  fontWeight: 400,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  mb: "10px",
                  "&:hover": {
                    color: "#378C92",
                    svg: { color: "#378C92" },
                  },
                }}
              >
                <MailIcon
                  sx={{ fontSize: "18px", mr: "6px", color: "#378C92" }}
                />
                {email}
              </Box>

              <Box
                component="a"
                href={`tel:${phone}`}
                onMouseEnter={() => setActiveFooterColumn("contact")}
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: "system-ui",
                  fontSize: "16px",
                  fontWeight: 400,
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  mb: "10px",
                  "&:hover": {
                    color: "#378C92",
                    svg: { color: "#378C92" },
                  },
                }}
              >
                <CallIcon
                  sx={{ fontSize: "18px", mr: "6px", color: "#378C92" }}
                />
                {phone}
              </Box>

              <Box
                onMouseEnter={() => setActiveFooterColumn("contact")}
                sx={{
                  color: "rgba(255,255,255,0.9)",
                  fontFamily: "system-ui",
                  fontSize: "16px",
                  fontWeight: 400,
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  mb: "10px",
                }}
              >
                <LocationOnIcon
                  sx={{
                    fontSize: "18px",
                    mr: "6px",
                    mt: "2px",
                    color: "#378C92",
                  }}
                />
                <Typography
                  sx={{
                    color: "inherit",
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
            mb: "1rem",
            gap: "1rem",
          }}
        >
          <Typography
            variant="subtitle2"
            component="p"
            sx={{
              color: "#8B9099",
              fontFamily: "system-ui",
              fontWeight: 400,
              textAlign: "center",
            }}
          >
            Copyright © {new Date().getFullYear()} Techietribe. All Rights
            Reserved.
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
            {forumSupport.map((data, index) => (
              <Typography
                variant="subtitle2"
                component={data.path.startsWith("/") ? Link : "button"}
                key={index}
                {...(data.path.startsWith("/")
                  ? { to: data.path }
                  : { type: "button" })}
                onClick={() => handleFooterLinkClick(data)}
                sx={{
                  color: "#8B9099",
                  fontFamily: "system-ui",
                  fontWeight: 500,
                  cursor: "pointer",
                  background: "none",
                  border: 0,
                  p: 0,
                  textDecoration: "none",
                  "&:hover": { color: "#378C92" },
                }}
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

// import React, { useState } from "react";
// import {
//   Box,
//   Container,
//   Grid,
//   Typography,
//   Button,
//   Stack,
//   InputBase,
//   useTheme,
//   alpha,
// } from "@mui/material";
// import MailOutlineIcon from "@mui/icons-material/MailOutline";
// import CallIcon from "@mui/icons-material/Call";
// import LocationOnIcon from "@mui/icons-material/LocationOn";
// import { Link } from "react-router-dom";
// import { SnackbarProvider, useSnackbar } from "notistack";
// import image from "../assets/images/navbar/listifyLogoContrast.png";
// // import footerBg from "../assets/images/footerbg.png";

// const FooterContent: React.FC = () => {
//   const theme = useTheme();
//   const { enqueueSnackbar, closeSnackbar } = useSnackbar();

//   const [formEmail, setFormEmail] = useState("");
//   const [error, setError] = useState("");

//   const validateEmail = (email: string) =>
//     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.toLowerCase());

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     if (!formEmail) {
//       setError("Email is required");
//       return;
//     }
//     if (!validateEmail(formEmail)) {
//       setError("Please enter a valid email address");
//       return;
//     }

//     enqueueSnackbar("Subscribed successfully!", {
//       variant: "success",
//       autoHideDuration: 3000,
//       action: (key) => (
//         <Button color="inherit" size="small" onClick={() => closeSnackbar(key)}>
//           Close
//         </Button>
//       ),
//     });

//     setFormEmail("");
//     setError("");
//   };

//   return (
//     <Box
//       component="footer"
//       sx={{
//         width: "100%",
//         overflowX: "hidden",
//         position: "relative",
//         bgcolor: theme.palette.darkcard.main,
//         // backgroundImage: `url(${footerBg})`,
//         backgroundImage: "url('https://static.vecteezy.com/system/resources/thumbnails/052/614/554/small/abstract-blue-header-footer-transparent-curve-business-background-design-illustration-template-vector.jpg')",
//         backgroundRepeat: "no-repeat",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//       }}
//     >
//       {/* Newsletter Section */}
//       <Box
//         sx={{
//           display: "flex",
//           width: "100%",
//           height: 140,
//           borderBottom: `2px solid ${(theme.palette.primary as any).hero}`,
//         }}
//       >
//         {/* Left Box */}
//         <Box
//           sx={{
//             flex: 1,
//             bgcolor: alpha(theme.palette.darkcard.contrastText, 0.9),
//             color: "secondary.contrastText",
//             display: "flex",
//             flexDirection: "column",
//             justifyContent: "center",
//             alignItems: "flex-end",
//             pr: 6,
//           }}
//         >
//           <Typography
//             variant="overline"
//             sx={{
//               letterSpacing: 3,
//               opacity: 0.9,
//               mr: 9,
//               color: "primary.focus",
//             }}
//           >
//             Subscribe to our
//           </Typography>
//           <Typography
//             variant="h4"
//             fontWeight={600}
//             letterSpacing={2}
//             pr={2}
//             fontFamily={"'Google Sans Code', monospace"}
//           >
//             NEWSLETTER
//           </Typography>
//         </Box>

//         {/* Right Box */}
//         <Box
//           sx={{
//             flex: 2,
//             bgcolor: alpha((theme.palette as any).cardshadow.main, 0.9),
//             display: "flex",
//             alignItems: "center",
//             pl: 6,
//           }}
//         >
//           <Box
//             component="form"
//             onSubmit={handleSubmit}
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               width: "100%",
//               maxWidth: "700px",
//             }}
//           >
//             <Box
//               sx={{
//                 display: "flex",
//                 width: "100%",
//                 bgcolor: "background.paper",
//                 borderRadius: 50,
//                 overflow: "hidden",
//                 height: 62,
//               }}
//             >
//               <InputBase
//                 placeholder="Enter email address"
//                 value={formEmail}
//                 onChange={(e) => setFormEmail(e.target.value)}
//                 sx={{
//                   flex: 1,
//                   px: 4,
//                   fontSize: "1.75rem",
//                   color: "text.primary",
//                   fontFamily: "'Google Sans Code', monospace",
//                   "&::placeholder": {
//                     color: "text.secondary",
//                     fontWeight: 500,
//                   },
//                 }}
//               />
//               <Button
//                 type="submit"
//                 variant="contained"
//                 sx={{
//                   borderRadius: 50,
//                   px: 5,
//                   height: "100%",
//                   bgcolor: "primary.focus",
//                   color: "secondary.contrastText",
//                   fontWeight: 600,
//                   letterSpacing: 2,
//                   border: `2px solid white`,
//                   "&:hover": {
//                     bgcolor: "primary.hero",
//                   },
//                 }}
//               >
//                 Submit
//               </Button>
//             </Box>
//             {error && (
//               <Typography
//                 color="error"
//                 variant="body2"
//                 sx={{ mt: 1, fontSize: "12px" }}
//               >
//                 {error}
//               </Typography>
//             )}
//           </Box>
//         </Box>
//       </Box>

//       {/* Main Footer */}
//       <Box
//         sx={{
//           width: "100%",
//           color: "secondary.contrastText",
//           pt: 6,
//           pb: 10,
//           px: { xs: 4, md: 32 },
//           bgcolor: alpha(theme.palette.darkcard.main, 0.9),
//         }}
//       >
//         <Container maxWidth="lg">
//           <Grid container spacing={0} justifyContent={"space-between"}>
//             {/* Left Column */}
//             <Grid
//               item
//               xs={12}
//               md={6}
//               minWidth={"50%"}
//               component="div"
//               {...({} as any)}
//             >
//               <Box
//                 sx={{
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: { xs: "center", md: "flex-start" },
//                   textAlign: { xs: "center", md: "left" },
//                 }}
//               >
//                 <Box
//                   component="img"
//                   src={image}
//                   alt="Logo"
//                   sx={{ width: 250, mb: 2 }}
//                 />
//                 <Typography
//                   variant="body1"
//                   sx={{
//                     opacity: 0.9,
//                     maxWidth: 380,
//                     lineHeight: 1.6,
//                     letterSpacing: 1,
//                   }}
//                 >
//                   Get Started to Unearth the finest local business listings
//                   available in your city. The journey toward incredible
//                   experiences begins now.
//                 </Typography>
//               </Box>
//             </Grid>

//             {/* Right Column */}
//             <Grid
//               item
//               xs={12}
//               md={6}
//               minWidth={"50%"}
//               component="div"
//               {...({} as any)}
//             >
//               <Grid container>
//                 {/* Quick Links */}
//                 <Grid
//                   item
//                   xs={12}
//                   sm={6}
//                   minWidth={"50%"}
//                   component="div"
//                   {...({} as any)}
//                 >
//                   <Typography
//                     variant="h5"
//                     fontWeight={500}
//                     mb={2}
//                     letterSpacing={2}
//                     gutterBottom
//                     sx={{
//                       position: "relative",
//                       display: "inline-block",
//                       "&::after": {
//                         content: '""',
//                         position: "absolute",
//                         left: 0,
//                         bottom: -4,
//                         height: 3,
//                         width: "15%",
//                         bgcolor: "primary.focus",
//                         transition: "width 0.3s ease",
//                       },
//                       "&:hover::after": {
//                         width: "100%",
//                       },
//                     }}
//                   >
//                     Quick Links
//                   </Typography>
//                   <Box component="ul" sx={{ listStyle: "disc", pl: 3, m: 0 }}>
//                     {[
//                       { label: "Home", path: "/" },
//                       { label: "About", path: "/about" },
//                       { label: "Blog", path: "/blog" },
//                       { label: "Listings", path: "/listings" },
//                       { label: "Contact", path: "/contact" },
//                     ].map((link) => (
//                       <Box
//                         key={link.label}
//                         component="li"
//                         sx={{
//                           mb: 0.5,
//                           transition: "all 0.3s ease",
//                           "&::marker": { fontSize: "1.5rem" },
//                           "&:hover": {
//                             "&::marker": { color: "primary.focus" },
//                             opacity: 1,
//                             color: "primary.focus",
//                             transform: "translateX(4px)",
//                           },
//                         }}
//                       >
//                         <Typography
//                           component={Link}
//                           to={link.path}
//                           variant="body1"
//                           sx={{
//                             textDecoration: "none",
//                             color: "inherit",
//                             opacity: 0.7,
//                             letterSpacing: 1.5,
//                           }}
//                         >
//                           {link.label}
//                         </Typography>
//                       </Box>
//                     ))}
//                   </Box>
//                 </Grid>

//                 {/* Contact Us */}
//                 <Grid
//                   item
//                   xs={12}
//                   sm={6}
//                   minWidth={"50%"}
//                   component="div"
//                   {...({} as any)}
//                 >
//                   <Typography
//                     variant="h5"
//                     fontWeight={500}
//                     mb={3}
//                     letterSpacing={2}
//                     gutterBottom
//                     sx={{
//                       position: "relative",
//                       display: "inline-block",
//                       "&::after": {
//                         content: '""',
//                         position: "absolute",
//                         left: 0,
//                         bottom: -4,
//                         height: 3,
//                         width: "15%",
//                         bgcolor: "primary.focus",
//                         transition: "width 0.3s ease",
//                       },
//                       "&:hover::after": {
//                         width: "100%",
//                       },
//                     }}
//                   >
//                     Contact Us
//                   </Typography>
//                   <Stack spacing={2}>
//                     <Stack direction="row" spacing={1} alignItems="center">
//                       <CallIcon fontSize="medium" />
//                       <Typography variant="body1" letterSpacing={1}>
//                         +1 (234) 567-890
//                       </Typography>
//                     </Stack>
//                     <Stack direction="row" spacing={1} alignItems="center">
//                       <MailOutlineIcon fontSize="medium" />
//                       <Typography variant="body1" letterSpacing={1}>
//                         support@example.com
//                       </Typography>
//                     </Stack>
//                     <Stack direction="row" spacing={1} alignItems="center">
//                       <LocationOnIcon fontSize="medium" />
//                       <Typography variant="body1" letterSpacing={1}>
//                         123 Business St, City
//                       </Typography>
//                     </Stack>
//                   </Stack>
//                 </Grid>
//               </Grid>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>

//       {/* Bottom Bar */}
//       <Box
//         sx={{
//           py: 1,
//           borderTop: `2px solid ${(theme.palette.primary as any).hero}`,
//           textAlign: "center",
//           bgcolor: alpha(theme.palette.darkcard.contrastText, 0.9),
//         }}
//       >
//         <Typography
//           variant="caption"
//           sx={{ color: "secondary.contrastText", opacity: 0.6 }}
//         >
//           © {new Date().getFullYear()} Your Company Name. All rights reserved.
//         </Typography>
//       </Box>
//     </Box>
//   );
// };

// const Footer: React.FC = () => (
//   <SnackbarProvider
//     maxSnack={3}
//     anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//     autoHideDuration={3000}
//   >
//     <FooterContent />
//   </SnackbarProvider>
// );

// export default Footer;
