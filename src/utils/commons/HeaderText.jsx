import React from 'react';
import { Grid, Typography } from '@mui/material';
import { motion } from 'framer-motion';

const cardVariantsBottom = {
  offscreen: {
    y: 50,
    opacity: 0,
  },

  onscreen: (index) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 50,
      stiffness: 100,
      delay: index * 0.3,
    },
  }),
};
const HeaderText = () => {
  return (
    <Grid
      container
      sx={{
        display: 'block',
        textAlign: 'center',
        width: '100%',
        justifyContent: 'center',
        py: 7,
        px: { md: 44, sm: 20, xs: 5 },
      }}
    >
      <motion.div
        className="card-container"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={cardVariantsBottom}
        transition={{ type: 'spring', stiffness: 100 }}
        custom={1}
      >
        <Typography
          sx={{
            color: '#378C92',
            fontSize: '14px',
            fontWeight: '600',
            letterSpacing: '3px',
            textAlign: 'center',
            fontFamily: 'Barlow',
          }}
        >
          GET TO KNOW ABOUT US
        </Typography>
      </motion.div>
      <motion.div
        className="card-container"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={cardVariantsBottom}
        transition={{ type: 'spring', stiffness: 100 }}
        custom={2}
      >
        <Typography
          sx={{
            fontSize: { xs: '30px', md: '42px' },
            fontWeight: '800',
            lineHeight: '1',
            color: '#161c26',
            my: 3,
            textAlign: 'center',
            fontFamily: 'Barlow',
          }}
        >
          Techietribe's Journey
        </Typography>
      </motion.div>
      <motion.div
        className="card-container"
        initial="offscreen"
        whileInView="onscreen"
        viewport={{ once: true, amount: 0.1 }}
        variants={cardVariantsBottom}
        transition={{ type: 'spring', stiffness: 100 }}
        custom={3}
      >
        <Typography
          sx={{
            fontSize: { xs: '13px', md: '16px' },
            fontWeight: '500',
            color: 'grey',
            textAlign: 'center',
            lineHeight: { xs: '17px', md: '22px' },
          }}
        >
          Techietribe sparks a revolution in technology by streamlining the integration of
          cutting-edge solutions into everyday business practices. Navigating the digital landscape
          can be daunting, but our platform serves as a beacon, guiding companies through the
          complexities of modern tech with ease and efficiency.
        </Typography>
      </motion.div>
    </Grid>
  );
};

export default HeaderText;
