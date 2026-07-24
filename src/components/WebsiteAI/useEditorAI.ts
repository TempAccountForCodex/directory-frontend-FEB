/**
 * useEditorAI — orchestrates editor-side website AI interactions.
 *
 * Backend contract note (unified editable-target contract):
 * - edit-element and editor-chat are preview/generation only.
 * - Selected-element edits are applied to LOCAL editor state using the backend's
 *   authoritative `editorPath`, then persisted through the normal editor "Save
 *   Changes" flow. We do NOT call generate-content patch mode for them (no
 *   duplicate writer) and do NOT refetch the whole website after applying.
 * - After a local apply we call POST /ai/record-applied-edit (best-effort) so the
 *   backend records a revertible AI turn without fighting the editor save flow.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  editElement,
  type EditableSchemaTarget,
  editorChat,
  recordAppliedEdit,
  recreateWebsiteWithAI,
  revertAITurn,
  restoreWebsiteAIVersion,
  WebsiteAIRequestError,
  normalizeWebsiteAIError,
  type AIHistoryEntry,
  type AIPatch,
  type EditElementTarget,
  type EditorChatScope,
  type WebsiteAIError,
} from "../../api/websiteAI";
import {
  getPatchEditorPath,
  getPatchFieldPath,
  isBlockContentPath,
  normalizeChatPatches,
  toPersistedBlockContentPath,
  toFieldPath,
  valuesEqual,
} from "./aiPatchUtils";

export const MAX_ATTEMPTS = 3;
export const MAX_REVERT_DEPTH = 2;
const LOCAL_STATIC_STYLE_FIELD_PREFIX = "__staticStyle|";

/**
 * edit-element errors that are worth retrying through the editor-chat endpoint
 * (scope "target"): provider failures mean the AI call itself failed (the chat
 * path is more reliable), and moderation blocks are often resolved by the
 * fallback's on-brand steering of the rewrite. The retry runs the same rewrite
 * against the same schema target.
 */
const CHAT_RETRYABLE_CODES = new Set<WebsiteAIError["code"]>([
  "AI_PROVIDER_UNAVAILABLE",
  "AI_UNAVAILABLE",
  "AI_FAILED",
  "PATCH_MODERATION_BLOCKED",
]);

const isWebsiteFieldPath = (path?: string | null) =>
  String(path || "").startsWith("website.");

const isLocalStaticStyleFieldPath = (path?: string | null) =>
  String(path || "").startsWith(LOCAL_STATIC_STYLE_FIELD_PREFIX);

const normalizeBackendStaticStyleFieldPath = (
  path?: string | null,
): string | null => {
  if (!path) return null;

  const fieldPath = toFieldPath(path);
  const match = fieldPath.match(/^staticStyles\.([^:]+)::([^.]+)\.([^.]+)$/);
  if (!match) return null;

  const [, styleKey, staticId, property] = match;
  if (!styleKey || !staticId || !property) return null;

  return `${LOCAL_STATIC_STYLE_FIELD_PREFIX}${encodeURIComponent(
    styleKey,
  )}|${encodeURIComponent(staticId)}|${encodeURIComponent(property)}`;
};

const isLocallyApplicablePatch = (patch: {
  blockId?: number | string;
  fieldPath?: string;
  persistedFieldPath?: string;
}) =>
  (patch.blockId != null &&
    isLocalStaticStyleFieldPath(patch.persistedFieldPath || patch.fieldPath)) ||
  (patch.blockId != null &&
    patch.persistedFieldPath &&
    isBlockContentPath(patch.persistedFieldPath)) ||
  isWebsiteFieldPath(patch.persistedFieldPath || patch.fieldPath);

const stripJsonFence = (value: string) =>
  value
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

const friendlyTextFromObject = (
  value: Record<string, unknown>,
  fallback = "",
): string => {
  const direct =
    typeof value.summary === "string"
      ? value.summary
      : typeof value.reply === "string"
        ? value.reply
        : typeof value.text === "string"
          ? value.text
          : typeof value.message === "string"
            ? value.message
            : "";

  if (direct.trim()) {
    return direct.trim();
  }

  if (Array.isArray(value.applied) || Array.isArray(value.patches)) {
    return fallback || "AI changes applied.";
  }

  return fallback;
};

export const formatAIChatMessageText = (
  value: unknown,
  fallback = "",
): string => {
  if (value == null) return fallback;

  if (typeof value === "object") {
    return friendlyTextFromObject(value as Record<string, unknown>, fallback);
  }

  const text = String(value).trim();
  if (!text) return fallback;

  const unfenced = stripJsonFence(text);
  if (unfenced.startsWith("{") || unfenced.startsWith("[")) {
    try {
      const parsed = JSON.parse(unfenced);
      if (Array.isArray(parsed)) {
        return fallback || "AI changes applied.";
      }
      if (parsed && typeof parsed === "object") {
        const friendly = friendlyTextFromObject(
          parsed as Record<string, unknown>,
          fallback,
        );
        if (friendly) return friendly;
      }
    } catch {
      // Keep the original text if it only looked like JSON.
    }
  }

  return text;
};

export interface AITargetRef {
  blockId?: number | string;
  blockType?: string;
  fieldPath: string;
  persistedFieldPath?: string;
  label?: string;
  kind: "editable" | "section" | "page";
  aiEditKey?: string;
  computedStyle?: {
    color?: string;
    backgroundColor?: string;
    fontSize?: string;
    fontWeight?: string;
    textAlign?: string;
    textShadow?: string;
    fontStyle?: string;
    textDecoration?: string;
    lineHeight?: string;
    letterSpacing?: string;
    wordSpacing?: string;
    textTransform?: string;
    paddingTop?: string;
    paddingBottom?: string;
    paddingLeft?: string;
    paddingRight?: string;
    marginTop?: string;
    marginBottom?: string;
    marginLeft?: string;
    marginRight?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    width?: string;
    height?: string;
    opacity?: string;
    objectFit?: string;
  };
  styleTarget?: {
    blockId?: number | string;
    fieldPath: string;
    persistedFieldPath?: string;
    aiEditKey?: string;
    label?: string;
    computedStyle?: AITargetRef["computedStyle"];
  };
  styleTargets?: Array<{
    blockId?: number | string;
    blockType?: string;
    fieldPath: string;
    persistedFieldPath?: string;
    aiEditKey?: string;
    label?: string;
    category?: string;
    staticId?: string;
    staticType?: string;
    styleKey?: string;
    computedStyle?: AITargetRef["computedStyle"];
  }>;
}

type StaticStyleTargetRef = NonNullable<AITargetRef["styleTargets"]>[number];
type LocalStaticStyleValues = {
  primaryColor?: string;
};

export interface AIProposalPatch {
  aiEditKey?: string;
  blockId?: number | string;
  pageId?: number | string;
  fieldPath: string;
  persistedFieldPath: string;
  value: unknown;
  baselineValue: unknown;
}

export interface AIProposal {
  turnId: string;
  blockId?: number | string;
  fieldPath: string;
  value: unknown;
  patches: AIProposalPatch[];
  previewText: string;
  summary: string;
  instruction: string;
  attempt: number;
  baselineValue: unknown;
}

export interface AIConflict {
  blockId?: number | string;
  fieldPath: string;
  userValue: unknown;
  aiValue: unknown;
  turnId: string;
  summary: string;
  patches: AIProposalPatch[];
}

export interface RevertEntry {
  turnId: string;
  /**
   * The backend turn id this local entry was recorded under (returned by
   * record-applied-edit). Lets a local undo also mark the server turn reverted
   * and deduplicates the entry against server history.
   */
  serverTurnId?: string;
  patches: Array<{
    blockId?: number | string;
    fieldPath: string;
    persistedFieldPath?: string;
    beforeValue: unknown;
    afterValue: unknown;
  }>;
  label?: string;
}

export interface ChatMessage {
  id: string;
  turnId?: string;
  role: "user" | "assistant";
  text: string;
  pendingPatches?: {
    aiEditKey?: string;
    blockId?: number | string;
    pageId?: number | string;
    fieldPath: string;
    persistedFieldPath: string;
    value: unknown;
    before?: unknown;
  }[];
  requiresConfirmation?: boolean;
  applied?: boolean;
  sessionId?: string;
  versionId?: string;
  isError?: boolean;
}

export interface UseEditorAIDeps {
  websiteId: number;
  pageId: number | null;
  revertibleTurns?: AIHistoryEntry[];
  aiHistory?: AIHistoryEntry[];
  getCurrentValue: (
    blockId: number | string | undefined,
    fieldPath: string,
  ) => unknown;
  applyPatch: (
    blockId: number | string | undefined,
    fieldPath: string,
    value: unknown,
  ) => void;
  onLocalPatchesApplied?: (patches: AIProposalPatch[]) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  /**
   * Lightweight refresh of ONLY the website AI context (aiHistory /
   * revertible turns). Used after reverts instead of `onRefresh` — a full
   * website refetch reloads every block and makes the editor flicker
   * old<->new while its state mirrors rehydrate.
   */
  onRefreshAIContext?: () => void | Promise<void>;
  localStaticStyleTargets?: StaticStyleTargetRef[];
  localStaticStyleValues?: LocalStaticStyleValues;
}

function buildEditSessionId(websiteId: number, target: AITargetRef): string {
  return `edit-${websiteId}-${target.blockId ?? "page"}-${Date.now()}`;
}

function isStyleInstruction(instruction: string): boolean {
  return /\b(color|colour|background|bg|gradient|font|size|bigger|larger|smaller|increase|decrease|weight|bold|italic|underline|shadow|border|radius|rounded|spacing|padding|margin|align|alignment|opacity|width|height|teal|yellow|red|green|blue|purple|black|white|grey|gray)\b/i.test(
    instruction,
  );
}

function hasSchemaBackedTarget(target?: {
  persistedFieldPath?: string;
  aiEditKey?: string;
}): boolean {
  return Boolean(target?.persistedFieldPath || target?.aiEditKey);
}

function scoreStyleTargetForInstruction(
  target: NonNullable<AITargetRef["styleTargets"]>[number],
  instruction: string,
): number {
  const path = `${target.fieldPath} ${target.persistedFieldPath ?? ""} ${
    target.label ?? ""
  } ${target.category ?? ""}`.toLowerCase();
  const prompt = instruction.toLowerCase();
  let score = 0;

  if (
    /\b(colou?r|teal|yellow|red|green|blue|purple|black|white|gr[ae]y)\b/.test(
      prompt,
    )
  ) {
    if (path.includes("color") || path.includes("colour")) score += 100;
    if (path.includes("style")) score += 20;
    if (
      /\b(button|cta)\b/.test(prompt) &&
      /\b(text|label|copy)\b/.test(prompt)
    ) {
      if (path.includes("buttontextstyle") || path.includes("ctatextstyle")) {
        score += 80;
      }
      if (path.includes("buttonstyle") && !path.includes("buttontextstyle")) {
        score -= 40;
      }
    }
  }
  if (/\bshadow\b/.test(prompt)) {
    if (path.includes("shadow")) score += 100;
    if (path.includes("style")) score += 20;
  }
  if (/\b(border|radius|rounded)\b/.test(prompt)) {
    if (path.includes("border") || path.includes("radius")) score += 100;
    if (path.includes("buttonstyle") || path.includes("style")) score += 35;
  }
  if (/\b(background|bg|gradient)\b/.test(prompt)) {
    if (path.includes("background") || path.includes("bg")) score += 100;
    if (path.includes("sectionstyle") || path.includes("style")) score += 30;
  }
  if (/\b(spacing|padding|margin)\b/.test(prompt)) {
    if (
      path.includes("spacing") ||
      path.includes("padding") ||
      path.includes("margin")
    ) {
      score += 100;
    }
    if (path.includes("style")) score += 20;
  }
  if (
    /\b(font|size|bigger|larger|smaller|increase|decrease|weight|bold|italic|underline|align|alignment|opacity|width|height)\b/.test(
      prompt,
    )
  ) {
    if (/\b(weight|bold|bolder|lighter)\b/.test(prompt)) {
      if (path.includes("fontweight") || path.includes("font-weight")) {
        score += 160;
      } else if (path.includes("weight")) {
        score += 120;
      }
    }
    if (/\bitalic|italics\b/.test(prompt)) {
      if (path.includes("fontstyle") || path.includes("font-style")) {
        score += 150;
      } else if (path.includes("italic")) {
        score += 110;
      }
    }
    if (/\b(underline|strikethrough|strike-through|line-through|decoration)\b/.test(prompt)) {
      if (
        path.includes("textdecoration") ||
        path.includes("text-decoration")
      ) {
        score += 150;
      } else if (path.includes("decoration")) {
        score += 110;
      }
    }
    if (/\b(align|alignment|left|center|right|justify)\b/.test(prompt)) {
      if (path.includes("textalign") || path.includes("text-align")) {
        score += 150;
      } else if (path.includes("align")) {
        score += 110;
      }
    }
    if (/\b(opacity|transparent|transparency)\b/.test(prompt)) {
      if (path.includes("opacity")) score += 150;
    }
    if (/\b(width|wide|wider|narrow|narrower)\b/.test(prompt)) {
      if (path.includes("width")) score += 150;
    }
    if (/\b(height|tall|taller|short|shorter)\b/.test(prompt)) {
      if (path.includes("height")) score += 150;
    }
    if (/\b(size|bigger|larger|smaller|increase|decrease)\b/.test(prompt)) {
      if (path.includes("fontsize") || path.includes("font-size")) {
        score += 130;
      } else if (path.includes("font") || path.includes("size")) {
        score += 95;
      }
    }
    if (
      path.includes("font") ||
      path.includes("size") ||
      path.includes("weight") ||
      path.includes("align") ||
      path.includes("opacity") ||
      path.includes("width") ||
      path.includes("height") ||
      path.includes("style")
    ) {
      score += 80;
    }
  }

  return score;
}

function resolveInstructionTarget(
  target: AITargetRef,
  instruction: string,
): AITargetRef {
  if (!isStyleInstruction(instruction)) return target;

  const schemaBackedStyleTargets = [
    ...(target.styleTargets || []),
    ...(target.styleTarget ? [target.styleTarget] : []),
  ].filter(hasSchemaBackedTarget);

  const bestStyleTarget = schemaBackedStyleTargets
    .map((styleTarget) => ({
      styleTarget,
      score: scoreStyleTargetForInstruction(styleTarget, instruction),
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)[0]?.styleTarget;

  if (!bestStyleTarget) return target;

  return {
    ...target,
    blockId: bestStyleTarget.blockId ?? target.blockId,
    fieldPath: bestStyleTarget.fieldPath,
    persistedFieldPath: bestStyleTarget.persistedFieldPath,
    aiEditKey: bestStyleTarget.aiEditKey,
    label: bestStyleTarget.label || target.label,
    computedStyle: bestStyleTarget.computedStyle || target.computedStyle,
    styleTargets: target.styleTargets,
  };
}

function turnIdFromHistory(turn: AIHistoryEntry | RevertEntry): string | null {
  return typeof turn.turnId === "string" && turn.turnId.trim()
    ? turn.turnId
    : null;
}

function normalizePreviewPatches(
  patches: AIPatch[],
  target: AITargetRef,
  getCurrentValue: UseEditorAIDeps["getCurrentValue"],
): AIProposalPatch[] {
  return patches.map((patch) => {
    const persistedFieldPath = getPatchFieldPath(patch);
    // Authoritative editor path from the backend (unified contract). The editor's
    // inline-save handler writes at this path inside block.content.
    const fieldPath = getPatchEditorPath(patch);
    const blockId = patch.blockId ?? target.blockId;
    const targetBaseline =
      fieldPath === target.fieldPath &&
      String(blockId ?? "") === String(target.blockId ?? "")
        ? resolveTargetBaselineValue(target, getCurrentValue)
        : getCurrentValue(blockId, fieldPath);
    return {
      aiEditKey: patch.aiEditKey,
      blockId,
      pageId: patch.pageId,
      fieldPath,
      persistedFieldPath,
      value: patch.value ?? patch.after,
      baselineValue: resolveStaticStylePatchBaseline(
        patch,
        fieldPath,
        targetBaseline,
      ),
    };
  });
}

function formatPatchValue(value: unknown): string {
  if (value == null || value === "") return "empty";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function describeProposalPatches(patches: AIProposalPatch[]): string {
  if (!patches.length) return "AI change ready to apply";
  if (patches.length > 1) return `${patches.length} changes ready to apply`;

  const patch = patches[0];
  const label = patch.fieldPath.split(".").filter(Boolean).slice(-2).join(" ");
  return `${label || "Field"} → ${formatPatchValue(patch.value)}`;
}

const NAMED_COLOR_VALUES: Record<string, string> = {
  red: "#ff0000",
  brightred: "#ff0000",
  yellow: "#ffff00",
  brightyellow: "#ffff00",
  brightgreen: "#00ff00",
  green: "#16a34a",
  blue: "#2563eb",
  teal: "#14b8a6",
  purple: "#9333ea",
  pink: "#ec4899",
  orange: "#f97316",
  black: "#000000",
  white: "#ffffff",
  gray: "#6b7280",
  grey: "#6b7280",
};

function extractColorValue(
  instruction: string,
  values?: LocalStaticStyleValues,
): string | null {
  if (/\b(?:site|website|brand|theme)(?:'s)?\s+primary\s+colou?r\b/i.test(instruction)) {
    return values?.primaryColor || null;
  }

  const hex = instruction.match(/#[0-9a-f]{3,8}\b/i)?.[0];
  if (hex) return hex;

  const compact = instruction.toLowerCase().replace(/[^a-z]/g, "");
  for (const [name, value] of Object.entries(NAMED_COLOR_VALUES)) {
    if (compact.includes(name)) return value;
  }

  return null;
}

function extractFontWeightValue(instruction: string): string | null {
  if (/\b(extra[-\s]?bold|heavy|black|font[-\s]?weight\s*800)\b/i.test(instruction)) {
    return "800";
  }
  if (/\b(bold|font[-\s]?weight\s*700)\b/i.test(instruction)) {
    return "700";
  }
  if (/\b(normal|regular|font[-\s]?weight\s*400)\b/i.test(instruction)) {
    return "400";
  }
  return null;
}

function extractFontSizeValue(instruction: string): string | null {
  const explicit = instruction.match(/\b(\d{1,3})(px|rem|em|%)\b/i);
  if (explicit) return `${explicit[1]}${explicit[2].toLowerCase()}`;

  const prompt = instruction.toLowerCase();
  const multiplier = prompt.match(
    /\b(\d+(?:\.\d+)?)\s*(?:x|times?)\s*(bigger|larger|increase|smaller|reduce|decrease)\b/,
  );
  if (multiplier) {
    const amount = Number(multiplier[1]);
    if (Number.isFinite(amount) && amount > 0) {
      const direction = /smaller|reduce|decrease/.test(multiplier[2])
        ? "smaller"
        : "larger";
      return `scale:${direction}:${amount}`;
    }
  }

  if (/\b(smaller|small|reduce|decrease)\b/.test(prompt)) return "smaller";
  if (/\b(larger|bigger|large|increase)\b/.test(prompt)) return "larger";
  return null;
}

function resolveRelativeFontSize(
  currentValue: unknown,
  requested: string,
): string {
  const scaleMatch = requested.match(
    /^scale:(smaller|larger):(\d+(?:\.\d+)?)$/,
  );
  if (requested !== "smaller" && requested !== "larger" && !scaleMatch) {
    return requested;
  }

  const current = String(currentValue ?? "");
  const match = current.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/i);
  if (!match) return requested === "smaller" ? "14px" : "20px";

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (!Number.isFinite(amount))
    return requested === "smaller" ? "14px" : "20px";

  if (scaleMatch) {
    const direction = scaleMatch[1];
    const multiplier = Number(scaleMatch[2]);
    const next =
      direction === "smaller" ? amount / multiplier : amount * multiplier;
    return `${Math.max(unit === "px" ? 10 : 0.5, Number(next.toFixed(3)))}${unit}`;
  }

  const delta = unit === "px" ? 2 : 0.125;
  const next = requested === "smaller" ? amount - delta : amount + delta;
  return `${Math.max(unit === "px" ? 10 : 0.5, Number(next.toFixed(3)))}${unit}`;
}

function buildDeterministicStylePatch(
  target: AITargetRef,
  instruction: string,
  baselineValue: unknown,
): AIProposalPatch | null {
  const persistedFieldPath = target.persistedFieldPath || target.fieldPath;
  const fieldPath = toFieldPath(persistedFieldPath);
  const leaf = fieldPath.split(".").filter(Boolean).pop()?.toLowerCase() || "";

  if (/color|colour/.test(leaf) || /color|colour/.test(instruction)) {
    const color = extractColorValue(instruction);
    if (
      color &&
      (leaf.includes("color") ||
        /background|bg|border|text|font|heading|button|cta/i.test(instruction))
    ) {
      return {
        aiEditKey: target.aiEditKey,
        blockId: target.blockId,
        fieldPath,
        persistedFieldPath,
        value: color,
        baselineValue,
      };
    }
  }

  if (
    leaf.includes("fontweight") ||
    /\b(extra[-\s]?bold|heavy|black|bold|font[-\s]?weight)\b/i.test(instruction)
  ) {
    const fontWeight = extractFontWeightValue(instruction);
    if (fontWeight) {
      return {
        aiEditKey: target.aiEditKey,
        blockId: target.blockId,
        fieldPath,
        persistedFieldPath,
        value: fontWeight,
        baselineValue,
      };
    }
  }

  if (
    leaf.includes("fontsize") ||
    /\b(font|text).*\bsize\b|\bsize\b|\b(bigger|larger|smaller|increase|decrease)\b/i.test(
      instruction,
    )
  ) {
    const fontSize = extractFontSizeValue(instruction);
    if (fontSize) {
      const baselineFontSize = target.computedStyle?.fontSize || baselineValue;
      return {
        aiEditKey: target.aiEditKey,
        blockId: target.blockId,
        fieldPath,
        persistedFieldPath,
        value: resolveRelativeFontSize(baselineFontSize, fontSize),
        baselineValue,
      };
    }
  }

  return null;
}

function parseLocalStaticStyleFieldPath(path?: string | null):
  | {
      styleKey: string;
      staticId: string;
      property: string;
    }
  | null {
  if (!isLocalStaticStyleFieldPath(path)) return null;
  const raw = String(path).slice(LOCAL_STATIC_STYLE_FIELD_PREFIX.length);
  const [styleKey, staticId, property] = raw.split("|");
  if (!styleKey || !staticId || !property) return null;

  try {
    return {
      styleKey: decodeURIComponent(styleKey),
      staticId: decodeURIComponent(staticId),
      property: decodeURIComponent(property),
    };
  } catch {
    return null;
  }
}

function buildEditorChatEditableTargets(
  targets: StaticStyleTargetRef[] | undefined,
  getCurrentValue: UseEditorAIDeps["getCurrentValue"],
  pageId?: number | string | null,
): EditableSchemaTarget[] {
  if (!targets?.length) return [];

  return targets
    .map((target): EditableSchemaTarget | null => {
      const persistedFieldPath = target.persistedFieldPath || target.fieldPath;
      const localStyle = parseLocalStaticStyleFieldPath(persistedFieldPath);
      if (!localStyle || target.blockId == null) return null;
      const savedValue = getCurrentValue(target.blockId, persistedFieldPath);
      const computedValue =
        target.computedStyle?.[
          localStyle.property as keyof NonNullable<AITargetRef["computedStyle"]>
        ];

      return {
        aiEditKey:
          target.aiEditKey ||
          `blog-static:${String(target.blockId)}:${localStyle.staticId}:${localStyle.property}`,
        kind: "style",
        label: target.label,
        category: target.category,
        pageId: pageId ?? undefined,
        blockId: target.blockId,
        blockType: target.blockType || "BLOG_ARTICLE",
        elementId: localStyle.staticId,
        elementType: localStyle.staticId,
        fieldPath: persistedFieldPath,
        editorPath: persistedFieldPath,
        stylePath: `${localStyle.styleKey}.${localStyle.property}`,
        valueType: "style",
        currentValue: savedValue ?? computedValue,
        metadata: {
          group: "style",
          cssProp: localStyle.property,
          staticId: localStyle.staticId,
          staticType: target.staticType,
          styleKey: localStyle.styleKey,
          blockType: target.blockType || "BLOG_ARTICLE",
          editorPath: persistedFieldPath,
          patchContract:
            "Return patches using this target's fieldPath/editorPath. The frontend will apply it to block.content.staticStyles.",
        },
      };
    })
    .filter((target): target is EditableSchemaTarget => Boolean(target));
}

function resolveStaticStylePatchBaseline(
  patch: { before?: unknown },
  fieldPath: string,
  fallbackValue: unknown,
) {
  if (!isLocalStaticStyleFieldPath(fieldPath)) {
    return patch.before ?? fallbackValue;
  }

  // For request-level dynamic blog style targets, the backend often has no
  // persisted `before` yet. Treat null/empty backend baselines as "not known"
  // and keep the frontend's captured visual/saved value as the conflict guard.
  return patch.before === undefined ||
    patch.before === null ||
    patch.before === ""
    ? fallbackValue
    : patch.before;
}

function resolveTargetBaselineValue(
  target: Pick<AITargetRef, "blockId" | "fieldPath" | "computedStyle">,
  getCurrentValue: UseEditorAIDeps["getCurrentValue"],
) {
  const currentValue = getCurrentValue(target.blockId, target.fieldPath);
  if (
    currentValue !== undefined &&
    currentValue !== null &&
    currentValue !== ""
  ) {
    return currentValue;
  }

  const localStyle = parseLocalStaticStyleFieldPath(target.fieldPath);
  if (!localStyle) {
    return currentValue;
  }

  return (
    target.computedStyle?.[
      localStyle.property as keyof NonNullable<AITargetRef["computedStyle"]>
    ] ?? currentValue
  );
}

function getRequestSchemaBaseline(
  targets: EditableSchemaTarget[],
  blockId: number | string | undefined,
  fieldPath: string,
) {
  const target = targets.find(
    (item) =>
      item.fieldPath === fieldPath &&
      String(item.blockId ?? "") === String(blockId ?? ""),
  );
  return (target as { currentValue?: unknown } | undefined)?.currentValue;
}

function getConflictComparableCurrentValue(
  patch: AIProposalPatch,
  getCurrentValue: UseEditorAIDeps["getCurrentValue"],
) {
  const currentValue = getCurrentValue(patch.blockId, patch.fieldPath);
  if (!isLocalStaticStyleFieldPath(patch.fieldPath)) {
    return currentValue;
  }

  // Empty means "no saved static override". If the baseline was the rendered
  // computed style, this is still unchanged unless a real override exists.
  if (
    currentValue === undefined ||
    currentValue === null ||
    currentValue === ""
  ) {
    return patch.baselineValue;
  }
  return currentValue;
}

function shouldSkipServerRevert(turn: RevertEntry) {
  return turn.patches.some((patch) =>
    isLocalStaticStyleFieldPath(patch.fieldPath),
  );
}

function revertPatchKey(patch: Pick<AIProposalPatch, "blockId" | "fieldPath">) {
  return `${String(patch.blockId ?? "")}::${patch.fieldPath}`;
}

function legacyPatchMapToPatches(
  patchMap: unknown,
  target: AITargetRef,
): AIPatch[] {
  if (!patchMap || typeof patchMap !== "object" || Array.isArray(patchMap)) {
    return [];
  }
  return Object.entries(patchMap as Record<string, unknown>).map(
    ([path, value]) => ({
      aiEditKey: target.aiEditKey,
      blockId: target.blockId,
      path,
      fieldPath: path,
      value,
    }),
  );
}

export function useEditorAI({
  websiteId,
  pageId,
  revertibleTurns = [],
  aiHistory = [],
  getCurrentValue,
  applyPatch,
  onLocalPatchesApplied,
  onRefresh,
  onRefreshAIContext,
  localStaticStyleTargets,
  localStaticStyleValues,
}: UseEditorAIDeps) {
  const [activeRequest, setActiveRequest] = useState(false);
  const [proposal, setProposal] = useState<AIProposal | null>(null);
  const [conflict, setConflict] = useState<AIConflict | null>(null);
  const [error, setError] = useState<WebsiteAIError | null>(null);
  const [localRevertStack, setLocalRevertStack] = useState<RevertEntry[]>([]);
  const [localRedoStack, setLocalRedoStack] = useState<RevertEntry[]>([]);
  // Server turns already reverted (or found dead) this session. The parent's
  // aiHistory only refreshes on a full website reload, so without this a
  // reverted/unrevertible turn would keep being offered for undo.
  const [consumedServerTurnIds, setConsumedServerTurnIds] = useState<
    ReadonlySet<string>
  >(new Set());
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Load chat history from backend aiHistory on mount
  useEffect(() => {
    if (aiHistory.length > 0) {
      const historyMessages: ChatMessage[] = aiHistory
        .filter((item) => item.prompt || item.response)
        .flatMap((item) => {
          const messages: ChatMessage[] = [];
          if (item.prompt) {
            messages.push({
              id: item.turnId || `h_${item.timestamp || Date.now()}`,
              role: "user" as const,
              text: item.prompt,
              turnId: item.turnId,
            });
          }
          if (item.response) {
            // Handle response which might be an object or string
            const responseText = formatAIChatMessageText(item.response);
            if (responseText) {
              messages.push({
                id: `a_${item.timestamp || Date.now()}`,
                role: "assistant" as const,
                text: responseText,
                turnId: item.turnId,
              });
            }
          }
          return messages;
        });
      setChatMessages(historyMessages);
    }
  }, [aiHistory]);

  const attemptsRef = useRef<Map<string, number>>(new Map());
  const editSessionRef = useRef<Map<string, string>>(new Map());

  const latestRevertibleTurns = useMemo(() => {
    // Server turns that duplicate a local entry (same recorded turn) or were
    // already consumed this session are not offered again.
    const localServerIds = new Set(
      localRevertStack
        .map((entry) => entry.serverTurnId)
        .filter((id): id is string => Boolean(id)),
    );
    return revertibleTurns
      .filter((turn) => {
        const id = turnIdFromHistory(turn);
        return id && !consumedServerTurnIds.has(id) && !localServerIds.has(id);
      })
      .slice(0, MAX_REVERT_DEPTH);
  }, [consumedServerTurnIds, localRevertStack, revertibleTurns]);

  const consumeServerTurnIds = useCallback((turnIds: Array<string | null>) => {
    const ids = turnIds.filter((id): id is string => Boolean(id));
    if (!ids.length) return;

    setConsumedServerTurnIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  }, []);

  const attemptKey = (target: AITargetRef, instruction: string) =>
    `${target.blockId ?? "page"}::${target.fieldPath}::${target.aiEditKey ?? ""}::${instruction
      .trim()
      .toLowerCase()}`;

  const getAttempts = useCallback(
    (target: AITargetRef, instruction: string) =>
      attemptsRef.current.get(attemptKey(target, instruction)) ?? 0,
    [],
  );

  const applyBackendPatches = useCallback(
    async (
      patches: AIProposalPatch[],
      meta?: {
        instruction?: string;
        summary?: string;
        turnId?: string;
        aiEditKey?: string;
        waitForLocalPatches?: boolean;
        /** Skip the conflict guard (used when resolving a conflict). */
        force?: boolean;
      },
    ): Promise<boolean> => {
      // Conflict guard: a patch whose CURRENT editor value drifted from the
      // baseline captured when the AI request was made means the user edited the
      // same field while the request was in flight. Surface a conflict instead of
      // silently overwriting their edit.
      if (!meta?.force) {
        const conflicting = patches.find(
          (patch) =>
            !valuesEqual(
              getConflictComparableCurrentValue(patch, getCurrentValue),
              patch.baselineValue,
            ),
        );
        if (conflicting) {
          const userValue = getConflictComparableCurrentValue(
            conflicting,
            getCurrentValue,
          );
          setConflict({
            blockId: conflicting.blockId,
            fieldPath: conflicting.fieldPath,
            userValue,
            aiValue: conflicting.value,
            turnId: meta?.turnId ?? "",
            summary: meta?.summary ?? "",
            patches,
          });
          return false;
        }
      }

      // Apply to LOCAL editor block state using the backend's authoritative
      // editor path. The user persists with the normal "Save Changes" button —
      // we never call generate-content patch mode here (that would be a second
      // writer fighting the editor save) and we never refetch the whole website
      // (a full refresh races with lock/approval polling and briefly rehydrates
      // stale template data, making the selection flip old<->new).
      const applied = patches.filter(isLocallyApplicablePatch);
      const appliedBeforeValues = new Map<string, unknown>();
      applied.forEach((patch) => {
        appliedBeforeValues.set(
          revertPatchKey(patch),
          getCurrentValue(patch.blockId, patch.fieldPath),
        );
        applyPatch(patch.blockId, patch.fieldPath, patch.value);
      });

      // Let the editor flush the local change into all of its state mirrors
      // (blocks/blocksRef/pages/selectedPage/persistedPages) and mark dirty.
      const localPatchFlush = onLocalPatchesApplied?.(
        applied.length ? applied : patches,
      );
      if (meta?.waitForLocalPatches !== false) {
        await localPatchFlush;
      } else {
        void Promise.resolve(localPatchFlush).catch(() => {
          /* local save bookkeeping only — ignore failures */
        });
      }

      const localTurnId = applied.length
        ? meta?.turnId ||
          `local:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`
        : null;

      if (applied.length && localTurnId) {
        setLocalRevertStack((prev) =>
          [
            ...prev.filter((entry) => entry.turnId !== localTurnId),
            {
              turnId: localTurnId,
              label: meta?.summary || meta?.instruction || "AI change",
              patches: applied.map((patch) => ({
                blockId: patch.blockId,
                fieldPath: patch.fieldPath,
                persistedFieldPath: patch.persistedFieldPath,
                beforeValue: isLocalStaticStyleFieldPath(patch.fieldPath)
                  ? appliedBeforeValues.get(revertPatchKey(patch))
                  : patch.baselineValue,
                afterValue: patch.value,
              })),
            },
          ].slice(-MAX_REVERT_DEPTH),
        );
        setLocalRedoStack([]);
      }

      // Best-effort revert bookkeeping. Sends explicit before/after so the turn
      // is accurate regardless of when the editor save lands. Never blocks the UI.
      if (applied.length) {
        recordAppliedEdit({
          websiteId,
          turnId: localTurnId ?? undefined,
          aiEditKey: meta?.aiEditKey ?? applied[0]?.aiEditKey,
          instruction: meta?.instruction,
          summary: meta?.summary,
          patches: applied.map((patch) => ({
            aiEditKey: patch.aiEditKey,
            fieldPath: patch.persistedFieldPath,
            editorPath: patch.fieldPath,
            before: patch.baselineValue,
            value: patch.value,
          })),
        })
          .then((result) => {
            if (!result?.turnId) return;
            if (!localTurnId) return;
            setLocalRevertStack((prev) =>
              prev.map((entry) =>
                entry.turnId === localTurnId
                  ? { ...entry, serverTurnId: result.turnId || undefined }
                  : entry,
              ),
            );
          })
          .catch(() => {
            /* bookkeeping only — ignore failures */
          });
      }
      return true;
    },
    [applyPatch, getCurrentValue, onLocalPatchesApplied, websiteId],
  );

  const applyLocalTurn = useCallback(
    async (turn: RevertEntry, direction: "undo" | "redo") => {
      const applied = turn.patches.map((patch) => {
        const value =
          direction === "undo" ? patch.beforeValue : patch.afterValue;
        const websiteFieldPath = patch.persistedFieldPath || patch.fieldPath;
        if (isWebsiteFieldPath(websiteFieldPath)) {
          applyPatch(undefined, websiteFieldPath, value);
          return {
            blockId: patch.blockId,
            fieldPath: websiteFieldPath,
            persistedFieldPath: websiteFieldPath,
            value,
            baselineValue: getCurrentValue(undefined, websiteFieldPath),
          };
        }

        // Attempt to resolve persisted path if available to ensure correct
        // block lookup when block ids shifted after saves.
        const persisted =
          patch.persistedFieldPath ||
          toPersistedBlockContentPath(patch.fieldPath, pageId, patch.blockId);

        let fieldPath = toFieldPath(persisted);

        // If resolving the persisted path yields no current value for the
        // expected block (likely because block ids changed), fall back to the
        // original editor-internal `fieldPath` the revert entry carried. This
        // improves robustness when block ids are remapped by backend saves.
        const current = getCurrentValue(patch.blockId, fieldPath);
        if (typeof current === "undefined") {
          fieldPath = patch.fieldPath || fieldPath;
        }

        applyPatch(patch.blockId, fieldPath, value);
        return {
          blockId: patch.blockId,
          fieldPath,
          persistedFieldPath: persisted,
          value,
          baselineValue: getCurrentValue(patch.blockId, fieldPath),
        };
      });

      await onLocalPatchesApplied?.(applied);
      if (direction === "undo") {
        setLocalRevertStack((prev) =>
          prev.filter((entry) => entry.turnId !== turn.turnId),
        );
        setLocalRedoStack((prev) => [...prev, turn].slice(-MAX_REVERT_DEPTH));
      } else {
        setLocalRedoStack((prev) =>
          prev.filter((entry) => entry.turnId !== turn.turnId),
        );
        setLocalRevertStack((prev) => [...prev, turn].slice(-MAX_REVERT_DEPTH));
      }
    },
    [applyPatch, getCurrentValue, onLocalPatchesApplied, pageId],
  );

  const askAI = useCallback(
    async (target: AITargetRef, instruction: string): Promise<boolean> => {
      if (activeRequest || chatLoading) return false;

      const requestTarget = resolveInstructionTarget(target, instruction);
      const key = attemptKey(requestTarget, instruction);
      const priorAttempts = attemptsRef.current.get(key) ?? 0;
      if (priorAttempts >= MAX_ATTEMPTS) {
        setError({
          code: "EDIT_ATTEMPT_LIMIT",
          message:
            "You've tried this edit a few times. Apply it, cancel it, or try a different change.",
        });
        return false;
      }

      setError(null);
      setProposal(null);
      setConflict(null);
      setActiveRequest(true);

      let baselineValue: unknown = undefined;
      let deterministicPatch: AIProposalPatch | null = null;
      const apiTarget: EditElementTarget = {
        kind: requestTarget.kind,
        fieldPath:
          requestTarget.persistedFieldPath ??
          (requestTarget.kind === "editable" || requestTarget.kind === "section"
            ? toPersistedBlockContentPath(
                requestTarget.fieldPath,
                pageId,
                requestTarget.blockId,
              )
            : requestTarget.fieldPath),
        aiEditKey: requestTarget.aiEditKey,
      };

      try {
        baselineValue = resolveTargetBaselineValue(
          requestTarget,
          getCurrentValue,
        );
        const editSessionId =
          editSessionRef.current.get(key) ||
          buildEditSessionId(websiteId, requestTarget);
        editSessionRef.current.set(key, editSessionId);

        deterministicPatch = buildDeterministicStylePatch(
          requestTarget,
          instruction,
          baselineValue,
        );

        if (isLocalStaticStyleFieldPath(requestTarget.fieldPath)) {
          const localTargetSchema = buildEditorChatEditableTargets(
            requestTarget.styleTargets?.length
              ? requestTarget.styleTargets
              : [
                  {
                    blockId: requestTarget.blockId,
                    fieldPath: requestTarget.fieldPath,
                    persistedFieldPath:
                      requestTarget.persistedFieldPath || requestTarget.fieldPath,
                    aiEditKey: requestTarget.aiEditKey,
                    label: requestTarget.label,
                    computedStyle: requestTarget.computedStyle,
                  },
                ],
            getCurrentValue,
            pageId,
          );
          const chatResult = await editorChat({
            websiteId,
            scope: "target",
            pageId: pageId ?? undefined,
            blockId: requestTarget.blockId,
            target: {
              kind: "target",
              fieldPath: apiTarget.fieldPath,
              aiEditKey: apiTarget.aiEditKey,
            },
            message: instruction,
            editableTargets: localTargetSchema.length
              ? localTargetSchema
              : undefined,
            context: {
              primaryColor: localStaticStyleValues?.primaryColor,
              localStaticStyleFieldPrefix: LOCAL_STATIC_STYLE_FIELD_PREFIX,
              schemaNote:
                "Use editableTargets as the allowed patch schema for this selected dynamic blog page style. Return patches against fieldPath/editorPath from those targets.",
            },
          });
          const chatPatches = normalizeChatPatches(chatResult.patches || [])
            .filter((patch) => patch.value != null)
            .map((patch) => {
              const blockId = patch.blockId ?? requestTarget.blockId;
              const normalizedStaticStylePath =
                normalizeBackendStaticStyleFieldPath(
                  patch.persistedFieldPath || patch.fieldPath,
                );
              const fieldPath = normalizedStaticStylePath || patch.fieldPath;
              const persistedFieldPath =
                normalizedStaticStylePath || patch.persistedFieldPath;
              const fallbackBaseline =
                getRequestSchemaBaseline(
                  localTargetSchema,
                  blockId,
                  fieldPath,
                ) ?? getCurrentValue(blockId, fieldPath);
              return {
                aiEditKey: patch.aiEditKey,
                blockId,
                pageId: patch.pageId,
                fieldPath,
                persistedFieldPath,
                value: patch.value,
                baselineValue: resolveStaticStylePatchBaseline(
                  patch,
                  fieldPath,
                  fallbackBaseline,
                ),
              };
            });
          if (chatPatches.length) {
            attemptsRef.current.set(key, priorAttempts + 1);
            const chatTurnId = (chatResult as { turnId?: string }).turnId;
            return await applyBackendPatches(chatPatches, {
              instruction,
              summary: chatResult.reply,
              turnId:
                typeof chatTurnId === "string"
                  ? chatTurnId
                  : chatResult.sessionId,
              aiEditKey: chatPatches[0]?.aiEditKey ?? requestTarget.aiEditKey,
            });
          }
          setError({
            code: "INVALID_EDIT_RESULT",
            message:
              chatResult.reply ||
              "The AI service did not return an editable patch for this blog element.",
          });
          return false;
        }

        const requestPayload = {
          websiteId,
          pageId: pageId ?? undefined,
          blockId: requestTarget.blockId,
          target: apiTarget,
          instruction,
          editSessionId,
        };
        let result: Awaited<ReturnType<typeof editElement>>;
        try {
          result = await editElement(requestPayload);
        } catch (err) {
          const aiErr =
            err instanceof WebsiteAIRequestError
              ? err.aiError
              : normalizeWebsiteAIError(err);

          // A stale aiEditKey can happen after block saves/schema resyncs. If
          // the persisted fieldPath is still valid, retry once by fieldPath only
          // before treating it as unsupported.
          if (aiErr.code === "UNSUPPORTED_EDIT_FIELD" && apiTarget.aiEditKey) {
            result = await editElement({
              ...requestPayload,
              target: {
                ...apiTarget,
                aiEditKey: undefined,
              },
            });
          } else {
            throw err;
          }
        }

        const attempt = result.attempt ?? priorAttempts + 1;
        attemptsRef.current.set(key, attempt);

        const rawPatch = (result as unknown as { patch?: unknown }).patch;
        const backendPatches =
          result.patches ||
          result.data?.patch ||
          (Array.isArray(rawPatch)
            ? rawPatch
            : legacyPatchMapToPatches(rawPatch, requestTarget));
        const previewPatches = backendPatches.length
          ? normalizePreviewPatches(
              backendPatches,
              requestTarget,
              getCurrentValue,
            )
          : [
              {
                aiEditKey: result.target?.aiEditKey ?? requestTarget.aiEditKey,
                blockId: requestTarget.blockId,
                fieldPath: requestTarget.fieldPath,
                persistedFieldPath:
                  result.target?.fieldPath ??
                  requestTarget.persistedFieldPath ??
                  (requestTarget.kind === "editable" ||
                  requestTarget.kind === "section"
                    ? toPersistedBlockContentPath(
                        requestTarget.fieldPath,
                        pageId,
                        requestTarget.blockId,
                      )
                    : requestTarget.fieldPath),
                value: result.previewText,
                baselineValue,
              },
            ];
        // Use the value captured BEFORE the (async) AI call as the conflict
        // baseline for the requested field, so a mid-flight user edit to the same
        // field is detected even when the backend did not echo a `before`.
        const patches = previewPatches.map((patch) =>
          patch.fieldPath === requestTarget.fieldPath &&
          String(patch.blockId ?? "") === String(requestTarget.blockId ?? "")
            ? { ...patch, baselineValue }
            : patch,
        );
        if (!patches.length || patches.every((patch) => patch.value == null)) {
          setError({
            code: "INVALID_EDIT_RESULT",
            message:
              "The AI service did not return a result. Please try again.",
          });
          return false;
        }

        return await applyBackendPatches(patches, {
          instruction,
          summary: result.summary,
          turnId: result.turnId,
          aiEditKey: result.target?.aiEditKey ?? requestTarget.aiEditKey,
        });
      } catch (err) {
        const aiErr =
          err instanceof WebsiteAIRequestError
            ? err.aiError
            : normalizeWebsiteAIError(err);
        const fallbackPatch =
          aiErr.code === "AI_PROVIDER_UNAVAILABLE" ||
          aiErr.code === "AI_UNAVAILABLE" ||
          aiErr.code === "AI_FAILED" ||
          (aiErr.code === "UNSUPPORTED_EDIT_FIELD" && deterministicPatch)
            ? buildDeterministicStylePatch(
                requestTarget,
                instruction,
                baselineValue,
              )
            : null;

        if (fallbackPatch) {
          const attempt = priorAttempts + 1;
          attemptsRef.current.set(key, attempt);
          return await applyBackendPatches([fallbackPatch], {
            instruction,
            aiEditKey: requestTarget.aiEditKey,
          });
        }

        // No deterministic patch (content/text rewrites): retry the same
        // rewrite through editor-chat before giving up. The provider behind
        // the backend fails transiently, so one extra chat attempt is allowed.
        if (CHAT_RETRYABLE_CODES.has(aiErr.code)) {
          try {
            // Backend moderation rejects copy it deems unrelated to the
            // business/category. Steering the rewrite towards on-brand,
            // same-length copy measurably raises the moderation pass rate.
            const chatMessage = isStyleInstruction(instruction)
              ? instruction
              : `${instruction.replace(/[.\s]+$/, "")}. Keep the new text directly relevant to this business and its category, and roughly the same length as the current text.`;
            let chatResult: Awaited<ReturnType<typeof editorChat>>;
            const retryEditableTargets = buildEditorChatEditableTargets(
              requestTarget.styleTargets,
              getCurrentValue,
              pageId,
            );
            for (let chatAttempt = 1; ; chatAttempt += 1) {
              try {
                chatResult = await editorChat({
                  websiteId,
                  scope: "target",
                  pageId: pageId ?? undefined,
                  blockId: requestTarget.blockId,
                  target: {
                    kind: "target",
                    fieldPath: apiTarget.fieldPath,
                    aiEditKey: apiTarget.aiEditKey,
                  },
                  message: chatMessage,
                  editableTargets: retryEditableTargets.length
                    ? retryEditableTargets
                    : undefined,
                  context: {
                    primaryColor: localStaticStyleValues?.primaryColor,
                    localStaticStyleFieldPrefix: LOCAL_STATIC_STYLE_FIELD_PREFIX,
                  },
                });
                break;
              } catch (chatCallErr) {
                const chatCallAiErr =
                  chatCallErr instanceof WebsiteAIRequestError
                    ? chatCallErr.aiError
                    : normalizeWebsiteAIError(chatCallErr);
                if (
                  chatAttempt >= 2 ||
                  !CHAT_RETRYABLE_CODES.has(chatCallAiErr.code)
                ) {
                  throw chatCallErr;
                }
                await new Promise((resolve) => setTimeout(resolve, 2000));
              }
            }
            const chatPatches = normalizeChatPatches(chatResult.patches || [])
              .filter((patch) => patch.value != null)
              .map((patch) => {
                const blockId = patch.blockId ?? requestTarget.blockId;
                const normalizedStaticStylePath =
                  normalizeBackendStaticStyleFieldPath(
                    patch.persistedFieldPath || patch.fieldPath,
                  );
                const fieldPath = normalizedStaticStylePath || patch.fieldPath;
                const persistedFieldPath =
                  normalizedStaticStylePath || patch.persistedFieldPath;
                const isRequestedField =
                  fieldPath === requestTarget.fieldPath &&
                  String(blockId ?? "") === String(requestTarget.blockId ?? "");
                const fallbackBaseline =
                  getRequestSchemaBaseline(
                    retryEditableTargets,
                    blockId,
                    fieldPath,
                  ) ?? getCurrentValue(blockId, fieldPath);
                return {
                  aiEditKey: patch.aiEditKey,
                  blockId,
                  pageId: patch.pageId,
                  fieldPath,
                  persistedFieldPath,
                  value: patch.value,
                  baselineValue: isRequestedField
                    ? baselineValue
                    : resolveStaticStylePatchBaseline(
                        patch,
                        fieldPath,
                        fallbackBaseline,
                      ),
                };
              });
            if (chatPatches.length) {
              attemptsRef.current.set(key, priorAttempts + 1);
              const chatTurnId = (chatResult as { turnId?: string }).turnId;
              return await applyBackendPatches(chatPatches, {
                instruction,
                summary: chatResult.reply,
                turnId:
                  typeof chatTurnId === "string"
                    ? chatTurnId
                    : chatResult.sessionId,
                aiEditKey: chatPatches[0]?.aiEditKey ?? requestTarget.aiEditKey,
              });
            }
            setError({
              code: "INVALID_EDIT_RESULT",
              message:
                chatResult.reply ||
                "The AI service did not return a result. Please try again.",
            });
            return false;
          } catch (chatErr) {
            setError(
              chatErr instanceof WebsiteAIRequestError
                ? chatErr.aiError
                : normalizeWebsiteAIError(chatErr),
            );
            return false;
          }
        }

        setError(aiErr);
        return false;
      } finally {
        setActiveRequest(false);
      }
    },
    [
      activeRequest,
      applyBackendPatches,
      chatLoading,
      getCurrentValue,
      localStaticStyleValues,
      pageId,
      websiteId,
    ],
  );

  const cancelProposal = useCallback(() => {
    setProposal(null);
  }, []);

  const applyProposal = useCallback(async (): Promise<boolean> => {
    if (!proposal) return false;

    setActiveRequest(true);
    setError(null);
    try {
      // applyBackendPatches performs the conflict guard (and sets `conflict`
      // when the user edited the same field mid-flight), then applies locally.
      const ok = await applyBackendPatches(proposal.patches, {
        instruction: proposal.instruction,
        summary: proposal.summary,
        turnId: proposal.turnId,
      });
      if (ok) setProposal(null);
      return ok;
    } catch (err) {
      const aiErr =
        err instanceof WebsiteAIRequestError
          ? err.aiError
          : normalizeWebsiteAIError(err);
      setError(aiErr);
      return false;
    } finally {
      setActiveRequest(false);
    }
  }, [applyBackendPatches, proposal]);

  const resolveConflict = useCallback(
    async (choice: "user" | "ai") => {
      if (!conflict) return;

      const patchesToApply =
        choice === "ai"
          ? conflict.patches
          : conflict.patches.filter((patch) =>
              valuesEqual(
                getCurrentValue(patch.blockId, patch.fieldPath),
                patch.baselineValue,
              ),
            );

      if (!patchesToApply.length) {
        setConflict(null);
        setProposal(null);
        return;
      }

      setActiveRequest(true);
      setError(null);
      try {
        // The conflict was already surfaced and the user chose — force past the
        // guard so applying the AI version is not re-flagged as a conflict.
        await applyBackendPatches(patchesToApply, {
          summary: conflict.summary,
          turnId: conflict.turnId,
          force: true,
        });
        setConflict(null);
        setProposal(null);
      } catch (err) {
        const aiErr =
          err instanceof WebsiteAIRequestError
            ? err.aiError
            : normalizeWebsiteAIError(err);
        setError(aiErr);
      } finally {
        setActiveRequest(false);
      }
    },
    [applyBackendPatches, conflict, getCurrentValue],
  );

  const revertLast = useCallback(async (): Promise<void> => {
    const localTurn = localRevertStack[localRevertStack.length - 1];
    const serverTurn = localTurn ? null : latestRevertibleTurns[0];
    const turnId = serverTurn
      ? turnIdFromHistory(serverTurn)
      : localTurn
        ? turnIdFromHistory(localTurn)
        : null;
    if (!turnId) return;

    setActiveRequest(true);
    setError(null);
    try {
      if (localTurn) {
        await applyLocalTurn(localTurn, "undo");
        if (localTurn.serverTurnId) {
          consumeServerTurnIds([localTurn.serverTurnId]);
          if (!shouldSkipServerRevert(localTurn)) {
            revertAITurn({ websiteId, turnId: localTurn.serverTurnId }).catch(
              () => {
                /* backend bookkeeping only */
              },
            );
          }
        }
        return;
      }

      const result = await revertAITurn({ websiteId, turnId });
      result.restored?.forEach((patch) => {
        const blockId = patch.fieldPath.match(
          /blocks\.([^.]+)\.content\./,
        )?.[1];
        if (blockId && isBlockContentPath(patch.fieldPath)) {
          applyPatch(blockId, toFieldPath(patch.fieldPath), patch.value);
        } else if (isWebsiteFieldPath(patch.fieldPath)) {
          applyPatch(undefined, patch.fieldPath, patch.value);
        }
      });
      if (turnId) {
        consumeServerTurnIds([turnId]);
      }
      await onRefreshAIContext?.();
    } catch (err) {
      const aiErr =
        err instanceof WebsiteAIRequestError
          ? err.aiError
          : normalizeWebsiteAIError(err);
      if (localTurn) {
        await applyLocalTurn(localTurn, "undo");
        return;
      }
      if (turnId && aiErr.code === "TURN_NOT_REVERTIBLE") {
        consumeServerTurnIds([
          turnId,
          ...latestRevertibleTurns.map((turn) => turnIdFromHistory(turn)),
        ]);
        await onRefreshAIContext?.();
        return;
      }
      if (turnId && aiErr.code === "TARGETS_GONE") {
        consumeServerTurnIds([turnId]);
      }
      setError(aiErr);
      await onRefreshAIContext?.();
    } finally {
      setActiveRequest(false);
    }
  }, [
    applyPatch,
    applyLocalTurn,
    consumeServerTurnIds,
    latestRevertibleTurns,
    localRevertStack,
    onRefreshAIContext,
    websiteId,
  ]);

  const redoLast = useCallback(async (): Promise<void> => {
    const localTurn = localRedoStack[localRedoStack.length - 1];
    if (!localTurn || activeRequest) return;

    setActiveRequest(true);
    setError(null);
    try {
      await applyLocalTurn(localTurn, "redo");
      if (localTurn.serverTurnId) {
        setConsumedServerTurnIds((prev) => {
          const next = new Set(prev);
          next.delete(localTurn.serverTurnId as string);
          return next;
        });
      }
    } catch (err) {
      const aiErr =
        err instanceof WebsiteAIRequestError
          ? err.aiError
          : normalizeWebsiteAIError(err);
      setError(aiErr);
    } finally {
      setActiveRequest(false);
    }
  }, [activeRequest, applyLocalTurn, localRedoStack]);

  const sendChat = useCallback(
    async (
      scope: EditorChatScope,
      message: string,
      opts?: {
        blockId?: number | string;
        fieldPath?: string;
        aiEditKey?: string;
      },
    ): Promise<void> => {
      if (chatLoading || activeRequest) return;
      const text = message.trim();
      if (!text) return;

      // Add user message immediately - this should render right away
      setChatMessages((prev) => [
        ...prev,
        { id: `u_${Date.now()}`, role: "user", text },
      ]);

      setChatLoading(true);
      setError(null);

      try {
        const chatEditableTargets = buildEditorChatEditableTargets(
          localStaticStyleTargets,
          getCurrentValue,
          pageId,
        );
        const scopedTarget =
          scope === "target" || scope === "section"
            ? {
                kind: scope,
                fieldPath: opts?.fieldPath,
                aiEditKey: opts?.aiEditKey,
              }
            : undefined;
        const result = await editorChat({
          websiteId,
          scope,
          pageId: pageId ?? undefined,
          blockId: opts?.blockId,
          target: scopedTarget,
          message: text,
          editableTargets: chatEditableTargets.length
            ? chatEditableTargets
            : undefined,
          context: {
            primaryColor: localStaticStyleValues?.primaryColor,
            localStaticStyleFieldPrefix: LOCAL_STATIC_STYLE_FIELD_PREFIX,
            schemaNote:
              "Use editableTargets as the allowed patch schema for dynamic blog page styles. Return patches against fieldPath/editorPath from those targets.",
          },
        });
        const normalizedPatches = normalizeChatPatches(result.patches || []);
        const patches = normalizedPatches
          .filter((patch) => patch.value != null)
          .map((patch) => {
            const normalizedStaticStylePath =
              normalizeBackendStaticStyleFieldPath(
                patch.persistedFieldPath || patch.fieldPath,
              );
            const fieldPath = normalizedStaticStylePath || patch.fieldPath;
            const persistedFieldPath =
              normalizedStaticStylePath || patch.persistedFieldPath;
            const fallbackBaseline =
              getRequestSchemaBaseline(
                chatEditableTargets,
                patch.blockId,
                fieldPath,
              ) ?? getCurrentValue(patch.blockId, fieldPath);
            return {
              aiEditKey: patch.aiEditKey,
              blockId: patch.blockId,
              pageId: patch.pageId,
              fieldPath,
              persistedFieldPath,
              value: patch.value,
              baselineValue: resolveStaticStylePatchBaseline(
                patch,
                fieldPath,
                fallbackBaseline,
              ),
            };
          });
        const resultWithTurn = result as unknown as { turnId?: string };
        const applied = patches.length
          ? await applyBackendPatches(patches, {
              instruction: text,
              summary: result.reply,
              turnId:
                typeof resultWithTurn.turnId === "string"
                  ? resultWithTurn.turnId
                  : result.sessionId,
              aiEditKey: patches[0]?.aiEditKey,
            })
          : false;

        setChatMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            text: formatAIChatMessageText(
              result.reply,
              applied
                ? `${patches.length} AI ${patches.length === 1 ? "change" : "changes"} applied.`
                : "Done.",
            ),
            applied,
            sessionId: result.sessionId,
          },
        ]);
      } catch (err) {
        const aiErr =
          err instanceof WebsiteAIRequestError
            ? err.aiError
            : normalizeWebsiteAIError(err);
        const failureId =
          typeof aiErr.meta?.failureId === "string"
            ? ` (${aiErr.meta.failureId})`
            : "";
        setChatMessages((prev) => [
          ...prev,
          {
            id: `e_${Date.now()}`,
            role: "assistant",
            text: `${aiErr.message}${failureId}`,
            isError: true,
          },
        ]);
        setError(aiErr);
      } finally {
        setChatLoading(false);
      }
    },
    [
      activeRequest,
      applyBackendPatches,
      chatLoading,
      getCurrentValue,
      localStaticStyleTargets,
      localStaticStyleValues,
      pageId,
      websiteId,
    ],
  );

  const recreateSite = useCallback(
    async (message: string): Promise<void> => {
      if (chatLoading || activeRequest) return;
      setChatMessages((prev) => [
        ...prev,
        { id: `u_${Date.now()}`, role: "user", text: message },
      ]);
      setChatLoading(true);
      setError(null);
      try {
        const result = await recreateWebsiteWithAI({
          websiteId,
          confirm: true,
          questionnaireData: { prompt: message },
        });
        setChatMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            text: "Full-site recreation started.",
            sessionId: result.sessionId,
            versionId: result.versionId,
          },
        ]);
        // Trigger a refresh to let the parent pick up the new version; poll a
        // few times in case the backend takes a moment to persist the version.
        try {
          if (onRefresh) {
            for (let i = 0; i < 5; i++) {
              // Ask parent to refresh website data
              // eslint-disable-next-line no-await-in-loop
              await onRefresh();
              // Wait a short moment for the backend to settle
              // eslint-disable-next-line no-await-in-loop
              await new Promise((r) => setTimeout(r, 1500));
            }
          }
        } catch {
          // Best-effort only — ignore polling errors
        }
      } catch (err) {
        const aiErr =
          err instanceof WebsiteAIRequestError
            ? err.aiError
            : normalizeWebsiteAIError(err);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `e_${Date.now()}`,
            role: "assistant",
            text: aiErr.message,
            isError: true,
          },
        ]);
        setError(aiErr);
      } finally {
        setChatLoading(false);
      }
    },
    [activeRequest, chatLoading, websiteId],
  );

  const restoreVersion = useCallback(
    async (versionId: string): Promise<void> => {
      if (!versionId || chatLoading || activeRequest) return;
      setChatLoading(true);
      setError(null);
      try {
        await restoreWebsiteAIVersion({ websiteId, versionId });
        setChatMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            text: "Website version restored.",
          },
        ]);
        await onRefresh?.();
      } catch (err) {
        const aiErr =
          err instanceof WebsiteAIRequestError
            ? err.aiError
            : normalizeWebsiteAIError(err);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `e_${Date.now()}`,
            role: "assistant",
            text: aiErr.message,
            isError: true,
          },
        ]);
        setError(aiErr);
      } finally {
        setChatLoading(false);
      }
    },
    [activeRequest, chatLoading, onRefresh, websiteId],
  );

  const applyChatMessage = useCallback(
    async (messageId: string) => {
      const message = chatMessages.find((item) => item.id === messageId);
      const applicablePatches = message?.pendingPatches ?? [];
      if (!applicablePatches.length) return;

      setChatLoading(true);
      setError(null);
      try {
        // Same contract as selected-element edits: apply locally using the
        // backend editor path, persist via the editor Save Changes flow, record
        // for revert — no generate-content patch mode and no full refresh.
        const appliedChat = applicablePatches.filter(isLocallyApplicablePatch);
        appliedChat.forEach((patch) => {
          applyPatch(patch.blockId, patch.fieldPath, patch.value);
        });
        if (appliedChat.length) {
          recordAppliedEdit({
            websiteId,
            aiEditKey: appliedChat[0]?.aiEditKey,
            patches: appliedChat.map((patch) => ({
              aiEditKey: patch.aiEditKey,
              fieldPath: patch.persistedFieldPath,
              editorPath: patch.fieldPath,
              before: patch.before,
              value: patch.value,
            })),
          }).catch(() => {
            /* bookkeeping only */
          });
        }
        await onLocalPatchesApplied?.(
          appliedChat.map((patch) => ({
            aiEditKey: patch.aiEditKey,
            blockId: patch.blockId,
            pageId: patch.pageId,
            fieldPath: patch.fieldPath,
            persistedFieldPath: patch.persistedFieldPath,
            value: patch.value,
            baselineValue: patch.before,
          })),
        );
        setChatMessages((prev) =>
          prev.map((item) =>
            item.id === messageId
              ? { ...item, pendingPatches: undefined }
              : item,
          ),
        );
      } catch (err) {
        const aiErr =
          err instanceof WebsiteAIRequestError
            ? err.aiError
            : normalizeWebsiteAIError(err);
        setError(aiErr);
      } finally {
        setChatLoading(false);
      }
    },
    [applyPatch, chatMessages, onLocalPatchesApplied, websiteId],
  );

  const dismissChatPatches = useCallback((messageId: string) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, pendingPatches: undefined } : m,
      ),
    );
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const clearChatHistory = useCallback(() => {
    // Clear local chat messages only - backend history remains intact
    // This allows users to start fresh in their current session
    setChatMessages([]);
  }, []);

  return {
    activeRequest,
    proposal,
    conflict,
    error,
    revertStack: localRevertStack.length
      ? localRevertStack
      : latestRevertibleTurns,
    revertDepth: localRevertStack.length || latestRevertibleTurns.length,
    redoDepth: localRedoStack.length,
    chatMessages,
    chatLoading,
    askAI,
    applyProposal,
    cancelProposal,
    resolveConflict,
    getAttempts,
    revertLast,
    redoLast,
    sendChat,
    recreateSite,
    restoreVersion,
    applyChatMessage,
    dismissChatPatches,
    clearError,
    clearChatHistory,
  };
}

export type EditorAIController = ReturnType<typeof useEditorAI>;
