import { Grid, Stack, Typography, styled, keyframes, Button, Box, Slide } from '@mui/material';
import React, { useState, useEffect } from 'react';
// import backgroundImage from "/assets/images/about/About-Us.webp";
import { Link, useNavigate } from 'react-router-dom';

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const StyledHeader = styled(Grid)(({ theme, fullscreen }) => ({
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundColor: 'black',
  position: 'relative',
  minHeight: fullscreen ? '80vh' : '64vh',
  display: 'flex',
  justifyContent: 'flex-start',
  alignItems: 'center',
  animation: `${fadeInUp} 2s ease`,
  paddingLeft: '5%',
  [theme.breakpoints.down('sm')]: {
    minHeight: fullscreen ? '100vh' : '60vh',
    paddingLeft: '3%',
  },
}));

const StyledHeaderItem = styled(Grid)(() => ({
  zIndex: 2,
  color: '#fff',
  textAlign: 'left',
  maxWidth: '700px',
}));

const TitleHeader = ({
  // imageSrc = backgroundImage,
  title = 'Latest Posts',
  fullscreen = undefined,
  subText,
  contact = undefined,
  extraContent = 'We provide high-quality insights and articles to keep you updated with the latest trends in technology, business, and innovation. Stay informed and inspired with our curated posts.',
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

        backgroundPosition: 'calc(100% + 180px) 30px',
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
      }}
      fullscreen={fullscreen}
      contact={contact}
    >
      <StyledHeaderItem item px={{ xs: 2, sm: 4 }}>
        <Slide in={slideIn} direction="right" timeout={1500}>
          <Typography
            sx={{
              fontSize: {
                xs: fullscreen ? '28px' : '22px',
                sm: fullscreen ? '60px' : '48px',
              },
              fontWeight: 'bold',
              lineHeight: '3.6rem',
              mt: fullscreen ? 6 : 3,
              textShadow: '2px 2px 6px rgba(0, 0, 0, 0.5)',
              fontFamily: 'Montserrat',
            }}
          >
            {title}
          </Typography>
        </Slide>

        {/* SubText */}
        {subText && (
          <Typography
            sx={{
              mt: 2,
              color: '#f1f1f1',
              fontSize: { xs: '14px', md: '18px' },
              maxWidth: '85%',
              fontWeight: '400',
              animation: `${fadeInUp} 2.2s ease`,
            }}
          >
            {subText}
          </Typography>
        )}

        {/* Extra Content */}
        <Typography
          sx={{
            mt: 2,
            color: '#e0e0e0',
            fontSize: { xs: '13px', md: '16px' },
            maxWidth: '90%',
            lineHeight: '1.6rem',
            animation: `${fadeInUp} 2.5s ease`,
          }}
        >
          {extraContent}
        </Typography>
      </StyledHeaderItem>
    </StyledHeader>
  );
};

export default TitleHeader;
