const LOCAL_API_URL = 'http://localhost:5001/api';

const trimTrailingSlashes = (value: string) => value.trim().replace(/\/+$/, '');

const ensureApiPath = (value?: string) => {
  const trimmed = value ? trimTrailingSlashes(value) : '';
  if (!trimmed) return LOCAL_API_URL;
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
};

const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const hasProxyTarget = Boolean(import.meta.env.VITE_API_PROXY_TARGET?.trim());
const directApiUrl = ensureApiPath(rawApiUrl || LOCAL_API_URL);

const shouldUseDevProxy = import.meta.env.DEV && hasProxyTarget && !rawApiUrl;

export const API_URL = shouldUseDevProxy ? '/api' : directApiUrl;
export const DIRECT_API_URL = directApiUrl;

const getBrowserWsOrigin = () => {
  if (typeof window === 'undefined') {
    return 'ws://localhost:5173';
  }

  return `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.host}`;
};

export const buildWebSocketUrl = (
  token: string,
  params?: Record<string, string | number | boolean | undefined | null>
) => {
  const wsBase = API_URL.startsWith('/')
    ? getBrowserWsOrigin()
    : API_URL.replace(/^http/, 'ws').replace(/\/api$/, '');
  const url = new URL('/ws', `${wsBase.replace(/\/+$/, '')}/`);

  url.searchParams.set('token', token);

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
};
