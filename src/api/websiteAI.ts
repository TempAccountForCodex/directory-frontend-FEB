/**
 * Website AI API service.
 *
 * Typed wrappers for the AI Website Creation/Editing feature contracts defined
 * in docs/AI_WEBSITE_CREATION_PRD.md. All requests go through the shared axios
 * client (httpOnly cookie auth, `withCredentials`).
 *
 * Endpoints covered:
 *   GET  /api/website-categories          — list template + user categories
 *   POST /api/website-categories          — add a user category
 *   POST /api/ai/generate-content         — start website AI generation
 *   POST /api/ai/edit-element             — Ask AI on a selected element
 *   POST /api/ai/editor-chat              — editor AI chat (field/section/page/site)
 *   POST /api/ai/revert-turn              — revert one of the last two AI turns
 *   POST /api/ai/recreate-site            — full-site AI recreation
 *   POST /api/ai/restore-version          — restore a saved AI website version
 */

import { apiClient, isAxiosError } from "./client";

/* ------------------------------------------------------------------ */
/*  Shared types                                                       */
/* ------------------------------------------------------------------ */

export interface WebsiteCategory {
  value: string;
  label: string;
  source: "template" | "user";
}

export interface EditableSchemaTarget {
  aiEditKey: string;
  kind: string;
  label?: string;
  category?: string;
  pageId?: number | string;
  sectionId?: number | string;
  blockId?: number | string;
  elementId?: number | string;
  blockType?: string;
  elementType?: string;
  fieldPath: string;
  valueType?: string;
  allowedOperations?: string[];
  currentValue?: unknown;
}

/** Structured AI error codes returned by the backend. */
export type WebsiteAIErrorCode =
  | "UNSUPPORTED_EDIT_FIELD"
  | "INVALID_EDIT_RESULT"
  | "NO_EDITABLE_SCHEMA"
  | "INVALID_PATCH_TARGETS"
  | "PATCH_MODERATION_BLOCKED"
  | "QUOTA_EXCEEDED"
  | "AI_QUOTA_EXHAUSTED"
  | "AI_PROVIDER_UNAVAILABLE"
  | "PLAN_UPGRADE_REQUIRED"
  | "AI_REQUEST_ACTIVE"
  | "EDIT_ATTEMPT_LIMIT"
  | "DAILY_REGEN_LIMIT"
  | "TURN_NOT_REVERTIBLE"
  | "NOTHING_TO_REVERT"
  | "TARGETS_GONE"
  | "VERSION_NOT_FOUND"
  | "CONFIRMATION_REQUIRED"
  | "AI_FAILED"
  | "AI_UNAVAILABLE"
  | "FORBIDDEN"
  | "UNAUTHORIZED"
  | "RATE_LIMITED"
  | "NOT_IMPLEMENTED"
  | "UNKNOWN";

/** Normalised error shape the UI consumes for every AI call. */
export interface WebsiteAIError {
  code: WebsiteAIErrorCode;
  message: string;
  /** Present for UNSUPPORTED_EDIT_FIELD. */
  details?: {
    requestedChange?: string;
    missingSchemaPath?: string;
  };
  /** Present for WEBSITE_AI_QUOTA_EXHAUSTED. ISO timestamp. */
  resetAt?: string;
  /** Raw HTTP status when available. */
  status?: number;
  /** Backend code before frontend normalization. */
  rawCode?: string;
  /** Extra backend details such as invalid paths, attempts, limits, failureId. */
  meta?: Record<string, unknown>;
}

/** A single patch returned by the backend preview endpoints. */
export interface AIPatch {
  aiEditKey?: string;
  fieldPath?: string;
  /** Backend path alias. */
  path: string;
  kind?: string | null;
  blockId?: number | string;
  pageId?: number | string;
  valueType?: string | null;
  before?: unknown;
  after?: unknown;
  value: unknown;
}

export interface ApplyPatchInput {
  aiEditKey?: string;
  fieldPath?: string;
  value: unknown;
}

export interface EditElementTarget {
  kind?: "editable" | "section" | "page" | "website";
  fieldPath?: string;
  aiEditKey?: string;
}

export interface EditElementRequest {
  websiteId: number;
  pageId?: number | string;
  blockId?: number | string;
  target: EditElementTarget;
  instruction: string;
  /** Stable id for the same edit chain so backend can enforce 3 attempts. */
  editSessionId?: string;
}

export interface EditElementResult {
  success?: true;
  mode?: "edit-element";
  turnId?: string;
  target?: { aiEditKey: string; fieldPath: string; kind: string };
  data?: { target?: unknown; patch?: AIPatch[]; attempt?: number };
  patches: AIPatch[];
  previewText?: string;
  summary?: string;
  attempt: number;
  attemptsRemaining?: number;
}

export type EditorChatScope = "target" | "section" | "page" | "website";

export interface EditorChatRequest {
  websiteId: number;
  scope: EditorChatScope;
  pageId?: number | string;
  blockId?: number | string;
  target?: {
    kind: EditorChatScope;
    fieldPath?: string;
    aiEditKey?: string;
  };
  message: string;
}

export type EditorChatMode = "patch" | "reply" | "session";

export interface ChatHistoryItem {
  turnId?: string;
  timestamp?: string;
  operation?: string;
  status?: string;
  scope?: string | null;
  message?: string | null;
  reply?: string | null;
  patches?: AIPatch[] | null;
  error?: unknown;
}

export interface EditorChatResult {
  success?: true;
  mode: EditorChatMode;
  scope?: string;
  reply: string;
  patches: AIPatch[];
  sessionId?: string;
  recentHistory?: ChatHistoryItem[];
}

export interface RevertTurnResult {
  success?: true;
  revertedTurnId: string;
  restored: Array<{ fieldPath: string; value: unknown }>;
}

export interface GenerateContentResult {
  success?: true;
  sessionId: string;
}

export interface ApplyPatchesResult {
  success?: true;
  mode: "patch";
  applied: Array<{ aiEditKey?: string; fieldPath: string }>;
}

export interface RecreateSiteResult {
  success?: true;
  sessionId: string;
  versionId: string;
}

export interface RestoreVersionResult {
  success?: true;
  restoredVersionId: string;
}

export interface VersionMeta {
  versionId: string;
  createdAt: string;
  label: string;
  reason?: string | null;
  totalPages?: number;
  totalBlocks?: number;
}

export interface ActiveRequest {
  requestId: string;
  intent: string;
  status: "pending" | "in_progress" | string;
  userId?: number;
  startedAt?: string;
  [key: string]: unknown;
}

export interface AIHistoryEntry {
  turnId: string;
  timestamp?: string;
  prompt?: string | null;
  response?: unknown;
  operation?: string | null;
  status?: string;
  applied?: boolean;
  revertible?: boolean;
  aiEditKey?: string | null;
  editSessionId?: string | null;
  pageId?: number | null;
  blockId?: number | null;
  before?: Array<{ fieldPath: string; value: unknown }> | null;
  after?: Array<{ fieldPath: string; value: unknown }> | null;
  error?: unknown;
}

export interface WebsiteAIContext {
  version?: string;
  editableSchema?: {
    version?: string;
    generatedAt?: string;
    targets?: EditableSchemaTarget[];
  };
  aiHistory?: AIHistoryEntry[];
  activeRequest?: ActiveRequest | null;
  fullSiteVersions?: VersionMeta[];
  [key: string]: unknown;
}

export interface WebsiteAIUsage {
  scope: "website-ai";
  plan: string;
  used: number;
  limit: number | "unlimited";
  remaining: number | "unlimited";
  resetAt: string;
}

/* ------------------------------------------------------------------ */
/*  Error normalisation                                                */
/* ------------------------------------------------------------------ */

const KNOWN_CODES: WebsiteAIErrorCode[] = [
  "UNSUPPORTED_EDIT_FIELD",
  "INVALID_EDIT_RESULT",
  "NO_EDITABLE_SCHEMA",
  "INVALID_PATCH_TARGETS",
  "PATCH_MODERATION_BLOCKED",
  "QUOTA_EXCEEDED",
  "AI_QUOTA_EXHAUSTED",
  "AI_PROVIDER_UNAVAILABLE",
  "PLAN_UPGRADE_REQUIRED",
  "AI_REQUEST_ACTIVE",
  "EDIT_ATTEMPT_LIMIT",
  "DAILY_REGEN_LIMIT",
  "TURN_NOT_REVERTIBLE",
  "NOTHING_TO_REVERT",
  "TARGETS_GONE",
  "VERSION_NOT_FOUND",
  "CONFIRMATION_REQUIRED",
  "AI_FAILED",
  "AI_UNAVAILABLE",
  "FORBIDDEN",
  "UNAUTHORIZED",
  "RATE_LIMITED",
  "NOT_IMPLEMENTED",
];

/**
 * Convert any thrown error (or a non-success response body) into the
 * normalised {@link WebsiteAIError} the UI renders.
 */
export function normalizeWebsiteAIError(err: unknown): WebsiteAIError {
  if (isAxiosError(err)) {
    const status = err.response?.status;
    const rawBody = err.response?.data as
      | {
          code?: string;
          message?: string;
          details?: WebsiteAIError["details"];
          resetAt?: string;
          error?: unknown;
          data?: unknown;
        }
      | undefined;
    const nestedBody =
      rawBody?.error && typeof rawBody.error === "object"
        ? rawBody.error
        : rawBody?.data && typeof rawBody.data === "object"
          ? rawBody.data
          : null;
    const body = {
      ...(rawBody || {}),
      ...(nestedBody as Record<string, unknown> | null),
    } as {
      code?: string;
      message?: string;
      details?: WebsiteAIError["details"];
      resetAt?: string;
    };

    if (status === 401) {
      return {
        code: "UNAUTHORIZED",
        message: body?.message || "Please sign in to use AI.",
        status,
        rawCode: body?.code,
        meta: body as Record<string, unknown>,
      };
    }

    if (status === 404) {
      return {
        code: "NOT_IMPLEMENTED",
        message:
          body?.message ||
          "This AI capability is not available yet. Please try again later.",
        status,
        rawCode: body?.code,
        meta: body as Record<string, unknown>,
      };
    }
    if (status === 403) {
      const forbiddenCode =
        body?.code === "PLAN_UPGRADE_REQUIRED" ? body.code : "FORBIDDEN";
      return {
        code: forbiddenCode as WebsiteAIErrorCode,
        message:
          body?.message ||
          "Only the website owner or an admin can use AI here.",
        status,
        resetAt: body?.resetAt,
        rawCode: body?.code,
        meta: body as Record<string, unknown>,
      };
    }
    if (status === 429 && !body?.code) {
      return {
        code: "RATE_LIMITED",
        message: body?.message || "Too many AI requests. Please try again.",
        status,
        resetAt: body?.resetAt,
        rawCode: body?.code,
        meta: body as Record<string, unknown>,
      };
    }
    if (status === 503) {
      const rawCode = body?.code;
      const code = (
        rawCode && (KNOWN_CODES as string[]).includes(rawCode)
          ? rawCode
          : "AI_UNAVAILABLE"
      ) as WebsiteAIErrorCode;
      return {
        code,
        message:
          body?.message ||
          "Website AI is not configured yet. Please try again later.",
        status,
        rawCode,
        meta: body as Record<string, unknown>,
      };
    }

    const rawCode = body?.code;
    const code = (
      rawCode && (KNOWN_CODES as string[]).includes(rawCode)
        ? rawCode
        : "UNKNOWN"
    ) as WebsiteAIErrorCode;

    return {
      code,
      message: body?.message || err.message || "AI request failed.",
      details: body?.details,
      resetAt: body?.resetAt,
      status,
      rawCode,
      meta: body as Record<string, unknown>,
    };
  }

  if (err instanceof Error) {
    return { code: "UNKNOWN", message: err.message };
  }
  return { code: "UNKNOWN", message: "AI request failed." };
}

/** Build a normalised error from a `{ success: false, ... }` response body. */
function errorFromBody(body: Record<string, unknown>): WebsiteAIError {
  const rawCode = body.code as string | undefined;
  const code = (
    rawCode && (KNOWN_CODES as string[]).includes(rawCode) ? rawCode : "UNKNOWN"
  ) as WebsiteAIErrorCode;
  return {
    code,
    message: (body.message as string) || "AI request failed.",
    details: body.details as WebsiteAIError["details"],
    resetAt: body.resetAt as string | undefined,
    rawCode,
    meta: body,
  };
}

/** Thrown by the service functions so callers can `catch` a typed error. */
export class WebsiteAIRequestError extends Error {
  aiError: WebsiteAIError;
  constructor(aiError: WebsiteAIError) {
    super(aiError.message);
    this.name = "WebsiteAIRequestError";
    this.aiError = aiError;
  }
}

function unwrap<T>(data: { success?: boolean; data?: T } | T): T {
  if (
    data &&
    typeof data === "object" &&
    "success" in data &&
    (data as { success?: boolean }).success === false
  ) {
    throw new WebsiteAIRequestError(
      errorFromBody(data as Record<string, unknown>),
    );
  }
  if (data && typeof data === "object" && "data" in data) {
    return (data as { data: T }).data;
  }
  return data as T;
}

/* ------------------------------------------------------------------ */
/*  Categories                                                         */
/* ------------------------------------------------------------------ */

function normalizeCategory(
  value: unknown,
  fallbackSource: WebsiteCategory["source"] = "user",
): WebsiteCategory | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;
  const label =
    typeof raw.label === "string"
      ? raw.label
      : typeof raw.name === "string"
        ? raw.name
        : typeof raw.category === "string"
          ? raw.category
          : "";
  const categoryValue =
    typeof raw.value === "string"
      ? raw.value
      : typeof raw.slug === "string"
        ? raw.slug
        : label;
  if (!label.trim() || !categoryValue.trim()) return null;
  return {
    value: categoryValue,
    label,
    source:
      typeof raw.source === "string" && raw.source.toLowerCase() === "template"
        ? "template"
        : fallbackSource,
  };
}

function extractCategoryList(data: unknown): WebsiteCategory[] {
  const body =
    data && typeof data === "object" && "data" in data
      ? (data as { data?: unknown }).data
      : data;
  const list = Array.isArray(body)
    ? body
    : body && typeof body === "object" && "categories" in body
      ? (body as { categories?: unknown }).categories
      : [];
  if (!Array.isArray(list)) return [];
  return list
    .map((item) => normalizeCategory(item, "user"))
    .filter((item): item is WebsiteCategory => item !== null);
}

export async function listWebsiteCategories(
  signal?: AbortSignal,
): Promise<WebsiteCategory[]> {
  try {
    const res = await apiClient.get("/website-categories", { signal });
    return extractCategoryList(res.data);
  } catch (err) {
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

export async function addWebsiteCategory(
  label: string,
): Promise<WebsiteCategory> {
  try {
    const res = await apiClient.post("/website-categories", { label });
    const data = unwrap<unknown>(res.data);
    const candidate =
      data && typeof data === "object" && "category" in data
        ? (data as { category?: unknown }).category
        : data;
    const category = normalizeCategory(candidate, "user");
    if (!category) {
      throw new WebsiteAIRequestError({
        code: "UNKNOWN",
        message:
          "The category was saved, but the server returned an invalid category.",
      });
    }
    return category;
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

/* ------------------------------------------------------------------ */
/*  Generation                                                         */
/* ------------------------------------------------------------------ */

export async function startWebsiteAIGeneration(params: {
  websiteId: number;
  questionnaireData?: Record<string, unknown>;
  resumeMode?: boolean;
}): Promise<GenerateContentResult> {
  try {
    const res = await apiClient.post("/ai/generate-content", params);
    return unwrap<GenerateContentResult>(res.data);
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

export async function applyWebsiteAIPatches(params: {
  websiteId: number;
  patches: ApplyPatchInput[];
  editSessionId?: string;
}): Promise<ApplyPatchesResult> {
  try {
    const res = await apiClient.post("/ai/generate-content", {
      websiteId: params.websiteId,
      mode: "patch",
      patches: params.patches,
      editSessionId: params.editSessionId,
    });
    return unwrap<ApplyPatchesResult>(res.data);
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

/* ------------------------------------------------------------------ */
/*  Selected-element Ask AI                                            */
/* ------------------------------------------------------------------ */

export async function editElement(
  payload: EditElementRequest,
): Promise<EditElementResult> {
  try {
    const res = await apiClient.post("/ai/edit-element", payload);
    return unwrap<EditElementResult>(res.data);
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

/* ------------------------------------------------------------------ */
/*  Editor chat                                                        */
/* ------------------------------------------------------------------ */

export async function editorChat(
  payload: EditorChatRequest,
): Promise<EditorChatResult> {
  try {
    const res = await apiClient.post("/ai/editor-chat", payload);
    return unwrap<EditorChatResult>(res.data);
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

/* ------------------------------------------------------------------ */
/*  Revert                                                             */
/* ------------------------------------------------------------------ */

export async function revertAITurn(params: {
  websiteId: number;
  turnId: string;
}): Promise<RevertTurnResult> {
  try {
    const res = await apiClient.post("/ai/revert-turn", params);
    return unwrap<RevertTurnResult>(res.data);
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

export async function recreateWebsiteWithAI(params: {
  websiteId: number;
  confirm: true;
  questionnaireData?: Record<string, unknown>;
}): Promise<RecreateSiteResult> {
  try {
    const res = await apiClient.post("/ai/recreate-site", params);
    return unwrap<RecreateSiteResult>(res.data);
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

export async function restoreWebsiteAIVersion(params: {
  websiteId: number;
  versionId: string;
}): Promise<RestoreVersionResult> {
  try {
    const res = await apiClient.post("/ai/restore-version", params);
    return unwrap<RestoreVersionResult>(res.data);
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

/** Normalise a patch map ({ "content.heading": "x" }) into AIPatch[]. */
export function patchMapToList(
  patch: Record<string, unknown>,
  blockId?: number | string,
): AIPatch[] {
  return Object.entries(patch).map(([path, value]) => ({
    blockId,
    path,
    value,
  }));
}
