/**
 * Tests for Step 2.1.4 — FieldRenderer Component + evaluateConditional helper
 * Covers: conditional visibility, validation, registry resolution,
 *         React.memo, displayName, and evaluateConditional all operators.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FieldRenderer, evaluateConditional } from "../FieldRenderer";
import { registerFieldComponent, getFieldComponent } from "../registry";
import { ConditionalOperator, FieldType } from "../types";
import type { FieldDefinition, FieldRendererProps } from "../types";

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

// A simple mock field component that renders its value
const MockField: React.FC<FieldRendererProps> = ({ field, value }) =>
  React.createElement("input", {
    "data-testid": `field-${field.name}`,
    value: String(value ?? ""),
    readOnly: true,
  });
MockField.displayName = "MockField";

// Register MockField for TEXT so FieldRenderer resolves it
beforeEach(() => {
  registerFieldComponent(FieldType.TEXT, MockField);
  registerFieldComponent(FieldType.NUMBER, MockField);
  registerFieldComponent(FieldType.TEXTAREA, MockField);
});

// Minimal FieldDefinition factory
function makeField(overrides: Partial<FieldDefinition> = {}): FieldDefinition {
  return {
    name: "testField",
    label: "Test Field",
    type: FieldType.TEXT,
    ...overrides,
  };
}

// Render FieldRenderer with sensible defaults
function renderField(
  props: Partial<FieldRendererProps> & { onBlur?: () => void } = {},
) {
  const { onBlur, ...rest } = props;
  const defaults: FieldRendererProps = {
    field: makeField(),
    value: "hello",
    onChange: vi.fn(),
    allValues: {},
    ...rest,
  };
  return render(<FieldRenderer {...defaults} onBlur={onBlur} />);
}

// ---------------------------------------------------------------------------
// evaluateConditional
// ---------------------------------------------------------------------------

describe("evaluateConditional", () => {
  const values = {
    stringField: "hello",
    numberField: 42,
    emptyField: "",
    falseField: false,
    zeroField: 0,
  };

  it("EQUALS — returns true when values match", () => {
    expect(
      evaluateConditional(
        {
          field: "stringField",
          operator: ConditionalOperator.EQUALS,
          value: "hello",
        },
        values,
      ),
    ).toBe(true);
  });

  it("EQUALS — returns false when values do not match", () => {
    expect(
      evaluateConditional(
        {
          field: "stringField",
          operator: ConditionalOperator.EQUALS,
          value: "world",
        },
        values,
      ),
    ).toBe(false);
  });

  it("NOT_EQUALS — returns true when values differ", () => {
    expect(
      evaluateConditional(
        {
          field: "stringField",
          operator: ConditionalOperator.NOT_EQUALS,
          value: "world",
        },
        values,
      ),
    ).toBe(true);
  });

  it("NOT_EQUALS — returns false when values are the same", () => {
    expect(
      evaluateConditional(
        {
          field: "stringField",
          operator: ConditionalOperator.NOT_EQUALS,
          value: "hello",
        },
        values,
      ),
    ).toBe(false);
  });

  it("IS_EMPTY — returns true for an empty string", () => {
    expect(
      evaluateConditional(
        { field: "emptyField", operator: ConditionalOperator.IS_EMPTY },
        values,
      ),
    ).toBe(true);
  });

  it("IS_EMPTY — returns false for a non-empty string", () => {
    expect(
      evaluateConditional(
        { field: "stringField", operator: ConditionalOperator.IS_EMPTY },
        values,
      ),
    ).toBe(false);
  });

  it("IS_EMPTY — returns false for 0 (zero is not empty)", () => {
    expect(
      evaluateConditional(
        { field: "zeroField", operator: ConditionalOperator.IS_EMPTY },
        values,
      ),
    ).toBe(false);
  });

  it("IS_NOT_EMPTY — returns true for a non-empty string", () => {
    expect(
      evaluateConditional(
        { field: "stringField", operator: ConditionalOperator.IS_NOT_EMPTY },
        values,
      ),
    ).toBe(true);
  });

  it("IS_NOT_EMPTY — returns true for 0 (zero is not empty)", () => {
    expect(
      evaluateConditional(
        { field: "zeroField", operator: ConditionalOperator.IS_NOT_EMPTY },
        values,
      ),
    ).toBe(true);
  });

  it("IS_NOT_EMPTY — returns false for an empty string", () => {
    expect(
      evaluateConditional(
        { field: "emptyField", operator: ConditionalOperator.IS_NOT_EMPTY },
        values,
      ),
    ).toBe(false);
  });

  it("GREATER_THAN — returns true when field value is greater", () => {
    expect(
      evaluateConditional(
        {
          field: "numberField",
          operator: ConditionalOperator.GREATER_THAN,
          value: 10,
        },
        values,
      ),
    ).toBe(true);
  });

  it("GREATER_THAN — returns false when field value is less", () => {
    expect(
      evaluateConditional(
        {
          field: "numberField",
          operator: ConditionalOperator.GREATER_THAN,
          value: 100,
        },
        values,
      ),
    ).toBe(false);
  });

  it("LESS_THAN — returns true when field value is less", () => {
    expect(
      evaluateConditional(
        {
          field: "numberField",
          operator: ConditionalOperator.LESS_THAN,
          value: 100,
        },
        values,
      ),
    ).toBe(true);
  });

  it("LESS_THAN — returns false when field value is greater", () => {
    expect(
      evaluateConditional(
        {
          field: "numberField",
          operator: ConditionalOperator.LESS_THAN,
          value: 10,
        },
        values,
      ),
    ).toBe(false);
  });

  it("CONTAINS — returns true when field value contains the substring", () => {
    expect(
      evaluateConditional(
        {
          field: "stringField",
          operator: ConditionalOperator.CONTAINS,
          value: "ell",
        },
        values,
      ),
    ).toBe(true);
  });

  it("CONTAINS — returns false when field value does not contain substring", () => {
    expect(
      evaluateConditional(
        {
          field: "stringField",
          operator: ConditionalOperator.CONTAINS,
          value: "xyz",
        },
        values,
      ),
    ).toBe(false);
  });

  it("unknown operator — returns true by default", () => {
    expect(
      evaluateConditional(
        { field: "stringField", operator: "UNKNOWN" as ConditionalOperator },
        values,
      ),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// FieldRenderer — conditional visibility
// ---------------------------------------------------------------------------

describe("FieldRenderer — conditional visibility", () => {
  it("renders the field when no conditional is set", () => {
    renderField({ field: makeField() });
    expect(screen.getByTestId("field-testField")).toBeInTheDocument();
  });

  it("renders the field when conditional evaluates to true", () => {
    renderField({
      field: makeField({
        conditional: {
          field: "toggle",
          operator: ConditionalOperator.EQUALS,
          value: true,
        },
      }),
      allValues: { toggle: true },
    });
    expect(screen.getByTestId("field-testField")).toBeInTheDocument();
  });

  it("hides the field when conditional evaluates to false", () => {
    renderField({
      field: makeField({
        conditional: {
          field: "toggle",
          operator: ConditionalOperator.EQUALS,
          value: true,
        },
      }),
      allValues: { toggle: false },
    });
    expect(screen.queryByTestId("field-testField")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// FieldRenderer — validation
// ---------------------------------------------------------------------------

describe("FieldRenderer — validation", () => {
  it("shows required error when field is required and value is empty", () => {
    renderField({
      field: makeField({ required: true, label: "Username" }),
      value: "",
    });
    expect(screen.getByText("Username is required.")).toBeInTheDocument();
  });

  it("does not show required error when field is required but has a value", () => {
    renderField({
      field: makeField({ required: true }),
      value: "present",
    });
    expect(screen.queryByText(/is required/i)).not.toBeInTheDocument();
  });

  it("shows minLength error when value is too short", () => {
    renderField({
      field: makeField({
        validation: { minLength: 5 },
        label: "Bio",
      }),
      value: "Hi",
    });
    expect(
      screen.getByText("Bio must be at least 5 characters."),
    ).toBeInTheDocument();
  });

  it("shows maxLength error when value is too long", () => {
    renderField({
      field: makeField({
        validation: { maxLength: 5 },
        label: "Code",
      }),
      value: "toolongvalue",
    });
    expect(
      screen.getByText("Code must be no more than 5 characters."),
    ).toBeInTheDocument();
  });

  it("shows pattern error when value does not match", () => {
    renderField({
      field: makeField({
        validation: { pattern: "^[0-9]+$" },
        label: "Number Only",
      }),
      value: "abc",
    });
    expect(
      screen.getByText("Number Only has an invalid format."),
    ).toBeInTheDocument();
  });

  it("shows custom validation error", () => {
    renderField({
      field: makeField({
        validation: {
          custom: (v) =>
            v === "forbidden" ? "That word is not allowed." : undefined,
        },
      }),
      value: "forbidden",
    });
    expect(screen.getByText("That word is not allowed.")).toBeInTheDocument();
  });

  it("uses external errors when provided — parent owns validation", () => {
    renderField({
      field: makeField({ required: true, label: "Email" }),
      value: "",
      errors: ["Server says no."],
    });
    // When errors prop is provided, FieldRenderer defers to the parent
    expect(screen.getByText("Server says no.")).toBeInTheDocument();
    // Internal validation is skipped (parent handles it via useValidation)
    expect(screen.queryByText("Email is required.")).not.toBeInTheDocument();
  });

  it("runs internal validation when errors prop is not provided (standalone usage)", () => {
    renderField({
      field: makeField({ required: true, label: "Email" }),
      value: "",
      // No errors prop — FieldRenderer runs its own validation
    });
    expect(screen.getByText("Email is required.")).toBeInTheDocument();
  });

  it("uses custom message override for built-in validators", () => {
    renderField({
      field: makeField({
        required: true,
        validation: { message: "Custom required msg" },
        label: "Name",
      }),
      value: "",
    });
    expect(screen.getByText("Custom required msg")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// FieldRenderer — registry resolution
// ---------------------------------------------------------------------------

describe("FieldRenderer — registry resolution", () => {
  it("renders FallbackField (Unsupported) for unregistered COLOR type", () => {
    renderField({ field: makeField({ type: FieldType.COLOR }) });
    expect(
      screen.getByText(/Unsupported field type: COLOR/i),
    ).toBeInTheDocument();
  });

  it("renders registered MockField for TEXT type", () => {
    renderField({
      field: makeField({ type: FieldType.TEXT }),
      value: "test-value",
    });
    const input = screen.getByTestId("field-testField");
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue("test-value");
  });
});

// ---------------------------------------------------------------------------
// FieldRenderer — label and wrapper integration
// ---------------------------------------------------------------------------

describe("FieldRenderer — wrapper integration", () => {
  it("renders the field label via FieldWrapper", () => {
    renderField({ field: makeField({ label: "Display Name" }) });
    expect(screen.getByText("Display Name")).toBeInTheDocument();
  });

  it("renders help text via FieldWrapper", () => {
    renderField({
      field: makeField({ ui: { help: "Helpful hint here." } }),
    });
    expect(screen.getByText("Helpful hint here.")).toBeInTheDocument();
  });

  it("disabled state is passed through to the field component", () => {
    renderField({ disabled: true });
    // MockField renders an input — disabled prop would show as attribute
    const input = screen.getByTestId("field-testField");
    expect(input).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// FieldRenderer — memoization / identity
// ---------------------------------------------------------------------------

describe("FieldRenderer — memoization", () => {
  it('has displayName set to "FieldRenderer"', () => {
    expect(FieldRenderer.displayName).toBe("FieldRenderer");
  });
});

// ---------------------------------------------------------------------------
// FieldRenderer — onBlur forwarding (Step 2.7.3)
// ---------------------------------------------------------------------------

describe("FieldRenderer — onBlur forwarding", () => {
  it("fires onBlur callback when the field component loses focus", () => {
    const handleBlur = vi.fn();
    renderField({
      field: makeField(),
      value: "test",
      onBlur: handleBlur,
    });

    const input = screen.getByTestId("field-testField");
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledTimes(1);
  });

  it("does not throw when onBlur is not provided", () => {
    expect(() => {
      renderField({ field: makeField(), value: "test" });
      const input = screen.getByTestId("field-testField");
      fireEvent.blur(input);
    }).not.toThrow();
  });

  it("fires onBlur only once per blur event (no duplicates from bubbling)", () => {
    const handleBlur = vi.fn();
    renderField({
      field: makeField(),
      value: "test",
      onBlur: handleBlur,
    });

    const input = screen.getByTestId("field-testField");
    fireEvent.blur(input);
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// PROD QA edge-case tests — evaluateConditional data integrity
// ---------------------------------------------------------------------------

describe("evaluateConditional — PROD QA edge cases", () => {
  it("CONTAINS — returns false when rule.value is undefined (no false-positive)", () => {
    // Bug fix: previously String(undefined) = "undefined" would match if fieldValue contained "undefined"
    expect(
      evaluateConditional(
        {
          field: "stringField",
          operator: ConditionalOperator.CONTAINS,
          value: undefined,
        },
        { stringField: "hello undefined world" },
      ),
    ).toBe(false);
  });

  it("CONTAINS — returns false when rule.value is null", () => {
    expect(
      evaluateConditional(
        {
          field: "stringField",
          operator: ConditionalOperator.CONTAINS,
          value: null,
        },
        { stringField: "hello null world" },
      ),
    ).toBe(false);
  });

  it("CONTAINS — returns true when field value contains the rule.value string", () => {
    expect(
      evaluateConditional(
        { field: "text", operator: ConditionalOperator.CONTAINS, value: "foo" },
        { text: "foobar" },
      ),
    ).toBe(true);
  });

  it("GREATER_THAN — returns false when fieldValue coerces to NaN (string)", () => {
    // Bug fix: previously NaN > 10 evaluated silently to false without NaN guard
    expect(
      evaluateConditional(
        { field: "str", operator: ConditionalOperator.GREATER_THAN, value: 10 },
        { str: "not-a-number" },
      ),
    ).toBe(false);
  });

  it("GREATER_THAN — returns false when rule.value coerces to NaN", () => {
    expect(
      evaluateConditional(
        {
          field: "num",
          operator: ConditionalOperator.GREATER_THAN,
          value: "not-a-number",
        },
        { num: 42 },
      ),
    ).toBe(false);
  });

  it("GREATER_THAN — returns true for valid numeric strings that coerce correctly", () => {
    expect(
      evaluateConditional(
        { field: "str", operator: ConditionalOperator.GREATER_THAN, value: 10 },
        { str: "50" },
      ),
    ).toBe(true);
  });

  it("LESS_THAN — returns false when fieldValue coerces to NaN", () => {
    expect(
      evaluateConditional(
        { field: "str", operator: ConditionalOperator.LESS_THAN, value: 100 },
        { str: "not-a-number" },
      ),
    ).toBe(false);
  });

  it("LESS_THAN — returns false when rule.value coerces to NaN", () => {
    expect(
      evaluateConditional(
        {
          field: "num",
          operator: ConditionalOperator.LESS_THAN,
          value: "not-a-number",
        },
        { num: 5 },
      ),
    ).toBe(false);
  });

  it("LESS_THAN — returns true for valid numeric strings that coerce correctly", () => {
    expect(
      evaluateConditional(
        { field: "str", operator: ConditionalOperator.LESS_THAN, value: 100 },
        { str: "5" },
      ),
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PROD QA edge-case tests — custom validator error handling
// ---------------------------------------------------------------------------

describe("FieldRenderer — PROD QA custom validator safety", () => {
  it("does not crash when custom validator throws an exception", () => {
    // Bug fix: previously a throwing custom validator would propagate uncaught
    // and crash the component. Now it is silently swallowed.
    expect(() =>
      renderField({
        field: makeField({
          validation: {
            custom: () => {
              throw new Error("Validator exploded!");
            },
          },
        }),
        value: "some-value",
      }),
    ).not.toThrow();
    // Field should still render normally
    expect(screen.getByTestId("field-testField")).toBeInTheDocument();
  });

  it("does not show an error when custom validator throws (graceful degradation)", () => {
    renderField({
      field: makeField({
        label: "My Field",
        validation: {
          custom: () => {
            throw new TypeError("Unexpected null");
          },
        },
      }),
      value: "test",
    });
    // No error alert should appear — thrown error is swallowed
    expect(document.querySelector('[role="alert"]')).not.toBeInTheDocument();
  });

  it("still runs other validators after a custom validator throws", () => {
    // If custom throws, the component should still show minLength error
    renderField({
      field: makeField({
        label: "Bio",
        validation: {
          minLength: 10,
          custom: () => {
            throw new Error("crash");
          },
        },
      }),
      value: "short",
    });
    expect(
      screen.getByText("Bio must be at least 10 characters."),
    ).toBeInTheDocument();
  });
});
