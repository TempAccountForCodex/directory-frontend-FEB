import { memo } from 'react';
import { Box, Container, Typography, Card, CardContent, alpha } from '@mui/material';
import { Pencil, Plus, FileEdit, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { PageHeader, DashboardGradientButton, DashboardActionButton } from '../shared';

/**
 * EmptyState - Empty state for Modify Listing page
 */
const EmptyState = memo(function EmptyState({ colors, onCreateListing, onViewListings }) {
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
            background: `linear-gradient(135deg, ${alpha(colors.warning, 0.15)} 0%, ${alpha(colors.warning, 0.1)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <Pencil size={44} color={colors.warning} />
        </Box>
        <Typography
          variant="h4"
          sx={{
            color: colors.text,
            fontWeight: 700,
            mb: 2,
          }}
        >
          No Listings to Modify
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
          You don't have any listings to edit yet. Create a listing first, then come back
          here to update your business details, hours, and contact information.
        </Typography>

        {/* What you can modify */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 4,
            mb: 4,
            flexWrap: 'wrap',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileEdit size={18} color={colors.textSecondary} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Business details
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Settings2 size={18} color={colors.textSecondary} />
            <Typography variant="body2" sx={{ color: colors.textSecondary }}>
              Contact & hours
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <DashboardGradientButton
            onClick={onCreateListing}
            startIcon={<Plus size={18} />}
          >
            Create a Listing
          </DashboardGradientButton>
          <DashboardActionButton
            onClick={onViewListings}
            variant="outlined"
          >
            View All Listings
          </DashboardActionButton>
        </Box>
      </CardContent>
    </Card>
  );
});

/**
 * ModifyListing - Page to edit and update existing listings
 */
const ModifyListing = ({ pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const navigate = useNavigate();

  // TODO: Fetch user's listings that can be modified
  const listings = [];

  const handleCreateListing = () => {
    // TODO: Navigate to create listing flow
    console.log('Create listing clicked');
  };

  const handleViewListings = () => {
    navigate('/dashboard/listings');
  };

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {listings.length === 0 ? (
        <EmptyState
          colors={colors}
          onCreateListing={handleCreateListing}
          onViewListings={handleViewListings}
        />
      ) : (
        // TODO: Render editable listings list
        <Box>Editable listings will appear here</Box>
      )}
    </Container>
  );
};

export default ModifyListing;
