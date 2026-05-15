/**
 * DynamicBlockContext — Step 2.22
 *
 * Provides context for the dynamic block system:
 * - Pre-fetched SSR data hydration
 * - Loading / error state tracking per block
 * - Block registration for dynamic data fetching
 * - Block type capability checking
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/* ---------------- Window type augmentation (SSR hydration) ---------------- */
declare global {
  interface Window {
    __DYNAMIC_BLOCK_DATA__?: Record<number, any>;
  }
}

/* ---------------- Block types that support dynamic data loading ---------------- */
// Must match backend registry (contentTypes/registry.js) isDynamic: true blocks.
// Blocks in this set may either:
// (a) rely on DynamicBlockInner to fetch via block.content.dataSource, or
// (b) self-fetch inside their own component (e.g. ReviewsBlock, EventsListBlock).
// In case (b) the DynamicBlockInner wrapper short-circuits (dataSource is null)
// and renders BlockRenderer directly, so inclusion here is safe.
const DYNAMIC_BLOCK_TYPES = new Set([
  "BLOG_FEED",
  "BLOG_ARTICLE",
  "PRODUCT_SHOWCASE",
  "DIRECTORY_LISTING",
  "REVIEWS",
  "EVENTS_LIST",
]);

/* ---------------- Types ---------------- */
export interface DynamicBlockContextType {
  /** Pre-fetched data keyed by block ID (from SSR or client fetch) */
  dynamicData: Map<number, any>;
  /** Block IDs currently loading data */
  loadingBlocks: Set<number>;
  /** Block IDs with fetch errors (blockId → error message) */
  errorBlocks: Map<number, string>;
  /** Register a block for dynamic loading */
  registerDynamicBlock: (blockId: number, dataSource: string) => void;
  /** Trigger re-fetch for a specific block (clears cached data) */
  refreshBlock: (blockId: number) => void;
  /** Check if a block type supports dynamic data */
  isBlockDynamic: (blockType: string) => boolean;
}

interface DynamicBlockProviderProps {
  children: ReactNode;
}

/* ---------------- Context ---------------- */
export const DynamicBlockContext = createContext<
  DynamicBlockContextType | undefined
>(undefined);

/* ---------------- Provider ---------------- */
export const DynamicBlockProvider: React.FC<DynamicBlockProviderProps> = ({
  children,
}) => {
  // Hydrate from SSR-injected window data on first render.
  // Guards: (1) window may be undefined in non-browser environments,
  //         (2) the property may not be a plain object (XSS attempt, wrong type),
  //         (3) prototype-polluted keys (__proto__, constructor) are skipped.
  const [dynamicData, setDynamicData] = useState<Map<number, any>>(() => {
    try {
      const ssrData =
        typeof window !== "undefined"
          ? window.__DYNAMIC_BLOCK_DATA__
          : undefined;
      if (!ssrData || typeof ssrData !== "object" || Array.isArray(ssrData))
        return new Map();
      const entries: [number, any][] = [];
      for (const key of Object.keys(ssrData)) {
        // Skip prototype-polluting keys
        if (key === "__proto__" || key === "constructor" || key === "prototype")
          continue;
        const id = Number(key);
        if (!Number.isFinite(id) || id <= 0) continue; // block IDs must be positive integers
        entries.push([id, (ssrData as Record<string, any>)[key]]);
      }
      return new Map(entries);
    } catch {
      return new Map();
    }
  });

  const [loadingBlocks, setLoadingBlocks] = useState<Set<number>>(new Set());
  const [errorBlocks, setErrorBlocks] = useState<Map<number, string>>(
    new Map(),
  );

  const registerDynamicBlock = useCallback(
    (blockId: number, _dataSource: string) => {
      // Mark the block as loading if it doesn't have data yet
      setDynamicData((prev) => {
        if (prev.has(blockId)) return prev; // already hydrated
        return prev;
      });
      setLoadingBlocks((prev) => {
        if (prev.has(blockId)) return prev;
        const next = new Set(prev);
        next.add(blockId);
        return next;
      });
    },
    [],
  );

  const refreshBlock = useCallback((blockId: number) => {
    // Clear cached data so the hook re-fetches
    setDynamicData((prev) => {
      const next = new Map(prev);
      next.delete(blockId);
      return next;
    });
    // Clear any existing error
    setErrorBlocks((prev) => {
      if (!prev.has(blockId)) return prev;
      const next = new Map(prev);
      next.delete(blockId);
      return next;
    });
    // Mark as loading
    setLoadingBlocks((prev) => {
      const next = new Set(prev);
      next.add(blockId);
      return next;
    });
  }, []);

  const isBlockDynamic = useCallback((blockType: string): boolean => {
    return DYNAMIC_BLOCK_TYPES.has(blockType);
  }, []);

  const value = useMemo<DynamicBlockContextType>(
    () => ({
      dynamicData,
      loadingBlocks,
      errorBlocks,
      registerDynamicBlock,
      refreshBlock,
      isBlockDynamic,
    }),
    [
      dynamicData,
      loadingBlocks,
      errorBlocks,
      registerDynamicBlock,
      refreshBlock,
      isBlockDynamic,
    ],
  );

  return (
    <DynamicBlockContext.Provider value={value}>
      {children}
    </DynamicBlockContext.Provider>
  );
};

/* ---------------- Consumer hook ---------------- */
export const useDynamicBlockContext = (): DynamicBlockContextType => {
  const context = useContext(DynamicBlockContext);
  if (!context) {
    throw new Error(
      "useDynamicBlockContext must be used within a DynamicBlockProvider. " +
        "Wrap your component tree with <DynamicBlockProvider>.",
    );
  }
  return context;
};
