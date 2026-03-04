import React from 'react';
import PropTypes from 'prop-types';
import { Box, useTheme } from '@mui/material';

const SlantedSection = ({
  bg = '#f7f5f3', // solid color or gradient string
  height = 125, // number or css string
  clipPath = 'polygon(0 26%, 0 0, 100% 0, 100% 0%, 26% 100%, 0 0%)',
  mt = '-1px',
  sx,
}) => {
  const theme = useTheme();
  const resolvedBg = typeof bg === 'function' ? bg(theme) : bg;

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <Box
        sx={{
          clipPath,
          background: resolvedBg, // supports gradients too
          height,
          marginTop: mt,
        }}
      />
    </Box>
  );
};

export default SlantedSection;
