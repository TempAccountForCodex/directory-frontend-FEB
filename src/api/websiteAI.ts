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

/** Renderer/editor mapping hints carried on every editable target. */
export interface EditableTargetMetadata {
  /** content | style | column | website | page */
  group?: string;
  /** CSS sub-property for a style leaf (e.g. "color", "fontSize"). */
  cssProp?: string;
  /**
   * For a content text/button target, the nested style object name(s) that
   * style it (e.g. "heading" -> ["headingStyle"]). Used to resolve style-edit
   * targets from the schema instead of guessing locally.
   */
  styleObjects?: string[];
  [key: string]: unknown;
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
  /**
   * Path INSIDE block.content the editor applies a patch to (fieldPath with the
   * `pages.<p>.blocks.<b>.content.` prefix removed). The frontend uses this
   * directly and never derives it.
   */
  editorPath?: string | null;
  /** editorPath when the target is content copy/data; null for style targets. */
  contentPath?: string | null;
  /** Nested style object name (e.g. "headingStyle") for style targets. */
  stylePath?: string | null;
  valueType?: string;
  allowedOperations?: string[];
  currentValue?: unknown;
  metadata?: EditableTargetMetadata | null;
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
  /** Backend path alias. Legacy responses may include this instead of fieldPath. */
  path?: string;
  /**
   * Path INSIDE block.content the editor applies this patch to (e.g.
   * "headingStyle.fontSize"). Authoritative — returned by the backend so the
   * frontend never derives it from fieldPath.
   */
  editorPath?: string | null;
  contentPath?: string | null;
  stylePath?: string | null;
  elementId?: string | null;
  elementType?: string | null;
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
  /** Some backend responses expose the preview patches inside data.patch. */
  patch?: AIPatch[];
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
  /**
   * Extra editor-discovered targets that are not part of the persisted backend
   * editable schema yet, such as dynamic blog article static-style targets.
   * The backend AI can use these as the allowed patch schema for this request.
   */
  editableTargets?: EditableSchemaTarget[];
  context?: Record<string, unknown>;
}

function normalizeNumericId(value: number | string | undefined) {
  if (typeof value === "string" && /^\d+$/.test(value)) {
    return Number(value);
  }
  return value;
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

/** Questionnaire payload sent to POST /api/ai/generate-website-draft. */
export interface GenerateWebsiteDraftQuestionnaire {
  businessName: string;
  category?: string;
  primaryGoal?: string;
  contactInfo?: string;
  location?: string;
  shortDescription?: string;
  targetAudience?: string;
  servicesOrProducts?: string[];
  tone?: string;
  preferredColorsOrStyleNotes?: string;
  aiInstructions?: string;
  [key: string]: unknown;
}

export interface GenerateWebsiteDraftRequest {
  websiteId: number;
  pageId?: number;
  questionnaire: GenerateWebsiteDraftQuestionnaire;
}

export interface GenerateWebsiteDraftResult {
  success?: true;
  mode?: "website-draft";
  patches: AIPatch[];
  summary?: string;
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
    truncated?: boolean;
    totalTargets?: number;
    fetchVia?: string;
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

/**
 * Pull the preview patch array out of a generate-website-draft response,
 * accepting any of the shapes the backend may use: `patches`, `patch`,
 * `data.patches`, or `data.patch`.
 */
function extractDraftPatches(body: unknown): AIPatch[] {
  if (!body || typeof body !== "object") return [];
  const record = body as Record<string, unknown>;
  const nested =
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>)
      : undefined;
  const candidates = [
    record.patches,
    record.patch,
    nested?.patches,
    nested?.patch,
  ];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate as AIPatch[];
  }
  return [];
}

/**
 * Generate a preview-only AI website draft from the creation questionnaire.
 * The backend never persists content — it returns editableSchema-backed patches
 * the editor applies locally so the user can preview, then Accept (save through
 * the normal Save Changes flow) or Reject (restore the template snapshot).
 */
export async function generateWebsiteDraft(
  payload: GenerateWebsiteDraftRequest,
): Promise<GenerateWebsiteDraftResult> {
  try {
    const res = await apiClient.post("/ai/generate-website-draft", payload);
    const body = res.data;
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      (body as { success?: boolean }).success === false
    ) {
      throw new WebsiteAIRequestError(
        errorFromBody(body as Record<string, unknown>),
      );
    }
    const patches = extractDraftPatches(body);
    const record = (body || {}) as Record<string, unknown>;
    const nested =
      record.data && typeof record.data === "object"
        ? (record.data as Record<string, unknown>)
        : undefined;
    const summary =
      (typeof record.summary === "string" ? record.summary : undefined) ??
      (typeof nested?.summary === "string" ? nested.summary : undefined);
    return { success: true, mode: "website-draft", patches, summary };
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

/** One applied patch reported to the backend for revert bookkeeping. */
export interface RecordAppliedPatch {
  aiEditKey?: string;
  fieldPath: string;
  editorPath?: string | null;
  before?: unknown;
  value: unknown;
}

export interface RecordAppliedEditResult {
  success?: true;
  turnId: string | null;
  recorded: number;
}

/**
 * Record an applied selected-element AI edit AFTER it has been applied to local
 * editor state and persisted through the normal editor Save Changes flow. This
 * does NOT mutate blocks — it only resyncs the editable schema's current values
 * and records a revertible AI turn. Best-effort: callers should not block the UI
 * on it. (Replaces persisting selected-element edits through generate-content
 * patch mode, which fought the editor save flow.)
 */
export async function recordAppliedEdit(params: {
  websiteId: number;
  turnId?: string;
  aiEditKey?: string;
  instruction?: string;
  summary?: string;
  patches: RecordAppliedPatch[];
}): Promise<RecordAppliedEditResult> {
  try {
    const res = await apiClient.post("/ai/record-applied-edit", params);
    return unwrap<RecordAppliedEditResult>(res.data);
  } catch (err) {
    if (err instanceof WebsiteAIRequestError) throw err;
    throw new WebsiteAIRequestError(normalizeWebsiteAIError(err));
  }
}

/* ------------------------------------------------------------------ */
/*  Editable schema                                                    */
/* ------------------------------------------------------------------ */

export interface EditableSchemaResponse {
  version?: string;
  generatedAt?: string;
  totalTargets?: number;
  filteredTotal?: number;
  offset?: number;
  limit?: number;
  hasMore?: boolean;
  targets: EditableSchemaTarget[];
}

function normalizeEditableSchemaResponse(data: unknown): EditableSchemaResponse {
  const body =
    data && typeof data === "object" && "data" in data
      ? (data as { data?: unknown }).data
      : data;
  const schema =
    body && typeof body === "object" && "editableSchema" in body
      ? (body as { editableSchema?: unknown }).editableSchema
      : body;

  if (!schema || typeof schema !== "object") {
    return { targets: [] };
  }

  const raw = schema as Record<string, unknown>;
  const targets = Array.isArray(raw.targets)
    ? raw.targets.filter(
        (target): target is EditableSchemaTarget =>
          !!target &&
          typeof target === "object" &&
          typeof (target as EditableSchemaTarget).aiEditKey === "string" &&
          typeof (target as EditableSchemaTarget).fieldPath === "string",
      )
    : [];

  return {
    version: raw.version as string | undefined,
    generatedAt: raw.generatedAt as string | undefined,
    totalTargets:
      typeof raw.totalTargets === "number" ? raw.totalTargets : undefined,
    filteredTotal:
      typeof raw.filteredTotal === "number" ? raw.filteredTotal : undefined,
    offset: typeof raw.offset === "number" ? raw.offset : undefined,
    limit: typeof raw.limit === "number" ? raw.limit : undefined,
    hasMore: Boolean(raw.hasMore),
    targets,
  };
}

export async function getWebsiteEditableSchema(
  websiteId: number,
  options: { signal?: AbortSignal; limit?: number } = {},
): Promise<EditableSchemaResponse> {
  const limit = options.limit || 2000;
  const allTargets: EditableSchemaTarget[] = [];
  let offset = 0;
  let latest: EditableSchemaResponse = { targets: [] };

  try {
    do {
      const res = await apiClient.get(`/websites/${websiteId}/editable-schema`, {
        params: { offset, limit },
        signal: options.signal,
      });
      latest = normalizeEditableSchemaResponse(res.data);
      allTargets.push(...latest.targets);
      offset += latest.targets.length || limit;
    } while (latest.hasMore && !options.signal?.aborted);

    const seen = new Set<string>();
    const targets = allTargets.filter((target) => {
      const key = target.aiEditKey || target.fieldPath;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    return {
      ...latest,
      offset: 0,
      limit: targets.length,
      hasMore: false,
      targets,
    };
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
    const body = res.data;
    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      (body as { success?: boolean }).success === false
    ) {
      throw new WebsiteAIRequestError(
        errorFromBody(body as Record<string, unknown>),
      );
    }

    // edit-element returns useful fields both at the top level (`patches`) and
    // inside `data.patch`. The generic unwrap helper would discard the top-level
    // fields because the response also has a `data` key.
    return body as EditElementResult;
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
    const res = await apiClient.post("/ai/editor-chat", {
      ...payload,
      pageId: normalizeNumericId(payload.pageId),
      blockId: normalizeNumericId(payload.blockId),
      editableTargets: payload.editableTargets,
      context: payload.context,
    });
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
