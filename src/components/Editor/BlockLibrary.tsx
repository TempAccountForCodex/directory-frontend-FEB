/**
 * BlockLibrary — Step 9.3.1
 *
 * Persistent sidebar panel (MUI Drawer) listing all available block types
 * fetched from GET /api/content-types/blocks.
 *
 * Features:
 * - Search bar filtering by label, description, searchKeywords
 * - Category tabs: All | Core | Content | Conversion | Social Proof | My Templates
 * - Grid of BlockLibraryCard components
 * - Loading skeleton (3 cards) while fetching
 * - Error alert on fetch failure
 * - Empty state for no matches
 * - "Add to Page" button on each card
 * - Drag-to-insert via @dnd-kit/core useDraggable (Step 9.3.3)
 * - My Templates tab (Step 9.3.4)
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo on BlockLibrary and BlockLibraryCard
 * - useCallback on all event handlers
 * - useMemo for filtered/grouped block types
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import InputAdornment from "@mui/material/InputAdornment";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import GridOnIcon from "@mui/icons-material/GridOn";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from "@mui/icons-material/Share";
import { useDraggable } from "@dnd-kit/core";
import BlockPreviewModal from "./BlockPreviewModal";
import SaveTemplateModal from "./SaveTemplateModal";

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5001/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockCapabilities {
  supportsBackground: boolean;
  supportsVisibility: boolean;
  supportsVariants: boolean;
  supportsCustomCss: boolean;
  isDynamic: boolean;
  dataSource?: string | null;
}

export interface BlockLibraryItem {
  key: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  capabilities: BlockCapabilities;
  variants: string[];
  searchKeywords?: string[];
}

export interface BlockTemplate {
  id: number;
  name: string;
  description?: string;
  blockType: string;
  variant?: string;
  content: Record<string, unknown>;
  isShared: boolean;
  createdAt: string;
}

export interface ExistingBlock {
  id: number;
  blockType: string;
  sortOrder: number;
  content?: Record<string, unknown>;
}

export interface BlockLibraryProps {
  open: boolean;
  onClose: () => void;
  pageId: number;
  blocks: ExistingBlock[];
  onInsertBlock: (
    blockType: string,
    position: "end" | "beginning" | number,
    content?: Record<string, unknown>,
  ) => void;
  onInsertFromTemplate?: (
    template: BlockTemplate,
    position: "end" | "beginning" | number,
  ) => void;
  onSaveTemplate?: (
    blockType: string,
    content: Record<string, unknown>,
  ) => void;
  closeAfterInsert?: boolean;
  currentUserRole?: string;
  historyPush?: (state: unknown, description: string) => void;
}

// ---------------------------------------------------------------------------
// Category definitions
// ---------------------------------------------------------------------------

const CATEGORIES = [
  { key: "all", label: "All" },
  { key: "core", label: "Core" },
  { key: "content", label: "Content" },
  { key: "dynamic", label: "Dynamic" },
  { key: "conversion", label: "Conversion" },
  { key: "social-proof", label: "Social Proof" },
  { key: "my-templates", label: "My Templates" },
];

// ---------------------------------------------------------------------------
// Category chip color map
// ---------------------------------------------------------------------------

const CATEGORY_COLOR: Record<
  string,
  "primary" | "success" | "warning" | "info" | "default"
> = {
  core: "primary",
  content: "success",
  dynamic: "info",
  conversion: "warning",
  "social-proof": "info",
};

// ---------------------------------------------------------------------------
// BlockLibraryCard
// ---------------------------------------------------------------------------

interface BlockLibraryCardProps {
  block: BlockLibraryItem;
  onAddToPage: (blockKey: string) => void;
  onPreview: (block: BlockLibraryItem) => void;
}

const BlockLibraryCard = React.memo<BlockLibraryCardProps>(
  ({ block, onAddToPage, onPreview }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useDraggable({
        id: `library-${block.key}`,
        data: { blockType: block.key, source: "library" },
      });

    const handleAdd = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToPage(block.key);
      },
      [onAddToPage, block.key],
    );

    const handleClick = useCallback(() => {
      onPreview(block);
    }, [onPreview, block]);

    const dragStyle: React.CSSProperties = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 999 : "auto",
          position: isDragging ? "relative" : "relative",
          cursor: "grab",
        }
      : { cursor: "grab" };

    return (
      <Card
        ref={setNodeRef}
        elevation={3}
        onClick={handleClick}
        sx={{
          mb: 1,
          cursor: "pointer",
          border: "1px solid",
          borderColor: "transparent",
          transition: "all 150ms ease",
          "&:hover": {
            elevation: 6,
            borderColor: "primary.main",
            transform: "scale(1.02)",
          },
          ...dragStyle,
        }}
        {...attributes}
        {...listeners}
      >
        <CardContent sx={{ pb: 0, pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <GridOnIcon sx={{ fontSize: 20, color: "text.secondary" }} />
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ color: "text.primary", flex: 1 }}
            >
              {block.label}
            </Typography>
            <Chip
              label={block.category}
              size="small"
              color={CATEGORY_COLOR[block.category] || "default"}
              sx={{ fontSize: "0.65rem", height: 18 }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", lineHeight: 1.4 }}
          >
            {block.description}
          </Typography>
        </CardContent>
        <CardActions sx={{ pt: 0.5, px: 2, pb: 1 }}>
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAdd}
            variant="contained"
            sx={{ fontSize: "0.7rem", px: 1, py: 0.25, minWidth: 0 }}
            aria-label={`Add ${block.label} to page`}
          >
            Add
          </Button>
        </CardActions>
      </Card>
    );
  },
);

BlockLibraryCard.displayName = "BlockLibraryCard";

// ---------------------------------------------------------------------------
// SkeletonCard
// ---------------------------------------------------------------------------

const SkeletonCard: React.FC = () => (
  <Card elevation={1} sx={{ mb: 1 }}>
    <CardContent>
      <Skeleton variant="text" width="60%" height={20} />
      <Skeleton variant="text" width="90%" height={16} />
    </CardContent>
  </Card>
);

// ---------------------------------------------------------------------------
// TemplateCard
// ---------------------------------------------------------------------------

interface TemplateCardProps {
  template: BlockTemplate;
  onInsert: (template: BlockTemplate) => void;
  onDelete: (id: number) => void;
  onToggleShare: (id: number, isShared: boolean) => void;
  isOwner: boolean;
}

const TemplateCard = React.memo<TemplateCardProps>(
  ({ template, onInsert, onDelete, onToggleShare, isOwner }) => {
    const handleInsert = useCallback(
      () => onInsert(template),
      [onInsert, template],
    );
    const handleDelete = useCallback(
      () => onDelete(template.id),
      [onDelete, template.id],
    );
    const handleShare = useCallback(
      () => onToggleShare(template.id, !template.isShared),
      [onToggleShare, template.id, template.isShared],
    );

    return (
      <Card elevation={2} sx={{ mb: 1 }}>
        <CardContent sx={{ pb: 0, pt: 1.5, px: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
            <Typography
              variant="body2"
              fontWeight="bold"
              sx={{ color: "text.primary", flex: 1 }}
            >
              {template.name}
            </Typography>
            <Chip
              label={template.blockType}
              size="small"
              color="primary"
              sx={{ fontSize: "0.65rem", height: 18 }}
            />
          </Box>
          {template.description && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block" }}
            >
              {template.description}
            </Typography>
          )}
          <Typography
            variant="caption"
            sx={{ color: "text.disabled", display: "block", mt: 0.25 }}
          >
            {new Date(template.createdAt).toLocaleDateString()}
          </Typography>
        </CardContent>
        <CardActions sx={{ pt: 0.5, px: 2, pb: 1, gap: 0.5 }}>
          <Button
            size="small"
            variant="contained"
            onClick={handleInsert}
            sx={{ fontSize: "0.7rem" }}
          >
            Insert
          </Button>
          {isOwner && (
            <IconButton
              size="small"
              onClick={handleShare}
              aria-label={
                template.isShared
                  ? "Unshare template"
                  : "Share template with team"
              }
              title={template.isShared ? "Stop sharing" : "Share with team"}
            >
              <ShareIcon
                fontSize="small"
                sx={{
                  color: template.isShared ? "primary.main" : "text.secondary",
                }}
              />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={handleDelete}
            aria-label="Delete template"
          >
            <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
          </IconButton>
        </CardActions>
      </Card>
    );
  },
);

TemplateCard.displayName = "TemplateCard";

// ---------------------------------------------------------------------------
// BlockLibrary
// ---------------------------------------------------------------------------

const BlockLibrary = React.memo<BlockLibraryProps>(function BlockLibrary({
  open,
  onClose,
  pageId,
  blocks,
  onInsertBlock,
  onInsertFromTemplate,
  closeAfterInsert = false,
  currentUserRole,
  historyPush,
}) {
  const [blockTypes, setBlockTypes] = useState<BlockLibraryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [insertPosition, setInsertPosition] = useState<
    "end" | "beginning" | number
  >("end");

  // Template state
  const [templates, setTemplates] = useState<BlockTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState<string | null>(null);

  // Preview modal state (managed here, passed down via prop in 9.3.2)
  const [previewBlock, setPreviewBlock] = useState<BlockLibraryItem | null>(
    null,
  );

  // Save template modal state — Step 9.22
  const [saveTemplateBlock, setSaveTemplateBlock] = useState<{
    blockType: string;
    content: Record<string, unknown>;
  } | null>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Fetch block types on mount
  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const fetchBlocks = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_URL}/content-types/blocks`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setBlockTypes(Array.isArray(data.data) ? data.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load block library. Please try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchBlocks();
    return () => {
      cancelled = true;
    };
  }, [open]);

  // Fetch templates when My Templates tab is active
  useEffect(() => {
    if (activeCategory !== "my-templates" || !open) return;
    let cancelled = false;

    const fetchTemplates = async () => {
      setTemplatesLoading(true);
      setTemplatesError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/blocks/templates`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setTemplates(Array.isArray(data.data) ? data.data : []);
        }
      } catch {
        if (!cancelled) setTemplatesError("Failed to load templates.");
      } finally {
        if (!cancelled) setTemplatesLoading(false);
      }
    };

    fetchTemplates();
    return () => {
      cancelled = true;
    };
  }, [activeCategory, open]);

  // Filtered block types
  const filteredBlocks = useMemo(() => {
    let list = blockTypes;

    if (activeCategory !== "all" && activeCategory !== "my-templates") {
      list = list.filter((b) => b.category === activeCategory);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (b) =>
          b.label.toLowerCase().includes(q) ||
          b.description.toLowerCase().includes(q) ||
          (b.searchKeywords || []).some((kw) => kw.toLowerCase().includes(q)),
      );
    }

    return list;
  }, [blockTypes, activeCategory, searchQuery]);

  const handleCategoryChange = useCallback(
    (_: React.SyntheticEvent, value: string) => {
      setActiveCategory(value);
      setSearchQuery("");
    },
    [],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleAddToPage = useCallback(
    (blockKey: string) => {
      const blockDef = blockTypes.find((b) => b.key === blockKey);
      onInsertBlock(blockKey, insertPosition);
      const label = blockDef?.label || blockKey;
      setToastMessage(`${label} block added`);
      setTimeout(() => setToastMessage(null), 3000);
      if (historyPush) {
        historyPush({ blockType: blockKey }, `Insert ${label} block`);
      }
      if (closeAfterInsert) onClose();
    },
    [
      blockTypes,
      onInsertBlock,
      insertPosition,
      historyPush,
      closeAfterInsert,
      onClose,
    ],
  );

  const handlePreviewBlock = useCallback((block: BlockLibraryItem) => {
    setPreviewBlock(block);
  }, []);

  const handlePreviewClose = useCallback(() => {
    setPreviewBlock(null);
  }, []);

  const handleInsertFromTemplate = useCallback(
    (template: BlockTemplate) => {
      if (onInsertFromTemplate) {
        onInsertFromTemplate(template, insertPosition);
      } else {
        onInsertBlock(
          template.blockType,
          insertPosition,
          template.content as Record<string, unknown>,
        );
      }
      setToastMessage(`${template.name} inserted`);
      setTimeout(() => setToastMessage(null), 3000);
      if (closeAfterInsert) onClose();
    },
    [
      onInsertFromTemplate,
      onInsertBlock,
      insertPosition,
      closeAfterInsert,
      onClose,
    ],
  );

  const handleDeleteTemplate = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await fetch(`${API_URL}/blocks/templates/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setToastMessage("Failed to delete template.");
      setTimeout(() => setToastMessage(null), 3000);
    }
  }, []);

  const handleToggleShare = useCallback(
    async (id: number, isShared: boolean) => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/blocks/templates/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ isShared }),
        });
        if (!res.ok) throw new Error();
        setTemplates((prev) =>
          prev.map((t) => (t.id === id ? { ...t, isShared } : t)),
        );
      } catch {
        setToastMessage("Failed to update sharing.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    },
    [],
  );

  const isOwner = currentUserRole === "OWNER" || currentUserRole === "owner";

  // Position options
  const positionOptions: Array<{
    value: "end" | "beginning" | number;
    label: string;
  }> = [
    { value: "end", label: "At End" },
    { value: "beginning", label: "At Beginning" },
    ...blocks.map((b, i) => ({
      value: i as number,
      label: `After ${b.blockType} #${i + 1}`,
    })),
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: 320, display: "flex", flexDirection: "column" },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          pt: 2,
          pb: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h6"
          sx={{ color: "text.primary", fontWeight: 700 }}
        >
          Block Library
        </Typography>
        <IconButton
          onClick={onClose}
          aria-label="Close block library"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Search */}
      <Box sx={{ px: 2, pb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search blocks..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Category Tabs */}
      <Tabs
        value={activeCategory}
        onChange={handleCategoryChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: 1, borderColor: "divider", minHeight: 40 }}
      >
        {CATEGORIES.map((cat) => (
          <Tab
            key={cat.key}
            value={cat.key}
            label={cat.label}
            sx={{ minHeight: 40, fontSize: "0.75rem", textTransform: "none" }}
          />
        ))}
      </Tabs>

      {/* Position Picker */}
      <Box sx={{ px: 2, pt: 1 }}>
        <FormControl size="small" fullWidth>
          <InputLabel id="position-label" sx={{ fontSize: "0.75rem" }}>
            Insert Position
          </InputLabel>
          <Select
            labelId="position-label"
            value={insertPosition}
            label="Insert Position"
            onChange={(e) =>
              setInsertPosition(e.target.value as "end" | "beginning" | number)
            }
            sx={{ fontSize: "0.75rem" }}
          >
            {positionOptions.map((opt) => (
              <MenuItem
                key={String(opt.value)}
                value={opt.value}
                sx={{ fontSize: "0.75rem" }}
              >
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: "auto", px: 2, pt: 1, pb: 2 }}>
        {/* Toast */}
        {toastMessage && (
          <Alert severity="success" sx={{ mb: 1, fontSize: "0.75rem" }}>
            {toastMessage}
          </Alert>
        )}

        {/* My Templates Tab */}
        {activeCategory === "my-templates" ? (
          <>
            {templatesLoading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}
            {templatesError && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {templatesError}
              </Alert>
            )}
            {!templatesLoading && !templatesError && templates.length === 0 && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", textAlign: "center", mt: 4 }}
              >
                No saved templates yet. Save a block to create your first
                template.
              </Typography>
            )}
            {!templatesLoading &&
              templates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onInsert={handleInsertFromTemplate}
                  onDelete={handleDeleteTemplate}
                  onToggleShare={handleToggleShare}
                  isOwner={isOwner}
                />
              ))}
          </>
        ) : (
          <>
            {/* Loading Skeletons */}
            {loading && (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            )}

            {/* Error */}
            {!loading && error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}

            {/* Empty state */}
            {!loading && !error && filteredBlocks.length === 0 && (
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", textAlign: "center", mt: 4 }}
              >
                No blocks found matching your search.
              </Typography>
            )}

            {/* Block Cards */}
            {!loading &&
              !error &&
              filteredBlocks.map((block) => (
                <BlockLibraryCard
                  key={block.key}
                  block={block}
                  onAddToPage={handleAddToPage}
                  onPreview={handlePreviewBlock}
                />
              ))}
          </>
        )}
      </Box>

      {/* Block preview modal — Step 9.22 */}
      <BlockPreviewModal
        open={!!previewBlock}
        block={previewBlock}
        onClose={handlePreviewClose}
        onAddToPage={(blockKey, variant) => {
          handleAddToPage(blockKey);
          handlePreviewClose();
        }}
        onSaveTemplate={(blockKey, content) => {
          handlePreviewClose();
          setSaveTemplateBlock({ blockType: blockKey, content });
        }}
      />

      {/* Save template modal — Step 9.22 */}
      {saveTemplateBlock && (
        <SaveTemplateModal
          open={!!saveTemplateBlock}
          blockType={saveTemplateBlock.blockType}
          blockContent={saveTemplateBlock.content}
          onClose={() => setSaveTemplateBlock(null)}
          onSaveSuccess={() => {
            setSaveTemplateBlock(null);
            setToastMessage("Template saved");
            setTimeout(() => setToastMessage(null), 3000);
          }}
        />
      )}
    </Drawer>
  );
});

BlockLibrary.displayName = "BlockLibrary";

export default BlockLibrary;
export { BlockLibraryCard, CATEGORIES, CATEGORY_COLOR };
