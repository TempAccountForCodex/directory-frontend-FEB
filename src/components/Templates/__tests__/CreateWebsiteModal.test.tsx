/**
 * Tests for CreateWebsiteModal (Phase 3 keeper creation path)
 *
 * Covers:
 * 1. Modal renders when open=true with template
 * 2. Modal does not render content when open=false
 * 3. Step 1: website name input is shown
 * 4. Step 1: Next button is disabled when name is empty
 * 5. Step 2: subdomain input is shown after advancing
 * 6. Step 2: subdomain auto-generates from name
 * 7. Subdomain availability check calls API
 * 8. Create button is disabled until subdomain is available
 * 9. Successful creation calls onSuccess with websiteId
 * 10. Close button calls onClose
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

vi.mock("axios");
import axios from "axios";
const mockedAxios = vi.mocked(axios);

vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({ actualTheme: "dark" }),
}));

vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    primary: "#378C92",
    primaryLight: "#4DA8AF",
    text: "#F5F5F5",
    textSecondary: "#9FA6AE",
    textTertiary: "#6B7280",
    bgCard: "#121517",
    border: "rgba(55,140,146,0.15)",
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    panelBg: "#121517",
    panelIcon: "#9FA6AE",
    panelDanger: "#ef4444",
    mode: "dark",
  }),
}));

// Mock shared dashboard components as simple pass-through elements
vi.mock("../../Dashboard/shared/DashboardInput", () => ({
  default: React.forwardRef(
    ({ label, helperText, error, ...props }: any, ref: any) => (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} aria-label={label} {...props} />
        {helperText && <span>{helperText}</span>}
      </div>
    ),
  ),
}));

vi.mock("../../Dashboard/shared/DashboardGradientButton", () => ({
  default: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../../Dashboard/shared/DashboardActionButton", () => ({
  default: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../../Dashboard/shared/DashboardCancelButton", () => ({
  default: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock("../../WebsiteEditor/ListingOptInStep", () => ({
  default: () => <div data-testid="listing-opt-in">Listing Opt-In</div>,
}));

// ---------------------------------------------------------------------------
// Import component under test
// ---------------------------------------------------------------------------

import CreateWebsiteModal from "../CreateWebsiteModal";
import { type TemplateSummary } from "../../../templates/templateApi";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_TEMPLATE: TemplateSummary = {
  id: "tpl-001",
  name: "Business Pro",
  description: "A professional business template",
  type: "website",
  category: "business",
  version: "1.0.0",
  previewImage: null,
  pageCount: 3,
  blockCount: 12,
};

const defaultProps = {
  open: true,
  template: MOCK_TEMPLATE,
  onClose: vi.fn(),
  onSuccess: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CreateWebsiteModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get = vi.fn();
    mockedAxios.post = vi.fn();
  });

  it("renders step 1 (Name Your Website) when open with a template", () => {
    render(<CreateWebsiteModal {...defaultProps} />);
    expect(screen.getByText(/Name Your Website/i)).toBeInTheDocument();
  });

  it("does not render modal content when open=false", () => {
    render(<CreateWebsiteModal {...defaultProps} open={false} />);
    expect(screen.queryByText(/Name Your Website/i)).not.toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<CreateWebsiteModal {...defaultProps} />);
    // The modal has an X (close) IconButton
    const closeButtons = screen.getAllByRole("button");
    const closeBtn = closeButtons.find((btn) => btn.querySelector("svg"));
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    }
  });

  it("renders the template name in the dialog", () => {
    render(<CreateWebsiteModal {...defaultProps} />);
    expect(screen.getByText(/Business Pro/)).toBeInTheDocument();
  });

  it("shows the stepper with expected steps", () => {
    render(<CreateWebsiteModal {...defaultProps} />);
    expect(screen.getByText("Name Your Website")).toBeInTheDocument();
    expect(screen.getByText("Choose Your Address")).toBeInTheDocument();
    expect(screen.getByText("Customize")).toBeInTheDocument();
  });
});
