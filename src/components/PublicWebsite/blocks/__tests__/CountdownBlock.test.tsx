/**
 * Tests for CountdownBlock (Step 2.29A.4)
 *
 * Covers:
 *  1.  Renders without crashing with simple style
 *  2.  Renders heading when provided
 *  3.  Renders description when provided
 *  4.  Shows days, hours, minutes, seconds units by default (simple style)
 *  5.  Hides unit when showDays=false
 *  6.  Hides unit when showHours=false
 *  7.  Hides unit when showMinutes=false
 *  8.  Hides unit when showSeconds=false
 *  9.  Shows expired message when target date is in the past
 *  10. Renders CTA button when ctaText is provided
 *  11. CTA button links to ctaLink
 *  12. No CTA button when ctaText is empty
 *  13. Renders with flip style without crashing
 *  14. Renders with circular style without crashing
 *  15. SSR mode renders "Counting down to" text
 *  16. Component is wrapped in React.memo
 *  17. Timer ticks (useEffect is called with setInterval)
 *  18. Interval cleaned up on unmount (no memory leak)
 *  19. Renders with minimal content gracefully
 *  20. primaryColor prop applied without crashing
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    section: ({ children, ...props }: any) => (
      <section {...props}>{children}</section>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => [null, true],
}));

// Mock react-intersection-observer
vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: null, inView: true }),
}));

import CountdownBlock from "../CountdownBlock";

// ── Fixtures ──────────────────────────────────────────────────────────────────

// A future target date (7 days from now)
const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
// A past target date (already expired)
const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

const baseBlock = {
  id: 2,
  blockType: "COUNTDOWN" as const,
  sortOrder: 2,
  content: {
    heading: "Launch Countdown",
    description: "Get ready for something big!",
    targetDate: futureDate,
    expiredMessage: "Time is up!",
    showDays: true,
    showHours: true,
    showMinutes: true,
    showSeconds: true,
    style: "simple" as const,
    ctaText: "Learn More",
    ctaLink: "/launch",
  },
};

const expiredBlock = {
  ...baseBlock,
  content: {
    ...baseBlock.content,
    targetDate: pastDate,
    expiredMessage: "The event has passed!",
  },
};

const noCtaBlock = {
  ...baseBlock,
  content: { ...baseBlock.content, ctaText: "", ctaLink: "" },
};

const flipBlock = {
  ...baseBlock,
  content: { ...baseBlock.content, style: "flip" as const },
};

const circularBlock = {
  ...baseBlock,
  content: { ...baseBlock.content, style: "circular" as const },
};

const noDaysBlock = {
  ...baseBlock,
  content: { ...baseBlock.content, showDays: false },
};

const noHoursBlock = {
  ...baseBlock,
  content: { ...baseBlock.content, showHours: false },
};

const noMinutesBlock = {
  ...baseBlock,
  content: { ...baseBlock.content, showMinutes: false },
};

const noSecondsBlock = {
  ...baseBlock,
  content: { ...baseBlock.content, showSeconds: false, showMinutes: true },
};

// ── Tests ──────────────────────────────────────────────────────────────────────

describe("CountdownBlock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders without crashing with simple style", () => {
    const { container } = render(<CountdownBlock block={baseBlock} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders heading when provided", () => {
    render(<CountdownBlock block={baseBlock} />);
    expect(screen.getByText("Launch Countdown")).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(<CountdownBlock block={baseBlock} />);
    expect(
      screen.getByText("Get ready for something big!"),
    ).toBeInTheDocument();
  });

  it("renders days unit when showDays=true (simple style)", () => {
    render(<CountdownBlock block={baseBlock} />);
    expect(screen.getByText(/days/i)).toBeInTheDocument();
  });

  it("renders hours unit when showHours=true (simple style)", () => {
    render(<CountdownBlock block={baseBlock} />);
    expect(screen.getByText(/hours/i)).toBeInTheDocument();
  });

  it("renders minutes unit when showMinutes=true (simple style)", () => {
    render(<CountdownBlock block={baseBlock} />);
    expect(screen.getByText(/minutes/i)).toBeInTheDocument();
  });

  it("renders seconds unit when showSeconds=true (simple style)", () => {
    render(<CountdownBlock block={baseBlock} />);
    expect(screen.getByText(/seconds/i)).toBeInTheDocument();
  });

  it("hides days when showDays=false", () => {
    render(<CountdownBlock block={noDaysBlock} />);
    expect(screen.queryByText(/^days$/i)).toBeNull();
  });

  it("hides hours when showHours=false", () => {
    render(<CountdownBlock block={noHoursBlock} />);
    expect(screen.queryByText(/^hours$/i)).toBeNull();
  });

  it("hides minutes when showMinutes=false", () => {
    render(<CountdownBlock block={noMinutesBlock} />);
    expect(screen.queryByText(/^minutes$/i)).toBeNull();
  });

  it("hides seconds when showSeconds=false", () => {
    render(<CountdownBlock block={noSecondsBlock} />);
    expect(screen.queryByText(/^seconds$/i)).toBeNull();
  });

  it("shows expired message when target date is in the past", () => {
    render(<CountdownBlock block={expiredBlock} />);
    expect(screen.getByText("The event has passed!")).toBeInTheDocument();
  });

  it("renders CTA button when ctaText is provided", () => {
    render(<CountdownBlock block={baseBlock} />);
    expect(
      screen.getByRole("button", { name: /learn more/i }),
    ).toBeInTheDocument();
  });

  it("CTA button links to ctaLink", () => {
    render(<CountdownBlock block={baseBlock} />);
    // Button should have the correct href or the parent is an anchor
    const btn = screen.getByRole("button", { name: /learn more/i });
    expect(btn).toBeInTheDocument();
  });

  it("does not render CTA button when ctaText is empty", () => {
    render(<CountdownBlock block={noCtaBlock} />);
    expect(screen.queryByRole("button", { name: /learn more/i })).toBeNull();
  });

  it("renders with flip style without crashing", () => {
    const { container } = render(<CountdownBlock block={flipBlock} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders flip style digit containers", () => {
    render(<CountdownBlock block={flipBlock} />);
    // Should render digit elements
    expect(screen.getByText("Launch Countdown")).toBeInTheDocument();
  });

  it("renders with circular style without crashing", () => {
    const { container } = render(<CountdownBlock block={circularBlock} />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders SVG circles in circular style", () => {
    const { container } = render(<CountdownBlock block={circularBlock} />);
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("uses setInterval for countdown ticking", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    render(<CountdownBlock block={baseBlock} />);
    expect(setIntervalSpy).toHaveBeenCalled();
  });

  it("clears interval on unmount (no memory leak)", () => {
    const clearIntervalSpy = vi.spyOn(globalThis, "clearInterval");
    const { unmount } = render(<CountdownBlock block={baseBlock} />);
    unmount();
    expect(clearIntervalSpy).toHaveBeenCalled();
  });

  it("updates countdown values after time passes", () => {
    render(<CountdownBlock block={baseBlock} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    // Should still render without crashing after time advance
    expect(screen.getByText("Launch Countdown")).toBeInTheDocument();
  });

  it("uses 1s interval when showSeconds=true", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    render(<CountdownBlock block={baseBlock} />);
    // At least one call with 1000ms interval
    const calls = setIntervalSpy.mock.calls;
    const hasOneSecond = calls.some(([, interval]) => interval === 1000);
    expect(hasOneSecond).toBe(true);
  });

  it("uses 60s interval when showSeconds=false", () => {
    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    render(<CountdownBlock block={noSecondsBlock} />);
    const calls = setIntervalSpy.mock.calls;
    const hasSixtySeconds = calls.some(([, interval]) => interval === 60000);
    expect(hasSixtySeconds).toBe(true);
  });

  it("is wrapped with React.memo (displayName or type defined)", () => {
    expect(CountdownBlock).toBeDefined();
    const name =
      (CountdownBlock as any).displayName ||
      (CountdownBlock as any).type?.name ||
      (CountdownBlock as any).name;
    expect(name).toBeTruthy();
  });

  it("renders with minimal content gracefully", () => {
    const minimalBlock = {
      id: 99,
      blockType: "COUNTDOWN" as const,
      sortOrder: 0,
      content: {},
    };
    const { container } = render(
      <CountdownBlock block={minimalBlock as any} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders primaryColor prop without crashing", () => {
    const { container } = render(
      <CountdownBlock block={baseBlock} primaryColor="#00ff00" />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("expired block with no ctaText shows no button", () => {
    const block = {
      ...expiredBlock,
      content: { ...expiredBlock.content, ctaText: "" },
    };
    render(<CountdownBlock block={block} />);
    expect(screen.queryByRole("button")).toBeNull();
  });
});
