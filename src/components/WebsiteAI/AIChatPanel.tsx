/**
 * AIChatPanel — toggleable right-side editor AI chat (PRD "Editor AI Chat Panel").
 *
 * Scopes: current selected field, section, page, or full website.
 * - Failed responses appear under the chat and can be referenced in follow-ups.
 * - Apply/Cancel for returned patches.
 * - Full-site recreation requires explicit confirmation and creates a
 *   restorable website version.
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import { X, Send, Star, CircleAlert, RefreshCw } from "lucide-react";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";
import ConfirmationDialog from "../Dashboard/shared/ConfirmationDialog";
import { useRotatingPhrase } from "../../hooks/useRotatingPhrase";
import type { EditorChatScope } from "../../api/websiteAI";
import type { VersionMeta } from "../../api/websiteAI";
import type { EditorAIController } from "./useEditorAI";

const THEME = "#378C92";
const THEME_DIM = "#378C9222";
const THEME_BORDER = "#378C9244";

interface ScopeOption {
  scope: EditorChatScope;
  label: string;
  available: boolean;
  blockId?: number | string;
  fieldPath?: string;
  aiEditKey?: string;
}

interface AIChatPanelProps {
  open: boolean;
  onClose: () => void;
  controller: EditorAIController;
  canUseAI: boolean;
  disabledReason: string | null;
  scopeOptions: ScopeOption[];
  versions?: VersionMeta[];
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({
  open,
  onClose,
  controller,
  canUseAI,
  disabledReason,
  scopeOptions,
  versions = [],
}) => {
  const {
    chatMessages,
    chatLoading,
    sendChat,
    recreateSite,
    restoreVersion,
    applyChatMessage,
    dismissChatPatches,
  } = controller;

  const [message, setMessage] = useState("");
  const [scope, setScope] = useState<EditorChatScope>("page");
  const [confirmFullSite, setConfirmFullSite] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<VersionMeta | null>(null);
  const [composerFocused, setComposerFocused] = useState(false);
  const listRef = useRef<HTMLDivElement | null>(null);
  const phrase = useRotatingPhrase(chatLoading);

  const available = useMemo(
    () => scopeOptions.filter((o) => o.available),
    [scopeOptions],
  );

  // Keep scope valid as selection changes.
  useEffect(() => {
    if (!available.some((o) => o.scope === scope) && available.length) {
      setScope(available[available.length - 1].scope);
    }
  }, [available, scope]);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [chatMessages, chatLoading]);

  const activeScopeOption = available.find((o) => o.scope === scope);

  const doSend = (confirmFullSiteRecreation?: boolean) => {
    const text = message.trim();
    if (!text || !canUseAI) return;
    if (scope === "website" && confirmFullSiteRecreation) {
      recreateSite(text);
    } else {
      sendChat(scope, text, {
        blockId: activeScopeOption?.blockId,
        fieldPath: activeScopeOption?.fieldPath,
        aiEditKey: activeScopeOption?.aiEditKey,
      });
    }
    setMessage("");
  };

  const canSend = canUseAI && !chatLoading && message.trim().length > 0;

  const getMessageTime = (id: string) => {
    const match = String(id).match(/_(\d+)/);
    const timestamp = match ? Number(match[1]) : Date.now();
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const botAvatar = (
    <Box
      sx={{
        flex: "0 0 auto",
        width: 26,
        height: 26,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: `linear-gradient(135deg, ${THEME}33, ${THEME}55)`,
        border: `1px solid ${THEME}44`,
        color: THEME,
      }}
    >
      <Star size={15} fill="currentColor" />
    </Box>
  );

  const handleSend = () => {
    if (scope === "website") {
      setConfirmFullSite(true);
      return;
    }
    doSend();
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant="persistent"
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 392 },
            backgroundColor: "#09090b",
            borderLeft: "1px solid rgba(255,255,255,0.08)",
            backgroundImage: "none",
            p: { xs: 0, sm: 1.5 },
            boxSizing: "border-box",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: 0,
            background:
              "linear-gradient(160deg, #1a1a1f 0%, #141418 60%, #111114 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            maxWidth: { xs: "100%", sm: 368 },
            width: "100%",
            alignSelf: "center",
            borderRadius: { xs: 0, sm: "20px" },
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "10%",
              right: "10%",
              height: 1,
              background: `linear-gradient(90deg, transparent, ${THEME}55, transparent)`,
              pointerEvents: "none",
            }}
          />

          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `linear-gradient(135deg, ${THEME}33, ${THEME}18)`,
                  border: `1px solid ${THEME}44`,
                  color: THEME,
                  boxShadow: `0 4px 12px ${THEME}22`,
                }}
              >
                <Star size={16} fill="currentColor" />
              </Box>
              <Box>
                <Typography
                  sx={{
                    color: "#f9fafb",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: "0.02em",
                    lineHeight: 1.15,
                  }}
                >
                  AI Assistant
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    mt: 0.5,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#4ade80",
                      boxShadow: "0 0 4px #4ade80aa",
                    }}
                  />
                  <Typography sx={{ color: "#6b7280", fontSize: 12 }}>
                    Online
                  </Typography>
                </Box>
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                width: 28,
                height: 28,
                borderRadius: "9px",
                color: "#4b5563",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                "&:hover": {
                  color: "#9ca3af",
                  background: "rgba(255,255,255,0.08)",
                },
              }}
            >
              <X size={18} />
            </IconButton>
          </Box>

          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                p: 0.5,
                borderRadius: "14px",
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {scopeOptions.map((o) => {
                const active = scope === o.scope;
                return (
                  <Tooltip
                    key={o.scope}
                    title={
                      o.available ? "" : "Select an element to use this scope"
                    }
                  >
                    <Box
                      component="button"
                      type="button"
                      aria-disabled={!o.available}
                      onClick={() => o.available && setScope(o.scope)}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        height: 30,
                        px: 1,
                        border: 0,
                        borderRadius: "8px",
                        background: active
                          ? `linear-gradient(135deg, ${THEME}, ${THEME}cc)`
                          : "transparent",
                        color: active
                          ? "#ffffff"
                          : o.available
                            ? "#6b7280"
                            : "#374151",
                        boxShadow: active ? `0 2px 8px ${THEME}44` : "none",
                        fontSize: 12,
                        fontWeight: 600,
                        lineHeight: 1,
                        cursor: o.available ? "pointer" : "default",
                        transition: "all 0.15s ease",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {o.label}
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>

          <Box
            ref={listRef}
            sx={{
              flex: 1,
              overflowY: "auto",
              px: 2,
              py: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {chatMessages.length === 0 && !chatLoading && (
              <Box sx={{ textAlign: "center", mt: 4, px: 2 }}>
                <Typography
                  sx={{ color: "#6b7280", fontSize: 14, lineHeight: 1.45 }}
                >
                  Ask the AI to rewrite copy, adjust a section, or refresh a
                  page. Choose a scope above.
                </Typography>
              </Box>
            )}

            {versions.length > 0 && (
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "16px",
                  border: `1px solid ${THEME_BORDER}`,
                  background: `linear-gradient(135deg, ${THEME_DIM}, rgba(255,255,255,0.025))`,
                }}
              >
                <Typography
                  sx={{
                    color: "#6b7280",
                    fontSize: 12,
                    fontWeight: 800,
                    mb: 0.5,
                  }}
                >
                  Restore points
                </Typography>
                {versions
                  .slice(-3)
                  .reverse()
                  .map((version) => (
                    <Box
                      key={version.versionId}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        mt: 0.75,
                      }}
                    >
                      <Typography
                        sx={{
                          color: "#6b7280",
                          flex: 1,
                          fontSize: 12,
                          lineHeight: 1.3,
                        }}
                      >
                        {version.label || "Saved version"} ·{" "}
                        {version.createdAt
                          ? new Date(version.createdAt).toLocaleString()
                          : "recent"}
                      </Typography>
                      <DashboardActionButton
                        size="small"
                        onClick={() => setRestoreTarget(version)}
                      >
                        Restore
                      </DashboardActionButton>
                    </Box>
                  ))}
              </Box>
            )}

            {chatMessages.map((m) => (
              <Box
                key={m.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.role === "user" ? "flex-end" : "flex-start",
                  gap: 0.5,
                }}
              >
                {m.role === "user" ? (
                  <>
                    <Box
                      sx={{
                        maxWidth: "86%",
                        px: 2,
                        py: 1.5,
                        borderRadius: "16px 16px 4px 16px",
                        background: `linear-gradient(135deg, ${THEME}28, ${THEME}18)`,
                        border: `1px solid ${THEME_BORDER}`,
                        color: "#e2e8f0",
                      }}
                    >
                      <Typography sx={{ fontSize: 14, lineHeight: 1.55 }}>
                        {m.text}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{ color: "#374151", fontSize: 12, pr: 0.5 }}
                    >
                      {getMessageTime(m.id)}
                    </Typography>
                  </>
                ) : (
                  <>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1,
                        maxWidth: "88%",
                      }}
                    >
                      {botAvatar}
                      <Box
                        sx={{
                          flex: 1,
                          px: 2,
                          py: 1.5,
                          borderRadius: "4px 16px 16px 16px",
                          background: m.isError
                            ? "linear-gradient(135deg, #1e1215, #180e12)"
                            : "rgba(255,255,255,0.04)",
                          border: m.isError
                            ? "1px solid rgba(239,68,68,0.18)"
                            : "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        {m.isError && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              mb: 1,
                            }}
                          >
                            <CircleAlert size={13} color="#f87171" />
                            <Typography
                              sx={{
                                color: "#f87171",
                                opacity: 0.85,
                                fontSize: 12,
                                fontWeight: 600,
                                lineHeight: 1.35,
                              }}
                            >
                              Failed — you can mention this in your next message
                            </Typography>
                          </Box>
                        )}
                        <Typography
                          sx={{
                            color: m.isError ? "#6b7280" : "#d1d5db",
                            fontSize: 14,
                            lineHeight: 1.55,
                          }}
                        >
                          {m.text}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography
                      sx={{ color: "#374151", fontSize: 12, pl: 4.5 }}
                    >
                      {getMessageTime(m.id)}
                    </Typography>
                  </>
                )}

                {m.pendingPatches && m.pendingPatches.length > 0 && (
                  <Box sx={{ mt: 0.75, display: "flex", gap: 0.75, pl: 4.5 }}>
                    <DashboardGradientButton
                      size="small"
                      onClick={() => applyChatMessage(m.id)}
                    >
                      Apply{" "}
                      {m.pendingPatches.length > 1
                        ? `${m.pendingPatches.length} changes`
                        : "change"}
                    </DashboardGradientButton>
                    <DashboardActionButton
                      size="small"
                      onClick={() => dismissChatPatches(m.id)}
                    >
                      Cancel
                    </DashboardActionButton>
                  </Box>
                )}

                {m.requiresConfirmation && (
                  <Typography
                    sx={{
                      color: "#6b7280",
                      fontSize: 12,
                      mt: 0.5,
                      display: "block",
                      pl: 4.5,
                    }}
                  >
                    A restorable version was saved before this change.
                  </Typography>
                )}
              </Box>
            ))}

            {chatLoading && (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                {botAvatar}
                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: "6px 18px 18px 18px",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#6b7280",
                  }}
                >
                  <CircularProgress size={14} sx={{ color: THEME }} />
                  <Typography variant="caption">{phrase}…</Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Box sx={{ px: 2, pb: 2 }}>
            {!canUseAI && disabledReason && (
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", mb: 1, display: "block" }}
              >
                {disabledReason}
              </Typography>
            )}
            {scope === "website" && (
              <Box
                sx={{
                  mb: 1.5,
                  px: 2.5,
                  py: 1.25,
                  borderRadius: "12px",
                  background: "rgba(255,255,255,0.025)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <RefreshCw size={12} color={THEME} opacity={0.6} />
                <Typography
                  sx={{ color: "#374151", fontSize: 12, lineHeight: 1.35 }}
                >
                  Full-site changes ask for confirmation and save a restore
                  point.
                </Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "flex-end",
                px: 2,
                py: 1.5,
                borderRadius: "16px",
                background: composerFocused
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(255,255,255,0.04)",
                border: composerFocused
                  ? `1px solid ${THEME}55`
                  : "1px solid rgba(255,255,255,0.08)",
                boxShadow: composerFocused ? `0 0 0 3px ${THEME}12` : "none",
                transition: "all 0.15s ease",
              }}
            >
              <Box
                component="textarea"
                rows={1}
                placeholder={
                  canUseAI ? "Ask AI to make a change…" : "AI unavailable"
                }
                value={message}
                disabled={!canUseAI || chatLoading}
                onFocus={() => setComposerFocused(true)}
                onBlur={() => setComposerFocused(false)}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setMessage(e.target.value)
                }
                onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                sx={{
                  flex: 1,
                  minHeight: 24,
                  maxHeight: 100,
                  border: 0,
                  outline: "none",
                  resize: "none",
                  background: "transparent",
                  color: "#e2e8f0",
                  caretColor: THEME,
                  font: "inherit",
                  fontSize: 14,
                  lineHeight: 1.55,
                  p: 0,
                  "&::placeholder": { color: "#6b7280" },
                  "&:disabled": {
                    color: "#4b5563",
                    WebkitTextFillColor: "#4b5563",
                  },
                }}
              />
              <IconButton
                onClick={handleSend}
                disabled={!canSend}
                sx={{
                  flex: "0 0 auto",
                  width: 28,
                  height: 28,
                  borderRadius: "12px",
                  mb: 0.25,
                  bgcolor: canSend ? THEME : "rgba(255,255,255,0.06)",
                  background: canSend
                    ? `linear-gradient(135deg, ${THEME}, ${THEME}cc)`
                    : "rgba(255,255,255,0.06)",
                  color: canSend ? "#fff" : "#374151",
                  border: canSend ? "none" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: canSend ? `0 4px 12px ${THEME}44` : "none",
                  "&:hover": {
                    background: canSend
                      ? `linear-gradient(135deg, ${THEME}, ${THEME}dd)`
                      : "rgba(255,255,255,0.06)",
                  },
                  "&.Mui-disabled": {
                    color: "#374151",
                  },
                }}
              >
                <Send size={15} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Drawer>

      <ConfirmationDialog
        open={confirmFullSite}
        title="Recreate the whole website?"
        message="The AI will rewrite your full site. A restorable version of the current site is saved first, so you can roll back."
        confirmLabel="Recreate site"
        cancelLabel="Cancel"
        onConfirm={() => {
          setConfirmFullSite(false);
          doSend(true);
        }}
        onCancel={() => setConfirmFullSite(false)}
      />

      <ConfirmationDialog
        open={Boolean(restoreTarget)}
        title="Restore this website version?"
        message="This will replace the current pages and sections with the saved version. The current state is not automatically saved first."
        confirmLabel="Restore"
        cancelLabel="Cancel"
        onConfirm={() => {
          const versionId = restoreTarget?.versionId;
          setRestoreTarget(null);
          if (versionId) void restoreVersion(versionId);
        }}
        onCancel={() => setRestoreTarget(null)}
      />
    </>
  );
};

export default AIChatPanel;
