/**
 * Step 2.1.1 — TypeScript Type Definitions
 * Field Renderer Component Architecture
 */

/**
 * Operators for evaluating conditional visibility rules.
 */
export const ConditionalOperator = {
  EQUALS: "EQUALS",
  NOT_EQUALS: "NOT_EQUALS",
  IS_EMPTY: "IS_EMPTY",
  IS_NOT_EMPTY: "IS_NOT_EMPTY",
  GREATER_THAN: "GREATER_THAN",
  LESS_THAN: "LESS_THAN",
  CONTAINS: "CONTAINS",
} as const;
export type ConditionalOperator =
  (typeof ConditionalOperator)[keyof typeof ConditionalOperator];

/**
 * Supported field types for the dynamic field system.
 */
export const FieldType = {
  TEXT: "TEXT",
  TEXTAREA: "TEXTAREA",
  NUMBER: "NUMBER",
  SELECT: "SELECT",
  TOGGLE: "TOGGLE",
  IMAGE: "IMAGE",
  COLOR: "COLOR",
  LINK: "LINK",
  EMAIL: "EMAIL",
  REPEATER: "REPEATER",
  TOKEN: "TOKEN",
} as const;
export type FieldType = (typeof FieldType)[keyof typeof FieldType];

/**
 * Validation constraints for a field value.
 */
export interface ValidationRules {
  /** Minimum numeric value (for NUMBER fields) */
  min?: number;
  /** Maximum numeric value (for NUMBER fields) */
  max?: number;
  /** Minimum string length (for text fields) */
  minLength?: number;
  /** Maximum string length (for text fields) */
  maxLength?: number;
  /** Regex pattern as a string (validated against field value) */
  pattern?: string;
  /** Custom validation function — returns an error message string or undefined */
  custom?: (value: unknown) => string | undefined;
  /** Override message for all built-in validators */
  message?: string;
}

/**
 * A single conditional visibility rule.
 * The field is shown only when this rule evaluates to true.
 */
export interface ConditionalRule {
  /** Name of the sibling field whose value is checked */
  field: string;
  /** Comparison operator */
  operator: ConditionalOperator;
  /** Target value to compare against (not used for IS_EMPTY / IS_NOT_EMPTY) */
  value?: unknown;
}

/**
 * UI-layer configuration for how a field is rendered.
 */
export interface FieldUIConfig {
  /** Override the registered component type (e.g. 'TextField', 'Select') */
  component?: string;
  /** Extra props forwarded verbatim to the underlying component */
  props?: Record<string, unknown>;
  /** Placeholder text for text-like inputs */
  placeholder?: string;
  /** Short descriptive help text shown below the field label */
  help?: string;
}

/**
 * Full definition of a single dynamic field.
 */
export interface FieldDefinition {
  /** Unique machine name used as the key in form values */
  name: string;
  /** Human-readable label displayed above the field */
  label: string;
  /** Determines which registered component renders this field */
  type: FieldType;
  /** Whether the field must have a non-empty value */
  required?: boolean;
  /** Validation constraints */
  validation?: ValidationRules;
  /** UI-layer overrides */
  ui?: FieldUIConfig;
  /** Conditional visibility rule — field hidden when rule evaluates false */
  conditional?: ConditionalRule;
  /** Default value used when the field has no persisted value */
  defaultValue?: unknown;
  /** Render order within its group (lower = earlier) */
  order?: number;
  /** ID of the FieldGroupDefinition this field belongs to */
  group?: string;
  /** When true, clears this field's value when hidden by conditional logic. Defaults to false (preserve). */
  clearOnHide?: boolean;
}

/**
 * Definition of a logical group of fields.
 */
export interface FieldGroupDefinition {
  /** Unique identifier for this group */
  id: string;
  /** Human-readable group heading */
  label: string;
  /** Sort order among groups (lower = earlier) */
  order?: number;
  /** Ordered list of field names belonging to this group */
  fields: string[];
}

/**
 * Props accepted by FieldRenderer and each individual field component.
 */
export interface FieldRendererProps {
  /** Full field definition */
  field: FieldDefinition;
  /** Current value of the field */
  value: unknown;
  /** Callback invoked with the new value whenever the field changes */
  onChange: (value: unknown) => void;
  /** Callback invoked when the field loses focus (blur event) */
  onBlur?: () => void;
  /** Whether the field is non-interactive */
  disabled?: boolean;
  /** Validation error messages for this field */
  errors?: string[];
  /** All form values — used to evaluate conditional visibility */
  allValues?: Record<string, unknown>;
}
