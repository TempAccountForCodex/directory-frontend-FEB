// import { Box, Container, Grid, Typography, Stack } from "@mui/material";
// import { alpha, useTheme } from "@mui/material/styles";
// import { PrimaryActionButton } from "../../UI/PrimaryActionButton";

// const star = "/assets/publicAssets/images/common/star.svg";
// const darkhole = "assets/publicAssets/images/common/darkhole.svg";

// import HomeSearch from "../../publicComponents/Home/HomeSearch";

// export default function AboutHeroModern({ accent, eyebrow, title, bg }) {
//   const theme = useTheme();
//   const ACCENT = accent || "#00F2FE";

//   return (
//     <Box
//       component="section"
//       sx={{
//         position: "relative",
//         height: "100vh",
//         backgroundColor: "#041e18",
//         backgroundImage: `url(${star})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         display: "flex",
//         alignItems: "center",
//         overflow: "hidden",
//       }}
//     >
//       {/* Background Shape */}
//       <Box
//         sx={{
//           position: "absolute",
//           zIndex: 0,
//           backgroundImage: `url("${darkhole}")`,
//           backgroundRepeat: "no-repeat",
//           backgroundSize: "contain",
//           aspectRatio: "2074 / 1333",
//           top: "12%",
//           left: "-70%",
//           width: "280%",
//           opacity: 0.4,
//           "@media (min-width: 640px)": {
//             top: "-4%",
//             width: "130%",
//             left: "-15%",
//           },
//         }}
//       />

//       {/* Map */}
//       <Box
//         component="img"
//         src={bg}
//         sx={{
//           position: "absolute",
//           top: { xs: "0%", lg: "-10%" },
//           right: "0%",
//           width: { xs: "84%", sm: "62%" },
//           zIndex: 1,
//           mixBlendMode: "screen",
//           opacity: { xs: 0.4, lg: 0.7 },
//           maskImage: "linear-gradient(to left, black 40%, transparent 100%)",
//           pointerEvents: "none",
//         }}
//       />

//       <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
//         <Grid container>
//           <Grid item xs={12} sm={10} md={8} lg={7}>
//             {/* ===== MASSIVE BACKGROUND WORD ===== */}
//             <Typography
//               sx={{
//                 position: "absolute",
//                 top: { sm: "0px", lg: "-40px" },
//                 left: 0,
//                 fontSize: {
//                   xs: "3rem",
//                   sm: "4rem",
//                   md: "10rem",
//                   lg: "12rem",
//                 },
//                 fontWeight: 900,
//                 color: "rgb(255 255 255 / 10%)",
//                 lineHeight: 1,
//                 pointerEvents: "none",
//                 userSelect: "none",
//               }}
//             >
//               BUILT
//             </Typography>

//             {/* ===== EYEBROW ===== */}
//             <Typography
//               sx={{
//                 color: alpha("#fff", 0.6),
//                 letterSpacing: "0.35em",
//                 fontSize: "0.8rem",
//                 fontWeight: 600,
//                 mb: 2,
//                 visibility: "hidden", //do not changee this
//               }}
//             >
//               {eyebrow || "BUILT FOR BUSINESSES"}
//             </Typography>

//             {/* ===== MAIN HEADLINE ===== */}

//             <Typography
//               sx={{
//                 fontWeight: 900,
//                 fontSize: {
//                   xs: "2.5rem",
//                   sm: "3.8rem",
//                   md: "4.8rem",
//                   lg: "5.2rem",
//                 },
//                 lineHeight: 0.95,
//                 color: "transparent",
//                 WebkitTextStroke: "1px rgba(255,255,255,0.8)",
//                 letterSpacing: "-0.03em",
//                 mb: 3,
//                 textShadow: `0 0 30px ${alpha(ACCENT, 0.2)}`,
//               }}
//             >
//               {title}
//             </Typography>

//             {/* ===== ACCENT LABEL ===== */}
//             <Stack direction="row" alignItems="center" spacing={2} mb={5}>
//               <Box
//                 sx={{
//                   width: 60,
//                   height: "2px",
//                   backgroundColor: ACCENT,
//                 }}
//               />
//               <Typography
//                 sx={{
//                   color: ACCENT,
//                   fontWeight: 600,
//                   letterSpacing: "0.15em",
//                   fontSize: "0.85rem",
//                 }}
//               >
//                 MADE FOR BUSINESSES
//               </Typography>
//             </Stack>

//             <Box sx={{ pr: "20%" }}>
//               <HomeSearch />
//             </Box>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// }

import { Box, Container, Grid, Typography, Stack, Chip } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { keyframes } from "@mui/system";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import BoltIcon from "@mui/icons-material/Bolt";
import PublicIcon from "@mui/icons-material/Public";

const star = "/assets/publicAssets/images/common/star.svg";
const darkhole = "assets/publicAssets/images/common/darkhole.svg";

import HomeSearch from "../../publicComponents/Home/HomeSearch";

// ── Animations ──────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(28px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0px 0px rgba(56,141,145,0.4); }
  50%       { box-shadow: 0 0 18px 6px rgba(56,141,145,0.25); }
`;

// ── Static data ──────────────────────────────────────────────────────────────
const STATS = [
  { value: "12K+", label: "Verified Providers" },
  { value: "98%", label: "Satisfaction Rate" },
  { value: "180+", label: "Countries Covered" },
];

const CATEGORIES = [
  "IT & Software",
  "Legal Services",
  "Finance",
  "Marketing",
  "Design",
  "Logistics",
  "HR & Staffing",
  "Consulting",
];

const TRUST_BADGES = [
  {
    icon: <VerifiedUserIcon sx={{ fontSize: "0.95rem" }} />,
    text: "Verified Listings",
  },
  { icon: <BoltIcon sx={{ fontSize: "0.95rem" }} />, text: "Instant Match" },
  { icon: <PublicIcon sx={{ fontSize: "0.95rem" }} />, text: "Global Network" },
];

// ── Component ────────────────────────────────────────────────────────────────
export default function AboutHeroModern({ accent, eyebrow, title, bg }) {
  const ACCENT = accent || "#388d91";

  return (
    <Box
      component="section"
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundColor: "#041e18",
        backgroundImage: `url(${star})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        pt: { xs: 10, md: 0 },
        pb: { xs: 6, md: 0 },
      }}
    >
      {/* ── Darkhole bg ── */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 0,
          backgroundImage: `url("${darkhole}")`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
          aspectRatio: "2074 / 1333",
          top: "12%",
          left: "-70%",
          width: "280%",
          opacity: 0.4,
          "@media (min-width: 640px)": {
            top: "-4%",
            width: "130%",
            left: "-15%",
          },
        }}
      />

      {/* ── Map image ── */}
      <Box
        component="img"
        src={bg}
        alt="Directory network map"
        loading="eager"
        decoding="async"
        fetchPriority="high"
        sx={{
          position: "absolute",
          top: { xs: "0%", lg: "0%" },
          right: "0%",
          width: { xs: "84%", sm: "57%" },
          zIndex: 1,
          mixBlendMode: "screen",
          opacity: { xs: 0.35, lg: 1 },
          maskImage: "linear-gradient(to left, black 40%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Subtle teal radial glow ── */}
      <Box
        sx={{
          position: "absolute",
          zIndex: 0,
          bottom: "-20%",
          left: "-10%",
          width: "60%",
          height: "60%",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${alpha(ACCENT, 0.12)} 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <Container maxWidth="xl" sx={{ position: "relative", zIndex: 2 }}>
        <Grid container>
          <Grid item xs={12} sm={10} md={8} lg={7}>
            {/* ── Ghost BG word ── */}
            <Typography
              sx={{
                position: "absolute",
                top: { sm: "0px", lg: "-40px" },
                left: 0,
                fontSize: { xs: "3rem", sm: "4rem", md: "10rem", lg: "12rem" },
                fontWeight: 900,
                color: "rgb(255 255 255 / 6%)",
                lineHeight: 1,
                pointerEvents: "none",
                userSelect: "none",
              }}
            >
              BUILT
            </Typography>

            {/* ── Eyebrow (hidden per original) ── */}
            <Typography
              sx={{
                color: alpha("#fff", 0.6),
                letterSpacing: "0.35em",
                fontSize: "0.8rem",
                fontWeight: 600,
                mb: 2,
                visibility: "hidden",
              }}
            >
              {eyebrow || "BUILT FOR BUSINESSES"}
            </Typography>

            {/* ── Trust badges row ── */}
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              useFlexGap
              mb={3}
              sx={{
                animation: `${fadeUp} 0.6s ease both`,
                animationDelay: "0.1s",
                "@media (max-width: 899px)": {
                  animation: "none",
                },
              }}
            >
              {TRUST_BADGES.map((b) => (
                <Stack
                  key={b.text}
                  direction="row"
                  alignItems="center"
                  spacing={0.8}
                  sx={{
                    border: `1px solid ${alpha(ACCENT, 0.35)}`,
                    borderRadius: "999px",
                    px: 1.5,
                    py: 0.5,
                    backdropFilter: "blur(6px)",
                    backgroundColor: alpha(ACCENT, 0.06),
                    "@media (max-width: 899px)": {
                      backdropFilter: "none",
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{ fontSize: "0.85rem", color: "white" }}
                  >
                    {b.icon}
                  </Box>
                  <Typography
                    sx={{
                      color: alpha("#fff", 0.75),
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {b.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>

            {/* ── Main headline ── */}
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: {
                  xs: "2.5rem",
                  sm: "3.8rem",
                  md: "4.8rem",
                  lg: "5.2rem",
                },
                lineHeight: 0.95,
                color: "transparent",
                WebkitTextStroke: "1px rgba(255,255,255,0.8)",
                letterSpacing: "-0.03em",
                mb: 3,
                textShadow: `0 0 30px ${alpha(ACCENT, 0.2)}`,
                animation: `${fadeUp} 0.7s ease both`,
                animationDelay: "0.2s",
                "@media (max-width: 899px)": {
                  animation: "none",
                },
              }}
            >
              {title}
            </Typography>

            {/* ── Accent divider label ── */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={2}
              mb={2.5}
              sx={{
                animation: `${fadeUp} 0.7s ease both`,
                animationDelay: "0.3s",
                "@media (max-width: 899px)": {
                  animation: "none",
                },
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: "2px",
                  backgroundColor: "white",
                  animation: `${pulseGlow} 2.5s ease-in-out infinite`,
                  "@media (max-width: 899px)": {
                    animation: "none",
                  },
                }}
              />
              <Typography
                sx={{
                  color: "white",
                  fontWeight: 600,
                  letterSpacing: "0.15em",
                  fontSize: "0.85rem",
                }}
              >
                MADE FOR BUSINESSES
              </Typography>
            </Stack>

            {/* ── Sub-tagline ── */}
            <Typography
              sx={{
                color: alpha("#fff", 0.5),
                fontSize: { xs: "0.92rem", md: "1rem" },
                lineHeight: 1.7,
                mb: 4,
                maxWidth: 460,
                animation: `${fadeUp} 0.7s ease both`,
                animationDelay: "0.38s",
                "@media (max-width: 899px)": {
                  animation: "none",
                },
              }}
            >
              Connect with pre-vetted service providers across every industry —
              faster, smarter, and with full confidence.
            </Typography>

            {/* ── Search ── */}
            <Box
              sx={{
                pr: { xs: "0%", md: "15%" },
                animation: `${fadeUp} 0.7s ease both`,
                animationDelay: "0.45s",
                "@media (max-width: 899px)": {
                  animation: "none",
                },
              }}
            >
              <HomeSearch />
            </Box>

            {/* ── Popular category pills ── */}
            <Box
              sx={{
                mt: 3,
                animation: `${fadeUp} 0.7s ease both`,
                animationDelay: "0.55s",
                "@media (max-width: 899px)": {
                  animation: "none",
                },
              }}
            >
              <Typography
                sx={{
                  color: "#fff",
                  fontSize: "0.7rem",
                  letterSpacing: "0.2em",
                  mb: 1.2,
                  fontWeight: 600,
                }}
              >
                POPULAR CATEGORIES
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
                {CATEGORIES.map((cat) => (
                  <Chip
                    key={cat}
                    label={cat}
                    size="small"
                    clickable
                    sx={{
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      color: alpha("#fff", 0.65),
                      backgroundColor: alpha("#fff", 0.05),
                      border: `1px solid ${alpha("#fff", 0.1)}`,
                      borderRadius: "6px",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: alpha(ACCENT, 0.15),
                        borderColor: alpha(ACCENT, 0.5),
                        color: "#fff",
                      },
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* ── Stats row ── */}
            <Stack
              direction="row"
              spacing={0}
              divider={
                <Box
                  sx={{
                    width: "1px",
                    backgroundColor: alpha("#fff", 0.1),
                    mx: 3,
                    my: 0.5,
                  }}
                />
              }
              mt={5}
              sx={{
                animation: `${fadeUp} 0.7s ease both`,
                animationDelay: "0.65s",
                "@media (max-width: 899px)": {
                  animation: "none",
                },
              }}
            >
              {STATS.map((s) => (
                <Box key={s.label}>
                  <Typography
                    sx={{
                      fontSize: { xs: "1.6rem", md: "2rem" },
                      fontWeight: 800,
                      color: "#fff",
                      lineHeight: 1,
                      mb: 0.4,
                      background: `linear-gradient(135deg, #fff 40%, ${ACCENT})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    sx={{
                      color: alpha("#fff", 0.4),
                      fontSize: "0.72rem",
                      fontWeight: 500,
                      letterSpacing: "0.05em",
                    }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
