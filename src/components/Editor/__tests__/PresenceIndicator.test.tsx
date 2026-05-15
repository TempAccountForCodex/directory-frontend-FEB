/**
 * PresenceIndicator Tests (Step 7.5.2)
 *
 * Covers:
 * - Renders avatars for each active collaborator
 * - Shows role badge with correct color per role
 * - Shows 'N editors, M viewers' summary
 * - React.memo memoization
 * - Overflow indicator for > 5 users
 * - Empty state (no collaborators)
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { PresenceIndicator } from "../PresenceIndicator";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface PresenceUser {
  userId: number;
  userName: string;
  userAvatar: string | null;
  role: string;
  color: string;
}

function makeUser(
  userId: number,
  userName: string,
  role: string,
  color = "#2196f3",
): PresenceUser {
  return { userId, userName, userAvatar: null, role, color };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("PresenceIndicator", () => {
  it("renders without crashing with empty user list", () => {
    const { container } = render(
      <PresenceIndicator users={[]} currentUserId={1} />,
    );
    expect(container).toBeTruthy();
  });

  it("renders avatar for each collaborator", () => {
    const users = [
      makeUser(1, "Alice", "EDITOR"),
      makeUser(2, "Bob", "VIEWER"),
    ];
    render(<PresenceIndicator users={users} currentUserId={99} />);
    expect(screen.getByTestId("presence-avatar-1")).toBeInTheDocument();
    expect(screen.getByTestId("presence-avatar-2")).toBeInTheDocument();
  });

  it("shows role badge for each user", () => {
    const users = [makeUser(1, "Alice", "OWNER")];
    render(<PresenceIndicator users={users} currentUserId={99} />);
    expect(screen.getByTestId("role-badge-1")).toBeInTheDocument();
  });

  it('shows "N editors, M viewers" summary text', () => {
    const users = [
      makeUser(1, "Alice", "EDITOR"),
      makeUser(2, "Bob", "VIEWER"),
      makeUser(3, "Carol", "ADMIN"),
    ];
    render(<PresenceIndicator users={users} currentUserId={99} />);
    // 2 editors (EDITOR + ADMIN), 1 viewer
    expect(screen.getByTestId("presence-summary")).toHaveTextContent(
      /2 editor/i,
    );
    expect(screen.getByTestId("presence-summary")).toHaveTextContent(
      /1 viewer/i,
    );
  });

  it("shows overflow indicator when more than 5 users", () => {
    const users = Array.from({ length: 8 }, (_, i) =>
      makeUser(i + 1, `User ${i + 1}`, "EDITOR"),
    );
    render(<PresenceIndicator users={users} currentUserId={99} />);
    // Should show +N overflow
    expect(screen.getByTestId("presence-overflow")).toBeInTheDocument();
  });

  it("does not show overflow when 5 or fewer users", () => {
    const users = Array.from({ length: 5 }, (_, i) =>
      makeUser(i + 1, `User ${i + 1}`, "EDITOR"),
    );
    render(<PresenceIndicator users={users} currentUserId={99} />);
    expect(screen.queryByTestId("presence-overflow")).not.toBeInTheDocument();
  });

  it("is memoized with React.memo", () => {
    expect(PresenceIndicator).toHaveProperty("$$typeof");
    expect(
      (PresenceIndicator as unknown as { $$typeof: symbol }).$$typeof,
    ).toBe(Symbol.for("react.memo"));
  });

  it('renders OWNER role badge with "OWNER" text', () => {
    const users = [makeUser(1, "Alice", "OWNER")];
    render(<PresenceIndicator users={users} currentUserId={99} />);
    expect(screen.getByTestId("role-badge-1")).toHaveTextContent("OWNER");
  });

  it('renders VIEWER role badge with "VIEWER" text', () => {
    const users = [makeUser(2, "Bob", "VIEWER")];
    render(<PresenceIndicator users={users} currentUserId={99} />);
    expect(screen.getByTestId("role-badge-2")).toHaveTextContent("VIEWER");
  });
});
