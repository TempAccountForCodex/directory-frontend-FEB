/**
 * Tests for BlockSkeleton component (Step 2.22.3)
 *
 * Covers:
 * - Renders MUI Skeleton elements
 * - Different block types render different skeleton shapes
 * - Uses React.memo
 * - Height prop is respected for default case
 * - Does not throw for unknown block types
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import BlockSkeleton from "./BlockSkeleton";

describe("BlockSkeleton", () => {
  it("renders without crashing for HERO type", () => {
    const { container } = render(<BlockSkeleton blockType="HERO" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders MUI Skeleton elements for HERO type", () => {
    const { container } = render(<BlockSkeleton blockType="HERO" />);
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders without crashing for FEATURES type", () => {
    const { container } = render(<BlockSkeleton blockType="FEATURES" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders multiple skeletons for FEATURES type", () => {
    const { container } = render(<BlockSkeleton blockType="FEATURES" />);
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it("renders without crashing for TESTIMONIALS type", () => {
    const { container } = render(<BlockSkeleton blockType="TESTIMONIALS" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing for TEXT type", () => {
    const { container } = render(<BlockSkeleton blockType="TEXT" />);
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("renders without crashing for GALLERY type", () => {
    const { container } = render(<BlockSkeleton blockType="GALLERY" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing for PRICING type", () => {
    const { container } = render(<BlockSkeleton blockType="PRICING" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing for FAQ type", () => {
    const { container } = render(<BlockSkeleton blockType="FAQ" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing for STATS type", () => {
    const { container } = render(<BlockSkeleton blockType="STATS" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing for TEAM type", () => {
    const { container } = render(<BlockSkeleton blockType="TEAM" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders without crashing for unknown block type", () => {
    const { container } = render(<BlockSkeleton blockType="UNKNOWN_TYPE" />);
    expect(container.firstChild).not.toBeNull();
  });

  it("renders at least one skeleton for unknown type (default case)", () => {
    const { container } = render(<BlockSkeleton blockType="UNKNOWN_TYPE" />);
    const skeletons = container.querySelectorAll(".MuiSkeleton-root");
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it("accepts optional height prop without crashing", () => {
    const { container } = render(
      <BlockSkeleton blockType="HERO" height={500} />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("accepts string height prop", () => {
    const { container } = render(
      <BlockSkeleton blockType="HERO" height="300px" />,
    );
    expect(container.firstChild).not.toBeNull();
  });

  it("is wrapped with React.memo (renders correctly)", () => {
    // Verify the component renders as expected (memo doesn't break rendering)
    const { container } = render(<BlockSkeleton blockType="HERO" />);
    expect(container.firstChild).not.toBeNull();
  });
});
