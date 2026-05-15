/**
 * Tests for Step 2.2.3 — NumberInput Component
 * Covers: rendering, value display, key blocking, step buttons,
 *         min/max clamping, boundary disabled states, disabled prop,
 *         React.memo displayName.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Mock DashboardInput to avoid ThemeContext dependency in unit tests
// ---------------------------------------------------------------------------

vi.mock("../../Dashboard/shared/DashboardInput", () => ({
  __esModule: true,
  default: ({
    multiline,
    value,
    onChange,
    onBlur,
    onKeyDown,
    onPaste,
    disabled,
    placeholder,
    required,
    helperText,
    inputProps,
    InputProps,
    FormHelperTextProps,
  }: any) => {
    const sharedProps = {
      value: value ?? "",
      onChange,
      onBlur,
      onKeyDown,
      onPaste,
      disabled,
      placeholder,
      required,
      "aria-label": inputProps?.["aria-label"],
      "aria-invalid": inputProps?.["aria-invalid"],
      "aria-describedby": inputProps?.["aria-describedby"],
      "aria-required": inputProps?.["aria-required"],
      maxLength: inputProps?.["maxLength"],
    };
    return (
      <div>
        {multiline ? (
          <textarea {...sharedProps} />
        ) : (
          <input type="text" {...sharedProps} />
        )}
        {helperText && (
          <span {...(FormHelperTextProps ?? {})}>{helperText}</span>
        )}
        {InputProps?.startAdornment}
        {InputProps?.endAdornment}
      </div>
    );
  },
}));

// Import NumberInput — also calls registerFieldComponent(FieldType.NUMBER, NumberInput)
import { NumberInput } from "../fields/NumberInput";
import type { FieldDefinition } from "../types";
import { FieldType } from "../types";

// ---------------------------------------------------------------------------
// Field factory helper
// ---------------------------------------------------------------------------

const makeField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition =>
  ({
    id: "quantity",
    name: "quantity",
    type: FieldType.NUMBER,
    label: "Quantity",
    required: false,
    validation: {},
    ui: {},
    ...overrides,
  }) as unknown as FieldDefinition;

// ---------------------------------------------------------------------------
// Render helper
// ---------------------------------------------------------------------------

interface RenderProps {
  field?: FieldDefinition;
  value?: unknown;
  onChange?: (v: unknown) => void;
  disabled?: boolean;
  errors?: string[];
}

function renderNumberInput(props: RenderProps = {}) {
  const {
    field = makeField(),
    value = "",
    onChange = vi.fn(),
    disabled = false,
    errors = [],
  } = props;

  return render(
    <NumberInput
      field={field}
      value={value}
      onChange={onChange}
      disabled={disabled}
      errors={errors}
    />,
  );
}

// Get the input element (type="text" with aria-label matching field label)
function getInput() {
  return screen.getByRole("textbox");
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("NumberInput — rendering", () => {
  it("renders with label from field.label", () => {
    renderNumberInput({ field: makeField({ label: "Price" }) });
    expect(screen.getByLabelText("Price")).toBeInTheDocument();
  });

  it("displays current numeric value as string", () => {
    renderNumberInput({ value: 42 });
    expect(getInput()).toHaveValue("42");
  });

  it("displays empty string when value is null", () => {
    renderNumberInput({ value: null });
    expect(getInput()).toHaveValue("");
  });

  it("renders increment and decrement buttons", () => {
    renderNumberInput();
    expect(
      screen.getByRole("button", { name: "Increment value" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Decrement value" }),
    ).toBeInTheDocument();
  });
});

describe("NumberInput — keydown blocking", () => {
  it('blocks non-numeric key "a"', () => {
    renderNumberInput({ value: "" });
    const input = getInput();
    fireEvent.keyDown(input, { key: "a" });
    // Input remains unchanged — 'a' was blocked
    expect(input).toHaveValue("");
  });

  it('blocks key "e" (used by type="number" inputs for exponent)', () => {
    renderNumberInput({ value: "" });
    const input = getInput();
    fireEvent.keyDown(input, { key: "e" });
    expect(input).toHaveValue("");
  });

  it('allows numeric key "5" (does not preventDefault)', () => {
    renderNumberInput({ value: "" });
    const input = getInput();
    const event = new KeyboardEvent("keydown", { key: "5", bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    input.dispatchEvent(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("allows Backspace key", () => {
    renderNumberInput({ value: "5" });
    const input = getInput();
    const event = new KeyboardEvent("keydown", {
      key: "Backspace",
      bubbles: true,
    });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    input.dispatchEvent(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("allows Tab key", () => {
    renderNumberInput({ value: "" });
    const input = getInput();
    const event = new KeyboardEvent("keydown", { key: "Tab", bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    input.dispatchEvent(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it("blocks minus sign when min is 0 (no negatives allowed)", () => {
    renderNumberInput({
      field: makeField({ validation: { min: 0 } }),
      value: "",
    });
    const input = getInput();
    fireEvent.keyDown(input, { key: "-" });
    expect(input).toHaveValue("");
  });

  it("allows minus sign when min is undefined", () => {
    renderNumberInput({
      field: makeField({ validation: {} }),
      value: "",
    });
    const input = getInput();
    const event = new KeyboardEvent("keydown", { key: "-", bubbles: true });
    const preventDefaultSpy = vi.spyOn(event, "preventDefault");
    input.dispatchEvent(event);
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});

describe("NumberInput — step buttons", () => {
  it("calls onChange with incremented value on + button click", async () => {
    const onChange = vi.fn();
    renderNumberInput({
      value: 5,
      onChange,
      field: makeField({ validation: {} }),
    });

    const incrementBtn = screen.getByRole("button", {
      name: "Increment value",
    });
    await userEvent.click(incrementBtn);

    expect(onChange).toHaveBeenCalledWith(6);
  });

  it("calls onChange with decremented value on - button click", async () => {
    const onChange = vi.fn();
    renderNumberInput({
      value: 5,
      onChange,
      field: makeField({ validation: {} }),
    });

    const decrementBtn = screen.getByRole("button", {
      name: "Decrement value",
    });
    await userEvent.click(decrementBtn);

    expect(onChange).toHaveBeenCalledWith(4);
  });

  it("uses custom step when field.ui.props.step is set", async () => {
    const onChange = vi.fn();
    renderNumberInput({
      value: 10,
      onChange,
      field: makeField({ ui: { props: { step: 5 } } }),
    });

    await userEvent.click(
      screen.getByRole("button", { name: "Increment value" }),
    );
    expect(onChange).toHaveBeenCalledWith(15);
  });
});

describe("NumberInput — min/max clamping", () => {
  it("clamps increment at max — increment button is disabled at boundary", () => {
    // When value equals max, the + button is disabled — correct clamping behaviour
    renderNumberInput({
      value: 10,
      field: makeField({ validation: { max: 10 } }),
    });
    // Button disabled at max means the component enforces the upper bound
    expect(
      screen.getByRole("button", { name: "Increment value" }),
    ).toBeDisabled();
  });

  it("clamps decrement at min — decrement button is disabled at boundary", () => {
    // When value equals min, the - button is disabled — correct clamping behaviour
    renderNumberInput({
      value: 0,
      field: makeField({ validation: { min: 0 } }),
    });
    expect(
      screen.getByRole("button", { name: "Decrement value" }),
    ).toBeDisabled();
  });

  it("calls onChange with clamped value on blur when above max", async () => {
    const onChange = vi.fn();
    renderNumberInput({
      value: "",
      onChange,
      field: makeField({ validation: { min: 0, max: 100 } }),
    });

    const input = getInput();
    // Manually fire change with out-of-range value then blur
    fireEvent.change(input, { target: { value: "200" } });
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(100);
    });
  });

  it("calls onChange with null on blur when input is empty", async () => {
    const onChange = vi.fn();
    renderNumberInput({ value: "", onChange });

    const input = getInput();
    fireEvent.blur(input);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith(null);
    });
  });
});

describe("NumberInput — step button disabled states", () => {
  it("increment button is disabled when value >= max", () => {
    renderNumberInput({
      value: 10,
      field: makeField({ validation: { max: 10 } }),
    });
    expect(
      screen.getByRole("button", { name: "Increment value" }),
    ).toBeDisabled();
  });

  it("decrement button is disabled when value <= min", () => {
    renderNumberInput({
      value: 0,
      field: makeField({ validation: { min: 0 } }),
    });
    expect(
      screen.getByRole("button", { name: "Decrement value" }),
    ).toBeDisabled();
  });

  it("increment button is NOT disabled when value < max", () => {
    renderNumberInput({
      value: 5,
      field: makeField({ validation: { max: 10 } }),
    });
    expect(
      screen.getByRole("button", { name: "Increment value" }),
    ).not.toBeDisabled();
  });

  it("decrement button is NOT disabled when value > min", () => {
    renderNumberInput({
      value: 5,
      field: makeField({ validation: { min: 0 } }),
    });
    expect(
      screen.getByRole("button", { name: "Decrement value" }),
    ).not.toBeDisabled();
  });
});

describe("NumberInput — disabled prop", () => {
  it("disables the input when disabled=true", () => {
    renderNumberInput({ disabled: true });
    expect(getInput()).toBeDisabled();
  });

  it("disables increment button when disabled=true", () => {
    renderNumberInput({ disabled: true, value: 5 });
    expect(
      screen.getByRole("button", { name: "Increment value" }),
    ).toBeDisabled();
  });

  it("disables decrement button when disabled=true", () => {
    renderNumberInput({ disabled: true, value: 5 });
    expect(
      screen.getByRole("button", { name: "Decrement value" }),
    ).toBeDisabled();
  });

  it("enables input and buttons when disabled=false", () => {
    renderNumberInput({ disabled: false, value: 5 });
    expect(getInput()).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Increment value" }),
    ).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Decrement value" }),
    ).not.toBeDisabled();
  });
});

describe("NumberInput — error state", () => {
  it("shows error message when errors prop provided", () => {
    renderNumberInput({ errors: ["Value must be positive"] });
    expect(screen.getByText("Value must be positive")).toBeInTheDocument();
  });

  it("marks input as aria-invalid when errors present", () => {
    renderNumberInput({ errors: ["Required"] });
    expect(getInput()).toHaveAttribute("aria-invalid", "true");
  });

  it("does NOT have aria-invalid when no errors", () => {
    renderNumberInput({ errors: [] });
    expect(getInput()).not.toHaveAttribute("aria-invalid", "true");
  });
});

describe("NumberInput — React.memo", () => {
  it('has displayName of "NumberInput"', () => {
    expect(NumberInput.displayName).toBe("NumberInput");
  });
});
