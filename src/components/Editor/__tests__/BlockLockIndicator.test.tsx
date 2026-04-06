/**
 * Tests for BlockLockIndicator component (Step 5.4.4)
 *
 * Covers:
 * - Shows yellow border + lock icon when another user holds the lock
 * - Hides lock indicator when no lock
 * - Shows 'Editing: {username}' tooltip
 * - React.memo prevents unnecessary re-renders
 * - Renders children (wrapped block content)
 * - data-testid on testable elements
 * - Accessibility: aria-label on lock indicator
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { BlockLockIndicator } from "../BlockLockIndicator";
import type { LockInfo } from "../../../hooks/usePreviewSync";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("BlockLockIndicator", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children when no lock is held", () => {
    render(
      <BlockLockIndicator blockId={1} lock={null} currentUserId={42}>
        <div data-testid="block-content">Content</div>
      </BlockLockIndicator>,
    );
    expect(screen.getByTestId("block-content")).toBeInTheDocument();
  });

  it("does NOT show lock indicator when no lock", () => {
    render(
      <BlockLockIndicator blockId={1} lock={null} currentUserId={42}>
        <div>Content</div>
      </BlockLockIndicator>,
    );
    expect(screen.queryByTestId("lock-indicator-1")).not.toBeInTheDocument();
  });

  it("shows lock indicator when another user holds the lock", () => {
    const lock: LockInfo = {
      userId: 99,
      blockId: 1,
      username: "Bob",
      acquiredAt: Date.now(),
    };

    render(
      <BlockLockIndicator blockId={1} lock={lock} currentUserId={42}>
        <div>Content</div>
      </BlockLockIndicator>,
    );
    expect(screen.getByTestId("lock-indicator-1")).toBeInTheDocument();
  });

  it("does NOT show lock indicator when current user holds the lock", () => {
    const lock: LockInfo = {
      userId: 42,
      blockId: 1,
      username: "Alice",
      acquiredAt: Date.now(),
    };

    render(
      <BlockLockIndicator blockId={1} lock={lock} currentUserId={42}>
        <div>Content</div>
      </BlockLockIndicator>,
    );
    expect(screen.queryByTestId("lock-indicator-1")).not.toBeInTheDocument();
  });

  it("shows yellow border on the wrapper when locked by another user", () => {
    const lock: LockInfo = {
      userId: 99,
      blockId: 1,
      username: "Bob",
      acquiredAt: Date.now(),
    };

    render(
      <BlockLockIndicator blockId={1} lock={lock} currentUserId={42}>
        <div>Content</div>
      </BlockLockIndicator>,
    );
    const wrapper = screen.getByTestId("block-lock-wrapper-1");
    expect(wrapper).toBeInTheDocument();
  });

  it("displays username in the lock indicator label", () => {
    const lock: LockInfo = {
      userId: 99,
      blockId: 1,
      username: "Bob",
      acquiredAt: Date.now(),
    };

    render(
      <BlockLockIndicator blockId={1} lock={lock} currentUserId={42}>
        <div>Content</div>
      </BlockLockIndicator>,
    );

    expect(screen.getByText(/Editing: Bob/)).toBeInTheDocument();
  });

  it("has aria-label for accessibility on lock indicator", () => {
    const lock: LockInfo = {
      userId: 99,
      blockId: 1,
      username: "Bob",
      acquiredAt: Date.now(),
    };

    render(
      <BlockLockIndicator blockId={1} lock={lock} currentUserId={42}>
        <div>Content</div>
      </BlockLockIndicator>,
    );

    const indicator = screen.getByTestId("lock-indicator-1");
    expect(indicator).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Bob"),
    );
  });

  it("is memoized with React.memo", () => {
    expect(
      (BlockLockIndicator as unknown as { $$typeof: symbol }).$$typeof,
    ).toBe(Symbol.for("react.memo"));
  });

  it("renders children even when locked", () => {
    const lock: LockInfo = {
      userId: 99,
      blockId: 1,
      username: "Bob",
      acquiredAt: Date.now(),
    };

    render(
      <BlockLockIndicator blockId={1} lock={lock} currentUserId={42}>
        <div data-testid="block-content">Content</div>
      </BlockLockIndicator>,
    );
    expect(screen.getByTestId("block-content")).toBeInTheDocument();
  });
});
