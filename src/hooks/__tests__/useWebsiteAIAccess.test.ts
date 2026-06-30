import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

const roleMock = vi.fn();
const getMock = vi.fn();

vi.mock("../../context/PermissionContext", () => ({
  useWebsiteRole: () => roleMock(),
}));
vi.mock("../../api/client", () => ({
  apiClient: { get: (...a: unknown[]) => getMock(...a) },
}));

import { useWebsiteAIAccess, formatResetTime } from "../useWebsiteAIAccess";

beforeEach(() => {
  roleMock.mockReset();
  getMock.mockReset();
  getMock.mockResolvedValue({ data: { remaining: 5, limit: 10 } });
});

describe("useWebsiteAIAccess", () => {
  it("allows OWNER with remaining quota", async () => {
    roleMock.mockReturnValue("OWNER");
    const { result } = renderHook(() => useWebsiteAIAccess(1));
    await waitFor(() => expect(result.current.remaining).toBe(5));
    expect(result.current.canUseAI).toBe(true);
    expect(result.current.disabledReason).toBeNull();
  });

  it("allows ADMIN", () => {
    roleMock.mockReturnValue("ADMIN");
    const { result } = renderHook(() => useWebsiteAIAccess(1));
    expect(result.current.canUseAI).toBe(true);
  });

  it("blocks EDITOR / VIEWER (owner/admin only)", () => {
    roleMock.mockReturnValue("EDITOR");
    const { result } = renderHook(() => useWebsiteAIAccess(1));
    expect(result.current.canUseAI).toBe(false);
    expect(result.current.disabledReason).toMatch(/owner or an admin/i);
  });

  it("blocks when quota exhausted", async () => {
    roleMock.mockReturnValue("OWNER");
    getMock.mockResolvedValue({ data: { remaining: 0, limit: 10 } });
    const { result } = renderHook(() => useWebsiteAIAccess(1));
    await waitFor(() => expect(result.current.quotaExhausted).toBe(true));
    expect(result.current.canUseAI).toBe(false);
    expect(result.current.disabledReason).toMatch(/used all your website AI/i);
  });

  it("does not block AI when the quota read fails", async () => {
    roleMock.mockReturnValue("OWNER");
    getMock.mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useWebsiteAIAccess(1));
    await waitFor(() => expect(getMock).toHaveBeenCalled());
    expect(result.current.canUseAI).toBe(true);
  });

  it("blocks when a request is already active", () => {
    roleMock.mockReturnValue("OWNER");
    const { result } = renderHook(() =>
      useWebsiteAIAccess(1, { activeRequest: true }),
    );
    expect(result.current.canUseAI).toBe(false);
    expect(result.current.disabledReason).toMatch(/already in progress/i);
  });
});

describe("formatResetTime", () => {
  it("returns 'soon' for missing/invalid/past times", () => {
    expect(formatResetTime(null)).toBe("soon");
    expect(formatResetTime("not-a-date")).toBe("soon");
    expect(formatResetTime(new Date(Date.now() - 1000).toISOString())).toBe(
      "soon",
    );
  });

  it("formats minutes and hours ahead", () => {
    const in30 = new Date(Date.now() + 30 * 60000).toISOString();
    expect(formatResetTime(in30)).toMatch(/in \d+ min/);
    const in3h = new Date(Date.now() + 3 * 3600_000).toISOString();
    expect(formatResetTime(in3h)).toMatch(/in \d+h/);
  });
});
