/**
 * Tests for Toggle error display (step 2.7.2)
 * Covers: errors prop display, aria-invalid, aria-describedby, multiple errors, no errors baseline.
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import { Toggle } from "../Toggle";
import type { FieldDefinition } from "../../types";
import { FieldType } from "../../types";

const makeField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition =>
  ({
    name: "active",
    type: FieldType.TOGGLE,
    label: "Active",
    ...overrides,
  }) as unknown as FieldDefinition;

interface RenderProps {
  field?: FieldDefinition;
  value?: unknown;
  onChange?: (v: unknown) => void;
  disabled?: boolean;
  errors?: string[];
}

function renderToggle(props: RenderProps = {}) {
  const {
    field = makeField(),
    value = false,
    onChange = vi.fn(),
    disabled = false,
    errors = [],
  } = props;

  return render(
    <Toggle
      field={field}
      value={value}
      onChange={onChange}
      disabled={disabled}
      errors={errors}
    />,
  );
}

describe("Toggle — error display", () => {
  it("shows single error message when errors=[one]", () => {
    renderToggle({ errors: ["This field is required"] });
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("shows multiple error messages when errors=[two]", () => {
    renderToggle({ errors: ["Error one", "Error two"] });
    expect(screen.getByText("Error one")).toBeInTheDocument();
    expect(screen.getByText("Error two")).toBeInTheDocument();
  });

  it("sets aria-invalid on switch when errors present", () => {
    renderToggle({ errors: ["Required"] });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
  });

  it("does NOT set aria-invalid when no errors", () => {
    renderToggle({ errors: [] });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toHaveAttribute("aria-invalid");
  });

  it("sets aria-describedby on switch when errors present", () => {
    renderToggle({ errors: ["Required"] });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).toHaveAttribute("aria-describedby");
  });

  it("does NOT set aria-describedby when no errors", () => {
    renderToggle({ errors: [] });
    const checkbox = screen.getByRole("checkbox");
    expect(checkbox).not.toHaveAttribute("aria-describedby");
  });

  it("renders no error elements when errors=[]", () => {
    const { container } = renderToggle({ errors: [] });
    const helperTexts = container.querySelectorAll(".MuiFormHelperText-root");
    expect(helperTexts).toHaveLength(0);
  });

  it("renders normally (switch + label) when no errors", () => {
    renderToggle({ errors: [] });
    expect(screen.getByRole("checkbox")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});
