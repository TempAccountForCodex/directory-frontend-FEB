import React from "react";
import { Button } from "@mui/material";
import type { ButtonProps } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useNavigate } from "react-router-dom"; // <--- IMPORT useNavigate

interface ButtonV3Props {
  children: React.ReactNode;
  href?: string;
  to?: string;
  size?: "sm" | "md" | "lg" | "xl";
  accentColor?: string;
  sx?: any;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  [key: string]: any;
}

const ButtonV3: React.FC<ButtonV3Props> = ({
  children,
  href,
  to,
  size = "md",
  accentColor = "#00BFFF",
  sx,
  onClick,
  ...props
}) => {
  const navigate = useNavigate(); // <--- USE THE HOOK

  // Define styles based on the size prop (Same as before)
  const sizeStyles = {
    sm: { fontSize: 12, px: 1.5, py: 0.5 },
    md: { fontSize: 13, px: 2, py: 0.7 },
    lg: { fontSize: 14, px: 2.5, py: 0.9 },
    xl: { fontSize: 16, px: 3, py: 1.2 },
  };

  const currentSizeStyles = sizeStyles[size] || sizeStyles.md;

  // Determine the final click handler
  const handleClick = (event) => {
    // 1. Execute any passed-in onClick handler first
    if (onClick) {
      onClick(event);
    }
    // 2. If a 'to' prop is provided, use React Router's navigate
    if (to && !href) {
      // Ensure 'to' is used only if 'href' is not present
      navigate(to);
    }
  };

  return (
    <Button
      // Use standard onClick handler
      onClick={handleClick}
      // We pass 'href' down for standard anchor links if needed, otherwise it's just a button.
      href={href}
      variant="outlined"
      sx={{
        // ... (Styles remain the same)
        borderRadius: 999,
        fontWeight: 600,
        textTransform: "none",
        color: "#fff",
        borderColor: accentColor,
        transition: "all 0.3s ease-in-out",

        ...currentSizeStyles,

        "&:hover": {
          background: alpha(accentColor, 0.12),
          borderColor: accentColor,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default ButtonV3;
