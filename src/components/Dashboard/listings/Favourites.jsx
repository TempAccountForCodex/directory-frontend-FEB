import { memo } from 'react';
import { Box, Container, Typography, Card, CardContent, alpha } from '@mui/material';
import { Heart, Search, Star, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { PageHeader, DashboardGradientButton } from '../shared';

/**
 * EmptyState - Empty state for Favourites page
 */
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
        <Typography
          variant="h4"
          sx={{
            color: colors.text,
            fontWeight: 700,
            mb: 2,
          }}
        >
          No Favourites Yet
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: colors.textSecondary,
            mb: 4,
            maxWidth: 480,
            mx: 'auto',
            lineHeight: 1.7,
          }}
        >
          You haven't saved any listings as favourites. Browse the directory and click
          the heart icon on listings you want to save for quick access later.
        </Typography>

        {/* How to save favourites */}
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
          <Typography
            variant="subtitle2"
            sx={{ color: colors.text, fontWeight: 600, mb: 2 }}
          >
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
                Find listings you're interested in
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

        <DashboardGradientButton
          onClick={onBrowseListings}
          startIcon={<Search size={18} />}
        >
          Browse Directory
        </DashboardGradientButton>
      </CardContent>
    </Card>
  );
});

/**
 * Favourites - Page to view saved/favourite listings
 */
const Favourites = ({ pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  // TODO: Fetch user's favourite listings
  const favourites = [];

  const handleBrowseListings = () => {
    navigate('/dashboard/listings');
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {favourites.length === 0 ? (
        <EmptyState colors={colors} onBrowseListings={handleBrowseListings} />
      ) : (
        // TODO: Render favourite listings grid
        <Box>Favourite listings will appear here</Box>
      )}
    </Container>
  );
};

export default Favourites;
