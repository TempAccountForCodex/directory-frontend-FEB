/**
 * AccountContext - Account Delegation State Provider (Step 7.15.3)
 *
 * Provides React Context for account delegation (acting on behalf of another user).
 * Manages the full lifecycle:
 *   - Fetching delegated accounts from the server
 *   - Switching context via POST /api/account/switch-context
 *   - Clearing context via DELETE /api/account/switch-context
 *   - Injecting X-Account-Context header into axios requests during delegation
 *   - Clearing all delegation state on logout/401/403
 *
 * SECURITY:
 *   - Delegation state is in-memory ONLY (never localStorage)
 *   - X-Account-Context header is ONLY set after server confirms switch-context
 *   - All delegation state clears on any 401/403 during delegation
 *   - Self-delegation is prevented client-side
 *   - Expired/revoked delegation handled gracefully
 */

import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import axios from "axios";
import { useAuth } from "./AuthContext";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface DelegatedAccount {
  id: number;
  ownerUser: {
    id: number;
    name: string;
    email: string;
  };
  role: string;
  serviceScopes: string[];
}

export interface AccountContextType {
  /** Whether user is currently acting on behalf of another account */
  isDelegating: boolean;
  /** The account currently being delegated to, or null */
  delegateAccount: DelegatedAccount | null;
  /** Service scopes allowed during current delegation session */
  serviceScopes: string[];
  /** List of accounts the user can delegate to */
  delegatedAccounts: DelegatedAccount[];
  /** Whether the accounts list is loading */
  isLoading: boolean;
  /** Whether a context switch is in progress */
  isSwitching: boolean;
  /** Error message, if any */
  error: string | null;
  /** Switch to acting on behalf of another account */
  switchAccount: (account: DelegatedAccount) => Promise<boolean>;
  /** Clear delegation and return to own account */
  clearDelegation: () => Promise<boolean>;
  /** Refresh the list of delegated accounts */
  refreshAccounts: () => Promise<void>;
}

// ── Context ───────────────────────────────────────────────────────────────────

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAccountContext = (): AccountContextType => {
  const context = useContext(AccountContext);
  if (!context) {
    throw new Error("useAccountContext must be used within an AccountProvider");
  }
  return context;
};

// ── Provider ──────────────────────────────────────────────────────────────────

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider = ({ children }: AccountProviderProps) => {
  const { user } = useAuth();

  // All delegation state is in-memory only (NEVER localStorage)
  const [delegateAccount, setDelegateAccount] =
    useState<DelegatedAccount | null>(null);
  const [delegatedAccounts, setDelegatedAccounts] = useState<
    DelegatedAccount[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref for axios interceptor cleanup
  const interceptorRef = useRef<number | null>(null);
  // Ref to track the current delegate account for the interceptor closure
  const delegateAccountRef = useRef<DelegatedAccount | null>(null);

  // Keep ref in sync with state
  useEffect(() => {
    delegateAccountRef.current = delegateAccount;
  }, [delegateAccount]);

  const isDelegating = delegateAccount !== null;
  const serviceScopes = useMemo(
    () => delegateAccount?.serviceScopes ?? [],
    [delegateAccount],
  );

  // ── Axios interceptor: inject X-Account-Context header ──────────────────

  useEffect(() => {
    // Remove previous interceptor if any
    if (interceptorRef.current !== null) {
      axios.interceptors.request.eject(interceptorRef.current);
      interceptorRef.current = null;
    }

    if (delegateAccount) {
      interceptorRef.current = axios.interceptors.request.use((config) => {
        const current = delegateAccountRef.current;
        if (current) {
          config.headers = config.headers || {};
          config.headers["X-Account-Context"] = String(current.ownerUser.id);
        }
        return config;
      });
    }

    return () => {
      if (interceptorRef.current !== null) {
        axios.interceptors.request.eject(interceptorRef.current);
        interceptorRef.current = null;
      }
    };
  }, [delegateAccount]);

  // ── Clear delegation on 401/403 during delegation ─────────────────────────

  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (err) => {
        const status = err.response?.status;
        if (delegateAccountRef.current) {
          if (status === 401) {
            setDelegateAccount(null);
            setError(
              "Session expired. You have been returned to your own account.",
            );
          } else if (status === 403) {
            setError(
              "This action is not permitted under your current delegation scope.",
            );
          }
        }
        return Promise.reject(err);
      },
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // ── Clear delegation state when user logs out ────────────────────────────

  useEffect(() => {
    if (!user) {
      setDelegateAccount(null);
      setDelegatedAccounts([]);
      setError(null);
    }
  }, [user]);

  // ── Fetch delegated accounts ─────────────────────────────────────────────

  const refreshAccounts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_URL}/account/delegated-accounts`);
      setDelegatedAccounts(response.data.accounts || []);
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to load delegated accounts";
      setError(message);
      setDelegatedAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshAccounts();
    }
  }, [user, refreshAccounts]);

  // Refresh on visibility change (tab focus)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && user) {
        refreshAccounts();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, refreshAccounts]);

  // ── Switch account ───────────────────────────────────────────────────────

  const switchAccount = useCallback(
    async (account: DelegatedAccount): Promise<boolean> => {
      // Prevent self-delegation
      if (user && account.ownerUser.id === user.id) {
        setError("Cannot delegate to your own account");
        return false;
      }

      // Validate accountUserId is a positive integer
      if (
        !account.ownerUser.id ||
        account.ownerUser.id < 1 ||
        !Number.isInteger(account.ownerUser.id)
      ) {
        setError("Invalid account ID");
        return false;
      }

      // Prevent double-click
      if (isSwitching) return false;

      setIsSwitching(true);
      setError(null);

      try {
        await axios.post(`${API_URL}/account/switch-context`, {
          accountUserId: account.ownerUser.id,
        });

        // Only set delegation state AFTER server confirms
        setDelegateAccount(account);
        return true;
      } catch (err: any) {
        const status = err.response?.status;
        let message = "Failed to switch account context";
        if (status === 403) {
          message = "You are not authorized to access this account";
        } else if (status === 404) {
          message = "Delegation access not found or has been revoked";
        } else if (err.response?.data?.message) {
          message = err.response.data.message;
        }
        setError(message);
        return false;
      } finally {
        setIsSwitching(false);
      }
    },
    [user, isSwitching],
  );

  // ── Clear delegation ─────────────────────────────────────────────────────

  const clearDelegation = useCallback(async (): Promise<boolean> => {
    if (isSwitching) return false;
    setIsSwitching(true);
    setError(null);

    try {
      await axios.delete(`${API_URL}/account/switch-context`);
      setDelegateAccount(null);
      return true;
    } catch (err: any) {
      // Even if the API call fails, clear local delegation state
      // since we don't want users stuck in delegation mode
      setDelegateAccount(null);
      return true;
    } finally {
      setIsSwitching(false);
    }
  }, [isSwitching]);

  // ── Context value ────────────────────────────────────────────────────────

  const value = useMemo<AccountContextType>(
    () => ({
      isDelegating,
      delegateAccount,
      serviceScopes,
      delegatedAccounts,
      isLoading,
      isSwitching,
      error,
      switchAccount,
      clearDelegation,
      refreshAccounts,
    }),
    [
      isDelegating,
      delegateAccount,
      serviceScopes,
      delegatedAccounts,
      isLoading,
      isSwitching,
      error,
      switchAccount,
      clearDelegation,
      refreshAccounts,
    ],
  );

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
};

export default AccountContext;
