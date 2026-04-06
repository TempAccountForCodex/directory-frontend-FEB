import React from "react";
import { Box, Typography, Grid } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import type { BusinessData } from "../types/BusinessData";
import type { TemplateTheme } from "../templateEngine/types";
import FadeIn from "./FadeIn";

export interface LocationBlockProps {
  data: BusinessData;
  theme: TemplateTheme;
  variant?: "map" | "compact";
}

function HoursTable({
  data,
  theme,
}: {
  data: BusinessData;
  theme: TemplateTheme;
}) {
  if (!data.workingHours?.length) return null;
  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <AccessTimeIcon sx={{ color: theme.primaryColor, fontSize: 20 }} />
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            fontFamily: theme.fontFamily,
            color: theme.headingColor,
          }}
        >
          Hours
        </Typography>
      </Box>
      {data.workingHours.map((h, i) => (
        <Box
          key={i}
          sx={{ display: "flex", justifyContent: "space-between", py: 0.75 }}
        >
          <Typography
            variant="body2"
            sx={{ color: theme.bodyColor, fontFamily: theme.fontFamily }}
          >
            {h.day}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: theme.headingColor,
              fontFamily: theme.fontFamily,
            }}
          >
            {h.hours}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function MapLocation({ data, theme }: Omit<LocationBlockProps, "variant">) {
  const { location, contact } = data;
  const embedUrl = location?.embedUrl;
  return (
    <Box sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 12 }, px: 3 }}>
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 6,
          }}
        >
          Find Us
        </Typography>
      </FadeIn>
      <Grid
        container
        spacing={4}
        sx={{ maxWidth: 1100, mx: "auto" }}
        alignItems="stretch"
      >
        <Grid item xs={12} md={7}>
          <FadeIn direction="left">
            <Box
              sx={{
                borderRadius: 3,
                overflow: "hidden",
                height: { xs: 300, md: 400 },
                border: `1px solid ${theme.borderColor}`,
                bgcolor: theme.bgSecondary,
              }}
            >
              {embedUrl ? (
                <Box
                  component="iframe"
                  src={embedUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Location map"
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: theme.bgSecondary,
                  }}
                >
                  <LocationOnIcon
                    sx={{ fontSize: 80, color: theme.borderColor }}
                  />
                </Box>
              )}
            </Box>
          </FadeIn>
        </Grid>
        <Grid item xs={12} md={5}>
          <FadeIn direction="right" delay={0.1}>
            <Box
              sx={{
                p: 4,
                height: "100%",
                border: `1px solid ${theme.borderColor}`,
                borderRadius: 3,
                bgcolor: theme.surfaceColor,
              }}
            >
              {contact.address && (
                <Box
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    mb: 3,
                    alignItems: "flex-start",
                  }}
                >
                  <LocationOnIcon sx={{ color: theme.primaryColor, mt: 0.3 }} />
                  <Typography
                    sx={{
                      color: theme.bodyColor,
                      fontFamily: theme.fontFamily,
                      lineHeight: 1.6,
                    }}
                  >
                    {contact.address}
                  </Typography>
                </Box>
              )}
              <HoursTable data={data} theme={theme} />
            </Box>
          </FadeIn>
        </Grid>
      </Grid>
    </Box>
  );
}

function CompactLocation({ data, theme }: Omit<LocationBlockProps, "variant">) {
  const { contact } = data;
  return (
    <Box sx={{ bgcolor: theme.bgSecondary, py: { xs: 6, md: 8 }, px: 3 }}>
      <Box
        sx={{
          maxWidth: 800,
          mx: "auto",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
          gap: 4,
        }}
      >
        <FadeIn direction="left">
          <Box>
            <Typography
              variant="h5"
              sx={{
                fontFamily: theme.fontFamily,
                fontWeight: 700,
                color: theme.headingColor,
                mb: 2,
              }}
            >
              Address
            </Typography>
            {contact.address && (
              <Typography
                sx={{
                  color: theme.bodyColor,
                  fontFamily: theme.fontFamily,
                  lineHeight: 1.7,
                }}
              >
                {contact.address}
              </Typography>
            )}
            {contact.phone && (
              <Typography
                sx={{
                  color: theme.primaryColor,
                  fontFamily: theme.fontFamily,
                  mt: 1.5,
                }}
              >
                {contact.phone}
              </Typography>
            )}
          </Box>
        </FadeIn>
        <FadeIn direction="right" delay={0.1}>
          <HoursTable data={data} theme={theme} />
        </FadeIn>
      </Box>
    </Box>
  );
}

const LocationBlock: React.FC<LocationBlockProps> = ({
  data,
  theme,
  variant = "map",
}) => {
  if (!data.location && !data.contact?.address && !data.workingHours?.length)
    return null;
  if (variant === "compact")
    return <CompactLocation data={data} theme={theme} />;
  return <MapLocation data={data} theme={theme} />;
};

export default LocationBlock;
