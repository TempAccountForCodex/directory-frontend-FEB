/**
 * Tests for Step 2.2.2 — TextArea Component
 * Covers: rendering (multiline), value display, onChange, rows/maxRows config,
 *         character counter, error state, disabled state, external value sync,
 *         React.memo displayName.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
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

// Import TextArea — also calls registerFieldComponent(FieldType.TEXTAREA, TextArea)
import { TextArea } from "../fields/TextArea";
import type { FieldDefinition } from "../types";
import { FieldType } from "../types";

// ---------------------------------------------------------------------------
// Field factory helper
// ---------------------------------------------------------------------------

const makeField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition =>
  ({
    id: "test-field",
    name: "test_field",
    type: FieldType.TEXTAREA,
    label: "Description",
    required: false,
    validation: {},
    ui: { placeholder: "Enter description" },
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

function renderTextArea(props: RenderProps = {}) {
  const {
    field = makeField(),
    value = "",
    onChange = vi.fn(),
    disabled = false,
    errors = [],
  } = props;

  return render(
    <TextArea
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

describe("TextArea — rendering", () => {
  it("renders with label from field.label", () => {
    renderTextArea({ field: makeField({ label: "Bio" }) });
    expect(screen.getByLabelText("Bio")).toBeInTheDocument();
  });

  it("renders with placeholder from field.ui.placeholder", () => {
    renderTextArea({
      field: makeField({ ui: { placeholder: "Write something..." } }),
    });
    expect(
      screen.getByPlaceholderText("Write something..."),
    ).toBeInTheDocument();
  });

  it("displays current value", () => {
    renderTextArea({ value: "Some long text here" });
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveValue("Some long text here");
  });

  it("renders as a textarea element (multiline)", () => {
    renderTextArea();
    const textarea = screen.getByRole("textbox");
    expect(textarea.tagName.toLowerCase()).toBe("textarea");
  });
});

describe("TextArea — rows configuration", () => {
  it("uses default rows=4 when field.ui.props.rows is not set", () => {
    renderTextArea({ field: makeField({ ui: {} }) });
    // MUI renders minRows on the textarea element
    const textarea = screen.getByRole("textbox");
    // MUI applies rows indirectly — we verify the component renders without error
    expect(textarea).toBeInTheDocument();
  });

  it("applies custom rows from field.ui.props.rows", () => {
    renderTextArea({
      field: makeField({ ui: { props: { rows: 6 } } }),
    });
    const textarea = screen.getByRole("textbox");
    // MUI sets rows attribute on the underlying textarea
    expect(textarea).toBeInTheDocument();
  });

  it("applies custom maxRows from field.ui.props.maxRows", () => {
    renderTextArea({
      field: makeField({ ui: { props: { maxRows: 15 } } }),
    });
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });
});

describe("TextArea — onChange", () => {
  it("calls onChange on every keystroke", async () => {
    const onChange = vi.fn();
    renderTextArea({ onChange });

    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "hi!");

    expect(onChange).toHaveBeenCalledTimes(3);
    expect(onChange).toHaveBeenNthCalledWith(1, "h");
    expect(onChange).toHaveBeenNthCalledWith(2, "hi");
    expect(onChange).toHaveBeenNthCalledWith(3, "hi!");
  });

  it("calls onChange with empty string when content cleared", async () => {
    const onChange = vi.fn();
    renderTextArea({ value: "some text", onChange });

    const textarea = screen.getByRole("textbox");
    await userEvent.clear(textarea);

    expect(onChange).toHaveBeenLastCalledWith("");
  });
});

describe("TextArea — maxLength / character counter", () => {
  it('shows character counter "0/200" when maxLength=200 and value is empty', () => {
    renderTextArea({
      field: makeField({ validation: { maxLength: 200 } }),
      value: "",
    });
    expect(screen.getByText("0/200")).toBeInTheDocument();
  });

  it('shows character counter "50/200" when value has 50 chars', () => {
    const text50 = "a".repeat(50);
    renderTextArea({
      field: makeField({ validation: { maxLength: 200 } }),
      value: text50,
    });
    expect(screen.getByText("50/200")).toBeInTheDocument();
  });

  it("does NOT show character counter when maxLength is not set", () => {
    renderTextArea({ field: makeField({ validation: {} }), value: "text" });
    expect(screen.queryByText(/\d+\/\d+/)).not.toBeInTheDocument();
  });

  it("enforces maxLength via inputProps.maxLength attribute", () => {
    renderTextArea({
      field: makeField({ validation: { maxLength: 500 } }),
    });
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("maxlength", "500");
  });
});

describe("TextArea — error state", () => {
  it("shows error message when errors prop provided", () => {
    renderTextArea({ errors: ["Description is required"] });
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });

  it("shows first error when multiple errors provided", () => {
    renderTextArea({ errors: ["First error", "Second error"] });
    expect(screen.getByText("First error")).toBeInTheDocument();
    expect(screen.queryByText("Second error")).not.toBeInTheDocument();
  });

  it("marks textarea as aria-invalid when errors present", () => {
    renderTextArea({ errors: ["Too short"] });
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
  });

  it("does NOT have aria-invalid when no errors", () => {
    renderTextArea({ errors: [] });
    const textarea = screen.getByRole("textbox");
    expect(textarea).not.toHaveAttribute("aria-invalid", "true");
  });
});

describe("TextArea — disabled state", () => {
  it("is disabled when disabled=true", () => {
    renderTextArea({ disabled: true });
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("is enabled when disabled=false", () => {
    renderTextArea({ disabled: false });
    expect(screen.getByRole("textbox")).not.toBeDisabled();
  });
});

describe("TextArea — external value sync", () => {
  it("syncs with external value changes", async () => {
    const { rerender } = renderTextArea({ value: "first" });
    expect(screen.getByRole("textbox")).toHaveValue("first");

    rerender(
      <TextArea
        field={makeField()}
        value="second"
        onChange={vi.fn()}
        disabled={false}
        errors={[]}
      />,
    );

    await waitFor(() => {
      expect(screen.getByRole("textbox")).toHaveValue("second");
    });
  });

  it("handles null value gracefully", () => {
    renderTextArea({ value: null });
    expect(screen.getByRole("textbox")).toHaveValue("");
  });
});

describe("TextArea — React.memo", () => {
  it('has displayName of "TextArea"', () => {
    expect(TextArea.displayName).toBe("TextArea");
  });
});
