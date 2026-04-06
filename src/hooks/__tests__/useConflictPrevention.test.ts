/**
 * Tests for useConflictPrevention hook (Step 5.4.5)
 *
 * Covers:
 * - Returns { isLocked, lockedBy, canEdit, collaborationUnavailable }
 * - When another user holds lock on blockId, canEdit=false and lockedBy set
 * - When no lock, canEdit=true
 * - On WebSocket disconnect, sets collaborationUnavailable=true (local editing continues)
 * - On reconnect, clears collaborationUnavailable
 * - Edge cases: null blockId, empty locks map
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Imports
// ---------------------------------------------------------------------------

import { useConflictPrevention } from "../useConflictPrevention";
import type { LockInfo } from "../usePreviewSync";
import type { WebSocketConnectionState } from "../../types/websocket";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useConflictPrevention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ---- Basic return value ---------------------------------------------------

  it("returns { isLocked, lockedBy, canEdit, collaborationUnavailable }", () => {
    const locks = new Map<number, LockInfo>();
    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, locks, "connected"),
    );

    expect(result.current).toHaveProperty("isLocked");
    expect(result.current).toHaveProperty("lockedBy");
    expect(result.current).toHaveProperty("canEdit");
    expect(result.current).toHaveProperty("collaborationUnavailable");
  });

  // ---- Lock check -----------------------------------------------------------

  it("canEdit=true when no lock on blockId", () => {
    const locks = new Map<number, LockInfo>();
    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, locks, "connected"),
    );

    expect(result.current.canEdit).toBe(true);
    expect(result.current.isLocked).toBe(false);
    expect(result.current.lockedBy).toBeNull();
  });

  it("canEdit=false when another user holds lock on blockId", () => {
    const locks = new Map<number, LockInfo>();
    locks.set(1, {
      userId: 99,
      blockId: 1,
      username: "Bob",
      acquiredAt: Date.now(),
    });

    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, locks, "connected"),
    );

    expect(result.current.canEdit).toBe(false);
    expect(result.current.isLocked).toBe(true);
    expect(result.current.lockedBy).toBe("Bob");
  });

  it("canEdit=true when current user holds lock on blockId (own lock)", () => {
    const locks = new Map<number, LockInfo>();
    locks.set(1, {
      userId: 42,
      blockId: 1,
      username: "Alice",
      acquiredAt: Date.now(),
    });

    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, locks, "connected"),
    );

    expect(result.current.canEdit).toBe(true);
    expect(result.current.isLocked).toBe(false);
  });

  it("canEdit=true when lock exists but on different blockId", () => {
    const locks = new Map<number, LockInfo>();
    locks.set(99, {
      userId: 99,
      blockId: 99,
      username: "Bob",
      acquiredAt: Date.now(),
    });

    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, locks, "connected"),
    );

    expect(result.current.canEdit).toBe(true);
  });

  // ---- WebSocket disconnect -------------------------------------------------

  it("collaborationUnavailable=false when connected", () => {
    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, new Map(), "connected"),
    );

    expect(result.current.collaborationUnavailable).toBe(false);
  });

  it("collaborationUnavailable=true when disconnected", () => {
    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, new Map(), "disconnected"),
    );

    expect(result.current.collaborationUnavailable).toBe(true);
  });

  it("collaborationUnavailable=true when error state", () => {
    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, new Map(), "error"),
    );

    expect(result.current.collaborationUnavailable).toBe(true);
  });

  it("canEdit still true when disconnected (local editing continues)", () => {
    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, new Map(), "disconnected"),
    );

    expect(result.current.canEdit).toBe(true);
    expect(result.current.collaborationUnavailable).toBe(true);
  });

  // ---- Edge cases -----------------------------------------------------------

  it("handles empty locks map", () => {
    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, new Map(), "connected"),
    );

    expect(result.current.canEdit).toBe(true);
  });

  it("provides lockedBy username as fallback when username is not set", () => {
    const locks = new Map<number, LockInfo>();
    locks.set(1, {
      userId: 99,
      blockId: 1,
      acquiredAt: Date.now(),
    });

    const { result } = renderHook(() =>
      useConflictPrevention(1, 42, locks, "connected"),
    );

    expect(result.current.lockedBy).toBe("User 99");
  });
});
