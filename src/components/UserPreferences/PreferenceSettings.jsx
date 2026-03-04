import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  Switch,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SecurityIcon from '@mui/icons-material/Security';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CampaignIcon from '@mui/icons-material/Campaign';
import { useCookieConsent } from '../../context/PreferencesContext';
import { COOKIE_CATEGORIES, getCookiePreferences } from '../../utils/preferences';

const CookiePreferences = () => {
  const { showPreferences, closePreferences, handleCustomize } = useCookieConsent();

  const [categories, setCategories] = useState({
    [COOKIE_CATEGORIES.ESSENTIAL]: true,
    [COOKIE_CATEGORIES.ANALYTICS]: false,
    [COOKIE_CATEGORIES.MARKETING]: false,
  });

  useEffect(() => {
    const saved = getCookiePreferences();
    if (saved) {
      setCategories(saved.categories);
    }
  }, [showPreferences]);

  const handleToggle = (category) => {
    if (category === COOKIE_CATEGORIES.ESSENTIAL) return; // Essential always enabled

    setCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    handleCustomize(categories);
  };

  const categoryDetails = [
    {
      key: COOKIE_CATEGORIES.ESSENTIAL,
      icon: <SecurityIcon sx={{ color: '#378C92', fontSize: 28 }} />,
      title: 'Essential Cookies',
      description:
        'Required for the website to function properly. These cannot be disabled as they are necessary for basic site operations, security, and navigation.',
      alwaysOn: true,
    },
    {
      key: COOKIE_CATEGORIES.ANALYTICS,
      icon: <AnalyticsIcon sx={{ color: '#378C92', fontSize: 28 }} />,
      title: 'Analytics Cookies',
      description:
        'Help us understand how visitors interact with our website by collecting and reporting information anonymously. We use Google Analytics to improve our services.',
      alwaysOn: false,
    },
    {
      key: COOKIE_CATEGORIES.MARKETING,
      icon: <CampaignIcon sx={{ color: '#378C92', fontSize: 28 }} />,
      title: 'Marketing Cookies',
      description:
        'Used to track visitors across websites to display relevant advertisements and measure campaign effectiveness. Currently not in use.',
      alwaysOn: false,
    },
  ];

  return (
    <Dialog
      open={showPreferences}
      onClose={closePreferences}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          backgroundColor: '#fff',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          pt: 3,
          px: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: { xs: '1.5rem', sm: '1.75rem' },
            fontWeight: 700,
            fontFamily: 'system-ui',
            color: '#000',
          }}
        >
          Cookie Preferences
        </Typography>
        <IconButton onClick={closePreferences} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ px: 3, py: 3 }}>
        <Typography
          sx={{
            fontSize: '0.95rem',
            color: '#666',
            fontFamily: 'system-ui',
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          We use cookies to enhance your browsing experience and analyze our traffic. You can choose
          which types of cookies to allow below.
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {categoryDetails.map((category) => (
            <Box
              key={category.key}
              sx={{
                display: 'flex',
                gap: 2,
                p: 2.5,
                borderRadius: '10px',
                border: '1px solid #e0e0e0',
                backgroundColor: categories[category.key] ? 'rgba(55, 140, 146, 0.05)' : '#fafafa',
                transition: 'all 0.2s ease',
              }}
            >
              <Box sx={{ flexShrink: 0, mt: 0.5 }}>{category.icon}</Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    fontFamily: 'system-ui',
                    color: '#000',
                    mb: 0.5,
                  }}
                >
                  {category.title}
                </Typography>
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    color: '#666',
                    fontFamily: 'system-ui',
                    lineHeight: 1.6,
                  }}
                >
                  {category.description}
                </Typography>
              </Box>

              <Box sx={{ flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                {category.alwaysOn ? (
                  <Typography
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#378C92',
                      textTransform: 'uppercase',
                      px: 2,
                    }}
                  >
                    Always On
                  </Typography>
                ) : (
                  <Switch
                    checked={categories[category.key]}
                    onChange={() => handleToggle(category.key)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: '#378C92',
                      },
                      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                        backgroundColor: '#378C92',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 2.5, gap: 2 }}>
        <Button
          onClick={closePreferences}
          variant="outlined"
          sx={{
            color: '#666',
            borderColor: '#ddd',
            fontWeight: 500,
            fontSize: '0.9rem',
            textTransform: 'none',
            fontFamily: 'system-ui',
            px: 3,
            py: 1,
            borderRadius: '8px',
            '&:hover': {
              borderColor: '#999',
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            backgroundColor: '#378C92',
            color: '#fff',
            fontWeight: 600,
            fontSize: '0.9rem',
            textTransform: 'none',
            fontFamily: 'system-ui',
            px: 3,
            py: 1,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(55, 140, 146, 0.3)',
            '&:hover': {
              backgroundColor: '#4aa4ab',
              boxShadow: '0 6px 16px rgba(55, 140, 146, 0.4)',
            },
          }}
        >
          Save Preferences
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CookiePreferences;
