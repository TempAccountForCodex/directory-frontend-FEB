import React from "react";
import { Box, Typography } from "@mui/material";
import SectionHeader from "../UI/SectionHeader";

const ContentCard = ({
  title,
  children,
  icon,
  isLast = false,
  accentColor = "#378C92",
}) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "64px 1fr",
        columnGap: 2,
        py: { xs: 4, md: 5 },
        pr: { xs: 4, md: 5 },
        borderBottom: isLast ? "none" : "1px solid #eee",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: 64,
          left: { xs: "-32px", md: "-32px" },
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1.5,
            border: `2px solid ${accentColor}`,
            backgroundColor: "white",
            display: "grid",
            placeItems: "center",
          }}
        >
          {icon &&
            React.cloneElement(icon, {
              sx: { fontSize: 28, color: accentColor },
            })}
        </Box>
      </Box>

      <Box>
        <SectionHeader
          text={title}
          subtext={children}
          variant="md"
          subVariant="sm"
          align="left"
          titleSx={{
            color: "black",
            letterSpacing: 0.5,
            fontWeight: "400",
            fontSize: "26px",
          }}
          subtextSx={{ color: "black", mt: 3 }}
        />
      </Box>
    </Box>
  );
};

export default ContentCard;
