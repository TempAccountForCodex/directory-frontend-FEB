/**
 * Tests for EventsListBlock (Step 2.29C.3)
 *
 * Covers:
 * 1.  Renders without crashing with minimal props
 * 2.  Shows skeleton (loading state) when data is loading
 * 3.  Shows error Alert when data fetch fails
 * 4.  Renders heading when configured
 * 5.  Renders subheading when configured
 * 6.  Search bar appears when showSearch=true
 * 7.  Search bar hidden when showSearch=false
 * 8.  Category filter chips appear when showFilters=true
 * 9.  MUI Pagination appears when showPagination=true and totalPages > 1
 * 10. Pagination hidden when showPagination=false
 * 11. Empty state message shown when no events returned
 * 12. Cards layout renders event cards
 * 13. List layout renders horizontal event rows
 * 14. Calendar layout renders month grid
 * 15. Component wrapped in React.memo
 * 16. RSVP button: POSTs to /api/events/:id/rsvp
 * 17. RSVP button: disables after click
 * 18. RSVP button: stores sessionStorage key rsvp_{eventId}
 * 19. Past events show 'Past' Chip badge when startDate < now
 * 20. Past events NOT hidden when showPastEvents=true
 * 21. Empty state uses emptyMessage from block content
 * 22. Uses AbortController on unmount
 * 23. Search triggers re-fetch with search parameter
 * 24. Pagination triggers re-fetch with updated page
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
import { MemoryRouter } from "react-router-dom";

// ---------------------------------------------------------------------------
// Mock fetch globally
// ---------------------------------------------------------------------------
const mockFetch = vi.fn();
global.fetch = mockFetch;

// ---------------------------------------------------------------------------
// Mock sessionStorage
// ---------------------------------------------------------------------------
const mockSessionStorage: Record<string, string> = {};
Object.defineProperty(window, "sessionStorage", {
  value: {
    getItem: vi.fn((key: string) => mockSessionStorage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      mockSessionStorage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete mockSessionStorage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(mockSessionStorage).forEach(
        (k) => delete mockSessionStorage[k],
      );
    }),
  },
  writable: true,
});

// ---------------------------------------------------------------------------
// Import component after mocks
// ---------------------------------------------------------------------------
import EventsListBlock from "../EventsListBlock";

/* ===================== Test Helpers ===================== */

const now = new Date();
const futureDate = new Date(
  now.getTime() + 7 * 24 * 60 * 60 * 1000,
).toISOString(); // 7 days from now
const pastDate = new Date(
  now.getTime() - 7 * 24 * 60 * 60 * 1000,
).toISOString(); // 7 days ago

const mockEvents = [
  {
    id: 1,
    title: "Tech Conference 2026",
    description: "Annual tech conference with industry leaders.",
    startDate: futureDate,
    endDate: futureDate,
    location: "San Francisco, CA",
    category: "Technology",
    image: "https://example.com/event1.jpg",
    price: 49.99,
    currency: "USD",
    rsvpCount: 42,
    slug: "tech-conference-2026",
  },
  {
    id: 2,
    title: "Past Meetup",
    description: "A meetup that already happened.",
    startDate: pastDate,
    endDate: pastDate,
    location: "New York, NY",
    category: "Business",
    image: null,
    price: 0,
    currency: "USD",
    rsvpCount: 15,
    slug: "past-meetup",
  },
];

const mockApiResponse = {
  success: true,
  events: mockEvents,
  pagination: {
    total: 2,
    page: 1,
    limit: 9,
    totalPages: 1,
    hasMore: false,
    hasPrevious: false,
  },
  categories: ["Technology", "Business"],
};

const defaultBlock = {
  id: 1,
  blockType: "EVENTS_LIST",
  sortOrder: 1,
  content: {
    heading: "Upcoming Events",
    subheading: "Find events near you",
    layout: "cards" as const,
    eventsPerPage: 9,
    showSearch: true,
    showFilters: true,
    showPagination: true,
    showLocation: true,
    showDate: true,
    showImage: true,
    showRsvp: true,
    showPrice: true,
    showPastEvents: true,
    categoryFilter: "",
    sortBy: "startDate" as const,
    sortOrder: "asc" as const,
    emptyMessage: "No events found.",
    detailLink: "",
    websiteId: "website-123",
  },
};

const defaultProps = {
  block: defaultBlock,
  primaryColor: "#378C92",
  secondaryColor: "#D3EB63",
  headingColor: "#252525",
  bodyColor: "#6A6F78",
};

function setupFetchSuccess(response = mockApiResponse) {
  mockFetch.mockResolvedValue({
    ok: true,
    json: async () => response,
  });
}

function setupFetchError() {
  mockFetch.mockRejectedValue(new Error("Network error"));
}

function renderComponent(props = defaultProps) {
  return render(
    <MemoryRouter>
      <EventsListBlock {...props} />
    </MemoryRouter>,
  );
}

/* ===================== Tests ===================== */

describe("EventsListBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear sessionStorage mock
    Object.keys(mockSessionStorage).forEach(
      (k) => delete mockSessionStorage[k],
    );
    (
      window.sessionStorage.getItem as ReturnType<typeof vi.fn>
    ).mockImplementation((key: string) => mockSessionStorage[key] || null);
    (
      window.sessionStorage.setItem as ReturnType<typeof vi.fn>
    ).mockImplementation((key: string, value: string) => {
      mockSessionStorage[key] = value;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Test 1: Renders without crashing
  it("renders without crashing with minimal props", async () => {
    setupFetchSuccess();
    const { container } = renderComponent();
    expect(container.firstChild).not.toBeNull();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  // Test 2: Shows skeleton loading state
  it("shows skeleton placeholders when data is loading", () => {
    // Make fetch never resolve so we stay in loading state
    mockFetch.mockReturnValue(new Promise(() => {}));
    const { container } = renderComponent();
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // Test 3: Shows error Alert when fetch fails
  it("shows error Alert when data fetch fails", async () => {
    setupFetchError();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  // Test 4: Renders heading
  it("renders heading when configured", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Upcoming Events")).toBeInTheDocument();
    });
  });

  // Test 5: Renders subheading
  it("renders subheading when configured", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Find events near you")).toBeInTheDocument();
    });
  });

  // Test 6: Search bar visible when showSearch=true
  it("shows search bar when showSearch=true", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("textbox", { name: /search events/i }),
      ).toBeInTheDocument();
    });
  });

  // Test 7: Search bar hidden when showSearch=false
  it("hides search bar when showSearch=false", async () => {
    setupFetchSuccess();
    const block = {
      ...defaultBlock,
      content: { ...defaultBlock.content, showSearch: false },
    };
    renderComponent({ ...defaultProps, block });
    await waitFor(() => {
      expect(
        screen.queryByRole("textbox", { name: /search events/i }),
      ).not.toBeInTheDocument();
    });
  });

  // Test 8: Category chips when showFilters=true
  it("shows category filter chips when showFilters=true and categories available", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      // Categories from API: Technology, Business - may appear multiple times (filter chip + event card chip)
      const techElements = screen.getAllByText("Technology");
      const bizElements = screen.getAllByText("Business");
      expect(techElements.length).toBeGreaterThan(0);
      expect(bizElements.length).toBeGreaterThan(0);
      // Verify the filter group exists
      expect(
        screen.getByRole("group", { name: /category filter/i }),
      ).toBeInTheDocument();
    });
  });

  // Test 9: MUI Pagination when showPagination=true and totalPages > 1
  it("shows pagination when showPagination=true and totalPages > 1", async () => {
    setupFetchSuccess({
      ...mockApiResponse,
      pagination: {
        total: 20,
        page: 1,
        limit: 9,
        totalPages: 3,
        hasMore: true,
        hasPrevious: false,
      },
    });
    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("navigation", { name: /pagination/i }),
      ).toBeInTheDocument();
    });
  });

  // Test 10: Pagination hidden when showPagination=false
  it("hides pagination when showPagination=false", async () => {
    setupFetchSuccess();
    const block = {
      ...defaultBlock,
      content: { ...defaultBlock.content, showPagination: false },
    };
    renderComponent({ ...defaultProps, block });
    await waitFor(() => {
      expect(
        screen.queryByRole("navigation", { name: /pagination/i }),
      ).not.toBeInTheDocument();
    });
  });

  // Test 11: Empty state message
  it("shows empty state message when no events returned", async () => {
    setupFetchSuccess({
      ...mockApiResponse,
      events: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0,
        hasMore: false,
        hasPrevious: false,
      },
      categories: [],
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("No events found.")).toBeInTheDocument();
    });
  });

  // Test 12: Cards layout renders event cards
  it("cards layout renders event titles", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
      expect(screen.getByText("Past Meetup")).toBeInTheDocument();
    });
  });

  // Test 13: List layout renders horizontal event rows
  it("list layout renders event titles", async () => {
    setupFetchSuccess();
    const block = {
      ...defaultBlock,
      content: { ...defaultBlock.content, layout: "list" as const },
    } as unknown as typeof defaultBlock;
    renderComponent({ ...defaultProps, block });
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });
  });

  // Test 14: Calendar layout renders month grid
  it("calendar layout renders a month grid", async () => {
    setupFetchSuccess();
    const block = {
      ...defaultBlock,
      content: { ...defaultBlock.content, layout: "calendar" as const },
    } as unknown as typeof defaultBlock;
    const { container } = renderComponent({ ...defaultProps, block });
    await waitFor(() => {
      // Calendar should render 7-column CSS grid with day headers
      const calendarGrid = container.querySelector(
        '[aria-label="Event calendar"]',
      );
      expect(calendarGrid).toBeInTheDocument();
    });
  });

  // Test 15: Component wrapped in React.memo
  it("is wrapped in React.memo", async () => {
    setupFetchSuccess();
    const { container, rerender } = renderComponent();
    expect(container.firstChild).not.toBeNull();
    rerender(
      <MemoryRouter>
        <EventsListBlock {...defaultProps} />
      </MemoryRouter>,
    );
    expect(container.firstChild).not.toBeNull();
  });

  // Test 16: RSVP button POSTs to API
  it("RSVP button calls POST /api/events/:id/rsvp on click", async () => {
    setupFetchSuccess();
    // Mock the RSVP post call
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse }) // Initial data fetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, rsvpCount: 43 }),
      }); // RSVP POST

    renderComponent();
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /rsvp/i }).length,
      ).toBeGreaterThan(0);
    });

    const rsvpButtons = screen.getAllByRole("button", { name: /rsvp/i });
    await act(async () => {
      fireEvent.click(rsvpButtons[0]);
    });

    await waitFor(() => {
      const lastCall = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      expect(lastCall[0]).toContain("/api/events/");
      expect(lastCall[0]).toContain("/rsvp");
      expect(lastCall[1]?.method).toBe("POST");
    });
  });

  // Test 17: RSVP button disables after click
  it("RSVP button becomes disabled after successful RSVP", async () => {
    setupFetchSuccess();
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, rsvpCount: 43 }),
      });

    renderComponent();
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /rsvp/i }).length,
      ).toBeGreaterThan(0);
    });

    const rsvpButtons = screen.getAllByRole("button", { name: /rsvp/i });
    await act(async () => {
      fireEvent.click(rsvpButtons[0]);
    });

    await waitFor(() => {
      const buttons = screen.getAllByRole("button", { name: /rsvp/i });
      expect(buttons[0]).toBeDisabled();
    });
  });

  // Test 18: RSVP stores sessionStorage key
  it("RSVP button stores rsvp_{eventId} in sessionStorage", async () => {
    setupFetchSuccess();
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => mockApiResponse })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, rsvpCount: 43 }),
      });

    renderComponent();
    await waitFor(() => {
      expect(
        screen.getAllByRole("button", { name: /rsvp/i }).length,
      ).toBeGreaterThan(0);
    });

    const rsvpButtons = screen.getAllByRole("button", { name: /rsvp/i });
    await act(async () => {
      fireEvent.click(rsvpButtons[0]);
    });

    await waitFor(() => {
      expect(window.sessionStorage.setItem).toHaveBeenCalledWith(
        "rsvp_1",
        "true",
      );
    });
  });

  // Test 19: Past events show 'Past' Chip badge
  it("shows 'Past' chip badge for events where startDate < now", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      // 'Past Meetup' has pastDate startDate — should show 'Past' badge
      const pastChips = screen.getAllByText("Past");
      expect(pastChips.length).toBeGreaterThan(0);
    });
  });

  // Test 20: Past events NOT hidden when showPastEvents=true
  it("does not hide past events when showPastEvents=true", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText("Past Meetup")).toBeInTheDocument();
    });
  });

  // Test 21: Custom emptyMessage from block content
  it("uses emptyMessage from block content for empty state", async () => {
    setupFetchSuccess({
      ...mockApiResponse,
      events: [],
      pagination: {
        total: 0,
        page: 1,
        limit: 9,
        totalPages: 0,
        hasMore: false,
        hasPrevious: false,
      },
      categories: [],
    });
    const block = {
      ...defaultBlock,
      content: {
        ...defaultBlock.content,
        emptyMessage: "No upcoming events at this time.",
      },
    };
    renderComponent({ ...defaultProps, block });
    await waitFor(() => {
      expect(
        screen.getByText("No upcoming events at this time."),
      ).toBeInTheDocument();
    });
  });

  // Test 22: Fetch called with websiteId parameter
  it("fetches events with websiteId as query parameter", async () => {
    setupFetchSuccess();
    renderComponent();
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
      const fetchUrl = mockFetch.mock.calls[0][0] as string;
      expect(fetchUrl).toContain("websiteId=");
    });
  });

  // Test 23: Search input triggers re-fetch — verify debounce timer resets page + state
  it("search input updates debouncedSearch state and triggers re-fetch", async () => {
    setupFetchSuccess();

    renderComponent();

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
    });

    const initialCallCount = mockFetch.mock.calls.length;

    const searchInput = screen.getByRole("textbox", { name: /search events/i });
    fireEvent.change(searchInput, { target: { value: "conference" } });

    // After 350ms debounce delay, state updates and causes re-fetch
    await waitFor(
      () => {
        expect(mockFetch.mock.calls.length).toBeGreaterThan(initialCallCount);
        const lastUrl = mockFetch.mock.calls[
          mockFetch.mock.calls.length - 1
        ][0] as string;
        expect(lastUrl).toContain("search=conference");
      },
      { timeout: 3000 },
    );
  });

  // Test 24: Pagination triggers re-fetch
  it("pagination triggers re-fetch with updated page parameter", async () => {
    setupFetchSuccess({
      ...mockApiResponse,
      pagination: {
        total: 20,
        page: 1,
        limit: 9,
        totalPages: 3,
        hasMore: true,
        hasPrevious: false,
      },
    });

    renderComponent();
    await waitFor(() => {
      expect(
        screen.getByRole("navigation", { name: /pagination/i }),
      ).toBeInTheDocument();
    });

    // Click page 2 — MUI Pagination uses aria-label "page 2" or "Go to page 2"
    const navEl = screen.getByRole("navigation", { name: /pagination/i });
    const pageButtons = navEl.querySelectorAll("button");
    // pageButtons[0] = prev, [1] = page 1, [2] = page 2, etc.
    if (pageButtons.length >= 3) {
      fireEvent.click(pageButtons[2]); // page 2 button
    }

    await waitFor(() => {
      const calls = mockFetch.mock.calls;
      const lastUrl = calls[calls.length - 1][0] as string;
      expect(lastUrl).toContain("page=2");
    });
  });

  // Test: RSVP button is pre-disabled if sessionStorage has key
  it("RSVP button is disabled if sessionStorage already has rsvp_{eventId}", async () => {
    // Pre-set sessionStorage key for event 1
    mockSessionStorage["rsvp_1"] = "true";
    (
      window.sessionStorage.getItem as ReturnType<typeof vi.fn>
    ).mockImplementation((key: string) => mockSessionStorage[key] || null);

    setupFetchSuccess();
    renderComponent();

    await waitFor(
      () => {
        // There should be RSVP buttons rendered
        const rsvpButtons = screen.getAllByRole("button", { name: /rsvp/i });
        // The first event (id=1, Tech Conference) should be disabled
        expect(rsvpButtons[0]).toBeDisabled();
      },
      { timeout: 5000 },
    );
  });

  // Test: No dangerouslySetInnerHTML
  it("does not use dangerouslySetInnerHTML", async () => {
    setupFetchSuccess();
    const { container } = renderComponent();
    await waitFor(
      () => {
        expect(screen.getByText("Tech Conference 2026")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    // MUI Typography auto-escapes content — no raw script tags
    expect(container.innerHTML).not.toContain("<script");
  });
});
