import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import type { BusinessData } from "../types/BusinessData";
import type { TemplateTheme } from "../templateEngine/types";
import FadeIn from "./FadeIn";

export interface CTASectionProps {
  data: BusinessData;
  theme: TemplateTheme;
  variant?: "gradient" | "outlined" | "dark";
}

function GradientCTA({ data, theme }: Omit<CTASectionProps, "variant">) {
  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
        py: { xs: 8, md: 10 },
        px: 3,
        textAlign: "center",
      }}
    >
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: "#fff",
            mb: 2,
          }}
        >
          Ready to Get Started?
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.85)",
            fontFamily: theme.fontFamily,
            mb: 4,
            fontSize: "1.1rem",
          }}
        >
          Contact {data.name} today and let's make it happen.
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#fff",
              color: theme.primaryColor,
              fontWeight: 700,
              borderRadius: 999,
              px: 5,
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
          >
            Contact Us
          </Button>
        </Stack>
      </FadeIn>
    </Box>
  );
}

function OutlinedCTA({ data, theme }: Omit<CTASectionProps, "variant">) {
  return (
    <Box sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 10 }, px: 3 }}>
      <FadeIn>
        <Box
          sx={{
            maxWidth: 860,
            mx: "auto",
            border: `2px solid ${theme.primaryColor}`,
            borderRadius: 4,
            p: { xs: 4, md: 6 },
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: "center",
            justifyContent: "space-between",
            gap: 4,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontFamily: theme.fontFamily,
                fontWeight: 800,
                color: theme.headingColor,
                mb: 1,
              }}
            >
              Ready to Work Together?
            </Typography>
            <Typography
              sx={{ color: theme.bodyColor, fontFamily: theme.fontFamily }}
            >
              Reach out to {data.name} and let's get started.
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: theme.primaryColor,
              fontWeight: 700,
              borderRadius: 2,
              px: 5,
              flexShrink: 0,
              "&:hover": {
                bgcolor: theme.primaryColor,
                filter: "brightness(0.9)",
              },
            }}
          >
            Get In Touch
          </Button>
        </Box>
      </FadeIn>
    </Box>
  );
}

function DarkCTA({ data, theme }: Omit<CTASectionProps, "variant">) {
  return (
    <Box
      sx={{
        bgcolor: theme.bgSecondary,
        py: { xs: 8, md: 12 },
        px: 3,
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 100%, ${theme.accentColor}1a 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <FadeIn>
        <Box
          sx={{
            width: 60,
            height: 2,
            bgcolor: theme.accentColor,
            mx: "auto",
            mb: 4,
            borderRadius: 999,
          }}
        />
        <Typography
          variant="h3"
          sx={{
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 2,
          }}
        >
          Let's Build Something Great
        </Typography>
        <Typography
          sx={{
            color: theme.bodyColor,
            fontFamily: theme.fontFamily,
            mb: 5,
            maxWidth: 500,
            mx: "auto",
          }}
        >
          Partner with {data.name} for results that matter.
        </Typography>
        <Button
          variant="contained"
          size="large"
          sx={{
            bgcolor: theme.accentColor,
            color: "#000",
            fontWeight: 700,
            borderRadius: 2,
            px: 6,
            py: 1.75,
            "&:hover": {
              bgcolor: theme.accentColor,
              filter: "brightness(0.9)",
            },
          }}
        >
          Start Today
        </Button>
      </FadeIn>
    </Box>
  );
}

const CTASection: React.FC<CTASectionProps> = ({
  data,
  theme,
  variant = "gradient",
}) => {
  if (variant === "outlined") return <OutlinedCTA data={data} theme={theme} />;
  if (variant === "dark") return <DarkCTA data={data} theme={theme} />;
  return <GradientCTA data={data} theme={theme} />;
};

export default CTASection;
