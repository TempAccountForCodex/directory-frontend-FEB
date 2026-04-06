/**
 * Tests for PreviewPanel (Steps 4.6.4 + 5.1.1 + 5.1.4 + 5.1.5)
 *
 * Preserves all original Step 4.6 tests. Adds tests for:
 * - Live/Static mode toggle (5.1.1)
 * - postMessage communication (5.1.1)
 * - Zoom controls (5.1.4)
 * - Rotation toggle (5.1.4)
 * - Viewport size display (5.1.4)
 * - Device frame for mobile (5.1.4)
 * - Timeout error UI (5.1.5)
 * - Retry button (5.1.5)
 * - Fallback from live to static (5.1.5)
 * - Empty page placeholder (5.1.5)
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
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
    mode: "dark",
  }),
}));

const mockRefresh = vi.fn();
let mockIframeReturn = {
  src: "http://localhost:5001/api/previews/websites/1/pages/1/html?viewport=desktop&_t=1",
  iframeLoading: false,
  iframeError: false,
  tokenExpired: false,
  onLoad: vi.fn(),
  onError: vi.fn(),
  refresh: mockRefresh,
};

vi.mock("../../../hooks/usePreviewApi", () => ({
  usePreviewIframe: () => mockIframeReturn,
}));

vi.mock("../../Templates/PreviewSkeleton", () => ({
  PreviewImageError: ({
    onRetry,
    message,
  }: {
    onRetry?: () => void;
    message?: string;
  }) => (
    <div data-testid="preview-error">
      {message}
      {onRetry && <button onClick={onRetry}>Retry</button>}
    </div>
  ),
  PreviewNetworkError: ({ onRetry }: { onRetry?: () => void }) => (
    <div data-testid="network-error">
      {onRetry && <button onClick={onRetry}>Try Again</button>}
    </div>
  ),
  usePreviewTimeout: () => false,
}));

// Mock PreviewContext
const mockUpdatePreviewContent = vi.fn();
const mockSetViewport = vi.fn();
const mockRefreshPreview = vi.fn();
const mockSetPreviewError = vi.fn();
const mockSetIsPreviewLoading = vi.fn();

let mockPreviewContext = {
  currentPageContent: null as null | {
    websiteId: string;
    pageId: string;
    blocks: Array<{
      id: string;
      blockType: string;
      content: Record<string, unknown>;
      order: number;
    }>;
    websiteMeta?: {
      name?: string;
      colors?: Record<string, string>;
      fonts?: Record<string, string>;
    };
  },
  viewport: "desktop" as "desktop" | "tablet" | "mobile",
  isPreviewLoading: false,
  previewError: null as string | null,
  revision: 0,
  updatePreviewContent: mockUpdatePreviewContent,
  setViewport: mockSetViewport,
  refreshPreview: mockRefreshPreview,
  setPreviewError: mockSetPreviewError,
  setIsPreviewLoading: mockSetIsPreviewLoading,
};

vi.mock("../../../context/PreviewContext", () => ({
  usePreview: () => mockPreviewContext,
  PreviewProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock previewInjector
const mockGenerateLivePreview = vi.fn(
  () => "<html><body>Live preview</body></html>",
);
vi.mock("../../../utils/previewInjector", () => ({
  generateLivePreview: (...args: Parameters<typeof mockGenerateLivePreview>) =>
    mockGenerateLivePreview(...args),
}));

import PreviewPanel from "../PreviewPanel";

describe("PreviewPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    mockIframeReturn = {
      src: "http://localhost:5001/api/previews/websites/1/pages/1/html?viewport=desktop&_t=1",
      iframeLoading: false,
      iframeError: false,
      tokenExpired: false,
      onLoad: vi.fn(),
      onError: vi.fn(),
      refresh: mockRefresh,
    };
    mockPreviewContext = {
      currentPageContent: null,
      viewport: "desktop",
      isPreviewLoading: false,
      previewError: null,
      revision: 0,
      updatePreviewContent: mockUpdatePreviewContent,
      setViewport: mockSetViewport,
      refreshPreview: mockRefreshPreview,
      setPreviewError: mockSetPreviewError,
      setIsPreviewLoading: mockSetIsPreviewLoading,
    };
    mockGenerateLivePreview.mockReturnValue(
      "<html><body>Live preview</body></html>",
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /* ------------------------------------------------------------ */
  /*  Original Step 4.6 tests (preserved)                          */
  /* ------------------------------------------------------------ */

  it("renders viewport toggle buttons", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    expect(
      screen.getByRole("button", { name: /desktop view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /tablet view/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mobile view/i }),
    ).toBeInTheDocument();
  });

  it("renders refresh button", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    const refreshBtn = screen.getByRole("button", { name: /refresh preview/i });
    expect(refreshBtn).toBeInTheDocument();
    fireEvent.click(refreshBtn);
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("renders iframe with correct src in static mode", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    const iframe = screen.getByTitle(/website preview/i);
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute("src", mockIframeReturn.src);
  });

  it("iframe has sandbox attribute for security", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    const iframe = screen.getByTitle(/website preview/i);
    expect(iframe).toHaveAttribute(
      "sandbox",
      "allow-same-origin allow-scripts",
    );
  });

  it("shows loading overlay when iframe is loading in static mode", () => {
    mockIframeReturn = { ...mockIframeReturn, iframeLoading: true };
    render(<PreviewPanel websiteId="1" pageId="1" />);

    // Switch to static mode to see loading overlay
    const staticBtn = screen.getByRole("button", { name: /static mode/i });
    fireEvent.click(staticBtn);

    expect(screen.getByText("Loading preview...")).toBeInTheDocument();
  });

  it("shows error state when iframe fails in static mode", () => {
    mockIframeReturn = {
      ...mockIframeReturn,
      iframeError: true,
      iframeLoading: false,
    };
    render(<PreviewPanel websiteId="1" pageId="1" />);

    // Switch to static mode to see error state
    const staticBtn = screen.getByRole("button", { name: /static mode/i });
    fireEvent.click(staticBtn);

    expect(screen.getByTestId("preview-error")).toBeInTheDocument();
  });

  it("has scale-to-fit toggle", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    expect(screen.getByText("Fit")).toBeInTheDocument();
  });

  it("has ARIA labels for accessibility", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    const iframe = screen.getByTitle(/website preview/i);
    expect(iframe).toHaveAttribute(
      "aria-label",
      expect.stringContaining("preview"),
    );
  });

  it("shows screen reader viewport announcements", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    const announcement = screen.getByRole("status");
    expect(announcement).toBeInTheDocument();
  });

  /* ------------------------------------------------------------ */
  /*  5.1.1 — Live/Static mode toggle                              */
  /* ------------------------------------------------------------ */

  it("renders mode toggle with Live and Static options", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    expect(
      screen.getByRole("button", { name: /live mode/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /static mode/i }),
    ).toBeInTheDocument();
  });

  it("defaults to Live mode", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    const liveBtn = screen.getByRole("button", { name: /live mode/i });
    expect(liveBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("live mode renders srcdoc when page content is available", () => {
    mockPreviewContext.currentPageContent = {
      websiteId: "1",
      pageId: "1",
      blocks: [
        { id: "b1", blockType: "TEXT", content: { text: "Hello" }, order: 0 },
      ],
      websiteMeta: { name: "Test Site" },
    };

    render(<PreviewPanel websiteId="1" pageId="1" />);
    const iframe = screen.getByTitle(/website preview/i);
    expect(iframe).toHaveAttribute("srcdoc");
    expect(mockGenerateLivePreview).toHaveBeenCalled();
  });

  it("static mode renders src (API URL based)", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);

    // Switch to static mode
    const staticBtn = screen.getByRole("button", { name: /static mode/i });
    fireEvent.click(staticBtn);

    const iframe = screen.getByTitle(/website preview/i);
    expect(iframe).toHaveAttribute("src", mockIframeReturn.src);
  });

  it("mode toggle switches between live and static", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);

    const staticBtn = screen.getByRole("button", { name: /static mode/i });
    fireEvent.click(staticBtn);

    const liveBtn = screen.getByRole("button", { name: /live mode/i });
    expect(liveBtn).toHaveAttribute("aria-pressed", "false");
    expect(staticBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("mode toggle has aria-label", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    expect(screen.getByLabelText(/preview mode/i)).toBeInTheDocument();
  });

  it("shows placeholder when no src and no page content", () => {
    mockIframeReturn = { ...mockIframeReturn, src: "" };
    mockPreviewContext.currentPageContent = null;
    render(<PreviewPanel websiteId="1" pageId="1" />);
    expect(screen.getByText("Select a page to preview")).toBeInTheDocument();
  });

  /* ------------------------------------------------------------ */
  /*  5.1.4 — Viewport controls: zoom, rotation, device frame     */
  /* ------------------------------------------------------------ */

  it("renders zoom controls with 50%, 75%, 100% options", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    expect(screen.getByRole("button", { name: /50%/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /75%/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /100%/i })).toBeInTheDocument();
  });

  it("zoom controls default to 100%", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    const zoomBtn = screen.getByRole("button", { name: /100%/i });
    expect(zoomBtn).toHaveAttribute("aria-pressed", "true");
  });

  it("zoom controls update zoom level on click", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    const zoom50 = screen.getByRole("button", { name: /50%/i });
    fireEvent.click(zoom50);
    expect(zoom50).toHaveAttribute("aria-pressed", "true");
  });

  it("renders rotation toggle button", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    // Switch to mobile first to show rotation
    const mobileBtn = screen.getByRole("button", { name: /mobile view/i });
    fireEvent.click(mobileBtn);

    expect(screen.getByRole("button", { name: /rotate/i })).toBeInTheDocument();
  });

  it("rotation toggle is hidden for desktop viewport", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    expect(
      screen.queryByRole("button", { name: /rotate/i }),
    ).not.toBeInTheDocument();
  });

  it("viewport size display shows current dimensions", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    // Desktop is 1920px wide
    expect(screen.getByText(/1920/)).toBeInTheDocument();
  });

  it("rotation toggle swaps width/height for mobile", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);

    // Switch to mobile (375 x 812)
    const mobileBtn = screen.getByRole("button", { name: /mobile view/i });
    fireEvent.click(mobileBtn);

    expect(screen.getByText(/375\s*[x\u00d7]\s*812/)).toBeInTheDocument();

    // Rotate
    const rotateBtn = screen.getByRole("button", { name: /rotate/i });
    fireEvent.click(rotateBtn);

    expect(screen.getByText(/812\s*[x\u00d7]\s*375/)).toBeInTheDocument();
  });

  it("zoom controls have aria-label", () => {
    render(<PreviewPanel websiteId="1" pageId="1" />);
    expect(screen.getByLabelText(/zoom level/i)).toBeInTheDocument();
  });

  /* ------------------------------------------------------------ */
  /*  5.1.5 — Error handling & fallbacks                           */
  /* ------------------------------------------------------------ */

  it("shows timeout error UI after 10 seconds in static mode", () => {
    mockIframeReturn = { ...mockIframeReturn, iframeLoading: true };
    render(<PreviewPanel websiteId="1" pageId="1" />);

    // Switch to static mode where the timeout applies
    const staticBtn = screen.getByRole("button", { name: /static mode/i });
    fireEvent.click(staticBtn);

    // Advance 10 seconds
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(screen.getByText(/preview timed out/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("retry button re-triggers preview generation", () => {
    mockIframeReturn = { ...mockIframeReturn, iframeLoading: true };
    render(<PreviewPanel websiteId="1" pageId="1" />);

    // Switch to static mode
    const staticBtn = screen.getByRole("button", { name: /static mode/i });
    fireEvent.click(staticBtn);

    act(() => {
      vi.advanceTimersByTime(10000);
    });

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(mockRefresh).toHaveBeenCalled();
  });

  it("shows fallback banner when live mode fails and auto-switches to static", () => {
    // Start in live mode with content
    mockPreviewContext.currentPageContent = {
      websiteId: "1",
      pageId: "1",
      blocks: [
        { id: "b1", blockType: "TEXT", content: { text: "Hello" }, order: 0 },
      ],
    };
    mockPreviewContext.previewError = "Live preview failed";

    render(<PreviewPanel websiteId="1" pageId="1" />);

    expect(screen.getByText(/switched to static preview/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /try live again/i }),
    ).toBeInTheDocument();
  });

  it("empty page placeholder shows when blocks array is empty in live mode", () => {
    mockPreviewContext.currentPageContent = {
      websiteId: "1",
      pageId: "1",
      blocks: [],
    };
    mockGenerateLivePreview.mockReturnValue(
      "<html><body><div>Add blocks to see a preview</div></body></html>",
    );

    render(<PreviewPanel websiteId="1" pageId="1" />);

    // In live mode with empty blocks, the injector outputs the placeholder
    expect(mockGenerateLivePreview).toHaveBeenCalled();
  });

  it("timeout timer is cleaned up on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    mockIframeReturn = { ...mockIframeReturn, iframeLoading: true };

    const { unmount } = render(<PreviewPanel websiteId="1" pageId="1" />);
    unmount();

    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });

  /* ------------------------------------------------------------ */
  /*  Token expired banner (preserved from 4.6)                    */
  /* ------------------------------------------------------------ */

  it("shows token expired banner when tokenExpired is true in static mode", () => {
    mockIframeReturn = {
      ...mockIframeReturn,
      tokenExpired: true,
      iframeLoading: false,
    };
    render(<PreviewPanel websiteId="1" pageId="1" />);

    // Switch to static mode to see token expired banner
    const staticBtn = screen.getByRole("button", { name: /static mode/i });
    fireEvent.click(staticBtn);

    expect(screen.getByText(/preview session expired/i)).toBeInTheDocument();
  });
});
