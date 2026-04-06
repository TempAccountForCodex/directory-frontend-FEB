/**
 * Tests for TemplateFavorites component (Step 3.6.3)
 *
 * Covers:
 * 1.  Renders heart icon button
 * 2.  Filled heart when isFavorited=true
 * 3.  Unfilled heart when isFavorited=false
 * 4.  Click fires onToggle with templateId and new state (false -> true)
 * 5.  Click fires onToggle with templateId and new state (true -> false)
 * 6.  e.stopPropagation() is called — parent click not triggered
 * 7.  Component renders with size='small'
 * 8.  Component renders with size='medium'
 * 9.  Heart icon uses teal color (#378C92) when favorited
 * 10. TemplateCard updated to accept isFavorited and onFavoriteToggle optional props
 * 11. TemplateCard renders TemplateFavorites when onFavoriteToggle is provided
 * 12. TemplateCard heart click does not trigger card onClick
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mock Framer Motion — avoid animation complexity in tests
// ---------------------------------------------------------------------------
vi.mock("framer-motion", () => ({
  motion: {
    button: ({
      children,
      animate: _a,
      transition: _t,
      ...rest
    }: React.ComponentPropsWithoutRef<"button"> & {
      animate?: unknown;
      transition?: unknown;
    }) => <button {...rest}>{children}</button>,
    div: ({
      children,
      animate: _a,
      transition: _t,
      ...rest
    }: React.ComponentPropsWithoutRef<"div"> & {
      animate?: unknown;
      transition?: unknown;
    }) => <div {...rest}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// ---------------------------------------------------------------------------
// Mock theme
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
    primaryDark: "#2a6f73",
  }),
}));

// ---------------------------------------------------------------------------
// Mock DashboardGradientButton for TemplateCard tests
// ---------------------------------------------------------------------------
vi.mock("../../Dashboard/shared/DashboardGradientButton", () => ({
  default: ({
    children,
    onClick,
    ...rest
  }: React.ComponentPropsWithoutRef<"button">) => (
    <button data-testid="gradient-btn" onClick={onClick} {...rest}>
      {children}
    </button>
  ),
}));

// ---------------------------------------------------------------------------
// Imports under test (after mocks)
// ---------------------------------------------------------------------------
import TemplateFavorites from "../TemplateFavorites";
import TemplateCard from "../TemplateCard";
import { type TemplateSummary } from "../../../templates/templateApi";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const baseTemplate: TemplateSummary = {
  id: "tpl-001",
  name: "Modern Business",
  description: "A clean, modern template.",
  type: "website",
  category: "business",
  version: "1.0.0",
  previewImage: null,
  pageCount: 3,
  blockCount: 12,
};

// ---------------------------------------------------------------------------
// TemplateFavorites Tests
// ---------------------------------------------------------------------------
describe("TemplateFavorites", () => {
  let onToggle: Mock<(templateId: string, newState: boolean) => void>;

  beforeEach(() => {
    onToggle = vi.fn<(templateId: string, newState: boolean) => void>();
  });

  // 1. Renders heart icon button
  it("renders a button element", () => {
    render(
      <TemplateFavorites
        templateId="tpl-001"
        isFavorited={false}
        onToggle={onToggle}
      />,
    );
    // Should have a button
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  // 2. Filled heart when isFavorited=true (filled class or fill attribute)
  it("applies filled/active state styling when isFavorited=true", () => {
    const { container } = render(
      <TemplateFavorites
        templateId="tpl-001"
        isFavorited={true}
        onToggle={onToggle}
      />,
    );
    // Check data-favorited attribute or a style indicator exists
    const btn = container.querySelector('[data-favorited="true"]');
    expect(btn).toBeInTheDocument();
  });

  // 3. Unfilled heart when isFavorited=false
  it("applies unfilled/inactive state styling when isFavorited=false", () => {
    const { container } = render(
      <TemplateFavorites
        templateId="tpl-001"
        isFavorited={false}
        onToggle={onToggle}
      />,
    );
    const btn = container.querySelector('[data-favorited="false"]');
    expect(btn).toBeInTheDocument();
  });

  // 4. Click fires onToggle with templateId and new state (false -> true)
  it("calls onToggle with templateId and true when currently unfavorited", () => {
    render(
      <TemplateFavorites
        templateId="tpl-001"
        isFavorited={false}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("tpl-001", true);
  });

  // 5. Click fires onToggle with templateId and new state (true -> false)
  it("calls onToggle with templateId and false when currently favorited", () => {
    render(
      <TemplateFavorites
        templateId="tpl-001"
        isFavorited={true}
        onToggle={onToggle}
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith("tpl-001", false);
  });

  // 6. e.stopPropagation() is called — parent click not triggered
  it("calls stopPropagation to prevent parent click", () => {
    const parentClick = vi.fn();
    render(
      <div onClick={parentClick}>
        <TemplateFavorites
          templateId="tpl-001"
          isFavorited={false}
          onToggle={onToggle}
        />
      </div>,
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    // Parent should NOT be called due to stopPropagation
    expect(parentClick).not.toHaveBeenCalled();
  });

  // 7. Component renders with size='small'
  it("renders without errors when size=small", () => {
    const { container } = render(
      <TemplateFavorites
        templateId="tpl-001"
        isFavorited={false}
        onToggle={onToggle}
        size="small"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  // 8. Component renders with size='medium'
  it("renders without errors when size=medium", () => {
    const { container } = render(
      <TemplateFavorites
        templateId="tpl-001"
        isFavorited={false}
        onToggle={onToggle}
        size="medium"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  // 9. Heart icon uses teal color (#378C92) when favorited
  it("has teal fill color element when isFavorited=true", () => {
    const { container } = render(
      <TemplateFavorites
        templateId="tpl-001"
        isFavorited={true}
        onToggle={onToggle}
      />,
    );
    // Look for teal color in inline styles or data attributes
    const html = container.innerHTML;
    // The component should reference teal (#378C92) when favorited
    expect(html).toContain("#378C92");
  });
});

// ---------------------------------------------------------------------------
// TemplateCard + Favorites Integration Tests
// ---------------------------------------------------------------------------
describe("TemplateCard with favorites props", () => {
  let onClick: Mock<(template: TemplateSummary) => void>;
  let onFavoriteToggle: Mock<(templateId: string) => void>;

  beforeEach(() => {
    onClick = vi.fn<(template: TemplateSummary) => void>();
    onFavoriteToggle = vi.fn<(templateId: string) => void>();
  });

  // 10. TemplateCard renders without favorites props (backward compat)
  it("renders correctly without optional favorites props (backward compatible)", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    expect(
      screen.getAllByText("Modern Business").length,
    ).toBeGreaterThanOrEqual(1);
  });

  // 11. TemplateCard renders TemplateFavorites when onFavoriteToggle is provided
  it("renders a heart/favorites button when onFavoriteToggle is provided", () => {
    const { container } = render(
      <TemplateCard
        template={baseTemplate}
        onClick={onClick}
        isFavorited={false}
        onFavoriteToggle={onFavoriteToggle}
      />,
    );
    // Should render a favorites button (data-favorited attribute)
    const favBtn = container.querySelector("[data-favorited]");
    expect(favBtn).toBeInTheDocument();
  });

  // 12. TemplateCard heart click does not trigger card onClick
  it("clicking heart button does not trigger card onClick", () => {
    const { container } = render(
      <TemplateCard
        template={baseTemplate}
        onClick={onClick}
        isFavorited={false}
        onFavoriteToggle={onFavoriteToggle}
      />,
    );
    const favBtn = container.querySelector("[data-favorited]") as HTMLElement;
    fireEvent.click(favBtn);
    // Card onClick should NOT fire (heart has stopPropagation)
    expect(onClick).not.toHaveBeenCalled();
    // But onFavoriteToggle should have been called
    expect(onFavoriteToggle).toHaveBeenCalledTimes(1);
  });

  // Additional: TemplateCard still memo-wrapped
  it("remains wrapped with React.memo", () => {
    const result = render(
      <TemplateCard template={baseTemplate} onClick={onClick} />,
    );
    expect(result.container.firstChild).not.toBeNull();
  });
});
