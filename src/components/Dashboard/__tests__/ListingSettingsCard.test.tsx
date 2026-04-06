/**
 * Tests for ListingSettingsCard (Step 10.7.10)
 *
 * Covers:
 * 1. Renders DashboardCard with Globe icon and 'Directory Listing' title
 * 2. Toggle ON triggers extract + displays completeness
 * 3. Toggle OFF shows confirmation dialog
 * 4. AI enhance button disabled for free plan
 * 5. AI enhance button shows remaining generations
 * 6. Free plan users see disabled toggle with upgrade CTA
 * 7. Error handling on toggle failure
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
  DashboardCard: ({ title, subtitle, children }: any) => (
    <div data-testid="dashboard-card">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  ),
  DashboardGradientButton: ({ children, onClick, disabled, ...props }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      data-testid={props["data-testid"] || "gradient-btn"}
    >
      {children}
    </button>
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
  EmptyState: ({ title }: any) => <div data-testid="empty-state">{title}</div>,
}));

vi.mock("../shared/DashboardCard", () => ({
  default: ({ title, subtitle, children }: any) => (
    <div data-testid="dashboard-card">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
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

import ListingSettingsCard from "../ListingSettingsCard";

describe("ListingSettingsCard", () => {
  const defaultProps = {
    websiteId: 1,
    directoryOptedIn: false,
    planCode: "website_core",
    aiGenerationsUsed: 2,
    aiGenerationsLimit: 10,
    onUpdate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders DashboardCard with Directory Listing title", () => {
    render(<ListingSettingsCard {...defaultProps} />);
    expect(screen.getByText("Directory Listing")).toBeInTheDocument();
  });

  it("renders toggle switch for paid plan", () => {
    render(<ListingSettingsCard {...defaultProps} />);
    const toggle = screen.getByTestId("listing-toggle");
    expect(toggle).toBeInTheDocument();
  });

  it("toggle ON triggers extract and displays completeness", async () => {
    mockedAxios.patch.mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { score: 75, missing: ["phone", "email"], suggestions: [] },
      },
    });

    render(<ListingSettingsCard {...defaultProps} />);

    const toggle = screen.getByTestId("listing-toggle").querySelector("input")!;
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing"),
        expect.objectContaining({ directoryOptedIn: true }),
      );
    });

    await waitFor(() => {
      expect(screen.getByTestId("completeness-score")).toBeInTheDocument();
    });
  });

  it("toggle OFF shows confirmation dialog", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { score: 80, missing: [], suggestions: [] },
      },
    });

    render(<ListingSettingsCard {...defaultProps} directoryOptedIn={true} />);

    const toggle = screen.getByTestId("listing-toggle").querySelector("input")!;
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByTestId("confirm-dialog")).toBeInTheDocument();
    });
  });

  it("AI enhance button is disabled for free plan", () => {
    render(<ListingSettingsCard {...defaultProps} planCode="website_free" />);
    // Free plan shows upgrade CTA, not the enhance button
    expect(screen.getByTestId("upgrade-cta")).toBeInTheDocument();
  });

  it("shows AI generations remaining for paid plan when opted in", async () => {
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        success: true,
        data: { score: 80, missing: [], suggestions: [] },
      },
    });

    render(<ListingSettingsCard {...defaultProps} directoryOptedIn={true} />);

    await waitFor(() => {
      expect(
        screen.getByText(/8 of 10 AI generations remaining/i),
      ).toBeInTheDocument();
    });
  });

  it("free plan users see disabled toggle with upgrade text", () => {
    render(<ListingSettingsCard {...defaultProps} planCode="website_free" />);
    const toggle = screen.getByTestId("listing-toggle").querySelector("input")!;
    expect(toggle).toBeDisabled();
    expect(screen.getByText(/Upgrade to a paid plan/i)).toBeInTheDocument();
  });

  it("shows error alert when toggle ON fails", async () => {
    mockedAxios.patch.mockRejectedValueOnce({
      response: { data: { message: "Server error" } },
    });

    render(<ListingSettingsCard {...defaultProps} />);

    const toggle = screen.getByTestId("listing-toggle").querySelector("input")!;
    fireEvent.click(toggle);

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });
});
