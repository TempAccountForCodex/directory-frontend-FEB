/**
 * Tests for ListingEditTab (Step 10.7.10)
 *
 * Covers:
 * 1. Status badge renders correctly for each state
 * 2. Form fields render and save correctly
 * 3. Tag add/remove works, max 10 enforced
 * 4. Publish blocked when completeness < 60%
 * 5. Archive shows confirmation dialog
 * 6. Character counter for shortDescription
 * 7. Empty state when not opted in
 * 8. AI enhance calls correct API
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock ThemeContext
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({
    actualTheme: "dark",
    themeMode: "dark",
    changeTheme: vi.fn(),
  }),
}));

// Mock dashboardTheme
vi.mock("../../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    bgDefault: "#1a1a2e",
    bgCard: "#252542",
    text: "#ffffff",
    textSecondary: "#888888",
    textTertiary: "#555555",
    primary: "#6c63ff",
    primaryDark: "#5a52e0",
    primaryLight: "#8b84ff",
    border: "#333355",
    panelBg: "#1e1e3f",
    panelText: "#ffffff",
    panelMuted: "#888888",
    panelSubtle: "#555555",
    panelAccent: "#6c63ff",
    panelDanger: "#ef4444",
    panelBorder: "#333355",
    panelIcon: "#888888",
    panelShadow: "none",
    mode: "dark",
    error: "#ef4444",
    sidebarActiveBg: "#6c63ff",
    sidebarActiveText: "#ffffff",
  }),
}));

// Mock axios
vi.mock("axios");
import axios from "axios";
const mockedAxios = vi.mocked(axios, true);

// Mock shared components
vi.mock("../shared", () => ({
  DashboardCard: ({ title, children }: any) => (
    <div data-testid="dashboard-card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
  EmptyState: ({ title, subtitle }: any) => (
    <div data-testid="empty-state">
      <h3>{title}</h3>
      <p>{subtitle}</p>
    </div>
  ),
  ConfirmationDialog: ({
    open,
    onConfirm,
    onCancel,
    title,
    confirmLabel,
    loading,
  }: any) =>
    open ? (
      <div data-testid="confirm-dialog">
        <p>{title}</p>
        <button
          data-testid="confirm-action"
          onClick={onConfirm}
          disabled={loading}
        >
          {confirmLabel}
        </button>
        <button data-testid="cancel-action" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
}));

vi.mock("../shared/DashboardInput", () => ({
  default: ({ label, value, onChange, error, helperText, ...props }: any) => (
    <div data-testid={`input-${label?.replace(/\s+/g, "-").toLowerCase()}`}>
      <label>{label}</label>
      <input
        value={value || ""}
        onChange={onChange}
        aria-invalid={error}
        maxLength={props.inputProps?.maxLength}
      />
      {helperText && <span>{helperText}</span>}
    </div>
  ),
}));

vi.mock("../shared/DashboardSelect", () => ({
  default: ({ label, value, onChange, children }: any) => (
    <div data-testid={`select-${label?.replace(/\s+/g, "-").toLowerCase()}`}>
      <label>{label}</label>
      <select value={value || ""} onChange={onChange}>
        {children}
      </select>
    </div>
  ),
}));

vi.mock("../shared/DashboardActionButton", () => ({
  default: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props["data-testid"] || "action-btn"}
    >
      {children}
    </button>
  ),
}));

vi.mock("../shared/DashboardGradientButton", () => ({
  default: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props["data-testid"] || "gradient-btn"}
    >
      {children}
    </button>
  ),
}));

vi.mock("../shared/DashboardConfirmButton", () => ({
  default: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props["data-testid"] || "confirm-btn"}
    >
      {children}
    </button>
  ),
}));

vi.mock("../shared/DashboardCard", () => ({
  default: ({ title, children }: any) => (
    <div data-testid="dashboard-card">
      <h3>{title}</h3>
      {children}
    </div>
  ),
}));

import ListingEditTab from "../ListingEditTab";

describe("ListingEditTab", () => {
  const baseWebsiteData = {
    name: "Test Business",
    businessName: "Test Business",
    shortDescription: "A test business description",
    businessCategory: "Technology",
    priceLevel: "$$",
    phone: "+1 555 1234",
    contactEmail: "test@example.com",
    fullAddress: "123 Test St",
    tags: ["tech", "startup"],
    directoryOptedIn: true,
    isPublic: false,
    isDirectoryArchived: false,
  };

  const defaultProps = {
    websiteId: 1,
    websiteData: baseWebsiteData,
    planCode: "website_core",
    aiGenerationsUsed: 0,
    aiGenerationsLimit: 10,
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: { score: 80, missing: ["phone"], suggestions: [] },
      },
    });
  });

  it("renders status badge as Draft for opted-in but not public website", async () => {
    render(<ListingEditTab {...defaultProps} />);
    await waitFor(() => {
      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Draft");
    });
  });

  it("renders status badge as Published when isPublic is true", async () => {
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, isPublic: true }}
      />,
    );
    await waitFor(() => {
      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Published");
    });
  });

  it("renders status badge as Not Listed when directoryOptedIn is false", async () => {
    // When not opted in, shows empty state instead
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, directoryOptedIn: false }}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  it("renders status badge as Archived", async () => {
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, isDirectoryArchived: true }}
      />,
    );
    await waitFor(() => {
      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent("Archived");
    });
  });

  it("renders form fields with pre-populated data", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      const nameInput = screen
        .getByTestId("input-business-name")
        .querySelector("input")!;
      expect(nameInput.value).toBe("Test Business");
    });
  });

  it("saves form data on Save Changes click", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("save-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("save-btn"));

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing"),
        expect.objectContaining({ businessName: "Test Business" }),
      );
    });
  });

  it("adds a tag when typing and pressing Enter", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("tag-input")).toBeInTheDocument();
    });

    const tagInput = screen.getByTestId("tag-input").querySelector("input")!;
    fireEvent.change(tagInput, { target: { value: "newtag" } });
    fireEvent.keyDown(tagInput, { key: "Enter" });

    await waitFor(() => {
      const chips = screen.getAllByTestId("tag-chip");
      expect(chips.length).toBe(3); // 2 initial + 1 new
    });
  });

  it("removes a tag when delete is clicked", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      const chips = screen.getAllByTestId("tag-chip");
      expect(chips.length).toBe(2);
    });

    // Click the delete button on the first chip
    const deleteButtons = screen.getAllByLabelText(/Remove tag/);
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
      const chips = screen.getAllByTestId("tag-chip");
      expect(chips.length).toBe(1);
    });
  });

  it("enforces max 10 tags", async () => {
    const tenTags = [
      "t1",
      "t2",
      "t3",
      "t4",
      "t5",
      "t6",
      "t7",
      "t8",
      "t9",
      "t10",
    ];
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, tags: tenTags }}
      />,
    );

    await waitFor(() => {
      const tagInput = screen.getByTestId("tag-input").querySelector("input")!;
      expect(tagInput).toBeDisabled();
    });

    expect(screen.getByText(/Maximum of 10 tags reached/)).toBeInTheDocument();
  });

  it("blocks publish when completeness < 60%", async () => {
    mockedAxios.get.mockResolvedValue({
      data: {
        success: true,
        data: {
          score: 45,
          missing: ["phone", "email", "address"],
          suggestions: [],
        },
      },
    });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("publish-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("publish-btn"));

    await waitFor(() => {
      expect(
        screen.getByText(/completeness must be at least 60%/i),
      ).toBeInTheDocument();
    });
  });

  it("shows archive confirmation dialog", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("archive-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("archive-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
      expect(screen.getByText("Archive Listing?")).toBeInTheDocument();
    });
  });

  it("calls archive API when confirmed", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("archive-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("archive-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("confirm-action")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("confirm-action"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing/archive"),
      );
    });
  });

  it("renders character counter for shortDescription", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      const counter = screen.getByTestId("char-counter");
      expect(counter).toHaveTextContent(
        `${baseWebsiteData.shortDescription.length}/500`,
      );
    });
  });

  it("renders live preview card", async () => {
    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("listing-preview")).toBeInTheDocument();
      expect(screen.getByText("Test Business")).toBeInTheDocument();
    });
  });

  it("shows empty state when not opted in", () => {
    render(
      <ListingEditTab
        {...defaultProps}
        websiteData={{ ...baseWebsiteData, directoryOptedIn: false }}
      />,
    );

    expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    expect(screen.getByText("No Directory Listing")).toBeInTheDocument();
  });

  it("calls AI enhance endpoint", async () => {
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        success: true,
        data: { shortDescription: "Enhanced desc", tags: ["ai"] },
      },
    });

    render(<ListingEditTab {...defaultProps} />);

    await waitFor(() => {
      expect(screen.getByTestId("enhance-btn")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("enhance-btn"));

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing/enhance"),
      );
    });
  });
});
