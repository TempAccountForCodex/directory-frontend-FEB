/**
 * Step 2.2.4 — Fields Barrel Export
 * Re-exports all DynamicFields field components from a single entry point.
 * Consumers can import from 'components/DynamicFields/fields' instead of
 * individual file paths.
 *
 * Step 2.3.5 (partial) update:
 * Added ColorPicker (2.3.3), ImageUpload (2.3.1 shell — full wiring in Chunk 4),
 * and LinkField (2.3.4 shell — full wiring in Chunk 2).
 * Importing this barrel triggers all self-registration calls at module scope.
 *
 * Step 2.4 update:
 * Added Select (2.4.1), Toggle (2.4.2), and RepeaterField (2.4.3-2.4.6).
 */

import { registerFieldComponent, hasFieldComponent } from "../registry";
import { FieldType } from "../types";
import TextField from "./TextField";
import TextArea from "./TextArea";
import LinkField from "./LinkField";

export { TextField };
export { TextArea };
export { default as NumberInput } from "./NumberInput";
export { TokenPicker } from "./TokenPicker";
export { ColorPicker } from "./ColorPicker";
export { default as ImageUpload } from "./ImageUpload";
export { LinkField };
export { default as Select } from "./Select";
export { default as Toggle } from "./Toggle";
export { default as RepeaterField } from "./RepeaterField";
export { default as MenuSelectField } from "./MenuSelectField";

// Register fallback mappings for backend field types that have no dedicated component.
// EMAIL reuses TextField — email validation comes from API metadata, not the component.
if (!hasFieldComponent(FieldType.EMAIL)) {
  registerFieldComponent(FieldType.EMAIL, TextField);
}

// URL reuses LinkField — URLs are a subset of links
if (!hasFieldComponent(FieldType.URL)) {
  registerFieldComponent(FieldType.URL, LinkField);
}

// RICH_TEXT / RICHTEXT degrade to TextArea (multiline plain text)
if (!hasFieldComponent(FieldType.RICH_TEXT)) {
  registerFieldComponent(FieldType.RICH_TEXT, TextArea);
}
if (!hasFieldComponent(FieldType.RICHTEXT)) {
  registerFieldComponent(FieldType.RICHTEXT, TextArea);
}

// ICON degrades to TextField (icon name as text input)
if (!hasFieldComponent(FieldType.ICON)) {
  registerFieldComponent(FieldType.ICON, TextField);
}

// DATE degrades to TextField (date as text input)
if (!hasFieldComponent(FieldType.DATE)) {
  registerFieldComponent(FieldType.DATE, TextField);
}
