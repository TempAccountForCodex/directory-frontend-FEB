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
  styleTarget?: {
    fieldPath: string;
    persistedFieldPath?: string;
    aiEditKey?: string;
    label?: string;
  };
  styleTargets?: Array<{
    fieldPath: string;
    persistedFieldPath?: string;
    aiEditKey?: string;
    label?: string;
    category?: string;
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
  onRefresh?: () => void | Promise<void>;
}

function buildEditSessionId(
  websiteId: number,
  target: AITargetRef,
): string {
  return `edit-${websiteId}-${target.blockId ?? "page"}-${Date.now()}`;
}

function isStyleInstruction(instruction: string): boolean {
  return /\b(color|colour|background|bg|gradient|font|size|weight|bold|italic|underline|shadow|border|radius|rounded|spacing|padding|margin|align|alignment|opacity|width|height|teal|yellow|red|green|blue|purple|black|white|grey|gray)\b/i.test(
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
  if (/\b(font|size|weight|bold|italic|underline|align|alignment|opacity|width|height)\b/.test(prompt)) {
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
    fieldPath: bestStyleTarget.fieldPath,
    persistedFieldPath: bestStyleTarget.persistedFieldPath,
    aiEditKey: bestStyleTarget.aiEditKey,
    label: bestStyleTarget.label || target.label,
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

      await onRefresh?.();
    },
    [applyPatch, onRefresh, websiteId],
  );

  const askAI = useCallback(
    async (target: AITargetRef, instruction: string): Promise<void> => {
      if (activeRequest || chatLoading) return;

      const requestTarget = resolveInstructionTarget(target, instruction);
      const key = attemptKey(requestTarget, instruction);
      const priorAttempts = attemptsRef.current.get(key) ?? 0;
      if (priorAttempts >= MAX_ATTEMPTS) {
        setError({
          code: "EDIT_ATTEMPT_LIMIT",
          message:
            "You've tried this edit a few times. Apply it, cancel it, or try a different change.",
        });
        return;
      }

      setError(null);
      setActiveRequest(true);
      const baselineValue = getCurrentValue(
        requestTarget.blockId,
        requestTarget.fieldPath,
      );
      const editSessionId =
        editSessionRef.current.get(key) ||
        buildEditSessionId(websiteId, requestTarget);
      editSessionRef.current.set(key, editSessionId);

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

        const backendPatches =
          result.patches ||
          result.data?.patch ||
          legacyPatchMapToPatches(
            (result as unknown as { patch?: unknown }).patch,
            requestTarget,
          );
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
        const value = patches[0]?.value;

        setProposal({
          turnId: result.turnId || editSessionId,
          blockId: requestTarget.blockId,
          fieldPath: requestTarget.fieldPath,
          value,
          patches,
          previewText: result.previewText ?? String(value ?? ""),
          summary:
            result.summary ||
            (patches.length > 1
              ? `${patches.length} changes ready to apply`
              : "AI change ready to apply"),
          instruction,
          attempt,
          baselineValue,
        });
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
    [activeRequest, chatLoading, getCurrentValue, pageId, websiteId],
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
