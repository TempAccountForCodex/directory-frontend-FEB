/**
 * AIChatPanel — light modal-themed right-side editor AI chat.
 *
 * Same original sidebar structure:
 * - Header
 * - Scope selector
 * - Chat / restore points body
 * - Bottom composer
 *
 * Updated:
 * - Light modal theme
 * - Smaller proportional sizing
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import {
  X,
  Send,
  Sparkles,
  CircleAlert,
  RefreshCw,
  Check,
  ChevronDown,
  Paperclip,
  Trash2,
} from "lucide-react";
import DashboardGradientButton from "../Dashboard/shared/DashboardGradientButton";
import DashboardActionButton from "../Dashboard/shared/DashboardActionButton";
import ConfirmationDialog from "../Dashboard/shared/ConfirmationDialog";
import { useRotatingPhrase } from "../../hooks/useRotatingPhrase";
import type { EditorChatScope } from "../../api/websiteAI";
import type { VersionMeta } from "../../api/websiteAI";
import type { EditorAIController } from "./useEditorAI";
import { Fade } from "@mui/material";
import chatPanelBg from "../../assets/images/ai-chat-panel-bg.svg";

const MODAL_BG = "#ffffff";
const MODAL_BORDER = "#d8e4f2";
const MODAL_BORDER_STRONG = "#c7d6e8";
const MODAL_SOFT = "#f7faff";
const MODAL_BUTTON = "#d5e0ec";
const THEME = "#378C92";
const THEME_LIGHT = "rgba(55,140,146,0.12)";
const THEME_BORDER = "rgba(55,140,146,0.15)";
const THEME_BORDER_M = "rgba(55,140,146,0.25)";
const TEXT_DARK = "#1f2937";
const TEXT_MID = "#374151";
const TEXT_MUTED = "#9ca3af";
const TEXT_LIGHT = "#d1d5db";
const USER_BUBBLE_BG = "#378C92";
const USER_BUBBLE_BORDER = "rgba(55,140,146,0.28)";
const ASSISTANT_BUBBLE_BG = "rgba(255,255,255,0.92)";
const ASSISTANT_BUBBLE_BORDER = "rgba(55,140,146,0.16)";
const CHAT_AREA_BG = "#e7f2f3";
const BG_PATTERN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 2000 1500'%3E%3Cdefs%3E%3Crect stroke='%23ffffff' stroke-width='0' width='1' height='1' id='s'/%3E%3Cpattern id='a' width='3' height='3' patternUnits='userSpaceOnUse' patternTransform='scale(5) translate(-800 -600)'%3E%3Cuse fill='%23fcfcfc' href='%23s' y='2'/%3E%3Cuse fill='%23fcfcfc' href='%23s' x='1' y='2'/%3E%3Cuse fill='%23fafafa' href='%23s' x='2' y='2'/%3E%3Cuse fill='%23fafafa' href='%23s'/%3E%3Cuse fill='%23f7f7f7' href='%23s' x='2'/%3E%3Cuse fill='%23f7f7f7' href='%23s' x='1' y='1'/%3E%3C/pattern%3E%3Cpattern id='b' width='7' height='11' patternUnits='userSpaceOnUse' patternTransform='scale(5) translate(-800 -600)'%3E%3Cg fill='%23f5f5f5'%3E%3Cuse href='%23s'/%3E%3Cuse href='%23s' y='5' /%3E%3Cuse href='%23s' x='1' y='10'/%3E%3Cuse href='%23s' x='2' y='1'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='8'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='5' y='2'/%3E%3Cuse href='%23s' x='5' y='6'/%3E%3Cuse href='%23s' x='6' y='9'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='h' width='5' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(5) translate(-800 -600)'%3E%3Cg fill='%23f5f5f5'%3E%3Cuse href='%23s' y='5'/%3E%3Cuse href='%23s' y='8'/%3E%3Cuse href='%23s' x='1' y='1'/%3E%3Cuse href='%23s' x='1' y='9'/%3E%3Cuse href='%23s' x='1' y='12'/%3E%3Cuse href='%23s' x='2'/%3E%3Cuse href='%23s' x='2' y='4'/%3E%3Cuse href='%23s' x='3' y='2'/%3E%3Cuse href='%23s' x='3' y='6'/%3E%3Cuse href='%23s' x='3' y='11'/%3E%3Cuse href='%23s' x='4' y='3'/%3E%3Cuse href='%23s' x='4' y='7'/%3E%3Cuse href='%23s' x='4' y='10'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='c' width='17' height='13' patternUnits='userSpaceOnUse' patternTransform='scale(5) translate(-800 -600)'%3E%3Cg fill='%23f2f2f2'%3E%3Cuse href='%23s' y='11'/%3E%3Cuse href='%23s' x='2' y='9'/%3E%3Cuse href='%23s' x='5' y='12'/%3E%3Cuse href='%23s' x='9' y='4'/%3E%3Cuse href='%23s' x='12' y='1'/%3E%3Cuse href='%23s' x='16' y='6'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='d' width='19' height='17' patternUnits='userSpaceOnUse' patternTransform='scale(5) translate(-800 -600)'%3E%3Cg fill='%23ffffff'%3E%3Cuse href='%23s' y='9'/%3E%3Cuse href='%23s' x='16' y='5'/%3E%3Cuse href='%23s' x='14' y='2'/%3E%3Cuse href='%23s' x='11' y='11'/%3E%3Cuse href='%23s' x='6' y='14'/%3E%3C/g%3E%3Cg fill='%23efefef'%3E%3Cuse href='%23s' x='3' y='13'/%3E%3Cuse href='%23s' x='9' y='7'/%3E%3Cuse href='%23s' x='13' y='10'/%3E%3Cuse href='%23s' x='15' y='4'/%3E%3Cuse href='%23s' x='18' y='1'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='e' width='47' height='53' patternUnits='userSpaceOnUse' patternTransform='scale(5) translate(-800 -600)'%3E%3Cg fill='%23378C92'%3E%3Cuse href='%23s' x='2' y='5'/%3E%3Cuse href='%23s' x='16' y='38'/%3E%3Cuse href='%23s' x='46' y='42'/%3E%3Cuse href='%23s' x='29' y='20'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='f' width='59' height='71' patternUnits='userSpaceOnUse' patternTransform='scale(5) translate(-800 -600)'%3E%3Cg fill='%23378C92'%3E%3Cuse href='%23s' x='33' y='13'/%3E%3Cuse href='%23s' x='27' y='54'/%3E%3Cuse href='%23s' x='55' y='55'/%3E%3C/g%3E%3C/pattern%3E%3Cpattern id='g' width='139' height='97' patternUnits='userSpaceOnUse' patternTransform='scale(5) translate(-800 -600)'%3E%3Cg fill='%23378C92'%3E%3Cuse href='%23s' x='11' y='8'/%3E%3Cuse href='%23s' x='51' y='13'/%3E%3Cuse href='%23s' x='17' y='73'/%3E%3Cuse href='%23s' x='99' y='57'/%3E%3C/g%3E%3C/pattern%3E%3C/defs%3E%3Crect fill='url(%23a)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23b)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23h)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23c)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23d)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23e)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23f)' width='100%25' height='100%25'/%3E%3Crect fill='url(%23g)' width='100%25' height='100%25'/%3E%3C/svg%3E\")";

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
    clearChatHistory,
  } = controller;

  const [selectingElement, setSelectingElement] = useState(false);

  const [message, setMessage] = useState("");
  const [scope, setScope] = useState<EditorChatScope>("page");
  const [scopeMenuOpen, setScopeMenuOpen] = useState(false);
  const [confirmFullSite, setConfirmFullSite] = useState(false);
  const [restoreTarget, setRestoreTarget] = useState<VersionMeta | null>(null);
  const [composerFocused, setComposerFocused] = useState(false);

  const listRef = useRef<HTMLDivElement | null>(null);
  const phrase = useRotatingPhrase(chatLoading);

  const available = useMemo(
    () => scopeOptions.filter((o) => o.available),
    [scopeOptions],
  );

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

  const scopeMeta: Record<
    EditorChatScope,
    { label: string; description: string; disabled: string }
  > = {
    target: {
      label: "Element",
      description: "Edit the selected item",
      disabled: "Attach or select an element first",
    },
    section: {
      label: "Section",
      description: "Edit this block area",
      disabled: "Select an element or section first",
    },
    page: {
      label: "Page",
      description: "Edit this page",
      disabled: "Open a page first",
    },
    website: {
      label: "Site",
      description: "Edit the whole website",
      disabled: "Whole-site AI is unavailable",
    },
  };

  const selectedScopeName =
    activeScopeOption?.label || scopeMeta[scope]?.label || "Current scope";
  const canClearTargetScope = selectingElement || scope === "target" || scope === "section";

  const clearTargetScope = () => {
    setSelectingElement(false);
    const nextScope =
      scopeOptions.find((o) => o.scope === "page" && o.available)?.scope ??
      scopeOptions.find((o) => o.scope === "website" && o.available)?.scope;

    if (nextScope) {
      setScope(nextScope);
    }
  };

  const scopeDescription = useMemo(() => {
    switch (scope) {
      case "target":
        return "Describe what to change in this element.";
      case "section":
        return "Describe what to change in this section.";
      case "page":
        return "Describe what to change on this page.";
      case "website":
        return "Describe what to change across the whole site.";
      default:
        return "Describe what to change.";
    }
  }, [scope]);

  const composerPlaceholder = useMemo(() => {
    if (!canUseAI) return "AI unavailable";
    switch (scope) {
      case "target":
        return "e.g. Improve this headline";
      case "section":
        return "e.g. Make this section more visual";
      case "page":
        return "e.g. Restyle this page for a modren vibe";
      case "website":
        return "e.g. Refresh the whole site to feel more modern";
      default:
        return "e.g. Describe the change you want";
    }
  }, [canUseAI, scope]);

  // When the parent updates selection (scopeOptions shows Selection available)
  // stop the attach mode so the UI returns to normal.
  useEffect(() => {
    if (selectingElement) {
      const sel = scopeOptions.find((o) => o.scope === "target" && o.available);
      if (sel) {
        setSelectingElement(false);
        setScope("target");
      }
    }
  }, [scopeOptions, selectingElement]);

  // Escape cancels attach mode
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectingElement(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

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

  const handleSend = () => {
    if (!canSend) return;

    if (scope === "website") {
      setConfirmFullSite(true);
      return;
    }

    doSend();
  };

  const botAvatar = (
    <Box
      sx={{
        flex: "0 0 auto",
        width: 26,
        height: 26,
        borderRadius: "999px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: MODAL_BUTTON,
        color: "#ffffff",
      }}
    >
      <Sparkles size={15} color="#378C92"/>
    </Box>
  );

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant="persistent"
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 430 },
            background: "transparent",
            border: 0,
            boxShadow: "none",
            p: { xs: 1, sm: 1.5 },
            boxSizing: "border-box",
            pointerEvents: selectingElement ? "none" : "auto",
            opacity: selectingElement ? 0.42 : 1,
            transition: "opacity 160ms ease",
          },
        }}
      >
        <Box
          sx={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            fontFamily:
              'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            backgroundColor: CHAT_AREA_BG,
            backgroundImage: `url(${chatPanelBg})`,
            backgroundSize: "cover",
            border: `1px solid ${THEME_BORDER}`,
            borderRadius: "12px",
            boxShadow:
              "0 8px 48px rgba(55,140,146,0.18), 0 2px 8px rgba(55,140,146,0.08)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              px: 2.5,
              py: 2,
              borderBottom: `1px solid rgba(55,140,146,0.10)`,
              backgroundColor: CHAT_AREA_BG,
              backgroundImage: `url(${chatPanelBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backdropFilter: "blur(8px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 1.5,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.15 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: THEME_LIGHT,
                }}
              >
                <Sparkles size={14} color={THEME} />
              </Box>

              <Box>
                <Typography
                  sx={{
                    color: TEXT_DARK,
                    fontSize: 14,
                    fontWeight: 600,
                    lineHeight: 1.15,
                    letterSpacing: "-0.01em",
                  }}
                >
                  AI Assistant
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.65,
                    mt: 0.45,
                  }}
                >
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#10b981",
                    }}
                  />

                  <Typography
                    sx={{
                      color: TEXT_MUTED,
                      fontSize: 10,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Online
                  </Typography>
                </Box>
              </Box>
            </Box>

            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                width: 30,
                height: 30,
                borderRadius: "999px",
                color: TEXT_LIGHT,
                background: "transparent",
                "&:hover": {
                  background: "transparent",
                  color: TEXT_MID,
                },
              }}
            >
              <X size={16} />
            </IconButton>
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 30,
              px: 2.5,
              py: 2,
              borderBottom: `1px solid rgba(55,140,146,0.10)`,
              backgroundColor: CHAT_AREA_BG,
              backgroundImage: `url(${chatPanelBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: TEXT_DARK,
                    fontSize: 13,
                    fontWeight: 600,
                    lineHeight: 1.2,
                  }}
                >
                  What should AI work on?
                </Typography>
                <Typography
                  sx={{
                    color: TEXT_MUTED,
                    fontSize: 11,
                    fontWeight: 500,
                    lineHeight: 1.25,
                    mt: 0.25,
                  }}
                >
                  Choose the scope before sending your message.
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box sx={{ position: "relative", flex: 1, minWidth: 0 }}>
                  <Box
                    component="button"
                    type="button"
                    onClick={() => setScopeMenuOpen((open) => !open)}
                    sx={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      px: 1.75,
                      py: 1.25,
                      background: "rgba(255,255,255,0.90)",
                      border: `1px solid ${THEME_BORDER_M}`,
                      borderRadius: "8px",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                      "&:hover": {
                        borderColor: THEME,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        sx={{
                          fontSize: 10,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: THEME,
                          flex: "0 0 auto",
                        }}
                      >
                        Scope
                      </Typography>
                      <Typography sx={{ color: TEXT_LIGHT, fontSize: 13 }}>
                        |
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 13,
                          fontWeight: 500,
                          color: TEXT_DARK,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {scopeMeta[scope]?.label ||
                          activeScopeOption?.label ||
                          "Scope"}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        color: THEME,
                        transform: scopeMenuOpen ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <ChevronDown size={16} />
                    </Box>
                  </Box>

                  {scopeMenuOpen && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: "calc(100% + 4px)",
                        left: 0,
                        right: 0,
                        zIndex: 50,
                        overflow: "hidden",
                        background: "#ffffff",
                        border: "1px solid rgba(55,140,146,0.20)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                      }}
                    >
                      {scopeOptions.map((option) => {
                        const active = scope === option.scope;
                        const meta = scopeMeta[option.scope];
                        return (
                          <Box
                            key={option.scope}
                            component="button"
                            type="button"
                            disabled={!option.available}
                            onClick={() => {
                              if (!option.available) return;
                              setScope(option.scope);
                              setScopeMenuOpen(false);
                            }}
                            sx={{
                              width: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              px: 1.75,
                              py: 1.25,
                              border: 0,
                              background: active ? THEME : "transparent",
                              color: active
                                ? "#ffffff"
                                : option.available
                                  ? TEXT_MID
                                  : "#c5d0dd",
                              cursor: option.available ? "pointer" : "default",
                              fontSize: 13,
                              fontWeight: 500,
                              textAlign: "left",
                              opacity: option.available ? 1 : 0.7,
                              "&:hover": {
                                background: active
                                  ? THEME
                                  : option.available
                                    ? "rgba(55,140,146,0.06)"
                                    : "transparent",
                              },
                            }}
                          >
                            <span>{meta.label}</span>
                            {!option.available && (
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: 10,
                                  fontWeight: 600,
                                  color: "inherit",
                                  opacity: 0.8,
                                }}
                              >
                                unavailable
                              </Typography>
                            )}
                          </Box>
                        );
                      })}
                    </Box>
                  )}
                </Box>

                <Box
                  component="button"
                  type="button"
                  aria-label="Attach element"
                  onClick={() => setSelectingElement(true)}
                  sx={{
                    flex: "0 0 auto",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.75,
                    px: 1.5,
                    py: 1.25,
                    border: `1px solid ${THEME_BORDER_M}`,
                    borderRadius: "8px",
                    background: selectingElement
                      ? "rgba(55,140,146,0.12)"
                      : "rgba(255,255,255,0.80)",
                    color: THEME,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    transition: "border-color 0.15s, background 0.15s",
                    "&:hover": {
                      borderColor: THEME,
                      background: "rgba(55,140,146,0.05)",
                    },
                  }}
                >
                  <Paperclip size={14} />
                  {selectingElement ? "Attaching" : "Attach"}
                </Box>

                {chatMessages.length > 0 && (
                  <Box
                    component="button"
                    title="Clear chat"
                    aria-label="Clear chat history"
                    type="button"
                    onClick={() => clearChatHistory()}
                    sx={{
                      flex: "0 0 auto",
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(229,231,235,0.80)",
                      borderRadius: "8px",
                      background: "rgba(255,255,255,0.80)",
                      cursor: "pointer",
                      color: TEXT_MUTED,
                      transition:
                        "border-color 0.15s, background 0.15s, color 0.15s",
                      "&:hover": {
                        borderColor: "rgba(55,140,146,0.40)",
                        background: "rgba(55,140,146,0.05)",
                        color: THEME,
                      },
                    }}
                  >
                    <Trash2 size={14} />
                  </Box>
                )}
              </Box>

              {selectingElement && (
                <Box
                  sx={{
                    px: 1.2,
                    py: 0.85,
                    borderRadius: "10px",
                    background: "rgba(55,140,146,0.08)",
                    border: "1px solid rgba(55,140,146,0.16)",
                    color: THEME,
                    fontSize: 11.5,
                    fontWeight: 600,
                    lineHeight: 1.35,
                  }}
                >
                  Click any editable item on the page to attach it. Press Esc to
                  cancel.
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: TEXT_MUTED,
                  }}
                >
                  Selected {scopeMeta[scope]?.label || "Scope"}
                </Typography>
                <Typography
                  sx={{ color: "rgba(55,140,146,0.30)", fontSize: 12 }}
                >
                  /
                </Typography>
                <Typography
                  title={selectedScopeName}
                  sx={{
                    minWidth: 0,
                    fontSize: 10,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: THEME,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {selectingElement ? "Waiting for element" : selectedScopeName}
                </Typography>

                {canClearTargetScope && (
                  <Box
                    component="button"
                    type="button"
                    onClick={clearTargetScope}
                    sx={{
                      ml: "auto",
                      border: 0,
                      background: "transparent",
                      color: TEXT_MUTED,
                      cursor: "pointer",
                      fontSize: 10,
                      fontWeight: 600,
                      "&:hover": {
                        color: THEME,
                      },
                    }}
                  >
                    Clear
                  </Box>
                )}
              </Box>
            </Box>
          </Box>

          <Box
            ref={listRef}
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: "auto",
              px: 1,
              py: 0,
              backgroundColor: CHAT_AREA_BG,
              backgroundImage: `url(${chatPanelBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              scrollbarWidth: "none",
              pointerEvents: selectingElement ? "none" : "auto",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Box
              sx={{
                minHeight: "100%",
                px: 1.25,
                py: 1.75,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                backgroundColor: MODAL_BG,
                backgroundImage: BG_PATTERN,
                backgroundSize: "auto",
                backgroundPosition: "center top",
                backgroundRepeat: "repeat",
                backgroundAttachment: "fixed",
                borderRadius: "10px",
              }}
            >
              {chatMessages.length === 0 && !chatLoading && (
                <Box
                  sx={{
                    textAlign: "center",
                    px: 1,
                    py: 4,
                  }}
                >
                  <Typography
                    sx={{
                      color: TEXT_MID,
                      fontSize: 15,
                      fontWeight: 600,
                      lineHeight: 1.45,
                    }}
                  >
                    {scopeDescription}
                  </Typography>

                  <Typography
                    sx={{
                      color: TEXT_MUTED,
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.45,
                      mt: 1,
                    }}
                  >
                    Ask the AI to rewrite copy, adjust a section, refresh a
                    page, or recreate the site.
                  </Typography>
                </Box>
              )}

              {versions.length > 0 && (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: "18px",
                    border: `1.5px solid ${MODAL_BORDER}`,
                    background: "#ffffff",
                  }}
                >
                  <Typography
                    sx={{
                      color: TEXT_DARK,
                      fontSize: 14,
                      fontWeight: 600,
                      mb: 0.75,
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
                            color: TEXT_MID,
                            flex: 1,
                            fontSize: 12,
                            fontWeight: 600,
                            lineHeight: 1.35,
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

              {scope === "website" && (
                <Box
                  sx={{
                    px: 1.5,
                    py: 1.25,
                    borderRadius: "16px",
                    border: `1.5px solid ${MODAL_BORDER}`,
                    background: MODAL_SOFT,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                  }}
                >
                  <RefreshCw size={14} color={TEXT_MID} />

                  <Typography
                    sx={{
                      color: TEXT_MID,
                      fontSize: 12.5,
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    Full-site changes ask for confirmation and save a restore
                    point.
                  </Typography>
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
                          maxWidth: "88%",
                          px: 1.5,
                          py: 1.15,
                          borderRadius: "18px 18px 5px 18px",
                          background: USER_BUBBLE_BG,
                          border: `1.5px solid ${USER_BUBBLE_BORDER}`,
                          color: "#ffffff",
                          boxShadow: "0 8px 20px rgba(55,140,146,0.18)",
                          overflow: "hidden",
                          wordBreak: "break-word",
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: 13,
                            fontWeight: 500,
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                          }}
                        >
                          {m.text}
                        </Typography>
                      </Box>
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 0.85,
                          maxWidth: "92%",
                        }}
                      >
                        {botAvatar}

                        <Box
                          sx={{
                            flex: 1,
                            px: 1.5,
                            py: 1.15,
                            borderRadius: "5px 18px 18px 18px",
                            background: m.isError
                              ? "rgba(255,247,247,0.95)"
                              : ASSISTANT_BUBBLE_BG,
                            border: m.isError
                              ? "1.5px solid rgba(239,68,68,0.18)"
                              : `1.5px solid ${ASSISTANT_BUBBLE_BORDER}`,
                            color: TEXT_MID,
                            boxShadow: m.isError
                              ? "0 8px 20px rgba(239,68,68,0.08)"
                              : "0 8px 20px rgba(55,140,146,0.08)",
                            overflow: "hidden",
                            wordBreak: "break-word",
                          }}
                        >
                          {m.isError && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                mb: 0.75,
                              }}
                            >
                              <CircleAlert size={13} color="#f87171" />

                              <Typography
                                sx={{
                                  color: "#f87171",
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  lineHeight: 1.35,
                                }}
                              >
                                Failed - you can mention this in your next
                                message
                              </Typography>
                            </Box>
                          )}

                          {!m.isError && m.applied && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                mb: 0.75,
                                color: "#16a34a",
                              }}
                            >
                              <Check size={13} strokeWidth={3} />

                              <Typography
                                sx={{
                                  color: "inherit",
                                  fontSize: 11.5,
                                  fontWeight: 600,
                                  lineHeight: 1.35,
                                }}
                              >
                                AI changes applied
                              </Typography>
                            </Box>
                          )}

                          <Typography
                            sx={{
                              color: m.isError ? TEXT_MID : TEXT_MID,
                              fontSize: 13,
                              fontWeight: 500,
                              lineHeight: 1.5,
                            }}
                          >
                            {m.text}
                          </Typography>
                        </Box>
                      </Box>
                    </>
                  )}

                  {m.pendingPatches && m.pendingPatches.length > 0 && (
                    <Box
                      sx={{
                        mt: 0.5,
                        display: "flex",
                        gap: 0.75,
                        pl: 4.35,
                      }}
                    >
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
                        color: TEXT_MUTED,
                        fontSize: 12,
                        fontWeight: 500,
                        mt: 0.5,
                        display: "block",
                        pl: 4.35,
                      }}
                    >
                      A restorable version was saved before this change.
                    </Typography>
                  )}
                </Box>
              ))}

              {chatLoading && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 0.85,
                  }}
                >
                  {botAvatar}

                  <Box
                    sx={{
                      px: 1.5,
                      py: 1.15,
                      borderRadius: "5px 18px 18px 18px",
                      background: "#ffffff",
                      border: `1.5px solid ${MODAL_BORDER}`,
                      display: "flex",
                      alignItems: "center",
                      gap: 0.75,
                      color: TEXT_MID,
                    }}
                  >
                    <CircularProgress size={14} sx={{ color: THEME }} />

                    <Fade key={phrase} in timeout={250}>
                      <Typography
                        sx={{
                          fontSize: 12.5,
                          fontWeight: 600,
                        }}
                      >
                        {phrase}…
                      </Typography>
                    </Fade>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          <Box
            sx={{
              position: "relative",
              zIndex: 10,
              px: 2.5,
              pt: 2,
              pb: 1.5,
              borderTop: `1px solid rgba(55,140,146,0.10)`,
              backgroundColor: CHAT_AREA_BG,
              backgroundImage: `url(${chatPanelBg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backdropFilter: "blur(8px)",
            }}
          >
            {!canUseAI && disabledReason && (
              <Typography
                sx={{
                  color: TEXT_MUTED,
                  mb: 1,
                  display: "block",
                  fontSize: 12.5,
                  fontWeight: 500,
                }}
              >
                {disabledReason}
              </Typography>
            )}

            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "flex-end",
                border: `1px solid ${
                  composerFocused ? THEME : "rgba(55,140,146,0.20)"
                }`,
                borderRadius: "12px",
                background: "rgba(255,255,255,0.90)",
                boxShadow: composerFocused
                  ? "0 0 0 2px rgba(55,140,146,0.15)"
                  : "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
            >
              <Box
                component="textarea"
                rows={1}
                placeholder={canUseAI ? composerPlaceholder : "AI unavailable"}
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
                  minHeight: 22,
                  maxHeight: 88,
                  border: 0,
                  outline: "none",
                  resize: "none",
                  background: "transparent",
                  color: TEXT_DARK,
                  font: "inherit",
                  fontSize: 13,
                  fontWeight: 500,
                  lineHeight: 1.6,
                  pr: 5.5,
                  pl: 2,
                  py: 1.25,
                  "&::placeholder": {
                    color: TEXT_LIGHT,
                    opacity: 1,
                  },
                  "&:disabled": {
                    color: TEXT_MUTED,
                    WebkitTextFillColor: TEXT_MUTED,
                  },
                }}
              />

              <IconButton
                onClick={handleSend}
                disabled={!canSend}
                sx={{
                  position: "absolute",
                  right: 4,
                  bottom: 4,
                  width: 32,
                  height: 32,
                  borderRadius: "8px",
                  background: canSend ? THEME : MODAL_BUTTON,
                  color: "#ffffff",
                  boxShadow: canSend
                    ? "0 2px 6px rgba(55,140,146,0.30)"
                    : "none",
                  transition: "background 0.15s ease",
                  "&:hover": {
                    background: canSend ? "#2f7a80" : MODAL_BUTTON,
                  },
                  "&.Mui-disabled": {
                    color: "#ffffff",
                    background: MODAL_BUTTON,
                    opacity: 0.95,
                  },
                }}
              >
                {chatLoading ? (
                  <CircularProgress size={15} sx={{ color: "#fff" }} />
                ) : (
                  <Send size={14} />
                )}
              </IconButton>
            </Box>
            <Typography
              sx={{
                textAlign: "center",
                fontSize: 10,
                color: TEXT_DARK,
                mt: 1.25,
                lineHeight: 1.4,
                px: 1,
              }}
            >
              AI can make mistakes. Always review changes before publishing.
            </Typography>
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
