/**
 * BlogPostsSelectorField — FieldType "BLOG_POSTS"
 *
 * The per-card post picker for the BLOG_SHOWCASE section. Renders a reorderable
 * list of "card slots"; each slot is a dropdown of the website's published
 * posts (or "Auto — latest post" when left unset). The stored value is an
 * ordered array of `{ _id, slug }` — slug "" means the slot auto-fills with the
 * next most-recent post at render time.
 *
 * The website id is read from `allValues._websiteId` (injected by the block
 * config form, same mechanism MenuSelectField uses), and the post pool comes
 * from the existing public feed endpoint — no backend changes required.
 */

import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { apiClient } from "../../../api/client";
import type { FieldRendererProps } from "../types";
import { registerFieldComponent } from "../registry";
import { FieldType } from "../types";

const MAX_CARDS = 12;
const POOL_LIMIT = 100;

interface PostOption {
  slug: string;
  title: string;
}

interface CardSlot {
  _id: string;
  slug: string;
}

const makeId = () =>
  `slot-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Normalise an incoming value (array of objects or bare slug strings) to slots. */
function normaliseSlots(value: unknown): CardSlot[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, i) => {
    if (typeof item === "string") return { _id: `slot-${i}`, slug: item };
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>;
      return {
        _id:
          typeof record._id === "string" && record._id
            ? record._id
            : `slot-${i}`,
        slug: typeof record.slug === "string" ? record.slug : "",
      };
    }
    return { _id: `slot-${i}`, slug: "" };
  });
}

interface SortableSlotProps {
  slot: CardSlot;
  index: number;
  total: number;
  options: PostOption[];
  loading: boolean;
  disabled: boolean;
  onChangeSlug: (id: string, slug: string) => void;
  onRemove: (id: string) => void;
}

const SortableSlot: React.FC<SortableSlotProps> = ({
  slot,
  index,
  total,
  options,
  loading,
  disabled,
  onChangeSlug,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: slot._id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? undefined,
  };

  // Surface a pinned-but-unknown slug (e.g. an unpublished/old post) so it
  // isn't silently dropped from the dropdown.
  const slugKnown =
    !slot.slug || options.some((option) => option.slug === slot.slug);

  return (
    <Box ref={setNodeRef} style={style} sx={{ mb: 1 }}>
      <Paper
        variant="outlined"
        sx={{ p: 1, borderRadius: 1.5, display: "flex", alignItems: "center", gap: 0.5 }}
      >
        <IconButton
          {...attributes}
          {...listeners}
          size="small"
          disabled={disabled}
          aria-label={`Reorder card ${index + 1}`}
          sx={{ cursor: disabled ? "not-allowed" : "grab" }}
        >
          <DragIndicatorIcon fontSize="small" />
        </IconButton>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mb: 0.25, fontWeight: 600 }}
          >
            Card {index + 1} of {total}
          </Typography>
          <FormControl fullWidth size="small" disabled={disabled}>
            <Select
              value={slot.slug}
              onChange={(e) => onChangeSlug(slot._id, e.target.value)}
              displayEmpty
              renderValue={(val) => {
                if (!val) {
                  return (
                    <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                      Auto — latest post
                    </Typography>
                  );
                }
                const found = options.find((option) => option.slug === val);
                return (
                  <Typography sx={{ fontSize: "0.85rem" }} noWrap>
                    {found ? found.title : `${val} (unavailable)`}
                  </Typography>
                );
              }}
              sx={{ fontSize: "0.85rem", borderRadius: 1.5 }}
              endAdornment={
                loading ? <CircularProgress size={13} sx={{ mr: 3 }} /> : undefined
              }
            >
              <MenuItem value="">
                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                  Auto — latest post
                </Typography>
              </MenuItem>
              {!slugKnown && (
                <MenuItem value={slot.slug}>
                  <Typography sx={{ fontSize: "0.85rem", color: "warning.main" }}>
                    {slot.slug} (unavailable)
                  </Typography>
                </MenuItem>
              )}
              {options.map((option) => (
                <MenuItem key={option.slug} value={option.slug}>
                  <Typography sx={{ fontSize: "0.85rem" }} noWrap>
                    {option.title}
                  </Typography>
                </MenuItem>
              ))}
              {!loading && options.length === 0 && (
                <MenuItem disabled>
                  <Typography sx={{ fontSize: "0.8rem", color: "text.disabled" }}>
                    No published posts yet
                  </Typography>
                </MenuItem>
              )}
            </Select>
          </FormControl>
        </Box>

        <IconButton
          size="small"
          color="error"
          onClick={() => onRemove(slot._id)}
          disabled={disabled || total <= 1}
          aria-label={`Remove card ${index + 1}`}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Paper>
    </Box>
  );
};

const BlogPostsSelectorField: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled = false,
  allValues,
}) => {
  const websiteId = allValues?._websiteId as string | number | undefined;

  const slots = useMemo(() => normaliseSlots(value), [value]);

  const [options, setOptions] = useState<PostOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!websiteId) return;
    let cancelled = false;
    setLoading(true);
    apiClient
      .get(
        `/websites/${websiteId}/blogs/public?page=1&limit=${POOL_LIMIT}&sortBy=publishedAt&sortOrder=desc`,
      )
      .then((res) => {
        if (cancelled) return;
        const payload = res.data?.data ?? res.data ?? {};
        const raw = Array.isArray(payload.blogs)
          ? payload.blogs
          : Array.isArray(payload.insights)
            ? payload.insights
            : Array.isArray(payload)
              ? payload
              : [];
        setOptions(
          raw
            .map((post: Record<string, unknown>) => ({
              slug: String(post.slug ?? ""),
              title: String(post.title ?? post.slug ?? "Untitled"),
            }))
            .filter((option: PostOption) => option.slug),
        );
      })
      .catch(() => {
        if (!cancelled) setOptions([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [websiteId]);

  const commit = useCallback(
    (next: CardSlot[]) => {
      onChange(next.map((slot) => ({ _id: slot._id, slug: slot.slug })));
    },
    [onChange],
  );

  const handleChangeSlug = useCallback(
    (id: string, slug: string) => {
      commit(slots.map((slot) => (slot._id === id ? { ...slot, slug } : slot)));
    },
    [commit, slots],
  );

  const handleRemove = useCallback(
    (id: string) => {
      if (slots.length <= 1) return;
      commit(slots.filter((slot) => slot._id !== id));
    },
    [commit, slots],
  );

  const handleAdd = useCallback(() => {
    if (slots.length >= MAX_CARDS) return;
    commit([...slots, { _id: makeId(), slug: "" }]);
  }, [commit, slots]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIdx = slots.findIndex((slot) => slot._id === String(active.id));
      const newIdx = slots.findIndex((slot) => slot._id === String(over.id));
      if (oldIdx !== -1 && newIdx !== -1) {
        commit(arrayMove(slots, oldIdx, newIdx));
      }
    },
    [commit, slots],
  );

  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", mb: 1 }}
      >
        {field.ui?.help
          ? String(field.ui.help)
          : "Reorder cards by dragging. Leave a card on “Auto” to always show the latest post."}
      </Typography>

      {!websiteId && (
        <Typography variant="caption" color="warning.main" sx={{ display: "block", mb: 1 }}>
          Save the page to load your posts.
        </Typography>
      )}

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={slots.map((slot) => slot._id)}
          strategy={verticalListSortingStrategy}
          disabled={disabled}
        >
          {slots.map((slot, index) => (
            <SortableSlot
              key={slot._id}
              slot={slot}
              index={index}
              total={slots.length}
              options={options}
              loading={loading}
              disabled={disabled}
              onChangeSlug={handleChangeSlug}
              onRemove={handleRemove}
            />
          ))}
        </SortableContext>
      </DndContext>

      <Button
        startIcon={<AddIcon />}
        onClick={handleAdd}
        disabled={disabled || slots.length >= MAX_CARDS}
        size="small"
        variant="outlined"
        sx={{ mt: 0.5 }}
      >
        Add card
      </Button>
    </Box>
  );
};

BlogPostsSelectorField.displayName = "BlogPostsSelectorField";

registerFieldComponent(FieldType.BLOG_POSTS, BlogPostsSelectorField);

export default BlogPostsSelectorField;
