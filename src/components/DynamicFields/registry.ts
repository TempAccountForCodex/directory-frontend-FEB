/**
 * Step 2.1.3 — Component Registry Pattern
 * Maps FieldType values to React components.
 * Supports runtime registration to allow lazy-loaded or plugin-style field types.
 *
 * Step 2.2.4 update:
 * TEXT, TEXTAREA, and NUMBER field components are self-registering — each
 * component file calls registerFieldComponent() at module scope. Those
 * registrations take effect the first time the field file is imported
 * (e.g. via the fields/index.ts barrel or directly in app code).
 * This avoids a circular-import temporal dead-zone that would arise if
 * registry.ts tried to import the field files (registry → field → registry).
 */
import React from "react";
import { Alert } from "@mui/material";
import { FieldType } from "./types";
import type { FieldRendererProps } from "./types";
import { TokenPicker } from "./fields/TokenPicker";

// ---------------------------------------------------------------------------
// Fallback — shown when no component is registered for a field type
// ---------------------------------------------------------------------------

/**
 * FallbackField
 * Displayed when a field type has no registered component.
 * Uses MUI Alert with severity="warning" so it is visually distinct.
 */
export const FallbackField: React.FC<FieldRendererProps> = ({ field }) =>
  React.createElement(
    Alert,
    { severity: "warning", sx: { mt: 1 } },
    `Unsupported field type: ${field.type}`,
  );

FallbackField.displayName = "FallbackField";

// ---------------------------------------------------------------------------
// Registry map — FieldType → React component
// ---------------------------------------------------------------------------

type FieldComponent = React.ComponentType<FieldRendererProps>;

/**
 * Internal registry map.
 * Use registerFieldComponent() and getFieldComponent() for all access.
 */
const FIELD_COMPONENTS: Map<FieldType, FieldComponent> = new Map();

// ---------------------------------------------------------------------------
// Token component adapter
// TokenPicker has its own specific props; we adapt it to FieldRendererProps
// so it can live in the registry without forcing the registry to know about
// TokenPicker's internal interface.
// ---------------------------------------------------------------------------

const TokenPickerAdapter: React.FC<FieldRendererProps> = ({
  field,
  value,
  onChange,
  disabled,
  errors,
}) => {
  const tokenType = (field.ui?.props?.["tokenType"] as string) ?? "color";
  const defaultValue = field.defaultValue as string | undefined;

  return React.createElement(TokenPicker, {
    tokenType: tokenType as Parameters<typeof TokenPicker>[0]["tokenType"],
    value: (value as string) ?? "",
    onChange: onChange as (v: string) => void,
    defaultValue,
    label: field.label,
    helperText: field.ui?.help,
    disabled: disabled ?? false,
    error: errors?.[0],
  });
};

TokenPickerAdapter.displayName = "TokenPickerAdapter";

// ---------------------------------------------------------------------------
// Bootstrap default registrations
// ---------------------------------------------------------------------------

// TOKEN — registered here via adapter (TokenPicker has different props interface)
FIELD_COMPONENTS.set(FieldType.TOKEN, TokenPickerAdapter);

// TEXT, TEXTAREA, NUMBER — registered by the field components themselves via
// module-level registerFieldComponent() calls (self-registration pattern).
// These registrations take effect when the field files are imported.
// See: fields/TextField.tsx, fields/TextArea.tsx, fields/NumberInput.tsx
// See also: fields/index.ts (barrel that triggers all registrations)

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register a React component for a given FieldType.
 * Calling this a second time with the same type overwrites the previous entry
 * (useful for overrides / testing).
 *
 * @param type - The FieldType key to register under
 * @param component - The React component to use when rendering this type
 * @throws {Error} If component is null or undefined (prevents silent render crashes)
 */
export function registerFieldComponent(
  type: FieldType,
  component: FieldComponent,
): void {
  if (!component) {
    throw new Error(
      `registerFieldComponent: component for type "${type}" must not be null or undefined`,
    );
  }
  FIELD_COMPONENTS.set(type, component);
}

/**
 * Retrieve the React component registered for a given FieldType.
 * Returns FallbackField when no registration exists.
 *
 * @param type - The FieldType to look up
 * @returns The registered component or FallbackField
 */
export function getFieldComponent(type: FieldType): FieldComponent {
  return FIELD_COMPONENTS.get(type) ?? FallbackField;
}

/**
 * Check whether a component is registered for the given type.
 */
export function hasFieldComponent(type: FieldType): boolean {
  return FIELD_COMPONENTS.has(type);
}

/**
 * Expose the registry map as a read-only snapshot (for debugging / testing).
 */
export function getRegistrySnapshot(): ReadonlyMap<FieldType, FieldComponent> {
  return FIELD_COMPONENTS;
}
