/**
 * AccountContext Tests (Step 7.15.3)
 *
 * Covers:
 *  1.  AccountProvider renders children
 *  2.  useAccountContext throws outside provider
 *  3.  Fetches delegated accounts on mount
 *  4.  isDelegating is false when no delegation active
 *  5.  switchAccount calls POST /switch-context and sets delegation state
 *  6.  switchAccount sets X-Account-Context header on subsequent requests
 *  7.  clearDelegation calls DELETE /switch-context and clears state
 *  8.  clearDelegation removes X-Account-Context header
 *  9.  Self-delegation is prevented
 * 10.  Invalid accountUserId is rejected
 * 11.  403 during delegation clears delegation state
 * 12.  401 during delegation clears delegation state
 * 13.  Delegation state clears on logout (user becomes null)
 * 14.  Error state set on failed fetch
 * 15.  Error state set on failed switch
 * 16.  isSwitching prevents double-click
 * 17.  Refreshes accounts on visibility change
 * 18.  serviceScopes reflects current delegation
 */

import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  render,
  screen,
  act,
  waitFor,
  renderHook,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

// ── Mock axios ──────────────────────────────────────────────────────────────

const mockAxiosGet = vi.fn();
const mockAxiosPost = vi.fn();
const mockAxiosDelete = vi.fn();

// Track interceptors so we can call them
const requestInterceptors: Array<(config: any) => any> = [];
const responseInterceptors: Array<{
  onFulfilled: (res: any) => any;
  onRejected: (err: any) => any;
}> = [];

vi.mock("axios", () => ({
  default: {
    get: (...args: unknown[]) => mockAxiosGet(...args),
    post: (...args: unknown[]) => mockAxiosPost(...args),
    delete: (...args: unknown[]) => mockAxiosDelete(...args),
    defaults: {
      headers: { common: {} },
      withCredentials: true,
    },
    interceptors: {
      request: {
        use: vi.fn((fn: any) => {
          requestInterceptors.push(fn);
          return requestInterceptors.length - 1;
        }),
        eject: vi.fn((id: number) => {
          requestInterceptors[id] = null as any;
        }),
      },
      response: {
        use: vi.fn((onFulfilled: any, onRejected: any) => {
          responseInterceptors.push({ onFulfilled, onRejected });
          return responseInterceptors.length - 1;
        }),
        eject: vi.fn((id: number) => {
          responseInterceptors[id] = null as any;
        }),
      },
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

import { AccountProvider, useAccountContext } from "../AccountContext";

// ── Helpers ─────────────────────────────────────────────────────────────────

const mockAccounts = [
  {
    id: 100,
    ownerUser: { id: 10, name: "Alice Owner", email: "alice@test.com" },
    role: "ACCOUNT_ADMIN",
    serviceScopes: [],
  },
  {
    id: 200,
    ownerUser: { id: 20, name: "Bob Boss", email: "bob@test.com" },
    role: "ACCOUNT_COLLABORATOR",
    serviceScopes: ["websites", "listings"],
  },
];

/** Test component that exposes context via data attributes */
function TestConsumer() {
  const ctx = useAccountContext();
  return (
    <div>
      <span data-testid="isDelegating">{String(ctx.isDelegating)}</span>
      <span data-testid="isLoading">{String(ctx.isLoading)}</span>
      <span data-testid="isSwitching">{String(ctx.isSwitching)}</span>
      <span data-testid="error">{ctx.error || ""}</span>
      <span data-testid="delegateAccount">
        {ctx.delegateAccount ? ctx.delegateAccount.ownerUser.name : ""}
      </span>
      <span data-testid="serviceScopes">{ctx.serviceScopes.join(",")}</span>
      <span data-testid="accountCount">{ctx.delegatedAccounts.length}</span>
      <button
        data-testid="switch-alice"
        onClick={() => ctx.switchAccount(mockAccounts[0])}
      >
        Switch Alice
      </button>
      <button
        data-testid="switch-bob"
        onClick={() => ctx.switchAccount(mockAccounts[1])}
      >
        Switch Bob
      </button>
      <button
        data-testid="switch-self"
        onClick={() =>
          ctx.switchAccount({
            id: 999,
            ownerUser: { id: 1, name: "Me", email: "test@test.com" },
            role: "ACCOUNT_ADMIN",
            serviceScopes: [],
          })
        }
      >
        Switch Self
      </button>
      <button
        data-testid="switch-invalid"
        onClick={() =>
          ctx.switchAccount({
            id: 888,
            ownerUser: { id: -1, name: "Bad", email: "bad@test.com" },
            role: "ACCOUNT_ADMIN",
            serviceScopes: [],
          })
        }
      >
        Switch Invalid
      </button>
      <button data-testid="clear" onClick={() => ctx.clearDelegation()}>
        Clear
      </button>
      <button data-testid="refresh" onClick={() => ctx.refreshAccounts()}>
        Refresh
      </button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <AccountProvider>
      <TestConsumer />
    </AccountProvider>,
  );
}

// ── Tests ───────────────────────────────────────────────────────────────────

describe("AccountContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentMockUser = mockUser;
    requestInterceptors.length = 0;
    responseInterceptors.length = 0;
    // Default: delegated-accounts returns our mock
    mockAxiosGet.mockResolvedValue({ data: { accounts: mockAccounts } });
    mockAxiosPost.mockResolvedValue({ data: { success: true, context: {} } });
    mockAxiosDelete.mockResolvedValue({ data: { success: true } });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("1. renders children", async () => {
    renderWithProvider();
    expect(screen.getByTestId("isDelegating")).toBeInTheDocument();
  });

  it("2. useAccountContext throws outside provider", () => {
    // Suppress console.error for expected error
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    expect(() => {
      renderHook(() => useAccountContext());
    }).toThrow("useAccountContext must be used within an AccountProvider");
    consoleSpy.mockRestore();
  });

  it("3. fetches delegated accounts on mount", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });
    expect(mockAxiosGet).toHaveBeenCalledWith(
      expect.stringContaining("/account/delegated-accounts"),
    );
  });

  it("4. isDelegating is false when no delegation active", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
    });
  });

  it("5. switchAccount calls POST /switch-context and sets delegation state", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    await act(async () => {
      screen.getByTestId("switch-alice").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("true");
      expect(screen.getByTestId("delegateAccount").textContent).toBe(
        "Alice Owner",
      );
    });

    expect(mockAxiosPost).toHaveBeenCalledWith(
      expect.stringContaining("/account/switch-context"),
      { accountUserId: 10 },
    );
  });

  it("6. switchAccount sets X-Account-Context header via interceptor", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    await act(async () => {
      screen.getByTestId("switch-alice").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("true");
    });

    // Find the active request interceptor
    const activeInterceptor = requestInterceptors.filter(Boolean).pop();
    expect(activeInterceptor).toBeTruthy();

    // Simulate a request going through the interceptor
    const config = { headers: {} };
    const result = activeInterceptor!(config);
    expect(result.headers["X-Account-Context"]).toBe("10");
  });

  it("7. clearDelegation calls DELETE /switch-context and clears state", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    // First switch
    await act(async () => {
      screen.getByTestId("switch-alice").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("true");
    });

    // Then clear
    await act(async () => {
      screen.getByTestId("clear").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
      expect(screen.getByTestId("delegateAccount").textContent).toBe("");
    });

    expect(mockAxiosDelete).toHaveBeenCalledWith(
      expect.stringContaining("/account/switch-context"),
    );
  });

  it("8. clearDelegation removes X-Account-Context header (interceptor ejected)", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    await act(async () => {
      screen.getByTestId("switch-alice").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("true");
    });

    await act(async () => {
      screen.getByTestId("clear").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
    });

    // After clearing, no active interceptors should inject the header
    const activeInterceptors = requestInterceptors.filter(Boolean);
    // The interceptor was ejected; or if still present, should not inject header
    // because delegateAccountRef is null
    if (activeInterceptors.length > 0) {
      const config = { headers: {} };
      const result = activeInterceptors[activeInterceptors.length - 1](config);
      expect(result.headers["X-Account-Context"]).toBeUndefined();
    }
  });

  it("9. self-delegation is prevented", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    await act(async () => {
      screen.getByTestId("switch-self").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(
        "Cannot delegate to your own account",
      );
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
    });

    // POST should NOT have been called
    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it("10. invalid accountUserId is rejected", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    await act(async () => {
      screen.getByTestId("switch-invalid").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(
        "Invalid account ID",
      );
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
    });

    expect(mockAxiosPost).not.toHaveBeenCalled();
  });

  it("11. 403 during delegation clears delegation state", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    await act(async () => {
      screen.getByTestId("switch-alice").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("true");
    });

    // Simulate a 403 through the response interceptor
    const responseHandler = responseInterceptors.filter(Boolean).pop();
    expect(responseHandler).toBeTruthy();

    await act(async () => {
      try {
        await responseHandler!.onRejected({ response: { status: 403 } });
      } catch {
        // Expected rejection
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
    });
  });

  it("12. 401 during delegation clears delegation state", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    await act(async () => {
      screen.getByTestId("switch-alice").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("true");
    });

    const responseHandler = responseInterceptors.filter(Boolean).pop();
    await act(async () => {
      try {
        await responseHandler!.onRejected({ response: { status: 401 } });
      } catch {
        // Expected
      }
    });

    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
    });
  });

  it("13. delegation state clears on logout (user becomes null)", async () => {
    const { rerender } = renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    await act(async () => {
      screen.getByTestId("switch-alice").click();
    });
    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("true");
    });

    // Simulate logout
    currentMockUser = null;
    rerender(
      <AccountProvider>
        <TestConsumer />
      </AccountProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
      expect(screen.getByTestId("accountCount").textContent).toBe("0");
    });
  });

  it("14. error state set on failed fetch", async () => {
    mockAxiosGet.mockRejectedValue({
      response: { data: { message: "Server error" } },
    });

    renderWithProvider();

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe("Server error");
    });
  });

  it("15. error state set on failed switch (403)", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    mockAxiosPost.mockRejectedValue({
      response: { status: 403, data: { message: "Not authorized" } },
    });

    await act(async () => {
      screen.getByTestId("switch-alice").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("error").textContent).toBe(
        "You are not authorized to access this account",
      );
      expect(screen.getByTestId("isDelegating").textContent).toBe("false");
    });
  });

  it("16. isSwitching prevents double-click", async () => {
    // Make switchContext slow
    let resolveSwitch: Function;
    mockAxiosPost.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSwitch = resolve;
        }),
    );

    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    // First click starts switching
    act(() => {
      screen.getByTestId("switch-alice").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("isSwitching").textContent).toBe("true");
    });

    // Second click should be ignored
    await act(async () => {
      screen.getByTestId("switch-bob").click();
    });

    // Only one POST call should have been made
    expect(mockAxiosPost).toHaveBeenCalledTimes(1);

    // Resolve the pending switch
    await act(async () => {
      resolveSwitch!({ data: { success: true, context: {} } });
    });
  });

  it("17. refreshes accounts on visibility change", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledTimes(1);
    });

    // Simulate visibility change
    Object.defineProperty(document, "visibilityState", {
      value: "visible",
      writable: true,
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledTimes(2);
    });
  });

  it("18. serviceScopes reflects current delegation", async () => {
    renderWithProvider();
    await waitFor(() => {
      expect(screen.getByTestId("accountCount").textContent).toBe("2");
    });

    // Switch to Bob (has scopes)
    await act(async () => {
      screen.getByTestId("switch-bob").click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("serviceScopes").textContent).toBe(
        "websites,listings",
      );
    });
  });
});
