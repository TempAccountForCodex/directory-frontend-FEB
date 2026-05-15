import React from "react";
import { Button, type ButtonProps } from "@mui/material";

interface ButtonPrimaryProps extends ButtonProps {
  children: React.ReactNode;
}

const ButtonPrimary: React.FC<ButtonPrimaryProps> = ({
  children,
  sx,
  ...otherProps
}) => {
  return (
    <Button
      fullWidth
      sx={{
        borderRadius: (theme) => theme.shape.borderRadius,
        fontWeight: 600,
        textTransform: "none",
        ...sx,
      }}
      {...otherProps}
    >
      {children}
    </Button>
  );
};

export default ButtonPrimary;
