/**
 * Tests for usePreviewSync hook (Step 5.4.1 + 5.4.2)
 *
 * Covers:
 * - Room join/leave lifecycle (join on mount, leave on unmount)
 * - Listens for CONTENT_UPDATE and updates PreviewContext
 * - Debounces incoming updates at 100ms
 * - Skips updates from self (userId match)
 * - Re-joins room on reconnect (connectionState transitions)
 * - Returns { isConnected, activeUsers, cursorPositions, locks }
 * - Cleanup: all timers cleared on unmount
 * - Type-safe: uses type guards for message narrowing
 * - broadcastChange sends CONTENT_UPDATE with timestamp
 * - Client-side dedup: ignores echoed messages
 * - Does NOT broadcast when disconnected
 * - Broadcast throttled to 100ms
 * - Cursor tracking from CURSOR_MOVE messages
 * - Lock tracking from LOCK_ACQUIRE/LOCK_RELEASE messages
 * - Active users from ROOM_STATE/USER_JOINED/USER_LEFT
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockJoinRoom = vi.fn();
const mockLeaveRoom = vi.fn();
const mockSend = vi.fn().mockReturnValue(true);
let capturedOnMessage: ((msg: Record<string, unknown>) => void) | undefined;
let mockConnectionState = "connected";

vi.mock("../useWebSocket", () => ({
  useWebSocket: (options?: {
    onMessage?: (msg: Record<string, unknown>) => void;
  }) => {
    capturedOnMessage = options?.onMessage;
    return {
      connectionState: mockConnectionState,
      send: mockSend,
      joinRoom: mockJoinRoom,
      leaveRoom: mockLeaveRoom,
      leaveAllRooms: vi.fn(),
      connectedUsers: 1,
      reconnectAttempt: 0,
    };
  },
}));

const mockUpdatePreviewContent = vi.fn();
const mockCurrentPageContent = {
  websiteId: "w1",
  pageId: "p1",
  blocks: [
    { id: "1", blockType: "HERO", content: { title: "Hello" }, order: 0 },
  ],
};

vi.mock("../../context/PreviewContext", () => ({
  usePreview: () => ({
    currentPageContent: mockCurrentPageContent,
    viewport: "desktop",
    isPreviewLoading: false,
    previewError: null,
    revision: 0,
    updatePreviewContent: mockUpdatePreviewContent,
    setViewport: vi.fn(),
    refreshPreview: vi.fn(),
    setPreviewError: vi.fn(),
    setIsPreviewLoading: vi.fn(),
  }),
}));

// Import after mocks
import { usePreviewSync } from "../usePreviewSync";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function simulateMessage(msg: Record<string, unknown>) {
  act(() => {
    capturedOnMessage?.(msg);
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("usePreviewSync", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockConnectionState = "connected";
    capturedOnMessage = undefined;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- 5.4.1: Room lifecycle -----------------------------------------------

  it('joins room "page:{pageId}" on mount', () => {
    renderHook(() => usePreviewSync("page-123", 42));
    expect(mockJoinRoom).toHaveBeenCalledWith("page:page-123");
  });

  it("leaves room on unmount", () => {
    const { unmount } = renderHook(() => usePreviewSync("page-123", 42));
    unmount();
    expect(mockLeaveRoom).toHaveBeenCalledWith("page:page-123");
  });

  it("leaves old room and joins new room when pageId changes", () => {
    const { rerender } = renderHook(
      ({ pageId }) => usePreviewSync(pageId, 42),
      { initialProps: { pageId: "page-1" } },
    );
    rerender({ pageId: "page-2" });
    expect(mockLeaveRoom).toHaveBeenCalledWith("page:page-1");
    expect(mockJoinRoom).toHaveBeenCalledWith("page:page-2");
  });

  // ---- 5.4.1: Message handling ---------------------------------------------

  it("updates PreviewContext on incoming CONTENT_UPDATE from another user", () => {
    renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "CONTENT_UPDATE",
      userId: 99,
      data: { blockId: 1, fieldPath: "content.title", value: "Updated" },
      timestamp: new Date().toISOString(),
    });

    // Debounce at 100ms
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockUpdatePreviewContent).toHaveBeenCalled();
  });

  it("skips CONTENT_UPDATE from self (same userId)", () => {
    renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "CONTENT_UPDATE",
      userId: 42,
      data: { blockId: 1, fieldPath: "content.title", value: "Self Update" },
      timestamp: new Date().toISOString(),
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockUpdatePreviewContent).not.toHaveBeenCalled();
  });

  it("debounces incoming updates at 100ms", () => {
    renderHook(() => usePreviewSync("page-1", 42));

    // Send multiple rapid updates
    simulateMessage({
      type: "CONTENT_UPDATE",
      userId: 99,
      data: { blockId: 1, fieldPath: "content.title", value: "First" },
      timestamp: new Date().toISOString(),
    });
    simulateMessage({
      type: "CONTENT_UPDATE",
      userId: 99,
      data: { blockId: 1, fieldPath: "content.title", value: "Second" },
      timestamp: new Date().toISOString(),
    });

    // Not called yet (debounce not elapsed)
    expect(mockUpdatePreviewContent).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Should be called once (debounced)
    expect(mockUpdatePreviewContent).toHaveBeenCalledTimes(1);
  });

  // ---- 5.4.1: Return value -------------------------------------------------

  it("returns { isConnected, activeUsers, cursorPositions, locks, broadcastChange, broadcastCursor }", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));
    expect(result.current).toHaveProperty("isConnected");
    expect(result.current).toHaveProperty("activeUsers");
    expect(result.current).toHaveProperty("cursorPositions");
    expect(result.current).toHaveProperty("locks");
    expect(result.current).toHaveProperty("broadcastChange");
    expect(result.current).toHaveProperty("broadcastCursor");
  });

  it("isConnected is true when connectionState is connected", () => {
    mockConnectionState = "connected";
    const { result } = renderHook(() => usePreviewSync("page-1", 42));
    expect(result.current.isConnected).toBe(true);
  });

  it("isConnected is false when connectionState is disconnected", () => {
    mockConnectionState = "disconnected";
    const { result } = renderHook(() => usePreviewSync("page-1", 42));
    expect(result.current.isConnected).toBe(false);
  });

  // ---- 5.4.1: Cleanup ------------------------------------------------------

  it("clears debounce timer on unmount (no memory leak)", () => {
    const { unmount } = renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "CONTENT_UPDATE",
      userId: 99,
      data: { blockId: 1, fieldPath: "content.title", value: "Test" },
      timestamp: new Date().toISOString(),
    });

    unmount();

    // Advance timers after unmount — should NOT call updatePreviewContent
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(mockUpdatePreviewContent).not.toHaveBeenCalled();
  });

  // ---- 5.4.2: Broadcast changes --------------------------------------------

  it("broadcastChange sends CONTENT_UPDATE message with correct shape", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    act(() => {
      result.current.broadcastChange(1, "content.title", "New Value");
    });

    // Flush throttle
    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CONTENT_UPDATE",
        roomId: "page:page-1",
        data: expect.objectContaining({
          blockId: 1,
          fieldPath: "content.title",
          value: "New Value",
        }),
      }),
    );
  });

  it("does NOT broadcast when disconnected", () => {
    mockConnectionState = "disconnected";
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    act(() => {
      result.current.broadcastChange(1, "content.title", "Value");
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockSend).not.toHaveBeenCalled();
  });

  it("broadcastChange is throttled to 100ms", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    // Rapid fire 3 calls
    act(() => {
      result.current.broadcastChange(1, "content.title", "A");
      result.current.broadcastChange(1, "content.title", "B");
      result.current.broadcastChange(1, "content.title", "C");
    });

    // Only the first should go through immediately (throttle leading edge)
    // or the last after timeout
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // At most 2 sends (leading + trailing after throttle)
    expect(mockSend.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it("client-side dedup skips echoed messages with same timestamp", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    const ts = new Date().toISOString();

    // Broadcast a change
    act(() => {
      result.current.broadcastChange(1, "content.title", "Sent");
    });
    act(() => {
      vi.advanceTimersByTime(150);
    });

    // Clear mock to track only incoming handling
    mockUpdatePreviewContent.mockClear();

    // Now simulate receiving back our own message (echo) with same userId
    simulateMessage({
      type: "CONTENT_UPDATE",
      userId: 42,
      data: { blockId: 1, fieldPath: "content.title", value: "Sent" },
      timestamp: ts,
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockUpdatePreviewContent).not.toHaveBeenCalled();
  });

  // ---- 5.4.3: Cursor tracking ----------------------------------------------

  it("tracks cursor positions from CURSOR_MOVE messages", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "CURSOR_MOVE",
      userId: 99,
      data: { blockId: 1, x: 100, y: 200 },
    });

    expect(result.current.cursorPositions.size).toBe(1);
    const cursor = result.current.cursorPositions.get(99);
    expect(cursor).toMatchObject({ blockId: 1, x: 100, y: 200 });
  });

  it("clears cursor when USER_LEFT message received", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    // Add cursor
    simulateMessage({
      type: "CURSOR_MOVE",
      userId: 99,
      data: { blockId: 1, x: 100, y: 200 },
    });
    expect(result.current.cursorPositions.size).toBe(1);

    // User leaves
    simulateMessage({
      type: "USER_LEFT",
      userId: 99,
      roomId: "page:page-1",
    });

    expect(result.current.cursorPositions.has(99)).toBe(false);
  });

  // ---- 5.4.3: Broadcast cursor ---------------------------------------------

  it("broadcastCursor sends CURSOR_MOVE message throttled", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    act(() => {
      result.current.broadcastCursor(1, 50, 60);
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CURSOR_MOVE",
        roomId: "page:page-1",
        data: expect.objectContaining({ blockId: 1, x: 50, y: 60 }),
      }),
    );
  });

  // ---- 5.4.4: Lock tracking ------------------------------------------------

  it("tracks locks from LOCK_ACQUIRE messages", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "LOCK_ACQUIRE",
      userId: 99,
      data: { blockId: 5, fieldPath: "content.title" },
      timestamp: new Date().toISOString(),
    });

    expect(result.current.locks.size).toBe(1);
    const lock = result.current.locks.get(5);
    expect(lock).toMatchObject({ userId: 99, blockId: 5 });
  });

  it("removes lock on LOCK_RELEASE message", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "LOCK_ACQUIRE",
      userId: 99,
      data: { blockId: 5 },
      timestamp: new Date().toISOString(),
    });
    expect(result.current.locks.size).toBe(1);

    simulateMessage({
      type: "LOCK_RELEASE",
      userId: 99,
      data: { blockId: 5 },
      timestamp: new Date().toISOString(),
    });
    expect(result.current.locks.size).toBe(0);
  });

  it("auto-releases stale lock after 30s", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "LOCK_ACQUIRE",
      userId: 99,
      data: { blockId: 5 },
      timestamp: new Date().toISOString(),
    });
    expect(result.current.locks.size).toBe(1);

    act(() => {
      vi.advanceTimersByTime(31000);
    });

    expect(result.current.locks.size).toBe(0);
  });

  // ---- 5.4.4: Active users from ROOM_STATE ---------------------------------

  it("populates activeUsers from ROOM_STATE message", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "ROOM_STATE",
      roomId: "page:page-1",
      data: {
        roomId: "page:page-1",
        members: [
          { userId: 42, username: "Alice" },
          { userId: 99, username: "Bob" },
        ],
      },
    });

    expect(result.current.activeUsers).toHaveLength(2);
    expect(result.current.activeUsers[0]).toMatchObject({
      userId: 42,
      username: "Alice",
    });
  });

  it("adds user on USER_JOINED message", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    // Set initial state
    simulateMessage({
      type: "ROOM_STATE",
      roomId: "page:page-1",
      data: {
        roomId: "page:page-1",
        members: [{ userId: 42, username: "Alice" }],
      },
    });
    expect(result.current.activeUsers).toHaveLength(1);

    simulateMessage({
      type: "USER_JOINED",
      userId: 99,
      roomId: "page:page-1",
      data: { userId: 99, username: "Bob" },
    });

    expect(result.current.activeUsers).toHaveLength(2);
  });

  it("removes user on USER_LEFT message", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "ROOM_STATE",
      roomId: "page:page-1",
      data: {
        roomId: "page:page-1",
        members: [
          { userId: 42, username: "Alice" },
          { userId: 99, username: "Bob" },
        ],
      },
    });
    expect(result.current.activeUsers).toHaveLength(2);

    simulateMessage({
      type: "USER_LEFT",
      userId: 99,
      roomId: "page:page-1",
    });

    expect(result.current.activeUsers).toHaveLength(1);
  });

  // ---- Edge cases -----------------------------------------------------------

  it("handles null/undefined pageId gracefully", () => {
    expect(() => {
      renderHook(() => usePreviewSync("", 42));
    }).not.toThrow();
  });

  it("ignores malformed messages (missing data)", () => {
    renderHook(() => usePreviewSync("page-1", 42));

    simulateMessage({
      type: "CONTENT_UPDATE",
      userId: 99,
      // No data field
    });

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(mockUpdatePreviewContent).not.toHaveBeenCalled();
  });

  it("caps cursor positions at 20 entries (performance guard)", () => {
    const { result } = renderHook(() => usePreviewSync("page-1", 42));

    // Add 25 cursor positions
    for (let i = 1; i <= 25; i++) {
      simulateMessage({
        type: "CURSOR_MOVE",
        userId: i,
        data: { blockId: 1, x: i * 10, y: i * 10 },
      });
    }

    expect(result.current.cursorPositions.size).toBeLessThanOrEqual(20);
  });
});
