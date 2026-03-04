import React, { useState } from "react";
import { Button, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import type { SxProps, Theme } from "@mui/material";

type PrimaryActionButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  to?: string;
  size?: "small" | "medium" | "large";
  fullWidth?: boolean;
  disabled?: boolean;
  colorScheme?: "white" | "black";
  sx?: SxProps<Theme>;
};

export const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  children,
  onClick,
  to,
  size = "large",
  fullWidth = false,
  disabled = false,
  colorScheme = "white",
  sx,
}) => {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(false);

  const sizeStyles = {
    small: { px: 3.5, py: 1.1, fontSize: "0.85rem" },
    medium: { px: 5, py: 1.5, fontSize: "0.95rem" },
    large: { px: 7, py: 2, fontSize: "1rem" },
  };
  const isWhite = colorScheme === "white";

  const handleClick = () => {
    if (disabled) return;
    if (to) {
      navigate(to);
      return;
    }
    onClick?.();
  };

  return (
    <Button
      fullWidth={fullWidth}
      disabled={disabled}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        ...sizeStyles[size],
        borderRadius: 10,
        fontWeight: 600,
        textTransform: "none",
        position: "relative",
        overflow: "hidden",

        // 🎨 COLOR SCHEME
        backgroundColor: isWhite ? "#fff" : "#000",
        color: isWhite ? "#000" : "#fff",

        boxShadow: hovered
          ? "0 8px 24px rgba(0,0,0,0.25)"
          : "0 4px 14px rgba(0,0,0,0.18)",

        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        transition: "all 0.25s ease",

        "&:hover": {
          backgroundColor: isWhite ? "#fff" : "#000",
        },

        "&.Mui-disabled": {
          opacity: 0.55,
          transform: "none",
          boxShadow: "none",
          backgroundColor: isWhite ? "#fff" : "#000",
          color: isWhite ? "#666" : "#aaa",
        },
        ...sx,
      }}
    >
      <Box
        component="span"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        {children}
      </Box>
    </Button>
  );
};
