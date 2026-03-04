// import React, { useState } from "react";
// import {
//   Box,
//   Container,
//   Typography,
//   Collapse,
//   Grid,
//   Button,
//   Stack,
//   Paper,
//   Avatar,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import AddRoundedIcon from "@mui/icons-material/AddRounded";
// import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
// import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
// import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
// import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";

// const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

// export type FAQItem = {
//   question: string;
//   answer: string;
// };

// type FAQSectionProps = {
//   title?: string;
//   items: FAQItem[];
//   defaultOpenIndex?: number | null;
// };

// const FAQSection: React.FC<FAQSectionProps> = ({
//   title = "Frequently Asked Questions",
//   items,
// }) => {
//   const theme = useTheme();
//   const [openIndex, setOpenIndex] = useState<number | null>(0);
//   const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

//   // Theme Colors
//   const primaryMain = theme.palette.primary.focus; // #378C92
//   const darkBg = theme.palette.primary.dark; // #141414
//   const textColor = theme.palette.text.black;
//   const subTextColor = theme.palette.text.gray;

//   return (
//     <Box
//       sx={{
//         height: "auto",
//         py: 15,
//         width: "100%",
//         display: "flex",
//         alignItems: "center",
//         position: "relative",
//         overflow: "hidden",
//         background: theme.palette.background.default || "#ffffff",
//         backgroundImage: `url(${uniqueLinesbg})`,
//       }}
//     >
//       {/* Floating geometric shapes */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: "15%",
//           left: "8%",
//           width: "120px",
//           height: "120px",
//           border: `2px solid ${alpha(primaryMain!, 0.1)}`,
//           borderRadius: "20px",
//           transform: "rotate(15deg)",
//           pointerEvents: "none",
//         }}
//       />

//       <Box
//         sx={{
//           position: "absolute",
//           bottom: "20%",
//           right: "12%",
//           width: "80px",
//           height: "80px",
//           background: `linear-gradient(135deg, ${alpha(primaryMain!, 0.05)} 0%, ${alpha(primaryMain!, 0.02)} 100%)`,
//           borderRadius: "50%",
//           pointerEvents: "none",
//         }}
//       />

//       <Container maxWidth="lg" sx={{ height: "auto", py: 3 }}>
//         <Grid
//           container
//           spacing={4}
//           sx={{ position: "relative", zIndex: 1, height: "100%" }}
//         >
//           {/* LEFT SIDE */}
//           <Grid
//             item
//             xs={12}
//             md={4.5}
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "center",
//             }}
//           >
//             <Box>
//               {/* Icon Badge */}
//               <Box
//                 sx={{
//                   width: 48,
//                   height: 48,
//                   background: `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`,
//                   borderRadius: "12px",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: "center",
//                   mb: 2,
//                   position: "relative",
//                   boxShadow: `0 8px 24px ${alpha(primaryMain!, 0.25)}`,
//                 }}
//               >
//                 <HelpOutlineRoundedIcon sx={{ fontSize: 24, color: "#fff" }} />
//               </Box>

//               <Stack
//                 direction="row"
//                 alignItems="center"
//                 spacing={1}
//                 sx={{ mb: 1.5 }}
//               >
//                 <Box
//                   sx={{
//                     width: 6,
//                     height: 6,
//                     bgcolor: primaryMain,
//                     borderRadius: "50%",
//                   }}
//                 />
//                 <Typography
//                   variant="caption"
//                   sx={{
//                     fontWeight: 700,
//                     color: primaryMain,
//                     letterSpacing: 2,
//                     fontSize: "0.65rem",
//                   }}
//                 >
//                   KNOWLEDGE BASE
//                 </Typography>
//               </Stack>

//               <Typography
//                 variant="h3"
//                 sx={{
//                   color: textColor,
//                   fontWeight: 800,
//                   fontSize: "2.75rem",
//                   lineHeight: 1.2,
//                   letterSpacing: "-0.02em",
//                   mb: 1.5,
//                 }}
//               >
//                 {title}
//               </Typography>

//               <Typography
//                 variant="body2"
//                 sx={{
//                   color: subTextColor,
//                   lineHeight: 1.6,
//                   fontSize: "0.875rem",
//                   mb: 2.5,
//                 }}
//               >
//                 Search through our most common inquiries. Designed to help you
//                 build faster.
//               </Typography>

//               {/* Action Card */}
//               <Paper
//                 elevation={0}
//                 sx={{
//                   p: 2.5,
//                   borderRadius: "16px",
//                   background: alpha(
//                     theme.palette.background.paper || "#fff",
//                     0.7,
//                   ),
//                   backdropFilter: "blur(10px)",
//                   border: "1px solid",
//                   borderColor: alpha(subTextColor!, 0.2),
//                   transition: "all 0.3s ease",
//                   "&:hover": {
//                     transform: "translateY(-2px)",
//                     boxShadow: `0 12px 28px ${alpha(primaryMain!, 0.12)}`,
//                     borderColor: primaryMain,
//                   },
//                 }}
//               >
//                 <Stack
//                   direction="row"
//                   spacing={1.5}
//                   alignItems="flex-start"
//                   sx={{ mb: 2 }}
//                 >
//                   <Avatar
//                     sx={{
//                       bgcolor: alpha(primaryMain!, 0.1),
//                       color: primaryMain,
//                       width: 36,
//                       height: 36,
//                     }}
//                   >
//                     <SupportAgentRoundedIcon sx={{ fontSize: 20 }} />
//                   </Avatar>
//                   <Box>
//                     <Typography
//                       variant="subtitle2"
//                       sx={{
//                         fontWeight: 700,
//                         mb: 0.3,
//                         color: textColor,
//                         fontSize: "1rem",
//                       }}
//                     >
//                       Didn't find what you're looking for?{" "}
//                     </Typography>
//                     <Typography
//                       variant="caption"
//                       sx={{
//                         color: subTextColor,
//                         lineHeight: 1.4,
//                         fontSize: "0.75rem",
//                       }}
//                     >
//                       Expert developers available
//                     </Typography>
//                   </Box>
//                 </Stack>

//                 <Button
//                   variant="contained"
//                   fullWidth
//                   disableElevation
//                   endIcon={
//                     <ArrowForwardIosRoundedIcon
//                       sx={{ fontSize: "10px !important" }}
//                     />
//                   }
//                   sx={{
//                     background: `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`,
//                     borderRadius: "28px",
//                     textTransform: "none",
//                     fontSize: "0.8rem",
//                     fontWeight: 600,
//                     py: 1.2,
//                     color: "#fff",
//                     transition: "all 0.3s ease",
//                     "&:hover": {
//                       transform: "translateY(-1px)",
//                       boxShadow: `0 6px 16px ${alpha(primaryMain!, 0.4)}`,
//                     },
//                   }}
//                 >
//                   Contact Us Today
//                 </Button>
//               </Paper>
//             </Box>
//           </Grid>

//           {/* RIGHT SIDE */}
//           <Grid item xs={12} md={7.5}>
//             <Box
//               sx={{
//                 height: "100%",
//                 overflowY: "auto",
//                 pr: 1,
//                 "&::-webkit-scrollbar": { width: "4px" },
//                 "&::-webkit-scrollbar-thumb": {
//                   background: alpha(subTextColor!, 0.2),
//                   borderRadius: "10px",
//                   "&:hover": { background: alpha(subTextColor!, 0.4) },
//                 },
//               }}
//             >
//               <Stack spacing={2}>
//                 {items.map((item, index) => {
//                   const isOpen = openIndex === index;
//                   const isHovered = hoveredIndex === index;

//                   return (
//                     <Paper
//                       key={index}
//                       elevation={0}
//                       onMouseEnter={() => setHoveredIndex(index)}
//                       onMouseLeave={() => setHoveredIndex(null)}
//                       onClick={() => setOpenIndex(isOpen ? null : index)}
//                       sx={{
//                         cursor: "pointer",
//                         borderRadius: "14px",
//                         bgcolor: alpha(theme.palette.bg.gray || "#eee", 0.8),
//                         backdropFilter: "blur(10px)",
//                         border: "1px solid",
//                         borderColor: isOpen
//                           ? primaryMain
//                           : alpha(subTextColor!, 0.1),
//                         transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
//                         position: "relative",
//                         overflow: "hidden",
//                         boxShadow: isOpen
//                           ? `0 12px 32px ${alpha(primaryMain!, 0.15)}`
//                           : isHovered
//                             ? "0 4px 12px rgba(0, 0, 0, 0.06)"
//                             : "0 2px 6px rgba(0, 0, 0, 0.03)",
//                         transform: isOpen ? "translateX(4px)" : "none",
//                         "&::before": {
//                           content: '""',
//                           position: "absolute",
//                           left: 0,
//                           top: 0,
//                           bottom: 0,
//                           width: isOpen ? "4px" : "0px",
//                           background: `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`,
//                           transition: "width 0.3s ease",
//                         },
//                       }}
//                     >
//                       <Box sx={{ p: 2.5 }}>
//                         <Box
//                           sx={{
//                             display: "flex",
//                             alignItems: "flex-start",
//                             gap: 2,
//                           }}
//                         >
//                           {/* Number Badge */}
//                           <Box
//                             sx={{
//                               minWidth: 32,
//                               height: 32,
//                               display: "flex",
//                               alignItems: "center",
//                               justifyContent: "center",
//                               borderRadius: "8px",
//                               background: isOpen
//                                 ? alpha(primaryMain!, 0.12)
//                                 : alpha(subTextColor!, 0.05),
//                               border: isOpen
//                                 ? `1px solid ${alpha(primaryMain!, 0.15)}`
//                                 : "1px solid transparent",
//                               transition: "all 0.3s ease",
//                             }}
//                           >
//                             <Typography
//                               sx={{
//                                 fontFamily: "monospace",
//                                 fontSize: "0.75rem",
//                                 fontWeight: 700,
//                                 color: isOpen
//                                   ? primaryMain
//                                   : alpha(subTextColor!, 0.6),
//                               }}
//                             >
//                               {String(index + 1).padStart(2, "0")}
//                             </Typography>
//                           </Box>

//                           <Box sx={{ flex: 1 }}>
//                             <Box
//                               sx={{
//                                 display: "flex",
//                                 justifyContent: "space-between",
//                                 alignItems: "flex-start",
//                                 gap: 1.5,
//                                 mb: isOpen ? 2 : 0,
//                               }}
//                             >
//                               <Typography
//                                 sx={{
//                                   fontWeight: 600,
//                                   color: textColor,
//                                   fontSize: "1.2rem",
//                                   letterSpacing: "-0.01em",
//                                   lineHeight: 1.4,
//                                   flex: 1,
//                                 }}
//                               >
//                                 {item.question}
//                               </Typography>

//                               {/* Icon Button */}
//                               <Box
//                                 sx={{
//                                   minWidth: 28,
//                                   height: 28,
//                                   display: "flex",
//                                   alignItems: "center",
//                                   justifyContent: "center",
//                                   borderRadius: "8px",
//                                   background: isOpen
//                                     ? `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`
//                                     : alpha(subTextColor!, 0.05),
//                                   transition: "all 0.3s ease",
//                                 }}
//                               >
//                                 {isOpen ? (
//                                   <RemoveRoundedIcon
//                                     sx={{ fontSize: 16, color: "#fff" }}
//                                   />
//                                 ) : (
//                                   <AddRoundedIcon
//                                     sx={{
//                                       fontSize: 16,
//                                       color: alpha(subTextColor!, 0.6),
//                                     }}
//                                   />
//                                 )}
//                               </Box>
//                             </Box>

//                             <Collapse in={isOpen}>
//                               <Box
//                                 sx={{
//                                   pt: 2,
//                                   borderTop: `1px solid ${alpha(subTextColor!, 0.1)}`,
//                                 }}
//                               >
//                                 <Typography
//                                   sx={{
//                                     color: alpha(textColor!, 0.8),
//                                     lineHeight: 1.6,
//                                     fontSize: "0.8rem",
//                                     pl: 2,
//                                     borderLeft: `2px solid ${primaryMain}`,
//                                   }}
//                                 >
//                                   {item.answer}
//                                 </Typography>
//                               </Box>
//                             </Collapse>
//                           </Box>
//                         </Box>
//                       </Box>
//                     </Paper>
//                   );
//                 })}
//               </Stack>
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default FAQSection;

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

// import React, { useState } from "react";
// import {
//   Box,
//   Container,
//   Typography,
//   Collapse,
//   Grid,
//   Button,
//   Stack,
//   Paper,
//   Avatar,
// } from "@mui/material";
// import { useTheme, alpha } from "@mui/material/styles";
// import ArrowForwardIosRoundedIcon from "@mui/icons-material/ArrowForwardIosRounded";
// import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
// import SupportAgentRoundedIcon from "@mui/icons-material/SupportAgentRounded";
// import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";

// export type FAQItem = {
//   question: string;
//   answer: string;
// };

// type FAQSectionProps = {
//   title?: string;
//   items: FAQItem[];
//   defaultOpenIndex?: number | null;
// };

// const FAQSection: React.FC<FAQSectionProps> = ({
//   title = "Frequently Asked Questions",
//   items,
// }) => {
//   const theme = useTheme();
//   const [openIndex, setOpenIndex] = useState<number | null>(0);

//   const primaryMain = theme.palette.primary.focus; // #378C92
//   const darkBg = theme.palette.primary.dark;
//   const textColor = theme.palette.text.black;
//   const subTextColor = theme.palette.text.gray;
//   const textWhite = theme.palette.text.secondary;

//   // SVG noise texture as data URI
//   const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`;

//   return (
//     <Box
//       sx={{
//         py: 15,
//         width: "100%",
//         display: "flex",
//         alignItems: "center",
//         position: "relative",
//         overflow: "hidden",
//         // Base: soft warm-teal gradient
//         background: "white",
//       }}
//     >
//       {/* ══ BACKGROUND LAYER 1: Large mesh color blobs ══ */}

//       {/* Center accent blob */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: "30%",
//           left: "38%",
//           width: "400px",
//           height: "400px",
//           borderRadius: "50%",
//           background: `radial-gradient(circle, ${alpha(primaryMain!, 0.07)} 0%, transparent 65%)`,
//           filter: "blur(40px)",
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//       />

//       {/* ══ BACKGROUND LAYER 2: SVG geometric pattern ══ */}
//       <Box
//         component="svg"
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           opacity: 1,
//           pointerEvents: "none",
//           zIndex: 0,
//         }}
//         xmlns="http://www.w3.org/2000/svg"
//       >
//         <defs>
//           {/* Dot pattern */}
//           <pattern
//             id="dots"
//             x="0"
//             y="0"
//             width="28"
//             height="28"
//             patternUnits="userSpaceOnUse"
//           >
//             <circle cx="2" cy="2" r="1.2" fill={alpha(primaryMain!, 0.18)} />
//           </pattern>
//           {/* Diagonal line pattern */}
//           <pattern
//             id="lines"
//             x="0"
//             y="0"
//             width="40"
//             height="40"
//             patternUnits="userSpaceOnUse"
//           >
//             <path
//               d="M-5,45 L45,-5"
//               stroke={alpha(primaryMain!, 0.06)}
//               strokeWidth="1"
//               fill="none"
//             />
//           </pattern>
//           {/* Cross/hash pattern */}
//           <pattern
//             id="cross"
//             x="0"
//             y="0"
//             width="50"
//             height="50"
//             patternUnits="userSpaceOnUse"
//           >
//             <path
//               d="M25,0 L25,50 M0,25 L50,25"
//               stroke={alpha(primaryMain!, 0.05)}
//               strokeWidth="0.8"
//               fill="none"
//             />
//           </pattern>
//         </defs>

//         {/* Dot field — full left side */}
//         <rect
//           x="0"
//           y="0"
//           width="35%"
//           height="100%"
//           fill="url(#dots)"
//           opacity="0.7"
//         />

//         {/* Diagonal lines — right side strip */}
//         <rect
//           x="65%"
//           y="0"
//           width="35%"
//           height="100%"
//           fill="url(#lines)"
//           opacity="0.8"
//         />

//         {/* Cross grid — bottom center */}
//         <rect
//           x="25%"
//           y="65%"
//           width="50%"
//           height="35%"
//           fill="url(#cross)"
//           opacity="0.6"
//         />

//         {/* Large decorative arc — top right */}
//         <circle
//           cx="105%"
//           cy="-5%"
//           r="30%"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.08)}
//           strokeWidth="1.5"
//         />
//         <circle
//           cx="105%"
//           cy="-5%"
//           r="22%"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.05)}
//           strokeWidth="1"
//         />

//         {/* Large arc — bottom left */}
//         <circle
//           cx="-5%"
//           cy="105%"
//           r="28%"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.07)}
//           strokeWidth="1.5"
//         />
//         <circle
//           cx="-5%"
//           cy="105%"
//           r="18%"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.04)}
//           strokeWidth="1"
//         />

//         {/* Floating triangles */}
//         <polygon
//           points="90,40 110,80 70,80"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.1)}
//           strokeWidth="1.2"
//         />
//         <polygon
//           points="1300,120 1330,170 1270,170"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.08)}
//           strokeWidth="1"
//         />
//         <polygon
//           points="200,580 230,630 170,630"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.06)}
//           strokeWidth="1"
//         />

//         {/* Floating rectangles */}
//         <rect
//           x="1100"
//           y="60"
//           width="60"
//           height="60"
//           rx="10"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.09)}
//           strokeWidth="1.2"
//           transform="rotate(20, 1130, 90)"
//         />
//         <rect
//           x="60"
//           y="400"
//           width="44"
//           height="44"
//           rx="8"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.08)}
//           strokeWidth="1"
//           transform="rotate(35, 82, 422)"
//         />
//         <rect
//           x="1350"
//           y="400"
//           width="34"
//           height="34"
//           rx="6"
//           fill={alpha(primaryMain!, 0.05)}
//           stroke={alpha(primaryMain!, 0.1)}
//           strokeWidth="1"
//           transform="rotate(15, 1367, 417)"
//         />

//         {/* Long horizontal dashes */}
//         <line
//           x1="0"
//           y1="33%"
//           x2="100%"
//           y2="33%"
//           stroke={alpha(primaryMain!, 0.05)}
//           strokeWidth="1"
//           strokeDasharray="6 18"
//         />
//         <line
//           x1="0"
//           y1="67%"
//           x2="100%"
//           y2="67%"
//           stroke={alpha(primaryMain!, 0.04)}
//           strokeWidth="1"
//           strokeDasharray="6 24"
//         />

//         {/* Scattered small circles */}
//         <circle
//           cx="8%"
//           cy="75%"
//           r="5"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.12)}
//           strokeWidth="1.2"
//         />
//         <circle
//           cx="8%"
//           cy="75%"
//           r="10"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.07)}
//           strokeWidth="1"
//         />
//         <circle
//           cx="93%"
//           cy="30%"
//           r="4"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.1)}
//           strokeWidth="1.2"
//         />
//         <circle
//           cx="93%"
//           cy="30%"
//           r="9"
//           fill="none"
//           stroke={alpha(primaryMain!, 0.06)}
//           strokeWidth="1"
//         />
//         <circle cx="50%" cy="92%" r="3" fill={alpha(primaryMain!, 0.08)} />
//         <circle cx="22%" cy="15%" r="3" fill={alpha(primaryMain!, 0.1)} />
//         <circle cx="78%" cy="88%" r="2.5" fill={alpha(primaryMain!, 0.08)} />

//         {/* Corner bracket — top left */}
//         <path
//           d="M30,30 L30,80 M30,30 L80,30"
//           stroke={alpha(primaryMain!, 0.1)}
//           strokeWidth="1.5"
//           fill="none"
//           strokeLinecap="round"
//         />
//         {/* Corner bracket — bottom right */}
//         <path
//           d="M1410,690 L1410,640 M1410,690 L1360,690"
//           stroke={alpha(primaryMain!, 0.1)}
//           strokeWidth="1.5"
//           fill="none"
//           strokeLinecap="round"
//         />

//         {/* Wavy top fill */}
//         <path
//           d="M0,40 C200,65 400,20 600,50 C800,80 1000,30 1200,55 C1320,68 1400,38 1440,48 L1440,0 L0,0 Z"
//           fill={alpha(primaryMain!, 0.04)}
//         />
//       </Box>

//       {/* ══ CONTENT ══ */}
//       <Container maxWidth="lg" sx={{ py: 3, position: "relative", zIndex: 1 }}>
//         <Grid container spacing={6} alignItems="flex-start">
//           {/* ── LEFT SIDE ── */}
//           <Grid
//             item
//             xs={12}
//             md={4.5}
//             sx={{
//               display: "flex",
//               flexDirection: "column",
//               justifyContent: "center",
//             }}
//           >
//             <Box
//               sx={{
//                 position: "relative",
//                 borderRadius: "20px",
//                 color: "#fff",
//                 padding: "35px",
//                 overflow: "hidden",

//                 // Background image layer
//                 "&::before": {
//                   content: '""',
//                   position: "absolute",
//                   inset: 0,
//                   backgroundImage:
//                     "url(https://www.code-brew.com/wp-content/themes/Avada-Child-Theme/media/2026/01/faq_cta_bg.webp)",
//                   backgroundRepeat: "no-repeat",
//                   backgroundSize: "cover",
//                   backgroundPosition: "top",
//                   zIndex: 0,
//                 },

//                 // Dark overlay for better contrast
//                 "&::after": {
//                   content: '""',
//                   position: "absolute",
//                   inset: 0,
//                   background:
//                     "linear-gradient(180deg, rgb(0 0 0 / 0%) 0%, rgba(0, 0, 0, 0.75) 100%)",
//                   zIndex: 0,
//                 },
//               }}
//             >
//               {/* CONTENT WRAPPER */}
//               <Box sx={{ position: "relative", zIndex: 1 }}>
//                 <Box
//                   sx={{
//                     width: 48,
//                     height: 48,
//                     background: "white",
//                     borderRadius: "12px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     mb: 2,
//                     boxShadow: `0 8px 24px ${alpha(primaryMain!, 0.3)}`,
//                   }}
//                 >
//                   <HelpOutlineRoundedIcon
//                     sx={{ fontSize: 24, color: "#091613" }}
//                   />
//                 </Box>

//                 <Stack
//                   direction="row"
//                   alignItems="center"
//                   spacing={1}
//                   sx={{ mb: 1.5 }}
//                 >
//                   <Box
//                     sx={{
//                       width: 6,
//                       height: 6,
//                       bgcolor: "white",
//                       borderRadius: "50%",
//                     }}
//                   />
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       fontWeight: 700,
//                       color: "white",
//                       letterSpacing: 2,
//                       fontSize: "0.65rem",
//                     }}
//                   >
//                     KNOWLEDGE BASE
//                   </Typography>
//                 </Stack>

//                 <Typography
//                   variant="h3"
//                   sx={{
//                     color: "white",
//                     fontWeight: 800,
//                     fontSize: "2.75rem",
//                     lineHeight: 1.2,
//                     letterSpacing: "-0.02em",
//                     mb: 1.5,
//                   }}
//                 >
//                   {title}
//                 </Typography>

//                 <Typography
//                   variant="body2"
//                   sx={{
//                     color: "#ffffffd0",
//                     lineHeight: 1.6,
//                     fontSize: "0.875rem",
//                     mb: 3,
//                   }}
//                 >
//                   Search through our most common inquiries. Designed to help you
//                   build faster.
//                 </Typography>

//                 {/* Action Card */}
//                 <Paper
//                   elevation={0}
//                   sx={{
//                     p: 2.5,
//                     borderRadius: "16px",
//                     background: "transparent",
//                   }}
//                 >
//                   <Stack
//                     direction="row"
//                     spacing={1.5}
//                     alignItems="flex-start"
//                     sx={{ mb: 2 }}
//                   >
//                     <Avatar
//                       sx={{
//                         bgcolor: alpha(primaryMain!, 0.15),
//                         color: "white",
//                         width: 36,
//                         height: 36,
//                       }}
//                     >
//                       <SupportAgentRoundedIcon sx={{ fontSize: 20 }} />
//                     </Avatar>

//                     <Box>
//                       <Typography
//                         variant="subtitle2"
//                         sx={{
//                           fontWeight: 700,
//                           mb: 0.3,
//                           color: "#ffffff",
//                           fontSize: "1rem",
//                         }}
//                       >
//                         Didn't find what you're looking for?
//                       </Typography>

//                       <Typography
//                         variant="caption"
//                         sx={{
//                           color: "#ffffffd0",
//                           lineHeight: 1.4,
//                           fontSize: "0.75rem",
//                         }}
//                       >
//                         Expert developers available
//                       </Typography>
//                     </Box>
//                   </Stack>

//                   <Button
//                     variant="contained"
//                     fullWidth
//                     disableElevation
//                     endIcon={
//                       <ArrowForwardIosRoundedIcon
//                         sx={{ fontSize: "10px !important" }}
//                       />
//                     }
//                     sx={{
//                       background: "white",
//                       borderRadius: "28px",
//                       textTransform: "none",
//                       fontSize: "0.8rem",
//                       fontWeight: 600,
//                       py: 1.2,
//                       color: "#000000",
//                       transition: "all 0.3s ease",
//                       "&:hover": {
//                         transform: "translateY(-1px)",
//                         boxShadow: `0 6px 20px ${alpha(primaryMain!, 0.45)}`,
//                       },
//                     }}
//                   >
//                     Contact Us Today
//                   </Button>
//                 </Paper>
//               </Box>
//             </Box>
//           </Grid>

//           {/* ── RIGHT SIDE — ACCORDION ── */}
//           <Grid item xs={12} md={7.5}>
//             <Stack
//               spacing={0}
//               sx={{
//                 borderRadius: "20px",
//                 overflow: "hidden",
//                 border: "1px solid",
//                 borderColor: alpha(subTextColor!, 0.12),
//                 boxShadow: `0 12px 48px rgba(0,0,0,0.08), 0 2px 8px ${alpha(primaryMain!, 0.05)}`,
//                 background: alpha("#fff", 0.85),
//                 backdropFilter: "blur(20px)",
//               }}
//             >
//               {items.map((item, index) => {
//                 const isOpen = openIndex === index;
//                 const isLast = index === items.length - 1;

//                 return (
//                   <Box key={index} sx={{ position: "relative" }}>
//                     {/* Animated left accent bar */}
//                     <Box
//                       sx={{
//                         position: "absolute",
//                         left: 0,
//                         top: 0,
//                         bottom: 0,
//                         width: isOpen ? "4px" : "0px",
//                         background: `linear-gradient(180deg, ${primaryMain} 0%, ${alpha(primaryMain!, 0.4)} 100%)`,
//                         transition: "width 0.3s ease",
//                         zIndex: 2,
//                       }}
//                     />

//                     {/* Question Row */}
//                     <Box
//                       onClick={() => setOpenIndex(isOpen ? null : index)}
//                       sx={{
//                         display: "flex",
//                         alignItems: "center",
//                         gap: 2,
//                         px: 3,
//                         py: 2.4,
//                         cursor: "pointer",
//                         background: isOpen
//                           ? `linear-gradient(135deg, ${alpha(primaryMain!, 0.05)} 0%, ${alpha(primaryMain!, 0.01)} 100%)`
//                           : "transparent",
//                         transition: "background 0.3s ease",
//                         "&:hover": !isOpen
//                           ? { background: alpha(primaryMain!, 0.03) }
//                           : {},
//                       }}
//                     >
//                       <Typography
//                         sx={{
//                           fontFamily: "monospace",
//                           fontSize: "0.68rem",
//                           fontWeight: 800,
//                           letterSpacing: "0.06em",
//                           color: isOpen
//                             ? primaryMain
//                             : alpha(subTextColor!, 0.35),
//                           minWidth: "28px",
//                           transition: "color 0.3s ease",
//                         }}
//                       >
//                         {String(index + 1).padStart(2, "0")}
//                       </Typography>

//                       <Typography
//                         sx={{
//                           flex: 1,
//                           fontWeight: isOpen ? 700 : 500,
//                           fontSize: "1rem",
//                           lineHeight: 1.45,
//                           letterSpacing: "-0.01em",
//                           color: isOpen ? textColor : alpha(textColor!, 0.75),
//                           transition: "all 0.3s ease",
//                         }}
//                       >
//                         {item.question}
//                       </Typography>

//                       <Box
//                         sx={{
//                           width: 34,
//                           height: 34,
//                           borderRadius: "50%",
//                           display: "flex",
//                           alignItems: "center",
//                           justifyContent: "center",
//                           background: isOpen
//                             ? `linear-gradient(135deg, ${primaryMain} 0%, ${darkBg} 100%)`
//                             : alpha(subTextColor!, 0.07),
//                           flexShrink: 0,
//                           transition: "all 0.35s ease",
//                           boxShadow: isOpen
//                             ? `0 4px 14px ${alpha(primaryMain!, 0.4)}`
//                             : "none",
//                         }}
//                       >
//                         <KeyboardArrowDownRoundedIcon
//                           sx={{
//                             fontSize: 20,
//                             color: isOpen ? "#fff" : alpha(subTextColor!, 0.45),
//                             transform: isOpen
//                               ? "rotate(180deg)"
//                               : "rotate(0deg)",
//                             transition:
//                               "transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
//                           }}
//                         />
//                       </Box>
//                     </Box>

//                     {/* Answer */}
//                     <Collapse in={isOpen} timeout={320}>
//                       <Box
//                         sx={{
//                           px: 3,
//                           pb: 3,
//                           pt: 0,
//                           background: `linear-gradient(135deg, ${alpha(primaryMain!, 0.03)} 0%, transparent 100%)`,
//                         }}
//                       >
//                         <Box sx={{ pl: "44px" }}>
//                           <Typography
//                             sx={{
//                               color: alpha(textColor!, 0.6),
//                               lineHeight: 1.8,
//                               fontSize: "0.875rem",
//                               fontWeight: 400,
//                             }}
//                           >
//                             {item.answer}
//                           </Typography>
//                         </Box>
//                       </Box>
//                     </Collapse>

//                     {!isLast && (
//                       <Box
//                         sx={{
//                           height: "1px",
//                           mx: 3,
//                           background: alpha(subTextColor!, 0.07),
//                         }}
//                       />
//                     )}
//                   </Box>
//                 );
//               })}
//             </Stack>

//             <Typography
//               variant="caption"
//               sx={{
//                 display: "block",
//                 textAlign: "center",
//                 mt: 2,
//                 color: alpha(subTextColor!, 0.4),
//                 fontSize: "0.72rem",
//                 letterSpacing: "0.02em",
//               }}
//             >
//               Click any question to expand the answer
//             </Typography>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default FAQSection;

import React, { useState } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import { alpha } from "@mui/material/styles";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export type FAQItem = { question: string; answer: string };
type FAQSectionProps = { title?: string; items: FAQItem[] };

const TEAL = "#378C92";
const TEAL_DARK = "#0d1f21";

const FAQSection: React.FC<FAQSectionProps> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <Box
      sx={{
        background: "#fff",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        py: { xs: 8, md: 0 },
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url(https://img.freepik.com/free-vector/white-abstract-background_23-2148809724.jpg?t=st=1772125881~exp=1772129481~hmac=223b17ecc5b84519a52a75dcf43d9f4e11136ad7b71ac9a830d8bdc605339de4&w=2000)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.7,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" sx={{ zIndex: 99 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
            gap: 0,
            border: "1px solid #e8edf2",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow:
              "0 24px 80px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
          }}
        >
          {/* ══ LEFT — Question List ══ */}
          <Box sx={{ borderRight: { md: "1px solid #e8edf2" } }}>
            {/* Header */}
            <Box
              sx={{
                px: 5,
                py: 4,
                borderBottom: "1px solid #e8edf2",
                background: "linear-gradient(135deg, #f8fafc 0%, #fff 100%)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: "8px",
                    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    sx={{ fontSize: "12px", color: "#fff", fontWeight: 900 }}
                  >
                    ?
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: TEAL,
                  }}
                >
                  FAQ — {items.length} Questions
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: "26px", md: "32px" },
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                  color: "#0f172a",
                  lineHeight: 1.1,
                }}
              >
                Everything
                <br />
                <Box component="span" sx={{ color: TEAL }}>
                  you asked.
                </Box>
              </Typography>
            </Box>

            {/* Question rows */}
            {items.map((item, i) => {
              const isActive = openIndex === i;
              return (
                <Box
                  key={i}
                  onClick={() => setOpenIndex(i)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    borderBottom:
                      i < items.length - 1 ? "1px solid #f1f5f9" : "none",
                    cursor: "pointer",
                    background: isActive
                      ? `linear-gradient(90deg, ${alpha(TEAL, 0.06)} 0%, ${alpha(TEAL, 0.02)} 100%)`
                      : "#fff",
                    borderLeft: isActive
                      ? `4px solid ${TEAL}`
                      : "4px solid transparent",
                    transition: "all 0.2s ease",
                    "&:hover": {
                      background: isActive ? undefined : alpha(TEAL, 0.02),
                    },
                  }}
                >
                  {/* Number column */}
                  <Box
                    sx={{
                      width: 64,
                      minHeight: 72,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      borderRight: "1px solid #f1f5f9",
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "13px",
                        fontWeight: 900,
                        fontFamily: "monospace",
                        color: isActive ? TEAL : "#d1d5db",
                        transition: "color 0.2s",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </Typography>
                  </Box>

                  {/* Question text */}
                  <Box sx={{ flex: 1, px: 3, py: 2.5 }}>
                    <Typography
                      sx={{
                        fontSize: "14.5px",
                        fontWeight: isActive ? 700 : 500,
                        color: isActive ? "#0f172a" : "#475569",
                        lineHeight: 1.45,
                        letterSpacing: "-0.01em",
                        transition: "all 0.2s",
                      }}
                    >
                      {item.question}
                    </Typography>
                  </Box>

                  {/* Active indicator */}
                  <Box sx={{ pr: 3, flexShrink: 0 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: isActive ? TEAL : "transparent",
                        border: `2px solid ${isActive ? TEAL : "#d1d5db"}`,
                        transition: "all 0.2s",
                        boxShadow: isActive
                          ? `0 0 0 3px ${alpha(TEAL, 0.15)}`
                          : "none",
                      }}
                    />
                  </Box>
                </Box>
              );
            })}
          </Box>

          {/* ══ RIGHT — Answer Panel ══ */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              background: "#fff",
              minHeight: { md: "600px" },
            }}
          >
            {/* Answer header */}
            <Box
              sx={{
                px: 5,
                py: 4,
                borderBottom: "1px solid #e8edf2",
                background: `linear-gradient(135deg, ${alpha(TEAL, 0.04)} 0%, #fff 100%)`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 2,
                }}
              >
                <Box
                  sx={{
                    px: 2,
                    py: 0.6,
                    borderRadius: "99px",
                    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "10px",
                      fontWeight: 800,
                      letterSpacing: "0.15em",
                      textTransform: "uppercase",
                      color: "#fff",
                    }}
                  >
                    Answer #{String(openIndex + 1).padStart(2, "0")}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.8 }}>
                  {items.map((_, i) => (
                    <Box
                      key={i}
                      onClick={() => setOpenIndex(i)}
                      sx={{
                        width: openIndex === i ? 20 : 6,
                        height: 6,
                        borderRadius: "3px",
                        background: openIndex === i ? TEAL : alpha(TEAL, 0.2),
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Typography
                sx={{
                  fontSize: { xs: "18px", md: "22px" },
                  fontWeight: 800,
                  color: "#0f172a",
                  lineHeight: 1.3,
                  letterSpacing: "-0.03em",
                }}
              >
                {items[openIndex].question}
              </Typography>
            </Box>

            {/* Answer body */}
            <Box sx={{ flex: 1, px: 5, py: 4 }}>
              {/* Big quote mark */}
              <Typography
                sx={{
                  fontSize: "64px",
                  color: alpha(TEAL, 0.1),
                  lineHeight: 0.6,
                  mb: 2,
                  fontFamily: "Georgia, serif",
                  fontWeight: 900,
                }}
              >
                "
              </Typography>
              <Typography
                sx={{
                  fontSize: "16px",
                  color: "#475569",
                  lineHeight: 1.9,
                  fontWeight: 400,
                }}
              >
                {items[openIndex].answer}
              </Typography>

              {/* Tags */}
              <Box sx={{ display: "flex", gap: 1, mt: 4, flexWrap: "wrap" }}>
                {["Helpful", "Getting Started", "Free Plan"].map((tag) => (
                  <Box
                    key={tag}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: "6px",
                      background: alpha(TEAL, 0.07),
                      border: `1px solid ${alpha(TEAL, 0.15)}`,
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: TEAL,
                        letterSpacing: "0.04em",
                      }}
                    >
                      {tag}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>

            {/* Bottom nav + CTA */}
            <Box
              sx={{
                px: 5,
                py: 3,
                borderTop: "1px solid #f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                background: "#fafbfc",
              }}
            >
              {/* Prev / Next */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
                  component="button"
                  onClick={() => setOpenIndex(Math.max(0, openIndex - 1))}
                  disabled={openIndex === 0}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: "8px",
                    border: "1.5px solid #e2e8f0",
                    background: "transparent",
                    color: openIndex === 0 ? "#d1d5db" : "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor: openIndex === 0 ? "default" : "pointer",
                    transition: "all 0.15s",
                    "&:hover:not(:disabled)": {
                      background: "#f8fafc",
                      borderColor: alpha(TEAL, 0.3),
                    },
                  }}
                >
                  ← Prev
                </Box>
                <Box
                  component="button"
                  onClick={() =>
                    setOpenIndex(Math.min(items.length - 1, openIndex + 1))
                  }
                  disabled={openIndex === items.length - 1}
                  sx={{
                    px: 2,
                    py: 1,
                    borderRadius: "8px",
                    border: "1.5px solid #e2e8f0",
                    background: "transparent",
                    color:
                      openIndex === items.length - 1 ? "#d1d5db" : "#475569",
                    fontSize: "12px",
                    fontWeight: 700,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    cursor:
                      openIndex === items.length - 1 ? "default" : "pointer",
                    transition: "all 0.15s",
                    "&:hover:not(:disabled)": {
                      background: "#f8fafc",
                      borderColor: alpha(TEAL, 0.3),
                    },
                  }}
                >
                  Next →
                </Box>
              </Box>

              {/* Social proof + CTA */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Box sx={{ display: "flex" }}>
                    {["d1", "d2", "d3"].map((u, i) => (
                      <Box
                        key={u}
                        component="img"
                        src={`https://i.pravatar.cc/150?u=${u}`}
                        sx={{
                          width: 24,
                          height: 24,
                          borderRadius: "50%",
                          border: "2px solid #fff",
                          ml: i > 0 ? "-7px" : 0,
                          objectFit: "cover",
                        }}
                      />
                    ))}
                  </Box>
                  <Typography sx={{ fontSize: "11px", color: "#94a3b8" }}>
                    <Box
                      component="span"
                      sx={{ fontWeight: 700, color: "#475569" }}
                    >
                      10k+
                    </Box>{" "}
                    trust us
                  </Typography>
                </Box>

                <Button
                  endIcon={
                    <ArrowForwardIcon sx={{ fontSize: "12px !important" }} />
                  }
                  sx={{
                    background: `linear-gradient(135deg, ${TEAL}, ${TEAL_DARK})`,
                    color: "#fff",
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "12px",
                    borderRadius: "8px",
                    px: 2,
                    py: 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    boxShadow: `0 4px 14px ${alpha(TEAL, 0.3)}`,
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: `0 8px 20px ${alpha(TEAL, 0.38)}`,
                    },
                    transition: "all 0.2s",
                  }}
                >
                  Ask Us
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default FAQSection;
