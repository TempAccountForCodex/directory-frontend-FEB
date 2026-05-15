// import React from "react";
// import {
//   Box,
//   Typography,
//   IconButton,
//   useMediaQuery,
//   ThemeProvider,
//   createTheme,
//   CssBaseline,
//   GlobalStyles,
//   Container,
//   Stack,
// } from "@mui/material";
// import { alpha } from "@mui/material/styles";
// import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
// import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
// import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
// import NorthEastIcon from "@mui/icons-material/NorthEast";
// import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// const theme = createTheme({
//   palette: {
//     background: { default: "#ffffff" },
//     primary: { main: "#1a5c52" },
//     secondary: { main: "#3cc9a8" },
//     text: { primary: "#0d2e2a", secondary: "#4a6b66" },
//   },
//   typography: { fontFamily: "'DM Sans', sans-serif" },
// });

// const contacts = [
//   {
//     id: "email",
//     num: "01",
//     category: "Email",
//     title: "Digital Correspondence",
//     description: "Direct access to our senior expert support desk.",
//     value: "info@halkwinds.com",
//     href: "mailto:info@halkwinds.com",
//     icon: <EmailOutlinedIcon sx={{ fontSize: 18 }} />,
//   },
//   {
//     id: "phone",
//     num: "02",
//     category: "Phone",
//     title: "Priority Voice Line",
//     description: "Speak with our consultants directly. Mon–Fri, 9am–6pm.",
//     value: "+1 (123) 456-7890",
//     href: "tel:+11234567890",
//     icon: <PhoneInTalkOutlinedIcon sx={{ fontSize: 18 }} />,
//   },
//   {
//     id: "visit",
//     num: "03",
//     category: "Visit",
//     title: "Global Headquarters",
//     description: "Walk in or schedule an appointment at our office.",
//     value: "New York, USA",
//     href: "#",
//     icon: <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />,
//   },
// ];

// const ContactRow = ({ item, isLast }: any) => {
//   const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
//   return (
//     <Box
//       component="a"
//       href={item.href}
//       sx={{
//         display: "grid",
//         gridTemplateColumns: isMobile
//           ? "40px 1fr 40px"
//           : "52px 52px 1fr auto 52px",
//         alignItems: "center",
//         gap: { xs: 2, md: 3 },
//         px: { xs: 3, md: 5 },
//         py: 4,
//         position: "relative",
//         textDecoration: "none",
//         transition: "all 0.3s ease",
//         zIndex: 2,
//         "&::after": isLast
//           ? {}
//           : {
//               content: '""',
//               position: "absolute",
//               bottom: 0,
//               left: 40,
//               right: 40,
//               height: "1px",
//               background: "rgba(26,92,82,.08)",
//             },
//         "&:hover": {
//           background: "rgba(60, 201, 168, 0.08)",
//           "& .arrow-btn": {
//             background: "#1a5c52",
//             borderColor: "#1a5c52",
//             "& svg": { color: "#fff" },
//             transform: "scale(1.1) rotate(45deg)",
//           },
//         },
//       }}
//     >
//       {!isMobile && (
//         <Typography
//           sx={{ fontSize: 12, fontWeight: 500, color: "rgba(26,92,82,.25)" }}
//         >
//           {item.num}
//         </Typography>
//       )}
//       <Box
//         sx={{
//           width: 44,
//           height: 44,
//           borderRadius: "12px",
//           background: "#f0f9f7",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           color: "#2a8a7a",
//         }}
//       >
//         {item.icon}
//       </Box>
//       <Box>
//         <Typography
//           sx={{
//             fontSize: 10,
//             letterSpacing: "0.14em",
//             fontWeight: 700,
//             color: "#041e18",
//             textTransform: "uppercase",
//             mb: 0.5,
//           }}
//         >
//           {item.category}
//         </Typography>
//         <Typography
//           sx={{
//             fontSize: { xs: 16, md: 18 },
//             fontWeight: 600,
//             color: "#0d2e2a",
//           }}
//         >
//           {item.title}
//         </Typography>
//         <Typography sx={{ fontSize: 13, color: "#8a9e9a" }}>
//           {item.description}
//         </Typography>
//       </Box>
//       {!isMobile && (
//         <Typography sx={{ fontSize: 15, fontWeight: 600, color: "#1a5c52" }}>
//           {item.value}
//         </Typography>
//       )}
//       <Box
//         className="arrow-btn"
//         sx={{
//           width: 40,
//           height: 40,
//           borderRadius: "50%",
//           border: "1.5px solid rgba(26,92,82,.2)",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           transition: "0.4s",
//         }}
//       >
//         <NorthEastIcon sx={{ fontSize: 16, color: "#2a8a7a" }} />
//       </Box>
//     </Box>
//   );
// };

// const ContactSection: React.FC = () => {
//   return (
//     <ThemeProvider theme={theme}>
//       <CssBaseline />
//       <GlobalStyles
//         styles={`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}
//       />

//       <Box
//         sx={{
//           position: "relative",
//           backgroundColor: "#ffffff",
//           overflow: "hidden",
//           pt: { xs: 8, md: 10 },
//           pb: { xs: 8, md: 14 },
//         }}
//       >
//         {/* ── BACKGROUND LAYER 1: LIGHT LEAKS TO KILL THE FLAT WHITE ── */}
//         <Box
//           sx={{
//             position: "absolute",
//             top: "10%",
//             right: "-5%",
//             width: "600px",
//             height: "600px",
//             background:
//               "radial-gradient(circle, rgba(60, 201, 168, 0.12) 0%, transparent 70%)",
//             filter: "blur(90px)",
//             zIndex: 0,
//           }}
//         />

//         {/* ── BACKGROUND LAYER 2: DUAL SVG FLOW (Left & Right) ── */}
//         {/* ── VISIBLE BACKGROUND LAYER 2: DUAL SVG FLOW ── */}
//         <Box
//           aria-hidden="true"
//           component="svg"
//           viewBox="0 0 1440 900"
//           preserveAspectRatio="none"
//           sx={{
//             position: "absolute",
//             top: 0,
//             left: 0,
//             width: "100%",
//             height: "100%",
//             zIndex: 0,
//           }}
//         >
//           <defs>
//             <linearGradient id="leftWave" x1="0%" y1="0%" x2="100%" y2="100%">
//               <stop offset="0%" stopColor={alpha("#137c63", 0.4)} />
//               <stop offset="50%" stopColor={alpha("#137c63", 0.05)} />
//               <stop offset="100%" stopColor="transparent" />
//             </linearGradient>
//             <linearGradient id="rightWave" x1="100%" y1="0%" x2="0%" y2="100%">
//               <stop offset="0%" stopColor={alpha("#3cc9a8", 0.3)} />
//               <stop offset="60%" stopColor={alpha("#3cc9a8", 0.02)} />
//               <stop offset="100%" stopColor="transparent" />
//             </linearGradient>
//           </defs>

//           {/* LEFT-SIDE DENSE FLOW */}
//           {Array.from({ length: 25 }).map((_, i) => (
//             <path
//               key={`left-${i}`}
//               d={`M -200,${i * 15} C 300,${i * 10} 600,${600 + i * 20} 1400,${400 + i * 10}`}
//               fill="none"
//               stroke="url(#leftWave)"
//               strokeWidth={i % 4 === 0 ? "1.5" : "0.5"}
//             />
//           ))}

//           {/* RIGHT-SIDE FLOW - MOVED DOWN BY 20% (Logic for the boss) */}
//           {Array.from({ length: 20 }).map((_, i) => {
//             const yOffset = 180; // This pushes the start point down from the top
//             return (
//               <path
//                 key={`right-${i}`}
//                 d={`M 1600,${yOffset + i * 20}
//                     C 1100,${yOffset + i * 15}
//                       800,${yOffset + 220 + i * 30}
//                       -100,${yOffset + 520 + i * 5}`}
//                 fill="none"
//                 stroke="url(#rightWave)"
//                 strokeWidth="0.8"
//                 opacity={0.6}
//               />
//             );
//           })}
//         </Box>

//         <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
//           {/* Header Section */}
//           <Box
//             sx={{
//               display: "grid",
//               gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
//               gap: { xs: 4, md: 10 },
//               alignItems: "center",
//               mb: 10,
//             }}
//           >
//             <Box>
//               <Stack direction="row" alignItems="center" spacing={2} mb={2}>
//                 <Box sx={{ width: 35, height: 3, bgcolor: "#12735c" }} />
//                 <Typography
//                   sx={{
//                     fontSize: 12,
//                     fontWeight: 800,
//                     letterSpacing: 2,
//                     color: "#0d4a3c",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Connect With Us
//                 </Typography>
//               </Stack>
//               <Typography
//                 sx={{
//                   fontFamily: "'Bebas Neue', sans-serif",
//                   fontSize: { xs: "72px", md: "90px" },
//                   lineHeight: 0.9,
//                   color: "#0d2e2a",
//                 }}
//               >
//                 LET'S{" "}
//                 <Box
//                   component="span"
//                   // sx={{
//                   //   color: "transparent",
//                   //   WebkitTextStroke: "2px #2a8a7a",
//                   //   fontStyle: "italic",
//                   // }}
//                 >
//                   CONNECT
//                 </Box>{" "}
//                 <Box
//                   component="span"
//                   sx={{
//                     color: "transparent",
//                     WebkitTextStroke: "2px #2a8a7a",
//                     fontStyle: "italic",
//                   }}
//                 >
//                   {" "}
//                   TODAY
//                 </Box>
//               </Typography>
//             </Box>

//             <Box>
//               <Typography
//                 sx={{
//                   fontSize: 18,
//                   color: "#4a6b66",
//                   lineHeight: 1.8,
//                   mb: 2,
//                   fontWeight: 500,
//                 }}
//               >
//                 High-performance strategies are just a conversation away. Reach
//                 out to our expert team for a priority consultation.
//               </Typography>
//             </Box>
//           </Box>

//           {/* Main Card Container */}
//           <Box
//             sx={{
//               borderRadius: "45px",
//               backgroundColor: "rgba(255,255,255,0.9)",
//               backdropFilter: "blur(25px)",
//               border: "1px solid rgba(26,92,82,0.15)",
//               boxShadow: "0 50px 100px rgba(0,0,0,0.05)",
//               overflow: "hidden",
//             }}
//           >
//             {contacts.map((item, i) => (
//               <ContactRow
//                 key={item.id}
//                 item={item}
//                 isLast={i === contacts.length - 1}
//               />
//             ))}
//           </Box>
//         </Container>
//       </Box>

//       <IconButton
//         onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
//         sx={{
//           position: "fixed",
//           bottom: 40,
//           right: 40,
//           width: 55,
//           height: 55,
//           bgcolor: "#fff",
//           border: "1.5px solid #e0f2f0",
//           boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
//           zIndex: 10,
//           "&:hover": {
//             bgcolor: "#1a5c52",
//             color: "#fff",
//             transform: "translateY(-5px)",
//           },
//           transition: "0.3s",
//         }}
//       >
//         <KeyboardArrowUpIcon />
//       </IconButton>
//     </ThemeProvider>
//   );
// };

// export default ContactSection;

import React from "react";
import {
  Box,
  Typography,
  IconButton,
  useMediaQuery,
  ThemeProvider,
  createTheme,
  CssBaseline,
  GlobalStyles,
  Container,
  Stack,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneInTalkOutlinedIcon from "@mui/icons-material/PhoneInTalkOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

import companyDetails from "./../../../utils/data/CompanyInfo";

const theme = createTheme({
  palette: {
    background: { default: "#ffffff" },
    primary: { main: "#1a5c52" },
    secondary: { main: "#3cc9a8" },
    text: { primary: "#0d2e2a", secondary: "#4a6b66" },
  },
  typography: { fontFamily: "'DM Sans', sans-serif" },
});

const normalizePhoneForTel = (phone: string) => phone.replace(/[^\d+]/g, "");

const ContactRow = ({ item, isLast }: any) => {
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      component="a"
      href={item.href}
      target={item.target || undefined}
      rel={item.rel || undefined}
      sx={{
        display: "grid",
        gridTemplateColumns: isMobile
          ? "40px 1fr 40px"
          : "52px 52px 1fr auto 52px",
        alignItems: "center",
        gap: { xs: 2, md: 3 },
        px: { xs: 3, md: 5 },
        py: 4,
        position: "relative",
        textDecoration: "none",
        transition: "all 0.3s ease",
        zIndex: 2,
        "&::after": isLast
          ? {}
          : {
              content: '""',
              position: "absolute",
              bottom: 0,
              left: 40,
              right: 40,
              height: "1px",
              background: "rgba(26,92,82,.08)",
            },
        "&:hover": {
          background: "rgba(60, 201, 168, 0.08)",
          "& .arrow-btn": {
            background: "#1a5c52",
            borderColor: "#1a5c52",
            "& svg": { color: "#fff" },
            transform: "scale(1.1) rotate(45deg)",
          },
        },
      }}
    >
      {!isMobile && (
        <Typography
          sx={{ fontSize: 12, fontWeight: 500, color: "rgba(26,92,82,.25)" }}
        >
          {item.num}
        </Typography>
      )}

      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: "12px",
          background: "#f0f9f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#2a8a7a",
        }}
      >
        {item.icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 10,
            letterSpacing: "0.14em",
            fontWeight: 700,
            color: "#041e18",
            textTransform: "uppercase",
            mb: 0.5,
          }}
        >
          {item.category}
        </Typography>

        <Typography
          sx={{
            fontSize: { xs: 16, md: 18 },
            fontWeight: 600,
            color: "#0d2e2a",
          }}
        >
          {item.title}
        </Typography>

        <Typography sx={{ fontSize: 13, color: "#8a9e9a" }}>
          {item.description}
        </Typography>
      </Box>

      {!isMobile && (
        <Typography
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: "#1a5c52",
            maxWidth: 360,
            textAlign: "right",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.value}
        </Typography>
      )}

      <Box
        className="arrow-btn"
        sx={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "1.5px solid rgba(26,92,82,.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "0.4s",
        }}
      >
        <NorthEastIcon sx={{ fontSize: 16, color: "#2a8a7a" }} />
      </Box>
    </Box>
  );
};

const ContactSection: React.FC = () => {
  const email = companyDetails?.officialEmail || "info@thetechietribe.com";
  const phonePrimary =
    (companyDetails?.phoneNumber && companyDetails.phoneNumber[0]) || "";
  const address = companyDetails?.address || "";
  const mapLink = companyDetails?.googleMapAddress || "#";
  const workingDays = companyDetails?.workingDays || "";
  const workingTime = companyDetails?.workingTime || "";

  const contacts = [
    {
      id: "email",
      num: "01",
      category: "Email",
      title: "Official Support Inbox",
      description: "Reach our team for onboarding, updates, and guidance.",
      value: email,
      href: `mailto:${email}`,
      icon: <EmailOutlinedIcon sx={{ fontSize: 18 }} />,
    },
    {
      id: "phone",
      num: "02",
      category: "Phone",
      title: "Direct Call Assistance",
      description: `Available ${workingDays}${workingTime ? ` • ${workingTime}` : ""}`,
      value: phonePrimary || "Call us",
      href: phonePrimary ? `tel:${normalizePhoneForTel(phonePrimary)}` : "#",
      icon: <PhoneInTalkOutlinedIcon sx={{ fontSize: 18 }} />,
    },
    {
      id: "visit",
      num: "03",
      category: "Location",
      title: "Office Address",
      description: "Open directions on Google Maps for a quick route.",
      value: address || "View on map",
      href: mapLink,
      target: "_blank",
      rel: "noreferrer",
      icon: <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />,
    },
    {
      id: "hours",
      num: "04",
      category: "Hours",
      title: "Working Schedule",
      description: "Best time to reach us for priority responses.",
      value: `${workingDays}${workingTime ? ` • ${workingTime}` : ""}`.trim(),
      href: mapLink || "#",
      target: mapLink ? "_blank" : undefined,
      rel: mapLink ? "noreferrer" : undefined,
      icon: <AccessTimeOutlinedIcon sx={{ fontSize: 18 }} />,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <GlobalStyles
        styles={`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;700&display=swap');`}
      />

      <Box
        sx={{
          position: "relative",
          backgroundColor: "#ffffff",
          overflow: "hidden",
          pt: { xs: 8, md: 10 },
          pb: { xs: 8, md: 14 },
        }}
      >
        {/* ── BACKGROUND LAYER 1: LIGHT LEAKS ── */}
        <Box
          sx={{
            position: "absolute",
            top: "10%",
            right: "-5%",
            width: "600px",
            height: "600px",
            background:
              "radial-gradient(circle, rgba(60, 201, 168, 0.12) 0%, transparent 70%)",
            filter: "blur(90px)",
            zIndex: 0,
          }}
        />

        {/* ── BACKGROUND LAYER 2: DUAL SVG FLOW ── */}
        <Box
          aria-hidden="true"
          component="svg"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
          }}
        >
          <defs>
            <linearGradient id="leftWave" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={alpha("#137c63", 0.4)} />
              <stop offset="50%" stopColor={alpha("#137c63", 0.05)} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="rightWave" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={alpha("#3cc9a8", 0.3)} />
              <stop offset="60%" stopColor={alpha("#3cc9a8", 0.02)} />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* LEFT-SIDE DENSE FLOW */}
          {Array.from({ length: 25 }).map((_, i) => (
            <path
              key={`left-${i}`}
              d={`M -200,${i * 15} C 300,${i * 10} 600,${600 + i * 20} 1400,${400 + i * 10}`}
              fill="none"
              stroke="url(#leftWave)"
              strokeWidth={i % 4 === 0 ? "1.5" : "0.5"}
            />
          ))}

          {/* RIGHT-SIDE FLOW */}
          {Array.from({ length: 20 }).map((_, i) => {
            const yOffset = 180;
            return (
              <path
                key={`right-${i}`}
                d={`M 1600,${yOffset + i * 20} 
                    C 1100,${yOffset + i * 15} 
                      800,${yOffset + 220 + i * 30} 
                      -100,${yOffset + 520 + i * 5}`}
                fill="none"
                stroke="url(#rightWave)"
                strokeWidth="0.8"
                opacity={0.6}
              />
            );
          })}
        </Box>

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 2 }}>
          {/* Header Section */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1.2fr 0.8fr" },
              gap: { xs: 4, md: 10 },
              alignItems: "center",
              mb: 10,
            }}
          >
            <Box>
              <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                <Box sx={{ width: 35, height: 3, bgcolor: "#12735c" }} />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 2,
                    color: "#0d4a3c",
                    textTransform: "uppercase",
                  }}
                >
                  TechieTribe Contact
                </Typography>
              </Stack>

              <Typography
                sx={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: { xs: "72px", md: "90px" },
                  lineHeight: 0.9,
                  color: "#0d2e2a",
                }}
              >
                LET'S CONNECT{" "}
                <Box
                  component="span"
                  sx={{
                    color: "transparent",
                    WebkitTextStroke: "2px #2a8a7a",
                    fontStyle: "italic",
                  }}
                >
                  TODAY
                </Box>
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  fontSize: 18,
                  color: "#4a6b66",
                  lineHeight: 1.8,
                  mb: 2,
                  fontWeight: 500,
                }}
              >
                Reach out using the option that fits best — we’ll route your
                message to the right person and respond as quickly as possible.
              </Typography>

              <Typography
                sx={{
                  fontSize: 13,
                  color: "#7b908c",
                  fontWeight: 600,
                  letterSpacing: 0.2,
                }}
              >
                {companyDetails.companyName} • {companyDetails.ownerName}
              </Typography>
            </Box>
          </Box>

          {/* Main Card Container */}
          <Box
            sx={{
              borderRadius: "45px",
              backgroundColor: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(25px)",
              border: "1px solid rgba(26,92,82,0.15)",
              boxShadow: "0 50px 100px rgba(0,0,0,0.05)",
              overflow: "hidden",
            }}
          >
            {contacts.map((item, i) => (
              <ContactRow
                key={item.id}
                item={item}
                isLast={i === contacts.length - 1}
              />
            ))}
          </Box>
        </Container>
      </Box>

      <IconButton
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        sx={{
          position: "fixed",
          bottom: 40,
          right: 40,
          width: 55,
          height: 55,
          bgcolor: "#fff",
          border: "1.5px solid #e0f2f0",
          boxShadow: "0 15px 40px rgba(0,0,0,0.1)",
          zIndex: 10,
          "&:hover": {
            bgcolor: "#1a5c52",
            color: "#fff",
            transform: "translateY(-5px)",
          },
          transition: "0.3s",
        }}
      >
        <KeyboardArrowUpIcon />
      </IconButton>
    </ThemeProvider>
  );
};

export default ContactSection;
