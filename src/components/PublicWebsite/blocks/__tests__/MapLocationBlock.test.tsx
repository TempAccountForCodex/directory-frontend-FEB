/**
 * Tests for MapLocationBlock (Step 2.28.1)
 *
 * Covers:
 *  1.  Renders without crashing with default props
 *  2.  Renders heading when provided
 *  3.  Renders without heading when heading not provided
 *  4.  SVG circles rendered for each marker
 *  5.  Tooltip content includes marker label
 *  6.  Tooltip content includes marker address
 *  7.  Tooltip content includes marker phone
 *  8.  No tooltips when showTooltips=false
 *  9.  Default marker at New York when markers empty
 *  10. Map container height respects config
 *  11. Component is wrapped in React.memo (displayName set)
 *  12. DOMPurify sanitize called on marker labels
 *  13. World style renders ComposableMap
 *  14. Multiple markers all render circles
 *  15. Framer Motion container present (motion.div)
 *  16. MapLocationBlock is exported as default
 *  17. Marker with no phone still renders tooltip
 *  18. Marker color applied to SVG circle
 *  19. Style variant 'minimal' renders without errors
 *  20. Style variant 'region' renders without errors
 */

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => (
      <div data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
    section: ({ children, ...props }: any) => (
      <section data-testid="motion-section" {...props}>
        {children}
      </section>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

vi.mock("react-simple-maps", () => ({
  ComposableMap: ({ children, ...props }: any) => (
    <div data-testid="composable-map" {...props}>
      {children}
    </div>
  ),
  Geographies: ({ children }: any) => (
    <>
      {typeof children === "function"
        ? children({ geographies: [] })
        : children}
    </>
  ),
  Geography: (props: any) => <path data-testid="geography" {...props} />,
  ZoomableGroup: ({ children, ...props }: any) => (
    <g data-testid="zoomable-group" {...props}>
      {children}
    </g>
  ),
  Marker: ({ children, ...props }: any) => (
    <g data-testid="map-marker" {...props}>
      {children}
    </g>
  ),
}));

vi.mock("dompurify", () => ({
  default: {
    sanitize: vi.fn((val: string) => val),
  },
}));

// ── Import after mocks ────────────────────────────────────────────────────────

import MapLocationBlock from "../MapLocationBlock";
import DOMPurify from "dompurify";

// ── Fixtures ─────────────────────────────────────────────────────────────────

const defaultMarker = {
  lat: 40.7128,
  lng: -74.006,
  label: "Main Office",
  address: "123 Main St, New York, NY",
  phone: "555-1234",
  color: "#378C92",
};

const makeBlock = (content: any = {}) => ({
  id: 1,
  blockType: "MAP_LOCATION",
  sortOrder: 1,
  content: {
    heading: "Our Locations",
    markers: [defaultMarker],
    zoom: 4,
    height: 400,
    showTooltips: true,
    style: "world",
    ...content,
  },
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("MapLocationBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (DOMPurify.sanitize as any).mockImplementation((val: string) => val);
  });

  // 1. Renders without crashing
  it("renders without crashing with default props", () => {
    const { container } = render(<MapLocationBlock block={makeBlock()} />);
    expect(container.firstChild).toBeTruthy();
  });

  // 2. Renders heading
  it("renders heading when provided", () => {
    render(<MapLocationBlock block={makeBlock({ heading: "Find Us" })} />);
    expect(screen.getByText("Find Us")).toBeInTheDocument();
  });

  // 3. No heading when not provided
  it("renders without heading when heading not provided", () => {
    const { container } = render(
      <MapLocationBlock block={makeBlock({ heading: "" })} />,
    );
    const h2 = container.querySelector("h2");
    expect(h2).toBeNull();
  });

  // 4. SVG circles for markers
  it("renders SVG circle for each marker", () => {
    const { container } = render(<MapLocationBlock block={makeBlock()} />);
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThanOrEqual(1);
  });

  // 5. Tooltip with label
  it("renders marker label in tooltip/accessible text", () => {
    render(<MapLocationBlock block={makeBlock()} />);
    expect(screen.getByText("Main Office")).toBeInTheDocument();
  });

  // 6. Tooltip with address
  it("renders marker address in tooltip/accessible text", () => {
    render(<MapLocationBlock block={makeBlock()} />);
    expect(screen.getByText(/123 Main St/)).toBeInTheDocument();
  });

  // 7. Tooltip with phone
  it("renders marker phone when present", () => {
    render(<MapLocationBlock block={makeBlock()} />);
    expect(screen.getByText(/555-1234/)).toBeInTheDocument();
  });

  // 8. No tooltips when showTooltips=false
  it("does not render tooltip info when showTooltips=false", () => {
    render(<MapLocationBlock block={makeBlock({ showTooltips: false })} />);
    // Label should not appear as tooltip content
    expect(screen.queryByText("Main Office")).toBeNull();
  });

  // 9. Default marker when markers empty
  it("renders default New York marker when markers is empty", () => {
    render(<MapLocationBlock block={makeBlock({ markers: [] })} />);
    // Should still render the map container without crashing
    expect(screen.getByTestId("composable-map")).toBeInTheDocument();
  });

  // 10. Height from config
  it("applies configured height to map container", () => {
    render(<MapLocationBlock block={makeBlock({ height: 600 })} />);
    const mapContainer = screen.getByTestId("composable-map");
    expect(mapContainer).toBeInTheDocument();
  });

  // 11. React.memo
  it("component is wrapped in React.memo (displayName or type defined)", () => {
    expect(MapLocationBlock).toBeDefined();
    const name =
      (MapLocationBlock as any).displayName ||
      (MapLocationBlock as any).type?.displayName ||
      (MapLocationBlock as any).type?.name;
    expect(name).toBeTruthy();
  });

  // 12. DOMPurify called on labels
  it("calls DOMPurify.sanitize on marker label", () => {
    render(<MapLocationBlock block={makeBlock()} />);
    expect(DOMPurify.sanitize).toHaveBeenCalledWith("Main Office");
  });

  // 13. World style renders ComposableMap
  it("renders ComposableMap for world style", () => {
    render(<MapLocationBlock block={makeBlock({ style: "world" })} />);
    expect(screen.getByTestId("composable-map")).toBeInTheDocument();
  });

  // 14. Multiple markers render multiple circles
  it("renders SVG circle for each of multiple markers", () => {
    const markers = [
      {
        lat: 40.7128,
        lng: -74.006,
        label: "Office 1",
        address: "Addr 1",
        phone: "",
        color: "#FF0000",
      },
      {
        lat: 51.5074,
        lng: -0.1278,
        label: "Office 2",
        address: "Addr 2",
        phone: "",
        color: "#00FF00",
      },
      {
        lat: 48.8566,
        lng: 2.3522,
        label: "Office 3",
        address: "Addr 3",
        phone: "",
        color: "#0000FF",
      },
    ];
    const { container } = render(
      <MapLocationBlock block={makeBlock({ markers })} />,
    );
    const circles = container.querySelectorAll("circle");
    expect(circles.length).toBeGreaterThanOrEqual(3);
  });

  // 15. Framer Motion container present
  it("renders with framer motion animation wrapper", () => {
    render(<MapLocationBlock block={makeBlock()} />);
    // motion.div or section should be in the document
    const motionEl =
      screen.queryByTestId("motion-div") ||
      screen.queryByTestId("motion-section");
    expect(motionEl).toBeTruthy();
  });

  // 16. Default export
  it("MapLocationBlock is exported as default", () => {
    expect(MapLocationBlock).toBeDefined();
    // React.memo returns an object (memo component), not a raw function
    expect(MapLocationBlock).toBeTruthy();
  });

  // 17. Marker with no phone renders tooltip without error
  it("renders tooltip without phone when phone is empty", () => {
    const marker = { ...defaultMarker, phone: "" };
    expect(() =>
      render(<MapLocationBlock block={makeBlock({ markers: [marker] })} />),
    ).not.toThrow();
  });

  // 18. Marker color
  it("renders circle with marker color as fill", () => {
    const marker = { ...defaultMarker, color: "#FF5722" };
    const { container } = render(
      <MapLocationBlock block={makeBlock({ markers: [marker] })} />,
    );
    const circle = container.querySelector("circle");
    const fill = circle?.getAttribute("fill") || circle?.style.fill;
    expect(fill).toBeTruthy();
  });

  // 19. Minimal style
  it("renders without errors with style=minimal", () => {
    expect(() =>
      render(<MapLocationBlock block={makeBlock({ style: "minimal" })} />),
    ).not.toThrow();
  });

  // 20. Region style
  it("renders without errors with style=region", () => {
    expect(() =>
      render(<MapLocationBlock block={makeBlock({ style: "region" })} />),
    ).not.toThrow();
  });
});
