import React from "react";
import { Box, Typography, Button, Stack, Chip } from "@mui/material";
import { motion } from "framer-motion";
import type { BusinessData } from "../types/BusinessData";
import type { TemplateTheme } from "../templateEngine/types";
import PhoneIcon from "@mui/icons-material/Phone";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

export interface HeroBlockProps {
  data: BusinessData;
  theme: TemplateTheme;
  variant?: "gradient" | "split" | "dark" | "photo";
}

const MotionBox = motion(Box);
const MotionImg = motion.img;

/* ─── PHOTO HERO (full-bleed bg image + overlay) ─────────────── */
function PhotoHero({ data, theme }: Omit<HeroBlockProps, "variant">) {
  const imgSrc = data.gallery?.[0]?.url;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: { xs: "85vh", md: "92vh" },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Background image */}
      {imgSrc && (
        <MotionImg
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
          src={imgSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
          }}
        />
      )}

      {/* Fallback gradient when no image */}
      {!imgSrc && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
          }}
        />
      )}

      {/* Multi-layer scrim: dark left panel, fades right */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(105deg, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.62) 45%, rgba(0,0,0,0.25) 100%)",
        }}
      />
      {/* Bottom fade for readability */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "30%",
          background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
        }}
      />

      {/* Content */}
      <MotionBox
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: [0.22, 0.61, 0.36, 1] }}
        sx={{
          position: "relative",
          zIndex: 2,
          px: { xs: 4, md: 10 },
          maxWidth: 820,
        }}
      >
        {/* Top accent chip */}
        <Chip
          label="Welcome"
          size="small"
          sx={{
            bgcolor: `${theme.primaryColor}33`,
            color: "#fff",
            border: `1px solid rgba(255,255,255,0.3)`,
            backdropFilter: "blur(6px)",
            fontWeight: 600,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontSize: "0.62rem",
            mb: 3,
          }}
        />

        {data.logoUrl && (
          <Box
            component="img"
            src={data.logoUrl}
            alt={data.name}
            sx={{ height: 56, mb: 3, borderRadius: 2, display: "block" }}
          />
        )}

        <Typography
          variant="h1"
          sx={{
            fontFamily: theme.fontFamily,
            fontSize: { xs: "2.6rem", sm: "3.8rem", md: "5rem" },
            fontWeight: 900,
            color: "#fff",
            lineHeight: 1.06,
            letterSpacing: "-0.02em",
            mb: 2,
          }}
        >
          {data.name}
        </Typography>

        {data.tagline && (
          <Typography
            sx={{
              color: "rgba(255,255,255,0.82)",
              fontFamily: theme.fontFamily,
              fontSize: { xs: "1rem", md: "1.25rem" },
              lineHeight: 1.7,
              maxWidth: 560,
              mb: 5,
            }}
          >
            {data.tagline}
          </Typography>
        )}

        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Button
            variant="contained"
            size="large"
            endIcon={<ArrowForwardIcon />}
            sx={{
              bgcolor: theme.primaryColor,
              color: "#fff",
              fontWeight: 700,
              borderRadius: 999,
              px: 4,
              py: 1.5,
              "&:hover": {
                bgcolor: theme.primaryColor,
                filter: "brightness(0.9)",
              },
            }}
          >
            Get Started
          </Button>
          {data.contact.phone && (
            <Button
              variant="outlined"
              size="large"
              startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
              href={`tel:${data.contact.phone}`}
              sx={{
                borderColor: "rgba(255,255,255,0.5)",
                color: "#fff",
                borderRadius: 999,
                px: 4,
                py: 1.5,
                backdropFilter: "blur(4px)",
                bgcolor: "rgba(255,255,255,0.06)",
                "&:hover": {
                  borderColor: "#fff",
                  bgcolor: "rgba(255,255,255,0.12)",
                },
              }}
            >
              {data.contact.phone}
            </Button>
          )}
        </Stack>
      </MotionBox>

      {/* Bottom stats strip */}
      {data.reviews && data.reviews.length > 0 && (
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 2,
            px: { xs: 4, md: 10 },
            py: 3,
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ display: "flex", gap: 0.25 }}>
              {["★", "★", "★", "★", "★"].map((s, i) => (
                <Typography
                  key={i}
                  sx={{ color: "#fbbf24", fontSize: "0.85rem" }}
                >
                  {s}
                </Typography>
              ))}
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.7)", letterSpacing: 0.5 }}
            >
              {data.reviews.length * 100}+ happy clients
            </Typography>
          </Box>
          {data.workingHours?.[0] && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "#22c55e",
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {data.workingHours[0].hours}
              </Typography>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

/* ─── SPLIT HERO (text left, full-height image right) ────────── */
function SplitHero({ data, theme }: Omit<HeroBlockProps, "variant">) {
  const imgSrc = data.gallery?.[0]?.url;
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        minHeight: { xs: "auto", md: "88vh" },
        bgcolor: theme.bgPrimary,
      }}
    >
      {/* Text panel */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          px: { xs: 4, md: 8 },
          py: { xs: 10, md: 12 },
          position: "relative",
        }}
      >
        {/* Decorative vertical accent line */}
        <Box
          sx={{
            position: "absolute",
            left: 0,
            top: "20%",
            bottom: "20%",
            width: 3,
            bgcolor: theme.primaryColor,
            borderRadius: 999,
            display: { xs: "none", md: "block" },
          }}
        />

        <MotionBox
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {data.logoUrl && (
            <Box
              component="img"
              src={data.logoUrl}
              alt={data.name}
              sx={{ height: 48, mb: 4, display: "block" }}
            />
          )}

          <Typography
            variant="overline"
            sx={{
              color: theme.primaryColor,
              fontWeight: 700,
              letterSpacing: 4,
              fontFamily: theme.fontFamily,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: 24,
                height: 2,
                bgcolor: theme.primaryColor,
                display: "inline-block",
              }}
            />
            Trusted Professionals
          </Typography>

          <Typography
            variant="h2"
            sx={{
              fontFamily: theme.fontFamily,
              fontSize: { xs: "2.4rem", md: "3.5rem" },
              fontWeight: 900,
              color: theme.headingColor,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              mt: 1,
              mb: 2,
            }}
          >
            {data.name}
          </Typography>

          {data.tagline && (
            <Typography
              sx={{
                color: theme.bodyColor,
                fontFamily: theme.fontFamily,
                fontSize: "1.05rem",
                lineHeight: 1.75,
                maxWidth: 440,
                mb: 5,
              }}
            >
              {data.tagline}
            </Typography>
          )}

          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: theme.primaryColor,
                borderRadius: 2,
                px: 4,
                fontWeight: 700,
                boxShadow: `0 8px 24px ${theme.primaryColor}44`,
                "&:hover": {
                  bgcolor: theme.primaryColor,
                  filter: "brightness(0.9)",
                },
              }}
            >
              Get Started
            </Button>
            {data.contact.phone && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<PhoneIcon sx={{ fontSize: 16 }} />}
                href={`tel:${data.contact.phone}`}
                sx={{
                  borderColor: theme.primaryColor,
                  color: theme.primaryColor,
                  borderRadius: 2,
                  px: 4,
                  "&:hover": { bgcolor: `${theme.primaryColor}0f` },
                }}
              >
                {data.contact.phone}
              </Button>
            )}
          </Stack>

          {/* Trust row */}
          {data.reviews && data.reviews.length > 0 && (
            <Box
              sx={{ mt: 5, display: "flex", alignItems: "center", gap: 1.5 }}
            >
              <Box sx={{ display: "flex", gap: 0.25 }}>
                {["★", "★", "★", "★", "★"].map((s, i) => (
                  <Typography
                    key={i}
                    sx={{ color: "#f59e0b", fontSize: "0.8rem" }}
                  >
                    {s}
                  </Typography>
                ))}
              </Box>
              <Typography variant="caption" sx={{ color: theme.bodyColor }}>
                {data.reviews.length * 100}+ satisfied clients
              </Typography>
            </Box>
          )}
        </MotionBox>
      </Box>

      {/* Image panel */}
      <MotionBox
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 0.61, 0.36, 1] }}
        sx={{
          display: { xs: "none", md: "block" },
          position: "relative",
          overflow: "hidden",
          minHeight: 500,
        }}
      >
        {imgSrc ? (
          <>
            <Box
              component="img"
              src={imgSrc}
              alt={data.name}
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: "center",
              }}
            />
            {/* Subtle left-side gradient blending into bg */}
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(to right, ${theme.bgPrimary} 0%, transparent 15%)`,
                pointerEvents: "none",
              }}
            />
          </>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
            }}
          />
        )}
      </MotionBox>
    </Box>
  );
}

/* ─── GRADIENT HERO ───────────────────────────────────────────── */
function GradientHero({ data, theme }: Omit<HeroBlockProps, "variant">) {
  return (
    <Box
      sx={{
        background: `linear-gradient(135deg, ${theme.primaryColor} 0%, ${theme.secondaryColor} 100%)`,
        minHeight: { xs: 480, md: 600 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        py: 10,
      }}
    >
      <MotionBox
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1] }}
        sx={{ maxWidth: 760 }}
      >
        {data.logoUrl && (
          <Box
            component="img"
            src={data.logoUrl}
            alt={data.name}
            sx={{ height: 64, mb: 3, borderRadius: 2 }}
          />
        )}
        <Typography
          variant="h1"
          sx={{
            fontFamily: theme.fontFamily,
            fontSize: { xs: "2.2rem", md: "3.5rem" },
            fontWeight: 800,
            color: "#fff",
            lineHeight: 1.15,
          }}
        >
          {data.name}
        </Typography>
        {data.tagline && (
          <Typography
            variant="h5"
            sx={{
              mt: 2,
              color: "rgba(255,255,255,0.85)",
              fontFamily: theme.fontFamily,
              fontWeight: 400,
            }}
          >
            {data.tagline}
          </Typography>
        )}
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 5 }}
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: "#fff",
              color: theme.primaryColor,
              fontWeight: 700,
              borderRadius: 999,
              px: 4,
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
            }}
          >
            Get Started
          </Button>
          {data.contact.phone && (
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: "rgba(255,255,255,0.6)",
                color: "#fff",
                borderRadius: 999,
                px: 4,
                "&:hover": {
                  borderColor: "#fff",
                  bgcolor: "rgba(255,255,255,0.1)",
                },
              }}
            >
              Call Us
            </Button>
          )}
        </Stack>
      </MotionBox>
    </Box>
  );
}

/* ─── DARK HERO ───────────────────────────────────────────────── */
function DarkHero({ data, theme }: Omit<HeroBlockProps, "variant">) {
  const imgSrc = data.gallery?.[0]?.url;
  return (
    <Box
      sx={{
        position: "relative",
        bgcolor: theme.bgPrimary,
        minHeight: { xs: "80vh", md: "88vh" },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        px: 3,
        py: 10,
        overflow: "hidden",
      }}
    >
      {/* Optional bg image with very dark overlay */}
      {imgSrc && (
        <>
          <MotionImg
            initial={{ scale: 1.06 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.4 }}
            src={imgSrc}
            alt=""
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: "rgba(5,5,10,0.84)",
            }}
          />
        </>
      )}

      {/* Radial glow */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 50% 0%, ${theme.accentColor}1a 0%, transparent 65%)`,
          pointerEvents: "none",
        }}
      />

      <MotionBox
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 0.61, 0.36, 1] }}
        sx={{ maxWidth: 800, position: "relative", zIndex: 1 }}
      >
        {data.logoUrl && (
          <Box
            component="img"
            src={data.logoUrl}
            alt={data.name}
            sx={{ height: 60, mb: 3, borderRadius: 2 }}
          />
        )}

        {/* Gold accent line above */}
        <Box
          sx={{
            width: 48,
            height: 2,
            bgcolor: theme.accentColor,
            mx: "auto",
            mb: 3,
            borderRadius: 999,
          }}
        />

        <Typography
          variant="h1"
          sx={{
            fontFamily: theme.fontFamily,
            fontSize: { xs: "2.4rem", md: "4rem" },
            fontWeight: 800,
            color: theme.headingColor,
            lineHeight: 1.1,
            letterSpacing: "-0.01em",
          }}
        >
          {data.name}
        </Typography>
        {data.tagline && (
          <Typography
            sx={{
              mt: 3,
              color: theme.bodyColor,
              fontSize: "1.15rem",
              fontFamily: theme.fontFamily,
              lineHeight: 1.75,
              maxWidth: 560,
              mx: "auto",
            }}
          >
            {data.tagline}
          </Typography>
        )}
        <Box
          sx={{
            mt: 2,
            width: 60,
            height: 2,
            bgcolor: theme.accentColor,
            mx: "auto",
            borderRadius: 999,
          }}
        />
        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 5 }}
          flexWrap="wrap"
          useFlexGap
        >
          <Button
            variant="contained"
            size="large"
            sx={{
              bgcolor: theme.accentColor,
              color: "#000",
              fontWeight: 700,
              borderRadius: 2,
              px: 5,
              "&:hover": {
                bgcolor: theme.accentColor,
                filter: "brightness(0.9)",
              },
            }}
          >
            Get Started
          </Button>
          {data.contact.phone && (
            <Button
              variant="outlined"
              size="large"
              sx={{
                borderColor: theme.borderColor,
                color: theme.headingColor,
                borderRadius: 2,
                px: 4,
                "&:hover": {
                  borderColor: theme.accentColor,
                  bgcolor: "transparent",
                },
              }}
            >
              {data.contact.phone}
            </Button>
          )}
        </Stack>
      </MotionBox>
    </Box>
  );
}

const HeroBlock: React.FC<HeroBlockProps> = ({
  data,
  theme,
  variant = "gradient",
}) => {
  if (variant === "photo") return <PhotoHero data={data} theme={theme} />;
  if (variant === "split") return <SplitHero data={data} theme={theme} />;
  if (variant === "dark") return <DarkHero data={data} theme={theme} />;
  return <GradientHero data={data} theme={theme} />;
};

export default HeroBlock;
