import React, { useEffect } from "react";
import { Box, Chip, IconButton, Typography, Stack } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import TemplateEngine from "../../../../landingTemplates/templateEngine/TemplateEngine";
import { getIndustryEntry, getIndustryKeys } from "./industryRegistry";

interface IndustryTemplatePreviewProps {
  open: boolean;
  industry: string;
  onClose: () => void;
  onIndustryChange: (industry: string) => void;
}

const overlayVariants: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: "0%",
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 35 },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: {
      duration: 0.35,
      ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
    },
  },
};

const contentVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

const IndustryTemplatePreview: React.FC<IndustryTemplatePreviewProps> = ({
  open,
  industry,
  onClose,
  onIndustryChange,
}) => {
  const industries = getIndustryKeys();
  const entry = getIndustryEntry(industry);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="preview-overlay"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
          }}
        >
          {/* Top bar */}
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: 2,
              px: { xs: 2, md: 4 },
              py: 1.5,
              bgcolor: "#0a0a0a",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: "rgba(255,255,255,0.5)",
                letterSpacing: 1.5,
                textTransform: "uppercase",
                flexShrink: 0,
              }}
            >
              Preview
            </Typography>
            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
              sx={{ flex: 1 }}
            >
              {industries.map((ind) => (
                <Chip
                  key={ind}
                  label={ind}
                  size="small"
                  onClick={() => onIndustryChange(ind)}
                  sx={{
                    bgcolor:
                      ind === industry
                        ? entry.accentColor
                        : "rgba(255,255,255,0.08)",
                    color: ind === industry ? "#000" : "rgba(255,255,255,0.7)",
                    fontWeight: ind === industry ? 700 : 400,
                    border: "none",
                    cursor: "pointer",
                    "&:hover": {
                      bgcolor:
                        ind === industry
                          ? entry.accentColor
                          : "rgba(255,255,255,0.15)",
                    },
                    transition: "all 0.2s",
                  }}
                />
              ))}
            </Stack>
            <Chip
              label={
                entry.templateId.charAt(0).toUpperCase() +
                entry.templateId.slice(1)
              }
              size="small"
              sx={{
                bgcolor: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.65rem",
                letterSpacing: 1,
              }}
            />
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                color: "rgba(255,255,255,0.7)",
                "&:hover": { color: "#fff" },
                flexShrink: 0,
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Scrollable template content */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "hidden",
              scrollbarWidth: "thin",
              "&::-webkit-scrollbar": { width: 6 },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: "rgba(0,0,0,0.2)",
                borderRadius: 999,
              },
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={industry}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <TemplateEngine
                  templateId={entry.templateId}
                  data={entry.data}
                />
              </motion.div>
            </AnimatePresence>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IndustryTemplatePreview;
