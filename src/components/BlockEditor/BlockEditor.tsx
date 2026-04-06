/**
 * Step 2.6.3 + 2.6.4 — BlockEditor Component
 *
 * Orchestrator component that composes:
 * - BlockList (left panel ~30%): drag-reorder list of blocks
 * - FormGenerator (right panel ~70%): dynamic form for selected block
 * - BlockSelector: dialog to add new block types
 *
 * Operations (2.6.4):
 * - addBlock: Opens BlockSelector, creates block with crypto.randomUUID()
 * - removeBlock: Removes by id, clears selection if removed was selected
 * - duplicateBlock: Deep-clones with new UUID, inserts after original
 * - reorderBlocks: Updates array order after drag-end via BlockList
 * - toggleVisibility: Toggles isVisible on block by id
 * - updateBlockContent: Merges FormGenerator onChange into selected block
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders when props are unchanged
 * - useCallback on every handler to maintain stable references
 * - Keyboard shortcuts: Alt+Up/Down move, Ctrl+D duplicate
 * - Responsive: two-panel on desktop, stacked on mobile
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { BlockList } from "./BlockList";
import type { Block } from "./BlockList";
import { BlockSelector } from "./BlockSelector";
import FormGenerator from "../FormGenerator";
import SaveStatus from "../Editor/SaveStatus";
import type { SaveStatusType } from "../Editor/SaveStatus";
import { useShortcutManager } from "../../hooks/useShortcutManager";

// ---------------------------------------------------------------------------
// Block type defaults — fetched from registry via API on mount.
// Removed local BLOCK_TYPE_DEFAULTS constant (was only 6 of 34 types).
// Now dynamically loads defaults for all 34 block types from the registry.
// ---------------------------------------------------------------------------

const API_URL =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:5001/api";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BlockEditorProps {
  /** Array of blocks to manage */
  blocks: Block[];
  /** Called whenever blocks array changes (add, remove, reorder, update, etc.) */
  onChange: (blocks: Block[]) => void;
  /** Disables all interactive controls */
  disabled?: boolean;
  /** Save status from useAutosave hook — displays SaveStatus indicator */
  saveStatus?: SaveStatusType;
  /** Called when user clicks Retry in SaveStatus error state */
  onSaveRetry?: () => void;
}

// ---------------------------------------------------------------------------
// BlockEditor
// ---------------------------------------------------------------------------

const BlockEditor: React.FC<BlockEditorProps> = React.memo(
  ({ blocks, onChange, disabled = false, saveStatus, onSaveRetry }) => {
    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [selectorOpen, setSelectorOpen] = useState(false);
    const [blockDefaults, setBlockDefaults] = useState<
      Record<string, Record<string, unknown>>
    >({});

    // Fetch block defaults from registry API on mount
    useEffect(() => {
      const fetchDefaults = async () => {
        try {
          const res = await fetch(`${API_URL}/content-types/blocks`);
          const data = await res.json();
          if (data?.data) {
            const map: Record<string, Record<string, unknown>> = {};
            for (const block of data.data) {
              if (block.key && block.defaults) {
                map[block.key] = block.defaults;
              }
            }
            setBlockDefaults(map);
          }
        } catch {
          // Graceful fallback — blocks will start with empty content
        }
      };
      fetchDefaults();
    }, []);

    // -------------------------------------------------------------------------
    // Derived: selected block
    // -------------------------------------------------------------------------

    const selectedBlock = useMemo(
      () => blocks.find((b) => b.id === selectedBlockId) ?? null,
      [blocks, selectedBlockId],
    );

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    /** Select a block by id */
    const handleSelect = useCallback((blockId: string) => {
      setSelectedBlockId(blockId);
    }, []);

    /** Open the BlockSelector dialog */
    const handleOpenSelector = useCallback(() => {
      setSelectorOpen(true);
    }, []);

    /** Close the BlockSelector dialog */
    const handleCloseSelector = useCallback(() => {
      setSelectorOpen(false);
    }, []);

    /** Add a new block of the selected type */
    const handleAddBlock = useCallback(
      (blockType: string, defaults?: Record<string, unknown>) => {
        const newBlock: Block = {
          id: crypto.randomUUID(),
          blockType,
          content: { ...(defaults ?? blockDefaults[blockType] ?? {}) },
          isVisible: true,
          sortOrder: blocks.length,
        };
        const updatedBlocks = [...blocks, newBlock];
        onChange(updatedBlocks);
        setSelectedBlockId(newBlock.id);
        setSelectorOpen(false);
      },
      [blocks, onChange, blockDefaults],
    );

    /** Remove a block by id */
    const handleRemove = useCallback(
      (blockId: string) => {
        const filtered = blocks.filter((b) => b.id !== blockId);
        onChange(filtered);
        if (selectedBlockId === blockId) {
          setSelectedBlockId(null);
        }
      },
      [blocks, onChange, selectedBlockId],
    );

    /** Duplicate the selected block */
    const handleDuplicate = useCallback(() => {
      if (!selectedBlock) return;

      const originalIndex = blocks.findIndex((b) => b.id === selectedBlock.id);
      if (originalIndex === -1) return;

      const duplicated: Block = {
        ...selectedBlock,
        id: crypto.randomUUID(),
        content: JSON.parse(JSON.stringify(selectedBlock.content)),
        sortOrder: selectedBlock.sortOrder + 1,
      };

      const updatedBlocks = [...blocks];
      updatedBlocks.splice(originalIndex + 1, 0, duplicated);
      onChange(updatedBlocks);
      setSelectedBlockId(duplicated.id);
    }, [blocks, onChange, selectedBlock]);

    /** Toggle visibility of a block by id */
    const handleToggleVisibility = useCallback(
      (blockId: string) => {
        const updatedBlocks = blocks.map((b) =>
          b.id === blockId ? { ...b, isVisible: !b.isVisible } : b,
        );
        onChange(updatedBlocks);
      },
      [blocks, onChange],
    );

    /** Handle reorder from BlockList drag-end */
    const handleReorder = useCallback(
      (reorderedBlocks: Block[]) => {
        onChange(reorderedBlocks);
      },
      [onChange],
    );

    /** Update selected block's content from FormGenerator onChange */
    const handleUpdateContent = useCallback(
      (values: Record<string, unknown>) => {
        if (!selectedBlockId) return;
        const updatedBlocks = blocks.map((b) =>
          b.id === selectedBlockId ? { ...b, content: values } : b,
        );
        onChange(updatedBlocks);
      },
      [blocks, onChange, selectedBlockId],
    );

    /** Move block up or down by index delta */
    const moveBlock = useCallback(
      (delta: number) => {
        if (!selectedBlockId) return;
        const currentIndex = blocks.findIndex((b) => b.id === selectedBlockId);
        if (currentIndex === -1) return;

        const newIndex = currentIndex + delta;
        if (newIndex < 0 || newIndex >= blocks.length) return;

        const updatedBlocks = [...blocks];
        const [moved] = updatedBlocks.splice(currentIndex, 1);
        updatedBlocks.splice(newIndex, 0, moved);
        onChange(updatedBlocks);
      },
      [blocks, onChange, selectedBlockId],
    );

    // -------------------------------------------------------------------------
    // Keyboard shortcuts (migrated to useShortcutManager — Step 9.6.2)
    // -------------------------------------------------------------------------

    const { registerShortcut, unregisterShortcut } = useShortcutManager();

    // Keep stable refs for callbacks to avoid re-registering shortcuts on each render
    const handleDuplicateRef = useRef(handleDuplicate);
    handleDuplicateRef.current = handleDuplicate;
    const moveBlockRef = useRef(moveBlock);
    moveBlockRef.current = moveBlock;
    const handleRemoveRef = useRef(handleRemove);
    handleRemoveRef.current = handleRemove;
    const selectedBlockIdRef = useRef(selectedBlockId);
    selectedBlockIdRef.current = selectedBlockId;

    useEffect(() => {
      if (disabled) return;

      // Ctrl+D: Duplicate selected block
      registerShortcut({
        key: "ctrl+d",
        action: () => handleDuplicateRef.current(),
        description: "Duplicate selected block",
        category: "Blocks",
        scope: "editor",
      });

      // Alt+ArrowUp: Move block up
      registerShortcut({
        key: "alt+arrowup",
        action: () => moveBlockRef.current(-1),
        description: "Move block up",
        category: "Blocks",
        scope: "editor",
      });

      // Alt+ArrowDown: Move block down
      registerShortcut({
        key: "alt+arrowdown",
        action: () => moveBlockRef.current(1),
        description: "Move block down",
        category: "Blocks",
        scope: "editor",
      });

      // Delete: Remove selected block
      registerShortcut({
        key: "delete",
        action: () => {
          const id = selectedBlockIdRef.current;
          if (id) handleRemoveRef.current(id);
        },
        description: "Delete selected block",
        category: "Blocks",
        scope: "editor",
      });

      // Escape: Deselect block
      registerShortcut({
        key: "escape",
        action: () => setSelectedBlockId(null),
        description: "Deselect block / close panel",
        category: "Editing",
        scope: "editor",
      });

      return () => {
        unregisterShortcut("ctrl+d");
        unregisterShortcut("alt+arrowup");
        unregisterShortcut("alt+arrowdown");
        unregisterShortcut("delete");
        unregisterShortcut("escape");
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [disabled, registerShortcut, unregisterShortcut]);

    // -------------------------------------------------------------------------
    // Existing block types (for BlockSelector "Already added" indicator)
    // -------------------------------------------------------------------------

    const existingBlockTypes = useMemo(
      () => blocks.map((b) => b.blockType),
      [blocks],
    );

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    return (
      <Box
        data-testid="block-editor"
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          minHeight: 400,
        }}
      >
        {/* Left panel — Block List + Add button */}
        <Box
          sx={{
            width: { xs: "100%", md: "30%" },
            minWidth: { md: 260 },
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: "text.primary", fontWeight: 600 }}
              >
                Blocks
              </Typography>
              {saveStatus && saveStatus !== "idle" && (
                <SaveStatus status={saveStatus} onRetry={onSaveRetry} />
              )}
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={handleOpenSelector}
              disabled={disabled}
              aria-label="Add block"
            >
              Add Block
            </Button>
          </Box>

          <BlockList
            blocks={blocks}
            onSelect={handleSelect}
            onReorder={handleReorder}
            onRemove={handleRemove}
            onToggleVisibility={handleToggleVisibility}
            selectedBlockId={selectedBlockId}
            disabled={disabled}
          />
        </Box>

        {/* Right panel — FormGenerator or empty state */}
        <Box
          sx={{
            width: { xs: "100%", md: "70%" },
            flexGrow: 1,
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              minHeight: 300,
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedBlock ? (
              <>
                {/* Header with block type and duplicate button */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{ color: "text.primary", fontWeight: 600 }}
                  >
                    Edit Block
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={handleDuplicate}
                    disabled={disabled}
                    aria-label="Duplicate block"
                    sx={{ color: "text.secondary" }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* FormGenerator for selected block */}
                <FormGenerator
                  blockType={selectedBlock.blockType}
                  initialValues={selectedBlock.content}
                  onChange={handleUpdateContent}
                  disabled={disabled}
                />
              </>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexGrow: 1,
                  color: "text.secondary",
                }}
              >
                <Typography variant="body2">
                  Select a block to edit its content, or add a new block to get
                  started.
                </Typography>
              </Box>
            )}
          </Paper>
        </Box>

        {/* BlockSelector dialog */}
        <BlockSelector
          open={selectorOpen}
          onClose={handleCloseSelector}
          onSelect={handleAddBlock}
          existingBlockTypes={existingBlockTypes}
        />
      </Box>
    );
  },
);

BlockEditor.displayName = "BlockEditor";

export { BlockEditor };
export default BlockEditor;
