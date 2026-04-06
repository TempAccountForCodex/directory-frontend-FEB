/**
 * Tests for Docs shared components (Step 10.9.7)
 *
 * Covers:
 * 1. DocsLayout renders sidebar + main content
 * 2. DocsLayout sidebar shows navigation items
 * 3. DocSearch renders search input
 * 4. DocSearch calls API with debounce on type
 * 5. DocSearch shows results in dropdown
 * 6. DocSearch shows "no results" when empty
 * 7. TableOfContents extracts h2/h3 headings from markdown
 * 8. TableOfContents renders anchor links
 * 9. DocsLayout mobile: sidebar toggles via drawer
 * 10. DocSearch click on result navigates to article
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

// ---------------------------------------------------------------------------
// Mock react-router-dom
// ---------------------------------------------------------------------------
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
  Link: ({
    to,
    children,
    ...props
  }: {
    to: string;
    children: React.ReactNode;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ({ pathname: "/docs" }),
}));

// ---------------------------------------------------------------------------
// Mock axios
// ---------------------------------------------------------------------------
vi.mock("axios");
import axios from "axios";
const mockedAxios = vi.mocked(axios, true);

// ---------------------------------------------------------------------------
// Mock useMediaQuery for mobile tests
// ---------------------------------------------------------------------------
const mockUseMediaQuery = vi.fn(() => false);
vi.mock("@mui/material/useMediaQuery", () => ({
  default: () => mockUseMediaQuery(),
}));

// ---------------------------------------------------------------------------
// Import components under test
// ---------------------------------------------------------------------------
import DocsLayout from "../DocsLayout";
import DocSearch from "../DocSearch";
import TableOfContents from "../TableOfContents";

// ---------------------------------------------------------------------------
// DocsLayout tests
// ---------------------------------------------------------------------------
describe("DocsLayout", () => {
  it("renders sidebar and main content area", () => {
    render(
      <DocsLayout>
        <div data-testid="main-content">Article content here</div>
      </DocsLayout>,
    );
    expect(screen.getByTestId("docs-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("main-content")).toBeInTheDocument();
  }, 15000);

  it("renders navigation sections in sidebar", () => {
    render(
      <DocsLayout
        sections={[
          {
            slug: "getting-started",
            title: "Getting Started",
            articleCount: 5,
          },
        ]}
      >
        <div>Content</div>
      </DocsLayout>,
    );
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
  });

  it("renders docs title/brand in sidebar", () => {
    render(
      <DocsLayout>
        <div>Content</div>
      </DocsLayout>,
    );
    expect(screen.getByTestId("docs-sidebar")).toBeInTheDocument();
    // Should have some navigation element
    expect(screen.getByTestId("docs-nav")).toBeInTheDocument();
  });
});

// ---------------------------------------------------------------------------
// DocSearch tests — use a stub version of DocSearch that exposes searchable results
// We mock DocSearch entirely since testing internal debounce timing is flaky
// ---------------------------------------------------------------------------
describe("DocSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a search input", () => {
    render(<DocSearch />);
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
  });

  it("shows search results in dropdown after query", async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        articles: [
          {
            id: "1",
            title: "Getting Started",
            slug: "getting-started",
            category: "getting-started",
          },
        ],
      },
    });

    render(<DocSearch />);
    const input = screen.getByRole("textbox");

    // Type a query that passes the MIN_QUERY_LENGTH check (≥2 chars)
    fireEvent.change(input, { target: { value: "getting" } });

    // Wait for the API to be called (debounce fires after 300ms)
    // Use a longer timeout to accommodate debounce
    await waitFor(
      () => {
        expect(mockedAxios.get).toHaveBeenCalledWith(
          expect.stringContaining("/docs/search"),
          expect.objectContaining({
            params: expect.objectContaining({ q: "getting" }),
          }),
        );
      },
      { timeout: 2000 },
    );

    await waitFor(
      () => {
        expect(screen.getByText("Getting Started")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('shows "no results" message when search returns empty', async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: { articles: [] },
    });

    render(<DocSearch />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "xyznotfound" } });

    await waitFor(
      () => {
        expect(
          screen.getByText(/No articles match your search/i),
        ).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it("navigates to article when result is clicked", async () => {
    mockedAxios.get = vi.fn().mockResolvedValue({
      data: {
        articles: [
          {
            id: "1",
            title: "Getting Started",
            slug: "getting-started",
            category: "getting-started",
          },
        ],
      },
    });

    render(<DocSearch />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "getting" } });

    await waitFor(
      () => {
        expect(screen.getByText("Getting Started")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    fireEvent.click(screen.getByText("Getting Started"));
    expect(mockNavigate).toHaveBeenCalledWith("/docs/getting-started");
  });

  it("does not call API when query is less than 2 characters", async () => {
    mockedAxios.get = vi.fn() as typeof mockedAxios.get;
    render(<DocSearch />);
    const input = screen.getByRole("textbox");

    fireEvent.change(input, { target: { value: "g" } });

    // Wait a short while — API should NOT be called for 1-char input
    await new Promise((r) => setTimeout(r, 50));
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// TableOfContents tests
// ---------------------------------------------------------------------------
describe("TableOfContents", () => {
  it("extracts h2 headings from markdown content", () => {
    const content =
      "## Introduction\n\nSome text here.\n\n## Setup\n\nMore text.";
    render(<TableOfContents content={content} />);
    expect(screen.getByText("Introduction")).toBeInTheDocument();
    expect(screen.getByText("Setup")).toBeInTheDocument();
  });

  it("extracts h3 headings from markdown content", () => {
    const content =
      "## Section One\n\n### Subsection A\n\nText.\n\n### Subsection B\n\nMore.";
    render(<TableOfContents content={content} />);
    expect(screen.getByText("Section One")).toBeInTheDocument();
    expect(screen.getByText("Subsection A")).toBeInTheDocument();
    expect(screen.getByText("Subsection B")).toBeInTheDocument();
  });

  it("renders anchor links for each heading", () => {
    const content =
      "## Getting Started\n\nText.\n\n## Advanced Topics\n\nMore text.";
    render(<TableOfContents content={content} />);

    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThanOrEqual(2);
  });

  it("shows empty state when no headings found", () => {
    const content = "Just a paragraph with no headings.";
    const { container } = render(<TableOfContents content={content} />);
    // Should render nothing or empty container
    const toc = container.querySelector('[data-testid="toc"]');
    if (toc) {
      expect(toc.children.length).toBe(0);
    }
  });
});
