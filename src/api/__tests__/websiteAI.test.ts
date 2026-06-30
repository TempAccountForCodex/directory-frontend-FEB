import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the shared axios client used by the service.
vi.mock("../client", async () => {
  const actual = await vi.importActual<any>("axios");
  return {
    apiClient: { get: vi.fn(), post: vi.fn() },
    // Re-use the real axios type guards so error normalisation behaves correctly.
    isAxiosError: actual.default.isAxiosError,
    isCancel: actual.default.isCancel,
  };
});

import { apiClient } from "../client";
import {
  normalizeWebsiteAIError,
  patchMapToList,
  listWebsiteCategories,
  addWebsiteCategory,
  startWebsiteAIGeneration,
  editElement,
  editorChat,
  revertAITurn,
  WebsiteAIRequestError,
} from "../websiteAI";

const mockGet = apiClient.get as unknown as ReturnType<typeof vi.fn>;
const mockPost = apiClient.post as unknown as ReturnType<typeof vi.fn>;

const axiosError = (status: number, data: unknown) => ({
  isAxiosError: true,
  message: "Request failed",
  response: { status, data },
});

describe("websiteAI · normalizeWebsiteAIError", () => {
  it("maps 404 to NOT_IMPLEMENTED", () => {
    const e = normalizeWebsiteAIError(axiosError(404, {}));
    expect(e.code).toBe("NOT_IMPLEMENTED");
    expect(e.status).toBe(404);
  });

  it("maps 403 to FORBIDDEN", () => {
    const e = normalizeWebsiteAIError(axiosError(403, {}));
    expect(e.code).toBe("FORBIDDEN");
  });

  it("passes through UNSUPPORTED_EDIT_FIELD with details", () => {
    const e = normalizeWebsiteAIError(
      axiosError(400, {
        code: "UNSUPPORTED_EDIT_FIELD",
        message: "nope",
        details: {
          requestedChange: "button border color",
          missingSchemaPath: "content.buttonStyle.borderColor",
        },
      }),
    );
    expect(e.code).toBe("UNSUPPORTED_EDIT_FIELD");
    expect(e.details?.missingSchemaPath).toBe(
      "content.buttonStyle.borderColor",
    );
  });

  it("passes through quota exhaustion with resetAt", () => {
    const e = normalizeWebsiteAIError(
      axiosError(429, {
        code: "QUOTA_EXCEEDED",
        message: "used",
        resetAt: "2026-07-01T00:00:00.000Z",
      }),
    );
    expect(e.code).toBe("QUOTA_EXCEEDED");
    expect(e.resetAt).toBe("2026-07-01T00:00:00.000Z");
  });

  it("falls back to UNKNOWN for unrecognised codes", () => {
    const e = normalizeWebsiteAIError(axiosError(500, { code: "WAT" }));
    expect(e.code).toBe("UNKNOWN");
  });

  it("handles plain Error", () => {
    const e = normalizeWebsiteAIError(new Error("boom"));
    expect(e.code).toBe("UNKNOWN");
    expect(e.message).toBe("boom");
  });
});

describe("websiteAI · patchMapToList", () => {
  it("converts a patch map to a list with blockId", () => {
    expect(patchMapToList({ "content.heading": "Hi" }, 5)).toEqual([
      { blockId: 5, path: "content.heading", value: "Hi" },
    ]);
  });
});

describe("websiteAI · service calls", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
  });

  it("listWebsiteCategories unwraps { success, data }", async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: [{ value: "business", label: "Business", source: "template" }],
      },
    });
    const cats = await listWebsiteCategories();
    expect(cats).toHaveLength(1);
    expect(cats[0].value).toBe("business");
  });

  it("listWebsiteCategories returns [] for non-array payloads", async () => {
    mockGet.mockResolvedValue({ data: { success: true, data: null } });
    expect(await listWebsiteCategories()).toEqual([]);
  });

  it("normalizes nested category lists and name/slug fields", async () => {
    mockGet.mockResolvedValue({
      data: {
        success: true,
        data: {
          categories: [
            {
              slug: "home-services",
              name: "Home Services",
              source: "template",
            },
          ],
        },
      },
    });
    expect(await listWebsiteCategories()).toEqual([
      {
        value: "home-services",
        label: "Home Services",
        source: "template",
      },
    ]);
  });

  it("addWebsiteCategory returns the created category", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: {
          value: "custom-landscaping",
          label: "Custom Landscaping",
          source: "user",
        },
      },
    });
    const cat = await addWebsiteCategory("Custom Landscaping");
    expect(cat.value).toBe("custom-landscaping");
    expect(mockPost).toHaveBeenCalledWith("/website-categories", {
      label: "Custom Landscaping",
    });
  });

  it("normalizes a nested created category", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: {
          category: {
            slug: "custom-landscaping",
            name: "Custom Landscaping",
          },
        },
      },
    });
    expect(await addWebsiteCategory("Custom Landscaping")).toEqual({
      value: "custom-landscaping",
      label: "Custom Landscaping",
      source: "user",
    });
  });

  it("startWebsiteAIGeneration returns sessionId", async () => {
    mockPost.mockResolvedValue({
      data: { success: true, data: { sessionId: "ai_1", status: "queued" } },
    });
    const res = await startWebsiteAIGeneration({
      websiteId: 1,
      questionnaireData: { businessCategory: "Agency" },
    });
    expect(res.sessionId).toBe("ai_1");
  });

  it("editElement returns a typed result", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: {
          turnId: "turn_2",
          patches: [
            {
              blockId: 9,
              path: "content.heading",
              fieldPath: "content.heading",
              value: "Short",
              after: "Short",
            },
          ],
          attempt: 1,
        },
      },
    });
    const res = await editElement({
      websiteId: 1,
      blockId: 9,
      target: { kind: "editable", fieldPath: "heading" },
      instruction: "shorten",
    });
    expect(res.turnId).toBe("turn_2");
    expect(res.patches[0].value).toBe("Short");
  });

  it("throws WebsiteAIRequestError on { success:false } body", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: false,
        code: "UNSUPPORTED_EDIT_FIELD",
        message: "not editable",
      },
    });
    await expect(
      editElement({
        websiteId: 1,
        blockId: 9,
        target: { kind: "editable", fieldPath: "heading" },
        instruction: "x",
      }),
    ).rejects.toBeInstanceOf(WebsiteAIRequestError);
  });

  it("editorChat maps a 404 to NOT_IMPLEMENTED error", async () => {
    mockPost.mockRejectedValue(axiosError(404, {}));
    await expect(
      editorChat({ websiteId: 1, scope: "page", message: "hi" }),
    ).rejects.toMatchObject({ aiError: { code: "NOT_IMPLEMENTED" } });
  });

  it("revertAITurn returns restored fields", async () => {
    mockPost.mockResolvedValue({
      data: {
        success: true,
        data: {
          revertedTurnId: "t1",
          restored: [{ fieldPath: "content.heading", value: "Old" }],
        },
      },
    });
    const res = await revertAITurn({ websiteId: 1, turnId: "t1" });
    expect(res.restored[0].value).toBe("Old");
  });
});
