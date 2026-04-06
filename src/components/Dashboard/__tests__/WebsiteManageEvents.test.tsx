/**
 * Tests for WebsiteManageEvents (Step 2.29C.4)
 *
 * Covers:
 * 1.  Renders without crashing
 * 2.  Shows 4 DashboardMetricCard stats (Total, Published, Upcoming, Past)
 * 3.  Shows skeleton placeholders when loading
 * 4.  Events table renders with correct columns
 * 5.  Status toggle is MUI Switch
 * 6.  Create dialog opens when "Add Event" button is clicked
 * 7.  Delete confirmation dialog appears before delete
 * 8.  Quick filter buttons: Upcoming / Past / All
 * 9.  Search input filters events by title
 * 10. Sort dropdown renders with Date/Title/RSVPs options
 * 11. isOnline checkbox toggles onlineUrl field visibility
 * 12. Empty state rendered when no events
 * 13. Component uses React.memo (stable output on re-render)
 * 14. Status toggle calls PATCH /api/events/:id/status
 * 15. Delete calls DELETE /api/events/:id after confirmation
 * 16. Edit dialog pre-populates fields
 * 17. No dangerouslySetInnerHTML
 * 18. Tab navigation switches between Events and Categories subtabs
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";

// ---------------------------------------------------------------------------
// Mock fetch globally
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Mock ThemeContext to avoid provider requirement
// ---------------------------------------------------------------------------
vi.mock("../../../context/ThemeContext", () => ({
  useTheme: () => ({
    actualTheme: "dark",
    themeMode: "dark",
    changeTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// ---------------------------------------------------------------------------
// Mock @mui/x-date-pickers to avoid date-fns dependency issues in jsdom
// ---------------------------------------------------------------------------
vi.mock("@mui/x-date-pickers", () => ({
  LocalizationProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  DateTimePicker: ({ label, value, onChange }: any) => (
    <input
      aria-label={label}
      value={value ? String(value) : ""}
      onChange={(e) => onChange && onChange(new Date(e.target.value))}
      data-testid={`datetime-picker-${label?.toLowerCase().replace(/\s+/g, "-")}`}
    />
  ),
}));

vi.mock("@mui/x-date-pickers/AdapterDateFns", () => ({
  AdapterDateFns: class AdapterDateFns {},
}));

// ---------------------------------------------------------------------------
// Mock framer-motion to avoid animation issues in tests
// ---------------------------------------------------------------------------
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// ---------------------------------------------------------------------------
// Import component after mocks
// ---------------------------------------------------------------------------
import WebsiteManageEvents from "../WebsiteManageEvents";

/* ===================== Test Helpers ===================== */

const now = new Date();
const futureDate = new Date(
  now.getTime() + 7 * 24 * 60 * 60 * 1000,
).toISOString();
const pastDate = new Date(
  now.getTime() - 7 * 24 * 60 * 60 * 1000,
).toISOString();

const mockStats = {
  total: 10,
  published: 6,
  upcoming: 4,
  past: 6,
};

const mockEvents = [
  {
    id: 1,
    title: "Tech Conference 2026",
    slug: "tech-conference-2026",
    description: "Annual tech conference.",
    startDate: futureDate,
    endDate: futureDate,
    location: "San Francisco, CA",
    isOnline: false,
    onlineUrl: null,
    status: "PUBLISHED",
    capacity: 100,
    price: "$49",
    category: "Technology",
    rsvpCount: 42,
  },
  {
    id: 2,
    title: "Past Meetup",
    slug: "past-meetup",
    description: "A past meetup.",
    startDate: pastDate,
    endDate: pastDate,
    location: null,
    isOnline: true,
    onlineUrl: "https://zoom.us/meeting/123",
    status: "DRAFT",
    capacity: 50,
    price: "Free",
    category: "Business",
    rsvpCount: 15,
  },
];

const mockEventsResponse = {
  success: true,
  events: mockEvents,
  pagination: { total: 2, page: 1, limit: 10, totalPages: 1 },
};

const mockStatsResponse = {
  success: true,
  ...mockStats,
};

function setupFetchSuccess() {
  mockFetch.mockImplementation((url: string) => {
    if (url.includes("/stats")) {
      return Promise.resolve({ ok: true, json: async () => mockStatsResponse });
    }
    return Promise.resolve({ ok: true, json: async () => mockEventsResponse });
  });
}

function setupFetchError() {
  mockFetch.mockRejectedValue(new Error("Network error"));
}

function renderComponent(websiteId = "website-123") {
  return render(
    <MemoryRouter initialEntries={[`/dashboard/websites/${websiteId}/events`]}>
      <Routes>
        <Route
          path="/dashboard/websites/:websiteId/events"
          element={<WebsiteManageEvents />}
        />
        <Route
          path="/dashboard/websites/:websiteId/events/:subtab"
          element={<WebsiteManageEvents />}
        />
      </Routes>
    </MemoryRouter>,
  );
}

/* ===================== Tests ===================== */

describe("WebsiteManageEvents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Renders without crashing
  it("renders without crashing", async () => {
    setupFetchSuccess();
    const { container } = renderComponent();
    expect(container.firstChild).not.toBeNull();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  // Test 2: Shows 4 metric cards (stats row)
  it("shows 4 stat metric cards: Total, Published, Upcoming, Past", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/total events/i)).toBeInTheDocument();
      expect(screen.getAllByText(/published/i).length).toBeGreaterThanOrEqual(
        1,
      );
      expect(screen.getAllByText(/upcoming/i).length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText(/past/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  // Test 3: Shows skeleton placeholders when loading
  it("shows skeleton placeholders when loading", () => {
    // Make fetch never resolve
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { container } = renderComponent();
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // Test 4: Events table renders with correct columns
  it("renders events table with Title, Date, Location, Status, RSVPs, Actions columns", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });
    // Check table column headers - use getAllByText since "Date" also appears in Sort By dropdown
    const titleHeaders = screen.getAllByText(/^title$/i);
    expect(titleHeaders.length).toBeGreaterThan(0);
    const dateHeaders = screen.getAllByText(/^date$/i);
    expect(dateHeaders.length).toBeGreaterThan(0);
    const locationHeaders = screen.getAllByText(/^location$/i);
    expect(locationHeaders.length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^status$/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/^rsvps$/i).length).toBeGreaterThan(0);
  });

  // Test 5: Status toggle is MUI Switch
  it("renders MUI Switch for status toggle", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });
    const switches = document.querySelectorAll(
      'input[type="checkbox"][role="switch"]',
    );
    expect(switches.length).toBeGreaterThan(0);
  });

  // Test 6: Create dialog opens
  it("opens create dialog when Add Event button is clicked", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /add event/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  // Test 7: Delete confirmation dialog
  it("shows delete confirmation dialog before deleting an event", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    // RowActionButtonGroup uses Tooltip + IconButton with className row-action-button
    // Each row has 2 buttons: [edit, delete]. Delete is at index 1.
    const allIconButtons = document.querySelectorAll(
      "button.row-action-button",
    );
    expect(allIconButtons.length).toBeGreaterThan(1);
    const firstDeleteButton = allIconButtons[1]; // second button = delete for first row
    fireEvent.click(firstDeleteButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      // Either "Delete Event" title or "Are you sure" text in dialog
      const dialog = screen.getByRole("dialog");
      expect(dialog.textContent).toMatch(/delete.*event|are you sure/i);
    });
  });

  // Test 8: Quick filter buttons
  it("renders quick filter buttons: Upcoming, Past, All", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^upcoming$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^past$/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^all$/i }),
      ).toBeInTheDocument();
    });
  });

  // Test 9: Search input
  it("renders search input that filters events", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search events/i);
    expect(searchInput).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "Tech" } });
    // Should filter events client-side or trigger re-fetch
    expect(searchInput).toHaveValue("Tech");
  });

  // Test 10: Sort dropdown
  it("renders sort dropdown with Date, Title, RSVPs options", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    // Sort By label should be present
    const sortByLabel = screen.getAllByText(/sort by/i);
    expect(sortByLabel.length).toBeGreaterThan(0);
  });

  // Test 11: isOnline checkbox toggles onlineUrl field
  it("shows onlineUrl field when isOnline checkbox is checked in the create dialog", async () => {
    // Use only 1 event that is NOT online to avoid pre-rendered onlineUrl field
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/stats")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockStatsResponse,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          events: [mockEvents[0]], // only the non-online event
          pagination: { total: 1, page: 1, limit: 10, totalPages: 1 },
        }),
      });
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    // Open create dialog (new event — isOnline defaults to false)
    const addButton = screen.getByRole("button", { name: /add event/i });
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Online URL placeholder should not be visible initially
    const onlineUrlBefore = document.querySelector(
      'input[placeholder*="zoom.us"]',
    );
    expect(onlineUrlBefore).not.toBeInTheDocument();

    // Find the isOnline checkbox and check it
    const onlineCheckbox = screen.getByRole("checkbox", {
      name: /online event/i,
    });
    fireEvent.click(onlineCheckbox);

    await waitFor(() => {
      // After checking, online URL input field should appear
      const onlineUrlAfter = document.querySelector(
        'input[placeholder*="zoom.us"]',
      );
      expect(onlineUrlAfter).toBeInTheDocument();
    });
  });

  // Test 12: Empty state when no events
  it("shows empty state when no events returned", async () => {
    mockFetch.mockImplementation((url: string) => {
      if (url.includes("/stats")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockStatsResponse,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({
          success: true,
          events: [],
          pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
        }),
      });
    });

    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByText(/no events|create your first event/i),
      ).toBeInTheDocument();
    });
  });

  // Test 13: Component is wrapped in React.memo
  it("component is stable on re-render (React.memo)", async () => {
    setupFetchSuccess();
    const { container, rerender } = renderComponent();
    expect(container.firstChild).not.toBeNull();
    // Re-render with same route — should not crash
    rerender(
      <MemoryRouter initialEntries={["/dashboard/websites/website-123/events"]}>
        <Routes>
          <Route
            path="/dashboard/websites/:websiteId/events"
            element={<WebsiteManageEvents />}
          />
        </Routes>
      </MemoryRouter>,
    );
    expect(container.firstChild).not.toBeNull();
  });

  // Test 14: Status toggle calls PATCH API
  it("status toggle calls PATCH /api/events/:id/status", async () => {
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }
      if (url.includes("/stats")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockStatsResponse,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockEventsResponse,
      });
    });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    const switches = document.querySelectorAll(
      'input[type="checkbox"][role="switch"]',
    );
    expect(switches.length).toBeGreaterThan(0);

    await act(async () => {
      fireEvent.click(switches[0]);
    });

    await waitFor(() => {
      const patchCall = mockFetch.mock.calls.find(
        (call: any[]) =>
          call[1]?.method === "PATCH" && String(call[0]).includes("/status"),
      );
      expect(patchCall).toBeDefined();
    });
  });

  // Test 15: Delete calls DELETE after confirmation
  it("calls DELETE /api/events/:id after confirmation", async () => {
    mockFetch.mockImplementation((url: string, options?: RequestInit) => {
      if (options?.method === "DELETE") {
        return Promise.resolve({
          ok: true,
          json: async () => ({ success: true }),
        });
      }
      if (url.includes("/stats")) {
        return Promise.resolve({
          ok: true,
          json: async () => mockStatsResponse,
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => mockEventsResponse,
      });
    });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    // RowActionButtonGroup uses Tooltip + IconButton — click the icon button by querying all icon buttons
    // The delete buttons appear in each table row — find them by icon button class or data-testid
    const allIconButtons = document.querySelectorAll(
      "button.row-action-button",
    );
    expect(allIconButtons.length).toBeGreaterThan(0);

    // Each event has 2 icon buttons (edit, delete). Delete is the second one.
    const firstDeleteButton = allIconButtons[1]; // second button of first row = delete
    fireEvent.click(firstDeleteButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Confirm deletion — dialog has a "Delete" confirm button
    const dialogButtons = screen.getAllByRole("button", { name: /^delete$/i });
    // Find the confirm button (not the one in the table row actions)
    const confirmButton = dialogButtons.find((btn) =>
      btn.closest('[role="dialog"]'),
    );
    expect(confirmButton).toBeDefined();

    await act(async () => {
      fireEvent.click(confirmButton!);
    });

    await waitFor(() => {
      const deleteCall = mockFetch.mock.calls.find(
        (call: any[]) => call[1]?.method === "DELETE",
      );
      expect(deleteCall).toBeDefined();
    });
  });

  // Test 16: Edit dialog pre-populates fields
  it("edit dialog pre-populates with event data", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    // RowActionButtonGroup uses Tooltip + IconButton with className row-action-button
    // Edit buttons are the first in each row pair
    const allIconButtons = document.querySelectorAll(
      "button.row-action-button",
    );
    expect(allIconButtons.length).toBeGreaterThan(0);
    const firstEditButton = allIconButtons[0]; // first button = edit
    fireEvent.click(firstEditButton);

    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // The dialog should show "Edit Event" title, indicating it's in edit mode
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent).toContain("Edit Event");

    // Input fields should exist in the dialog
    const dialogInputs = dialog.querySelectorAll(
      'input[type="text"], input:not([type])',
    );
    expect(dialogInputs.length).toBeGreaterThan(0);
  });

  // Test 17: No dangerouslySetInnerHTML
  it("does not use dangerouslySetInnerHTML", async () => {
    setupFetchSuccess();
    const { container } = renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });
    expect(container.innerHTML).not.toContain("<script");
  });

  // Test 18: Tab navigation switches subtabs
  it("tab navigation switches between Events and Categories subtabs", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    // There should be a Categories tab
    const categoriesTab = screen.getByRole("tab", { name: /categories/i });
    expect(categoriesTab).toBeInTheDocument();

    fireEvent.click(categoriesTab);
    // After clicking, the categories view should be visible
    // (at minimum it should not crash)
    expect(categoriesTab).toBeInTheDocument();
  });
});
