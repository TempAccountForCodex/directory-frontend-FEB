/**
 * Step 2.1.4 — FieldRenderer Component
 * Core renderer that resolves the correct field component from the registry,
 * evaluates conditional visibility, runs validation, and wraps everything in
 * FieldWrapper for consistent label/help/error presentation.
 *
 * PERFORMANCE: Wrapped in React.memo — only re-renders when props change.
 * TARGET: field rendering < 50 ms.
 */
import React, { useCallback } from "react";
import { FieldWrapper } from "./FieldWrapper";
import { getFieldComponent } from "./registry";
import {
  ConditionalOperator,
  type ConditionalRule,
  type FieldDefinition,
  type FieldRendererProps,
} from "./types";

// ---------------------------------------------------------------------------
// Conditional evaluation
// ---------------------------------------------------------------------------

/**
 * Evaluate a single ConditionalRule against the current form values.
 * Returns true when the condition is met (field should be visible).
 */
export function evaluateConditional(
  rule: ConditionalRule,
  allValues: Record<string, unknown>,
): boolean {
  const fieldValue = allValues[rule.field];

  switch (rule.operator) {
    case ConditionalOperator.EQUALS:
      return fieldValue === rule.value;

    case ConditionalOperator.NOT_EQUALS:
      return fieldValue !== rule.value;

    case ConditionalOperator.IS_EMPTY:
      return !fieldValue && fieldValue !== 0 && fieldValue !== false;

    case ConditionalOperator.IS_NOT_EMPTY:
      return !!fieldValue || fieldValue === 0 || fieldValue === false;

    case ConditionalOperator.GREATER_THAN: {
      if (typeof fieldValue === "number" && typeof rule.value === "number") {
        return fieldValue > rule.value;
      }
      const gtA = Number(fieldValue);
      const gtB = Number(rule.value);
      return !isNaN(gtA) && !isNaN(gtB) && gtA > gtB;
    }

    case ConditionalOperator.LESS_THAN: {
      if (typeof fieldValue === "number" && typeof rule.value === "number") {
        return fieldValue < rule.value;
      }
      const ltA = Number(fieldValue);
      const ltB = Number(rule.value);
      return !isNaN(ltA) && !isNaN(ltB) && ltA < ltB;
    }

    case ConditionalOperator.CONTAINS:
      if (rule.value === undefined || rule.value === null) return false;
      return String(fieldValue).includes(String(rule.value));

    default:
      return true;
  }
}

// ---------------------------------------------------------------------------
// Built-in validation
// ---------------------------------------------------------------------------

/**
 * Run all validation rules on a value and return a list of error strings.
 * An empty array means the value is valid.
 */
function runValidation(field: FieldDefinition, value: unknown): string[] {
  const errors: string[] = [];
  const { validation, required, label } = field;

  // Required check
  if (required) {
    const isEmpty =
      value === null ||
      value === undefined ||
      value === "" ||
      (Array.isArray(value) && value.length === 0);
    if (isEmpty) {
      errors.push(validation?.message ?? `${label} is required.`);
      // Short-circuit — no further checks needed when value is missing
      return errors;
    }
  }

  if (!validation) return errors;

  const strVal = String(value ?? "");
  const numVal = Number(value);

  if (
    validation.minLength !== undefined &&
    strVal.length < validation.minLength
  ) {
    errors.push(
      validation.message ??
        `${label} must be at least ${validation.minLength} characters.`,
    );
  }

  if (
    validation.maxLength !== undefined &&
    strVal.length > validation.maxLength
  ) {
    errors.push(
      validation.message ??
        `${label} must be no more than ${validation.maxLength} characters.`,
    );
  }

  if (
    validation.min !== undefined &&
    !isNaN(numVal) &&
    numVal < validation.min
  ) {
    errors.push(
      validation.message ?? `${label} must be at least ${validation.min}.`,
    );
  }

  if (
    validation.max !== undefined &&
    !isNaN(numVal) &&
    numVal > validation.max
  ) {
    errors.push(
      validation.message ?? `${label} must be no more than ${validation.max}.`,
    );
  }

  if (validation.pattern !== undefined) {
    try {
      const regex = new RegExp(validation.pattern);
      if (!regex.test(strVal)) {
        errors.push(validation.message ?? `${label} has an invalid format.`);
      }
    } catch {
      // Silently ignore malformed regex patterns
    }
  }

  if (typeof validation.custom === "function") {
    try {
      const customError = validation.custom(value);
      if (customError) {
        errors.push(customError);
      }
    } catch {
      // Silently ignore exceptions thrown by custom validators to prevent component crashes
    }
  }

  return errors;
}

// ---------------------------------------------------------------------------
// FieldRenderer
// ---------------------------------------------------------------------------

/**
 * FieldRenderer
 *
 * Renders a single field by:
 * 1. Evaluating the field's conditional rule — returns null if hidden.
 * 2. Running built-in + custom validation.
 * 3. Resolving the correct component from the registry.
 * 4. Wrapping it in FieldWrapper for label/help/error display.
 *
 * Wrapped in React.memo for performance — only re-renders on prop changes.
 */
export const FieldRenderer: React.FC<FieldRendererProps> = React.memo(
  ({
    field,
    value,
    onChange,
    onBlur,
    disabled = false,
    errors: externalErrors,
    allValues = {},
  }) => {
    // Stable onChange wrapper — declared before any early returns to satisfy Rules of Hooks
    const handleChange = useCallback(
      (newValue: unknown) => onChange(newValue),
      [onChange],
    );

    // 1. Conditional visibility — hide field when rule evaluates false
    if (field.conditional) {
      const visible = evaluateConditional(field.conditional, allValues);
      if (!visible) return null;
    }

    // 2. When errors are externally provided (e.g. from FormGenerator via
    //    useValidation hook), the parent owns validation — skip internal.
    //    When errors is undefined (standalone usage), run built-in validation.
    const validationErrors =
      externalErrors !== undefined ? [] : runValidation(field, value);
    const allErrors = [...validationErrors, ...(externalErrors || [])];

    // 3. Resolve component from registry
    const FieldComponent = getFieldComponent(field.type);

    return (
      <FieldWrapper
        label={field.label}
        help={field.ui?.help}
        required={field.required}
        errors={allErrors}
      >
        <div onBlur={onBlur}>
          <FieldComponent
            field={field}
            value={value}
            onChange={handleChange}
            disabled={disabled}
            errors={allErrors}
            allValues={allValues}
          />
        </div>
      </FieldWrapper>
    );
  },
);

FieldRenderer.displayName = "FieldRenderer";

export default FieldRenderer;
