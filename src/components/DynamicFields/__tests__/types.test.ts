/**
 * Tests for Step 2.1.1 — TypeScript Type Definitions (types.ts)
 * Validates that all exported enums and interfaces are correctly shaped.
 */
import { describe, it, expect } from "vitest";
import { ConditionalOperator, FieldType } from "../types";
import type {
  ValidationRules,
  ConditionalRule,
  FieldUIConfig,
  FieldDefinition,
  FieldGroupDefinition,
  FieldRendererProps,
} from "../types";

describe("ConditionalOperator enum", () => {
  it("exports EQUALS", () => {
    expect(ConditionalOperator.EQUALS).toBe("EQUALS");
  });

  it("exports NOT_EQUALS", () => {
    expect(ConditionalOperator.NOT_EQUALS).toBe("NOT_EQUALS");
  });

  it("exports IS_EMPTY", () => {
    expect(ConditionalOperator.IS_EMPTY).toBe("IS_EMPTY");
  });

  it("exports IS_NOT_EMPTY", () => {
    expect(ConditionalOperator.IS_NOT_EMPTY).toBe("IS_NOT_EMPTY");
  });

  it("exports GREATER_THAN", () => {
    expect(ConditionalOperator.GREATER_THAN).toBe("GREATER_THAN");
  });

  it("exports LESS_THAN", () => {
    expect(ConditionalOperator.LESS_THAN).toBe("LESS_THAN");
  });

  it("exports CONTAINS", () => {
    expect(ConditionalOperator.CONTAINS).toBe("CONTAINS");
  });

  it("has exactly 7 values", () => {
    const values = Object.values(ConditionalOperator);
    expect(values).toHaveLength(7);
  });
});

describe("FieldType enum", () => {
  it("exports TEXT", () => {
    expect(FieldType.TEXT).toBe("TEXT");
  });

  it("exports TEXTAREA", () => {
    expect(FieldType.TEXTAREA).toBe("TEXTAREA");
  });

  it("exports NUMBER", () => {
    expect(FieldType.NUMBER).toBe("NUMBER");
  });

  it("exports SELECT", () => {
    expect(FieldType.SELECT).toBe("SELECT");
  });

  it("exports TOGGLE", () => {
    expect(FieldType.TOGGLE).toBe("TOGGLE");
  });

  it("exports IMAGE", () => {
    expect(FieldType.IMAGE).toBe("IMAGE");
  });

  it("exports COLOR", () => {
    expect(FieldType.COLOR).toBe("COLOR");
  });

  it("exports LINK", () => {
    expect(FieldType.LINK).toBe("LINK");
  });

  it("exports EMAIL", () => {
    expect(FieldType.EMAIL).toBe("EMAIL");
  });

  it("exports REPEATER", () => {
    expect(FieldType.REPEATER).toBe("REPEATER");
  });

  it("exports TOKEN", () => {
    expect(FieldType.TOKEN).toBe("TOKEN");
  });

  it("has exactly 11 values", () => {
    const values = Object.values(FieldType);
    expect(values).toHaveLength(11);
  });
});

describe("ValidationRules interface (structural)", () => {
  it("accepts a fully populated object", () => {
    const rules: ValidationRules = {
      min: 0,
      max: 100,
      minLength: 1,
      maxLength: 255,
      pattern: "^[a-z]+$",
      custom: (v) => (v ? undefined : "Required"),
      message: "Override message",
    };
    expect(rules.min).toBe(0);
    expect(rules.max).toBe(100);
    expect(typeof rules.custom).toBe("function");
  });

  it("accepts a partially populated object", () => {
    const rules: ValidationRules = { required: undefined } as ValidationRules;
    expect(rules).toBeDefined();
  });
});

describe("ConditionalRule interface (structural)", () => {
  it("accepts a valid ConditionalRule", () => {
    const rule: ConditionalRule = {
      field: "showAdvanced",
      operator: ConditionalOperator.EQUALS,
      value: true,
    };
    expect(rule.field).toBe("showAdvanced");
    expect(rule.operator).toBe(ConditionalOperator.EQUALS);
  });

  it("accepts a rule without a value (IS_EMPTY style)", () => {
    const rule: ConditionalRule = {
      field: "description",
      operator: ConditionalOperator.IS_EMPTY,
    };
    expect(rule.value).toBeUndefined();
  });
});

describe("FieldUIConfig interface (structural)", () => {
  it("accepts all optional fields", () => {
    const uiConfig: FieldUIConfig = {
      component: "TextField",
      props: { multiline: true, rows: 4 },
      placeholder: "Enter value…",
      help: "Short help text.",
    };
    expect(uiConfig.component).toBe("TextField");
    expect(uiConfig.props?.["multiline"]).toBe(true);
  });

  it("accepts an empty object", () => {
    const uiConfig: FieldUIConfig = {};
    expect(uiConfig).toBeDefined();
  });
});

describe("FieldDefinition interface (structural)", () => {
  it("accepts a minimal definition", () => {
    const field: FieldDefinition = {
      name: "title",
      label: "Title",
      type: FieldType.TEXT,
    };
    expect(field.name).toBe("title");
    expect(field.type).toBe(FieldType.TEXT);
  });

  it("accepts a fully populated definition", () => {
    const field: FieldDefinition = {
      name: "price",
      label: "Price",
      type: FieldType.NUMBER,
      required: true,
      validation: { min: 0, max: 9999 },
      ui: { placeholder: "0.00", help: "Enter price in USD" },
      conditional: {
        field: "hasPrice",
        operator: ConditionalOperator.EQUALS,
        value: true,
      },
      defaultValue: 0,
      order: 2,
      group: "pricing",
    };
    expect(field.required).toBe(true);
    expect(field.validation?.min).toBe(0);
    expect(field.group).toBe("pricing");
  });
});

describe("FieldGroupDefinition interface (structural)", () => {
  it("accepts a valid group definition", () => {
    const group: FieldGroupDefinition = {
      id: "basic",
      label: "Basic Information",
      order: 1,
      fields: ["title", "description"],
    };
    expect(group.id).toBe("basic");
    expect(group.fields).toHaveLength(2);
  });
});

describe("FieldRendererProps interface (structural)", () => {
  it("type-checks a valid props object", () => {
    const onChange = (_v: unknown) => {};
    const props: FieldRendererProps = {
      field: { name: "title", label: "Title", type: FieldType.TEXT },
      value: "Hello",
      onChange,
      disabled: false,
      errors: [],
      allValues: {},
    };
    expect(props.field.name).toBe("title");
    expect(typeof props.onChange).toBe("function");
  });
});
