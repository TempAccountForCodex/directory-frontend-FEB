/**
 * DirectoryListingBlock — Step 2.27.3
 *
 * Main renderer for DIRECTORY_LISTING block type.
 * Registered in BlockRenderer.tsx switch statement.
 *
 * Features:
 * - Dynamic data fetching via useDynamicBlockData
 * - Search bar (debounced 300ms)
 * - Category chip filters (fetched from /api/directory/meta)
 * - Region dropdown filter
 * - Grid / List / Map layouts
 * - MUI Pagination
 *
 * Performance: React.memo, useMemo, useCallback
 * Accessibility: aria-labels, semantic HTML
 * Security: no dangerouslySetInnerHTML, URL validation
 */

import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  InputAdornment,
  MenuItem,
  Pagination,
  Select,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import useTenantUrl from "../../../hooks/useTenantUrl";
import useDynamicBlockData from "../../../hooks/useDynamicBlockData";
import ListingCard, {
  type Listing,
  type ListingCardConfig,
  type ListingCardColors,
} from "./ListingCard";

/* ===================== Types ===================== */

interface Block {
  id: number;
  blockType: string;
  content: DirectoryListingContent;
  sortOrder: number;
}

interface DirectoryListingContent {
  heading?: string;
  layout?: "grid" | "list" | "map";
  columns?: number;
  listingsPerPage?: number;
  showSearch?: boolean;
  showCategoryFilter?: boolean;
  showRegionFilter?: boolean;
  showMap?: boolean;
  showRating?: boolean;
  showPhone?: boolean;
  showAddress?: boolean;
  showPagination?: boolean;
  categoryFilter?: string;
  regionFilter?: string;
  sortBy?: string;
  emptyMessage?: string;
  // Dynamic data fields (injected by DynamicBlockInner)
  listings?: Listing[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
    hasPrevious: boolean;
  };
  meta?: {
    categories?: string[];
    regions?: string[];
  };
}

interface DirectoryListingBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
}

/* ===================== Constants ===================== */

const DEBOUNCE_MS = 300;

const SORT_OPTIONS = [
  { value: "name", label: "Name A-Z" },
  { value: "rating", label: "Top Rated" },
  { value: "newest", label: "Newest First" },
  { value: "distance", label: "Nearest" },
];

/* ===================== Skeleton ===================== */

const DirectoryListingSkeleton: React.FC<{ columns: number }> = React.memo(
  ({ columns }) => {
    const colWidth = `repeat(${Math.min(columns, 4)}, 1fr)`;
    return (
      <Container sx={{ py: 6 }}>
        <Skeleton
          variant="text"
          sx={{ fontSize: "2rem", mb: 4, width: "40%", mx: "auto" }}
        />
        {/* Search skeleton */}
        <Skeleton
          variant="rectangular"
          height={56}
          sx={{ borderRadius: 1, mb: 3, maxWidth: 480, mx: "auto" }}
        />
        {/* Category chips skeleton */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              variant="rectangular"
              width={90}
              height={32}
              sx={{ borderRadius: 4 }}
            />
          ))}
        </Box>
        {/* Cards skeleton */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: colWidth,
            },
            gap: 3,
          }}
        >
          {Array.from({ length: Math.min(columns * 2, 6) }).map((_, i) => (
            <Box key={i}>
              <Skeleton
                variant="rectangular"
                height={180}
                sx={{ borderRadius: 1, mb: 1 }}
              />
              <Skeleton variant="text" sx={{ fontSize: "1rem", mb: 0.5 }} />
              <Skeleton
                variant="text"
                sx={{ fontSize: "0.875rem", width: "70%" }}
              />
              <Skeleton
                variant="text"
                sx={{ fontSize: "0.875rem", width: "50%" }}
              />
            </Box>
          ))}
        </Box>
      </Container>
    );
  },
);

DirectoryListingSkeleton.displayName = "DirectoryListingSkeleton";

/* ===================== Map Placeholder ===================== */

const MapPlaceholder: React.FC<{
  listings: Listing[];
  primaryColor: string;
  bodyColor: string;
}> = React.memo(({ listings, primaryColor, bodyColor }) => {
  const listingsWithCoords = listings.filter(
    (l) => typeof l.latitude === "number" && typeof l.longitude === "number",
  );

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: { xs: 300, md: 400 },
        bgcolor: "grey.100",
        borderRadius: 2,
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mb: 3,
      }}
      role="img"
      aria-label={`Map showing ${listingsWithCoords.length} business locations`}
    >
      <Box sx={{ textAlign: "center" }}>
        <LocationOnIcon sx={{ fontSize: 48, color: primaryColor, mb: 1 }} />
        <Typography variant="body2" sx={{ color: bodyColor }}>
          {listingsWithCoords.length} location
          {listingsWithCoords.length !== 1 ? "s" : ""} found
        </Typography>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          Interactive map coming soon
        </Typography>
      </Box>
    </Box>
  );
});

MapPlaceholder.displayName = "MapPlaceholder";

/* ===================== Main Component ===================== */

const DirectoryListingBlock: React.FC<DirectoryListingBlockProps> = ({
  block,
  primaryColor = "#2563eb",
  secondaryColor = "#64748b",
  headingColor = "#1e293b",
  bodyColor = "#475569",
}) => {
  const { content } = block;

  // Merge defaults
  const heading = content.heading ?? "Business Directory";
  const rawLayout = content.layout ?? "grid";
  const layout = rawLayout === "map" ? "grid" : rawLayout;
  const columns = Math.min(Math.max(content.columns ?? 3, 1), 4);
  const listingsPerPage = Math.min(
    Math.max(content.listingsPerPage ?? 12, 1),
    24,
  );
  const showSearch = content.showSearch ?? true;
  const showCategoryFilter = content.showCategoryFilter ?? true;
  const showRegionFilter = content.showRegionFilter ?? true;
  const showMap = content.showMap ?? false;
  const showRating = content.showRating ?? true;
  const showPhone = content.showPhone ?? true;
  const showAddress = content.showAddress ?? true;
  const showPagination = content.showPagination ?? true;
  const emptyMessage =
    content.emptyMessage ??
    "No listings found. Try adjusting your search criteria.";

  // Tenant-aware URL builder
  const { buildUrl } = useTenantUrl();

  // Local state for search, filters, pagination
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    content.categoryFilter ?? "",
  );
  const [selectedRegion, setSelectedRegion] = useState(
    content.regionFilter ?? "",
  );
  const VALID_SORT_VALUES = ["name", "rating", "newest", "distance"];
  const [sortBy, setSortBy] = useState(
    VALID_SORT_VALUES.includes(content.sortBy ?? "") ? content.sortBy! : "name",
  );
  const [currentPage, setCurrentPage] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce search input
  useEffect(() => {
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  // Build data source query string
  const dataSource = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(currentPage));
    params.set("pageSize", String(listingsPerPage));
    params.set("sort", sortBy);
    if (debouncedSearch) params.set("q", debouncedSearch);
    if (selectedCategory) params.set("category", selectedCategory);
    if (selectedRegion) params.set("region", selectedRegion);
    return `listing?${params.toString()}`;
  }, [
    currentPage,
    listingsPerPage,
    sortBy,
    debouncedSearch,
    selectedCategory,
    selectedRegion,
  ]);

  // Fetch data via hook
  const { data, loading, error } = useDynamicBlockData(
    block.id,
    block.blockType,
    dataSource,
  );

  // Merge SSR content with fetched data
  const mergedData = useMemo(() => {
    const source = data || content;
    return {
      listings: (source as DirectoryListingContent).listings ?? [],
      pagination: (source as DirectoryListingContent).pagination ?? {
        total: 0,
        page: 1,
        limit: listingsPerPage,
        totalPages: 0,
        hasMore: false,
        hasPrevious: false,
      },
      meta: (source as DirectoryListingContent).meta ?? {
        categories: [],
        regions: [],
      },
    };
  }, [data, content, listingsPerPage]);

  const { listings, pagination, meta } = mergedData;

  // Card config (memoised)
  const cardConfig: ListingCardConfig = useMemo(
    () => ({ showRating, showPhone, showAddress }),
    [showRating, showPhone, showAddress],
  );

  const cardColors: ListingCardColors = useMemo(
    () => ({ primaryColor, headingColor, bodyColor }),
    [primaryColor, headingColor, bodyColor],
  );

  // Handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    [],
  );

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
    setCurrentPage(1);
  }, []);

  const handleRegionChange = useCallback((e: { target: { value: string } }) => {
    setSelectedRegion(e.target.value as string);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((e: { target: { value: string } }) => {
    setSortBy(e.target.value as string);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setCurrentPage(page);
    },
    [],
  );

  const handleListingClick = useCallback(
    (listing: Listing) => {
      if (listing.slug) {
        window.open(
          buildUrl(`/directory/${encodeURIComponent(listing.slug)}`),
          "_blank",
          "noopener,noreferrer",
        );
      }
    },
    [buildUrl],
  );

  // Loading state
  if (loading && listings.length === 0) {
    return <DirectoryListingSkeleton columns={columns} />;
  }

  // Error state
  if (error && listings.length === 0) {
    return (
      <Container sx={{ py: 6 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setCurrentPage(1)}
              aria-label="Retry loading listings"
            >
              Retry
            </Button>
          }
        >
          Failed to load directory listings. Please try again.
        </Alert>
      </Container>
    );
  }

  // Grid columns responsive mapping
  const gridColumnMap: Record<number, { xs: number; sm: number; md: number }> =
    {
      1: { xs: 12, sm: 12, md: 12 },
      2: { xs: 12, sm: 6, md: 6 },
      3: { xs: 12, sm: 6, md: 4 },
      4: { xs: 12, sm: 6, md: 3 },
    };
  const gridCols = gridColumnMap[columns] ?? gridColumnMap[3];

  return (
    <Box sx={{ py: { xs: 4, md: 8 } }}>
      <Container maxWidth="lg">
        {/* Heading */}
        {heading && (
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 4, fontWeight: 600, color: headingColor }}
          >
            {heading}
          </Typography>
        )}

        {/* Search bar */}
        {showSearch && (
          <Box sx={{ maxWidth: 560, mx: "auto", mb: 3 }}>
            <TextField
              fullWidth
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search businesses..."
              variant="outlined"
              size="small"
              aria-label="Search directory listings"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        )}

        {/* Filters row: category chips + region dropdown + sort */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 3,
          }}
        >
          {/* Category chips */}
          {showCategoryFilter &&
            meta.categories &&
            meta.categories.length > 0 && (
              <Box
                sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}
                role="group"
                aria-label="Category filters"
              >
                {meta.categories.map((cat: string) => (
                  <Chip
                    key={cat}
                    label={cat}
                    clickable
                    onClick={() => handleCategoryClick(cat)}
                    variant={selectedCategory === cat ? "filled" : "outlined"}
                    sx={{
                      borderColor: primaryColor,
                      bgcolor:
                        selectedCategory === cat ? primaryColor : "transparent",
                      color: selectedCategory === cat ? "white" : primaryColor,
                      "&:hover": {
                        bgcolor:
                          selectedCategory === cat
                            ? primaryColor
                            : `${primaryColor}1A`,
                      },
                    }}
                    aria-pressed={selectedCategory === cat}
                  />
                ))}
              </Box>
            )}

          {/* Region dropdown + Sort */}
          <Box sx={{ display: "flex", gap: 2, flexShrink: 0 }}>
            {showRegionFilter && meta.regions && meta.regions.length > 0 && (
              <Select
                value={selectedRegion}
                onChange={handleRegionChange}
                displayEmpty
                size="small"
                sx={{ minWidth: 160 }}
                aria-label="Filter by region"
              >
                <MenuItem value="">All Regions</MenuItem>
                {meta.regions.map((region: string) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            )}

            <Select
              value={sortBy}
              onChange={handleSortChange}
              size="small"
              sx={{ minWidth: 140 }}
              aria-label="Sort listings"
            >
              {SORT_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
        </Box>

        {/* Map view renders as grid until interactive map is available */}

        {/* Listing count */}
        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          {pagination.total} listing{pagination.total !== 1 ? "s" : ""} found
        </Typography>

        {/* Empty state */}
        {listings.length === 0 && !loading && (
          <Box sx={{ textAlign: "center", py: 8 }}>
            <LocationOnIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
            <Typography variant="h6" sx={{ color: "text.secondary", mb: 1 }}>
              {emptyMessage}
            </Typography>
          </Box>
        )}

        {/* Grid layout */}
        {layout !== "list" && listings.length > 0 && (
          <Grid container spacing={3}>
            {listings.map((listing: Listing) => (
              <Grid
                item
                key={listing.id}
                xs={gridCols.xs}
                sm={gridCols.sm}
                md={gridCols.md}
              >
                <ListingCard
                  listing={listing}
                  config={cardConfig}
                  colors={cardColors}
                  onListingClick={handleListingClick}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* List layout */}
        {layout === "list" && listings.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {listings.map((listing: Listing) => (
              <Box key={listing.id} sx={{ maxWidth: "100%" }}>
                <ListingCard
                  listing={listing}
                  config={cardConfig}
                  colors={cardColors}
                  onListingClick={handleListingClick}
                />
              </Box>
            ))}
          </Box>
        )}

        {/* Pagination */}
        {showPagination && pagination.totalPages > 1 && (
          <Box
            sx={{ display: "flex", justifyContent: "center", mt: 4 }}
            role="navigation"
            aria-label="Directory listing pagination"
          >
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
              sx={{
                "& .MuiPaginationItem-root": {
                  "&.Mui-selected": {
                    bgcolor: primaryColor,
                    color: "white",
                    "&:hover": {
                      bgcolor: primaryColor,
                      opacity: 0.9,
                    },
                  },
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

DirectoryListingBlock.displayName = "DirectoryListingBlock";

export default React.memo(DirectoryListingBlock);
