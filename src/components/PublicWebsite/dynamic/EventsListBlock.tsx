/**
 * EventsListBlock — Step 2.29C.3 + 2.29C.6
 *
 * Main renderer component for EVENTS_LIST block type.
 * Registered in BlockRenderer.tsx switch statement.
 *
 * Features:
 * - Own data fetching via fetch() to /api/events/public (AbortController)
 * - Search bar (debounced 300ms)
 * - Category filter chips
 * - List / Cards / Calendar layouts
 * - RSVP button (POST /api/events/:id/rsvp, sessionStorage double-click prevention)
 * - Past event 'Past' Chip badge
 * - MUI Pagination
 *
 * Performance: React.memo
 * Accessibility: aria-labels, semantic HTML
 * Security: no dangerouslySetInnerHTML, no new dependencies
 */

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Grid,
  InputAdornment,
  Pagination,
  Skeleton,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import useTenantUrl from "../../../hooks/useTenantUrl";

/* ===================== Constants ===================== */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
const DEBOUNCE_MS = 300;
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ===================== Types ===================== */

export interface Event {
  id: number;
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  category?: string;
  image?: string | null;
  price?: number;
  currency?: string;
  rsvpCount?: number;
  slug?: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  hasPrevious: boolean;
}

interface EventsApiResponse {
  success: boolean;
  events: Event[];
  pagination: PaginationMeta;
  categories?: string[];
}

interface EventsListContent {
  heading?: string;
  subheading?: string;
  layout?: "list" | "cards" | "calendar";
  eventsPerPage?: number;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showLocation?: boolean;
  showDate?: boolean;
  showImage?: boolean;
  showRsvp?: boolean;
  showPrice?: boolean;
  showPastEvents?: boolean;
  categoryFilter?: string;
  sortBy?: "startDate" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
  emptyMessage?: string;
  detailLink?: string;
  websiteId?: string;
}

interface Block {
  id: number;
  blockType: string;
  content: EventsListContent;
  sortOrder: number;
}

interface EventsListBlockProps {
  block: Block;
  primaryColor?: string;
  secondaryColor?: string;
  headingColor?: string;
  bodyColor?: string;
  onCtaClick?: (blockType: string, ctaText: string) => void;
  onFormSubmit?: (formName: string, success: boolean) => void;
}

/* ===================== Helpers ===================== */

function isPastEvent(startDate: string): boolean {
  return new Date(startDate) < new Date();
}

function formatEventDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatPrice(price: number | undefined, currency = "USD"): string {
  if (price === undefined || price === null) return "";
  if (price === 0) return "Free";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(price);
  } catch {
    return `${currency} ${price}`;
  }
}

/* ===================== Skeleton ===================== */

const EventsListSkeleton: React.FC<{ count?: number }> = React.memo(
  ({ count = 6 }) => (
    <Container sx={{ py: 6 }}>
      <Skeleton
        variant="text"
        sx={{ fontSize: "2rem", mb: 1, width: "40%", mx: "auto" }}
      />
      <Skeleton
        variant="text"
        sx={{ fontSize: "1rem", mb: 4, width: "60%", mx: "auto" }}
      />
      <Grid container spacing={3}>
        {Array.from({ length: count }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Skeleton
              variant="rectangular"
              height={200}
              sx={{ borderRadius: 2 }}
            />
            <Skeleton variant="text" sx={{ mt: 1 }} />
            <Skeleton variant="text" width="60%" />
          </Grid>
        ))}
      </Grid>
    </Container>
  ),
);
EventsListSkeleton.displayName = "EventsListSkeleton";

/* ===================== EventCard (inline sub-component) ===================== */

interface EventCardProps {
  event: Event;
  layout: "list" | "cards" | "calendar";
  showLocation: boolean;
  showDate: boolean;
  showImage: boolean;
  showRsvp: boolean;
  showPrice: boolean;
  primaryColor: string;
  bodyColor: string;
  headingColor: string;
  onRsvp: (eventId: number) => Promise<void>;
  isRsvped: boolean;
  rsvpLoading: boolean;
}

const EventCard: React.FC<EventCardProps> = React.memo(
  ({
    event,
    layout,
    showLocation,
    showDate,
    showImage,
    showRsvp,
    showPrice,
    primaryColor,
    bodyColor,
    headingColor,
    onRsvp,
    isRsvped,
    rsvpLoading,
  }) => {
    const past = isPastEvent(event.startDate);

    const rsvpButton = showRsvp ? (
      <Button
        variant="contained"
        size="small"
        disabled={isRsvped || rsvpLoading}
        onClick={() => onRsvp(event.id)}
        aria-label={`RSVP for ${event.title}`}
        sx={{
          bgcolor: isRsvped ? "grey.400" : primaryColor,
          color: "white",
          "&:hover": {
            bgcolor: isRsvped ? "grey.400" : primaryColor,
            opacity: 0.9,
          },
          "&.Mui-disabled": { bgcolor: "grey.300", color: "grey.500" },
          minWidth: 80,
        }}
      >
        {isRsvped ? "RSVP'd" : "RSVP"}
      </Button>
    ) : null;

    if (layout === "list") {
      return (
        <Box
          component="article"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: "background.paper",
          }}
        >
          {/* Date column */}
          {showDate && (
            <Box
              sx={{
                minWidth: 60,
                textAlign: "center",
                bgcolor: primaryColor,
                color: "white",
                borderRadius: 1,
                p: 1,
                flexShrink: 0,
              }}
            >
              <Typography
                variant="caption"
                display="block"
                sx={{ fontWeight: 700 }}
              >
                {new Date(event.startDate)
                  .toLocaleDateString("en-US", { month: "short" })
                  .toUpperCase()}
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {new Date(event.startDate).getDate()}
              </Typography>
            </Box>
          )}

          {/* Details column */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 0.5,
                flexWrap: "wrap",
              }}
            >
              <Typography
                variant="subtitle1"
                component="h3"
                sx={{ fontWeight: 600, color: headingColor }}
              >
                {event.title}
              </Typography>
              {past && (
                <Chip
                  label="Past"
                  size="small"
                  sx={{
                    bgcolor: "grey.300",
                    color: "grey.700",
                    height: 20,
                    fontSize: "0.7rem",
                  }}
                />
              )}
              {event.category && (
                <Chip
                  label={event.category}
                  size="small"
                  sx={{
                    bgcolor: `${primaryColor}22`,
                    color: primaryColor,
                    height: 20,
                    fontSize: "0.7rem",
                  }}
                />
              )}
            </Box>
            {showLocation && event.location && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <LocationOnIcon sx={{ fontSize: 14, color: bodyColor }} />
                <Typography variant="caption" sx={{ color: bodyColor }}>
                  {event.location}
                </Typography>
              </Box>
            )}
            {showPrice && event.price !== undefined && (
              <Typography
                variant="caption"
                sx={{ color: primaryColor, fontWeight: 600 }}
              >
                {formatPrice(event.price, event.currency)}
              </Typography>
            )}
          </Box>

          {/* RSVP column */}
          {rsvpButton && <Box sx={{ flexShrink: 0 }}>{rsvpButton}</Box>}
        </Box>
      );
    }

    // Cards layout (default)
    return (
      <Card
        component="article"
        elevation={2}
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "transform 0.2s ease",
          "&:hover": { transform: "translateY(-4px)", boxShadow: 4 },
        }}
      >
        {showImage && event.image && (
          <CardMedia
            component="img"
            height={160}
            image={event.image}
            alt={event.title}
            sx={{ objectFit: "cover" }}
          />
        )}
        <CardContent
          sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            <Typography
              variant="h6"
              component="h3"
              sx={{ fontWeight: 600, color: headingColor, flex: 1 }}
            >
              {event.title}
            </Typography>
            {past && (
              <Chip
                label="Past"
                size="small"
                sx={{
                  bgcolor: "grey.300",
                  color: "grey.700",
                  height: 20,
                  fontSize: "0.7rem",
                }}
              />
            )}
          </Box>

          {event.category && (
            <Chip
              label={event.category}
              size="small"
              sx={{
                alignSelf: "flex-start",
                bgcolor: `${primaryColor}22`,
                color: primaryColor,
                fontSize: "0.75rem",
              }}
            />
          )}

          {showDate && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayIcon sx={{ fontSize: 14, color: bodyColor }} />
              <Typography variant="caption" sx={{ color: bodyColor }}>
                {formatEventDate(event.startDate)}
              </Typography>
            </Box>
          )}

          {showLocation && event.location && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <LocationOnIcon sx={{ fontSize: 14, color: bodyColor }} />
              <Typography variant="caption" sx={{ color: bodyColor }}>
                {event.location}
              </Typography>
            </Box>
          )}

          {showPrice && event.price !== undefined && (
            <Typography
              variant="body2"
              sx={{ color: primaryColor, fontWeight: 600 }}
            >
              {formatPrice(event.price, event.currency)}
            </Typography>
          )}

          {event.description && (
            <Typography
              variant="body2"
              sx={{ color: bodyColor, flex: 1, lineHeight: 1.5 }}
            >
              {event.description.length > 100
                ? `${event.description.slice(0, 100)}…`
                : event.description}
            </Typography>
          )}

          {rsvpButton && <Box sx={{ mt: "auto", pt: 1 }}>{rsvpButton}</Box>}
        </CardContent>
      </Card>
    );
  },
);
EventCard.displayName = "EventCard";

/* ===================== Calendar Layout ===================== */

interface CalendarViewProps {
  events: Event[];
  primaryColor: string;
}

const CalendarView: React.FC<CalendarViewProps> = React.memo(
  ({ events, primaryColor }) => {
    const [viewDate] = useState(() => new Date());

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build events by day
    const eventsByDay = useMemo(() => {
      const map: Record<number, Event[]> = {};
      events.forEach((ev) => {
        const d = new Date(ev.startDate);
        if (d.getFullYear() === year && d.getMonth() === month) {
          const day = d.getDate();
          if (!map[day]) map[day] = [];
          map[day].push(ev);
        }
      });
      return map;
    }, [events, year, month]);

    const monthLabel = viewDate.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });

    // Total cells = leading blanks + days in month, rounded up to multiple of 7
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    return (
      <Box aria-label="Event calendar">
        <Typography
          variant="h6"
          sx={{ textAlign: "center", mb: 2, fontWeight: 600 }}
        >
          {monthLabel}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 0.5,
          }}
        >
          {/* Day headers */}
          {DAY_LABELS.map((day) => (
            <Box
              key={day}
              sx={{
                textAlign: "center",
                py: 0.5,
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "text.secondary",
              }}
            >
              {day}
            </Box>
          ))}

          {/* Day cells */}
          {Array.from({ length: totalCells }).map((_, i) => {
            const dayNum = i - firstDayOfMonth + 1;
            const isValidDay = dayNum >= 1 && dayNum <= daysInMonth;
            const dayEvents = isValidDay ? eventsByDay[dayNum] || [] : [];

            return (
              <Box
                key={i}
                sx={{
                  minHeight: 48,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  p: 0.5,
                  bgcolor: isValidDay ? "background.paper" : "transparent",
                  borderStyle: isValidDay ? "solid" : "none",
                }}
              >
                {isValidDay && (
                  <>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        fontWeight: dayEvents.length > 0 ? 700 : 400,
                        color:
                          dayEvents.length > 0 ? primaryColor : "text.primary",
                      }}
                    >
                      {dayNum}
                    </Typography>
                    {/* Event dots */}
                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.25,
                        mt: 0.25,
                      }}
                    >
                      {dayEvents.slice(0, 3).map((ev) => (
                        <Box
                          key={ev.id}
                          title={ev.title}
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: primaryColor,
                          }}
                        />
                      ))}
                      {dayEvents.length > 3 && (
                        <Typography
                          variant="caption"
                          sx={{ fontSize: "0.6rem", color: primaryColor }}
                        >
                          +{dayEvents.length - 3}
                        </Typography>
                      )}
                    </Box>
                  </>
                )}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  },
);
CalendarView.displayName = "CalendarView";

/* ===================== Main Component ===================== */

const EventsListBlockBase: React.FC<EventsListBlockProps> = ({
  block,
  primaryColor = "#378C92",
  headingColor = "#252525",
  bodyColor = "#6A6F78",
  onCtaClick,
}) => {
  const { content } = block;

  const {
    heading = "Upcoming Events",
    subheading = "",
    layout = "cards",
    eventsPerPage = 9,
    showSearch = true,
    showFilters = true,
    showPagination = true,
    showLocation = true,
    showDate = true,
    showImage = true,
    showRsvp = true,
    showPrice = true,
    showPastEvents = true,
    categoryFilter: defaultCategory = "",
    sortBy = "startDate",
    sortOrder: configSortOrder = "asc",
    emptyMessage = "No events found.",
    websiteId,
    detailLink,
  } = content;

  /* --- Tenant-aware URL builder --- */
  const { buildUrl } = useTenantUrl();

  /* --- Local state --- */
  const [events, setEvents] = useState<Event[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
  const [currentPage, setCurrentPage] = useState(1);

  /* --- RSVP state --- */
  const [rsvpedEvents, setRsvpedEvents] = useState<Set<number>>(() => {
    // Initialize from sessionStorage
    const set = new Set<number>();
    if (typeof window !== "undefined") {
      // We'll populate this after events load
    }
    return set;
  });
  const [rsvpLoadingIds, setRsvpLoadingIds] = useState<Set<number>>(new Set());

  /* --- Debounce search --- */
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        setDebouncedSearch(value);
        setCurrentPage(1);
      }, DEBOUNCE_MS);
    },
    [],
  );

  /* --- Fetch events --- */
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({
      page: String(currentPage),
      limit: String(eventsPerPage),
      sortBy,
      sortOrder: configSortOrder,
    });

    if (websiteId) params.set("websiteId", websiteId);
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (selectedCategory) params.set("category", selectedCategory);
    if (!showPastEvents) params.set("upcoming", "true");

    fetch(`${API_URL}/events/public?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load events (${res.status})`);
        return res.json() as Promise<EventsApiResponse>;
      })
      .then((json) => {
        if (!controller.signal.aborted) {
          const eventsData = json.events ?? [];
          setEvents(eventsData);
          setPagination(json.pagination ?? null);

          // Merge categories from API
          if (json.categories) {
            setCategories(json.categories);
          }

          // Initialize RSVP state from sessionStorage
          const rsvpSet = new Set<number>();
          eventsData.forEach((ev) => {
            if (sessionStorage.getItem(`rsvp_${ev.id}`) === "true") {
              rsvpSet.add(ev.id);
            }
          });
          setRsvpedEvents(rsvpSet);
          setLoading(false);
        }
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError" && !controller.signal.aborted) {
          setError(err.message || "Failed to load events. Please try again.");
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [
    currentPage,
    eventsPerPage,
    sortBy,
    configSortOrder,
    debouncedSearch,
    selectedCategory,
    showPastEvents,
    websiteId,
  ]);

  /* --- Cleanup debounce on unmount --- */
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  /* --- RSVP handler --- */
  const handleRsvp = useCallback(
    async (eventId: number) => {
      if (rsvpedEvents.has(eventId) || rsvpLoadingIds.has(eventId)) return;

      // Track analytics
      if (onCtaClick) onCtaClick(block.blockType, `RSVP event ${eventId}`);

      setRsvpLoadingIds((prev) => new Set(prev).add(eventId));

      try {
        const res = await fetch(`${API_URL}/events/${eventId}/rsvp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        if (res.ok) {
          sessionStorage.setItem(`rsvp_${eventId}`, "true");
          setRsvpedEvents((prev) => new Set(prev).add(eventId));
        }
      } catch {
        // Silently handle RSVP errors — button state reverts
      } finally {
        setRsvpLoadingIds((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
      }
    },
    [rsvpedEvents, rsvpLoadingIds, onCtaClick, block.blockType],
  );

  /* --- Category chip click --- */
  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory((prev) => (prev === category ? "" : category));
    setCurrentPage(1);
  }, []);

  /* --- Page change --- */
  const handlePageChange = useCallback(
    (_: React.ChangeEvent<unknown>, page: number) => {
      setCurrentPage(page);
    },
    [],
  );

  /* --- Responsive grid --- */
  const mdCols = useMemo(() => {
    if (layout === "list") return 12 as const;
    return 4 as const; // 3 columns default for cards
  }, [layout]);

  /* --- Render --- */

  // Loading state
  if (loading) {
    return <EventsListSkeleton count={Math.min(eventsPerPage, 6)} />;
  }

  // Error state
  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Box
      component="section"
      aria-label={heading || "Events List"}
      sx={{ py: 8, bgcolor: "background.default" }}
    >
      <Container maxWidth="lg">
        {/* Header */}
        {(heading || subheading) && (
          <Box sx={{ textAlign: "center", mb: 4 }}>
            {heading && (
              <Typography
                variant="h3"
                component="h2"
                gutterBottom
                sx={{ fontWeight: 700, color: headingColor }}
              >
                {heading}
              </Typography>
            )}
            {subheading && (
              <Typography
                variant="h6"
                sx={{
                  color: bodyColor,
                  fontWeight: 400,
                  maxWidth: 600,
                  mx: "auto",
                }}
              >
                {subheading}
              </Typography>
            )}
          </Box>
        )}

        {/* Search Bar */}
        {showSearch && (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search events..."
              value={searchQuery}
              onChange={handleSearchChange}
              inputProps={{ "aria-label": "Search events" }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: bodyColor }} />
                  </InputAdornment>
                ),
              }}
              sx={{ maxWidth: 480, display: "block", mx: "auto" }}
            />
          </Box>
        )}

        {/* Category Filter Chips */}
        {showFilters && categories.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              justifyContent: "center",
              mb: 3,
            }}
            role="group"
            aria-label="Category filter"
          >
            {categories.map((cat) => (
              <Chip
                key={cat}
                label={cat}
                clickable
                variant={selectedCategory === cat ? "filled" : "outlined"}
                onClick={() => handleCategoryClick(cat)}
                aria-pressed={selectedCategory === cat}
                sx={{
                  borderColor: primaryColor,
                  color: selectedCategory === cat ? "white" : primaryColor,
                  bgcolor:
                    selectedCategory === cat ? primaryColor : "transparent",
                  "&:hover": {
                    bgcolor:
                      selectedCategory === cat
                        ? primaryColor
                        : `${primaryColor}1A`,
                  },
                }}
              />
            ))}
          </Box>
        )}

        {/* Loading indicator for subsequent loads */}
        {loading && events.length > 0 && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* Calendar Layout */}
        {layout === "calendar" ? (
          <CalendarView events={events} primaryColor={primaryColor} />
        ) : events.length === 0 ? (
          /* Empty state */
          <Box
            sx={{ textAlign: "center", py: 8 }}
            role="status"
            aria-label="No events found"
          >
            <Typography variant="body1" sx={{ color: bodyColor }}>
              {emptyMessage}
            </Typography>
          </Box>
        ) : layout === "list" ? (
          /* List Layout */
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {events.map((ev) => (
              <EventCard
                key={ev.id}
                event={ev}
                layout="list"
                showLocation={showLocation}
                showDate={showDate}
                showImage={showImage}
                showRsvp={showRsvp}
                showPrice={showPrice}
                primaryColor={primaryColor}
                bodyColor={bodyColor}
                headingColor={headingColor}
                onRsvp={handleRsvp}
                isRsvped={rsvpedEvents.has(ev.id)}
                rsvpLoading={rsvpLoadingIds.has(ev.id)}
              />
            ))}
          </Box>
        ) : (
          /* Cards Layout (default) */
          <Grid container spacing={3}>
            {events.map((ev) => (
              <Grid item xs={12} sm={6} md={mdCols} key={ev.id}>
                <EventCard
                  event={ev}
                  layout="cards"
                  showLocation={showLocation}
                  showDate={showDate}
                  showImage={showImage}
                  showRsvp={showRsvp}
                  showPrice={showPrice}
                  primaryColor={primaryColor}
                  bodyColor={bodyColor}
                  headingColor={headingColor}
                  onRsvp={handleRsvp}
                  isRsvped={rsvpedEvents.has(ev.id)}
                  rsvpLoading={rsvpLoadingIds.has(ev.id)}
                />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Pagination */}
        {showPagination && pagination && pagination.totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              count={pagination.totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              aria-label="Events pagination"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
};

EventsListBlockBase.displayName = "EventsListBlock";

const EventsListBlock = React.memo(EventsListBlockBase);
EventsListBlock.displayName = "EventsListBlock";

export default EventsListBlock;
