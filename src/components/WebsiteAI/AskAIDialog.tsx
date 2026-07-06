/**
 * AskAIDialog — "Ask AI" prompt + preview for a selected field/section/page.
 *
 * Flow (PRD "Editor Ask AI"):
 *  - User types an instruction → one best result returned.
 *  - Frontend previews the proposed change → Apply or Cancel.
 *  - Unsupported-field, quota, and retry-limit states surfaced inline.
 *  - Discloses that only the last two AI turns can be reverted.
 */

import React, { useEffect, useRef, useState } from "react";
import { X, Sparkles, AlertTriangle, Info } from "lucide-react";
import { formatResetTime } from "../../hooks/useWebsiteAIAccess";
import type { EditorAIController, AITargetRef } from "./useEditorAI";
import { MAX_ATTEMPTS } from "./useEditorAI";

interface AskAIDialogProps {
  open: boolean;
  target: AITargetRef | null;
  controller: EditorAIController;
  anchorRect?: {
    top: number;
    left: number;
    width: number;
    height: number;
  } | null;
  onClose: () => void;
  onRequestStarted?: () => void;
  onApplied?: () => void;
  onFailed?: () => void;
}

const SUGGESTIONS = [
  "Make this shorter",
  "Make it more premium",
  "Rewrite for a friendlier tone",
  "Make this CTA more direct",
];

function stringifyErrorDetail(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getModerationDetails(error: EditorAIController["error"]): string[] {
  if (!error || error.code !== "PATCH_MODERATION_BLOCKED") return [];
  const rawErrors = error.meta?.errors;
  if (Array.isArray(rawErrors)) {
    return rawErrors
      .map(stringifyErrorDetail)
      .filter((detail): detail is string => Boolean(detail));
  }
  const detail = stringifyErrorDetail(rawErrors ?? error.meta?.details);
  return detail ? [detail] : [];
}

const AskAIDialog: React.FC<AskAIDialogProps> = ({
  open,
  target,
  controller,
  anchorRect,
  onClose,
  onRequestStarted,
  onApplied,
  onFailed,
}) => {
  const [instruction, setInstruction] = useState("");
  const [rendered, setRendered] = useState(open);
  const [entered, setEntered] = useState(false);
  const [liveAnchorRect, setLiveAnchorRect] = useState(anchorRect ?? null);
  const scrollPositionsRef = useRef<
    WeakMap<Element, { scrollTop: number; scrollLeft: number }>
  >(new WeakMap());
  const windowScrollRef = useRef({
    scrollX: typeof window === "undefined" ? 0 : window.scrollX,
    scrollY: typeof window === "undefined" ? 0 : window.scrollY,
  });
  const {
    activeRequest,
    error,
    askAI,
    cancelProposal,
    getAttempts,
    clearError,
  } = controller;

  useEffect(() => {
    if (open) {
      setLiveAnchorRect(anchorRect ?? null);
      setRendered(true);
      setEntered(false);
      let innerFrame = 0;
      const frame = window.requestAnimationFrame(() => {
        innerFrame = window.requestAnimationFrame(() => setEntered(true));
      });
      return () => {
        window.cancelAnimationFrame(frame);
        window.cancelAnimationFrame(innerFrame);
      };
    }

    setEntered(false);
    const timer = window.setTimeout(() => setRendered(false), 260);
    return () => window.clearTimeout(timer);
  }, [open, anchorRect]);

  useEffect(() => {
    if (!open || !liveAnchorRect) return;

    const shiftAnchor = (deltaX: number, deltaY: number) => {
      if (!deltaX && !deltaY) return;
      setLiveAnchorRect((current) =>
        current
          ? {
              ...current,
              left: current.left - deltaX,
              top: current.top - deltaY,
            }
          : current,
      );
    };

    const handleScroll = (event: Event) => {
      const target =
        event.target === document ? document.scrollingElement : event.target;

      if (target && target instanceof Element) {
        const previous = scrollPositionsRef.current.get(target) ?? {
          scrollTop: target.scrollTop,
          scrollLeft: target.scrollLeft,
        };
        const deltaY = target.scrollTop - previous.scrollTop;
        const deltaX = target.scrollLeft - previous.scrollLeft;
        scrollPositionsRef.current.set(target, {
          scrollTop: target.scrollTop,
          scrollLeft: target.scrollLeft,
        });
        shiftAnchor(deltaX, deltaY);
        return;
      }

      const deltaX = window.scrollX - windowScrollRef.current.scrollX;
      const deltaY = window.scrollY - windowScrollRef.current.scrollY;
      windowScrollRef.current = {
        scrollX: window.scrollX,
        scrollY: window.scrollY,
      };
      shiftAnchor(deltaX, deltaY);
    };

    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [open, liveAnchorRect]);

  useEffect(() => {
    if (open) {
      setInstruction("");
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    open,
    target?.blockId,
    target?.fieldPath,
    target?.persistedFieldPath,
    target?.aiEditKey,
  ]);

  if (!target || !rendered) return null;

  const attempts = getAttempts(target, instruction);
  const retryLimitHit = attempts >= MAX_ATTEMPTS;
  const isUnsupported = error?.code === "UNSUPPORTED_EDIT_FIELD";
  const isQuota =
    error?.code === "QUOTA_EXCEEDED" ||
    error?.code === "AI_QUOTA_EXHAUSTED" ||
    error?.code === "PLAN_UPGRADE_REQUIRED";
  const moderationDetails = getModerationDetails(error);

  const updateInstruction = (nextInstruction: string) => {
    setInstruction(nextInstruction);
    if (error) {
      clearError();
    }
  };

  const handleSubmit = async () => {
    const trimmedInstruction = instruction.trim();
    if (!trimmedInstruction) return;
    clearError();
    onRequestStarted?.();
    onClose();
    try {
      const applied = await askAI(target, trimmedInstruction);
      if (applied) {
        onApplied?.();
      } else {
        onFailed?.();
      }
    } catch {
      onFailed?.();
    }
  };

  const handleClose = () => {
    if (activeRequest) return;
    cancelProposal();
    onClose();
  };

  const canSubmit =
    !activeRequest && Boolean(instruction.trim()) && !retryLimitHit && !isQuota;
  const errorIcon = isUnsupported ? (
    <Info size={18} strokeWidth={2.5} />
  ) : (
    <AlertTriangle size={18} strokeWidth={2.5} />
  );
  const viewportWidth =
    typeof window === "undefined" ? 1024 : window.innerWidth;
  const viewportHeight =
    typeof window === "undefined" ? 768 : window.innerHeight;
  const modalWidth = Math.min(340, Math.max(280, viewportWidth - 32));
  const estimatedModalHeight = Math.min(142, viewportHeight - 32);
  const minModalTop = 24;
  const maxModalTop = Math.max(24, viewportHeight - estimatedModalHeight - 24);
  const clamp = (value: number, min: number, max: number) =>
    Math.min(Math.max(value, min), max);
  const anchoredLeft = (() => {
    if (!liveAnchorRect) {
      return clamp(
        (viewportWidth - modalWidth) / 2,
        24,
        viewportWidth - modalWidth - 24,
      );
    }
    const gap = 0;
    const anchorRight = liveAnchorRect.left + liveAnchorRect.width;
    const rightSide = anchorRight + gap;
    const leftSide = liveAnchorRect.left - modalWidth - gap;
    if (rightSide + modalWidth <= viewportWidth - 24) {
      return rightSide;
    }
    if (leftSide >= 24) {
      return leftSide;
    }
    return clamp(liveAnchorRect.left - 26, 24, viewportWidth - modalWidth - 24);
  })();
  const anchoredTop = liveAnchorRect
    ? clamp(liveAnchorRect.top + 0, minModalTop, maxModalTop)
    : clamp(
        (viewportHeight - estimatedModalHeight) / 2,
        minModalTop,
        maxModalTop,
      );
  const collapsedTranslateX = liveAnchorRect
    ? liveAnchorRect.left - anchoredLeft
    : 0;
  const collapsedTranslateY = liveAnchorRect
    ? liveAnchorRect.top - anchoredTop
    : 18;
  const collapsedScaleX = liveAnchorRect
    ? Math.max(0.08, liveAnchorRect.width / modalWidth)
    : 0.9;
  const collapsedScaleY = liveAnchorRect
    ? Math.max(0.04, liveAnchorRect.height / estimatedModalHeight)
    : 0.9;
  const shellTransform = entered
    ? "translate3d(0, 0, 0) scale(1, 1)"
    : `translate3d(${collapsedTranslateX}px, ${collapsedTranslateY}px, 0) scale(${collapsedScaleX}, ${collapsedScaleY})`;

  return (
    <div
      key="ask-ai-overlay"
      onMouseDown={handleClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 2147483000,
        pointerEvents: "auto",
        backgroundColor: "transparent",
        fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <div
        key="ask-ai-shell"
        onMouseDown={(event) => event.stopPropagation()}
        style={{
          position: "fixed",
          top: anchoredTop,
          left: anchoredLeft,
          width: modalWidth,
          maxHeight: "calc(100dvh - 48px)",
          zIndex: 10,
          overflow: "hidden",
          pointerEvents: "auto",
          borderRadius: 16,
          border: "1px solid rgba(224, 232, 242, 0.9)",
          backgroundColor: "#ffffff",
          boxShadow:
            "0 18px 44px rgba(37, 57, 77, 0.14), 0 6px 18px rgba(37, 57, 77, 0.08)",
          transform: shellTransform,
          transformOrigin: "0 0",
          transition:
            "transform 340ms cubic-bezier(0.18, 0.9, 0.2, 1), opacity 160ms ease",
          willChange: "transform",
        }}
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={activeRequest}
          aria-label="Close Ask AI"
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "none",
            border: "none",
            cursor: activeRequest ? "not-allowed" : "pointer",
            color: "#8ca0b8",
            lineHeight: 1,
            padding: 2,
            zIndex: 25,
          }}
        >
          <X size={15} strokeWidth={2.2} />
        </button>

        <div
          style={{
            opacity: entered ? 1 : 0,
            transition: "opacity 160ms ease 90ms",
          }}
        >
          <div
            style={{
              padding: "14px 18px 10px 18px",
            }}
          >
            <h2
              style={{
                margin: 0,
                paddingRight: 30,
                fontSize: 12.5,
                fontWeight: 800,
                lineHeight: 1.2,
                color: "#637891",
                fontFamily: "inherit",
                letterSpacing: 0,
              }}
            >
              Describe what to change in this element.
            </h2>
          </div>

          <div
            style={{
              padding: "0 18px 16px 18px",
              display: "flex",
              flexDirection: "column",
              gap: 9,
            }}
          >
            {error && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  gap: 9,
                  padding: "9px 11px",
                  borderRadius: 13,
                  color: isUnsupported ? "#075985" : "#92400e",
                  backgroundColor: isUnsupported
                    ? "rgba(224, 242, 254, 0.85)"
                    : "rgba(255, 247, 237, 0.9)",
                  border: isUnsupported
                    ? "1px solid rgba(186, 230, 253, 0.9)"
                    : "1px solid rgba(253, 186, 116, 0.75)",
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 1 }}>{errorIcon}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 650 }}>
                    {error.message}
                  </div>
                  {isUnsupported && error.details?.requestedChange && (
                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 11,
                        color: "#0369a1",
                      }}
                    >
                      “{error.details.requestedChange}” isn’t an editable field
                      on this element yet.
                    </div>
                  )}
                  {isQuota && (
                    <div
                      style={{
                        marginTop: 5,
                        fontSize: 11,
                        color: "#b45309",
                      }}
                    >
                      Resets {formatResetTime(error.resetAt)}.
                    </div>
                  )}
                  {moderationDetails.length > 0 && (
                    <ul style={{ margin: "7px 0 0 0", paddingLeft: 18 }}>
                      {moderationDetails.map((detail, index) => (
                        <li
                          key={`${detail}-${index}`}
                          style={{ fontSize: 11, marginTop: 3 }}
                        >
                          {detail}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button
                  type="button"
                  onClick={clearError}
                  aria-label="Dismiss error"
                  style={{
                    marginLeft: "auto",
                    alignSelf: "flex-start",
                    border: "none",
                    background: "transparent",
                    color: "currentColor",
                    cursor: "pointer",
                    padding: 0,
                    opacity: 0.76,
                  }}
                >
                  <X size={15} />
                </button>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                borderRadius: 999,
                backgroundColor: "#f8fbff",
                border: "1px solid #dbe5f1",
                overflow: "hidden",
                height: 36,
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.9)",
              }}
            >
              <input
                type="text"
                value={instruction}
                onChange={(event) => updateInstruction(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    (event.metaKey || event.ctrlKey) &&
                    event.key === "Enter"
                  ) {
                    handleSubmit();
                  }
                }}
                placeholder="e.g. Make this headline shorter and more premium"
                autoFocus
                disabled={activeRequest}
                style={{
                  flex: 1,
                  minWidth: 0,
                  background: "none",
                  border: "none",
                  outline: "none",
                  padding: "0 8px 0 12px",
                  fontSize: 12,
                  color: "#52667f",
                  fontFamily: "inherit",
                }}
              />

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                style={{
                  flexShrink: 0,
                  margin: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  background: canSubmit
                    ? "linear-gradient(135deg, #3a9ea4 0%, #2f8d91 100%)"
                    : "#d7e2ee",
                  border: "none",
                  borderRadius: 999,
                  height: 28,
                  padding: "0 10px",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  whiteSpace: "nowrap",
                  cursor: canSubmit ? "pointer" : "not-allowed",
                  fontFamily: "inherit",
                }}
              >
                <Sparkles size={13} strokeWidth={2.2} />
                <span>Ask AI</span>
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  type="button"
                  key={suggestion}
                  onClick={() => updateInstruction(suggestion)}
                  disabled={activeRequest}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #dbe5f1",
                    borderRadius: 999,
                    padding: "4px 9px",
                    fontSize: 9.5,
                    fontWeight: 500,
                    color: "#637891",
                    cursor: activeRequest ? "not-allowed" : "pointer",
                    fontFamily: "inherit",
                    boxShadow: "0 1px 0 rgba(255,255,255,0.9)",
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AskAIDialog;
