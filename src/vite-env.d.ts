/// <reference types="vite/client" />

// Augment the default Vite environment interfaces with our custom vars
// (all VITE_ prefixed variables are exposed to the client).
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_DUMMY_DIRECTORY?: string;
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
  // add other VITE_ variables here as needed
  // the following index signature can provide flexibility for future env vars
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
