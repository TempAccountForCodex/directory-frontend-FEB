/**
 * CollaborativeEditorHeader Tests (Step 7.5.4)
 *
 * Covers:
 * - Renders PresenceIndicator
 * - Shows 'Manage Collaborators' button
 * - Shows connection status
 * - React.memo memoization
 */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { CollaborativeEditorHeader } from "../CollaborativeEditorHeader";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const defaultProps = {
  websiteId: 1,
  currentUserId: 10,
  currentUserRole: "EDITOR" as const,
  isConnected: true,
  activeUsers: [],
  onManageCollaborators: vi.fn(),
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("CollaborativeEditorHeader", () => {
  it("renders without crashing", () => {
    const { container } = render(
      <CollaborativeEditorHeader {...defaultProps} />,
    );
    expect(container).toBeTruthy();
  });

  it("renders the header container", () => {
    render(<CollaborativeEditorHeader {...defaultProps} />);
    expect(
      screen.getByTestId("collaborative-editor-header"),
    ).toBeInTheDocument();
  });

  it("renders PresenceIndicator with active users", () => {
    const users = [
      {
        userId: 1,
        userName: "Alice",
        userAvatar: null,
        role: "EDITOR",
        color: "#2196f3",
      },
    ];
    render(<CollaborativeEditorHeader {...defaultProps} activeUsers={users} />);
    expect(screen.getByTestId("presence-indicator")).toBeInTheDocument();
  });

  it('shows "Manage Collaborators" button for OWNER/ADMIN roles', () => {
    render(
      <CollaborativeEditorHeader {...defaultProps} currentUserRole="ADMIN" />,
    );
    expect(screen.getByTestId("manage-collaborators-btn")).toBeInTheDocument();
  });

  it("calls onManageCollaborators when button clicked", () => {
    const onManage = vi.fn();
    render(
      <CollaborativeEditorHeader
        {...defaultProps}
        currentUserRole="OWNER"
        onManageCollaborators={onManage}
      />,
    );
    fireEvent.click(screen.getByTestId("manage-collaborators-btn"));
    expect(onManage).toHaveBeenCalledTimes(1);
  });

  it("shows connection status indicator", () => {
    render(<CollaborativeEditorHeader {...defaultProps} isConnected={true} />);
    expect(screen.getByTestId("ws-connection-status")).toBeInTheDocument();
  });

  it("shows disconnected state when not connected", () => {
    render(<CollaborativeEditorHeader {...defaultProps} isConnected={false} />);
    expect(screen.getByTestId("ws-connection-status")).toHaveTextContent(
      /reconnect/i,
    );
  });

  it("is memoized with React.memo", () => {
    expect(CollaborativeEditorHeader).toHaveProperty("$$typeof");
    expect(
      (CollaborativeEditorHeader as unknown as { $$typeof: symbol }).$$typeof,
    ).toBe(Symbol.for("react.memo"));
  });
});
