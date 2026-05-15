import React from "react";
import { Typography, useTheme, type TypographyProps } from "@mui/material";

interface TitleHeadingProps extends TypographyProps {
  text: string;
}

const TitleHeading: React.FC<TitleHeadingProps> = ({ text, ...rest }) => {
  const theme = useTheme();
  return (
    <Typography
      variant="h5"
      style={{
        fontSize: "25px",
        lineHeight: "42px",
        textAlign: "left",
        fontWeight: 600,
        fontFamily: "Poppins",
        marginTop: "10px",
        color: (theme.palette.primary as any).hero,
      }}
      sx={{
        position: "relative",
        "&:before": {
          content: '""',
          position: "absolute",
          bottom: "0",
          left: "0",
          width: "80px",
          height: "3px",
          backgroundColor: (theme.palette.primary as any).focus,
        },
      }}
      {...rest}
    >
      {text}
    </Typography>
  );
};

export default TitleHeading;
