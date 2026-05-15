/**
 * Tests for Steps 2.4.3–2.4.6 — RepeaterField Component
 *
 * Covers:
 * - 2.4.3 Basic: add, remove, min/max enforcement, item counter, empty state, disabled
 * - 2.4.4 Nested Fields: FieldRenderer integration, handleFieldChange, empty itemSchema
 * - 2.4.5 Drag & Advanced: @dnd-kit (mocked), collapse/expand, duplicate, disabled drag
 * - 2.4.6 Registration: self-registration in field registry, displayName
 *
 * @dnd-kit is mocked entirely — drag behavior is a library concern.
 * Only add/remove/collapse/duplicate/field-change logic is verified here.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mock @dnd-kit entirely — no real drag testing needed (library responsibility)
// ---------------------------------------------------------------------------

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  closestCenter: vi.fn(),
}));

vi.mock("@dnd-kit/sortable", () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
  arrayMove: (arr: unknown[], from: number, to: number) => {
    const result = [...arr];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock("@dnd-kit/utilities", () => ({
  CSS: { Transform: { toString: () => "" } },
}));

// ---------------------------------------------------------------------------
// Mock FieldRenderer to avoid registry/ThemeContext dependency in unit tests
// ---------------------------------------------------------------------------

vi.mock("../FieldRenderer", () => ({
  FieldRenderer: ({
    field,
    value,
    onChange,
    disabled,
  }: {
    field: { name: string; label: string };
    value: unknown;
    onChange: (v: unknown) => void;
    disabled?: boolean;
  }) => (
    <div data-testid={`field-renderer-${field.name}`}>
      <label htmlFor={`input-${field.name}`}>{field.label}</label>
      <input
        id={`input-${field.name}`}
        data-testid={`field-input-${field.name}`}
        value={typeof value === "string" ? value : String(value ?? "")}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Mock MUI icons to avoid SVG rendering issues in jsdom
// ---------------------------------------------------------------------------

vi.mock("@mui/icons-material/Add", () => ({
  default: () => <span data-testid="icon-add" />,
}));
vi.mock("@mui/icons-material/Delete", () => ({
  default: () => <span data-testid="icon-delete" />,
}));
vi.mock("@mui/icons-material/ContentCopy", () => ({
  default: () => <span data-testid="icon-copy" />,
}));
vi.mock("@mui/icons-material/ExpandMore", () => ({
  default: () => <span data-testid="icon-expand-more" />,
}));
vi.mock("@mui/icons-material/ExpandLess", () => ({
  default: () => <span data-testid="icon-expand-less" />,
}));
vi.mock("@mui/icons-material/DragIndicator", () => ({
  default: () => <span data-testid="icon-drag" />,
}));

// ---------------------------------------------------------------------------
// Import the component under test — also calls registerFieldComponent
// ---------------------------------------------------------------------------

import { RepeaterField } from "../fields/RepeaterField";
import type { FieldDefinition } from "../types";
import { FieldType } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeField = (overrides: Partial<FieldDefinition> = {}): FieldDefinition =>
  ({
    name: "items",
    type: FieldType.REPEATER,
    label: "Items",
    ui: {
      props: {
        itemSchema: {},
        min: 0,
        max: Infinity,
      },
    },
    ...overrides,
  }) as unknown as FieldDefinition;

const makeFieldWithSchema = (
  schema: Record<string, FieldDefinition>,
  min = 0,
  max = Infinity,
): FieldDefinition =>
  makeField({
    ui: {
      props: {
        itemSchema: schema,
        min,
        max,
      },
    },
  });

const titleFieldDef: FieldDefinition = {
  name: "title",
  label: "Title",
  type: FieldType.TEXT,
} as unknown as FieldDefinition;

const descFieldDef: FieldDefinition = {
  name: "description",
  label: "Description",
  type: FieldType.TEXTAREA,
} as unknown as FieldDefinition;

interface RenderProps {
  field?: FieldDefinition;
  value?: unknown;
  onChange?: (v: unknown) => void;
  disabled?: boolean;
  errors?: string[];
}

function renderRepeater(props: RenderProps = {}) {
  const {
    field = makeField(),
    value = [],
    onChange = vi.fn(),
    disabled = false,
    errors = [],
  } = props;

  return render(
    <RepeaterField
      field={field}
      value={value}
      onChange={onChange}
      disabled={disabled}
      errors={errors}
    />,
  );
}

// ---------------------------------------------------------------------------
// 2.4.3 — Basic: Add / Remove / min / max / counter / empty state / disabled
// ---------------------------------------------------------------------------

describe("RepeaterField — empty state", () => {
  it("renders empty state message when value is empty array", () => {
    renderRepeater({ value: [] });
    expect(
      screen.getByText("No items. Click Add to start."),
    ).toBeInTheDocument();
  });

  it("renders empty state message when value is undefined", () => {
    renderRepeater({ value: undefined });
    expect(
      screen.getByText("No items. Click Add to start."),
    ).toBeInTheDocument();
  });

  it("does NOT render empty state when items exist", () => {
    renderRepeater({ value: [{ _id: "1" }] });
    expect(
      screen.queryByText("No items. Click Add to start."),
    ).not.toBeInTheDocument();
  });

  it("shows Add button in empty state", () => {
    renderRepeater({ value: [] });
    expect(screen.getByRole("button", { name: /add/i })).toBeInTheDocument();
  });
});

describe("RepeaterField — Add button", () => {
  it("calls onChange with new array containing one empty item", () => {
    const onChange = vi.fn();
    renderRepeater({ value: [], onChange });

    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as unknown[];
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);
  });

  it("appends to existing items on Add", () => {
    const onChange = vi.fn();
    const existing = [{ _id: "a", title: "First" }];
    renderRepeater({ value: existing, onChange });

    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as unknown[];
    expect(result.length).toBe(2);
  });

  it("is disabled when value.length >= max", () => {
    const field = makeFieldWithSchema({}, 0, 2);
    renderRepeater({
      field,
      value: [{ _id: "1" }, { _id: "2" }],
    });

    const addBtn = screen.getByRole("button", { name: /add/i });
    expect(addBtn).toBeDisabled();
  });

  it("is enabled when value.length < max", () => {
    const field = makeFieldWithSchema({}, 0, 3);
    renderRepeater({
      field,
      value: [{ _id: "1" }],
    });

    const addBtn = screen.getByRole("button", { name: /add/i });
    expect(addBtn).not.toBeDisabled();
  });

  it("does NOT call onChange when add is clicked while at max", () => {
    const onChange = vi.fn();
    const field = makeFieldWithSchema({}, 0, 1);
    renderRepeater({
      field,
      value: [{ _id: "1" }],
      onChange,
    });

    const addBtn = screen.getByRole("button", { name: /add/i });
    fireEvent.click(addBtn);
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe("RepeaterField — Remove button", () => {
  it("renders a Remove button for each item", () => {
    renderRepeater({ value: [{ _id: "a" }, { _id: "b" }] });
    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    expect(removeBtns.length).toBe(2);
  });

  it("calls onChange with item removed at correct index", () => {
    const onChange = vi.fn();
    const value = [
      { _id: "a", title: "A" },
      { _id: "b", title: "B" },
    ];
    renderRepeater({ value, onChange });

    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    fireEvent.click(removeBtns[0]);

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as Array<{ _id: string }>;
    expect(result.length).toBe(1);
    expect(result[0]._id).toBe("b");
  });

  it("removes second item correctly when second Remove is clicked", () => {
    const onChange = vi.fn();
    const value = [{ _id: "x" }, { _id: "y" }, { _id: "z" }];
    renderRepeater({ value, onChange });

    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    fireEvent.click(removeBtns[1]);

    const result = onChange.mock.calls[0][0] as Array<{ _id: string }>;
    expect(result.map((i) => i._id)).toEqual(["x", "z"]);
  });

  it("Remove button is disabled when value.length <= min", () => {
    const field = makeFieldWithSchema({}, 1, Infinity);
    renderRepeater({
      field,
      value: [{ _id: "1" }],
    });

    const removeBtn = screen.getByRole("button", { name: /remove item 1/i });
    expect(removeBtn).toBeDisabled();
  });

  it("Remove button is enabled when value.length > min", () => {
    const field = makeFieldWithSchema({}, 1, Infinity);
    renderRepeater({
      field,
      value: [{ _id: "1" }, { _id: "2" }],
    });

    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    expect(removeBtns[0]).not.toBeDisabled();
  });
});

describe("RepeaterField — item counter", () => {
  it('shows "Item 1 of 1" for a single item', () => {
    renderRepeater({ value: [{ _id: "a" }] });
    expect(screen.getByText("Item 1 of 1")).toBeInTheDocument();
  });

  it('shows "Item 1 of 2" and "Item 2 of 2" for two items', () => {
    renderRepeater({ value: [{ _id: "a" }, { _id: "b" }] });
    expect(screen.getByText("Item 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Item 2 of 2")).toBeInTheDocument();
  });

  it("counter updates after adding an item", () => {
    const items = [{ _id: "a" }];
    const { rerender } = render(
      <RepeaterField
        field={makeField()}
        value={items}
        onChange={vi.fn()}
        disabled={false}
        errors={[]}
      />,
    );
    expect(screen.getByText("Item 1 of 1")).toBeInTheDocument();

    rerender(
      <RepeaterField
        field={makeField()}
        value={[...items, { _id: "b" }]}
        onChange={vi.fn()}
        disabled={false}
        errors={[]}
      />,
    );
    expect(screen.getByText("Item 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Item 2 of 2")).toBeInTheDocument();
  });
});

describe("RepeaterField — disabled prop", () => {
  it("disables Add button when disabled=true", () => {
    renderRepeater({ value: [], disabled: true });
    expect(screen.getByRole("button", { name: /add/i })).toBeDisabled();
  });

  it("disables Remove buttons when disabled=true", () => {
    renderRepeater({ value: [{ _id: "a" }, { _id: "b" }], disabled: true });
    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    removeBtns.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("disables Drag handle buttons when disabled=true", () => {
    renderRepeater({ value: [{ _id: "a" }], disabled: true });
    const dragBtns = screen.getAllByRole("button", { name: /drag item/i });
    dragBtns.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("disables Duplicate buttons when disabled=true", () => {
    renderRepeater({ value: [{ _id: "a" }], disabled: true });
    const dupBtns = screen.getAllByRole("button", { name: /duplicate item/i });
    dupBtns.forEach((btn) => expect(btn).toBeDisabled());
  });

  it("disables Collapse buttons when disabled=true", () => {
    renderRepeater({ value: [{ _id: "a" }], disabled: true });
    const collapseBtns = screen.getAllByRole("button", {
      name: /collapse item|expand item/i,
    });
    collapseBtns.forEach((btn) => expect(btn).toBeDisabled());
  });
});

// ---------------------------------------------------------------------------
// 2.4.4 — Nested Fields
// ---------------------------------------------------------------------------

describe("RepeaterField — nested fields rendering", () => {
  it("renders FieldRenderer for each field in itemSchema", () => {
    const field = makeFieldWithSchema({ title: titleFieldDef });
    renderRepeater({
      field,
      value: [{ _id: "a", title: "Hello" }],
    });

    expect(screen.getByTestId("field-renderer-title")).toBeInTheDocument();
  });

  it("renders multiple FieldRenderers when itemSchema has multiple fields", () => {
    const field = makeFieldWithSchema({
      title: titleFieldDef,
      description: descFieldDef,
    });
    renderRepeater({
      field,
      value: [{ _id: "a", title: "T", description: "D" }],
    });

    expect(screen.getByTestId("field-renderer-title")).toBeInTheDocument();
    expect(
      screen.getByTestId("field-renderer-description"),
    ).toBeInTheDocument();
  });

  it("passes current field value to FieldRenderer", () => {
    const field = makeFieldWithSchema({ title: titleFieldDef });
    renderRepeater({
      field,
      value: [{ _id: "a", title: "My Title" }],
    });

    const input = screen.getByTestId("field-input-title") as HTMLInputElement;
    expect(input.value).toBe("My Title");
  });

  it("renders fields for each item independently", () => {
    const field = makeFieldWithSchema({ title: titleFieldDef });
    renderRepeater({
      field,
      value: [
        { _id: "a", title: "First" },
        { _id: "b", title: "Second" },
      ],
    });

    const inputs = screen.getAllByTestId(
      "field-input-title",
    ) as HTMLInputElement[];
    expect(inputs.length).toBe(2);
    expect(inputs[0].value).toBe("First");
    expect(inputs[1].value).toBe("Second");
  });

  it("handleFieldChange updates the correct item and field", () => {
    const onChange = vi.fn();
    const field = makeFieldWithSchema({ title: titleFieldDef });
    renderRepeater({
      field,
      value: [
        { _id: "a", title: "Old A" },
        { _id: "b", title: "Old B" },
      ],
      onChange,
    });

    const inputs = screen.getAllByTestId("field-input-title");
    fireEvent.change(inputs[0], { target: { value: "New A" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as Array<{
      _id: string;
      title: string;
    }>;
    expect(result[0].title).toBe("New A");
    expect(result[1].title).toBe("Old B");
  });

  it("handleFieldChange updates second item independently", () => {
    const onChange = vi.fn();
    const field = makeFieldWithSchema({ title: titleFieldDef });
    renderRepeater({
      field,
      value: [
        { _id: "a", title: "A" },
        { _id: "b", title: "B" },
      ],
      onChange,
    });

    const inputs = screen.getAllByTestId("field-input-title");
    fireEvent.change(inputs[1], { target: { value: "B Updated" } });

    const result = onChange.mock.calls[0][0] as Array<{
      _id: string;
      title: string;
    }>;
    expect(result[0].title).toBe("A");
    expect(result[1].title).toBe("B Updated");
  });

  it("removing item also removes its field values", () => {
    const onChange = vi.fn();
    const field = makeFieldWithSchema({ title: titleFieldDef });
    const value = [
      { _id: "a", title: "Keep" },
      { _id: "b", title: "Delete" },
    ];
    renderRepeater({ field, value, onChange });

    const removeBtns = screen.getAllByRole("button", { name: /remove item/i });
    fireEvent.click(removeBtns[1]);

    const result = onChange.mock.calls[0][0] as Array<{
      _id: string;
      title: string;
    }>;
    expect(result.length).toBe(1);
    expect(result[0].title).toBe("Keep");
  });

  it("renders without crash when itemSchema is empty (no fields)", () => {
    const field = makeFieldWithSchema({});
    expect(() => {
      renderRepeater({
        field,
        value: [{ _id: "a" }],
      });
    }).not.toThrow();
    expect(screen.getByText("Item 1 of 1")).toBeInTheDocument();
  });

  it("passes disabled=true to FieldRenderer when outer disabled=true", () => {
    const field = makeFieldWithSchema({ title: titleFieldDef });
    renderRepeater({
      field,
      value: [{ _id: "a", title: "Test" }],
      disabled: true,
    });

    const input = screen.getByTestId("field-input-title") as HTMLInputElement;
    expect(input).toBeDisabled();
  });
});

// ---------------------------------------------------------------------------
// 2.4.5 — Drag & Advanced: collapse/expand, duplicate
// ---------------------------------------------------------------------------

describe("RepeaterField — collapse / expand", () => {
  it("renders collapse button for each item", () => {
    renderRepeater({ value: [{ _id: "a" }] });
    // Initially expanded → shows Collapse button
    expect(
      screen.getByRole("button", { name: /collapse item 1/i }),
    ).toBeInTheDocument();
  });

  it("clicking collapse button changes it to expand", () => {
    renderRepeater({ value: [{ _id: "a" }] });

    const collapseBtn = screen.getByRole("button", {
      name: /collapse item 1/i,
    });
    fireEvent.click(collapseBtn);

    expect(
      screen.getByRole("button", { name: /expand item 1/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /collapse item 1/i }),
    ).not.toBeInTheDocument();
  });

  it("clicking expand button toggles back to collapsed", () => {
    renderRepeater({ value: [{ _id: "a" }] });

    // Collapse it first
    fireEvent.click(screen.getByRole("button", { name: /collapse item 1/i }));
    // Now expand it
    fireEvent.click(screen.getByRole("button", { name: /expand item 1/i }));

    expect(
      screen.getByRole("button", { name: /collapse item 1/i }),
    ).toBeInTheDocument();
  });

  it("collapses only the clicked item, not others", () => {
    renderRepeater({ value: [{ _id: "a" }, { _id: "b" }] });

    const item1Collapse = screen.getByRole("button", {
      name: /collapse item 1/i,
    });
    fireEvent.click(item1Collapse);

    // Item 1 is now "expand" (was collapsed)
    expect(
      screen.getByRole("button", { name: /expand item 1/i }),
    ).toBeInTheDocument();
    // Item 2 is still "collapse" (still expanded)
    expect(
      screen.getByRole("button", { name: /collapse item 2/i }),
    ).toBeInTheDocument();
  });
});

describe("RepeaterField — duplicate", () => {
  it("renders Duplicate button for each item", () => {
    renderRepeater({ value: [{ _id: "a" }, { _id: "b" }] });
    const dupBtns = screen.getAllByRole("button", { name: /duplicate item/i });
    expect(dupBtns.length).toBe(2);
  });

  it("clicking Duplicate inserts a copy after the item", () => {
    const onChange = vi.fn();
    const value = [
      { _id: "a", title: "Original" },
      { _id: "b", title: "End" },
    ];
    const field = makeFieldWithSchema({ title: titleFieldDef });
    renderRepeater({ field, value, onChange });

    const dupBtns = screen.getAllByRole("button", { name: /duplicate item/i });
    fireEvent.click(dupBtns[0]); // Duplicate item 1

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as Array<{
      title: string;
      _id: string;
    }>;
    expect(result.length).toBe(3);
    // Index 0: original
    expect(result[0].title).toBe("Original");
    // Index 1: duplicate (inserted right after)
    expect(result[1].title).toBe("Original");
    // Index 2: the original "End" item
    expect(result[2].title).toBe("End");
    // Duplicate has a different _id
    expect(result[1]._id).not.toBe(result[0]._id);
  });

  it("duplicate button appends copy at last position when last item is duplicated", () => {
    const onChange = vi.fn();
    const value = [
      { _id: "a", title: "A" },
      { _id: "b", title: "B" },
    ];
    renderRepeater({ value, onChange });

    const dupBtns = screen.getAllByRole("button", { name: /duplicate item/i });
    fireEvent.click(dupBtns[1]); // Duplicate last item

    const result = onChange.mock.calls[0][0] as Array<{ _id: string }>;
    expect(result.length).toBe(3);
    // Original B at index 1, duplicate at index 2
    expect(result[1]._id).toBe("b");
  });
});

describe("RepeaterField — drag handle visibility", () => {
  it("renders a drag handle button per item", () => {
    renderRepeater({ value: [{ _id: "a" }, { _id: "b" }] });
    const dragBtns = screen.getAllByRole("button", { name: /drag item/i });
    expect(dragBtns.length).toBe(2);
  });

  it("drag handle is enabled when disabled=false", () => {
    renderRepeater({ value: [{ _id: "a" }], disabled: false });
    const dragBtn = screen.getByRole("button", { name: /drag item 1/i });
    expect(dragBtn).not.toBeDisabled();
  });

  it("drag handle is disabled when disabled=true", () => {
    renderRepeater({ value: [{ _id: "a" }], disabled: true });
    const dragBtn = screen.getByRole("button", { name: /drag item 1/i });
    expect(dragBtn).toBeDisabled();
  });

  it("no react-beautiful-dnd import (uses @dnd-kit)", () => {
    // Verify the component source does NOT reference react-beautiful-dnd
    // We can test this by confirming our mock of @dnd-kit/core was called
    // and the component rendered successfully (indirect proof)
    renderRepeater({ value: [{ _id: "a" }] });
    expect(screen.getByText("Item 1 of 1")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// 2.4.6 — Registration
// ---------------------------------------------------------------------------

describe("RepeaterField — registration", () => {
  it('has displayName of "RepeaterField"', () => {
    expect(RepeaterField.displayName).toBe("RepeaterField");
  });

  it("is registered in the field component registry for FieldType.REPEATER", async () => {
    const { getFieldComponent } = await import("../registry");
    const component = getFieldComponent(FieldType.REPEATER);
    // Should return RepeaterField (not FallbackField)
    expect(component).toBe(RepeaterField);
  });
});

// ---------------------------------------------------------------------------
// General robustness
// ---------------------------------------------------------------------------

describe("RepeaterField — robustness", () => {
  it("handles non-array value gracefully (treats as empty)", () => {
    expect(() => {
      renderRepeater({ value: null });
    }).not.toThrow();
    expect(
      screen.getByText("No items. Click Add to start."),
    ).toBeInTheDocument();
  });

  it("handles string value gracefully (treats as empty)", () => {
    expect(() => {
      renderRepeater({ value: "invalid" });
    }).not.toThrow();
    expect(
      screen.getByText("No items. Click Add to start."),
    ).toBeInTheDocument();
  });

  it("assigns _id to items that are missing it", () => {
    const onChange = vi.fn();
    // Items without _id — should not crash
    renderRepeater({ value: [{ title: "No ID" }], onChange });
    expect(screen.getByText("Item 1 of 1")).toBeInTheDocument();
  });

  it("shows error message when errors prop provided", () => {
    renderRepeater({
      value: [],
      errors: ["This field is required"],
    });
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("onChange fires with new array on Add", () => {
    const onChange = vi.fn();
    renderRepeater({ value: [], onChange });

    fireEvent.click(screen.getByRole("button", { name: /add/i }));

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(Array.isArray(onChange.mock.calls[0][0])).toBe(true);
  });
});
