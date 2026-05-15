/**
 * BlockPreviewModal — Step 9.3.2
 *
 * Shows full block details, capabilities badges, variant selector,
 * and a live preview using BlockRenderer.
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo on BlockPreviewModal
 * - useCallback on variant change handler and close/add handlers
 */

import React, { useState, useCallback, useEffect } from "react";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

import BlockRenderer from "../BlockRenderer/index";
import type { BlockLibraryItem } from "./BlockLibrary";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface BlockPreviewModalProps {
  open: boolean;
  onClose: () => void;
  block: BlockLibraryItem | null;
  onAddToPage: (blockKey: string, variant?: string) => void;
  onSaveTemplate?: (blockKey: string, content: Record<string, unknown>) => void;
}

// ---------------------------------------------------------------------------
// Capability label map
// ---------------------------------------------------------------------------

const CAPABILITY_LABELS: Record<string, string> = {
  supportsBackground: "Supports Background",
  supportsVariants: "Supports Variants",
  supportsCustomCss: "Custom CSS",
  supportsVisibility: "Toggle Visibility",
  isDynamic: "Dynamic Data",
};

// ---------------------------------------------------------------------------
// Default content per block type (mirrors BlockEditor.tsx BLOCK_TYPE_DEFAULTS)
// ---------------------------------------------------------------------------

const BLOCK_TYPE_DEFAULTS: Record<string, Record<string, unknown>> = {
  HERO: {
    heading: "Your Headline",
    subheading: "A short supporting sentence.",
    ctaText: "Get Started",
    ctaLink: "/contact",
    alignment: "center",
  },
  FEATURES: {
    heading: "Our Services",
    features: [
      {
        icon: "star",
        title: "Feature 1",
        description: "Describe your first feature.",
      },
      {
        icon: "star",
        title: "Feature 2",
        description: "Describe your second feature.",
      },
    ],
  },
  TESTIMONIALS: {
    heading: "What Clients Say",
    testimonials: [
      {
        quote: "A great experience.",
        author: "Alex Johnson",
        position: "Founder",
      },
    ],
  },
  CTA: {
    heading: "Ready to get started?",
    subheading: "Let us help you launch faster.",
    ctaText: "Contact Us",
    ctaLink: "/contact",
  },
  TEXT: { content: "<p>Your text content here.</p>" },
  IMAGE: { src: "", alt: "Image", caption: "" },
  GALLERY: { images: [] },
  FORM: { heading: "Contact Us", fields: [] },
  CONTACT: {
    heading: "Get in Touch",
    email: "contact@example.com",
    showForm: true,
  },
};

// ---------------------------------------------------------------------------
// BlockPreviewModal
// ---------------------------------------------------------------------------

const BlockPreviewModal = React.memo<BlockPreviewModalProps>(
  function BlockPreviewModal({
    open,
    onClose,
    block,
    onAddToPage,
    onSaveTemplate,
  }) {
    const [selectedVariant, setSelectedVariant] = useState<string>("");

    // Reset variant when block changes
    useEffect(() => {
      if (block && block.variants.length > 0) {
        setSelectedVariant(block.variants[0]);
      } else {
        setSelectedVariant("");
      }
    }, [block]);

    // Escape key to close
    useEffect(() => {
      if (!open) return;
      const handleKey = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }, [open, onClose]);

    const handleVariantChange = useCallback(
      (e: { target: { value: string } }) => {
        setSelectedVariant(e.target.value);
      },
      [],
    );

    const handleAddToPage = useCallback(() => {
      if (block) {
        onAddToPage(block.key, selectedVariant || undefined);
      }
    }, [block, onAddToPage, selectedVariant]);

    const handleSaveTemplate = useCallback(() => {
      if (block && onSaveTemplate) {
        const defaultContent = BLOCK_TYPE_DEFAULTS[block.key] || {};
        onSaveTemplate(block.key, defaultContent);
      }
    }, [block, onSaveTemplate]);

    if (!block) return null;

    // Build the preview block object for BlockRenderer
    const defaultContent = BLOCK_TYPE_DEFAULTS[block.key] || {};
    const previewBlock = {
      id: 0,
      blockType: block.key,
      content: selectedVariant
        ? { ...defaultContent, variant: selectedVariant }
        : defaultContent,
      sortOrder: 0,
    };

    // True capabilities to show as badges
    const trueCapabilities = Object.entries(block.capabilities).filter(
      ([key, value]) => value === true && CAPABILITY_LABELS[key],
    );

    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="block-preview-title"
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95vw", sm: 560 },
            maxHeight: "90vh",
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 24,
            p: 3,
            outline: "none",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography
                id="block-preview-title"
                variant="h6"
                sx={{ color: "text.primary", fontWeight: 700 }}
              >
                {block.label}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mt: 0.5,
                  flexWrap: "wrap",
                }}
              >
                <Chip
                  label={block.category}
                  size="small"
                  color="primary"
                  sx={{ fontSize: "0.7rem" }}
                />
              </Box>
            </Box>
            <IconButton
              onClick={onClose}
              aria-label="Close preview"
              size="small"
              sx={{ mt: -0.5 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mb: 2, lineHeight: 1.5 }}
          >
            {block.description}
          </Typography>

          {/* Capabilities */}
          {trueCapabilities.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  mb: 0.5,
                  display: "block",
                }}
              >
                Capabilities
              </Typography>
              <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                {trueCapabilities.map(([key]) => (
                  <Chip
                    key={key}
                    label={CAPABILITY_LABELS[key]}
                    size="small"
                    variant="outlined"
                    color="success"
                    sx={{ fontSize: "0.65rem", height: 22 }}
                  />
                ))}
              </Stack>
            </Box>
          )}

          {/* Variant Selector */}
          {block.variants.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: "0.8rem" }}>Variant</InputLabel>
                <Select
                  value={selectedVariant}
                  label="Variant"
                  onChange={handleVariantChange}
                  sx={{ fontSize: "0.8rem" }}
                >
                  {block.variants.map((v) => (
                    <MenuItem key={v} value={v} sx={{ fontSize: "0.8rem" }}>
                      {v}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Live Preview */}
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              fontWeight: 600,
              mb: 1,
              display: "block",
            }}
          >
            Preview
          </Typography>
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              overflow: "hidden",
              mb: 2,
              transformOrigin: "top left",
            }}
          >
            <Box
              sx={{
                transform: "scale(0.5)",
                transformOrigin: "top left",
                width: "200%",
                minHeight: 120,
                bgcolor: "background.default",
              }}
            >
              <React.Suspense
                fallback={
                  <Box
                    sx={{ p: 2, color: "text.secondary", fontSize: "0.8rem" }}
                  >
                    Loading preview...
                  </Box>
                }
              >
                <BlockRenderer
                  block={previewBlock}
                  viewport="desktop"
                  isPreview
                />
              </React.Suspense>
            </Box>
          </Box>

          {/* Examples Carousel (2+ variants) */}
          {block.variants.length >= 2 && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  mb: 1,
                  display: "block",
                }}
              >
                Variants
              </Typography>
              <Stack
                direction="row"
                spacing={1}
                sx={{ overflowX: "auto", pb: 1 }}
              >
                {block.variants.map((v) => (
                  <Box
                    key={v}
                    onClick={() => setSelectedVariant(v)}
                    sx={{
                      minWidth: 120,
                      border: "1px solid",
                      borderColor:
                        selectedVariant === v ? "primary.main" : "divider",
                      borderRadius: 1,
                      overflow: "hidden",
                      cursor: "pointer",
                      bgcolor:
                        selectedVariant === v
                          ? "primary.50"
                          : "background.default",
                      p: 1,
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        textAlign: "center",
                        color: "text.secondary",
                      }}
                    >
                      {v}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {/* Actions */}
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {onSaveTemplate && (
              <Button
                variant="outlined"
                size="small"
                onClick={handleSaveTemplate}
                aria-label="Save as template"
              >
                Save as Template
              </Button>
            )}
            <Button
              variant="contained"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddToPage}
              aria-label="Add to page"
            >
              Add to Page
            </Button>
          </Stack>
        </Box>
      </Modal>
    );
  },
);

BlockPreviewModal.displayName = "BlockPreviewModal";

export default BlockPreviewModal;
