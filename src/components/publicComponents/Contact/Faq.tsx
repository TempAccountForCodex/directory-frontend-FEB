// import React from "react";
// import { Box, Container, Typography, Button } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import { useTheme } from "@mui/material/styles";

// import { ResponsiveBr } from "../../UI/ResponsiveBr";

// const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

// const DirectoryListingSection: React.FC = () => {
//   const theme = useTheme();

//   const ctaColor = "#F45B2C";

//   const benefits = [
//     {
//       number: "1",
//       title: "Appear in Category Searches",
//       description:
//         "Your business shows up when customers search for services in your category, making it easy to be discovered by the right audience at the right time.",
//     },
//     {
//       number: "2",
//       title: "Customers Discover You Easily",
//       description:
//         "Get found by potential customers actively looking for businesses like yours in the directory.",
//     },
//     {
//       number: "3",
//       title: "Verified Badges",
//       description:
//         "Build trust instantly with verified business badges that show customers you're legitimate and reliable.",
//     },
//     {
//       number: "4",
//       title: "Featured Spots for Premium Plans",
//       description:
//         "Stand out from the competition with premium featured placements that put your business front and center where it matters most.",
//     },
//   ];

//   return (
//     <Box
//       sx={{
//         py: { xs: 10, md: 14 },
//         background: "#f7f5f3",
//         position: "relative",
//         backgroundPosition: "fixed",
//         /* Image overlay */
//         "&::before": {
//           content: '""',
//           position: "absolute",
//           inset: 0,
//           backgroundImage: `url(${uniqueLinesbg})`,
//           backgroundSize: "cover",
//           backgroundPosition: "center",
//           opacity: 0.5,
//           zIndex: 0,
//         },
//       }}
//     >
//       <Container maxWidth="lg">
//         <Grid container spacing={8}>
//           {/* LEFT SIDE — Sticky */}
//           <Grid item xs={12} md={5}>
//             {" "}
//             <Box
//               sx={{
//                 position: { xs: "relative", md: "sticky" },
//                 top: { xs: 0, md: 200 },
//               }}
//             >
//               <Typography
//                 sx={{
//                   fontSize: {
//                     xs: "2.1rem",
//                     sm: "2.8rem",
//                     md: "3.8rem",
//                     lg: "5rem",
//                   },
//                   fontWeight: 800,
//                   lineHeight: 1.12,
//                   textAlign: { xs: "left", md: "right" },
//                   color: "#1f1f1f",
//                 }}
//               >
//                 It's about time
//                 <ResponsiveBr hideFrom="md" />
//                 you had a{" "}
//                 <Box component="span" sx={{ color: "#888" }}>
//                   directory listing
//                 </Box>
//                 <ResponsiveBr hideFrom="md" />
//                 you were proud of
//               </Typography>
//               {/* 🔽 GRADIENT FADE (AFTER TITLE) */}
//             </Box>
//           </Grid>

//           {/* RIGHT SIDE — Scrollable content */}
//           <Grid item xs={12} md={7} sx={{ zIndex: 1, position: "relative" }}>
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 6,
//                 mt: { xs: 4, md: 60 }, // <--- MAGIC FIX
//               }}
//             >
//               {benefits.map((benefit, index) => (
//                 <Box
//                   key={index}
//                   sx={{
//                     display: "flex",
//                     alignItems: "flex-start",
//                     gap: 3,
//                   }}
//                 >
//                   <Typography
//                     sx={{
//                       fontSize: { xs: "3rem", md: "4rem" },
//                       fontWeight: 700,
//                       color: "#1f1f1f",
//                       lineHeight: 1,
//                       minWidth: "48px",
//                     }}
//                   >
//                     {benefit.number}
//                   </Typography>

//                   <Box>
//                     <Typography
//                       sx={{
//                         fontWeight: 700,
//                         fontSize: { xs: "1.35rem", md: "1.7rem" },
//                         mb: 1,
//                         color: "#1f1f1f",
//                       }}
//                     >
//                       {benefit.title}
//                     </Typography>

//                     <Typography
//                       sx={{
//                         color: "#555",
//                         fontSize: "1rem",
//                         lineHeight: 1.7,
//                         maxWidth: "90%",
//                       }}
//                     >
//                       {benefit.description}
//                     </Typography>
//                   </Box>
//                 </Box>
//               ))}

//               {/* CTA */}
//               <Box
//                 sx={{
//                   mt: 2,
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: { xs: "center", md: "flex-start" },
//                   textAlign: { xs: "center", md: "left" },
//                 }}
//               >
//                 <Button
//                   variant="contained"
//                   sx={{
//                     background: theme.palette.text.primary,
//                     px: 5,
//                     py: 1.8,
//                     borderRadius: "30px",
//                     textTransform: "none",
//                     fontWeight: 700,
//                     color: "white",
//                     "&:hover": {
//                       background: theme.palette.text.main,
//                     },
//                   }}
//                 >
//                   START YOUR FREE TRIAL
//                 </Button>

//                 <Typography sx={{ mt: 1.2, color: "#555", fontSize: "0.9rem" }}>
//                   No credit card required • Easy sign up
//                 </Typography>
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default DirectoryListingSection;

// import React from "react";
// import {
//   Box,
//   Container,
//   Typography,
//   Accordion,
//   AccordionSummary,
//   AccordionDetails,
//   Button,
// } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
// import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
// import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

// const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

// const contactFAQs = [
//   {
//     question: "How can I contact your team?",
//     answer:
//       "You can reach us via live chat, email, or phone. Choose the option that’s most convenient for you and our team will assist you.",
//   },
//   {
//     question: "What is the fastest way to get support?",
//     answer:
//       "Live chat is the quickest way to get help for most questions. For detailed inquiries, email support is also available.",
//   },
//   {
//     question: "What are your support hours?",
//     answer:
//       "Our support team is available during regular business hours, Monday to Friday. Messages received outside these hours are answered as soon as possible.",
//   },
//   {
//     question: "Can you help me set up or update my business page?",
//     answer:
//       "Yes. Our team can guide you through creating, editing, or updating your business landing page and listing.",
//   },
//   {
//     question: "How long does it take to get a response?",
//     answer:
//       "We aim to respond to most inquiries within a few hours during business hours.",
//   },
//   {
//     question: "Is my information safe when I contact you?",
//     answer:
//       "Yes. Your information is kept private and is only used to respond to your inquiry.",
//   },
// ];

// const ContactFAQSection: React.FC = () => {
//   return (
//     <Box
//       sx={{
//         py: { xs: 10, md: 18 },
//         background: "#f7f5f3",
//         position: "relative",
//         overflow: "hidden",
//         // "&::before": {
//         //   content: '""',
//         //   position: "absolute",
//         //   inset: 0,
//         //   backgroundImage: `url(${uniqueLinesbg})`,
//         //   backgroundSize: "cover",
//         //   backgroundPosition: "center",
//         //   opacity: 0.4,
//         //   zIndex: 0,
//         // },
//       }}
//     >
//       <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
//         <Grid container spacing={8}>
//           {/* LEFT SIDE — ENHANCED STICKY HEADER */}
//           <Grid item xs={12} md={5}>
//             <Box
//               sx={{
//                 position: { xs: "relative", md: "sticky" },
//                 top: { xs: 0, md: 120 },
//                 mb: { xs: 6, md: 0 },
//                 display: "flex",
//                 flexDirection: "column",
//                 alignItems: { xs: "flex-start", md: "flex-end" },
//               }}
//             >
//               {/* Animated Support Badge */}
//               <Box
//                 sx={{
//                   display: "inline-flex",
//                   alignItems: "center",
//                   gap: 1,
//                   px: 2,
//                   py: 1,
//                   borderRadius: "100px",
//                   bgcolor: "rgba(0,0,0,0.04)",
//                   border: "1px solid rgba(0,0,0,0.08)",
//                   mb: 3,
//                 }}
//               >
//                 <HelpOutlineIcon sx={{ fontSize: 16, color: "#378C92" }} />
//                 <Typography
//                   sx={{
//                     fontSize: 12,
//                     fontWeight: 700,
//                     letterSpacing: "1px",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Help Center
//                 </Typography>
//               </Box>

//               <Typography
//                 sx={{
//                   fontSize: { xs: "2.8rem", md: "3.5rem", lg: "4.8rem" },
//                   fontWeight: 900,
//                   lineHeight: 1,
//                   textAlign: { xs: "left", md: "right" },
//                   color: "#1f1f1f",
//                   letterSpacing: "-0.04em",
//                   mb: 3,
//                 }}
//               >
//                 Everything <br />
//                 you need <br />
//                 to{" "}
//                 <Box
//                   component="span"
//                   sx={{
//                     color: "transparent",
//                     WebkitTextStroke: "1px #1f1f1f",
//                     opacity: 0.5,
//                   }}
//                 >
//                   know
//                 </Box>
//               </Typography>

//               <Typography
//                 sx={{
//                   fontSize: "1.15rem",
//                   color: "#666",
//                   textAlign: { xs: "left", md: "right" },
//                   maxWidth: "340px",
//                   lineHeight: 1.6,
//                   mb: 5,
//                 }}
//               >
//                 We believe in clarity. If you can't find what you're looking
//                 for, our human support team is just a click away.
//               </Typography>

//               {/* Sticky CTA for Left Side */}
//               <Button
//                 variant="outlined"
//                 endIcon={<ArrowForwardIcon />}
//                 sx={{
//                   borderRadius: "100px",
//                   borderColor: "#1f1f1f",
//                   color: "#1f1f1f",
//                   px: 4,
//                   py: 1.5,
//                   fontWeight: 700,
//                   textTransform: "none",
//                   "&:hover": {
//                     bgcolor: "#1f1f1f",
//                     color: "#fff",
//                     borderColor: "#1f1f1f",
//                   },
//                 }}
//               >
//                 Chat with an Expert
//               </Button>
//             </Box>
//           </Grid>

//           {/* RIGHT SIDE — ACCORDIONS */}
//           <Grid item xs={12} md={7} sx={{ position: "relative" }}>
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 2,
//               }}
//             >
//               {contactFAQs.map((faq, index) => (
//                 <Accordion
//                   key={index}
//                   elevation={0}
//                   disableGutters
//                   sx={{
//                     background: "transparent",
//                     borderBottom: "1px solid rgba(0,0,0,0.1)",
//                     "&::before": { display: "none" },
//                     py: 1,
//                     transition: "all 0.3s ease",
//                     "&:hover": {
//                       transform: "translateX(10px)",
//                     },
//                   }}
//                 >
//                   <AccordionSummary
//                     expandIcon={
//                       <ExpandMoreIcon sx={{ color: "#1f1f1f", fontSize: 28 }} />
//                     }
//                     sx={{
//                       px: 0,
//                       "& .MuiAccordionSummary-content": {
//                         display: "flex",
//                         alignItems: "center",
//                         gap: { xs: 2, md: 4 },
//                       },
//                     }}
//                   >
//                     <Typography
//                       sx={{
//                         fontSize: { xs: "1.2rem", md: "1.8rem" },
//                         fontWeight: 900,
//                         color: "#1f1f1f",
//                         opacity: 0.15,
//                         fontFamily: "'Space Mono', monospace",
//                         minWidth: "40px",
//                       }}
//                     >
//                       {(index + 1).toString().padStart(2, "0")}
//                     </Typography>

//                     <Typography
//                       sx={{
//                         fontWeight: 800,
//                         fontSize: { xs: "1.1rem", md: "1.45rem" },
//                         color: "#1f1f1f",
//                         lineHeight: 1.2,
//                         letterSpacing: "-0.01em",
//                       }}
//                     >
//                       {faq.question}
//                     </Typography>
//                   </AccordionSummary>

//                   <AccordionDetails sx={{ px: { xs: 0, md: 9 }, pb: 4 }}>
//                     <Typography
//                       sx={{
//                         color: "#555",
//                         fontSize: "1.1rem",
//                         lineHeight: 1.8,
//                         maxWidth: "520px",
//                       }}
//                     >
//                       {faq.answer}
//                     </Typography>
//                   </AccordionDetails>
//                 </Accordion>
//               ))}
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// };

// export default ContactFAQSection;

import React from "react";
import {
  Box,
  Container,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Stack,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

const contactFAQs = [
  {
    question: "How can I contact your team?",
    answer:
      "You can reach us via live chat, email, or phone. Choose the option that’s most convenient for you and our team will assist you.",
  },
  {
    question: "What is the fastest way to get support?",
    answer:
      "Live chat is the quickest way to get help for most questions. For detailed inquiries, email support is also available.",
  },
  {
    question: "What are your support hours?",
    answer:
      "Our support team is available during regular business hours, Monday to Friday. Messages received outside these hours are answered as soon as possible.",
  },
  {
    question: "Can you help me set up or update my business page?",
    answer:
      "Yes. Our team can guide you through creating, editing, or updating your business landing page and listing.",
  },
  {
    question: "How long does it take to get a response?",
    answer:
      "We aim to respond to most inquiries within a few hours during business hours.",
  },
  {
    question: "Is my information safe when I contact you?",
    answer:
      "Yes. Your information is kept private and is only used to respond to your inquiry.",
  },
];

const ContactFAQSection: React.FC = () => {
  return (
    <Box
      sx={{
        py: { xs: 10, md: 16 },
        background: "#f7f5f3",
        position: "relative",
        overflow: "hidden",
        // "&::before": {
        //   content: '""',
        //   position: "absolute",
        //   inset: 0,
        //   backgroundImage: `url(${uniqueLinesbg})`,
        //   backgroundSize: "cover",
        //   backgroundPosition: "center",
        //   opacity: 0.4,
        //   zIndex: 0,
        // },

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
        <Grid container spacing={8}>
          {/* LEFT SIDE — ENHANCED STICKY HEADER */}
          <Grid item xs={12} md={5}>
            <Box
              sx={{
                position: { xs: "relative", md: "sticky" },
                top: { xs: 0, md: 150 },
                display: "flex",
                flexDirection: "column",
                alignItems: { xs: "flex-start", md: "flex-end" },
              }}
            >
              <Box
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 2.5,
                  py: 1,
                  borderRadius: "100px",
                  bgcolor: "#fff",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  mb: 4,
                }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    bgcolor: "#378C92",
                    borderRadius: "50%",
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    color: "#1f1f1f",
                  }}
                >
                  Support Online
                </Typography>
              </Box>

              <Typography
                sx={{
                  fontSize: { xs: "2.8rem", md: "3.5rem", lg: "4.8rem" },
                  fontWeight: 900,
                  lineHeight: 0.95,
                  textAlign: { xs: "left", md: "right" },
                  color: "#1f1f1f",
                  letterSpacing: "-0.05em",
                  mb: 4,
                }}
              >
                Everything <br />
                you need <br />
                to{" "}
                <Box
                  component="span"
                  sx={{
                    color: "transparent",
                    WebkitTextStroke: "1px #378C92",
                  }}
                >
                  know
                </Box>
              </Typography>

              <Typography
                sx={{
                  fontSize: "1.15rem",
                  color: "#666",
                  textAlign: { xs: "left", md: "right" },
                  maxWidth: "360px",
                  lineHeight: 1.7,
                  mb: 6,
                }}
              >
                Transparent answers for a seamless experience. Our mission is to
                make your digital transition as smooth as possible.
              </Typography>

              {/* Floating Contact Card to fill empty space below text */}
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "320px",
                  bgcolor: "#fff",
                  p: 3,
                  borderRadius: "24px",
                  boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,0,0,0.05)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                  mb: 4,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      p: 1.5,
                      bgcolor: "rgba(55,140,146,0.1)",
                      borderRadius: "12px",
                    }}
                  >
                    <ChatBubbleOutlineIcon sx={{ color: "#378C92" }} />
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "14px" }}>
                      Still confused?
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#888" }}>
                      Response time: ~2 hours
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  fullWidth
                  sx={{
                    bgcolor: "#1f1f1f",
                    color: "#fff",
                    borderRadius: "12px",
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 700,
                    "&:hover": { bgcolor: "#378C92" },
                  }}
                >
                  Message Support
                </Button>
              </Box>
            </Box>
          </Grid>

          {/* RIGHT SIDE — ACCORDIONS */}
          <Grid item xs={12} md={7} sx={{ position: "relative" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {contactFAQs.map((faq, index) => (
                <Accordion
                  key={index}
                  elevation={0}
                  disableGutters
                  sx={{
                    background: "transparent",
                    borderBottom: "1px solid rgba(0,0,0,0.1)",
                    "&::before": { display: "none" },
                    py: 1,
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "translateX(10px)",
                    },
                  }}
                >
                  <AccordionSummary
                    expandIcon={
                      <ExpandMoreIcon sx={{ color: "#1f1f1f", fontSize: 28 }} />
                    }
                    sx={{
                      px: 0,
                      "& .MuiAccordionSummary-content": {
                        display: "flex",
                        alignItems: "center",
                        gap: { xs: 2, md: 4 },
                      },
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: { xs: "1.2rem", md: "1.8rem" },
                        fontWeight: 900,
                        color: "#1f1f1f",
                        opacity: 0.15,
                        fontFamily: "'Space Mono', monospace",
                        minWidth: "40px",
                      }}
                    >
                      {(index + 1).toString().padStart(2, "0")}
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: { xs: "1.1rem", md: "1.45rem" },
                        color: "#1f1f1f",
                        lineHeight: 1.2,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {faq.question}
                    </Typography>
                  </AccordionSummary>

                  <AccordionDetails sx={{ px: { xs: 0, md: 9 }, pb: 4 }}>
                    <Typography
                      sx={{
                        color: "#555",
                        fontSize: "1.1rem",
                        lineHeight: 1.8,
                        maxWidth: "520px",
                      }}
                    >
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ContactFAQSection;
