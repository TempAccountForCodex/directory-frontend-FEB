/**
 * Helpers for translating AI patch paths into editor block field paths and
 * detecting user/AI edit conflicts.
 */

import type { AIPatch, EditableSchemaTarget } from "../../api/websiteAI";

/**
 * AI patches use persisted content paths like "content.heading" or
 * "content.buttonStyle.borderColor". The editor's inline-save handler works on
 * the path *inside* `content`, so strip a leading "content." segment.
 */
export function toFieldPath(patchPath: string): string {
  const contentIndex = patchPath.indexOf(".content.");
  if (contentIndex >= 0) {
    return patchPath.slice(contentIndex + ".content.".length);
  }
  const blockColumnMatch = patchPath.match(/\.blocks\.[^.]+\.([^.]+)$/);
  if (blockColumnMatch) {
    return blockColumnMatch[1];
  }
  return patchPath.startsWith("content.")
    ? patchPath.slice("content.".length)
    : patchPath;
}

export function toPersistedContentPath(fieldPath: string): string {
  if (
    fieldPath.startsWith("content.") ||
    fieldPath.startsWith("pages.") ||
    fieldPath.startsWith("blocks.")
  ) {
    return fieldPath;
  }
  return `content.${fieldPath}`;
}

export function toPersistedBlockContentPath(
  fieldPath: string,
  pageId?: number | string | null,
  blockId?: number | string | null,
): string {
  if (
    fieldPath.startsWith("pages.") ||
    fieldPath.startsWith("website.") ||
    fieldPath.startsWith("blocks.")
  ) {
    return fieldPath;
  }

  const contentPath = toPersistedContentPath(fieldPath);
  if (pageId == null || blockId == null) return contentPath;

  return `pages.${pageId}.blocks.${blockId}.${contentPath}`;
}

export function getPatchFieldPath(patch: AIPatch): string {
  return patch.fieldPath || patch.path;
}

export function isBlockContentPath(path: string): boolean {
  return path.startsWith("content.") || path.includes(".content.");
}

export function extractEditableSchemaTargets(
  aiContext: unknown,
): EditableSchemaTarget[] {
  let context = aiContext;
  if (typeof context === "string") {
    try {
      context = JSON.parse(context);
    } catch {
      return [];
    }
  }
  if (!context || typeof context !== "object") return [];
  const editableSchema = (context as Record<string, unknown>).editableSchema;
  if (!editableSchema || typeof editableSchema !== "object") return [];
  const targets = (editableSchema as Record<string, unknown>).targets;
  if (!Array.isArray(targets)) return [];
  return targets.filter(
    (target): target is EditableSchemaTarget =>
      !!target &&
      typeof target === "object" &&
      typeof (target as EditableSchemaTarget).aiEditKey === "string" &&
      typeof (target as EditableSchemaTarget).fieldPath === "string",
  );
}

export function findEditableSchemaTarget(
  targets: EditableSchemaTarget[],
  selection: {
    pageId?: number | string | null;
    blockId?: number | string | null;
    fieldPath?: string | null;
  },
): EditableSchemaTarget | undefined {
  const selectedPath = selection.fieldPath
    ? toFieldPath(selection.fieldPath)
    : null;
  const selectedBlockId =
    selection.blockId != null ? String(selection.blockId) : null;
  const selectedPageId =
    selection.pageId != null ? String(selection.pageId) : null;

  const matchingPathTargets = targets.filter(
    (target) =>
      selectedPath == null || toFieldPath(target.fieldPath) === selectedPath,
  );

  if (!matchingPathTargets.length) return undefined;

  const scored = matchingPathTargets
    .map((target) => {
      const targetBlockId = target.blockId != null ? String(target.blockId) : null;
      const targetPageId = target.pageId != null ? String(target.pageId) : null;
      const fieldPathContainsBlock =
        selectedBlockId != null &&
        target.fieldPath.includes(`blocks.${selectedBlockId}.`);

      let score = 0;
      if (selectedBlockId && targetBlockId === selectedBlockId) score += 100;
      if (fieldPathContainsBlock) score += 80;
      if (!selectedBlockId || !targetBlockId) score += 10;
      if (selectedPageId && targetPageId === selectedPageId) score += 20;
      if (!selectedPageId || !targetPageId) score += 5;

      const blockMismatch =
        selectedBlockId &&
        targetBlockId &&
        targetBlockId !== selectedBlockId &&
        !fieldPathContainsBlock;

      if (blockMismatch) {
        // Backend page-block saves can recreate block ids. When the selected
        // iframe element still points at the pre-save id, keep a lower-scored
        // same-page/same-field fallback instead of treating the target as
        // unsupported.
        if (selectedPageId && targetPageId === selectedPageId) {
          return { target, score: score - 70 };
        }
        return { target, score: -1 };
      }

      return { target, score };
    })
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.target;
}

/** Convert an edit-element patch map into a flat list of patches. */
export function patchMapToEntries(
  patch: Record<string, unknown>,
): { path: string; value: unknown }[] {
  return Object.entries(patch).map(([path, value]) => ({ path, value }));
}

/** Loose equality good enough for comparing primitive editable field values. */
export function valuesEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a == null && b == null) return true;
  if (typeof a === "object" || typeof b === "object") {
    try {
      return JSON.stringify(a) === JSON.stringify(b);
    } catch {
      return false;
    }
  }
  return String(a ?? "") === String(b ?? "");
}

export interface NormalizedPatch {
  aiEditKey?: string;
  blockId?: number | string;
  pageId?: number | string;
  fieldPath: string;
  persistedFieldPath: string;
  value: unknown;
  before?: unknown;
}

/** Normalize chat patches into editor-applicable patches. */
export function normalizeChatPatches(patches: AIPatch[]): NormalizedPatch[] {
  return patches.map((p) => {
    const persistedFieldPath = getPatchFieldPath(p);
    return {
      aiEditKey: p.aiEditKey,
      blockId: p.blockId,
      pageId: p.pageId,
      fieldPath: toFieldPath(persistedFieldPath),
      persistedFieldPath,
      value: p.value ?? p.after,
      before: p.before,
    };
  });
}
