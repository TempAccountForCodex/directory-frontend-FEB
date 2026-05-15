/**
 * Validation Utilities
 *
 * Pure TypeScript utility — no React imports, no hooks.
 * Used by the Dynamic Form Generator (step 2.5) and Form Validation Engine (step 2.6).
 */

export interface ValidationRules {
  /** Field is required — rejects null, undefined, and empty string */
  required?: boolean;
  /** Minimum string length (inclusive) */
  minLength?: number;
  /** Maximum string length (inclusive) */
  maxLength?: number;
  /** Minimum numeric value (inclusive) */
  min?: number;
  /** Maximum numeric value (inclusive) */
  max?: number;
  /** RegExp the string value must match */
  pattern?: RegExp;
  /** Validates basic email format */
  email?: boolean;
  /** Validates URL using the WHATWG URL constructor */
  url?: boolean;
  /** Custom validator — return an error string or null */
  custom?: (value: unknown) => string | null;
}

/**
 * Validate a single field value against a set of rules.
 *
 * @param value  - The current field value (any type)
 * @param rules  - The validation rules to apply
 * @returns      An array of human-readable error messages.
 *               Returns an empty array when the value passes all rules.
 */
export function validateField(
  value: unknown,
  rules: ValidationRules,
): string[] {
  const errors: string[] = [];

  // required
  if (rules.required && (value == null || value === "")) {
    errors.push("Required");
  }

  // minLength — applies to strings (and array-like values with .length)
  if (
    rules.minLength != null &&
    (value as { length?: number } | null)?.length !== undefined &&
    (value as { length: number }).length < rules.minLength
  ) {
    errors.push(`Min ${rules.minLength} characters`);
  }

  // maxLength — applies to strings (and array-like values with .length)
  if (
    rules.maxLength != null &&
    (value as { length?: number } | null)?.length !== undefined &&
    (value as { length: number }).length > rules.maxLength
  ) {
    errors.push(`Max ${rules.maxLength} characters`);
  }

  // min — numeric comparison
  if (rules.min != null && typeof value === "number" && value < rules.min) {
    errors.push(`Must be at least ${rules.min}`);
  }

  // max — numeric comparison
  if (rules.max != null && typeof value === "number" && value > rules.max) {
    errors.push(`Must be at most ${rules.max}`);
  }

  // pattern — RegExp test against string representation
  if (rules.pattern && !rules.pattern.test(String(value ?? ""))) {
    errors.push("Invalid format");
  }

  // email — simple RFC-5322 subset check
  if (rules.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value ?? ""))) {
    errors.push("Invalid email address");
  }

  // url — WHATWG URL constructor
  if (rules.url) {
    try {
      new URL(String(value ?? ""));
    } catch {
      errors.push("Invalid URL");
    }
  }

  // custom — caller-supplied validator
  if (rules.custom) {
    const err = rules.custom(value);
    if (err) {
      errors.push(err);
    }
  }

  return errors;
}
