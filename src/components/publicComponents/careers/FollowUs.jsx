import React from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Link as MUILink,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import companyData from "../../../utils/data/CompanyInfo";

/** ---- tokens to match your site ---- */
const ACCENT = "#378C92"; // your teal
const SURFACE = "#0f1215"; // dark panels you use
const SURFACE2 = "#0b0e11"; // slightly darker
const BORDER = "rgba(255,255,255,0.06)";

const Shell = styled(Box)(({ theme }) => ({
  position: "relative",
  borderRadius: 18,
  padding: theme.spacing(7.5, 4.5),
  backgroundImage:
    "url(https://prestige-solutions.com/wp-content/uploads/2024/06/Our-Work.png)",
  backgroundPosition: "left",
  // background: `linear-gradient(180deg, ${SURFACE} 0%, ${SURFACE2} 100%)`,
  border: `1px solid ${BORDER}`,
  boxShadow: "0 18px 36px rgba(2,10,16,.22), 0 6px 14px rgba(2,10,16,.16)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: theme.spacing(3),
  flexWrap: "wrap",
  overflow: "hidden",
}));

/* subtle grid lines like your hero */
const GridOverlay = styled("span")({
  position: "absolute",
  inset: 0,
  pointerEvents: "none",
  opacity: 0.22,
  background:
    "repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 44px), \
     repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 44px)",
  maskImage: "radial-gradient(140% 90% at 50% 10%, #000 55%, transparent 100%)",
});

/* thin accent line at the left to echo your cards’ dividers */
const Accent = styled("span")({
  position: "absolute",
  left: 0,
  top: 14,
  bottom: 14,
  width: 2,
  borderRadius: 2,
  background: ACCENT,
  opacity: 0.9,
});

/* CTA: keeps the same teal brand feeling, but toned down */
const Cta = styled(Button)({
  textTransform: "none",
  fontWeight: 700,
  letterSpacing: 0.2,
  padding: "10px 16px",
  borderRadius: 10,
  color: "#071318",
  background: `linear-gradient(90deg, ${ACCENT} 0%, #00f7ff 60%, #0087ec 100%)`,
  boxShadow: "0 10px 24px rgba(0,163,203,.22), 0 6px 14px rgba(55,140,146,.18)",
  "&:hover": { filter: "brightness(1.05)" },
});

/* Simple ring icon (no glow), matches your minimal cards */
const RingIcon = styled(IconButton)({
  width: 62,
  height: 62,
  borderRadius: "50%",
  color: "#0A66C2",
  background: "#0f1519",
  border: `1px solid ${BORDER}`,
  transition: "transform .15s ease, box-shadow .25s ease",
  "&:hover": {
    transform: "translateY(-1px)",
    boxShadow: "0 0 0 8px rgba(0,135,236,0.10)",
    background: "#11181e",
  },
});

const FollowUs = () => {
  const linkedIn = companyData?.socialMedia?.linkedin ?? "#";

  return (
    <Container maxWidth="lg" sx={{ mb: { xs: 8, md: 12 }, mt: { xs: 4 } }}>
      <Shell>
        <GridOverlay />
        <Accent />

        {/* Text block */}
        <Box sx={{ minWidth: 280, flex: 1 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 800,
              lineHeight: 1.15,
              fontSize: { xs: 22, sm: 28, md: 32 },
              color: "rgba(255,255,255,.96)",
              mb: 0.5,
            }}
          >
            Stay connected with Techietribe.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: "rgba(255,255,255,.72)",
              fontSize: { xs: 14.5, sm: 15.5 },
              maxWidth: 720,
            }}
          >
            Follow us on{" "}
            <MUILink
              href={linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              underline="hover"
              sx={{ color: ACCENT, fontWeight: 700 }}
            >
              LinkedIn
            </MUILink>{" "}
            for product updates, AI insights, and team highlights.
          </Typography>
        </Box>

        {/* Actions */}
        <Box sx={{ display: "flex", gap: 1.25, alignItems: "center" }}>
          <RingIcon
            href={linkedIn}
            target="_blank"
            component="a"
            aria-label="LinkedIn"
          >
            <LinkedInIcon sx={{ fontSize: 36, color: "white" }} />
          </RingIcon>
        </Box>
      </Shell>
    </Container>
  );
};

export default FollowUs;
