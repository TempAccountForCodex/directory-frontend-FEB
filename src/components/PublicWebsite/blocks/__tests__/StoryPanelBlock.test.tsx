/**
 * Tests for StoryPanelBlock (Step 15.8)
 *
 * Covers:
 *  Group 1: Rendering basics (1-3)
 *  Group 2: Side-by-side variant (4-6)
 *  Group 3: Top-bottom variant (7-8)
 *  Group 4: Auto-rotate (9-10)
 *  Group 5: Hover pause (11)
 *  Group 6: Links & edge cases (12-15)
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("framer-motion", () => ({
  useScroll: () => ({
    scrollYProgress: { get: () => 0, onChange: () => () => {} },
  }),
  useTransform: (..._args) => ({ get: () => "0%", onChange: () => () => {} }),
  useMotionValue: (v) => ({
    get: () => v,
    set: () => {},
    onChange: () => () => {},
  }),
  motion: {
    div: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <div ref={ref} {...props}>
        {children}
      </div>
    )),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("../../BlockWrapper", () => ({
  BlockWrapper: ({ children }: any) => (
    <div data-testid="block-wrapper">{children}</div>
  ),
  default: ({ children }: any) => (
    <div data-testid="block-wrapper">{children}</div>
  ),
}));

import StoryPanelBlock from "../StoryPanelBlock";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const makeStories = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    image: `https://example.com/img${i + 1}.jpg`,
    title: `Story ${i + 1}`,
    subtitle: `Subtitle ${i + 1}`,
    body: `Body text for story ${i + 1}`,
    linkText: i === 0 ? "Read More" : undefined,
    linkUrl: i === 0 ? "/story-1" : undefined,
  }));

const baseContent = {
  heading: "Our Journey",
  stories: makeStories(3),
  autoRotate: false,
  variant: "side-by-side" as const,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("StoryPanelBlock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  // ── Group 1: Rendering basics ─────────────────────────────────────────────

  // 1
  it("renders empty state when no stories provided", () => {
    render(<StoryPanelBlock content={{ stories: [] }} />);
    expect(screen.getByTestId("story-panel-empty")).toBeInTheDocument();
    expect(screen.getByText("No stories to display.")).toBeInTheDocument();
  });

  // 2
  it("renders heading when provided", () => {
    render(<StoryPanelBlock content={baseContent} />);
    expect(screen.getByText("Our Journey")).toBeInTheDocument();
  });

  // 3
  it("renders without heading when none provided", () => {
    render(
      <StoryPanelBlock content={{ ...baseContent, heading: undefined }} />,
    );
    expect(screen.queryByText("Our Journey")).toBeNull();
    expect(screen.getByTestId("block-wrapper")).toBeInTheDocument();
  });

  // ── Group 2: Side-by-side variant ─────────────────────────────────────────

  // 4
  it("renders side-by-side layout by default", () => {
    render(<StoryPanelBlock content={baseContent} />);
    expect(screen.getByTestId("story-panel-side-by-side")).toBeInTheDocument();
  });

  // 5
  it("renders all thumbnail tabs in side-by-side", () => {
    render(<StoryPanelBlock content={baseContent} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  // 6
  it("clicking a thumbnail changes active story", () => {
    render(<StoryPanelBlock content={baseContent} />);
    const tabs = screen.getAllByRole("tab");

    // Initially story 1 is active
    expect(screen.getByText("Body text for story 1")).toBeInTheDocument();

    // Click story 2
    fireEvent.click(tabs[1]);
    expect(screen.getByText("Body text for story 2")).toBeInTheDocument();
    expect(tabs[1]).toHaveAttribute("aria-selected", "true");
  });

  // ── Group 3: Top-bottom variant ───────────────────────────────────────────

  // 7
  it("renders top-bottom layout when variant is set", () => {
    render(
      <StoryPanelBlock content={{ ...baseContent, variant: "top-bottom" }} />,
    );
    expect(screen.getByTestId("story-panel-top-bottom")).toBeInTheDocument();
    expect(screen.queryByTestId("story-panel-side-by-side")).toBeNull();
  });

  // 8
  it("renders story tabs in top-bottom variant", () => {
    render(
      <StoryPanelBlock content={{ ...baseContent, variant: "top-bottom" }} />,
    );
    expect(screen.getByTestId("story-tabs")).toBeInTheDocument();
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
  });

  // ── Group 4: Auto-rotate ──────────────────────────────────────────────────

  // 9
  it("auto-rotates to next story after interval", () => {
    render(
      <StoryPanelBlock
        content={{ ...baseContent, autoRotate: true, autoRotateInterval: 3000 }}
      />,
    );

    expect(screen.getByText("Body text for story 1")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(screen.getByText("Body text for story 2")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(screen.getByText("Body text for story 3")).toBeInTheDocument();
  });

  // 10
  it("wraps around to first story after last", () => {
    render(
      <StoryPanelBlock
        content={{ ...baseContent, autoRotate: true, autoRotateInterval: 3000 }}
      />,
    );

    // Advance through all 3 stories
    act(() => {
      vi.advanceTimersByTime(3100 * 3);
    });
    // Should be back to story 1
    expect(screen.getByText("Body text for story 1")).toBeInTheDocument();
  });

  // ── Group 5: Hover pause ──────────────────────────────────────────────────

  // 11
  it("pauses auto-rotate on hover and resumes on leave", () => {
    render(
      <StoryPanelBlock
        content={{ ...baseContent, autoRotate: true, autoRotateInterval: 3000 }}
      />,
    );

    const panel = screen.getByTestId("story-panel-side-by-side");

    // Hover to pause
    fireEvent.mouseEnter(panel);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    // Should still be on story 1 because hover paused
    expect(screen.getByText("Body text for story 1")).toBeInTheDocument();

    // Leave to resume
    fireEvent.mouseLeave(panel);
    act(() => {
      vi.advanceTimersByTime(3100);
    });
    expect(screen.getByText("Body text for story 2")).toBeInTheDocument();
  });

  // ── Group 6: Links & edge cases ───────────────────────────────────────────

  // 12
  it("renders link button when linkText and linkUrl present", () => {
    render(<StoryPanelBlock content={baseContent} />);
    const link = screen.getByText("Read More");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/story-1");
  });

  // 13
  it("does not render link when linkText is missing", () => {
    render(<StoryPanelBlock content={baseContent} />);
    // Click to story 2 which has no link
    fireEvent.click(screen.getAllByRole("tab")[1]);
    expect(screen.queryByText("Read More")).toBeNull();
  });

  // 14
  it("handles keyboard navigation on tabs", () => {
    render(<StoryPanelBlock content={baseContent} />);
    const tabs = screen.getAllByRole("tab");
    fireEvent.keyDown(tabs[1], { key: "Enter" });
    expect(screen.getByText("Body text for story 2")).toBeInTheDocument();
  });

  // 15
  it("clamps to max 6 stories", () => {
    const manyStories = makeStories(10);
    render(
      <StoryPanelBlock content={{ ...baseContent, stories: manyStories }} />,
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(6);
  });
});
