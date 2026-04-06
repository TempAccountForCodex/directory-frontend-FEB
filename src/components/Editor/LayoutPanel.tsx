/**
 * LayoutPanel — Step 9.13.3
 *
 * Layout tab panel for the CustomizeWebsite editor.
 * Wraps page selection/ordering UI and section visibility toggles.
 *
 * Sections:
 *   1. Page Selection & Order — page cards with checkboxes, up/down buttons,
 *      and DraggablePageList for drag reordering.
 *   2. Section Visibility — Home/Services section toggle checkboxes.
 *   3. Block Reorder (conditional) — DraggableBlockList when blocks/pageId/websiteId provided.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders
 */

import React, { useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  IconButton,
  Chip,
  Tooltip,
  Alert,
  alpha,
} from "@mui/material";
import {
  ArrowUpward as UpIcon,
  ArrowDownward as DownIcon,
  Warning as WarningIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";
import DraggablePageList from "./DraggablePageList";
import DraggableBlockList, { type DraggableBlock } from "./DraggableBlockList";
import type { PageItem } from "./DraggablePageList";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PageSelection {
  id: string;
  title: string;
  path: string;
  isHome: boolean;
  selected: boolean;
  sortOrder: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  blocks: any[];
}

export interface SectionToggle {
  pageTitle: string;
  sectionIndex: number;
  sectionName: string;
  enabled: boolean;
}

// DashboardColors comes from the JS getDashboardColors helper
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DashboardColors = Record<string, any>;

export interface LayoutPanelProps {
  pages: PageSelection[];
  sections: SectionToggle[];
  maxPagesPerWebsite: number;
  onTogglePage: (pageId: string) => void;
  onMovePage: (index: number, direction: "up" | "down") => void;
  onPagesChange: (pages: PageItem[]) => void;
  onToggleSection: (pageTitle: string, sectionIndex: number) => void;
  blocks?: DraggableBlock[];
  pageId?: number | null;
  websiteId?: number | null;
  onBlocksChange?: (blocks: DraggableBlock[]) => void;
  onBlockSelect?: (blockId: number) => void;
  selectedBlockId?: number | null;
  disabled?: boolean;
  colors: DashboardColors;
}

// ---------------------------------------------------------------------------
// LayoutPanel
// ---------------------------------------------------------------------------

const LayoutPanel: React.FC<LayoutPanelProps> = React.memo(
  ({
    pages,
    sections,
    maxPagesPerWebsite,
    onTogglePage,
    onMovePage,
    onPagesChange,
    onToggleSection,
    blocks,
    pageId,
    websiteId,
    onBlocksChange,
    onBlockSelect,
    selectedBlockId,
    disabled = false,
    colors,
  }) => {
    const selectedCount = pages.filter((p) => p.selected).length;
    const isMaxReached = selectedCount >= maxPagesPerWebsite;

    const getTooltipMessage = useCallback(
      (page: PageSelection): string => {
        if (page.isHome) {
          return "Home page is required and cannot be deselected";
        }
        if (!page.selected && isMaxReached) {
          return `Maximum of ${maxPagesPerWebsite} pages reached. Deselect another page to enable this one.`;
        }
        return "";
      },
      [isMaxReached, maxPagesPerWebsite],
    );

    const handleTogglePage = useCallback(
      (id: string) => () => {
        onTogglePage(id);
      },
      [onTogglePage],
    );

    const handleMoveUp = useCallback(
      (index: number) => () => {
        onMovePage(index, "up");
      },
      [onMovePage],
    );

    const handleMoveDown = useCallback(
      (index: number) => () => {
        onMovePage(index, "down");
      },
      [onMovePage],
    );

    const handleToggleSection = useCallback(
      (pageTitle: string, sectionIndex: number) => () => {
        onToggleSection(pageTitle, sectionIndex);
      },
      [onToggleSection],
    );

    const hasDraggableBlocks =
      blocks != null &&
      pageId != null &&
      websiteId != null &&
      onBlocksChange != null;

    return (
      <Stack spacing={3}>
        {/* Page Selection & Order */}
        <Paper
          sx={{
            p: 3,
            bgcolor: alpha(colors.dark, 0.3),
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 600 }}
            >
              Page Selection & Order
            </Typography>
            <Tooltip
              title={`Your current plan allows up to ${maxPagesPerWebsite} pages per website.`}
              arrow
            >
              <InfoIcon
                sx={{
                  fontSize: 18,
                  color: colors.textSecondary,
                  cursor: "help",
                }}
              />
            </Tooltip>
          </Box>

          <Typography
            variant="caption"
            sx={{ color: colors.textSecondary, mb: 1, display: "block" }}
          >
            Choose which pages to include. Home page is required.
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                color: isMaxReached ? colors.warning : colors.textSecondary,
                fontWeight: 600,
              }}
            >
              {selectedCount} / {maxPagesPerWebsite} pages selected
            </Typography>
            {isMaxReached && (
              <Chip
                icon={<WarningIcon />}
                label="Maximum reached"
                size="small"
                color="warning"
                sx={{ height: 20, fontSize: "0.7rem" }}
              />
            )}
          </Box>

          {isMaxReached && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You've reached the maximum of {maxPagesPerWebsite} pages. To add
              more pages, deselect an existing page first.
            </Alert>
          )}

          <Stack spacing={1}>
            {pages.map((page, index) => {
              const isDisabled =
                page.isHome || (!page.selected && isMaxReached);
              const tooltip = getTooltipMessage(page);

              return (
                <Card
                  key={page.id}
                  sx={{
                    bgcolor: page.selected
                      ? alpha(colors.primary, 0.1)
                      : alpha(colors.dark, 0.3),
                    border: `1px solid ${page.selected ? colors.primary : "transparent"}`,
                    opacity: isDisabled && !page.isHome ? 0.5 : 1,
                    transition: "all 0.2s ease",
                  }}
                >
                  <CardContent
                    sx={{ py: 1.5, px: 2, "&:last-child": { pb: 1.5 } }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Tooltip
                        title={tooltip}
                        arrow
                        placement="top"
                        disableHoverListener={!isDisabled}
                      >
                        <Box>
                          <Checkbox
                            checked={page.selected}
                            disabled={isDisabled}
                            onChange={handleTogglePage(page.id)}
                            size="small"
                          />
                        </Box>
                      </Tooltip>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="body2"
                          component="div"
                          sx={{ fontWeight: 600 }}
                        >
                          {page.title}
                          {page.isHome && (
                            <Chip
                              label="Required"
                              size="small"
                              color="primary"
                              sx={{ ml: 1, height: 18 }}
                            />
                          )}
                          {!page.selected && isMaxReached && !page.isHome && (
                            <Chip
                              label="Limit reached"
                              size="small"
                              color="warning"
                              sx={{ ml: 1, height: 18 }}
                            />
                          )}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: colors.textSecondary }}
                        >
                          {page.path}
                        </Typography>
                      </Box>
                      {page.selected && (
                        <Box>
                          <IconButton
                            size="small"
                            onClick={handleMoveUp(index)}
                            disabled={
                              disabled ||
                              !pages.slice(0, index).some((p) => p.selected)
                            }
                            aria-label={`Move ${page.title} up`}
                          >
                            <UpIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={handleMoveDown(index)}
                            disabled={
                              disabled ||
                              !pages.slice(index + 1).some((p) => p.selected)
                            }
                            aria-label={`Move ${page.title} down`}
                          >
                            <DownIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>

          {/* Drag-to-reorder when >1 selected pages */}
          {pages.filter((p) => p.selected).length > 1 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="caption"
                sx={{ color: colors.textSecondary, mb: 1, display: "block" }}
              >
                Drag to reorder selected pages:
              </Typography>
              <DraggablePageList
                pages={pages.filter((p) => p.selected)}
                onPagesChange={onPagesChange}
                disabled={disabled}
              />
            </Box>
          )}
        </Paper>

        {/* Section Visibility */}
        {sections.length > 0 && (
          <Paper
            sx={{
              p: 3,
              bgcolor: alpha(colors.dark, 0.3),
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
            >
              Section Visibility
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: colors.textSecondary, mb: 3, display: "block" }}
            >
              Enable or disable specific sections for Home and Services pages.
            </Typography>

            {/* Home Sections */}
            {sections.filter((s) => s.pageTitle === "Home").length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
                >
                  Home Page Sections
                </Typography>
                <Stack spacing={0.5}>
                  {sections
                    .filter((s) => s.pageTitle === "Home")
                    .map((section, idx) => (
                      <FormControlLabel
                        key={`home-${idx}`}
                        control={
                          <Checkbox
                            checked={section.enabled}
                            onChange={handleToggleSection(
                              section.pageTitle,
                              section.sectionIndex,
                            )}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {section.sectionName}
                          </Typography>
                        }
                      />
                    ))}
                </Stack>
              </Box>
            )}

            {/* Services Sections */}
            {sections.filter((s) => s.pageTitle === "Services").length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ color: colors.text, fontWeight: 600, mb: 1 }}
                >
                  Services Page Sections
                </Typography>
                <Stack spacing={0.5}>
                  {sections
                    .filter((s) => s.pageTitle === "Services")
                    .map((section, idx) => (
                      <FormControlLabel
                        key={`services-${idx}`}
                        control={
                          <Checkbox
                            checked={section.enabled}
                            onChange={handleToggleSection(
                              section.pageTitle,
                              section.sectionIndex,
                            )}
                            size="small"
                          />
                        }
                        label={
                          <Typography variant="body2">
                            {section.sectionName}
                          </Typography>
                        }
                      />
                    ))}
                </Stack>
              </Box>
            )}
          </Paper>
        )}

        {/* Block reorder — only shown when blocks/pageId/websiteId all provided */}
        {hasDraggableBlocks && (
          <Paper
            sx={{
              p: 3,
              bgcolor: alpha(colors.dark, 0.3),
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{ color: colors.text, fontWeight: 600, mb: 2 }}
            >
              Block Order
            </Typography>
            <DraggableBlockList
              blocks={blocks!}
              pageId={pageId!}
              websiteId={websiteId!}
              onBlocksChange={onBlocksChange!}
              onBlockSelect={onBlockSelect}
              selectedBlockId={selectedBlockId}
              disabled={disabled}
            />
          </Paper>
        )}
      </Stack>
    );
  },
);

LayoutPanel.displayName = "LayoutPanel";

export default LayoutPanel;
