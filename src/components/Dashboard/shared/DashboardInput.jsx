import { useId } from 'react';
import { Box, TextField, Typography, alpha } from '@mui/material';
import { useTheme as useCustomTheme } from '../../../context/ThemeContext';
import { getDashboardColors } from '../../../styles/dashboardTheme';

const DashboardInput = ({
  inputSize = 'md',
  label,
  helperText,
  error = false,
  fullWidth = true,
  variant = 'panel',
  labelPlacement = 'top',
  resizable = true,
  containerSx,
  labelSx,
  sx,
  id,
  ...props
}) => {
  const { actualTheme } = useCustomTheme();
  const colors = getDashboardColors(actualTheme);
  const fallbackId = useId();
  const inputId = id || fallbackId;
  const isClassic = variant === 'classic';
  const useFloatingLabel = label && labelPlacement === 'floating';
  const isSm = props.size === 'small';
  const fs = inputSize === 'sm' ? '0.92rem' : '1rem';

  const isLight = actualTheme === 'light';

  const palette = isClassic
    ? {
        bg: colors.cardBg,
        fill: 'transparent',
        border: colors.border,
        text: colors.text,
        muted: colors.textSecondary,
        subtle: colors.textTertiary,
        accent: colors.primary,
        danger: colors.error,
        hoverBorder: alpha(colors.primary, 0.5),
        focusRing: 'transparent',
        disabledBg: 'transparent',
        shadow: 'none',
      }
    : {
        bg: colors.panelBg,
        fill: isLight ? 'rgba(255, 255, 255, 0.5)' : alpha(colors.panelText, 0.04),
        border: isLight ? 'rgba(0, 0, 0, 0.10)' : colors.panelBorder,
        text: colors.panelText,
        muted: colors.panelMuted,
        subtle: colors.panelSubtle,
        accent: colors.panelAccent,
        danger: colors.panelDanger,
        hoverBorder: alpha(colors.panelAccent, 0.3),
        focusRing: alpha(colors.panelAccent, 0.12),
        disabledBg: isLight ? 'rgba(255, 255, 255, 0.5)' : alpha(colors.panelText, 0.02),
        shadow: colors.panelShadow,
        autofillBg: isLight ? 'rgba(255, 255, 255, 0.8)' : alpha(colors.panelText, 0.04),
      };

  const baseContainerSx = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    ...(labelPlacement === 'top'
      ? {
          '&:focus-within .dashboard-input-label': {
            color: palette.accent,
          },
        }
      : {}),
  };

  const baseLabelSx = {
    color: palette.muted,
    fontSize: isSm ? '0.82rem' : '0.95rem',
    fontWeight: 500,
    transition: 'color 0.2s ease',
  };

  const baseInputSx = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: palette.fill,
      ...(isClassic ? {} : { borderRadius: '12px' }),
      fontSize: isSm ? '0.92rem' : '1rem',
      color: palette.text,
      transition: 'all 0.2s ease',
      '& fieldset': {
        borderColor: palette.border,
        borderWidth: '1px',
      },
      '&:hover fieldset': {
        borderColor: palette.hoverBorder,
      },
      '&.Mui-focused fieldset': {
        borderColor: palette.accent,
        borderWidth: '1px',
      },
      ...(isClassic
        ? {}
        : {
            '&.Mui-focused': {
              boxShadow: `0 0 0 3px ${palette.focusRing}`,
            },
          }),
      '&.Mui-error fieldset': {
        borderColor: palette.danger,
      },
      ...(isClassic
        ? {}
        : {
            '&.Mui-error.Mui-focused': {
              boxShadow: `0 0 0 3px ${alpha(palette.danger, 0.18)}`,
            },
          }),
      '&.Mui-disabled': {
        backgroundColor: palette.disabledBg,
        color: palette.muted,
        '& fieldset': {
          borderColor: palette.border,
        },
      },
    },
    '& .MuiInputLabel-root': {
      color: palette.muted,
      fontSize: isSm ? '0.88rem' : '0.98rem',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: palette.accent,
    },
    '& .MuiInputLabel-root.Mui-disabled': {
      color: palette.subtle,
    },
    '& .MuiOutlinedInput-input': {
      ...(isClassic ? {} : { padding: isSm ? '10px 12px' : '14px 16px' }),
      '&::placeholder': {
        color: palette.subtle,
        opacity: 1,
        fontSize: fs,
      },
    },
    '& .MuiOutlinedInput-input.MuiInputBase-inputSizeSmall': {
      ...(isClassic ? {} : { padding: '10px 12px' }),
    },
    '& .MuiInputLabel-root.MuiInputLabel-shrink': {
      fontSize: isSm ? '0.80rem' : '0.90rem', // smaller when it floats up
    },
    '& textarea': {
      resize: props.multiline && resizable ? 'vertical' : 'none',
    },
    // Comprehensive autofill styling to prevent white background flash
    '& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus, & input:-webkit-autofill:active':
      {
        WebkitBoxShadow: `0 0 0 1000px ${palette.autofillBg || palette.fill || palette.bg} inset !important`,
        WebkitTextFillColor: `${palette.text} !important`,
        caretColor: `${palette.text} !important`,
        transition: 'background-color 5000s ease-in-out 0s',
        borderRadius: 'inherit',
      },
    '& textarea:-webkit-autofill, & textarea:-webkit-autofill:hover, & textarea:-webkit-autofill:focus, & textarea:-webkit-autofill:active':
      {
        WebkitBoxShadow: `0 0 0 1000px ${palette.autofillBg || palette.fill || palette.bg} inset !important`,
        WebkitTextFillColor: `${palette.text} !important`,
        caretColor: `${palette.text} !important`,
        transition: 'background-color 5000s ease-in-out 0s',
      },
    '& .MuiFormHelperText-root': {
      ...(isClassic ? {} : { marginLeft: 0 }),
      fontSize: isSm ? '0.78rem' : '0.85rem',
      color: error ? palette.danger : palette.muted,
    },
  };

  return (
    <Box sx={[baseContainerSx, containerSx]}>
      {label && labelPlacement === 'top' && (
        <Typography
          className="dashboard-input-label"
          component="label"
          htmlFor={inputId}
          sx={[baseLabelSx, labelSx]}
        >
          {label}
        </Typography>
      )}
      <TextField
        id={inputId}
        fullWidth={fullWidth}
        variant="outlined"
        error={error}
        helperText={helperText}
        label={useFloatingLabel ? label : undefined}
        sx={[baseInputSx, sx]}
        {...props}
      />
    </Box>
  );
};

export default DashboardInput;
