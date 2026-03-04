import React from "react";
import { Typography, useTheme } from "@mui/material";

interface FooterHeadingProps {
  Text: string;
  linebg?: string;
}

const FooterHeading: React.FC<FooterHeadingProps> = ({ Text, linebg }) => {
  const theme = useTheme();

  return (
    <Typography
      variant="body2"
      sx={{
        position: "relative",
        fontSize: "20px",
        fontWeight: 700,
        color: theme.palette.primary.main,
        pb: "20px",
        fontFamily: "Poppins, sans-serif",
        "&::after": {
          content: '""',
          height: "4px",
          width: "30px",
          backgroundColor: linebg || theme.palette.primary.main,
          borderRadius: "30px",
          position: "absolute",
          bottom: 0,
          left: 0,
        },
      }}
    >
      {Text}
    </Typography>
  );
};

export default FooterHeading;
