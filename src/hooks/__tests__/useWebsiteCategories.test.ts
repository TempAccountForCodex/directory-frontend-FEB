import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";

vi.mock("../../api/websiteAI", async () => {
  const actual = await vi.importActual<any>("../../api/websiteAI");
  return {
    ...actual,
    listWebsiteCategories: vi.fn(),
    addWebsiteCategory: vi.fn(),
  };
});

import {
  listWebsiteCategories,
  addWebsiteCategory,
  WebsiteAIRequestError,
} from "../../api/websiteAI";
import { useWebsiteCategories } from "../useWebsiteCategories";

const mockList = listWebsiteCategories as unknown as ReturnType<typeof vi.fn>;
const mockAdd = addWebsiteCategory as unknown as ReturnType<typeof vi.fn>;

beforeEach(() => {
  mockList.mockReset();
  mockAdd.mockReset();
});

describe("useWebsiteCategories", () => {
  it("loads categories on mount", async () => {
    mockList.mockResolvedValue([
      { value: "business", label: "Business", source: "template" },
    ]);
    const { result } = renderHook(() => useWebsiteCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toHaveLength(1);
  });

  it("adds a new category and dedupes", async () => {
    mockList.mockResolvedValue([]);
    mockAdd.mockResolvedValue({
      value: "custom-landscaping",
      label: "Custom Landscaping",
      source: "user",
    });
    const { result } = renderHook(() => useWebsiteCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.addCategory("Custom Landscaping");
    });
    expect(result.current.categories).toHaveLength(1);

    // adding the same value again must not duplicate
    await act(async () => {
      await result.current.addCategory("Custom Landscaping");
    });
    expect(result.current.categories).toHaveLength(1);
  });

  it("degrades gracefully when the endpoint is unavailable", async () => {
    mockList.mockRejectedValue(
      new WebsiteAIRequestError({ code: "NOT_IMPLEMENTED", message: "nope" }),
    );
    const { result } = renderHook(() => useWebsiteCategories());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.categories).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });
});
