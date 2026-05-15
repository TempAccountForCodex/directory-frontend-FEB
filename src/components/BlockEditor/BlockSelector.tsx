/**
 * Step 2.6.2 — BlockSelector Component
 *
 * MUI Dialog listing available block types from BLOCK_TYPES registry.
 * Shows label, description, category per block type.
 * Supports search/filter by name or category.
 * Grouped by REGISTRY_META.categories (core, content, conversion, social-proof).
 *
 * PERFORMANCE (vercel-react-best-practices):
 * - React.memo prevents parent-triggered re-renders when props are unchanged
 * - useCallback for all event handlers to maintain stable references
 * - useMemo for filtered/grouped block types
 */

import React, { useState, useCallback, useMemo } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";

// ---------------------------------------------------------------------------
// Block type registry data (mirrors backend BLOCK_TYPES + REGISTRY_META)
// ---------------------------------------------------------------------------

interface BlockTypeEntry {
  key: string;
  label: string;
  description: string;
  category: string;
  icon: string;
  sortOrder: number;
  searchKeywords?: string[];
}

const BLOCK_TYPES_LIST: BlockTypeEntry[] = [
  // ── Core ──
  {
    key: "HERO",
    label: "Hero",
    description: "Large headline section with CTA",
    category: "core",
    icon: "hero",
    sortOrder: 10,
    searchKeywords: ["hero", "headline", "intro", "cta"],
  },
  {
    key: "FEATURES",
    label: "Features",
    description: "Grid of features with icon, title, and description",
    category: "core",
    icon: "features",
    sortOrder: 20,
    searchKeywords: ["features", "services", "grid"],
  },
  {
    key: "NAVBAR",
    label: "Navigation Bar",
    description: "Site navigation with logo, links, and optional CTA button",
    category: "core",
    icon: "navbar",
    sortOrder: 80,
    searchKeywords: ["navbar", "navigation", "menu", "header"],
  },
  {
    key: "FOOTER",
    label: "Footer",
    description: "Site footer with copyright, links, and social media",
    category: "core",
    icon: "footer",
    sortOrder: 90,
    searchKeywords: ["footer", "bottom", "copyright", "social"],
  },
  // ── Content ──
  {
    key: "TEXT",
    label: "Text",
    description: "Rich text content section",
    category: "content",
    icon: "text",
    sortOrder: 60,
    searchKeywords: ["text", "content", "copy"],
  },
  {
    key: "IMAGE",
    label: "Image",
    description: "Standalone image with optional caption and link",
    category: "content",
    icon: "image",
    sortOrder: 70,
    searchKeywords: ["image", "photo", "picture", "caption"],
  },
  {
    key: "GALLERY",
    label: "Gallery",
    description: "Image gallery with lightbox support",
    category: "content",
    icon: "gallery",
    sortOrder: 100,
    searchKeywords: ["gallery", "images", "photos", "lightbox"],
  },
  {
    key: "FAQ",
    label: "FAQ",
    description: "Frequently asked questions with expandable answers",
    category: "content",
    icon: "faq",
    sortOrder: 120,
    searchKeywords: ["faq", "questions", "answers", "accordion"],
  },
  {
    key: "TEAM",
    label: "Team",
    description: "Team member profiles with photos and social links",
    category: "content",
    icon: "team",
    sortOrder: 140,
    searchKeywords: ["team", "members", "people", "staff"],
  },
  {
    key: "VIDEO",
    label: "Video",
    description: "Embedded or inline video with playback controls",
    category: "content",
    icon: "video",
    sortOrder: 150,
    searchKeywords: ["video", "embed", "youtube", "vimeo"],
  },
  {
    key: "TABS",
    label: "Tabbed Content",
    description:
      "Organize related content into switchable tabs with animated panel transitions",
    category: "content",
    icon: "tabs",
    sortOrder: 160,
    searchKeywords: ["tabs", "tabbed", "panels", "sections"],
  },
  {
    key: "STEPS_PROCESS",
    label: "Steps / Process",
    description:
      "Visual step-by-step process block with numbered circles and connector lines",
    category: "content",
    icon: "steps",
    sortOrder: 170,
    searchKeywords: ["steps", "process", "timeline", "workflow"],
  },
  {
    key: "BEFORE_AFTER",
    label: "Before / After",
    description:
      "Interactive before/after image comparison slider with draggable handle",
    category: "content",
    icon: "compare",
    sortOrder: 200,
    searchKeywords: ["before", "after", "compare", "slider"],
  },
  {
    key: "TABLE",
    label: "Data Table",
    description:
      "Display structured tabular data with sortable columns and striped rows",
    category: "content",
    icon: "table",
    sortOrder: 220,
    searchKeywords: ["table", "data", "grid", "rows", "columns"],
  },
  {
    key: "SOCIAL_EMBED",
    label: "Social Media Embed",
    description:
      "Embed content from YouTube, Instagram, Twitter, Facebook, and TikTok",
    category: "content",
    icon: "social",
    sortOrder: 230,
    searchKeywords: [
      "social",
      "embed",
      "youtube",
      "instagram",
      "twitter",
      "tiktok",
    ],
  },
  {
    key: "EMBED",
    label: "Embed",
    description:
      "Embed content from trusted platforms like Calendly, Google Docs, Figma, and Airtable",
    category: "content",
    icon: "web",
    sortOrder: 240,
    searchKeywords: [
      "embed",
      "iframe",
      "calendly",
      "google",
      "figma",
      "airtable",
    ],
  },
  {
    key: "MENU_DISPLAY",
    label: "Menu / Service List",
    description:
      "Display a menu or service list with categories, items, prices, and dietary info",
    category: "content",
    icon: "cert",
    sortOrder: 250,
    searchKeywords: ["menu", "service", "price", "food", "restaurant"],
  },
  {
    key: "MAP_LOCATION",
    label: "Map Location",
    description: "Interactive world map with configurable location markers",
    category: "content",
    icon: "map",
    sortOrder: 260,
    searchKeywords: ["map", "location", "marker", "geography"],
  },
  // ── Conversion ──
  {
    key: "CTA",
    label: "Call To Action",
    description: "Centered CTA with button",
    category: "conversion",
    icon: "cta",
    sortOrder: 30,
    searchKeywords: ["cta", "call to action", "conversion"],
  },
  {
    key: "CONTACT",
    label: "Contact",
    description: "Contact details and optional form",
    category: "conversion",
    icon: "contact",
    sortOrder: 50,
    searchKeywords: ["contact", "email", "phone", "address"],
  },
  {
    key: "PRICING",
    label: "Pricing",
    description: "Pricing plans with feature lists and CTAs",
    category: "conversion",
    icon: "pricing",
    sortOrder: 110,
    searchKeywords: ["pricing", "plans", "cost", "subscription"],
  },
  {
    key: "FORM_BUILDER",
    label: "Form Builder",
    description: "Configurable contact/lead-capture form with layout options",
    category: "conversion",
    icon: "form",
    sortOrder: 157,
    searchKeywords: ["form", "builder", "lead", "capture", "input"],
  },
  {
    key: "COUNTDOWN",
    label: "Countdown Timer",
    description:
      "Real-time countdown timer to create urgency for events, launches, or promotions",
    category: "conversion",
    icon: "timer",
    sortOrder: 190,
    searchKeywords: ["countdown", "timer", "launch", "urgency"],
  },
  {
    key: "ANNOUNCEMENT_BAR",
    label: "Announcement Bar",
    description:
      "Dismissible announcement banner with optional icon and CTA link",
    category: "conversion",
    icon: "campaign",
    sortOrder: 210,
    searchKeywords: ["announcement", "banner", "notice", "alert"],
  },
  {
    key: "NEWSLETTER",
    label: "Newsletter",
    description: "Email subscription form for visitor sign-ups",
    category: "conversion",
    icon: "email",
    sortOrder: 270,
    searchKeywords: ["newsletter", "subscribe", "email", "signup"],
  },
  // ── Social Proof ──
  {
    key: "TESTIMONIALS",
    label: "Testimonials",
    description: "Customer quotes with author details",
    category: "social-proof",
    icon: "testimonials",
    sortOrder: 40,
    searchKeywords: ["testimonials", "reviews", "quotes"],
  },
  {
    key: "STATS",
    label: "Stats",
    description: "Key metrics and statistics displayed prominently",
    category: "social-proof",
    icon: "stats",
    sortOrder: 130,
    searchKeywords: ["stats", "metrics", "numbers", "counter"],
  },
  {
    key: "LOGO_CAROUSEL",
    label: "Logo Carousel",
    description:
      "Infinitely scrolling logo banner showcasing partner or client logos",
    category: "social-proof",
    icon: "image",
    sortOrder: 180,
    searchKeywords: ["logo", "carousel", "partners", "clients", "sponsors"],
  },
  {
    key: "REVIEWS",
    label: "Reviews",
    description:
      "Display customer reviews with ratings, breakdown, and submission form",
    category: "social-proof",
    icon: "star",
    sortOrder: 280,
    searchKeywords: ["reviews", "ratings", "stars", "feedback"],
  },
  // ── Dynamic ──
  {
    key: "BLOG_FEED",
    label: "Blog Feed",
    description:
      "Dynamic blog post feed with search, category filter, and pagination",
    category: "dynamic",
    icon: "blog",
    sortOrder: 155,
    searchKeywords: ["blog", "feed", "articles", "posts", "news"],
  },
  {
    key: "BLOG_ARTICLE",
    label: "Blog Article",
    description:
      "Renders a single full blog post with hero image, table of contents, and related posts",
    category: "dynamic",
    icon: "blog",
    sortOrder: 160,
    searchKeywords: ["blog", "article", "post", "single", "detail"],
  },
  {
    key: "PRODUCT_SHOWCASE",
    label: "Product Showcase",
    description:
      "Dynamic product catalog with search, sort, filters, and quick view",
    category: "dynamic",
    icon: "product",
    sortOrder: 160,
    searchKeywords: ["product", "showcase", "shop", "catalog", "ecommerce"],
  },
  {
    key: "DIRECTORY_LISTING",
    label: "Directory Listing",
    description:
      "Dynamic business directory with search, category chips, and region filter",
    category: "dynamic",
    icon: "directory",
    sortOrder: 165,
    searchKeywords: ["directory", "listing", "business", "search", "local"],
  },
  {
    key: "EVENTS_LIST",
    label: "Events List",
    description:
      "Dynamic events display with search, category filter, RSVP, and calendar layout",
    category: "dynamic",
    icon: "event",
    sortOrder: 170,
    searchKeywords: ["events", "calendar", "rsvp", "schedule", "meetup"],
  },
];

interface CategoryDef {
  key: string;
  label: string;
  description: string;
}

const CATEGORIES: CategoryDef[] = [
  {
    key: "core",
    label: "Core",
    description: "Primary layout and structure blocks",
  },
  {
    key: "content",
    label: "Content",
    description: "Text and information blocks",
  },
  {
    key: "conversion",
    label: "Conversion",
    description: "Lead capture and call-to-action blocks",
  },
  {
    key: "social-proof",
    label: "Social Proof",
    description: "Testimonials and credibility blocks",
  },
  {
    key: "dynamic",
    label: "Dynamic",
    description: "Data-driven blocks with live content fetching",
  },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BlockSelectorProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when the dialog should close */
  onClose: () => void;
  /** Called with the blockType key when a block type is selected */
  onSelect: (blockType: string) => void;
  /** Block type keys already added (shows "Already added" indicator) */
  existingBlockTypes?: string[];
}

// ---------------------------------------------------------------------------
// BlockSelector
// ---------------------------------------------------------------------------

const BlockSelector: React.FC<BlockSelectorProps> = React.memo(
  ({ open, onClose, onSelect, existingBlockTypes = [] }) => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
      },
      [],
    );

    const handleSelect = useCallback(
      (blockType: string) => {
        onSelect(blockType);
      },
      [onSelect],
    );

    const handleClose = useCallback(() => {
      setSearchQuery("");
      onClose();
    }, [onClose]);

    // --- Filter block types by search query ---
    const filteredBlocks = useMemo(() => {
      if (!searchQuery.trim()) return BLOCK_TYPES_LIST;

      const query = searchQuery.toLowerCase().trim();
      return BLOCK_TYPES_LIST.filter((bt) => {
        const labelMatch = bt.label.toLowerCase().includes(query);
        const descMatch = bt.description.toLowerCase().includes(query);
        const keyMatch = bt.key.toLowerCase().includes(query);
        const keywordMatch = bt.searchKeywords?.some((kw) =>
          kw.toLowerCase().includes(query),
        );
        return labelMatch || descMatch || keyMatch || keywordMatch;
      });
    }, [searchQuery]);

    // --- Group filtered blocks by category ---
    const groupedBlocks = useMemo(() => {
      const groups: { category: CategoryDef; blocks: BlockTypeEntry[] }[] = [];

      for (const cat of CATEGORIES) {
        const categoryBlocks = filteredBlocks
          .filter((bt) => bt.category === cat.key)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        if (categoryBlocks.length > 0) {
          groups.push({ category: cat, blocks: categoryBlocks });
        }
      }

      return groups;
    }, [filteredBlocks]);

    const existingSet = useMemo(
      () => new Set(existingBlockTypes),
      [existingBlockTypes],
    );

    return (
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="block-selector-title"
      >
        <DialogTitle
          id="block-selector-title"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography
            variant="h6"
            component="span"
            sx={{ color: "text.primary" }}
          >
            Add Block
          </Typography>
          <IconButton
            aria-label="Close dialog"
            onClick={handleClose}
            size="small"
            sx={{ color: "text.secondary" }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 0 }}>
          {/* Search input */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search blocks..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    fontSize="small"
                    sx={{ color: "text.secondary" }}
                  />
                </InputAdornment>
              ),
            }}
          />

          {/* Empty search results */}
          {filteredBlocks.length === 0 && (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "text.secondary",
              }}
            >
              <Typography variant="body2">
                No blocks found matching your search.
              </Typography>
            </Box>
          )}

          {/* Block types grouped by category */}
          {groupedBlocks.map(({ category, blocks }) => (
            <Box key={category.key} sx={{ mb: 2 }}>
              {/* Category header */}
              <Typography
                variant="subtitle2"
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  mb: 1,
                  textTransform: "uppercase",
                  fontSize: "0.75rem",
                  letterSpacing: "0.05em",
                }}
              >
                {category.label}
              </Typography>

              {blocks.map((bt) => {
                const isExisting = existingSet.has(bt.key);

                return (
                  <Paper
                    key={bt.key}
                    variant="outlined"
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      p: 1.5,
                      mb: 1,
                      cursor: "pointer",
                      "&:hover": {
                        borderColor: "primary.light",
                        bgcolor: "action.hover",
                      },
                      transition: "all 0.15s ease",
                    }}
                    onClick={() => handleSelect(bt.key)}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 500, color: "text.primary" }}
                        >
                          {bt.label}
                        </Typography>
                        {isExisting && (
                          <Chip
                            label="Already added"
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              color: "text.secondary",
                              borderColor: "divider",
                            }}
                          />
                        )}
                      </Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: "text.secondary",
                          display: "block",
                          mt: 0.25,
                        }}
                      >
                        {bt.description}
                      </Typography>
                    </Box>
                  </Paper>
                );
              })}

              <Divider sx={{ mt: 1 }} />
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    );
  },
);

BlockSelector.displayName = "BlockSelector";

export { BlockSelector };
export default BlockSelector;
