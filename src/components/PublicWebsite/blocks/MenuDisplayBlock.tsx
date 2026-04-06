/**
 * MenuDisplayBlock — Step 2.29B.3
 *
 * Renders a menu/service list with categories and items.
 * - Three layouts: classic (dotted leader lines), cards (MUI Cards), compact (dense list)
 * - Dietary icons rendered as MUI Chips when showDietaryIcons is true
 * - Badge rendered as MUI Chip (e.g. 'New', 'Popular', 'Chef Special')
 * - Images lazy loaded via loading='lazy' attribute
 * - SSR: full semantic HTML — usable without JS
 * - Prices stored as strings, renderer prepends currency symbol
 * - Framer Motion entrance animation with whileInView
 */

import React, { memo, useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";

// ── Types ──────────────────────────────────────────────────────────────────────

type DietaryTag =
  | "vegetarian"
  | "vegan"
  | "gluten-free"
  | "dairy-free"
  | "nut-free"
  | "spicy"
  | "halal"
  | "kosher";

type Layout = "classic" | "cards" | "compact";

interface MenuItem {
  name?: string;
  description?: string;
  price?: string;
  image?: string;
  badge?: string;
  dietary?: DietaryTag[];
}

interface MenuCategory {
  name?: string;
  description?: string;
  items?: MenuItem[];
}

interface MenuDisplayContent {
  heading?: string;
  description?: string;
  categories?: MenuCategory[];
  currency?: string;
  showImages?: boolean;
  layout?: Layout;
  showDietaryIcons?: boolean;
  // Standard styling fields
  spacingPaddingTop?: string;
  spacingPaddingBottom?: string;
  spacingMarginTop?: string;
  spacingMarginBottom?: string;
  backgroundType?: string;
  backgroundColor?: string;
  effectsShadow?: string;
  effectsBorderWidth?: string;
  effectsBorderColor?: string;
  effectsBorderRadius?: string;
  animationEntranceType?: string;
  animationDuration?: number;
  animationDelay?: number;
  animationScrollTriggered?: boolean;
  responsiveHideOnMobile?: boolean;
  responsiveHideOnTablet?: boolean;
  responsiveHideOnDesktop?: boolean;
}

interface Block {
  id: number;
  blockType: string;
  content: MenuDisplayContent;
  sortOrder: number;
}

interface MenuDisplayBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

// ── Dietary icon labels ────────────────────────────────────────────────────────

const DIETARY_LABELS: Record<DietaryTag, string> = {
  vegetarian: "V",
  vegan: "VG",
  "gluten-free": "GF",
  "dairy-free": "DF",
  "nut-free": "NF",
  spicy: "🌶",
  halal: "H",
  kosher: "K",
};

const DIETARY_COLORS: Record<DietaryTag, string> = {
  vegetarian: "#4caf50",
  vegan: "#2e7d32",
  "gluten-free": "#ff9800",
  "dairy-free": "#2196f3",
  "nut-free": "#9c27b0",
  spicy: "#f44336",
  halal: "#00897b",
  kosher: "#5c6bc0",
};

// ── Currency symbol helper ─────────────────────────────────────────────────────

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "CA$",
  AUD: "A$",
  CHF: "CHF",
  CNY: "¥",
  INR: "₹",
  MXN: "MX$",
};

function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency?.toUpperCase()] || currency || "$";
}

// ── Spacing map ────────────────────────────────────────────────────────────────

const SPACING_MAP: Record<string, number> = {
  none: 0,
  sm: 2,
  md: 6,
  lg: 10,
  xl: 14,
};

// ── Dietary badges component ───────────────────────────────────────────────────

interface DietaryBadgesProps {
  dietary?: DietaryTag[];
}

const DietaryBadges: React.FC<DietaryBadgesProps> = memo(({ dietary }) => {
  if (!dietary || dietary.length === 0) return null;

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
      {dietary.map((tag) => (
        <Chip
          key={tag}
          label={DIETARY_LABELS[tag] || tag}
          size="small"
          title={tag}
          sx={{
            height: 18,
            fontSize: "0.65rem",
            fontWeight: 700,
            bgcolor: DIETARY_COLORS[tag] || "grey.400",
            color: "white",
            "& .MuiChip-label": { px: 0.75, lineHeight: "18px" },
          }}
        />
      ))}
    </Box>
  );
});

DietaryBadges.displayName = "DietaryBadges";

// ── Classic layout item ────────────────────────────────────────────────────────

interface ClassicItemProps {
  item: MenuItem;
  currencySymbol: string;
  showDietaryIcons: boolean;
  bodyColor: string;
  primaryColor: string;
}

const ClassicItem: React.FC<ClassicItemProps> = memo(
  ({ item, currencySymbol, showDietaryIcons, bodyColor, primaryColor }) => {
    const { name, description, price, badge, dietary } = item;

    return (
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: 1,
          }}
        >
          {/* Name */}
          <Typography
            variant="body1"
            sx={{
              fontWeight: 600,
              color: bodyColor,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {name || "Item"}
          </Typography>

          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: primaryColor,
                color: "white",
                ml: 0.5,
                flexShrink: 0,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}

          {/* Dotted leader line */}
          <Box
            sx={{
              flex: 1,
              borderBottom: "2px dotted",
              borderColor: "grey.300",
              mb: 0.6,
              minWidth: 16,
            }}
          />

          {/* Price */}
          {price && (
            <Typography
              variant="body1"
              sx={{
                fontWeight: 700,
                color: primaryColor,
                flexShrink: 0,
                whiteSpace: "nowrap",
              }}
            >
              {currencySymbol}
              {price}
            </Typography>
          )}
        </Box>

        {/* Description */}
        {description && (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", mt: 0.25, ml: 0 }}
          >
            {description}
          </Typography>
        )}

        {/* Dietary icons */}
        {showDietaryIcons && dietary && dietary.length > 0 && (
          <Box sx={{ mt: 0.5 }}>
            <DietaryBadges dietary={dietary} />
          </Box>
        )}
      </Box>
    );
  },
);

ClassicItem.displayName = "ClassicItem";

// ── Cards layout item ──────────────────────────────────────────────────────────

interface CardItemProps {
  item: MenuItem;
  currencySymbol: string;
  showImages: boolean;
  showDietaryIcons: boolean;
  bodyColor: string;
  primaryColor: string;
}

const CardItem: React.FC<CardItemProps> = memo(
  ({
    item,
    currencySymbol,
    showImages,
    showDietaryIcons,
    bodyColor,
    primaryColor,
  }) => {
    const { name, description, price, image, badge, dietary } = item;

    return (
      <Card
        elevation={2}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.2s ease, box-shadow 0.2s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 4,
          },
        }}
      >
        {showImages && image && (
          <CardMedia
            component="img"
            height="160"
            image={image}
            alt={name || "Menu item"}
            loading="lazy"
            sx={{ objectFit: "cover" }}
          />
        )}
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 0.5,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: bodyColor, flex: 1, mr: 1 }}
            >
              {name || "Item"}
            </Typography>
            {price && (
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 700,
                  color: primaryColor,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {currencySymbol}
                {price}
              </Typography>
            )}
          </Box>

          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                bgcolor: primaryColor,
                color: "white",
                mb: 0.75,
                "& .MuiChip-label": { px: 0.75 },
              }}
            />
          )}

          {description && (
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mb: 0.75 }}
            >
              {description}
            </Typography>
          )}

          {showDietaryIcons && dietary && dietary.length > 0 && (
            <DietaryBadges dietary={dietary} />
          )}
        </CardContent>
      </Card>
    );
  },
);

CardItem.displayName = "CardItem";

// ── Compact layout item ────────────────────────────────────────────────────────

interface CompactItemProps {
  item: MenuItem;
  currencySymbol: string;
  showDietaryIcons: boolean;
  bodyColor: string;
  primaryColor: string;
}

const CompactItem: React.FC<CompactItemProps> = memo(
  ({ item, currencySymbol, showDietaryIcons, bodyColor, primaryColor }) => {
    const { name, description, price, badge, dietary } = item;

    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          py: 0.75,
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.75,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: bodyColor }}
            >
              {name || "Item"}
            </Typography>
            {badge && (
              <Chip
                label={badge}
                size="small"
                sx={{
                  height: 16,
                  fontSize: "0.6rem",
                  bgcolor: primaryColor,
                  color: "white",
                  "& .MuiChip-label": { px: 0.5 },
                }}
              />
            )}
            {showDietaryIcons && dietary && dietary.length > 0 && (
              <DietaryBadges dietary={dietary} />
            )}
          </Box>
          {description && (
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", display: "block", mt: 0.25 }}
              noWrap
            >
              {description}
            </Typography>
          )}
        </Box>

        {price && (
          <Typography
            variant="body2"
            sx={{
              fontWeight: 700,
              color: primaryColor,
              flexShrink: 0,
              whiteSpace: "nowrap",
            }}
          >
            {currencySymbol}
            {price}
          </Typography>
        )}
      </Box>
    );
  },
);

CompactItem.displayName = "CompactItem";

// ── Category section ───────────────────────────────────────────────────────────

interface CategorySectionProps {
  category: MenuCategory;
  layout: Layout;
  currencySymbol: string;
  showImages: boolean;
  showDietaryIcons: boolean;
  bodyColor: string;
  primaryColor: string;
  headingColor: string;
}

const CategorySection: React.FC<CategorySectionProps> = memo(
  ({
    category,
    layout,
    currencySymbol,
    showImages,
    showDietaryIcons,
    bodyColor,
    primaryColor,
    headingColor,
  }) => {
    const { name, description, items = [] } = category;

    return (
      <Box component="section" sx={{ mb: 5 }}>
        {name && (
          <Typography
            variant="h5"
            component="h3"
            sx={{
              fontWeight: 700,
              color: headingColor,
              mb: description ? 0.5 : 2,
            }}
          >
            {name}
          </Typography>
        )}
        {description && (
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
            {description}
          </Typography>
        )}

        <Divider sx={{ mb: 2 }} />

        {/* Classic layout */}
        {layout === "classic" && (
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {items.map((item, idx) => (
              <Box component="li" key={idx}>
                <ClassicItem
                  item={item}
                  currencySymbol={currencySymbol}
                  showDietaryIcons={showDietaryIcons}
                  bodyColor={bodyColor}
                  primaryColor={primaryColor}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Cards layout */}
        {layout === "cards" && (
          <Grid container spacing={2}>
            {items.map((item, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
                <CardItem
                  item={item}
                  currencySymbol={currencySymbol}
                  showImages={showImages}
                  showDietaryIcons={showDietaryIcons}
                  bodyColor={bodyColor}
                  primaryColor={primaryColor}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Compact layout */}
        {layout === "compact" && (
          <Box component="ul" sx={{ listStyle: "none", p: 0, m: 0 }}>
            {items.map((item, idx) => (
              <Box component="li" key={idx}>
                <CompactItem
                  item={item}
                  currencySymbol={currencySymbol}
                  showDietaryIcons={showDietaryIcons}
                  bodyColor={bodyColor}
                  primaryColor={primaryColor}
                />
                {idx < items.length - 1 && <Divider />}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    );
  },
);

CategorySection.displayName = "CategorySection";

// ── Main component ─────────────────────────────────────────────────────────────

const MenuDisplayBlock: React.FC<MenuDisplayBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const content = block.content || {};
  const {
    heading,
    description,
    categories = [],
    currency = "USD",
    showImages = false,
    layout = "classic",
    showDietaryIcons = true,
    spacingPaddingTop = "md",
    spacingPaddingBottom = "md",
    responsiveHideOnMobile = false,
    responsiveHideOnTablet = false,
    responsiveHideOnDesktop = false,
    animationDuration = 500,
    animationDelay = 0,
  } = content;

  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  const pt = SPACING_MAP[spacingPaddingTop] ?? 6;
  const pb = SPACING_MAP[spacingPaddingBottom] ?? 6;

  const currencySymbol = useMemo(() => getCurrencySymbol(currency), [currency]);

  return (
    <Box
      ref={ref}
      component={motion.div as any}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{
        duration: animationDuration / 1000,
        delay: animationDelay / 1000,
      }}
      sx={{
        py: { xs: pt / 2 + 2, md: pt },
        pb: { xs: pb / 2 + 2, md: pb },
        display: {
          xs: responsiveHideOnMobile ? "none" : "block",
          sm: responsiveHideOnTablet ? "none" : "block",
          lg: responsiveHideOnDesktop ? "none" : "block",
        },
      }}
    >
      <Container maxWidth="lg">
        {heading && (
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            sx={{
              fontWeight: 700,
              color: headingColor,
              mb: description ? 1 : 4,
              textAlign: "center",
            }}
          >
            {heading}
          </Typography>
        )}

        {description && (
          <Typography
            variant="body1"
            sx={{
              color: bodyColor,
              mb: 4,
              textAlign: "center",
              maxWidth: "600px",
              mx: "auto",
            }}
          >
            {description}
          </Typography>
        )}

        {categories.length === 0 ? (
          <Typography
            variant="body2"
            sx={{ color: "text.secondary", textAlign: "center" }}
          >
            No menu categories configured.
          </Typography>
        ) : (
          categories.map((category, idx) => (
            <CategorySection
              key={idx}
              category={category}
              layout={layout}
              currencySymbol={currencySymbol}
              showImages={showImages}
              showDietaryIcons={showDietaryIcons}
              bodyColor={bodyColor}
              primaryColor={primaryColor}
              headingColor={headingColor}
            />
          ))
        )}
      </Container>
    </Box>
  );
};

MenuDisplayBlock.displayName = "MenuDisplayBlock";

export default memo(MenuDisplayBlock);
