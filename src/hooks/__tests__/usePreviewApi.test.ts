/**
 * Tests for usePreviewApi hooks (Step 4.6)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import axios from "axios";

vi.mock("axios", async () => {
  const actual = await vi.importActual("axios");
  return {
    ...actual,
    default: {
      get: vi.fn(),
      post: vi.fn(),
      isCancel: (actual as any).isCancel ?? (() => false),
    },
    isAxiosError: (actual as any).isAxiosError,
  };
});

import {
  useTemplateScreenshots,
  usePreviewGallery,
  useWebsitePreviewStatus,
  usePreviewIframe,
} from "../usePreviewApi";

const mockedAxios = axios as any;

describe("useTemplateScreenshots", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when templateId is null", () => {
    const { result } = renderHook(() => useTemplateScreenshots(null));
    expect(result.current.screenshots).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it("fetches screenshots for a template", async () => {
    const mockData = {
      data: { desktop: "/d.png", mobile: "/m.png", thumbnail: "/t.png" },
    };
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const { result } = renderHook(() => useTemplateScreenshots("tpl-1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.screenshots).toEqual(mockData.data);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("/previews/templates/tpl-1/screenshots"),
    );
  });

  it("handles errors", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("Network Error"));

    const { result } = renderHook(() => useTemplateScreenshots("tpl-1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load screenshots");
    expect(result.current.screenshots).toBeNull();
  });

  it("refetch triggers new request", async () => {
    mockedAxios.get.mockResolvedValue({
      data: { data: { desktop: "/d.png", mobile: null, thumbnail: null } },
    });

    const { result } = renderHook(() => useTemplateScreenshots("tpl-1"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    act(() => result.current.refetch());
    await waitFor(() => expect(mockedAxios.get).toHaveBeenCalledTimes(2));
  });
});

describe("usePreviewGallery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches paginated gallery", async () => {
    const mockResp = {
      data: {
        data: [{ id: "tpl-1", name: "Test" }],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      },
    };
    mockedAxios.get.mockResolvedValueOnce(mockResp);

    const { result } = renderHook(() =>
      usePreviewGallery({
        page: 1,
        limit: 20,
        category: "business",
        sort: "popular",
      }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.items).toEqual([{ id: "tpl-1", name: "Test" }]);
    expect(result.current.pagination).toEqual(mockResp.data.pagination);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("category=business"),
    );
  });

  it("handles errors", async () => {
    mockedAxios.get.mockRejectedValueOnce(new Error("fail"));

    const { result } = renderHook(() => usePreviewGallery());

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Failed to load preview gallery");
  });
});

describe("useWebsitePreviewStatus", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when websiteId is null", () => {
    const { result } = renderHook(() => useWebsitePreviewStatus(null));
    expect(result.current.status).toBeNull();
  });

  it("fetches status with auth token", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: { data: { cached: true, status: "cached" } },
    });

    const { result } = renderHook(() =>
      useWebsitePreviewStatus("123", "my-token"),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.status).toEqual({ cached: true, status: "cached" });
    expect(mockedAxios.get).toHaveBeenCalledWith(
      expect.stringContaining("/previews/websites/123/status"),
      expect.objectContaining({
        headers: { Authorization: "Bearer my-token" },
      }),
    );
  });
});

describe("usePreviewIframe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty src when websiteId is null", () => {
    const { result } = renderHook(() =>
      usePreviewIframe(null, null, "desktop"),
    );
    expect(result.current.src).toBe("");
  });

  it("builds src URL with token after successful token acquisition", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        data: {
          previewToken: "test-token-123",
          expiresAt: new Date(Date.now() + 300000).toISOString(),
        },
      },
    });

    const { result } = renderHook(() => usePreviewIframe("1", "2", "desktop"));

    await waitFor(() => expect(result.current.src).not.toBe(""));

    expect(result.current.src).toContain("/previews/websites/1/pages/2/html");
    expect(result.current.src).toContain("viewport=desktop");
    expect(result.current.src).toContain("token=test-token-123");
  });

  it("starts with loading=true", () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { data: { previewToken: "tok", expiresAt: null } },
    });
    const { result } = renderHook(() => usePreviewIframe("1", "2", "desktop"));
    expect(result.current.iframeLoading).toBe(true);
  });

  it("onLoad sets loading to false", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { data: { previewToken: "tok", expiresAt: null } },
    });
    const { result } = renderHook(() => usePreviewIframe("1", "2", "desktop"));
    await waitFor(() => expect(result.current.src).not.toBe(""));

    act(() => result.current.onLoad());
    expect(result.current.iframeLoading).toBe(false);
    expect(result.current.iframeError).toBe(false);
  });

  it("onError sets error to true", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: { data: { previewToken: "tok", expiresAt: null } },
    });
    const { result } = renderHook(() => usePreviewIframe("1", "2", "desktop"));
    await waitFor(() => expect(result.current.src).not.toBe(""));

    act(() => result.current.onError());
    expect(result.current.iframeError).toBe(true);
    expect(result.current.iframeLoading).toBe(false);
  });

  it("sets iframeError when token acquisition fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Auth failed"));

    const { result } = renderHook(() => usePreviewIframe("1", "2", "desktop"));

    await waitFor(() => expect(result.current.iframeError).toBe(true));
    expect(result.current.src).toBe("");
  });

  it("has tokenExpired field", () => {
    const { result } = renderHook(() =>
      usePreviewIframe(null, null, "desktop"),
    );
    expect(result.current.tokenExpired).toBe(false);
  });
});
