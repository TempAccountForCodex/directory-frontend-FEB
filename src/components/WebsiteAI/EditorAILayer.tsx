/**
 * EditorAILayer — single mount point for all editor-side website AI UI.
 *
 * Renders:
 *  - A floating AI action bar (current target + Ask AI + Undo AI).
 *  - The Ask AI dialog (selected field/section/page).
 *  - The conflict resolution dialog.
 *  - The toggleable right-side AI chat panel.
 *
 * It is intentionally self-contained: the editor only passes the current
 * selection, an apply callback, a value reader, and access state.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { Check, Sparkles, Undo2, Redo2, MessageSquare, X } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { useEditorAI, type AITargetRef } from "./useEditorAI";
import { toPersistedBlockContentPath } from "./aiPatchUtils";
import AskAIDialog from "./AskAIDialog";
import AIConflictDialog from "./AIConflictDialog";
import AIChatPanel from "./AIChatPanel";
import type { AIHistoryEntry, VersionMeta } from "../../api/websiteAI";
import { useRotatingPhrase } from "@/hooks/useRotatingPhrase";
import { Fade } from "@mui/material";

export interface EditorAISelection {
  editable?: {
    blockId: string | number;
    fieldPath: string;
    persistedFieldPath?: string;
    label?: string;
    aiEditKey?: string;
    computedStyle?: AITargetRef["computedStyle"];
    styleTarget?: {
      blockId?: string | number;
      fieldPath: string;
      persistedFieldPath?: string;
      aiEditKey?: string;
      label?: string;
      computedStyle?: AITargetRef["computedStyle"];
    };
    styleTargets?: Array<{
      blockId?: string | number;
      fieldPath: string;
      persistedFieldPath?: string;
      aiEditKey?: string;
      label?: string;
      category?: string;
      computedStyle?: AITargetRef["computedStyle"];
    }>;
  } | null;
  section?: {
    blockId: string | number;
    label?: string;
    fieldPath?: string;
    persistedFieldPath?: string;
    aiEditKey?: string;
  } | null;
  page?: {
    id: string | number;
    title?: string;
  } | null;
}

export interface EditorAILayerProps {
  websiteId: number;
  websiteName?: string;
  pageId: number | null;
  canUseAI: boolean;
  disabledReason: string | null;
  /** Controlled open state for the docked AI chat panel. */
  chatOpen?: boolean;
  onChatOpenChange?: (open: boolean) => void;
  /** DOM node (the editor's right-rail / style-bar slot) to portal the chat into. */
  chatDockNode?: HTMLElement | null;
  selection: EditorAISelection;
  revertibleTurns?: AIHistoryEntry[];
  aiHistory?: AIHistoryEntry[];
  versions?: VersionMeta[];
  openAskSignal?: number;
  openAskAnchorRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
  getCurrentValue: (
    blockId: string | number | undefined,
    fieldPath: string,
  ) => unknown;
  applyPatch: (
    blockId: string | number | undefined,
    fieldPath: string,
    value: unknown,
  ) => void;
  onLocalPatchesApplied?: () => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  onAskAIButtonStatusChange?: (
    status: "idle" | "open" | "loading" | "success" | "error",
  ) => void;
}

type AIPillStatus = "idle" | "loading" | "success" | "error" | "draining";
type AIPillResult = "success" | "error";

const LIQUID_BUBBLES = [
  { left: "10%", size: 6, delay: "0s", duration: "2s" },
  { left: "25%", size: 8, delay: "0.5s", duration: "2.5s" },
  { left: "40%", size: 5, delay: "1s", duration: "1.8s" },
  { left: "55%", size: 7, delay: "0.2s", duration: "2.2s" },
  { left: "70%", size: 9, delay: "0.8s", duration: "2.7s" },
  { left: "85%", size: 6, delay: "1.5s", duration: "2.1s" },
];

const EditorAILayer: React.FC<EditorAILayerProps> = ({
  websiteId,
  websiteName,
  pageId,
  canUseAI,
  disabledReason,
  chatOpen: chatOpenProp,
  onChatOpenChange,
  chatDockNode,
  selection,
  revertibleTurns,
  aiHistory,
  versions,
  openAskSignal,
  openAskAnchorRect,
  getCurrentValue,
  applyPatch,
  onLocalPatchesApplied,
  onRefresh,
  onAskAIButtonStatusChange,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [askOpen, setAskOpen] = useState(false);
  const [dialogAnchorRect, setDialogAnchorRect] =
    useState<EditorAILayerProps["openAskAnchorRect"]>(null);
  const chatOpen = chatOpenProp ?? false;
  const setChatOpen = useCallback(
    (next: boolean | ((prev: boolean) => boolean)) => {
      const value = typeof next === "function" ? next(chatOpen) : next;
      onChatOpenChange?.(value);
    },
    [chatOpen, onChatOpenChange],
  );
  const lastOpenAskSignalRef = useRef(openAskSignal ?? 0);
  const [pillStatus, setPillStatus] = useState<AIPillStatus>("idle");
  const [lastPillResult, setLastPillResult] = useState<AIPillResult>("success");
  const pillTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const controller = useEditorAI({
    websiteId,
    pageId,
    revertibleTurns,
    aiHistory,
    getCurrentValue,
    applyPatch,
    onLocalPatchesApplied,
    onRefresh,
  });

  // Resolve the current Ask AI target by selection priority.
  const askTarget: AITargetRef | null = useMemo(() => {
    if (selection.editable) {
      return {
        blockId: selection.editable.blockId,
        fieldPath: selection.editable.fieldPath,
        persistedFieldPath: selection.editable.persistedFieldPath,
        label: selection.editable.label,
        kind: "editable",
        aiEditKey: selection.editable.aiEditKey,
        computedStyle: selection.editable.computedStyle,
        styleTarget: selection.editable.styleTarget,
        styleTargets: selection.editable.styleTargets,
      };
    }
    if (selection.section) {
      return {
        blockId: selection.section.blockId,
        fieldPath: selection.section.fieldPath || "sectionStyle",
        persistedFieldPath: selection.section.persistedFieldPath,
        label: selection.section.label || "Section",
        kind: "section",
        aiEditKey: selection.section.aiEditKey,
      };
    }
    if (selection.page || pageId) {
      return {
        fieldPath: `pages.${selection.page?.id ?? pageId}.title`,
        label: selection.page?.title || "Page",
        kind: "page",
      };
    }
    return null;
  }, [selection, pageId]);

    const phrase = useRotatingPhrase(pillStatus === "loading", 1000);
  

  const scopeOptions = useMemo(
    () => [
      {
        scope: "target" as const,
        label: selection.editable?.label || "Selected element",
        available: !!selection.editable,
        blockId: selection.editable?.blockId,
        fieldPath:
          selection.editable?.persistedFieldPath ??
          (selection.editable?.fieldPath
            ? toPersistedBlockContentPath(
                selection.editable.fieldPath,
                pageId,
                selection.editable.blockId,
              )
            : undefined),
        aiEditKey: selection.editable?.aiEditKey,
      },
      {
        scope: "section" as const,
        label: selection.section?.label || "Selected section",
        available: !!selection.section,
        blockId: selection.section?.blockId,
        fieldPath:
          selection.section?.persistedFieldPath ??
          (selection.section?.fieldPath
            ? toPersistedBlockContentPath(
                selection.section.fieldPath,
                pageId,
                selection.section.blockId,
              )
            : undefined),
        aiEditKey: selection.section?.aiEditKey,
      },
      {
        scope: "page" as const,
        label: selection.page?.title || "Current page",
        available: !!pageId,
      },
      {
        scope: "website" as const,
        label: websiteName || "Whole site",
        available: true,
      },
    ],
    [selection, pageId, websiteName],
  );

  const requestInProgress = controller.activeRequest || controller.chatLoading;
  const askDisabled = !canUseAI || !askTarget || requestInProgress;
  const askTooltip = !canUseAI
    ? disabledReason || "AI unavailable"
    : !askTarget
      ? "Select a field, section, or page first"
      : requestInProgress
        ? "An AI request is in progress"
        : "Ask AI to edit this";
  const handleKeyboardAction = (
    event: React.KeyboardEvent,
    action: () => void,
    disabled = false,
  ) => {
    if (disabled || (event.key !== "Enter" && event.key !== " ")) return;
    event.preventDefault();
    action();
  };

  useEffect(() => {
    if (
      !openAskSignal ||
      openAskSignal === lastOpenAskSignalRef.current ||
      askDisabled
    ) {
      return;
    }
    lastOpenAskSignalRef.current = openAskSignal;
    setDialogAnchorRect(openAskAnchorRect ?? null);
    setAskOpen(true);
    onAskAIButtonStatusChange?.("open");
  }, [
    openAskSignal,
    openAskAnchorRect,
    askDisabled,
    onAskAIButtonStatusChange,
  ]);

  const openAskFromPill = useCallback(() => {
    if (askDisabled) return;
    setDialogAnchorRect(null);
    setAskOpen(true);
    onAskAIButtonStatusChange?.("open");
  }, [askDisabled, onAskAIButtonStatusChange]);

  const clearPillTimers = useCallback(() => {
    pillTimersRef.current.forEach((timer) => clearTimeout(timer));
    pillTimersRef.current = [];
  }, []);

  useEffect(() => clearPillTimers, [clearPillTimers]);

  const showPillLoading = useCallback(() => {
    clearPillTimers();
    setPillStatus("loading");
    onAskAIButtonStatusChange?.("loading");
  }, [clearPillTimers, onAskAIButtonStatusChange]);

  const showPillResult = useCallback(
    (result: AIPillResult) => {
      clearPillTimers();
      setLastPillResult(result);
      setPillStatus(result);
      onAskAIButtonStatusChange?.(result);
      pillTimersRef.current.push(
        setTimeout(() => {
          setPillStatus("draining");
          pillTimersRef.current.push(
            setTimeout(() => {
              setPillStatus("idle");
              onAskAIButtonStatusChange?.("idle");
            }, 1500),
          );
        }, 2500),
      );
    },
    [clearPillTimers, onAskAIButtonStatusChange],
  );

  useEffect(() => {
    if (controller.error && pillStatus === "loading") {
      showPillResult("error");
    }
  }, [controller.error, pillStatus, showPillResult]);

  const isSuccessLiquid =
    pillStatus === "success" ||
    (pillStatus === "draining" && lastPillResult === "success");
  const isErrorLiquid =
    pillStatus === "error" ||
    (pillStatus === "draining" && lastPillResult === "error");
  const liquidColor = isSuccessLiquid
    ? "#b9efcc"
    : isErrorLiquid
      ? "#f4bcc8"
      : "#3d9b8f";
  const liquidBackground = isSuccessLiquid
    ? "linear-gradient(135deg, #a9efbf 0%, #cdf7dc 58%, #baf1cd 100%)"
    : isErrorLiquid
      ? "linear-gradient(135deg, #f2a6b4 0%, #f9ccd5 58%, #f4bdc8 100%)"
      : "#3d9b8f";

  const liquidTransformSx = (() => {
    switch (pillStatus) {
      case "idle":
        return { transform: "translateX(calc(-100% - 20px))" };
      case "loading":
        return { animation: "ai-fill-liquid 5s linear forwards" };
      case "success":
      case "error":
        return { transform: "translateX(0%)" };
      case "draining":
        return { animation: "ai-drain-liquid 1.5s ease-in-out forwards" };
      default:
        return {};
    }
  })();

  const normalPillVisible = pillStatus === "idle" || pillStatus === "draining";
  const statusPillVisible =
    pillStatus === "loading" ||
    pillStatus === "success" ||
    pillStatus === "error";

  const pillBtn = (active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    px: 1.5,
    py: 0.75,
    borderRadius: 999,
    cursor: active ? "pointer" : "not-allowed",
    fontSize: "0.8rem",
    fontWeight: 600,
    userSelect: "none" as const,
    transition: "background-color 0.15s ease",
  });

  return (
    <>
      {/* Floating AI action bar */}
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 16, md: 24 },
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1250,
        }}
      >
        <Box
          sx={{
            position: "relative",
            width: "fit-content",
            minWidth: { xs: 0, sm: 0 },
            maxWidth: "calc(100vw - 32px)",
            height: 48,
            borderRadius: 999,
            backgroundColor: colors.panelBg || colors.bgCard,
            border: `1px solid ${colors.border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            backdropFilter: "blur(12px)",
            overflow: "hidden",
            transform: "translateZ(0)",
          }}
        >
          <Box
            sx={{
              position: "relative",
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              height: 48,
              gap: { xs: 0.5, sm: 0.75 },
              p: 0.5,
              opacity: normalPillVisible ? 1 : 0,
              pointerEvents: pillStatus === "idle" ? "auto" : "none",
              transition: "opacity 0.3s ease",
            }}
          >
            <Tooltip title={askTooltip}>
              <Box
                component="span"
                role="button"
                aria-disabled={askDisabled}
                aria-label="Ask AI"
                tabIndex={askDisabled ? -1 : 0}
                onClick={openAskFromPill}
                onKeyDown={(event) =>
                  handleKeyboardAction(event, openAskFromPill, askDisabled)
                }
                sx={{
                  ...pillBtn(!askDisabled),
                  color: askDisabled ? colors.textSecondary : "#fff",
                  background: askDisabled
                    ? alpha(colors.text, 0.06)
                    : "linear-gradient(135deg, #378C92, #2d7479)",
                  opacity: askDisabled ? 0.7 : 1,
                  flexShrink: 0,
                }}
              >
                <Sparkles size={15} />
                Ask AI
              </Box>
            </Tooltip>

            {askTarget && (
              <Typography
                variant="caption"
                sx={{
                  color: colors.textSecondary,
                  minWidth: 0,
                  maxWidth: { xs: 84, sm: 130 },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  px: { xs: 0.25, sm: 0.5 },
                  fontWeight: 600,
                }}
              >
                {askTarget.label}
              </Typography>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
              <Tooltip
                title={
                  controller.revertDepth > 0
                    ? "Undo last AI change (last two only)"
                    : "No AI changes to undo"
                }
              >
                <Box
                  component="span"
                  role="button"
                  aria-disabled={controller.revertDepth <= 0}
                  aria-label="Undo AI"
                  tabIndex={controller.revertDepth > 0 ? 0 : -1}
                  onClick={() =>
                    controller.revertDepth > 0 && controller.revertLast()
                  }
                  onKeyDown={(event) =>
                    handleKeyboardAction(
                      event,
                      () => controller.revertLast(),
                      controller.revertDepth <= 0,
                    )
                  }
                  sx={{
                    ...pillBtn(controller.revertDepth > 0),
                    color:
                      controller.revertDepth > 0
                        ? colors.text
                        : colors.textSecondary,
                    opacity: controller.revertDepth > 0 ? 1 : 0.5,
                  }}
                >
                  <Undo2 size={15} />
                  Undo AI
                </Box>
              </Tooltip>

              <Tooltip
                title={
                  controller.redoDepth > 0
                    ? "Redo last AI undo (last two only)"
                    : "No AI changes to redo"
                }
              >
                <Box
                  component="span"
                  role="button"
                  aria-disabled={controller.redoDepth <= 0}
                  aria-label="Redo AI"
                  tabIndex={controller.redoDepth > 0 ? 0 : -1}
                  onClick={() =>
                    controller.redoDepth > 0 && controller.redoLast()
                  }
                  onKeyDown={(event) =>
                    handleKeyboardAction(
                      event,
                      () => controller.redoLast(),
                      controller.redoDepth <= 0,
                    )
                  }
                  sx={{
                    ...pillBtn(controller.redoDepth > 0),
                    color:
                      controller.redoDepth > 0
                        ? colors.text
                        : colors.textSecondary,
                    opacity: controller.redoDepth > 0 ? 1 : 0.5,
                  }}
                >
                  <Redo2 size={15} />
                  Redo AI
                </Box>
              </Tooltip>

              <Tooltip
                title={
                  canUseAI ? "Open AI chat" : disabledReason || "AI unavailable"
                }
              >
                <Box
                  component="span"
                  role="button"
                  aria-label="Open AI chat"
                  tabIndex={0}
                  onClick={() => setChatOpen((v) => !v)}
                  onKeyDown={(event) =>
                    handleKeyboardAction(event, () => setChatOpen((v) => !v))
                  }
                  sx={{
                    ...pillBtn(true),
                    color: chatOpen ? "#378C92" : colors.text,
                    background: chatOpen
                      ? alpha("#378C92", 0.12)
                      : "transparent",
                  }}
                >
                  <MessageSquare size={15} />
                  Chat
                </Box>
              </Tooltip>
            </Box>
          </Box>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 20,
              pointerEvents: "none",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                overflow: "visible",
                ...liquidTransformSx,
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  inset: 0,
                  background: liquidBackground,
                  transition: "background 0.5s ease",
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    opacity: pillStatus === "loading" ? 1 : 0,
                    transition: "opacity 0.5s ease",
                  }}
                >
                  {LIQUID_BUBBLES.map((bubble, index) => (
                    <Box
                      key={`${bubble.left}-${index}`}
                      sx={{
                        position: "absolute",
                        left: bubble.left,
                        width: bubble.size,
                        height: bubble.size,
                        bottom: "-15px",
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.3)",
                        animation: `ai-float-up ${bubble.duration} ${bubble.delay} linear infinite`,
                      }}
                    />
                  ))}
                </Box>
              </Box>

              <svg
                viewBox="0 0 20 168"
                width="20"
                height="168"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  left: "calc(100% - 1px)",
                  top: 0,
                  opacity:
                    pillStatus === "loading" || pillStatus === "draining"
                      ? 1
                      : 0,
                  transition: "opacity 0.3s ease",
                  animation: "ai-wave-ripple 1s linear infinite",
                  backfaceVisibility: "hidden",
                  transform: "translate3d(0, 0, 0)",
                  willChange: "transform",
                }}
              >
                <path
                  d="M 0 0 L 10 0 Q 20 14, 10 28 T 10 56 T 10 84 T 10 112 T 10 140 T 10 168 L 0 168 Z"
                  fill={liquidColor}
                  style={{ transition: "fill 0.5s ease" }}
                />
              </svg>
            </Box>
          </Box>

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: statusPillVisible ? 1 : 0,
              pointerEvents: "none",
              transition: "opacity 0.3s ease",
            }}
          >
            {(pillStatus === "success" || pillStatus === "error") && (
              <>
                <Box
                  sx={{
                    position: "absolute",
                    left: -18,
                    top: -18,
                    width: 78,
                    height: 78,
                    borderRadius: "50%",
                    backgroundColor:
                      pillStatus === "success"
                        ? "rgba(48, 173, 104, 0.18)"
                        : "rgba(216, 88, 108, 0.18)",
                  }}
                />
                <Box
                  sx={{
                    position: "absolute",
                    left: 22,
                    bottom: -28,
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor:
                      pillStatus === "success"
                        ? "rgba(48, 173, 104, 0.12)"
                        : "rgba(216, 88, 108, 0.12)",
                  }}
                />
              </>
            )}
            {pillStatus === "loading" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.88rem",
                  textShadow: "0 1px 8px rgba(0,0,0,0.28)",
                  whiteSpace: "nowrap",
                }}
              >
                <Sparkles size={15} />
                <Fade key={phrase} in timeout={250}>
                {/* AI request in progress */}
                  <Typography
                    sx={{
                      fontSize: 12.5,
                      fontWeight: 800,
                    }}
                  >
                    {phrase}…
                  </Typography>
                </Fade>
              </Box>
            )}
            {pillStatus === "success" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#111827",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    color: "#4eaf75",
                    boxShadow: "0 6px 18px rgba(48, 173, 104, 0.22)",
                  }}
                >
                  <Check size={14} strokeWidth={3} />
                </Box>
                AI changes applied
              </Box>
            )}
            {pillStatus === "error" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  color: "#111827",
                  fontWeight: 500,
                  fontSize: "0.875rem",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    backgroundColor: "#fff",
                    color: "#d66073",
                    boxShadow: "0 6px 18px rgba(216, 88, 108, 0.2)",
                  }}
                >
                  <X size={14} strokeWidth={3} />
                </Box>
                AI request failed
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        component="style"
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes ai-fill-liquid {
              0% { transform: translateX(calc(-100% - 20px)); }
              100% { transform: translateX(0%); }
            }
            @keyframes ai-drain-liquid {
              0% { transform: translateX(0%); }
              100% { transform: translateX(calc(-100% - 20px)); }
            }
            @keyframes ai-float-up {
              0% { transform: translateY(0) scale(0.8); opacity: 0; }
              20% { opacity: 1; }
              80% { opacity: 1; }
              100% { transform: translateY(-80px) scale(1.2); opacity: 0; }
            }
            @keyframes ai-wave-ripple {
              0% { transform: translate3d(0, 0, 0); }
              100% { transform: translate3d(0, -56px, 0); }
            }
          `,
        }}
      />

      <AskAIDialog
        open={askOpen}
        target={askTarget}
        controller={controller}
        anchorRect={dialogAnchorRect}
        onClose={() => {
          setAskOpen(false);
          if (!requestInProgress && pillStatus === "idle") {
            onAskAIButtonStatusChange?.("idle");
          }
        }}
        onRequestStarted={showPillLoading}
        onApplied={() => {
          showPillResult("success");
        }}
        onFailed={() => showPillResult("error")}
      />

      <AIConflictDialog
        conflict={controller.conflict}
        onResolve={controller.resolveConflict}
      />

      {chatDockNode
        ? createPortal(
            <AIChatPanel
              open={chatOpen}
              onClose={() => setChatOpen(false)}
              controller={controller}
              canUseAI={canUseAI}
              disabledReason={disabledReason}
              scopeOptions={scopeOptions}
              versions={versions}
            />,
            chatDockNode,
          )
        : null}
    </>
  );
};

export default EditorAILayer;
