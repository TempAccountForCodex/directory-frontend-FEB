/**
 * Tests for ListingOptInStep (Step 10.7.10)
 *
 * Covers:
 * 1. Paid plan user sees checked opt-in checkbox by default
 * 2. Free plan user sees locked upgrade CTA
 * 3. Wizard completion with opt-in calls POST /extract
 * 4. Wizard completion without opt-in does not call extract
 * 5. Extraction error shows warning but completes wizard
 * 6. Expandable customization section toggles
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
vi.mock("../../Dashboard/shared/DashboardInput", () => ({
  default: ({ label, value, onChange, ...props }: any) => (
    <div data-testid={`input-${label?.replace(/\s+/g, "-").toLowerCase()}`}>
      <label>{label}</label>
      <input value={value || ""} onChange={onChange} {...props} />
    </div>
  ),
}));

vi.mock("../../Dashboard/shared/DashboardSelect", () => ({
  default: ({ label, value, onChange, children }: any) => (
    <div data-testid={`select-${label?.replace(/\s+/g, "-").toLowerCase()}`}>
      <label>{label}</label>
      <select value={value || ""} onChange={onChange}>
        {children}
      </select>
    </div>
  ),
}));

vi.mock("../../Dashboard/shared/DashboardCard", () => ({
  default: ({ title, subtitle, children }: any) => (
    <div data-testid="dashboard-card">
      <h3>{title}</h3>
      {subtitle && <p>{subtitle}</p>}
      {children}
    </div>
  ),
}));

vi.mock("../../Dashboard/shared/DashboardGradientButton", () => ({
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

vi.mock("../../Dashboard/shared/DashboardActionButton", () => ({
  default: ({ children, onClick, disabled }: any) => (
    <button onClick={onClick} disabled={disabled} data-testid="action-btn">
      {children}
    </button>
  ),
}));

import ListingOptInStep from "../ListingOptInStep";

describe("ListingOptInStep", () => {
  const defaultProps = {
    websiteId: 1,
    websiteName: "Test Business",
    planCode: "website_core",
    onComplete: vi.fn(),
    onSkip: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders checked opt-in checkbox for paid plan user", () => {
    render(<ListingOptInStep {...defaultProps} />);
    const checkbox = screen.getByTestId("opt-in-checkbox");
    expect(checkbox).toBeInTheDocument();
    // The checkbox input should be checked
    const input = checkbox.querySelector("input") || checkbox;
    expect(input).toBeChecked();
  });

  it("renders listing preview when opted in", () => {
    render(<ListingOptInStep {...defaultProps} />);
    expect(screen.getByTestId("listing-preview")).toBeInTheDocument();
    expect(screen.getByText("Test Business")).toBeInTheDocument();
  });

  it("renders locked upgrade CTA for free plan user", () => {
    render(<ListingOptInStep {...defaultProps} planCode="website_free" />);
    expect(screen.getByTestId("upgrade-cta")).toBeInTheDocument();
    expect(
      screen.getByText(/Available on Core plan and above/i),
    ).toBeInTheDocument();
  });

  it("does not show checkbox for free plan", () => {
    render(<ListingOptInStep {...defaultProps} planCode="website_free" />);
    expect(screen.queryByTestId("opt-in-checkbox")).not.toBeInTheDocument();
  });

  it("calls POST /extract on completion with opt-in checked", async () => {
    mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });

    render(<ListingOptInStep {...defaultProps} />);

    const completeBtn = screen.getByTestId("complete-btn");
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/websites/1/listing/extract"),
      );
    });

    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalled();
    });
  });

  it("does not call extract API when opt-in is unchecked", async () => {
    render(<ListingOptInStep {...defaultProps} />);

    // Uncheck the opt-in
    const checkbox = screen
      .getByTestId("opt-in-checkbox")
      .querySelector("input")!;
    fireEvent.click(checkbox);

    const completeBtn = screen.getByTestId("complete-btn");
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalled();
    });

    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("completes wizard even when extraction fails (non-blocking)", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("Network error"));

    render(<ListingOptInStep {...defaultProps} />);

    const completeBtn = screen.getByTestId("complete-btn");
    fireEvent.click(completeBtn);

    await waitFor(() => {
      expect(defaultProps.onComplete).toHaveBeenCalled();
    });
  });

  it("toggles the expandable customization section", () => {
    render(<ListingOptInStep {...defaultProps} />);

    const toggle = screen.getByText("Customize Listing Details");
    fireEvent.click(toggle);

    // After clicking, the input fields should be visible
    expect(screen.getByTestId("input-short-description")).toBeInTheDocument();
    expect(screen.getByTestId("select-business-category")).toBeInTheDocument();
  });

  it("calls onSkip when skip button is clicked", () => {
    render(<ListingOptInStep {...defaultProps} />);

    const skipBtn = screen.getByText("Skip");
    fireEvent.click(skipBtn);

    expect(defaultProps.onSkip).toHaveBeenCalled();
  });
});
