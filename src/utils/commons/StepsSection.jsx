import React from 'react';
import { Box, Container, Grid, Typography, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import SectionHeader from '../../components/UI/SectionHeader';
import ButtonV1 from '../../components/UI/ButtonV1';

const StepsSection = ({
  title,
  subtitle,
  steps = [],
  showArrows = true,
  buttonText = 'Learn More',
  buttonLink = '/contact-us',
  background = '#fff',
  arrowImages = {
    left: '/assets/images/home/ArrowIdeasReverse.svg',
    right: '/assets/images/home/ArrowIdeas.svg',
  },
}) => {
  const theme = useTheme();

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        backgroundColor: background,
        textAlign: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Container maxWidth="lg">
        {/* === Header === */}
        <Box sx={{ pb: 10 }}>
          <SectionHeader
            text={title}
            subtext={subtitle}
            titleSx={{
              fontWeight: 800,
              color: theme.palette.text.primary,
            }}
            subtextSx={{
              color: theme.palette.text.primary,
              letterSpacing: 0.5,
            }}
          />
        </Box>

        {/* === Steps === */}
        <Grid container spacing={4} justifyContent="center">
          {steps.map((step, i) => (
            <Grid item xs={12} sm={6} md={3} key={i} sx={{ position: 'relative' }}>
              {/* Arrow between cards */}
              {i <= steps.length - 1 && (
                <Box
                  component="img"
                  src={
                    i % 2 === 0
                      ? '/assets/images/home/ArrowIdeasReverse.svg'
                      : '/assets/images/home/ArrowIdeas.svg'
                  }
                  alt="arrow"
                  sx={{
                    position: 'absolute',
                    top: i % 2 === 0 ? '12%' : 'auto',
                    bottom: {
                      xs: i % 2 !== 0 ? '36%' : 'auto',
                      lg: i % 2 !== 0 ? '30%' : 'auto',
                    },
                    left: { xs: '10%', lg: '20%' },
                    transform: 'translateY(-50%)',
                    width: { xs: '70px', md: '220px' },
                    display: { xs: 'none', md: 'block' },
                  }}
                />
              )}

              {/* Card Animation */}
              <motion.div
                whileInView={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
              >
                <Box>
                  {/* Circle + Icon */}
                  <Box
                    className="circleLayer"
                    sx={{
                      width: 160,
                      height: 160,
                      borderRadius: '50%',
                      mx: 'auto',
                      mb: 3,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      background: `
                        radial-gradient(circle at center,
                          ${theme.palette.text.primary} 40%, 
                          #FFFFFF 41%, 
                          #FFFFFF 55%, 
                          ${theme.palette.text.primary} 58%, 
                          ${theme.palette.text.main} 60%, 
                          ${theme.palette.text.main} 70%, 
                          #FFFFFF 71%, 
                          #FFFFFF 100%)
                      `,
                      boxShadow: `
                        0 10px 25px rgba(0,0,0,0.1),
                        0 0 30px rgba(255,255,255,0.3)
                      `,
                      overflow: 'hidden',
                      '&::after': {
                        content: '""',
                        position: 'absolute',
                        inset: 0,
                        borderRadius: '50%',
                        background: `
                          radial-gradient(circle at center,
                            ${theme.palette.text.main} 40%, 
                            #FFFFFF 41%, 
                            #FFFFFF 55%, 
                            ${theme.palette.text.main} 58%, 
                            ${theme.palette.text.primary} 60%, 
                            ${theme.palette.text.primary} 70%, 
                            #FFFFFF 71%, 
                            #FFFFFF 100%)
                        `,
                        opacity: 0,
                        transition: 'opacity 0.6s ease-in-out',
                      },
                      '&:hover::after': { opacity: 1 },
                      transition: 'transform 0.9s ease-in-out',
                      '&:hover': { transform: 'scale(1.07)' },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 50,
                        height: 50,
                      }}
                    >
                      {step.icon}
                    </Box>
                  </Box>

                  {/* Title & Description */}
                  <Typography
                    variant="h6"
                    color={theme.palette.text.primary}
                    fontWeight={600}
                    sx={{ mb: 1, pt: 5 }}
                  >
                    {step.title}
                  </Typography>
                  <Typography
                    variant="body1"
                    color={theme.palette.text.primary}
                    sx={{ maxWidth: 260, mx: 'auto' }}
                  >
                    {step.desc}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* === Button === */}
        {buttonText && (
          <Box sx={{ pt: 10 }}>
            <ButtonV1
              sx={{ color: theme.palette.primary.main }}
              to={buttonLink}
              bgColor={theme.palette.text.main}
              size="large"
            >
              {buttonText}
            </ButtonV1>
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default StepsSection;
