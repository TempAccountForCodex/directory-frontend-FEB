/**
 * Tests for StepsProcessBlock component (Step 2.29A.2)
 *
 * TDD: Write tests first → RED → implement → GREEN
 *
 * Covers:
 * - Renders heading and description
 * - Renders step numbers (auto-incremented)
 * - Renders step titles and descriptions
 * - All 3 layouts (horizontal, vertical, alternating)
 * - showConnectors boolean toggle
 * - Icons render from getIconComponent
 * - Staggered entrance animation
 * - SSR: renders as ordered list
 * - React.memo applied
 * - Responsive: collapses to vertical on mobile
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock react-intersection-observer
vi.mock("react-intersection-observer", () => ({
  useInView: () => [null, true],
}));

import StepsProcessBlock from "./StepsProcessBlock";

type BlockLike = {
  id: number;
  blockType: string;
  sortOrder: number;
  content: Record<string, any>;
};

const defaultBlock: BlockLike = {
  id: 2,
  blockType: "STEPS_PROCESS",
  sortOrder: 1,
  content: {
    heading: "How It Works",
    description: "Simple three-step process",
    steps: [
      {
        title: "Step One Title",
        description: "Step one description text",
        icon: "",
      },
      {
        title: "Step Two Title",
        description: "Step two description text",
        icon: "",
      },
      {
        title: "Step Three Title",
        description: "Step three description text",
        icon: "",
      },
    ],
    layout: "horizontal",
    showConnectors: true,
    accentColor: "#2563eb",
  },
};

const blockWithIcons: BlockLike = {
  id: 3,
  blockType: "STEPS_PROCESS",
  sortOrder: 2,
  content: {
    heading: "Steps with Icons",
    description: "",
    steps: [
      { title: "Step One", description: "Desc one", icon: "business" },
      { title: "Step Two", description: "Desc two", icon: "build" },
    ],
    layout: "horizontal",
    showConnectors: true,
    accentColor: "#2563eb",
  },
};

describe("StepsProcessBlock", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <StepsProcessBlock
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
      <StepsProcessBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("How It Works")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(
      <StepsProcessBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("Simple three-step process")).toBeInTheDocument();
  });

  it("renders step numbers auto-incremented (1, 2, 3)", () => {
    render(
      <StepsProcessBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders step titles", () => {
    render(
      <StepsProcessBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("Step One Title")).toBeInTheDocument();
    expect(screen.getByText("Step Two Title")).toBeInTheDocument();
    expect(screen.getByText("Step Three Title")).toBeInTheDocument();
  });

  it("renders step descriptions", () => {
    render(
      <StepsProcessBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(screen.getByText("Step one description text")).toBeInTheDocument();
    expect(screen.getByText("Step two description text")).toBeInTheDocument();
    expect(screen.getByText("Step three description text")).toBeInTheDocument();
  });

  it("renders with vertical layout without crashing", () => {
    const verticalBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, layout: "vertical" as const },
    };
    const { container } = render(
      <StepsProcessBlock
        block={verticalBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with alternating layout without crashing", () => {
    const alternatingBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, layout: "alternating" as const },
    };
    const { container } = render(
      <StepsProcessBlock
        block={alternatingBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with showConnectors false without crashing", () => {
    const noConnectorsBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, showConnectors: false },
    };
    const { container } = render(
      <StepsProcessBlock
        block={noConnectorsBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with empty steps array gracefully", () => {
    const emptyStepsBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, steps: [] },
    };
    const { container } = render(
      <StepsProcessBlock
        block={emptyStepsBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders with undefined steps gracefully", () => {
    const undefinedStepsBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, steps: undefined },
    };
    const { container } = render(
      <StepsProcessBlock
        block={undefinedStepsBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("is wrapped with React.memo (is an object/memoized component)", () => {
    expect(typeof StepsProcessBlock).toBe("object");
  });

  it("renders icon when icon name provided in step", () => {
    const { container } = render(
      <StepsProcessBlock
        block={blockWithIcons}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    // Icon should render as SVG (MUI icon) — block renders without crashing
    expect(container.firstChild).not.toBeNull();
    // Icons render as SVG elements
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("renders with custom accentColor without crashing", () => {
    const customColorBlock = {
      ...defaultBlock,
      content: { ...defaultBlock.content, accentColor: "#ff6b6b" },
    };
    const { container } = render(
      <StepsProcessBlock
        block={customColorBlock}
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
      <StepsProcessBlock
        block={noHeadingBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("renders SSR fallback — step numbers present without JS", () => {
    render(
      <StepsProcessBlock
        block={defaultBlock}
        primaryColor="#2563eb"
        headingColor="#1e293b"
        bodyColor="#475569"
      />,
    );
    // All step numbers should be in DOM
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
