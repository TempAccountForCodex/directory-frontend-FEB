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

import React, { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { Sparkles, Undo2, MessageSquare, X } from "lucide-react";
import { getDashboardColors } from "../../styles/dashboardTheme";
import { useTheme as useCustomTheme } from "../../context/ThemeContext";
import { useEditorAI, type AITargetRef } from "./useEditorAI";
import { toPersistedBlockContentPath } from "./aiPatchUtils";
import AskAIDialog from "./AskAIDialog";
import AIConflictDialog from "./AIConflictDialog";
import AIChatPanel from "./AIChatPanel";
import type { AIHistoryEntry, VersionMeta } from "../../api/websiteAI";
import AIGenerationProgress from "../WebsiteCreation/AIGenerationProgress";

export interface EditorAISelection {
  editable?: {
    blockId: string | number;
    fieldPath: string;
    persistedFieldPath?: string;
    label?: string;
    aiEditKey?: string;
    styleTarget?: {
      fieldPath: string;
      persistedFieldPath?: string;
      aiEditKey?: string;
      label?: string;
    };
    styleTargets?: Array<{
      fieldPath: string;
      persistedFieldPath?: string;
      aiEditKey?: string;
      label?: string;
      category?: string;
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
  selection: EditorAISelection;
  revertibleTurns?: AIHistoryEntry[];
  versions?: VersionMeta[];
  openAskSignal?: number;
  getCurrentValue: (
    blockId: string | number | undefined,
    fieldPath: string,
  ) => unknown;
  applyPatch: (
    blockId: string | number | undefined,
    fieldPath: string,
    value: unknown,
  ) => void;
  onRefresh?: () => void | Promise<void>;
}

const EditorAILayer: React.FC<EditorAILayerProps> = ({
  websiteId,
  websiteName,
  pageId,
  canUseAI,
  disabledReason,
  selection,
  revertibleTurns,
  versions,
  openAskSignal,
  getCurrentValue,
  applyPatch,
  onRefresh,
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const [askOpen, setAskOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [dismissedSessionId, setDismissedSessionId] = useState<string | null>(
    null,
  );

  const controller = useEditorAI({
    websiteId,
    pageId,
    revertibleTurns,
    getCurrentValue,
    applyPatch,
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
    if (selection.page) {
      return {
        fieldPath: `pages.${selection.page.id}.title`,
        label: selection.page.title || "Page",
        kind: "page",
      };
    }
    return null;
  }, [selection]);

  const scopeOptions = useMemo(
    () => [
      {
        scope: "target" as const,
        label: "Selection",
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
        label: "Section",
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
        label: "Page",
        available: !!pageId,
      },
      {
        scope: "website" as const,
        label: "Whole site",
        available: true,
      },
    ],
    [selection, pageId],
  );

  const requestInProgress = controller.activeRequest || controller.chatLoading;
  const activeProgressSession = useMemo(() => {
    const sessionMessage = [...controller.chatMessages]
      .reverse()
      .find((message) => message.sessionId);
    if (!sessionMessage?.sessionId) return null;
    if (sessionMessage.sessionId === dismissedSessionId) return null;
    return sessionMessage.sessionId;
  }, [controller.chatMessages, dismissedSessionId]);
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
    if (!openAskSignal || askDisabled) return;
    setAskOpen(true);
  }, [openAskSignal, askDisabled]);

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
          display: "flex",
          alignItems: "center",
          gap: 0.5,
          p: 0.5,
          borderRadius: 999,
          backgroundColor: colors.panelBg || colors.bgCard,
          border: `1px solid ${colors.border}`,
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
          backdropFilter: "blur(12px)",
        }}
      >
        <Tooltip title={askTooltip}>
          <Box
            component="span"
            role="button"
            aria-disabled={askDisabled}
            aria-label="Ask AI"
            tabIndex={askDisabled ? -1 : 0}
            onClick={() => !askDisabled && setAskOpen(true)}
            onKeyDown={(event) =>
              handleKeyboardAction(event, () => setAskOpen(true), askDisabled)
            }
            sx={{
              ...pillBtn(!askDisabled),
              color: askDisabled ? colors.textSecondary : "#fff",
              background: askDisabled
                ? alpha(colors.text, 0.06)
                : "linear-gradient(135deg, #378C92, #2d7479)",
              opacity: askDisabled ? 0.7 : 1,
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
              maxWidth: 160,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              px: 0.5,
            }}
          >
            {askTarget.label}
          </Typography>
        )}

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
                controller.revertDepth > 0 ? colors.text : colors.textSecondary,
              opacity: controller.revertDepth > 0 ? 1 : 0.5,
            }}
          >
            <Undo2 size={15} />
            Undo AI
          </Box>
        </Tooltip>

        <Tooltip
          title={canUseAI ? "Open AI chat" : disabledReason || "AI unavailable"}
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
              background: chatOpen ? alpha("#378C92", 0.12) : "transparent",
            }}
          >
            <MessageSquare size={15} />
            Chat
          </Box>
        </Tooltip>
      </Box>

      <AskAIDialog
        open={askOpen}
        target={askTarget}
        controller={controller}
        onClose={() => setAskOpen(false)}
      />

      <AIConflictDialog
        conflict={controller.conflict}
        onResolve={controller.resolveConflict}
      />

      <AIChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
          controller={controller}
          canUseAI={canUseAI}
          disabledReason={disabledReason}
          scopeOptions={scopeOptions}
          versions={versions}
      />

      <Dialog
        open={Boolean(activeProgressSession)}
        maxWidth="md"
        fullWidth
        onClose={() =>
          activeProgressSession && setDismissedSessionId(activeProgressSession)
        }
        PaperProps={{
          sx: {
            backgroundColor: colors.panelBg || colors.bgCard,
            backgroundImage: "none",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 1 }}>
          <IconButton
            size="small"
            onClick={() =>
              activeProgressSession &&
              setDismissedSessionId(activeProgressSession)
            }
            sx={{ color: colors.textSecondary }}
          >
            <X size={18} />
          </IconButton>
        </Box>
        <DialogContent sx={{ pt: 0 }}>
          {activeProgressSession && (
            <AIGenerationProgress
              sessionId={activeProgressSession}
              websiteId={websiteId}
              websiteName={websiteName || "Website"}
              questionnaireData={{}}
              autoNavigate={false}
              onComplete={onRefresh}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditorAILayer;
