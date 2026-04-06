/**
 * DynamicBlockRenderer — Step 2.22
 *
 * Wraps BlockRenderer with dynamic data awareness:
 * - Static blocks: rendered directly via BlockRenderer (passthrough)
 * - Dynamic blocks: fetches data, shows skeleton while loading,
 *   shows error alert on failure, merges data into block.content on success
 *
 * Gracefully falls back to static rendering when DynamicBlockContext
 * is not available (e.g., rendered outside DynamicBlockProvider).
 */

import React, { useCallback, useContext } from "react";
import { Box, Alert, Button, Container } from "@mui/material";
import BlockRenderer from "./BlockRenderer";
import BlockSkeleton from "./BlockSkeleton";
import { DynamicBlockContext } from "../../context/DynamicBlockContext";
import useDynamicBlockData from "../../hooks/useDynamicBlockData";

/* ---------------- Registry-driven dataSource mapping (reference) ----------- */
// Maps block types to their valid endpoint prefixes as understood by
// resolveDataSourceUrl() in useDynamicBlockData. Mirrors backend
// contentTypes/registry.js capabilities.dataSource.
//
// Currently all dynamic blocks self-fetch (they construct their own dataSource
// with query params), so this map is only used if block.content.dataSource is
// explicitly set. Future blocks that depend on DynamicBlockInner to fetch on
// their behalf should use these prefixes in block.content.dataSource.
export const BLOCK_DATA_SOURCE: Readonly<Record<string, string>> = {
  BLOG_FEED: "blog",
  BLOG_ARTICLE: "blog-article",
  PRODUCT_SHOWCASE: "products",
  DIRECTORY_LISTING: "listing",
  REVIEWS: "review",
  EVENTS_LIST: "event",
};

/* ---------------- Types ---------------- */
interface Block {
  id: number;
  blockType: string;
  content: any;
  sortOrder: number;
}

interface DynamicBlockRendererProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

/* ---------------- Inner component that uses the hook for dynamic blocks ---------------- */
const DynamicBlockInner: React.FC<DynamicBlockRendererProps> = ({
  block,
  primaryColor,
  secondaryColor,
  headingColor,
  bodyColor,
  onCtaClick,
  onFormSubmit,
}) => {
  // Resolve dataSource from block.content if explicitly set.
  // NOTE: Most dynamic blocks (BlogFeedBlock, ReviewsBlock, etc.) self-fetch by
  // constructing their own dataSource internally and calling useDynamicBlockData
  // directly. For those blocks, block.content.dataSource is typically absent/null,
  // so this wrapper short-circuits (no fetch) and passes through to BlockRenderer.
  // The BLOCK_DATA_SOURCE map above documents the registry-driven fallback prefixes
  // for any future blocks that rely on this wrapper to fetch on their behalf.
  const dataSource: string | null = block.content?.dataSource ?? null;

  const { data, loading, error, refresh } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
  );

  const handleRetry = useCallback(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return <BlockSkeleton blockType={block.blockType} />;
  }

  if (error) {
    return (
      <Box sx={{ py: 4 }}>
        <Container maxWidth="md">
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            }
          >
            Failed to load dynamic block content: {error}
          </Alert>
        </Container>
      </Box>
    );
  }

  // Merge dynamic data into block.content
  const mergedBlock: Block = data
    ? { ...block, content: { ...block.content, ...data } }
    : block;

  return (
    <BlockRenderer
      block={mergedBlock}
      primaryColor={primaryColor}
      secondaryColor={secondaryColor}
      headingColor={headingColor}
      bodyColor={bodyColor}
      onCtaClick={onCtaClick}
      onFormSubmit={onFormSubmit}
    />
  );
};

/* ---------------- Main component ---------------- */
const DynamicBlockRendererBase: React.FC<DynamicBlockRendererProps> = (
  props,
) => {
  const { block } = props;

  // Safely access context — context may be undefined if provider is absent
  const context = useContext(DynamicBlockContext);

  // Check if this block type requires dynamic data
  const isDynamic = context ? context.isBlockDynamic(block.blockType) : false;

  // Static block — passthrough to BlockRenderer directly
  if (!isDynamic) {
    return (
      <BlockRenderer
        block={block}
        primaryColor={props.primaryColor}
        secondaryColor={props.secondaryColor}
        headingColor={props.headingColor}
        bodyColor={props.bodyColor}
        onCtaClick={props.onCtaClick}
        onFormSubmit={props.onFormSubmit}
      />
    );
  }

  // Dynamic block — use the inner component with the data hook
  return <DynamicBlockInner {...props} />;
};

/* ---------------- Custom memo comparator ---------------- */
const arePropsEqual = (
  prev: DynamicBlockRendererProps,
  next: DynamicBlockRendererProps,
): boolean => {
  if (
    prev.block.id !== next.block.id ||
    prev.block.blockType !== next.block.blockType ||
    prev.block.sortOrder !== next.block.sortOrder ||
    prev.primaryColor !== next.primaryColor ||
    prev.secondaryColor !== next.secondaryColor ||
    prev.headingColor !== next.headingColor ||
    prev.bodyColor !== next.bodyColor
  ) {
    return false;
  }

  // Content comparison: use JSON.stringify for reliable deep equality.
  // Content objects are bounded by maxCharsPerBlock (8000) so stringify cost is acceptable.
  const prevContent = prev.block.content;
  const nextContent = next.block.content;
  if (prevContent === nextContent) return true;
  if (prevContent == null || nextContent == null)
    return prevContent == nextContent;
  return JSON.stringify(prevContent) === JSON.stringify(nextContent);
};

const DynamicBlockRenderer = React.memo(
  DynamicBlockRendererBase,
  arePropsEqual,
);
DynamicBlockRenderer.displayName = "DynamicBlockRenderer";

export default DynamicBlockRenderer;
