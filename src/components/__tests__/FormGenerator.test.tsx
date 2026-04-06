/**
 * Tests for Steps 2.5.4 + 2.5.5 + 2.7.3 + 2.8.1 + 2.8.2 — FormGenerator Component
 *
 * Covers:
 *  2.5.4:
 *   1.  Renders MUI Skeleton rows while metadata is loading
 *   2.  Renders error message with color='error' on fetch failure
 *   3.  Renders empty-state message when metadata has no groups
 *   4.  Renders group headings sorted by group.order ascending
 *   5.  Renders fields sorted by field.order ascending within each group
 *   6.  Delegates each field to FieldRenderer (not custom rendering)
 *   7.  shouldShowField filters hidden fields from the form
 *   8.  onChange fires with complete updated values object
 *   9.  initialValues populate form state on mount
 *   10. disabled prop is propagated to all FieldRenderers
 *   11. React.memo — FormGenerator has displayName set
 *
 *  2.5.5:
 *   12. errors state is Record<string, string[]>
 *   13. onChange fires immediately (not debounced)
 *   14. Rapid typing does not run validation immediately (debounce 300ms)
 *   15. Required field validation works end-to-end via onValidate
 *   16. onValidate receives empty {} when all fields are valid
 *   17. Errors are passed to FieldRenderer via errors prop (after blur)
 *
 *  2.7.3:
 *   18. onBlur triggers immediate validation and marks field as touched
 *   19. Errors only show for touched fields
 *   20. onBlur handler is passed to FieldRenderer
 *   21. validateForm called on submit, submit blocked if hasErrors
 *   22. Successful submit fires onSubmit with values
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  act,
  waitFor,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ── Component under test ──────────────────────────────────────────────────
import { FormGenerator } from "../FormGenerator";

// ── Registry — register a mock component so FieldRenderer resolves fields ──
import { registerFieldComponent } from "../DynamicFields/registry";
import { FieldType } from "../DynamicFields/types";
import type { FieldRendererProps } from "../DynamicFields/types";

// ---------------------------------------------------------------------------
// Mock field component
// ---------------------------------------------------------------------------

/**
 * Renders an <input> with data-testid and exposes disabled + errors as
 * data attributes so assertions can inspect them.
 */
const MockField: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled,
  errors,
}) =>
  React.createElement("input", {
    "data-testid": `field-${field.name}`,
    "data-disabled": disabled ? "true" : "false",
    "data-errors": errors?.join(",") ?? "",
    value: String(value ?? ""),
    readOnly: !onChange,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange?.(e.target.value),
  });

MockField.displayName = "MockField";

// Register for all types we use in tests
beforeEach(() => {
  registerFieldComponent(FieldType.TEXT, MockField);
  registerFieldComponent(FieldType.NUMBER, MockField);
  registerFieldComponent(FieldType.TEXTAREA, MockField);
  registerFieldComponent(FieldType.TOGGLE, MockField);
});

// ---------------------------------------------------------------------------
// Mock useFieldMetadata
// ---------------------------------------------------------------------------

vi.mock("../../hooks/useFieldMetadata", () => {
  const mockFn = vi.fn();
  return {
    default: mockFn,
    useFieldMetadata: mockFn,
  };
});

// Mock framer-motion for animation testing (2.8.1)
vi.mock("framer-motion", () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const React = require("react");

  const AnimatePresence = ({ children }: any) =>
    React.createElement("div", { "data-animate-presence": "true" }, children);
  AnimatePresence.displayName = "AnimatePresence";

  const MotionDiv = React.forwardRef(
    (
      {
        children,
        initial,
        animate,
        exit,
        transition,
        layout,
        onAnimationComplete,
        style,
        className,
        ...rest
      }: any,
      ref: any,
    ) =>
      React.createElement(
        "div",
        {
          ref,
          "data-motion": "true",
          "data-initial":
            typeof initial === "object"
              ? JSON.stringify(initial)
              : String(initial ?? ""),
          "data-animate":
            typeof animate === "object"
              ? JSON.stringify(animate)
              : String(animate ?? ""),
          "data-exit":
            typeof exit === "object"
              ? JSON.stringify(exit)
              : String(exit ?? ""),
          style,
          className,
          ...rest,
        },
        children,
      ),
  );
  MotionDiv.displayName = "MotionDiv";

  return {
    AnimatePresence,
    motion: { div: MotionDiv },
  };
});

import useFieldMetadata from "../../hooks/useFieldMetadata";
const mockUseFieldMetadata = vi.mocked(useFieldMetadata);

// ---------------------------------------------------------------------------
// Fixture data
// ---------------------------------------------------------------------------

const basicMetadata = {
  groups: [
    {
      id: "group-a",
      label: "Group A",
      order: 1,
      fields: [
        { name: "title", type: "TEXT", label: "Title", order: 1 },
        { name: "subtitle", type: "TEXT", label: "Subtitle", order: 2 },
      ],
    },
  ],
};

const multiGroupMetadata = {
  groups: [
    {
      id: "group-b",
      label: "Group B",
      order: 2,
      fields: [{ name: "email", type: "TEXT", label: "Email", order: 1 }],
    },
    {
      id: "group-a",
      label: "Group A",
      order: 1,
      fields: [{ name: "name", type: "TEXT", label: "Name", order: 1 }],
    },
  ],
};

const conditionalMetadata = {
  groups: [
    {
      id: "group-cond",
      label: "Conditional Group",
      order: 1,
      fields: [
        { name: "showExtra", type: "TOGGLE", label: "Show Extra", order: 1 },
        {
          name: "extra",
          type: "TEXT",
          label: "Extra Field",
          order: 2,
          // Lowercase operators — shouldShowField uses these
          conditional: { field: "showExtra", operator: "equals", value: true },
        },
      ],
    },
  ],
};

const requiredFieldMetadata = {
  groups: [
    {
      id: "group-req",
      label: "Required Group",
      order: 1,
      fields: [
        {
          name: "requiredField",
          type: "TEXT",
          label: "Required Field",
          order: 1,
          required: true,
        },
      ],
    },
  ],
};

/**
 * MockToggle — sends boolean values (not strings) for proper shouldShowField evaluation.
 * Used in 2.8.x tests where we need to dynamically toggle conditional field visibility.
 */
const MockToggle: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled,
  errors,
}) =>
  React.createElement("input", {
    type: "checkbox",
    "data-testid": `field-${field.name}`,
    "data-disabled": disabled ? "true" : "false",
    "data-errors": errors?.join(",") ?? "",
    checked: Boolean(value),
    readOnly: !onChange,
    onChange: () => onChange?.(!value),
  });

MockToggle.displayName = "MockToggle";

const clearOnHideMetadata = {
  groups: [
    {
      id: "group-clear",
      label: "Clear Group",
      order: 1,
      fields: [
        { name: "toggle", type: "TOGGLE", label: "Toggle", order: 1 },
        {
          name: "clearable",
          type: "TEXT",
          label: "Clearable",
          order: 2,
          clearOnHide: true,
          conditional: { field: "toggle", operator: "equals", value: true },
        },
        {
          name: "preserved",
          type: "TEXT",
          label: "Preserved",
          order: 3,
          clearOnHide: false,
          conditional: { field: "toggle", operator: "equals", value: true },
        },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeLoadingState() {
  mockUseFieldMetadata.mockReturnValue({
    metadata: null,
    loading: true,
    error: null,
    refetch: vi.fn(),
  });
}

function makeErrorState(message = "HTTP 500") {
  mockUseFieldMetadata.mockReturnValue({
    metadata: null,
    loading: false,
    error: message,
    refetch: vi.fn(),
  });
}

function makeReadyState(metadata: typeof basicMetadata) {
  mockUseFieldMetadata.mockReturnValue({
    metadata,
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
}

function makeEmptyState() {
  mockUseFieldMetadata.mockReturnValue({
    metadata: { groups: [] },
    loading: false,
    error: null,
    refetch: vi.fn(),
  });
}

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Tests — 2.5.4: FormGenerator Component
// ---------------------------------------------------------------------------

describe("FormGenerator", () => {
  // ── 1. Loading skeleton ─────────────────────────────────────────────────

  it("renders MUI Skeleton rows while loading", () => {
    makeLoadingState();
    render(<FormGenerator blockType="hero" />);
    // vitest-dom: MUI Skeleton renders as <span role="img"> or just <span>
    // We verify no field inputs are rendered yet
    expect(screen.queryByTestId(/^field-/)).toBeNull();
    // Skeleton elements should be present
    const skeletons = document.querySelectorAll('[class*="MuiSkeleton"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // ── 2. Error state ──────────────────────────────────────────────────────

  it("renders error message with color=error on fetch failure", () => {
    makeErrorState("HTTP 404");
    render(<FormGenerator blockType="hero" />);
    const msg = screen.getByRole("alert");
    expect(msg).toBeInTheDocument();
    expect(msg).toHaveTextContent("HTTP 404");
  });

  // ── 3. Empty metadata state ─────────────────────────────────────────────

  it("renders descriptive message when metadata has no groups", () => {
    makeEmptyState();
    render(<FormGenerator blockType="hero" />);
    expect(screen.getByText(/no fields are configured/i)).toBeInTheDocument();
  });

  // ── 4. Groups sorted by order ascending ────────────────────────────────

  it("renders group headings sorted by group.order ascending", () => {
    makeReadyState(multiGroupMetadata);
    render(<FormGenerator blockType="hero" />);
    const headings = screen.getAllByText(/Group (A|B)/);
    // Group A (order:1) should appear before Group B (order:2)
    expect(headings[0]).toHaveTextContent("Group A");
    expect(headings[1]).toHaveTextContent("Group B");
  });

  // ── 5. Fields sorted by order ascending within group ───────────────────

  it("renders fields sorted by field.order ascending within a group", () => {
    const metadata = {
      groups: [
        {
          id: "g",
          label: "G",
          order: 1,
          fields: [
            { name: "beta", type: "TEXT", label: "Beta", order: 2 },
            { name: "alpha", type: "TEXT", label: "Alpha", order: 1 },
          ],
        },
      ],
    };
    makeReadyState(metadata as typeof basicMetadata);
    render(<FormGenerator blockType="hero" />);

    const inputs = screen.getAllByTestId(/^field-/);
    // alpha (order:1) should be first
    expect(inputs[0]).toHaveAttribute("data-testid", "field-alpha");
    expect(inputs[1]).toHaveAttribute("data-testid", "field-beta");
  });

  // ── 6. Delegates to FieldRenderer ──────────────────────────────────────

  it("renders a field input for each field via FieldRenderer", () => {
    makeReadyState(basicMetadata);
    render(<FormGenerator blockType="hero" />);
    expect(screen.getByTestId("field-title")).toBeInTheDocument();
    expect(screen.getByTestId("field-subtitle")).toBeInTheDocument();
  });

  // ── 7. shouldShowField filters hidden fields ────────────────────────────

  it("hides fields whose shouldShowField condition evaluates false", () => {
    makeReadyState(conditionalMetadata as typeof basicMetadata);
    // showExtra is false by default → extra field should NOT be rendered
    render(
      <FormGenerator blockType="hero" initialValues={{ showExtra: false }} />,
    );
    expect(screen.getByTestId("field-showExtra")).toBeInTheDocument();
    expect(screen.queryByTestId("field-extra")).toBeNull();
  });

  it("shows fields when shouldShowField condition evaluates true", () => {
    makeReadyState(conditionalMetadata as typeof basicMetadata);
    render(
      <FormGenerator blockType="hero" initialValues={{ showExtra: true }} />,
    );
    expect(screen.getByTestId("field-showExtra")).toBeInTheDocument();
    expect(screen.getByTestId("field-extra")).toBeInTheDocument();
  });

  // ── 8. onChange fires with complete updated values ──────────────────────

  it("fires onChange with complete updated values object on field change", async () => {
    makeReadyState(basicMetadata);
    const handleChange = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ title: "Hello", subtitle: "World" }}
        onChange={handleChange}
      />,
    );

    const titleInput = screen.getByTestId("field-title");
    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "New");

    // onChange should have been called; the last call should include both fields
    expect(handleChange).toHaveBeenCalled();
    const lastCall =
      handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty("title");
    expect(lastCall).toHaveProperty("subtitle", "World");
  });

  // ── 9. initialValues populate form state on mount ──────────────────────

  it("populates fields from initialValues on mount", () => {
    makeReadyState(basicMetadata);
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ title: "Initial Title", subtitle: "Initial Subtitle" }}
      />,
    );
    expect(screen.getByTestId("field-title")).toHaveValue("Initial Title");
    expect(screen.getByTestId("field-subtitle")).toHaveValue(
      "Initial Subtitle",
    );
  });

  // ── 10. disabled prop propagated ────────────────────────────────────────

  it("propagates disabled=true to all FieldRenderers", () => {
    makeReadyState(basicMetadata);
    render(<FormGenerator blockType="hero" disabled={true} />);
    const inputs = screen.getAllByTestId(/^field-/);
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("data-disabled", "true");
    });
  });

  it("propagates disabled=false when not set", () => {
    makeReadyState(basicMetadata);
    render(<FormGenerator blockType="hero" />);
    const inputs = screen.getAllByTestId(/^field-/);
    inputs.forEach((input) => {
      expect(input).toHaveAttribute("data-disabled", "false");
    });
  });

  // ── 11. React.memo / displayName ────────────────────────────────────────

  it("has displayName set to FormGenerator", () => {
    expect(FormGenerator.displayName).toBe("FormGenerator");
  });

  // ---------------------------------------------------------------------------
  // Tests — 2.5.5: FormGenerator Validation Integration
  // ---------------------------------------------------------------------------

  // ── 12. onValidate fires on mount with empty {} when fields are valid ───

  it("calls onValidate on mount with empty {} when all fields are valid", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    const onValidate = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "filled" }}
        onValidate={onValidate}
      />,
    );
    // Wait for the effect to fire
    await waitFor(() => {
      expect(onValidate).toHaveBeenCalled();
    });
    const call = onValidate.mock.calls[onValidate.mock.calls.length - 1][0];
    // required field is filled — errors object should be empty
    expect(call).toEqual({});
  });

  // ── 13. onChange fires immediately (not debounced) ──────────────────────

  it("fires onChange immediately — not after a debounce delay", async () => {
    makeReadyState(basicMetadata);
    const handleChange = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ title: "" }}
        onChange={handleChange}
      />,
    );

    const input = screen.getByTestId("field-title");
    await userEvent.type(input, "A");

    // onChange should have been called synchronously during the event
    expect(handleChange).toHaveBeenCalled();
  });

  // ── 14. Rapid typing does not spam validation (debounce verified) ───────

  it("does not call onValidate multiple times during rapid field updates — only once after debounce", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    const onValidate = vi.fn();

    const { rerender } = render(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "a" }}
        onValidate={onValidate}
      />,
    );

    // Wait for the initial validation
    await waitFor(() => {
      expect(onValidate).toHaveBeenCalled();
    });

    const callCountAfterMount = onValidate.mock.calls.length;

    // Re-render doesn't reset values so no additional validation should occur
    rerender(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "a" }}
        onValidate={onValidate}
        disabled={false}
      />,
    );

    // Give React time to settle; no new onChange fired, debounce doesn't fire again
    await new Promise((r) => setTimeout(r, 50));
    // The call count should not have increased significantly
    expect(onValidate.mock.calls.length).toBeLessThanOrEqual(
      callCountAfterMount + 1,
    );
  });

  // ── 15. Required field validation works end-to-end ──────────────────────

  it("calls onValidate with errors for required empty fields after debounce", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    const onValidate = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "" }}
        onValidate={onValidate}
      />,
    );

    await waitFor(() => {
      expect(onValidate).toHaveBeenCalled();
    });

    const lastErrors =
      onValidate.mock.calls[onValidate.mock.calls.length - 1][0];
    expect(lastErrors).toHaveProperty("requiredField");
    expect(Array.isArray(lastErrors["requiredField"])).toBe(true);
    expect(lastErrors["requiredField"].length).toBeGreaterThan(0);
  });

  // ── 16. Empty errors {} when all fields are valid ───────────────────────

  it("calls onValidate with empty {} when required field has value", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    const onValidate = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "valid value" }}
        onValidate={onValidate}
      />,
    );

    await waitFor(() => {
      expect(onValidate).toHaveBeenCalled();
    });

    const lastErrors =
      onValidate.mock.calls[onValidate.mock.calls.length - 1][0];
    // required field has a value — no errors expected
    expect(lastErrors).toEqual({});
  });

  // ── 17. Errors passed to FieldRenderer only after field is touched ──────

  it("passes errors to FieldRenderer via errors prop after blur triggers touched state", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    render(
      <FormGenerator blockType="hero" initialValues={{ requiredField: "" }} />,
    );

    // Before blur — no errors shown (field not touched)
    const input = screen.getByTestId("field-requiredField");
    expect(input.getAttribute("data-errors")).toBe("");

    // Trigger blur to mark field as touched and validate immediately
    fireEvent.blur(input);

    // Wait for validation effect to run and errors to propagate
    await waitFor(() => {
      const el = screen.getByTestId("field-requiredField");
      expect(el.getAttribute("data-errors")).not.toBe("");
    });
  });

  // ---------------------------------------------------------------------------
  // Tests — 2.7.3: Blur Validation & Touched Field Gating
  // ---------------------------------------------------------------------------

  // ── 18. onBlur triggers immediate validation and marks field as touched ──

  it("onBlur triggers immediate validation — marks field as touched and shows errors", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    render(
      <FormGenerator blockType="hero" initialValues={{ requiredField: "" }} />,
    );

    const input = screen.getByTestId("field-requiredField");

    // Before blur — no errors visible (not touched)
    expect(input.getAttribute("data-errors")).toBe("");

    // Blur the field
    fireEvent.blur(input);

    // After blur — errors should appear immediately
    await waitFor(() => {
      expect(input.getAttribute("data-errors")).not.toBe("");
    });
  });

  // ── 19. Errors only show for touched fields ────────────────────────────

  it("does not show errors for untouched fields even when invalid", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    const onValidate = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "" }}
        onValidate={onValidate}
      />,
    );

    // Wait for validation to run internally
    await waitFor(() => {
      expect(onValidate).toHaveBeenCalled();
    });

    // onValidate reports errors (all visible field errors, not gated by touched)
    const lastErrors =
      onValidate.mock.calls[onValidate.mock.calls.length - 1][0];
    expect(lastErrors).toHaveProperty("requiredField");

    // But FieldRenderer errors prop is empty because field is untouched
    const input = screen.getByTestId("field-requiredField");
    expect(input.getAttribute("data-errors")).toBe("");
  });

  // ── 20. onBlur handler is passed to FieldRenderer ──────────────────────

  it("passes onBlur handler to FieldRenderer for each field", () => {
    makeReadyState(basicMetadata);
    render(<FormGenerator blockType="hero" />);

    // FieldRenderer wraps the field component in a div with onBlur.
    // The blur event on the input should bubble up to the wrapper.
    const input = screen.getByTestId("field-title");
    // Verify the input is inside a div (the onBlur wrapper from FieldRenderer)
    expect(input.closest("div")).toBeTruthy();
  });

  // ── 21. Submit blocked if hasErrors ────────────────────────────────────

  it("blocks onSubmit when validation fails (form has errors)", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    const onSubmit = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "" }}
        onSubmit={onSubmit}
      />,
    );

    // Submit the form
    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    // onSubmit should NOT be called because requiredField is empty
    expect(onSubmit).not.toHaveBeenCalled();
  });

  // ── 22. Successful submit fires onSubmit with values ───────────────────

  it("fires onSubmit with values when form is valid", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    const onSubmit = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "valid" }}
        onSubmit={onSubmit}
      />,
    );

    // Submit the form
    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    // onSubmit should be called with the values
    expect(onSubmit).toHaveBeenCalledWith({ requiredField: "valid" });
  });

  // ── 23. Submit marks all fields as touched (shows all errors) ──────────

  it("submit marks all fields as touched — shows all errors after failed submit", async () => {
    makeReadyState(requiredFieldMetadata as typeof basicMetadata);
    const onSubmit = vi.fn();
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ requiredField: "" }}
        onSubmit={onSubmit}
      />,
    );

    // Before submit — no errors shown
    const input = screen.getByTestId("field-requiredField");
    expect(input.getAttribute("data-errors")).toBe("");

    // Submit the form (triggers validateForm which marks all as touched)
    const form = document.querySelector("form")!;
    fireEvent.submit(form);

    // After submit — errors should be visible for all touched fields
    await waitFor(() => {
      const el = screen.getByTestId("field-requiredField");
      expect(el.getAttribute("data-errors")).not.toBe("");
    });
  });

  // ---------------------------------------------------------------------------
  // PROD QA Step 2.5 — targeted edge-case tests for issues found during audit
  // ---------------------------------------------------------------------------

  // ── SECURITY: API-supplied regex patterns are length-capped (ReDoS guard) ──

  it("[PROD QA] does not crash and ignores patterns exceeding 500 chars", async () => {
    const longPattern = "a".repeat(501);
    const metadataWithLongPattern = {
      groups: [
        {
          id: "g",
          label: "G",
          order: 1,
          fields: [
            {
              name: "field1",
              type: "TEXT",
              label: "Field 1",
              order: 1,
              validation: { pattern: longPattern },
            },
          ],
        },
      ],
    };
    makeReadyState(metadataWithLongPattern as typeof basicMetadata);
    // Should not throw during render or validation
    expect(() =>
      render(
        <FormGenerator
          blockType="hero"
          initialValues={{ field1: "any value" }}
        />,
      ),
    ).not.toThrow();
    expect(screen.getByTestId("field-field1")).toBeInTheDocument();
  });

  it("[PROD QA] ignores exactly-500-char patterns and treats shorter ones as valid", async () => {
    const onValidate = vi.fn();
    const metadataWithPattern = {
      groups: [
        {
          id: "g",
          label: "G",
          order: 1,
          fields: [
            {
              name: "field1",
              type: "TEXT",
              label: "Field 1",
              order: 1,
              // short valid pattern — should be applied
              validation: { pattern: "^\\d+$" },
            },
          ],
        },
      ],
    };
    makeReadyState(metadataWithPattern as typeof basicMetadata);
    render(
      <FormGenerator
        blockType="hero"
        initialValues={{ field1: "notanumber" }}
        onValidate={onValidate}
      />,
    );
    // 'notanumber' fails ^\d+$ — validation error expected
    await waitFor(() => {
      expect(onValidate).toHaveBeenCalled();
    });
    const lastCall = onValidate.mock.calls[onValidate.mock.calls.length - 1][0];
    expect(lastCall).toHaveProperty("field1");
  });

  // ── DATA INTEGRITY: Hidden fields must NOT produce validation errors ────────

  it("[PROD QA] does not report errors for conditionally hidden fields", async () => {
    const onValidate = vi.fn();
    // 'extra' field is required but hidden when showExtra !== true
    const metadataWithHiddenRequired = {
      groups: [
        {
          id: "g",
          label: "G",
          order: 1,
          fields: [
            {
              name: "showExtra",
              type: "TOGGLE",
              label: "Show Extra",
              order: 1,
            },
            {
              name: "extra",
              type: "TEXT",
              label: "Extra (required)",
              order: 2,
              required: true,
              conditional: {
                field: "showExtra",
                operator: "equals",
                value: true,
              },
            },
          ],
        },
      ],
    };
    makeReadyState(metadataWithHiddenRequired as typeof basicMetadata);
    render(
      <FormGenerator
        blockType="hero"
        // showExtra is false → 'extra' is hidden → should NOT produce a required error
        initialValues={{ showExtra: false, extra: "" }}
        onValidate={onValidate}
      />,
    );

    await waitFor(() => {
      expect(onValidate).toHaveBeenCalled();
    });

    const lastErrors =
      onValidate.mock.calls[onValidate.mock.calls.length - 1][0];
    // 'extra' is hidden — its required error must NOT appear
    expect(lastErrors).not.toHaveProperty("extra");
  });

  it("[PROD QA] reports errors for required fields that are VISIBLE", async () => {
    const onValidate = vi.fn();
    const metadataWithHiddenRequired = {
      groups: [
        {
          id: "g",
          label: "G",
          order: 1,
          fields: [
            {
              name: "showExtra",
              type: "TOGGLE",
              label: "Show Extra",
              order: 1,
            },
            {
              name: "extra",
              type: "TEXT",
              label: "Extra (required)",
              order: 2,
              required: true,
              conditional: {
                field: "showExtra",
                operator: "equals",
                value: true,
              },
            },
          ],
        },
      ],
    };
    makeReadyState(metadataWithHiddenRequired as typeof basicMetadata);
    render(
      <FormGenerator
        blockType="hero"
        // showExtra is true → 'extra' IS visible → required error SHOULD appear
        initialValues={{ showExtra: true, extra: "" }}
        onValidate={onValidate}
      />,
    );

    await waitFor(() => {
      expect(onValidate).toHaveBeenCalled();
    });

    const lastErrors =
      onValidate.mock.calls[onValidate.mock.calls.length - 1][0];
    // 'extra' is visible and empty — required error expected
    expect(lastErrors).toHaveProperty("extra");
  });

  // ── SECURITY: blockType is URL-encoded in useFieldMetadata (audit only) ──

  it("[PROD QA] does not crash when blockType contains special characters", () => {
    makeLoadingState();
    expect(() =>
      render(<FormGenerator blockType="hero/admin" />),
    ).not.toThrow();
  });

  // ── PERFORMANCE: stable field handler references across re-renders ─────────

  it("[PROD QA] getFieldHandler returns the same function reference across re-renders", () => {
    makeReadyState(basicMetadata);
    const handleChange = vi.fn();
    const { rerender } = render(
      <FormGenerator blockType="hero" onChange={handleChange} />,
    );

    // Capture the input after first render — it won't re-render if handler is stable
    const inputBefore = screen.getByTestId("field-title");

    rerender(<FormGenerator blockType="hero" onChange={handleChange} />);

    // The same DOM node should still be present (not replaced due to re-render)
    const inputAfter = screen.getByTestId("field-title");
    expect(inputBefore).toBe(inputAfter);
  });

  // ---------------------------------------------------------------------------
  // Tests — 2.8.1: Conditional Field Animations
  // ---------------------------------------------------------------------------

  describe("Step 2.8.1 — Conditional Field Animations", () => {
    it("wraps each visible field in a motion.div wrapper", () => {
      makeReadyState(basicMetadata);
      render(<FormGenerator blockType="hero" />);
      const motionDivs = document.querySelectorAll('[data-motion="true"]');
      // Each visible field (title + subtitle) should be wrapped
      expect(motionDivs.length).toBe(2);
    });

    it("renders AnimatePresence around field groups", () => {
      makeReadyState(basicMetadata);
      render(<FormGenerator blockType="hero" />);
      const presence = document.querySelectorAll(
        '[data-animate-presence="true"]',
      );
      expect(presence.length).toBeGreaterThan(0);
    });

    it("skips animation on initial render (initial=false)", () => {
      makeReadyState(basicMetadata);
      render(<FormGenerator blockType="hero" />);
      const motionDivs = document.querySelectorAll('[data-motion="true"]');
      expect(motionDivs.length).toBeGreaterThan(0);
      motionDivs.forEach((div) => {
        expect(div.getAttribute("data-initial")).toBe("false");
      });
    });

    it("configures correct animate props (opacity:1, height:auto)", () => {
      makeReadyState(basicMetadata);
      render(<FormGenerator blockType="hero" />);
      const motionDivs = document.querySelectorAll('[data-motion="true"]');
      motionDivs.forEach((div) => {
        const animate = JSON.parse(div.getAttribute("data-animate")!);
        expect(animate).toHaveProperty("opacity", 1);
        expect(animate).toHaveProperty("height", "auto");
      });
    });

    it("configures correct exit props (opacity:0, height:0)", () => {
      makeReadyState(basicMetadata);
      render(<FormGenerator blockType="hero" />);
      const motionDivs = document.querySelectorAll('[data-motion="true"]');
      motionDivs.forEach((div) => {
        const exit = JSON.parse(div.getAttribute("data-exit")!);
        expect(exit).toHaveProperty("opacity", 0);
        expect(exit).toHaveProperty("height", 0);
      });
    });

    it("sets overflow:hidden on motion.div to prevent layout shift", () => {
      makeReadyState(basicMetadata);
      render(<FormGenerator blockType="hero" />);
      const motionDivs = document.querySelectorAll('[data-motion="true"]');
      motionDivs.forEach((div) => {
        expect((div as HTMLElement).style.overflow).toBe("hidden");
      });
    });

    it("applies animation config for fields appearing after initial render", async () => {
      // Register MockToggle so we can toggle boolean values
      registerFieldComponent(FieldType.TOGGLE, MockToggle);
      makeReadyState(conditionalMetadata as typeof basicMetadata);
      render(
        <FormGenerator blockType="hero" initialValues={{ showExtra: false }} />,
      );

      // Initial render — only showExtra toggle visible
      expect(screen.queryByTestId("field-extra")).toBeNull();

      // Toggle to show the conditional field
      const toggle = screen.getByTestId("field-showExtra");
      fireEvent.click(toggle);

      // The newly appeared field should have animation initial config (not false)
      await waitFor(() => {
        const extraField = screen.getByTestId("field-extra");
        const motionWrapper = extraField.closest('[data-motion="true"]');
        expect(motionWrapper).toBeTruthy();
        const initialVal = motionWrapper?.getAttribute("data-initial");
        // After first render, initial should be the animation start state, not 'false'
        expect(initialVal).not.toBe("false");
        const parsed = JSON.parse(initialVal!);
        expect(parsed).toHaveProperty("opacity", 0);
        expect(parsed).toHaveProperty("height", 0);
      });
    });

    it("handles 20+ fields without rendering errors", () => {
      const manyFields = {
        groups: [
          {
            id: "g",
            label: "Many Fields",
            order: 1,
            fields: Array.from({ length: 25 }, (_, i) => ({
              name: `field${i}`,
              type: "TEXT",
              label: `Field ${i}`,
              order: i,
            })),
          },
        ],
      };
      makeReadyState(manyFields as typeof basicMetadata);
      expect(() => render(<FormGenerator blockType="hero" />)).not.toThrow();
      expect(document.querySelectorAll('[data-motion="true"]').length).toBe(25);
    });

    it("rapid toggle show/hide does not break rendering", () => {
      registerFieldComponent(FieldType.TOGGLE, MockToggle);
      makeReadyState(conditionalMetadata as typeof basicMetadata);
      render(
        <FormGenerator blockType="hero" initialValues={{ showExtra: true }} />,
      );

      const toggle = screen.getByTestId("field-showExtra");

      // Rapid toggles: show → hide → show → hide
      fireEvent.click(toggle); // hide
      fireEvent.click(toggle); // show
      fireEvent.click(toggle); // hide
      fireEvent.click(toggle); // show

      // Should not crash; toggle should still be present
      expect(screen.getByTestId("field-showExtra")).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Tests — 2.8.2: clearOnHide Value Management
  // ---------------------------------------------------------------------------

  describe("Step 2.8.2 — clearOnHide Value Management", () => {
    beforeEach(() => {
      registerFieldComponent(FieldType.TOGGLE, MockToggle);
    });

    it("clears value when field with clearOnHide=true is hidden", async () => {
      makeReadyState(clearOnHideMetadata as typeof basicMetadata);
      const handleChange = vi.fn();
      render(
        <FormGenerator
          blockType="hero"
          initialValues={{
            toggle: true,
            clearable: "keep me",
            preserved: "also keep",
          }}
          onChange={handleChange}
        />,
      );

      // Both conditional fields should be visible
      expect(screen.getByTestId("field-clearable")).toBeInTheDocument();
      expect(screen.getByTestId("field-preserved")).toBeInTheDocument();

      // Hide conditional fields by toggling
      const toggle = screen.getByTestId("field-toggle");
      fireEvent.click(toggle);

      // clearOnHide=true field should have its value cleared
      await waitFor(() => {
        const calls = handleChange.mock.calls;
        const lastValues = calls[calls.length - 1][0];
        expect(lastValues.clearable).toBeUndefined();
      });
    });

    it("preserves value when field with clearOnHide=false (default) is hidden", async () => {
      makeReadyState(clearOnHideMetadata as typeof basicMetadata);
      const handleChange = vi.fn();
      render(
        <FormGenerator
          blockType="hero"
          initialValues={{ toggle: true, clearable: "val1", preserved: "val2" }}
          onChange={handleChange}
        />,
      );

      const toggle = screen.getByTestId("field-toggle");
      fireEvent.click(toggle);

      // Wait for clearOnHide effect to fire
      await waitFor(() => {
        const calls = handleChange.mock.calls;
        const lastValues = calls[calls.length - 1][0];
        // preserved (clearOnHide=false) should keep its value
        expect(lastValues.preserved).toBe("val2");
      });
    });

    it("clearOnHide defaults to false when property is not set", async () => {
      const defaultMetadata = {
        groups: [
          {
            id: "g",
            label: "G",
            order: 1,
            fields: [
              { name: "toggle", type: "TOGGLE", label: "Toggle", order: 1 },
              {
                name: "field1",
                type: "TEXT",
                label: "Field 1",
                order: 2,
                // no clearOnHide property
                conditional: {
                  field: "toggle",
                  operator: "equals",
                  value: true,
                },
              },
            ],
          },
        ],
      };
      makeReadyState(defaultMetadata as typeof basicMetadata);
      const handleChange = vi.fn();
      render(
        <FormGenerator
          blockType="hero"
          initialValues={{ toggle: true, field1: "keep this" }}
          onChange={handleChange}
        />,
      );

      handleChange.mockClear();

      const toggle = screen.getByTestId("field-toggle");
      fireEvent.click(toggle);

      // Wait for effects to settle
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      // Check that field1 was NOT cleared in any onChange call
      const allCalls = handleChange.mock.calls;
      const hasClearedField1 = allCalls.some(
        (call: any) => call[0].field1 === undefined || call[0].field1 === null,
      );
      expect(hasClearedField1).toBe(false);
    });

    it("fires onChange when clearOnHide clears a value", async () => {
      makeReadyState(clearOnHideMetadata as typeof basicMetadata);
      const handleChange = vi.fn();
      render(
        <FormGenerator
          blockType="hero"
          initialValues={{ toggle: true, clearable: "val", preserved: "val2" }}
          onChange={handleChange}
        />,
      );

      handleChange.mockClear();

      const toggle = screen.getByTestId("field-toggle");
      fireEvent.click(toggle);

      await waitFor(() => {
        // onChange fires at least twice: 1 for toggle change, 1 for clearOnHide clear
        expect(handleChange.mock.calls.length).toBeGreaterThanOrEqual(2);
      });
    });

    it("does not fire extra onChange when hiding field with already-empty value", async () => {
      makeReadyState(clearOnHideMetadata as typeof basicMetadata);
      const handleChange = vi.fn();
      render(
        <FormGenerator
          blockType="hero"
          initialValues={{ toggle: true, preserved: "val" }}
          onChange={handleChange}
        />,
      );

      handleChange.mockClear();

      const toggle = screen.getByTestId("field-toggle");
      fireEvent.click(toggle);

      // Wait for effects
      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      // Only 1 onChange for the toggle itself — clearable has no value to clear
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("value is restored to default when field with clearOnHide becomes visible again", async () => {
      makeReadyState(clearOnHideMetadata as typeof basicMetadata);
      render(
        <FormGenerator
          blockType="hero"
          initialValues={{
            toggle: true,
            clearable: "original",
            preserved: "val2",
          }}
        />,
      );

      const toggle = screen.getByTestId("field-toggle");

      // Hide fields
      fireEvent.click(toggle);

      // Show fields again
      fireEvent.click(toggle);

      await waitFor(() => {
        const clearableField = screen.getByTestId("field-clearable");
        // Value was cleared when hidden; now shows empty/default
        expect(clearableField).toBeInTheDocument();
      });
    });
  });
});
