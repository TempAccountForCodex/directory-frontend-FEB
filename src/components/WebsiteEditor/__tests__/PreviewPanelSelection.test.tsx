/**
 * Tests for PreviewPanel selection extensions (Step 9.14.3)
 *
 * Covers:
 * - onBlockSelected callback fires on BLOCK_SELECTED postMessage
 * - onBlockHover callback fires on BLOCK_HOVER postMessage
 * - selectedBlockId sync: SELECT_BLOCK sent to iframe when selectedBlockId changes to non-null
 * - selectedBlockId sync: DESELECT_ALL sent to iframe when selectedBlockId changes to null
 * - Backward compatible: new props are optional, existing behavior unchanged
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

/* ------------------------------------------------------------------ */
/*  Mocks (must come before import)                                    */
/* ------------------------------------------------------------------ */

vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({ actualTheme: "dark" }),
}));

vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    panelBg: "#121517",
    border: "rgba(55,140,146,0.15)",
    text: "#F5F5F5",
    textSecondary: "#9FA6AE",
    bgCard: "#121517",
    primary: "#378C92",
    mode: "dark",
  }),
}));

const mockRefresh = vi.fn();
vi.mock("../../../hooks/usePreviewApi", () => ({
  usePreviewIframe: () => ({
    src: "http://localhost:5001/api/previews/websites/1/pages/1/html?viewport=desktop&_t=1",
    iframeLoading: false,
    iframeError: false,
    tokenExpired: false,
    onLoad: vi.fn(),
    onError: vi.fn(),
    refresh: mockRefresh,
  }),
}));

vi.mock("../../Templates/PreviewSkeleton", () => ({
  PreviewImageError: () => <div data-testid="preview-error" />,
  PreviewNetworkError: () => <div data-testid="network-error" />,
  usePreviewTimeout: () => false,
}));

const mockPreviewContent = {
  websiteId: "1",
  pageId: "page-1",
  blocks: [
    { id: "hero-1", blockType: "HERO", content: { title: "Test" }, order: 0 },
  ],
  websiteMeta: { name: "Test Site" },
};

vi.mock("../../../context/PreviewContext", () => ({
  usePreview: () => ({
    currentPageContent: mockPreviewContent,
    viewport: "desktop",
    isPreviewLoading: false,
    previewError: null,
    revision: 1,
    updatePreviewContent: vi.fn(),
    setViewport: vi.fn(),
    refreshPreview: vi.fn(),
    setPreviewError: vi.fn(),
    setIsPreviewLoading: vi.fn(),
  }),
  PreviewProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("../../../utils/previewInjector", () => ({
  generateLivePreview: () => "<html><body>Live preview</body></html>",
}));

import PreviewPanel from "../PreviewPanel";

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function dispatchPostMessage(
  data: Record<string, unknown>,
  origin = window.location.origin,
) {
  const event = new MessageEvent("message", {
    data,
    origin,
  });
  window.dispatchEvent(event);
}

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("PreviewPanel selection extensions (Step 9.14.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("calls onBlockSelected when BLOCK_SELECTED postMessage received", () => {
    const onBlockSelected = vi.fn();
    render(
      <PreviewPanel
        websiteId="1"
        pageId="1"
        onBlockSelected={onBlockSelected}
      />,
    );

    act(() => {
      dispatchPostMessage({ type: "BLOCK_SELECTED", blockId: "hero-1" });
    });

    expect(onBlockSelected).toHaveBeenCalledWith("hero-1");
  });

  it("calls onBlockHover when BLOCK_HOVER postMessage received", () => {
    const onBlockHover = vi.fn();
    render(
      <PreviewPanel websiteId="1" pageId="1" onBlockHover={onBlockHover} />,
    );

    act(() => {
      dispatchPostMessage({ type: "BLOCK_HOVER", blockId: "hero-1" });
    });

    expect(onBlockHover).toHaveBeenCalledWith("hero-1");
  });

  it("calls onBlockHover with null when BLOCK_HOVER with null blockId received", () => {
    const onBlockHover = vi.fn();
    render(
      <PreviewPanel websiteId="1" pageId="1" onBlockHover={onBlockHover} />,
    );

    act(() => {
      dispatchPostMessage({ type: "BLOCK_HOVER", blockId: null });
    });

    expect(onBlockHover).toHaveBeenCalledWith(null);
  });

  it("sends SELECT_BLOCK to iframe when selectedBlockId changes to non-null", () => {
    const mockPostMessage = vi.fn();

    const { rerender } = render(
      <PreviewPanel websiteId="1" pageId="1" selectedBlockId={null} />,
    );

    // Mock iframe contentWindow.postMessage after render
    const iframe = document.querySelector("iframe");
    if (iframe) {
      Object.defineProperty(iframe, "contentWindow", {
        value: { postMessage: mockPostMessage },
        writable: true,
      });
    }

    rerender(
      <PreviewPanel websiteId="1" pageId="1" selectedBlockId="hero-1" />,
    );

    // Check that postMessage was called with SELECT_BLOCK
    const selectCall = mockPostMessage.mock.calls.find(
      (call: unknown[]) =>
        (call[0] as Record<string, unknown>).type === "SELECT_BLOCK",
    );
    expect(selectCall).toBeDefined();
    expect(selectCall![0]).toEqual({ type: "SELECT_BLOCK", blockId: "hero-1" });
  });

  it("sends DESELECT_ALL to iframe when selectedBlockId changes to null", () => {
    const mockPostMessage = vi.fn();

    const { rerender } = render(
      <PreviewPanel websiteId="1" pageId="1" selectedBlockId="hero-1" />,
    );

    // Mock iframe contentWindow.postMessage
    const iframe = document.querySelector("iframe");
    if (iframe) {
      Object.defineProperty(iframe, "contentWindow", {
        value: { postMessage: mockPostMessage },
        writable: true,
      });
    }

    rerender(<PreviewPanel websiteId="1" pageId="1" selectedBlockId={null} />);

    const deselectCall = mockPostMessage.mock.calls.find(
      (call: unknown[]) =>
        (call[0] as Record<string, unknown>).type === "DESELECT_ALL",
    );
    expect(deselectCall).toBeDefined();
  });

  it("is backward compatible — renders without new props", () => {
    // Should not throw when new props are not provided
    const { container } = render(<PreviewPanel websiteId="1" pageId="1" />);

    expect(container.querySelector("iframe")).toBeInTheDocument();
  });

  it("does not call onBlockSelected when postMessage has no handler registered", () => {
    // Render without onBlockSelected prop
    render(<PreviewPanel websiteId="1" pageId="1" />);

    // Should not throw
    act(() => {
      dispatchPostMessage({ type: "BLOCK_SELECTED", blockId: "hero-1" });
    });

    // No error = pass
  });
});
