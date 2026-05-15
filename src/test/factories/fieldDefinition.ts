import type { FieldDefinition } from "../../components/DynamicFields/types";
import { FieldType } from "../../components/DynamicFields/types";

/**
 * Creates a minimal valid FieldDefinition for tests.
 * All optional fields (validation, ui, conditional, defaultValue, order, group) are omitted
 * by default — pass overrides to test specific configurations.
 *
 * @example
 * makeFieldDefinition()                                  // basic text field
 * makeFieldDefinition({ type: FieldType.EMAIL, required: true })
 * makeFieldDefinition({ name: 'bio', type: FieldType.TEXTAREA, ui: { help: 'Max 200 chars' } })
 */
export function makeFieldDefinition(
  overrides: Partial<FieldDefinition> = {},
): FieldDefinition {
  return {
    name: "test_field",
    label: "Test Field",
    type: FieldType.TEXT,
    ...overrides,
  };
}
