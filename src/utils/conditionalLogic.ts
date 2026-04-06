/**
 * Conditional Logic Utilities
 *
 * Pure TypeScript utility — no React imports.
 * Evaluates conditional visibility rules for dynamic form fields.
 * Uses FLAT field paths: values['backgroundType'] NOT values['background']['backgroundType'].
 */

export interface ConditionalRule {
  field: string;
  operator:
    | "equals"
    | "notEquals"
    | "isEmpty"
    | "isNotEmpty"
    | "contains"
    | "greaterThan"
    | "lessThan";
  value?: any;
}

export interface FieldDefinition {
  name: string;
  type: string;
  label: string;
  conditional?: ConditionalRule;
  validation?: any;
  ui?: any;
  order?: number;
  /** When true, clears this field's value when hidden by conditional logic. Defaults to false (preserve). */
  clearOnHide?: boolean;
}

/**
 * Determines whether a field should be shown based on its conditional rule.
 *
 * @param field - The field definition (may include a conditional rule)
 * @param values - Flat map of current form values keyed by field name
 * @returns true if the field should be rendered/visible, false otherwise
 *
 * Rules:
 * - No conditional → always show (returns true)
 * - Unknown operator → safe default, show (returns true)
 * - FLAT paths only: values[field.conditional.field]
 */
export const shouldShowField = (
  field: FieldDefinition,
  values: Record<string, any>,
): boolean => {
  if (!field.conditional) {
    return true;
  }

  const { field: targetField, operator, value: expected } = field.conditional;
  // Flat lookup — do NOT attempt nested access
  const target = values[targetField];

  switch (operator) {
    case "equals":
      return target === expected;

    case "notEquals":
      return target !== expected;

    case "isEmpty":
      return target == null || target === "";

    case "isNotEmpty":
      return target != null && target !== "";

    case "contains":
      if (Array.isArray(target)) {
        return target.includes(expected);
      }
      return String(target ?? "").includes(String(expected ?? ""));

    case "greaterThan":
      return typeof target === "number" && target > (expected as number);

    case "lessThan":
      return typeof target === "number" && target < (expected as number);

    default:
      // Unknown operator: safe default — never hide a field unexpectedly
      return true;
  }
};
