/**
 * Step 2.8.3 — Dependency Tracking & Circular Detection
 *
 * Utility functions to build dependency graphs from conditional field
 * definitions and detect circular dependencies using DFS.
 */
import type { FieldDefinition } from "../components/DynamicFields/types";

/**
 * Build a dependency graph from field definitions.
 * Maps each field that has a conditional rule to the field(s) it depends on.
 */
export function buildDependencyGraph(
  fields: FieldDefinition[],
): Record<string, string[]> {
  const graph: Record<string, string[]> = {};
  for (const field of fields) {
    if (field.conditional) {
      graph[field.name] = [field.conditional.field];
    }
  }
  return graph;
}

/**
 * Detect circular dependencies in a dependency graph using DFS.
 * Returns an array of cycle chains (e.g. [['a', 'b', 'a']]).
 */
export function detectCircularDependencies(
  graph: Record<string, string[]>,
): string[][] {
  const visited = new Set<string>();
  const cycles: string[][] = [];

  // Collect all nodes (both keys and values)
  const allNodes = new Set<string>();
  for (const node of Object.keys(graph)) {
    allNodes.add(node);
    for (const dep of graph[node]) {
      allNodes.add(dep);
    }
  }

  function dfs(
    node: string,
    recursionStack: Set<string>,
    path: string[],
  ): void {
    visited.add(node);
    recursionStack.add(node);
    path.push(node);

    const neighbors = graph[node] || [];
    for (const neighbor of neighbors) {
      if (recursionStack.has(neighbor)) {
        // Found a cycle — extract the cycle portion from path
        const cycleStart = path.indexOf(neighbor);
        const cycle = [...path.slice(cycleStart), neighbor];
        cycles.push(cycle);
      } else if (!visited.has(neighbor)) {
        dfs(neighbor, recursionStack, path);
      }
    }

    path.pop();
    recursionStack.delete(node);
  }

  for (const node of allNodes) {
    if (!visited.has(node)) {
      dfs(node, new Set(), []);
    }
  }

  return cycles;
}

/**
 * Validate field dependencies and warn about circular references.
 * Only runs in development mode.
 */
export function validateFieldDependencies(fields: FieldDefinition[]): void {
  if (process.env.NODE_ENV !== "development") return;

  const graph = buildDependencyGraph(fields);
  const cycles = detectCircularDependencies(graph);

  if (cycles.length > 0) {
    const cycleDescriptions = cycles
      .map((cycle) => cycle.join(" → "))
      .join("; ");
    console.warn(
      `[fieldDependencies] Circular conditional dependencies detected: ${cycleDescriptions}. ` +
        "This may cause infinite loops in field visibility evaluation.",
    );
  }
}
