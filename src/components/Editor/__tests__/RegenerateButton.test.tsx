/**
 * Tests for RegenerateButton component (Step 3.18.E)
 *
 * Covers:
 * - Renders DashboardIconButton with Sparkles icon
 * - Only visible on text blocks (HERO, FEATURES, TESTIMONIALS, CTA, TEXT, ABOUT)
 * - Hidden when hasAISessions is false
 * - Hidden on non-text blocks (CONTACT, IMAGE)
 * - Popover confirmation with Regenerate + Cancel
 * - On confirm: POST /api/ai/generate-block called
 * - Success: onContentUpdate called, success snackbar
 * - Failure: error snackbar, original content preserved
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
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
    bgHero: "#0D0F10",
  }),
}));

// ---------------------------------------------------------------------------
// Mock Dashboard shared components
// ---------------------------------------------------------------------------
vi.mock("../../Dashboard/shared", () => ({
  DashboardIconButton: ({
    label,
    onClick,
    "aria-label": ariaLabel,
  }: {
    icon: React.ReactNode;
    label?: string;
    tooltip?: string;
    variant?: string;
    onClick?: () => void;
    "aria-label"?: string;
    sx?: Record<string, unknown>;
  }) => (
    <button
      data-testid="icon-btn"
      onClick={onClick}
      aria-label={ariaLabel || label}
    >
      {label || "Regenerate"}
    </button>
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
// Import component under test
// ---------------------------------------------------------------------------
import RegenerateButton from "../RegenerateButton";

describe("RegenerateButton", () => {
  const defaultProps = {
    blockId: 10,
    blockType: "HERO",
    hasAISessions: true,
    questionnaireData: { businessType: "restaurant" },
    onContentUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders icon button for text blocks when hasAISessions is true", () => {
    render(<RegenerateButton {...defaultProps} />);
    expect(screen.getByTestId("icon-btn")).toBeInTheDocument();
  });

  it("returns null when hasAISessions is false", () => {
    const { container } = render(
      <RegenerateButton {...defaultProps} hasAISessions={false} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null for CONTACT block type", () => {
    const { container } = render(
      <RegenerateButton {...defaultProps} blockType="CONTACT" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("returns null for IMAGE block type", () => {
    const { container } = render(
      <RegenerateButton {...defaultProps} blockType="IMAGE" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders for FEATURES block type", () => {
    render(<RegenerateButton {...defaultProps} blockType="FEATURES" />);
    expect(screen.getByTestId("icon-btn")).toBeInTheDocument();
  });

  it("renders for CTA block type", () => {
    render(<RegenerateButton {...defaultProps} blockType="CTA" />);
    expect(screen.getByTestId("icon-btn")).toBeInTheDocument();
  });

  it("renders for TEXT block type", () => {
    render(<RegenerateButton {...defaultProps} blockType="TEXT" />);
    expect(screen.getByTestId("icon-btn")).toBeInTheDocument();
  });

  it("renders for ABOUT block type", () => {
    render(<RegenerateButton {...defaultProps} blockType="ABOUT" />);
    expect(screen.getByTestId("icon-btn")).toBeInTheDocument();
  });

  it("renders for TESTIMONIALS block type", () => {
    render(<RegenerateButton {...defaultProps} blockType="TESTIMONIALS" />);
    expect(screen.getByTestId("icon-btn")).toBeInTheDocument();
  });

  it("shows popover confirmation when clicked", async () => {
    render(<RegenerateButton {...defaultProps} />);

    fireEvent.click(screen.getByTestId("icon-btn"));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Regenerate this section\? Current content will be replaced\./,
        ),
      ).toBeInTheDocument();
    });

    // Confirm button is the gradient-btn inside popover
    expect(screen.getByTestId("gradient-btn")).toBeInTheDocument();
    expect(screen.getByTestId("cancel-btn")).toBeInTheDocument();
  });

  it("calls generate-block API on confirm and updates content", async () => {
    const mockOnContentUpdate = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          success: true,
          content: { heading: "Regenerated", _aiGenerated: true },
          tokensUsed: 100,
        }),
    });
    global.fetch = mockFetch;

    render(
      <RegenerateButton
        {...defaultProps}
        onContentUpdate={mockOnContentUpdate}
      />,
    );

    // Open popover
    fireEvent.click(screen.getByTestId("icon-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("gradient-btn")).toBeInTheDocument();
    });

    // Confirm regeneration via the gradient button
    fireEvent.click(screen.getByTestId("gradient-btn"));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/ai/generate-block"),
        expect.objectContaining({
          method: "POST",
          body: expect.stringContaining('"blockId":10'),
        }),
      );
    });

    await waitFor(() => {
      expect(mockOnContentUpdate).toHaveBeenCalledWith(10, {
        heading: "Regenerated",
        _aiGenerated: true,
      });
    });
  });

  it("shows error snackbar on API failure and preserves original content", async () => {
    const mockOnContentUpdate = vi.fn();
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () =>
        Promise.resolve({
          message: "Rate limit exceeded",
        }),
    });
    global.fetch = mockFetch;

    render(
      <RegenerateButton
        {...defaultProps}
        onContentUpdate={mockOnContentUpdate}
      />,
    );

    // Open popover and confirm
    fireEvent.click(screen.getByTestId("icon-btn"));
    await waitFor(() => {
      expect(screen.getByTestId("gradient-btn")).toBeInTheDocument();
    });
    fireEvent.click(screen.getByTestId("gradient-btn"));

    // Should show error snackbar
    await waitFor(() => {
      expect(screen.getByText("Rate limit exceeded")).toBeInTheDocument();
    });

    // Original content should NOT be updated
    expect(mockOnContentUpdate).not.toHaveBeenCalled();
  });

  it("closes popover when Cancel is clicked", async () => {
    render(<RegenerateButton {...defaultProps} />);

    // Open popover
    fireEvent.click(screen.getByTestId("icon-btn"));
    await waitFor(() => {
      expect(screen.getByText(/Regenerate this section\?/)).toBeInTheDocument();
    });

    // Click Cancel
    fireEvent.click(screen.getByText("Cancel"));

    // The popover should close (MUI Popover unmounts content)
    await waitFor(() => {
      expect(
        screen.queryByText(/Regenerate this section\?/),
      ).not.toBeInTheDocument();
    });
  });
});
