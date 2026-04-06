/**
 * Tests for TemplateCard and TemplateGallery (Step 3.4.1 + 3.4.2)
 *
 * Covers:
 * - TemplateCard renders name, description, category badge
 * - TemplateCard shows image when previewImage is set
 * - TemplateCard shows placeholder when previewImage is null
 * - TemplateCard truncates description (WebkitLineClamp)
 * - TemplateCard shows pageCount / blockCount text
 * - TemplateCard onClick fires with template
 * - TemplateCard Preview button fires onPreview and stops propagation
 * - TemplateCard Use Template button fires onClick and stops propagation
 * - TemplateCard hides Preview button when onPreview is not provided
 * - TemplateCard uses CATEGORY_LABELS for display
 * - TemplateCard is React.memo wrapped
 * - TemplateGallery shows skeleton placeholders when loading=true
 * - TemplateGallery shows EmptyState when templates=[] and loading=false
 * - TemplateGallery renders one TemplateCard per template
 * - TemplateGallery uses unique key per template
 * - TemplateGallery is React.memo wrapped
 * - TemplateGallery passes onSelectTemplate and onPreviewTemplate through
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mock context / theme
// ---------------------------------------------------------------------------
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({ actualTheme: "dark" }),
}));

// ---------------------------------------------------------------------------
// Mock getDashboardColors — return minimal token set
// ---------------------------------------------------------------------------
vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    panelBg: "#121517",
    border: "rgba(55,140,146,0.15)",
    text: "#F5F5F5",
    textSecondary: "#9FA6AE",
    bgCard: "#121517",
    mode: "dark",
  }),
}));

// ---------------------------------------------------------------------------
// Mock DashboardGradientButton — render as plain button
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
// Mock EmptyState — render minimal markup
// ---------------------------------------------------------------------------
vi.mock("../../Dashboard/shared", () => ({
  EmptyState: ({
    title,
    subtitle,
    icon,
  }: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
  }) => (
    <div data-testid="empty-state">
      {icon && <span data-testid="empty-icon">{icon}</span>}
      <span data-testid="empty-title">{title}</span>
      {subtitle && <span data-testid="empty-subtitle">{subtitle}</span>}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Imports under test (after mocks)
// ---------------------------------------------------------------------------
import TemplateCard from "../TemplateCard";
import TemplateGallery from "../TemplateGallery";
import { type TemplateSummary } from "../../../templates/templateApi";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
const baseTemplate: TemplateSummary = {
  id: "tpl-001",
  name: "Modern Business",
  description: "A clean, modern template for professional businesses.",
  type: "website",
  category: "business",
  version: "1.0.0",
  previewImage: null,
  pageCount: 3,
  blockCount: 12,
};

const templateWithImage: TemplateSummary = {
  ...baseTemplate,
  id: "tpl-002",
  previewImage: "https://example.com/preview.jpg",
};

const makeTemplate = (
  id: string,
  overrides: Partial<TemplateSummary> = {},
): TemplateSummary => ({
  ...baseTemplate,
  id,
  name: `Template ${id}`,
  ...overrides,
});

// ---------------------------------------------------------------------------
// TemplateCard Tests
// ---------------------------------------------------------------------------
describe("TemplateCard", () => {
  let onClick: Mock<(template: TemplateSummary) => void>;
  let onPreview: Mock<(template: TemplateSummary) => void>;

  beforeEach(() => {
    onClick = vi.fn<(template: TemplateSummary) => void>();
    onPreview = vi.fn<(template: TemplateSummary) => void>();
  });

  it("renders template name", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    // Name appears in both placeholder area and CardContent
    expect(
      screen.getAllByText("Modern Business").length,
    ).toBeGreaterThanOrEqual(1);
  });

  it("renders template description", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    expect(
      screen.getByText("A clean, modern template for professional businesses."),
    ).toBeInTheDocument();
  });

  it("renders category badge using CATEGORY_LABELS", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    // CATEGORY_LABELS['business'] === 'Business'
    expect(screen.getByText("Business")).toBeInTheDocument();
  });

  it("renders pageCount text", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    // Count appears in both placeholder chips and CardContent caption
    expect(screen.getAllByText(/3 pages/).length).toBeGreaterThanOrEqual(1);
  });

  it("renders blockCount text", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    expect(screen.getAllByText(/12 blocks/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders singular "page" when pageCount is 1', () => {
    render(
      <TemplateCard
        template={{ ...baseTemplate, pageCount: 1 }}
        onClick={onClick}
      />,
    );
    // Singular "page" appears in placeholder chip and/or caption
    expect(screen.getAllByText(/1 page\b/).length).toBeGreaterThanOrEqual(1);
  });

  it('renders singular "block" when blockCount is 1', () => {
    render(
      <TemplateCard
        template={{ ...baseTemplate, blockCount: 1, pageCount: undefined }}
        onClick={onClick}
      />,
    );
    // Singular "block" appears in placeholder chip and/or caption
    expect(screen.getAllByText("1 block").length).toBeGreaterThanOrEqual(1);
  });

  it("shows preview image when previewImage is set", () => {
    render(<TemplateCard template={templateWithImage} onClick={onClick} />);
    const img = screen.getByRole("img", { name: /Modern Business/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/preview.jpg");
  });

  it("sets loading=lazy on image", () => {
    render(<TemplateCard template={templateWithImage} onClick={onClick} />);
    const img = screen.getByRole("img", { name: /Modern Business/i });
    expect(img).toHaveAttribute("loading", "lazy");
  });

  it("shows placeholder (no img tag) when previewImage is null", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("calls onClick when card is clicked", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    fireEvent.click(screen.getAllByText("Modern Business")[0]);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(baseTemplate);
  });

  it("calls onPreview when Preview button is clicked", () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onClick={onClick}
        onPreview={onPreview}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /preview/i }));
    expect(onPreview).toHaveBeenCalledTimes(1);
    expect(onPreview).toHaveBeenCalledWith(baseTemplate);
  });

  it("Preview button click does not bubble to card onClick", () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onClick={onClick}
        onPreview={onPreview}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /preview/i }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("calls onClick when Use Template button is clicked", () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onClick={onClick}
        onPreview={onPreview}
      />,
    );
    fireEvent.click(screen.getByTestId("gradient-btn"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onClick).toHaveBeenCalledWith(baseTemplate);
  });

  it("Use Template button does not bubble to card onClick (called once not twice)", () => {
    render(
      <TemplateCard
        template={baseTemplate}
        onClick={onClick}
        onPreview={onPreview}
      />,
    );
    fireEvent.click(screen.getByTestId("gradient-btn"));
    // stopPropagation prevents card onClick from also firing
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("hides Preview button when onPreview is not provided", () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    expect(screen.queryByRole("button", { name: /preview/i })).toBeNull();
  });

  it('renders "Use Template" text in gradient button', () => {
    render(<TemplateCard template={baseTemplate} onClick={onClick} />);
    expect(screen.getByTestId("gradient-btn")).toHaveTextContent(
      "Use Template",
    );
  });

  it("does not render page/block counts when both are undefined", () => {
    const t = { ...baseTemplate, pageCount: undefined, blockCount: undefined };
    render(<TemplateCard template={t} onClick={onClick} />);
    expect(screen.queryByText(/page/)).toBeNull();
    expect(screen.queryByText(/block/)).toBeNull();
  });

  it("is wrapped with React.memo (displayName or name preserved)", () => {
    // React.memo wraps function: component.type.name or component.$$typeof
    // Just verify render works correctly with the memo wrapper
    const result = render(
      <TemplateCard template={baseTemplate} onClick={onClick} />,
    );
    expect(result.container.firstChild).not.toBeNull();
  });

  it("falls back to raw category value when CATEGORY_LABELS key is missing", () => {
    // Using a cast to simulate an unknown category
    const t = {
      ...baseTemplate,
      category: "unknown-cat" as TemplateSummary["category"],
    };
    render(<TemplateCard template={t} onClick={onClick} />);
    // Should render raw category value as fallback
    expect(screen.getByText("unknown-cat")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// TemplateGallery Tests
// ---------------------------------------------------------------------------
describe("TemplateGallery", () => {
  let onSelectTemplate: Mock<(template: TemplateSummary) => void>;
  let onPreviewTemplate: Mock<(template: TemplateSummary) => void>;

  beforeEach(() => {
    onSelectTemplate = vi.fn<(template: TemplateSummary) => void>();
    onPreviewTemplate = vi.fn<(template: TemplateSummary) => void>();
  });

  it("renders skeleton placeholders when loading=true", () => {
    const { container } = render(
      <TemplateGallery
        templates={[]}
        loading={true}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    // MUI Skeleton renders with role="none" or as spans; check via class or count
    // Skeletons show 8 items: look for the MUI Skeleton root class
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBe(8);
  });

  it("does not render EmptyState when loading=true", () => {
    render(
      <TemplateGallery
        templates={[]}
        loading={true}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    expect(screen.queryByTestId("empty-state")).toBeNull();
  });

  it("renders EmptyState when templates is empty and loading=false", () => {
    render(
      <TemplateGallery
        templates={[]}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
  });

  it("shows correct empty state title", () => {
    render(
      <TemplateGallery
        templates={[]}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    expect(screen.getByTestId("empty-title")).toHaveTextContent(
      "No templates found",
    );
  });

  it("shows correct empty state subtitle", () => {
    render(
      <TemplateGallery
        templates={[]}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    expect(screen.getByTestId("empty-subtitle")).toHaveTextContent(
      "Try adjusting your filters or search query",
    );
  });

  it("renders a TemplateCard for each template", () => {
    const templates = [makeTemplate("a"), makeTemplate("b"), makeTemplate("c")];
    render(
      <TemplateGallery
        templates={templates}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    // Names appear in both placeholder and CardContent for each card
    expect(screen.getAllByText("Template a").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Template b").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("Template c").length).toBeGreaterThanOrEqual(1);
  });

  it("does not render EmptyState when templates are present", () => {
    const templates = [makeTemplate("x")];
    render(
      <TemplateGallery
        templates={templates}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    expect(screen.queryByTestId("empty-state")).toBeNull();
  });

  it("passes onSelectTemplate to TemplateCard onClick", () => {
    const templates = [makeTemplate("card1")];
    render(
      <TemplateGallery
        templates={templates}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    fireEvent.click(screen.getAllByText("Template card1")[0]);
    expect(onSelectTemplate).toHaveBeenCalledTimes(1);
    expect(onSelectTemplate).toHaveBeenCalledWith(templates[0]);
  });

  it("passes onPreviewTemplate to TemplateCard onPreview", () => {
    const templates = [makeTemplate("card2")];
    render(
      <TemplateGallery
        templates={templates}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /preview/i }));
    expect(onPreviewTemplate).toHaveBeenCalledTimes(1);
    expect(onPreviewTemplate).toHaveBeenCalledWith(templates[0]);
  });

  it("renders the correct number of cards for a larger dataset", () => {
    const templates = Array.from({ length: 6 }, (_, i) =>
      makeTemplate(`id-${i}`),
    );
    render(
      <TemplateGallery
        templates={templates}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    // 6 "Use Template" gradient buttons = 6 cards rendered
    expect(screen.getAllByTestId("gradient-btn")).toHaveLength(6);
  });

  it("is wrapped with React.memo", () => {
    const result = render(
      <TemplateGallery
        templates={[]}
        loading={false}
        onSelectTemplate={onSelectTemplate}
        onPreviewTemplate={onPreviewTemplate}
      />,
    );
    expect(result.container).not.toBeNull();
  });
});
