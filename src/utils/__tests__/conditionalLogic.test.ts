import { describe, it, expect } from "vitest";
import { shouldShowField } from "../conditionalLogic";
import type { FieldDefinition } from "../conditionalLogic";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const makeField = (
  conditional?: FieldDefinition["conditional"],
): FieldDefinition => ({
  name: "testField",
  type: "text",
  label: "Test Field",
  conditional,
});

// ─── No conditional rule ──────────────────────────────────────────────────────

describe("shouldShowField — no conditional", () => {
  it("returns true when conditional is undefined", () => {
    expect(shouldShowField(makeField(), {})).toBe(true);
  });

  it("returns true when conditional is explicitly null-like (undefined)", () => {
    const field = makeField(undefined);
    expect(shouldShowField(field, { foo: "bar" })).toBe(true);
  });
});

// ─── equals ───────────────────────────────────────────────────────────────────

describe("shouldShowField — equals", () => {
  it("returns true when values[field] === expected", () => {
    const field = makeField({
      field: "theme",
      operator: "equals",
      value: "dark",
    });
    expect(shouldShowField(field, { theme: "dark" })).toBe(true);
  });

  it("returns false when values[field] !== expected", () => {
    const field = makeField({
      field: "theme",
      operator: "equals",
      value: "dark",
    });
    expect(shouldShowField(field, { theme: "light" })).toBe(false);
  });
});

// ─── notEquals ────────────────────────────────────────────────────────────────

describe("shouldShowField — notEquals", () => {
  it("returns true when values[field] !== expected", () => {
    const field = makeField({
      field: "plan",
      operator: "notEquals",
      value: "free",
    });
    expect(shouldShowField(field, { plan: "pro" })).toBe(true);
  });

  it("returns false when values[field] === expected", () => {
    const field = makeField({
      field: "plan",
      operator: "notEquals",
      value: "free",
    });
    expect(shouldShowField(field, { plan: "free" })).toBe(false);
  });
});

// ─── isEmpty ──────────────────────────────────────────────────────────────────

describe("shouldShowField — isEmpty", () => {
  it("returns true when value is null", () => {
    const field = makeField({ field: "bio", operator: "isEmpty" });
    expect(shouldShowField(field, { bio: null })).toBe(true);
  });

  it("returns true when value is undefined (key absent)", () => {
    const field = makeField({ field: "bio", operator: "isEmpty" });
    expect(shouldShowField(field, {})).toBe(true);
  });

  it("returns true when value is empty string", () => {
    const field = makeField({ field: "bio", operator: "isEmpty" });
    expect(shouldShowField(field, { bio: "" })).toBe(true);
  });

  it("returns false when value is a non-empty string", () => {
    const field = makeField({ field: "bio", operator: "isEmpty" });
    expect(shouldShowField(field, { bio: "hello" })).toBe(false);
  });
});

// ─── isNotEmpty ───────────────────────────────────────────────────────────────

describe("shouldShowField — isNotEmpty", () => {
  it("returns true when value is a non-empty string", () => {
    const field = makeField({ field: "website", operator: "isNotEmpty" });
    expect(shouldShowField(field, { website: "https://example.com" })).toBe(
      true,
    );
  });

  it("returns false when value is null", () => {
    const field = makeField({ field: "website", operator: "isNotEmpty" });
    expect(shouldShowField(field, { website: null })).toBe(false);
  });

  it("returns false when value is empty string", () => {
    const field = makeField({ field: "website", operator: "isNotEmpty" });
    expect(shouldShowField(field, { website: "" })).toBe(false);
  });

  it("returns false when key is absent (undefined)", () => {
    const field = makeField({ field: "website", operator: "isNotEmpty" });
    expect(shouldShowField(field, {})).toBe(false);
  });
});

// ─── contains ─────────────────────────────────────────────────────────────────

describe("shouldShowField — contains", () => {
  it("returns true when array target includes expected value", () => {
    const field = makeField({
      field: "tags",
      operator: "contains",
      value: "tech",
    });
    expect(shouldShowField(field, { tags: ["tech", "startup"] })).toBe(true);
  });

  it("returns false when array target does not include expected value", () => {
    const field = makeField({
      field: "tags",
      operator: "contains",
      value: "finance",
    });
    expect(shouldShowField(field, { tags: ["tech", "startup"] })).toBe(false);
  });

  it("returns true when string target includes expected substring", () => {
    const field = makeField({
      field: "description",
      operator: "contains",
      value: "hello",
    });
    expect(shouldShowField(field, { description: "say hello world" })).toBe(
      true,
    );
  });

  it("returns false when string target does not include expected substring", () => {
    const field = makeField({
      field: "description",
      operator: "contains",
      value: "goodbye",
    });
    expect(shouldShowField(field, { description: "say hello world" })).toBe(
      false,
    );
  });

  it("handles undefined target gracefully (no crash)", () => {
    const field = makeField({
      field: "missing",
      operator: "contains",
      value: "x",
    });
    // undefined target coerces to '' which does not include 'x'
    expect(shouldShowField(field, {})).toBe(false);
  });
});

// ─── greaterThan ──────────────────────────────────────────────────────────────

describe("shouldShowField — greaterThan", () => {
  it("returns true when numeric target > expected", () => {
    const field = makeField({
      field: "age",
      operator: "greaterThan",
      value: 18,
    });
    expect(shouldShowField(field, { age: 25 })).toBe(true);
  });

  it("returns false when numeric target equals expected", () => {
    const field = makeField({
      field: "age",
      operator: "greaterThan",
      value: 18,
    });
    expect(shouldShowField(field, { age: 18 })).toBe(false);
  });

  it("returns false when numeric target < expected", () => {
    const field = makeField({
      field: "age",
      operator: "greaterThan",
      value: 18,
    });
    expect(shouldShowField(field, { age: 10 })).toBe(false);
  });

  it("returns false when target is not a number", () => {
    const field = makeField({
      field: "age",
      operator: "greaterThan",
      value: 18,
    });
    expect(shouldShowField(field, { age: "25" })).toBe(false);
  });

  it("returns false when target is undefined", () => {
    const field = makeField({
      field: "age",
      operator: "greaterThan",
      value: 18,
    });
    expect(shouldShowField(field, {})).toBe(false);
  });
});

// ─── lessThan ─────────────────────────────────────────────────────────────────

describe("shouldShowField — lessThan", () => {
  it("returns true when numeric target < expected", () => {
    const field = makeField({
      field: "score",
      operator: "lessThan",
      value: 50,
    });
    expect(shouldShowField(field, { score: 30 })).toBe(true);
  });

  it("returns false when numeric target equals expected", () => {
    const field = makeField({
      field: "score",
      operator: "lessThan",
      value: 50,
    });
    expect(shouldShowField(field, { score: 50 })).toBe(false);
  });

  it("returns false when numeric target > expected", () => {
    const field = makeField({
      field: "score",
      operator: "lessThan",
      value: 50,
    });
    expect(shouldShowField(field, { score: 75 })).toBe(false);
  });

  it("returns false when target is not a number", () => {
    const field = makeField({
      field: "score",
      operator: "lessThan",
      value: 50,
    });
    expect(shouldShowField(field, { score: "30" })).toBe(false);
  });

  it("returns false when target is undefined", () => {
    const field = makeField({
      field: "score",
      operator: "lessThan",
      value: 50,
    });
    expect(shouldShowField(field, {})).toBe(false);
  });
});

// ─── Unknown operator ─────────────────────────────────────────────────────────

describe("shouldShowField — unknown operator", () => {
  it("returns true for an unknown operator (safe default)", () => {
    const field = makeField({
      field: "status",
      operator: "unknownOp" as any,
      value: "active",
    });
    expect(shouldShowField(field, { status: "inactive" })).toBe(true);
  });
});

// ─── Flat path validation ─────────────────────────────────────────────────────

describe("shouldShowField — flat path access", () => {
  it('accesses values["backgroundType"] not values["background"]["backgroundType"]', () => {
    const field = makeField({
      field: "backgroundType",
      operator: "equals",
      value: "image",
    });
    // Correct flat key
    expect(shouldShowField(field, { backgroundType: "image" })).toBe(true);
    // Nested key (wrong shape) should return false — target would be undefined
    expect(
      shouldShowField(field, { background: { backgroundType: "image" } }),
    ).toBe(false);
  });
});

// ─── Undefined target — no crash ─────────────────────────────────────────────

describe("shouldShowField — undefined target graceful handling", () => {
  it("does not throw when the referenced field key is absent from values", () => {
    const operators: FieldDefinition["conditional"][] = [
      { field: "missing", operator: "equals", value: "x" },
      { field: "missing", operator: "notEquals", value: "x" },
      { field: "missing", operator: "isEmpty" },
      { field: "missing", operator: "isNotEmpty" },
      { field: "missing", operator: "contains", value: "x" },
      { field: "missing", operator: "greaterThan", value: 5 },
      { field: "missing", operator: "lessThan", value: 5 },
    ];
    operators.forEach((conditional) => {
      expect(() => shouldShowField(makeField(conditional), {})).not.toThrow();
    });
  });
});
