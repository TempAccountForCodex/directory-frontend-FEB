// import React from "react";
// import { Box, Container, Typography, Stack, Avatar, Chip } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // AI Icon
// import PsychologyIcon from "@mui/icons-material/Psychology"; // Copywriter Icon
// import SearchIcon from "@mui/icons-material/Search"; // Directory Icon
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// const userCategories = [
//   {
//     name: "Retailer",
//     img: "https://i.pravatar.cc/150?u=11",
//     pos: { top: "80%", left: "12%" },
//   },
//   {
//     name: "Freelancer",
//     img: "https://i.pravatar.cc/150?u=12",
//     pos: { top: "5%", left: "28%" },
//   },
//   {
//     name: "Creator",
//     img: "https://i.pravatar.cc/150?u=13",
//     pos: { top: "80%", left: "42%" },
//   },
//   {
//     name: "Startup",
//     img: "https://i.pravatar.cc/150?u=14",
//     pos: { top: "5%", left: "57%" },
//   },
//   {
//     name: "Local Shop",
//     img: "https://i.pravatar.cc/150?u=15",
//     pos: { top: "80%", left: "70%", active: true },
//   },
//   {
//     name: "Consultant",
//     img: "https://i.pravatar.cc/150?u=16",
//     pos: { top: "0%", left: "81%" },
//   },
// ];

// export default function PricingFeaturesSection() {
//   const brandNeon = "#ffffff"; // Your Exact Theme Color

//   return (
//     <Box
//       sx={{
//         backgroundColor: "#ffffff",
//         pt: 12,
//         pb: 2,
//         position: "relative",
//         overflow: "hidden",
//         fontFamily: "'Inter', sans-serif",
//       }}
//     >
//       {/* 1. Subtle Vertical Layout Lines */}
//       <Box
//         sx={{
//           position: "absolute",
//           inset: 0,
//           display: "flex",
//           justifyContent: "space-between",
//           px: { md: "10%", xs: "5%" },
//           pointerEvents: "none",
//         }}
//       >
//         {[1, 2, 3, 4, 5, 6].map((i) => (
//           <Box
//             key={i}
//             sx={{ width: "1px", height: "100%", backgroundColor: "#eeeded" }}
//           />
//         ))}
//       </Box>
//       <Container maxWidth="xl" sx={{ position: "relative" }}>
//         <Box
//           sx={{
//             height: "160px",
//             position: "relative",
//             mb: 12,
//             display: { xs: "none", md: "block" },
//           }}
//         >
//           <Typography
//             variant="h1"
//             sx={{
//               fontSize: "11.5vw",
//               fontWeight: 900,
//               textAlign: "center",
//               color: "#1a1a1a",
//               letterSpacing: "-0.05em",
//               opacity: 0.9,
//             }}
//           >
//             The Standard
//           </Typography>

//           {userCategories.map((person, idx) => (
//             <Box
//               key={idx}
//               sx={{
//                 position: "absolute",
//                 top: person.pos.top,
//                 left: person.pos.left,
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: "center",
//                 gap: 1.5,
//               }}
//             >
//               <Box sx={{ position: "relative" }}>
//                 <Avatar
//                   src={person.img}
//                   sx={{
//                     width: 55,
//                     height: 55,
//                     border: "4px solid #fff",
//                     boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
//                     transition: "0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
//                     "&:hover": {
//                       transform: "translateY(-5px) scale(1.1)",
//                       borderColor: brandNeon,
//                     },
//                   }}
//                 />
//                 {person.pos.active && (
//                   <Box
//                     sx={{
//                       position: "absolute",
//                       top: -4,
//                       right: -4,
//                       width: 14,
//                       height: 14,
//                       backgroundColor: brandNeon,
//                       borderRadius: "50%",
//                       border: "2px solid #fff",
//                       boxShadow: `0 0 10px ${brandNeon}`,
//                     }}
//                   />
//                 )}
//               </Box>
//               <Chip
//                 label={person.name}
//                 sx={{
//                   background: person.pos.active
//                     ? brandNeon
//                     : "linear-gradient(135deg, #378C92 0%, #141414 100%)",
//                   color: person.pos.active ? "#000" : "#fff",
//                   fontWeight: 800,
//                   fontSize: "10px",
//                   height: "24px",
//                   borderRadius: "4px",
//                   textTransform: "uppercase",
//                   border: person.pos.active ? "1px solid black" : "none",
//                 }}
//               />
//             </Box>
//           ))}
//         </Box>
//       </Container>
//       <Container maxWidth="lg" sx={{ position: "relative" }}>
//         {/* 2. Watermark Background Header */}

//         {/* 3. Main Content Section */}
//         <Box
//           sx={{
//             display: "flex",
//             flexWrap: "wrap",
//             mt: 4,
//             px: { md: 5 },
//             alignItems: "flex-start",
//           }}
//         >
//           <Box sx={{ flex: { md: 1.2, xs: "100%" }, mb: 8 }}>
//             <Typography
//               sx={{
//                 fontSize: { md: "72px", xs: "48px" },
//                 fontWeight: 900,
//                 lineHeight: 1,
//                 color: "#1a1a1a",
//                 mb: 4,
//                 letterSpacing: "-0.05em",
//               }}
//             >
//               Included in <br />
//               <span
//                 style={{
//                   color: "#fff",
//                   background:
//                     "linear-gradient(135deg, #378C92 0%, #141414 100%)",
//                   padding: "0 15px",
//                   display: "inline-block",
//                 }}
//               >
//                 every plan.
//               </span>
//             </Typography>

//             <Typography
//               sx={{
//                 fontSize: "19px",
//                 color: "#666",
//                 maxWidth: "550px",
//                 lineHeight: 1.7,
//                 fontWeight: 500,
//               }}
//             >
//               Whether your business is small or large, we’ve included these
//               essentials in every tier.
//             </Typography>

//             {/* Aesthetic Line */}
//             <Box
//               sx={{
//                 width: "80px",
//                 height: "6px",
//                 backgroundColor: brandNeon,
//                 mt: 5,
//                 borderRadius: 10,
//               }}
//             />

//             <Box
//               sx={{
//                 width: 200,
//                 height: 200,
//                 borderRadius: "50%",
//                 background:
//                   "radial-gradient(circle at 30% 30%, #fff, #f0f0f0 70%)",
//                 boxShadow:
//                   "inset -20px -20px 50px rgba(0,0,0,0.05), 30px 30px 60px rgba(0,0,0,0.05)",
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 position: "relative",
//                 mt: -2,
//               }}
//             >
//               <Box
//                 sx={{
//                   width: "80%",
//                   height: "80%",
//                   borderRadius: "50%",
//                   background: "rgba(255,255,255,0.5)",
//                   backdropFilter: "blur(10px)",
//                 }}
//               />
//             </Box>
//           </Box>

//           <Box sx={{ flex: { md: 1, xs: "100%" }, pt: { md: 2 } }}>
//             <Stack spacing={5}>
//               {[
//                 {
//                   icon: <AutoAwesomeIcon />,
//                   title: "AI-Powered Landing Page",
//                   desc: "Use the built-in AI Image Generator and Copywriter to create your professional page in seconds.",
//                 },
//                 {
//                   icon: <SearchIcon />,
//                   title: "Smart Directory Sync",
//                   desc: "List your business in our searchable directory and reach local customers easily.",
//                 },
//                 {
//                   icon: <PsychologyIcon />,
//                   title: "Intuitive Control Panel",
//                   desc: "Manage your business details, logo, and gallery without any technical knowledge.",
//                 },
//               ].map((item, i) => (
//                 <Stack
//                   key={i}
//                   direction="row"
//                   spacing={3}
//                   alignItems="flex-start"
//                 >
//                   <Box
//                     sx={{
//                       minWidth: 56,
//                       height: 56,
//                       borderRadius: "16px",
//                       background:
//                         "linear-gradient(135deg, #378C92 0%, #141414 100%)",
//                       color: brandNeon,
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "center",
//                       boxShadow: `4px 4px 0px ${brandNeon}`, // Geometric shadow
//                     }}
//                   >
//                     {React.cloneElement(item.icon, { sx: { fontSize: 28 } })}
//                   </Box>
//                   <Box>
//                     <Typography
//                       sx={{
//                         fontSize: "22px",
//                         fontWeight: 850,
//                         color: "#1a1a1a",
//                         mb: 1,
//                       }}
//                     >
//                       {item.title}
//                     </Typography>
//                     <Typography
//                       sx={{ fontSize: "16px", color: "#555", lineHeight: 1.6 }}
//                     >
//                       {item.desc}
//                     </Typography>
//                   </Box>
//                 </Stack>
//               ))}
//             </Stack>

//             {/* High-Impact CTA */}
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   );
// }

import React from "react";
import { Box, Container, Typography, Stack, Avatar, Chip } from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome"; // AI Icon
import PsychologyIcon from "@mui/icons-material/Psychology"; // Copywriter Icon
import SearchIcon from "@mui/icons-material/Search"; // Directory Icon
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const userCategories = [
  {
    name: "Retailer",
    img: "https://i.pravatar.cc/150?u=11",
    pos: { top: "80%", left: "12%" },
  },
  {
    name: "Freelancer",
    img: "https://i.pravatar.cc/150?u=12",
    pos: { top: "5%", left: "28%" },
  },
  {
    name: "Creator",
    img: "https://i.pravatar.cc/150?u=13",
    pos: { top: "80%", left: "42%" },
  },
  {
    name: "Startup",
    img: "https://i.pravatar.cc/150?u=14",
    pos: { top: "5%", left: "57%" },
  },
  {
    name: "Local Shop",
    img: "https://i.pravatar.cc/150?u=15",
    pos: { top: "80%", left: "70%", active: true },
  },
  {
    name: "Consultant",
    img: "https://i.pravatar.cc/150?u=16",
    pos: { top: "0%", left: "81%" },
  },
];

const features = [
  {
    icon: <AutoAwesomeIcon />,
    number: "01",
    title: "AI-Powered Landing Page",
    desc: "Use the built-in AI Image Generator and Copywriter to create your professional page in seconds.",
  },
  {
    icon: <SearchIcon />,
    number: "02",
    title: "Smart Directory Sync",
    desc: "List your business in our searchable directory and reach local customers easily.",
  },
  {
    icon: <PsychologyIcon />,
    number: "03",
    title: "Intuitive Control Panel",
    desc: "Manage your business details, logo, and gallery without any technical knowledge.",
  },
];

export default function PricingFeaturesSection() {
  const brandNeon = "#ffffff";

  return (
    <Box
      sx={{
        backgroundColor: "#ffffff",
        pt: { xs: 8, md: 12 },
        pb: 2,
        px: { xs: 3, sm: 10, md: 3 },
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. Subtle Vertical Layout Lines */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          justifyContent: "space-between",
          px: { md: "10%", xs: "5%" },
          pointerEvents: "none",
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Box
            key={i}
            sx={{ width: "1px", height: "100%", backgroundColor: "#eeeded" }}
          />
        ))}
      </Box>
      <Container maxWidth="xl" sx={{ position: "relative" }}>
        <Box
          sx={{
            height: { xs: "auto", md: "160px" },
            position: "relative",
            mb: { xs: 0, md: 12 },
            // display: { xs: "none", md: "block" },
          }}
        >
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3rem", md: "11.5vw" },
              fontWeight: 900,
              textAlign: "center",
              color: "#1a1a1a",
              letterSpacing: "-0.05em",
              opacity: 0.9,
            }}
          >
            The Standard
          </Typography>

          {userCategories.map((person, idx) => (
            <Box
              key={idx}
              sx={{
                position: "absolute",
                top: person.pos.top,
                left: person.pos.left,
                flexDirection: "column",
                alignItems: "center",
                gap: 1.5,
                display: { xs: "none", md: "flex" },
              }}
            >
              <Box sx={{ position: "relative" }}>
                <Avatar
                  alt={person.name}
                  src={person.img}
                  sx={{
                    width: 55,
                    height: 55,
                    border: "4px solid #fff",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
                    transition: "0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                    "&:hover": {
                      transform: "translateY(-5px) scale(1.1)",
                      borderColor: brandNeon,
                    },
                  }}
                />
                {person.pos.active && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -4,
                      right: -4,
                      width: 14,
                      height: 14,
                      backgroundColor: brandNeon,
                      borderRadius: "50%",
                      border: "2px solid #fff",
                      boxShadow: `0 0 10px ${brandNeon}`,
                    }}
                  />
                )}
              </Box>
              <Chip
                label={person.name}
                sx={{
                  background: person.pos.active
                    ? brandNeon
                    : "linear-gradient(135deg, #378C92 0%, #141414 100%)",
                  color: person.pos.active ? "#000" : "#fff",
                  fontWeight: 800,
                  fontSize: "10px",
                  height: "24px",
                  borderRadius: "4px",
                  textTransform: "uppercase",
                  border: person.pos.active ? "1px solid black" : "none",
                }}
              />
            </Box>
          ))}
        </Box>
      </Container>

      {/* ── REDESIGNED SECTION ── */}
      <Container
        maxWidth="lg"
        sx={{
          position: "relative",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <Box sx={{ mt: 4, px: { md: 5 } }}>
          {/* Top header row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 3,
              mb: 6,
              pb: 5,
              borderBottom: "1.5px solid #e8e8e8",
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "#378C92",
                  mb: 2,
                }}
              >
                What's included
              </Typography>
              <Typography
                sx={{
                  fontSize: { md: "64px", xs: "30px" },
                  fontWeight: 900,
                  lineHeight: 1,
                  color: "#1a1a1a",
                  letterSpacing: "-0.04em",
                }}
              >
                Included in every plan.
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: "16px",
                color: "#595959",
                maxWidth: "320px",
                lineHeight: 1.7,
                fontWeight: 400,
                textAlign: { md: "right", xs: "left" },
              }}
            >
              Whether your business is small or large, we've included these
              essentials in every tier.
            </Typography>
          </Box>

          {/* Features — 3-column stat/feature blocks */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { md: "1fr 1fr 1fr", xs: "1fr" },
              mb: 8,
            }}
          >
            {features.map((item, i) => (
              <Box
                key={i}
                sx={{
                  px: { md: 5, xs: 0 },
                  py: { md: 5, xs: 4 },
                  borderLeft: {
                    md: i > 0 ? "1px solid #e8e8e8" : "none",
                    xs: "none",
                  },
                  borderTop: {
                    md: "none",
                    xs: i > 0 ? "1px solid #e8e8e8" : "none",
                  },
                  display: "flex",
                  flexDirection: "column",
                  gap: 2.5,
                }}
              >
                {/* Icon + number row */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: "14px",
                      background:
                        "linear-gradient(135deg, #378C92 0%, #141414 100%)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {React.cloneElement(item.icon, { sx: { fontSize: 22 } })}
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "42px",
                      fontWeight: 900,
                      color: "#f0f0f0",
                      lineHeight: 1,
                      letterSpacing: "-0.05em",
                      fontFamily: "monospace",
                    }}
                  >
                    {item.number}
                  </Typography>
                </Box>

                {/* Thin accent line */}
                <Box
                  sx={{
                    width: "40px",
                    height: "3px",
                    borderRadius: "2px",
                    background: "linear-gradient(90deg, #378C92, #141414)",
                  }}
                />

                {/* Title */}
                <Typography
                  sx={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "#1a1a1a",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.2,
                  }}
                >
                  {item.title}
                </Typography>

                {/* Description */}
                <Typography
                  sx={{
                    fontSize: "15px",
                    color: "#595959",
                    lineHeight: 1.75,
                    fontWeight: 400,
                  }}
                >
                  {item.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
