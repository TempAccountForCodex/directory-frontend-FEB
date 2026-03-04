import React from 'react';
import { Box, Typography, Button, Container, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CookieIcon from '@mui/icons-material/Cookie';
import { useCookieConsent } from '../../context/PreferencesContext';

const CookieBanner = () => {
  const { showBanner, handleAcceptAll, handleRejectNonEssential, openPreferences } =
    useCookieConsent();

  if (!showBanner) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(55, 140, 146, 0.3)',
        zIndex: 9999,
        py: { xs: 2, sm: 2.5 },
        px: { xs: 2, sm: 3 },
        boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'space-between',
            gap: { xs: 2, md: 3 },
          }}
        >
          {/* Icon & Text */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 2,
              flex: 1,
            }}
          >
            <CookieIcon
              sx={{
                color: '#378C92',
                fontSize: { xs: 28, md: 32 },
                flexShrink: 0,
                mt: 0.5,
              }}
            />
            <Box>
              <Typography
                sx={{
                  color: '#fff',
                  fontSize: { xs: '1rem', sm: '1.1rem' },
                  fontWeight: 600,
                  fontFamily: 'system-ui',
                  mb: 0.5,
                }}
              >
                We value your privacy
              </Typography>
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.85)',
                  fontSize: { xs: '0.875rem', sm: '0.95rem' },
                  fontFamily: 'system-ui',
                  lineHeight: 1.5,
                }}
              >
                We use cookies to enhance your experience, analyze site traffic, and personalize
                content. By clicking "Accept All", you consent to our use of cookies.{' '}
                <Typography
                  component="a"
                  href="/cookie-policy"
                  sx={{
                    color: '#378C92',
                    textDecoration: 'underline',
                    '&:hover': { color: '#4aa4ab' },
                  }}
                >
                  Learn more
                </Typography>
              </Typography>
            </Box>
          </Box>

          {/* Buttons */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 1.5, sm: 2 },
              width: { xs: '100%', md: 'auto' },
              flexShrink: 0,
            }}
          >
            <Button
              onClick={handleRejectNonEssential}
              variant="outlined"
              sx={{
                color: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.3)',
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                textTransform: 'none',
                fontFamily: 'system-ui',
                px: { xs: 2.5, sm: 3 },
                py: 1,
                borderRadius: '8px',
                minWidth: { xs: '100%', sm: '120px' },
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                },
              }}
            >
              Reject
            </Button>

            <Button
              onClick={openPreferences}
              variant="outlined"
              sx={{
                color: '#378C92',
                borderColor: '#378C92',
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                textTransform: 'none',
                fontFamily: 'system-ui',
                px: { xs: 2.5, sm: 3 },
                py: 1,
                borderRadius: '8px',
                minWidth: { xs: '100%', sm: '120px' },
                '&:hover': {
                  borderColor: '#4aa4ab',
                  backgroundColor: 'rgba(55, 140, 146, 0.1)',
                },
              }}
            >
              Customize
            </Button>

            <Button
              onClick={handleAcceptAll}
              variant="contained"
              sx={{
                backgroundColor: '#378C92',
                color: '#fff',
                fontWeight: 600,
                fontSize: { xs: '0.875rem', sm: '0.9rem' },
                textTransform: 'none',
                fontFamily: 'system-ui',
                px: { xs: 2.5, sm: 3 },
                py: 1,
                borderRadius: '8px',
                minWidth: { xs: '100%', sm: '120px' },
                boxShadow: '0 4px 12px rgba(55, 140, 146, 0.3)',
                '&:hover': {
                  backgroundColor: '#4aa4ab',
                  boxShadow: '0 6px 16px rgba(55, 140, 146, 0.4)',
                },
              }}
            >
              Accept All
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CookieBanner;
