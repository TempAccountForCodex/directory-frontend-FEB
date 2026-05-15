/**
 * Tests for EditorTabs component (Step 9.13.1)
 *
 * Covers:
 * 1. Renders all 4 tabs with correct labels
 * 2. Tab click fires onChange with correct value
 * 3. localStorage persistence on tab change
 * 4. localStorage restore on mount
 * 5. React.memo + correct props
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../Dashboard/shared/TabNavigation", () => ({
  default: ({ tabs, value, onChange }: any) => (
    <div data-testid="tab-navigation">
      {tabs.map((tab: any) => (
        <button
          key={tab.value}
          data-testid={`tab-${tab.value}`}
          aria-selected={value === tab.value}
          onClick={(e) => onChange(e, tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Subject under test
// ---------------------------------------------------------------------------

import EditorTabs from "../EditorTabs";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("EditorTabs", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      null,
    );
  });

  it("renders all 4 tabs with correct labels", () => {
    render(<EditorTabs activeTab="appearance" onChange={mockOnChange} />);

    expect(screen.getByTestId("tab-appearance")).toBeInTheDocument();
    expect(screen.getByTestId("tab-layout")).toBeInTheDocument();
    expect(screen.getByTestId("tab-simple")).toBeInTheDocument();
    expect(screen.getByTestId("tab-detailed")).toBeInTheDocument();

    expect(screen.getByText("Appearance")).toBeInTheDocument();
    expect(screen.getByText("Layout")).toBeInTheDocument();
    expect(screen.getByText("Simple")).toBeInTheDocument();
    expect(screen.getByText("Detailed")).toBeInTheDocument();
  });

  it("tab click fires onChange with correct tab value", () => {
    render(<EditorTabs activeTab="appearance" onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId("tab-layout"));
    expect(mockOnChange).toHaveBeenCalledWith("layout");
  });

  it("saves selected tab to localStorage on tab change", () => {
    render(<EditorTabs activeTab="appearance" onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId("tab-simple"));
    expect(global.localStorage.setItem).toHaveBeenCalledWith(
      "editor-active-tab",
      "simple",
    );
  });

  it("restores previously selected tab from localStorage on mount", () => {
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      "detailed",
    );

    render(<EditorTabs activeTab="appearance" onChange={mockOnChange} />);

    // Should call onChange with the stored tab since it differs from activeTab prop
    expect(mockOnChange).toHaveBeenCalledWith("detailed");
  });

  it("does not call onChange on mount when localStorage tab matches activeTab prop", () => {
    (global.localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(
      "appearance",
    );

    render(<EditorTabs activeTab="appearance" onChange={mockOnChange} />);

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it("shows correct active tab based on activeTab prop", () => {
    render(<EditorTabs activeTab="layout" onChange={mockOnChange} />);

    expect(screen.getByTestId("tab-layout")).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByTestId("tab-appearance")).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("renders the TabNavigation wrapper component", () => {
    render(<EditorTabs activeTab="appearance" onChange={mockOnChange} />);
    expect(screen.getByTestId("tab-navigation")).toBeInTheDocument();
  });
});
