// import React, { useContext } from "react";
// import ContactUs from "../components/CompanyDetails/ContactUs";
// import { Link as ScrollLink, Element } from "react-scroll";
// import CompanyTopbar from "../components/CompanyDetails/CompanyTopbar";
// import {
//   AppBar,
//   Box,
//   IconButton,
//   Stack,
//   Toolbar,
//   Typography,
//   Button,
//   CircularProgress,
//   Grid,
//   useTheme,
// } from "@mui/material";
// import { Drawer, List } from "@mui/material";
// import ReplayIcon from "@mui/icons-material/Replay";
// import { Link, useParams } from "react-router-dom";
// import Header from "../components/CompanyDetails/Header";
// import CompanyContactCrd from "../components/CompanyDetails/CompanyContactCrd";
// import CompanyAboutUs from "../components/CompanyDetails/CompanyAboutUs";
// import CompanyCopyRight from "../components/CompanyDetails/CompanyCopyRight";
// import CompanyServices from "../components/CompanyDetails/CompanyServices";
// import CompanyLatestProject from "../components/CompanyDetails/CompanyLatestProject";
// import MenuIcon from "@mui/icons-material/Menu";
// import CompanyAboutService from "../components/CompanyDetails/CompanyAboutService";
// import "animate.css/animate.min.css";
// import CompanyBanText from "../components/CompanyDetails/CompanyBanText";
// import CompanyCount from "../components/CompanyDetails/CompanyCount";
// import useFormattedPhoneNo from "../hooks/useFormattedPhoneNo";
// import { useAuth } from "../context/AuthContext";
// import { useListings } from "../context/ListingsContext";

// /* ---------------- Navbar ---------------- */
// function Navbar({ logo, number }: { logo: any; number: string }) {
//   const [drawerOpen, setDrawerOpen] = React.useState(false);
//   const [scrolled, setScrolled] = React.useState(false);
//   const theme = useTheme();

//   const handleDrawerToggle = () => {
//     setDrawerOpen(!drawerOpen);
//   };

//   React.useEffect(() => {
//     if (window.innerWidth < 900) {
//       setScrolled(true);
//     }

//     const handleScroll = () => {
//       if (window.scrollY > 50) {
//         setScrolled(true);
//       } else if (window.innerWidth > 900) {
//         setScrolled(false);
//       }
//     };

//     window.addEventListener("scroll", handleScroll);
//     return () => {
//       window.removeEventListener("scroll", handleScroll);
//     };
//   }, []);

//   const drawer = (
//     <Box
//       sx={{
//         background: "#11161f",
//         color: "white",
//         paddingTop: "15px",
//         paddingBottom: "15px",
//         pl: "20px",
//         display: "block",
//         boxShadow: "none",
//       }}
//     >
//       <List>
//         {["Home", "About Us", "Services", "Latest Projects", "Contact Us"].map(
//           (text) => (
//             <Box onClick={() => scrollToElement(
//               key={text}
//               to={text.toLowerCase().replace(" ", "-")}
//               smooth={true}
//               duration={500}
//               offset={-80}
//               onClick={handleDrawerToggle}
//             >
//               <Typography
//                 sx={{
//                   marginLeft: "15px",
//                   paddingLeft: "15px",
//                   cursor: "pointer",
//                   color: "white",
//                   display: "block",
//                   width: "80%",
//                   pt: "10px",
//                   pb: "4px",
//                   borderBottom: "1px solid white",
//                 }}
//               >
//                 {text}
//               </Typography>
//             </Box>
//           )
//         )}
//       </List>
//     </Box>
//   );

//   return (
//     <>
//       <AppBar
//         sx={{
//           background: scrolled ? (theme.palette.primary as any).hover : "transparent",
//           color: "white",
//           zIndex: 4,
//           pb: 0.6,
//           transition: "0.32s ease-in-out",
//           boxShadow: "none",
//         }}
//         position="sticky"
//       >
//         <Toolbar>
//           {/* Mobile Nav */}
//           <Stack
//             direction="row"
//             display={{ xs: "flex", md: "none" }}
//             justifyContent="space-between"
//             alignItems="center"
//             width="100%"
//           >
//             <IconButton
//               color="inherit"
//               aria-label="open drawer"
//               edge="start"
//               onClick={handleDrawerToggle}
//             >
//               <MenuIcon />
//             </IconButton>

//             {logo && (
//               <IconButton size="large">
//                 <img src={logo} alt="" style={{ width: "70px" }} />
//               </IconButton>
//             )}
//           </Stack>

//           {/* Desktop Nav */}
//           <Stack
//             direction="row"
//             display={{ xs: "none", md: "flex" }}
//             alignItems="center"
//             justifyContent="space-between"
//             width="100%"
//           >
//             {logo && (
//               <IconButton size="large">
//                 <img
//                   src={logo}
//                   alt=""
//                   style={{ width: "100%", height: "71px" }}
//                 />
//               </IconButton>
//             )}

//             <Stack
//               direction="row"
//               spacing={1}
//               alignItems="center"
//               marginLeft="5%"
//             >
//               {["Home", "About Us", "Services", "Projects"].map((text) => (
//                 <Box onClick={() => scrollToElement(
//                   key={text}
//                   to={text.toLowerCase().replace(" ", "-")}
//                   smooth={true}
//                   duration={500}
//                   offset={text === "Projects" ? -90 : -80}
//                 >
//                   <Typography
//                     sx={{
//                       margin: "0 15px",
//                       cursor: "pointer",
//                       color: "white",
//                       display: "inline-block",
//                       "&:hover": {
//                         color: (theme.palette.primary as any).focus,
//                       },
//                     }}
//                   >
//                     {text}
//                   </Typography>
//                 </Box>
//               ))}

//               <Box onClick={() => scrollToElement(
//                 to={"contact-us"}
//                 smooth={true}
//                 duration={500}
//                 offset={-100}
//               >
//                 <Button
//                   sx={{
//                     background: scrolled
//                       ? (theme.palette.primary as any).focus
//                       : "white",
//                     color: scrolled
//                       ? theme.palette.common.white
//                       : (theme.palette.primary as any).focus,
//                     height: "42px",
//                     minWidth: "150px",
//                     px: 6,
//                     borderRadius: 20,
//                     "&:hover": {
//                       background: (theme.palette.primary as any).focus,
//                       color: "white",
//                       opacity: 0.9,
//                     },
//                   }}
//                   LinkComponent={Link}
//                 >
//                   Lets Connect
//                 </Button>
//               </Box>
//               {number && (
//                 <Typography sx={{ ml: 3, fontSize: "14px" }}>
//                   Call: {number}
//                 </Typography>
//               )}
//             </Stack>
//           </Stack>
//         </Toolbar>
//       </AppBar>
//       <Drawer
//         anchor="top"
//         open={drawerOpen}
//         onClose={handleDrawerToggle}
//         sx={{
//           "& .MuiDrawer-paper": {
//             boxSizing: "border-box",
//             width: "100%",
//             background: "rgba(0, 0, 0, 0.7)",
//           },
//         }}
//       >
//         {drawer}
//       </Drawer>
//     </>
//   );
// }

// /* ---------------- Main Page ---------------- */
// const ListingCompanyDetails = () => {
//   const auth = useAuth();
//   const { slug } = useParams();
//   const { listings, loading, error } = useListings();

//   const listing = listings.find((item) => item.slug === slug);
//   const formattedNumber = useFormattedPhoneNo(listing?.phone);

//   if (loading) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//         }}
//       >
//         <CircularProgress />
//       </Box>
//     );
//   }

//   if (!listing) {
//     return (
//       <Box
//         sx={{
//           display: "flex",
//           flexDirection: "column",
//           justifyContent: "center",
//           alignItems: "center",
//           height: "100vh",
//         }}
//       >
//         <Typography fontSize={"16px"} color="error" gutterBottom>
//           No Listing Found
//         </Typography>
//         <IconButton aria-label="reload" size="medium">
//           <ReplayIcon fontSize="inherit" />
//         </IconButton>
//       </Box>
//     );
//   }

//   return (
//     <Grid>
//       <CompanyTopbar
//         formattedNumber={formattedNumber}
//         phone={listing.phone}
//         website={listing.website}
//       />
//       <Navbar logo={listing.businessLogo} number={formattedNumber} />

//       <div name="home">
//         <Header
//           BgHead={listing?.businessBanner}
//           title={listing.title}
//           intro={listing.intro}
//         />
//       </div>

//       <div name="about-us">
//         <CompanyAboutUs
//           banner={listing.image}
//           title={listing.title}
//           intro={listing.desc}
//           aboutUs={listing.aboutUs}
//         />
//       </div>

//       <div name="ban-text">
//         <CompanyBanText
//           banner={listing.image3}
//           category={listing.category}
//           formattedNumber={formattedNumber}
//           phone={listing.phone}
//         />
//       </div>

//       <div name="services">
//         <CompanyCount
//           banner={listing.image1}
//           title={listing.title}
//           desc={listing.desc}
//           whyUs={listing.whyUs}
//         />
//       </div>

//       <div name="services" style={{ paddingTop: "16px" }}>
//         <CompanyServices
//           background={listing.image4}
//           service={listing.accountingAndTaxService}
//           phone={listing.phone}
//         />
//       </div>

//       <div name="projects" style={{ padding: "100px 0 55px 0" }}>
//         <CompanyLatestProject
//           img={listing.image}
//           img1={listing.image1}
//           img2={listing.image2}
//           img3={listing.image3}
//           img4={listing.image4}
//           imgB={listing.businessBanner}
//           latestProjectIntro={listing.latestProjectIntro}
//         />
//       </div>

//       <div name="mission">
//         <CompanyAboutService
//           background={listing.image2}
//           banner={listing.image1}
//           ourMission={listing.ourMission}
//         />
//       </div>

//       <div name="contact-us">
//         <ContactUs
//           mapUrl={listing.mapUrl}
//           category={listing.category}
//           address={listing.address}
//           website={listing.website}
//           formattedNumber={formattedNumber}
//           phone={listing.phone}
//           contactUsIntro={listing.contactUsIntro}
//         />
//       </div>

//       <div name="contact">
//         <CompanyContactCrd
//           address={listing.address}
//           website={listing.website}
//           formattedNumber={formattedNumber}
//           phone={listing.phone}
//           title={listing.title}
//           logo={listing.businessLogo}
//           intro={listing.intro}
//         />
//       </div>

//       <CompanyCopyRight />
//     </Grid>
//   );
// };

// export default ListingCompanyDetails;

import React, { useContext } from "react";
import ContactUs from "../../components/CompanyDetails/ContactUs";
import CompanyTopbar from "../../components/CompanyDetails/CompanyTopbar";
import {
  AppBar,
  Box,
  IconButton,
  Stack,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Grid,
  useTheme,
} from "@mui/material";
import { Drawer, List } from "@mui/material";
import ReplayIcon from "@mui/icons-material/Replay";
import { Link, useParams } from "react-router-dom";
import Header from "../../components/CompanyDetails/Header";
import CompanyContactCrd from "../../components/CompanyDetails/CompanyContactCrd";
import CompanyAboutUs from "../../components/CompanyDetails/CompanyAboutUs";
import CompanyCopyRight from "../../components/CompanyDetails/CompanyCopyRight";
import CompanyServices from "../../components/CompanyDetails/CompanyServices";
import CompanyLatestProject from "../../components/CompanyDetails/CompanyLatestProject";
import MenuIcon from "@mui/icons-material/Menu";
import CompanyAboutService from "../../components/CompanyDetails/CompanyAboutService";
import CompanyBanText from "../../components/CompanyDetails/CompanyBanText";
import CompanyCount from "../../components/CompanyDetails/CompanyCount";
import useFormattedPhoneNo from "../../hooks/useFormattedPhoneNo";
import { useAuth } from "../../context/AuthContext";
import { useListings } from "../../context/ListingsContext";

/* ---------------- Scroll Helper ---------------- */
const scrollToElement = (elementId: string, offset: number = -80) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset + offset;
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
};

/* ---------------- Navbar ---------------- */
function Navbar({ logo, number }: { logo: string; number: string }) {
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  React.useEffect(() => {
    if (window.innerWidth < 900) {
      setScrolled(true);
    }

    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else if (window.innerWidth > 900) {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const drawer = (
    <Box
      sx={{
        background: "#11161f",
        color: "white",
        paddingTop: "15px",
        paddingBottom: "15px",
        pl: "20px",
        display: "block",
        boxShadow: "none",
      }}
    >
      <List>
        {["Home", "About Us", "Services", "Latest Projects", "Contact Us"].map(
          (text) => (
            <Typography
              key={text}
              onClick={() => {
                scrollToElement(text.toLowerCase().replace(" ", "-"), -80);
                handleDrawerToggle();
              }}
              sx={{
                marginLeft: "15px",
                paddingLeft: "15px",
                cursor: "pointer",
                color: "white",
                display: "block",
                width: "80%",
                pt: "10px",
                pb: "4px",
                borderBottom: "1px solid white",
              }}
            >
              {text}
            </Typography>
          ),
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        sx={{
          background: scrolled
            ? (theme.palette.primary as any).hover
            : "transparent",
          color: "white",
          zIndex: 4,
          pb: 0.6,
          transition: "0.32s ease-in-out",
          boxShadow: "none",
        }}
        position="sticky"
      >
        <Toolbar>
          {/* Mobile Nav */}
          <Stack
            direction="row"
            display={{ xs: "flex", md: "none" }}
            justifyContent="space-between"
            alignItems="center"
            width="100%"
          >
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
            >
              <MenuIcon />
            </IconButton>

            {logo && (
              <IconButton size="large">
                <img src={logo} alt="logo" style={{ width: "70px" }} />
              </IconButton>
            )}
          </Stack>

          {/* Desktop Nav */}
          <Stack
            direction="row"
            display={{ xs: "none", md: "flex" }}
            alignItems="center"
            justifyContent="space-between"
            width="100%"
          >
            {logo && (
              <IconButton size="large">
                <img
                  src={logo}
                  alt="logo"
                  style={{ width: "100%", height: "71px" }}
                />
              </IconButton>
            )}

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              marginLeft="5%"
            >
              {["Home", "About Us", "Services", "Latest Projects"].map(
                (text) => (
                  <Box
                    key={text}
                    onClick={() =>
                      scrollToElement(
                        text.toLowerCase().replace(" ", "-"),
                        text === "Latest Projects" ? -90 : -80,
                      )
                    }
                  >
                    <Typography
                      sx={{
                        margin: "0 15px",
                        cursor: "pointer",
                        color: "white",
                        display: "inline-block",
                        "&:hover": {
                          color: (theme.palette.primary as any).focus,
                        },
                      }}
                    >
                      {text}
                    </Typography>
                  </Box>
                ),
              )}

              <Box onClick={() => scrollToElement("contact-us", -100)}>
                <Button
                  sx={{
                    background: scrolled
                      ? (theme.palette.primary as any).focus
                      : "white",
                    color: scrolled
                      ? theme.palette.common.white
                      : (theme.palette.primary as any).focus,
                    height: "42px",
                    minWidth: "150px",
                    px: 6,
                    borderRadius: 20,
                    "&:hover": {
                      background: (theme.palette.primary as any).focus,
                      color: "white",
                      opacity: 0.9,
                    },
                  }}
                  LinkComponent={Link}
                >
                  Lets Connect
                </Button>
              </Box>
              {number && (
                <Typography sx={{ ml: 3, fontSize: "14px" }}>
                  Call: {number}
                </Typography>
              )}
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="top"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: "100%",
            background: "rgba(0, 0, 0, 0.7)",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

/* ---------------- Main Page ---------------- */
const ListingCompanyDetails = () => {
  const auth = useAuth();
  const { slug } = useParams();
  const { listings, loading, error } = useListings();

  const listing = listings.find((item) => item.slug === slug);
  const formattedNumber = useFormattedPhoneNo(listing?.phone ?? "");

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!listing) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography fontSize={"16px"} color="error" gutterBottom>
          No Listing Found
        </Typography>
        <IconButton aria-label="reload" size="medium">
          <ReplayIcon fontSize="inherit" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Grid>
      <CompanyTopbar
        formattedNumber={formattedNumber}
        phone={listing.phone ?? ""}
        website={listing.website ?? ""}
      />
      <Navbar
        logo={listing.businessLogo ?? "/default-logo.png"}
        number={formattedNumber}
      />

      <div id="home">
        <Header
          BgHead={listing.businessBanner ?? ""}
          title={listing.title}
          intro={listing.intro ?? ""}
        />
      </div>

      <div id="about-us">
        <CompanyAboutUs
          banner={listing.image ?? ""}
          title={listing.title}
          intro={listing.desc ?? ""}
          aboutUs={listing.aboutUs ?? ""}
        />
      </div>

      <div id="ban-text">
        <CompanyBanText
          banner={listing?.images?.[3] ?? ""}
          category={listing.category}
          formattedNumber={formattedNumber}
          phone={listing.phone ?? ""}
        />
      </div>

      <div id="company-count">
        <CompanyCount
          banner={listing?.images?.[1] ?? ""}
          title={listing.title}
          desc={listing.desc ?? ""}
          whyUs={listing.whyUs ?? ""}
        />
      </div>

      <div id="services" style={{ paddingTop: "16px" }}>
        <CompanyServices
          background={listing?.images?.[3] ?? ""}
          service={listing.accountingAndTaxService ?? ""}
          phone={listing.phone ?? ""}
        />
      </div>

      <div id="latest-projects" style={{ padding: "100px 0 55px 0" }}>
        <CompanyLatestProject
          img={listing?.image ?? ""}
          img1={listing?.images?.[1] ?? ""}
          img2={listing?.images?.[2] ?? ""}
          img3={listing?.images?.[3] ?? ""}
          img4={listing?.images?.[4] ?? ""}
          imgB={listing.businessBanner ?? ""}
          latestProjectIntro={listing.latestProjectIntro ?? ""}
        />
      </div>

      <div id="mission">
        <CompanyAboutService
          background={listing?.images?.[2] ?? ""}
          banner={listing?.images?.[1] ?? ""}
          ourMission={listing.ourMission ?? ""}
        />
      </div>

      <div id="contact-us">
        <ContactUs
          mapUrl={listing.mapUrl ?? ""}
          category={listing.category}
          address={listing.address ?? ""}
          website={listing.website ?? ""}
          formattedNumber={formattedNumber}
          phone={listing.phone ?? ""}
          contactUsIntro={listing.contactUsIntro ?? ""}
        />
      </div>

      <div id="contact">
        <CompanyContactCrd
          address={listing.address ?? ""}
          website={listing.website ?? ""}
          formattedNumber={formattedNumber}
          phone={listing.phone ?? ""}
          title={listing.title}
          logo={listing.businessLogo ?? "/default-logo.png"}
          intro={listing.intro ?? ""}
        />
      </div>

      <CompanyCopyRight />
    </Grid>
  );
};

export default ListingCompanyDetails;
