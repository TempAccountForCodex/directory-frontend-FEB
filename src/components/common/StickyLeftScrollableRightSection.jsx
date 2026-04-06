import React, { useEffect, useState } from "react";
import { Box, Container, Typography, Button } from "@mui/material";
import ButtonV2 from "../UI/ButtonV2";

const uniqueLinesbg = "/assets/publicAssets/images/common/uniqueLinesbg.webp";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

const StickyLeftSection = ({
  title,
  subtitle,
  callToActionText,
  callToActionLink,
  rightContent,
  bgStart = 0,
  bgEnd = 120,
  speedFactor = 1.5,
}) => {
  const [bgPosX, setBgPosX] = useState(bgStart);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const scrollable =
          document.documentElement.scrollHeight - window.innerHeight;
        const y = window.scrollY || window.pageYOffset || 0;
        const progress = scrollable > 0 ? y / scrollable : 0;

        const adjustedProgress = progress * speedFactor;

        const next = bgStart + (bgEnd - bgStart) * adjustedProgress;
        setBgPosX(
          clamp(next, Math.min(bgStart, bgEnd), Math.max(bgStart, bgEnd)),
        );
        ticking = false;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [bgStart, bgEnd, speedFactor]);

  return (
    <Box
      sx={{
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${uniqueLinesbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.5,
          zIndex: 0,
        },
      }}
    >
      <Container maxWidth="lg" disableGutters>
        <Box
          sx={{
            display: { xs: "block", md: "flex" },
            minHeight: "60vh",
            position: "relative",
            padding: {
              xs: "0px 26px",
              sm: " 0px 40px",
              md: "0px 20px",
              lg: "0",
            },
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", md: "59%" },
              py: 8,
              pr: 8,
              position: { xs: "relative", md: "sticky" },
              top: "7%",
              height: "fit-content",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              zIndex: 1,
            }}
          >
            <Typography
              variant="overline"
              color="black"
              sx={{ display: "block", mb: 1 }}
            >
              {subtitle}
            </Typography>

            <Typography
              variant="h3"
              fontWeight={500}
              sx={{
                mb: 4,
                lineHeight: 1.3,
                fontSize: { xs: "24px", sm: "36px", md: "50px" },
                fontFamily: "Plus Jakarta Sans",
              }}
            >
              {title}
            </Typography>

            {callToActionText && callToActionLink && (
              <ButtonV2
                label={callToActionText}
                to={callToActionLink}
                size="medium"
                textColor="black"
              />
            )}
          </Box>

          <Box
            sx={{
              width: { xs: "100%", md: "60%", borderLeft: "1px solid #dee2e6" },
              pt: { xs: 5, md: 20 },
              ml: { xs: 3, md: 2 },
              mb: 8,
            }}
          >
            {rightContent.map((item, index) => (
              <Box key={index} sx={{ mb: 0 }}>
                {item}
              </Box>
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default StickyLeftSection;
