import { InputAdornment } from '@mui/material';
import { Search as SearchIcon } from 'lucide-react';
import { getDashboardColors } from '../../../styles/dashboardTheme';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import DashboardInput from './DashboardInput';

/**
 * SearchBar Component
 *
 * Reusable search bar with consistent styling
 *
 * @param {string} value - Current search query value
 * @param {function} onChange - Change handler function
 * @param {string} placeholder - Placeholder text
 * @param {boolean} fullWidth - Whether the search bar should be full width (default: true)
 */
const SearchBar = ({ value, onChange, placeholder = 'Search...', fullWidth = true }) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);

  return (
    <DashboardInput
      fullWidth={fullWidth}
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon size={18} color={colors.panelIcon} />
          </InputAdornment>
        ),
      }}
      sx={{
        '& .MuiOutlinedInput-input': {
          padding: '10px 14px',
        },
      }}
    />
  );
};

export default SearchBar;
