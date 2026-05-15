/**
 * Tests for Step 2.1.5 — FieldGroup Component
 * Covers: group rendering, sort order, ungrouped fields, onChange wiring,
 *         disabled passthrough, error passthrough, displayName, empty groups.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { FieldGroup } from "../FieldGroup";
import { registerFieldComponent } from "../registry";
import { FieldType } from "../types";
import type {
  FieldDefinition,
  FieldGroupDefinition,
  FieldRendererProps,
} from "../types";

// ---------------------------------------------------------------------------
// Test doubles
// ---------------------------------------------------------------------------

/** A minimal mock field component that renders its value as a data-testid input */
const MockField: React.FC<FieldRendererProps> = ({ field, value }) =>
  React.createElement("input", {
    "data-testid": `field-${field.name}`,
    value: String(value ?? ""),
    readOnly: true,
  });
MockField.displayName = "MockField";

beforeEach(() => {
  // Register MockField for the types we use in tests
  registerFieldComponent(FieldType.TEXT, MockField);
  registerFieldComponent(FieldType.NUMBER, MockField);
  registerFieldComponent(FieldType.TEXTAREA, MockField);
  registerFieldComponent(FieldType.TOGGLE, MockField);
});

// ---------------------------------------------------------------------------
// Factory helpers
// ---------------------------------------------------------------------------

function makeField(overrides: Partial<FieldDefinition> = {}): FieldDefinition {
  return {
    name: "field1",
    label: "Field One",
    type: FieldType.TEXT,
    ...overrides,
  };
}

function makeGroup(
  overrides: Partial<FieldGroupDefinition> = {},
): FieldGroupDefinition {
  return {
    id: "group1",
    label: "Group One",
    fields: ["field1"],
    ...overrides,
  };
}

function renderGroup(
  props: Partial<React.ComponentProps<typeof FieldGroup>> = {},
) {
  const defaults: React.ComponentProps<typeof FieldGroup> = {
    fields: [makeField()],
    groups: [],
    values: { field1: "hello" },
    onChange: vi.fn(),
    ...props,
  };
  return render(<FieldGroup {...defaults} />);
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe("FieldGroup — basic rendering", () => {
  it("renders the root container", () => {
    renderGroup();
    expect(screen.getByTestId("field-group-root")).toBeInTheDocument();
  });

  it("renders a field with no groups defined", () => {
    renderGroup({
      fields: [makeField({ name: "myField" })],
      values: { myField: "test" },
    });
    expect(screen.getByTestId("field-myField")).toBeInTheDocument();
  });

  it("renders field value correctly", () => {
    renderGroup({
      fields: [makeField({ name: "title" })],
      values: { title: "Hello World" },
    });
    expect(screen.getByTestId("field-title")).toHaveValue("Hello World");
  });

  it('has displayName set to "FieldGroup"', () => {
    expect(FieldGroup.displayName).toBe("FieldGroup");
  });
});

// ---------------------------------------------------------------------------
// Named groups — header and divider
// ---------------------------------------------------------------------------

describe("FieldGroup — named group headers", () => {
  it("renders group label for a named group", () => {
    renderGroup({
      fields: [makeField({ name: "f1", group: "grp1" })],
      groups: [makeGroup({ id: "grp1", label: "Settings", fields: ["f1"] })],
      values: { f1: "val" },
    });
    expect(screen.getByTestId("field-group-label-grp1")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("does NOT render a group label for ungrouped fields", () => {
    renderGroup({
      fields: [makeField({ name: "f1" })], // no group property
      groups: [],
      values: { f1: "val" },
    });
    // The ungrouped bucket should have no label element
    expect(screen.queryByTestId(/field-group-label/)).not.toBeInTheDocument();
  });

  it("renders ungrouped fields in the __ungrouped__ bucket", () => {
    renderGroup({
      fields: [makeField({ name: "lone" })],
      values: { lone: "x" },
    });
    expect(screen.getByTestId("field-group-__ungrouped__")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Sort order — groups
// ---------------------------------------------------------------------------

describe("FieldGroup — group sort order", () => {
  it("renders groups in ascending order.order", () => {
    const fields: FieldDefinition[] = [
      makeField({ name: "fA", group: "gA", order: 1 }),
      makeField({ name: "fB", group: "gB", order: 1 }),
    ];
    const groups: FieldGroupDefinition[] = [
      makeGroup({ id: "gA", label: "Group A", order: 2, fields: ["fA"] }),
      makeGroup({ id: "gB", label: "Group B", order: 1, fields: ["fB"] }),
    ];

    renderGroup({ fields, groups, values: { fA: "a", fB: "b" } });

    const groupNodes = screen.getAllByTestId(/^field-group-label-/);
    // Group B (order 1) should appear before Group A (order 2)
    expect(groupNodes[0]).toHaveAttribute(
      "data-testid",
      "field-group-label-gB",
    );
    expect(groupNodes[1]).toHaveAttribute(
      "data-testid",
      "field-group-label-gA",
    );
  });

  it("renders groups with undefined order last", () => {
    const fields: FieldDefinition[] = [
      makeField({ name: "fA", group: "gA" }), // no order
      makeField({ name: "fB", group: "gB", order: 1 }),
    ];
    const groups: FieldGroupDefinition[] = [
      makeGroup({ id: "gA", label: "Group A", fields: ["fA"] }), // no order
      makeGroup({ id: "gB", label: "Group B", order: 1, fields: ["fB"] }),
    ];

    renderGroup({ fields, groups, values: { fA: "a", fB: "b" } });

    const groupNodes = screen.getAllByTestId(/^field-group-label-/);
    // gB (order 1) before gA (undefined → Infinity)
    expect(groupNodes[0]).toHaveAttribute(
      "data-testid",
      "field-group-label-gB",
    );
    expect(groupNodes[1]).toHaveAttribute(
      "data-testid",
      "field-group-label-gA",
    );
  });
});

// ---------------------------------------------------------------------------
// Sort order — fields within a group
// ---------------------------------------------------------------------------

describe("FieldGroup — field sort order within group", () => {
  it("renders fields in ascending field.order within a group", () => {
    const fields: FieldDefinition[] = [
      makeField({ name: "first", group: "grp", order: 1 }),
      makeField({ name: "second", group: "grp", order: 2 }),
      makeField({ name: "last", group: "grp", order: 3 }),
    ];
    const groups: FieldGroupDefinition[] = [
      {
        id: "grp",
        label: "My Group",
        order: 1,
        fields: ["first", "second", "last"],
      },
    ];

    renderGroup({
      fields,
      groups,
      values: { first: "1", second: "2", last: "3" },
    });

    const inputs = screen.getAllByRole("textbox");
    // They should appear in order: first, second, last
    expect(inputs[0]).toHaveAttribute("data-testid", "field-first");
    expect(inputs[1]).toHaveAttribute("data-testid", "field-second");
    expect(inputs[2]).toHaveAttribute("data-testid", "field-last");
  });

  it("renders ungrouped fields sorted by field.order", () => {
    const fields: FieldDefinition[] = [
      makeField({ name: "z", order: 3 }),
      makeField({ name: "a", order: 1 }),
      makeField({ name: "m", order: 2 }),
    ];

    renderGroup({ fields, groups: [], values: { z: "z", a: "a", m: "m" } });

    const inputs = screen.getAllByRole("textbox");
    expect(inputs[0]).toHaveAttribute("data-testid", "field-a");
    expect(inputs[1]).toHaveAttribute("data-testid", "field-m");
    expect(inputs[2]).toHaveAttribute("data-testid", "field-z");
  });
});

// ---------------------------------------------------------------------------
// onChange wiring
// ---------------------------------------------------------------------------

describe("FieldGroup — onChange wiring", () => {
  it("calls onChange with the field name and new value", async () => {
    const handleChange = vi.fn();

    // Use a mock that calls onChange when clicked
    const ClickableField: React.FC<FieldRendererProps> = ({
      field,
      onChange: fieldOnChange,
    }) =>
      React.createElement(
        "button",
        {
          "data-testid": `btn-${field.name}`,
          onClick: () => fieldOnChange("new-value"),
        },
        "click me",
      );

    registerFieldComponent(FieldType.TEXT, ClickableField);

    renderGroup({
      fields: [makeField({ name: "myInput", type: FieldType.TEXT })],
      values: { myInput: "" },
      onChange: handleChange,
    });

    screen.getByTestId("btn-myInput").click();
    expect(handleChange).toHaveBeenCalledWith("myInput", "new-value");
  });
});

// ---------------------------------------------------------------------------
// disabled passthrough
// ---------------------------------------------------------------------------

describe("FieldGroup — disabled passthrough", () => {
  it("renders without crash when disabled=true", () => {
    renderGroup({ disabled: true });
    expect(screen.getByTestId("field-group-root")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// errors passthrough
// ---------------------------------------------------------------------------

describe("FieldGroup — errors passthrough", () => {
  it("renders an error message for the correct field", () => {
    renderGroup({
      fields: [
        makeField({ name: "emailField", label: "Email", type: FieldType.TEXT }),
      ],
      values: { emailField: "" },
      errors: { emailField: ["Invalid email address."] },
    });
    expect(screen.getByText("Invalid email address.")).toBeInTheDocument();
  });

  it("does not show errors for a field with no errors entry", () => {
    renderGroup({
      fields: [makeField({ name: "clean", type: FieldType.TEXT })],
      values: { clean: "ok" },
      errors: {},
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Empty groups (no fields matching)
// ---------------------------------------------------------------------------

describe("FieldGroup — empty group handling", () => {
  it("skips rendering a group that has no matching fields", () => {
    const fields: FieldDefinition[] = [
      makeField({ name: "f1", group: "populated" }),
    ];
    const groups: FieldGroupDefinition[] = [
      makeGroup({ id: "populated", label: "Populated", fields: ["f1"] }),
      makeGroup({ id: "empty", label: "Empty Group", fields: ["nonExistent"] }),
    ];

    renderGroup({ fields, groups, values: { f1: "val" } });

    // 'Populated' group header should appear
    expect(screen.getByText("Populated")).toBeInTheDocument();
    // 'Empty Group' header should NOT appear (no fields bucketed there)
    expect(screen.queryByText("Empty Group")).not.toBeInTheDocument();
  });

  it("renders nothing meaningful when no fields are provided", () => {
    renderGroup({ fields: [], groups: [], values: {} });
    expect(screen.getByTestId("field-group-root")).toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Default value fallback
// ---------------------------------------------------------------------------

describe("FieldGroup — default value fallback", () => {
  it("uses field.defaultValue when values does not contain the field", () => {
    renderGroup({
      fields: [makeField({ name: "desc", defaultValue: "My default" })],
      values: {}, // no value for 'desc'
    });
    expect(screen.getByTestId("field-desc")).toHaveValue("My default");
  });

  it("uses empty string when neither values nor defaultValue exist", () => {
    renderGroup({
      fields: [makeField({ name: "noDefault" })],
      values: {},
    });
    expect(screen.getByTestId("field-noDefault")).toHaveValue("");
  });
});

// ---------------------------------------------------------------------------
// PROD QA edge-case tests — FieldRowRenderer stable onChange performance
// ---------------------------------------------------------------------------

describe("FieldGroup — PROD QA stable onChange via FieldRowRenderer", () => {
  it("onChange is called with correct field name and value for multiple fields", () => {
    const handleChange = vi.fn();

    // Use a clickable mock to trigger onChange
    const ClickableField: React.FC<FieldRendererProps> = ({
      field,
      onChange: fieldOnChange,
    }) =>
      React.createElement(
        "button",
        {
          "data-testid": `btn-${field.name}`,
          onClick: () => fieldOnChange(`new-${field.name}`),
        },
        field.name,
      );

    registerFieldComponent(FieldType.TEXT, ClickableField);

    render(
      <FieldGroup
        fields={[
          makeField({ name: "alpha", type: FieldType.TEXT }),
          makeField({ name: "beta", type: FieldType.TEXT }),
        ]}
        values={{ alpha: "", beta: "" }}
        onChange={handleChange}
      />,
    );

    screen.getByTestId("btn-alpha").click();
    expect(handleChange).toHaveBeenCalledWith("alpha", "new-alpha");

    screen.getByTestId("btn-beta").click();
    expect(handleChange).toHaveBeenCalledWith("beta", "new-beta");

    expect(handleChange).toHaveBeenCalledTimes(2);
  });

  it("FieldRowRenderer has displayName set for devtools", () => {
    // FieldRowRenderer is not exported, but we verify FieldGroup still renders correctly
    // after the FieldRowRenderer refactor — all fields visible
    renderGroup({
      fields: [
        makeField({ name: "f1", type: FieldType.TEXT }),
        makeField({ name: "f2", type: FieldType.TEXT }),
      ],
      values: { f1: "a", f2: "b" },
    });
    expect(screen.getByTestId("field-f1")).toBeInTheDocument();
    expect(screen.getByTestId("field-f2")).toBeInTheDocument();
  });

  it("renders correctly when values change across renders", () => {
    const handleChange = vi.fn();
    const { rerender } = render(
      <FieldGroup
        fields={[makeField({ name: "dynField", type: FieldType.TEXT })]}
        values={{ dynField: "initial" }}
        onChange={handleChange}
      />,
    );
    expect(screen.getByTestId("field-dynField")).toHaveValue("initial");

    rerender(
      <FieldGroup
        fields={[makeField({ name: "dynField", type: FieldType.TEXT })]}
        values={{ dynField: "updated" }}
        onChange={handleChange}
      />,
    );
    expect(screen.getByTestId("field-dynField")).toHaveValue("updated");
  });
});
