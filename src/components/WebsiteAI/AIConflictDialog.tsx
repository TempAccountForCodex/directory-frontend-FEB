/**
 * AIConflictDialog — shown when the user manually changed a field while an AI
 * request was in flight for that same field (PRD "Conflict Handling").
 * Displays both versions and asks which to keep.
 */

import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { AlertTriangle } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";
import type { AIConflict } from "./useEditorAI";

interface AIConflictDialogProps {
  conflict: AIConflict | null;
  onResolve: (choice: "user" | "ai") => void;
}

const renderValue = (v: unknown): string => {
  if (v == null) return "(empty)";
  if (typeof v === "string") return v;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
};

const AIConflictDialog: React.FC<AIConflictDialogProps> = ({
  conflict,
  onResolve,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Dialog
      open={!!conflict}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.panelBg || colors.bgCard,
          border: `1px solid ${colors.border}`,
        },
      }}
    >
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", gap: 1, color: colors.text }}
      >
        <AlertTriangle size={18} color="#d97706" />
        This field changed while AI was working
      </DialogTitle>
      <DialogContent>
        <Typography variant="body2" sx={{ color: colors.textSecondary, mb: 2 }}>
          You edited this field while the AI was generating. Choose which version
          to keep.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${colors.border}`,
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: colors.textSecondary, fontWeight: 600 }}
            >
              Your edit
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text, mt: 0.5 }}>
              {renderValue(conflict?.userValue)}
            </Typography>
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              border: `1px solid ${alpha("#378C92", 0.4)}`,
              backgroundColor: alpha("#378C92", 0.06),
            }}
          >
            <Typography
              variant="caption"
              sx={{ color: "#378C92", fontWeight: 600 }}
            >
              AI version
            </Typography>
            <Typography variant="body2" sx={{ color: colors.text, mt: 0.5 }}>
              {renderValue(conflict?.aiValue)}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <DashboardActionButton onClick={() => onResolve("user")}>
          Keep my edit
        </DashboardActionButton>
        <DashboardGradientButton onClick={() => onResolve("ai")}>
          Apply AI version
        </DashboardGradientButton>
      </DialogActions>
    </Dialog>
  );
};

export default AIConflictDialog;
