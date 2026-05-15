/**
 * Step 2.8.3 — Dependency Tracking & Circular Detection Tests
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  buildDependencyGraph,
  detectCircularDependencies,
  validateFieldDependencies,
} from "../fieldDependencies";
import type { FieldDefinition } from "../../components/DynamicFields/types";
import {
  FieldType,
  ConditionalOperator,
} from "../../components/DynamicFields/types";

/** Helper to create a minimal FieldDefinition */
function makeField(name: string, conditionalField?: string): FieldDefinition {
  const field: FieldDefinition = {
    name,
    label: name,
    type: FieldType.TEXT,
  };
  if (conditionalField) {
    field.conditional = {
      field: conditionalField,
      operator: ConditionalOperator.EQUALS,
      value: true,
    };
  }
  return field;
}

// ─── buildDependencyGraph ────────────────────────────────────────────

describe("buildDependencyGraph", () => {
  it("returns empty graph for fields without conditionals", () => {
    const fields = [makeField("a"), makeField("b")];
    const graph = buildDependencyGraph(fields);
    expect(graph).toEqual({});
  });

  it("maps a field to its conditional dependency", () => {
    const fields = [makeField("a"), makeField("b", "a")];
    const graph = buildDependencyGraph(fields);
    expect(graph).toEqual({ b: ["a"] });
  });

  it("builds graph with multiple dependencies", () => {
    const fields = [
      makeField("a"),
      makeField("b", "a"),
      makeField("c", "a"),
      makeField("d", "b"),
    ];
    const graph = buildDependencyGraph(fields);
    expect(graph).toEqual({ b: ["a"], c: ["a"], d: ["b"] });
  });

  it("includes all fields with conditional.field references", () => {
    const fields = [makeField("x"), makeField("y", "x"), makeField("z", "y")];
    const graph = buildDependencyGraph(fields);
    expect(Object.keys(graph)).toHaveLength(2);
    expect(graph).toHaveProperty("y", ["x"]);
    expect(graph).toHaveProperty("z", ["y"]);
  });

  it("handles empty fields array", () => {
    expect(buildDependencyGraph([])).toEqual({});
  });
});

// ─── detectCircularDependencies ──────────────────────────────────────

describe("detectCircularDependencies", () => {
  it("returns empty array for acyclic graph", () => {
    const graph = { b: ["a"], c: ["a"], d: ["b"] };
    expect(detectCircularDependencies(graph)).toEqual([]);
  });

  it("detects simple cycle (A→B→A)", () => {
    const graph = { a: ["b"], b: ["a"] };
    const cycles = detectCircularDependencies(graph);
    expect(cycles.length).toBeGreaterThan(0);
    // At least one cycle should contain both 'a' and 'b'
    const flat = cycles.flat();
    expect(flat).toContain("a");
    expect(flat).toContain("b");
  });

  it("detects complex cycle (A→B→C→A)", () => {
    const graph = { a: ["b"], b: ["c"], c: ["a"] };
    const cycles = detectCircularDependencies(graph);
    expect(cycles.length).toBeGreaterThan(0);
    const flat = cycles.flat();
    expect(flat).toContain("a");
    expect(flat).toContain("b");
    expect(flat).toContain("c");
  });

  it("does not flag valid linear chains as circular", () => {
    // a → b → c → d (no cycle)
    const graph = { b: ["a"], c: ["b"], d: ["c"] };
    expect(detectCircularDependencies(graph)).toEqual([]);
  });

  it("handles empty graph", () => {
    expect(detectCircularDependencies({})).toEqual([]);
  });

  it("detects self-referencing cycle", () => {
    const graph = { a: ["a"] };
    const cycles = detectCircularDependencies(graph);
    expect(cycles.length).toBeGreaterThan(0);
    expect(cycles.flat()).toContain("a");
  });
});

// ─── validateFieldDependencies ───────────────────────────────────────

describe("validateFieldDependencies", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("warns in development mode when circular dependencies exist", () => {
    process.env.NODE_ENV = "development";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const fields = [makeField("a", "b"), makeField("b", "a")];
    validateFieldDependencies(fields);

    expect(warnSpy).toHaveBeenCalled();
    const message = warnSpy.mock.calls[0][0] as string;
    expect(message.toLowerCase()).toContain("circular");

    process.env.NODE_ENV = originalEnv;
  });

  it("does NOT warn in production mode", () => {
    process.env.NODE_ENV = "production";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const fields = [makeField("a", "b"), makeField("b", "a")];
    validateFieldDependencies(fields);

    expect(warnSpy).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });

  it("does not warn when no circular dependencies exist", () => {
    process.env.NODE_ENV = "development";
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const fields = [makeField("a"), makeField("b", "a")];
    validateFieldDependencies(fields);

    expect(warnSpy).not.toHaveBeenCalled();

    process.env.NODE_ENV = originalEnv;
  });
});

// ─── Performance ─────────────────────────────────────────────────────

describe("Performance", () => {
  it("processes 50 fields in under 5ms", () => {
    const fields: FieldDefinition[] = [];
    for (let i = 0; i < 50; i++) {
      fields.push(
        makeField(`field_${i}`, i > 0 ? `field_${i - 1}` : undefined),
      );
    }

    const start = performance.now();
    const graph = buildDependencyGraph(fields);
    detectCircularDependencies(graph);
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(5);
  });
});
