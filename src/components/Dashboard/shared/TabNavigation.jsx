import { Box, Tabs, Tab } from '@mui/material';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';

/**
 * TabNavigation Component
 *
 * Reusable tab navigation component with consistent styling
 *
 * @param {Array} tabs - Array of tab objects with {label, value, icon (optional)}
 * @param {string} value - Currently active tab value
 * @param {function} onChange - Tab change handler function
 */
const TabNavigation = ({ tabs, value, onChange }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <Box sx={{ borderBottom: 1, borderColor: colors.border, mb: 3 }}>
      <Tabs
        value={value}
        onChange={onChange}
        sx={{
          '& .MuiTab-root': {
            color: colors.textSecondary,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            minHeight: 48,
            '&.Mui-selected': {
              color: colors.primary,
            },
          },
          '& .MuiTabs-indicator': {
            backgroundColor: colors.primary,
            height: 3,
            borderRadius: '3px 3px 0 0',
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.value}
            label={tab.label}
            value={tab.value}
            icon={tab.icon}
            iconPosition="start"
          />
        ))}
      </Tabs>
    </Box>
  );
};

export default TabNavigation;
