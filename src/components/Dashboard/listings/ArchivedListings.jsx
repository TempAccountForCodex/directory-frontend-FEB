import { memo } from 'react';
import { Box, Container, Typography, Card, CardContent, alpha } from '@mui/material';
import { Archive, RotateCcw, Trash2, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { PageHeader, DashboardActionButton } from '../shared';

/**
 * EmptyState - Empty state for Archived Listings page
 */
const EmptyState = memo(function EmptyState({ colors, onViewListings }) {
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
            background: `linear-gradient(135deg, ${alpha(colors.textSecondary, 0.15)} 0%, ${alpha(colors.textSecondary, 0.1)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <Archive size={44} color={colors.textSecondary} />
        </Box>
        <Typography
          variant="h4"
          sx={{
            color: colors.text,
            fontWeight: 700,
            mb: 2,
          }}
        >
          No Archived Listings
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
          You don't have any archived listings. When you archive a listing instead of
          deleting it, it will appear here so you can restore it later if needed.
        </Typography>

        {/* Archive info */}
        <Box
          sx={{
            background: alpha(colors.border, 0.3),
            borderRadius: 2,
            p: 3,
            maxWidth: 450,
            mx: 'auto',
            mb: 4,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{ color: colors.text, fontWeight: 600, mb: 2 }}
          >
            About archived listings:
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Clock size={16} color={colors.textSecondary} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Archived listings are hidden from the directory
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <RotateCcw size={16} color={colors.textSecondary} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                You can restore them at any time
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Trash2 size={16} color={colors.textSecondary} />
              <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                Permanently delete when no longer needed
              </Typography>
            </Box>
          </Box>
        </Box>

        <DashboardActionButton onClick={onViewListings}>
          View All Listings
        </DashboardActionButton>
      </CardContent>
    </Card>
  );
});

/**
 * ArchivedListings - Page to view and restore archived listings
 */
const ArchivedListings = ({ pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  // TODO: Fetch user's archived listings
  const archivedListings = [];

  const handleViewListings = () => {
    navigate('/dashboard/listings');
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {archivedListings.length === 0 ? (
        <EmptyState colors={colors} onViewListings={handleViewListings} />
      ) : (
        // TODO: Render archived listings with restore/delete actions
        <Box>Archived listings will appear here</Box>
      )}
    </Container>
  );
};

export default ArchivedListings;
