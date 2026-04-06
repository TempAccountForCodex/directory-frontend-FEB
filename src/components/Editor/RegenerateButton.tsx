/**
 * RegenerateButton — Icon button overlay for single block AI regeneration
 *
 * Shown on text blocks (HERO, FEATURES, TESTIMONIALS, CTA, TEXT, ABOUT)
 * in the website editor when the website has AI sessions.
 * Uses DashboardIconButton with Sparkles icon.
 * Popover confirmation before regeneration.
 *
 * Step 3.18.D
 */

import React, { useState, useCallback, useRef } from "react";
import {
  Popover,
  Typography,
  Box,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { Sparkles } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import {
  DashboardIconButton,
  DashboardGradientButton,
  DashboardCancelButton,
} from "../Dashboard/shared";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

/** Block types that support AI regeneration (text-based blocks) */
const AI_REGENERABLE_TYPES = [
  "HERO",
  "FEATURES",
  "TESTIMONIALS",
  "CTA",
  "TEXT",
  "ABOUT",
];

interface RegenerateButtonProps {
  blockId: number;
  blockType: string;
  hasAISessions: boolean;
  questionnaireData: Record<string, unknown>;
  onContentUpdate: (
    blockId: number,
    newContent: Record<string, unknown>,
  ) => void;
}

const RegenerateButton: React.FC<RegenerateButtonProps> = React.memo(
  ({
    blockId,
    blockType,
    hasAISessions,
    questionnaireData,
    onContentUpdate,
  }) => {
    const { actualTheme } = useCustomTheme();
    const colors = getDashboardColors(actualTheme);

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [regenerating, setRegenerating] = useState(false);
    const [snackbar, setSnackbar] = useState<{
      open: boolean;
      message: string;
      severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    const buttonRef = useRef<HTMLDivElement>(null);

    // Only visible on text blocks of AI-generated websites
    if (!hasAISessions || !AI_REGENERABLE_TYPES.includes(blockType)) {
      return null;
    }

    const handleClick = useCallback(() => {
      setAnchorEl(buttonRef.current);
    }, []);

    const handleClose = useCallback(() => {
      setAnchorEl(null);
    }, []);

    const handleRegenerate = useCallback(async () => {
      setAnchorEl(null);
      setRegenerating(true);

      try {
        const response = await fetch(`${API_URL}/ai/generate-block`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            blockId,
            blockType,
            questionnaireData,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          onContentUpdate(blockId, data.content);
          setSnackbar({
            open: true,
            message: "Section regenerated",
            severity: "success",
          });
        } else {
          const errorData = await response.json().catch(() => ({}));
          setSnackbar({
            open: true,
            message:
              errorData.message ||
              "Failed to regenerate section. Please try again.",
            severity: "error",
          });
        }
      } catch {
        setSnackbar({
          open: true,
          message: "Failed to regenerate section. Please try again.",
          severity: "error",
        });
      } finally {
        setRegenerating(false);
      }
    }, [blockId, blockType, questionnaireData, onContentUpdate]);

    const open = Boolean(anchorEl);

    return (
      <>
        <Box ref={buttonRef} sx={{ display: "inline-flex" }}>
          {regenerating ? (
            <CircularProgress size={20} sx={{ color: colors.primary }} />
          ) : (
            <DashboardIconButton
              icon={<Sparkles size={16} />}
              label="Regenerate"
              tooltip="Regenerate with AI"
              variant="outlined"
              onClick={handleClick}
              sx={{
                minWidth: 44,
                minHeight: 44,
                maxWidth: "44px !important",
                p: "10px !important",
              }}
              aria-label="Regenerate this section with AI"
            />
          )}
        </Box>

        <Popover
          open={open}
          anchorEl={anchorEl}
          onClose={handleClose}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
          slotProps={{
            paper: {
              sx: {
                p: 2,
                maxWidth: 280,
                bgcolor: colors.panelBg,
                borderRadius: 2,
                border: `1px solid ${alpha(colors.text, 0.1)}`,
              },
            },
          }}
        >
          <Typography
            variant="body2"
            sx={{ color: colors.text, mb: 2, fontWeight: 500 }}
          >
            Regenerate this section? Current content will be replaced.
          </Typography>
          <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <DashboardCancelButton
              size="small"
              onClick={handleClose}
              sx={{ minWidth: 44, minHeight: 44 }}
            >
              Cancel
            </DashboardCancelButton>
            <DashboardGradientButton
              size="small"
              onClick={handleRegenerate}
              sx={{ minWidth: 44, minHeight: 44 }}
              aria-label="Confirm regenerate"
            >
              Regenerate
            </DashboardGradientButton>
          </Box>
        </Popover>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </>
    );
  },
);

RegenerateButton.displayName = "RegenerateButton";

export default RegenerateButton;
