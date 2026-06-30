/**
 * useEditorAI — orchestrates editor-side website AI interactions.
 *
 * Backend contract note:
 * - edit-element and editor-chat are preview-only.
 * - Apply must call POST /ai/generate-content in patch mode so the backend
 *   persists the edit and records a revertible AI turn.
 */

import { useCallback, useMemo, useRef, useState } from "react";
import {
  applyWebsiteAIPatches,
  editElement,
  editorChat,
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
  getPatchFieldPath,
  isBlockContentPath,
  normalizeChatPatches,
  toPersistedBlockContentPath,
  toFieldPath,
  valuesEqual,
} from "./aiPatchUtils";

export const MAX_ATTEMPTS = 3;
export const MAX_REVERT_DEPTH = 2;

export interface AITargetRef {
  blockId?: number | string;
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
    fieldPath: string;
    persistedFieldPath?: string;
    aiEditKey?: string;
    label?: string;
    category?: string;
    computedStyle?: AITargetRef["computedStyle"];
  }>;
}

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
  patches: Array<{
    blockId?: number | string;
    fieldPath: string;
    beforeValue: unknown;
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
  sessionId?: string;
  versionId?: string;
  isError?: boolean;
}

export interface UseEditorAIDeps {
  websiteId: number;
  pageId: number | null;
  revertibleTurns?: AIHistoryEntry[];
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
}

function buildEditSessionId(
  websiteId: number,
  target: AITargetRef,
): string {
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

  if (/\b(colou?r|teal|yellow|red|green|blue|purple|black|white|gr[ae]y)\b/.test(prompt)) {
    if (path.includes("color") || path.includes("colour")) score += 100;
    if (path.includes("style")) score += 20;
    if (/\b(button|cta)\b/.test(prompt) && /\b(text|label|copy)\b/.test(prompt)) {
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
  if (/\b(font|size|bigger|larger|smaller|increase|decrease|weight|bold|italic|underline|align|alignment|opacity|width|height)\b/.test(prompt)) {
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
    const fieldPath = toFieldPath(persistedFieldPath);
    const blockId = patch.blockId ?? target.blockId;
    return {
      aiEditKey: patch.aiEditKey,
      blockId,
      pageId: patch.pageId,
      fieldPath,
      persistedFieldPath,
      value: patch.value ?? patch.after,
      baselineValue: patch.before ?? getCurrentValue(blockId, fieldPath),
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
  const label = patch.fieldPath
    .split(".")
    .filter(Boolean)
    .slice(-2)
    .join(" ");
  return `${label || "Field"} → ${formatPatchValue(patch.value)}`;
}

const NAMED_COLOR_VALUES: Record<string, string> = {
  red: "#ff0000",
  brightred: "#ff0000",
  yellow: "#ffff00",
  brightyellow: "#ffff00",
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

function extractColorValue(instruction: string): string | null {
  const hex = instruction.match(/#[0-9a-f]{3,8}\b/i)?.[0];
  if (hex) return hex;

  const compact = instruction.toLowerCase().replace(/[^a-z]/g, "");
  for (const [name, value] of Object.entries(NAMED_COLOR_VALUES)) {
    if (compact.includes(name)) return value;
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

function resolveRelativeFontSize(currentValue: unknown, requested: string): string {
  const scaleMatch = requested.match(/^scale:(smaller|larger):(\d+(?:\.\d+)?)$/);
  if (requested !== "smaller" && requested !== "larger" && !scaleMatch) {
    return requested;
  }

  const current = String(currentValue ?? "");
  const match = current.match(/^(\d+(?:\.\d+)?)(px|rem|em|%)$/i);
  if (!match) return requested === "smaller" ? "14px" : "20px";

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (!Number.isFinite(amount)) return requested === "smaller" ? "14px" : "20px";

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
  getCurrentValue,
  applyPatch,
  onLocalPatchesApplied,
  onRefresh,
}: UseEditorAIDeps) {
  const [activeRequest, setActiveRequest] = useState(false);
  const [proposal, setProposal] = useState<AIProposal | null>(null);
  const [conflict, setConflict] = useState<AIConflict | null>(null);
  const [error, setError] = useState<WebsiteAIError | null>(null);
  const [localRevertStack, setLocalRevertStack] = useState<RevertEntry[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  const attemptsRef = useRef<Map<string, number>>(new Map());
  const editSessionRef = useRef<Map<string, string>>(new Map());

  const latestRevertibleTurns = useMemo(
    () => revertibleTurns.slice(0, MAX_REVERT_DEPTH),
    [revertibleTurns],
  );

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
    async (patches: AIProposalPatch[]) => {
      await applyWebsiteAIPatches({
        websiteId,
        patches: patches.map((patch) => ({
          aiEditKey: patch.aiEditKey,
          fieldPath: patch.persistedFieldPath,
          value: patch.value,
        })),
      });

      patches.forEach((patch) => {
        if (
          patch.blockId != null &&
          isBlockContentPath(patch.persistedFieldPath)
        ) {
          applyPatch(patch.blockId, patch.fieldPath, patch.value);
        }
      });

      // Do not immediately refetch the whole website after a successful patch.
      // The backend patch endpoint has already persisted the change and the
      // editor state is updated below. A full refresh can race with editor
      // approval/lock polling and briefly rehydrate stale template data, which
      // makes the selected element appear to flip between old and new values.
    },
    [applyPatch, websiteId],
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
      const baselineValue = getCurrentValue(
        requestTarget.blockId,
        requestTarget.fieldPath,
      );
      const editSessionId =
        editSessionRef.current.get(key) ||
        buildEditSessionId(websiteId, requestTarget);
      editSessionRef.current.set(key, editSessionId);

      const deterministicPatch = buildDeterministicStylePatch(
        requestTarget,
        instruction,
        baselineValue,
      );

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
        const result = await editElement({
          websiteId,
          pageId: pageId ?? undefined,
          blockId: requestTarget.blockId,
          target: apiTarget,
          instruction,
          editSessionId,
        });

        const attempt = result.attempt ?? priorAttempts + 1;
        attemptsRef.current.set(key, attempt);

        const rawPatch = (result as unknown as { patch?: unknown }).patch;
        const backendPatches =
          result.patches ||
          result.data?.patch ||
          (Array.isArray(rawPatch)
            ? rawPatch
            : legacyPatchMapToPatches(rawPatch, requestTarget));
        const patches = backendPatches.length
          ? normalizePreviewPatches(
              backendPatches,
              requestTarget,
              getCurrentValue,
            )
          : [
              {
                aiEditKey:
                  result.target?.aiEditKey ?? requestTarget.aiEditKey,
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
        if (!patches.length || patches.every((patch) => patch.value == null)) {
          setError({
            code: "INVALID_EDIT_RESULT",
            message: "The AI service did not return a result. Please try again.",
          });
          return false;
        }

        await applyBackendPatches(patches);
        return true;
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
          await applyBackendPatches([fallbackPatch]);
          return true;
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
      pageId,
      websiteId,
    ],
  );

  const cancelProposal = useCallback(() => {
    setProposal(null);
  }, []);

  const applyProposal = useCallback(async (): Promise<boolean> => {
    if (!proposal) return false;

    const conflictingPatch = proposal.patches.find(
      (patch) =>
        !valuesEqual(
          getCurrentValue(patch.blockId, patch.fieldPath),
          patch.baselineValue,
        ),
    );
    if (conflictingPatch) {
      setConflict({
        blockId: conflictingPatch.blockId,
        fieldPath: conflictingPatch.fieldPath,
        userValue: getCurrentValue(
          conflictingPatch.blockId,
          conflictingPatch.fieldPath,
        ),
        aiValue: conflictingPatch.value,
        turnId: proposal.turnId,
        summary: proposal.summary,
        patches: proposal.patches,
      });
      return false;
    }

    setActiveRequest(true);
    setError(null);
    try {
      await applyBackendPatches(proposal.patches);
      setProposal(null);
      return true;
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
  }, [applyBackendPatches, getCurrentValue, proposal]);

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
        await applyBackendPatches(patchesToApply);
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
    const serverTurn = latestRevertibleTurns[0];
    const localTurn = localRevertStack[localRevertStack.length - 1];
    const turnId = serverTurn
      ? turnIdFromHistory(serverTurn)
      : localTurn
        ? turnIdFromHistory(localTurn)
        : null;
    if (!turnId) return;

    setActiveRequest(true);
    setError(null);
    try {
      const result = await revertAITurn({ websiteId, turnId });
      result.restored?.forEach((patch) => {
        const blockId = patch.fieldPath.match(/blocks\.([^.]+)\.content\./)?.[1];
        if (blockId && isBlockContentPath(patch.fieldPath)) {
          applyPatch(blockId, toFieldPath(patch.fieldPath), patch.value);
        }
      });
      setLocalRevertStack((prev) =>
        prev.filter((entry) => entry.turnId !== turnId),
      );
      await onRefresh?.();
    } catch (err) {
      const aiErr =
        err instanceof WebsiteAIRequestError
          ? err.aiError
          : normalizeWebsiteAIError(err);
      setError(aiErr);
      await onRefresh?.();
    } finally {
      setActiveRequest(false);
    }
  }, [
    applyPatch,
    latestRevertibleTurns,
    localRevertStack,
    onRefresh,
    websiteId,
  ]);

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

      setChatMessages((prev) => [
        ...prev,
        { id: `u_${Date.now()}`, role: "user", text },
      ]);
      setChatLoading(true);
      setError(null);

      try {
        const result = await editorChat({
          websiteId,
          scope,
          pageId: pageId ?? undefined,
          blockId: opts?.blockId,
          target:
            scope === "target"
              ? {
                  kind: scope,
                  fieldPath: opts?.fieldPath,
                  aiEditKey: opts?.aiEditKey,
                }
              : undefined,
          message: text,
        });
        const patches = normalizeChatPatches(result.patches || []);
        setChatMessages((prev) => [
          ...prev,
          {
            id: `a_${Date.now()}`,
            role: "assistant",
            text: result.reply || "Done.",
            pendingPatches: patches.length ? patches : undefined,
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
    [activeRequest, chatLoading, pageId, websiteId],
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
        await applyWebsiteAIPatches({
          websiteId,
          patches: applicablePatches.map((patch) => ({
            aiEditKey: patch.aiEditKey,
            fieldPath: patch.persistedFieldPath,
            value: patch.value,
          })),
        });
        applicablePatches.forEach((patch) => {
          if (
            patch.blockId != null &&
            isBlockContentPath(patch.persistedFieldPath)
          ) {
            applyPatch(patch.blockId, patch.fieldPath, patch.value);
          }
        });
        setChatMessages((prev) =>
          prev.map((item) =>
            item.id === messageId ? { ...item, pendingPatches: undefined } : item,
          ),
        );
        await onRefresh?.();
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
    [applyPatch, chatMessages, onRefresh, websiteId],
  );

  const dismissChatPatches = useCallback((messageId: string) => {
    setChatMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, pendingPatches: undefined } : m,
      ),
    );
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    activeRequest,
    proposal,
    conflict,
    error,
    revertStack: latestRevertibleTurns.length
      ? latestRevertibleTurns
      : localRevertStack,
    revertDepth: latestRevertibleTurns.length || localRevertStack.length,
    chatMessages,
    chatLoading,
    askAI,
    applyProposal,
    cancelProposal,
    resolveConflict,
    getAttempts,
    revertLast,
    sendChat,
    recreateSite,
    restoreVersion,
    applyChatMessage,
    dismissChatPatches,
    clearError,
  };
}

export type EditorAIController = ReturnType<typeof useEditorAI>;
