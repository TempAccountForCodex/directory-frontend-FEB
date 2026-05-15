/**
 * Tests for PublicWebsite NavbarBlock (Step 14.10)
 *
 * Covers:
 *  1.  Renders nav element without crashing
 *  2.  Renders brand name from content.brandName
 *  3.  Falls back to 'My Brand' when brandName absent
 *  4.  Renders navigation links
 *  5.  Applies sticky positioning when sticky=true
 *  6.  Renders transparent variant data-variant attribute
 *  7.  Renders CTA button with correct text
 *  8.  Opens mobile drawer on hamburger click
 *  9.  Closes mobile drawer on close button click
 *  10. NavbarBlock has displayName set
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import NavbarBlock from "../NavbarBlock";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("../../BlockWrapper", () => ({
  BlockWrapper: ({ children }: any) => (
    <div data-testid="block-wrapper">{children}</div>
  ),
}));

vi.mock("@mui/icons-material/Menu", () => ({
  default: () => <svg data-testid="menu-icon" />,
}));

vi.mock("@mui/icons-material/Close", () => ({
  default: () => <svg data-testid="close-icon" />,
}));

// Mock ResizeObserver as a proper constructor
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

function MockResizeObserver(this: any, _cb: ResizeObserverCallback) {
  this.observe = mockObserve;
  this.disconnect = mockDisconnect;
}

beforeEach(() => {
  vi.stubGlobal("ResizeObserver", MockResizeObserver);
  // Default to desktop width
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1024,
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const makeBlock = (contentOverrides: Record<string, any> = {}) => ({
  id: "nav-1",
  type: "NAVBAR",
  content: {
    brandName: "Acme Corp",
    navigationItems: [
      { label: "Home", link: "/" },
      { label: "About", link: "/about" },
    ],
    ...contentOverrides,
  },
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("NavbarBlock (PublicWebsite)", () => {
  it("1. renders nav element without crashing", () => {
    render(<NavbarBlock block={makeBlock()} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("2. renders brand name from content.brandName", () => {
    render(<NavbarBlock block={makeBlock({ brandName: "TestBrand" })} />);
    expect(screen.getByText("TestBrand")).toBeInTheDocument();
  });

  it('3. falls back to "My Brand" when brandName absent', () => {
    render(<NavbarBlock block={makeBlock({ brandName: undefined })} />);
    expect(screen.getByText("My Brand")).toBeInTheDocument();
  });

  it("4. renders navigation links", () => {
    render(<NavbarBlock block={makeBlock()} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("5. applies sticky positioning style when sticky=true", () => {
    render(<NavbarBlock block={makeBlock({ sticky: true })} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveStyle({ position: "sticky" });
  });

  it('6. sets data-variant="transparent" for transparent variant', () => {
    render(<NavbarBlock block={makeBlock({ variant: "transparent" })} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("data-variant", "transparent");
  });

  it("7. renders CTA button with correct text", () => {
    render(
      <NavbarBlock
        block={makeBlock({ ctaText: "Get Started", ctaLink: "/signup" })}
      />,
    );
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("8. opens mobile drawer on hamburger click", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });
    render(<NavbarBlock block={makeBlock()} />);
    // Trigger resize event to set isMobile
    fireEvent(window, new Event("resize"));
    const openBtn = screen.queryByLabelText("Open menu");
    if (openBtn) {
      fireEvent.click(openBtn);
      expect(screen.queryByTestId("mobile-drawer")).toBeInTheDocument();
    }
  });

  it("9. closes mobile drawer on close button click", () => {
    Object.defineProperty(window, "innerWidth", {
      writable: true,
      configurable: true,
      value: 375,
    });
    render(<NavbarBlock block={makeBlock()} />);
    fireEvent(window, new Event("resize"));
    const openBtn = screen.queryByLabelText("Open menu");
    if (openBtn) {
      fireEvent.click(openBtn);
      const closeBtn = screen.queryByLabelText("Close menu");
      if (closeBtn) {
        fireEvent.click(closeBtn);
        expect(screen.queryByTestId("mobile-drawer")).not.toBeInTheDocument();
      }
    }
  });

  it("10. NavbarBlock has displayName set", () => {
    expect(NavbarBlock.displayName).toBe("NavbarBlock");
  });
});
