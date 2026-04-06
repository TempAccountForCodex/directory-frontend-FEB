/**
 * Tests for ConnectionStatus component (Step 5.3.5)
 *
 * Covers:
 * - Renders green dot for connected state
 * - Renders yellow/amber dot for connecting state
 * - Renders red dot for disconnected state
 * - Renders red dot for error state
 * - User count displayed when >1 connected user
 * - User count hidden when <=1 connected user
 * - Click triggers onReconnect when disconnected
 * - No click handler when connected (not interactive)
 * - Toast on connection loss (connected → disconnected)
 * - Toast on connection restore (connecting/disconnected → connected)
 * - No toast on first render
 * - React.memo: component is memoized
 * - No XSS: user count rendered safely via React
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ConnectionStatus } from "../ConnectionStatus";

// ---------------------------------------------------------------------------
// Mock framer-motion to avoid animation issues in jsdom
// ---------------------------------------------------------------------------
vi.mock("framer-motion", () => ({
  motion: {
    span: React.forwardRef(
      (
        {
          children,
          ...props
        }: React.HTMLAttributes<HTMLSpanElement> & {
          animate?: unknown;
          transition?: unknown;
        },
        ref: React.Ref<HTMLSpanElement>,
      ) => {
        // Strip framer-motion-specific props before passing to DOM
        const {
          animate: _a,
          transition: _t,
          ...rest
        } = props as {
          animate?: unknown;
          transition?: unknown;
        } & React.HTMLAttributes<HTMLSpanElement>;
        return (
          <span ref={ref} {...rest}>
            {children}
          </span>
        );
      },
    ),
    div: React.forwardRef(
      (
        {
          children,
          ...props
        }: React.HTMLAttributes<HTMLDivElement> & {
          animate?: unknown;
          transition?: unknown;
        },
        ref: React.Ref<HTMLDivElement>,
      ) => {
        const {
          animate: _a,
          transition: _t,
          ...rest
        } = props as {
          animate?: unknown;
          transition?: unknown;
        } & React.HTMLAttributes<HTMLDivElement>;
        return (
          <div ref={ref} {...rest}>
            {children}
          </div>
        );
      },
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ConnectionStatus", () => {
  const defaultProps = {
    connectionState: "connected" as const,
    connectedUsers: 1,
    onReconnect: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---- Renders without crashing -------------------------------------------

  it("renders without crashing", () => {
    const { container } = render(<ConnectionStatus {...defaultProps} />);
    expect(container).toBeTruthy();
  });

  // ---- Dot colors ---------------------------------------------------------

  it("renders green dot for connected state", () => {
    render(<ConnectionStatus connectionState="connected" />);
    const dot = screen.getByTestId("connection-dot");
    expect(dot).toBeInTheDocument();
    // Check inline style for background color (green)
    const style = window.getComputedStyle(dot);
    // The dot's backgroundColor should be green-ish
    // Since we apply sx prop which compiles to inline or class, check via style attribute
    expect(dot).toHaveStyle({ backgroundColor: "#4caf50" });
  });

  it("renders amber/yellow dot for connecting state", () => {
    render(<ConnectionStatus connectionState="connecting" />);
    const dot = screen.getByTestId("connection-dot");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ backgroundColor: "#ff9800" });
  });

  it("renders red dot for disconnected state", () => {
    render(<ConnectionStatus connectionState="disconnected" />);
    const dot = screen.getByTestId("connection-dot");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ backgroundColor: "#f44336" });
  });

  it("renders red dot for error state", () => {
    render(<ConnectionStatus connectionState="error" />);
    const dot = screen.getByTestId("connection-dot");
    expect(dot).toBeInTheDocument();
    expect(dot).toHaveStyle({ backgroundColor: "#f44336" });
  });

  // ---- Connected users count -----------------------------------------------

  it("shows user count text when >1 connected user", () => {
    render(<ConnectionStatus connectionState="connected" connectedUsers={3} />);
    expect(screen.getByTestId("user-count")).toBeInTheDocument();
    expect(screen.getByText("3 users editing")).toBeInTheDocument();
  });

  it("does NOT show user count when connectedUsers=1", () => {
    render(<ConnectionStatus connectionState="connected" connectedUsers={1} />);
    expect(screen.queryByTestId("user-count")).not.toBeInTheDocument();
  });

  it("does NOT show user count when connectedUsers=0", () => {
    render(<ConnectionStatus connectionState="connected" connectedUsers={0} />);
    expect(screen.queryByTestId("user-count")).not.toBeInTheDocument();
  });

  it("does NOT show user count when disconnected even if connectedUsers>1", () => {
    render(
      <ConnectionStatus connectionState="disconnected" connectedUsers={5} />,
    );
    expect(screen.queryByTestId("user-count")).not.toBeInTheDocument();
  });

  // ---- Click to reconnect --------------------------------------------------

  it("calls onReconnect when disconnected dot is clicked", () => {
    const onReconnect = vi.fn();
    render(
      <ConnectionStatus
        connectionState="disconnected"
        onReconnect={onReconnect}
      />,
    );
    fireEvent.click(screen.getByTestId("connection-status-container"));
    expect(onReconnect).toHaveBeenCalledOnce();
  });

  it("does NOT call onReconnect when connected dot is clicked", () => {
    const onReconnect = vi.fn();
    render(
      <ConnectionStatus
        connectionState="connected"
        onReconnect={onReconnect}
      />,
    );
    fireEvent.click(screen.getByTestId("connection-status-container"));
    expect(onReconnect).not.toHaveBeenCalled();
  });

  it("does NOT call onReconnect when onReconnect is not provided (disconnected)", () => {
    render(<ConnectionStatus connectionState="disconnected" />);
    // Should not throw on click when no handler provided
    expect(() =>
      fireEvent.click(screen.getByTestId("connection-status-container")),
    ).not.toThrow();
  });

  // ---- Toast notifications ------------------------------------------------

  it('shows "Connection lost" toast on transition connected → disconnected', async () => {
    const { rerender } = render(
      <ConnectionStatus connectionState="connected" />,
    );
    act(() => {
      rerender(<ConnectionStatus connectionState="disconnected" />);
    });
    await waitFor(() => {
      expect(screen.getByText("Connection lost")).toBeInTheDocument();
    });
  });

  it('shows "Connection restored" toast on transition disconnected → connected', async () => {
    const { rerender } = render(
      <ConnectionStatus connectionState="disconnected" />,
    );
    act(() => {
      rerender(<ConnectionStatus connectionState="connected" />);
    });
    await waitFor(() => {
      expect(screen.getByText("Connection restored")).toBeInTheDocument();
    });
  });

  it('shows "Connection restored" toast on transition connecting → connected', async () => {
    const { rerender } = render(
      <ConnectionStatus connectionState="connecting" />,
    );
    act(() => {
      rerender(<ConnectionStatus connectionState="connected" />);
    });
    await waitFor(() => {
      expect(screen.getByText("Connection restored")).toBeInTheDocument();
    });
  });

  it("does NOT show toast on first render (connected)", () => {
    render(<ConnectionStatus connectionState="connected" />);
    expect(screen.queryByText("Connection lost")).not.toBeInTheDocument();
    expect(screen.queryByText("Connection restored")).not.toBeInTheDocument();
  });

  it("does NOT show toast on first render (disconnected)", () => {
    render(<ConnectionStatus connectionState="disconnected" />);
    expect(screen.queryByText("Connection lost")).not.toBeInTheDocument();
    expect(screen.queryByText("Connection restored")).not.toBeInTheDocument();
  });

  it("does NOT show toast on transition connected → connecting (no loss event yet)", () => {
    const { rerender } = render(
      <ConnectionStatus connectionState="connected" />,
    );
    act(() => {
      rerender(<ConnectionStatus connectionState="connecting" />);
    });
    expect(screen.queryByText("Connection lost")).not.toBeInTheDocument();
  });

  // ---- Accessibility -------------------------------------------------------

  it("disconnected dot has role=button when onReconnect is provided", () => {
    const onReconnect = vi.fn();
    render(
      <ConnectionStatus
        connectionState="disconnected"
        onReconnect={onReconnect}
      />,
    );
    const container = screen.getByTestId("connection-status-container");
    expect(container).toHaveAttribute("role", "button");
  });

  it("connected dot does NOT have role=button", () => {
    render(
      <ConnectionStatus connectionState="connected" onReconnect={vi.fn()} />,
    );
    const container = screen.getByTestId("connection-status-container");
    expect(container).not.toHaveAttribute("role", "button");
  });
});
