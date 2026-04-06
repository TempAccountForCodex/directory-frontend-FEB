/**
 * Tests for DomainManagement page (Step 10.1.11 & 10.1.12)
 *
 * Covers:
 * 1.  Component renders without crashing
 * 2.  Subdomain section DashboardCard is rendered
 * 3.  Subdomain DashboardInput is rendered
 * 4.  Invalid subdomain format shows Warning indicator
 * 5.  Valid subdomain debounces and calls availability check
 * 6.  Available subdomain shows "available" text
 * 7.  Taken subdomain shows "taken" text + suggestions
 * 8.  Clicking suggestion chip fills input
 * 9.  Save button disabled when subdomain is not available
 * 10. Save button enabled when subdomain is available
 * 11. Save button calls PATCH endpoint
 * 12. Save success shows snackbar
 * 13. Free/Core plan shows locked state with upgrade CTA
 * 14. Growth plan shows custom domain UI
 * 15. Add domain button calls POST endpoint
 * 16. DNS verification section shown when domain is PENDING_VERIFICATION
 * 17. Verify button calls POST verify endpoint
 * 18. Remove domain button shows ConfirmationDialog
 * 19. Remove domain calls DELETE endpoint
 * 20. Domain status chip renders with correct label
 */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BrowserRouter } from "react-router-dom";

// ---------------------------------------------------------------------------
// Mock global fetch
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockFetch = vi.fn() as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.fetch = mockFetch as any;

// ---------------------------------------------------------------------------
// Mock theme context
// ---------------------------------------------------------------------------
vi.mock("../../context/ThemeContext", () => ({
  useTheme: () => ({ actualTheme: "dark" }),
}));

vi.mock("../../styles/dashboardTheme", () => ({
  getDashboardColors: () => ({
    panelBg: "#121517",
    border: "rgba(55,140,146,0.15)",
    text: "#F5F5F5",
    textSecondary: "#9FA6AE",
    bgCard: "#121517",
    cardBg: "#1a1d21",
    mode: "dark",
    primary: "#378C92",
    primaryDark: "#2a6f73",
    primaryLight: "#4ab0b6",
    panelBorder: "rgba(55,140,146,0.15)",
    panelText: "#F5F5F5",
    panelMuted: "#9FA6AE",
    panelSubtle: "#6b7280",
    panelAccent: "#378C92",
    panelDanger: "#ef4444",
    panelShadow: "none",
    panelShadowSm: "none",
    shadow: "none",
    dark: "#0d0f11",
    textTertiary: "#6b7280",
    error: "#ef4444",
  }),
}));

// ---------------------------------------------------------------------------
// Mock MUI useMediaQuery
// ---------------------------------------------------------------------------
vi.mock("@mui/material/useMediaQuery", () => ({
  default: vi.fn().mockReturnValue(false),
}));

// ---------------------------------------------------------------------------
// Mock shared Dashboard components
// ---------------------------------------------------------------------------
vi.mock("../../components/Dashboard/shared", () => ({
  DashboardCard: ({
    title,
    children,
    icon: _icon,
  }: {
    title?: string;
    children?: React.ReactNode;
    icon?: React.ComponentType;
  }) => (
    <div data-testid="dashboard-card">
      {title && <div data-testid="card-title">{title}</div>}
      {children}
    </div>
  ),
  DashboardInput: ({
    label,
    value,
    onChange,
    placeholder,
    disabled,
    error,
    helperText,
  }: {
    label?: string;
    value?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
  }) => (
    <div data-testid="dashboard-input">
      {label && <label>{label}</label>}
      <input
        data-testid={`input-${label?.toLowerCase().replace(/\s+/g, "-") || "field"}`}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error}
      />
      {helperText && <span data-testid="input-helper">{helperText}</span>}
    </div>
  ),
  DashboardConfirmButton: ({
    children,
    onClick,
    disabled,
    startIcon,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    startIcon?: React.ReactNode;
  }) => (
    <button data-testid="confirm-button" onClick={onClick} disabled={disabled}>
      {startIcon}
      {children}
    </button>
  ),
  DashboardCancelButton: ({
    children,
    onClick,
    disabled,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button data-testid="cancel-button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  DashboardGradientButton: ({
    children,
    onClick,
    href,
    component: _component,
  }: {
    children?: React.ReactNode;
    onClick?: () => void;
    href?: string;
    component?: React.ElementType;
  }) => (
    <button data-testid="gradient-button" onClick={onClick} data-href={href}>
      {children}
    </button>
  ),
  DashboardTooltip: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactElement;
  }) => (
    <div data-testid="dashboard-tooltip" data-tooltip={title}>
      {children}
    </div>
  ),
  TabNavigation: ({
    tabs,
    value,
    onChange,
  }: {
    tabs: Array<{ label: string; value: string }>;
    value: string;
    onChange: (e: unknown, v: string) => void;
  }) => (
    <div data-testid="tab-navigation">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          data-testid={`dns-tab-${tab.value}`}
          data-active={value === tab.value}
          onClick={() => onChange(null, tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  ),
  ConfirmationDialog: ({
    open,
    onConfirm,
    onCancel,
    title,
    message,
  }: {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    title?: string;
    message?: string;
  }) =>
    open ? (
      <div data-testid="confirmation-dialog">
        <div data-testid="dialog-title">{title}</div>
        <div data-testid="dialog-message">{message}</div>
        <button data-testid="dialog-confirm" onClick={onConfirm}>
          Confirm
        </button>
        <button data-testid="dialog-cancel" onClick={onCancel}>
          Cancel
        </button>
      </div>
    ) : null,
  EmptyState: ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <div data-testid="empty-state">
      <span data-testid="empty-title">{title}</span>
      {subtitle && <span data-testid="empty-subtitle">{subtitle}</span>}
    </div>
  ),
}));

// ---------------------------------------------------------------------------
// Import component under test
// ---------------------------------------------------------------------------
import DomainManagement from "../DomainManagement";

// ---------------------------------------------------------------------------
// Default fetch factory
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function makeDefaultFetch(overrides?: {
  website?: object;
  plan?: object;
  availability?: object;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any {
  return vi.fn((url: string, options?: RequestInit) => {
    if (typeof url === "string" && url.includes("/api/websites/")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            overrides?.website ?? {
              id: 42,
              subdomain: "mysite",
              customDomain: null,
              domainStatus: "NONE",
            },
          ),
      });
    }
    if (typeof url === "string" && url.includes("/api/billing/plan")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            overrides?.plan ?? { customDomain: true, plan: "growth" },
          ),
      });
    }
    if (typeof url === "string" && url.includes("check-availability")) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve(
            overrides?.availability ?? {
              available: true,
              subdomain: "newsite",
              suggestions: [],
            },
          ),
      });
    }
    // PATCH subdomain
    if (
      options?.method === "PATCH" &&
      typeof url === "string" &&
      url.includes("/subdomain")
    ) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            subdomain: "newsite",
            canonicalUrl: "https://newsite.techietribe.app",
          }),
      });
    }
    // POST custom-domain
    if (
      options?.method === "POST" &&
      typeof url === "string" &&
      url.includes("custom-domain") &&
      !url.includes("verify")
    ) {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            domain: "example.com",
            verifyRecord: {
              type: "TXT",
              host: "_techietribe-verify.example.com",
              value: "abc123",
            },
            status: "PENDING_VERIFICATION",
          }),
      });
    }
    // POST verify
    if (
      options?.method === "POST" &&
      typeof url === "string" &&
      url.includes("verify")
    ) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ verified: true, status: "VERIFIED" }),
      });
    }
    // DELETE
    if (options?.method === "DELETE") {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ removed: true }),
      });
    }
    return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
  });
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
const renderComponent = (websiteId = 42) =>
  render(
    <BrowserRouter>
      <DomainManagement websiteId={websiteId} />
    </BrowserRouter>,
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("DomainManagement page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = makeDefaultFetch();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // 1. Component renders without crashing
  it("renders the component without crashing", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getAllByTestId("dashboard-card").length).toBeGreaterThan(0);
    });
  });

  // 2. Subdomain section DashboardCard is rendered
  it("renders subdomain DashboardCard section", async () => {
    renderComponent();
    await waitFor(() => {
      const cardTitles = screen.getAllByTestId("card-title");
      const subdomainCard = cardTitles.find(
        (el) => el.textContent === "Subdomain",
      );
      expect(subdomainCard).toBeDefined();
    });
  });

  // 3. Subdomain DashboardInput is rendered
  it("renders subdomain DashboardInput", async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getAllByTestId("dashboard-input").length).toBeGreaterThan(
        0,
      );
    });
  });

  // 4. Invalid subdomain format shows Warning indicator
  it("shows invalid format indicator for bad subdomain", async () => {
    renderComponent();
    await waitFor(() => screen.getByTestId("input-subdomain"));

    fireEvent.change(screen.getByTestId("input-subdomain"), {
      target: { value: "-invalid-start" },
    });

    await waitFor(() => {
      expect(screen.getByText(/lowercase letters/i)).toBeInTheDocument();
    });
  });

  // 5. Valid subdomain debounces and calls availability check after 500ms
  it("calls availability check after debounce for valid subdomain", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      global.fetch = makeDefaultFetch();
      renderComponent();

      // Wait for initial data load
      await waitFor(() => screen.getByTestId("input-subdomain"));

      // Clear fetch call count from initial load
      (global.fetch as ReturnType<typeof vi.fn>).mockClear();

      fireEvent.change(screen.getByTestId("input-subdomain"), {
        target: { value: "newsite" },
      });

      // Should not have called yet (within debounce window)
      expect(global.fetch).not.toHaveBeenCalledWith(
        expect.stringContaining("check-availability"),
        expect.anything(),
      );

      // Advance time past debounce
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("check-availability"),
          expect.anything(),
        );
      });
    } finally {
      vi.useRealTimers();
    }
  });

  // 6. Available subdomain shows "available" text
  it("shows available indicator when subdomain is available", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      global.fetch = makeDefaultFetch({
        availability: {
          available: true,
          subdomain: "newsite",
          suggestions: [],
        },
      });
      renderComponent();
      await waitFor(() => screen.getByTestId("input-subdomain"));

      fireEvent.change(screen.getByTestId("input-subdomain"), {
        target: { value: "newsite" },
      });
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        expect(screen.getByText(/available/i)).toBeInTheDocument();
      });
    } finally {
      vi.useRealTimers();
    }
  });

  // 7. Taken subdomain shows "taken" text + suggestions
  it("shows taken indicator and suggestions when subdomain is taken", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      global.fetch = makeDefaultFetch({
        availability: {
          available: false,
          subdomain: "takensite",
          suggestions: ["takensite-1", "takensite-2"],
        },
      });
      renderComponent();
      await waitFor(() => screen.getByTestId("input-subdomain"));

      fireEvent.change(screen.getByTestId("input-subdomain"), {
        target: { value: "takensite" },
      });
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        // "is taken" text appears in the status indicator (not the URL display)
        expect(
          screen.getByText(/\.techietribe\.app is taken/i),
        ).toBeInTheDocument();
        expect(screen.getByText("takensite-1")).toBeInTheDocument();
      });
    } finally {
      vi.useRealTimers();
    }
  });

  // 8. Clicking suggestion chip fills input
  it("fills input when suggestion chip is clicked", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      global.fetch = makeDefaultFetch({
        availability: {
          available: false,
          subdomain: "takensite",
          suggestions: ["takensite-1"],
        },
      });
      renderComponent();
      await waitFor(() => screen.getByTestId("input-subdomain"));

      fireEvent.change(screen.getByTestId("input-subdomain"), {
        target: { value: "takensite" },
      });
      vi.advanceTimersByTime(600);

      await waitFor(() => screen.getByText("takensite-1"));

      fireEvent.click(screen.getByText("takensite-1"));

      await waitFor(() => {
        expect(screen.getByTestId("input-subdomain")).toHaveValue(
          "takensite-1",
        );
      });
    } finally {
      vi.useRealTimers();
    }
  });

  // 9. Save button disabled when subdomain is not available
  it("disables save button when subdomain status is not available", async () => {
    renderComponent();
    await waitFor(() => screen.getByTestId("input-subdomain"));

    // Type an invalid subdomain
    fireEvent.change(screen.getByTestId("input-subdomain"), {
      target: { value: "-bad" },
    });

    await waitFor(() => {
      const saveButtons = screen.getAllByTestId("confirm-button");
      const subdomainSaveBtn = saveButtons.find((btn) =>
        btn.textContent?.includes("Save Subdomain"),
      );
      expect(subdomainSaveBtn).toBeDefined();
      expect(subdomainSaveBtn).toBeDisabled();
    });
  });

  // 10. Save button enabled when subdomain is available and different
  it("enables save button when subdomain is available and different", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      global.fetch = makeDefaultFetch({
        availability: {
          available: true,
          subdomain: "newsite",
          suggestions: [],
        },
      });
      renderComponent();
      await waitFor(() => screen.getByTestId("input-subdomain"));

      fireEvent.change(screen.getByTestId("input-subdomain"), {
        target: { value: "newsite" },
      });
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        const saveButtons = screen.getAllByTestId("confirm-button");
        const btn = saveButtons.find((b) =>
          b.textContent?.includes("Save Subdomain"),
        );
        expect(btn).not.toBeDisabled();
      });
    } finally {
      vi.useRealTimers();
    }
  });

  // 11. Save button calls PATCH endpoint
  it("calls PATCH /api/domains/:id/subdomain on save", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      global.fetch = makeDefaultFetch({
        availability: {
          available: true,
          subdomain: "newsite",
          suggestions: [],
        },
      });
      renderComponent();
      await waitFor(() => screen.getByTestId("input-subdomain"));

      fireEvent.change(screen.getByTestId("input-subdomain"), {
        target: { value: "newsite" },
      });
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        const btn = screen
          .getAllByTestId("confirm-button")
          .find((b) => b.textContent?.includes("Save Subdomain"));
        expect(btn).not.toBeDisabled();
      });

      const saveBtn = screen
        .getAllByTestId("confirm-button")
        .find((btn) => btn.textContent?.includes("Save Subdomain"))!;

      fireEvent.click(saveBtn);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.stringContaining("/subdomain"),
          expect.objectContaining({ method: "PATCH" }),
        );
      });
    } finally {
      vi.useRealTimers();
    }
  });

  // 12. Save success shows snackbar
  it("shows success snackbar after subdomain save", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      global.fetch = makeDefaultFetch({
        availability: {
          available: true,
          subdomain: "newsite",
          suggestions: [],
        },
      });
      renderComponent();
      await waitFor(() => screen.getByTestId("input-subdomain"));

      fireEvent.change(screen.getByTestId("input-subdomain"), {
        target: { value: "newsite" },
      });
      vi.advanceTimersByTime(600);

      await waitFor(() => {
        const btn = screen
          .getAllByTestId("confirm-button")
          .find((b) => b.textContent?.includes("Save Subdomain"));
        expect(btn).not.toBeDisabled();
      });

      fireEvent.click(
        screen
          .getAllByTestId("confirm-button")
          .find((b) => b.textContent?.includes("Save Subdomain"))!,
      );

      await waitFor(() => {
        expect(screen.getByText(/subdomain updated/i)).toBeInTheDocument();
      });
    } finally {
      vi.useRealTimers();
    }
  });

  // 13. Free/Core plan shows locked state with upgrade CTA
  it("shows upgrade CTA for free/core plan users", async () => {
    global.fetch = makeDefaultFetch({
      plan: { customDomain: false, plan: "free" },
    });
    renderComponent();

    await waitFor(() => {
      // Both locked message and button contain "Growth plan" — check for gradient button
      expect(screen.getByTestId("gradient-button")).toBeInTheDocument();
      expect(screen.getByText(/Custom Domain Locked/i)).toBeInTheDocument();
    });
  });

  // 14. Growth plan shows custom domain UI
  it("shows custom domain management for growth plan users", async () => {
    renderComponent();

    await waitFor(() => {
      const cardTitles = screen.getAllByTestId("card-title");
      const customDomainCard = cardTitles.find((el) =>
        el.textContent?.includes("Custom Domain"),
      );
      expect(customDomainCard).toBeDefined();
    });
  });

  // 15. Add domain button calls POST endpoint
  it("calls POST /api/domains/:id/custom-domain on add domain", async () => {
    renderComponent();
    await waitFor(() => screen.getByTestId("input-custom-domain"));

    fireEvent.change(screen.getByTestId("input-custom-domain"), {
      target: { value: "example.com" },
    });

    await waitFor(() => {
      const addBtn = screen
        .getAllByTestId("confirm-button")
        .find((btn) => btn.textContent?.includes("Add Domain"));
      expect(addBtn).not.toBeDisabled();
    });

    fireEvent.click(
      screen
        .getAllByTestId("confirm-button")
        .find((btn) => btn.textContent?.includes("Add Domain"))!,
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("custom-domain"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  // 16. DNS verification section shown when domain is PENDING_VERIFICATION
  it("shows DNS verification section when domain status is PENDING_VERIFICATION", async () => {
    global.fetch = makeDefaultFetch({
      website: {
        id: 42,
        subdomain: "mysite",
        customDomain: "example.com",
        domainStatus: "PENDING_VERIFICATION",
        verifyToken: "tok_abc123",
      },
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/DNS Verification/i)).toBeInTheDocument();
    });
  });

  // 17. Verify button calls POST verify endpoint
  it("calls POST verify endpoint on verify click", async () => {
    global.fetch = makeDefaultFetch({
      website: {
        id: 42,
        subdomain: "mysite",
        customDomain: "example.com",
        domainStatus: "PENDING_VERIFICATION",
        verifyToken: "tok_abc123",
      },
    });
    renderComponent();

    await waitFor(() => {
      const verifyBtn = screen
        .getAllByTestId("confirm-button")
        .find((btn) => btn.textContent?.includes("Verify"));
      expect(verifyBtn).toBeDefined();
    });

    const verifyBtn = screen
      .getAllByTestId("confirm-button")
      .find((btn) => btn.textContent?.includes("Verify"))!;

    fireEvent.click(verifyBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("verify"),
        expect.objectContaining({ method: "POST" }),
      );
    });
  });

  // 18. Remove domain button shows ConfirmationDialog
  it("shows ConfirmationDialog when remove domain is clicked", async () => {
    global.fetch = makeDefaultFetch({
      website: {
        id: 42,
        subdomain: "mysite",
        customDomain: "example.com",
        domainStatus: "ACTIVE",
        verifyToken: null,
      },
    });
    renderComponent();

    await waitFor(() => {
      const removeBtn = screen
        .getAllByTestId("cancel-button")
        .find((btn) => btn.textContent?.includes("Remove"));
      expect(removeBtn).toBeDefined();
    });

    fireEvent.click(
      screen
        .getAllByTestId("cancel-button")
        .find((btn) => btn.textContent?.includes("Remove"))!,
    );

    await waitFor(() => {
      expect(screen.getByTestId("confirmation-dialog")).toBeInTheDocument();
    });
  });

  // 19. Remove domain calls DELETE endpoint
  it("calls DELETE endpoint on domain removal confirmation", async () => {
    global.fetch = makeDefaultFetch({
      website: {
        id: 42,
        subdomain: "mysite",
        customDomain: "example.com",
        domainStatus: "ACTIVE",
        verifyToken: null,
      },
    });
    renderComponent();

    await waitFor(() => {
      const removeBtn = screen
        .getAllByTestId("cancel-button")
        .find((btn) => btn.textContent?.includes("Remove"));
      expect(removeBtn).toBeDefined();
    });

    fireEvent.click(
      screen
        .getAllByTestId("cancel-button")
        .find((btn) => btn.textContent?.includes("Remove"))!,
    );

    await waitFor(() => screen.getByTestId("confirmation-dialog"));

    fireEvent.click(screen.getByTestId("dialog-confirm"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("custom-domain"),
        expect.objectContaining({ method: "DELETE" }),
      );
    });
  });

  // 20. Domain status chip renders
  it("renders domain status chip when domain is ACTIVE", async () => {
    global.fetch = makeDefaultFetch({
      website: {
        id: 42,
        subdomain: "mysite",
        customDomain: "example.com",
        domainStatus: "ACTIVE",
        verifyToken: null,
      },
    });
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("ACTIVE")).toBeInTheDocument();
    });
  });
});
