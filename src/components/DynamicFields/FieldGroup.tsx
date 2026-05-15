/**
 * Step 2.1.5 — FieldGroup Component
 * Groups FieldDefinitions by FieldGroupDefinition and renders each field
 * via FieldRenderer, sorted by group.order then field.order.
 *
 * PERFORMANCE: Wrapped in React.memo — only re-renders when props change.
 *              Group/field sorting is done inside useMemo to avoid repeated
 *              sort work on every render.
 *              FieldRowRenderer is a memoized sub-component that stabilises the
 *              per-field onChange adapter via useCallback, preventing FieldRenderer
 *              from re-rendering when unrelated fields change.
 */
import React, { useCallback, useMemo } from "react";
import { Box, Typography, Divider } from "@mui/material";
import { FieldRenderer } from "./FieldRenderer";
import type { FieldDefinition, FieldGroupDefinition } from "./types";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface FieldGroupProps {
  /** All field definitions that belong to this collection */
  fields: FieldDefinition[];
  /** Group definitions that organise the fields (optional) */
  groups?: FieldGroupDefinition[];
  /** Current form values keyed by field name */
  values: Record<string, unknown>;
  /** Callback invoked when any field value changes */
  onChange: (name: string, value: unknown) => void;
  /** Whether all fields in this group are non-interactive */
  disabled?: boolean;
  /** Per-field validation error messages keyed by field name */
  errors?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Sort comparator — ascending by numeric order (undefined → Infinity) */
function byOrder<T extends { order?: number }>(a: T, b: T): number {
  return (a.order ?? Infinity) - (b.order ?? Infinity);
}

/**
 * Build a list of render slices: each slice is either a named group
 * (with header + its fields) or a synthetic "ungrouped" group for fields
 * that have no `group` assignment.
 */
interface RenderGroup {
  id: string;
  label: string | null; // null = ungrouped (no header rendered)
  order: number;
  fields: FieldDefinition[];
}

function buildRenderGroups(
  fields: FieldDefinition[],
  groups: FieldGroupDefinition[],
): RenderGroup[] {
  const groupMap = new Map<string, FieldGroupDefinition>(
    groups.map((g) => [g.id, g]),
  );

  // Bucket fields by group id
  const buckets = new Map<string, FieldDefinition[]>();
  const ungrouped: FieldDefinition[] = [];

  for (const field of fields) {
    if (field.group && groupMap.has(field.group)) {
      const bucket = buckets.get(field.group) ?? [];
      bucket.push(field);
      buckets.set(field.group, bucket);
    } else {
      ungrouped.push(field);
    }
  }

  const renderGroups: RenderGroup[] = [];

  // Named groups — sorted by group.order, fields inside sorted by field.order
  for (const group of [...groups].sort(byOrder)) {
    const groupFields = (buckets.get(group.id) ?? []).sort(byOrder);
    if (groupFields.length === 0) continue; // skip empty groups
    renderGroups.push({
      id: group.id,
      label: group.label,
      order: group.order ?? Infinity,
      fields: groupFields,
    });
  }

  // Ungrouped fields — rendered after all named groups, sorted by field.order
  if (ungrouped.length > 0) {
    renderGroups.push({
      id: "__ungrouped__",
      label: null,
      order: Infinity,
      fields: ungrouped.sort(byOrder),
    });
  }

  return renderGroups;
}

// ---------------------------------------------------------------------------
// FieldRowRenderer — memoized per-field row
// ---------------------------------------------------------------------------

/**
 * Props for the internal FieldRowRenderer sub-component.
 */
interface FieldRowRendererProps {
  field: FieldDefinition;
  value: unknown;
  /** The FieldGroup-level onChange — stable reference (from React.memo parent) */
  onGroupChange: (name: string, value: unknown) => void;
  disabled: boolean;
  errors?: string[];
  allValues: Record<string, unknown>;
}

/**
 * FieldRowRenderer
 *
 * A memoized wrapper around FieldRenderer that stabilises the per-field
 * onChange adapter via useCallback.
 *
 * PERFORMANCE: Without this sub-component, the inline `(newValue) =>
 * onChange(field.name, newValue)` inside FieldGroup's `.map()` would produce
 * a new function reference on every FieldGroup render, defeating React.memo
 * on FieldRenderer. By lifting the adapter into a dedicated memoized component,
 * FieldRenderer only re-renders when its own props actually change.
 */
const FieldRowRenderer: React.FC<FieldRowRendererProps> = React.memo(
  ({ field, value, onGroupChange, disabled, errors, allValues }) => {
    const handleChange = useCallback(
      (newValue: unknown) => onGroupChange(field.name, newValue),
      [field.name, onGroupChange],
    );

    return (
      <FieldRenderer
        field={field}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        errors={errors}
        allValues={allValues}
      />
    );
  },
);

FieldRowRenderer.displayName = "FieldRowRenderer";

// ---------------------------------------------------------------------------
// FieldGroup
// ---------------------------------------------------------------------------

/**
 * FieldGroup
 *
 * Renders a collection of fields organised into visual groups.
 * Each named group displays a section header and a divider.
 * Fields without a group assignment are rendered last, without a header.
 *
 * Sort order:
 *   1. Groups sorted by group.order (ascending, undefined → last)
 *   2. Fields within each group sorted by field.order (ascending, undefined → last)
 *
 * Wrapped in React.memo for performance — only re-renders on prop changes.
 */
export const FieldGroup: React.FC<FieldGroupProps> = React.memo(
  ({
    fields,
    groups = [],
    values,
    onChange,
    disabled = false,
    errors = {},
  }) => {
    // Memoize the sorted group structure so it is not recomputed on every render
    const renderGroups = useMemo(
      () => buildRenderGroups(fields, groups),
      [fields, groups],
    );

    return (
      <Box data-testid="field-group-root">
        {renderGroups.map((group) => (
          <Box key={group.id} data-testid={`field-group-${group.id}`}>
            {/* Section header — only rendered for named groups */}
            {group.label !== null && (
              <>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  sx={{
                    mt: 2,
                    mb: 0.5,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                  data-testid={`field-group-label-${group.id}`}
                >
                  {group.label}
                </Typography>
                <Divider sx={{ mb: 1.5 }} />
              </>
            )}

            {/* Fields — each rendered via FieldRowRenderer for stable onChange */}
            {group.fields.map((field) => (
              <FieldRowRenderer
                key={field.name}
                field={field}
                value={values[field.name] ?? field.defaultValue ?? ""}
                onGroupChange={onChange}
                disabled={disabled}
                errors={errors[field.name]}
                allValues={values}
              />
            ))}
          </Box>
        ))}
      </Box>
    );
  },
);

FieldGroup.displayName = "FieldGroup";

export default FieldGroup;
