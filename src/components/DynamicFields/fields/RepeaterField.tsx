/**
 * Steps 2.4.3–2.4.6 — RepeaterField Component
 *
 * Renders a dynamic list of structured items, each composed of one or more
 * nested field components resolved from the field component registry via
 * FieldRenderer.
 *
 * Features:
 * - Add / Remove items (with min/max enforcement)
 * - Nested field rendering per item using FieldRenderer
 * - Drag-to-reorder via @dnd-kit/core + @dnd-kit/sortable
 * - Collapse / expand per item (persisted by stable _id, survives reorders)
 * - Duplicate item button
 * - Empty state message
 * - Disabled state disables all interactive controls
 *
 * itemSchema is extracted from field.ui?.props as Record<string, FieldDefinition>.
 * Each item gets a stable _id (assigned once, used as @dnd-kit key).
 *
 * Self-registers via registerFieldComponent(FieldType.REPEATER, RepeaterField)
 * at module scope after the component declaration.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders when props are unchanged
 * - useCallback for all event handlers to maintain stable references
 * - Collapse state keyed by _id — survives drag reorders without reset
 */

import React, { useState, useCallback } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { FieldRendererProps, FieldDefinition } from "../types";
import { FieldType } from "../types";
import { registerFieldComponent } from "../registry";
import { FieldRenderer } from "../FieldRenderer";

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface RepeaterItem extends Record<string, unknown> {
  /** Stable drag-and-drop key — assigned once, never changes */
  _id: string;
}

// ---------------------------------------------------------------------------
// SortableItem wrapper (must be defined before RepeaterField)
// ---------------------------------------------------------------------------

type DragHandleProps = {
  attributes: ReturnType<typeof useSortable>["attributes"];
  listeners: ReturnType<typeof useSortable>["listeners"];
};

interface SortableItemProps {
  id: string;
  children: (dragProps: DragHandleProps) => React.ReactNode;
  disabled: boolean;
}

/**
 * SortableItem
 *
 * Thin wrapper that applies @dnd-kit drag transforms to the item container.
 * The drag handle (DragIndicatorIcon button) is rendered inside children via
 * the render-prop pattern using `dragHandleProps`.
 */
function SortableItem({ id, children, disabled }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 1.5 }}>
      {children({ attributes, listeners })}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// RepeaterField
// ---------------------------------------------------------------------------

/**
 * RepeaterField
 *
 * Renders a dynamically-sized list of structured items.
 *
 * Configuration props extracted from field.ui.props:
 * - itemSchema: Record<string, FieldDefinition>  — fields to render per item
 * - min: number (default 0)                       — minimum items allowed
 * - max: number (default Infinity)                — maximum items allowed
 */
const RepeaterField: React.FC<FieldRendererProps> = React.memo(
  ({ field, value, onChange, disabled = false, errors = [] }) => {
    // --- Extract configuration from field.ui.props ---
    const uiProps = (field.ui?.props ?? {}) as Record<string, unknown>;
    const itemSchema =
      (uiProps["itemSchema"] as Record<string, FieldDefinition>) ?? {};
    const min: number = typeof uiProps["min"] === "number" ? uiProps["min"] : 0;
    const max: number =
      typeof uiProps["max"] === "number" ? uiProps["max"] : Infinity;

    // --- Normalise value to RepeaterItem[] with stable _id ---
    const items: RepeaterItem[] = (Array.isArray(value) ? value : []).map(
      (item, i) => ({
        ...(item as Record<string, unknown>),
        _id:
          typeof (item as Record<string, unknown>)["_id"] === "string"
            ? ((item as Record<string, unknown>)["_id"] as string)
            : String(i),
      }),
    );

    // --- Per-item collapse state keyed by _id (survives reorders) ---
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    const toggleCollapse = useCallback((id: string) => {
      setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
    }, []);

    // --- CRUD handlers ---

    const handleAdd = useCallback(() => {
      if (items.length < max) {
        onChange([...items, { _id: String(Date.now()) }]);
      }
    }, [items, max, onChange]);

    const handleRemove = useCallback(
      (idx: number) => {
        if (items.length > min) {
          onChange(items.filter((_, i) => i !== idx));
        }
      },
      [items, min, onChange],
    );

    const handleDuplicate = useCallback(
      (idx: number) => {
        const dup = { ...items[idx], _id: String(Date.now()) };
        const newItems = [...items];
        newItems.splice(idx + 1, 0, dup);
        onChange(newItems);
      },
      [items, onChange],
    );

    // --- Nested field change handler ---

    const handleFieldChange = useCallback(
      (itemIdx: number, fieldName: string) => (newValue: unknown) => {
        const newItems = [...items];
        newItems[itemIdx] = { ...newItems[itemIdx], [fieldName]: newValue };
        onChange(newItems);
      },
      [items, onChange],
    );

    // --- Drag-to-reorder handler ---

    const handleDragEnd = useCallback(
      (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
          const oldIdx = items.findIndex((i) => i._id === String(active.id));
          const newIdx = items.findIndex((i) => i._id === String(over.id));
          if (oldIdx !== -1 && newIdx !== -1) {
            onChange(arrayMove(items, oldIdx, newIdx));
          }
        }
      },
      [items, onChange],
    );

    // --- Derived flags ---

    const canAdd = !disabled && items.length < max;
    const hasErrors = errors.length > 0;
    const schemaEntries = Object.entries(itemSchema);

    // ---------------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------------

    return (
      <Box>
        {/* Error banner */}
        {hasErrors && (
          <Typography
            variant="caption"
            color="error"
            role="alert"
            sx={{ display: "block", mb: 1 }}
          >
            {errors[0]}
          </Typography>
        )}

        {/* Empty state */}
        {items.length === 0 && (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
              color: "text.secondary",
              border: "1px dashed",
              borderColor: "divider",
              borderRadius: 1,
              mb: 1,
            }}
          >
            <Typography variant="body2">
              No items. Click Add to start.
            </Typography>
          </Box>
        )}

        {/* Items list wrapped in DndContext + SortableContext */}
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={items.map((item) => item._id)}
            strategy={verticalListSortingStrategy}
            disabled={disabled}
          >
            {items.map((item, idx) => {
              const isCollapsed = Boolean(collapsed[item._id]);

              return (
                <SortableItem key={item._id} id={item._id} disabled={disabled}>
                  {({ attributes, listeners }) => (
                    <Paper
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 1 }}
                      aria-label={`Item ${idx + 1} of ${items.length}`}
                    >
                      {/* Item header row */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: isCollapsed ? 0 : 1,
                        }}
                      >
                        {/* Drag handle */}
                        <IconButton
                          {...attributes}
                          {...listeners}
                          size="small"
                          disabled={disabled}
                          aria-label={`Drag item ${idx + 1}`}
                          sx={{ cursor: disabled ? "not-allowed" : "grab" }}
                        >
                          <DragIndicatorIcon fontSize="small" />
                        </IconButton>

                        {/* Item counter */}
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ flexGrow: 1 }}
                        >
                          Item {idx + 1} of {items.length}
                        </Typography>

                        {/* Collapse / expand toggle */}
                        <IconButton
                          size="small"
                          onClick={() => toggleCollapse(item._id)}
                          disabled={disabled}
                          aria-label={
                            isCollapsed
                              ? `Expand item ${idx + 1}`
                              : `Collapse item ${idx + 1}`
                          }
                        >
                          {isCollapsed ? (
                            <ExpandMoreIcon fontSize="small" />
                          ) : (
                            <ExpandLessIcon fontSize="small" />
                          )}
                        </IconButton>

                        {/* Duplicate button */}
                        <IconButton
                          size="small"
                          onClick={() => handleDuplicate(idx)}
                          disabled={disabled}
                          aria-label={`Duplicate item ${idx + 1}`}
                        >
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>

                        {/* Remove button */}
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemove(idx)}
                          disabled={disabled || items.length <= min}
                          aria-label={`Remove item ${idx + 1}`}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Collapsible item body */}
                      <Collapse in={!isCollapsed}>
                        {schemaEntries.length > 0 && (
                          <Divider sx={{ mb: 1.5 }} />
                        )}
                        {schemaEntries.map(([fieldName, fieldDef]) => (
                          <Box key={fieldName} sx={{ mb: 1.5 }}>
                            <FieldRenderer
                              field={fieldDef}
                              value={
                                (item[fieldName] as unknown) ??
                                fieldDef.defaultValue ??
                                ""
                              }
                              onChange={handleFieldChange(idx, fieldName)}
                              disabled={disabled}
                            />
                          </Box>
                        ))}
                      </Collapse>
                    </Paper>
                  )}
                </SortableItem>
              );
            })}
          </SortableContext>
        </DndContext>

        {/* Add button */}
        <Button
          startIcon={<AddIcon />}
          onClick={handleAdd}
          disabled={!canAdd}
          size="small"
          variant="outlined"
          sx={{ mt: 1 }}
        >
          Add
        </Button>
      </Box>
    );
  },
);

RepeaterField.displayName = "RepeaterField";

// Self-register in the global field component registry (module scope — runs once on import)
registerFieldComponent(FieldType.REPEATER, RepeaterField);

export { RepeaterField };
export default RepeaterField;
