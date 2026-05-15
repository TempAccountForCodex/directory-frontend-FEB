/**
 * LockIndicator Tests (Step 7.5.3)
 *
 * Covers:
 * - Shows lock indicator with holder name and role
 * - VIEWER sees grayed-out state
 * - EDITOR+ sees edit controls on unlocked blocks
 * - React.memo memoization
 * - No indicator when not locked
 */
import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { LockIndicator } from "../LockIndicator";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("LockIndicator", () => {
  it("renders nothing when block is not locked", () => {
    const { container } = render(
      <LockIndicator
        blockId={1}
        lock={null}
        currentUserId={10}
        currentUserRole="EDITOR"
      />,
    );
    expect(screen.queryByTestId("lock-indicator-1")).not.toBeInTheDocument();
    expect(container.firstChild).toBeNull();
  });

  it("shows lock indicator when block is locked by another user", () => {
    const lock = {
      userId: 20,
      userName: "Alice",
      role: "EDITOR",
      blockId: 1,
      acquiredAt: new Date().toISOString(),
    };
    render(
      <LockIndicator
        blockId={1}
        lock={lock}
        currentUserId={10}
        currentUserRole="EDITOR"
      />,
    );
    expect(screen.getByTestId("lock-indicator-1")).toBeInTheDocument();
  });

  it("shows lock holder name in the indicator", () => {
    const lock = {
      userId: 20,
      userName: "Alice",
      role: "ADMIN",
      blockId: 1,
      acquiredAt: new Date().toISOString(),
    };
    render(
      <LockIndicator
        blockId={1}
        lock={lock}
        currentUserId={10}
        currentUserRole="EDITOR"
      />,
    );
    expect(screen.getByTestId("lock-indicator-1")).toHaveTextContent("Alice");
  });

  it("shows role badge in the lock indicator", () => {
    const lock = {
      userId: 20,
      userName: "Alice",
      role: "ADMIN",
      blockId: 1,
      acquiredAt: new Date().toISOString(),
    };
    render(
      <LockIndicator
        blockId={1}
        lock={lock}
        currentUserId={10}
        currentUserRole="EDITOR"
      />,
    );
    expect(screen.getByTestId("lock-role-badge-1")).toHaveTextContent("ADMIN");
  });

  it("does not show lock indicator when current user holds the lock", () => {
    const lock = {
      userId: 10, // same as currentUserId
      userName: "Me",
      role: "EDITOR",
      blockId: 1,
      acquiredAt: new Date().toISOString(),
    };
    render(
      <LockIndicator
        blockId={1}
        lock={lock}
        currentUserId={10}
        currentUserRole="EDITOR"
      />,
    );
    // When current user holds the lock, no "locked by other" indicator
    expect(screen.queryByTestId("lock-indicator-1")).not.toBeInTheDocument();
  });

  it("shows viewer overlay on blocks for VIEWER role", () => {
    render(
      <LockIndicator
        blockId={5}
        lock={null}
        currentUserId={99}
        currentUserRole="VIEWER"
      />,
    );
    expect(screen.getByTestId("viewer-overlay-5")).toBeInTheDocument();
  });

  it('shows "View Only" text for VIEWER role', () => {
    render(
      <LockIndicator
        blockId={5}
        lock={null}
        currentUserId={99}
        currentUserRole="VIEWER"
      />,
    );
    expect(screen.getByTestId("viewer-overlay-5")).toHaveTextContent(
      /view only/i,
    );
  });

  it("does not show viewer overlay for EDITOR role", () => {
    render(
      <LockIndicator
        blockId={5}
        lock={null}
        currentUserId={99}
        currentUserRole="EDITOR"
      />,
    );
    expect(screen.queryByTestId("viewer-overlay-5")).not.toBeInTheDocument();
  });

  it("is memoized with React.memo", () => {
    expect(LockIndicator).toHaveProperty("$$typeof");
    expect((LockIndicator as unknown as { $$typeof: symbol }).$$typeof).toBe(
      Symbol.for("react.memo"),
    );
  });
});
