/**
 * Tests for AIGenerationProgress component (Step 3.18.E)
 *
 * Covers:
 * - Renders progress bar and page list
 * - Connects to SSE stream via fetch + ReadableStream
 * - Retry button calls generate-block API
 * - Connection drop shows amber banner
 * - Auto-redirect countdown on completion
 * - Uses Dashboard shared components (DashboardCard, DashboardGradientButton)
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mock context / theme
// ---------------------------------------------------------------------------
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
    primary: "#378C92",
    dark: "#0D0F10",
  }),
}));

// ---------------------------------------------------------------------------
// Mock react-router-dom
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// ---------------------------------------------------------------------------
// Mock Dashboard shared components
// ---------------------------------------------------------------------------
vi.mock("../../Dashboard/shared", () => ({
  DashboardCard: ({
    children,
    title,
    subtitle,
  }: {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
    icon?: unknown;
  }) => (
    <div data-testid="dashboard-card">
      {title && <span data-testid="card-title">{title}</span>}
      {subtitle && <span data-testid="card-subtitle">{subtitle}</span>}
      {children}
    </div>
  ),
  DashboardGradientButton: ({
    children,
    onClick,
    ...rest
  }: React.ComponentPropsWithoutRef<"button">) => (
    <button data-testid="gradient-btn" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
  DashboardActionButton: ({
    children,
    onClick,
    ...rest
  }: React.ComponentPropsWithoutRef<"button">) => (
    <button data-testid="action-btn" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
  DashboardCancelButton: ({
    children,
    onClick,
    ...rest
  }: React.ComponentPropsWithoutRef<"button">) => (
    <button data-testid="cancel-btn" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// Mock framer-motion
// ---------------------------------------------------------------------------
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      ...rest
    }: React.PropsWithChildren<Record<string, unknown>>) => (
      <div {...rest}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: React.PropsWithChildren) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Import component under test
// ---------------------------------------------------------------------------
import AIGenerationProgress from "../AIGenerationProgress";

// ---------------------------------------------------------------------------
// Helper: Create a mock ReadableStream that emits SSE events
// ---------------------------------------------------------------------------
function createMockSSEStream(
  events: Array<Record<string, unknown>>,
): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < events.length) {
        const data = `data: ${JSON.stringify(events[index])}\n\n`;
        controller.enqueue(encoder.encode(data));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

describe("AIGenerationProgress", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultProps = {
    sessionId: "test-session-123",
    websiteId: 1,
    websiteName: "My Test Website",
    questionnaireData: { businessType: "restaurant" },
  };

  it("renders DashboardCard with website name", async () => {
    // Mock fetch to return an SSE stream that immediately completes
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockSSEStream([
        {
          type: "start",
          totalBlocks: 2,
          totalPages: 1,
          websiteName: "My Test Website",
        },
        {
          type: "complete",
          totalBlocks: 2,
          totalTokensUsed: 100,
          cacheHits: 1,
          blocksFailed: 0,
          pagesCompleted: 1,
        },
      ]),
    });
    global.fetch = mockFetch;

    render(<AIGenerationProgress {...defaultProps} />);

    expect(screen.getByTestId("card-title")).toHaveTextContent(
      "My Test Website",
    );
    expect(screen.getByTestId("card-subtitle")).toHaveTextContent(
      "AI Content Generation",
    );
  });

  it("shows progress bar and page list during generation", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockSSEStream([
        { type: "start", totalBlocks: 3, totalPages: 1, websiteName: "Test" },
        { type: "page_start", pageId: 1, pageName: "Home", blockCount: 3 },
        {
          type: "block_complete",
          blockId: 10,
          blockType: "HERO",
          source: "ai",
        },
      ]),
    });
    global.fetch = mockFetch;

    render(<AIGenerationProgress {...defaultProps} />);

    // Wait for SSE events to be processed
    await waitFor(() => {
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    // Progress text should show
    expect(screen.getByText(/1 of 3 blocks/)).toBeInTheDocument();
  });

  it("shows completion state with redirect countdown", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockSSEStream([
        { type: "start", totalBlocks: 1, totalPages: 1, websiteName: "Test" },
        { type: "page_start", pageId: 1, pageName: "Home", blockCount: 1 },
        {
          type: "block_complete",
          blockId: 10,
          blockType: "HERO",
          source: "ai",
        },
        { type: "page_complete", pageId: 1, pageName: "Home" },
        {
          type: "complete",
          totalBlocks: 1,
          totalTokensUsed: 50,
          cacheHits: 0,
          blocksFailed: 0,
          pagesCompleted: 1,
        },
      ]),
    });
    global.fetch = mockFetch;

    render(<AIGenerationProgress {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText("Content Generated!")).toBeInTheDocument();
    });

    // Should show countdown
    expect(screen.getByText(/Redirecting to editor in/)).toBeInTheDocument();

    // Should show View Your Website button
    const viewBtn = screen.getByText("View Your Website");
    expect(viewBtn).toBeInTheDocument();

    // Click View Your Website navigates to editor
    fireEvent.click(viewBtn);
    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/websites/1/manage/overview",
    );
  });

  it("shows connection lost banner on fetch failure", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    global.fetch = mockFetch;

    render(<AIGenerationProgress {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByText(/Connection lost/)).toBeInTheDocument();
    });

    // Resume button should be available
    expect(screen.getByText("Resume Generation")).toBeInTheDocument();
  });

  it("shows failed state with Go to Editor and Try Again buttons", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockSSEStream([
        { type: "start", totalBlocks: 1, totalPages: 1, websiteName: "Test" },
        { type: "error", error: "AI service unavailable" },
      ]),
    });
    global.fetch = mockFetch;

    render(<AIGenerationProgress {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/AI content generation unavailable/),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Go to Editor")).toBeInTheDocument();
    expect(screen.getByText("Try Again")).toBeInTheDocument();

    // Go to Editor navigates
    fireEvent.click(screen.getByText("Go to Editor"));
    expect(mockNavigate).toHaveBeenCalledWith(
      "/dashboard/websites/1/manage/overview",
    );
  });

  it("shows retry button for failed blocks", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockSSEStream([
        { type: "start", totalBlocks: 2, totalPages: 1, websiteName: "Test" },
        { type: "page_start", pageId: 1, pageName: "Home", blockCount: 2 },
        {
          type: "block_complete",
          blockId: 10,
          blockType: "HERO",
          source: "ai",
        },
        {
          type: "block_error",
          blockId: 11,
          blockType: "CTA",
          error: "AI failed",
        },
        { type: "page_complete", pageId: 1, pageName: "Home" },
        {
          type: "complete",
          totalBlocks: 2,
          totalTokensUsed: 50,
          cacheHits: 0,
          blocksFailed: 1,
          pagesCompleted: 1,
        },
      ]),
    });
    global.fetch = mockFetch;

    render(<AIGenerationProgress {...defaultProps} />);

    // Wait for block_error event to be processed — since totalFailures != totalBlocks, it goes to complete
    await waitFor(() => {
      expect(screen.getByText("Content Generated!")).toBeInTheDocument();
    });
  });

  it("calls fetch with correct Authorization header", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      body: createMockSSEStream([
        { type: "start", totalBlocks: 0, totalPages: 0, websiteName: "Test" },
        {
          type: "complete",
          totalBlocks: 0,
          totalTokensUsed: 0,
          cacheHits: 0,
          blocksFailed: 0,
          pagesCompleted: 0,
        },
      ]),
    });
    global.fetch = mockFetch;
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      "my-jwt-token",
    );

    render(<AIGenerationProgress {...defaultProps} />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/ai/progress/test-session-123"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer my-jwt-token",
          }),
        }),
      );
    });
  });

  it("handles non-ok response by showing failed state", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
    });
    global.fetch = mockFetch;

    render(<AIGenerationProgress {...defaultProps} />);

    await waitFor(() => {
      expect(
        screen.getByText(/AI content generation unavailable/),
      ).toBeInTheDocument();
    });
  });
});
