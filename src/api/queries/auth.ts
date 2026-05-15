import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { apiClient } from "../client";
import { queryKeys } from "../queryKeys";
import type { User } from "../../types/user";

/**
 * Shared result shape that mirrors the `AuthResult` contract AuthContext
 * previously exposed. Kept loose intentionally — individual mutations may add
 * optional fields (`retryAfter`, `newEmail`, etc.) via intersection types.
 */
export interface AuthMutationResult {
  success: boolean;
  message?: string;
}

export type AuthMutationResultWithRetry = AuthMutationResult & {
  retryAfter?: number;
};
export type AuthMutationResultWithEmail = AuthMutationResult & {
  newEmail?: string;
};

/**
 * Normalizes an axios error into the `{ success: false, message, ... }` shape
 * callers expect. Preserves `retryAfter` from rate-limited responses.
 */
function buildErrorResult(
  error: unknown,
  fallback: string,
): AuthMutationResultWithRetry {
  const ax = error as
    | AxiosError<{ message?: string; retryAfter?: number }>
    | undefined;
  const data = ax?.response?.data;
  return {
    success: false,
    message: data?.message || fallback,
    ...(data?.retryAfter !== undefined ? { retryAfter: data.retryAfter } : {}),
  };
}

/**
 * React Query hook for the currently authenticated user.
 *
 * Wraps `GET /api/auth/me` — the same endpoint AuthContext used to call from a
 * `useEffect` on mount. The query acts as the single source of truth for the
 * user object; AuthContext is now a thin facade that reads from this cache and
 * writes to it via `queryClient.setQueryData(queryKeys.auth.me(), ...)` on
 * sign-in / sign-out / profile mutations.
 *
 * Behavior notes:
 * - Returns `null` (not an error) on 401/403 so the UI's "signed out" state is
 *   a successful query result rather than an error state. This matches the
 *   prior AuthContext behavior where a failed `/me` just cleared `user`.
 * - Identity only changes via explicit flows we control (sign-in, sign-out,
 *   session expiry via interceptor), so `staleTime: Infinity` +
 *   `refetchOnMount: false` + `refetchOnWindowFocus: false` avoid unnecessary
 *   background refetches. Cache mutations are invoked explicitly instead.
 * - `retry: false` — a failed `/me` means no session, retrying won't help.
 */
export function useAuthMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: async ({ signal }): Promise<User | null> => {
      try {
        const response = await apiClient.get("/auth/me", { signal });
        return response.data?.user ?? null;
      } catch (error) {
        const status = (error as AxiosError | undefined)?.response?.status;
        if (status === 401 || status === 403) {
          return null;
        }
        throw error;
      }
    },
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}

/* --------------------------------------------------------------------------
 * Mutation hooks (Phase H.auth-mutations)
 *
 * Each mutation returns `AuthMutationResult`-compatible data so the
 * AuthContext wrapper methods can simply `return mutation.mutateAsync(...)`
 * without re-wrapping the payload. Errors are caught inside the mutationFn
 * and converted to `{ success: false, message }` — this matches the prior
 * AuthContext behavior where every method resolved (never rejected) and
 * callers branched on `result.success`.
 *
 * Cache side-effects:
 * - Mutations that authenticate a user (signin, signup*, signinCode) push the
 *   resulting user into `queryKeys.auth.me()` via `setQueryData`.
 * - Mutations that end a session (signout, deleteAccount) call `clear()`.
 * - Mutations that patch user fields (verifyEmail, confirmEmailChange,
 *   unlinkGoogle) use `setQueryData` with a functional updater.
 * - Pure "request-code" mutations have no cache side-effect.
 *
 * * Signup may or may not return a user depending on backend flow (email
 * verification gating); cache is updated only when `data.user` is present.
 * ------------------------------------------------------------------------- */

/** Sign up — `POST /api/auth/signup` (multipart form-data). */
export function useSignup() {
  const queryClient = useQueryClient();
  return useMutation<AuthMutationResult, never, FormData>({
    mutationFn: async (formData) => {
      try {
        const response = await apiClient.post("/auth/signup", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        if (response.data?.user) {
          queryClient.setQueryData(
            queryKeys.auth.me(),
            response.data.user as User,
          );
        }
        return {
          success: true,
          message:
            response.data?.message ||
            "Account created successfully. Please verify your email.",
        };
      } catch (error) {
        return buildErrorResult(error, "Signup failed");
      }
    },
  });
}

/** Sign in with email + password — `POST /api/auth/signin`. */
export function useSigninMutation() {
  const queryClient = useQueryClient();
  return useMutation<
    AuthMutationResult,
    never,
    { email: string; password: string }
  >({
    mutationFn: async ({ email, password }) => {
      try {
        const response = await apiClient.post("/auth/signin", {
          email,
          password,
        });
        const newUser = response.data?.user as User | undefined;
        if (newUser) {
          queryClient.setQueryData(queryKeys.auth.me(), newUser);
        }
        return { success: true };
      } catch (error) {
        return buildErrorResult(error, "Signin failed");
      }
    },
  });
}

/** Sign out — `POST /api/auth/signout`. Clears the entire query cache. */
export function useSignoutMutation() {
  const queryClient = useQueryClient();
  return useMutation<void, never, void>({
    mutationFn: async () => {
      try {
        await apiClient.post("/auth/signout", {});
      } catch (error) {
        // Continue with local signout even if API call fails — matches
        // the prior AuthContext behavior (finally-block cleanup).
        console.error("Signout API error:", error);
      } finally {
        queryClient.clear();
      }
    },
  });
}

/** Verify email — `POST /api/auth/verify-email`. Patches `emailVerified: true`. */
export function useVerifyEmail() {
  const queryClient = useQueryClient();
  return useMutation<
    AuthMutationResult,
    never,
    { email: string; code: string }
  >({
    mutationFn: async ({ email, code }) => {
      try {
        const response = await apiClient.post("/auth/verify-email", {
          email,
          code,
        });
        queryClient.setQueryData<User | null>(queryKeys.auth.me(), (old) =>
          old && old.email === email ? { ...old, emailVerified: true } : old,
        );
        return { success: true, message: response.data?.message };
      } catch (error) {
        return buildErrorResult(error, "Email verification failed");
      }
    },
  });
}

/** Resend verification code — `POST /api/auth/resend-verification`. */
export function useResendVerification() {
  return useMutation<AuthMutationResultWithRetry, never, { email: string }>({
    mutationFn: async ({ email }) => {
      try {
        const response = await apiClient.post("/auth/resend-verification", {
          email,
        });
        return { success: true, message: response.data?.message };
      } catch (error) {
        return buildErrorResult(error, "Failed to resend verification code");
      }
    },
  });
}

/** Request signin code — `POST /api/auth/request-signin-code`. */
export function useRequestSigninCode() {
  return useMutation<AuthMutationResultWithRetry, never, { email: string }>({
    mutationFn: async ({ email }) => {
      try {
        const response = await apiClient.post("/auth/request-signin-code", {
          email,
        });
        return { success: true, message: response.data?.message };
      } catch (error) {
        return buildErrorResult(error, "Failed to send signin code");
      }
    },
  });
}

/** Sign in with code — `POST /api/auth/signin-code`. */
export function useSigninCode() {
  const queryClient = useQueryClient();
  return useMutation<
    AuthMutationResult,
    never,
    { email: string; code: string }
  >({
    mutationFn: async ({ email, code }) => {
      try {
        const response = await apiClient.post("/auth/signin-code", {
          email,
          code,
        });
        const newUser = response.data?.user as User | undefined;
        if (newUser) {
          queryClient.setQueryData(queryKeys.auth.me(), newUser);
        }
        return { success: true };
      } catch (error) {
        return buildErrorResult(error, "Signin with code failed");
      }
    },
  });
}

/** Request password reset — `POST /api/auth/request-password-reset`. */
export function useRequestPasswordReset() {
  return useMutation<AuthMutationResultWithRetry, never, { email: string }>({
    mutationFn: async ({ email }) => {
      try {
        const response = await apiClient.post("/auth/request-password-reset", {
          email,
        });
        return { success: true, message: response.data?.message };
      } catch (error) {
        return buildErrorResult(error, "Failed to send password reset code");
      }
    },
  });
}

/** Reset password with code — `POST /api/auth/reset-password`. */
export function useResetPassword() {
  return useMutation<
    AuthMutationResult,
    never,
    { email: string; code: string; newPassword: string }
  >({
    mutationFn: async ({ email, code, newPassword }) => {
      try {
        const response = await apiClient.post("/auth/reset-password", {
          email,
          code,
          newPassword,
        });
        return { success: true, message: response.data?.message };
      } catch (error) {
        return buildErrorResult(error, "Password reset failed");
      }
    },
  });
}

/** Request email change — `POST /api/auth/request-email-change`. */
export function useRequestEmailChange() {
  return useMutation<AuthMutationResultWithRetry, never, { newEmail: string }>({
    mutationFn: async ({ newEmail }) => {
      try {
        const response = await apiClient.post("/auth/request-email-change", {
          newEmail,
        });
        return { success: true, message: response.data?.message };
      } catch (error) {
        return buildErrorResult(error, "Failed to send email change code");
      }
    },
  });
}

/** Confirm email change — `POST /api/auth/confirm-email-change`. Patches `email` and `emailVerified`. */
export function useConfirmEmailChange() {
  const queryClient = useQueryClient();
  return useMutation<AuthMutationResultWithEmail, never, { code: string }>({
    mutationFn: async ({ code }) => {
      try {
        const response = await apiClient.post("/auth/confirm-email-change", {
          code,
        });
        const newEmail = response.data?.newEmail as string | undefined;
        if (newEmail) {
          queryClient.setQueryData<User | null>(queryKeys.auth.me(), (old) =>
            old ? { ...old, email: newEmail, emailVerified: true } : old,
          );
        }
        return { success: true, message: response.data?.message, newEmail };
      } catch (error) {
        return buildErrorResult(error, "Email change confirmation failed");
      }
    },
  });
}

/** Unlink Google — `POST /api/auth/google/unlink`. Clears `googleId`. */
export function useUnlinkGoogle() {
  const queryClient = useQueryClient();
  return useMutation<AuthMutationResult, never, void>({
    mutationFn: async () => {
      try {
        const response = await apiClient.post("/auth/google/unlink");
        queryClient.setQueryData<User | null>(queryKeys.auth.me(), (old) =>
          old ? { ...old, googleId: undefined } : old,
        );
        return { success: true, message: response.data?.message };
      } catch (error) {
        return buildErrorResult(error, "Failed to unlink Google account");
      }
    },
  });
}

/** Delete account — `DELETE /api/account`. Clears the entire query cache. */
export function useDeleteAccount() {
  const queryClient = useQueryClient();
  return useMutation<AuthMutationResult, never, void>({
    mutationFn: async () => {
      try {
        await apiClient.delete("/account");
        queryClient.clear();
        return { success: true, message: "Account permanently deleted" };
      } catch (error) {
        return buildErrorResult(error, "Failed to delete account");
      }
    },
  });
}
