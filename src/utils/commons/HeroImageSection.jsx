import { Grid, Stack, Typography, styled, keyframes, Button, Box } from '@mui/material';
import React, { useState, useEffect } from 'react';
// import backgroundImage from "/assets/images/about/About-Us.webp";
import { Link, useNavigate } from 'react-router-dom';
import { Slide } from '@mui/material';

const fadeInBottom = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledHeader = styled(Grid)(({ theme, fullscreen, contact }) => ({
  backgroundSize: contact ? 'contain' : 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundColor: contact ? '#378c92' : '#ffffff',
  position: 'relative',
  minHeight: fullscreen ? '80vh' : '64vh',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  animation: `${fadeInBottom} 3s ease`,
  '&::after': {
    content: '""',
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0))',
    zIndex: 1,
  },
  [theme.breakpoints.down('sm')]: {
    backgroundPosition: 'center',
    minHeight: fullscreen ? '100vh' : '55vh',
    animation: `${keyframes`
          0% {
            opacity: 0;
            transform: translateY(6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        `} 3s ease`,
  },
}));

const StyledHeaderItem = styled(Grid)(() => ({
  zIndex: 2,
  color: '#fff',
  textAlign: 'center',
}));

const TitleHeader = ({
  // imageSrc = backgroundImage,
  title = 'Latest Posts',
  fullscreen = undefined,
  call = false,
  subText,
  contact = undefined,
}) => {
  const navigate = useNavigate();

  const [slideIn, setSlideIn] = useState(false);
  useEffect(() => {
    setSlideIn(true);
  }, []);

  return (
    <StyledHeader
      item
      xs={12}
      sx={{
        // backgroundImage: `url(${imageSrc})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
      fullscreen={fullscreen}
      contact={contact}
    >
      <StyledHeaderItem
        item
        px={{ xs: fullscreen ? 2 : 4, sm: 8 }}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <Slide in={slideIn} direction="right" timeout={1800}>
          <Typography
            sx={{
              fontSize: {
                xs: fullscreen ? '30px' : '20px',
                sm: fullscreen ? '65px' : '36px',
              },
              fontWeight: 'bold',
              lineHeight: '3rem',
              mt: fullscreen ? 10 : 5,
              textTransform: 'uppercase',
              textShadow: '2px 2px 2px rgba(0, 0, 0, 0.2)',
            }}
          >
            {title}
          </Typography>
        </Slide>
        {subText && (
          <Box
            sx={{
              mt: {
                xs: '1rem',
                md: '2rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              },
            }}
          >
            <Typography
              sx={{
                color: '#ffffff',
                fontSize: { xs: '12px', md: '18px' },
                maxWidth: '80%',
                fontWeight: '400',
                textAlign: 'center',
              }}
            >
              {subText}
            </Typography>
          </Box>
        )}

        {!call && (
          <Stack direction="row" sx={{ justifyContent: 'center', mt: 1 }}>
            <Typography
              component={Link}
              to="/"
              sx={{
                fontSize: { xs: '12px', sm: '16px' },
                marginY: '6px',
                textDecoration: 'none',
                color: '#378C92',
              }}
            >
              Home
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '12px', sm: '16px' },
                marginY: '6px',
                ml: 0.6,
              }}
            >
              {` - ${title}`}
            </Typography>
          </Stack>
        )}
        {call && (
          <Button
            sx={{
              backgroundColor: 'transparent',
              color: 'white',
              border: '1px solid #ffffff',
              padding: { xs: '0.7rem', md: '0.9rem' },
              mt: '2rem',
              mb: fullscreen ? 8 : 5,
              borderRadius: '7px',
            }}
            onClick={() => navigate('/contact-us')}
          >
            Request a Call
          </Button>
        )}
      </StyledHeaderItem>
    </StyledHeader>
  );
};

export default TitleHeader;
