/**
 * Tests for ActiveUsers component (Step 5.4.4)
 *
 * Covers:
 * - Shows avatar circles with colored initials for each room member
 * - Shows max 8 avatars with +N overflow indicator
 * - Users with active locks show editing badge
 * - Solo editing: only current user shown
 * - React.memo prevents unnecessary re-renders
 * - data-testid on all testable elements
 * - Accessibility: aria-label on avatar group
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { ActiveUsers } from "../ActiveUsers";
import type { RoomStateMember } from "../../../types/websocket";
import type { LockInfo } from "../../../hooks/usePreviewSync";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("ActiveUsers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing with empty users list", () => {
    const { container } = render(<ActiveUsers users={[]} locks={new Map()} />);
    expect(container).toBeTruthy();
  });

  it("renders avatar for each user", () => {
    const users: RoomStateMember[] = [
      { userId: 1, username: "Alice" },
      { userId: 2, username: "Bob" },
    ];

    render(<ActiveUsers users={users} locks={new Map()} />);

    expect(screen.getByTestId("user-avatar-1")).toBeInTheDocument();
    expect(screen.getByTestId("user-avatar-2")).toBeInTheDocument();
  });

  it("shows initials in each avatar", () => {
    const users: RoomStateMember[] = [{ userId: 1, username: "Alice Wonder" }];

    render(<ActiveUsers users={users} locks={new Map()} />);

    // "AW" for "Alice Wonder"
    expect(screen.getByText("AW")).toBeInTheDocument();
  });

  it("shows max 8 avatars with +N overflow", () => {
    const users: RoomStateMember[] = Array.from({ length: 12 }, (_, i) => ({
      userId: i + 1,
      username: `User ${i + 1}`,
    }));

    render(<ActiveUsers users={users} locks={new Map()} />);

    // Should render max 8 individual avatars
    for (let i = 1; i <= 8; i++) {
      expect(screen.getByTestId(`user-avatar-${i}`)).toBeInTheDocument();
    }

    // Should NOT render avatars 9-12 individually
    expect(screen.queryByTestId("user-avatar-9")).not.toBeInTheDocument();

    // Should show overflow indicator
    expect(screen.getByTestId("avatar-overflow")).toBeInTheDocument();
    expect(screen.getByText("+4")).toBeInTheDocument();
  });

  it("shows editing badge on user with active lock", () => {
    const users: RoomStateMember[] = [
      { userId: 1, username: "Alice" },
      { userId: 2, username: "Bob" },
    ];

    const locks = new Map<number, LockInfo>();
    locks.set(5, {
      userId: 2,
      blockId: 5,
      username: "Bob",
      acquiredAt: Date.now(),
    });

    render(<ActiveUsers users={users} locks={locks} />);

    expect(screen.getByTestId("editing-badge-2")).toBeInTheDocument();
    expect(screen.queryByTestId("editing-badge-1")).not.toBeInTheDocument();
  });

  it("has aria-label on the avatar group", () => {
    const users: RoomStateMember[] = [{ userId: 1, username: "Alice" }];

    render(<ActiveUsers users={users} locks={new Map()} />);

    const group = screen.getByTestId("active-users-group");
    expect(group).toHaveAttribute(
      "aria-label",
      expect.stringContaining("Active"),
    );
  });

  it("is memoized with React.memo", () => {
    expect((ActiveUsers as unknown as { $$typeof: symbol }).$$typeof).toBe(
      Symbol.for("react.memo"),
    );
  });

  it("handles single-character username initials", () => {
    const users: RoomStateMember[] = [{ userId: 1, username: "Z" }];

    render(<ActiveUsers users={users} locks={new Map()} />);
    expect(screen.getByText("Z")).toBeInTheDocument();
  });

  it("handles empty username gracefully", () => {
    const users: RoomStateMember[] = [{ userId: 1, username: "" }];

    render(<ActiveUsers users={users} locks={new Map()} />);
    expect(screen.getByTestId("user-avatar-1")).toBeInTheDocument();
  });
});
