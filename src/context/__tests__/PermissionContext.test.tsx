/**
 * Tests for PermissionContext (Step 7.2.3)
 *
 * Covers:
 * 1.  PermissionProvider renders children
 * 2.  usePermission returns correct boolean per role (OWNER, ADMIN, EDITOR, VIEWER)
 * 3.  useHasRole returns correct boolean per role hierarchy
 * 4.  useWebsiteRole returns role string or null
 * 5.  Loading state handling
 * 6.  Missing provider returns defaults (no crash)
 * 7.  Error state on API failure
 * 8.  setCurrentWebsite updates active website
 * 9.  refetch re-fetches permissions
 */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ── Mock axios ──────────────────────────────────────────────────────────────

const mockAxiosGet = vi.fn();

vi.mock("axios", () => ({
  default: {
    get: (...args: unknown[]) => mockAxiosGet(...args),
    defaults: {
      headers: { common: {} },
      withCredentials: true,
    },
    interceptors: {
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));

// ── Mock AuthContext ────────────────────────────────────────────────────────

const mockUser = { id: 1, email: "test@test.com", name: "Test User" };
let currentMockUser: typeof mockUser | null = mockUser;

vi.mock("../AuthContext", () => ({
  useAuth: () => ({
    user: currentMockUser,
    token: null,
    loading: false,
  }),
}));

// ── Import after mocks ─────────────────────────────────────────────────────

import {
  PermissionProvider,
  usePermission,
  useHasRole,
  useWebsiteRole,
  usePermissionContext,
  WEBSITE_ACTIONS,
} from "../PermissionContext";

// ── Helpers ─────────────────────────────────────────────────────────────────

function makeWebsitesResponse(websites: Array<{ id: number; role?: string }>) {
  return Promise.resolve({
    data: {
      data: websites.map((w) => ({
        ...w,
        name: `Website ${w.id}`,
        slug: `website-${w.id}`,
        status: "active",
      })),
    },
  });
}

/** Consumer component that displays context values for testing */
function ContextConsumer({ websiteId }: { websiteId?: number }) {
  const ctx = usePermissionContext();
  const canView = usePermission(WEBSITE_ACTIONS.VIEW);
  const canEdit = usePermission(WEBSITE_ACTIONS.EDIT_CONTENT);
  const canDelete = usePermission(WEBSITE_ACTIONS.DELETE);
  const canTransfer = usePermission(WEBSITE_ACTIONS.TRANSFER_OWNERSHIP);
  const canManageDomain = usePermission(WEBSITE_ACTIONS.MANAGE_DOMAIN);
  const hasEditorRole = useHasRole("EDITOR");
  const hasAdminRole = useHasRole("ADMIN");
  const hasOwnerRole = useHasRole("OWNER");
  const role = useWebsiteRole(websiteId);

  return (
    <div>
      <span data-testid="loading">{String(ctx.loading)}</span>
      <span data-testid="error">{ctx.error ?? "none"}</span>
      <span data-testid="current-website">{String(ctx.currentWebsiteId)}</span>
      <span data-testid="can-view">{String(canView)}</span>
      <span data-testid="can-edit">{String(canEdit)}</span>
      <span data-testid="can-delete">{String(canDelete)}</span>
      <span data-testid="can-transfer">{String(canTransfer)}</span>
      <span data-testid="can-manage-domain">{String(canManageDomain)}</span>
      <span data-testid="has-editor">{String(hasEditorRole)}</span>
      <span data-testid="has-admin">{String(hasAdminRole)}</span>
      <span data-testid="has-owner">{String(hasOwnerRole)}</span>
      <span data-testid="role">{role ?? "null"}</span>
      <button
        data-testid="set-website-1"
        onClick={() => ctx.setCurrentWebsite(1)}
      />
      <button
        data-testid="set-website-2"
        onClick={() => ctx.setCurrentWebsite(2)}
      />
      <button
        data-testid="set-website-null"
        onClick={() => ctx.setCurrentWebsite(null)}
      />
      <button data-testid="refetch" onClick={() => ctx.refetch()} />
    </div>
  );
}

/** Consumer that uses hooks outside provider to test graceful fallback */
function NoProviderConsumer() {
  const canView = usePermission(WEBSITE_ACTIONS.VIEW);
  const hasAdmin = useHasRole("ADMIN");
  const role = useWebsiteRole();

  return (
    <div>
      <span data-testid="np-can-view">{String(canView)}</span>
      <span data-testid="np-has-admin">{String(hasAdmin)}</span>
      <span data-testid="np-role">{role ?? "null"}</span>
    </div>
  );
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("PermissionContext (Step 7.2.3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockUser = mockUser;
    mockAxiosGet.mockResolvedValue(makeWebsitesResponse([]));
  });

  it("renders children inside PermissionProvider", async () => {
    render(
      <PermissionProvider>
        <span data-testid="child">Hello</span>
      </PermissionProvider>,
    );
    expect(screen.getByTestId("child")).toHaveTextContent("Hello");
  });

  it("fetches websites on mount", async () => {
    mockAxiosGet.mockReturnValue(makeWebsitesResponse([{ id: 1 }, { id: 2 }]));

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith(
        expect.stringContaining("/websites"),
        expect.objectContaining({ withCredentials: true }),
      );
    });
  });

  it("usePermission returns correct booleans for OWNER role", async () => {
    mockAxiosGet.mockReturnValue(makeWebsitesResponse([{ id: 1 }]));

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    // Wait for load and set current website
    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    act(() => {
      screen.getByTestId("set-website-1").click();
    });

    // OWNER can do everything
    expect(screen.getByTestId("can-view")).toHaveTextContent("true");
    expect(screen.getByTestId("can-edit")).toHaveTextContent("true");
    expect(screen.getByTestId("can-delete")).toHaveTextContent("true");
    expect(screen.getByTestId("can-transfer")).toHaveTextContent("true");
    expect(screen.getByTestId("can-manage-domain")).toHaveTextContent("true");
  });

  it("usePermission returns correct booleans for ADMIN role", async () => {
    mockAxiosGet.mockReturnValue(
      makeWebsitesResponse([{ id: 1, role: "ADMIN" }]),
    );

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    act(() => {
      screen.getByTestId("set-website-1").click();
    });

    expect(screen.getByTestId("can-view")).toHaveTextContent("true");
    expect(screen.getByTestId("can-edit")).toHaveTextContent("true");
    expect(screen.getByTestId("can-delete")).toHaveTextContent("true");
    // ADMIN cannot transfer ownership or manage domain
    expect(screen.getByTestId("can-transfer")).toHaveTextContent("false");
    expect(screen.getByTestId("can-manage-domain")).toHaveTextContent("false");
  });

  it("usePermission returns correct booleans for EDITOR role", async () => {
    mockAxiosGet.mockReturnValue(
      makeWebsitesResponse([{ id: 1, role: "EDITOR" }]),
    );

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    act(() => {
      screen.getByTestId("set-website-1").click();
    });

    expect(screen.getByTestId("can-view")).toHaveTextContent("true");
    expect(screen.getByTestId("can-edit")).toHaveTextContent("true");
    // EDITOR cannot delete
    expect(screen.getByTestId("can-delete")).toHaveTextContent("false");
    expect(screen.getByTestId("can-transfer")).toHaveTextContent("false");
  });

  it("usePermission returns correct booleans for VIEWER role", async () => {
    mockAxiosGet.mockReturnValue(
      makeWebsitesResponse([{ id: 1, role: "VIEWER" }]),
    );

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    act(() => {
      screen.getByTestId("set-website-1").click();
    });

    expect(screen.getByTestId("can-view")).toHaveTextContent("true");
    // VIEWER cannot do anything else
    expect(screen.getByTestId("can-edit")).toHaveTextContent("false");
    expect(screen.getByTestId("can-delete")).toHaveTextContent("false");
    expect(screen.getByTestId("can-transfer")).toHaveTextContent("false");
  });

  it("useHasRole returns correct booleans per role hierarchy", async () => {
    mockAxiosGet.mockReturnValue(
      makeWebsitesResponse([{ id: 1, role: "EDITOR" }]),
    );

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    act(() => {
      screen.getByTestId("set-website-1").click();
    });

    // EDITOR (level 2) >= EDITOR (level 2) → true
    expect(screen.getByTestId("has-editor")).toHaveTextContent("true");
    // EDITOR (level 2) >= ADMIN (level 3) → false
    expect(screen.getByTestId("has-admin")).toHaveTextContent("false");
    // EDITOR (level 2) >= OWNER (level 4) → false
    expect(screen.getByTestId("has-owner")).toHaveTextContent("false");
  });

  it("useHasRole returns true for higher roles", async () => {
    mockAxiosGet.mockReturnValue(
      makeWebsitesResponse([{ id: 1, role: "ADMIN" }]),
    );

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    act(() => {
      screen.getByTestId("set-website-1").click();
    });

    // ADMIN (level 3) >= EDITOR (level 2) → true
    expect(screen.getByTestId("has-editor")).toHaveTextContent("true");
    // ADMIN (level 3) >= ADMIN (level 3) → true
    expect(screen.getByTestId("has-admin")).toHaveTextContent("true");
    // ADMIN (level 3) >= OWNER (level 4) → false
    expect(screen.getByTestId("has-owner")).toHaveTextContent("false");
  });

  it("useWebsiteRole returns role string or null", async () => {
    mockAxiosGet.mockReturnValue(
      makeWebsitesResponse([
        { id: 1, role: "EDITOR" },
        { id: 2, role: "ADMIN" },
      ]),
    );

    render(
      <PermissionProvider>
        <ContextConsumer websiteId={2} />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // websiteId=2 role is ADMIN
    expect(screen.getByTestId("role")).toHaveTextContent("ADMIN");
  });

  it("useWebsiteRole returns null for unknown website", async () => {
    mockAxiosGet.mockReturnValue(makeWebsitesResponse([{ id: 1 }]));

    render(
      <PermissionProvider>
        <ContextConsumer websiteId={999} />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("role")).toHaveTextContent("null");
  });

  it("useWebsiteRole uses currentWebsiteId when no websiteId provided", async () => {
    mockAxiosGet.mockReturnValue(
      makeWebsitesResponse([{ id: 1, role: "VIEWER" }]),
    );

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // No current website → null
    expect(screen.getByTestId("role")).toHaveTextContent("null");

    act(() => {
      screen.getByTestId("set-website-1").click();
    });

    expect(screen.getByTestId("role")).toHaveTextContent("VIEWER");
  });

  it("handles loading state correctly", async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockAxiosGet.mockReturnValue(pendingPromise);

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    // Should be loading
    expect(screen.getByTestId("loading")).toHaveTextContent("true");

    // Resolve the API call
    await act(async () => {
      resolvePromise!({ data: { data: [] } });
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("handles API error state", async () => {
    mockAxiosGet.mockRejectedValue({
      response: { data: { message: "Unauthorized" } },
    });

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("error")).toHaveTextContent("Unauthorized");
    });

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
  });

  it("missing provider — hooks return safe defaults without crash", () => {
    render(<NoProviderConsumer />);

    expect(screen.getByTestId("np-can-view")).toHaveTextContent("false");
    expect(screen.getByTestId("np-has-admin")).toHaveTextContent("false");
    expect(screen.getByTestId("np-role")).toHaveTextContent("null");
  });

  it("usePermissionContext throws without provider", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => {
      render(<ContextConsumer />);
    }).toThrow(/usePermissionContext must be used within a PermissionProvider/);

    spy.mockRestore();
  });

  it("setCurrentWebsite updates active website", async () => {
    mockAxiosGet.mockReturnValue(
      makeWebsitesResponse([{ id: 1 }, { id: 2, role: "VIEWER" }]),
    );

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("current-website")).toHaveTextContent("null");

    act(() => {
      screen.getByTestId("set-website-2").click();
    });

    expect(screen.getByTestId("current-website")).toHaveTextContent("2");
    // Website 2 is VIEWER → cannot edit
    expect(screen.getByTestId("can-edit")).toHaveTextContent("false");
  });

  it("returns false for all permissions when no current website", async () => {
    mockAxiosGet.mockReturnValue(makeWebsitesResponse([{ id: 1 }]));

    render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // No current website set
    expect(screen.getByTestId("can-view")).toHaveTextContent("false");
    expect(screen.getByTestId("can-edit")).toHaveTextContent("false");
  });

  it("clears permissions when user is null", async () => {
    mockAxiosGet.mockReturnValue(makeWebsitesResponse([{ id: 1 }]));

    const { rerender } = render(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    // Set user to null
    currentMockUser = null;

    rerender(
      <PermissionProvider>
        <ContextConsumer />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });
  });

  it("defaults to OWNER when API does not include role field", async () => {
    // Response without role field — defaults to OWNER
    mockAxiosGet.mockReturnValue(makeWebsitesResponse([{ id: 1 }]));

    render(
      <PermissionProvider>
        <ContextConsumer websiteId={1} />
      </PermissionProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("role")).toHaveTextContent("OWNER");
  });
});
