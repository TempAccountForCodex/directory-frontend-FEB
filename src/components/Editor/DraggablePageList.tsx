/**
 * DraggablePageList — Step 9.1.4
 *
 * Drag-and-drop page reordering using useDragAndDrop hook.
 * Replaces the up/down buttons in CustomizeWebsite.tsx page list section,
 * while preserving the fallback up/down buttons for backward compatibility.
 *
 * Features:
 * - Drag handles for each page item
 * - DragOverlay ghost preview at full opacity
 * - Active item opacity 0.5 while dragging
 * - Fallback up/down arrow buttons (backward compatible)
 * - Mobile: drag handles work with 250ms touch delay (from hook)
 * - Page sortOrder updated after reorder
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo on DraggablePageList and SortablePage
 * - useCallback on all event handlers
 */

import React, { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
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
import { useDragAndDrop } from "../../hooks/useDragAndDrop";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageItem {
  id: string;
  title: string;
  path: string;
  isHome: boolean;
  selected: boolean;
  sortOrder: number;
}

export interface DraggablePageListProps {
  /** Array of pages to render */
  pages: PageItem[];
  /** Called when pages are reordered */
  onPagesChange: (pages: PageItem[]) => void;
  /** Disables drag interaction */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// SortablePage — individual draggable page row
// ---------------------------------------------------------------------------

interface SortablePageProps {
  page: PageItem;
  index: number;
  totalCount: number;
  isDragging: boolean;
  disabled: boolean;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
}

const SortablePage = React.memo(function SortablePage({
  page,
  index,
  totalCount,
  isDragging,
  disabled,
  onMoveUp,
  onMoveDown,
}: SortablePageProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: page.id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const handleMoveUp = useCallback(() => {
    onMoveUp(index);
  }, [onMoveUp, index]);

  const handleMoveDown = useCallback(() => {
    onMoveDown(index);
  }, [onMoveDown, index]);

  const handleDragHandleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  const isFirst = index === 0;
  const isLast = index === totalCount - 1;

  return (
    <li
      ref={setNodeRef}
      style={style}
      role="listitem"
      aria-label={`Page: ${page.title}`}
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
          borderColor: page.isHome ? "primary.main" : "divider",
          bgcolor: page.isHome ? "action.selected" : "background.paper",
          transition: "all 0.15s ease",
          "&:hover": disabled
            ? {}
            : { borderColor: "primary.light", bgcolor: "action.hover" },
        }}
      >
        {/* Drag handle */}
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          disabled={disabled}
          aria-label={`Drag page ${page.title}`}
          sx={{ cursor: disabled ? "not-allowed" : "grab" }}
          onClick={handleDragHandleClick}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        {/* Page title and path */}
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: page.isHome ? 600 : 400, color: "text.primary" }}
          >
            {page.title}
            {page.isHome && (
              <Typography
                component="span"
                variant="caption"
                sx={{ ml: 1, color: "primary.main", fontSize: "0.65rem" }}
              >
                (Home)
              </Typography>
            )}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {page.path}
          </Typography>
        </Box>

        {/* Fallback up/down buttons (backward compatible with movePage logic) */}
        <IconButton
          size="small"
          disabled={disabled || isFirst}
          aria-label={`Move ${page.title} up`}
          onClick={handleMoveUp}
        >
          <ArrowUpwardIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          disabled={disabled || isLast}
          aria-label={`Move ${page.title} down`}
          onClick={handleMoveDown}
        >
          <ArrowDownwardIcon fontSize="small" />
        </IconButton>
      </Paper>
    </li>
  );
});

// ---------------------------------------------------------------------------
// DragOverlay content
// ---------------------------------------------------------------------------

const DragOverlayPage = React.memo(function DragOverlayPage({
  page,
}: {
  page: PageItem | null;
}) {
  if (!page) return null;

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
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {page.title}
      </Typography>
    </Paper>
  );
});

// ---------------------------------------------------------------------------
// DraggablePageList — main component
// ---------------------------------------------------------------------------

const DraggablePageList = React.memo(function DraggablePageList({
  pages,
  onPagesChange,
  disabled = false,
}: DraggablePageListProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const { sensors, collisionDetection } = useDragAndDrop({
    items: pages,
    onReorder: onPagesChange,
  });

  // ── Drag start ─────────────────────────────────────────────────────────────
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  // ── Drag end with sortOrder update ────────────────────────────────────────
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over || active.id === over.id) return;

      const oldIndex = pages.findIndex((p) => p.id === active.id);
      const newIndex = pages.findIndex((p) => p.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(pages, oldIndex, newIndex).map((p, idx) => ({
        ...p,
        sortOrder: idx,
      }));

      onPagesChange(reordered);
    },
    [pages, onPagesChange],
  );

  // ── Fallback up/down (backward compatible with movePage logic) ────────────
  const handleMoveUp = useCallback(
    (index: number) => {
      if (index <= 0) return;
      const newPages = [...pages];
      [newPages[index], newPages[index - 1]] = [
        newPages[index - 1],
        newPages[index],
      ];
      // Update sortOrder
      newPages[index].sortOrder = index;
      newPages[index - 1].sortOrder = index - 1;
      onPagesChange(newPages);
    },
    [pages, onPagesChange],
  );

  const handleMoveDown = useCallback(
    (index: number) => {
      if (index >= pages.length - 1) return;
      const newPages = [...pages];
      [newPages[index], newPages[index + 1]] = [
        newPages[index + 1],
        newPages[index],
      ];
      // Update sortOrder
      newPages[index].sortOrder = index;
      newPages[index + 1].sortOrder = index + 1;
      onPagesChange(newPages);
    },
    [pages, onPagesChange],
  );

  if (pages.length === 0) {
    return null;
  }

  const activeDragPage =
    activeId !== null ? (pages.find((p) => p.id === activeId) ?? null) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={pages.map((p) => p.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {pages.map((page, index) => (
            <SortablePage
              key={page.id}
              page={page}
              index={index}
              totalCount={pages.length}
              isDragging={page.id === activeId}
              disabled={disabled}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
            />
          ))}
        </ul>
      </SortableContext>

      <DragOverlay>
        <DragOverlayPage page={activeDragPage} />
      </DragOverlay>
    </DndContext>
  );
});

DraggablePageList.displayName = "DraggablePageList";

export default DraggablePageList;
