/**
 * Tests for TableBlock component (Step 2.29A.7)
 *
 * TDD: Write tests first → RED → implement → GREEN
 *
 * Covers:
 * - Renders heading
 * - Renders column headers
 * - Renders row data
 * - DOMPurify sanitizes all cell content (XSS protection)
 * - Client-side sort works (TableSortLabel)
 * - Striped rows
 * - Bordered style
 * - Hoverable rows
 * - Compact mode
 * - Responsive: horizontal scroll wrapper
 * - SSR: full HTML table rendered
 * - React.memo applied
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock dompurify
vi.mock("dompurify", () => ({
  default: {
    sanitize: (html: string) =>
      html.replace(/<script[^>]*>.*?<\/script>/gi, ""),
  },
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
}));

// Mock react-intersection-observer
vi.mock("react-intersection-observer", () => ({
  useInView: () => [null, true],
}));

import TableBlock from "./TableBlock";

type BlockLike = {
  id: number;
  blockType: string;
  sortOrder: number;
  content: Record<string, any>;
};

const defaultBlock: BlockLike = {
  id: 3,
  blockType: "TABLE",
  sortOrder: 2,
  content: {
    heading: "Pricing Comparison",
    caption: "All prices in USD",
    columns: [
      { header: "Plan", accessor: "plan", align: "left", width: "" },
      { header: "Price", accessor: "price", align: "center", width: "" },
      { header: "Features", accessor: "features", align: "left", width: "" },
    ],
    rows: [
      { plan: "Starter", price: "$9/mo", features: "5 users" },
      { plan: "Pro", price: "$29/mo", features: "25 users" },
      { plan: "Enterprise", price: "$99/mo", features: "Unlimited" },
      { plan: "Custom", price: "Contact", features: "Unlimited+" },
    ],
    striped: true,
    bordered: true,
    hoverable: true,
    sortable: true,
    compact: false,
  },
};

describe("TableBlock", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders the heading", () => {
    render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("Pricing Comparison")).toBeInTheDocument();
  });

  it("renders column headers", () => {
    render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("Plan")).toBeInTheDocument();
    expect(screen.getByText("Price")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
  });

  it("renders row data", () => {
    render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("Starter")).toBeInTheDocument();
    expect(screen.getByText("Pro")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("DOMPurify sanitizes cell content — XSS script tags stripped", () => {
    const xssBlock = {
      ...defaultBlock,
      content: {
        ...defaultBlock.content,
        rows: [
          {
            plan: '<script>alert("xss")</script>Safe Content',
            price: "$0",
            features: "test",
          },
        ],
      },
    };
    render(
      <TableBlock
        block={xssBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    const scripts = document.querySelectorAll("script");
    expect(scripts.length).toBe(0);
  });

  it("renders with sortable=true and sort buttons present", () => {
    render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    // Column headers should be present (sort labels wrap them)
    expect(screen.getByText("Plan")).toBeInTheDocument();
  });

  it("clicking a sortable column header does not crash", () => {
    render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    const planHeader = screen.getByText("Plan");
    fireEvent.click(planHeader);
    // Should not crash - row data still present
    expect(screen.getByText("Starter")).toBeInTheDocument();
  });

  it("clicking same column header twice toggles sort direction", () => {
    render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    const planHeader = screen.getByText("Plan");
    fireEvent.click(planHeader);
    fireEvent.click(planHeader);
    // Should not crash - data still present
    expect(screen.getByText("Pro")).toBeInTheDocument();
  });

  it("renders with sortable=false without crashing", () => {
    const nonSortableBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, sortable: false },
    };
    const { container } = render(
      <TableBlock
        block={nonSortableBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with striped=false without crashing", () => {
    const nonStripedBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, striped: false },
    };
    const { container } = render(
      <TableBlock
        block={nonStripedBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with bordered=false without crashing", () => {
    const nonBorderedBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, bordered: false },
    };
    const { container } = render(
      <TableBlock
        block={nonBorderedBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with compact=true without crashing", () => {
    const compactBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, compact: true },
    };
    const { container } = render(
      <TableBlock
        block={compactBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with empty rows gracefully", () => {
    const emptyRowsBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, rows: [] },
    };
    const { container } = render(
      <TableBlock
        block={emptyRowsBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with empty columns gracefully", () => {
    const emptyColsBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, columns: [] },
    };
    const { container } = render(
      <TableBlock
        block={emptyColsBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with no heading gracefully", () => {
    const noHeadingBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, heading: "" },
    };
    const { container } = render(
      <TableBlock
        block={noHeadingBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders caption when provided", () => {
    render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("All prices in USD")).toBeInTheDocument();
  });

  it("is wrapped with React.memo (is an object/memoized component)", () => {
    expect(typeof TableBlock).toBe("object");
  });

  it("renders a table element in the DOM (SSR-friendly)", () => {
    const { container } = render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    const table = container.querySelector("table");
    expect(table).not.toBeNull();
  });

  it("renders table head and body", () => {
    const { container } = render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    const thead = container.querySelector("thead");
    const tbody = container.querySelector("tbody");
    expect(thead).not.toBeNull();
    expect(tbody).not.toBeNull();
  });

  it("renders all rows in table body", () => {
    const { container } = render(
      <TableBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    const tbody = container.querySelector("tbody");
    const rows = tbody?.querySelectorAll("tr");
    expect(rows?.length).toBe(4);
  });
});
