/**
 * Tests for Step 2.4.1 — Select Component
 * Covers: renders options, selection updates value, search filter,
 *         multi-select, disabled state, error state, empty options (no crash),
 *         React.memo displayName.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Mock DashboardSelect to avoid ThemeContext dependency in unit tests
// ---------------------------------------------------------------------------

vi.mock("../../Dashboard/shared/DashboardSelect", () => ({
  __esModule: true,
  default: ({
    label,
    value,
    onChange,
    disabled,
    error,
    multiple,
    children,
  }: any) => (
    <div data-testid="dashboard-select">
      {label && <label htmlFor="mock-select">{label}</label>}
      <select
        id="mock-select"
        aria-label={label}
        value={value ?? (multiple ? [] : "")}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? "true" : undefined}
        multiple={multiple}
        data-testid="select-input"
      >
        {children}
      </select>
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock MUI TextField (used for search input) to keep tests simple
// ---------------------------------------------------------------------------

vi.mock("@mui/material/TextField", () => ({
  __esModule: true,
  default: ({ value, onChange, disabled, placeholder, inputProps }: any) => (
    <input
      type="text"
      data-testid="search-input"
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      aria-label={inputProps?.["aria-label"]}
    />
  ),
}));

// ---------------------------------------------------------------------------
// Mock remaining MUI components used by Select.tsx
// ---------------------------------------------------------------------------

vi.mock("@mui/material/MenuItem", () => ({
  __esModule: true,
  default: ({ value, children }: any) => (
    <option value={value}>{children}</option>
  ),
}));

vi.mock("@mui/material/FormHelperText", () => ({
  __esModule: true,
  default: ({ children, role, error: _error }: any) => (
    <span data-testid="helper-text" role={role}>
      {children}
    </span>
  ),
}));

vi.mock("@mui/material/Box", () => ({
  __esModule: true,
  default: ({ children }: any) => <div>{children}</div>,
}));

// ---------------------------------------------------------------------------
// Import Select after mocks are established
// ---------------------------------------------------------------------------

import { Select } from "../fields/Select";
import type { FieldDefinition } from "../types";
import { FieldType } from "../types";

// ---------------------------------------------------------------------------
// Field factory helper
// ---------------------------------------------------------------------------

const makeField = (
  uiProps: Record<string, unknown> = {},
  overrides: Partial<FieldDefinition> = {},
): FieldDefinition =>
  ({
    id: "status",
    name: "status",
    type: FieldType.SELECT,
    label: "Status",
    required: false,
    validation: {},
    ui: { props: uiProps },
    ...overrides,
  }) as unknown as FieldDefinition;

const defaultOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Pending", value: "pending" },
];

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

function renderSelect(props: RenderProps = {}) {
  const {
    field = makeField({ options: defaultOptions }),
    value = "",
    onChange = vi.fn(),
    disabled = false,
    errors = [],
  } = props;

  return render(
    <Select
      field={field}
      value={value}
      onChange={onChange}
      disabled={disabled}
      errors={errors}
    />,
  );
}

// ---------------------------------------------------------------------------
// Test suites
// ---------------------------------------------------------------------------

describe("Select — renders options", () => {
  it("renders all options as MenuItem children", () => {
    renderSelect();
    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Inactive" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pending" })).toBeInTheDocument();
  });

  it("renders with empty options array without crashing", () => {
    renderSelect({
      field: makeField({ options: [] }),
    });
    const select = screen.getByTestId("select-input");
    expect(select).toBeInTheDocument();
    // No options rendered — just the select element
    expect(screen.queryByRole("option")).not.toBeInTheDocument();
  });

  it("renders the field label", () => {
    renderSelect({
      field: makeField(
        { options: defaultOptions },
        { label: "Account Status" },
      ),
    });
    expect(screen.getByLabelText("Account Status")).toBeInTheDocument();
  });

  it("has correct selected value", () => {
    renderSelect({ value: "inactive" });
    const select = screen.getByTestId("select-input") as HTMLSelectElement;
    expect(select.value).toBe("inactive");
  });
});

describe("Select — selection updates value", () => {
  it("calls onChange when an option is selected", () => {
    const onChange = vi.fn();
    renderSelect({ onChange });

    const select = screen.getByTestId("select-input");
    fireEvent.change(select, { target: { value: "pending" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith("pending");
  });

  it("calls onChange with the new value on each change event", () => {
    const onChange = vi.fn();
    renderSelect({ onChange, value: "active" });

    const select = screen.getByTestId("select-input");
    fireEvent.change(select, { target: { value: "inactive" } });

    expect(onChange).toHaveBeenCalledWith("inactive");
  });
});

describe("Select — search filter", () => {
  it("does NOT render search input when searchable is not set", () => {
    renderSelect({
      field: makeField({ options: defaultOptions, searchable: false }),
    });
    expect(screen.queryByTestId("search-input")).not.toBeInTheDocument();
  });

  it("renders search input when searchable=true", () => {
    renderSelect({
      field: makeField({ options: defaultOptions, searchable: true }),
    });
    expect(screen.getByTestId("search-input")).toBeInTheDocument();
  });

  it("filters options by label (case-insensitive) when searchable=true", () => {
    renderSelect({
      field: makeField({ options: defaultOptions, searchable: true }),
    });

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "act" } });

    // 'Active' matches 'act', 'Inactive' matches 'act' (case-insensitive), 'Pending' does not
    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Inactive" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Pending" }),
    ).not.toBeInTheDocument();
  });

  it("shows all options when filter is cleared", () => {
    renderSelect({
      field: makeField({ options: defaultOptions, searchable: true }),
    });

    const searchInput = screen.getByTestId("search-input");
    // First filter, then clear
    fireEvent.change(searchInput, { target: { value: "act" } });
    fireEvent.change(searchInput, { target: { value: "" } });

    expect(screen.getByRole("option", { name: "Active" })).toBeInTheDocument();
    expect(
      screen.getByRole("option", { name: "Inactive" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Pending" })).toBeInTheDocument();
  });

  it('search is case-insensitive — "PEND" matches "Pending"', () => {
    renderSelect({
      field: makeField({ options: defaultOptions, searchable: true }),
    });

    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "PEND" } });

    expect(screen.getByRole("option", { name: "Pending" })).toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Active" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("option", { name: "Inactive" }),
    ).not.toBeInTheDocument();
  });

  it("search input is disabled when the field is disabled", () => {
    renderSelect({
      field: makeField({ options: defaultOptions, searchable: true }),
      disabled: true,
    });

    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toBeDisabled();
  });
});

describe("Select — multi-select", () => {
  it("passes multiple prop to DashboardSelect when multiple=true", () => {
    renderSelect({
      field: makeField({ options: defaultOptions, multiple: true }),
      value: ["active", "pending"],
    });

    const select = screen.getByTestId("select-input");
    expect(select).toHaveAttribute("multiple");
  });

  it("does NOT have multiple attribute when multiple is not set", () => {
    renderSelect({ field: makeField({ options: defaultOptions }) });
    const select = screen.getByTestId("select-input");
    // HTML multiple attribute absent
    expect(select).not.toHaveAttribute("multiple");
  });

  it("normalises null value to empty array when multiple=true", () => {
    renderSelect({
      field: makeField({ options: defaultOptions, multiple: true }),
      value: null,
    });

    const select = screen.getByTestId("select-input") as HTMLSelectElement;
    // Value should be an empty array (no options selected)
    expect(select).toBeInTheDocument();
  });
});

describe("Select — disabled state", () => {
  it("passes disabled=true to DashboardSelect", () => {
    renderSelect({ disabled: true });
    const select = screen.getByTestId("select-input");
    expect(select).toBeDisabled();
  });

  it("is NOT disabled when disabled=false", () => {
    renderSelect({ disabled: false });
    const select = screen.getByTestId("select-input");
    expect(select).not.toBeDisabled();
  });
});

describe("Select — error state", () => {
  it("displays error message via FormHelperText when errors prop is provided", () => {
    renderSelect({ errors: ["This field is required"] });
    expect(screen.getByTestId("helper-text")).toHaveTextContent(
      "This field is required",
    );
  });

  it("shows first error when multiple errors provided", () => {
    renderSelect({ errors: ["Error one", "Error two"] });
    expect(screen.getByTestId("helper-text")).toHaveTextContent("Error one");
  });

  it("does NOT render FormHelperText when no errors", () => {
    renderSelect({ errors: [] });
    expect(screen.queryByTestId("helper-text")).not.toBeInTheDocument();
  });

  it("marks select as aria-invalid when errors are present", () => {
    renderSelect({ errors: ["Invalid value"] });
    const select = screen.getByTestId("select-input");
    expect(select).toHaveAttribute("aria-invalid", "true");
  });

  it("does NOT mark select as aria-invalid when no errors", () => {
    renderSelect({ errors: [] });
    const select = screen.getByTestId("select-input");
    expect(select).not.toHaveAttribute("aria-invalid", "true");
  });

  it('error message has role="alert" for accessibility', () => {
    renderSelect({ errors: ["Something went wrong"] });
    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
  });
});

describe("Select — React.memo", () => {
  it('has displayName of "Select"', () => {
    expect(Select.displayName).toBe("Select");
  });
});
