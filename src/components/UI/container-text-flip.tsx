import React, { useState, useEffect, useId } from "react";
import { Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";

export interface ContainerTextFlipProps {
  words?: string[];
  interval?: number;
  animationDuration?: number;
}

const MotionTypography = motion(Typography);

export function ContainerTextFlip({
  words = ["better", "modern", "beautiful", "awesome"],
  interval = 3000,
  animationDuration = 700,
}: ContainerTextFlipProps) {
  const id = useId();
  const theme = useTheme();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [width, setWidth] = useState<string | number>("auto");

  const textRef = React.useRef<HTMLDivElement>(null);

  const isDark = theme.palette.mode === "dark";

  // ================= Responsive Styles =================
  const commonSx = {
    position: "relative",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Kanit, sans-serif",
    fontWeight: 600,

    // Fully responsive text sizes
    fontSize: {
      xs: "1.4rem", // small phones
      sm: "2.4rem", // big phones
      md: "3rem", // tablets
      lg: "3.4rem", // laptops
      xl: "4rem", // desktops
    },

    px: {
      xs: "12px",
      sm: "18px",
      md: "24px",
    },

    py: {
      xs: "4px",
      sm: "6px",
      md: "8px",
    },

    borderRadius: "10px",
    whiteSpace: "nowrap",
  };

  const finalSx = isDark
    ? {
        ...commonSx,
        color: "white",
        background: "linear-gradient(to bottom, #374151, #1f2937)",
        boxShadow:
          "inset 0 -1px #10171e, inset 0 0 0 1px rgba(67, 153, 237, 0.24), 0 4px 8px rgba(0, 0, 0, 0.32)",
      }
    : {
        ...commonSx,
        color: "white",
        background: "linear-gradient(to bottom, #378C92, #2f7c82, #1c5157)",
        boxShadow:
          "inset 0 -1px #378C92, inset 0 0 0 1px #378C92, 0 4px 8px #378C92",
      };

  // ======================================================
  // Auto-width calculation for every new word (responsive)
  // ======================================================
  const updateWidth = () => {
    if (!textRef.current) return;
    const rawWidth = textRef.current.scrollWidth;

    // Add buffer but adjust based on screen size
    const buffer = window.innerWidth < 450 ? 20 : 40;

    setWidth(rawWidth + buffer);
  };

  useEffect(() => {
    updateWidth();
  }, [currentWordIndex]);

  useEffect(() => {
    updateWidth();
    const intervalId = setInterval(() => {
      setCurrentWordIndex((i) => (i + 1) % words.length);
    }, interval);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <MotionTypography
      {...({ component: motion.p } as any)}
      layout
      layoutId={`flip-${id}`}
      animate={{ width }}
      transition={{ duration: animationDuration / 2000 }}
      sx={finalSx}
      key={words[currentWordIndex]}
    >
      <motion.div
        ref={textRef}
        style={{ display: "inline-block" }}
        transition={{ duration: animationDuration / 1000 }}
      >
        {words[currentWordIndex].split("").map((letter, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ delay: i * 0.02 }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>
    </MotionTypography>
  );
}
