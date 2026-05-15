import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Box, Container, Typography, Link } from "@mui/material";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

const ACCENT = "#388d91";

const MotionBox = motion.create(Box);
const MotionContainer = motion.create(Container);

const HeroImageSection = ({
  title,
  titleLeft,
  highlight,
  subtitle,
  ctaLabel,
  ctaHref,
  bg,
  showStats,
  stats,
  overlay = true,
}) => {
  const sectionRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const bgPosY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.6], [0, -46]);
  const shapeUp = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReduced ? 0 : -40],
  );
  const shapeDown = useTransform(
    scrollYProgress,
    [0, 1],
    [0, prefersReduced ? 0 : 32],
  );

  return (
    <MotionBox
      ref={sectionRef}
      component="section"
      /* hydration-safe parallax (no visual change) */
      style={{
        backgroundPositionY: mounted ? bgPosY : "0%",
        willChange: "background-position",
      }}
      sx={{
        position: "relative",
        /* iOS-safe mobile height, desktop unchanged */
        minHeight: { xs: "100dvh", md: "64vh" },
        display: "flex",
        alignItems: "center",
        overflow: "hidden",
        backgroundImage: bg ? `url(${bg})` : undefined,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "bottom",
        ...(overlay && {
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            /**
             * MODIFICATION: Applied a simple blackish overlay (rgba(0,0,0,0.5))
             * across the entire element. This ensures the content (which has a zIndex of 1)
             * is visually on top of the overlay, and the overlay covers the background image.
             */
            background: "rgba(0, 0, 0, 0.5)", // Blackish overlay
          },
        }),
      }}
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: "easeOut" },
      }}
    >
      {bg && (
        <img
          src={bg}
          fetchPriority="high"
          alt=""
          aria-hidden="true"
          style={{ display: "none" }}
        />
      )}

      <motion.div
        aria-hidden
        style={{
          position: "absolute",
          top: "8%",
          left: "2%",
          width: 240,
          height: 240,
          borderRadius: "50%",
          background:
            "conic-gradient(from 90deg at 50% 50%, rgba(56,141,145,.5), rgba(14,165,165,.35), rgba(56,141,145,.5))",
          filter: "blur(18px)",
          opacity: 0.35,
          y: shapeUp,
          pointerEvents: "none",
        }}
      />

      <motion.svg
        aria-hidden
        viewBox="0 0 200 120"
        style={{
          position: "absolute",
          left: "6%",
          top: "40%",
          width: 260,
          height: 140,
          opacity: 1,
          y: shapeDown,
          pointerEvents: "none",
        }}
      >
        <defs>
          <pattern
            id="dotGrid"
            x="0"
            y="0"
            width="14"
            height="14"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="12" cy="10" r="1.3" fill="#fff" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="200" height="150" fill="url(#dotGrid)" />
      </motion.svg>

      {/* Floating stats (only if provided) */}
      {showStats && Array.isArray(stats) && stats.length > 0 && (
        <motion.div
          aria-hidden
          initial={{ opacity: 0, y: 24 }}
          animate={{
            opacity: 1,
            y: 0,
            transition: { delay: 0.35, duration: 0.5 },
          }}
          style={{
            position: "absolute",
            right: "6%",
            top: "18%",
            display: "grid",
            gap: 12,
            pointerEvents: "none",
          }}
        >
          {stats.map((item, i) => (
            <motion.div
              key={`${item.k}-${item.v}-${i}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 0.95, y: 0 }}
              transition={{ delay: 0.45 + i * 0.08, duration: 0.45 }}
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "#0f172a",
                padding: "10px 14px",
                borderRadius: 12,
                boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
                border: "1px solid rgba(15,23,42,0.08)",
                minWidth: 120,
                textAlign: "center",
                willChange: "transform, opacity",
              }}
            >
              <div style={{ fontWeight: 900, fontSize: 20, lineHeight: 1 }}>
                {item.k}
              </div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 12,
                  letterSpacing: ".08em",
                }}
              >
                {item.v}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      <MotionContainer
        maxWidth="lg"
        /* adds small-side padding on xs/sm only; desktop unchanged */
        sx={{
          position: "relative",
          zIndex: 1, // Ensures content is always above the overlay (&::before)
          mt: { xs: 2.5, md: 24 },
          px: { xs: 2.5, sm: 4, md: 0 },
        }}
      >
        <motion.span
          aria-hidden
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 72, opacity: 1 }}
          transition={{ duration: 0.55, ease: "easeOut", delay: 0.12 }}
          style={{
            display: "block",
            height: 4,
            backgroundColor: ACCENT,
            borderRadius: 4,
            marginBottom: 12,
          }}
        />

        <motion.div style={{ opacity: textOpacity, y: textY }}>
          {title ? (
            <Typography
              component="h1"
              sx={{
                fontWeight: 900,
                letterSpacing: "-0.4px",
                color: "#fff",
                textShadow: "0 2px 20px rgba(0,0,0,0.6)",
                fontSize: {
                  xs: "clamp(34px, 8vw, 52px)",
                  md: "clamp(46px, 5vw, 68px)",
                },
                lineHeight: 1.02,
                maxWidth: { md: "18ch" },
                /* safe wrap on tiny screens; no desktop change */
                wordBreak: "break-word",
                hyphens: "auto",
              }}
            >
              {title}
            </Typography>
          ) : (
            <Box
              sx={{ display: "flex", flexWrap: "wrap", alignItems: "baseline" }}
            >
              <Typography
                component="span"
                sx={{
                  mr: 1,
                  fontWeight: 900,
                  letterSpacing: "-0.4px",
                  color: "#fff",
                  textShadow: "0 2px 20px rgba(0,0,0,0.6)",
                  fontSize: {
                    xs: "clamp(34px, 8vw, 52px)",
                    md: "clamp(46px, 5vw, 68px)",
                  },
                  lineHeight: 1.02,
                  wordBreak: "break-word",
                  hyphens: "auto",
                }}
              >
                {titleLeft}
              </Typography>

              <Box sx={{ position: "relative", display: "inline-block" }}>
                <motion.span
                  aria-hidden
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ duration: 0.55, ease: "easeOut", delay: 0.32 }}
                  style={{
                    position: "absolute",
                    inset: "-6px -10px -6px -10px",
                    borderRadius: 12,
                    transformOrigin: "left center",
                    background:
                      "linear-gradient(90deg, rgba(56,141,145,.55), rgba(14,165,165,.45))",
                    boxShadow: "0 12px 22px rgba(0,0,0,0.12)",
                  }}
                />
                <Typography
                  component="span"
                  sx={{
                    position: "relative",
                    fontWeight: 900,
                    letterSpacing: "-0.4px",
                    color: "#0e2a2a",
                    fontSize: {
                      xs: "clamp(34px, 8vw, 52px)",
                      md: "clamp(46px, 5vw, 68px)",
                    },
                    lineHeight: 1.02,
                    wordBreak: "break-word",
                    hyphens: "auto",
                  }}
                >
                  {highlight}
                </Typography>
              </Box>
            </Box>
          )}

          {subtitle && (
            <Typography
              sx={{
                mt: 0.75,
                color: "#e6eef7",
                fontSize: { xs: 15, md: 17 },
                textShadow: "0 1px 12px rgba(0,0,0,0.55)",
                maxWidth: { md: "58ch" },
              }}
            >
              {subtitle}
            </Typography>
          )}

          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              underline="none"
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                mt: 2.2,
                color: "#ffffff",
                fontWeight: 800,
                letterSpacing: ".02em",
                position: "relative",
                "&:hover .arr": { transform: "translateX(4px)" },
                "&:hover::after": { transform: "scaleX(1)" },
                "&&::after": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  bottom: -4,
                  height: 2,
                  width: "100%",
                  background:
                    "linear-gradient(90deg, rgba(56,141,145,1) 0%, rgba(14,165,165,1) 100%)",
                  transform: "scaleX(0)",
                  transformOrigin: "left",
                  transition: "transform .25s ease",
                  borderRadius: 2,
                },
              }}
            >
              {ctaLabel}
              <span
                className="arr"
                style={{
                  display: "inline-block",
                  transition: "transform 180ms ease",
                }}
              >
                →
              </span>
            </Link>
          )}
        </motion.div>
      </MotionContainer>

      {/* Scroll indicator */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 0.9, y: [0, 6, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "50%",
          bottom: 16,
          transform: "translateX(-50%)",
          width: 12,
          height: 18,
          borderRadius: 10,
          boxShadow: "inset 0 0 0 2px rgba(255,255,255,0.85)",
          pointerEvents: "none",
        }}
      >
        <span
          style={{
            display: "block",
            margin: "4px auto 0",
            width: 2,
            height: 5,
            background: "rgba(255,255,255,0.85)",
            borderRadius: 2,
          }}
        />
      </motion.div>
    </MotionBox>
  );
};

HeroImageSection.propTypes = {
  title: PropTypes.string,
  titleLeft: PropTypes.string,
  highlight: PropTypes.string,
  subtitle: PropTypes.string,
  ctaLabel: PropTypes.string,
  ctaHref: PropTypes.string,
  bg: PropTypes.string.isRequired,
  showStats: PropTypes.bool,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      k: PropTypes.string.isRequired,
      v: PropTypes.string.isRequired,
    }),
  ),
  overlay: PropTypes.bool,
};

export default HeroImageSection;
