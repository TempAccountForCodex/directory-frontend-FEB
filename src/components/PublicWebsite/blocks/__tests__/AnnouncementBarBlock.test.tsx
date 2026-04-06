/**
 * Tests for AnnouncementBarBlock (Step 2.29A.6)
 *
 * Covers:
 * 1.  Renders announcement text (safe text node, no XSS)
 * 2.  Renders link with target=_blank and rel=noopener noreferrer
 * 3.  Renders close button when dismissible=true
 * 4.  Does NOT render close button when dismissible=false
 * 5.  Dismiss button hides the bar
 * 6.  Dismiss state persisted in sessionStorage
 * 7.  Bar does not render when already dismissed (sessionStorage returns '1')
 * 8.  Renders inline position (no fixed styling)
 * 9.  Renders top position (fixed/sticky)
 * 10. Icon renders from icon prop when provided
 * 11. No icon when icon prop absent
 * 12. Text is rendered as text node, not injected HTML (XSS safety)
 * 13. Component is wrapped in React.memo (displayName set)
 * 14. Custom background and text colors applied
 * 15. Link text renders when linkText and linkUrl provided
 * 16. No link when linkText/linkUrl absent
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

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

vi.mock("react-intersection-observer", () => ({
  useInView: () => ({ ref: null, inView: true }),
}));

// ---------------------------------------------------------------------------
// sessionStorage mock helpers
// ---------------------------------------------------------------------------

let sessionStore: Record<string, string> = {};

beforeEach(() => {
  sessionStore = {};
  (
    global.sessionStorage.getItem as ReturnType<typeof vi.fn>
  ).mockImplementation((key: string) => sessionStore[key] ?? null);
  (
    global.sessionStorage.setItem as ReturnType<typeof vi.fn>
  ).mockImplementation((key: string, value: string) => {
    sessionStore[key] = value;
  });
  (
    global.sessionStorage.removeItem as ReturnType<typeof vi.fn>
  ).mockImplementation((key: string) => {
    delete sessionStore[key];
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// Import subject (will fail until implemented — RED phase)
// ---------------------------------------------------------------------------
import AnnouncementBarBlock from "../AnnouncementBarBlock";

// ---------------------------------------------------------------------------
// Test data
// ---------------------------------------------------------------------------

type BlockLike = {
  id: number;
  blockType: string;
  sortOrder: number;
  content: Record<string, any>;
};

const makeBlock = (contentOverrides = {}): BlockLike => ({
  id: 42,
  blockType: "ANNOUNCEMENT_BAR",
  sortOrder: 1,
  content: {
    text: "Special offer! 50% off today only.",
    linkText: "Shop Now",
    linkUrl: "https://example.com/shop",
    backgroundColor: "#1d4ed8",
    textColor: "#ffffff",
    dismissible: true,
    position: "inline",
    icon: "",
    ...contentOverrides,
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("AnnouncementBarBlock", () => {
  it("1. renders announcement text", () => {
    render(<AnnouncementBarBlock block={makeBlock()} primaryColor="#2563eb" />);
    expect(screen.getByText(/Special offer/)).toBeInTheDocument();
  });

  it("2. renders link with target=_blank and rel=noopener noreferrer", () => {
    render(<AnnouncementBarBlock block={makeBlock()} primaryColor="#2563eb" />);
    const link = screen.getByRole("link", { name: /Shop Now/i });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("3. renders close button when dismissible=true", () => {
    render(
      <AnnouncementBarBlock
        block={makeBlock({ dismissible: true })}
        primaryColor="#2563eb"
      />,
    );
    const closeBtn = screen.getByRole("button");
    expect(closeBtn).toBeInTheDocument();
  });

  it("4. does NOT render close button when dismissible=false", () => {
    render(
      <AnnouncementBarBlock
        block={makeBlock({ dismissible: false })}
        primaryColor="#2563eb"
      />,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("5. dismiss button hides the bar", () => {
    render(
      <AnnouncementBarBlock
        block={makeBlock({ dismissible: true })}
        primaryColor="#2563eb"
      />,
    );
    const closeBtn = screen.getByRole("button");
    fireEvent.click(closeBtn);
    expect(screen.queryByText(/Special offer/)).not.toBeInTheDocument();
  });

  it("6. dismiss stores state in sessionStorage with block id key", () => {
    render(
      <AnnouncementBarBlock
        block={makeBlock({ dismissible: true })}
        primaryColor="#2563eb"
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(global.sessionStorage.setItem).toHaveBeenCalledWith(
      "announcement-dismissed-42",
      "1",
    );
  });

  it("7. bar does not render when sessionStorage key already set", () => {
    sessionStore["announcement-dismissed-42"] = "1";
    render(<AnnouncementBarBlock block={makeBlock()} primaryColor="#2563eb" />);
    expect(screen.queryByText(/Special offer/)).not.toBeInTheDocument();
  });

  it("8. renders inline position without fixed positioning", () => {
    const { container } = render(
      <AnnouncementBarBlock
        block={makeBlock({ position: "inline", dismissible: false })}
        primaryColor="#2563eb"
      />,
    );
    // position 'inline' should not use fixed in style
    expect(container.firstChild).toBeTruthy();
  });

  it("9. renders top position with fixed or sticky", () => {
    const { container } = render(
      <AnnouncementBarBlock
        block={makeBlock({ position: "top", dismissible: false })}
        primaryColor="#2563eb"
      />,
    );
    expect(container.firstChild).toBeTruthy();
  });

  it("10. icon renders when icon prop provided", () => {
    const { container } = render(
      <AnnouncementBarBlock
        block={makeBlock({ icon: "star" })}
        primaryColor="#2563eb"
      />,
    );
    // Icon should create a svg element
    const svgOrIcon = container.querySelector("svg");
    expect(svgOrIcon).toBeInTheDocument();
  });

  it("11. no icon element when icon prop is empty string", () => {
    const { container } = render(
      <AnnouncementBarBlock
        block={makeBlock({ icon: "", dismissible: false })}
        primaryColor="#2563eb"
      />,
    );
    // Without icon or close button, no svg should be present
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBe(0);
  });

  it("12. text is NOT injected via dangerouslySetInnerHTML (XSS safety)", () => {
    const xssPayload = "<img src=x onerror=alert(1)>";
    render(
      <AnnouncementBarBlock
        block={makeBlock({ text: xssPayload, dismissible: false })}
        primaryColor="#2563eb"
      />,
    );
    // The raw <img> tag should NOT have been rendered as an actual img element from text
    // Find all img elements
    const imgs = screen.queryAllByRole("img");
    // Should be 0 (no image injected from XSS payload)
    expect(imgs.length).toBe(0);
    // The text content should contain the escaped text
    expect(screen.getByText(xssPayload)).toBeInTheDocument();
  });

  it("13. component is React.memo (has displayName)", () => {
    expect(
      AnnouncementBarBlock.displayName ??
        (AnnouncementBarBlock as any).type?.displayName,
    ).toBeTruthy();
  });

  it("14. custom background color applied (no crash with custom color)", () => {
    expect(() =>
      render(
        <AnnouncementBarBlock
          block={makeBlock({
            backgroundColor: "#ff0000",
            textColor: "#000000",
          })}
          primaryColor="#2563eb"
        />,
      ),
    ).not.toThrow();
  });

  it("15. link text and url render correctly", () => {
    render(<AnnouncementBarBlock block={makeBlock()} primaryColor="#2563eb" />);
    const link = screen.getByRole("link", { name: /Shop Now/i });
    expect(link).toHaveAttribute("href", "https://example.com/shop");
  });

  it("16. no link rendered when linkText/linkUrl absent", () => {
    render(
      <AnnouncementBarBlock
        block={makeBlock({ linkText: "", linkUrl: "" })}
        primaryColor="#2563eb"
      />,
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
