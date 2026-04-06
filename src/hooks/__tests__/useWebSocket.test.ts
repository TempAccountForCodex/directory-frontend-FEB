/**
 * Tests for useWebSocket hook (Step 5.3.3)
 *
 * Covers:
 * - Establishes WebSocket connection with JWT token in query param
 * - connectionState transitions: connecting → connected / disconnected / error
 * - Auto-reconnect with exponential backoff (1s, 2s, 4s, 8s, 16s, 30s cap)
 * - Reconnect resets delay index on successful connection
 * - No reconnect when enabled=false or component unmounted
 * - send() sends JSON over WebSocket, returns false when disconnected
 * - joinRoom() tracks room in Set, sends JOIN_ROOM
 * - leaveRoom() removes from Set, sends LEAVE_ROOM
 * - On reconnect, previously joined rooms are automatically rejoined
 * - Cleanup on unmount: socket closed, timers cleared
 * - All returned functions are stable references (useCallback)
 * - No connection when auth token is absent
 * - ROOM_STATE messages update connectedUsers count
 * - ping messages receive pong responses
 * - Invalid JSON from server is safely caught
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useWebSocket } from "../useWebSocket";

// ---------------------------------------------------------------------------
// Mock WebSocket
// ---------------------------------------------------------------------------

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState: number = MockWebSocket.CONNECTING;
  url: string;
  onopen: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;

  sentMessages: string[] = [];
  static instances: MockWebSocket[] = [];

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close(code?: number, reason?: string) {
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.onclose?.({
        code: code ?? 1000,
        reason: reason ?? "",
        wasClean: true,
      } as CloseEvent);
    }, 0);
  }

  // Test helpers to simulate server events
  simulateOpen() {
    this.readyState = MockWebSocket.OPEN;
    this.onopen?.(new Event("open"));
  }

  simulateMessage(data: unknown) {
    this.onmessage?.({
      data: typeof data === "string" ? data : JSON.stringify(data),
    } as MessageEvent);
  }

  simulateClose(code = 1000) {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.({ code, wasClean: code === 1000, reason: "" } as CloseEvent);
  }

  simulateError() {
    this.onerror?.(new Event("error"));
  }
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

let originalWebSocket: typeof WebSocket;

beforeEach(() => {
  vi.useFakeTimers();
  MockWebSocket.instances = [];
  originalWebSocket = global.WebSocket;
  global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

  // Default: token is present
  (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
    "test-jwt-token",
  );
});

afterEach(() => {
  global.WebSocket = originalWebSocket;
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.clearAllMocks();
  MockWebSocket.instances = [];
});

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function latestWs(): MockWebSocket {
  const ws = MockWebSocket.instances[MockWebSocket.instances.length - 1];
  if (!ws) throw new Error("No MockWebSocket instance created");
  return ws;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useWebSocket", () => {
  // ---- Initial connection --------------------------------------------------

  it("creates a WebSocket on mount when enabled=true and token exists", () => {
    renderHook(() => useWebSocket());
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("includes token in WebSocket URL", () => {
    renderHook(() => useWebSocket());
    const ws = latestWs();
    expect(ws.url).toContain("test-jwt-token");
  });

  it("does NOT create a WebSocket when token is absent", () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const { result } = renderHook(() => useWebSocket());
    expect(MockWebSocket.instances).toHaveLength(0);
    expect(result.current.connectionState).toBe("disconnected");
  });

  it("does NOT create a WebSocket when enabled=false", () => {
    const { result } = renderHook(() => useWebSocket({ enabled: false }));
    expect(MockWebSocket.instances).toHaveLength(0);
    expect(result.current.connectionState).toBe("disconnected");
  });

  // ---- connectionState transitions ----------------------------------------

  it('starts in "connecting" state while WebSocket is connecting', () => {
    const { result } = renderHook(() => useWebSocket());
    // Before onopen fires
    expect(result.current.connectionState).toBe("connecting");
  });

  it('transitions to "connected" when WebSocket opens', () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());
    expect(result.current.connectionState).toBe("connected");
  });

  it('transitions to "disconnected" on clean close', () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());
    act(() => latestWs().simulateClose(1000));
    expect(result.current.connectionState).toBe("disconnected");
  });

  it('transitions to "error" on onerror event', () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateError());
    expect(result.current.connectionState).toBe("error");
  });

  it('transitions to "error" and does not reconnect on auth failure (4001)', () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => {
      latestWs().simulateOpen();
      latestWs().simulateClose(4001);
    });
    expect(result.current.connectionState).toBe("error");
    // No reconnect timer should fire
    act(() => vi.advanceTimersByTime(60000));
    // Still only 1 WS instance
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  // ---- Auto-reconnect with exponential backoff ----------------------------

  it("schedules reconnect after close (1s first attempt)", () => {
    renderHook(() => useWebSocket());
    act(() => {
      latestWs().simulateOpen();
      latestWs().simulateClose(1001);
    });
    // Before 1s — still 1 instance
    expect(MockWebSocket.instances).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(MockWebSocket.instances).toHaveLength(2);
  });

  it("increases backoff delay on successive failures", () => {
    renderHook(() => useWebSocket());

    // Attempt 1 — close immediately, expect reconnect after 1s
    act(() => latestWs().simulateClose(1001));
    expect(MockWebSocket.instances).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1000));
    expect(MockWebSocket.instances).toHaveLength(2);

    // Attempt 2 — close again, expect reconnect after 2s
    act(() => latestWs().simulateClose(1001));
    act(() => vi.advanceTimersByTime(1999));
    expect(MockWebSocket.instances).toHaveLength(2);
    act(() => vi.advanceTimersByTime(1));
    expect(MockWebSocket.instances).toHaveLength(3);
  });

  it("resets reconnect delay on successful connection", () => {
    const { result } = renderHook(() => useWebSocket());

    // Fail once to increment delay
    act(() => latestWs().simulateClose(1001));
    act(() => vi.advanceTimersByTime(1000)); // 2nd WS created
    expect(MockWebSocket.instances).toHaveLength(2);

    // Connect successfully — resets delay index
    act(() => latestWs().simulateOpen());
    expect(result.current.connectionState).toBe("connected");
    expect(result.current.reconnectAttempt).toBe(0);
  });

  it("caps reconnect delay at 30s", () => {
    renderHook(() => useWebSocket());

    // Fail 6+ times to push past the cap
    const delays = [1000, 2000, 4000, 8000, 16000, 30000];
    let totalInstances = 1;

    for (let i = 0; i < delays.length; i++) {
      act(() => latestWs().simulateClose(1001));
      act(() => vi.advanceTimersByTime(delays[i]));
      totalInstances += 1;
      expect(MockWebSocket.instances).toHaveLength(totalInstances);
    }

    // Next reconnect should also be at 30s
    act(() => latestWs().simulateClose(1001));
    act(() => vi.advanceTimersByTime(29999));
    expect(MockWebSocket.instances).toHaveLength(totalInstances); // no new WS yet
    act(() => vi.advanceTimersByTime(1));
    expect(MockWebSocket.instances).toHaveLength(totalInstances + 1);
  });

  it("does not reconnect when enabled=false after disconnect", () => {
    const { rerender } = renderHook(
      ({ enabled }) => useWebSocket({ enabled }),
      { initialProps: { enabled: true } },
    );
    act(() => latestWs().simulateOpen());

    // Disable before disconnect
    rerender({ enabled: false });
    act(() => vi.advanceTimersByTime(60000));
    // No new WS created
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  it("does not reconnect after unmount", () => {
    const { unmount } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());
    unmount();
    act(() => vi.advanceTimersByTime(60000));
    expect(MockWebSocket.instances).toHaveLength(1);
  });

  // ---- send() --------------------------------------------------------------

  it("send() sends JSON message when connected", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());

    const sent = result.current.send({
      type: "JOIN_ROOM",
      roomId: "website:1",
    });
    expect(sent).toBe(true);
    expect(latestWs().sentMessages).toHaveLength(1);
    expect(JSON.parse(latestWs().sentMessages[0])).toEqual({
      type: "JOIN_ROOM",
      roomId: "website:1",
    });
  });

  it("send() returns false when disconnected", () => {
    const { result } = renderHook(() => useWebSocket());
    // Do not open — still connecting/disconnected
    const sent = result.current.send({
      type: "JOIN_ROOM",
      roomId: "website:1",
    });
    expect(sent).toBe(false);
  });

  // ---- joinRoom / leaveRoom ------------------------------------------------

  it("joinRoom() sends JOIN_ROOM message and tracks room", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());

    result.current.joinRoom("website:42");
    expect(
      latestWs().sentMessages.some((m) => {
        const parsed = JSON.parse(m);
        return parsed.type === "JOIN_ROOM" && parsed.roomId === "website:42";
      }),
    ).toBe(true);
  });

  it("leaveRoom() sends LEAVE_ROOM message", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());

    result.current.joinRoom("website:42");
    result.current.leaveRoom("website:42");

    expect(
      latestWs().sentMessages.some((m) => {
        const parsed = JSON.parse(m);
        return parsed.type === "LEAVE_ROOM" && parsed.roomId === "website:42";
      }),
    ).toBe(true);
  });

  it("leaveAllRooms() sends LEAVE_ROOM for all tracked rooms", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());

    result.current.joinRoom("website:1");
    result.current.joinRoom("page:2");
    result.current.leaveAllRooms();

    const leaveMessages = latestWs()
      .sentMessages.map((m) => JSON.parse(m))
      .filter((m) => m.type === "LEAVE_ROOM");

    expect(leaveMessages).toHaveLength(2);
    const rooms = leaveMessages.map((m) => m.roomId);
    expect(rooms).toContain("website:1");
    expect(rooms).toContain("page:2");
  });

  // ---- Reconnect rejoins rooms --------------------------------------------

  it("rejoins previously joined rooms on reconnect", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());

    result.current.joinRoom("website:5");
    result.current.joinRoom("page:10");

    // Disconnect and trigger reconnect
    act(() => latestWs().simulateClose(1001));
    act(() => vi.advanceTimersByTime(1000)); // reconnect fires

    // New WS opens
    act(() => latestWs().simulateOpen());

    // After reconnect, JOIN_ROOM should be sent for both rooms
    const joinMessages = latestWs()
      .sentMessages.map((m) => JSON.parse(m))
      .filter((m) => m.type === "JOIN_ROOM");

    const rooms = joinMessages.map((m) => m.roomId);
    expect(rooms).toContain("website:5");
    expect(rooms).toContain("page:10");
  });

  // ---- onMessage callback -------------------------------------------------

  it("calls onMessage callback when server sends a message", () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket({ onMessage }));
    act(() => latestWs().simulateOpen());

    const msg = { type: "USER_JOINED", roomId: "website:1", userId: 7 };
    act(() => latestWs().simulateMessage(msg));

    expect(onMessage).toHaveBeenCalledOnce();
    expect(onMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "USER_JOINED",
        roomId: "website:1",
      }),
    );
  });

  it("safely ignores invalid JSON from server", () => {
    const onMessage = vi.fn();
    renderHook(() => useWebSocket({ onMessage }));
    act(() => latestWs().simulateOpen());

    // Should not throw
    expect(() => {
      act(() => latestWs().simulateMessage("not-valid-json{{{"));
    }).not.toThrow();

    expect(onMessage).not.toHaveBeenCalled();
  });

  // ---- ROOM_STATE → connectedUsers ----------------------------------------

  it("updates connectedUsers from ROOM_STATE message", () => {
    const { result } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());

    act(() =>
      latestWs().simulateMessage({
        type: "ROOM_STATE",
        data: {
          roomId: "website:1",
          members: [
            { userId: 1, username: "alice" },
            { userId: 2, username: "bob" },
          ],
        },
      }),
    );

    expect(result.current.connectedUsers).toBe(2);
  });

  // ---- Ping/pong ----------------------------------------------------------

  it("responds to JSON ping message with pong", () => {
    renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());

    act(() => latestWs().simulateMessage({ type: "ping" }));

    expect(
      latestWs().sentMessages.some((m) => {
        const parsed = JSON.parse(m);
        return parsed.type === "pong";
      }),
    ).toBe(true);
  });

  // ---- Cleanup on unmount -------------------------------------------------

  it("closes WebSocket on unmount", () => {
    const { unmount } = renderHook(() => useWebSocket());
    act(() => latestWs().simulateOpen());
    const ws = latestWs();
    unmount();
    expect(ws.readyState).not.toBe(MockWebSocket.OPEN);
  });

  it("does not throw on unmount with no connection", () => {
    const { unmount } = renderHook(() => useWebSocket({ enabled: false }));
    expect(() => unmount()).not.toThrow();
  });

  // ---- Stable function references -----------------------------------------

  it("send, joinRoom, leaveRoom, leaveAllRooms are stable across renders", () => {
    const { result, rerender } = renderHook(() => useWebSocket());
    const first = {
      send: result.current.send,
      joinRoom: result.current.joinRoom,
      leaveRoom: result.current.leaveRoom,
      leaveAllRooms: result.current.leaveAllRooms,
    };
    rerender();
    expect(result.current.send).toBe(first.send);
    expect(result.current.joinRoom).toBe(first.joinRoom);
    expect(result.current.leaveRoom).toBe(first.leaveRoom);
    expect(result.current.leaveAllRooms).toBe(first.leaveAllRooms);
  });

  // ---- reconnectAttempt counter -------------------------------------------

  it("increments reconnectAttempt on each retry", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => latestWs().simulateClose(1001));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.reconnectAttempt).toBe(1);

    act(() => latestWs().simulateClose(1001));
    act(() => vi.advanceTimersByTime(2000));
    expect(result.current.reconnectAttempt).toBe(2);
  });

  it("resets reconnectAttempt to 0 on successful reconnect", () => {
    const { result } = renderHook(() => useWebSocket());

    act(() => latestWs().simulateClose(1001));
    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.reconnectAttempt).toBe(1);

    act(() => latestWs().simulateOpen());
    expect(result.current.reconnectAttempt).toBe(0);
  });
});
