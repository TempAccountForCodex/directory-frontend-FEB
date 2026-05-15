/**
 * PortfolioGridBlock — Filterable portfolio/work showcase grid
 * Step 11.2
 *
 * Features:
 *  - Category filter chips with AnimatePresence transitions
 *  - MUI Grid with configurable columns (1-4)
 *  - Image hover overlay (category chip + title)
 *  - Click-to-open MUI Dialog lightbox (fullScreen on mobile)
 *    showing: image, title, description, tags, client, year, external link
 *  - Empty state with placeholder cards
 */

import React, { useState, memo, useCallback, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Stack,
  Button,
} from "@mui/material";
import { useTheme, useMediaQuery } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { AnimatePresence, motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import AnimatedList from "../utils/AnimatedList";

// ── Types ──────────────────────────────────────────────────────────────────────

interface PortfolioItem {
  title?: string;
  description?: string;
  image?: string;
  category?: string;
  tags?: string[];
  client?: string;
  year?: string;
  url?: string;
}

interface PortfolioGridContent {
  heading?: string;
  description?: string;
  items?: PortfolioItem[];
  showFilters?: boolean;
  columns?: number;
  showLightbox?: boolean;
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
  responsiveHideOnMobile?: boolean;
  responsiveHideOnTablet?: boolean;
  responsiveHideOnDesktop?: boolean;
}

interface Block {
  id: number;
  blockType: string;
  content: PortfolioGridContent;
  sortOrder: number;
}

interface PortfolioGridBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Constants ──────────────────────────────────────────────────────────────────

// Hoisted outside components — avoids RegExp reallocation on every render (js-hoist-regexp)
const SAFE_URL_RE = /^https?:\/\//i;

// ── Spacing map ────────────────────────────────────────────────────────────────

const SPACING_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 10,
  xl: 14,
};

// ── Placeholder Card ───────────────────────────────────────────────────────────

const PlaceholderCard: React.FC<{ primaryColor: string }> = memo(
  ({ primaryColor }) => (
    <Box
      data-testid="portfolio-placeholder"
      sx={{
        width: "100%",
        aspectRatio: "4/3",
        borderRadius: 2,
        bgcolor: "grey.100",
        border: `1px dashed ${primaryColor}44`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 1,
      }}
    >
      <Typography variant="caption" color="text.disabled">
        Portfolio Item
      </Typography>
      <Typography
        variant="caption"
        color="text.disabled"
        sx={{ fontSize: "0.65rem" }}
      >
        Add your work
      </Typography>
    </Box>
  ),
);
PlaceholderCard.displayName = "PlaceholderCard";

// ── Portfolio Card ─────────────────────────────────────────────────────────────

interface PortfolioCardProps {
  item: PortfolioItem;
  primaryColor: string;
  showLightbox: boolean;
  /** Receives the item so the parent can use a stable useCallback reference (rerender-memo) */
  onSelect: (item: PortfolioItem) => void;
}

const PortfolioCard: React.FC<PortfolioCardProps> = memo(
  ({ item, primaryColor, showLightbox, onSelect }) => {
    const [hovered, setHovered] = useState(false);
    const handleClick = useCallback(() => onSelect(item), [onSelect, item]);

    return (
      <Box
        onClick={showLightbox ? handleClick : undefined}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        sx={{
          position: "relative",
          borderRadius: 2,
          overflow: "hidden",
          cursor: showLightbox ? "pointer" : "default",
          width: "100%",
          aspectRatio: "4/3",
          bgcolor: "grey.200",
        }}
        aria-label={item.title ? `View ${item.title}` : "View portfolio item"}
      >
        {/* Project image */}
        {item.image ? (
          <Box
            component="img"
            src={item.image}
            alt={item.title ?? "Portfolio item"}
            loading="lazy"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              transition: "transform 0.3s ease",
              transform: hovered ? "scale(1.04)" : "scale(1)",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              bgcolor: "grey.200",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Typography variant="caption" color="text.disabled">
              No image
            </Typography>
          </Box>
        )}

        {/* Hover overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.55)",
            opacity: 0,
            transition: "opacity 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "flex-end",
            p: 2,
            gap: 0.75,
            "&:hover": { opacity: 1 },
          }}
        >
          {item.category && (
            <Chip
              label={item.category}
              size="small"
              sx={{
                bgcolor: primaryColor,
                color: "white",
                fontWeight: 600,
                fontSize: "0.7rem",
              }}
            />
          )}
          {item.title && (
            <Typography
              variant="subtitle1"
              sx={{ color: "white", fontWeight: 600, lineHeight: 1.2 }}
            >
              {item.title}
            </Typography>
          )}
        </Box>
      </Box>
    );
  },
);
PortfolioCard.displayName = "PortfolioCard";

// ── Lightbox Dialog ────────────────────────────────────────────────────────────

interface LightboxProps {
  item: PortfolioItem | null;
  open: boolean;
  onClose: () => void;
  primaryColor: string;
}

const LightboxDialog: React.FC<LightboxProps> = ({
  item,
  open,
  onClose,
  primaryColor,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={isMobile}
      maxWidth="md"
      fullWidth
      aria-labelledby="lightbox-title"
    >
      <DialogContent sx={{ p: 0, position: "relative" }}>
        {/* Close button */}
        <IconButton
          onClick={onClose}
          aria-label="close lightbox"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
          }}
          size="small"
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {/* Image */}
        {item.image && (
          <Box
            component="img"
            src={item.image}
            alt={item.title ?? "Portfolio item"}
            sx={{
              width: "100%",
              maxHeight: 360,
              objectFit: "cover",
              display: "block",
            }}
          />
        )}

        {/* Details */}
        <Box sx={{ p: 3 }}>
          {/* Title */}
          {item.title && (
            <Typography
              id="lightbox-title"
              variant="h5"
              component="h2"
              sx={{ fontWeight: 700, color: "text.primary", mb: 1 }}
            >
              {item.title}
            </Typography>
          )}

          {/* Meta row: client and year */}
          <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
            {item.client && (
              <Typography variant="body2" color="text.secondary">
                <strong>Client:</strong> {item.client}
              </Typography>
            )}
            {item.year && (
              <Typography variant="body2" color="text.secondary">
                <strong>Year:</strong> {item.year}
              </Typography>
            )}
          </Stack>

          {/* Description */}
          {item.description && (
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {item.description}
            </Typography>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mb: 2 }}>
              {item.tags.map((tag, idx) => (
                <Chip
                  key={`${tag}-${idx}`}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: primaryColor, color: "text.primary" }}
                />
              ))}
            </Stack>
          )}

          {/* External link — only allow http/https to prevent javascript: URI XSS */}
          {item.url && SAFE_URL_RE.test(item.url) && (
            <Button
              component="a"
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              variant="contained"
              endIcon={<OpenInNewIcon />}
              sx={{
                bgcolor: primaryColor,
                "&:hover": { bgcolor: primaryColor, filter: "brightness(0.9)" },
              }}
            >
              View Project
            </Button>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────

const PortfolioGridBlock: React.FC<PortfolioGridBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor,
  bodyColor,
}) => {
  const content = block.content || {};
  const {
    heading,
    description,
    items = [],
    showFilters = true,
    columns = 3,
    showLightbox = true,
    spacingPaddingTop = "md",
    spacingPaddingBottom = "md",
    responsiveHideOnMobile = false,
    responsiveHideOnTablet = false,
    responsiveHideOnDesktop = false,
  } = content;

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [lightboxItem, setLightboxItem] = useState<PortfolioItem | null>(null);

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-60px 0px",
  });

  const pt = SPACING_MAP[spacingPaddingTop] ?? 6;
  const pb = SPACING_MAP[spacingPaddingBottom] ?? 6;

  // Extract unique non-empty categories — memoized to avoid rebuilding Set on every render
  const categories = useMemo(
    () =>
      Array.from(
        new Set(
          items
            .map((item) => item.category)
            .filter((c): c is string => Boolean(c)),
        ),
      ),
    [items],
  );

  // Filter items by active category — memoized for stable reference
  const filteredItems = useMemo(
    () =>
      activeCategory === null
        ? items
        : items.filter((item) => item.category === activeCategory),
    [items, activeCategory],
  );

  // Compute Grid xs/sm/md per column setting
  const colMd = Math.floor(12 / Math.max(1, Math.min(4, columns)));
  const colSm = colMd > 6 ? 12 : 6;

  // Stable callbacks — wrapped in useCallback so PortfolioCard memo is not broken on every render
  const handleCardClick = useCallback(
    (item: PortfolioItem) => {
      if (showLightbox) {
        setLightboxItem(item);
      }
    },
    [showLightbox],
  );

  const handleCloseLightbox = useCallback(() => {
    setLightboxItem(null);
  }, []);

  const showEmpty = items.length === 0;
  const placeholderCount = 3;

  return (
    <Box
      ref={ref}
      component={motion.div}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.5 }}
      sx={{
        py: { xs: Math.max(2, pt / 2), md: pt },
        pb: { xs: Math.max(2, pb / 2), md: pb },
        display: {
          xs: responsiveHideOnMobile ? "none" : "block",
          sm: responsiveHideOnTablet ? "none" : "block",
          lg: responsiveHideOnDesktop ? "none" : "block",
        },
      }}
    >
      <Container maxWidth="lg">
        {/* Heading */}
        {heading && (
          <Typography
            variant="h4"
            component="h2"
            align="center"
            sx={{
              fontWeight: 700,
              mb: description ? 1 : 4,
              color: headingColor ?? "text.primary",
            }}
          >
            {heading}
          </Typography>
        )}

        {/* Description */}
        {description && (
          <Typography
            variant="body1"
            align="center"
            sx={{
              color: bodyColor ?? "text.secondary",
              mb: 4,
              maxWidth: 640,
              mx: "auto",
            }}
          >
            {description}
          </Typography>
        )}

        {/* Category filter chips */}
        {showFilters && categories.length > 0 && (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={1}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Chip
              label="All"
              onClick={() => setActiveCategory(null)}
              color={activeCategory === null ? "primary" : "default"}
              variant={activeCategory === null ? "filled" : "outlined"}
              sx={{ fontWeight: 600 }}
            />
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                onClick={() => setActiveCategory(cat)}
                color={activeCategory === cat ? "primary" : "default"}
                variant={activeCategory === cat ? "filled" : "outlined"}
                sx={{ fontWeight: 500 }}
              />
            ))}
          </Stack>
        )}

        {/* Portfolio grid */}
        {showEmpty ? (
          <Grid container spacing={3}>
            {Array.from({ length: placeholderCount }).map((_, idx) => (
              <Grid
                item
                xs={12}
                sm={colSm}
                md={colMd}
                key={`placeholder-${idx}`}
              >
                <PlaceholderCard primaryColor={primaryColor} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Grid container spacing={3}>
            <AnimatePresence mode="popLayout">
              <AnimatedList
                key={activeCategory ?? "__all__"}
                staggerMs={60}
                wrapperStyle={{ display: "contents" }}
              >
                {filteredItems.map((item, idx) => (
                  <Grid
                    item
                    xs={12}
                    sm={colSm}
                    md={colMd}
                    key={item.title ? `${item.title}-${idx}` : `item-${idx}`}
                  >
                    <PortfolioCard
                      item={item}
                      primaryColor={primaryColor}
                      showLightbox={showLightbox}
                      onSelect={handleCardClick}
                    />
                    {/* Title below card */}
                    {item.title && (
                      <Typography
                        variant="subtitle2"
                        sx={{
                          mt: 1,
                          fontWeight: 600,
                          color: "text.primary",
                          cursor: showLightbox ? "pointer" : "default",
                        }}
                        onClick={
                          showLightbox ? () => handleCardClick(item) : undefined
                        }
                      >
                        {item.title}
                      </Typography>
                    )}
                    {item.category && (
                      <Typography variant="caption" color="text.secondary">
                        {item.category}
                      </Typography>
                    )}
                  </Grid>
                ))}
              </AnimatedList>
            </AnimatePresence>
          </Grid>
        )}
      </Container>

      {/* Lightbox */}
      <LightboxDialog
        item={lightboxItem}
        open={Boolean(lightboxItem)}
        onClose={handleCloseLightbox}
        primaryColor={primaryColor}
      />
    </Box>
  );
};

PortfolioGridBlock.displayName = "PortfolioGridBlock";

export default memo(PortfolioGridBlock);
