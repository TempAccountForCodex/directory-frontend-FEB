/**
 * SelectionOverlay — Step 9.14.2
 *
 * Floating overlay bar that appears above the preview when a block is selected.
 * Shows: block type badge, quick action buttons (Edit, Duplicate, Delete, Move Up/Down, Deselect).
 * Animates in/out using framer-motion AnimatePresence.
 */
import React, { useCallback } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { AnimatePresence, motion } from "framer-motion";
import { Edit3, Copy, Trash2, ChevronUp, ChevronDown, X } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SelectedBlockInfo {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
  /** Block-level visibility flag (lives outside content) */
  isVisible?: boolean;
}

interface SelectionOverlayProps {
  selectedBlock: SelectedBlockInfo | null;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDeselect?: () => void;
  colors: Record<string, string>;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const SelectionOverlay = React.memo(function SelectionOverlay({
  selectedBlock,
  onEdit,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onDeselect,
  colors,
}: SelectionOverlayProps) {
  const handleEdit = useCallback(() => onEdit?.(), [onEdit]);
  const handleDuplicate = useCallback(() => onDuplicate?.(), [onDuplicate]);
  const handleDelete = useCallback(() => onDelete?.(), [onDelete]);
  const handleMoveUp = useCallback(() => onMoveUp?.(), [onMoveUp]);
  const handleMoveDown = useCallback(() => onMoveDown?.(), [onMoveDown]);
  const handleDeselect = useCallback(() => onDeselect?.(), [onDeselect]);

  return (
    <AnimatePresence>
      {selectedBlock && (
        <motion.div
          key="selection-overlay"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
        >
          <Box
            data-testid="selection-overlay"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 0.75,
              mb: 1,
              borderRadius: 1,
              backgroundColor: colors.panelBg || "#121517",
              border: `1px solid ${colors.border || "rgba(55,140,146,0.15)"}`,
            }}
          >
            <Chip
              label={selectedBlock.blockType}
              size="small"
              sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                backgroundColor: "rgba(25, 118, 210, 0.15)",
                color: "#1976d2",
              }}
            />

            <Box sx={{ flex: 1 }} />

            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={handleEdit}
                aria-label="Edit block"
                sx={{ color: colors.textSecondary }}
              >
                <Edit3 size={14} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Duplicate">
              <IconButton
                size="small"
                onClick={handleDuplicate}
                aria-label="Duplicate block"
                sx={{ color: colors.textSecondary }}
              >
                <Copy size={14} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={handleDelete}
                aria-label="Delete block"
                sx={{ color: colors.textSecondary }}
              >
                <Trash2 size={14} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Move Up">
              <IconButton
                size="small"
                onClick={handleMoveUp}
                aria-label="Move block up"
                sx={{ color: colors.textSecondary }}
              >
                <ChevronUp size={14} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Move Down">
              <IconButton
                size="small"
                onClick={handleMoveDown}
                aria-label="Move block down"
                sx={{ color: colors.textSecondary }}
              >
                <ChevronDown size={14} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Deselect">
              <IconButton
                size="small"
                onClick={handleDeselect}
                aria-label="Deselect block"
                sx={{ color: colors.textSecondary }}
              >
                <X size={14} />
              </IconButton>
            </Tooltip>
          </Box>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default SelectionOverlay;
