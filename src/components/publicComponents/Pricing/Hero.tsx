// import React from "react";
// import { Box, Container, Typography, Button, Stack, Chip } from "@mui/material";
// // Aapke directory structure ke mutabiq import
// import Orb from "./../../ReactBits/Orb";
// import { ResponsiveBr } from "./../../UI/ResponsiveBr";

// const HeroSection: React.FC = () => {
//   return (
//     <Box
//       sx={{
//         width: "100%",
//         minHeight: "100vh",
//         position: "relative",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         bgcolor: "#020303",
//         overflow: "hidden",
//         // ✅ Gradient bottom border
//         "&::after": {
//           content: '""',
//           position: "absolute",
//           bottom: 0,
//           left: 0,
//           width: "100%",
//           height: "2px",
//           background: "linear-gradient(90deg, #ffffffff, #ffffffff, #ffffffff)",
//           opacity: 0.9,
//           zIndex: 2,
//         },
//       }}
//     >
//       {/* BACKGROUND LAYER: Orb Animation (Full Cover) */}
//       <Box
//         sx={{
//           position: "absolute",
//           top: 0,
//           left: 0,
//           width: "100%",
//           height: "100%",
//           zIndex: 0,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//         }}
//       >
//         <Orb
//           backgroundColor="#071c1e"
//           hoverIntensity={0.5}
//           rotateOnHover={true}
//           hue={30} // Purple/Blue glow tone
//           forceHoverState={false}
//         />
//       </Box>

//       {/* CONTENT LAYER: Centered Text and Modern Buttons */}
//       <Container
//         maxWidth="md"
//         sx={{
//           position: "relative",
//           zIndex: 1,
//           textAlign: "center", // Text ko center karne ke liye
//           color: "white",
//         }}
//       >
//         {/* New Background Badge (Optional but matches demo) */}
//         <Chip
//           label="✨ Transparent Pricing"
//           sx={{
//             bgcolor: "rgba(255,255,255,0.05)",
//             color: "white",
//             border: "1px solid rgba(255,255,255,0.1)",
//             mb: 4,
//             fontWeight: 500,
//             fontSize: "0.85rem",
//             backdropFilter: "blur(10px)",
//           }}
//         />

//         <Typography
//           variant="h1"
//           sx={{
//             fontWeight: 900,
//             fontSize: { xs: "2.8rem", md: "3rem" },
//             lineHeight: 1.1,
//             letterSpacing: "-0.03em",
//             mb: 3,
//             textShadow: "0px 0px 40px rgba(0,0,0,0.5)", // Depth ke liye
//           }}
//         >
//           Pricing plans built to grow <ResponsiveBr hideFrom="md" /> your
//           business online.
//         </Typography>

//         <Typography
//           variant="body1"
//           sx={{
//             fontSize: { xs: "1.1rem", md: "1.1rem" },
//             color: "rgba(255,255,255,0.6)", // Faded look jaisa demo mein hai
//             mb: 6,
//             maxWidth: "700px",
//             mx: "auto", // Center body text
//             lineHeight: 1.5,
//           }}
//         >
//           Our directory plans come with enhanced features to power your
//           business’ success. Powerful, flexible, and cost-effective.
//         </Typography>

//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={2}
//           justifyContent="center" // Buttons center mein honge
//           alignItems="center"
//         >
//           <Button
//             variant="contained"
//             sx={{
//               bgcolor: "white",
//               color: "black",
//               px: 5,
//               py: 1.8,
//               fontWeight: 800,
//               borderRadius: "999px", // Pill shape buttons
//               fontSize: "1rem",
//               textTransform: "none",
//               "&:hover": { bgcolor: "#e0e0e0" },
//             }}
//           >
//             Get Started
//           </Button>
//           <Button
//             variant="outlined"
//             sx={{
//               color: "white",
//               borderColor: "rgba(255,255,255,0.2)",
//               px: 5,
//               py: 1.8,
//               fontWeight: 800,
//               borderRadius: "999px", // Pill shape buttons
//               fontSize: "1rem",
//               textTransform: "none",
//               backdropFilter: "blur(5px)",
//               display: "none",
//               "&:hover": {
//                 borderColor: "white",
//                 bgcolor: "rgba(255,255,255,0.1)",
//               },
//             }}
//           >
//             Learn More
//           </Button>
//         </Stack>
//       </Container>
//     </Box>
//   );
// };

// export default HeroSection;

import React from "react";
import { Box, Container, Typography, Button, Stack, Chip } from "@mui/material";
import { ResponsiveBr } from "./../../UI/ResponsiveBr";

const star = "/assets/publicAssets/images/common/star.svg";

const HeroSection: React.FC = () => {
  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "70vh",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#020303",
        overflow: "hidden",

        backgroundImage: `
          radial-gradient(circle at 20% 30%, rgba(55,140,146,0.35) 0%, rgba(2,3,3,0) 45%),
          radial-gradient(circle at 80% 70%, rgba(45,212,191,0.24) 0%, rgba(2,3,3,0) 42%),
          url(${star})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",

        // Bottom gradient border
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "2px",
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
          zIndex: 3,
        },
      }}
    >
      {/* ✅ GLASS BLUR OVERLAY */}

      {/* CONTENT */}
      <Container
        maxWidth="md"
        sx={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          color: "white",
        }}
      >
        <Chip
          label="✨ Transparent Pricing"
          sx={{
            bgcolor: "rgba(255,255,255,0.08)",
            color: "white",
            border: "1px solid rgba(255,255,255,0.2)",
            mb: 4,
            fontWeight: 500,
            fontSize: "0.85rem",
            backdropFilter: "blur(10px)",
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontWeight: 900,
            fontSize: { xs: "1.8rem", sm: "2.8rem", md: "3rem" },
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            mb: 3,
            textShadow: "0px 0px 40px rgba(0,0,0,0.6)",
          }}
        >
          Pricing plans built to grow <ResponsiveBr hideFrom="md" /> your
          business online.
        </Typography>

        <Typography
          variant="body1"
          sx={{
            fontSize: { xs: "1.1rem", md: "1.1rem" },
            color: "rgba(255,255,255,0.7)",
            mb: 6,
            maxWidth: "700px",
            mx: "auto",
            lineHeight: 1.5,
          }}
        >
          Our directory plans come with enhanced features to power your
          business’ success. Powerful, flexible, and cost-effective.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="center"
          alignItems="center"
        >
          <Button
            variant="contained"
            sx={{
              bgcolor: "white",
              color: "black",
              px: 5,
              py: 1.8,
              fontWeight: 800,
              borderRadius: "999px",
              fontSize: "1rem",
              textTransform: "none",
              boxShadow: "0 10px 30px rgba(255,255,255,0.15)",
              "&:hover": { bgcolor: "#e0e0e0" },
            }}
          >
            Get Started
          </Button>

          <Button
            variant="outlined"
            sx={{
              color: "white",
              borderColor: "rgba(255,255,255,0.3)",
              px: 5,
              py: 1.8,
              fontWeight: 800,
              borderRadius: "999px",
              fontSize: "1rem",
              textTransform: "none",
              backdropFilter: "blur(10px)",
              "&:hover": {
                borderColor: "white",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Learn More
          </Button>
        </Stack>
      </Container>
    </Box>
  );
};

export default HeroSection;
