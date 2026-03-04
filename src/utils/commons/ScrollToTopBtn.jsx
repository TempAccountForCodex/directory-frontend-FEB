import React, { useState, useEffect } from 'react';
import { Box, Button, Slide } from '@mui/material';
import NorthIcon from '@mui/icons-material/North';

const styles = {
  scrollToTopBtnContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollToTopBtn: {
    borderRadius: '50%',
    padding: '10px',
    cursor: 'pointer',
    position: 'fixed',
    bottom: { xs: '70px', md: '50px' },
    right: { xs: '20px', md: '50px' },
    zIndex: 999,
    minWidth: 'unset',
    minHeight: 'unset',
    width: '56px',
    height: '56px',
  },
  icon: {
    fontSize: '22px',
    color: '#378C92',
    position: 'absolute',
  },
  progressCircle: {
    transform: 'rotate(-90deg)',
    transformOrigin: 'center',
  },
};

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrolled = window.pageYOffset;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolledPercentage = (scrolled / height) * 100;

      setProgress(scrolledPercentage);

      if (scrolled > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <>
      {isVisible && (
        <Box sx={styles.scrollToTopBtnContainer}>
          <Slide direction="left" in>
            <Button onClick={scrollToTop} sx={styles.scrollToTopBtn}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="transparent"
                  stroke="#d3d3d3"
                  strokeWidth="2"
                />
                <circle
                  cx="20"
                  cy="20"
                  r={radius}
                  fill="transparent"
                  stroke="#378C92"
                  strokeWidth="2"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  style={styles.progressCircle}
                />
              </svg>
              <NorthIcon sx={styles.icon} />
            </Button>
          </Slide>
        </Box>
      )}
    </>
  );
};

export default ScrollToTopButton;
