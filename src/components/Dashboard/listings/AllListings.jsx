import { memo } from 'react';
import { Box, Container, Typography, Card, CardContent, Grid, alpha } from '@mui/material';
import { LayoutList, Plus, MapPin, Building2, Clock } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { PageHeader, DashboardGradientButton } from '../shared';

/**
 * EmptyState - Empty state for All Listings page
 */
const EmptyState = memo(function EmptyState({ colors }) {
  const handleCreateListing = () => {
    // TODO: Navigate to create listing flow
    console.log('Create listing clicked');
  };

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
            background: `linear-gradient(135deg, ${alpha(colors.primary, 0.15)} 0%, ${alpha(colors.primaryDark, 0.1)} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            mb: 3,
          }}
        >
          <LayoutList size={44} color={colors.primary} />
        </Box>
        <Typography
          variant="h4"
          sx={{
            color: colors.text,
            fontWeight: 700,
            mb: 2,
          }}
        >
          No Listings Yet
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: colors.textSecondary,
            mb: 4,
            maxWidth: 500,
            mx: 'auto',
            lineHeight: 1.7,
          }}
        >
          Create your first business listing to get started. Listings help customers
          discover your business in the directory and increase your online visibility.
        </Typography>

        {/* Feature highlights */}
        <Grid container spacing={3} sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <MapPin size={24} color={colors.primary} style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                Location-based discovery
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Building2 size={24} color={colors.primary} style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                Business profiles
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center' }}>
              <Clock size={24} color={colors.primary} style={{ marginBottom: 8 }} />
              <Typography variant="body2" sx={{ color: colors.textSecondary, fontWeight: 500 }}>
                Operating hours
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <DashboardGradientButton
          onClick={handleCreateListing}
          startIcon={<Plus size={18} />}
          size="large"
        >
          Create Your First Listing
        </DashboardGradientButton>
      </CardContent>
    </Card>
  );
});

/**
 * AllListings - Page to view and manage all business directory listings
 */
const AllListings = ({ pageTitle, pageSubtitle }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  // TODO: Fetch listings data
  const listings = [];

  return (
    <Container maxWidth="xl" sx={{ px: { xs: 0, sm: 0 } }}>
      <PageHeader title={pageTitle} subtitle={pageSubtitle} />

      {listings.length === 0 ? (
        <EmptyState colors={colors} />
      ) : (
        // TODO: Render listings grid
        <Box>Listings will appear here</Box>
      )}
    </Container>
  );
};

export default AllListings;
