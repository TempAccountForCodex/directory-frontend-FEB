/**
 * Tests for TemplatePreviewModal with Viewport Toggle (Step 4.6.2)
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
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
  }),
}));

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

const mockScreenshots = {
  desktop: "https://example.com/desktop.png",
  mobile: "https://example.com/mobile.png",
  thumbnail: "https://example.com/thumb.png",
};

let mockScreenshotsReturn: {
  screenshots: {
    desktop: string | null;
    mobile: string | null;
    thumbnail: string | null;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: ReturnType<typeof vi.fn>;
} = {
  screenshots: mockScreenshots,
  loading: false,
  error: null,
  refetch: vi.fn(),
};

vi.mock("../../../hooks/usePreviewApi", () => ({
  useTemplateScreenshots: () => mockScreenshotsReturn,
}));

import TemplatePreviewModal from "../TemplatePreviewModal";

const createTemplate = (overrides = {}) => ({
  id: "tpl-1",
  name: "Business Pro",
  description: "A professional business template",
  type: "website" as const,
  category: "business" as const,
  version: "1.0.0",
  previewImage: "https://example.com/preview.png",
  pageCount: 3,
  blockCount: 8,
  ...overrides,
});

describe("TemplatePreviewModal", () => {
  const defaultProps = {
    open: true,
    template: createTemplate(),
    templates: [createTemplate()],
    onClose: vi.fn(),
    onUseTemplate: vi.fn(),
    onNavigate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockScreenshotsReturn = {
      screenshots: mockScreenshots,
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
  });

  it("renders template name", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    expect(screen.getByText("Business Pro")).toBeInTheDocument();
  });

  it("shows viewport toggle when screenshots available", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    expect(
      screen.getByRole("button", { name: /desktop preview/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /mobile preview/i }),
    ).toBeInTheDocument();
  });

  it("hides viewport toggle when no screenshots", () => {
    mockScreenshotsReturn = {
      screenshots: { desktop: null, mobile: null, thumbnail: null },
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    render(<TemplatePreviewModal {...defaultProps} />);
    expect(
      screen.queryByRole("button", { name: /desktop preview/i }),
    ).not.toBeInTheDocument();
  });

  it("shows desktop screenshot by default", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    const img = screen.getByAltText("Business Pro - desktop preview");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", mockScreenshots.desktop);
  });

  it("switches to mobile screenshot on toggle click", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    const mobileBtn = screen.getByRole("button", { name: /mobile preview/i });
    fireEvent.click(mobileBtn);
    const img = screen.getByAltText("Business Pro - mobile preview");
    expect(img).toHaveAttribute("src", mockScreenshots.mobile);
  });

  it("shows category and type chips", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    expect(screen.getByText("Business")).toBeInTheDocument();
    expect(screen.getByText("website")).toBeInTheDocument();
  });

  it("shows description", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    expect(
      screen.getByText("A professional business template"),
    ).toBeInTheDocument();
  });

  it("shows page and block counts", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    expect(screen.getByText(/3 pages/)).toBeInTheDocument();
    expect(screen.getByText(/8 blocks/)).toBeInTheDocument();
  });

  it("calls onNavigate prev/next", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /previous template/i }));
    expect(defaultProps.onNavigate).toHaveBeenCalledWith("prev");
    fireEvent.click(screen.getByRole("button", { name: /next template/i }));
    expect(defaultProps.onNavigate).toHaveBeenCalledWith("next");
  });

  it("calls onUseTemplate when CTA clicked", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    fireEvent.click(screen.getByText("Use This Template"));
    expect(defaultProps.onUseTemplate).toHaveBeenCalledWith(
      defaultProps.template,
    );
  });

  it("calls onClose when close button clicked", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    fireEvent.click(screen.getByRole("button", { name: /close/i }));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("shows loading skeleton while screenshots loading", () => {
    mockScreenshotsReturn = {
      screenshots: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    };
    render(<TemplatePreviewModal {...defaultProps} />);
    expect(screen.getByLabelText("Loading preview image")).toBeInTheDocument();
  });

  it("shows placeholder when no previewImage and no screenshots", () => {
    mockScreenshotsReturn = {
      screenshots: { desktop: null, mobile: null, thumbnail: null },
      loading: false,
      error: null,
      refetch: vi.fn(),
    };
    render(
      <TemplatePreviewModal
        {...defaultProps}
        template={createTemplate({ previewImage: null })}
      />,
    );
    // Should show the layout template icon placeholder area
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("arrow keys navigate templates when modal is open", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    fireEvent.keyDown(window, { key: "ArrowLeft" });
    expect(defaultProps.onNavigate).toHaveBeenCalledWith("prev");
    fireEvent.keyDown(window, { key: "ArrowRight" });
    expect(defaultProps.onNavigate).toHaveBeenCalledWith("next");
  });

  it("renders nothing when template is null", () => {
    render(<TemplatePreviewModal {...defaultProps} template={null} />);
    expect(screen.queryByText("Business Pro")).not.toBeInTheDocument();
  });

  it("shows viewport chip indicating current view", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    expect(screen.getByText("Desktop")).toBeInTheDocument();
  });

  it("min touch targets are 44px on nav buttons", () => {
    render(<TemplatePreviewModal {...defaultProps} />);
    const prevBtn = screen.getByRole("button", { name: /previous template/i });
    expect(prevBtn).toHaveStyle({ minWidth: "44px", minHeight: "44px" });
  });
});
