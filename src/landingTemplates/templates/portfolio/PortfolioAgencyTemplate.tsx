import React, { useState, useRef } from "react";
import {
  Box,
  Typography,
  Stack,
  IconButton,
  Button,
  Avatar,
  Divider,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import {
  Linkedin,
  Instagram,
  Twitter,
  Github,
  Dribbble,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";
import FadeIn from "../../blocks/FadeIn";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionImg = motion.img;

const GOLD = "#C9A84C";
const BG = "#060606";
const SURFACE = "#0e0e0e";
const SURFACE2 = "#161616";
const TEXT_DIM = "rgba(255,255,255,0.45)";
const TEXT_DIMMER = "rgba(255,255,255,0.2)";
const BORDER = "rgba(255,255,255,0.07)";
const HERO_BG =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1800&q=80";

/* ─── Marquee ─────────────────────────────────────────────────── */
function Marquee({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <Box sx={{ overflow: "hidden", display: "flex" }}>
      <MotionBox
        sx={{
          display: "flex",
          gap: "3rem",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      >
        {doubled.map((item, i) => (
          <Box
            key={i}
            sx={{ display: "flex", alignItems: "center", gap: "3rem" }}
          >
            <Typography
              sx={{
                fontSize: { xs: "0.75rem", md: "0.8rem" },
                fontWeight: 600,
                color: TEXT_DIM,
                letterSpacing: 3,
                textTransform: "uppercase",
              }}
            >
              {item}
            </Typography>
            <Box
              sx={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                bgcolor: GOLD,
                flexShrink: 0,
              }}
            />
          </Box>
        ))}
      </MotionBox>
    </Box>
  );
}

/* ─── Parallax Image ──────────────────────────────────────────── */
function ParallaxImage({ src, alt }: { src: string; alt?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  return (
    <Box ref={ref} sx={{ overflow: "hidden", width: "100%", height: "100%" }}>
      <MotionImg
        src={src}
        alt={alt || ""}
        style={{
          y,
          width: "100%",
          height: "120%",
          objectFit: "cover",
          display: "block",
          marginTop: "-10%",
        }}
      />
    </Box>
  );
}

/* ─── Project Lightbox ────────────────────────────────────────── */
function Lightbox({
  item,
  onClose,
  accent,
}: {
  item: {
    title: string;
    description?: string;
    image: string;
    category?: string;
    client?: string;
    year?: string;
    tags?: string[];
  };
  onClose: () => void;
  accent: string;
}) {
  return (
    <AnimatePresence>
      <MotionBox
        key="lightbox-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        sx={{
          position: "fixed",
          inset: 0,
          bgcolor: "rgba(0,0,0,0.92)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backdropFilter: "blur(8px)",
          p: { xs: 2, md: 6 },
        }}
      >
        <MotionBox
          key="lightbox-panel"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          onClick={(e) => e.stopPropagation()}
          sx={{
            bgcolor: SURFACE2,
            borderRadius: 3,
            overflow: "hidden",
            maxWidth: 900,
            width: "100%",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          }}
        >
          <Box sx={{ height: { xs: 220, md: "auto" }, minHeight: { md: 480 } }}>
            <Box
              component="img"
              src={item.image}
              alt={item.title}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </Box>
          <Box
            sx={{
              p: { xs: 4, md: 6 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            {item.category && (
              <Typography
                variant="overline"
                sx={{ color: accent, letterSpacing: 3, fontSize: "0.65rem" }}
              >
                {item.category}
              </Typography>
            )}
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: "#fff", mt: 1, mb: 2 }}
            >
              {item.title}
            </Typography>
            {item.description && (
              <Typography
                sx={{
                  color: TEXT_DIM,
                  lineHeight: 1.8,
                  fontSize: "0.9rem",
                  mb: 3,
                }}
              >
                {item.description}
              </Typography>
            )}
            <Stack spacing={1}>
              {item.client && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: TEXT_DIMMER,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                    }}
                  >
                    Client
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#fff", fontWeight: 600 }}
                  >
                    {item.client}
                  </Typography>
                </Box>
              )}
              {item.year && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      color: TEXT_DIMMER,
                      textTransform: "uppercase",
                      letterSpacing: 1.5,
                    }}
                  >
                    Year
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#fff", fontWeight: 600 }}
                  >
                    {item.year}
                  </Typography>
                </Box>
              )}
            </Stack>
            {item.tags && item.tags.length > 0 && (
              <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 1 }}>
                {item.tags.map((t, i) => (
                  <Box
                    key={i}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      border: `1px solid ${BORDER}`,
                      borderRadius: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: TEXT_DIM,
                        fontSize: "0.65rem",
                        letterSpacing: 1,
                      }}
                    >
                      {t}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
            <Button
              onClick={onClose}
              sx={{
                mt: 4,
                alignSelf: "flex-start",
                color: TEXT_DIM,
                fontSize: "0.75rem",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              Close ✕
            </Button>
          </Box>
        </MotionBox>
      </MotionBox>
    </AnimatePresence>
  );
}

/* ─── Main Component ──────────────────────────────────────────── */
const PortfolioAgencyTemplate: React.FC<TemplateProps> = ({ data }) => {
  const accent = GOLD;
  const items = data.portfolioItems || [];
  const reviews = data.reviews || [];
  const team = data.team || [];
  const services = data.services || [];
  const stats = data.stats || [];
  const [hoveredWork, setHoveredWork] = useState<number | null>(null);
  const [lightboxItem, setLightboxItem] = useState<(typeof items)[0] | null>(
    null,
  );

  const clientNames =
    items.length > 0
      ? items.map((p) => p.client || p.title).filter(Boolean)
      : [
          "Brand Identity",
          "Web Design",
          "Motion",
          "Strategy",
          "Campaigns",
          "Product Design",
        ];

  const featuredItems = items.slice(0, 2);
  const listItems = items.slice(2);

  return (
    <Box
      sx={{
        fontFamily: "'Inter', sans-serif",
        bgcolor: BG,
        minHeight: "100vh",
        color: "#fff",
      }}
    >
      {lightboxItem && (
        <Lightbox
          item={lightboxItem}
          onClose={() => setLightboxItem(null)}
          accent={accent}
        />
      )}

      {/* ── 1. NAVBAR ─────────────────────────────────────────── */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "rgba(6,6,6,0.88)",
          backdropFilter: "blur(16px)",
          borderBottom: `1px solid ${BORDER}`,
          px: { xs: 3, md: 8 },
          py: 2,
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 2, flexGrow: 1 }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              background: `linear-gradient(135deg, ${accent} 0%, #8B6914 100%)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography
              sx={{ color: "#000", fontWeight: 900, fontSize: "0.85rem" }}
            >
              {data.name?.charAt(0) || "A"}
            </Typography>
          </Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "0.95rem",
              color: "#fff",
              letterSpacing: 2,
              textTransform: "uppercase",
            }}
          >
            {data.name}
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={5}
          sx={{ display: { xs: "none", md: "flex" } }}
        >
          {["Work", "Services", "About", "Contact"].map((item) => (
            <Typography
              key={item}
              variant="body2"
              sx={{
                color: TEXT_DIM,
                cursor: "pointer",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontSize: "0.68rem",
                fontWeight: 600,
                transition: "color 0.2s",
                "&:hover": { color: accent },
              }}
            >
              {item}
            </Typography>
          ))}
        </Stack>

        <Button
          variant="outlined"
          size="small"
          sx={{
            borderColor: BORDER,
            color: TEXT_DIM,
            fontSize: "0.68rem",
            letterSpacing: 1.5,
            textTransform: "uppercase",
            borderRadius: 1,
            px: 2,
            py: 0.75,
            "&:hover": {
              borderColor: accent,
              color: accent,
              bgcolor: "transparent",
            },
          }}
        >
          Let's Talk
        </Button>
      </Box>

      {/* ── 2. HERO ───────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          px: { xs: 4, md: 10 },
          pt: { xs: 14, md: 20 },
          pb: { xs: 10, md: 12 },
          width: "100%",
          minHeight: { xs: "auto", md: "88vh" },
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1fr 420px" },
          gap: 8,
          alignItems: "flex-end",
          backgroundImage: `
            linear-gradient(90deg, rgba(6,6,6,0.95) 0%, rgba(6,6,6,0.84) 38%, rgba(6,6,6,0.54) 68%, rgba(6,6,6,0.82) 100%),
            linear-gradient(180deg, rgba(6,6,6,0.14) 0%, rgba(6,6,6,0.42) 100%),
            url(${HERO_BG})
          `,
          backgroundSize: "cover",
          backgroundPosition: { xs: "62% center", md: "center center" },
          backgroundRepeat: "no-repeat",
          borderRadius: { xs: 0, md: 4 },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at 18% 68%, rgba(201,168,76,0.16) 0%, rgba(201,168,76,0) 36%)",
            pointerEvents: "none",
          }}
        />

        {/* Left */}
        <Box sx={{ position: "relative", zIndex: 1, maxWidth: 760 }}>
          <FadeIn>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 5 }}>
              <Box sx={{ width: 40, height: 1, bgcolor: accent }} />
              <Typography
                variant="overline"
                sx={{ color: accent, letterSpacing: 4, fontSize: "0.65rem" }}
              >
                Creative Agency
              </Typography>
            </Box>
          </FadeIn>

          <FadeIn delay={0.08}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "3.5rem", sm: "5rem", md: "7rem", lg: "8rem" },
                fontWeight: 900,
                lineHeight: 0.92,
                letterSpacing: "-0.03em",
                mb: 0,
                textShadow: "0 12px 30px rgba(0,0,0,0.38)",
              }}
            >
              <Box component="span" sx={{ color: "#fff", display: "block" }}>
                We
              </Box>
              <Box component="span" sx={{ color: "#fff", display: "block" }}>
                Craft
              </Box>
              <Box
                component="span"
                sx={{
                  display: "block",
                  WebkitTextStroke: `2px ${accent}`,
                  color: "transparent",
                }}
              >
                Stories.
              </Box>
            </Typography>
          </FadeIn>

          <FadeIn delay={0.18}>
            <Box
              sx={{
                mt: 7,
                display: "flex",
                alignItems: "center",
                gap: 3,
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: accent,
                  color: "#000",
                  fontWeight: 700,
                  borderRadius: 2,
                  px: 4,
                  py: 1.5,
                  fontSize: "0.85rem",
                  "&:hover": { bgcolor: accent, filter: "brightness(0.88)" },
                }}
              >
                View Work
              </Button>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#22c55e",
                    boxShadow: "0 0 0 3px rgba(34,197,94,0.2)",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: "rgba(255,255,255,0.7)", letterSpacing: 1 }}
                >
                  Available for projects
                </Typography>
              </Box>
            </Box>
          </FadeIn>
        </Box>

        {/* Right — tagline + contact info */}
        <FadeIn delay={0.24} direction="right">
          <Box
            sx={{
              position: "relative",
              zIndex: 1,
              alignSelf: "end",
              maxWidth: 420,
              ml: { lg: "auto" },
              p: { xs: 0, md: 3.5 },
              borderRadius: 3,
              border: { md: `1px solid rgba(255,255,255,0.08)` },
              bgcolor: { md: "rgba(6,6,6,0.34)" },
              backdropFilter: { md: "blur(14px)" },
              boxShadow: { md: "0 18px 60px rgba(0,0,0,0.2)" },
            }}
          >
            <Typography
              sx={{
                color: "rgba(255,255,255,0.72)",
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.9,
                mb: 6,
                borderLeft: `2px solid rgba(255,255,255,0.12)`,
                pl: 3,
              }}
            >
              {data.tagline || data.description}
            </Typography>

            {data.contact?.email && (
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}
              >
                <Mail size={14} color={accent} />
                <Typography
                  sx={{ color: "rgba(255,255,255,0.72)", fontSize: "0.85rem" }}
                >
                  {data.contact.email}
                </Typography>
              </Box>
            )}
            {data.contact?.phone && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Phone size={14} color={accent} />
                <Typography
                  sx={{ color: "rgba(255,255,255,0.72)", fontSize: "0.85rem" }}
                >
                  {data.contact.phone}
                </Typography>
              </Box>
            )}
          </Box>
        </FadeIn>
      </Box>

      {/* ── 3. CLIENT / DISCIPLINE MARQUEE ────────────────────── */}
      <Box
        sx={{
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
          py: 3,
          overflow: "hidden",
        }}
      >
        <Marquee items={clientNames} speed={35} />
      </Box>

      {/* ── 4. STATS STRIP ────────────────────────────────────── */}
      {stats.length > 0 && (
        <Box
          sx={{
            py: { xs: 10, md: 14 },
            px: { xs: 4, md: 10 },
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
              },
              gap: { xs: 1, md: 0 },
            }}
          >
            {stats.map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: { xs: 4, md: 6 },
                    px: 3,
                    borderLeft: i > 0 ? `1px solid ${BORDER}` : "none",
                    borderTop: {
                      xs: i >= 2 ? `1px solid ${BORDER}` : "none",
                      md: "none",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: { xs: "2.5rem", md: "3.5rem" },
                      fontWeight: 900,
                      color: accent,
                      lineHeight: 1,
                      mb: 1,
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: TEXT_DIM,
                      letterSpacing: 2.5,
                      textTransform: "uppercase",
                      fontSize: "0.65rem",
                    }}
                  >
                    {s.label}
                  </Typography>
                </Box>
              </FadeIn>
            ))}
          </Box>
        </Box>
      )}

      {/* ── 5. FEATURED PROJECTS (large cards) ────────────────── */}
      {featuredItems.length > 0 && (
        <Box
          sx={{
            px: { xs: 4, md: 10 },
            pb: { xs: 10, md: 16 },
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <FadeIn>
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                mb: 8,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: accent, letterSpacing: 4, fontSize: "0.65rem" }}
                >
                  Selected Work
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: "#fff",
                    fontSize: { xs: "1.75rem", md: "2.5rem" },
                    mt: 0.5,
                  }}
                >
                  Featured Projects
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  cursor: "pointer",
                  "&:hover span": { color: accent },
                }}
              >
                <Typography
                  component="span"
                  variant="caption"
                  sx={{
                    color: TEXT_DIM,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    transition: "color 0.2s",
                  }}
                >
                  All Projects
                </Typography>
                <ArrowOutwardIcon sx={{ color: TEXT_DIM, fontSize: 14 }} />
              </Box>
            </Box>
          </FadeIn>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
              gap: 3,
            }}
          >
            {featuredItems.map((item, i) => (
              <FadeIn key={i} delay={i * 0.12}>
                <MotionBox
                  whileHover="hovered"
                  onClick={() => setLightboxItem(item)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: 3,
                    overflow: "hidden",
                    position: "relative",
                    height: { xs: 280, md: 420 },
                  }}
                >
                  {/* Image */}
                  <Box
                    component="img"
                    src={item.image}
                    alt={item.title}
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />

                  {/* Hover overlay */}
                  <MotionBox
                    variants={{
                      hovered: { opacity: 1 },
                      initial: { opacity: 0 },
                    }}
                    initial="initial"
                    transition={{ duration: 0.28 }}
                    sx={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.95) 30%, rgba(0,0,0,0.5) 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      p: 4,
                    }}
                  >
                    <Typography
                      variant="overline"
                      sx={{
                        color: accent,
                        letterSpacing: 3,
                        fontSize: "0.6rem",
                      }}
                    >
                      {item.category || "Project"}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 800, color: "#fff", mt: 0.5, mb: 1 }}
                    >
                      {item.title}
                    </Typography>
                    {item.description && (
                      <Typography
                        sx={{
                          color: TEXT_DIM,
                          fontSize: "0.82rem",
                          lineHeight: 1.6,
                          mb: 2,
                          maxWidth: 340,
                        }}
                      >
                        {item.description}
                      </Typography>
                    )}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: accent,
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                          fontSize: "0.65rem",
                        }}
                      >
                        View Case Study
                      </Typography>
                      <ArrowOutwardIcon sx={{ color: accent, fontSize: 14 }} />
                    </Box>
                  </MotionBox>

                  {/* Always-visible corner tag */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: 16,
                      left: 16,
                      bgcolor: "rgba(0,0,0,0.6)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 1,
                      px: 1.5,
                      py: 0.5,
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: TEXT_DIM,
                        fontSize: "0.65rem",
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                      }}
                    >
                      {item.year || String(i + 1).padStart(2, "0")}
                    </Typography>
                  </Box>
                </MotionBox>
              </FadeIn>
            ))}
          </Box>
        </Box>
      )}

      {/* ── 6. NUMBERED WORK LIST ─────────────────────────────── */}
      {listItems.length > 0 && (
        <Box
          sx={{
            borderTop: `1px solid ${BORDER}`,
            px: { xs: 4, md: 10 },
            py: { xs: 10, md: 14 },
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <FadeIn>
            <Typography
              variant="overline"
              sx={{
                color: accent,
                letterSpacing: 4,
                fontSize: "0.65rem",
                display: "block",
                mb: 6,
              }}
            >
              All Work
            </Typography>
          </FadeIn>

          {listItems.map((item, i) => (
            <MotionBox
              key={i}
              onHoverStart={() => setHoveredWork(i)}
              onHoverEnd={() => setHoveredWork(null)}
              onClick={() => setLightboxItem(item)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "40px 1fr",
                  md: "60px 1fr 300px 160px 50px",
                },
                gap: { xs: 2, md: 5 },
                alignItems: "center",
                borderTop: `1px solid ${BORDER}`,
                py: { xs: 3, md: 4 },
                cursor: "pointer",
                transition: "background 0.2s",
                "&:hover": { bgcolor: "rgba(255,255,255,0.02)" },
              }}
            >
              {/* Number */}
              <Typography
                sx={{
                  color: hoveredWork === i ? accent : TEXT_DIMMER,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  transition: "color 0.2s",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {String(i + 1 + featuredItems.length).padStart(2, "0")}
              </Typography>

              {/* Title */}
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: "1rem", md: "1.4rem" },
                  color: hoveredWork === i ? accent : "#fff",
                  transition: "color 0.22s",
                  letterSpacing: "-0.01em",
                }}
              >
                {item.title}
              </Typography>

              {/* Thumbnail (desktop) */}
              <Box
                sx={{
                  display: { xs: "none", md: "block" },
                  overflow: "hidden",
                  borderRadius: 1.5,
                  height: 72,
                }}
              >
                <Box
                  component="img"
                  src={item.image}
                  alt={item.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transform: hoveredWork === i ? "scale(1.08)" : "scale(1)",
                    transition: "transform 0.5s ease",
                  }}
                />
              </Box>

              {/* Category */}
              <Typography
                sx={{
                  display: { xs: "none", md: "block" },
                  color: TEXT_DIM,
                  fontSize: "0.75rem",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                {item.category || ""}
              </Typography>

              {/* Arrow */}
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <ArrowOutwardIcon
                  sx={{
                    color: hoveredWork === i ? accent : TEXT_DIMMER,
                    fontSize: 18,
                    transition: "color 0.2s",
                  }}
                />
              </Box>
            </MotionBox>
          ))}
        </Box>
      )}

      {/* ── 7. SERVICES / CAPABILITIES ────────────────────────── */}
      {services.length > 0 && (
        <Box
          sx={{
            bgcolor: SURFACE,
            borderTop: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            py: { xs: 12, md: 18 },
            px: { xs: 4, md: 10 },
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: "auto" }}>
            <FadeIn>
              <Box
                sx={{
                  mb: 10,
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                  gap: 4,
                  alignItems: "flex-end",
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: accent,
                      letterSpacing: 4,
                      fontSize: "0.65rem",
                    }}
                  >
                    Capabilities
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      color: "#fff",
                      mt: 1,
                      fontSize: { xs: "2rem", md: "3rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    What We
                    <br />
                    Specialise In
                  </Typography>
                </Box>
                <Typography
                  sx={{ color: TEXT_DIM, lineHeight: 1.9, fontSize: "0.95rem" }}
                >
                  {data.description}
                </Typography>
              </Box>
            </FadeIn>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  lg: "repeat(3, 1fr)",
                },
                gap: 0,
              }}
            >
              {services.slice(0, 6).map((s, i) => (
                <FadeIn key={i} delay={i * 0.07}>
                  <MotionBox
                    whileHover={{ y: -4 }}
                    sx={{
                      p: { xs: 4, md: 5 },
                      border: `1px solid ${BORDER}`,
                      borderRadius: 0,
                      ml: { xs: 0, sm: i % 2 !== 0 ? "-1px" : 0 },
                      mt: i >= 2 ? "-1px" : 0,
                      transition: "background 0.25s, border-color 0.25s",
                      "&:hover": {
                        bgcolor: "rgba(201,168,76,0.04)",
                        borderColor: `${accent}44`,
                        "& .svc-num": { color: accent },
                        "& .svc-title": { color: "#fff" },
                      },
                    }}
                  >
                    <Typography
                      className="svc-num"
                      sx={{
                        color: TEXT_DIMMER,
                        fontWeight: 900,
                        fontSize: "2rem",
                        lineHeight: 1,
                        mb: 2,
                        transition: "color 0.25s",
                      }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </Typography>
                    <Typography
                      className="svc-title"
                      sx={{
                        fontWeight: 700,
                        color: "rgba(255,255,255,0.8)",
                        fontSize: "1.05rem",
                        mb: 1.5,
                        transition: "color 0.25s",
                      }}
                    >
                      {s.name}
                    </Typography>
                    {s.description && (
                      <Typography
                        sx={{
                          color: TEXT_DIM,
                          fontSize: "0.82rem",
                          lineHeight: 1.75,
                        }}
                      >
                        {s.description}
                      </Typography>
                    )}
                    {s.price && (
                      <Typography
                        sx={{
                          color: accent,
                          fontWeight: 700,
                          mt: 2,
                          fontSize: "0.85rem",
                        }}
                      >
                        {s.price}
                      </Typography>
                    )}
                  </MotionBox>
                </FadeIn>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── 8. TEAM ───────────────────────────────────────────── */}
      {team.length > 0 && (
        <Box
          sx={{
            py: { xs: 12, md: 18 },
            px: { xs: 4, md: 10 },
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <FadeIn>
            <Box sx={{ mb: 8, textAlign: "center" }}>
              <Typography
                variant="overline"
                sx={{ color: accent, letterSpacing: 4, fontSize: "0.65rem" }}
              >
                The Team
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: "#fff",
                  mt: 1,
                  fontSize: { xs: "2rem", md: "2.8rem" },
                }}
              >
                People Behind the Work
              </Typography>
            </Box>
          </FadeIn>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr 1fr",
                md: `repeat(${Math.min(team.length, 4)}, 1fr)`,
              },
              gap: 3,
            }}
          >
            {team.map((member, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <MotionBox
                  whileHover={{ y: -6 }}
                  sx={{
                    bgcolor: SURFACE,
                    borderRadius: 3,
                    overflow: "hidden",
                    border: `1px solid ${BORDER}`,
                    transition: "border-color 0.25s",
                    "&:hover": { borderColor: `${accent}44` },
                  }}
                >
                  {member.avatarUrl ? (
                    <Box
                      sx={{ height: { xs: 160, md: 220 }, overflow: "hidden" }}
                    >
                      <ParallaxImage src={member.avatarUrl} alt={member.name} />
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        height: { xs: 160, md: 220 },
                        background: `linear-gradient(135deg, ${SURFACE2} 0%, rgba(201,168,76,0.1) 100%)`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: `${accent}33`,
                          color: accent,
                          fontWeight: 900,
                          fontSize: "1.8rem",
                        }}
                      >
                        {member.name?.charAt(0)}
                      </Avatar>
                    </Box>
                  )}
                  <Box sx={{ p: { xs: 2.5, md: 3 } }}>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        color: "#fff",
                        fontSize: "0.95rem",
                      }}
                    >
                      {member.name}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        color: accent,
                        letterSpacing: 1.5,
                        textTransform: "uppercase",
                        fontSize: "0.62rem",
                      }}
                    >
                      {member.role}
                    </Typography>
                    {member.bio && (
                      <Typography
                        sx={{
                          mt: 1,
                          color: TEXT_DIM,
                          fontSize: "0.78rem",
                          lineHeight: 1.65,
                        }}
                      >
                        {member.bio}
                      </Typography>
                    )}
                  </Box>
                </MotionBox>
              </FadeIn>
            ))}
          </Box>
        </Box>
      )}

      {/* ── 9. TESTIMONIALS ───────────────────────────────────── */}
      {reviews.length > 0 && (
        <Box
          sx={{
            bgcolor: SURFACE,
            borderTop: `1px solid ${BORDER}`,
            borderBottom: `1px solid ${BORDER}`,
            py: { xs: 12, md: 18 },
            px: { xs: 4, md: 10 },
          }}
        >
          <Box sx={{ maxWidth: 1400, mx: "auto" }}>
            <FadeIn>
              <Box
                sx={{
                  mb: 8,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="overline"
                    sx={{
                      color: accent,
                      letterSpacing: 4,
                      fontSize: "0.65rem",
                    }}
                  >
                    Testimonials
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      color: "#fff",
                      mt: 0.5,
                      fontSize: { xs: "2rem", md: "2.8rem" },
                    }}
                  >
                    Client Words
                  </Typography>
                </Box>
                <Typography
                  sx={{
                    color: accent,
                    fontWeight: 700,
                    fontSize: "2.5rem",
                    lineHeight: 1,
                  }}
                >
                  "
                </Typography>
              </Box>
            </FadeIn>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
                gap: 2,
              }}
            >
              {reviews.slice(0, 3).map((r, i) => (
                <FadeIn key={i} delay={i * 0.1}>
                  <Box
                    sx={{
                      p: { xs: 4, md: 5 },
                      bgcolor: i === 1 ? `${accent}14` : "transparent",
                      border: `1px solid ${i === 1 ? `${accent}40` : BORDER}`,
                      borderRadius: 3,
                      height: "100%",
                    }}
                  >
                    {/* Stars */}
                    <Box sx={{ display: "flex", gap: 0.5, mb: 3 }}>
                      {Array.from({ length: Math.round(r.rating || 5) }).map(
                        (_, si) => (
                          <Box
                            key={si}
                            sx={{ color: accent, fontSize: "0.9rem" }}
                          >
                            ★
                          </Box>
                        ),
                      )}
                    </Box>

                    <Typography
                      sx={{
                        color: i === 1 ? "rgba(255,255,255,0.85)" : TEXT_DIM,
                        lineHeight: 1.85,
                        fontSize: "0.9rem",
                        mb: 4,
                        fontStyle: "italic",
                      }}
                    >
                      "{r.comment}"
                    </Typography>

                    <Divider sx={{ borderColor: BORDER, mb: 3 }} />

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={r.avatar}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: `${accent}33`,
                          color: accent,
                          fontWeight: 700,
                        }}
                      >
                        {r.name?.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 700,
                            color: "#fff",
                            fontSize: "0.85rem",
                          }}
                        >
                          {r.name}
                        </Typography>
                        {r.role && (
                          <Typography
                            variant="caption"
                            sx={{ color: TEXT_DIM, fontSize: "0.7rem" }}
                          >
                            {r.role}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Box>
                </FadeIn>
              ))}
            </Box>
          </Box>
        </Box>
      )}

      {/* ── 10. CONTACT CTA ───────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 16, md: 24 },
          px: { xs: 4, md: 10 },
          maxWidth: 1400,
          mx: "auto",
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow blobs */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 600,
            height: 600,
            background: `radial-gradient(circle, ${accent}12 0%, transparent 65%)`,
            pointerEvents: "none",
          }}
        />

        <FadeIn>
          <Typography
            variant="overline"
            sx={{
              color: accent,
              letterSpacing: 4,
              fontSize: "0.65rem",
              display: "block",
              mb: 3,
            }}
          >
            Get In Touch
          </Typography>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              color: "#fff",
              mb: 3,
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "5rem" },
              lineHeight: 1.0,
              letterSpacing: "-0.03em",
            }}
          >
            Let's Build
            <br />
            <Box
              component="span"
              sx={{ WebkitTextStroke: `2px ${accent}`, color: "transparent" }}
            >
              Something Great.
            </Box>
          </Typography>

          <Typography
            sx={{
              color: TEXT_DIM,
              fontSize: "1rem",
              maxWidth: 480,
              mx: "auto",
              lineHeight: 1.8,
              mb: 6,
            }}
          >
            Have a project in mind? We'd love to hear about it. Let's create
            something remarkable together.
          </Typography>

          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 2,
              flexWrap: "wrap",
              mb: 8,
            }}
          >
            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: accent,
                color: "#000",
                fontWeight: 700,
                borderRadius: 2,
                px: 5,
                py: 1.75,
                fontSize: "0.9rem",
                "&:hover": { bgcolor: accent, filter: "brightness(0.88)" },
              }}
            >
              Start a Project
            </Button>
            {data.contact?.email && (
              <Button
                variant="outlined"
                sx={{
                  borderColor: BORDER,
                  color: TEXT_DIM,
                  borderRadius: 2,
                  px: 5,
                  py: 1.75,
                  fontSize: "0.9rem",
                  "&:hover": {
                    borderColor: accent,
                    color: accent,
                    bgcolor: "transparent",
                  },
                }}
              >
                {data.contact.email}
              </Button>
            )}
          </Box>

          {/* Social icons */}
          <Stack direction="row" spacing={1.5} justifyContent="center">
            {data.socialLinks?.github && (
              <IconButton
                size="small"
                sx={{
                  border: `1px solid ${BORDER}`,
                  color: TEXT_DIM,
                  borderRadius: 1.5,
                  "&:hover": { borderColor: accent, color: accent },
                }}
              >
                <Github size={16} />
              </IconButton>
            )}
            {data.socialLinks?.twitter && (
              <IconButton
                size="small"
                sx={{
                  border: `1px solid ${BORDER}`,
                  color: TEXT_DIM,
                  borderRadius: 1.5,
                  "&:hover": { borderColor: "#1da1f2", color: "#1da1f2" },
                }}
              >
                <Twitter size={16} />
              </IconButton>
            )}
            {data.socialLinks?.dribbble && (
              <IconButton
                size="small"
                sx={{
                  border: `1px solid ${BORDER}`,
                  color: TEXT_DIM,
                  borderRadius: 1.5,
                  "&:hover": { borderColor: "#ea4c89", color: "#ea4c89" },
                }}
              >
                <Dribbble size={16} />
              </IconButton>
            )}
            {data.socialLinks?.instagram && (
              <IconButton
                size="small"
                sx={{
                  border: `1px solid ${BORDER}`,
                  color: TEXT_DIM,
                  borderRadius: 1.5,
                  "&:hover": { borderColor: "#fff", color: "#fff" },
                }}
              >
                <Instagram size={16} />
              </IconButton>
            )}
            {data.socialLinks?.linkedin && (
              <IconButton
                size="small"
                sx={{
                  border: `1px solid ${BORDER}`,
                  color: TEXT_DIM,
                  borderRadius: 1.5,
                  "&:hover": { borderColor: "#0a66c2", color: "#0a66c2" },
                }}
              >
                <Linkedin size={16} />
              </IconButton>
            )}
          </Stack>
        </FadeIn>
      </Box>

      {/* ── FOOTER ────────────────────────────────────────────── */}
      <Box
        sx={{
          borderTop: `1px solid ${BORDER}`,
          px: { xs: 4, md: 10 },
          py: 5,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 3,
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Typography
          sx={{
            color: TEXT_DIMMER,
            fontSize: "0.75rem",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          © {new Date().getFullYear()} {data.name}. All rights reserved.
        </Typography>

        {data.contact?.address && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <MapPin size={12} color={TEXT_DIM} />
            <Typography sx={{ color: TEXT_DIMMER, fontSize: "0.75rem" }}>
              {data.contact.address}
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            color: TEXT_DIMMER,
            fontSize: "0.75rem",
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Crafted with Precision
        </Typography>
      </Box>
    </Box>
  );
};

export default PortfolioAgencyTemplate;
