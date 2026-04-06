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
        <Box
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
                    color: "#378C92",
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
                { label: "Best in Your City", id: "StyledHeader" },
                { label: "listing", id: "listing" },
                { label: "How it Works", id: "process-info" },
                { label: "Featured Listings", id: "featured-listing" },
                { label: "Category", id: "category-slider" },
                { label: "Worldwide Clients", id: "coverflow-showcase" },
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
                  onClick={() => handleSmoothScroll(section.id)}
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
