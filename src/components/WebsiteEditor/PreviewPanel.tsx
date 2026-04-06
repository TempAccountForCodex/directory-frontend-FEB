/**
 * PreviewPanel — Steps 4.6.4 + 5.1.1 + 5.1.4 + 5.1.5
 *
 * Iframe-based preview panel for the website editor.
 * Supports two modes:
 * - Live: srcdoc-based, zero-network preview from editor state (default)
 * - Static: API URL-based iframe with token auth (fallback)
 *
 * Features: viewport toggle, zoom controls, rotation, device frame,
 * postMessage bridge, error handling with auto-fallback.
 */
import React from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import Button from "@mui/material/Button";
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Maximize2,
  Minimize2,
  RotateCw,
} from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { usePreviewIframe } from "../../hooks/usePreviewApi";
import {
  PreviewImageError,
  PreviewNetworkError,
} from "../Templates/PreviewSkeleton";
import { usePreview } from "../../context/PreviewContext";
import { generateLivePreview } from "../../utils/previewInjector";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Viewport = "desktop" | "tablet" | "mobile";
type PreviewMode = "live" | "static";
type ZoomLevel = 0.5 | 0.75 | 1;

const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  desktop: 1920,
  tablet: 768,
  mobile: 375,
};

const VIEWPORT_HEIGHTS: Record<Viewport, number> = {
  desktop: 1080,
  tablet: 1024,
  mobile: 812,
};

const TIMEOUT_MS = 10_000;

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

/** Step 9.16.3: Inline edit start data from iframe EDIT_START message */
export interface InlineEditStartData {
  blockId: string;
  fieldPath: string;
  value: string;
  rect: { top: number; left: number; width: number; height: number };
  editType: "single" | "multi";
}

interface PreviewPanelProps {
  websiteId: string | number;
  pageId: string | number;
  /** Step 9.14.3: Called when a block is clicked in the iframe preview */
  onBlockSelected?: (blockId: string) => void;
  /** Step 9.14.3: Called when a block is hovered/unhovered in the iframe preview */
  onBlockHover?: (blockId: string | null) => void;
  /** Step 9.14.3: Currently selected block ID — synced back to iframe for visual highlight */
  selectedBlockId?: string | null;
  /** Step 9.16.3: Called when a data-editable element is double-clicked in the iframe */
  onInlineEditStart?: (data: InlineEditStartData) => void;
  /** Step 9.16.3: Exposes the iframe ref for InlineTextEditor positioning */
  iframeRefCallback?: (ref: React.RefObject<HTMLIFrameElement>) => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const PreviewPanel = React.memo(function PreviewPanel({
  websiteId,
  pageId,
  onBlockSelected,
  onBlockHover,
  selectedBlockId,
  onInlineEditStart,
  iframeRefCallback,
}: PreviewPanelProps) {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // Editor-preview state bridge
  const previewCtx = usePreview();

  // Local state
  const [viewport, setViewport] = React.useState<Viewport>("desktop");
  const [scaleToFit, setScaleToFit] = React.useState(true);
  const [mode, setMode] = React.useState<PreviewMode>("live");
  const [zoom, setZoom] = React.useState<ZoomLevel>(1);
  const [rotated, setRotated] = React.useState(false);
  const [timedOut, setTimedOut] = React.useState(false);
  const [fallbackActive, setFallbackActive] = React.useState(false);

  // Refs
  const iframeRef = React.useRef<HTMLIFrameElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  // Step 9.16.3: Expose iframe ref to parent for InlineTextEditor positioning
  React.useEffect(() => {
    iframeRefCallback?.(iframeRef);
  }, [iframeRefCallback]);

  // Static mode hook (existing Step 4.6/4.9 behavior)
  const {
    src,
    iframeLoading,
    iframeError,
    tokenExpired,
    onLoad: staticOnLoad,
    onError: staticOnError,
    refresh,
  } = usePreviewIframe(websiteId, pageId, viewport);

  // Auto-fallback: if previewError is set and we're in live mode, switch to static
  const effectiveMode = React.useMemo(() => {
    if (mode === "live" && previewCtx.previewError) {
      return "static";
    }
    return mode;
  }, [mode, previewCtx.previewError]);

  // Track fallback state
  React.useEffect(() => {
    if (mode === "live" && previewCtx.previewError) {
      setFallbackActive(true);
    } else if (mode === "live" && !previewCtx.previewError) {
      setFallbackActive(false);
    }
  }, [mode, previewCtx.previewError]);

  // Generate srcdoc for live mode
  const srcdocHtml = React.useMemo(() => {
    if (effectiveMode !== "live" || !previewCtx.currentPageContent) {
      return null;
    }

    const { blocks, websiteMeta } = previewCtx.currentPageContent;
    const website = {
      name: websiteMeta?.name || "Preview",
      colors: websiteMeta?.colors,
      fonts: websiteMeta?.fonts,
    };
    const page = {
      id: previewCtx.currentPageContent.pageId,
      title: websiteMeta?.name || "Preview",
    };

    return generateLivePreview(website, page, blocks, window.location.origin);
  }, [effectiveMode, previewCtx.currentPageContent, previewCtx.revision]);

  // PostMessage: send CONTENT_UPDATE to iframe
  const sendPostMessage = React.useCallback(
    (message: Record<string, unknown>) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          message,
          window.location.origin,
        );
      }
    },
    [],
  );

  // PostMessage listener for messages from iframe
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== "null")
        return;

      const data = event.data;
      if (!data || typeof data !== "object") return;

      if (data.type === "CSP_VIOLATION") {
        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.error("[PreviewPanel] CSP violation in iframe:", data.detail);
        }
      }

      // Step 9.14.3: Relay block selection events to parent
      if (data.type === "BLOCK_SELECTED") {
        onBlockSelected?.(data.blockId as string);
      }

      if (data.type === "BLOCK_HOVER") {
        onBlockHover?.(data.blockId as string | null);
      }

      // Step 9.16.3: Relay inline edit start from iframe
      if (data.type === "EDIT_START" && data.blockId && data.fieldPath) {
        onInlineEditStart?.({
          blockId: data.blockId as string,
          fieldPath: data.fieldPath as string,
          value: data.value as string,
          rect: data.rect as {
            top: number;
            left: number;
            width: number;
            height: number;
          },
          editType: (data.editType as "single" | "multi") || "single",
        });
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onBlockSelected, onBlockHover, onInlineEditStart]);

  // Send VIEWPORT_CHANGE when viewport or zoom changes
  React.useEffect(() => {
    sendPostMessage({
      type: "VIEWPORT_CHANGE",
      viewport,
      zoom,
      rotated,
    });
  }, [viewport, zoom, rotated, sendPostMessage]);

  // Step 9.14.3: Sync selectedBlockId to iframe via postMessage
  React.useEffect(() => {
    if (selectedBlockId) {
      sendPostMessage({ type: "SELECT_BLOCK", blockId: selectedBlockId });
    } else if (selectedBlockId === null) {
      sendPostMessage({ type: "DESELECT_ALL" });
    }
  }, [selectedBlockId, sendPostMessage]);

  // Timeout detection for loading state
  React.useEffect(() => {
    if (iframeLoading && effectiveMode === "static") {
      timeoutRef.current = setTimeout(() => {
        setTimedOut(true);
      }, TIMEOUT_MS);
    } else {
      setTimedOut(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [iframeLoading, effectiveMode]);

  // Live mode timeout: detect if srcdoc iframe takes too long to load
  const [liveTimedOut, setLiveTimedOut] = React.useState(false);
  const liveTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    if (effectiveMode === "live" && srcdocHtml) {
      setLiveTimedOut(false);
      liveTimeoutRef.current = setTimeout(() => {
        setLiveTimedOut(true);
      }, TIMEOUT_MS);
    }
    return () => {
      if (liveTimeoutRef.current) {
        clearTimeout(liveTimeoutRef.current);
        liveTimeoutRef.current = null;
      }
    };
  }, [effectiveMode, srcdocHtml]);

  // Clear live timeout when iframe loads
  const handleLiveIframeLoad = React.useCallback(() => {
    setLiveTimedOut(false);
    if (liveTimeoutRef.current) {
      clearTimeout(liveTimeoutRef.current);
      liveTimeoutRef.current = null;
    }
  }, []);

  // Viewport change handler
  const handleViewportChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, value: Viewport | null) => {
      if (value) {
        setViewport(value);
        setRotated(false); // Reset rotation on viewport change
      }
    },
    [],
  );

  // Mode change handler
  const handleModeChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, value: PreviewMode | null) => {
      if (value) {
        setMode(value);
        setTimedOut(false);
        setLiveTimedOut(false);
        if (value === "live") {
          setFallbackActive(false);
        }
      }
    },
    [],
  );

  // Zoom change handler
  const handleZoomChange = React.useCallback(
    (_: React.MouseEvent<HTMLElement>, value: ZoomLevel | null) => {
      if (value !== null) setZoom(value);
    },
    [],
  );

  // Rotation handler
  const handleRotate = React.useCallback(() => {
    setRotated((prev) => !prev);
  }, []);

  // Retry handler
  const handleRetry = React.useCallback(() => {
    setTimedOut(false);
    setLiveTimedOut(false);
    if (mode === "live") {
      previewCtx.refreshPreview();
    }
    refresh();
  }, [mode, refresh, previewCtx]);

  // Try live again handler
  const handleTryLiveAgain = React.useCallback(() => {
    setMode("live");
    setFallbackActive(false);
    previewCtx.setPreviewError(null);
  }, [previewCtx]);

  // Calculate dimensions
  const baseWidth = VIEWPORT_WIDTHS[viewport];
  const baseHeight = VIEWPORT_HEIGHTS[viewport];
  const displayWidth = rotated ? baseHeight : baseWidth;
  const displayHeight = rotated ? baseWidth : baseHeight;

  // Container width for scale-to-fit
  const [containerWidth, setContainerWidth] = React.useState(0);
  React.useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Scale factor: combine scale-to-fit with zoom
  const fitScale =
    scaleToFit && containerWidth > 0
      ? Math.min(1, containerWidth / displayWidth)
      : 1;
  const effectiveScale = fitScale * zoom;

  // Screen reader announcements
  const [viewportAnnouncement, setViewportAnnouncement] = React.useState("");
  React.useEffect(() => {
    setViewportAnnouncement(`Preview switched to ${viewport} view`);
    const timer = setTimeout(() => setViewportAnnouncement(""), 1000);
    return () => clearTimeout(timer);
  }, [viewport]);

  // Should show device frame (mobile only)
  const showDeviceFrame = viewport === "mobile";

  // Determine if we show the "no src" placeholder
  const hasContent =
    effectiveMode === "live" ? !!previewCtx.currentPageContent : !!src;

  if (!hasContent && !src) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          minHeight: 300,
          color: colors.textSecondary,
        }}
      >
        <Typography variant="body2">Select a page to preview</Typography>
      </Box>
    );
  }

  // Determine the current timeout state
  const isTimedOut = effectiveMode === "static" ? timedOut : liveTimedOut;
  const isLoading = effectiveMode === "static" ? iframeLoading : false;
  const isError = effectiveMode === "static" ? iframeError : false;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: `1px solid ${colors.border}`,
        borderRadius: 2,
        overflow: "hidden",
        backgroundColor: colors.panelBg,
      }}
    >
      {/* Screen reader announcement */}
      <Box
        role="status"
        aria-live="polite"
        aria-atomic
        sx={{
          position: "absolute",
          width: 1,
          height: 1,
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
        }}
      >
        {viewportAnnouncement}
      </Box>

      {/* Toolbar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          borderBottom: `1px solid ${colors.border}`,
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        {/* Left: Viewport toggle + Mode toggle */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          {/* Viewport toggle */}
          <ToggleButtonGroup
            value={viewport}
            exclusive
            onChange={handleViewportChange}
            size="small"
            aria-label="Preview viewport"
            sx={{
              "& .MuiToggleButton-root": {
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
                minWidth: 44,
                minHeight: 36,
                "&.Mui-selected": {
                  backgroundColor: "rgba(55,140,146,0.15)",
                  color: "#378C92",
                  borderColor: "#378C92",
                  "&:hover": { backgroundColor: "rgba(55,140,146,0.25)" },
                },
              },
            }}
          >
            <ToggleButton value="desktop" aria-label="Desktop view">
              <Tooltip title="Desktop (1920px)">
                <Monitor size={16} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="tablet" aria-label="Tablet view">
              <Tooltip title="Tablet (768px)">
                <Tablet size={16} />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="mobile" aria-label="Mobile view">
              <Tooltip title="Mobile (375px)">
                <Smartphone size={16} />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Mode toggle (Live / Static) */}
          <ToggleButtonGroup
            value={effectiveMode}
            exclusive
            onChange={handleModeChange}
            size="small"
            aria-label="Preview mode"
            sx={{
              "& .MuiToggleButton-root": {
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
                fontSize: "0.75rem",
                px: 1.5,
                minHeight: 36,
                textTransform: "none",
                "&.Mui-selected": {
                  backgroundColor: "rgba(55,140,146,0.15)",
                  color: "#378C92",
                  borderColor: "#378C92",
                  "&:hover": { backgroundColor: "rgba(55,140,146,0.25)" },
                },
              },
            }}
          >
            <ToggleButton value="live" aria-label="Live mode">
              Live
            </ToggleButton>
            <ToggleButton value="static" aria-label="Static mode">
              Static
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Viewport size display */}
          <Typography
            variant="caption"
            sx={{
              color: colors.textSecondary,
              fontFamily: "monospace",
              minWidth: 80,
            }}
          >
            {displayWidth} &times; {displayHeight}
          </Typography>
        </Box>

        {/* Right: Zoom + Rotation + Scale-to-fit + Refresh */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Zoom controls */}
          <ToggleButtonGroup
            value={zoom}
            exclusive
            onChange={handleZoomChange}
            size="small"
            aria-label="Zoom level"
            sx={{
              "& .MuiToggleButton-root": {
                border: `1px solid ${colors.border}`,
                color: colors.textSecondary,
                fontSize: "0.7rem",
                px: 1,
                minHeight: 32,
                "&.Mui-selected": {
                  backgroundColor: "rgba(55,140,146,0.15)",
                  color: "#378C92",
                  borderColor: "#378C92",
                },
              },
            }}
          >
            <ToggleButton value={0.5} aria-label="50%">
              50%
            </ToggleButton>
            <ToggleButton value={0.75} aria-label="75%">
              75%
            </ToggleButton>
            <ToggleButton value={1} aria-label="100%">
              100%
            </ToggleButton>
          </ToggleButtonGroup>

          {/* Rotation toggle (mobile/tablet only) */}
          {viewport !== "desktop" && (
            <Tooltip title={rotated ? "Portrait" : "Landscape"}>
              <IconButton
                onClick={handleRotate}
                size="small"
                aria-label="Rotate viewport"
                sx={{
                  color: colors.textSecondary,
                  "&:hover": { color: "#378C92" },
                }}
              >
                <RotateCw size={16} />
              </IconButton>
            </Tooltip>
          )}

          <FormControlLabel
            control={
              <Switch
                checked={scaleToFit}
                onChange={(_, checked) => setScaleToFit(checked)}
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                {scaleToFit ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                <Typography
                  variant="caption"
                  sx={{ color: colors.textSecondary }}
                >
                  {scaleToFit ? "Fit" : "Actual"}
                </Typography>
              </Box>
            }
            sx={{ mr: 0.5 }}
          />

          <Tooltip title="Refresh preview">
            <IconButton
              onClick={refresh}
              size="small"
              aria-label="Refresh preview"
              sx={{
                color: colors.textSecondary,
                minWidth: 44,
                minHeight: 44,
                "&:hover": { color: "#378C92" },
              }}
            >
              <RefreshCw size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Fallback banner (5.1.5) */}
      {fallbackActive && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            px: 2,
            py: 0.75,
            backgroundColor: "rgba(245,158,11,0.15)",
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Typography variant="caption" sx={{ color: colors.textSecondary }}>
            Switched to static preview
          </Typography>
          <Button
            size="small"
            onClick={handleTryLiveAgain}
            aria-label="Try live again"
            sx={{ textTransform: "none", fontSize: "0.75rem" }}
          >
            Try Live Again
          </Button>
        </Box>
      )}

      {/* Preview Area */}
      <Box
        ref={containerRef}
        sx={{
          flex: 1,
          overflow: scaleToFit ? "hidden" : "auto",
          position: "relative",
          display: "flex",
          justifyContent: "center",
          backgroundColor:
            actualTheme === "dark" ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.03)",
        }}
      >
        {/* Loading overlay */}
        {isLoading && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2,
              backgroundColor:
                actualTheme === "dark"
                  ? "rgba(0,0,0,0.5)"
                  : "rgba(255,255,255,0.7)",
              gap: 1,
            }}
          >
            <CircularProgress size={32} sx={{ color: "#378C92" }} />
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              Loading preview...
            </Typography>
          </Box>
        )}

        {/* Timeout error UI (5.1.5) */}
        {isTimedOut && (
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 3,
              backgroundColor:
                actualTheme === "dark"
                  ? "rgba(0,0,0,0.7)"
                  : "rgba(255,255,255,0.9)",
              gap: 1,
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: colors.text, fontWeight: 500 }}
            >
              Preview timed out
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleRetry}
              aria-label="Retry preview"
              sx={{ textTransform: "none" }}
            >
              Retry
            </Button>
          </Box>
        )}

        {/* Token expired banner */}
        {tokenExpired && !isLoading && effectiveMode === "static" && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 3,
              p: 1,
              backgroundColor: "rgba(245,158,11,0.9)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 500 }}>
              Preview session expired
            </Typography>
            <IconButton
              onClick={refresh}
              size="small"
              sx={{ color: "#fff", minWidth: 36, minHeight: 36 }}
              aria-label="Refresh expired preview"
            >
              <RefreshCw size={14} />
            </IconButton>
          </Box>
        )}

        {/* Error state (static mode) */}
        {isError && !isLoading && effectiveMode === "static" ? (
          navigator.onLine === false ? (
            <PreviewNetworkError onRetry={refresh} />
          ) : (
            <PreviewImageError
              onRetry={refresh}
              message="Failed to load website preview"
            />
          )
        ) : (
          /* Iframe container with optional device frame */
          <Box
            sx={{
              width: scaleToFit ? displayWidth : displayWidth,
              height: scaleToFit ? `${100 / effectiveScale}%` : "100%",
              transform: `scale(${effectiveScale})`,
              transformOrigin: "top center",
              minHeight: scaleToFit ? 0 : 600,
              transition: "width 0.3s ease, transform 0.3s ease",
              position: "relative",
              ...(showDeviceFrame && {
                border: "3px solid #333",
                borderRadius: "24px",
                overflow: "hidden",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 80,
                  height: 4,
                  backgroundColor: "#555",
                  borderRadius: "0 0 4px 4px",
                  zIndex: 1,
                },
              }),
            }}
          >
            <iframe
              ref={iframeRef}
              {...(effectiveMode === "live" && srcdocHtml
                ? { srcDoc: srcdocHtml }
                : { src })}
              title={`Website preview - ${viewport}`}
              onLoad={
                effectiveMode === "live" ? handleLiveIframeLoad : staticOnLoad
              }
              onError={effectiveMode === "static" ? staticOnError : undefined}
              sandbox="allow-same-origin allow-scripts"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                display: "block",
                minHeight: 600,
              }}
              aria-label={`Website preview in ${viewport} mode`}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
});

export default PreviewPanel;
