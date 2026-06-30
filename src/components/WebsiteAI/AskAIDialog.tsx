/**
 * AskAIDialog — "Ask AI" prompt + preview for a selected field/section/page.
 *
 * Flow (PRD "Editor Ask AI"):
 *  - User types an instruction → one best result returned.
 *  - Frontend previews the proposed change → Apply or Cancel.
 *  - Unsupported-field, quota, and retry-limit states surfaced inline.
 *  - Discloses that only the last two AI turns can be reverted.
 */

import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Chip from "@mui/material/Chip";
import { alpha } from "@mui/material/styles";
import { X, Sparkles, RotateCcw } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";
import DashboardCancelButton from "../Dashboard/shared/DashboardCancelButton";
import { useRotatingPhrase } from "../../hooks/useRotatingPhrase";
import { formatResetTime } from "../../hooks/useWebsiteAIAccess";
import type { EditorAIController, AITargetRef } from "./useEditorAI";
import { MAX_ATTEMPTS } from "./useEditorAI";

interface AskAIDialogProps {
  open: boolean;
  target: AITargetRef | null;
  controller: EditorAIController;
  onClose: () => void;
}

const SUGGESTIONS = [
  "Make this shorter",
  "Make it more premium",
  "Rewrite for a friendlier tone",
  "Make this CTA more direct",
];

function stringifyErrorDetail(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getModerationDetails(error: EditorAIController["error"]): string[] {
  if (!error || error.code !== "PATCH_MODERATION_BLOCKED") return [];
  const rawErrors = error.meta?.errors;
  if (Array.isArray(rawErrors)) {
    return rawErrors
      .map(stringifyErrorDetail)
      .filter((detail): detail is string => Boolean(detail));
  }
  const detail = stringifyErrorDetail(rawErrors ?? error.meta?.details);
  return detail ? [detail] : [];
}

const AskAIDialog: React.FC<AskAIDialogProps> = ({
  open,
  target,
  controller,
  onClose,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [instruction, setInstruction] = useState("");
  const {
    activeRequest,
    proposal,
    error,
    askAI,
    applyProposal,
    cancelProposal,
    getAttempts,
    clearError,
    revertDepth,
  } = controller;

  const phrase = useRotatingPhrase(activeRequest);

  useEffect(() => {
    if (open) {
      setInstruction("");
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, target?.blockId, target?.fieldPath]);

  if (!target) return null;

  const attempts = getAttempts(target, instruction);
  const retryLimitHit = attempts >= MAX_ATTEMPTS;
  const isUnsupported = error?.code === "UNSUPPORTED_EDIT_FIELD";
  const isQuota =
    error?.code === "QUOTA_EXCEEDED" ||
    error?.code === "AI_QUOTA_EXHAUSTED" ||
    error?.code === "PLAN_UPGRADE_REQUIRED";
  const moderationDetails = getModerationDetails(error);

  const handleSubmit = () => {
    if (!instruction.trim()) return;
    askAI(target, instruction.trim());
  };

  const handleApply = async () => {
    const applied = await applyProposal();
    if (applied) {
      onClose();
    }
  };

  const handleCancelProposal = () => {
    cancelProposal();
  };

  const handleClose = () => {
    cancelProposal();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={activeRequest ? undefined : handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.panelBg || colors.bgCard,
          border: `1px solid ${colors.border}`,
          backdropFilter: "blur(12px)",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: colors.text,
          pr: 1,
        }}
      >
        <Sparkles size={18} color="#378C92" />
        Ask AI
        <Box sx={{ flex: 1 }} />
        <IconButton
          onClick={handleClose}
          disabled={activeRequest}
          size="small"
          sx={{ color: colors.textSecondary }}
        >
          <X size={18} />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Chip
          label={`Editing: ${target.label || target.fieldPath}`}
          size="small"
          sx={{
            mb: 2,
            bgcolor: alpha("#378C92", 0.12),
            color: "#378C92",
            fontWeight: 500,
          }}
        />

        {/* Error / unsupported / quota */}
        {error && (
          <Alert
            severity={isUnsupported ? "info" : "warning"}
            sx={{ mb: 2 }}
            onClose={clearError}
          >
            {error.message}
            {isUnsupported && error.details?.requestedChange && (
              <Typography
                variant="caption"
                sx={{ display: "block", mt: 0.5 }}
              >
                “{error.details.requestedChange}” isn’t an editable field on this
                element yet.
              </Typography>
            )}
            {isQuota && (
              <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                Resets {formatResetTime(error.resetAt)}.
              </Typography>
            )}
            {moderationDetails.length > 0 && (
              <Box component="ul" sx={{ mt: 0.75, mb: 0, pl: 2.5 }}>
                {moderationDetails.map((detail, index) => (
                  <Typography
                    key={`${detail}-${index}`}
                    component="li"
                    variant="caption"
                    sx={{ display: "list-item" }}
                  >
                    {detail}
                  </Typography>
                ))}
              </Box>
            )}
          </Alert>
        )}

        {/* Proposal preview */}
        {proposal ? (
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ color: colors.text, mb: 1, fontWeight: 600 }}
            >
              Proposed change
            </Typography>
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                border: `1px solid ${alpha("#378C92", 0.3)}`,
                backgroundColor: alpha("#378C92", 0.06),
                mb: 1.5,
              }}
            >
              <Typography variant="body2" sx={{ color: colors.text }}>
                {proposal.previewText}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{ color: colors.textSecondary, display: "block" }}
            >
              {proposal.summary}
            </Typography>
          </Box>
        ) : activeRequest ? (
          <Box sx={{ textAlign: "center", py: 3 }}>
            <CircularProgress size={26} sx={{ color: "#378C92", mb: 1.5 }} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              {phrase}…
            </Typography>
          </Box>
        ) : (
          <Box>
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={2}
              placeholder="e.g. Make this headline shorter and more premium"
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  handleSubmit();
                }
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  color: colors.text,
                  "& fieldset": { borderColor: colors.border },
                },
              }}
            />
            <Box sx={{ mt: 1.5, display: "flex", gap: 0.5, flexWrap: "wrap" }}>
              {SUGGESTIONS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  size="small"
                  variant="outlined"
                  onClick={() => setInstruction(s)}
                  sx={{
                    cursor: "pointer",
                    borderColor: alpha("#378C92", 0.4),
                    color: "#378C92",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        <Typography
          variant="caption"
          sx={{
            color: colors.textSecondary,
            mt: 2,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <RotateCcw size={12} />
          Only the last two AI changes can be reverted
          {revertDepth > 0 ? ` (${revertDepth} available).` : "."}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {proposal ? (
          <>
            <DashboardCancelButton onClick={handleCancelProposal}>
              Cancel
            </DashboardCancelButton>
            <Box sx={{ flex: 1 }} />
            <DashboardActionButton
              onClick={() => askAI(target, proposal.instruction)}
              disabled={activeRequest || retryLimitHit}
            >
              Try again
            </DashboardActionButton>
            <DashboardGradientButton
              onClick={handleApply}
              disabled={activeRequest}
            >
              {activeRequest ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                "Apply"
              )}
            </DashboardGradientButton>
          </>
        ) : (
          <>
            <DashboardCancelButton onClick={handleClose} disabled={activeRequest}>
              Cancel
            </DashboardCancelButton>
            <Box sx={{ flex: 1 }} />
            <DashboardGradientButton
              onClick={handleSubmit}
              disabled={
                activeRequest || !instruction.trim() || retryLimitHit || isQuota
              }
            >
              {activeRequest ? (
                <CircularProgress size={18} sx={{ color: "#fff" }} />
              ) : (
                "Ask AI"
              )}
            </DashboardGradientButton>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AskAIDialog;
