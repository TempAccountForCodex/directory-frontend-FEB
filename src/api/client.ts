import axios, { isAxiosError, isCancel } from 'axios';
import { API_URL } from '@/config/api';

/**
 * Shared axios instance for the app. All future HTTP traffic routes through
 * this client so interceptors, baseURL, and cookie handling live in one place.
 */
export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
});

// Re-export the small number of axios helpers callers need so production code
// never has to import directly from 'axios'. The ESLint `no-restricted-imports`
// rule bans raw axios imports outside this file.
export { isAxiosError, isCancel };

// Defensive: if a previous session left a literal "null" in the Authorization
// header (seen in the wild from old code paths), strip it so requests don't
// send invalid auth. See AuthContext for the original guard.
// Optional chaining guards against partially-mocked axios in test environments
// where `axios.create()` may return an object without full defaults/headers.
const existingAuth = apiClient?.defaults?.headers?.common?.Authorization;
if (typeof existingAuth === 'string' && existingAuth.includes('null')) {
  delete apiClient.defaults.headers.common.Authorization;
}

export default apiClient;
