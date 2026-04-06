/**
 * Tests for useLocalStorageBackup hook (Step 5.10)
 *
 * Covers:
 * - Save to localStorage on beforeunload when hasUnsavedChanges
 * - No save when !hasUnsavedChanges
 * - Detect backup on mount
 * - Restore backup returns data and clears storage
 * - Discard backup clears storage
 * - clearBackup removes entry
 * - Stale backups (>24h) are discarded
 * - Multiple tabs: sessionStorage flag prevents double restore
 * - Quota exceeded: fails silently
 * - buildKey / buildSessionFlag helpers
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useLocalStorageBackup,
  buildKey,
  buildSessionFlag,
  readBackup,
  writeBackup,
  cleanupStaleBackups,
} from "../useLocalStorageBackup";

// ---------------------------------------------------------------------------
// Realistic localStorage / sessionStorage mock
// ---------------------------------------------------------------------------
// The global setup mocks localStorage with vi.fn() (returns undefined).
// We need a functional in-memory store for these tests.

let localStore: Record<string, string> = {};
let sessionStore: Record<string, string> = {};

function createStorageMock(store: Record<string, string>) {
  return {
    getItem: vi.fn((key: string) => (key in store ? store[key] : null)),
    setItem: vi.fn((key: string, val: string) => {
      store[key] = String(val);
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      for (const k of Object.keys(store)) delete store[k];
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
}

beforeEach(() => {
  localStore = {};
  sessionStore = {};
  Object.defineProperty(global, "localStorage", {
    value: createStorageMock(localStore),
    writable: true,
    configurable: true,
  });
  Object.defineProperty(global, "sessionStorage", {
    value: createStorageMock(sessionStore),
    writable: true,
    configurable: true,
  });
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// Helper utilities
// ---------------------------------------------------------------------------

describe("buildKey", () => {
  it("returns correct key format", () => {
    expect(buildKey(42, 7)).toBe("UNSAVED_CHANGES_42_7");
    expect(buildKey("abc", "def")).toBe("UNSAVED_CHANGES_abc_def");
  });
});

describe("buildSessionFlag", () => {
  it("returns correct flag format", () => {
    expect(buildSessionFlag(42, 7)).toBe("RESTORE_CLAIMED_42_7");
  });
});

describe("readBackup", () => {
  it("returns null for missing key", () => {
    expect(readBackup("UNSAVED_CHANGES_1_1")).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    localStore["UNSAVED_CHANGES_1_1"] = "not-json";
    expect(readBackup("UNSAVED_CHANGES_1_1")).toBeNull();
  });

  it("returns null for entry without timestamp", () => {
    localStore["UNSAVED_CHANGES_1_1"] = JSON.stringify({ data: {} });
    expect(readBackup("UNSAVED_CHANGES_1_1")).toBeNull();
  });

  it("returns null and removes stale entry (>24h)", () => {
    const staleEntry = {
      data: { blocks: [] },
      timestamp: Date.now() - 25 * 60 * 60 * 1000,
    };
    localStore["UNSAVED_CHANGES_1_1"] = JSON.stringify(staleEntry);

    expect(readBackup("UNSAVED_CHANGES_1_1")).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith("UNSAVED_CHANGES_1_1");
  });

  it("returns valid entry within 24h", () => {
    const entry = { data: { blocks: [1, 2] }, timestamp: Date.now() - 1000 };
    localStore["UNSAVED_CHANGES_1_1"] = JSON.stringify(entry);

    const result = readBackup("UNSAVED_CHANGES_1_1");
    expect(result).toEqual(entry);
  });
});

describe("writeBackup", () => {
  it("writes entry to localStorage", () => {
    const result = writeBackup("UNSAVED_CHANGES_1_1", { blocks: [1] });
    expect(result).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalled();

    const stored = JSON.parse(localStore["UNSAVED_CHANGES_1_1"]);
    expect(stored.data).toEqual({ blocks: [1] });
    expect(typeof stored.timestamp).toBe("number");
  });

  it("returns false on quota exceeded", () => {
    (localStorage.setItem as ReturnType<typeof vi.fn>).mockImplementationOnce(
      () => {
        throw new DOMException("QuotaExceeded");
      },
    );
    expect(writeBackup("UNSAVED_CHANGES_1_1", { blocks: [] })).toBe(false);
  });
});

describe("cleanupStaleBackups", () => {
  it("removes stale entries and keeps fresh ones", () => {
    const stale = { data: {}, timestamp: Date.now() - 25 * 60 * 60 * 1000 };
    const fresh = { data: {}, timestamp: Date.now() - 1000 };
    localStore["UNSAVED_CHANGES_1_1"] = JSON.stringify(stale);
    localStore["UNSAVED_CHANGES_2_2"] = JSON.stringify(fresh);
    localStore["OTHER_KEY"] = "value";

    cleanupStaleBackups();

    expect(localStore["UNSAVED_CHANGES_1_1"]).toBeUndefined();
    expect(localStore["UNSAVED_CHANGES_2_2"]).toBeDefined();
    expect(localStore["OTHER_KEY"]).toBe("value");
  });
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

describe("useLocalStorageBackup", () => {
  const defaultProps = {
    websiteId: 42 as number | null,
    pageId: 7 as number | null,
    currentData: { blocks: [{ id: "1", type: "TEXT" }] },
    hasUnsavedChanges: false,
    isLoading: false,
  };

  it("returns expected shape", () => {
    const { result } = renderHook(() => useLocalStorageBackup(defaultProps));

    expect(typeof result.current.hasBackup).toBe("boolean");
    expect(typeof result.current.restoreBackup).toBe("function");
    expect(typeof result.current.discardBackup).toBe("function");
    expect(typeof result.current.clearBackup).toBe("function");
  });

  it("detects no backup when localStorage is empty", () => {
    const { result } = renderHook(() => useLocalStorageBackup(defaultProps));
    expect(result.current.hasBackup).toBe(false);
    expect(result.current.backupEntry).toBeNull();
  });

  it("detects existing backup on mount", () => {
    const entry = {
      data: { blocks: [{ id: "99" }] },
      timestamp: Date.now() - 5000,
    };
    localStore["UNSAVED_CHANGES_42_7"] = JSON.stringify(entry);

    const { result } = renderHook(() => useLocalStorageBackup(defaultProps));

    expect(result.current.hasBackup).toBe(true);
    expect(result.current.backupEntry?.data).toEqual(entry.data);
  });

  it("does not detect backup while isLoading=true", () => {
    const entry = { data: { blocks: [] }, timestamp: Date.now() - 5000 };
    localStore["UNSAVED_CHANGES_42_7"] = JSON.stringify(entry);

    const { result } = renderHook(() =>
      useLocalStorageBackup({ ...defaultProps, isLoading: true }),
    );

    expect(result.current.hasBackup).toBe(false);
  });

  it("does not detect backup when IDs are null", () => {
    const entry = { data: { blocks: [] }, timestamp: Date.now() - 5000 };
    localStore["UNSAVED_CHANGES_42_7"] = JSON.stringify(entry);

    const { result } = renderHook(() =>
      useLocalStorageBackup({ ...defaultProps, websiteId: null }),
    );

    expect(result.current.hasBackup).toBe(false);
  });

  it("restoreBackup returns data and clears state", () => {
    const entry = {
      data: { blocks: [{ id: "a" }] },
      timestamp: Date.now() - 5000,
    };
    localStore["UNSAVED_CHANGES_42_7"] = JSON.stringify(entry);

    const { result } = renderHook(() => useLocalStorageBackup(defaultProps));

    expect(result.current.hasBackup).toBe(true);

    let restored: Record<string, unknown> | null = null;
    act(() => {
      restored = result.current.restoreBackup();
    });

    expect(restored).toEqual(entry.data);
    expect(result.current.hasBackup).toBe(false);
    expect(localStore["UNSAVED_CHANGES_42_7"]).toBeUndefined();
  });

  it("discardBackup clears localStorage and state", () => {
    const entry = { data: { blocks: [] }, timestamp: Date.now() - 5000 };
    localStore["UNSAVED_CHANGES_42_7"] = JSON.stringify(entry);

    const { result } = renderHook(() => useLocalStorageBackup(defaultProps));

    expect(result.current.hasBackup).toBe(true);

    act(() => {
      result.current.discardBackup();
    });

    expect(result.current.hasBackup).toBe(false);
    expect(localStore["UNSAVED_CHANGES_42_7"]).toBeUndefined();
    // Session flag cleared so future visits can detect new backups
    expect(sessionStore["RESTORE_CLAIMED_42_7"]).toBeUndefined();
  });

  it("clearBackup removes localStorage entry", () => {
    localStore["UNSAVED_CHANGES_42_7"] = JSON.stringify({
      data: {},
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useLocalStorageBackup(defaultProps));

    act(() => {
      result.current.clearBackup();
    });

    expect(localStore["UNSAVED_CHANGES_42_7"]).toBeUndefined();
  });

  it("saves to localStorage on beforeunload when hasUnsavedChanges", () => {
    renderHook(() =>
      useLocalStorageBackup({
        ...defaultProps,
        hasUnsavedChanges: true,
        currentData: { blocks: [{ id: "saved-block" }] },
      }),
    );

    // Simulate beforeunload
    window.dispatchEvent(new Event("beforeunload"));

    expect(localStore["UNSAVED_CHANGES_42_7"]).toBeDefined();
    const parsed = JSON.parse(localStore["UNSAVED_CHANGES_42_7"]);
    expect(parsed.data).toEqual({ blocks: [{ id: "saved-block" }] });
  });

  it("does NOT save to localStorage on beforeunload when no unsaved changes", () => {
    renderHook(() =>
      useLocalStorageBackup({
        ...defaultProps,
        hasUnsavedChanges: false,
      }),
    );

    window.dispatchEvent(new Event("beforeunload"));

    expect(localStore["UNSAVED_CHANGES_42_7"]).toBeUndefined();
  });

  it("multiple tabs: sessionStorage flag prevents double restore", () => {
    const entry = { data: { blocks: [] }, timestamp: Date.now() - 5000 };
    localStore["UNSAVED_CHANGES_42_7"] = JSON.stringify(entry);
    // Simulate another tab already claimed the restore
    sessionStore["RESTORE_CLAIMED_42_7"] = "1";

    const { result } = renderHook(() => useLocalStorageBackup(defaultProps));

    expect(result.current.hasBackup).toBe(false);
    // localStorage should be cleaned up
    expect(localStore["UNSAVED_CHANGES_42_7"]).toBeUndefined();
  });

  it("removes beforeunload listener on unmount", () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() =>
      useLocalStorageBackup({ ...defaultProps, hasUnsavedChanges: true }),
    );

    unmount();

    const calls = removeSpy.mock.calls.filter(
      ([event]) => event === "beforeunload",
    );
    expect(calls.length).toBeGreaterThanOrEqual(1);
  });

  it("restoreBackup returns null when no backup exists", () => {
    const { result } = renderHook(() => useLocalStorageBackup(defaultProps));

    let restored: Record<string, unknown> | null = null;
    act(() => {
      restored = result.current.restoreBackup();
    });

    expect(restored).toBeNull();
  });
});
