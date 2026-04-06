/**
 * Tests for PreviewContext (Step 5.1.2)
 *
 * Covers: provider renders children, updatePreviewContent debounces,
 * setViewport updates immediately, refreshPreview increments revision,
 * usePreview outside provider throws, initial state values,
 * previewError set/clear, isPreviewLoading transitions.
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PreviewProvider, usePreview } from "../PreviewContext";
import type { PageContent } from "../PreviewContext";

/* ------------------------------------------------------------------ */
/*  Helper: renders a consumer that displays context values            */
/* ------------------------------------------------------------------ */
function TestConsumer() {
  const {
    currentPageContent,
    viewport,
    isPreviewLoading,
    previewError,
    revision,
    updatePreviewContent,
    setViewport,
    refreshPreview,
    setPreviewError,
    setIsPreviewLoading,
  } = usePreview();

  return (
    <div>
      <span data-testid="viewport">{viewport}</span>
      <span data-testid="loading">{String(isPreviewLoading)}</span>
      <span data-testid="error">{previewError ?? "none"}</span>
      <span data-testid="revision">{revision}</span>
      <span data-testid="content">
        {currentPageContent ? "has-content" : "no-content"}
      </span>
      <button
        data-testid="update-content"
        onClick={() =>
          updatePreviewContent({
            websiteId: "1",
            pageId: "1",
            blocks: [
              {
                id: "b1",
                blockType: "TEXT",
                content: { text: "Hello" },
                order: 0,
              },
            ],
          })
        }
      />
      <button
        data-testid="set-viewport"
        onClick={() => setViewport("mobile")}
      />
      <button data-testid="refresh" onClick={() => refreshPreview()} />
      <button
        data-testid="set-error"
        onClick={() => setPreviewError("Something broke")}
      />
      <button data-testid="clear-error" onClick={() => setPreviewError(null)} />
      <button
        data-testid="set-loading"
        onClick={() => setIsPreviewLoading(true)}
      />
      <button
        data-testid="clear-loading"
        onClick={() => setIsPreviewLoading(false)}
      />
    </div>
  );
}

describe("PreviewContext (Step 5.1.2)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders children inside PreviewProvider", () => {
    render(
      <PreviewProvider>
        <span data-testid="child">OK</span>
      </PreviewProvider>,
    );
    expect(screen.getByTestId("child")).toHaveTextContent("OK");
  });

  it("has correct initial state values", () => {
    render(
      <PreviewProvider>
        <TestConsumer />
      </PreviewProvider>,
    );
    expect(screen.getByTestId("viewport")).toHaveTextContent("desktop");
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("error")).toHaveTextContent("none");
    expect(screen.getByTestId("revision")).toHaveTextContent("0");
    expect(screen.getByTestId("content")).toHaveTextContent("no-content");
  });

  it("updatePreviewContent debounces at 300ms", () => {
    render(
      <PreviewProvider>
        <TestConsumer />
      </PreviewProvider>,
    );

    // Click update multiple times rapidly
    act(() => {
      screen.getByTestId("update-content").click();
    });
    // Content should NOT update immediately
    expect(screen.getByTestId("content")).toHaveTextContent("no-content");

    // Advance time by 200ms — still debouncing
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByTestId("content")).toHaveTextContent("no-content");

    // Advance to 300ms — now it should update
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByTestId("content")).toHaveTextContent("has-content");
  });

  it("setViewport updates immediately (no debounce)", () => {
    render(
      <PreviewProvider>
        <TestConsumer />
      </PreviewProvider>,
    );

    expect(screen.getByTestId("viewport")).toHaveTextContent("desktop");
    act(() => {
      screen.getByTestId("set-viewport").click();
    });
    expect(screen.getByTestId("viewport")).toHaveTextContent("mobile");
  });

  it("refreshPreview increments revision counter", () => {
    render(
      <PreviewProvider>
        <TestConsumer />
      </PreviewProvider>,
    );

    expect(screen.getByTestId("revision")).toHaveTextContent("0");
    act(() => {
      screen.getByTestId("refresh").click();
    });
    expect(screen.getByTestId("revision")).toHaveTextContent("1");
    act(() => {
      screen.getByTestId("refresh").click();
    });
    expect(screen.getByTestId("revision")).toHaveTextContent("2");
  });

  it("usePreview outside PreviewProvider throws descriptive error", () => {
    // Suppress console.error for expected error
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<TestConsumer />)).toThrow(
      /usePreview must be used within a PreviewProvider/,
    );

    spy.mockRestore();
  });

  it("previewError can be set and cleared", () => {
    render(
      <PreviewProvider>
        <TestConsumer />
      </PreviewProvider>,
    );

    expect(screen.getByTestId("error")).toHaveTextContent("none");

    act(() => {
      screen.getByTestId("set-error").click();
    });
    expect(screen.getByTestId("error")).toHaveTextContent("Something broke");

    act(() => {
      screen.getByTestId("clear-error").click();
    });
    expect(screen.getByTestId("error")).toHaveTextContent("none");
  });

  it("isPreviewLoading transitions correctly", () => {
    render(
      <PreviewProvider>
        <TestConsumer />
      </PreviewProvider>,
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("false");

    act(() => {
      screen.getByTestId("set-loading").click();
    });
    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    act(() => {
      screen.getByTestId("clear-loading").click();
    });
    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("debounce timer is reset on rapid updates", () => {
    render(
      <PreviewProvider>
        <TestConsumer />
      </PreviewProvider>,
    );

    // First click
    act(() => {
      screen.getByTestId("update-content").click();
    });

    // Advance 250ms (not yet 300ms)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByTestId("content")).toHaveTextContent("no-content");

    // Second click resets the timer
    act(() => {
      screen.getByTestId("update-content").click();
    });

    // 250ms more after second click (total 500ms from first click, but only 250ms from reset)
    act(() => {
      vi.advanceTimersByTime(250);
    });
    expect(screen.getByTestId("content")).toHaveTextContent("no-content");

    // Another 50ms → 300ms from second click
    act(() => {
      vi.advanceTimersByTime(50);
    });
    expect(screen.getByTestId("content")).toHaveTextContent("has-content");
  });

  it("cleans up debounce timer on unmount (no memory leaks)", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");

    const { unmount } = render(
      <PreviewProvider>
        <TestConsumer />
      </PreviewProvider>,
    );

    // Trigger debounced update
    act(() => {
      screen.getByTestId("update-content").click();
    });

    // Unmount before debounce completes
    unmount();

    // clearTimeout should have been called during cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
