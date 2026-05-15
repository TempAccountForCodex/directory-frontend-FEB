/**
 * Tests for Step 2.5.1 — useFieldMetadata hook
 *
 * Covers:
 * 1.  loading is true on initial mount, false after fetch resolves
 * 2.  metadata is populated after a successful fetch
 * 3.  Cache hit: second call with same blockType does NOT trigger a fetch
 * 4.  blockType change triggers a new fetch
 * 5.  error is set to string message on network error
 * 6.  404 response sets error state and does not crash
 * 7.  Non-2xx (500) response sets error with "HTTP 500"
 * 8.  refetch() clears cache and re-fetches
 * 9.  loading is false after error
 * 10. metadata is null on error
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useFieldMetadata } from "../useFieldMetadata";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockMetadata = {
  groups: [
    {
      id: "basic",
      label: "Basic",
      order: 1,
      fields: [
        {
          name: "title",
          type: "text",
          label: "Title",
        },
      ],
    },
  ],
};

function makeFetchOk(data: unknown): () => Promise<Response> {
  return () =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(data),
    } as Response);
}

function makeFetchError(status: number): () => Promise<Response> {
  return () =>
    Promise.resolve({
      ok: false,
      status,
      json: () => Promise.resolve({}),
    } as Response);
}

function makeFetchNetworkError(message: string): () => Promise<Response> {
  return () => Promise.reject(new Error(message));
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("useFieldMetadata", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Ensure global.fetch is a spy we control
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // 1. loading starts true, resolves to false on success
  // -------------------------------------------------------------------------

  it("sets loading to true initially and false after fetch completes", async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchOk(mockMetadata));

    const { result } = renderHook(() => useFieldMetadata("hero"));

    // Initially loading should be true
    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 2. metadata populated on success
  // -------------------------------------------------------------------------

  it("populates metadata after a successful fetch", async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchOk(mockMetadata));

    const { result } = renderHook(() => useFieldMetadata("hero"));

    await waitFor(() => {
      expect(result.current.metadata).toEqual(mockMetadata);
    });

    expect(result.current.error).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  // -------------------------------------------------------------------------
  // 3. Cache hit — same blockType should NOT trigger a second fetch
  // -------------------------------------------------------------------------

  it("uses cache and does not re-fetch for the same blockType", async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchOk(mockMetadata));

    const { result, rerender } = renderHook(
      ({ blockType }: { blockType: string }) => useFieldMetadata(blockType),
      { initialProps: { blockType: "gallery" } },
    );

    // Wait for first fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(1);

    // Re-render with the same blockType — should use cache, not fetch again
    rerender({ blockType: "gallery" });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // fetch should still have been called exactly once
    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(1);
    expect(result.current.metadata).toEqual(mockMetadata);
  });

  // -------------------------------------------------------------------------
  // 4. blockType change triggers a new fetch
  // -------------------------------------------------------------------------

  it("triggers a new fetch when blockType changes", async () => {
    const metadataB = {
      groups: [{ id: "b", label: "B", order: 1, fields: [] }],
    };

    vi.mocked(global.fetch)
      .mockImplementationOnce(makeFetchOk(mockMetadata))
      .mockImplementationOnce(makeFetchOk(metadataB));

    const { result, rerender } = renderHook(
      ({ blockType }: { blockType: string }) => useFieldMetadata(blockType),
      { initialProps: { blockType: "hero" } },
    );

    await waitFor(() => {
      expect(result.current.metadata).toEqual(mockMetadata);
    });

    rerender({ blockType: "testimonial" });

    await waitFor(() => {
      expect(result.current.metadata).toEqual(metadataB);
    });

    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(2);
    expect(vi.mocked(global.fetch)).toHaveBeenNthCalledWith(
      2,
      "/api/content-types/testimonial/fields",
    );
  });

  // -------------------------------------------------------------------------
  // 5. Network error sets error state
  // -------------------------------------------------------------------------

  it("sets error to the network error message when fetch rejects", async () => {
    vi.mocked(global.fetch).mockImplementation(
      makeFetchNetworkError("Network request failed"),
    );

    const { result } = renderHook(() => useFieldMetadata("hero"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("Network request failed");
    expect(result.current.metadata).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 6. 404 response sets error gracefully — does not crash
  // -------------------------------------------------------------------------

  it("handles a 404 response gracefully — sets error, does not crash", async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchError(404));

    const { result } = renderHook(() => useFieldMetadata("nonexistent"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("HTTP 404");
    expect(result.current.metadata).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 7. Non-2xx (500) response sets error with HTTP status
  // -------------------------------------------------------------------------

  it('sets error to "HTTP 500" on a server error response', async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchError(500));

    const { result } = renderHook(() => useFieldMetadata("hero"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("HTTP 500");
    expect(result.current.loading).toBe(false);
    expect(result.current.metadata).toBeNull();
  });

  // -------------------------------------------------------------------------
  // 8. refetch() clears cache and triggers a new fetch
  // -------------------------------------------------------------------------

  it("refetch() evicts cache and re-fetches the data", async () => {
    const updatedMetadata = {
      groups: [{ id: "updated", label: "Updated", order: 1, fields: [] }],
    };

    vi.mocked(global.fetch)
      .mockImplementationOnce(makeFetchOk(mockMetadata))
      .mockImplementationOnce(makeFetchOk(updatedMetadata));

    const { result } = renderHook(() => useFieldMetadata("hero"));

    // Wait for first fetch
    await waitFor(() => {
      expect(result.current.metadata).toEqual(mockMetadata);
    });

    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(1);

    // Trigger refetch (wrapped in act to avoid spurious act() warning)
    act(() => {
      result.current.refetch();
    });

    // Should be loading again
    await waitFor(() => {
      expect(result.current.metadata).toEqual(updatedMetadata);
    });

    expect(vi.mocked(global.fetch)).toHaveBeenCalledTimes(2);
  });

  // -------------------------------------------------------------------------
  // 9. loading is false after an error
  // -------------------------------------------------------------------------

  it("sets loading to false after a fetch error", async () => {
    vi.mocked(global.fetch).mockImplementation(
      makeFetchNetworkError("timeout"),
    );

    const { result } = renderHook(() => useFieldMetadata("hero"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe("timeout");
  });

  // -------------------------------------------------------------------------
  // 10. Correct endpoint URL is called
  // -------------------------------------------------------------------------

  it("fetches from the correct /api/content-types/:blockType/fields endpoint", async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchOk(mockMetadata));

    const { result } = renderHook(() => useFieldMetadata("pricing"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      "/api/content-types/pricing/fields",
    );
  });

  // -------------------------------------------------------------------------
  // PROD QA Step 2.5 — SECURITY: blockType URL encoding
  // -------------------------------------------------------------------------

  it("[PROD QA] URL-encodes blockType to prevent path traversal", async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchOk(mockMetadata));

    const { result } = renderHook(() => useFieldMetadata("../admin"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // The raw '../admin' must be percent-encoded, not passed verbatim
    const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
    expect(calledUrl).not.toContain("../");
    expect(calledUrl).toContain(encodeURIComponent("../admin"));
  });

  it("[PROD QA] URL-encodes blockType containing spaces and special chars", async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchOk(mockMetadata));

    const { result } = renderHook(() => useFieldMetadata("my type/v2"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const calledUrl = vi.mocked(global.fetch).mock.calls[0][0] as string;
    // Spaces and slash must be encoded
    expect(calledUrl).not.toContain(" ");
    expect(calledUrl).toContain(encodeURIComponent("my type/v2"));
  });

  it("[PROD QA] does not double-encode normal blockType identifiers", async () => {
    vi.mocked(global.fetch).mockImplementation(makeFetchOk(mockMetadata));

    const { result } = renderHook(() => useFieldMetadata("hero-block"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Normal identifiers with hyphens must NOT be encoded (no change expected)
    expect(vi.mocked(global.fetch)).toHaveBeenCalledWith(
      "/api/content-types/hero-block/fields",
    );
  });
});
