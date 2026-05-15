import React from "react";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ScrollButton({
  label = "Click Here",
  to = "/contact",
  accentColor = "#378C92", // underline + arrow color
  textColor = "black",
  size = "medium",
}) {
  const navigate = useNavigate();

  const handleScrollOrNavigate = (e, target) => {
    e.preventDefault();

    // ✅ Check if target includes route (like /contact-us#contact-section)
    const [path, hash] = target.split("#");

    if (path && path !== window.location.pathname) {
      // Navigate to the target page first
      navigate(path);

      // Wait a moment for the new page to mount, then scroll
      setTimeout(() => {
        const element = document.querySelector(`#${hash}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 500); // small delay to allow page transition
    } else {
      // Same-page scroll
      const element = document.querySelector(
        `#${hash || target.replace("#", "")}`,
      );
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const sizeStyles = {
    small: { fontSize: "14px", gap: "0.3rem", arrowSize: "18px" },
    medium: { fontSize: "18px", gap: "0.4rem", arrowSize: "25px" },
    large: { fontSize: "24px", gap: "0.5rem", arrowSize: "32px" },
  };

  const { fontSize, gap, arrowSize } = sizeStyles[size] || sizeStyles.medium;

  return (
    <Button
      onClick={(e) => handleScrollOrNavigate(e, to)}
      sx={{
        fontSize,
        fontWeight: 400,
        color: textColor,
        textTransform: "none",
        background: "transparent",
        border: "none",
        display: "inline-flex",
        alignItems: "center",
        gap,
        whiteSpace: "nowrap",
        cursor: "pointer",
        "&:hover": { background: "transparent" },
        "& .text": {
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "20%",
            height: "2px",
            backgroundColor: accentColor,
            transition: "width 0.4s ease-in-out",
          },
        },
        "& .arrow": {
          display: "inline-block",
          transform: "translateX(0)",
          fontSize: arrowSize,
          color: accentColor,
          transition: "transform 0.4s ease-in-out",
        },
        "&:hover .text::after": { width: "100%" },
        "&:hover .arrow": { transform: "translateX(6px)" },
      }}
    >
      <span className="text">{label}</span>
      <span className="arrow">→</span>
    </Button>
  );
}
