/**
 * PreviewContext — Step 5.1.2
 *
 * React context and hook for managing real-time preview state
 * in the website editor. Bridges editor state changes to the
 * preview panel via debounced content updates.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

/** A single block within a page */
export interface PreviewBlock {
  id: string;
  blockType: string;
  content: Record<string, unknown>;
  order: number;
  designTokens?: Record<string, unknown>;
}

/** Page content that the preview renders */
export interface PageContent {
  websiteId: string;
  pageId: string;
  blocks: PreviewBlock[];
  websiteMeta?: {
    name?: string;
    theme?: Record<string, unknown>;
    fonts?: Record<string, string>;
    colors?: Record<string, string>;
  };
}

export type Viewport = "desktop" | "tablet" | "mobile";

/** Readonly state exposed by the context */
export interface PreviewState {
  currentPageContent: PageContent | null;
  viewport: Viewport;
  isPreviewLoading: boolean;
  previewError: string | null;
  revision: number;
}

/** Actions exposed by the context */
export interface PreviewActions {
  updatePreviewContent: (content: PageContent) => void;
  setViewport: (viewport: Viewport) => void;
  refreshPreview: () => void;
  setPreviewError: (error: string | null) => void;
  setIsPreviewLoading: (loading: boolean) => void;
}

type PreviewContextType = PreviewState & PreviewActions;

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

const PreviewContext = createContext<PreviewContextType | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  Provider                                                           */
/* ------------------------------------------------------------------ */

const DEBOUNCE_MS = 300;

interface PreviewProviderProps {
  children: ReactNode;
}

export const PreviewProvider: React.FC<PreviewProviderProps> = ({
  children,
}) => {
  const [currentPageContent, setCurrentPageContent] =
    useState<PageContent | null>(null);
  const [viewport, setViewportState] = useState<Viewport>("desktop");
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [revision, setRevision] = useState(0);

  // Debounce timer ref — cleaned up on unmount
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const updatePreviewContent = useCallback((content: PageContent) => {
    // Clear existing timer to reset debounce
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      setCurrentPageContent(content);
      debounceTimerRef.current = null;
    }, DEBOUNCE_MS);
  }, []);

  const setViewport = useCallback((vp: Viewport) => {
    setViewportState(vp);
  }, []);

  const refreshPreview = useCallback(() => {
    setRevision((prev) => prev + 1);
  }, []);

  const setPreviewErrorCb = useCallback((error: string | null) => {
    setPreviewError(error);
  }, []);

  const setIsPreviewLoadingCb = useCallback((loading: boolean) => {
    setIsPreviewLoading(loading);
  }, []);

  const value = useMemo<PreviewContextType>(
    () => ({
      currentPageContent,
      viewport,
      isPreviewLoading,
      previewError,
      revision,
      updatePreviewContent,
      setViewport,
      refreshPreview,
      setPreviewError: setPreviewErrorCb,
      setIsPreviewLoading: setIsPreviewLoadingCb,
    }),
    [
      currentPageContent,
      viewport,
      isPreviewLoading,
      previewError,
      revision,
      updatePreviewContent,
      setViewport,
      refreshPreview,
      setPreviewErrorCb,
      setIsPreviewLoadingCb,
    ],
  );

  return (
    <PreviewContext.Provider value={value}>{children}</PreviewContext.Provider>
  );
};

/* ------------------------------------------------------------------ */
/*  Consumer hook                                                      */
/* ------------------------------------------------------------------ */

export const usePreview = (): PreviewContextType => {
  const context = useContext(PreviewContext);
  if (!context) {
    throw new Error(
      "usePreview must be used within a PreviewProvider. " +
        "Wrap your component tree with <PreviewProvider>.",
    );
  }
  return context;
};

export default PreviewContext;
