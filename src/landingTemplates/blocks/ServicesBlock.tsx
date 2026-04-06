import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Divider,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import type { BusinessData } from "../types/BusinessData";
import type { TemplateTheme } from "../templateEngine/types";
import FadeIn from "./FadeIn";

export interface ServicesBlockProps {
  data: BusinessData;
  theme: TemplateTheme;
  variant?: "cards" | "list" | "grid";
}

function CardsServices({ data, theme }: Omit<ServicesBlockProps, "variant">) {
  const services = data.services ?? [];
  return (
    <Box sx={{ bgcolor: theme.bgSecondary, py: { xs: 8, md: 12 }, px: 3 }}>
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 1,
          }}
        >
          Our Services
        </Typography>
        <Box
          sx={{
            width: 48,
            height: 3,
            bgcolor: theme.primaryColor,
            mx: "auto",
            borderRadius: 999,
            mb: 6,
          }}
        />
      </FadeIn>
      <Grid container spacing={3} sx={{ maxWidth: 1100, mx: "auto" }}>
        {services.map((s, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <FadeIn delay={i * 0.08}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  height: "100%",
                  border: `1px solid ${theme.borderColor}`,
                  bgcolor: theme.surfaceColor,
                  transition: "box-shadow 0.2s",
                  "&:hover": { boxShadow: "0 8px 32px rgba(0,0,0,0.12)" },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Avatar
                    sx={{
                      bgcolor: `${theme.primaryColor}18`,
                      color: theme.primaryColor,
                      mb: 2,
                      width: 48,
                      height: 48,
                    }}
                  >
                    {s.name[0]}
                  </Avatar>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: theme.fontFamily,
                      fontWeight: 700,
                      color: theme.headingColor,
                    }}
                  >
                    {s.name}
                  </Typography>
                  {s.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        color: theme.bodyColor,
                        fontFamily: theme.fontFamily,
                      }}
                    >
                      {s.description}
                    </Typography>
                  )}
                  {s.price && (
                    <Typography
                      sx={{
                        mt: 2,
                        fontWeight: 700,
                        color: theme.primaryColor,
                        fontFamily: theme.fontFamily,
                      }}
                    >
                      {s.price}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </FadeIn>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

function ListServices({ data, theme }: Omit<ServicesBlockProps, "variant">) {
  const services = data.services ?? [];
  return (
    <Box sx={{ bgcolor: theme.bgPrimary, py: { xs: 8, md: 12 }, px: 3 }}>
      <Box sx={{ maxWidth: 760, mx: "auto" }}>
        <FadeIn>
          <Typography
            variant="h3"
            sx={{
              fontFamily: theme.fontFamily,
              fontWeight: 800,
              color: theme.headingColor,
              mb: 6,
            }}
          >
            What We Offer
          </Typography>
        </FadeIn>
        {services.map((s, i) => (
          <FadeIn key={i} delay={i * 0.07}>
            <>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  py: 3,
                  alignItems: "flex-start",
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{ color: theme.primaryColor, mt: 0.5 }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: theme.fontFamily,
                        fontWeight: 700,
                        color: theme.headingColor,
                      }}
                    >
                      {s.name}
                    </Typography>
                    {s.price && (
                      <Typography
                        sx={{
                          fontWeight: 700,
                          color: theme.primaryColor,
                          fontFamily: theme.fontFamily,
                        }}
                      >
                        {s.price}
                      </Typography>
                    )}
                  </Box>
                  {s.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        color: theme.bodyColor,
                        fontFamily: theme.fontFamily,
                      }}
                    >
                      {s.description}
                    </Typography>
                  )}
                </Box>
              </Box>
              {i < services.length - 1 && (
                <Divider sx={{ borderColor: theme.borderColor }} />
              )}
            </>
          </FadeIn>
        ))}
      </Box>
    </Box>
  );
}

function GridServices({ data, theme }: Omit<ServicesBlockProps, "variant">) {
  const services = data.services ?? [];
  return (
    <Box sx={{ bgcolor: theme.bgSecondary, py: { xs: 8, md: 12 }, px: 3 }}>
      <FadeIn>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            fontFamily: theme.fontFamily,
            fontWeight: 800,
            color: theme.headingColor,
            mb: 2,
          }}
        >
          Services
        </Typography>
        <Typography
          sx={{
            textAlign: "center",
            color: theme.bodyColor,
            fontFamily: theme.fontFamily,
            mb: 6,
            maxWidth: 500,
            mx: "auto",
          }}
        >
          {data.tagline ?? "Premium solutions tailored for your needs"}
        </Typography>
      </FadeIn>
      <Grid container spacing={2} sx={{ maxWidth: 1100, mx: "auto" }}>
        {services.map((s, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <FadeIn delay={i * 0.07}>
              <Box
                sx={{
                  border: `1px solid ${theme.accentColor}44`,
                  borderRadius: 2,
                  p: 3,
                  height: "100%",
                  bgcolor: theme.surfaceColor,
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: theme.accentColor },
                }}
              >
                <Typography
                  variant="overline"
                  sx={{
                    color: theme.accentColor,
                    fontWeight: 700,
                    letterSpacing: 2,
                    fontFamily: theme.fontFamily,
                  }}
                >
                  {s.price ?? ""}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: theme.fontFamily,
                    fontWeight: 700,
                    color: theme.headingColor,
                    mt: 0.5,
                  }}
                >
                  {s.name}
                </Typography>
                {s.description && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      color: theme.bodyColor,
                      fontFamily: theme.fontFamily,
                      lineHeight: 1.7,
                    }}
                  >
                    {s.description}
                  </Typography>
                )}
              </Box>
            </FadeIn>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}

const ServicesBlock: React.FC<ServicesBlockProps> = ({
  data,
  theme,
  variant = "cards",
}) => {
  if (!data.services?.length) return null;
  if (variant === "list") return <ListServices data={data} theme={theme} />;
  if (variant === "grid") return <GridServices data={data} theme={theme} />;
  return <CardsServices data={data} theme={theme} />;
};

export default ServicesBlock;
