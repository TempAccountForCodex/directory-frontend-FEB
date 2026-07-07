import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

// Mock the service layer; keep the real error class + normaliser.
vi.mock("../../../api/websiteAI", async () => {
  const actual = await vi.importActual<any>("../../../api/websiteAI");
  return {
    ...actual,
    editElement: vi.fn(),
    editorChat: vi.fn(),
    revertAITurn: vi.fn(),
    recordAppliedEdit: vi.fn(),
    applyWebsiteAIPatches: vi.fn(),
    recreateWebsiteWithAI: vi.fn(),
    restoreWebsiteAIVersion: vi.fn(),
  };
});

import {
  applyWebsiteAIPatches,
  editElement,
  editorChat,
  recordAppliedEdit,
  revertAITurn,
  WebsiteAIRequestError,
} from "../../../api/websiteAI";
import { useEditorAI, MAX_ATTEMPTS, MAX_REVERT_DEPTH } from "../useEditorAI";

const mockEdit = editElement as unknown as ReturnType<typeof vi.fn>;
const mockChat = editorChat as unknown as ReturnType<typeof vi.fn>;
const mockRevert = revertAITurn as unknown as ReturnType<typeof vi.fn>;
const mockRecord = recordAppliedEdit as unknown as ReturnType<typeof vi.fn>;
// Selected-element edits must NOT persist through generate-content patch mode.
const mockApplyPatches = applyWebsiteAIPatches as unknown as ReturnType<
  typeof vi.fn
>;

const target = {
  blockId: 9,
  fieldPath: "heading",
  label: "Hero heading",
  kind: "editable" as const,
};

function setup(options?: { revertibleTurns?: any[] }) {
  const store: Record<string, unknown> = { "9:heading": "Original" };
  const applyPatch = vi.fn((blockId, fieldPath, value) => {
    store[`${blockId}:${fieldPath}`] = value;
  });
  const getCurrentValue = vi.fn(
    (blockId, fieldPath) => store[`${blockId}:${fieldPath}`],
  );
  const hook = renderHook(() =>
    useEditorAI({
      websiteId: 1,
      pageId: 10,
      revertibleTurns: options?.revertibleTurns,
      getCurrentValue,
      applyPatch,
    }),
  );
  return { hook, applyPatch, getCurrentValue, store };
}

beforeEach(() => {
  mockEdit.mockReset();
  mockChat.mockReset();
  mockRevert.mockReset();
  mockRecord.mockReset();
  mockRecord.mockResolvedValue({ success: true, turnId: "rec_1", recorded: 1 });
  mockApplyPatches.mockReset();
  mockApplyPatches.mockResolvedValue({
    success: true,
    mode: "patch",
    applied: [{ fieldPath: "content.heading" }],
  });
  mockRevert.mockResolvedValue({
    revertedTurnId: "t",
    restored: [{ fieldPath: "pages.10.blocks.9.content.heading", value: "Original" }],
  });
});

describe("useEditorAI · Ask AI", () => {
  it("applies the edit-element result to local editor state (immediate apply)", async () => {
    mockEdit.mockResolvedValue({
      turnId: "turn_1",
      patch: { "content.heading": "Premium homes" },
      previewText: "Premium homes",
      summary: "Shortened",
    });
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.askAI(target, "make it premium");
    });
    // Immediate apply: the change lands in local editor state, no proposal step,
    // and it is NOT persisted via generate-content patch mode.
    expect(applyPatch).toHaveBeenCalledWith(9, "heading", "Premium homes");
    expect(hook.result.current.proposal).toBeNull();
    expect(mockApplyPatches).not.toHaveBeenCalled();
    expect(hook.result.current.activeRequest).toBe(false);
  });

  it("enforces the 3-attempt limit per same edit", async () => {
    mockEdit.mockResolvedValue({
      turnId: "t",
      patch: { "content.heading": "x" },
      previewText: "x",
      summary: "s",
    });
    const { hook } = setup();
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      await act(async () => {
        await hook.result.current.askAI(target, "same instruction");
      });
    }
    expect(mockEdit).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    // 4th attempt of the same edit is blocked
    await act(async () => {
      await hook.result.current.askAI(target, "same instruction");
    });
    expect(mockEdit).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    expect(hook.result.current.error?.code).toBe("EDIT_ATTEMPT_LIMIT");
  });

  it("surfaces UNSUPPORTED_EDIT_FIELD errors", async () => {
    mockEdit.mockRejectedValue(
      new WebsiteAIRequestError({
        code: "UNSUPPORTED_EDIT_FIELD",
        message: "not editable",
      }),
    );
    const { hook } = setup();
    await act(async () => {
      await hook.result.current.askAI(target, "change border");
    });
    expect(hook.result.current.error?.code).toBe("UNSUPPORTED_EDIT_FIELD");
    expect(hook.result.current.proposal).toBeNull();
  });

  it("falls back to editor-chat for a text rewrite when edit-element provider fails", async () => {
    mockEdit.mockRejectedValue(
      new WebsiteAIRequestError({
        code: "AI_PROVIDER_UNAVAILABLE",
        message: "The AI service did not return a result. Please try again.",
      }),
    );
    mockChat.mockResolvedValue({
      reply: "Rewrote the heading.",
      sessionId: "chat-session-1",
      patches: [
        {
          blockId: 9,
          path: "pages.10.blocks.9.content.heading",
          editorPath: "heading",
          value: "Crafted for Modern Kitchens",
        },
      ],
    });
    const { hook, applyPatch } = setup();
    let applied = false;
    await act(async () => {
      applied = await hook.result.current.askAI(target, "make it more premium");
    });

    expect(mockChat).toHaveBeenCalledWith(
      expect.objectContaining({
        websiteId: 1,
        scope: "target",
        pageId: 10,
        blockId: 9,
        target: expect.objectContaining({
          kind: "target",
          fieldPath: "pages.10.blocks.9.content.heading",
        }),
        // The fallback steers content rewrites to stay on-brand so backend
        // moderation accepts them.
        message: expect.stringContaining("make it more premium"),
      }),
    );
    expect(applied).toBe(true);
    expect(applyPatch).toHaveBeenCalledWith(
      9,
      "heading",
      "Crafted for Modern Kitchens",
    );
    expect(hook.result.current.error).toBeNull();
  });

  it("keeps the deterministic style fallback (no chat call) for style edits", async () => {
    mockEdit.mockRejectedValue(
      new WebsiteAIRequestError({
        code: "AI_PROVIDER_UNAVAILABLE",
        message: "unavailable",
      }),
    );
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.askAI(
        {
          kind: "editable",
          blockId: 9,
          fieldPath: "headingStyle.color",
          persistedFieldPath: "content.headingStyle.color",
        },
        "make it red",
      );
    });
    expect(mockChat).not.toHaveBeenCalled();
    expect(applyPatch).toHaveBeenCalledWith(9, "headingStyle.color", "#ff0000");
  });

  it("surfaces the chat error when the editor-chat fallback also fails", async () => {
    mockEdit.mockRejectedValue(
      new WebsiteAIRequestError({
        code: "AI_PROVIDER_UNAVAILABLE",
        message: "unavailable",
      }),
    );
    mockChat.mockRejectedValue(
      new WebsiteAIRequestError({
        code: "PATCH_MODERATION_BLOCKED",
        message: "The suggested content was flagged by moderation.",
      }),
    );
    const { hook, applyPatch } = setup();
    let applied = true;
    await act(async () => {
      applied = await hook.result.current.askAI(target, "rewrite this text");
    });
    expect(applied).toBe(false);
    expect(applyPatch).not.toHaveBeenCalled();
    expect(hook.result.current.error?.code).toBe("PATCH_MODERATION_BLOCKED");
  });

  it("reports failure when the chat fallback returns no applicable patches", async () => {
    mockEdit.mockRejectedValue(
      new WebsiteAIRequestError({
        code: "AI_FAILED",
        message: "failed",
      }),
    );
    mockChat.mockResolvedValue({ reply: "I could not find that element.", patches: [] });
    const { hook } = setup();
    let applied = true;
    await act(async () => {
      applied = await hook.result.current.askAI(target, "rewrite this text");
    });
    expect(applied).toBe(false);
    expect(hook.result.current.error?.code).toBe("INVALID_EDIT_RESULT");
    expect(hook.result.current.error?.message).toBe(
      "I could not find that element.",
    );
  });
});

describe("useEditorAI · Apply / conflict / revert", () => {
  const goodResult = () =>
    mockEdit.mockResolvedValue({
      turnId: "turn_1",
      patch: { "content.heading": "New value" },
      previewText: "New value",
      summary: "Updated",
    });

  it("applies a selected-element edit locally without generate-content patch mode", async () => {
    goodResult();
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.askAI(target, "do it");
    });
    // Single writer: local editor apply only. The website is persisted later by
    // the editor Save Changes flow, never by generate-content patch mode here.
    expect(applyPatch).toHaveBeenCalledWith(9, "heading", "New value");
    expect(mockApplyPatches).not.toHaveBeenCalled();
    // Revert bookkeeping is recorded via the lightweight endpoint.
    expect(mockRecord).toHaveBeenCalledTimes(1);
    expect(mockRecord.mock.calls[0][0]).toMatchObject({
      websiteId: 1,
      patches: [
        {
          fieldPath: "content.heading",
          editorPath: "heading",
          value: "New value",
        },
      ],
    });
    expect(hook.result.current.proposal).toBeNull();
  });

  it("applies every field returned in a multi-property patch using editorPath", async () => {
    mockEdit.mockResolvedValue({
      turnId: "turn_multi",
      patches: [
        {
          aiEditKey: "k1",
          path: "pages.10.blocks.9.content.headingStyle.color",
          editorPath: "headingStyle.color",
          blockId: 9,
          value: "#008080",
        },
        {
          aiEditKey: "k2",
          path: "pages.10.blocks.9.content.headingStyle.textShadow",
          editorPath: "headingStyle.textShadow",
          blockId: 9,
          value: "0 2px 8px rgba(0,0,0,.2)",
        },
      ],
      previewText: "Updated heading styles",
      summary: "Changed the color and shadow.",
    });
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.askAI(
        target,
        "make the text teal and add a shadow",
      );
    });
    // Both properties are applied at their backend-provided editor paths.
    expect(applyPatch).toHaveBeenCalledWith(9, "headingStyle.color", "#008080");
    expect(applyPatch).toHaveBeenCalledWith(
      9,
      "headingStyle.textShadow",
      "0 2px 8px rgba(0,0,0,.2)",
    );
    expect(mockApplyPatches).not.toHaveBeenCalled();
    expect(mockRecord.mock.calls[0][0].patches).toHaveLength(2);
  });

  it("detects a conflict when the field changed mid-request", async () => {
    let resolveEdit: (v: unknown) => void = () => {};
    mockEdit.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveEdit = resolve;
        }),
    );
    const { hook, applyPatch, store } = setup();
    let askPromise: Promise<boolean> = Promise.resolve(false);
    act(() => {
      askPromise = hook.result.current.askAI(target, "do it");
    });
    // User edits the same field while the AI request is still in flight.
    store["9:heading"] = "User typed this";
    await act(async () => {
      resolveEdit({
        turnId: "turn_1",
        patch: { "content.heading": "New value" },
        previewText: "New value",
        summary: "Updated",
      });
      await askPromise;
    });
    // The in-flight result must not silently overwrite the user's edit.
    expect(applyPatch).not.toHaveBeenCalled();
    expect(mockRecord).not.toHaveBeenCalled();
    expect(hook.result.current.conflict).not.toBeNull();
    expect(hook.result.current.conflict?.userValue).toBe("User typed this");
    expect(hook.result.current.conflict?.aiValue).toBe("New value");
  });

  it("resolves a conflict by keeping the user edit (no apply)", async () => {
    let resolveEdit: (v: unknown) => void = () => {};
    mockEdit.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveEdit = resolve;
        }),
    );
    const { hook, applyPatch, store } = setup();
    let askPromise: Promise<boolean> = Promise.resolve(false);
    act(() => {
      askPromise = hook.result.current.askAI(target, "do it");
    });
    store["9:heading"] = "User typed this";
    await act(async () => {
      resolveEdit({
        turnId: "turn_1",
        patch: { "content.heading": "New value" },
        previewText: "New value",
        summary: "Updated",
      });
      await askPromise;
    });
    await act(async () => {
      await hook.result.current.resolveConflict("user");
    });
    expect(applyPatch).not.toHaveBeenCalled();
    expect(hook.result.current.conflict).toBeNull();
  });

  it("resolves a conflict by applying the AI version", async () => {
    let resolveEdit: (v: unknown) => void = () => {};
    mockEdit.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveEdit = resolve;
        }),
    );
    const { hook, applyPatch, store } = setup();
    let askPromise: Promise<boolean> = Promise.resolve(false);
    act(() => {
      askPromise = hook.result.current.askAI(target, "do it");
    });
    store["9:heading"] = "User typed this";
    await act(async () => {
      resolveEdit({
        turnId: "turn_1",
        patch: { "content.heading": "New value" },
        previewText: "New value",
        summary: "Updated",
      });
      await askPromise;
    });
    await act(async () => {
      await hook.result.current.resolveConflict("ai");
    });
    expect(applyPatch).toHaveBeenCalledWith(9, "heading", "New value");
  });

  it("reverts the latest backend revertible turn", async () => {
    const { hook, applyPatch } = setup({
      revertibleTurns: [{ turnId: "patch-1", revertible: true, applied: true }],
    });
    applyPatch.mockClear();
    await act(async () => {
      await hook.result.current.revertLast();
    });
    expect(applyPatch).toHaveBeenCalledWith("9", "heading", "Original");
    await waitFor(() => expect(mockRevert).toHaveBeenCalledWith({
      websiteId: 1,
      turnId: "patch-1",
    }));
  });

  it("caps server-provided revert depth at two entries", async () => {
    const { hook } = setup({
      revertibleTurns: [
        { turnId: "patch-3", revertible: true, applied: true },
        { turnId: "patch-2", revertible: true, applied: true },
        { turnId: "patch-1", revertible: true, applied: true },
      ],
    });
    expect(hook.result.current.revertDepth).toBe(MAX_REVERT_DEPTH);
  });

  it("can undo a locally applied AI edit before backend history refreshes", async () => {
    mockEdit.mockResolvedValue({
      success: true,
      patches: [
        {
          blockId: 9,
          path: "content.heading",
          value: "New local value",
        },
      ],
    });
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.askAI(
        {
          kind: "editable",
          blockId: 9,
          fieldPath: "heading",
          persistedFieldPath: "content.heading",
        },
        "rewrite heading",
      );
    });
    expect(hook.result.current.revertDepth).toBe(1);
    applyPatch.mockClear();

    await act(async () => {
      await hook.result.current.revertLast();
    });

    await waitFor(() =>
      expect(mockRevert).toHaveBeenCalledWith({
        websiteId: 1,
        turnId: "rec_1",
      }),
    );
    expect(applyPatch).toHaveBeenCalledWith(9, "heading", "Original");
  });

  it("can redo a locally undone AI edit and keeps both stacks capped to two turns", async () => {
    mockEdit
      .mockResolvedValueOnce({
        success: true,
        patches: [{ blockId: 9, path: "content.heading", value: "First AI" }],
      })
      .mockResolvedValueOnce({
        success: true,
        patches: [{ blockId: 9, path: "content.heading", value: "Second AI" }],
      })
      .mockResolvedValueOnce({
        success: true,
        patches: [{ blockId: 9, path: "content.heading", value: "Third AI" }],
      });

    const { hook, applyPatch } = setup();

    await act(async () => {
      await hook.result.current.askAI(target, "first rewrite");
      await hook.result.current.askAI(target, "second rewrite");
      await hook.result.current.askAI(target, "third rewrite");
    });

    expect(hook.result.current.revertDepth).toBe(2);
    applyPatch.mockClear();

    await act(async () => {
      await hook.result.current.revertLast();
    });

    expect(applyPatch).toHaveBeenLastCalledWith(9, "heading", "Second AI");
    expect(hook.result.current.redoDepth).toBe(1);

    await act(async () => {
      await hook.result.current.redoLast();
    });

    expect(applyPatch).toHaveBeenLastCalledWith(9, "heading", "Third AI");
    expect(hook.result.current.revertDepth).toBe(2);
    expect(hook.result.current.redoDepth).toBe(0);
  });
});

describe("useEditorAI · chat", () => {
  it("applies assistant patch replies through the shared local patch flow", async () => {
    mockChat.mockResolvedValue({
      reply: "Updated the heading.",
      patches: [{ blockId: 9, path: "content.heading", value: "Chat value" }],
    });
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.sendChat("page", "rewrite heading");
    });
    const assistant = hook.result.current.chatMessages.find(
      (m) => m.role === "assistant",
    );
    expect(assistant?.pendingPatches).toBeUndefined();
    expect(applyPatch).toHaveBeenCalledWith(9, "heading", "Chat value");
  });

  it("applies page-scoped chat patches when blockId is inferred from persisted path", async () => {
    mockChat.mockResolvedValue({
      reply: "Updated the heading.",
      patches: [
        {
          path: "pages.10.blocks.9.content.heading",
          value: "Chat value",
        },
      ],
    });
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.sendChat("page", "rewrite heading");
    });
    expect(applyPatch).toHaveBeenCalledWith(9, "heading", "Chat value");
  });

  it("sends selection-scoped chat with the selected schema target", async () => {
    mockChat.mockResolvedValue({
      reply: "Updated the selected text.",
      patches: [
        {
          blockId: 9,
          path: "pages.10.blocks.9.content.headingStyle.color",
          editorPath: "headingStyle.color",
          value: "#ff0000",
        },
      ],
    });
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.sendChat("target", "make selected text red", {
        blockId: 9,
        fieldPath: "pages.10.blocks.9.content.heading",
        aiEditKey: "heading-key",
      });
    });

    expect(mockChat).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "target",
        blockId: 9,
        target: {
          kind: "target",
          fieldPath: "pages.10.blocks.9.content.heading",
          aiEditKey: "heading-key",
        },
      }),
    );
    expect(applyPatch).toHaveBeenCalledWith(
      9,
      "headingStyle.color",
      "#ff0000",
    );
  });

  it("sends section-scoped chat with the section schema target", async () => {
    mockChat.mockResolvedValue({
      reply: "Updated the section.",
      patches: [
        {
          path: "pages.10.blocks.9.content.sectionStyle.backgroundColor",
          editorPath: "sectionStyle.backgroundColor",
          value: "#111827",
        },
      ],
    });
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.sendChat("section", "darken this section", {
        blockId: 9,
        fieldPath: "pages.10.blocks.9.content.sectionStyle",
        aiEditKey: "section-style-key",
      });
    });

    expect(mockChat).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "section",
        blockId: 9,
        target: {
          kind: "section",
          fieldPath: "pages.10.blocks.9.content.sectionStyle",
          aiEditKey: "section-style-key",
        },
      }),
    );
    expect(applyPatch).toHaveBeenCalledWith(
      9,
      "sectionStyle.backgroundColor",
      "#111827",
    );
  });

  it("does not send an empty target object for page-scoped chat", async () => {
    mockChat.mockResolvedValue({
      reply: "Updated the page.",
      patches: [],
    });
    const { hook } = setup();
    await act(async () => {
      await hook.result.current.sendChat("page", "refresh this page");
    });

    expect(mockChat).toHaveBeenCalledWith(
      expect.objectContaining({
        scope: "page",
        pageId: 10,
        target: undefined,
      }),
    );
  });

  it("stores failures as error messages for follow-up", async () => {
    mockChat.mockRejectedValue(
      new WebsiteAIRequestError({
        code: "NOT_IMPLEMENTED",
        message: "not available yet",
      }),
    );
    const { hook } = setup();
    await act(async () => {
      await hook.result.current.sendChat("website", "recreate site");
    });
    const err = hook.result.current.chatMessages.find((m) => m.isError);
    expect(err?.text).toBe("not available yet");
  });

  it("keeps plain assistant replies when chat returns no patches", async () => {
    mockChat.mockResolvedValue({
      reply: "ok",
      patches: [],
    });
    const { hook } = setup();
    await act(async () => {
      await hook.result.current.sendChat("page", "x");
    });
    const assistant = hook.result.current.chatMessages.find(
      (m) => m.role === "assistant",
    )!;
    expect(assistant.text).toBe("ok");
    expect(assistant.pendingPatches).toBeUndefined();
  });
});
