// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",

//   "&:hover": {
//     transform: "translateY(-2px)",
//   },

//   [theme.breakpoints.down("lg")]: {
//     height: 450,
//   },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",

//   ".platform-card:hover &": {
//     transform: "scale(1.05)",
//   },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",

//   ".platform-card:hover &": {
//     transform: "translateY(0)",
//   },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),

//   ".platform-card:hover &": {
//     opacity: 1,
//     maxHeight: 300,
//   },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();

//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn’t just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },

//         color: textColorSecondary,
//       }}
//     >
//       <Container maxWidth="xl">
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>

//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>

//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it’s free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,

//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },

//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       <NewsLetter />
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//   },
//   [theme.breakpoints.down("lg")]: {
//     height: 450,
//   },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "scale(1.05)",
//   },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "translateY(0)",
//   },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": {
//     opacity: 1,
//     maxHeight: 300,
//   },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         /* ── needed so absolute layers are clipped to this section ── */
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ════════════════════════════════════════════════════
//           DIAGONAL BACKGROUND LAYERS  — top-left → bottom-right
//           All layers are purely decorative (pointerEvents: none, zIndex: 0)
//           and cover roughly 70 % of the section diagonally.
//       ════════════════════════════════════════════════════ */}

//       {/* Layer 1 — wide teal radial bloom anchored at top-left */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "-10%",
//           left: "-15%",
//           width: "65%",
//           height: "65%",
//           background:
//             "radial-gradient(ellipse at top left, rgba(0,242,254,0.09) 0%, transparent 65%)",
//           transform: "rotate(-12deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 2 — sharp diagonal slash (top-left to centre) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           /* clip-path draws a parallelogram that covers top-left 70 % */
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(0 0, 72% 0, 48% 100%, 0 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0,242,254,0.04) 0%, rgba(0,255,204,0.025) 40%, transparent 75%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 3 — second diagonal band offset slightly to create depth */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(0 0, 55% 0, 32% 100%, 0 100%)",
//           background:
//             "linear-gradient(140deg, rgba(0,242,254,0.055) 0%, rgba(0,200,180,0.03) 50%, transparent 80%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 4 — thin glowing diagonal edge line (top-left → bottom-right) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           /* A very narrow strip that acts as a glowing diagonal rule */
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(48% 0, 52% 0, 28% 100%, 24% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0,242,254,0.18) 0%, rgba(0,255,204,0.06) 60%, transparent 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 5 — deep teal soft pool that bleeds toward centre-right
//                     so the diagonal doesn't feel cut-off */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "25%",
//           left: "15%",
//           width: "50%",
//           height: "55%",
//           background:
//             "radial-gradient(ellipse at 30% 40%, rgba(0,200,160,0.055) 0%, transparent 70%)",
//           transform: "rotate(-8deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 6 — bottom-right fade so content blends into the dark footer */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           right: 0,
//           width: "100%",
//           height: "35%",
//           background:
//             "linear-gradient(to bottom, transparent 0%, #080808 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* ── END DIAGONAL LAYERS ── */}

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//   },
//   [theme.breakpoints.down("lg")]: {
//     height: 450,
//   },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "scale(1.05)",
//   },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "translateY(0)",
//   },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": {
//     opacity: 1,
//     maxHeight: 300,
//   },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         /* ── needed so absolute layers are clipped to this section ── */
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ════════════════════════════════════════════════════
//           BACKGROUND FX — Diagonal light rays TL → BR
//       ════════════════════════════════════════════════════ */}

//       {/* SVG: diagonal ray beams — all going same 135deg angle, TL→BR */}
//       <Box
//         aria-hidden="true"
//         component="svg"
//         viewBox="0 0 1440 800"
//         preserveAspectRatio="none"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           width: "100%",
//           height: "100%",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       >
//         <defs>
//           {/* Each gradient fades from bright near TL to invisible near BR */}
//           <linearGradient id="r1" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#ffffff1a" stopOpacity="0" />
//             <stop offset="15%" stopColor="#ffffff0c" stopOpacity="0.55" />
//             <stop offset="45%" stopColor="#ffffff3d" stopOpacity="0.18" />
//             <stop offset="80%" stopColor="#ffffff1b" stopOpacity="0.04" />
//             <stop offset="100%" stopColor="#ffffff1a" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="r2" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="rgb(0, 0, 0)" stopOpacity="0" />
//             <stop
//               offset="20%"
//               stopColor="rgba(228, 228, 228, 0.37)"
//               stopOpacity="0.35"
//             />
//             <stop offset="50%" stopColor="#ffffff58" stopOpacity="0.10" />
//             <stop offset="85%" stopColor="#ffffff62" stopOpacity="0.02" />
//             <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
//           </linearGradient>

//           <linearGradient id="r4" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
//             <stop offset="22%" stopColor="#ffffff" stopOpacity="0.20" />
//             <stop offset="55%" stopColor="#ffffff" stopOpacity="0.05" />
//             <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="r5" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
//             <stop offset="25%" stopColor="#ffffff" stopOpacity="0.14" />
//             <stop offset="60%" stopColor="#ffffff" stopOpacity="0.03" />
//             <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="r6" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
//             <stop offset="10%" stopColor="#ffffff" stopOpacity="0.40" />
//             <stop offset="35%" stopColor="#ffffff" stopOpacity="0.12" />
//             <stop offset="70%" stopColor="#ffffff" stopOpacity="0.02" />
//             <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="r7" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
//             <stop offset="12%" stopColor="#ffffff" stopOpacity="0.22" />
//             <stop offset="40%" stopColor="#ffffff" stopOpacity="0.06" />
//             <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
//           </linearGradient>
//         </defs>

//         {/* ── RAY BEAMS — all parallel at 135° (TL→BR), different widths & offsets ── */}

//         {/* Beam group 1 — starts from top edge */}
//         {/* Fat primary beam */}
//         <line
//           x1="-200"
//           y1="-50"
//           x2="1640"
//           y2="850"
//           stroke="url(#r1)"
//           strokeWidth="60"
//           strokeLinecap="round"
//         />
//         {/* Thin sharp inner highlight */}
//         <line
//           x1="-200"
//           y1="-50"
//           x2="1640"
//           y2="850"
//           stroke="url(#r6)"
//           strokeWidth="3"
//           strokeLinecap="round"
//         />

//         {/* Beam group 2 — offset to the right of group 1 */}
//         <line
//           x1="100"
//           y1="-50"
//           x2="1800"
//           y2="750"
//           stroke="url(#r2)"
//           strokeWidth="40"
//           strokeLinecap="round"
//         />
//         <line
//           x1="100"
//           y1="-50"
//           x2="1800"
//           y2="750"
//           stroke="url(#r7)"
//           strokeWidth="1.5"
//           strokeLinecap="round"
//         />

//         {/* Beam group 3 — narrower, further right */}
//         <line
//           x1="320"
//           y1="-50"
//           x2="1800"
//           y2="630"
//           stroke="url(#r3)"
//           strokeWidth="28"
//           strokeLinecap="round"
//         />
//         <line
//           x1="320"
//           y1="-50"
//           x2="1800"
//           y2="630"
//           stroke="url(#r3)"
//           strokeWidth="1"
//           strokeLinecap="round"
//         />

//         {/* Beam group 4 — starts from left edge, lower */}
//         <line
//           x1="-200"
//           y1="150"
//           x2="1500"
//           y2="900"
//           stroke="url(#r4)"
//           strokeWidth="35"
//           strokeLinecap="round"
//         />

//         {/* Beam group 5 — thin accent beams, tightly spaced near primary */}
//         <line
//           x1="-200"
//           y1="30"
//           x2="1400"
//           y2="780"
//           stroke="url(#r5)"
//           strokeWidth="16"
//           strokeLinecap="round"
//         />
//         <line
//           x1="-200"
//           y1="-90"
//           x2="1300"
//           y2="680"
//           stroke="url(#r5)"
//           strokeWidth="10"
//           strokeLinecap="round"
//         />

//         {/* Beam group 6 — very faint wide halo behind everything */}
//         <line
//           x1="-200"
//           y1="-200"
//           x2="1800"
//           y2="900"
//           stroke="url(#r3)"
//           strokeWidth="200"
//           strokeLinecap="round"
//         />

//         {/* Beam group 7 — small tight cluster, further left edge */}
//         <line
//           x1="-200"
//           y1="280"
//           x2="1200"
//           y2="900"
//           stroke="url(#r4)"
//           strokeWidth="18"
//           strokeLinecap="round"
//         />
//         <line
//           x1="-200"
//           y1="350"
//           x2="1100"
//           y2="900"
//           stroke="url(#r5)"
//           strokeWidth="8"
//           strokeLinecap="round"
//         />
//       </Box>

//       {/* Bottom fade into footer */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           right: 0,
//           height: "20%",
//           background: "linear-gradient(to bottom, transparent, #080808)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* ── END BACKGROUND FX ── */}

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>
//       </Container>

//       <NewsLetter />
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 16,
//   border: "1px solid rgba(255,255,255,0.08)",
//   backgroundColor: "rgba(255,255,255,0.02)",
//   cursor: "pointer",
//   transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
//   "&:hover": {
//     transform: "translateY(-12px)",
//     borderColor: "rgba(255,255,255,0.2)",
//   },
//   [theme.breakpoints.down("lg")]: {
//     height: 480,
//   },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.6s ease",
//   ".platform-card:hover &": {
//     transform: "scale(1.1)",
//   },
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus || "#00f2fe";
//   const textColorSecondary = theme.palette.text.secondary;

//   const IconWrapper = styled(Box)(() => ({
//     position: "absolute",
//     bottom: 24,
//     right: 24,
//     zIndex: 3,
//   }));

//   const CardVisualBox = styled(Box)(({ theme }) => ({
//     position: "relative",
//     height: 600,
//     overflow: "hidden",
//     borderRadius: 8,
//     border: "1px solid rgba(255,255,255,0.12)",
//     backgroundColor: "rgba(255,255,255,0.05)",
//     cursor: "pointer",
//     transition: "transform 0.35s ease",

//     "&:hover": {
//       transform: "translateY(-2px)",
//     },

//     [theme.breakpoints.down("lg")]: {
//       height: 450,
//     },
//   }));

//   const ImageWrapper = styled(Box)(() => ({
//     position: "absolute",
//     inset: 0,
//     transition: "transform 0.45s ease",

//     ".platform-card:hover &": {
//       transform: "scale(1.05)",
//     },
//   }));

//   const ContentWrapper = styled(Box)(() => ({
//     position: "absolute",
//     inset: 0,
//     zIndex: 2,
//   }));

//   const TextWrapper = styled(Box)(() => ({
//     position: "absolute",
//     bottom: 24,
//     left: 24,
//     right: 80,
//     transition: "transform 0.45s ease",

//     ".platform-card:hover &": {
//       transform: "translateY(0)",
//     },
//   }));

//   const HiddenContent = styled(Box)(({ theme }) => ({
//     opacity: 0,
//     maxHeight: 0,
//     overflow: "hidden",
//     transition: "opacity 0.25s ease, max-height 0.35s ease",
//     marginTop: theme.spacing(2),

//     ".platform-card:hover &": {
//       opacity: 1,
//       maxHeight: 300,
//     },
//   }));
//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description: "Professional landing pages with zero code.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description: "Be discovered by thousands of customers.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description: "AI-generated images and business content.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 10, md: 20 },
//         pb: { xs: 10, md: 5 },
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ─── IMPROVED CINEMATIC DIAGONAL LAYERS ─── */}
//       <Box
//         aria-hidden="true"
//         component="svg"
//         viewBox="0 0 1440 1000" // Increased height for better Newsletter flow
//         preserveAspectRatio="none"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           width: "100%",
//           height: "100%",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       >
//         <defs>
//           <linearGradient id="beamGrad" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor={alpha(primaryFocus, 0.4)} />
//             <stop offset="30%" stopColor={alpha(primaryFocus, 0.1)} />
//             <stop offset="100%" stopColor="transparent" />
//           </linearGradient>

//           <filter id="glow">
//             <feGaussianBlur stdDeviation="8" result="coloredBlur" />
//             <feMerge>
//               <feMergeNode in="coloredBlur" />
//               <feMergeNode in="SourceGraphic" />
//             </feMerge>
//           </filter>
//         </defs>

//         {/* Thick Atmospheric Beams */}
//         <g opacity="0.4">
//           <line
//             x1="-10%"
//             y1="-10%"
//             x2="110%"
//             y2="110%"
//             stroke="url(#beamGrad)"
//             strokeWidth="180"
//           />
//           <line
//             x1="20%"
//             y1="-10%"
//             x2="140%"
//             y2="110%"
//             stroke="url(#beamGrad)"
//             strokeWidth="120"
//           />
//         </g>

//         {/* Sharp Glowing Accents */}
//         <g filter="url(#glow)">
//           <line
//             x1="-5%"
//             y1="-5%"
//             x2="105%"
//             y2="105%"
//             stroke={alpha(primaryFocus, 0.6)}
//             strokeWidth="2"
//           />
//           <line
//             x1="15%"
//             y1="-5%"
//             x2="125%"
//             y2="105%"
//             stroke={alpha(primaryFocus, 0.4)}
//             strokeWidth="1"
//           />
//           <line
//             x1="-25%"
//             y1="15%"
//             x2="85%"
//             y2="125%"
//             stroke={alpha(primaryFocus, 0.3)}
//             strokeWidth="1.5"
//           />
//         </g>

//         {/* Subtle Static/Dust Texture */}
//         <rect
//           width="100%"
//           height="100%"
//           fill="transparent"
//           style={{ filter: "contrast(150%) brightness(1000%)" }}
//         />
//       </Box>

//       {/* Masking the Newsletter integration */}
//       <Box
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "250px",
//           background: "linear-gradient(to bottom, transparent, #080808)",
//           zIndex: 1,
//         }}
//       />

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>
//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//   },
//   [theme.breakpoints.down("lg")]: {
//     height: 450,
//   },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "scale(1.05)",
//   },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "translateY(0)",
//   },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": {
//     opacity: 1,
//     maxHeight: 300,
//   },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ════════════════════════════════════════════════════
//           DIAGONAL BACKGROUND LAYERS — top-right → bottom-left
//           All layers are purely decorative (pointerEvents: none, zIndex: 0)
//       ════════════════════════════════════════════════════ */}

//       {/* Layer 1 — wide teal radial bloom anchored at top-right */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "-10%",
//           right: "-15%",
//           width: "65%",
//           height: "65%",
//           background:
//             "radial-gradient(ellipse at top right, rgba(0,242,254,0.09) 0%, transparent 65%)",
//           transform: "rotate(12deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 2 — sharp diagonal slash covering top-right → bottom-left */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(28% 0, 100% 0, 100% 100%, 52% 100%)",
//           background:
//             "linear-gradient(225deg, rgba(0,242,254,0.04) 0%, rgba(0,255,204,0.025) 40%, transparent 75%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 3 — second diagonal band offset to create depth */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(45% 0, 100% 0, 100% 100%, 68% 100%)",
//           background:
//             "linear-gradient(220deg, rgba(0,242,254,0.055) 0%, rgba(0,200,180,0.03) 50%, transparent 80%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 4 — thin glowing diagonal edge line (top-right → bottom-left) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(48% 0, 52% 0, 76% 100%, 72% 100%)",
//           background:
//             "linear-gradient(225deg, rgba(0,242,254,0.18) 0%, rgba(0,255,204,0.06) 60%, transparent 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 5 — deep teal soft pool shifted toward centre-right */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "25%",
//           right: "10%",
//           width: "50%",
//           height: "55%",
//           background:
//             "radial-gradient(ellipse at 70% 40%, rgba(0,200,160,0.055) 0%, transparent 70%)",
//           transform: "rotate(8deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 6 — bottom fade so content blends into the dark footer */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           right: 0,
//           width: "100%",
//           height: "35%",
//           background:
//             "linear-gradient(to bottom, transparent 0%, #080808 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* ── END DIAGONAL LAYERS ── */}

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//   },
//   [theme.breakpoints.down("lg")]: {
//     height: 450,
//   },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "scale(1.05)",
//   },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "translateY(0)",
//   },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": {
//     opacity: 1,
//     maxHeight: 300,
//   },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ════════════════════════════════════════════════════
//           DIAGONAL BACKGROUND LAYERS — top-right → bottom-left
//           All layers are purely decorative (pointerEvents: none, zIndex: 0)
//       ════════════════════════════════════════════════════ */}

//       {/* Layer 1 — wide teal radial bloom anchored at top-right */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "-10%",
//           right: "-15%",
//           width: "65%",
//           height: "65%",
//           background:
//             "radial-gradient(ellipse at top right, rgba(0,242,254,0.09) 0%, transparent 65%)",
//           transform: "rotate(12deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 2 — sharp diagonal slash covering top-right → bottom-left */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(28% 0, 100% 0, 100% 100%, 52% 100%)",
//           background:
//             "linear-gradient(225deg, rgba(0,242,254,0.04) 0%, rgba(0,255,204,0.025) 40%, transparent 75%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 3 — second diagonal band offset to create depth */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(45% 0, 100% 0, 100% 100%, 68% 100%)",
//           background:
//             "linear-gradient(220deg, rgba(0,242,254,0.055) 0%, rgba(0,200,180,0.03) 50%, transparent 80%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 4 — thin glowing diagonal edge line (top-right → bottom-left) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(48% 0, 52% 0, 76% 100%, 72% 100%)",
//           background:
//             "linear-gradient(225deg, rgba(0,242,254,0.18) 0%, rgba(0,255,204,0.06) 60%, transparent 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 5 — deep teal soft pool shifted toward centre-right */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "25%",
//           right: "10%",
//           width: "50%",
//           height: "55%",
//           background:
//             "radial-gradient(ellipse at 70% 40%, rgba(0,200,160,0.055) 0%, transparent 70%)",
//           transform: "rotate(8deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 6 — bottom fade so content blends into the dark footer */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           right: 0,
//           width: "100%",
//           height: "35%",
//           background:
//             "linear-gradient(to bottom, transparent 0%, #080808 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* ── END DIAGONAL LAYERS ── */}

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//   },
//   [theme.breakpoints.down("lg")]: {
//     height: 450,
//   },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "scale(1.05)",
//   },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "translateY(0)",
//   },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": {
//     opacity: 1,
//     maxHeight: 300,
//   },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ════════════════════════════════════════════════════
//           DIAGONAL BACKGROUND LAYERS — left → right (top-left to bottom-right)
//           All layers are purely decorative (pointerEvents: none, zIndex: 0)
//       ════════════════════════════════════════════════════ */}

//       {/* Layer 1 — wide teal radial bloom anchored at top-LEFT */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "-10%",
//           left: "-15%",
//           width: "65%",
//           height: "65%",
//           background:
//             "radial-gradient(ellipse at top left, rgba(0,242,254,0.09) 0%, transparent 65%)",
//           transform: "rotate(-12deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 2 — sharp diagonal slash covering top-LEFT → bottom-RIGHT */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(0 0, 72% 0, 48% 100%, 0 100%)",
//           background:
//             "linear-gradient(45deg, rgba(0,242,254,0.04) 0%, rgba(0,255,204,0.025) 40%, transparent 75%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 3 — second diagonal band offset to create depth */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(0 0, 55% 0, 32% 100%, 0 100%)",
//           background:
//             "linear-gradient(40deg, rgba(0,242,254,0.055) 0%, rgba(0,200,180,0.03) 50%, transparent 80%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 4 — thin glowing diagonal edge line (top-LEFT → bottom-RIGHT) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           clipPath: "polygon(48% 0, 52% 0, 28% 100%, 24% 100%)",
//           background:
//             "linear-gradient(45deg, rgba(0,242,254,0.18) 0%, rgba(0,255,204,0.06) 60%, transparent 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 5 — deep teal soft pool shifted toward centre-LEFT */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "25%",
//           left: "10%",
//           width: "50%",
//           height: "55%",
//           background:
//             "radial-gradient(ellipse at 30% 40%, rgba(0,200,160,0.055) 0%, transparent 70%)",
//           transform: "rotate(-8deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 6 — bottom fade so content blends into the dark footer */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "35%",
//           background:
//             "linear-gradient(to bottom, transparent 0%, #080808 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* ── END DIAGONAL LAYERS ── */}

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",
//   "&:hover": { transform: "translateY(-2px)" },
//   [theme.breakpoints.down("lg")]: { height: 450 },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": { transform: "scale(1.05)" },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": { transform: "translateY(0)" },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": { opacity: 1, maxHeight: 300 },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ══════════════════════════════════════════════════
//           DIAGONAL FLOW: top-left → bottom-right, fading out
//       ══════════════════════════════════════════════════ */}

//       {/* Layer 1 — full-section diagonal gradient wash */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           background:
//             "linear-gradient(135deg, rgba(0,242,254,0.11) 0%, rgba(0,220,200,0.06) 30%, rgba(0,180,160,0.02) 55%, transparent 75%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 2 — teal bloom at top-left corner */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "-8%",
//           left: "-8%",
//           width: "55%",
//           height: "55%",
//           background:
//             "radial-gradient(ellipse at top left, rgba(0,242,254,0.13) 0%, rgba(0,200,180,0.05) 45%, transparent 70%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 3 — wide diagonal beam (outer glow body) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(0 0, 18% 0, 62% 100%, 44% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0,242,254,0.10) 0%, rgba(0,242,254,0.04) 40%, transparent 70%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 4 — hot core of the beam, slightly blurred */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(0 0, 6% 0, 50% 100%, 44% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0, 241, 254, 0.04) 0%, rgba(0,242,254,0.10) 35%, transparent 60%)",
//           pointerEvents: "none",
//           zIndex: 0,
//           filter: "blur(1.5px)",
//         }}
//       />

//       {/* Layer 5 — second softer beam, offset right */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(12% 0, 38% 0, 80% 100%, 56% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0,242,254,0.055) 0%, rgba(0,200,180,0.02) 50%, transparent 80%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 6 — razor-thin bright edge along left of main beam */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(0 0, 3% 0, 47% 100%, 44% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0, 241, 254, 0.07) 0%, rgba(0,242,254,0.15) 40%, transparent 65%)",
//           pointerEvents: "none",
//           zIndex: 0,
//           filter: "blur(0.5px)",
//         }}
//       />

//       {/* Layer 7 — mid-path soft glow pool following diagonal */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "22%",
//           left: "10%",
//           width: "38%",
//           height: "38%",
//           background:
//             "radial-gradient(ellipse at 35% 35%, rgba(0,200,160,0.055) 0%, transparent 65%)",
//           transform: "rotate(10deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 8 — faint remnant glow at bottom-right (tail end of beam) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: "8%",
//           right: "8%",
//           width: "28%",
//           height: "28%",
//           background:
//             "radial-gradient(ellipse at bottom right, rgba(0,180,150,0.03) 0%, transparent 70%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Layer 9 — bottom fade to #080808 */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "30%",
//           background:
//             "linear-gradient(to bottom, transparent 0%, #080808 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808", 0.35)} 40%, ${alpha("#080808", 0.7)} 90%)`,
//                   }}
//                 />

//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": { color: primaryFocus },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": { display: "none" },
//                         ".platform-card:hover & .minus": { display: "block" },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",
//   "&:hover": { transform: "translateY(-2px)" },
//   [theme.breakpoints.down("lg")]: { height: 450 },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": { transform: "scale(1.05)" },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": { transform: "translateY(0)" },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": { opacity: 1, maxHeight: 300 },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ════════════════════════════════════════════════
//           TOP-LEFT → BOTTOM-RIGHT diagonal lines
//           Steeper angle, wider spacing, glowing edges
//       ════════════════════════════════════════════════ */}

//       {/* Teal bloom — source at top-left */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "-20%",
//           left: "-10%",
//           width: "55%",
//           height: "55%",
//           background:
//             "radial-gradient(ellipse at top left, rgba(0,242,254,0.12) 0%, rgba(0,200,180,0.05) 50%, transparent 72%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Band 1 — widest, most transparent, leftmost */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(0 5%, 22% 0, 58% 100%, 36% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0,242,254,0.07) 0%, rgba(0,220,200,0.035) 45%, transparent 80%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Edge 1 — glowing left edge of band 1 */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(0 5%, 3% 0, 39% 100%, 36% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0,242,254,0.38) 0%, rgba(0,230,210,0.14) 45%, transparent 75%)",
//           pointerEvents: "none",
//           zIndex: 1,
//           filter: "blur(0.5px)",
//         }}
//       />

//       {/* Band 2 — medium, offset right, slightly steeper */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(32% 0, 50% 0, 84% 100%, 66% 100%)",
//           background:
//             "linear-gradient(138deg, rgba(0,242,254,0.06) 0%, rgba(0,210,190,0.03) 50%, transparent 80%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Edge 2 — glowing left edge of band 2 */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(32% 0, 35% 0, 69% 100%, 66% 100%)",
//           background:
//             "linear-gradient(138deg, rgba(0,242,254,0.30) 0%, rgba(0,220,200,0.10) 50%, transparent 78%)",
//           pointerEvents: "none",
//           zIndex: 1,
//           filter: "blur(0.5px)",
//         }}
//       />

//       {/* Band 3 — narrow, far right, barely visible tail */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath:
//             "polygon(60% 0, 74% 0, 100% 78%, 88% 100%, 76% 100%, 50% 18%)",
//           background:
//             "linear-gradient(140deg, rgba(0,242,254,0.04) 0%, rgba(0,200,180,0.018) 55%, transparent 82%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Edge 3 — glowing edge on band 3 */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(60% 0, 63% 0, 89% 100%, 86% 100%)",
//           background:
//             "linear-gradient(140deg, rgba(0,242,254,0.22) 0%, rgba(0,210,190,0.07) 52%, transparent 80%)",
//           pointerEvents: "none",
//           zIndex: 1,
//           filter: "blur(0.5px)",
//         }}
//       />

//       {/* Soft inner glow — behind bands at mid section */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "15%",
//           left: "15%",
//           width: "45%",
//           height: "50%",
//           background:
//             "radial-gradient(ellipse at 30% 30%, rgba(0,200,170,0.05) 0%, transparent 65%)",
//           transform: "rotate(35deg)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Faint remnant at bottom-right where bands exit */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: "8%",
//           right: "5%",
//           width: "25%",
//           height: "30%",
//           background:
//             "radial-gradient(ellipse at bottom right, rgba(0,180,160,0.045) 0%, transparent 68%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Bottom fade */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "30%",
//           background:
//             "linear-gradient(to bottom, transparent 0%, #080808 100%)",
//           pointerEvents: "none",
//           zIndex: 2,
//         }}
//       />

//       {/* ── END LAYERS ── */}

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 3 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(
//                       textColorSecondary!,
//                       0.16,
//                     )} 10%, ${alpha("#080808", 0.35)} 40%, ${alpha(
//                       "#080808",
//                       0.7,
//                     )} 90%)`,
//                   }}
//                 />

//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": { color: primaryFocus },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": { display: "none" },
//                         ".platform-card:hover & .minus": { display: "block" },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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

// pro

import React from "react";
import {
  Box,
  Typography,
  Button,
  styled,
  Container,
  Stack,
  Link as MuiLink,
} from "@mui/material";
import { useTheme, alpha } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import Grid from "@mui/material/Grid";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import NewsLetter from "./Newsletter";

const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
const BusinessDirectory =
  "/assets/publicAssets/images/home/BusinessDirectory.webp";
const AITools = "/assets/publicAssets/images/home/AITools.webp";

const CardVisualBox = styled(Box)(({ theme }) => ({
  position: "relative",
  height: 600,
  overflow: "hidden",
  borderRadius: 8,
  border: "1px solid rgba(0,242,254,0.12)",
  backgroundColor: "rgba(255,255,255,0.03)",
  cursor: "pointer",
  transition: "transform 0.35s ease, border-color 0.35s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    borderColor: "rgba(0,242,254,0.25)",
  },
  [theme.breakpoints.down("lg")]: { height: 450 },
}));

const ImageWrapper = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  transition: "transform 0.45s ease",
  ".platform-card:hover &": { transform: "scale(1.05)" },
}));

const ContentWrapper = styled(Box)(() => ({
  position: "absolute",
  inset: 0,
  zIndex: 2,
}));

const TextWrapper = styled(Box)(() => ({
  position: "absolute",
  bottom: 24,
  left: 24,
  right: 80,
}));

const HiddenContent = styled(Box)(({ theme }) => ({
  opacity: 0,
  maxHeight: 0,
  overflow: "hidden",
  transition: "opacity 0.25s ease, max-height 0.35s ease",
  marginTop: theme.spacing(2),
  ".platform-card:hover &": { opacity: 1, maxHeight: 300 },
}));

const IconWrapper = styled(Box)(() => ({
  position: "absolute",
  bottom: 24,
  right: 24,
  zIndex: 3,
}));

const HighPerformanceSection: React.FC = () => {
  const theme = useTheme();
  const primaryFocus = theme.palette.primary.focus;
  const textColorSecondary = theme.palette.text.secondary;

  const cardsData = [
    {
      title: "Create a Free Business Landing Page",
      description:
        "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
      imageSrc: LandingPage,
    },
    {
      title: "Get Listed in Our Business Directory",
      description:
        "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
      imageSrc: BusinessDirectory,
    },
    {
      title: "Launch Faster with Built-in AI Tools",
      description:
        "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
      imageSrc: AITools,
    },
  ];

  return (
    <Box
      component="section"
      sx={{
        backgroundColor: "#080808",
        pt: { xs: 6, md: 16 },
        pb: { xs: 6, md: 3 },
        color: textColorSecondary,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* ════════════════════════════════════════════════════
          TOP-RIGHT → BOTTOM-LEFT  |  Stronger, more vibrant
      ════════════════════════════════════════════════════ */}

      {/* Big teal bloom — top-right origin, much brighter */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          top: "-20%",
          right: "-12%",
          width: "72%",
          height: "72%",
          background:
            "radial-gradient(ellipse at top right, rgba(0,242,254,0.22) 0%, rgba(0,210,190,0.10) 40%, transparent 68%)",
          transform: "rotate(12deg)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Primary wide diagonal band */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(30% 0, 100% 0, 100% 100%, 55% 100%)",
          background:
            "linear-gradient(225deg, rgba(0,242,254,0.09) 0%, rgba(0,220,200,0.04) 45%, transparent 78%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Secondary tighter band — offset for depth */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(52% 0, 100% 0, 100% 100%, 72% 100%)",
          background:
            "linear-gradient(225deg, rgba(0,242,254,0.11) 0%, rgba(0,210,190,0.05) 48%, transparent 80%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Glowing edge — the sharp "cut" line, bright and visible */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(50% 0, 55% 0, 78% 100%, 73% 100%)",
          background:
            "linear-gradient(225deg, rgba(0,242,254,0.55) 0%, rgba(0,235,215,0.22) 45%, transparent 75%)",
          filter: "blur(1px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Ultra-thin razor line on top of glow edge */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(51.5% 0, 53% 0, 76% 100%, 74.5% 100%)",
          background:
            "linear-gradient(225deg, rgba(0, 241, 254, 0.07) 0%, rgba(0, 241, 254, 0.03) 40%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />

      {/* Second parallel glowing edge — slightly offset right */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          inset: 0,
          clipPath: "polygon(68% 0, 72% 0, 94% 100%, 90% 100%)",
          background:
            "linear-gradient(225deg, rgba(0,242,254,0.35) 0%, rgba(0,230,210,0.12) 48%, transparent 76%)",
          filter: "blur(0.5px)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* Soft center glow pool — mid section warmth */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          top: "20%",
          right: "15%",
          width: "42%",
          height: "50%",
          background:
            "radial-gradient(ellipse at 65% 35%, rgba(0,210,185,0.08) 0%, transparent 65%)",
          transform: "rotate(10deg)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Bottom-left remnant glow — where diagonal exits */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          bottom: "5%",
          left: "5%",
          width: "30%",
          height: "35%",
          background:
            "radial-gradient(ellipse at bottom left, rgba(0,190,170,0.06) 0%, transparent 68%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Bottom fade */}
      <Box
        aria-hidden="true"
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "30%",
          background:
            "linear-gradient(to bottom, transparent 0%, #080808 100%)",
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* ── END ── */}

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 4 }}>
        <Stack alignItems="center" textAlign="center" mb={10}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
              maxWidth: 1000,
              color: textColorSecondary,
            }}
          >
            Create Your Free Business Landing Page And Get Discovered
          </Typography>
        </Stack>

        <Grid
          container
          spacing={{ xs: 3, md: 4 }}
          px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
        >
          {cardsData.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <CardVisualBox className="platform-card">
                <ImageWrapper>
                  <Box
                    component="img"
                    src={card.imageSrc}
                    alt={card.title}
                    loading="lazy"
                    decoding="async"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      filter: "brightness(0.7)",
                    }}
                  />
                </ImageWrapper>

                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 1,
                    pointerEvents: "none",
                    backdropFilter: "blur(10px)",
                    WebkitBackdropFilter: "blur(10px)",
                    mask: "linear-gradient(#0000, #000)",
                    background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808", 0.35)} 40%, ${alpha("#080808", 0.7)} 90%)`,
                  }}
                />

                <ContentWrapper sx={{ color: textColorSecondary }}>
                  <TextWrapper>
                    <Typography
                      variant="h3"
                      sx={{
                        fontSize: "1.5rem",
                        fontWeight: 500,
                        mb: 2,
                        color: textColorSecondary,
                      }}
                    >
                      {card.title}
                    </Typography>
                    <HiddenContent>
                      <Typography
                        variant="body1"
                        sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
                      >
                        {card.description}
                      </Typography>
                      <MuiLink
                        href="#"
                        underline="none"
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          color: textColorSecondary,
                          fontWeight: 500,
                          "&:hover": { color: primaryFocus },
                        }}
                      >
                        Get started — it's free
                        <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
                      </MuiLink>
                    </HiddenContent>
                  </TextWrapper>

                  <IconWrapper>
                    <Button
                      aria-label={`Toggle details for ${card.title}`}
                      sx={{
                        minWidth: 40,
                        height: 40,
                        borderRadius: "50%",
                        backgroundColor: alpha(textColorSecondary!, 0.15),
                        boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
                        p: 0,
                        color: textColorSecondary,
                        "& .plus": { display: "block" },
                        "& .minus": { display: "none" },
                        ".platform-card:hover &": {
                          backgroundColor: primaryFocus,
                          color: "#fff",
                        },
                        ".platform-card:hover & .plus": { display: "none" },
                        ".platform-card:hover & .minus": { display: "block" },
                      }}
                    >
                      <AddIcon className="plus" />
                      <RemoveIcon className="minus" />
                    </Button>
                  </IconWrapper>
                </ContentWrapper>
              </CardVisualBox>
            </Grid>
          ))}
        </Grid>

        <NewsLetter />
      </Container>
    </Box>
  );
};

export default HighPerformanceSection;

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
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(0,242,254,0.10)",
//   backgroundColor: "rgba(255,255,255,0.03)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease, border-color 0.35s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//     borderColor: "rgba(0,242,254,0.22)",
//   },
//   [theme.breakpoints.down("lg")]: { height: 450 },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": { transform: "scale(1.05)" },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": { opacity: 1, maxHeight: 300 },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ════════════════════════════════════════════════════
//           DIAGONAL SPLIT — NO LINES, NO BANDS
//           Top-left: pitch dark
//           Bottom-right: deep teal atmosphere
//           Transition: smooth blurred diagonal edge
//       ════════════════════════════════════════════════════ */}

//       {/* Main teal half — bottom-right triangle filled with deep teal */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(40% 0, 100% 0, 100% 100%, 0 100%)",
//           background:
//             "linear-gradient(160deg, rgba(0,90,80,0.55) 0%, rgba(0,60,55,0.45) 40%, rgba(0,40,38,0.30) 75%, transparent 100%)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* Teal bloom — concentrated glow inside the teal half */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: "-10%",
//           right: "-10%",
//           width: "70%",
//           height: "70%",
//           background:
//             "radial-gradient(ellipse at top right, rgba(0,180,160,0.20) 0%, rgba(0,130,115,0.08) 50%, transparent 72%)",
//           pointerEvents: "none",
//           zIndex: 1,
//         }}
//       />

//       {/* Soft blurred diagonal edge — blurs the hard split into a smooth transition */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(35% 0, 50% 0, 12% 100%, -2% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0,150,130,0.18) 0%, rgba(0,110,95,0.08) 50%, transparent 80%)",
//           filter: "blur(40px)",
//           pointerEvents: "none",
//           zIndex: 1,
//         }}
//       />

//       {/* Second faint line — slightly offset, gives edge depth */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(44% 0, 46% 0, 8% 100%, 6% 100%)",
//           background:
//             "linear-gradient(135deg, rgba(0,220,200,0.20) 0%, rgba(0,200,180,0.06) 50%, transparent 75%)",
//           pointerEvents: "none",
//           zIndex: 2,
//         }}
//       />

//       {/* Inner teal texture — subtle noise-like variation inside teal half */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: "10%",
//           right: "5%",
//           width: "50%",
//           height: "55%",
//           background:
//             "radial-gradient(ellipse at 60% 70%, rgba(0,200,180,0.08) 0%, transparent 60%)",
//           filter: "blur(30px)",
//           pointerEvents: "none",
//           zIndex: 1,
//         }}
//       />

//       {/* Dark overlay on left half — keeps left side very dark */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(0 0, 42% 0, 4% 100%, 0 100%)",
//           background: "rgba(0,0,0,0.35)",
//           pointerEvents: "none",
//           zIndex: 1,
//         }}
//       />

//       {/* Bottom fade */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "28%",
//           background:
//             "linear-gradient(to bottom, transparent 0%, #080808 100%)",
//           pointerEvents: "none",
//           zIndex: 3,
//         }}
//       />

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 4 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808", 0.35)} 40%, ${alpha("#080808", 0.7)} 90%)`,
//                   }}
//                 />

//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": { color: primaryFocus },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": { display: "none" },
//                         ".platform-card:hover & .minus": { display: "block" },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const HighPerformanceSection: React.FC = () => {
//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   const theme = useTheme();
//   const primaryFocus = "#4fd1c5"; // Teal accent
//   const bgColor = "#080808"; // Pure Black
//   const textColorSecondary = theme.palette.text.secondary;

//   // --- Styled Components from your logic ---
//   const CardVisualBox = styled(Box)(({ theme }) => ({
//     position: "relative",
//     height: 600,
//     overflow: "hidden",
//     borderRadius: 12,
//     border: "1px solid rgba(255,255,255,0.1)",
//     backgroundColor: "rgba(255,255,255,0.03)",
//     borderColor: alpha(primaryFocus, 0.4),

//     cursor: "pointer",
//     transition: "all 0.4s ease",
//     "&:hover": {
//       transform: "translateY(-8px)",
//       borderColor: alpha(primaryFocus, 0.4),
//     },
//     [theme.breakpoints.down("lg")]: { height: 450 },
//   }));

//   const ImageWrapper = styled(Box)(() => ({
//     position: "absolute",
//     inset: 0,
//     transition: "transform 0.6s ease",
//     ".platform-card:hover &": { transform: "scale(1.08)" },
//   }));

//   const ContentWrapper = styled(Box)(() => ({
//     position: "absolute",
//     inset: 0,
//     zIndex: 2,
//     display: "flex",
//     flexDirection: "column",
//     justifyContent: "flex-end",
//     padding: "32px",
//     background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)",
//   }));

//   const HiddenContent = styled(Box)(({ theme }) => ({
//     opacity: 0,
//     maxHeight: 0,
//     overflow: "hidden",
//     transition: "all 0.4s ease",
//     ".platform-card:hover &": { opacity: 1, maxHeight: 200, marginTop: "16px" },
//   }));

//   const TextWrapper = styled(Box)(() => ({
//     position: "absolute",
//     bottom: 24,
//     left: 24,
//     right: 80,
//     transition: "transform 0.45s ease",

//     ".platform-card:hover &": {
//       transform: "translateY(0)",
//     },
//   }));

//   const IconWrapper = styled(Box)(() => ({
//     position: "absolute",
//     bottom: 24,
//     right: 24,
//     zIndex: 3,
//   }));

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: bgColor,
//         pt: { xs: 12, md: 12 },
//         pb: { xs: 10, md: 2 },
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ─── ULTRA-DENSE WAVY "SILK" BACKGROUND ─── */}
//       <Box
//         aria-hidden="true"
//         component="svg"
//         viewBox="0 0 1440 1000"
//         preserveAspectRatio="none"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           width: "100%",
//           height: "100%",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       >
//         <defs>
//           <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor={alpha(primaryFocus, 0.7)} />
//             <stop offset="50%" stopColor={alpha(primaryFocus, 0.15)} />
//             <stop offset="100%" stopColor="transparent" />
//           </linearGradient>
//           <filter id="waveGlow">
//             <feGaussianBlur stdDeviation="3" result="blur" />
//             <feComposite in="SourceGraphic" in2="blur" operator="over" />
//           </filter>
//         </defs>

//         {/* 120+ Wavy Paths starting Top-Left to Bottom-Right */}
//         {Array.from({ length: 130 }).map((_, i) => {
//           const yOffset = i * 8 - 200; // Spread the lines vertically
//           return (
//             <path
//               key={i}
//               // This 'C' command creates the "S" wave curve from your reference
//               d={`M -200,${yOffset}
//                   C 400,${yOffset - 100}
//                     800,${yOffset + 600}
//                     1600,${yOffset + 400}`}
//               fill="none"
//               stroke="url(#waveGrad)"
//               strokeWidth={i % 10 === 0 ? "2" : "0.4"}
//               opacity={i % 4 === 0 ? 0.4 : 0.15}
//             />
//           );
//         })}

//         {/* Highlight Beams for Depth */}
//         <g filter="url(#waveGlow)">
//           <path
//             d="M -100,100 C 500,0 900,800 1500,600"
//             fill="none"
//             stroke={alpha(primaryFocus, 0.4)}
//             strokeWidth="3"
//           />
//           <path
//             d="M -100,400 C 600,300 1000,1100 1500,900"
//             fill="none"
//             stroke={alpha(primaryFocus, 0.2)}
//             strokeWidth="1"
//           />
//         </g>
//       </Box>

//       {/* ─── BOTTOM FADE (Seamlessly matches footer) ─── */}
//       {/* <Box
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "500px",
//           background: `linear-gradient(to bottom, transparent 0%, ${bgColor} 85%)`,
//           zIndex: 1,
//         }}
//       /> */}

//       <Container maxWidth="xl">
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>

//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>

//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it’s free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,

//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },

//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>
//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

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

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(0,242,254,0.10)",
//   backgroundColor: "rgba(255,255,255,0.03)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease, border-color 0.35s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//     borderColor: "rgba(0,242,254,0.22)",
//   },
//   [theme.breakpoints.down("lg")]: { height: 450 },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": { transform: "scale(1.05)" },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": { opacity: 1, maxHeight: 300 },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         position: "relative",
//         overflow: "hidden",
//         // ── Base dark background ──
//         backgroundColor: "#080808",
//       }}
//     >
//       {/* ── SVG Curved Flowing Lines Background ── */}
//       <Box
//         aria-hidden="true"
//         component="svg"
//         viewBox="0 0 1440 900"
//         preserveAspectRatio="xMidYMid slice"
//         xmlns="http://www.w3.org/2000/svg"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           width: "100%",
//           height: "100%",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       >
//         <defs>
//           <radialGradient id="bgGrad" cx="85%" cy="15%" r="75%">
//             <stop offset="0%" stopColor="#0a4a40" stopOpacity="1" />
//             <stop offset="45%" stopColor="#062e28" stopOpacity="1" />
//             <stop offset="100%" stopColor="#080808" stopOpacity="1" />
//           </radialGradient>
//           <linearGradient id="lineShimmer" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#00c8aa" stopOpacity="0" />
//             <stop offset="35%" stopColor="#00e8c8" stopOpacity="0.55" />
//             <stop offset="55%" stopColor="#ffffff" stopOpacity="0.75" />
//             <stop offset="75%" stopColor="#00d4b8" stopOpacity="0.35" />
//             <stop offset="100%" stopColor="#009980" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="lineFaint" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#00b89a" stopOpacity="0" />
//             <stop offset="40%" stopColor="#00c8aa" stopOpacity="0.18" />
//             <stop offset="60%" stopColor="#00d4b8" stopOpacity="0.28" />
//             <stop offset="100%" stopColor="#007a68" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="lineMid" x1="0%" y1="0%" x2="100%" y2="100%">
//             <stop offset="0%" stopColor="#00a88c" stopOpacity="0" />
//             <stop offset="45%" stopColor="#00c0a0" stopOpacity="0.38" />
//             <stop offset="65%" stopColor="#00d8b8" stopOpacity="0.50" />
//             <stop offset="100%" stopColor="#008870" stopOpacity="0" />
//           </linearGradient>
//           {/* Vertical gradients for top-to-bottom lines */}
//           <linearGradient id="lineVert" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop offset="0%" stopColor="#00c8aa" stopOpacity="0" />
//             <stop offset="25%" stopColor="#00d4b8" stopOpacity="0.30" />
//             <stop offset="55%" stopColor="#00e0c4" stopOpacity="0.42" />
//             <stop offset="80%" stopColor="#00b89a" stopOpacity="0.20" />
//             <stop offset="100%" stopColor="#008870" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="lineVertMid" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop offset="0%" stopColor="#00a88c" stopOpacity="0" />
//             <stop offset="30%" stopColor="#00c8aa" stopOpacity="0.45" />
//             <stop offset="55%" stopColor="#00dcc0" stopOpacity="0.58" />
//             <stop offset="80%" stopColor="#00b090" stopOpacity="0.25" />
//             <stop offset="100%" stopColor="#007a68" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="lineShimmerV" x1="0%" y1="0%" x2="0%" y2="100%">
//             <stop offset="0%" stopColor="#00c8aa" stopOpacity="0" />
//             <stop offset="30%" stopColor="#00ecd0" stopOpacity="0.60" />
//             <stop offset="50%" stopColor="#ffffff" stopOpacity="0.80" />
//             <stop offset="72%" stopColor="#00d8bc" stopOpacity="0.45" />
//             <stop offset="100%" stopColor="#009980" stopOpacity="0" />
//           </linearGradient>
//           <linearGradient id="bottomFade" x1="0" y1="0" x2="0" y2="1">
//             <stop offset="0%" stopColor="#080808" stopOpacity="0" />
//             <stop offset="100%" stopColor="#080808" stopOpacity="1" />
//           </linearGradient>
//         </defs>

//         {/* Background — dark base + teal radial */}
//         <rect width="1440" height="900" fill="#080808" />
//         <rect width="1440" height="900" fill="url(#bgGrad)" />

//         {/* === RADIAL FAN ARCS — originate from top-left, sweep to bottom-right === */}
//         {/* Origin point: approx (-100, -80) top-left corner */}
//         {/* Each arc is a quadratic bezier fanning outward with increasing radius */}

//         {/* Arc 1 — tightest, near top */}
//         <path
//           d="M 120 0 Q 80 80, 0 160"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="1"
//           opacity="0.30"
//         />
//         <path
//           d="M 260 0 Q 160 160, 0 320"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="1.1"
//           opacity="0.35"
//         />
//         <path
//           d="M 400 0 Q 230 240, 0 480"
//           fill="none"
//           stroke="url(#lineVertMid)"
//           strokeWidth="1.2"
//           opacity="0.45"
//         />
//         {/* Shimmer arc */}
//         <path
//           d="M 520 0 Q 290 310, 0 620"
//           fill="none"
//           stroke="url(#lineShimmerV)"
//           strokeWidth="1.6"
//           opacity="0.70"
//         />
//         <path
//           d="M 640 0 Q 350 380, 0 780"
//           fill="none"
//           stroke="url(#lineVertMid)"
//           strokeWidth="1.3"
//           opacity="0.50"
//         />
//         <path
//           d="M 760 0 Q 420 430, 0 920"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="1.1"
//           opacity="0.40"
//         />
//         <path
//           d="M 900 0 Q 520 460, 80 920"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="1"
//           opacity="0.38"
//         />
//         {/* Shimmer arc */}
//         <path
//           d="M 1040 0 Q 620 470, 200 920"
//           fill="none"
//           stroke="url(#lineShimmerV)"
//           strokeWidth="1.5"
//           opacity="0.65"
//         />
//         <path
//           d="M 1180 0 Q 720 480, 320 920"
//           fill="none"
//           stroke="url(#lineVertMid)"
//           strokeWidth="1.2"
//           opacity="0.48"
//         />
//         <path
//           d="M 1320 0 Q 820 490, 440 920"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="1.1"
//           opacity="0.40"
//         />
//         <path
//           d="M 1440 40 Q 920 500, 560 920"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="1"
//           opacity="0.36"
//         />
//         {/* Shimmer arc */}
//         <path
//           d="M 1440 180 Q 1020 520, 680 920"
//           fill="none"
//           stroke="url(#lineShimmerV)"
//           strokeWidth="1.4"
//           opacity="0.60"
//         />
//         <path
//           d="M 1440 320 Q 1120 540, 800 920"
//           fill="none"
//           stroke="url(#lineVertMid)"
//           strokeWidth="1.2"
//           opacity="0.45"
//         />
//         <path
//           d="M 1440 460 Q 1200 560, 920 920"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="1"
//           opacity="0.38"
//         />
//         <path
//           d="M 1440 600 Q 1280 620, 1060 920"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="1"
//           opacity="0.32"
//         />
//         <path
//           d="M 1440 740 Q 1360 780, 1200 920"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="0.9"
//           opacity="0.25"
//         />
//         <path
//           d="M 1440 860 Q 1420 880, 1380 920"
//           fill="none"
//           stroke="url(#lineVert)"
//           strokeWidth="0.7"
//           opacity="0.18"
//         />

//         {/* Bottom-left fade — dark corner */}
//         <radialGradient id="cornerFade" cx="0%" cy="100%" r="60%">
//           <stop offset="0%" stopColor="#080808" stopOpacity="0.6" />
//           <stop offset="100%" stopColor="#080808" stopOpacity="0" />
//         </radialGradient>
//         <rect width="1440" height="900" fill="url(#cornerFade)" />

//         {/* Bottom fade */}
//         <rect x="0" y="680" width="1440" height="220" fill="url(#bottomFade)" />
//       </Box>

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 4 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808", 0.35)} 40%, ${alpha("#080808", 0.7)} 90%)`,
//                   }}
//                 />

//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": { color: primaryFocus },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": { display: "none" },
//                         ".platform-card:hover & .minus": { display: "block" },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;

//
//
//
//
//
//

// import React from "react";
// import {
//   Box,
//   Typography,
//   Button,
//   styled,
//   Container,
//   Stack,
//   Link as MuiLink,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import Grid from "@mui/material/Grid";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
// import NewsLetter from "./Newsletter";

// const LandingPage = "/assets/publicAssets/images/home/LandingPage.webp";
// const BusinessDirectory =
//   "/assets/publicAssets/images/home/BusinessDirectory.webp";
// const AITools = "/assets/publicAssets/images/home/AITools.webp";

// const CardVisualBox = styled(Box)(({ theme }) => ({
//   position: "relative",
//   height: 600,
//   overflow: "hidden",
//   borderRadius: 8,
//   border: "1px solid rgba(255,255,255,0.12)",
//   backgroundColor: "rgba(255,255,255,0.05)",
//   cursor: "pointer",
//   transition: "transform 0.35s ease",
//   "&:hover": {
//     transform: "translateY(-2px)",
//   },
//   [theme.breakpoints.down("lg")]: {
//     height: 450,
//   },
// }));

// const ImageWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "scale(1.05)",
//   },
// }));

// const ContentWrapper = styled(Box)(() => ({
//   position: "absolute",
//   inset: 0,
//   zIndex: 2,
// }));

// const TextWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   left: 24,
//   right: 80,
//   transition: "transform 0.45s ease",
//   ".platform-card:hover &": {
//     transform: "translateY(0)",
//   },
// }));

// const HiddenContent = styled(Box)(({ theme }) => ({
//   opacity: 0,
//   maxHeight: 0,
//   overflow: "hidden",
//   transition: "opacity 0.25s ease, max-height 0.35s ease",
//   marginTop: theme.spacing(2),
//   ".platform-card:hover &": {
//     opacity: 1,
//     maxHeight: 300,
//   },
// }));

// const IconWrapper = styled(Box)(() => ({
//   position: "absolute",
//   bottom: 24,
//   right: 24,
//   zIndex: 3,
// }));

// const HighPerformanceSection: React.FC = () => {
//   const theme = useTheme();
//   const primaryFocus = theme.palette.primary.focus;
//   const textColorSecondary = theme.palette.text.secondary;

//   const cardsData = [
//     {
//       title: "Create a Free Business Landing Page",
//       description:
//         "Generate a clean, professional landing page for your business instantly. No coding, no hosting setup, and no design work required — just enter your details and publish.",
//       imageSrc: LandingPage,
//     },
//     {
//       title: "Get Listed in Our Business Directory",
//       description:
//         "Your business doesn't just get a website — it also appears in our public directory, making it easy for customers to discover, search, and contact you.",
//       imageSrc: BusinessDirectory,
//     },
//     {
//       title: "Launch Faster with Built-in AI Tools",
//       description:
//         "Use AI-powered tools to generate images, write business descriptions, and create professional content for your landing page — all without design or writing skills.",
//       imageSrc: AITools,
//     },
//   ];

//   return (
//     <Box
//       component="section"
//       sx={{
//         backgroundColor: "#080808",
//         pt: { xs: 6, md: 16 },
//         pb: { xs: 6, md: 3 },
//         color: textColorSecondary,
//         /* ── needed so absolute layers are clipped to this section ── */
//         position: "relative",
//         overflow: "hidden",
//       }}
//     >
//       {/* ════════════════════════════════════════════════════
//           DIAGONAL BACKGROUND LAYERS  — top-left → bottom-right
//           All layers are purely decorative (pointerEvents: none, zIndex: 0)
//           and cover roughly 70 % of the section diagonally.
//       ════════════════════════════════════════════════════ */}

//       {/* 1-5: WIDE AMBIENT WASHES (Fills the whole width) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           background:
//             "radial-gradient(circle at 20% 30%, rgba(0,242,254,0.05) 0%, transparent 50%)",
//           zIndex: 0,
//         }}
//       />
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           background:
//             "radial-gradient(circle at 80% 70%, rgba(0,200,160,0.03) 0%, transparent 50%)",
//           zIndex: 0,
//         }}
//       />
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           background:
//             "linear-gradient(115deg, rgba(0,242,254,0.04) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
//           zIndex: 0,
//         }}
//       />
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           right: 0,
//           height: "40%",
//           background:
//             "linear-gradient(to bottom, rgba(0,242,254,0.05), transparent)",
//           zIndex: 0,
//         }}
//       />
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           opacity: 0.4,
//           backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)`,
//           backgroundSize: "60px 60px",
//           zIndex: 0,
//         }}
//       />

//       {/* 6-12: PRIMARY DIAGONAL SLASHES (Spread Left to Right) */}
//       {/* Far Left */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(0 0, 15% 0, 0 40%, 0 0)",
//           background: "rgba(0,242,254,0.08)",
//           zIndex: 0,
//         }}
//       />
//       {/* Mid Left */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(25% 0, 45% 0, 20% 100%, 0 100%)",
//           background:
//             "linear-gradient(140deg, rgba(0,242,254,0.08), transparent)",
//           zIndex: 0,
//         }}
//       />
//       {/* Center Main */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(45% 0, 60% 0, 35% 100%, 20% 100%)",
//           background:
//             "linear-gradient(140deg, rgba(0,242,254,0.1), rgba(0,200,180,0.05))",
//           zIndex: 0,
//         }}
//       />
//       {/* Mid Right */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(65% 0, 80% 0, 55% 100%, 40% 100%)",
//           background:
//             "linear-gradient(150deg, rgba(0,242,254,0.06), transparent)",
//           zIndex: 0,
//         }}
//       />
//       {/* Far Right */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(85% 0, 100% 0, 80% 100%, 65% 100%)",
//           background:
//             "linear-gradient(160deg, rgba(0,242,254,0.04), transparent)",
//           zIndex: 0,
//         }}
//       />
//       {/* Top Right Corner */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(95% 0, 100% 0, 100% 20%, 95% 0)",
//           background: "rgba(0,242,254,0.1)",
//           zIndex: 0,
//         }}
//       />
//       {/* Bottom Left Corner */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(0 80%, 15% 100%, 0 100%)",
//           background: "rgba(0,200,160,0.05)",
//           zIndex: 0,
//         }}
//       />

//       {/* 13-20: RAZOR "LASER" LINES (Ultra-thin highlights) */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(30% 0, 30.2% 0, 5.2% 100%, 5% 100%)",
//           background: "rgba(0,242,254,0.3)",
//           filter: "blur(1px)",
//           zIndex: 0,
//         }}
//       />

//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(52% 0, 52.1% 0, 27.1% 100%, 27% 100%)",
//           background: "rgba(0,255,204,0.2)",
//           zIndex: 0,
//         }}
//       />
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(70% 0, 70.3% 0, 45.3% 100%, 45% 100%)",
//           background: "rgba(0,242,254,0.15)",
//           zIndex: 0,
//         }}
//       />
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(15% 0, 15.1% 0, -10% 100%, -10.1% 100%)",
//           background: "rgba(0,242,254,0.2)",
//           zIndex: 0,
//         }}
//       />
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           clipPath: "polygon(88% 0, 88.2% 0, 63.2% 100%, 63% 100%)",
//           background: "rgba(0,242,254,0.1)",
//           zIndex: 0,
//         }}
//       />

//       {/* 21-22: TEXTURE & VIGNETTE (The "Finish") */}
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           inset: 0,
//           opacity: 0.02,
//           backgroundImage: `url("https://www.transparenttextures.com/patterns/stardust.png")`,
//           pointerEvents: "none",
//           zIndex: 1,
//         }}
//       />
//       <Box
//         aria-hidden="true"
//         sx={{
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           right: 0,
//           height: "25%",
//           background: "linear-gradient(to top, #080808, transparent)",
//           zIndex: 1,
//         }}
//       />

//       {/* ── END DIAGONAL LAYERS ── */}

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 1 }}>
//         <Stack alignItems="center" textAlign="center" mb={10}>
//           <Typography
//             variant="h2"
//             sx={{
//               fontWeight: 900,
//               fontSize: { xs: "1.8rem", sm: "2.4rem", md: "3rem" },
//               maxWidth: 1000,
//               color: textColorSecondary,
//             }}
//           >
//             Create Your Free Business Landing Page And Get Discovered
//           </Typography>
//         </Stack>

//         <Grid
//           container
//           spacing={{ xs: 3, md: 4 }}
//           px={{ xs: 2, sm: 15, md: 0, lg: 4 }}
//         >
//           {cardsData.map((card, index) => (
//             <Grid item xs={12} md={4} key={index}>
//               <CardVisualBox className="platform-card">
//                 {/* Image */}
//                 <ImageWrapper>
//                   <Box
//                     component="img"
//                     src={card.imageSrc}
//                     alt={card.title}
//                     sx={{
//                       width: "100%",
//                       height: "100%",
//                       objectFit: "cover",
//                       filter: "brightness(0.7)",
//                     }}
//                   />
//                 </ImageWrapper>

//                 {/* Blur / Gradient Overlay */}
//                 <Box
//                   sx={{
//                     position: "absolute",
//                     inset: 0,
//                     zIndex: 1,
//                     pointerEvents: "none",
//                     backdropFilter: "blur(10px)",
//                     WebkitBackdropFilter: "blur(10px)",
//                     mask: "linear-gradient(#0000, #000)",
//                     background: `linear-gradient(${alpha(textColorSecondary!, 0.16)} 10%, ${alpha("#080808"!, 0.35)} 40%, ${alpha("#080808"!, 0.7)} 90%)`,
//                   }}
//                 />

//                 {/* Content */}
//                 <ContentWrapper sx={{ color: textColorSecondary }}>
//                   {/* Sliding Text */}
//                   <TextWrapper>
//                     <Typography
//                       variant="h3"
//                       sx={{
//                         fontSize: "1.5rem",
//                         fontWeight: 500,
//                         mb: 2,
//                         color: textColorSecondary,
//                       }}
//                     >
//                       {card.title}
//                     </Typography>
//                     <HiddenContent>
//                       <Typography
//                         variant="body1"
//                         sx={{ mb: 2, color: alpha(textColorSecondary!, 0.8) }}
//                       >
//                         {card.description}
//                       </Typography>
//                       <MuiLink
//                         href="#"
//                         underline="none"
//                         sx={{
//                           display: "inline-flex",
//                           alignItems: "center",
//                           color: textColorSecondary,
//                           fontWeight: 500,
//                           "&:hover": {
//                             color: primaryFocus,
//                           },
//                         }}
//                       >
//                         Get started — it's free
//                         <ArrowForwardIcon sx={{ ml: 1, fontSize: 16 }} />
//                       </MuiLink>
//                     </HiddenContent>
//                   </TextWrapper>

//                   {/* Fixed Icon */}
//                   <IconWrapper>
//                     <Button
//                       sx={{
//                         minWidth: 40,
//                         height: 40,
//                         borderRadius: "50%",
//                         backgroundColor: alpha(textColorSecondary!, 0.15),
//                         boxShadow: `0 0 6px ${alpha(textColorSecondary!, 0.35)}`,
//                         p: 0,
//                         color: textColorSecondary,
//                         "& .plus": { display: "block" },
//                         "& .minus": { display: "none" },
//                         ".platform-card:hover &": {
//                           backgroundColor: primaryFocus,
//                           color: "#fff",
//                         },
//                         ".platform-card:hover & .plus": {
//                           display: "none",
//                         },
//                         ".platform-card:hover & .minus": {
//                           display: "block",
//                         },
//                       }}
//                     >
//                       <AddIcon className="plus" />
//                       <RemoveIcon className="minus" />
//                     </Button>
//                   </IconWrapper>
//                 </ContentWrapper>
//               </CardVisualBox>
//             </Grid>
//           ))}
//         </Grid>

//         <NewsLetter />
//       </Container>
//     </Box>
//   );
// };

// export default HighPerformanceSection;
