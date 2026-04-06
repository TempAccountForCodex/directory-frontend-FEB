/**
 * DetailedCustomPanel — Step 9.13.5
 *
 * Detailed customization tab panel for the editor.
 * Wraps website info fields (name + slug) and the full BlockEditor.
 *
 * Sections:
 *   1. Website Details — name TextField, slug TextField with URL preview
 *   2. Block Content Editor — BlockEditor component for block management
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders
 * - useCallback on onChange handlers
 */

import React, { useCallback } from "react";
import { Box, Paper, Typography, TextField, Stack, alpha } from "@mui/material";
import BlockEditor from "../BlockEditor/BlockEditor";
import type { Block } from "../BlockEditor/BlockList";
import SaveStatus from "./SaveStatus";
import type { SaveStatusType } from "./SaveStatus";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

// DashboardColors comes from the JS getDashboardColors helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardColors = Record<string, any>;

export interface DetailedCustomPanelProps {
  websiteName: string;
  slug: string;
  slugError?: string | null;
  onWebsiteNameChange: (name: string) => void;
  onSlugChange: (slug: string) => void;
  editorBlocks: Block[];
  onBlockEditorChange: (blocks: Block[]) => void;
  blockEditorWebsiteId?: number | null;
  blockEditorPageId?: number | null;
  blockSaveStatus?: SaveStatusType;
  onTriggerBlockSave?: () => void;
  disabled?: boolean;
  colors: DashboardColors;
}

// ---------------------------------------------------------------------------
// DetailedCustomPanel
// ---------------------------------------------------------------------------

const DetailedCustomPanel: React.FC<DetailedCustomPanelProps> = React.memo(
  ({
    websiteName,
    slug,
    slugError,
    onWebsiteNameChange,
    onSlugChange,
    editorBlocks,
    onBlockEditorChange,
    blockEditorWebsiteId,
    blockSaveStatus,
    onTriggerBlockSave,
    disabled = false,
    colors,
  }) => {
    const handleNameChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onWebsiteNameChange(e.target.value);
      },
      [onWebsiteNameChange],
    );

    const handleSlugChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onSlugChange(e.target.value);
      },
      [onSlugChange],
    );

    const hasBlockEditor = blockEditorWebsiteId != null;

    return (
      <Stack spacing={3}>
        {/* Website Details */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Typography
            variant="h6"
            sx={{ color: colors.text, fontWeight: 600, mb: 3 }}
          >
            Website Details
          </Typography>

          <TextField
            fullWidth
            label="Website Name *"
            value={websiteName}
            onChange={handleNameChange}
            disabled={disabled}
            sx={{ mb: 2 }}
            placeholder="e.g., My Professional Services"
          />

          <TextField
            fullWidth
            label="URL Slug *"
            value={slug}
            onChange={handleSlugChange}
            disabled={disabled}
            error={!!slugError}
            helperText={slugError || `/site/${slug || "your-slug"}`}
            placeholder="e.g., my-services"
          />
        </Paper>

        {/* Block Content Editor */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 600 }}
            >
              Block Content Editor
            </Typography>

            {/* Save Status — only shown when a website has been created */}
            {hasBlockEditor && blockSaveStatus && (
              <Box data-testid="block-save-status">
                <SaveStatus
                  status={blockSaveStatus}
                  onRetry={onTriggerBlockSave}
                />
              </Box>
            )}
          </Box>

          <BlockEditor
            blocks={editorBlocks}
            onChange={onBlockEditorChange}
            disabled={disabled}
            saveStatus={hasBlockEditor ? blockSaveStatus : undefined}
            onSaveRetry={onTriggerBlockSave}
          />
        </Paper>
      </Stack>
    );
  },
);

DetailedCustomPanel.displayName = "DetailedCustomPanel";

export default DetailedCustomPanel;
