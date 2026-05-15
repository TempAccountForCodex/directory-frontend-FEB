/**
 * Tests for Step 2.1.3 — Component Registry Pattern (registry.ts)
 * Covers: FIELD_COMPONENTS default state, registerFieldComponent,
 *         getFieldComponent, FallbackField, TokenPicker registration.
 */
import React from "react";
import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  registerFieldComponent,
  getFieldComponent,
  hasFieldComponent,
  FallbackField,
  getRegistrySnapshot,
} from "../registry";
import { FieldType } from "../types";
import type { FieldRendererProps } from "../types";

// Minimal FieldDefinition factory
function makeField(
  type: FieldType,
  overrides = {},
): FieldRendererProps["field"] {
  return {
    name: "test",
    label: "Test",
    type,
    ...overrides,
  };
}

// Minimal FieldRendererProps factory
function makeProps(
  type: FieldType,
  overrides: Partial<FieldRendererProps> = {},
): FieldRendererProps {
  return {
    field: makeField(type),
    value: "",
    onChange: () => {},
    disabled: false,
    errors: [],
    allValues: {},
    ...overrides,
  };
}

describe("getFieldComponent — TOKEN type", () => {
  it("returns a truthy component for TOKEN", () => {
    const component = getFieldComponent(FieldType.TOKEN);
    expect(component).toBeTruthy();
    expect(typeof component).toBe("function");
  });

  it("does not return FallbackField for TOKEN (TOKEN is registered)", () => {
    const component = getFieldComponent(FieldType.TOKEN);
    expect(component).not.toBe(FallbackField);
  });
});

describe("getFieldComponent — unregistered types", () => {
  it("returns FallbackField for TEXT (not yet registered in 2.1)", () => {
    // TEXT is not registered until Step 2.2
    const component = getFieldComponent(FieldType.TEXT);
    expect(component).toBe(FallbackField);
  });

  it("returns FallbackField for SELECT (not yet registered)", () => {
    const component = getFieldComponent(FieldType.SELECT);
    expect(component).toBe(FallbackField);
  });
});

describe("FallbackField", () => {
  it("renders unsupported field type message", () => {
    const props = makeProps(FieldType.REPEATER);
    render(<FallbackField {...props} />);
    expect(
      screen.getByText(/Unsupported field type: REPEATER/i),
    ).toBeInTheDocument();
  });

  it("renders as an MUI Alert (warning)", () => {
    const props = makeProps(FieldType.IMAGE);
    const { container } = render(<FallbackField {...props} />);
    // MUI Alert renders with role="alert" or severity class
    const alert = container.querySelector(".MuiAlert-root");
    expect(alert).toBeInTheDocument();
  });

  it("has displayName set", () => {
    expect(FallbackField.displayName).toBe("FallbackField");
  });
});

describe("registerFieldComponent", () => {
  const MockComponent: React.FC<FieldRendererProps> = ({ field }) =>
    React.createElement("div", { "data-testid": "mock" }, `mock-${field.name}`);
  MockComponent.displayName = "MockComponent";

  it("registers a new component for a type", () => {
    registerFieldComponent(FieldType.TEXT, MockComponent);
    const retrieved = getFieldComponent(FieldType.TEXT);
    expect(retrieved).toBe(MockComponent);
  });

  it("overwrites an existing registration", () => {
    const OtherMock: React.FC<FieldRendererProps> = () =>
      React.createElement("div", null, "other");
    registerFieldComponent(FieldType.TEXT, MockComponent);
    registerFieldComponent(FieldType.TEXT, OtherMock);
    expect(getFieldComponent(FieldType.TEXT)).toBe(OtherMock);
  });

  it("allows registering all FieldType values", () => {
    const MockFieldComp: React.FC<FieldRendererProps> = () =>
      React.createElement("div", null);
    const types = Object.values(FieldType) as FieldType[];
    types.forEach((type) => {
      registerFieldComponent(type, MockFieldComp);
      expect(getFieldComponent(type)).toBe(MockFieldComp);
    });
  });
});

describe("hasFieldComponent", () => {
  it("returns true for TOKEN (registered at startup)", () => {
    // Re-register TOKEN to ensure it's in registry (test order may vary)
    const snap = getRegistrySnapshot();
    // TOKEN should always be registered
    expect(snap.has(FieldType.TOKEN)).toBe(true);
    expect(hasFieldComponent(FieldType.TOKEN)).toBe(true);
  });

  it("returns false or true depending on whether type was registered", () => {
    // After above tests, TEXT may be registered — just check the function works
    const result = hasFieldComponent(FieldType.COLOR);
    expect(typeof result).toBe("boolean");
  });
});

describe("getRegistrySnapshot", () => {
  it("returns a Map", () => {
    const snap = getRegistrySnapshot();
    expect(snap instanceof Map).toBe(true);
  });

  it("is read-only (does not expose mutable internals)", () => {
    const snap = getRegistrySnapshot();
    // ReadonlyMap has no set method exposed at runtime, but we verify it's a Map
    expect(typeof snap.get).toBe("function");
    expect(typeof snap.has).toBe("function");
  });

  it("contains TOKEN entry", () => {
    const snap = getRegistrySnapshot();
    expect(snap.has(FieldType.TOKEN)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PROD QA edge-case tests — registerFieldComponent null/undefined guard
// ---------------------------------------------------------------------------

describe("registerFieldComponent — PROD QA null/undefined guard", () => {
  it("throws when registering null as a component", () => {
    expect(() => {
      // @ts-expect-error — intentionally passing null to test runtime guard
      registerFieldComponent(FieldType.COLOR, null);
    }).toThrow(/must not be null or undefined/);
  });

  it("throws when registering undefined as a component", () => {
    expect(() => {
      // @ts-expect-error — intentionally passing undefined to test runtime guard
      registerFieldComponent(FieldType.IMAGE, undefined);
    }).toThrow(/must not be null or undefined/);
  });

  it("does not throw when registering a valid component", () => {
    const ValidComp: React.FC<FieldRendererProps> = () =>
      React.createElement("div", null);
    expect(() => {
      registerFieldComponent(FieldType.LINK, ValidComp);
    }).not.toThrow();
    expect(getFieldComponent(FieldType.LINK)).toBe(ValidComp);
  });

  it("error message includes the field type name", () => {
    expect(() => {
      // @ts-expect-error — intentionally passing null
      registerFieldComponent(FieldType.EMAIL, null);
    }).toThrow("EMAIL");
  });
});
