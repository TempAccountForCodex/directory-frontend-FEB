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
const globeImg = "/assets/publicAssets/images/ContactUs/earthblack.webp";

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
        fontFamily: "'DM Sans', system-ui, sans-serif",
      }}
    >
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
          filter: { xs: "blur(48px)", md: "blur(100px)" },
          zIndex: 0,
          display: { xs: "none", md: "block" },
          animation: {
            xs: "none",
            md: `${pulseGlow} 10s ease-in-out infinite`,
          },
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
          animation: { xs: "none", md: `${arcDrift} 12s ease-in-out infinite` },
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
          animation: { xs: "none", md: `${spinSlow} 60s linear infinite` },
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
          animation: { xs: "none", md: `${floatY} 8s ease-in-out infinite` },
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
            px: { xs: 5, sm: 0 },
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
