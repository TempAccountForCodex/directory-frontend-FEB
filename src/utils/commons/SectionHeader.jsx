import React from 'react';
import Box from '@mui/material/Box';
import { Typography, Container } from '@mui/material';
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
const SectionIntro = ({
  title,
  subtitle,
  description,
  subtitleColor,
  justify = false,
  width = false,
}) => {
  return (
    <Container sx={{ width: '100%' }}>
      <Box
        component="section"
        sx={{
          width: '100%',
          my: 3,
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
              fontSize: '16px',
              fontWeight: '600',
              lineHeight: '18px',
              fontFamily: 'Barlow',
              color: '#378C92',
              letterSpacing: '3px',
              textAlign: justify ? 'center' : { xs: 'center', md: 'left' },
            }}
          >
            {title}
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
              fontWeight: '700',
              lineHeight: { xs: '35px', md: '45px' },
              fontFamily: 'Barlow',
              color: subtitleColor ? subtitleColor : '#161c26',
              textAlign: justify ? 'center' : { xs: 'center', md: 'left' },
              letterSpacing: '-1px',
              my: 3,
            }}
          >
            {subtitle}
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
            variant="body2"
            sx={{
              fontSize: { xs: '13px', md: '16px' },
              fontWeight: '400',
              lineHeight: { xs: '17px', md: '22px' },
              fontFamily: 'sans-serif',
              color: '#797f89',
              textAlign: justify ? 'center' : { xs: 'center', md: 'left' },
              marginTop: '18px',
              m: 'auto',
              width: width ? { xs: '100%', sm: '90%', md: '70%' } : '100%',
            }}
          >
            {description}
          </Typography>
        </motion.div>
      </Box>
    </Container>
  );
};

export default SectionIntro;
