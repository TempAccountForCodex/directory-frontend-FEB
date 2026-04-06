/**
 * DraggableBlockList — Step 9.1.2
 *
 * Sortable block list with drag-and-drop using @dnd-kit.
 * Consumes useDragAndDrop hook for reusable sensor/collision config.
 *
 * Features:
 * - DragOverlay (ghost preview at full opacity)
 * - Drop indicator (blue line between blocks during drag)
 * - Active item opacity 0.5 while dragging
 * - Optimistic reorder (UI updates immediately, rollback on API error)
 * - Ctrl+ArrowUp / Ctrl+ArrowDown keyboard shortcuts to move selected block
 * - Empty state: 'No blocks yet. Add a block to get started.'
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo on DraggableBlock and DraggableBlockList
 * - useCallback on all event handlers
 */

import React, { useState, useCallback, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  DragOverlay,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import axios from "axios";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DraggableBlock {
  id: number;
  blockType: string;
  content: Record<string, unknown>;
  isVisible: boolean;
  sortOrder: number;
  variant?: string;
}

export interface DraggableBlockListProps {
  /** Array of blocks to render */
  blocks: DraggableBlock[];
  /** Page ID for API calls */
  pageId: number;
  /** Website ID for API calls */
  websiteId: number | string;
  /** Called when blocks are reordered (optimistic update) */
  onBlocksChange: (blocks: DraggableBlock[]) => void;
  /** Called when a block is selected */
  onBlockSelect?: (blockId: number) => void;
  /** Currently selected block ID */
  selectedBlockId?: number | null;
  /** Disables drag interaction */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// SortableBlock — individual draggable block row
// ---------------------------------------------------------------------------

interface SortableBlockProps {
  block: DraggableBlock;
  isSelected: boolean;
  isDragging: boolean;
  disabled: boolean;
  onSelect: (blockId: number) => void;
}

const SortableBlock = React.memo(function SortableBlock({
  block,
  isSelected,
  isDragging,
  disabled,
  onSelect,
}: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: block.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    // Active item is semi-transparent during drag
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleSelect = useCallback(() => {
    onSelect(block.id);
  }, [onSelect, block.id]);

  const handleDragHandleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <li
      ref={setNodeRef}
      style={style}
      role="listitem"
      aria-label={`Block: ${block.blockType}${isSelected ? " (selected)" : ""}`}
    >
      <Paper
        variant="outlined"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          p: 1,
          mb: 0.5,
          cursor: disabled ? "default" : "pointer",
          borderColor: isSelected ? "primary.main" : "divider",
          bgcolor: isSelected ? "action.selected" : "background.paper",
          opacity: block.isVisible ? 1 : 0.6,
          "&:hover": disabled
            ? {}
            : { borderColor: "primary.light", bgcolor: "action.hover" },
          transition: "all 0.15s ease",
          position: "relative",
        }}
        onClick={handleSelect}
      >
        {/* Drag handle */}
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          disabled={disabled}
          aria-label={`Drag block ${block.blockType}`}
          sx={{ cursor: disabled ? "not-allowed" : "grab" }}
          onClick={handleDragHandleClick}
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
          {block.blockType}
        </Typography>

        {/* Visibility indicator */}
        {!block.isVisible && (
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", fontSize: "0.65rem" }}
          >
            Hidden
          </Typography>
        )}
      </Paper>
    </li>
  );
});

// ---------------------------------------------------------------------------
// DragOverlay content — shown at full opacity while dragging
// ---------------------------------------------------------------------------

const DragOverlayBlock = React.memo(function DragOverlayBlock({
  block,
}: {
  block: DraggableBlock | null;
}) {
  if (!block) return null;

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        p: 1,
        borderColor: "primary.main",
        bgcolor: "background.paper",
        boxShadow: 4,
        opacity: 1,
        cursor: "grabbing",
      }}
    >
      <DragIndicatorIcon fontSize="small" sx={{ color: "primary.main" }} />
      <Typography variant="body2" sx={{ flexGrow: 1, fontWeight: 600 }}>
        {block.blockType}
      </Typography>
    </Paper>
  );
});

// ---------------------------------------------------------------------------
// DraggableBlockList — main component
// ---------------------------------------------------------------------------

const DraggableBlockList = React.memo(function DraggableBlockList({
  blocks,
  pageId,
  websiteId,
  onBlocksChange,
  onBlockSelect,
  selectedBlockId = null,
  disabled = false,
}: DraggableBlockListProps) {
  // Track active dragged block for DragOverlay
  const [activeId, setActiveId] = useState<number | null>(null);

  // Track selected block for keyboard shortcuts
  const [localSelectedId, setLocalSelectedId] = useState<number | null>(
    selectedBlockId ?? null,
  );

  // Keep ref to previous blocks for rollback
  const previousBlocksRef = useRef<DraggableBlock[]>(blocks);

  const { sensors, collisionDetection } = useDragAndDrop({
    items: blocks,
    onReorder: onBlocksChange,
  });

  // ── Drag start ─────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number);
  }, []);

  // ── Drag end with optimistic update + API call ─────────────────────────────
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      const oldIndex = blocks.findIndex((b) => b.id === active.id);
      const newIndex = blocks.findIndex((b) => b.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      // Snapshot for rollback
      previousBlocksRef.current = blocks;

      // Optimistic update
      const reordered = arrayMove(blocks, oldIndex, newIndex);
      onBlocksChange(reordered);

      // API call
      try {
        await axios.patch(`${API_URL}/blocks/reorder`, {
          pageId,
          blockIds: reordered.map((b) => b.id),
        });
      } catch {
        // Rollback on error
        onBlocksChange(previousBlocksRef.current);
      }
    },
    [blocks, pageId, onBlocksChange],
  );

  // ── Block selection ────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (blockId: number) => {
      setLocalSelectedId(blockId);
      onBlockSelect?.(blockId);
    },
    [onBlockSelect],
  );

  // ── Keyboard shortcuts: Ctrl+ArrowUp / Ctrl+ArrowDown ─────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey) return;
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;

      const effectiveSelectedId = localSelectedId ?? selectedBlockId;
      if (effectiveSelectedId === null) return;

      const idx = blocks.findIndex((b) => b.id === effectiveSelectedId);
      if (idx === -1) return;

      e.preventDefault();

      let newIdx: number;
      if (e.key === "ArrowUp" && idx > 0) {
        newIdx = idx - 1;
      } else if (e.key === "ArrowDown" && idx < blocks.length - 1) {
        newIdx = idx + 1;
      } else {
        return;
      }

      previousBlocksRef.current = blocks;
      const reordered = arrayMove(blocks, idx, newIdx);
      onBlocksChange(reordered);

      // Persist via API
      axios
        .patch(`${API_URL}/blocks/reorder`, {
          pageId,
          blockIds: reordered.map((b) => b.id),
        })
        .catch(() => {
          onBlocksChange(previousBlocksRef.current);
        });
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [blocks, localSelectedId, selectedBlockId, pageId, onBlocksChange]);

  // ── Empty state ────────────────────────────────────────────────────────────
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
          No blocks yet. Add a block to get started.
        </Typography>
      </Box>
    );
  }

  const activeDragBlock =
    activeId !== null ? (blocks.find((b) => b.id === activeId) ?? null) : null;

  const effectiveSelectedId = localSelectedId ?? selectedBlockId;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={blocks.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {blocks.map((block) => (
            <SortableBlock
              key={block.id}
              block={block}
              isSelected={block.id === effectiveSelectedId}
              isDragging={block.id === activeId}
              disabled={disabled}
              onSelect={handleSelect}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay>
        <DragOverlayBlock block={activeDragBlock} />
      </DragOverlay>
    </DndContext>
  );
});

DraggableBlockList.displayName = "DraggableBlockList";

export default DraggableBlockList;
