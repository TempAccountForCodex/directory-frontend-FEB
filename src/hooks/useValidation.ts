/**
 * Step 2.7.1 — useValidation Hook
 *
 * A reusable validation hook that wraps validateField from utils/validation.ts.
 * Tracks touched fields, provides per-field and form-wide validation.
 * Generic — not tied to FormGenerator.
 */

import { useState, useCallback, useMemo, useRef } from "react";
import { validateField as runValidation } from "../utils/validation";

import type {
  FieldDefinition,
  ValidationRules as FieldValidationRules,
} from "../components/DynamicFields/types";
import type { ValidationRules as ValidatorRules } from "../utils/validation";

/**
 * Maximum character length for pattern strings.
 * Patterns longer than this are silently rejected to mitigate ReDoS risk.
 */
const MAX_PATTERN_LENGTH = 500;

/**
 * Convert a FieldDefinition's ValidationRules (pattern: string) to the
 * format expected by utils/validation.ts (pattern: RegExp).
 *
 * Also merges the top-level `required` flag from FieldDefinition.
 */
function toValidatorRules(
  validation: FieldValidationRules | undefined,
  required: boolean | undefined,
): ValidatorRules {
  const rules: ValidatorRules = {};

  if (required) rules.required = true;

  if (!validation) return rules;

  if (typeof validation.minLength === "number")
    rules.minLength = validation.minLength;
  if (typeof validation.maxLength === "number")
    rules.maxLength = validation.maxLength;
  if (typeof validation.min === "number") rules.min = validation.min;
  if (typeof validation.max === "number") rules.max = validation.max;

  // Convert string pattern → RegExp with ReDoS guard
  if (
    typeof validation.pattern === "string" &&
    validation.pattern.length <= MAX_PATTERN_LENGTH
  ) {
    try {
      rules.pattern = new RegExp(validation.pattern);
    } catch {
      // Silently ignore malformed patterns
    }
  }

  // Forward custom validator, adapting undefined → null return
  if (typeof validation.custom === "function") {
    const original = validation.custom;
    rules.custom = (value: unknown) => original(value) ?? null;
  }

  return rules;
}

export interface UseValidationReturn {
  /** Map of field name → array of error messages */
  errors: Record<string, string[]>;
  /** Validate a single field by name. Returns error array for that field. */
  validateField: (fieldName: string) => string[];
  /** Validate all fields. Returns true if the form is valid (no errors). */
  validateForm: () => boolean;
  /** Clear errors for a single field, or all fields if no name given. */
  clearErrors: (fieldName?: string) => void;
  /** Mark a field as touched (e.g. on blur). */
  markFieldTouched: (fieldName: string) => void;
  /** Set of field names that have been touched. */
  touchedFields: Set<string>;
  /** True when any field has errors. */
  hasErrors: boolean;
}

/**
 * useValidation — reusable validation hook for dynamic field systems.
 *
 * @param fields  Array of FieldDefinition objects describing each field
 * @param values  Current form values keyed by field name
 */
export function useValidation(
  fields: FieldDefinition[],
  values: Record<string, unknown>,
): UseValidationReturn {
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  // Build a lookup map for quick field access — stable ref updated on fields change
  const fieldMapRef = useRef<Map<string, FieldDefinition>>(new Map());
  const fieldMap = useMemo(() => {
    const map = new Map<string, FieldDefinition>();
    for (const field of fields) {
      map.set(field.name, field);
    }
    fieldMapRef.current = map;
    return map;
  }, [fields]);

  // Keep values in a ref so callbacks always see the latest without re-creation
  const valuesRef = useRef(values);
  valuesRef.current = values;

  const validateSingleField = useCallback((fieldName: string): string[] => {
    const field = fieldMapRef.current.get(fieldName);
    if (!field) return [];

    const rules = toValidatorRules(field.validation, field.required);
    const fieldErrors = runValidation(valuesRef.current[fieldName], rules);

    setErrors((prev) => {
      if (fieldErrors.length === 0) {
        if (!prev[fieldName]) return prev; // no change needed
        const next = { ...prev };
        delete next[fieldName];
        return next;
      }
      return { ...prev, [fieldName]: fieldErrors };
    });

    return fieldErrors;
  }, []);

  const validateForm = useCallback((): boolean => {
    const nextErrors: Record<string, string[]> = {};
    const currentValues = valuesRef.current;

    for (const field of fieldMapRef.current.values()) {
      const rules = toValidatorRules(field.validation, field.required);
      const fieldErrors = runValidation(currentValues[field.name], rules);
      if (fieldErrors.length > 0) {
        nextErrors[field.name] = fieldErrors;
      }
    }

    setErrors(nextErrors);

    // Mark all fields as touched on full form validation
    setTouchedFields(new Set(fieldMapRef.current.keys()));

    return Object.keys(nextErrors).length === 0;
  }, []);

  const clearErrors = useCallback((fieldName?: string) => {
    if (fieldName) {
      setErrors((prev) => {
        if (!prev[fieldName]) return prev;
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
    } else {
      setErrors({});
    }
  }, []);

  const markFieldTouched = useCallback((fieldName: string) => {
    setTouchedFields((prev) => {
      if (prev.has(fieldName)) return prev;
      const next = new Set(prev);
      next.add(fieldName);
      return next;
    });
  }, []);

  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    errors,
    validateField: validateSingleField,
    validateForm,
    clearErrors,
    markFieldTouched,
    touchedFields,
    hasErrors,
  };
}

export default useValidation;
