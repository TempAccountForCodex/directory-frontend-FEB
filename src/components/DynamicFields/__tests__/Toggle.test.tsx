/**
 * Tests for Step 2.4.2 — Toggle Component
 * Covers: rendering, click toggles value, visual state, label display,
 *         undefined/null → false, disabled state, ARIA role, labelPlacement,
 *         React.memo displayName.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom/vitest";

// Import Toggle — also calls registerFieldComponent(FieldType.TOGGLE, Toggle)
import { Toggle } from "../fields/Toggle";
import type { FieldDefinition } from "../types";
import { FieldType } from "../types";

// ---------------------------------------------------------------------------
// Field factory helper
// ---------------------------------------------------------------------------

const makeField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition =>
  ({
    name: "active",
    type: FieldType.TOGGLE,
    label: "Active",
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
  label?: string;
  labelPlacement?: "start" | "end";
}

function renderToggle(props: RenderProps = {}) {
  const {
    field = makeField(),
    value = false,
    onChange = vi.fn(),
    disabled = false,
    errors = [],
    label,
    labelPlacement,
  } = props;

  return render(
    <Toggle
      field={field}
      value={value}
      onChange={onChange}
      disabled={disabled}
      errors={errors}
      label={label}
      labelPlacement={labelPlacement}
    />,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Toggle — rendering", () => {
  it("renders with label from field.label", () => {
    renderToggle({ field: makeField({ label: "Enable Notifications" }) });
    expect(screen.getByText("Enable Notifications")).toBeInTheDocument();
  });

  it("renders with explicit label prop overriding field.label", () => {
    renderToggle({
      field: makeField({ label: "Field Label" }),
      label: "Override Label",
    });
    expect(screen.getByText("Override Label")).toBeInTheDocument();
    expect(screen.queryByText("Field Label")).not.toBeInTheDocument();
  });

  it("renders a switch element", () => {
    renderToggle();
    // MUI Switch renders a checkbox input internally
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeInTheDocument();
  });
});

describe("Toggle — visual state", () => {
  it("switch is checked when value=true", () => {
    renderToggle({ value: true });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("switch is unchecked when value=false", () => {
    renderToggle({ value: false });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("switch is unchecked when value=undefined (defaults to false)", () => {
    renderToggle({ value: undefined });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });

  it("switch is unchecked when value=null (defaults to false)", () => {
    renderToggle({ value: null });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });
});

describe("Toggle — click toggles value", () => {
  it("calls onChange with true when toggled on from false", async () => {
    const onChange = vi.fn();
    renderToggle({ value: false, onChange });

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it("calls onChange with false when toggled off from true", async () => {
    const onChange = vi.fn();
    renderToggle({ value: true, onChange });

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(false);
  });

  it("calls onChange with boolean, not the event object", async () => {
    const onChange = vi.fn();
    renderToggle({ value: false, onChange });

    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);

    const calledWith = onChange.mock.calls[0][0];
    expect(typeof calledWith).toBe("boolean");
  });
});

describe("Toggle — disabled state", () => {
  it("is disabled when disabled=true", () => {
    renderToggle({ disabled: true });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeDisabled();
  });

  it("is enabled when disabled=false", () => {
    renderToggle({ disabled: false });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeDisabled();
  });

  it("switch has disabled attribute when disabled=true, preventing interaction", () => {
    const onChange = vi.fn();
    renderToggle({ disabled: true, value: false, onChange });

    const checkbox = screen.getByRole("checkbox");
    // Disabled switch has pointer-events:none (MUI CSS) AND the disabled attribute.
    // The disabled attribute is what prevents browser interaction; JSDOM bypasses
    // CSS pointer-events, so we verify the attribute directly.
    expect(checkbox).toBeDisabled();
    // Additionally verify onChange was never called prior to any interaction
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("Toggle — ARIA role", () => {
  it("has ARIA role checkbox (MUI Switch internal role)", () => {
    renderToggle();
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
  });

  it("aria-checked is true when value=true", () => {
    renderToggle({ value: true });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toBeChecked();
  });

  it("aria-checked is false when value=false", () => {
    renderToggle({ value: false });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toBeChecked();
  });
});

describe("Toggle — labelPlacement", () => {
  it('renders without error when labelPlacement="start"', () => {
    expect(() => {
      renderToggle({ labelPlacement: "start" });
    }).not.toThrow();
  });

  it('renders without error when labelPlacement="end"', () => {
    expect(() => {
      renderToggle({ labelPlacement: "end" });
    }).not.toThrow();
  });

  it("renders without error when labelPlacement is not provided", () => {
    expect(() => {
      renderToggle();
    }).not.toThrow();
  });
});

describe("Toggle — React.memo", () => {
  it('has displayName of "Toggle"', () => {
    expect(Toggle.displayName).toBe("Toggle");
  });
});
