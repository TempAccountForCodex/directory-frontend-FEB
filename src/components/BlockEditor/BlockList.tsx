/**
 * Step 2.6.1 — BlockList Component
 *
 * Renders a sortable list of blocks with drag-to-reorder via @dnd-kit.
 * Each item shows:
 * - Block type label (from BLOCK_TYPES registry labels)
 * - Drag handle
 * - Visibility toggle
 * - Delete button
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders when props are unchanged
 * - useCallback for all event handlers to maintain stable references
 * - Stable key props (block.id) in list
 */

import React, { useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteIcon from "@mui/icons-material/Delete";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ---------------------------------------------------------------------------
// Block type label mapping (matches backend BLOCK_TYPES registry labels)
// ---------------------------------------------------------------------------

const BLOCK_TYPE_LABELS: Record<string, string> = {
  HERO: "Hero",
  FEATURES: "Features",
  TESTIMONIALS: "Testimonials",
  CTA: "Call To Action",
  CONTACT: "Contact",
  TEXT: "Text",
};

/**
 * Returns the human-readable label for a block type key.
 * Falls back to the raw key if not found in the registry.
 */
function getBlockLabel(blockType: string): string {
  return BLOCK_TYPE_LABELS[blockType] ?? blockType;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Block {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
  isVisible: boolean;
  sortOrder: number;
  variant?: string;
}

export interface BlockListProps {
  /** Array of blocks to render */
  blocks: Block[];
  /** Called when a block is selected (clicked) */
  onSelect: (blockId: string) => void;
  /** Called with reordered blocks array after drag-end */
  onReorder: (blocks: Block[]) => void;
  /** Called when a block's delete button is clicked */
  onRemove: (blockId: string) => void;
  /** Called when a block's visibility is toggled */
  onToggleVisibility: (blockId: string) => void;
  /** Currently selected block ID (highlighted in the list) */
  selectedBlockId: string | null;
  /** Disables all interactive controls */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// SortableBlockItem — individual draggable block row
// ---------------------------------------------------------------------------

interface SortableBlockItemProps {
  block: Block;
  isSelected: boolean;
  disabled: boolean;
  onSelect: (blockId: string) => void;
  onRemove: (blockId: string) => void;
  onToggleVisibility: (blockId: string) => void;
}

function SortableBlockItem({
  block,
  isSelected,
  disabled,
  onSelect,
  onRemove,
  onToggleVisibility,
}: SortableBlockItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: block.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  const handleSelect = useCallback(() => {
    onSelect(block.id);
  }, [onSelect, block.id]);

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove(block.id);
    },
    [onRemove, block.id],
  );

  const handleToggleVisibility = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onToggleVisibility(block.id);
    },
    [onToggleVisibility, block.id],
  );

  const label = getBlockLabel(block.blockType);

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 0.5 }}>
      <Paper
        variant="outlined"
        aria-label={`Block: ${label}${isSelected ? " (selected)" : ""}`}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          p: 1,
          cursor: disabled ? "default" : "pointer",
          borderColor: isSelected ? "primary.main" : "divider",
          bgcolor: isSelected ? "action.selected" : "background.paper",
          opacity: block.isVisible ? 1 : 0.6,
          "&:hover": disabled
            ? {}
            : { borderColor: "primary.light", bgcolor: "action.hover" },
          transition: "all 0.15s ease",
        }}
        onClick={handleSelect}
      >
        {/* Drag handle */}
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          disabled={disabled}
          aria-label={`Drag block ${label}`}
          sx={{ cursor: disabled ? "not-allowed" : "grab" }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        {/* Block type label */}
        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            color: "text.primary",
            fontWeight: isSelected ? 600 : 400,
          }}
        >
          {label}
        </Typography>

        {/* Visibility toggle */}
        <IconButton
          size="small"
          disabled={disabled}
          aria-label={`Toggle visibility for block ${label}`}
          onClick={handleToggleVisibility}
          sx={{ color: block.isVisible ? "text.secondary" : "text.disabled" }}
        >
          {block.isVisible ? (
            <VisibilityIcon fontSize="small" />
          ) : (
            <VisibilityOffIcon fontSize="small" />
          )}
        </IconButton>

        {/* Delete button */}
        <IconButton
          size="small"
          disabled={disabled}
          aria-label={`Remove block ${label}`}
          onClick={handleRemove}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Box>
  );
}

// ---------------------------------------------------------------------------
// BlockList — main component
// ---------------------------------------------------------------------------

const BlockList: React.FC<BlockListProps> = React.memo(
  ({
    blocks,
    onSelect,
    onReorder,
    onRemove,
    onToggleVisibility,
    selectedBlockId,
    disabled = false,
  }) => {
    // --- Drag-to-reorder handler ---
    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
          const oldIdx = blocks.findIndex((b) => b.id === String(active.id));
          const newIdx = blocks.findIndex((b) => b.id === String(over.id));
          if (oldIdx !== -1 && newIdx !== -1) {
            onReorder(arrayMove(blocks, oldIdx, newIdx));
          }
        }
      },
      [blocks, onReorder],
    );

    // --- Empty state ---
    if (blocks.length === 0) {
      return (
        <Box
          sx={{
            textAlign: "center",
            py: 4,
            px: 2,
            color: "text.secondary",
            border: "1px dashed",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          <Typography variant="body2">
            No blocks added yet. Add a block to get started.
          </Typography>
        </Box>
      );
    }

    return (
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={blocks.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
          disabled={disabled}
        >
          {blocks.map((block) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              isSelected={block.id === selectedBlockId}
              disabled={disabled}
              onSelect={onSelect}
              onRemove={onRemove}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </SortableContext>
      </DndContext>
    );
  },
);

BlockList.displayName = "BlockList";

export { BlockList };
export default BlockList;
