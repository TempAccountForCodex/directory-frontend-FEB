import { Box, Alert } from '@mui/material';

const ArchivedListings = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Alert severity="info">
        Listing management has moved to the website management dashboard.
        Navigate to your website and select the "Listing" tab.
      </Alert>
    </Box>
  );
};

export default ArchivedListings;
