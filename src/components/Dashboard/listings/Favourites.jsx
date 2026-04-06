import { memo, useState, useCallback, useMemo } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Skeleton,
  MenuItem,
  alpha,
  Rating,
} from '@mui/material';
import { Heart, Search, Star, Bookmark } from 'lucide-react';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import {
  PageHeader,
  DashboardGradientButton,
  DashboardSelect,
  SearchBar,
  DashboardTablePagination,
} from '../shared';
import { useUserFavourites } from '../../../hooks/useFavourites';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

/* ---------- EmptyState ---------- */
const EmptyState = memo(function EmptyState({ colors, onBrowseListings }) {
  return (
    <Card
      sx={{
        background: alpha(colors.bgCard, 0.5),
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        border: `1px solid ${alpha(colors.border, 0.5)}`,
        boxShadow: `0 4px 20px ${alpha(colors.darker, 0.1)}`,
        textAlign: 'center',
        py: 8,
        px: 4,
      }}
    >
      <CardContent>
        <Box
          sx={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${alpha('#ef4444', 0.15)} 0%, ${alpha('#ef4444', 0.1)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <Heart size={44} color="#ef4444" />
        </Box>
        <Typography variant="h4" sx={{ color: colors.text, fontWeight: 700, mb: 2 }}>
          No Favourites Yet
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: colors.textSecondary, mb: 4, maxWidth: 480, mx: 'auto', lineHeight: 1.7 }}
        >
          You haven&apos;t saved any listings as favourites. Browse the directory and click the heart
          icon on listings you want to save for quick access later.
        </Typography>
        <Box
          sx={{
            background: alpha(colors.primary, 0.05),
            borderRadius: 2,
            p: 3,
            maxWidth: 400,
            mx: 'auto',
            mb: 4,
          }}
        >
          <Typography variant="subtitle2" sx={{ color: colors.text, fontWeight: 600, mb: 2 }}>
            How to save favourites:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Search size={16} color={colors.primary} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Browse the business directory
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Star size={16} color={colors.primary} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Find listings you&apos;re interested in
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Bookmark size={16} color={colors.primary} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Click the heart to save them here
              </Typography>
            </Box>
          </Box>
        </Box>
        <DashboardGradientButton onClick={onBrowseListings} startIcon={<Search size={18} />}>
          Browse Directory
        </DashboardGradientButton>
      </CardContent>
    </Card>
  );
});

/* ---------- SkeletonGrid ---------- */
const SkeletonGrid = memo(function SkeletonGrid({ colors }) {
  return (
    <Grid container spacing={2}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card
            sx={{
              borderRadius: 2,
              border: `1px solid ${alpha(colors.border, 0.4)}`,
              overflow: 'hidden',
            }}
          >
            <Skeleton variant="rectangular" height={140} animation="wave" />
            <CardContent>
              <Skeleton variant="text" width="70%" height={24} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="45%" height={18} sx={{ mb: 0.5 }} />
              <Skeleton variant="text" width="55%" height={18} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
});

/* ---------- FavouriteCard ---------- */
const FavouriteCard = memo(function FavouriteCard({ item, colors, onUnfavourite }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: `1px solid ${alpha(colors.border, 0.4)}`,
        background: alpha(colors.bgCard, 0.6),
        backdropFilter: 'blur(8px)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        '&:hover': { boxShadow: `0 4px 20px ${alpha(colors.darker, 0.15)}` },
        transition: 'box-shadow 0.2s',
      }}
    >
      {/* Image */}
      {item.image ? (
        <CardMedia component="img" height="140" image={item.image} alt={item.title}
          onError={(e) => { e.target.style.display = 'none'; }}
        />
      ) : (
        <Box
          sx={{
            height: 140,
            bgcolor: alpha(colors.primary, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Heart size={32} color={alpha('#ef4444', 0.4)} />
        </Box>
      )}

      {/* Heart button (unfavourite) */}
      <Box
        component="button"
        onClick={(e) => { e.stopPropagation(); onUnfavourite(item.id || item.websiteId); }}
        aria-label="Remove from favourites"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          background: 'rgba(0,0,0,0.5)',
          border: 'none',
          cursor: 'pointer',
          borderRadius: '50%',
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1,
          '&:hover': { background: 'rgba(0,0,0,0.75)' },
          transition: 'background 0.2s',
        }}
      >
        <FavoriteIcon sx={{ fontSize: 16, color: '#ef4444' }} />
      </Box>

      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Typography
          variant="subtitle2"
          sx={{ fontWeight: 600, color: colors.text, mb: 0.3 }}
          noWrap
        >
          {item.title}
        </Typography>
        {item.category && (
          <Typography variant="caption" sx={{ color: colors.textSecondary, display: 'block', mb: 0.5 }}>
            {item.category}
          </Typography>
        )}
        {typeof item.averageRating === 'number' && item.averageRating > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4 }}>
            <Rating value={item.averageRating} readOnly size="small" precision={0.1} />
            <Typography variant="caption" sx={{ color: colors.textSecondary }}>
              {item.averageRating.toFixed(1)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});

/* ---------- ErrorState ---------- */
const ErrorState = memo(function ErrorState({ colors, onRetry }) {
  return (
    <Card
      sx={{
        background: alpha(colors.bgCard, 0.5),
        borderRadius: 3,
        border: `1px solid ${alpha(colors.border, 0.5)}`,
        textAlign: 'center',
        py: 6,
        px: 4,
      }}
    >
      <CardContent>
        <Typography variant="h6" sx={{ color: colors.text, mb: 2 }}>
          Failed to load favourites
        </Typography>
        <DashboardGradientButton onClick={onRetry}>Retry</DashboardGradientButton>
      </CardContent>
    </Card>
  );
});

/* ---------- Favourites (main) ---------- */
const Favourites = ({ pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  // Track items being removed (for animation)
  const [removingIds, setRemovingIds] = useState(new Set());
  // Local optimistic removal list
  const [removedIds, setRemovedIds] = useState(new Set());

  const { favourites, pagination, loading, error, refetch } = useUserFavourites(sort, page);

  // Client-side name filter
  const filteredFavourites = useMemo(() => {
    const base = favourites.filter((f) => !removedIds.has(f.id || f.websiteId));
    if (!searchQuery.trim()) return base;
    const q = searchQuery.toLowerCase();
    return base.filter((f) => f.title?.toLowerCase().includes(q));
  }, [favourites, searchQuery, removedIds]);

  const handleBrowseListings = useCallback(() => {
    navigate('/dashboard/listings');
  }, [navigate]);

  const handleUnfavourite = useCallback(
    async (id) => {
      // Start removal animation
      setRemovingIds((prev) => new Set(prev).add(id));
      // Wait for animation (300ms), then optimistically remove
      setTimeout(async () => {
        setRemovedIds((prev) => new Set(prev).add(id));
        setRemovingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
        // Call API
        try {
          await axios.post(
            `${API_URL}/favourites/listings/${id}/favourite`,
            {},
            { withCredentials: true }
          );
        } catch {
          // Revert on error
          setRemovedIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        }
      }, 300);
    },
    []
  );

  const handleSortChange = useCallback((e) => {
    setSort(e.target.value);
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((e) => {
    // SearchBar passes the full event object (it delegates onChange to TextField)
    const value = e && e.target ? e.target.value : (typeof e === 'string' ? e : '');
    setSearchQuery(value);
  }, []);

  const handlePageChange = useCallback((_event, value) => {
    setPage(value);
  }, []);

  const totalCount = pagination?.total ?? filteredFavourites.length;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {/* Controls row */}
      {!loading && !error && (favourites.length > 0 || searchQuery) && (
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <SearchBar
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search favourites..."
            />
          </Box>
          <DashboardSelect
            size="small"
            label="Sort by"
            value={sort}
            onChange={handleSortChange}
            containerSx={{ minWidth: 160 }}
          >
            <MenuItem value="recent">Recently Saved</MenuItem>
            <MenuItem value="rating">Highest Rated</MenuItem>
            <MenuItem value="name">Name A–Z</MenuItem>
          </DashboardSelect>
        </Box>
      )}

      {/* Content */}
      {loading ? (
        <SkeletonGrid colors={colors} />
      ) : error ? (
        <ErrorState colors={colors} onRetry={refetch} />
      ) : filteredFavourites.length === 0 && !searchQuery ? (
        <EmptyState colors={colors} onBrowseListings={handleBrowseListings} />
      ) : filteredFavourites.length === 0 && searchQuery ? (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant="body1" sx={{ color: colors.textSecondary }}>
            No favourites match &ldquo;{searchQuery}&rdquo;
          </Typography>
        </Box>
      ) : (
        <>
          <Grid container spacing={2}>
            <AnimatePresence>
              {filteredFavourites.map((item) => {
                const itemId = item.id || item.websiteId;
                const isRemoving = removingIds.has(itemId);
                return (
                  <Grid item xs={12} sm={6} md={4} key={itemId}>
                    <motion.div
                      layout
                      animate={isRemoving ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <FavouriteCard
                        item={item}
                        colors={colors}
                        onUnfavourite={handleUnfavourite}
                      />
                    </motion.div>
                  </Grid>
                );
              })}
            </AnimatePresence>
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ mt: 2 }}>
              <DashboardTablePagination
                component="div"
                count={totalCount}
                page={page - 1}
                rowsPerPage={12}
                onPageChange={(e, newPage) => setPage(newPage + 1)}
                rowsPerPageOptions={[]}
                colors={colors}
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
};

export default Favourites;
