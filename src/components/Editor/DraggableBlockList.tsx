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
import { alpha } from "@mui/material/styles";
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
import { apiClient } from "../../api/client";
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DraggableBlock {
  id: number | string;
  blockType: string;
  content: Record<string, unknown>;
  isVisible: boolean;
  sortOrder: number;
  variant?: string;
}

const toTitleCase = (value: string): string =>
  value
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();

const collapseSpacedUppercaseLabel = (value: string): string => {
  const trimmed = String(value || "").trim();

  const isSpacedLetters = /^[A-Z](\s+[A-Z])+$/.test(trimmed);

  return isSpacedLetters ? trimmed.replace(/\s+/g, "") : trimmed;
};

const humanizeBlockType = (value: string): string => {
  const cleaned = collapseSpacedUppercaseLabel(String(value || ""))
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  return toTitleCase(cleaned);
};

const normalizeBlockLabel = (value: string): string => {
  const cleaned = collapseSpacedUppercaseLabel(String(value || ""))
    .replace(/[_-]+/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "";

  return toTitleCase(cleaned);
};

const getBlockLabel = (block: DraggableBlock): string => {
  const customLabel = block.content?.editorLabel;

  return typeof customLabel === "string" && customLabel.trim()
    ? normalizeBlockLabel(customLabel)
    : humanizeBlockType(block.blockType);
};
export interface DraggableBlockListProps {
  /** Array of blocks to render */
  blocks: DraggableBlock[];
  /** Page ID for API calls */
  pageId: number | string;
  /** Website ID for API calls */
  websiteId: number | string;
  /** Called when blocks are reordered (optimistic update) */
  onBlocksChange: (blocks: DraggableBlock[]) => void;
  /** Called when a block is selected */
  onBlockSelect?: (blockId: number | string) => void;
  /** Currently selected block ID */
  selectedBlockId?: number | string | null;
  /** Disables drag interaction */
  disabled?: boolean;
  /** Skip backend reorder persistence for local-only template pages */
  persistReorder?: boolean;
}

const normalizeBlockOrder = (items: DraggableBlock[]): DraggableBlock[] =>
  items.map((block, index) => ({
    ...block,
    sortOrder: index,
  }));

// ---------------------------------------------------------------------------
// SortableBlock — individual draggable block row
// ---------------------------------------------------------------------------

interface SortableBlockProps {
  block: DraggableBlock;
  isSelected: boolean;
  isDragging: boolean;
  disabled: boolean;
  onSelect: (blockId: number | string) => void;
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

  const blockLabel = getBlockLabel(block);

  return (
    <li
      ref={setNodeRef}
      style={style}
      role="listitem"
      aria-label={`Block: ${blockLabel}${isSelected ? " (selected)" : ""}`}
    >
      <Paper
        {...attributes}
        {...listeners}
        variant="outlined"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          px: 1.35,
          py: 1.4,
          // mb: 1,
          cursor: disabled
            ? "default"
            : isSortableDragging
              ? "grabbing"
              : "grab",

          border: "none",
          borderBottom: "1px solid",
          borderBottomColor: isSelected
            ? "primary.main"
            : alpha("#999999", 0.14),
          bgcolor: isSelected ? alpha("#16383b", 0.92) : alpha("#f6f8f8", 0.96),
          color: isSelected ? "#f5fbfb" : "#142022",
          opacity: block.isVisible ? 1 : 0.58,
          borderRadius: "0px !important",
          // boxShadow: isSelected
          //   ? "0 14px 30px rgba(0, 0, 0, 0.24)"
          //   : "0 8px 18px rgba(3, 12, 14, 0.08)",
          "&:hover": disabled
            ? {}
            : {
                borderColor: isSelected
                  ? "primary.main"
                  : alpha("#378C92", 0.55),
                bgcolor: isSelected ? alpha("#1b4448", 0.96) : "#ffffff",
                transform: "translateY(-2px)",
                boxShadow: isSelected
                  ? "0 18px 34px rgba(0, 0, 0, 0.28)"
                  : "0 16px 28px rgba(3, 12, 14, 0.12)",
              },
          transition:
            "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
          position: "relative",
          overflow: "hidden",
          touchAction: disabled ? "auto" : "none",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: isSelected ? "black" : "white",
            pointerEvents: "none",
          },
        }}
        onClick={handleSelect}
      >
        <Typography
          variant="caption"
          sx={{
            minWidth: 28,
            height: 28,
            // display: "grid",
            placeItems: "center",
            borderRadius: 999,
            bgcolor: isSelected ? "#ffffff" : alpha("#10282b", 0.08),
            color: isSelected ? "#081416" : alpha("#10282b", 0.72),
            fontWeight: 700,
            fontSize: "0.68rem",
            position: "relative",
            zIndex: 1,
            display: "none",
          }}
        >
          {block.sortOrder + 1}
        </Typography>

        {/* Drag handle */}
        <IconButton
          size="small"
          disabled={disabled}
          aria-label={`Drag block ${blockLabel}`}
          sx={{
            cursor: disabled
              ? "not-allowed"
              : isSortableDragging
                ? "grabbing"
                : "grab",
            color: isSelected ? alpha("#f5fbfb", 0.72) : "black",
            borderRadius: 2,
            position: "relative",
            zIndex: 1,
            "&:hover": {
              bgcolor: isSelected
                ? alpha("#ffffff", 0.08)
                : alpha("#10282b", 0.06),
              color: isSelected ? "#ffffff" : "#10282b",
            },
          }}
          onClick={handleDragHandleClick}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        {/* Block type label */}
        <Typography
          variant="body2"
          sx={{
            flexGrow: 1,
            color: "inherit",
            fontWeight: isSelected ? 700 : 600,
            letterSpacing: "0.01em",
            fontSize: "0.84rem",
            position: "relative",
            zIndex: 1,
            textTransform: "none",
          }}
        >
          {blockLabel}
        </Typography>

        {/* Visibility indicator */}
        {!block.isVisible && (
          <Typography
            variant="caption"
            sx={{
              color: isSelected ? alpha("#f5fbfb", 0.72) : "text.disabled",
              fontSize: "0.65rem",
              position: "relative",
              zIndex: 1,
            }}
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

  const blockLabel = getBlockLabel(block);

  return (
    <Paper
      variant="outlined"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        px: 1.3,
        py: 1,
        borderRadius: 3,
        borderColor: "primary.main",
        bgcolor: alpha("#16383b", 0.96),
        color: "#f5fbfb",
        boxShadow: "0 20px 38px rgba(0, 0, 0, 0.28)",
        opacity: 1,
        cursor: "grabbing",
      }}
    >
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: 999,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha("#2da4ad", 0.18),
          color: "#7fe3ea",
        }}
      >
        <DragIndicatorIcon fontSize="small" />
      </Box>
      <Typography
        variant="body2"
        sx={{
          flexGrow: 1,
          fontWeight: 700,
          textTransform: "none",
          letterSpacing: "0.01em",
          fontSize: "0.84rem",
        }}
      >
        {blockLabel}
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
  persistReorder = true,
}: DraggableBlockListProps) {
  // Track active dragged block for DragOverlay
  const [activeId, setActiveId] = useState<number | string | null>(null);

  // Track selected block for keyboard shortcuts
  const [localSelectedId, setLocalSelectedId] = useState<
    number | string | null
  >(selectedBlockId ?? null);

  // Keep ref to previous blocks for rollback
  const previousBlocksRef = useRef<DraggableBlock[]>(blocks);

  const { sensors, collisionDetection } = useDragAndDrop({
    items: blocks,
    onReorder: onBlocksChange,
  });

  // ── Drag start ─────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as number | string);
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
      const reordered = normalizeBlockOrder(
        arrayMove(blocks, oldIndex, newIndex),
      );
      onBlocksChange(reordered);

      if (persistReorder) {
        try {
          await apiClient.patch(`/blocks/reorder`, {
            pageId,
            blockIds: reordered.map((b) => b.id),
          });
        } catch {
          onBlocksChange(previousBlocksRef.current);
        }
      }
    },
    [blocks, pageId, onBlocksChange, persistReorder],
  );

  // ── Block selection ────────────────────────────────────────────────────────
  const handleSelect = useCallback(
    (blockId: number | string) => {
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
      const reordered = normalizeBlockOrder(arrayMove(blocks, idx, newIdx));
      onBlocksChange(reordered);

      // Persist via API
      if (persistReorder) {
        apiClient
          .patch(`/blocks/reorder`, {
            pageId,
            blockIds: reordered.map((b) => b.id),
          })
          .catch(() => {
            onBlocksChange(previousBlocksRef.current);
          });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    blocks,
    localSelectedId,
    selectedBlockId,
    pageId,
    onBlocksChange,
    persistReorder,
  ]);

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
