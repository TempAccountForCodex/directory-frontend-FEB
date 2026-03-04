// src/components/RotatingButton.jsx

import React, { useState, useEffect } from "react";
import { Box, keyframes, SvgIcon } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import { useNavigate, useLocation } from "react-router-dom"; // Import useLocation

// Keyframe animation for the rotating text
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const sizeVariants = {
  sm: {
    wrapper: { width: "100px", height: "100px" },
    inner: { width: "40px", height: "40px" },
    icon: { fontSize: "1.5rem" },
    text: { fontSize: "15px", letterSpacing: "2.5px" },
    path: { radius: 45 },
  },
  md: {
    wrapper: { width: "120px", height: "120px" },
    inner: { width: "50px", height: "50px" },
    icon: { fontSize: "1.8rem" },
    text: { fontSize: "19px", letterSpacing: "3px" },
    path: { radius: 70 },
  },
  lg: {
    wrapper: { width: "160px", height: "160px" },
    inner: { width: "70px", height: "70px" },
    icon: { fontSize: "2.5rem" },
    text: { fontSize: "22px", letterSpacing: "3.5px" },
    path: { radius: 90 },
  },
};

const RotatingButton = ({
  text = "CONTACT US NOW. LET'S CONNECT.",
  size = "md",
  textColor = "black",
  sx,
  pathId = "text-path-1",
  linkTo,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const currentSize = sizeVariants[size] || sizeVariants.md;
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (linkTo) {
      navigate(linkTo);
    } else {
      const contactSection = document.getElementById("contact-section");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  useEffect(() => {
    // This effect runs on page load and location change
    if (location.hash) {
      const targetElement = document.getElementById(location.hash.substring(1));
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [location]);

  return (
    <Box
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      sx={{
        ...currentSize.wrapper,
        position: "relative",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...sx,
      }}
    >
      {/* Rotating Text */}
      <Box
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          animation: `${rotate} 20s linear infinite`,
          pointerEvents: "none",
          fontFamily: "Helvetica, sans-serif",
          overflow: "visible",
        }}
      >
        <svg
          viewBox="0 0 150 150"
          style={{
            width: "100%",
            height: "100%",
            overflow: "visible",
          }}
        >
          <path
            id={pathId}
            d={`M 75,75 m -${currentSize.path.radius},0 a ${
              currentSize.path.radius
            },${currentSize.path.radius} 0 1,1 ${
              currentSize.path.radius * 2
            },0 a ${currentSize.path.radius},${
              currentSize.path.radius
            } 0 1,1 -${currentSize.path.radius * 2},0`}
            fill="transparent"
          />
          <text
            style={{
              ...currentSize.text,
              textTransform: "uppercase",
              fontWeight: "500",
            }}
            fill={textColor}
          >
            <textPath href={`#${pathId}`}>{text}</textPath>
          </text>
        </svg>
      </Box>

      {/* Center Circle with Arrow */}
      <Box
        sx={{
          ...currentSize.inner,
          borderRadius: "50%",
          backgroundColor: "#378C92",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "transform 0.3s ease-in-out",
          transform: isHovered ? "rotate(180deg)" : "rotate(45deg)",
          zIndex: 1,
        }}
      >
        <ArrowUpwardIcon
          sx={{
            ...currentSize.icon,
            color: "white",
          }}
        />
      </Box>
    </Box>
  );
};

export default RotatingButton;
