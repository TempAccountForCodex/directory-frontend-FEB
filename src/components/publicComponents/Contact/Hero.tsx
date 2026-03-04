//
//
//
//
//
//
//
//
//
//
//
//

// import {
//   Typography,
//   Button,
//   Box,
//   Container,
//   Stack,
//   Link,
//   styled,
// } from "@mui/material";
// import SouthIcon from "@mui/icons-material/South"; // For the CTA button icon

// const star = "/assets/publicAssets/images/common/star.svg";
// const darkhole = "/assets/publicAssets/images/common/darkhole.svg";

// // Styled component for the vertical bars - Keeping your original design
// const BackgroundBar = styled(Box)<{ heightpercent: number }>(
//   ({ heightpercent }) => ({
//     flex: 1,
//     height: `${heightpercent}%`,
//     background:
//       "linear-gradient(to top, #378C92 0%, #378C92 40%, transparent 100%)",
//     borderRadius: "12px 12px 0 0",
//     margin: "0 4px",
//     opacity: 0.8,
//     transition: "height 0.3s ease",
//   }),
// );

// const TopflowHero = () => {
//   // Pattern: High on left -> Down to center -> High on right
//   const barHeights = [90, 80, 70, 60, 50, 40, 30, 40, 50, 60, 70, 80, 90];

//   return (
//     <Box
//       sx={{
//         backgroundImage: `url(${star})`,
//         backgroundColor: "#000000",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         overflow: "hidden",
//         position: "relative",
//       }}
//     >
//       <Box
//         sx={{
//           minHeight: "100vh",
//           width: "100%",
//           position: "relative",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         {/* 1. BACKGROUND DESIGN */}
//         <Box
//           sx={{
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             width: "100%",
//             height: "60vh",
//             display: "flex",
//             alignItems: "flex-end",
//             px: 1,
//             zIndex: 0,
//           }}
//         >
//           {barHeights.map((h, i) => (
//             <BackgroundBar key={i} heightpercent={h} />
//           ))}
//         </Box>

//         {/* 2. HERO CONTENT (Updated with TechieTribe Blueprint) */}
//         <Container
//           maxWidth="lg"
//           sx={{
//             position: "relative",
//             zIndex: 1,
//             textAlign: "center",
//             pt: 30,
//             pb: 10,
//           }}
//         >
//           <Typography
//             variant="h1"
//             sx={{
//               color: "#fff",
//               fontSize: { xs: "2.8rem", md: "5.5rem" },
//               fontWeight: 900,
//               lineHeight: 1,
//               letterSpacing: "-0.04em",
//               mb: 4,
//             }}
//           >
//             Your Business Website,
//             <br />
//             <span>Auto-Generated.</span>
//           </Typography>

//           <Typography
//             variant="body1"
//             sx={{
//               color: "#aaa",
//               mb: 6,
//               maxWidth: "600px",
//               mx: "auto",
//               fontSize: "1.2rem",
//               lineHeight: 1.6,
//             }}
//           >
//             Create a professional landing page instantly with AI—and get your
//             business listed on our directory to reach local customers. No coding
//             needed.
//           </Typography>

//           {/* CTA Buttons */}
//           <Stack
//             direction={{ xs: "column", sm: "row" }}
//             spacing={3}
//             justifyContent="center"
//             alignItems="center"
//             sx={{ mb: 12 }}
//           >
//             <Button
//               variant="contained"
//               sx={{
//                 bgcolor: "#fff",
//                 color: "#000",
//                 borderRadius: "50px",
//                 pl: 1,
//                 pr: 4,
//                 py: 1.5,
//                 fontWeight: 800,
//                 textTransform: "none",
//                 fontSize: "1.1rem",
//                 display: "flex",
//                 gap: 2,
//                 transition: "0.3s",
//                 "&:hover": {
//                   bgcolor: "#a3ff33",
//                   transform: "translateY(-3px)",
//                 },
//               }}
//             >
//               <Box
//                 sx={{
//                   bgcolor: "#000",
//                   borderRadius: "50%",
//                   width: 36,
//                   height: 36,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <SouthIcon
//                   sx={{
//                     color: "#fff",
//                     fontSize: 18,
//                     transform: "rotate(-135deg)",
//                   }}
//                 />
//               </Box>
//               Create Free Landing Page
//             </Button>

//             <Link
//               href="#"
//               sx={{
//                 color: "#fff",
//                 textDecoration: "none",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 1.5,
//                 fontWeight: 600,
//                 fontSize: "1.1rem",
//                 transition: "0.3s",
//                 "&:hover": { color: "#a3ff33" },
//               }}
//             >
//               Explore Listings <SouthIcon sx={{ fontSize: 20 }} />
//             </Link>
//           </Stack>
//         </Container>
//       </Box>
//     </Box>
//   );
// };

// export default TopflowHero;

// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //

// import {
//   Typography,
//   Button,
//   Box,
//   Container,
//   Stack,
//   Link,
//   styled,
// } from "@mui/material";
// import SouthIcon from "@mui/icons-material/South"; // For the CTA button icon

// const star = "/assets/publicAssets/images/common/star.svg";
// const darkhole = "/assets/publicAssets/images/common/darkhole.svg";

// // Styled component for the vertical bars - Keeping your original design
// const BackgroundBar = styled(Box)<{ heightpercent: number }>(
//   ({ heightpercent }) => ({
//     flex: 1,
//     height: `${heightpercent}%`,
//     background:
//       "linear-gradient(to top, #378C92 0%, #378C92 40%, transparent 100%)",
//     borderRadius: "12px 12px 0 0",
//     margin: "0 4px",
//     opacity: 0.8,
//     transition: "height 0.3s ease",
//   }),
// );

// const TopflowHero = () => {
//   // Pattern: High on left -> Down to center -> High on right
//   const barHeights = [90, 80, 70, 60, 50, 40, 30, 40, 50, 60, 70, 80, 90];

//   return (
//     <Box
//       sx={{
//         backgroundImage: `url(${star})`,
//         backgroundColor: "#000000",
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         overflow: "hidden",
//         position: "relative",
//       }}
//     >
//       <Box
//         sx={{
//           minHeight: "100vh",
//           width: "100%",
//           position: "relative",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         {/* 1. BACKGROUND DESIGN */}
//         <Box
//           sx={{
//             position: "absolute",
//             bottom: 0,
//             left: 0,
//             width: "100%",
//             height: "90vh",
//             display: "flex",
//             alignItems: "flex-end",
//             px: 1,
//             zIndex: 0,
//             transform: "rotate(180deg)",
//             top: 0,
//           }}
//         >
//           {barHeights.map((h, i) => (
//             <BackgroundBar key={i} heightpercent={h} />
//           ))}
//         </Box>

//         {/* 2. HERO CONTENT (Updated with TechieTribe Blueprint) */}
//         <Container
//           maxWidth="lg"
//           sx={{
//             position: "relative",
//             zIndex: 1,
//             textAlign: "center",
//             pt: 40,
//             pb: 10,
//           }}
//         >
//           <Typography
//             variant="h1"
//             sx={{
//               color: "#fff",
//               fontSize: { xs: "2.8rem", md: "5.5rem" },
//               fontWeight: 900,
//               lineHeight: 1,
//               letterSpacing: "-0.04em",
//               mb: 4,
//             }}
//           >
//             Your Business Website,
//             <br />
//             <span>Auto-Generated.</span>
//           </Typography>

//           <Typography
//             variant="body1"
//             sx={{
//               color: "#aaa",
//               mb: 6,
//               maxWidth: "600px",
//               mx: "auto",
//               fontSize: "1.2rem",
//               lineHeight: 1.6,
//             }}
//           >
//             Create a professional landing page instantly with AI—and get your
//             business listed on our directory to reach local customers. No coding
//             needed.
//           </Typography>

//           {/* CTA Buttons */}
//           <Stack
//             direction={{ xs: "column", sm: "row" }}
//             spacing={3}
//             justifyContent="center"
//             alignItems="center"
//             sx={{ mb: 12 }}
//           >
//             <Button
//               variant="contained"
//               sx={{
//                 bgcolor: "#fff",
//                 color: "#000",
//                 borderRadius: "50px",
//                 pl: 1,
//                 pr: 4,
//                 py: 1.5,
//                 fontWeight: 800,
//                 textTransform: "none",
//                 fontSize: "1.1rem",
//                 display: "flex",
//                 gap: 2,
//                 transition: "0.3s",
//                 "&:hover": {
//                   bgcolor: "#a3ff33",
//                   transform: "translateY(-3px)",
//                 },
//               }}
//             >
//               <Box
//                 sx={{
//                   bgcolor: "#000",
//                   borderRadius: "50%",
//                   width: 36,
//                   height: 36,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <SouthIcon
//                   sx={{
//                     color: "#fff",
//                     fontSize: 18,
//                     transform: "rotate(-135deg)",
//                   }}
//                 />
//               </Box>
//               Create Free Landing Page
//             </Button>

//             <Link
//               href="#"
//               sx={{
//                 color: "#fff",
//                 textDecoration: "none",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 1.5,
//                 fontWeight: 600,
//                 fontSize: "1.1rem",
//                 transition: "0.3s",
//                 "&:hover": { color: "#a3ff33" },
//               }}
//             >
//               Explore Listings <SouthIcon sx={{ fontSize: 20 }} />
//             </Link>
//           </Stack>
//         </Container>
//       </Box>
//     </Box>
//   );
// };

// export default TopflowHero;

// //
// //
// //
// //
// //
// //
// //
// //
// //
// //
// //

// import { Typography, Button, Box, Container, Stack, Link } from "@mui/material";
// import SouthIcon from "@mui/icons-material/South";

// const star = "/assets/publicAssets/images/common/star.svg";

// // ✅ Replace this with a REAL mp4 URL or a local public path
// import HERO_VIDEO_SRC from "../../../../public/assets/video/contactBg3.mp4";

// const TopflowHero = () => {
//   return (
//     <Box
//       sx={{
//         backgroundColor: "#000000",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         overflow: "hidden",
//         position: "relative",
//       }}
//     >
//       <Box
//         sx={{
//           minHeight: "100vh",
//           width: "100%",
//           position: "relative",
//           overflow: "hidden",
//           display: "flex",
//           flexDirection: "column",
//         }}
//       >
//         {/* ✅ VIDEO BACKGROUND */}
//         <Box
//           sx={{
//             position: "absolute",
//             inset: 0,
//             zIndex: 0,
//             overflow: "hidden",
//           }}
//         >
//           <Box
//             component="video"
//             autoPlay
//             muted
//             loop
//             playsInline
//             preload="auto"
//             src={HERO_VIDEO_SRC}
//             sx={{
//               width: "100%",
//               height: "100%",
//               objectFit: "cover",
//               display: "block",
//             }}
//           />

//           {/* ✅ Dark overlay for readability */}
//           <Box
//             sx={{
//               position: "absolute",
//               inset: 0,
//               background:
//                 "linear-gradient(180deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.55) 40%, rgba(0,0,0,0.80) 100%)",
//             }}
//           />

//           {/* ✅ Optional subtle star texture on top */}
//           <Box
//             sx={{
//               position: "absolute",
//               inset: 0,
//               backgroundImage: `url(${star})`,
//               backgroundSize: "cover",
//               backgroundPosition: "center",
//               opacity: 0.12,
//               mixBlendMode: "screen",
//               pointerEvents: "none",
//             }}
//           />
//         </Box>

//         {/* ✅ HERO CONTENT */}
//         <Container
//           maxWidth="lg"
//           sx={{
//             position: "relative",
//             zIndex: 1,
//             textAlign: "center",
//             pt: { xs: 18, md: 40 },
//             pb: { xs: 10, md: 10 },
//           }}
//         >
//           <Typography
//             variant="h1"
//             sx={{
//               color: "#fff",
//               fontSize: { xs: "2.6rem", md: "5.5rem" },
//               fontWeight: 900,
//               lineHeight: 1,
//               letterSpacing: "-0.04em",
//               mb: 4,
//             }}
//           >
//             Your Business Website,
//             <br />
//             <span>Auto-Generated.</span>
//           </Typography>

//           <Typography
//             variant="body1"
//             sx={{
//               color: "#cfcfcf",
//               mb: 6,
//               maxWidth: "600px",
//               mx: "auto",
//               fontSize: { xs: "1.05rem", md: "1.2rem" },
//               lineHeight: 1.6,
//             }}
//           >
//             Create a professional landing page instantly with AI—and get your
//             business listed on our directory to reach local customers. No coding
//             needed.
//           </Typography>

//           {/* CTA Buttons */}
//           <Stack
//             direction={{ xs: "column", sm: "row" }}
//             spacing={3}
//             justifyContent="center"
//             alignItems="center"
//             sx={{ mb: 12 }}
//           >
//             <Button
//               variant="contained"
//               sx={{
//                 bgcolor: "#fff",
//                 color: "#000",
//                 borderRadius: "50px",
//                 pl: 1,
//                 pr: 4,
//                 py: 1.5,
//                 fontWeight: 800,
//                 textTransform: "none",
//                 fontSize: "1.1rem",
//                 display: "flex",
//                 gap: 2,
//                 transition: "0.3s",
//                 "&:hover": {
//                   bgcolor: "#a3ff33",
//                   transform: "translateY(-3px)",
//                 },
//               }}
//             >
//               <Box
//                 sx={{
//                   bgcolor: "#000",
//                   borderRadius: "50%",
//                   width: 36,
//                   height: 36,
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                 }}
//               >
//                 <SouthIcon
//                   sx={{
//                     color: "#fff",
//                     fontSize: 18,
//                     transform: "rotate(-135deg)",
//                   }}
//                 />
//               </Box>
//               Create Free Landing Page
//             </Button>

//             <Link
//               href="#"
//               sx={{
//                 color: "#fff",
//                 textDecoration: "none",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 1.5,
//                 fontWeight: 600,
//                 fontSize: "1.1rem",
//                 transition: "0.3s",
//                 "&:hover": { color: "#a3ff33" },
//               }}
//             >
//               Explore Listings <SouthIcon sx={{ fontSize: 20 }} />
//             </Link>
//           </Stack>
//         </Container>
//       </Box>
//     </Box>
//   );
// };

// export default TopflowHero;

//
//
//
//
//
//
//
//

// import React from "react";
// import { Box, Typography, Button, Container, Stack, Grid } from "@mui/material";
// import { keyframes } from "@mui/system";
// import EastIcon from "@mui/icons-material/East";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// const star = "/assets/publicAssets/images/common/star.svg";

// // Aapki image ka path
// const globeImg =
//   "../../../../public/assets/publicAssets/images/ContactUs/earthblack.png";

// // ── Animations ────────────────────────────────────────────────────────────────
// const fadeIn = keyframes`
//   from { opacity: 0; transform: translateY(30px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

// const pulseGlow = keyframes`
//   0%, 100% { opacity: 0.4; transform: scale(1) translateX(-50%); }
//   50% { opacity: 0.7; transform: scale(1.1) translateX(-50%); }
// `;

// const ContactHero = () => {
//   return (
//     <Box
//       sx={{
//         backgroundColor: "#000",
//         backgroundImage: `url(${star})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "flex-start",
//         position: "relative",
//         overflow: "hidden",
//         color: "#fff",
//         pt: { xs: 5, md: 2 },
//       }}
//     >
//       {/* ── BACKGROUND EARTH DESIGN ── */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: "-15%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           width: { xs: "180%", md: "1100px" },
//           zIndex: 1,
//           pointerEvents: "none",
//           WebkitMaskImage:
//             "radial-gradient(circle at 50% 20%, black 30%, transparent 65%)",
//           maskImage:
//             "radial-gradient(circle at 50% 20%, black 30%, transparent 65%)",
//         }}
//       >
//         <Box
//           component="img"
//           src={globeImg}
//           alt="Business Network"
//           sx={{
//             width: "100%",
//             height: "auto",
//             display: "block",
//             // filter: "brightness(0.6) contrast(1.2) hue-rotate(140deg)", // Cyan/Teal tone for AI vibe
//           }}
//         />
//       </Box>

//       {/* Atmospheric Glow */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: "0",
//           left: "50%",
//           width: "800px",
//           height: "400px",
//           background:
//             "radial-gradient(ellipse at center, rgba(0, 210, 255, 0.15) 0%, transparent 70%)",
//           filter: "blur(90px)",
//           zIndex: 0,
//           animation: `${pulseGlow} 8s ease-in-out infinite`,
//         }}
//       />

//       {/* ── CONTENT LAYER ── */}
//       <Container
//         maxWidth="md"
//         sx={{
//           position: "relative",
//           zIndex: 10,
//           textAlign: "center",
//           mt: { xs: 25, md: 35 },
//         }}
//       >
//         {/* Eyebrow Tag: Focus on the AI USP */}
//         <Stack
//           direction="row"
//           spacing={1}
//           alignItems="center"
//           justifyContent="center"
//           sx={{ mb: 4, animation: `${fadeIn} 0.8s ease-out`, opacity: 0.9 }}
//         >
//           <AutoAwesomeIcon sx={{ fontSize: 18, color: "#ffffff" }} />
//           <Typography
//             sx={{
//               fontSize: "0.9rem",
//               color: "rgb(255, 255, 255)",
//               letterSpacing: 1,
//               textTransform: "uppercase",
//               fontWeight: 600,
//             }}
//           >
//             AI-Powered <strong>Business Presence</strong>
//           </Typography>
//         </Stack>

//         {/* Updated Headline: Focus on Landing Page First */}
//         <Typography
//           variant="h1"
//           sx={{
//             fontSize: { xs: "2.5rem", md: "5rem" },
//             fontWeight: 700,
//             mb: 3,
//             background: "linear-gradient(180deg, #FFFFFF 50%, #009c60 100%)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             letterSpacing: "-0.03em",
//             lineHeight: 1.1,
//             animation: `${fadeIn} 1s ease-out`,
//           }}
//         >
//           Your Business Website, <br /> Auto-Generated.
//         </Typography>

//         {/* Sub-description: Bridging Landing Page + Directory */}
//         <Typography
//           sx={{
//             fontSize: { xs: "1rem", md: "1.2rem" },
//             color: "rgba(255, 255, 255, 1)",
//             maxWidth: "600px",
//             mx: "auto",
//             mb: 6,
//             fontWeight: 400,
//             lineHeight: 1.7,
//             animation: `${fadeIn} 1.2s ease-out`,
//           }}
//         >
//           Create a professional landing page instantly with AI — and get your
//           business listed on our directory to reach local customers. No coding
//           needed.
//         </Typography>

//         {/* Action Buttons: Create Landing Page is Main CTA */}
//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={2}
//           justifyContent="center"
//           sx={{ mb: 15, animation: `${fadeIn} 1.4s ease-out` }}
//         >
//           <Button
//             variant="contained"
//             endIcon={<EastIcon />}
//             sx={{
//               bgcolor: "#fff",
//               color: "#000",
//               borderRadius: "50px",
//               px: 4,
//               py: 2,
//               fontWeight: 700,
//               textTransform: "none",
//               fontSize: "1rem",
//               "&:hover": { bgcolor: "#f0f0f0", transform: "translateY(-2px)" },
//               transition: "all 0.3s",
//             }}
//           >
//             Create Free Landing Page
//           </Button>

//           <Button
//             variant="outlined"
//             sx={{
//               borderColor: "rgba(255,255,255,0.2)",
//               color: "#fff",
//               borderRadius: "50px",
//               px: 4,
//               py: 2,
//               fontWeight: 600,
//               textTransform: "none",
//               fontSize: "1rem",
//               "&:hover": {
//                 borderColor: "#fff",
//                 bgcolor: "rgba(255,255,255,0.05)",
//               },
//             }}
//           >
//             Explore Listings
//           </Button>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default ContactHero;

//
//
//
//
//
//
//
//
//
//

// import React from "react";
// import { Box, Typography, Button, Container, Stack } from "@mui/material";
// import { keyframes } from "@mui/system";
// import EastIcon from "@mui/icons-material/East";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// const star = "/assets/publicAssets/images/common/star.svg";

// const globeImg =
//   "../../../../public/assets/publicAssets/images/ContactUs/earthblack.png";

// // ── Animations ────────────────────────────────────────────────────────────────
// const fadeIn = keyframes`
//   from { opacity: 0; transform: translateY(30px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

// const pulseGlow = keyframes`
//   0%, 100% { opacity: 0.35; transform: scale(1) translateX(-50%); }
//   50% { opacity: 0.65; transform: scale(1.1) translateX(-50%); }
// `;

// const ContactHero = () => {
//   return (
//     <Box
//       sx={{
//         backgroundColor: "#000",
//         backgroundImage: `url(${star})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "flex-start",
//         position: "relative",
//         overflow: "hidden",
//         color: "#fff",
//         pt: { xs: 5, md: 2 },
//       }}
//     >
//       {/* ───────────────────────────── */}
//       {/* 🌌 PREMIUM BACKGROUND LAYERS */}
//       {/* ───────────────────────────── */}

//       {/* Teal Atmospheric Aura */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: "-10%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           width: "1200px",
//           height: "600px",
//           background:
//             "radial-gradient(ellipse at center, rgba(55,140,146,0.25) 0%, rgba(55,140,146,0.15) 40%, transparent 75%)",
//           filter: "blur(120px)",
//           zIndex: 0,
//           animation: `${pulseGlow} 10s ease-in-out infinite`,
//         }}
//       />

//       {/* Vertical Light Beam */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: "50%",
//           transform: "translateX(-50%)",
//           width: "2px",
//           height: "100%",
//           background:
//             "linear-gradient(to bottom, rgba(55,140,146,0.5), transparent)",
//           opacity: 0.3,
//           zIndex: 1,
//         }}
//       />

//       {/* Bottom Fog Layer */}
//       <Box
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "40%",
//           background:
//             "linear-gradient(to top, rgba(55,140,146,0.2), transparent)",
//           zIndex: 1,
//         }}
//       />

//       {/* ───────────────────────────── */}
//       {/* 🌍 EARTH IMAGE */}
//       {/* ───────────────────────────── */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: "-15%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           width: { xs: "180%", md: "1100px" },
//           zIndex: 2,
//           pointerEvents: "none",
//           WebkitMaskImage:
//             "radial-gradient(circle at 50% 20%, black 30%, transparent 65%)",
//           maskImage:
//             "radial-gradient(circle at 50% 20%, black 30%, transparent 65%)",
//         }}
//       >
//         <Box
//           component="img"
//           src={globeImg}
//           alt="Business Network"
//           sx={{
//             width: "100%",
//             height: "auto",
//             display: "block",
//             filter:
//               "brightness(0.7) contrast(1.1) saturate(1.2) hue-rotate(10deg)",
//             opacity: 0.9,
//           }}
//         />
//       </Box>

//       {/* ───────────────────────────── */}
//       {/* 📝 CONTENT */}
//       {/* ───────────────────────────── */}
//       <Container
//         maxWidth="md"
//         sx={{
//           position: "relative",
//           zIndex: 10,
//           textAlign: "center",
//           mt: { xs: 25, md: 35 },
//         }}
//       >
//         <Stack
//           direction="row"
//           spacing={1}
//           alignItems="center"
//           justifyContent="center"
//           sx={{ mb: 4, animation: `${fadeIn} 0.8s ease-out`, opacity: 0.9 }}
//         >
//           <AutoAwesomeIcon sx={{ fontSize: 18, color: "#ffffff" }} />
//           <Typography
//             sx={{
//               fontSize: "0.9rem",
//               color: "#ffffff",
//               letterSpacing: 1,
//               textTransform: "uppercase",
//               fontWeight: 600,
//             }}
//           >
//             AI-Powered <strong>Business Presence</strong>
//           </Typography>
//         </Stack>

//         <Typography
//           variant="h1"
//           sx={{
//             fontSize: { xs: "2.5rem", md: "5rem" },
//             fontWeight: 700,
//             mb: 3,
//             background: "linear-gradient(180deg, #FFFFFF 40%, #378C92 120%)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             letterSpacing: "-0.03em",
//             lineHeight: 1.1,
//             animation: `${fadeIn} 1s ease-out`,
//           }}
//         >
//           Your Business Website, <br /> Auto-Generated.
//         </Typography>

//         <Typography
//           sx={{
//             fontSize: { xs: "1rem", md: "1.2rem" },
//             color: "rgba(255, 255, 255, 0.9)",
//             maxWidth: "600px",
//             mx: "auto",
//             mb: 6,
//             fontWeight: 400,
//             lineHeight: 1.7,
//             animation: `${fadeIn} 1.2s ease-out`,
//           }}
//         >
//           Create a professional landing page instantly with AI — and get your
//           business listed on our directory to reach local customers. No coding
//           needed.
//         </Typography>

//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={2}
//           justifyContent="center"
//           sx={{ mb: 15, animation: `${fadeIn} 1.4s ease-out` }}
//         >
//           <Button
//             variant="contained"
//             endIcon={<EastIcon />}
//             sx={{
//               bgcolor: "#fff",
//               color: "#000",
//               borderRadius: "50px",
//               px: 4,
//               py: 2,
//               fontWeight: 700,
//               textTransform: "none",
//               fontSize: "1rem",
//               "&:hover": {
//                 bgcolor: "#f0f0f0",
//                 transform: "translateY(-2px)",
//               },
//               transition: "all 0.3s",
//             }}
//           >
//             Create Free Landing Page
//           </Button>

//           <Button
//             variant="outlined"
//             sx={{
//               borderColor: "rgba(255,255,255,0.3)",
//               color: "#fff",
//               borderRadius: "50px",
//               px: 4,
//               py: 2,
//               fontWeight: 600,
//               textTransform: "none",
//               fontSize: "1rem",
//               "&:hover": {
//                 borderColor: "#fff",
//                 bgcolor: "rgba(255,255,255,0.05)",
//               },
//             }}
//           >
//             Explore Listings
//           </Button>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default ContactHero;

// import React from "react";
// import { Box, Typography, Button, Container, Stack } from "@mui/material";
// import { keyframes } from "@mui/system";
// import EastIcon from "@mui/icons-material/East";
// import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

// const star = "/assets/publicAssets/images/common/star.svg";

// const globeImg =
//   "../../../../public/assets/publicAssets/images/ContactUs/earthblack.png";

// // ── Animations ────────────────────────────────────────────────────────────────
// const fadeIn = keyframes`
//   from { opacity: 0; transform: translateY(30px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

// const pulseGlow = keyframes`
//   0%, 100% { opacity: 0.35; transform: scale(1) translateX(-50%); }
//   50% { opacity: 0.65; transform: scale(1.1) translateX(-50%); }
// `;

// // subtle drift for background arcs
// const arcDrift = keyframes`
//   0%, 100% { transform: translate3d(0px, 0px, 0); opacity: 0.9; }
//   50% { transform: translate3d(0px, 10px, 0); opacity: 1; }
// `;

// // moving bright streak across one arc (like your image)
// const streakMove = keyframes`
//   0%   { stroke-dashoffset: 420; opacity: 0; }
//   10%  { opacity: 1; }
//   60%  { opacity: 1; }
//   100% { stroke-dashoffset: 0; opacity: 0; }
// `;

// const dotMove = keyframes`
//   0%   { transform: translate3d(-30px, 0px, 0); opacity: 0; }
//   12%  { opacity: 1; }
//   65%  { opacity: 1; }
//   100% { transform: translate3d(520px, 0px, 0); opacity: 0; }
// `;

// const ContactHero = () => {
//   return (
//     <Box
//       sx={{
//         backgroundColor: "#000",
//         backgroundImage: `url(${star})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         minHeight: "100vh",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         justifyContent: "flex-start",
//         position: "relative",
//         overflow: "hidden",
//         color: "#fff",
//         pt: { xs: 5, md: 2 },
//       }}
//     >
//       {/* ───────────────────────────── */}
//       {/* 🌌 PREMIUM BACKGROUND LAYERS */}
//       {/* ───────────────────────────── */}

//       {/* Teal Atmospheric Aura */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: "-10%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           width: "1200px",
//           height: "600px",
//           background:
//             "radial-gradient(ellipse at center, rgba(55,140,146,0.25) 0%, rgba(55,140,146,0.15) 40%, transparent 75%)",
//           filter: "blur(120px)",
//           zIndex: 0,
//           animation: `${pulseGlow} 10s ease-in-out infinite`,
//         }}
//       />

//       {/* ✅ LEFT CURVED LAYERS (thin + subtle like attached image) */}
//       <Box
//         sx={{
//           position: "absolute",
//           inset: 0,
//           zIndex: 1, // behind globe & content
//           pointerEvents: "none",
//           animation: `${arcDrift} 10s ease-in-out infinite`,
//           opacity: 0.9,
//           "@media (max-width:600px)": { opacity: 0.6 },
//         }}
//       >
//         <svg
//           width="100%"
//           height="100%"
//           viewBox="0 0 1440 900"
//           preserveAspectRatio="none"
//           xmlns="http://www.w3.org/2000/svg"
//           style={{ display: "block" }}
//         >
//           <defs>
//             {/* main thin line gradient (soft teal) */}
//             <linearGradient id="thinTeal" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0" stopColor="rgba(55,140,146,0.00)" />
//               <stop offset="0.15" stopColor="rgba(55,140,146,0.18)" />
//               <stop offset="0.45" stopColor="rgba(55,140,146,0.22)" />
//               <stop offset="1" stopColor="rgba(55,140,146,0.00)" />
//             </linearGradient>

//             {/* bright streak gradient */}
//             <linearGradient id="streakTeal" x1="0" y1="0" x2="1" y2="0">
//               <stop offset="0" stopColor="rgba(55,140,146,0.00)" />
//               <stop offset="0.35" stopColor="rgba(190,255,245,0.75)" />
//               <stop offset="0.6" stopColor="rgba(55,140,146,0.95)" />
//               <stop offset="1" stopColor="rgba(55,140,146,0.00)" />
//             </linearGradient>

//             {/* soft glow */}
//             <filter id="arcGlow" x="-40%" y="-40%" width="180%" height="180%">
//               <feGaussianBlur stdDeviation="1.6" result="b" />
//               <feMerge>
//                 <feMergeNode in="b" />
//                 <feMergeNode in="SourceGraphic" />
//               </feMerge>
//             </filter>

//             {/* path for highlight animation */}
//             <path
//               id="highlightPath"
//               d="M-120 520 C 120 470, 320 430, 640 405"
//             />
//           </defs>

//           {/* Thin arcs from LEFT */}
//           <g filter="url(#arcGlow)">
//             <path
//               d="M-160 210 C 120 180, 320 160, 650 150"
//               stroke="url(#thinTeal)"
//               strokeWidth="2"
//               strokeLinecap="round"
//               fill="none"
//               opacity="0.55"
//             />
//             <path
//               d="M-160 300 C 120 270, 320 250, 700 240"
//               stroke="url(#thinTeal)"
//               strokeWidth="2"
//               strokeLinecap="round"
//               fill="none"
//               opacity="0.5"
//             />
//             <path
//               d="M-180 420 C 110 390, 330 360, 760 340"
//               stroke="url(#thinTeal)"
//               strokeWidth="2"
//               strokeLinecap="round"
//               fill="none"
//               opacity="0.5"
//             />
//             <path
//               d="M-200 560 C 90 520, 340 480, 820 455"
//               stroke="url(#thinTeal)"
//               strokeWidth="2"
//               strokeLinecap="round"
//               fill="none"
//               opacity="0.55"
//             />
//           </g>

//           {/* Bright streak on one arc (like the attached image) */}
//           <g filter="url(#arcGlow)">
//             {/* base faint line */}
//             <use
//               href="#highlightPath"
//               stroke="rgba(55,140,146,0.20)"
//               strokeWidth="2"
//               strokeLinecap="round"
//               fill="none"
//               opacity="0.7"
//             />

//             {/* animated streak line (dash) */}
//             <use
//               href="#highlightPath"
//               stroke="url(#streakTeal)"
//               strokeWidth="3"
//               strokeLinecap="round"
//               fill="none"
//               style={{
//                 strokeDasharray: "80 360",
//                 animation: `${streakMove} 4.6s ease-in-out infinite`,
//               }}
//               opacity="0.95"
//             />

//             {/* moving dot near streak */}
//             <circle
//               r="3.2"
//               fill="rgba(220,255,250,0.95)"
//               opacity="0"
//               style={{
//                 transformOrigin: "0 0",
//                 animation: `${dotMove} 4.6s ease-in-out infinite`,
//               }}
//             >
//               {/* dot starts roughly on the highlight path area */}
//               <animate
//                 attributeName="cx"
//                 values="-10; 520"
//                 dur="4.6s"
//                 repeatCount="indefinite"
//               />
//               <animate
//                 attributeName="cy"
//                 values="515; 405"
//                 dur="4.6s"
//                 repeatCount="indefinite"
//               />
//               <animate
//                 attributeName="opacity"
//                 values="0;1;1;0"
//                 keyTimes="0;0.12;0.65;1"
//                 dur="4.6s"
//                 repeatCount="indefinite"
//               />
//             </circle>
//           </g>
//         </svg>
//       </Box>

//       {/* Vertical Light Beam */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: "50%",
//           transform: "translateX(-50%)",
//           width: "2px",
//           height: "100%",
//           background:
//             "linear-gradient(to bottom, rgba(55,140,146,0.5), transparent)",
//           opacity: 0.3,
//           zIndex: 1,
//         }}
//       />

//       {/* Bottom Fog Layer */}
//       <Box
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "40%",
//           background:
//             "linear-gradient(to top, rgba(55,140,146,0.2), transparent)",
//           zIndex: 1,
//         }}
//       />

//       {/* ───────────────────────────── */}
//       {/* 🌍 EARTH IMAGE */}
//       {/* ───────────────────────────── */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: "-15%",
//           left: "50%",
//           transform: "translateX(-50%)",
//           width: { xs: "180%", md: "1100px" },
//           zIndex: 2,
//           pointerEvents: "none",
//           WebkitMaskImage:
//             "radial-gradient(circle at 50% 20%, black 30%, transparent 65%)",
//           maskImage:
//             "radial-gradient(circle at 50% 20%, black 30%, transparent 65%)",
//         }}
//       >
//         <Box
//           component="img"
//           src={globeImg}
//           alt="Business Network"
//           sx={{
//             width: "100%",
//             height: "auto",
//             display: "block",
//             filter:
//               "brightness(0.7) contrast(1.1) saturate(1.2) hue-rotate(10deg)",
//             opacity: 0.9,
//           }}
//         />
//       </Box>

//       {/* ───────────────────────────── */}
//       {/* 📝 CONTENT */}
//       {/* ───────────────────────────── */}
//       <Container
//         maxWidth="md"
//         sx={{
//           position: "relative",
//           zIndex: 10,
//           textAlign: "center",
//           mt: { xs: 25, md: 35 },
//         }}
//       >
//         <Stack
//           direction="row"
//           spacing={1}
//           alignItems="center"
//           justifyContent="center"
//           sx={{ mb: 4, animation: `${fadeIn} 0.8s ease-out`, opacity: 0.9 }}
//         >
//           <AutoAwesomeIcon sx={{ fontSize: 18, color: "#ffffff" }} />
//           <Typography
//             sx={{
//               fontSize: "0.9rem",
//               color: "#ffffff",
//               letterSpacing: 1,
//               textTransform: "uppercase",
//               fontWeight: 600,
//             }}
//           >
//             AI-Powered <strong>Business Presence</strong>
//           </Typography>
//         </Stack>

//         <Typography
//           variant="h1"
//           sx={{
//             fontSize: { xs: "2.5rem", md: "5rem" },
//             fontWeight: 700,
//             mb: 3,
//             background: "linear-gradient(180deg, #FFFFFF 40%, #378C92 120%)",
//             WebkitBackgroundClip: "text",
//             WebkitTextFillColor: "transparent",
//             letterSpacing: "-0.03em",
//             lineHeight: 1.1,
//             animation: `${fadeIn} 1s ease-out`,
//           }}
//         >
//           Your Business Website, <br /> Auto-Generated.
//         </Typography>

//         <Typography
//           sx={{
//             fontSize: { xs: "1rem", md: "1.2rem" },
//             color: "rgba(255, 255, 255, 0.9)",
//             maxWidth: "600px",
//             mx: "auto",
//             mb: 6,
//             fontWeight: 400,
//             lineHeight: 1.7,
//             animation: `${fadeIn} 1.2s ease-out`,
//           }}
//         >
//           Create a professional landing page instantly with AI — and get your
//           business listed on our directory to reach local customers. No coding
//           needed.
//         </Typography>

//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={2}
//           justifyContent="center"
//           sx={{ mb: 15, animation: `${fadeIn} 1.4s ease-out` }}
//         >
//           <Button
//             variant="contained"
//             endIcon={<EastIcon />}
//             sx={{
//               bgcolor: "#fff",
//               color: "#000",
//               borderRadius: "50px",
//               px: 4,
//               py: 2,
//               fontWeight: 700,
//               textTransform: "none",
//               fontSize: "1rem",
//               "&:hover": {
//                 bgcolor: "#f0f0f0",
//                 transform: "translateY(-2px)",
//               },
//               transition: "all 0.3s",
//             }}
//           >
//             Create Free Landing Page
//           </Button>

//           <Button
//             variant="outlined"
//             sx={{
//               borderColor: "rgba(255,255,255,0.3)",
//               color: "#fff",
//               borderRadius: "50px",
//               px: 4,
//               py: 2,
//               fontWeight: 600,
//               textTransform: "none",
//               fontSize: "1rem",
//               "&:hover": {
//                 borderColor: "#fff",
//                 bgcolor: "rgba(255,255,255,0.05)",
//               },
//             }}
//           >
//             Explore Listings
//           </Button>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default ContactHero;

//
//
//
//
//
//

import React from "react";
import { Box, Typography, Button, Container, Stack } from "@mui/material";
import { keyframes } from "@mui/system";
import EastIcon from "@mui/icons-material/East";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PublicIcon from "@mui/icons-material/Public";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import EmailIcon from "@mui/icons-material/Email";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";

const star = "/assets/publicAssets/images/common/star.svg";
const globeImg = "/assets/publicAssets/images/ContactUs/earthblack.png";

// ── Animations ────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(40px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;
const pulseGlow = keyframes`
  0%, 100% { opacity: 0.3; transform: scale(1) translateX(-50%); }
  50%       { opacity: 0.6; transform: scale(1.08) translateX(-50%); }
`;
const arcDrift = keyframes`
  0%, 100% { transform: translate3d(0px, 0px, 0); }
  50%       { transform: translate3d(0px, 10px, 0); }
`;
const streakMove = keyframes`
  0%   { stroke-dashoffset: 420; opacity: 0; }
  10%  { opacity: 1; }
  60%  { opacity: 1; }
  100% { stroke-dashoffset: 0; opacity: 0; }
`;
const floatY = keyframes`
  0%, 100% { transform: translateX(-50%) translateY(0px); }
  50%       { transform: translateX(-50%) translateY(-8px); }
`;
const spinSlow = keyframes`
  from { transform: translateX(-50%) rotate(0deg); }
  to   { transform: translateX(-50%) rotate(360deg); }
`;
const blinkDot = keyframes`
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
`;
const cardSlide = keyframes`
  from { opacity: 0; transform: translateX(-30px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const cardSlideRight = keyframes`
  from { opacity: 0; transform: translateX(30px); }
  to   { opacity: 1; transform: translateX(0); }
`;

// ── Floating Metric Card ───────────────────────────────────
const MetricCard = ({
  value,
  label,
  icon,
  sx,
  animDelay = "0s",
  slideDir = "left",
}) => (
  <Box
    sx={{
      position: "absolute",
      backdropFilter: "blur(20px)",
      background:
        "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(55,140,146,0.12) 100%)",
      border: "1px solid rgba(55,140,146,0.35)",
      borderRadius: "16px",
      p: "14px 18px",
      display: "flex",
      alignItems: "center",
      gap: 1.5,
      minWidth: "165px",
      boxShadow:
        "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
      animation: `${slideDir === "left" ? cardSlide : cardSlideRight} 0.9s ease-out ${animDelay} both`,
      zIndex: 12,
      ...sx,
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "10px",
        background: "linear-gradient(135deg, #378C92, #1a5a5e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        boxShadow: "0 4px 12px rgba(55,140,146,0.5)",
      }}
    >
      {icon}
    </Box>
    <Box>
      <Typography
        sx={{
          fontSize: "1.2rem",
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1,
        }}
      >
        {value}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.7rem",
          color: "rgba(255,255,255,0.55)",
          mt: "2px",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Typography>
    </Box>
  </Box>
);

// ── Trust Badge ────────────────────────────────────────────
const TrustBadge = ({ text }) => (
  <Stack direction="row" spacing={0.8} alignItems="center">
    <CheckCircleOutlineIcon sx={{ fontSize: 15, color: "#ffffff" }} />
    <Typography sx={{ fontSize: "0.78rem", color: "rgb(255, 255, 255)" }}>
      {text}
    </Typography>
  </Stack>
);

// ── Main Component ─────────────────────────────────────────
const ContactHero = () => {
  return (
    <Box
      sx={{
        backgroundColor: "#030d0d",
        backgroundImage: `url(${star})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        position: "relative",
        overflow: "hidden",
        color: "#fff",
        pt: { xs: 5, md: 2 },
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Space+Mono:wght@400;700&display=swap');`}</style>

      {/* Radial Teal Aura */}
      <Box
        sx={{
          position: "absolute",
          top: "-5%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "1400px",
          height: "700px",
          background:
            "radial-gradient(ellipse at center, rgba(55,140,146,0.22) 0%, rgba(55,140,146,0.10) 45%, transparent 72%)",
          filter: "blur(100px)",
          zIndex: 0,
          animation: `${pulseGlow} 10s ease-in-out infinite`,
        }}
      />

      {/* Bottom fog */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "50%",
          background:
            "linear-gradient(to top, rgba(10,40,42,0.9) 0%, transparent 100%)",
          zIndex: 1,
        }}
      />

      {/* Grid overlay */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.04,
          backgroundImage: `linear-gradient(rgba(55,140,146,1) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(55,140,146,1) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* SVG Arcs */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          animation: `${arcDrift} 12s ease-in-out infinite`,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="thinTeal2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(55,140,146,0.00)" />
              <stop offset="0.2" stopColor="rgba(55,140,146,0.25)" />
              <stop offset="0.55" stopColor="rgba(55,140,146,0.30)" />
              <stop offset="1" stopColor="rgba(55,140,146,0.00)" />
            </linearGradient>
            <linearGradient id="streakTeal2" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="rgba(55,140,146,0.00)" />
              <stop offset="0.4" stopColor="rgba(190,255,245,0.85)" />
              <stop offset="0.65" stopColor="rgba(55,140,146,0.95)" />
              <stop offset="1" stopColor="rgba(55,140,146,0.00)" />
            </linearGradient>
            <linearGradient id="rightTeal" x1="1" y1="0" x2="0" y2="0">
              <stop offset="0" stopColor="rgba(55,140,146,0.00)" />
              <stop offset="0.2" stopColor="rgba(55,140,146,0.22)" />
              <stop offset="0.55" stopColor="rgba(55,140,146,0.28)" />
              <stop offset="1" stopColor="rgba(55,140,146,0.00)" />
            </linearGradient>
            <filter id="arcGlow2" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="1.8" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#arcGlow2)">
            <path
              d="M-160 150 C 120 130, 320 115, 660 108"
              stroke="url(#thinTeal2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M-160 260 C 120 235, 340 215, 720 205"
              stroke="url(#thinTeal2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.55"
            />
            <path
              d="M-180 390 C 100 360, 340 335, 780 318"
              stroke="url(#thinTeal2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M-200 540 C 80 505, 350 470, 840 448"
              stroke="url(#thinTeal2)"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M-200 700 C 60 660, 360 615, 900 590"
              stroke="url(#thinTeal2)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.4"
            />
          </g>
          <g filter="url(#arcGlow2)">
            <path
              d="M1600 150 C 1320 130, 1120 115, 780 108"
              stroke="url(#rightTeal)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M1600 300 C 1300 275, 1100 255, 720 245"
              stroke="url(#rightTeal)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.45"
            />
            <path
              d="M1600 480 C 1290 450, 1080 420, 680 405"
              stroke="url(#rightTeal)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.4"
            />
            <path
              d="M1600 680 C 1270 645, 1060 608, 640 590"
              stroke="url(#rightTeal)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
              opacity="0.35"
            />
          </g>
          <g filter="url(#arcGlow2)">
            <path
              id="hp2"
              d="M-120 540 C 120 500, 330 465, 650 445"
              stroke="rgba(55,140,146,0.2)"
              strokeWidth="2"
              fill="none"
            />
            <use
              href="#hp2"
              stroke="url(#streakTeal2)"
              strokeWidth="3"
              fill="none"
              style={{
                strokeDasharray: "90 380",
                animation: `${streakMove} 5s ease-in-out infinite`,
              }}
            />
          </g>
          <line
            x1="720"
            y1="0"
            x2="720"
            y2="900"
            stroke="rgba(55,140,146,0.12)"
            strokeWidth="1"
            strokeDasharray="6 12"
          />
        </svg>
      </Box>

      {/* Spinning orbit ring */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "2%", md: "-8%" },
          left: "50%",
          width: { xs: "380px", md: "820px" },
          height: { xs: "380px", md: "820px" },
          borderRadius: "50%",
          border: "1px dashed rgba(55,140,146,0.18)",
          zIndex: 2,
          animation: `${spinSlow} 60s linear infinite`,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: "6%",
            left: "50%",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#378C92",
            boxShadow: "0 0 12px 4px rgba(55,140,146,0.7)",
            animation: `${blinkDot} 2s ease-in-out infinite`,
          }}
        />
      </Box>

      {/* Globe */}
      <Box
        sx={{
          position: "absolute",
          top: { xs: "-8%", md: "-18%" },
          left: "50%",
          width: { xs: "100%", md: "1100px" },
          zIndex: 3,
          pointerEvents: "none",
          WebkitMaskImage:
            "radial-gradient(circle at 50% 22%, black 28%, transparent 62%)",
          maskImage:
            "radial-gradient(circle at 50% 22%, black 28%, transparent 62%)",
          animation: `${floatY} 8s ease-in-out infinite`,
        }}
      >
        <Box
          component="img"
          src={globeImg}
          alt="Global Business Network"
          sx={{
            width: "100%",
            height: "auto",
            display: "block",
            filter:
              "brightness(0.75) contrast(1.15) saturate(1.3) hue-rotate(5deg)",
          }}
        />
      </Box>

      {/* ── Floating Metric Cards ── */}
      {/* LEFT */}
      <MetricCard
        value="24/7"
        label="Support Access"
        icon={<SupportAgentIcon sx={{ fontSize: 18, color: "#fff" }} />}
        sx={{
          top: { xs: "auto", md: "30%" },
          left: { xs: "auto", md: "5%" },
          display: { xs: "none", md: "flex" },
        }}
        animDelay="0.6s"
        slideDir="left"
      />
      <MetricCard
        value="Email"
        label="Direct Inquiries"
        icon={<EmailIcon sx={{ fontSize: 18, color: "#fff" }} />}
        sx={{
          top: { xs: "auto", md: "47%" },
          left: { xs: "auto", md: "3%" },
          display: { xs: "none", md: "flex" },
        }}
        animDelay="0.9s"
        slideDir="left"
      />
      {/* RIGHT */}
      <MetricCard
        value="Docs"
        label="Self-Help Center"
        icon={<MenuBookIcon sx={{ fontSize: 18, color: "#fff" }} />}
        sx={{
          top: { xs: "auto", md: "33%" },
          right: { xs: "auto", md: "4%" },
          display: { xs: "none", md: "flex" },
        }}
        animDelay="0.7s"
        slideDir="right"
      />
      <MetricCard
        value="< 2 hrs"
        label="Avg. Response Time"
        icon={<AccessTimeIcon sx={{ fontSize: 18, color: "#fff" }} />}
        sx={{
          top: { xs: "auto", md: "50%" },
          right: { xs: "auto", md: "2%" },
          display: { xs: "none", md: "flex" },
        }}
        animDelay="1s"
        slideDir="right"
      />

      {/* ── Main Content ── */}
      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          mt: { xs: 22, md: 34 },
        }}
      >
        {/* Eyebrow badge */}
        <Box sx={{ animation: `${fadeUp} 0.7s ease-out both`, mb: 3 }}>
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2.5,
              py: 0.9,
              background:
                "linear-gradient(135deg, rgba(55,140,146,0.2), rgba(55,140,146,0.08))",
              border: "1px solid rgba(55,140,146,0.4)",
              borderRadius: "50px",
              backdropFilter: "blur(12px)",
            }}
          >
            <PublicIcon sx={{ fontSize: 14, color: "#55c5cc" }} />
            <Typography
              sx={{
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                color: "#ffffff",
                letterSpacing: 2,
                textTransform: "uppercase",
                fontWeight: 700,
                fontFamily: "'Space Mono', monospace",
              }}
            >
              Contact our global team
            </Typography>
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#55c5cc",
                boxShadow: "0 0 8px #55c5cc",
                animation: `${blinkDot} 1.8s ease-in-out infinite`,
              }}
            />
          </Box>
        </Box>

        {/* Headline */}
        <Box sx={{ animation: `${fadeUp} 0.9s ease-out 0.15s both` }}>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", sm: "2.8rem", md: "5rem" },
              fontWeight: 800,
              mb: 1,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#fff",
            }}
          >
            Let’s Start a
          </Typography>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", sm: "2.8rem", md: "5rem" },
              fontWeight: 800,
              mb: 3,
              fontFamily: "'DM Sans', sans-serif",
              letterSpacing: "-0.04em",
              lineHeight: 1.05,
              color: "#fff",
            }}
          >
            Conversation Today.
          </Typography>
        </Box>

        {/* Sub-description */}
        <Typography
          sx={{
            fontSize: { xs: "1rem", md: "1.15rem" },
            color: "rgb(255, 255, 255)",
            maxWidth: "600px",
            mx: "auto",
            mb: 4,
            fontWeight: 400,
            lineHeight: 1.85,
            animation: `${fadeUp} 0.9s ease-out 0.3s both`,
          }}
        >
          Have questions about your{" "}
          <Box component="span" sx={{ color: "#ffffff", fontWeight: 600 }}>
            online presence
          </Box>{" "}
          or need assistance? Our team is ready to support your business growth
          and answer any questions about our{" "}
          <Box component="span" sx={{ color: "#ffffff", fontWeight: 600 }}>
            directory features.
          </Box>
        </Typography>

        {/* CTA Buttons */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          sx={{
            mb: 4,
            animation: `${fadeUp} 0.9s ease-out 0.45s both`,
            px: { xs: 7, sm: 0 },
          }}
        >
          <Button
            variant="contained"
            endIcon={<EastIcon />}
            sx={{
              background: "linear-gradient(135deg, #378C92 0%, #2a6e73 100%)",
              color: "#fff",
              borderRadius: "50px",
              px: 4,
              py: 1.8,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "0.8rem",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow:
                "0 4px 24px rgba(55,140,146,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
              border: "1px solid rgba(55,140,146,0.6)",
              "&:hover": {
                background: "linear-gradient(135deg, #4aa8ae 0%, #378C92 100%)",
                transform: "translateY(-2px)",
                boxShadow: "0 8px 32px rgba(55,140,146,0.6)",
              },
              transition: "all 0.3s",
            }}
          >
            Submit an Inquiry
          </Button>

          <Button
            variant="outlined"
            sx={{
              borderColor: "rgba(255,255,255,0.2)",
              color: "#fff",
              borderRadius: "50px",
              px: 4,
              py: 1.8,
              fontWeight: 600,
              textTransform: "none",
              fontSize: "0.8rem",
              fontFamily: "'DM Sans', sans-serif",
              backdropFilter: "blur(12px)",
              background: "rgba(255,255,255,0.04)",
              "&:hover": {
                borderColor: "rgba(55,140,146,0.7)",
                bgcolor: "rgba(55,140,146,0.1)",
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s",
            }}
          >
            Visit Help Center
          </Button>
        </Stack>

        {/* Trust badges */}
        <Stack
          direction="row"
          spacing={3}
          justifyContent="center"
          flexWrap="wrap"
          sx={{ mb: 5, animation: `${fadeIn} 1s ease-out 0.7s both`, gap: 1.5 }}
        >
          <TrustBadge text="Human-led support" />
          <TrustBadge text="Priority Business Review" />
          <TrustBadge text="Global Assistance" />
          <TrustBadge text="Secure Inbox" />
        </Stack>
      </Container>
    </Box>
  );
};

export default ContactHero;
