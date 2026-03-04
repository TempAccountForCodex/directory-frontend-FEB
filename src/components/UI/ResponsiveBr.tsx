import React from "react";
import { Box } from "@mui/material";

type ResponsiveBrProps = {
  hideFrom?: "sm" | "md" | "lg" | "xl";
};

export const ResponsiveBr: React.FC<ResponsiveBrProps> = ({
  hideFrom = "md",
}) => {
  return (
    <Box
      component="span"
      sx={{
        display: {
          xs: "none",
          [hideFrom]: "block",
        },
      }}
    />
  );
};
