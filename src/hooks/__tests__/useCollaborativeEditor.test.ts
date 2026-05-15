/**
 * useCollaborativeEditor Hook Tests (Step 7.5.4)
 *
 * Covers:
 * - Returns presence data, locks, permissions
 * - Integrates with useWebSocket
 * - VIEWER role sets canEdit=false
 * - EDITOR role sets canEdit=true
 * - Provides requestEditAccess function
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Mock useWebSocket
vi.mock("../useWebSocket", () => ({
  useWebSocket: () => ({
    connectionState: "connected",
    send: vi.fn(),
    joinRoom: vi.fn(),
    leaveRoom: vi.fn(),
    connectedUsers: 1,
    reconnectAttempt: 0,
  }),
}));

// Mock usePreview
vi.mock("../../context/PreviewContext", () => ({
  usePreview: () => ({
    currentPageContent: null,
    updatePreviewContent: vi.fn(),
  }),
}));

import { useCollaborativeEditor } from "../useCollaborativeEditor";

describe("useCollaborativeEditor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("initializes with empty activeUsers and locks", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "EDITOR",
      }),
    );

    expect(result.current.activeUsers).toEqual([]);
    expect(result.current.locks).toBeInstanceOf(Map);
    expect(result.current.locks.size).toBe(0);
  });

  it("returns canEdit=false for VIEWER role", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "VIEWER",
      }),
    );

    expect(result.current.canEdit).toBe(false);
  });

  it("returns canEdit=true for EDITOR role", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "EDITOR",
      }),
    );

    expect(result.current.canEdit).toBe(true);
  });

  it("returns canEdit=true for OWNER role", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "OWNER",
      }),
    );

    expect(result.current.canEdit).toBe(true);
  });

  it("returns canEdit=true for ADMIN role", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "ADMIN",
      }),
    );

    expect(result.current.canEdit).toBe(true);
  });

  it("exposes isConnected state", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "EDITOR",
      }),
    );

    expect(typeof result.current.isConnected).toBe("boolean");
  });

  it("exposes broadcastChange function", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "EDITOR",
      }),
    );

    expect(typeof result.current.broadcastChange).toBe("function");
  });

  it("exposes broadcastCursor function", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "EDITOR",
      }),
    );

    expect(typeof result.current.broadcastCursor).toBe("function");
  });

  it("exposes requestEditAccess function for VIEWER", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "VIEWER",
      }),
    );

    expect(typeof result.current.requestEditAccess).toBe("function");
  });

  it("returns cursorPositions Map", () => {
    const { result } = renderHook(() =>
      useCollaborativeEditor({
        pageId: "page-1",
        websiteId: 1,
        currentUserId: 10,
        currentUserRole: "EDITOR",
      }),
    );

    expect(result.current.cursorPositions).toBeInstanceOf(Map);
  });
});
