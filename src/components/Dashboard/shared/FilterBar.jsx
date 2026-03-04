import { MenuItem } from '@mui/material';
import DashboardSelect from './DashboardSelect';

/**
 * FilterBar Component
 *
 * Reusable filter dropdown with consistent styling
 *
 * @param {string} label - Filter label text
 * @param {string} value - Currently selected filter value
 * @param {function} onChange - Change handler function
 * @param {Array} options - Array of option objects with {value, label}
 * @param {boolean} fullWidth - Whether the filter should be full width (default: false)
 */
const FilterBar = ({ label, value, onChange, options, fullWidth = false }) => {
  return (
    <DashboardSelect
      size="small"
      fullWidth={fullWidth}
      label={label}
      value={value}
      onChange={onChange}
      containerSx={{ minWidth: 150 }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </DashboardSelect>
  );
};

export default FilterBar;
