import { useId } from 'react';
import { FormControl, InputLabel, Select, FormHelperText, alpha } from '@mui/material';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';

const DashboardSelect = ({
  label,
  value,
  onChange,
  name,
  required = false,
  disabled = false,
  fullWidth = true,
  size = 'medium',
  error = false,
  helperText,
  displayEmpty = false,
  native = false,
  children,
  containerSx,
  labelSx,
  sx,
  MenuProps,
  ...props
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const labelId = useId();
  const selectId = useId();
  const showLabel = Boolean(label);
  const isLight = actualTheme === 'light';

  const defaultMenuProps = {
    PaperProps: {
      sx: {
        bgcolor: colors.panelBg,
        border: `1px solid ${colors.panelBorder}`,
        borderRadius: 2,
        mt: 0.5,
        '& .MuiMenuItem-root': {
          color: colors.panelText,
          '&:hover': {
            backgroundColor: alpha(colors.panelAccent, 0.12),
          },
          '&.Mui-selected': {
            backgroundColor: alpha(colors.panelAccent, 0.2),
            '&:hover': {
              backgroundColor: alpha(colors.panelAccent, 0.25),
            },
          },
        },
      },
    },
  };

  const mergedMenuProps = MenuProps
    ? {
        ...defaultMenuProps,
        ...MenuProps,
        PaperProps: {
          ...defaultMenuProps.PaperProps,
          ...MenuProps.PaperProps,
          sx: [defaultMenuProps.PaperProps?.sx, MenuProps.PaperProps?.sx],
        },
      }
    : defaultMenuProps;

  return (
    <FormControl
      fullWidth={fullWidth}
      required={required}
      disabled={disabled}
      error={error}
      size={size}
      sx={containerSx}
    >
      {showLabel && (
        <InputLabel
          id={labelId}
          sx={[
            {
              color: error ? colors.panelDanger : (isLight ? colors.panelText : colors.panelMuted),
              '&.Mui-focused': {
                color: error ? colors.panelDanger : colors.panelAccent,
              },
            },
            labelSx,
          ]}
        >
          {label}
        </InputLabel>
      )}
      <Select
        id={selectId}
        labelId={showLabel ? labelId : undefined}
        name={name}
        value={value}
        onChange={onChange}
        label={showLabel ? label : undefined}
        displayEmpty={displayEmpty}
        native={native}
        MenuProps={native ? undefined : mergedMenuProps}
        sx={[
          {
            color: colors.panelText,
            backgroundColor: isLight ? 'rgba(255, 255, 255, 0.5)' : alpha(colors.panelText, 0.04),
            borderRadius: '12px',
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? colors.panelDanger : (isLight ? 'rgba(0, 0, 0, 0.10)' : colors.panelBorder),
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? colors.panelDanger : alpha(colors.panelAccent, 0.3),
            },
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(
                error ? colors.panelDanger : colors.panelAccent,
                0.12
              )}`,
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: error ? colors.panelDanger : colors.panelAccent,
            },
            '& .MuiSvgIcon-root': { color: colors.panelIcon },
            '&.Mui-disabled': {
              color: colors.panelMuted,
              backgroundColor: isLight ? 'rgba(255, 255, 255, 0.3)' : alpha(colors.panelText, 0.02),
            },
            '&.Mui-disabled .MuiOutlinedInput-notchedOutline': {
              borderColor: colors.panelBorder,
            },
            '&.Mui-disabled .MuiSvgIcon-root': {
              color: colors.panelSubtle,
            },
          },
          sx,
        ]}
        {...props}
      >
        {children}
      </Select>
      {helperText && (
        <FormHelperText sx={{ color: error ? colors.panelDanger : colors.panelMuted, ml: 0 }}>
          {helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default DashboardSelect;
