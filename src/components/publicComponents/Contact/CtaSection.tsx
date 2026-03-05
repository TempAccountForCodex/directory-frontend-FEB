import React, { useState } from "react";
import { Box, Container, Typography, Stack } from "@mui/material";
import {
  MessageOutlined,
  StorefrontOutlined,
  SettingsOutlined,
  StarBorderOutlined,
} from "@mui/icons-material";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";

const layersDesign = "/assets/publicAssets/images/ContactUs/layersdesign.webp";

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
