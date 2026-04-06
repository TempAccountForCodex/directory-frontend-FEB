/**
 * Step 2.5.4 + 2.5.5 + 2.7.3 — FormGenerator Component
 *
 * Orchestrates dynamic form rendering using:
 * - useFieldMetadata: fetches field metadata from the API
 * - useValidation: centralized validation with touched-field tracking
 * - FieldRenderer: renders individual fields via the registry
 * - shouldShowField: evaluates conditional visibility at the form level
 * - useDebouncedValue: debounces form values before running validation
 *
 * Props:
 *   blockType      - content-type identifier passed to useFieldMetadata
 *   initialValues  - seed values for the form state (applied on mount)
 *   onChange       - fires immediately with complete updated values object
 *   onValidate     - fires (debounced 300ms) with the full errors map
 *   onSubmit       - fires with values when form is submitted and valid
 *   disabled       - propagated to every FieldRenderer
 *
 * VALIDATION (Step 2.7.3):
 * - Uses useValidation hook for centralized validation + touched tracking
 * - onBlur triggers IMMEDIATE validation (no debounce) and marks field touched
 * - onChange debounce (300ms) is preserved for background validation
 * - Only touched fields show errors in the UI
 * - validateForm is called on submit; submit blocked if hasErrors
 *
 * PERFORMANCE: Wrapped in React.memo — only re-renders when props change.
 *
 * PERFORMANCE FIXES (PROD QA Step 2.5):
 * - Per-field onChange handlers are stable across renders via a useRef
 *   handler map, preventing FieldRenderer (React.memo) from re-rendering
 *   due to new function references on every parent state update.
 *
 * DATA INTEGRITY FIXES (PROD QA Step 2.5):
 * - Validation only runs on fields that are currently visible (pass
 *   shouldShowField). Hidden fields are excluded from the errors map so
 *   onValidate never reports errors for fields the user cannot interact with.
 * - Per-field handlers use the functional setValues form to avoid stale
 *   closure reads when fields change rapidly in succession.
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import { AnimatePresence, motion } from "framer-motion";

import useFieldMetadata from "../hooks/useFieldMetadata";
import useDebouncedValue from "../hooks/useDebouncedValue";
import { useValidation } from "../hooks/useValidation";
import { FieldRenderer } from "./DynamicFields/FieldRenderer";
import { shouldShowField } from "../utils/conditionalLogic";
import type { FieldDefinition as ConditionalFieldDef } from "../utils/conditionalLogic";

import type { FieldDefinition as RendererFieldDef } from "./DynamicFields/types";
import type { FieldDefinition as MetaFieldDef } from "../hooks/useFieldMetadata";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Cast a MetaFieldDef (simplified, from useFieldMetadata) to the full
 * RendererFieldDef shape expected by FieldRenderer. Unknown type strings
 * are passed through; FieldRenderer/registry will handle unknowns gracefully.
 */
function castToRendererField(field: MetaFieldDef): RendererFieldDef {
  return field as unknown as RendererFieldDef;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FormGeneratorProps {
  /** Content-type block identifier used by useFieldMetadata */
  blockType: string;
  /** Initial form values — populates state on mount */
  initialValues?: Record<string, unknown>;
  /** Fires immediately with the full updated values object on any field change */
  onChange?: (values: Record<string, unknown>) => void;
  /** Fires (debounced 300ms) with the full errors map after validation runs */
  onValidate?: (errors: Record<string, string[]>) => void;
  /** Fires with values when form is submitted and validation passes */
  onSubmit?: (values: Record<string, unknown>) => void;
  /** Propagated to every FieldRenderer to make all fields non-interactive */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

/** Renders multiple Skeleton rows to preserve layout during data fetch */
const FormSkeleton: React.FC = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {[1, 2, 3, 4].map((n) => (
      <Box key={n} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Skeleton variant="text" width="30%" height={20} />
        <Skeleton variant="rectangular" width="100%" height={40} />
      </Box>
    ))}
  </Box>
);

// ---------------------------------------------------------------------------
// FormGenerator
// ---------------------------------------------------------------------------

const FormGenerator: React.FC<FormGeneratorProps> = React.memo(
  ({
    blockType,
    initialValues = {},
    onChange,
    onValidate,
    onSubmit,
    disabled = false,
  }) => {
    // -----------------------------------------------------------------------
    // State
    // -----------------------------------------------------------------------

    const [values, setValues] =
      useState<Record<string, unknown>>(initialValues);

    // Reset form values when initialValues changes (e.g. user selects a different block).
    // Uses JSON.stringify comparison to avoid resetting on every render when the parent
    // creates a new object reference with identical content. The functional updater
    // checks whether the serialized state actually differs to avoid redundant re-renders
    // when the parent echoes back the same content (e.g. after an onChange round-trip).
    const serializedInitial = useMemo(
      () => JSON.stringify(initialValues),
      [initialValues],
    );
    useEffect(() => {
      setValues((prev) => {
        const next = JSON.parse(serializedInitial);
        // Skip update if content is unchanged (prevents redundant re-render on echo-back)
        if (JSON.stringify(prev) === serializedInitial) return prev;
        return next;
      });
    }, [serializedInitial]);

    // Debounced values — used only for validation to avoid spamming on rapid typing
    const debouncedValues = useDebouncedValue(values, 300);

    // -----------------------------------------------------------------------
    // Field metadata
    // -----------------------------------------------------------------------

    const { metadata, loading, error } = useFieldMetadata(blockType);

    // -----------------------------------------------------------------------
    // Flatten all fields from metadata groups for useValidation
    // -----------------------------------------------------------------------

    const allFields = useMemo<RendererFieldDef[]>(() => {
      if (!metadata) return [];
      return metadata.groups.flatMap((g) =>
        g.fields.map((f) => castToRendererField(f)),
      );
    }, [metadata]);

    // -----------------------------------------------------------------------
    // useValidation hook — centralized validation + touched tracking
    // -----------------------------------------------------------------------

    const {
      errors,
      validateField: hookValidateField,
      validateForm,
      markFieldTouched,
      touchedFields,
      hasErrors,
    } = useValidation(allFields, values);

    // -----------------------------------------------------------------------
    // Stable per-field onChange handlers
    //
    // PERFORMANCE FIX: Rather than returning a new closure from
    // handleFieldChange(field.name) inside the render map (which creates new
    // function references on every render and defeats React.memo on
    // FieldRenderer), we maintain a ref-based map of stable per-field
    // callbacks. Each entry is recreated only when the parent's onChange
    // prop changes — not on every values state update.
    //
    // The map is invalidated (cleared) whenever onChange changes, then
    // lazily repopulated on the next render cycle.
    // -----------------------------------------------------------------------

    // Keep a mutable ref to the latest onChange so stable callbacks can
    // call the current prop without the callback needing to be recreated.
    const onChangePropRef = useRef(onChange);
    useEffect(() => {
      onChangePropRef.current = onChange;
    });

    // Map of field name → stable per-field onChange callback.
    // The map is cleared when `onChange` identity changes (see effect below)
    // so that stale closures over the old onChange are never called.
    const fieldHandlersRef = useRef<Map<string, (newValue: unknown) => void>>(
      new Map(),
    );

    // Invalidate the handler map whenever the parent onChange prop changes
    useEffect(() => {
      fieldHandlersRef.current.clear();
    }, [onChange]);

    /**
     * getFieldHandler — returns a stable per-field onChange callback.
     * Creates the callback on first request for a given fieldName and
     * caches it until onChange identity changes.
     *
     * DATA INTEGRITY: setValues uses the functional form to get the latest
     * prev state — safe even when called in rapid succession. onChange is
     * called inside the functional updater (same as original) so it receives
     * the correct updated values object derived from the latest prev.
     */
    const getFieldHandler = useCallback(
      (fieldName: string): ((newValue: unknown) => void) => {
        if (!fieldHandlersRef.current.has(fieldName)) {
          const handler = (newValue: unknown) => {
            setValues((prev) => {
              const updated = { ...prev, [fieldName]: newValue };
              onChangePropRef.current?.(updated);
              return updated;
            });
          };
          fieldHandlersRef.current.set(fieldName, handler);
        }
        return fieldHandlersRef.current.get(fieldName)!;
      },
      [],
    ); // no deps — the handler itself reads from refs, not closures

    // -----------------------------------------------------------------------
    // Stable per-field onBlur handlers (same ref-map pattern as onChange)
    // -----------------------------------------------------------------------

    const blurHandlersRef = useRef<Map<string, () => void>>(new Map());

    const getBlurHandler = useCallback(
      (fieldName: string): (() => void) => {
        if (!blurHandlersRef.current.has(fieldName)) {
          const handler = () => {
            markFieldTouched(fieldName);
            hookValidateField(fieldName);
          };
          blurHandlersRef.current.set(fieldName, handler);
        }
        return blurHandlersRef.current.get(fieldName)!;
      },
      [markFieldTouched, hookValidateField],
    );

    // -----------------------------------------------------------------------
    // Sorted groups (memoized)
    // -----------------------------------------------------------------------

    const sortedGroups = useMemo(() => {
      if (!metadata) return [];
      return [...metadata.groups].sort((a, b) => a.order - b.order);
    }, [metadata]);

    // -----------------------------------------------------------------------
    // Sorted fields per group — memoized on metadata only (field order is
    // stable; visibility is computed separately per context).
    // -----------------------------------------------------------------------

    const sortedGroupsWithSortedFields = useMemo(() => {
      return sortedGroups.map((group) => {
        const sortedFields = [...group.fields].sort(
          (a, b) => (a.order ?? 0) - (b.order ?? 0),
        );
        return { group, sortedFields };
      });
    }, [sortedGroups]);

    // -----------------------------------------------------------------------
    // Visible fields for RENDERING — derived from current (live) values.
    // Kept separate from the validation visible-fields computation so that
    // the render reflects the latest state on every keystroke.
    // -----------------------------------------------------------------------

    const sortedGroupsWithVisible = useMemo(() => {
      return sortedGroupsWithSortedFields.map(({ group, sortedFields }) => ({
        group,
        visibleFields: sortedFields.filter((field) =>
          shouldShowField(field as unknown as ConditionalFieldDef, values),
        ),
      }));
    }, [sortedGroupsWithSortedFields, values]);

    // -----------------------------------------------------------------------
    // Visible fields for VALIDATION — derived from debounced values.
    //
    // DATA INTEGRITY FIX: Only visible fields are validated. Hidden fields
    // are excluded from nextErrors so onValidate never reports errors for
    // fields the user cannot see or interact with.
    //
    // PERFORMANCE: Using debouncedValues here means visibility re-evaluation
    // for validation is also debounced — preventing the validation effect
    // from firing on every keystroke due to a changing `visibleFields` dep.
    // -----------------------------------------------------------------------

    const visibleFieldsForValidation = useMemo<MetaFieldDef[]>(() => {
      return sortedGroupsWithSortedFields.flatMap(({ sortedFields }) =>
        sortedFields.filter((field) =>
          shouldShowField(
            field as unknown as ConditionalFieldDef,
            debouncedValues,
          ),
        ),
      );
    }, [sortedGroupsWithSortedFields, debouncedValues]);

    // -----------------------------------------------------------------------
    // Debounced validation — runs on debounced values, visible fields only
    // -----------------------------------------------------------------------

    useEffect(() => {
      if (!metadata) return;

      for (const field of visibleFieldsForValidation) {
        hookValidateField(field.name);
      }
    }, [
      metadata,
      debouncedValues,
      visibleFieldsForValidation,
      hookValidateField,
    ]);

    // -----------------------------------------------------------------------
    // Bridge: fire onValidate when errors change (visible fields only)
    // -----------------------------------------------------------------------

    const visibleFieldNamesForValidation = useMemo(
      () => new Set(visibleFieldsForValidation.map((f) => f.name)),
      [visibleFieldsForValidation],
    );

    useEffect(() => {
      if (!metadata) return;

      const visibleErrors: Record<string, string[]> = {};
      for (const [name, fieldErrors] of Object.entries(errors)) {
        if (
          visibleFieldNamesForValidation.has(name) &&
          fieldErrors.length > 0
        ) {
          visibleErrors[name] = fieldErrors;
        }
      }
      onValidate?.(visibleErrors);
    }, [errors, metadata, visibleFieldNamesForValidation, onValidate]);

    // -----------------------------------------------------------------------
    // Animation: skip entry animation on initial render (2.8.1)
    // -----------------------------------------------------------------------

    const hasMountedRef = useRef(false);
    useEffect(() => {
      hasMountedRef.current = true;
    }, []);

    // -----------------------------------------------------------------------
    // clearOnHide: track previously visible fields and clear values (2.8.2)
    // -----------------------------------------------------------------------

    const prevVisibleFieldNamesRef = useRef<Set<string> | null>(null);

    const currentVisibleFieldNames = useMemo(() => {
      const names = new Set<string>();
      for (const { visibleFields } of sortedGroupsWithVisible) {
        for (const field of visibleFields) {
          names.add(field.name);
        }
      }
      return names;
    }, [sortedGroupsWithVisible]);

    useEffect(() => {
      const prev = prevVisibleFieldNamesRef.current;
      prevVisibleFieldNamesRef.current = currentVisibleFieldNames;

      // Skip on first run (no previous state to compare)
      if (!prev) return;

      // Find fields that were visible before but are now hidden
      const newlyHidden: string[] = [];
      for (const name of prev) {
        if (!currentVisibleFieldNames.has(name)) {
          newlyHidden.push(name);
        }
      }

      if (newlyHidden.length === 0) return;

      // Collect fields to clear (clearOnHide=true and have a non-undefined value)
      const fieldsToClear: string[] = [];
      for (const name of newlyHidden) {
        // Find the field definition to check clearOnHide
        const fieldDef = allFields.find((f) => f.name === name);
        if (fieldDef && fieldDef.clearOnHide === true) {
          fieldsToClear.push(name);
        }
      }

      if (fieldsToClear.length === 0) return;

      setValues((prev) => {
        let changed = false;
        const updated = { ...prev };
        for (const name of fieldsToClear) {
          if (updated[name] !== undefined) {
            delete updated[name];
            changed = true;
          }
        }
        if (!changed) return prev;
        onChangePropRef.current?.(updated);
        return updated;
      });
    }, [currentVisibleFieldNames, allFields]);

    // -----------------------------------------------------------------------
    // Submit handler — validates all fields, blocks if invalid
    // -----------------------------------------------------------------------

    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        const isValid = validateForm();
        if (isValid) {
          onSubmit?.(values);
        }
      },
      [validateForm, values, onSubmit],
    );

    // -----------------------------------------------------------------------
    // Render states
    // -----------------------------------------------------------------------

    if (loading) {
      return <FormSkeleton />;
    }

    if (error) {
      return (
        <Typography color="error" role="alert">
          {error}
        </Typography>
      );
    }

    if (!metadata || sortedGroups.length === 0) {
      return (
        <Typography color="text.secondary">
          No fields are configured for this content type.
        </Typography>
      );
    }

    // -----------------------------------------------------------------------
    // Full render
    // -----------------------------------------------------------------------

    return (
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {sortedGroupsWithVisible.map(
          ({ group, visibleFields: groupVisibleFields }) => (
            <Box
              key={group.id}
              sx={{ display: "flex", flexDirection: "column", gap: 2 }}
            >
              {/* Group heading */}
              <Typography
                variant="subtitle1"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                {group.label}
              </Typography>

              {/* Fields — responsive: stack on mobile, two-column on sm+ */}
              <Box
                sx={{
                  display: "grid",
                  gap: 2,
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(auto-fill, minmax(280px, 1fr))",
                  },
                }}
              >
                <AnimatePresence mode="sync">
                  {groupVisibleFields.map((field) => {
                    const rendererField = castToRendererField(field);
                    return (
                      <motion.div
                        key={field.name}
                        initial={
                          hasMountedRef.current
                            ? { opacity: 0, height: 0 }
                            : false
                        }
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        style={{ overflow: "hidden" }}
                      >
                        <FieldRenderer
                          field={rendererField}
                          value={
                            values[field.name] ??
                            rendererField.defaultValue ??
                            ""
                          }
                          onChange={getFieldHandler(field.name)}
                          onBlur={getBlurHandler(field.name)}
                          disabled={disabled}
                          errors={
                            touchedFields.has(field.name)
                              ? errors[field.name] || []
                              : []
                          }
                          allValues={values}
                        />
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </Box>
            </Box>
          ),
        )}
      </Box>
    );
  },
);

FormGenerator.displayName = "FormGenerator";

export default FormGenerator;
export { FormGenerator };
