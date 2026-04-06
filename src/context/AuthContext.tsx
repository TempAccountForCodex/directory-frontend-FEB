import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import type { User } from "../types/user";
import { isSentryEnabled, getSentry } from "../config/sentry";

interface AuthResult {
  success: boolean;
  message?: string;
}

interface SuperAdminCheckResult {
  exists: boolean;
  error: boolean;
  cached?: boolean;
}

interface AuthContextType {
  user: User | null;
  /**
   * @deprecated Token is stored in httpOnly cookies, not accessible to JavaScript
   * This will always be null - use httpOnly cookies instead
   */
  token: string | null;
  loading: boolean;
  signup: (formData: FormData) => Promise<AuthResult>;
  signin: (email: string, password: string) => Promise<AuthResult>;
  signout: () => Promise<void>;
  checkSuperAdmin: () => Promise<SuperAdminCheckResult>;
  verifyEmail: (email: string, code: string) => Promise<AuthResult>;
  resendVerification: (
    email: string,
  ) => Promise<AuthResult & { retryAfter?: number }>;
  requestSigninCode: (
    email: string,
  ) => Promise<AuthResult & { retryAfter?: number }>;
  signinCode: (email: string, code: string) => Promise<AuthResult>;
  requestPasswordReset: (
    email: string,
  ) => Promise<AuthResult & { retryAfter?: number }>;
  resetPassword: (
    email: string,
    code: string,
    newPassword: string,
  ) => Promise<AuthResult>;
  requestEmailChange: (
    newEmail: string,
  ) => Promise<AuthResult & { retryAfter?: number }>;
  confirmEmailChange: (
    code: string,
  ) => Promise<AuthResult & { newEmail?: string }>;
  unlinkGoogle: () => Promise<AuthResult>;
  deleteAccount: () => Promise<AuthResult>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * SECURE TOKEN STORAGE STRATEGY
 *
 * ✅ All authentication methods use httpOnly cookies exclusively
 *
 * Authentication flows:
 * - Email/password signin → httpOnly cookie (XSS-safe)
 * - Passwordless signin (code) → httpOnly cookie (XSS-safe)
 * - Google OAuth → httpOnly cookie (XSS-safe)
 *
 * Security benefits:
 * ✓ Complete XSS protection - tokens inaccessible to JavaScript
 * ✓ Automatic CSRF protection - SameSite=strict in production
 * ✓ Zero client-side token management - browser handles automatically
 * ✓ Secure by default - httpOnly + secure flags in production
 *
 * Implementation details:
 * - Backend sets httpOnly cookie on all successful auth endpoints
 * - Frontend uses withCredentials:true to send/receive cookies
 * - Auth middleware extracts token from cookie automatically
 * - Logout invalidates token via Redis blacklist + cookie clearing
 */
// Configure axios defaults once (outside component to avoid re-running)
axios.defaults.headers.common["X-Requested-With"] = "XMLHttpRequest";
axios.defaults.withCredentials = true;

// Clean up any bad Authorization header that might exist
const existingAuth = axios.defaults.headers.common["Authorization"];
if (
  existingAuth === "Bearer null" ||
  existingAuth === "Bearer undefined" ||
  !existingAuth
) {
  delete axios.defaults.headers.common["Authorization"];
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * @deprecated Token state maintained for API compatibility only
   * Actual tokens are stored in httpOnly cookies (not accessible to JavaScript)
   * This will always be null - do not rely on this value
   */
  const [token] = useState<string | null>(null);

  // Set up axios response interceptor to handle auth errors globally
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status;

        // Only handle 401 errors (not 403 which could be permissions)
        if (status === 401) {
          const errorMessage =
            error.response?.data?.message?.toLowerCase() || "";

          // Only clear session if it's explicitly about tokens or requires reauth
          if (
            errorMessage.includes("token") ||
            errorMessage.includes("expired") ||
            errorMessage.includes("invalid") ||
            error.response?.data?.requiresReauth
          ) {
            console.error(
              "Authentication error, clearing session:",
              errorMessage,
            );
            // Clear all auth data (httpOnly cookie will be cleared by backend on next request)
            localStorage.removeItem("superAdminExists");
            setUser(null);
          }
        }

        // Capture 5xx server errors to Sentry (Step 10.23)
        if (status && status >= 500 && isSentryEnabled()) {
          const sentry = getSentry();
          if (sentry) {
            sentry.captureException(error, {
              extra: {
                status,
                url: error.config?.url,
                method: error.config?.method,
                responseData: error.response?.data,
              },
              tags: { source: "axios_interceptor" },
            });
          }
        }

        return Promise.reject(error);
      },
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Token is in httpOnly cookie - browser automatically sends it
        const response = await axios.get(`${API_URL}/auth/me`, {
          withCredentials: true, // Important: send httpOnly cookies
        });

        const currentUser = response.data.user;
        setUser(currentUser);
        // Associate authenticated user with Sentry on page load (Step 10.23)
        if (isSentryEnabled() && currentUser) {
          const sentry = getSentry();
          sentry?.setUser({
            id: String(currentUser.id),
            email: currentUser.email,
          });
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        // Clear user state on auth failure
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Check if super admin exists
  const checkSuperAdmin = async (): Promise<SuperAdminCheckResult> => {
    try {
      const response = await axios.get(`${API_URL}/auth/check-super-admin`);
      const exists = response.data.exists;

      // Store the result in localStorage with TTL for offline reference
      // Cache expires after 24 hours to prevent stale data
      const cacheData = {
        value: exists,
        timestamp: Date.now(),
        ttl: 24 * 60 * 60 * 1000, // 24 hours
      };
      localStorage.setItem("superAdminExists", JSON.stringify(cacheData));

      return { exists, error: false };
    } catch (error) {
      console.error("Check super admin failed:", error);

      // If backend is down, check localStorage for cached value
      const cached = localStorage.getItem("superAdminExists");
      if (cached !== null) {
        try {
          const cacheData = JSON.parse(cached);

          // Check if cache is still valid (within TTL)
          const now = Date.now();
          const age = now - (cacheData.timestamp || 0);
          const ttl = cacheData.ttl || 24 * 60 * 60 * 1000;

          if (age < ttl) {
            // Cache is still valid
            return {
              exists: cacheData.value || false,
              error: true,
              cached: true,
            };
          } else {
            // Cache expired, remove it
            localStorage.removeItem("superAdminExists");
          }
        } catch (parseError) {
          // Invalid cache format, remove it
          localStorage.removeItem("superAdminExists");
        }
      }

      // If no valid cached value and backend is down, return error state
      return { exists: false, error: true, cached: false };
    }
  };

  // Sign up
  const signup = async (formData: FormData): Promise<AuthResult> => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Signup no longer returns a token - email verification required first
      // Token will be issued after successful email verification or signin
      const message =
        response.data.message ||
        "Account created successfully. Please verify your email.";

      return {
        success: true,
        message: message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Signup failed",
      };
    }
  };

  // Sign in
  const signin = async (
    email: string,
    password: string,
  ): Promise<AuthResult> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/signin`,
        {
          email,
          password,
        },
        {
          withCredentials: true, // Ensure cookies are sent/received
        },
      );
      const { user: newUser } = response.data;
      // Token is now in httpOnly cookie (no localStorage needed)
      setUser(newUser);
      // Associate this user with Sentry error reports (Step 10.23)
      if (isSentryEnabled() && newUser) {
        const sentry = getSentry();
        sentry?.setUser({ id: String(newUser.id), email: newUser.email });
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Signin failed",
      };
    }
  };

  // Verify email
  const verifyEmail = async (
    email: string,
    code: string,
  ): Promise<AuthResult> => {
    try {
      const response = await axios.post(`${API_URL}/auth/verify-email`, {
        email,
        code,
      });
      // Update user state with emailVerified: true
      if (user && user.email === email) {
        setUser({ ...user, emailVerified: true });
      }
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Email verification failed",
      };
    }
  };

  // Resend verification code
  const resendVerification = async (
    email: string,
  ): Promise<AuthResult & { retryAfter?: number }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/resend-verification`, {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const retryAfter = error.response?.data?.retryAfter;
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to resend verification code",
        retryAfter,
      };
    }
  };

  // Request signin code
  const requestSigninCode = async (
    email: string,
  ): Promise<AuthResult & { retryAfter?: number }> => {
    try {
      const response = await axios.post(`${API_URL}/auth/request-signin-code`, {
        email,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const retryAfter = error.response?.data?.retryAfter;
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send signin code",
        retryAfter,
      };
    }
  };

  // Sign in with code
  const signinCode = async (
    email: string,
    code: string,
  ): Promise<AuthResult> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/signin-code`,
        {
          email,
          code,
        },
        {
          withCredentials: true, // Ensure cookies are sent/received
        },
      );
      const { user: newUser } = response.data;
      // Token is now in httpOnly cookie (no localStorage needed)
      setUser(newUser);
      // Associate this user with Sentry error reports (Step 10.23)
      if (isSentryEnabled() && newUser) {
        const sentry = getSentry();
        sentry?.setUser({ id: String(newUser.id), email: newUser.email });
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Signin with code failed",
      };
    }
  };

  // Request password reset
  const requestPasswordReset = async (
    email: string,
  ): Promise<AuthResult & { retryAfter?: number }> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/request-password-reset`,
        {
          email,
        },
      );
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const retryAfter = error.response?.data?.retryAfter;
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to send password reset code",
        retryAfter,
      };
    }
  };

  // Reset password with code
  const resetPassword = async (
    email: string,
    code: string,
    newPassword: string,
  ): Promise<AuthResult> => {
    try {
      const response = await axios.post(`${API_URL}/auth/reset-password`, {
        email,
        code,
        newPassword,
      });
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Password reset failed",
      };
    }
  };

  // Request email change
  const requestEmailChange = async (
    newEmail: string,
  ): Promise<AuthResult & { retryAfter?: number }> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/request-email-change`,
        {
          newEmail,
        },
      );
      return { success: true, message: response.data.message };
    } catch (error: any) {
      const retryAfter = error.response?.data?.retryAfter;
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to send email change code",
        retryAfter,
      };
    }
  };

  // Confirm email change with code
  const confirmEmailChange = async (
    code: string,
  ): Promise<AuthResult & { newEmail?: string }> => {
    try {
      const response = await axios.post(
        `${API_URL}/auth/confirm-email-change`,
        {
          code,
        },
      );
      const newEmail = response.data.newEmail;
      // Update user email in local state
      if (user && newEmail) {
        setUser({ ...user, email: newEmail, emailVerified: true });
      }
      return { success: true, message: response.data.message, newEmail };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Email change confirmation failed",
      };
    }
  };

  // Unlink Google account
  const unlinkGoogle = async (): Promise<AuthResult> => {
    try {
      const response = await axios.post(`${API_URL}/auth/google/unlink`);
      // Update user state to remove googleId
      if (user) {
        setUser({ ...user, googleId: undefined });
      }
      return { success: true, message: response.data.message };
    } catch (error: any) {
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to unlink Google account",
      };
    }
  };

  // Delete account
  const deleteAccount = async (): Promise<AuthResult> => {
    try {
      await axios.delete(`${API_URL}/account`);

      // After successful deletion, perform local signout
      localStorage.removeItem("superAdminExists");
      setUser(null);

      return { success: true, message: "Account permanently deleted" };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete account",
      };
    }
  };

  // Update user
  const updateUser = (updatedUser: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updatedUser });
    }
  };

  // Sign out
  const signout = async () => {
    try {
      // Call backend signout endpoint with credentials
      // This clears the httpOnly cookie and blacklists the token
      await axios.post(
        `${API_URL}/auth/signout`,
        {},
        {
          withCredentials: true,
        },
      );
    } catch (error) {
      console.error("Signout API error:", error);
      // Continue with local signout even if API call fails
    } finally {
      // Clear local state
      localStorage.removeItem("superAdminExists");
      setUser(null);
      // httpOnly cookie will be cleared by the backend
      // Clear Sentry user association (Step 10.23)
      if (isSentryEnabled()) {
        const sentry = getSentry();
        sentry?.setUser(null);
      }
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    signup,
    signin,
    signout,
    checkSuperAdmin,
    verifyEmail,
    resendVerification,
    requestSigninCode,
    signinCode,
    requestPasswordReset,
    resetPassword,
    requestEmailChange,
    confirmEmailChange,
    unlinkGoogle,
    deleteAccount,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
