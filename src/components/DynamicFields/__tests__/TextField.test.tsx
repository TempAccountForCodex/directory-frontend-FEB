/**
 * Tests for Step 2.2.1 — TextField Component
 * Covers: rendering, value display, onChange, maxLength enforcement,
 *         character counter, error state, disabled state, external value sync,
 *         React.memo displayName.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
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

// Import TextField — this also calls registerFieldComponent(FieldType.TEXT, TextField)
import { TextField } from "../fields/TextField";
import type { FieldDefinition } from "../types";
import { FieldType } from "../types";

// ---------------------------------------------------------------------------
// Field factory helper
// ---------------------------------------------------------------------------

const makeField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition =>
  ({
    id: "test-field",
    name: "test_field",
    type: FieldType.TEXT,
    label: "Test Label",
    required: false,
    validation: {},
    ui: { placeholder: "Enter text" },
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

function renderTextField(props: RenderProps = {}) {
  const {
    field = makeField(),
    value = "",
    onChange = vi.fn(),
    disabled = false,
    errors = [],
  } = props;

  return render(
    <TextField
      field={field}
      value={value}
      onChange={onChange}
      disabled={disabled}
      errors={errors}
    />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("TextField — rendering", () => {
  it("renders with label from field.label", () => {
    renderTextField({ field: makeField({ label: "Company Name" }) });
    expect(screen.getByLabelText("Company Name")).toBeInTheDocument();
  });

  it("renders with placeholder from field.ui.placeholder", () => {
    renderTextField({
      field: makeField({ ui: { placeholder: "Enter company name" } }),
    });
    expect(
      screen.getByPlaceholderText("Enter company name"),
    ).toBeInTheDocument();
  });

  it("displays current value", () => {
    renderTextField({ value: "Hello World" });
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("Hello World");
  });

  it("renders required field without * by default (required=false)", () => {
    renderTextField({ field: makeField({ required: false }) });
    // No asterisk in aria-required when not required
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-required");
  });
});

describe("TextField — onChange", () => {
  it("calls onChange on every keystroke", async () => {
    const onChange = vi.fn();
    renderTextField({ onChange });

    const input = screen.getByRole("textbox");
    await userEvent.type(input, "abc");

    // Should have been called 3 times (one per character)
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, "a");
    expect(onChange).toHaveBeenNthCalledWith(2, "ab");
    expect(onChange).toHaveBeenNthCalledWith(3, "abc");
  });

  it("calls onChange with empty string when cleared", async () => {
    const onChange = vi.fn();
    renderTextField({ value: "hello", onChange });

    const input = screen.getByRole("textbox");
    await userEvent.clear(input);

    expect(onChange).toHaveBeenLastCalledWith("");
  });
});

describe("TextField — maxLength", () => {
  it("enforces maxLength — cannot type beyond limit via inputProps.maxLength", () => {
    renderTextField({
      field: makeField({ validation: { maxLength: 5 } }),
      value: "",
    });
    const input = screen.getByRole("textbox") as HTMLInputElement;
    expect(input).toHaveAttribute("maxlength", "5");
  });

  it('shows character counter "5/10" when maxLength=10 and value has 5 chars', () => {
    renderTextField({
      field: makeField({ validation: { maxLength: 10 } }),
      value: "Hello",
    });
    expect(screen.getByText("5/10")).toBeInTheDocument();
  });

  it('shows counter "0/20" when maxLength=20 and value is empty', () => {
    renderTextField({
      field: makeField({ validation: { maxLength: 20 } }),
      value: "",
    });
    expect(screen.getByText("0/20")).toBeInTheDocument();
  });

  it("does NOT show character counter when maxLength is not set", () => {
    renderTextField({
      field: makeField({ validation: {} }),
      value: "Some text",
    });
    // No "X/Y" pattern should appear
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });
});

describe("TextField — error state", () => {
  it("shows error message when errors prop provided", () => {
    renderTextField({ errors: ["This field is required"] });
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("shows first error when multiple errors provided", () => {
    renderTextField({ errors: ["Error one", "Error two"] });
    expect(screen.getByText("Error one")).toBeInTheDocument();
    // Second error not shown (we show errors[0] per spec)
    expect(screen.queryByText("Error two")).not.toBeInTheDocument();
  });

  it("marks input as aria-invalid when errors present", () => {
    renderTextField({ errors: ["Invalid input"] });
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("aria-invalid", "true");
  });

  it("does NOT have aria-invalid when no errors", () => {
    renderTextField({ errors: [] });
    const input = screen.getByRole("textbox");
    expect(input).not.toHaveAttribute("aria-invalid", "true");
  });
});

describe("TextField — disabled state", () => {
  it("is disabled when disabled=true prop", () => {
    renderTextField({ disabled: true });
    const input = screen.getByRole("textbox");
    expect(input).toBeDisabled();
  });

  it("is enabled when disabled=false", () => {
    renderTextField({ disabled: false });
    const input = screen.getByRole("textbox");
    expect(input).not.toBeDisabled();
  });
});

describe("TextField — external value sync", () => {
  it("syncs local state when value prop changes externally", async () => {
    const { rerender } = renderTextField({ value: "initial" });
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("initial");

    rerender(
      <TextField
        field={makeField()}
        value="updated externally"
        onChange={vi.fn()}
        disabled={false}
        errors={[]}
      />,
    );

    await waitFor(() => {
      expect(input).toHaveValue("updated externally");
    });
  });

  it("handles null/undefined value gracefully (renders as empty string)", () => {
    renderTextField({ value: null });
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("");
  });

  it("handles numeric value by converting to string", () => {
    renderTextField({ value: 42 });
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("42");
  });
});

describe("TextField — React.memo", () => {
  it('has displayName of "TextField"', () => {
    expect(TextField.displayName).toBe("TextField");
  });
});
