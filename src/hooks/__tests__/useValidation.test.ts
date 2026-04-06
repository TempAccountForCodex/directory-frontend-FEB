/**
 * Tests for Step 2.7.1 — useValidation Hook
 *
 * Covers:
 * - Per-field validation via validateField
 * - Full form validation via validateForm
 * - Error state management (clearErrors single + all)
 * - Touched field tracking (markFieldTouched)
 * - hasErrors computed property
 * - pattern:string → RegExp conversion with ReDoS guard
 * - Custom validator support
 * - Required field handling (top-level + validation object)
 */
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useValidation } from "../useValidation";

import type { FieldDefinition } from "../../components/DynamicFields/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeField(
  overrides: Partial<FieldDefinition> & { name: string },
): FieldDefinition {
  return {
    label: overrides.name,
    type: "TEXT" as const,
    ...overrides,
  };
}

const FIELDS: FieldDefinition[] = [
  makeField({
    name: "title",
    required: true,
    validation: { minLength: 3, maxLength: 50 },
  }),
  makeField({ name: "email", validation: { pattern: "^[^@]+@[^@]+$" } }),
  makeField({
    name: "age",
    type: "NUMBER" as const,
    validation: { min: 0, max: 150 },
  }),
  makeField({ name: "optional" }),
];

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe("useValidation", () => {
  it("returns empty errors and no touched fields on mount", () => {
    const { result } = renderHook(() => useValidation(FIELDS, {}));

    expect(result.current.errors).toEqual({});
    expect(result.current.touchedFields.size).toBe(0);
    expect(result.current.hasErrors).toBe(false);
  });

  // -------------------------------------------------------------------------
  // validateField — single field
  // -------------------------------------------------------------------------

  describe("validateField", () => {
    it("validates a required field and returns errors", () => {
      const { result } = renderHook(() => useValidation(FIELDS, { title: "" }));

      let fieldErrors: string[];
      act(() => {
        fieldErrors = result.current.validateField("title");
      });

      expect(fieldErrors!).toContain("Required");
      expect(result.current.errors.title).toContain("Required");
      expect(result.current.hasErrors).toBe(true);
    });

    it("validates minLength rule", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { title: "ab" }),
      );

      act(() => {
        result.current.validateField("title");
      });

      expect(result.current.errors.title).toContain("Min 3 characters");
    });

    it("validates maxLength rule", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { title: "a".repeat(51) }),
      );

      act(() => {
        result.current.validateField("title");
      });

      expect(result.current.errors.title).toContain("Max 50 characters");
    });

    it("validates pattern (string → RegExp conversion)", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { email: "not-an-email" }),
      );

      act(() => {
        result.current.validateField("email");
      });

      expect(result.current.errors.email).toContain("Invalid format");
    });

    it("passes pattern validation for a valid value", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { email: "user@example.com" }),
      );

      act(() => {
        result.current.validateField("email");
      });

      expect(result.current.errors.email).toBeUndefined();
    });

    it("validates min/max numeric rules", () => {
      const { result } = renderHook(() => useValidation(FIELDS, { age: -5 }));

      act(() => {
        result.current.validateField("age");
      });

      expect(result.current.errors.age).toContain("Must be at least 0");
    });

    it("validates max numeric rule", () => {
      const { result } = renderHook(() => useValidation(FIELDS, { age: 200 }));

      act(() => {
        result.current.validateField("age");
      });

      expect(result.current.errors.age).toContain("Must be at most 150");
    });

    it("returns empty array for a field with no errors", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { title: "Valid Title" }),
      );

      let fieldErrors: string[];
      act(() => {
        fieldErrors = result.current.validateField("title");
      });

      expect(fieldErrors!).toEqual([]);
      expect(result.current.errors.title).toBeUndefined();
    });

    it("returns empty array for unknown field names", () => {
      const { result } = renderHook(() => useValidation(FIELDS, {}));

      let fieldErrors: string[];
      act(() => {
        fieldErrors = result.current.validateField("nonexistent");
      });

      expect(fieldErrors!).toEqual([]);
    });

    it("clears previous errors when field becomes valid", () => {
      const { result, rerender } = renderHook(
        ({ values }) => useValidation(FIELDS, values),
        { initialProps: { values: { title: "" } as Record<string, unknown> } },
      );

      act(() => {
        result.current.validateField("title");
      });
      expect(result.current.hasErrors).toBe(true);

      // Update values and re-validate
      rerender({ values: { title: "Valid Title" } });

      act(() => {
        result.current.validateField("title");
      });
      expect(result.current.errors.title).toBeUndefined();
      expect(result.current.hasErrors).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // validateForm — all fields
  // -------------------------------------------------------------------------

  describe("validateForm", () => {
    it("validates all fields and returns true when valid", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, {
          title: "Hello World",
          email: "user@example.com",
          age: 25,
          optional: "",
        }),
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid!).toBe(true);
      expect(result.current.hasErrors).toBe(false);
      expect(result.current.errors).toEqual({});
    });

    it("validates all fields and returns false when invalid", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { title: "", email: "bad", age: -1 }),
      );

      let isValid: boolean;
      act(() => {
        isValid = result.current.validateForm();
      });

      expect(isValid!).toBe(false);
      expect(result.current.hasErrors).toBe(true);
      expect(result.current.errors.title).toBeDefined();
      expect(result.current.errors.email).toBeDefined();
      expect(result.current.errors.age).toBeDefined();
    });

    it("marks all fields as touched after validateForm", () => {
      const { result } = renderHook(() => useValidation(FIELDS, {}));

      act(() => {
        result.current.validateForm();
      });

      expect(result.current.touchedFields.size).toBe(FIELDS.length);
      for (const field of FIELDS) {
        expect(result.current.touchedFields.has(field.name)).toBe(true);
      }
    });
  });

  // -------------------------------------------------------------------------
  // clearErrors
  // -------------------------------------------------------------------------

  describe("clearErrors", () => {
    it("clears errors for a single field", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { title: "", email: "bad" }),
      );

      act(() => {
        result.current.validateForm();
      });
      expect(result.current.errors.title).toBeDefined();
      expect(result.current.errors.email).toBeDefined();

      act(() => {
        result.current.clearErrors("title");
      });

      expect(result.current.errors.title).toBeUndefined();
      expect(result.current.errors.email).toBeDefined();
    });

    it("clears all errors when called without arguments", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { title: "", email: "bad" }),
      );

      act(() => {
        result.current.validateForm();
      });
      expect(result.current.hasErrors).toBe(true);

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.errors).toEqual({});
      expect(result.current.hasErrors).toBe(false);
    });

    it("is a no-op when clearing a field with no errors", () => {
      const { result } = renderHook(() => useValidation(FIELDS, {}));

      act(() => {
        result.current.clearErrors("title");
      });

      expect(result.current.errors).toEqual({});
    });
  });

  // -------------------------------------------------------------------------
  // markFieldTouched / touchedFields
  // -------------------------------------------------------------------------

  describe("markFieldTouched", () => {
    it("adds a field name to touchedFields", () => {
      const { result } = renderHook(() => useValidation(FIELDS, {}));

      act(() => {
        result.current.markFieldTouched("title");
      });

      expect(result.current.touchedFields.has("title")).toBe(true);
      expect(result.current.touchedFields.size).toBe(1);
    });

    it("handles multiple touches without duplicates", () => {
      const { result } = renderHook(() => useValidation(FIELDS, {}));

      act(() => {
        result.current.markFieldTouched("title");
        result.current.markFieldTouched("title");
        result.current.markFieldTouched("email");
      });

      expect(result.current.touchedFields.size).toBe(2);
    });

    it("preserves touched state across re-renders", () => {
      const { result, rerender } = renderHook(
        ({ values }) => useValidation(FIELDS, values),
        { initialProps: { values: { title: "a" } as Record<string, unknown> } },
      );

      act(() => {
        result.current.markFieldTouched("title");
      });

      rerender({ values: { title: "ab" } });

      expect(result.current.touchedFields.has("title")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // hasErrors
  // -------------------------------------------------------------------------

  describe("hasErrors", () => {
    it("is false when there are no errors", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { title: "Valid" }),
      );
      expect(result.current.hasErrors).toBe(false);
    });

    it("is true when there are errors", () => {
      const { result } = renderHook(() => useValidation(FIELDS, { title: "" }));

      act(() => {
        result.current.validateField("title");
      });

      expect(result.current.hasErrors).toBe(true);
    });

    it("becomes false after clearing all errors", () => {
      const { result } = renderHook(() => useValidation(FIELDS, { title: "" }));

      act(() => {
        result.current.validateField("title");
      });
      expect(result.current.hasErrors).toBe(true);

      act(() => {
        result.current.clearErrors();
      });
      expect(result.current.hasErrors).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Pattern string → RegExp conversion edge cases
  // -------------------------------------------------------------------------

  describe("pattern conversion", () => {
    it("converts a valid pattern string to RegExp", () => {
      const fields = [
        makeField({ name: "zip", validation: { pattern: "^\\d{5}$" } }),
      ];
      const { result } = renderHook(() =>
        useValidation(fields, { zip: "12345" }),
      );

      act(() => {
        result.current.validateField("zip");
      });

      expect(result.current.errors.zip).toBeUndefined();
    });

    it("rejects values that do not match the pattern", () => {
      const fields = [
        makeField({ name: "zip", validation: { pattern: "^\\d{5}$" } }),
      ];
      const { result } = renderHook(() =>
        useValidation(fields, { zip: "abcde" }),
      );

      act(() => {
        result.current.validateField("zip");
      });

      expect(result.current.errors.zip).toContain("Invalid format");
    });

    it("silently ignores malformed pattern strings", () => {
      const fields = [
        makeField({ name: "test", validation: { pattern: "[invalid" } }),
      ];
      const { result } = renderHook(() =>
        useValidation(fields, { test: "value" }),
      );

      act(() => {
        result.current.validateField("test");
      });

      // Should not throw and should have no pattern errors
      expect(result.current.errors.test).toBeUndefined();
    });

    it("rejects patterns exceeding MAX_PATTERN_LENGTH (ReDoS guard)", () => {
      const longPattern = "a".repeat(501);
      const fields = [
        makeField({ name: "test", validation: { pattern: longPattern } }),
      ];
      const { result } = renderHook(() =>
        useValidation(fields, { test: "value" }),
      );

      act(() => {
        result.current.validateField("test");
      });

      // Long pattern silently discarded — no pattern error
      expect(result.current.errors.test).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Custom validator
  // -------------------------------------------------------------------------

  describe("custom validator", () => {
    it("runs custom validation function", () => {
      const fields = [
        makeField({
          name: "password",
          validation: {
            custom: (v: unknown) =>
              typeof v === "string" && v.length < 8 ? "Too short" : undefined,
          },
        }),
      ];

      const { result } = renderHook(() =>
        useValidation(fields, { password: "short" }),
      );

      act(() => {
        result.current.validateField("password");
      });

      expect(result.current.errors.password).toContain("Too short");
    });

    it("passes custom validation when returning undefined", () => {
      const fields = [
        makeField({
          name: "password",
          validation: {
            custom: (v: unknown) =>
              typeof v === "string" && v.length < 8 ? "Too short" : undefined,
          },
        }),
      ];

      const { result } = renderHook(() =>
        useValidation(fields, { password: "long-enough-password" }),
      );

      act(() => {
        result.current.validateField("password");
      });

      expect(result.current.errors.password).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Fields without validation
  // -------------------------------------------------------------------------

  describe("fields without validation rules", () => {
    it("optional fields with no validation always pass", () => {
      const { result } = renderHook(() =>
        useValidation(FIELDS, { optional: "" }),
      );

      act(() => {
        result.current.validateField("optional");
      });

      expect(result.current.errors.optional).toBeUndefined();
    });
  });

  // -------------------------------------------------------------------------
  // Dynamic field list changes
  // -------------------------------------------------------------------------

  describe("dynamic fields", () => {
    it("validateForm only validates current fields after field list changes", () => {
      const { result, rerender } = renderHook(
        ({ fields, values }) => useValidation(fields, values),
        {
          initialProps: {
            fields: FIELDS,
            values: { title: "" } as Record<string, unknown>,
          },
        },
      );

      act(() => {
        result.current.validateForm();
      });
      expect(result.current.errors.title).toBeDefined();

      // Remove 'title' from fields and re-validate all
      const newFields = FIELDS.filter((f) => f.name !== "title");
      rerender({ fields: newFields, values: { title: "" } });

      act(() => {
        result.current.validateForm();
      });
      // title is no longer in fields, so validateForm should not produce errors for it
      expect(result.current.errors.title).toBeUndefined();
    });

    it("validateField returns empty for unknown field names", () => {
      const { result, rerender } = renderHook(
        ({ fields, values }) => useValidation(fields, values),
        {
          initialProps: {
            fields: FIELDS,
            values: { title: "" } as Record<string, unknown>,
          },
        },
      );

      // Remove 'title' from fields
      const newFields = FIELDS.filter((f) => f.name !== "title");
      rerender({ fields: newFields, values: { title: "" } });

      let fieldErrors: string[];
      act(() => {
        fieldErrors = result.current.validateField("title");
      });
      expect(fieldErrors!).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // Callback stability
  // -------------------------------------------------------------------------

  describe("callback stability", () => {
    it("returns stable callback references across re-renders", () => {
      const { result, rerender } = renderHook(
        ({ values }) => useValidation(FIELDS, values),
        { initialProps: { values: { title: "a" } as Record<string, unknown> } },
      );

      const firstValidateField = result.current.validateField;
      const firstValidateForm = result.current.validateForm;
      const firstClearErrors = result.current.clearErrors;
      const firstMarkTouched = result.current.markFieldTouched;

      rerender({ values: { title: "ab" } });

      expect(result.current.validateField).toBe(firstValidateField);
      expect(result.current.validateForm).toBe(firstValidateForm);
      expect(result.current.clearErrors).toBe(firstClearErrors);
      expect(result.current.markFieldTouched).toBe(firstMarkTouched);
    });
  });
});
