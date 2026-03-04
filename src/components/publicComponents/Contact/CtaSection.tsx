// import React, { useState } from "react";
// import {
//   Box,
//   Container,
//   Typography,
//   Card,
//   CardContent,
//   Grid,
//   Paper,
//   Button,
//   Chip,
// } from "@mui/material";
// import {
//   MessageOutlined,
//   StorefrontOutlined,
//   SettingsOutlined,
//   StarBorderOutlined,
//   ErrorOutlineOutlined,
//   HelpOutlineOutlined,
//   CheckCircle,
// } from "@mui/icons-material";

// interface Purpose {
//   id: number;
//   icon: React.ElementType;
//   title: string;
//   description: string;
// }

// const ContactPurposeSection: React.FC = () => {
//   const [selectedCard, setSelectedCard] = useState<number | null>(null);

//   const purposes: Purpose[] = [
//     {
//       id: 1,
//       icon: MessageOutlined,
//       title: "Help creating or updating my landing page",
//       description: "Get assistance with your page design and content",
//     },
//     {
//       id: 2,
//       icon: StorefrontOutlined,
//       title: "Questions about my business listing",
//       description: "Manage and optimize your business presence",
//     },
//     {
//       id: 3,
//       icon: SettingsOutlined,
//       title: "Account or dashboard support",
//       description: "Help with settings, preferences, and access",
//     },
//     {
//       id: 4,
//       icon: StarBorderOutlined,
//       title: "Featured listings or upgrades",
//       description: "Explore premium features and visibility options",
//     },
//     {
//       id: 5,
//       icon: ErrorOutlineOutlined,
//       title: "Technical issues",
//       description: "Report bugs or technical difficulties",
//     },
//     {
//       id: 6,
//       icon: HelpOutlineOutlined,
//       title: "General questions",
//       description: "Everything else you need help with",
//     },
//   ];

//   const handleCardClick = (id: number) => {
//     setSelectedCard(id);
//   };

//   return (
//     <Box
//       sx={{
//         // minHeight: "100vh",
//         bgcolor: "#f9fafb",
//         py: { xs: 8, md: 10 },
//       }}
//     >
//       <Container maxWidth="lg">
//         {/* Header */}
//         <Box mb={8}>
//           <Typography
//             variant="h2"
//             component="h1"
//             sx={{
//               fontWeight: 800,
//               fontSize: { xs: "2.25rem", md: "3rem" },
//               lineHeight: 1.2,
//               mb: 2,
//               color: "#111827",
//             }}
//           >
//             What Are You
//             <br />
//             <Box component="span" sx={{ color: "#9ca3af" }}>
//               Reaching Out About?
//             </Box>
//           </Typography>

//           <Typography
//             variant="body1"
//             sx={{
//               fontSize: "18px",
//               color: "#6b7280",
//               maxWidth: "600px",
//             }}
//           >
//             Help us understand your needs so we can assist you better
//           </Typography>
//         </Box>

//         {/* Cards Grid */}
//         <Grid container spacing={2} mb={6}>
//           {purposes.map((purpose) => {
//             const Icon = purpose.icon;
//             const isSelected = selectedCard === purpose.id;

//             return (
//               <Grid item xs={12} sm={6} md={4} key={purpose.id}>
//                 <Card
//                   onClick={() => handleCardClick(purpose.id)}
//                   sx={{
//                     height: "100%",
//                     cursor: "pointer",
//                     position: "relative",
//                     transition: "all 0.3s ease",
//                     border: "2px solid",
//                     borderColor: isSelected ? "#111827" : "#e5e7eb",
//                     boxShadow: isSelected
//                       ? "0 8px 24px rgba(0,0,0,0.12)"
//                       : "none",
//                     "&:hover": {
//                       borderColor: isSelected ? "#111827" : "#d1d5db",
//                       boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//                       "& .icon-wrapper": {
//                         transform: "scale(1.05)",
//                       },
//                     },
//                   }}
//                 >
//                   <CardContent sx={{ p: 3 }}>
//                     {/* Icon Container */}
//                     <Box
//                       className="icon-wrapper"
//                       sx={{
//                         width: 48,
//                         height: 48,
//                         borderRadius: "12px",
//                         bgcolor: "#111827",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         mb: 2,
//                         position: "relative",
//                         transition: "transform 0.3s ease",
//                         transform: isSelected ? "scale(1.1)" : "scale(1)",
//                       }}
//                     >
//                       <Icon sx={{ fontSize: 24, color: "white" }} />

//                       {/* Selection Indicator */}
//                       {isSelected && (
//                         <Box
//                           sx={{
//                             position: "absolute",
//                             top: -4,
//                             right: -4,
//                             width: 20,
//                             height: 20,
//                             bgcolor: "#111827",
//                             borderRadius: "50%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <CheckCircle sx={{ fontSize: 16, color: "white" }} />
//                         </Box>
//                       )}
//                     </Box>

//                     {/* Content */}
//                     <Typography
//                       variant="h6"
//                       component="h3"
//                       sx={{
//                         fontWeight: 600,
//                         fontSize: "16px",
//                         mb: 1,
//                         color: "#111827",
//                         lineHeight: 1.4,
//                       }}
//                     >
//                       {purpose.title}
//                     </Typography>

//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontSize: "14px",
//                         color: "#6b7280",
//                         lineHeight: 1.5,
//                       }}
//                     >
//                       {purpose.description}
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             );
//           })}
//         </Grid>

//         {/* Support Text */}
//         <Box display="flex" justifyContent="center" mb={2}>
//           <Paper
//             elevation={0}
//             sx={{
//               display: "inline-flex",
//               alignItems: "center",
//               px: 3,
//               py: 1.5,
//               bgcolor: "white",
//               borderRadius: "50px",
//               border: "1px solid #e5e7eb",
//             }}
//           >
//             <HelpOutlineOutlined
//               sx={{ mr: 1, color: "#9ca3af", fontSize: 20 }}
//             />
//             <Typography
//               variant="body2"
//               sx={{ fontSize: "14px", color: "#111827" }}
//             >
//               Not sure which one fits?{" "}
//               <Button
//                 variant="text"
//                 sx={{
//                   textTransform: "none",
//                   fontWeight: 600,
//                   fontSize: "14px",
//                   p: 0,
//                   minWidth: "auto",
//                   color: "#111827",
//                   textDecoration: "none",
//                   "&:hover": {
//                     background: "transparent",
//                     textDecoration: "underline",
//                   },
//                 }}
//               >
//                 Just contact us
//               </Button>{" "}
//               — we'll take it from there.
//             </Typography>
//           </Paper>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default ContactPurposeSection;

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
//   Card,
//   CardContent,
//   Grid,
//   Paper,
//   Button,
//   Chip,
// } from "@mui/material";
// import {
//   MessageOutlined,
//   StorefrontOutlined,
//   SettingsOutlined,
//   StarBorderOutlined,
//   ErrorOutlineOutlined,
//   HelpOutlineOutlined,
//   CheckCircle,
// } from "@mui/icons-material";

// interface Purpose {
//   id: number;
//   icon: React.ElementType;
//   title: string;
//   description: string;
// }

// const ContactPurposeSection: React.FC = () => {
//   const [selectedCard, setSelectedCard] = useState<number | null>(null);

//   const purposes: Purpose[] = [
//     {
//       id: 1,
//       icon: MessageOutlined,
//       title: "Help creating or updating my landing page",
//       description: "Get assistance with your page design and content",
//     },
//     {
//       id: 2,
//       icon: StorefrontOutlined,
//       title: "Questions about my business listing",
//       description: "Manage and optimize your business presence",
//     },
//     {
//       id: 3,
//       icon: SettingsOutlined,
//       title: "Account or dashboard support",
//       description: "Help with settings, preferences, and access",
//     },
//     {
//       id: 4,
//       icon: StarBorderOutlined,
//       title: "Featured listings or upgrades",
//       description: "Explore premium features and visibility options",
//     },
//     {
//       id: 5,
//       icon: ErrorOutlineOutlined,
//       title: "Technical issues",
//       description: "Report bugs or technical difficulties",
//     },
//     {
//       id: 6,
//       icon: HelpOutlineOutlined,
//       title: "General questions",
//       description: "Everything else you need help with",
//     },
//   ];

//   const handleCardClick = (id: number) => {
//     setSelectedCard(id);
//   };

//   return (
//     <Box
//       sx={{
//         // minHeight: "100vh",
//         bgcolor: "#f9fafb",
//         py: { xs: 8, md: 10 },
//       }}
//     >
//       <Container maxWidth="lg">
//         {/* Header */}
//         <Box mb={8}>
//           <Typography
//             variant="h2"
//             component="h1"
//             sx={{
//               fontWeight: 800,
//               fontSize: { xs: "2.25rem", md: "3rem" },
//               lineHeight: 1.2,
//               mb: 2,
//               color: "#111827",
//             }}
//           >
//             What Are You
//             <br />
//             <Box component="span">Reaching Out About?</Box>
//           </Typography>

//           <Typography
//             variant="body1"
//             sx={{
//               fontSize: "18px",
//               color: "#6b7280",
//               maxWidth: "600px",
//             }}
//           >
//             Help us understand your needs so we can assist you better
//           </Typography>
//         </Box>

//         {/* Cards Grid */}
//         <Grid container spacing={2} mb={6}>
//           {purposes.map((purpose) => {
//             const Icon = purpose.icon;
//             const isSelected = selectedCard === purpose.id;

//             return (
//               <Grid item xs={12} sm={6} md={4} key={purpose.id}>
//                 <Card
//                   onClick={() => handleCardClick(purpose.id)}
//                   sx={{
//                     height: "100%",
//                     cursor: "pointer",
//                     position: "relative",
//                     transition: "all 0.3s ease",
//                     border: "2px solid",
//                     borderColor: isSelected ? "#111827" : "#e5e7eb",
//                     boxShadow: isSelected
//                       ? "0 8px 24px rgba(0,0,0,0.12)"
//                       : "none",
//                     "&:hover": {
//                       borderColor: isSelected ? "#111827" : "#d1d5db",
//                       boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
//                       "& .icon-wrapper": {
//                         transform: "scale(1.05)",
//                       },
//                     },
//                   }}
//                 >
//                   <CardContent sx={{ p: 3 }}>
//                     {/* Icon Container */}
//                     <Box
//                       className="icon-wrapper"
//                       sx={{
//                         width: 48,
//                         height: 48,
//                         borderRadius: "12px",
//                         background:
//                           "linear-gradient(135deg, #378C92 0%, #141414 100%)",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         mb: 2,
//                         position: "relative",
//                         transition: "transform 0.3s ease",
//                         transform: isSelected ? "scale(1.1)" : "scale(1)",
//                       }}
//                     >
//                       <Icon sx={{ fontSize: 24, color: "white" }} />

//                       {/* Selection Indicator */}
//                       {isSelected && (
//                         <Box
//                           sx={{
//                             position: "absolute",
//                             top: -4,
//                             right: -4,
//                             width: 20,
//                             height: 20,
//                             bgcolor: "#111827",
//                             borderRadius: "50%",
//                             display: "flex",
//                             alignItems: "center",
//                             justifyContent: "center",
//                           }}
//                         >
//                           <CheckCircle sx={{ fontSize: 16, color: "white" }} />
//                         </Box>
//                       )}
//                     </Box>

//                     {/* Content */}
//                     <Typography
//                       variant="h6"
//                       component="h3"
//                       sx={{
//                         fontWeight: 600,
//                         fontSize: "16px",
//                         mb: 1,
//                         color: "#111827",
//                         lineHeight: 1.4,
//                       }}
//                     >
//                       {purpose.title}
//                     </Typography>

//                     <Typography
//                       variant="body2"
//                       sx={{
//                         fontSize: "14px",
//                         color: "#6b7280",
//                         lineHeight: 1.5,
//                       }}
//                     >
//                       {purpose.description}
//                     </Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             );
//           })}
//         </Grid>

//         {/* Support Text */}
//         <Box display="flex" justifyContent="center" mb={2}>
//           <Paper
//             elevation={0}
//             sx={{
//               display: "inline-flex",
//               alignItems: "center",
//               px: 3,
//               py: 1.5,
//               bgcolor: "white",
//               borderRadius: "50px",
//               border: "1px solid #e5e7eb",
//               background: "linear-gradient(135deg, #378C92 0%, #141414 100%)",
//             }}
//           >
//             <HelpOutlineOutlined
//               sx={{ mr: 1, color: "#ffffff", fontSize: 20 }}
//             />
//             <Typography
//               variant="body2"
//               sx={{ fontSize: "14px", color: "#ffffff" }}
//             >
//               Not sure which one fits?{" "}
//               <Button
//                 variant="text"
//                 sx={{
//                   textTransform: "none",
//                   fontWeight: 600,
//                   fontSize: "14px",
//                   p: 0,
//                   minWidth: "auto",
//                   color: "#ffffff",
//                   textDecoration: "none",
//                   "&:hover": {
//                     background: "transparent",
//                     textDecoration: "underline",
//                   },
//                 }}
//               >
//                 Just contact us
//               </Button>{" "}
//               — we'll take it from there.
//             </Typography>
//           </Paper>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default ContactPurposeSection;

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
// import { Box, Container, Typography } from "@mui/material";
// import BoltIcon from "@mui/icons-material/Bolt";
// import LinkIcon from "@mui/icons-material/Link";
// import PieChartIcon from "@mui/icons-material/PieChart";
// import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
// import layersDesign from "../../../../public/assets/publicAssets/images/ContactUs/layersdesign.png";

// interface Purpose {
//   id: number;
//   icon: React.ElementType;
//   number: string;
//   title: string;
//   description: string;
// }

// const purposes: Purpose[] = [
//   {
//     id: 1,
//     icon: BoltIcon,
//     number: "01.",
//     title: "Amplify Your Listing",
//     description:
//       "Boost your business visibility with featured placements and premium discovery tools that put you in front of more customers.",
//   },
//   {
//     id: 2,
//     icon: AutoFixHighIcon,
//     number: "02.",
//     title: "Landing Page Help",
//     description:
//       "Get expert assistance creating or updating your auto-generated business landing page — crafted to convert visitors into customers.",
//   },
//   {
//     id: 3,
//     icon: LinkIcon,
//     number: "03.",
//     title: "Eliminate Silos",
//     description:
//       "Connect your account, dashboard, and listings into one seamless workflow with no friction.",
//   },
//   {
//     id: 4,
//     icon: PieChartIcon,
//     number: "04.",
//     title: "Scale with Clarity",
//     description:
//       "Technical support, account settings, and troubleshooting handled with precision so your business keeps moving.",
//   },
// ];

// const ContactPurposeSection: React.FC = () => {
//   const [selectedCard, setSelectedCard] = useState<number>(2);
//   const [hoveredCard, setHoveredCard] = useState<number | null>(null);

//   return (
//     <Box
//       sx={{
//         position: "relative",
//         bgcolor: "#f5f6f8",
//         minHeight: "100vh",
//         overflow: "hidden",
//         py: { xs: 8, md: 10 },
//         "&::before": {
//           content: '""',
//           position: "absolute",
//           inset: 0,
//           zIndex: 0,
//           backgroundImage: `
//             linear-gradient(to right, rgba(0,0,0,0.055) 1px, transparent 1px),
//             linear-gradient(to bottom, rgba(0,0,0,0.055) 1px, transparent 1px)
//           `,
//           backgroundSize: "72px 72px",
//         },
//         "&::after": {
//           content: '""',
//           position: "absolute",
//           inset: 0,
//           zIndex: 0,
//           background:
//             "radial-gradient(ellipse 90% 55% at 50% 0%, transparent 45%, #f5f6f8 88%)",
//         },
//       }}
//     >
//       <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
//         {/* HEADER */}
//         <Box
//           sx={{
//             display: "flex",
//             alignItems: "flex-start",
//             justifyContent: "space-between",
//             mb: { xs: 6, md: 9 },
//             gap: 4,
//             flexWrap: "wrap",
//           }}
//         >
//           <Box>
//             <Box
//               sx={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 gap: 0.8,
//                 px: 1.5,
//                 py: 0.55,
//                 borderRadius: "20px",
//                 border: "1px solid rgba(0,0,0,0.1)",
//                 bgcolor: "rgba(255,255,255,0.85)",
//                 mb: 2.5,
//               }}
//             >
//               <AutoFixHighIcon sx={{ fontSize: 13, color: "#666" }} />
//               <Typography
//                 sx={{
//                   fontSize: 10.5,
//                   fontWeight: 700,
//                   letterSpacing: "0.14em",
//                   textTransform: "uppercase",
//                   color: "#666",
//                   fontFamily: "'Inter', sans-serif",
//                 }}
//               >
//                 Contact
//               </Typography>
//             </Box>

//             <Typography
//               sx={{
//                 fontSize: { xs: "2rem", md: "2.9rem" },
//                 fontWeight: 800,
//                 lineHeight: 1.1,
//                 letterSpacing: "-0.04em",
//                 color: "#0f172a",
//                 fontFamily: "'Inter', sans-serif",
//               }}
//             >
//               What Are You
//               <br />
//               <Box component="span" sx={{ color: "#0f766e" }}>
//                 Reaching Out About?
//               </Box>
//             </Typography>
//           </Box>

//           <Box sx={{ maxWidth: "330px", pt: { md: 1 } }}>
//             <Typography
//               sx={{
//                 fontSize: 13.5,
//                 color: "#94a3b8",
//                 lineHeight: 1.75,
//                 mb: 3,
//                 fontFamily: "'Inter', sans-serif",
//               }}
//             >
//               TechieTribe brings clarity, not complexity — connecting you to the
//               right support team instantly, so you get results faster.
//             </Typography>

//             <Box
//               sx={{
//                 display: "inline-flex",
//                 alignItems: "center",
//                 px: 3,
//                 py: 1.1,
//                 borderRadius: "100px",
//                 bgcolor: "#0f172a",
//                 cursor: "pointer",
//                 transition: "all 0.2s ease",
//                 "&:hover": {
//                   bgcolor: "#1e293b",
//                   transform: "translateY(-2px)",
//                   boxShadow: "0 8px 20px rgba(0,0,0,0.2)",
//                 },
//               }}
//             >
//               <Typography
//                 sx={{
//                   fontSize: 13.5,
//                   fontWeight: 600,
//                   color: "#fff",
//                   fontFamily: "'Inter', sans-serif",
//                 }}
//               >
//                 Get in Touch
//               </Typography>
//             </Box>
//           </Box>
//         </Box>

//         {/* CARDS ROW */}
//         <Box
//           sx={{
//             display: "flex",
//             gap: "12px",
//             alignItems: "flex-end",
//             minHeight: "560px",
//           }}
//         >
//           {purposes.map((p) => {
//             const Icon = p.icon;
//             const isCenter = selectedCard === p.id;
//             const isHovered = hoveredCard === p.id && !isCenter;

//             return (
//               <Box
//                 key={p.id}
//                 onClick={() => setSelectedCard(p.id)}
//                 onMouseEnter={() => setHoveredCard(p.id)}
//                 onMouseLeave={() => setHoveredCard(null)}
//                 sx={{
//                   flex: isCenter ? "2.4" : "1",
//                   minWidth: isCenter ? "260px" : "0",
//                   height: isCenter ? "560px" : "430px",
//                   borderRadius: "22px",
//                   bgcolor: "#ffffff",
//                   border: "1px solid",
//                   borderColor: isCenter
//                     ? "rgba(15,118,110,0.12)"
//                     : "rgba(0,0,0,0.065)",
//                   boxShadow: isCenter
//                     ? "0 24px 64px rgba(0,0,0,0.11)"
//                     : "0 2px 10px rgba(0,0,0,0.045)",
//                   cursor: "pointer",
//                   position: "relative",
//                   overflow: "hidden",
//                   transition: "all 0.5s cubic-bezier(0.34,1.05,0.64,1)",
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: "space-between",
//                   padding: "0px",
//                   transform: isHovered ? "translateY(-10px)" : "none",
//                 }}
//               >
//                 {/* Ghost number */}
//                 <Typography
//                   sx={{
//                     position: "absolute",
//                     top: "20px",
//                     left: "22px",
//                     fontSize: isCenter ? "76px" : "60px",
//                     fontWeight: 800,
//                     color: "rgba(0,0,0,0.038)",
//                     lineHeight: 1,
//                     fontFamily: "'Inter', sans-serif",
//                     letterSpacing: "-0.04em",
//                     userSelect: "none",
//                     transition: "all 0.5s ease",
//                     pointerEvents: "none",
//                   }}
//                 >
//                   {p.number}
//                 </Typography>

//                 {/* Visual panel — center card only */}
//                 {isCenter && (
//                   <Box
//                     component="img"
//                     src={layersDesign}
//                     alt="layersDesign"
//                     // sx={{
//                     //   width: { lg: "200px", md: "180px" },
//                     //   height: "auto",
//                     //   cursor: "pointer",
//                     //   transition: "opacity 0.3s ease",
//                     //   "&:hover": {
//                     //     opacity: 0.8,
//                     //   },
//                     // }}
//                   />
//                 )}

//                 {/* Bottom content */}
//                 <Box
//                   sx={{
//                     mt: isCenter ? 2.5 : "auto",
//                     padding: "26px",
//                   }}
//                 >
//                   {!isCenter && (
//                     <Box
//                       sx={{
//                         width: "34px",
//                         height: "34px",
//                         borderRadius: "9px",
//                         bgcolor: isHovered
//                           ? "rgba(15,118,110,0.08)"
//                           : "rgba(0,0,0,0.045)",
//                         display: "flex",
//                         alignItems: "center",
//                         justifyContent: "center",
//                         mb: 1.8,
//                         transition: "background 0.25s ease",
//                       }}
//                     >
//                       <Icon
//                         sx={{
//                           fontSize: 17,
//                           color: isHovered ? "#0f766e" : "#666",
//                           transition: "color 0.25s ease",
//                         }}
//                       />
//                     </Box>
//                   )}

//                   <Typography
//                     sx={{
//                       fontSize: isCenter ? "24px" : "15px",
//                       fontWeight: 700,
//                       color: "#0f172a",
//                       lineHeight: 1.25,
//                       letterSpacing: "-0.025em",
//                       fontFamily: "'Inter', sans-serif",
//                       mb: isCenter ? 1.5 : 0,
//                       transition: "font-size 0.5s ease",
//                     }}
//                   >
//                     {p.title}
//                   </Typography>

//                   {isCenter && (
//                     <Typography
//                       sx={{
//                         fontSize: 13,
//                         color: "#94a3b8",
//                         lineHeight: 1.7,
//                         fontFamily: "'Inter', sans-serif",
//                       }}
//                     >
//                       {p.description}
//                     </Typography>
//                   )}
//                 </Box>
//               </Box>
//             );
//           })}
//         </Box>

//         {/* BOTTOM HINT */}
//         <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
//           <Box
//             sx={{
//               display: "inline-flex",
//               alignItems: "center",
//               gap: 1.2,
//               px: 3,
//               py: 1.2,
//               borderRadius: "100px",
//               bgcolor: "rgba(255,255,255,0.88)",
//               border: "1px solid rgba(0,0,0,0.07)",
//               backdropFilter: "blur(10px)",
//               boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
//             }}
//           >
//             <Box
//               sx={{
//                 width: 7,
//                 height: 7,
//                 borderRadius: "50%",
//                 bgcolor: "#0f766e",
//                 flexShrink: 0,
//                 boxShadow: "0 0 0 3px rgba(15,118,110,0.15)",
//               }}
//             />
//             <Typography
//               sx={{
//                 fontSize: 13,
//                 color: "#64748b",
//                 fontFamily: "'Inter', sans-serif",
//               }}
//             >
//               Not sure which one fits?{" "}
//               <Box
//                 component="span"
//                 sx={{
//                   color: "#0f766e",
//                   fontWeight: 600,
//                   cursor: "pointer",
//                   "&:hover": { textDecoration: "underline" },
//                 }}
//               >
//                 Just contact us
//               </Box>{" "}
//               — we'll take it from there.
//             </Typography>
//           </Box>
//         </Box>
//       </Container>
//     </Box>
//   );
// };

// export default ContactPurposeSection;
import React, { useState } from "react";
import { Box, Container, Typography, Stack } from "@mui/material";
import {
  MessageOutlined,
  StorefrontOutlined,
  SettingsOutlined,
  StarBorderOutlined,
} from "@mui/icons-material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const layersDesign = "/assets/publicAssets/images/ContactUs/layersdesign.png";

interface Purpose {
  id: number;
  icon: React.ElementType;
  number: string;
  title: string;
  description: string;
}

const purposes: Purpose[] = [
  {
    id: 1,
    icon: MessageOutlined,
    number: "01.",
    title: "Help creating or updating my landing page",
    description: "Get assistance with your page design and content.",
  },
  {
    id: 2,
    icon: StorefrontOutlined,
    number: "02.",
    title: "Questions about my business listing",
    description:
      "Manage and optimize your business presence across TechieTribe.",
  },
  {
    id: 3,
    icon: SettingsOutlined,
    number: "03.",
    title: "Account or dashboard support",
    description:
      "Help with settings, preferences, and access to your dashboard.",
  },
  {
    id: 4,
    icon: StarBorderOutlined,
    number: "04.",
    title: "Featured listings or upgrades",
    description:
      "Explore premium features and visibility options for your business.",
  },
];

const ContactPurposeSection: React.FC = () => {
  const [selectedCard, setSelectedCard] = useState<number>(2);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: "#f5f6f8",
        minHeight: "100vh",
        overflow: "hidden",
        py: { xs: 8, md: 10 },
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
      <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
        {/* ── HEADER ── */}
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            mb: { xs: 6, md: 9 },
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.8,
                px: 1.5,
                py: 0.55,
                borderRadius: "20px",
                border: "1px solid rgba(0,0,0,0.1)",
                bgcolor: "rgba(255,255,255,0.85)",
                mb: 2.5,
              }}
            >
              <AutoFixHighIcon sx={{ fontSize: 13, color: "#666" }} />
              <Typography
                sx={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "#666",
                }}
              >
                Contact
              </Typography>
            </Box>

            <Typography
              sx={{
                fontSize: { xs: "2rem", md: "2.9rem" },
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.04em",
                color: "#0f172a",
              }}
            >
              What Are You
              <br />
              Reaching Out About?
            </Typography>
          </Box>

          <Box sx={{ maxWidth: "330px", pt: { md: 1 } }}>
            <Typography
              sx={{
                fontSize: 14.5,
                color: "#6d6d6d",
                lineHeight: 1.75,
                mb: 3,
              }}
            >
              TechieTribe brings clarity, not complexity — connecting you to the
              right support team instantly.
            </Typography>

            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                px: 3,
                py: 1.1,
                borderRadius: "100px",
                bgcolor: "#0f172a",
                cursor: "pointer",
                transition: "0.2s",
                "&:hover": {
                  bgcolor: "#1e293b",
                  transform: "translateY(-2px)",
                },
              }}
            >
              <Typography
                sx={{ fontSize: 13.5, fontWeight: 600, color: "#fff" }}
              >
                Get in Touch
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* ── CARDS ROW (Horizontal Scroll on Mobile) ── */}
        <Box
          sx={{
            display: "flex",
            gap: "12px",
            alignItems: "flex-end",
            minHeight: "580px",
            // Mobile Scroll Logic
            overflowX: { xs: "auto", md: "visible" },
            pb: { xs: 4, md: 0 },
            px: { xs: 2, md: 0 },
            mx: { xs: -2, md: 0 },
            scrollSnapType: { xs: "x mandatory", md: "none" },
            "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          {purposes.map((p) => {
            const Icon = p.icon;
            const isCenter = selectedCard === p.id;
            const isHovered = hoveredCard === p.id && !isCenter;

            return (
              <Box
                key={p.id}
                onClick={() => setSelectedCard(p.id)}
                onMouseEnter={() => setHoveredCard(p.id)}
                onMouseLeave={() => setHoveredCard(null)}
                sx={{
                  // Keep fixed logic but prevent shrinking on mobile
                  flex: {
                    xs: `0 0 ${isCenter ? "280px" : "220px"}`,
                    md: isCenter ? "1.7" : "1",
                  },
                  height: isCenter ? "560px" : "430px",
                  scrollSnapAlign: "center",
                  borderRadius: "22px",
                  bgcolor: "#ffffff",
                  border: "1px solid",
                  borderColor: isCenter
                    ? "rgba(15,118,110,0.12)"
                    : "rgba(0,0,0,0.065)",
                  boxShadow: isCenter
                    ? "0 24px 64px rgba(0,0,0,0.11)"
                    : "0 2px 10px rgba(0,0,0,0.045)",
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.5s cubic-bezier(0.34,1.05,0.64,1)",
                  display: "flex",
                  flexDirection: "column",
                  transform: isHovered ? "translateY(-10px)" : "none",
                }}
              >
                {/* Ghost number */}
                <Typography
                  sx={{
                    position: "absolute",
                    top: "20px",
                    left: "22px",
                    fontSize: isCenter ? "76px" : "60px",
                    fontWeight: 800,
                    color: "rgba(0,0,0,0.038)",
                    lineHeight: 1,
                    pointerEvents: "none",
                  }}
                >
                  {p.number}
                </Typography>

                {/* Visual image */}
                {isCenter && (
                  <Box
                    component="img"
                    src={layersDesign}
                    alt="layers design"
                    sx={{ width: "100%", height: "220px" }}
                  />
                )}

                {/* Bottom content */}
                <Box
                  sx={{
                    mt: isCenter ? 0 : "auto",
                    padding: "26px",
                    flex: isCenter ? 1 : "unset",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: isCenter ? "flex-start" : "flex-end",
                  }}
                >
                  <Box
                    sx={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "9px",
                      bgcolor:
                        isCenter || isHovered
                          ? "rgba(15,118,110,0.08)"
                          : "rgba(0,0,0,0.045)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 2,
                    }}
                  >
                    <Icon
                      sx={{
                        fontSize: 17,
                        color: isCenter || isHovered ? "#0f766e" : "#666",
                      }}
                    />
                  </Box>

                  <Typography
                    sx={{
                      fontSize: isCenter ? "26px" : "17px",
                      fontWeight: 700,
                      color: "#0f172a",
                      lineHeight: 1.2,
                      mb: isCenter ? 1.5 : 0.5,
                      transition: "0.5s",
                    }}
                  >
                    {p.title}
                  </Typography>

                  <Typography
                    sx={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.5 }}
                  >
                    {p.description}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* ── BOTTOM HINT ── */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            mt: { xs: 2, md: 5 },
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1.2,
              px: 3,
              py: 1.2,
              borderRadius: "100px",
              bgcolor: "rgba(255,255,255,0.88)",
              border: "1px solid rgba(0,0,0,0.07)",
              backdropFilter: "blur(10px)",
            }}
          >
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                bgcolor: "#0f766e",
              }}
            />
            <Typography sx={{ fontSize: 13, color: "#64748b" }}>
              Not sure?{" "}
              <Box
                component="span"
                sx={{ color: "#0f766e", fontWeight: 600, cursor: "pointer" }}
              >
                Just contact us
              </Box>
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactPurposeSection;
