import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  Chip,
  Stack,
  IconButton,
  Modal,
  Button,
  Grid,
  Avatar,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";
import {
  Facebook,
  Instagram,
  Linkedin,
  Dribbble,
  Twitter,
  Github,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import type { TemplateProps } from "../../templateEngine/types";
import type { PortfolioItem } from "../../types/BusinessData";

const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionImg = motion.img;

/* ── Marquee ticker ─────────────────────────────────────────────────────────── */
function Marquee({ items, speed = 30 }: { items: string[]; speed?: number }) {
  const doubled = [...items, ...items];
  return (
    <Box sx={{ overflow: "hidden", width: "100%", py: 1.5 }}>
      <Box
        component={motion.div}
        animate={{ x: [0, `-${50}%`] }}
        transition={{ duration: speed, ease: "linear", repeat: Infinity }}
        sx={{
          display: "flex",
          gap: 4,
          whiteSpace: "nowrap",
          width: "max-content",
        }}
      >
        {doubled.map((item, i) => (
          <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Typography
              sx={{
                fontSize: { xs: "0.8rem", md: "0.9rem" },
                fontWeight: 500,
                color: "#999",
                letterSpacing: 1.5,
                textTransform: "uppercase",
              }}
            >
              {item}
            </Typography>
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                bgcolor: "#ddd",
                flexShrink: 0,
              }}
            />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ── Parallax hero image ────────────────────────────────────────────────────── */
function ParallaxHeroImage({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref as React.RefObject<HTMLElement>,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  return (
    <Box
      ref={ref}
      sx={{ overflow: "hidden", borderRadius: 4, height: { xs: 280, md: 500 } }}
    >
      <MotionImg
        style={{
          y,
          width: "100%",
          height: "120%",
          objectFit: "cover",
          display: "block",
        }}
        src={src}
        alt="Featured work"
      />
    </Box>
  );
}

/* ── Main component ─────────────────────────────────────────────────────────── */
const CreativePortfolioTemplate: React.FC<TemplateProps> = ({ data }) => {
  const primary = data.primaryColor || "#111";
  const accent = data.secondaryColor || "#f59e0b";

  const items = data.portfolioItems || [];
  const allCategories = [
    "All",
    ...Array.from(
      new Set(items.map((p) => p.category).filter(Boolean) as string[]),
    ),
  ];
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<PortfolioItem | null>(null);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const filtered =
    activeCategory === "All"
      ? items
      : items.filter((p) => p.category === activeCategory);
  const featured = items[0];

  const skillsTicker = [
    "Branding",
    "UI/UX Design",
    "Web Development",
    "Motion Graphics",
    "Art Direction",
    "Photography",
    "Typography",
    "Illustration",
    "Strategy",
    "Figma",
    "React",
    "Framer",
  ];

  const processSteps = [
    {
      num: "01",
      title: "Discovery",
      desc: "Deep-dive into your brand, audience, and goals to define a clear creative direction.",
    },
    {
      num: "02",
      title: "Concept",
      desc: "Explore bold ideas through moodboards, sketches, and rapid prototyping.",
    },
    {
      num: "03",
      title: "Design",
      desc: "Craft pixel-perfect deliverables with obsessive attention to detail.",
    },
    {
      num: "04",
      title: "Deliver",
      desc: "Launch with confidence. Clean handoff with all assets and documentation.",
    },
  ];

  return (
    <Box
      sx={{
        fontFamily: "'Inter', -apple-system, sans-serif",
        bgcolor: "#fff",
        minHeight: "100vh",
      }}
    >
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          bgcolor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid #f0f0f0",
          px: { xs: 4, md: 8 },
          py: 2.5,
          display: "flex",
          alignItems: "center",
        }}
      >
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1.5, flexGrow: 1 }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1.5,
              background: `linear-gradient(135deg, ${primary}, ${accent})`,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontWeight: 900,
              fontSize: "1rem",
              color: "#111",
              letterSpacing: -0.5,
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
          {["Work", "Process", "About", "Contact"].map((item) => (
            <Typography
              key={item}
              variant="body2"
              sx={{
                color: "#555",
                cursor: "pointer",
                fontWeight: 500,
                "&:hover": { color: "#111" },
                transition: "color 0.2s",
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
            ml: 4,
            borderColor: "#111",
            color: "#111",
            borderRadius: 999,
            px: 3,
            fontWeight: 700,
            display: { xs: "none", sm: "flex" },
            "&:hover": { bgcolor: "#111", color: "#fff", borderColor: "#111" },
          }}
        >
          Hire Me
        </Button>
      </Box>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: { xs: 4, md: 8 },
          pt: { xs: 12, md: 18 },
          pb: { xs: 8, md: 12 },
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "1fr 420px" },
            gap: { xs: 6, lg: 10 },
            alignItems: "center",
          }}
        >
          <Box>
            <MotionBox
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 4 }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: "#22c55e",
                    animation: "pulse 2s infinite",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: "#555",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Available for work
                </Typography>
              </Box>
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "3.2rem", md: "5.5rem", lg: "6.5rem" },
                  fontWeight: 900,
                  lineHeight: 1.0,
                  color: "#0f0f0f",
                  letterSpacing: -2,
                }}
              >
                Creative
                <Box
                  component="span"
                  sx={{
                    display: "block",
                    WebkitTextStroke: `2px ${primary}`,
                    color: "transparent",
                  }}
                >
                  Designer
                </Box>
                <Box component="span" sx={{ color: primary }}>
                  & Developer
                </Box>
              </Typography>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              sx={{
                mt: 5,
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 3,
                alignItems: { sm: "center" },
              }}
            >
              <Typography
                sx={{
                  color: "#666",
                  lineHeight: 1.75,
                  maxWidth: 440,
                  fontSize: "1.05rem",
                }}
              >
                {data.tagline || data.description}
              </Typography>
            </MotionBox>
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              sx={{ mt: 6, display: "flex", gap: 2, flexWrap: "wrap" }}
            >
              <Button
                variant="contained"
                endIcon={<ArrowOutwardIcon />}
                sx={{
                  bgcolor: "#111",
                  color: "#fff",
                  fontWeight: 700,
                  borderRadius: 999,
                  px: 4,
                  py: 1.5,
                  "&:hover": { bgcolor: primary },
                  transition: "background 0.25s",
                }}
              >
                See My Work
              </Button>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#e2e8f0",
                  color: "#111",
                  borderRadius: 999,
                  px: 4,
                  py: 1.5,
                  fontWeight: 600,
                  "&:hover": { borderColor: "#111", bgcolor: "transparent" },
                }}
              >
                Download CV
              </Button>
            </MotionBox>
          </Box>
          {/* Right — hero image */}
          {featured && (
            <MotionBox
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.15 }}
              sx={{ display: { xs: "none", lg: "block" } }}
            >
              <Box sx={{ position: "relative" }}>
                <Box sx={{ borderRadius: 4, overflow: "hidden", height: 480 }}>
                  <Box
                    component="img"
                    src={featured.image}
                    alt={featured.title}
                    sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>
                {/* Floating badge */}
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 24,
                    left: -24,
                    bgcolor: "#fff",
                    borderRadius: 3,
                    p: 2.5,
                    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minWidth: 180,
                  }}
                >
                  <Box
                    sx={{
                      width: 42,
                      height: 42,
                      borderRadius: 2,
                      background: `linear-gradient(135deg, ${primary}, ${accent})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 900,
                      fontSize: "1.1rem",
                    }}
                  >
                    ✦
                  </Box>
                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        color: "#111",
                        fontSize: "0.9rem",
                      }}
                    >
                      Latest Work
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#888" }}>
                      {featured.title}
                    </Typography>
                  </Box>
                </Box>
                {/* Stats pill */}
                {data.stats && data.stats[0] && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 20,
                      right: -20,
                      bgcolor: primary,
                      borderRadius: 3,
                      px: 2.5,
                      py: 1.5,
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 900,
                        fontSize: "1.4rem",
                        color: "#fff",
                        lineHeight: 1,
                      }}
                    >
                      {data.stats[0].value}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "rgba(255,255,255,0.7)" }}
                    >
                      {data.stats[0].label}
                    </Typography>
                  </Box>
                )}
              </Box>
            </MotionBox>
          )}
        </Box>
      </Box>

      {/* ── Skills Marquee ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          borderTop: "1px solid #f0f0f0",
          borderBottom: "1px solid #f0f0f0",
          bgcolor: "#fafafa",
        }}
      >
        <Marquee items={skillsTicker} speed={35} />
      </Box>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      {data.stats && data.stats.length > 0 && (
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            px: { xs: 4, md: 8 },
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <Grid container spacing={4}>
            {data.stats.map((s, i) => (
              <Grid item xs={6} md={3} key={i}>
                <MotionBox
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  sx={{
                    textAlign: "center",
                    p: 4,
                    borderRadius: 3,
                    border: "1px solid #f0f0f0",
                    bgcolor: i % 2 === 0 ? "#fff" : `${primary}08`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "2.8rem",
                      fontWeight: 900,
                      color: primary,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#888", mt: 1, fontWeight: 500 }}
                  >
                    {s.label}
                  </Typography>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Featured Case Study ─────────────────────────────────────────────── */}
      {featured && (
        <Box
          sx={{
            px: { xs: 4, md: 8 },
            pb: { xs: 8, md: 12 },
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                mb: 4,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box>
                <Typography
                  variant="overline"
                  sx={{ color: primary, fontWeight: 700, letterSpacing: 3 }}
                >
                  Featured Project
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 900,
                    color: "#111",
                    fontSize: { xs: "1.75rem", md: "2.5rem" },
                  }}
                >
                  Case Study
                </Typography>
              </Box>
              <Button
                endIcon={<ArrowForwardIcon />}
                sx={{ color: "#111", fontWeight: 700, textTransform: "none" }}
                onClick={() => setSelected(featured)}
              >
                View Details
              </Button>
            </Box>
            <Box
              onClick={() => setSelected(featured)}
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
                borderRadius: 4,
                overflow: "hidden",
                cursor: "pointer",
                border: "1px solid #ebebeb",
                "&:hover .cs-img": { transform: "scale(1.03)" },
                "&:hover .cs-arrow": { transform: "translate(4px, -4px)" },
              }}
            >
              <Box sx={{ overflow: "hidden", minHeight: { xs: 240, md: 440 } }}>
                <Box
                  className="cs-img"
                  component="img"
                  src={featured.image}
                  alt={featured.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.6s",
                    display: "block",
                  }}
                />
              </Box>
              <Box
                sx={{
                  p: { xs: 4, md: 6 },
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  bgcolor: "#fafafa",
                }}
              >
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      mb: 4,
                    }}
                  >
                    {featured.category && (
                      <Chip
                        label={featured.category}
                        size="small"
                        sx={{
                          bgcolor: `${primary}15`,
                          color: primary,
                          fontWeight: 700,
                        }}
                      />
                    )}
                    <ArrowOutwardIcon
                      className="cs-arrow"
                      sx={{
                        color: primary,
                        fontSize: 24,
                        transition: "transform 0.25s",
                        mt: 0.5,
                      }}
                    />
                  </Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 900,
                      color: "#111",
                      lineHeight: 1.2,
                      mb: 2,
                      fontSize: { xs: "1.5rem", md: "2rem" },
                    }}
                  >
                    {featured.title}
                  </Typography>
                  <Typography sx={{ color: "#666", lineHeight: 1.75 }}>
                    {featured.description}
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: "flex", gap: 4, mt: 5 }}>
                    {featured.client && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#bbb",
                            display: "block",
                            mb: 0.5,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          Client
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#111" }}>
                          {featured.client}
                        </Typography>
                      </Box>
                    )}
                    {featured.year && (
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#bbb",
                            display: "block",
                            mb: 0.5,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                          }}
                        >
                          Year
                        </Typography>
                        <Typography sx={{ fontWeight: 700, color: "#111" }}>
                          {featured.year}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  {featured.tags && (
                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 3 }}
                    >
                      {featured.tags.map((t) => (
                        <Chip
                          key={t}
                          label={t}
                          size="small"
                          sx={{
                            bgcolor: "#ebebeb",
                            color: "#555",
                            fontSize: "0.7rem",
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                </Box>
              </Box>
            </Box>
          </MotionBox>
        </Box>
      )}

      {/* ── All Projects Grid ──────────────────────────────────────────────── */}
      <Box
        sx={{
          bgcolor: "#fafafa",
          py: { xs: 10, md: 14 },
          px: { xs: 4, md: 8 },
        }}
      >
        <Box sx={{ maxWidth: 1400, mx: "auto" }}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              mb: 8,
              flexWrap: "wrap",
              gap: 3,
            }}
          >
            <Box>
              <Typography
                variant="overline"
                sx={{ color: primary, fontWeight: 700, letterSpacing: 3 }}
              >
                Portfolio
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 900,
                  color: "#111",
                  fontSize: { xs: "1.75rem", md: "2.5rem" },
                }}
              >
                Selected Work
              </Typography>
            </Box>
            {allCategories.length > 1 && (
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {allCategories.map((c) => (
                  <Chip
                    key={c}
                    label={c}
                    onClick={() => setActiveCategory(c)}
                    sx={{
                      bgcolor: activeCategory === c ? "#111" : "#fff",
                      color: activeCategory === c ? "#fff" : "#555",
                      border: "1px solid #e0e0e0",
                      fontWeight: activeCategory === c ? 700 : 400,
                      cursor: "pointer",
                      "&:hover": {
                        bgcolor: activeCategory === c ? "#111" : "#f5f5f5",
                      },
                      transition: "all 0.2s",
                    }}
                  />
                ))}
              </Stack>
            )}
          </MotionBox>

          <AnimatePresence mode="wait">
            <MotionBox
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "1fr 1fr",
                  lg: "1fr 1fr 1fr",
                },
                gap: 3,
              }}
            >
              {filtered.map((item, i) => (
                <MotionBox
                  key={item.title + i}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                  onHoverStart={() => setHoveredCard(i)}
                  onHoverEnd={() => setHoveredCard(null)}
                  onClick={() => setSelected(item)}
                  sx={{
                    borderRadius: 3,
                    overflow: "hidden",
                    cursor: "pointer",
                    bgcolor: "#fff",
                    border: "1px solid #ebebeb",
                    gridRow: i === 0 || i === 3 ? "span 1" : "span 1",
                    transition: "box-shadow 0.3s, transform 0.3s",
                    "&:hover": {
                      boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
                      transform: "translateY(-6px)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      height: i % 3 === 0 ? 280 : 220,
                      overflow: "hidden",
                      position: "relative",
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
                        transition: "transform 0.6s",
                        transform:
                          hoveredCard === i ? "scale(1.07)" : "scale(1)",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)",
                        opacity: hoveredCard === i ? 1 : 0,
                        transition: "opacity 0.3s",
                        display: "flex",
                        alignItems: "flex-end",
                        p: 3,
                      }}
                    >
                      <ArrowOutwardIcon sx={{ color: "#fff", ml: "auto" }} />
                    </Box>
                  </Box>
                  <Box sx={{ p: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#111",
                          fontSize: "1rem",
                          lineHeight: 1.3,
                        }}
                      >
                        {item.title}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mt: 1,
                      }}
                    >
                      {item.category && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: primary,
                            fontWeight: 600,
                            letterSpacing: 1,
                            textTransform: "uppercase",
                            fontSize: "0.65rem",
                          }}
                        >
                          {item.category}
                        </Typography>
                      )}
                      {item.year && (
                        <Typography variant="caption" sx={{ color: "#bbb" }}>
                          {item.year}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </MotionBox>
              ))}
            </MotionBox>
          </AnimatePresence>
        </Box>
      </Box>

      {/* ── Process ────────────────────────────────────────────────────────── */}
      <Box
        sx={{
          py: { xs: 10, md: 16 },
          px: { xs: 4, md: 8 },
          maxWidth: 1400,
          mx: "auto",
        }}
      >
        <MotionBox
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          sx={{ mb: 10 }}
        >
          <Typography
            variant="overline"
            sx={{ color: primary, fontWeight: 700, letterSpacing: 3 }}
          >
            How I Work
          </Typography>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              color: "#111",
              mt: 1,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
            }}
          >
            My Process
          </Typography>
        </MotionBox>
        <Grid container spacing={4}>
          {processSteps.map((step, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <MotionBox
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  border: "1px solid #f0f0f0",
                  height: "100%",
                  position: "relative",
                  overflow: "hidden",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                  "&:hover": {
                    borderColor: primary,
                    boxShadow: `0 8px 32px ${primary}18`,
                  },
                }}
              >
                <Typography
                  sx={{
                    position: "absolute",
                    top: -8,
                    right: 16,
                    fontSize: "5rem",
                    fontWeight: 900,
                    color: "#f5f5f5",
                    lineHeight: 1,
                    userSelect: "none",
                  }}
                >
                  {step.num}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 900,
                    color: primary,
                    mb: 1,
                    fontSize: "0.85rem",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  }}
                >
                  {step.num}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 800, color: "#111", mb: 2 }}
                >
                  {step.title}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#666", lineHeight: 1.75 }}
                >
                  {step.desc}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* ── Testimonials ───────────────────────────────────────────────────── */}
      {data.reviews && data.reviews.length > 0 && (
        <Box
          sx={{
            py: { xs: 10, md: 16 },
            px: { xs: 4, md: 8 },
            maxWidth: 1400,
            mx: "auto",
          }}
        >
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            sx={{ mb: 8 }}
          >
            <Typography
              variant="overline"
              sx={{ color: primary, fontWeight: 700, letterSpacing: 3 }}
            >
              Kind Words
            </Typography>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#111",
                mt: 1,
                fontSize: { xs: "1.75rem", md: "2.5rem" },
              }}
            >
              Client Reviews
            </Typography>
          </MotionBox>
          <Grid container spacing={3}>
            {data.reviews.map((r, i) => (
              <Grid item xs={12} md={4} key={i}>
                <MotionBox
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: i === 1 ? primary : "#fafafa",
                    border: `1px solid ${i === 1 ? "transparent" : "#ebebeb"}`,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.3s",
                    "&:hover": { boxShadow: "0 12px 40px rgba(0,0,0,0.1)" },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "3rem",
                      lineHeight: 1,
                      mb: 3,
                      color: i === 1 ? "rgba(255,255,255,0.4)" : `${primary}30`,
                      fontFamily: "Georgia, serif",
                    }}
                  >
                    "
                  </Typography>
                  <Typography
                    sx={{
                      color: i === 1 ? "#fff" : "#333",
                      lineHeight: 1.8,
                      flex: 1,
                      mb: 4,
                      fontSize: "1rem",
                    }}
                  >
                    {r.text}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      sx={{
                        width: 44,
                        height: 44,
                        bgcolor:
                          i === 1 ? "rgba(255,255,255,0.2)" : `${primary}20`,
                        color: i === 1 ? "#fff" : primary,
                        fontWeight: 800,
                      }}
                    >
                      {r.author[0]}
                    </Avatar>
                    <Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 800,
                          color: i === 1 ? "#fff" : "#111",
                        }}
                      >
                        {r.author}
                      </Typography>
                      {r.date && (
                        <Typography
                          variant="caption"
                          sx={{
                            color: i === 1 ? "rgba(255,255,255,0.5)" : "#aaa",
                          }}
                        >
                          {r.date}
                        </Typography>
                      )}
                    </Box>
                    <Box sx={{ ml: "auto", display: "flex", gap: 0.25 }}>
                      {[...Array(r.rating)].map((_, j) => (
                        <Box
                          key={j}
                          sx={{
                            color: i === 1 ? "#fff" : "#f59e0b",
                            fontSize: "0.9rem",
                          }}
                        >
                          ★
                        </Box>
                      ))}
                    </Box>
                  </Box>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Contact / CTA ──────────────────────────────────────────────────── */}
      <Box
        sx={{
          position: "relative",
          overflow: "hidden",
          pt: { xs: 14, md: 10 },
          pb: { xs: 14, md: 4 },

          px: { xs: 4, md: 8 },
          textAlign: "center",
          background: `linear-gradient(135deg, #0f0f0f 0%, #1a1a2e 100%)`,
        }}
      >
        {/* Decorative circles */}
        <Box
          sx={{
            position: "absolute",
            top: -100,
            right: -100,
            width: 400,
            height: 400,
            borderRadius: "50%",
            bgcolor: `${primary}15`,
            filter: "blur(60px)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -80,
            left: -80,
            width: 300,
            height: 300,
            borderRadius: "50%",
            bgcolor: `${accent}10`,
            filter: "blur(50px)",
            pointerEvents: "none",
          }}
        />
        <MotionBox
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          sx={{ position: "relative", zIndex: 1, maxWidth: 900, mx: "auto" }}
        >
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.4)",
              letterSpacing: 4,
              textTransform: "uppercase",
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
              fontSize: { xs: "2.5rem", md: "4.5rem" },
              lineHeight: 1.05,
              mb: 4,
            }}
          >
            Let's Create Something
            <Box component="span" sx={{ display: "block", color: accent }}>
              {" "}
              Amazing.
            </Box>
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.5)",
              mb: 6,
              fontSize: "1.05rem",
              lineHeight: 1.75,
            }}
          >
            Have a project in mind? Let's talk and turn your vision into
            reality.
          </Typography>
          {data.contact.email && (
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                border: `1px solid rgba(255,255,255,0.15)`,
                borderRadius: 999,
                px: 4,
                py: 2,
                mb: 6,
                backdropFilter: "blur(10px)",
                bgcolor: "rgba(255,255,255,0.05)",
              }}
            >
              <Typography
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                }}
              >
                {data.contact.email}
              </Typography>
            </Box>
          )}

          {data.socialLinks && (
            <Stack
              direction="row"
              spacing={1.5}
              justifyContent="center"
              sx={{ mt: 0 }}
            >
              {data.socialLinks.dribbble && (
                <IconButton
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": { color: "#ea4c89", borderColor: "#ea4c89" },
                  }}
                >
                  <Dribbble size={18} />
                </IconButton>
              )}
              {data.socialLinks.github && (
                <IconButton
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": { color: "#fff", borderColor: "#fff" },
                  }}
                >
                  <Github size={18} />
                </IconButton>
              )}
              {data.socialLinks.instagram && (
                <IconButton
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": { color: "#fff", borderColor: "#fff" },
                  }}
                >
                  <Instagram size={18} />
                </IconButton>
              )}
              {data.socialLinks.linkedin && (
                <IconButton
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": { color: "#0a66c2", borderColor: "#0a66c2" },
                  }}
                >
                  <Linkedin size={18} />
                </IconButton>
              )}
              {data.socialLinks.twitter && (
                <IconButton
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": { color: "#1da1f2", borderColor: "#1da1f2" },
                  }}
                >
                  <Twitter size={18} />
                </IconButton>
              )}
              {data.socialLinks.facebook && (
                <IconButton
                  sx={{
                    color: "rgba(255,255,255,0.4)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    "&:hover": { color: "#fff", borderColor: "#fff" },
                  }}
                >
                  <Facebook size={18} />
                </IconButton>
              )}
            </Stack>
          )}
        </MotionBox>
        {/* Footer line */}
        <Box
          sx={{
            mt: 8,
            pt: 6,
            borderTop: "1px solid rgba(255,255,255,0.07)",
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}
          >
            © {new Date().getFullYear()} {data.name}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "rgba(255,255,255,0.25)", letterSpacing: 2 }}
          >
            Designed & Built with care
          </Typography>
        </Box>
      </Box>

      {/* ── Project Lightbox Modal ─────────────────────────────────────────── */}
      <Modal open={!!selected} onClose={() => setSelected(null)}>
        <Box
          sx={{
            position: "fixed",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: { xs: 2, md: 4 },
            zIndex: 2000,
          }}
          onClick={() => setSelected(null)}
        >
          {selected && (
            <MotionBox
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              sx={{
                bgcolor: "#fff",
                borderRadius: 4,
                overflow: "hidden",
                maxWidth: 860,
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
              }}
            >
              <Box
                sx={{
                  position: "relative",
                  height: { xs: 240, md: 420 },
                  overflow: "hidden",
                }}
              >
                <Box
                  component="img"
                  src={selected.image}
                  alt={selected.title}
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                  }}
                />
                <IconButton
                  onClick={() => setSelected(null)}
                  sx={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    bgcolor: "rgba(0,0,0,0.5)",
                    color: "#fff",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.8)" },
                  }}
                >
                  <CloseIcon />
                </IconButton>
                {selected.category && (
                  <Chip
                    label={selected.category}
                    size="small"
                    sx={{
                      position: "absolute",
                      bottom: 20,
                      left: 20,
                      bgcolor: "#fff",
                      color: primary,
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
              <Box sx={{ p: { xs: 3, md: 5 } }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 900,
                    color: "#111",
                    mb: 2,
                    lineHeight: 1.2,
                  }}
                >
                  {selected.title}
                </Typography>
                <Box sx={{ display: "flex", gap: 5, mb: 4 }}>
                  {selected.client && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#aaa",
                          display: "block",
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                          mb: 0.5,
                        }}
                      >
                        Client
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#111" }}>
                        {selected.client}
                      </Typography>
                    </Box>
                  )}
                  {selected.year && (
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "#aaa",
                          display: "block",
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                          mb: 0.5,
                        }}
                      >
                        Year
                      </Typography>
                      <Typography sx={{ fontWeight: 700, color: "#111" }}>
                        {selected.year}
                      </Typography>
                    </Box>
                  )}
                </Box>
                {selected.description && (
                  <Typography
                    sx={{
                      color: "#555",
                      lineHeight: 1.8,
                      mb: 4,
                      fontSize: "1.05rem",
                    }}
                  >
                    {selected.description}
                  </Typography>
                )}
                {selected.tags && selected.tags.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mb: 4 }}
                  >
                    {selected.tags.map((t) => (
                      <Chip
                        key={t}
                        label={t}
                        size="small"
                        sx={{
                          bgcolor: `${primary}12`,
                          color: primary,
                          fontWeight: 600,
                        }}
                      />
                    ))}
                  </Stack>
                )}
                {selected.url && (
                  <Button
                    variant="contained"
                    endIcon={<OpenInNewIcon />}
                    href={selected.url}
                    target="_blank"
                    sx={{
                      bgcolor: primary,
                      color: "#fff",
                      fontWeight: 700,
                      borderRadius: 2,
                    }}
                  >
                    View Live Project
                  </Button>
                )}
              </Box>
            </MotionBox>
          )}
        </Box>
      </Modal>
    </Box>
  );
};

export default CreativePortfolioTemplate;
