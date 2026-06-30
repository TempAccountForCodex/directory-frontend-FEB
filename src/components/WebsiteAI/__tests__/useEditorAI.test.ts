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
    applyWebsiteAIPatches: vi.fn(),
    recreateWebsiteWithAI: vi.fn(),
    restoreWebsiteAIVersion: vi.fn(),
  };
});

import {
  applyWebsiteAIPatches,
  editElement,
  editorChat,
  revertAITurn,
  WebsiteAIRequestError,
} from "../../../api/websiteAI";
import { useEditorAI, MAX_ATTEMPTS, MAX_REVERT_DEPTH } from "../useEditorAI";

const mockEdit = editElement as unknown as ReturnType<typeof vi.fn>;
const mockChat = editorChat as unknown as ReturnType<typeof vi.fn>;
const mockRevert = revertAITurn as unknown as ReturnType<typeof vi.fn>;
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
  it("produces a proposal from edit-element", async () => {
    mockEdit.mockResolvedValue({
      turnId: "turn_1",
      patch: { "content.heading": "Premium homes" },
      previewText: "Premium homes",
      summary: "Shortened",
    });
    const { hook } = setup();
    await act(async () => {
      await hook.result.current.askAI(target, "make it premium");
    });
    expect(hook.result.current.proposal?.previewText).toBe("Premium homes");
    expect(hook.result.current.proposal?.value).toBe("Premium homes");
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
});

describe("useEditorAI · Apply / conflict / revert", () => {
  const goodProposal = () =>
    mockEdit.mockResolvedValue({
      turnId: "turn_1",
      patch: { "content.heading": "New value" },
      previewText: "New value",
      summary: "Updated",
    });

  it("applies a proposal through backend patch mode", async () => {
    goodProposal();
    const { hook, applyPatch } = setup();
    await act(async () => {
      await hook.result.current.askAI(target, "do it");
    });
    await act(async () => {
      await hook.result.current.applyProposal();
    });
    expect(mockApplyPatches).toHaveBeenCalledWith({
      websiteId: 1,
      patches: [
        {
          aiEditKey: undefined,
          fieldPath: "content.heading",
          value: "New value",
        },
      ],
    });
    expect(applyPatch).toHaveBeenCalledWith(9, "heading", "New value");
    expect(hook.result.current.proposal).toBeNull();
  });

  it("applies and reverts every field returned in a multi-property patch", async () => {
    mockEdit.mockResolvedValue({
      turnId: "turn_multi",
      patch: {
        "content.headingStyle.color": "#008080",
        "content.headingStyle.textShadow": "0 2px 8px rgba(0,0,0,.2)",
      },
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
    await act(async () => {
      await hook.result.current.applyProposal();
    });
    expect(applyPatch).toHaveBeenCalledWith(9, "headingStyle.color", "#008080");
    expect(applyPatch).toHaveBeenCalledWith(
      9,
      "headingStyle.textShadow",
      "0 2px 8px rgba(0,0,0,.2)",
    );

    expect(mockApplyPatches).toHaveBeenCalled();
  });

  it("detects a conflict when the field changed mid-request", async () => {
    goodProposal();
    const { hook, applyPatch, store } = setup();
    await act(async () => {
      await hook.result.current.askAI(target, "do it");
    });
    // User edits the same field after the proposal arrives.
    store["9:heading"] = "User typed this";
    await act(async () => {
      await hook.result.current.applyProposal();
    });
    expect(applyPatch).not.toHaveBeenCalled();
    expect(hook.result.current.conflict).not.toBeNull();
    expect(hook.result.current.conflict?.userValue).toBe("User typed this");
    expect(hook.result.current.conflict?.aiValue).toBe("New value");
  });

  it("resolves a conflict by keeping the user edit (no apply)", async () => {
    goodProposal();
    const { hook, applyPatch, store } = setup();
    await act(async () => {
      await hook.result.current.askAI(target, "do it");
    });
    store["9:heading"] = "User typed this";
    await act(async () => {
      await hook.result.current.applyProposal();
    });
    await act(async () => {
      await hook.result.current.resolveConflict("user");
    });
    expect(applyPatch).not.toHaveBeenCalled();
    expect(hook.result.current.conflict).toBeNull();
  });

  it("resolves a conflict by applying the AI version", async () => {
    goodProposal();
    const { hook, applyPatch, store } = setup();
    await act(async () => {
      await hook.result.current.askAI(target, "do it");
    });
    store["9:heading"] = "User typed this";
    await act(async () => {
      await hook.result.current.applyProposal();
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
});

describe("useEditorAI · chat", () => {
  it("adds assistant reply with pending patches and applies them", async () => {
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
    expect(assistant?.pendingPatches).toHaveLength(1);
    await act(async () => {
      await hook.result.current.applyChatMessage(assistant!.id);
    });
    expect(applyPatch).toHaveBeenCalledWith(9, "heading", "Chat value");
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

  it("dismisses pending chat patches", async () => {
    mockChat.mockResolvedValue({
      reply: "ok",
      patches: [{ blockId: 9, path: "content.heading", value: "v" }],
    });
    const { hook } = setup();
    await act(async () => {
      await hook.result.current.sendChat("page", "x");
    });
    const assistant = hook.result.current.chatMessages.find(
      (m) => m.role === "assistant",
    )!;
    act(() => hook.result.current.dismissChatPatches(assistant.id));
    const after = hook.result.current.chatMessages.find(
      (m) => m.id === assistant.id,
    );
    expect(after?.pendingPatches).toBeUndefined();
  });
});
