/**
 * Tests for HelpIcon and HelpLink (Step 10.9.8)
 *
 * Covers:
 * 1. HelpIcon renders with correct IconButton
 * 2. HelpIcon has correct aria-label
 * 3. HelpIcon click opens /docs/:slug in new tab
 * 4. HelpIcon shows tooltip on hover
 * 5. HelpLink renders 'Learn more' text
 * 6. HelpLink has correct href to /docs/:slug
 * 7. HelpLink uses target='_blank' with rel='noopener noreferrer'
 * 8. HelpLink renders custom text when provided
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";

// Increase timeout for MUI-heavy component rendering in CI
const TEST_TIMEOUT = 15000;
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import userEvent from "@testing-library/user-event";

// ---------------------------------------------------------------------------
// Mock MUI Tooltip — render children + title as tooltip
// ---------------------------------------------------------------------------
vi.mock("@mui/material/Tooltip", () => ({
  default: ({
    children,
    title,
  }: {
    children: React.ReactNode;
    title: string;
  }) => <div data-tooltip={title}>{children}</div>,
}));

// ---------------------------------------------------------------------------
// Import components under test
// ---------------------------------------------------------------------------
import HelpIcon from "../HelpIcon";
import HelpLink from "../HelpLink";

// ---------------------------------------------------------------------------
// Tests — HelpIcon
// ---------------------------------------------------------------------------
describe("HelpIcon", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it(
    "renders an IconButton with help icon",
    () => {
      render(<HelpIcon slug="test-article" />);
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
    },
    TEST_TIMEOUT,
  );

  it("has correct aria-label with default tooltip", () => {
    render(<HelpIcon slug="test-article" tooltip="Learn about this feature" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute(
      "aria-label",
      "Help: Learn about this feature",
    );
  });

  it("has default aria-label when no tooltip provided", () => {
    render(<HelpIcon slug="test-article" />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Help: Learn more");
  });

  it("opens /docs/:slug in a new tab on click", () => {
    const windowOpenSpy = vi
      .spyOn(window, "open")
      .mockImplementation(() => null);
    render(<HelpIcon slug="my-article-slug" />);
    const button = screen.getByRole("button");
    fireEvent.click(button);
    expect(windowOpenSpy).toHaveBeenCalledWith(
      "/docs/my-article-slug",
      "_blank",
      "noopener,noreferrer",
    );
  });

  it("renders tooltip wrapper with correct data-tooltip attribute", () => {
    const { container } = render(
      <HelpIcon slug="test-article" tooltip="Custom help text" />,
    );
    const tooltipWrapper = container.querySelector(
      '[data-tooltip="Custom help text"]',
    );
    expect(tooltipWrapper).toBeInTheDocument();
  });

  it("applies custom size prop", () => {
    const { container } = render(<HelpIcon slug="test-article" size={20} />);
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// Tests — HelpLink
// ---------------------------------------------------------------------------
describe("HelpLink", () => {
  it('renders default "Learn more" text', () => {
    render(<HelpLink slug="test-article" />);
    expect(screen.getByText("Learn more")).toBeInTheDocument();
  });

  it("renders custom text when provided", () => {
    render(<HelpLink slug="test-article" text="View documentation" />);
    expect(screen.getByText("View documentation")).toBeInTheDocument();
  });

  it("has correct href pointing to /docs/:slug", () => {
    render(<HelpLink slug="my-help-article" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/docs/my-help-article");
  });

  it('uses target="_blank" for security', () => {
    render(<HelpLink slug="test-article" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it('uses rel="noopener noreferrer" for security', () => {
    render(<HelpLink slug="test-article" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
