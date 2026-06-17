import React from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useReplyReview, useSubmitReview } from "../useReviews";

const mockCreateReviewMutate = vi.fn();
const mockReplyReviewMutate = vi.fn();

vi.mock("../../api/queries/content", () => ({
  useListingReviews: vi.fn(() => ({
    data: { reviews: [], stats: null, pagination: null },
    error: null,
    isFetching: false,
    refetch: vi.fn(),
  })),
  useCreateReview: () => ({
    mutateAsync: mockCreateReviewMutate,
    isPending: false,
  }),
  useVoteReview: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
  useReplyReview: () => ({
    mutateAsync: mockReplyReviewMutate,
    isPending: false,
  }),
}));

function wrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe("useReviews moderation errors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("maps backend review validation fields onto fieldErrors", async () => {
    mockCreateReviewMutate.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: "Review content failed validation",
          code: "REVIEW_CONTENT_INVALID",
          fields: {
            content: ["Review contains inappropriate language."],
          },
        },
      },
    });

    const { result } = renderHook(() => useSubmitReview(70), { wrapper });

    await act(async () => {
      await result.current.submitReview({
        rating: 1,
        title: "Unsafe review test",
        content: "This business is a scam and I hate these people.",
      });
    });

    await waitFor(() => {
      expect(result.current.fieldErrors.content).toBe(
        "Review contains inappropriate language.",
      );
      expect(result.current.error).toBeNull();
    });
  });

  it("maps backend reply validation fields onto fieldErrors", async () => {
    mockReplyReviewMutate.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          error: "Reply content failed validation",
          code: "REPLY_CONTENT_INVALID",
          fields: {
            replyText: ["Reply contains inappropriate language."],
          },
        },
      },
    });

    const { result } = renderHook(() => useReplyReview(), { wrapper });

    await act(async () => {
      await result.current.replyReview(7, "You are stupid and we will ruin you.");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Reply content failed validation");
      expect(result.current.fieldErrors.replyText).toBe(
        "Reply contains inappropriate language.",
      );
    });
  });
});
