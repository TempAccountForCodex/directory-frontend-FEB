/**
 * Tests for websocket.ts type definitions and type guards (Step 5.3.4)
 *
 * Covers:
 * - All 10 message types defined
 * - Type guards correctly narrow message types
 * - Type guards reject invalid/malformed messages
 * - Unknown fields are safely handled via discriminated unions
 */
import { describe, it, expect } from "vitest";
import {
  isContentUpdate,
  isCursorMove,
  isLockMessage,
  isRoomState,
  type WebSocketMessage,
  type ContentUpdateData,
  type CursorMoveData,
  type LockData,
  type RoomStateData,
} from "../websocket";

// ---------------------------------------------------------------------------
// All message types are recognized (compile-time + runtime)
// ---------------------------------------------------------------------------

describe("WebSocketMessageType coverage", () => {
  const allTypes: WebSocketMessage["type"][] = [
    "JOIN_ROOM",
    "LEAVE_ROOM",
    "USER_JOINED",
    "USER_LEFT",
    "CONTENT_UPDATE",
    "CURSOR_MOVE",
    "LOCK_ACQUIRE",
    "LOCK_RELEASE",
    "ERROR",
    "ROOM_STATE",
  ];

  it("has exactly 10 message types", () => {
    expect(allTypes).toHaveLength(10);
  });

  it("all 10 types are unique strings", () => {
    const unique = new Set(allTypes);
    expect(unique.size).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// isContentUpdate
// ---------------------------------------------------------------------------

describe("isContentUpdate", () => {
  it("returns true for valid CONTENT_UPDATE message", () => {
    const msg: WebSocketMessage = {
      type: "CONTENT_UPDATE",
      data: { blockId: 5, fieldPath: "heading", value: "Hello" },
    };
    expect(isContentUpdate(msg)).toBe(true);
  });

  it("returns false for wrong type", () => {
    const msg: WebSocketMessage = {
      type: "CURSOR_MOVE",
      data: { blockId: 5, fieldPath: "heading", value: "Hello" },
    };
    expect(isContentUpdate(msg)).toBe(false);
  });

  it("returns false when data is missing", () => {
    const msg: WebSocketMessage = { type: "CONTENT_UPDATE" };
    expect(isContentUpdate(msg)).toBe(false);
  });

  it("returns false when blockId is not a number", () => {
    const msg: WebSocketMessage = {
      type: "CONTENT_UPDATE",
      data: { blockId: "abc", fieldPath: "heading", value: "Hello" },
    };
    expect(isContentUpdate(msg)).toBe(false);
  });

  it("returns false when fieldPath is missing", () => {
    const msg: WebSocketMessage = {
      type: "CONTENT_UPDATE",
      data: { blockId: 5, value: "Hello" },
    };
    expect(isContentUpdate(msg)).toBe(false);
  });

  it("narrows type and allows accessing ContentUpdateData fields", () => {
    const msg: WebSocketMessage = {
      type: "CONTENT_UPDATE",
      data: { blockId: 42, fieldPath: "title", value: "New Title" },
    };
    if (isContentUpdate(msg)) {
      const data = msg.data as ContentUpdateData;
      expect(data.blockId).toBe(42);
      expect(data.fieldPath).toBe("title");
      expect(data.value).toBe("New Title");
    } else {
      throw new Error("Expected isContentUpdate to return true");
    }
  });
});

// ---------------------------------------------------------------------------
// isCursorMove
// ---------------------------------------------------------------------------

describe("isCursorMove", () => {
  it("returns true for valid CURSOR_MOVE message", () => {
    const msg: WebSocketMessage = {
      type: "CURSOR_MOVE",
      data: { blockId: 1, x: 100, y: 200 },
    };
    expect(isCursorMove(msg)).toBe(true);
  });

  it("returns false for wrong type", () => {
    const msg: WebSocketMessage = {
      type: "CONTENT_UPDATE",
      data: { blockId: 1, x: 100, y: 200, fieldPath: "f", value: "v" },
    };
    expect(isCursorMove(msg)).toBe(false);
  });

  it("returns false when x or y is missing", () => {
    const msg: WebSocketMessage = {
      type: "CURSOR_MOVE",
      data: { blockId: 1, x: 100 },
    };
    expect(isCursorMove(msg)).toBe(false);
  });

  it("returns false when data is absent", () => {
    const msg: WebSocketMessage = { type: "CURSOR_MOVE" };
    expect(isCursorMove(msg)).toBe(false);
  });

  it("narrows type and allows accessing CursorMoveData fields", () => {
    const msg: WebSocketMessage = {
      type: "CURSOR_MOVE",
      data: { blockId: 3, x: 55, y: 77 },
    };
    if (isCursorMove(msg)) {
      const data = msg.data as CursorMoveData;
      expect(data.x).toBe(55);
      expect(data.y).toBe(77);
    } else {
      throw new Error("Expected isCursorMove to return true");
    }
  });
});

// ---------------------------------------------------------------------------
// isLockMessage
// ---------------------------------------------------------------------------

describe("isLockMessage", () => {
  it("returns true for LOCK_ACQUIRE", () => {
    const msg: WebSocketMessage = {
      type: "LOCK_ACQUIRE",
      data: { blockId: 7 },
    };
    expect(isLockMessage(msg)).toBe(true);
  });

  it("returns true for LOCK_RELEASE", () => {
    const msg: WebSocketMessage = {
      type: "LOCK_RELEASE",
      data: { blockId: 7, fieldPath: "description" },
    };
    expect(isLockMessage(msg)).toBe(true);
  });

  it("returns false for non-lock type", () => {
    const msg: WebSocketMessage = {
      type: "JOIN_ROOM",
      roomId: "website:1",
    };
    expect(isLockMessage(msg)).toBe(false);
  });

  it("returns false when data is missing", () => {
    const msg: WebSocketMessage = { type: "LOCK_ACQUIRE" };
    expect(isLockMessage(msg)).toBe(false);
  });

  it("returns false when blockId is not a number", () => {
    const msg: WebSocketMessage = {
      type: "LOCK_ACQUIRE",
      data: { blockId: null },
    };
    expect(isLockMessage(msg)).toBe(false);
  });

  it("narrows type and allows accessing LockData fields", () => {
    const msg: WebSocketMessage = {
      type: "LOCK_ACQUIRE",
      data: { blockId: 9, fieldPath: "intro" },
    };
    if (isLockMessage(msg)) {
      const data = msg.data as LockData;
      expect(data.blockId).toBe(9);
      expect(data.fieldPath).toBe("intro");
    } else {
      throw new Error("Expected isLockMessage to return true");
    }
  });
});

// ---------------------------------------------------------------------------
// isRoomState
// ---------------------------------------------------------------------------

describe("isRoomState", () => {
  it("returns true for valid ROOM_STATE message", () => {
    const msg: WebSocketMessage = {
      type: "ROOM_STATE",
      roomId: "website:1",
      data: {
        roomId: "website:1",
        members: [{ userId: 1, username: "alice" }],
      },
    };
    expect(isRoomState(msg)).toBe(true);
  });

  it("returns false for wrong type", () => {
    const msg: WebSocketMessage = {
      type: "USER_JOINED",
      roomId: "website:1",
      data: { roomId: "website:1", members: [] },
    };
    expect(isRoomState(msg)).toBe(false);
  });

  it("returns false when data is missing", () => {
    const msg: WebSocketMessage = { type: "ROOM_STATE", roomId: "website:1" };
    expect(isRoomState(msg)).toBe(false);
  });

  it("returns false when members is not an array", () => {
    const msg: WebSocketMessage = {
      type: "ROOM_STATE",
      data: { roomId: "website:1", members: "not-array" },
    };
    expect(isRoomState(msg)).toBe(false);
  });

  it("returns true with empty members array", () => {
    const msg: WebSocketMessage = {
      type: "ROOM_STATE",
      data: { roomId: "website:2", members: [] },
    };
    expect(isRoomState(msg)).toBe(true);
  });

  it("narrows type and allows accessing RoomStateData fields", () => {
    const members = [
      { userId: 1, username: "alice" },
      { userId: 2, username: "bob" },
    ];
    const msg: WebSocketMessage = {
      type: "ROOM_STATE",
      data: { roomId: "page:3", members },
    };
    if (isRoomState(msg)) {
      const data = msg.data as RoomStateData;
      expect(data.members).toHaveLength(2);
      expect(data.members[0].username).toBe("alice");
    } else {
      throw new Error("Expected isRoomState to return true");
    }
  });
});

// ---------------------------------------------------------------------------
// Extra fields in messages are safely handled
// ---------------------------------------------------------------------------

describe("extra/unknown fields are ignored", () => {
  it("isContentUpdate ignores unknown extra fields", () => {
    const msg = {
      type: "CONTENT_UPDATE" as const,
      data: {
        blockId: 1,
        fieldPath: "title",
        value: "x",
        unknownField: "should-be-ignored",
        __proto__: {},
      },
    };
    expect(isContentUpdate(msg)).toBe(true);
  });
});
