import React from 'react';
import { Box, Typography, styled, Container } from '@mui/material';
import { Link } from 'react-router-dom';
import backgroundImage from '/assets/images/careers/form-bg-first.jpg'; // Use a specific image for the blog post

const HeroSectionWrapper = styled(Box)(({ theme }) => ({
  backgroundImage: `url(${backgroundImage})`,
  padding: theme.spacing(8, 0, 0),
  marginTop: '-12px',
  textAlign: 'center',
  alignItems: 'center',
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3, 0, 0),
  },
}));

const HeroContentBox = styled(Box)(({ theme }) => ({
  color: 'white',
  padding: theme.spacing(15, 2, 15),
  [theme.breakpoints.down('xs')]: {
    padding: theme.spacing(25, 2, 25),
  },
  [theme.breakpoints.up('xl')]: {
    padding: theme.spacing(25, 20, 25),
  },
}));

const BlogImageWrapper = styled(Box)(({ theme }) => ({
  width: '100%',
  height: { xs: '250px', md: '550px' },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  borderRadius: theme.spacing(1), // Subtle border-radius for the image
  marginBottom: theme.spacing(4),
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover', // This ensures the image covers the container without distortion
  },
}));

const InsightHeroSection = ({ title, author, publishDate, blogImage, category }) => {
  return (
    <Box>
      {/* Header component can be placed here, or it can be a global component */}
      {/* For this example, let's assume the header is a separate component */}

      <HeroSectionWrapper>
        <Container maxWidth="xl">
          <HeroContentBox>
            <Typography
              variant="body2"
              sx={{
                fontWeight: 400,
                color: 'rgba(255, 255, 255, 0.8)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              {`${category} - ${publishDate}`}
            </Typography>
            <Typography
              variant="h2"
              component="h1"
              sx={{
                fontSize: { xs: '1.5rem', md: '4rem' },
                display: 'inline',
                fontWeight: 800,
                lineHeight: 1.2,
                mb: 4,
                position: 'relative',
                top: '15px',
                maxWidth: '800px',
              }}
            >
              {title}
            </Typography>
          </HeroContentBox>
          {/* <BlogImageWrapper>
            <img src={`${blogImage}`} alt={title} />
          </BlogImageWrapper> */}
        </Container>
      </HeroSectionWrapper>
    </Box>
  );
};

export default InsightHeroSection;
