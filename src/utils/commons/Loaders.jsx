import React from 'react';
import './Loaders.css';

const PageLoader = () => {
  return (
    <div className="load">
      <div className="loader">
        <img src="/assets/images/techietribe_logo.webp" alt="LogoImg" width="60px" height="60px" />
      </div>
    </div>
  );
};

export const SectionLoader = ({ bg = '#ffffff', minHeight = '600px' }) => {
  const backgroundColor = bg === 'grey' ? '#F0F3F6' : bg;

  return (
    <div className="sectionload" style={{ backgroundColor, minHeight }}>
      <div className="sectionloader">
        <img src="/assets/images/techietribe_logo.webp" alt="LogoImg" width="60px" height="60px" />
      </div>
    </div>
  );
};

export default PageLoader;
