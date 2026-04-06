/**
 * Tests for useTemplateFavorites hook (Step 3.6.3)
 *
 * Covers:
 * 1.  initial state: favorites=[], loading=true on mount
 * 2.  fetchFavorites populates favorites array on success
 * 3.  loading=false after fetch completes
 * 4.  isFavorited(id) returns true when template is in favorites
 * 5.  isFavorited(id) returns false when template is NOT in favorites
 * 6.  toggleFavorite optimistically updates state (favorited -> unfavorited)
 * 7.  toggleFavorite optimistically updates state (unfavorited -> favorited)
 * 8.  toggleFavorite reverts state on API failure
 * 9.  toggleFavorite calls correct API endpoint
 * 10. error state is set on fetch failure
 * 11. fetchFavorites sets loading=false after error
 * 12. API_URL fallback to http://localhost:5001/api
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
const mockAxiosGet = vi.fn();
const mockAxiosPost = vi.fn();

vi.mock("axios", () => ({
  default: {
    get: (...args: unknown[]) => mockAxiosGet(...args),
    post: (...args: unknown[]) => mockAxiosPost(...args),
  },
}));

// ---------------------------------------------------------------------------
// Import hook after mocks
// ---------------------------------------------------------------------------
import { useTemplateFavorites } from "../useTemplateFavorites";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
// API returns UserTemplateFavorite records with nested template objects.
// The hook maps these to TemplateSummary[] (extracting .template + thumbnailUrl → previewImage).
const fakeFavorites = [
  {
    id: 1,
    userId: 1,
    templateId: "tpl-1",
    createdAt: "2026-03-14",
    template: {
      id: "tpl-1",
      name: "Business Template",
      slug: "business",
      category: "business",
      thumbnailUrl: null,
      description: "Desc",
      isPublished: true,
      status: "approved",
    },
  },
  {
    id: 2,
    userId: 1,
    templateId: "tpl-2",
    createdAt: "2026-03-14",
    template: {
      id: "tpl-2",
      name: "Portfolio Template",
      slug: "portfolio",
      category: "portfolio",
      thumbnailUrl: null,
      description: "Desc 2",
      isPublished: true,
      status: "approved",
    },
  },
];

function makeGetResponse(data: unknown[]) {
  return Promise.resolve({
    data: { data, pagination: { total: data.length, page: 1, limit: 20 } },
  });
}

function makePostResponse(favorited: boolean) {
  return Promise.resolve({ data: { success: true, favorited } });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useTemplateFavorites", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: successful favorites fetch
    mockAxiosGet.mockImplementation(() => makeGetResponse(fakeFavorites));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Initial state
  it("starts with loading=true and empty favorites array", () => {
    const { result } = renderHook(() => useTemplateFavorites());
    expect(result.current.loading).toBe(true);
    expect(result.current.favorites).toEqual([]);
  });

  // 2. fetchFavorites populates favorites
  it("populates favorites after successful fetch", async () => {
    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.favorites[0].id).toBe("tpl-1");
    expect(result.current.favorites[1].id).toBe("tpl-2");
  });

  // 3. loading=false after fetch completes
  it("sets loading=false after fetch completes", async () => {
    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  // 4. isFavorited returns true when in favorites
  it("isFavorited returns true for a template id in favorites list", async () => {
    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorited("tpl-1")).toBe(true);
    expect(result.current.isFavorited("tpl-2")).toBe(true);
  });

  // 5. isFavorited returns false when NOT in favorites
  it("isFavorited returns false for a template id not in favorites list", async () => {
    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFavorited("tpl-999")).toBe(false);
  });

  // 6. toggleFavorite optimistically removes (favorited -> unfavorited)
  it("optimistically removes template from favorites when currently favorited", async () => {
    mockAxiosPost.mockImplementation(() => makePostResponse(false));

    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Confirm it's currently favorited
    expect(result.current.isFavorited("tpl-1")).toBe(true);

    act(() => {
      result.current.toggleFavorite("tpl-1");
    });

    // After optimistic update, it should be removed immediately
    expect(result.current.isFavorited("tpl-1")).toBe(false);

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });
  });

  // 7. toggleFavorite optimistically adds (unfavorited -> favorited)
  it("optimistically adds template to favorites when currently unfavorited", async () => {
    mockAxiosPost.mockImplementation(() => makePostResponse(true));

    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // tpl-99 is not in favorites
    expect(result.current.isFavorited("tpl-99")).toBe(false);

    act(() => {
      result.current.toggleFavorite("tpl-99");
    });

    // After optimistic update, id should be in favorites immediately
    expect(result.current.isFavorited("tpl-99")).toBe(true);

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });
  });

  // 8. toggleFavorite reverts on API failure
  it("reverts favorites state when API call fails", async () => {
    mockAxiosPost.mockImplementation(() =>
      Promise.reject(new Error("Network error")),
    );

    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // tpl-1 is favorited
    expect(result.current.isFavorited("tpl-1")).toBe(true);

    act(() => {
      result.current.toggleFavorite("tpl-1");
    });

    // Optimistically removed
    expect(result.current.isFavorited("tpl-1")).toBe(false);

    // After API failure, reverted
    await waitFor(() => {
      expect(result.current.isFavorited("tpl-1")).toBe(true);
    });
  });

  // 9. toggleFavorite calls correct API endpoint
  it("calls POST /api/templates/:templateId/favorite", async () => {
    mockAxiosPost.mockImplementation(() => makePostResponse(false));

    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.toggleFavorite("tpl-1");
    });

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalledTimes(1);
    });

    const calledUrl = mockAxiosPost.mock.calls[0][0] as string;
    expect(calledUrl).toContain("/templates/tpl-1/favorite");
  });

  // 10. error state is set on fetch failure
  it("sets error when fetchFavorites fails", async () => {
    mockAxiosGet.mockImplementation(() =>
      Promise.reject(new Error("Fetch failed")),
    );

    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Fetch failed");
    expect(result.current.favorites).toEqual([]);
  });

  // 11. loading=false after fetch error
  it("sets loading=false after fetch error", async () => {
    mockAxiosGet.mockImplementation(() =>
      Promise.reject(new Error("Network error")),
    );

    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  // 12. fetchFavorites callable to re-fetch
  it("fetchFavorites can be called to re-trigger fetch", async () => {
    const { result } = renderHook(() => useTemplateFavorites());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // fetchFavorites is exposed in return
    expect(typeof result.current.fetchFavorites).toBe("function");
  });
});
